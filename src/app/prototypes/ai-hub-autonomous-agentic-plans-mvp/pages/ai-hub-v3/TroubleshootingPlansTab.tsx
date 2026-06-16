import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Content,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  InputGroup,
  InputGroupItem,
  Label,
  LabelGroup,
  MenuToggle,
  MenuToggleElement,
  Pagination,
  Select,
  SelectList,
  SelectOption,
  Stack,
  StackItem,
  TextInput,
  Tooltip,
} from '@patternfly/react-core';
import { CheckIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { AI_EXPERIENCE_ICON_DATA_URL } from '../../components/autonomousAiObserve/aiExperienceIconUrl';
import {
  getAgenticAutomationDisabledMessage,
  resolveAgentCapabilitiesClusterId,
  useAgenticCapabilities,
} from '../../context/AgenticCapabilitiesContext';
import { usePlanTermination } from '../../context/PlanTerminationContext';
import { useActivePerspective, type AppShellPerspectiveKey } from '@app/shared/contexts/ActivePerspectiveContext';
import type { ConfidenceTier } from '../../types/confidenceTier';
import { scoreToRiskTier, type RiskTier } from '../../types/riskScore';
import {
  perspectiveKeyFromShellName,
  writePlanRemediationDrillSession,
} from '../planRemediationDrillSession';
import {
  PlanConfidenceBadge,
  PlanRiskBadge,
  StatusLabel,
  TriggerDomainCell,
  buildPlansForPerspective,
  getPlanRemediationPath,
  type PlanRow,
} from './PlansAndApprovalsTab';

const AI_TOOLTIP =
  'This metric is synthesized by the autonomous AI SRE agent based on live cluster states and historical patterns.';

const AiSparkle: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <Tooltip content={AI_TOOLTIP} position="top">
    <span
      tabIndex={0}
      role="img"
      aria-label="AI-synthesized metric"
      style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle', cursor: 'help', flexShrink: 0 }}
    >
      <img src={AI_EXPERIENCE_ICON_DATA_URL} alt="" aria-hidden="true" width={size} height={size} style={{ display: 'block' }} />
    </span>
  </Tooltip>
);

const FILTER_SECTION_TITLE_STYLE: React.CSSProperties = {
  padding: 'var(--pf-t--global--spacer--sm) var(--pf-t--global--spacer--md) var(--pf-t--global--spacer--xs)',
  fontSize: 'var(--pf-t--global--font--size--body--sm)',
  fontWeight: 600,
  color: 'var(--pf-t--global--text--color--subtle)',
};

const STATUS_FILTER_OPTIONS: { label: string; value: PlanRow['status'] }[] = [
  { label: 'Completed', value: 'Completed' },
  { label: 'Awaiting Approval', value: 'Waiting Approval' },
  { label: 'Plan aborted', value: 'Plan aborted' },
];

const RISK_LEVEL_OPTIONS: RiskTier[] = ['High', 'Medium', 'Low'];

const CONFIDENCE_OPTIONS: ConfidenceTier[] = ['High', 'Medium', 'Low'];

const TRIGGER_DOMAIN_OPTIONS = [
  'Observability',
  'Control Plane',
  'Storage',
  'Network',
  'Compute',
  'GitOps',
  'Pipelines',
  'Registry',
  'Security',
] as const;

type SearchCategory = 'name' | 'label';

const TABLE_HEADER_TH_STYLE: React.CSSProperties = {
  verticalAlign: 'top',
};

const DEFAULT_PER_PAGE = 10;

function planMatchesTextSearch(plan: PlanRow, query: string, category: SearchCategory): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  if (category === 'name') {
    return (plan.name ?? plan.id).toLowerCase().includes(q);
  }
  return plan.triggerDomain.toLowerCase().includes(q);
}

function planMatchesAttributeFilters(
  plan: PlanRow,
  statusFilters: PlanRow['status'][],
  riskFilters: RiskTier[],
  confidenceFilters: ConfidenceTier[],
  triggerDomainFilters: string[],
): boolean {
  if (statusFilters.length > 0 && !statusFilters.includes(plan.status)) {
    return false;
  }
  if (riskFilters.length > 0 && !riskFilters.includes(scoreToRiskTier(plan.riskScore ?? 50))) {
    return false;
  }
  if (confidenceFilters.length > 0) {
    if (!plan.confidenceTier || !confidenceFilters.includes(plan.confidenceTier)) {
      return false;
    }
  }
  if (triggerDomainFilters.length > 0 && !triggerDomainFilters.includes(plan.triggerDomain)) {
    return false;
  }
  return true;
}

export const TroubleshootingPlansTab: React.FC = () => {
  const navigate = useNavigate();
  const { activePerspective } = useActivePerspective();
  const isSingleCluster = activePerspective === 'Core platforms';
  const agentClusterId = resolveAgentCapabilitiesClusterId(isSingleCluster);
  const { isAgentActiveForCluster } = useAgenticCapabilities();
  const { abortedPlans, resumedPlanIds } = usePlanTermination();
  const isAgenticAutomationEnabled = isAgentActiveForCluster(agentClusterId);

  const [statusFilters, setStatusFilters] = useState<PlanRow['status'][]>([]);
  const [riskFilters, setRiskFilters] = useState<RiskTier[]>([]);
  const [confidenceFilters, setConfidenceFilters] = useState<ConfidenceTier[]>([]);
  const [triggerDomainFilters, setTriggerDomainFilters] = useState<string[]>([]);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  const [searchCategory, setSearchCategory] = useState<SearchCategory>('name');
  const [searchCategoryOpen, setSearchCategoryOpen] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState('');

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);

  const planExecutionRuntime = useMemo(
    () => ({ abortedPlans, resumedPlanIds }),
    [abortedPlans, resumedPlanIds],
  );

  const observabilityPlans = useMemo(() => {
    return buildPlansForPerspective(isSingleCluster, planExecutionRuntime).filter(
      (plan) =>
        plan.triggerDomain === 'Observability'
        && plan.consolidationScope.startsWith('Triggered by alert:'),
    );
  }, [isSingleCluster, planExecutionRuntime]);

  const filteredRows = useMemo(() => {
    return observabilityPlans.filter((plan) => {
      if (!planMatchesAttributeFilters(plan, statusFilters, riskFilters, confidenceFilters, triggerDomainFilters)) {
        return false;
      }
      return planMatchesTextSearch(plan, searchInputValue, searchCategory);
    });
  }, [
    confidenceFilters,
    observabilityPlans,
    riskFilters,
    searchCategory,
    searchInputValue,
    statusFilters,
    triggerDomainFilters,
  ]);

  useEffect(() => {
    setPage(1);
  }, [
    filteredRows.length,
    searchInputValue,
    searchCategory,
    statusFilters,
    riskFilters,
    confidenceFilters,
    triggerDomainFilters,
  ]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredRows.length / perPage));
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [filteredRows.length, page, perPage]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredRows.slice(start, start + perPage);
  }, [filteredRows, page, perPage]);

  const toggleFilterValue = useCallback(<T extends string>(value: T, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    setter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  }, []);

  const handleFilterSelect = useCallback(
    (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
      if (typeof value !== 'string') {
        return;
      }
      if (STATUS_FILTER_OPTIONS.some((opt) => opt.value === value)) {
        toggleFilterValue(value as PlanRow['status'], setStatusFilters);
        return;
      }
      if (RISK_LEVEL_OPTIONS.includes(value as RiskTier)) {
        toggleFilterValue(value as RiskTier, setRiskFilters);
        return;
      }
      if (CONFIDENCE_OPTIONS.includes(value as ConfidenceTier)) {
        toggleFilterValue(value as ConfidenceTier, setConfidenceFilters);
        return;
      }
      if (TRIGGER_DOMAIN_OPTIONS.includes(value as (typeof TRIGGER_DOMAIN_OPTIONS)[number])) {
        toggleFilterValue(value, setTriggerDomainFilters);
      }
    },
    [toggleFilterValue],
  );

  const activeFilterCount =
    statusFilters.length + riskFilters.length + confidenceFilters.length + triggerDomainFilters.length;
  const hasActiveAttributeFilters = activeFilterCount > 0;
  const hasActiveTextSearch = searchInputValue.trim().length > 0;
  const hasActiveFilters = hasActiveAttributeFilters || hasActiveTextSearch;

  const clearAllFilters = useCallback(() => {
    setStatusFilters([]);
    setRiskFilters([]);
    setConfidenceFilters([]);
    setTriggerDomainFilters([]);
    setSearchInputValue('');
  }, []);

  const openPlanRemediation = useCallback(
    (plan: PlanRow) => {
      if (!isAgenticAutomationEnabled) {
        return;
      }
      const perspectiveKey: AppShellPerspectiveKey =
        perspectiveKeyFromShellName(activePerspective)
        ?? (isSingleCluster ? 'core-platforms' : 'fleet-management');
      writePlanRemediationDrillSession({ perspectiveKey });
      navigate(getPlanRemediationPath(plan, perspectiveKey));
    },
    [activePerspective, isAgenticAutomationEnabled, isSingleCluster, navigate],
  );

  const statusFilterLabel = (value: PlanRow['status']) =>
    STATUS_FILTER_OPTIONS.find((opt) => opt.value === value)?.label ?? value;

  return (
    <Stack hasGutter>
      {!isAgenticAutomationEnabled && (
        <StackItem>
          <Alert variant="warning" isInline title={getAgenticAutomationDisabledMessage(isSingleCluster)} />
        </StackItem>
      )}

      <StackItem className="ols-ai-hub-plans-section">
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          flexWrap={{ default: 'nowrap' }}
          className="ols-ai-hub-plans-toolbar"
        >
          <FlexItem style={{ minWidth: 0 }}>
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} flexWrap={{ default: 'nowrap' }}>
              <FlexItem>
                <Select
                  aria-label="Filter troubleshooting plans"
                  role="menu"
                  isOpen={filterMenuOpen}
                  onSelect={handleFilterSelect}
                  onOpenChange={setFilterMenuOpen}
                  toggle={(ref: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={ref}
                      onClick={() => setFilterMenuOpen((open) => !open)}
                      isExpanded={filterMenuOpen}
                      badge={activeFilterCount > 0 ? activeFilterCount : undefined}
                    >
                      Filter
                    </MenuToggle>
                  )}
                >
                  <SelectList>
                    <div style={FILTER_SECTION_TITLE_STYLE}>Status</div>
                    {STATUS_FILTER_OPTIONS.map((opt) => (
                      <SelectOption
                        key={opt.value}
                        hasCheckbox
                        value={opt.value}
                        isSelected={statusFilters.includes(opt.value)}
                      >
                        {opt.label}
                      </SelectOption>
                    ))}

                    <div style={FILTER_SECTION_TITLE_STYLE}>Risk Level</div>
                    {RISK_LEVEL_OPTIONS.map((tier) => (
                      <SelectOption
                        key={tier}
                        hasCheckbox
                        value={tier}
                        isSelected={riskFilters.includes(tier)}
                      >
                        {tier}
                      </SelectOption>
                    ))}

                    <div style={FILTER_SECTION_TITLE_STYLE}>Confidence</div>
                    {CONFIDENCE_OPTIONS.map((tier) => (
                      <SelectOption
                        key={tier}
                        hasCheckbox
                        value={tier}
                        isSelected={confidenceFilters.includes(tier)}
                      >
                        {tier}
                      </SelectOption>
                    ))}

                    <div style={FILTER_SECTION_TITLE_STYLE}>Trigger Domain</div>
                    {TRIGGER_DOMAIN_OPTIONS.map((domain) => (
                      <SelectOption
                        key={domain}
                        hasCheckbox
                        value={domain}
                        isSelected={triggerDomainFilters.includes(domain)}
                      >
                        {domain}
                      </SelectOption>
                    ))}
                  </SelectList>
                </Select>
              </FlexItem>

              <FlexItem style={{ minWidth: 0 }}>
                <InputGroup>
                  <InputGroupItem>
                    <Dropdown
                      isOpen={searchCategoryOpen}
                      onOpenChange={setSearchCategoryOpen}
                      toggle={(ref: React.Ref<MenuToggleElement>) => (
                        <MenuToggle
                          ref={ref}
                          onClick={() => setSearchCategoryOpen((open) => !open)}
                          isExpanded={searchCategoryOpen}
                          style={{ minWidth: 0 }}
                        >
                          {searchCategory === 'name' ? 'Name' : 'Label'}
                        </MenuToggle>
                      )}
                    >
                      <DropdownList>
                        <DropdownItem
                          key="name"
                          onClick={() => {
                            setSearchCategory('name');
                            setSearchInputValue('');
                            setSearchCategoryOpen(false);
                          }}
                        >
                          <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
                            Name
                            {searchCategory === 'name' && (
                              <CheckIcon style={{ color: 'var(--pf-t--global--color--brand--default)' }} />
                            )}
                          </span>
                        </DropdownItem>
                        <DropdownItem
                          key="label"
                          onClick={() => {
                            setSearchCategory('label');
                            setSearchInputValue('');
                            setSearchCategoryOpen(false);
                          }}
                        >
                          <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
                            Label
                            {searchCategory === 'label' && (
                              <CheckIcon style={{ color: 'var(--pf-t--global--color--brand--default)' }} />
                            )}
                          </span>
                        </DropdownItem>
                      </DropdownList>
                    </Dropdown>
                  </InputGroupItem>

                  <InputGroupItem isFill>
                    <TextInput
                      aria-label={searchCategory === 'name' ? 'Search plans by name' : 'Search plans by label'}
                      placeholder={searchCategory === 'name' ? 'Search by name...' : 'Search by label...'}
                      value={searchInputValue}
                      onChange={(_evt, value) => setSearchInputValue(value)}
                      style={{ minWidth: 220 }}
                    />
                  </InputGroupItem>
                </InputGroup>
              </FlexItem>
            </Flex>
          </FlexItem>

          <FlexItem>
            <Pagination
              itemCount={filteredRows.length}
              page={page}
              perPage={perPage}
              onSetPage={(_evt, newPage) => setPage(newPage)}
              onPerPageSelect={(_evt, newPerPage, newPage) => {
                setPerPage(newPerPage);
                setPage(newPage);
              }}
              perPageOptions={[
                { title: '5', value: 5 },
                { title: '10', value: 10 },
                { title: '20', value: 20 },
              ]}
              isCompact
              style={{ margin: 0 }}
            />
          </FlexItem>
        </Flex>

        {hasActiveFilters && (
          <div className="ols-ai-hub-plans-filter-chips ols-ai-hub-plans-filter-chips--active">
            {statusFilters.length > 0 && (
              <LabelGroup categoryName="Status" isClosable onClick={() => setStatusFilters([])}>
                {statusFilters.map((status) => (
                  <Label key={status} isCompact onClose={() => toggleFilterValue(status, setStatusFilters)}>
                    {statusFilterLabel(status)}
                  </Label>
                ))}
              </LabelGroup>
            )}
            {riskFilters.length > 0 && (
              <LabelGroup categoryName="Risk Level" isClosable onClick={() => setRiskFilters([])}>
                {riskFilters.map((tier) => (
                  <Label key={tier} isCompact onClose={() => toggleFilterValue(tier, setRiskFilters)}>
                    {tier}
                  </Label>
                ))}
              </LabelGroup>
            )}
            {confidenceFilters.length > 0 && (
              <LabelGroup categoryName="Confidence" isClosable onClick={() => setConfidenceFilters([])}>
                {confidenceFilters.map((tier) => (
                  <Label key={tier} isCompact onClose={() => toggleFilterValue(tier, setConfidenceFilters)}>
                    {tier}
                  </Label>
                ))}
              </LabelGroup>
            )}
            {triggerDomainFilters.length > 0 && (
              <LabelGroup categoryName="Trigger Domain" isClosable onClick={() => setTriggerDomainFilters([])}>
                {triggerDomainFilters.map((domain) => (
                  <Label key={domain} isCompact onClose={() => toggleFilterValue(domain, setTriggerDomainFilters)}>
                    {domain}
                  </Label>
                ))}
              </LabelGroup>
            )}
            <Button variant="link" isInline onClick={clearAllFilters} style={{ fontSize: 'var(--pf-t--global--font--size--sm)' }}>
              Clear all
            </Button>
          </div>
        )}

        <Table
          aria-label="Troubleshooting plans"
          className="ols-plans-table"
          style={{
            tableLayout: 'fixed',
            width: '100%',
            opacity: isAgenticAutomationEnabled ? 1 : 0.55,
            transition: 'opacity 200ms ease',
          }}
        >
          <Thead>
            <Tr>
              <Th style={{ width: '22%', ...TABLE_HEADER_TH_STYLE }}>Plan summary</Th>
              <Th style={{ width: '12%', ...TABLE_HEADER_TH_STYLE }}>Trigger domain</Th>
              <Th style={{ width: '10%', ...TABLE_HEADER_TH_STYLE }}>Risk score</Th>
              <Th style={{ width: '11%', ...TABLE_HEADER_TH_STYLE }}>Confidence</Th>
              <Th style={{ width: '12%', ...TABLE_HEADER_TH_STYLE }}>Status</Th>
              <Th style={{ width: '33%', ...TABLE_HEADER_TH_STYLE }}>Input/Signal context</Th>
            </Tr>
          </Thead>
          <Tbody>
            {paginatedRows.length === 0 ? (
              <Tr>
                <Td colSpan={6}>
                  <Content component="p" style={{ margin: 0, color: 'var(--pf-t--global--text--color--subtle)' }}>
                    No troubleshooting plans match the current filters.
                  </Content>
                </Td>
              </Tr>
            ) : (
              paginatedRows.map((row) => (
                <Tr key={row.id} style={{ verticalAlign: 'middle' }}>
                  <Td dataLabel="Plan summary" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
                    <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }} flexWrap={{ default: 'nowrap' }}>
                      <FlexItem>
                        <AiSparkle />
                      </FlexItem>
                      <FlexItem style={{ flex: '1 1 auto', minWidth: 0 }}>
                        <Button
                          variant="link"
                          isInline
                          isDisabled={!isAgenticAutomationEnabled}
                          onClick={() => openPlanRemediation(row)}
                          style={{ fontWeight: 400, textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word' }}
                        >
                          {row.synopsis}
                        </Button>
                        <Content
                          component="small"
                          style={{
                            display: 'block',
                            marginTop: 'var(--pf-t--global--spacer--2xs)',
                            color: 'var(--pf-t--global--text--color--subtle)',
                          }}
                        >
                          {row.name ?? row.id}
                        </Content>
                      </FlexItem>
                    </Flex>
                  </Td>
                  <Td dataLabel="Trigger domain" className="ols-plans-trigger-domain-cell">
                    <TriggerDomainCell domain={row.triggerDomain} />
                  </Td>
                  <Td dataLabel="Risk score">
                    <PlanRiskBadge score={row.riskScore ?? 50} showPrefix={false} />
                  </Td>
                  <Td dataLabel="Confidence">
                    {row.confidenceTier ? (
                      <PlanConfidenceBadge tier={row.confidenceTier} showPrefix={false} />
                    ) : (
                      '—'
                    )}
                  </Td>
                  <Td dataLabel="Status">
                    <StatusLabel status={row.status} terminatedAt={row.terminatedAt} />
                  </Td>
                  <Td dataLabel="Input/Signal context" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
                    {row.consolidationScope}
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </StackItem>
    </Stack>
  );
};

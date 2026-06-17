import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import {
  Button,
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
  Select,
  SelectList,
  SelectOption,
  TextInput,
} from '@patternfly/react-core';
import { CheckIcon } from '@patternfly/react-icons';
import type { ConfidenceTier } from '../../types/confidenceTier';
import { scoreToRiskTier, type RiskTier } from '../../types/riskScore';
import type { PlanRow } from './PlansAndApprovalsTab';

export type PlansSearchCategory = 'name' | 'label';

export const AGENTIC_STATUS_FILTER_OPTIONS: { label: string; value: PlanRow['status'] }[] = [
  { label: 'Investigating', value: 'Investigating' },
  { label: 'Awaiting Approval', value: 'Waiting Approval' },
  { label: 'Remediating', value: 'Remediating' },
  { label: 'Plan aborted', value: 'Plan aborted' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Failed', value: 'Failed' },
];

export const TROUBLESHOOTING_STATUS_FILTER_OPTIONS: { label: string; value: PlanRow['status'] }[] = [
  { label: 'Completed', value: 'Completed' },
  { label: 'Awaiting Approval', value: 'Waiting Approval' },
  { label: 'Plan aborted', value: 'Plan aborted' },
];

const RISK_LEVEL_OPTIONS: RiskTier[] = ['High', 'Medium', 'Low'];
const CONFIDENCE_OPTIONS: ConfidenceTier[] = ['High', 'Medium', 'Low'];

export const TRIGGER_DOMAIN_FILTER_OPTIONS = [
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

/** Granular telemetry-stack domains used by the Troubleshooting Plans view. */
export const OBSERVABILITY_TRIGGER_DOMAIN_OPTIONS = [
  'Prometheus',
  'Alertmanager',
  'Thanos',
  'OpenTelemetry',
  'Perses',
] as const;

const FILTER_SECTION_TITLE_STYLE: React.CSSProperties = {
  padding: 'var(--pf-t--global--spacer--sm) var(--pf-t--global--spacer--md) var(--pf-t--global--spacer--xs)',
  fontSize: 'var(--pf-t--global--font--size--body--sm)',
  fontWeight: 600,
  color: 'var(--pf-t--global--text--color--subtle)',
};

function planMatchesTextSearch(plan: PlanRow, query: string, category: PlansSearchCategory): boolean {
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
  includeTriggerDomainFilter: boolean,
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
  if (includeTriggerDomainFilter && triggerDomainFilters.length > 0 && !triggerDomainFilters.includes(plan.triggerDomain)) {
    return false;
  }
  return true;
}

export function filterPlanRows(
  rows: PlanRow[],
  options: {
    statusFilters: PlanRow['status'][];
    riskFilters: RiskTier[];
    confidenceFilters: ConfidenceTier[];
    triggerDomainFilters: string[];
    includeTriggerDomainFilter: boolean;
    searchCategory: PlansSearchCategory;
    searchInputValue: string;
  },
): PlanRow[] {
  return rows.filter((plan) => {
    if (
      !planMatchesAttributeFilters(
        plan,
        options.statusFilters,
        options.riskFilters,
        options.confidenceFilters,
        options.triggerDomainFilters,
        options.includeTriggerDomainFilter,
      )
    ) {
      return false;
    }
    return planMatchesTextSearch(plan, options.searchInputValue, options.searchCategory);
  });
}

export interface UsePlansFilterStateOptions {
  includeTriggerDomainFilter?: boolean;
}

export function usePlansFilterState(options: UsePlansFilterStateOptions = {}) {
  const includeTriggerDomainFilter = options.includeTriggerDomainFilter ?? false;

  const [statusFilters, setStatusFilters] = useState<PlanRow['status'][]>([]);
  const [riskFilters, setRiskFilters] = useState<RiskTier[]>([]);
  const [confidenceFilters, setConfidenceFilters] = useState<ConfidenceTier[]>([]);
  const [triggerDomainFilters, setTriggerDomainFilters] = useState<string[]>([]);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState<PlansSearchCategory>('name');
  const [searchCategoryOpen, setSearchCategoryOpen] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState('');

  const toggleFilterValue = useCallback(<T extends string>(value: T, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    setter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  }, []);

  const clearAllFilters = useCallback(() => {
    setStatusFilters([]);
    setRiskFilters([]);
    setConfidenceFilters([]);
    setTriggerDomainFilters([]);
    setSearchInputValue('');
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = statusFilters.length + riskFilters.length + confidenceFilters.length;
    if (includeTriggerDomainFilter) {
      count += triggerDomainFilters.length;
    }
    return count;
  }, [
    confidenceFilters.length,
    includeTriggerDomainFilter,
    riskFilters.length,
    statusFilters.length,
    triggerDomainFilters.length,
  ]);

  const hasActiveAttributeFilters = activeFilterCount > 0;
  const hasActiveTextSearch = searchInputValue.trim().length > 0;
  const hasActiveFilters = hasActiveAttributeFilters || hasActiveTextSearch;

  const filterRows = useCallback(
    (rows: PlanRow[]) =>
      filterPlanRows(rows, {
        statusFilters,
        riskFilters,
        confidenceFilters,
        triggerDomainFilters,
        includeTriggerDomainFilter,
        searchCategory,
        searchInputValue,
      }),
    [
      confidenceFilters,
      includeTriggerDomainFilter,
      riskFilters,
      searchCategory,
      searchInputValue,
      statusFilters,
      triggerDomainFilters,
    ],
  );

  return {
    statusFilters,
    setStatusFilters,
    riskFilters,
    setRiskFilters,
    confidenceFilters,
    setConfidenceFilters,
    triggerDomainFilters,
    setTriggerDomainFilters,
    filterMenuOpen,
    setFilterMenuOpen,
    searchCategory,
    setSearchCategory,
    searchCategoryOpen,
    setSearchCategoryOpen,
    searchInputValue,
    setSearchInputValue,
    toggleFilterValue,
    clearAllFilters,
    activeFilterCount,
    hasActiveFilters,
    filterRows,
  };
}

export interface PlansFilterToolbarProps {
  filterAriaLabel: string;
  statusOptions: { label: string; value: PlanRow['status'] }[];
  includeTriggerDomainFilter?: boolean;
  /** Override the default trigger-domain option list. Defaults to TRIGGER_DOMAIN_FILTER_OPTIONS. */
  triggerDomainOptions?: readonly string[];
  pagination?: React.ReactNode;
  statusFilters: PlanRow['status'][];
  riskFilters: RiskTier[];
  confidenceFilters: ConfidenceTier[];
  triggerDomainFilters: string[];
  filterMenuOpen: boolean;
  setFilterMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  searchCategory: PlansSearchCategory;
  setSearchCategory: React.Dispatch<React.SetStateAction<PlansSearchCategory>>;
  searchCategoryOpen: boolean;
  setSearchCategoryOpen: React.Dispatch<React.SetStateAction<boolean>>;
  searchInputValue: string;
  setSearchInputValue: React.Dispatch<React.SetStateAction<string>>;
  toggleFilterValue: <T extends string>(value: T, setter: React.Dispatch<React.SetStateAction<T[]>>) => void;
  clearAllFilters: () => void;
  activeFilterCount: number;
  hasActiveFilters: boolean;
  setStatusFilters: React.Dispatch<React.SetStateAction<PlanRow['status'][]>>;
  setRiskFilters: React.Dispatch<React.SetStateAction<RiskTier[]>>;
  setConfidenceFilters: React.Dispatch<React.SetStateAction<ConfidenceTier[]>>;
  setTriggerDomainFilters: React.Dispatch<React.SetStateAction<string[]>>;
}

export const PlansFilterToolbar: React.FC<PlansFilterToolbarProps> = ({
  filterAriaLabel,
  statusOptions,
  includeTriggerDomainFilter = false,
  triggerDomainOptions = TRIGGER_DOMAIN_FILTER_OPTIONS,
  pagination,
  statusFilters,
  riskFilters,
  confidenceFilters,
  triggerDomainFilters,
  filterMenuOpen,
  setFilterMenuOpen,
  searchCategory,
  setSearchCategory,
  searchCategoryOpen,
  setSearchCategoryOpen,
  searchInputValue,
  setSearchInputValue,
  toggleFilterValue,
  clearAllFilters,
  activeFilterCount,
  hasActiveFilters,
  setStatusFilters,
  setRiskFilters,
  setConfidenceFilters,
  setTriggerDomainFilters,
}) => {
  const handleFilterSelect = useCallback(
    (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
      if (typeof value !== 'string') {
        return;
      }
      if (statusOptions.some((opt) => opt.value === value)) {
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
      if (includeTriggerDomainFilter && (triggerDomainOptions as readonly string[]).includes(value)) {
        toggleFilterValue(value, setTriggerDomainFilters);
      }
    },
    [
      includeTriggerDomainFilter,
      triggerDomainOptions,
      setConfidenceFilters,
      setRiskFilters,
      setStatusFilters,
      setTriggerDomainFilters,
      statusOptions,
      toggleFilterValue,
    ],
  );

  const statusFilterLabel = (value: PlanRow['status']) =>
    statusOptions.find((opt) => opt.value === value)?.label ?? value;

  return (
    <>
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
                aria-label={filterAriaLabel}
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
                <SelectList className="ols-ai-hub-plans-filter-select-list">
                  <div style={FILTER_SECTION_TITLE_STYLE}>Status</div>
                  {statusOptions.map((opt) => (
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
                    <SelectOption key={tier} hasCheckbox value={tier} isSelected={riskFilters.includes(tier)}>
                      {tier}
                    </SelectOption>
                  ))}

                  <div style={FILTER_SECTION_TITLE_STYLE}>Confidence</div>
                  {CONFIDENCE_OPTIONS.map((tier) => (
                    <SelectOption key={tier} hasCheckbox value={tier} isSelected={confidenceFilters.includes(tier)}>
                      {tier}
                    </SelectOption>
                  ))}

                  {includeTriggerDomainFilter && (
                    <>
                      <div style={FILTER_SECTION_TITLE_STYLE}>Trigger Domain</div>
                      {triggerDomainOptions.map((domain) => (
                        <SelectOption
                          key={domain}
                          hasCheckbox
                          value={domain}
                          isSelected={triggerDomainFilters.includes(domain)}
                        >
                          {domain}
                        </SelectOption>
                      ))}
                    </>
                  )}
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

        {pagination && <FlexItem>{pagination}</FlexItem>}
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
          {includeTriggerDomainFilter && triggerDomainFilters.length > 0 && (
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
    </>
  );
};

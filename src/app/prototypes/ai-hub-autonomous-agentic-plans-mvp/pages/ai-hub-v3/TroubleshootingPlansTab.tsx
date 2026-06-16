import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Content,
  Flex,
  FlexItem,
  Pagination,
  Stack,
  StackItem,
  Tooltip,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { AI_EXPERIENCE_ICON_DATA_URL } from '../../components/autonomousAiObserve/aiExperienceIconUrl';
import {
  getAgenticAutomationDisabledMessage,
  resolveAgentCapabilitiesClusterId,
  useAgenticCapabilities,
} from '../../context/AgenticCapabilitiesContext';
import { usePlanTermination } from '../../context/PlanTerminationContext';
import { useActivePerspective, type AppShellPerspectiveKey } from '@app/shared/contexts/ActivePerspectiveContext';
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
import {
  PlansFilterToolbar,
  TROUBLESHOOTING_STATUS_FILTER_OPTIONS,
  usePlansFilterState,
} from './PlansFilterToolbar';

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

const TABLE_HEADER_TH_STYLE: React.CSSProperties = {
  verticalAlign: 'top',
};

const DEFAULT_PER_PAGE = 10;

export const TroubleshootingPlansTab: React.FC = () => {
  const navigate = useNavigate();
  const { activePerspective } = useActivePerspective();
  const isSingleCluster = activePerspective === 'Core platforms';
  const agentClusterId = resolveAgentCapabilitiesClusterId(isSingleCluster);
  const { isAgentActiveForCluster } = useAgenticCapabilities();
  const { abortedPlans, resumedPlanIds } = usePlanTermination();
  const isAgenticAutomationEnabled = isAgentActiveForCluster(agentClusterId);

  const plansFilter = usePlansFilterState({ includeTriggerDomainFilter: false });

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

  const filteredRows = useMemo(
    () => plansFilter.filterRows(observabilityPlans),
    [observabilityPlans, plansFilter.filterRows],
  );

  useEffect(() => {
    setPage(1);
  }, [
    filteredRows.length,
    plansFilter.searchInputValue,
    plansFilter.searchCategory,
    plansFilter.statusFilters,
    plansFilter.riskFilters,
    plansFilter.confidenceFilters,
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

  return (
    <Stack hasGutter>
      {!isAgenticAutomationEnabled && (
        <StackItem>
          <Alert variant="warning" isInline title={getAgenticAutomationDisabledMessage(isSingleCluster)} />
        </StackItem>
      )}

      <StackItem className="ols-ai-hub-plans-section">
        <PlansFilterToolbar
          filterAriaLabel="Filter troubleshooting plans"
          statusOptions={TROUBLESHOOTING_STATUS_FILTER_OPTIONS}
          pagination={
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
          }
          {...plansFilter}
        />

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

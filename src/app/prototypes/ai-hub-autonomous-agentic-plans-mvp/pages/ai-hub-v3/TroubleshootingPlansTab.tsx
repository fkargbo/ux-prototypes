import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Content,
  Pagination,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import {
  getAgenticAutomationDisabledMessage,
  resolveAgentCapabilitiesClusterId,
  useAgenticCapabilities,
} from '../../context/AgenticCapabilitiesContext';
import { usePlanTermination } from '../../context/PlanTerminationContext';
import { useActivePerspective, type AppShellPerspectiveKey } from '@app/shared/contexts/ActivePerspectiveContext';
import {
  getTroubleshootingPlanRemediationHref,
  perspectiveKeyFromShellName,
  writePlanRemediationDrillSession,
} from '../planRemediationDrillSession';
import {
  PlansTableCore,
  buildPlansForPerspective,
  type PlanRow,
} from './PlansAndApprovalsTab';
import {
  OBSERVABILITY_TRIGGER_DOMAIN_OPTIONS,
  PlansFilterToolbar,
  TROUBLESHOOTING_STATUS_FILTER_OPTIONS,
  usePlansFilterState,
} from './PlansFilterToolbar';

const DEFAULT_PER_PAGE = 10;

export const TroubleshootingPlansTab: React.FC = () => {
  const navigate = useNavigate();
  const { activePerspective } = useActivePerspective();
  const isSingleCluster = activePerspective === 'Core platforms';
  const agentClusterId = resolveAgentCapabilitiesClusterId(isSingleCluster);
  const { isAgentActiveForCluster } = useAgenticCapabilities();
  const { abortedPlans, resumedPlanIds } = usePlanTermination();
  const isAgenticAutomationEnabled = isAgentActiveForCluster(agentClusterId);

  const plansFilter = usePlansFilterState({ includeTriggerDomainFilter: true });

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);

  const planExecutionRuntime = useMemo(
    () => ({ abortedPlans, resumedPlanIds }),
    [abortedPlans, resumedPlanIds],
  );

  const observabilityPlans = useMemo(() => {
    return buildPlansForPerspective(isSingleCluster, planExecutionRuntime).filter(
      (plan) =>
        (OBSERVABILITY_TRIGGER_DOMAIN_OPTIONS as readonly string[]).includes(plan.triggerDomain)
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
    plansFilter.triggerDomainFilters,
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
      navigate(getTroubleshootingPlanRemediationHref(plan.name ?? plan.id, perspectiveKey));
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
          triggerDomainOptions={OBSERVABILITY_TRIGGER_DOMAIN_OPTIONS}
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

        {paginatedRows.length === 0 ? (
          <Content component="p" style={{ margin: 0, color: 'var(--pf-t--global--text--color--subtle)' }}>
            No troubleshooting plans match the current filters.
          </Content>
        ) : (
          <PlansTableCore
            rows={paginatedRows}
            ariaLabel="Troubleshooting plans"
            scopeColumnLabel={isSingleCluster ? 'Namespace' : 'Cluster'}
            onReviewPlan={openPlanRemediation}
            isAgenticAutomationEnabled={isAgenticAutomationEnabled}
          />
        )}
      </StackItem>
    </Stack>
  );
};

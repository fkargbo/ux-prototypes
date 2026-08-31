import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Content,
  Pagination,
  Stack,
  StackItem,
  Tooltip,
} from '@patternfly/react-core';
import { ColumnsIcon } from '@patternfly/react-icons';
import {
  resolveAgentCapabilitiesClusterId,
  useAgenticCapabilities,
} from '../../context/AgenticCapabilitiesContext';
import { useDeletedPlans } from '../../context/DeletedPlansContext';
import { usePlanBuildRuntime } from '../../hooks/usePlanBuildRuntime';
import { useActivePerspective, type AppShellPerspectiveKey } from '@app/shared/contexts/ActivePerspectiveContext';
import {
  perspectiveKeyFromShellName,
  writePlanRemediationDrillSession,
} from '../planRemediationDrillSession';
import { getPlanDetailHref } from './domainPlanNavigation';
import {
  PlansColumnManagementModal,
  PlansTableCore,
  buildPlansForPerspective,
  usePlansColumnVisibility,
  type PlanRow,
} from './PlansAndApprovalsTab';
import { isNewAlertInvestigationPlanVisible } from './alertInvestigationPlans';
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
  const planExecutionRuntime = usePlanBuildRuntime();
  const isAgenticAutomationEnabled = isAgentActiveForCluster(agentClusterId);
  const { deletePlan, isPlanDeleted } = useDeletedPlans();

  const plansFilter = usePlansFilterState({ includeTriggerDomainFilter: true });
  const colVis = usePlansColumnVisibility('ols-agentic-runs-col-visibility');

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);

  const observabilityPlans = useMemo(() => {
    return buildPlansForPerspective(isSingleCluster, planExecutionRuntime).filter(
      (plan) =>
        !isPlanDeleted(plan.id)
        && (OBSERVABILITY_TRIGGER_DOMAIN_OPTIONS as readonly string[]).includes(plan.triggerDomain)
        && plan.consolidationScope.startsWith('Triggered by alert:')
        && isNewAlertInvestigationPlanVisible(plan),
    );
  }, [isSingleCluster, planExecutionRuntime, isPlanDeleted]);

  const filteredRows = useMemo(
    () => plansFilter.filterRows(observabilityPlans),
    [observabilityPlans, plansFilter.filterRows],
  );

  useEffect(() => {
    setPage(1);
  }, [
    filteredRows.length,
    plansFilter.searchInputValue,
    plansFilter.statusFilters,
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
      const perspectiveKey: AppShellPerspectiveKey =
        perspectiveKeyFromShellName(activePerspective)
        ?? (isSingleCluster ? 'core-platforms' : 'fleet-management');
      writePlanRemediationDrillSession({ perspectiveKey });
      navigate(getPlanDetailHref(plan, perspectiveKey));
    },
    [activePerspective, isSingleCluster, navigate],
  );

  return (
    <Stack hasGutter>
      <StackItem className="ols-ai-hub-plans-section">
        <PlansFilterToolbar
          filterAriaLabel="Filter troubleshooting plans"
          statusOptions={TROUBLESHOOTING_STATUS_FILTER_OPTIONS}
          triggerDomainOptions={OBSERVABILITY_TRIGGER_DOMAIN_OPTIONS}
          rows={observabilityPlans}
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
          columnManagementControl={
            <Tooltip content="Manage columns">
              <Button
                variant="plain"
                aria-label="Manage columns"
                onClick={colVis.openModal}
              >
                <ColumnsIcon />
              </Button>
            </Tooltip>
          }
          {...plansFilter}
        />

        {paginatedRows.length === 0 ? (
          <Content component="p" style={{ margin: 0, color: 'var(--pf-t--global--text--color--subtle)' }}>
            No agentic runs match the current filters.
          </Content>
        ) : (
          <PlansTableCore
            rows={paginatedRows}
            ariaLabel="Agentic runs"
            scopeColumnLabel={isSingleCluster ? 'Namespace' : 'Cluster'}
            onReviewPlan={openPlanRemediation}
            onDeletePlan={deletePlan}
            isAgenticAutomationEnabled={isAgenticAutomationEnabled}
            showTriggerDomainColumn={false}
            hiddenColumns={colVis.hiddenColumns}
          />
        )}
      </StackItem>

      <PlansColumnManagementModal
        isOpen={colVis.isModalOpen}
        onClose={colVis.closeModal}
        onSave={colVis.saveColumns}
        draftHidden={colVis.draftHidden}
        onToggle={colVis.toggleDraftColumn}
        onSelectAll={colVis.selectAllDraftColumns}
      />
    </Stack>
  );
};

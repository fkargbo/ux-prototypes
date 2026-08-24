/**
 * Recommendation hub list — actionable recommendations (GitOps, Pipelines, Observability, ACS).
 * Pattern B destination when investigating from domain UIs.
 */
import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Content, Stack, StackItem, Title } from '@patternfly/react-core';
import { useActivePerspective, type AppShellPerspectiveKey } from '@app/shared/contexts/ActivePerspectiveContext';
import { buildRecommendationCatalog } from '../../recommendationCatalog';
import { getRecommendationDetailHref } from '../../domainInvestigationHandoff';
import {
  PlansTableCore,
  type PlanRow,
} from '../ai-hub-plans-v2/PlansAndApprovalsTab';
import {
  resolveAgentCapabilitiesClusterId,
  useAgenticCapabilities,
} from '../../context/AgenticCapabilitiesContext';
import { usePlanBuildRuntime } from '../../hooks/usePlanBuildRuntime';
import { perspectiveKeyFromShellName, writePlanRemediationDrillSession } from '../planRemediationDrillSession';
import '../ai-hub-page.css';

export const RecommendationHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { activePerspective } = useActivePerspective();
  const isSingleCluster = activePerspective === 'Core platforms';
  const agentClusterId = resolveAgentCapabilitiesClusterId(isSingleCluster);
  const { isAgentActiveForCluster } = useAgenticCapabilities();
  const planExecutionRuntime = usePlanBuildRuntime();
  const isAgenticAutomationEnabled = isAgentActiveForCluster(agentClusterId);

  const plans = useMemo(
    () => buildRecommendationCatalog(isSingleCluster, planExecutionRuntime),
    [isSingleCluster, planExecutionRuntime],
  );

  const openRecommendation = useCallback(
    (plan: PlanRow) => {
      const perspectiveKey: AppShellPerspectiveKey =
        perspectiveKeyFromShellName(activePerspective)
        ?? (isSingleCluster ? 'core-platforms' : 'fleet-management');
      writePlanRemediationDrillSession({ perspectiveKey });
      navigate(getRecommendationDetailHref(plan, perspectiveKey), { state: { plan } });
    },
    [activePerspective, isSingleCluster, navigate],
  );

  return (
    <div
      className="ols-ai-hub-page ols-ai-hub-page--v3"
      data-exp-lab-annotation-root
      style={{
        height: '100%',
        padding: '24px',
        boxSizing: 'border-box',
        overflow: 'auto',
      }}
    >
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h1" size="2xl">
            Recommendation / AI Investigation Hub
          </Title>
          <Content component="p" className="ols-ai-hub-page-subtitle">
            Actionable recommendations you can remediate from this hub — observability alerts, GitOps drift,
            pipeline failures, and security findings. Cluster update analysis-only proposals are excluded.
          </Content>
        </StackItem>
        <StackItem>
          <PlansTableCore
            rows={plans}
            ariaLabel="Recommendation hub plans"
            scopeColumnLabel={isSingleCluster ? 'Namespace' : 'Cluster'}
            onReviewPlan={openRecommendation}
            onDeletePlan={() => undefined}
            isAgenticAutomationEnabled={isAgenticAutomationEnabled}
            mapObservabilityDomains
          />
        </StackItem>
      </Stack>
    </div>
  );
};

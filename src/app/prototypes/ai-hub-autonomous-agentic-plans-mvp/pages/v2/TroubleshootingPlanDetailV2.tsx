import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { useActivePerspective } from '@app/shared/contexts/ActivePerspectiveContext';
import {
  buildPlansForPerspective,
  PlanResourceBadge,
  RemediationBlueprintPanel,
  StatusLabel,
  WaitingApprovalPlanMeta,
  type PlanRow,
} from '../ai-hub-plans-v2/PlansAndApprovalsTab';
import { AgenticKillSwitchBanner } from '../../components/AgenticKillSwitchBanner';
import {
  buildPrototypeHref,
  isSingleClusterPerspectiveKey,
  perspectiveKeyFromShellName,
  resolveDrillPerspectiveKey,
  TROUBLESHOOTING_PLANS_LIST_PATH,
  writePlanRemediationDrillSession,
} from '../v2PlanRemediationDrillSession';
import { resolvePlanDomainAnnotations } from '../ai-hub-plans-v2/domainPlanNavigation';
import { usePlanBuildRuntime } from '../../hooks/usePlanBuildRuntime';
import { AiHubPageHeading } from '../../components/AiHubPageHeading';
import { DEFAULT_PROTOTYPE_PERSPECTIVE } from '../../prototypePerspectiveUrl';
import '../ai-hub-page.css';

type TroubleshootingPlanDetailLocationState = { plan?: PlanRow };

/** PF6 EmptyState.icon expects a component ref; this wrapper sizes the Spinner to xl. */
const PendingSpinnerIcon: React.FC = () => <Spinner size="xl" />;

export const TroubleshootingPlanDetailV2: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { planId } = useParams<{ planId: string }>();
  const [searchParams] = useSearchParams();
  const { activePerspective, setPerspectiveByKey } = useActivePerspective();
  const drillPerspectiveAppliedRef = useRef(false);

  const drillPerspectiveKey = useMemo(
    () => resolveDrillPerspectiveKey(searchParams),
    [searchParams],
  );

  const isSingleCluster = drillPerspectiveKey
    ? isSingleClusterPerspectiveKey(drillPerspectiveKey)
    : activePerspective === 'Core platforms';

  const planExecutionRuntime = usePlanBuildRuntime();
  const navigationState = location.state as TroubleshootingPlanDetailLocationState | null;

  const plan = useMemo(() => {
    if (!planId) return null;
    const decoded = decodeURIComponent(planId);
    const catalogPlan = buildPlansForPerspective(isSingleCluster, planExecutionRuntime).find(
      (p) => p.id === decoded,
    );
    if (catalogPlan) return catalogPlan;
    if (navigationState?.plan?.id === decoded) return navigationState.plan;
    return null;
  }, [isSingleCluster, navigationState?.plan, planExecutionRuntime, planId]);

  const planDomain = useMemo(
    () => (plan ? resolvePlanDomainAnnotations(plan) : null),
    [plan],
  );

  const navigateBackToPlans = useCallback(() => {
    const key =
      drillPerspectiveKey
      ?? perspectiveKeyFromShellName(activePerspective)
      ?? DEFAULT_PROTOTYPE_PERSPECTIVE;
    writePlanRemediationDrillSession({ perspectiveKey: key });
    setPerspectiveByKey(key);
    navigate(buildPrototypeHref(planDomain?.listPath ?? TROUBLESHOOTING_PLANS_LIST_PATH, key));
  }, [activePerspective, drillPerspectiveKey, navigate, planDomain?.listPath, setPerspectiveByKey]);

  useLayoutEffect(() => {
    if (!drillPerspectiveKey || drillPerspectiveAppliedRef.current) return;
    drillPerspectiveAppliedRef.current = true;
    setPerspectiveByKey(drillPerspectiveKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on drill URL only
  }, [drillPerspectiveKey]);

  useEffect(() => {
    if (planId && plan) return;
    const key =
      drillPerspectiveKey
      ?? perspectiveKeyFromShellName(activePerspective)
      ?? DEFAULT_PROTOTYPE_PERSPECTIVE;
    writePlanRemediationDrillSession({ perspectiveKey: key });
    setPerspectiveByKey(key);
    navigate(buildPrototypeHref(TROUBLESHOOTING_PLANS_LIST_PATH, key), { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- redirect once when plan is missing
  }, [planId, plan]);

  if (!planId || !plan) return null;

  const planDisplayName = plan.name ?? plan.id;

  return (
    <div className="ols-ai-hub-page ols-ai-hub-page--v3" data-exp-lab-annotation-root>
      <div className="template-page-breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem component="button" onClick={navigateBackToPlans}>
            Plans
          </BreadcrumbItem>
          <BreadcrumbItem isActive>Plan details</BreadcrumbItem>
        </Breadcrumb>
      </div>

      <AiHubPageHeading>
        <div className="ols-ai-hub-page-heading-body-content">
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            gap={{ default: 'gapSm' }}
            flexWrap={{ default: 'wrap' }}
            style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}
          >
            <FlexItem><PlanResourceBadge /></FlexItem>
            <FlexItem style={{ minWidth: 0 }}>
              <Title headingLevel="h1" size="2xl" style={{ marginBottom: 0, wordBreak: 'break-word' }}>
                {planDisplayName}
              </Title>
            </FlexItem>
          </Flex>
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            gap={{ default: 'gapSm' }}
            flexWrap={{ default: 'wrap' }}
            style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}
          >
            <FlexItem>
              <StatusLabel status={plan.status} terminatedAt={plan.terminatedAt} />
            </FlexItem>
          </Flex>
          <div style={{ marginTop: 'var(--pf-t--global--spacer--xs)' }}>
            <WaitingApprovalPlanMeta plan={plan} />
          </div>
        </div>
      </AiHubPageHeading>

      <div
        className="template-page-content"
        role="main"
        aria-label={`Troubleshooting plan: ${planDisplayName}`}
      >
        {plan.status === 'Pending' ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '320px',
              padding: 'var(--pf-t--global--spacer--2xl) var(--pf-t--global--spacer--lg)',
            }}
          >
            <EmptyState
              titleText="Initializing plan..."
              icon={PendingSpinnerIcon}
              headingLevel="h2"
            >
              <EmptyStateBody>
                The proposal custom resource has been created on the cluster. Waiting for the AI
                analysis engine to dispatch.
              </EmptyStateBody>
            </EmptyState>
          </div>
        ) : (
          <div className="ols-plan-remediation-drilldown">
            <AgenticKillSwitchBanner />
            <RemediationBlueprintPanel key={plan.id} plan={plan} />
          </div>
        )}
      </div>
    </div>
  );
};

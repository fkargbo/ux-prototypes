import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
} from '../ai-hub-plans-v2/PlansAndApprovalsTab';
import { AgenticKillSwitchBanner } from '../../components/AgenticKillSwitchBanner';
import {
  buildPrototypeHref,
  isSingleClusterPerspectiveKey,
  PLANS_LIST_PATH,
  perspectiveKeyFromShellName,
  resolveDrillPerspectiveKey,
  writePlanRemediationDrillSession,
} from '../v2PlanRemediationDrillSession';
import { resolvePlanDomainAnnotations } from '../ai-hub-plans-v2/domainPlanNavigation';
import { usePlanBuildRuntime } from '../../hooks/usePlanBuildRuntime';
import { AiHubPageHeading } from '../../components/AiHubPageHeading';
import { DEFAULT_PROTOTYPE_PERSPECTIVE } from '../../prototypePerspectiveUrl';
import '../ai-hub-page.css';

/** PF6 EmptyState.icon expects a component ref; this wrapper sizes the Spinner to xl. */
const PendingSpinnerIcon: React.FC = () => <Spinner size="xl" />;

export const PlanRemediationPageV2: React.FC = () => {
  const navigate = useNavigate();
  const { planSlug } = useParams<{ planSlug: string }>();
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

  const plan = useMemo(() => {
    if (!planSlug) return null;
    return buildPlansForPerspective(isSingleCluster, planExecutionRuntime).find((row) => row.name === planSlug) ?? null;
  }, [isSingleCluster, planSlug, planExecutionRuntime]);

  const planDomain = useMemo(
    () => (plan ? resolvePlanDomainAnnotations(plan) : null),
    [plan],
  );

  const navigateBackToPlans = useCallback(() => {
    const key = drillPerspectiveKey
      ?? perspectiveKeyFromShellName(activePerspective)
      ?? DEFAULT_PROTOTYPE_PERSPECTIVE;
    writePlanRemediationDrillSession({ perspectiveKey: key });
    setPerspectiveByKey(key);
    const backPath = planDomain?.listPath ?? PLANS_LIST_PATH;
    navigate(buildPrototypeHref(backPath, key));
  }, [activePerspective, drillPerspectiveKey, navigate, planDomain?.listPath, setPerspectiveByKey]);

  useLayoutEffect(() => {
    if (!drillPerspectiveKey || drillPerspectiveAppliedRef.current) return;
    drillPerspectiveAppliedRef.current = true;
    setPerspectiveByKey(drillPerspectiveKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on drill URL only
  }, [drillPerspectiveKey]);

  useEffect(() => {
    if (!plan) return;
    const key = drillPerspectiveKey
      ?? perspectiveKeyFromShellName(activePerspective)
      ?? DEFAULT_PROTOTYPE_PERSPECTIVE;
    const domain = resolvePlanDomainAnnotations(plan);
    if (domain.sourceDomain !== 'cluster-update') {
      navigate(buildPrototypeHref(domain.detailPath, key), { replace: true });
    }
  }, [activePerspective, drillPerspectiveKey, navigate, plan]);

  useEffect(() => {
    if (planSlug && plan) return;
    const key = drillPerspectiveKey
      ?? perspectiveKeyFromShellName(activePerspective)
      ?? DEFAULT_PROTOTYPE_PERSPECTIVE;
    writePlanRemediationDrillSession({ perspectiveKey: key });
    setPerspectiveByKey(key);
    navigate(buildPrototypeHref(PLANS_LIST_PATH, key), { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- redirect once when plan is missing
  }, [planSlug, plan]);

  if (!planSlug || !plan || planDomain?.sourceDomain !== 'cluster-update') return null;

  const planDisplayName = plan.name ?? plan.id;

  return (
    <div className="ols-ai-hub-page ols-ai-hub-page--v3" data-exp-lab-annotation-root>
      <div className="template-page-breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem component="button" onClick={navigateBackToPlans}>
            {planDomain?.listBreadcrumbLabel ?? 'Plans'}
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

      <div className="template-page-content" role="main" aria-label={`Plan remediation: ${planDisplayName}`}>
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

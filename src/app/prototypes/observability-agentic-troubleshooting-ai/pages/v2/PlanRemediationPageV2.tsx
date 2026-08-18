import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  Flex,
  FlexItem,
  Label,
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
import { NamespaceResourceLink } from '../../components/NamespaceResourceLink';
import { AgenticKillSwitchBanner } from '../../components/AgenticKillSwitchBanner';
import { TechPreviewBadge } from '../../components/TechPreviewBadge';
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
import { getClusterUpdateHref } from '../v2PerspectiveUrl';
import '../ai-hub-page.css';

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

  const resolvePerspectiveKey = useCallback(
    () =>
      drillPerspectiveKey
      ?? perspectiveKeyFromShellName(activePerspective)
      ?? DEFAULT_PROTOTYPE_PERSPECTIVE,
    [activePerspective, drillPerspectiveKey],
  );

  const navigateBackToPlans = useCallback(() => {
    const key = resolvePerspectiveKey();
    writePlanRemediationDrillSession({ perspectiveKey: key });
    setPerspectiveByKey(key);
    const backPath = planDomain?.listPath ?? PLANS_LIST_PATH;
    navigate(buildPrototypeHref(backPath, key));
  }, [navigate, planDomain?.listPath, resolvePerspectiveKey, setPerspectiveByKey]);

  const openClusterUpdateUi = useCallback(() => {
    const key = resolvePerspectiveKey();
    writePlanRemediationDrillSession({ perspectiveKey: key });
    setPerspectiveByKey(key);
    navigate(getClusterUpdateHref(key));
  }, [navigate, resolvePerspectiveKey, setPerspectiveByKey]);

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

  /** Local denial override — transitions a Proposed plan to Denied without mutating mock data. */
  const [locallyDenied, setLocallyDenied] = useState(false);
  const [isInitializingPhase, setIsInitializingPhase] = useState(false);

  useEffect(() => {
    setLocallyDenied(false);
  }, [planSlug]);


  if (!planSlug || !plan || planDomain?.sourceDomain !== 'cluster-update') return null;

  const effectivePlan: PlanRow = locallyDenied
    ? { ...plan, status: 'Denied' as PlanRow['status'] }
    : plan;

  const planDisplayName = plan.name ?? plan.id;

  return (
    <div className="ols-ai-hub-page ols-ai-hub-page--v3" data-exp-lab-annotation-root>
      <div className="template-page-breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem component="button" onClick={navigateBackToPlans}>
            {planDomain?.listBreadcrumbLabel ?? 'Agentic runs'}
          </BreadcrumbItem>
          <BreadcrumbItem isActive>Agentic run details</BreadcrumbItem>
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
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }}>
                <FlexItem>
                  <Title headingLevel="h1" size="2xl" style={{ marginBottom: 0, wordBreak: 'break-word' }}>
                    {planDisplayName}
                  </Title>
                </FlexItem>
                <FlexItem>
                  <TechPreviewBadge />
                </FlexItem>
              </Flex>
            </FlexItem>
            {plan.namespace ? (
              <FlexItem>
                <NamespaceResourceLink name={plan.namespace} />
              </FlexItem>
            ) : null}
            <FlexItem>
              <Label color="grey" variant="outline" isCompact>Trigger domain: {plan.triggerDomain}</Label>
            </FlexItem>
          </Flex>
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            gap={{ default: 'gapSm' }}
            flexWrap={{ default: 'wrap' }}
            style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}
          >
            <FlexItem>
              <StatusLabel status={effectivePlan.status} terminatedAt={effectivePlan.terminatedAt} />
            </FlexItem>
          </Flex>
          <div style={{ marginTop: 'var(--pf-t--global--spacer--xs)' }}>
            <WaitingApprovalPlanMeta plan={effectivePlan} />
          </div>
        </div>
      </AiHubPageHeading>


      <div className="template-page-content" role="main" aria-label={`Plan remediation: ${planDisplayName}`}>
        <div
          className="ols-plan-remediation-drilldown"
          style={isInitializingPhase && effectivePlan.status === 'Pending' ? { width: '100%' } : undefined}
        >
          <AgenticKillSwitchBanner />
          <RemediationBlueprintPanel
            key={plan.id}
            plan={effectivePlan}
            onRejectPlan={plan.status === 'Proposed' ? () => setLocallyDenied(true) : undefined}
            onStartNewInvestigation={navigateBackToPlans}
            onRemediateInClusterUpdates={openClusterUpdateUi}
            onPendingInitializingChange={setIsInitializingPhase}
          />
        </div>
      </div>
    </div>
  );
};

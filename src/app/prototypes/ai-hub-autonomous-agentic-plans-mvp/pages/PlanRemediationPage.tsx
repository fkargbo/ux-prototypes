import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, Flex, FlexItem, Title } from '@patternfly/react-core';
import { useActivePerspective } from '@app/shared/contexts/ActivePerspectiveContext';
import {
  buildPlansForPerspective,
  PlanConfidenceBadge,
  PlanResourceBadge,
  PlanRiskBadge,
  RemediationBlueprintPanel,
  StatusLabel,
  WaitingApprovalPlanMeta,
} from './ai-hub-v3/PlansAndApprovalsTab';
import {
  buildPrototypeHref,
  isSingleClusterPerspectiveKey,
  PLANS_LIST_PATH,
  perspectiveKeyFromShellName,
  readRemediationSource,
  resolveDrillPerspectiveKey,
  TROUBLESHOOTING_PLANS_LIST_PATH,
  writePlanRemediationDrillSession,
} from './planRemediationDrillSession';
import { usePlanTermination } from '../context/PlanTerminationContext';
import { AiHubPageHeading } from '../components/AiHubPageHeading';
import { DEFAULT_PROTOTYPE_PERSPECTIVE } from '../prototypePerspectiveUrl';
import './ai-hub-page.css';

export const PlanRemediationPage: React.FC = () => {
  const navigate = useNavigate();
  const { planSlug } = useParams<{ planSlug: string }>();
  const [searchParams] = useSearchParams();
  const { activePerspective, setPerspectiveByKey } = useActivePerspective();
  const drillPerspectiveAppliedRef = useRef(false);

  const drillPerspectiveKey = useMemo(
    () => resolveDrillPerspectiveKey(searchParams),
    [searchParams],
  );

  const remediationSource = useMemo(
    () => readRemediationSource(searchParams),
    [searchParams],
  );

  const isFromTroubleshootingPlans = remediationSource === 'troubleshooting-plans';

  const isSingleCluster = drillPerspectiveKey
    ? isSingleClusterPerspectiveKey(drillPerspectiveKey)
    : activePerspective === 'Core platforms';

  const { abortedPlans, resumedPlanIds } = usePlanTermination();

  const planExecutionRuntime = useMemo(
    () => ({ abortedPlans, resumedPlanIds }),
    [abortedPlans, resumedPlanIds],
  );

  const plan = useMemo(() => {
    if (!planSlug) {
      return null;
    }
    return buildPlansForPerspective(isSingleCluster, planExecutionRuntime).find((row) => row.name === planSlug) ?? null;
  }, [isSingleCluster, planSlug, planExecutionRuntime]);

  const navigateBackToPlans = useCallback(() => {
    const key = drillPerspectiveKey
      ?? perspectiveKeyFromShellName(activePerspective)
      ?? DEFAULT_PROTOTYPE_PERSPECTIVE;
    writePlanRemediationDrillSession({ perspectiveKey: key });
    setPerspectiveByKey(key);
    const backPath = isFromTroubleshootingPlans ? TROUBLESHOOTING_PLANS_LIST_PATH : PLANS_LIST_PATH;
    navigate(buildPrototypeHref(backPath, key));
  }, [activePerspective, drillPerspectiveKey, isFromTroubleshootingPlans, navigate, setPerspectiveByKey]);

  useLayoutEffect(() => {
    if (!drillPerspectiveKey || drillPerspectiveAppliedRef.current) {
      return;
    }
    drillPerspectiveAppliedRef.current = true;
    setPerspectiveByKey(drillPerspectiveKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on drill URL only
  }, [drillPerspectiveKey]);

  useEffect(() => {
    if (planSlug && plan) {
      return;
    }
    const key = drillPerspectiveKey
      ?? perspectiveKeyFromShellName(activePerspective)
      ?? DEFAULT_PROTOTYPE_PERSPECTIVE;
    writePlanRemediationDrillSession({ perspectiveKey: key });
    setPerspectiveByKey(key);
    navigate(buildPrototypeHref(PLANS_LIST_PATH, key), { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- redirect once when plan is missing
  }, [planSlug, plan]);

  if (!planSlug || !plan) {
    return null;
  }

  const planDisplayName = plan.name ?? plan.id;

  return (
    <div className="ols-ai-hub-page ols-ai-hub-page--v3" data-exp-lab-annotation-root>
      <div className="template-page-breadcrumb">
        <Breadcrumb>
          {isFromTroubleshootingPlans ? (
            <>
              <BreadcrumbItem component="button" onClick={navigateBackToPlans}>
                Observe
              </BreadcrumbItem>
              <BreadcrumbItem component="button" onClick={navigateBackToPlans}>
                Troubleshooting plans
              </BreadcrumbItem>
            </>
          ) : (
            <>
              <BreadcrumbItem component="button" onClick={navigateBackToPlans}>
                Agentic plans
              </BreadcrumbItem>
              <BreadcrumbItem component="button" onClick={navigateBackToPlans}>
                Plans
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbItem isActive>{planDisplayName}</BreadcrumbItem>
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
            <FlexItem>
              <PlanResourceBadge />
            </FlexItem>
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
            {plan.confidenceTier && (
              <FlexItem>
                <PlanConfidenceBadge tier={plan.confidenceTier} />
              </FlexItem>
            )}
            <FlexItem>
              <PlanRiskBadge score={plan.riskScore ?? 50} />
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
        aria-label={`Plan remediation: ${planDisplayName}`}
      >
        <div className="ols-plan-remediation-drilldown">
          <RemediationBlueprintPanel key={plan.id} plan={plan} />
        </div>
      </div>
    </div>
  );
};

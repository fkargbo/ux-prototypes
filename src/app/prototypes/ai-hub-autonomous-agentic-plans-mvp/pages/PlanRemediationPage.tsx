import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, Flex, FlexItem, Title } from '@patternfly/react-core';
import { useActivePerspective } from '@app/shared/contexts/ActivePerspectiveContext';
import {
  buildPlansForPerspective,
  PlanResourceBadge,
  RemediationBlueprintPanel,
  StatusLabel,
  WaitingApprovalPlanMeta,
} from './ai-hub-v3/PlansAndApprovalsTab';
import {
  DRILL_FROM_QUERY_PARAM,
  isSingleClusterPerspectiveKey,
  PLANS_LIST_PATH,
  perspectiveKeyFromShellName,
  resolveDrillPerspectiveKey,
  writePlanRemediationDrillSession,
} from './planRemediationDrillSession';
import './ai-hub-page.css';

export const PlanRemediationPage: React.FC = () => {
  const navigate = useNavigate();
  const { planSlug } = useParams<{ planSlug: string }>();
  const [searchParams] = useSearchParams();
  const { activePerspective, setPerspectiveByKey } = useActivePerspective();
  const drillPerspectiveAppliedRef = useRef(false);

  const drillPerspectiveKey = useMemo(
    () => resolveDrillPerspectiveKey(searchParams.get(DRILL_FROM_QUERY_PARAM)),
    [searchParams],
  );

  const isSingleCluster = drillPerspectiveKey
    ? isSingleClusterPerspectiveKey(drillPerspectiveKey)
    : activePerspective === 'Core platforms';

  const plan = useMemo(() => {
    if (!planSlug) {
      return null;
    }
    return buildPlansForPerspective(isSingleCluster).find((row) => row.name === planSlug) ?? null;
  }, [isSingleCluster, planSlug]);

  const navigateBackToPlans = useCallback(() => {
    const key = drillPerspectiveKey
      ?? perspectiveKeyFromShellName(activePerspective)
      ?? 'fleet-management';
    writePlanRemediationDrillSession({ perspectiveKey: key });
    setPerspectiveByKey(key);
    navigate(PLANS_LIST_PATH);
  }, [activePerspective, drillPerspectiveKey, navigate, setPerspectiveByKey]);

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
      ?? 'fleet-management';
    writePlanRemediationDrillSession({ perspectiveKey: key });
    setPerspectiveByKey(key);
    navigate(PLANS_LIST_PATH, { replace: true });
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
          <BreadcrumbItem component="button" onClick={navigateBackToPlans}>
            Agentic Plans
          </BreadcrumbItem>
          <BreadcrumbItem component="button" onClick={navigateBackToPlans}>
            Plans
          </BreadcrumbItem>
          <BreadcrumbItem isActive>{planDisplayName}</BreadcrumbItem>
        </Breadcrumb>
      </div>

      <div className="template-page-heading">
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
        <StatusLabel status={plan.status} />
        <div style={{ marginTop: 'var(--pf-t--global--spacer--xs)' }}>
          <WaitingApprovalPlanMeta plan={plan} />
        </div>
      </div>

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

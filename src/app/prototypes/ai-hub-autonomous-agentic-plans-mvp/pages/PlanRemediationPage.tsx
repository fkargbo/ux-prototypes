import React, { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, Flex, FlexItem, Title } from '@patternfly/react-core';
import { useBannerVersionSelection } from '@app/core/bannerVersionPicker';
import { useActivePerspective } from '@app/shared/contexts/ActivePerspectiveContext';
import { config as prototypeConfig } from '../prototype.config';
import {
  buildPlansForPerspective,
  PlanResourceBadge,
  RemediationBlueprintPanel,
  StatusLabel,
  WaitingApprovalPlanMeta,
} from './ai-hub-v3/PlansAndApprovalsTab';
import {
  DRILL_FROM_QUERY_PARAM,
  getPlansListHref,
  isSingleClusterPerspectiveKey,
  resolveDrillPerspectiveKey,
} from './planRemediationDrillSession';
import './ai-hub-page.css';

export const PlanRemediationPage: React.FC = () => {
  const navigate = useNavigate();
  const { planSlug } = useParams<{ planSlug: string }>();
  const [searchParams] = useSearchParams();
  const { activePerspective, setPerspectiveByKey } = useActivePerspective();

  const drillPerspectiveKey = useMemo(
    () => resolveDrillPerspectiveKey(searchParams.get(DRILL_FROM_QUERY_PARAM), activePerspective),
    [activePerspective, searchParams],
  );

  const isSingleCluster = drillPerspectiveKey
    ? isSingleClusterPerspectiveKey(drillPerspectiveKey)
    : activePerspective === 'Core platforms';

  const bannerVersionKey = useBannerVersionSelection(
    prototypeConfig.id,
    prototypeConfig.bannerVersionPicker?.defaultKey ?? 'v3',
  );
  const pageVersionClass = bannerVersionKey === 'v3' ? ' ols-ai-hub-page--v3' : ' ols-ai-hub-page--v2';

  const plan = useMemo(() => {
    if (!planSlug) {
      return null;
    }
    return buildPlansForPerspective(isSingleCluster).find((row) => row.name === planSlug) ?? null;
  }, [isSingleCluster, planSlug]);

  const navigateBackToPlans = useCallback(() => {
    if (drillPerspectiveKey) {
      setPerspectiveByKey(drillPerspectiveKey);
      navigate(getPlansListHref(drillPerspectiveKey));
      return;
    }
    navigate(getPlansListHref('fleet-management'));
  }, [drillPerspectiveKey, navigate, setPerspectiveByKey]);

  useEffect(() => {
    if (drillPerspectiveKey) {
      setPerspectiveByKey(drillPerspectiveKey);
    }
  }, [drillPerspectiveKey, setPerspectiveByKey]);

  useEffect(() => {
    if (!planSlug || !plan) {
      if (drillPerspectiveKey) {
        setPerspectiveByKey(drillPerspectiveKey);
        navigate(getPlansListHref(drillPerspectiveKey), { replace: true });
        return;
      }
      navigate(getPlansListHref('fleet-management'), { replace: true });
    }
  }, [drillPerspectiveKey, navigate, plan, planSlug, setPerspectiveByKey]);

  if (!planSlug || !plan) {
    return null;
  }

  const planDisplayName = plan.name ?? plan.id;

  return (
    <div className={`ols-ai-hub-page${pageVersionClass}`} data-exp-lab-annotation-root>
      <div className="template-page-breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem component="button" onClick={navigateBackToPlans}>
            AI Hub
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

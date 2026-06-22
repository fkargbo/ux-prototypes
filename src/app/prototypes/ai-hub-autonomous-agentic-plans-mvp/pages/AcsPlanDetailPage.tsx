import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Content,
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
} from './ai-hub-v3/PlansAndApprovalsTab';
import {
  buildPrototypeHref,
  perspectiveKeyFromShellName,
  PLANS_LIST_PATH,
  resolveDrillPerspectiveKey,
  writePlanRemediationDrillSession,
} from './planRemediationDrillSession';
import { usePlanBuildRuntime } from '../hooks/usePlanBuildRuntime';
import { AiHubPageHeading } from '../components/AiHubPageHeading';
import { AgenticKillSwitchBanner } from '../components/AgenticKillSwitchBanner';
import { DEFAULT_PROTOTYPE_PERSPECTIVE } from '../prototypePerspectiveUrl';
import './ai-hub-page.css';

/** Stub ACS console view — simulates domain-specific plan detail outside OpenShift console. */
export const AcsPlanDetailPage: React.FC = () => {
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
    ? drillPerspectiveKey === 'core-platforms'
    : activePerspective === 'Core platforms';

  const planExecutionRuntime = usePlanBuildRuntime();

  const plan = useMemo(() => {
    if (!planSlug) {
      return null;
    }
    return buildPlansForPerspective(isSingleCluster, planExecutionRuntime).find(
      (row) => row.name === planSlug,
    ) ?? null;
  }, [isSingleCluster, planSlug, planExecutionRuntime]);

  const navigateBackToPlans = useCallback(() => {
    const key =
      drillPerspectiveKey
      ?? perspectiveKeyFromShellName(activePerspective)
      ?? DEFAULT_PROTOTYPE_PERSPECTIVE;
    writePlanRemediationDrillSession({ perspectiveKey: key });
    setPerspectiveByKey(key);
    navigate(buildPrototypeHref(PLANS_LIST_PATH, key));
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
    const key =
      drillPerspectiveKey
      ?? perspectiveKeyFromShellName(activePerspective)
      ?? DEFAULT_PROTOTYPE_PERSPECTIVE;
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
          <BreadcrumbItem component="button" onClick={navigateBackToPlans}>
            Plans
          </BreadcrumbItem>
          <BreadcrumbItem isActive>Plan details</BreadcrumbItem>
        </Breadcrumb>
      </div>

      <AiHubPageHeading>
        <div className="ols-ai-hub-page-heading-body-content">
          <Alert
            variant="info"
            isInline
            title="Advanced Cluster Security console (prototype stub)"
            style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
          >
            <Content component="p" style={{ margin: 0 }}>
              Security plans open in the ACS console in production. This stub simulates the domain-specific
              detail experience linked from the global Agentic Plans list via annotation-based navigation.
            </Content>
          </Alert>
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            gap={{ default: 'gapSm' }}
            flexWrap={{ default: 'wrap' }}
          >
            <FlexItem>
              <PlanResourceBadge />
            </FlexItem>
            <FlexItem style={{ minWidth: 0 }}>
              <Title headingLevel="h1" size="2xl" style={{ marginBottom: 0, wordBreak: 'break-word' }}>
                {planDisplayName}
              </Title>
            </FlexItem>
            <FlexItem>
              <Label color="purple" variant="outline" isCompact>
                ACS console
              </Label>
            </FlexItem>
          </Flex>
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            gap={{ default: 'gapSm' }}
            style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}
          >
            <StatusLabel status={plan.status} terminatedAt={plan.terminatedAt} />
          </Flex>
        </div>
      </AiHubPageHeading>

      <div className="template-page-content" role="main" aria-label={`ACS plan: ${planDisplayName}`}>
        <AgenticKillSwitchBanner />
        <RemediationBlueprintPanel key={plan.id} plan={plan} />
      </div>
    </div>
  );
};

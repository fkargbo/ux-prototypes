import React, { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, Button, Content, Flex, FlexItem, Title } from '@patternfly/react-core';
import { useActivePerspective } from '@app/shared/contexts/ActivePerspectiveContext';
import { RemediationBlueprintPanel, StatusLabel, type PlanRow } from './ai-hub-v3/PlansAndApprovalsTab';
import {
  findTroubleshootingPlanById,
  readTroubleshootingPlanDrillSession,
  TROUBLESHOOTING_PLANS_LIST_PATH,
} from './ai-hub-v3/troubleshootingPlansRegistry';
import { AiExperienceIcon } from './ai-hub-v3/AiExperienceIcon';
import './ai-hub-page.css';

type TroubleshootingPlanDetailLocationState = {
  plan?: PlanRow;
};

export const TroubleshootingPlanDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { planId } = useParams<{ planId: string }>();
  const { activePerspective } = useActivePerspective();
  const isSingleCluster = activePerspective === 'Core platforms';
  const navigationState = location.state as TroubleshootingPlanDetailLocationState | null;

  const plan = useMemo(() => {
    const decodedPlanId = planId ? decodeURIComponent(planId) : null;

    if (navigationState?.plan) {
      return navigationState.plan;
    }

    if (decodedPlanId) {
      const drilledPlan = readTroubleshootingPlanDrillSession();
      if (drilledPlan?.id === decodedPlanId) {
        return drilledPlan;
      }
      return findTroubleshootingPlanById(decodedPlanId, isSingleCluster) ?? null;
    }

    return null;
  }, [isSingleCluster, navigationState?.plan, planId]);

  if (!planId) {
    return null;
  }

  if (!plan) {
    return (
      <div className="ols-ai-hub-page ols-ai-hub-page--v3" data-exp-lab-annotation-root>
        <div className="create-policy-breadcrumb">
          <Breadcrumb>
            <BreadcrumbItem component="button" onClick={() => navigate(TROUBLESHOOTING_PLANS_LIST_PATH)}>
              Agentic runs
            </BreadcrumbItem>
            <BreadcrumbItem isActive>Run details</BreadcrumbItem>
          </Breadcrumb>
        </div>
        <div style={{ padding: '24px', boxSizing: 'border-box' }}>
          <Content component="p">
            This agentic run could not be found.{' '}
            <Button variant="link" isInline onClick={() => navigate(TROUBLESHOOTING_PLANS_LIST_PATH)}>
              Return to agentic runs
            </Button>
          </Content>
        </div>
      </div>
    );
  }

  return (
    <div className="ols-ai-hub-page ols-ai-hub-page--v3" data-exp-lab-annotation-root>
      <div className="create-policy-breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem component="button" onClick={() => navigate(TROUBLESHOOTING_PLANS_LIST_PATH)}>
            Agentic runs
          </BreadcrumbItem>
          <BreadcrumbItem isActive>Run details</BreadcrumbItem>
        </Breadcrumb>
      </div>

      <div className="create-policy-header">
        <div className="ols-ai-hub-page-header-inner">
          <div className="ols-ai-hub-page-header-primary">
            <AiExperienceIcon size={40} />
            <div className="ols-ai-hub-page-header-copy">
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }}>
                <FlexItem style={{ minWidth: 0 }}>
                  <Title headingLevel="h1" size="2xl" style={{ marginBottom: 0, wordBreak: 'break-word' }}>
                    {plan.synopsis}
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
                  <StatusLabel status={plan.status} />
                </FlexItem>
              </Flex>
            </div>
          </div>
        </div>
      </div>

      <div
        className="ols-plan-remediation-drilldown"
        role="main"
        aria-label={`Agentic run: ${plan.synopsis}`}
        style={{ padding: '24px', boxSizing: 'border-box' }}
      >
        <RemediationBlueprintPanel key={plan.id} plan={plan} />
      </div>
    </div>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Content, Title } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useActivePerspective } from '@app/shared/contexts/ActivePerspectiveContext';
import { AiExperienceIcon } from './ai-hub-v3/AiExperienceIcon';
import {
  getObservabilityTroubleshootingPlans,
  getTroubleshootingPlanDetailHref,
  writeTroubleshootingPlanDrillSession,
} from './ai-hub-v3/troubleshootingPlansRegistry';
import { StatusLabel } from './ai-hub-v3/PlansAndApprovalsTab';
import './ai-hub-page.css';

export const TroubleshootingPlansPage: React.FC = () => {
  const navigate = useNavigate();
  const { activePerspective } = useActivePerspective();
  const isSingleCluster = activePerspective === 'Core platforms';
  const plans = React.useMemo(
    () => getObservabilityTroubleshootingPlans(isSingleCluster),
    [isSingleCluster],
  );

  return (
    <div className="ols-ai-hub-page ols-ai-hub-page--v3 ols-ai-hub-page--list" data-exp-lab-annotation-root>
      <div className="create-policy-header">
        <div className="ols-ai-hub-page-header-inner">
          <div className="ols-ai-hub-page-header-primary">
            <AiExperienceIcon size={40} />
            <div className="ols-ai-hub-page-header-copy">
              <Title headingLevel="h1" size="2xl">
                Troubleshooting plans
              </Title>
              <Content component="p" className="ols-ai-hub-page-subtitle">
                Observability-triggered remediation plans generated from firing platform monitoring alerts —
                scoped to signal correlation, alert root cause, and targeted recovery actions.
              </Content>
              <Content
                component="p"
                className="ols-ai-hub-page-disclaimer"
                style={{ marginTop: 0, marginBottom: 0, fontSize: '12px', color: '#4D4D4D' }}
              >
                Always review AI-generated content prior to use.
              </Content>
            </div>
          </div>
        </div>
      </div>

      <div
        id="ols-troubleshooting-plans-main"
        role="main"
        aria-label="Troubleshooting plans content"
        style={{ padding: '24px', boxSizing: 'border-box' }}
      >
        {plans.length === 0 ? (
          <Content component="p" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
            No troubleshooting plans yet. Start an investigation from an alert in Alerting.
          </Content>
        ) : (
          <Table aria-label="Troubleshooting plans" variant="compact">
            <Thead>
              <Tr>
                <Th>Plan summary</Th>
                <Th>Blast radius</Th>
                <Th>Consolidation scope</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {plans.map((plan) => (
                <Tr key={plan.id}>
                  <Td dataLabel="Plan summary">{plan.synopsis}</Td>
                  <Td dataLabel="Blast radius">{plan.blastRadius}</Td>
                  <Td dataLabel="Consolidation scope">{plan.consolidationScope}</Td>
                  <Td dataLabel="Status">
                    <StatusLabel status={plan.status} />
                  </Td>
                  <Td dataLabel="Action">
                    <Button
                      variant="link"
                      isInline
                      onClick={() => {
                        writeTroubleshootingPlanDrillSession(plan);
                        navigate(getTroubleshootingPlanDetailHref(plan.id, isSingleCluster), { state: { plan } });
                      }}
                    >
                      View plan details
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </div>
    </div>
  );
};

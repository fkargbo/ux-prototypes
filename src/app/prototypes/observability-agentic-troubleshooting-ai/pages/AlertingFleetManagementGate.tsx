import React from 'react';
import { Content, PageSection } from '@patternfly/react-core';
import { useActivePerspective } from '@app/shared/contexts/ActivePerspectiveContext';
import { SummitFleetAlertingPage } from './alerting-fleet-copy/SummitFleetAlertingPage';
import { SummitFleetCreateAlertRulePage } from './alerting-fleet-copy/SummitFleetCreateAlertRulePage';

/**
 * Renders the forked Multi-cluster Alerting **v2** UI only in Fleet management; Core platforms keeps a lightweight stub.
 */
export const AlertingFleetManagementGate: React.FC = () => {
  const { activePerspective } = useActivePerspective();
  if (activePerspective === 'Fleet management') {
    return <SummitFleetAlertingPage />;
  }
  return (
    <PageSection>
      <Content component="p">
        The full multi-cluster Alerting (v2) experience for this prototype is available in the{' '}
        <strong>Fleet management</strong> perspective. Use the platform switcher at the top of the navigation sidebar,
        then open <strong>Observe → Alerting</strong> again.
      </Content>
    </PageSection>
  );
};

export const CreateAlertRuleFleetManagementGate: React.FC = () => {
  const { activePerspective } = useActivePerspective();
  if (activePerspective === 'Fleet management') {
    return <SummitFleetCreateAlertRulePage />;
  }
  return (
    <PageSection>
      <Content component="p">
        Create alert rule is available in the <strong>Fleet management</strong> perspective. Switch perspective in the
        sidebar, then use Alerting → Create a new alert rule.
      </Content>
    </PageSection>
  );
};

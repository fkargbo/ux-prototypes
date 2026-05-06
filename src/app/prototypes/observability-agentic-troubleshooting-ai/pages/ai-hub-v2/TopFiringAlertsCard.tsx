import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Title } from '@patternfly/react-core';
import {
  buildFleetTopFiringAlertRuleRows,
  fleetHubTotalFiringAlertsCount,
  getFleetTopAlertInsightDisplay,
} from '../../components/autonomousAiObserve/data';
import { TopAlertsSection } from '../alerting-fleet-copy/components/TopAlertsSection';
import { OpenShiftLightspeedPanel, type LightspeedInvestigateContext } from '../alerting-fleet-copy/components/OpenShiftLightspeedPanel';

function alertingFleetOverviewHref(options: { alertName?: string }): string {
  const params = new URLSearchParams();
  params.set('tab', 'fleet-overview');
  params.set('scope', 'ai-hub');
  if (options.alertName) {
    params.set('alertName', options.alertName);
  }
  return `/core/observe/alerting?${params.toString()}`;
}

/**
 * v2 fleet hub — same aggregate alert scope as Fleet Summary (`ALERTS` + fleet-wide ingress attributions).
 */
export const TopFiringAlertsCard: React.FC = () => {
  const navigate = useNavigate();

  const alertRuleData = useMemo(() => buildFleetTopFiringAlertRuleRows(), []);
  const totalFiringAlertsCount = useMemo(() => fleetHubTotalFiringAlertsCount(), []);
  const hasAlertData = totalFiringAlertsCount > 0;

  const onAlertRuleClick = useCallback(
    (alertName: string) => {
      navigate(alertingFleetOverviewHref({ alertName }));
    },
    [navigate]
  );

  const onViewAllFiringAlerts = useCallback(() => {
    navigate(alertingFleetOverviewHref({}));
  }, [navigate]);

  const [lightspeedOpen, setLightspeedOpen] = useState(false);
  const [lightspeedContext, setLightspeedContext] = useState<LightspeedInvestigateContext | null>(null);

  const onOpenLightspeed = useCallback((ctx: LightspeedInvestigateContext) => {
    setLightspeedContext(ctx);
    setLightspeedOpen(true);
  }, []);

  const closeLightspeed = useCallback(() => {
    setLightspeedOpen(false);
  }, []);

  const sectionProps = useMemo(
    () => ({
      alertRuleData,
      totalFiringAlertsCount,
      hasAlertData,
      onAlertRuleClick,
      onOpenLightspeed,
      onViewAllFiringAlerts,
      showSectionHeading: false as const,
      getAiInsightCopy: getFleetTopAlertInsightDisplay,
    }),
    [alertRuleData, totalFiringAlertsCount, hasAlertData, onAlertRuleClick, onOpenLightspeed, onViewAllFiringAlerts]
  );

  return (
    <>
      <OpenShiftLightspeedPanel isOpen={lightspeedOpen} onClose={closeLightspeed} context={lightspeedContext} />
      <Card
        className="ols-ai-hub-top-firing-alerts-card"
        isCompact
        component="section"
        aria-label="Top firing alerts"
        style={{ height: '100%', boxSizing: 'border-box' }}
      >
        <CardBody>
          <Title headingLevel="h2" size="lg" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
            Top firing alerts
          </Title>
          <TopAlertsSection {...sectionProps} />
        </CardBody>
      </Card>
    </>
  );
};

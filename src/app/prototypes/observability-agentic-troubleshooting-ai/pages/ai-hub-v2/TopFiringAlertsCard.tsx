import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Title } from '@patternfly/react-core';
import { mockClusters } from '../alerting-fleet-copy/data/mockData';
import { useFleetHealthData } from '../alerting-fleet-copy/data/useFleetHealthData';
import { TopAlertsSection } from '../alerting-fleet-copy/components/TopAlertsSection';
import { OpenShiftLightspeedPanel, type LightspeedInvestigateContext } from '../alerting-fleet-copy/components/OpenShiftLightspeedPanel';

/** v2 fleet hub — same “Top alerts” list as Fleet-wide alert impact on Alerting (mock fleet data). */
export const TopFiringAlertsCard: React.FC = () => {
  const navigate = useNavigate();
  const data = useFleetHealthData(mockClusters, false);

  const onAlertRuleClick = useCallback(
    (alertName: string) => {
      navigate(`/core/observe/alerting?tab=alerts&alertName=${encodeURIComponent(alertName)}`);
    },
    [navigate]
  );

  const onViewAllFiringAlerts = useCallback(() => {
    navigate('/core/observe/alerting?tab=alerts');
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
      alertRuleData: data.alertRuleData,
      totalFiringAlertsCount: data.totalFiringAlertsCount,
      hasAlertData: data.hasAlertData,
      onAlertRuleClick,
      onOpenLightspeed,
      onViewAllFiringAlerts,
      showSectionHeading: false as const,
    }),
    [data.alertRuleData, data.totalFiringAlertsCount, data.hasAlertData, onAlertRuleClick, onOpenLightspeed, onViewAllFiringAlerts]
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

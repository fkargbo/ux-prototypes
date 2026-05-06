import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardBody, CardExpandableContent, CardHeader, CardTitle } from '@patternfly/react-core';
import {
  buildFleetTopFiringAlertRuleRows,
  fleetHubTotalFiringAlertsCount,
  getFleetTopAlertInsightDisplay,
} from '../../components/autonomousAiObserve/data';
import { TopAlertsSection } from '../alerting-fleet-copy/components/TopAlertsSection';
import { OpenShiftLightspeedPanel, type LightspeedInvestigateContext } from '../alerting-fleet-copy/components/OpenShiftLightspeedPanel';

const TOP_FIRING_CARD_ID = 'ols-ai-hub-top-firing-alerts';

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

  const [expanded, setExpanded] = useState(true);

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
      alertActionsLayout: 'ai-hub' as const,
      showViewAllFiringAlertsFooter: false as const,
    }),
    [alertRuleData, totalFiringAlertsCount, hasAlertData, onAlertRuleClick, onOpenLightspeed, onViewAllFiringAlerts]
  );

  return (
    <>
      <OpenShiftLightspeedPanel isOpen={lightspeedOpen} onClose={closeLightspeed} context={lightspeedContext} />
      <Card
        className="ols-aio-subcard ols-aio-fleet-pair-card ols-ai-hub-top-firing-alerts-card"
        isCompact
        component="section"
        isExpanded={expanded}
        id={TOP_FIRING_CARD_ID}
        aria-label="Top firing alerts"
        style={{ boxSizing: 'border-box' }}
      >
        <CardHeader
          onExpand={() => setExpanded((v) => !v)}
          toggleButtonProps={{
            id: `${TOP_FIRING_CARD_ID}-toggle`,
            'aria-label': 'Toggle Top firing alerts section',
          }}
          actions={
            totalFiringAlertsCount > 0
              ? {
                  actions: (
                    <Button
                      variant="link"
                      isInline
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewAllFiringAlerts();
                      }}
                      aria-label={`View all firing alerts, ${totalFiringAlertsCount} total`}
                    >
                      View all firing alerts ({totalFiringAlertsCount})
                    </Button>
                  ),
                }
              : undefined
          }
        >
          <CardTitle component="h3" className="ols-aio-fleet-subcard-title">
            Top firing alerts
          </CardTitle>
        </CardHeader>
        <CardExpandableContent>
          <CardBody>
            <TopAlertsSection {...sectionProps} />
          </CardBody>
        </CardExpandableContent>
      </Card>
    </>
  );
};

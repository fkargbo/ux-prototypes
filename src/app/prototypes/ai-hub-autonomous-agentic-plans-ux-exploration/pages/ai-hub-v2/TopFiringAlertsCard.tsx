import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardBody, CardExpandableContent, CardHeader, CardTitle, Label } from '@patternfly/react-core';
import {
  ALERTS,
  FLEET_WIDE_REGIONAL_INGRESS,
  buildClusterTopFiringAlertRuleRows,
  buildFleetTopFiringAlertRuleRows,
  clusterHubTotalFiringAlertsCount,
  fleetHubTotalFiringAlertsCount,
  getFleetTopAlertInsightDisplay,
} from '../../components/autonomousAiObserve/data';
import { TopAlertsSection } from '../alerting-fleet-copy/components/TopAlertsSection';
import type { LightspeedInvestigateContext } from '../alerting-fleet-copy/components/OpenShiftLightspeedPanel';
import { agenticGlobalAiApi } from '../../persesAgenticBridge';
import { dispatchRemediationDrill } from '../../components/autonomousAiObserve/remediationDrillSession';

const TOP_FIRING_CARD_ID = 'ols-ai-hub-top-firing-alerts';

function alertingHref(options: {
  tab: 'alerts' | 'fleet-overview';
  alertName?: string;
  clusterId?: string;
}): string {
  const params = new URLSearchParams();
  params.set('tab', options.tab);
  params.set('scope', 'ai-hub');
  if (options.alertName) {
    params.set('alertName', options.alertName);
  }
  if (options.clusterId) {
    params.set('cluster', options.clusterId);
  }
  return `/core/observe/alerting?${params.toString()}`;
}

export type TopFiringAlertsCardProps = {
  /** When set, rows and counts are scoped to this cluster (Core platforms hub). */
  clusterId?: string;
};

/**
 * v2 AI Hub — fleet scope matches Fleet Summary; cluster scope uses `getAlertsForCluster` attribution.
 */
export const TopFiringAlertsCard: React.FC<TopFiringAlertsCardProps> = ({ clusterId }) => {
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState(true);

  const alertRuleData = useMemo(
    () => (clusterId ? buildClusterTopFiringAlertRuleRows(clusterId) : buildFleetTopFiringAlertRuleRows()),
    [clusterId]
  );
  const totalFiringAlertsCount = useMemo(
    () => (clusterId ? clusterHubTotalFiringAlertsCount(clusterId) : fleetHubTotalFiringAlertsCount()),
    [clusterId]
  );
  const hasAlertData = totalFiringAlertsCount > 0;

  const onAlertRuleClick = useCallback(
    (alertName: string) => {
      navigate(alertingHref({ tab: 'alerts', alertName, clusterId }));
    },
    [navigate, clusterId]
  );

  const onViewAllFiringAlerts = useCallback(() => {
    navigate(alertingHref({ tab: clusterId ? 'alerts' : 'fleet-overview', clusterId }));
  }, [navigate, clusterId]);

  const onViewRemediation = useCallback((ruleName: string) => {
    dispatchRemediationDrill({ alertRuleTitle: ruleName });
  }, []);

  const onOpenLightspeed = useCallback((ctx: LightspeedInvestigateContext) => {
    const directAlert = ALERTS.find((a) => a.title === ctx.sourceName);
    const fleetWideMatch = FLEET_WIDE_REGIONAL_INGRESS.title === ctx.sourceName ? FLEET_WIDE_REGIONAL_INGRESS : null;
    const alertId = directAlert?.id ?? fleetWideMatch?.id ?? null;

    if (alertId) {
      agenticGlobalAiApi.openDiscussWithLightspeed?.({
        alertId,
        cardId: 'rca',
        diagnosisName: 'Root cause analysis',
      });
      return;
    }

    // Fallback for unexpected rows so the CTA still opens AI assistance.
    agenticGlobalAiApi.startTroubleshootingForAlert?.(ctx.sourceName);
  }, []);

  const sectionProps = useMemo(
    () => ({
      alertRuleData,
      totalFiringAlertsCount,
      hasAlertData,
      onAlertRuleClick,
      onOpenLightspeed,
      onViewRemediation,
      onViewAllFiringAlerts,
      showSectionHeading: false as const,
      getAiInsightCopy: getFleetTopAlertInsightDisplay,
      alertActionsLayout: 'ai-hub' as const,
      showViewAllFiringAlertsFooter: false as const,
    }),
    [alertRuleData, totalFiringAlertsCount, hasAlertData, onAlertRuleClick, onOpenLightspeed, onViewRemediation, onViewAllFiringAlerts]
  );

  return (
    <>
      <Card
        className="ols-aio-subcard ols-aio-fleet-pair-card ols-ai-hub-top-firing-alerts-card ols-autonomous-ai-observe-widget-v2-top-firing"
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--pf-t--global--spacer--sm)', flexWrap: 'wrap' }}>
            <CardTitle component="h3" className="ols-aio-fleet-subcard-title">
              Top firing alerts
            </CardTitle>
            <Label color="blue" isCompact>
              {alertRuleData.length} top firing alert{alertRuleData.length === 1 ? '' : 's'}
            </Label>
          </div>
        </CardHeader>
        <CardExpandableContent>
          <CardBody>
            {/*
              Scope for autonomous-ai-observe.css: TopAlertsSection uses inline primary/secondary backgrounds
              from fleetInsightsConfig — override to transparent inside translucent v2 cards.
            */}
            <div className="ols-aio-top-firing-translucent-scope">
              <TopAlertsSection {...sectionProps} />
            </div>
          </CardBody>
        </CardExpandableContent>
      </Card>
    </>
  );
};

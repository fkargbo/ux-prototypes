import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CLUSTERS,
  buildClusterTopFiringAlertRuleRows,
  buildFleetTopFiringAlertRuleRows,
  type FleetTopAlertRuleRow,
} from '../../components/autonomousAiObserve/data';
import {
  TopFiringAlertsCard as TopFiringAlertsCardBase,
  type AlertRule,
  type Severity,
} from '../../../../../components/TopFiringAlertsCard';

// ─── Data adapter ─────────────────────────────────────────────────────────────

/**
 * Maps `FleetTopAlertRuleRow` → `AlertRule`.
 *
 * Impact is AI-synthesised: primarily driven by blast-radius percentage
 * (clusters affected ÷ total fleet) with a severity bonus, so that a
 * rule affecting 94 % of production with 3 critical instances scores
 * higher than one with 842 warning instances on 12 % of non-prod nodes.
 * This contrast makes the Impact ↔ Firing-volume sort switch meaningful.
 */
function adaptRows(rows: FleetTopAlertRuleRow[]): AlertRule[] {
  const totalClusters = CLUSTERS.length;

  return rows.map((row) => {
    const firingInstances = row.critical + row.warning + row.info;

    const severity: Severity =
      row.critical > 0 ? 'critical' : row.warning > 0 ? 'warning' : 'info';

    const scopePercent =
      totalClusters > 0
        ? Math.min(100, Math.round((row.clusters.length / totalClusters) * 100))
        : 0;

    // AI-synthesised score: blast radius is the primary signal; severity adds bonus weight.
    const severityBonus = severity === 'critical' ? 25 : severity === 'warning' ? 10 : 0;
    const impact = Math.min(100, Math.round(scopePercent * 0.75 + severityBonus));

    const scopeLabel =
      row.clusters.length === 0
        ? 'No clusters'
        : row.clusters.length === 1
        ? row.clusters[0]
        : `${row.clusters.length} of ${totalClusters} clusters`;

    return {
      id: row.name,
      severity,
      name: row.name,
      impact,
      firingInstances,
      scopeLabel,
      scopePercent,
    };
  });
}

function alertingHref(options: {
  tab: 'alerts' | 'fleet-overview';
  alertName?: string;
  clusterId?: string;
}): string {
  const params = new URLSearchParams();
  params.set('tab', options.tab);
  params.set('scope', 'ai-hub');
  if (options.alertName) params.set('alertName', options.alertName);
  if (options.clusterId) params.set('cluster', options.clusterId);
  return `/core/observe/alerting?${params.toString()}`;
}

// ─── v3 wrapper ───────────────────────────────────────────────────────────────

export type TopFiringAlertsCardProps = {
  /** When set, rows and counts are scoped to this cluster (Core platforms hub). */
  clusterId?: string;
};

export const TopFiringAlertsCard: React.FC<TopFiringAlertsCardProps> = ({ clusterId }) => {
  const navigate = useNavigate();

  const rawRows = useMemo(
    () =>
      clusterId
        ? buildClusterTopFiringAlertRuleRows(clusterId)
        : buildFleetTopFiringAlertRuleRows(),
    [clusterId],
  );

  const alerts = useMemo(() => adaptRows(rawRows), [rawRows]);

  const onAlertClick = useCallback(
    (id: string) => {
      navigate(alertingHref({ tab: 'alerts', alertName: id, clusterId }));
    },
    [navigate, clusterId],
  );

  const onViewAll = useCallback(() => {
    navigate(alertingHref({ tab: clusterId ? 'alerts' : 'fleet-overview', clusterId }));
  }, [navigate, clusterId]);

  return (
    <TopFiringAlertsCardBase
      alerts={alerts}
      onAlertClick={onAlertClick}
      onViewAll={onViewAll}
      statusLabel="Storm mitigation active"
      subtitle="AI-ranked by blast radius across your fleet"
      className="ols-aio-subcard ols-aio-fleet-pair-card ols-autonomous-ai-observe-widget-v3-top-firing"
      style={{ boxSizing: 'border-box' }}
    />
  );
};

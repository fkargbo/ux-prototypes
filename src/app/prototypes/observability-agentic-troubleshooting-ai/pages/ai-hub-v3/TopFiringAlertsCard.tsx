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
 * Maps `FleetTopAlertRuleRow` (internal mock data shape) to the `AlertRule`
 * interface expected by the shared `TopFiringAlertsCard` component.
 *
 * - `severity` is derived from the highest-priority count present.
 * - `impact` is an AI-proxy score weighted by severity counts (0–100).
 * - `scopePercent` is the real blast-radius percentage: clusters affected / total fleet.
 * - `scopeLabel` is a human-readable cluster summary.
 */
function adaptRows(rows: FleetTopAlertRuleRow[]): AlertRule[] {
  const totalClusters = CLUSTERS.length;

  return rows.map((row) => {
    const firingInstances = row.critical + row.warning + row.info;

    const severity: Severity =
      row.critical > 0 ? 'critical' : row.warning > 0 ? 'warning' : 'info';

    const impact = Math.min(100, row.critical * 15 + row.warning * 6 + row.info * 2);

    const scopePercent =
      totalClusters > 0
        ? Math.min(100, Math.round((row.clusters.length / totalClusters) * 100))
        : 0;

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
    () => (clusterId ? buildClusterTopFiringAlertRuleRows(clusterId) : buildFleetTopFiringAlertRuleRows()),
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
      className="ols-aio-subcard ols-aio-fleet-pair-card ols-autonomous-ai-observe-widget-v3-top-firing"
      style={{ boxSizing: 'border-box' }}
    />
  );
};

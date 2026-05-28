import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  buildClusterTopFiringAlertRuleRows,
  type FleetTopAlertRuleRow,
} from '../../components/autonomousAiObserve/data';
import { AI_EXPERIENCE_ICON_DATA_URL } from '../../components/autonomousAiObserve/aiExperienceIconUrl';
import {
  TopFiringAlertsCard as TopFiringAlertsCardBase,
  type AlertRule,
} from '../../../../../components/TopFiringAlertsCard';

// ─── Fleet aggregated rows (simulation) ───────────────────────────────────────

/**
 * Three aggregated alert rules representing fleet-wide blast-radius rollups.
 * Impact scores are AI-synthesised: blast radius × severity bonus.
 * Firing counts aggregate across all affected clusters.
 */
const FLEET_AGGREGATED_ALERTS: AlertRule[] = [
  {
    id: 'api_gateway_down',
    severity: 'critical',
    name: 'api_gateway_down',
    impact: 98,
    firingInstances: 3,
    scopeLabel: '94% of production fleet',
    scopePercent: 94,
  },
  {
    id: 'auth_service_latency_spike',
    severity: 'critical',
    name: 'auth_service_latency_spike',
    impact: 72,
    firingInstances: 45,
    scopeLabel: '2 / 3 clusters · US-East',
    scopePercent: 66,
  },
  {
    id: 'node_disk_near_full',
    severity: 'warning',
    name: 'node_disk_near_full',
    impact: 20,
    firingInstances: 842,
    scopeLabel: '12% of non-prod nodes',
    scopePercent: 12,
  },
];

// ─── Cluster adapter (used when scoped to a single cluster) ───────────────────

import { CLUSTERS } from '../../components/autonomousAiObserve/data';

function adaptClusterRows(rows: FleetTopAlertRuleRow[]): AlertRule[] {
  const totalClusters = CLUSTERS.length;
  return rows.slice(0, 3).map((row) => {
    const firingInstances = row.critical + row.warning + row.info;
    const severity = row.critical > 0 ? 'critical' as const : row.warning > 0 ? 'warning' as const : 'info' as const;
    const scopePercent = totalClusters > 0
      ? Math.min(100, Math.round((row.clusters.length / totalClusters) * 100))
      : 0;
    const severityBonus = severity === 'critical' ? 25 : severity === 'warning' ? 10 : 0;
    const impact = Math.min(100, Math.round(scopePercent * 0.75 + severityBonus));
    const scopeLabel = row.clusters.length === 0
      ? 'No clusters'
      : row.clusters.length === 1
      ? row.clusters[0]
      : `${row.clusters.length} of ${totalClusters} clusters`;
    return { id: row.name, severity, name: row.name, impact, firingInstances, scopeLabel, scopePercent };
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

  const alerts = clusterId
    ? adaptClusterRows(buildClusterTopFiringAlertRuleRows(clusterId))
    : FLEET_AGGREGATED_ALERTS;

  const onAlertClick = useCallback(
    (id: string) => {
      navigate(alertingHref({ tab: 'alerts', alertName: id, clusterId }));
    },
    [navigate, clusterId],
  );

  const onViewAll = useCallback(() => {
    navigate(alertingHref({ tab: clusterId ? 'alerts' : 'fleet-overview', clusterId }));
  }, [navigate, clusterId]);

  const aiIconElement = (
    <img
      src={AI_EXPERIENCE_ICON_DATA_URL}
      alt=""
      aria-hidden="true"
      width={14}
      height={14}
      style={{ display: 'block', flexShrink: 0 }}
    />
  );

  return (
    <TopFiringAlertsCardBase
      alerts={alerts}
      onAlertClick={onAlertClick}
      onViewAll={onViewAll}
      statusLabel="Storm mitigation active"
      subtitle="AI-ranked by blast radius across your fleet"
      aiIconElement={aiIconElement}
      className="ols-aio-subcard ols-aio-fleet-pair-card ols-autonomous-ai-observe-widget-v3-top-firing"
      style={{ boxSizing: 'border-box' }}
    />
  );
};

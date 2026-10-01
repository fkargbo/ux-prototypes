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
 * Three aggregated alert rules derived from fleet simulation data.
 * Impact scores are AI-synthesised: blast radius (clusters affected ÷ 7 total)
 * weighted by severity bonus. Firing counts aggregate across all affected clusters.
 *
 * Order: RegionalIngressFailure is pinned first (fleet-wide ingress incident),
 * then ranked by AI impact score descending.
 */
/**
 * Firing counts are intentionally skewed vs. impact scores so the
 * Impact ↔ Firing-volume sort switch produces a meaningfully different
 * ordering — demonstrating that noisy, low-blast-radius alerts don't
 * automatically deserve the top slot.
 *
 * By impact:  RegionalIngressFailure (94) → PaymentsAPI5xxSurge (72) → EtcdDiskPressureOnMaster2 (43)
 * By volume:  EtcdDiskPressureOnMaster2 (312) → PaymentsAPI5xxSurge (148) → RegionalIngressFailure (5)
 */
const FLEET_AGGREGATED_ALERTS: AlertRule[] = [
  {
    id: 'RegionalIngressFailure',
    severity: 'critical',
    name: 'RegionalIngressFailure',
    // 5 of 7 clusters affected — fleet-wide correlated incident, few distinct rule firings
    impact: 94,
    firingInstances: 5,
    scopeLabel: '5 of 7 clusters · US-East',
    scopePercent: 71,
  },
  {
    id: 'PaymentsAPI5xxSurge',
    severity: 'critical',
    name: 'PaymentsAPI5xxSurge',
    // 4 of 7 clusters; high business criticality, sustained 5xx across payment path
    impact: 72,
    firingInstances: 148,
    scopeLabel: '4 of 7 clusters',
    scopePercent: 57,
  },
  {
    id: 'EtcdDiskPressureOnMaster2',
    severity: 'critical',
    name: 'EtcdDiskPressureOnMaster2',
    // 3 of 7 clusters; disk pressure fires constantly per node — noisy but localized
    impact: 43,
    firingInstances: 312,
    scopeLabel: '3 of 7 clusters',
    scopePercent: 43,
  },
];

// ─── Cluster adapter (used when scoped to a single cluster) ───────────────────

/** Namespace / workload scope labels for Core platforms top-firing rows on prod-east-2. */
const CLUSTER_ALERT_SCOPE_LABELS: Record<string, string> = {
  IngressControllerDegraded: 'openshift-ingress · router-default',
  PaymentsAPI5xxSurge: 'payments-prod · 4 pods',
  EtcdDiskPressureOnMaster2: 'openshift-etcd · master-2',
  KubePodCrashLooping: 'payments-prod · payment-api',
  IngressControllerMinReplicasNotMet: 'openshift-ingress · 2 router pods',
};

function adaptClusterRows(rows: FleetTopAlertRuleRow[]): AlertRule[] {
  return rows.slice(0, 3).map((row) => {
    const firingInstances = row.critical + row.warning + row.info;
    const severity = row.critical > 0 ? 'critical' as const : row.warning > 0 ? 'warning' as const : 'info' as const;
    const scopeLabel = CLUSTER_ALERT_SCOPE_LABELS[row.name] ?? row.name;
    const severityBonus = severity === 'critical' ? 25 : severity === 'warning' ? 10 : 0;
    const namespaceScopePct = Math.min(100, 40 + firingInstances * 2 + severityBonus);
    const impact = Math.min(100, Math.round(namespaceScopePct * 0.75 + severityBonus));
    return { id: row.name, severity, name: row.name, impact, firingInstances, scopeLabel, scopePercent: namespaceScopePct };
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
      subtitle="AI-ranked by blast radius across your fleet"
      aiIconElement={aiIconElement}
      className="ols-aio-subcard ols-aio-fleet-pair-card ols-autonomous-ai-observe-widget-v3-top-firing"
      style={{ boxSizing: 'border-box' }}
    />
  );
};

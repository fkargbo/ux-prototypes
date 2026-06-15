/**
 * Mock aggregates for v3 AI Hub inventory bars only (`pages/ai-hub-v3/*`).
 * Keeps `components/autonomousAiObserve/data.ts` free of hub-specific totals for cleaner v1 / v2 / v3 separation.
 */
import type { ClusterRecord, ClusterHealth } from '../../components/autonomousAiObserve/data';
import {
  CLUSTERS,
  ALERTS,
  fleetHubTotalFiringAlertsCount,
  fleetCriticalAttributionCount,
  getAlertsForCluster,
  getClusterById,
} from '../../components/autonomousAiObserve/data';

export const FLEET_INVENTORY_NAMESPACE_TOTAL = 312;
export const FLEET_INVENTORY_WORKLOAD_TOTAL = 1847;

export interface FleetInventoryMetrics {
  clusters: number;
  nodes: number;
  namespaces: number;
  workloads: number;
  alerts: number;
}

export function getFleetInventoryMetrics(): FleetInventoryMetrics {
  return {
    clusters: CLUSTERS.length,
    nodes: CLUSTERS.reduce((sum, c) => sum + c.nodes, 0),
    namespaces: FLEET_INVENTORY_NAMESPACE_TOTAL,
    workloads: FLEET_INVENTORY_WORKLOAD_TOTAL,
    /** Matches Fleet Summary / Top firing alerts (`ALERTS` + fleet-wide ingress attributions). */
    alerts: fleetHubTotalFiringAlertsCount(),
  };
}

export interface ClusterInventoryMetrics {
  cluster: ClusterRecord;
  nodes: number;
  namespaces: number;
  workloads: number;
  alertCount: number;
  criticalAlertCount: number;
  warningAlertCount: number;
  infoAlertCount: number;
}

export function getClusterInventoryMetrics(clusterId: string): ClusterInventoryMetrics | null {
  const cluster = getClusterById(clusterId);
  if (!cluster) {
    return null;
  }
  const alerts = getAlertsForCluster(clusterId);
  const namespaces = Math.round(36 + cluster.nodes * 2.15);
  const workloads = Math.round(namespaces * 4.05);
  return {
    cluster,
    nodes: cluster.nodes,
    namespaces,
    workloads,
    alertCount: alerts.length,
    criticalAlertCount: alerts.filter((a) => a.severity === 'critical').length,
    warningAlertCount: alerts.filter((a) => a.severity === 'warning').length,
    infoAlertCount: alerts.filter((a) => a.severity === 'info').length,
  };
}

// ─── Diagnostics metrics (v3 DiagnosticsSummaryCard) ─────────────────────────

export interface FleetDiagnosticsMetrics {
  clustersAffected: number;
  clustersTotal: number;
  criticalAlerts: number;
  /** Total active Plans across the fleet, summed per cluster per failure domain. */
  activeInvestigations: number;
  /** Clusters with agentStatus 'remediating' — AI fix ready to execute. */
  readyRemediations: number;
  /** AI-synthesized estimate of cumulative MTTR reduction across the fleet. */
  estMttrSaved: string;
}

/**
 * Returns the number of active Plans for a single cluster.
 *
 * A Plan encapsulates one independent failure domain (Input → Diagnosis → Output).
 * Critical clusters can have multiple concurrent failure domains and therefore multiple Plans:
 *   - critical + escalated  → 3 plans
 *   - critical + other      → 2 plans
 *   - degraded              → 1 plan
 *   - healthy               → 0 plans
 *
 * This is the single source of truth shared by both the DiagnosticsSummaryCard KPI
 * and the ActivePlansTable per-row plan counts.
 */
export function derivePlanCount(c: { health: ClusterHealth; agentStatus: string }): number {
  if (c.health === 'healthy') return 0;
  if (c.health === 'critical') return c.agentStatus === 'escalated' ? 3 : 2;
  return 1;
}

/** Sum of all active Plans across the entire fleet. */
export function getFleetActivePlanCount(): number {
  return CLUSTERS.reduce((sum, c) => sum + derivePlanCount(c), 0);
}

/**
 * Total critical alert firing instances across the fleet, derived from
 * FLEET_AGGREGATED_ALERTS in pages/ai-hub-v3/TopFiringAlertsCard.tsx:
 *   RegionalIngressFailure (5) + PaymentsAPI5xxSurge (148) + EtcdDiskPressureOnMaster2 (312)
 * Update this constant whenever FLEET_AGGREGATED_ALERTS firing counts change.
 */
export const FLEET_CRITICAL_FIRING_TOTAL = 465;

export function getFleetDiagnosticsMetrics(): FleetDiagnosticsMetrics {
  return {
    clustersAffected: CLUSTERS.filter((c) => c.health !== 'healthy').length,
    clustersTotal: CLUSTERS.length,
    criticalAlerts: FLEET_CRITICAL_FIRING_TOTAL,
    activeInvestigations: getFleetActivePlanCount(),
    // Match the fleet investigations panel: all per-cluster ALERTS + 1 for the
    // fleet-wide regional ingress incident card shown at the top of that panel.
    readyRemediations: ALERTS.length + 1,
    estMttrSaved: '4.5 hrs',
  };
}

export interface ClusterDiagnosticsMetrics {
  clusterName: string;
  clusterStatus: ClusterHealth;
  criticalAlerts: number;
  activeInvestigations: number;
  readyRemediations: number;
  /** AI-synthesized estimate of MTTR reduction for this cluster. */
  estMttrSaved: string;
}

export function getClusterDiagnosticsMetrics(clusterId: string): ClusterDiagnosticsMetrics | null {
  const cluster = getClusterById(clusterId);
  if (!cluster) return null;
  const alerts = getAlertsForCluster(clusterId);
  const criticalAlerts = alerts.filter((a) => a.severity === 'critical').length;
  const investigatingFromAlerts = alerts.filter(
    (a) => a.agentStatus === 'investigating' || a.agentStatus === 'escalated',
  ).length;
  const remediatingFromAlerts = alerts.filter((a) => a.agentStatus === 'remediating').length;
  const activeInvestigations = Math.max(
    investigatingFromAlerts,
    cluster.agentStatus === 'investigating' || cluster.agentStatus === 'escalated' ? 1 : 0,
  );
  return {
    clusterName: cluster.name,
    clusterStatus: cluster.health,
    criticalAlerts,
    activeInvestigations,
    readyRemediations: Math.max(
      remediatingFromAlerts,
      cluster.agentStatus === 'remediating' ? 1 : 0,
    ),
    estMttrSaved: activeInvestigations > 0 ? '~1.2 hrs' : '—',
  };
}

// ─── Signal Compression Chart data ───────────────────────────────────────────

export interface SignalCompressionPoint {
  name: string;
  /** Day-of-week label shown on the x-axis. */
  x: string;
  y: number;
}

/**
 * Derives 7-day Signal Compression Chart data from live simulation values so the
 * Wednesday peak always matches the numbers shown in the Fleet health & diagnostics KPI bar:
 *   - Raw signals peak  = criticalAlerts  (FLEET_CRITICAL_FIRING_TOTAL, currently 465)
 *   - AI plans peak     = readyRemediations (ALERTS.length + 1, currently 23)
 *
 * Mon–Tue are pre-storm baselines; Thu–Sun show post-remediation decay.
 * All proportions are derived from the peak so the chart stays coherent if
 * the underlying simulation data ever changes.
 */
export function getSignalCompressionChartData(): {
  rawSignalsData: SignalCompressionPoint[];
  aiPlansData: SignalCompressionPoint[];
  wednesdayRaw: number;
  wednesdayPlans: number;
} {
  const { criticalAlerts: wednesdayRaw, readyRemediations: wednesdayPlans } =
    getFleetDiagnosticsMetrics();

  const raw = (ratio: number) => Math.max(1, Math.round(wednesdayRaw * ratio));
  const plans = (ratio: number) => Math.max(1, Math.round(wednesdayPlans * ratio));

  return {
    wednesdayRaw,
    wednesdayPlans,
    rawSignalsData: [
      { name: 'Raw signals', x: 'Mon', y: raw(0.08) },  // ~37  — normal ops
      { name: 'Raw signals', x: 'Tue', y: raw(0.11) },  // ~51  — early precursors
      { name: 'Raw signals', x: 'Wed', y: wednesdayRaw }, // 465 — incident storm peak
      { name: 'Raw signals', x: 'Thu', y: raw(0.22) },  // ~102 — post-storm, remediating
      { name: 'Raw signals', x: 'Fri', y: raw(0.12) },  // ~56  — recovering
      { name: 'Raw signals', x: 'Sat', y: raw(0.07) },  // ~33  — near baseline
      { name: 'Raw signals', x: 'Sun', y: raw(0.08) },  // ~37  — stable
    ],
    aiPlansData: [
      { name: 'AI plans', x: 'Mon', y: plans(0.18) },   // ~4
      { name: 'AI plans', x: 'Tue', y: plans(0.22) },   // ~5
      { name: 'AI plans', x: 'Wed', y: wednesdayPlans }, // 23  — peak consolidation
      { name: 'AI plans', x: 'Thu', y: plans(0.78) },   // ~18 — resolution in progress
      { name: 'AI plans', x: 'Fri', y: plans(0.52) },   // ~12 — mostly resolved
      { name: 'AI plans', x: 'Sat', y: plans(0.30) },   // ~7
      { name: 'AI plans', x: 'Sun', y: plans(0.26) },   // ~6
    ],
  };
}

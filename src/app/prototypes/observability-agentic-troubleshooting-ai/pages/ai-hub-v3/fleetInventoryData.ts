/**
 * Mock aggregates for v3 AI Hub inventory bars only (`pages/ai-hub-v3/*`).
 * Keeps `components/autonomousAiObserve/data.ts` free of hub-specific totals for cleaner v1 / v2 / v3 separation.
 */
import type { ClusterRecord, ClusterHealth } from '../../components/autonomousAiObserve/data';
import {
  CLUSTERS,
  ALERTS,
  FLEET_WIDE_REGIONAL_INGRESS,
  fleetHubTotalFiringAlertsCount,
  fleetCriticalAttributionCount,
  fleetWideCriticalAddsForCluster,
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
  /** Clusters with agentStatus 'investigating' or 'escalated'. */
  activeInvestigations: number;
  /** Clusters with agentStatus 'remediating' — AI fix ready to execute. */
  readyRemediations: number;
  /** AI-synthesized estimate of cumulative MTTR reduction across the fleet. */
  estMttrSaved: string;
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
    activeInvestigations: CLUSTERS.filter(
      (c) => c.agentStatus === 'investigating' || c.agentStatus === 'escalated',
    ).length,
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
  const criticalAlerts =
    alerts.filter((a) => a.severity === 'critical').length +
    fleetWideCriticalAddsForCluster(clusterId);
  const fleetWideIsActive =
    fleetWideCriticalAddsForCluster(clusterId) > 0 &&
    FLEET_WIDE_REGIONAL_INGRESS.agentStatus !== 'idle';
  const investigatingFromAlerts =
    alerts.filter((a) => a.agentStatus === 'investigating' || a.agentStatus === 'escalated')
      .length + (fleetWideIsActive ? 1 : 0);
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

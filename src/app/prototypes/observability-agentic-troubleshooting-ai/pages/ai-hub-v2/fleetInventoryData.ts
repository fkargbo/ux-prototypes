/**
 * Mock aggregates for v2 AI Hub inventory bars only (`pages/ai-hub-v2/*`).
 * Keeps `components/autonomousAiObserve/data.ts` free of hub-specific totals for cleaner v1 / v2 separation.
 */
import type { ClusterRecord } from '../../components/autonomousAiObserve/data';
import {
  ALERTS,
  CLUSTERS,
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
    alerts: ALERTS.length,
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

/**
 * Core platforms infrastructure ledger — nodes + platform operators only (no user workloads).
 * Rows derive from cluster context and `SimulationSnapshot` for scenario-aware investigations.
 */
import type { SimulationSnapshot } from '../../simulation/simulationTypes';
import {
  ALERTS,
  getAlertsForCluster,
  getClusterById,
  type AlertRecord,
} from '../../components/autonomousAiObserve/data';

export type NodeComponentAssetKind = 'node' | 'component';

export type NodeComponentStatusLabel = 'Ready' | 'NotReady' | 'SchedulingDisabled' | 'Healthy' | 'Degraded';

export interface NodeComponentInvestigation {
  summary: string;
}

export interface NodeComponentSummaryRow {
  id: string;
  kind: NodeComponentAssetKind;
  name: string;
  typeLabel: string;
  status: NodeComponentStatusLabel;
  cpuUtilPct: number;
  cpuRecommendedPct: number;
  memUtilPct: number;
  memRecommendedPct: number;
  investigation: NodeComponentInvestigation | null;
  alertCount: number;
  zone: string;
  diagnosticLogs: string[];
  metricsSummary: string;
}

const PLATFORM_SERVICE_PREFIXES = [
  'openshift-',
  'openshift-ingress',
  'openshift-etcd',
  'openshift-monitoring',
  'cluster-',
  'kube-',
];

function isPlatformService(service: string): boolean {
  const s = service.toLowerCase();
  if (s.startsWith('payments') || s.startsWith('marketing') || s.startsWith('checkout')) {
    return false;
  }
  return PLATFORM_SERVICE_PREFIXES.some((p) => s.includes(p));
}

function alertCountForComponent(alerts: AlertRecord[], componentKey: string): number {
  const key = componentKey.toLowerCase();
  return alerts.filter((a) => {
    const svc = a.service.toLowerCase();
    return svc.includes(key) || a.title.toLowerCase().includes(key.replace(/-/g, ''));
  }).length;
}

function buildNodeRows(clusterId: string, snap: SimulationSnapshot): NodeComponentSummaryRow[] {
  const cluster = getClusterById(clusterId);
  if (!cluster) {
    return [];
  }

  const regionBase = cluster.region.replace(/^([a-z]+-[a-z]+-\d+).*/, '$1') || cluster.region;
  const zones = [`${regionBase}a`, `${regionBase}b`, `${regionBase}c`];

  const masterStatuses: NodeComponentStatusLabel[] =
    cluster.health === 'critical' ? ['Ready', 'NotReady', 'Ready'] : ['Ready', 'Ready', 'Ready'];
  const workerStatuses: NodeComponentStatusLabel[] =
    cluster.health === 'degraded'
      ? ['Ready', 'SchedulingDisabled', 'Ready', 'Ready']
      : cluster.health === 'critical'
        ? ['Ready', 'NotReady', 'Ready', 'Ready']
        : ['Ready', 'Ready', 'Ready', 'Ready'];

  const masters: NodeComponentSummaryRow[] = [0, 1, 2].map((i) => ({
    id: `node-master-${i}-${clusterId}`,
    kind: 'node',
    name: `master-${i + 1}.${cluster.name}`,
    typeLabel: 'Master',
    status: masterStatuses[i] ?? 'Ready',
    cpuUtilPct: 34 + i * 8,
    cpuRecommendedPct: 55,
    memUtilPct: 41 + i * 6,
    memRecommendedPct: 60,
    investigation: null,
    alertCount: i === 1 && cluster.health !== 'healthy' ? 1 : 0,
    zone: zones[i % zones.length],
    diagnosticLogs: [
      `[kubelet] Node master-${i + 1} reported ${masterStatuses[i] ?? 'Ready'} at ${new Date().toISOString()}`,
      `[metrics] CPU ${34 + i * 8}% · Memory ${41 + i * 6}% · Allocatable pods 250/250`,
    ],
    metricsSummary: `Control plane node · API/etcd colocated · zone ${zones[i % zones.length]}`,
  }));

  const workers: NodeComponentSummaryRow[] = [0, 1, 2, 3].map((i) => {
    const status = workerStatuses[i] ?? 'Ready';
    const investigating =
      snap.isIncidentActive &&
      snap.selectedClusterAgentStatus !== 'idle' &&
      i === 1 &&
      status === 'NotReady';
    return {
      id: `node-worker-${i}-${clusterId}`,
      kind: 'node',
      name: `worker-${String(i + 1).padStart(2, '0')}.${cluster.name}`,
      typeLabel: 'Worker',
      status,
      cpuUtilPct: 52 + i * 11,
      cpuRecommendedPct: 60,
      memUtilPct: 48 + i * 9,
      memRecommendedPct: 55,
      investigation: investigating
        ? { summary: 'AI Hub (Autonomous agent) correlating node pressure with ingress timeouts' }
        : null,
      alertCount: status === 'NotReady' || status === 'SchedulingDisabled' ? 2 : 0,
      zone: zones[i % zones.length],
      diagnosticLogs: [
        `[kubelet] ${status} · last heartbeat ${i + 2}m ago`,
        `[cadvisor] CPU ${52 + i * 11}% · Memory ${48 + i * 9}% · 42 pods scheduled`,
        investigating ? '[agent] Autonomous analysis sampling CNI and kubelet logs on this node' : '',
      ].filter(Boolean),
      metricsSummary: `Worker capacity · schedulable ${status === 'SchedulingDisabled' ? 'no' : 'yes'}`,
    };
  });

  return [...masters, ...workers];
}

const PLATFORM_COMPONENT_CATALOG: Array<{
  key: string;
  name: string;
  typeLabel: string;
  defaultStatus: NodeComponentStatusLabel;
}> = [
  { key: 'ingress', name: 'ingress-controller-operator', typeLabel: 'Platform Service', defaultStatus: 'Healthy' },
  { key: 'router', name: 'router-default', typeLabel: 'Platform Service', defaultStatus: 'Healthy' },
  { key: 'etcd', name: 'etcd-operator', typeLabel: 'Platform Service', defaultStatus: 'Healthy' },
  { key: 'monitoring', name: 'cluster-monitoring-operator', typeLabel: 'Platform Service', defaultStatus: 'Healthy' },
  { key: 'network', name: 'network-operator', typeLabel: 'Platform Service', defaultStatus: 'Healthy' },
  { key: 'apiserver', name: 'kube-apiserver', typeLabel: 'Platform Service', defaultStatus: 'Healthy' },
];

function buildComponentRows(clusterId: string, snap: SimulationSnapshot): NodeComponentSummaryRow[] {
  const cluster = getClusterById(clusterId);
  if (!cluster) {
    return [];
  }

  const clusterAlerts = getAlertsForCluster(clusterId);
  const platformAlerts = ALERTS.filter((a) => a.clusterId === clusterId && isPlatformService(a.service));

  const regionBase = cluster.region.replace(/^([a-z]+-[a-z]+-\d+).*/, '$1') || cluster.region;
  const zone = `${regionBase}a`;

  return PLATFORM_COMPONENT_CATALOG.map((def, index) => {
    const relatedAlerts = [...clusterAlerts, ...platformAlerts].filter((a) => {
      const hay = `${a.service} ${a.title}`.toLowerCase();
      return hay.includes(def.key);
    });
    const alertCount = relatedAlerts.length;
    const hasCritical = relatedAlerts.some((a) => a.severity === 'critical');

    let status: NodeComponentStatusLabel = def.defaultStatus;
    if (hasCritical) {
      status = 'Degraded';
    } else if (relatedAlerts.some((a) => a.severity === 'warning')) {
      status = 'Degraded';
    }

    const primary = relatedAlerts[0];
    const agentActive =
      snap.isIncidentActive &&
      snap.selectedClusterAgentStatus !== 'idle' &&
      primary &&
      (def.key === 'ingress' || def.key === 'router' || def.key === 'etcd');

    let investigation: NodeComponentInvestigation | null = null;
    if (agentActive && primary) {
      if (def.key === 'ingress' || def.key === 'router') {
        investigation = { summary: 'AI Hub (Autonomous agent) diagnosing API latency on ingress dataplane' };
      } else if (def.key === 'etcd') {
        investigation = { summary: 'AI Hub (Autonomous agent) analyzing WAL growth and compaction lag' };
      }
    } else if (snap.selectedClusterAgentStatus === 'remediating' && def.key === 'etcd') {
      investigation = { summary: 'AI Hub (Autonomous agent) validating etcd defrag and quota recovery' };
    }

    const cpuUtil = 28 + index * 9 + (hasCritical ? 22 : 0);
    const memUtil = 32 + index * 7 + (hasCritical ? 18 : 0);

    return {
      id: `component-${def.key}-${clusterId}`,
      kind: 'component',
      name: def.name,
      typeLabel: def.typeLabel,
      status,
      cpuUtilPct: Math.min(cpuUtil, 94),
      cpuRecommendedPct: 55 + (index % 3) * 5,
      memUtilPct: Math.min(memUtil, 92),
      memRecommendedPct: 50 + (index % 2) * 8,
      investigation,
      alertCount,
      zone,
      diagnosticLogs: [
        `[operator] ${def.name} · status ${status}`,
        primary
          ? `[alert] ${primary.title} — ${primary.message.slice(0, 120)}${primary.message.length > 120 ? '…' : ''}`
          : '[operator] No firing alerts attributed to this component',
        agentActive ? '[agent] Reasoning chain active — see Autonomous analysis for correlated steps' : '',
      ].filter(Boolean),
      metricsSummary: `Platform operator · ${def.typeLabel} · ${cluster.name}`,
    };
  });
}

export function buildNodeComponentSummaryRows(clusterId: string, snap: SimulationSnapshot): NodeComponentSummaryRow[] {
  if (!clusterId) {
    return [];
  }
  return [...buildNodeRows(clusterId, snap), ...buildComponentRows(clusterId, snap)];
}

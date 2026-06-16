import type {
  AlertSeverity,
  AlertStatus,
  ACMClusterStatus,
  AlertGroup,
  AlertComponent,
  AlertData,
  ClusterData,
  TrendData,
  AlertRule,
  AlertRuleState,
  AlertRuleSource,
  AlertRuleActiveAlert,
  AlertRuleModification,
} from './types';
import type { AlertRecord, ClusterHealth } from '../../../components/autonomousAiObserve/data';
import { ALERTS, CLUSTERS, FLEET_WIDE_REGIONAL_INGRESS } from '../../../components/autonomousAiObserve/data';
import { toFleetRegionFilterLabel } from './utils';

// Mock Alert Rules Data
export const mockAlertRules: AlertRule[] = [
  {
    id: 'ar1',
    name: 'NodeCPUHigh',
    description: 'Node CPU utilization exceeds threshold',
    severity: 'Critical',
    state: 'Reconciling',
    stateProgress: 50,
    appliedClusters: 7,
    totalClusters: 14,
    targetClusters: ['prod-east-2', 'prod-eu-west-1', 'stg-central'],
    group: 'Cluster',
    component: 'kube-apiserver',
    source: 'User',
    expression: 'intstr.FromString("kubevirt_vmi_non_evictable * on(name, namespace) group_left() kubevirt_vmi_info{phase=\'running\'} == 1"),',
    forDuration: '60 seconds',
    prometheusRule: 'PrometheusRule-default (namespace: openshift-monitoring)',
    labels: ['label-label1', 'label2'],
    summary: 'EtcdLeaderElectionFailed',
    runbookUrl: 'https://mygitrunbook.com',
    dashboards: 'ocp-perses-clusterhealthdashboard',
    notificationMatchers: ['env=prod', 'region=us.east'],
    receivedBy: 'Slack',
    receivers: ['mst-it.slack.com', 'mst-critical.slack.com'],
    createdAt: 'Apr 29, 2026 — prod-east-2',
    createdBy: 'adiadmin@nyp.com',
    modificationHistory: [
      { date: '12 July, 2025 12:36:01 PM', user: 'person1@company.com' },
      { date: '18 July, 2025 02:12:19 AM', user: 'person2@company.com' },
    ],
    activeAlerts: [
      {
        id: 'aa1',
        message: 'PaymentsAPI5xxSurge — server errors elevated at gateway.',
        cluster: 'prod-east-2',
        activeSince: 'Apr 29, 2026, 2:18 PM',
        state: 'Firing',
        value: '---',
        resource: 'payments-api',
      },
      {
        id: 'aa2',
        message: 'EtcdDiskPressureOnMaster2 — control plane risk.',
        cluster: 'prod-east-2',
        activeSince: 'Apr 29, 2026, 2:11 PM',
        state: 'Firing',
        value: '---',
        resource: 'etcd-master-2',
      },
      {
        id: 'aa3',
        message: 'CheckoutSvcCPUThrottling — HPA at max replicas.',
        cluster: 'prod-eu-west-1',
        activeSince: 'Apr 29, 2026, 2:00 PM',
        state: 'Firing',
        value: '---',
        resource: 'checkout-svc',
      },
      {
        id: 'aa4',
        message: 'IngressTLSCertExpiresIn36h — router-default.',
        cluster: 'edge-apac-1',
        activeSince: 'Apr 29, 2026, 2:24 PM',
        state: 'Firing',
        value: '---',
        resource: 'router-default',
      },
    ],
    enabled: true,
  },
  {
    id: 'ar2',
    name: 'API Server Request Latency High',
    description: 'API Server request latency exceeds threshold',
    severity: 'Warning',
    state: 'Active',
    targetClusters: ['prod-east-2'],
    group: 'Cluster',
    component: 'kube-apiserver',
    source: 'User',
    expression: 'histogram_quantile(0.99, sum(rate(apiserver_request_duration_seconds_bucket[5m])) by (le)) > 1',
    forDuration: '5 minutes',
    prometheusRule: 'PrometheusRule-default (namespace: openshift-monitoring)',
    labels: ['api', 'latency'],
    summary: 'API Server latency is high',
    createdAt: '10 July, 2025',
    createdBy: 'admin@company.com',
    modificationHistory: [],
    activeAlerts: [],
    enabled: true,
  },
  {
    id: 'ar3',
    name: 'Kube-State-Metrics Down',
    description: 'Kube-state-metrics is not running',
    severity: 'Critical',
    state: 'Partial success',
    targetClusters: ['prod-east-2', 'prod-eu-west-1', 'stg-central', 'edge-apac-1', 'prod-us-west-2'],
    group: 'Cluster',
    component: 'kube-apiserver',
    source: 'User',
    expression: 'absent(up{job="kube-state-metrics"} == 1)',
    forDuration: '2 minutes',
    prometheusRule: 'PrometheusRule-default (namespace: openshift-monitoring)',
    labels: ['monitoring'],
    summary: 'Kube-state-metrics is down',
    createdAt: '5 July, 2025',
    createdBy: 'admin@company.com',
    modificationHistory: [],
    activeAlerts: [],
    enabled: true,
  },
  {
    id: 'ar4',
    name: 'Cluster Storage Disk Usage Critical',
    description: 'Cluster storage disk usage exceeds 90%',
    severity: 'Critical',
    state: 'Failed',
    targetClusters: ['prod-east-2', 'prod-eu-west-1', 'stg-central', 'edge-apac-1', 'prod-us-west-2'],
    group: 'Cluster',
    component: 'kube-apiserver',
    source: 'User',
    expression: 'node_filesystem_avail_bytes / node_filesystem_size_bytes < 0.1',
    forDuration: '10 minutes',
    prometheusRule: 'PrometheusRule-default (namespace: openshift-monitoring)',
    labels: ['storage', 'disk'],
    summary: 'Disk usage is critical',
    createdAt: '1 July, 2025',
    createdBy: 'admin@company.com',
    modificationHistory: [],
    activeAlerts: [],
    enabled: true,
  },
  {
    id: 'ar5',
    name: 'ImageRegistryPersistentVolumeFull',
    description: 'Image registry PV is full',
    severity: 'Critical',
    state: 'Failed',
    targetClusters: [
      'prod-east-2',
      'prod-eu-west-1',
      'stg-central',
      'edge-apac-1',
      'prod-us-west-2',
      'cluster-lab-1',
      'cluster-lab-2',
    ],
    group: 'Namespace',
    component: 'kube-apiserver',
    source: 'User',
    expression: 'kubelet_volume_stats_available_bytes{persistentvolumeclaim=~"image-registry.*"} / kubelet_volume_stats_capacity_bytes < 0.05',
    forDuration: '5 minutes',
    prometheusRule: 'PrometheusRule-default (namespace: openshift-monitoring)',
    labels: ['registry', 'storage'],
    summary: 'Image registry PV is nearly full',
    createdAt: '28 June, 2025',
    createdBy: 'admin@company.com',
    modificationHistory: [],
    activeAlerts: [],
    enabled: true,
  },
  {
    id: 'ar6',
    name: 'MDSCacheUsageHigh',
    description: 'MDS cache usage is high',
    severity: 'Critical',
    state: 'Failed',
    targetClusters: [
      'prod-east-2',
      'prod-eu-west-1',
      'stg-central',
      'edge-apac-1',
      'prod-us-west-2',
      'cluster-lab-1',
      'cluster-lab-2',
      'cluster-lab-3',
    ],
    group: 'Cluster',
    component: 'kube-apiserver',
    source: 'Platform',
    expression: 'ceph_mds_cache_size_bytes / ceph_mds_cache_limit_bytes > 0.9',
    forDuration: '10 minutes',
    prometheusRule: 'PrometheusRule-default (namespace: openshift-monitoring)',
    labels: ['ceph', 'mds'],
    summary: 'MDS cache usage exceeds 90%',
    createdAt: '25 June, 2025',
    createdBy: 'platform@company.com',
    modificationHistory: [],
    activeAlerts: [],
    enabled: true,
  },
  {
    id: 'ar7',
    name: 'Etcd Quorum Lost',
    description: 'Etcd cluster has lost quorum',
    severity: 'Warning',
    state: 'Active',
    targetClusters: Array.from({ length: 19 }, (_, i) => `Cluster-${i + 1}`),
    group: 'Cluster',
    component: 'etcd',
    source: 'User',
    expression: 'sum(etcd_server_has_leader) by (cluster) < count(etcd_server_has_leader) by (cluster)',
    forDuration: '1 minute',
    prometheusRule: 'PrometheusRule-default (namespace: openshift-monitoring)',
    labels: ['etcd', 'quorum'],
    summary: 'Etcd quorum is lost',
    createdAt: '20 June, 2025',
    createdBy: 'admin@company.com',
    modificationHistory: [],
    activeAlerts: [],
    enabled: true,
  },
  {
    id: 'ar8',
    name: 'MDSCacheUsageHigh',
    description: 'MDS cache usage is high (namespace level)',
    severity: 'Warning',
    state: 'Active',
    targetClusters: ['prod-east-2'],
    group: 'Namespace',
    component: 'etcd',
    source: 'Platform',
    expression: 'ceph_mds_cache_size_bytes / ceph_mds_cache_limit_bytes > 0.8',
    forDuration: '5 minutes',
    prometheusRule: 'PrometheusRule-default (namespace: openshift-monitoring)',
    labels: ['ceph', 'mds'],
    summary: 'MDS cache usage exceeds 80%',
    createdAt: '15 June, 2025',
    createdBy: 'platform@company.com',
    modificationHistory: [],
    activeAlerts: [],
    enabled: true,
  },
  {
    id: 'ar9',
    name: 'Virtual Machine Memory Exhausted',
    description: 'Virtual machine memory is exhausted',
    severity: 'Critical',
    state: 'Reconciling',
    stateProgress: 75,
    appliedClusters: 3,
    totalClusters: 4,
    targetClusters: ['prod-east-2', 'prod-eu-west-1', 'stg-central', 'edge-apac-1', 'prod-us-west-2'],
    group: 'Namespace',
    component: 'Pod',
    source: 'User',
    expression: 'kubevirt_vmi_memory_used_bytes / kubevirt_vmi_memory_available_bytes > 0.95',
    forDuration: '5 minutes',
    prometheusRule: 'PrometheusRule-default (namespace: openshift-monitoring)',
    labels: ['vm', 'memory'],
    summary: 'VM memory is exhausted',
    createdAt: '10 June, 2025',
    createdBy: 'admin@company.com',
    modificationHistory: [],
    activeAlerts: [],
    enabled: true,
  },
  {
    id: 'ar10',
    name: 'VMCannotBeEvicted',
    description: 'VM cannot be evicted',
    severity: 'Critical',
    state: 'Reconciling',
    stateProgress: 30,
    appliedClusters: 3,
    totalClusters: 11,
    targetClusters: Array.from({ length: 11 }, (_, i) => `VM-Cluster-${i + 1}`),
    group: 'Namespace',
    component: 'Pod',
    source: 'Platform',
    expression: 'kubevirt_vmi_non_evictable == 1',
    forDuration: '10 minutes',
    prometheusRule: 'PrometheusRule-default (namespace: openshift-monitoring)',
    labels: ['vm', 'eviction'],
    summary: 'VM cannot be evicted',
    createdAt: '5 June, 2025',
    createdBy: 'platform@company.com',
    modificationHistory: [],
    activeAlerts: [],
    enabled: true,
  },
  {
    id: 'ar11',
    name: 'NodeCPUHigh',
    description: 'Node CPU high at namespace level',
    severity: 'Critical',
    state: 'Active',
    targetClusters: Array.from({ length: 18 }, (_, i) => `NS-Cluster-${i + 1}`),
    group: 'Namespace',
    component: 'kube-apiserver',
    source: 'User',
    expression: 'node:node_cpu_utilisation:avg1m > 0.9',
    forDuration: '5 minutes',
    prometheusRule: 'PrometheusRule-default (namespace: openshift-monitoring)',
    labels: ['cpu', 'node'],
    summary: 'Node CPU is high',
    createdAt: '1 June, 2025',
    createdBy: 'admin@company.com',
    modificationHistory: [],
    activeAlerts: [],
    enabled: true,
  },
];

// ========================================
// MOCK DATA GENERATION
// ========================================

export const now = new Date();

/** Align ACM shell status with Autonomous analysis cluster health. */
function healthToAcmStatus(h: ClusterHealth): ACMClusterStatus {
  return h === 'healthy' ? 'Ready' : 'Degraded';
}

function observeSeverityToUi(sev: AlertRecord['severity']): AlertSeverity {
  if (sev === 'critical') return 'Critical';
  if (sev === 'warning') return 'Warning';
  return 'Info';
}

function componentForObserveAlert(title: string): AlertComponent {
  const t = title.toLowerCase();
  if (t.includes('etcd')) return 'etcd';
  if (t.includes('ingress') || t.includes('tls')) return 'Network';
  return 'Workload';
}

function relativeLastFired(from: Date, base: Date): string {
  const minutesAgo = Math.max(1, Math.round((base.getTime() - from.getTime()) / 60000));
  if (minutesAgo < 60) return `${minutesAgo} min ago`;
  const h = Math.floor(minutesAgo / 60);
  return `${h} hour${h > 1 ? 's' : ''} ago`;
}

/**
 * Canonical clusters + firing alerts from AI Hub (`components/autonomousAiObserve/data.ts`)
 * plus the fleet-wide ingress incident for a seamless prototype story.
 */
/** Build fleet mock clusters with alert `lastFiredTimestamp` anchored to `baseTime` (use current time on each page load). */
export function buildAiHubAlignedClusters(baseTime: Date): ClusterData[] {
  const byId = new Map<string, ClusterData>();

  for (const c of CLUSTERS) {
    byId.set(c.id, {
      id: c.id,
      name: c.name,
      region: toFleetRegionFilterLabel(c.region),
      cloudProvider: c.provider,
      team: c.env === 'prod' ? 'Platform' : 'QA',
      namespaces: ['openshift-monitoring', 'openshift-ingress', 'payments'],
      labels: { env: c.env, tier: c.env === 'prod' ? 'critical' : 'standard' },
      alerts: [],
      nodeCount: c.nodes,
      podCount: c.nodes * 14,
      cpuUsage: c.health === 'critical' ? 82 : c.health === 'healthy' ? 34 : 58,
      memoryUsage: c.health === 'critical' ? 76 : c.health === 'healthy' ? 40 : 62,
      cpuCores: c.nodes * 4,
      totalMemory: c.nodes * 16,
      vmCount: 0,
      cpuRequests: 42,
      memoryRequests: 38,
      acmStatus: healthToAcmStatus(c.health),
    });
  }

  // Anchor to baseTime so default "last 6h" (and similar) time filters always include these alerts
  const fleetFired = new Date(baseTime.getTime() - 50 * 60 * 1000);
  const fleetTitle = FLEET_WIDE_REGIONAL_INGRESS.title;

  for (const cid of FLEET_WIDE_REGIONAL_INGRESS.affectedClusterIds) {
    const cd = byId.get(cid);
    if (!cd) continue;
    cd.alerts.push({
      id: `${FLEET_WIDE_REGIONAL_INGRESS.id}-${cid}`,
      severity: 'Critical',
      status: 'firing',
      alertName: fleetTitle,
      clusterName: cd.name,
      namespace: 'openshift-ingress',
      labels: { env: String(cd.labels.env), scope: 'fleet', story: 'ai-hub' },
      summary: FLEET_WIDE_REGIONAL_INGRESS.aiInsight.narrative ?? FLEET_WIDE_REGIONAL_INGRESS.aiInsight.evidence,
      lastFired: relativeLastFired(fleetFired, baseTime),
      lastFiredTimestamp: fleetFired,
      details: `${FLEET_WIDE_REGIONAL_INGRESS.aggregatedFinding} ${FLEET_WIDE_REGIONAL_INGRESS.rootCauseNarrative}`,
      source: 'Platform',
      count: FLEET_WIDE_REGIONAL_INGRESS.correlatedAlertCount,
      group: 'Cluster',
      component: 'Network',
      description: 'Fleet-wide ingress — same narrative as AI Hub fleet incident card.',
      resource: 'openshift-ingress/router-default',
      runbookUrl: undefined,
    });
  }

  let observeAlertIndex = 0;
  for (const a of ALERTS) {
    const cd = byId.get(a.clusterId);
    if (!cd) continue;
    observeAlertIndex += 1;
    const fired = new Date(baseTime.getTime() - (12 + observeAlertIndex * 7) * 60 * 1000);
    const ns = a.service.includes('/') ? a.service.split('/')[0].trim() : 'openshift-monitoring';
    cd.alerts.push({
      id: a.id,
      severity: observeSeverityToUi(a.severity),
      status: 'firing',
      alertName: a.title,
      clusterName: cd.name,
      namespace: ns,
      labels: { env: String(cd.labels.env), severity: a.severity },
      summary: a.message,
      lastFired: relativeLastFired(fired, baseTime),
      lastFiredTimestamp: fired,
      details: a.rcaSummary,
      source: 'User',
      count: 1,
      group: 'Namespace',
      component: componentForObserveAlert(a.title),
      description: a.message,
      resource: a.blastRadius[0],
      runbookUrl: undefined,
    });
  }

  return CLUSTERS.map((c) => byId.get(c.id)!);
}
export const mockTrendData: TrendData[] = [
  { timestamp: '24h ago', critical: 3, warning: 9, info: 5 },
  { timestamp: '23h ago', critical: 4, warning: 10, info: 6 },
  { timestamp: '22h ago', critical: 2, warning: 8, info: 4 },
  { timestamp: '21h ago', critical: 5, warning: 11, info: 7 },
  { timestamp: '20h ago', critical: 3, warning: 7, info: 5 },
  { timestamp: '19h ago', critical: 4, warning: 12, info: 6 },
  { timestamp: '18h ago', critical: 6, warning: 14, info: 8 },
  { timestamp: '17h ago', critical: 5, warning: 10, info: 7 },
  { timestamp: '16h ago', critical: 3, warning: 9, info: 5 },
  { timestamp: '15h ago', critical: 4, warning: 11, info: 6 },
  { timestamp: '14h ago', critical: 2, warning: 8, info: 4 },
  { timestamp: '13h ago', critical: 5, warning: 13, info: 7 },
  { timestamp: '12h ago', critical: 6, warning: 15, info: 9 },
  { timestamp: '11h ago', critical: 4, warning: 10, info: 5 },
  { timestamp: '10h ago', critical: 3, warning: 9, info: 6 },
  { timestamp: '9h ago', critical: 5, warning: 12, info: 7 },
  { timestamp: '8h ago', critical: 4, warning: 11, info: 6 },
  { timestamp: '7h ago', critical: 3, warning: 10, info: 5 },
  { timestamp: '6h ago', critical: 5, warning: 12, info: 8 },
  { timestamp: '5h ago', critical: 4, warning: 15, info: 10 },
  { timestamp: '4h ago', critical: 7, warning: 11, info: 6 },
  { timestamp: '3h ago', critical: 3, warning: 18, info: 9 },
  { timestamp: '2h ago', critical: 28, warning: 45, info: 23, topAlerts: ['ETCDHighLatency', 'HighMemoryUsage', 'NodeNotReady'] },
  { timestamp: '1h ago', critical: 7, warning: 10, info: 5 },
  {
    timestamp: 'Now',
    critical: 9,
    warning: 11,
    info: 5,
    topAlerts: ['RegionalIngressFailure', 'PaymentsAPI5xxSurge', 'EtcdDiskPressureOnMaster2'],
  },
];

// ============================================================
// FIXED DETERMINISTIC CLUSTER DATA — mirrors kuklas.github.io
// /HPUX-Prototypes/observe/alerting?tab=alerts (Alerts tab)
//
// Produces exactly 17 aggregated rows when "Aggregate identical
// alerts" is ON, sorted Critical → Warning → Info:
//
//  R1  PodCrashLoopBackOff  Critical  2  2 clusters  Cluster    Network         User
//  R2  HighMemoryUsage      Critical  2  2 clusters  Cluster    Pod             User
//  R3  ETCDHighLatency      Critical  2  2 clusters  Cluster    Pod             User
//  R4  DiskPressure         Critical  1  1 cluster   Namespace  Network         User
//  R5  HighCPUUsage         Warning   4  4 clusters  Cluster    Network         User
//  R6  NetworkLatency       Warning   4  3 clusters  Cluster    Pod             Platform
//  R7  QuotaWarning         Warning   5  5 clusters  Cluster    Quota           Platform
//  R8  PodCrashLoopBackOff  Warning   6  6 clusters  Cluster    Workload        User
//  R9  ETCDHighLatency      Warning   6  6 clusters  Namespace  Quota           User
//  R10 ServiceUnavailable   Warning   2  2 clusters  Namespace  Quota           User
//  R11 DiskPressure         Warning   2  2 clusters  Namespace  Quota           User
//  R12 QuotaWarning         Info      2  2 clusters  Cluster    kube-apiserver  Platform
//  R13 NetworkLatency       Info      4  4 clusters  Cluster    Pod             Platform
//  R14 CertExpiring         Info      3  3 clusters  Cluster    Pod             Platform
//  R15 ServiceUnavailable   Info      4  4 clusters  Cluster    Quota           Platform
//  R16 HighMemoryUsage      Info      2  2 clusters  Namespace  Controller      User
//  R17 PodCrashLoopBackOff  Info      5  3 clusters  Namespace  Workload        User
// ============================================================

function makeKuklasAlert(
  idSuffix: string,
  alertName: string,
  severity: AlertSeverity,
  group: AlertGroup,
  component: AlertComponent,
  source: string,
  minutesAgo: number,
  baseTime: Date,
): AlertData {
  const lastFiredStr = minutesAgo < 60
    ? `${minutesAgo} min ago`
    : minutesAgo < 1440
      ? `${Math.floor(minutesAgo / 60)} hour${Math.floor(minutesAgo / 60) > 1 ? 's' : ''} ago`
      : `${Math.floor(minutesAgo / 1440)} day${Math.floor(minutesAgo / 1440) > 1 ? 's' : ''} ago`;
  return {
    id: `kf-${idSuffix}`,
    severity,
    status: 'firing',
    alertName,
    clusterName: '', // set below per-cluster
    namespace: group === 'Namespace' ? 'production' : 'kube-system',
    labels: { severity: severity.toLowerCase(), source: source.toLowerCase() },
    summary: `${alertName} detected`,
    lastFired: lastFiredStr,
    lastFiredTimestamp: new Date(baseTime.getTime() - minutesAgo * 60000),
    details: `${alertName} requires attention. Check runbook for remediation steps.`,
    source,
    count: 1,
    group,
    component,
    description: `${alertName} affecting ${group === 'Namespace' ? 'a namespace' : 'the cluster'}.`,
    runbookUrl: `https://runbooks.example.com/alerts/${alertName}`,
  };
}

/** Fixed deterministic fleet clusters producing exactly the 17 kuklas rows. */
export const generateMockFillerClusters = (): ClusterData[] => [];

export function buildKuklasMockClusters(baseTime: Date = new Date()): ClusterData[] {
  type AlertDef = [string, string, AlertSeverity, AlertGroup, AlertComponent, string, number];

  const clusterDefs: Array<{
    id: string; name: string; region: string; provider: string; team: string;
    nodeCount: number; cpuUsage: number; memUsage: number;
    alertDefs: AlertDef[];
  }> = [
    {
      id: 'kc1', name: 'prod-us-east-1', region: 'US East', provider: 'AWS', team: 'Platform',
      nodeCount: 18, cpuUsage: 72, memUsage: 68,
      alertDefs: [
        ['e1-r1',   'PodCrashLoopBackOff', 'Critical', 'Cluster',   'Network',        'User',     45],
        ['e1-r2',   'HighMemoryUsage',     'Critical', 'Cluster',   'Pod',            'User',     30],
        ['e1-r5',   'HighCPUUsage',        'Warning',  'Cluster',   'Network',        'User',     90],
        ['e1-r6a',  'NetworkLatency',      'Warning',  'Cluster',   'Pod',            'Platform', 120],
        ['e1-r6b',  'NetworkLatency',      'Warning',  'Cluster',   'Pod',            'Platform', 135],
        ['e1-r7',   'QuotaWarning',        'Warning',  'Cluster',   'Quota',          'Platform', 200],
        ['e1-r8',   'PodCrashLoopBackOff', 'Warning',  'Cluster',   'Workload',       'User',     55],
        ['e1-r9',   'ETCDHighLatency',     'Warning',  'Namespace', 'Quota',          'User',     180],
        ['e1-r12',  'QuotaWarning',        'Info',     'Cluster',   'kube-apiserver', 'Platform', 250],
        ['e1-r13',  'NetworkLatency',      'Info',     'Cluster',   'Pod',            'Platform', 300],
        ['e1-r14',  'CertExpiring',        'Info',     'Cluster',   'Pod',            'Platform', 350],
        ['e1-r15',  'ServiceUnavailable',  'Info',     'Cluster',   'Quota',          'Platform', 280],
        ['e1-r17a', 'PodCrashLoopBackOff', 'Info',     'Namespace', 'Workload',       'User',     40],
        ['e1-r17b', 'PodCrashLoopBackOff', 'Info',     'Namespace', 'Workload',       'User',     50],
      ],
    },
    {
      id: 'kc2', name: 'prod-us-east-2', region: 'US East', provider: 'AWS', team: 'Platform',
      nodeCount: 14, cpuUsage: 58, memUsage: 61,
      alertDefs: [
        ['e2-r1',  'PodCrashLoopBackOff', 'Critical', 'Cluster',   'Network',        'User',     50],
        ['e2-r5',  'HighCPUUsage',        'Warning',  'Cluster',   'Network',        'User',     85],
        ['e2-r7',  'QuotaWarning',        'Warning',  'Cluster',   'Quota',          'Platform', 210],
        ['e2-r8',  'PodCrashLoopBackOff', 'Warning',  'Cluster',   'Workload',       'User',     60],
        ['e2-r9',  'ETCDHighLatency',     'Warning',  'Namespace', 'Quota',          'User',     190],
        ['e2-r12', 'QuotaWarning',        'Info',     'Cluster',   'kube-apiserver', 'Platform', 260],
        ['e2-r13', 'NetworkLatency',      'Info',     'Cluster',   'Pod',            'Platform', 310],
        ['e2-r15', 'ServiceUnavailable',  'Info',     'Cluster',   'Quota',          'Platform', 290],
      ],
    },
    {
      id: 'kc3', name: 'prod-us-west-1', region: 'US West', provider: 'GCP', team: 'Platform',
      nodeCount: 16, cpuUsage: 64, memUsage: 70,
      alertDefs: [
        ['w1-r2',   'HighMemoryUsage',     'Critical', 'Cluster',   'Pod',      'User',     35],
        ['w1-r5',   'HighCPUUsage',        'Warning',  'Cluster',   'Network',  'User',     95],
        ['w1-r6',   'NetworkLatency',      'Warning',  'Cluster',   'Pod',      'Platform', 140],
        ['w1-r7',   'QuotaWarning',        'Warning',  'Cluster',   'Quota',    'Platform', 220],
        ['w1-r8',   'PodCrashLoopBackOff', 'Warning',  'Cluster',   'Workload', 'User',     65],
        ['w1-r9',   'ETCDHighLatency',     'Warning',  'Namespace', 'Quota',    'User',     195],
        ['w1-r11',  'DiskPressure',        'Warning',  'Namespace', 'Quota',    'User',     230],
        ['w1-r13',  'NetworkLatency',      'Info',     'Cluster',   'Pod',      'Platform', 315],
        ['w1-r14',  'CertExpiring',        'Info',     'Cluster',   'Pod',      'Platform', 360],
        ['w1-r17a', 'PodCrashLoopBackOff', 'Info',     'Namespace', 'Workload', 'User',     45],
        ['w1-r17b', 'PodCrashLoopBackOff', 'Info',     'Namespace', 'Workload', 'User',     55],
      ],
    },
    {
      id: 'kc4', name: 'prod-us-west-2', region: 'US West', provider: 'GCP', team: 'Data',
      nodeCount: 10, cpuUsage: 49, memUsage: 55,
      alertDefs: [
        ['w2-r5',  'HighCPUUsage',        'Warning',  'Cluster',   'Network',  'User',     100],
        ['w2-r7',  'QuotaWarning',        'Warning',  'Cluster',   'Quota',    'Platform', 215],
        ['w2-r8',  'PodCrashLoopBackOff', 'Warning',  'Cluster',   'Workload', 'User',     70],
        ['w2-r9',  'ETCDHighLatency',     'Warning',  'Namespace', 'Quota',    'User',     185],
        ['w2-r11', 'DiskPressure',        'Warning',  'Namespace', 'Quota',    'User',     240],
      ],
    },
    {
      id: 'kc5', name: 'prod-eu-central-1', region: 'EU Central', provider: 'Azure', team: 'Platform',
      nodeCount: 20, cpuUsage: 76, memUsage: 72,
      alertDefs: [
        ['ec1-r3',  'ETCDHighLatency',     'Critical', 'Cluster',   'Pod',            'User',     25],
        ['ec1-r6',  'NetworkLatency',      'Warning',  'Cluster',   'Pod',            'Platform', 145],
        ['ec1-r7',  'QuotaWarning',        'Warning',  'Cluster',   'Quota',          'Platform', 225],
        ['ec1-r8',  'PodCrashLoopBackOff', 'Warning',  'Cluster',   'Workload',       'User',     75],
        ['ec1-r9',  'ETCDHighLatency',     'Warning',  'Namespace', 'Quota',          'User',     175],
        ['ec1-r13', 'NetworkLatency',      'Info',     'Cluster',   'Pod',            'Platform', 320],
        ['ec1-r14', 'CertExpiring',        'Info',     'Cluster',   'Pod',            'Platform', 370],
        ['ec1-r15', 'ServiceUnavailable',  'Info',     'Cluster',   'Quota',          'Platform', 285],
        ['ec1-r17', 'PodCrashLoopBackOff', 'Info',     'Namespace', 'Workload',       'User',     60],
      ],
    },
    {
      id: 'kc6', name: 'prod-eu-west-1', region: 'EU West', provider: 'Azure', team: 'Security',
      nodeCount: 12, cpuUsage: 55, memUsage: 59,
      alertDefs: [
        ['ew1-r3',  'ETCDHighLatency',    'Critical', 'Cluster',   'Pod',     'User',     20],
        ['ew1-r8',  'PodCrashLoopBackOff','Warning',  'Cluster',   'Workload','User',     80],
        ['ew1-r9',  'ETCDHighLatency',    'Warning',  'Namespace', 'Quota',   'User',     170],
        ['ew1-r15', 'ServiceUnavailable', 'Info',     'Cluster',   'Quota',   'Platform', 295],
      ],
    },
    {
      id: 'kc7', name: 'staging-us-1', region: 'US East', provider: 'AWS', team: 'QA',
      nodeCount: 6, cpuUsage: 38, memUsage: 42,
      alertDefs: [
        ['su1-r4',  'DiskPressure',       'Critical', 'Namespace', 'Network',    'User', 15],
        ['su1-r10', 'ServiceUnavailable', 'Warning',  'Namespace', 'Quota',      'User', 110],
        ['su1-r16', 'HighMemoryUsage',    'Info',     'Namespace', 'Controller', 'User', 330],
      ],
    },
    {
      id: 'kc8', name: 'staging-eu-1', region: 'EU West', provider: 'GCP', team: 'QA',
      nodeCount: 5, cpuUsage: 32, memUsage: 38,
      alertDefs: [
        ['seu1-r10', 'ServiceUnavailable','Warning',  'Namespace', 'Quota',      'User', 115],
        ['seu1-r16', 'HighMemoryUsage',   'Info',     'Namespace', 'Controller', 'User', 335],
      ],
    },
  ];

  const healthyDefs = [
    { id: 'kh1',  name: 'prod-apac-1',       region: 'Asia Pacific',  provider: 'AWS',   team: 'Platform',    nodeCount: 15, cpuUsage: 42, memUsage: 45 },
    { id: 'kh2',  name: 'prod-apac-2',       region: 'Asia Pacific',  provider: 'GCP',   team: 'Data',        nodeCount: 12, cpuUsage: 38, memUsage: 41 },
    { id: 'kh3',  name: 'prod-sa-1',         region: 'South America', provider: 'Azure', team: 'Development', nodeCount: 8,  cpuUsage: 35, memUsage: 39 },
    { id: 'kh4',  name: 'prod-us-central-1', region: 'US Central',    provider: 'AWS',   team: 'Platform',    nodeCount: 18, cpuUsage: 44, memUsage: 50 },
    { id: 'kh5',  name: 'prod-eu-north-1',   region: 'EU West',       provider: 'Azure', team: 'Security',    nodeCount: 10, cpuUsage: 30, memUsage: 35 },
    { id: 'kh6',  name: 'staging-us-2',      region: 'US West',       provider: 'GCP',   team: 'QA',          nodeCount: 5,  cpuUsage: 28, memUsage: 32 },
    { id: 'kh7',  name: 'staging-apac-1',    region: 'Asia Pacific',  provider: 'AWS',   team: 'QA',          nodeCount: 4,  cpuUsage: 22, memUsage: 28 },
    { id: 'kh8',  name: 'dev-us-1',          region: 'US East',       provider: 'AWS',   team: 'Development', nodeCount: 4,  cpuUsage: 20, memUsage: 25 },
    { id: 'kh9',  name: 'dev-eu-1',          region: 'EU Central',    provider: 'GCP',   team: 'Development', nodeCount: 3,  cpuUsage: 18, memUsage: 22 },
    { id: 'kh10', name: 'dev-apac-1',        region: 'Asia Pacific',  provider: 'Azure', team: 'ML',          nodeCount: 3,  cpuUsage: 16, memUsage: 20 },
  ];

  const result: ClusterData[] = [];

  for (const def of clusterDefs) {
    const alerts: AlertData[] = def.alertDefs.map(([suffix, name, sev, grp, comp, src, min]) =>
      ({ ...makeKuklasAlert(suffix, name, sev as AlertSeverity, grp as AlertGroup, comp as AlertComponent, src, min, baseTime), clusterName: def.name })
    );
    result.push({
      id: def.id,
      name: def.name,
      region: def.region,
      cloudProvider: def.provider,
      team: def.team,
      namespaces: ['production', 'kube-system', 'monitoring', 'logging'],
      labels: { env: def.name.startsWith('staging') ? 'staging' : 'prod', tier: def.name.startsWith('prod') ? 'critical' : 'standard' },
      alerts,
      nodeCount: def.nodeCount,
      podCount: def.nodeCount * 12,
      cpuUsage: def.cpuUsage,
      memoryUsage: def.memUsage,
      cpuCores: def.nodeCount * 4,
      totalMemory: def.nodeCount * 16,
      vmCount: 0,
      cpuRequests: Math.round(def.cpuUsage * 0.7),
      memoryRequests: Math.round(def.memUsage * 0.65),
      acmStatus: 'Ready',
    });
  }

  for (const h of healthyDefs) {
    result.push({
      id: h.id,
      name: h.name,
      region: h.region,
      cloudProvider: h.provider,
      team: h.team,
      namespaces: ['production', 'kube-system', 'monitoring'],
      labels: { env: h.name.startsWith('dev') ? 'dev' : h.name.startsWith('staging') ? 'staging' : 'prod', tier: 'standard' },
      alerts: [],
      nodeCount: h.nodeCount,
      podCount: h.nodeCount * 10,
      cpuUsage: h.cpuUsage,
      memoryUsage: h.memUsage,
      cpuCores: h.nodeCount * 4,
      totalMemory: h.nodeCount * 16,
      vmCount: 0,
      cpuRequests: Math.round(h.cpuUsage * 0.6),
      memoryRequests: Math.round(h.memUsage * 0.6),
      acmStatus: 'Ready',
    });
  }

  return result;
}

/** Full fleet dataset: fixed kuklas-aligned clusters (timestamps anchored to `baseTime`). */
export function buildAlertingFleetMockClusters(baseTime: Date = new Date()): ClusterData[] {
  return buildKuklasMockClusters(baseTime);
}

/** Snapshot at module load — prefer `buildAlertingFleetMockClusters(new Date())` in UI so time filters stay aligned. */
export const mockClusters: ClusterData[] = buildAlertingFleetMockClusters(now);

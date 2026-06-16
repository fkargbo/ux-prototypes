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
    targetClusters: ['OCP-Prod-East', 'OCP-Prod-West', 'OCP-Stage-AppC'],
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
    createdAt: '12 July, 2025 In OCP-Prod-West cluster',
    createdBy: 'adiadmin@nyp.com',
    modificationHistory: [
      { date: '12 July, 2025 12:36:01 PM', user: 'person1@company.com' },
      { date: '18 July, 2025 02:12:19 AM', user: 'person2@company.com' },
    ],
    activeAlerts: [
      { id: 'aa1', message: 'Node k8s-node-01 CPU utilization is critically high (96.2%).', cluster: 'OCP-Prod-East', activeSince: 'Jul 15, 2025, 8:14 AM', state: 'Firing', value: '---', resource: 'k8s-node-01' },
      { id: 'aa2', message: 'Node k8s-node-04 CPU utilization is critically high (95.8%).', cluster: 'OCP-Prod-East', activeSince: 'Jul 15, 2025, 8:20 AM', state: 'Firing', value: '---', resource: 'k8s-node-04' },
      { id: 'aa3', message: 'Node k8s-node-02 CPU utilization is critically high (98.1%).', cluster: 'OCP-Prod-West', activeSince: 'Jul 15, 2025, 8:25 AM', state: 'Firing', value: '---', resource: 'k8s-node-02' },
      { id: 'aa4', message: 'Node k8s-node-03 CPU utilization is critically high (97.5%).', cluster: 'OCP-Stage-AppC', activeSince: 'Jul 15, 2025, 8:14 AM', state: 'Firing', value: '---', resource: 'k8s-node-01' },
    ],
    enabled: true,
  },
  {
    id: 'ar2',
    name: 'API Server Request Latency High',
    description: 'API Server request latency exceeds threshold',
    severity: 'Warning',
    state: 'Active',
    targetClusters: ['OCP-Prod-East'],
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
    targetClusters: ['OCP-Prod-East', 'OCP-Prod-West', 'OCP-Stage-AppC', 'OCP-Dev-1', 'OCP-Dev-2'],
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
    targetClusters: ['OCP-Prod-East', 'OCP-Prod-West', 'OCP-Stage-AppC', 'OCP-Dev-1'],
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
    targetClusters: ['OCP-Prod-East', 'OCP-Prod-West', 'OCP-Stage-AppC', 'OCP-Dev-1', 'OCP-Dev-2', 'OCP-Dev-3', 'OCP-Test-1'],
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
    targetClusters: ['OCP-Prod-East', 'OCP-Prod-West', 'OCP-Stage-AppC', 'OCP-Dev-1', 'OCP-Dev-2', 'OCP-Dev-3', 'OCP-Test-1', 'OCP-Test-2'],
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
    targetClusters: ['OCP-Prod-East'],
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
    targetClusters: ['OCP-Prod-East', 'OCP-Prod-West', 'OCP-Stage-AppC', 'OCP-Dev-1'],
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
  { timestamp: '1h ago', critical: 4, warning: 10, info: 5 },
  { timestamp: 'Now', critical: 5, warning: 8, info: 4 },
];

// ============================================================
// FIXED DETERMINISTIC CLUSTER DATA
// Produces exactly the 17 aggregated alert rows visible on the
// live reference page (kuklas.github.io/HPUX-Prototypes).
//
// Row index → alertName / severity / totalCount / clusterCount / group / component / source
//  R1  PodCrashLoopBackOff  Critical  2  2   Cluster    Network         User
//  R2  HighMemoryUsage      Critical  2  2   Cluster    Pod             User
//  R3  ETCDHighLatency      Critical  2  2   Cluster    Pod             User
//  R4  DiskPressure         Critical  1  1   Namespace  Network         User
//  R5  HighCPUUsage         Warning   4  4   Cluster    Network         User
//  R6  NetworkLatency       Warning   4  3   Cluster    Pod             Platform
//  R7  QuotaWarning         Warning   5  5   Cluster    Quota           Platform
//  R8  PodCrashLoopBackOff  Warning   6  6   Cluster    Workload        User
//  R9  ETCDHighLatency      Warning   6  6   Namespace  Quota           User
//  R10 ServiceUnavailable   Warning   2  2   Namespace  Quota           User
//  R11 DiskPressure         Warning   2  2   Namespace  Quota           User
//  R12 QuotaWarning         Info      2  2   Cluster    kube-apiserver  Platform
//  R13 NetworkLatency       Info      4  4   Cluster    Pod             Platform
//  R14 CertExpiring         Info      3  3   Cluster    Pod             Platform
//  R15 ServiceUnavailable   Info      4  4   Cluster    Quota           Platform
//  R16 HighMemoryUsage      Info      2  2   Namespace  Controller      User
//  R17 PodCrashLoopBackOff  Info      5  3   Namespace  Workload        User
// ============================================================

function makeAlert(
  idSuffix: string,
  alertName: string,
  severity: AlertSeverity,
  group: AlertGroup,
  component: AlertComponent,
  source: string,
  minutesAgo: number,
): AlertData {
  const lastFiredStr = minutesAgo < 60
    ? `${minutesAgo} min ago`
    : minutesAgo < 1440
      ? `${Math.floor(minutesAgo / 60)} hour${Math.floor(minutesAgo / 60) > 1 ? 's' : ''} ago`
      : `${Math.floor(minutesAgo / 1440)} day${Math.floor(minutesAgo / 1440) > 1 ? 's' : ''} ago`;
  return {
    id: `alert-${idSuffix}`,
    severity,
    status: 'firing',
    alertName,
    clusterName: '', // filled in below per-cluster
    namespace: group === 'Namespace' ? 'production' : 'kube-system',
    labels: { severity: severity.toLowerCase(), source: source.toLowerCase() },
    summary: `${alertName} detected`,
    lastFired: lastFiredStr,
    lastFiredTimestamp: new Date(now.getTime() - minutesAgo * 60000),
    details: `${alertName} requires immediate attention. Check runbook for remediation steps.`,
    source,
    count: 1,
    group,
    component,
    description: `This alert indicates a ${alertName.toLowerCase()} condition affecting ${group === 'Namespace' ? 'a namespace' : 'the cluster'}.`,
    runbookUrl: `https://runbooks.example.com/alerts/${alertName}`,
  };
}

function withClusterName(alert: AlertData, clusterName: string): AlertData {
  return { ...alert, clusterName };
}

export const generateMockClusters = (): ClusterData[] => {
  // ── 8 clusters with firing alerts ──────────────────────────────────────────

  const clusterDefs: Array<{
    id: string; name: string; region: string; provider: string; team: string;
    nodeCount: number; cpuUsage: number; memUsage: number;
    alerts: AlertData[];
  }> = [
    {
      id: 'c1', name: 'prod-us-east-1', region: 'US East', provider: 'AWS', team: 'Platform',
      nodeCount: 18, cpuUsage: 72, memUsage: 68,
      alerts: [
        makeAlert('e1-r1',  'PodCrashLoopBackOff', 'Critical', 'Cluster',   'Network',        'User',     45),
        makeAlert('e1-r2',  'HighMemoryUsage',     'Critical', 'Cluster',   'Pod',            'User',     30),
        makeAlert('e1-r5',  'HighCPUUsage',        'Warning',  'Cluster',   'Network',        'User',     90),
        makeAlert('e1-r6a', 'NetworkLatency',      'Warning',  'Cluster',   'Pod',            'Platform', 120),
        makeAlert('e1-r6b', 'NetworkLatency',      'Warning',  'Cluster',   'Pod',            'Platform', 135),
        makeAlert('e1-r7',  'QuotaWarning',        'Warning',  'Cluster',   'Quota',          'Platform', 200),
        makeAlert('e1-r8',  'PodCrashLoopBackOff', 'Warning',  'Cluster',   'Workload',       'User',     55),
        makeAlert('e1-r9',  'ETCDHighLatency',     'Warning',  'Namespace', 'Quota',          'User',     180),
        makeAlert('e1-r12', 'QuotaWarning',        'Info',     'Cluster',   'kube-apiserver', 'Platform', 250),
        makeAlert('e1-r13', 'NetworkLatency',      'Info',     'Cluster',   'Pod',            'Platform', 300),
        makeAlert('e1-r14', 'CertExpiring',        'Info',     'Cluster',   'Pod',            'Platform', 350),
        makeAlert('e1-r15', 'ServiceUnavailable',  'Info',     'Cluster',   'Quota',          'Platform', 280),
        makeAlert('e1-r17a','PodCrashLoopBackOff', 'Info',     'Namespace', 'Workload',       'User',     40),
        makeAlert('e1-r17b','PodCrashLoopBackOff', 'Info',     'Namespace', 'Workload',       'User',     50),
      ],
    },
    {
      id: 'c2', name: 'prod-us-east-2', region: 'US East', provider: 'AWS', team: 'Platform',
      nodeCount: 14, cpuUsage: 58, memUsage: 61,
      alerts: [
        makeAlert('e2-r1',  'PodCrashLoopBackOff', 'Critical', 'Cluster',   'Network',        'User',     50),
        makeAlert('e2-r5',  'HighCPUUsage',        'Warning',  'Cluster',   'Network',        'User',     85),
        makeAlert('e2-r7',  'QuotaWarning',        'Warning',  'Cluster',   'Quota',          'Platform', 210),
        makeAlert('e2-r8',  'PodCrashLoopBackOff', 'Warning',  'Cluster',   'Workload',       'User',     60),
        makeAlert('e2-r9',  'ETCDHighLatency',     'Warning',  'Namespace', 'Quota',          'User',     190),
        makeAlert('e2-r12', 'QuotaWarning',        'Info',     'Cluster',   'kube-apiserver', 'Platform', 260),
        makeAlert('e2-r13', 'NetworkLatency',      'Info',     'Cluster',   'Pod',            'Platform', 310),
        makeAlert('e2-r15', 'ServiceUnavailable',  'Info',     'Cluster',   'Quota',          'Platform', 290),
      ],
    },
    {
      id: 'c3', name: 'prod-us-west-1', region: 'US West', provider: 'GCP', team: 'Platform',
      nodeCount: 16, cpuUsage: 64, memUsage: 70,
      alerts: [
        makeAlert('w1-r2',   'HighMemoryUsage',     'Critical', 'Cluster',   'Pod',      'User',     35),
        makeAlert('w1-r5',   'HighCPUUsage',        'Warning',  'Cluster',   'Network',  'User',     95),
        makeAlert('w1-r6',   'NetworkLatency',      'Warning',  'Cluster',   'Pod',      'Platform', 140),
        makeAlert('w1-r7',   'QuotaWarning',        'Warning',  'Cluster',   'Quota',    'Platform', 220),
        makeAlert('w1-r8',   'PodCrashLoopBackOff', 'Warning',  'Cluster',   'Workload', 'User',     65),
        makeAlert('w1-r9',   'ETCDHighLatency',     'Warning',  'Namespace', 'Quota',    'User',     195),
        makeAlert('w1-r11',  'DiskPressure',        'Warning',  'Namespace', 'Quota',    'User',     230),
        makeAlert('w1-r13',  'NetworkLatency',      'Info',     'Cluster',   'Pod',      'Platform', 315),
        makeAlert('w1-r14',  'CertExpiring',        'Info',     'Cluster',   'Pod',      'Platform', 360),
        makeAlert('w1-r17a', 'PodCrashLoopBackOff', 'Info',     'Namespace', 'Workload', 'User',     45),
        makeAlert('w1-r17b', 'PodCrashLoopBackOff', 'Info',     'Namespace', 'Workload', 'User',     55),
      ],
    },
    {
      id: 'c4', name: 'prod-us-west-2', region: 'US West', provider: 'GCP', team: 'Data',
      nodeCount: 10, cpuUsage: 49, memUsage: 55,
      alerts: [
        makeAlert('w2-r5',  'HighCPUUsage',        'Warning',  'Cluster',   'Network',  'User',     100),
        makeAlert('w2-r7',  'QuotaWarning',        'Warning',  'Cluster',   'Quota',    'Platform', 215),
        makeAlert('w2-r8',  'PodCrashLoopBackOff', 'Warning',  'Cluster',   'Workload', 'User',     70),
        makeAlert('w2-r9',  'ETCDHighLatency',     'Warning',  'Namespace', 'Quota',    'User',     185),
        makeAlert('w2-r11', 'DiskPressure',        'Warning',  'Namespace', 'Quota',    'User',     240),
      ],
    },
    {
      id: 'c5', name: 'prod-eu-central-1', region: 'EU Central', provider: 'Azure', team: 'Platform',
      nodeCount: 20, cpuUsage: 76, memUsage: 72,
      alerts: [
        makeAlert('ec1-r3',  'ETCDHighLatency',     'Critical', 'Cluster',   'Pod',            'User',     25),
        makeAlert('ec1-r6',  'NetworkLatency',      'Warning',  'Cluster',   'Pod',            'Platform', 145),
        makeAlert('ec1-r7',  'QuotaWarning',        'Warning',  'Cluster',   'Quota',          'Platform', 225),
        makeAlert('ec1-r8',  'PodCrashLoopBackOff', 'Warning',  'Cluster',   'Workload',       'User',     75),
        makeAlert('ec1-r9',  'ETCDHighLatency',     'Warning',  'Namespace', 'Quota',          'User',     175),
        makeAlert('ec1-r13', 'NetworkLatency',      'Info',     'Cluster',   'Pod',            'Platform', 320),
        makeAlert('ec1-r14', 'CertExpiring',        'Info',     'Cluster',   'Pod',            'Platform', 370),
        makeAlert('ec1-r15', 'ServiceUnavailable',  'Info',     'Cluster',   'Quota',          'Platform', 285),
        makeAlert('ec1-r17', 'PodCrashLoopBackOff', 'Info',     'Namespace', 'Workload',       'User',     60),
      ],
    },
    {
      id: 'c6', name: 'prod-eu-west-1', region: 'EU West', provider: 'Azure', team: 'Security',
      nodeCount: 12, cpuUsage: 55, memUsage: 59,
      alerts: [
        makeAlert('ew1-r3',  'ETCDHighLatency',    'Critical', 'Cluster',   'Pod',     'User',     20),
        makeAlert('ew1-r8',  'PodCrashLoopBackOff','Warning',  'Cluster',   'Workload','User',     80),
        makeAlert('ew1-r9',  'ETCDHighLatency',    'Warning',  'Namespace', 'Quota',   'User',     170),
        makeAlert('ew1-r15', 'ServiceUnavailable', 'Info',     'Cluster',   'Quota',   'Platform', 295),
      ],
    },
    {
      id: 'c7', name: 'staging-us-1', region: 'US East', provider: 'AWS', team: 'QA',
      nodeCount: 6, cpuUsage: 38, memUsage: 42,
      alerts: [
        makeAlert('su1-r4',  'DiskPressure',       'Critical', 'Namespace', 'Network',    'User', 15),
        makeAlert('su1-r10', 'ServiceUnavailable', 'Warning',  'Namespace', 'Quota',      'User', 110),
        makeAlert('su1-r16', 'HighMemoryUsage',    'Info',     'Namespace', 'Controller', 'User', 330),
      ],
    },
    {
      id: 'c8', name: 'staging-eu-1', region: 'EU West', provider: 'GCP', team: 'QA',
      nodeCount: 5, cpuUsage: 32, memUsage: 38,
      alerts: [
        makeAlert('seu1-r10', 'ServiceUnavailable','Warning',  'Namespace', 'Quota',      'User', 115),
        makeAlert('seu1-r16', 'HighMemoryUsage',   'Info',     'Namespace', 'Controller', 'User', 335),
      ],
    },
  ];

  // ── 10 healthy clusters (no firing alerts) ──────────────────────────────────
  const healthyClusters: Array<{ id: string; name: string; region: string; provider: string; team: string; nodeCount: number; cpuUsage: number; memUsage: number }> = [
    { id: 'h1',  name: 'prod-apac-1',      region: 'Asia Pacific',  provider: 'AWS',   team: 'Platform',    nodeCount: 15, cpuUsage: 42, memUsage: 45 },
    { id: 'h2',  name: 'prod-apac-2',      region: 'Asia Pacific',  provider: 'GCP',   team: 'Data',        nodeCount: 12, cpuUsage: 38, memUsage: 41 },
    { id: 'h3',  name: 'prod-sa-1',        region: 'South America', provider: 'Azure', team: 'Development', nodeCount: 8,  cpuUsage: 35, memUsage: 39 },
    { id: 'h4',  name: 'prod-us-central-1',region: 'US Central',    provider: 'AWS',   team: 'Platform',    nodeCount: 18, cpuUsage: 44, memUsage: 50 },
    { id: 'h5',  name: 'prod-eu-north-1',  region: 'EU West',       provider: 'Azure', team: 'Security',    nodeCount: 10, cpuUsage: 30, memUsage: 35 },
    { id: 'h6',  name: 'staging-us-2',     region: 'US West',       provider: 'GCP',   team: 'QA',          nodeCount: 5,  cpuUsage: 28, memUsage: 32 },
    { id: 'h7',  name: 'staging-apac-1',   region: 'Asia Pacific',  provider: 'AWS',   team: 'QA',          nodeCount: 4,  cpuUsage: 22, memUsage: 28 },
    { id: 'h8',  name: 'dev-us-1',         region: 'US East',       provider: 'AWS',   team: 'Development', nodeCount: 4,  cpuUsage: 20, memUsage: 25 },
    { id: 'h9',  name: 'dev-eu-1',         region: 'EU Central',    provider: 'GCP',   team: 'Development', nodeCount: 3,  cpuUsage: 18, memUsage: 22 },
    { id: 'h10', name: 'dev-apac-1',       region: 'Asia Pacific',  provider: 'Azure', team: 'ML',          nodeCount: 3,  cpuUsage: 16, memUsage: 20 },
  ];

  const result: ClusterData[] = [];

  for (const def of clusterDefs) {
    const alerts = def.alerts.map(a => withClusterName(a, def.name));
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

  for (const h of healthyClusters) {
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
};

export const mockClusters: ClusterData[] = generateMockClusters();

/**
 * Mock dataset for Autonomous analysis — values match cursor-prompt-cluster-monitoring-console.md
 */

export type ClusterHealth = 'critical' | 'degraded' | 'healthy';
export type AgentPulseStatus = 'investigating' | 'remediating' | 'escalated' | 'idle';
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type ReasoningStepStatus = 'done' | 'active' | 'pending' | 'alert';
export type ViewMode = 'fleet' | 'cluster';

export interface ClusterRecord {
  id: string;
  name: string;
  region: string;
  provider: string;
  env: 'prod' | 'staging' | 'dev';
  version: string;
  nodes: number;
  health: ClusterHealth;
  agentStatus: AgentPulseStatus;
}

export interface ReasoningStep {
  id: string;
  time?: string;
  status: ReasoningStepStatus;
  title: string;
  detail?: string;
  /** PatternFly icon component name hint — resolved in UI */
  icon: 'exclamation' | 'database' | 'network' | 'search' | 'check';
}

/**
 * Structured “AI insight” for transparency above the Active Reasoning Chain:
 * category → headline (agent move) → evidence (signals) → optional narrative (synthesis).
 */
export interface AlertAiInsight {
  /** e.g. "AI insight · Correlation" */
  categoryLabel: string;
  /** Short headline — anchor / grouping / scope */
  headline: string;
  /** Evidence line — metrics, clusters, time windows */
  evidence: string;
  /** Optional first-person or plain-language synthesis */
  narrative?: string;
}

export interface AlertRecord {
  id: string;
  clusterId: string;
  severity: AlertSeverity;
  title: string;
  service: string;
  age: string;
  /** ISO 8601 instant when the alert began firing (OpenShift-style header date). */
  firedAt: string;
  /** One-line user-facing description under the alert name (OpenShift-style message). */
  message: string;
  agentStatus: AgentPulseStatus;
  steps: ReasoningStep[];
  rcaSummary: string;
  rootCauseRef: string;
  rootCauseTail: string;
  confidence: number;
  logLines: string;
  blastRadius: string[];
  remediationSummary: string;
  remediationCommands: string;
  estimatedRecovery: string;
  /** Downtime / blast-radius framing for advisor responses (plain language, no “simulated”). */
  remediationRiskSummary: string;
  /** How Autonomous analysis reached the current conclusion (evidence chain, console-style). */
  agentInvestigationNarrative: string;
  /** Labeled AI transparency block (title / evidence / narrative). */
  aiInsight: AlertAiInsight;
}

/**
 * Fleet-scoped critical incident (not tied to a single clusterId) — surfaced only in Fleet management view.
 */
export interface FleetWideCriticalIncident {
  id: string;
  title: string;
  severity: AlertSeverity;
  firedAt: string;
  agentStatus: AgentPulseStatus;
  /** Clusters included in the causal story (ids into `CLUSTERS`). */
  affectedClusterIds: string[];
  correlatedAlertCount: number;
  /** Structured AI insight (replaces a single undifferentiated summary paragraph). */
  aiInsight: AlertAiInsight;
  /** When ingress-to-workload loss began (display string, e.g. for subtitles). */
  symptomStartedDisplay: string;
  /** Active reasoning chain (same shape as per-cluster alerts). */
  steps: ReasoningStep[];
  /** Aggregated RCA — timestamped finding (GitOps, etc.). */
  aggregatedFinding: string;
  /** Aggregated RCA — root cause narrative. */
  rootCauseNarrative: string;
  /** Remediation hub — governor-facing proposal. */
  remediationProposal: string;
  /** Remediation hub — risk / recovery framing. */
  riskAssessment: string;
  estimatedRecovery: string;
}

/** Default cluster when Core platforms loads Observe with no session-stored focus. */
export const DEFAULT_CORE_PLATFORMS_CLUSTER_ID = 'prod-east-2';

export const CLUSTERS: ClusterRecord[] = [
  {
    id: 'prod-east-2',
    name: 'prod-east-2',
    region: 'us-east-2',
    provider: 'AWS',
    env: 'prod',
    version: '4.15.8',
    nodes: 24,
    health: 'critical',
    agentStatus: 'investigating',
  },
  {
    id: 'prod-eu-west-1',
    name: 'prod-eu-west-1',
    region: 'eu-west-1',
    provider: 'AWS',
    env: 'prod',
    version: '4.15.8',
    nodes: 18,
    health: 'critical',
    agentStatus: 'remediating',
  },
  {
    id: 'stg-central',
    name: 'stg-central',
    region: 'us-central-1',
    provider: 'GCP',
    env: 'staging',
    version: '4.16.2',
    nodes: 8,
    health: 'critical',
    agentStatus: 'investigating',
  },
  {
    id: 'edge-apac-1',
    name: 'edge-apac-1',
    region: 'ap-southeast-1',
    provider: 'Azure',
    env: 'prod',
    version: '4.15.6',
    nodes: 12,
    health: 'degraded',
    agentStatus: 'investigating',
  },
  {
    id: 'prod-us-west-2',
    name: 'prod-us-west-2',
    region: 'us-west-2',
    provider: 'AWS',
    env: 'prod',
    version: '4.15.8',
    nodes: 16,
    health: 'healthy',
    agentStatus: 'idle',
  },
  {
    id: 'prod-us-east-1',
    name: 'prod-us-east-1',
    region: 'us-east-1',
    provider: 'AWS',
    env: 'prod',
    version: '4.15.9',
    nodes: 22,
    health: 'critical',
    agentStatus: 'investigating',
  },
  {
    id: 'prod-us-east-1b',
    name: 'prod-us-east-1b',
    region: 'us-east-1',
    provider: 'AWS',
    env: 'prod',
    version: '4.15.9',
    nodes: 20,
    health: 'degraded',
    agentStatus: 'remediating',
  },
  {
    id: 'prod-us-east-1c',
    name: 'prod-us-east-1c',
    region: 'us-east-1',
    provider: 'AWS',
    env: 'prod',
    version: '4.15.8',
    nodes: 19,
    health: 'healthy',
    agentStatus: 'idle',
  },
  {
    id: 'prod-us-west-1',
    name: 'prod-us-west-1',
    region: 'us-west-1',
    provider: 'AWS',
    env: 'prod',
    version: '4.15.8',
    nodes: 17,
    health: 'critical',
    agentStatus: 'investigating',
  },
  {
    id: 'prod-ca-central-1',
    name: 'prod-ca-central-1',
    region: 'ca-central-1',
    provider: 'AWS',
    env: 'prod',
    version: '4.15.8',
    nodes: 14,
    health: 'degraded',
    agentStatus: 'investigating',
  },
  {
    id: 'prod-eu-central-1',
    name: 'prod-eu-central-1',
    region: 'eu-central-1',
    provider: 'AWS',
    env: 'prod',
    version: '4.16.0',
    nodes: 21,
    health: 'critical',
    agentStatus: 'escalated',
  },
  {
    id: 'prod-eu-north-1',
    name: 'prod-eu-north-1',
    region: 'eu-north-1',
    provider: 'AWS',
    env: 'prod',
    version: '4.16.0',
    nodes: 15,
    health: 'healthy',
    agentStatus: 'idle',
  },
  {
    id: 'prod-ap-south-1',
    name: 'prod-ap-south-1',
    region: 'ap-south-1',
    provider: 'AWS',
    env: 'prod',
    version: '4.15.7',
    nodes: 18,
    health: 'critical',
    agentStatus: 'investigating',
  },
  {
    id: 'prod-ap-northeast-1',
    name: 'prod-ap-northeast-1',
    region: 'ap-northeast-1',
    provider: 'AWS',
    env: 'prod',
    version: '4.15.7',
    nodes: 13,
    health: 'degraded',
    agentStatus: 'remediating',
  },
  {
    id: 'prod-sa-east-1',
    name: 'prod-sa-east-1',
    region: 'sa-east-1',
    provider: 'AWS',
    env: 'prod',
    version: '4.15.9',
    nodes: 16,
    health: 'critical',
    agentStatus: 'investigating',
  },
  {
    id: 'stg-eu-central',
    name: 'stg-eu-central',
    region: 'eu-central-1',
    provider: 'GCP',
    env: 'staging',
    version: '4.16.1',
    nodes: 9,
    health: 'degraded',
    agentStatus: 'investigating',
  },
  {
    id: 'stg-us-west',
    name: 'stg-us-west',
    region: 'us-west2',
    provider: 'GCP',
    env: 'staging',
    version: '4.16.1',
    nodes: 11,
    health: 'healthy',
    agentStatus: 'idle',
  },
  {
    id: 'dev-us-east',
    name: 'dev-us-east',
    region: 'us-east4',
    provider: 'GCP',
    env: 'dev',
    version: '4.16.2',
    nodes: 6,
    health: 'degraded',
    agentStatus: 'investigating',
  },
  {
    id: 'dev-eu-west',
    name: 'dev-eu-west',
    region: 'europe-west2',
    provider: 'GCP',
    env: 'dev',
    version: '4.16.2',
    nodes: 5,
    health: 'healthy',
    agentStatus: 'idle',
  },
  {
    id: 'edge-emea-1',
    name: 'edge-emea-1',
    region: 'westeurope',
    provider: 'Azure',
    env: 'prod',
    version: '4.15.6',
    nodes: 10,
    health: 'degraded',
    agentStatus: 'investigating',
  },
];

type SyntheticAlertInput = {
  id: string;
  clusterId: string;
  severity: AlertSeverity;
  title: string;
  service: string;
  age: string;
  firedAt: string;
  message: string;
  rootCauseRef: string;
  rootCauseTail: string;
  estimatedRecovery?: string;
  agentStatus?: AgentPulseStatus;
  confidence?: number;
  category?: string;
  headline?: string;
  narrative?: string;
};

function buildSyntheticAlert(input: SyntheticAlertInput): AlertRecord {
  const status = input.agentStatus ?? 'investigating';
  const category = input.category ?? 'AI insight · Correlation';
  const headline = input.headline ?? `Prioritized ${input.title} for ${input.clusterId}`;
  const narrative =
    input.narrative ??
    `Autonomous analysis correlated cluster telemetry and event timelines to rank ${input.title} as high-impact for ${input.clusterId}.`;
  return {
    id: input.id,
    clusterId: input.clusterId,
    severity: input.severity,
    title: input.title,
    service: input.service,
    age: input.age,
    firedAt: input.firedAt,
    message: input.message,
    agentStatus: status,
    steps: [
      {
        id: `${input.id}-s1`,
        time: '14:31:00',
        status: 'done',
        title: 'Detected correlated anomaly',
        detail: `${input.title} fired with sustained signal overlap`,
        icon: 'exclamation',
      },
      {
        id: `${input.id}-s2`,
        time: '14:31:10',
        status: 'done',
        title: 'Collected supporting metrics',
        detail: `Cross-checked service metrics for ${input.clusterId}`,
        icon: 'database',
      },
      {
        id: `${input.id}-s3`,
        time: '14:31:22',
        status: 'active',
        title: 'Scoring remediation options',
        detail: 'Prioritizing low-risk mitigation first',
        icon: 'search',
      },
      {
        id: `${input.id}-s4`,
        status: 'pending',
        title: 'Publish recommended fix path',
        icon: 'check',
      },
    ],
    rcaSummary: `${input.title} is amplified by ${input.rootCauseTail} in ${input.clusterId}.`,
    rootCauseRef: input.rootCauseRef,
    rootCauseTail: input.rootCauseTail,
    confidence: input.confidence ?? 79,
    logLines: `W 14:31:02 ${input.title} threshold exceeded\nI 14:31:08 evaluating ${input.rootCauseRef}\nI 14:31:17 impact scored for ${input.clusterId}`,
    blastRadius: [input.clusterId, input.service],
    remediationSummary: `Apply targeted remediation on ${input.clusterId} to reduce ${input.title} impact while preserving service availability.`,
    remediationCommands: `$ oc -n ${input.service.split(' / ')[0]} rollout restart deploy/${input.service.split(' / ')[1] || 'workload'}\n$ oc adm top pods -A | head`,
    estimatedRecovery: input.estimatedRecovery ?? '~2m',
    remediationRiskSummary:
      'Medium — remediation touches production traffic path; execute in rolling mode and verify canary health.',
    agentInvestigationNarrative: narrative,
    aiInsight: {
      categoryLabel: category,
      headline,
      evidence: `${input.title} co-occurs with ${input.rootCauseRef} across dependent services.`,
      narrative,
    },
  };
}

const SYNTHETIC_FLEET_ALERTS: AlertRecord[] = [
  buildSyntheticAlert({
    id: 'alrt-9001',
    clusterId: 'prod-us-east-1',
    severity: 'critical',
    title: 'PaymentsAPI5xxSurge',
    service: 'payments / payments-api',
    age: '7m',
    firedAt: '2026-04-29T18:25:00.000Z',
    message: 'Correlated payment failures point to the same request path currently ranked as top-firing.',
    rootCauseRef: 'payments-egress-v3',
    rootCauseTail: 'redis timeout fan-out',
    estimatedRecovery: '~90s',
  }),
  buildSyntheticAlert({
    id: 'alrt-9002',
    clusterId: 'prod-us-east-1b',
    severity: 'critical',
    title: 'PaymentsAPI5xxSurge',
    service: 'payments / payments-api',
    age: '9m',
    firedAt: '2026-04-29T18:23:00.000Z',
    message: '5xx errors mirror top-firing PaymentsAPI pattern and share dependency saturation symptoms.',
    rootCauseRef: 'payments-egress-v3',
    rootCauseTail: 'upstream redis pressure',
    estimatedRecovery: '~2m',
  }),
  buildSyntheticAlert({
    id: 'alrt-9003',
    clusterId: 'prod-us-west-1',
    severity: 'critical',
    title: 'PaymentsAPI5xxSurge',
    service: 'payments / payments-api',
    age: '6m',
    firedAt: '2026-04-29T18:26:00.000Z',
    message: 'Top-firing payment error signature detected with elevated checkout failures.',
    rootCauseRef: 'payments-egress-v3',
    rootCauseTail: 'cache egress deny',
    estimatedRecovery: '~90s',
  }),
  buildSyntheticAlert({
    id: 'alrt-9004',
    clusterId: 'prod-ca-central-1',
    severity: 'critical',
    title: 'PaymentsAPI5xxSurge',
    service: 'payments / payments-api',
    age: '8m',
    firedAt: '2026-04-29T18:24:00.000Z',
    message: 'Cluster shows the same top-firing payment failure envelope and degraded checkout success.',
    rootCauseRef: 'payments-egress-v3',
    rootCauseTail: 'redis connect timeout',
  }),
  buildSyntheticAlert({
    id: 'alrt-9005',
    clusterId: 'prod-eu-central-1',
    severity: 'critical',
    title: 'PaymentsAPI5xxSurge',
    service: 'payments / payments-api',
    age: '12m',
    firedAt: '2026-04-29T18:20:00.000Z',
    message: 'Payment API 5xx surge is now spread to eu-central and remains in top-firing priority.',
    rootCauseRef: 'payments-egress-v3',
    rootCauseTail: 'cache connection collapse',
  }),
  buildSyntheticAlert({
    id: 'alrt-9006',
    clusterId: 'prod-ap-south-1',
    severity: 'critical',
    title: 'EtcdDiskPressureOnMaster2',
    service: 'openshift-etcd / etcd-master-2',
    age: '14m',
    firedAt: '2026-04-29T18:18:00.000Z',
    message: 'Control-plane disk pressure follows the same high-risk etcd pattern in top-firing alerts.',
    rootCauseRef: 'etcd-master-2',
    rootCauseTail: 'wal growth',
    estimatedRecovery: '~4m',
    category: 'AI insight · Capacity',
  }),
  buildSyntheticAlert({
    id: 'alrt-9007',
    clusterId: 'prod-sa-east-1',
    severity: 'critical',
    title: 'EtcdDiskPressureOnMaster2',
    service: 'openshift-etcd / etcd-master-2',
    age: '10m',
    firedAt: '2026-04-29T18:22:00.000Z',
    message: 'etcd pressure trend matches top-firing control-plane risk profile.',
    rootCauseRef: 'etcd-master-2',
    rootCauseTail: 'compaction lag',
    estimatedRecovery: '~3m',
    category: 'AI insight · Capacity',
  }),
  buildSyntheticAlert({
    id: 'alrt-9008',
    clusterId: 'prod-eu-central-1',
    severity: 'critical',
    title: 'EtcdDiskPressureOnMaster2',
    service: 'openshift-etcd / etcd-master-2',
    age: '16m',
    firedAt: '2026-04-29T18:16:00.000Z',
    message: 'Persistent etcd pressure could cascade into API latency if not remediated quickly.',
    rootCauseRef: 'etcd-master-2',
    rootCauseTail: 'quota exceeded',
    estimatedRecovery: '~5m',
    category: 'AI insight · Capacity',
  }),
  buildSyntheticAlert({
    id: 'alrt-9009',
    clusterId: 'prod-us-east-1',
    severity: 'warning',
    title: 'CheckoutSvcCPUThrottling',
    service: 'payments / checkout-svc',
    age: '20m',
    firedAt: '2026-04-29T18:12:00.000Z',
    message: 'Secondary warning likely to improve once top-firing payment path is stabilized.',
    rootCauseRef: 'checkout-hpa-cap',
    rootCauseTail: 'cpu saturation',
    category: 'AI insight · Performance',
  }),
  buildSyntheticAlert({
    id: 'alrt-9010',
    clusterId: 'prod-us-east-1b',
    severity: 'warning',
    title: 'CheckoutSvcCPUThrottling',
    service: 'payments / checkout-svc',
    age: '19m',
    firedAt: '2026-04-29T18:13:00.000Z',
    message: 'Checkout throttling appears as a dependent symptom of payment-tier instability.',
    rootCauseRef: 'checkout-hpa-cap',
    rootCauseTail: 'max replicas reached',
    category: 'AI insight · Performance',
  }),
  buildSyntheticAlert({
    id: 'alrt-9011',
    clusterId: 'stg-eu-central',
    severity: 'warning',
    title: 'IngressTLSCertExpiresIn36h',
    service: 'openshift-ingress / router-default',
    age: '5m',
    firedAt: '2026-04-29T18:27:00.000Z',
    message: 'Non-top warning: cert expiry issue is important but lower immediate blast radius.',
    rootCauseRef: 'wildcard-stg-eu',
    rootCauseTail: 'renewBefore window',
    category: 'AI insight · Security posture',
  }),
  buildSyntheticAlert({
    id: 'alrt-9012',
    clusterId: 'dev-us-east',
    severity: 'critical',
    title: 'NodeFilesystemAlmostFull',
    service: 'openshift-node / kubelet',
    age: '17m',
    firedAt: '2026-04-29T18:15:00.000Z',
    message: 'Critical but isolated to dev node pool; not ranked in top-firing fleet blast radius.',
    rootCauseRef: 'worker-disk-95pct',
    rootCauseTail: '/var/lib/containers',
    category: 'AI insight · Capacity',
  }),
  buildSyntheticAlert({
    id: 'alrt-9013',
    clusterId: 'edge-emea-1',
    severity: 'critical',
    title: 'NodeFilesystemAlmostFull',
    service: 'openshift-node / kubelet',
    age: '21m',
    firedAt: '2026-04-29T18:11:00.000Z',
    message: 'Edge node filesystem pressure is critical locally but lower fleet-wide dependency impact.',
    rootCauseRef: 'edge-cache-growth',
    rootCauseTail: '/var/lib/containers',
    category: 'AI insight · Capacity',
  }),
  buildSyntheticAlert({
    id: 'alrt-9014',
    clusterId: 'prod-ap-northeast-1',
    severity: 'warning',
    title: 'ImageRegistryPersistentVolumeFull',
    service: 'openshift-image-registry / image-registry',
    age: '28m',
    firedAt: '2026-04-29T18:04:00.000Z',
    message: 'Registry growth warning may clear after payload cleanup; not currently top-firing.',
    rootCauseRef: 'registry-pv-growth',
    rootCauseTail: 'unused image layers',
    category: 'AI insight · Hygiene',
  }),
  buildSyntheticAlert({
    id: 'alrt-9015',
    clusterId: 'prod-eu-north-1',
    severity: 'warning',
    title: 'APIIngressLatencySpike',
    service: 'openshift-ingress / router-default',
    age: '13m',
    firedAt: '2026-04-29T18:19:00.000Z',
    message: 'Latency spike is correlated but below top-firing impact threshold so ranked lower.',
    rootCauseRef: 'router-queue-latency',
    rootCauseTail: 'retry amplification',
    category: 'AI insight · Correlation',
  }),
  buildSyntheticAlert({
    id: 'alrt-9016',
    clusterId: 'prod-us-east-1c',
    severity: 'warning',
    title: 'APIIngressLatencySpike',
    service: 'openshift-ingress / router-default',
    age: '12m',
    firedAt: '2026-04-29T18:20:00.000Z',
    message: 'Related ingress latency warning likely to reduce if top-firing ingress path is stabilized.',
    rootCauseRef: 'router-queue-latency',
    rootCauseTail: 'downstream backpressure',
    category: 'AI insight · Correlation',
  }),
  buildSyntheticAlert({
    id: 'alrt-9017',
    clusterId: 'stg-us-west',
    severity: 'info',
    title: 'ControlPlaneNodeNotReadyFlap',
    service: 'openshift-control-plane / kube-controller-manager',
    age: '31m',
    firedAt: '2026-04-29T18:01:00.000Z',
    message: 'Intermittent control-plane flap observed in staging; monitored but not top-firing.',
    rootCauseRef: 'transient-provider-reset',
    rootCauseTail: 'single node flap',
    category: 'AI insight · Monitoring',
  }),
  buildSyntheticAlert({
    id: 'alrt-9018',
    clusterId: 'dev-eu-west',
    severity: 'warning',
    title: 'MDSCacheUsageHigh',
    service: 'odf / ceph-mds',
    age: '26m',
    firedAt: '2026-04-29T18:06:00.000Z',
    message: 'Storage warning is unrelated to top-firing payment/ingress paths and ranked lower.',
    rootCauseRef: 'ceph-mds-cache',
    rootCauseTail: 'cache pressure',
    category: 'AI insight · Storage',
  }),
];

export const ALERTS: AlertRecord[] = [
  {
    id: 'alrt-8821',
    clusterId: 'prod-east-2',
    severity: 'critical',
    title: 'PaymentsAPI5xxSurge',
    service: 'payments / payments-api',
    age: '4m',
    firedAt: '2026-04-29T18:18:00.000Z',
    message: 'Server errors from payments-api are elevated; clients may see failed or slow checkouts.',
    agentStatus: 'investigating',
    steps: [
      {
        id: 's1',
        time: '14:22:01',
        status: 'done',
        title: 'Detected anomaly in payments-api',
        detail: 'Latency p99 spike → 4.2s',
        icon: 'exclamation',
      },
      {
        id: 's2',
        time: '14:22:04',
        status: 'done',
        title: 'Fetched Kube Events',
        detail: '32 events across 4 namespaces',
        icon: 'database',
      },
      {
        id: 's3',
        time: '14:22:09',
        status: 'done',
        title: 'Correlated with network policies',
        detail: 'egress rule changed 3m ago',
        icon: 'network',
      },
      {
        id: 's4',
        time: '14:22:14',
        status: 'active',
        title: 'Analyzing pod restart patterns',
        detail: 'checking CrashLoopBackOff signatures',
        icon: 'search',
      },
      {
        id: 's5',
        time: '00:00:00',
        status: 'pending',
        title: 'Generate remediation plan',
        icon: 'check',
      },
    ],
    rcaSummary:
      'NetworkPolicy applied at 14:18 UTC blocks egress to redis cache, causing connection timeouts in payments-api pods and cascading 5xx errors at the gateway.',
    rootCauseRef: 'payments-egress-v3',
    rootCauseTail: 'redis-cache.svc.cluster.local:6379',
    confidence: 87,
    logLines: `E 14:21:58 dial tcp 10.0.4.12:6379:
  i/o timeout
W 14:21:59 redis pool exhausted (32/32)
E 14:22:00 payment_intent failed:
  upstream connect error`,
    blastRadius: ['payments-api-7f4c', 'payments-api-9b2d', 'checkout-svc', 'ingress-gw', 'redis-cache-0'],
    remediationSummary:
      'Roll back NetworkPolicy payments-egress-v3 to revision v2 and restart affected payments-api pods. No data-plane impact expected.',
    remediationCommands: `$ kubectl rollout undo netpol/payments-egress-v3 -n payments
$ kubectl rollout restart deploy/payments-api -n payments`,
    estimatedRecovery: '~45s',
    remediationRiskSummary:
      'Medium–High — rolling back netpol and restarting payments-api can cause sub-minute errors on checkout paths while endpoints converge.',
    agentInvestigationNarrative:
      'Autonomous analysis correlated Kube events, NetworkPolicy change timestamps, and pod restart signatures on payments-api before locking onto egress to redis-cache.',
    aiInsight: {
      categoryLabel: 'AI insight · Correlation',
      headline: 'Scoped egress failure to redis behind payments-api',
      evidence:
        'Kube events + NetworkPolicy timestamps align with redis dial timeouts on payments-api replicas.',
      narrative:
        "I've tied the 5xx surge to egress blocked to redis-cache — next I'm validating rollback blast radius before recommending undo.",
    },
  },
  {
    id: 'alrt-8819',
    clusterId: 'prod-east-2',
    severity: 'critical',
    title: 'EtcdDiskPressureOnMaster2',
    service: 'openshift-etcd / etcd-master-2',
    age: '11m',
    firedAt: '2026-04-29T18:11:00.000Z',
    message: 'etcd data volume is low on disk space; control plane stability may be at risk.',
    agentStatus: 'investigating',
    steps: [
      {
        id: 'e1',
        time: '14:15:32',
        status: 'done',
        title: 'DiskPressure condition on master-2',
        detail: 'node tainted automatically',
        icon: 'exclamation',
      },
      {
        id: 'e2',
        time: '14:15:40',
        status: 'done',
        title: 'Inspected etcd WAL size',
        detail: '12.4 GB / 8 GB threshold',
        icon: 'database',
      },
      {
        id: 'e3',
        time: '14:15:55',
        status: 'active',
        title: 'Compacting historical revisions',
        detail: 'rev 88_421_003 → 88_700_112',
        icon: 'search',
      },
      {
        id: 'e4',
        status: 'pending',
        title: 'Validate quorum post-compaction',
        icon: 'check',
      },
    ],
    rcaSummary:
      'etcd WAL exceeded 8 GB threshold on master-2 due to skipped auto-compaction window during last upgrade. Disk pressure risks quorum stability.',
    rootCauseRef: 'etcd-master-2',
    rootCauseTail: '/var/lib/etcd',
    confidence: 92,
    logLines: `W 14:15:30 mvcc: storage backend quota exceeded
W 14:15:31 apply request took too long (412ms)
E 14:15:32 DiskPressure: available 4% (<10%)`,
    blastRadius: ['etcd-master-2', 'kube-apiserver-2', 'controller-manager'],
    remediationSummary:
      'Trigger etcd defrag on master-2 after compaction completes; expand PV by 20 GB and reschedule auto-compaction every 6h.',
    remediationCommands: `$ etcdctl --endpoints=master-2:2379 defrag
$ oc patch pvc etcd-master-2 -p '{"spec":{"resources":{"requests":{"storage":"60Gi"}}}}'`,
    estimatedRecovery: '~3m',
    remediationRiskSummary:
      'High — etcd maintenance on a control-plane member can briefly lengthen API write latency; schedule during a maintenance window if possible.',
    agentInvestigationNarrative:
      'Autonomous analysis read node conditions, etcd WAL metrics, and compaction state on master-2 to confirm disk pressure as the limiting factor.',
    aiInsight: {
      categoryLabel: 'AI insight · Capacity',
      headline: 'Prioritized etcd WAL under DiskPressure on master-2',
      evidence:
        'Node condition timeline matches WAL growth beyond quota; compaction lag explains sustained API latency.',
      narrative:
        "I'm treating skipped compaction after upgrade as the primary risk — expanding disk and defrag reduces quorum hazard next.",
    },
  },
  {
    id: 'alrt-8814',
    clusterId: 'prod-eu-west-1',
    severity: 'warning',
    title: 'CheckoutSvcCPUThrottling',
    service: 'payments / checkout-svc',
    age: '22m',
    firedAt: '2026-04-29T18:00:00.000Z',
    message: 'Pods are CPU-throttled because requests and limits are below current demand.',
    agentStatus: 'remediating',
    steps: [
      {
        id: 'c1',
        time: '14:04:10',
        status: 'done',
        title: 'CPU throttling > 35% sustained',
        detail: 'across 3/4 replicas',
        icon: 'exclamation',
      },
      {
        id: 'c2',
        time: '14:04:18',
        status: 'done',
        title: 'Reviewed HPA history',
        detail: 'scaled 4→4 (max reached)',
        icon: 'database',
      },
      {
        id: 'c3',
        time: '14:04:25',
        status: 'done',
        title: 'Profiled hot path',
        detail: 'JSON serialization 41% of CPU',
        icon: 'search',
      },
      {
        id: 'c4',
        time: '14:04:30',
        status: 'done',
        title: 'Plan ready',
        detail: 'raise HPA max + bump requests',
        icon: 'check',
      },
    ],
    rcaSummary:
      'checkout-svc hit HPA ceiling of 4 replicas while sustained traffic grew 2.1x week-over-week. CPU requests under-provisioned for current shape.',
    rootCauseRef: 'checkout-svc',
    rootCauseTail: 'hpa: max=4 cpu.req=250m',
    confidence: 78,
    logLines: `I 14:03:55 cpu_throttled_seconds_total +0.42/s
I 14:04:02 hpa: desired=6 current=4 (capped)
W 14:04:10 request latency p95 = 1.8s`,
    blastRadius: ['checkout-svc-a1', 'checkout-svc-b2', 'checkout-svc-c3', 'checkout-svc-d4'],
    remediationSummary:
      'Raise HPA max replicas to 8 and bump CPU request from 250m → 500m. Safe rolling update; no downtime expected.',
    remediationCommands: `$ oc patch hpa checkout-svc -p '{"spec":{"maxReplicas":8}}'
$ oc set resources deploy/checkout-svc --requests=cpu=500m`,
    estimatedRecovery: '~90s',
    remediationRiskSummary:
      'Low–Medium — HPA and resource bumps are rolling; expect brief CPU scheduling noise only.',
    agentInvestigationNarrative:
      'Autonomous analysis compared HPA events, replica saturation, and container CPU throttling metrics on checkout-svc to justify raising limits.',
    aiInsight: {
      categoryLabel: 'AI insight · Performance',
      headline: 'CPU starvation before horizontal scale could help',
      evidence:
        'HPA maxReplicas reached while cpu_throttled_seconds grows — requests sit below sustained load shape.',
      narrative:
        "I've queued a safe HPA max + CPU request bump; expecting rolling noise only during the rollout.",
    },
  },
  {
    id: 'alrt-8830',
    clusterId: 'edge-apac-1',
    severity: 'warning',
    title: 'IngressTLSCertExpiresIn36h',
    service: 'openshift-ingress / router-default',
    age: '2m',
    firedAt: '2026-04-29T18:24:00.000Z',
    message: 'Router TLS certificate is nearing expiry; renew before clients see trust or handshake errors.',
    agentStatus: 'investigating',
    steps: [
      {
        id: 't1',
        time: '14:24:00',
        status: 'done',
        title: 'Cert-manager probe flagged renewal',
        detail: 'expiry: 2026-04-27 02:11 UTC',
        icon: 'exclamation',
      },
      {
        id: 't2',
        time: '14:24:08',
        status: 'done',
        title: 'Checked ACME challenge readiness',
        detail: 'DNS-01 provider reachable',
        icon: 'network',
      },
      {
        id: 't3',
        time: '14:24:14',
        status: 'active',
        title: 'Drafting renewal CertificateRequest',
        icon: 'search',
      },
      {
        id: 't4',
        status: 'pending',
        title: 'Apply & verify chain',
        icon: 'check',
      },
    ],
    rcaSummary:
      'Wildcard cert *.apac.example.com nearing expiry; auto-renewal disabled during last edge maintenance window and never re-enabled.',
    rootCauseRef: 'wildcard-apac',
    rootCauseTail: 'auto-renew=false',
    confidence: 95,
    logLines: `I 14:23:55 cert-manager: 36h to expiry
W 14:23:56 renewBefore window entered
I 14:24:00 issuer letsencrypt-prod ready`,
    blastRadius: ['router-default', '*.apac.example.com'],
    remediationSummary:
      'Re-enable auto-renewal on the wildcard Certificate resource and trigger an immediate renewal via cert-manager.',
    remediationCommands: `$ oc annotate certificate wildcard-apac cert-manager.io/renew=true --overwrite
$ oc delete certificaterequest -l cert=wildcard-apac`,
    estimatedRecovery: '~2m',
    remediationRiskSummary:
      'Medium — ingress reload on renewal can drop a small number of in-flight TLS handshakes during router rollout.',
    agentInvestigationNarrative:
      'Autonomous analysis verified cert-manager issuer health, renewal windows, and router-default attachment for the wildcard before prioritizing renewal.',
    aiInsight: {
      categoryLabel: 'AI insight · Security posture',
      headline: 'Renewal path clear before clients hit trust errors',
      evidence:
        'cert-manager issuer healthy; DNS-01 challenge ready — expiry window entered for wildcard router cert.',
      narrative:
        "I'm driving an immediate CertificateRequest so ingress reload happens before the 36h cut-off.",
    },
  },
  ...SYNTHETIC_FLEET_ALERTS,
];

/** Fleet-wide critical: regional ingress — causal grouping, aggregated RCA, governor remediation (fleet view only). */
export const FLEET_WIDE_REGIONAL_INGRESS: FleetWideCriticalIncident = {
  id: 'fleet-alrt-regional-ingress-us-east',
  title: 'RegionalIngressFailure',
  severity: 'critical',
  firedAt: '2026-04-29T15:05:00.000Z',
  agentStatus: 'investigating',
  affectedClusterIds: ['prod-east-2', 'prod-eu-west-1', 'stg-central', 'prod-us-east-1', 'prod-us-east-1b'],
  correlatedAlertCount: 148,
  aiInsight: {
    categoryLabel: 'AI insight · Fleet correlation',
    headline: 'Anchored blast to ingress dataplane',
    evidence:
      'OpenShift Ingress metrics show coordinated drop across prod-east-2, prod-eu-west-1, and stg-central',
    narrative:
      'I have correlated 148 alerts across prod-east-2, prod-eu-west-1, stg-central, prod-us-east-1, and prod-us-east-1b. All symptoms point to a total loss of Ingress-to-Workload communication starting at 10:05 AM.',
  },
  symptomStartedDisplay: '10:05 AM',
  steps: [
    {
      id: 'fw1',
      time: '10:04',
      status: 'done',
      title: 'Grouped fleet alerts by ingress symptom',
      detail: '148 firing alerts share 502/503 at router → Service hop within a 6-minute window',
      icon: 'database',
    },
    {
      id: 'fw2',
      time: '10:05',
      status: 'done',
      title: 'Anchored blast to ingress dataplane',
      detail: 'OpenShift Ingress metrics show coordinated drop across prod-east-2, prod-eu-west-1, stg-central, prod-us-east-1, and prod-us-east-1b',
      icon: 'network',
    },
    {
      id: 'fw3',
      time: '10:06',
      status: 'done',
      title: 'Global GitOps sync detected 2 minutes prior to alert storm',
      detail: 'Argo CD application cluster-gitops-policies completed sync at 10:03 AM',
      icon: 'search',
    },
    {
      id: 'fw4',
      time: '10:07',
      status: 'active',
      title: 'Diffed applied NetworkPolicy objects',
      detail: 'New deny-all-ingress policy lacks allow-rule for openshift-ingress namespace',
      icon: 'exclamation',
    },
    {
      id: 'fw5',
      time: '—',
      status: 'pending',
      title: 'Governor approval for fleet rollback',
      icon: 'check',
    },
  ],
  aggregatedFinding:
    'Global GitOps Sync detected 2 minutes prior to alert storm — Argo CD application cluster-gitops-policies applied revision r4821 at 10:03 AM.',
  rootCauseNarrative:
    'A new NetworkPolicy (deny-all-ingress) was applied globally. It lacks an allow-rule for the OpenShift Ingress Controller namespace, so router → workload traffic is denied fleet-wide.',
  remediationProposal:
    'Roll back NetworkPolicy deny-all-ingress to version v2.1.0 across all 3 clusters (prod-east-2, prod-eu-west-1, stg-central).',
  riskAssessment: 'Low risk. This will restore traffic immediately.',
  estimatedRecovery: '~45s',
};

/**
 * Extra critical count for a cluster when it appears on the active fleet-scoped critical
 * (`FLEET_WIDE_REGIONAL_INGRESS` is not stored as `AlertRecord` rows on `clusterId`).
 */
export function fleetWideCriticalAddsForCluster(clusterId: string): number {
  if (FLEET_WIDE_REGIONAL_INGRESS.severity !== 'critical') {
    return 0;
  }
  return FLEET_WIDE_REGIONAL_INGRESS.affectedClusterIds.includes(clusterId) ? 1 : 0;
}

/** +1 per cluster in `FLEET_WIDE_REGIONAL_INGRESS.affectedClusterIds` — aligns Fleet Summary critical with Σ cluster tiles. */
export function fleetCriticalAttributionCount(): number {
  if (FLEET_WIDE_REGIONAL_INGRESS.severity !== 'critical') {
    return 0;
  }
  return FLEET_WIDE_REGIONAL_INGRESS.affectedClusterIds.length;
}

/**
 * Synthetic per-cluster row for the fleet-wide ingress incident so Active alerts and drill-down
 * match fleet KPIs (`fleetWideCriticalAddsForCluster`). Not stored on `ALERTS` to avoid duplicating
 * one incident across three cluster rows in fleet-wide tables.
 */
export function buildFleetWideIngressAlertRecordForCluster(clusterId: string): AlertRecord | null {
  if (fleetWideCriticalAddsForCluster(clusterId) === 0) {
    return null;
  }
  const fw = FLEET_WIDE_REGIONAL_INGRESS;
  return {
    id: `${fw.id}__${clusterId}`,
    clusterId,
    severity: 'critical',
    title: fw.title,
    service: 'openshift-ingress / fleet-correlated',
    age: fw.symptomStartedDisplay,
    firedAt: fw.firedAt,
    message: fw.aiInsight.narrative ?? fw.aiInsight.evidence,
    agentStatus: fw.agentStatus,
    steps: fw.steps,
    rcaSummary: `${fw.aggregatedFinding} ${fw.rootCauseNarrative}`.trim(),
    rootCauseRef: 'cluster-gitops-policies',
    rootCauseTail: fw.rootCauseNarrative.slice(0, 120),
    confidence: 94,
    logLines: `Fleet ingress symptom · ${fw.correlatedAlertCount} correlated alerts · deny-all-ingress NetworkPolicy roll-forward detected.`,
    blastRadius: [...fw.affectedClusterIds, 'router-default', 'openshift-ingress'],
    remediationSummary: fw.remediationProposal,
    remediationCommands:
      'Use Remediation hub in Fleet management for governor-approved rollback across affected clusters.',
    estimatedRecovery: fw.estimatedRecovery,
    remediationRiskSummary: fw.riskAssessment,
    agentInvestigationNarrative: fw.aiInsight.narrative ?? fw.aiInsight.evidence,
    aiInsight: { ...fw.aiInsight },
  };
}

/** Digest rows for “While you were away” — fixed copy per spec */
export const AWAY_DIGEST_ITEMS: Array<{
  tone: 'danger' | 'success' | 'warning' | 'info';
  timestamp: string;
  text: string;
  meta: string;
}> = [
  {
    tone: 'danger',
    timestamp: formatLocalDigestTimeFromUtcClock('13:48'),
    text: '3 new critical alerts fired',
    meta: 'RegionalIngressFailure (fleet) · PaymentsAPI5xxSurge · EtcdDiskPressureOnMaster2',
  },
  {
    tone: 'success',
    timestamp: formatLocalDigestTimeFromUtcClock('13:52'),
    text: 'Agent auto-remediated 3 incidents',
    meta: 'checkout-svc HPA · ingress restart · pod evict',
  },
  {
    tone: 'warning',
    timestamp: formatLocalDigestTimeFromUtcClock('13:56'),
    text: '1 cluster degraded → recovered',
    meta: 'prod-eu-west-1 · 6m downtime',
  },
  {
    tone: 'info',
    timestamp: formatLocalDigestTimeFromUtcClock('14:01'),
    text: 'Fleet alerts went 0 → 4 since last visit',
    meta: 'first event at 13:48 UTC',
  },
  {
    tone: 'danger',
    timestamp: formatLocalDigestTimeFromUtcClock('14:06'),
    text: 'PaymentsAPI5xxSurge spread to 5 additional clusters',
    meta: 'prod-us-east-1 · prod-us-east-1b · prod-us-west-1 · prod-ca-central-1 · prod-eu-central-1',
  },
  {
    tone: 'warning',
    timestamp: formatLocalDigestTimeFromUtcClock('14:09'),
    text: '6 dependent warnings correlated to top-firing alerts',
    meta: 'checkout CPU throttling · ingress latency spikes likely to recover after top-firing remediation',
  },
  {
    tone: 'info',
    timestamp: formatLocalDigestTimeFromUtcClock('14:12'),
    text: '3 non-top critical alerts detected outside main blast radius',
    meta: 'NodeFilesystemAlmostFull on dev-us-east and edge-emea-1; isolated impact assessed',
  },
  {
    tone: 'success',
    timestamp: formatLocalDigestTimeFromUtcClock('14:15'),
    text: 'Autonomous agent pre-ranked remediation dependencies',
    meta: 'Prioritized PaymentsAPI and etcd fixes to reduce 11 secondary alerts across the fleet',
  },
];

/** Shape shared by fleet mock digest rows and cluster-scoped digest rows. */
export type AwayDigestItem = {
  tone: 'danger' | 'success' | 'warning' | 'info';
  timestamp: string;
  text: string;
  meta: string;
};

/** Viewer-local digest timestamp (24h clock + local timezone abbreviation). */
function formatLocalDigestTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return 'recent';
  }
  const hhmm = d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const tzName = new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' })
    .formatToParts(d)
    .find((part) => part.type === 'timeZoneName')?.value;
  return tzName ? `${hhmm} ${tzName}` : hhmm;
}

/** Helper for fixed fleet digest rows authored in UTC clock time (HH:MM) but displayed in viewer-local time. */
function formatLocalDigestTimeFromUtcClock(utcClock: `${string}:${string}`): string {
  const today = new Date();
  const [hh, mm] = utcClock.split(':');
  const utcIso = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, '0')}-${String(
    today.getUTCDate()
  ).padStart(2, '0')}T${hh}:${mm}:00.000Z`;
  return formatLocalDigestTimestamp(utcIso);
}

export function getClusterById(id: string): ClusterRecord | undefined {
  return CLUSTERS.find((c) => c.id === id);
}

/** Lower number = higher priority (shown first in UI). */
const ALERT_SEVERITY_SORT_ORDER: Record<AlertSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

/** Critical before warning before info; stable within the same severity. */
export function sortAlertsBySeverityPriority(alerts: AlertRecord[]): AlertRecord[] {
  return [...alerts].sort(
    (a, b) => ALERT_SEVERITY_SORT_ORDER[a.severity] - ALERT_SEVERITY_SORT_ORDER[b.severity]
  );
}

/**
 * First alert row for a rule title (severity-priority). Fleet ingress critical is modeled separately
 * (`FLEET_WIDE_REGIONAL_INGRESS`), not as `ALERTS` rows — callers should branch on title first.
 */
export function firstFleetAlertRecordForRuleTitle(ruleTitle: string): AlertRecord | undefined {
  const matches = ALERTS.filter((a) => a.title === ruleTitle);
  if (matches.length === 0) {
    return undefined;
  }
  return sortAlertsBySeverityPriority(matches)[0];
}

/** Drill target for AI Hub “View remediation” — fleet ingress incident vs a concrete `AlertRecord` row. */
export type FleetRemediationDrillTarget =
  | { kind: 'fleet-incident'; incidentId: string }
  | { kind: 'alert'; alertId: string };

/**
 * Maps Top firing alert rule name → remediation drill-down target.
 * Fleet ingress is modeled only as `FLEET_WIDE_REGIONAL_INGRESS`, not as rows in `ALERTS`.
 */
export function resolveFleetRemediationDrillTarget(alertRuleTitle: string): FleetRemediationDrillTarget | null {
  if (alertRuleTitle === FLEET_WIDE_REGIONAL_INGRESS.title) {
    return { kind: 'fleet-incident', incidentId: FLEET_WIDE_REGIONAL_INGRESS.id };
  }
  const alert = firstFleetAlertRecordForRuleTitle(alertRuleTitle);
  if (!alert) {
    return null;
  }
  return { kind: 'alert', alertId: alert.id };
}

/** QA: every rule shown in `buildFleetTopFiringAlertRuleRows()` must resolve (otherwise “View remediation” is a no-op). */
export function fleetTopFiringRulesMissingRemediationTarget(): string[] {
  const missing: string[] = [];
  for (const row of buildFleetTopFiringAlertRuleRows()) {
    if (!resolveFleetRemediationDrillTarget(row.name)) {
      missing.push(row.name);
    }
  }
  return missing;
}

/** Display suffix after `AI insight ·` for KPI tooltips and summaries. */
export function aiInsightCategoryShort(categoryLabel: string): string {
  const trimmed = categoryLabel.trim();
  const m = trimmed.match(/^AI insight\s*·\s*(.+)$/i);
  return m ? m[1].trim() : trimmed;
}

/**
 * Same body string as `AiInsightLede` / `ObserveAlertItem` alert cards:
 * category short — user-facing message (or narrative when no category).
 */
export function formatAiInsightLedeBody(categoryLabel: string, narrative: string): string {
  const suffix = categoryLabel.trim() ? aiInsightCategoryShort(categoryLabel) : '';
  return suffix ? `${suffix} — ${narrative}` : narrative;
}

/**
 * Insight line for Fleet hub “Top firing alerts” — resolves `ALERTS` + fleet-wide ingress by rule title.
 */
export function getFleetTopAlertInsightDisplay(ruleName: string): string {
  const fromAlerts = ALERTS.find((a) => a.title === ruleName);
  if (fromAlerts) {
    return formatAiInsightLedeBody(fromAlerts.aiInsight.categoryLabel, fromAlerts.message);
  }
  if (FLEET_WIDE_REGIONAL_INGRESS.title === ruleName) {
    const fw = FLEET_WIDE_REGIONAL_INGRESS;
    const narrative = fw.aiInsight.narrative ?? fw.aiInsight.evidence;
    return formatAiInsightLedeBody(fw.aiInsight.categoryLabel, narrative);
  }
  return formatAiInsightLedeBody(
    '',
    'Firing across multiple clusters — might indicate a shared infrastructure issue.'
  );
}

/**
 * Console-style grouping for tooltip “Category” (Policy, Security, …), derived from alert names/services.
 */
export function alertDomainCategoryFromText(title: string, componentOrService: string): string {
  const hay = `${title} ${componentOrService}`.toLowerCase();
  if (/cert|tls|wildcard|expir|renew/i.test(hay)) {
    return 'Security';
  }
  if (/networkpolicy|netpol|regionalingress|ingress.*failure/i.test(hay)) {
    return 'Policy';
  }
  if (/etcd|disk|wal|pressure|volume/i.test(hay)) {
    return 'Capacity';
  }
  if (/payment|checkout|hpa|quota|throttl/i.test(hay)) {
    return 'Workload';
  }
  return 'Platform';
}

export function alertDomainCategory(a: AlertRecord): string {
  return alertDomainCategoryFromText(a.title, a.service);
}

export type AlertKpiBreakdownRow = {
  title: string;
  severity: AlertSeverity;
  component: string;
  insightCategory: string;
  domainCategory: string;
};

function alertToBreakdownRow(a: AlertRecord): AlertKpiBreakdownRow {
  return {
    title: a.title,
    severity: a.severity,
    component: a.service,
    insightCategory: aiInsightCategoryShort(a.aiInsight.categoryLabel),
    domainCategory: alertDomainCategory(a),
  };
}

/** Fleet KPI counts include synthetic fleet-critical attributions; mirror that in tooltip rows. */
export function buildFleetSeverityBreakdown(severity: AlertSeverity): AlertKpiBreakdownRow[] {
  const rows = ALERTS.filter((a) => a.severity === severity).map(alertToBreakdownRow);
  if (severity === 'critical' && FLEET_WIDE_REGIONAL_INGRESS.severity === 'critical') {
    const fw = FLEET_WIDE_REGIONAL_INGRESS;
    fw.affectedClusterIds.forEach(() => {
      rows.push({
        title: fw.title,
        severity: 'critical',
        component: 'openshift-ingress / fleet-correlated',
        insightCategory: aiInsightCategoryShort(fw.aiInsight.categoryLabel),
        domainCategory: 'Policy',
      });
    });
  }
  return rows.sort((a, b) => a.title.localeCompare(b.title));
}

export function getAlertsForCluster(clusterId: string): AlertRecord[] {
  const perCluster = sortAlertsBySeverityPriority(ALERTS.filter((a) => a.clusterId === clusterId));
  const fleetRow = buildFleetWideIngressAlertRecordForCluster(clusterId);
  if (!fleetRow) {
    return perCluster;
  }
  return sortAlertsBySeverityPriority([fleetRow, ...perCluster]);
}

export function buildClusterSeverityBreakdown(clusterId: string, severity: AlertSeverity): AlertKpiBreakdownRow[] {
  return getAlertsForCluster(clusterId)
    .filter((a) => a.severity === severity)
    .map(alertToBreakdownRow)
    .sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Cluster-scoped “While you were away” rows derived from alerts, fleet-wide incidents,
 * agent pulse, and health — used in Core platforms / single-cluster view only.
 */
export function buildClusterAwayDigestItems(clusterId: string): AwayDigestItem[] {
  const cluster = getClusterById(clusterId);
  if (!cluster) {
    return [];
  }

  const items: AwayDigestItem[] = [];
  const perClusterAlerts = sortAlertsBySeverityPriority(
    ALERTS.filter((a) => a.clusterId === clusterId)
  );
  const latestClusterAlertIso = perClusterAlerts.reduce<string | null>((latest, a) => {
    if (!latest || a.firedAt > latest) {
      return a.firedAt;
    }
    return latest;
  }, null);
  const latestClusterTimestamp = latestClusterAlertIso ? formatLocalDigestTimestamp(latestClusterAlertIso) : 'recent';

  if (fleetWideCriticalAddsForCluster(clusterId) > 0) {
    const summary = FLEET_WIDE_REGIONAL_INGRESS.aiInsight.narrative ?? FLEET_WIDE_REGIONAL_INGRESS.aiInsight.evidence;
    items.push({
      tone: 'danger',
      timestamp: formatLocalDigestTimestamp(FLEET_WIDE_REGIONAL_INGRESS.firedAt),
      text: `Fleet incident: ${FLEET_WIDE_REGIONAL_INGRESS.title}`,
      meta: summary.length > 140 ? `${summary.slice(0, 140)}…` : summary,
    });
  }

  const crit = perClusterAlerts.filter((a) => a.severity === 'critical');
  const warn = perClusterAlerts.filter((a) => a.severity === 'warning');

  if (crit.length > 0) {
    const latestCritIso = crit.reduce<string | null>((latest, a) => {
      if (!latest || a.firedAt > latest) {
        return a.firedAt;
      }
      return latest;
    }, null);
    items.push({
      tone: 'danger',
      timestamp: latestCritIso ? formatLocalDigestTimestamp(latestCritIso) : latestClusterTimestamp,
      text: `${crit.length} critical firing alert${crit.length !== 1 ? 's' : ''}`,
      meta: crit.map((a) => a.title).join(' · '),
    });
  }
  if (warn.length > 0) {
    const latestWarnIso = warn.reduce<string | null>((latest, a) => {
      if (!latest || a.firedAt > latest) {
        return a.firedAt;
      }
      return latest;
    }, null);
    items.push({
      tone: 'warning',
      timestamp: latestWarnIso ? formatLocalDigestTimestamp(latestWarnIso) : latestClusterTimestamp,
      text: `${warn.length} warning alert${warn.length !== 1 ? 's' : ''}`,
      meta: warn.map((a) => a.title).join(' · '),
    });
  }

  if (cluster.agentStatus !== 'idle') {
    items.push({
      tone: cluster.agentStatus === 'escalated' ? 'danger' : 'info',
      timestamp: latestClusterTimestamp,
      text: `Agent status: ${cluster.agentStatus}`,
      meta: `Single-cluster context · ${cluster.name}`,
    });
  }

  if (cluster.health !== 'healthy') {
    items.push({
      tone: cluster.health === 'critical' ? 'danger' : 'warning',
      timestamp: latestClusterTimestamp,
      text: `Cluster health is ${cluster.health}`,
      meta: `${cluster.nodes} nodes · ${cluster.provider} · ${cluster.region}`,
    });
  }

  if (items.length === 0) {
    items.push({
      tone: 'success',
      timestamp: 'recent',
      text: `No new issues on ${cluster.name}`,
      meta: 'Agent idle · monitoring continues',
    });
  }

  return items.slice(0, 6);
}

export function computeFleetStats(
  clusters: ClusterRecord[],
  alerts: AlertRecord[],
  /** Per-cluster attributions from fleet-scoped critical (e.g. `fleetCriticalAttributionCount()`). */
  fleetCriticalAttributionTotal = 0
) {
  const criticalCount =
    alerts.filter((a) => a.severity === 'critical').length + fleetCriticalAttributionTotal;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;
  const degraded = clusters.filter((c) => c.health !== 'healthy').length;
  const totalNodes = clusters.reduce((sum, c) => sum + c.nodes, 0);
  return {
    criticalCount,
    warningCount,
    degraded,
    totalClusters: clusters.length,
    totalNodes,
  };
}

/** Same row cap as Alerting “Top alerts” (`INSIGHTS_LIST_SIZE`). */
const TOP_FLEET_ALERTS_DISPLAY_MAX = 5;

export type FleetTopAlertRuleRow = {
  name: string;
  critical: number;
  warning: number;
  info: number;
  clusters: string[];
};

/**
 * Fleet hub “Top firing alerts” — aggregates `ALERTS` by rule title (matches Fleet Summary scope),
 * then merges `FLEET_WIDE_REGIONAL_INGRESS` critical attributions the same way KPI math does.
 */
export function buildFleetTopFiringAlertRuleRows(): FleetTopAlertRuleRow[] {
  const byTitle: Record<string, FleetTopAlertRuleRow> = {};

  const clusterDisplayName = (clusterId: string) => getClusterById(clusterId)?.name ?? clusterId;

  for (const a of ALERTS) {
    const key = a.title;
    if (!byTitle[key]) {
      byTitle[key] = { name: key, critical: 0, warning: 0, info: 0, clusters: [] };
    }
    const row = byTitle[key];
    const cn = clusterDisplayName(a.clusterId);
    if (a.severity === 'critical') {
      row.critical++;
    } else if (a.severity === 'warning') {
      row.warning++;
    } else {
      row.info++;
    }
    if (!row.clusters.includes(cn)) {
      row.clusters.push(cn);
    }
  }

  const fw = FLEET_WIDE_REGIONAL_INGRESS;
  if (fw.severity === 'critical') {
    const key = fw.title;
    if (!byTitle[key]) {
      byTitle[key] = { name: key, critical: 0, warning: 0, info: 0, clusters: [] };
    }
    const row = byTitle[key];
    fw.affectedClusterIds.forEach((cid) => {
      row.critical++;
      const cn = clusterDisplayName(cid);
      if (!row.clusters.includes(cn)) {
        row.clusters.push(cn);
      }
    });
  }

  const sorted = Object.values(byTitle).sort(
    (a, b) => b.critical + b.warning + b.info - (a.critical + a.warning + a.info)
  );

  const ingressTitle = FLEET_WIDE_REGIONAL_INGRESS.title;
  const ingressIdx = sorted.findIndex((r) => r.name === ingressTitle);
  const ingressRow = ingressIdx >= 0 ? sorted[ingressIdx] : undefined;
  const withoutIngress = ingressRow ? sorted.filter((_, i) => i !== ingressIdx) : sorted;

  /** Fleet ingress incident row pinned first on “Top firing alerts”; remainder sorted by volume. */
  const ordered = ingressRow ? [ingressRow, ...withoutIngress] : sorted;
  return ordered.slice(0, TOP_FLEET_ALERTS_DISPLAY_MAX);
}

/**
 * First alert on a cluster for a rule title (severity-priority). Fleet ingress on that cluster is
 * modeled via `buildFleetWideIngressAlertRecordForCluster`, not `ALERTS` rows.
 */
export function firstClusterAlertRecordForRuleTitle(
  clusterId: string,
  ruleTitle: string
): AlertRecord | undefined {
  const matches = ALERTS.filter((a) => a.title === ruleTitle && a.clusterId === clusterId);
  if (matches.length === 0) {
    return undefined;
  }
  return sortAlertsBySeverityPriority(matches)[0];
}

/**
 * Maps Top firing alert rule name → remediation drill-down for a single cluster (Core platforms hub).
 */
export function resolveClusterRemediationDrillTarget(
  alertRuleTitle: string,
  clusterId: string
): FleetRemediationDrillTarget | null {
  if (
    alertRuleTitle === FLEET_WIDE_REGIONAL_INGRESS.title &&
    fleetWideCriticalAddsForCluster(clusterId) > 0
  ) {
    const fleetRow = buildFleetWideIngressAlertRecordForCluster(clusterId);
    if (fleetRow) {
      return { kind: 'alert', alertId: fleetRow.id };
    }
    return { kind: 'fleet-incident', incidentId: FLEET_WIDE_REGIONAL_INGRESS.id };
  }
  const alert = firstClusterAlertRecordForRuleTitle(clusterId, alertRuleTitle);
  if (!alert) {
    return null;
  }
  return { kind: 'alert', alertId: alert.id };
}

/**
 * Core platforms hub “Top firing alerts” — aggregates firing rules on one cluster (includes fleet
 * ingress attribution when that cluster is in the blast radius).
 */
export function buildClusterTopFiringAlertRuleRows(clusterId: string): FleetTopAlertRuleRow[] {
  const cluster = getClusterById(clusterId);
  const clusterName = cluster?.name ?? clusterId;
  const byTitle: Record<string, FleetTopAlertRuleRow> = {};

  for (const a of ALERTS.filter((alert) => alert.clusterId === clusterId)) {
    const key = a.title;
    if (!byTitle[key]) {
      byTitle[key] = { name: key, critical: 0, warning: 0, info: 0, clusters: [clusterName] };
    }
    const row = byTitle[key];
    if (a.severity === 'critical') {
      row.critical++;
    } else if (a.severity === 'warning') {
      row.warning++;
    } else {
      row.info++;
    }
  }

  if (fleetWideCriticalAddsForCluster(clusterId) > 0) {
    const fw = FLEET_WIDE_REGIONAL_INGRESS;
    const key = fw.title;
    if (!byTitle[key]) {
      byTitle[key] = { name: key, critical: 0, warning: 0, info: 0, clusters: [clusterName] };
    }
    byTitle[key].critical += fleetWideCriticalAddsForCluster(clusterId);
  }

  const sorted = Object.values(byTitle).sort(
    (a, b) => b.critical + b.warning + b.info - (a.critical + a.warning + a.info)
  );

  const ingressTitle = FLEET_WIDE_REGIONAL_INGRESS.title;
  const ingressIdx = sorted.findIndex((r) => r.name === ingressTitle);
  const ingressRow = ingressIdx >= 0 ? sorted[ingressIdx] : undefined;
  const withoutIngress = ingressRow ? sorted.filter((_, i) => i !== ingressIdx) : sorted;
  const ordered = ingressRow ? [ingressRow, ...withoutIngress] : sorted;
  return ordered.slice(0, TOP_FLEET_ALERTS_DISPLAY_MAX);
}

/** Firing alert count for one cluster (matches `getAlertsForCluster` / cluster KPI scope). */
export function clusterHubTotalFiringAlertsCount(clusterId: string): number {
  const perCluster = ALERTS.filter((a) => a.clusterId === clusterId);
  const critical =
    perCluster.filter((a) => a.severity === 'critical').length + fleetWideCriticalAddsForCluster(clusterId);
  const warning = perCluster.filter((a) => a.severity === 'warning').length;
  const info = perCluster.filter((a) => a.severity === 'info').length;
  return critical + warning + info;
}

/** Aligns with Fleet Summary firing totals (`computeFleetStats` / fleet ingress attribution). */
export function fleetHubTotalFiringAlertsCount(): number {
  const critical =
    ALERTS.filter((a) => a.severity === 'critical').length + fleetCriticalAttributionCount();
  const warning = ALERTS.filter((a) => a.severity === 'warning').length;
  const info = ALERTS.filter((a) => a.severity === 'info').length;
  return critical + warning + info;
}

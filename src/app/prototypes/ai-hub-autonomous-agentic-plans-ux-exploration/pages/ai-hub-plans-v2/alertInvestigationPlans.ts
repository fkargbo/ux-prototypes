import type { ConfidenceTier } from '../../types/confidenceTier';
import type { ReasoningStep } from '../../components/autonomousAiObserve/data';
import type { PlanRow } from './PlansAndApprovalsTab';

/**
 * Session key scoped to this UX-exploration prototype only.
 * Do not reuse the observability / MVP key — those are separate workstreams.
 */
export const ALERT_INVESTIGATION_CREATED_ALERTS_KEY =
  'hpux.ai-hub-autonomous-agentic-plans-ux-exploration.alert-investigation-created';

/**
 * Alert name → AgenticRun plan id.
 * `VCCannotBeEvicted` is the product label; `VMCannotBeEvicted` is kept as an alerting-mock alias.
 */
export const ALERT_NAME_TO_NEW_INVESTIGATION_PLAN_ID: Record<string, string> = {
  NodeNotReady: 'inv-alert-node-not-ready',
  MDSCacheUsageHigh: 'inv-alert-mds-cache-high',
  VCCannotBeEvicted: 'inv-alert-vm-cannot-evict',
  VMCannotBeEvicted: 'inv-alert-vm-cannot-evict',
  NodeCPUHigh: 'inv-alert-node-cpu-high',
};

export const NEW_ALERT_INVESTIGATION_PLAN_IDS = new Set(Object.values(ALERT_NAME_TO_NEW_INVESTIGATION_PLAN_ID));

/** Formatted Alert Investigation card fields for Analysis request. */
export type AlertInvestigationCardData = {
  alertName: string;
  severity: 'critical' | 'warning';
  namespace: string;
  triggerDomainLabel: string;
  workload: string;
  summary: string;
};

type RawInvestigationPlan = Omit<PlanRow, 'status' | 'name' | 'namespace' | 'cluster' | 'scope' | 'createdAt'> & {
  status: 'Investigating' | 'Waiting Approval';
};

export const NEW_ALERT_INVESTIGATION_PLANS: RawInvestigationPlan[] = [
  {
    id: 'inv-alert-node-not-ready',
    severity: 'critical',
    status: 'Investigating',
    score: 77,
    synopsis: 'Investigate NodeNotReady alert',
    consolidationScope: 'Triggered by alert: NodeNotReady',
    triggerDomain: 'Prometheus',
    drawerTargets: ['prod-east-2'],
    expandedReasons: [
      { icon: 'alert', text: 'Prometheus Alert: NodeNotReady — node lost Ready condition.' },
      { icon: 'gear', text: 'Autonomous agent correlating kubelet, node, and workload signals.' },
    ],
  },
  {
    id: 'inv-alert-mds-cache-high',
    severity: 'critical',
    status: 'Investigating',
    score: 76,
    synopsis: 'Investigate MDSCacheUsageHigh alert',
    consolidationScope: 'Triggered by alert: MDSCacheUsageHigh',
    triggerDomain: 'Prometheus',
    drawerTargets: ['rook-ceph-mds-a', 'rook-ceph-mds-b'],
    expandedReasons: [
      { icon: 'alert', text: 'Prometheus Alert: MDSCacheUsageHigh — Ceph MDS cache pressure rising.' },
      { icon: 'gear', text: 'Collecting storage operator and pod-level metrics.' },
    ],
  },
  {
    id: 'inv-alert-vm-cannot-evict',
    severity: 'warning',
    status: 'Waiting Approval',
    score: 75,
    synopsis: 'Investigate VCCannotBeEvicted alert',
    consolidationScope: 'Triggered by alert: VCCannotBeEvicted',
    triggerDomain: 'Prometheus',
    drawerTargets: ['virt-launcher-node-1'],
    expandedReasons: [
      { icon: 'alert', text: 'Prometheus Alert: VCCannotBeEvicted — eviction blocked by PDB or node pressure.' },
      { icon: 'gear', text: 'Tracing virt-controller and KubeVirt workload events.' },
    ],
  },
  {
    id: 'inv-alert-node-cpu-high',
    severity: 'warning',
    status: 'Investigating',
    score: 72,
    synopsis: 'Investigate NodeCPUHigh alert',
    consolidationScope: 'Triggered by alert: NodeCPUHigh',
    triggerDomain: 'Prometheus',
    drawerTargets: ['worker-02'],
    expandedReasons: [
      { icon: 'alert', text: 'Prometheus Alert: NodeCPUHigh — sustained CPU utilization above threshold.' },
      { icon: 'gear', text: 'Sampling node exporter and scheduler placement signals.' },
    ],
  },
];

export const NEW_ALERT_INVESTIGATION_PLAN_IDENTITY: Record<
  string,
  { name: string; synopsis: string; namespace: string; fleetCluster: string }
> = {
  'inv-alert-node-not-ready': {
    name: 'investigate-node-not-ready',
    synopsis: 'Investigate NodeNotReady — node lost Ready condition on prod-east-2',
    namespace: 'openshift-node',
    fleetCluster: 'prod-east-2',
  },
  'inv-alert-mds-cache-high': {
    name: 'investigate-mds-cache-usage-high',
    synopsis: 'Investigate MDSCacheUsageHigh — Ceph MDS cache pressure on prod-east-2',
    namespace: 'openshift-storage',
    fleetCluster: 'prod-east-2',
  },
  'inv-alert-vm-cannot-evict': {
    name: 'investigate-vc-cannot-be-evicted',
    synopsis: 'Investigate VCCannotBeEvicted — blocked VM eviction on virt-launcher-node-1',
    namespace: 'openshift-cluster-api',
    fleetCluster: 'prod-east-2',
  },
  'inv-alert-node-cpu-high': {
    name: 'investigate-node-cpu-high',
    synopsis: 'Investigate NodeCPUHigh — sustained CPU utilization on prod-east-2',
    namespace: 'kube-system',
    fleetCluster: 'prod-east-2',
  },
};

/** Structured card content for the Analysis request Alert Investigation layout. */
export const ALERT_INVESTIGATION_CARD_BY_PLAN_ID: Record<string, AlertInvestigationCardData> = {
  'inv-alert-node-not-ready': {
    alertName: 'NodeNotReady',
    severity: 'critical',
    namespace: 'openshift-node',
    triggerDomainLabel: 'Prometheus / AlertManager',
    workload: 'prod-east-2',
    summary:
      'Node lost Ready condition on prod-east-2. AI analysis initiated to identify root cause and propose node drain/remediation steps.',
  },
  'inv-alert-vm-cannot-evict': {
    alertName: 'VCCannotBeEvicted',
    severity: 'warning',
    namespace: 'openshift-cluster-api',
    triggerDomainLabel: 'Prometheus / AlertManager',
    workload: 'virt-launcher-node-1',
    summary:
      'Virtual machine eviction blocked on virt-launcher-node-1. AI analysis proposed remediation options for PDB and live-migration constraints.',
  },
  'inv-alert-mds-cache-high': {
    alertName: 'MDSCacheUsageHigh',
    severity: 'critical',
    namespace: 'openshift-storage',
    triggerDomainLabel: 'Prometheus / AlertManager',
    workload: 'rook-ceph-mds-a',
    summary:
      'Ceph MDS cache usage exceeded threshold. AI analysis correlating metadata load with client sessions.',
  },
  'inv-alert-node-cpu-high': {
    alertName: 'NodeCPUHigh',
    severity: 'warning',
    namespace: 'kube-system',
    triggerDomainLabel: 'Prometheus / AlertManager',
    workload: 'worker-02',
    summary:
      'Sustained CPU utilization above threshold on worker-02. AI analysis ranking noisy-neighbor workloads.',
  },
};

export type AlertInvestigationDrawerData = {
  steps: ReasoningStep[];
  aggregatedFinding: string;
  rootCauseNarrative: string;
  remediationProposal: string;
  riskAssessment: string;
  estimatedRecovery: string;
  confidence: ConfidenceTier;
};

export const NEW_ALERT_INVESTIGATION_DRAWER_DATA: Record<string, AlertInvestigationDrawerData> = {
  'inv-alert-node-not-ready': {
    steps: [
      { id: 's1', time: 'Just now', status: 'done', icon: 'exclamation', title: 'Prometheus Alert: NodeNotReady received', detail: 'Node Ready condition transitioned to False' },
      { id: 's2', time: 'Just now', status: 'done', icon: 'database', title: 'Fetched node conditions and kubelet logs', detail: 'Last heartbeat 4m ago · PLEG not responding' },
      { id: 's3', status: 'active', icon: 'search', title: 'Analyzing infrastructure topology to isolate root cause', detail: 'Correlating node, pod, and network signals…' },
      { id: 's4', status: 'pending', icon: 'check', title: 'Assemble remediation proposal' },
    ],
    aggregatedFinding: 'Investigation started from NodeNotReady. Initial signals collected — root cause analysis in progress.',
    rootCauseNarrative: 'The autonomous agent is correlating kubelet health, node conditions, and workload placement. A remediation proposal will appear once root cause confidence exceeds the threshold.',
    remediationProposal: 'Remediation paths pending root cause confirmation.',
    riskAssessment: 'TBD — assessment will be generated after analysis completes.',
    estimatedRecovery: 'TBD',
    confidence: 'Medium',
  },
  'inv-alert-mds-cache-high': {
    steps: [
      { id: 's1', time: 'Just now', status: 'done', icon: 'exclamation', title: 'Prometheus Alert: MDSCacheUsageHigh received', detail: 'MDS cache usage above 85% on primary rank' },
      { id: 's2', time: 'Just now', status: 'done', icon: 'database', title: 'Pulled Ceph MDS perf counters', detail: 'Cache trim rate declining over last 10 minutes' },
      { id: 's3', status: 'active', icon: 'search', title: 'Analyzing infrastructure topology to isolate root cause', detail: 'Correlating metadata load with client sessions…' },
      { id: 's4', status: 'pending', icon: 'check', title: 'Assemble remediation proposal' },
    ],
    aggregatedFinding: 'Investigation started from MDSCacheUsageHigh. Storage telemetry ingested — analysis underway.',
    rootCauseNarrative: 'Early signals suggest metadata cache pressure on the active MDS rank. Full causality graph is being constructed.',
    remediationProposal: 'Remediation paths pending root cause confirmation.',
    riskAssessment: 'TBD — assessment will be generated after analysis completes.',
    estimatedRecovery: 'TBD',
    confidence: 'Medium',
  },
  'inv-alert-vm-cannot-evict': {
    steps: [
      { id: 's1', time: 'Just now', status: 'done', icon: 'exclamation', title: 'Prometheus Alert: VCCannotBeEvicted received', detail: 'Eviction request blocked for running VM' },
      { id: 's2', time: 'Just now', status: 'done', icon: 'database', title: 'Collected KubeVirt and PDB objects', detail: 'PodDisruptionBudget minAvailable=1 · live-migration disabled' },
      { id: 's3', time: 'Just now', status: 'done', icon: 'search', title: 'Root cause isolated', detail: 'PDB constraint + migration policy block eviction' },
      { id: 's4', status: 'done', icon: 'check', title: 'Remediation options proposed', detail: 'Awaiting operator approval' },
    ],
    aggregatedFinding: 'Investigation from VCCannotBeEvicted completed. Eviction is blocked by PDB minAvailable and disabled live migration.',
    rootCauseNarrative: 'The virt-launcher pod cannot be evicted because a PodDisruptionBudget requires minAvailable=1 and live migration is disabled for this workload.',
    remediationProposal: 'Relax PDB, enable live migration, or cordon and drain after graceful VM shutdown during a maintenance window.',
    riskAssessment: 'Medium — incorrect PDB changes can reduce VM availability.',
    estimatedRecovery: '10–25 minutes',
    confidence: 'High',
  },
  'inv-alert-node-cpu-high': {
    steps: [
      { id: 's1', time: 'Just now', status: 'done', icon: 'exclamation', title: 'Prometheus Alert: NodeCPUHigh received', detail: 'CPU utilization >90% sustained for 15 minutes' },
      { id: 's2', time: 'Just now', status: 'done', icon: 'database', title: 'Sampled node-exporter and scheduler metrics', detail: 'Top consumers: openshift-monitoring, kube-system' },
      { id: 's3', status: 'active', icon: 'search', title: 'Analyzing infrastructure topology to isolate root cause', detail: 'Ranking noisy neighbor workloads…' },
      { id: 's4', status: 'pending', icon: 'check', title: 'Assemble remediation proposal' },
    ],
    aggregatedFinding: 'Investigation started from NodeCPUHigh. Node-level metrics ingested — workload attribution in progress.',
    rootCauseNarrative: 'Initial sampling shows elevated CPU on platform namespaces. Root cause isolation is still running.',
    remediationProposal: 'Remediation paths pending root cause confirmation.',
    riskAssessment: 'TBD — assessment will be generated after analysis completes.',
    estimatedRecovery: 'TBD',
    confidence: 'Medium',
  },
};

export function readCreatedAlertInvestigations(): string[] {
  try {
    const raw = sessionStorage.getItem(ALERT_INVESTIGATION_CREATED_ALERTS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((entry): entry is string => typeof entry === 'string') : [];
  } catch {
    return [];
  }
}

/** Persist alert names that already have an investigation plan opened from Alerting. */
export function markAlertInvestigationCreated(alertName: string): void {
  try {
    const existing = readCreatedAlertInvestigations();
    if (existing.includes(alertName)) {
      return;
    }
    sessionStorage.setItem(
      ALERT_INVESTIGATION_CREATED_ALERTS_KEY,
      JSON.stringify([...existing, alertName]),
    );
  } catch {
    /* ignore */
  }
}

/** Mark every alert alias for a plan id (keeps Alerting deep-links local to this prototype). */
export function markAlertInvestigationCreatedForPlanId(planId: string): void {
  Object.entries(ALERT_NAME_TO_NEW_INVESTIGATION_PLAN_ID)
    .filter(([, id]) => id === planId)
    .forEach(([alertName]) => markAlertInvestigationCreated(alertName));
}

export function resolveNewInvestigationPlanIdForAlert(alertName: string): string | null {
  return ALERT_NAME_TO_NEW_INVESTIGATION_PLAN_ID[alertName] ?? null;
}

export function resolveAlertNameForNewInvestigationPlanId(planId: string): string | undefined {
  return Object.entries(ALERT_NAME_TO_NEW_INVESTIGATION_PLAN_ID).find(([, id]) => id === planId)?.[0];
}

export function getAlertInvestigationCard(planId: string): AlertInvestigationCardData | undefined {
  return ALERT_INVESTIGATION_CARD_BY_PLAN_ID[planId];
}

/** Hide alert-triggered investigation plans until the user opens them from Alerting. */
export function isNewAlertInvestigationPlanVisible(plan: PlanRow): boolean {
  const alertName = resolveAlertNameForNewInvestigationPlanId(plan.id);
  if (!alertName) {
    return true;
  }
  const created = readCreatedAlertInvestigations();
  // Canonical + alias names may both be stored depending on which UI opened the run.
  const aliases = Object.entries(ALERT_NAME_TO_NEW_INVESTIGATION_PLAN_ID)
    .filter(([, id]) => id === plan.id)
    .map(([name]) => name);
  return aliases.some((name) => created.includes(name));
}

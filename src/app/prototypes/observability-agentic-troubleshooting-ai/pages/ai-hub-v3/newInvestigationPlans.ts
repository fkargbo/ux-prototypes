import type { PlanRow } from './PlansAndApprovalsTab';

/** Alerts that start a fresh AI investigation (kebab: “Investigate with AI” until first open). */
export const ALERT_NAME_TO_NEW_INVESTIGATION_PLAN_ID: Record<string, string> = {
  NodeNotReady: 'inv-alert-node-not-ready',
  MDSCacheUsageHigh: 'inv-alert-mds-cache-high',
  VMCannotBeEvicted: 'inv-alert-vm-cannot-evict',
  NodeCPUHigh: 'inv-alert-node-cpu-high',
};

export const NEW_INVESTIGATION_PLAN_IDS = new Set(Object.values(ALERT_NAME_TO_NEW_INVESTIGATION_PLAN_ID));

export function resolveNewInvestigationPlanIdForAlert(alertName: string): string | null {
  return ALERT_NAME_TO_NEW_INVESTIGATION_PLAN_ID[alertName] ?? null;
}

export function resolveAlertNameForNewInvestigationPlanId(planId: string): string | undefined {
  return Object.entries(ALERT_NAME_TO_NEW_INVESTIGATION_PLAN_ID).find(([, id]) => id === planId)?.[0];
}

/** Fleet-scoped plans — earliest status is Investigating (analyzing root cause). */
export const NEW_INVESTIGATION_PLANS: PlanRow[] = [
  {
    id: 'inv-alert-node-not-ready',
    severity: 'critical',
    status: 'Investigating',
    score: 77,
    synopsis: 'Investigate NodeNotReady alert',
    blastRadius: '1 Cluster',
    consolidationScope: 'Triggered by alert: NodeNotReady',
    triggerDomains: 'Prometheus',
    isUnauthorized: false,
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
    blastRadius: '1 Cluster',
    consolidationScope: 'Triggered by alert: MDSCacheUsageHigh',
    triggerDomains: 'Prometheus',
    isUnauthorized: false,
    drawerTargets: ['openshift-storage'],
    expandedReasons: [
      { icon: 'alert', text: 'Prometheus Alert: MDSCacheUsageHigh — Ceph MDS cache pressure rising.' },
      { icon: 'gear', text: 'Collecting storage operator and pod-level metrics.' },
    ],
  },
  {
    id: 'inv-alert-vm-cannot-evict',
    severity: 'critical',
    status: 'Investigating',
    score: 75,
    synopsis: 'Investigate VMCannotBeEvicted alert',
    blastRadius: '1 Namespace',
    consolidationScope: 'Triggered by alert: VMCannotBeEvicted',
    triggerDomains: 'Prometheus',
    isUnauthorized: false,
    drawerTargets: ['openshift-virtualization'],
    expandedReasons: [
      { icon: 'alert', text: 'Prometheus Alert: VMCannotBeEvicted — eviction blocked by PDB or node pressure.' },
      { icon: 'gear', text: 'Tracing virt-controller and KubeVirt workload events.' },
    ],
  },
  {
    id: 'inv-alert-node-cpu-high',
    severity: 'warning',
    status: 'Investigating',
    score: 72,
    synopsis: 'Investigate NodeCPUHigh alert',
    blastRadius: '1 Namespace',
    consolidationScope: 'Triggered by alert: NodeCPUHigh',
    triggerDomains: 'Prometheus',
    isUnauthorized: false,
    drawerTargets: ['kube-system'],
    expandedReasons: [
      { icon: 'alert', text: 'Prometheus Alert: NodeCPUHigh — sustained CPU utilization above threshold.' },
      { icon: 'gear', text: 'Sampling node exporter and scheduler placement signals.' },
    ],
  },
];

/** Core platforms overrides — namespace / node scoped blast radius. */
export const SC_NEW_INVESTIGATION_PLANS: PlanRow[] = NEW_INVESTIGATION_PLANS.map((plan) => {
  switch (plan.id) {
    case 'inv-alert-node-not-ready':
      return { ...plan, blastRadius: '2 Nodes', drawerTargets: ['worker-02', 'worker-03'] };
    case 'inv-alert-mds-cache-high':
      return { ...plan, blastRadius: '1 Namespace', drawerTargets: ['rook-ceph-mds-a', 'rook-ceph-mds-b'] };
    case 'inv-alert-vm-cannot-evict':
      return { ...plan, blastRadius: '1 VirtualMachine', drawerTargets: ['rhel9-vm-workload'] };
    case 'inv-alert-node-cpu-high':
      return { ...plan, blastRadius: '1 Node', drawerTargets: ['worker-02'] };
    default:
      return plan;
  }
});

export type NewInvestigationPlanDrawerData = {
  steps: Array<{
    id: string;
    time?: string;
    status: 'done' | 'active' | 'pending' | 'alert';
    icon: 'exclamation' | 'database' | 'network' | 'search' | 'check' | 'gear';
    title: string;
    detail?: string;
  }>;
  aggregatedFinding: string;
  rootCauseNarrative: string;
  remediationProposal: string;
  riskAssessment: string;
  estimatedRecovery: string;
  confidence: number;
};

/** Early-phase drawer content — root cause still being analyzed. */
export const NEW_INVESTIGATION_PLAN_DRAWER_DATA: Record<string, NewInvestigationPlanDrawerData> = {
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
    confidence: 42,
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
    confidence: 38,
  },
  'inv-alert-vm-cannot-evict': {
    steps: [
      { id: 's1', time: 'Just now', status: 'done', icon: 'exclamation', title: 'Prometheus Alert: VMCannotBeEvicted received', detail: 'Eviction request blocked for running VM' },
      { id: 's2', time: 'Just now', status: 'done', icon: 'database', title: 'Collected KubeVirt and PDB objects', detail: 'PodDisruptionBudget minAvailable=1 · live-migration disabled' },
      { id: 's3', status: 'active', icon: 'search', title: 'Analyzing infrastructure topology to isolate root cause', detail: 'Evaluating node pressure vs. migration policy…' },
      { id: 's4', status: 'pending', icon: 'check', title: 'Assemble remediation proposal' },
    ],
    aggregatedFinding: 'Investigation started from VMCannotBeEvicted. Virtualization control-plane signals collected.',
    rootCauseNarrative: 'The agent is determining whether eviction failure is due to PDB constraints, node pressure, or KubeVirt migration policy.',
    remediationProposal: 'Remediation paths pending root cause confirmation.',
    riskAssessment: 'TBD — assessment will be generated after analysis completes.',
    estimatedRecovery: 'TBD',
    confidence: 35,
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
    confidence: 40,
  },
};

export function getNewInvestigationPlans(isSingleCluster: boolean): PlanRow[] {
  return isSingleCluster ? SC_NEW_INVESTIGATION_PLANS : NEW_INVESTIGATION_PLANS;
}

export function findNewInvestigationPlanById(planId: string, isSingleCluster: boolean): PlanRow | undefined {
  return getNewInvestigationPlans(isSingleCluster).find((plan) => plan.id === planId);
}

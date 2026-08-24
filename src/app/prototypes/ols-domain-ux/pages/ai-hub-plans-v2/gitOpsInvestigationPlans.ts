import type { ConfidenceTier } from '../../types/confidenceTier';
import type { ReasoningStep } from '../../components/autonomousAiObserve/data';
import type { PlanRow } from './PlansAndApprovalsTab';
import type { GitOpsApplication } from '../gitops/data/gitOpsApplicationsData';

export const GITOPS_INVESTIGATION_CREATED_APPS_KEY =
  'hpux.ols-domain-ux.gitops-investigation-created';

/** GitOps Applications → agentic run ids (shown after first investigate). */
export const GITOPS_APP_TO_PLAN_ID: Record<string, string> = {
  agentit: 'inv-gitops-agentit',
  'pulse-agent': 'inv-gitops-pulse-agent',
  'pulse-ui': 'inv-gitops-pulse-ui',
};

export const GITOPS_INVESTIGATION_PLAN_IDS = new Set(Object.values(GITOPS_APP_TO_PLAN_ID));

type RawGitOpsInvestigationPlan = Omit<
  PlanRow,
  'status' | 'name' | 'namespace' | 'cluster' | 'scope' | 'createdAt'
> & {
  status: 'Investigating';
};

export const GITOPS_INVESTIGATION_PLANS: RawGitOpsInvestigationPlan[] = [
  {
    id: 'inv-gitops-agentit',
    severity: 'critical',
    status: 'Investigating',
    score: 81,
    synopsis: 'Diagnose degraded agentit application health',
    consolidationScope: 'Application · agentit',
    triggerDomain: 'GitOps',
    drawerTargets: ['agentit'],
    expandedReasons: [
      {
        icon: 'sync',
        text: 'Argo CD: Application agentit health Degraded — workload pods failing readiness checks in default namespace.',
      },
      {
        icon: 'alert',
        text: 'Kubernetes: 2 pods in CrashLoopBackOff correlated with recent Git revision sync.',
      },
    ],
  },
  {
    id: 'inv-gitops-pulse-agent',
    severity: 'warning',
    status: 'Investigating',
    score: 78,
    synopsis: 'Resolve pulse-agent manifest generation failure',
    consolidationScope: 'Application · pulse-agent',
    triggerDomain: 'GitOps',
    drawerTargets: ['pulse-agent'],
    expandedReasons: [
      {
        icon: 'sync',
        text: 'Argo CD: Sync status Unknown — failed to generate manifest for source 1 of 1 (cached RPC error).',
      },
      {
        icon: 'gear',
        text: 'Repository plugin: Kustomize build error on path overlays/production.',
      },
    ],
  },
  {
    id: 'inv-gitops-pulse-ui',
    severity: 'warning',
    status: 'Investigating',
    score: 76,
    synopsis: 'Resolve pulse-ui repository index failure',
    consolidationScope: 'Application · pulse-ui',
    triggerDomain: 'GitOps',
    drawerTargets: ['pulse-ui'],
    expandedReasons: [
      {
        icon: 'sync',
        text: 'Argo CD: Sync status Unknown — failed to load target state (repo index 404 Not Found).',
      },
      {
        icon: 'warning',
        text: 'Git repository: index.yaml missing or branch ref points to deleted commit.',
      },
    ],
  },
];

export const GITOPS_INVESTIGATION_PLAN_IDENTITY: Record<
  string,
  { name: string; synopsis: string; namespace: string; fleetCluster: string }
> = {
  'inv-gitops-agentit': {
    name: 'agentit-degraded-health',
    synopsis: 'Diagnose degraded agentit application health on openshift-gitops',
    namespace: 'default',
    fleetCluster: 'prod-east-2',
  },
  'inv-gitops-pulse-agent': {
    name: 'pulse-agent-manifest-gen',
    synopsis: 'Resolve pulse-agent manifest generation failure on openshift-gitops',
    namespace: 'default',
    fleetCluster: 'prod-east-2',
  },
  'inv-gitops-pulse-ui': {
    name: 'pulse-ui-repo-index',
    synopsis: 'Resolve pulse-ui repository index 404 on openshift-gitops',
    namespace: 'default',
    fleetCluster: 'prod-east-2',
  },
};

export type GitOpsInvestigationDrawerData = {
  steps: ReasoningStep[];
  aggregatedFinding: string;
  rootCauseNarrative: string;
  remediationProposal: string;
  riskAssessment: string;
  estimatedRecovery: string;
  confidence: ConfidenceTier;
};

export const GITOPS_INVESTIGATION_DRAWER_DATA: Record<string, GitOpsInvestigationDrawerData> = {
  'inv-gitops-agentit': {
    steps: [
      {
        id: 's1',
        time: 'Just now',
        status: 'done',
        icon: 'exclamation',
        title: 'Argo CD reported Degraded health for agentit',
        detail: 'Application sync succeeded but managed workloads are unhealthy',
      },
      {
        id: 's2',
        time: 'Just now',
        status: 'done',
        icon: 'database',
        title: 'Collected deployment and pod events',
        detail: '2 pods CrashLoopBackOff · ImagePullBackOff on agentit-worker',
      },
      {
        id: 's3',
        status: 'active',
        icon: 'search',
        title: 'Correlating Git revision with workload failure onset',
        detail: 'Tracing commit r8a41c2 applied 11 minutes before health degraded…',
      },
      { id: 's4', status: 'pending', icon: 'check', title: 'Assemble remediation proposal' },
    ],
    aggregatedFinding:
      'Investigation started from GitOps Applications. agentit is synced but workloads are degraded.',
    rootCauseNarrative:
      'Early signals point to a bad container image tag introduced in the latest Git revision. Full causality analysis is in progress.',
    remediationProposal: 'Remediation paths pending root cause confirmation.',
    riskAssessment: 'TBD — assessment will be generated after analysis completes.',
    estimatedRecovery: 'TBD',
    confidence: 'Medium',
  },
  'inv-gitops-pulse-agent': {
    steps: [
      {
        id: 's1',
        time: 'Just now',
        status: 'done',
        icon: 'exclamation',
        title: 'Argo CD sync status Unknown for pulse-agent',
        detail: 'Manifest generation error (cached) on github.com/alimbram/pulse-agent.git',
      },
      {
        id: 's2',
        time: 'Just now',
        status: 'done',
        icon: 'database',
        title: 'Fetched repo-server and cmp-server logs',
        detail: 'Kustomize build failed: references missing ConfigMap generator',
      },
      {
        id: 's3',
        status: 'active',
        icon: 'search',
        title: 'Tracing overlay path and kustomization dependencies',
        detail: 'Validating kustomize.yaml against repository tree…',
      },
      { id: 's4', status: 'pending', icon: 'check', title: 'Assemble remediation proposal' },
    ],
    aggregatedFinding:
      'Investigation started from GitOps Applications. pulse-agent cannot render manifests from Git.',
    rootCauseNarrative:
      'The agent is isolating whether the failure is a Kustomize overlay mis-reference or a repo-server cache staleness issue.',
    remediationProposal: 'Remediation paths pending root cause confirmation.',
    riskAssessment: 'TBD — assessment will be generated after analysis completes.',
    estimatedRecovery: 'TBD',
    confidence: 'Medium',
  },
  'inv-gitops-pulse-ui': {
    steps: [
      {
        id: 's1',
        time: 'Just now',
        status: 'done',
        icon: 'exclamation',
        title: 'Argo CD sync status Unknown for pulse-ui',
        detail: 'Failed to get repo index: 404 Not Found on github.com/alimbram/pulse-ui.git',
      },
      {
        id: 's2',
        time: 'Just now',
        status: 'done',
        icon: 'database',
        title: 'Verified Application source repository URL and ref',
        detail: 'Target revision main · Helm chart path charts/pulse-ui',
      },
      {
        id: 's3',
        status: 'active',
        icon: 'search',
        title: 'Checking repository visibility and index artifact',
        detail: 'Confirming whether index.yaml was removed or branch ref is stale…',
      },
      { id: 's4', status: 'pending', icon: 'check', title: 'Assemble remediation proposal' },
    ],
    aggregatedFinding:
      'Investigation started from GitOps Applications. pulse-ui cannot resolve the Git repository index.',
    rootCauseNarrative:
      'Initial hypothesis: repository index or chart path changed without updating the Application spec.',
    remediationProposal: 'Remediation paths pending root cause confirmation.',
    riskAssessment: 'TBD — assessment will be generated after analysis completes.',
    estimatedRecovery: 'TBD',
    confidence: 'Medium',
  },
};

export function readCreatedGitOpsInvestigations(): string[] {
  try {
    const raw = sessionStorage.getItem(GITOPS_INVESTIGATION_CREATED_APPS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((entry): entry is string => typeof entry === 'string') : [];
  } catch {
    return [];
  }
}

export function markGitOpsInvestigationCreated(applicationId: string): void {
  try {
    const existing = readCreatedGitOpsInvestigations();
    if (existing.includes(applicationId)) {
      return;
    }
    sessionStorage.setItem(
      GITOPS_INVESTIGATION_CREATED_APPS_KEY,
      JSON.stringify([...existing, applicationId]),
    );
  } catch {
    /* ignore */
  }
}

export function resolveGitOpsAppIdForPlanId(planId: string): string | undefined {
  return Object.entries(GITOPS_APP_TO_PLAN_ID).find(([, id]) => id === planId)?.[0];
}

/** Hide GitOps-triggered runs until opened from GitOps Applications. */
export function isGitOpsInvestigationPlanVisible(plan: PlanRow): boolean {
  const appId = resolveGitOpsAppIdForPlanId(plan.id);
  if (!appId) {
    return true;
  }
  return readCreatedGitOpsInvestigations().includes(appId);
}

export function resolveGitOpsPlanIdForApplication(app: GitOpsApplication): string | null {
  return GITOPS_APP_TO_PLAN_ID[app.id] ?? null;
}

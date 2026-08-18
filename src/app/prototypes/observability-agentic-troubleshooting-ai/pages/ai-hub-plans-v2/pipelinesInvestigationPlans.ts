import type { ConfidenceTier } from '../../types/confidenceTier';
import type { ReasoningStep } from '../../components/autonomousAiObserve/data';
import type { PlanRow } from './PlansAndApprovalsTab';
import type { PipelineRun } from '../pipelines/data/pipelineRunsData';

export const PIPELINES_INVESTIGATION_CREATED_RUNS_KEY =
  'hpux.observability-agentic-troubleshooting-ai.pipelines-investigation-created';

/** PipelineRuns list → agentic run ids (shown after first investigate). */
export const PIPELINE_RUN_TO_PLAN_ID: Record<string, string> = {
  'build-webhook-listener-z8k4n': 'inv-pipelines-webhook-listener',
  'guestbook-build-7xh2p': 'inv-pipelines-guestbook-imagepull',
  'frontend-ci-9f3k1': 'inv-pipelines-frontend-tests',
};

export const PIPELINES_INVESTIGATION_PLAN_IDS = new Set(Object.values(PIPELINE_RUN_TO_PLAN_ID));

type RawPipelinesInvestigationPlan = Omit<
  PlanRow,
  'status' | 'name' | 'namespace' | 'cluster' | 'scope' | 'createdAt'
> & {
  status: 'Investigating';
};

export const PIPELINES_INVESTIGATION_PLANS: RawPipelinesInvestigationPlan[] = [
  {
    id: 'inv-pipelines-webhook-listener',
    severity: 'warning',
    status: 'Investigating',
    score: 77,
    synopsis: 'Diagnose build-webhook-listener PipelineRun failure',
    consolidationScope: 'PipelineRun · build-webhook-listener-z8k4n',
    triggerDomain: 'Pipelines',
    drawerTargets: ['build-webhook-listener-z8k4n'],
    expandedReasons: [
      {
        icon: 'wrench',
        text: 'PipelineRunFailed: validate-webhook-tls task exited with TLS handshake error against EventListener endpoint.',
      },
      {
        icon: 'alert',
        text: 'Tekton: EventListener build-webhook-listener webhook deliveries blocked on prod-east-2.',
      },
    ],
  },
  {
    id: 'inv-pipelines-guestbook-imagepull',
    severity: 'critical',
    status: 'Investigating',
    score: 82,
    synopsis: 'Resolve guestbook-build image pull failure',
    consolidationScope: 'PipelineRun · guestbook-build-7xh2p',
    triggerDomain: 'Pipelines',
    drawerTargets: ['guestbook-build-7xh2p'],
    expandedReasons: [
      {
        icon: 'wrench',
        text: 'TaskRun build-image failed: Back-off pulling image "quay.io/example/guestbook:v2.3.1-missing".',
      },
      {
        icon: 'warning',
        text: 'Image registry: tag not found on internal mirror — 404 from quay.io proxy.',
      },
    ],
  },
  {
    id: 'inv-pipelines-frontend-tests',
    severity: 'warning',
    status: 'Investigating',
    score: 74,
    synopsis: 'Analyze frontend-ci unit test failures',
    consolidationScope: 'PipelineRun · frontend-ci-9f3k1',
    triggerDomain: 'Pipelines',
    drawerTargets: ['frontend-ci-9f3k1'],
    expandedReasons: [
      {
        icon: 'wrench',
        text: 'TaskRun run-unit-tests failed: 12 tests failed in payments-ui package.',
      },
      {
        icon: 'gear',
        text: 'JUnit report: authentication mock regression after dependency bump in package-lock.json.',
      },
    ],
  },
];

export const PIPELINES_INVESTIGATION_PLAN_IDENTITY: Record<
  string,
  { name: string; synopsis: string; namespace: string; fleetCluster: string }
> = {
  'inv-pipelines-webhook-listener': {
    name: 'webhook-listener-run-failure',
    synopsis: 'Diagnose Tekton webhook TLS failure on build-webhook-listener PipelineRun',
    namespace: 'openshift-pipelines',
    fleetCluster: 'prod-east-2',
  },
  'inv-pipelines-guestbook-imagepull': {
    name: 'guestbook-image-pull-failure',
    synopsis: 'Resolve guestbook-build image pull failure in openshift-pipelines',
    namespace: 'openshift-pipelines',
    fleetCluster: 'prod-east-2',
  },
  'inv-pipelines-frontend-tests': {
    name: 'frontend-ci-test-failures',
    synopsis: 'Analyze unit test failures in frontend-ci PipelineRun',
    namespace: 'continuous-integration',
    fleetCluster: 'prod-east-2',
  },
};

export type PipelinesInvestigationDrawerData = {
  steps: ReasoningStep[];
  aggregatedFinding: string;
  rootCauseNarrative: string;
  remediationProposal: string;
  riskAssessment: string;
  estimatedRecovery: string;
  confidence: ConfidenceTier;
};

export const PIPELINES_INVESTIGATION_DRAWER_DATA: Record<string, PipelinesInvestigationDrawerData> = {
  'inv-pipelines-webhook-listener': {
    steps: [
      {
        id: 's1',
        time: 'Just now',
        status: 'done',
        icon: 'exclamation',
        title: 'PipelineRun build-webhook-listener-z8k4n failed',
        detail: 'validate-webhook-tls task exited code 1 after TLS handshake timeout',
      },
      {
        id: 's2',
        time: 'Just now',
        status: 'done',
        icon: 'database',
        title: 'Collected EventListener and admission webhook logs',
        detail: 'Stale TLS certificate on build-webhook-listener · signature validation errors in tekton-pipelines',
      },
      {
        id: 's3',
        status: 'active',
        icon: 'search',
        title: 'Correlating certificate expiry with webhook delivery failures',
        detail: 'Comparing cert-manager Certificate status with Tekton EventListener TLS secret…',
      },
      { id: 's4', status: 'pending', icon: 'check', title: 'Assemble remediation proposal' },
    ],
    aggregatedFinding:
      'Investigation started from PipelineRuns. build-webhook-listener-z8k4n failed during webhook TLS validation.',
    rootCauseNarrative:
      'Early signals point to an expired or mismatched TLS secret on the EventListener blocking GitOps-triggered pipeline runs.',
    remediationProposal: 'Remediation paths pending root cause confirmation.',
    riskAssessment: 'TBD — assessment will be generated after analysis completes.',
    estimatedRecovery: 'TBD',
    confidence: 'Medium',
  },
  'inv-pipelines-guestbook-imagepull': {
    steps: [
      {
        id: 's1',
        time: 'Just now',
        status: 'done',
        icon: 'exclamation',
        title: 'PipelineRun guestbook-build-7xh2p failed on build-image',
        detail: 'ImagePullBackOff — quay.io/example/guestbook:v2.3.1-missing not found',
      },
      {
        id: 's2',
        time: 'Just now',
        status: 'done',
        icon: 'database',
        title: 'Verified ImageStreamTag and mirror configuration',
        detail: 'Tag v2.3.1-missing absent from openshift-image-registry and external mirror',
      },
      {
        id: 's3',
        status: 'active',
        icon: 'search',
        title: 'Tracing Git revision to image tag in Pipeline spec',
        detail: 'Checking whether Pipeline parameter IMAGE_TAG drifted from available tags…',
      },
      { id: 's4', status: 'pending', icon: 'check', title: 'Assemble remediation proposal' },
    ],
    aggregatedFinding:
      'Investigation started from PipelineRuns. guestbook-build cannot pull the configured container image.',
    rootCauseNarrative:
      'The agent is determining whether the failure is a bad image tag in the Pipeline spec or a missing mirror sync.',
    remediationProposal: 'Remediation paths pending root cause confirmation.',
    riskAssessment: 'TBD — assessment will be generated after analysis completes.',
    estimatedRecovery: 'TBD',
    confidence: 'Medium',
  },
  'inv-pipelines-frontend-tests': {
    steps: [
      {
        id: 's1',
        time: 'Just now',
        status: 'done',
        icon: 'exclamation',
        title: 'PipelineRun frontend-ci-9f3k1 failed on run-unit-tests',
        detail: '12 failing tests in payments-ui · auth provider mock assertion errors',
      },
      {
        id: 's2',
        time: 'Just now',
        status: 'done',
        icon: 'database',
        title: 'Fetched TaskRun pod logs and JUnit report artifact',
        detail: 'Failures cluster around SessionProvider mock after @redhat-ui/auth 4.2.0 bump',
      },
      {
        id: 's3',
        status: 'active',
        icon: 'search',
        title: 'Diffing dependency lockfile against last successful run',
        detail: 'Comparing package-lock.json from frontend-ci-8d2m0 (Succeeded)…',
      },
      { id: 's4', status: 'pending', icon: 'check', title: 'Assemble remediation proposal' },
    ],
    aggregatedFinding:
      'Investigation started from PipelineRuns. frontend-ci-9f3k1 failed during unit test execution.',
    rootCauseNarrative:
      'Initial hypothesis: dependency upgrade changed auth mock contract without updating test fixtures.',
    remediationProposal: 'Remediation paths pending root cause confirmation.',
    riskAssessment: 'TBD — assessment will be generated after analysis completes.',
    estimatedRecovery: 'TBD',
    confidence: 'Medium',
  },
};

export function readCreatedPipelinesInvestigations(): string[] {
  try {
    const raw = sessionStorage.getItem(PIPELINES_INVESTIGATION_CREATED_RUNS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((entry): entry is string => typeof entry === 'string') : [];
  } catch {
    return [];
  }
}

export function markPipelinesInvestigationCreated(pipelineRunId: string): void {
  try {
    const existing = readCreatedPipelinesInvestigations();
    if (existing.includes(pipelineRunId)) {
      return;
    }
    sessionStorage.setItem(
      PIPELINES_INVESTIGATION_CREATED_RUNS_KEY,
      JSON.stringify([...existing, pipelineRunId]),
    );
  } catch {
    /* ignore */
  }
}

export function resolvePipelineRunIdForPlanId(planId: string): string | undefined {
  return Object.entries(PIPELINE_RUN_TO_PLAN_ID).find(([, id]) => id === planId)?.[0];
}

/** Hide Pipelines-triggered runs until opened from PipelineRuns list. */
export function isPipelinesInvestigationPlanVisible(plan: PlanRow): boolean {
  const runId = resolvePipelineRunIdForPlanId(plan.id);
  if (!runId) {
    return true;
  }
  return readCreatedPipelinesInvestigations().includes(runId);
}

export function resolvePipelinesPlanIdForRun(run: PipelineRun): string | null {
  return PIPELINE_RUN_TO_PLAN_ID[run.id] ?? null;
}

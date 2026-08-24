export type PipelineRunStatus = 'Succeeded' | 'Failed' | 'Running' | 'Cancelled';

export interface PipelinesNamespace {
  id: string;
  label: string;
}

export const PIPELINES_NAMESPACES: PipelinesNamespace[] = [
  { id: 'openshift-pipelines', label: 'openshift-pipelines' },
  { id: 'continuous-integration', label: 'continuous-integration' },
];

export interface PipelineRun {
  id: string;
  namespaceId: string;
  name: string;
  pipeline: string;
  status: PipelineRunStatus;
  started: string;
  duration: string;
  cluster: string;
  /** Failed task name when status is Failed. */
  failedTask?: string;
  /** Short failure reason for table context. */
  failureSummary?: string;
}

/**
 * Mock PipelineRuns — mix of healthy and failed rows so Investigate with AI is visibly gated.
 */
export const PIPELINE_RUNS: PipelineRun[] = [
  {
    id: 'build-webhook-listener-z8k4n',
    namespaceId: 'openshift-pipelines',
    name: 'build-webhook-listener-z8k4n',
    pipeline: 'build-webhook-listener',
    status: 'Failed',
    started: 'Aug 14, 2026, 9:42 AM',
    duration: '2m 18s',
    cluster: 'prod-east-2',
    failedTask: 'validate-webhook-tls',
    failureSummary: 'TLS handshake error against EventListener endpoint',
  },
  {
    id: 'guestbook-build-7xh2p',
    namespaceId: 'openshift-pipelines',
    name: 'guestbook-build-7xh2p',
    pipeline: 'guestbook-build',
    status: 'Failed',
    started: 'Aug 14, 2026, 8:15 AM',
    duration: '4m 02s',
    cluster: 'prod-east-2',
    failedTask: 'build-image',
    failureSummary: 'ImagePullBackOff — tag v2.3.1-missing not found',
  },
  {
    id: 'frontend-ci-9f3k1',
    namespaceId: 'continuous-integration',
    name: 'frontend-ci-9f3k1',
    pipeline: 'frontend-ci',
    status: 'Failed',
    started: 'Aug 13, 2026, 4:55 PM',
    duration: '6m 44s',
    cluster: 'prod-east-2',
    failedTask: 'run-unit-tests',
    failureSummary: '12 unit tests failed in payments-ui',
  },
  {
    id: 'release-pipeline-run-3',
    namespaceId: 'openshift-pipelines',
    name: 'release-pipeline-run-3',
    pipeline: 'release-pipeline',
    status: 'Succeeded',
    started: 'Aug 13, 2026, 2:10 PM',
    duration: '12m 31s',
    cluster: 'prod-east-2',
  },
  {
    id: 'guestbook-build-8d2m0',
    namespaceId: 'openshift-pipelines',
    name: 'guestbook-build-8d2m0',
    pipeline: 'guestbook-build',
    status: 'Succeeded',
    started: 'Aug 12, 2026, 11:22 AM',
    duration: '3m 48s',
    cluster: 'prod-east-2',
  },
  {
    id: 'frontend-ci-8d2m0',
    namespaceId: 'continuous-integration',
    name: 'frontend-ci-8d2m0',
    pipeline: 'frontend-ci',
    status: 'Succeeded',
    started: 'Aug 11, 2026, 3:40 PM',
    duration: '5m 12s',
    cluster: 'prod-east-2',
  },
  {
    id: 'build-webhook-listener-k5p9w',
    namespaceId: 'openshift-pipelines',
    name: 'build-webhook-listener-k5p9w',
    pipeline: 'build-webhook-listener',
    status: 'Running',
    started: 'Aug 14, 2026, 10:05 AM',
    duration: '—',
    cluster: 'prod-east-2',
  },
];

export function pipelineRunNeedsInvestigation(run: PipelineRun): boolean {
  return run.status === 'Failed';
}

export function filterPipelineRunsByNamespace(
  runs: PipelineRun[],
  namespaceId: string,
): PipelineRun[] {
  return runs.filter((run) => run.namespaceId === namespaceId);
}

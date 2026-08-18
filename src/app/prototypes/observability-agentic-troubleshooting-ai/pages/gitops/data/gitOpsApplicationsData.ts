export type GitOpsHealthStatus = 'Healthy' | 'Degraded' | 'Progressing' | 'Missing' | 'Unknown';
export type GitOpsSyncStatus = 'Synced' | 'OutOfSync' | 'Sync Failed' | 'Unknown';

export interface GitOpsInstance {
  id: string;
  label: string;
}

export const GITOPS_INSTANCES: GitOpsInstance[] = [
  { id: 'openshift-gitops', label: 'openshift-gitops / openshift-gitops' },
  { id: 'team-b-gitops', label: 'team-b-gitops / team-b' },
];

export interface GitOpsApplication {
  id: string;
  instanceId: string;
  name: string;
  project: string;
  healthStatus: GitOpsHealthStatus;
  syncStatus: GitOpsSyncStatus;
  repository: string;
  destination: string;
  /** Optional issue text surfaced on the dashboard “Needs attention” table. */
  issue?: string;
}

/**
 * Mock data aligned with Kevin’s GitOps review recording (Aug 2026).
 * Includes healthy rows so the Investigate affordance is visibly gated.
 */
export const GITOPS_APPLICATIONS: GitOpsApplication[] = [
  {
    id: 'agentit',
    instanceId: 'openshift-gitops',
    name: 'agentit',
    project: 'default',
    healthStatus: 'Degraded',
    syncStatus: 'Synced',
    repository: 'https://github.com/alimbram/agent-it.git',
    destination: 'https://kubernetes.default.svc / default',
    issue: 'Degraded',
  },
  {
    id: 'pulse-agent',
    instanceId: 'openshift-gitops',
    name: 'pulse-agent',
    project: 'default',
    healthStatus: 'Healthy',
    syncStatus: 'Unknown',
    repository: 'https://github.com/alimbram/pulse-agent.git',
    destination: 'https://kubernetes.default.svc / default',
    issue:
      'Failed to load target state: failed to generate manifest for source 1 of 1: rpc error: code = Unknown desc = Manifest generation error (cached)',
  },
  {
    id: 'pulse-ui',
    instanceId: 'openshift-gitops',
    name: 'pulse-ui',
    project: 'default',
    healthStatus: 'Healthy',
    syncStatus: 'Unknown',
    repository: 'https://github.com/alimbram/pulse-ui.git',
    destination: 'https://kubernetes.default.svc / default',
    issue: 'Failed to load target state: error loading repo index: failed to get index: 404 Not Found',
  },
  {
    id: 'managed-pinky',
    instanceId: 'openshift-gitops',
    name: 'managed-pinky',
    project: 'default',
    healthStatus: 'Healthy',
    syncStatus: 'Synced',
    repository: 'https://github.com/argoproj/argocd-example-apps.git',
    destination: 'https://kubernetes.default.svc / guestbook',
  },
  {
    id: 'managed-pulse-agent',
    instanceId: 'openshift-gitops',
    name: 'managed-pulse-agent',
    project: 'default',
    healthStatus: 'Healthy',
    syncStatus: 'Synced',
    repository: 'https://github.com/alimbram/pulse-agent.git',
    destination: 'https://kubernetes.default.svc / pulse',
  },
  {
    id: 'managed-pulse-ui',
    instanceId: 'openshift-gitops',
    name: 'managed-pulse-ui',
    project: 'default',
    healthStatus: 'Healthy',
    syncStatus: 'Synced',
    repository: 'https://github.com/alimbram/pulse-ui.git',
    destination: 'https://kubernetes.default.svc / pulse',
  },
  {
    id: 'team-b-guestbook',
    instanceId: 'team-b-gitops',
    name: 'team-b-guestbook',
    project: 'default',
    healthStatus: 'Healthy',
    syncStatus: 'Synced',
    repository: 'https://github.com/argoproj/argocd-example-apps.git',
    destination: 'https://kubernetes.default.svc / team-b-apps',
  },
];

export function applicationHasUnhealthyHealth(app: GitOpsApplication): boolean {
  return (
    app.healthStatus === 'Degraded' ||
    app.healthStatus === 'Missing' ||
    app.healthStatus === 'Unknown' ||
    app.healthStatus === 'Progressing'
  );
}

export function applicationHasUnhealthySync(app: GitOpsApplication): boolean {
  return (
    app.syncStatus === 'Sync Failed' ||
    app.syncStatus === 'OutOfSync' ||
    app.syncStatus === 'Unknown'
  );
}

/**
 * Mirrors the console “Needs attention” heuristic from the recording:
 * degraded/missing health, or any non-synced sync state (including Unknown manifest errors).
 */
export function applicationNeedsInvestigation(app: GitOpsApplication): boolean {
  return applicationHasUnhealthyHealth(app) || applicationHasUnhealthySync(app);
}

/** One investigate link per row — health column wins when both need attention. */
export function resolveInvestigationPlacement(app: GitOpsApplication): 'health' | 'sync' | null {
  if (!applicationNeedsInvestigation(app)) {
    return null;
  }
  if (applicationHasUnhealthyHealth(app)) {
    return 'health';
  }
  if (applicationHasUnhealthySync(app)) {
    return 'sync';
  }
  return null;
}

export function filterApplicationsByInstance(
  applications: GitOpsApplication[],
  instanceId: string,
): GitOpsApplication[] {
  return applications.filter((app) => app.instanceId === instanceId);
}

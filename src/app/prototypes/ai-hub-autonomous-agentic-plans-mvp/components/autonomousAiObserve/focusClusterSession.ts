import { CLUSTERS } from './data';

/** Session key for “zoom” handoff: same focused cluster after Fleet ↔ Core platforms switches. */
export const FOCUSED_CLUSTER_SESSION_KEY = 'hpux.ai-hub-autonomous-agentic-plans-mvp.focused-cluster-id';

/** Fired after session focus changes so hub chrome (e.g. cluster inventory) stays in sync with the observe widget. */
export const FOCUSED_CLUSTER_CHANGE_EVENT = 'hpux.ai-hub-autonomous-agentic-plans-mvp.focused-cluster-change';

export function readFocusedClusterIdFromSession(): string | undefined {
  try {
    const v = sessionStorage.getItem(FOCUSED_CLUSTER_SESSION_KEY);
    if (v && CLUSTERS.some((c) => c.id === v)) {
      return v;
    }
  } catch {
    /* storage disabled / private mode */
  }
  return undefined;
}

export function writeFocusedClusterIdToSession(clusterId: string): void {
  try {
    if (CLUSTERS.some((c) => c.id === clusterId)) {
      sessionStorage.setItem(FOCUSED_CLUSTER_SESSION_KEY, clusterId);
      window.dispatchEvent(
        new CustomEvent(FOCUSED_CLUSTER_CHANGE_EVENT, { detail: { clusterId } })
      );
    }
  } catch {
    /* ignore */
  }
}

export function clearFocusedClusterSession(): void {
  try {
    sessionStorage.removeItem(FOCUSED_CLUSTER_SESSION_KEY);
    window.dispatchEvent(new CustomEvent(FOCUSED_CLUSTER_CHANGE_EVENT, { detail: { clusterId: '' } }));
  } catch {
    /* ignore */
  }
}

import type { AppShellPerspectiveKey } from '@app/shared/contexts/ActivePerspectiveContext';

/** Handoff from Plans list → full-page remediation drill-down (perspective-aware breadcrumb return). */
export const PLAN_REMEDIATION_DRILL_SESSION_KEY =
  'hpux.ai-hub-autonomous-agentic-plans-mvp.plan-remediation-drill';

export const PLANS_LIST_PATH = '/core/observe/ai-hub/plans';

export const PERSPECTIVE_QUERY_PARAM = 'perspective';
export const DRILL_FROM_QUERY_PARAM = 'from';

export type PlanRemediationDrillPayload = {
  perspectiveKey: AppShellPerspectiveKey;
};

export function parsePerspectiveKey(value: string | null | undefined): AppShellPerspectiveKey | null {
  if (value === 'core-platforms' || value === 'fleet-management') {
    return value;
  }
  return null;
}

export function perspectiveKeyFromShellName(name: string): 'core-platforms' | 'fleet-management' | null {
  if (name === 'Core platforms') {
    return 'core-platforms';
  }
  if (name === 'Fleet management') {
    return 'fleet-management';
  }
  return null;
}

export function isSingleClusterPerspectiveKey(key: AppShellPerspectiveKey | null): boolean {
  return key === 'core-platforms';
}

export function writePlanRemediationDrillSession(payload: PlanRemediationDrillPayload): void {
  try {
    sessionStorage.setItem(PLAN_REMEDIATION_DRILL_SESSION_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function readPlanRemediationDrillSession(): PlanRemediationDrillPayload | null {
  try {
    const raw = sessionStorage.getItem(PLAN_REMEDIATION_DRILL_SESSION_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as PlanRemediationDrillPayload;
    return parsePerspectiveKey(parsed?.perspectiveKey)
      ? { perspectiveKey: parsed.perspectiveKey }
      : null;
  } catch {
    return null;
  }
}

export function clearPlanRemediationDrillSession(): void {
  try {
    sessionStorage.removeItem(PLAN_REMEDIATION_DRILL_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function resolveDrillPerspectiveKey(
  fromQuery: string | null | undefined,
  fallbackShellName?: string,
): AppShellPerspectiveKey | null {
  return (
    parsePerspectiveKey(fromQuery)
    ?? readPlanRemediationDrillSession()?.perspectiveKey
    ?? perspectiveKeyFromShellName(fallbackShellName ?? '')
  );
}

export function getPlansListHref(perspectiveKey: AppShellPerspectiveKey): string {
  return `${PLANS_LIST_PATH}?${PERSPECTIVE_QUERY_PARAM}=${perspectiveKey}`;
}

export function getPlanRemediationHref(planSlug: string, perspectiveKey: AppShellPerspectiveKey): string {
  return `/core/observe/ai-hub/plans/${encodeURIComponent(planSlug)}/remediation?${DRILL_FROM_QUERY_PARAM}=${perspectiveKey}`;
}

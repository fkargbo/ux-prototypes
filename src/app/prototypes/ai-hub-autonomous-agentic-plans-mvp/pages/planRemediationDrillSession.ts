import type { AppShellPerspectiveKey } from '@app/shared/contexts/ActivePerspectiveContext';
import {
  buildPrototypeHref,
  DRILL_FROM_QUERY_PARAM,
  getPlanRemediationHref,
  parsePerspectiveKey,
  PLANS_LIST_PATH,
  perspectiveKeyFromShellName,
  isSingleClusterPerspectiveKey,
  readPerspectiveFromSearch,
} from '../prototypePerspectiveUrl';

/** Handoff from Plans list ↔ remediation drill-down (perspective-aware breadcrumb return). */
export const PLAN_REMEDIATION_DRILL_SESSION_KEY =
  'hpux.ai-hub-autonomous-agentic-plans-mvp.plan-remediation-drill';

export type PlanRemediationDrillPayload = {
  perspectiveKey: AppShellPerspectiveKey;
};

export {
  buildPrototypeHref,
  DRILL_FROM_QUERY_PARAM,
  getPlanRemediationHref,
  isSingleClusterPerspectiveKey,
  parsePerspectiveKey,
  PLANS_LIST_PATH,
  perspectiveKeyFromShellName,
  readPerspectiveFromSearch,
};

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

/** Perspective from URL query (`?perspective=` / legacy `?from=`) or session handoff. */
export function resolveDrillPerspectiveKey(
  searchParams: URLSearchParams | { get: (key: string) => string | null },
): AppShellPerspectiveKey | null {
  return readPerspectiveFromSearch(searchParams) ?? readPlanRemediationDrillSession()?.perspectiveKey ?? null;
}

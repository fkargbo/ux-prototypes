/**
 * V2 iteration workspace — session-storage handoff utilities for remediation drill navigation.
 * Uses v2-scoped path constants (/v2/ai-hub/observe/).
 */
import type { AppShellPerspectiveKey } from '@app/shared/contexts/ActivePerspectiveContext';
import {
  buildPrototypeHref,
  DRILL_FROM_QUERY_PARAM,
  getPlanRemediationHref,
  getTroubleshootingPlanDetailHref,
  isSingleClusterPerspectiveKey,
  parsePerspectiveKey,
  PLAN_REMEDIATION_SOURCE_QUERY_PARAM,
  PLANS_LIST_PATH,
  perspectiveKeyFromShellName,
  readPerspectiveFromSearch,
  readRemediationSource,
  TROUBLESHOOTING_PLANS_LIST_PATH,
  type PlanRemediationSource,
} from './v2PerspectiveUrl';

export const PLAN_REMEDIATION_DRILL_SESSION_KEY =
  'hpux.ai-hub-autonomous-agentic-plans-mvp.v2.plan-remediation-drill';

export type PlanRemediationDrillPayload = {
  perspectiveKey: AppShellPerspectiveKey;
};

export {
  buildPrototypeHref,
  DRILL_FROM_QUERY_PARAM,
  getPlanRemediationHref,
  getTroubleshootingPlanDetailHref,
  isSingleClusterPerspectiveKey,
  parsePerspectiveKey,
  PLAN_REMEDIATION_SOURCE_QUERY_PARAM,
  PLANS_LIST_PATH,
  TROUBLESHOOTING_PLANS_LIST_PATH,
  perspectiveKeyFromShellName,
  readPerspectiveFromSearch,
  readRemediationSource,
  type PlanRemediationSource,
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
    if (!raw) return null;
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
  searchParams: URLSearchParams | { get: (key: string) => string | null },
): AppShellPerspectiveKey | null {
  return readPerspectiveFromSearch(searchParams) ?? readPlanRemediationDrillSession()?.perspectiveKey ?? null;
}

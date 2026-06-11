import type { AppShellPerspectiveKey } from '@app/shared/contexts/ActivePerspectiveContext';

/** Handoff from Plans list → full-page remediation drill-down (perspective-aware breadcrumb return). */
export const PLAN_REMEDIATION_DRILL_SESSION_KEY =
  'hpux.ai-hub-autonomous-agentic-plans-mvp.plan-remediation-drill';

export type PlanRemediationDrillPayload = {
  perspectiveKey: AppShellPerspectiveKey;
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
    if (parsed?.perspectiveKey === 'core-platforms' || parsed?.perspectiveKey === 'fleet-management') {
      return parsed;
    }
    return null;
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

export const PLANS_LIST_PATH = '/core/observe/ai-hub/plans';

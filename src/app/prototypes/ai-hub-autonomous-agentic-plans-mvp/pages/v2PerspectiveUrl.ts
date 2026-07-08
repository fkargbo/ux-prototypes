/**
 * V2 iteration workspace — all internal navigation scoped to /v2/ai-hub/.
 * Re-exports shared URL utilities and overrides the path constants + builders.
 * Import from THIS file (not prototypePerspectiveUrl) inside pages/v2/ and pages/ai-hub-plans-v2/.
 *
 * Option A architectural change: plan details now live under
 * /v2/ai-hub/agentic-plans/plans/:planId (consolidated under Agentic Plans,
 * removed from the Observe domain).
 */
import type { AppShellPerspectiveKey } from '@app/shared/contexts/ActivePerspectiveContext';
import { buildPrototypeHref } from '../prototypePerspectiveUrl';

export {
  buildPrototypeHref,
  DEFAULT_PROTOTYPE_PERSPECTIVE,
  DRILL_FROM_QUERY_PARAM,
  isSingleClusterPerspectiveKey,
  parsePerspectiveKey,
  PERSPECTIVE_QUERY_PARAM,
  perspectiveKeyFromShellName,
  PLAN_REMEDIATION_SOURCE_QUERY_PARAM,
  readPerspectiveFromSearch,
  readRemediationSource,
  resolveActivePerspectiveKey,
  type PlanRemediationSource,
} from '../prototypePerspectiveUrl';

export const PLANS_LIST_PATH = '/v2/ai-hub/observe/plans';

/**
 * Option A: plan details are consolidated under the Agentic Plans workspace.
 * The list itself is the main Agentic Plans page (PLANS_LIST_PATH).
 */
export const TROUBLESHOOTING_PLANS_LIST_PATH = PLANS_LIST_PATH;

export function getPlanRemediationHref(planSlug: string, perspectiveKey: AppShellPerspectiveKey): string {
  return buildPrototypeHref(
    `/v2/ai-hub/observe/plans/${encodeURIComponent(planSlug)}/remediation`,
    perspectiveKey,
  );
}

export function getTroubleshootingPlanDetailHref(planId: string, perspectiveKey: AppShellPerspectiveKey): string {
  return buildPrototypeHref(
    `/v2/ai-hub/agentic-runs/runs/${encodeURIComponent(planId)}`,
    perspectiveKey,
  );
}

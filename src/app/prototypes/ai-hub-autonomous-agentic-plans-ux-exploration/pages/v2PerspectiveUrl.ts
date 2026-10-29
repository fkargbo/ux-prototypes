/**
 * UX Exploration workspace — all internal navigation scoped to /ux-exp/ai-hub/.
 * Re-exports shared URL utilities and overrides the path constants + builders.
 * Import from THIS file (not prototypePerspectiveUrl) inside pages/v2/ and pages/ai-hub-plans-v2/.
 *
 * Option A architectural change: plan details now live under
 * /ux-exp/ai-hub/agentic-runs/runs/:planId (consolidated under Agentic Plans,
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

export const PLANS_LIST_PATH = '/ux-exp/ai-hub/observe/plans';

/**
 * Option A: plan details are consolidated under the Agentic Plans workspace.
 * The list itself is the main Agentic Plans page (PLANS_LIST_PATH).
 */
export const TROUBLESHOOTING_PLANS_LIST_PATH = PLANS_LIST_PATH;

/** Administration → Cluster Update (domain UI; not under /v2/ai-hub). */
export const CLUSTER_UPDATE_PATH = '/core/administration/cluster-update';

export function getClusterUpdateHref(perspectiveKey: AppShellPerspectiveKey): string {
  return buildPrototypeHref(CLUSTER_UPDATE_PATH, perspectiveKey);
}

export function getPlanRemediationHref(planSlug: string, perspectiveKey: AppShellPerspectiveKey): string {
  return buildPrototypeHref(
    `/ux-exp/ai-hub/observe/plans/${encodeURIComponent(planSlug)}/remediation`,
    perspectiveKey,
  );
}

export function getTroubleshootingPlanDetailHref(planId: string, perspectiveKey: AppShellPerspectiveKey): string {
  return buildPrototypeHref(
    `/ux-exp/ai-hub/agentic-runs/runs/${encodeURIComponent(planId)}`,
    perspectiveKey,
  );
}

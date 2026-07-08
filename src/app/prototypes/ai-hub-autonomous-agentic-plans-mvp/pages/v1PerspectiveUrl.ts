/**
 * V1 frozen baseline — all internal navigation scoped to /v1/ai-hub/observe/.
 * Re-exports shared URL utilities and overrides the path constants + builders.
 * Import from THIS file (not prototypePerspectiveUrl) inside pages/v1/ and pages/ai-hub-v1/.
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

export const PLANS_LIST_PATH = '/v1/ai-hub/observe/plans';
export const TROUBLESHOOTING_PLANS_LIST_PATH = '/v1/ai-hub/observe/troubleshooting-plans';

export function getPlanRemediationHref(planSlug: string, perspectiveKey: AppShellPerspectiveKey): string {
  return buildPrototypeHref(
    `/v1/ai-hub/observe/plans/${encodeURIComponent(planSlug)}/remediation`,
    perspectiveKey,
  );
}

export function getTroubleshootingPlanDetailHref(planId: string, perspectiveKey: AppShellPerspectiveKey): string {
  return buildPrototypeHref(
    `/v1/ai-hub/observe/troubleshooting-plans/${encodeURIComponent(planId)}`,
    perspectiveKey,
  );
}

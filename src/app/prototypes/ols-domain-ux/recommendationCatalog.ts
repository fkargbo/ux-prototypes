import type { PlanExecutionRuntime } from './context/PlanTerminationContext';
import { OBSERVABILITY_TRIGGER_DOMAIN_OPTIONS } from './pages/ai-hub-plans-v2/PlansFilterToolbar';
import {
  buildPlansForPerspective,
  type PlanRow,
} from './pages/ai-hub-plans-v2/PlansAndApprovalsTab';

const OBSERVABILITY_DOMAINS = new Set<string>(OBSERVABILITY_TRIGGER_DOMAIN_OPTIONS);

/** Actionable recommendations for the Recommendation hub (excludes cluster-update / analysis-only). */
export function isActionableRecommendation(plan: PlanRow): boolean {
  if (plan.planKind === 'analysis-only') {
    return false;
  }
  if (plan.triggerDomain === 'Cluster update') {
    return false;
  }
  if (plan.triggerDomain === 'GitOps' || plan.triggerDomain === 'Pipelines') {
    return true;
  }
  if (plan.triggerDomain === 'Security' || plan.id.startsWith('tp2') || plan.id.startsWith('ap8')) {
    return true;
  }
  if (OBSERVABILITY_DOMAINS.has(plan.triggerDomain)) {
    return true;
  }
  return false;
}

export function buildRecommendationCatalog(
  isSingleCluster: boolean,
  runtime: PlanExecutionRuntime = { abortedPlans: {} },
): PlanRow[] {
  return buildPlansForPerspective(isSingleCluster, runtime).filter(isActionableRecommendation);
}

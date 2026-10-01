import type { AppShellPerspectiveKey } from '@app/shared/contexts/ActivePerspectiveContext';
import { buildPrototypeHref } from '../v2PerspectiveUrl';
import { PLANS_LIST_PATH, TROUBLESHOOTING_PLANS_LIST_PATH } from '../v2PerspectiveUrl';
import type { PlanRow } from './PlansAndApprovalsTab';
import { OBSERVABILITY_TRIGGER_DOMAIN_OPTIONS } from './PlansFilterToolbar';

export { PLANS_LIST_PATH, TROUBLESHOOTING_PLANS_LIST_PATH };

/** Mock Kubernetes annotation keys agreed for proposal origin handoff. */
export const ANNOTATION_SOURCE_DOMAIN = 'agentic.openshift.io/source-domain';
export const ANNOTATION_DETAIL_URL = 'agentic.openshift.io/detail-url';

export type PlanSourceDomain = 'observability' | 'acs' | 'cluster-update';

export type PlanDomainAnnotations = {
  sourceDomain: PlanSourceDomain;
  detailPath: string;
  listPath: string;
  listBreadcrumbLabel: string;
};

const ACS_PLAN_IDS = new Set(['tp2', 'ap8']);

const OBSERVABILITY_DOMAIN_SET = new Set<string>(OBSERVABILITY_TRIGGER_DOMAIN_OPTIONS);

function isObservabilityPlan(plan: PlanRow): boolean {
  return OBSERVABILITY_DOMAIN_SET.has(plan.triggerDomain);
}

function isSecurityPlan(plan: PlanRow): boolean {
  return plan.triggerDomain === 'Security' || ACS_PLAN_IDS.has(plan.id);
}

function isClusterUpdatePlan(plan: PlanRow): boolean {
  return plan.triggerDomain === 'Cluster update' || plan.planKind === 'analysis-only';
}

/** Resolves mock annotation metadata for global list drill-down. */
export function resolvePlanDomainAnnotations(plan: PlanRow): PlanDomainAnnotations {
  if (isObservabilityPlan(plan)) {
    return {
      sourceDomain: 'observability',
      // Option A: run details consolidated under Agentic Runs workspace
      detailPath: `/ux-exp/ai-hub/agentic-runs/runs/${encodeURIComponent(plan.id)}`,
      listPath: TROUBLESHOOTING_PLANS_LIST_PATH,
      listBreadcrumbLabel: 'Agentic runs',
    };
  }

  if (isSecurityPlan(plan)) {
    const slug = plan.name ?? plan.id;
    return {
      sourceDomain: 'acs',
      detailPath: `/ux-exp/ai-hub/observe/acs-plans/${encodeURIComponent(slug)}`,
      listPath: PLANS_LIST_PATH,
      listBreadcrumbLabel: 'Agentic runs',
    };
  }

  const slug = plan.name ?? plan.id;
  return {
    sourceDomain: 'cluster-update',
    detailPath: `/ux-exp/ai-hub/observe/plans/${encodeURIComponent(slug)}/remediation`,
    listPath: PLANS_LIST_PATH,
    listBreadcrumbLabel: 'Agentic runs',
  };
}

export function getPlanListHref(
  plan: PlanRow,
  perspectiveKey: AppShellPerspectiveKey,
): string {
  const { listPath } = resolvePlanDomainAnnotations(plan);
  return buildPrototypeHref(listPath, perspectiveKey);
}

export function getPlanDetailHref(
  plan: PlanRow,
  perspectiveKey: AppShellPerspectiveKey,
): string {
  const { detailPath } = resolvePlanDomainAnnotations(plan);
  const href = buildPrototypeHref(detailPath, perspectiveKey);
  if (plan.planKind === 'analysis-only') {
    const sep = href.includes('?') ? '&' : '?';
    return `${href}${sep}kind=analysis-only`;
  }
  return href;
}

import type { NavigateFunction } from 'react-router-dom';
import type { AppShellPerspectiveKey } from '@app/shared/contexts/ActivePerspectiveContext';
import type { DomainUxPattern } from './domainUxPattern';
import { getPlanDetailHref } from './pages/ai-hub-plans-v2/domainPlanNavigation';
import type { PlanRow } from './pages/ai-hub-plans-v2/PlansAndApprovalsTab';
import { buildPrototypeHref } from './pages/v2PerspectiveUrl';
import { writePlanRemediationDrillSession } from './pages/planRemediationDrillSession';

export const RECOMMENDATION_HUB_LIST_PATH = '/core/recommendation-hub';
export const RECOMMENDATION_DETAIL_PATH_PREFIX = '/core/recommendation-hub/recommendations';

export function getRecommendationDetailHref(
  plan: PlanRow,
  perspectiveKey: AppShellPerspectiveKey,
): string {
  return buildPrototypeHref(
    `${RECOMMENDATION_DETAIL_PATH_PREFIX}/${encodeURIComponent(plan.id)}`,
    perspectiveKey,
  );
}

export type InvestigationHandoffInput = {
  pattern: DomainUxPattern;
  plan: PlanRow;
  perspectiveKey: AppShellPerspectiveKey;
  agenticRunsHref: string;
  navigate: NavigateFunction;
  openInvestigationPanel?: (plan: PlanRow) => void;
};

export function handoffToInvestigation(input: InvestigationHandoffInput): void {
  const { pattern, plan, perspectiveKey, agenticRunsHref, navigate, openInvestigationPanel } = input;

  writePlanRemediationDrillSession({ perspectiveKey });

  if (pattern === 'context-panel' && openInvestigationPanel) {
    openInvestigationPanel(plan);
    return;
  }

  if (pattern === 'recommendation-hub') {
    const href = getRecommendationDetailHref(plan, perspectiveKey);
    navigate(href, { state: { plan } });
    return;
  }

  const href = agenticRunsHref || getPlanDetailHref(plan, perspectiveKey);
  navigate(href, { state: { plan } });
}

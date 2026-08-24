import type { AppShellPerspectiveKey } from '@app/shared/contexts/ActivePerspectiveContext';
import { buildPlansForPerspective, type PlanRow } from '../ai-hub-plans-v2/PlansAndApprovalsTab';
import { getPlanDetailHref } from '../ai-hub-plans-v2/domainPlanNavigation';
import {
  markGitOpsInvestigationCreated,
  readCreatedGitOpsInvestigations,
  resolveGitOpsPlanIdForApplication,
} from '../ai-hub-plans-v2/gitOpsInvestigationPlans';
import { writePlanRemediationDrillSession } from '../planRemediationDrillSession';
import type { GitOpsApplication } from './data/gitOpsApplicationsData';

export {
  markGitOpsInvestigationCreated,
  readCreatedGitOpsInvestigations,
} from '../ai-hub-plans-v2/gitOpsInvestigationPlans';

export function gitOpsApplicationHasExistingInvestigation(applicationId: string): boolean {
  const seededExistingInvestigations = new Set<string>(['agentit']);
  return seededExistingInvestigations.has(applicationId)
    || readCreatedGitOpsInvestigations().includes(applicationId);
}

function resolvePerspectiveKey(isSingleCluster: boolean): AppShellPerspectiveKey {
  return isSingleCluster ? 'core-platforms' : 'fleet-management';
}

/** Resolve catalog plan + v2 agentic run detail href (same handoff pattern as Alerting). */
export function resolveGitOpsApplicationInvestigationNavigation(
  app: GitOpsApplication,
  isSingleCluster: boolean,
): { href: string; plan: PlanRow; planId: string } {
  const planId = resolveGitOpsPlanIdForApplication(app);
  if (!planId) {
    throw new Error(`No GitOps investigation plan mapped for application "${app.id}"`);
  }

  const perspectiveKey = resolvePerspectiveKey(isSingleCluster);

  markGitOpsInvestigationCreated(app.id);

  const catalogPlan = buildPlansForPerspective(isSingleCluster).find((plan) => plan.id === planId);
  if (!catalogPlan) {
    throw new Error(`GitOps investigation plan "${planId}" is not in the agentic runs catalog`);
  }

  writePlanRemediationDrillSession({ perspectiveKey });

  return {
    planId,
    plan: catalogPlan,
    href: getPlanDetailHref(catalogPlan, perspectiveKey),
  };
}

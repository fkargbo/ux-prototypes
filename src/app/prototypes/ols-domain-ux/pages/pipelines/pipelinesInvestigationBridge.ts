import type { AppShellPerspectiveKey } from '@app/shared/contexts/ActivePerspectiveContext';
import { buildPlansForPerspective, type PlanRow } from '../ai-hub-plans-v2/PlansAndApprovalsTab';
import { getPlanDetailHref } from '../ai-hub-plans-v2/domainPlanNavigation';
import {
  markPipelinesInvestigationCreated,
  readCreatedPipelinesInvestigations,
  resolvePipelinesPlanIdForRun,
} from '../ai-hub-plans-v2/pipelinesInvestigationPlans';
import { writePlanRemediationDrillSession } from '../planRemediationDrillSession';
import type { PipelineRun } from './data/pipelineRunsData';

export {
  markPipelinesInvestigationCreated,
  readCreatedPipelinesInvestigations,
} from '../ai-hub-plans-v2/pipelinesInvestigationPlans';

export function pipelineRunHasExistingInvestigation(pipelineRunId: string): boolean {
  const seededExistingInvestigations = new Set<string>(['build-webhook-listener-z8k4n']);
  return seededExistingInvestigations.has(pipelineRunId)
    || readCreatedPipelinesInvestigations().includes(pipelineRunId);
}

function resolvePerspectiveKey(isSingleCluster: boolean): AppShellPerspectiveKey {
  return isSingleCluster ? 'core-platforms' : 'fleet-management';
}

/** Resolve catalog plan + v2 agentic run detail href (same handoff pattern as GitOps). */
export function resolvePipelineRunInvestigationNavigation(
  run: PipelineRun,
  isSingleCluster: boolean,
): { href: string; plan: PlanRow; planId: string } {
  const planId = resolvePipelinesPlanIdForRun(run);
  if (!planId) {
    throw new Error(`No Pipelines investigation plan mapped for PipelineRun "${run.id}"`);
  }

  const perspectiveKey = resolvePerspectiveKey(isSingleCluster);

  markPipelinesInvestigationCreated(run.id);

  const catalogPlan = buildPlansForPerspective(isSingleCluster).find((plan) => plan.id === planId);
  if (!catalogPlan) {
    throw new Error(`Pipelines investigation plan "${planId}" is not in the agentic runs catalog`);
  }

  writePlanRemediationDrillSession({ perspectiveKey });

  return {
    planId,
    plan: catalogPlan,
    href: getPlanDetailHref(catalogPlan, perspectiveKey),
  };
}

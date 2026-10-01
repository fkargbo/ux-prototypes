import { useMemo } from 'react';
import { usePlanTermination, type PlanExecutionRuntime } from '../context/PlanTerminationContext';
import { usePlanWorkflow } from '../context/PlanWorkflowContext';

/** Merges termination + workflow session state for `buildPlansForPerspective`. */
export function usePlanBuildRuntime(): PlanExecutionRuntime {
  const { abortedPlans } = usePlanTermination();
  const { workflowByPlanId } = usePlanWorkflow();
  return useMemo(
    () => ({ abortedPlans, workflowByPlanId }),
    [abortedPlans, workflowByPlanId],
  );
}

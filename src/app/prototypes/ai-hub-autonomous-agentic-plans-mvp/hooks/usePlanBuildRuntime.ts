import { useMemo } from 'react';
import { usePlanTermination, type PlanExecutionRuntime } from '../context/PlanTerminationContext';
import { usePlanWorkflow } from '../context/PlanWorkflowContext';
import { useApprovalPolicy } from '../context/ApprovalPolicyContext';

/** Merges termination + workflow session state for `buildPlansForPerspective`. */
export function usePlanBuildRuntime(): PlanExecutionRuntime {
  const { abortedPlans } = usePlanTermination();
  const { workflowByPlanId } = usePlanWorkflow();
  const {
    analysisPolicy,
    executionPolicy,
    verificationPolicy,
    escalationPolicy,
  } = useApprovalPolicy();
  return useMemo(
    () => ({
      abortedPlans,
      workflowByPlanId,
      approvalPolicy: {
        analysis: analysisPolicy,
        execution: executionPolicy,
        verification: verificationPolicy,
        escalation: escalationPolicy,
      },
    }),
    [
      abortedPlans,
      analysisPolicy,
      escalationPolicy,
      executionPolicy,
      verificationPolicy,
      workflowByPlanId,
    ],
  );
}

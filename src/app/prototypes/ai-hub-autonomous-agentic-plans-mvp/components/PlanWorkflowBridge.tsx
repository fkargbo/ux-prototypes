import { useEffect } from 'react';
import { revisionDiscussionBridge } from '../persesAgenticBridge';
import { usePlanWorkflow } from '../context/PlanWorkflowContext';

/** Connects Lightspeed revision chat commits to session workflow state. */
export function PlanWorkflowBridge() {
  const { submitRevisionFeedback } = usePlanWorkflow();

  useEffect(() => {
    revisionDiscussionBridge.registerFeedbackHandler(submitRevisionFeedback);
    return () => revisionDiscussionBridge.unregisterFeedbackHandler();
  }, [submitRevisionFeedback]);

  return null;
}

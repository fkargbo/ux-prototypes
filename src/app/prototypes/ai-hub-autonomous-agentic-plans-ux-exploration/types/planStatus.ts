/**
 * Backend-aligned plan lifecycle phases for the MVP prototype.
 * Source: agentic.openshift.io/v1alpha1 ProposalPhase
 * https://github.com/openshift/lightspeed-agentic-operator/blob/main/api/v1alpha1/proposal_types.go
 */
export type PlanStatus =
  | 'Pending'           // No conditions yet — queued for agent pickup
  | 'Analyzing'         // Analyzed=Unknown — analysis in progress
  | 'Proposed'          // Analyzed=True — options ready for review
  | 'Approved'          // ProposalApproval accepted, execution imminent
  | 'Executing'         // Executed=Unknown — execution in progress
  | 'Verifying'         // Verified=Unknown — post-execution checks running
  | 'Acknowledged'      // Prototype: analysis-only plan reviewed by operator
  | 'Completed'         // Verified=True — terminal success
  | 'Failed'            // Any condition=False — terminal failure
  | 'Denied'            // Denied=True — operator rejected the proposal
  | 'Escalating'        // Escalated=Unknown — escalation in progress
  | 'Escalated'         // Escalated=True — terminal, requires human intervention
  | 'EmergencyStopped'  // EmergencyStopped=True — halted by operator override
  | 'Plan aborted'     // Prototype alias for EmergencyStopped (legacy — execution-phase halt)
  | 'Run aborted';     // Analysis phase canceled before execution began (OLS-3719)

/** Maps legacy mock seed values to backend-aligned labels. */
export const LEGACY_STATUS_TO_PLAN_STATUS: Record<string, PlanStatus> = {
  Investigating: 'Analyzing',
  'Waiting Approval': 'Proposed',
  Remediating: 'Executing',
  Completed: 'Completed',
  Failed: 'Failed',
  'Plan aborted': 'Plan aborted',
  'Run aborted': 'Run aborted',
};

export function normalizePlanStatus(status: string): PlanStatus {
  return (LEGACY_STATUS_TO_PLAN_STATUS[status] ?? status) as PlanStatus;
}

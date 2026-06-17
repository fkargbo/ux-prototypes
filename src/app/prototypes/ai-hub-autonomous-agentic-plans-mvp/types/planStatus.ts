/** Backend-aligned plan lifecycle phases for the MVP prototype. */
export type PlanStatus =
  | 'Analyzing'
  | 'Proposed'
  | 'Approved'
  | 'Executing'
  | 'Verifying'
  | 'Completed'
  | 'Failed'
  | 'Plan aborted';

/** Maps legacy mock seed values to backend-aligned labels. */
export const LEGACY_STATUS_TO_PLAN_STATUS: Record<string, PlanStatus> = {
  Investigating: 'Analyzing',
  'Waiting Approval': 'Proposed',
  Remediating: 'Executing',
  Completed: 'Completed',
  Failed: 'Failed',
  'Plan aborted': 'Plan aborted',
};

export function normalizePlanStatus(status: string): PlanStatus {
  return (LEGACY_STATUS_TO_PLAN_STATUS[status] ?? status) as PlanStatus;
}

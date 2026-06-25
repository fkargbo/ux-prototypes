/** Backend-aligned rollback plan (options[].proposal.rollbackPlan). */
export interface RollbackPlan {
  description: string;
  command?: string;
}

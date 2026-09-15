import { MVP_PLAN_IDS } from './plansMvpConstants';

/** Hub multicluster demo spokes — used for Agentic Runs list/filter (HPUX-2155). */
export const AGENTIC_RUN_TARGET_CLUSTER_NAMES = [
  'prod-east-2',
  'staging-eu-1',
  'dev-us-west',
] as const;

export type AgenticRunTargetClusterName = (typeof AGENTIC_RUN_TARGET_CLUSTER_NAMES)[number];

const TARGET_CLUSTER_BY_PLAN_ID: Record<string, AgenticRunTargetClusterName> = (() => {
  const sortedPlanIds = [...MVP_PLAN_IDS].sort();
  const assignments: Record<string, AgenticRunTargetClusterName> = {};
  sortedPlanIds.forEach((planId, index) => {
    assignments[planId] =
      AGENTIC_RUN_TARGET_CLUSTER_NAMES[index % AGENTIC_RUN_TARGET_CLUSTER_NAMES.length];
  });
  return assignments;
})();

/** Stable per-run target cluster for hub multicluster UI (filter + table column). */
export function assignAgenticRunTargetCluster(planId: string): AgenticRunTargetClusterName {
  return TARGET_CLUSTER_BY_PLAN_ID[planId] ?? AGENTIC_RUN_TARGET_CLUSTER_NAMES[0];
}

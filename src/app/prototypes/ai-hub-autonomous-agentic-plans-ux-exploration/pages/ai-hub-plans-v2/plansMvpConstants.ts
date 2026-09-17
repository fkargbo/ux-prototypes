import type { PlanTokenBurn } from '../../types/tokenBurn';
import type { ConfidenceTier } from '../../types/confidenceTier';
import type { RollbackPlan } from '../../types/rollbackPlan';
import type { Reversibility } from '../../types/reversibility';
import type { RiskLevel, RemediationRisk } from '../../types/riskScore';
import { mapOptionRisk, maxRiskLevel } from '../../types/riskScore';

/** Retained MVP plan identifiers — Observability, Cluster update, Security only. */
export const MVP_PLAN_IDS = new Set([
  'tp2',
  'ap8',
  'cp1',
  'cp2',
  'cp4',
  'op1',
  'op2',
  'op3',
  'op4',
  'op5',
  'certmgr-renewal-pending',
  'acs-netpol-remediation-denied',
  'quota-exhaustion-escalating',
  'ingress-controller-escalated',
  'prometheus-wal-emergency-stopped',
  'etcd-defrag-failed',
  'op5-manual-escalation',
  'inv-alert-node-not-ready',
  'inv-alert-mds-cache-high',
  'inv-alert-vm-cannot-evict',
  'inv-alert-node-cpu-high',
]);

export const MVP_TRIGGER_DOMAINS = ['Observability', 'Cluster update', 'Security'] as const;

/** Cluster `ApprovalPolicy` default for execution verification retries (all proposals). */
export const GLOBAL_APPROVAL_POLICY_MAX_ATTEMPTS = 2;

export function normalizeTriggerDomain(domain: string): string {
  return domain === 'Control Plane' ? 'Cluster update' : domain;
}

export const PLAN_TOKEN_BURN: Record<string, PlanTokenBurn> = {
  tp2: { analysis: 1840, executionByOption: {} },
  ap8: { analysis: 920, executionByOption: { 'ap8-o1': 640, 'ap8-o2': 1100 } },
  cp1: { analysis: 2100, executionByOption: { 'cp1-o1': 4800, 'cp1-o2': 420 } },
  cp2: { analysis: 680, execution: 3200 },
  cp4: { analysis: 1240, executionByOption: {} },
  op1: { analysis: 740, execution: 1180 },
  op2: { analysis: 560, executionByOption: { 'op2-o1': 380, 'op2-o2': 290 } },
  op3: { analysis: 1120, execution: 760, executionByOption: { 'op3-o1': 760 } },
  op4: { analysis: 890, execution: 1540 },
  op5: { analysis: 480, executionByOption: { 'op5-o1': 620, 'op5-o2': 540 } },
  'inv-alert-node-not-ready': { analysis: 420 },
  'inv-alert-mds-cache-high': { analysis: 410 },
  'inv-alert-vm-cannot-evict': { analysis: 400 },
  'inv-alert-node-cpu-high': { analysis: 390 },
  'etcd-defrag-failed': { analysis: 720, execution: 1450 },
  'op5-manual-escalation': { analysis: 520, execution: 640 },
};

/** Per-option diagnosis confidence (backend: options[].diagnosis.confidence). */
export const PLAN_OPTION_CONFIDENCE: Record<string, Record<string, ConfidenceTier>> = {
  ap8: { 'ap8-o1': 'High', 'ap8-o2': 'Low' },
  cp1: { 'cp1-o1': 'High', 'cp1-o2': 'Medium' },
  op2: { 'op2-o1': 'High', 'op2-o2': 'Medium' },
  op3: { 'op3-o1': 'Medium', 'op3-o2': 'Low' },
  op5: { 'op5-o1': 'High', 'op5-o2': 'High' },
};

export function enrichRemediationOptionsWithConfidence<O extends { id: string; confidence?: ConfidenceTier }>(
  planId: string,
  options: O[],
  planFallback?: ConfidenceTier,
): O[] {
  const byOptionId = PLAN_OPTION_CONFIDENCE[planId];
  return options.map((opt) => ({
    ...opt,
    confidence: opt.confidence ?? byOptionId?.[opt.id] ?? planFallback ?? 'Medium',
  }));
}

/** Per-option rollback plans (backend: options[].proposal.rollbackPlan). */
export const PLAN_OPTION_ROLLBACK: Record<string, Record<string, RollbackPlan>> = {
  ap8: {
    'ap8-o1': {
      description:
        'Revert the deployment patch and remove the mutating admission webhook if rollback is required. Rolling restart restores prior hostNetwork configuration from the last known revision.',
      command:
        'oc rollout undo deployment/<deployment-name> -n production && oc delete mutatingwebhookconfiguration hostnetwork-guard --ignore-not-found',
    },
  },
  cp1: {
    'cp1-o1': {
      description:
        'Minor upgrades are not automatically reversible. Rollback requires restoring the cluster from a supported backup or etcd snapshot taken before the upgrade began.',
      command: 'oc adm upgrade --to-image=<previous-release-image> --allow-explicit-upgrade',
    },
    'cp1-o2': {
      description: 'Preflight validation does not mutate the cluster — no rollback is required.',
    },
  },
  op2: {
    'op2-o1': {
      description:
        'Restore the previous PagerDuty integration secret and roll alertmanager-main to reload configuration.',
      command: 'oc rollout undo statefulset/alertmanager-main -n openshift-monitoring',
    },
    'op2-o2': {
      description:
        'Re-enable the PagerDuty receiver route in Alertmanager. Partial rollback — alert delivery may remain impaired until a valid integration token is restored.',
      command:
        'oc patch secret alertmanager-main -n openshift-monitoring --type merge -p \'{"data":{"alertmanager.yaml":"<restore pagerduty receiver route>"}}\'',
    },
  },
  op3: {
    'op3-o1': {
      description:
        'Restore the quarantined TSDB block from backup if compaction data was removed. Partial rollback — metrics history for the quarantine window may be incomplete.',
      command:
        'oc scale statefulset/thanos-compactor --replicas=0 -n openshift-monitoring && oc rsh -n openshift-monitoring thanos-compactor-0 -- mv /var/thanos/compact/quarantine/01HX* /var/thanos/compact/data/',
    },
    'op3-o2': {
      description:
        'PVC resize cannot be reversed in place. Partial rollback requires restoring the volume from snapshot and reattaching the compactor.',
    },
  },
  op5: {
    'op5-o1': {
      description:
        'If Grafana fails after lock removal, restore the SQLite database from the PVC snapshot taken before remediation.',
      command:
        'oc scale deployment/grafana --replicas=0 -n openshift-monitoring && oc restore pvc/grafana-pvc-snapshot -n openshift-monitoring',
    },
    'op5-o2': {
      description:
        'Revert to the pre-checkpoint database file from the volume snapshot if the checkpoint left Grafana in an inconsistent state.',
      command:
        'oc scale deployment/grafana --replicas=0 -n openshift-monitoring && oc rsh -n openshift-monitoring grafana-debug -- cp /var/lib/grafana/backup/grafana.db /var/lib/grafana/grafana.db',
    },
  },
};

export function resolveOptionRollbackPlan(
  planId: string,
  option: {
    id: string;
    title: string;
    reversible: Reversibility;
    rollbackPlan?: RollbackPlan;
  },
): RollbackPlan | null {
  if (option.reversible === 'Irreversible') {
    return null;
  }
  if (option.rollbackPlan) {
    return option.rollbackPlan;
  }
  const explicit = PLAN_OPTION_ROLLBACK[planId]?.[option.id];
  if (explicit) {
    return explicit;
  }
  const partialNote =
    option.reversible === 'Partial'
      ? 'This rollback may only partially restore the prior configuration. '
      : '';
  return {
    description: `${partialNote}Undo the remediation by reversing the agent-proposed changes for "${option.title}". Review cluster state and verification checks before considering rollback complete.`,
  };
}

export function derivePlanRiskLevel(
  planId: string,
  options: Array<{ risk: RemediationRisk }>,
): RiskLevel {
  if (options.length === 0) {
    const fallback: Record<string, RiskLevel> = {
      tp2: 'Medium',
      ap8: 'High',
      cp1: 'High',
      cp2: 'Low',
      cp4: 'High',
      op1: 'Low',
      op2: 'Low',
      op3: 'Medium',
      op4: 'Low',
      op5: 'Medium',
      'etcd-defrag-failed': 'High',
    };
    return fallback[planId] ?? 'Medium';
  }
  return maxRiskLevel(options.map((opt) => mapOptionRisk(opt.risk)));
}

/** Plans where the configured LLM SDK does not return token counts (cell stays blank). */
export const PLAN_TOKEN_SDK_UNAVAILABLE = new Set([
  'op1',
  'op4',
  'inv-alert-mds-cache-high',
]);

export function getPlanTokenBurn(_planId: string): PlanTokenBurn {
  // Token usage reporting is not yet available — OLS-3661 (Token usage reporting and
  // attribution per AgenticRun owner/namespace) must complete before real data can be wired in.
  return {};
}

export function getOptionExecutionTokenBurn(planId: string, optionId: string): number | undefined {
  const burn = PLAN_TOKEN_BURN[planId];
  if (!burn) {
    return undefined;
  }
  return burn.executionByOption?.[optionId] ?? burn.execution;
}

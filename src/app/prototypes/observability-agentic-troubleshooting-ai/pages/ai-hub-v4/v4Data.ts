/**
 * v4.0 — Recommendation Hub mock data.
 *
 * All data is self-contained in this file. Nothing in v1 / v2 / v3 is
 * imported or modified. This is the single source of truth for the
 * RecommendationHubPage KPI cards and ActivePlansTable.
 *
 * Epic: HPUX-1653 · Story: Recommendation Hub inbox UI (inventory, KPI, plans table)
 */

// ─── Domain types ─────────────────────────────────────────────────────────────

export type TriggerSource =
  | 'Prometheus'
  | 'GitOps Drift'
  | 'ACS Violation'
  | 'Pipeline'
  | 'ACM';

export type EnvironmentType = 'Prod' | 'Test' | 'Sandbox';

export type StatusPhase = 'Proposed' | 'Executing' | 'Failed' | 'Escalated';

// ─── Plan row model ───────────────────────────────────────────────────────────

export interface V4PlanRow {
  id: string;
  /** Numeric priority 0-100 derived from customer-impact feedback signals. */
  impactScore: number;
  /** Kebab-case plan identifier string (mirrors the internal operator CR name). */
  planSynopsis: string;
  /** One or more originating signal domains. */
  triggerSources: TriggerSource[];
  /** Cluster ID / display name where the first signal originated. */
  targetCluster: string;
  environmentType: EnvironmentType;
  statusPhase: StatusPhase;
}

// ─── Fleet inventory metrics (Row 1, left card) ───────────────────────────────

export interface V4FleetInventoryMetrics {
  clusters: number;
  nodes: number;
  namespaces: number;
  workloads: number;
  /** Total open signals across all clusters — Prometheus + ACS + GitOps + Pipeline. */
  openSignals: number;
}

export const V4_FLEET_INVENTORY: V4FleetInventoryMetrics = {
  clusters: 24,
  nodes: 612,
  namespaces: 389,
  workloads: 2104,
  openSignals: 847,
};

// ─── Plans Overview KPI (Row 1, right card) ───────────────────────────────────

export interface V4PlansOverviewKpi {
  activePlans: number;
  plansInSandbox: number;
  estMttrSaved: string;
}

export const V4_PLANS_KPI: V4PlansOverviewKpi = {
  activePlans: 18,
  plansInSandbox: 5,
  estMttrSaved: '6.2 hrs',
};

// ─── Plan rows (Row 3 table) ───────────────────────────────────────────────────

export const V4_PLAN_ROWS: V4PlanRow[] = [
  {
    id: 'plan-001',
    impactScore: 94,
    planSynopsis: 'reconcile-prometheus-targets',
    triggerSources: ['Prometheus'],
    targetCluster: 'prod-us-east-01',
    environmentType: 'Prod',
    statusPhase: 'Executing',
  },
  {
    id: 'plan-002',
    impactScore: 91,
    planSynopsis: 'acm-placement-rule-divergence',
    triggerSources: ['ACM', 'GitOps Drift'],
    targetCluster: 'prod-eu-west-02',
    environmentType: 'Prod',
    statusPhase: 'Escalated',
  },
  {
    id: 'plan-003',
    impactScore: 88,
    planSynopsis: 'acs-cve-critical-workload-exposure',
    triggerSources: ['ACS Violation'],
    targetCluster: 'prod-us-west-03',
    environmentType: 'Prod',
    statusPhase: 'Proposed',
  },
  {
    id: 'plan-004',
    impactScore: 82,
    planSynopsis: 'etcd-disk-pressure-quorum-risk',
    triggerSources: ['Prometheus'],
    targetCluster: 'prod-ap-south-01',
    environmentType: 'Prod',
    statusPhase: 'Executing',
  },
  {
    id: 'plan-005',
    impactScore: 79,
    planSynopsis: 'gitops-kustomize-overlay-conflict',
    triggerSources: ['GitOps Drift', 'ACM'],
    targetCluster: 'prod-eu-central-04',
    environmentType: 'Prod',
    statusPhase: 'Proposed',
  },
  {
    id: 'plan-006',
    impactScore: 74,
    planSynopsis: 'pipeline-image-scan-gate-failure',
    triggerSources: ['Pipeline', 'ACS Violation'],
    targetCluster: 'staging-us-east-01',
    environmentType: 'Test',
    statusPhase: 'Failed',
  },
  {
    id: 'plan-007',
    impactScore: 71,
    planSynopsis: 'ingress-controller-ha-disruption',
    triggerSources: ['Prometheus', 'ACM'],
    targetCluster: 'prod-us-east-02',
    environmentType: 'Prod',
    statusPhase: 'Executing',
  },
  {
    id: 'plan-008',
    impactScore: 68,
    planSynopsis: 'acs-compliance-policy-drift',
    triggerSources: ['ACS Violation', 'GitOps Drift'],
    targetCluster: 'prod-ap-northeast-01',
    environmentType: 'Prod',
    statusPhase: 'Proposed',
  },
  {
    id: 'plan-009',
    impactScore: 65,
    planSynopsis: 'acm-cluster-import-timeout',
    triggerSources: ['ACM'],
    targetCluster: 'dev-us-west-04',
    environmentType: 'Test',
    statusPhase: 'Proposed',
  },
  {
    id: 'plan-010',
    impactScore: 61,
    planSynopsis: 'prometheus-scrape-interval-regression',
    triggerSources: ['Prometheus', 'Pipeline'],
    targetCluster: 'sandbox-eu-west-01',
    environmentType: 'Sandbox',
    statusPhase: 'Executing',
  },
  {
    id: 'plan-011',
    impactScore: 57,
    planSynopsis: 'gitops-applicationset-push-conflict',
    triggerSources: ['GitOps Drift'],
    targetCluster: 'prod-ca-central-01',
    environmentType: 'Prod',
    statusPhase: 'Failed',
  },
  {
    id: 'plan-012',
    impactScore: 53,
    planSynopsis: 'pipeline-tekton-taskrun-oom-kill',
    triggerSources: ['Pipeline'],
    targetCluster: 'staging-ap-south-02',
    environmentType: 'Test',
    statusPhase: 'Proposed',
  },
  {
    id: 'plan-013',
    impactScore: 48,
    planSynopsis: 'acs-runtime-policy-violation-burst',
    triggerSources: ['ACS Violation', 'Prometheus'],
    targetCluster: 'prod-us-east-01',
    environmentType: 'Prod',
    statusPhase: 'Escalated',
  },
  {
    id: 'plan-014',
    impactScore: 44,
    planSynopsis: 'acm-observability-addon-crashloop',
    triggerSources: ['ACM', 'Prometheus'],
    targetCluster: 'sandbox-us-west-01',
    environmentType: 'Sandbox',
    statusPhase: 'Executing',
  },
  {
    id: 'plan-015',
    impactScore: 38,
    planSynopsis: 'gitops-repo-webhook-delivery-failure',
    triggerSources: ['GitOps Drift', 'Pipeline'],
    targetCluster: 'dev-eu-west-02',
    environmentType: 'Test',
    statusPhase: 'Proposed',
  },
];

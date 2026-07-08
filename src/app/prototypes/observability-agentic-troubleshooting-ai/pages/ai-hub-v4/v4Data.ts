/**
 * v4.0 — Recommendation Hub mock data.
 *
 * Single source of truth for all v4 components. Zero coupling to v1/v2/v3.
 * Epic: HPUX-1653 · Story: Recommendation Hub inbox UI (inventory, KPI, plans table)
 */

// ─── Domain types ─────────────────────────────────────────────────────────────

export type TriggerSource = 'Prometheus' | 'GitOps Drift' | 'ACS Violation' | 'Pipeline' | 'ACM';
export type EnvironmentType = 'Prod' | 'Test' | 'Sandbox';
export type StatusPhase = 'Proposed' | 'Executing' | 'Failed' | 'Escalated';

// ─── Fleet inventory (Row 1, left card) ──────────────────────────────────────

export interface V4FleetInventoryMetrics {
  clustersAffected: number;
  clustersTotal: number;
  criticalClusters: number;
  degradedClusters: number;
  healthyClusters: number;
}

export const V4_FLEET_INVENTORY: V4FleetInventoryMetrics = {
  clustersAffected: 15,
  clustersTotal: 20,
  criticalClusters: 6,
  degradedClusters: 9,
  healthyClusters: 5,
};

// ─── Plans Overview KPI (Row 1, right card) ───────────────────────────────────

export interface V4PlansOverviewKpi {
  activePlans: number;
  plansInSandbox: number;
  estMttrSaved: string;
}

export const V4_PLANS_KPI: V4PlansOverviewKpi = {
  activePlans: 24,
  plansInSandbox: 23,
  estMttrSaved: '4.5 hrs',
};

// ─── Credits usage (header meter) ────────────────────────────────────────────

export interface V4CreditsUsage {
  used: number;
  total: number;
}

export const V4_CREDITS: V4CreditsUsage = {
  used: 8420,
  total: 12000,
};

// ─── Plan row model ───────────────────────────────────────────────────────────

export interface V4PlanExpandedDetails {
  /** One-sentence AI investigation summary surfaced in the expanded row. */
  investigationSummary: string;
  /** Total correlated signal count for this plan (alerts + violations + drift events). */
  signalCount: number;
  /** ISO-8601-style last signal timestamp label (display string). */
  lastSignalAt: string;
  /** Recommended next action string. */
  recommendedAction: string;
}

export interface V4PlanRow {
  id: string;
  impactScore: number;
  planSynopsis: string;
  triggerSources: TriggerSource[];
  targetCluster: string;
  environmentType: EnvironmentType;
  statusPhase: StatusPhase;
  expandedDetails: V4PlanExpandedDetails;
}

// ─── Plan rows ────────────────────────────────────────────────────────────────

export const V4_PLAN_ROWS: V4PlanRow[] = [
  {
    id: 'plan-001',
    impactScore: 94,
    planSynopsis: 'reconcile-prometheus-targets',
    triggerSources: ['Prometheus'],
    targetCluster: 'prod-us-east-01',
    environmentType: 'Prod',
    statusPhase: 'Executing',
    expandedDetails: {
      investigationSummary:
        'Prometheus scrape targets dropped to 34% capacity after a rolling restart of the monitoring stack; 14 critical alert rules are silenced as a result.',
      signalCount: 42,
      lastSignalAt: 'Today at 11:04 UTC',
      recommendedAction: 'Apply target re-registration patch and force a scrape cycle restart.',
    },
  },
  {
    id: 'plan-002',
    impactScore: 91,
    planSynopsis: 'acm-placement-rule-divergence',
    triggerSources: ['ACM', 'GitOps Drift'],
    targetCluster: 'prod-eu-west-02',
    environmentType: 'Prod',
    statusPhase: 'Escalated',
    expandedDetails: {
      investigationSummary:
        'ACM placement rules conflict with 3 GitOps-managed ApplicationSet targets, causing workloads to be unscheduled on 2 production clusters.',
      signalCount: 31,
      lastSignalAt: 'Today at 10:47 UTC',
      recommendedAction:
        'Reconcile ACM PlacementRule spec with the Argo CD ApplicationSet generator to restore scheduling.',
    },
  },
  {
    id: 'plan-003',
    impactScore: 88,
    planSynopsis: 'acs-cve-critical-workload-exposure',
    triggerSources: ['ACS Violation'],
    targetCluster: 'prod-us-west-03',
    environmentType: 'Prod',
    statusPhase: 'Proposed',
    expandedDetails: {
      investigationSummary:
        'ACS detected CVE-2024-21626 (runc critical) across 8 workloads. No exploit observed yet but exposure window is open.',
      signalCount: 18,
      lastSignalAt: 'Today at 09:33 UTC',
      recommendedAction: 'Patch container runtime to runc 1.1.12 and rotate affected pod specs.',
    },
  },
  {
    id: 'plan-004',
    impactScore: 82,
    planSynopsis: 'etcd-disk-pressure-quorum-risk',
    triggerSources: ['Prometheus'],
    targetCluster: 'prod-ap-south-01',
    environmentType: 'Prod',
    statusPhase: 'Executing',
    expandedDetails: {
      investigationSummary:
        'etcd member prod-ap-south-01/etcd-2 disk utilisation hit 91%. At current write rate quorum loss is projected in ~4 hours.',
      signalCount: 26,
      lastSignalAt: 'Today at 08:55 UTC',
      recommendedAction:
        'Compact and defrag etcd, then expand the PVC from 50 Gi to 100 Gi on all three members.',
    },
  },
  {
    id: 'plan-005',
    impactScore: 79,
    planSynopsis: 'gitops-kustomize-overlay-conflict',
    triggerSources: ['GitOps Drift', 'ACM'],
    targetCluster: 'prod-eu-central-04',
    environmentType: 'Prod',
    statusPhase: 'Proposed',
    expandedDetails: {
      investigationSummary:
        'Kustomize overlays for the payments namespace conflict between the hub and spoke cluster configurations, causing continuous sync failures.',
      signalCount: 14,
      lastSignalAt: 'Today at 08:12 UTC',
      recommendedAction: 'Merge conflicting base patches and re-trigger a hard ApplicationSet sync.',
    },
  },
  {
    id: 'plan-006',
    impactScore: 74,
    planSynopsis: 'pipeline-image-scan-gate-failure',
    triggerSources: ['Pipeline', 'ACS Violation'],
    targetCluster: 'staging-us-east-01',
    environmentType: 'Test',
    statusPhase: 'Failed',
    expandedDetails: {
      investigationSummary:
        'Tekton pipeline image-scan-gate task timed out after 15 min; ACS image integration token expired, blocking 6 pending PRs.',
      signalCount: 9,
      lastSignalAt: 'Yesterday at 23:48 UTC',
      recommendedAction: 'Rotate the ACS API integration token and re-run the failed pipeline runs.',
    },
  },
  {
    id: 'plan-007',
    impactScore: 71,
    planSynopsis: 'ingress-controller-ha-disruption',
    triggerSources: ['Prometheus', 'ACM'],
    targetCluster: 'prod-us-east-02',
    environmentType: 'Prod',
    statusPhase: 'Executing',
    expandedDetails: {
      investigationSummary:
        'HAProxy ingress controller lost quorum after a node drain; one of three replicas is in CrashLoopBackOff, increasing p99 latency by 340ms.',
      signalCount: 22,
      lastSignalAt: 'Today at 07:39 UTC',
      recommendedAction: 'Force-delete the stuck pod and verify PodDisruptionBudget allows recovery.',
    },
  },
  {
    id: 'plan-008',
    impactScore: 68,
    planSynopsis: 'acs-compliance-policy-drift',
    triggerSources: ['ACS Violation', 'GitOps Drift'],
    targetCluster: 'prod-ap-northeast-01',
    environmentType: 'Prod',
    statusPhase: 'Proposed',
    expandedDetails: {
      investigationSummary:
        '12 ACS compliance policies drifted from their GitOps-defined baseline after a manual hotfix was applied directly to the cluster.',
      signalCount: 16,
      lastSignalAt: 'Today at 06:15 UTC',
      recommendedAction:
        'Revert the manual change via GitOps and enforce admission webhook to block future out-of-band edits.',
    },
  },
  {
    id: 'plan-009',
    impactScore: 65,
    planSynopsis: 'acm-cluster-import-timeout',
    triggerSources: ['ACM'],
    targetCluster: 'dev-us-west-04',
    environmentType: 'Test',
    statusPhase: 'Proposed',
    expandedDetails: {
      investigationSummary:
        'ACM hub failed to complete cluster import for dev-us-west-04 after 40 min; klusterlet agent is unreachable due to a misconfigured proxy.',
      signalCount: 7,
      lastSignalAt: 'Yesterday at 17:22 UTC',
      recommendedAction: 'Update the klusterlet proxy env vars and re-trigger the import flow.',
    },
  },
  {
    id: 'plan-010',
    impactScore: 61,
    planSynopsis: 'prometheus-scrape-interval-regression',
    triggerSources: ['Prometheus', 'Pipeline'],
    targetCluster: 'sandbox-eu-west-01',
    environmentType: 'Sandbox',
    statusPhase: 'Executing',
    expandedDetails: {
      investigationSummary:
        'A pipeline config change increased the global scrape interval from 15s to 120s for all sandbox clusters, degrading alert resolution.',
      signalCount: 11,
      lastSignalAt: 'Yesterday at 14:05 UTC',
      recommendedAction: 'Revert the Prometheus Operator scrapeInterval override in the pipeline values file.',
    },
  },
  {
    id: 'plan-011',
    impactScore: 57,
    planSynopsis: 'gitops-applicationset-push-conflict',
    triggerSources: ['GitOps Drift'],
    targetCluster: 'prod-ca-central-01',
    environmentType: 'Prod',
    statusPhase: 'Failed',
    expandedDetails: {
      investigationSummary:
        'An ArgoCD ApplicationSet push (revision r4892) propagated conflicting Kustomize overlays, causing router-to-workload traffic mismatches across 4 fleets.',
      signalCount: 19,
      lastSignalAt: 'Yesterday at 22:51 UTC',
      recommendedAction: 'Revert ArgoCD ApplicationSet to revision r4891 and force a hard sync.',
    },
  },
  {
    id: 'plan-012',
    impactScore: 53,
    planSynopsis: 'pipeline-tekton-taskrun-oom-kill',
    triggerSources: ['Pipeline'],
    targetCluster: 'staging-ap-south-02',
    environmentType: 'Test',
    statusPhase: 'Proposed',
    expandedDetails: {
      investigationSummary:
        'Three Tekton TaskRuns OOM-killed during the integration-test stage; memory limit of 512 Mi is insufficient for the new test matrix.',
      signalCount: 6,
      lastSignalAt: 'Yesterday at 11:30 UTC',
      recommendedAction: 'Increase TaskRun memory limit to 1 Gi and add a resource quota guard.',
    },
  },
  {
    id: 'plan-013',
    impactScore: 48,
    planSynopsis: 'acs-runtime-policy-violation-burst',
    triggerSources: ['ACS Violation', 'Prometheus'],
    targetCluster: 'prod-us-east-01',
    environmentType: 'Prod',
    statusPhase: 'Escalated',
    expandedDetails: {
      investigationSummary:
        'ACS reported a burst of 28 runtime policy violations within 10 minutes, correlated with a Prometheus spike in syscall rate for the user-auth workload.',
      signalCount: 34,
      lastSignalAt: 'Today at 05:44 UTC',
      recommendedAction:
        'Investigate user-auth for supply-chain compromise and isolate the affected pods pending security review.',
    },
  },
  {
    id: 'plan-014',
    impactScore: 44,
    planSynopsis: 'acm-observability-addon-crashloop',
    triggerSources: ['ACM', 'Prometheus'],
    targetCluster: 'sandbox-us-west-01',
    environmentType: 'Sandbox',
    statusPhase: 'Executing',
    expandedDetails: {
      investigationSummary:
        'The ACM observability addon is crash-looping on sandbox-us-west-01; metrics collection for that cluster is dark, masking any alert signal.',
      signalCount: 8,
      lastSignalAt: 'Yesterday at 09:17 UTC',
      recommendedAction: 'Delete and re-create the multicluster-observability-addon ManagedClusterAddOn CR.',
    },
  },
  {
    id: 'plan-015',
    impactScore: 38,
    planSynopsis: 'gitops-repo-webhook-delivery-failure',
    triggerSources: ['GitOps Drift', 'Pipeline'],
    targetCluster: 'dev-eu-west-02',
    environmentType: 'Test',
    statusPhase: 'Proposed',
    expandedDetails: {
      investigationSummary:
        'GitHub webhook deliveries to the ArgoCD server are failing with HTTP 502; the internal LoadBalancer for argocd-server expired its TLS cert 3 days ago.',
      signalCount: 5,
      lastSignalAt: 'Yesterday at 07:02 UTC',
      recommendedAction: 'Renew the argocd-server TLS certificate and restart the server pod.',
    },
  },
];

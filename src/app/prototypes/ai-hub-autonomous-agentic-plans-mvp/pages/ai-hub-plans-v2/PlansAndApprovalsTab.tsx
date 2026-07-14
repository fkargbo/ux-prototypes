import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  ClipboardCopy,
  ClipboardCopyVariant,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  Flex,
  FlexItem,
  Label,
  MenuToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Pagination,
  PaginationVariant,
  Popover,
  SearchInput,
  Skeleton,
  Spinner,
  Stack,
  StackItem,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import { AngleRightIcon, CheckCircleIcon, DownloadIcon, EllipsisVIcon, ExclamationCircleIcon, ExclamationTriangleIcon, HelpIcon, SearchIcon } from '@patternfly/react-icons';
import { AiExperienceIcon } from './AiExperienceIcon';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import type { ReasoningStep } from '../../components/autonomousAiObserve/data';
import type { ConfidenceTier } from '../../types/confidenceTier';
import type { Reversibility } from '../../types/reversibility';
import { formatReversibilityLabel, reversibilityLabelColor } from '../../types/reversibility';
import type { RemediationRisk } from '../../types/riskScore';
import {
  formatTokenBurnPair,
  formatOptionalTokenBurn,
  getPlanTokensConsumedView,
  isPlanTokenBurnAvailable,
} from '../../types/tokenBurn';
import {
  AGENTIC_STATUS_FILTER_OPTIONS,
  PlansFilterToolbar,
  resolveDisplayDomain,
  usePlansFilterState,
} from './PlansFilterToolbar';
import '../../components/autonomousAiObserve/autonomous-ai-observe.css';
import {
  SC_PLAN_ROW_PATCHES,
  SC_PLAN_TABLE_IDENTITY,
  CORE_PLATFORMS_CLUSTER_ID,
  resolvePlanDrawerData,
  applyScRemediationPatches,
} from './singleClusterPlanSimulation';
import {
  NEW_ALERT_INVESTIGATION_DRAWER_DATA,
  NEW_ALERT_INVESTIGATION_PLAN_IDENTITY,
  NEW_ALERT_INVESTIGATION_PLANS,
} from './alertInvestigationPlans';
import { useActivePerspective, type AppShellPerspectiveKey } from '@app/shared/contexts/ActivePerspectiveContext';
import {
  clearPlanRemediationDrillSession,
  perspectiveKeyFromShellName,
  readPlanRemediationDrillSession,
  writePlanRemediationDrillSession,
} from '../planRemediationDrillSession';
import {
  resolveAgentCapabilitiesClusterId,
  useAgenticCapabilities,
} from '../../context/AgenticCapabilitiesContext';
import { useDeletedPlans } from '../../context/DeletedPlansContext';
import { usePlanTermination, type PlanExecutionRuntime } from '../../context/PlanTerminationContext';
import { usePlanWorkflow } from '../../context/PlanWorkflowContext';
import { usePlanBuildRuntime } from '../../hooks/usePlanBuildRuntime';
import type { PlanStatus } from '../../types/planStatus';
import { normalizePlanStatus } from '../../types/planStatus';
import {
  ProposalApprovalArtifact,
  resolveVerificationState,
  VERIFICATION_CHECK_LINES,
  VerificationPanel,
} from './planWorkflowPanels';
import {
  enrichRemediationOptionsWithConfidence,
  getOptionExecutionTokenBurn,
  getPlanTokenBurn,
  GLOBAL_APPROVAL_POLICY_MAX_ATTEMPTS,
  MVP_PLAN_IDS,
  normalizeTriggerDomain,
} from './plansMvpConstants';
import { getPlanDetailHref, resolvePlanDomainAnnotations } from './domainPlanNavigation';
import { downloadAnalysisReportMarkdown, downloadRemediationPlanMarkdown } from '../../utils/downloadRemediationPlan';

// ─── Types ────────────────────────────────────────────────────────────────────

type PlanSeverity = 'critical' | 'warning';

/** Icon semantic used in expandable row consolidated reasons. */
type ReasonIconType = 'sync' | 'alert' | 'warning' | 'gear' | 'ban' | 'wrench' | 'search';

interface ExpandedReason {
  icon: ReasonIconType;
  text: string;
}

export interface PlanRow {
  id: string;
  severity: PlanSeverity;
  status: PlanStatus;
  score: number;
  synopsis: string;
  consolidationScope: string;
  triggerDomain: string;
  expandedReasons: ExpandedReason[];
  /** Infrastructure objects that will be affected by the remediation. Context-aware:
   *  Fleet perspective → cluster names; Single-cluster perspective → namespace/pod/node names. */
  drawerTargets: string[];
  /** ISO-8601 instant when the plan was created. */
  createdAt?: string;
  /** Logical plan resource name (e.g. gitops-domain-drift-remediation). */
  name?: string;
  /** Fleet cluster label for the plans table. */
  cluster?: string;
  /** Core platforms namespace label for the plans table. */
  namespace?: string;
  /** Perspective-aware scope cell (cluster or namespace). */
  scope?: string;
  /** Display timestamp when execution was halted (Plan aborted). */
  terminatedAt?: string;
  /** Investigation-only proposals have analysis but no remediation hub. */
  planKind?: 'remediation' | 'analysis-only';
}

/**
 * @deprecated Numeric scores retained for table sort order only — not displayed in UI.
 */
const PLAN_SORT_SCORES: Record<string, number> = {
  tp1: 88,
  tp2: 76,
  tp3: 32,
  tp4: 64,
  tp5: 41,
  ap1: 32,
  ap2: 55,
  ap3: 48,
  ap4: 52,
  ap5: 88,
  ap6: 36,
  ap7: 64,
  ap8: 58,
  ap9: 44,
  ap10: 39,
  ap11: 53,
  ap12: 74,
  ap13: 61,
  ap14: 47,
  ap15: 33,
  cp1: 68,
  cp2: 12,
  cp4: 72,
  op1: 18,
  op2: 32,
  op3: 55,
  op4: 24,
  op5: 45,
  'inv-alert-node-not-ready': 3,
  'inv-alert-mds-cache-high': 4,
  'inv-alert-vm-cannot-evict': 5,
  'inv-alert-node-cpu-high': 6,
};

/** Simulated plan identity — names, summaries, and scope labels aligned to fleet vs. single-cluster UX. */
const PLAN_TABLE_IDENTITY: Record<
  string,
  { name: string; synopsis: string; fleetCluster: string; namespace: string }
> = {
  tp1: {
    name: 'gitops-apps-prod-drift-resync',
    synopsis: 'Re-sync production application manifests after Argo CD reports LiveState drift',
    fleetCluster: 'prod-east-2 (+3)',
    namespace: 'openshift-gitops',
  },
  tp2: {
    name: 'acs-payments-workload-quarantine',
    synopsis: 'Quarantine payment API workload flagged by ACS for runtime syscall anomalies',
    fleetCluster: 'prod-east-2 (+2)',
    namespace: 'payments-prod',
  },
  tp3: {
    name: 'payments-api-oom-remediation',
    synopsis: 'Raise memory limits and restart payment gateway pods after repeated OOMKills',
    fleetCluster: 'prod-east-2',
    namespace: 'payments-prod',
  },
  tp4: {
    name: 'rook-ceph-pool-expansion',
    synopsis: 'Expand Ceph block pool capacity before persistent volumes exhaust free space',
    fleetCluster: 'prod-east-2 (+1)',
    namespace: 'openshift-storage',
  },
  tp5: {
    name: 'etcd-defrag-api-latency',
    synopsis: 'Defragment etcd and tune API server quotas after control plane latency events',
    fleetCluster: 'prod-east-2',
    namespace: 'openshift-etcd',
  },
  ap1: {
    name: 'analytics-memory-leak-fix',
    synopsis: 'Patch analytics service memory leak surfaced by sustained utilization alerts',
    fleetCluster: 'stg-central',
    namespace: 'app-analytics-dev',
  },
  ap2: {
    name: 'tekton-webhook-unblock',
    synopsis: 'Restore Tekton EventListener webhook after failed PipelineRun deliveries',
    fleetCluster: 'prod-east-2 (+1)',
    namespace: 'openshift-pipelines',
  },
  ap3: {
    name: 'oauth-client-token-rotation',
    synopsis: 'Rotate expiring OAuth client credentials for cluster authentication stack',
    fleetCluster: 'prod-east-2',
    namespace: 'openshift-authentication',
  },
  ap4: {
    name: 'coredns-latency-investigation',
    synopsis: 'Investigate CoreDNS lookup latency spikes affecting internal service discovery',
    fleetCluster: 'prod-east-2 (+2)',
    namespace: 'openshift-dns',
  },
  ap5: {
    name: 'baremetal-node-scheduling-fix',
    synopsis: 'Rebalance Metal3 bare-metal nodes after CPU overcommit scheduling failures',
    fleetCluster: 'edge-apac-1',
    namespace: 'openshift-machine-api',
  },
  ap6: {
    name: 'staging-gitops-drift-resync',
    synopsis: 'Reconcile staging namespace manifests out of sync with GitOps source of truth',
    fleetCluster: 'stg-central',
    namespace: 'app-staging',
  },
  ap7: {
    name: 'ingress-router-scale-out',
    synopsis: 'Scale default ingress controller replicas below minimum availability threshold',
    fleetCluster: 'prod-east-2 (+1)',
    namespace: 'openshift-ingress',
  },
  ap8: {
    name: 'acs-hostnetwork-policy-fix',
    synopsis: 'Remediate ACS compliance violation for hostNetwork workloads in retail namespace',
    fleetCluster: 'prod-east-2',
    namespace: 'retail-prod',
  },
  ap9: {
    name: 'kubelet-stale-pod-cleanup',
    synopsis: 'Clear stale pod sandboxes after repeated Kubelet garbage collection failures',
    fleetCluster: 'prod-eu-west-1 (+1)',
    namespace: 'logistics-prod',
  },
  ap10: {
    name: 'jenkins-queue-drain',
    synopsis: 'Drain Jenkins build queue backlog blocking release pipeline throughput',
    fleetCluster: 'prod-east-2',
    namespace: 'ci-cd',
  },
  ap11: {
    name: 'hpa-metrics-scaler-fix',
    synopsis: 'Repair HorizontalPodAutoscaler unable to read custom metrics API',
    fleetCluster: 'prod-east-2',
    namespace: 'api-services',
  },
  ap12: {
    name: 'image-registry-pull-repair',
    synopsis: 'Resolve integrated registry pull failures blocking workload rollouts fleet-wide',
    fleetCluster: 'prod-east-2 (+3)',
    namespace: 'openshift-image-registry',
  },
  ap13: {
    name: 'postgres-iops-throttle-tune',
    synopsis: 'Tune PostgreSQL PVC I/O throttling after datastore latency warnings',
    fleetCluster: 'prod-east-2',
    namespace: 'data-services',
  },
  ap14: {
    name: 'chrony-clock-skew-fix',
    synopsis: 'Correct node clock skew detected across worker nodes in production fleet',
    fleetCluster: 'prod-east-2 (+2)',
    namespace: 'openshift-node',
  },
  ap15: {
    name: 'imagestream-tag-prune',
    synopsis: 'Prune obsolete ImageStream tags bloating internal registry storage',
    fleetCluster: 'prod-east-2',
    namespace: 'openshift-image-registry',
  },
  cp1: {
    name: 'ocp-upgrade-4.14-to-4.15',
    synopsis: 'Upgrade OpenShift 4.14 to 4.15 before channel end of life',
    fleetCluster: 'prod-east-2',
    namespace: 'openshift-update',
  },
  cp2: {
    name: 'ocp-patch-4.15.1-to-4.15.8',
    synopsis: 'Apply z-stream patch 4.15.1 to 4.15.8 for critical CVE remediation',
    fleetCluster: 'prod-east-2',
    namespace: 'openshift-update',
  },
  cp4: {
    name: 'cluster-update-readiness-report',
    synopsis: 'Autonomous cluster health data gathering for update readiness assessment',
    fleetCluster: 'prod-east-2',
    namespace: 'openshift-update',
  },
  op1: {
    name: 'reconcile-prometheus-targets',
    synopsis: 'Reconcile Prometheus scrape targets after endpoint failures in openshift-monitoring',
    fleetCluster: 'prod-east-2',
    namespace: 'openshift-monitoring',
  },
  op2: {
    name: 'fix-alertmanager-webhook-secret',
    synopsis: 'Rotate Alertmanager PagerDuty webhook credentials after delivery failures',
    fleetCluster: 'prod-east-2',
    namespace: 'openshift-monitoring',
  },
  op3: {
    name: 'recover-thanos-compactor-pv',
    synopsis: 'Recover Thanos compactor persistent volume after corrupted block detection',
    fleetCluster: 'prod-east-2',
    namespace: 'openshift-monitoring',
  },
  op4: {
    name: 'scale-otel-collector-replicas',
    synopsis: 'Scale OpenTelemetry collector replicas to relieve trace ingestion backpressure',
    fleetCluster: 'prod-east-2',
    namespace: 'openshift-opentelemetry-operator',
  },
  op5: {
    name: 'clear-perses-storage-lock',
    synopsis: 'Clear Perses dashboard storage lock causing write timeouts on shared persistent volume',
    fleetCluster: 'prod-east-2',
    namespace: 'openshift-monitoring',
  },
  'certmgr-renewal-pending': {
    name: 'certmgr-tls-renewal-pending',
    synopsis: 'Certificate renewal queued for expiring ingress TLS — awaiting agent assignment',
    fleetCluster: 'prod-east-2',
    namespace: 'cert-manager',
  },
  'acs-netpol-remediation-denied': {
    name: 'acs-netpol-remediation-denied',
    synopsis: 'ACS network policy remediation proposal denied by cluster administrator',
    fleetCluster: 'prod-east-2',
    namespace: 'retail-prod',
  },
  'quota-exhaustion-escalating': {
    name: 'quota-exhaustion-escalating',
    synopsis: 'Namespace resource quota exhaustion escalating to human operator after automated remediation failed',
    fleetCluster: 'prod-east-2',
    namespace: 'openshift-ingress',
  },
  'ingress-controller-escalated': {
    name: 'ingress-controller-scale-escalated',
    synopsis: 'Ingress controller minimum replica scale-out escalated after execution retry limit reached',
    fleetCluster: 'prod-east-2',
    namespace: 'openshift-ingress',
  },
  'prometheus-wal-emergency-stopped': {
    name: 'prometheus-wal-repair-emergency-stopped',
    synopsis: 'Prometheus write-ahead log repair halted by emergency stop during active write window',
    fleetCluster: 'prod-east-2',
    namespace: 'openshift-monitoring',
  },
  'etcd-defrag-failed': {
    name: 'etcd-defrag-compaction',
    synopsis: 'Compact and defragment etcd database to reduce fragmentation ratio below 0.5 threshold',
    fleetCluster: 'prod-east-2',
    namespace: 'openshift-etcd',
  },
  ...NEW_ALERT_INVESTIGATION_PLAN_IDENTITY,
};

type RawPlanRow = Omit<PlanRow, 'status'> & { status: string };

// ─── Dataset — Top plans (score ≥ 80) ────────────────────────────────────────

const TOP_PLANS: RawPlanRow[] = [
  {
    id: 'tp1',
    severity: 'critical',
    status: 'Waiting Approval',
    score: 94,
    synopsis: 'Re-sync GitOps Domain Drift',
    consolidationScope: '1 Drift / 4 Alerts',
    triggerDomain: 'GitOps',
    drawerTargets: ['prod-east-2', 'prod-eu-west-1', 'stg-central', 'edge-apac-1'],
    expandedReasons: [
      { icon: 'sync',  text: 'ArgoCD Controller Event: 1 LiveStateOutOfSync event detected.' },
      { icon: 'alert', text: 'Prometheus Alert: 4 IngressControllerDegraded active alerts running.' },
    ],
  },
  {
    id: 'tp2',
    severity: 'critical',
    status: 'Analyzing',
    score: 89,
    synopsis: 'Quarantine Container Security Exploit',
    consolidationScope: '14 Runtime Events',
    triggerDomain: 'Security',
    drawerTargets: ['prod-east-2', 'prod-eu-west-1', 'edge-apac-1'],
    expandedReasons: [
      { icon: 'warning', text: 'Advanced Cluster Security Hook: 14 eBPF Kernel System Call Mutations detected.' },
    ],
  },
  {
    id: 'tp3',
    severity: 'critical',
    status: 'Remediating',
    score: 85,
    synopsis: 'Resolve Cascade Pod OOMKills',
    consolidationScope: '6 Events / 2 Alerts',
    triggerDomain: 'Compute',
    drawerTargets: ['prod-east-2'],
    expandedReasons: [
      { icon: 'ban',   text: 'Kubelet Eviction Event: 6 Core Container OOMKilled signals.' },
      { icon: 'alert', text: 'Prometheus Alert: 2 KubePodCrashLooping alarms.' },
    ],
  },
  {
    id: 'tp4',
    severity: 'critical',
    status: 'Waiting Approval',
    score: 82,
    synopsis: 'Remediate Rook-Ceph Storage Depletion',
    consolidationScope: '8 Alerts',
    triggerDomain: 'Storage',
    drawerTargets: ['prod-east-2', 'prod-eu-west-1'],
    expandedReasons: [
      { icon: 'alert', text: 'Prometheus Alert: 3 CephPoolNearFull warnings.' },
      { icon: 'alert', text: 'Prometheus Alert: 5 KubePersistentVolumeFillingUp alarms.' },
    ],
  },
  {
    id: 'tp5',
    severity: 'critical',
    status: 'Completed',
    score: 80,
    synopsis: 'Optimize Control Plane API Latency',
    consolidationScope: '2 API Events',
    triggerDomain: 'Cluster update',
    drawerTargets: ['prod-east-2'],
    expandedReasons: [
      { icon: 'gear', text: 'K8s API Server Log Hook: 2 etcd_db_total_size_in_bytes fragmentation events.' },
    ],
  },
  {
    id: 'cp1',
    severity: 'critical',
    status: 'Proposed',
    score: 86,
    synopsis: 'Upgrade OpenShift 4.14 to 4.15 before channel end of life',
    consolidationScope: 'Cluster is EOL or behind upgrade channel',
    triggerDomain: 'Cluster update',
    drawerTargets: ['prod-east-2'],
    expandedReasons: [
      { icon: 'warning', text: 'ClusterVersion: Channel fast-4.14 reports EndOfLife — no further z-stream releases.' },
      { icon: 'gear', text: 'Upgradeable: False — cluster minor version behind supported release window.' },
    ],
  },
];

// ─── Dataset — All plans (score < 80) ────────────────────────────────────────

const ALL_PLANS: RawPlanRow[] = [
  {
    id: 'cp2',
    severity: 'warning',
    status: 'Completed',
    score: 78,
    synopsis: 'Apply z-stream patch 4.15.1 to 4.15.8 for critical CVE remediation',
    consolidationScope: 'Critical z-stream platform CVE remediation available',
    triggerDomain: 'Cluster update',
    drawerTargets: ['prod-east-2'],
    expandedReasons: [
      { icon: 'alert', text: 'OpenShift Advisory: RHSA-2026-1842 — critical platform CVE patched in 4.15.8.' },
      { icon: 'gear', text: 'ClusterVersion: Recommended patch 4.15.8 available from 4.15.1.' },
    ],
  },
  {
    id: 'cp4',
    severity: 'warning',
    status: 'Proposed',
    score: 72,
    synopsis: 'Autonomous cluster health data gathering for update readiness assessment',
    consolidationScope: 'Investigation-only · no remediation options',
    triggerDomain: 'Cluster update',
    drawerTargets: ['prod-east-2'],
    expandedReasons: [
      { icon: 'gear', text: 'ClusterVersion operator: autonomous readiness probe requested by update controller.' },
      { icon: 'search', text: 'Analysis complete — structured health report available for operator review.' },
    ],
  },
  {
    id: 'ap1',
    severity: 'critical',
    status: 'Waiting Approval',
    score: 78,
    synopsis: 'Fix Minor App Memory Leak',
    consolidationScope: '3 Alerts',
    triggerDomain: 'Observability',
    drawerTargets: ['stg-central'],
    expandedReasons: [
      { icon: 'alert', text: '3 KubePodMemoryUtilizationHigh alarms active on dev pods.' },
    ],
  },
  {
    id: 'ap2',
    severity: 'warning',
    status: 'Plan aborted',
    terminatedAt: 'Jun 9, 2026, 2:48 PM',
    score: 75,
    synopsis: 'Repair Dev CI/CD Webhook Block',
    consolidationScope: '1 Failure / 2 Alerts',
    triggerDomain: 'Pipelines',
    drawerTargets: ['prod-east-2', 'stg-central'],
    expandedReasons: [
      { icon: 'wrench', text: 'Tekton Event: 1 PipelineRunFailed block.' },
      { icon: 'alert',  text: 'Prometheus Alert: 2 TektonTaskExecutionStalled warnings.' },
    ],
  },
  {
    id: 'ap3',
    severity: 'warning',
    status: 'Waiting Approval',
    score: 71,
    synopsis: 'Rotate Expiring IAM Client Tokens',
    consolidationScope: '1 Auth Event',
    triggerDomain: 'Security',
    drawerTargets: ['prod-east-2'],
    expandedReasons: [
      { icon: 'warning', text: 'Kube-Apt-Controller Event: 1 CertificateExpirationWarning registered.' },
    ],
  },
  {
    id: 'ap4',
    severity: 'warning',
    status: 'Investigating',
    score: 68,
    synopsis: 'Investigate Core DNS Latency Spikes',
    consolidationScope: '4 Alerts',
    triggerDomain: 'Network',
    drawerTargets: ['prod-east-2', 'prod-eu-west-1', 'edge-apac-1'],
    expandedReasons: [
      { icon: 'alert', text: '4 CoreDNSLookupLatencyHigh warnings logged.' },
    ],
  },
  {
    id: 'ap5',
    severity: 'warning',
    status: 'Failed',
    score: 65,
    synopsis: 'Rebalance BareMetal Node Scheduling',
    consolidationScope: '2 Events / 1 Alert',
    triggerDomain: 'Compute',
    drawerTargets: ['edge-apac-1'],
    expandedReasons: [
      { icon: 'gear',  text: '2 NodeCPUOvercommitted events detected.' },
      { icon: 'alert', text: '1 KubeNodeNotReady alert active.' },
    ],
  },
  {
    id: 'ap6',
    severity: 'warning',
    status: 'Completed',
    score: 62,
    synopsis: 'Re-sync Staging Namespace Drift',
    consolidationScope: '1 Drift Event',
    triggerDomain: 'GitOps',
    drawerTargets: ['stg-central'],
    expandedReasons: [
      { icon: 'sync', text: 'ArgoCD Event: 1 LiveStateOutOfSync event flagged in staging.' },
    ],
  },
  {
    id: 'ap7',
    severity: 'critical',
    status: 'Waiting Approval',
    score: 59,
    synopsis: 'Fix Inactive Ingress Router Replicas',
    consolidationScope: '2 Alerts',
    triggerDomain: 'Network',
    drawerTargets: ['prod-east-2', 'prod-eu-west-1'],
    expandedReasons: [
      { icon: 'alert', text: '2 IngressControllerMinReplicasNotMet rules active.' },
    ],
  },
  {
    id: 'ap8',
    severity: 'warning',
    status: 'Proposed',
    score: 55,
    synopsis: 'Mitigate ACS Compliance Violation',
    consolidationScope: '1 Security Event / 3 Alerts',
    triggerDomain: 'Security',
    drawerTargets: ['prod-east-2'],
    expandedReasons: [
      { icon: 'warning', text: '1 ACS Host Network sharing violation detected.' },
      { icon: 'alert',   text: '3 matching low-priority alerts active.' },
    ],
  },
  {
    id: 'ap9',
    severity: 'warning',
    status: 'Waiting Approval',
    score: 52,
    synopsis: 'Clear Stale Pod Garbage Collection',
    consolidationScope: '4 Pod Events',
    triggerDomain: 'Compute',
    drawerTargets: ['prod-eu-west-1', 'prod-us-west-2'],
    expandedReasons: [
      { icon: 'ban', text: '4 PodSandboxCleanedUpFailed core Kubelet log entries.' },
    ],
  },
  {
    id: 'ap10',
    severity: 'warning',
    status: 'Completed',
    score: 49,
    synopsis: 'Resolve High Jenkins Queue Depth',
    consolidationScope: '1 Alert',
    triggerDomain: 'Pipelines',
    drawerTargets: ['prod-east-2'],
    expandedReasons: [
      { icon: 'alert', text: '1 JenkinsQueueSizeHigh metric threshold crossed.' },
    ],
  },
  {
    id: 'ap11',
    severity: 'warning',
    status: 'Waiting Approval',
    score: 46,
    synopsis: 'Remediate HorizontalPodAutoscaler Limits',
    consolidationScope: '1 HPA Event',
    triggerDomain: 'Compute',
    drawerTargets: ['prod-east-2'],
    expandedReasons: [
      { icon: 'warning', text: 'HPA Controller Hook: 1 FailedComputeMetricsReplicas event.' },
    ],
  },
  {
    id: 'ap12',
    severity: 'critical',
    status: 'Waiting Approval',
    score: 42,
    synopsis: 'Fix Container Registry Pull Failures',
    consolidationScope: '5 Alerts',
    triggerDomain: 'Registry',
    drawerTargets: ['prod-east-2', 'prod-eu-west-1', 'edge-apac-1', 'stg-central'],
    expandedReasons: [
      { icon: 'alert', text: '5 ErrImagePullBackOff sustained threshold alerts.' },
    ],
  },
  {
    id: 'ap13',
    severity: 'warning',
    status: 'Investigating',
    score: 38,
    synopsis: 'Tune Database Read IOPS Throttle',
    consolidationScope: '1 Event / 2 Alerts',
    triggerDomain: 'Storage',
    drawerTargets: ['prod-east-2'],
    expandedReasons: [
      { icon: 'gear',  text: '1 Storage CSI volume throttling log entry.' },
      { icon: 'alert', text: '2 KubePersistentVolumeResizingStalled warnings.' },
    ],
  },
  {
    id: 'ap14',
    severity: 'warning',
    status: 'Completed',
    score: 35,
    synopsis: 'Address NTP Time Desynchronization',
    consolidationScope: '3 Alerts',
    triggerDomain: 'Compute',
    drawerTargets: ['prod-east-2', 'prod-eu-west-1', 'stg-central'],
    expandedReasons: [
      { icon: 'alert', text: '3 NodeClockSkewDetected Prometheus system metrics warnings.' },
    ],
  },
  {
    id: 'ap15',
    severity: 'warning',
    status: 'Waiting Approval',
    score: 30,
    synopsis: 'Clean Obsolete Image Stream Tags',
    consolidationScope: '1 Registry Event',
    triggerDomain: 'Registry',
    drawerTargets: ['prod-east-2'],
    expandedReasons: [
      { icon: 'warning', text: 'ImageRegistry Controller Hook: 1 PruneImageRegistryManifestsFailed trace.' },
    ],
  },
  {
    id: 'op1',
    severity: 'warning',
    status: 'Completed',
    score: 72,
    synopsis: 'Reconcile Prometheus Targets',
    consolidationScope: 'Triggered by alert: PrometheusTargetDown (Endpoint scrape failures detected in openshift-monitoring)',
    triggerDomain: 'Prometheus',
    drawerTargets: ['prometheus-k8s', 'prometheus-operator'],
    expandedReasons: [
      { icon: 'alert', text: 'PrometheusTargetDown: endpoint scrape failures detected in openshift-monitoring.' },
    ],
  },
  {
    id: 'op2',
    severity: 'critical',
    status: 'Proposed',
    score: 76,
    synopsis: 'Fix Alertmanager Webhook Secret',
    consolidationScope: 'Triggered by alert: AlertmanagerDeliveryFailing (Expired integration tokens for PagerDuty receiver)',
    triggerDomain: 'Alertmanager',
    drawerTargets: ['alertmanager-main'],
    expandedReasons: [
      { icon: 'alert', text: 'AlertmanagerDeliveryFailing: expired integration tokens for PagerDuty receiver.' },
    ],
  },
  {
    id: 'op3',
    severity: 'critical',
    status: 'Executing',
    score: 68,
    synopsis: 'Recover Thanos Compactor PV',
    consolidationScope: 'Triggered by alert: ThanosCompactorHasNotRun (Thanos compactor pod stuck on corrupted block; manually terminated by admin)',
    triggerDomain: 'Thanos',
    drawerTargets: ['thanos-compactor'],
    expandedReasons: [
      { icon: 'alert', text: 'ThanosCompactorHasNotRun: compactor pod stuck on corrupted block.' },
    ],
  },
  {
    id: 'op4',
    severity: 'warning',
    status: 'Verifying',
    score: 70,
    synopsis: 'Scale OTel Collector Replicas',
    consolidationScope: 'Triggered by alert: OpenTelemetryCollectorBufferFull (Spike in cluster trace volume causing memory saturation)',
    triggerDomain: 'OpenTelemetry',
    drawerTargets: ['otel-collector'],
    expandedReasons: [
      { icon: 'alert', text: 'OpenTelemetryCollectorBufferFull: trace volume spike causing memory saturation.' },
    ],
  },
  {
    id: 'op5',
    severity: 'warning',
    status: 'Proposed',
    score: 74,
    synopsis: 'Clear Perses Storage Lock',
    consolidationScope: 'Triggered by alert: PersesDashboardStorageLocked (Database write timeouts on shared persistent volume)',
    triggerDomain: 'Perses',
    drawerTargets: ['perses'],
    expandedReasons: [
      { icon: 'alert', text: 'PersesDashboardStorageLocked: database write timeouts on shared persistent volume.' },
    ],
  },
  // ─── New backend phase plans (Pending, Denied, Escalating, Escalated, EmergencyStopped) ───
  {
    id: 'certmgr-renewal-pending',
    severity: 'warning',
    status: 'Pending',
    score: 45,
    synopsis: 'Certificate Renewal Pending',
    consolidationScope: '1 Certificate Event',
    triggerDomain: 'Security',
    drawerTargets: ['prod-east-2'],
    expandedReasons: [
      { icon: 'warning', text: 'cert-manager: TLS certificate for ingress-tls expiring in 6 days — renewal not yet initiated.' },
    ],
  },
  {
    id: 'acs-netpol-remediation-denied',
    severity: 'warning',
    status: 'Denied',
    score: 62,
    synopsis: 'Deny ACS Network Policy Remediation',
    consolidationScope: '1 Compliance Violation',
    triggerDomain: 'Security',
    drawerTargets: ['prod-east-2'],
    expandedReasons: [
      { icon: 'ban', text: 'ACS: NetworkPolicy violation on hostNetwork workloads — remediation denied by cluster administrator.' },
    ],
  },
  {
    id: 'quota-exhaustion-escalating',
    severity: 'critical',
    status: 'Escalating',
    score: 70,
    synopsis: 'Escalate Namespace Quota Exhaustion',
    consolidationScope: '3 Quota Events',
    triggerDomain: 'Cluster update',
    drawerTargets: ['prod-east-2'],
    expandedReasons: [
      { icon: 'warning', text: 'ResourceQuota: 3 namespace quota limits exceeded — automated remediation failed after max retries.' },
    ],
  },
  {
    id: 'ingress-controller-escalated',
    severity: 'critical',
    status: 'Escalated',
    score: 77,
    synopsis: 'Escalated Ingress Controller Failure',
    consolidationScope: '2 Alerts / 1 Escalation',
    triggerDomain: 'Alertmanager',
    drawerTargets: ['prod-east-2'],
    expandedReasons: [
      { icon: 'alert', text: 'IngressControllerMinReplicasNotMet: automated scale-out failed after 2 execution attempts.' },
      { icon: 'ban', text: 'Escalation triggered: MaxRetriesExhausted — requires manual operator intervention.' },
    ],
  },
  {
    id: 'prometheus-wal-emergency-stopped',
    severity: 'critical',
    status: 'EmergencyStopped',
    score: 68,
    synopsis: 'Emergency Stop: Prometheus WAL Repair',
    consolidationScope: '1 Emergency Override',
    triggerDomain: 'Prometheus',
    drawerTargets: ['prometheus-k8s-0'],
    expandedReasons: [
      { icon: 'ban', text: 'EmergencyStopped: Prometheus WAL repair halted by operator — risk of data loss during active write window.' },
    ],
  },
  {
    id: 'etcd-defrag-failed',
    severity: 'critical',
    status: 'Failed',
    score: 63,
    synopsis: 'Compact and Defragment Etcd Database',
    consolidationScope: '1 Alert',
    triggerDomain: 'Cluster update',
    drawerTargets: ['prod-east-2'],
    expandedReasons: [
      { icon: 'alert', text: 'EtcdDatabaseHighFragmentationRatio: fragmentation ratio 0.67 exceeded 0.5 threshold across 3 control plane nodes.' },
      { icon: 'ban', text: 'Verification failure: fragmentation metric unchanged after defrag execution.' },
    ],
  },
  ...NEW_ALERT_INVESTIGATION_PLANS.map((plan) => ({
    ...plan,
    drawerTargets: ['prod-east-2'],
  })),
];

// ─── Dataset — Single-cluster overrides (Core Platforms perspective) ──────────
// Same plan IDs, statuses, scores, and reasons as fleet datasets.
// Only drawerTargets are localized to reflect
// sub-cluster topology (namespaces, pods, nodes) instead of multi-cluster scope.

const SC_TOP_PLANS: RawPlanRow[] = [
  { ...TOP_PLANS[0],drawerTargets: ['payments-prod', 'retail-prod', 'logistics-prod'] },
  { ...TOP_PLANS[1],drawerTargets: ['payment-api', 'payment-worker'] },
  { ...TOP_PLANS[2],drawerTargets: ['payment-api-7d4f8', 'payment-api-7d4f8-2', 'payment-worker-9c2a1', 'payment-worker-9c2a1-2'] },
  { ...TOP_PLANS[3],drawerTargets: ['ocs-storagecluster-ceph-rbd'] },
  { ...TOP_PLANS[4],drawerTargets: ['etcd-master-01', 'etcd-master-02', 'etcd-master-03'] },
  { ...TOP_PLANS[5],drawerTargets: ['version', 'cluster'] },
];

const SC_ALL_PLANS: RawPlanRow[] = [
  { ...ALL_PLANS[0],drawerTargets: ['version', 'cluster'] },
  { ...ALL_PLANS[1],drawerTargets: ['version', 'cluster'] },
  { ...ALL_PLANS[2],drawerTargets: ['version', 'cluster'] },
  { ...ALL_PLANS[3],drawerTargets: ['analytics-api', 'analytics-worker'] },
  { ...ALL_PLANS[4],drawerTargets: ['build-webhook-listener'] },
  { ...ALL_PLANS[5],drawerTargets: ['oauth-openshift'] },
  { ...ALL_PLANS[6],drawerTargets: ['dns-default-7f8c9', 'dns-default-7f8c9-2', 'dns-default-7f8c9-3', 'dns-default-7f8c9-4'] },
  { ...ALL_PLANS[7],drawerTargets: ['worker-bm-03', 'worker-bm-04'] },
  { ...ALL_PLANS[8],drawerTargets: ['staging-api', 'staging-db-config', 'staging-api-svc'] },
  { ...ALL_PLANS[9],drawerTargets: ['router-default-6d4f8', 'router-default-6d4f8-2'] },
  { ...ALL_PLANS[10],drawerTargets: ['retail-checkout'] },
  { ...ALL_PLANS[11],drawerTargets: ['worker-logistics-01'] },
  { ...ALL_PLANS[12],drawerTargets: ['jenkins-0'] },
  { ...ALL_PLANS[13],drawerTargets: ['api-gateway-hpa'] },
  { ...ALL_PLANS[14],drawerTargets: ['ubi9-app', 'ubi9-runtime', 'ubi9-builder'] },
  { ...ALL_PLANS[15],drawerTargets: ['postgres-data-0'] },
  { ...ALL_PLANS[16],drawerTargets: ['worker-01', 'worker-02', 'worker-03', 'master-01', 'master-02', 'master-03'] },
  { ...ALL_PLANS[17],drawerTargets: ['prometheus-k8s-0', 'prometheus-k8s-1'] },
  { ...ALL_PLANS[18],drawerTargets: ['alertmanager-main-0'] },
  { ...ALL_PLANS[19],drawerTargets: ['thanos-compactor-data'] },
  { ...ALL_PLANS[20],drawerTargets: ['otel-collector-7f8c9', 'otel-collector-7f8c9-2', 'otel-collector-7f8c9-3'] },
  { ...ALL_PLANS[21],drawerTargets: ['perses-6d4f8'] },
  { ...ALL_PLANS[22],drawerTargets: ['ingress-tls', 'cert-manager'] },
  { ...ALL_PLANS[23],drawerTargets: ['retail-checkout', 'retail-checkout-svc'] },
  { ...ALL_PLANS[24],drawerTargets: ['router-default-6d4f8'] },
  { ...ALL_PLANS[25],drawerTargets: ['router-default-6d4f8', 'router-default-7f8c9'] },
  { ...ALL_PLANS[26],drawerTargets: ['prometheus-k8s-0'] },
  { ...ALL_PLANS[27],drawerTargets: ['etcd-master-01', 'etcd-master-02', 'etcd-master-03'] },
  ...NEW_ALERT_INVESTIGATION_PLANS,
];

interface PlanDrawerData {
  steps: ReasoningStep[];
  aggregatedFinding: string;
  rootCauseNarrative: string;
  remediationProposal: string;
  riskAssessment: string;
  estimatedRecovery: string;
  confidence: ConfidenceTier;
}

const PLAN_DRAWER_DATA: Record<string, PlanDrawerData> = {
  // ── Top plans ──────────────────────────────────────────────────────────────
  tp1: {
    steps: [
      { id: 's1', time: '10:03:12', status: 'done', icon: 'exclamation', title: 'Detected ArgoCD LiveStateOutOfSync event', detail: '4 IngressControllerDegraded alerts firing fleet-wide' },
      { id: 's2', time: '10:03:25', status: 'done', icon: 'database',   title: 'Fetched GitOps revision history', detail: 'ApplicationSet r4892 applied 9 minutes before alert onset' },
      { id: 's3', time: '10:03:41', status: 'done', icon: 'network',    title: 'Diffed live vs. declared NetworkPolicy objects', detail: 'Kustomize overlay conflict found across 4 fleet namespaces' },
      { id: 's4', time: '10:03:55', status: 'done', icon: 'search',     title: 'Scored blast radius and causal confidence', detail: '4 fleets affected · High confidence in GitOps root cause' },
    ],
    aggregatedFinding: 'ArgoCD revision r4892 applied a malformed ApplicationSet template that mismatched live cluster state across 4 fleets.',
    rootCauseNarrative: 'A faulty Argo CD ApplicationSet push (revision r4892) propagated conflicting Kustomize overlays, causing router → workload traffic mismatches. The drift was confirmed 3 minutes after the sync event triggered 4 IngressControllerDegraded alerts.',
    remediationProposal: 'Revert ArgoCD ApplicationSet to revision r4891 and force a hard sync across all 4 affected fleets.',
    riskAssessment: 'Low — GitOps rollback is reversible and non-destructive.',
    estimatedRecovery: '~45s',
    confidence: 'High',
  },
  tp2: {
    steps: [
      { id: 's1', time: '09:47:03', status: 'done',    icon: 'exclamation', title: 'ACS flagged 14 eBPF kernel syscall mutations', detail: 'KernelModuleLoad events detected on 3 cluster nodes' },
      { id: 's2', time: '09:47:18', status: 'done',    icon: 'database',    title: 'Pulled container runtime audit logs', detail: 'Activity isolated to image digest sha256:a3f1b9d4…' },
      { id: 's3', time: '09:47:34', status: 'done',    icon: 'network',     title: 'Mapped network egress from affected pods', detail: 'Unexpected outbound connection to 104.21.x.x:443' },
      { id: 's4',                   status: 'active',  icon: 'search',      title: 'Cross-referencing CVE database and Falco ruleset', detail: 'Matching syscall pattern against known exploit signatures…' },
    ],
    aggregatedFinding: 'Signal correlation complete. 14 eBPF kernel mutations detected across 3 clusters. Root cause isolation in progress.',
    rootCauseNarrative: 'Initial signals indicate a compromised container image exploiting kernel syscall interfaces. Full causality graph is being constructed — root cause pending confirmation.',
    remediationProposal: 'Remediation paths pending root cause confirmation.',
    riskAssessment: 'Medium — isolation will require pod eviction, causing brief service disruption.',
    estimatedRecovery: '~3m',
    confidence: 'Medium',
  },
  tp3: {
    steps: [
      { id: 's1', time: '11:22:08', status: 'done',   icon: 'exclamation', title: 'Kubelet reported 6 OOMKilled events', detail: 'payments-api and auth-svc pods evicted across 1 cluster' },
      { id: 's2', time: '11:22:19', status: 'done',   icon: 'database',    title: 'Sampled 1-hour container memory metrics', detail: 'Heap growth 40% above configured limits since v2.1.4 deploy' },
      { id: 's3', time: '11:22:33', status: 'done',   icon: 'search',      title: 'Traced memory growth to allocator regression in v2.1.4', detail: '2 KubePodCrashLooping alarms corroborated at 11:22:28' },
      { id: 's4', time: '11:22:45', status: 'done',   icon: 'search',      title: 'Correlated HPA scale lag with memory limit ceiling', detail: 'Evictions occurring before HPA could provision replacement pods' },
    ],
    aggregatedFinding: '6 OOMKill evictions across payments and auth pods confirmed via Kubelet. Memory quota exhaustion root cause locked.',
    rootCauseNarrative: 'A recent workload rollout increased container memory usage 40% above configured limits. Kubelet is evicting pods before the HPA can scale replacements, amplifying the crash loop cycle.',
    remediationProposal: 'Increase memory limits on affected deployments by 40% and trigger HPA scale-out to 3 replicas.',
    riskAssessment: 'Low — resource limit adjustments are rolling and reversible.',
    estimatedRecovery: '~90s',
    confidence: 'High',
  },
  tp4: {
    steps: [
      { id: 's1', time: '08:11:04', status: 'done',    icon: 'exclamation', title: 'Detected 3 CephPoolNearFull alerts', detail: 'Pool utilization exceeded 80% threshold on 2 production clusters' },
      { id: 's2', time: '08:11:17', status: 'done',    icon: 'database',    title: 'Queried Ceph OSD write-rate and log volume', detail: 'StatefulSet log emission rate 3× above configured ceiling' },
      { id: 's3', time: '08:11:30', status: 'done',    icon: 'search',      title: 'Projected storage exhaustion timeline', detail: 'At current fill rate, pool depletion in ~4 hours' },
      { id: 's4', time: '08:11:42', status: 'done',    icon: 'network',     title: 'Confirmed log rotation absent on 3 StatefulSets', detail: '5 KubePersistentVolumeFillingUp alerts corroborated' },
    ],
    aggregatedFinding: '8 Prometheus alerts confirm Ceph pool utilization exceeds 80% on 2 production clusters.',
    rootCauseNarrative: 'Rook-Ceph pool fill rate has accelerated due to unconfigured log rotation on 3 stateful workloads. At current write velocity, storage exhaustion is projected in ~4 hours.',
    remediationProposal: 'Expand Ceph pool capacity by 20% and enforce log rotation on affected StatefulSets.',
    riskAssessment: 'Medium — storage expansion requires OSD reconfiguration and a brief I/O suspension period.',
    estimatedRecovery: '~2m',
    confidence: 'High',
  },
  tp5: {
    steps: [
      { id: 's1', time: '07:09:11', status: 'done', icon: 'exclamation', title: 'Detected elevated API server P99 latency', detail: '2 etcd_db_total_size_in_bytes fragmentation events triggered' },
      { id: 's2', time: '07:09:22', status: 'done', icon: 'database',    title: 'Queried etcd DB size and compaction history', detail: 'Fragmentation at 68% — last auto-compact skipped during upgrade' },
      { id: 's3', time: '07:09:34', status: 'done', icon: 'search',      title: 'Correlated fragmentation with API write amplification', detail: 'Leader election overhead elevated · P99 latency >1.2s confirmed' },
      { id: 's4', time: '07:09:46', status: 'done', icon: 'search',      title: 'Scored blast radius and causal confidence', detail: 'Fragmentation >65% threshold · High confidence in etcd root cause' },
    ],
    aggregatedFinding: 'etcd database fragmentation (>65%) confirmed as root cause of elevated API server P99 latency.',
    rootCauseNarrative: 'etcd fragmentation exceeded 65% — a known performance threshold — causing API write amplification and increased leader election overhead, driving P99 latency above 1.2s.',
    remediationProposal: 'Execute etcd defragmentation on all 3 control plane members with rolling restart cadence.',
    riskAssessment: 'Low — etcd defragmentation is a supported operational procedure.',
    estimatedRecovery: '~45s',
    confidence: 'High',
  },
  cp1: {
    steps: [
      { id: 's1', time: '14:02:11', status: 'done', icon: 'exclamation', title: 'ClusterVersion channel reports EndOfLife on 4.14', detail: 'Cluster is EOL or behind upgrade channel' },
      { id: 's2', time: '14:02:24', status: 'done', icon: 'database', title: 'Evaluated supported upgrade graph to 4.15', detail: 'Upgradeable=False — minor version outside supported window' },
      { id: 's3', time: '14:02:38', status: 'done', icon: 'search', title: 'Scored control plane blast radius for minor bump', detail: 'Single-cluster scope · High confidence in channel signal' },
    ],
    aggregatedFinding: 'ClusterVersion reports fast-4.14 channel EndOfLife with no further z-stream releases available.',
    rootCauseNarrative: 'The cluster remains on OpenShift 4.14 while the subscribed channel has reached end of life. Without a minor version upgrade to 4.15, the platform cannot receive security or bug-fix releases.',
    remediationProposal: 'Execute supported minor upgrade from OpenShift 4.14 to 4.15 with rolling control plane and worker cordon/drain cadence.',
    riskAssessment: 'High — minor upgrade requires control plane restarts and workload disruption during node rotation.',
    estimatedRecovery: '~45m',
    confidence: 'High',
  },

  // ── All plans ──────────────────────────────────────────────────────────────
  ap1: {
    steps: [
      { id: 's1', time: '13:41:05', status: 'done',    icon: 'exclamation', title: '3 KubePodMemoryUtilizationHigh alarms fired', detail: 'Dev pods sustaining >85% utilization for >10 minutes' },
      { id: 's2', time: '13:41:18', status: 'done',    icon: 'database',    title: 'Profiled heap growth over 3-hour window', detail: 'Memory growing 15 MB/min — consistent with GC pressure leak' },
      { id: 's3', time: '13:41:30', status: 'done',    icon: 'search',      title: 'Attributed leak to v1.8.3 service update', detail: 'Heap profile diff confirms allocator regression in update' },
    ],
    aggregatedFinding: '3 dev pods sustaining >85% memory utilization for >10 minutes, crossing the alert threshold.',
    rootCauseNarrative: 'A memory leak was introduced in a recent service update causing gradual heap growth. Containers are not yet OOMKilled but will exhaust their allocation within ~90 minutes at current growth rate.',
    remediationProposal: 'Apply memory limit patch (2Gi → 4Gi) and redeploy affected pods with the corrected configuration.',
    riskAssessment: 'Low — dev environment, no user-facing impact.',
    estimatedRecovery: '~30s',
    confidence: 'Medium',
  },
  ap2: {
    steps: [
      { id: 's1', time: '10:55:03', status: 'done',   icon: 'exclamation', title: 'PipelineRunFailed block detected on 2 clusters', detail: 'All GitOps-triggered pipeline runs blocked' },
      { id: 's2', time: '10:55:14', status: 'done',   icon: 'database',    title: 'Fetched EventListener admission webhook logs', detail: 'TLS handshake failure — certificate CN mismatch on renewal' },
      { id: 's3', time: '10:55:26', status: 'done',   icon: 'network',     title: 'Validated ACME DNS-01 challenge reachability', detail: 'Issuer reachable · stale TLS secret confirmed as root cause' },
      { id: 's4', time: '10:55:38', status: 'done',   icon: 'search',      title: 'Correlated webhook rejection rate with certificate expiry window', detail: 'Signature validation failures began 18 minutes after secret staleness threshold' },
    ],
    aggregatedFinding: 'Tekton pipeline webhook blocked on 2 clusters due to EventListener TLS certificate failure.',
    rootCauseNarrative: 'A stale TLS certificate on the Tekton Triggers EventListener caused webhook signature validation failures, blocking all GitOps-triggered pipeline runs.',
    remediationProposal: 'Rotate EventListener TLS secret and force webhook endpoint re-registration on both clusters.',
    riskAssessment: 'Low — development pipeline only, no production workload impact.',
    estimatedRecovery: '~1m',
    confidence: 'Medium',
  },
  ap3: {
    steps: [
      { id: 's1', time: '06:30:02', status: 'done',    icon: 'exclamation', title: 'CertificateExpirationWarning flagged by Kube-Apt-Controller', detail: 'IAM client cert expiry in <72 hours' },
      { id: 's2', time: '06:30:14', status: 'done',    icon: 'database',    title: 'Audited cert-manager rotation job history', detail: 'Auto-rotation script failed silently 30 days ago' },
      { id: 's3', time: '06:30:28', status: 'done',    icon: 'search',      title: 'Identified missing IAM role binding as root cause', detail: 'Automation account lost delete-certs permission after RBAC audit' },
    ],
    aggregatedFinding: 'An IAM client certificate expires in <72 hours. Service account authentications will fail upon expiry.',
    rootCauseNarrative: 'The certificate rotation automation script failed silently 30 days ago due to a missing IAM role binding, preventing auto-renewal. The warning only surfaced today as the certificate reached its expiry threshold.',
    remediationProposal: 'Re-bind the IAM automation role and execute emergency certificate rotation.',
    riskAssessment: 'Medium — brief authentication interruption expected during the rotation handoff window.',
    estimatedRecovery: '~2m',
    confidence: 'Medium',
  },
  ap4: {
    steps: [
      { id: 's1', time: '15:14:07', status: 'done',   icon: 'exclamation', title: '4 CoreDNSLookupLatencyHigh warnings detected', detail: 'Average lookup time >200ms across 3 clusters' },
      { id: 's2', time: '15:14:21', status: 'done',   icon: 'database',    title: 'Sampled CoreDNS pod memory and cache metrics', detail: 'Cache hit rate dropped from 91% to 63% over last 15 minutes' },
      { id: 's3',                   status: 'active', icon: 'search',      title: 'Correlating cache thrash with recent Corefile change', detail: 'Diffing CoreDNS Corefile edits from last deployment cycle…' },
    ],
    aggregatedFinding: 'Signal correlation complete. 4 CoreDNS latency alerts detected across 3 clusters. Root cause analysis in progress.',
    rootCauseNarrative: 'Initial signals suggest CoreDNS pod memory pressure is causing resolver cache thrash. Full topology correlation is pending — root cause not yet confirmed.',
    remediationProposal: 'Remediation paths pending root cause confirmation.',
    riskAssessment: 'TBD — root cause under active investigation.',
    estimatedRecovery: 'TBD',
    confidence: 'Medium',
  },
  ap5: {
    steps: [
      { id: 's1', time: '05:58:11', status: 'done',  icon: 'exclamation', title: '2 NodeCPUOvercommitted events and 1 KubeNodeNotReady alert', detail: 'Baremetal node in partially-registered Metal3 state' },
      { id: 's2', time: '05:58:24', status: 'done',  icon: 'database',    title: 'Inspected Metal3 BareMetalHost object status', detail: 'Provisioning phase stuck in "inspecting" — stale kubelet lease' },
      { id: 's3', time: '05:58:37', status: 'done',  icon: 'search',      title: 'Correlated kubelet lease gaps with workload overcommit signals', detail: 'Stale lease timestamps align with CPU overcommit on partially-registered node' },
    ],
    aggregatedFinding: 'CPU overcommitment on a baremetal node detected. Remediation attempt failed during node draining.',
    rootCauseNarrative: 'A Metal3 provisioning anomaly left a baremetal node in a partially-registered state, over-assigning workloads. The remediation script failed during node draining due to a stale kubelet lease.',
    remediationProposal: 'Force-drain node, reset the Metal3 BMH object, and re-provision the node.',
    riskAssessment: 'High — force drain may impact in-flight workloads during the procedure.',
    estimatedRecovery: '~5m',
    confidence: 'Medium',
  },
  ap6: {
    steps: [
      { id: 's1', time: '07:59:03', status: 'done', icon: 'exclamation', title: 'ArgoCD detected LiveStateOutOfSync in staging namespace', detail: 'ConfigMap namespace-config diverged from Git state' },
      { id: 's2', time: '07:59:14', status: 'done', icon: 'database',    title: 'Fetched kubectl apply audit log', detail: 'Direct apply bypass of GitOps workflow by admin at 07:54' },
      { id: 's3', time: '07:59:24', status: 'done', icon: 'search',      title: 'Diffed live vs. declared staging resources', detail: '3 resources diverged · no downstream dependency conflicts detected' },
    ],
    aggregatedFinding: 'ArgoCD detected a single resource drift in the staging namespace configuration.',
    rootCauseNarrative: 'A direct kubectl apply bypassed the GitOps workflow, creating a single resource divergence. Argo CD detected the discrepancy during its 3-minute sync loop and a hard sync restored declared state.',
    remediationProposal: 'Force ArgoCD hard sync on the staging application to restore GitOps-declared state.',
    riskAssessment: 'Low — staging environment, non-destructive sync operation.',
    estimatedRecovery: '~15s',
    confidence: 'High',
  },
  ap7: {
    steps: [
      { id: 's1', time: '12:07:18', status: 'done',    icon: 'exclamation', title: '2 IngressControllerMinReplicasNotMet alerts fired', detail: 'Router replicas: 1 of 3 minimum on 2 clusters' },
      { id: 's2', time: '12:07:29', status: 'done',    icon: 'database',    title: 'Pulled HPA scaling event history', detail: 'HPA attempted scale-out but was blocked' },
      { id: 's3', time: '12:07:43', status: 'done',    icon: 'network',     title: 'Inspected PodDisruptionBudget on openshift-ingress', detail: 'maxUnavailable: 0 prevents any pod movement during scale' },
    ],
    aggregatedFinding: 'Ingress controller replica count dropped below the configured minimum on 2 clusters, degrading load balancing resilience.',
    rootCauseNarrative: 'A node eviction event reduced ingress pod count below the minimum without triggering the HPA correctly. Root cause is a misconfigured PodDisruptionBudget blocking HPA-driven scale-out.',
    remediationProposal: 'Patch the PodDisruptionBudget to allow HPA scale-out and immediately scale ingress routers to the minimum replica count.',
    riskAssessment: 'Low — router pods scale rolling with no traffic interruption.',
    estimatedRecovery: '~1m',
    confidence: 'Medium',
  },
  ap8: {
    steps: [
      { id: 's1', time: '09:23:05', status: 'done',    icon: 'exclamation', title: 'ACS flagged hostNetwork: true on production deployment', detail: 'CIS Level 3 violation · node network namespace exposed' },
      { id: 's2', time: '09:23:18', status: 'done',    icon: 'database',    title: 'Inspected deployment spec and admission audit log', detail: 'Misconfigured hostNetwork added in last rollout by dev team' },
      { id: 's3', time: '09:23:32', status: 'done',    icon: 'search',      title: 'Confirmed no legitimate use case for host networking', detail: '3 low-priority ACS alerts corroborated the posture violation' },
    ],
    aggregatedFinding: 'ACS detected a host network namespace sharing violation — a CIS benchmark Level 3 non-compliance — on 1 cluster.',
    rootCauseNarrative: 'A new deployment was misconfigured with hostNetwork: true, granting the container direct access to the node network stack. ACS enforcement policy flagged this as a critical security posture violation.',
    remediationProposal: 'Set hostNetwork: false on the offending deployment and apply a network policy admission webhook to prevent recurrence.',
    riskAssessment: 'Medium — policy enforcement will trigger pod restarts on the affected deployment.',
    estimatedRecovery: '~1m',
    confidence: 'Medium',
  },
  ap9: {
    steps: [
      { id: 's1', time: '14:44:07', status: 'done',    icon: 'exclamation', title: '4 PodSandboxCleanedUpFailed log entries on 2 clusters', detail: 'OCI runtime garbage collection backlog accumulating' },
      { id: 's2', time: '14:44:20', status: 'done',    icon: 'database',    title: 'Queried containerd runtime and overlay disk usage', detail: 'Orphaned container overlays: 2.1 GB on affected nodes' },
      { id: 's3', time: '14:44:34', status: 'done',    icon: 'search',      title: 'Identified containerd config drift after last node update', detail: 'sandbox_cleanup_interval misconfigured to 0 — disabling GC' },
    ],
    aggregatedFinding: '4 pod sandbox cleanup failures logged by Kubelet on 2 clusters, indicating an OCI runtime garbage collection backlog.',
    rootCauseNarrative: 'A containerd runtime configuration change disrupted the sandbox cleanup routine. Orphaned container overlays are accumulating on node disk and will cause disk pressure if unresolved.',
    remediationProposal: 'Execute a graceful Kubelet garbage collection cycle and validate the containerd runtime configuration.',
    riskAssessment: 'Low — housekeeping operation with no workload impact.',
    estimatedRecovery: '~30s',
    confidence: 'Medium',
  },
  ap10: {
    steps: [
      { id: 's1', time: '06:44:02', status: 'done', icon: 'exclamation', title: 'JenkinsQueueSizeHigh threshold breached', detail: 'Build queue: 57 jobs — all 4 executor slots occupied' },
      { id: 's2', time: '06:44:13', status: 'done', icon: 'database',    title: 'Identified stalled job monopolizing all executors', detail: 'integration-test-suite-full running 4.2h (expected: 45m)' },
      { id: 's3', time: '06:44:22', status: 'done', icon: 'search',      title: 'Confirmed stall due to upstream fixture service timeout', detail: 'No watchdog timer configured on long-running test stage' },
      { id: 's4', time: '06:44:31', status: 'done', icon: 'search',      title: 'Correlated executor saturation with queue depth growth', detail: 'All 4 slots occupied for 3.7h · queue depth rose from 12 to 57 jobs' },
    ],
    aggregatedFinding: 'Jenkins build queue exceeded 50 jobs, halting CI/CD throughput entirely.',
    rootCauseNarrative: 'A long-running integration test job monopolized all executor slots, starving downstream builds. The agent identified and terminated the stalled job, restoring executor availability.',
    remediationProposal: 'Terminate the stalled job and increase the executor count from 4 to 8 to prevent recurrence.',
    riskAssessment: 'Low — non-critical CI environment with no production dependency.',
    estimatedRecovery: '~2m',
    confidence: 'High',
  },
  ap11: {
    steps: [
      { id: 's1', time: '11:37:14', status: 'done',    icon: 'exclamation', title: 'FailedComputeMetricsReplicas event on HPA controller', detail: 'Autoscaling frozen for ~20 minutes' },
      { id: 's2', time: '11:37:26', status: 'done',    icon: 'database',    title: 'Verified custom metrics adapter connectivity', detail: 'Prometheus scrape endpoint unreachable from adapter pod' },
      { id: 's3', time: '11:37:39', status: 'done',    icon: 'network',     title: 'Traced network policy blocking adapter → Prometheus path', detail: 'Namespace isolation policy introduced 22 minutes ago' },
    ],
    aggregatedFinding: 'HPA controller failing to compute target replicas, effectively disabling autoscaling.',
    rootCauseNarrative: 'The custom metrics adapter lost connectivity to its Prometheus scrape endpoint, leaving the HPA unable to evaluate scale triggers. Autoscaling has been frozen for approximately 20 minutes.',
    remediationProposal: 'Restart the custom metrics adapter and validate Prometheus scrape endpoint connectivity.',
    riskAssessment: 'Low — brief adapter restart has no workload impact.',
    estimatedRecovery: '~45s',
    confidence: 'Medium',
  },
  ap12: {
    steps: [
      { id: 's1', time: '08:29:11', status: 'done',    icon: 'exclamation', title: '5 sustained ErrImagePullBackOff alerts across 4 clusters', detail: '~30% of container image pulls failing intermittently' },
      { id: 's2', time: '08:29:24', status: 'done',    icon: 'database',    title: 'Queried cluster DNS resolution for registry FQDN', detail: 'Stale A-record pointing to decommissioned registry mirror' },
      { id: 's3', time: '08:29:37', status: 'done',    icon: 'network',     title: 'Confirmed DNS propagation lag across 4 cluster resolvers', detail: 'New record not yet reflected in cluster-local CoreDNS caches' },
    ],
    aggregatedFinding: '5 sustained ErrImagePullBackOff alerts across 4 clusters indicating container registry connectivity degradation.',
    rootCauseNarrative: 'A registry DNS record update propagated incorrectly to cluster resolvers, causing intermittent image pull failures. Approximately 30% of pull attempts are failing under the current configuration.',
    remediationProposal: 'Force DNS cache flush on affected nodes and update the registry mirror configuration to bypass the stale record.',
    riskAssessment: 'Low — rolling DNS update with no workload eviction required.',
    estimatedRecovery: '~2m',
    confidence: 'Medium',
  },
  ap13: {
    steps: [
      { id: 's1', time: '16:02:08', status: 'done',    icon: 'exclamation', title: 'CSI volume throttling log entry detected', detail: 'Read IOPS exceeded provisioned tier ceiling on 1 cluster' },
      { id: 's2', time: '16:02:22', status: 'done',    icon: 'database',    title: 'Queried cloud storage IOPS metrics over 1-hour window', detail: 'Actual read IOPS: 3,200/s · provisioned limit: 2,000/s' },
      { id: 's3',                   status: 'active',  icon: 'search',      title: 'Correlating IOPS spike with workload event log', detail: 'Checking for batch job or backup process causing elevated reads…' },
    ],
    aggregatedFinding: 'Signal correlation complete. Storage CSI throttling and PV resizing stall detected. Root cause analysis in progress.',
    rootCauseNarrative: 'Initial signals suggest read IOPS are exceeding the provisioned cloud storage tier limits. Full storage topology analysis is pending — root cause not yet confirmed.',
    remediationProposal: 'Remediation paths pending root cause confirmation.',
    riskAssessment: 'TBD — storage configuration change scope under investigation.',
    estimatedRecovery: 'TBD',
    confidence: 'Medium',
  },
  ap14: {
    steps: [
      { id: 's1', time: '22:28:04', status: 'done', icon: 'exclamation', title: '3 NodeClockSkewDetected alerts fired', detail: 'Clock skew >10s on 3 nodes · cert validation errors logged' },
      { id: 's2', time: '22:28:16', status: 'done', icon: 'network',     title: 'Traced NTP sync failure to firewall rule change', detail: 'Upstream corporate NTP pool unreachable since 22:15' },
      { id: 's3', time: '22:28:30', status: 'done', icon: 'search',      title: 'Validated fallback NTP pool availability', detail: 'pool.ntp.org reachable · firewall exemption path identified' },
      { id: 's4', time: '22:28:42', status: 'done', icon: 'search',      title: 'Correlated clock drift with certificate validation errors', detail: 'API auth failures began 4 minutes after skew exceeded 10s threshold' },
    ],
    aggregatedFinding: '3 nodes across clusters reported NTP clock skew >10 seconds, flagging sync failures.',
    rootCauseNarrative: 'An upstream NTP server became unreachable due to a firewall rule change, leaving 3 nodes to drift independently. Clock skew exceeded Kubernetes tolerances, triggering certificate validation errors on some API calls.',
    remediationProposal: 'Reconfigure chronyd to use the corporate NTP pool and restart the clock synchronization service.',
    riskAssessment: 'Low — NTP reconfiguration has no workload impact.',
    estimatedRecovery: '~30s',
    confidence: 'High',
  },
  ap15: {
    steps: [
      { id: 's1', time: '07:15:03', status: 'done',    icon: 'exclamation', title: 'PruneImageRegistryManifestsFailed trace detected', detail: 'Scheduled pruning job failed for 2 consecutive runs' },
      { id: 's2', time: '07:15:17', status: 'done',    icon: 'database',    title: 'Audited registry pruner service account permissions', detail: 'delete-image-manifests permission revoked in RBAC patch v3.12.1' },
      { id: 's3', time: '07:15:29', status: 'done',    icon: 'search',      title: 'Confirmed no active workloads reference prunable tags', detail: '847 MB of unreferenced manifest layers identified via registry catalog scan' },
    ],
    aggregatedFinding: 'ImageRegistry pruning job failed, leaving orphaned image stream tags consuming registry storage.',
    rootCauseNarrative: 'A permissions regression in a recent RBAC update revoked the registry pruner service account access to delete manifests, causing the scheduled pruning job to fail silently.',
    remediationProposal: 'Restore RBAC permissions for the registry pruner service account and trigger a manual prune run.',
    riskAssessment: 'Low — registry pruning is non-destructive (removes unreferenced tags only).',
    estimatedRecovery: '~1m',
    confidence: 'High',
  },
  cp2: {
    steps: [
      { id: 's1', time: '09:18:04', status: 'done', icon: 'exclamation', title: 'Critical z-stream CVE advisory published for 4.15.8', detail: 'Critical z-stream platform CVE remediation available' },
      { id: 's2', time: '09:18:17', status: 'done', icon: 'database', title: 'Validated cluster at 4.15.1 — patch path to 4.15.8 confirmed', detail: 'No blocking ClusterOperators · patch-only upgrade eligible' },
      { id: 's3', time: '09:18:31', status: 'done', icon: 'check', title: 'Executed z-stream patch upgrade', detail: 'Control plane and nodes reconciled to 4.15.8 without workload migration' },
    ],
    aggregatedFinding: 'OpenShift advisory RHSA-2026-1842 requires z-stream patch 4.15.8 to remediate a critical platform CVE.',
    rootCauseNarrative: 'The cluster remained on OpenShift 4.15.1 while a critical platform CVE was addressed only in patch release 4.15.8. Delaying the z-stream update left the control plane exposed to a known vulnerability.',
    remediationProposal: 'Apply z-stream patch upgrade from 4.15.1 to 4.15.8 using the supported ClusterVersion update graph.',
    riskAssessment: 'Low — z-stream patch is a supported in-place update with minimal disruption.',
    estimatedRecovery: '~25m',
    confidence: 'High',
  },
  cp4: {
    steps: [
      { id: 's1', time: '11:22:04', status: 'done', icon: 'database', title: 'ClusterVersion operator requested readiness probe', detail: 'Autonomous investigation triggered by update controller' },
      { id: 's2', time: '11:22:18', status: 'done', icon: 'database', title: 'Collected ClusterOperator health and channel metadata', detail: '38 operators evaluated · 3 advisory warnings surfaced' },
      { id: 's3', time: '11:22:31', status: 'done', icon: 'search', title: 'Structured readiness report synthesized', detail: 'No remediation paths generated — investigation-only output' },
    ],
    aggregatedFinding: 'Autonomous cluster update readiness investigation completed with structured health findings and no remediation options.',
    rootCauseNarrative: 'The cluster update controller used the proposal resource to gather operator health, channel metadata, and blocking conditions. Analysis is complete; the output is intended for human review before any upgrade is scheduled.',
    remediationProposal: 'No remediation options — acknowledge this investigation-only proposal after review.',
    riskAssessment: 'N/A — investigation-only proposal.',
    estimatedRecovery: 'N/A',
    confidence: 'High',
  },
  op1: {
    steps: [
      { id: 's1', time: '08:42:11', status: 'done', icon: 'exclamation', title: 'PrometheusTargetDown alert fired', detail: 'Endpoint scrape failures detected in openshift-monitoring' },
      { id: 's2', time: '08:42:24', status: 'done', icon: 'database', title: 'Compared ServiceMonitor endpoints vs. live targets', detail: 'Stale TLS SAN mismatch on 2 prometheus-k8s scrape jobs' },
      { id: 's3', time: '08:42:39', status: 'done', icon: 'check', title: 'Reconciled Prometheus operator targets', detail: 'Scrape success restored across openshift-monitoring' },
    ],
    aggregatedFinding: 'Prometheus scrape failures traced to stale ServiceMonitor endpoints after a certificate rotation in openshift-monitoring.',
    rootCauseNarrative: 'A recent serving certificate rotation left Prometheus scrape configurations pointing at expired endpoint SANs, triggering PrometheusTargetDown across the monitoring namespace.',
    remediationProposal: 'Reconcile Prometheus operator ServiceMonitor targets and roll prometheus-k8s pods to pick up refreshed TLS trust bundles.',
    riskAssessment: 'Low — target reconciliation is rolling and non-destructive to workloads.',
    estimatedRecovery: '~2m',
    confidence: 'High',
  },
  op2: {
    steps: [
      { id: 's1', time: '10:18:04', status: 'done', icon: 'exclamation', title: 'AlertmanagerDeliveryFailing alert detected', detail: 'Expired integration tokens for PagerDuty receiver' },
      { id: 's2', time: '10:18:17', status: 'done', icon: 'database', title: 'Validated Alertmanager receiver secret references', detail: 'PagerDuty integration key past rotation window by 11 days' },
      { id: 's3', time: '10:18:31', status: 'active', icon: 'search', title: 'Awaiting approval to rotate webhook secret', detail: 'Secret rotation requires platform admin approval' },
    ],
    aggregatedFinding: 'Alertmanager notification delivery failures correlate with an expired PagerDuty integration token in openshift-monitoring.',
    rootCauseNarrative: 'The Alertmanager PagerDuty receiver references a Kubernetes secret whose integration token expired, causing sustained AlertmanagerDeliveryFailing alerts and missed pages.',
    remediationProposal: 'Rotate the Alertmanager webhook secret with a fresh PagerDuty integration key and reload alertmanager-main.',
    riskAssessment: 'Low — secret rotation is reversible and scoped to notification routing only.',
    estimatedRecovery: '~5m',
    confidence: 'High',
  },
  op3: {
    steps: [
      { id: 's1', time: '11:05:02', status: 'done', icon: 'exclamation', title: 'ThanosCompactorHasNotRun alert fired', detail: 'Thanos compactor pod stuck on corrupted block' },
      { id: 's2', time: '11:05:16', status: 'done', icon: 'database', title: 'Inspected compactor PVC and block metadata', detail: 'Corrupted TSDB block detected on thanos-compactor-data volume' },
      { id: 's3', time: '11:05:28', status: 'active', icon: 'search', title: 'Applying quarantine and compactor restart', detail: 'Remediation in progress on prod-east-2…' },
    ],
    aggregatedFinding: 'Thanos compactor stalled on a corrupted TSDB block; recovery is actively executing.',
    rootCauseNarrative: 'A corrupted TSDB block prevented the Thanos compactor from completing its compaction cycle. The agent is quarantining the block and restarting the compactor with a clean window.',
    remediationProposal: 'Quarantine the corrupted block, expand the compactor PVC if needed, and restart thanos-compactor.',
    riskAssessment: 'Medium — PVC recovery may require brief metrics query degradation.',
    estimatedRecovery: '~15m',
    confidence: 'Medium',
  },
  op4: {
    steps: [
      { id: 's1', time: '14:27:08', status: 'done', icon: 'exclamation', title: 'OpenTelemetryCollectorBufferFull alert detected', detail: 'Trace volume spike causing memory saturation' },
      { id: 's2', time: '14:27:21', status: 'done', icon: 'database', title: 'Sampled collector memory and export queue depth', detail: 'Batch queue at 98% capacity across 3 collector pods' },
      { id: 's3', time: '14:27:44', status: 'done', icon: 'check', title: 'Scaled collector replicas and tuned batch processor', detail: 'Buffer utilization normalized within 4 minutes' },
    ],
    aggregatedFinding: 'OpenTelemetry collector memory saturation caused by a cluster-wide trace volume spike triggered OpenTelemetryCollectorBufferFull.',
    rootCauseNarrative: 'A sudden increase in distributed trace volume exceeded single-replica collector batch buffers, saturating memory and stalling export pipelines until replicas were scaled out.',
    remediationProposal: 'Scale otel-collector deployment replicas and tune batch processor limits for sustained trace ingestion.',
    riskAssessment: 'Low — horizontal scale-out is rolling and reversible.',
    estimatedRecovery: '~4m',
    confidence: 'High',
  },
  op5: {
    steps: [
      { id: 's1', time: '16:03:12', status: 'done', icon: 'exclamation', title: 'PersesDashboardStorageLocked alert fired', detail: 'Database write timeouts on shared persistent volume' },
      { id: 's2', time: '16:03:26', status: 'done', icon: 'database', title: 'Inspected Perses storage volume and PVC mount state', detail: 'Stale lock file held after ungraceful perses pod eviction' },
      { id: 's3', time: '16:03:41', status: 'active', icon: 'search', title: 'Awaiting approval to remove storage lock', detail: 'Lock removal requires a brief Perses write-unavailable window' },
    ],
    aggregatedFinding: 'Perses dashboard persistence failures trace to a storage lock on the shared monitoring PVC.',
    rootCauseNarrative: 'An ungraceful Perses pod eviction left a stale lock file on the shared persistent volume, causing PersesDashboardStorageLocked alerts and dashboard write timeouts.',
    remediationProposal: 'Stop Perses, remove the stale lock file from the PVC, and restart the deployment with verified volume consistency.',
    riskAssessment: 'Medium — clearing the lock requires a short Perses write-unavailable window.',
    estimatedRecovery: '~3m',
    confidence: 'High',
  },
  // ─── New backend phase plans ─────────────────────────────────────────────────
  'acs-netpol-remediation-denied': {
    steps: [
      { id: 's1', time: '09:14:03', status: 'done', icon: 'exclamation', title: 'ACS policy violation detected on retail-checkout', detail: 'hostNetwork=true set on workload in retail-prod namespace — violates P-2041' },
      { id: 's2', time: '09:14:18', status: 'done', icon: 'search', title: 'Identified affected deployment', detail: 'retail-checkout uses hostNetwork as DNS workaround' },
      { id: 's3', time: '09:14:32', status: 'done', icon: 'exclamation', title: 'Remediation proposal denied by administrator', detail: 'Admin flagged for broader network policy review before patching' },
    ],
    aggregatedFinding: 'ACS detected a hostNetwork=true workload in the retail-prod namespace violating network isolation policy P-2041.',
    rootCauseNarrative: 'The retail-checkout deployment was updated with hostNetwork: true to work around a DNS resolution issue. ACS flagged this as a compliance violation. The remediation proposal to patch the deployment was reviewed and denied by the cluster administrator, who requires a broader policy review before any change is applied.',
    remediationProposal: 'Patch retail-checkout deployment to remove hostNetwork: true and resolve the DNS issue via CoreDNS configuration instead.',
    riskAssessment: 'Low — patch removes a privilege escalation risk. DNS validation required before apply.',
    estimatedRecovery: '~5m',
    confidence: 'High',
  },
  'ingress-controller-escalated': {
    steps: [
      { id: 's1', time: '14:22:05', status: 'done', icon: 'exclamation', title: 'IngressControllerMinReplicasNotMet alert fired', detail: 'Ingress controller replica count dropped below 2 after node eviction' },
      { id: 's2', time: '14:22:19', status: 'done', icon: 'database', title: 'Attempted automated scale-out — attempt 1', detail: 'Execution failed: insufficient resource quota in openshift-ingress' },
      { id: 's3', time: '14:22:41', status: 'done', icon: 'database', title: 'Attempted automated scale-out — attempt 2', detail: 'Execution failed: quota limit unchanged, same error' },
      { id: 's4', time: '14:23:00', status: 'done', icon: 'exclamation', title: 'MaxRetriesExhausted — escalated to operator', detail: 'Proposal marked Escalated; requires human quota adjustment' },
    ],
    aggregatedFinding: 'Ingress controller fell below minimum replicas after node eviction. Two automated scale-out attempts failed due to namespace quota limits.',
    rootCauseNarrative: 'A node eviction event on worker-bm-03 caused the ingress controller replica count to drop to 1. Two consecutive automated remediation executions failed because the openshift-ingress namespace quota prevented scheduling additional pods. After exhausting the MaxRetries threshold, the proposal was automatically escalated for manual operator intervention.',
    remediationProposal: 'Increase the openshift-ingress namespace ResourceQuota CPU/memory limits, then re-execute the ingress controller scale-out plan.',
    riskAssessment: 'Medium — quota change affects other workloads in the namespace. Review before applying.',
    estimatedRecovery: '~10m after quota adjustment',
    confidence: 'High',
  },
  'prometheus-wal-emergency-stopped': {
    steps: [
      { id: 's1', time: '02:07:15', status: 'done', icon: 'exclamation', title: 'PrometheusWALCorruptionDetected alert fired', detail: 'Write-ahead log corruption markers on prometheus-k8s-0' },
      { id: 's2', time: '02:07:28', status: 'done', icon: 'database', title: 'Initiated WAL segment repair via tsdb tool', detail: 'Repair started on /prometheus/wal — active write activity detected' },
      { id: 's3', time: '02:08:01', status: 'done', icon: 'exclamation', title: 'Emergency stop issued by on-call operator', detail: 'Halted mid-repair to avoid data loss during peak ingestion window' },
    ],
    aggregatedFinding: 'Prometheus WAL showed corruption markers on prometheus-k8s-0. Repair execution was started but stopped mid-flight by an emergency override.',
    rootCauseNarrative: 'Automated WAL repair was initiated in response to corruption markers detected on prometheus-k8s-0. The on-call team identified that the repair was running during the peak metric ingestion window (02:00–04:00 UTC), creating a risk of write-path data loss. An EmergencyStop was issued, halting execution. The instance remains in a degraded state pending a scheduled maintenance window.',
    remediationProposal: 'Schedule WAL repair during the next off-peak maintenance window (after 04:00 UTC). Use tsdb repair --repair flag with a snapshot taken beforehand.',
    riskAssessment: 'High — WAL repair during active writes risks metric data loss. Must be run offline.',
    estimatedRecovery: '~15m during maintenance window',
    confidence: 'Medium',
  },
  'etcd-defrag-failed': {
    steps: [
      { id: 's1', time: '09:14:05', status: 'done', icon: 'exclamation', title: 'EtcdDatabaseHighFragmentationRatio alert fired', detail: 'Fragmentation ratio 0.67 detected across etcd-master-01, etcd-master-02, etcd-master-03' },
      { id: 's2', time: '09:14:19', status: 'done', icon: 'database', title: 'Queried etcd endpoint defrag statistics', detail: 'DB size: 8.2 GiB · In-use: 3.1 GiB · Fragmentation: 62% — compaction lag confirmed' },
      { id: 's3', time: '09:14:38', status: 'done', icon: 'network', title: 'Executed etcd defrag across 3 control plane nodes', detail: 'Commands issued sequentially to avoid leadership disruption' },
      { id: 's4', time: '09:15:10', status: 'done', icon: 'exclamation', title: 'Verification failed: fragmentation ratio unchanged', detail: 'Post-defrag check still at 0.67 — compaction window had not run before execution' },
    ],
    aggregatedFinding: 'etcd defragmentation executed across 3 control plane nodes but post-execution verification failed — fragmentation ratio remained at 0.67.',
    rootCauseNarrative: 'EtcdDatabaseHighFragmentationRatio fired after the fragmentation ratio exceeded 0.5 on all three control plane etcd members. Defragmentation was executed sequentially to minimize leader disruption, but the post-execution check found the fragmentation metric unchanged. The root cause is that the auto-compaction window (configured at 1h) had not run prior to execution, leaving large amounts of unreclaimed logical space that defrag alone cannot recover without a preceding compaction pass.',
    remediationProposal: 'Trigger a manual etcd compaction before re-running defrag. Run `etcdctl compact <revision>` on the leader member, then re-execute the defragmentation plan during a low-write window.',
    riskAssessment: 'High — etcd fragmentation above 0.5 degrades API server write latency and can cause quota exhaustion if db-quota-backend-bytes is approached.',
    estimatedRecovery: 'N/A — plan failed; requires manual compaction before retry',
    confidence: 'Medium',
  },
  ...NEW_ALERT_INVESTIGATION_DRAWER_DATA,
};

// ─── Remediation options data ────────────────────────────────────────────────

export interface RemediationOption {
  id: string;
  title: string;
  description: string;
  risk: RemediationRisk;
  /** Diagnosis confidence for this remediation path (backend: options[].diagnosis.confidence). */
  confidence?: ConfidenceTier;
  /** Rollback assessment (backend: options[].proposal.reversible). */
  reversible: Reversibility;
  model: 'smart' | 'fast';
  rawCommands: string;
}

const PLAN_REMEDIATION_OPTIONS: Record<string, RemediationOption[]> = {
  tp1: [
    { id: 'tp1-o1', title: 'Automated fleet rollback via GitOps controller', description: 'Revert the ApplicationSet to revision r4891 and trigger a fleet-wide hard sync via the ArgoCD GitOps controller.', risk: 'low', reversible: 'Reversible', model: 'smart', rawCommands: 'argocd app sync cluster-ingress-controller --prune --force' },
    { id: 'tp1-o2', title: 'Manual cluster-by-cluster ArgoCD sync override', description: 'Force-sync each affected cluster individually via the ArgoCD CLI, bypassing the ApplicationSet controller.', risk: 'medium', reversible: 'Reversible', model: 'fast', rawCommands: 'argocd app sync cluster-ingress-controller --revision HEAD~1 --local' },
    { id: 'tp1-o3', title: 'Full ApplicationSet deletion and recreation', description: 'Delete the faulty ApplicationSet entirely and redeploy from the canonical Git source.', risk: 'high', reversible: 'Irreversible', model: 'fast', rawCommands: 'argocd app delete cluster-ingress-controller --cascade && git checkout HEAD~1 -- config/applicationset.yaml && argocd app create -f config/applicationset.yaml' },
  ],
  tp2: [],
  tp3: [
    { id: 'tp3-o1', title: 'Memory limit patch with rolling HPA scale-out', description: 'Apply 2Gi → 4Gi memory limit patch via rolling restart and scale HPA to 3 replicas to absorb the increased footprint.', risk: 'low', reversible: 'Reversible', model: 'smart', rawCommands: 'oc set resources deployment/payment-gateway --limits=memory=2Gi --requests=memory=1Gi -n payment-gateway' },
    { id: 'tp3-o2', title: 'Force pod eviction and reschedule', description: 'Force-evict all affected pods to trigger rescheduling without changing the memory limit configuration — temporary relief only.', risk: 'medium', reversible: 'Reversible', model: 'fast', rawCommands: 'oc delete pod -l app=payment-gateway -n payment-gateway --force --grace-period=0' },
  ],
  tp4: [
    { id: 'tp4-o1', title: 'Automated OSD pool expansion + log rotation enforcement', description: 'Expand the Ceph OSD pool by 20% via rook-ceph toolbox and enable automated log rotation on the 3 affected StatefulSets.', risk: 'medium', reversible: 'Reversible', model: 'smart', rawCommands: "oc patch pvc/ceph-storage-core-pvc -p '{\"spec\":{\"resources\":{\"requests\":{\"storage\":\"500Gi\"}}}}'" },
    { id: 'tp4-o2', title: 'Emergency log data pruning', description: 'Delete the oldest 30% of log data from the overloaded volumes to immediately free storage capacity.', risk: 'high', reversible: 'Irreversible', model: 'fast', rawCommands: 'oc rsh -n rook-ceph rook-ceph-tools -- bash -c "find /var/log/containers -mtime +30 -delete && ceph df"' },
  ],
  tp5: [
    { id: 'tp5-o1', title: 'Rolling etcd defragmentation across all control plane members', description: 'Defragment all 3 etcd members sequentially with automated health verification between each step.', risk: 'low', reversible: 'Reversible', model: 'smart', rawCommands: 'oc rsh -n openshift-etcd etcd-member-master-1 etcdctl defrag' },
    { id: 'tp5-o2', title: 'etcd compaction-only (no defragmentation)', description: 'Compact etcd revision history without a full defragmentation pass — faster but yields partial improvement only.', risk: 'low', reversible: 'Partial', model: 'fast', rawCommands: 'oc rsh -n openshift-etcd etcd-member-master-1 etcdctl compact $(oc rsh -n openshift-etcd etcd-member-master-1 etcdctl endpoint status --write-out=json | jq \'.[0].Status.header.revision\')' },
  ],
  ap1: [
    { id: 'ap1-o1', title: 'Memory limit patch + pod redeploy with rolling strategy', description: 'Apply the 2Gi → 4Gi limit patch and redeploy pods using a rolling update strategy to resolve the heap leak.', risk: 'low', reversible: 'Reversible', model: 'smart', rawCommands: 'oc rollout restart deployment/dev-analytics -n sandbox' },
    { id: 'ap1-o2', title: 'Force pod restart (temporary heap flush)', description: 'Force-restart affected pods to reclaim memory from the leaked heap — buys time without addressing the underlying allocator regression.', risk: 'medium', reversible: 'Reversible', model: 'fast', rawCommands: 'oc delete pod -l app=dev-analytics -n sandbox --force --grace-period=0' },
  ],
  ap2: [
    { id: 'ap2-o1', title: 'TLS secret rotation + webhook endpoint re-registration', description: 'Rotate the EventListener TLS secret and force webhook endpoint re-registration on both clusters.', risk: 'low', reversible: 'Reversible', model: 'smart', rawCommands: 'oc apply -f ./pipelines/repaired-webhook-admission.yaml' },
    { id: 'ap2-o2', title: 'Delete and recreate EventListener', description: 'Delete the EventListener resource entirely and recreate it to force full TLS re-initialization.', risk: 'medium', reversible: 'Reversible', model: 'fast', rawCommands: 'oc delete eventlistener/pipeline-webhook -n tekton-pipelines && oc apply -f ./pipelines/eventlistener.yaml' },
  ],
  ap3: [
    { id: 'ap3-o1', title: 'Restore IAM role binding + ACME-based cert rotation', description: 'Re-bind the automation IAM role and trigger an ACME DNS-01 challenge to issue a renewed certificate.', risk: 'medium', reversible: 'Reversible', model: 'smart', rawCommands: 'oc delete secret/expired-iam-token-certs -n openshift-auth' },
    { id: 'ap3-o2', title: 'Manual emergency cert renewal via internal PKI', description: 'Directly issue a replacement certificate through the internal PKI without restoring the automation role.', risk: 'high', reversible: 'Reversible', model: 'fast', rawCommands: 'oc create secret tls iam-token-certs --cert=./certs/tls.crt --key=./certs/tls.key -n openshift-auth --dry-run=client -o yaml | oc replace -f -' },
  ],
  ap4: [],
  ap5: [
    { id: 'ap5-o1', title: 'Force drain + Metal3 BMH reset + node re-provision', description: 'Force-drain the stuck node, reset the BareMetalHost object, and trigger full Metal3 re-provisioning.', risk: 'high', reversible: 'Irreversible', model: 'smart', rawCommands: 'oc adm node-merge-evacuate master-node-3 --target-tier=compute' },
    { id: 'ap5-o2', title: 'Node isolation via taint + workload migration', description: 'Taint the node unschedulable and migrate its workloads to healthy nodes without triggering a full re-provision.', risk: 'medium', reversible: 'Reversible', model: 'fast', rawCommands: 'oc adm taint node master-node-3 node.kubernetes.io/unschedulable:NoSchedule && oc adm drain master-node-3 --ignore-daemonsets --delete-emptydir-data' },
  ],
  ap6: [
    { id: 'ap6-o1', title: 'ArgoCD hard sync to Git-declared state', description: 'Force a hard sync on the staging application to restore the namespace to its GitOps-declared configuration.', risk: 'low', reversible: 'Reversible', model: 'fast', rawCommands: 'argocd app sync staging-config-map --refresh' },
  ],
  ap7: [
    { id: 'ap7-o1', title: 'Patch PodDisruptionBudget + HPA-driven scale-out', description: 'Set maxUnavailable: 1 on the ingress PDB and allow the HPA to scale routers to the 3-replica minimum.', risk: 'low', reversible: 'Reversible', model: 'smart', rawCommands: 'oc scale ingresscontroller/default --replicas=2 -n openshift-ingress-operator' },
    { id: 'ap7-o2', title: 'Temporary PDB suspension + manual ingress restart', description: 'Temporarily suspend the PodDisruptionBudget and manually restart ingress pods to restore the minimum replica count.', risk: 'medium', reversible: 'Partial', model: 'fast', rawCommands: 'oc rollout restart deployment/router-default -n openshift-ingress' },
  ],
  ap8: [
    { id: 'ap8-o1', title: 'Set hostNetwork: false + mutating admission webhook', description: 'Patch the deployment to remove host network access and install a MutatingAdmissionWebhook to prevent future violations.', risk: 'medium', reversible: 'Reversible', model: 'smart', rawCommands: "oc patch securitycontextconstraints restricted --type='json' -p='[{\"op\": \"replace\", \"path\": \"/allowHostNetwork\", \"value\": false}]'" },
    { id: 'ap8-o2', title: 'Force-delete non-compliant deployment', description: 'Immediately delete the offending deployment to eliminate the compliance violation — requires manual redeployment with a compliant spec.', risk: 'high', reversible: 'Irreversible', model: 'fast', rawCommands: "oc delete deployment -n production -l 'security.redhat.com/non-compliant=true'" },
  ],
  ap9: [
    { id: 'ap9-o1', title: 'Kubelet GC cycle + containerd sandbox_cleanup_interval fix', description: 'Trigger a graceful Kubelet garbage collection pass and patch the containerd config to re-enable sandbox cleanup.', risk: 'low', reversible: 'Reversible', model: 'smart', rawCommands: 'oc adm prune deployments --keep-complete=5 --keep-failed=1 --keep-younger-than=60m' },
  ],
  ap10: [
    { id: 'ap10-o1', title: 'Terminate stalled job + increase executor count to 8', description: 'Terminate the monopolizing integration test job and scale Jenkins executors from 4 to 8 to prevent recurrence.', risk: 'low', reversible: 'Reversible', model: 'fast', rawCommands: 'oc set env deployment/jenkins-leader JENKINS_MAX_EXECUTORS=16 -n continuous-integration' },
  ],
  ap11: [
    { id: 'ap11-o1', title: 'Restart metrics adapter + update egress network policy', description: 'Restart the custom metrics adapter pod and add an egress rule permitting adapter → Prometheus communication.', risk: 'low', reversible: 'Reversible', model: 'smart', rawCommands: "oc patch hpa/api-scaler -p '{\"spec\":{\"maxReplicas\":50}}' -n production" },
    { id: 'ap11-o2', title: 'Fall back to CPU-only HPA scaling', description: 'Remove the custom metrics configuration and revert the HPA to native CPU utilization-based scaling.', risk: 'medium', reversible: 'Reversible', model: 'fast', rawCommands: 'oc patch hpa/api-scaler -p \'{"spec":{"metrics":[{"type":"Resource","resource":{"name":"cpu","target":{"type":"Utilization","averageUtilization":70}}}]}}\' -n production' },
  ],
  ap12: [
    { id: 'ap12-o1', title: 'CoreDNS cache flush + registry mirror config update', description: 'Flush CoreDNS caches on affected nodes and update the registry mirror to the corrected endpoint.', risk: 'low', reversible: 'Reversible', model: 'smart', rawCommands: 'oc secrets link deployer registry-pull-secret --for=pull -n core-system' },
    { id: 'ap12-o2', title: 'Configure pods to pull via registry node IP', description: 'Patch pod specs to reference the registry by direct node IP, bypassing DNS resolution until the record propagates.', risk: 'medium', reversible: 'Reversible', model: 'fast', rawCommands: "oc patch configmap/registry-env-config -n openshift-image-registry -p '{\"data\":{\"REGISTRY_OPENSHIFT_SERVER_ADDR\":\"172.30.1.1:5000\"}}'" },
  ],
  ap13: [],
  ap14: [
    { id: 'ap14-o1', title: 'Reconfigure chronyd to corporate NTP pool + restart service', description: 'Update chronyd to use the corporate NTP pool and restart the time synchronization service on all 3 nodes.', risk: 'low', reversible: 'Reversible', model: 'fast', rawCommands: 'oc rsh -n openshift-node chrony-sync-daemon systemctl restart chronyd' },
  ],
  ap15: [
    { id: 'ap15-o1', title: 'Restore pruner RBAC permissions + manual prune run', description: 'Restore the delete-image-manifests permission to the registry pruner service account and trigger a manual prune.', risk: 'low', reversible: 'Reversible', model: 'smart', rawCommands: 'oc adm prune images --keep-tag-revisions=3 --prune-over-size-limit=true' },
    { id: 'ap15-o2', title: 'Direct manifest deletion by cluster-admin', description: 'Manually delete the 847 MB of unreferenced manifests using cluster-admin credentials, bypassing the pruner workflow.', risk: 'medium', reversible: 'Irreversible', model: 'fast', rawCommands: "oc delete istag -n production $(oc get istag -n production -o jsonpath='{.items[?(@.image.metadata.creationTimestamp<\"2026-01-01\")].metadata.name}')" },
  ],
  cp1: [
    { id: 'cp1-o1', title: 'Supported minor upgrade 4.14 → 4.15 with rolling node cadence', description: 'Apply the ClusterVersion update to 4.15 using the supported upgrade graph with automated worker cordon, drain, and reboot sequencing.', risk: 'high', reversible: 'Irreversible', model: 'smart', rawCommands: 'oc adm upgrade --to-image=quay.io/openshift-release-dev/ocp-release:4.15.8-x86_64 --allow-explicit-upgrade' },
    { id: 'cp1-o2', title: 'Preflight validation only (defer execution)', description: 'Run upgrade preflight checks and ClusterOperator health gates without mutating the control plane — defers execution until a maintenance window is approved.', risk: 'low', reversible: 'Reversible', model: 'fast', rawCommands: 'oc adm upgrade --to=4.15 --allow-missing-images=false --dry-run=client' },
  ],
  op2: [
    { id: 'op2-o1', title: 'Rotate Alertmanager PagerDuty secret + rolling reload', description: 'Replace the expired PagerDuty integration key in the alertmanager-main secret and trigger a rolling reload of alertmanager pods in openshift-monitoring.', risk: 'low', reversible: 'Reversible', model: 'smart', rawCommands: 'oc create secret generic alertmanager-pagerduty --from-literal=pagerduty.integration-key=$PAGERDUTY_KEY -n openshift-monitoring --dry-run=client -o yaml | oc apply -f - && oc rollout restart statefulset/alertmanager-main -n openshift-monitoring' },
    { id: 'op2-o2', title: 'Temporarily disable PagerDuty receiver route', description: 'Silence the PagerDuty receiver in Alertmanager configuration to stop delivery failures while the integration token is rotated manually.', risk: 'medium', reversible: 'Partial', model: 'fast', rawCommands: 'oc patch secret alertmanager-main -n openshift-monitoring --type merge -p \'{"data":{"alertmanager.yaml":"<route with null receiver for pagerduty>"}}\' && oc delete pod alertmanager-main-0 -n openshift-monitoring' },
  ],
  op3: [
    { id: 'op3-o1', title: 'Quarantine corrupted block and restart compactor', description: 'Remove the corrupted TSDB block from thanos-compactor-data PVC and restart the compactor pod with a clean compaction window.', risk: 'medium', reversible: 'Partial', model: 'smart', rawCommands: 'oc scale statefulset/thanos-compactor --replicas=0 -n openshift-monitoring && oc rsh -n openshift-monitoring thanos-compactor-0 -- rm -rf /var/thanos/compact/data/01HX* && oc scale statefulset/thanos-compactor --replicas=1 -n openshift-monitoring' },
    { id: 'op3-o2', title: 'Expand compactor PVC and force compaction', description: 'Resize the compactor persistent volume and run a forced compaction cycle — higher blast radius during PVC resize.', risk: 'high', reversible: 'Irreversible', model: 'fast', rawCommands: 'oc patch pvc/thanos-compactor-data -n openshift-monitoring -p \'{"spec":{"resources":{"requests":{"storage":"200Gi"}}}}\' && oc delete pod thanos-compactor-0 -n openshift-monitoring' },
  ],
  op5: [
    { id: 'op5-o1', title: 'Clear stale Grafana SQLite WAL lock + controlled restart', description: 'Scale grafana to zero, remove the stale SQLite WAL lock file on the shared PVC, verify filesystem consistency, and restart the deployment.', risk: 'medium', reversible: 'Reversible', model: 'smart', rawCommands: 'oc scale deployment/grafana --replicas=0 -n openshift-monitoring && oc rsh -n openshift-monitoring grafana-debug -- rm -f /var/lib/grafana/grafana.db-wal && oc scale deployment/grafana --replicas=1 -n openshift-monitoring' },
    { id: 'op5-o2', title: 'Snapshot PVC then force WAL checkpoint', description: 'Take a volume snapshot of the Grafana PVC and run a forced SQLite checkpoint before clearing the lock — slower but preserves rollback capability.', risk: 'low', reversible: 'Reversible', model: 'fast', rawCommands: 'oc create -f grafana-pvc-snapshot.yaml && oc exec -n openshift-monitoring deploy/grafana -- sqlite3 /var/lib/grafana/grafana.db "PRAGMA wal_checkpoint(FULL);"' },
  ],
  'acs-netpol-remediation-denied': [
    { id: 'acs-netpol-o1', title: 'Patch deployment to remove hostNetwork + CoreDNS config fix', description: 'Set hostNetwork: false on the retail-checkout deployment and resolve the underlying DNS resolution issue by adding a CoreDNS stub zone for the affected service domain.', risk: 'medium', reversible: 'Reversible', model: 'smart', rawCommands: "oc patch deployment/retail-checkout -n retail-prod --type='json' -p='[{\"op\": \"replace\", \"path\": \"/spec/template/spec/hostNetwork\", \"value\": false}]' && oc apply -f coredns-stub-zone.yaml" },
    { id: 'acs-netpol-o2', title: 'Add ACS admission controller policy exception (temporary)', description: 'Add a scoped policy exception in ACS to silence the P-2041 violation alert for retail-checkout while the DNS issue is resolved separately — shorter blast radius, does not fix the root cause.', risk: 'low', reversible: 'Reversible', model: 'fast', rawCommands: "roxctl policy add-exception --policy=P-2041 --deployment=retail-checkout --namespace=retail-prod --expiry='24h'" },
  ],
  'prometheus-wal-emergency-stopped': [
    { id: 'prom-wal-o1', title: 'Full WAL repair with pre-execution snapshot (recommended)', description: 'Take a volume snapshot of the Prometheus PVC before initiating repair, then run tsdb repair on the corrupted WAL segments. The snapshot provides a rollback point if the repair corrupts additional data. Must be run in an offline write-isolated window (after 04:00 UTC).', risk: 'medium', reversible: 'Reversible', model: 'smart', rawCommands: `oc create -f prometheus-pvc-snapshot.yaml -n openshift-monitoring
oc scale statefulset/prometheus-k8s --replicas=0 -n openshift-monitoring
oc rsh -n openshift-monitoring prometheus-k8s-0 -- tsdb repair --repair /prometheus
oc scale statefulset/prometheus-k8s --replicas=2 -n openshift-monitoring` },
    { id: 'prom-wal-o2', title: 'Segment-by-segment WAL repair in write-isolated mode', description: 'Cordon the Prometheus node, isolate the write path via remote-write disablement, then repair individual corrupted WAL segments. Faster than a full repair but requires manual segment identification. Riskier if additional corruption exists outside the identified segments.', risk: 'high', reversible: 'Partial', model: 'fast', rawCommands: `oc annotate pod/prometheus-k8s-0 -n openshift-monitoring prometheus.io/remote-write-disabled=true
oc rsh -n openshift-monitoring prometheus-k8s-0 -- tsdb repair --repair /prometheus/wal/00000001
oc annotate pod/prometheus-k8s-0 -n openshift-monitoring prometheus.io/remote-write-disabled-` },
  ],
};

// ─── Drawer: post-mortem data (Completed / Failed plans) ─────────────────────

interface PlanPostMortem {
  type: 'success' | 'failure';
  executionDuration?: string;
  appliedAt?: string;
  gitCommitRef?: string;
  recoveredAt?: string;
  failureTrace?: string;
  failureReason?: string;
  rawLog?: string;
  // Contextual Evidence
  rootCauseSummary?: string;
  remediationActionDelta?: string;
  // Scope Boundaries — fleet targets (cluster names) and single-cluster targets
  executionTargets?: string[];
  executionTargetsSC?: string[];
}

const PLAN_POSTMORTEM: Record<string, PlanPostMortem> = {
  tp5: {
    type: 'success',
    executionDuration: '43s',
    appliedAt: 'Wed 10:04:22 UTC',
    gitCommitRef: 'a3f1b9d4',
    recoveredAt: 'Wed 10:04:55 UTC',
    rootCauseSummary: 'etcd database fragmentation exceeded 65%, causing API write amplification and elevated P99 latency above 1.2s across all control-plane members.',
    remediationActionDelta: 'Executed rolling etcd defragmentation across all 3 control-plane members, clearing the compaction backlog and reducing fragmentation from 68% to <5%. API write amplification resolved.',
    executionTargets: ['prod-east-2'],
    executionTargetsSC: ['etcd-master-01', 'etcd-master-02', 'etcd-master-03'],
    rawLog:
`[10:04:22 UTC] Starting etcd defragmentation sequence (3 members)...
[10:04:23 UTC] Defragmenting etcd member: etcd-master-1 (172.16.0.11)
[10:04:28 UTC] ✓ etcd-master-1 defragmented — 1.2 GB freed, latency: 8ms
[10:04:31 UTC] Defragmenting etcd member: etcd-master-2 (172.16.0.12)
[10:04:36 UTC] ✓ etcd-master-2 defragmented — 1.1 GB freed, latency: 9ms
[10:04:39 UTC] Defragmenting etcd member: etcd-master-3 (172.16.0.13)
[10:04:55 UTC] ✓ etcd-master-3 defragmented — 1.3 GB freed, latency: 7ms
[10:04:55 UTC] All members healthy. API latency restored to 12ms avg.
Exit code: 0 — Execution succeeded.`,
  },
  ap5: {
    type: 'failure',
    failureReason: 'The autonomous remediation loop terminated after exhausting 3 consecutive execution attempts. Node master-node-3 is unreachable via the Metal3 controller and remains in a provisioning-error state. The BareMetalHost object cannot be reset remotely. Immediate manual intervention or cluster-admin escalation is required to restore the node to a schedulable state.',
    failureTrace:
`Error: Metal3 BareMetalHost reset failed for node master-node-3
TASK [metal3.reset_node] → connection timeout after 30s

$ oc adm drain master-node-3 --ignore-daemonsets --delete-emptydir-data
Error from server: node "master-node-3" is unreachable

Retrying... (attempt 1/3) connection refused
Retrying... (attempt 2/3) connection refused
Retrying... (attempt 3/3) connection refused

FATAL: Node drain failed after 3 attempts.
BareMetalHost state: provisioning-error
Rollback: node taint removed, workloads rescheduled to compute-node-7
Exit code: 1`,
    rawLog:
`[10:31:04 UTC] Initiating Metal3 BareMetalHost remediation for node master-node-3
[10:31:05 UTC] Fetching BareMetalHost object: baremetalhost/master-node-3 (openshift-machine-api)
[10:31:06 UTC] Current BareMetalHost state: provisioning-error
[10:31:07 UTC] Attempting node drain: oc adm drain master-node-3 --ignore-daemonsets --delete-emptydir-data
[10:31:37 UTC] ERROR: connection timeout — node unreachable after 30s
[10:31:37 UTC] Retry 1/3: waiting 10s before re-attempt...
[10:31:47 UTC] Retry 1/3: oc adm drain master-node-3 (attempt 2)
[10:32:17 UTC] ERROR: connection refused
[10:32:17 UTC] Retry 2/3: waiting 10s before re-attempt...
[10:32:27 UTC] Retry 2/3: oc adm drain master-node-3 (attempt 3)
[10:32:57 UTC] ERROR: connection refused
[10:32:57 UTC] Max retries exhausted. Initiating rollback sequence.
[10:32:58 UTC] Rollback: removing taint node-role.kubernetes.io/unschedulable from master-node-3
[10:32:59 UTC] Rollback: rescheduling workloads to compute-node-7
[10:33:01 UTC] Rollback complete. 4 pods migrated to compute-node-7.
[10:33:01 UTC] Execution terminated — manual operator intervention required.
Exit code: 1 — Execution failed after 3 attempts.`,
  },
  ap6: {
    type: 'success',
    executionDuration: '12s',
    appliedAt: 'Tue 16:18:44 UTC',
    gitCommitRef: 'c7e2f08b',
    recoveredAt: 'Tue 16:18:56 UTC',
    rootCauseSummary: 'A direct kubectl apply bypassed the GitOps workflow, creating a divergence between live and Git-declared state for 3 resources in the staging namespace.',
    remediationActionDelta: 'Executed an ArgoCD hard sync against revision c7e2f08b, restoring 3 out-of-sync resources and re-establishing full GitOps control over the staging application.',
    executionTargets: ['stg-central'],
    executionTargetsSC: ['staging-api', 'staging-db-config', 'staging-api-svc'],
    rawLog:
`[16:18:44 UTC] Initiating ArgoCD hard sync for staging-config-map (revision c7e2f08b)...
[16:18:45 UTC] Comparing live state against Git-declared configuration...
[16:18:47 UTC] Delta: 3 resources out of sync
[16:18:48 UTC] Applying: ConfigMap/staging-db-config → patched
[16:18:50 UTC] Applying: Deployment/staging-api → synced
[16:18:53 UTC] Applying: Service/staging-api → unchanged
[16:18:56 UTC] ✓ Application health: Healthy. Sync status: Synced.
Exit code: 0 — Execution succeeded.`,
  },
  ap10: {
    type: 'success',
    executionDuration: '8s',
    appliedAt: 'Mon 09:31:17 UTC',
    gitCommitRef: 'f4a90c12',
    recoveredAt: 'Mon 09:31:25 UTC',
    rootCauseSummary: 'Jenkins executor pool was under-provisioned at 4 executors, causing queue depth to spike and pipeline runs to stall as concurrent build demand exceeded configured capacity.',
    remediationActionDelta: 'Patched jenkins-leader StatefulSet to increase JENKINS_MAX_EXECUTORS from 4 to 16 and triggered a rolling restart; all 16 executor slots active and queue depth restored to zero.',
    executionTargets: ['prod-east-2'],
    executionTargetsSC: ['jenkins-0'],
    rawLog:
`[09:31:17 UTC] Targeting deployment/jenkins-leader in continuous-integration...
[09:31:18 UTC] Setting env: JENKINS_MAX_EXECUTORS=16 (previous value: 4)
[09:31:19 UTC] Rolling restart triggered.
[09:31:22 UTC] Pod jenkins-leader-7d4f9b-xk2pq: Terminating
[09:31:24 UTC] Pod jenkins-leader-9c8e3a-m7vnz: Running (1/1 ready)
[09:31:25 UTC] ✓ Queue depth: 0 jobs pending. Executor slots: 16/16 active.
Exit code: 0 — Execution succeeded.`,
  },
  ap14: {
    type: 'success',
    executionDuration: '22s',
    appliedAt: 'Thu 03:45:02 UTC',
    gitCommitRef: 'b1d3e7a9',
    recoveredAt: 'Thu 03:45:24 UTC',
    rootCauseSummary: 'System clock skew of +847–851ms detected across all cluster nodes due to a stale NTP server reference in chrony.conf, preventing accurate log correlation and etcd lease timing.',
    remediationActionDelta: 'Updated /etc/chrony.conf on all nodes to point to ntp.corp.redhat.com, restarted chrony-sync-daemon fleet-wide, and reduced clock offset delta to <1ms.',
    executionTargets: ['prod-east-2', 'prod-eu-west-1', 'stg-central'],
    executionTargetsSC: ['worker-01', 'worker-02', 'worker-03', 'master-01', 'master-02', 'master-03'],
    rawLog:
`[03:45:02 UTC] Connecting to chrony-sync-daemon on openshift-node nodes...
[03:45:04 UTC] Updating /etc/chrony.conf: pool → ntp.corp.redhat.com iburst
[03:45:06 UTC] chrony-sync-daemon on node-1: restarted (offset was +847ms)
[03:45:09 UTC] chrony-sync-daemon on node-2: restarted (offset was +851ms)
[03:45:13 UTC] chrony-sync-daemon on node-3: restarted (offset was +843ms)
[03:45:18 UTC] Clock offset delta: < 1ms across all 3 nodes.
[03:45:24 UTC] ✓ NTP synchronization restored. NodeClockSkewDetected: resolved.
Exit code: 0 — Execution succeeded.`,
  },
  'etcd-defrag-failed': {
    type: 'failure',
    failureReason: 'etcd defragmentation executed across etcd-master-01, etcd-master-02, and etcd-master-03, but post-execution verification failed. The fragmentation ratio remained at 0.67 — unchanged from the pre-execution baseline. The auto-compaction window had not completed prior to defrag execution, leaving logical space unreclaimed. Defragmentation cannot recover space that has not been compacted. Manual compaction of the etcd revision history is required before re-executing this plan.',
    failureTrace:
`[09:14:38 UTC] Executing etcd defrag on etcd-master-01
$ etcdctl defrag --endpoints=https://etcd-master-01:2379
Finished defragmenting etcd member[https://etcd-master-01:2379]

[09:14:43 UTC] Executing etcd defrag on etcd-master-02
$ etcdctl defrag --endpoints=https://etcd-master-02:2379
Finished defragmenting etcd member[https://etcd-master-02:2379]

[09:14:48 UTC] Executing etcd defrag on etcd-master-03
$ etcdctl defrag --endpoints=https://etcd-master-03:2379
Finished defragmenting etcd member[https://etcd-master-03:2379]

[09:15:05 UTC] Running post-execution verification...
$ etcdctl endpoint status --endpoints=https://etcd-master-01:2379,https://etcd-master-02:2379,https://etcd-master-03:2379 --write-out=table
ENDPOINT              | DB SIZE | IN USE  | FRAGMENTATION
etcd-master-01:2379   | 8.2 GiB | 3.1 GiB | 62%
etcd-master-02:2379   | 8.1 GiB | 3.1 GiB | 62%
etcd-master-03:2379   | 8.2 GiB | 3.0 GiB | 63%

VERIFICATION FAILED: fragmentation ratio ≥ 0.5 (threshold) on all members.
Cause: etcd auto-compaction window (1h) had not completed before defrag.
Recommendation: run etcdctl compact <latest-revision> then retry.
Exit code: 1`,
    rawLog:
`[09:14:30 UTC] Agentic run started: etcd defragmentation sequence (3 members)
[09:14:31 UTC] Resolving etcd endpoints from cluster: prod-east-1
[09:14:32 UTC] Discovered 3 etcd members: etcd-master-01, etcd-master-02, etcd-master-03
[09:14:33 UTC] Pre-flight check: verifying etcd quorum... PASS
[09:14:34 UTC] Pre-flight check: checking compaction status...
[09:14:35 UTC] WARN: latest compaction revision: 8302441 — auto-compaction window in progress (next: 09:15:00 UTC)
[09:14:36 UTC] Proceeding with defragmentation (compaction window incomplete)
[09:14:38 UTC] Defragmenting etcd-master-01 (172.16.0.11:2379)
[09:14:43 UTC] ✓ etcd-master-01 defragmented (5.1 GiB → 5.1 GiB — no logical space freed)
[09:14:43 UTC] Defragmenting etcd-master-02 (172.16.0.12:2379)
[09:14:48 UTC] ✓ etcd-master-02 defragmented (5.0 GiB → 5.0 GiB — no logical space freed)
[09:14:48 UTC] Defragmenting etcd-master-03 (172.16.0.13:2379)
[09:14:53 UTC] ✓ etcd-master-03 defragmented (5.2 GiB → 5.2 GiB — no logical space freed)
[09:14:53 UTC] All defragmentation commands completed without error.
[09:15:05 UTC] Running post-execution verification: checking fragmentation ratios...
[09:15:08 UTC] etcd-master-01: fragmentation 62% (threshold: 50%) — FAIL
[09:15:08 UTC] etcd-master-02: fragmentation 62% (threshold: 50%) — FAIL
[09:15:08 UTC] etcd-master-03: fragmentation 63% (threshold: 50%) — FAIL
[09:15:08 UTC] VERIFICATION FAILED: fragmentation above threshold on all 3 members.
[09:15:09 UTC] Root cause: auto-compaction did not complete before defrag; logical space unreclaimed.
[09:15:09 UTC] No rollback performed — defrag commands are non-destructive.
[09:15:09 UTC] Recommendation: run etcdctl compact <latest-revision> then re-execute this plan.
Exit code: 1 — Verification failed.`,
  },
};

// ─── Runtime post-mortem synthesis ────────────────────────────────────────────
// Generates a realistic Completed post-mortem for plans that were just executed
// locally (i.e., plans that don't have a static PLAN_POSTMORTEM entry).
const generatePostMortem = (plan: PlanRow): PlanPostMortem => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const timeStr = `${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][now.getDay()]} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} UTC`;
  // Deterministic hex ref derived from the plan id so it stays stable on re-render.
  const hashSeed = plan.id.split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) & 0xffffffff, 0);
  const gitRef = Math.abs(hashSeed).toString(16).padStart(8, '0').slice(0, 8);
  const targetCount = plan.drawerTargets.length;
  const durationSecs = 12 + targetCount * 5;
  const recoveryMs = now.getTime() + durationSecs * 1000;
  const recoveredAt = (() => {
    const r = new Date(recoveryMs);
    return `${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][r.getDay()]} ${pad(r.getHours())}:${pad(r.getMinutes())}:${pad(r.getSeconds())} UTC`;
  })();
  const drawer = PLAN_DRAWER_DATA[plan.id];
  const cmd = drawer?.remediationProposal ?? `Applying automated fix for: ${plan.synopsis}`;
  const targetLines = plan.drawerTargets
    .map((t, i) => `[${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds() + i + 1)} UTC] ✓ Applied to target: ${t}`)
    .join('\n');
  return {
    type: 'success',
    appliedAt: timeStr,
    executionDuration: `${durationSecs}s`,
    gitCommitRef: gitRef,
    recoveredAt,
    rootCauseSummary: drawer?.rootCauseNarrative ?? `Automated analysis identified the root cause of: ${plan.synopsis}.`,
    remediationActionDelta: drawer?.remediationProposal ?? `Applied automated fix targeting ${targetCount} infrastructure object${targetCount !== 1 ? 's' : ''}.`,
    executionTargets: plan.drawerTargets,
    executionTargetsSC: plan.drawerTargets,
    rawLog:
`[${timeStr}] Initiating remediation: ${plan.synopsis}
[${timeStr}] Strategy: ${cmd}
${targetLines}
[${recoveredAt}] ✓ All ${targetCount} target${targetCount !== 1 ? 's' : ''} updated successfully.
[${recoveredAt}] Health checks passed. System restored to nominal state.
Exit code: 0 — Execution succeeded.`,
  };
};

/** Deterministic simulated analysis token count for plans without real SDK token data. */
function simulateAnalysisTokenCount(planId: string): number {
  let hash = 0;
  for (let i = 0; i < planId.length; i++) {
    hash = (hash * 31 + planId.charCodeAt(i)) >>> 0;
  }
  // Range: 820 – 3,640 tokens (plausible LLM analysis call)
  return 820 + (hash % 2820);
}

const formatExecutionKillTimestamp = (date: Date): string =>
  date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });

function buildActiveExecutionLogLines(plan: PlanRow, option: RemediationOption): string[] {
  const postMortem = PLAN_POSTMORTEM[plan.id] ?? generatePostMortem(plan);
  const cmd = option.rawCommands.split('\n')[0]?.trim() ?? option.title;
  const seed = postMortem.rawLog?.split('\n').filter((line) => line.trim().length > 0) ?? [];
  if (seed.length > 0) {
    return seed;
  }
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} UTC`;
  return [
    `[${timeStr}] Initiating remediation: ${plan.synopsis}`,
    `[${timeStr}] Strategy: ${cmd}`,
    `[${timeStr}] Applying mutations on ${plan.drawerTargets[0] ?? 'target'}…`,
    `[${timeStr}] Health checks in progress…`,
  ];
}

function useStreamingExecutionLog(
  lines: string[],
  enabled: boolean,
  frozen: boolean,
): string {
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    setVisibleCount(1);
  }, [lines, frozen]);

  useEffect(() => {
    if (!enabled || frozen || visibleCount >= lines.length) {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setVisibleCount((count) => Math.min(count + 1, lines.length));
    }, 650);
    return () => window.clearTimeout(timer);
  }, [enabled, frozen, lines.length, visibleCount]);

  return lines.slice(0, frozen ? visibleCount : visibleCount).join('\n');
}

// ─── Expanded row: consolidated reason icon ───────────────────────────────────

/** OpenShift console / PatternFly table style: e.g. Jun 9, 2026, 2:32 PM */
const formatPlanCreatedAt = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '—';
  }
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

// ─── Status label ─────────────────────────────────────────────────────────────

type LabelColor = 'blue' | 'teal' | 'orange' | 'green' | 'red' | 'grey';

const STATUS_LABEL_COLOR: Record<PlanStatus, LabelColor> = {
  'Pending':          'grey',
  'Analyzing':        'blue',
  'Proposed':         'orange',
  'Approved':         'orange',
  'Executing':        'teal',
  'Verifying':        'teal',
  'Acknowledged':     'green',
  'Completed':        'green',
  'Failed':           'red',
  'Denied':           'red',
  'Escalating':       'orange',
  'Escalated':        'orange',
  'EmergencyStopped': 'red',
  'Plan aborted':     'red',
};

const PlanTokensConsumedCell: React.FC<{ row: PlanRow }> = ({ row }) => {
  const { getPlanWorkflow } = usePlanWorkflow();
  const workflow = getPlanWorkflow(row.id);
  const { display, tooltip } = getPlanTokensConsumedView(
    row.status,
    getPlanTokenBurn(row.id),
    {
      executionOptionId: workflow.executionApproval?.optionId,
      planKind: row.planKind,
    },
  );

  if (display === '—' || !display) {
    const ariaLabel = display === '—'
      ? 'Token consumption in progress'
      : 'Token consumption not available';
    return (
      <span aria-label={ariaLabel} style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
        {display}
      </span>
    );
  }

  return (
    <Tooltip content={tooltip} position="top">
      <span tabIndex={0} style={{ display: 'inline-flex', cursor: 'default', whiteSpace: 'nowrap' }}>
        {display}
      </span>
    </Tooltip>
  );
};

export const StatusLabel: React.FC<{ status: PlanStatus; terminatedAt?: string }> = ({
  status,
  terminatedAt,
}) => {
  if (status === 'Plan aborted' || status === 'EmergencyStopped') {
    const tooltipContent =
      status === 'EmergencyStopped'
        ? `Emergency stop issued by operator at ${terminatedAt ?? '—'}. Execution halted mid-flight.`
        : `Execution halted by administrative override at ${terminatedAt ?? '—'}.`;
    const displayLabel = status === 'EmergencyStopped' ? 'Emergency stopped' : 'Plan aborted';
    return (
      <Tooltip content={tooltipContent} position="top">
        <span tabIndex={0} style={{ display: 'inline-flex', cursor: 'default' }}>
          <Label color="red" variant="outline" isCompact style={{ whiteSpace: 'nowrap' }}>
            {displayLabel}
          </Label>
        </span>
      </Tooltip>
    );
  }

  return (
    <Label color={STATUS_LABEL_COLOR[status]} variant="outline" isCompact style={{ whiteSpace: 'nowrap' }}>
      {status}
    </Label>
  );
};

export const TriggerDomainCell: React.FC<{
  domain: string;
  /** When true, granular telemetry domains (Prometheus, Thanos…) are coalesced to "Observability". */
  mapObservabilityDomains?: boolean;
}> = ({ domain, mapObservabilityDomains = false }) => (
  <Label color="grey" variant="outline" isCompact>
    {mapObservabilityDomains ? resolveDisplayDomain(domain) : domain}
  </Label>
);

/** Created time for plans in Proposed status. */
export const WaitingApprovalPlanMeta: React.FC<{ plan: PlanRow }> = ({ plan }) => {
  if (plan.status !== 'Proposed' || !plan.createdAt) {
    return null;
  }

  return (
    <Content component="small" style={{ margin: 0, color: 'var(--pf-t--global--text--color--subtle)' }}>
      Created{' '}
      <time dateTime={plan.createdAt}>{formatPlanCreatedAt(plan.createdAt)}</time>
    </Content>
  );
};

// ─── Table column header helpers ──────────────────────────────────────────────

/** OpenShift console–style resource kind badge (Plan, Namespace, etc.). */
const OpenShiftResourceBadge: React.FC<{ label: string; backgroundColor: string }> = ({
  label,
  backgroundColor,
}) => (
  <span
    aria-hidden
    style={{
      backgroundColor,
      borderRadius: '20px',
      color: 'var(--pf-t--color--white)',
      display: 'inline-block',
      flexShrink: 0,
      fontSize: '14px',
      fontWeight: 600,
      lineHeight: '20px',
      minWidth: 20,
      height: 20,
      padding: '0 6px',
      textAlign: 'center',
    }}
  >
    {label}
  </span>
);

/** OpenShift console–style resource label for Plan resources. */
export const PlanResourceBadge: React.FC = () => (
  <OpenShiftResourceBadge label="P" backgroundColor="#2b9af3" />
);

const NamespaceResourceBadge: React.FC = () => (
  <OpenShiftResourceBadge label="NS" backgroundColor="#1e4f18" />
);

// ─── Scope cell (cluster / namespace) with multi-target tooltip ───────────────

const PlanScopeCell: React.FC<{
  scope?: string;
  scopeColumnLabel: 'Cluster' | 'Namespace';
  scopeTargets: string[];
}> = ({ scope, scopeColumnLabel, scopeTargets }) => {
  const label = scope ?? '—';
  const showTooltip = scopeColumnLabel === 'Cluster' && scopeTargets.length > 1;

  if (scopeColumnLabel === 'Namespace') {
    return (
      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} flexWrap={{ default: 'nowrap' }}>
        <FlexItem>
          <NamespaceResourceBadge />
        </FlexItem>
        <FlexItem style={{ minWidth: 0, wordBreak: 'break-word' }}>{label}</FlexItem>
      </Flex>
    );
  }

  if (!showTooltip) {
    return <>{label}</>;
  }

  const tooltipContent = scopeTargets.join(', ');
  const ariaLabel = `${label}. All clusters: ${tooltipContent}`;

  return (
    <Tooltip content={tooltipContent} position="top">
      <span tabIndex={0} aria-label={ariaLabel} style={{ cursor: 'help' }}>
        {label}
      </span>
    </Tooltip>
  );
};

// ─── Table column header with informational popover ───────────────────────────

const PLANS_TABLE_HEADER_TH_STYLE: React.CSSProperties = {
  verticalAlign: 'top',
};

const PLANS_TABLE_HEADER_POPOVER_CONTENT_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--pf-t--global--spacer--xs)',
  lineHeight: 'var(--pf-t--global--line-height--body)',
  whiteSpace: 'nowrap',
};

const PLANS_TABLE_HEADER_POPOVER_BUTTON_STYLE: React.CSSProperties = {
  padding: 0,
  height: '1em',
  minHeight: 'unset',
  display: 'inline-flex',
  alignItems: 'center',
};

const PlansTableColumnHeader: React.FC<{
  label: string;
  popoverHeader: string;
  popoverBody: string;
  ariaLabel: string;
}> = ({ label, popoverHeader, popoverBody, ariaLabel }) => (
  <span style={PLANS_TABLE_HEADER_POPOVER_CONTENT_STYLE}>
    {label}
    <Popover headerContent={popoverHeader} bodyContent={popoverBody} position="top">
      <Button
        variant="plain"
        aria-label={ariaLabel}
        icon={<HelpIcon />}
        style={PLANS_TABLE_HEADER_POPOVER_BUTTON_STYLE}
      />
    </Popover>
  </span>
);

// ─── Core stateless table renderer ───────────────────────────────────────────

const PlanRowActionsMenu: React.FC<{ planId: string; planName: string; onDelete: (planId: string) => void }> = ({
  planId,
  planName,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown
      isOpen={isOpen}
      onSelect={() => setIsOpen(false)}
      onOpenChange={setIsOpen}
      popperProps={{ position: 'right' }}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          variant="plain"
          isExpanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          aria-label={`Actions for ${planName}`}
        >
          <EllipsisVIcon />
        </MenuToggle>
      )}
    >
      <DropdownList>
        <DropdownItem
          key="delete-plan"
          isDanger
          onClick={() => {
            onDelete(planId);
            setIsOpen(false);
          }}
        >
          Delete plan
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

interface PlansTableCoreProps {
  rows: PlanRow[];
  ariaLabel: string;
  scopeColumnLabel: 'Cluster' | 'Namespace';
  onReviewPlan: (plan: PlanRow) => void;
  onDeletePlan: (planId: string) => void;
  isAgenticAutomationEnabled: boolean;
  /** When true, granular observability telemetry domains are coalesced to "Observability" in the cell badge. */
  mapObservabilityDomains?: boolean;
  /** Global Agentic plans list only — domain-scoped lists (e.g. Troubleshooting plans) omit this column. */
  showTriggerDomainColumn?: boolean;
}

export const PlansTableCore: React.FC<PlansTableCoreProps> = ({
  rows,
  ariaLabel,
  scopeColumnLabel,
  onReviewPlan,
  onDeletePlan,
  isAgenticAutomationEnabled,
  mapObservabilityDomains = false,
  showTriggerDomainColumn = true,
}) => (
  <Table
    aria-label={ariaLabel}
    className="ols-plans-table"
    style={{
      tableLayout: 'fixed',
      width: '100%',
      opacity: isAgenticAutomationEnabled ? 1 : 0.55,
      transition: 'opacity 200ms ease',
    }}
  >
    <Thead>
      <Tr>
        <Th style={{ width: showTriggerDomainColumn ? '22%' : '28%', ...PLANS_TABLE_HEADER_TH_STYLE }}>Name</Th>
        <Th style={{ width: showTriggerDomainColumn ? '14%' : '16%', ...PLANS_TABLE_HEADER_TH_STYLE }}>{scopeColumnLabel}</Th>
        {showTriggerDomainColumn ? (
          <Th style={{ width: '14%', ...PLANS_TABLE_HEADER_TH_STYLE }}>Trigger domain</Th>
        ) : null}
        <Th style={{ width: showTriggerDomainColumn ? '12%' : '14%', ...PLANS_TABLE_HEADER_TH_STYLE }}>Status</Th>
        <Th style={{ width: showTriggerDomainColumn ? '12%' : '14%', ...PLANS_TABLE_HEADER_TH_STYLE }}>Tokens consumed</Th>
        <Th style={{ width: showTriggerDomainColumn ? '12%' : '14%', ...PLANS_TABLE_HEADER_TH_STYLE }}>Created</Th>
        <Th screenReaderText="Actions" />
      </Tr>
    </Thead>

    <Tbody>
      {rows.map((row) => (
        <Tr key={row.id} style={{ verticalAlign: 'middle' }}>
          <Td dataLabel="Name" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} flexWrap={{ default: 'nowrap' }}>
              <FlexItem>
                <PlanResourceBadge />
              </FlexItem>
              <FlexItem style={{ flex: '1 1 auto', minWidth: 0 }}>
                <Button
                  variant="link"
                  isInline
                  isDisabled={!isAgenticAutomationEnabled}
                  onClick={() => onReviewPlan(row)}
                  style={{ fontWeight: 400, textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word' }}
                >
                  {row.name ?? row.id}
                </Button>
              </FlexItem>
            </Flex>
          </Td>

          <Td dataLabel={scopeColumnLabel}>
            <PlanScopeCell
              scope={row.scope}
              scopeColumnLabel={scopeColumnLabel}
              scopeTargets={scopeColumnLabel === 'Cluster' ? row.drawerTargets : []}
            />
          </Td>

          {showTriggerDomainColumn ? (
            <Td dataLabel="Trigger domain" className="ols-plans-trigger-domain-cell">
              <TriggerDomainCell domain={row.triggerDomain} mapObservabilityDomains={mapObservabilityDomains} />
            </Td>
          ) : null}

          <Td dataLabel="Status">
            <StatusLabel status={row.status} terminatedAt={row.terminatedAt} />
          </Td>

          <Td dataLabel="Tokens consumed">
            <PlanTokensConsumedCell row={row} />
          </Td>

          <Td dataLabel="Created">
            {row.createdAt ? (
              <time dateTime={row.createdAt}>{formatPlanCreatedAt(row.createdAt)}</time>
            ) : (
              '—'
            )}
          </Td>
          <Td dataLabel="Actions" modifier="fitContent" style={{ textAlign: 'right' }}>
            <PlanRowActionsMenu
              planId={row.id}
              planName={row.name ?? row.id}
              onDelete={onDeletePlan}
            />
          </Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
);

// ─── Plans table (pagination + filters + expand state) ───────────────────────

const DEFAULT_PER_PAGE = 10;

interface PlansTableProps {
  onReviewPlan: (plan: PlanRow) => void;
  onDeletePlan: (planId: string) => void;
  rows: PlanRow[];
  isSingleCluster: boolean;
  isAgenticAutomationEnabled: boolean;
}

const PlansTable: React.FC<PlansTableProps> = ({
  onReviewPlan,
  onDeletePlan,
  rows,
  isSingleCluster,
  isAgenticAutomationEnabled,
}) => {
  const plansFilter = usePlansFilterState({ includeTriggerDomainFilter: true, mapObservabilityDomains: true });

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);

  const filteredRows = useMemo(
    () => plansFilter.filterRows(rows),
    [rows, plansFilter.filterRows],
  );

  useEffect(() => {
    setPage(1);
  }, [
    filteredRows.length,
    plansFilter.searchInputValue,
    plansFilter.searchCategory,
    plansFilter.statusFilters,
    plansFilter.triggerDomainFilters,
  ]);

  const totalItems = filteredRows.length;
  const start = (page - 1) * perPage;
  const paginatedRows = filteredRows.slice(start, start + perPage);

  const onSetPage = useCallback(
    (_evt: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number) => {
      setPage(newPage);
    },
    [],
  );

  const onPerPageSelect = useCallback(
    (
      _evt: React.MouseEvent | React.KeyboardEvent | MouseEvent,
      newPerPage: number,
      newPage: number,
    ) => {
      setPerPage(newPerPage);
      setPage(newPage);
    },
    [],
  );

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(totalItems / perPage));
    if (page > maxPage) setPage(maxPage);
  }, [perPage, totalItems, page]);

  const paginationProps = {
    itemCount: totalItems,
    page,
    perPage,
    onSetPage,
    onPerPageSelect,
    perPageOptions: [
      { title: '5', value: 5 },
      { title: '10', value: 10 },
      { title: '20', value: 20 },
    ],
  };

  return (
    <>
      <PlansFilterToolbar
        filterAriaLabel="Filter plans"
        statusOptions={AGENTIC_STATUS_FILTER_OPTIONS}
        includeTriggerDomainFilter
        pagination={<Pagination isCompact {...paginationProps} style={{ margin: 0 }} />}
        {...plansFilter}
      />

      {filteredRows.length === 0 ? (
        <EmptyState
          titleText="No plans match your active filters"
          icon={SearchIcon}
          headingLevel="h4"
          style={{ padding: 'var(--pf-t--global--spacer--2xl) 0' }}
        >
          <EmptyStateBody>
            No remediation plans match your current active filters in this cluster perspective.
          </EmptyStateBody>
          {plansFilter.hasActiveFilters && (
            <EmptyStateFooter>
              <EmptyStateActions>
                <Button variant="link" onClick={plansFilter.clearAllFilters}>
                  Clear Active Filters
                </Button>
              </EmptyStateActions>
            </EmptyStateFooter>
          )}
        </EmptyState>
      ) : (
        <>
          <PlansTableCore
            rows={paginatedRows}
            ariaLabel="Plans"
            scopeColumnLabel={isSingleCluster ? 'Namespace' : 'Cluster'}
            onReviewPlan={onReviewPlan}
            onDeletePlan={onDeletePlan}
            isAgenticAutomationEnabled={isAgenticAutomationEnabled}
            mapObservabilityDomains
          />
          <Pagination
            {...paginationProps}
            variant={PaginationVariant.bottom}
            style={{ marginTop: 'var(--pf-t--global--spacer--xs)' }}
          />
        </>
      )}
    </>
  );
};

// ─── Drawer: Remediation option card ─────────────────────────────────────────

const RemediationOptionCard: React.FC<{
  option: RemediationOption;
  index: number;
  plan: PlanRow;
  executionKillState?: { killedAt: string } | null;
  isSelected: boolean;
  isAgenticAutomationEnabled: boolean;
  onSelect: (id: string) => void;
  isExecutionPhase: boolean;
  isOptionLocked: boolean;
  showExecutionLog: boolean;
  rootCause?: { aggregatedFinding: string; rootCauseNarrative: string };
  onExecute?: () => void;
}> = ({
  option,
  index,
  plan,
  executionKillState,
  isSelected,
  isAgenticAutomationEnabled,
  onSelect,
  isExecutionPhase,
  showExecutionLog,
  isOptionLocked,
  rootCause,
  onExecute,
}) => {
  const isFirst = index === 0;
  const { status } = plan;
  const isTerminal         = status === 'Completed' || status === 'Failed';
  const isDenied           = status === 'Denied';
  const isEmergencyStopped = status === 'EmergencyStopped';
  const isExecutionKilled = Boolean(executionKillState);
  const isProposed = status === 'Proposed';
  const cardRootRef = React.useRef<HTMLDivElement>(null);
  const wasSelectedRef = React.useRef(isSelected);
  const activeExecutionLogLines = useMemo(
    () => buildActiveExecutionLogLines(plan, option),
    [plan, option],
  );
  const streamedExecutionLog = useStreamingExecutionLog(
    activeExecutionLogLines,
    showExecutionLog,
    isExecutionKilled,
  );

  // Reset inner states when the card is collapsed / deselected.
  useEffect(() => {
    if (!isSelected) {
      return;
    }
  }, [isSelected]);

  // Scroll only when the user selects a card — not when the first option is pre-selected on page load.
  useEffect(() => {
    const wasSelected = wasSelectedRef.current;
    wasSelectedRef.current = isSelected;

    if (!isSelected || wasSelected) {
      return;
    }
    setTimeout(() => {
      scrollRemediationSectionIntoView(cardRootRef.current);
    }, 100);
  }, [isSelected]);

  // Locked / in-flight: only the approved option is shown (handled by parent filter).
  if (isExecutionPhase && !isFirst) return null;

  const isInteractive = !isExecutionPhase && !isOptionLocked && !isTerminal;
  const isBodyVisible = isSelected || isTerminal;
  const cardId = `remediation-option-${option.id}`;

  const headerContent = (
    <Flex
      direction={{ default: 'column' }}
      alignItems={{ default: 'alignItemsFlexStart' }}
      gap={{ default: 'gapXs' }}
      id={`${cardId}-title`}
    >
      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }}>
        <span style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap' }}>
          Option {index + 1}
        </span>
        <Flex gap={{ default: 'gapXs' }} flexWrap={{ default: 'wrap' }}>
          {isTerminal && isFirst && (
            <Label color={status === 'Completed' ? 'green' : 'red'} isCompact variant="outline">
              {status === 'Completed' ? 'Executed' : 'Failed'}
            </Label>
          )}
          {isOptionLocked && isFirst && (
            <Label color="orange" variant="outline" isCompact>
              Approved option
            </Label>
          )}
          <Label color={reversibilityLabelColor(option.reversible)} variant="outline" isCompact>
            {formatReversibilityLabel(option.reversible)}
          </Label>
        </Flex>
      </Flex>
      <span
        style={{
          fontWeight: 600,
          fontSize: '14px',
          lineHeight: 1.4,
          whiteSpace: 'normal',
          wordBreak: 'break-word',
        }}
      >
        {option.title}
      </span>
    </Flex>
  );

  return (
    <div ref={cardRootRef}>
    <Card
      id={cardId}
      isSelectable={isInteractive}
      isSelected={isSelected}
      isExpanded={isBodyVisible}
      style={{ borderRadius: '16px' }}
    >
      <CardHeader
        selectableActions={
          isInteractive
            ? {
                selectableActionId: `radio-${option.id}`,
                selectableActionAriaLabelledby: `${cardId}-title`,
                name: `remedy-${plan.id}`,
                variant: 'single',
                onChange: (_event, checked) => {
                  if (checked) onSelect(option.id);
                },
                hasNoOffset: true,
              }
            : undefined
        }
        onExpand={
          isInteractive
            ? (_event, _id) => {
                onSelect(option.id);
              }
            : undefined
        }
        toggleButtonProps={
          isInteractive
            ? { 'aria-label': isSelected ? `Collapse option ${index + 1}` : `Expand option ${index + 1}` }
            : undefined
        }
      >
        {headerContent}
      </CardHeader>

      {isBodyVisible && (
        <CardBody className="ols-remediation-option-card__body">
          <Content
            component="p"
            className="ols-aio-text-subtle-sm"
            style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
          >
            {option.description}
          </Content>

          {(() => {
            const burn = getPlanTokenBurn(plan.id);
            const executionBurn =
              isTerminal && isFirst
                ? getOptionExecutionTokenBurn(plan.id, option.id) ?? burn.execution
                : undefined;
            const burnLine = formatTokenBurnPair(
              burn.analysis,
              executionBurn !== undefined && executionBurn > 0 ? executionBurn : undefined,
            );
            if (!burnLine) {
              return null;
            }
            return (
              <Content
                component="small"
                className="ols-aio-text-subtle-sm"
                style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
              >
                {burnLine}
              </Content>
            );
          })()}

          {/* Execution status (Executing only) */}
          {isExecutionPhase && isFirst && isExecutionKilled && (
            <Alert
              variant="danger"
              isInline
              title={`Execution terminated by operator at ${executionKillState?.killedAt}`}
              style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
            />
          )}

          {showExecutionLog && isFirst && !isExecutionKilled && (
            <>
              <Content
                component="small"
                style={{
                  display: 'block',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--pf-t--global--text--color--subtle)',
                  margin: '0 0 var(--pf-t--global--spacer--xs)',
                }}
              >
                Active execution log
              </Content>
              <ClipboardCopy
                isReadOnly
                isCode
                hoverTip="Copy"
                clickTip="Copied"
                style={{
                  fontFamily: 'var(--pf-t--global--font--family--mono)',
                  fontSize: '12px',
                  marginBottom: 'var(--pf-t--global--spacer--sm)',
                }}
              >
                {streamedExecutionLog}
              </ClipboardCopy>
            </>
          )}

          {/* ── Command executed by agent (read-only) ── */}
          {!isExecutionPhase && (
            <div style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
              <Content
                component="small"
                style={{
                  display: 'block',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--pf-t--global--text--color--subtle)',
                  marginBottom: 'var(--pf-t--global--spacer--xs)',
                }}
              >
                PROPOSED AGENT COMMAND
              </Content>
              <ClipboardCopy
                isReadOnly
                isCode
                hoverTip="Copy"
                clickTip="Copied"
                style={{ fontFamily: 'var(--pf-t--global--font--family--mono)', fontSize: '12px' }}
              >
                {option.rawCommands}
              </ClipboardCopy>
              {(onExecute || ((isProposed || isDenied || isEmergencyStopped) && rootCause)) && (
                <Flex
                  gap={{ default: 'gapSm' }}
                  flexWrap={{ default: 'wrap' }}
                  style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}
                >
                  {onExecute && (
                    <FlexItem>
                      <Button
                        variant="primary"
                        isDisabled={!isAgenticAutomationEnabled}
                        onClick={onExecute}
                      >
                        Execute remediation
                      </Button>
                    </FlexItem>
                  )}
                  {(isProposed || isDenied || isEmergencyStopped) && rootCause && (
                    <FlexItem>
                      <Button
                        variant="link"
                        icon={<DownloadIcon />}
                        onClick={() => downloadRemediationPlanMarkdown(plan, option, rootCause)}
                      >
                        Download plan
                      </Button>
                    </FlexItem>
                  )}
                </Flex>
              )}
            </div>
          )}

        </CardBody>
      )}
    </Card>
    </div>
  );
};

// ─── Drawer: locked section placeholders ─────────────────────────────────────

const LOCKED_BOX_STYLE: React.CSSProperties = {
  borderRadius: '16px',
  border: '1px dashed var(--pf-t--global--border--color--default)',
  padding: 'var(--pf-t--global--spacer--md)',
};

const RcaLockedPlaceholder: React.FC = () => (
  <div style={LOCKED_BOX_STYLE}>
    <Flex
      alignItems={{ default: 'alignItemsCenter' }}
      gap={{ default: 'gapSm' }}
      style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
    >
      <Spinner size="sm" aria-label="Analyzing root cause" />
      <Content component="p" className="ols-aio-text-subtle-sm" style={{ margin: 0, fontStyle: 'italic' }}>
        Analyzing infrastructure topology to isolate root cause…
      </Content>
    </Flex>
    <Skeleton width="85%" style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }} />
    <Skeleton width="65%" style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }} />
    <Skeleton width="75%" />
  </div>
);

const HubLockedPlaceholder: React.FC = () => (
  <div style={LOCKED_BOX_STYLE}>
    <Content
      component="p"
      className="ols-aio-text-subtle-sm"
      style={{ marginBottom: 'var(--pf-t--global--spacer--sm)', fontStyle: 'italic' }}
    >
      Remediation options will be synthesized following root cause confirmation.
    </Content>
    <Skeleton width="100%" style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }} />
    <Skeleton width="100%" style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }} />
    <Skeleton width="55%" />
  </div>
);

// ─── Drawer: post-mortem summary panel ───────────────────────────────────────

const PostMortemPanel: React.FC<{
  plan: PlanRow;
  verification?: import('../../context/PlanWorkflowContext').VerificationState | null;
  executionOptionId?: string;
  isMetricsExpanded?: boolean;
  onToggleMetrics?: (expanded: boolean) => void;
  isLogsExpanded?: boolean;
  onToggleLogs?: (expanded: boolean) => void;
}> = ({ plan, verification, executionOptionId, isMetricsExpanded, onToggleMetrics, isLogsExpanded, onToggleLogs }) => {
  const [localShowLogs, setLocalShowLogs] = useState(false);
  const [logCategory, setLogCategory] = useState<'execution' | 'verification'>('execution');
  const [logQuery, setLogQuery] = useState('');
  const [isLogCatOpen, setIsLogCatOpen] = useState(false);
  const [failureLogCategory, setFailureLogCategory] = useState<'trace' | 'execution'>('trace');
  const [isFailureLogCatOpen, setIsFailureLogCatOpen] = useState(false);
  // Fall back to a synthesised post-mortem for plans executed live in this session.
  const postMortem = PLAN_POSTMORTEM[plan.id] ?? generatePostMortem(plan);

  // When toggle props are supplied the metrics section is collapsible; otherwise
  // the full panel is rendered statically (e.g. for plans already in terminal state).
  const hasToggle = isMetricsExpanded !== undefined && onToggleMetrics !== undefined;
  const hasLogsToggle = isLogsExpanded !== undefined && onToggleLogs !== undefined;
  const showLogs = hasLogsToggle ? isLogsExpanded! : localShowLogs;
  const toggleLogs = hasLogsToggle ? onToggleLogs! : setLocalShowLogs;

  if (postMortem.type === 'success') {
    const sectionLabel = (text: string) => (
      <Content
        component="small"
        style={{
          display: 'block',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--pf-t--global--text--color--subtle)',
          marginBottom: 'var(--pf-t--global--spacer--xs)',
          marginTop: 'var(--pf-t--global--spacer--md)',
        }}
      >
        {text}
      </Content>
    );

    const metricsBlock = (
      <>
        {/* Section A — Contextual Evidence */}
        {sectionLabel('Contextual Evidence')}
        <DescriptionList isHorizontal isAutoColumnWidths isCompact>
          {postMortem.rootCauseSummary && (
            <DescriptionListGroup>
              <DescriptionListTerm>Original root cause</DescriptionListTerm>
              <DescriptionListDescription>{postMortem.rootCauseSummary}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {postMortem.remediationActionDelta && (
            <DescriptionListGroup>
              <DescriptionListTerm>Remediation delta</DescriptionListTerm>
              <DescriptionListDescription>{postMortem.remediationActionDelta}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
        </DescriptionList>

        {/* Section B — Audit Trail */}
        {sectionLabel('Audit Trail')}
        <DescriptionList isHorizontal isAutoColumnWidths isCompact style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
          {postMortem.appliedAt && (
            <DescriptionListGroup>
              <DescriptionListTerm>Applied</DescriptionListTerm>
              <DescriptionListDescription>{postMortem.appliedAt}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {postMortem.recoveredAt && (
            <DescriptionListGroup>
              <DescriptionListTerm>System restored</DescriptionListTerm>
              <DescriptionListDescription>{postMortem.recoveredAt}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {postMortem.executionDuration && (
            <DescriptionListGroup>
              <DescriptionListTerm>Execution time</DescriptionListTerm>
              <DescriptionListDescription>{postMortem.executionDuration}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {(() => {
            const burn = getPlanTokenBurn(plan.id);
            const executionFromOption = executionOptionId
              ? getOptionExecutionTokenBurn(plan.id, executionOptionId)
              : undefined;
            const execution = executionFromOption ?? burn.execution ?? 0;
            const burnLine = formatTokenBurnPair(burn.analysis, execution > 0 ? execution : undefined);
            if (!burnLine) {
              return null;
            }
            return (
              <DescriptionListGroup>
                <DescriptionListTerm>Token burn</DescriptionListTerm>
                <DescriptionListDescription>{burnLine}</DescriptionListDescription>
              </DescriptionListGroup>
            );
          })()}
          {verification && (
            <>
              <DescriptionListGroup>
                <DescriptionListTerm>Verification</DescriptionListTerm>
                <DescriptionListDescription>
                  {verification.outcome === 'passed' ? 'Passed' : verification.outcome === 'failed' ? 'Failed' : '—'}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Verification attempt</DescriptionListTerm>
                <DescriptionListDescription>
                  {verification.attempt} of {verification.maxAttempts}
                </DescriptionListDescription>
              </DescriptionListGroup>
            </>
          )}
          {postMortem.gitCommitRef && (
            <DescriptionListGroup>
              <DescriptionListTerm>Git commit</DescriptionListTerm>
              <DescriptionListDescription>
                <Button
                  variant="link"
                  isInline
                  style={{ fontFamily: 'var(--pf-t--global--font--family--mono)', fontSize: '13px', padding: 0 }}
                >
                  #{postMortem.gitCommitRef}
                </Button>
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
        </DescriptionList>
      </>
    );

    return (
      <>
        {hasToggle ? (
          /* ── Inline post-execution: flat layout, no container ── */
          <>
            <Divider style={{ margin: `var(--pf-t--global--spacer--sm) 0` }} />

            {/* Collapsible metrics toggle */}
            <Button
              variant="link"
              isInline
              onClick={() => onToggleMetrics!(!isMetricsExpanded)}
              icon={
                <AngleRightIcon
                  style={{
                    transform: isMetricsExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 150ms ease',
                  }}
                />
              }
              style={{ padding: 0, fontSize: '14px', marginBottom: isMetricsExpanded ? 'var(--pf-t--global--spacer--sm)' : 0 }}
            >
                  {isMetricsExpanded ? 'Hide execution summary' : 'View execution summary'}
            </Button>

            {/* Collapsible metrics content (Sections A, B, C) */}
            {isMetricsExpanded && (
              <div style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                {metricsBlock}
              </div>
            )}

            <Divider style={{ margin: `var(--pf-t--global--spacer--sm) 0` }} />

            {/* Logs — collapsible with category selector and search */}
            <div style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
              <Button
                variant="link"
                isInline
                onClick={() => toggleLogs(!showLogs)}
                icon={
                  <AngleRightIcon
                    style={{
                      transform: showLogs ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 150ms ease',
                    }}
                  />
                }
                style={{ padding: 0, fontSize: '14px', marginBottom: showLogs ? 'var(--pf-t--global--spacer--xs)' : 0 }}
              >
                {showLogs ? 'Hide logs' : 'View logs'}
              </Button>
              {showLogs && (
                <div style={{ marginTop: 'var(--pf-t--global--spacer--xs)' }}>
                  <Flex gap={{ default: 'gapSm' }} style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }}>
                    <FlexItem>
                      <Dropdown
                        isOpen={isLogCatOpen}
                        onOpenChange={setIsLogCatOpen}
                        onSelect={(_e, val) => {
                          setLogCategory(val as 'execution' | 'verification');
                          setIsLogCatOpen(false);
                        }}
                        toggle={(ref) => (
                          <MenuToggle ref={ref} onClick={() => setIsLogCatOpen(!isLogCatOpen)} isExpanded={isLogCatOpen}>
                            {logCategory === 'execution' ? 'Execution' : 'Verification'}
                          </MenuToggle>
                        )}
                      >
                        <DropdownList>
                          <DropdownItem value="execution">Execution logs</DropdownItem>
                          <DropdownItem value="verification">Verification logs</DropdownItem>
                        </DropdownList>
                      </Dropdown>
                    </FlexItem>
                    <FlexItem grow={{ default: 'grow' }}>
                      <SearchInput
                        value={logQuery}
                        onChange={(_e, val) => setLogQuery(val)}
                        onClear={() => setLogQuery('')}
                        placeholder="Search logs..."
                      />
                    </FlexItem>
                  </Flex>
                  {(() => {
                    const raw = logCategory === 'execution'
                      ? (postMortem.rawLog ?? '')
                      : generateVerificationLogs(plan.id);
                    const displayed = logQuery.trim()
                      ? raw.split('\n').filter(l => l.toLowerCase().includes(logQuery.toLowerCase())).join('\n')
                      : raw;
                    return (
                      <ClipboardCopy
                        variant={ClipboardCopyVariant.expansion}
                        isReadOnly
                        isCode
                        style={{ fontFamily: 'var(--pf-t--global--font--family--mono)', fontSize: '12px' }}
                      >
                        {displayed}
                      </ClipboardCopy>
                    );
                  })()}
                </div>
              )}
            </div>
          </>
        ) : (
          /* ── Terminal drawer view: bordered card ── */
          <div
            style={{
              borderRadius: '16px',
              border: '1px solid var(--pf-t--global--color--status--success--default)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: 'var(--pf-t--global--spacer--md)' }}>
              <Flex
                alignItems={{ default: 'alignItemsCenter' }}
                gap={{ default: 'gapSm' }}
                style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
              >
                {status === 'Failed'
                  ? <ExclamationCircleIcon style={{ color: 'var(--pf-t--global--color--status--danger--default)' }} />
                  : <CheckCircleIcon style={{ color: 'var(--pf-t--global--color--status--success--default)' }} />
                }
                <Title headingLevel="h5" size="md">Execution summary</Title>
              </Flex>

              <Divider style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }} />

              {metricsBlock}

              <Divider style={{ margin: `var(--pf-t--global--spacer--md) 0` }} />

              {/* Logs */}
              <div style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                <Button
                  variant="link"
                  isInline
                  onClick={() => toggleLogs(!showLogs)}
                  icon={
                    <AngleRightIcon
                      style={{
                        transform: showLogs ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 150ms ease',
                      }}
                    />
                  }
                  style={{ padding: 0, fontSize: '14px', marginBottom: showLogs ? 'var(--pf-t--global--spacer--xs)' : 0 }}
                >
                  {showLogs ? 'Hide logs' : 'View logs'}
                </Button>
                {showLogs && (
                  <div style={{ marginTop: 'var(--pf-t--global--spacer--xs)' }}>
                    <Flex gap={{ default: 'gapSm' }} style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }}>
                      <FlexItem>
                        <Dropdown
                          isOpen={isLogCatOpen}
                          onOpenChange={setIsLogCatOpen}
                          onSelect={(_e, val) => {
                            setLogCategory(val as 'execution' | 'verification');
                            setIsLogCatOpen(false);
                          }}
                          toggle={(ref) => (
                            <MenuToggle ref={ref} onClick={() => setIsLogCatOpen(!isLogCatOpen)} isExpanded={isLogCatOpen}>
                              {logCategory === 'execution' ? 'Execution' : 'Verification'}
                            </MenuToggle>
                          )}
                        >
                          <DropdownList>
                            <DropdownItem value="execution">Execution logs</DropdownItem>
                            <DropdownItem value="verification">Verification logs</DropdownItem>
                          </DropdownList>
                        </Dropdown>
                      </FlexItem>
                      <FlexItem grow={{ default: 'grow' }}>
                        <SearchInput
                          value={logQuery}
                          onChange={(_e, val) => setLogQuery(val)}
                          onClear={() => setLogQuery('')}
                          placeholder="Search logs..."
                        />
                      </FlexItem>
                    </Flex>
                    {(() => {
                      const raw = logCategory === 'execution'
                        ? (postMortem.rawLog ?? '')
                        : generateVerificationLogs(plan.id);
                      const displayed = logQuery.trim()
                        ? raw.split('\n').filter(l => l.toLowerCase().includes(logQuery.toLowerCase())).join('\n')
                        : raw;
                      return (
                        <ClipboardCopy
                          variant={ClipboardCopyVariant.expansion}
                          isReadOnly
                          isCode
                          style={{ fontFamily: 'var(--pf-t--global--font--family--mono)', fontSize: '12px' }}
                        >
                          {displayed}
                        </ClipboardCopy>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div
      style={{
        borderRadius: '16px',
        border: '1px solid var(--pf-t--global--color--status--danger--default)',
      }}
    >
      <Stack hasGutter style={{ padding: 'var(--pf-t--global--spacer--md)' }}>
        {/* ── Header ── */}
        <StackItem>
          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
            <ExclamationCircleIcon color="var(--pf-t--global--color--status--danger--default)" />
            <Title headingLevel="h5" size="md">Critical Automation Failure</Title>
          </Flex>
        </StackItem>

        <StackItem><Divider /></StackItem>

        {/* ── Failure reason ── */}
        {postMortem.failureReason && (
          <StackItem>
            <Content component="p" style={{ margin: 0 }}>
              {postMortem.failureReason}
            </Content>
          </StackItem>
        )}

        <StackItem><Divider /></StackItem>

        {/* ── Logs (traces + execution) ── */}
        <StackItem>
          <Button
            variant="link"
            isInline
            onClick={() => toggleLogs(!showLogs)}
            icon={
              <AngleRightIcon
                style={{
                  transform: showLogs ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 150ms ease',
                }}
              />
            }
            style={{ padding: 0, fontSize: '14px', marginBottom: showLogs ? 'var(--pf-t--global--spacer--xs)' : 0 }}
          >
            {showLogs ? 'Hide logs' : 'View logs'}
          </Button>
          {showLogs && (
            <div style={{ marginTop: 'var(--pf-t--global--spacer--xs)' }}>
              <Flex gap={{ default: 'gapSm' }} style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }}>
                <FlexItem>
                  <Dropdown
                    isOpen={isFailureLogCatOpen}
                    onOpenChange={setIsFailureLogCatOpen}
                    onSelect={(_e, val) => {
                      setFailureLogCategory(val as 'trace' | 'execution');
                      setIsFailureLogCatOpen(false);
                    }}
                    toggle={(ref) => (
                      <MenuToggle ref={ref} onClick={() => setIsFailureLogCatOpen(!isFailureLogCatOpen)} isExpanded={isFailureLogCatOpen}>
                        {failureLogCategory === 'trace' ? 'Traces' : 'Execution logs'}
                      </MenuToggle>
                    )}
                  >
                    <DropdownList>
                      <DropdownItem value="trace">Traces</DropdownItem>
                      <DropdownItem value="execution">Execution logs</DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </FlexItem>
                <FlexItem grow={{ default: 'grow' }}>
                  <SearchInput
                    value={logQuery}
                    onChange={(_e, val) => setLogQuery(val)}
                    onClear={() => setLogQuery('')}
                    placeholder="Search logs..."
                  />
                </FlexItem>
              </Flex>
              {(() => {
                const raw = failureLogCategory === 'trace'
                  ? (postMortem.failureTrace ?? '')
                  : (postMortem.rawLog ?? '');
                const displayed = logQuery.trim()
                  ? raw.split('\n').filter(l => l.toLowerCase().includes(logQuery.toLowerCase())).join('\n')
                  : raw;
                return (
                  <ClipboardCopy
                    variant={ClipboardCopyVariant.expansion}
                    isReadOnly
                    isCode
                    style={{ fontFamily: 'var(--pf-t--global--font--family--mono)', fontSize: '12px' }}
                  >
                    {displayed}
                  </ClipboardCopy>
                );
              })()}
            </div>
          )}
        </StackItem>
      </Stack>
    </div>
  );
};

// ─── Drawer: Plan review panel body ──────────────────────────────────────────

/** Match drill-down layout breakpoint for full-width remediation content. */
const REMEDIATION_AUTO_SCROLL_MAX_VIEWPORT = 1100;
const REMEDIATION_SCROLL_PADDING = 16;

const getRemediationScrollParent = (element: HTMLElement): HTMLElement => {
  let parent = element.parentElement;
  while (parent) {
    const { overflowY } = window.getComputedStyle(parent);
    if (overflowY === 'auto' || overflowY === 'scroll') {
      return parent;
    }
    parent = parent.parentElement;
  }
  return document.documentElement;
};

const isRemediationConfinedLayout = (scrollParent: HTMLElement): boolean => {
  if (window.innerWidth <= REMEDIATION_AUTO_SCROLL_MAX_VIEWPORT) {
    return true;
  }
  // Side drawer and other nested scroll regions (not only narrow viewports).
  return (
    scrollParent !== document.documentElement &&
    scrollParent !== document.body &&
    scrollParent.scrollHeight > scrollParent.clientHeight + 1
  );
};

const scrollWithinParent = (
  target: HTMLElement,
  scrollParent: HTMLElement,
  { alignStart = false }: { alignStart?: boolean } = {},
) => {
  const targetRect = target.getBoundingClientRect();
  const parentRect = scrollParent.getBoundingClientRect();
  const padding = REMEDIATION_SCROLL_PADDING;

  if (
    scrollParent === document.documentElement ||
    scrollParent === document.body
  ) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  if (alignStart || targetRect.top < parentRect.top + padding) {
    scrollParent.scrollBy({
      top: targetRect.top - parentRect.top - padding,
      behavior: 'smooth',
    });
    return;
  }

  if (targetRect.bottom > parentRect.bottom - padding) {
    scrollParent.scrollBy({
      top: targetRect.bottom - parentRect.bottom + padding,
      behavior: 'smooth',
    });
  }
};

/** Scroll expanded workflow content into view when it extends outside the scroll container. */
const scrollRemediationSectionIntoView = (
  target: HTMLElement | null,
  { force = false }: { force?: boolean } = {},
) => {
  if (!target) {
    return;
  }

  const runScroll = () => {
    const scrollParent = getRemediationScrollParent(target);
    if (!force && !isRemediationConfinedLayout(scrollParent)) {
      return;
    }

    const targetRect = target.getBoundingClientRect();
    const parentRect = scrollParent.getBoundingClientRect();
    const padding = REMEDIATION_SCROLL_PADDING;
    const extendsBelow = targetRect.bottom > parentRect.bottom - padding;
    const extendsAbove = targetRect.top < parentRect.top + padding;

    if (!force && !extendsBelow && !extendsAbove) {
      return;
    }

    scrollWithinParent(target, scrollParent, { alignStart: force });
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(runScroll);
  });
};

// ─── Escalated plan: presentation-only playbook lookup ───────────────────────
// Maps plan IDs to operator runbook commands. Does not touch mock data files.

const ESCALATED_PLAN_PLAYBOOKS: Record<string, { title: string; command: string }> = {
  'ingress-controller-escalated': {
    title: 'Increase openshift-ingress namespace resource quota',
    command:
      "oc patch resourcequota default -n openshift-ingress --type merge \\\n  -p '{\"spec\":{\"hard\":{\"pods\":\"20\",\"requests.cpu\":\"4\",\"requests.memory\":\"8Gi\"}}}'",
  },
};

const DEFAULT_ESCALATION_PLAYBOOK = {
  title: 'Review escalated plan and apply manual remediation',
  command: 'oc describe proposal <plan-name> -n openshift-lightspeed',
};

/** Generates deterministic simulated analysis log lines for a plan's RCA section. */
function generateAnalysisLogs(planId: string, finding: string, narrative: string): string {
  const h = planId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const mm = String(10 + (h % 49)).padStart(2, '0');
  const ts = (offset: number) => {
    const rawSec = (h % 60) + offset;
    const m = String(10 + (h % 49) + Math.floor(rawSec / 60)).padStart(2, '0');
    const s = String(rawSec % 60).padStart(2, '0');
    return `2026-07-02T08:${m}:${s}.000000000Z`;
  };
  void mm;
  const clip = (str: string, len = 90) => (str.length > len ? str.slice(0, len) + '...' : str);
  return [
    `${ts(0)}  INFO [analysis] Initializing investigation pipeline — plan_id=${planId}`,
    `${ts(2)}  INFO [signals]  Querying Prometheus TSDB for correlated alert signals...`,
    `${ts(4)}  INFO [signals]  ${clip(finding)}`,
    `${ts(7)}  INFO [model]    Dispatching signal corpus to LLM reasoning engine`,
    `${ts(9)}  INFO [model]    Hypothesis generation in progress (temperature=0.2, max_tokens=1024)`,
    `${ts(12)} INFO [model]    Root cause hypothesis locked — confidence=0.87`,
    `${ts(14)} INFO [rca]      ${clip(narrative)}`,
    `${ts(16)} INFO [rca]      Contributing factor graph traversal complete: 3 factors identified`,
    `${ts(17)} INFO [proposal] Root cause analysis complete. Generating remediation proposal...`,
    `${ts(19)} INFO [proposal] Proposal ready — plan_id=${planId} is available for review.`,
  ].join('\n');
}

/** Generates deterministic simulated verification log lines for the post-execution logs panel. */
function generateVerificationLogs(planId: string): string {
  const h = planId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const ts = (offset: number) => {
    const rawSec = (h % 60) + 20 + offset;
    const m = String(10 + (h % 49) + Math.floor(rawSec / 60)).padStart(2, '0');
    const s = String(rawSec % 60).padStart(2, '0');
    return `2026-07-02T08:${m}:${s}.000000000Z`;
  };
  return [
    `${ts(0)}  INFO [verify]   Starting post-execution verification — plan_id=${planId}`,
    `${ts(2)}  INFO [verify]   Waiting for reconciliation loop to stabilise (10s)...`,
    `${ts(12)} INFO [verify]   Querying Prometheus for remediation metric delta...`,
    `${ts(14)} INFO [verify]   Alert condition re-evaluated — checking firing state`,
    `${ts(16)} INFO [verify]   Metric sample collected: t=0s post-execution`,
    `${ts(19)} INFO [verify]   Metric sample collected: t=5s post-execution`,
    `${ts(24)} INFO [verify]   Metric sample collected: t=10s post-execution`,
    `${ts(27)} INFO [verify]   Alert resolved — firing=false, pending=0`,
    `${ts(28)} INFO [verify]   Verification PASSED — remediation confirmed effective.`,
    `${ts(29)} INFO [verify]   plan_id=${planId} transitioned → Completed`,
  ].join('\n');
}

export const RemediationBlueprintPanel: React.FC<{ plan: PlanRow; onRejectPlan?: () => void }> = ({ plan, onRejectPlan }) => {
  const status = plan.status;
  const isAnalyzing = status === 'Analyzing';
  const isProposed = status === 'Proposed';
  const isAcknowledged = status === 'Acknowledged';
  const isAnalysisOnly = plan.planKind === 'analysis-only';
  const isExecuting = status === 'Executing';
  const isVerifying = status === 'Verifying';
  const isPlanAborted = status === 'Plan aborted';
  const isEscalating = status === 'Escalating';
  const isEscalated  = status === 'Escalated';
  const isExecutionPhase = isExecuting || isPlanAborted;
  const isOptionLocked = isExecutionPhase || isVerifying;
  const isTerminal = status === 'Completed' || status === 'Failed';
  const isDenied           = status === 'Denied';
  const isEmergencyStopped = status === 'EmergencyStopped';
  const { activePerspective } = useActivePerspective();
  const isSingleCluster = activePerspective === 'Core platforms';
  const agentClusterId = resolveAgentCapabilitiesClusterId(isSingleCluster);
  const { isAgentActiveForCluster } = useAgenticCapabilities();
  const isAgenticAutomationEnabled = isAgentActiveForCluster(agentClusterId);
  const { registerPlanTermination } = usePlanTermination();
  const {
    getPlanWorkflow,
    executeRemediation,
    acknowledgePlan,
    startVerification,
    completeVerification,
  } = usePlanWorkflow();
  const workflow = getPlanWorkflow(plan.id);
  const [isStopAnalysisModalOpen, setIsStopAnalysisModalOpen] = useState(false);
  const [isStopExecutionModalOpen, setIsStopExecutionModalOpen] = useState(false);
  const [isExecutionRunning, setIsExecutionRunning] = useState(false);
  const [retryBanner, setRetryBanner] = useState<string | null>(null);
  const [isExecuteConfirmModalOpen, setIsExecuteConfirmModalOpen] = useState(false);
  const [showAnalysisLogs, setShowAnalysisLogs] = useState(false);
  const [analysisLogsQuery, setAnalysisLogsQuery] = useState('');

  const executionKillState =
    plan.status === 'Plan aborted' && plan.terminatedAt ? { killedAt: plan.terminatedAt } : null;

  const planTokenBurn = getPlanTokenBurn(plan.id);

  useEffect(() => {
    setIsExecutionRunning(false);
    setRetryBanner(null);
    setShowAnalysisLogs(false);
    setAnalysisLogsQuery('');
    setIsStopExecutionModalOpen(false);
  }, [plan.id]);

  useEffect(() => {
    if (!isExecuting) {
      setIsExecutionRunning(false);
      return;
    }
    setIsExecutionRunning(true);
    const timer = window.setTimeout(() => {
      startVerification(plan.id, VERIFICATION_CHECK_LINES);
      setIsExecutionRunning(false);
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [isExecuting, plan.id, startVerification, workflow.verification?.attempt]);

  const drawer = resolvePlanDrawerData(plan.id, PLAN_DRAWER_DATA[plan.id], isSingleCluster);
  const rcaVariant = plan.severity === 'critical' ? 'ols-aio-rca-box--critical' : 'ols-aio-rca-box--warning';
  const options = enrichRemediationOptionsWithConfidence(
    plan.id,
    applyScRemediationPatches(PLAN_REMEDIATION_OPTIONS[plan.id] ?? [], plan.id, isSingleCluster),
    drawer?.confidence,
  );
  const optionCount = options.length;
  const visibleOptionCount = isOptionLocked ? 1 : optionCount;
  const optionLabel = visibleOptionCount === 1 ? '1 remediation option' : `${visibleOptionCount} remediation options`;

  const [selectedOptionId, setSelectedOptionId] = useState<string>(options[0]?.id ?? '');

  useEffect(() => {
    if (workflow.executionApproval?.optionId) {
      setSelectedOptionId(workflow.executionApproval.optionId);
    }
  }, [workflow.executionApproval?.optionId]);

  const approvedOptionId = workflow.executionApproval?.optionId;
  const visibleOptions = useMemo(() => {
    if (isOptionLocked && approvedOptionId) {
      const approved = options.find((opt) => opt.id === approvedOptionId);
      return approved ? [approved] : options.slice(0, 1);
    }
    if (isExecutionPhase) {
      return options.slice(0, 1);
    }
    return options;
  }, [approvedOptionId, isExecutionPhase, isOptionLocked, options]);

  const terminalVisibleOptions = useMemo(() => {
    if (approvedOptionId) {
      const approved = options.find((opt) => opt.id === approvedOptionId);
      return approved ? [approved] : options.slice(0, 1);
    }
    return options.slice(0, 1);
  }, [approvedOptionId, options]);

  const selectedOption = visibleOptions.find((opt) => opt.id === selectedOptionId)
    ?? visibleOptions[0]
    ?? options.find((opt) => opt.id === selectedOptionId)
    ?? options[0];
  const selectedOptionIndex = workflow.executionApproval?.optionIndex
    ?? Math.max(0, options.findIndex((opt) => opt.id === selectedOption?.id));

  const verificationState = resolveVerificationState(plan.id, workflow.verification);
  const showStaticVerification = isVerifying && verificationState && !workflow.verification;

  const handleExecuteRemediation = () => {
    if (!selectedOption || !isAgenticAutomationEnabled) {
      return;
    }
    setRetryBanner(null);
    executeRemediation(plan.id, {
      optionIndex: selectedOptionIndex,
      optionId: selectedOption.id,
      optionTitle: selectedOption.title,
      maxAttempts: GLOBAL_APPROVAL_POLICY_MAX_ATTEMPTS,
    });
  };

  const handleAcknowledgePlan = () => {
    acknowledgePlan(plan.id);
  };

  const handleVerificationComplete = useCallback(() => {
    const verification = workflow.verification;
    if (!verification || verification.outcome) {
      return;
    }
    const shouldPass = verification.attempt >= verification.maxAttempts;
    const nextStatus = completeVerification(plan.id, shouldPass);
    if (!shouldPass && nextStatus === 'Executing') {
      setRetryBanner(
        `Verification failed — retrying execution (attempt ${verification.attempt + 1} of ${verification.maxAttempts})`,
      );
    }
  }, [completeVerification, plan.id, workflow.verification]);

  if (!drawer && !isEscalating) return null;

  const escalatedPlaybook = ESCALATED_PLAN_PLAYBOOKS[plan.id] ?? DEFAULT_ESCALATION_PLAYBOOK;

  const showExecutionLog = isExecutionPhase && (
    approvedOptionId ? selectedOptionId === approvedOptionId : selectedOptionIndex === 0
  );

  return (
    <Stack style={{ gap: '24px' }}>
      {/* ── Page heading + AI disclaimer ────────────────────────────────── */}
      <StackItem>
        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
          <AiExperienceIcon size={20} />
          <Title headingLevel="h3" size="lg" style={{ marginBottom: 0 }}>
            Agentic run details
          </Title>
        </Flex>
        <Content component="p" className="ols-ai-hub-page-disclaimer">
          Always review AI-generated content prior to use.
        </Content>
      </StackItem>

      {/* ── Section A: Root Cause Analysis ────────────────────────────── */}
      <StackItem>
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          gap={{ default: 'gapSm' }}
          style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
        >
          <Title headingLevel="h4" size="md" style={{ marginBottom: 0 }}>
            Root cause analysis (RCA)
          </Title>
          {!isAnalyzing && (
            <Label color="grey" variant="outline" isCompact>
              {formatOptionalTokenBurn(
                isPlanTokenBurnAvailable(planTokenBurn)
                  ? planTokenBurn.analysis
                  : simulateAnalysisTokenCount(plan.id),
                '(analysis)',
              )}
            </Label>
          )}
        </Flex>
          {isEscalating ? (
            <div
              style={LOCKED_BOX_STYLE}
              aria-live="polite"
              aria-label="Escalation status — root cause analysis unavailable"
            >
              <Flex
                alignItems={{ default: 'alignItemsCenter' }}
                gap={{ default: 'gapSm' }}
                style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
              >
                <ExclamationTriangleIcon
                  aria-hidden
                  style={{ color: 'var(--pf-t--global--color--status--warning--default)' }}
                />
                <Content
                  component="p"
                  className="ols-aio-text-subtle-sm"
                  style={{ margin: 0, fontStyle: 'italic' }}
                >
                  Root cause analysis unavailable — this plan has been escalated to a human operator.
                </Content>
              </Flex>
              <Skeleton width="85%" style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }} />
              <Skeleton width="65%" style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }} />
              <Skeleton width="75%" />
            </div>
          ) : isAnalyzing ? (
            <>
              <RcaLockedPlaceholder />
            </>
          ) : (
          <div className={`ols-aio-rca-box ${rcaVariant}`} style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
              <span className="ols-aio-text-overline">Detected Root Cause</span>
            </div>
            <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
              {drawer!.aggregatedFinding}
            </Content>
            <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
              {drawer!.rootCauseNarrative}
            </Content>

            <Divider style={{ margin: `var(--pf-t--global--spacer--sm) 0` }} />

            {/* View analysis logs toggle */}
            <div style={{ marginBottom: showAnalysisLogs ? 'var(--pf-t--global--spacer--xs)' : 0 }}>
              <Button
                variant="link"
                isInline
                onClick={() => setShowAnalysisLogs(!showAnalysisLogs)}
                icon={
                  <AngleRightIcon
                    style={{
                      transform: showAnalysisLogs ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 150ms ease',
                    }}
                  />
                }
                style={{ padding: 0, fontSize: '14px' }}
              >
                {showAnalysisLogs ? 'Hide analysis logs' : 'View analysis logs'}
              </Button>
            </div>

            {showAnalysisLogs && (() => {
              const rawLogs = generateAnalysisLogs(plan.id, drawer!.aggregatedFinding, drawer!.rootCauseNarrative);
              const displayLogs = analysisLogsQuery.trim()
                ? rawLogs.split('\n').filter(l => l.toLowerCase().includes(analysisLogsQuery.toLowerCase())).join('\n')
                : rawLogs;
              return (
                <div style={{ marginTop: 'var(--pf-t--global--spacer--xs)' }}>
                  <SearchInput
                    value={analysisLogsQuery}
                    onChange={(_evt, val) => setAnalysisLogsQuery(val)}
                    onClear={() => setAnalysisLogsQuery('')}
                    placeholder="Search logs..."
                    style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }}
                  />
                  <ClipboardCopy
                    variant={ClipboardCopyVariant.expansion}
                    isReadOnly
                    isCode
                    style={{ fontFamily: 'var(--pf-t--global--font--family--mono)', fontSize: '12px' }}
                  >
                    {displayLogs}
                  </ClipboardCopy>
                </div>
              );
            })()}

          </div>
          )}
      </StackItem>

      {/* ── Section C: Remediation Hub (or investigation-only) ─────────── */}
      <StackItem>
        {isAnalysisOnly ? (
          <>
            <Title headingLevel="h4" size="md" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
              Investigation findings
            </Title>
            <Alert
              variant="info"
              isInline
              title="Investigation-only proposal"
              style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
            >
              <Content component="p" style={{ margin: 0 }}>
                This cluster update controller proposal gathered structured health data only. No remediation
                options were generated — acknowledge after review to clear it from your active plans list.
              </Content>
            </Alert>
            {isAcknowledged ? (
              <Alert variant="success" isInline title="Plan acknowledged">
                <Content component="p" style={{ margin: 0 }}>
                  This investigation-only proposal has been marked as reviewed. No further action is required.
                </Content>
              </Alert>
            ) : (
              <Flex gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }}>
                <Button
                  variant="primary"
                  isDisabled={!isAgenticAutomationEnabled}
                  onClick={handleAcknowledgePlan}
                >
                  Acknowledge
                </Button>
                <Button
                  variant="secondary"
                  icon={<DownloadIcon />}
                  onClick={() =>
                    downloadAnalysisReportMarkdown(plan, {
                      aggregatedFinding: drawer!.aggregatedFinding,
                      rootCauseNarrative: drawer!.rootCauseNarrative,
                    })
                  }
                >
                  Download analysis report
                </Button>
              </Flex>
            )}
          </>
        ) : (
        <>
        <Flex
          direction={{ default: 'column' }}
          alignItems={{ default: 'alignItemsFlexStart' }}
          gap={{ default: 'gapXs' }}
          style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
        >
          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }}>
            <Title headingLevel="h4" size="md">Remediation hub</Title>
            {status === 'Completed' && (
              <Label
                color="green"
                isCompact
                icon={<CheckCircleIcon />}
              >
                Completed
              </Label>
            )}
            {status === 'Failed' && (
              <Label
                color="red"
                isCompact
                icon={<ExclamationCircleIcon />}
              >
                Failed
              </Label>
            )}
            {isEscalated && (
              <Label
                color="orange"
                isCompact
                icon={<ExclamationTriangleIcon />}
              >
                Escalated
              </Label>
            )}
            {isDenied && (
              <Label
                color="red"
                isCompact
                icon={<ExclamationCircleIcon />}
              >
                Denied
              </Label>
            )}
            {isEmergencyStopped && (
              <Label
                color="orange"
                isCompact
                icon={<ExclamationTriangleIcon />}
              >
                Emergency stopped
              </Label>
            )}
            {!isAnalyzing && !isTerminal && !isDenied && visibleOptionCount > 0 && (
              <Label color="grey" isCompact variant="outline">{optionLabel}</Label>
            )}
          </Flex>
          <WaitingApprovalPlanMeta plan={plan} />
        </Flex>
          {isEscalating ? (
            <div
              style={LOCKED_BOX_STYLE}
              aria-live="polite"
              aria-label="Remediation hub — escalation active"
            >
              <Content
                component="p"
                className="ols-aio-text-subtle-sm"
                style={{ marginBottom: 'var(--pf-t--global--spacer--sm)', fontStyle: 'italic' }}
              >
                Remediation options are unavailable while escalation is active. This plan has been
                forwarded to a human operator for manual intervention.
              </Content>
              <Skeleton width="100%" style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }} />
              <Skeleton width="100%" style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }} />
              <Skeleton width="55%" />
            </div>
          ) : isAnalyzing ? (
            <HubLockedPlaceholder />
          ) : isEscalated ? (
            <>
              <Alert
                variant="warning"
                isInline
                title="Remediation action required"
                style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
              >
                Automated execution failed after reaching the maximum retry limit. Manual operator
                intervention is required to resolve this escalation.
              </Alert>
              <div
                style={LOCKED_BOX_STYLE}
                aria-live="polite"
                aria-labelledby={`escalated-action-heading-${plan.id}`}
              >
                <div style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                  <span className="ols-aio-text-overline">Recommended action</span>
                </div>
                <Content
                  component="p"
                  style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
                >
                  {drawer?.remediationProposal}
                </Content>
                <Content
                  id={`escalated-action-heading-${plan.id}`}
                  component="small"
                  style={{
                    display: 'block',
                    marginBottom: 'var(--pf-t--global--spacer--xs)',
                    fontWeight: 600,
                  }}
                >
                  {escalatedPlaybook.title}
                </Content>
                <ClipboardCopy
                  isCode
                  variant={ClipboardCopyVariant.expansion}
                  isReadOnly
                  style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
                >
                  {escalatedPlaybook.command}
                </ClipboardCopy>
                <Button variant="link" icon={<DownloadIcon />} iconPosition="start"
                  onClick={() => downloadAnalysisReportMarkdown(plan, {
                    aggregatedFinding: drawer?.aggregatedFinding ?? '',
                    rootCauseNarrative: drawer?.rootCauseNarrative ?? '',
                  })}
                >
                  Download plan
                </Button>
              </div>
            </>
          ) : isEmergencyStopped ? (
            <>
              <Alert
                variant="warning"
                isInline
                title="Execution halted mid-flight"
                style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
              >
                This agentic run was stopped while execution was in progress. The cluster may be in
                a partially modified state. Review the proposed agent commands below and complete or
                roll back the operation manually during a scheduled maintenance window.
              </Alert>
              <Stack hasGutter>
                {options.map((opt) => {
                  const optionIndex = options.findIndex((o) => o.id === opt.id);
                  return (
                    <StackItem key={opt.id}>
                      <RemediationOptionCard
                        option={opt}
                        index={optionIndex}
                        plan={plan}
                        isSelected={selectedOptionId === opt.id}
                        isAgenticAutomationEnabled={isAgenticAutomationEnabled}
                        onSelect={setSelectedOptionId}
                        isExecutionPhase={false}
                        isOptionLocked={false}
                        showExecutionLog={false}
                        rootCause={{
                          aggregatedFinding: drawer!.aggregatedFinding,
                          rootCauseNarrative: drawer!.rootCauseNarrative,
                        }}
                      />
                    </StackItem>
                  );
                })}
              </Stack>
            </>
          ) : isDenied ? (
            <Stack hasGutter>
              {options.map((opt) => {
                const optionIndex = options.findIndex((o) => o.id === opt.id);
                return (
                  <StackItem key={opt.id}>
                    <RemediationOptionCard
                      option={opt}
                      index={optionIndex}
                      plan={plan}
                      isSelected={selectedOptionId === opt.id}
                      isAgenticAutomationEnabled={isAgenticAutomationEnabled}
                      onSelect={setSelectedOptionId}
                      isExecutionPhase={false}
                      isOptionLocked={false}
                      showExecutionLog={false}
                      rootCause={{
                        aggregatedFinding: drawer!.aggregatedFinding,
                        rootCauseNarrative: drawer!.rootCauseNarrative,
                      }}
                    />
                  </StackItem>
                );
              })}
            </Stack>
          ) : isTerminal ? (
            <>
              {terminalVisibleOptions.length > 0 && (
                <Stack hasGutter style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                  {terminalVisibleOptions.map((opt) => {
                    const optionIndex = options.findIndex((o) => o.id === opt.id);
                    return (
                      <StackItem key={opt.id}>
                        <RemediationOptionCard
                          option={opt}
                          index={optionIndex}
                          plan={plan}
                          isSelected
                          isAgenticAutomationEnabled={isAgenticAutomationEnabled}
                          onSelect={setSelectedOptionId}
                          isExecutionPhase={false}
                          isOptionLocked={false}
                          showExecutionLog={false}
                        />
                      </StackItem>
                    );
                  })}
                </Stack>
              )}
              <PostMortemPanel
                plan={plan}
                verification={workflow.verification}
                executionOptionId={workflow.executionApproval?.optionId}
              />
            </>
          ) : isVerifying && verificationState ? (
            <VerificationPanel
              verification={verificationState}
              isLive={Boolean(workflow.verification) && !showStaticVerification}
              onComplete={handleVerificationComplete}
            />
          ) : (
            <>
              {retryBanner && (
                <Alert variant="warning" isInline title={retryBanner} style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }} />
              )}

              {workflow.executionApproval && (isExecuting || isVerifying) && (
                <ProposalApprovalArtifact approval={workflow.executionApproval} />
              )}

              <div
                style={{
                  opacity: !isAgenticAutomationEnabled && !isExecutionPhase ? 0.55 : 1,
                  pointerEvents: !isAgenticAutomationEnabled && !isExecutionPhase ? 'none' : undefined,
                  transition: 'opacity 300ms ease',
                }}
              >
                <Stack hasGutter>
                  {visibleOptions.map((opt) => {
                    const optionIndex = options.findIndex((o) => o.id === opt.id);
                    return (
                      <StackItem key={opt.id}>
                        <RemediationOptionCard
                          option={opt}
                          index={optionIndex}
                          plan={plan}
                          executionKillState={executionKillState}
                          isSelected={isOptionLocked || selectedOptionId === opt.id}
                          isAgenticAutomationEnabled={isAgenticAutomationEnabled}
                          onSelect={setSelectedOptionId}
                          isExecutionPhase={isExecutionPhase}
                          isOptionLocked={isOptionLocked}
                          showExecutionLog={showExecutionLog && selectedOptionId === opt.id}
                          rootCause={{
                            aggregatedFinding: drawer!.aggregatedFinding,
                            rootCauseNarrative: drawer!.rootCauseNarrative,
                          }}
                          onExecute={isProposed ? () => { setSelectedOptionId(opt.id); setIsExecuteConfirmModalOpen(true); } : undefined}
                        />
                      </StackItem>
                    );
                  })}
                </Stack>
              </div>

              {isProposed && onRejectPlan && (
                <Flex style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
                  <FlexItem>
                    <Button variant="secondary" onClick={onRejectPlan}>
                      Deny run
                    </Button>
                  </FlexItem>
                </Flex>
              )}

              <Modal
                variant={ModalVariant.small}
                isOpen={isExecuteConfirmModalOpen}
                onClose={() => setIsExecuteConfirmModalOpen(false)}
                aria-labelledby="execute-remediation-confirm-title"
              >
                <ModalHeader title="Execute remediation?" labelId="execute-remediation-confirm-title" />
                <ModalBody>
                  <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                    You&apos;re about to run the automated script for Option {selectedOptionIndex + 1}:{' '}
                    <span style={{ fontWeight: 600 }}>{selectedOption?.title}</span>.
                  </Content>
                  <Content component="p" style={{ fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                    OpenShift Lightspeed uses AI technology to help generate this remediation plan. Always review AI-generated content prior to use.
                  </Content>
                </ModalBody>
                <ModalFooter>
                  <Button
                    variant="primary"
                    isDisabled={!isAgenticAutomationEnabled || isExecutionRunning}
                    isLoading={isExecutionRunning}
                    onClick={() => {
                      setIsExecuteConfirmModalOpen(false);
                      handleExecuteRemediation();
                    }}
                  >
                    Execute remediation
                  </Button>
                  <Button variant="link" onClick={() => setIsExecuteConfirmModalOpen(false)}>
                    Cancel
                  </Button>
                </ModalFooter>
              </Modal>
            </>
          )}
        </>
        )}
      </StackItem>

      {/* ── Stop execution action (Executing state only) ──────────────── */}
      {isExecutionPhase && !executionKillState && (
        <StackItem>
          <Button variant="danger" onClick={() => setIsStopExecutionModalOpen(true)}>
            Stop execution
          </Button>
          <Modal
            variant={ModalVariant.small}
            isOpen={isStopExecutionModalOpen}
            onClose={() => setIsStopExecutionModalOpen(false)}
            aria-labelledby="stop-plan-execution-title"
          >
            <ModalHeader title="Stop plan execution?" labelId="stop-plan-execution-title" />
            <ModalBody>
              This will instantly halt the agent&apos;s in-flight mutations on this cluster. Completed steps will
              remain in their current state. This action cannot be undone.
            </ModalBody>
            <ModalFooter>
              <Button
                variant="danger"
                onClick={() => {
                  registerPlanTermination(plan.id, formatExecutionKillTimestamp(new Date()));
                  setIsStopExecutionModalOpen(false);
                }}
              >
                Yes, stop execution
              </Button>
              <Button variant="link" onClick={() => setIsStopExecutionModalOpen(false)}>
                Cancel
              </Button>
            </ModalFooter>
          </Modal>
        </StackItem>
      )}

      {/* ── Stop analysis action (Analyzing state only) ──────────────── */}
      {isAnalyzing && (
        <StackItem>
          <Button variant="danger" onClick={() => setIsStopAnalysisModalOpen(true)}>
            Stop analysis
          </Button>
          <Modal
            variant={ModalVariant.small}
            isOpen={isStopAnalysisModalOpen}
            onClose={() => setIsStopAnalysisModalOpen(false)}
            aria-labelledby="stop-plan-analysis-title"
          >
            <ModalHeader title="Stop analysis?" labelId="stop-plan-analysis-title" />
            <ModalBody>
              This halts root cause investigation for this plan. Partial findings are preserved but no
              remediation options will be synthesized.
            </ModalBody>
            <ModalFooter>
              <Button
                variant="danger"
                onClick={() => {
                  registerPlanTermination(plan.id, formatExecutionKillTimestamp(new Date()));
                  setIsStopAnalysisModalOpen(false);
                }}
              >
                Yes, stop analysis
              </Button>
              <Button variant="link" onClick={() => setIsStopAnalysisModalOpen(false)}>
                Cancel
              </Button>
            </ModalFooter>
          </Modal>
        </StackItem>
      )}

      {/* ── Escalate to human action (Failed state only) ──────────────── */}
      {status === 'Failed' && (
        <StackItem>
          <Button variant="secondary">
            Escalate to human
          </Button>
        </StackItem>
      )}
    </Stack>
  );
};

// ─── Plan remediation drill-down routes ───────────────────────────────────────

export function getPlanRemediationPath(plan: PlanRow, perspectiveKey?: AppShellPerspectiveKey): string {
  if (perspectiveKey) {
    return getPlanDetailHref(plan, perspectiveKey);
  }
  return resolvePlanDomainAnnotations(plan).detailPath;
}

/** @deprecated Use getPlanRemediationPath — retained for existing deep links. */
export const DRILL_DOWN_PLAN_SLUG = 'analytics-memory-leak-fix';

export function buildPlansForPerspective(
  isSingleCluster: boolean,
  runtime: PlanExecutionRuntime = { abortedPlans: {} },
): PlanRow[] {
  const { abortedPlans, workflowByPlanId = {} } = runtime;
  const combined = (isSingleCluster
    ? [...SC_TOP_PLANS, ...SC_ALL_PLANS]
    : [...TOP_PLANS, ...ALL_PLANS]
  ).filter((row) => MVP_PLAN_IDS.has(row.id));
  const createdAnchor = new Date('2026-06-09T16:00:00.000Z').getTime();
  return [...combined]
    .sort((a, b) => b.score - a.score)
    .map((row, index) => {
      const identity = isSingleCluster
        ? SC_PLAN_TABLE_IDENTITY[row.id]
        : PLAN_TABLE_IDENTITY[row.id];
      const rowPatch = isSingleCluster ? SC_PLAN_ROW_PATCHES[row.id] : undefined;
      const mergedRow = rowPatch ? { ...row, ...rowPatch } : row;
      const normalizedRow = {
        ...mergedRow,
        triggerDomain: normalizeTriggerDomain(mergedRow.triggerDomain),
      };
      const drawerData = resolvePlanDrawerData(row.id, PLAN_DRAWER_DATA[row.id], isSingleCluster);
      const remediationOptions = enrichRemediationOptionsWithConfidence(
        row.id,
        applyScRemediationPatches(PLAN_REMEDIATION_OPTIONS[row.id] ?? [], row.id, isSingleCluster),
        drawerData?.confidence,
      );
      const baseRow: PlanRow = {
        ...normalizedRow,
        status: normalizePlanStatus(normalizedRow.status),
        name: identity?.name ?? row.id,
        synopsis: identity?.synopsis ?? normalizedRow.synopsis,
        namespace: identity?.namespace,
        planKind: row.id === 'cp4' ? 'analysis-only' : 'remediation',
        cluster: isSingleCluster
          ? CORE_PLATFORMS_CLUSTER_ID
          : identity?.fleetCluster ?? normalizedRow.drawerTargets[0] ?? '—',
        scope: isSingleCluster
          ? identity?.namespace ?? '—'
          : identity?.fleetCluster ?? normalizedRow.drawerTargets[0] ?? '—',
        createdAt:
          normalizedRow.createdAt ??
          new Date(createdAnchor - index * 47 * 60_000).toISOString(),
        terminatedAt: normalizedRow.terminatedAt,
      };

      if (abortedPlans[row.id]) {
        return {
          ...baseRow,
          status: 'Plan aborted',
          terminatedAt: abortedPlans[row.id].terminatedAt,
        };
      }

      const workflowPhase = workflowByPlanId[row.id]?.runtimePhase;
      if (workflowPhase) {
        return {
          ...baseRow,
          status: workflowPhase,
        };
      }

      return baseRow;
    });
}

// ─── Exported tab content ─────────────────────────────────────────────────────

export const PlansAndApprovalsTab: React.FC = () => {
  const navigate = useNavigate();
  const { activePerspective, setPerspectiveByKey } = useActivePerspective();
  const isSingleCluster = activePerspective === 'Core platforms';
  const agentClusterId = resolveAgentCapabilitiesClusterId(isSingleCluster);
  const { isAgentActiveForCluster } = useAgenticCapabilities();
  const planExecutionRuntime = usePlanBuildRuntime();
  const isAgenticAutomationEnabled = isAgentActiveForCluster(agentClusterId);
  const { deletePlan, isPlanDeleted } = useDeletedPlans();

  // Breadcrumb return: apply session handoff once on mount, then release control to the switcher.
  useLayoutEffect(() => {
    const handoff = readPlanRemediationDrillSession();
    if (!handoff) {
      return;
    }
    setPerspectiveByKey(handoff.perspectiveKey);
    clearPlanRemediationDrillSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per plans-list mount only
  }, []);

  const plans = useMemo(
    () => buildPlansForPerspective(isSingleCluster, planExecutionRuntime).filter((plan) => !isPlanDeleted(plan.id)),
    [isSingleCluster, planExecutionRuntime, isPlanDeleted],
  );

  const openPlanRemediation = useCallback((plan: PlanRow) => {
    if (!isAgenticAutomationEnabled) {
      return;
    }
    const perspectiveKey: AppShellPerspectiveKey =
      perspectiveKeyFromShellName(activePerspective)
      ?? (isSingleCluster ? 'core-platforms' : 'fleet-management');
    writePlanRemediationDrillSession({ perspectiveKey });
    navigate(getPlanDetailHref(plan, perspectiveKey));
  }, [activePerspective, isAgenticAutomationEnabled, isSingleCluster, navigate]);

  return (
    <Stack>
      <StackItem className="ols-ai-hub-plans-section">
        <PlansTable
          onReviewPlan={openPlanRemediation}
          onDeletePlan={deletePlan}
          rows={plans}
          isSingleCluster={isSingleCluster}
          isAgenticAutomationEnabled={isAgenticAutomationEnabled}
        />
      </StackItem>
    </Stack>
  );
};

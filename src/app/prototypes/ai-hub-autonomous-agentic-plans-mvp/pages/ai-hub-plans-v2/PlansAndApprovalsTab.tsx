import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Content,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  ExpandableSection,
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
  Skeleton,
  Spinner,
  SearchInput,
  Stack,
  StackItem,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import { CheckCircleIcon, EllipsisVIcon, ExclamationCircleIcon, ExclamationTriangleIcon, ExternalLinkAltIcon, HelpIcon, InfoCircleIcon, OutlinedClockIcon, RhUiDownloadIcon, SearchIcon } from '@patternfly/react-icons';
import { AiExperienceIcon } from './AiExperienceIcon';
import { DeniedPlanBanner } from '../v2/PlanStatusBanners';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { AgenticRunTimeline } from '../../components/AgenticRunTimeline';
import { NamespaceResourceLink } from '../../components/NamespaceResourceLink';
import {
  buildAgenticRunRequest,
  TriggerRequestSection,
} from '../../components/TriggerRequestSection';
import { resolveAnalysisLogsLifecycle } from '../../components/AnalysisLogsExpandable';

export {
  NamespaceResourceBadge,
  NamespaceResourceLink,
} from '../../components/NamespaceResourceLink';
import type { ReasoningStep } from '../../components/autonomousAiObserve/data';
import type { ConfidenceTier } from '../../types/confidenceTier';
import type { Reversibility } from '../../types/reversibility';
import { formatReversibilityLabel, reversibilityLabelColor } from '../../types/reversibility';
import type { RemediationRisk } from '../../types/riskScore';
import {
  getPlanTokensConsumedView,
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
import { DeleteAgenticRunModal } from '../../components/DeleteAgenticRunModal';
import { usePlanTermination, type PlanExecutionRuntime } from '../../context/PlanTerminationContext';
import { usePlanWorkflow } from '../../context/PlanWorkflowContext';
import { useApprovalPolicy } from '../../context/ApprovalPolicyContext';
import { usePlanBuildRuntime } from '../../hooks/usePlanBuildRuntime';
import type { PlanStatus } from '../../types/planStatus';
import { normalizePlanStatus } from '../../types/planStatus';
import {
  resolveVerificationState,
  VERIFICATION_CHECK_LINES,
  VerificationPanel,
} from './planWorkflowPanels';
import {
  enrichRemediationOptionsWithConfidence,
  getPlanTokenBurn,
  GLOBAL_APPROVAL_POLICY_MAX_ATTEMPTS,
  MVP_PLAN_IDS,
  normalizeTriggerDomain,
  resolveOptionRollbackPlan,
} from './plansMvpConstants';
import { getPlanDetailHref, resolvePlanDomainAnnotations } from './domainPlanNavigation';
import { downloadAnalysisReportMarkdown, downloadRemediationPlanMarkdown } from '../../utils/downloadRemediationPlan';
import { ExpandableCodeBlock } from '../../components/ExpandableCodeBlock';
import { LogViewer } from '@patternfly/react-log-viewer';

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
  /**
   * Raw `spec.request` prompt / alert event string that initiated analysis.
   * Rendered on the Agentic Run details page as the Analysis request section.
   */
  request?: string;
  /**
   * Distributed-tracing trace ID captured for this run, if any. Drives the
   * "View trace" link on the Analysis request card — only shown when set
   * AND status is Analyzing/Executing/Completed/Failed.
   */
  traceId?: string;
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
    name: 'ota-5-0-0-ec-4-to-5-1-0',
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
    name: 'ota-5-0-0-ec-4-to-5-0-1',
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
  'op5-manual-escalation': {
    name: 'grafana-wal-lock-escalated',
    synopsis: 'Grafana WAL lock recovery escalated after 3 failed execution attempts due to template rendering failure',
    fleetCluster: 'prod-east-1',
    namespace: 'openshift-monitoring',
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
    traceId: 'trc-7f2a19d8',
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
    traceId: 'trc-4c81be03',
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
    traceId: 'trc-2e5f8c91',
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
    traceId: 'trc-9a1e6d47',
    drawerTargets: ['prod-east-2'],
    expandedReasons: [
      { icon: 'alert', text: 'EtcdDatabaseHighFragmentationRatio: fragmentation ratio 0.67 exceeded 0.5 threshold across 3 control plane nodes.' },
      { icon: 'ban', text: 'Verification failure: fragmentation metric unchanged after defrag execution.' },
    ],
  },
  {
    id: 'op5-manual-escalation',
    severity: 'critical',
    status: 'Escalated',
    score: 79,
    synopsis: 'Grafana Database WAL Lock Recovery Escalated',
    consolidationScope: '3 Failed Execution Attempts',
    triggerDomain: 'Observability',
    drawerTargets: ['prod-east-1'],
    expandedReasons: [
      { icon: 'alert', text: 'GrafanaDown: Grafana startup blocked by stale SQLite WAL lock on PVC.' },
      { icon: 'ban', text: 'MaxRetriesExhausted: escalation_request.tmpl type mismatch on StepResultRef — manual policy paused handoff.' },
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
  /**
   * Raw JSON / YAML / Prometheus metric snippet that drove the AI diagnosis.
   * When present, a "View raw evidence" expandable section is rendered inside
   * the RCA block and the execute-remediation confirmation modal.
   */
  rawEvidence?: string;
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
    rawEvidence: `# ArgoCD ApplicationSet — cluster-gitops-policies (revision r4892)
# Fetched via: kubectl get applicationset cluster-gitops-policies -n openshift-gitops -o yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: cluster-gitops-policies
  namespace: openshift-gitops
  resourceVersion: "4892"
spec:
  generators:
    - clusterDecisionResource:
        configMapRef: argocd-application-controller
        labelSelector:
          matchLabels:
            env: production
  template:
    metadata:
      name: "{{name}}-policies"
    spec:
      project: default
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
      source:
        repoURL: https://github.com/redhat-openshift/gitops-policies
        targetRevision: r4892   # ← malformed Kustomize overlay introduced here
        path: overlays/prod/{{name}}
status:
  conditions:
    - type: ResourcesUpToDate
      status: "False"
      message: "4 of 4 applications out of sync — NetworkPolicy deny-all-ingress conflicts with openshift-ingress allow rule"`,
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
    rawEvidence: `// ACS alert payload — KernelModuleLoad (Falco rule: kernel_module_load_detected)
// Fetched via: roxctl central export alerts --severity CRITICAL --cluster prod-east-2
{
  "alertName": "KernelModuleLoad",
  "severity": "CRITICAL_SEVERITY",
  "clusterId": "prod-east-2",
  "firstObserved": "2026-04-29T09:47:03Z",
  "violations": [
    {
      "podName": "analytics-worker-7d9b4c8f6-xk2qt",
      "namespace": "analytics",
      "image": {
        "name": "quay.io/analytics/worker",
        "digest": "sha256:a3f1b9d4e8c2f0d3a7b1e5c9f4d6a2b8e3c7f1d0a4b9e6c2f8d5a3b7e1c4f9d2"
      },
      "syscalls": ["init_module", "finit_module"],
      "egressConnection": { "dst": "104.21.x.x", "port": 443, "protocol": "TCP" },
      "falcoRule": "kernel_module_load_detected",
      "cveMatch": "CVE-2024-1086"
    }
  ],
  "processActivity": [
    { "pid": 3814, "name": "insmod", "args": ["rootkit.ko"], "uid": 0 }
  ]
}`,
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
    rawEvidence: `// Prometheus query — container memory usage vs. configured limits
// Query: container_memory_usage_bytes{namespace="payments",container=~"payments-api|auth-svc"}
{
  "status": "success",
  "data": {
    "resultType": "matrix",
    "result": [
      {
        "metric": { "pod": "payments-api-7d6f9b-xk9tz", "container": "payments-api", "namespace": "payments" },
        "values": [
          [1745931200, "524288000"],
          [1745934800, "697532416"],
          [1745938400, "851345408"],
          [1745942000, "964689920"]
        ]
      },
      {
        "metric": { "pod": "auth-svc-5c4b8d-qr7vw", "container": "auth-svc", "namespace": "payments" },
        "values": [
          [1745931200, "268435456"],
          [1745934800, "356515840"],
          [1745938400, "481036288"],
          [1745942000, "536870912"]
        ]
      }
    ]
  }
}
// Deployment resource spec — payments-api (at time of alert)
// kubectl get deployment payments-api -n payments -o jsonpath='{.spec.template.spec.containers[0].resources}'
{
  "limits":   { "memory": "512Mi", "cpu": "500m" },
  "requests": { "memory": "256Mi", "cpu": "250m" }
}`,
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
    rawEvidence: `// Prometheus query — Ceph pool utilization
// Query: ceph_pool_percent_used{pool="ocs-storagecluster-cephblockpool"}
{
  "status": "success",
  "data": {
    "resultType": "vector",
    "result": [
      { "metric": { "pool": "ocs-storagecluster-cephblockpool", "cluster": "prod-us-east-1" }, "value": [1745942000, "0.83"] },
      { "metric": { "pool": "ocs-storagecluster-cephblockpool", "cluster": "prod-eu-west-1" }, "value": [1745942000, "0.81"] }
    ]
  }
}
// PersistentVolumeClaim — affected StatefulSet volumes (kubectl get pvc -n openshift-storage)
[
  { "name": "data-ocs-storagecluster-cephblockpool-0", "status": "Bound", "capacity": "500Gi", "usedBytes": 415000000000 },
  { "name": "data-ocs-storagecluster-cephblockpool-1", "status": "Bound", "capacity": "500Gi", "usedBytes": 405000000000 }
]
// StatefulSet log emission rate — no logrotate configured
// kubectl exec -n analytics analytics-datastore-0 -- du -sh /var/log/app
// 38G   /var/log/app  (growing at ~9.5GB/hour)`,
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
    rawEvidence: `// Prometheus query — etcd fragmentation ratio
// Query: 1 - (etcd_db_total_size_in_use_in_bytes / etcd_db_total_size_in_bytes)
{
  "status": "success",
  "data": {
    "resultType": "vector",
    "result": [
      { "metric": { "job": "etcd", "instance": "etcd-prod-master-0:2381" }, "value": [1745942000, "0.68"] },
      { "metric": { "job": "etcd", "instance": "etcd-prod-master-1:2381" }, "value": [1745942000, "0.71"] },
      { "metric": { "job": "etcd", "instance": "etcd-prod-master-2:2381" }, "value": [1745942000, "0.65"] }
    ]
  }
}
// etcd endpoint status (etcdctl endpoint status --write-out=json)
[
  { "endpoint": "https://etcd-prod-master-0:2381", "dbSize": 8589934592, "dbSizeInUse": 2752512000, "leader": true,  "raftTerm": 42, "raftIndex": 3814920 },
  { "endpoint": "https://etcd-prod-master-1:2381", "dbSize": 8589934592, "dbSizeInUse": 2490368000, "leader": false, "raftTerm": 42, "raftIndex": 3814918 },
  { "endpoint": "https://etcd-prod-master-2:2381", "dbSize": 8589934592, "dbSizeInUse": 3006478336, "leader": false, "raftTerm": 42, "raftIndex": 3814919 }
]`,
  },
  cp1: {
    steps: [
      { id: 's1', time: '14:02:11', status: 'done',    icon: 'exclamation', title: 'ClusterVersion channel reports EndOfLife on 4.14', detail: 'Cluster is EOL or behind upgrade channel' },
      { id: 's2', time: '14:02:24', status: 'done',    icon: 'database',    title: 'Evaluated supported upgrade graph to 4.15', detail: 'Upgradeable=False — minor version outside supported window' },
      { id: 's3', time: '14:02:38', status: 'done',    icon: 'search',      title: 'Scored control plane blast radius for minor bump', detail: 'Single-cluster scope · High confidence in channel signal' },
      { id: 's4', time: '14:02:51', status: 'pending', icon: 'search',      title: 'Awaiting approval to execute minor upgrade', detail: 'Control plane rolling upgrade requires platform admin authorization' },
    ],
    aggregatedFinding: 'ClusterVersion reports fast-4.14 channel EndOfLife with no further z-stream releases available.',
    rootCauseNarrative: 'The cluster remains on OpenShift 4.14 while the subscribed channel has reached end of life. Without a minor version upgrade to 4.15, the platform cannot receive security or bug-fix releases.',
    remediationProposal: 'Execute supported minor upgrade from OpenShift 4.14 to 4.15 with rolling control plane and worker cordon/drain cadence.',
    riskAssessment: 'High — minor upgrade requires control plane restarts and workload disruption during node rotation.',
    estimatedRecovery: '~45m',
    confidence: 'High',
    rawEvidence: `# ClusterVersion resource — upgrade channel and condition
# kubectl get clusterversion version -o yaml
apiVersion: config.openshift.io/v1
kind: ClusterVersion
metadata:
  name: version
spec:
  channel: fast-4.14
  clusterID: 9f2d1b4e-3a7c-4e8f-b2d1-6c4a9e3f7b2d
status:
  conditions:
    - type: Upgradeable
      status: "False"
      reason: MinorVersionNotInChannel
      message: "Channel fast-4.14 has reached end of life. Upgrade to 4.15 to resume receiving updates."
    - type: Available
      status: "True"
  desired:
    channel: fast-4.14
    version: "4.14.37"
  history:
    - version: "4.14.37"
      state: Completed
      startedTime: "2026-01-15T08:00:00Z"
      completionTime: "2026-01-15T09:47:00Z"`,
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
    rawEvidence: `// Prometheus query — CoreDNS P99 lookup latency (last 15 min)
// Query: histogram_quantile(0.99, rate(coredns_dns_request_duration_seconds_bucket[5m]))
{
  "status": "success",
  "data": {
    "resultType": "vector",
    "result": [
      { "metric": { "cluster": "prod-east-2",    "pod": "coredns-7d4b9f-lm2qp", "server": ":53" }, "value": [1745942000, "0.234"] },
      { "metric": { "cluster": "prod-eu-west-1", "pod": "coredns-5c8d2b-xp9rz", "server": ":53" }, "value": [1745942000, "0.218"] },
      { "metric": { "cluster": "edge-apac-1",    "pod": "coredns-9a1e3c-bw4kn", "server": ":53" }, "value": [1745942000, "0.201"] }
    ]
  }
}
// CoreDNS ConfigMap diff — openshift-dns/dns-default (last 15 min)
// kubectl get configmap dns-default -n openshift-dns -o yaml
---
 .:53 {
   errors
   health
   ready
   kubernetes cluster.local in-addr.arpa ip6.arpa {
     pods insecure
     fallthrough in-addr.arpa ip6.arpa
     ttl 30
   }
-  cache 30
+  cache 0   # cache TTL zeroed in ConfigMap edit at 15:09:42 UTC
   reload
   loadbalance
 }`,
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
      { id: 's4', time: '09:23:45', status: 'pending', icon: 'search',      title: 'Awaiting approval to patch deployment', detail: 'Disabling hostNetwork triggers pod restart — security team sign-off required' },
    ],
    aggregatedFinding: 'ACS detected a host network namespace sharing violation — a CIS benchmark Level 3 non-compliance — on 1 cluster.',
    rootCauseNarrative: 'A new deployment was misconfigured with hostNetwork: true, granting the container direct access to the node network stack. ACS enforcement policy flagged this as a critical security posture violation.',
    remediationProposal: 'Set hostNetwork: false on the offending deployment and apply a network policy admission webhook to prevent recurrence.',
    riskAssessment: 'Medium — policy enforcement will trigger pod restarts on the affected deployment.',
    estimatedRecovery: '~1m',
    confidence: 'Medium',
    rawEvidence: `// ACS violation alert — hostNetwork=true (roxctl central export alerts --severity HIGH)
{
  "policy": { "name": "CIS-L3-HostNetwork", "severity": "HIGH_SEVERITY", "categories": ["CIS Benchmarks", "Network Isolation"] },
  "clusterId": "prod-east-2",
  "namespace": "production",
  "deployment": { "name": "api-gateway", "type": "Deployment", "replicas": 3 },
  "violations": [
    { "message": "Container 'api-gateway' uses hostNetwork: true — node network namespace directly exposed" }
  ],
  "firstObserved": "2026-04-29T09:23:05Z"
}
// Deployment spec excerpt (kubectl get deployment api-gateway -n production -o yaml | grep -A4 spec.template.spec)
spec:
  template:
    spec:
      hostNetwork: true   # ← CIS Level 3 violation
      containers:
        - name: api-gateway
          image: quay.io/production/api-gateway:v2.3.1`,
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
    rawEvidence: `# ClusterVersion — available z-stream update (kubectl get clusterversion version -o yaml)
apiVersion: config.openshift.io/v1
kind: ClusterVersion
spec:
  channel: stable-4.15
status:
  desired:
    version: "4.15.1"
    image: quay.io/openshift-release-dev/ocp-release:4.15.1-x86_64
  availableUpdates:
    - version: "4.15.8"
      image: quay.io/openshift-release-dev/ocp-release:4.15.8-x86_64
      channels: ["stable-4.15", "fast-4.15"]
  conditions:
    - type: Upgradeable
      status: "True"
    - type: Available
      status: "True"
# CVE advisory — RHSA-2026-1842
# Affected component: openshift-apiserver
# CVE: CVE-2026-3142 (CVSS 9.1 — unauthenticated API server privilege escalation via crafted PATCH request)
# Fixed in: 4.15.8`,
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
    rawEvidence: `// Prometheus query — scrape target up status (openshift-monitoring)
// Query: up{job=~"prometheus-k8s|alertmanager-main",namespace="openshift-monitoring"}
{
  "status": "success",
  "data": {
    "resultType": "vector",
    "result": [
      { "metric": { "job": "prometheus-k8s",    "instance": "10.128.0.42:9090", "namespace": "openshift-monitoring" }, "value": [1745942000, "0"] },
      { "metric": { "job": "prometheus-k8s",    "instance": "10.128.0.43:9090", "namespace": "openshift-monitoring" }, "value": [1745942000, "0"] },
      { "metric": { "job": "alertmanager-main", "instance": "10.128.0.50:9093", "namespace": "openshift-monitoring" }, "value": [1745942000, "1"] }
    ]
  }
}
// ServiceMonitor TLS config — prometheus-k8s (kubectl get servicemonitor prometheus-k8s -n openshift-monitoring -o yaml)
spec:
  endpoints:
    - port: web
      scheme: https
      tlsConfig:
        caFile: /etc/prometheus/configmaps/serving-certs-ca-bundle/service-ca.crt
        certFile: /etc/prometheus/secrets/prometheus-k8s-tls/tls.crt
        keyFile: /etc/prometheus/secrets/prometheus-k8s-tls/tls.key
        serverName: prometheus-k8s.openshift-monitoring.svc   # ← SAN mismatch after cert rotation`,
  },
  op2: {
    steps: [
      { id: 's1', time: '10:18:04', status: 'done', icon: 'exclamation', title: 'AlertmanagerDeliveryFailing alert detected', detail: 'Expired integration tokens for PagerDuty receiver' },
      { id: 's2', time: '10:18:17', status: 'done', icon: 'database', title: 'Validated Alertmanager receiver secret references', detail: 'PagerDuty integration key past rotation window by 11 days' },
      { id: 's3', time: '10:18:31', status: 'pending', icon: 'search', title: 'Awaiting approval to rotate webhook secret', detail: 'Secret rotation requires platform admin approval' },
    ],
    aggregatedFinding: 'Alertmanager notification delivery failures correlate with an expired PagerDuty integration token in openshift-monitoring.',
    rootCauseNarrative: 'The Alertmanager PagerDuty receiver references a Kubernetes secret whose integration token expired, causing sustained AlertmanagerDeliveryFailing alerts and missed pages.',
    remediationProposal: 'Rotate the Alertmanager webhook secret with a fresh PagerDuty integration key and reload alertmanager-main.',
    riskAssessment: 'Low — secret rotation is reversible and scoped to notification routing only.',
    estimatedRecovery: '~5m',
    confidence: 'High',
    rawEvidence: `// Alertmanager delivery failure log (kubectl logs alertmanager-main-0 -n openshift-monitoring | tail -20)
ts=2026-04-29T10:18:04.312Z caller=notify.go:732 level=error component=dispatcher msg="Error on notify" receiver=pagerduty timeout=10s err="pagerduty: unexpected status code 400: Invalid integration key"
ts=2026-04-29T10:18:09.887Z caller=notify.go:732 level=error component=dispatcher msg="Error on notify" receiver=pagerduty timeout=10s err="pagerduty: unexpected status code 400: Invalid integration key"
ts=2026-04-29T10:18:14.412Z caller=notify.go:732 level=error component=dispatcher msg="Error on notify" receiver=pagerduty timeout=10s err="pagerduty: unexpected status code 400: Invalid integration key"

// Secret rotation audit — alertmanager-pagerduty (kubectl get secret alertmanager-pagerduty -n openshift-monitoring -o yaml)
metadata:
  name: alertmanager-pagerduty
  namespace: openshift-monitoring
  annotations:
    last-rotated: "2026-03-18T00:00:00Z"   # ← 11 days past 30-day rotation window
data:
  pagerduty.integration-key: <redacted>     # expired token`,
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
    rawEvidence: `// Thanos compactor log excerpt (kubectl logs thanos-compactor-0 -n openshift-monitoring | grep -i error | tail -15)
ts=2026-04-29T11:05:02.108Z caller=compact.go:519 level=error msg="compaction failed" err="open /var/thanos/compact/data/01HX4K9RQVTM2N3P8W6Y0BZJA4/meta.json: no such file or directory"
ts=2026-04-29T11:05:02.214Z caller=compact.go:519 level=error msg="compaction failed" err="unexpected end of JSON input at /var/thanos/compact/data/01HX4K9RQVTM2N3P8W6Y0BZJA4/chunks/000001"
ts=2026-04-29T11:05:07.003Z caller=compact.go:519 level=error msg="halting compactor — block integrity check failed" ulid=01HX4K9RQVTM2N3P8W6Y0BZJA4

// Prometheus metric — thanos compactor last run time
// Query: thanos_compact_halted{job="thanos-compactor"}
{
  "status": "success",
  "data": {
    "resultType": "vector",
    "result": [{ "metric": { "job": "thanos-compactor", "namespace": "openshift-monitoring" }, "value": [1745942000, "1"] }]
  }
}`,
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
    rawEvidence: `// Prometheus query — OpenTelemetry collector batch queue utilization
// Query: otelcol_exporter_queue_size / otelcol_exporter_queue_capacity
{
  "status": "success",
  "data": {
    "resultType": "vector",
    "result": [
      { "metric": { "pod": "otel-collector-0", "namespace": "opentelemetry-operator-system" }, "value": [1745942000, "0.98"] },
      { "metric": { "pod": "otel-collector-1", "namespace": "opentelemetry-operator-system" }, "value": [1745942000, "0.97"] },
      { "metric": { "pod": "otel-collector-2", "namespace": "opentelemetry-operator-system" }, "value": [1745942000, "0.96"] }
    ]
  }
}
// OpenTelemetryCollector resource spec (kubectl get opentelemetrycollector otel-collector -n opentelemetry-operator-system -o yaml)
spec:
  replicas: 3    # current
  config: |
    processors:
      batch:
        send_batch_size: 10000
        timeout: 10s
        send_batch_max_size: 0   # ← unlimited batch size causing memory pressure`,
  },
  op5: {
    steps: [
      { id: 's1', time: '16:03:12', status: 'done', icon: 'exclamation', title: 'PersesDashboardStorageLocked alert fired', detail: 'Database write timeouts on shared persistent volume' },
      { id: 's2', time: '16:03:26', status: 'done', icon: 'database', title: 'Inspected Perses storage volume and PVC mount state', detail: 'Stale lock file held after ungraceful perses pod eviction' },
      { id: 's3', time: '16:03:41', status: 'pending', icon: 'search', title: 'Awaiting approval to remove storage lock', detail: 'Lock removal requires a brief Perses write-unavailable window' },
    ],
    aggregatedFinding: 'Perses dashboard persistence failures trace to a storage lock on the shared monitoring PVC.',
    rootCauseNarrative: 'An ungraceful Perses pod eviction left a stale lock file on the shared persistent volume, causing PersesDashboardStorageLocked alerts and dashboard write timeouts.',
    remediationProposal: 'Stop Perses, remove the stale lock file from the PVC, and restart the deployment with verified volume consistency.',
    riskAssessment: 'Medium — clearing the lock requires a short Perses write-unavailable window.',
    estimatedRecovery: '~3m',
    confidence: 'High',
    rawEvidence: `// Perses pod logs — storage lock error (kubectl logs perses-0 -n openshift-monitoring | grep -i lock | tail -10)
2026-04-29T16:03:12Z ERR  unable to acquire SQLite WAL lock path=/var/lib/grafana/grafana.db-wal err="database is locked"
2026-04-29T16:03:17Z ERR  unable to acquire SQLite WAL lock path=/var/lib/grafana/grafana.db-wal err="database is locked"
2026-04-29T16:03:22Z ERR  write timeout on persistent volume — dashboards save disabled

// PVC mount state (kubectl describe pvc perses-pvc -n openshift-monitoring | grep -A5 Events)
Events:
  Type    Reason              Age    From                         Message
  Normal  SuccessfulAttach    48m    attachdetach-controller      Successfully attached volume "pvc-6b2e1d4f-3c7a-4e8f-b1d2-9a4c7e3f6b1d"
// Lock file on volume:
// kubectl exec -n openshift-monitoring perses-debug -- ls -lh /var/lib/grafana/grafana.db-wal
// -rw-r--r-- 1 nobody nobody 32M Apr 29 15:54 /var/lib/grafana/grafana.db-wal   # ← stale from ungraceful eviction`,
  },
  // ─── New backend phase plans ─────────────────────────────────────────────────
  'acs-netpol-remediation-denied': {
    steps: [
      { id: 's1', time: '09:14:03', status: 'done', icon: 'exclamation', title: 'ACS policy violation detected on retail-checkout', detail: 'hostNetwork=true set on workload in retail-prod namespace — violates P-2041' },
      { id: 's2', time: '09:14:18', status: 'done', icon: 'search', title: 'Identified affected deployment', detail: 'retail-checkout uses hostNetwork as DNS workaround' },
      { id: 's3', time: '09:14:32', status: 'alert', icon: 'exclamation', title: 'Remediation proposal denied by administrator', detail: 'Admin flagged for broader network policy review before patching' },
    ],
    aggregatedFinding: 'ACS detected a hostNetwork=true workload in the retail-prod namespace violating network isolation policy P-2041.',
    rootCauseNarrative: 'The retail-checkout deployment was updated with hostNetwork: true to work around a DNS resolution issue. ACS flagged this as a compliance violation. The remediation proposal to patch the deployment was reviewed and denied by the cluster administrator, who requires a broader policy review before any change is applied.',
    remediationProposal: 'Patch retail-checkout deployment to remove hostNetwork: true and resolve the DNS issue via CoreDNS configuration instead.',
    riskAssessment: 'Low — patch removes a privilege escalation risk. DNS validation required before apply.',
    estimatedRecovery: '~5m',
    confidence: 'High',
    rawEvidence: `// ACS policy violation — JSON alert payload
// roxctl central export alerts --severity HIGH --cluster prod-east-2 --deployment retail-checkout
{
  "policy": { "name": "P-2041", "severity": "HIGH_SEVERITY", "categories": ["Network Isolation"] },
  "clusterId": "prod-east-2",
  "namespace": "retail-prod",
  "deployment": { "name": "retail-checkout", "type": "Deployment" },
  "violations": [
    { "message": "Container 'retail-checkout' uses hostNetwork: true, bypassing pod network namespace isolation" }
  ],
  "firstObserved": "2026-04-29T09:14:03Z"
}
// Deployment spec — retail-checkout (kubectl get deployment retail-checkout -n retail-prod -o yaml | grep hostNetwork -A2)
spec:
  template:
    spec:
      hostNetwork: true   # ← violates network isolation policy P-2041`,
  },
  'ingress-controller-escalated': {
    steps: [
      { id: 's1', time: '14:22:05', status: 'done', icon: 'exclamation', title: 'IngressControllerMinReplicasNotMet alert fired', detail: 'Ingress controller replica count dropped below 2 after node eviction' },
      { id: 's2', time: '14:22:19', status: 'alert', icon: 'database', title: 'Attempted automated scale-out — attempt 1', detail: 'Execution failed: insufficient resource quota in openshift-ingress' },
      { id: 's3', time: '14:22:41', status: 'alert', icon: 'database', title: 'Attempted automated scale-out — attempt 2', detail: 'Execution failed: quota limit unchanged, same error' },
      { id: 's4', time: '14:23:00', status: 'alert', icon: 'exclamation', title: 'MaxRetriesExhausted — escalated to operator', detail: 'Proposal marked Escalated; requires human quota adjustment' },
    ],
    aggregatedFinding: 'Ingress controller fell below minimum replicas after node eviction. Two automated scale-out attempts failed due to namespace quota limits.',
    rootCauseNarrative: 'A node eviction event on worker-bm-03 caused the ingress controller replica count to drop to 1. Two consecutive automated remediation executions failed because the openshift-ingress namespace quota prevented scheduling additional pods. After exhausting the MaxRetries threshold, the proposal was automatically escalated for manual operator intervention.',
    remediationProposal: 'Increase the openshift-ingress namespace ResourceQuota CPU/memory limits, then re-execute the ingress controller scale-out plan.',
    riskAssessment: 'Medium — quota change affects other workloads in the namespace. Review before applying.',
    estimatedRecovery: '~10m after quota adjustment',
    confidence: 'High',
    rawEvidence: `// Kubernetes events — ingress controller scale failure (kubectl get events -n openshift-ingress --sort-by=.lastTimestamp | tail -10)
LAST SEEN   TYPE      REASON              OBJECT                                MESSAGE
14m         Warning   FailedCreate        replicaset/router-default-7d8f9b      Error creating: pods "router-default-7d8f9b-" is forbidden: exceeded quota: default-quota, requested: pods=1, used: pods=10, limited: pods=10
14m         Warning   FailedCreate        replicaset/router-default-7d8f9b      Error creating: pods "router-default-7d8f9b-" is forbidden: exceeded quota: default-quota, requested: pods=1, used: pods=10, limited: pods=10

// ResourceQuota — openshift-ingress (kubectl get resourcequota -n openshift-ingress -o yaml)
apiVersion: v1
kind: ResourceQuota
metadata:
  name: default-quota
  namespace: openshift-ingress
spec:
  hard:
    pods: "10"           # ← hard ceiling reached; scale-out blocked
    requests.cpu: "4"
    requests.memory: "8Gi"
status:
  used:
    pods: "10"
    requests.cpu: "3800m"
    requests.memory: "7680Mi"`,
  },
  'op5-manual-escalation': {
    steps: [
      { id: 's1', time: '09:14:33', status: 'done', icon: 'exclamation', title: 'GrafanaDown alert fired', detail: 'Grafana pod CrashLoopBackOff — stale SQLite WAL lock detected on PVC' },
      { id: 's2', time: '09:14:47', status: 'alert', icon: 'database', title: 'Execution attempt 1 — failed', detail: 'Template rendering error: escalation_request.tmpl:9 type mismatch on StepResultRef' },
      { id: 's3', time: '09:15:12', status: 'alert', icon: 'database', title: 'Execution attempt 2 — failed', detail: 'Same template error; StepResultRef.Success field does not exist in v1alpha1 API' },
      { id: 's4', time: '09:15:37', status: 'alert', icon: 'database', title: 'Execution attempt 3 — failed', detail: 'MaxRetriesExhausted: template error uncorrected across all attempts' },
      { id: 's5', time: '09:15:45', status: 'alert', icon: 'exclamation', title: 'Manual escalation policy — handoff paused', detail: 'Awaiting SRE confirmation before dispatching to external channels' },
    ],
    aggregatedFinding: 'Grafana startup is blocked by a stale SQLite WAL lock file on the PVC. Three automated execution attempts failed due to a Go template rendering error in the escalation pipeline.',
    rootCauseNarrative: 'A stale SQLite WAL lock file (grafana.db-wal) is preventing Grafana from initializing. Three consecutive automated execution attempts failed because the escalation request template (escalation_request.tmpl) attempts to access a non-existent Success field on a v1alpha1.StepResultRef value. This rendering failure prevents the escalation payload from being generated, blocking handoff to external channels. The manual escalation policy has paused automatic dispatch, awaiting SRE confirmation.',
    remediationProposal: 'Fix the Go template rendering failure in escalation_request.tmpl, then manually dispatch the escalation or retry the execution after correcting the template/data model mismatch.',
    riskAssessment: 'Low — WAL lock removal is non-destructive. Template bug must be fixed independently.',
    estimatedRecovery: '~5m (WAL lock removal) + template fix time',
    confidence: 'High',
    rawEvidence: `// Grafana pod status
NAME                    READY   STATUS             RESTARTS   AGE
grafana-6d9c8b7-k2pmf   0/1     CrashLoopBackOff   12         47m

// Template rendering error (escalation controller logs)
ERROR escalation template rendering failed {"template":"escalation_request.tmpl","error":"template: escalation_request.tmpl:9:22: executing \\"escalation_request.tmpl\\" at <.Success>: can't evaluate field Success in type v1alpha1.StepResultRef"}

// StepResultRef type (v1alpha1/proposal_types.go excerpt)
type StepResultRef struct {
    StepName string \`json:"stepName"\`
    Phase    string \`json:"phase"\`
    // Note: there is no 'Success' field — use .Phase == "Succeeded" instead
}`,
  },
  'prometheus-wal-emergency-stopped': {
    steps: [
      { id: 's1', time: '02:07:15', status: 'done', icon: 'exclamation', title: 'PrometheusWALCorruptionDetected alert fired', detail: 'Write-ahead log corruption markers on prometheus-k8s-0' },
      { id: 's2', time: '02:07:28', status: 'done', icon: 'database', title: 'Initiated WAL segment repair via tsdb tool', detail: 'Repair started on /prometheus/wal — active write activity detected' },
      { id: 's3', time: '02:08:01', status: 'alert', icon: 'exclamation', title: 'Emergency stop issued by on-call operator', detail: 'Halted mid-repair to avoid data loss during peak ingestion window' },
    ],
    aggregatedFinding: 'Prometheus WAL showed corruption markers on prometheus-k8s-0. Repair execution was started but stopped mid-flight by an emergency override.',
    rootCauseNarrative: 'Automated WAL repair was initiated in response to corruption markers detected on prometheus-k8s-0. The on-call team identified that the repair was running during the peak metric ingestion window (02:00–04:00 UTC), creating a risk of write-path data loss. An EmergencyStop was issued, halting execution. The instance remains in a degraded state pending a scheduled maintenance window.',
    remediationProposal: 'Schedule WAL repair during the next off-peak maintenance window (after 04:00 UTC). Use tsdb repair --repair flag with a snapshot taken beforehand.',
    riskAssessment: 'High — WAL repair during active writes risks metric data loss. Must be run offline.',
    estimatedRecovery: '~15m during maintenance window',
    confidence: 'Medium',
    rawEvidence: `// Prometheus WAL corruption markers (kubectl exec -n openshift-monitoring prometheus-k8s-0 -- tsdb analyze /prometheus | head -20)
Block Id    Min Time                Max Time                Duration    Num Samples  Num Series  Mint
01HX3K8NQS  2026-04-28 22:00:00 UTC  2026-04-28 23:00:00 UTC  1h          1842920      12048
01HX3KQVTM  CORRUPTED               CORRUPTED               —           —            —
  └─ /prometheus/wal/00000014: unexpected EOF at offset 4096
  └─ /prometheus/wal/00000015: checksum mismatch — expected 0x4f2b1a3d got 0x00000000
01HX3KRFBN  2026-04-29 00:00:00 UTC  2026-04-29 01:00:00 UTC  1h          1924110      12341

// PrometheusWALCorruptionDetected alert — raw Alertmanager payload
{
  "labels": { "alertname": "PrometheusWALCorruptionDetected", "namespace": "openshift-monitoring", "pod": "prometheus-k8s-0" },
  "annotations": { "summary": "WAL corruption markers detected on prometheus-k8s-0", "runbook_url": "https://github.com/openshift-monitoring/runbooks/blob/main/alerts/PrometheusWALCorruptionDetected.md" },
  "startsAt": "2026-04-29T02:07:15Z"
}`,
  },
  'quota-exhaustion-escalating': {
    steps: [
      { id: 's1', time: '08:44:02', status: 'done',    icon: 'exclamation', title: '3 ResourceQuota limit-exceeded events detected',          detail: 'cpu and memory quotas exhausted in retail-prod, payments-staging, auth-dev namespaces' },
      { id: 's2', time: '08:44:16', status: 'done',    icon: 'database',    title: 'Queried Kubernetes resource quota utilization',            detail: 'Quota headroom: CPU 0m remaining, memory 0Mi remaining across 3 namespaces' },
      { id: 's3', time: '08:44:29', status: 'done',    icon: 'search',      title: 'Identified workload contributing to exhaustion',          detail: 'payments-api StatefulSet expanded from 3→9 replicas during flash traffic event' },
      { id: 's4', time: '08:44:44', status: 'alert',   icon: 'exclamation', title: 'Automated quota adjustment failed — attempt 1 of 3',      detail: 'Execution blocked: ResourceQuota patch requires cluster-admin binding' },
      { id: 's5', time: '08:44:58', status: 'alert',   icon: 'exclamation', title: 'Automated quota adjustment failed — attempt 2 of 3',      detail: 'Retry failed: RBAC denial unchanged after permission re-check' },
      { id: 's6', time: '08:45:11', status: 'alert',   icon: 'exclamation', title: 'Automated quota adjustment failed — attempt 3 of 3',      detail: 'Max retries exhausted — escalating to human operator' },
    ],
    aggregatedFinding: 'Namespace resource quotas are fully exhausted across 3 namespaces. Three automated remediation attempts failed due to RBAC permission restrictions.',
    rootCauseNarrative: 'A sudden scale-out of the payments-api StatefulSet consumed all remaining CPU and memory quota headroom across retail-prod, payments-staging, and auth-dev. The autonomous agent attempted to patch the ResourceQuota objects directly but was blocked by a missing cluster-admin binding on the automation service account. All 3 retry attempts failed with the same RBAC denial. Escalation to a human operator with the correct permissions is required.',
    remediationProposal: 'Grant the automation service account a scoped cluster-admin or quota-editor ClusterRole binding, then re-trigger the quota adjustment. Alternatively, manually patch the affected ResourceQuota objects to increase CPU and memory limits.',
    riskAssessment: 'High — quota exhaustion is blocking new pod scheduling and causing evictions across 3 namespaces.',
    estimatedRecovery: 'N/A — manual operator intervention required',
    confidence: 'High',
    rawEvidence: `// kubectl describe resourcequota -n retail-prod
Name: compute-resources
Namespace: retail-prod
Resource         Used    Hard
--------         ----    ----
requests.cpu     7980m   8000m   ← 20m remaining
requests.memory  31Gi    32Gi    ← 1Gi remaining
limits.cpu       15960m  16000m  ← 40m remaining
limits.memory    62Gi    64Gi

// RBAC denial from kubectl patch resourcequota/compute-resources:
// Error from server (Forbidden): resourcequotas "compute-resources" is forbidden:
// User "system:serviceaccount:openshift-agentic:quota-agent" cannot patch resource
// "resourcequotas" in API group "" in the namespace "retail-prod"`,
  },
  'etcd-defrag-failed': {
    steps: [
      { id: 's1', time: '09:14:05', status: 'done', icon: 'exclamation', title: 'EtcdDatabaseHighFragmentationRatio alert fired', detail: 'Fragmentation ratio 0.67 detected across etcd-master-01, etcd-master-02, etcd-master-03' },
      { id: 's2', time: '09:14:19', status: 'done', icon: 'database', title: 'Queried etcd endpoint defrag statistics', detail: 'DB size: 8.2 GiB · In-use: 3.1 GiB · Fragmentation: 62% — compaction lag confirmed' },
      { id: 's3', time: '09:14:38', status: 'done', icon: 'network', title: 'Executed etcd defrag across 3 control plane nodes', detail: 'Commands issued sequentially to avoid leadership disruption' },
      { id: 's4', time: '09:15:10', status: 'alert', icon: 'exclamation', title: 'Verification failed: fragmentation ratio unchanged', detail: 'Post-defrag check still at 0.67 — compaction window had not run before execution' },
    ],
    aggregatedFinding: 'etcd defragmentation executed across 3 control plane nodes but post-execution verification failed — fragmentation ratio remained at 0.67.',
    rootCauseNarrative: 'EtcdDatabaseHighFragmentationRatio fired after the fragmentation ratio exceeded 0.5 on all three control plane etcd members. Defragmentation was executed sequentially to minimize leader disruption, but the post-execution check found the fragmentation metric unchanged. The root cause is that the auto-compaction window (configured at 1h) had not run prior to execution, leaving large amounts of unreclaimed logical space that defrag alone cannot recover without a preceding compaction pass.',
    remediationProposal: 'Trigger a manual etcd compaction before re-running defrag. Run `etcdctl compact <revision>` on the leader member, then re-execute the defragmentation run during a low-write window.',
    riskAssessment: 'High — etcd fragmentation above 0.5 degrades API server write latency and can cause quota exhaustion if db-quota-backend-bytes is approached.',
    estimatedRecovery: 'N/A — run failed; requires manual compaction before retry',
    confidence: 'Medium',
    rawEvidence: `// etcd endpoint status — pre-defrag (etcdctl endpoint status --write-out=json)
[
  { "endpoint": "https://etcd-master-01:2381", "dbSize": 8808038400, "dbSizeInUse": 3354722304, "leader": true,  "raftTerm": 42 },
  { "endpoint": "https://etcd-master-02:2381", "dbSize": 8808038400, "dbSizeInUse": 3221225472, "leader": false, "raftTerm": 42 },
  { "endpoint": "https://etcd-master-03:2381", "dbSize": 8808038400, "dbSizeInUse": 3489660928, "leader": false, "raftTerm": 42 }
]
// Post-defrag verification — fragmentation unchanged (etcdctl endpoint status --write-out=json)
[
  { "endpoint": "https://etcd-master-01:2381", "dbSize": 8808038400, "dbSizeInUse": 3321888768, "leader": true,  "raftTerm": 42 },
  { "endpoint": "https://etcd-master-02:2381", "dbSize": 8808038400, "dbSizeInUse": 3221225472, "leader": false, "raftTerm": 42 },
  { "endpoint": "https://etcd-master-03:2381", "dbSize": 8808038400, "dbSizeInUse": 3506438144, "leader": false, "raftTerm": 42 }
]
// Root cause: compaction not run prior to defrag
// etcdctl endpoint status --write-out=json | jq .[].Status.header.revision
// 8423104   ← auto-compact set to 1h; last compaction was at revision 7891200 (>1h ago)`,
  },
  ...NEW_ALERT_INVESTIGATION_DRAWER_DATA,
};

// ─── Remediation options data ────────────────────────────────────────────────

/** Per-option diagnosis payload (backend: options[].diagnosis). OLS-3724. */
export type OptionDiagnosis = {
  aggregatedFinding: string;
  rootCauseNarrative: string;
};

/**
 * A single verification step run after remediation to confirm the fix is effective.
 * Backend field: options[].proposal.verificationSteps[].
 */
export interface VerificationStep {
  /** Short identifier used as a code-comment step label (e.g. 'alertmanager-ready'). */
  id: string;
  /** The shell command or query that confirms the remediation result. */
  command: string;
  /** Human-readable expected outcome displayed below the code block. */
  expected: string;
}

/**
 * Structured post-execution verification plan for a remediation option.
 * Backend field: options[].proposal.verificationSteps.
 */
export interface OptionVerificationSteps {
  /** Summary description shown below the section header. */
  description: string;
  steps: VerificationStep[];
}

/** A single action executed during the remediation phase with its result. */
export interface ExecutionAction {
  /** Category tag: 'pre-check' | 'mutation' | 'cleanup' | 'verification' | 'rollback' */
  category: string;
  status: 'Succeeded' | 'Failed' | 'Skipped';
  description: string;
  command: string;
  output: string;
}

export interface ExecutionSummaryData {
  /** One-sentence baseline explaining what the agent targeted. */
  targetedRootCause: string;
  /** Description of the cluster changes the remediation actually made. */
  remediationDelta: string;
  actionsTaken: ExecutionAction[];
}

/** A single verification check run after remediation with its actual result. */
export interface VerificationCheck {
  id: string;
  status: 'Passed' | 'Failed';
  command: string;
  output: string;
}

export interface VerificationSummaryData {
  /** Bulleted outcome statements rendered as an assessment list. */
  outcomeAssessment: string[];
  checks: VerificationCheck[];
}

/** AI-generated analysis explaining why automated execution halted and what to do next. */
export interface EscalationSummaryData {
  /** Bulleted list explaining the root cause of the escalation failure path. */
  analysis: string[];
  /** Bulleted list of recommended manual steps to resolve the escalation. */
  recommendedNextSteps: string[];
  /** External channels the agent automatically dispatched to (auto policy only). */
  dispatchedTargets?: string[];
}

/**
 * A single agent-proposed shell command with a category label and human-readable description.
 * Backend field: options[].proposal.commands[].
 */
export interface AgentCommand {
  /**
   * Short category tag shown above the command block.
   * Conventional values: 'pre-check' | 'mutation' | 'cleanup' | 'verification' | 'rollback'
   */
  label: string;
  /** One-sentence explanation of what this command does and why. */
  description: string;
  /** The shell command to execute. */
  command: string;
}

/** A single Kubernetes RBAC rule required by the agent Service Account for this option. */
export interface RbacRule {
  /** Kubernetes resource kind (e.g. 'secrets', 'deployments (apps)'). */
  resource: string;
  /** Comma-separated verb list (e.g. 'get, list, patch'). */
  verbs: string;
  /** Short human-readable explanation of why this permission is needed. */
  purpose: string;
  /** True if any listed verb is a mutating operation (create, update, patch, delete, exec). */
  isWrite: boolean;
}

/**
 * Namespace-scoped or cluster-wide RBAC requirements for a remediation option.
 * Backend field: options[].proposal.rbac.
 */
export interface RbacSpec {
  /** One-line callout summarising the write operations (shown above the expandable table). */
  summary: string;
  /** Rules that apply within a specific namespace. */
  namespaceScope?: {
    namespace: string;
    rules: RbacRule[];
  };
  /** Rules that apply cluster-wide (no namespace constraint). */
  clusterScope?: {
    rules: RbacRule[];
  };
}

export interface RemediationOption {
  id: string;
  title: string;
  description: string;
  risk: RemediationRisk;
  /**
   * Per-option root cause analysis (backend: options[].diagnosis).
   * When remediation options exist, top-level diagnosis is omitted and each option
   * carries its own RCA — see OLS-3724.
   */
  diagnosis?: OptionDiagnosis;
  /** Diagnosis confidence for this remediation path (backend: options[].diagnosis.confidence). */
  confidence?: ConfidenceTier;
  /** Rollback assessment (backend: options[].proposal.reversible). */
  reversible: Reversibility;
  model: 'smart' | 'fast';
  /**
   * Structured command list (backend: options[].proposal.commands[]).
   * When present, rendered as individually labeled command blocks with descriptions.
   * Falls back to rawCommands for options not yet migrated to structured format.
   */
  commands?: AgentCommand[];
  /** Legacy flat command string — used as fallback when commands is absent. */
  rawCommands: string;
  /**
   * Post-execution verification steps (backend: options[].proposal.verificationSteps).
   * Shown during the pre-execution review phase so operators know how success will be confirmed.
   */
  verificationSteps?: OptionVerificationSteps;
  /**
   * RBAC permissions required by the agent Service Account to execute this option.
   * Backend field: options[].proposal.rbac.
   * When absent, falls back to a "Standard Agent Permissions" notice in the UI.
   */
  rbac?: RbacSpec;
}

/**
 * Ensures every remediation option has a 1:1 diagnosis (OLS-3724).
 * Uses explicit `option.diagnosis` when present; otherwise derives a path-specific
 * RCA from the plan-level drawer so multi-option runs never collapse findings.
 */
function enrichRemediationOptionsWithDiagnosis(
  options: RemediationOption[],
  drawer?: { aggregatedFinding: string; rootCauseNarrative: string },
): RemediationOption[] {
  if (options.length === 0) return options;
  return options.map((opt) => {
    if (opt.diagnosis) return opt;
    if (!drawer) {
      return {
        ...opt,
        diagnosis: {
          aggregatedFinding: opt.title,
          rootCauseNarrative: opt.description,
        },
      };
    }
    if (options.length === 1) {
      return {
        ...opt,
        diagnosis: {
          aggregatedFinding: drawer.aggregatedFinding,
          rootCauseNarrative: drawer.rootCauseNarrative,
        },
      };
    }
    const desc =
      opt.description.charAt(0).toLowerCase() + opt.description.slice(1);
    return {
      ...opt,
      diagnosis: {
        aggregatedFinding: drawer.aggregatedFinding,
        rootCauseNarrative: `${drawer.rootCauseNarrative} This option (“${opt.title}”) remediates that root cause by ${desc}`,
      },
    };
  });
}

const PLAN_REMEDIATION_OPTIONS: Record<string, RemediationOption[]> = {
  tp1: [
    {
      id: 'tp1-o1',
      title: 'Automated fleet rollback via GitOps controller',
      description: 'Revert the ApplicationSet to revision r4891 and trigger a fleet-wide hard sync via the ArgoCD GitOps controller.',
      risk: 'low',
      reversible: 'Reversible',
      model: 'smart',
      rawCommands: 'argocd app sync cluster-ingress-controller --prune --force',
      diagnosis: {
        aggregatedFinding: 'ArgoCD revision r4892 applied a malformed ApplicationSet template that mismatched live cluster state across 4 fleets.',
        rootCauseNarrative: 'A faulty Argo CD ApplicationSet push (revision r4892) propagated conflicting Kustomize overlays. Fleet-wide rollback to r4891 via the GitOps controller is the lowest-risk path to restore declared state.',
      },
    },
    {
      id: 'tp1-o2',
      title: 'Manual cluster-by-cluster ArgoCD sync override',
      description: 'Force-sync each affected cluster individually via the ArgoCD CLI, bypassing the ApplicationSet controller.',
      risk: 'medium',
      reversible: 'Reversible',
      model: 'fast',
      rawCommands: 'argocd app sync cluster-ingress-controller --revision HEAD~1 --local',
      diagnosis: {
        aggregatedFinding: 'Per-cluster Argo CD sync state diverged after ApplicationSet r4892; three clusters remain on the faulty overlay.',
        rootCauseNarrative: 'Individual Application controllers still hold the bad sync revision. Manual cluster-by-cluster sync override restores healthy revisions without deleting the ApplicationSet controller object.',
      },
    },
    {
      id: 'tp1-o3',
      title: 'Full ApplicationSet deletion and recreation',
      description: 'Delete the faulty ApplicationSet entirely and redeploy from the canonical Git source.',
      risk: 'high',
      reversible: 'Irreversible',
      model: 'fast',
      rawCommands: 'argocd app delete cluster-ingress-controller --cascade && git checkout HEAD~1 -- config/applicationset.yaml && argocd app create -f config/applicationset.yaml',
      diagnosis: {
        aggregatedFinding: 'ApplicationSet object itself cannot reconcile cleanly after revision r4892 — incremental sync will not clear the drift.',
        rootCauseNarrative: 'Controller-level repair failed. Deleting and recreating the ApplicationSet from the canonical Git source is required when hard sync cannot restore a consistent desired state.',
      },
    },
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
    {
      id: 'ap8-o1', title: 'Set hostNetwork: false + mutating admission webhook', description: 'Patch the deployment to remove host network access and install a MutatingAdmissionWebhook to prevent future violations.', risk: 'medium', reversible: 'Reversible', model: 'smart',
      rawCommands: "oc patch securitycontextconstraints restricted --type='json' -p='[{\"op\": \"replace\", \"path\": \"/allowHostNetwork\", \"value\": false}]'",
      commands: [
        { label: 'pre-check', description: 'Verify the current SCC allowHostNetwork setting before patching', command: "oc get securitycontextconstraints restricted -o jsonpath='{.allowHostNetwork}'" },
        { label: 'mutation', description: 'Patch the SecurityContextConstraints to deny host network access cluster-wide', command: "oc patch securitycontextconstraints restricted --type='json' -p='[{\"op\": \"replace\", \"path\": \"/allowHostNetwork\", \"value\": false}]'" },
        { label: 'mutation', description: 'Install a MutatingAdmissionWebhook to block future hostNetwork violations at admission time', command: 'oc apply -f - <<EOF\napiVersion: admissionregistration.k8s.io/v1\nkind: MutatingWebhookConfiguration\nmetadata:\n  name: hostnetwork-guard\nEOF' },
      ],
      verificationSteps: {
        description: 'Confirm the SCC patch is applied and no new hostNetwork deployments can be admitted to the cluster.',
        steps: [
          { id: 'scc-patched', command: "oc get securitycontextconstraints restricted -o jsonpath='{.allowHostNetwork}'", expected: "Expected: 'false' — confirming host network access is denied at the SCC level." },
          { id: 'webhook-registered', command: 'oc get mutatingwebhookconfiguration hostnetwork-guard -o name', expected: "Expected: 'mutatingwebhookconfiguration.admissionregistration.k8s.io/hostnetwork-guard' — the admission webhook is registered and will block future violations." },
          { id: 'no-active-violations', command: "oc get pods --all-namespaces -o json | jq '[.items[] | select(.spec.hostNetwork==true)] | length'", expected: "Expected: '0' — no running pods are using host networking outside of system-privileged namespaces." },
        ],
      },
      rbac: {
        summary: 'Includes write: patch securitycontextconstraints · create mutatingwebhookconfigurations',
        namespaceScope: {
          namespace: 'production',
          rules: [
            { resource: 'pods', verbs: 'get, list', purpose: 'Pre-check running pods with hostNetwork before mutation', isWrite: false },
            { resource: 'deployments (apps)', verbs: 'get, list', purpose: 'Identify non-compliant deployment specs', isWrite: false },
          ],
        },
        clusterScope: {
          rules: [
            { resource: 'securitycontextconstraints (security.openshift.io)', verbs: 'get, list, patch, update', purpose: 'Modify SCC to deny cluster-wide host network access', isWrite: true },
            { resource: 'mutatingwebhookconfigurations (admissionregistration.k8s.io)', verbs: 'get, create, patch', purpose: 'Install admission webhook to block future hostNetwork violations', isWrite: true },
          ],
        },
      },
    },
    {
      id: 'ap8-o2', title: 'Force-delete non-compliant deployment', description: 'Immediately delete the offending deployment to eliminate the compliance violation — requires manual redeployment with a compliant spec.', risk: 'high', reversible: 'Irreversible', model: 'fast',
      rawCommands: "oc delete deployment -n production -l 'security.redhat.com/non-compliant=true'",
      commands: [
        { label: 'pre-check', description: 'List deployments tagged as non-compliant before deletion', command: "oc get deployment -n production -l 'security.redhat.com/non-compliant=true'" },
        { label: 'mutation', description: 'Delete all non-compliant deployments from the production namespace', command: "oc delete deployment -n production -l 'security.redhat.com/non-compliant=true'" },
      ],
      verificationSteps: {
        description: 'Confirm all non-compliant deployments have been removed and no associated pods remain in the production namespace.',
        steps: [
          { id: 'deployments-removed', command: "oc get deployment -n production -l 'security.redhat.com/non-compliant=true' --no-headers | wc -l", expected: "Expected: '0' — no non-compliant deployments remain in the production namespace." },
          { id: 'pods-terminated', command: "oc get pods -n production -l 'security.redhat.com/non-compliant=true' --no-headers | wc -l", expected: "Expected: '0' — all pods belonging to the deleted deployments have terminated." },
        ],
      },
      rbac: {
        summary: 'Includes write: delete deployments',
        namespaceScope: {
          namespace: 'production',
          rules: [
            { resource: 'deployments (apps)', verbs: 'get, list, delete', purpose: 'List and delete deployments tagged as non-compliant', isWrite: true },
            { resource: 'pods', verbs: 'get, list', purpose: 'Confirm pod shutdown after deployment deletion', isWrite: false },
          ],
        },
      },
    },
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
    {
      id: 'cp1-o1', title: 'Supported minor upgrade 4.14 → 4.15 with rolling node cadence', description: 'Apply the ClusterVersion update to 4.15 using the supported upgrade graph with automated worker cordon, drain, and reboot sequencing.', risk: 'high', reversible: 'Irreversible', model: 'smart',
      rawCommands: 'oc adm upgrade --to-image=quay.io/openshift-release-dev/ocp-release:4.15.8-x86_64 --allow-explicit-upgrade',
      commands: [
        { label: 'pre-check', description: 'Verify all ClusterOperators are healthy and the upgrade path to 4.15 is available', command: 'oc adm upgrade --to=4.15 --allow-missing-images=false --dry-run=client' },
        { label: 'pre-check', description: 'Confirm etcd quorum and control plane health before initiating the upgrade', command: 'oc get etcd cluster -o jsonpath=\'{.status.conditions[?(@.type=="EtcdMembersAvailable")].status}\'' },
        { label: 'mutation', description: 'Initiate rolling cluster upgrade to 4.15.8 via the supported upgrade graph with automated node cordon/drain', command: 'oc adm upgrade --to-image=quay.io/openshift-release-dev/ocp-release:4.15.8-x86_64 --allow-explicit-upgrade' },
      ],
      verificationSteps: {
        description: 'Confirm the cluster has upgraded to 4.15.8 and all ClusterOperators have recovered to an Available, non-degraded state.',
        steps: [
          { id: 'cluster-version', command: "oc get clusterversion version -o jsonpath='{.status.history[0].version}'", expected: "Expected: '4.15.8' — confirming the active cluster version matches the requested upgrade target." },
          { id: 'operators-available', command: "oc get clusteroperators --no-headers | awk '{print $3, $4, $5}' | sort | uniq -c", expected: "Expected: All ClusterOperators report 'True False False' (Available=True, Progressing=False, Degraded=False). No degraded operators should remain." },
          { id: 'nodes-ready', command: "oc get nodes --no-headers | awk '{print $2}' | sort | uniq -c", expected: "Expected: All nodes report 'Ready'. No nodes should remain in 'NotReady' or 'SchedulingDisabled' state after upgrade completion." },
        ],
      },
      rbac: {
        summary: 'Includes write: update clusterversions',
        clusterScope: {
          rules: [
            { resource: 'clusterversions (config.openshift.io)', verbs: 'get, update, patch', purpose: 'Initiate and track rolling upgrade to 4.15.8 via upgrade graph', isWrite: true },
            { resource: 'clusteroperators (config.openshift.io)', verbs: 'get, list, watch', purpose: 'Gate upgrade on all ClusterOperators being healthy before and after', isWrite: false },
            { resource: 'nodes', verbs: 'get, list', purpose: 'Verify all nodes are Ready after upgrade completion', isWrite: false },
          ],
        },
      },
    },
    {
      id: 'cp1-o2', title: 'Preflight validation only (defer execution)', description: 'Run upgrade preflight checks and ClusterOperator health gates without mutating the control plane — defers execution until a maintenance window is approved.', risk: 'low', reversible: 'Reversible', model: 'fast',
      rawCommands: 'oc adm upgrade --to=4.15 --allow-missing-images=false --dry-run=client',
      commands: [
        { label: 'pre-check', description: 'Run upgrade preflight checks and ClusterOperator health gates without mutating the control plane', command: 'oc adm upgrade --to=4.15 --allow-missing-images=false --dry-run=client' },
      ],
      verificationSteps: {
        description: 'Confirm the preflight dry-run completed without fatal errors and the cluster is in a state ready for an upgrade execution window.',
        steps: [
          { id: 'preflight-exit-code', command: 'oc adm upgrade --to=4.15 --allow-missing-images=false --dry-run=client; echo "Preflight exit: $?"', expected: "Expected: Exit code 0 with no ClusterOperator degradation warnings — the upgrade path is validated and clear for a production run." },
        ],
      },
      rbac: {
        summary: 'Read-only · no write operations required',
        clusterScope: {
          rules: [
            { resource: 'clusterversions (config.openshift.io)', verbs: 'get, watch', purpose: 'Read upgrade graph and validate target version availability', isWrite: false },
            { resource: 'clusteroperators (config.openshift.io)', verbs: 'get, list', purpose: 'Gate preflight on all ClusterOperators being healthy', isWrite: false },
          ],
        },
      },
    },
  ],
  op2: [
    {
      id: 'op2-o1', title: 'Rotate Alertmanager PagerDuty secret + rolling reload', description: 'Replace the expired PagerDuty integration key in the alertmanager-main secret and trigger a rolling reload of alertmanager pods in openshift-monitoring.', risk: 'low', reversible: 'Reversible', model: 'smart',
      rawCommands: 'oc create secret generic alertmanager-pagerduty --from-literal=pagerduty.integration-key=$PAGERDUTY_KEY -n openshift-monitoring --dry-run=client -o yaml | oc apply -f - && oc rollout restart statefulset/alertmanager-main -n openshift-monitoring',
      commands: [
        { label: 'mutation', description: 'Rotate the PagerDuty integration key in the alertmanager-main secret', command: 'oc create secret generic alertmanager-pagerduty --from-literal=pagerduty.integration-key=$PAGERDUTY_KEY -n openshift-monitoring --dry-run=client -o yaml | oc apply -f -' },
        { label: 'mutation', description: 'Trigger a rolling reload of Alertmanager pods to pick up the new integration secret', command: 'oc rollout restart statefulset/alertmanager-main -n openshift-monitoring' },
      ],
      verificationSteps: {
        description: 'Confirm the secret is updated and Alertmanager is delivering notifications to PagerDuty without delivery failures.',
        steps: [
          { id: 'secret-updated', command: "oc get secret alertmanager-pagerduty -n openshift-monitoring -o jsonpath='{.metadata.resourceVersion}'", expected: "Expected: A new resourceVersion value — confirming the secret was replaced with the rotated PagerDuty integration key." },
          { id: 'alertmanager-ready', command: 'oc rollout status statefulset/alertmanager-main -n openshift-monitoring --timeout=3m', expected: "Expected: 'statefulset rolling update complete 3 pods at revision alertmanager-main-...' — all pods restarted and are running with the new secret." },
          { id: 'no-delivery-errors', command: "oc logs -n openshift-monitoring alertmanager-main-0 --since=2m | grep -i 'pagerduty.*error\\|failed.*pagerduty' || echo 'none'", expected: "Expected: 'none' — no PagerDuty delivery error lines in the 2-minute window following the rolling restart." },
        ],
      },
      rbac: {
        summary: 'Includes write: patch secrets · patch statefulsets',
        namespaceScope: {
          namespace: 'openshift-monitoring',
          rules: [
            { resource: 'secrets', verbs: 'get, create, patch', purpose: 'Rotate PagerDuty integration key in alertmanager-pagerduty secret', isWrite: true },
            { resource: 'statefulsets (apps)', verbs: 'get, patch', purpose: 'Trigger rolling restart of alertmanager-main to pick up the new secret', isWrite: true },
            { resource: 'pods', verbs: 'get, list', purpose: 'Monitor pod restart progress during rolling reload', isWrite: false },
          ],
        },
      },
    },
    {
      id: 'op2-o2', title: 'Temporarily disable PagerDuty receiver route', description: 'Silence the PagerDuty receiver in Alertmanager configuration to stop delivery failures while the integration token is rotated manually.', risk: 'medium', reversible: 'Partial', model: 'fast',
      rawCommands: 'oc patch secret alertmanager-main -n openshift-monitoring --type merge -p \'{"data":{"alertmanager.yaml":"<route with null receiver for pagerduty>"}}\' && oc delete pod alertmanager-main-0 -n openshift-monitoring',
      commands: [
        { label: 'mutation', description: 'Silence the PagerDuty receiver route in Alertmanager configuration to stop failed delivery attempts', command: 'oc patch secret alertmanager-main -n openshift-monitoring --type merge -p \'{"data":{"alertmanager.yaml":"<route with null receiver for pagerduty>"}}\'' },
        { label: 'cleanup', description: 'Force-restart the Alertmanager pod to apply the silenced receiver configuration', command: 'oc delete pod alertmanager-main-0 -n openshift-monitoring' },
      ],
      verificationSteps: {
        description: 'Confirm the PagerDuty receiver has been silenced and delivery failure errors are no longer appearing in Alertmanager logs.',
        steps: [
          { id: 'pagerduty-route-silenced', command: "oc get secret alertmanager-main -n openshift-monitoring -o jsonpath='{.data.alertmanager\\.yaml}' | base64 -d | grep -i pagerduty", expected: "Expected: The PagerDuty receiver is absent or routes to a null receiver — no delivery attempts in the next alert evaluation cycle." },
          { id: 'alertmanager-error-rate', command: "oc logs -n openshift-monitoring alertmanager-main-0 --since=3m | grep -i 'pagerduty\\|error\\|failed' || echo 'none'", expected: "Expected: 'none' — no new PagerDuty delivery error lines in the 3-minute window after the pod restart." },
        ],
      },
      rbac: {
        summary: 'Includes write: patch secrets · delete pods',
        namespaceScope: {
          namespace: 'openshift-monitoring',
          rules: [
            { resource: 'secrets', verbs: 'get, patch', purpose: 'Silence PagerDuty route in Alertmanager configuration secret', isWrite: true },
            { resource: 'pods', verbs: 'get, list, delete', purpose: 'Force-restart alertmanager-main-0 to apply the silenced config', isWrite: true },
          ],
        },
      },
    },
  ],
  op3: [
    {
      id: 'op3-o1', title: 'Quarantine corrupted block and restart compactor', description: 'Remove the corrupted TSDB block from thanos-compactor-data PVC and restart the compactor pod with a clean compaction window.', risk: 'medium', reversible: 'Partial', model: 'smart',
      rawCommands: 'oc scale statefulset/thanos-compactor --replicas=0 -n openshift-monitoring && oc rsh -n openshift-monitoring thanos-compactor-0 -- rm -rf /var/thanos/compact/data/01HX* && oc scale statefulset/thanos-compactor --replicas=1 -n openshift-monitoring',
      commands: [
        { label: 'pre-check', description: 'Scale Thanos compactor to zero to safely access the PVC without data corruption', command: 'oc scale statefulset/thanos-compactor --replicas=0 -n openshift-monitoring' },
        { label: 'mutation', description: 'Remove the corrupted TSDB block from the compactor data volume', command: 'oc rsh -n openshift-monitoring thanos-compactor-0 -- rm -rf /var/thanos/compact/data/01HX*' },
        { label: 'cleanup', description: 'Scale the compactor back up to resume compaction with a clean state', command: 'oc scale statefulset/thanos-compactor --replicas=1 -n openshift-monitoring' },
      ],
      verificationSteps: {
        description: 'Confirm the corrupted TSDB block is removed and the compactor has resumed processing without errors.',
        steps: [
          { id: 'block-removed', command: "oc rsh -n openshift-monitoring thanos-compactor-0 -- ls /var/thanos/compact/data/ | grep 01HX || echo 'none'", expected: "Expected: 'none' — the quarantined TSDB block is no longer present in the compactor data volume." },
          { id: 'compactor-running', command: 'oc rollout status statefulset/thanos-compactor -n openshift-monitoring --timeout=2m', expected: "Expected: 'statefulset rolling update complete 1 pods at revision thanos-compactor-...' — the compactor pod is running with a clean compaction state." },
          { id: 'compaction-healthy', command: "oc logs -n openshift-monitoring thanos-compactor-0 --since=5m | grep -iE 'error|corrupted|failed' || echo 'no errors'", expected: "Expected: 'no errors' — no corruption or compaction failure entries in the first 5 minutes after restart." },
        ],
      },
      rbac: {
        summary: 'Includes write: patch statefulsets · exec pods',
        namespaceScope: {
          namespace: 'openshift-monitoring',
          rules: [
            { resource: 'statefulsets (apps)', verbs: 'get, list, patch', purpose: 'Scale thanos-compactor to zero then back to one for safe PVC access', isWrite: true },
            { resource: 'pods', verbs: 'get, list, exec', purpose: 'Exec into compactor pod to remove the corrupted TSDB block', isWrite: true },
          ],
        },
        clusterScope: {
          rules: [
            { resource: 'nodes', verbs: 'get, list', purpose: 'Check node disk pressure before scaling compactor — abort if storage is constrained', isWrite: false },
            { resource: 'storageclasses (storage.k8s.io)', verbs: 'get', purpose: 'Verify the storage class supports ReadWriteOnce before PVC re-attachment', isWrite: false },
          ],
        },
      },
    },
    {
      id: 'op3-o2', title: 'Expand compactor PVC and force compaction', description: 'Resize the compactor persistent volume and run a forced compaction cycle — higher blast radius during PVC resize.', risk: 'high', reversible: 'Irreversible', model: 'fast',
      rawCommands: 'oc patch pvc/thanos-compactor-data -n openshift-monitoring -p \'{"spec":{"resources":{"requests":{"storage":"200Gi"}}}}\' && oc delete pod thanos-compactor-0 -n openshift-monitoring',
      commands: [
        { label: 'mutation', description: 'Resize the thanos-compactor PVC to 200 GiB to accommodate compaction growth', command: 'oc patch pvc/thanos-compactor-data -n openshift-monitoring -p \'{"spec":{"resources":{"requests":{"storage":"200Gi"}}}}\'' },
        { label: 'cleanup', description: 'Delete the compactor pod to force re-attachment and compaction restart on the resized PVC', command: 'oc delete pod thanos-compactor-0 -n openshift-monitoring' },
      ],
      verificationSteps: {
        description: 'Confirm the PVC has been resized and the compactor restarted cleanly on the new storage allocation.',
        steps: [
          { id: 'pvc-resized', command: "oc get pvc thanos-compactor-data -n openshift-monitoring -o jsonpath='{.status.capacity.storage}'", expected: "Expected: '200Gi' — confirming the PVC has been resized to the target capacity." },
          { id: 'compactor-running', command: 'oc rollout status statefulset/thanos-compactor -n openshift-monitoring --timeout=2m', expected: "Expected: 'statefulset rolling update complete' — the compactor pod has restarted and is attached to the resized volume." },
        ],
      },
      rbac: {
        summary: 'Includes write: patch persistentvolumeclaims · delete pods',
        namespaceScope: {
          namespace: 'openshift-monitoring',
          rules: [
            { resource: 'persistentvolumeclaims', verbs: 'get, patch', purpose: 'Resize thanos-compactor-data PVC to 200 GiB storage', isWrite: true },
            { resource: 'pods', verbs: 'get, list, delete', purpose: 'Delete compactor pod to force re-attachment on the resized PVC', isWrite: true },
          ],
        },
      },
    },
  ],
  op5: [
    {
      id: 'op5-o1', title: 'Clear stale Grafana SQLite WAL lock + controlled restart', description: 'Scale grafana to zero, remove the stale SQLite WAL lock file on the shared PVC, verify filesystem consistency, and restart the deployment.', risk: 'medium', reversible: 'Reversible', model: 'smart',
      rawCommands: 'oc scale deployment/grafana --replicas=0 -n openshift-monitoring && oc rsh -n openshift-monitoring grafana-debug -- rm -f /var/lib/grafana/grafana.db-wal && oc scale deployment/grafana --replicas=1 -n openshift-monitoring',
      commands: [
        { label: 'pre-check', description: 'Scale Grafana to zero to safely access the shared PVC without concurrent writes', command: 'oc scale deployment/grafana --replicas=0 -n openshift-monitoring' },
        { label: 'mutation', description: 'Remove the stale SQLite WAL lock file that is preventing Grafana from starting', command: 'oc rsh -n openshift-monitoring grafana-debug -- rm -f /var/lib/grafana/grafana.db-wal' },
        { label: 'cleanup', description: 'Restart Grafana deployment with a clean database lock state', command: 'oc scale deployment/grafana --replicas=1 -n openshift-monitoring' },
      ],
      verificationSteps: {
        description: 'Confirm the WAL lock is removed and Grafana is accessible and serving dashboards without database errors.',
        steps: [
          { id: 'wal-lock-removed', command: "oc rsh -n openshift-monitoring grafana-debug -- ls /var/lib/grafana/ | grep grafana.db-wal || echo 'none'", expected: "Expected: 'none' — the stale SQLite WAL lock file has been removed from the Grafana PVC." },
          { id: 'grafana-ready', command: 'oc rollout status deployment/grafana -n openshift-monitoring --timeout=3m', expected: "Expected: 'deployment grafana successfully rolled out' — Grafana is running and ready to serve dashboard requests." },
          { id: 'grafana-health', command: "oc exec -n openshift-monitoring deploy/grafana -- curl -sf http://localhost:3000/api/health", expected: "Expected: '{\"database\": \"ok\", \"health\": \"ok\"}' — Grafana health endpoint confirms the database layer is healthy." },
        ],
      },
      rbac: {
        summary: 'Includes write: patch deployments · exec pods',
        namespaceScope: {
          namespace: 'openshift-monitoring',
          rules: [
            { resource: 'deployments (apps)', verbs: 'get, patch', purpose: 'Scale grafana to zero and back to one for safe PVC access', isWrite: true },
            { resource: 'pods', verbs: 'get, list, exec', purpose: 'Exec into grafana-debug pod to remove the stale WAL lock file', isWrite: true },
          ],
        },
      },
    },
    {
      id: 'op5-o2', title: 'Snapshot PVC then force WAL checkpoint', description: 'Take a volume snapshot of the Grafana PVC and run a forced SQLite checkpoint before clearing the lock — slower but preserves rollback capability.', risk: 'low', reversible: 'Reversible', model: 'fast',
      rawCommands: 'oc create -f grafana-pvc-snapshot.yaml && oc exec -n openshift-monitoring deploy/grafana -- sqlite3 /var/lib/grafana/grafana.db "PRAGMA wal_checkpoint(FULL);"',
      commands: [
        { label: 'pre-check', description: 'Create a PVC snapshot of the Grafana volume before any mutation to preserve rollback capability', command: 'oc create -f grafana-pvc-snapshot.yaml' },
        { label: 'mutation', description: 'Force a full SQLite WAL checkpoint to flush all pending writes and clear the stale lock', command: 'oc exec -n openshift-monitoring deploy/grafana -- sqlite3 /var/lib/grafana/grafana.db "PRAGMA wal_checkpoint(FULL);"' },
      ],
      verificationSteps: {
        description: 'Confirm the PVC snapshot was created successfully and the WAL checkpoint completed without leaving residual lock frames.',
        steps: [
          { id: 'snapshot-ready', command: "oc get volumesnapshot grafana-pvc-snapshot -n openshift-monitoring -o jsonpath='{.status.readyToUse}'", expected: "Expected: 'true' — the PVC snapshot is ready and available as a rollback point if subsequent steps fail." },
          { id: 'wal-checkpoint-done', command: 'oc exec -n openshift-monitoring deploy/grafana -- sqlite3 /var/lib/grafana/grafana.db "PRAGMA wal_checkpoint(FULL);" 2>&1', expected: "Expected: '0 N 0' — blocked_count=0 confirms no writers are blocked; all WAL frames have been checkpointed to the main database file." },
          { id: 'grafana-ready', command: 'oc rollout status deployment/grafana -n openshift-monitoring --timeout=3m', expected: "Expected: 'deployment grafana successfully rolled out' — Grafana is running without SQLite lock contention." },
        ],
      },
      rbac: {
        summary: 'Includes write: create volumesnapshots · exec pods',
        namespaceScope: {
          namespace: 'openshift-monitoring',
          rules: [
            { resource: 'volumesnapshots (snapshot.storage.k8s.io)', verbs: 'get, create', purpose: 'Take PVC snapshot before WAL checkpoint as a rollback point', isWrite: true },
            { resource: 'pods', verbs: 'get, exec', purpose: 'Exec into Grafana container to run SQLite WAL checkpoint', isWrite: true },
          ],
        },
      },
    },
  ],
  'quota-exhaustion-escalating': [
    { id: 'quota-esc-o1', title: 'Grant scoped quota-editor ClusterRole binding to automation service account', description: 'Create a ClusterRole with resourcequotas patch permissions and bind it to the automation service account. This unblocks the agent from self-remediating future quota events without requiring full cluster-admin.', risk: 'medium', reversible: 'Reversible', model: 'smart', rawCommands: `oc create clusterrole quota-editor --verb=get,list,watch,update,patch --resource=resourcequotas
oc create clusterrolebinding quota-agent-editor --clusterrole=quota-editor --serviceaccount=openshift-agentic:quota-agent` },
    { id: 'quota-esc-o2', title: 'Manually increase ResourceQuota limits across affected namespaces', description: 'Directly patch the ResourceQuota objects in retail-prod, payments-staging, and auth-dev to increase CPU and memory limits by 50% to restore pod scheduling headroom.', risk: 'low', reversible: 'Reversible', model: 'fast', rawCommands: `oc patch resourcequota/compute-resources -n retail-prod -p '{"spec":{"hard":{"requests.cpu":"12","requests.memory":"48Gi"}}}'
oc patch resourcequota/compute-resources -n payments-staging -p '{"spec":{"hard":{"requests.cpu":"8","requests.memory":"32Gi"}}}'
oc patch resourcequota/compute-resources -n auth-dev -p '{"spec":{"hard":{"requests.cpu":"4","requests.memory":"16Gi"}}}'` },
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
    failureReason: 'etcd defragmentation executed across etcd-master-01, etcd-master-02, and etcd-master-03, but post-execution verification failed. The fragmentation ratio remained at 0.67 — unchanged from the pre-execution baseline. The auto-compaction window had not completed prior to defrag execution, leaving logical space unreclaimed. Defragmentation cannot recover space that has not been compacted. Manual compaction of the etcd revision history is required before re-executing this run.',
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
[09:15:09 UTC] Recommendation: run etcdctl compact <latest-revision> then re-execute this run.
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

// ─── Execution & Verification Summary mock data ──────────────────────────────

const PLAN_EXECUTION_SUMMARY: Record<string, ExecutionSummaryData> = {
  op1: {
    targetedRootCause: 'A clock skew of +847 ms on 3 OpenShift nodes caused Prometheus target scrapes to fail TLS certificate time-validation checks.',
    remediationDelta: 'Updated the NTP pool to ntp.corp.redhat.com on all 3 affected nodes and restarted chrony-sync-daemon to resynchronize clocks.',
    actionsTaken: [
      { category: 'mutation', status: 'Succeeded', description: 'Update NTP pool config and restart chrony on node-1', command: 'chronyc makestep && systemctl restart chronyd', output: 'chrony-sync-daemon on node-1: restarted (offset was +847ms)' },
      { category: 'mutation', status: 'Succeeded', description: 'Update NTP pool config and restart chrony on node-2', command: 'chronyc makestep && systemctl restart chronyd', output: 'chrony-sync-daemon on node-2: restarted (offset was +851ms)' },
      { category: 'mutation', status: 'Succeeded', description: 'Update NTP pool config and restart chrony on node-3', command: 'chronyc makestep && systemctl restart chronyd', output: 'chrony-sync-daemon on node-3: restarted (offset was +843ms)' },
    ],
  },
  op2: {
    targetedRootCause: 'The alertmanager-main PagerDuty integration key expired, causing all PagerDuty-routed alerts to fail delivery with HTTP 403 errors.',
    remediationDelta: 'Replaced the expired alertmanager-pagerduty secret with a rotated integration key and triggered a rolling restart of the 3-pod alertmanager-main StatefulSet.',
    actionsTaken: [
      { category: 'mutation', status: 'Succeeded', description: 'Rotate PagerDuty integration key in alertmanager-pagerduty secret', command: 'oc create secret generic alertmanager-pagerduty --from-literal=pagerduty.integration-key=$PAGERDUTY_KEY -n openshift-monitoring --dry-run=client -o yaml | oc apply -f -', output: 'secret/alertmanager-pagerduty configured' },
      { category: 'mutation', status: 'Succeeded', description: 'Trigger rolling reload of alertmanager pods to pick up rotated credentials', command: 'oc rollout restart statefulset/alertmanager-main -n openshift-monitoring', output: 'statefulset.apps/alertmanager-main restarted' },
    ],
  },
  op3: {
    targetedRootCause: 'A corrupted TSDB compaction block (01HX...) caused thanos-compactor to crash-loop, halting metric compaction and growing storage usage.',
    remediationDelta: 'Scaled thanos-compactor to zero, removed the corrupted TSDB block from the PVC, then restarted the compactor with a clean compaction state.',
    actionsTaken: [
      { category: 'pre-check', status: 'Succeeded', description: 'Scale compactor to zero to safely access the PVC', command: 'oc scale statefulset/thanos-compactor --replicas=0 -n openshift-monitoring', output: 'statefulset.apps/thanos-compactor scaled' },
      { category: 'mutation', status: 'Succeeded', description: 'Remove corrupted TSDB block from the compactor data volume', command: 'oc rsh -n openshift-monitoring thanos-compactor-0 -- rm -rf /var/thanos/compact/data/01HX*', output: "removed '/var/thanos/compact/data/01HXQ4P6R3N2M8Y7K0C5D9F1'" },
      { category: 'cleanup', status: 'Succeeded', description: 'Scale compactor back to resume compaction with a clean state', command: 'oc scale statefulset/thanos-compactor --replicas=1 -n openshift-monitoring', output: 'statefulset.apps/thanos-compactor scaled' },
    ],
  },
  op5: {
    targetedRootCause: 'A stale SQLite WAL lock file on the Grafana PVC prevented Grafana from starting after an unclean pod shutdown.',
    remediationDelta: 'Scaled Grafana to zero, removed the stale grafana.db-wal lock file, and restarted the deployment to bring Grafana back online.',
    actionsTaken: [
      { category: 'pre-check', status: 'Succeeded', description: 'Scale Grafana to zero to safely access the shared PVC', command: 'oc scale deployment/grafana --replicas=0 -n openshift-monitoring', output: 'deployment.apps/grafana scaled' },
      { category: 'mutation', status: 'Succeeded', description: 'Remove stale SQLite WAL lock file causing startup failure', command: 'oc rsh -n openshift-monitoring grafana-debug -- rm -f /var/lib/grafana/grafana.db-wal', output: "removed '/var/lib/grafana/grafana.db-wal'" },
      { category: 'cleanup', status: 'Succeeded', description: 'Restart Grafana deployment with a clean database lock state', command: 'oc scale deployment/grafana --replicas=1 -n openshift-monitoring', output: 'deployment.apps/grafana scaled' },
    ],
  },
  ap8: {
    targetedRootCause: 'A deployment in the production namespace was running with hostNetwork: true, violating the cluster security policy and exposing host network interfaces.',
    remediationDelta: 'Patched the SecurityContextConstraints to deny hostNetwork access and installed a MutatingAdmissionWebhook to prevent future violations at admission time.',
    actionsTaken: [
      { category: 'pre-check', status: 'Succeeded', description: 'Verify current SCC allowHostNetwork setting before patching', command: "oc get securitycontextconstraints restricted -o jsonpath='{.allowHostNetwork}'", output: 'true' },
      { category: 'mutation', status: 'Succeeded', description: 'Patch SCC to deny host network access cluster-wide', command: "oc patch securitycontextconstraints restricted --type='json' -p='[{\"op\": \"replace\", \"path\": \"/allowHostNetwork\", \"value\": false}]'", output: 'securitycontextconstraints.security.openshift.io/restricted patched' },
      { category: 'mutation', status: 'Succeeded', description: 'Install MutatingAdmissionWebhook to block future hostNetwork violations', command: 'oc apply -f - <<EOF\napiVersion: admissionregistration.k8s.io/v1\nkind: MutatingWebhookConfiguration\nmetadata:\n  name: hostnetwork-guard\nEOF', output: 'mutatingwebhookconfiguration.admissionregistration.k8s.io/hostnetwork-guard created' },
    ],
  },
  'etcd-defrag-failed': {
    targetedRootCause: 'EtcdDatabaseHighFragmentationRatio exceeded 65% across all 3 control plane members, causing API write amplification and P99 latency above 1.2 s.',
    remediationDelta: 'Attempted etcd defragmentation sequentially across etcd-master-01, etcd-master-02, and etcd-master-03. Commands completed but post-execution verification found the fragmentation ratio unchanged at 0.67.',
    actionsTaken: [
      { category: 'mutation', status: 'Succeeded', description: 'Defragment etcd on etcd-master-01', command: 'etcdctl defrag --endpoints=https://etcd-master-01:2379', output: 'Finished defragmenting etcd member[https://etcd-master-01:2379]' },
      { category: 'mutation', status: 'Succeeded', description: 'Defragment etcd on etcd-master-02', command: 'etcdctl defrag --endpoints=https://etcd-master-02:2379', output: 'Finished defragmenting etcd member[https://etcd-master-02:2379]' },
      { category: 'mutation', status: 'Succeeded', description: 'Defragment etcd on etcd-master-03', command: 'etcdctl defrag --endpoints=https://etcd-master-03:2379', output: 'Finished defragmenting etcd member[https://etcd-master-03:2379]' },
      { category: 'verification', status: 'Failed', description: 'Verify fragmentation ratio has been reduced', command: 'etcdctl endpoint status --endpoints=https://etcd-master-01:2379 --write-out=table', output: 'fragmentation_ratio: 0.67 — unchanged from pre-execution baseline (0.67). Compaction window had not run prior to defrag.' },
    ],
  },
};

const PLAN_VERIFICATION_SUMMARY: Record<string, VerificationSummaryData> = {
  op1: {
    outcomeAssessment: [
      'Clock offset delta fell below 1 ms across all 3 nodes after NTP resynchronization.',
      'NodeClockSkewDetected alert resolved — no longer firing in any namespace.',
      'Prometheus target scrape success rate returned to 100% within 2 minutes of clock correction.',
    ],
    checks: [
      { id: 'clock-offset', status: 'Passed', command: 'chronyc tracking | grep "System time"', output: 'System time: 0.000023104 seconds fast of NTP time — offset < 1 ms confirmed.' },
      { id: 'alert-resolved', status: 'Passed', command: "oc get prometheusrule -A -o json | jq '.items[].spec.groups[].rules[] | select(.alert==\"NodeClockSkewDetected\") | .labels.severity'", output: 'NodeClockSkewDetected: resolved' },
      { id: 'prometheus-targets', status: 'Passed', command: 'curl -s http://prometheus-k8s.openshift-monitoring:9090/api/v1/query?query=up | jq .data.result[].value[1]', output: '"1" — all Prometheus targets reporting up=1 (100% scrape success)' },
    ],
  },
  op2: {
    outcomeAssessment: [
      'alertmanager-main pods restarted successfully with the rotated PagerDuty integration key.',
      'PagerDuty alert delivery resumed — no HTTP 403 errors in the 2-minute post-restart window.',
      'All 3 alertmanager-main pods are in Running state and Ready.',
    ],
    checks: [
      { id: 'secret-updated', status: 'Passed', command: "oc get secret alertmanager-pagerduty -n openshift-monitoring -o jsonpath='{.metadata.resourceVersion}'", output: 'resourceVersion: "487231" — secret replaced with rotated key.' },
      { id: 'alertmanager-ready', status: 'Passed', command: 'oc rollout status statefulset/alertmanager-main -n openshift-monitoring --timeout=3m', output: 'statefulset rolling update complete 3 pods at revision alertmanager-main-2' },
      { id: 'no-delivery-errors', status: 'Passed', command: "oc logs -n openshift-monitoring alertmanager-main-0 --since=2m | grep -i 'pagerduty.*error\\|failed.*pagerduty' || echo 'none'", output: 'none' },
    ],
  },
  op3: {
    outcomeAssessment: [
      'Corrupted TSDB block removed from the compactor data volume without data loss.',
      'thanos-compactor restarted successfully and resumed compaction with a clean state.',
      'No compaction error or corruption log entries in the 5-minute post-restart window.',
    ],
    checks: [
      { id: 'block-removed', status: 'Passed', command: "oc rsh -n openshift-monitoring thanos-compactor-0 -- ls /var/thanos/compact/data/ | grep 01HX || echo 'none'", output: 'none — corrupted TSDB block successfully removed.' },
      { id: 'compactor-running', status: 'Passed', command: 'oc rollout status statefulset/thanos-compactor -n openshift-monitoring --timeout=2m', output: 'statefulset rolling update complete 1 pods at revision thanos-compactor-4' },
      { id: 'compaction-healthy', status: 'Passed', command: "oc logs -n openshift-monitoring thanos-compactor-0 --since=5m | grep -iE 'error|corrupted|failed' || echo 'no errors'", output: 'no errors' },
    ],
  },
  op5: {
    outcomeAssessment: [
      'Stale SQLite WAL lock file successfully removed from the Grafana PVC.',
      'Grafana deployment rolled out with 1 pod in Running state.',
      'Grafana health endpoint confirms database: ok — dashboard serving resumed.',
    ],
    checks: [
      { id: 'wal-lock-removed', status: 'Passed', command: "oc rsh -n openshift-monitoring grafana-debug -- ls /var/lib/grafana/ | grep grafana.db-wal || echo 'none'", output: 'none — stale WAL lock file is no longer present.' },
      { id: 'grafana-ready', status: 'Passed', command: 'oc rollout status deployment/grafana -n openshift-monitoring --timeout=3m', output: 'deployment "grafana" successfully rolled out' },
      { id: 'grafana-health', status: 'Passed', command: 'oc exec -n openshift-monitoring deploy/grafana -- curl -sf http://localhost:3000/api/health', output: '{"database": "ok", "health": "ok", "version": "10.2.3"}' },
    ],
  },
  ap8: {
    outcomeAssessment: [
      'SecurityContextConstraints allowHostNetwork is now set to false cluster-wide.',
      'MutatingAdmissionWebhook hostnetwork-guard is registered and active at admission time.',
      'Zero running pods in non-system namespaces are using host network access.',
    ],
    checks: [
      { id: 'scc-patched', status: 'Passed', command: "oc get securitycontextconstraints restricted -o jsonpath='{.allowHostNetwork}'", output: 'false — host network access denied at the SCC level.' },
      { id: 'webhook-registered', status: 'Passed', command: 'oc get mutatingwebhookconfiguration hostnetwork-guard -o name', output: 'mutatingwebhookconfiguration.admissionregistration.k8s.io/hostnetwork-guard' },
      { id: 'no-active-violations', status: 'Passed', command: "oc get pods --all-namespaces -o json | jq '[.items[] | select(.spec.hostNetwork==true)] | length'", output: '0 — no running pods using host networking outside of system namespaces.' },
    ],
  },
  'etcd-defrag-failed': {
    outcomeAssessment: [
      'Defragmentation commands executed without errors on all 3 etcd members.',
      'Post-defrag verification shows fragmentation ratio at 0.67 — unchanged from pre-execution baseline.',
      'Root cause of failure: etcd auto-compaction window had not completed before defrag execution. Manual compaction (etcdctl compact) is required before re-attempting.',
    ],
    checks: [
      { id: 'defrag-commands', status: 'Passed', command: 'etcdctl defrag --endpoints=https://etcd-master-01:2379,https://etcd-master-02:2379,https://etcd-master-03:2379', output: 'Finished defragmenting etcd member on all 3 endpoints.' },
      { id: 'fragmentation-ratio', status: 'Failed', command: 'etcdctl endpoint status --endpoints=https://etcd-master-01:2379 --write-out=table', output: 'fragmentation_ratio: 0.67 (baseline: 0.67) — no improvement detected. Auto-compaction had not run.' },
    ],
  },
};

const PLAN_ESCALATION_SUMMARY: Record<string, EscalationSummaryData> = {
  'ingress-controller-escalated': {
    analysis: [
      'Ingress controller replica count dropped to 1 after a node eviction on worker-bm-03.',
      'Two consecutive automated scale-out executions failed: openshift-ingress namespace quota hard ceiling reached (pods=10/10).',
      'MaxRetriesExhausted threshold reached after 2 failed attempts — escalation automatically dispatched under automatic policy.',
      'Escalation payload routed to PagerDuty (P2) and ServiceNow (INC-0087342).',
    ],
    recommendedNextSteps: [
      'Increase the openshift-ingress ResourceQuota pod limit from 10 to at least 14.',
      'Re-trigger the ingress controller scale-out remediation after quota adjustment.',
      'Review PagerDuty incident and ServiceNow ticket for on-call acknowledgement.',
      'Update quota governance policy to prevent quota ceiling from blocking ingress-class scale events.',
    ],
    dispatchedTargets: ['PagerDuty — P2 incident created', 'ServiceNow — INC-0087342 opened'],
  },
  'quota-exhaustion-escalating': {
    analysis: [
      'Namespace quota exhaustion detected across 3 namespaces: production, staging, and shared-services.',
      'Automated quota expansion retries failed — cluster-level resource ceiling prevents in-place quota increases.',
      'Escalating to human operator for manual cluster resource governance review.',
    ],
    recommendedNextSteps: [
      'Review cluster-level LimitRange and ResourceQuota policies across affected namespaces.',
      'Coordinate with cluster administrator to adjust node capacity or redistribute workloads.',
      'Consider implementing VPA or horizontal autoscaling for workloads hitting quota limits.',
    ],
    dispatchedTargets: [],
  },
  'op5-manual-escalation': {
    analysis: [
      'Failure is in the escalation rendering path, not in the Grafana pod or WAL lock itself.',
      'escalation_request.tmpl tries to access .Success on a value of type v1alpha1.StepResultRef.',
      'Go template execution fails because StepResultRef does not expose a Success field.',
      'Result: the escalation request cannot be generated, so prior failed attempts are not being packaged for handoff.',
    ],
    recommendedNextSteps: [
      'Check the v1alpha1.StepResultRef type definition and confirm the intended field or method.',
      'Fix escalation_request.tmpl line 9 to use a valid property (e.g. .Phase == "Succeeded"), or pass the full step result object instead of a reference.',
      'Add a template/unit test that renders escalation_request.tmpl with a real StepResultRef payload.',
      'Re-run escalation generation after the template/data-model mismatch is corrected.',
    ],
    dispatchedTargets: [],
  },
};

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

type LabelColor = 'blue' | 'teal' | 'orange' | 'green' | 'red' | 'grey' | 'yellow';

const STATUS_LABEL_COLOR: Record<PlanStatus, LabelColor> = {
  'Pending':          'grey',
  'Analyzing':        'blue',
  'Proposed':         'blue',
  'Approved':         'orange',
  'Executing':        'teal',
  'Verifying':        'teal',
  'Acknowledged':     'green',
  'Completed':        'green',
  'Failed':           'red',
  'Denied':           'red',
  // Gold/yellow — SRE attention required, distinct from routine progress (teal/blue) or terminal failure (red).
  'Escalating':       'yellow',
  'Escalated':        'yellow',
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
    const displayLabel = status === 'EmergencyStopped' ? 'Emergency stopped' : 'Run aborted';
    return (
      <Tooltip content={tooltipContent} position="top">
        <span tabIndex={0} style={{ display: 'inline-flex', cursor: 'default' }}>
          <Label color="red" isCompact style={{ whiteSpace: 'nowrap' }}>
            {displayLabel}
          </Label>
        </span>
      </Tooltip>
    );
  }

  return (
    <Label color={STATUS_LABEL_COLOR[status]} isCompact style={{ whiteSpace: 'nowrap' }}>
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

/** Created timestamp shown beneath status on Agentic Run details / hub headers. */
export const WaitingApprovalPlanMeta: React.FC<{ plan: PlanRow }> = ({ plan }) => {
  if (!plan.createdAt) {
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
      whiteSpace: 'nowrap',
    }}
  >
    {label}
  </span>
);

/** OpenShift console–style resource label for Agentic Run resources. */
export const PlanResourceBadge: React.FC = () => (
  <OpenShiftResourceBadge label="AR" backgroundColor="#2b9af3" />
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
    if (!scope || scope === '—') {
      return <>{label}</>;
    }
    return <NamespaceResourceLink name={scope} />;
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

const PlanRowActionsMenu: React.FC<{ planId: string; planName: string; onDelete: (planId: string) => void; isDisabled?: boolean }> = ({
  planId,
  planName,
  onDelete,
  isDisabled = false,
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
          isDisabled={isDisabled}
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
          onClick={() => {
            onDelete(planId);
            setIsOpen(false);
          }}
        >
          Delete run
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
  /** Global Agentic runs list only — domain-scoped lists (e.g. Agentic runs) omit this column. */
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
        <Tr
          key={row.id}
          style={{ verticalAlign: 'middle' }}
        >
          <Td dataLabel="Name" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} flexWrap={{ default: 'nowrap' }}>
              <FlexItem>
                <PlanResourceBadge />
              </FlexItem>
              <FlexItem style={{ flex: '1 1 auto', minWidth: 0 }}>
                <Button
                  variant="link"
                  isInline
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
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }} flexWrap={{ default: 'nowrap' }}>
                <FlexItem>
                  <OutlinedClockIcon
                    style={{ color: 'var(--pf-t--global--icon--color--subtle)', verticalAlign: 'middle' }}
                    aria-hidden
                  />
                </FlexItem>
                <FlexItem>
                  <time dateTime={row.createdAt}>{formatPlanCreatedAt(row.createdAt)}</time>
                </FlexItem>
              </Flex>
            ) : (
              '—'
            )}
          </Td>
          <Td dataLabel="Actions" modifier="fitContent" style={{ textAlign: 'right' }}>
            <PlanRowActionsMenu
              planId={row.id}
              planName={row.name ?? row.id}
              onDelete={onDeletePlan}
              isDisabled={!isAgenticAutomationEnabled}
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

  // ── Delete confirmation modal state ──────────────────────────────────────
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  const requestDelete = useCallback((planId: string) => {
    const row = rows.find((r) => r.id === planId);
    setPendingDelete({ id: planId, name: row?.name ?? planId });
  }, [rows]);

  const handleConfirmDelete = useCallback(() => {
    if (!pendingDelete) return;
    onDeletePlan(pendingDelete.id);
    setPendingDelete(null);
  }, [pendingDelete, onDeletePlan]);

  const handleCancelDelete = useCallback(() => setPendingDelete(null), []);

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
        rows={rows}
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
            onDeletePlan={requestDelete}
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

      <DeleteAgenticRunModal
        isOpen={pendingDelete !== null}
        runName={pendingDelete?.name ?? ''}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

// ─── Drawer: Remediation option card ─────────────────────────────────────────

/**
 * Stacked "View execution logs" / "View verification logs" evidence trail.
 * Shared by `RemediationOptionCard` and the option-less terminal fallback
 * (autonomous runs with no modeled remediation options — see `TerminalEvidenceCard`).
 */
/** Generates deterministic simulated escalation log lines for the escalation logs panel. */
function generateEscalationLogs(planId: string): string {
  const h = planId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const ts = (offset: number) => {
    const rawSec = (h % 60) + 5 + offset;
    const m = String(14 + (h % 20) + Math.floor(rawSec / 60)).padStart(2, '0');
    const s = String(rawSec % 60).padStart(2, '0');
    return `2026-07-02T09:${m}:${s}.000000000Z`;
  };
  return [
    `${ts(0)}  INFO [escalation]  Starting escalation pipeline — plan_id=${planId}`,
    `${ts(1)}  INFO [escalation]  Max retries exhausted (attempts=3) — triggering escalation path`,
    `${ts(2)}  INFO [escalation]  Loading escalation_request.tmpl...`,
    `${ts(3)}  ERROR[escalation]  Template rendering failed: escalation_request.tmpl:9 type mismatch on StepResultRef`,
    `${ts(4)}  WARN [escalation]  Cannot generate escalation payload — template execution aborted`,
    `${ts(5)}  INFO [escalation]  Escalation policy=manual — handoff paused, awaiting SRE confirmation`,
    `${ts(6)}  INFO [escalation]  Escalation request queued — status=AwaitingAction, plan_id=${planId}`,
  ].join('\n');
}

const EVIDENCE_HEALTH_CHECK_PATTERN = /\b(healthz|readyz|livez|liveness|readiness|health.check|probe)\b/i;

// ─── Shared log-expandable used in Execution & Verification summary cards ────

const LogExpandable: React.FC<{
  idPrefix: string;
  toggleText: string;
  logText: string;
}> = ({ idPrefix, toggleText, logText }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [hideHealthChecks, setHideHealthChecks] = useState(true);

  const lines = useMemo(
    () =>
      logText
        .split('\n')
        .filter(Boolean)
        .filter((l) => !hideHealthChecks || !EVIDENCE_HEALTH_CHECK_PATTERN.test(l))
        .filter((l) => !query.trim() || l.toLowerCase().includes(query.toLowerCase())),
    [logText, query, hideHealthChecks],
  );

  return (
    <ExpandableSection
      toggleText={isExpanded ? `Hide ${toggleText.toLowerCase()}` : toggleText}
      isExpanded={isExpanded}
      onToggle={(_e, expanded) => {
        setIsExpanded(expanded);
        if (!expanded) setQuery('');
      }}
    >
      <div style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}>
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          gap={{ default: 'gapMd' }}
          style={{ marginBottom: 'calc(var(--pf-t--global--spacer--xs) + 4px)' }}
        >
          <FlexItem style={{ width: '200px', maxWidth: '200px', flexShrink: 0 }}>
            <SearchInput
              value={query}
              onChange={(_evt, val) => setQuery(val)}
              onClear={() => setQuery('')}
              placeholder="Search logs..."
            />
          </FlexItem>
          <FlexItem>
            <Checkbox
              id={`${idPrefix}-hc`}
              label="Hide health checks"
              isChecked={hideHealthChecks}
              onChange={(_evt, checked) => setHideHealthChecks(checked)}
            />
          </FlexItem>
        </Flex>
        <LogViewer
          data={lines}
          hasLineNumbers
          isTextWrapped
          height="280px"
          scrollToRow={isExpanded && lines.length > 0 ? lines.length - 1 : undefined}
        />
      </div>
    </ExpandableSection>
  );
};

// ─── Execution Summary Card ───────────────────────────────────────────────────

const ACTION_STATUS_COLOR: Record<ExecutionAction['status'], 'green' | 'red' | 'grey'> = {
  Succeeded: 'green',
  Failed: 'red',
  Skipped: 'grey',
};

const SECTION_OVERLINE_STYLE: React.CSSProperties = {
  display: 'block',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: 'var(--pf-t--global--text--color--subtle)',
  marginBottom: 'var(--pf-t--global--spacer--sm)',
};

const ExecutionSummaryCard: React.FC<{
  plan: PlanRow;
  executionLog: string;
}> = ({ plan, executionLog }) => {
  const summary = PLAN_EXECUTION_SUMMARY[plan.id];

  return (
    <>
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        gap={{ default: 'gapSm' }}
        style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
      >
        <Title headingLevel="h4" size="md" style={{ marginBottom: 0 }}>Execution summary</Title>
      </Flex>
      <Card style={{ borderRadius: '16px' }}>
      <CardBody>
        {/* ── Contextual evidence ── */}
        <div style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}>
          <Content component="small" style={SECTION_OVERLINE_STYLE}>Contextual evidence</Content>
          {summary ? (
            <Stack hasGutter>
              <StackItem>
                <Content component="small" style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--pf-t--global--spacer--xs)' }}>
                  Targeted root cause
                </Content>
                <Content component="p" style={{ fontSize: '0.875rem' }}>{summary.targetedRootCause}</Content>
              </StackItem>
              <StackItem>
                <Content component="small" style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--pf-t--global--spacer--xs)' }}>
                  Remediation delta
                </Content>
                <Content component="p" style={{ fontSize: '0.875rem' }}>{summary.remediationDelta}</Content>
              </StackItem>
            </Stack>
          ) : (
            <Content component="p" style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
              Execution context is being assembled…
            </Content>
          )}
        </div>

        <Divider style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }} />

        {/* ── Actions taken ── */}
        <div style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}>
          <Content component="small" style={SECTION_OVERLINE_STYLE}>Actions taken</Content>
          {summary ? (
            <Stack hasGutter>
              {summary.actionsTaken.map((action, i) => (
                <StackItem key={i}>
                  <Flex
                    alignItems={{ default: 'alignItemsCenter' }}
                    gap={{ default: 'gapSm' }}
                    style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }}
                  >
                    <FlexItem><Label isCompact color="grey">{action.category}</Label></FlexItem>
                    <FlexItem>
                      <Label isCompact color={ACTION_STATUS_COLOR[action.status]}>{action.status}</Label>
                    </FlexItem>
                    <FlexItem>
                      <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                        {action.description}
                      </Content>
                    </FlexItem>
                  </Flex>
                  <ExpandableCodeBlock
                    id={`exec-action-${plan.id}-${i}`}
                    code={action.command}
                    codeStyle={{ fontSize: '12px' }}
                  />
                  {action.output && (
                    <Content
                      component="small"
                      style={{
                        display: 'block',
                        marginTop: 'var(--pf-t--global--spacer--xs)',
                        fontFamily: 'var(--pf-t--global--font--family--mono)',
                        color: 'var(--pf-t--global--text--color--subtle)',
                        fontSize: '11px',
                      }}
                    >
                      {action.output}
                    </Content>
                  )}
                </StackItem>
              ))}
            </Stack>
          ) : (
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
              <FlexItem><Spinner size="sm" aria-label="Executing" /></FlexItem>
              <FlexItem>
                <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                  Executing actions…
                </Content>
              </FlexItem>
            </Flex>
          )}
        </div>

        {/* ── Log footer ── */}
        {executionLog && (
          <>
            <Divider style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }} />
            <LogExpandable
              idPrefix={`exec-log-${plan.id}`}
              toggleText="View execution logs"
              logText={executionLog}
            />
          </>
        )}
      </CardBody>
    </Card>
    </>
  );
};

// ─── Verification Summary Card ────────────────────────────────────────────────

const CHECK_STATUS_COLOR: Record<VerificationCheck['status'], 'green' | 'red'> = {
  Passed: 'green',
  Failed: 'red',
};

const VerificationSummaryCard: React.FC<{
  plan: PlanRow;
  verificationLog: string;
}> = ({ plan, verificationLog }) => {
  const summary = PLAN_VERIFICATION_SUMMARY[plan.id];

  return (
    <>
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        gap={{ default: 'gapSm' }}
        style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
      >
        <Title headingLevel="h4" size="md" style={{ marginBottom: 0 }}>Verification summary</Title>
        <Label color="grey" isCompact>AI-generated</Label>
      </Flex>
      <Card style={{ borderRadius: '16px' }}>
      <CardBody>
        {/* ── Outcome assessment ── */}
        <div style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}>
          <Content component="small" style={SECTION_OVERLINE_STYLE}>Outcome assessment</Content>
          {summary ? (
            <ul style={{ margin: 0, paddingLeft: 'var(--pf-t--global--spacer--lg)', lineHeight: 1.6 }}>
              {summary.outcomeAssessment.map((line, i) => (
                <li key={i}>
                  <Content component="p" style={{ fontSize: '0.875rem', margin: 0 }}>{line}</Content>
                </li>
              ))}
            </ul>
          ) : (
            <Content component="p" style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
              Outcome assessment is being generated…
            </Content>
          )}
        </div>

        <Divider style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }} />

        {/* ── Verification checks ── */}
        <div style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}>
          <Content component="small" style={SECTION_OVERLINE_STYLE}>Verification checks</Content>
          {summary ? (
            <Stack hasGutter>
              {summary.checks.map((check, i) => (
                <StackItem key={i}>
                  <Flex
                    alignItems={{ default: 'alignItemsCenter' }}
                    gap={{ default: 'gapSm' }}
                    style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }}
                  >
                    <FlexItem>
                      <Content
                        component="small"
                        style={{ fontWeight: 600, fontFamily: 'var(--pf-t--global--font--family--mono)' }}
                      >
                        {check.id}
                      </Content>
                    </FlexItem>
                    <FlexItem>
                      <Label isCompact color={CHECK_STATUS_COLOR[check.status]}>{check.status}</Label>
                    </FlexItem>
                  </Flex>
                  <ExpandableCodeBlock
                    id={`verif-check-${plan.id}-${i}`}
                    code={check.command}
                    codeStyle={{ fontSize: '12px' }}
                  />
                  {check.output && (
                    <Content
                      component="small"
                      style={{
                        display: 'block',
                        marginTop: 'var(--pf-t--global--spacer--xs)',
                        fontFamily: 'var(--pf-t--global--font--family--mono)',
                        color: 'var(--pf-t--global--text--color--subtle)',
                        fontSize: '11px',
                      }}
                    >
                      {check.output}
                    </Content>
                  )}
                </StackItem>
              ))}
            </Stack>
          ) : (
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
              <FlexItem><Spinner size="sm" aria-label="Verifying" /></FlexItem>
              <FlexItem>
                <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                  Running verification checks…
                </Content>
              </FlexItem>
            </Flex>
          )}
        </div>

        {/* ── Log footer ── */}
        {verificationLog && (
          <>
            <Divider style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }} />
            <LogExpandable
              idPrefix={`verif-log-${plan.id}`}
              toggleText="View verification logs"
              logText={verificationLog}
            />
          </>
        )}
      </CardBody>
    </Card>
    </>
  );
};

// ─── Escalation Summary Card ──────────────────────────────────────────────────

const EscalationSummaryCard: React.FC<{
  plan: PlanRow;
  escalationLog: string;
  escalationPolicy: 'manual' | 'auto';
  onDispatch?: () => void;
  onRetry?: () => void;
  onMarkResolved?: () => void;
}> = ({ plan, escalationLog, escalationPolicy, onDispatch, onRetry, onMarkResolved }) => {
  const summary = PLAN_ESCALATION_SUMMARY[plan.id];
  const isAutoPolicy = escalationPolicy === 'auto';
  const hasDispatched = isAutoPolicy && summary?.dispatchedTargets && summary.dispatchedTargets.length > 0;

  const statusBadge = hasDispatched
    ? <Label color="red" isCompact>Dispatched</Label>
    : <Label color="orange" isCompact>Awaiting Action</Label>;

  return (
    <>
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        gap={{ default: 'gapSm' }}
        style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
      >
        <ExclamationTriangleIcon
          style={{ color: 'var(--pf-t--global--icon--color--status--warning--default)' }}
          aria-hidden
        />
        <Title headingLevel="h4" size="md" style={{ marginBottom: 0 }}>Escalation summary</Title>
        <Label color="grey" isCompact>AI-generated</Label>
        {statusBadge}
      </Flex>
      <Card style={{ borderRadius: '16px' }}>
        <CardBody>
          {/* ── Dispatched targets (auto policy only) ── */}
          {hasDispatched && summary.dispatchedTargets!.length > 0 && (
            <div style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}>
              <Content component="small" style={SECTION_OVERLINE_STYLE}>Dispatched to</Content>
              <ul style={{ margin: 0, paddingLeft: 'var(--pf-t--global--spacer--lg)', lineHeight: 1.6 }}>
                {summary.dispatchedTargets!.map((target, i) => (
                  <li key={i}>
                    <Content component="p" style={{ fontSize: '0.875rem', margin: 0 }}>{target}</Content>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Escalation analysis ── */}
          <div style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}>
            <Content component="small" style={SECTION_OVERLINE_STYLE}>Escalation analysis</Content>
            {summary ? (
              <ul style={{ margin: 0, paddingLeft: 'var(--pf-t--global--spacer--lg)', lineHeight: 1.6, listStyleType: 'disc' }}>
                {summary.analysis.map((line, i) => (
                  <li key={i}>
                    <Content component="p" style={{ fontSize: '0.875rem', margin: 0 }}>{line}</Content>
                  </li>
                ))}
              </ul>
            ) : (
              <Content component="p" style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                Escalation analysis is being generated…
              </Content>
            )}
          </div>

          <Divider style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }} />

          {/* ── Recommended next steps ── */}
          <div style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}>
            <Content component="small" style={SECTION_OVERLINE_STYLE}>Recommended next steps</Content>
            {summary ? (
              <ul style={{ margin: 0, paddingLeft: 'var(--pf-t--global--spacer--lg)', lineHeight: 1.6, listStyleType: 'disc' }}>
                {summary.recommendedNextSteps.map((step, i) => (
                  <li key={i}>
                    <Content component="p" style={{ fontSize: '0.875rem', margin: 0 }}>{step}</Content>
                  </li>
                ))}
              </ul>
            ) : (
              <Content component="p" style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                Generating recommended next steps…
              </Content>
            )}
          </div>

          {/* ── Log footer ── */}
          {escalationLog && (
            <>
              <Divider style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }} />
              <LogExpandable
                idPrefix={`escal-log-${plan.id}`}
                toggleText="View escalation logs"
                logText={escalationLog}
              />
            </>
          )}

          {/* ── Manual policy action bar ── */}
          {!isAutoPolicy && (
            <>
              <Divider style={{ margin: 'var(--pf-t--global--spacer--lg) 0' }} />
              <Flex
                justifyContent={{ default: 'justifyContentFlexStart' }}
                gap={{ default: 'gapSm' }}
                flexWrap={{ default: 'wrap' }}
                alignItems={{ default: 'alignItemsCenter' }}
              >
                <FlexItem>
                  <Button variant="primary" onClick={onDispatch}>
                    Dispatch escalation
                  </Button>
                </FlexItem>
                <FlexItem>
                  <Button variant="secondary" onClick={onRetry}>
                    Retry run
                  </Button>
                </FlexItem>
                <FlexItem>
                  <Button variant="link" isInline onClick={onMarkResolved}>
                    Mark resolved
                  </Button>
                </FlexItem>
              </Flex>
            </>
          )}
        </CardBody>
      </Card>
    </>
  );
};

const EvidenceLogsSection: React.FC<{
  idPrefix: string;
  executionLogText: string;
  verificationLogText: string;
}> = ({ idPrefix, executionLogText, verificationLogText }) => {
  const [isExecLogsExpanded, setIsExecLogsExpanded] = useState(false);
  const [isVerifLogsExpanded, setIsVerifLogsExpanded] = useState(false);
  const [execQuery, setExecQuery] = useState('');
  const [execHideHealthChecks, setExecHideHealthChecks] = useState(true);
  const [verifQuery, setVerifQuery] = useState('');
  const [verifHideHealthChecks, setVerifHideHealthChecks] = useState(true);

  const execLines = useMemo(
    () => executionLogText
      .split('\n')
      .filter(Boolean)
      .filter((l) => !execHideHealthChecks || !EVIDENCE_HEALTH_CHECK_PATTERN.test(l))
      .filter((l) => !execQuery.trim() || l.toLowerCase().includes(execQuery.toLowerCase())),
    [executionLogText, execQuery, execHideHealthChecks],
  );

  const verifLines = useMemo(
    () => verificationLogText
      .split('\n')
      .filter(Boolean)
      .filter((l) => !verifHideHealthChecks || !EVIDENCE_HEALTH_CHECK_PATTERN.test(l))
      .filter((l) => !verifQuery.trim() || l.toLowerCase().includes(verifQuery.toLowerCase())),
    [verificationLogText, verifQuery, verifHideHealthChecks],
  );

  const logToolbar = (
    query: string,
    setQuery: (v: string) => void,
    hideHealthChecks: boolean,
    setHideHealthChecks: (v: boolean) => void,
    sectionId: string,
  ) => (
    <Flex
      alignItems={{ default: 'alignItemsCenter' }}
      gap={{ default: 'gapMd' }}
      style={{ marginBottom: 'calc(var(--pf-t--global--spacer--xs) + 4px)' }}
    >
      <FlexItem style={{ width: '200px', maxWidth: '200px', flexShrink: 0 }}>
        <SearchInput
          value={query}
          onChange={(_evt, val) => setQuery(val)}
          onClear={() => setQuery('')}
          placeholder="Search logs..."
        />
      </FlexItem>
      <FlexItem>
        <Checkbox
          id={`${idPrefix}-${sectionId}-hc`}
          label="Hide health checks"
          isChecked={hideHealthChecks}
          onChange={(_evt, checked) => setHideHealthChecks(checked)}
        />
      </FlexItem>
    </Flex>
  );

  return (
    <Stack hasGutter style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
      <StackItem>
        <ExpandableSection
          toggleText={isExecLogsExpanded ? 'Hide execution logs' : 'View execution logs'}
          isExpanded={isExecLogsExpanded}
          onToggle={(_e, expanded) => {
            setIsExecLogsExpanded(expanded);
            if (!expanded) setExecQuery('');
          }}
          style={{ marginBottom: 0 }}
        >
          <div style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}>
            {logToolbar(execQuery, setExecQuery, execHideHealthChecks, setExecHideHealthChecks, 'exec')}
            <LogViewer
              data={execLines}
              hasLineNumbers
              isTextWrapped
              height="280px"
            />
          </div>
        </ExpandableSection>
      </StackItem>
      <StackItem>
        <ExpandableSection
          toggleText={isVerifLogsExpanded ? 'Hide verification logs' : 'View verification logs'}
          isExpanded={isVerifLogsExpanded}
          onToggle={(_e, expanded) => {
            setIsVerifLogsExpanded(expanded);
            if (!expanded) setVerifQuery('');
          }}
          style={{ marginBottom: 0 }}
        >
          <div style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}>
            {logToolbar(verifQuery, setVerifQuery, verifHideHealthChecks, setVerifHideHealthChecks, 'verif')}
            <LogViewer
              data={verifLines}
              hasLineNumbers
              isTextWrapped
              height="280px"
            />
          </div>
        </ExpandableSection>
      </StackItem>
    </Stack>
  );
};

/**
 * Fallback evidence card for terminal (Completed/Failed) runs that have no modeled
 * remediation options — e.g. autonomous reconciliations executed without an operator
 * option selection. Keeps the execution/verification audit trail from disappearing
 * once `PostMortemPanel` was retired in favor of per-option cards.
 */
const TerminalEvidenceCard: React.FC<{
  plan: PlanRow;
}> = ({ plan }) => {
  const { status } = plan;
  const isCompleted = status === 'Completed';
  const isFailed = status === 'Failed';
  const postMortem = useMemo(() => PLAN_POSTMORTEM[plan.id] ?? generatePostMortem(plan), [plan]);
  const actionSummary = postMortem.type === 'success'
    ? postMortem.remediationActionDelta
    : postMortem.failureReason;

  // Execution status now lives in the top-right corner of the card header
  // (rather than inline in the title row) — mirrors RemediationOptionCard.
  const executionStatusLabel = isCompleted ? (
    <Label color="green" icon={<CheckCircleIcon />}>Execution successful</Label>
  ) : isFailed ? (
    <Label color="red" icon={<ExclamationCircleIcon />}>Execution failed</Label>
  ) : null;

  const headerContent = (
    <Flex
      justifyContent={{ default: 'justifyContentSpaceBetween' }}
      alignItems={{ default: 'alignItemsFlexStart' }}
      flexWrap={{ default: 'nowrap' }}
      style={{ width: '100%' }}
    >
      <FlexItem>
        <Flex
          direction={{ default: 'column' }}
          alignItems={{ default: 'alignItemsFlexStart' }}
          gap={{ default: 'gapXs' }}
        >
          <span style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap' }}>
            Remediation
          </span>
          <span
            style={{
              fontWeight: 600,
              fontSize: '14px',
              lineHeight: 1.4,
              whiteSpace: 'normal',
              wordBreak: 'break-word',
            }}
          >
            {plan.synopsis}
          </span>
        </Flex>
      </FlexItem>
      {executionStatusLabel && <FlexItem>{executionStatusLabel}</FlexItem>}
    </Flex>
  );

  return (
    <Card style={{ borderRadius: '16px' }}>
      <CardHeader>{headerContent}</CardHeader>
      <CardBody className="ols-remediation-option-card__body">
        {actionSummary && (
          <Content
            component="p"
            className="ols-aio-text-subtle-sm"
          >
            {actionSummary}
          </Content>
        )}
      </CardBody>
    </Card>
  );
};

// ─── RBAC Permissions Section ────────────────────────────────────────────────

const RbacPermissionsSection: React.FC<{ rbac: RbacSpec; optionId: string }> = ({ rbac, optionId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const nsRules = rbac.namespaceScope?.rules ?? [];
  const clusterRules = rbac.clusterScope?.rules ?? [];
  const totalNs = nsRules.length;
  const totalCluster = clusterRules.length;

  return (
    <div style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}>
      <Divider style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }} />
      <Content component="small" style={SECTION_OVERLINE_STYLE}>Required permissions</Content>

      {/* Security guardrail alert */}
      <Alert
        variant="warning"
        isInline
        isPlain
        title="Permissions are locked at approval. The agent cannot escalate its privileges beyond these rules."
        style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
      />

      {/* Scope count badges */}
      <Flex gap={{ default: 'gapSm' }} style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }}>
        {totalNs > 0 && (
          <FlexItem>
            <Label color="blue" isCompact>
              {totalNs} namespace permission{totalNs !== 1 ? 's' : ''}
            </Label>
          </FlexItem>
        )}
        {totalCluster > 0 && (
          <FlexItem>
            <Label color="purple" isCompact>
              {totalCluster} cluster-wide
            </Label>
          </FlexItem>
        )}
      </Flex>

      {/* Write operations summary */}
      <Content
        component="small"
        style={{
          display: 'block',
          color: 'var(--pf-t--global--text--color--subtle)',
          fontStyle: 'italic',
          marginBottom: 'var(--pf-t--global--spacer--sm)',
        }}
      >
        {rbac.summary}
      </Content>

      {/* Expandable permission table — one independent table per scope group */}
      <ExpandableSection
        toggleText={isExpanded ? 'Hide permission details' : 'View permission details'}
        isExpanded={isExpanded}
        onToggle={(_e, expanded) => setIsExpanded(expanded)}
      >
        <Stack style={{ marginTop: 'var(--pf-t--global--spacer--sm)', gap: 'var(--pf-t--global--spacer--md)' }}>
          {rbac.namespaceScope && nsRules.length > 0 && (
            <StackItem>
              {/* Group label sits above the table so Thead appears directly below it */}
              <div
                style={{
                  background: 'var(--pf-t--global--background--color--secondary--default)',
                  borderRadius: '4px 4px 0 0',
                  padding: '4px 12px',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--pf-t--global--text--color--subtle)',
                }}
              >
                Namespace: {rbac.namespaceScope.namespace}
              </div>
              <Table variant="compact" aria-label={`Namespace-scoped RBAC for ${optionId}`} borders>
                <Thead>
                  <Tr>
                    <Th>Resource</Th>
                    <Th>Verbs</Th>
                    <Th>Purpose</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {nsRules.map((rule, i) => (
                    <Tr key={`ns-${i}`}>
                      <Td><code style={{ fontSize: '0.8125rem' }}>{rule.resource}</code></Td>
                      <Td><code style={{ fontSize: '0.8125rem' }}>{rule.verbs}</code></Td>
                      <Td>
                        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                          <FlexItem>{rule.purpose}</FlexItem>
                          {rule.isWrite && <FlexItem><Label color="orange" isCompact>write</Label></FlexItem>}
                        </Flex>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </StackItem>
          )}
          {rbac.clusterScope && clusterRules.length > 0 && (
            <StackItem>
              <div
                style={{
                  background: 'var(--pf-t--global--background--color--secondary--default)',
                  borderRadius: '4px 4px 0 0',
                  padding: '4px 12px',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--pf-t--global--text--color--subtle)',
                }}
              >
                Cluster-wide
              </div>
              <Table variant="compact" aria-label={`Cluster-scoped RBAC for ${optionId}`} borders>
                <Thead>
                  <Tr>
                    <Th>Resource</Th>
                    <Th>Verbs</Th>
                    <Th>Purpose</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {clusterRules.map((rule, i) => (
                    <Tr key={`cluster-${i}`}>
                      <Td><code style={{ fontSize: '0.8125rem' }}>{rule.resource}</code></Td>
                      <Td><code style={{ fontSize: '0.8125rem' }}>{rule.verbs}</code></Td>
                      <Td>
                        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                          <FlexItem>{rule.purpose}</FlexItem>
                          {rule.isWrite && <FlexItem><Label color="orange" isCompact>write</Label></FlexItem>}
                        </Flex>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </StackItem>
          )}
        </Stack>
      </ExpandableSection>
    </div>
  );
};

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
  /** Human approval metadata — shown as plain secondary text once execution begins. */
  approval?: import('../../context/PlanWorkflowContext').ExecutionApproval | null;
  /** Live or resolved verification state, used to badge the verification-logs toggle. */
  verification?: import('../../context/PlanWorkflowContext').VerificationState | null;
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
  approval,
  verification,
}) => {
  const isFirst = index === 0;
  const { status } = plan;
  const isTerminal         = status === 'Completed' || status === 'Failed';
  const isCompleted        = status === 'Completed';
  const isFailed           = status === 'Failed';
  const isDenied           = status === 'Denied';
  const isEmergencyStopped = status === 'EmergencyStopped';
  const isExecutionKilled = Boolean(executionKillState);
  const isProposed = status === 'Proposed';
  const isExecuting = status === 'Executing';
  const cardRootRef = React.useRef<HTMLDivElement>(null);
  const wasSelectedRef = React.useRef(isSelected);
  const activeExecutionLogLines = useMemo(
    () => buildActiveExecutionLogLines(plan, option),
    [plan, option],
  );
  const streamedExecutionLog = useStreamingExecutionLog(
    activeExecutionLogLines,
    showExecutionLog,
    isExecutionKilled || !isAgenticAutomationEnabled,
  );

  // Consolidated evidence trail (execution + verification logs) — single source
  // of truth once an option is approved/executed. See PostMortemPanel removal.
  const postMortem = useMemo(
    () => (isTerminal ? (PLAN_POSTMORTEM[plan.id] ?? generatePostMortem(plan)) : null),
    [isTerminal, plan],
  );
  // Parent always renders a single card instance during these phases (see
  // `visibleOptions`/`terminalVisibleOptions` filtering), so no index check needed here.
  const showEvidenceTrail = !isExecutionKilled && (isExecuting || isTerminal);
  const executionLogText = isTerminal
    ? (postMortem?.rawLog ?? '')
    : streamedExecutionLog;
  const verificationLogText = verification
    ? verification.checks.join('\n')
    : generateVerificationLogs(plan.id);

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

  // Execution status now lives in the top-right corner of the card header
  // (rather than inline in the title row) — see EOL-xxxx UI cleanup.
  const executionStatusLabel =
    (isExecuting || isTerminal) && !isExecutionKilled ? (
      isExecuting ? (
        <Label color="blue" icon={<Spinner size="sm" aria-label="Executing" />}>
          Executing
        </Label>
      ) : isCompleted ? (
        <Label color="green" icon={<CheckCircleIcon />}>Execution successful</Label>
      ) : isFailed ? (
        <Label color="red" icon={<ExclamationCircleIcon />}>Execution failed</Label>
      ) : null
    ) : null;

  const headerContent = (
    <Flex
      justifyContent={{ default: 'justifyContentSpaceBetween' }}
      alignItems={{ default: 'alignItemsFlexStart' }}
      flexWrap={{ default: 'nowrap' }}
      style={{ width: '100%' }}
    >
      <FlexItem>
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
              {isOptionLocked && isFirst && (
                <Label color="orange" isCompact>
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
      </FlexItem>
      {executionStatusLabel && <FlexItem>{executionStatusLabel}</FlexItem>}
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
          {/* ── A. Approval metadata (post-approval evidence trail; status now lives top-right in the header) ── */}
          {(isExecuting || isTerminal) && !isExecutionKilled && approval && (
            <div style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}>
              <Content component="small" className="ols-aio-text-subtle-sm" style={{ display: 'block' }}>
                Execution approved by {approval.approvedBy} · {approval.approvedAt}
              </Content>
            </div>
          )}

          {!isExecuting && !isTerminal && (
            <Content
              component="p"
              className="ols-aio-text-subtle-sm"
              style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
            >
              {option.description}
            </Content>
          )}

          {/* ── B. Root cause analysis (per-option; backend: options[].diagnosis) — OLS-3724 ── */}
          {rootCause && (
            <div style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}>
              <Content
                component="small"
                style={{
                  display: 'block',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--pf-t--global--text--color--subtle)',
                  marginBottom: 'var(--pf-t--global--spacer--sm)',
                }}
              >
                Root cause analysis
              </Content>
              <div
                className={`ols-aio-rca-box ${
                  plan.severity === 'critical' ? 'ols-aio-rca-box--critical' : 'ols-aio-rca-box--warning'
                }`}
                style={{ borderRadius: '12px', overflow: 'hidden' }}
              >
                <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                  {rootCause.aggregatedFinding}
                </Content>
                <Content component="p" style={{ margin: 0 }}>
                  {rootCause.rootCauseNarrative}
                </Content>
              </div>
            </div>
          )}

          {/* Execution terminated mid-flight (operator stop) */}
          {isExecutionPhase && isFirst && isExecutionKilled && (
            <Alert
              variant="danger"
              isInline
              title={`Execution terminated by operator at ${executionKillState?.killedAt}`}
              style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
            />
          )}

          {/* ── C. Proposed / executed commands ── */}
          <div style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}>
            <Divider style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }} />
            <Content
              component="small"
              style={{
                display: 'block',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--pf-t--global--text--color--subtle)',
                marginBottom: 'var(--pf-t--global--spacer--sm)',
              }}
            >
              {isExecuting || isTerminal ? 'Executed commands' : 'Proposed agent commands'}
            </Content>
            {option.commands && option.commands.length > 0 ? (
              <Stack hasGutter>
                {option.commands.map((cmd, cmdIdx) => (
                  <StackItem key={cmdIdx}>
                    <Flex
                      alignItems={{ default: 'alignItemsCenter' }}
                      gap={{ default: 'gapSm' }}
                      style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }}
                    >
                      <FlexItem>
                        <Label isCompact color="grey">{cmd.label}</Label>
                      </FlexItem>
                      <FlexItem>
                        <Content
                          component="small"
                          style={{ color: 'var(--pf-t--global--text--color--subtle)' }}
                        >
                          {cmd.description}
                        </Content>
                      </FlexItem>
                    </Flex>
                    <ExpandableCodeBlock
                      id={`cmd-${option.id}-${cmdIdx}`}
                      code={cmd.command}
                      codeStyle={{ fontSize: '12px' }}
                    />
                  </StackItem>
                ))}
              </Stack>
            ) : (
              <ExpandableCodeBlock
                id={`cmd-${option.id}`}
                code={option.rawCommands}
                codeStyle={{ fontSize: '12px' }}
              />
            )}
            {/* Execute remediation — visible only in Proposed state via onExecute prop */}
            {onExecute && (
              <Flex
                gap={{ default: 'gapSm' }}
                flexWrap={{ default: 'wrap' }}
                style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}
              >
                <FlexItem>
                  <Button
                    variant="primary"
                    isDisabled={!isAgenticAutomationEnabled}
                    onClick={onExecute}
                  >
                    Execute remediation
                  </Button>
                </FlexItem>
                {rootCause && (
                  <FlexItem>
                    <Button
                      variant="link"
                      icon={<RhUiDownloadIcon />}
                      onClick={() => downloadRemediationPlanMarkdown(plan, option, rootCause)}
                    >
                      Download plan
                    </Button>
                  </FlexItem>
                )}
              </Flex>
            )}
          </div>

          {/* ── C.5 Required permissions (RBAC) ── */}
          {option.rbac ? (
            <RbacPermissionsSection rbac={option.rbac} optionId={option.id} />
          ) : (
            <div style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}>
              <Divider style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }} />
              <Content component="small" style={SECTION_OVERLINE_STYLE}>Required permissions</Content>
              <Alert
                variant="info"
                isInline
                isPlain
                title="Standard Agent Permissions"
              >
                Uses the default cluster Agent Service Account rules. No additional privileges are declared for this option.
              </Alert>
            </div>
          )}

          {/* ── D. Rollback plan — shown after execution ── */}
          {showEvidenceTrail && (() => {
            const rollback = resolveOptionRollbackPlan(plan.id, option);
            if (!rollback) return null;
            return (
              <div style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}>
                <Divider style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }} />
                <Content
                  component="small"
                  style={{
                    display: 'block',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: 'var(--pf-t--global--text--color--subtle)',
                    marginBottom: 'var(--pf-t--global--spacer--sm)',
                  }}
                >
                  Rollback plan
                </Content>
                <Content
                  component="p"
                  style={{
                    fontSize: '0.875rem',
                    marginBottom: rollback.command ? 'var(--pf-t--global--spacer--sm)' : 0,
                  }}
                >
                  {rollback.description}
                </Content>
                {rollback.command && (
                  <ExpandableCodeBlock
                    id={`rollback-${option.id}`}
                    code={rollback.command}
                    codeStyle={{ fontSize: '12px' }}
                  />
                )}
              </div>
            );
          })()}

          {/* ── E. Verification steps — shown after execution ── */}
          {showEvidenceTrail && option.verificationSteps && (
            <div style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}>
              <Divider style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }} />
              <Content
                component="small"
                style={{
                  display: 'block',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--pf-t--global--text--color--subtle)',
                  marginBottom: 'var(--pf-t--global--spacer--sm)',
                }}
              >
                Verification steps
              </Content>
              <Content
                component="p"
                style={{ fontSize: '0.875rem', marginBottom: 'var(--pf-t--global--spacer--sm)' }}
              >
                {option.verificationSteps.description}
              </Content>
              <Stack hasGutter>
                {option.verificationSteps.steps.map((step, stepIdx) => (
                  <StackItem key={stepIdx}>
                    <Content
                      component="small"
                      style={{
                        display: 'block',
                        fontWeight: 600,
                        fontFamily: 'var(--pf-t--global--font--family--mono)',
                        color: 'var(--pf-t--global--text--color--subtle)',
                        marginBottom: 'var(--pf-t--global--spacer--xs)',
                      }}
                    >
                      {step.id}
                    </Content>
                    <ExpandableCodeBlock
                      id={`verify-${option.id}-${stepIdx}`}
                      code={step.command}
                      codeStyle={{ fontSize: '12px' }}
                    />
                    <Content
                      component="small"
                      style={{
                        display: 'block',
                        marginTop: 'var(--pf-t--global--spacer--xs)',
                        color: 'var(--pf-t--global--text--color--subtle)',
                        fontStyle: 'italic',
                      }}
                    >
                      {step.expected}
                    </Content>
                  </StackItem>
                ))}
              </Stack>
            </div>
          )}

          {/* ── F. Card footer — Download plan (post-execution only) ── */}
          {showEvidenceTrail && rootCause && (
            <div style={{ marginTop: 'var(--pf-t--global--spacer--lg)', borderTop: '1px solid var(--pf-t--global--border--color--default)', paddingTop: 'var(--pf-t--global--spacer--md)' }}>
              <Button
                variant="link"
                icon={<RhUiDownloadIcon />}
                onClick={() => downloadRemediationPlanMarkdown(plan, option, rootCause)}
              >
                Download plan
              </Button>
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

const SKELETON_SUSPENDED_STYLE: React.CSSProperties = {
  animationName: 'none',
  opacity: 0.45,
};

const RcaLockedPlaceholder: React.FC<{ isSuspended?: boolean; isPendingApproval?: boolean }> = ({
  isSuspended = false,
  isPendingApproval = false,
}) => (
  <div style={LOCKED_BOX_STYLE}>
    <Flex
      alignItems={{ default: 'alignItemsCenter' }}
      gap={{ default: 'gapSm' }}
      style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
    >
      {isSuspended ? (
        <ExclamationTriangleIcon
          style={{ color: 'var(--pf-t--global--icon--color--status--warning--default)', flexShrink: 0 }}
          aria-hidden
        />
      ) : isPendingApproval ? (
        <OutlinedClockIcon
          style={{ color: 'var(--pf-t--global--icon--color--subtle)', flexShrink: 0 }}
          aria-hidden
        />
      ) : (
        <Spinner size="sm" aria-label="Analyzing root cause" />
      )}
      <Content component="p" className="ols-aio-text-subtle-sm" style={{ margin: 0, fontStyle: 'italic' }}>
        {isSuspended
          ? 'Analysis suspended — agentic capabilities disabled'
          : isPendingApproval
          ? 'Awaiting analysis approval.'
          : 'Analyzing infrastructure topology to isolate root cause…'}
      </Content>
    </Flex>
    <Skeleton width="85%" style={{ marginBottom: 'var(--pf-t--global--spacer--xs)', ...(isSuspended ? SKELETON_SUSPENDED_STYLE : {}) }} />
    <Skeleton width="65%" style={{ marginBottom: 'var(--pf-t--global--spacer--xs)', ...(isSuspended ? SKELETON_SUSPENDED_STYLE : {}) }} />
    <Skeleton width="75%" style={isSuspended ? SKELETON_SUSPENDED_STYLE : undefined} />
  </div>
);

const HubLockedPlaceholder: React.FC<{ isSuspended?: boolean; awaitingAnalysis?: boolean }> = ({
  isSuspended = false,
  awaitingAnalysis = false,
}) => (
  <div style={LOCKED_BOX_STYLE}>
    <Content
      component="p"
      className="ols-aio-text-subtle-sm"
      style={{ marginBottom: 'var(--pf-t--global--spacer--sm)', fontStyle: 'italic' }}
    >
      {isSuspended
        ? 'Remediation synthesis suspended — agentic capabilities disabled'
        : awaitingAnalysis
        ? 'Awaiting root cause analysis.'
        : 'Remediation options will be synthesized following root cause confirmation.'}
    </Content>
    <Skeleton width="100%" style={{ marginBottom: 'var(--pf-t--global--spacer--xs)', ...(isSuspended ? SKELETON_SUSPENDED_STYLE : {}) }} />
    <Skeleton width="100%" style={{ marginBottom: 'var(--pf-t--global--spacer--xs)', ...(isSuspended ? SKELETON_SUSPENDED_STYLE : {}) }} />
    <Skeleton width="55%" style={isSuspended ? SKELETON_SUSPENDED_STYLE : undefined} />
  </div>
);

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
  'op5-manual-escalation': {
    title: 'Fix escalation template and remove WAL lock',
    command:
      `# Step 1: Fix the StepResultRef template field mismatch
sed -i 's/.Success/.Phase == "Succeeded"/g' escalation_request.tmpl

# Step 2: Remove the stale WAL lock and restart Grafana
oc scale deployment/grafana --replicas=0 -n openshift-monitoring
oc rsh -n openshift-monitoring grafana-debug -- rm -f /var/lib/grafana/grafana.db-wal
oc scale deployment/grafana --replicas=1 -n openshift-monitoring`,
  },
};

const DEFAULT_ESCALATION_PLAYBOOK = {
  title: 'Review escalated run and apply manual remediation',
  command: 'oc describe proposal <plan-name> -n openshift-lightspeed',
};

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

export const RemediationBlueprintPanel: React.FC<{
  plan: PlanRow;
  onRejectPlan?: () => void;
  onStartNewInvestigation?: () => void;
  /** Cluster-update runs: open Administration → Cluster Update from Remediation hub. */
  onRemediateInClusterUpdates?: () => void;
  /**
   * Called when the internal Pending sub-state changes.
   * `true`  → INITIALIZING  (5-second spinner; parent should render full-width)
   * `false` → READY_FOR_ANALYSIS or any non-Pending state (parent uses default 60% layout)
   */
  onPendingInitializingChange?: (isInitializing: boolean) => void;
}> = ({ plan, onRejectPlan, onStartNewInvestigation, onRemediateInClusterUpdates, onPendingInitializingChange }) => {
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
  const isTerminal  = status === 'Completed' || status === 'Failed';
  const isCompleted = status === 'Completed';
  const isDenied           = status === 'Denied';
  const isEmergencyStopped = status === 'EmergencyStopped';
  const isPending = status === 'Pending';
  const isClusterUpdatePlan = resolvePlanDomainAnnotations(plan).sourceDomain === 'cluster-update';
  // True only when the run is in Pending and the 5-second INITIALIZING window has expired —
  // the full Agentic Run Details layout renders (manual policy gate).
  // Note: isPendingReadyForAnalysis is evaluated lazily below after pendingSubState is defined.
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
    dispatchAnalysis,
  } = usePlanWorkflow();
  const workflow = getPlanWorkflow(plan.id);
  const [isStopAnalysisModalOpen, setIsStopAnalysisModalOpen] = useState(false);
  const [isStopExecutionModalOpen, setIsStopExecutionModalOpen] = useState(false);
  const [isExecutionRunning, setIsExecutionRunning] = useState(false);
  const [retryBanner, setRetryBanner] = useState<string | null>(null);
  const [isExecuteConfirmModalOpen, setIsExecuteConfirmModalOpen] = useState(false);
  const [isDenyModalOpen, setIsDenyModalOpen] = useState(false);
  const [isDenySelectOpen, setIsDenySelectOpen] = useState(false);
  const [denyReason, setDenyReason] = useState('');
  /**
   * HITL sub-state for Pending runs.
   *   INITIALIZING       — CR created, engine not yet dispatched (shows spinner, 5-second window)
   *   READY_FOR_ANALYSIS — Manual approval policy gate: awaiting "Approve analysis" action
   */
  type PendingSubState = 'INITIALIZING' | 'READY_FOR_ANALYSIS';
  const [pendingSubState, setPendingSubState] = useState<PendingSubState>('INITIALIZING');
  const {
    analysisPolicy,
    executionPolicy,
    verificationPolicy,
    escalationPolicy,
    maxRetryAttempts: configMaxRetryAttempts,
  } = useApprovalPolicy();

  // After INITIALIZING:
  //   • Automatic policy → dispatch analysis immediately (skip the manual gate).
  //   • Manual policy    → advance to READY_FOR_ANALYSIS so the full details layout renders
  //                        with "Approve analysis" CTA in the Analysis request header.
  useEffect(() => {
    if (status !== 'Pending') return;
    setPendingSubState('INITIALIZING');
    onPendingInitializingChange?.(true);
    const timer = window.setTimeout(() => {
      if (analysisPolicy === 'auto') {
        dispatchAnalysis(plan.id);
      } else {
        setPendingSubState('READY_FOR_ANALYSIS');
        onPendingInitializingChange?.(false);
      }
    }, 5000);
    return () => {
      window.clearTimeout(timer);
      // If the component unmounts or plan/policy changes mid-timer, reset the parent flag.
      onPendingInitializingChange?.(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.id, analysisPolicy]);

  const executionKillState =
    plan.status === 'Plan aborted' && plan.terminatedAt ? { killedAt: plan.terminatedAt } : null;

  useEffect(() => {
    setIsExecutionRunning(false);
    setRetryBanner(null);
    setIsStopExecutionModalOpen(false);
  }, [plan.id]);

  useEffect(() => {
    if (!isExecuting || !isAgenticAutomationEnabled) {
      setIsExecutionRunning(false);
      return;
    }
    setIsExecutionRunning(true);
    const timer = window.setTimeout(() => {
      startVerification(plan.id, VERIFICATION_CHECK_LINES);
      setIsExecutionRunning(false);
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [isExecuting, isAgenticAutomationEnabled, plan.id, startVerification, workflow.verification?.attempt]);

  // Full Agentic Run Details layout is shown when Pending has passed the 5s INITIALIZING window
  // and the analysis policy is manual (auto policy auto-dispatches, so this stays false for auto).
  const isPendingReadyForAnalysis = isPending && pendingSubState === 'READY_FOR_ANALYSIS';

  const drawer = resolvePlanDrawerData(plan.id, PLAN_DRAWER_DATA[plan.id], isSingleCluster);
  const rcaVariant = plan.severity === 'critical' ? 'ols-aio-rca-box--critical' : 'ols-aio-rca-box--warning';
  const options = enrichRemediationOptionsWithDiagnosis(
    enrichRemediationOptionsWithConfidence(
      plan.id,
      applyScRemediationPatches(PLAN_REMEDIATION_OPTIONS[plan.id] ?? [], plan.id, isSingleCluster),
      drawer?.confidence,
    ),
    drawer,
  );
  /**
   * OLS-3724 mutual exclusivity:
   * - When remediation options exist, each card renders its own RCA — hide top-level.
   * - Show top-level RCA for analyzing, pending-ready (awaiting approval), analysis-only,
   *   no-options, verifying (hub shows VerificationPanel instead of option cards),
   *   and escalation handoff states.
   */
  const showPerOptionRca =
    options.length > 0 &&
    !isAnalysisOnly &&
    !isAnalyzing &&
    !isPendingReadyForAnalysis &&
    !isEscalated &&
    !isEscalating &&
    !isVerifying;
  const showTopLevelRca = !showPerOptionRca;

  const analysisLogsLifecycle = resolveAnalysisLogsLifecycle(status);
  const analysisLogFinding =
    drawer?.aggregatedFinding ??
    'Signal correlation in progress — querying fleet telemetry and alert history.';
  const analysisLogNarrative =
    drawer?.rootCauseNarrative ??
    'Root cause hypothesis generation in progress. Partial findings stream into the analysis log.';
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
      maxAttempts: configMaxRetryAttempts,
    });
  };

  const handleAcknowledgePlan = () => {
    acknowledgePlan(plan.id);
  };

  // ── Execution policy: auto-execute with reversibility circuit breaker ─────────
  // When executionPolicy === 'auto', the primary option's reversibility is checked.
  // If partially reversible or irreversible, the circuit breaker fires and we fall
  // back to manual approval (show warning Alert + "Apply remediation" button).
  const primaryOption = options[0];
  const reversibilityCircuitBreakerActive =
    isProposed &&
    executionPolicy === 'auto' &&
    primaryOption?.reversible !== undefined &&
    primaryOption.reversible !== 'Reversible';

  // Auto-execute the primary option when executionPolicy is 'auto' and the circuit
  // breaker is NOT active. A 2-second spinner gives the user visibility before commit.
  const [isAutoExecuteQueued, setIsAutoExecuteQueued] = useState(false);
  useEffect(() => {
    if (
      !isProposed ||
      executionPolicy !== 'auto' ||
      reversibilityCircuitBreakerActive ||
      !isAgenticAutomationEnabled ||
      !primaryOption
    ) {
      setIsAutoExecuteQueued(false);
      return undefined;
    }
    setIsAutoExecuteQueued(true);
    const timer = window.setTimeout(() => {
      executeRemediation(plan.id, {
        optionIndex: 0,
        optionId: primaryOption.id,
        optionTitle: primaryOption.title,
        maxAttempts: configMaxRetryAttempts,
      });
      setIsAutoExecuteQueued(false);
    }, 2000);
    return () => {
      window.clearTimeout(timer);
      setIsAutoExecuteQueued(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProposed, executionPolicy, reversibilityCircuitBreakerActive, isAgenticAutomationEnabled, plan.id]);

  const handleVerificationComplete = useCallback(() => {
    if (!isAgenticAutomationEnabled) return;
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
  }, [completeVerification, isAgenticAutomationEnabled, plan.id, workflow.verification]);

  if (!drawer && !isEscalating && !isPending && !isAnalyzing) return null;

  // Cluster-update domain: RCA + handoff to Administration → Cluster Update (shared for all these runs).
  if (isClusterUpdatePlan) {
    return (
      <Stack style={{ gap: '24px' }}>
        <StackItem>
          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
            <AiExperienceIcon size={20} />
            <Title headingLevel="h3" size="lg" style={{ marginBottom: 0 }}>
              Agentic run details
            </Title>
          </Flex>
          <Content component="p" className="ols-ai-hub-page-disclaimer">
            <InfoCircleIcon
              style={{
                color: 'var(--pf-t--global--icon--color--status--info--default)',
                marginInlineEnd: 'var(--pf-t--global--spacer--xs)',
                verticalAlign: 'middle',
                flexShrink: 0,
              }}
              aria-hidden
            />
            The autonomous features of OpenShift Lightspeed use AI technology to generate output. Always
            review AI-generated content prior to use.
          </Content>
        </StackItem>

        <StackItem>
          <TriggerRequestSection
            request={plan.request}
            planId={plan.id}
            logsLifecycle={analysisLogsLifecycle}
            logFinding={analysisLogFinding}
            logNarrative={analysisLogNarrative}
            analysisFailedToInitialize={status === 'Failed' && !plan.request?.trim()}
            traceId={plan.traceId}
            runStatus={status}
          />
        </StackItem>

        <StackItem>
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            gap={{ default: 'gapSm' }}
            style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
          >
            <Title headingLevel="h4" size="md" style={{ marginBottom: 0 }}>
              Root cause analysis
            </Title>
            <Label color="grey" isCompact>AI-generated</Label>
          </Flex>
          {isPendingReadyForAnalysis ? (
            <RcaLockedPlaceholder isSuspended={!isAgenticAutomationEnabled} isPendingApproval />
          ) : isAnalyzing || !drawer ? (
            <RcaLockedPlaceholder isSuspended={!isAgenticAutomationEnabled} />
          ) : (
            <div className={`ols-aio-rca-box ${rcaVariant}`} style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                <span className="ols-aio-text-overline">Detected root cause</span>
              </div>
              <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                {drawer.aggregatedFinding}
              </Content>
              <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                {drawer.rootCauseNarrative}
              </Content>
            </div>
          )}
        </StackItem>

        <StackItem>
          <Title headingLevel="h4" size="md" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
            Remediation hub
          </Title>
          <Card style={{ borderRadius: '16px' }}>
            <CardHeader>
              <Flex
                justifyContent={{ default: 'justifyContentSpaceBetween' }}
                alignItems={{ default: 'alignItemsFlexStart' }}
                flexWrap={{ default: 'nowrap' }}
                style={{ width: '100%' }}
              >
                <FlexItem>
                  <Flex
                    direction={{ default: 'column' }}
                    alignItems={{ default: 'alignItemsFlexStart' }}
                    gap={{ default: 'gapXs' }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap' }}>
                      Remediation
                    </span>
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: '14px',
                        lineHeight: 1.4,
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                      }}
                    >
                      {plan.synopsis}
                    </span>
                  </Flex>
                </FlexItem>
                <FlexItem>
                  {isCompleted ? (
                    <Label color="green" icon={<CheckCircleIcon />}>Completed</Label>
                  ) : status === 'Failed' ? (
                    <Label color="red" icon={<ExclamationCircleIcon />}>Failed</Label>
                  ) : (isExecuting || isVerifying) ? (
                    <Label color="blue" icon={<Spinner size="sm" aria-label="In progress" />}>In progress</Label>
                  ) : isEscalated ? (
                    <Label color="yellow" icon={<ExclamationTriangleIcon />}>Escalated</Label>
                  ) : isDenied ? (
                    <Label color="red" icon={<ExclamationCircleIcon />}>Denied</Label>
                  ) : isEmergencyStopped ? (
                    <Label color="orange" icon={<ExclamationTriangleIcon />}>Emergency stopped</Label>
                  ) : null}
                </FlexItem>
              </Flex>
            </CardHeader>
            <CardBody className="ols-remediation-option-card__body">
              {onRemediateInClusterUpdates ? (
                <Button
                  variant="link"
                  isInline
                  isDisabled={!isAgenticAutomationEnabled}
                  onClick={onRemediateInClusterUpdates}
                >
                  Remediate in Cluster Updates
                </Button>
              ) : (
                <Content component="p" style={{ margin: 0 }}>
                  Continue remediation from Administration → Cluster Update.
                </Content>
              )}
            </CardBody>
          </Card>
        </StackItem>

        {/* ── Timeline (always last) ────────────────────────────────────── */}
        <StackItem>
          <AgenticRunTimeline
            status={status}
            createdAt={plan.createdAt}
            isCapabilitiesDisabled={!isAgenticAutomationEnabled}
          />
        </StackItem>
      </Stack>
    );
  }

  // ── Pending HITL gate — Phase 1: Initializing (5s spinner) ──────────────────
  // Phase 2 (READY_FOR_ANALYSIS) falls through to the full Agentic Run Details
  // layout below with "Approve analysis" surfaced in the Analysis request header.
  if (isPending && pendingSubState === 'INITIALIZING') {
    return (
      <EmptyState
        titleText={isAgenticAutomationEnabled ? 'Initializing plan...' : 'Analysis suspended'}
        headingLevel="h4"
        icon={() => isAgenticAutomationEnabled
          ? <Spinner size="lg" aria-label="Initializing" />
          : <ExclamationTriangleIcon style={{ color: 'var(--pf-t--global--icon--color--status--warning--default)', fontSize: '2rem' }} aria-hidden />
        }
      >
        <EmptyStateBody>
          {isAgenticAutomationEnabled
            ? 'The proposal custom resource has been created on the cluster. Waiting for the AI analysis engine to dispatch.'
            : 'Agentic capabilities are disabled. Analysis cannot be dispatched until capabilities are re-enabled by an administrator.'
          }
        </EmptyStateBody>
      </EmptyState>
    );
  }

  const escalatedPlaybook = ESCALATED_PLAN_PLAYBOOKS[plan.id] ?? DEFAULT_ESCALATION_PLAYBOOK;

  const showExecutionLog = isExecutionPhase && (
    approvedOptionId ? selectedOptionId === approvedOptionId : selectedOptionIndex === 0
  );

  // Log text used by the standalone Execution / Verification Summary cards.
  const summaryPostMortem = useMemo(
    () => (isTerminal || isExecuting || isVerifying)
      ? (PLAN_POSTMORTEM[plan.id] ?? generatePostMortem(plan))
      : null,
    [isTerminal, isExecuting, isVerifying, plan],
  );
  const summaryExecutionLog = summaryPostMortem?.rawLog ?? summaryPostMortem?.failureTrace ?? '';
  const summaryVerificationLog = workflow.verification?.checks.join('\n') ?? (
    isTerminal || isVerifying ? generateVerificationLogs(plan.id) : ''
  );
  const summaryEscalationLog = (isEscalated || isEscalating) ? generateEscalationLogs(plan.id) : '';

  return (
    <>
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
          <InfoCircleIcon
            style={{
              color: 'var(--pf-t--global--icon--color--status--info--default)',
              marginInlineEnd: 'var(--pf-t--global--spacer--xs)',
              verticalAlign: 'middle',
              flexShrink: 0,
            }}
            aria-hidden
          />
          The autonomous features of OpenShift Lightspeed use AI technology to generate output. Always
          review AI-generated content prior to use.
        </Content>
      </StackItem>

      <StackItem>
        <TriggerRequestSection
          request={plan.request}
          planId={plan.id}
          logsLifecycle={analysisLogsLifecycle}
          logFinding={analysisLogFinding}
          logNarrative={analysisLogNarrative}
          analysisFailedToInitialize={status === 'Failed' && !plan.request?.trim()}
          traceId={plan.traceId}
          runStatus={status}
        />
      </StackItem>

      {/* ── Analysis action buttons (below Analysis request card) ─────── */}
      {isPendingReadyForAnalysis && (
        <StackItem>
          <Button
            variant="primary"
            isDisabled={!isAgenticAutomationEnabled}
            onClick={() => dispatchAnalysis(plan.id)}
          >
            Approve analysis
          </Button>
        </StackItem>
      )}
      {isAnalyzing && (
        <StackItem>
          <Button
            variant="secondary"
            isDanger
            isDisabled={!isAgenticAutomationEnabled}
            onClick={() => setIsStopAnalysisModalOpen(true)}
          >
            Stop analysis
          </Button>
        </StackItem>
      )}

      {/* ── Status alerts (below heading) ────────────────────────────── */}
      {isEscalating && (
        <StackItem>
          <Alert
            isInline
            variant="danger"
            title="Automated remediation retries exhausted"
          >
            The autonomous agent failed to resolve this issue after {configMaxRetryAttempts} retry attempt{configMaxRetryAttempts !== 1 ? 's' : ''}.{' '}
            {escalationPolicy === 'auto'
              ? 'Routing incident to configured external channels (PagerDuty / ITSM).'
              : 'Escalation handoff is in progress, and human intervention is now required.'}
          </Alert>
        </StackItem>
      )}
      {isEscalating && escalationPolicy === 'manual' && (
        <StackItem>
          <Flex gap={{ default: 'gapSm' }}>
            <FlexItem>
              <Button
                variant="danger"
                isDisabled={!isAgenticAutomationEnabled}
                onClick={handleAcknowledgePlan}
              >
                Escalate manually
              </Button>
            </FlexItem>
            <FlexItem>
              <Button
                variant="secondary"
                isDisabled={!isAgenticAutomationEnabled}
                onClick={() => {
                  if (selectedOption) {
                    executeRemediation(plan.id, {
                      optionIndex: selectedOptionIndex,
                      optionId: selectedOption.id,
                      optionTitle: selectedOption.title,
                      maxAttempts: configMaxRetryAttempts,
                    });
                  }
                }}
              >
                Retry execution
              </Button>
            </FlexItem>
          </Flex>
        </StackItem>
      )}
      {isEscalated && (
        <StackItem>
          <Alert
            isInline
            variant="warning"
            title="Remediation action required"
          >
            Automated execution failed after reaching the maximum retry limit. Manual operator
            intervention is required to resolve this escalation.
          </Alert>
        </StackItem>
      )}
      {isDenied && (
        <StackItem>
          <DeniedPlanBanner onStartNewInvestigation={isAgenticAutomationEnabled ? onStartNewInvestigation : undefined} />
        </StackItem>
      )}
      {isEmergencyStopped && (
        <StackItem>
          <Alert
            isInline
            variant="warning"
            title="Execution halted mid-flight"
          >
            This agentic run was stopped while execution was in progress. The cluster may be in a
            partially modified state. Review the proposed agent commands below and complete or roll
            back the operation manually during a scheduled maintenance window.
          </Alert>
        </StackItem>
      )}

      {/* ── Section A: Root cause analysis (top-level; OLS-3724 mutual exclusivity) ── */}
      {showTopLevelRca && (
      <StackItem>
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          gap={{ default: 'gapSm' }}
          style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
        >
          <Title headingLevel="h4" size="md" style={{ marginBottom: 0 }}>
            Root cause analysis
          </Title>
          <Label color="grey" isCompact>AI-generated</Label>
        </Flex>
          {isPendingReadyForAnalysis ? (
            <RcaLockedPlaceholder isSuspended={!isAgenticAutomationEnabled} isPendingApproval />
          ) : isAnalyzing ? (
            <>
              <RcaLockedPlaceholder isSuspended={!isAgenticAutomationEnabled} />
            </>
          ) : (
          <div className={`ols-aio-rca-box ${rcaVariant}`} style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
              <span className="ols-aio-text-overline">Detected root cause</span>
            </div>
            <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
              {drawer!.aggregatedFinding}
            </Content>
            <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
              {drawer!.rootCauseNarrative}
            </Content>
          </div>
          )}
      </StackItem>
      )}

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
                options were generated — acknowledge after review to clear it from your active runs list.
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
                  variant="link"
                  icon={<RhUiDownloadIcon />}
                  iconPosition="start"
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
            <Label color="grey" isCompact>AI-generated</Label>
            {!isAnalyzing && !isTerminal && !isDenied && visibleOptionCount > 0 && (
              <Label color="grey" isCompact variant="outline">{optionLabel}</Label>
            )}
          </Flex>
          <WaitingApprovalPlanMeta plan={plan} />
        </Flex>
          {(isPendingReadyForAnalysis || isAnalyzing) ? (
            <HubLockedPlaceholder
              isSuspended={!isAgenticAutomationEnabled}
              awaitingAnalysis={isPendingReadyForAnalysis}
            />
          ) : isEscalated ? (
            <>
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
                <ExpandableCodeBlock
                  id={`escalated-cmd-${plan.id}`}
                  code={escalatedPlaybook.command}
                  codeStyle={{ fontSize: '12px' }}
                />
                <Button variant="link" icon={<RhUiDownloadIcon />} iconPosition="start"
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
                        rootCause={opt.diagnosis}
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
                      rootCause={opt.diagnosis}
                    />
                  </StackItem>
                );
              })}
            </Stack>
          ) : isTerminal ? (
            <>
              {terminalVisibleOptions.length > 0 && (
                <Stack hasGutter>
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
                          rootCause={opt.diagnosis}
                          approval={workflow.executionApproval}
                          verification={workflow.verification}
                        />
                      </StackItem>
                    );
                  })}
                </Stack>
              )}
              {terminalVisibleOptions.length === 0 && (
                <TerminalEvidenceCard plan={plan} />
              )}
            </>
          ) : isVerifying && verificationState ? (
            <>
              <VerificationPanel
                verification={verificationState}
                isLive={Boolean(workflow.verification) && !showStaticVerification && isAgenticAutomationEnabled}
                onComplete={verificationPolicy === 'auto' ? handleVerificationComplete : undefined}
              />
              {/* Manual verification gate: SRE triggers health check and marks resolved */}
              {verificationPolicy === 'manual' && !workflow.verification?.outcome && (
                <Flex style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
                  <FlexItem>
                    <Button
                      variant="primary"
                      isDisabled={!isAgenticAutomationEnabled}
                      onClick={handleVerificationComplete}
                    >
                      Approve verification
                    </Button>
                  </FlexItem>
                </Flex>
              )}
            </>
          ) : (
            <>
              {retryBanner && (
                <Alert variant="warning" isInline title={retryBanner} style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }} />
              )}

              <div
                style={{
                  opacity: !isAgenticAutomationEnabled ? 0.55 : 1,
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
                          rootCause={opt.diagnosis}
                          onExecute={isProposed && (executionPolicy !== 'auto' || reversibilityCircuitBreakerActive) ? () => { setSelectedOptionId(opt.id); setIsExecuteConfirmModalOpen(true); } : undefined}
                          approval={workflow.executionApproval}
                          verification={workflow.verification}
                        />
                      </StackItem>
                    );
                  })}
                </Stack>
              </div>

              {/* ── Execution policy: auto-queued status ─────────────────────── */}
              {isProposed && isAutoExecuteQueued && (
                <Flex
                  alignItems={{ default: 'alignItemsCenter' }}
                  gap={{ default: 'gapSm' }}
                  style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}
                >
                  <FlexItem>
                    <Spinner size="sm" aria-label="Executing default remediation" />
                  </FlexItem>
                  <FlexItem>
                    <Content component="p" style={{ margin: 0, color: 'var(--pf-t--global--text--color--subtle)' }}>
                      Executing default remediation (1 of {optionCount})…
                    </Content>
                  </FlexItem>
                </Flex>
              )}

              {/* ── Reversibility circuit breaker warning ────────────────────── */}
              {isProposed && reversibilityCircuitBreakerActive && (
                <Alert
                  variant="warning"
                  isInline
                  title="Manual approval required"
                  style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}
                >
                  Automatic execution was paused because the primary remediation option (
                  <strong>{primaryOption?.title}</strong>) is{' '}
                  <strong>{primaryOption?.reversible === 'Partial' ? 'partially reversible' : 'irreversible'}</strong>.
                  Review the proposed commands and approve manually.
                </Alert>
              )}

              {isProposed && onRejectPlan && (
                <Flex style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
                  <FlexItem>
                    <Button
                      variant="secondary"
                      isDisabled={!isAgenticAutomationEnabled}
                      onClick={() => setIsDenyModalOpen(true)}
                    >
                      Deny run
                    </Button>
                  </FlexItem>
                </Flex>
              )}

              {/* ── Deny run confirmation modal ────────────────────────────── */}
              <Modal
                variant={ModalVariant.small}
                isOpen={isDenyModalOpen}
                onClose={() => { setIsDenyModalOpen(false); setIsDenySelectOpen(false); setDenyReason(''); }}
                aria-labelledby="deny-run-confirm-title"
              >
                <ModalHeader title="Confirm remediation denial" labelId="deny-run-confirm-title" />
                <ModalBody>
                  <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                    Denying this run will cancel all proposed automated actions. The associated alerts
                    must then be investigated and resolved manually.
                  </Content>
                  <Content
                    component="p"
                    style={{
                      marginBottom: 'var(--pf-t--global--spacer--xs)',
                      fontWeight: 'var(--pf-t--global--font--weight--body--bold)',
                    }}
                  >
                    Reason for denial (optional)
                  </Content>
                  <Dropdown
                    isOpen={isDenySelectOpen}
                    onOpenChange={setIsDenySelectOpen}
                    onSelect={(_e, val) => {
                      setDenyReason(val as string);
                      setIsDenySelectOpen(false);
                    }}
                    toggle={(ref) => (
                      <MenuToggle
                        ref={ref}
                        onClick={() => setIsDenySelectOpen(!isDenySelectOpen)}
                        isExpanded={isDenySelectOpen}
                        style={{ width: '100%' }}
                      >
                        {({
                          'incorrect-rca': 'Incorrect root cause diagnosis',
                          'too-risky': 'Remediation too risky',
                          'prefer-manual': 'Prefer manual fix',
                          'false-positive': 'False positive',
                          'other': 'Other',
                        } as Record<string, string>)[denyReason] ?? 'Select a reason'}
                      </MenuToggle>
                    )}
                  >
                    <DropdownList>
                      <DropdownItem value="incorrect-rca">Incorrect root cause diagnosis</DropdownItem>
                      <DropdownItem value="too-risky">Remediation too risky</DropdownItem>
                      <DropdownItem value="prefer-manual">Prefer manual fix</DropdownItem>
                      <DropdownItem value="false-positive">False positive</DropdownItem>
                      <DropdownItem value="other">Other</DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </ModalBody>
                <ModalFooter>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setIsDenyModalOpen(false);
                      setIsDenySelectOpen(false);
                      setDenyReason('');
                      onRejectPlan?.();
                    }}
                  >
                    Deny run
                  </Button>
                  <Button
                    variant="link"
                    onClick={() => { setIsDenyModalOpen(false); setIsDenySelectOpen(false); setDenyReason(''); }}
                  >
                    Cancel
                  </Button>
                </ModalFooter>
              </Modal>

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
                  {selectedOption?.reversible === 'Irreversible' && (
                    <Alert
                      isInline
                      variant="warning"
                      title="This action is irreversible"
                      style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
                    >
                      You will not be able to roll back or automatically undo this remediation once
                      execution begins. Ensure you have taken a full cluster backup if required.
                    </Alert>
                  )}
                  <Content component="p" style={{ fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)', marginBottom: 'var(--pf-t--global--spacer--xs)' }}>
                    OpenShift Lightspeed uses AI technology to help generate this remediation plan.
                  </Content>
                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }}>
                    <FlexItem>
                      <InfoCircleIcon
                        style={{
                          color: 'var(--pf-t--global--icon--color--status--info--default)',
                          fontSize: '12px',
                        }}
                        aria-hidden
                      />
                    </FlexItem>
                    <FlexItem>
                      <Content component="p" style={{ fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)', margin: 0 }}>
                        Always review AI-generated content prior to use.
                      </Content>
                    </FlexItem>
                  </Flex>
                </ModalBody>
                <ModalFooter>
                  <Button
                    variant={selectedOption?.reversible === 'Irreversible' ? 'danger' : 'primary'}
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
          <Button
            variant="danger"
            isDisabled={!isAgenticAutomationEnabled}
            onClick={() => setIsStopExecutionModalOpen(true)}
          >
            Stop execution
          </Button>
          <Modal
            variant={ModalVariant.small}
            isOpen={isStopExecutionModalOpen}
            onClose={() => setIsStopExecutionModalOpen(false)}
            aria-labelledby="stop-plan-execution-title"
          >
            <ModalHeader title="Stop execution?" labelId="stop-plan-execution-title" />
            <ModalBody>
              This will halt the execution run. This may result in partial execution. You may need to manually
              complete or undo any partial changes.
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

      {/* ── Execution Summary Card ─────────────────────────────────────── */}
      {(isExecuting || isVerifying || isTerminal) && (
        <StackItem>
          <ExecutionSummaryCard plan={plan} executionLog={summaryExecutionLog} />
        </StackItem>
      )}

      {/* ── Verification Summary Card ───────────────────────────────────── */}
      {(isVerifying || isTerminal) && (
        <StackItem>
          <VerificationSummaryCard plan={plan} verificationLog={summaryVerificationLog} />
        </StackItem>
      )}

      {/* ── Escalation Summary Card ─────────────────────────────────────── */}
      {isEscalated && (
        <StackItem>
          <EscalationSummaryCard
            plan={plan}
            escalationLog={summaryEscalationLog}
            escalationPolicy={escalationPolicy}
          />
        </StackItem>
      )}

      {/* ── Escalate to human action (Failed state only) ──────────────── */}
      {status === 'Failed' && (
        <StackItem>
          <Button variant="secondary" isDisabled={!isAgenticAutomationEnabled}>
            Escalate to human
          </Button>
        </StackItem>
      )}

      {/* ── Section E: Timeline (always last) ────────────────────────── */}
      <StackItem>
        <AgenticRunTimeline
          status={status}
          createdAt={plan.createdAt}
          isCapabilitiesDisabled={!isAgenticAutomationEnabled}
        />
      </StackItem>
    </Stack>

    {/* Stop analysis modal — rendered as a portal; lives outside Stack to avoid adding a gap slot */}
    <Modal
      variant={ModalVariant.small}
      isOpen={isStopAnalysisModalOpen}
      onClose={() => setIsStopAnalysisModalOpen(false)}
      aria-labelledby="stop-plan-analysis-title"
    >
      <ModalHeader title="Stop analysis?" labelId="stop-plan-analysis-title" />
      <ModalBody>
        This halts root cause investigation for this run. Partial findings are preserved but no
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
    </>
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
        request:
          normalizedRow.request ??
          buildAgenticRunRequest({
            id: row.id,
            name: identity?.name ?? row.id,
            synopsis: identity?.synopsis ?? normalizedRow.synopsis,
            severity: normalizedRow.severity,
            namespace: identity?.namespace,
            triggerDomain: normalizedRow.triggerDomain,
          }),
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
    const perspectiveKey: AppShellPerspectiveKey =
      perspectiveKeyFromShellName(activePerspective)
      ?? (isSingleCluster ? 'core-platforms' : 'fleet-management');
    writePlanRemediationDrillSession({ perspectiveKey });
    navigate(getPlanDetailHref(plan, perspectiveKey));
  }, [activePerspective, isSingleCluster, navigate]);

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

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  ExpandableSection,
  Flex,
  FlexItem,
  Label,
  LabelGroup,
  MenuToggle,
  MenuToggleElement,
  Pagination,
  PaginationVariant,
  Select,
  SelectList,
  SelectOption,
  Skeleton,
  Spinner,
  Stack,
  StackItem,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import { AngleRightIcon, BullseyeIcon, CheckCircleIcon, CodeBranchIcon, DownloadIcon, ExclamationCircleIcon, ExclamationTriangleIcon, ExternalLinkAltIcon, LockIcon, LockOpenIcon, SearchIcon, TerminalIcon, TimesIcon, WrenchIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { AI_EXPERIENCE_ICON_DATA_URL } from '../../components/autonomousAiObserve/aiExperienceIconUrl';
import type { ReasoningStep } from '../../components/autonomousAiObserve/data';
import { ReasoningChainStepGlyph, formatReasoningStepDisplayTime } from '../../components/autonomousAiObserve/reasoningChainTimeline';
import '../../components/autonomousAiObserve/autonomous-ai-observe.css';
import { useActivePerspective } from '@app/shared/contexts/ActivePerspectiveContext';
import { agenticGlobalAiApi } from '../../persesAgenticBridge';

// ─── Types ────────────────────────────────────────────────────────────────────

type PlanSeverity = 'critical' | 'warning';
type PlanStatus = 'Investigating' | 'Waiting Approval' | 'Remediating' | 'Completed' | 'Failed';

/** Icon semantic used in expandable row consolidated reasons. */
type ReasonIconType = 'sync' | 'alert' | 'warning' | 'gear' | 'ban' | 'wrench';

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
  blastRadius: string;
  consolidationScope: string;
  triggerDomains: string;
  isUnauthorized: boolean;
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
}

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
};

// ─── Dataset — Top plans (score ≥ 80) ────────────────────────────────────────

const TOP_PLANS: PlanRow[] = [
  {
    id: 'tp1',
    severity: 'critical',
    status: 'Waiting Approval',
    score: 94,
    synopsis: 'Re-sync GitOps Domain Drift',
    blastRadius: '4 Fleets',
    consolidationScope: '1 Drift / 4 Alerts',
    triggerDomains: 'GitOps / ArgoCD',
    isUnauthorized: false,
    drawerTargets: ['prod-east-2', 'prod-eu-west-1', 'stg-central', 'edge-apac-1'],
    expandedReasons: [
      { icon: 'sync',  text: 'ArgoCD Controller Event: 1 LiveStateOutOfSync event detected.' },
      { icon: 'alert', text: 'Prometheus Alert: 4 IngressControllerDegraded active alerts running.' },
    ],
  },
  {
    id: 'tp2',
    severity: 'critical',
    status: 'Investigating',
    score: 89,
    synopsis: 'Quarantine Container Security Exploit',
    blastRadius: '3 Clusters',
    consolidationScope: '14 Runtime Events',
    triggerDomains: 'Security (ACS)',
    isUnauthorized: false,
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
    blastRadius: '1 Cluster',
    consolidationScope: '6 Events / 2 Alerts',
    triggerDomains: 'OCP Core Kubelet',
    isUnauthorized: false,
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
    blastRadius: '2 Clusters',
    consolidationScope: '8 Alerts',
    triggerDomains: 'OCP Storage',
    isUnauthorized: true,
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
    blastRadius: '1 Cluster',
    consolidationScope: '2 API Events',
    triggerDomains: 'etcd Controller',
    isUnauthorized: false,
    drawerTargets: ['prod-east-2'],
    expandedReasons: [
      { icon: 'gear', text: 'K8s API Server Log Hook: 2 etcd_db_total_size_in_bytes fragmentation events.' },
    ],
  },
];

// ─── Dataset — All plans (score < 80) ────────────────────────────────────────

const ALL_PLANS: PlanRow[] = [
  {
    id: 'ap1',
    severity: 'warning',
    status: 'Waiting Approval',
    score: 78,
    synopsis: 'Fix Minor App Memory Leak',
    blastRadius: '1 Cluster',
    consolidationScope: '3 Alerts',
    triggerDomains: 'Prometheus',
    isUnauthorized: false,
    drawerTargets: ['stg-central'],
    expandedReasons: [
      { icon: 'alert', text: '3 KubePodMemoryUtilizationHigh alarms active on dev pods.' },
    ],
  },
  {
    id: 'ap2',
    severity: 'warning',
    status: 'Remediating',
    score: 75,
    synopsis: 'Repair Dev CI/CD Webhook Block',
    blastRadius: '2 Clusters',
    consolidationScope: '1 Failure / 2 Alerts',
    triggerDomains: 'Pipelines / Tekton',
    isUnauthorized: false,
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
    blastRadius: '1 Cluster',
    consolidationScope: '1 Auth Event',
    triggerDomains: 'OCP Auth',
    isUnauthorized: true,
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
    blastRadius: '3 Clusters',
    consolidationScope: '4 Alerts',
    triggerDomains: 'OCP Network',
    isUnauthorized: false,
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
    blastRadius: '1 Cluster',
    consolidationScope: '2 Events / 1 Alert',
    triggerDomains: 'Metal3 Controller',
    isUnauthorized: false,
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
    blastRadius: '1 Cluster',
    consolidationScope: '1 Drift Event',
    triggerDomains: 'GitOps / ArgoCD',
    isUnauthorized: false,
    drawerTargets: ['stg-central'],
    expandedReasons: [
      { icon: 'sync', text: 'ArgoCD Event: 1 LiveStateOutOfSync event flagged in staging.' },
    ],
  },
  {
    id: 'ap7',
    severity: 'warning',
    status: 'Waiting Approval',
    score: 59,
    synopsis: 'Fix Inactive Ingress Router Replicas',
    blastRadius: '2 Clusters',
    consolidationScope: '2 Alerts',
    triggerDomains: 'OCP Network',
    isUnauthorized: false,
    drawerTargets: ['prod-east-2', 'prod-eu-west-1'],
    expandedReasons: [
      { icon: 'alert', text: '2 IngressControllerMinReplicasNotMet rules active.' },
    ],
  },
  {
    id: 'ap8',
    severity: 'warning',
    status: 'Waiting Approval',
    score: 55,
    synopsis: 'Mitigate ACS Compliance Violation',
    blastRadius: '1 Cluster',
    consolidationScope: '1 Security Event / 3 Alerts',
    triggerDomains: 'Security (ACS)',
    isUnauthorized: true,
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
    blastRadius: '2 Clusters',
    consolidationScope: '4 Pod Events',
    triggerDomains: 'OCP Core Kubelet',
    isUnauthorized: false,
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
    blastRadius: '1 Cluster',
    consolidationScope: '1 Alert',
    triggerDomains: 'Pipelines / App',
    isUnauthorized: false,
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
    blastRadius: '1 Cluster',
    consolidationScope: '1 HPA Event',
    triggerDomains: 'OCP Optimize',
    isUnauthorized: false,
    drawerTargets: ['prod-east-2'],
    expandedReasons: [
      { icon: 'warning', text: 'HPA Controller Hook: 1 FailedComputeMetricsReplicas event.' },
    ],
  },
  {
    id: 'ap12',
    severity: 'warning',
    status: 'Waiting Approval',
    score: 42,
    synopsis: 'Fix Container Registry Pull Failures',
    blastRadius: '4 Clusters',
    consolidationScope: '5 Alerts',
    triggerDomains: 'OCP Core',
    isUnauthorized: false,
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
    blastRadius: '1 Cluster',
    consolidationScope: '1 Event / 2 Alerts',
    triggerDomains: 'OCP Storage',
    isUnauthorized: false,
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
    blastRadius: '3 Clusters',
    consolidationScope: '3 Alerts',
    triggerDomains: 'OCP Core Node',
    isUnauthorized: false,
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
    blastRadius: '1 Cluster',
    consolidationScope: '1 Registry Event',
    triggerDomains: 'OCP Registry',
    isUnauthorized: false,
    drawerTargets: ['prod-east-2'],
    expandedReasons: [
      { icon: 'warning', text: 'ImageRegistry Controller Hook: 1 PruneImageRegistryManifestsFailed trace.' },
    ],
  },
];

// ─── Dataset — Single-cluster overrides (Core Platforms perspective) ──────────
// Same plan IDs, statuses, scores, and reasons as fleet datasets.
// Only blastRadius, triggerDomains, and drawerTargets are localized to reflect
// sub-cluster topology (namespaces, pods, nodes) instead of multi-cluster scope.

const SC_TOP_PLANS: PlanRow[] = [
  { ...TOP_PLANS[0], blastRadius: '3 Applications', triggerDomains: 'ArgoCD Core',        drawerTargets: ['payments-prod', 'retail-prod', 'logistics-prod'] },
  { ...TOP_PLANS[1], blastRadius: '2 Deployments',  triggerDomains: 'ACS DaemonSet',       drawerTargets: ['payment-api', 'payment-worker'] },
  { ...TOP_PLANS[2], blastRadius: '4 Pods',         triggerDomains: 'Kubelet Engine',      drawerTargets: ['payment-api-7d4f8', 'payment-api-7d4f8-2', 'payment-worker-9c2a1', 'payment-worker-9c2a1-2'] },
  { ...TOP_PLANS[3], blastRadius: '1 Ceph Pool',    triggerDomains: 'Local PV CSI',       drawerTargets: ['ocs-storagecluster-ceph-rbd'] },
  { ...TOP_PLANS[4], blastRadius: '3 etcd Members', triggerDomains: 'etcd Pod Mesh',     drawerTargets: ['etcd-master-01', 'etcd-master-02', 'etcd-master-03'] },
];

const SC_ALL_PLANS: PlanRow[] = [
  { ...ALL_PLANS[0],  blastRadius: '2 Deployments',      triggerDomains: 'Local Prometheus',       drawerTargets: ['analytics-api', 'analytics-worker'] },
  { ...ALL_PLANS[1],  blastRadius: '1 EventListener',    triggerDomains: 'Tekton Operator',        drawerTargets: ['build-webhook-listener'] },
  { ...ALL_PLANS[2],  blastRadius: '1 OAuth Client',     triggerDomains: 'Cluster Auth',           drawerTargets: ['oauth-openshift'] },
  { ...ALL_PLANS[3],  blastRadius: '4 DNS Pods',         triggerDomains: 'CoreDNS Deployment',     drawerTargets: ['dns-default-7f8c9', 'dns-default-7f8c9-2', 'dns-default-7f8c9-3', 'dns-default-7f8c9-4'] },
  { ...ALL_PLANS[4],  blastRadius: '2 Worker Nodes',     triggerDomains: 'BareMetal Host Operator', drawerTargets: ['worker-bm-03', 'worker-bm-04'] },
  { ...ALL_PLANS[5],  blastRadius: '3 Resources',        triggerDomains: 'ArgoCD Controller',      drawerTargets: ['staging-api', 'staging-db-config', 'staging-api-svc'] },
  { ...ALL_PLANS[6],  blastRadius: '2 Router Pods',      triggerDomains: 'Ingress Operator',       drawerTargets: ['router-default-6d4f8', 'router-default-6d4f8-2'] },
  { ...ALL_PLANS[7],  blastRadius: '1 Deployment',       triggerDomains: 'ACS Policy Engine',      drawerTargets: ['retail-checkout'] },
  { ...ALL_PLANS[8],  blastRadius: '1 Node',             triggerDomains: 'Local Node Runtime',     drawerTargets: ['worker-logistics-01'] },
  { ...ALL_PLANS[9],  blastRadius: '1 StatefulSet',      triggerDomains: 'CI App Controller',      drawerTargets: ['jenkins-0'] },
  { ...ALL_PLANS[10], blastRadius: '1 HPA Object',       triggerDomains: 'Autoscaling Framework',  drawerTargets: ['api-gateway-hpa'] },
  { ...ALL_PLANS[11], blastRadius: '3 Image Streams',    triggerDomains: 'Local Registry',         drawerTargets: ['ubi9-app', 'ubi9-runtime', 'ubi9-builder'] },
  { ...ALL_PLANS[12], blastRadius: '1 PVC Volume',       triggerDomains: 'AWS-EBS CSI Plugin',     drawerTargets: ['postgres-data-0'] },
  { ...ALL_PLANS[13], blastRadius: '6 Cluster Nodes',    triggerDomains: 'Chrony DaemonSet',       drawerTargets: ['worker-01', 'worker-02', 'worker-03', 'master-01', 'master-02', 'master-03'] },
  { ...ALL_PLANS[14], blastRadius: '1 Registry Catalog', triggerDomains: 'Local Registry',         drawerTargets: ['image-registry'] },
];

interface PlanDrawerData {
  steps: ReasoningStep[];
  aggregatedFinding: string;
  rootCauseNarrative: string;
  remediationProposal: string;
  riskAssessment: string;
  estimatedRecovery: string;
  confidence: number;
}

const PLAN_DRAWER_DATA: Record<string, PlanDrawerData> = {
  // ── Top plans ──────────────────────────────────────────────────────────────
  tp1: {
    steps: [
      { id: 's1', time: '10:03:12', status: 'done', icon: 'exclamation', title: 'Detected ArgoCD LiveStateOutOfSync event', detail: '4 IngressControllerDegraded alerts firing fleet-wide' },
      { id: 's2', time: '10:03:25', status: 'done', icon: 'database',   title: 'Fetched GitOps revision history', detail: 'ApplicationSet r4892 applied 9 minutes before alert onset' },
      { id: 's3', time: '10:03:41', status: 'done', icon: 'network',    title: 'Diffed live vs. declared NetworkPolicy objects', detail: 'Kustomize overlay conflict found across 4 fleet namespaces' },
      { id: 's4', time: '10:03:55', status: 'done', icon: 'search',     title: 'Scored blast radius and causal confidence', detail: '4 fleets affected · 94% confidence in GitOps root cause' },
      { id: 's5',                   status: 'pending', icon: 'check',   title: 'Governor approval for fleet rollback' },
    ],
    aggregatedFinding: 'ArgoCD revision r4892 applied a malformed ApplicationSet template that mismatched live cluster state across 4 fleets.',
    rootCauseNarrative: 'A faulty Argo CD ApplicationSet push (revision r4892) propagated conflicting Kustomize overlays, causing router → workload traffic mismatches. The drift was confirmed 3 minutes after the sync event triggered 4 IngressControllerDegraded alerts.',
    remediationProposal: 'Revert ArgoCD ApplicationSet to revision r4891 and force a hard sync across all 4 affected fleets.',
    riskAssessment: 'Low — GitOps rollback is reversible and non-destructive.',
    estimatedRecovery: '~45s',
    confidence: 94,
  },
  tp2: {
    steps: [
      { id: 's1', time: '09:47:03', status: 'done',    icon: 'exclamation', title: 'ACS flagged 14 eBPF kernel syscall mutations', detail: 'KernelModuleLoad events detected on 3 cluster nodes' },
      { id: 's2', time: '09:47:18', status: 'done',    icon: 'database',    title: 'Pulled container runtime audit logs', detail: 'Activity isolated to image digest sha256:a3f1b9d4…' },
      { id: 's3', time: '09:47:34', status: 'done',    icon: 'network',     title: 'Mapped network egress from affected pods', detail: 'Unexpected outbound connection to 104.21.x.x:443' },
      { id: 's4',                   status: 'active',  icon: 'search',      title: 'Cross-referencing CVE database and Falco ruleset', detail: 'Matching syscall pattern against known exploit signatures…' },
      { id: 's5',                   status: 'pending', icon: 'check',       title: 'Assemble quarantine and patch proposal' },
    ],
    aggregatedFinding: 'Signal correlation complete. 14 eBPF kernel mutations detected across 3 clusters. Root cause isolation in progress.',
    rootCauseNarrative: 'Initial signals indicate a compromised container image exploiting kernel syscall interfaces. Full causality graph is being constructed — root cause pending confirmation.',
    remediationProposal: 'Remediation paths pending root cause confirmation.',
    riskAssessment: 'Medium — isolation will require pod eviction, causing brief service disruption.',
    estimatedRecovery: '~3m',
    confidence: 71,
  },
  tp3: {
    steps: [
      { id: 's1', time: '11:22:08', status: 'done',   icon: 'exclamation', title: 'Kubelet reported 6 OOMKilled events', detail: 'payments-api and auth-svc pods evicted across 1 cluster' },
      { id: 's2', time: '11:22:19', status: 'done',   icon: 'database',    title: 'Sampled 1-hour container memory metrics', detail: 'Heap growth 40% above configured limits since v2.1.4 deploy' },
      { id: 's3', time: '11:22:33', status: 'done',   icon: 'search',      title: 'Traced memory growth to allocator regression in v2.1.4', detail: '2 KubePodCrashLooping alarms corroborated at 11:22:28' },
      { id: 's4', time: '11:22:45', status: 'done',   icon: 'check',       title: 'Remediation plan assembled and approved', detail: 'Memory limit patch (2Gi→4Gi) + HPA scale-out to 3 replicas' },
      { id: 's5',                   status: 'active', icon: 'search',      title: 'Executing rolling pod restart with patched limits', detail: 'Restarting pods in 3-by-3 cadence to preserve service availability' },
    ],
    aggregatedFinding: '6 OOMKill evictions across payments and auth pods confirmed via Kubelet. Memory quota exhaustion root cause locked.',
    rootCauseNarrative: 'A recent workload rollout increased container memory usage 40% above configured limits. Kubelet is evicting pods before the HPA can scale replacements, amplifying the crash loop cycle.',
    remediationProposal: 'Increase memory limits on affected deployments by 40% and trigger HPA scale-out to 3 replicas.',
    riskAssessment: 'Low — resource limit adjustments are rolling and reversible.',
    estimatedRecovery: '~90s',
    confidence: 85,
  },
  tp4: {
    steps: [
      { id: 's1', time: '08:11:04', status: 'done',    icon: 'exclamation', title: 'Detected 3 CephPoolNearFull alerts', detail: 'Pool utilization exceeded 80% threshold on 2 production clusters' },
      { id: 's2', time: '08:11:17', status: 'done',    icon: 'database',    title: 'Queried Ceph OSD write-rate and log volume', detail: 'StatefulSet log emission rate 3× above configured ceiling' },
      { id: 's3', time: '08:11:30', status: 'done',    icon: 'search',      title: 'Projected storage exhaustion timeline', detail: 'At current fill rate, pool depletion in ~4 hours' },
      { id: 's4', time: '08:11:42', status: 'done',    icon: 'network',     title: 'Confirmed log rotation absent on 3 StatefulSets', detail: '5 KubePersistentVolumeFillingUp alerts corroborated' },
      { id: 's5',                   status: 'pending', icon: 'check',       title: 'Awaiting authorized approval for OSD pool expansion' },
    ],
    aggregatedFinding: '8 Prometheus alerts confirm Ceph pool utilization exceeds 80% on 2 production clusters.',
    rootCauseNarrative: 'Rook-Ceph pool fill rate has accelerated due to unconfigured log rotation on 3 stateful workloads. At current write velocity, storage exhaustion is projected in ~4 hours.',
    remediationProposal: 'Expand Ceph pool capacity by 20% and enforce log rotation on affected StatefulSets.',
    riskAssessment: 'Medium — storage expansion requires OSD reconfiguration and a brief I/O suspension period.',
    estimatedRecovery: '~2m',
    confidence: 82,
  },
  tp5: {
    steps: [
      { id: 's1', time: '07:09:11', status: 'done', icon: 'exclamation', title: 'Detected elevated API server P99 latency', detail: '2 etcd_db_total_size_in_bytes fragmentation events triggered' },
      { id: 's2', time: '07:09:22', status: 'done', icon: 'database',    title: 'Queried etcd DB size and compaction history', detail: 'Fragmentation at 68% — last auto-compact skipped during upgrade' },
      { id: 's3', time: '07:09:34', status: 'done', icon: 'search',      title: 'Correlated fragmentation with API write amplification', detail: 'Leader election overhead elevated · P99 latency >1.2s confirmed' },
      { id: 's4', time: '07:09:46', status: 'done', icon: 'check',       title: 'Defragmentation executed on all 3 control plane members', detail: 'Rolling restart cadence completed · P99 latency restored to 38ms' },
    ],
    aggregatedFinding: 'etcd database fragmentation (>65%) confirmed as root cause of elevated API server P99 latency.',
    rootCauseNarrative: 'etcd fragmentation exceeded 65% — a known performance threshold — causing API write amplification and increased leader election overhead, driving P99 latency above 1.2s.',
    remediationProposal: 'Execute etcd defragmentation on all 3 control plane members with rolling restart cadence.',
    riskAssessment: 'Low — etcd defragmentation is a supported operational procedure.',
    estimatedRecovery: '~45s',
    confidence: 91,
  },

  // ── All plans ──────────────────────────────────────────────────────────────
  ap1: {
    steps: [
      { id: 's1', time: '13:41:05', status: 'done',    icon: 'exclamation', title: '3 KubePodMemoryUtilizationHigh alarms fired', detail: 'Dev pods sustaining >85% utilization for >10 minutes' },
      { id: 's2', time: '13:41:18', status: 'done',    icon: 'database',    title: 'Profiled heap growth over 3-hour window', detail: 'Memory growing 15 MB/min — consistent with GC pressure leak' },
      { id: 's3', time: '13:41:30', status: 'done',    icon: 'search',      title: 'Attributed leak to v1.8.3 service update', detail: 'Heap profile diff confirms allocator regression in update' },
      { id: 's4',                   status: 'pending', icon: 'check',       title: 'Awaiting approval to apply memory limit patch (2Gi→4Gi)' },
    ],
    aggregatedFinding: '3 dev pods sustaining >85% memory utilization for >10 minutes, crossing the alert threshold.',
    rootCauseNarrative: 'A memory leak was introduced in a recent service update causing gradual heap growth. Containers are not yet OOMKilled but will exhaust their allocation within ~90 minutes at current growth rate.',
    remediationProposal: 'Apply memory limit patch (2Gi → 4Gi) and redeploy affected pods with the corrected configuration.',
    riskAssessment: 'Low — dev environment, no user-facing impact.',
    estimatedRecovery: '~30s',
    confidence: 78,
  },
  ap2: {
    steps: [
      { id: 's1', time: '10:55:03', status: 'done',   icon: 'exclamation', title: 'PipelineRunFailed block detected on 2 clusters', detail: 'All GitOps-triggered pipeline runs blocked' },
      { id: 's2', time: '10:55:14', status: 'done',   icon: 'database',    title: 'Fetched EventListener admission webhook logs', detail: 'TLS handshake failure — certificate CN mismatch on renewal' },
      { id: 's3', time: '10:55:26', status: 'done',   icon: 'network',     title: 'Validated ACME DNS-01 challenge reachability', detail: 'Issuer reachable · stale TLS secret confirmed as root cause' },
      { id: 's4', time: '10:55:38', status: 'done',   icon: 'check',       title: 'TLS rotation plan approved', detail: 'EventListener secret rotation + webhook re-registration' },
      { id: 's5',                   status: 'active', icon: 'search',      title: 'Rotating EventListener TLS secret', detail: 'Re-registering webhook endpoints on both clusters' },
    ],
    aggregatedFinding: 'Tekton pipeline webhook blocked on 2 clusters due to EventListener TLS certificate failure.',
    rootCauseNarrative: 'A stale TLS certificate on the Tekton Triggers EventListener caused webhook signature validation failures, blocking all GitOps-triggered pipeline runs.',
    remediationProposal: 'Rotate EventListener TLS secret and force webhook endpoint re-registration on both clusters.',
    riskAssessment: 'Low — development pipeline only, no production workload impact.',
    estimatedRecovery: '~1m',
    confidence: 75,
  },
  ap3: {
    steps: [
      { id: 's1', time: '06:30:02', status: 'done',    icon: 'exclamation', title: 'CertificateExpirationWarning flagged by Kube-Apt-Controller', detail: 'IAM client cert expiry in <72 hours' },
      { id: 's2', time: '06:30:14', status: 'done',    icon: 'database',    title: 'Audited cert-manager rotation job history', detail: 'Auto-rotation script failed silently 30 days ago' },
      { id: 's3', time: '06:30:28', status: 'done',    icon: 'search',      title: 'Identified missing IAM role binding as root cause', detail: 'Automation account lost delete-certs permission after RBAC audit' },
      { id: 's4',                   status: 'pending', icon: 'check',       title: 'Awaiting authorized approval for emergency cert rotation' },
    ],
    aggregatedFinding: 'An IAM client certificate expires in <72 hours. Service account authentications will fail upon expiry.',
    rootCauseNarrative: 'The certificate rotation automation script failed silently 30 days ago due to a missing IAM role binding, preventing auto-renewal. The warning only surfaced today as the certificate reached its expiry threshold.',
    remediationProposal: 'Re-bind the IAM automation role and execute emergency certificate rotation.',
    riskAssessment: 'Medium — brief authentication interruption expected during the rotation handoff window.',
    estimatedRecovery: '~2m',
    confidence: 71,
  },
  ap4: {
    steps: [
      { id: 's1', time: '15:14:07', status: 'done',   icon: 'exclamation', title: '4 CoreDNSLookupLatencyHigh warnings detected', detail: 'Average lookup time >200ms across 3 clusters' },
      { id: 's2', time: '15:14:21', status: 'done',   icon: 'database',    title: 'Sampled CoreDNS pod memory and cache metrics', detail: 'Cache hit rate dropped from 91% to 63% over last 15 minutes' },
      { id: 's3',                   status: 'active', icon: 'search',      title: 'Correlating cache thrash with recent Corefile change', detail: 'Diffing CoreDNS Corefile edits from last deployment cycle…' },
      { id: 's4',                   status: 'pending', icon: 'check',      title: 'Assemble DNS tuning remediation proposal' },
    ],
    aggregatedFinding: 'Signal correlation complete. 4 CoreDNS latency alerts detected across 3 clusters. Root cause analysis in progress.',
    rootCauseNarrative: 'Initial signals suggest CoreDNS pod memory pressure is causing resolver cache thrash. Full topology correlation is pending — root cause not yet confirmed.',
    remediationProposal: 'Remediation paths pending root cause confirmation.',
    riskAssessment: 'TBD — root cause under active investigation.',
    estimatedRecovery: 'TBD',
    confidence: 58,
  },
  ap5: {
    steps: [
      { id: 's1', time: '05:58:11', status: 'done',  icon: 'exclamation', title: '2 NodeCPUOvercommitted events and 1 KubeNodeNotReady alert', detail: 'Baremetal node in partially-registered Metal3 state' },
      { id: 's2', time: '05:58:24', status: 'done',  icon: 'database',    title: 'Inspected Metal3 BareMetalHost object status', detail: 'Provisioning phase stuck in "inspecting" — stale kubelet lease' },
      { id: 's3', time: '05:58:37', status: 'done',  icon: 'search',      title: 'Attempted node cordon and graceful drain', detail: 'Drain initiated · PodDisruptionBudget checked' },
      { id: 's4', time: '05:59:37', status: 'alert', icon: 'exclamation', title: 'Remediation aborted — drain timeout after 300s', detail: 'Cluster state unchanged. No resources were modified.' },
    ],
    aggregatedFinding: 'CPU overcommitment on a baremetal node detected. Remediation attempt failed during node draining.',
    rootCauseNarrative: 'A Metal3 provisioning anomaly left a baremetal node in a partially-registered state, over-assigning workloads. The remediation script failed during node draining due to a stale kubelet lease.',
    remediationProposal: 'Force-drain node, reset the Metal3 BMH object, and re-provision the node.',
    riskAssessment: 'High — force drain may impact in-flight workloads during the procedure.',
    estimatedRecovery: '~5m',
    confidence: 65,
  },
  ap6: {
    steps: [
      { id: 's1', time: '07:59:03', status: 'done', icon: 'exclamation', title: 'ArgoCD detected LiveStateOutOfSync in staging namespace', detail: 'ConfigMap namespace-config diverged from Git state' },
      { id: 's2', time: '07:59:14', status: 'done', icon: 'database',    title: 'Fetched kubectl apply audit log', detail: 'Direct apply bypass of GitOps workflow by admin at 07:54' },
      { id: 's3', time: '07:59:24', status: 'done', icon: 'search',      title: 'Verified no downstream dependency conflicts', detail: 'Hard sync safe — no dependent resources affected' },
      { id: 's4', time: '07:59:32', status: 'done', icon: 'check',       title: 'ArgoCD hard sync executed successfully', detail: 'Declared state restored · GitOps parity confirmed' },
    ],
    aggregatedFinding: 'ArgoCD detected a single resource drift in the staging namespace configuration.',
    rootCauseNarrative: 'A direct kubectl apply bypassed the GitOps workflow, creating a single resource divergence. Argo CD detected the discrepancy during its 3-minute sync loop and a hard sync restored declared state.',
    remediationProposal: 'Force ArgoCD hard sync on the staging application to restore GitOps-declared state.',
    riskAssessment: 'Low — staging environment, non-destructive sync operation.',
    estimatedRecovery: '~15s',
    confidence: 92,
  },
  ap7: {
    steps: [
      { id: 's1', time: '12:07:18', status: 'done',    icon: 'exclamation', title: '2 IngressControllerMinReplicasNotMet alerts fired', detail: 'Router replicas: 1 of 3 minimum on 2 clusters' },
      { id: 's2', time: '12:07:29', status: 'done',    icon: 'database',    title: 'Pulled HPA scaling event history', detail: 'HPA attempted scale-out but was blocked' },
      { id: 's3', time: '12:07:43', status: 'done',    icon: 'network',     title: 'Inspected PodDisruptionBudget on openshift-ingress', detail: 'maxUnavailable: 0 prevents any pod movement during scale' },
      { id: 's4',                   status: 'pending', icon: 'check',       title: 'Awaiting approval to patch PodDisruptionBudget and scale routers' },
    ],
    aggregatedFinding: 'Ingress controller replica count dropped below the configured minimum on 2 clusters, degrading load balancing resilience.',
    rootCauseNarrative: 'A node eviction event reduced ingress pod count below the minimum without triggering the HPA correctly. Root cause is a misconfigured PodDisruptionBudget blocking HPA-driven scale-out.',
    remediationProposal: 'Patch the PodDisruptionBudget to allow HPA scale-out and immediately scale ingress routers to the minimum replica count.',
    riskAssessment: 'Low — router pods scale rolling with no traffic interruption.',
    estimatedRecovery: '~1m',
    confidence: 79,
  },
  ap8: {
    steps: [
      { id: 's1', time: '09:23:05', status: 'done',    icon: 'exclamation', title: 'ACS flagged hostNetwork: true on production deployment', detail: 'CIS Level 3 violation · node network namespace exposed' },
      { id: 's2', time: '09:23:18', status: 'done',    icon: 'database',    title: 'Inspected deployment spec and admission audit log', detail: 'Misconfigured hostNetwork added in last rollout by dev team' },
      { id: 's3', time: '09:23:32', status: 'done',    icon: 'search',      title: 'Confirmed no legitimate use case for host networking', detail: '3 low-priority ACS alerts corroborated the posture violation' },
      { id: 's4',                   status: 'pending', icon: 'check',       title: 'Awaiting authorized approval to patch deployment and apply admission webhook' },
    ],
    aggregatedFinding: 'ACS detected a host network namespace sharing violation — a CIS benchmark Level 3 non-compliance — on 1 cluster.',
    rootCauseNarrative: 'A new deployment was misconfigured with hostNetwork: true, granting the container direct access to the node network stack. ACS enforcement policy flagged this as a critical security posture violation.',
    remediationProposal: 'Set hostNetwork: false on the offending deployment and apply a network policy admission webhook to prevent recurrence.',
    riskAssessment: 'Medium — policy enforcement will trigger pod restarts on the affected deployment.',
    estimatedRecovery: '~1m',
    confidence: 75,
  },
  ap9: {
    steps: [
      { id: 's1', time: '14:44:07', status: 'done',    icon: 'exclamation', title: '4 PodSandboxCleanedUpFailed log entries on 2 clusters', detail: 'OCI runtime garbage collection backlog accumulating' },
      { id: 's2', time: '14:44:20', status: 'done',    icon: 'database',    title: 'Queried containerd runtime and overlay disk usage', detail: 'Orphaned container overlays: 2.1 GB on affected nodes' },
      { id: 's3', time: '14:44:34', status: 'done',    icon: 'search',      title: 'Identified containerd config drift after last node update', detail: 'sandbox_cleanup_interval misconfigured to 0 — disabling GC' },
      { id: 's4',                   status: 'pending', icon: 'check',       title: 'Awaiting approval to run Kubelet GC cycle and fix containerd config' },
    ],
    aggregatedFinding: '4 pod sandbox cleanup failures logged by Kubelet on 2 clusters, indicating an OCI runtime garbage collection backlog.',
    rootCauseNarrative: 'A containerd runtime configuration change disrupted the sandbox cleanup routine. Orphaned container overlays are accumulating on node disk and will cause disk pressure if unresolved.',
    remediationProposal: 'Execute a graceful Kubelet garbage collection cycle and validate the containerd runtime configuration.',
    riskAssessment: 'Low — housekeeping operation with no workload impact.',
    estimatedRecovery: '~30s',
    confidence: 72,
  },
  ap10: {
    steps: [
      { id: 's1', time: '06:44:02', status: 'done', icon: 'exclamation', title: 'JenkinsQueueSizeHigh threshold breached', detail: 'Build queue: 57 jobs — all 4 executor slots occupied' },
      { id: 's2', time: '06:44:13', status: 'done', icon: 'database',    title: 'Identified stalled job monopolizing all executors', detail: 'integration-test-suite-full running 4.2h (expected: 45m)' },
      { id: 's3', time: '06:44:22', status: 'done', icon: 'search',      title: 'Confirmed stall due to upstream fixture service timeout', detail: 'No watchdog timer configured on long-running test stage' },
      { id: 's4', time: '06:44:31', status: 'done', icon: 'check',       title: 'Stalled job terminated · executor count raised to 8', detail: 'Queue drained to 0 within 4 minutes' },
    ],
    aggregatedFinding: 'Jenkins build queue exceeded 50 jobs, halting CI/CD throughput entirely.',
    rootCauseNarrative: 'A long-running integration test job monopolized all executor slots, starving downstream builds. The agent identified and terminated the stalled job, restoring executor availability.',
    remediationProposal: 'Terminate the stalled job and increase the executor count from 4 to 8 to prevent recurrence.',
    riskAssessment: 'Low — non-critical CI environment with no production dependency.',
    estimatedRecovery: '~2m',
    confidence: 88,
  },
  ap11: {
    steps: [
      { id: 's1', time: '11:37:14', status: 'done',    icon: 'exclamation', title: 'FailedComputeMetricsReplicas event on HPA controller', detail: 'Autoscaling frozen for ~20 minutes' },
      { id: 's2', time: '11:37:26', status: 'done',    icon: 'database',    title: 'Verified custom metrics adapter connectivity', detail: 'Prometheus scrape endpoint unreachable from adapter pod' },
      { id: 's3', time: '11:37:39', status: 'done',    icon: 'network',     title: 'Traced network policy blocking adapter → Prometheus path', detail: 'Namespace isolation policy introduced 22 minutes ago' },
      { id: 's4',                   status: 'pending', icon: 'check',       title: 'Awaiting approval to restart adapter and update network policy' },
    ],
    aggregatedFinding: 'HPA controller failing to compute target replicas, effectively disabling autoscaling.',
    rootCauseNarrative: 'The custom metrics adapter lost connectivity to its Prometheus scrape endpoint, leaving the HPA unable to evaluate scale triggers. Autoscaling has been frozen for approximately 20 minutes.',
    remediationProposal: 'Restart the custom metrics adapter and validate Prometheus scrape endpoint connectivity.',
    riskAssessment: 'Low — brief adapter restart has no workload impact.',
    estimatedRecovery: '~45s',
    confidence: 76,
  },
  ap12: {
    steps: [
      { id: 's1', time: '08:29:11', status: 'done',    icon: 'exclamation', title: '5 sustained ErrImagePullBackOff alerts across 4 clusters', detail: '~30% of container image pulls failing intermittently' },
      { id: 's2', time: '08:29:24', status: 'done',    icon: 'database',    title: 'Queried cluster DNS resolution for registry FQDN', detail: 'Stale A-record pointing to decommissioned registry mirror' },
      { id: 's3', time: '08:29:37', status: 'done',    icon: 'network',     title: 'Confirmed DNS propagation lag across 4 cluster resolvers', detail: 'New record not yet reflected in cluster-local CoreDNS caches' },
      { id: 's4',                   status: 'pending', icon: 'check',       title: 'Awaiting approval to flush DNS caches and update mirror config' },
    ],
    aggregatedFinding: '5 sustained ErrImagePullBackOff alerts across 4 clusters indicating container registry connectivity degradation.',
    rootCauseNarrative: 'A registry DNS record update propagated incorrectly to cluster resolvers, causing intermittent image pull failures. Approximately 30% of pull attempts are failing under the current configuration.',
    remediationProposal: 'Force DNS cache flush on affected nodes and update the registry mirror configuration to bypass the stale record.',
    riskAssessment: 'Low — rolling DNS update with no workload eviction required.',
    estimatedRecovery: '~2m',
    confidence: 72,
  },
  ap13: {
    steps: [
      { id: 's1', time: '16:02:08', status: 'done',    icon: 'exclamation', title: 'CSI volume throttling log entry detected', detail: 'Read IOPS exceeded provisioned tier ceiling on 1 cluster' },
      { id: 's2', time: '16:02:22', status: 'done',    icon: 'database',    title: 'Queried cloud storage IOPS metrics over 1-hour window', detail: 'Actual read IOPS: 3,200/s · provisioned limit: 2,000/s' },
      { id: 's3',                   status: 'active',  icon: 'search',      title: 'Correlating IOPS spike with workload event log', detail: 'Checking for batch job or backup process causing elevated reads…' },
      { id: 's4',                   status: 'pending', icon: 'check',       title: 'Assemble storage tier upgrade or rate-limit proposal' },
    ],
    aggregatedFinding: 'Signal correlation complete. Storage CSI throttling and PV resizing stall detected. Root cause analysis in progress.',
    rootCauseNarrative: 'Initial signals suggest read IOPS are exceeding the provisioned cloud storage tier limits. Full storage topology analysis is pending — root cause not yet confirmed.',
    remediationProposal: 'Remediation paths pending root cause confirmation.',
    riskAssessment: 'TBD — storage configuration change scope under investigation.',
    estimatedRecovery: 'TBD',
    confidence: 58,
  },
  ap14: {
    steps: [
      { id: 's1', time: '22:28:04', status: 'done', icon: 'exclamation', title: '3 NodeClockSkewDetected alerts fired', detail: 'Clock skew >10s on 3 nodes · cert validation errors logged' },
      { id: 's2', time: '22:28:16', status: 'done', icon: 'network',     title: 'Traced NTP sync failure to firewall rule change', detail: 'Upstream corporate NTP pool unreachable since 22:15' },
      { id: 's3', time: '22:28:30', status: 'done', icon: 'search',      title: 'Validated fallback NTP pool availability', detail: 'pool.ntp.org reachable · firewall exemption path identified' },
      { id: 's4', time: '22:28:42', status: 'done', icon: 'check',       title: 'chronyd reconfigured and clock sync restored on all 3 nodes', detail: 'Clock skew below 1ms · cert validation errors cleared' },
    ],
    aggregatedFinding: '3 nodes across clusters reported NTP clock skew >10 seconds, flagging sync failures.',
    rootCauseNarrative: 'An upstream NTP server became unreachable due to a firewall rule change, leaving 3 nodes to drift independently. Clock skew exceeded Kubernetes tolerances, triggering certificate validation errors on some API calls.',
    remediationProposal: 'Reconfigure chronyd to use the corporate NTP pool and restart the clock synchronization service.',
    riskAssessment: 'Low — NTP reconfiguration has no workload impact.',
    estimatedRecovery: '~30s',
    confidence: 94,
  },
  ap15: {
    steps: [
      { id: 's1', time: '07:15:03', status: 'done',    icon: 'exclamation', title: 'PruneImageRegistryManifestsFailed trace detected', detail: 'Scheduled pruning job failed for 2 consecutive runs' },
      { id: 's2', time: '07:15:17', status: 'done',    icon: 'database',    title: 'Audited registry pruner service account permissions', detail: 'delete-image-manifests permission revoked in RBAC patch v3.12.1' },
      { id: 's3', time: '07:15:29', status: 'done',    icon: 'search',      title: 'Confirmed no active workloads reference prunable tags', detail: 'Safe to prune 847 MB of unreferenced manifest layers' },
      { id: 's4',                   status: 'pending', icon: 'check',       title: 'Awaiting approval to restore RBAC permissions and trigger manual prune' },
    ],
    aggregatedFinding: 'ImageRegistry pruning job failed, leaving orphaned image stream tags consuming registry storage.',
    rootCauseNarrative: 'A permissions regression in a recent RBAC update revoked the registry pruner service account access to delete manifests, causing the scheduled pruning job to fail silently.',
    remediationProposal: 'Restore RBAC permissions for the registry pruner service account and trigger a manual prune run.',
    riskAssessment: 'Low — registry pruning is non-destructive (removes unreferenced tags only).',
    estimatedRecovery: '~1m',
    confidence: 80,
  },
};

// ─── Remediation options data ────────────────────────────────────────────────

type RemediationRisk = 'low' | 'medium' | 'high';

interface RemediationOption {
  id: string;
  title: string;
  description: string;
  risk: RemediationRisk;
  reversible: boolean;
  model: 'smart' | 'fast';
  rawCommands: string;
}

const RISK_COLOR: Record<RemediationRisk, 'green' | 'orange' | 'red'> = {
  low: 'green', medium: 'orange', high: 'red',
};
const RISK_LABEL: Record<RemediationRisk, string> = {
  low: 'Low risk', medium: 'Medium risk', high: 'High risk',
};

const PLAN_REMEDIATION_OPTIONS: Record<string, RemediationOption[]> = {
  tp1: [
    { id: 'tp1-o1', title: 'Automated fleet rollback via GitOps controller', description: 'Revert the ApplicationSet to revision r4891 and trigger a fleet-wide hard sync via the ArgoCD GitOps controller.', risk: 'low', reversible: true, model: 'smart', rawCommands: 'argocd app sync cluster-ingress-controller --prune --force' },
    { id: 'tp1-o2', title: 'Manual cluster-by-cluster ArgoCD sync override', description: 'Force-sync each affected cluster individually via the ArgoCD CLI, bypassing the ApplicationSet controller.', risk: 'medium', reversible: true, model: 'fast', rawCommands: 'argocd app sync cluster-ingress-controller --revision HEAD~1 --local' },
    { id: 'tp1-o3', title: 'Full ApplicationSet deletion and recreation', description: 'Delete the faulty ApplicationSet entirely and redeploy from the canonical Git source.', risk: 'high', reversible: false, model: 'fast', rawCommands: 'argocd app delete cluster-ingress-controller --cascade && git checkout HEAD~1 -- config/applicationset.yaml && argocd app create -f config/applicationset.yaml' },
  ],
  tp2: [],
  tp3: [
    { id: 'tp3-o1', title: 'Memory limit patch with rolling HPA scale-out', description: 'Apply 2Gi → 4Gi memory limit patch via rolling restart and scale HPA to 3 replicas to absorb the increased footprint.', risk: 'low', reversible: true, model: 'smart', rawCommands: 'oc set resources deployment/payment-gateway --limits=memory=2Gi --requests=memory=1Gi -n payment-gateway' },
    { id: 'tp3-o2', title: 'Force pod eviction and reschedule', description: 'Force-evict all affected pods to trigger rescheduling without changing the memory limit configuration — temporary relief only.', risk: 'medium', reversible: true, model: 'fast', rawCommands: 'oc delete pod -l app=payment-gateway -n payment-gateway --force --grace-period=0' },
  ],
  tp4: [
    { id: 'tp4-o1', title: 'Automated OSD pool expansion + log rotation enforcement', description: 'Expand the Ceph OSD pool by 20% via rook-ceph toolbox and enable automated log rotation on the 3 affected StatefulSets.', risk: 'medium', reversible: true, model: 'smart', rawCommands: "oc patch pvc/ceph-storage-core-pvc -p '{\"spec\":{\"resources\":{\"requests\":{\"storage\":\"500Gi\"}}}}'" },
    { id: 'tp4-o2', title: 'Emergency log data pruning', description: 'Delete the oldest 30% of log data from the overloaded volumes to immediately free storage capacity.', risk: 'high', reversible: false, model: 'fast', rawCommands: 'oc rsh -n rook-ceph rook-ceph-tools -- bash -c "find /var/log/containers -mtime +30 -delete && ceph df"' },
  ],
  tp5: [
    { id: 'tp5-o1', title: 'Rolling etcd defragmentation across all control plane members', description: 'Defragment all 3 etcd members sequentially with automated health verification between each step.', risk: 'low', reversible: true, model: 'smart', rawCommands: 'oc rsh -n openshift-etcd etcd-member-master-1 etcdctl defrag' },
    { id: 'tp5-o2', title: 'etcd compaction-only (no defragmentation)', description: 'Compact etcd revision history without a full defragmentation pass — faster but yields partial improvement only.', risk: 'low', reversible: true, model: 'fast', rawCommands: 'oc rsh -n openshift-etcd etcd-member-master-1 etcdctl compact $(oc rsh -n openshift-etcd etcd-member-master-1 etcdctl endpoint status --write-out=json | jq \'.[0].Status.header.revision\')' },
  ],
  ap1: [
    { id: 'ap1-o1', title: 'Memory limit patch + pod redeploy with rolling strategy', description: 'Apply the 2Gi → 4Gi limit patch and redeploy pods using a rolling update strategy to resolve the heap leak.', risk: 'low', reversible: true, model: 'smart', rawCommands: 'oc rollout restart deployment/dev-analytics -n sandbox' },
    { id: 'ap1-o2', title: 'Force pod restart (temporary heap flush)', description: 'Force-restart affected pods to reclaim memory from the leaked heap — buys time without addressing the underlying allocator regression.', risk: 'medium', reversible: true, model: 'fast', rawCommands: 'oc delete pod -l app=dev-analytics -n sandbox --force --grace-period=0' },
  ],
  ap2: [
    { id: 'ap2-o1', title: 'TLS secret rotation + webhook endpoint re-registration', description: 'Rotate the EventListener TLS secret and force webhook endpoint re-registration on both clusters.', risk: 'low', reversible: true, model: 'smart', rawCommands: 'oc apply -f ./pipelines/repaired-webhook-admission.yaml' },
    { id: 'ap2-o2', title: 'Delete and recreate EventListener', description: 'Delete the EventListener resource entirely and recreate it to force full TLS re-initialization.', risk: 'medium', reversible: true, model: 'fast', rawCommands: 'oc delete eventlistener/pipeline-webhook -n tekton-pipelines && oc apply -f ./pipelines/eventlistener.yaml' },
  ],
  ap3: [
    { id: 'ap3-o1', title: 'Restore IAM role binding + ACME-based cert rotation', description: 'Re-bind the automation IAM role and trigger an ACME DNS-01 challenge to issue a renewed certificate.', risk: 'medium', reversible: true, model: 'smart', rawCommands: 'oc delete secret/expired-iam-token-certs -n openshift-auth' },
    { id: 'ap3-o2', title: 'Manual emergency cert renewal via internal PKI', description: 'Directly issue a replacement certificate through the internal PKI without restoring the automation role.', risk: 'high', reversible: true, model: 'fast', rawCommands: 'oc create secret tls iam-token-certs --cert=./certs/tls.crt --key=./certs/tls.key -n openshift-auth --dry-run=client -o yaml | oc replace -f -' },
  ],
  ap4: [],
  ap5: [
    { id: 'ap5-o1', title: 'Force drain + Metal3 BMH reset + node re-provision', description: 'Force-drain the stuck node, reset the BareMetalHost object, and trigger full Metal3 re-provisioning.', risk: 'high', reversible: false, model: 'smart', rawCommands: 'oc adm node-merge-evacuate master-node-3 --target-tier=compute' },
    { id: 'ap5-o2', title: 'Node isolation via taint + workload migration', description: 'Taint the node unschedulable and migrate its workloads to healthy nodes without triggering a full re-provision.', risk: 'medium', reversible: true, model: 'fast', rawCommands: 'oc adm taint node master-node-3 node.kubernetes.io/unschedulable:NoSchedule && oc adm drain master-node-3 --ignore-daemonsets --delete-emptydir-data' },
  ],
  ap6: [
    { id: 'ap6-o1', title: 'ArgoCD hard sync to Git-declared state', description: 'Force a hard sync on the staging application to restore the namespace to its GitOps-declared configuration.', risk: 'low', reversible: true, model: 'fast', rawCommands: 'argocd app sync staging-config-map --refresh' },
  ],
  ap7: [
    { id: 'ap7-o1', title: 'Patch PodDisruptionBudget + HPA-driven scale-out', description: 'Set maxUnavailable: 1 on the ingress PDB and allow the HPA to scale routers to the 3-replica minimum.', risk: 'low', reversible: true, model: 'smart', rawCommands: 'oc scale ingresscontroller/default --replicas=2 -n openshift-ingress-operator' },
    { id: 'ap7-o2', title: 'Temporary PDB suspension + manual ingress restart', description: 'Temporarily suspend the PodDisruptionBudget and manually restart ingress pods to restore the minimum replica count.', risk: 'medium', reversible: true, model: 'fast', rawCommands: 'oc rollout restart deployment/router-default -n openshift-ingress' },
  ],
  ap8: [
    { id: 'ap8-o1', title: 'Set hostNetwork: false + mutating admission webhook', description: 'Patch the deployment to remove host network access and install a MutatingAdmissionWebhook to prevent future violations.', risk: 'medium', reversible: true, model: 'smart', rawCommands: "oc patch securitycontextconstraints restricted --type='json' -p='[{\"op\": \"replace\", \"path\": \"/allowHostNetwork\", \"value\": false}]'" },
    { id: 'ap8-o2', title: 'Force-delete non-compliant deployment', description: 'Immediately delete the offending deployment to eliminate the compliance violation — requires manual redeployment with a compliant spec.', risk: 'high', reversible: false, model: 'fast', rawCommands: "oc delete deployment -n production -l 'security.redhat.com/non-compliant=true'" },
  ],
  ap9: [
    { id: 'ap9-o1', title: 'Kubelet GC cycle + containerd sandbox_cleanup_interval fix', description: 'Trigger a graceful Kubelet garbage collection pass and patch the containerd config to re-enable sandbox cleanup.', risk: 'low', reversible: true, model: 'smart', rawCommands: 'oc adm prune deployments --keep-complete=5 --keep-failed=1 --keep-younger-than=60m' },
  ],
  ap10: [
    { id: 'ap10-o1', title: 'Terminate stalled job + increase executor count to 8', description: 'Terminate the monopolizing integration test job and scale Jenkins executors from 4 to 8 to prevent recurrence.', risk: 'low', reversible: true, model: 'fast', rawCommands: 'oc set env deployment/jenkins-leader JENKINS_MAX_EXECUTORS=16 -n continuous-integration' },
  ],
  ap11: [
    { id: 'ap11-o1', title: 'Restart metrics adapter + update egress network policy', description: 'Restart the custom metrics adapter pod and add an egress rule permitting adapter → Prometheus communication.', risk: 'low', reversible: true, model: 'smart', rawCommands: "oc patch hpa/api-scaler -p '{\"spec\":{\"maxReplicas\":50}}' -n production" },
    { id: 'ap11-o2', title: 'Fall back to CPU-only HPA scaling', description: 'Remove the custom metrics configuration and revert the HPA to native CPU utilization-based scaling.', risk: 'medium', reversible: true, model: 'fast', rawCommands: 'oc patch hpa/api-scaler -p \'{"spec":{"metrics":[{"type":"Resource","resource":{"name":"cpu","target":{"type":"Utilization","averageUtilization":70}}}]}}\' -n production' },
  ],
  ap12: [
    { id: 'ap12-o1', title: 'CoreDNS cache flush + registry mirror config update', description: 'Flush CoreDNS caches on affected nodes and update the registry mirror to the corrected endpoint.', risk: 'low', reversible: true, model: 'smart', rawCommands: 'oc secrets link deployer registry-pull-secret --for=pull -n core-system' },
    { id: 'ap12-o2', title: 'Configure pods to pull via registry node IP', description: 'Patch pod specs to reference the registry by direct node IP, bypassing DNS resolution until the record propagates.', risk: 'medium', reversible: true, model: 'fast', rawCommands: "oc patch configmap/registry-env-config -n openshift-image-registry -p '{\"data\":{\"REGISTRY_OPENSHIFT_SERVER_ADDR\":\"172.30.1.1:5000\"}}'" },
  ],
  ap13: [],
  ap14: [
    { id: 'ap14-o1', title: 'Reconfigure chronyd to corporate NTP pool + restart service', description: 'Update chronyd to use the corporate NTP pool and restart the time synchronization service on all 3 nodes.', risk: 'low', reversible: true, model: 'fast', rawCommands: 'oc rsh -n openshift-node chrony-sync-daemon systemctl restart chronyd' },
  ],
  ap15: [
    { id: 'ap15-o1', title: 'Restore pruner RBAC permissions + manual prune run', description: 'Restore the delete-image-manifests permission to the registry pruner service account and trigger a manual prune.', risk: 'low', reversible: true, model: 'smart', rawCommands: 'oc adm prune images --keep-tag-revisions=3 --prune-over-size-limit=true' },
    { id: 'ap15-o2', title: 'Direct manifest deletion by cluster-admin', description: 'Manually delete the 847 MB of unreferenced manifests using cluster-admin credentials, bypassing the pruner workflow.', risk: 'medium', reversible: false, model: 'fast', rawCommands: "oc delete istag -n production $(oc get istag -n production -o jsonpath='{.items[?(@.image.metadata.creationTimestamp<\"2026-01-01\")].metadata.name}')" },
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

const AI_TOOLTIP =
  'This metric is synthesized by the autonomous AI SRE agent based on live cluster states and historical patterns.';

const AiSparkle: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <Tooltip content={AI_TOOLTIP} position="top">
    <span
      tabIndex={0}
      role="img"
      aria-label="AI-synthesized metric"
      style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle', cursor: 'help', flexShrink: 0 }}
    >
      <img src={AI_EXPERIENCE_ICON_DATA_URL} alt="" aria-hidden="true" width={size} height={size} style={{ display: 'block' }} />
    </span>
  </Tooltip>
);

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

// Standalone AI icon (no tooltip wrapper) used inside drawer sections
const AiIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <img src={AI_EXPERIENCE_ICON_DATA_URL} alt="" aria-hidden="true" width={size} height={size} style={{ display: 'block', flexShrink: 0 }} />
);

// ─── Status label ─────────────────────────────────────────────────────────────

type LabelColor = 'blue' | 'teal' | 'orange' | 'green' | 'red';

const STATUS_LABEL_COLOR: Record<PlanStatus, LabelColor> = {
  'Investigating':    'blue',
  'Waiting Approval': 'orange',
  'Remediating':      'teal',
  'Completed':        'green',
  'Failed':           'red',
};

export const StatusLabel: React.FC<{ status: PlanStatus }> = ({ status }) => (
  <Label color={STATUS_LABEL_COLOR[status]} variant="outline" isCompact style={{ whiteSpace: 'nowrap' }}>
    {status}
  </Label>
);

// ─── Table column header helpers ──────────────────────────────────────────────

/** OpenShift console–style resource label for Plan resources. */
export const PlanResourceBadge: React.FC = () => (
  <span
    aria-hidden
    style={{
      backgroundColor: '#2b9af3',
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
    P
  </span>
);

const FILTER_SECTION_TITLE_STYLE: React.CSSProperties = {
  padding: 'var(--pf-t--global--spacer--sm) var(--pf-t--global--spacer--md) var(--pf-t--global--spacer--xs)',
  fontSize: 'var(--pf-t--global--font--size--body--sm)',
  fontWeight: 600,
  color: 'var(--pf-t--global--text--color--subtle)',
};

// ─── Scope cell (cluster / namespace) with multi-target tooltip ───────────────

const PlanScopeCell: React.FC<{
  scope?: string;
  scopeColumnLabel: 'Cluster' | 'Namespace';
  scopeTargets: string[];
}> = ({ scope, scopeColumnLabel, scopeTargets }) => {
  const label = scope ?? '—';
  const showTooltip = scopeColumnLabel === 'Cluster' && scopeTargets.length > 1;

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

// ─── Core stateless table renderer ───────────────────────────────────────────

interface PlansTableCoreProps {
  rows: PlanRow[];
  ariaLabel: string;
  scopeColumnLabel: 'Cluster' | 'Namespace';
  onReviewPlan: (plan: PlanRow) => void;
}

const PlansTableCore: React.FC<PlansTableCoreProps> = ({
  rows,
  ariaLabel,
  scopeColumnLabel,
  onReviewPlan,
}) => (
  <Table aria-label={ariaLabel} style={{ tableLayout: 'fixed', width: '100%' }}>
    <Thead>
      <Tr>
        <Th style={{ width: '24%' }}>Name</Th>
        <Th style={{ width: '30%' }}>Plan summary</Th>
        <Th style={{ width: '12%' }}>Status</Th>
        <Th style={{ width: '14%' }}>{scopeColumnLabel}</Th>
        <Th style={{ width: '20%' }}>Created</Th>
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
                  onClick={() => onReviewPlan(row)}
                  style={{ fontWeight: 400, textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word' }}
                >
                  {row.name ?? row.id}
                </Button>
              </FlexItem>
            </Flex>
          </Td>

          <Td dataLabel="Plan summary" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }} flexWrap={{ default: 'nowrap' }}>
              <FlexItem><AiSparkle /></FlexItem>
              <FlexItem style={{ flex: '1 1 auto', minWidth: 0 }}>{row.synopsis}</FlexItem>
            </Flex>
          </Td>

          <Td dataLabel="Status">
            <StatusLabel status={row.status} />
          </Td>

          <Td dataLabel={scopeColumnLabel}>
            <PlanScopeCell
              scope={row.scope}
              scopeColumnLabel={scopeColumnLabel}
              scopeTargets={scopeColumnLabel === 'Cluster' ? row.drawerTargets : []}
            />
          </Td>

          <Td dataLabel="Created">
            {row.createdAt ? (
              <time dateTime={row.createdAt}>{formatPlanCreatedAt(row.createdAt)}</time>
            ) : (
              '—'
            )}
          </Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
);

// ─── Plans table (pagination + filters + expand state) ───────────────────────

const DEFAULT_PER_PAGE = 10;

// Filter option lists
const STATUS_FILTER_OPTIONS: PlanStatus[] = [
  'Investigating',
  'Waiting Approval',
  'Remediating',
  'Completed',
  'Failed',
];

const DOMAIN_FILTER_OPTIONS = [
  'GitOps Core',
  'Ingress Routing',
  'Storage (CSI)',
  'Compute/Nodes',
  'Security (ACS)',
] as const;
type DomainFilter = (typeof DOMAIN_FILTER_OPTIONS)[number];

// Maps each UI domain category to substrings found in triggerDomains data field
const DOMAIN_KEYWORDS: Record<DomainFilter, string[]> = {
  'GitOps Core':      ['gitops', 'argocd'],
  'Ingress Routing':  ['network', 'ingress', 'routing'],
  'Storage (CSI)':    ['storage', 'csi', 'pv', 'ceph'],
  'Compute/Nodes':    ['kubelet', 'metal3', 'node', 'etcd', 'compute', 'baremetal'],
  'Security (ACS)':   ['acs', 'auth', 'security'],
};

const rowMatchesDomain = (row: PlanRow, domains: string[]): boolean => {
  if (domains.length === 0) return true;
  const td = row.triggerDomains.toLowerCase();
  return domains.some((d) =>
    (DOMAIN_KEYWORDS[d as DomainFilter] ?? []).some((kw) => td.includes(kw)),
  );
};

interface PlansTableProps {
  onReviewPlan: (plan: PlanRow) => void;
  rows: PlanRow[];
  isSingleCluster: boolean;
}

const PlansTable: React.FC<PlansTableProps> = ({ onReviewPlan, rows, isSingleCluster }) => {
  // ── Filter state — intentionally decoupled from perspective; persists on switch ──
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [domainFilters, setDomainFilters] = useState<string[]>([]);
  const [rbacOnly, setRbacOnly] = useState(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  // ── Pagination state ──
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);

  // ── Derived rows after filters ──
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (statusFilters.length > 0 && !statusFilters.includes(row.status)) return false;
      if (!rowMatchesDomain(row, domainFilters)) return false;
      if (rbacOnly && row.isUnauthorized) return false;
      return true;
    });
  }, [rows, statusFilters, domainFilters, rbacOnly]);

  // Reset to page 1 whenever effective row count changes (filter or perspective)
  useEffect(() => {
    setPage(1);
  }, [filteredRows.length]);

  const clearAllFilters = useCallback(() => {
    setStatusFilters([]);
    setDomainFilters([]);
    setRbacOnly(false);
  }, []);

  const toggleStatusFilter = useCallback((val: string) => {
    setStatusFilters((prev) =>
      prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val],
    );
  }, []);

  const toggleDomainFilter = useCallback((val: string) => {
    setDomainFilters((prev) =>
      prev.includes(val) ? prev.filter((d) => d !== val) : [...prev, val],
    );
  }, []);

  const activeFilterCount = statusFilters.length + domainFilters.length;
  const hasActiveFilters = activeFilterCount > 0 || rbacOnly;

  const handleFilterSelect = useCallback(
    (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
      if (typeof value !== 'string') {
        return;
      }
      if (STATUS_FILTER_OPTIONS.includes(value as PlanStatus)) {
        toggleStatusFilter(value);
        return;
      }
      if ((DOMAIN_FILTER_OPTIONS as readonly string[]).includes(value)) {
        toggleDomainFilter(value);
      }
    },
    [toggleStatusFilter, toggleDomainFilter],
  );

  // ── Pagination handlers ──
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
      {/* ── Toolbar: filter dropdowns + "Executable" checkbox + pagination ── */}
      {/* Pagination lives inside the toolbar so they sit on the same row.   */}
      {/* ToolbarFilter is intentionally NOT used here — its auto-expanding   */}
      {/* chip row causes the table to jump. Chips are rendered below        */}
      {/* in a fixed-minHeight row so the layout never shifts.               */}
      {/* Filter + pagination row — plain Flex for guaranteed single-line layout */}
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
        flexWrap={{ default: 'nowrap' }}
        style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }}
      >
        {/* Left: filter dropdowns + checkbox */}
        <FlexItem>
          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} flexWrap={{ default: 'nowrap' }}>
            <FlexItem>
              <Select
                aria-label="Filter plans"
                role="menu"
                isOpen={filterMenuOpen}
                onSelect={handleFilterSelect}
                onOpenChange={setFilterMenuOpen}
                toggle={(ref: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={ref}
                    onClick={() => setFilterMenuOpen((o) => !o)}
                    isExpanded={filterMenuOpen}
                    badge={activeFilterCount > 0 ? activeFilterCount : undefined}
                  >
                    Filter
                  </MenuToggle>
                )}
              >
                <SelectList>
                  <div style={FILTER_SECTION_TITLE_STYLE}>Status</div>
                  {STATUS_FILTER_OPTIONS.map((s) => (
                    <SelectOption key={s} hasCheckbox value={s} isSelected={statusFilters.includes(s)}>
                      {s}
                    </SelectOption>
                  ))}
                  <Divider component="li" />
                  <div style={FILTER_SECTION_TITLE_STYLE}>Domain</div>
                  {DOMAIN_FILTER_OPTIONS.map((d) => (
                    <SelectOption key={d} hasCheckbox value={d} isSelected={domainFilters.includes(d)}>
                      {d}
                    </SelectOption>
                  ))}
                </SelectList>
              </Select>
            </FlexItem>

            <FlexItem style={{ marginInlineStart: 'var(--pf-t--global--spacer--sm)' }}>
              <Checkbox
                id="plans-rbac-only"
                label="Show Executable Fixes Only"
                isChecked={rbacOnly}
                onChange={(_e, checked) => setRbacOnly(checked)}
              />
            </FlexItem>
          </Flex>
        </FlexItem>

        {/* Right: pagination */}
        <FlexItem>
          <Pagination isCompact {...paginationProps} style={{ margin: 0 }} />
        </FlexItem>
      </Flex>

      {/* ── Active filter chips ─────────────────────────────────────────────── */}
      {/* Fixed minHeight so the table never jumps when chips appear/disappear */}
      <div
        style={{
          minHeight: 36,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 'var(--pf-t--global--spacer--sm)',
          padding: hasActiveFilters
            ? 'var(--pf-t--global--spacer--xs) 0'
            : undefined,
        }}
      >
        {statusFilters.length > 0 && (
          <LabelGroup categoryName="Status" isClosable onClick={() => setStatusFilters([])}>
            {statusFilters.map((s) => (
              <Label key={s} isCompact onClose={() => toggleStatusFilter(s)}>
                {s}
              </Label>
            ))}
          </LabelGroup>
        )}
        {domainFilters.length > 0 && (
          <LabelGroup categoryName="Domain" isClosable onClick={() => setDomainFilters([])}>
            {domainFilters.map((d) => (
              <Label key={d} isCompact onClose={() => toggleDomainFilter(d)}>
                {d}
              </Label>
            ))}
          </LabelGroup>
        )}
        {rbacOnly && (
          <LabelGroup>
            <Label isCompact onClose={() => setRbacOnly(false)}>
              Executable fixes only
            </Label>
          </LabelGroup>
        )}
        {hasActiveFilters && (
          <Button variant="link" isInline onClick={clearAllFilters}
            style={{ fontSize: 'var(--pf-t--global--font--size--sm)' }}>
            Clear all
          </Button>
        )}
      </div>

      {/* ── Table or Empty State ───────────────────────────────────────────── */}
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
          {hasActiveFilters && (
            <EmptyStateFooter>
              <EmptyStateActions>
                <Button variant="link" onClick={clearAllFilters}>
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

// ─── Drawer: AI insight helper ────────────────────────────────────────────────

const generateAiInsight = (plan: PlanRow): string =>
  `Automated analysis correlated ${plan.consolidationScope} from the ${plan.triggerDomains} domain, ` +
  `with a blast radius spanning ${plan.blastRadius}. The agent has isolated the root cause and assembled ` +
  `a verified remediation strategy designed to restore system health with minimal operational risk.`;

// ─── Drawer: Remediation option card ─────────────────────────────────────────

// Display names keyed by option index (0-based).
const OPTION_TYPE_NAMES: Record<number, string> = {
  0: 'Primary Automated Fix',
  1: 'Manual Fallback Script',
  2: 'Emergency Override',
};

const RemediationOptionCard: React.FC<{
  option: RemediationOption;
  index: number;
  plan: PlanRow;
  executionMessage?: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}> = ({ option, index, plan, executionMessage, isSelected, onSelect }) => {
  const isFirst = index === 0;
  const { status, isUnauthorized, drawerTargets } = plan;
  const isInvestigating = status === 'Investigating';
  const isTerminal = status === 'Completed' || status === 'Failed';
  const isRemediating = status === 'Remediating';
  const [showCommands, setShowCommands] = useState(false);
  const [selectedTargets, setSelectedTargets] = useState<Set<string>>(new Set(drawerTargets));
  type SandboxState = 'pending' | 'running' | 'passed' | 'bypassed';
  const [sandboxState, setSandboxState] = useState<SandboxState>('pending');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isExecuted, setIsExecuted] = useState(false);
  const [isPostMortemOpen, setIsPostMortemOpen] = useState(false);
  const cardRootRef = React.useRef<HTMLDivElement>(null);

  // Reset inner states when the card is collapsed / deselected.
  useEffect(() => {
    if (!isSelected) {
      setShowCommands(false);
      setIsExecuting(false);
      setSandboxState('pending');
    }
  }, [isSelected]);

  useEffect(() => {
    if (!isSelected) {
      return;
    }
    setTimeout(() => {
      scrollRemediationSectionIntoViewIfNeeded(cardRootRef.current);
    }, 50);
  }, [isSelected]);

  // Remediating: non-first options are always hidden.
  if (isRemediating && !isFirst) return null;

  const typeName = OPTION_TYPE_NAMES[index] ?? `Option ${index + 1}`;
  const isInteractive = !isRemediating;
  const cardId = `remediation-option-${option.id}`;

  const selectedCount = selectedTargets.size;

  const headerContent = (
    <Flex
      alignItems={{ default: 'alignItemsCenter' }}
      gap={{ default: 'gapSm' }}
      flexWrap={{ default: 'wrap' }}
      id={`${cardId}-title`}
    >
      <span style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap' }}>
        Option {index + 1}: {typeName}
      </span>
      <Flex gap={{ default: 'gapXs' }} flexWrap={{ default: 'wrap' }}>
        {isFirst ? (
          <Label color="blue" isCompact>AI Recommended</Label>
        ) : (
          <Label color="grey" isCompact>Manual Fallback</Label>
        )}
        {isTerminal && isFirst && (
          <Label color={status === 'Completed' ? 'green' : 'red'} isCompact variant="outline">
            {status === 'Completed' ? 'Executed' : 'Failed'}
          </Label>
        )}
        <Label color={RISK_COLOR[option.risk]} variant="outline" isCompact>
          {RISK_LABEL[option.risk]}
        </Label>
        <Label color={option.reversible ? 'green' : 'orange'} variant="outline" isCompact>
          {option.reversible ? '1-Click Rollback' : 'Non-reversible'}
        </Label>
        <Label
          color={isUnauthorized ? 'red' : 'green'}
          variant="outline"
          isCompact
          icon={isUnauthorized ? <LockIcon /> : <LockOpenIcon />}
        >
          {isUnauthorized ? 'RBAC: Unauthorized' : 'RBAC: Authorized'}
        </Label>
      </Flex>
    </Flex>
  );

  const handleExecute = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setIsExecuted(true);
      setIsPostMortemOpen(true);
    }, 2000);
  };

  const renderActionButton = () => {
    if (isInvestigating || isTerminal) return null;
    if (isRemediating) {
      return (
        <Button
          variant="primary"
          isDisabled
          icon={<Spinner size="sm" aria-label="Applying fix" />}
          style={{ cursor: 'default', pointerEvents: 'none', opacity: 0.85 }}
        >
          Applying fix…
        </Button>
      );
    }
    if (isExecuted) {
      return (
        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }}>
          <CheckCircleIcon style={{ color: 'var(--pf-t--global--color--status--success--default)' }} />
          <Content component="small" style={{ color: 'var(--pf-t--global--color--status--success--default)', fontWeight: 600 }}>
            Remediation applied to {selectedCount} target{selectedCount !== 1 ? 's' : ''}
          </Content>
        </Flex>
      );
    }
    // Block execution until sandbox is cleared (passed or explicitly bypassed).
    if (sandboxState === 'pending' || sandboxState === 'running') return null;
    if (isUnauthorized) {
      return (
        <Button
          variant="primary"
          isDisabled
          icon={<LockIcon />}
          style={{ pointerEvents: 'none', cursor: 'not-allowed' }}
        >
          Insufficient Privileges to Execute
        </Button>
      );
    }
    return (
      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
        <Button
          variant="primary"
          isDisabled={selectedCount === 0 || isExecuting}
          isLoading={isExecuting}
          onClick={handleExecute}
        >
          {isExecuting
            ? `Applying to ${selectedCount} target${selectedCount !== 1 ? 's' : ''}…`
            : `Apply Remediation to ${selectedCount} target${selectedCount !== 1 ? 's' : ''}`}
        </Button>
        {!isExecuting && (
          <Button
            variant="link"
            isInline
            style={{ fontSize: '14px' }}
            onClick={() => {
              const drawer = PLAN_DRAWER_DATA[plan.id];
              agenticGlobalAiApi.openRemediationDiscussion?.({
                planSynopsis: plan.synopsis,
                optionTitle: option.title,
                rootCause: drawer?.rootCauseNarrative ?? plan.synopsis,
                remediationProposal: drawer?.remediationProposal ?? option.description,
                riskAssessment: drawer?.riskAssessment ?? '',
                blastRadius: plan.blastRadius,
                severity: plan.severity,
              });
            }}
          >
            Discuss with Lightspeed
          </Button>
        )}
      </Flex>
    );
  };

  return (
    <div ref={cardRootRef}>
    <Card
      id={cardId}
      isSelectable={isInteractive}
      isSelected={isSelected}
      isExpanded={isSelected}
      isDisabled={isUnauthorized && isInteractive}
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
            ? { 'aria-label': isSelected ? `Collapse ${typeName}` : `Expand ${typeName}` }
            : undefined
        }
      >
        {headerContent}
      </CardHeader>

      {isSelected && (
        <CardBody>
          {/* AI icon + full option title */}
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            gap={{ default: 'gapXs' }}
            style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }}
          >
            <Tooltip
              content="This remediation strategy is synthesized by the autonomous AI SRE agent based on live cluster states and historical patterns."
              position="top"
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', cursor: 'help' }}>
                <AiIcon size={16} />
              </span>
            </Tooltip>
            <Title headingLevel="h5" size="md">{option.title}</Title>
          </Flex>

          {/* Description */}
          <Content
            component="p"
            className="ols-aio-text-subtle-sm"
            style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
          >
            {option.description}
          </Content>

          {/* Execution status (Remediating only) */}
          {isRemediating && isFirst && executionMessage && (
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              gap={{ default: 'gapSm' }}
              style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
            >
              <Spinner size="sm" aria-label="Executing fix" />
              <Content
                component="p"
                className="ols-aio-text-subtle-sm"
                style={{ margin: 0, fontStyle: 'italic' }}
              >
                {executionMessage}
              </Content>
            </Flex>
          )}

          {/* Model badge */}
          <Flex
            gap={{ default: 'gapXs' }}
            flexWrap={{ default: 'wrap' }}
            style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
          >
            <Label color={option.model === 'smart' ? 'purple' : 'teal'} variant="outline" isCompact>
              {option.model === 'smart' ? 'Smart model' : 'Fast model'}
            </Label>
          </Flex>

          {/* Raw commands toggle */}
          {!isInvestigating && !isTerminal && !isRemediating && (
            <div style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
              <Button
                variant="link"
                isInline
                onClick={() => setShowCommands(!showCommands)}
                icon={
                  <AngleRightIcon
                    style={{
                      transform: showCommands ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 150ms ease',
                    }}
                  />
                }
                style={{ padding: 0, fontSize: '14px' }}
              >
                {showCommands ? 'Hide raw commands' : 'View raw commands'}
              </Button>
              {showCommands && (
                <div style={{ marginTop: 'var(--pf-t--global--spacer--xs)' }}>
                  <ClipboardCopy
                    isReadOnly
                    isCode
                    style={{ fontFamily: 'var(--pf-t--global--font--family--mono)', fontSize: '12px' }}
                  >
                    {option.rawCommands}
                  </ClipboardCopy>
                </div>
              )}
            </div>
          )}

          {/* ── Target Selection (Waiting Approval only) ── */}
          {!isInvestigating && !isTerminal && !isRemediating && drawerTargets.length > 0 && (
            <div
              style={{
                borderRadius: 'var(--pf-t--global--border--radius--small)',
                border: '1px solid var(--pf-t--global--border--color--default)',
                padding: 'var(--pf-t--global--spacer--sm) var(--pf-t--global--spacer--md)',
                marginBottom: 'var(--pf-t--global--spacer--sm)',
                backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
              }}
            >
              {/* Header row: label + Select All / Deselect All */}
              <Flex
                justifyContent={{ default: 'justifyContentSpaceBetween' }}
                alignItems={{ default: 'alignItemsCenter' }}
                style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }}
              >
                <Content component="small" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--pf-t--global--text--color--subtle)' }}>
                  Targets ({selectedCount} / {drawerTargets.length})
                </Content>
                <Flex gap={{ default: 'gapXs' }} alignItems={{ default: 'alignItemsCenter' }}>
                  <Button
                    variant="link"
                    isInline
                    style={{ fontSize: '12px' }}
                    onClick={() => setSelectedTargets(new Set(drawerTargets))}
                  >
                    Select all
                  </Button>
                  <span style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '12px' }}>·</span>
                  <Button
                    variant="link"
                    isInline
                    style={{ fontSize: '12px' }}
                    onClick={() => setSelectedTargets(new Set())}
                  >
                    Deselect all
                  </Button>
                </Flex>
              </Flex>

              {/* Individual target checkboxes */}
              <Stack hasGutter={false} style={{ gap: 'var(--pf-t--global--spacer--xs)' }}>
                {drawerTargets.map((target) => (
                  <StackItem key={target}>
                    <Checkbox
                      id={`target-${option.id}-${target}`}
                      label={target}
                      isChecked={selectedTargets.has(target)}
                      onChange={(_e, checked) => {
                        setSelectedTargets((prev) => {
                          const next = new Set(prev);
                          checked ? next.add(target) : next.delete(target);
                          return next;
                        });
                      }}
                    />
                  </StackItem>
                ))}
              </Stack>

              {/* Sandbox gate */}
              <div style={{ marginTop: 'var(--pf-t--global--spacer--sm)', paddingTop: 'var(--pf-t--global--spacer--sm)', borderTop: '1px solid var(--pf-t--global--border--color--default)' }}>
                {sandboxState === 'pending' && (
                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSandboxState('running');
                        setTimeout(() => setSandboxState('passed'), 2000);
                      }}
                    >
                      Run sandbox test first
                    </Button>
                    <Button
                      variant="link"
                      isInline
                      style={{ fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)' }}
                      onClick={() => setSandboxState('bypassed')}
                    >
                      Skip test (not recommended)
                    </Button>
                  </Flex>
                )}

                {sandboxState === 'running' && (
                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                    <Spinner size="sm" aria-label="Running sandbox test" />
                    <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                      Running sandbox test…
                    </Content>
                  </Flex>
                )}

                {sandboxState === 'passed' && (
                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }}>
                    <CheckCircleIcon style={{ color: 'var(--pf-t--global--color--status--success--default)', flexShrink: 0 }} />
                    <Content component="small" style={{ color: 'var(--pf-t--global--color--status--success--default)', fontWeight: 600 }}>
                      Sandbox test passed — execution unlocked
                    </Content>
                  </Flex>
                )}

                {sandboxState === 'bypassed' && (
                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }}>
                    <ExclamationTriangleIcon style={{ color: 'var(--pf-t--global--color--status--warning--default)', flexShrink: 0 }} />
                    <Content component="small" style={{ color: 'var(--pf-t--global--color--status--warning--default)', fontWeight: 600 }}>
                      Sandbox skipped — applying without prior test validation
                    </Content>
                  </Flex>
                )}
              </div>
            </div>
          )}

          {/* Action button */}
          {renderActionButton()}

          {/* ── Post-Mortem Execution Summary (inline, after execution) ── */}
          {isExecuted && (
            <PostMortemPanel
              plan={plan}
              isMetricsExpanded={isPostMortemOpen}
              onToggleMetrics={setIsPostMortemOpen}
            />
          )}
        </CardBody>
      )}
    </Card>
    </div>
  );
};

// ─── Drawer: locked section placeholders ─────────────────────────────────────

const LOCKED_BOX_STYLE: React.CSSProperties = {
  borderRadius: 'var(--pf-t--global--border--radius--small)',
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
  isMetricsExpanded?: boolean;
  onToggleMetrics?: (expanded: boolean) => void;
  isLogsExpanded?: boolean;
  onToggleLogs?: (expanded: boolean) => void;
}> = ({ plan, isMetricsExpanded, onToggleMetrics, isLogsExpanded, onToggleLogs }) => {
  const [localShowLogs, setLocalShowLogs] = useState(false);
  const [showTrace, setShowTrace] = useState(false);
  const { activePerspective } = useActivePerspective();
  const isSingleCluster = activePerspective === 'Core platforms';
  // Fall back to a synthesised post-mortem for plans executed live in this session.
  const postMortem = PLAN_POSTMORTEM[plan.id] ?? generatePostMortem(plan);

  // When toggle props are supplied the metrics section is collapsible; otherwise
  // the full panel is rendered statically (e.g. for plans already in terminal state).
  const hasToggle = isMetricsExpanded !== undefined && onToggleMetrics !== undefined;
  const hasLogsToggle = isLogsExpanded !== undefined && onToggleLogs !== undefined;
  const showLogs = hasLogsToggle ? isLogsExpanded! : localShowLogs;
  const toggleLogs = hasLogsToggle ? onToggleLogs! : setLocalShowLogs;

  if (postMortem.type === 'success') {
    const targets = isSingleCluster
      ? (postMortem.executionTargetsSC ?? postMortem.executionTargets ?? [])
      : (postMortem.executionTargets ?? []);

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

        {/* Section B — Execution Scope */}
        {targets.length > 0 && (
          <>
            {sectionLabel('Execution Scope')}
            <DescriptionList isHorizontal isAutoColumnWidths isCompact>
              <DescriptionListGroup>
                <DescriptionListTerm>Targets</DescriptionListTerm>
                <DescriptionListDescription>
                  <Flex flexWrap={{ default: 'wrap' }} gap={{ default: 'gapXs' }}>
                    {targets.map((t) => (
                      <Label key={t} color="blue" isCompact>{t}</Label>
                    ))}
                  </Flex>
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </>
        )}

        {/* Section C — Audit Trail */}
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
              {isMetricsExpanded ? 'Hide Post-Mortem Execution Summary' : 'View Post-Mortem Execution Summary'}
            </Button>

            {/* Collapsible metrics content (Sections A, B, C) */}
            {isMetricsExpanded && (
              <div style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                {metricsBlock}
              </div>
            )}

            <Divider style={{ margin: `var(--pf-t--global--spacer--sm) 0` }} />

            {/* Raw logs — always visible */}
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
                {showLogs ? 'Hide raw execution logs' : 'View raw execution logs'}
              </Button>
              {showLogs && (
                <div style={{ marginTop: 'var(--pf-t--global--spacer--xs)' }}>
                  <ClipboardCopy
                    variant={ClipboardCopyVariant.expansion}
                    isReadOnly
                    isCode
                    style={{ fontFamily: 'var(--pf-t--global--font--family--mono)', fontSize: '12px' }}
                  >
                    {postMortem.rawLog ?? ''}
                  </ClipboardCopy>
                </div>
              )}
            </div>

            {/* Actions — always visible */}
            <Flex gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }} alignItems={{ default: 'alignItemsCenter' }}>
              <Button variant="danger" isDanger>Initiate Rollback</Button>
              <Button variant="link" icon={<ExternalLinkAltIcon />} iconPosition="end">Export to ITSM Ticket</Button>
              <Button variant="link" icon={<DownloadIcon />} iconPosition="end">Download Post-Mortem Report</Button>
            </Flex>
          </>
        ) : (
          /* ── Terminal drawer view: bordered card ── */
          <div
            style={{
              borderRadius: 'var(--pf-t--global--border--radius--small)',
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
                <CheckCircleIcon style={{ color: 'var(--pf-t--global--color--status--success--default)' }} />
                <Title headingLevel="h5" size="md">Post-Mortem Execution Summary</Title>
              </Flex>

              <Divider style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }} />

              {metricsBlock}

              <Divider style={{ margin: `var(--pf-t--global--spacer--md) 0` }} />

              {/* Raw logs */}
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
                  {showLogs ? 'Hide raw execution logs' : 'View raw execution logs'}
                </Button>
                {showLogs && (
                  <div style={{ marginTop: 'var(--pf-t--global--spacer--xs)' }}>
                    <ClipboardCopy
                      variant={ClipboardCopyVariant.expansion}
                      isReadOnly
                      isCode
                      style={{ fontFamily: 'var(--pf-t--global--font--family--mono)', fontSize: '12px' }}
                    >
                      {postMortem.rawLog ?? ''}
                    </ClipboardCopy>
                  </div>
                )}
              </div>

              <Divider style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }} />

              {/* Actions */}
              <Flex gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }} alignItems={{ default: 'alignItemsCenter' }}>
                <Button variant="danger" isDanger>Initiate Rollback</Button>
                <Button variant="link" icon={<ExternalLinkAltIcon />} iconPosition="end">Export to ITSM Ticket</Button>
                <Button variant="link" icon={<DownloadIcon />} iconPosition="end">Download Post-Mortem Report</Button>
              </Flex>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div
      style={{
        borderRadius: 'var(--pf-t--global--border--radius--small)',
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

        {/* ── Emergency actions ── */}
        <StackItem>
          <Flex gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }} alignItems={{ default: 'alignItemsCenter' }}>
            <Button variant="danger" isDanger>Force Emergency Rollback</Button>
            <Button variant="secondary" icon={<ExternalLinkAltIcon />} iconPosition="end">
              Escalate to PagerDuty
            </Button>
          </Flex>
        </StackItem>

        <StackItem><Divider /></StackItem>

        {/* ── Failure trace ── */}
        <StackItem>
          <ExpandableSection
            toggleText={showTrace ? 'Hide failure trace' : 'View failure trace'}
            isExpanded={showTrace}
            onToggle={(_e, v) => setShowTrace(v)}
          >
            {/* No variant="expansion" — ExpandableSection owns the toggle;
                ClipboardCopy renders the text directly without a nested expand. */}
            <ClipboardCopy
              isReadOnly
              isCode
              style={{ fontFamily: 'var(--pf-t--global--font--family--mono)', fontSize: '12px', marginTop: 'var(--pf-t--global--spacer--xs)' }}
            >
              {postMortem.failureTrace ?? ''}
            </ClipboardCopy>
          </ExpandableSection>
        </StackItem>
      </Stack>
    </div>
  );
};

// ─── Drawer: Plan review panel body ──────────────────────────────────────────

type RemediationWorkflowSection = 'chain' | 'rca' | 'rem';

/** Match drill-down layout: auto-scroll expanded remediation sections on tablet-sized viewports. */
const REMEDIATION_AUTO_SCROLL_MAX_VIEWPORT = 1100;

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

/** Scroll expanded workflow content into view when it extends below the visible fold. */
const scrollRemediationSectionIntoViewIfNeeded = (target: HTMLElement | null) => {
  if (!target || window.innerWidth > REMEDIATION_AUTO_SCROLL_MAX_VIEWPORT) {
    return;
  }

  const scrollParent = getRemediationScrollParent(target);
  const targetRect = target.getBoundingClientRect();
  const parentRect = scrollParent.getBoundingClientRect();
  const padding = 16;
  const extendsBelow = targetRect.bottom > parentRect.bottom - padding;
  const extendsAbove = targetRect.top < parentRect.top + padding;

  if (!extendsBelow && !extendsAbove) {
    return;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
};

const getDefaultRemediationSection = (plan: PlanRow): RemediationWorkflowSection => {
  const { status, severity } = plan;
  if (status === 'Investigating') return 'chain';
  if (status === 'Remediating') return 'rem';
  if (status === 'Waiting Approval') {
    return severity === 'critical' ? 'rca' : 'rem';
  }
  return 'rem';
};

const createInitialSectionState = (
  plan: PlanRow,
): Record<RemediationWorkflowSection, boolean> => {
  const focusSection = getDefaultRemediationSection(plan);
  return {
    chain: focusSection === 'chain',
    rca: focusSection === 'rca',
    rem: focusSection === 'rem',
  };
};

export const RemediationBlueprintPanel: React.FC<{ plan: PlanRow }> = ({ plan }) => {
  const status = plan.status;
  const isInvestigating = status === 'Investigating';
  const isRemediating = status === 'Remediating';
  const isTerminal = status === 'Completed' || status === 'Failed';

  const [sectionExpanded, setSectionExpanded] = useState(() => createInitialSectionState(plan));
  // Guided view: first presentation from the plans table — only the focus section stays open.
  const [isGuidedView, setIsGuidedView] = useState(true);
  const chainRef = React.useRef<HTMLDivElement>(null);
  const rcaRef = React.useRef<HTMLDivElement>(null);
  const remHubRef = React.useRef<HTMLDivElement>(null);

  const sectionRefMap: Record<RemediationWorkflowSection, React.RefObject<HTMLDivElement | null>> = {
    chain: chainRef,
    rca: rcaRef,
    rem: remHubRef,
  };

  useEffect(() => {
    setSectionExpanded(createInitialSectionState(plan));
    setIsGuidedView(true);
  }, [plan.id]);

  const handleSectionToggle = (section: RemediationWorkflowSection) => (
    _event: React.MouseEvent,
    isOpen: boolean,
  ) => {
    if (isGuidedView) {
      setIsGuidedView(false);
    }
    setSectionExpanded((prev) => ({
      ...prev,
      [section]: isOpen,
    }));
    if (isOpen) {
      setTimeout(() => {
        scrollRemediationSectionIntoViewIfNeeded(sectionRefMap[section].current);
      }, 50);
    }
  };

  const drawer = PLAN_DRAWER_DATA[plan.id];
  const rcaVariant = plan.severity === 'critical' ? 'ols-aio-rca-box--critical' : 'ols-aio-rca-box--warning';
  const options = PLAN_REMEDIATION_OPTIONS[plan.id] ?? [];
  const optionCount = options.length;
  // Remediating plans show only option 1 — count what's actually rendered.
  const visibleOptionCount = isRemediating ? Math.min(optionCount, 1) : optionCount;
  const optionLabel = visibleOptionCount === 1 ? '1 remediation option' : `${visibleOptionCount} remediation options`;

  // Default selection: first option is always pre-selected on mount.
  const [selectedOptionId, setSelectedOptionId] = useState<string>(options[0]?.id ?? '');

  // Safety gate: critical plans require explicit RCA verification before the SRE
  // can interact with the Remediation Hub. Warning plans skip the gate entirely.
  // Plans already in execution (Remediating / Completed / Failed) are also exempt
  // since the gate was already cleared in a prior interaction.
  const [isDiagnosisVerified, setIsDiagnosisVerified] = useState<boolean>(
    plan.severity === 'warning' ||
    status === 'Remediating' ||
    status === 'Completed' ||
    status === 'Failed',
  );

  const handleVerifyDiagnosis = () => {
    setIsDiagnosisVerified(true);
    setSelectedOptionId(options[0]?.id ?? '');
    setIsGuidedView(false);
    setSectionExpanded({ chain: false, rca: false, rem: true });
    setTimeout(() => {
      scrollRemediationSectionIntoViewIfNeeded(remHubRef.current);
    }, 50);
  };

  if (!drawer) return null;

  // For Remediating plans: override any 'active' step to 'done' so the chain
  // renders as a static historical read-only view (no live indicators).
  const displaySteps = isRemediating
    ? drawer.steps.map(s => s.status === 'active' ? { ...s, status: 'done' as const } : s)
    : drawer.steps;

  // Derive the live execution message from the step that was 'active' before
  // the override — this gets surfaced inside Option Card 1 instead.
  const activeStepTitle = isRemediating
    ? drawer.steps.find(s => s.status === 'active')?.title
    : undefined;

  return (
    <Stack hasGutter>
      {/* ── Section A: AI Insight Banner ──────────────────────────────── */}
      <StackItem>
        <Alert
          variant="info"
          isInline
          title="AI synthesis"
          customIcon={
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              <AiIcon size={16} />
            </span>
          }
        >
          <Content component="p" style={{ margin: 0 }}>
            {generateAiInsight(plan)}
          </Content>
        </Alert>
      </StackItem>

      <Divider />

      {/* ── Section B: Active Reasoning Chain ─────────────────────────── */}
      <StackItem>
        <div ref={chainRef}>
        <ExpandableSection
          toggleText=""
          isExpanded={sectionExpanded.chain}
          onToggle={handleSectionToggle('chain')}
          toggleContent={
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }}>
              <FlexItem>
                <Flex alignItems={{ default: 'alignItemsCenter' }}>
                  <CodeBranchIcon style={{ marginRight: 'var(--pf-t--global--spacer--sm)' }} />
                  <Title headingLevel="h4" size="md">Active Reasoning Chain</Title>
                </Flex>
              </FlexItem>
              {isInvestigating && (
                <FlexItem>
                  <Label color="blue" variant="outline" isCompact>Live</Label>
                </FlexItem>
              )}
            </Flex>
          }
        >
          <ol className="ols-aio-reasoning-timeline">
            {displaySteps.map((step) => (
              <li key={step.id} className="ols-aio-reasoning-timeline__item">
                <span className="ols-aio-reasoning-timeline__node">
                  <ReasoningChainStepGlyph step={step} />
                </span>
                <Flex
                  justifyContent={{ default: 'justifyContentSpaceBetween' }}
                  flexWrap={{ default: 'wrap' }}
                >
                  <FlexItem>
                    <Flex
                      alignItems={{ default: 'alignItemsCenter' }}
                      flexWrap={{ default: 'wrap' }}
                      gap={{ default: 'gapSm' }}
                    >
                      <span
                        className="ols-aio-text-subtle-sm"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {formatReasoningStepDisplayTime(step)}
                      </span>
                      {step.status === 'active' && (
                        <Label color="blue" variant="outline" isCompact>In progress</Label>
                      )}
                    </Flex>
                  </FlexItem>
                </Flex>
                <Title headingLevel="h5" size="md" style={{ marginTop: 'var(--pf-t--global--spacer--xs)' }}>
                  {step.title}
                </Title>
                {step.detail && (
                  <Content
                    component="p"
                    style={{
                      marginTop: 'var(--pf-t--global--spacer--xs)',
                      color: 'var(--pf-t--global--text--color--subtle)',
                      marginBottom: 0,
                    }}
                  >
                    {step.detail}
                  </Content>
                )}
              </li>
            ))}
          </ol>
        </ExpandableSection>
        </div>
      </StackItem>

      <Divider />

      {/* ── Section C: Root Cause Analysis ────────────────────────────── */}
      <StackItem>
        <div ref={rcaRef}>
        <ExpandableSection
          toggleText=""
          isExpanded={sectionExpanded.rca}
          onToggle={handleSectionToggle('rca')}
          toggleContent={
            <Flex alignItems={{ default: 'alignItemsCenter' }}>
              <BullseyeIcon style={{ marginRight: 'var(--pf-t--global--spacer--sm)' }} />
              <Title headingLevel="h4" size="md">Root Cause Analysis (RCA)</Title>
            </Flex>
          }
        >
          {isInvestigating ? (
            <RcaLockedPlaceholder />
          ) : (
          <div className={`ols-aio-rca-box ${rcaVariant}`} style={{ position: 'relative' }}>
            <Label
              color={drawer.confidence >= 80 ? 'green' : drawer.confidence >= 60 ? 'yellow' : 'blue'}
              style={{ position: 'absolute', top: 'var(--pf-t--global--spacer--sm)', right: 'var(--pf-t--global--spacer--sm)' }}
            >
              {drawer.confidence}% confidence
            </Label>
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
            >
              <BullseyeIcon style={{ marginRight: 'var(--pf-t--global--spacer--xs)' }} />
              <span className="ols-aio-text-overline">Detected Root Cause</span>
            </Flex>
            <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
              {drawer.aggregatedFinding}
            </Content>
            <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
              {drawer.rootCauseNarrative}
            </Content>

            {/* ── Verification gate (critical plans, non-investigating) ── */}
            {!isInvestigating && plan.severity === 'critical' && (
              <div style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
                <Divider style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }} />
                {isDiagnosisVerified ? (
                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }}>
                    <CheckCircleIcon
                      style={{ color: 'var(--pf-t--global--color--status--success--default)', flexShrink: 0 }}
                    />
                    <Content
                      component="small"
                      style={{
                        color: 'var(--pf-t--global--color--status--success--default)',
                        fontWeight: 600,
                      }}
                    >
                      Diagnosis verified
                    </Content>
                  </Flex>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<CheckCircleIcon />}
                    onClick={handleVerifyDiagnosis}
                  >
                    Acknowledge & view remediation
                  </Button>
                )}
              </div>
            )}
          </div>
          )}
        </ExpandableSection>
        </div>
      </StackItem>

      <Divider />

      {/* ── Section D: Remediation Hub ─────────────────────────────────── */}
      <StackItem>
        <div ref={remHubRef}>
        <ExpandableSection
          toggleText=""
          isExpanded={sectionExpanded.rem}
          onToggle={handleSectionToggle('rem')}
          toggleContent={
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
              <WrenchIcon style={{ marginRight: 'var(--pf-t--global--spacer--sm)' }} />
              <Title headingLevel="h4" size="md">Remediation Hub</Title>
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
              {!isInvestigating && !isTerminal && visibleOptionCount > 0 && (
                <Label color="grey" isCompact variant="outline">{optionLabel}</Label>
              )}
            </Flex>
          }
        >
          {isInvestigating ? (
            <HubLockedPlaceholder />
          ) : isTerminal ? (
            <PostMortemPanel plan={plan} />
          ) : (
            <>
              {/* Gate hint shown to critical plans before verification */}
              {!isDiagnosisVerified && (
                <Flex
                  alignItems={{ default: 'alignItemsCenter' }}
                  gap={{ default: 'gapSm' }}
                  style={{
                    marginBottom: 'var(--pf-t--global--spacer--sm)',
                    padding: 'var(--pf-t--global--spacer--sm) var(--pf-t--global--spacer--md)',
                    borderRadius: 'var(--pf-t--global--border--radius--small)',
                    backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
                    border: '1px solid var(--pf-t--global--border--color--default)',
                  }}
                >
                  <LockIcon style={{ flexShrink: 0, color: 'var(--pf-t--global--text--color--subtle)' }} />
                  <Content
                    component="small"
                    style={{ color: 'var(--pf-t--global--text--color--subtle)' }}
                  >
                    Verify the AI diagnosis in the RCA section above to unlock remediation options.
                  </Content>
                </Flex>
              )}

              {/* RBAC notice — shown when the operator has read-only access */}
              {plan.isUnauthorized && (
                <Alert
                  variant="warning"
                  isInline
                  title="Read-only access — remediation execution is locked. Contact your cluster admin to request elevated RBAC privileges."
                  style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
                />
              )}

              {/* Options list — gated by diagnosis verification AND RBAC authorization */}
              <div
                style={{
                  opacity: plan.isUnauthorized ? 0.6 : isDiagnosisVerified ? 1 : 0.45,
                  pointerEvents: (plan.isUnauthorized || !isDiagnosisVerified) ? 'none' : undefined,
                  transition: 'opacity 300ms ease',
                }}
              >
                <Stack hasGutter>
                  {options
                    .filter((_, idx) => !(isRemediating && idx > 0))
                    .map((opt, idx) => (
                      <StackItem key={opt.id}>
                        <RemediationOptionCard
                          option={opt}
                          index={idx}
                          plan={plan}
                          executionMessage={isRemediating && idx === 0 ? activeStepTitle : undefined}
                          isSelected={selectedOptionId === opt.id}
                          onSelect={setSelectedOptionId}
                        />
                      </StackItem>
                    ))}
                </Stack>
              </div>
            </>
          )}
        </ExpandableSection>
        </div>
      </StackItem>
    </Stack>
  );
};

// ─── Fixed-position side panel ────────────────────────────────────────────────
//
// Position: fixed so the panel anchors to the viewport's right edge regardless
// of any parent container constraints.
//
// The panel's `top` is measured dynamically from the PF page main-container's
// top edge so it aligns with the start of the page content area (below the
// masthead + any app chrome).
//
// Z-index 150: above the page main content (PF z-index--xs = 100) but safely
// below the PF sidebar (z-index--sm = 200) and masthead (z-index--md = 300).
//
// Animation phase drives a CSS transform slide:
//   entering  → translateX(100%), no transition  (snap off-screen instantly)
//   visible   → translateX(0),    ease-out 280ms (decelerate into view)
//   leaving   → translateX(100%), ease-in  200ms (accelerate off-screen)

type PanelPhase = 'entering' | 'visible' | 'leaving';

const PANEL_TRANSITION: Record<PanelPhase, string> = {
  entering: 'none',
  visible:  'transform 280ms cubic-bezier(0.22, 1, 0.36, 1)',
  leaving:  'transform 200ms cubic-bezier(0.55, 0, 1, 0.45)',
};
const PANEL_TRANSFORM: Record<PanelPhase, string> = {
  entering: 'translateX(100%)',
  visible:  'translateX(0)',
  leaving:  'translateX(100%)',
};

// Exit animation duration in ms (must match the 'leaving' transition above).
const LEAVE_DURATION_MS = 200;

const usePanelTop = (): number => {
  const [panelTop, setPanelTop] = React.useState<number>(0);

  React.useEffect(() => {
    const measure = () => {
      const mainContainer = document.querySelector<HTMLElement>('.pf-v6-c-page__main-container');
      if (mainContainer) {
        setPanelTop(mainContainer.getBoundingClientRect().top);
      }
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return panelTop;
};

interface RemediationSidePanelProps {
  plan: PlanRow;
  phase: PanelPhase;
  onClose: () => void;
}

const RemediationSidePanel: React.FC<RemediationSidePanelProps> = ({ plan, phase, onClose }) => {
  const panelTop = usePanelTop();

  return (
    <>
      {/* Transparent hit-target scrim — click outside to close.
          z-index 149 keeps it below the panel (150) and below the
          masthead (300) / sidebar (200). Fade in/out with the panel. */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 149,
          opacity: phase === 'visible' ? 1 : 0,
          transition: phase === 'leaving'
            ? `opacity ${LEAVE_DURATION_MS}ms ease-in`
            : 'opacity 280ms ease-out',
        }}
        onClick={onClose}
      />

      {/* Panel shell */}
      <div
        role="complementary"
        aria-label={`Plan review: ${plan.synopsis}`}
        style={{
          position: 'fixed',
          top: panelTop,
          right: 0,
          bottom: 0,
          width: '35%',
          minWidth: '420px',
          maxWidth: '640px',
          zIndex: 150,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
          borderLeft: '1px solid var(--pf-t--global--border--color--default)',
          /* Top-left corner radius only — right edge and bottom are flush with viewport */
          borderTopLeftRadius: '16px',
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.12)',
          /* Slide animation */
          transform: PANEL_TRANSFORM[phase],
          transition: PANEL_TRANSITION[phase],
          willChange: 'transform',
        }}
      >
        {/* ── Panel header ─────────────────────────────────────────────── */}
        <div
          style={{
            flexShrink: 0,
            padding: '16px 20px',
            borderBottom: '1px solid var(--pf-t--global--border--color--default)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ flex: '1 1 auto', minWidth: 0 }}>
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              gap={{ default: 'gapSm' }}
              flexWrap={{ default: 'nowrap' }}
            >
              <FlexItem style={{ flexShrink: 0 }}>
                <AiIcon size={16} />
              </FlexItem>
              <FlexItem style={{ minWidth: 0 }}>
                <Title
                  headingLevel="h3"
                  size="md"
                  style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                >
                  {plan.synopsis}
                </Title>
              </FlexItem>
            </Flex>
            <div style={{ marginTop: '6px' }}>
              <StatusLabel status={plan.status} />
            </div>
          </div>

          <Button
            variant="plain"
            aria-label="Close Remediation Blueprint panel"
            onClick={onClose}
            style={{ flexShrink: 0, marginTop: '2px' }}
          >
            <TimesIcon />
          </Button>
        </div>

        {/* ── Scrollable panel body ─────────────────────────────────────── */}
        {/* Padding lives on the inner div, not the scroll container, so
            padding-bottom is included in the scroll extent (browser quirk). */}
        <div style={{ flex: '1 1 auto', overflowY: 'auto', overflowX: 'hidden' }}>
          <div style={{ padding: '24px 20px' }}>
            <RemediationBlueprintPanel key={plan.id} plan={plan} />
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Drill-down remediation page (prototype UX test) ─────────────────────────

/** Plan that opens remediation in a full-page drill-down instead of the side drawer. */
export const DRILL_DOWN_PLAN_ID = 'ap1';
export const DRILL_DOWN_PLAN_SLUG = 'analytics-memory-leak-fix';
export const DRILL_DOWN_REMEDIATION_PATH = `/core/observe/ai-hub/plans/${DRILL_DOWN_PLAN_SLUG}/remediation`;

export function buildPlansForPerspective(isSingleCluster: boolean): PlanRow[] {
  const combined = isSingleCluster
    ? [...SC_TOP_PLANS, ...SC_ALL_PLANS]
    : [...TOP_PLANS, ...ALL_PLANS];
  const createdAnchor = new Date('2026-06-09T16:00:00.000Z').getTime();
  return [...combined]
    .sort((a, b) => b.score - a.score)
    .map((row, index) => {
      const identity = PLAN_TABLE_IDENTITY[row.id];
      return {
        ...row,
        name: identity?.name ?? row.id,
        synopsis: identity?.synopsis ?? row.synopsis,
        namespace: identity?.namespace,
        cluster: identity?.fleetCluster ?? row.drawerTargets[0] ?? '—',
        scope: isSingleCluster
          ? identity?.namespace ?? '—'
          : identity?.fleetCluster ?? row.drawerTargets[0] ?? '—',
        createdAt:
          row.createdAt ??
          new Date(createdAnchor - index * 47 * 60_000).toISOString(),
      };
    });
}

// ─── Exported tab content ─────────────────────────────────────────────────────

export const PlansAndApprovalsTab: React.FC = () => {
  const navigate = useNavigate();
  const { activePerspective } = useActivePerspective();
  const isSingleCluster = activePerspective === 'Core platforms';

  const plans = useMemo(
    () => buildPlansForPerspective(isSingleCluster),
    [isSingleCluster],
  );

  // `displayedPlan` stays populated during the leave animation so the panel
  // content doesn't vanish before it slides off-screen.
  const [displayedPlan, setDisplayedPlan] = useState<PlanRow | null>(null);
  const [panelPhase, setPanelPhase] = useState<PanelPhase>('entering');
  const leaveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const openPanel = useCallback((plan: PlanRow) => {
    if (plan.id === DRILL_DOWN_PLAN_ID) {
      navigate(DRILL_DOWN_REMEDIATION_PATH);
      return;
    }

    // Cancel any in-flight leave timer
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }

    // Snap off-screen (no transition), then on the next two frames slide in.
    setDisplayedPlan(plan);
    setPanelPhase('entering');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPanelPhase('visible');
      });
    });
  }, [navigate]);

  const closePanel = useCallback(() => {
    setPanelPhase('leaving');
    leaveTimerRef.current = setTimeout(() => {
      setDisplayedPlan(null);
      leaveTimerRef.current = null;
    }, LEAVE_DURATION_MS + 20); // +20 ms buffer for transition completion
  }, []);

  // Clean up on unmount
  React.useEffect(
    () => () => {
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    },
    [],
  );

  return (
    <>
      <Stack hasGutter>
        <StackItem>
          <Title
            headingLevel="h3"
            size="md"
            className="ols-aio-fleet-subcard-title"
            style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
          >
            Plans
          </Title>
          <PlansTable onReviewPlan={openPanel} rows={plans} isSingleCluster={isSingleCluster} />
        </StackItem>
      </Stack>

      {/* Fixed-position side panel — rendered above all page chrome */}
      {displayedPlan && (
        <RemediationSidePanel
          plan={displayedPlan}
          phase={panelPhase}
          onClose={closePanel}
        />
      )}
    </>
  );
};

import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Content,
  Divider,
  ExpandableSection,
  Flex,
  FlexItem,
  Label,
  Pagination,
  PaginationVariant,
  Progress,
  ProgressSize,
  Stack,
  StackItem,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import { BullseyeIcon, CodeBranchIcon, LockIcon, TerminalIcon, TimesIcon, WrenchIcon } from '@patternfly/react-icons';
import { ExpandableRowContent, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { AI_EXPERIENCE_ICON_DATA_URL } from '../../components/autonomousAiObserve/aiExperienceIconUrl';
import type { ReasoningStep } from '../../components/autonomousAiObserve/data';
import { ReasoningChainStepGlyph, formatReasoningStepDisplayTime } from '../../components/autonomousAiObserve/reasoningChainTimeline';
import '../../components/autonomousAiObserve/autonomous-ai-observe.css';

// ─── Types ────────────────────────────────────────────────────────────────────

type PlanSeverity = 'critical' | 'warning';
type PlanStatus = 'Investigating' | 'Waiting Approval' | 'Remediating' | 'Completed' | 'Failed';

interface PlanRow {
  id: string;
  severity: PlanSeverity;
  status: PlanStatus;
  score: number;
  synopsis: string;
  blastRadius: string;
  consolidationScope: string;
  triggerDomains: string;
  isUnauthorized: boolean;
  /** Each entry is one consolidated reason sentence rendered in the expanded panel. */
  expandedReasons: string[];
}

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
    expandedReasons: [
      '🔄 ArgoCD Controller Event: 1 LiveStateOutOfSync event detected.',
      '🛑 Prometheus Alert: 4 IngressControllerDegraded active alerts running.',
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
    expandedReasons: [
      '⚠️ Advanced Cluster Security Hook: 14 eBPF Kernel System Call Mutations detected.',
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
    expandedReasons: [
      '🚫 Kubelet Eviction Event: 6 Core Container OOMKilled signals.',
      '🛑 Prometheus Alert: 2 KubePodCrashLooping alarms.',
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
    expandedReasons: [
      '🛑 Prometheus Alert: 3 CephPoolNearFull warnings.',
      '🛑 Prometheus Alert: 5 KubePersistentVolumeFillingUp alarms.',
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
    expandedReasons: [
      '⚙️ K8s API Server Log Hook: 2 etcd_db_total_size_in_bytes fragmentation events.',
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
    expandedReasons: [
      '🛑 3 KubePodMemoryUtilizationHigh alarms active on dev pods.',
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
    expandedReasons: [
      '🛠️ Tekton Event: 1 PipelineRunFailed block.',
      '🛑 Prometheus Alert: 2 TektonTaskExecutionStalled warnings.',
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
    expandedReasons: [
      '⚠️ Kube-Apt-Controller Event: 1 CertificateExpirationWarning registered.',
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
    expandedReasons: [
      '🛑 4 CoreDNSLookupLatencyHigh warnings logged.',
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
    expandedReasons: [
      '⚙️ 2 NodeCPUOvercommitted events detected.',
      '🛑 1 KubeNodeNotReady alert active.',
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
    expandedReasons: [
      '🔄 ArgoCD Event: 1 LiveStateOutOfSync event flagged in staging.',
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
    expandedReasons: [
      '🛑 2 IngressControllerMinReplicasNotMet rules active.',
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
    expandedReasons: [
      '⚠️ 1 ACS Host Network sharing violation detected.',
      '🛑 3 matching low-priority alerts active.',
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
    expandedReasons: [
      '🚫 4 PodSandboxCleanedUpFailed core Kubelet log entries.',
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
    expandedReasons: [
      '🛑 1 JenkinsQueueSizeHigh metric threshold crossed.',
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
    expandedReasons: [
      '⚠️ HPA Controller Hook: 1 FailedComputeMetricsReplicas event.',
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
    expandedReasons: [
      '🛑 5 ErrImagePullBackOff sustained threshold alerts.',
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
    expandedReasons: [
      '⚙️ 1 Storage CSI volume throttling log entry.',
      '🛑 2 KubePersistentVolumeResizingStalled warnings.',
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
    expandedReasons: [
      '🛑 3 NodeClockSkewDetected Prometheus system metrics warnings.',
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
    expandedReasons: [
      '⚠️ ImageRegistry Controller Hook: 1 PruneImageRegistryManifestsFailed trace.',
    ],
  },
];

// ─── Drawer: per-plan data helpers ───────────────────────────────────────────

interface PlanDrawerData {
  steps: ReasoningStep[];
  aggregatedFinding: string;
  rootCauseNarrative: string;
  remediationProposal: string;
  riskAssessment: string;
  estimatedRecovery: string;
  confidence: number;
}

function makeSteps(topic: string, status: PlanStatus): ReasoningStep[] {
  const inv = status === 'Investigating';
  return [
    {
      id: 's1',
      status: 'done',
      time: '00:00:02',
      icon: 'database',
      title: 'Ingest & correlate signals',
      detail: `Correlated ${topic}. Temporal and topological causality graph built.`,
    },
    {
      id: 's2',
      status: inv ? 'active' : 'done',
      time: inv ? undefined : '00:00:09',
      icon: 'search',
      title: 'Isolate root cause',
      detail: inv
        ? 'Root cause isolation in progress — analyzing event causality graph…'
        : 'Root cause confirmed. Evidence chain locked.',
    },
    {
      id: 's3',
      status: inv ? 'pending' : 'done',
      time: inv ? undefined : '00:00:17',
      icon: inv ? 'search' : 'check',
      title: 'Synthesize remediation paths',
      detail: inv ? undefined : 'Remediation proposals assembled and risk-assessed.',
    },
  ];
}

const PLAN_DRAWER_DATA: Record<string, PlanDrawerData> = {
  tp1: {
    steps: makeSteps('1 ArgoCD drift event and 4 IngressControllerDegraded alerts', 'Waiting Approval'),
    aggregatedFinding: 'ArgoCD revision r4892 applied a malformed ApplicationSet template that mismatched live cluster state across 4 fleets.',
    rootCauseNarrative: 'A faulty Argo CD ApplicationSet push (revision r4892) propagated conflicting Kustomize overlays, causing router → workload traffic mismatches. The drift was confirmed 3 minutes after the sync event triggered 4 IngressControllerDegraded alerts.',
    remediationProposal: 'Revert ArgoCD ApplicationSet to revision r4891 and force a hard sync across all 4 affected fleets.',
    riskAssessment: 'Low — GitOps rollback is reversible and non-destructive.',
    estimatedRecovery: '~45s',
    confidence: 94,
  },
  tp2: {
    steps: makeSteps('14 eBPF Kernel System Call Mutations detected by ACS', 'Investigating'),
    aggregatedFinding: 'Signal correlation complete. 14 eBPF kernel mutations detected across 3 clusters. Root cause isolation in progress.',
    rootCauseNarrative: 'Initial signals indicate a compromised container image exploiting kernel syscall interfaces. Full causality graph is being constructed — root cause pending confirmation.',
    remediationProposal: 'Remediation paths pending root cause confirmation.',
    riskAssessment: 'Medium — isolation will require pod eviction, causing brief service disruption.',
    estimatedRecovery: '~3m',
    confidence: 71,
  },
  tp3: {
    steps: makeSteps('6 OOMKilled events and 2 KubePodCrashLooping alerts', 'Remediating'),
    aggregatedFinding: '6 OOMKill evictions across payments and auth pods confirmed via Kubelet. Memory quota exhaustion root cause locked.',
    rootCauseNarrative: 'A recent workload rollout increased container memory usage 40% above configured limits. Kubelet is evicting pods before the HPA can scale replacements, amplifying the crash loop cycle.',
    remediationProposal: 'Increase memory limits on affected deployments by 40% and trigger HPA scale-out to 3 replicas.',
    riskAssessment: 'Low — resource limit adjustments are rolling and reversible.',
    estimatedRecovery: '~90s',
    confidence: 85,
  },
  tp4: {
    steps: makeSteps('3 CephPoolNearFull and 5 KubePersistentVolumeFillingUp alerts', 'Waiting Approval'),
    aggregatedFinding: '8 Prometheus alerts confirm Ceph pool utilization exceeds 80% on 2 production clusters.',
    rootCauseNarrative: 'Rook-Ceph pool fill rate has accelerated due to unconfigured log rotation on 3 stateful workloads. At current write velocity, storage exhaustion is projected in ~4 hours.',
    remediationProposal: 'Expand Ceph pool capacity by 20% and enforce log rotation on affected StatefulSets.',
    riskAssessment: 'Medium — storage expansion requires OSD reconfiguration and a brief I/O suspension period.',
    estimatedRecovery: '~2m',
    confidence: 82,
  },
  tp5: {
    steps: makeSteps('2 etcd fragmentation events (etcd_db_total_size_in_bytes)', 'Completed'),
    aggregatedFinding: 'etcd database fragmentation (>65%) confirmed as root cause of elevated API server P99 latency.',
    rootCauseNarrative: 'etcd fragmentation exceeded 65% — a known performance threshold — causing API write amplification and increased leader election overhead, driving P99 latency above 1.2s.',
    remediationProposal: 'Execute etcd defragmentation on all 3 control plane members with rolling restart cadence.',
    riskAssessment: 'Low — etcd defragmentation is a supported operational procedure.',
    estimatedRecovery: '~45s',
    confidence: 91,
  },
  ap1: {
    steps: makeSteps('3 KubePodMemoryUtilizationHigh alarms on dev pods', 'Waiting Approval'),
    aggregatedFinding: '3 dev pods sustaining >85% memory utilization for >10 minutes, crossing the alert threshold.',
    rootCauseNarrative: 'A memory leak was introduced in a recent service update causing gradual heap growth. Containers are not yet OOMKilled but will exhaust their allocation within ~90 minutes at current growth rate.',
    remediationProposal: 'Apply memory limit patch (2Gi → 4Gi) and redeploy affected pods with the corrected configuration.',
    riskAssessment: 'Low — dev environment, no user-facing impact.',
    estimatedRecovery: '~30s',
    confidence: 78,
  },
  ap2: {
    steps: makeSteps('1 PipelineRunFailed block and 2 TektonTaskExecutionStalled alerts', 'Remediating'),
    aggregatedFinding: 'Tekton pipeline webhook blocked on 2 clusters due to EventListener TLS certificate failure.',
    rootCauseNarrative: 'A stale TLS certificate on the Tekton Triggers EventListener caused webhook signature validation failures, blocking all GitOps-triggered pipeline runs.',
    remediationProposal: 'Rotate EventListener TLS secret and force webhook endpoint re-registration on both clusters.',
    riskAssessment: 'Low — development pipeline only, no production workload impact.',
    estimatedRecovery: '~1m',
    confidence: 75,
  },
  ap3: {
    steps: makeSteps('1 CertificateExpirationWarning from Kube-Apt-Controller', 'Waiting Approval'),
    aggregatedFinding: 'An IAM client certificate expires in <72 hours. Service account authentications will fail upon expiry.',
    rootCauseNarrative: 'The certificate rotation automation script failed silently 30 days ago due to a missing IAM role binding, preventing auto-renewal. The warning only surfaced today as the certificate reached its expiry threshold.',
    remediationProposal: 'Re-bind the IAM automation role and execute emergency certificate rotation.',
    riskAssessment: 'Medium — brief authentication interruption expected during the rotation handoff window.',
    estimatedRecovery: '~2m',
    confidence: 71,
  },
  ap4: {
    steps: makeSteps('4 CoreDNSLookupLatencyHigh warnings across 3 clusters', 'Investigating'),
    aggregatedFinding: 'Signal correlation complete. 4 CoreDNS latency alerts detected across 3 clusters. Root cause analysis in progress.',
    rootCauseNarrative: 'Initial signals suggest CoreDNS pod memory pressure is causing resolver cache thrash. Full topology correlation is pending — root cause not yet confirmed.',
    remediationProposal: 'Remediation paths pending root cause confirmation.',
    riskAssessment: 'TBD — root cause under active investigation.',
    estimatedRecovery: 'TBD',
    confidence: 58,
  },
  ap5: {
    steps: makeSteps('2 NodeCPUOvercommitted events and 1 KubeNodeNotReady alert', 'Failed'),
    aggregatedFinding: 'CPU overcommitment on a baremetal node detected. Remediation attempt failed during node draining.',
    rootCauseNarrative: 'A Metal3 provisioning anomaly left a baremetal node in a partially-registered state, over-assigning workloads. The remediation script failed during node draining due to a stale kubelet lease.',
    remediationProposal: 'Force-drain node, reset the Metal3 BMH object, and re-provision the node.',
    riskAssessment: 'High — force drain may impact in-flight workloads during the procedure.',
    estimatedRecovery: '~5m',
    confidence: 65,
  },
  ap6: {
    steps: makeSteps('1 ArgoCD LiveStateOutOfSync event in staging namespace', 'Completed'),
    aggregatedFinding: 'ArgoCD detected a single resource drift in the staging namespace configuration.',
    rootCauseNarrative: 'A direct kubectl apply bypassed the GitOps workflow, creating a single resource divergence. Argo CD detected the discrepancy during its 3-minute sync loop and a hard sync restored declared state.',
    remediationProposal: 'Force ArgoCD hard sync on the staging application to restore GitOps-declared state.',
    riskAssessment: 'Low — staging environment, non-destructive sync operation.',
    estimatedRecovery: '~15s',
    confidence: 92,
  },
  ap7: {
    steps: makeSteps('2 IngressControllerMinReplicasNotMet alerts', 'Waiting Approval'),
    aggregatedFinding: 'Ingress controller replica count dropped below the configured minimum on 2 clusters, degrading load balancing resilience.',
    rootCauseNarrative: 'A node eviction event reduced ingress pod count below the minimum without triggering the HPA correctly. Root cause is a misconfigured PodDisruptionBudget blocking HPA-driven scale-out.',
    remediationProposal: 'Patch the PodDisruptionBudget to allow HPA scale-out and immediately scale ingress routers to the minimum replica count.',
    riskAssessment: 'Low — router pods scale rolling with no traffic interruption.',
    estimatedRecovery: '~1m',
    confidence: 79,
  },
  ap8: {
    steps: makeSteps('1 ACS Host Network sharing violation and 3 low-priority alerts', 'Waiting Approval'),
    aggregatedFinding: 'ACS detected a host network namespace sharing violation — a CIS benchmark Level 3 non-compliance — on 1 cluster.',
    rootCauseNarrative: 'A new deployment was misconfigured with hostNetwork: true, granting the container direct access to the node network stack. ACS enforcement policy flagged this as a critical security posture violation.',
    remediationProposal: 'Set hostNetwork: false on the offending deployment and apply a network policy admission webhook to prevent recurrence.',
    riskAssessment: 'Medium — policy enforcement will trigger pod restarts on the affected deployment.',
    estimatedRecovery: '~1m',
    confidence: 75,
  },
  ap9: {
    steps: makeSteps('4 PodSandboxCleanedUpFailed Kubelet log events', 'Waiting Approval'),
    aggregatedFinding: '4 pod sandbox cleanup failures logged by Kubelet on 2 clusters, indicating an OCI runtime garbage collection backlog.',
    rootCauseNarrative: 'A containerd runtime configuration change disrupted the sandbox cleanup routine. Orphaned container overlays are accumulating on node disk and will cause disk pressure if unresolved.',
    remediationProposal: 'Execute a graceful Kubelet garbage collection cycle and validate the containerd runtime configuration.',
    riskAssessment: 'Low — housekeeping operation with no workload impact.',
    estimatedRecovery: '~30s',
    confidence: 72,
  },
  ap10: {
    steps: makeSteps('1 JenkinsQueueSizeHigh metric threshold breach', 'Completed'),
    aggregatedFinding: 'Jenkins build queue exceeded 50 jobs, halting CI/CD throughput entirely.',
    rootCauseNarrative: 'A long-running integration test job monopolized all executor slots, starving downstream builds. The agent identified and terminated the stalled job, restoring executor availability.',
    remediationProposal: 'Terminate the stalled job and increase the executor count from 4 to 8 to prevent recurrence.',
    riskAssessment: 'Low — non-critical CI environment with no production dependency.',
    estimatedRecovery: '~2m',
    confidence: 88,
  },
  ap11: {
    steps: makeSteps('1 FailedComputeMetricsReplicas HPA controller event', 'Waiting Approval'),
    aggregatedFinding: 'HPA controller failing to compute target replicas, effectively disabling autoscaling.',
    rootCauseNarrative: 'The custom metrics adapter lost connectivity to its Prometheus scrape endpoint, leaving the HPA unable to evaluate scale triggers. Autoscaling has been frozen for approximately 20 minutes.',
    remediationProposal: 'Restart the custom metrics adapter and validate Prometheus scrape endpoint connectivity.',
    riskAssessment: 'Low — brief adapter restart has no workload impact.',
    estimatedRecovery: '~45s',
    confidence: 76,
  },
  ap12: {
    steps: makeSteps('5 sustained ErrImagePullBackOff threshold alerts across 4 clusters', 'Waiting Approval'),
    aggregatedFinding: '5 sustained ErrImagePullBackOff alerts across 4 clusters indicating container registry connectivity degradation.',
    rootCauseNarrative: 'A registry DNS record update propagated incorrectly to cluster resolvers, causing intermittent image pull failures. Approximately 30% of pull attempts are failing under the current configuration.',
    remediationProposal: 'Force DNS cache flush on affected nodes and update the registry mirror configuration to bypass the stale record.',
    riskAssessment: 'Low — rolling DNS update with no workload eviction required.',
    estimatedRecovery: '~2m',
    confidence: 72,
  },
  ap13: {
    steps: makeSteps('1 CSI volume throttle event and 2 KubePersistentVolumeResizingStalled alerts', 'Investigating'),
    aggregatedFinding: 'Signal correlation complete. Storage CSI throttling and PV resizing stall detected. Root cause analysis in progress.',
    rootCauseNarrative: 'Initial signals suggest read IOPS are exceeding the provisioned cloud storage tier limits. Full storage topology analysis is pending — root cause not yet confirmed.',
    remediationProposal: 'Remediation paths pending root cause confirmation.',
    riskAssessment: 'TBD — storage configuration change scope under investigation.',
    estimatedRecovery: 'TBD',
    confidence: 58,
  },
  ap14: {
    steps: makeSteps('3 NodeClockSkewDetected Prometheus system metrics alerts', 'Completed'),
    aggregatedFinding: '3 nodes across clusters reported NTP clock skew >10 seconds, flagging sync failures.',
    rootCauseNarrative: 'An upstream NTP server became unreachable due to a firewall rule change, leaving 3 nodes to drift independently. Clock skew exceeded Kubernetes tolerances, triggering certificate validation errors on some API calls.',
    remediationProposal: 'Reconfigure chronyd to use the corporate NTP pool and restart the clock synchronization service.',
    riskAssessment: 'Low — NTP reconfiguration has no workload impact.',
    estimatedRecovery: '~30s',
    confidence: 94,
  },
  ap15: {
    steps: makeSteps('1 PruneImageRegistryManifestsFailed trace from ImageRegistry controller', 'Waiting Approval'),
    aggregatedFinding: 'ImageRegistry pruning job failed, leaving orphaned image stream tags consuming registry storage.',
    rootCauseNarrative: 'A permissions regression in a recent RBAC update revoked the registry pruner service account access to delete manifests, causing the scheduled pruning job to fail silently.',
    remediationProposal: 'Restore RBAC permissions for the registry pruner service account and trigger a manual prune run.',
    riskAssessment: 'Low — registry pruning is non-destructive (removes unreferenced tags only).',
    estimatedRecovery: '~1m',
    confidence: 80,
  },
};

// ─── AI disclosure ────────────────────────────────────────────────────────────

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

// Standalone AI icon (no tooltip wrapper) used inside drawer sections
const AiIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <img src={AI_EXPERIENCE_ICON_DATA_URL} alt="" aria-hidden="true" width={size} height={size} style={{ display: 'block', flexShrink: 0 }} />
);

// ─── Severity badge ───────────────────────────────────────────────────────────

const SeverityBadge: React.FC<{ severity: PlanSeverity }> = ({ severity }) =>
  severity === 'critical' ? (
    <Label color="red" isCompact>Critical</Label>
  ) : (
    <Label color="yellow" isCompact>Warning</Label>
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

const StatusLabel: React.FC<{ status: PlanStatus }> = ({ status }) => (
  <Label color={STATUS_LABEL_COLOR[status]} variant="outline" isCompact style={{ whiteSpace: 'nowrap' }}>
    {status}
  </Label>
);

// ─── RBAC-aware action cell ───────────────────────────────────────────────────

interface ActionCellProps {
  status: PlanStatus;
  isUnauthorized: boolean;
  onReview: () => void;
}

const ActionCell: React.FC<ActionCellProps> = ({ status, isUnauthorized, onReview }) => {
  if (status === 'Investigating' || status === 'Remediating') {
    return (
      <Button variant="secondary" size="sm" onClick={onReview}>
        Review plan
      </Button>
    );
  }

  if (status === 'Waiting Approval') {
    if (isUnauthorized) {
      return (
        <Tooltip
          content="You have Read-Only access to this plan. Authorizing remediation requires elevated cluster privileges."
          position="top"
        >
          {/* Wrapper span required: disabled elements don't fire events for Tooltip */}
          <span style={{ display: 'inline-block', cursor: 'not-allowed' }}>
            <Button
              variant="link"
              isInline
              isDisabled
              style={{ pointerEvents: 'none' }}
              onClick={onReview}
            >
              View details&nbsp;<LockIcon style={{ verticalAlign: 'middle' }} />
            </Button>
          </span>
        </Tooltip>
      );
    }
    return (
      <Button variant="secondary" size="sm" onClick={onReview}>
        Review plan
      </Button>
    );
  }

  // Completed | Failed
  return (
    <Button variant="link" isInline onClick={onReview}>
      View summary
    </Button>
  );
};

// ─── Table column header helpers ──────────────────────────────────────────────

const AiColumnHeader: React.FC<{ label: string }> = ({ label }) => (
  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }} flexWrap={{ default: 'nowrap' }}>
    <FlexItem><AiSparkle /></FlexItem>
    <FlexItem>{label}</FlexItem>
  </Flex>
);

// ─── Core stateless table renderer ───────────────────────────────────────────

interface PlansTableCoreProps {
  rows: PlanRow[];
  ariaLabel: string;
  startIndex: number;
  expandedRows: Set<string>;
  onToggle: (id: string) => void;
  onReviewPlan: (plan: PlanRow) => void;
}

const PlansTableCore: React.FC<PlansTableCoreProps> = ({
  rows,
  ariaLabel,
  startIndex,
  expandedRows,
  onToggle,
  onReviewPlan,
}) => (
  <Table aria-label={ariaLabel} style={{ tableLayout: 'fixed', width: '100%' }}>
    <Thead>
      <Tr>
        <Th screenReaderText="Row expansion" style={{ width: '4%' }} />
        <Th style={{ width: '6%' }}>Severity</Th>
        <Th style={{ width: '7%' }}><AiColumnHeader label="Impact score" /></Th>
        <Th style={{ width: '21%' }}><AiColumnHeader label="Plan summary" /></Th>
        <Th style={{ width: '9%' }}>Blast radius</Th>
        <Th style={{ width: '13%' }}>Consolidation scope</Th>
        <Th style={{ width: '13%' }}>Trigger domains</Th>
        <Th style={{ width: '12%' }}>Status</Th>
        <Th style={{ width: '15%' }}>Action</Th>
      </Tr>
    </Thead>

    {rows.map((row, idx) => {
      const isExpanded = expandedRows.has(row.id);
      return (
        <Tbody key={row.id} isExpanded={isExpanded}>
          {/* ── Main data row ─────────────────────────────────────────── */}
          <Tr style={{ verticalAlign: 'middle' }}>
            <Td
              expand={{
                rowIndex: startIndex + idx,
                isExpanded,
                onToggle: () => onToggle(row.id),
              }}
            />

            <Td dataLabel="Severity">
              <SeverityBadge severity={row.severity} />
            </Td>

            <Td dataLabel="Impact score">
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }} flexWrap={{ default: 'nowrap' }}>
                <FlexItem><AiSparkle /></FlexItem>
                <FlexItem><span style={{ fontWeight: 600 }}>{row.score}</span></FlexItem>
              </Flex>
            </Td>

            <Td dataLabel="Plan summary" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }} flexWrap={{ default: 'nowrap' }}>
                <FlexItem><AiSparkle /></FlexItem>
                <FlexItem style={{ flex: '1 1 auto', minWidth: 0 }}>{row.synopsis}</FlexItem>
              </Flex>
            </Td>

            <Td dataLabel="Blast radius">{row.blastRadius}</Td>

            <Td dataLabel="Consolidation scope">
              <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                {row.consolidationScope}
              </span>
            </Td>

            <Td dataLabel="Trigger domains">{row.triggerDomains}</Td>

            <Td dataLabel="Status">
              <StatusLabel status={row.status} />
            </Td>

            <Td dataLabel="Action">
              <ActionCell
                status={row.status}
                isUnauthorized={row.isUnauthorized}
                onReview={() => onReviewPlan(row)}
              />
            </Td>
          </Tr>

          {/* ── Expanded detail row ────────────────────────────────────── */}
          <Tr isExpanded={isExpanded}>
            <Td colSpan={9}>
              <ExpandableRowContent>
                <div
                  style={{
                    padding: 'var(--pf-t--global--spacer--md)',
                    backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
                    borderRadius: 'var(--pf-t--global--border--radius--small)',
                  }}
                >
                  <p
                    style={{
                      margin: '0 0 var(--pf-t--global--spacer--xs)',
                      fontSize: 'var(--pf-t--global--font--size--body--sm)',
                      fontWeight: 600,
                      color: 'var(--pf-t--global--text--color--subtle)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Consolidated reasons for this plan
                  </p>
                  <ul style={{ margin: 0, paddingInlineStart: 'var(--pf-t--global--spacer--lg)' }}>
                    {row.expandedReasons.map((reason, i) => (
                      <li
                        key={i}
                        style={{
                          paddingBlock: 'var(--pf-t--global--spacer--2xs)',
                          color: 'var(--pf-t--global--text--color--regular)',
                          fontSize: 'var(--pf-t--global--font--size--body--sm)',
                        }}
                      >
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </ExpandableRowContent>
            </Td>
          </Tr>
        </Tbody>
      );
    })}
  </Table>
);

// ─── Top plans table (no pagination, own expand state) ───────────────────────

interface TopPlansTableProps {
  onReviewPlan: (plan: PlanRow) => void;
}

const TopPlansTable: React.FC<TopPlansTableProps> = ({ onReviewPlan }) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = useCallback((id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <PlansTableCore
      rows={TOP_PLANS}
      ariaLabel="Top plans requiring attention"
      startIndex={0}
      expandedRows={expandedRows}
      onToggle={toggleRow}
      onReviewPlan={onReviewPlan}
    />
  );
};

// ─── All plans table (pagination + own expand state) ─────────────────────────

const DEFAULT_PER_PAGE = 10;

interface AllPlansTableProps {
  onReviewPlan: (plan: PlanRow) => void;
}

const AllPlansTable: React.FC<AllPlansTableProps> = ({ onReviewPlan }) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);

  const totalItems = ALL_PLANS.length;
  const start = (page - 1) * perPage;
  const paginatedRows = ALL_PLANS.slice(start, start + perPage);

  const toggleRow = useCallback((id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

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
      <Pagination {...paginationProps} style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }} />
      <PlansTableCore
        rows={paginatedRows}
        ariaLabel="All plans"
        startIndex={start}
        expandedRows={expandedRows}
        onToggle={toggleRow}
        onReviewPlan={onReviewPlan}
      />
      <Pagination
        {...paginationProps}
        variant={PaginationVariant.bottom}
        style={{ marginTop: 'var(--pf-t--global--spacer--xs)' }}
      />
    </>
  );
};

// ─── Section header ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ title: string; threshold: React.ReactNode }> = ({
  title,
  threshold,
}) => (
  <Flex
    alignItems={{ default: 'alignItemsCenter' }}
    gap={{ default: 'gapMd' }}
    style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
  >
    <FlexItem>
      <Title headingLevel="h3" size="md" className="ols-aio-fleet-subcard-title">
        {title}
      </Title>
    </FlexItem>
    <FlexItem>{threshold}</FlexItem>
  </Flex>
);

// ─── Drawer: AI insight helper ────────────────────────────────────────────────

const generateAiInsight = (plan: PlanRow): string =>
  `Automated analysis correlated ${plan.consolidationScope} from the ${plan.triggerDomains} domain, ` +
  `with a blast radius spanning ${plan.blastRadius}. The agent has isolated the root cause and assembled ` +
  `a verified remediation strategy designed to restore system health with minimal operational risk.`;

// ─── Drawer: Remediation Hub action buttons ───────────────────────────────────

const RemediationHubActions: React.FC<{ plan: PlanRow }> = ({ plan }) => {
  const { status, isUnauthorized } = plan;

  if (status === 'Investigating') {
    return (
      <Content
        component="p"
        className="ols-aio-text-subtle-sm"
        style={{ fontStyle: 'italic', margin: 0 }}
      >
        Remediation options will be available after root cause analysis completes.
      </Content>
    );
  }

  if (status === 'Completed' || status === 'Failed') {
    return (
      <Button variant="link" isInline>
        View execution log
      </Button>
    );
  }

  if (status === 'Remediating') {
    return (
      <Button variant="primary" isDisabled>
        Applying fix… ⚙
      </Button>
    );
  }

  // Waiting Approval
  if (isUnauthorized) {
    return (
      <Tooltip
        content="You have Read-Only access to this plan. Authorizing remediation requires elevated cluster privileges."
        position="top"
      >
        <span style={{ display: 'inline-block', cursor: 'not-allowed' }}>
          <Button variant="primary" isDisabled style={{ pointerEvents: 'none' }}>
            Approve &amp; execute&nbsp;<LockIcon style={{ verticalAlign: 'middle' }} />
          </Button>
        </span>
      </Tooltip>
    );
  }

  return <Button variant="primary">Approve &amp; execute</Button>;
};

// ─── Drawer: Plan review panel body ──────────────────────────────────────────

const RemediationBlueprintPanel: React.FC<{ plan: PlanRow }> = ({ plan }) => {
  const [openChain, setOpenChain] = useState(true);
  const [openRca, setOpenRca] = useState(true);
  const [openRem, setOpenRem] = useState(true);

  const drawer = PLAN_DRAWER_DATA[plan.id];
  const rcaVariant = plan.severity === 'critical' ? 'ols-aio-rca-box--critical' : 'ols-aio-rca-box--warning';

  if (!drawer) return null;

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
        <ExpandableSection
          toggleText=""
          isExpanded={openChain}
          onToggle={(_e, expanded) => setOpenChain(expanded)}
          toggleContent={
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }}>
              <FlexItem>
                <Flex alignItems={{ default: 'alignItemsCenter' }}>
                  <CodeBranchIcon style={{ marginRight: 'var(--pf-t--global--spacer--sm)' }} />
                  <Title headingLevel="h4" size="md">Active Reasoning Chain</Title>
                </Flex>
              </FlexItem>
              {plan.status === 'Investigating' && (
                <FlexItem>
                  <Label color="blue" variant="outline" isCompact>Live</Label>
                </FlexItem>
              )}
            </Flex>
          }
        >
          <ol className="ols-aio-reasoning-timeline">
            {drawer.steps.map((step) => (
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
      </StackItem>

      <Divider />

      {/* ── Section C: Root Cause Analysis ────────────────────────────── */}
      <StackItem>
        <ExpandableSection
          toggleText=""
          isExpanded={openRca}
          onToggle={(_e, expanded) => setOpenRca(expanded)}
          toggleContent={
            <Flex alignItems={{ default: 'alignItemsCenter' }}>
              <BullseyeIcon style={{ marginRight: 'var(--pf-t--global--spacer--sm)' }} />
              <Title headingLevel="h4" size="md">Root Cause Analysis (RCA)</Title>
            </Flex>
          }
        >
          <div className={`ols-aio-rca-box ${rcaVariant}`}>
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
            <Flex
              justifyContent={{ default: 'justifyContentSpaceBetween' }}
              style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }}
            >
              <span className="ols-aio-text-overline">Confidence Score</span>
              <span
                style={{
                  fontWeight: 600,
                  fontSize: '14px',
                  color: 'var(--pf-t--global--color--status--success--default)',
                }}
              >
                {drawer.confidence}%
              </span>
            </Flex>
            <Progress
              value={drawer.confidence}
              title=""
              size={ProgressSize.sm}
              measureLocation="none"
              variant="success"
            />
          </div>
        </ExpandableSection>
      </StackItem>

      <Divider />

      {/* ── Section D: Remediation Hub ────────────────────────────────── */}
      <StackItem>
        <ExpandableSection
          toggleText=""
          isExpanded={openRem}
          onToggle={(_e, expanded) => setOpenRem(expanded)}
          toggleContent={
            <Flex alignItems={{ default: 'alignItemsCenter' }}>
              <WrenchIcon style={{ marginRight: 'var(--pf-t--global--spacer--sm)' }} />
              <Title headingLevel="h4" size="md">Remediation Hub</Title>
            </Flex>
          }
        >
          <div className="ols-aio-remediation-box">
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
            >
              <TerminalIcon style={{ marginRight: 'var(--pf-t--global--spacer--xs)' }} />
              <span className="ols-aio-text-overline">Recommended Action</span>
            </Flex>
            <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
              {drawer.remediationProposal}{' '}
              <span style={{ color: 'var(--pf-t--global--color--status--success--default)' }}>
                {drawer.estimatedRecovery}
              </span>
            </Content>
            <Content
              component="p"
              className="ols-aio-text-subtle-sm"
              style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
            >
              {drawer.riskAssessment}
            </Content>
            <RemediationHubActions plan={plan} />
          </div>
        </ExpandableSection>
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
        <div
          style={{
            flex: '1 1 auto',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '24px 20px',
          }}
        >
          <RemediationBlueprintPanel plan={plan} />
        </div>
      </div>
    </>
  );
};

// ─── Exported tab content ─────────────────────────────────────────────────────

export const PlansAndApprovalsTab: React.FC = () => {
  // `displayedPlan` stays populated during the leave animation so the panel
  // content doesn't vanish before it slides off-screen.
  const [displayedPlan, setDisplayedPlan] = useState<PlanRow | null>(null);
  const [panelPhase, setPanelPhase] = useState<PanelPhase>('entering');
  const leaveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const openPanel = useCallback((plan: PlanRow) => {
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
  }, []);

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
      <Stack hasGutter style={{ rowGap: 'var(--pf-t--global--spacer--xl)' }}>
        <StackItem>
          <SectionHeader
            title="Top plans"
            threshold={
              <Label color="blue" isCompact>
                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }} flexWrap={{ default: 'nowrap' }}>
                  <FlexItem><AiSparkle size={12} /></FlexItem>
                  <FlexItem>Impact score &ge;&nbsp;80</FlexItem>
                </Flex>
              </Label>
            }
          />
          <TopPlansTable onReviewPlan={openPanel} />
        </StackItem>

        <StackItem>
          <SectionHeader
            title="All plans"
            threshold={
              <Label color="blue" isCompact>
                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }} flexWrap={{ default: 'nowrap' }}>
                  <FlexItem><AiSparkle size={12} /></FlexItem>
                  <FlexItem>Impact score &lt;&nbsp;80</FlexItem>
                </Flex>
              </Label>
            }
          />
          <AllPlansTable onReviewPlan={openPanel} />
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

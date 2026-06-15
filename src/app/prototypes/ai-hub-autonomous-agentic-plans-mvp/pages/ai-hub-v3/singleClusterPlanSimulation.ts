/**
 * Core platforms (single-cluster) simulation overlays for prod-east-2.
 * Fleet management datasets stay multi-cluster; these patches localize copy,
 * blast radius, drawer narratives, and remediation commands to one cluster.
 */
import type { ReasoningStep } from '../../components/autonomousAiObserve/data';
import type { ConfidenceTier } from '../../types/confidenceTier';

export const CORE_PLATFORMS_CLUSTER_ID = 'prod-east-2';

export interface ScPlanTableIdentity {
  name: string;
  synopsis: string;
  namespace: string;
  fleetCluster: string;
}

/** Table identity — all plans live on the focused cluster; namespace column carries workload scope. */
export const SC_PLAN_TABLE_IDENTITY: Record<string, ScPlanTableIdentity> = {
  tp1: { name: 'gitops-ingress-drift-remediation', synopsis: 'Re-sync GitOps ingress drift on prod-east-2', namespace: 'payments-prod', fleetCluster: CORE_PLATFORMS_CLUSTER_ID },
  tp2: { name: 'acs-runtime-exploit-quarantine', synopsis: 'Quarantine compromised payment-api workload', namespace: 'payments-prod', fleetCluster: CORE_PLATFORMS_CLUSTER_ID },
  tp3: { name: 'payments-oom-cascade-remediation', synopsis: 'Resolve payment-api OOMKill cascade', namespace: 'payments-prod', fleetCluster: CORE_PLATFORMS_CLUSTER_ID },
  tp4: { name: 'rook-ceph-storage-expansion', synopsis: 'Remediate Ceph pool near-full on prod-east-2', namespace: 'openshift-storage', fleetCluster: CORE_PLATFORMS_CLUSTER_ID },
  tp5: { name: 'etcd-api-latency-optimization', synopsis: 'Optimize API latency via etcd defrag', namespace: 'openshift-etcd', fleetCluster: CORE_PLATFORMS_CLUSTER_ID },
  ap1: { name: 'analytics-memory-leak-fix', synopsis: 'Fix analytics-api memory leak in dev namespace', namespace: 'app-analytics-dev', fleetCluster: CORE_PLATFORMS_CLUSTER_ID },
  ap2: { name: 'tekton-webhook-tls-repair', synopsis: 'Repair Tekton webhook TLS on prod-east-2', namespace: 'openshift-pipelines', fleetCluster: CORE_PLATFORMS_CLUSTER_ID },
  ap3: { name: 'iam-token-rotation', synopsis: 'Rotate expiring OAuth client certificate', namespace: 'openshift-authentication', fleetCluster: CORE_PLATFORMS_CLUSTER_ID },
  ap4: { name: 'coredns-latency-investigation', synopsis: 'Investigate CoreDNS latency in openshift-dns', namespace: 'openshift-dns', fleetCluster: CORE_PLATFORMS_CLUSTER_ID },
  ap5: { name: 'baremetal-scheduling-rebalance', synopsis: 'Rebalance scheduling on worker-bm-03', namespace: 'openshift-machine-api', fleetCluster: CORE_PLATFORMS_CLUSTER_ID },
  ap6: { name: 'staging-gitops-resync', synopsis: 'Re-sync app-staging namespace drift', namespace: 'app-staging', fleetCluster: CORE_PLATFORMS_CLUSTER_ID },
  ap7: { name: 'ingress-replica-remediation', synopsis: 'Restore ingress router minimum replicas', namespace: 'openshift-ingress', fleetCluster: CORE_PLATFORMS_CLUSTER_ID },
  ap8: { name: 'acs-compliance-mitigation', synopsis: 'Mitigate hostNetwork compliance violation', namespace: 'retail-prod', fleetCluster: CORE_PLATFORMS_CLUSTER_ID },
  ap9: { name: 'kubelet-gc-cleanup', synopsis: 'Clear stale pod sandbox on worker-logistics-01', namespace: 'logistics-prod', fleetCluster: CORE_PLATFORMS_CLUSTER_ID },
  ap10: { name: 'jenkins-queue-remediation', synopsis: 'Resolve Jenkins queue depth in CI namespace', namespace: 'continuous-integration', fleetCluster: CORE_PLATFORMS_CLUSTER_ID },
  ap11: { name: 'hpa-metrics-limit-tuning', synopsis: 'Remediate HPA metrics adapter connectivity', namespace: 'api-gateway', fleetCluster: CORE_PLATFORMS_CLUSTER_ID },
  ap12: { name: 'registry-pull-failure-fix', synopsis: 'Fix image pull failures on prod-east-2', namespace: 'openshift-image-registry', fleetCluster: CORE_PLATFORMS_CLUSTER_ID },
  ap13: { name: 'database-iops-throttle-tune', synopsis: 'Tune postgres PVC read IOPS throttle', namespace: 'data-services', fleetCluster: CORE_PLATFORMS_CLUSTER_ID },
  ap14: { name: 'ntp-desync-remediation', synopsis: 'Fix NTP skew on 6 cluster nodes', namespace: 'openshift-node', fleetCluster: CORE_PLATFORMS_CLUSTER_ID },
  ap15: { name: 'image-stream-tag-cleanup', synopsis: 'Prune obsolete image stream tags', namespace: 'openshift-image-registry', fleetCluster: CORE_PLATFORMS_CLUSTER_ID },
};

type ExpandedReason = { icon: 'sync' | 'alert' | 'warning' | 'ban' | 'gear' | 'wrench'; text: string };

export interface ScPlanRowPatch {
  synopsis?: string;
  blastRadius?: string;
  consolidationScope?: string;
  triggerDomain?: string;
  drawerTargets?: string[];
  expandedReasons?: ExpandedReason[];
}

/** Row-level patches applied on top of SC_TOP_PLANS / SC_ALL_PLANS spread bases. */
export const SC_PLAN_ROW_PATCHES: Record<string, ScPlanRowPatch> = {
  tp1: {
    consolidationScope: '3 Apps / 4 Alerts',
    expandedReasons: [
      { icon: 'sync', text: 'ArgoCD Controller: LiveStateOutOfSync on payments-prod, retail-prod, logistics-prod.' },
      { icon: 'alert', text: 'Prometheus: 4 IngressControllerDegraded rules on router-default.' },
    ],
  },
  tp2: {
    consolidationScope: '14 Pod Events',
    expandedReasons: [
      { icon: 'warning', text: 'ACS Sensor: 14 eBPF syscall mutations on payment-api and payment-worker pods.' },
    ],
  },
  tp3: {
    consolidationScope: '6 Events / 2 Alerts',
    expandedReasons: [
      { icon: 'ban', text: 'Kubelet: 6 OOMKilled events on payment-api and payment-worker in payments-prod.' },
      { icon: 'alert', text: 'Prometheus: 2 KubePodCrashLooping alarms in payments-prod.' },
    ],
  },
  tp4: {
    consolidationScope: '8 Alerts / 1 Pool',
    expandedReasons: [
      { icon: 'alert', text: 'Prometheus: CephPoolNearFull on ocs-storagecluster-ceph-rbd.' },
      { icon: 'alert', text: 'Prometheus: 5 KubePersistentVolumeFillingUp in openshift-storage.' },
    ],
  },
  tp5: {
    consolidationScope: '2 API Events / 3 Members',
    expandedReasons: [
      { icon: 'gear', text: 'API Server: etcd_db_total_size fragmentation on all 3 control-plane members.' },
    ],
  },
  ap1: {
    consolidationScope: '3 Alerts / 2 Deployments',
    expandedReasons: [
      { icon: 'alert', text: '3 KubePodMemoryUtilizationHigh on analytics-api and analytics-worker in app-analytics-dev.' },
    ],
  },
  ap2: {
    consolidationScope: '1 Failure / 2 Alerts',
    expandedReasons: [
      { icon: 'wrench', text: 'Tekton: PipelineRunFailed on build-webhook-listener in openshift-pipelines.' },
      { icon: 'alert', text: 'Prometheus: 2 TektonTaskExecutionStalled warnings.' },
    ],
  },
  ap3: {
    consolidationScope: '1 Auth Event',
    expandedReasons: [
      { icon: 'warning', text: 'OAuth: CertificateExpirationWarning on oauth-openshift client.' },
    ],
  },
  ap4: {
    consolidationScope: '4 Alerts / 4 Pods',
    expandedReasons: [
      { icon: 'alert', text: '4 CoreDNSLookupLatencyHigh warnings on dns-default pods in openshift-dns.' },
    ],
  },
  ap5: {
    consolidationScope: '2 Events / 1 Alert',
    expandedReasons: [
      { icon: 'gear', text: '2 NodeCPUOvercommitted events on worker-bm-03 and worker-bm-04.' },
      { icon: 'alert', text: '1 KubeNodeNotReady on worker-bm-03.' },
    ],
  },
  ap6: {
    consolidationScope: '1 Drift / 3 Resources',
    expandedReasons: [
      { icon: 'sync', text: 'ArgoCD: LiveStateOutOfSync on staging-api in app-staging.' },
    ],
  },
  ap7: {
    consolidationScope: '2 Alerts / 2 Pods',
    expandedReasons: [
      { icon: 'alert', text: '2 IngressControllerMinReplicasNotMet on router-default in openshift-ingress.' },
    ],
  },
  ap8: {
    consolidationScope: '1 Violation / 3 Alerts',
    expandedReasons: [
      { icon: 'warning', text: 'ACS: hostNetwork violation on retail-checkout deployment.' },
      { icon: 'alert', text: '3 low-priority ACS posture alerts in retail-prod.' },
    ],
  },
  ap9: {
    consolidationScope: '4 Pod Events / 1 Node',
    expandedReasons: [
      { icon: 'ban', text: 'Kubelet: 4 PodSandboxCleanedUpFailed entries on worker-logistics-01.' },
    ],
  },
  ap10: {
    consolidationScope: '1 Alert / 1 StatefulSet',
    expandedReasons: [
      { icon: 'alert', text: '1 JenkinsQueueSizeHigh on jenkins-0 in continuous-integration.' },
    ],
  },
  ap11: {
    consolidationScope: '1 HPA Event',
    expandedReasons: [
      { icon: 'warning', text: 'HPA: FailedComputeMetricsReplicas on api-gateway-hpa.' },
    ],
  },
  ap12: {
    synopsis: 'Fix image pull failures in 3 namespaces',
    blastRadius: '3 Namespaces',
    consolidationScope: '5 Alerts / 3 ImageStreams',
    drawerTargets: ['ubi9-app', 'ubi9-runtime', 'ubi9-builder'],
    expandedReasons: [
      { icon: 'alert', text: '5 ErrImagePullBackOff alerts across payments-prod, retail-prod, and logistics-prod.' },
    ],
  },
  ap13: {
    consolidationScope: '1 Event / 2 Alerts',
    expandedReasons: [
      { icon: 'gear', text: 'CSI: volume throttling on postgres-data-0 PVC in data-services.' },
      { icon: 'alert', text: '2 KubePersistentVolumeResizingStalled warnings.' },
    ],
  },
  ap14: {
    blastRadius: '6 Nodes',
    consolidationScope: '3 Alerts / 6 Nodes',
    expandedReasons: [
      { icon: 'alert', text: '3 NodeClockSkewDetected on workers and masters in openshift-node.' },
    ],
  },
  ap15: {
    consolidationScope: '1 Registry Event',
    expandedReasons: [
      { icon: 'warning', text: 'ImageRegistry: PruneImageRegistryManifestsFailed on cluster image-registry.' },
    ],
  },
};

export interface PlanDrawerData {
  steps: ReasoningStep[];
  aggregatedFinding: string;
  rootCauseNarrative: string;
  remediationProposal: string;
  riskAssessment: string;
  estimatedRecovery: string;
  confidence: ConfidenceTier;
}

/** Full drawer narratives for Core platforms — replaces fleet-wide language. */
export const SC_PLAN_DRAWER_DATA: Record<string, PlanDrawerData> = {
  tp1: {
    steps: [
      { id: 's1', time: '10:03:12', status: 'done', icon: 'exclamation', title: 'Detected ArgoCD LiveStateOutOfSync in payments-prod', detail: '4 IngressControllerDegraded alerts on router-default in openshift-ingress' },
      { id: 's2', time: '10:03:25', status: 'done', icon: 'database', title: 'Fetched GitOps revision history', detail: 'Application payments-prod applied revision r4892 nine minutes before alert onset' },
      { id: 's3', time: '10:03:41', status: 'done', icon: 'network', title: 'Diffed live vs. declared NetworkPolicy objects', detail: 'deny-all-ingress overlay missing allow-rule for openshift-ingress namespace' },
      { id: 's4', time: '10:03:55', status: 'done', icon: 'search', title: 'Scored blast radius and causal confidence', detail: '3 applications affected on prod-east-2 · High confidence in GitOps root cause' },
    ],
    aggregatedFinding: 'Argo CD revision r4892 in payments-prod applied a NetworkPolicy that blocks router → workload traffic for 3 applications on this cluster.',
    rootCauseNarrative: 'A faulty GitOps push (revision r4892) introduced a deny-all-ingress NetworkPolicy in payments-prod without an allow-rule for openshift-ingress. Router pods began returning 502/503 for retail-prod and logistics-prod routes within 3 minutes of sync.',
    remediationProposal: 'Revert the payments-prod Argo CD application to revision r4891 and force a hard sync on prod-east-2.',
    riskAssessment: 'Low — GitOps rollback is reversible and limited to this cluster.',
    estimatedRecovery: '~45s',
    confidence: 'High',
  },
  tp2: {
    steps: [
      { id: 's1', time: '09:47:03', status: 'done', icon: 'exclamation', title: 'ACS flagged 14 eBPF kernel syscall mutations', detail: 'KernelModuleLoad events on payment-api and payment-worker pods in payments-prod' },
      { id: 's2', time: '09:47:18', status: 'done', icon: 'database', title: 'Pulled container runtime audit logs', detail: 'Activity isolated to image digest sha256:a3f1b9d4 on 2 deployments' },
      { id: 's3', time: '09:47:34', status: 'done', icon: 'network', title: 'Mapped network egress from affected pods', detail: 'Unexpected outbound connection to 104.21.x.x:443 from payment-api-7d4f8' },
      { id: 's4', status: 'active', icon: 'search', title: 'Cross-referencing CVE database and Falco ruleset', detail: 'Matching syscall pattern against known exploit signatures on this cluster…' },
    ],
    aggregatedFinding: '14 eBPF kernel mutations detected on payment-api and payment-worker in payments-prod. Root cause isolation in progress.',
    rootCauseNarrative: 'Initial signals indicate a compromised container image in payments-prod exploiting kernel syscall interfaces. Causality graph is scoped to 2 deployments on prod-east-2 — confirmation pending.',
    remediationProposal: 'Remediation paths pending root cause confirmation.',
    riskAssessment: 'Medium — isolation will evict pods in payments-prod, causing brief checkout disruption.',
    estimatedRecovery: '~3m',
    confidence: 'Medium',
  },
  tp3: {
    steps: [
      { id: 's1', time: '11:22:08', status: 'done', icon: 'exclamation', title: 'Kubelet reported 6 OOMKilled events', detail: 'payment-api and payment-worker pods evicted in payments-prod' },
      { id: 's2', time: '11:22:19', status: 'done', icon: 'database', title: 'Sampled 1-hour container memory metrics', detail: 'Heap growth 40% above limits since v2.1.4 deploy on payment-api' },
      { id: 's3', time: '11:22:33', status: 'done', icon: 'search', title: 'Traced memory growth to allocator regression in v2.1.4', detail: '2 KubePodCrashLooping alarms in payments-prod at 11:22:28' },
      { id: 's4', time: '11:22:45', status: 'done', icon: 'search', title: 'Correlated HPA scale lag with memory limit ceiling', detail: 'Evictions on prod-east-2 before HPA could provision replacements' },
    ],
    aggregatedFinding: '6 OOMKill evictions across payment-api and payment-worker in payments-prod. Memory quota exhaustion root cause locked.',
    rootCauseNarrative: 'Rollout v2.1.4 increased container memory usage 40% above configured limits in payments-prod. Kubelet evicts pods before the HPA scales replacements, amplifying the crash loop on this cluster.',
    remediationProposal: 'Increase memory limits on payment-api and payment-worker by 40% and scale HPA to 3 replicas in payments-prod.',
    riskAssessment: 'Low — rolling resource adjustments on this cluster.',
    estimatedRecovery: '~90s',
    confidence: 'High',
  },
  tp4: {
    steps: [
      { id: 's1', time: '08:11:04', status: 'done', icon: 'exclamation', title: 'Detected CephPoolNearFull on ocs-storagecluster-ceph-rbd', detail: 'Pool utilization exceeded 80% on prod-east-2' },
      { id: 's2', time: '08:11:17', status: 'done', icon: 'database', title: 'Queried Ceph OSD write-rate and log volume', detail: 'StatefulSet log emission 3× above ceiling in openshift-storage' },
      { id: 's3', time: '08:11:30', status: 'done', icon: 'search', title: 'Projected storage exhaustion timeline', detail: 'Pool depletion in ~4 hours at current fill rate on this cluster' },
      { id: 's4', time: '08:11:42', status: 'done', icon: 'network', title: 'Confirmed log rotation absent on 3 StatefulSets', detail: '5 KubePersistentVolumeFillingUp alerts in openshift-storage' },
    ],
    aggregatedFinding: 'Ceph pool ocs-storagecluster-ceph-rbd exceeds 80% utilization on prod-east-2 with 8 correlated storage alerts.',
    rootCauseNarrative: 'Rook-Ceph pool fill accelerated due to unconfigured log rotation on 3 stateful workloads in openshift-storage. Storage exhaustion projected in ~4 hours on this cluster.',
    remediationProposal: 'Expand the Ceph RBD pool by 20% and enforce log rotation on affected StatefulSets in openshift-storage.',
    riskAssessment: 'Medium — OSD expansion requires brief I/O suspension on prod-east-2.',
    estimatedRecovery: '~2m',
    confidence: 'High',
  },
  tp5: {
    steps: [
      { id: 's1', time: '07:09:11', status: 'done', icon: 'exclamation', title: 'Detected elevated API server P99 latency', detail: '2 etcd fragmentation events on openshift-etcd members' },
      { id: 's2', time: '07:09:22', status: 'done', icon: 'database', title: 'Queried etcd DB size and compaction history', detail: 'Fragmentation at 68% — auto-compact skipped during upgrade on prod-east-2' },
      { id: 's3', time: '07:09:34', status: 'done', icon: 'search', title: 'Correlated fragmentation with API write amplification', detail: 'P99 latency >1.2s on this cluster\'s API server' },
      { id: 's4', time: '07:09:46', status: 'done', icon: 'search', title: 'Scored blast radius and causal confidence', detail: '3 etcd members on prod-east-2 · High confidence' },
    ],
    aggregatedFinding: 'etcd fragmentation (>65%) on all 3 control-plane members is the root cause of elevated API latency on prod-east-2.',
    rootCauseNarrative: 'etcd fragmentation exceeded 65% on prod-east-2 control-plane members, causing API write amplification and P99 latency above 1.2s.',
    remediationProposal: 'Execute rolling etcd defragmentation on etcd-master-01, etcd-master-02, and etcd-master-03.',
    riskAssessment: 'Low — supported operational procedure on this cluster.',
    estimatedRecovery: '~45s',
    confidence: 'High',
  },
  ap1: {
    steps: [
      { id: 's1', time: '13:41:05', status: 'done', icon: 'exclamation', title: '3 KubePodMemoryUtilizationHigh alarms fired', detail: 'analytics-api and analytics-worker >85% for >10 minutes in app-analytics-dev' },
      { id: 's2', time: '13:41:18', status: 'done', icon: 'database', title: 'Profiled heap growth over 3-hour window', detail: 'Memory growing 15 MB/min — GC pressure leak on prod-east-2' },
      { id: 's3', time: '13:41:30', status: 'done', icon: 'search', title: 'Attributed leak to v1.8.3 service update', detail: 'Heap profile diff confirms allocator regression' },
    ],
    aggregatedFinding: 'analytics-api and analytics-worker in app-analytics-dev sustaining >85% memory for >10 minutes.',
    rootCauseNarrative: 'Memory leak in v1.8.3 causes gradual heap growth in app-analytics-dev. Containers will exhaust allocation within ~90 minutes on prod-east-2.',
    remediationProposal: 'Apply memory limit patch (2Gi → 4Gi) and rolling restart analytics-api and analytics-worker.',
    riskAssessment: 'Low — dev namespace on this cluster, no production impact.',
    estimatedRecovery: '~30s',
    confidence: 'Medium',
  },
  ap2: {
    steps: [
      { id: 's1', time: '10:55:03', status: 'done', icon: 'exclamation', title: 'PipelineRunFailed on build-webhook-listener', detail: 'GitOps-triggered runs blocked in openshift-pipelines' },
      { id: 's2', time: '10:55:14', status: 'done', icon: 'database', title: 'Fetched EventListener admission webhook logs', detail: 'TLS handshake failure — certificate CN mismatch on prod-east-2' },
      { id: 's3', time: '10:55:26', status: 'done', icon: 'network', title: 'Validated ACME DNS-01 challenge reachability', detail: 'Stale TLS secret on build-webhook-listener confirmed' },
      { id: 's4', time: '10:55:38', status: 'done', icon: 'search', title: 'Correlated webhook rejection rate with cert expiry', detail: 'Failures began 18 minutes after secret staleness threshold' },
    ],
    aggregatedFinding: 'Tekton EventListener TLS failure in openshift-pipelines is blocking pipeline runs on prod-east-2.',
    rootCauseNarrative: 'Stale TLS certificate on build-webhook-listener caused webhook signature validation failures, blocking GitOps-triggered pipelines on this cluster.',
    remediationProposal: 'Rotate EventListener TLS secret and re-register the webhook endpoint in openshift-pipelines.',
    riskAssessment: 'Low — development pipelines only on this cluster.',
    estimatedRecovery: '~1m',
    confidence: 'Medium',
  },
  ap3: {
    steps: [
      { id: 's1', time: '06:30:02', status: 'done', icon: 'exclamation', title: 'CertificateExpirationWarning on oauth-openshift', detail: 'OAuth client cert expiry in <72 hours on prod-east-2' },
      { id: 's2', time: '06:30:14', status: 'done', icon: 'database', title: 'Audited cert rotation job history', detail: 'Auto-rotation failed silently 30 days ago' },
      { id: 's3', time: '06:30:28', status: 'done', icon: 'search', title: 'Identified missing RBAC binding as root cause', detail: 'Automation account lost delete-certs permission in openshift-authentication' },
    ],
    aggregatedFinding: 'OAuth client certificate in openshift-authentication expires in <72 hours on prod-east-2.',
    rootCauseNarrative: 'Certificate rotation automation failed 30 days ago due to a missing RBAC binding in openshift-authentication, preventing auto-renewal on this cluster.',
    remediationProposal: 'Re-bind the automation role and execute emergency certificate rotation in openshift-authentication.',
    riskAssessment: 'Medium — brief auth interruption during rotation on prod-east-2.',
    estimatedRecovery: '~2m',
    confidence: 'Medium',
  },
  ap4: {
    steps: [
      { id: 's1', time: '15:14:07', status: 'done', icon: 'exclamation', title: '4 CoreDNSLookupLatencyHigh warnings', detail: 'Average lookup >200ms on dns-default pods in openshift-dns' },
      { id: 's2', time: '15:14:21', status: 'done', icon: 'database', title: 'Sampled CoreDNS pod memory and cache metrics', detail: 'Cache hit rate dropped from 91% to 63% on prod-east-2' },
      { id: 's3', status: 'active', icon: 'search', title: 'Correlating cache thrash with Corefile change', detail: 'Diffing CoreDNS Corefile edits from last deployment…' },
    ],
    aggregatedFinding: '4 CoreDNS latency alerts on dns-default pods in openshift-dns. Root cause analysis in progress.',
    rootCauseNarrative: 'CoreDNS memory pressure on prod-east-2 may be causing resolver cache thrash. Topology correlation scoped to openshift-dns — confirmation pending.',
    remediationProposal: 'Remediation paths pending root cause confirmation.',
    riskAssessment: 'TBD — investigation active on this cluster.',
    estimatedRecovery: 'TBD',
    confidence: 'Medium',
  },
  ap5: {
    steps: [
      { id: 's1', time: '05:58:11', status: 'done', icon: 'exclamation', title: 'NodeCPUOvercommitted and KubeNodeNotReady on worker-bm-03', detail: 'BareMetalHost stuck in inspecting phase' },
      { id: 's2', time: '05:58:24', status: 'done', icon: 'database', title: 'Inspected Metal3 BareMetalHost object', detail: 'Provisioning stuck — stale kubelet lease on prod-east-2' },
      { id: 's3', time: '05:58:37', status: 'done', icon: 'search', title: 'Correlated lease gaps with CPU overcommit', detail: 'worker-bm-03 partially registered in openshift-machine-api' },
    ],
    aggregatedFinding: 'CPU overcommitment on worker-bm-03 in openshift-machine-api. Prior remediation failed during drain.',
    rootCauseNarrative: 'Metal3 left worker-bm-03 partially registered on prod-east-2, over-assigning workloads. Drain failed due to stale kubelet lease.',
    remediationProposal: 'Force-drain worker-bm-03, reset BareMetalHost, and re-provision on this cluster.',
    riskAssessment: 'High — force drain may impact workloads on worker-bm-03.',
    estimatedRecovery: '~5m',
    confidence: 'Medium',
  },
  ap6: {
    steps: [
      { id: 's1', time: '07:59:03', status: 'done', icon: 'exclamation', title: 'ArgoCD LiveStateOutOfSync in app-staging', detail: 'staging-db-config diverged from Git state' },
      { id: 's2', time: '07:59:14', status: 'done', icon: 'database', title: 'Fetched kubectl apply audit log', detail: 'Direct apply bypass at 07:54 on prod-east-2' },
      { id: 's3', time: '07:59:24', status: 'done', icon: 'search', title: 'Diffed live vs. declared staging resources', detail: '3 resources diverged in app-staging — no dependency conflicts' },
    ],
    aggregatedFinding: 'Single resource drift in app-staging namespace on prod-east-2.',
    rootCauseNarrative: 'Direct kubectl apply bypassed GitOps in app-staging. Argo CD detected drift during its sync loop; hard sync restored declared state on this cluster.',
    remediationProposal: 'Force ArgoCD hard sync on staging-api application in app-staging.',
    riskAssessment: 'Low — staging namespace on prod-east-2.',
    estimatedRecovery: '~15s',
    confidence: 'High',
  },
  ap7: {
    steps: [
      { id: 's1', time: '12:07:18', status: 'done', icon: 'exclamation', title: 'IngressControllerMinReplicasNotMet on router-default', detail: '1 of 3 minimum replicas in openshift-ingress' },
      { id: 's2', time: '12:07:29', status: 'done', icon: 'database', title: 'Pulled HPA scaling event history', detail: 'HPA scale-out blocked on prod-east-2' },
      { id: 's3', time: '12:07:43', status: 'done', icon: 'network', title: 'Inspected PodDisruptionBudget', detail: 'maxUnavailable: 0 on router-default prevents scale' },
    ],
    aggregatedFinding: 'Ingress router below minimum replica count in openshift-ingress on prod-east-2.',
    rootCauseNarrative: 'Node eviction reduced router-default pods below minimum. Misconfigured PDB in openshift-ingress blocks HPA scale-out on this cluster.',
    remediationProposal: 'Patch PDB to allow scale-out and scale router-default to 3 replicas in openshift-ingress.',
    riskAssessment: 'Low — rolling router scale on prod-east-2.',
    estimatedRecovery: '~1m',
    confidence: 'Medium',
  },
  ap8: {
    steps: [
      { id: 's1', time: '09:23:05', status: 'done', icon: 'exclamation', title: 'ACS flagged hostNetwork on retail-checkout', detail: 'CIS Level 3 violation in retail-prod namespace' },
      { id: 's2', time: '09:23:18', status: 'done', icon: 'database', title: 'Inspected deployment spec and admission log', detail: 'hostNetwork added in last rollout on prod-east-2' },
      { id: 's3', time: '09:23:32', status: 'done', icon: 'search', title: 'Confirmed no legitimate host networking use case', detail: '3 ACS alerts corroborated in retail-prod' },
    ],
    aggregatedFinding: 'hostNetwork violation on retail-checkout deployment in retail-prod.',
    rootCauseNarrative: 'retail-checkout was misconfigured with hostNetwork: true in retail-prod on prod-east-2, exposing the node network stack.',
    remediationProposal: 'Set hostNetwork: false on retail-checkout and apply admission webhook in retail-prod.',
    riskAssessment: 'Medium — pod restarts on retail-checkout.',
    estimatedRecovery: '~1m',
    confidence: 'Medium',
  },
  ap9: {
    steps: [
      { id: 's1', time: '14:44:07', status: 'done', icon: 'exclamation', title: '4 PodSandboxCleanedUpFailed on worker-logistics-01', detail: 'OCI runtime GC backlog in logistics-prod node' },
      { id: 's2', time: '14:44:20', status: 'done', icon: 'database', title: 'Queried containerd disk usage on worker-logistics-01', detail: '2.1 GB orphaned overlays on prod-east-2' },
      { id: 's3', time: '14:44:34', status: 'done', icon: 'search', title: 'Identified containerd config drift', detail: 'sandbox_cleanup_interval set to 0 on this node' },
    ],
    aggregatedFinding: 'Pod sandbox cleanup failures on worker-logistics-01 serving logistics-prod workloads.',
    rootCauseNarrative: 'containerd config on worker-logistics-01 disabled sandbox cleanup. Orphaned overlays accumulating — disk pressure risk on prod-east-2.',
    remediationProposal: 'Run Kubelet GC on worker-logistics-01 and restore containerd sandbox_cleanup_interval.',
    riskAssessment: 'Low — housekeeping on one node.',
    estimatedRecovery: '~30s',
    confidence: 'Medium',
  },
  ap10: {
    steps: [
      { id: 's1', time: '06:44:02', status: 'done', icon: 'exclamation', title: 'JenkinsQueueSizeHigh on jenkins-0', detail: '57 jobs queued — 4 executor slots in continuous-integration' },
      { id: 's2', time: '06:44:13', status: 'done', icon: 'database', title: 'Identified stalled integration-test job', detail: 'Running 4.2h (expected 45m) on prod-east-2' },
      { id: 's3', time: '06:44:22', status: 'done', icon: 'search', title: 'Confirmed upstream fixture timeout', detail: 'No watchdog on long-running test stage' },
      { id: 's4', time: '06:44:31', status: 'done', icon: 'search', title: 'Correlated saturation with queue growth', detail: 'Queue 12 → 57 over 3.7h on this cluster' },
    ],
    aggregatedFinding: 'Jenkins queue exceeded 50 jobs on jenkins-0 in continuous-integration.',
    rootCauseNarrative: 'Stalled integration test monopolized executors on prod-east-2. Terminating the job restored CI throughput on this cluster.',
    remediationProposal: 'Terminate stalled job and increase JENKINS_MAX_EXECUTORS on jenkins-0.',
    riskAssessment: 'Low — CI namespace only.',
    estimatedRecovery: '~2m',
    confidence: 'High',
  },
  ap11: {
    steps: [
      { id: 's1', time: '11:37:14', status: 'done', icon: 'exclamation', title: 'FailedComputeMetricsReplicas on api-gateway-hpa', detail: 'Autoscaling frozen ~20 minutes in api-gateway' },
      { id: 's2', time: '11:37:26', status: 'done', icon: 'database', title: 'Verified custom metrics adapter connectivity', detail: 'Prometheus scrape unreachable from adapter on prod-east-2' },
      { id: 's3', time: '11:37:39', status: 'done', icon: 'network', title: 'Traced network policy blocking adapter path', detail: 'Namespace isolation policy in api-gateway introduced 22m ago' },
    ],
    aggregatedFinding: 'api-gateway-hpa unable to compute replicas in api-gateway namespace.',
    rootCauseNarrative: 'Custom metrics adapter lost Prometheus connectivity in api-gateway on prod-east-2. Autoscaling frozen for ~20 minutes.',
    remediationProposal: 'Restart metrics adapter and add egress rule for Prometheus scrape in api-gateway.',
    riskAssessment: 'Low — brief adapter restart.',
    estimatedRecovery: '~45s',
    confidence: 'Medium',
  },
  ap12: {
    steps: [
      { id: 's1', time: '08:29:11', status: 'done', icon: 'exclamation', title: '5 ErrImagePullBackOff alerts on prod-east-2', detail: '~30% pull failures across payments-prod, retail-prod, logistics-prod' },
      { id: 's2', time: '08:29:24', status: 'done', icon: 'database', title: 'Queried cluster DNS for registry FQDN', detail: 'Stale A-record for image-registry.openshift-image-registry.svc' },
      { id: 's3', time: '08:29:37', status: 'done', icon: 'network', title: 'Confirmed CoreDNS cache lag on this cluster', detail: 'New record not reflected in dns-default pods' },
    ],
    aggregatedFinding: '5 sustained image pull failures across 3 namespaces on prod-east-2.',
    rootCauseNarrative: 'Registry DNS record update did not propagate to CoreDNS caches on prod-east-2, causing intermittent ErrImagePullBackOff in payments-prod, retail-prod, and logistics-prod.',
    remediationProposal: 'Flush CoreDNS caches and update registry mirror config in openshift-image-registry.',
    riskAssessment: 'Low — rolling DNS update on this cluster.',
    estimatedRecovery: '~2m',
    confidence: 'Medium',
  },
  ap13: {
    steps: [
      { id: 's1', time: '16:02:08', status: 'done', icon: 'exclamation', title: 'CSI volume throttling on postgres-data-0', detail: 'Read IOPS exceeded tier in data-services' },
      { id: 's2', time: '16:02:22', status: 'done', icon: 'database', title: 'Queried cloud IOPS over 1-hour window', detail: '3,200/s actual vs 2,000/s provisioned on prod-east-2' },
      { id: 's3', status: 'active', icon: 'search', title: 'Correlating IOPS spike with workload events', detail: 'Checking batch jobs in data-services…' },
    ],
    aggregatedFinding: 'Storage throttling on postgres-data-0 PVC in data-services. Investigation in progress.',
    rootCauseNarrative: 'Read IOPS may exceed provisioned tier on postgres-data-0 in data-services on prod-east-2. Root cause confirmation pending.',
    remediationProposal: 'Remediation paths pending root cause confirmation.',
    riskAssessment: 'TBD — storage scope under investigation.',
    estimatedRecovery: 'TBD',
    confidence: 'Medium',
  },
  ap14: {
    steps: [
      { id: 's1', time: '22:28:04', status: 'done', icon: 'exclamation', title: '3 NodeClockSkewDetected on prod-east-2', detail: 'Clock skew >10s on 6 nodes in openshift-node' },
      { id: 's2', time: '22:28:16', status: 'done', icon: 'network', title: 'Traced NTP sync failure to firewall rule', detail: 'Corporate NTP pool unreachable since 22:15' },
      { id: 's3', time: '22:28:30', status: 'done', icon: 'search', title: 'Validated fallback NTP pool', detail: 'pool.ntp.org reachable from worker nodes' },
      { id: 's4', time: '22:28:42', status: 'done', icon: 'search', title: 'Correlated skew with cert validation errors', detail: 'API auth failures after 10s threshold on this cluster' },
    ],
    aggregatedFinding: 'NTP clock skew >10s on 6 nodes across prod-east-2 control plane and workers.',
    rootCauseNarrative: 'Upstream NTP unreachable due to firewall change left 6 nodes drifting on prod-east-2, triggering certificate validation errors.',
    remediationProposal: 'Reconfigure chronyd DaemonSet to corporate NTP pool in openshift-node.',
    riskAssessment: 'Low — NTP reconfiguration on this cluster.',
    estimatedRecovery: '~30s',
    confidence: 'High',
  },
  ap15: {
    steps: [
      { id: 's1', time: '07:15:03', status: 'done', icon: 'exclamation', title: 'PruneImageRegistryManifestsFailed', detail: 'Pruning failed 2 consecutive runs in openshift-image-registry' },
      { id: 's2', time: '07:15:17', status: 'done', icon: 'database', title: 'Audited pruner service account permissions', detail: 'delete-image-manifests revoked in RBAC patch v3.12.1' },
      { id: 's3', time: '07:15:29', status: 'done', icon: 'search', title: 'Confirmed no workloads reference prunable tags', detail: '847 MB unreferenced layers on prod-east-2 registry' },
    ],
    aggregatedFinding: 'Image registry pruning failed in openshift-image-registry on prod-east-2.',
    rootCauseNarrative: 'RBAC regression revoked pruner permissions in openshift-image-registry, causing silent prune failures on this cluster.',
    remediationProposal: 'Restore pruner RBAC and trigger manual prune in openshift-image-registry.',
    riskAssessment: 'Low — removes unreferenced tags only.',
    estimatedRecovery: '~1m',
    confidence: 'High',
  },
};

export interface ScRemediationOptionPatch {
  id: string;
  title?: string;
  description?: string;
  rawCommands?: string;
}

/** Cluster-scoped remediation command/description overrides. */
export const SC_REMEDIATION_OPTION_PATCHES: Record<string, ScRemediationOptionPatch[]> = {
  tp1: [
    { id: 'tp1-o1', title: 'Automated GitOps rollback in payments-prod', description: 'Revert payments-prod Argo CD application to revision r4891 and hard-sync on prod-east-2.', rawCommands: 'argocd app sync payments-prod --revision r4891 --prune --force' },
    { id: 'tp1-o2', title: 'Manual NetworkPolicy rollback via oc', description: 'Patch deny-all-ingress NetworkPolicy in payments-prod and restart router-default pods.', rawCommands: 'oc rollout undo netpol/deny-all-ingress -n payments-prod && oc rollout restart deployment/router-default -n openshift-ingress' },
    { id: 'tp1-o3', title: 'Delete faulty NetworkPolicy and re-sync', description: 'Remove the offending NetworkPolicy in payments-prod and trigger Argo CD refresh.', rawCommands: 'oc delete netpol deny-all-ingress -n payments-prod && argocd app sync payments-prod --prune' },
  ],
  ap2: [
    { id: 'ap2-o1', description: 'Rotate EventListener TLS secret in openshift-pipelines on prod-east-2.', rawCommands: 'oc apply -f ./pipelines/repaired-webhook-admission.yaml -n openshift-pipelines' },
    { id: 'ap2-o2', description: 'Delete and recreate build-webhook-listener on this cluster.', rawCommands: 'oc delete eventlistener/build-webhook-listener -n openshift-pipelines && oc apply -f ./pipelines/eventlistener.yaml' },
  ],
  ap12: [
    { id: 'ap12-o1', description: 'Flush CoreDNS caches and update registry pull secret on prod-east-2.', rawCommands: 'oc delete pod -l dns.operator.openshift.io/daemonset-dns=default -n openshift-dns && oc secrets link default registry-pull-secret --for=pull -n payments-prod' },
  ],
  ap14: [
    { id: 'ap14-o1', description: 'Reconfigure chronyd on all 6 nodes in openshift-node.', rawCommands: 'oc patch daemonset chrony-sync -n openshift-node --type merge -p \'{"spec":{"template":{"spec":{"containers":[{"name":"chrony","env":[{"name":"NTP_SERVER","value":"ntp.corp.example.com"}]}]}}}}\' && oc rollout restart daemonset/chrony-sync -n openshift-node' },
  ],
};

export function resolvePlanDrawerData(
  planId: string,
  fleetDrawer: PlanDrawerData | undefined,
  isSingleCluster: boolean,
): PlanDrawerData | undefined {
  if (!isSingleCluster) {
    return fleetDrawer;
  }
  return SC_PLAN_DRAWER_DATA[planId] ?? fleetDrawer;
}

export function applyScRemediationPatches<T extends { id: string }>(
  options: T[],
  planId: string,
  isSingleCluster: boolean,
): T[] {
  if (!isSingleCluster) {
    return options;
  }
  const patches = SC_REMEDIATION_OPTION_PATCHES[planId];
  if (!patches?.length) {
    return options;
  }
  const patchById = new Map(patches.map((p) => [p.id, p]));
  return options.map((opt) => {
    const patch = patchById.get(opt.id);
    return patch ? { ...opt, ...patch } : opt;
  });
}

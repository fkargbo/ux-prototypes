import React, { useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  ClipboardCopy,
  ClipboardCopyVariant,
  Content,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Label,
  MenuToggle,
  MenuToggleElement,
  Progress,
  ProgressSize,
  Select,
  SelectList,
  SelectOption,
  Stack,
  StackItem,
  Tab,
  Tabs,
  TabTitleText,
  TextInput,
  Title,
} from '@patternfly/react-core';
import { CheckCircleIcon, DownloadIcon, InfoCircleIcon } from '@patternfly/react-icons';
import { ExpandableRowContent, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import './ai-hub-v3-inventory.css';

// ── Types ──────────────────────────────────────────────────────────────────────

type InvocationType = 'Autonomous Pipeline' | 'Human Approved';

interface SandboxStep {
  step: number;
  label: string;
  detail: string;
  status: 'passed' | 'info';
}

interface AuditReceiptItem {
  key: string;
  value: string;
}

interface AuditRow {
  id: number;
  timestamp: string;
  invocationType: InvocationType;
  mutationPayload: string;
  targetScope: string;
  agentCapability: string;
  signee: string;
  otelRef: string;
  chainOfThought: {
    contextPrompt: string;
    sandboxPlan: SandboxStep[];
    auditReceipt: AuditReceiptItem[];
  };
}

// ── Mock data ──────────────────────────────────────────────────────────────────

const AUDIT_ROWS: AuditRow[] = [
  {
    id: 1,
    timestamp: '14:32:05 UTC',
    invocationType: 'Autonomous Pipeline',
    mutationPayload: 'Patch ConfigMap & Scale Replicas',
    targetScope: 'namespace: openshift-ingress',
    agentCapability: 'K8s:Network:Mutation',
    signee: 'System Engine',
    otelRef: '#ot-7f9b1c',
    chainOfThought: {
      contextPrompt: `## System Context
**Alert:** IngressControllerDegraded  (severity: critical)
**Cluster:** prod-us-east-01
**Namespace:** openshift-ingress

### Current Pod State
\`\`\`json
{
  "pod": "router-default-5f7b9",
  "status": "CrashLoopBackOff",
  "restarts": 14,
  "lastExit": "OOMKilled",
  "memory_limit": "256Mi",
  "memory_usage": "251Mi"
}
\`\`\`

### Structural Instructions
- You are an autonomous Kubernetes remediation agent operating under SRE policy v2.4.
- RBAC Capability: K8s:Network:Mutation (authorized for ConfigMap and ReplicaSet mutations).
- Target: Patch ingress ConfigMap to increase memory headroom by 25%, then scale replicas from 2 → 3.
- Log all mutations to OTel trace stream with ref #ot-7f9b1c.
- Dry-run MUST be executed before any live mutation. Abort on validation failure.`,
      sandboxPlan: [
        { step: 1, label: 'Log ingestion & alert parsing', detail: 'Ingested 14 crash loop events, 3 OOM signals from kubelet journal. Parsed structured alert payload from Alertmanager webhook.', status: 'info' },
        { step: 2, label: 'Sandbox dry-run: ConfigMap patch', detail: 'Executed dry-run against sandbox cluster replica. ConfigMap `router-default-env` patched — memory limit: 256Mi → 320Mi. No breaking drifts.', status: 'passed' },
        { step: 3, label: 'Sandbox dry-run: ReplicaSet scale', detail: 'Dry-run scale from replicas: 2 → 3 passed scheduling simulation. Node capacity sufficient on worker-pool-east-b.', status: 'passed' },
        { step: 4, label: 'Validation gate', detail: 'Validation result: PASSED (0 breaking drifts, 0 policy violations). Proceeding to live execution.', status: 'passed' },
        { step: 5, label: 'Live mutation applied', detail: 'ConfigMap patched and ReplicaSet scaled in prod-us-east-01/openshift-ingress. OTel span closed at 14:32:05 UTC.', status: 'passed' },
      ],
      auditReceipt: [
        { key: 'SHA-256 Log Hash', value: 'a3f9c2e1b4d780f6e52a91bc3d07...9c1a' },
        { key: 'RBAC Token Clearance', value: 'K8s:Network:Mutation — GRANTED (policy: sre-autonomy-v2.4)' },
        { key: 'Git Webhook Ref', value: 'gitops-sync-hook-prod — commit #0001c135' },
        { key: 'OTel Trace', value: '#ot-7f9b1c (span closed: 14:32:07 UTC)' },
        { key: 'Immutability Seal', value: 'Ledger entry sealed — no modifications permitted post-execution' },
        { key: 'Compliance Framework', value: 'SOC2 Type II / AI-OPS-CTRL-004' },
      ],
    },
  },
  {
    id: 2,
    timestamp: '11:14:22 UTC',
    invocationType: 'Human Approved',
    mutationPayload: 'Force Rolling Pod Restart',
    targetScope: 'namespace: app-prod-east',
    agentCapability: 'K8s:Core:Mutation',
    signee: 'sre-lead-admin@company.com',
    otelRef: '#ot-3a2d8e',
    chainOfThought: {
      contextPrompt: `## System Context
**Alert:** PodCrashLooping (severity: warning)
**Cluster:** prod-us-east-01
**Namespace:** app-prod-east

### Current Pod State
\`\`\`json
{
  "pods": ["api-gateway-6c4d9f", "api-gateway-7b2e1c"],
  "status": "CrashLoopBackOff",
  "restarts": [8, 11],
  "lastExit": "Error",
  "configMap_version": "v1.14-stale"
}
\`\`\`

### Structural Instructions
- Human approval required per SRE policy §3.2 for production namespace mutations.
- Awaiting sign-off from sre-lead-admin@company.com before any execution.
- Action: Force rolling restart on all pods in app-prod-east deployment api-gateway.
- Capture pre/post pod state snapshot for compliance receipt.`,
      sandboxPlan: [
        { step: 1, label: 'Alert correlation & root cause', detail: 'Correlated 2 crashing pods to stale ConfigMap version v1.14. Live version is v1.16 — pods referencing outdated env mount.', status: 'info' },
        { step: 2, label: 'Human approval gate triggered', detail: 'Action classified as requiring Human-in-the-Loop per SRE Policy §3.2. Approval request dispatched to sre-lead-admin@company.com.', status: 'info' },
        { step: 3, label: 'Approval received', detail: 'Sign-off confirmed at 11:14:01 UTC by sre-lead-admin@company.com. Digital signature: sha256:d4e5f6...', status: 'passed' },
        { step: 4, label: 'Rolling restart executed', detail: '`kubectl rollout restart deployment/api-gateway -n app-prod-east` executed. 2/2 pods restarted cleanly. ConfigMap v1.16 mounted successfully.', status: 'passed' },
      ],
      auditReceipt: [
        { key: 'SHA-256 Log Hash', value: 'b7d1e4f2a9c36804...4f2a' },
        { key: 'Approver Identity', value: 'sre-lead-admin@company.com (OIDC verified)' },
        { key: 'Approval Timestamp', value: '11:14:01 UTC — 21s before live execution' },
        { key: 'RBAC Token Clearance', value: 'K8s:Core:Mutation — GRANTED (human-approved override)' },
        { key: 'OTel Trace', value: '#ot-3a2d8e (span closed: 11:14:25 UTC)' },
        { key: 'Compliance Framework', value: 'SOC2 Type II / AI-OPS-CTRL-007 (Human Approval Required)' },
      ],
    },
  },
  {
    id: 3,
    timestamp: 'Yesterday 23:45:10',
    invocationType: 'Autonomous Pipeline',
    mutationPayload: 'Trigger GitOps Application Sync',
    targetScope: 'app: payment-gateway',
    agentCapability: 'GitOps:Argo:Sync',
    signee: 'System Engine',
    otelRef: '#ot-9c4b5f',
    chainOfThought: {
      contextPrompt: `## System Context
**Alert:** ArgoCDApplicationOutOfSync (severity: warning)
**Application:** payment-gateway
**Cluster:** prod-us-east-01

### Application State
\`\`\`json
{
  "app": "payment-gateway",
  "sync_status": "OutOfSync",
  "health": "Degraded",
  "revision_target": "r4895",
  "revision_live": "r4892",
  "drift_count": 3
}
\`\`\`

### Structural Instructions
- Autonomous sync authorized under GitOps:Argo:Sync capability.
- Trigger hard sync to revision r4895 using argocd CLI.
- If health check fails post-sync, escalate to human approval queue immediately.`,
      sandboxPlan: [
        { step: 1, label: 'Drift detection', detail: 'Detected 3 resource drifts between target revision r4895 and live r4892: Deployment spec, ConfigMap env block, and Service port mapping.', status: 'info' },
        { step: 2, label: 'Sync simulation', detail: 'Dry-run sync simulation completed in ArgoCD staging replica. All 3 drifts reconciled cleanly. Health projection: Healthy.', status: 'passed' },
        { step: 3, label: 'Live sync triggered', detail: '`argocd app sync payment-gateway --force --prune` executed. Sync completed in 12s. All resources reconciled to r4895.', status: 'passed' },
        { step: 4, label: 'Post-sync health check', detail: 'Application health: Healthy. All pods Running. Payment gateway latency p99: 42ms (nominal).', status: 'passed' },
      ],
      auditReceipt: [
        { key: 'SHA-256 Log Hash', value: 'c9e2f5a8d1b46702...7e3c' },
        { key: 'ArgoCD Sync Revision', value: 'r4895 (committed by ci-bot@company.com)' },
        { key: 'RBAC Token Clearance', value: 'GitOps:Argo:Sync — GRANTED (policy: gitops-autonomy-v1.2)' },
        { key: 'OTel Trace', value: '#ot-9c4b5f (span closed: 23:45:22 UTC)' },
        { key: 'Git Webhook Ref', value: 'push event: payment-gateway/main — commit a1b2c3d4' },
        { key: 'Compliance Framework', value: 'SOC2 Type II / AI-OPS-CTRL-002 (GitOps Mutation)' },
      ],
    },
  },
  {
    id: 4,
    timestamp: 'Yesterday 18:22:01',
    invocationType: 'Human Approved',
    mutationPayload: 'Isolate Container (Apply NetworkPolicy)',
    targetScope: 'namespace: checkout-service',
    agentCapability: 'ACS:Security:Quarantine',
    signee: 'security-ops@company.com',
    otelRef: '#ot-1f8e2b',
    chainOfThought: {
      contextPrompt: `## System Context
**Alert:** ACSRuntimeViolation (severity: critical)
**Policy:** CryptoMining Process Detected
**Namespace:** checkout-service

### Threat State
\`\`\`json
{
  "pod": "checkout-worker-9d4b2",
  "violation": "CryptoMiningProcessDetected",
  "process": "xmrig",
  "cpu_spike": "94%",
  "network_egress_unusual": true,
  "acs_policy": "ENFORCE"
}
\`\`\`

### Structural Instructions
- Critical security event — human approval required per SecOps Policy §1.1.
- Proposed action: Apply restrictive NetworkPolicy to isolate checkout-worker-9d4b2.
- Approval required from security-ops team before any network mutation.
- Document full chain of evidence for SOC2 compliance audit.`,
      sandboxPlan: [
        { step: 1, label: 'ACS violation classification', detail: 'ACS policy engine flagged xmrig process in checkout-worker-9d4b2. CPU at 94%, unusual outbound TCP to 5.188.206.x. Classified: HIGH severity cryptomining.', status: 'info' },
        { step: 2, label: 'Human approval gate — security-ops', detail: 'Escalated to security-ops@company.com with full threat evidence package. Isolation pre-staged, awaiting response.', status: 'info' },
        { step: 3, label: 'Approval received', detail: 'Approved by security-ops@company.com at 18:21:44 UTC. Digital signature verified against OIDC provider.', status: 'passed' },
        { step: 4, label: 'NetworkPolicy applied', detail: 'Egress deny-all NetworkPolicy applied to checkout-service/checkout-worker-9d4b2. Outbound connections severed. Pod retained for forensic capture.', status: 'passed' },
        { step: 5, label: 'Forensic snapshot captured', detail: 'Memory dump and process tree snapshot captured to forensic storage bucket. Available for incident response team.', status: 'passed' },
      ],
      auditReceipt: [
        { key: 'SHA-256 Log Hash', value: 'f2a8e5c9b1d46904...2b7f' },
        { key: 'ACS Policy Triggered', value: 'CryptoMining Process Detected — ENFORCE mode' },
        { key: 'Approver Identity', value: 'security-ops@company.com (OIDC + MFA verified)' },
        { key: 'RBAC Token Clearance', value: 'ACS:Security:Quarantine — GRANTED (escalated clearance)' },
        { key: 'OTel Trace', value: '#ot-1f8e2b (span closed: 18:22:08 UTC)' },
        { key: 'Compliance Framework', value: 'SOC2 Type II / AI-SEC-CTRL-001 (Critical Security Event)' },
      ],
    },
  },
  {
    id: 5,
    timestamp: 'Jun 05, 09:12:44',
    invocationType: 'Autonomous Pipeline',
    mutationPayload: 'Purge Deadlock Pod Garbage Collection',
    targetScope: 'node: worker-infra-pool-3',
    agentCapability: 'K8s:Node:Triage',
    signee: 'System Engine',
    otelRef: '#ot-6d5c4a',
    chainOfThought: {
      contextPrompt: `## System Context
**Alert:** NodeDiskPressure + PodEvictionFailed (severity: warning)
**Node:** worker-infra-pool-3
**Cluster:** prod-us-east-01

### Node State
\`\`\`json
{
  "node": "worker-infra-pool-3",
  "disk_pressure": true,
  "disk_usage": "93%",
  "eviction_failed_pods": [
    "stale-job-runner-a1b2",
    "dead-batch-worker-x7y8",
    "orphan-init-c9d0"
  ],
  "kubelet_eviction_threshold": "90%"
}
\`\`\`

### Structural Instructions
- Autonomous pod garbage collection authorized under K8s:Node:Triage.
- Identify and purge terminated/failed/deadlock pods from worker-infra-pool-3.
- Verify disk pressure relief post-purge. Target: disk usage < 80%.`,
      sandboxPlan: [
        { step: 1, label: 'Deadlock pod identification', detail: 'Identified 3 deadlock pods: stale-job-runner-a1b2 (Completed/stuck), dead-batch-worker-x7y8 (Failed), orphan-init-c9d0 (Init:Error). Total claimed storage: 14.2 GiB.', status: 'info' },
        { step: 2, label: 'Eviction simulation', detail: 'Simulated pod deletion in sandbox. Projected disk recovery: 14.2 GiB freed. Node disk projection post-purge: 67% usage.', status: 'passed' },
        { step: 3, label: 'Live purge executed', detail: '`kubectl delete pods stale-job-runner-a1b2 dead-batch-worker-x7y8 orphan-init-c9d0 -n default --grace-period=0 --force` on worker-infra-pool-3.', status: 'passed' },
        { step: 4, label: 'Post-purge health check', detail: 'Disk pressure cleared. Node disk: 64%. Kubelet eviction threshold no longer breached. Node status: Ready.', status: 'passed' },
      ],
      auditReceipt: [
        { key: 'SHA-256 Log Hash', value: 'e1d4a9f2c7b36801...5e8a' },
        { key: 'Node Target', value: 'worker-infra-pool-3 (prod-us-east-01)' },
        { key: 'RBAC Token Clearance', value: 'K8s:Node:Triage — GRANTED (policy: sre-autonomy-v2.4)' },
        { key: 'Purged Pods', value: 'stale-job-runner-a1b2, dead-batch-worker-x7y8, orphan-init-c9d0' },
        { key: 'OTel Trace', value: '#ot-6d5c4a (span closed: 09:12:51 UTC)' },
        { key: 'Compliance Framework', value: 'SOC2 Type II / AI-OPS-CTRL-006 (Node Triage)' },
      ],
    },
  },
];

const INVOCATION_TYPES = ['All', 'Autonomous Pipeline', 'Human Approved'] as const;
const AGENT_CAPABILITIES = ['All', 'K8s', 'GitOps', 'ACS'] as const;

// ── Sub-components ─────────────────────────────────────────────────────────────

const MetricCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Card isFullHeight className="ols-ai-hub-audit-metrics-card">
    <CardHeader>
      <CardTitle>
        <Title headingLevel="h3" size="md">{title}</Title>
      </CardTitle>
    </CardHeader>
    <CardBody>{children}</CardBody>
  </Card>
);

const SandboxTimeline: React.FC<{ steps: SandboxStep[] }> = ({ steps }) => (
  <Stack hasGutter>
    {steps.map((step, i) => {
      const isLast = i === steps.length - 1;
      return (
        <StackItem key={step.step}>
          <Flex alignItems={{ default: 'alignItemsFlexStart' }} gap={{ default: 'gapMd' }} flexWrap={{ default: 'nowrap' }}>
            {/* Step number + vertical connector */}
            <FlexItem style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                backgroundColor: step.status === 'passed'
                  ? 'var(--pf-t--color--green--60)'
                  : 'var(--pf-t--global--background--color--secondary--default)',
                border: step.status === 'info' ? '2px solid var(--pf-t--global--border--color--default)' : 'none',
                color: step.status === 'passed' ? '#fff' : 'var(--pf-t--global--text--color--regular)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700,
              }}>
                {step.status === 'passed' ? <CheckCircleIcon style={{ fontSize: '0.9rem' }} /> : step.step}
              </div>
              {!isLast && (
                <div style={{ width: 2, flex: 1, minHeight: 20, backgroundColor: 'var(--pf-t--global--border--color--default)', marginTop: 4 }} />
              )}
            </FlexItem>

            <FlexItem grow={{ default: 'grow' }} style={{ paddingBottom: isLast ? 0 : 'var(--pf-t--global--spacer--sm)' }}>
              <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                <FlexItem>
                  <Content component="p" style={{ fontWeight: 600, marginBottom: 2 }}>{step.label}</Content>
                </FlexItem>
                <FlexItem>
                  <Label
                    color={step.status === 'passed' ? 'green' : 'grey'}
                    icon={step.status === 'passed' ? <CheckCircleIcon /> : <InfoCircleIcon />}
                    isCompact
                  >
                    {step.status === 'passed' ? 'Passed' : 'Info'}
                  </Label>
                </FlexItem>
              </Flex>
              <Content component="p" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '0.875rem', marginTop: 0 }}>
                {step.detail}
              </Content>
            </FlexItem>
          </Flex>
        </StackItem>
      );
    })}
  </Stack>
);

const AuditReceiptGrid: React.FC<{ items: AuditReceiptItem[] }> = ({ items }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: '220px 1fr',
    rowGap: 'var(--pf-t--global--spacer--sm)',
    columnGap: 'var(--pf-t--global--spacer--md)',
  }}>
    {items.map((item) => (
      <React.Fragment key={item.key}>
        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--pf-t--global--text--color--subtle)', paddingTop: 2 }}>
          {item.key}
        </div>
        <div>
          <code style={{ fontSize: '0.82rem', wordBreak: 'break-all', background: 'var(--pf-t--global--background--color--secondary--default)', padding: '2px 6px', borderRadius: 'var(--pf-t--global--border--radius--small)' }}>
            {item.value}
          </code>
        </div>
      </React.Fragment>
    ))}
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────────

export const AIAuditAndLogsTab: React.FC = () => {
  // Filter state
  const [invocationTypeOpen, setInvocationTypeOpen] = useState(false);
  const [invocationTypeFilter, setInvocationTypeFilter] = useState<string>('All');
  const [capabilityOpen, setCapabilityOpen] = useState(false);
  const [capabilityFilter, setCapabilityFilter] = useState<string>('All');
  const [scopeSearch, setScopeSearch] = useState('');

  // Table expand state — multiple rows can be open simultaneously
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  // Per-row active tab
  const [activeTabByRow, setActiveTabByRow] = useState<Record<number, string | number>>({});

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredRows = AUDIT_ROWS.filter((row) => {
    if (invocationTypeFilter !== 'All' && row.invocationType !== invocationTypeFilter) return false;
    if (capabilityFilter !== 'All' && !row.agentCapability.startsWith(capabilityFilter)) return false;
    if (scopeSearch && !row.targetScope.toLowerCase().includes(scopeSearch.toLowerCase())) return false;
    return true;
  });

  return (
    <Stack hasGutter>

      {/* ── 1. ROI Metric Cards ───────────────────────────────────────────────── */}
      <StackItem>
        <Title headingLevel="h2" size="md" style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}>
          Operational Insights
        </Title>
        <Grid hasGutter>

          {/* Card 1: MTTR Deflection */}
          <GridItem span={4}>
            <MetricCard title="MTTR Deflection & Efficiency">
              <Flex gap={{ default: 'gapLg' }} flexWrap={{ default: 'nowrap' }} style={{ alignItems: 'flex-start' }}>

                {/* Left: aggregate metric */}
                <FlexItem style={{ flexShrink: 0 }}>
                  <span
                    className="ols-aio-card-stat-number--readonly"
                    style={{ color: 'var(--pf-t--global--color--status--success--default)' }}
                  >
                    142.5 hrs
                  </span>
                  <Content
                    component="p"
                    style={{
                      marginTop: 'var(--pf-t--global--spacer--xs)',
                      color: 'var(--pf-t--global--text--color--subtle)',
                      fontSize: 'var(--pf-t--global--font--size--body--sm)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Total Cumulative Time Saved
                  </Content>
                </FlexItem>

                {/* Right: velocity gap bars */}
                <FlexItem grow={{ default: 'grow' }} style={{ minWidth: 0 }}>
                  <Stack hasGutter>

                    {/* Row 1 — Manual baseline */}
                    <StackItem>
                      <Flex
                        justifyContent={{ default: 'justifyContentSpaceBetween' }}
                        style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }}
                      >
                        <FlexItem>
                          <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                            Manual SRE Baseline
                          </Content>
                        </FlexItem>
                        <FlexItem>
                          <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                            42.0 min
                          </Content>
                        </FlexItem>
                      </Flex>
                      <div style={{
                        width: '90%',
                        height: 8,
                        borderRadius: 'var(--pf-t--global--border--radius--small)',
                        backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
                      }} />
                    </StackItem>

                    {/* Row 2 — AI execution */}
                    <StackItem>
                      <Flex
                        justifyContent={{ default: 'justifyContentSpaceBetween' }}
                        style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }}
                      >
                        <FlexItem>
                          <Content component="small" style={{ fontWeight: 'var(--pf-t--global--font--weight--body--bold)' as any }}>
                            AI Agent Execution
                          </Content>
                        </FlexItem>
                        <FlexItem>
                          <Content
                            component="small"
                            style={{
                              fontWeight: 'var(--pf-t--global--font--weight--body--bold)' as any,
                              color: 'var(--pf-t--global--color--status--success--default)',
                            }}
                          >
                            0.6 min (36s)
                          </Content>
                        </FlexItem>
                      </Flex>
                      <div style={{
                        width: '3%',
                        height: 8,
                        borderRadius: 'var(--pf-t--global--border--radius--small)',
                        backgroundColor: 'var(--pf-t--global--color--status--success--default)',
                      }} />
                    </StackItem>

                  </Stack>

                  <Content
                    component="small"
                    style={{
                      display: 'block',
                      marginTop: 'var(--pf-t--global--spacer--md)',
                      color: 'var(--pf-t--global--text--color--subtle)',
                      fontStyle: 'italic',
                    }}
                  >
                    *Calculated across 214 automated interventions this month.
                  </Content>
                </FlexItem>

              </Flex>
            </MetricCard>
          </GridItem>

          {/* Card 2: Autonomy Rate */}
          <GridItem span={4}>
            <MetricCard title="Autonomy Rate by Impact">
              <Stack hasGutter>
                <StackItem>
                  <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} style={{ marginBottom: 4 }}>
                    <FlexItem><Content component="small" style={{ fontWeight: 600 }}>Warning Alerts</Content></FlexItem>
                    <FlexItem><Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>Autonomous Resolution</Content></FlexItem>
                  </Flex>
                  <Progress
                    value={94}
                    title="Warning Alerts — Autonomous Resolution"
                    size={ProgressSize.sm}
                    measureLocation={'outside' as any}
                    label="94%"
                  />
                </StackItem>
                <StackItem>
                  <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} style={{ marginBottom: 4 }}>
                    <FlexItem><Content component="small" style={{ fontWeight: 600 }}>Critical Anomalies</Content></FlexItem>
                    <FlexItem><Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>Human-in-the-Loop</Content></FlexItem>
                  </Flex>
                  <Progress
                    value={18}
                    title="Critical Anomalies — Human-in-the-Loop Approval"
                    size={ProgressSize.sm}
                    measureLocation={'outside' as any}
                    label="18%"
                    style={{ '--pf-v6-c-progress__indicator--BackgroundColor': 'var(--pf-t--color--orange--60)' } as React.CSSProperties}
                  />
                </StackItem>
              </Stack>
            </MetricCard>
          </GridItem>

          {/* Card 3: Inference Cost */}
          <GridItem span={4}>
            <MetricCard title="Local Inference Capacity & Budget">
              <span className="ols-aio-card-stat-number--readonly">$342.10</span>
              <Content component="p" style={{ marginTop: 'var(--pf-t--global--spacer--sm)', color: 'var(--pf-t--global--text--color--subtle)', fontSize: 'var(--pf-t--global--font--size--body--sm)' }}>
                Simulated public API cost equivalent saved via local model inferencing
              </Content>
            </MetricCard>
          </GridItem>

        </Grid>
      </StackItem>

      {/* ── 2. Execution Ledger title + Filter Toolbar ───────────────────────── */}
      <StackItem style={{ marginTop: 12 }}>
        <Title headingLevel="h3" size="md" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
          Execution ledger
        </Title>
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          flexWrap={{ default: 'nowrap' }}
          gap={{ default: 'gapSm' }}
        >
          {/* Invocation Type dropdown */}
          <FlexItem>
            <Select
              aria-label="Invocation type filter"
              isOpen={invocationTypeOpen}
              onSelect={(_e, val) => { setInvocationTypeFilter(val as string); setInvocationTypeOpen(false); }}
              onOpenChange={setInvocationTypeOpen}
              toggle={(ref: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={ref}
                  onClick={() => setInvocationTypeOpen((o) => !o)}
                  isExpanded={invocationTypeOpen}
                >
                  {invocationTypeFilter === 'All' ? 'Invocation Type' : invocationTypeFilter}
                </MenuToggle>
              )}
            >
              <SelectList>
                {INVOCATION_TYPES.map((v) => (
                  <SelectOption key={v} value={v} isSelected={invocationTypeFilter === v}>{v}</SelectOption>
                ))}
              </SelectList>
            </Select>
          </FlexItem>

          {/* Target Scope search */}
          <FlexItem>
            <TextInput
              aria-label="Target scope search"
              placeholder="Search target scope / namespace…"
              value={scopeSearch}
              onChange={(_e, val) => setScopeSearch(val)}
              style={{ minWidth: 240 }}
            />
          </FlexItem>

          {/* Agent Capability dropdown */}
          <FlexItem>
            <Select
              aria-label="Agent capability filter"
              isOpen={capabilityOpen}
              onSelect={(_e, val) => { setCapabilityFilter(val as string); setCapabilityOpen(false); }}
              onOpenChange={setCapabilityOpen}
              toggle={(ref: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={ref}
                  onClick={() => setCapabilityOpen((o) => !o)}
                  isExpanded={capabilityOpen}
                >
                  {capabilityFilter === 'All' ? 'Agent Capability' : capabilityFilter}
                </MenuToggle>
              )}
            >
              <SelectList>
                {AGENT_CAPABILITIES.map((v) => (
                  <SelectOption key={v} value={v} isSelected={capabilityFilter === v}>{v}</SelectOption>
                ))}
              </SelectList>
            </Select>
          </FlexItem>

          {/* Export action — inline with filters */}
          <FlexItem>
            <Button variant="link" icon={<DownloadIcon />} iconPosition="start">
              Export SOC2 / AI Compliance Report
            </Button>
          </FlexItem>
        </Flex>
      </StackItem>

      {/* ── 3. Execution Ledger Table ─────────────────────────────────────────── */}
      <StackItem>
        <Table aria-label="Execution ledger" variant="compact">
          <Thead>
            <Tr>
              <Th screenReaderText="Row expand" />
              <Th>Timestamp</Th>
              <Th>Invocation Type</Th>
              <Th>Mutation Payload</Th>
              <Th>Target Scope</Th>
              <Th>Agent Capability</Th>
              <Th>Signee / Approver</Th>
              <Th>OTel Trace Ref</Th>
            </Tr>
          </Thead>

          {filteredRows.map((row, rowIndex) => {
            const isExpanded = expandedRows.has(row.id);
            const activeTab = activeTabByRow[row.id] ?? 0;
            const setActiveTab = (key: string | number) =>
              setActiveTabByRow((prev) => ({ ...prev, [row.id]: key }));

            return (
              <Tbody key={row.id} isExpanded={isExpanded}>
                {/* Primary row */}
                <Tr>
                  <Td
                    expand={{
                      rowIndex,
                      isExpanded,
                      onToggle: () => toggleRow(row.id),
                      expandId: `audit-expand-${row.id}`,
                    }}
                  />
                  <Td dataLabel="Timestamp" style={{ whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {row.timestamp}
                  </Td>
                  <Td dataLabel="Invocation Type">
                    <Label
                      color={row.invocationType === 'Autonomous Pipeline' ? 'blue' : 'green'}
                      isCompact
                    >
                      {row.invocationType}
                    </Label>
                  </Td>
                  <Td dataLabel="Mutation Payload">{row.mutationPayload}</Td>
                  <Td dataLabel="Target Scope">
                    <code style={{ fontSize: '0.8rem', background: 'var(--pf-t--global--background--color--secondary--default)', padding: '1px 5px', borderRadius: 'var(--pf-t--global--border--radius--small)' }}>
                      {row.targetScope}
                    </code>
                  </Td>
                  <Td dataLabel="Agent Capability">
                    <Label color="purple" isCompact variant="outline">{row.agentCapability}</Label>
                  </Td>
                  <Td dataLabel="Signee / Approver" style={{ fontSize: '0.85rem' }}>
                    {row.signee === 'System Engine'
                      ? <Label color="grey" isCompact>{row.signee}</Label>
                      : <span style={{ fontFamily: 'monospace' }}>{row.signee}</span>
                    }
                  </Td>
                  <Td dataLabel="OTel Trace Ref">
                    <Button variant="link" isInline style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {row.otelRef}
                    </Button>
                  </Td>
                </Tr>

                {/* ── 4. Expandable Chain of Thought ─────────────────────────── */}
                <Tr isExpanded={isExpanded}>
                  <Td colSpan={8} noPadding>
                    <ExpandableRowContent>
                      <div style={{
                        padding: '16px 24px 20px 56px',
                        backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
                        borderTop: '1px solid var(--pf-t--global--border--color--default)',
                      }}>
                        <Tabs
                          activeKey={activeTab}
                          onSelect={(_e, key) => setActiveTab(key)}
                          aria-label={`Chain of thought for audit entry ${row.otelRef}`}
                        >
                          {/* Tab 1: Context & Prompt */}
                          <Tab
                            eventKey={0}
                            title={<TabTitleText>🧠 Context &amp; Prompt</TabTitleText>}
                            aria-label="Context and Prompt"
                          >
                            <div style={{ paddingTop: 'var(--pf-t--global--spacer--md)' }}>
                              <Content component="p" style={{ fontSize: '0.8rem', color: 'var(--pf-t--global--text--color--subtle)', marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                                Read-only system context and prompt payload sent to the LLM inference layer.
                              </Content>
                              <ClipboardCopy
                                isReadOnly
                                isExpanded
                                variant={ClipboardCopyVariant.expansion}
                                style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}
                              >
                                {row.chainOfThought.contextPrompt}
                              </ClipboardCopy>
                            </div>
                          </Tab>

                          {/* Tab 2: Execution Sandbox Plan */}
                          <Tab
                            eventKey={1}
                            title={<TabTitleText>🛠️ Execution Sandbox Plan</TabTitleText>}
                            aria-label="Execution Sandbox Plan"
                          >
                            <div style={{ paddingTop: 'var(--pf-t--global--spacer--md)' }}>
                              <Content component="p" style={{ fontSize: '0.8rem', color: 'var(--pf-t--global--text--color--subtle)', marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                                Chronological internal verification trace. Sandbox simulation precedes every live mutation.
                              </Content>
                              <SandboxTimeline steps={row.chainOfThought.sandboxPlan} />
                            </div>
                          </Tab>

                          {/* Tab 3: Cryptographic Audit Receipt */}
                          <Tab
                            eventKey={2}
                            title={<TabTitleText>📄 Cryptographic Audit Receipt</TabTitleText>}
                            aria-label="Cryptographic Audit Receipt"
                          >
                            <div style={{ paddingTop: 'var(--pf-t--global--spacer--md)' }}>
                              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                                <FlexItem>
                                  <Label color="green" icon={<CheckCircleIcon />} isCompact>
                                    Immutable — sealed at execution time
                                  </Label>
                                </FlexItem>
                                <FlexItem>
                                  <Label color="blue" isCompact variant="outline">
                                    {row.chainOfThought.auditReceipt.find((i) => i.key === 'Compliance Framework')?.value ?? ''}
                                  </Label>
                                </FlexItem>
                              </Flex>
                              <AuditReceiptGrid items={row.chainOfThought.auditReceipt} />
                            </div>
                          </Tab>
                        </Tabs>
                      </div>
                    </ExpandableRowContent>
                  </Td>
                </Tr>
              </Tbody>
            );
          })}
        </Table>
      </StackItem>

    </Stack>
  );
};

import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Flex,
  FlexItem,
  Label,
  Pagination,
  PaginationVariant,
  ProgressStep,
  ProgressStepper,
  Spinner,
  Stack,
  StackItem,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import { LockIcon, TimesIcon } from '@patternfly/react-icons';
import { ExpandableRowContent, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { AI_EXPERIENCE_ICON_DATA_URL } from '../../components/autonomousAiObserve/aiExperienceIconUrl';

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

// ─── Drawer: Progress stepper step states ────────────────────────────────────

interface StepStates {
  step1Variant: 'success';
  step2Variant: 'success' | 'info';
  step2Current: boolean;
  step3Variant: 'success' | 'info';
  step3Current: boolean;
  step3Description: React.ReactNode;
}

const getStepStates = (status: PlanStatus): StepStates => {
  if (status === 'Investigating') {
    return {
      step1Variant: 'success',
      step2Variant: 'success',
      step2Current: false,
      step3Variant: 'info',
      step3Current: true,
      step3Description: (
        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
          <FlexItem><Spinner size="sm" aria-label="Assembling remediation choices" /></FlexItem>
          <FlexItem>Assembling choices...</FlexItem>
        </Flex>
      ),
    };
  }
  return {
    step1Variant: 'success',
    step2Variant: 'success',
    step2Current: false,
    step3Variant: 'success',
    step3Current: false,
    step3Description: '2 remediation paths identified',
  };
};

// ─── Drawer: Remediation option cards ────────────────────────────────────────

const RemediationOption1: React.FC<{ plan: PlanRow }> = ({ plan }) => {
  const canApprove = plan.status === 'Waiting Approval' && !plan.isUnauthorized;
  const rbacLabel = plan.isUnauthorized
    ? <Label color="red" isCompact variant="outline"><LockIcon /> Unauthorized</Label>
    : <Label color="green" isCompact variant="outline">Authorized</Label>;

  return (
    <Card
      isCompact
      style={{
        borderLeft: '3px solid var(--pf-t--global--color--status--info--default)',
        backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
      }}
    >
      <CardHeader>
        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
          <FlexItem><AiIcon size={14} /></FlexItem>
          <FlexItem>
            <Label color="blue" isCompact>AI recommended</Label>
          </FlexItem>
          <FlexItem>
            <CardTitle>Primary automated fix</CardTitle>
          </FlexItem>
        </Flex>
      </CardHeader>
      <CardBody>
        <DescriptionList isCompact isHorizontal columnModifier={{ default: '1Col' }}>
          <DescriptionListGroup>
            <DescriptionListTerm>Risk</DescriptionListTerm>
            <DescriptionListDescription>
              <Label color="green" isCompact variant="outline">Low risk</Label>
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Reversibility</DescriptionListTerm>
            <DescriptionListDescription>
              1-click rollback enabled (GitOps sync-back)
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>RBAC validation</DescriptionListTerm>
            <DescriptionListDescription>{rbacLabel}</DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>

        <div style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
          {plan.isUnauthorized ? (
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
          ) : (
            <Button variant="primary" isDisabled={!canApprove}>
              Approve &amp; execute
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

const RemediationOption2: React.FC = () => (
  <Card
    isCompact
    style={{
      borderLeft: '3px solid var(--pf-t--global--border--color--default)',
      backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
    }}
  >
    <CardHeader>
      <Label color="grey" isCompact>Manual fallback</Label>
      <span style={{ marginLeft: 'var(--pf-t--global--spacer--sm)' }}>
        <CardTitle>Manual workaround script</CardTitle>
      </span>
    </CardHeader>
    <CardBody>
      <DescriptionList isCompact isHorizontal columnModifier={{ default: '1Col' }}>
        <DescriptionListGroup>
          <DescriptionListTerm>Risk</DescriptionListTerm>
          <DescriptionListDescription>
            <Label color="orange" isCompact variant="outline">Medium risk</Label>
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Reversibility</DescriptionListTerm>
          <DescriptionListDescription>
            Manual rollback required (git commit rebase)
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>RBAC validation</DescriptionListTerm>
          <DescriptionListDescription>
            <Label color="red" isCompact variant="outline"><LockIcon /> Unauthorized</Label>
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>

      <div style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
        <Tooltip
          content="This action requires cluster-admin or operator-lifecycle-manager permissions."
          position="top"
        >
          <span style={{ display: 'inline-block', cursor: 'not-allowed' }}>
            <Button variant="secondary" isDisabled style={{ pointerEvents: 'none' }}>
              Insufficient privileges&nbsp;<LockIcon style={{ verticalAlign: 'middle' }} />
            </Button>
          </span>
        </Tooltip>
      </div>
    </CardBody>
  </Card>
);

// ─── Drawer: Post-mortem summary (Completed | Failed) ────────────────────────

const POST_MORTEM_TIMESTAMPS: Record<string, string> = {
  tp5: '2026-06-04T07:14:31Z',
  ap6: '2026-06-04T08:02:55Z',
  ap10: '2026-06-04T06:47:12Z',
  ap14: '2026-06-03T22:31:09Z',
  ap5: '2026-06-04T06:52:17Z',
};

const PostMortemSummary: React.FC<{ plan: PlanRow }> = ({ plan }) => {
  const isCompleted = plan.status === 'Completed';
  const timestamp = POST_MORTEM_TIMESTAMPS[plan.id] ?? '2026-06-04T05:00:00Z';

  return (
    <Card
      isCompact
      style={{
        borderLeft: `3px solid var(--pf-t--global--color--status--${isCompleted ? 'success' : 'danger'}--default)`,
      }}
    >
      <CardHeader>
        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
          <FlexItem>
            <Label color={isCompleted ? 'green' : 'red'} isCompact>
              {isCompleted ? 'Execution completed' : 'Execution failed'}
            </Label>
          </FlexItem>
          <FlexItem>
            <CardTitle>Post-mortem summary</CardTitle>
          </FlexItem>
        </Flex>
      </CardHeader>
      <CardBody>
        <DescriptionList isCompact isHorizontal columnModifier={{ default: '1Col' }}>
          <DescriptionListGroup>
            <DescriptionListTerm>Timestamp</DescriptionListTerm>
            <DescriptionListDescription>
              <code style={{ fontSize: '12px' }}>{timestamp}</code>
            </DescriptionListDescription>
          </DescriptionListGroup>
          {isCompleted ? (
            <DescriptionListGroup>
              <DescriptionListTerm>Outcome</DescriptionListTerm>
              <DescriptionListDescription>
                All affected {plan.blastRadius} resources returned to a healthy state. GitOps sync confirmed.
              </DescriptionListDescription>
            </DescriptionListGroup>
          ) : (
            <DescriptionListGroup>
              <DescriptionListTerm>Error trace</DescriptionListTerm>
              <DescriptionListDescription>
                <code
                  style={{
                    fontSize: '12px',
                    color: 'var(--pf-t--global--color--status--danger--default)',
                    display: 'block',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  ERR_REMEDIATION_ROLLBACK_CONFLICT: Replica set scaling timeout after 300s.
                  Cluster state unchanged. No resources were modified.
                </code>
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

// ─── Drawer: Remediation Blueprint panel body ─────────────────────────────────

const RemediationBlueprintPanel: React.FC<{ plan: PlanRow }> = ({ plan }) => {
  const isTerminal = plan.status === 'Completed' || plan.status === 'Failed';
  const stepStates = getStepStates(plan.status);

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

      {/* ── Section B: Diagnostic Lifecycle Flow ──────────────────────── */}
      <StackItem>
        <Title headingLevel="h4" size="md" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
          Remediation Blueprint
        </Title>
        <ProgressStepper isVertical aria-label="Remediation lifecycle steps">
          <ProgressStep
            variant={stepStates.step1Variant}
            id="step-ingestion"
            titleId="step-ingestion-title"
            aria-label="Ingestion and Correlation: complete"
            description={`Ingested ${plan.consolidationScope} from ${plan.triggerDomains}`}
          >
            Ingestion &amp; Correlation
          </ProgressStep>

          <ProgressStep
            variant={stepStates.step2Variant}
            isCurrent={stepStates.step2Current}
            id="step-rca"
            titleId="step-rca-title"
            aria-label="Root-Cause Isolation: complete"
            description={`Root cause isolated across ${plan.blastRadius}`}
          >
            Root-Cause Isolation
          </ProgressStep>

          <ProgressStep
            variant={stepStates.step3Variant}
            isCurrent={stepStates.step3Current}
            id="step-options"
            titleId="step-options-title"
            aria-label={
              stepStates.step3Current
                ? 'Option Matrix Synthesis: in progress'
                : 'Option Matrix Synthesis: complete'
            }
            description={stepStates.step3Description}
          >
            Option Matrix Synthesis
          </ProgressStep>
        </ProgressStepper>
      </StackItem>

      <Divider />

      {/* ── Section C: Remediation Options or Post-mortem ─────────────── */}
      <StackItem>
        {isTerminal ? (
          <>
            <Title headingLevel="h4" size="md" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
              Execution summary
            </Title>
            <PostMortemSummary plan={plan} />
          </>
        ) : (
          <>
            <Title headingLevel="h4" size="md" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
              Available remediation options
            </Title>
            <Stack hasGutter>
              <StackItem>
                <RemediationOption1 plan={plan} />
              </StackItem>
              <StackItem>
                <RemediationOption2 />
              </StackItem>
            </Stack>
          </>
        )}
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

const RemediationSidePanel: React.FC<{ plan: PlanRow; onClose: () => void }> = ({
  plan,
  onClose,
}) => {
  const panelTop = usePanelTop();

  return (
    <>
      {/* Transparent hit-target scrim — click outside to close.
          z-index 149 keeps it below the panel (150) and below the
          masthead (300) / sidebar (200). */}
      <div
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, zIndex: 149 }}
        onClick={onClose}
      />

      {/* Panel shell */}
      <div
        role="complementary"
        aria-label={`Remediation Blueprint: ${plan.synopsis}`}
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
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.12)',
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
  const [selectedPlan, setSelectedPlan] = useState<PlanRow | null>(null);

  const handleReviewPlan = useCallback((plan: PlanRow) => {
    setSelectedPlan(plan);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedPlan(null);
  }, []);

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
          <TopPlansTable onReviewPlan={handleReviewPlan} />
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
          <AllPlansTable onReviewPlan={handleReviewPlan} />
        </StackItem>
      </Stack>

      {/* Fixed-position side panel — rendered above all page chrome */}
      {selectedPlan && (
        <RemediationSidePanel plan={selectedPlan} onClose={handleClosePanel} />
      )}
    </>
  );
};

import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Flex,
  FlexItem,
  Label,
  Pagination,
  PaginationVariant,
  Stack,
  StackItem,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import { LockIcon } from '@patternfly/react-icons';
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

const ActionCell: React.FC<{ status: PlanStatus; isUnauthorized: boolean }> = ({
  status,
  isUnauthorized,
}) => {
  if (status === 'Investigating' || status === 'Remediating') {
    return (
      <Button variant="secondary" size="sm">Review plan</Button>
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
            >
              View details&nbsp;<LockIcon style={{ verticalAlign: 'middle' }} />
            </Button>
          </span>
        </Tooltip>
      );
    }
    return (
      <Button variant="secondary" size="sm">
        Review plan
      </Button>
    );
  }

  // Completed | Failed
  return (
    <Button variant="link" isInline>
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
//
// Both TopPlansTable and AllPlansTable render PlansTableCore.
// Each Tbody wraps one main row + one expandable detail row — PF's standard
// one-Tbody-per-row expandable pattern.

interface PlansTableCoreProps {
  rows: PlanRow[];
  ariaLabel: string;
  startIndex: number;
  expandedRows: Set<string>;
  onToggle: (id: string) => void;
}

const PlansTableCore: React.FC<PlansTableCoreProps> = ({
  rows,
  ariaLabel,
  startIndex,
  expandedRows,
  onToggle,
}) => (
  <Table aria-label={ariaLabel} style={{ tableLayout: 'fixed', width: '100%' }}>
    <Thead>
      <Tr>
        {/* Expand toggle column — no visible header */}
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
          <Tr>
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
              <ActionCell status={row.status} isUnauthorized={row.isUnauthorized} />
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

const TopPlansTable: React.FC = () => {
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
    />
  );
};

// ─── All plans table (pagination + own expand state) ─────────────────────────

const DEFAULT_PER_PAGE = 10;

const AllPlansTable: React.FC = () => {
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

// ─── Exported tab content ─────────────────────────────────────────────────────

export const PlansAndApprovalsTab: React.FC = () => (
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
      <TopPlansTable />
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
      <AllPlansTable />
    </StackItem>
  </Stack>
);

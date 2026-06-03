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
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { AI_EXPERIENCE_ICON_DATA_URL } from '../../components/autonomousAiObserve/aiExperienceIconUrl';

// ─── Types ────────────────────────────────────────────────────────────────────

type PlanSeverity = 'critical' | 'warning';

interface PlanRow {
  id: string;
  severity: PlanSeverity;
  /** AI-synthesised 0-100 impact score. */
  score: number;
  /** Short human-readable plan description (AI-synthesised). */
  synopsis: string;
  /** Objective telemetry summary, e.g. "42 Alerts". */
  consolidationScope: string;
  /** Infrastructure footprint, e.g. "3 Clusters". */
  blastRadius: string;
  /** Platform origin(s), e.g. "OCP / Network". */
  triggerDomains: string;
}

// ─── Dataset — Top plans (score ≥ 80) ────────────────────────────────────────

const TOP_PLANS: PlanRow[] = [
  {
    id: 'p1',
    severity: 'critical',
    score: 94,
    synopsis: 'Remediate CVE-2026-1922',
    consolidationScope: '12 Nodes',
    blastRadius: '4 Fleets',
    triggerDomains: 'Security (ACS)',
  },
  {
    id: 'p2',
    severity: 'critical',
    score: 88,
    synopsis: 'Fix Core Ingress Mesh',
    consolidationScope: '42 Alerts',
    blastRadius: '3 Clusters',
    triggerDomains: 'OCP / Network',
  },
  {
    id: 'p3',
    severity: 'critical',
    score: 87,
    synopsis: 'Resolve etcd disk saturation',
    consolidationScope: '3 Masters',
    blastRadius: '2 Clusters',
    triggerDomains: 'OCP / etcd',
  },
  {
    id: 'p4',
    severity: 'critical',
    score: 82,
    synopsis: 'Patch Tekton Pipeline',
    consolidationScope: '2 Blocks',
    blastRadius: '1 Cluster',
    triggerDomains: 'Pipelines / ACS',
  },
  {
    id: 'p5',
    severity: 'critical',
    score: 81,
    synopsis: 'Restore API server availability',
    consolidationScope: '18 Alerts',
    blastRadius: '1 Cluster',
    triggerDomains: 'OCP Core',
  },
];

// ─── Dataset — All plans (score < 80) ────────────────────────────────────────

const ALL_PLANS: PlanRow[] = [
  {
    id: 'p6',
    severity: 'warning',
    score: 71,
    synopsis: 'Rotate IAM certs early',
    consolidationScope: '1 Warning',
    blastRadius: '1 Cluster',
    triggerDomains: 'OCP Auth',
  },
  {
    id: 'p7',
    severity: 'warning',
    score: 68,
    synopsis: 'Scale Prometheus storage',
    consolidationScope: '1 Warning',
    blastRadius: '1 Cluster',
    triggerDomains: 'Monitoring',
  },
  {
    id: 'p8',
    severity: 'warning',
    score: 63,
    synopsis: 'Update node kernel patches',
    consolidationScope: '5 Nodes',
    blastRadius: '1 Cluster',
    triggerDomains: 'OCP Infra',
  },
  {
    id: 'p9',
    severity: 'warning',
    score: 57,
    synopsis: 'Reduce noisy alert rules',
    consolidationScope: '22 Alerts',
    blastRadius: '3 Clusters',
    triggerDomains: 'Alerting',
  },
  {
    id: 'p10',
    severity: 'warning',
    score: 55,
    synopsis: 'Remediate ACS policy violations',
    consolidationScope: '6 Violations',
    blastRadius: '2 Clusters',
    triggerDomains: 'Security (ACS)',
  },
  {
    id: 'p11',
    severity: 'warning',
    score: 52,
    synopsis: 'Tune HPA thresholds',
    consolidationScope: '4 Alerts',
    blastRadius: '2 Clusters',
    triggerDomains: 'OCP Optimize',
  },
  {
    id: 'p12',
    severity: 'warning',
    score: 49,
    synopsis: 'Flush stale ConfigMaps',
    consolidationScope: '8 ConfigMaps',
    blastRadius: '1 Cluster',
    triggerDomains: 'OCP Core',
  },
  {
    id: 'p13',
    severity: 'warning',
    score: 46,
    synopsis: 'Adjust microservice resource limits',
    consolidationScope: '3 Alerts',
    blastRadius: '2 Clusters',
    triggerDomains: 'OCP Optimize',
  },
  {
    id: 'p14',
    severity: 'warning',
    score: 44,
    synopsis: 'Resize PV claims in monitoring ns',
    consolidationScope: '1 Warning',
    blastRadius: '1 Cluster',
    triggerDomains: 'Monitoring',
  },
  {
    id: 'p15',
    severity: 'warning',
    score: 41,
    synopsis: 'Archive old audit logs',
    consolidationScope: '1 Warning',
    blastRadius: '1 Cluster',
    triggerDomains: 'OCP Auth',
  },
  {
    id: 'p16',
    severity: 'warning',
    score: 38,
    synopsis: 'Clean orphaned service accounts',
    consolidationScope: '12 SA objects',
    blastRadius: '2 Clusters',
    triggerDomains: 'OCP Security',
  },
  {
    id: 'p17',
    severity: 'warning',
    score: 35,
    synopsis: 'Remove deprecated API routes',
    consolidationScope: '3 Alerts',
    blastRadius: '1 Cluster',
    triggerDomains: 'OCP API',
  },
  {
    id: 'p18',
    severity: 'warning',
    score: 29,
    synopsis: 'Compact etcd history',
    consolidationScope: '1 Warning',
    blastRadius: '1 Cluster',
    triggerDomains: 'OCP / etcd',
  },
  {
    id: 'p19',
    severity: 'warning',
    score: 22,
    synopsis: 'Rebalance node affinity rules',
    consolidationScope: '2 Alerts',
    blastRadius: '1 Cluster',
    triggerDomains: 'OCP Scheduling',
  },
  {
    id: 'p20',
    severity: 'warning',
    score: 15,
    synopsis: 'Verify backup job completion',
    consolidationScope: '1 Warning',
    blastRadius: '1 Cluster',
    triggerDomains: 'OCP Infra',
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
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        verticalAlign: 'middle',
        cursor: 'help',
        marginLeft: '3px',
        flexShrink: 0,
      }}
    >
      <img
        src={AI_EXPERIENCE_ICON_DATA_URL}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        style={{ display: 'block' }}
      />
    </span>
  </Tooltip>
);

// ─── Severity & score badges ──────────────────────────────────────────────────

const SeverityBadge: React.FC<{ severity: PlanSeverity }> = ({ severity }) =>
  severity === 'critical' ? (
    <Label color="red" isCompact>
      Critical
    </Label>
  ) : (
    <Label color="yellow" isCompact>
      Warning
    </Label>
  );

// ─── Shared table ─────────────────────────────────────────────────────────────

const SCOPE_STYLE: React.CSSProperties = {
  color: 'var(--pf-t--global--text--color--regular)',
  fontWeight: 400,
};

const PlansTable: React.FC<{ rows: PlanRow[]; ariaLabel: string }> = ({ rows, ariaLabel }) => (
  <Table aria-label={ariaLabel} style={{ tableLayout: 'fixed', width: '100%' }}>
    <Thead>
      <Tr>
        <Th style={{ width: '8%' }}>Sev</Th>
        <Th style={{ width: '34%' }}>
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            gap={{ default: 'gapXs' }}
            flexWrap={{ default: 'nowrap' }}
          >
            <FlexItem>Plan synopsis</FlexItem>
            <FlexItem>
              <AiSparkle />
            </FlexItem>
          </Flex>
        </Th>
        <Th style={{ width: '18%' }}>Consolidation scope</Th>
        <Th style={{ width: '14%' }}>Blast radius</Th>
        <Th style={{ width: '16%' }}>Trigger domains</Th>
        <Th style={{ width: '10%' }}>Action</Th>
      </Tr>
    </Thead>
    <Tbody>
      {rows.map((row) => (
        <Tr key={row.id}>
          <Td dataLabel="Sev">
            <SeverityBadge severity={row.severity} />
          </Td>

          <Td dataLabel="Plan synopsis" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              gap={{ default: 'gapSm' }}
              flexWrap={{ default: 'nowrap' }}
            >
              <FlexItem>
                <span style={{ fontWeight: 600, color: 'var(--pf-t--global--text--color--subtle)' }}>
                  {row.score}
                </span>
              </FlexItem>
              <FlexItem style={{ flex: '1 1 auto', minWidth: 0 }}>{row.synopsis}</FlexItem>
              <FlexItem>
                <AiSparkle />
              </FlexItem>
            </Flex>
          </Td>

          <Td dataLabel="Consolidation scope">
            <span style={SCOPE_STYLE}>{row.consolidationScope}</span>
          </Td>

          <Td dataLabel="Blast radius">{row.blastRadius}</Td>

          <Td dataLabel="Trigger domains">{row.triggerDomains}</Td>

          <Td dataLabel="Action">
            <Button variant="secondary" size="sm">
              Review
            </Button>
          </Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
);

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

// ─── All plans table with pagination ─────────────────────────────────────────

const DEFAULT_PER_PAGE = 10;

const AllPlansTable: React.FC = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);

  const totalItems = ALL_PLANS.length;
  const start = (page - 1) * perPage;
  const paginatedRows = ALL_PLANS.slice(start, start + perPage);

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

  // Guard: if perPage changes, make sure current page doesn't overflow.
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
      <PlansTable rows={paginatedRows} ariaLabel="All plans" />
      <Pagination
        {...paginationProps}
        variant={PaginationVariant.bottom}
        style={{ marginTop: 'var(--pf-t--global--spacer--xs)' }}
      />
    </>
  );
};

// ─── Exported tab content ─────────────────────────────────────────────────────

export const PlansAndApprovalsTab: React.FC = () => (
  <Stack hasGutter>
    <StackItem>
      <SectionHeader
        title="Top plans | Attention required"
        threshold={
          <Label color="blue" isCompact>
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              gap={{ default: 'gapXs' }}
              flexWrap={{ default: 'nowrap' }}
            >
              <FlexItem>Impact score</FlexItem>
              <FlexItem><AiSparkle size={12} /></FlexItem>
              <FlexItem>&ge;&nbsp;80</FlexItem>
            </Flex>
          </Label>
        }
      />
      <PlansTable rows={TOP_PLANS} ariaLabel="Top plans requiring attention" />
    </StackItem>

    <StackItem>
      <SectionHeader
        title="All plans"
        threshold={
          <Label color="blue" isCompact>
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              gap={{ default: 'gapXs' }}
              flexWrap={{ default: 'nowrap' }}
            >
              <FlexItem>Impact score</FlexItem>
              <FlexItem><AiSparkle size={12} /></FlexItem>
              <FlexItem>&lt;&nbsp;80</FlexItem>
            </Flex>
          </Label>
        }
      />
      <AllPlansTable />
    </StackItem>
  </Stack>
);

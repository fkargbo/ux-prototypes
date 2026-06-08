import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Flex,
  FlexItem,
  Pagination,
  PaginationVariant,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { AI_EXPERIENCE_ICON_DATA_URL } from '../../components/autonomousAiObserve/aiExperienceIconUrl';
import type { ClusterHealth } from '../../components/autonomousAiObserve/data';
import {
  ALERTS,
  CLUSTERS,
  fleetWideCriticalAddsForCluster,
} from '../../components/autonomousAiObserve/data';
import { derivePlanCount } from './fleetInventoryData';

// ─── Types ────────────────────────────────────────────────────────────────────

// Re-use the existing ClusterHealth union so types stay in sync with data.ts.
type HealthStatus = ClusterHealth;

export interface FleetPlanRow {
  id: string;
  clusterName: string;
  status: HealthStatus;
  planCount: number;
  /** Concise signal count string, e.g. "14 alerts". */
  signals: string;
  /** Combined "region / provider" label, e.g. "us-east-1 / AWS". */
  regionProvider: string;
  version: string;
}

export interface ClusterPlanRow {
  id: string;
  projectName: string;
  status: HealthStatus;
  planCount: number;
  signals: string;
  resourceSaturation: { level: HealthStatus; text: string };
  totalPods: string;
}

export interface ActivePlansTableProps {
  scope: 'fleet' | 'cluster';
  /** Called when the user clicks an "N plans" link. Wire to router later. */
  onPlanRoute?: (rowId: string) => void;
  /** Called when the cluster name link is clicked (fleet scope). */
  onClusterClick?: (clusterId: string) => void;
  /** Called when the "View alerts" header action is clicked. */
  onViewAlerts?: () => void;
}

// ─── Derived fleet data from existing simulation ──────────────────────────────

/** Alert count for a cluster — mirrors the logic in AutonomousAiObserveWidgetV3. */
function clusterAlertCount(clusterId: string): number {
  return (
    ALERTS.filter((a) => a.clusterId === clusterId).length +
    fleetWideCriticalAddsForCluster(clusterId)
  );
}

/**
 * Multi-domain signal breakdown for the Plan's Input pillar.
 * Signals are split across Prometheus alerts, ACS security violations, GitOps drift,
 * and pipeline blocks to reflect real-world multi-domain telemetry correlation.
 * Secondary signal types are varied deterministically by cluster ID.
 */
function buildSignalsText(clusterId: string, alertCount: number, health: ClusterHealth): string {
  if (health === 'healthy' || alertCount === 0) return '0 signals';

  // Deterministic variation so each cluster shows different secondary signal types.
  const hash = clusterId.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);

  if (health === 'critical') {
    const acsViol = Math.max(1, Math.round(alertCount * 0.12));
    switch (hash % 3) {
      case 0: return `${alertCount} alerts, ${acsViol} ACS viol., 2 GitOps drift`;
      case 1: return `${alertCount} alerts, ${acsViol} ACS viol., 1 pipeline block`;
      default: return `${alertCount} alerts, 2 GitOps drift, 1 pipeline block`;
    }
  }

  // degraded — single secondary domain
  return hash % 2 === 0
    ? `${alertCount} alerts, 1 ACS viol.`
    : `${alertCount} alerts, 1 pipeline block`;
}

function buildFleetRows(): FleetPlanRow[] {
  return CLUSTERS.map((c) => {
    const alertAmount = clusterAlertCount(c.id);
    return {
      id: c.id,
      clusterName: c.name,
      status: c.health,
      planCount: derivePlanCount(c),
      signals: buildSignalsText(c.id, alertAmount, c.health),
      regionProvider: `${c.region} / ${c.provider}`,
      version: c.version,
    };
  });
}

// ─── Cluster-scope mock data (namespace/project level — no equivalent in data.ts) ─

const CLUSTER_ROWS: ClusterPlanRow[] = [
  {
    id: 'payment-gateway',
    projectName: 'payment-gateway',
    status: 'critical',
    planCount: 3,
    signals: '42 alerts, 2 Blocks',
    resourceSaturation: { level: 'critical', text: '98% Mem (Quota)' },
    totalPods: '24 / 24',
  },
  {
    id: 'user-auth',
    projectName: 'user-auth',
    status: 'degraded',
    planCount: 1,
    signals: '12 alerts, 1 ACS Viol.',
    resourceSaturation: { level: 'degraded', text: '84% CPU' },
    totalPods: '12 / 12',
  },
  {
    id: 'frontend-assets',
    projectName: 'frontend-assets',
    status: 'healthy',
    planCount: 0,
    signals: '0 signals',
    resourceSaturation: { level: 'healthy', text: '32% Mem' },
    totalPods: '4 / 4',
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const AI_PLANS_TOOLTIP =
  'The data metrics in this field combine deterministic telemetry (raw event counts) with AI-synthesized inference.';

const STATUS_COLOR: Record<HealthStatus, string> = {
  critical: 'var(--pf-t--global--color--status--danger--default)',
  degraded:  'var(--pf-t--global--color--status--warning--default)',
  healthy:   'var(--pf-t--global--color--status--success--default)',
};

const STATUS_LABEL: Record<HealthStatus, string> = {
  critical: 'Critical',
  degraded:  'Warning',
  healthy:   'Healthy',
};

const STATUS_RANK: Record<HealthStatus, number> = { critical: 0, degraded: 1, healthy: 2 };

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusCell: React.FC<{ status: HealthStatus }> = ({ status }) => {
  const icon =
    status === 'critical' ? <ExclamationCircleIcon /> :
    status === 'degraded'  ? <ExclamationTriangleIcon /> :
                             <CheckCircleIcon />;
  return (
    <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
      <span className="ols-aio-metric-kpi-stat-icon" aria-hidden="true" style={{ color: STATUS_COLOR[status] }}>
        {icon}
      </span>
      <span>{STATUS_LABEL[status]}</span>
    </Flex>
  );
};

const AiDisclosureIcon: React.FC = () => (
  <Tooltip content={AI_PLANS_TOOLTIP} position="top">
    <span
      tabIndex={0}
      role="img"
      aria-label="AI-synthesized metric"
      style={{ display: 'inline-flex', alignItems: 'center', cursor: 'help' }}
    >
      <img src={AI_EXPERIENCE_ICON_DATA_URL} alt="" aria-hidden="true" width={14} height={14} style={{ display: 'block', flexShrink: 0 }} />
    </span>
  </Tooltip>
);

const ActivePlansHeader: React.FC = () => (
  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }} style={{ flexWrap: 'nowrap' }}>
    <FlexItem><AiDisclosureIcon /></FlexItem>
    <FlexItem>Active plans (Signals)</FlexItem>
  </Flex>
);

const ActivePlansCell: React.FC<{
  rowId: string;
  planCount: number;
  signals: string;
  onPlanRoute?: (rowId: string) => void;
}> = ({ rowId, planCount, signals, onPlanRoute }) => (
  <span>
    {planCount > 0 ? (
      <Button
        variant="link"
        isInline
        onClick={(e) => { e.stopPropagation(); onPlanRoute?.(rowId); }}
        aria-label={`View ${planCount} active plan${planCount !== 1 ? 's' : ''} for ${rowId}`}
        style={{ fontWeight: 'var(--pf-t--global--font--weight--body--bold)' }}
      >
        {planCount} {planCount !== 1 ? 'plans' : 'plan'}
      </Button>
    ) : (
      <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>0 plans</span>
    )}{' '}
    <span style={{
      fontWeight: 'var(--pf-t--global--font--weight--body--default)',
      color: 'var(--pf-t--global--text--color--subtle)',
      fontSize: 'var(--pf-t--global--font--size--body--sm)',
    }}>
      ({signals})
    </span>
  </span>
);

const SaturationCell: React.FC<{ level: HealthStatus; text: string }> = ({ level, text }) => {
  const icon =
    level === 'critical' ? <ExclamationCircleIcon /> :
    level === 'degraded'  ? <ExclamationTriangleIcon /> :
                            <CheckCircleIcon />;
  return (
    <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }}>
      <span className="ols-aio-metric-kpi-stat-icon" aria-hidden="true" style={{ color: STATUS_COLOR[level] }}>
        {icon}
      </span>
      <span>{text}</span>
    </Flex>
  );
};

const TableTitle: React.FC<{ scope: 'fleet' | 'cluster' }> = ({ scope }) => (
  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
    <FlexItem>
      <Tooltip content={AI_PLANS_TOOLTIP} position="top">
        <span tabIndex={0} role="img" aria-label="AI-synthesized metric" style={{ display: 'inline-flex', alignItems: 'center', cursor: 'help' }}>
          <img src={AI_EXPERIENCE_ICON_DATA_URL} alt="" aria-hidden="true" width={16} height={16} style={{ display: 'block' }} />
        </span>
      </Tooltip>
    </FlexItem>
    <FlexItem>
      <Title headingLevel="h3" size="lg" className="ols-aio-fleet-subcard-title">
        {scope === 'fleet' ? 'Cluster status & active plans' : 'Project status & active plans'}
      </Title>
    </FlexItem>
  </Flex>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const ActivePlansTable: React.FC<ActivePlansTableProps> = ({
  scope,
  onPlanRoute,
  onClusterClick,
  onViewAlerts,
}) => {
  const [sortBy, setSortBy] = useState<{ index: number; direction: 'asc' | 'desc' }>({ index: 1, direction: 'asc' });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const onSort = useCallback(
    (_event: React.MouseEvent, columnIndex: number, direction: 'asc' | 'desc') => {
      setSortBy({ index: columnIndex, direction });
      setPage(1);
    },
    []
  );

  const onSetPage = useCallback(
    (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number) => setPage(newPage),
    []
  );

  const onPerPageSelect = useCallback(
    (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPerPage: number, newPage: number) => {
      setPerPage(newPerPage);
      setPage(newPage);
    },
    []
  );

  // ── Fleet rows derived from live simulation data ────────────────────────────
  const baseFleetRows = useMemo(() => buildFleetRows(), []);

  const sortedFleetRows = useMemo(() => {
    const rows = [...baseFleetRows];
    rows.sort((a, b) => {
      let cmp = 0;
      switch (sortBy.index) {
        case 0: cmp = a.clusterName.localeCompare(b.clusterName); break;
        case 1: cmp = STATUS_RANK[a.status] - STATUS_RANK[b.status]; break;
        case 2: cmp = a.planCount - b.planCount; break;
        case 3: cmp = a.regionProvider.localeCompare(b.regionProvider); break;
        case 4: cmp = a.version.localeCompare(b.version, undefined, { numeric: true }); break;
      }
      return sortBy.direction === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [baseFleetRows, sortBy]);

  // ── Cluster-scope rows ─────────────────────────────────────────────────────
  const sortedClusterRows = useMemo(() => {
    const rows = [...CLUSTER_ROWS];
    rows.sort((a, b) => {
      let cmp = 0;
      switch (sortBy.index) {
        case 0: cmp = a.projectName.localeCompare(b.projectName); break;
        case 1: cmp = STATUS_RANK[a.status] - STATUS_RANK[b.status]; break;
        case 2: cmp = a.planCount - b.planCount; break;
        case 3: cmp = a.resourceSaturation.text.localeCompare(b.resourceSaturation.text); break;
        case 4: cmp = a.totalPods.localeCompare(b.totalPods, undefined, { numeric: true }); break;
      }
      return sortBy.direction === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [sortBy]);

  const totalRows = scope === 'fleet' ? sortedFleetRows.length : sortedClusterRows.length;

  // Guard page overflow when perPage changes.
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(totalRows / perPage));
    if (page > maxPage) setPage(maxPage);
  }, [page, perPage, totalRows]);

  const paginatedFleetRows = useMemo(() => {
    const start = (page - 1) * perPage;
    return sortedFleetRows.slice(start, start + perPage);
  }, [page, perPage, sortedFleetRows]);

  const paginatedClusterRows = useMemo(() => {
    const start = (page - 1) * perPage;
    return sortedClusterRows.slice(start, start + perPage);
  }, [page, perPage, sortedClusterRows]);

  const sharedSortProps = (columnIndex: number) => ({
    sort: { sortBy, onSort, columnIndex },
  });

  const paginationProps = {
    itemCount: totalRows,
    page,
    perPage,
    perPageOptions: [{ title: '5', value: 5 }, { title: '10', value: 10 }, { title: '20', value: 20 }],
    onSetPage,
    onPerPageSelect,
    isCompact: true,
  };

  return (
    <section
      className="ols-aio-fleet-summary-section ols-autonomous-ai-observe-widget-v3-fleet-summary"
      aria-label={scope === 'fleet' ? 'Cluster status and active plans' : 'Project status and active plans'}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
        flexWrap={{ default: 'wrap' }}
        gap={{ default: 'gapSm' }}
        className="ols-aio-fleet-summary-section__header"
      >
        <TableTitle scope={scope} />
        {onViewAlerts && (
          <Button variant="link" isInline onClick={onViewAlerts} aria-label="Open alerting fleet overview">
            View alerts
          </Button>
        )}
      </Flex>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="ols-aio-fleet-summary-section__body">
        <Flex justifyContent={{ default: 'justifyContentFlexEnd' }} style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
          <Pagination {...paginationProps} variant={PaginationVariant.top} />
        </Flex>

        {scope === 'fleet' ? (
          <Table aria-label="Cluster status and active plans" variant="compact" borders gridBreakPoint="">
            <Thead>
              <Tr>
                <Th {...sharedSortProps(0)} modifier="wrap">Cluster name</Th>
                <Th {...sharedSortProps(1)} modifier="wrap">Status</Th>
                <Th {...sharedSortProps(2)} modifier="wrap"><ActivePlansHeader /></Th>
                <Th {...sharedSortProps(3)} modifier="wrap">Region / Provider</Th>
                <Th {...sharedSortProps(4)} modifier="nowrap">OCP version</Th>
              </Tr>
            </Thead>
            <Tbody>
              {paginatedFleetRows.map((row) => (
                <Tr
                  key={row.id}
                  isClickable={!!onClusterClick}
                  onRowClick={onClusterClick ? () => onClusterClick(row.id) : undefined}
                >
                  <Td>
                    {onClusterClick ? (
                      <Button
                        variant="link"
                        isInline
                        onClick={(e) => { e.stopPropagation(); onClusterClick(row.id); }}
                        aria-label={`Open ${row.clusterName} details`}
                      >
                        {row.clusterName}
                      </Button>
                    ) : (
                      row.clusterName
                    )}
                  </Td>
                  <Td><StatusCell status={row.status} /></Td>
                  <Td><ActivePlansCell rowId={row.id} planCount={row.planCount} signals={row.signals} onPlanRoute={onPlanRoute} /></Td>
                  <Td>{row.regionProvider}</Td>
                  <Td modifier="nowrap">v{row.version}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          <Table aria-label="Project status and active plans" variant="compact" borders gridBreakPoint="">
            <Thead>
              <Tr>
                <Th {...sharedSortProps(0)} modifier="wrap">Project name</Th>
                <Th {...sharedSortProps(1)} modifier="wrap">Status</Th>
                <Th {...sharedSortProps(2)} modifier="wrap"><ActivePlansHeader /></Th>
                <Th {...sharedSortProps(3)} modifier="wrap">Resource saturation</Th>
                <Th {...sharedSortProps(4)} modifier="nowrap">Total pods</Th>
              </Tr>
            </Thead>
            <Tbody>
              {paginatedClusterRows.map((row) => (
                <Tr key={row.id}>
                  <Td>{row.projectName}</Td>
                  <Td><StatusCell status={row.status} /></Td>
                  <Td><ActivePlansCell rowId={row.id} planCount={row.planCount} signals={row.signals} onPlanRoute={onPlanRoute} /></Td>
                  <Td><SaturationCell level={row.resourceSaturation.level} text={row.resourceSaturation.text} /></Td>
                  <Td>{row.totalPods}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}

        <Flex justifyContent={{ default: 'justifyContentFlexEnd' }} style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}>
          <Pagination {...paginationProps} variant={PaginationVariant.bottom} />
        </Flex>
      </div>
    </section>
  );
};

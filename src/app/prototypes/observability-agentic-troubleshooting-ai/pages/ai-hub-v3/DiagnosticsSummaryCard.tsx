import React, { useMemo } from 'react';
import {
  Card,
  CardBody,
  Content,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Title,
} from '@patternfly/react-core';
import {
  BoltIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import {
  getFleetDiagnosticsMetrics,
  getClusterDiagnosticsMetrics,
} from './fleetInventoryData';
import { useFocusedClusterId } from './useFocusedClusterId';
import type { ClusterHealth } from '../../components/autonomousAiObserve/data';
import './ai-hub-v3-inventory.css';

// ─── Design tokens ────────────────────────────────────────────────────────────

const DANGER = 'var(--pf-t--global--color--status--danger--default)';
const WARNING = 'var(--pf-t--global--color--status--warning--default)';
const SUCCESS = 'var(--pf-t--global--color--status--success--default)';
const BRAND = 'var(--pf-t--global--color--brand--default)';
const SUBTLE = 'var(--pf-t--global--text--color--subtle)';

const ICON: React.CSSProperties = {
  fontSize: 'var(--pf-t--global--font--size--body--lg)',
  verticalAlign: 'middle',
};

// ─── Cluster status helpers ───────────────────────────────────────────────────

function clusterStatusIcon(status: ClusterHealth): React.ReactNode {
  if (status === 'critical') {
    return <ExclamationCircleIcon style={{ ...ICON, color: DANGER }} aria-hidden="true" />;
  }
  if (status === 'degraded') {
    return <ExclamationTriangleIcon style={{ ...ICON, color: WARNING }} aria-hidden="true" />;
  }
  return <CheckCircleIcon style={{ ...ICON, color: SUCCESS }} aria-hidden="true" />;
}

const CLUSTER_STATUS_COLOR: Record<ClusterHealth, string> = {
  critical: DANGER,
  degraded: WARNING,
  healthy: SUCCESS,
};

const CLUSTER_STATUS_LABEL: Record<ClusterHealth, string> = {
  critical: 'Critical',
  degraded: 'Degraded',
  healthy: 'Healthy',
};

// ─── KPI cell ─────────────────────────────────────────────────────────────────

interface KpiCellProps {
  label: string;
  ariaLabel: string;
  icon: React.ReactNode;
  valueNode: React.ReactNode;
}

const KpiCell: React.FC<KpiCellProps> = ({ label, ariaLabel, icon, valueNode }) => (
  <Flex direction={{ default: 'column' }} gap={{ default: 'gapXs' }}>
    <Content component="p" className="ols-ai-hub-fleet-inventory-label" style={{ margin: 0 }}>
      {label}
    </Content>
    <Flex
      alignItems={{ default: 'alignItemsCenter' }}
      gap={{ default: 'gapSm' }}
      aria-label={ariaLabel}
    >
      <FlexItem>{icon}</FlexItem>
      <FlexItem>
        <span className="ols-aio-card-stat-number--readonly">{valueNode}</span>
      </FlexItem>
    </Flex>
  </Flex>
);

// ─── Component ────────────────────────────────────────────────────────────────

export interface DiagnosticsSummaryCardProps {
  viewType: 'fleet' | 'cluster';
}

export const DiagnosticsSummaryCard: React.FC<DiagnosticsSummaryCardProps> = ({ viewType }) => {
  const clusterId = useFocusedClusterId();

  const fleetData = useMemo(
    () => (viewType === 'fleet' ? getFleetDiagnosticsMetrics() : null),
    [viewType],
  );

  const clusterData = useMemo(
    () => (viewType === 'cluster' ? getClusterDiagnosticsMetrics(clusterId) : null),
    [viewType, clusterId],
  );

  const title =
    viewType === 'fleet' ? 'Fleet health & diagnostics' : 'Cluster health & diagnostics';

  // ── No cluster context ────────────────────────────────────────────────────
  if (viewType === 'cluster' && !clusterData) {
    return (
      <Card
        isCompact
        component="section"
        aria-label={title}
        className="ols-ai-hub-diagnostics-card"
      >
        <CardBody>
          <Title
            headingLevel="h2"
            size="lg"
            style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
          >
            {title}
          </Title>
          <Content component="p" style={{ margin: 0, color: SUBTLE }}>
            No cluster context available.
          </Content>
        </CardBody>
      </Card>
    );
  }

  // ── Fleet view ────────────────────────────────────────────────────────────
  if (viewType === 'fleet' && fleetData) {
    const { clustersAffected, clustersTotal, criticalAlerts, activeInvestigations, readyRemediations } =
      fleetData;
    const clustersAtRisk = clustersAffected > 0;

    return (
      <Card
        isCompact
        component="section"
        aria-label={title}
        className="ols-ai-hub-diagnostics-card"
      >
        <CardBody>
          <Title
            headingLevel="h2"
            size="lg"
            style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
          >
            {title}
          </Title>
          <Grid hasGutter role="list" aria-label="Fleet health and diagnostics summary">
            {/* KPI 1: Clusters affected */}
            <GridItem span={12} sm={6} lg={3} role="listitem">
              <KpiCell
                label="Clusters affected"
                ariaLabel={`Clusters affected: ${clustersAffected} of ${clustersTotal}`}
                icon={
                  clustersAtRisk ? (
                    <ExclamationCircleIcon
                      style={{ ...ICON, color: DANGER }}
                      aria-hidden="true"
                    />
                  ) : (
                    <CheckCircleIcon style={{ ...ICON, color: SUCCESS }} aria-hidden="true" />
                  )
                }
                valueNode={`${clustersAffected} / ${clustersTotal}`}
              />
            </GridItem>

            {/* KPI 2: Critical alerts */}
            <GridItem span={12} sm={6} lg={3} role="listitem">
              <KpiCell
                label="Critical alerts"
                ariaLabel={`Critical alerts: ${criticalAlerts}`}
                icon={
                  <ExclamationCircleIcon
                    style={{ ...ICON, color: criticalAlerts > 0 ? DANGER : SUBTLE }}
                    aria-hidden="true"
                  />
                }
                valueNode={criticalAlerts}
              />
            </GridItem>

            {/* KPI 3: Active investigations */}
            <GridItem span={12} sm={6} lg={3} role="listitem">
              <KpiCell
                label="Active investigations"
                ariaLabel={`Active AI investigations: ${activeInvestigations}`}
                icon={<BoltIcon style={{ ...ICON, color: BRAND }} aria-hidden="true" />}
                valueNode={activeInvestigations}
              />
            </GridItem>

            {/* KPI 4: Ready remediations */}
            <GridItem span={12} sm={6} lg={3} role="listitem">
              <KpiCell
                label="Ready remediations"
                ariaLabel={`Ready remediations: ${readyRemediations}`}
                icon={
                  <CheckCircleIcon
                    style={{ ...ICON, color: readyRemediations > 0 ? SUCCESS : SUBTLE }}
                    aria-hidden="true"
                  />
                }
                valueNode={readyRemediations}
              />
            </GridItem>
          </Grid>
        </CardBody>
      </Card>
    );
  }

  // ── Cluster view ──────────────────────────────────────────────────────────
  const { clusterName, clusterStatus, criticalAlerts, activeInvestigations, readyRemediations } =
    clusterData!;

  return (
    <Card
      isCompact
      component="section"
      aria-label={`${title}: ${clusterName}`}
      className="ols-ai-hub-diagnostics-card"
    >
      <CardBody>
        <Title
          headingLevel="h2"
          size="lg"
          style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
        >
          {title}
        </Title>
        <Grid hasGutter role="list" aria-label="Cluster health and diagnostics summary">
          {/* KPI 1: Cluster status */}
          <GridItem span={12} sm={6} lg={3} role="listitem">
            <KpiCell
              label="Cluster status"
              ariaLabel={`Cluster status: ${CLUSTER_STATUS_LABEL[clusterStatus]}`}
              icon={clusterStatusIcon(clusterStatus)}
              valueNode={
                <span style={{ color: CLUSTER_STATUS_COLOR[clusterStatus] }}>
                  {CLUSTER_STATUS_LABEL[clusterStatus]}
                </span>
              }
            />
          </GridItem>

          {/* KPI 2: Critical alerts */}
          <GridItem span={12} sm={6} lg={3} role="listitem">
            <KpiCell
              label="Critical alerts"
              ariaLabel={`Critical alerts: ${criticalAlerts}`}
              icon={
                <ExclamationCircleIcon
                  style={{ ...ICON, color: criticalAlerts > 0 ? DANGER : SUBTLE }}
                  aria-hidden="true"
                />
              }
              valueNode={
                <span style={{ color: criticalAlerts > 0 ? DANGER : 'inherit' }}>
                  {criticalAlerts}
                </span>
              }
            />
          </GridItem>

          {/* KPI 3: Active investigations */}
          <GridItem span={12} sm={6} lg={3} role="listitem">
            <KpiCell
              label="Active investigations"
              ariaLabel={`Active AI investigations: ${activeInvestigations}`}
              icon={<BoltIcon style={{ ...ICON, color: BRAND }} aria-hidden="true" />}
              valueNode={activeInvestigations}
            />
          </GridItem>

          {/* KPI 4: Ready remediations */}
          <GridItem span={12} sm={6} lg={3} role="listitem">
            <KpiCell
              label="Ready remediations"
              ariaLabel={`Ready remediations: ${readyRemediations}`}
              icon={
                <CheckCircleIcon
                  style={{ ...ICON, color: readyRemediations > 0 ? SUCCESS : SUBTLE }}
                  aria-hidden="true"
                />
              }
              valueNode={
                <span style={{ color: readyRemediations > 0 ? SUCCESS : 'inherit' }}>
                  {readyRemediations}
                </span>
              }
            />
          </GridItem>
        </Grid>
      </CardBody>
    </Card>
  );
};

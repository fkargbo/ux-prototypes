import React, { useMemo } from 'react';
import {
  Card,
  CardBody,
  Content,
  Divider,
  Flex,
  FlexItem,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  MagicIcon,
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
const SUBTLE = 'var(--pf-t--global--text--color--subtle)';

const ICON_STYLE: React.CSSProperties = {
  fontSize: 'var(--pf-t--global--font--size--body--lg)',
  verticalAlign: 'middle',
};

// ─── AI disclosure ────────────────────────────────────────────────────────────

const AI_TOOLTIP =
  'This metric is synthesized by the autonomous AI SRE agent based on current cluster states and historical patterns.';

const AiDisclosureIcon: React.FC = () => (
  <Tooltip content={AI_TOOLTIP} position="top">
    {/* span wrapper required: Tooltip needs a focusable, ref-forwarding child */}
    <span
      tabIndex={0}
      role="img"
      aria-label="AI-synthesized metric"
      className="ols-ai-diagnostics-disclosure-icon"
    >
      <MagicIcon aria-hidden="true" />
    </span>
  </Tooltip>
);

// ─── Cluster status helpers ───────────────────────────────────────────────────

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

function ClusterStatusIcon({ status }: { status: ClusterHealth }) {
  if (status === 'critical')
    return <ExclamationCircleIcon style={{ ...ICON_STYLE, color: DANGER }} aria-hidden="true" />;
  if (status === 'degraded')
    return <ExclamationTriangleIcon style={{ ...ICON_STYLE, color: WARNING }} aria-hidden="true" />;
  return <CheckCircleIcon style={{ ...ICON_STYLE, color: SUCCESS }} aria-hidden="true" />;
}

// ─── KPI cell ─────────────────────────────────────────────────────────────────

interface KpiCellProps {
  label: string;
  ariaLabel: string;
  value: React.ReactNode;
  valueColor?: string;
  /** Prefix icon rendered beside the value (e.g. cluster status icon). */
  valueIcon?: React.ReactNode;
  /** When true, renders the AI disclosure icon + tooltip next to the label. */
  isAi?: boolean;
}

const KpiCell: React.FC<KpiCellProps> = ({
  label,
  ariaLabel,
  value,
  valueColor,
  valueIcon,
  isAi,
}) => (
  <Flex
    direction={{ default: 'column' }}
    gap={{ default: 'gapXs' }}
    aria-label={ariaLabel}
  >
    {/* Label row */}
    <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }}>
      <Content
        component="p"
        className="ols-ai-hub-fleet-inventory-label ols-ai-diagnostics-kpi-label"
        style={{ margin: 0 }}
      >
        {label}
      </Content>
      {isAi && (
        <FlexItem>
          <AiDisclosureIcon />
        </FlexItem>
      )}
    </Flex>

    {/* Value row */}
    <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
      {valueIcon && <FlexItem>{valueIcon}</FlexItem>}
      <FlexItem>
        <span
          className="ols-aio-card-stat-number--readonly"
          style={valueColor ? { color: valueColor } : undefined}
        >
          {value}
        </span>
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
      <Card isCompact component="section" aria-label={title} className="ols-ai-hub-diagnostics-card">
        <CardBody>
          <Title headingLevel="h2" size="md" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
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
    const {
      clustersAffected,
      clustersTotal,
      criticalAlerts,
      activeInvestigations,
      readyRemediations,
      estMttrSaved,
    } = fleetData;

    return (
      <Card isCompact component="section" aria-label={title} className="ols-ai-hub-diagnostics-card">
        <CardBody>
          <Title
            headingLevel="h2"
            size="md"
            style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
          >
            {title}
          </Title>

          <Flex
            direction={{ default: 'row' }}
            flexWrap={{ default: 'wrap' }}
            alignItems={{ default: 'alignItemsCenter' }}
            gap={{ default: 'gapLg' }}
            role="list"
            aria-label="Fleet health and diagnostics summary"
          >
            {/* ── Deterministic telemetry ──────────────────────────────── */}
            <FlexItem role="listitem">
              <KpiCell
                label="Clusters affected"
                ariaLabel={`Clusters affected: ${clustersAffected} of ${clustersTotal}`}
                value={`${clustersAffected} / ${clustersTotal}`}
              />
            </FlexItem>

            <FlexItem role="listitem">
              <KpiCell
                label="Critical alerts"
                ariaLabel={`Critical alerts: ${criticalAlerts}`}
                value={criticalAlerts}
                valueColor={criticalAlerts > 0 ? DANGER : undefined}
              />
            </FlexItem>

            {/* ── Visual guardrail ─────────────────────────────────────── */}
            <FlexItem
              alignSelf={{ default: 'alignSelfStretch' }}
              style={{ display: 'flex', alignItems: 'stretch' }}
              aria-hidden="true"
            >
              <Divider orientation={{ default: 'vertical' }} />
            </FlexItem>

            {/* ── AI Agentic Insights block ────────────────────────────── */}
            <FlexItem flex={{ default: 'flex_1' }} role="listitem">
              <div className="ols-ai-diagnostics-ai-section">
                <Flex
                  direction={{ default: 'row' }}
                  flexWrap={{ default: 'wrap' }}
                  gap={{ default: 'gapLg' }}
                >
                  <FlexItem>
                    <KpiCell
                      label="Active plans"
                      ariaLabel={`Active AI plans: ${activeInvestigations}`}
                      value={activeInvestigations}
                      isAi
                    />
                  </FlexItem>

                  <FlexItem>
                    <KpiCell
                      label="Ready proposals"
                      ariaLabel={`Ready AI proposals: ${readyRemediations}`}
                      value={readyRemediations}
                      isAi
                    />
                  </FlexItem>

                  <FlexItem>
                    <KpiCell
                      label="Est. MTTR saved"
                      ariaLabel={`Estimated MTTR saved: ${estMttrSaved}`}
                      value={estMttrSaved}
                      isAi
                    />
                  </FlexItem>
                </Flex>
              </div>
            </FlexItem>
          </Flex>
        </CardBody>
      </Card>
    );
  }

  // ── Cluster view ──────────────────────────────────────────────────────────
  const {
    clusterName,
    clusterStatus,
    criticalAlerts,
    activeInvestigations,
    readyRemediations,
    estMttrSaved,
  } = clusterData!;

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
          size="md"
          style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
        >
          {title}
        </Title>

        <Flex
          direction={{ default: 'row' }}
          flexWrap={{ default: 'wrap' }}
          alignItems={{ default: 'alignItemsCenter' }}
          gap={{ default: 'gapLg' }}
          role="list"
          aria-label="Cluster health and diagnostics summary"
        >
          {/* ── Deterministic telemetry ────────────────────────────────── */}
          <FlexItem role="listitem">
            <KpiCell
              label="Cluster status"
              ariaLabel={`Cluster status: ${CLUSTER_STATUS_LABEL[clusterStatus]}`}
              valueIcon={<ClusterStatusIcon status={clusterStatus} />}
              value={
                <span style={{ color: CLUSTER_STATUS_COLOR[clusterStatus] }}>
                  {CLUSTER_STATUS_LABEL[clusterStatus]}
                </span>
              }
            />
          </FlexItem>

          <FlexItem role="listitem">
            <KpiCell
              label="Critical alerts"
              ariaLabel={`Critical alerts: ${criticalAlerts}`}
              value={criticalAlerts}
              valueColor={criticalAlerts > 0 ? DANGER : undefined}
            />
          </FlexItem>

          {/* ── Visual guardrail ───────────────────────────────────────── */}
          <FlexItem
            alignSelf={{ default: 'alignSelfStretch' }}
            style={{ display: 'flex', alignItems: 'stretch' }}
            aria-hidden="true"
          >
            <Divider orientation={{ default: 'vertical' }} />
          </FlexItem>

          {/* ── AI Agentic Insights block ──────────────────────────────── */}
          <FlexItem flex={{ default: 'flex_1' }} role="listitem">
            <div className="ols-ai-diagnostics-ai-section">
              <Flex
                direction={{ default: 'row' }}
                flexWrap={{ default: 'wrap' }}
                gap={{ default: 'gapLg' }}
              >
                <FlexItem>
                  <KpiCell
                    label="Active plans"
                    ariaLabel={`Active AI plans: ${activeInvestigations}`}
                    value={activeInvestigations}
                    isAi
                  />
                </FlexItem>

                <FlexItem>
                  <KpiCell
                    label="Ready proposals"
                    ariaLabel={`Ready AI proposals: ${readyRemediations}`}
                    value={readyRemediations}
                    isAi
                  />
                </FlexItem>

                <FlexItem>
                  <KpiCell
                    label="Est. MTTR saved"
                    ariaLabel={`Estimated MTTR saved: ${estMttrSaved}`}
                    value={estMttrSaved}
                    isAi
                  />
                </FlexItem>
              </Flex>
            </div>
          </FlexItem>
        </Flex>
      </CardBody>
    </Card>
  );
};

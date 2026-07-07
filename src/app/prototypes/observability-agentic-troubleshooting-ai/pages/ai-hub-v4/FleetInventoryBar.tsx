/**
 * v4.0 — Fleet Inventory Bar.
 * Left card in Row 1 of the Recommendation Hub.
 *
 * Primary metric: CLUSTERS AFFECTED (e.g. 15 / 20).
 * Secondary tier: Critical | Degraded | Healthy status breakdown.
 * Flat, borderless design matching the v3 "Fleet health & diagnostics" panel.
 */
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
} from '@patternfly/react-icons';
import { V4_FLEET_INVENTORY } from './v4Data';
import '../ai-hub-v3/ai-hub-v3-inventory.css';

// ─── Design tokens ────────────────────────────────────────────────────────────

const DANGER  = 'var(--pf-t--global--color--status--danger--default)';
const WARNING = 'var(--pf-t--global--color--status--warning--default)';
const SUCCESS = 'var(--pf-t--global--color--status--success--default)';
const SUBTLE  = 'var(--pf-t--global--text--color--subtle)';

const ICON_STYLE: React.CSSProperties = {
  fontSize: 'var(--pf-t--global--font--size--body--lg)',
  verticalAlign: 'middle',
  marginRight: '4px',
};

// ─── Status breakdown cell ────────────────────────────────────────────────────

interface StatusCellProps {
  count: number;
  label: string;
  color: string;
  icon: React.ReactNode;
  tooltip: string;
}

const StatusCell: React.FC<StatusCellProps> = ({ count, label, color, icon, tooltip }) => (
  <Tooltip content={tooltip} position="top">
    <Flex
      direction={{ default: 'column' }}
      gap={{ default: 'gapXs' }}
      aria-label={`${label}: ${count}`}
      style={{ cursor: 'default' }}
      tabIndex={0}
    >
      <Content component="p" className="ols-ai-hub-fleet-inventory-label" style={{ margin: 0 }}>
        {icon}
        {label}
      </Content>
      <span className="ols-aio-card-stat-number--readonly" style={{ color }}>
        {count}
      </span>
    </Flex>
  </Tooltip>
);

// ─── Component ────────────────────────────────────────────────────────────────

export const FleetInventoryBar: React.FC = () => {
  const m = useMemo(() => V4_FLEET_INVENTORY, []);

  return (
    <Card isCompact component="section" aria-label="Fleet cluster status" className="ols-ai-hub-fleet-inventory-card">
      <CardBody>
        <Title headingLevel="h2" size="lg" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
          Fleet inventory
        </Title>

        <Flex
          direction={{ default: 'row' }}
          flexWrap={{ default: 'nowrap' }}
          alignItems={{ default: 'alignItemsCenter' }}
          gap={{ default: 'gapNone' }}
          style={{ width: '100%' }}
          role="list"
          aria-label="Fleet cluster status summary"
        >
          {/* ── Primary — Clusters affected ───────────────────────────────── */}
          <FlexItem role="listitem" style={{ flex: '0 0 auto', paddingRight: 'var(--pf-t--global--spacer--lg)' }}>
            <Flex direction={{ default: 'column' }} gap={{ default: 'gapXs' }}>
              <Content
                component="p"
                className="ols-ai-hub-fleet-inventory-label"
                style={{ margin: 0 }}
              >
                Clusters affected
              </Content>
              <Flex alignItems={{ default: 'alignItemsBaseline' }} gap={{ default: 'gapXs' }}>
                <span
                  className="ols-aio-card-stat-number--readonly"
                  style={{ color: DANGER }}
                  aria-label={`Clusters affected: ${m.clustersAffected} of ${m.clustersTotal}`}
                >
                  {m.clustersAffected}
                </span>
                <Content component="p" style={{ margin: 0, color: SUBTLE, fontSize: '1.1rem' }}>
                  / {m.clustersTotal}
                </Content>
              </Flex>
            </Flex>
          </FlexItem>

          {/* ── Vertical divider ──────────────────────────────────────────── */}
          <FlexItem
            alignSelf={{ default: 'alignSelfStretch' }}
            style={{ display: 'flex', alignItems: 'stretch', flexShrink: 0, paddingRight: 'var(--pf-t--global--spacer--lg)' }}
            aria-hidden="true"
          >
            <Divider orientation={{ default: 'vertical' }} />
          </FlexItem>

          {/* ── Status breakdown ──────────────────────────────────────────── */}
          <FlexItem role="listitem" style={{ flex: '1 1 0', minWidth: 0 }}>
            <Flex
              direction={{ default: 'row' }}
              gap={{ default: 'gapXl' }}
              flexWrap={{ default: 'wrap' }}
              role="list"
            >
              <FlexItem role="listitem">
                <StatusCell
                  count={m.criticalClusters}
                  label="Critical"
                  color={DANGER}
                  icon={<ExclamationCircleIcon style={{ ...ICON_STYLE, color: DANGER }} aria-hidden="true" />}
                  tooltip={`${m.criticalClusters} clusters in a critical health state`}
                />
              </FlexItem>
              <FlexItem role="listitem">
                <StatusCell
                  count={m.degradedClusters}
                  label="Degraded"
                  color={WARNING}
                  icon={<ExclamationTriangleIcon style={{ ...ICON_STYLE, color: WARNING }} aria-hidden="true" />}
                  tooltip={`${m.degradedClusters} clusters in a degraded health state`}
                />
              </FlexItem>
              <FlexItem role="listitem">
                <StatusCell
                  count={m.healthyClusters}
                  label="Healthy"
                  color={SUCCESS}
                  icon={<CheckCircleIcon style={{ ...ICON_STYLE, color: SUCCESS }} aria-hidden="true" />}
                  tooltip={`${m.healthyClusters} clusters operating normally`}
                />
              </FlexItem>
            </Flex>
          </FlexItem>
        </Flex>
      </CardBody>
    </Card>
  );
};

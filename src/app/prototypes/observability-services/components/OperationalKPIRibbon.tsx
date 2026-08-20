import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Content, Grid, GridItem, Title } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import type { OperationalKpiStat, OperationalKpiVariant } from '../types';

// ─── Icon + colour helpers ────────────────────────────────────────────────────

const ICON_MAP: Record<OperationalKpiVariant, React.ComponentType<{ color?: string; 'aria-hidden'?: boolean }> | null> = {
  danger: ExclamationCircleIcon,
  warning: ExclamationTriangleIcon,
  success: CheckCircleIcon,
  neutral: null,
};

const ICON_COLOR_MAP: Record<OperationalKpiVariant, string> = {
  danger: 'var(--pf-t--global--icon--color--status--danger--default)',
  warning: 'var(--pf-t--global--icon--color--status--warning--default)',
  success: 'var(--pf-t--global--icon--color--status--success--default)',
  neutral: 'var(--pf-t--global--icon--color--subtle)',
};

/**
 * Resolves the effective variant, applying `zeroVariant` when the displayed
 * value is a pure integer that equals zero.
 */
function resolveVariant(stat: OperationalKpiStat): OperationalKpiVariant {
  if (stat.zeroVariant) {
    const numeric = parseInt(stat.value, 10);
    if (!isNaN(numeric) && numeric === 0) {
      return stat.zeroVariant;
    }
  }
  return stat.variant;
}

// ─── Sub-component ────────────────────────────────────────────────────────────

interface KpiCardProps {
  stat: OperationalKpiStat;
  onNavigate: (path: string) => void;
}

const KpiCard: React.FC<KpiCardProps> = ({ stat, onNavigate }) => {
  const variant = resolveVariant(stat);
  const IconComponent = ICON_MAP[variant];
  const iconColor = ICON_COLOR_MAP[variant];
  const isActionable = Boolean(stat.href || stat.scrollTargetId);

  const handleActivate = () => {
    if (stat.href) {
      onNavigate(stat.href);
      return;
    }
    if (stat.scrollTargetId) {
      document
        .getElementById(stat.scrollTargetId)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Card
      isFullHeight
      isClickable={isActionable}
      onClick={isActionable ? handleActivate : undefined}
      onKeyDown={isActionable ? (e) => e.key === 'Enter' && handleActivate() : undefined}
      tabIndex={isActionable ? 0 : undefined}
      role={isActionable ? 'button' : undefined}
      aria-label={
        isActionable ? `${stat.category}: ${stat.value} ${stat.label}` : undefined
      }
      className={`ols-obs-kpi-card ols-obs-kpi-card--${variant}`}
    >
      <CardBody>
        {/* Category header row */}
        <div className="ols-obs-kpi-card__header">
          <Content component="p" className="ols-obs-kpi-card__category">
            {stat.category}
          </Content>
          {IconComponent ? (
            <IconComponent color={iconColor} aria-hidden />
          ) : null}
        </div>

        {/* Metric value + label */}
        <Title headingLevel="h3" size="2xl" className="ols-obs-kpi-card__value">
          {stat.value}{' '}
          <span className="ols-obs-kpi-card__value-label">{stat.label}</span>
        </Title>

        {/* Helper subtext */}
        <Content component="small" className="ols-obs-kpi-card__subtext">
          {stat.subtext}
        </Content>
      </CardBody>
    </Card>
  );
};

// ─── Public component ─────────────────────────────────────────────────────────

export interface OperationalKPIRibbonProps {
  stats: OperationalKpiStat[];
}

export const OperationalKPIRibbon: React.FC<OperationalKPIRibbonProps> = ({ stats }) => {
  const navigate = useNavigate();

  return (
    <section aria-labelledby="ols-obs-kpi-heading">
      <Title
        headingLevel="h2"
        size="lg"
        id="ols-obs-kpi-heading"
        className="pf-v6-u-mb-md"
      >
        Observability at a glance
      </Title>
      {/* 4 equal columns on lg+, 2×2 on md, single stack on sm */}
      <Grid hasGutter>
        {stats.map((stat) => (
          <GridItem key={stat.id} span={12} md={6} lg={3}>
            <KpiCard stat={stat} onNavigate={navigate} />
          </GridItem>
        ))}
      </Grid>
    </section>
  );
};

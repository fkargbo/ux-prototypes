import React from 'react';
import { Card, CardBody, Content, Grid, GridItem, Title } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import type { OperationalKpiStat, OperationalKpiVariant } from '../types';

const VALUE_ICON_MAP: Record<OperationalKpiVariant, React.ComponentType<{ color?: string; 'aria-hidden'?: boolean; style?: React.CSSProperties }> | null> = {
  danger: ExclamationCircleIcon,
  warning: ExclamationTriangleIcon,
  success: CheckCircleIcon,
  neutral: null,
};

const VALUE_ICON_COLOR_MAP: Record<OperationalKpiVariant, string> = {
  danger: 'var(--pf-t--global--icon--color--status--danger--default)',
  warning: 'var(--pf-t--global--icon--color--status--warning--default)',
  success: 'var(--pf-t--global--icon--color--status--success--default)',
  neutral: 'var(--pf-t--global--icon--color--subtle)',
};

export interface OperationalKPIRibbonProps {
  stats: OperationalKpiStat[];
}

export const OperationalKPIRibbon: React.FC<OperationalKPIRibbonProps> = ({ stats }) => (
  <section aria-labelledby="ols-obs-kpi-heading" className="ols-obs-kpi-ribbon">
    <Title
      headingLevel="h2"
      size="lg"
      id="ols-obs-kpi-heading"
      className="ols-obs-services-section-title"
    >
      Observability stack summary
    </Title>
    {/* 4 equal columns on lg+, 2×2 on md, single stack on sm */}
    <Grid hasGutter>
      {stats.map((stat) => (
        <GridItem key={stat.id} span={12} md={6} lg={3}>
          <Card isCompact isFullHeight>
            <CardBody>
              <Title headingLevel="h3" size="md">
                {stat.category}
              </Title>
              <Title headingLevel="h4" size="2xl" className="ols-obs-kpi-card__value">
                {stat.valueIconVariant ? (() => {
                  const Icon = VALUE_ICON_MAP[stat.valueIconVariant];
                  return Icon ? (
                    <Icon
                      color={VALUE_ICON_COLOR_MAP[stat.valueIconVariant]}
                      aria-hidden
                      style={{ marginRight: 'var(--pf-t--global--spacer--xs)', verticalAlign: 'middle' }}
                    />
                  ) : null;
                })() : null}
                {stat.value}
              </Title>
              {stat.label ? (
                <Content component="small" className="ols-obs-kpi-card__label">
                  {stat.label}
                </Content>
              ) : null}
            </CardBody>
          </Card>
        </GridItem>
      ))}
    </Grid>
  </section>
);

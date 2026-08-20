import React from 'react';
import { Card, CardBody, Grid, GridItem, Title } from '@patternfly/react-core';
import type { OperationalKpiStat } from '../types';

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
      Observability at a glance
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
              <span className="ols-obs-kpi-card__value">
                {stat.value}
              </span>
              {stat.label ? (
                <p className="ols-obs-kpi-card__label">{stat.label}</p>
              ) : null}
            </CardBody>
          </Card>
        </GridItem>
      ))}
    </Grid>
  </section>
);

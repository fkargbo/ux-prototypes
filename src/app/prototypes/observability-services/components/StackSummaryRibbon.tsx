import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardBody, Content, Grid, GridItem, Title } from '@patternfly/react-core';
import type { StackSummaryStat } from '../types';

export interface StackSummaryRibbonProps {
  stats: StackSummaryStat[];
}

export const StackSummaryRibbon: React.FC<StackSummaryRibbonProps> = ({ stats }) => {
  const navigate = useNavigate();

  return (
    <section aria-labelledby="ols-obs-stack-summary-heading">
      <Title headingLevel="h2" size="lg" id="ols-obs-stack-summary-heading" className="pf-v6-u-mb-md">
        Observability stack summary
      </Title>
      <Content component="p" className="ols-obs-services-muted pf-v6-u-mb-md">
        Inventory of configured observability surfaces. Select a number to open the related
        Observe view.
      </Content>
      <Grid hasGutter>
        {stats.map((stat) => (
          <GridItem key={stat.id} span={12} md={6} lg={4} xl={2}>
            <Card isCompact isFullHeight className="ols-obs-services-stat-card">
              <CardBody>
                <Title headingLevel="h3" size="md" id={`stat-title-${stat.id}`}>
                  {stat.label}
                </Title>
                <Button
                  variant="link"
                  isInline
                  onClick={() => navigate(stat.href)}
                  className="ols-obs-services-stat-card__value"
                  aria-label={`${stat.value.toLocaleString()} ${stat.label}`}
                >
                  {stat.value.toLocaleString()}
                </Button>
              </CardBody>
            </Card>
          </GridItem>
        ))}
      </Grid>
    </section>
  );
};

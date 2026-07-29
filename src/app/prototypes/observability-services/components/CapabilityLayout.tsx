import React from 'react';
import { Grid, GridItem, Stack, StackItem, Title } from '@patternfly/react-core';
import { CapabilityCard } from './CapabilityCard';
import type { CapabilityCardData } from '../types';

export interface CapabilityLayoutProps {
  capabilities: CapabilityCardData[];
}

const SectionCards: React.FC<{ items: CapabilityCardData[] }> = ({ items }) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <Grid hasGutter className="ols-obs-services-section-cards">
      {items.map((cap) => (
        <GridItem key={cap.id} span={12} md={6} xl={4}>
          <CapabilityCard capability={cap} />
        </GridItem>
      ))}
    </Grid>
  );
};

export const CapabilityLayout: React.FC<CapabilityLayoutProps> = ({ capabilities }) => {
  const installed = capabilities.filter((c) => c.category === 'installed');
  const recommended = capabilities.filter((c) => c.category === 'recommended');

  return (
    <Stack hasGutter>
      {installed.length > 0 ? (
        <StackItem>
          <section aria-labelledby="ols-obs-installed-heading">
            <Title
              headingLevel="h2"
              size="lg"
              id="ols-obs-installed-heading"
              className="ols-obs-services-section-title"
            >
              Installed operators and add-ons
            </Title>
            <SectionCards items={installed} />
          </section>
        </StackItem>
      ) : null}

      {recommended.length > 0 ? (
        <StackItem>
          <section aria-labelledby="ols-obs-recommended-heading">
            <Title
              headingLevel="h2"
              size="lg"
              id="ols-obs-recommended-heading"
              className="ols-obs-services-section-title"
            >
              Recommended operators (not installed)
            </Title>
            <SectionCards items={recommended} />
          </section>
        </StackItem>
      ) : null}
    </Stack>
  );
};

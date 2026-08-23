import React from 'react';
import { Grid, GridItem, Stack, StackItem, Title } from '@patternfly/react-core';
import { CapabilityCard } from './CapabilityCard';
import { InstalledOperatorsSection } from './InstalledOperatorsSection';
import { RecommendedOperatorsSection } from './RecommendedOperatorsSection';
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
        <GridItem key={cap.id} span={12} md={6} lg={3}>
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
          <InstalledOperatorsSection capabilities={installed}>
            <SectionCards items={installed} />
          </InstalledOperatorsSection>
        </StackItem>
      ) : null}

      {recommended.length > 0 ? (
        <StackItem>
          <RecommendedOperatorsSection capabilities={recommended}>
            <SectionCards items={recommended} />
          </RecommendedOperatorsSection>
        </StackItem>
      ) : null}
    </Stack>
  );
};

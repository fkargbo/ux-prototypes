import React from 'react';
import { Grid, GridItem, Stack, StackItem, Title } from '@patternfly/react-core';
import { CapabilityCard } from './CapabilityCard';
import { InstalledOperatorsSection } from './InstalledOperatorsSection';
import { RecommendedOperatorsSection } from './RecommendedOperatorsSection';
import type { CapabilityCardData } from '../types';

export interface CapabilityLayoutProps {
  capabilities: CapabilityCardData[];
  /** When false the installed section renders as a plain heading without collapse. Default: true. */
  collapsible?: boolean;
  /** Forwarded to each CapabilityCard. Called with the dep ID when an inline dep action is clicked. */
  onDepAction?: (depId: string) => void;
}

const SectionCards: React.FC<{ items: CapabilityCardData[]; onDepAction?: (depId: string) => void }> = ({
  items,
  onDepAction,
}) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <Grid hasGutter className="ols-obs-services-section-cards">
      {items.map((cap) => (
        <GridItem key={cap.id} span={12} md={6} lg={3}>
          <CapabilityCard capability={cap} onDepAction={onDepAction} />
        </GridItem>
      ))}
    </Grid>
  );
};

export const CapabilityLayout: React.FC<CapabilityLayoutProps> = ({
  capabilities,
  collapsible = true,
  onDepAction,
}) => {
  const installed = capabilities.filter((c) => c.category === 'installed');
  const recommended = capabilities.filter((c) => c.category === 'recommended');

  return (
    <Stack hasGutter>
      {installed.length > 0 ? (
        <StackItem>
          {collapsible ? (
            <InstalledOperatorsSection capabilities={installed}>
              <SectionCards items={installed} onDepAction={onDepAction} />
            </InstalledOperatorsSection>
          ) : (
            <section aria-labelledby="ols-obs-installed-heading">
              <Title
                headingLevel="h2"
                size="lg"
                id="ols-obs-installed-heading"
                className="ols-obs-services-section-title"
              >
                Core capabilities
              </Title>
              <SectionCards items={installed} onDepAction={onDepAction} />
            </section>
          )}
        </StackItem>
      ) : null}

      {recommended.length > 0 ? (
        <StackItem>
          {collapsible ? (
            <RecommendedOperatorsSection capabilities={recommended}>
              <SectionCards items={recommended} onDepAction={onDepAction} />
            </RecommendedOperatorsSection>
          ) : (
            <section aria-labelledby="ols-obs-recommended-heading">
              <Title
                headingLevel="h2"
                size="lg"
                id="ols-obs-recommended-heading"
                className="ols-obs-services-section-title"
              >
                Additional capabilities
              </Title>
              <SectionCards items={recommended} onDepAction={onDepAction} />
            </section>
          )}
        </StackItem>
      ) : null}
    </Stack>
  );
};

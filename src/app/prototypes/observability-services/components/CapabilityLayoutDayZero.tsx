/**
 * CapabilityLayoutDayZero
 *
 * v2.0.0 layout wrapper for Day-0 capability cards.
 * Renders two plain sections (no collapse chrome):
 *   1. "Installed operators and add-ons"
 *   2. "Recommended operators (not installed)"
 *
 * Cards use a responsive 4-column grid (lg=3) matching the stack summary ribbon.
 */

import React from 'react';
import { Grid, GridItem, Stack, StackItem, Title } from '@patternfly/react-core';
import { CapabilityCardDayZero } from './CapabilityCardDayZero';
import type { V2CapabilityCard } from '../types';

interface SectionProps {
  title: string;
  titleId: string;
  cards: V2CapabilityCard[];
}

const Section: React.FC<SectionProps> = ({ title, titleId, cards }) => (
  <section aria-labelledby={titleId}>
    <Title
      headingLevel="h2"
      size="lg"
      id={titleId}
      className="ols-obs-services-section-title"
    >
      {title}
    </Title>
    <div className="ols-obs-services-section-cards">
      <Grid hasGutter>
        {cards.map((card) => (
          <GridItem key={card.id} span={12} md={6} lg={3}>
            <CapabilityCardDayZero card={card} />
          </GridItem>
        ))}
      </Grid>
    </div>
  </section>
);

interface CapabilityLayoutDayZeroProps {
  cards: V2CapabilityCard[];
}

export const CapabilityLayoutDayZero: React.FC<CapabilityLayoutDayZeroProps> = ({ cards }) => {
  const installed = cards.filter((c) => c.category === 'installed');
  const recommended = cards.filter((c) => c.category === 'recommended');

  return (
    <Stack hasGutter>
      {installed.length > 0 && (
        <StackItem>
          <Section
            title="Installed operators and add-ons"
            titleId="ols-obs-installed-heading-v2"
            cards={installed}
          />
        </StackItem>
      )}
      {recommended.length > 0 && (
        <StackItem>
          <Section
            title="Recommended operators (not installed)"
            titleId="ols-obs-recommended-heading-v2"
            cards={recommended}
          />
        </StackItem>
      )}
    </Stack>
  );
};

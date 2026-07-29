import React, { useState, useCallback } from 'react';
import {
  Card,
  CardBody,
  CardExpandableContent,
  CardHeader,
  CardTitle,
  Grid,
  GridItem,
  Title,
} from '@patternfly/react-core';
import { CapabilityCard } from './CapabilityCard';
import type { CapabilityCardData, CapabilityLayoutMode } from '../types';

export interface CapabilityLayoutProps {
  capabilities: CapabilityCardData[];
  /** `grid` = unified responsive grid (default). `sections` = collapsible installed vs recommended. */
  layoutMode?: CapabilityLayoutMode;
}

const SectionCards: React.FC<{ items: CapabilityCardData[] }> = ({ items }) => (
  <Grid hasGutter>
    {items.map((cap) => (
      <GridItem key={cap.id} span={12} md={6} xl={4}>
        <CapabilityCard capability={cap} />
      </GridItem>
    ))}
  </Grid>
);

const CollapsibleSections: React.FC<{ capabilities: CapabilityCardData[] }> = ({
  capabilities,
}) => {
  const installed = capabilities.filter((c) => c.category === 'installed');
  const recommended = capabilities.filter((c) => c.category === 'recommended');
  const [expanded, setExpanded] = useState({ installed: true, recommended: true });

  const toggle = useCallback((key: 'installed' | 'recommended') => {
    return (_event: React.MouseEvent, _id: string) => {
      setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
    };
  }, []);

  return (
    <Grid hasGutter>
      <GridItem span={12}>
        <Card id="ols-obs-section-installed" isExpanded={expanded.installed} isCompact>
          <CardHeader
            onExpand={toggle('installed')}
            toggleButtonProps={{
              id: 'ols-obs-section-installed-toggle',
              'aria-label': 'Toggle Installed operators and add-ons',
              'aria-expanded': expanded.installed,
            }}
          >
            <CardTitle component="h2">Installed operators and add-ons</CardTitle>
          </CardHeader>
          <CardExpandableContent>
            <CardBody>
              <SectionCards items={installed} />
            </CardBody>
          </CardExpandableContent>
        </Card>
      </GridItem>
      <GridItem span={12}>
        <Card id="ols-obs-section-recommended" isExpanded={expanded.recommended} isCompact>
          <CardHeader
            onExpand={toggle('recommended')}
            toggleButtonProps={{
              id: 'ols-obs-section-recommended-toggle',
              'aria-label': 'Toggle Recommended operators',
              'aria-expanded': expanded.recommended,
            }}
          >
            <CardTitle component="h2">Recommended operators</CardTitle>
          </CardHeader>
          <CardExpandableContent>
            <CardBody>
              <SectionCards items={recommended} />
            </CardBody>
          </CardExpandableContent>
        </Card>
      </GridItem>
    </Grid>
  );
};

export const CapabilityLayout: React.FC<CapabilityLayoutProps> = ({
  capabilities,
  layoutMode = 'grid',
}) => {
  if (layoutMode === 'sections') {
    return (
      <section aria-labelledby="ols-obs-capabilities-heading">
        <Title headingLevel="h2" size="lg" id="ols-obs-capabilities-heading" className="pf-v6-u-mb-md">
          Observability capabilities
        </Title>
        <CollapsibleSections capabilities={capabilities} />
      </section>
    );
  }

  return (
    <section aria-labelledby="ols-obs-capabilities-heading">
      <Title headingLevel="h2" size="lg" id="ols-obs-capabilities-heading" className="pf-v6-u-mb-md">
        Observability capabilities
      </Title>
      <Grid hasGutter>
        {capabilities.map((cap) => (
          <GridItem key={cap.id} span={12} md={6} xl={4}>
            <CapabilityCard capability={cap} />
          </GridItem>
        ))}
      </Grid>
    </section>
  );
};

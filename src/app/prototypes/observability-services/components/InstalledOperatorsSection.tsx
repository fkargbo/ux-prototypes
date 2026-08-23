import React, { useState } from 'react';
import { ExpandableSection, Flex, FlexItem, Label, Title } from '@patternfly/react-core';
import type { CapabilityCardData } from '../types';

const STORAGE_KEY = 'ocp_obs_hub_operators_expanded';

export interface InstalledOperatorsSectionProps {
  capabilities: CapabilityCardData[];
  children: React.ReactNode;
}

interface StatusCounts {
  fullyEnabled: number;
  partialSetup: number;
  degraded: number;
}

/**
 * Counts are dual-axis and independent — a card can appear in both
 * fullyEnabled (macro badge) and degraded (runtime health) simultaneously,
 * matching the state matrix where FULLY_ENABLED + DEGRADED coexist.
 */
const computeCounts = (capabilities: CapabilityCardData[]): StatusCounts =>
  capabilities.reduce<StatusCounts>(
    (acc, card) => {
      if (card.status.kind === 'fully-enabled') acc.fullyEnabled++;
      if (card.status.kind === 'configuration-required') acc.partialSetup++;
      if (card.runtimeHealth === 'DEGRADED') acc.degraded++;
      return acc;
    },
    { fullyEnabled: 0, partialSetup: 0, degraded: 0 },
  );

export const InstalledOperatorsSection: React.FC<InstalledOperatorsSectionProps> = ({
  capabilities,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved !== null ? (JSON.parse(saved) as boolean) : true;
    } catch {
      return true;
    }
  });

  const onToggle = (_event: React.MouseEvent, expanded: boolean) => {
    setIsExpanded(expanded);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expanded));
    } catch {
      // localStorage unavailable — continue without persistence
    }
  };

  const counts = computeCounts(capabilities);

  const toggleContent = (
    <Flex
      alignItems={{ default: 'alignItemsCenter' }}
      gap={{ default: 'gapMd' }}
      flexWrap={{ default: 'nowrap' }}
    >
      <FlexItem>
        <Title headingLevel="h2" size="lg" id="ols-obs-installed-heading">
          Installed operators and add-ons
        </Title>
      </FlexItem>

      <FlexItem>
        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
          {counts.degraded > 0 && (
            <FlexItem>
              <Label color="red" isCompact>
                {counts.degraded} Degraded
              </Label>
            </FlexItem>
          )}
          {counts.fullyEnabled > 0 && (
            <FlexItem>
              <Label color="green" isCompact>
                {counts.fullyEnabled} Fully enabled
              </Label>
            </FlexItem>
          )}
          {counts.partialSetup > 0 && (
            <FlexItem>
              <Label color="grey" isCompact>
                {counts.partialSetup} Partial setup
              </Label>
            </FlexItem>
          )}
        </Flex>
      </FlexItem>
    </Flex>
  );

  return (
    <section aria-labelledby="ols-obs-installed-heading">
      <ExpandableSection
        isExpanded={isExpanded}
        onToggle={onToggle}
        toggleContent={toggleContent}
        className="ols-obs-services-installed-section"
      >
        {children}
      </ExpandableSection>
    </section>
  );
};

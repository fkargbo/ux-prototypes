import React, { useState } from 'react';
import { ExpandableSection, Flex, FlexItem, Label, Title } from '@patternfly/react-core';
import type { CapabilityCardData } from '../types';

const STORAGE_KEY = 'ocp_obs_hub_recommended_expanded';

export interface RecommendedOperatorsSectionProps {
  capabilities: CapabilityCardData[];
  children: React.ReactNode;
}

export const RecommendedOperatorsSection: React.FC<RecommendedOperatorsSectionProps> = ({
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

  const notInstalledCount = capabilities.length;

  const toggleContent = (
    <Flex
      alignItems={{ default: 'alignItemsCenter' }}
      gap={{ default: 'gapMd' }}
      flexWrap={{ default: 'nowrap' }}
    >
      <FlexItem>
        <Title headingLevel="h2" size="lg" id="ols-obs-recommended-heading">
          Additional capabilities
        </Title>
      </FlexItem>

      {!isExpanded && notInstalledCount > 0 && (
        <FlexItem>
          <Label color="grey" isCompact>
            {notInstalledCount} Available
          </Label>
        </FlexItem>
      )}
    </Flex>
  );

  return (
    <section aria-labelledby="ols-obs-recommended-heading">
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

import React from 'react';
import { Flex, FlexItem, Switch } from '@patternfly/react-core';
import { useActivePerspective } from '@app/shared/contexts/ActivePerspectiveContext';
import {
  resolveAgentCapabilitiesClusterId,
  useAgenticCapabilities,
} from '../context/AgenticCapabilitiesContext';

export const AgenticCapabilitiesHeaderSwitch: React.FC = () => {
  const { activePerspective } = useActivePerspective();
  const isSingleCluster = activePerspective === 'Core platforms';
  const clusterId = resolveAgentCapabilitiesClusterId(isSingleCluster);
  const { isAgentActiveForCluster, setAgentActiveForCluster } = useAgenticCapabilities();
  const isChecked = isAgentActiveForCluster(clusterId);

  return (
    <Flex
      alignItems={{ default: 'alignItemsCenter' }}
      gap={{ default: 'gapSm' }}
      flexWrap={{ default: 'nowrap' }}
      className="ols-agentic-capabilities-header-switch"
    >
      <FlexItem>
        <span
          style={{
            fontSize: 'var(--pf-t--global--font--size--body--sm)',
            fontWeight: 600,
            color: 'var(--pf-t--global--text--color--regular)',
            whiteSpace: 'nowrap',
          }}
        >
          Agentic Capabilities
        </span>
      </FlexItem>
      <FlexItem>
        <Switch
          id={`agentic-capabilities-${clusterId}`}
          aria-label="Agentic Capabilities"
          isChecked={isChecked}
          onChange={(_event, checked) => setAgentActiveForCluster(clusterId, checked)}
        />
      </FlexItem>
    </Flex>
  );
};

import React from 'react';
import { Alert } from '@patternfly/react-core';
import { useActivePerspective } from '@app/shared/contexts/ActivePerspectiveContext';
import {
  getAgenticAutomationDisabledMessage,
  resolveAgentCapabilitiesClusterId,
  useAgenticCapabilities,
} from '../context/AgenticCapabilitiesContext';

/** Persistent page-level banner when the global agentic automation kill switch is off. */
export const AgenticKillSwitchBanner: React.FC = () => {
  const { activePerspective } = useActivePerspective();
  const isSingleCluster = activePerspective === 'Core platforms';
  const agentClusterId = resolveAgentCapabilitiesClusterId(isSingleCluster);
  const { isAgentActiveForCluster } = useAgenticCapabilities();

  if (isAgentActiveForCluster(agentClusterId)) {
    return null;
  }

  return (
    <Alert
      variant="warning"
      isPlain
      title="Agentic automation halted"
      style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
    >
      {getAgenticAutomationDisabledMessage(isSingleCluster)}
    </Alert>
  );
};

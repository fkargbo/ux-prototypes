import React from 'react';
import { Alert, Stack, StackItem } from '@patternfly/react-core';
import { AgenticCapabilitiesHeaderSwitch } from '../components/AgenticCapabilitiesHeaderSwitch';
import {
  getAgenticAutomationDisabledMessage,
  resolveAgentCapabilitiesClusterId,
  useAgenticCapabilities,
} from '../context/AgenticCapabilitiesContext';
import { useActivePerspective } from '@app/shared/contexts/ActivePerspectiveContext';

export const AuditKillSwitchPanel: React.FC = () => {
  const { activePerspective } = useActivePerspective();
  const isSingleCluster = activePerspective === 'Core platforms';
  const clusterId = resolveAgentCapabilitiesClusterId(isSingleCluster);
  const { isAgentActiveForCluster } = useAgenticCapabilities();
  const isAgentActive = isAgentActiveForCluster(clusterId);

  return (
    <Stack hasGutter style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
      <StackItem>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--pf-t--global--spacer--sm)',
            padding: 'var(--pf-t--global--spacer--md)',
            border: '1px solid var(--pf-t--global--border--color--default)',
            borderRadius: 'var(--pf-t--global--border--radius--small)',
          }}
        >
          <AgenticCapabilitiesHeaderSwitch confirmOnDisable />
        </div>
      </StackItem>
      {!isAgentActive && (
        <StackItem>
          <Alert
            variant="warning"
            isInline
            title={getAgenticAutomationDisabledMessage(isSingleCluster)}
          />
        </StackItem>
      )}
    </Stack>
  );
};

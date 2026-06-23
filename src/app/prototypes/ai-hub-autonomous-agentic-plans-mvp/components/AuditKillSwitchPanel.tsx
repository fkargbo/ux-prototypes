import React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
import { AgenticCapabilitiesHeaderSwitch } from '../components/AgenticCapabilitiesHeaderSwitch';

export const AuditKillSwitchPanel: React.FC = () => {
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
    </Stack>
  );
};

import React from 'react';
import { AgenticCapabilitiesHeaderSwitch } from '../components/AgenticCapabilitiesHeaderSwitch';

/*
 * Intentionally uses a plain div instead of PF's Stack layout.
 * PF Stack has `height: 100%` in its CSS — when placed inside a flex or
 * min-height-constrained container it expands to fill the full parent height,
 * pushing AIAuditAndLogsTab to the bottom and creating a large visual gap.
 * A plain div has `height: auto` and avoids the issue entirely.
 */
export const AuditKillSwitchPanel: React.FC = () => (
  <div style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
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
  </div>
);

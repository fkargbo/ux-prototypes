import React from 'react';
import { AgenticCapabilitiesHeaderSwitch } from '../components/AgenticCapabilitiesHeaderSwitch';

/**
 * Settings-style capability row (OpenShift Virtualization Settings precedent):
 * single bordered panel, label + Switch — no nested chip chrome.
 *
 * Plain div instead of PF Stack: Stack's height:100% expands inside flex/min-height
 * parents and leaves a large gap above the audit log.
 */
export const AuditKillSwitchPanel: React.FC = () => (
  <div style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
    <div
      style={{
        padding: 'var(--pf-t--global--spacer--md)',
        border: '1px solid var(--pf-t--global--border--color--default)',
        borderRadius: 'var(--pf-t--global--border--radius--small)',
      }}
    >
      <AgenticCapabilitiesHeaderSwitch confirmOnDisable />
    </div>
  </div>
);

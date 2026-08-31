import React from 'react';
import { Alert, Button, Content } from '@patternfly/react-core';

interface DeniedPlanBannerProps {
  /** Called when the user clicks "Start new investigation". Pass the page's back-navigation handler. */
  onStartNewInvestigation?: () => void;
}

/**
 * Denial callout rendered above the RCA panel when a plan is in the `Denied` state.
 *
 * Denied is a terminal state — the proposal was explicitly rejected by a human operator while
 * in the Proposed phase. The plan is now archived as read-only with all execution actions
 * stripped. To act on the underlying issue, a new investigation must be started.
 */
export const DeniedPlanBanner: React.FC<DeniedPlanBannerProps> = ({ onStartNewInvestigation }) => (
  <Alert
    variant="warning"
    isInline
    title="Proposal denied"
    style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
  >
    <Content component="p" style={{ margin: '0 0 var(--pf-t--global--spacer--sm)' }}>
      This proposal was explicitly denied by a cluster administrator and is now archived as
      read-only. No further execution actions are available on this object. To act on the
      underlying issue, start a new investigation to generate a fresh proposal.
    </Content>
    {onStartNewInvestigation && (
      <Button variant="link" isInline onClick={onStartNewInvestigation}>
        Start new investigation
      </Button>
    )}
  </Alert>
);

/**
 * Mid-flight stop callout rendered above the RCA panel when a plan is in the `EmergencyStopped`
 * state. Complements the global `AgenticKillSwitchBanner` (which reflects automation-toggle state)
 * with plan-specific context about what was halted and what to do next.
 */
export const EmergencyStoppedPlanBanner: React.FC = () => (
  <Alert
    variant="warning"
    isInline
    title="Agentic operations globally halted"
    style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
  >
    <Content component="p" style={{ margin: 0 }}>
      All operations are halted and new proposals will be terminated. Remove or update the
      AgenticOLSConfig to resume.
    </Content>
  </Alert>
);

import React from 'react';
import { Alert, Button, Content } from '@patternfly/react-core';

/**
 * Denial callout rendered above the RCA panel when a plan is in the `Denied` state.
 *
 * Who denied / exact timestamp are not yet tracked by the AgenticRun API (future feature).
 * The prototype shows the intended UX pattern using available context.
 */
export const DeniedPlanBanner: React.FC = () => (
  <Alert
    variant="warning"
    isInline
    title="Proposal denied"
    style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
  >
    <Content component="p" style={{ margin: '0 0 var(--pf-t--global--spacer--sm)' }}>
      This proposal was reviewed and denied by a cluster administrator. No formal denial reason
      was captured — denial attribution and reasoning will be surfaced once the operator API
      supports denial metadata.
    </Content>
    <Button variant="link" isInline>
      Request re-evaluation
    </Button>
  </Alert>
);

/**
 * Mid-flight stop callout rendered above the RCA panel when a plan is in the `EmergencyStopped`
 * state. Complements the global `AgenticKillSwitchBanner` (which reflects automation-toggle state)
 * with plan-specific context about what was halted and what to do next.
 */
export const EmergencyStoppedPlanBanner: React.FC = () => (
  <Alert
    variant="danger"
    isInline
    title="Execution halted — emergency stop issued"
    style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
  >
    <Content component="p" style={{ margin: 0 }}>
      An operator emergency stop was issued during active plan execution. No further automated
      actions will be taken on this proposal. Review the execution timeline below, then schedule a
      retry during a planned maintenance window to avoid data loss.
    </Content>
  </Alert>
);

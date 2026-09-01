import React, { useState } from 'react';
import { Button, Content, Modal, ModalBody, ModalFooter, ModalHeader, ModalVariant, Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import { useLocation } from 'react-router-dom';
import { useActivePerspective } from '@app/shared/contexts/ActivePerspectiveContext';
import {
  DEFAULT_PROTOTYPE_PERSPECTIVE,
  perspectiveKeyFromShellName,
  readPerspectiveFromSearch,
} from '../prototypePerspectiveUrl';
import {
  resolveAgentCapabilitiesClusterId,
  useAgenticCapabilities,
} from '../context/AgenticCapabilitiesContext';

/**
 * Cluster-scoped agentic kill switch.
 * Layout mirrors OpenShift Virtualization → Overview → Settings feature rows:
 * feature name + help on the left, PatternFly Switch on the right (no custom chip chrome).
 */
const AgenticCapabilitiesPopoverBody = (
  <>
    <Content component="p" style={{ margin: '0 0 var(--pf-t--global--spacer--sm)' }}>
      Controls the autonomous analysis engine for this cluster.
    </Content>
    <ul
      style={{
        margin: 0,
        paddingLeft: 'var(--pf-t--global--spacer--md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--pf-t--global--spacer--xs)',
      }}
    >
      <li>
        <strong>When Enabled:</strong> The AI actively monitors incoming alerts, collects diagnostic
        logs, correlates telemetry, and creates structured remediation plans.
      </li>
      <li>
        <strong>When Disabled:</strong> The engine goes entirely code-silent. Background analysis
        halts, active executions freeze, and API token consumption drops to zero.
      </li>
    </ul>
  </>
);

type AgenticCapabilitiesHeaderSwitchProps = {
  /** When true, turning the switch off opens a confirmation modal. */
  confirmOnDisable?: boolean;
};

export const AgenticCapabilitiesHeaderSwitch: React.FC<AgenticCapabilitiesHeaderSwitchProps> = () => {
  const location = useLocation();
  const { activePerspective } = useActivePerspective();
  const perspectiveKey =
    readPerspectiveFromSearch(new URLSearchParams(location.search))
    ?? perspectiveKeyFromShellName(activePerspective)
    ?? DEFAULT_PROTOTYPE_PERSPECTIVE;
  const isSingleCluster = perspectiveKey === 'core-platforms';
  const clusterId = resolveAgentCapabilitiesClusterId(isSingleCluster);

  const labelId = `agentic-capabilities-label-${clusterId}`;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--pf-t--global--spacer--xs)',
      }}
    >
      <span id={labelId}>Agentic capabilities</span>
      <Popover
        headerContent="Cluster agentic capabilities"
        bodyContent={AgenticCapabilitiesPopoverBody}
        position="bottom-end"
      >
        <Button
          variant="plain"
          aria-label="More information about Agentic capabilities"
          icon={<HelpIcon />}
          style={{ padding: 0 }}
        />
      </Popover>
    </span>
  );
};

/**
 * Standalone Enable / Disable AI action button with confirmation modal.
 * Intended for page-heading toolbars — place after the settings (cog) icon.
 */
export const AgenticCapabilitiesActionButton: React.FC = () => {
  const location = useLocation();
  const { activePerspective } = useActivePerspective();
  const perspectiveKey =
    readPerspectiveFromSearch(new URLSearchParams(location.search))
    ?? perspectiveKeyFromShellName(activePerspective)
    ?? DEFAULT_PROTOTYPE_PERSPECTIVE;
  const isSingleCluster = perspectiveKey === 'core-platforms';
  const clusterId = resolveAgentCapabilitiesClusterId(isSingleCluster);
  const { isAgentActiveForCluster, setAgentActiveForCluster } = useAgenticCapabilities();
  const isActive = isAgentActiveForCluster(clusterId);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // After any modal dismiss, the browser never fires mouseleave on the button
  // (the overlay intercepted all pointer events). Dispatching a synthetic mousemove
  // forces the engine to re-evaluate :hover on every element under the cursor.
  const unstickHover = () => {
    requestAnimationFrame(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true }));
    });
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    if (isActive) {
      setIsConfirmOpen(true);
    } else {
      setAgentActiveForCluster(clusterId, true);
      unstickHover();
    }
  };

  const handleConfirmDisable = () => {
    setAgentActiveForCluster(clusterId, false);
    setIsConfirmOpen(false);
    unstickHover();
  };

  const handleModalClose = () => {
    setIsConfirmOpen(false);
    unstickHover();
  };

  return (
    <>
      <Button
        variant="primary"
        onClick={handleClick}
      >
        {isActive ? 'Disable agentic runs' : 'Enable agentic runs'}
      </Button>
      <Popover
        headerContent="Cluster agentic capabilities"
        bodyContent={AgenticCapabilitiesPopoverBody}
        position="bottom-end"
      >
        <Button
          variant="plain"
          aria-label="More information about Agentic capabilities"
          icon={<HelpIcon />}
          style={{ padding: 0 }}
        />
      </Popover>

      <Modal
        variant={ModalVariant.small}
        isOpen={isConfirmOpen}
        onClose={handleModalClose}
        aria-labelledby="disable-ai-title"
      >
        <ModalHeader title="Disable agentic runs?" labelId="disable-ai-title" />
        <ModalBody>
          Stops all background analysis, active executions, and API token consumption for this cluster. You can
          re-enable agentic capabilities at any time.
        </ModalBody>
        <ModalFooter>
          <Button variant="danger" onClick={handleConfirmDisable}>
            Disable agentic runs
          </Button>
          <Button variant="link" onClick={handleModalClose}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

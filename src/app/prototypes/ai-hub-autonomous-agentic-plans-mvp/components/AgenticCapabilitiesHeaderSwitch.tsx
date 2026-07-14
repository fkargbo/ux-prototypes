import React, { useState } from 'react';
import { Button, Content, Flex, FlexItem, Modal, ModalBody, ModalFooter, ModalHeader, ModalVariant, Popover, Switch } from '@patternfly/react-core';
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

const AGENTIC_CAPABILITIES_HELP_BUTTON_STYLE: React.CSSProperties = {
  padding: 0,
  height: '1em',
  minHeight: 'unset',
  display: 'inline-flex',
  alignItems: 'center',
};

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
  /** When true, turning the switch off opens a confirmation modal (Audit & logs kill switch). */
  confirmOnDisable?: boolean;
};

export const AgenticCapabilitiesHeaderSwitch: React.FC<AgenticCapabilitiesHeaderSwitchProps> = ({
  confirmOnDisable = false,
}) => {
  const location = useLocation();
  const { activePerspective } = useActivePerspective();
  const perspectiveKey =
    readPerspectiveFromSearch(new URLSearchParams(location.search))
    ?? perspectiveKeyFromShellName(activePerspective)
    ?? DEFAULT_PROTOTYPE_PERSPECTIVE;
  const isSingleCluster = perspectiveKey === 'core-platforms';
  const clusterId = resolveAgentCapabilitiesClusterId(isSingleCluster);
  const { isAgentActiveForCluster, setAgentActiveForCluster } = useAgenticCapabilities();
  const isChecked = isAgentActiveForCluster(clusterId);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleChange = (_event: React.FormEvent<HTMLInputElement>, checked: boolean) => {
    if (!checked && confirmOnDisable && isChecked) {
      setIsConfirmOpen(true);
      return;
    }
    setAgentActiveForCluster(clusterId, checked);
  };

  const handleConfirmDisable = () => {
    setAgentActiveForCluster(clusterId, false);
    setIsConfirmOpen(false);
  };

  return (
    <>
      <div className="ols-agentic-capabilities-header-switch">
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          gap={{ default: 'gapSm' }}
          flexWrap={{ default: 'nowrap' }}
        >
          <FlexItem>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--pf-t--global--spacer--xs)',
                lineHeight: 'var(--pf-t--global--line-height--body)',
              }}
            >
              <span
                style={{
                  fontSize: 'var(--pf-t--global--font--size--body--sm)',
                  fontWeight: 600,
                  color: 'var(--pf-t--global--text--color--regular)',
                  whiteSpace: 'nowrap',
                }}
              >
                Agentic capabilities
              </span>
              <Popover
                headerContent="Cluster agentic capabilities"
                bodyContent={AgenticCapabilitiesPopoverBody}
                position="bottom-end"
              >
                <Button
                  variant="plain"
                  aria-label="More information about Agentic capabilities"
                  icon={<HelpIcon />}
                  style={AGENTIC_CAPABILITIES_HELP_BUTTON_STYLE}
                />
              </Popover>
            </span>
          </FlexItem>
          <FlexItem>
            <Switch
              id={`agentic-capabilities-${clusterId}`}
              aria-label="Agentic capabilities"
              isChecked={isChecked}
              onChange={handleChange}
            />
          </FlexItem>
        </Flex>
      </div>

      {confirmOnDisable && (
        <Modal
          variant={ModalVariant.small}
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          aria-labelledby="disable-ai-title"
        >
          <ModalHeader title="Disable AI?" labelId="disable-ai-title" />
          <ModalBody>
            Stops all background analysis, active executions, and API token consumption for this cluster. You can
            re-enable agentic capabilities at any time.
          </ModalBody>
          <ModalFooter>
            <Button variant="danger" onClick={handleConfirmDisable}>
              Disable AI
            </Button>
            <Button variant="link" onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
};

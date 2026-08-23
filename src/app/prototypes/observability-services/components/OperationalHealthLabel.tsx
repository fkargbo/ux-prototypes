import React from 'react';
import { Label } from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
import type { CapabilityOperationalState, LabelColor } from '../types';

export interface OperationalHealthLabelProps {
  state: CapabilityOperationalState;
  /** Override the degraded label copy for a specific failure context. */
  customDegradedText?: string;
  className?: string;
}

interface LabelConfig {
  color: LabelColor;
  icon?: React.ReactNode;
  text: string;
  ariaLabel: string;
}

const resolveConfig = (
  state: CapabilityOperationalState,
  customDegradedText?: string,
): LabelConfig | null => {
  switch (state) {
    case 'FULLY_ENABLED':
      return {
        color: 'green',
        icon: <CheckCircleIcon aria-hidden />,
        text: 'Operational health: Healthy',
        ariaLabel: 'Operational health status: Healthy',
      };
    case 'PARTIAL_SETUP':
      return {
        color: 'grey',
        text: 'Operational health: Incomplete setup',
        ariaLabel: 'Operational health status: Incomplete setup',
      };
    case 'DEGRADED':
      return {
        color: 'red',
        icon: <ExclamationCircleIcon aria-hidden />,
        text: customDegradedText ?? 'Operational health: Degraded',
        ariaLabel: 'Operational health status: Degraded',
      };
    case 'NOT_INSTALLED':
    default:
      return null;
  }
};

/**
 * Compact status label summarising the operational health of a capability's
 * dependencies. Renders nothing for NOT_INSTALLED (recommended) cards.
 *
 * Place between the "Dependencies" section heading and the dependency list
 * inside a CapabilityCard's CardBody.
 */
export const OperationalHealthLabel: React.FC<OperationalHealthLabelProps> = ({
  state,
  customDegradedText,
  className,
}) => {
  const config = resolveConfig(state, customDegradedText);
  if (!config) return null;

  return (
    <Label
      color={config.color}
      icon={config.icon}
      isCompact
      aria-label={config.ariaLabel}
      className={className}
    >
      {config.text}
    </Label>
  );
};

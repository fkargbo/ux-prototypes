import React from 'react';
import { Label } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import type { RuntimeHealthState } from '../types';

export type { RuntimeHealthState };

export interface OperationalHealthLabelProps {
  runtimeHealth: RuntimeHealthState;
  /** Optional override for the degraded copy (e.g. "OTELCollector not responding"). */
  customDegradedText?: string;
  className?: string;
}

/**
 * Micro runtime-health callout that renders ONLY when backend pods/CSVs are
 * failing (runtimeHealth === 'DEGRADED'). Operates on a separate axis from
 * the top-right macro enablement badge ('Fully enabled' / 'Partial setup').
 *
 * State matrix:
 *   HEALTHY  → null           (nothing rendered)
 *   DEGRADED → red compact label: "Operational health: Degraded"
 *
 * Place between the "Dependencies" section heading and the dependency list.
 */
export const OperationalHealthLabel: React.FC<OperationalHealthLabelProps> = ({
  runtimeHealth,
  customDegradedText,
  className,
}) => {
  if (runtimeHealth !== 'DEGRADED') {
    return null;
  }

  return (
    <Label
      color="red"
      icon={<ExclamationCircleIcon aria-hidden />}
      isCompact
      aria-label="Operational health status: Degraded"
      className={className}
    >
      {customDegradedText ?? 'Operational health: Degraded'}
    </Label>
  );
};

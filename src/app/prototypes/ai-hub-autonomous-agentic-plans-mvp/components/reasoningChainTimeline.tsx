import React from 'react';
import { Spinner } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  DatabaseIcon,
  ExclamationTriangleIcon,
  NetworkIcon,
  SearchIcon,
} from '@patternfly/react-icons';
import type { ReasoningStep } from '../types/reasoningTypes';

/** Completed steps show the recorded chain time; steps not yet done use a neutral placeholder. */
export function formatReasoningStepDisplayTime(step: ReasoningStep): string {
  if (step.status === 'done') {
    return step.time ?? '—';
  }
  return '00:00:00';
}

/** Timeline node icon for Active Reasoning Chain — pending steps without a typed icon omit the check glyph. */
export function ReasoningChainStepGlyph({ step }: { step: ReasoningStep }): React.ReactNode {
  const status = step.status;
  if (status === 'active') {
    return <Spinner size="sm" />;
  }
  if (status === 'done') {
    return (
      <span style={{ color: 'var(--pf-t--global--color--status--success--default)' }}>
        <CheckCircleIcon />
      </span>
    );
  }
  if (status === 'pending') {
    if (step.icon === 'database') {
      return <DatabaseIcon />;
    }
    if (step.icon === 'network') {
      return <NetworkIcon />;
    }
    if (step.icon === 'search') {
      return <SearchIcon />;
    }
    return null;
  }
  return (
    <span style={{ color: 'var(--pf-t--global--color--status--danger--default)' }}>
      <ExclamationTriangleIcon />
    </span>
  );
}

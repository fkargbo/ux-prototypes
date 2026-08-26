/**
 * SimulationStepBanner
 *
 * Floating prototype control anchored to the bottom-left of the viewport.
 * Intentionally separated from the page design so it does not interfere
 * with stakeholder reviews. Provides the Day 0 ↔ Day 1 scenario toggle
 * and communicates the active simulation step.
 */

import React from 'react';
import { Button, Label } from '@patternfly/react-core';
import { ArrowRightIcon, UndoIcon } from '@patternfly/react-icons';

export type SimulationStep = 'day0' | 'day1';

interface SimulationStepBannerProps {
  step: SimulationStep;
  onAdvance: () => void;
  onReset: () => void;
}

const STEP_META: Record<
  SimulationStep,
  {
    label: string;
    labelColor: 'blue' | 'green';
    description: string;
    actionLabel: string;
    isAdvance: boolean;
  }
> = {
  day0: {
    label: 'Day 0',
    labelColor: 'blue',
    description:
      'COO not yet installed — no capabilities are active. Use the "Install" action on any card or the button below to simulate installing COO.',
    actionLabel: 'Advance to Day 1',
    isAdvance: true,
  },
  day1: {
    label: 'Day 1',
    labelColor: 'green',
    description:
      'COO installed — Metrics & Alerting is now active. Other capabilities are available to configure or enable based on your operational needs.',
    actionLabel: 'Reset to Day 0',
    isAdvance: false,
  },
};

export const SimulationStepBanner: React.FC<SimulationStepBannerProps> = ({
  step,
  onAdvance,
  onReset,
}) => {
  const meta = STEP_META[step];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Prototype simulation: scenario ${meta.label}`}
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 9999,
        width: '260px',
        backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
        border: '1px solid var(--pf-t--global--border--color--default)',
        borderRadius: 'var(--pf-t--global--border--radius--small)',
        boxShadow:
          '0 4px 12px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.08)',
        padding: 'var(--pf-t--global--spacer--md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--pf-t--global--spacer--sm)',
      }}
    >
      {/* Header row: "Prototype control" eyebrow + scenario label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: 'var(--pf-t--global--font--size--body--xs)',
            fontWeight: 'var(--pf-t--global--font--weight--body--bold)',
            color: 'var(--pf-t--global--text--color--subtle)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Prototype control
        </span>
        <Label color={meta.labelColor} isCompact>
          Scenario: {meta.label}
        </Label>
      </div>

      {/* Description */}
      <p
        style={{
          margin: 0,
          fontSize: 'var(--pf-t--global--font--size--body--sm)',
          color: 'var(--pf-t--global--text--color--subtle)',
          lineHeight: 'var(--pf-t--global--font--line-height--body)',
        }}
      >
        {meta.description}
      </p>

      {/* Action button */}
      <Button
        variant="secondary"
        size="sm"
        icon={meta.isAdvance ? <ArrowRightIcon /> : <UndoIcon />}
        iconPosition="end"
        onClick={meta.isAdvance ? onAdvance : onReset}
        style={{ alignSelf: 'flex-start' }}
      >
        {meta.actionLabel}
      </Button>
    </div>
  );
};

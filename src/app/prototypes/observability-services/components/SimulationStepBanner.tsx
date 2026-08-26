/**
 * SimulationStepBanner
 *
 * Floating prototype control fixed to the bottom-left corner of the device
 * viewport, sitting above the page content layer (including the sidebar nav).
 * Lets the presenter toggle the Day 0 ↔ Day 1 scenario without the control
 * being mistaken for part of the design.
 */

import React from 'react';
import { createPortal } from 'react-dom';
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
    actionLabel: 'Advance to Day 1 →',
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

  const panel = (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Prototype simulation: scenario ${meta.label}`}
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 9999,
        width: '300px',
        backgroundColor: '#ffffff',
        border: '1px solid #d2d2d2',
        borderRadius: '4px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.08)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        fontFamily: 'RedHatDisplay, RedHatText, Overpass, overpass, helvetica, arial, sans-serif',
      }}
    >
      <Label color={meta.labelColor} isCompact style={{ alignSelf: 'flex-start' }}>
        Scenario: {meta.label}
      </Label>

      <p
        style={{
          margin: 0,
          fontSize: '14px',
          color: '#151515',
          lineHeight: '1.5',
        }}
      >
        {meta.description}
      </p>

      <Button
        variant="secondary"
        icon={meta.isAdvance ? <ArrowRightIcon /> : <UndoIcon />}
        iconPosition="end"
        onClick={meta.isAdvance ? onAdvance : onReset}
        style={{ alignSelf: 'flex-start' }}
      >
        {meta.actionLabel}
      </Button>
    </div>
  );

  // Portal into document.body so position:fixed is always relative to the
  // viewport — unaffected by any transform / isolation on PF ancestor elements.
  return createPortal(panel, document.body);
};

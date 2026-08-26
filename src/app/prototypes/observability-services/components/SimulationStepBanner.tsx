/**
 * SimulationStepBanner
 *
 * Contextual strip shown at the top of the v2.0.0 capability cards section.
 * Communicates the active scenario to reviewers and provides an explicit
 * control to advance the Day 0 → Day 1 simulation.
 *
 * The "Configure MonitoringStack CR" dep-action button in the Metrics &
 * Alerting card also calls onAdvance() to trigger the same transition.
 */

import React from 'react';
import {
  Button,
  Flex,
  FlexItem,
  Label,
} from '@patternfly/react-core';
import { ArrowRightIcon, UndoIcon } from '@patternfly/react-icons';

export type SimulationStep = 'day0' | 'day1';

interface SimulationStepBannerProps {
  step: SimulationStep;
  onAdvance: () => void;
  onReset: () => void;
}

const STEP_META: Record<
  SimulationStep,
  { label: string; labelColor: 'blue' | 'green'; description: string; actionLabel: string; isAdvance: boolean }
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

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--pf-t--global--spacer--md)',
        padding:
          'var(--pf-t--global--spacer--sm) var(--pf-t--global--spacer--md)',
        borderRadius: 'var(--pf-t--global--border--radius--small)',
        border: '1px dashed var(--pf-t--global--border--color--default)',
        backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
        marginBottom: 'var(--pf-t--global--spacer--md)',
        flexWrap: 'wrap',
      }}
      role="status"
      aria-live="polite"
      aria-label={`Simulation scenario: ${meta.label}`}
    >
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        spaceItems={{ default: 'spaceItemsSm' }}
        flexWrap={{ default: 'wrap' }}
        style={{ flex: 1, gap: 'var(--pf-t--global--spacer--sm)' }}
      >
        <FlexItem>
          <Label color={meta.labelColor} isCompact>
            Scenario: {meta.label}
          </Label>
        </FlexItem>
        <FlexItem>
          <span
            style={{
              fontSize: 'var(--pf-t--global--font--size--body--sm)',
              color: 'var(--pf-t--global--text--color--subtle)',
            }}
          >
            {meta.description}
          </span>
        </FlexItem>
      </Flex>
      <FlexItem>
        <Button
          variant="secondary"
          size="sm"
          icon={meta.isAdvance ? <ArrowRightIcon /> : <UndoIcon />}
          iconPosition="end"
          onClick={meta.isAdvance ? onAdvance : onReset}
        >
          {meta.actionLabel}
        </Button>
      </FlexItem>
    </div>
  );
};

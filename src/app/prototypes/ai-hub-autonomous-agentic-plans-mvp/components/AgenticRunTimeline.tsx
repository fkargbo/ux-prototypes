import React, { useState } from 'react';
import {
  ExpandableSection,
  Flex,
  ProgressStep,
  ProgressStepper,
  Title,
} from '@patternfly/react-core';
import type { PlanStatus } from '../types/planStatus';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TimelineStepVariant = 'success' | 'info' | 'warning' | 'danger' | 'pending';

export interface TimelineStep {
  /** Unique step id */
  id: string;
  /** OTel span / event name from audit.go */
  event: string;
  /** Human-readable label shown in the stepper */
  label: string;
  /** Optional sub-text (timestamp or short note) */
  description?: string;
  /** PF ProgressStep variant */
  variant: TimelineStepVariant;
  /** Whether this is the currently active step (shows spinner-style emphasis) */
  isCurrent?: boolean;
}

// ─── Step builder ─────────────────────────────────────────────────────────────

/**
 * Returns a timestamp string offset from a base ISO date by the given minutes.
 * Used to simulate realistic audit-log timestamps in the prototype.
 */
function offsetTimestamp(baseIso: string, offsetMinutes: number): string {
  const d = new Date(new Date(baseIso).getTime() + offsetMinutes * 60_000);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

/**
 * Maps a plan status to a full ordered list of the 12 backend-supported
 * OLS audit events, assigning each step the correct variant and marking
 * the current active step.
 */
export function buildTimelineSteps(
  status: PlanStatus,
  createdAt: string = new Date().toISOString(),
  retryCount = 0,
): TimelineStep[] {
  const t = (min: number) => offsetTimestamp(createdAt, min);

  // Helper to build a step
  const step = (
    id: string,
    event: string,
    label: string,
    variant: TimelineStepVariant,
    descriptionOrOffset?: string | number,
    isCurrent?: boolean,
  ): TimelineStep => ({
    id,
    event,
    label,
    variant,
    description: typeof descriptionOrOffset === 'number' ? t(descriptionOrOffset) : descriptionOrOffset,
    isCurrent,
  });

  const done  = (id: string, event: string, label: string, offset: number) => step(id, event, label, 'success', offset);
  const active = (id: string, event: string, label: string, offset: number) => step(id, event, label, 'info',    offset, true);
  const waiting= (id: string, event: string, label: string)                => step(id, event, label, 'pending');
  const failed = (id: string, event: string, label: string, offset: number) => step(id, event, label, 'danger',  offset);
  const warn   = (id: string, event: string, label: string, offset: number) => step(id, event, label, 'warning', offset);

  switch (status) {
    // ── Pre-analysis ──────────────────────────────────────────────────────────
    case 'Pending':
      return [
        active('s1', 'agenticrun.received',  'Run created — controller dispatched', 0),
        waiting('s2', 'agenticrun.analyze',   'Analysis phase started'),
        waiting('s3', 'agenticrun.analysis.completed', 'Analysis completed'),
        waiting('s4', 'agenticrun.human_approval',     'Human approval recorded'),
        waiting('s5', 'agenticrun.execute',            'Execution phase started'),
        waiting('s6', 'agenticrun.execution.completed','Execution completed'),
        waiting('s7', 'agenticrun.verify',             'Verification phase started'),
        waiting('s8', 'agenticrun.verification.completed', 'Verification completed'),
        waiting('s9', 'agenticrun.terminal',           'Terminal state reached'),
      ];

    case 'Analyzing':
      return [
        done ('s1', 'agenticrun.received',  'Run created — controller dispatched', 0),
        active('s2', 'agenticrun.analyze',   'Analysis phase started', 1),
        waiting('s3', 'agenticrun.analysis.completed', 'Analysis completed'),
        waiting('s4', 'agenticrun.human_approval',     'Human approval recorded'),
        waiting('s5', 'agenticrun.execute',            'Execution phase started'),
        waiting('s6', 'agenticrun.execution.completed','Execution completed'),
        waiting('s7', 'agenticrun.verify',             'Verification phase started'),
        waiting('s8', 'agenticrun.verification.completed', 'Verification completed'),
        waiting('s9', 'agenticrun.terminal',           'Terminal state reached'),
      ];

    // ── Awaiting approval ────────────────────────────────────────────────────
    case 'Proposed':
      return [
        done  ('s1', 'agenticrun.received',           'Run created — controller dispatched', 0),
        done  ('s2', 'agenticrun.analyze',             'Analysis phase started', 1),
        done  ('s3', 'agenticrun.analysis.completed',  'Analysis completed', 4),
        active('s4', 'agenticrun.human_approval',      'Human approval requested', 5),
        waiting('s5', 'agenticrun.execute',             'Execution phase started'),
        waiting('s6', 'agenticrun.execution.completed', 'Execution completed'),
        waiting('s7', 'agenticrun.verify',              'Verification phase started'),
        waiting('s8', 'agenticrun.verification.completed', 'Verification completed'),
        waiting('s9', 'agenticrun.terminal',            'Terminal state reached'),
      ];

    // ── Denied ────────────────────────────────────────────────────────────────
    case 'Denied':
      return [
        done  ('s1', 'agenticrun.received',          'Run created — controller dispatched', 0),
        done  ('s2', 'agenticrun.analyze',            'Analysis phase started', 1),
        done  ('s3', 'agenticrun.analysis.completed', 'Analysis completed', 4),
        failed('s4', 'agenticrun.human_approval',     'Human approval — denied by operator', 6),
        failed('s5', 'agenticrun.terminal',           'Terminal state reached — Denied', 6),
      ];

    // ── Execution ─────────────────────────────────────────────────────────────
    case 'Executing': {
      const retrySteps: TimelineStep[] = [];
      for (let i = 0; i < retryCount; i++) {
        retrySteps.push(
          warn(`sr-verify-${i}`, 'agenticrun.verification.retry',
            `Verification failed — execution retry ${i + 1}`, 18 + i * 8),
          done(`sr-exec-${i}`, 'agenticrun.execute',
            `Execution phase started (retry ${i + 1})`, 20 + i * 8),
        );
      }
      return [
        done  ('s1', 'agenticrun.received',           'Run created — controller dispatched', 0),
        done  ('s2', 'agenticrun.analyze',             'Analysis phase started', 1),
        done  ('s3', 'agenticrun.analysis.completed',  'Analysis completed', 4),
        done  ('s4', 'agenticrun.human_approval',      'Human approval — approved', 6),
        done  ('s5', 'agenticrun.execute',             'Execution phase started', 7),
        ...retrySteps,
        active('s6', 'agenticrun.execute',             retryCount > 0 ? `Execution phase started (retry ${retryCount})` : 'Execution phase started', 7 + retryCount * 8),
        waiting('s7', 'agenticrun.execution.completed', 'Execution completed'),
        waiting('s8', 'agenticrun.verify',              'Verification phase started'),
        waiting('s9', 'agenticrun.verification.completed', 'Verification completed'),
        waiting('s10', 'agenticrun.terminal',           'Terminal state reached'),
      ];
    }

    // ── Verifying ────────────────────────────────────────────────────────────
    case 'Verifying':
      return [
        done  ('s1', 'agenticrun.received',            'Run created — controller dispatched', 0),
        done  ('s2', 'agenticrun.analyze',              'Analysis phase started', 1),
        done  ('s3', 'agenticrun.analysis.completed',   'Analysis completed', 4),
        done  ('s4', 'agenticrun.human_approval',       'Human approval — approved', 6),
        done  ('s5', 'agenticrun.execute',              'Execution phase started', 7),
        done  ('s6', 'agenticrun.execution.completed',  'Execution completed', 14),
        active('s7', 'agenticrun.verify',               'Verification phase started', 15),
        waiting('s8', 'agenticrun.verification.completed', 'Verification completed'),
        waiting('s9', 'agenticrun.terminal',            'Terminal state reached'),
      ];

    // ── Completed ────────────────────────────────────────────────────────────
    case 'Completed':
      return [
        done('s1', 'agenticrun.received',             'Run created — controller dispatched', 0),
        done('s2', 'agenticrun.analyze',               'Analysis phase started', 1),
        done('s3', 'agenticrun.analysis.completed',    'Analysis completed', 4),
        done('s4', 'agenticrun.human_approval',        'Human approval — approved', 6),
        done('s5', 'agenticrun.execute',               'Execution phase started', 7),
        done('s6', 'agenticrun.execution.completed',   'Execution completed', 14),
        done('s7', 'agenticrun.verify',                'Verification phase started', 15),
        done('s8', 'agenticrun.verification.completed','Verification completed', 19),
        done('s9', 'agenticrun.terminal',              'Terminal state reached — Completed', 20),
      ];

    // ── Failed ────────────────────────────────────────────────────────────────
    case 'Failed':
      return [
        done  ('s1', 'agenticrun.received',            'Run created — controller dispatched', 0),
        done  ('s2', 'agenticrun.analyze',              'Analysis phase started', 1),
        done  ('s3', 'agenticrun.analysis.completed',   'Analysis completed', 4),
        done  ('s4', 'agenticrun.human_approval',       'Human approval — approved', 6),
        done  ('s5', 'agenticrun.execute',              'Execution phase started', 7),
        done  ('s6', 'agenticrun.execution.completed',  'Execution completed', 14),
        done  ('s7', 'agenticrun.verify',               'Verification phase started', 15),
        warn  ('s8', 'agenticrun.verification.retry',   'Verification failed — execution retry 1', 18),
        warn  ('sr2', 'agenticrun.verification.retry',  'Verification failed — execution retry 2', 26),
        warn  ('sr3', 'agenticrun.verification.retry',  'Verification failed — execution retry 3', 34),
        failed('s9', 'agenticrun.terminal',             'Terminal state reached — retries exhausted', 36),
      ];

    // ── Escalating ────────────────────────────────────────────────────────────
    case 'Escalating':
      return [
        done  ('s1', 'agenticrun.received',            'Run created — controller dispatched', 0),
        done  ('s2', 'agenticrun.analyze',              'Analysis phase started', 1),
        done  ('s3', 'agenticrun.analysis.completed',   'Analysis completed', 4),
        done  ('s4', 'agenticrun.human_approval',       'Human approval — approved', 6),
        done  ('s5', 'agenticrun.execute',              'Execution phase started', 7),
        done  ('s6', 'agenticrun.execution.completed',  'Execution completed', 14),
        done  ('s7', 'agenticrun.verify',               'Verification phase started', 15),
        warn  ('s8', 'agenticrun.verification.retry',   'Verification failed — execution retries exhausted', 34),
        active('s9', 'agenticrun.escalate',             'Escalation phase started', 36),
        waiting('s10', 'agenticrun.escalation.completed', 'Escalation completed'),
        waiting('s11', 'agenticrun.terminal',            'Terminal state reached'),
      ];

    // ── Escalated ─────────────────────────────────────────────────────────────
    case 'Escalated':
      return [
        done('s1', 'agenticrun.received',              'Run created — controller dispatched', 0),
        done('s2', 'agenticrun.analyze',                'Analysis phase started', 1),
        done('s3', 'agenticrun.analysis.completed',     'Analysis completed', 4),
        done('s4', 'agenticrun.human_approval',         'Human approval — approved', 6),
        done('s5', 'agenticrun.execute',                'Execution phase started', 7),
        done('s6', 'agenticrun.execution.completed',    'Execution completed', 14),
        done('s7', 'agenticrun.verify',                 'Verification phase started', 15),
        warn('s8', 'agenticrun.verification.retry',     'Verification failed — execution retries exhausted', 34),
        warn('s9', 'agenticrun.escalate',               'Escalation phase started', 36),
        warn('s10', 'agenticrun.escalation.completed',  'Escalation completed — human intervention required', 42),
        warn('s11', 'agenticrun.terminal',              'Terminal state reached — Escalated', 43),
      ];

    // ── Emergency stopped ────────────────────────────────────────────────────
    case 'EmergencyStopped':
    case 'Plan aborted':
      return [
        done  ('s1', 'agenticrun.received',  'Run created — controller dispatched', 0),
        done  ('s2', 'agenticrun.analyze',    'Analysis phase started', 1),
        done  ('s3', 'agenticrun.analysis.completed', 'Analysis completed', 4),
        done  ('s4', 'agenticrun.human_approval',     'Human approval — approved', 6),
        done  ('s5', 'agenticrun.execute',            'Execution phase started', 7),
        failed('s6', 'agenticrun.terminal',           'Terminal state reached — Emergency stopped', 11),
      ];

    // ── Approved (execution imminent) ────────────────────────────────────────
    case 'Approved':
      return [
        done  ('s1', 'agenticrun.received',           'Run created — controller dispatched', 0),
        done  ('s2', 'agenticrun.analyze',             'Analysis phase started', 1),
        done  ('s3', 'agenticrun.analysis.completed',  'Analysis completed', 4),
        done  ('s4', 'agenticrun.human_approval',      'Human approval — approved', 6),
        active('s5', 'agenticrun.execute',             'Execution phase started', 7),
        waiting('s6', 'agenticrun.execution.completed','Execution completed'),
        waiting('s7', 'agenticrun.verify',             'Verification phase started'),
        waiting('s8', 'agenticrun.verification.completed', 'Verification completed'),
        waiting('s9', 'agenticrun.terminal',           'Terminal state reached'),
      ];

    // ── Acknowledged (analysis-only, reviewed by operator) ───────────────────
    case 'Acknowledged':
      return [
        done('s1', 'agenticrun.received',          'Run created — controller dispatched', 0),
        done('s2', 'agenticrun.analyze',            'Analysis phase started', 1),
        done('s3', 'agenticrun.analysis.completed', 'Analysis completed — investigation only', 4),
        done('s4', 'agenticrun.terminal',           'Terminal state reached — Acknowledged', 5),
      ];

    default:
      return [
        done('s1', 'agenticrun.received', 'Run created — controller dispatched', 0),
      ];
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface AgenticRunTimelineProps {
  status: PlanStatus;
  createdAt?: string;
  retryCount?: number;
}

export const AgenticRunTimeline: React.FC<AgenticRunTimelineProps> = ({
  status,
  createdAt,
  retryCount = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Only surface steps that have been processed or are currently in progress.
  // Pending (unreached) steps are intentionally excluded — not all runs pass
  // through every phase (e.g. Denied runs never reach execution).
  const steps = buildTimelineSteps(status, createdAt, retryCount).filter(
    (s) => s.variant !== 'pending',
  );

  if (steps.length === 0) return null;

  return (
    <ExpandableSection
      toggleText=""
      isExpanded={isExpanded}
      onToggle={(_e, expanded) => setIsExpanded(expanded)}
      toggleContent={
        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
          <Title headingLevel="h4" size="md">
            Timeline
          </Title>
        </Flex>
      }
    >
      <ProgressStepper
        isVertical
        aria-label="Agentic run timeline"
        style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}
      >
        {steps.map((s) => (
          <ProgressStep
            key={s.id}
            variant={s.variant}
            description={s.description}
            titleId={s.id}
            aria-label={s.label}
          >
            {s.label}
          </ProgressStep>
        ))}
      </ProgressStepper>
    </ExpandableSection>
  );
};

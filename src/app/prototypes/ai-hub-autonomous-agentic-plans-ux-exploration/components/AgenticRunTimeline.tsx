import React, { useState } from 'react';
import {
  Content,
  ExpandableSection,
  Title,
} from '@patternfly/react-core';
import {
  RhUiCheckCircleFillIcon,
  RhUiErrorFillIcon,
  RhUiInProgressIcon,
  RhUiPendingIcon,
  RhUiWarningFillIcon,
} from '@patternfly/react-icons';
import type { PlanStatus } from '../types/planStatus';
import {
  AnalysisLogsExpandable,
  type AnalysisLogsLifecycle,
} from './AnalysisLogsExpandable';
import { ExpandableCodeBlock } from './ExpandableCodeBlock';
import './agenticRunTimeline.css';

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

/** Contextual evidence surfaced inline on expandable timeline phases (HPUX-2106). */
export interface AgenticRunTimelineEvidenceContext {
  planId: string;
  request?: string | null;
  analysisLogsLifecycle: AnalysisLogsLifecycle;
  logFinding: string;
  logNarrative: string;
  aggregatedFinding?: string;
  rootCauseNarrative?: string;
  executionLogText?: string;
  verificationLogText?: string;
  escalationLogText?: string;
  traceId?: string;
  runStatus: PlanStatus;
  isAwaitingAnalysisApproval?: boolean;
}

/** Inline phase bodies for melded Agentic Run Details (HPUX-2106). */
export type MeldedTimelineSlots = {
  analysisPhaseStarted?: React.ReactNode;
  humanApprovalRequested?: React.ReactNode;
  executionPhaseCompleted?: React.ReactNode;
  verificationPhaseStarted?: React.ReactNode;
  verificationPhaseCompleted?: React.ReactNode;
  /** Extra content below terminal timestamp (e.g. status badge). */
  terminal?: React.ReactNode;
};

type TimelinePhaseEvidence = {
  toggleCollapsed: string;
  toggleExpanded: string;
  content: (isExpanded: boolean) => React.ReactNode;
};

// ─── PatternFly Timeline (semantic list + PF tokens; HPUX-2106) ───────────────

const Timeline: React.FC<{ 'aria-label': string; children: React.ReactNode }> = ({
  'aria-label': ariaLabel,
  children,
}) => (
  <ol className="ols-agentic-run-timeline" aria-label={ariaLabel}>
    {children}
  </ol>
);

function stepIndicatorIcon(variant: TimelineStepVariant, isCurrent?: boolean): React.ReactNode {
  if (isCurrent || variant === 'info') {
    return (
      <RhUiInProgressIcon
        style={{ color: 'var(--pf-t--global--icon--color--status--info--default)' }}
        aria-hidden
      />
    );
  }
  switch (variant) {
    case 'success':
      return (
        <RhUiCheckCircleFillIcon
          style={{ color: 'var(--pf-t--global--icon--color--status--success--default)' }}
          aria-hidden
        />
      );
    case 'warning':
      return (
        <RhUiWarningFillIcon
          style={{ color: 'var(--pf-t--global--icon--color--status--warning--default)' }}
          aria-hidden
        />
      );
    case 'danger':
      return (
        <RhUiErrorFillIcon
          style={{ color: 'var(--pf-t--global--icon--color--status--danger--default)' }}
          aria-hidden
        />
      );
    default:
      return (
        <RhUiPendingIcon
          style={{ color: 'var(--pf-t--global--icon--color--subtle)' }}
          aria-hidden
        />
      );
  }
}

const TimelineItem: React.FC<{
  step: TimelineStep;
  evidence: TimelinePhaseEvidence | null;
  meldedBody?: React.ReactNode;
  defaultExpanded?: boolean;
  terminalExtra?: React.ReactNode;
}> = ({ step, evidence, meldedBody, defaultExpanded = false, terminalExtra }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const contentId = `timeline-evidence-${step.id}`;

  return (
    <li className="ols-agentic-run-timeline__item">
      <div className="ols-agentic-run-timeline__indicator" aria-hidden>
        {stepIndicatorIcon(step.variant, step.isCurrent)}
      </div>
      <div className="ols-agentic-run-timeline__content">
        <Content
          component="p"
          style={{
            fontWeight: 'var(--pf-t--global--font--weight--body--bold)' as React.CSSProperties['fontWeight'],
            marginBottom: step.description ? 'var(--pf-t--global--spacer--xs)' : 0,
          }}
        >
          {step.label}
        </Content>
        {step.description && (
          <Content
            component="small"
            style={{ display: 'block', color: 'var(--pf-t--global--text--color--subtle)' }}
          >
            {step.description}
          </Content>
        )}
        {terminalExtra && (
          <div style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}>{terminalExtra}</div>
        )}
        {meldedBody && (
          <ExpandableSection
            toggleId={`${contentId}-toggle`}
            contentId={contentId}
            isExpanded={isExpanded}
            onToggle={(_event, expanded) => setIsExpanded(expanded)}
            toggleTextCollapsed="Show phase details"
            toggleTextExpanded="Hide phase details"
          >
            <div id={contentId} style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}>
              {meldedBody}
            </div>
          </ExpandableSection>
        )}
        {!meldedBody && evidence && (
          <ExpandableSection
            toggleId={`${contentId}-toggle`}
            contentId={contentId}
            isExpanded={isExpanded}
            onToggle={(_event, expanded) => setIsExpanded(expanded)}
            toggleTextCollapsed={evidence.toggleCollapsed}
            toggleTextExpanded={evidence.toggleExpanded}
          >
            <div id={contentId}>{evidence.content(isExpanded)}</div>
          </ExpandableSection>
        )}
      </div>
    </li>
  );
};

function resolveMeldedBody(step: TimelineStep, slots: MeldedTimelineSlots | undefined): React.ReactNode | undefined {
  if (!slots) return undefined;
  const { event } = step;
  if (event === 'agenticrun.analyze' && slots.analysisPhaseStarted) return slots.analysisPhaseStarted;
  if (event === 'agenticrun.human_approval' && slots.humanApprovalRequested) return slots.humanApprovalRequested;
  if (
    (event === 'agenticrun.execution.completed' || event.startsWith('sr-exec-'))
    && slots.executionPhaseCompleted
  ) {
    return slots.executionPhaseCompleted;
  }
  if (
    (event === 'agenticrun.verification.completed' || event === 'agenticrun.verification.retry')
    && slots.verificationPhaseCompleted
  ) {
    return slots.verificationPhaseCompleted;
  }
  if (event === 'agenticrun.verify' && slots.verificationPhaseStarted) {
    return slots.verificationPhaseStarted;
  }
  return undefined;
}

function shouldDefaultExpandStep(step: TimelineStep, defaultExpandedEvents: readonly string[]): boolean {
  return defaultExpandedEvents.includes(step.event);
}

function resolveTimelinePhaseEvidence(
  step: TimelineStep,
  ctx: AgenticRunTimelineEvidenceContext | undefined,
  status: PlanStatus,
): TimelinePhaseEvidence | null {
  if (!ctx) return null;

  const { event } = step;

  if (event === 'agenticrun.analyze') {
    if (ctx.isAwaitingAnalysisApproval && status === 'Pending') return null;
    if (step.variant === 'pending') return null;
    return {
      toggleCollapsed: 'View analysis logs',
      toggleExpanded: 'Hide analysis logs',
      content: (isExpanded) => (
        <AnalysisLogsExpandable
          planId={ctx.planId}
          finding={ctx.logFinding}
          narrative={ctx.logNarrative}
          lifecycle={ctx.analysisLogsLifecycle}
          idPrefix={`timeline-analysis-${ctx.planId}`}
          embedded
          embeddedExpanded={isExpanded}
        />
      ),
    };
  }

  if (event === 'agenticrun.analysis.completed') {
    return null;
  }

  if (event === 'agenticrun.execution.completed' || event.startsWith('sr-exec-')) {
    if (!ctx.executionLogText?.trim()) return null;
    return {
      toggleCollapsed: 'View execution evidence',
      toggleExpanded: 'Hide execution evidence',
      content: () => (
        <ExpandableCodeBlock
          id={`timeline-exec-${ctx.planId}-${step.id}`}
          code={ctx.executionLogText ?? ''}
          codeStyle={{ fontSize: '12px', maxHeight: '280px', overflowY: 'auto' }}
        />
      ),
    };
  }

  if (event === 'agenticrun.execute') {
    if (!ctx.executionLogText?.trim()) return null;
    if (!step.isCurrent) return null;
    return {
      toggleCollapsed: 'View execution evidence',
      toggleExpanded: 'Hide execution evidence',
      content: () => (
        <ExpandableCodeBlock
          id={`timeline-exec-active-${ctx.planId}-${step.id}`}
          code={ctx.executionLogText ?? ''}
          codeStyle={{ fontSize: '12px', maxHeight: '280px', overflowY: 'auto' }}
        />
      ),
    };
  }

  if (event === 'agenticrun.verification.completed' || event === 'agenticrun.verification.retry') {
    if (!ctx.verificationLogText?.trim()) return null;
    return {
      toggleCollapsed: 'View verification evidence',
      toggleExpanded: 'Hide verification evidence',
      content: () => (
        <ExpandableCodeBlock
          id={`timeline-verify-${ctx.planId}-${step.id}`}
          code={ctx.verificationLogText ?? ''}
          codeStyle={{ fontSize: '12px', maxHeight: '240px', overflowY: 'auto' }}
        />
      ),
    };
  }

  if (event === 'agenticrun.verify') {
    if (!ctx.verificationLogText?.trim()) return null;
    if (!step.isCurrent) return null;
    return {
      toggleCollapsed: 'View verification evidence',
      toggleExpanded: 'Hide verification evidence',
      content: () => (
        <ExpandableCodeBlock
          id={`timeline-verify-active-${ctx.planId}-${step.id}`}
          code={ctx.verificationLogText ?? ''}
          codeStyle={{ fontSize: '12px', maxHeight: '240px', overflowY: 'auto' }}
        />
      ),
    };
  }

  if (event === 'agenticrun.escalate' || event === 'agenticrun.escalation.completed') {
    if (!ctx.escalationLogText?.trim()) return null;
    return {
      toggleCollapsed: 'View escalation evidence',
      toggleExpanded: 'Hide escalation evidence',
      content: () => (
        <ExpandableCodeBlock
          id={`timeline-escalation-${ctx.planId}`}
          code={ctx.escalationLogText ?? ''}
          codeStyle={{ fontSize: '12px', maxHeight: '240px', overflowY: 'auto' }}
        />
      ),
    };
  }

  return null;
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
 *
 * @param isAwaitingAnalysisApproval - When true (Pending + manual policy gate),
 *   inserts an explicit "Human approval requested" active step before analysis begins.
 */
export function buildTimelineSteps(
  status: PlanStatus,
  createdAt: string = new Date().toISOString(),
  retryCount = 0,
  isAwaitingAnalysisApproval = false,
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
      // When the run is gated on human approval before analysis can begin,
      // surface that gate as an explicit active step so the operator understands why nothing has progressed.
      if (isAwaitingAnalysisApproval) {
        return [
          done  ('s1', 'agenticrun.received',            'Run created — controller dispatched', 0),
          active('s2', 'agenticrun.human_approval',       'Human approval requested — awaiting analysis approval', 1),
          waiting('s3', 'agenticrun.analyze',             'Analysis phase started'),
          waiting('s4', 'agenticrun.analysis.completed',  'Analysis completed'),
          waiting('s5', 'agenticrun.execute',             'Execution phase started'),
          waiting('s6', 'agenticrun.execution.completed', 'Execution phase completed'),
          waiting('s7', 'agenticrun.verify',              'Verification phase started'),
          waiting('s8', 'agenticrun.verification.completed', 'Verification phase completed'),
          waiting('s9', 'agenticrun.terminal',            'Terminal state reached'),
        ];
      }
      return [
        active('s1', 'agenticrun.received',  'Run created — controller dispatched', 0),
        waiting('s2', 'agenticrun.analyze',   'Analysis phase started'),
        waiting('s3', 'agenticrun.analysis.completed', 'Analysis completed'),
        waiting('s4', 'agenticrun.human_approval',     'Human approval recorded'),
        waiting('s5', 'agenticrun.execute',            'Execution phase started'),
        waiting('s6', 'agenticrun.execution.completed','Execution phase completed'),
        waiting('s7', 'agenticrun.verify',             'Verification phase started'),
        waiting('s8', 'agenticrun.verification.completed', 'Verification phase completed'),
        waiting('s9', 'agenticrun.terminal',           'Terminal state reached'),
      ];

    case 'Analyzing':
      return [
        done ('s1', 'agenticrun.received',  'Run created — controller dispatched', 0),
        active('s2', 'agenticrun.analyze',   'Analysis phase started', 1),
        waiting('s3', 'agenticrun.analysis.completed', 'Analysis completed'),
        waiting('s4', 'agenticrun.human_approval',     'Human approval recorded'),
        waiting('s5', 'agenticrun.execute',            'Execution phase started'),
        waiting('s6', 'agenticrun.execution.completed','Execution phase completed'),
        waiting('s7', 'agenticrun.verify',             'Verification phase started'),
        waiting('s8', 'agenticrun.verification.completed', 'Verification phase completed'),
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
        waiting('s6', 'agenticrun.execution.completed', 'Execution phase completed'),
        waiting('s7', 'agenticrun.verify',              'Verification phase started'),
        waiting('s8', 'agenticrun.verification.completed', 'Verification phase completed'),
        waiting('s9', 'agenticrun.terminal',            'Terminal state reached'),
      ];

    // ── Denied ────────────────────────────────────────────────────────────────
    case 'Denied':
      return [
        done  ('s1', 'agenticrun.received',          'Run created — controller dispatched', 0),
        done  ('s2', 'agenticrun.analyze',            'Analysis phase started', 1),
        done  ('s3', 'agenticrun.analysis.completed', 'Analysis completed', 4),
        failed('s4', 'agenticrun.human_approval',     'Human approval — denied by operator', 6),
        failed('s5', 'agenticrun.terminal',           'Terminal state reached', 6),
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
      const execLabel = retryCount > 0
        ? `Execution phase started (retry ${retryCount + 1})`
        : 'Execution phase started';
      return [
        done  ('s1', 'agenticrun.received',           'Run created — controller dispatched', 0),
        done  ('s2', 'agenticrun.analyze',             'Analysis phase started', 1),
        done  ('s3', 'agenticrun.analysis.completed',  'Analysis completed', 4),
        done  ('s4', 'agenticrun.human_approval',      'Human approval requested', 6),
        ...retrySteps,
        active('s5', 'agenticrun.execute',             execLabel, 7 + retryCount * 8),
        waiting('s6', 'agenticrun.execution.completed', 'Execution phase completed'),
        waiting('s7', 'agenticrun.verify',              'Verification phase started'),
        waiting('s8', 'agenticrun.verification.completed', 'Verification phase completed'),
        waiting('s9', 'agenticrun.terminal',           'Terminal state reached'),
      ];
    }

    // ── Verifying ────────────────────────────────────────────────────────────
    case 'Verifying':
      return [
        done  ('s1', 'agenticrun.received',            'Run created — controller dispatched', 0),
        done  ('s2', 'agenticrun.analyze',              'Analysis phase started', 1),
        done  ('s3', 'agenticrun.analysis.completed',   'Analysis completed', 4),
        done  ('s4', 'agenticrun.human_approval',       'Human approval requested', 6),
        done  ('s5', 'agenticrun.execute',              'Execution phase started', 7),
        done  ('s6', 'agenticrun.execution.completed',  'Execution phase completed', 14),
        active('s7', 'agenticrun.verify',               'Verification phase started', 15),
        waiting('s8', 'agenticrun.verification.completed', 'Verification phase completed'),
        waiting('s9', 'agenticrun.terminal',            'Terminal state reached'),
      ];

    // ── Completed ────────────────────────────────────────────────────────────
    case 'Completed':
      return [
        done('s1', 'agenticrun.received',             'Run created — controller dispatched', 0),
        done('s2', 'agenticrun.analyze',               'Analysis phase started', 1),
        done('s3', 'agenticrun.analysis.completed',    'Analysis completed', 4),
        done('s4', 'agenticrun.human_approval',        'Human approval requested', 6),
        done('s5', 'agenticrun.execute',               'Execution phase started', 7),
        done('s6', 'agenticrun.execution.completed',   'Execution phase completed', 14),
        done('s7', 'agenticrun.verify',                'Verification phase started', 15),
        done('s8', 'agenticrun.verification.completed','Verification phase completed', 19),
        done('s9', 'agenticrun.terminal',              'Terminal state reached', 20),
      ];

    // ── Failed ────────────────────────────────────────────────────────────────
    case 'Failed':
      return [
        done  ('s1', 'agenticrun.received',            'Run created — controller dispatched', 0),
        done  ('s2', 'agenticrun.analyze',              'Analysis phase started', 1),
        done  ('s3', 'agenticrun.analysis.completed',   'Analysis completed', 4),
        done  ('s4', 'agenticrun.human_approval',       'Human approval requested', 6),
        done  ('s5', 'agenticrun.execute',              'Execution phase started', 7),
        done  ('s6', 'agenticrun.execution.completed',  'Execution phase completed', 14),
        done  ('s7', 'agenticrun.verify',               'Verification phase started', 15),
        warn  ('s8', 'agenticrun.verification.retry',   'Verification failed — execution retry 1', 18),
        warn  ('sr2', 'agenticrun.verification.retry',  'Verification failed — execution retry 2', 26),
        warn  ('sr3', 'agenticrun.verification.retry',  'Verification failed — execution retry 3', 34),
        failed('s9', 'agenticrun.terminal',             'Terminal state reached', 36),
      ];

    // ── Escalating ────────────────────────────────────────────────────────────
    case 'Escalating':
      return [
        done  ('s1', 'agenticrun.received',            'Run created — controller dispatched', 0),
        done  ('s2', 'agenticrun.analyze',              'Analysis phase started', 1),
        done  ('s3', 'agenticrun.analysis.completed',   'Analysis completed', 4),
        done  ('s4', 'agenticrun.human_approval',       'Human approval requested', 6),
        done  ('s5', 'agenticrun.execute',              'Execution phase started', 7),
        done  ('s6', 'agenticrun.execution.completed',  'Execution phase completed', 14),
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
        done('s4', 'agenticrun.human_approval',         'Human approval requested', 6),
        done('s5', 'agenticrun.execute',                'Execution phase started', 7),
        done('s6', 'agenticrun.execution.completed',    'Execution completed', 14),
        done('s7', 'agenticrun.verify',                 'Verification phase started', 15),
        warn('s8', 'agenticrun.verification.retry',     'Verification failed — execution retries exhausted', 34),
        warn('s9', 'agenticrun.escalate',               'Escalation phase started', 36),
        warn('s10', 'agenticrun.escalation.completed',  'Escalation completed — human intervention required', 42),
        warn('s11', 'agenticrun.terminal',              'Terminal state reached — Escalated', 43),
      ];

    // ── Run aborted (analysis canceled before execution) ─────────────────────
    // Analysis was stopped by the operator before a root cause could be confirmed.
    // Steps after analysis phase are never reached.
    case 'Run aborted':
      return [
        done ('s1', 'agenticrun.received',  'Run created — controller dispatched', 0),
        done ('s2', 'agenticrun.analyze',    'Analysis phase started', 1),
        warn ('s3', 'agenticrun.terminal',   'Analysis stopped — canceled before root cause determined', 9),
      ];

    // ── Emergency stopped / Plan aborted (execution-phase halt) ──────────────
    // Execution was halted mid-flight by an administrative override after
    // analysis and approval had already completed.
    case 'EmergencyStopped':
    case 'Plan aborted':
      return [
        done  ('s1', 'agenticrun.received',  'Run created — controller dispatched', 0),
        done  ('s2', 'agenticrun.analyze',    'Analysis phase started', 1),
        done  ('s3', 'agenticrun.analysis.completed', 'Analysis completed', 4),
        done  ('s4', 'agenticrun.human_approval',     'Human approval requested', 6),
        done  ('s5', 'agenticrun.execute',            'Execution phase started', 7),
        failed('s6', 'agenticrun.terminal',           'Execution stopped — cluster may be in partial state', 11),
      ];

    // ── Approved (execution imminent) ────────────────────────────────────────
    case 'Approved':
      return [
        done  ('s1', 'agenticrun.received',           'Run created — controller dispatched', 0),
        done  ('s2', 'agenticrun.analyze',             'Analysis phase started', 1),
        done  ('s3', 'agenticrun.analysis.completed',  'Analysis completed', 4),
        done  ('s4', 'agenticrun.human_approval',      'Human approval requested', 6),
        active('s5', 'agenticrun.execute',             'Execution phase started', 7),
        waiting('s6', 'agenticrun.execution.completed','Execution phase completed'),
        waiting('s7', 'agenticrun.verify',             'Verification phase started'),
        waiting('s8', 'agenticrun.verification.completed', 'Verification phase completed'),
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
  /**
   * When true (agentic kill switch engaged), any in-progress `info` step is
   * converted to `warning` and its description is updated to reflect that the
   * run was administratively suspended, not failed.
   */
  isCapabilitiesDisabled?: boolean;
  /**
   * When true, the Pending timeline shows an explicit "Human approval requested"
   * active step, reflecting that the run is gated on manual analysis approval.
   */
  isAwaitingAnalysisApproval?: boolean;
  /** Mock evidence payloads keyed by audit event — drives per-phase expandables (legacy / non-melded). */
  evidence?: AgenticRunTimelineEvidenceContext;
  /** Melded run-details bodies nested under chronological phases (HPUX-2106). */
  meldedSlots?: MeldedTimelineSlots;
  /** Audit events whose expandable section starts expanded (e.g. human approval while Proposed). */
  defaultExpandedEvents?: readonly string[];
}

/**
 * Chronological agentic-run phases with inline contextual evidence (HPUX-2106).
 */
export const AgenticRunTimeline: React.FC<AgenticRunTimelineProps> = ({
  status,
  createdAt,
  retryCount = 0,
  isCapabilitiesDisabled = false,
  isAwaitingAnalysisApproval = false,
  evidence,
  meldedSlots,
  defaultExpandedEvents = [],
}) => {
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(true);

  const steps = buildTimelineSteps(status, createdAt, retryCount, isAwaitingAnalysisApproval)
    .filter((s) => s.variant !== 'pending')
    .map((s) => {
      if (isCapabilitiesDisabled && s.variant === 'info') {
        return {
          ...s,
          variant: 'warning' as TimelineStepVariant,
          description: s.description
            ? `${s.description} — suspended by administrator`
            : 'Suspended — agentic capabilities disabled by administrator',
        };
      }
      return s;
    });

  if (steps.length === 0) return null;

  return (
    <ExpandableSection
      toggleText=""
      isExpanded={isTimelineExpanded}
      onToggle={(_event, expanded) => setIsTimelineExpanded(expanded)}
      toggleContent={
        <Title headingLevel="h4" size="md">
          Timeline
        </Title>
      }
    >
      <Timeline aria-label="Agentic run timeline">
        {steps.map((step) => {
          const meldedBody = resolveMeldedBody(step, meldedSlots);
          const evidenceResolved =
            meldedBody ? null : resolveTimelinePhaseEvidence(step, evidence, status);
          const terminalExtra =
            step.event === 'agenticrun.terminal'
              ? (meldedSlots?.terminal ?? null)
              : undefined;
          return (
            <TimelineItem
              key={step.id}
              step={step}
              evidence={evidenceResolved}
              meldedBody={meldedBody}
              defaultExpanded={shouldDefaultExpandStep(step, defaultExpandedEvents)}
              terminalExtra={terminalExtra}
            />
          );
        })}
      </Timeline>
    </ExpandableSection>
  );
};

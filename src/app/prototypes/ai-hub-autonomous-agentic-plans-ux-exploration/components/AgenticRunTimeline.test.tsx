import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AgenticRunTimeline, type AgenticRunTimelineEvidenceContext, buildTimelineSteps } from './AgenticRunTimeline';

jest.mock('./AnalysisLogsExpandable', () => ({ AnalysisLogsExpandable: () => null }));

test('shows the configured approval gates and a completed audit trail', () => {
  const createdAt = '2026-06-09T04:07:00Z';
  const proposed = buildTimelineSteps('Proposed', createdAt, 0, false, 'auto');
  expect(proposed.find((step) => step.event === 'agenticrun.human_approval')?.label)
    .toBe('Remediation plan ready — executing automatically');

  const waitingForVerification = buildTimelineSteps('Verifying', createdAt, 0, false, 'manual', true);
  expect(waitingForVerification.find((step) => step.event === 'agenticrun.verify')?.label)
    .toBe('Human approval requested - Verification');

  const waitingForAnalysis = buildTimelineSteps('Pending', createdAt, 0, true);
  expect(waitingForAnalysis.find((step) => step.isCurrent)?.label)
    .toBe('Human approval requested - Analysis');
  expect(buildTimelineSteps('Proposed', createdAt, 0, false, 'manual').find((step) => step.isCurrent)?.label)
    .toBe('Human approval requested - Execution');

  const completed = buildTimelineSteps('Completed', createdAt, 0, false, 'auto');
  expect(completed).toHaveLength(8);
  expect(completed.every((step) => step.variant === 'success')).toBe(true);
  expect(completed.some((step) => step.event === 'agenticrun.human_approval')).toBe(false);
});

test('amalgamates phase approvals into started nodes and shows structured audit metadata first', () => {
  const phaseTransitions = {
    Analysis: { approvalMethod: 'automatic' as const, approverId: 'System (Configuration)' },
    Execution: { approvalMethod: 'manual' as const, approverId: '@mchen', selectedPlanName: 'Rotate Alertmanager secret' },
    Verification: { approvalMethod: 'manual' as const, approverId: '@mchen' },
  };
  const steps = buildTimelineSteps('Completed', '2026-09-01T12:00:00Z', 0, false, 'manual', false, phaseTransitions);
  expect(steps.map((step) => step.label)).toEqual(expect.arrayContaining([
    'Analysis phase started — Automatically approved',
    'Execution phase started — Manually approved',
    'Verification phase started — Manually approved',
  ]));
  expect(steps.some((step) => step.label === 'Human approval recorded')).toBe(false);

  render(
    <AgenticRunTimeline
      status="Completed"
      createdAt="2026-09-01T12:00:00Z"
      phaseTransitions={phaseTransitions}
      meldedSlots={{ humanApprovalRequested: <div>Remediation plans</div> }}
    />,
  );
  const executionItem = screen.getByText('Execution phase started — Manually approved').closest('li');
  fireEvent.click(executionItem!.querySelector('button')!);
  expect(executionItem).toHaveTextContent('Approved by');
  expect(executionItem).toHaveTextContent('@mchen');
  expect(executionItem).toHaveTextContent('Selected plan');
  expect(executionItem).toHaveTextContent('Rotate Alertmanager secret');
  expect(executionItem).toHaveTextContent('Remediation plans');
  const descriptionList = executionItem?.querySelector('.pf-v6-c-description-list');
  const plans = screen.getByText('Remediation plans');
  expect(descriptionList).not.toBeNull();
  expect(descriptionList!.compareDocumentPosition(plans) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect((descriptionList?.parentElement as HTMLElement).style.marginBottom).toBe('var(--pf-t--global--spacer--md)');
});

test('does not repeat execution approval metadata when the plan card already shows it', () => {
  render(
    <AgenticRunTimeline
      status="Completed"
      createdAt="2026-09-01T12:00:00Z"
      hasEmbeddedExecutionApproval
      phaseTransitions={{
        Analysis: { approvalMethod: 'manual', approverId: '@mchen' },
        Execution: { approvalMethod: 'manual', approverId: '@mchen', selectedPlanName: 'Renew ingress-tls' },
      }}
      meldedSlots={{
        humanApprovalRequested: <div>Remediation plans · Plan 1 · Execution approved by @mchen</div>,
      }}
    />,
  );
  const executionItem = screen.getByText('Execution phase started — Manually approved').closest('li');
  fireEvent.click(executionItem!.querySelector('button')!);
  expect(executionItem).toHaveTextContent('Remediation plans · Plan 1 · Execution approved by @mchen');
  expect(executionItem?.querySelector('.pf-v6-c-description-list')).toBeNull();

  const analysisItem = screen.getByText('Analysis phase started — Manually approved').closest('li');
  fireEvent.click(analysisItem!.querySelector('button')!);
  expect(analysisItem).toHaveTextContent('Approved by');
});

test.each(['Approved', 'Executing', 'Verifying', 'Completed', 'Failed', 'Escalating', 'Escalated', 'EmergencyStopped', 'Plan aborted'] as const)(
  '%s has no completed standalone approval step',
  (status) => {
    expect(buildTimelineSteps(status).some((step) => step.event === 'agenticrun.human_approval')).toBe(false);
  },
);

test.each([
  { status: 'Pending' as const, phase: 'Analysis', isAwaitingAnalysisApproval: true },
  { status: 'Proposed' as const, phase: 'Execution', executionApprovalMode: 'manual' as const },
  { status: 'Verifying' as const, phase: 'Verification', isAwaitingVerificationApproval: true },
])('renders the $phase manual gate first inside the active timeline details', (props) => {
  render(
    <AgenticRunTimeline
      {...props}
      manualApprovalPhase={props.phase}
      createdAt="2026-09-01T12:00:00Z"
      meldedSlots={{
        humanApprovalRequested: (
          <div>
            <h4>Remediation plans</h4>
            <span>AI-generated</span>
            <span>Awaiting root cause analysis.</span>
          </div>
        ),
        verificationPhaseStarted: <div>Verification evidence</div>,
      }}
    />,
  );
  const activeItem = screen.getByText(`Human approval requested - ${props.phase}`).closest('li');
  expect(activeItem).toHaveTextContent(`Human approval requested - ${props.phase}`);
  expect(activeItem).toHaveTextContent('Needs approval');
  expect(activeItem?.querySelector('button')).toHaveAttribute('aria-expanded', 'true');
  const notice = screen.getByText('Awaiting manual approval').closest('.pf-v6-c-alert');
  expect(notice).toHaveTextContent(`This run has paused at the ${props.phase} phase based on your configuration settings.`);
  const followingContent = activeItem?.querySelector('.pf-v6-c-alert + div');
  if (props.phase === 'Analysis') {
    expect(followingContent).toBeNull();
    expect(notice?.parentElement?.children).toHaveLength(1);
    expect((notice?.parentElement as HTMLElement).style.paddingBottom)
      .toBe('var(--pf-t--global--spacer--md)');
    expect(screen.queryByText('Remediation plans')).not.toBeInTheDocument();
    expect(screen.queryByText('AI-generated')).not.toBeInTheDocument();
    expect(screen.queryByText('Awaiting root cause analysis.')).not.toBeInTheDocument();
    expect(screen.queryByText('Analysis phase started')).not.toBeInTheDocument();
  } else {
    expect(followingContent).not.toBeNull();
  }
});

test('omits manual approval messaging during automatic execution and falls back for a missing phase name', () => {
  const { rerender } = render(
    <AgenticRunTimeline status="Proposed" executionApprovalMode="auto" createdAt="2026-09-01T12:00:00Z" />,
  );
  expect(screen.queryByText('Awaiting manual approval')).not.toBeInTheDocument();
  expect(screen.queryByText('Needs approval')).not.toBeInTheDocument();
  rerender(
    <AgenticRunTimeline
      status="Verifying"
      isAwaitingVerificationApproval
      manualApprovalPhase=""
      createdAt="2026-09-01T12:00:00Z"
    />,
  );
  expect(screen.getByText('Human approval requested - Verification')).toBeInTheDocument();
  expect(screen.getByText('Awaiting manual approval')).toBeInTheDocument();
  expect(screen.getByText('Needs approval')).toBeInTheDocument();
  rerender(<AgenticRunTimeline status="Completed" createdAt="2026-09-01T12:00:00Z" />);
  expect(screen.queryByText('Needs approval')).not.toBeInTheDocument();
});

test('shows proposed commands before verification approval and recorded logs only after it starts', () => {
  const evidence: AgenticRunTimelineEvidenceContext = {
    planId: 'certmgr-renewal-pending',
    analysisLogsLifecycle: 'completed',
    logFinding: '',
    logNarrative: '',
    runStatus: 'Verifying',
    isAwaitingVerificationApproval: true,
    proposedVerificationScript: '# Proposed Verification Plan\noc get certificate ingress-tls -n cert-manager',
    verificationLogText: 'Verification PASSED — certificate healthy',
  };
  const { rerender } = render(
    <AgenticRunTimeline
      status="Verifying"
      manualApprovalPhase="Verification"
      isAwaitingVerificationApproval
      evidence={evidence}
      createdAt="2026-09-01T12:00:00Z"
    />,
  );
  expect(screen.getByText('Hide phase details')).toBeInTheDocument();
  expect(screen.getByText(/oc get certificate ingress-tls/)).toBeInTheDocument();
  expect(screen.queryByText(/Verification PASSED/)).not.toBeInTheDocument();

  rerender(
    <AgenticRunTimeline
      status="Verifying"
      evidence={{ ...evidence, isAwaitingVerificationApproval: false }}
      createdAt="2026-09-01T12:00:00Z"
    />,
  );
  expect(screen.getByText('Hide verification logs')).toBeInTheDocument();
  expect(screen.getByText(/Verification PASSED/)).toBeInTheDocument();
});

test('focuses completed verification and closes an open execution summary', () => {
  const animationFrame = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    callback(0);
    return 1;
  });
  const meldedSlots = {
    executionPhaseCompleted: <div>Execution summary</div>,
    verificationPhaseStarted: <div>Verification in progress</div>,
    verificationPhaseCompleted: <div>Completed verification summary</div>,
  };
  const { rerender } = render(
    <AgenticRunTimeline status="Verifying" createdAt="2026-09-01T12:00:00Z" meldedSlots={meldedSlots} />,
  );
  const executionToggle = document.querySelector<HTMLButtonElement>(
    '#execution-completed-phase button',
  );
  const activeVerificationToggle = document.querySelector<HTMLButtonElement>(
    '#verification-phase button',
  );

  expect(document.querySelector('#execution-phase button')).toBeNull();
  expect(executionToggle).toHaveAttribute('aria-expanded', 'false');
  expect(activeVerificationToggle).toHaveAttribute('aria-expanded', 'true');

  fireEvent.click(executionToggle!);
  expect(executionToggle).toHaveAttribute('aria-expanded', 'true');

  rerender(
    <AgenticRunTimeline status="Completed" createdAt="2026-09-01T12:00:00Z" meldedSlots={meldedSlots} />,
  );

  expect(executionToggle).toHaveAttribute('aria-expanded', 'false');
  expect(document.querySelector('#execution-phase button')).toBeNull();
  expect(document.querySelector('#verification-completed-phase button'))
    .toHaveAttribute('aria-expanded', 'true');
  expect(document.querySelector('#verification-phase button'))
    .toHaveAttribute('aria-expanded', 'false');
  expect(document.activeElement).toHaveAttribute('id', 'verification-completed-phase');
  animationFrame.mockRestore();
});

test('keeps partial execution details available when a run stops before completion', () => {
  render(
    <AgenticRunTimeline
      status="EmergencyStopped"
      createdAt="2026-09-01T12:00:00Z"
      meldedSlots={{ executionPhaseCompleted: <div>Partial execution summary</div> }}
    />,
  );
  expect(document.querySelector('#execution-phase button')).toBeInTheDocument();
  expect(screen.queryByText('Execution phase completed')).not.toBeInTheDocument();
});

import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AgenticRunTimeline } from './AgenticRunTimeline';

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

  expect(executionToggle).toHaveAttribute('aria-expanded', 'false');
  expect(activeVerificationToggle).toHaveAttribute('aria-expanded', 'true');

  fireEvent.click(executionToggle!);
  expect(executionToggle).toHaveAttribute('aria-expanded', 'true');

  rerender(
    <AgenticRunTimeline status="Completed" createdAt="2026-09-01T12:00:00Z" meldedSlots={meldedSlots} />,
  );

  expect(executionToggle).toHaveAttribute('aria-expanded', 'false');
  expect(document.querySelector('#verification-completed-phase button'))
    .toHaveAttribute('aria-expanded', 'true');
  expect(document.querySelector('#verification-phase button'))
    .toHaveAttribute('aria-expanded', 'false');
  expect(document.activeElement).toHaveAttribute('id', 'verification-completed-phase');
  animationFrame.mockRestore();
});

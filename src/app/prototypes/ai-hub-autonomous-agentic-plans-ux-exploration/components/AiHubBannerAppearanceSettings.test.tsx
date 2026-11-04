import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useAgenticCapabilities } from '../context/AgenticCapabilitiesContext';
import { useApprovalPolicy } from '../context/ApprovalPolicyContext';
import { useDeletedPlans } from '../context/DeletedPlansContext';
import { usePlanTermination } from '../context/PlanTerminationContext';
import { usePlanWorkflow } from '../context/PlanWorkflowContext';
import { AiHubBannerAppearanceSettings } from './AiHubBannerAppearanceSettings';
import { AiHubPrototypeRoot } from './AiHubPrototypeRoot';

test('triple-clicking the empty top-bar area restores prototype state', () => {
  let workflow!: ReturnType<typeof usePlanWorkflow>;
  let termination!: ReturnType<typeof usePlanTermination>;
  let policy!: ReturnType<typeof useApprovalPolicy>;
  let deleted!: ReturnType<typeof useDeletedPlans>;
  let capabilities!: ReturnType<typeof useAgenticCapabilities>;
  const outerClick = jest.fn();

  const Probe = () => {
    workflow = usePlanWorkflow();
    termination = usePlanTermination();
    policy = useApprovalPolicy();
    deleted = useDeletedPlans();
    capabilities = useAgenticCapabilities();
    return <div onClick={outerClick}><AiHubBannerAppearanceSettings /></div>;
  };

  const { container } = render(<AiHubPrototypeRoot><Probe /></AiHubPrototypeRoot>);
  const scopedKey = 'hpux.ai-hub-autonomous-agentic-plans-ux-exploration.test-reset';
  sessionStorage.setItem(scopedKey, 'changed');
  sessionStorage.setItem('unrelated.test-reset', 'keep');

  act(() => {
    workflow.executeRemediation('op2', {
      optionIndex: 0,
      optionId: 'op2-o1',
      optionTitle: 'Rotate webhook secret',
      maxAttempts: 3,
    });
    termination.registerPlanTermination('certmgr-renewal-pending', '2026-06-09T04:10:00Z', 'execution');
    policy.setExecutionPolicy('auto');
    deleted.deletePlan('op2');
    capabilities.setAgentActiveForCluster('prod-east-2', false);
  });

  const resetArea = container.querySelector('.ols-ai-hub-banner-appearance__reset-area');
  expect(resetArea).not.toBeNull();
  expect(fireEvent.mouseDown(resetArea!)).toBe(false);
  fireEvent.click(resetArea!, { detail: 1 });
  fireEvent.click(resetArea!, { detail: 2 });
  expect(workflow.getRuntimePhase('op2')).toBe('Executing');

  fireEvent.click(resetArea!, { detail: 3 });
  expect(workflow.getRuntimePhase('op2')).toBeNull();
  expect(termination.getPlanTermination('certmgr-renewal-pending')).toBeUndefined();
  expect(policy.executionPolicy).toBe('manual');
  expect(deleted.isPlanDeleted('op2')).toBe(false);
  expect(capabilities.isAgentActiveForCluster('prod-east-2')).toBe(true);
  expect(sessionStorage.getItem(scopedKey)).toBeNull();
  expect(sessionStorage.getItem('unrelated.test-reset')).toBe('keep');
  expect(screen.getByText(/Run states and phase configuration were restored/i)).toBeInTheDocument();
  expect(outerClick).not.toHaveBeenCalled();
  expect(resetArea!.contains(screen.getByRole('button', { name: /Appearance settings/i })))
    .toBe(false);

  sessionStorage.removeItem('unrelated.test-reset');
});

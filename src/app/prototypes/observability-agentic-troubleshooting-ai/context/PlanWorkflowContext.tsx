import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { PlanStatus } from '../types/planStatus';
import { GLOBAL_APPROVAL_POLICY_MAX_ATTEMPTS } from '../pages/ai-hub-plans-v2/plansMvpConstants';

export type ExecutionApproval = {
  optionIndex: number;
  optionId: string;
  optionTitle: string;
  maxAttempts: number;
  approvedAt: string;
  approvedBy: string;
};

export type VerificationState = {
  attempt: number;
  maxAttempts: number;
  startedAt: string;
  checks: string[];
  outcome?: 'passed' | 'failed';
  completedAt?: string;
};

export type RevisionFeedbackEntry = {
  text: string;
  submittedAt: string;
};

export type PlanWorkflowRecord = {
  runtimePhase: PlanStatus | null;
  executionApproval: ExecutionApproval | null;
  verification: VerificationState | null;
  revisionHistory: RevisionFeedbackEntry[];
  revisionCount: number;
  isReAnalyzing: boolean;
};

export type PlanWorkflowSnapshot = Record<string, PlanWorkflowRecord>;

const EMPTY_RECORD: PlanWorkflowRecord = {
  runtimePhase: null,
  executionApproval: null,
  verification: null,
  revisionHistory: [],
  revisionCount: 0,
  isReAnalyzing: false,
};

function createEmptyRecord(): PlanWorkflowRecord {
  return { ...EMPTY_RECORD, revisionHistory: [] };
}

type PlanWorkflowContextValue = {
  workflowByPlanId: PlanWorkflowSnapshot;
  getPlanWorkflow: (planId: string) => PlanWorkflowRecord;
  getRuntimePhase: (planId: string) => PlanStatus | null;
  registerExecutionApproval: (
    planId: string,
    approval: Omit<ExecutionApproval, 'approvedAt' | 'approvedBy'> & Partial<Pick<ExecutionApproval, 'approvedAt' | 'approvedBy'>>,
  ) => void;
  executeRemediation: (
    planId: string,
    approval: Omit<ExecutionApproval, 'approvedAt' | 'approvedBy'>,
  ) => void;
  acknowledgePlan: (planId: string) => void;
  clearExecutionApproval: (planId: string) => void;
  startExecution: (planId: string) => void;
  startVerification: (planId: string, checks: string[]) => void;
  completeVerification: (planId: string, success: boolean) => PlanStatus;
  submitRevisionFeedback: (planId: string, text: string) => void;
  finishReAnalysis: (planId: string) => void;
  /** HITL: manually dispatches the AI analysis engine for a Pending run. Transitions runtimePhase → 'Analyzing'. */
  dispatchAnalysis: (planId: string) => void;
};

const PlanWorkflowContext = createContext<PlanWorkflowContextValue | null>(null);

const MOCK_APPROVER = 'Marcus Chen';

export const PlanWorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workflowByPlanId, setWorkflowByPlanId] = useState<PlanWorkflowSnapshot>({});

  const patchPlan = useCallback((planId: string, patch: Partial<PlanWorkflowRecord>) => {
    setWorkflowByPlanId((prev) => {
      const current = prev[planId] ?? createEmptyRecord();
      return {
        ...prev,
        [planId]: {
          ...current,
          ...patch,
          revisionHistory: patch.revisionHistory ?? current.revisionHistory,
        },
      };
    });
  }, []);

  const getPlanWorkflow = useCallback(
    (planId: string) => workflowByPlanId[planId] ?? createEmptyRecord(),
    [workflowByPlanId],
  );

  const getRuntimePhase = useCallback(
    (planId: string) => workflowByPlanId[planId]?.runtimePhase ?? null,
    [workflowByPlanId],
  );

  const registerExecutionApproval = useCallback(
    (planId: string, approval: Omit<ExecutionApproval, 'approvedAt' | 'approvedBy'> & Partial<Pick<ExecutionApproval, 'approvedAt' | 'approvedBy'>>) => {
      patchPlan(planId, {
        executionApproval: {
          ...approval,
          approvedAt: approval.approvedAt ?? new Date().toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          }),
          approvedBy: approval.approvedBy ?? MOCK_APPROVER,
        },
        runtimePhase: 'Approved',
      });
    },
    [patchPlan],
  );

  const executeRemediation = useCallback(
    (planId: string, approval: Omit<ExecutionApproval, 'approvedAt' | 'approvedBy'>) => {
      patchPlan(planId, {
        executionApproval: {
          ...approval,
          approvedAt: new Date().toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          }),
          approvedBy: MOCK_APPROVER,
        },
        runtimePhase: 'Executing',
        verification: null,
      });
    },
    [patchPlan],
  );

  const acknowledgePlan = useCallback(
    (planId: string) => {
      patchPlan(planId, { runtimePhase: 'Acknowledged' });
    },
    [patchPlan],
  );

  const clearExecutionApproval = useCallback(
    (planId: string) => {
      patchPlan(planId, {
        executionApproval: null,
        runtimePhase: 'Proposed',
        verification: null,
      });
    },
    [patchPlan],
  );

  const startExecution = useCallback(
    (planId: string) => {
      patchPlan(planId, { runtimePhase: 'Executing', verification: null });
    },
    [patchPlan],
  );

  const startVerification = useCallback(
    (planId: string, checks: string[]) => {
      const approval = workflowByPlanId[planId]?.executionApproval;
      const maxAttempts = approval?.maxAttempts ?? GLOBAL_APPROVAL_POLICY_MAX_ATTEMPTS;
      const priorAttempt = workflowByPlanId[planId]?.verification?.attempt ?? 0;
      patchPlan(planId, {
        runtimePhase: 'Verifying',
        verification: {
          attempt: priorAttempt + 1,
          maxAttempts,
          startedAt: new Date().toISOString(),
          checks,
        },
      });
    },
    [patchPlan, workflowByPlanId],
  );

  const completeVerification = useCallback(
    (planId: string, success: boolean): PlanStatus => {
      const record = workflowByPlanId[planId] ?? createEmptyRecord();
      const verification = record.verification;
      if (!verification) {
        return success ? 'Completed' : 'Failed';
      }

      if (success) {
        patchPlan(planId, {
          runtimePhase: 'Completed',
          verification: { ...verification, outcome: 'passed', completedAt: new Date().toISOString() },
        });
        return 'Completed';
      }

      if (verification.attempt < verification.maxAttempts) {
        patchPlan(planId, {
          runtimePhase: 'Executing',
          verification: { ...verification, outcome: 'failed', completedAt: new Date().toISOString() },
        });
        return 'Executing';
      }

      patchPlan(planId, {
        runtimePhase: 'Failed',
        verification: { ...verification, outcome: 'failed', completedAt: new Date().toISOString() },
      });
      return 'Failed';
    },
    [patchPlan, workflowByPlanId],
  );

  const submitRevisionFeedback = useCallback(
    (planId: string, text: string) => {
      const record = workflowByPlanId[planId] ?? createEmptyRecord();
      const entry: RevisionFeedbackEntry = {
        text,
        submittedAt: new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }),
      };
      patchPlan(planId, {
        executionApproval: null,
        verification: null,
        runtimePhase: 'Analyzing',
        isReAnalyzing: true,
        revisionHistory: [...record.revisionHistory, entry],
        revisionCount: record.revisionCount + 1,
      });
    },
    [patchPlan, workflowByPlanId],
  );

  const finishReAnalysis = useCallback(
    (planId: string) => {
      patchPlan(planId, {
        runtimePhase: 'Proposed',
        isReAnalyzing: false,
      });
    },
    [patchPlan],
  );

  /** HITL manual dispatch: transitions a Pending run into the Analyzing phase. */
  const dispatchAnalysis = useCallback(
    (planId: string) => {
      patchPlan(planId, { runtimePhase: 'Analyzing' });
    },
    [patchPlan],
  );

  const value = useMemo(
    () => ({
      workflowByPlanId,
      getPlanWorkflow,
      getRuntimePhase,
      registerExecutionApproval,
      executeRemediation,
      acknowledgePlan,
      clearExecutionApproval,
      startExecution,
      startVerification,
      completeVerification,
      submitRevisionFeedback,
      finishReAnalysis,
      dispatchAnalysis,
    }),
    [
      workflowByPlanId,
      getPlanWorkflow,
      getRuntimePhase,
      registerExecutionApproval,
      executeRemediation,
      acknowledgePlan,
      clearExecutionApproval,
      startExecution,
      startVerification,
      completeVerification,
      submitRevisionFeedback,
      finishReAnalysis,
      dispatchAnalysis,
    ],
  );

  return <PlanWorkflowContext.Provider value={value}>{children}</PlanWorkflowContext.Provider>;
};

export function usePlanWorkflow(): PlanWorkflowContextValue {
  const ctx = useContext(PlanWorkflowContext);
  if (!ctx) {
    throw new Error('usePlanWorkflow must be used within PlanWorkflowProvider');
  }
  return ctx;
}

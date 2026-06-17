import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { PlanWorkflowSnapshot } from './PlanWorkflowContext';

export type TerminatedPlanEntry = {
  terminatedAt: string;
};

export type TerminatedPlanState = Record<string, TerminatedPlanEntry>;

export type PlanExecutionRuntime = {
  abortedPlans: TerminatedPlanState;
  workflowByPlanId?: PlanWorkflowSnapshot;
};

type PlanTerminationContextValue = {
  abortedPlans: TerminatedPlanState;
  registerPlanTermination: (planId: string, terminatedAt: string) => void;
  getPlanTermination: (planId: string) => TerminatedPlanEntry | undefined;
};

const PlanTerminationContext = createContext<PlanTerminationContextValue | null>(null);

export const PlanTerminationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [abortedPlans, setAbortedPlans] = useState<TerminatedPlanState>({});

  const registerPlanTermination = useCallback((planId: string, terminatedAt: string) => {
    setAbortedPlans((prev) => ({
      ...prev,
      [planId]: { terminatedAt },
    }));
  }, []);

  const getPlanTermination = useCallback(
    (planId: string) => abortedPlans[planId],
    [abortedPlans],
  );

  const value = useMemo(
    () => ({
      abortedPlans,
      registerPlanTermination,
      getPlanTermination,
    }),
    [abortedPlans, registerPlanTermination, getPlanTermination],
  );

  return <PlanTerminationContext.Provider value={value}>{children}</PlanTerminationContext.Provider>;
};

export function usePlanTermination(): PlanTerminationContextValue {
  const ctx = useContext(PlanTerminationContext);
  if (!ctx) {
    throw new Error('usePlanTermination must be used within PlanTerminationProvider');
  }
  return ctx;
}

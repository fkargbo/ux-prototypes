import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type TerminatedPlanEntry = {
  terminatedAt: string;
};

export type TerminatedPlanState = Record<string, TerminatedPlanEntry>;

export type PlanExecutionRuntime = {
  abortedPlans: TerminatedPlanState;
  resumedPlanIds: Record<string, true>;
};

type PlanTerminationContextValue = {
  abortedPlans: TerminatedPlanState;
  resumedPlanIds: Record<string, true>;
  registerPlanTermination: (planId: string, terminatedAt: string) => void;
  resumePlanRemediation: (planId: string) => void;
  getPlanTermination: (planId: string) => TerminatedPlanEntry | undefined;
};

const PlanTerminationContext = createContext<PlanTerminationContextValue | null>(null);

export const PlanTerminationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [abortedPlans, setAbortedPlans] = useState<TerminatedPlanState>({});
  const [resumedPlanIds, setResumedPlanIds] = useState<Record<string, true>>({});

  const registerPlanTermination = useCallback((planId: string, terminatedAt: string) => {
    setAbortedPlans((prev) => ({
      ...prev,
      [planId]: { terminatedAt },
    }));
    setResumedPlanIds((prev) => {
      if (!prev[planId]) {
        return prev;
      }
      const next = { ...prev };
      delete next[planId];
      return next;
    });
  }, []);

  const resumePlanRemediation = useCallback((planId: string) => {
    setAbortedPlans((prev) => {
      if (!prev[planId]) {
        return prev;
      }
      const next = { ...prev };
      delete next[planId];
      return next;
    });
    setResumedPlanIds((prev) => ({
      ...prev,
      [planId]: true,
    }));
  }, []);

  const getPlanTermination = useCallback(
    (planId: string) => abortedPlans[planId],
    [abortedPlans],
  );

  const value = useMemo(
    () => ({
      abortedPlans,
      resumedPlanIds,
      registerPlanTermination,
      resumePlanRemediation,
      getPlanTermination,
    }),
    [abortedPlans, resumedPlanIds, registerPlanTermination, resumePlanRemediation, getPlanTermination],
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

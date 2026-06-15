import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type TerminatedPlanEntry = {
  terminatedAt: string;
};

export type TerminatedPlanState = Record<string, TerminatedPlanEntry>;

type PlanTerminationContextValue = {
  terminatedPlans: TerminatedPlanState;
  registerPlanTermination: (planId: string, terminatedAt: string) => void;
  getPlanTermination: (planId: string) => TerminatedPlanEntry | undefined;
};

const PlanTerminationContext = createContext<PlanTerminationContextValue | null>(null);

export const PlanTerminationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [terminatedPlans, setTerminatedPlans] = useState<TerminatedPlanState>({});

  const registerPlanTermination = useCallback((planId: string, terminatedAt: string) => {
    setTerminatedPlans((prev) => ({
      ...prev,
      [planId]: { terminatedAt },
    }));
  }, []);

  const getPlanTermination = useCallback(
    (planId: string) => terminatedPlans[planId],
    [terminatedPlans],
  );

  const value = useMemo(
    () => ({
      terminatedPlans,
      registerPlanTermination,
      getPlanTermination,
    }),
    [terminatedPlans, registerPlanTermination, getPlanTermination],
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

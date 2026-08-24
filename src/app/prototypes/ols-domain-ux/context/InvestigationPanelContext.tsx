import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { PlanRow } from '../pages/ai-hub-plans-v2/PlansAndApprovalsTab';

type InvestigationPanelContextValue = {
  activePlan: PlanRow | null;
  openInvestigationPanel: (plan: PlanRow) => void;
  closeInvestigationPanel: () => void;
};

const InvestigationPanelContext = createContext<InvestigationPanelContextValue | null>(null);

export const InvestigationPanelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePlan, setActivePlan] = useState<PlanRow | null>(null);

  const openInvestigationPanel = useCallback((plan: PlanRow) => {
    setActivePlan(plan);
  }, []);

  const closeInvestigationPanel = useCallback(() => {
    setActivePlan(null);
  }, []);

  const value = useMemo(
    () => ({
      activePlan,
      openInvestigationPanel,
      closeInvestigationPanel,
    }),
    [activePlan, openInvestigationPanel, closeInvestigationPanel],
  );

  return (
    <InvestigationPanelContext.Provider value={value}>
      {children}
    </InvestigationPanelContext.Provider>
  );
};

export function useInvestigationPanel(): InvestigationPanelContextValue {
  const ctx = useContext(InvestigationPanelContext);
  if (!ctx) {
    throw new Error('useInvestigationPanel must be used within InvestigationPanelProvider');
  }
  return ctx;
}

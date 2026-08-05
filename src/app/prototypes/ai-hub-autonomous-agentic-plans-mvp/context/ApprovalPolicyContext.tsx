import React, { createContext, useContext, useMemo, useState } from 'react';

export type AnalysisApprovalMode = 'manual' | 'auto';

type ApprovalPolicyContextValue = {
  /** Drives whether a new run starts in Pending (manual gate) or jumps straight to Analyzing. */
  analysisPolicy: AnalysisApprovalMode;
  setAnalysisPolicy: (policy: AnalysisApprovalMode) => void;
};

const ApprovalPolicyContext = createContext<ApprovalPolicyContextValue | null>(null);

export const ApprovalPolicyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [analysisPolicy, setAnalysisPolicy] = useState<AnalysisApprovalMode>('manual');

  const value = useMemo(
    () => ({ analysisPolicy, setAnalysisPolicy }),
    [analysisPolicy],
  );

  return (
    <ApprovalPolicyContext.Provider value={value}>{children}</ApprovalPolicyContext.Provider>
  );
};

export function useApprovalPolicy(): ApprovalPolicyContextValue {
  const ctx = useContext(ApprovalPolicyContext);
  if (!ctx) {
    throw new Error('useApprovalPolicy must be used within ApprovalPolicyProvider');
  }
  return ctx;
}

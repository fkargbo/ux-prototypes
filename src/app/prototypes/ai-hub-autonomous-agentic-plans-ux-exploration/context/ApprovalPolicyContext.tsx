import React, { createContext, useContext, useMemo, useState } from 'react';

export type ApprovalMode = 'manual' | 'auto';

export type PolicyConfig = {
  /** Phase 1 — AI analysis dispatch: Manual requires "Approve analysis"; Auto bypasses Pending. */
  analysisPolicy: ApprovalMode;
  /** Phase 2 — Remediation execution: Manual requires "Apply remediation"; Auto executes option[0]. */
  executionPolicy: ApprovalMode;
  /** Phase 3 — Post-execution health probes: Manual requires "Run health check"; Auto triggers automatically. */
  verificationPolicy: ApprovalMode;
  /** Phase 4 — Failure escalation: Manual requires "Escalate manually"; Auto routes to external channels. */
  escalationPolicy: ApprovalMode;
  /** Maximum automated re-execution attempts before escalation. Sourced from Configuration page. */
  maxRetryAttempts: number;
};

type PolicyConfigContextValue = PolicyConfig & {
  setAnalysisPolicy: (policy: ApprovalMode) => void;
  setExecutionPolicy: (policy: ApprovalMode) => void;
  setVerificationPolicy: (policy: ApprovalMode) => void;
  setEscalationPolicy: (policy: ApprovalMode) => void;
  setMaxRetryAttempts: (n: number) => void;
  /** Bulk-update all policy settings in one call (from Configuration page Save). */
  applyPolicyConfig: (config: PolicyConfig) => void;
};

const ApprovalPolicyContext = createContext<PolicyConfigContextValue | null>(null);

const DEFAULT_POLICY: PolicyConfig = {
  analysisPolicy: 'manual',
  executionPolicy: 'manual',
  verificationPolicy: 'auto',
  escalationPolicy: 'manual',
  maxRetryAttempts: 3,
};

export const ApprovalPolicyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<PolicyConfig>(DEFAULT_POLICY);

  const value = useMemo<PolicyConfigContextValue>(
    () => ({
      ...config,
      setAnalysisPolicy: (analysisPolicy) => setConfig((prev) => ({ ...prev, analysisPolicy })),
      setExecutionPolicy: (executionPolicy) => setConfig((prev) => ({ ...prev, executionPolicy })),
      setVerificationPolicy: (verificationPolicy) => setConfig((prev) => ({ ...prev, verificationPolicy })),
      setEscalationPolicy: (escalationPolicy) => setConfig((prev) => ({ ...prev, escalationPolicy })),
      setMaxRetryAttempts: (maxRetryAttempts) => setConfig((prev) => ({ ...prev, maxRetryAttempts })),
      applyPolicyConfig: (next) => setConfig(next),
    }),
    [config],
  );

  return (
    <ApprovalPolicyContext.Provider value={value}>{children}</ApprovalPolicyContext.Provider>
  );
};

export function useApprovalPolicy(): PolicyConfigContextValue {
  const ctx = useContext(ApprovalPolicyContext);
  if (!ctx) {
    throw new Error('useApprovalPolicy must be used within ApprovalPolicyProvider');
  }
  return ctx;
}

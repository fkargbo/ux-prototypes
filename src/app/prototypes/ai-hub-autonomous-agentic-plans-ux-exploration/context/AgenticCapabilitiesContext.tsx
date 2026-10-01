import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CORE_PLATFORMS_CLUSTER_ID } from '../pages/ai-hub-v3/singleClusterPlanSimulation';

/** Per-cluster agentic automation gate — keyed by cluster id (fleet-ready). */
export type AgentActiveState = Record<string, boolean>;

const FLEET_MANAGEMENT_SCOPE_ID = 'fleet-management';

const DEFAULT_AGENT_ACTIVE: AgentActiveState = {
  [CORE_PLATFORMS_CLUSTER_ID]: true,
  [FLEET_MANAGEMENT_SCOPE_ID]: true,
};

type AgenticCapabilitiesContextValue = {
  isAgentActive: AgentActiveState;
  setAgentActiveForCluster: (clusterId: string, active: boolean) => void;
  isAgentActiveForCluster: (clusterId: string) => boolean;
};

const AgenticCapabilitiesContext = createContext<AgenticCapabilitiesContextValue | null>(null);

export function resolveAgentCapabilitiesClusterId(isSingleCluster: boolean): string {
  return isSingleCluster ? CORE_PLATFORMS_CLUSTER_ID : FLEET_MANAGEMENT_SCOPE_ID;
}

/** Alert title when agentic automation is disabled (kill switch engaged). */
export function getAgenticAutomationDisabledTitle(): string {
  return 'Agentic capabilities disabled';
}

/** Alert body when agentic automation is disabled (kill switch engaged). */
export function getAgenticAutomationDisabledMessage(isSingleCluster: boolean): string {
  if (isSingleCluster) {
    return `Administrative policy has paused agentic automation on ${CORE_PLATFORMS_CLUSTER_ID}. Actions and investigations are currently unavailable. Contact your cluster administrator to restore access.`;
  }
  return 'Administrative policy has paused agentic automation fleet-wide. Actions and investigations are currently unavailable. Contact your cluster administrator to restore access.';
}

export const AgenticCapabilitiesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAgentActive, setIsAgentActive] = useState<AgentActiveState>(() => ({ ...DEFAULT_AGENT_ACTIVE }));

  const setAgentActiveForCluster = useCallback((clusterId: string, active: boolean) => {
    setIsAgentActive((prev) => ({ ...prev, [clusterId]: active }));
  }, []);

  const isAgentActiveForCluster = useCallback(
    (clusterId: string) => isAgentActive[clusterId] ?? true,
    [isAgentActive],
  );

  const value = useMemo(
    () => ({
      isAgentActive,
      setAgentActiveForCluster,
      isAgentActiveForCluster,
    }),
    [isAgentActive, setAgentActiveForCluster, isAgentActiveForCluster],
  );

  return (
    <AgenticCapabilitiesContext.Provider value={value}>{children}</AgenticCapabilitiesContext.Provider>
  );
};

export function useAgenticCapabilities(): AgenticCapabilitiesContextValue {
  const ctx = useContext(AgenticCapabilitiesContext);
  if (!ctx) {
    throw new Error('useAgenticCapabilities must be used within AgenticCapabilitiesProvider');
  }
  return ctx;
}

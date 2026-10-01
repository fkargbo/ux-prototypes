import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export interface MulticlusterDevContextValue {
  /** Simulates hub multicluster agentic runs UI when true (HPUX-2155 prototype). */
  isMultiClusterMode: boolean;
  setMultiClusterMode: (enabled: boolean) => void;
  toggleMultiClusterMode: () => void;
}

const MulticlusterDevContext = createContext<MulticlusterDevContextValue | undefined>(undefined);

export const MulticlusterDevProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMultiClusterMode, setIsMultiClusterMode] = useState(false);

  const setMultiClusterMode = useCallback((enabled: boolean) => {
    setIsMultiClusterMode(enabled);
  }, []);

  const toggleMultiClusterMode = useCallback(() => {
    setIsMultiClusterMode((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({
      isMultiClusterMode,
      setMultiClusterMode,
      toggleMultiClusterMode,
    }),
    [isMultiClusterMode, setMultiClusterMode, toggleMultiClusterMode],
  );

  return <MulticlusterDevContext.Provider value={value}>{children}</MulticlusterDevContext.Provider>;
};

export function useMulticlusterDevMode(): MulticlusterDevContextValue {
  const ctx = useContext(MulticlusterDevContext);
  if (!ctx) {
    throw new Error('useMulticlusterDevMode must be used within MulticlusterDevProvider');
  }
  return ctx;
}

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface DeletedPlansContextValue {
  deletedPlanIds: ReadonlySet<string>;
  deletePlan: (planId: string) => void;
  isPlanDeleted: (planId: string) => boolean;
}

const DeletedPlansContext = createContext<DeletedPlansContextValue | null>(null);

export const DeletedPlansProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deletedPlanIds, setDeletedPlanIds] = useState<ReadonlySet<string>>(() => new Set());

  const deletePlan = useCallback((planId: string) => {
    setDeletedPlanIds((prev) => {
      if (prev.has(planId)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(planId);
      return next;
    });
  }, []);

  const isPlanDeleted = useCallback(
    (planId: string) => deletedPlanIds.has(planId),
    [deletedPlanIds],
  );

  const value = useMemo(
    () => ({ deletedPlanIds, deletePlan, isPlanDeleted }),
    [deletedPlanIds, deletePlan, isPlanDeleted],
  );

  return <DeletedPlansContext.Provider value={value}>{children}</DeletedPlansContext.Provider>;
};

export function useDeletedPlans(): DeletedPlansContextValue {
  const ctx = useContext(DeletedPlansContext);
  if (!ctx) {
    throw new Error('useDeletedPlans must be used within DeletedPlansProvider');
  }
  return ctx;
}

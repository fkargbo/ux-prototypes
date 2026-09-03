/**
 * BannerActionsContext
 *
 * Generic slot that lets any prototype page inject a React node into the
 * prototype navigation banner (the grey bar) at the position just before the
 * Share control.
 *
 * Usage from a prototype page:
 *
 *   useInjectBannerActions(<MyCustomControl />);
 *
 * The injected node is cleared automatically when the component unmounts, so
 * navigating away from the page removes it from the banner without any cleanup
 * code on the call site.
 *
 * This is a generic extension point — it contains no prototype-specific logic.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface BannerActionsContextValue {
  bannerActions: React.ReactNode;
  setBannerActions: (node: React.ReactNode) => void;
}

const BannerActionsContext = createContext<BannerActionsContextValue>({
  bannerActions: null,
  setBannerActions: () => {},
});

export const BannerActionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bannerActions, setBannerActionsState] = useState<React.ReactNode>(null);

  const setBannerActions = useCallback((node: React.ReactNode) => {
    setBannerActionsState(node);
  }, []);

  return (
    <BannerActionsContext.Provider value={{ bannerActions, setBannerActions }}>
      {children}
    </BannerActionsContext.Provider>
  );
};

export const useBannerActions = () => useContext(BannerActionsContext);

/**
 * Call this hook from a prototype page component to inject a node into the
 * banner. The content is registered on mount and cleared on unmount.
 */
export const useInjectBannerActions = (node: React.ReactNode) => {
  const { setBannerActions } = useBannerActions();

  // Stringify a stable key so the effect only re-runs when the reference changes.
  useEffect(() => {
    setBannerActions(node);
    return () => {
      setBannerActions(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

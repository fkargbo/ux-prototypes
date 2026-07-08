import React, { useEffect } from 'react';
import { AiHubAppearanceProvider } from '../context/AiHubAppearanceContext';
import { AgenticCapabilitiesProvider } from '../context/AgenticCapabilitiesContext';
import { PlanTerminationProvider } from '../context/PlanTerminationContext';
import { DeletedPlansProvider } from '../context/DeletedPlansContext';
import { PlanWorkflowProvider } from '../context/PlanWorkflowContext';
import { PlanWorkflowBridge } from './PlanWorkflowBridge';
import { BANNER_VERSION_CHANGE_EVENT, getBannerVersionStorageKey } from '../../../core/bannerVersionPicker';

const PROTOTYPE_ID = 'ai-hub-autonomous-agentic-plans-mvp';
const VERSION_KEY = getBannerVersionStorageKey(PROTOTYPE_ID);
/** One-time flag: ensures we only auto-migrate v1→v2 once per session. */
const MIGRATION_FLAG_KEY = `hpux.bannerDefaultMigration.${PROTOTYPE_ID}.v2`;

function useBannerDefaultMigration() {
  useEffect(() => {
    try {
      if (!sessionStorage.getItem(MIGRATION_FLAG_KEY)) {
        sessionStorage.setItem(VERSION_KEY, 'v2');
        sessionStorage.setItem(MIGRATION_FLAG_KEY, '1');
        window.dispatchEvent(
          new CustomEvent(BANNER_VERSION_CHANGE_EVENT, {
            detail: { prototypeId: PROTOTYPE_ID },
          }),
        );
      }
    } catch {
      /* ignore */
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally runs once on mount
  }, []);
}

export const AiHubPrototypeRoot: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useBannerDefaultMigration();

  return (
    <AiHubAppearanceProvider>
      <AgenticCapabilitiesProvider>
        <PlanTerminationProvider>
          <DeletedPlansProvider>
            <PlanWorkflowProvider>
              <PlanWorkflowBridge />
              {children}
            </PlanWorkflowProvider>
          </DeletedPlansProvider>
        </PlanTerminationProvider>
      </AgenticCapabilitiesProvider>
    </AiHubAppearanceProvider>
  );
};

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, AlertGroup } from '@patternfly/react-core';
import { AiHubAppearanceProvider } from '../context/AiHubAppearanceContext';
import { AgenticCapabilitiesProvider } from '../context/AgenticCapabilitiesContext';
import { ApprovalPolicyProvider } from '../context/ApprovalPolicyContext';
import { PlanTerminationProvider } from '../context/PlanTerminationContext';
import { DeletedPlansProvider } from '../context/DeletedPlansContext';
import { PlanWorkflowProvider } from '../context/PlanWorkflowContext';
import { PlanWorkflowBridge } from './PlanWorkflowBridge';
import { PrototypeResetContext } from '../context/PrototypeResetContext';
import { seedExistingAlertInvestigationDemoState } from '../pages/ai-hub-plans-v2/alertInvestigationPlans';

const PROTOTYPE_SESSION_KEY_PREFIX = 'hpux.ai-hub-autonomous-agentic-plans-ux-exploration.';

const AiHubPrototypeSession: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Seed VCCannotBeEvicted as an existing Proposed investigation for Alerting labels + list
  // visibility. Cleanup on unmount so the MVP prototype is not left with shared session state.
  useEffect(() => seedExistingAlertInvestigationDemoState(), []);

  return (
    <AiHubAppearanceProvider>
      <AgenticCapabilitiesProvider>
        <ApprovalPolicyProvider>
          <PlanTerminationProvider>
            <DeletedPlansProvider>
              <PlanWorkflowProvider>
                <PlanWorkflowBridge />
                {children}
              </PlanWorkflowProvider>
            </DeletedPlansProvider>
          </PlanTerminationProvider>
        </ApprovalPolicyProvider>
      </AgenticCapabilitiesProvider>
    </AiHubAppearanceProvider>
  );
};

export const AiHubPrototypeRoot: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [resetGeneration, setResetGeneration] = useState(0);
  const [showResetNotice, setShowResetNotice] = useState(false);

  const resetPrototype = useCallback(() => {
    // Clear only this prototype's session data; appearance preferences are shared
    // with other prototypes and must remain untouched.
    try {
      for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
        const key = sessionStorage.key(index);
        if (key?.startsWith(PROTOTYPE_SESSION_KEY_PREFIX)) {
          sessionStorage.removeItem(key);
        }
      }
    } catch {
      // The in-memory reset still works when storage is unavailable.
    }
    setResetGeneration((current) => current + 1);
    setShowResetNotice(true);
  }, []);

  const resetContext = useMemo(() => ({ resetPrototype }), [resetPrototype]);

  return (
    <PrototypeResetContext.Provider value={resetContext}>
      <AiHubPrototypeSession key={resetGeneration}>{children}</AiHubPrototypeSession>
      {showResetNotice && (
        <AlertGroup isToast isLiveRegion aria-label="Prototype notifications">
          <Alert
            variant="success"
            title="Prototype reset"
            timeout={4000}
            onTimeout={() => setShowResetNotice(false)}
          >
            Run states and phase configuration were restored to their initial mock values.
          </Alert>
        </AlertGroup>
      )}
    </PrototypeResetContext.Provider>
  );
};

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, AlertActionCloseButton, AlertGroup } from '@patternfly/react-core';
import { AiHubAppearanceProvider } from '../context/AiHubAppearanceContext';
import { AgenticCapabilitiesProvider } from '../context/AgenticCapabilitiesContext';
import { ApprovalPolicyProvider } from '../context/ApprovalPolicyContext';
import { PlanTerminationProvider } from '../context/PlanTerminationContext';
import { DeletedPlansProvider } from '../context/DeletedPlansContext';
import { PlanWorkflowProvider } from '../context/PlanWorkflowContext';
import { PlanWorkflowBridge } from './PlanWorkflowBridge';
import { MulticlusterDevProvider } from '../context/MulticlusterDevContext';
import { MulticlusterDevToggle } from './MulticlusterDevToggle';
import { PrototypeResetContext } from '../context/PrototypeResetContext';

const PROTOTYPE_SESSION_KEY_PREFIX = 'hpux.ai-hub-autonomous-agentic-plans-mvp.';

const AiHubPrototypeSession: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AiHubAppearanceProvider>
      <AgenticCapabilitiesProvider>
        <ApprovalPolicyProvider>
          <PlanTerminationProvider>
            <DeletedPlansProvider>
              <PlanWorkflowProvider>
                <MulticlusterDevProvider>
                  <PlanWorkflowBridge />
                  {children}
                  {/* DEV ONLY - REMOVE FOR PRODUCTION */}
                  <MulticlusterDevToggle />
                </MulticlusterDevProvider>
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
    try {
      for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
        const key = sessionStorage.key(index);
        if (key?.startsWith(PROTOTYPE_SESSION_KEY_PREFIX)) {
          sessionStorage.removeItem(key);
        }
      }
    } catch {
      // The keyed provider remount still resets in-memory state when storage is unavailable.
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
            actionClose={<AlertActionCloseButton onClose={() => setShowResetNotice(false)} />}
          >
            Run states and phase configuration were restored to their initial mock values.
          </Alert>
        </AlertGroup>
      )}
    </PrototypeResetContext.Provider>
  );
};

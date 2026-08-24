import React from 'react';
import { AiHubAppearanceProvider } from '../context/AiHubAppearanceContext';
import { AgenticCapabilitiesProvider } from '../context/AgenticCapabilitiesContext';
import { ApprovalPolicyProvider } from '../context/ApprovalPolicyContext';
import { PlanTerminationProvider } from '../context/PlanTerminationContext';
import { DeletedPlansProvider } from '../context/DeletedPlansContext';
import { PlanWorkflowProvider } from '../context/PlanWorkflowContext';
import { PlanWorkflowBridge } from './PlanWorkflowBridge';
import { InvestigationPanelProvider } from '../context/InvestigationPanelContext';
import { InvestigationSidePanel } from './InvestigationSidePanel';

export const AiHubPrototypeRoot: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AiHubAppearanceProvider>
      <AgenticCapabilitiesProvider>
        <ApprovalPolicyProvider>
          <PlanTerminationProvider>
            <DeletedPlansProvider>
              <PlanWorkflowProvider>
                <InvestigationPanelProvider>
                  <PlanWorkflowBridge />
                  {children}
                  <InvestigationSidePanel />
                </InvestigationPanelProvider>
              </PlanWorkflowProvider>
            </DeletedPlansProvider>
          </PlanTerminationProvider>
        </ApprovalPolicyProvider>
      </AgenticCapabilitiesProvider>
    </AiHubAppearanceProvider>
  );
};

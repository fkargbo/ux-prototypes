/**
 * FeedbackPanelWrapper — Post 5.0 prototype only
 *
 * Composes AiHubAppearanceProvider with agentic plan contexts and the
 * FeedbackSidePanel so the panel is mounted once for the entire prototype
 * without touching any shared component.
 */

import React from 'react';
import { AiHubAppearanceProvider } from '../context/AiHubAppearanceContext';
import { AgenticCapabilitiesProvider } from '../context/AgenticCapabilitiesContext';
import { ApprovalPolicyProvider } from '../context/ApprovalPolicyContext';
import { PlanTerminationProvider } from '../context/PlanTerminationContext';
import { DeletedPlansProvider } from '../context/DeletedPlansContext';
import { PlanWorkflowProvider } from '../context/PlanWorkflowContext';
import { PlanWorkflowBridge } from './PlanWorkflowBridge';
import { FeedbackSidePanel } from './FeedbackSidePanel';
import { PrototypePerspectiveUrlSync } from './PrototypePerspectiveUrlSync';

export const FeedbackPanelWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AiHubAppearanceProvider>
    <AgenticCapabilitiesProvider>
      <ApprovalPolicyProvider>
        <PlanTerminationProvider>
          <DeletedPlansProvider>
            <PlanWorkflowProvider>
              <PlanWorkflowBridge />
              <PrototypePerspectiveUrlSync />
              {children}
              <FeedbackSidePanel />
            </PlanWorkflowProvider>
          </DeletedPlansProvider>
        </PlanTerminationProvider>
      </ApprovalPolicyProvider>
    </AgenticCapabilitiesProvider>
  </AiHubAppearanceProvider>
);

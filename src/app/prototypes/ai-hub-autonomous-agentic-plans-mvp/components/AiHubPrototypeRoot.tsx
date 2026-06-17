import React from 'react';
import { AiHubAppearanceProvider } from '../context/AiHubAppearanceContext';
import { AgenticCapabilitiesProvider } from '../context/AgenticCapabilitiesContext';
import { PlanTerminationProvider } from '../context/PlanTerminationContext';
import { PlanWorkflowProvider } from '../context/PlanWorkflowContext';
import { PlanWorkflowBridge } from './PlanWorkflowBridge';

export const AiHubPrototypeRoot: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AiHubAppearanceProvider>
    <AgenticCapabilitiesProvider>
      <PlanTerminationProvider>
        <PlanWorkflowProvider>
          <PlanWorkflowBridge />
          {children}
        </PlanWorkflowProvider>
      </PlanTerminationProvider>
    </AgenticCapabilitiesProvider>
  </AiHubAppearanceProvider>
);

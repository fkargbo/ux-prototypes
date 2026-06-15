import React from 'react';
import { AiHubAppearanceProvider } from '../context/AiHubAppearanceContext';
import { AgenticCapabilitiesProvider } from '../context/AgenticCapabilitiesContext';
import { PlanTerminationProvider } from '../context/PlanTerminationContext';

export const AiHubPrototypeRoot: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AiHubAppearanceProvider>
    <AgenticCapabilitiesProvider>
      <PlanTerminationProvider>{children}</PlanTerminationProvider>
    </AgenticCapabilitiesProvider>
  </AiHubAppearanceProvider>
);

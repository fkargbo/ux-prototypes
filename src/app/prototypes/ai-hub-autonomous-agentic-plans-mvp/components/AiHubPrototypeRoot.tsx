import React from 'react';
import { AiHubAppearanceProvider } from '../context/AiHubAppearanceContext';
import { AgenticCapabilitiesProvider } from '../context/AgenticCapabilitiesContext';
import { PlanTerminationProvider } from '../context/PlanTerminationContext';
import { PrototypePerspectiveUrlSync } from './PrototypePerspectiveUrlSync';

export const AiHubPrototypeRoot: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AiHubAppearanceProvider>
    <AgenticCapabilitiesProvider>
      <PlanTerminationProvider>
        <PrototypePerspectiveUrlSync />
        {children}
      </PlanTerminationProvider>
    </AgenticCapabilitiesProvider>
  </AiHubAppearanceProvider>
);

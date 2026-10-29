/**
 * FeedbackPanelWrapper — Post 5.0 prototype only
 *
 * Composes AiHubAppearanceProvider with the FeedbackSidePanel so the panel is
 * mounted once for the entire prototype without touching any shared component.
 */

import React from 'react';
import { AiHubAppearanceProvider } from '../context/AiHubAppearanceContext';
import { FeedbackSidePanel } from './FeedbackSidePanel';

export const FeedbackPanelWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AiHubAppearanceProvider>
    {children}
    <FeedbackSidePanel />
  </AiHubAppearanceProvider>
);

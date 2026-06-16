import React from 'react';
import { AgenticCapabilitiesHeaderSwitch } from './AgenticCapabilitiesHeaderSwitch';

/** Page header shell — pins Agentic Capabilities to the top-right without wrapping on narrow viewports. */
export const AiHubPageHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="template-page-heading ols-ai-hub-page-heading">
    <div className="ols-ai-hub-page-heading-actions">
      <AgenticCapabilitiesHeaderSwitch />
    </div>
    <div className="ols-ai-hub-page-heading-body">{children}</div>
  </div>
);

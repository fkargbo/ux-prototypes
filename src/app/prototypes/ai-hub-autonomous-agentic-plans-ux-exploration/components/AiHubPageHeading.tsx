import React from 'react';

/** Page header shell. */
export const AiHubPageHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="template-page-heading ols-ai-hub-page-heading">
    <div className="ols-ai-hub-page-heading-body">{children}</div>
  </div>
);

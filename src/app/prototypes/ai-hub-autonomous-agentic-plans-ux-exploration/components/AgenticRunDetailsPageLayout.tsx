import React from 'react';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';

export type AgenticRunDetailsBreadcrumbProps = {
  listLabel: string;
  onNavigateBack: () => void;
};

export const AgenticRunDetailsBreadcrumb: React.FC<AgenticRunDetailsBreadcrumbProps> = ({
  listLabel,
  onNavigateBack,
}) => (
  <Breadcrumb>
    <BreadcrumbItem component="button" onClick={onNavigateBack}>
      {listLabel}
    </BreadcrumbItem>
    <BreadcrumbItem isActive>Agentic run details</BreadcrumbItem>
  </Breadcrumb>
);

type AgenticRunDetailsLayoutProps = {
  /** Sub-header, alerts, and “Agentic run details” copy — scrolls with the page. */
  subheader: React.ReactNode;
  /** Timeline and melded phase content — scrolls with the page. */
  children: React.ReactNode;
  /** Action bar + AI disclaimer — sticky to viewport bottom within the drilldown column. */
  actions?: React.ReactNode;
};

/**
 * Agentic run details column: one document scroll (console main), footer sticks to bottom only.
 */
export const AgenticRunDetailsLayout: React.FC<AgenticRunDetailsLayoutProps> = ({
  subheader,
  children,
  actions,
}) => (
  <div className="ols-agentic-run-details-layout">
    <div className="ols-agentic-run-details-layout__main">
      <div className="ols-agentic-run-details-layout__subheader">{subheader}</div>
      <div
        className="ols-agentic-run-details-layout__timeline"
        aria-label="Agentic run timeline and remediation details"
      >
        {children}
      </div>
    </div>
    {actions ? (
      <footer className="ols-agentic-run-details-layout__footer" aria-label="Run actions">
        {actions}
      </footer>
    ) : null}
  </div>
);

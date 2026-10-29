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
  /** Action bar + AI disclaimer — sticky to the scrollport bottom (PF main), full drilldown width. */
  actions?: React.ReactNode;
};

/**
 * Agentic run details column inside `ols-plan-remediation-drilldown`.
 * Footer uses in-flow `position: sticky` (same pattern as the published gh-pages build) so it
 * aligns with the OpenShift content well — not viewport-fixed, which left a gap under glass chrome.
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

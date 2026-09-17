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
  /** Sub-header, alerts, and “Agentic run details” copy — does not scroll. */
  subheader: React.ReactNode;
  /** Timeline and melded phase content — scrolls inside the content column. */
  children: React.ReactNode;
  /** Sticky action bar + AI disclaimer; spans full drilldown width. */
  actions?: React.ReactNode;
};

/**
 * Three-part column inside `ols-plan-remediation-drilldown` (no nested PF Page — avoids
 * fighting the OpenShift console page grid and broken fill/sticky sections).
 */
export const AgenticRunDetailsLayout: React.FC<AgenticRunDetailsLayoutProps> = ({
  subheader,
  children,
  actions,
}) => (
  <div className="ols-agentic-run-details-layout">
    <div className="ols-agentic-run-details-layout__subheader">{subheader}</div>
    <div
      className="ols-agentic-run-details-layout__scroll"
      role="region"
      aria-label="Agentic run timeline and remediation details"
      tabIndex={0}
    >
      {children}
    </div>
    {actions ? (
      <footer className="ols-agentic-run-details-layout__footer" aria-label="Run actions">
        {actions}
      </footer>
    ) : null}
  </div>
);

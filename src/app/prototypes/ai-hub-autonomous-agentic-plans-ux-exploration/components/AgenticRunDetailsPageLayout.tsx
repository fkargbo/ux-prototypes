import React from 'react';
import { Breadcrumb, BreadcrumbItem, Page } from '@patternfly/react-core';

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

type AgenticRunDetailsPageFrameProps = {
  /** `PageSection` nodes from `RemediationBlueprintPanel`. */
  children: React.ReactNode;
  'aria-label'?: string;
};

/**
 * PF6 filled page column inside `template-page-content`. Breadcrumb and run title render
 * in the standard template sections above this frame (see v2 detail route pages).
 */
export const AgenticRunDetailsPageFrame: React.FC<AgenticRunDetailsPageFrameProps> = ({
  children,
  'aria-label': ariaLabel,
}) => (
  <Page isContentFilled className="ols-agentic-run-details-page" aria-label={ariaLabel}>
    {children}
  </Page>
);

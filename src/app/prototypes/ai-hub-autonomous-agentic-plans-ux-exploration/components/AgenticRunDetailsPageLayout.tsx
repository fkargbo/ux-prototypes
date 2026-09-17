import React, { useLayoutEffect, useRef } from 'react';
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
  /** Action bar + AI disclaimer — pinned to viewport bottom within the drilldown column. */
  actions?: React.ReactNode;
};

/**
 * Syncs fixed footer geometry to the drilldown column width and reserves exact scroll
 * height via a spacer (no sticky gap, no scroll past the bar).
 */
const useAgenticRunFooterGeometry = (
  layoutRef: React.RefObject<HTMLDivElement | null>,
  footerRef: React.RefObject<HTMLElement | null>,
  enabled: boolean,
) => {
  useLayoutEffect(() => {
    const layout = layoutRef.current;
    if (!layout || !enabled) {
      layout?.style.removeProperty('--ols-agentic-run-footer-height');
      layout?.style.removeProperty('--ols-agentic-run-footer-left');
      layout?.style.removeProperty('--ols-agentic-run-footer-width');
      return undefined;
    }

    const sync = () => {
      const layoutEl = layoutRef.current;
      const footerEl = footerRef.current;
      if (!layoutEl || !footerEl) return;
      const rect = layoutEl.getBoundingClientRect();
      layoutEl.style.setProperty('--ols-agentic-run-footer-left', `${rect.left}px`);
      layoutEl.style.setProperty('--ols-agentic-run-footer-width', `${rect.width}px`);
      layoutEl.style.setProperty('--ols-agentic-run-footer-height', `${footerEl.offsetHeight}px`);
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(layout);
    if (footerRef.current) ro.observe(footerRef.current);
    window.addEventListener('resize', sync);
    window.addEventListener('scroll', sync, true);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync, true);
    };
  }, [enabled, footerRef, layoutRef]);
};

export const AgenticRunDetailsLayout: React.FC<AgenticRunDetailsLayoutProps> = ({
  subheader,
  children,
  actions,
}) => {
  const layoutRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  useAgenticRunFooterGeometry(layoutRef, footerRef, Boolean(actions));

  return (
    <div ref={layoutRef} className="ols-agentic-run-details-layout">
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
        <>
          <div className="ols-agentic-run-details-layout__footer-spacer" aria-hidden />
          <footer
            ref={footerRef}
            className="ols-agentic-run-details-layout__footer"
            aria-label="Run actions"
          >
            {actions}
          </footer>
        </>
      ) : null}
    </div>
  );
};

import React, { useCallback, useLayoutEffect, useRef } from 'react';
import { Flex, FlexItem } from '@patternfly/react-core';
import './ols-full-page-scroll-template.css';

const SCROLL_LOCK_CLASS = 'ols-fps-scroll-locked';

export type OlsFullPageScrollTemplateProps = {
  /** Applied to the page root (e.g. `ols-ai-hub-page ols-ai-hub-page--v2`). */
  pageClassName?: string;
  /** Main content scroller id (annotation root, etc.). */
  scrollerId?: string;
  /** Snap header band (PF Flex row inside `create-policy-header`). */
  header: React.ReactNode;
  mainAriaLabel: string;
  children: React.ReactNode;
  /** Optional surface on the scroll body (e.g. hub main background). */
  bodyStyle?: React.CSSProperties;
};

/**
 * Masthead/sidebar stay fixed. Only the title Flex band scrolls away (dedicated snap scroller);
 * hub content scrolls in a separate region below.
 */
export const OlsFullPageScrollTemplate: React.FC<OlsFullPageScrollTemplateProps> = ({
  pageClassName,
  scrollerId = 'ols-fps-template-scroller',
  header,
  mainAriaLabel,
  children,
  bodyStyle,
}) => {
  const templateRef = useRef<HTMLDivElement>(null);
  const headerMeasureRef = useRef<HTMLDivElement>(null);
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);

  const syncHeaderHeight = useCallback(() => {
    const headerEl = headerMeasureRef.current;
    const templateEl = templateRef.current;
    if (!headerEl || !templateEl) {
      return;
    }
    const height = headerEl.offsetHeight;
    templateEl.style.setProperty('--ols-fps-header-h', `${height}px`);
  }, []);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add(SCROLL_LOCK_CLASS);
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      root.classList.remove(SCROLL_LOCK_CLASS);
      document.body.style.overflow = previousBodyOverflow;
    };
  }, []);

  useLayoutEffect(() => {
    syncHeaderHeight();
    const headerEl = headerMeasureRef.current;
    if (!headerEl || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const observer = new ResizeObserver(() => syncHeaderHeight());
    observer.observe(headerEl);
    return () => observer.disconnect();
  }, [header, syncHeaderHeight]);

  const handleMainScroll = useCallback(() => {
    const main = mainScrollRef.current;
    const headerScroller = headerScrollRef.current;
    if (!main || !headerScroller || main.scrollTop > 0) {
      return;
    }
    if (headerScroller.scrollTop > 0) {
      headerScroller.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return (
    <div
      ref={templateRef}
      className={['ols-fps-template', 'ols-fps-template-page', pageClassName].filter(Boolean).join(' ')}
    >
      <div
        ref={headerScrollRef}
        className="ols-fps-template__header-scroller"
        aria-label="Page title — scroll to hide or show"
        tabIndex={0}
      >
        <div ref={headerMeasureRef} className="ols-fps-template__header-snap">
          <div className="create-policy-header ols-fps-template__header">{header}</div>
        </div>
        <div className="ols-fps-template__header-scroll-spacer" aria-hidden="true" />
      </div>

      <div
        id={scrollerId}
        ref={mainScrollRef}
        className="ols-fps-template__main"
        role="main"
        aria-label={mainAriaLabel}
        style={bodyStyle}
        onScroll={handleMainScroll}
      >
        {children}
      </div>
    </div>
  );
};

export type OlsFullPageScrollHeaderRowProps = {
  primary: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
};

/** Standard hub title row: `pf-v6-l-flex` + space-between / center / gap-md. */
export const OlsFullPageScrollHeaderRow: React.FC<OlsFullPageScrollHeaderRowProps> = ({
  primary,
  aside,
  className,
}) => (
  <Flex
    className={['ols-fps-template__header-row', className].filter(Boolean).join(' ')}
    justifyContent={{ default: 'justifyContentSpaceBetween' }}
    alignItems={{ default: 'alignItemsCenter' }}
    gap={{ default: 'gapMd' }}
    flexWrap={{ default: 'nowrap' }}
  >
    <FlexItem style={{ minWidth: 0, flex: '1 1 auto' }}>{primary}</FlexItem>
    {aside ? <FlexItem style={{ flexShrink: 0 }}>{aside}</FlexItem> : null}
  </Flex>
);

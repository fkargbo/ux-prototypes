import React, { useLayoutEffect } from 'react';
import { Flex, FlexItem } from '@patternfly/react-core';
import './ols-full-page-scroll-template.css';

const SCROLL_LOCK_CLASS = 'ols-fps-scroll-locked';

export type OlsFullPageScrollTemplateProps = {
  /** Applied to the page root (e.g. `ols-ai-hub-page ols-ai-hub-page--v2`). */
  pageClassName?: string;
  /** Inner scroller id — use for annotation roots or scroll helpers. */
  scrollerId?: string;
  /** Snap header band (PF Flex row inside `create-policy-header`). */
  header: React.ReactNode;
  mainAriaLabel: string;
  children: React.ReactNode;
  /** Optional surface on the scroll body (e.g. hub main background). */
  bodyStyle?: React.CSSProperties;
};

/**
 * OpenShift-style full page: fixed Page chrome (masthead/sidebar), one inner scroller. The title
 * Flex row is the first scroll-snap stop (hides on scroll down, snaps back when scrolling up).
 */
export const OlsFullPageScrollTemplate: React.FC<OlsFullPageScrollTemplateProps> = ({
  pageClassName,
  scrollerId = 'ols-fps-template-scroller',
  header,
  mainAriaLabel,
  children,
  bodyStyle,
}) => {
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

  return (
    <div className={['ols-fps-template', 'ols-fps-template-page', pageClassName].filter(Boolean).join(' ')}>
      <div id={scrollerId} className="ols-fps-template__scroller">
        <div className="create-policy-header ols-fps-template__header">{header}</div>
        <div
          className="ols-fps-template__body"
          role="main"
          aria-label={mainAriaLabel}
          style={bodyStyle}
        >
          {children}
        </div>
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

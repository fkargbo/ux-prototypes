import React, { useCallback, useLayoutEffect, useRef } from 'react';
import { Banner, Flex, FlexItem } from '@patternfly/react-core';
import './prototype-navigation-banner.css';
import { usePrototypeNavBannerScrollChain } from './usePrototypeNavBannerScrollChain';

export type CollapsibleNavigationBannerProps = {
  backToLauncher: React.ReactNode;
  toolbar: React.ReactNode;
};

/**
 * Prototype navigation strip (`pf-v6-c-banner`) above the masthead. Uses a dedicated scroll-snap
 * scroller (templates / AI Hub pattern): scroll down to hide, scroll up at page top to snap back.
 */
export const CollapsibleNavigationBanner: React.FC<CollapsibleNavigationBannerProps> = ({
  backToLauncher,
  toolbar,
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  const syncBannerHeight = useCallback(() => {
    const measureEl = measureRef.current;
    const scrollerEl = scrollerRef.current;
    if (!measureEl || !scrollerEl) {
      return;
    }
    scrollerEl.style.setProperty('--hpux-prototype-nav-banner-h', `${measureEl.offsetHeight}px`);
  }, []);

  useLayoutEffect(() => {
    syncBannerHeight();
    const measureEl = measureRef.current;
    if (!measureEl || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const observer = new ResizeObserver(() => syncBannerHeight());
    observer.observe(measureEl);
    return () => observer.disconnect();
  }, [backToLauncher, toolbar, syncBannerHeight]);

  usePrototypeNavBannerScrollChain(scrollerRef);

  return (
    <div
      ref={scrollerRef}
      className="hpux-prototype-nav-banner-scroller"
      aria-label="Prototype navigation — scroll to hide or show"
      tabIndex={0}
    >
      <div ref={measureRef} className="hpux-prototype-nav-banner-snap">
        <Banner className="hpux-prototype-nav-banner">
          <Flex
            className="hpux-prototype-nav-banner__inner"
            alignItems={{ default: 'alignItemsCenter' }}
            spaceItems={{ default: 'spaceItemsMd' }}
            justifyContent={{ default: 'justifyContentSpaceBetween' }}
          >
            <FlexItem>{backToLauncher}</FlexItem>
            <FlexItem>
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                {toolbar}
              </Flex>
            </FlexItem>
          </Flex>
        </Banner>
      </div>
      <div className="hpux-prototype-nav-banner-spacer" aria-hidden="true" />
    </div>
  );
};

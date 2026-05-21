import { useEffect, type RefObject } from 'react';

/** Page scroll regions that chain wheel events into the prototype nav banner scroller first. */
const PAGE_SCROLL_SELECTORS = [
  '.ols-fps-template__main',
  '.ols-fps-template__scroller',
  '.pf-v6-c-page__main-container',
  '#ols-ai-hub-main',
] as const;

function findPageScroller(from: EventTarget | null): HTMLElement | null {
  if (!(from instanceof Element)) {
    return null;
  }
  for (const selector of PAGE_SCROLL_SELECTORS) {
    const match = from.closest(selector);
    if (match instanceof HTMLElement && match.scrollHeight > match.clientHeight + 1) {
      return match;
    }
  }
  return null;
}

/**
 * When the user scrolls page content at the top, hide/show the nav banner scroller first
 * (same chained scroll feel as the templates page title band).
 */
export function usePrototypeNavBannerScrollChain(bannerScrollerRef: RefObject<HTMLDivElement | null>): void {
  useEffect(() => {
    const bannerScroller = bannerScrollerRef.current;
    if (!bannerScroller) {
      return undefined;
    }

    const maxBannerScroll = () => Math.max(0, bannerScroller.scrollHeight - bannerScroller.clientHeight);

    const onWheel = (event: WheelEvent) => {
      const pageScroller = findPageScroller(event.target);
      if (!pageScroller) {
        return;
      }

      const bannerMax = maxBannerScroll();
      if (bannerMax <= 0) {
        return;
      }

      const { scrollTop: bannerTop } = bannerScroller;
      const { scrollTop: pageTop } = pageScroller;

      if (event.deltaY > 0) {
        if (bannerTop < bannerMax - 1) {
          bannerScroller.scrollTop = Math.min(bannerTop + event.deltaY, bannerMax);
          event.preventDefault();
          return;
        }
        if (pageTop <= 0) {
          return;
        }
      }

      if (event.deltaY < 0) {
        if (bannerTop > 0 && pageTop <= 0) {
          bannerScroller.scrollTop = Math.max(0, bannerTop + event.deltaY);
          event.preventDefault();
        }
      }
    };

    const onPageScroll = (event: Event) => {
      const pageScroller = event.target;
      if (!(pageScroller instanceof HTMLElement)) {
        return;
      }
      if (pageScroller.scrollTop <= 0 && bannerScroller.scrollTop > 0) {
        bannerScroller.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    document.addEventListener('wheel', onWheel, { capture: true, passive: false });
    for (const selector of PAGE_SCROLL_SELECTORS) {
      document.querySelectorAll(selector).forEach((node) => {
        node.addEventListener('scroll', onPageScroll, { passive: true });
      });
    }

    const observer = new MutationObserver(() => {
      for (const selector of PAGE_SCROLL_SELECTORS) {
        document.querySelectorAll(selector).forEach((node) => {
          node.removeEventListener('scroll', onPageScroll);
          node.addEventListener('scroll', onPageScroll, { passive: true });
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('wheel', onWheel, { capture: true });
      observer.disconnect();
      for (const selector of PAGE_SCROLL_SELECTORS) {
        document.querySelectorAll(selector).forEach((node) => {
          node.removeEventListener('scroll', onPageScroll);
        });
      }
    };
  }, [bannerScrollerRef]);
}

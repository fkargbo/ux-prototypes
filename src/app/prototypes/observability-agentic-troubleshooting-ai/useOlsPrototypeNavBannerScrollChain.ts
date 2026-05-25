import { useEffect } from 'react';

const PAGE_SCROLL_SELECTORS = ['#ols-ai-hub-main', '#ols-observe-overview-main'] as const;

const PROTOTYPE_BANNER_SELECTOR = '.hpux-prototype-top-banner';

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

function getBannerScrollMax(): number {
  const banner = document.querySelector(PROTOTYPE_BANNER_SELECTOR);
  return banner instanceof HTMLElement ? banner.offsetHeight : 0;
}

/**
 * Chains wheel events from OLS observe inner scrollers to `document` scroll so the plain
 * `pf-v6-c-banner` hides/shows like other prototypes (no dedicated banner scroller / scrollbar).
 * `.pf-v6-c-page` stays sticky so the masthead does not scroll away.
 */
export function useOlsPrototypeNavBannerScrollChain(): void {
  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      const pageScroller = findPageScroller(event.target);
      if (!pageScroller) {
        return;
      }

      const bannerMax = getBannerScrollMax();
      if (bannerMax <= 0) {
        return;
      }

      const docEl = document.documentElement;
      const docTop = docEl.scrollTop;
      const pageTop = pageScroller.scrollTop;

      if (event.deltaY > 0) {
        if (docTop < bannerMax - 1) {
          docEl.scrollTop = Math.min(docTop + event.deltaY, bannerMax);
          event.preventDefault();
          return;
        }
        if (pageTop <= 0) {
          return;
        }
      }

      if (event.deltaY < 0) {
        if (pageTop <= 0 && docTop > 0) {
          docEl.scrollTop = Math.max(0, docTop + event.deltaY);
          event.preventDefault();
        }
      }
    };

    const onPageScroll = (event: Event) => {
      const pageScroller = event.target;
      if (!(pageScroller instanceof HTMLElement)) {
        return;
      }
      if (pageScroller.scrollTop <= 0 && document.documentElement.scrollTop > 0) {
        document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    const bindPageScrollListeners = () => {
      for (const selector of PAGE_SCROLL_SELECTORS) {
        document.querySelectorAll(selector).forEach((node) => {
          node.removeEventListener('scroll', onPageScroll);
          node.addEventListener('scroll', onPageScroll, { passive: true });
        });
      }
    };

    document.addEventListener('wheel', onWheel, { capture: true, passive: false });
    bindPageScrollListeners();

    const observer = new MutationObserver(bindPageScrollListeners);
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
  }, []);
}

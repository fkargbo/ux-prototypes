import { useEffect } from 'react';

const OLS_PAGE_SHELLS = [
  { shell: '.ols-ai-hub-page', main: '#ols-ai-hub-main' },
  { shell: '.ols-observe-overview-page', main: '#ols-observe-overview-main' },
] as const;

const PROTOTYPE_BANNER_SELECTOR = '.hpux-prototype-top-banner';

type OlsWheelContext = {
  mainScroller: HTMLElement;
  /** Wheel over fixed chrome (breadcrumb / `create-policy-header`), not over the scrolling main region. */
  isPageChrome: boolean;
};

function findOlsWheelContext(from: EventTarget | null): OlsWheelContext | null {
  if (!(from instanceof Element)) {
    return null;
  }

  for (const { shell, main } of OLS_PAGE_SHELLS) {
    const shellEl = from.closest(shell);
    if (!(shellEl instanceof HTMLElement)) {
      continue;
    }

    const mainScroller = shellEl.querySelector(main);
    if (!(mainScroller instanceof HTMLElement)) {
      continue;
    }

    return {
      mainScroller,
      isPageChrome: from.closest(main) === null,
    };
  }

  return null;
}

function getBannerScrollMax(): number {
  const banner = document.querySelector(PROTOTYPE_BANNER_SELECTOR);
  return banner instanceof HTMLElement ? banner.offsetHeight : 0;
}

function handleWheel(event: WheelEvent, { mainScroller, isPageChrome }: OlsWheelContext): void {
  const bannerMax = getBannerScrollMax();
  if (bannerMax <= 0) {
    return;
  }

  const docEl = document.documentElement;
  const docTop = docEl.scrollTop;
  const mainTop = mainScroller.scrollTop;
  const mainMax = Math.max(0, mainScroller.scrollHeight - mainScroller.clientHeight);

  if (event.deltaY > 0) {
    if (docTop < bannerMax - 1) {
      docEl.scrollTop = Math.min(docTop + event.deltaY, bannerMax);
      event.preventDefault();
      return;
    }

    if (isPageChrome) {
      if (mainTop < mainMax - 1) {
        mainScroller.scrollTop = Math.min(mainTop + event.deltaY, mainMax);
        event.preventDefault();
        return;
      }
      event.preventDefault();
    }

    return;
  }

  if (event.deltaY < 0) {
    if (isPageChrome && mainTop > 0) {
      mainScroller.scrollTop = Math.max(0, mainTop + event.deltaY);
      event.preventDefault();
      return;
    }

    if (mainTop <= 0 && docTop > 0) {
      docEl.scrollTop = Math.max(0, docTop + event.deltaY);
      event.preventDefault();
      return;
    }

    if (isPageChrome) {
      event.preventDefault();
    }
  }
}

/**
 * Chains wheel events from OLS observe pages to document scroll (prototype banner) and the inner
 * main scroller. Fixed page chrome (`create-policy-header`, breadcrumbs) is included so wheel there
 * does not scroll the whole document past the masthead.
 */
export function useOlsPrototypeNavBannerScrollChain(): void {
  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      const ctx = findOlsWheelContext(event.target);
      if (!ctx) {
        return;
      }

      handleWheel(event, ctx);
    };

    const onPageScroll = (event: Event) => {
      const pageScroller = event.target;
      if (!(pageScroller instanceof HTMLElement)) {
        return;
      }

      const isMain =
        pageScroller.matches('#ols-ai-hub-main') || pageScroller.matches('#ols-observe-overview-main');
      if (!isMain) {
        return;
      }

      if (pageScroller.scrollTop <= 0 && document.documentElement.scrollTop > 0) {
        document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    const bindPageScrollListeners = () => {
      for (const { main } of OLS_PAGE_SHELLS) {
        document.querySelectorAll(main).forEach((node) => {
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
      for (const { main } of OLS_PAGE_SHELLS) {
        document.querySelectorAll(main).forEach((node) => {
          node.removeEventListener('scroll', onPageScroll);
        });
      }
    };
  }, []);
}

import { useEffect } from 'react';

/** Page shell is the sole vertical scroller (header + main scroll together below the masthead). */
const OLS_PAGE_SHELLS = [
  { shell: '.ols-ai-hub-page' },
  { shell: '.ols-observe-overview-page' },
] as const;

const BANNER_SELECTOR = '.hpux-prototype-top-banner';

type OlsWheelContext = {
  mainScroller: HTMLElement;
  isPageChrome: boolean;
};

function findOlsWheelContext(from: EventTarget | null): OlsWheelContext | null {
  if (!(from instanceof Element)) {
    return null;
  }

  for (const { shell } of OLS_PAGE_SHELLS) {
    const shellEl = from.closest(shell);
    if (!(shellEl instanceof HTMLElement)) {
      continue;
    }

    return {
      mainScroller: shellEl,
      isPageChrome: false,
    };
  }

  return null;
}

function getBannerFullHeight(): number {
  const banner = document.querySelector(BANNER_SELECTOR);
  return banner instanceof HTMLElement ? banner.offsetHeight : 0;
}

function getBannerVisibleHeight(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--hpux-prototype-banner-visible-h').trim();
  if (!raw) {
    return getBannerFullHeight();
  }
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : getBannerFullHeight();
}

function setBannerVisibleHeight(px: number): void {
  document.documentElement.style.setProperty('--hpux-prototype-banner-visible-h', `${Math.max(0, px)}px`);
}

function syncBannerFullHeight(): void {
  const full = getBannerFullHeight();
  if (full <= 0) {
    return;
  }
  document.documentElement.style.setProperty('--hpux-prototype-banner-full-h', `${full}px`);
  const raw = document.documentElement.style.getPropertyValue('--hpux-prototype-banner-visible-h').trim();
  if (!raw) {
    setBannerVisibleHeight(full);
    return;
  }
  const visible = getBannerVisibleHeight();
  if (visible > full) {
    setBannerVisibleHeight(full);
  }
}

function getBannerHiddenAmount(): number {
  const full = getBannerFullHeight();
  if (full <= 0) {
    return 0;
  }
  return Math.max(0, full - getBannerVisibleHeight());
}

function handleWheel(event: WheelEvent, { mainScroller, isPageChrome }: OlsWheelContext): void {
  const bannerFull = getBannerFullHeight();
  if (bannerFull <= 0) {
    return;
  }

  const hidden = getBannerHiddenAmount();
  const mainTop = mainScroller.scrollTop;
  const mainMax = Math.max(0, mainScroller.scrollHeight - mainScroller.clientHeight);

  if (event.deltaY > 0) {
    if (hidden < bannerFull - 1) {
      const nextHidden = Math.min(hidden + event.deltaY, bannerFull);
      setBannerVisibleHeight(bannerFull - nextHidden);
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

    if (mainTop <= 0 && hidden > 0) {
      const nextHidden = Math.max(0, hidden + event.deltaY);
      setBannerVisibleHeight(bannerFull - nextHidden);
      event.preventDefault();
      return;
    }

    if (isPageChrome) {
      event.preventDefault();
    }
  }
}

/**
 * Collapses the prototype nav banner slot via CSS max-height (no banner scrollbar).
 * Masthead stays in the viewport; `.ols-*-page` scrolls all page content below it.
 */
export function useOlsPrototypeBannerCollapse(): void {
  useEffect(() => {
    syncBannerFullHeight();

    const banner = document.querySelector(BANNER_SELECTOR);
    let resizeObserver: ResizeObserver | undefined;
    if (banner instanceof HTMLElement && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => syncBannerFullHeight());
      resizeObserver.observe(banner);
    }

    const onWheel = (event: WheelEvent) => {
      let ctx = findOlsWheelContext(event.target);
      if (!ctx && event.target instanceof Element) {
        const onBannerSlot = event.target.closest('.hpux-prototype-banner-slot');
        if (onBannerSlot) {
          const shell = document.querySelector('.ols-ai-hub-page, .ols-observe-overview-page');
          if (shell instanceof HTMLElement) {
            ctx = { mainScroller: shell, isPageChrome: true };
          }
        }
      }
      if (!ctx) {
        return;
      }
      handleWheel(event, ctx);
    };

    const onPageScroll = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      if (!target.matches('.ols-ai-hub-page, .ols-observe-overview-page')) {
        return;
      }
      if (target.scrollTop <= 0 && getBannerHiddenAmount() > 0) {
        setBannerVisibleHeight(getBannerFullHeight());
      }
    };

    const bindPageScrollListeners = () => {
      for (const { shell } of OLS_PAGE_SHELLS) {
        document.querySelectorAll(shell).forEach((node) => {
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
      resizeObserver?.disconnect();
      for (const { shell } of OLS_PAGE_SHELLS) {
        document.querySelectorAll(shell).forEach((node) => {
          node.removeEventListener('scroll', onPageScroll);
        });
      }
      document.documentElement.style.removeProperty('--hpux-prototype-banner-visible-h');
      document.documentElement.style.removeProperty('--hpux-prototype-banner-full-h');
    };
  }, []);
}

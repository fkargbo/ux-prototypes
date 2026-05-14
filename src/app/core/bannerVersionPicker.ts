import { useSyncExternalStore } from 'react';

export const BANNER_VERSION_CHANGE_EVENT = 'hpux-banner-version-change';

export function getBannerVersionStorageKey(prototypeId: string): string {
  return `hpux.bannerVersion.${prototypeId}`;
}

export function readBannerVersionKey(prototypeId: string, fallback: string): string {
  try {
    const v = sessionStorage.getItem(getBannerVersionStorageKey(prototypeId));
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

export function useBannerVersionSelection(prototypeId: string, fallbackKey: string): string {
  return useSyncExternalStore(
    (onStoreChange) => {
      const onCustom = (e: Event) => {
        const d = (e as CustomEvent<{ prototypeId?: string }>).detail;
        if (d?.prototypeId === prototypeId) {
          onStoreChange();
        }
      };
      const onStorage = () => onStoreChange();
      window.addEventListener(BANNER_VERSION_CHANGE_EVENT, onCustom);
      window.addEventListener('storage', onStorage);
      return () => {
        window.removeEventListener(BANNER_VERSION_CHANGE_EVENT, onCustom);
        window.removeEventListener('storage', onStorage);
      };
    },
    () => readBannerVersionKey(prototypeId, fallbackKey),
    () => readBannerVersionKey(prototypeId, fallbackKey)
  );
}

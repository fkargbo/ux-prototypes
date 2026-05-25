import React from 'react';
import { useOlsPrototypeNavBannerScrollChain } from '../useOlsPrototypeNavBannerScrollChain';

/** Mounts document-level banner scroll chaining for this prototype (no UI). */
export const OlsPrototypeChromeScroll: React.FC = () => {
  useOlsPrototypeNavBannerScrollChain();
  return null;
};

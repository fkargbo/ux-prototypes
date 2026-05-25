import React from 'react';
import { useOlsPrototypeBannerCollapse } from '../useOlsPrototypeBannerCollapse';

/** Mounts banner collapse + inner-main scroll chaining for OLS observe pages. */
export const OlsPrototypeChromeScroll: React.FC = () => {
  useOlsPrototypeBannerCollapse();
  return null;
};

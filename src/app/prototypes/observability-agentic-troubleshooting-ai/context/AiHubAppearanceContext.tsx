import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import redHatOpenShiftLogoDarkSvg from '../assets/redhatopenshift-dark.svg';

export type ThemeColorMode = 'system' | 'light' | 'dark';
export type ThemeVariantMode = 'theme-default' | 'theme-felt';
export type ThemeContrastMode = 'contrast-system' | 'contrast-default' | 'contrast-high' | 'contrast-glass';

const COLOR_PREFERENCE_KEY = 'theme-preference';
const VARIANT_PREFERENCE_KEY = 'theme-variant-preference';
const CONTRAST_PREFERENCE_KEY = 'contrast-preference';
const MASTHEAD_LOGO_LIGHT_SRC_ATTR = 'data-ols-ai-hub-logo-light-src';

/** Webpack loads project SVGs as raw XML (`raw-loader`). */
const RED_HAT_OPENSHIFT_LOGO_DARK_DATA_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  redHatOpenShiftLogoDarkSvg,
)}`;

function readColorMode(): ThemeColorMode {
  if (typeof window === 'undefined') {
    return 'system';
  }
  const value = window.localStorage.getItem(COLOR_PREFERENCE_KEY);
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
}

function readThemeVariant(): ThemeVariantMode {
  if (typeof window === 'undefined') {
    return 'theme-default';
  }
  const value = window.localStorage.getItem(VARIANT_PREFERENCE_KEY);
  if (value === 'theme-redhat') {
    return 'theme-felt';
  }
  return value === 'theme-default' || value === 'theme-felt' ? value : 'theme-default';
}

function readContrastMode(): ThemeContrastMode {
  if (typeof window === 'undefined') {
    return 'contrast-default';
  }
  const value = window.localStorage.getItem(CONTRAST_PREFERENCE_KEY);
  return value === 'contrast-system' ||
    value === 'contrast-default' ||
    value === 'contrast-high' ||
    value === 'contrast-glass'
    ? value
    : 'contrast-default';
}

type AiHubAppearanceContextValue = {
  themeColorMode: ThemeColorMode;
  setThemeColorMode: React.Dispatch<React.SetStateAction<ThemeColorMode>>;
  themeVariantMode: ThemeVariantMode;
  setThemeVariantMode: React.Dispatch<React.SetStateAction<ThemeVariantMode>>;
  themeContrastMode: ThemeContrastMode;
  setThemeContrastMode: React.Dispatch<React.SetStateAction<ThemeContrastMode>>;
  isRtl: boolean;
  setIsRtl: React.Dispatch<React.SetStateAction<boolean>>;
  resolvedColorMode: 'light' | 'dark';
  isGlassContrast: boolean;
  themeTriggerAriaLabel: string;
};

const AiHubAppearanceContext = createContext<AiHubAppearanceContextValue | null>(null);

export const AiHubAppearanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeColorMode, setThemeColorMode] = useState<ThemeColorMode>(() => readColorMode());
  const [themeVariantMode, setThemeVariantMode] = useState<ThemeVariantMode>(() => readThemeVariant());
  const [themeContrastMode, setThemeContrastMode] = useState<ThemeContrastMode>(() => readContrastMode());
  const [isRtl, setIsRtl] = useState(false);
  const [systemPrefsVersion, setSystemPrefsVersion] = useState(0);
  const initialHtmlStateRef = useRef<{
    dark: boolean;
    felt: boolean;
    highContrast: boolean;
    glass: boolean;
    dir: string | null;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(COLOR_PREFERENCE_KEY, themeColorMode);
  }, [themeColorMode]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(VARIANT_PREFERENCE_KEY, themeVariantMode);
  }, [themeVariantMode]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(CONTRAST_PREFERENCE_KEY, themeContrastMode);
  }, [themeContrastMode]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const contrastQuery = window.matchMedia('(prefers-contrast: more)');
    const onSystemPrefChange = () => setSystemPrefsVersion((current) => current + 1);

    if (darkQuery.addEventListener) {
      darkQuery.addEventListener('change', onSystemPrefChange);
      contrastQuery.addEventListener('change', onSystemPrefChange);
      return () => {
        darkQuery.removeEventListener('change', onSystemPrefChange);
        contrastQuery.removeEventListener('change', onSystemPrefChange);
      };
    }

    darkQuery.addListener(onSystemPrefChange);
    contrastQuery.addListener(onSystemPrefChange);
    return () => {
      darkQuery.removeListener(onSystemPrefChange);
      contrastQuery.removeListener(onSystemPrefChange);
    };
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    initialHtmlStateRef.current = {
      dark: html.classList.contains('pf-v6-theme-dark'),
      felt: html.classList.contains('pf-v6-theme-felt'),
      highContrast: html.classList.contains('pf-v6-theme-high-contrast'),
      glass: html.classList.contains('pf-v6-theme-glass'),
      dir: html.getAttribute('dir'),
    };
    return () => {
      const initial = initialHtmlStateRef.current;
      if (!initial) {
        return;
      }
      html.classList.toggle('pf-v6-theme-dark', initial.dark);
      html.classList.toggle('pf-v6-theme-felt', initial.felt);
      html.classList.toggle('pf-v6-theme-high-contrast', initial.highContrast);
      html.classList.toggle('pf-v6-theme-glass', initial.glass);
      if (initial.dir) {
        html.setAttribute('dir', initial.dir);
      } else {
        html.removeAttribute('dir');
      }
    };
  }, []);

  const resolvedColorMode = useMemo<'light' | 'dark'>(() => {
    if (themeColorMode === 'light' || themeColorMode === 'dark') {
      return themeColorMode;
    }
    if (typeof window === 'undefined' || !window.matchMedia) {
      return 'light';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, [themeColorMode, systemPrefsVersion]);

  const hasSystemHighContrast = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }
    return window.matchMedia('(prefers-contrast: more)').matches;
  }, [systemPrefsVersion]);

  useEffect(() => {
    const html = document.documentElement;
    const enableDark = resolvedColorMode === 'dark';
    const enableFelt = themeVariantMode === 'theme-felt';
    const enableHighContrast =
      themeContrastMode === 'contrast-high' || (themeContrastMode === 'contrast-system' && hasSystemHighContrast);
    const enableGlass = themeContrastMode === 'contrast-glass';

    html.classList.toggle('pf-v6-theme-dark', enableDark);
    html.classList.toggle('pf-v6-theme-felt', enableFelt);
    html.classList.toggle('pf-v6-theme-high-contrast', enableHighContrast);
    html.classList.toggle('pf-v6-theme-glass', enableGlass);
    html.setAttribute('dir', isRtl ? 'rtl' : 'ltr');

    // Swap masthead logo: white wordmark in dark mode, keep red fedora (no CSS invert).
    const brandImg = document.querySelector('.pf-v6-c-masthead__brand img') as HTMLImageElement | null;
    if (brandImg) {
      if (!brandImg.getAttribute(MASTHEAD_LOGO_LIGHT_SRC_ATTR)) {
        brandImg.setAttribute(MASTHEAD_LOGO_LIGHT_SRC_ATTR, brandImg.currentSrc || brandImg.src);
      }
      const lightSrc = brandImg.getAttribute(MASTHEAD_LOGO_LIGHT_SRC_ATTR) || brandImg.src;
      brandImg.src = enableDark ? RED_HAT_OPENSHIFT_LOGO_DARK_DATA_URL : lightSrc;
    }

    return () => {
      const img = document.querySelector(
        `.pf-v6-c-masthead__brand img[${MASTHEAD_LOGO_LIGHT_SRC_ATTR}]`,
      ) as HTMLImageElement | null;
      if (img) {
        const lightSrc = img.getAttribute(MASTHEAD_LOGO_LIGHT_SRC_ATTR);
        if (lightSrc) {
          img.src = lightSrc;
        }
      }
    };
  }, [resolvedColorMode, themeVariantMode, themeContrastMode, hasSystemHighContrast, isRtl]);

  const themeTriggerAriaLabel = useMemo(() => {
    const scheme =
      themeColorMode === 'system' ? 'System' : themeColorMode === 'light' ? 'Light' : 'Dark';
    return `Appearance settings, color scheme: ${scheme}`;
  }, [themeColorMode]);

  const isGlassContrast = themeContrastMode === 'contrast-glass';

  const value = useMemo(
    () => ({
      themeColorMode,
      setThemeColorMode,
      themeVariantMode,
      setThemeVariantMode,
      themeContrastMode,
      setThemeContrastMode,
      isRtl,
      setIsRtl,
      resolvedColorMode,
      isGlassContrast,
      themeTriggerAriaLabel,
    }),
    [
      themeColorMode,
      themeVariantMode,
      themeContrastMode,
      isRtl,
      resolvedColorMode,
      isGlassContrast,
      themeTriggerAriaLabel,
    ],
  );

  return <AiHubAppearanceContext.Provider value={value}>{children}</AiHubAppearanceContext.Provider>;
};

export function useAiHubAppearance(): AiHubAppearanceContextValue {
  const ctx = useContext(AiHubAppearanceContext);
  if (!ctx) {
    throw new Error('useAiHubAppearance must be used within AiHubAppearanceProvider');
  }
  return ctx;
}

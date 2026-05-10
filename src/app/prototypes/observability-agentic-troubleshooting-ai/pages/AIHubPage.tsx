import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Content,
  Divider,
  Dropdown,
  Flex,
  Icon,
  MenuToggle,
  Stack,
  StackItem,
  Switch,
  Title,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
} from '@patternfly/react-core';
import type { MenuToggleElement } from '@patternfly/react-core';
import {
  ArrowCircleDownIcon,
  ArrowCircleLeftIcon,
  ArrowCircleRightIcon,
  ArrowCircleUpIcon,
  DesktopIcon,
  MoonIcon,
  SunIcon,
} from '@patternfly/react-icons';
import { useBannerVersionSelection } from '@app/core/bannerVersionPicker';
import { useActivePerspective } from '@app/shared/contexts/ActivePerspectiveContext';
import { AutonomousAiObserveWidget } from '../components/autonomousAiObserve/AutonomousAiObserveWidget';
import { AutonomousAiObserveWidgetV2 } from '../components/autonomousAiObserve/AutonomousAiObserveWidgetV2';
import { getClusterById } from '../components/autonomousAiObserve/data';
import { config as prototypeConfig } from '../prototype.config';
import { AgentTokenCounter, AiExperienceIcon, ClusterInventoryBar, FleetInventoryBar } from './ai-hub-v2';
import { useFocusedClusterId } from './ai-hub-v2/useFocusedClusterId';
import './ai-hub-page.css';

type ThemeColorMode = 'system' | 'light' | 'dark';
type ThemeVariantMode = 'theme-default' | 'theme-felt';
type ThemeContrastMode = 'contrast-system' | 'contrast-default' | 'contrast-high' | 'contrast-glass';
type UtilityPosition = 'pf-m-top-left' | 'pf-m-top-right' | 'pf-m-bottom-left' | 'pf-m-bottom-right';

const COLOR_PREFERENCE_KEY = 'theme-preference';
const VARIANT_PREFERENCE_KEY = 'theme-variant-preference';
const CONTRAST_PREFERENCE_KEY = 'contrast-preference';
const POSITION_PREFERENCE_KEY = 'fullPageUtilsPosition';

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
    return 'contrast-system';
  }
  const value = window.localStorage.getItem(CONTRAST_PREFERENCE_KEY);
  return value === 'contrast-system' || value === 'contrast-default' || value === 'contrast-high' || value === 'contrast-glass'
    ? value
    : 'contrast-system';
}

function readUtilityPosition(): UtilityPosition {
  if (typeof window === 'undefined') {
    return 'pf-m-bottom-right';
  }
  const value = window.localStorage.getItem(POSITION_PREFERENCE_KEY);
  return value === 'pf-m-top-left' ||
    value === 'pf-m-top-right' ||
    value === 'pf-m-bottom-left' ||
    value === 'pf-m-bottom-right'
    ? value
    : 'pf-m-bottom-right';
}

export const AIHubPage: React.FC = () => {
  const bannerVersionKey = useBannerVersionSelection(
    prototypeConfig.id,
    prototypeConfig.bannerVersionPicker?.defaultKey ?? 'v2'
  );
  const { activePerspective } = useActivePerspective();
  const isHubV2 = bannerVersionKey === 'v2';
  const [fleetClusterDrillDown, setFleetClusterDrillDown] = React.useState(false);
  const focusedClusterId = useFocusedClusterId();
  const focusedCluster = React.useMemo(() => getClusterById(focusedClusterId), [focusedClusterId]);
  const [themeColorMode, setThemeColorMode] = React.useState<ThemeColorMode>(() => readColorMode());
  const [themeVariantMode, setThemeVariantMode] = React.useState<ThemeVariantMode>(() => readThemeVariant());
  const [themeContrastMode, setThemeContrastMode] = React.useState<ThemeContrastMode>(() => readContrastMode());
  const [isRtl, setIsRtl] = React.useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = React.useState(false);
  const [utilityPosition, setUtilityPosition] = React.useState<UtilityPosition>(() => readUtilityPosition());
  const [systemPrefsVersion, setSystemPrefsVersion] = React.useState(0);
  const initialHtmlStateRef = React.useRef<{
    dark: boolean;
    felt: boolean;
    highContrast: boolean;
    glass: boolean;
    dir: string | null;
  } | null>(null);
  const showFleetBreadcrumb = isHubV2 && activePerspective === 'Fleet management' && fleetClusterDrillDown;
  const showFleetInventory = isHubV2 && activePerspective === 'Fleet management' && !fleetClusterDrillDown;
  const showClusterSummary =
    isHubV2 && (activePerspective === 'Core platforms' || (activePerspective === 'Fleet management' && fleetClusterDrillDown));

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(COLOR_PREFERENCE_KEY, themeColorMode);
  }, [themeColorMode]);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(VARIANT_PREFERENCE_KEY, themeVariantMode);
  }, [themeVariantMode]);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(CONTRAST_PREFERENCE_KEY, themeContrastMode);
  }, [themeContrastMode]);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(POSITION_PREFERENCE_KEY, utilityPosition);
  }, [utilityPosition]);

  React.useEffect(() => {
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

  React.useEffect(() => {
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

  const resolvedColorMode = React.useMemo<'light' | 'dark'>(() => {
    if (themeColorMode === 'light' || themeColorMode === 'dark') {
      return themeColorMode;
    }
    if (typeof window === 'undefined' || !window.matchMedia) {
      return 'light';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, [themeColorMode, systemPrefsVersion]);

  const hasSystemHighContrast = React.useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }
    return window.matchMedia('(prefers-contrast: more)').matches;
  }, [systemPrefsVersion]);

  React.useEffect(() => {
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
  }, [resolvedColorMode, themeVariantMode, themeContrastMode, hasSystemHighContrast, isRtl]);

  const triggerIcon = React.useMemo(() => {
    if (resolvedColorMode === 'light') {
      return <SunIcon />;
    }
    if (resolvedColorMode === 'dark') {
      return <MoonIcon />;
    }
    return <DesktopIcon />;
  }, [resolvedColorMode]);

  const themeTriggerAriaLabel = React.useMemo(() => {
    const scheme =
      themeColorMode === 'system'
        ? 'System'
        : themeColorMode === 'light'
          ? 'Light'
          : 'Dark';
    return `Theme selection, current: ${scheme}`;
  }, [themeColorMode]);

  const isGlassContrast = themeContrastMode === 'contrast-glass';

  const positionActions: Array<{ id: UtilityPosition; label: string; icon: React.ReactNode }> = [
    { id: 'pf-m-top-left', label: 'Move to the top left corner', icon: <ArrowCircleUpIcon /> },
    { id: 'pf-m-top-right', label: 'Move to the top right corner', icon: <ArrowCircleRightIcon /> },
    { id: 'pf-m-bottom-left', label: 'Move to the bottom left corner', icon: <ArrowCircleLeftIcon /> },
    { id: 'pf-m-bottom-right', label: 'Move to the bottom right corner', icon: <ArrowCircleDownIcon /> },
  ];

  const rootStyle: React.CSSProperties = isHubV2
    ? {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: isGlassContrast ? 'transparent' : '#f5f5f5',
        boxSizing: 'border-box',
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: isGlassContrast ? 'transparent' : '#f5f5f5',
      };

  const mainStyle: React.CSSProperties = isHubV2
    ? {
        flex: 1,
        minHeight: 0,
        overflow: 'visible',
        backgroundColor: isGlassContrast ? 'transparent' : '#ffffff',
      }
    : {
        flex: 1,
        overflow: 'auto',
        backgroundColor: isGlassContrast ? 'transparent' : '#ffffff',
      };

  return (
    <div className={`ols-ai-hub-page${isHubV2 ? ' ols-ai-hub-page--v2' : ''}`} style={rootStyle}>
      <div className="create-policy-header">
        <div className="ols-ai-hub-page-header-inner">
          <div className="ols-ai-hub-page-header-primary">
            <AiExperienceIcon size={40} />
            <div className="ols-ai-hub-page-header-copy">
              <Title headingLevel="h1" size="2xl">
                AI Troubleshooting Hub (Conceptual design)
              </Title>
              <Content
                component="p"
                className="ols-ai-hub-page-subtitle"
                style={{ marginTop: '8px', marginBottom: 0, color: '#6a6e73' }}
              >
                Accelerate incident response with autonomous investigations, automated evidence gathering, and guided
                fixes.
              </Content>
              <Content
                component="p"
                style={{
                  marginTop: 'var(--pf-t--global--spacer--xs)',
                  marginBottom: 0,
                  fontSize: '12px',
                  color: '#4D4D4D',
                }}
              >
                Always review AI-generated content prior to use.
              </Content>
            </div>
          </div>
          {isHubV2 ? (
            <div className="ols-ai-hub-page-header-aside">
              <AgentTokenCounter />
            </div>
          ) : null}
        </div>
      </div>

      <div id="ols-ai-hub-main" role="main" aria-label="AI Troubleshooting Hub (Conceptual design) content" style={mainStyle}>
        <div
          style={{
            padding: '24px',
            maxWidth: '1200px',
            margin: '0 auto',
            boxSizing: 'border-box',
          }}
        >
          <Stack hasGutter className="ols-ai-hub-main-stack">
            {showFleetBreadcrumb ? (
              <StackItem>
                <Breadcrumb>
                  <BreadcrumbItem>
                    <Button
                      variant="link"
                      isInline
                      onClick={() => setFleetClusterDrillDown(false)}
                      aria-label="Return to AI Troubleshooting Hub fleet overview"
                    >
                      AI Troubleshooting Hub
                    </Button>
                  </BreadcrumbItem>
                  <BreadcrumbItem isActive>{focusedCluster?.name ?? 'Cluster'}</BreadcrumbItem>
                </Breadcrumb>
              </StackItem>
            ) : null}
            {showFleetInventory ? (
              <StackItem>
                <FleetInventoryBar />
              </StackItem>
            ) : null}
            {showClusterSummary ? (
              <StackItem>
                <ClusterInventoryBar title="Cluster summary" />
              </StackItem>
            ) : null}
            <StackItem>
              {bannerVersionKey === 'v2' ? (
                <AutonomousAiObserveWidgetV2
                  fleetClusterDrillDown={fleetClusterDrillDown}
                  onFleetDrillDownChange={setFleetClusterDrillDown}
                />
              ) : (
                <AutonomousAiObserveWidget />
              )}
            </StackItem>
          </Stack>
        </div>
      </div>

      <Flex
        direction={{ default: 'column' }}
        gap={{ default: 'gapSm' }}
        className={['ws-full-page-utils', isRtl ? 'pf-v6-m-dir-rtl' : 'pf-v6-m-dir-ltr', utilityPosition].join(' ')}
      >
        <Dropdown
          className="ws-full-page-utils__dropdown"
          isOpen={isThemeMenuOpen}
          onOpenChange={(open) => setIsThemeMenuOpen(open)}
          shouldFocusToggleOnSelect={false}
          popperProps={{
            placement: 'top-end',
            enableFlip: true,
            distance: 8,
            appendTo: () => document.body,
          }}
          zIndex={13000}
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle
              ref={toggleRef}
              variant="secondary"
              className="ws-full-page-utils__trigger"
              icon={
                <Icon size="lg" status="info">
                  {triggerIcon}
                </Icon>
              }
              onClick={() => setIsThemeMenuOpen((current) => !current)}
              isExpanded={isThemeMenuOpen}
              aria-label={themeTriggerAriaLabel}
            />
          )}
        >
          <div className="ws-full-page-utils__menu-inner" role="dialog" aria-label="Theme utility menu">
            <div className="pf-v6-c-menu__group-title" id="theme-selector-variant-title">
              Theme
            </div>
            <ToggleGroup aria-labelledby="theme-selector-variant-title" className="ws-full-page-utils__toggle-group">
              <ToggleGroupItem
                text="Default"
                buttonId="theme-default"
                isSelected={themeVariantMode === 'theme-default'}
                onChange={(_event, selected) => {
                  if (selected) {
                    setThemeVariantMode('theme-default');
                  }
                }}
              />
              <ToggleGroupItem
                text="Project Felt"
                buttonId="theme-felt"
                isSelected={themeVariantMode === 'theme-felt'}
                onChange={(_event, selected) => {
                  if (selected) {
                    setThemeVariantMode('theme-felt');
                  }
                }}
              />
            </ToggleGroup>
            <Divider />
            <div className="pf-v6-c-menu__group-title" id="theme-selector-color-scheme-title">
              Color scheme
            </div>
            <ToggleGroup aria-labelledby="theme-selector-color-scheme-title" className="ws-full-page-utils__toggle-group">
              <ToggleGroupItem
                text="System"
                buttonId="color-system"
                isSelected={themeColorMode === 'system'}
                onChange={(_event, selected) => {
                  if (selected) {
                    setThemeColorMode('system');
                  }
                }}
              />
              <ToggleGroupItem
                text="Light"
                buttonId="color-light"
                isSelected={themeColorMode === 'light'}
                onChange={(_event, selected) => {
                  if (selected) {
                    setThemeColorMode('light');
                  }
                }}
              />
              <ToggleGroupItem
                text="Dark"
                buttonId="color-dark"
                isSelected={themeColorMode === 'dark'}
                onChange={(_event, selected) => {
                  if (selected) {
                    setThemeColorMode('dark');
                  }
                }}
              />
            </ToggleGroup>
            <Divider />
            <div className="pf-v6-c-menu__group-title" id="theme-selector-contrast-title">
              Contrast mode
            </div>
            <ToggleGroup aria-labelledby="theme-selector-contrast-title" className="ws-full-page-utils__toggle-group">
              <ToggleGroupItem
                text="System"
                buttonId="contrast-system"
                isSelected={themeContrastMode === 'contrast-system'}
                onChange={(_event, selected) => {
                  if (selected) {
                    setThemeContrastMode('contrast-system');
                  }
                }}
              />
              <ToggleGroupItem
                text="Default"
                buttonId="contrast-default"
                isSelected={themeContrastMode === 'contrast-default'}
                onChange={(_event, selected) => {
                  if (selected) {
                    setThemeContrastMode('contrast-default');
                  }
                }}
              />
              <ToggleGroupItem
                text="High contrast"
                buttonId="contrast-high"
                isSelected={themeContrastMode === 'contrast-high'}
                onChange={(_event, selected) => {
                  if (selected) {
                    setThemeContrastMode('contrast-high');
                  }
                }}
              />
              <ToggleGroupItem
                text="Glass"
                buttonId="contrast-glass"
                isSelected={themeContrastMode === 'contrast-glass'}
                onChange={(_event, selected) => {
                  if (selected) {
                    setThemeContrastMode('contrast-glass');
                  }
                }}
              />
            </ToggleGroup>
          </div>
        </Dropdown>
        <Switch
          id="ws-example-rtl-switch"
          label="RTL"
          isChecked={isRtl}
          className="ws-full-page-utils__rtl-switch"
          onChange={(_event, checked) => setIsRtl(checked)}
          aria-label="Toggle RTL mode"
        />
        <Flex
          direction={{ default: 'row' }}
          justifyContent={{ default: 'justifyContentFlexEnd' }}
          gap={{ default: 'gapXs' }}
          className="ws-full-page-utils__position-row"
        >
          {positionActions.map((positionAction) => {
            const isSelected = utilityPosition === positionAction.id;
            return (
              <Tooltip key={positionAction.id} content={positionAction.label}>
                <Button
                  variant="plain"
                  size="sm"
                  className={[
                    'ws-full-page-utils-position-btn',
                    positionAction.id,
                    isSelected ? 'ws-full-page-utils-position-btn--selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-label={`${positionAction.label}${isSelected ? ', selected' : ''}`}
                  onClick={() => setUtilityPosition(positionAction.id)}
                  icon={positionAction.icon}
                />
              </Tooltip>
            );
          })}
        </Flex>
      </Flex>
    </div>
  );
};

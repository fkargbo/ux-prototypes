import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Content,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { useBannerVersionSelection } from '@app/core/bannerVersionPicker';
import { useActivePerspective } from '@app/shared/contexts/ActivePerspectiveContext';
import { AutonomousAiObserveWidget } from '../components/autonomousAiObserve/AutonomousAiObserveWidget';
import { AutonomousAiObserveWidgetV2 } from '../components/autonomousAiObserve/AutonomousAiObserveWidgetV2';
import { getClusterById } from '../components/autonomousAiObserve/data';
import { config as prototypeConfig } from '../prototype.config';
import { AgentTokenCounter, AiExperienceIcon, ClusterInventoryBar, FleetInventoryBar } from './ai-hub-v2';
import { useFocusedClusterId } from './ai-hub-v2/useFocusedClusterId';
import './ai-hub-page.css';

type UiThemeMode = 'system' | 'light' | 'dark';
type UiColorScheme = 'blue' | 'green' | 'purple';
type UiContrastMode = 'default' | 'high';

const THEME_STORAGE_KEY = 'ols.ai-hub.theme-mode';
const SCHEME_STORAGE_KEY = 'ols.ai-hub.color-scheme';
const CONTRAST_STORAGE_KEY = 'ols.ai-hub.contrast-mode';

function readStoredThemeMode(): UiThemeMode {
  if (typeof window === 'undefined') {
    return 'system';
  }
  const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
  return raw === 'light' || raw === 'dark' || raw === 'system' ? raw : 'system';
}

function readStoredColorScheme(): UiColorScheme {
  if (typeof window === 'undefined') {
    return 'blue';
  }
  const raw = window.localStorage.getItem(SCHEME_STORAGE_KEY);
  return raw === 'green' || raw === 'purple' || raw === 'blue' ? raw : 'blue';
}

function readStoredContrastMode(): UiContrastMode {
  if (typeof window === 'undefined') {
    return 'default';
  }
  const raw = window.localStorage.getItem(CONTRAST_STORAGE_KEY);
  return raw === 'high' || raw === 'default' ? raw : 'default';
}

export const AIHubPage: React.FC = () => {
  const bannerVersionKey = useBannerVersionSelection(
    prototypeConfig.id,
    prototypeConfig.bannerVersionPicker?.defaultKey ?? 'v2'
  );
  const { activePerspective } = useActivePerspective();
  const isHubV2 = bannerVersionKey === 'v2';
  const [fleetClusterDrillDown, setFleetClusterDrillDown] = React.useState(false);
  const [themeMode, setThemeMode] = React.useState<UiThemeMode>(() => readStoredThemeMode());
  const [colorScheme, setColorScheme] = React.useState<UiColorScheme>(() => readStoredColorScheme());
  const [contrastMode, setContrastMode] = React.useState<UiContrastMode>(() => readStoredContrastMode());
  const focusedClusterId = useFocusedClusterId();
  const focusedCluster = React.useMemo(() => getClusterById(focusedClusterId), [focusedClusterId]);
  const showFleetBreadcrumb = isHubV2 && activePerspective === 'Fleet management' && fleetClusterDrillDown;
  const showFleetInventory = isHubV2 && activePerspective === 'Fleet management' && !fleetClusterDrillDown;
  const showClusterSummary =
    isHubV2 && (activePerspective === 'Core platforms' || (activePerspective === 'Fleet management' && fleetClusterDrillDown));

  React.useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [themeMode]);

  React.useEffect(() => {
    window.localStorage.setItem(SCHEME_STORAGE_KEY, colorScheme);
  }, [colorScheme]);

  React.useEffect(() => {
    window.localStorage.setItem(CONTRAST_STORAGE_KEY, contrastMode);
  }, [contrastMode]);

  const effectiveThemeMode: Exclude<UiThemeMode, 'system'> = React.useMemo(() => {
    if (themeMode !== 'system') {
      return themeMode;
    }
    if (typeof window === 'undefined' || !window.matchMedia) {
      return 'light';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, [themeMode]);

  const rootStyle: React.CSSProperties = isHubV2
    ? {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--ols-ai-hub-surface-page)',
        boxSizing: 'border-box',
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#f5f5f5',
      };

  const mainStyle: React.CSSProperties = isHubV2
    ? {
        flex: 1,
        minHeight: 0,
        overflow: 'visible',
        backgroundColor: 'var(--ols-ai-hub-surface-main)',
      }
    : {
        flex: 1,
        overflow: 'auto',
        backgroundColor: '#ffffff',
      };

  return (
    <div
      className={[
        'ols-ai-hub-page',
        isHubV2 ? 'ols-ai-hub-page--v2' : '',
        `ols-ai-hub-page--theme-${effectiveThemeMode}`,
        `ols-ai-hub-page--scheme-${colorScheme}`,
        `ols-ai-hub-page--contrast-${contrastMode}`,
      ]
        .filter(Boolean)
        .join(' ')}
      style={rootStyle}
    >
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
                style={{
                  marginTop: 'var(--pf-t--global--spacer--sm)',
                  marginBottom: 0,
                  color: 'var(--ols-ai-hub-text-subtle)',
                }}
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
                  color: 'var(--ols-ai-hub-text-regular)',
                }}
              >
                Always review AI-generated content prior to use.
              </Content>
            </div>
          </div>
          {isHubV2 ? (
            <div className="ols-ai-hub-page-header-aside">
              <div className="ols-ai-hub-page-controls">
                <FormGroup label="Theme" fieldId="ols-ai-hub-theme-mode" className="ols-ai-hub-page-control">
                  <FormSelect
                    value={themeMode}
                    onChange={(_event, value) => setThemeMode(value as UiThemeMode)}
                    aria-label="Select theme mode"
                    id="ols-ai-hub-theme-mode"
                  >
                    <FormSelectOption value="system" label="System" />
                    <FormSelectOption value="light" label="Light" />
                    <FormSelectOption value="dark" label="Dark" />
                  </FormSelect>
                </FormGroup>
                <FormGroup label="Color scheme" fieldId="ols-ai-hub-color-scheme" className="ols-ai-hub-page-control">
                  <FormSelect
                    value={colorScheme}
                    onChange={(_event, value) => setColorScheme(value as UiColorScheme)}
                    aria-label="Select color scheme"
                    id="ols-ai-hub-color-scheme"
                  >
                    <FormSelectOption value="blue" label="Blue" />
                    <FormSelectOption value="green" label="Green" />
                    <FormSelectOption value="purple" label="Purple" />
                  </FormSelect>
                </FormGroup>
                <FormGroup label="Contrast mode" fieldId="ols-ai-hub-contrast-mode" className="ols-ai-hub-page-control">
                  <FormSelect
                    value={contrastMode}
                    onChange={(_event, value) => setContrastMode(value as UiContrastMode)}
                    aria-label="Select contrast mode"
                    id="ols-ai-hub-contrast-mode"
                  >
                    <FormSelectOption value="default" label="Default" />
                    <FormSelectOption value="high" label="High" />
                  </FormSelect>
                </FormGroup>
              </div>
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
    </div>
  );
};

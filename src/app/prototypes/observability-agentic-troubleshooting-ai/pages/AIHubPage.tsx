import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Content,
  Flex,
  FlexItem,
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
import { useAiHubAppearance } from '../context/AiHubAppearanceContext';
import { AgentTokenCounter, AiExperienceIcon, ClusterInventoryBar, FleetInventoryBar } from './ai-hub-v2';
import { useFocusedClusterId } from './ai-hub-v2/useFocusedClusterId';
import './ai-hub-page.css';

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
  const { isGlassContrast } = useAiHubAppearance();
  const showFleetBreadcrumb = isHubV2 && activePerspective === 'Fleet management' && fleetClusterDrillDown;
  const showFleetInventory = isHubV2 && activePerspective === 'Fleet management' && !fleetClusterDrillDown;
  const showClusterSummary =
    isHubV2 && (activePerspective === 'Core platforms' || (activePerspective === 'Fleet management' && fleetClusterDrillDown));

  const hubSurfaceMain = isGlassContrast ? 'transparent' : '#ffffff';
  const hubSurfaceRoot = isGlassContrast ? 'transparent' : '#f5f5f5';

  const rootStyle: React.CSSProperties = isHubV2
    ? {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        backgroundColor: hubSurfaceRoot,
        boxSizing: 'border-box',
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: hubSurfaceRoot,
      };

  /** Scroll lives here so the title row (PF Flex in create-policy-header) stays put and snaps back at scroll top. */
  const mainStyle: React.CSSProperties = {
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
    backgroundColor: hubSurfaceMain,
  };

  return (
    <div className={`ols-ai-hub-page${isHubV2 ? ' ols-ai-hub-page--v2' : ''}`} style={rootStyle}>
      <div className="create-policy-header">
        <Flex
          className="ols-ai-hub-page-header-inner"
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          alignItems={{ default: 'alignItemsCenter' }}
          gap={{ default: 'gapMd' }}
          flexWrap={{ default: 'nowrap' }}
          style={{ width: '100%' }}
        >
          <FlexItem className="ols-ai-hub-page-header-primary" style={{ minWidth: 0, flex: '1 1 auto' }}>
            <Flex alignItems={{ default: 'alignItemsFlexStart' }} gap={{ default: 'gapSm' }}>
              <FlexItem style={{ flexShrink: 0 }}>
                <AiExperienceIcon size={40} />
              </FlexItem>
              <FlexItem className="ols-ai-hub-page-header-copy" style={{ minWidth: 0 }}>
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
              </FlexItem>
            </Flex>
          </FlexItem>
          {isHubV2 ? (
            <FlexItem className="ols-ai-hub-page-header-aside" style={{ flexShrink: 0 }}>
              <AgentTokenCounter />
            </FlexItem>
          ) : null}
        </Flex>
      </div>

      <div id="ols-ai-hub-main" role="main" aria-label="AI Troubleshooting Hub (Conceptual design) content" style={mainStyle}>
        <div
          data-exp-lab-annotation-root
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

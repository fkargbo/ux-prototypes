import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Content,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { useBannerVersionSelection } from '@app/core/bannerVersionPicker';
import { useActivePerspective } from '@app/shared/contexts/ActivePerspectiveContext';
import { AutonomousAiObserveWidget } from '../components/autonomousAiObserve/AutonomousAiObserveWidget';
import { AutonomousAiObserveWidgetV2 } from '../components/autonomousAiObserve/AutonomousAiObserveWidgetV2';
import { AutonomousAiObserveWidgetV3 } from '../components/autonomousAiObserve/AutonomousAiObserveWidgetV3';
import { getClusterById } from '../components/autonomousAiObserve/data';
import { config as prototypeConfig } from '../prototype.config';
import { useAiHubAppearance } from '../context/AiHubAppearanceContext';
import * as HubV2 from './ai-hub-v2';
import * as HubV3 from './ai-hub-v3';
import { useFocusedClusterId } from './ai-hub-v2/useFocusedClusterId';
import './ai-hub-page.css';

export const AIHubPage: React.FC = () => {
  const bannerVersionKey = useBannerVersionSelection(
    prototypeConfig.id,
    prototypeConfig.bannerVersionPicker?.defaultKey ?? 'v2'
  );
  const { activePerspective } = useActivePerspective();
  const isHubV2 = bannerVersionKey === 'v2';
  const isHubV3 = bannerVersionKey === 'v3';
  const isHubModern = isHubV2 || isHubV3;
  const Hub = isHubV3 ? HubV3 : HubV2;
  const [fleetClusterDrillDown, setFleetClusterDrillDown] = React.useState(false);
  const focusedClusterId = useFocusedClusterId();
  const focusedCluster = React.useMemo(() => getClusterById(focusedClusterId), [focusedClusterId]);
  const { isGlassContrast } = useAiHubAppearance();
  const showFleetBreadcrumb = isHubModern && activePerspective === 'Fleet management' && fleetClusterDrillDown;
  const showFleetInventory = isHubModern && activePerspective === 'Fleet management' && !fleetClusterDrillDown;
  const showClusterSummary =
    isHubModern && (activePerspective === 'Core platforms' || (activePerspective === 'Fleet management' && fleetClusterDrillDown));

  const pageBackground = isGlassContrast ? 'transparent' : '#f5f5f5';
  const mainBackground = isGlassContrast ? 'transparent' : '#ffffff';
  const pageVersionClass = isHubV3 ? ' ols-ai-hub-page--v3' : isHubV2 ? ' ols-ai-hub-page--v2' : '';

  return (
    <div
      className={`ols-ai-hub-page${pageVersionClass}`}
      data-exp-lab-annotation-root
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: pageBackground,
      }}
    >
      <div className="create-policy-header">
        <div className="ols-ai-hub-page-header-inner">
          <div className="ols-ai-hub-page-header-primary">
            <Hub.AiExperienceIcon size={40} />
            <div className="ols-ai-hub-page-header-copy">
              <Title headingLevel="h1" size="2xl">
                AI Hub (Conceptual design)
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
          {isHubModern ? (
            <div className="ols-ai-hub-page-header-aside">
              <Hub.AgentTokenCounter />
            </div>
          ) : null}
        </div>
      </div>

      <div
        id="ols-ai-hub-main"
        className="ols-ai-hub-page__main"
        role="main"
        aria-label="AI Hub (Conceptual design) content"
        style={{ backgroundColor: mainBackground }}
      >
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
                      aria-label="Return to AI Hub fleet overview"
                    >
                      AI Hub
                    </Button>
                  </BreadcrumbItem>
                  <BreadcrumbItem isActive>{focusedCluster?.name ?? 'Cluster'}</BreadcrumbItem>
                </Breadcrumb>
              </StackItem>
            ) : null}
            {showFleetInventory ? (
              <StackItem>
                {isHubV3 ? (
                  <HubV3.DiagnosticsSummaryCard viewType="fleet" />
                ) : (
                  <Hub.FleetInventoryBar />
                )}
              </StackItem>
            ) : null}
            {showClusterSummary ? (
              <StackItem>
                {isHubV3 ? (
                  <HubV3.DiagnosticsSummaryCard viewType="cluster" />
                ) : (
                  <Hub.ClusterInventoryBar title="Cluster summary" />
                )}
              </StackItem>
            ) : null}
            <StackItem>
              {isHubV3 ? (
                <AutonomousAiObserveWidgetV3
                  fleetClusterDrillDown={fleetClusterDrillDown}
                  onFleetDrillDownChange={setFleetClusterDrillDown}
                  showSignalCompressionChart
                />
              ) : isHubV2 ? (
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

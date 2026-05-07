import React from 'react';
import { Breadcrumb, BreadcrumbItem, Button, Content, Stack, StackItem, Title } from '@patternfly/react-core';
import { useBannerVersionSelection } from '@app/core/bannerVersionPicker';
import { useActivePerspective } from '@app/shared/contexts/ActivePerspectiveContext';
import { AutonomousAiObserveWidget } from '../components/autonomousAiObserve/AutonomousAiObserveWidget';
import { AutonomousAiObserveWidgetV2 } from '../components/autonomousAiObserve/AutonomousAiObserveWidgetV2';
import { getClusterById } from '../components/autonomousAiObserve/data';
import { config as prototypeConfig } from '../prototype.config';
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
  const showFleetBreadcrumb = isHubV2 && activePerspective === 'Fleet management' && fleetClusterDrillDown;
  const showFleetInventory = isHubV2 && activePerspective === 'Fleet management' && !fleetClusterDrillDown;
  const showClusterSummary =
    isHubV2 && (activePerspective === 'Core platforms' || (activePerspective === 'Fleet management' && fleetClusterDrillDown));

  const rootStyle: React.CSSProperties = isHubV2
    ? {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
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
        backgroundColor: '#ffffff',
      }
    : {
        flex: 1,
        overflow: 'auto',
        backgroundColor: '#ffffff',
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
    </div>
  );
};

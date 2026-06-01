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
import { useActivePerspective } from '@app/shared/contexts/ActivePerspectiveContext';
import { AutonomousAiObserveWidgetV3 } from '../components/autonomousAiObserve/AutonomousAiObserveWidgetV3';
import { getClusterById } from '../components/autonomousAiObserve/data';
import { useAiHubAppearance } from '../context/AiHubAppearanceContext';
import * as HubV3 from './ai-hub-v3';
import { useFocusedClusterId } from './ai-hub-v2/useFocusedClusterId';
import './ai-hub-page.css';

export const AIInsightsPage: React.FC = () => {
  const { activePerspective } = useActivePerspective();
  const [fleetClusterDrillDown, setFleetClusterDrillDown] = React.useState(false);
  const focusedClusterId = useFocusedClusterId();
  const focusedCluster = React.useMemo(() => getClusterById(focusedClusterId), [focusedClusterId]);
  const { isGlassContrast } = useAiHubAppearance();

  const showFleetBreadcrumb = activePerspective === 'Fleet management' && fleetClusterDrillDown;
  const showFleetInventory = activePerspective === 'Fleet management' && !fleetClusterDrillDown;
  const showClusterSummary =
    activePerspective === 'Core platforms' ||
    (activePerspective === 'Fleet management' && fleetClusterDrillDown);

  const pageBackground = isGlassContrast ? 'transparent' : '#f5f5f5';
  const mainBackground = isGlassContrast ? 'transparent' : '#ffffff';

  return (
    <div
      className="ols-ai-hub-page ols-ai-hub-page--v3"
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
            <HubV3.AiExperienceIcon size={40} />
            <div className="ols-ai-hub-page-header-copy">
              <Title headingLevel="h1" size="2xl">
                AI Insights (Conceptual design)
              </Title>
              <Content
                component="p"
                className="ols-ai-hub-page-subtitle"
                style={{ marginTop: '8px', marginBottom: 0, color: '#6a6e73' }}
              >
                Surface observability signals, AI-detected anomalies, and prioritized remediation recommendations across
                your environment.
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
          <div className="ols-ai-hub-page-header-aside">
            <HubV3.AgentTokenCounter />
          </div>
        </div>
      </div>

      <div
        id="ols-ai-insights-main"
        className="ols-ai-hub-page__main"
        role="main"
        aria-label="AI Insights (Conceptual design) content"
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
                      aria-label="Return to AI Insights fleet overview"
                    >
                      AI Insights
                    </Button>
                  </BreadcrumbItem>
                  <BreadcrumbItem isActive>{focusedCluster?.name ?? 'Cluster'}</BreadcrumbItem>
                </Breadcrumb>
              </StackItem>
            ) : null}
            {showFleetInventory ? (
              <StackItem>
                <HubV3.DiagnosticsSummaryCard viewType="fleet" />
              </StackItem>
            ) : null}
            {showClusterSummary ? (
              <StackItem>
                <HubV3.DiagnosticsSummaryCard viewType="cluster" />
              </StackItem>
            ) : null}
            <StackItem>
              <AutonomousAiObserveWidgetV3
                fleetClusterDrillDown={fleetClusterDrillDown}
                onFleetDrillDownChange={setFleetClusterDrillDown}
              />
            </StackItem>
          </Stack>
        </div>
      </div>
    </div>
  );
};

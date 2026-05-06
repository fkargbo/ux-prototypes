import React from 'react';
import { Content, Flex, FlexItem, Stack, StackItem, Title } from '@patternfly/react-core';
import { useBannerVersionSelection } from '@app/core/bannerVersionPicker';
import { useActivePerspective } from '@app/shared/contexts/ActivePerspectiveContext';
import { AutonomousAiObserveWidget } from '../components/autonomousAiObserve/AutonomousAiObserveWidget';
import { AutonomousAiObserveWidgetV2 } from '../components/autonomousAiObserve/AutonomousAiObserveWidgetV2';
import { config as prototypeConfig } from '../prototype.config';
import { AgentTokenCounter, ClusterInventoryBar, FleetInventoryBar } from './ai-hub-v2';
import './ai-hub-page.css';

export const AIHubPage: React.FC = () => {
  const bannerVersionKey = useBannerVersionSelection(
    prototypeConfig.id,
    prototypeConfig.bannerVersionPicker?.defaultKey ?? 'v2'
  );
  const { activePerspective } = useActivePerspective();
  const isHubV2 = bannerVersionKey === 'v2';
  const showFleetInventory = isHubV2 && activePerspective === 'Fleet management';
  const showClusterInventory = isHubV2 && activePerspective === 'Core platforms';

  return (
    <div
      className="ols-ai-hub-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <div className="create-policy-header">
        <Flex
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          alignItems={{ default: 'alignItemsFlexStart' }}
          gap={{ default: 'gapMd' }}
          flexWrap={{ default: 'wrap' }}
          style={{ width: '100%' }}
        >
          <FlexItem style={{ minWidth: 0, flex: '1 1 auto' }}>
            <Title headingLevel="h1" size="2xl">
              AI Troubleshooting Hub
            </Title>
            <Content component="p" style={{ marginTop: '8px', color: '#6a6e73' }}>
              Coordinate autonomous AI investigations, evidence collection, and guided remediation workflows for
              observability incidents from one hub.
            </Content>
          </FlexItem>
          {isHubV2 ? (
            <FlexItem style={{ flexShrink: 0 }}>
              <AgentTokenCounter />
            </FlexItem>
          ) : null}
        </Flex>
      </div>

      <div
        id="ols-ai-hub-main"
        role="main"
        aria-label="AI Troubleshooting Hub content"
        style={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: '#ffffff',
        }}
      >
        <div
          style={{
            padding: '24px',
            maxWidth: '1200px',
            margin: '0 auto',
            boxSizing: 'border-box',
          }}
        >
          <Stack hasGutter>
            {showFleetInventory ? (
              <StackItem>
                <FleetInventoryBar />
              </StackItem>
            ) : null}
            {showClusterInventory ? (
              <StackItem>
                <ClusterInventoryBar />
              </StackItem>
            ) : null}
            <StackItem>
              {bannerVersionKey === 'v2' ? <AutonomousAiObserveWidgetV2 /> : <AutonomousAiObserveWidget />}
            </StackItem>
          </Stack>
        </div>
      </div>
    </div>
  );
};

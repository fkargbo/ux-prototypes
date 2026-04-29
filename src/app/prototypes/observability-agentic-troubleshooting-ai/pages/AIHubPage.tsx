import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Title, Content, Stack, StackItem, Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import { EnsureGlobalAgenticAiMount } from '../components/ensureAgenticGlobalAiMount';
import { AutonomousAiObserveWidget } from '../components/autonomousAiObserve/AutonomousAiObserveWidget';

export const AIHubPage: React.FC = () => {
  const navigate = useNavigate();

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
      <EnsureGlobalAgenticAiMount />

      <div className="create-policy-breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem
            to="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/core/home/overview');
            }}
          >
            Home
          </BreadcrumbItem>
          <BreadcrumbItem
            to="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/core/observe/overview');
            }}
          >
            Observe
          </BreadcrumbItem>
          <BreadcrumbItem isActive>AI Hub</BreadcrumbItem>
        </Breadcrumb>
      </div>

      <div className="create-policy-header">
        <Title headingLevel="h1" size="2xl">
          AI Hub
        </Title>
        <Content component="p" style={{ marginTop: '8px', color: '#6a6e73' }}>
          Coordinate autonomous AI investigations, evidence collection, and guided remediation workflows for
          observability incidents from one hub.
        </Content>
      </div>

      <div
        id="ols-ai-hub-main"
        role="main"
        aria-label="AI Hub content"
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
            <StackItem>
              <AutonomousAiObserveWidget />
            </StackItem>
          </Stack>
        </div>
      </div>
    </div>
  );
};

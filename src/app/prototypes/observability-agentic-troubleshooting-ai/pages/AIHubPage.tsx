import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Title,
  Content,
  Stack,
  StackItem,
  Breadcrumb,
  BreadcrumbItem,
  Card,
  CardBody,
  CardExpandableContent,
  CardHeader,
  CardTitle,
} from '@patternfly/react-core';
import { EnsureGlobalAgenticAiMount } from '../components/ensureAgenticGlobalAiMount';

type AIHubSectionKey = 'autonomous';

const CARD_IDS: Record<AIHubSectionKey, string> = {
  autonomous: 'ols-ai-hub-card-autonomous',
};

const createExpandedState = (initial: Partial<Record<AIHubSectionKey, boolean>> = {}) =>
  ({
    autonomous: initial.autonomous ?? true,
  }) as Record<AIHubSectionKey, boolean>;

export const AIHubPage: React.FC = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(createExpandedState);

  const toggleSection = useCallback((key: AIHubSectionKey) => {
    return (_event: React.MouseEvent, _cardId: string) => {
      setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
    };
  }, []);

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
          Autonomous agentic troubleshooting hub
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
              <Card id={CARD_IDS.autonomous} isExpanded={expanded.autonomous} isCompact>
                <CardHeader
                  onExpand={toggleSection('autonomous')}
                  toggleButtonProps={{
                    id: `${CARD_IDS.autonomous}-toggle`,
                    'aria-label': 'Toggle Autonomous AI diagnostics',
                  }}
                >
                  <CardTitle component="h2">Autonomous AI diagnostics</CardTitle>
                </CardHeader>
                <CardExpandableContent>
                  <CardBody>
                    <Content component="p" style={{ margin: 0, maxWidth: '960px', color: '#3c3f42' }}>
                      Launch and monitor agentic troubleshooting runs, correlate alerts to evidence automatically, and
                      review remediation drafts before applying changes to the cluster.
                    </Content>
                  </CardBody>
                </CardExpandableContent>
              </Card>
            </StackItem>
          </Stack>
        </div>
      </div>
    </div>
  );
};

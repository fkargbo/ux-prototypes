import React from 'react';
import {
  Title,
  Content,
  Card,
  CardBody,
  Stack,
  StackItem,
} from '@patternfly/react-core';

export const OverviewPage: React.FC = () => {
  return (
    <div
      style={{
        height: '100vh',
        padding: '24px',
        boxSizing: 'border-box',
        backgroundColor: 'var(--pf-v5-global--BackgroundColor--100)',
        overflow: 'auto',
      }}
    >
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h1" size="2xl">
            Agentic troubleshooting (AI)
          </Title>
          <Content component="p" style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}>
            Use this prototype to explore conversational and multi-step agent flows that help operators
            narrow down observability issues across metrics, logs, and traces.
          </Content>
        </StackItem>
        <StackItem>
          <Card>
            <CardBody>
              <Title headingLevel="h2" size="lg">
                Next steps
              </Title>
              <Content component="p">
                Add screens for incident context, evidence panels, and agent run transcripts under this
                prototype directory only.
              </Content>
            </CardBody>
          </Card>
        </StackItem>
      </Stack>
    </div>
  );
};

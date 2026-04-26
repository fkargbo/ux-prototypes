import React from 'react';
import {
  Title,
  Content,
  Card,
  CardBody,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { EnsureGlobalAgenticAiMount } from '../components/ensureAgenticGlobalAiMount';

export const ObserveOverviewPage: React.FC = () => {
  return (
    <>
    <EnsureGlobalAgenticAiMount />
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
            Observability overview
          </Title>
          <Content component="p" style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}>
            Investigate AI-driven root cause analysis, monitor your installed observability components, and
            explore recommended operators to expand your metrics.
          </Content>
        </StackItem>
        <StackItem>
          <Card>
            <CardBody>
              <Title headingLevel="h2" size="lg">
                Placeholder
              </Title>
              <Content component="p">
                Replace this card with the Summit demo flow when you are ready.
              </Content>
            </CardBody>
          </Card>
        </StackItem>
      </Stack>
    </div>
    </>
  );
};

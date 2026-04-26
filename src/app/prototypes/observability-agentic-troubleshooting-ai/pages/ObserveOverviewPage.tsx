import React from 'react';
import {
  Title,
  Content,
  Card,
  CardBody,
  Stack,
  StackItem,
  PageSection,
} from '@patternfly/react-core';
import { EnsureGlobalAgenticAiMount } from '../components/ensureAgenticGlobalAiMount';

export const ObserveOverviewPage: React.FC = () => {
  return (
    <>
      <EnsureGlobalAgenticAiMount />
      <PageSection
        component="main"
        aria-label="Observability overview"
        padding={{ default: 'padding' }}
        isWidthLimited
        isCenterAligned
      >
        <Stack hasGutter>
          <StackItem>
            <Title headingLevel="h1" size="2xl">
              Observability overview
            </Title>
            <Content component="p" className="pf-v6-u-mt-sm pf-v6-u-color-200">
              Investigate AI-driven root cause analysis, monitor your installed observability components, and explore
              recommended operators to expand your metrics.
            </Content>
          </StackItem>
          <StackItem>
            <Card>
              <CardBody>
                <Title headingLevel="h2" size="lg">
                  Placeholder
                </Title>
                <Content component="p" className="pf-v6-u-mt-sm">
                  Replace this card with the Summit demo flow when you are ready.
                </Content>
              </CardBody>
            </Card>
          </StackItem>
        </Stack>
      </PageSection>
    </>
  );
};

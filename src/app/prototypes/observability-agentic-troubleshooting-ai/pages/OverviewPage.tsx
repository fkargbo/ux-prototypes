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

export const OverviewPage: React.FC = () => {
  return (
    <>
      <EnsureGlobalAgenticAiMount />
      <PageSection
        component="main"
        aria-label="Home overview"
        padding={{ default: 'padding' }}
        isWidthLimited
        isCenterAligned
      >
        <Stack hasGutter>
          <StackItem>
            <Title headingLevel="h1" size="2xl">
              Agentic troubleshooting (AI)
            </Title>
            <Content component="p" className="pf-v6-u-mt-sm pf-v6-u-color-200">
              Use this prototype to explore conversational and multi-step agent flows that help operators narrow down
              observability issues across metrics, logs, and traces.
            </Content>
          </StackItem>
          <StackItem>
            <Card>
              <CardBody>
                <Title headingLevel="h2" size="lg">
                  Next steps
                </Title>
                <Content component="p" className="pf-v6-u-mt-sm">
                  Add screens for incident context, evidence panels, and agent run transcripts under this prototype
                  directory only.
                </Content>
              </CardBody>
            </Card>
          </StackItem>
        </Stack>
      </PageSection>
    </>
  );
};

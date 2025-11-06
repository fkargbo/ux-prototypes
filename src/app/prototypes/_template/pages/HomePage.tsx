/**
 * Home Page Component
 * 
 * Example page component for your prototype
 */

import React from 'react';
import {
  Page,
  PageSection,
  Title,
  Content,
  Card,
  CardBody,
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateActions,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';
import { usePrototypeConfig } from '@app/core/PrototypeContext';

export const HomePage: React.FC = () => {
  const config = usePrototypeConfig();

  return (
    <>
        <PageSection>
        <Title headingLevel="h1" size="2xl">
          Welcome to {config?.name}
        </Title>
        <Content component="p" style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
          {config?.description}
        </Content>
      </PageSection>

      <PageSection>
        <Card>
          <CardBody>
            <EmptyState>
              <Title headingLevel="h2" size="lg">
                Get Started
              </Title>
              <EmptyStateBody>
                This is a template page. Replace this content with your prototype's UI.
                <br /><br />
                <strong>Tips:</strong>
                <ul style={{ textAlign: 'left', display: 'inline-block', marginTop: '1rem' }}>
                  <li>Import shared components from <code>@app/shared</code></li>
                  <li>Use PatternFly components for consistency</li>
                  <li>Follow the documentation in <code>ai-documentation/</code></li>
                  <li>Create reusable components in <code>components/</code></li>
                </ul>
              </EmptyStateBody>
              <EmptyStateFooter>
                <EmptyStateActions>
                  <Button variant="primary">
                    Primary Action
                  </Button>
                </EmptyStateActions>
                <EmptyStateActions>
                  <Button variant="link">
                    Learn More
                  </Button>
                </EmptyStateActions>
              </EmptyStateFooter>
            </EmptyState>
          </CardBody>
        </Card>
      </PageSection>
    </>
  );
};


import React, { useState } from 'react';
import {
  Alert,
  AlertActionCloseButton,
  Content,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { CAPABILITY_CARDS, STACK_SUMMARY_STATS } from '../data';
import { StackSummaryRibbon } from '../components/StackSummaryRibbon';
import { CapabilityLayout } from '../components/CapabilityLayout';
import { ProjectSwitcher } from '../components/ProjectSwitcher';
import '../observability-services.css';

/**
 * Observe → Observability services
 * Post–Cluster Observability Operator installation hub.
 * Surfaces capability readiness — not live telemetry health.
 */
export const ObservabilityServicesPage: React.FC = () => {
  const [isScopeAlertVisible, setIsScopeAlertVisible] = useState(true);

  return (
    <div className="ols-obs-services-page">
      <div className="template-page-breadcrumb">
        <ProjectSwitcher />
      </div>

      <div className="template-page-heading">
        <Title headingLevel="h1" size="2xl">
          Observability services
        </Title>
        <Content component="p">
          Manage and monitor your metrics, logs, and traces from a single, unified hub.
        </Content>
        {isScopeAlertVisible ? (
          <Alert
            className="ols-obs-services-alert"
            variant="info"
            isInline
            title="Cluster-wide observability scope"
            actionClose={
              <AlertActionCloseButton
                title="Close scope information"
                onClose={() => setIsScopeAlertVisible(false)}
              />
            }
          >
            This hub reflects observability capabilities for the current cluster after Cluster
            Observability Operator installation. Status labels indicate enablement and configuration
            readiness—not live telemetry severity.
          </Alert>
        ) : null}
      </div>

      <div
        className="template-page-content"
        role="main"
        aria-label="Observability services content"
      >
        <Stack hasGutter>
          <StackItem>
            <StackSummaryRibbon stats={STACK_SUMMARY_STATS} />
          </StackItem>

          <StackItem>
            <CapabilityLayout capabilities={CAPABILITY_CARDS} />
          </StackItem>
        </Stack>
      </div>
    </div>
  );
};

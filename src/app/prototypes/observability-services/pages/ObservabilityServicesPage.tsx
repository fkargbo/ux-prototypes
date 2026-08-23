import React, { useState } from 'react';
import {
  Alert,
  AlertActionCloseButton,
  Content,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { CAPABILITY_CARDS, OPERATIONAL_KPI_STATS } from '../data';
import { OperationalKPIRibbon } from '../components/OperationalKPIRibbon';
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
          Manage observability capabilities and access cluster tools for metrics, logs, and traces.
        </Content>
        {isScopeAlertVisible ? (
          <Alert
            className="ols-obs-services-alert"
            variant="info"
            isInline
            title="Cluster-wide scope"
            actionClose={
              <AlertActionCloseButton
                title="Close scope information"
                onClose={() => setIsScopeAlertVisible(false)}
              />
            }
          >
            Status labels show configuration readiness across the cluster, not live telemetry severity.
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
            <OperationalKPIRibbon stats={OPERATIONAL_KPI_STATS} />
          </StackItem>

          <StackItem>
            <CapabilityLayout capabilities={CAPABILITY_CARDS} />
          </StackItem>
        </Stack>
      </div>
    </div>
  );
};

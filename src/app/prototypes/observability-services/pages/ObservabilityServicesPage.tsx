import React, { useState } from 'react';
import {
  Alert,
  AlertActionCloseButton,
  Content,
  Flex,
  FlexItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { CAPABILITY_CARDS, OPERATIONAL_KPI_STATS } from '../data';
import { CAPABILITY_CARDS_V1, OPERATIONAL_KPI_STATS_V1 } from '../data.v1';
import { OperationalKPIRibbon } from '../components/OperationalKPIRibbon';
import { CapabilityLayout } from '../components/CapabilityLayout';
import { ProjectSwitcher } from '../components/ProjectSwitcher';
import { VersionSelector, usePrototypeVersion } from '../components/VersionSelector';
import '../observability-services.css';

/**
 * Observe → Observability services
 * Post–Cluster Observability Operator installation hub.
 *
 * Versioning via URL search param:
 *   ?version=v1  →  v1.0.0 legacy baseline (frozen)
 *   (no param)   →  v2.0.0 current iteration (default)
 */
export const ObservabilityServicesPage: React.FC = () => {
  const [isScopeAlertVisible, setIsScopeAlertVisible] = useState(true);
  const version = usePrototypeVersion();

  const isV1 = version === 'v1';
  const kpiStats = isV1 ? OPERATIONAL_KPI_STATS_V1 : OPERATIONAL_KPI_STATS;
  const capabilityCards = isV1 ? CAPABILITY_CARDS_V1 : CAPABILITY_CARDS;

  return (
    <div className="ols-obs-services-page">
      <div className="template-page-breadcrumb">
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          flexWrap={{ default: 'nowrap' }}
        >
          <FlexItem>
            <ProjectSwitcher />
          </FlexItem>
          <FlexItem>
            <VersionSelector />
          </FlexItem>
        </Flex>
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
            <OperationalKPIRibbon stats={kpiStats} />
          </StackItem>

          <StackItem>
            <CapabilityLayout
              capabilities={capabilityCards}
              collapsible={!isV1}
            />
          </StackItem>
        </Stack>
      </div>
    </div>
  );
};

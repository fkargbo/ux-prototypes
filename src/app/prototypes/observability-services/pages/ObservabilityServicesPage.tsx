import React, { useState } from 'react';
import {
  Alert,
  AlertActionCloseButton,
  Content,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { CAPABILITY_CARDS_V2, OPERATIONAL_KPI_STATS } from '../data';
import { CAPABILITY_CARDS_V1, OPERATIONAL_KPI_STATS_V1 } from '../data.v1';
import { OperationalKPIRibbon } from '../components/OperationalKPIRibbon';
import { CapabilityLayout } from '../components/CapabilityLayout';
import { CapabilityLayoutDayZero } from '../components/CapabilityLayoutDayZero';
import { ProjectSwitcher } from '../components/ProjectSwitcher';
import { VersionSelector, usePrototypeVersion } from '../components/VersionSelector';
import { useInjectBannerActions } from '@app/core/BannerActionsContext';
import '../observability-services.css';

/**
 * Observe → Observability services
 * Post–Cluster Observability Operator installation hub.
 *
 * Versioning via URL search param (controls surfaced in the prototype banner):
 *   ?version=v1  →  v1.0.0 legacy baseline (frozen)
 *   (no param)   →  v2.0.0 current iteration (default)
 */
export const ObservabilityServicesPage: React.FC = () => {
  const [isScopeAlertVisible, setIsScopeAlertVisible] = useState(true);
  const version = usePrototypeVersion();

  // Inject the VersionSelector into the prototype banner bar (next to Share).
  // Clears automatically on unmount — no cleanup needed here.
  useInjectBannerActions(<VersionSelector />);

  const isV1 = version === 'v1';
  const kpiStats = isV1 ? OPERATIONAL_KPI_STATS_V1 : OPERATIONAL_KPI_STATS;

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
            <OperationalKPIRibbon stats={kpiStats} />
          </StackItem>

          <StackItem>
            {isV1 ? (
              <CapabilityLayout capabilities={CAPABILITY_CARDS_V1} collapsible={false} />
            ) : (
              <CapabilityLayoutDayZero cards={CAPABILITY_CARDS_V2} />
            )}
          </StackItem>
        </Stack>
      </div>
    </div>
  );
};

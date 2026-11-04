import React, { useCallback, useState } from 'react';
import {
  Alert,
  AlertActionCloseButton,
  Content,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import {
  CAPABILITY_CARDS_V2_DAY0,
  CAPABILITY_CARDS_V2_DAY1,
  OPERATIONAL_KPI_STATS,
  OPERATIONAL_KPI_STATS_V2_DAY0,
} from '../data';
import { CAPABILITY_CARDS_V1, OPERATIONAL_KPI_STATS_V1 } from '../data.v1';
import { OperationalKPIRibbon } from '../components/OperationalKPIRibbon';
import { CapabilityLayout } from '../components/CapabilityLayout';
import { ProjectSwitcher } from '../components/ProjectSwitcher';
import { VersionSelector, usePrototypeVersion } from '../components/VersionSelector';
import {
  SimulationStepBanner,
  type SimulationStep,
} from '../components/SimulationStepBanner';
import { useInjectBannerActions } from '@app/core/BannerActionsContext';
import '../observability-services.css';

/**
 * Observe → Observability services
 * Post–Cluster Observability Operator installation hub.
 *
 * Versioning via URL search param (controls surfaced in the prototype banner):
 *   ?version=v1  →  v1.0.0 legacy baseline (frozen)
 *   (no param)   →  v2.0.0 Day 0 / Day 1 simulation (default)
 *
 * v2 simulation:
 *   Day 0 — COO installed, MonitoringStack CR not configured.
 *   Day 1 — MonitoringStack configured; Metrics & Alerting becomes active.
 *   Transition triggered by the SimulationStepBanner button OR by clicking
 *   the "Configure" dep-action on the MonitoringStack CR dep row.
 */
export const ObservabilityServicesPage: React.FC = () => {
  const [isScopeAlertVisible, setIsScopeAlertVisible] = useState(true);
  const [simulationStep, setSimulationStep] = useState<SimulationStep>('day0');

  const version = usePrototypeVersion();
  useInjectBannerActions(<VersionSelector />);

  const isV1 = version === 'v1';
  const kpiStats = isV1
    ? OPERATIONAL_KPI_STATS_V1
    : simulationStep === 'day0'
      ? OPERATIONAL_KPI_STATS_V2_DAY0
      : OPERATIONAL_KPI_STATS;

  const v2Cards =
    simulationStep === 'day0' ? CAPABILITY_CARDS_V2_DAY0 : CAPABILITY_CARDS_V2_DAY1;

  // Called by CapabilityCard when an inline dep-action button is clicked.
  // Clicking "Install COO" (dep id 'coo-operator') on any card advances Day 0 → Day 1.
  const handleDepAction = useCallback(
    (depId: string) => {
      if (depId === 'coo-operator' && simulationStep === 'day0') {
        setSimulationStep('day1');
      }
    },
    [simulationStep],
  );

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
              <CapabilityLayout
                capabilities={v2Cards}
                collapsible={false}
                onDepAction={handleDepAction}
              />
            )}
          </StackItem>
        </Stack>
      </div>

      {/* Floating prototype control — fixed bottom-left, outside the page design */}
      {!isV1 ? (
        <SimulationStepBanner
          step={simulationStep}
          onAdvance={() => setSimulationStep('day1')}
          onReset={() => setSimulationStep('day0')}
        />
      ) : null}
    </div>
  );
};

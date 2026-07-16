/**
 * MVP-prototype-specific wrapper around the shared Multi-cluster Alerting dashboard.
 * Adds the B4 AI-driven investigation banner when at least one alert row is
 * actively being investigated by the autonomous agent.
 *
 * ⚠️  All changes in this file are ISOLATED to the AI Hub – Autonomous agentic
 *     plans (MVP) prototype.  Do NOT modify the shared MultiClusterAlertingDashboard.
 */
import React, { useMemo } from 'react';
import { Alert, Flex, Label, Content } from '@patternfly/react-core';
import { MultiClusterAlertingDashboard } from '@app/prototypes/observability-agentic-troubleshooting-ai/pages/alerting-fleet-copy/pages/MultiClusterAlertsPage';
import { ALERTS } from '../../components/autonomousAiObserve/data';

const hasActiveAiInvestigation = ALERTS.some((a) => a.agentStatus === 'investigating');

export const SummitFleetAlertingPage: React.FC = () => {
  return (
    <>
      {hasActiveAiInvestigation && (
        <div style={{ padding: 'var(--pf-t--global--spacer--md) var(--pf-t--global--spacer--md) 0' }}>
          <Alert
            isInline
            variant="info"
            title="AI-driven investigation in progress"
          >
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              gap={{ default: 'gapSm' }}
              flexWrap={{ default: 'wrap' }}
              style={{ marginTop: 'var(--pf-t--global--spacer--xs)' }}
            >
              <Label color="grey" isCompact>AI-generated</Label>
              <Content component="p" style={{ margin: 0 }}>
                We are currently conducting an AI-driven investigation on one or more
                active alerts. Autonomous evidence collection and root cause analysis
                are running — review AI findings before taking manual action.
              </Content>
            </Flex>
          </Alert>
        </div>
      )}
      <MultiClusterAlertingDashboard />
    </>
  );
};

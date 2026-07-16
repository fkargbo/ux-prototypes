/**
 * MVP-prototype-specific wrapper around the shared Multi-cluster Alerting dashboard.
 * Adds the B4 AI-driven investigation banner when at least one alert row is
 * actively being investigated by the autonomous agent.
 *
 * Placement: The banner is injected directly below the main "Alerts / Incidents /
 * Management" tab bar using a React portal + DOM insertion, per the PatternFly
 * inline-alert placement guideline: "If the alert is relevant to the tab content,
 * place it below the tabs."
 *
 * ⚠️  All changes in this file are ISOLATED to the AI Hub – Autonomous agentic
 *     plans (MVP) prototype.  Do NOT modify the shared MultiClusterAlertingDashboard.
 */
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Alert } from '@patternfly/react-core';
import { MultiClusterAlertingDashboard } from '@app/prototypes/observability-agentic-troubleshooting-ai/pages/alerting-fleet-copy/pages/MultiClusterAlertsPage';
import { ALERTS } from '../../components/autonomousAiObserve/data';

const hasActiveAiInvestigation = ALERTS.some((a) => a.agentStatus === 'investigating');

const B4InvestigationBanner: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [, forceRender] = React.useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    // Locate the main alerting tabs bar rendered inside MultiClusterAlertingDashboard
    // and insert our mount-point div immediately after it, so the banner sits
    // directly below the tab strip per PF inline-alert placement guidelines.
    const tryMount = () => {
      const tabsEl = document.querySelector<HTMLElement>('[aria-label="Main alerting tabs"]');
      if (!tabsEl) return false;

      const mountDiv = document.createElement('div');
      mountDiv.setAttribute('data-mvp-b4-banner', 'true');
      mountDiv.style.padding = `var(--pf-t--global--spacer--md) var(--pf-t--global--spacer--md) 0`;
      tabsEl.insertAdjacentElement('afterend', mountDiv);
      mountRef.current = mountDiv;
      forceRender();
      return true;
    };

    // The shared component may not have rendered yet; retry until it does.
    if (!tryMount()) {
      const id = setInterval(() => {
        if (tryMount()) clearInterval(id);
      }, 50);
      return () => {
        clearInterval(id);
        mountRef.current?.remove();
      };
    }

    return () => {
      mountRef.current?.remove();
    };
  }, []);

  if (!mountRef.current) return null;

  return createPortal(
    <Alert
      isInline
      variant="info"
      title="AI-driven investigation in progress"
    >
      We are currently conducting an AI-driven investigation on one or more
      active alerts. Autonomous evidence collection and root cause analysis
      are running — review AI findings before taking manual action.
    </Alert>,
    mountRef.current
  );
};

export const SummitFleetAlertingPage: React.FC = () => (
  <>
    <MultiClusterAlertingDashboard />
    {hasActiveAiInvestigation && <B4InvestigationBanner />}
  </>
);

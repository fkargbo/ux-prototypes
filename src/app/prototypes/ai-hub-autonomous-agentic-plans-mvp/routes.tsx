import React from 'react';
import { Navigate } from 'react-router-dom';
import { RouteConfig } from '@app/core/types';
import { AIHubPage } from './pages/AIHubPage';
import { AuditAndLogsPage } from './pages/AuditAndLogsPage';
import { PlanRemediationPage } from './pages/PlanRemediationPage';
import { AiHubPrototypeRoot } from './components/AiHubPrototypeRoot';
import { AiHubBannerAppearanceSettings } from './components/AiHubBannerAppearanceSettings';
import { withPerspectiveUrlSync } from './components/AiHubPerspectiveRouteShell';
import { SummitFleetAlertingPage } from './pages/alerting-fleet-copy/SummitFleetAlertingPage';
import { TroubleshootingPlansPage } from './pages/TroubleshootingPlansPage';
import { TroubleshootingPlanDetail } from './pages/TroubleshootingPlanDetail';
import { AcsPlanDetailPage } from './pages/AcsPlanDetailPage';

import { DEFAULT_PROTOTYPE_PERSPECTIVE } from './prototypePerspectiveUrl';

export const routes: RouteConfig[] = [
  {
    path: '/',
    element: <Navigate to={`/core/observe/ai-hub/plans?perspective=${DEFAULT_PROTOTYPE_PERSPECTIVE}`} replace />,
    title: 'AI Hub',
  },
  {
    path: '/core/observe/ai-hub',
    element: <Navigate to={`/core/observe/ai-hub/plans?perspective=${DEFAULT_PROTOTYPE_PERSPECTIVE}`} replace />,
    title: 'AI Hub',
  },
  {
    path: '/core/observe/ai-hub/plans',
    element: withPerspectiveUrlSync(<AIHubPage />),
    label: 'Plans',
    title: 'Plans',
    navigation: {
      group: 'Agentic plans',
      order: 1,
      insertAfterGroup: 'Home',
    },
  },
  {
    path: '/core/observe/ai-hub/audit-logs',
    element: withPerspectiveUrlSync(<AuditAndLogsPage />),
    label: 'Audit & logs',
    title: 'Audit & logs',
    navigation: {
      group: 'Agentic plans',
      order: 2,
      insertAfterGroup: 'Home',
    },
  },
  {
    path: '/core/observe/ai-hub/plans/:planSlug/remediation',
    element: withPerspectiveUrlSync(<PlanRemediationPage />),
    title: 'Plan remediation',
  },
  {
    path: '/core/observe/ai-hub/acs-plans/:planSlug',
    element: withPerspectiveUrlSync(<AcsPlanDetailPage />),
    title: 'ACS plan detail',
  },
  {
    path: '/core/observe/alerting',
    element: <SummitFleetAlertingPage />,
    label: 'Alerting',
    title: 'Alerting',
    navigation: {
      group: 'Observe',
      order: 0,
    },
  },
  {
    path: '/core/observe/troubleshooting-plans',
    element: withPerspectiveUrlSync(<TroubleshootingPlansPage />),
    label: 'Troubleshooting plans',
    title: 'Troubleshooting plans',
    navigation: {
      group: 'Observe',
      order: 1,
    },
  },
  {
    path: '/core/observe/troubleshooting-plans/:planId',
    element: withPerspectiveUrlSync(<TroubleshootingPlanDetail />),
    title: 'Troubleshooting plan detail',
  },
  {
    path: '/core/observe/alerting/:clusterId/components',
    element: <SummitFleetAlertingPage />,
    title: 'Alerting',
  },
  {
    path: '/core/observe/alerting/:clusterId/:componentId',
    element: <SummitFleetAlertingPage />,
    title: 'Alerting',
  },
  {
    path: '/core/observe/alerting-v2/create-alert-rule',
    element: <SummitFleetAlertingPage />,
    title: 'Create Alert Rule',
  },
  {
    path: '/core/observe/alerting-v2/create-silence',
    element: <SummitFleetAlertingPage />,
    title: 'Create Silence',
  },
];

/** Theme state for AI Hub banner appearance controls. */
export const prototypeRootWrapper = AiHubPrototypeRoot;

/** Banner toolbar: appearance menu (see `PrototypeLayout`). */
export const bannerBeforeVersionPicker = <AiHubBannerAppearanceSettings />;

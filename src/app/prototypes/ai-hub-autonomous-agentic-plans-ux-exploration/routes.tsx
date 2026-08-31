import React from 'react';
import { Navigate } from 'react-router-dom';
import { RouteConfig } from '@app/core/types';
import { AiHubPrototypeRoot } from './components/AiHubPrototypeRoot';
import { AiHubBannerAppearanceSettings } from './components/AiHubBannerAppearanceSettings';
import { withPerspectiveUrlSync } from './components/AiHubPerspectiveRouteShell';
import { SummitFleetAlertingPage } from './pages/alerting-fleet-copy/SummitFleetAlertingPage';
import { BridgeRedirect } from './pages/BridgeRedirect';

// ── UX Exploration workspace page wrappers ────────────────────────────────────
// All routes use the /ux-exp/ prefix to stay completely isolated from the MVP
// prototype at /v2/ai-hub/... — never change this prefix back to /v2/.
import { AIHubPageV2 } from './pages/v2/AIHubPageV2';
import { PlanRemediationPageV2 } from './pages/v2/PlanRemediationPageV2';
import { AcsPlanDetailPageV2 } from './pages/v2/AcsPlanDetailPageV2';
import { TroubleshootingPlanDetailV2 } from './pages/v2/TroubleshootingPlanDetailV2';
import { ClusterUpdatePageV2 } from './pages/v2/ClusterUpdatePageV2';
import { AdminPlaceholderPage } from './pages/v2/AdminPlaceholderPage';
import { AgenticRunConfigPage } from './pages/v2/AgenticRunConfigPage';

import { DEFAULT_PROTOTYPE_PERSPECTIVE } from './prototypePerspectiveUrl';

export const routes: RouteConfig[] = [
  {
    path: '/',
    element: <Navigate to={`/ux-exp/ai-hub/observe/plans?perspective=${DEFAULT_PROTOTYPE_PERSPECTIVE}`} replace />,
    title: 'AI Hub (UX Exploration)',
  },

  // ── Sidebar entry points — redirect to the ux-exp workspace ──────────────────
  // The "Core platforms" perspective filter (AppLayout.tsx) only surfaces nav
  // items whose path starts with `/core`, so the sidebar entry MUST live here.
  {
    path: '/core/observe/ai-hub-ux',
    element: <Navigate to={`/ux-exp/ai-hub/observe/plans?perspective=${DEFAULT_PROTOTYPE_PERSPECTIVE}`} replace />,
    title: 'AI Hub (UX Exploration)',
  },
  {
    path: '/core/observe/ai-hub-ux/plans',
    element: <BridgeRedirect to="/ux-exp/ai-hub/observe/plans" />,
    label: 'Agentic runs (UX Exp.)',
    title: 'Agentic runs (UX Exploration)',
    navigation: {
      group: 'Agentic Runs',
      order: 2,
      insertAfterGroup: 'Compute',
      activeMatchPaths: [
        '/ux-exp/ai-hub/observe/plans',
        '/ux-exp/ai-hub/agentic-runs/runs',
        '/ux-exp/ai-hub/observe/acs-plans',
        '/core/observe/ai-hub-ux/acs-plans',
      ],
    },
  },
  {
    path: '/core/observe/ai-hub-ux/plans/:planSlug/remediation',
    element: <BridgeRedirect to="/ux-exp/ai-hub/observe/plans/:planSlug/remediation" />,
    title: 'Plan remediation',
  },
  {
    path: '/core/observe/ai-hub-ux/acs-plans/:planSlug',
    element: <BridgeRedirect to="/ux-exp/ai-hub/observe/acs-plans/:planSlug" />,
    title: 'ACS plan detail',
  },

  // ── Administration (domain UI) ─────────────────────────────────────────────
  {
    path: '/core/administration/settings',
    element: <AdminPlaceholderPage title="Cluster Settings" />,
    label: 'Cluster Settings',
    title: 'Cluster Settings',
    navigation: { group: 'Administration', order: 1 },
  },
  {
    path: '/core/administration/namespaces',
    element: <AdminPlaceholderPage title="Namespaces" />,
    label: 'Namespaces',
    title: 'Namespaces',
    navigation: { group: 'Administration', order: 2 },
  },
  {
    path: '/core/administration/resource-quotas',
    element: <AdminPlaceholderPage title="ResourceQuotas" />,
    label: 'ResourceQuotas',
    title: 'ResourceQuotas',
    navigation: { group: 'Administration', order: 3 },
  },
  {
    path: '/core/administration/limit-ranges',
    element: <AdminPlaceholderPage title="LimitRanges" />,
    label: 'LimitRanges',
    title: 'LimitRanges',
    navigation: { group: 'Administration', order: 4 },
  },
  {
    path: '/core/administration/crds',
    element: <AdminPlaceholderPage title="CustomResourceDefinitions" />,
    label: 'CustomResourceDefinitions',
    title: 'CustomResourceDefinitions',
    navigation: { group: 'Administration', order: 5 },
  },
  {
    path: '/core/administration/dynamic-plugins',
    element: <AdminPlaceholderPage title="Dynamic Plugins" />,
    label: 'Dynamic Plugins',
    title: 'Dynamic Plugins',
    navigation: { group: 'Administration', order: 6 },
  },
  {
    path: '/core/administration/cluster-update',
    element: <ClusterUpdatePageV2 />,
    label: 'Cluster Update',
    title: 'Cluster Update',
    navigation: { group: 'Administration', order: 7 },
  },

  // ── Alerting ───────────────────────────────────────────────────────────────
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

  // ── UX Exploration workspace — /ux-exp/ai-hub/observe/* ──────────────────────
  {
    path: '/ux-exp/ai-hub',
    element: <Navigate to={`/ux-exp/ai-hub/observe/plans?perspective=${DEFAULT_PROTOTYPE_PERSPECTIVE}`} replace />,
    title: 'AI Hub (UX Exploration)',
  },
  {
    path: '/ux-exp/ai-hub/observe/plans',
    element: withPerspectiveUrlSync(<AIHubPageV2 />),
    title: 'Agentic runs',
  },
  {
    path: '/ux-exp/ai-hub/observe/plans/config',
    element: withPerspectiveUrlSync(<AgenticRunConfigPage />),
    title: 'Agentic runs configuration',
  },
  {
    path: '/ux-exp/ai-hub/observe/plans/:planSlug/remediation',
    element: withPerspectiveUrlSync(<PlanRemediationPageV2 />),
    title: 'Plan remediation',
  },
  {
    path: '/ux-exp/ai-hub/observe/acs-plans/:planSlug',
    element: withPerspectiveUrlSync(<AcsPlanDetailPageV2 />),
    title: 'ACS plan detail',
  },
  {
    path: '/ux-exp/ai-hub/agentic-runs/runs/:planId',
    element: withPerspectiveUrlSync(<TroubleshootingPlanDetailV2 />),
    title: 'Agentic run details',
  },
];

/** Theme state for AI Hub banner appearance controls. */
export const prototypeRootWrapper = AiHubPrototypeRoot;

/** Banner toolbar: appearance menu (see `PrototypeLayout`). */
export const bannerBeforeVersionPicker = <AiHubBannerAppearanceSettings />;

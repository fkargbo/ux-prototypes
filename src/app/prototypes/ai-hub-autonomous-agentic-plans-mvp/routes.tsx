import React from 'react';
import { Navigate } from 'react-router-dom';
import { RouteConfig } from '@app/core/types';
import { AiHubPrototypeRoot } from './components/AiHubPrototypeRoot';
import { AiHubBannerAppearanceSettings } from './components/AiHubBannerAppearanceSettings';
import { withPerspectiveUrlSync } from './components/AiHubPerspectiveRouteShell';
import { SummitFleetAlertingPage } from './pages/alerting-fleet-copy/SummitFleetAlertingPage';
import { BridgeRedirect } from './pages/BridgeRedirect';

// ── V2 workspace page wrappers (the sole supported Agentic runs experience) ──
import { AIHubPageV2 } from './pages/v2/AIHubPageV2';
import { PlanRemediationPageV2 } from './pages/v2/PlanRemediationPageV2';
import { AcsPlanDetailPageV2 } from './pages/v2/AcsPlanDetailPageV2';
import { TroubleshootingPlanDetailV2 } from './pages/v2/TroubleshootingPlanDetailV2';
import { ClusterUpdatePageV2 } from './pages/v2/ClusterUpdatePageV2';
import { AdminPlaceholderPage } from './pages/v2/AdminPlaceholderPage';

import { DEFAULT_PROTOTYPE_PERSPECTIVE } from './prototypePerspectiveUrl';

export const routes: RouteConfig[] = [
  {
    path: '/',
    element: <Navigate to={`/v2/ai-hub/observe/plans?perspective=${DEFAULT_PROTOTYPE_PERSPECTIVE}`} replace />,
    title: 'AI Hub',
  },

  // ── Sidebar entry points — redirect to the v2 workspace ────────────────────
  // The "Core platforms" perspective filter (AppLayout.tsx) only surfaces nav
  // items whose path starts with `/core`, so the sidebar entry MUST live here
  // (not on the /v2/... routes) even though the real page content renders at
  // /v2/ai-hub/observe/*. Do not move `navigation`/`label` off these routes.
  {
    path: '/core/observe/ai-hub',
    element: <Navigate to={`/v2/ai-hub/observe/plans?perspective=${DEFAULT_PROTOTYPE_PERSPECTIVE}`} replace />,
    title: 'AI Hub',
  },
  {
    path: '/core/observe/ai-hub/plans',
    element: <BridgeRedirect to="/v2/ai-hub/observe/plans" />,
    label: 'Agentic runs',
    title: 'Agentic runs',
    navigation: {
      group: 'Agentic Runs',
      order: 1,
      insertAfterGroup: 'Compute',
      // Keep "Agentic runs" active when drilling into a run detail (Option A path).
      activeMatchPaths: [
        '/v2/ai-hub/observe/plans',
        '/v2/ai-hub/agentic-runs/runs',
        '/v2/ai-hub/observe/acs-plans',
        '/core/observe/ai-hub/acs-plans',
      ],
    },
  },
  {
    path: '/core/observe/ai-hub/plans/:planSlug/remediation',
    element: <BridgeRedirect to="/v2/ai-hub/observe/plans/:planSlug/remediation" />,
    title: 'Plan remediation',
  },
  {
    path: '/core/observe/ai-hub/acs-plans/:planSlug',
    element: <BridgeRedirect to="/v2/ai-hub/observe/acs-plans/:planSlug" />,
    title: 'ACS plan detail',
  },
  {
    path: '/core/observe/troubleshooting-plans',
    element: <BridgeRedirect to="/v2/ai-hub/observe/plans" />,
    title: 'Agentic runs',
  },
  {
    path: '/core/observe/troubleshooting-plans/:planId',
    element: <BridgeRedirect to="/v2/ai-hub/agentic-runs/runs/:planId" />,
    title: 'Agentic run detail',
  },

  // ── Administration (domain UI) ─────────────────────────────────────────────
  // Declaring navigation.group: 'Administration' replaces the default Admin
  // group in AppLayout — include inert siblings so Cluster Settings / etc. remain.
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

  // ── Alerting (unrelated to the Agentic runs versioning; left untouched) ────
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

  // ── V2 workspace — /v2/ai-hub/observe/* (the only supported Agentic runs UI) ─
  {
    path: '/v2/ai-hub',
    element: <Navigate to={`/v2/ai-hub/observe/plans?perspective=${DEFAULT_PROTOTYPE_PERSPECTIVE}`} replace />,
    title: 'AI Hub',
  },
  {
    path: '/v2/ai-hub/observe/plans',
    element: withPerspectiveUrlSync(<AIHubPageV2 />),
    // No sidebar entry here — the "Agentic Runs" nav item lives on the
    // /core/observe/ai-hub/plans route above (see comment there for why).
    title: 'Agentic runs',
  },
  {
    path: '/v2/ai-hub/observe/plans/:planSlug/remediation',
    element: withPerspectiveUrlSync(<PlanRemediationPageV2 />),
    title: 'Plan remediation',
  },
  {
    path: '/v2/ai-hub/observe/acs-plans/:planSlug',
    element: withPerspectiveUrlSync(<AcsPlanDetailPageV2 />),
    title: 'ACS plan detail',
  },
  // Option A: run details consolidated under Agentic Runs workspace.
  {
    path: '/v2/ai-hub/agentic-runs/runs/:planId',
    element: withPerspectiveUrlSync(<TroubleshootingPlanDetailV2 />),
    title: 'Agentic run details',
  },
];

/** Theme state for AI Hub banner appearance controls. */
export const prototypeRootWrapper = AiHubPrototypeRoot;

/** Banner toolbar: appearance menu (see `PrototypeLayout`). */
export const bannerBeforeVersionPicker = <AiHubBannerAppearanceSettings />;

import React from 'react';
import { Navigate } from 'react-router-dom';
import { Content, PageSection } from '@patternfly/react-core';
import { RouteConfig } from '@app/core/types';
import { AiHubPrototypeRoot } from './components/AiHubPrototypeRoot';
import { AiHubBannerAppearanceSettings } from './components/AiHubBannerAppearanceSettings';
import { withPerspectiveUrlSync } from './components/AiHubPerspectiveRouteShell';
import { SummitFleetAlertingPage } from './pages/alerting-fleet-copy/SummitFleetAlertingPage';
import { BridgeRedirect } from './pages/BridgeRedirect';
import { GitOpsApplicationsPage } from './pages/gitops/GitOpsApplicationsPage';
import { PipelineRunsPage } from './pages/pipelines/PipelineRunsPage';

// ── V2 workspace page wrappers (the sole supported Agentic runs experience) ──
import { AIHubPageV2 } from './pages/v2/AIHubPageV2';
import { PlanRemediationPageV2 } from './pages/v2/PlanRemediationPageV2';
import { AcsPlanDetailPageV2 } from './pages/v2/AcsPlanDetailPageV2';
import { TroubleshootingPlanDetailV2 } from './pages/v2/TroubleshootingPlanDetailV2';
import { ClusterUpdatePageV2 } from './pages/v2/ClusterUpdatePageV2';
import { AdminPlaceholderPage } from './pages/v2/AdminPlaceholderPage';
import { AgenticRunConfigPage } from './pages/v2/AgenticRunConfigPage';

import { RecommendationHubPage } from './pages/recommendation-hub/RecommendationHubPage';
import { RecommendationDetailPage } from './pages/v2/RecommendationDetailPage';
import { DEFAULT_PROTOTYPE_PERSPECTIVE } from './prototypePerspectiveUrl';

const ObserveNavPlaceholder: React.FC = () => (
  <PageSection>
    <Content component="p">This page is a navigation placeholder in the prototype.</Content>
  </PageSection>
);

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

  // ── Home ───────────────────────────────────────────────────────────────────
  // group: 'Home' replaces the default Home nav group — include inert siblings so
  // Overview / Search / Software Catalog / etc. remain. Recommendation hub (B/C only)
  // sits between Search and Software Catalog.
  {
    path: '/core/home/overview',
    element: <ObserveNavPlaceholder />,
    label: 'Overview',
    title: 'Overview',
    navigation: { group: 'Home', order: 1 },
  },
  {
    path: '/core/home/projects',
    element: <ObserveNavPlaceholder />,
    label: 'Projects',
    title: 'Projects',
    navigation: { group: 'Home', order: 2 },
  },
  {
    path: '/core/home/search',
    element: <ObserveNavPlaceholder />,
    label: 'Search',
    title: 'Search',
    navigation: { group: 'Home', order: 3 },
  },
  {
    path: '/core/recommendation-hub',
    element: <RecommendationHubPage />,
    label: 'Recommendation hub',
    title: 'Recommendation hub',
    navigation: {
      group: 'Home',
      order: 4,
      showForBannerVersionKeys: ['recommendation-hub', 'context-panel'],
      activeMatchPaths: [
        '/core/recommendation-hub',
        '/core/recommendation-hub/recommendations',
      ],
    },
  },
  {
    path: '/core/home/catalog',
    element: <ObserveNavPlaceholder />,
    label: 'Software Catalog',
    title: 'Software Catalog',
    navigation: { group: 'Home', order: 5 },
  },
  {
    path: '/core/home/api-explorer',
    element: <ObserveNavPlaceholder />,
    label: 'API Explorer',
    title: 'API Explorer',
    navigation: { group: 'Home', order: 6 },
  },
  {
    path: '/core/home/events',
    element: <ObserveNavPlaceholder />,
    label: 'Events',
    title: 'Events',
    navigation: { group: 'Home', order: 7 },
  },
  {
    path: '/core/recommendation-hub/recommendations/:planId',
    element: withPerspectiveUrlSync(<RecommendationDetailPage />),
    title: 'Recommendation details',
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

  // ── Pipelines domain ───────────────────────────────────────────────────────
  {
    path: '/core/pipelines/overview',
    element: <ObserveNavPlaceholder />,
    label: 'Overview',
    title: 'Pipelines overview',
    navigation: { group: 'Pipelines', order: 1 },
  },
  {
    path: '/core/pipelines/pipelines',
    element: <ObserveNavPlaceholder />,
    label: 'Pipelines',
    title: 'Pipelines',
    navigation: { group: 'Pipelines', order: 2 },
  },
  {
    path: '/core/pipelines/pipelineruns',
    element: <PipelineRunsPage />,
    label: 'PipelineRuns',
    title: 'PipelineRuns',
    navigation: { group: 'Pipelines', order: 3 },
  },
  {
    path: '/core/pipelines/tasks',
    element: <ObserveNavPlaceholder />,
    label: 'Tasks',
    title: 'Tasks',
    navigation: { group: 'Pipelines', order: 4 },
  },

  // ── GitOps domain (HPUX-1984) ──────────────────────────────────────────────
  {
    path: '/core/gitops/dashboard',
    element: <ObserveNavPlaceholder />,
    label: 'Dashboard',
    title: 'GitOps overview',
    navigation: { group: 'GitOps', order: 1 },
  },
  {
    path: '/core/gitops/instances',
    element: <ObserveNavPlaceholder />,
    label: 'ArgoCD instances',
    title: 'ArgoCD instances',
    navigation: { group: 'GitOps', order: 2 },
  },
  {
    path: '/core/gitops/applications',
    element: <GitOpsApplicationsPage />,
    label: 'Applications',
    title: 'Applications',
    navigation: { group: 'GitOps', order: 3 },
  },
  {
    path: '/core/gitops/applicationsets',
    element: <ObserveNavPlaceholder />,
    label: 'ApplicationSets',
    title: 'ApplicationSets',
    navigation: { group: 'GitOps', order: 4 },
  },
  {
    path: '/core/gitops/promotion-pipelines',
    element: <ObserveNavPlaceholder />,
    label: 'Promotion pipelines',
    title: 'Promotion pipelines',
    navigation: { group: 'GitOps', order: 5 },
  },
  {
    path: '/core/gitops/rollouts',
    element: <ObserveNavPlaceholder />,
    label: 'Rollouts',
    title: 'Rollouts',
    navigation: { group: 'GitOps', order: 6 },
  },
  {
    path: '/core/gitops/app-projects',
    element: <ObserveNavPlaceholder />,
    label: 'AppProjects',
    title: 'AppProjects',
    navigation: { group: 'GitOps', order: 7 },
  },
  {
    path: '/core/gitops/settings',
    element: <ObserveNavPlaceholder />,
    label: 'Settings',
    title: 'Settings',
    navigation: { group: 'GitOps', order: 8 },
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
    path: '/v2/ai-hub/observe/plans/config',
    element: withPerspectiveUrlSync(<AgenticRunConfigPage />),
    title: 'Agentic runs configuration',
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

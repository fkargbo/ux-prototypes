import React from 'react';
import './pages/ols-prototype-chrome-scroll.css';
import { Navigate } from 'react-router-dom';
import { RouteConfig } from '@app/core/types';
import { OverviewPage } from './pages/OverviewPage';
import { ObserveOverviewPage } from './pages/ObserveOverviewPage';
import { AIHubPage } from './pages/AIHubPage';
import { AIInsightsPage } from './pages/AIInsightsPage';
import { DashboardsPersesPage } from './pages/DashboardsPersesPage';
import { PodDetailDashboardPage } from './pages/PodDetailDashboardPage';
import {
  AlertingFleetManagementGate,
  CreateAlertRuleFleetManagementGate,
  CreateSilenceFleetManagementGate,
} from './pages/AlertingFleetManagementGate';
import { Content, PageSection } from '@patternfly/react-core';
import { AiHubBannerAppearanceSettings } from './components/AiHubBannerAppearanceSettings';
import { FeedbackPanelWrapper } from './components/FeedbackPanelWrapper';
import { withPerspectiveUrlSync } from './components/AiHubPerspectiveRouteShell';
import { RecommendationHubPage } from './pages/ai-hub-v4/RecommendationHubPage';
import { GitOpsApplicationsPage } from './pages/gitops/GitOpsApplicationsPage';
import { PipelineRunsPage } from './pages/pipelines/PipelineRunsPage';
import { BridgeRedirect } from './pages/BridgeRedirect';
import { AIHubPageV2 } from './pages/v2/AIHubPageV2';
import { PlanRemediationPageV2 } from './pages/v2/PlanRemediationPageV2';
import { AcsPlanDetailPageV2 } from './pages/v2/AcsPlanDetailPageV2';
import { TroubleshootingPlanDetailV2 } from './pages/v2/TroubleshootingPlanDetailV2';
import { AgenticRunConfigPage } from './pages/v2/AgenticRunConfigPage';

const ObserveNavPlaceholder: React.FC = () => (
  <PageSection>
    <Content component="p">This page is a navigation placeholder in the prototype.</Content>
  </PageSection>
);

/**
 * Note: Any navigation group represented here fully replaces the default shell group for this
 * prototype. Observe includes stub routes for the standard items so they stay in the sidebar.
 */
export const routes: RouteConfig[] = [
  {
    path: '/',
    element: <Navigate to="/post-5-0/ai-hub" replace />,
    title: 'AI Troubleshooting Hub',
  },
  {
    path: '/core/home/overview',
    element: <OverviewPage />,
    label: 'Overview',
    title: 'Overview',
    navigation: {
      group: 'Home',
      order: 1,
    },
  },
  // Canonical entry-point — unique path owned exclusively by this prototype.
  // Share URL: https://fkargbo.github.io/ux-prototypes/post-5-0/ai-hub
  {
    path: '/post-5-0/ai-hub',
    element: <AIHubPage />,
    label: 'AI Hub',
    title: 'AI Hub',
    navigation: {
      group: 'Home',
      order: 2,
    },
  },
  // Legacy path kept as a redirect so old bookmarks / share links still work.
  // /core/observe/ai-hub is also claimed by the MVP prototype, making it
  // ambiguous for route-based prototype detection — this redirect avoids that.
  {
    path: '/core/observe/ai-hub',
    element: <Navigate to="/post-5-0/ai-hub" replace />,
    title: 'AI Hub',
  },
  {
    path: '/core/observe/ai-insights',
    element: <AIInsightsPage />,
    label: 'AI Insights',
    title: 'AI Insights',
    navigation: {
      group: 'Observe',
      order: 0,
    },
  },
  {
    path: '/core/observe/overview',
    element: <ObserveOverviewPage />,
    label: 'Observability overview',
    title: 'Observability overview',
    navigation: {
      group: 'Observe',
      order: 1,
    },
  },
  {
    path: '/core/observe/alerting',
    element: <AlertingFleetManagementGate />,
    label: 'Alerting',
    title: 'Alerting',
    navigation: {
      group: 'Observe',
      order: 2,
    },
  },
  {
    path: '/core/observe/troubleshooting-plans/:planId',
    element: <BridgeRedirect to="/v2/ai-hub/agentic-runs/runs/:planId" />,
    title: 'Agentic run details',
  },
  {
    path: '/core/observe/troubleshooting-plans',
    element: <BridgeRedirect to="/v2/ai-hub/observe/plans" />,
    label: 'Agentic runs',
    title: 'Agentic runs',
    navigation: {
      group: 'Agentic Runs',
      order: 1,
      insertAfterGroup: 'Compute',
      activeMatchPaths: [
        '/v2/ai-hub/observe/plans',
        '/v2/ai-hub/agentic-runs/runs',
        '/v2/ai-hub/observe/acs-plans',
        '/core/observe/troubleshooting-plans',
      ],
    },
  },
  // ── V2 Agentic runs workspace (MVP list + detail experience) ───────────────
  {
    path: '/v2/ai-hub/observe/plans',
    element: withPerspectiveUrlSync(<AIHubPageV2 />),
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
  {
    path: '/v2/ai-hub/agentic-runs/runs/:planId',
    element: withPerspectiveUrlSync(<TroubleshootingPlanDetailV2 />),
    title: 'Agentic run details',
  },
  {
    path: '/core/observe/alerting-v2/create-alert-rule',
    element: <CreateAlertRuleFleetManagementGate />,
    title: 'Create alert rule',
  },
  {
    path: '/core/observe/alerting-v2/create-silence',
    element: <CreateSilenceFleetManagementGate />,
    title: 'Create silence',
  },
  {
    path: '/core/observe/alerting/:clusterId/components',
    element: <AlertingFleetManagementGate />,
    title: 'Cluster components',
  },
  {
    path: '/core/observe/alerting/:clusterId/:componentId',
    element: <AlertingFleetManagementGate />,
    title: 'Component alerts',
  },
  /** Fleet drill-down targets (sidebar entries can be added when pages ship). */
  {
    path: '/core/observe/clusters',
    element: <ObserveNavPlaceholder />,
    title: 'Clusters',
  },
  {
    path: '/core/observe/nodes',
    element: <ObserveNavPlaceholder />,
    title: 'Nodes',
  },
  {
    path: '/core/observe/metrics',
    element: <ObserveNavPlaceholder />,
    label: 'Metrics',
    title: 'Metrics',
    navigation: {
      group: 'Observe',
      order: 4,
    },
  },
  {
    path: '/core/observe/dashboards',
    element: <ObserveNavPlaceholder />,
    label: 'Dashboards',
    title: 'Dashboards',
    navigation: {
      group: 'Observe',
      order: 5,
    },
  },
  {
    path: '/core/observe/targets',
    element: <ObserveNavPlaceholder />,
    label: 'Targets',
    title: 'Targets',
    navigation: {
      group: 'Observe',
      order: 6,
    },
  },
  {
    path: '/core/observe/incidents',
    element: <ObserveNavPlaceholder />,
    label: 'Incidents',
    title: 'Incidents',
    navigation: {
      group: 'Observe',
      order: 7,
    },
  },
  {
    path: '/core/observe/dashboards-perses',
    element: <DashboardsPersesPage />,
    label: 'Dashboards (Perses)',
    title: 'Dashboards (Perses)',
    navigation: {
      group: 'Observe',
      order: 8,
    },
  },
  {
    path: '/core/observe/pod-detail',
    element: <PodDetailDashboardPage />,
    title: 'Pod detail',
  },
  // ── Pipelines domain (failure analysis handoff exploration) ──────────────────
  {
    path: '/core/pipelines/overview',
    element: <ObserveNavPlaceholder />,
    label: 'Overview',
    title: 'Pipelines overview',
    navigation: {
      group: 'Pipelines',
      order: 1,
    },
  },
  {
    path: '/core/pipelines/pipelines',
    element: <ObserveNavPlaceholder />,
    label: 'Pipelines',
    title: 'Pipelines',
    navigation: {
      group: 'Pipelines',
      order: 2,
    },
  },
  {
    path: '/core/pipelines/pipelineruns',
    element: <PipelineRunsPage />,
    label: 'PipelineRuns',
    title: 'PipelineRuns',
    navigation: {
      group: 'Pipelines',
      order: 3,
    },
  },
  {
    path: '/core/pipelines/tasks',
    element: <ObserveNavPlaceholder />,
    label: 'Tasks',
    title: 'Tasks',
    navigation: {
      group: 'Pipelines',
      order: 4,
    },
  },
  // ── GitOps domain (HPUX-1984 — lightspeed domains exploration) ─────────────
  // Nav structure aligned with OpenShift GitOps plugin (Kevin’s Aug 2026 review recording).
  {
    path: '/core/gitops/dashboard',
    element: <ObserveNavPlaceholder />,
    label: 'Dashboard',
    title: 'GitOps overview',
    navigation: {
      group: 'GitOps',
      order: 1,
    },
  },
  {
    path: '/core/gitops/instances',
    element: <ObserveNavPlaceholder />,
    label: 'ArgoCD instances',
    title: 'ArgoCD instances',
    navigation: {
      group: 'GitOps',
      order: 2,
    },
  },
  {
    path: '/core/gitops/applications',
    element: <GitOpsApplicationsPage />,
    label: 'Applications',
    title: 'Applications',
    navigation: {
      group: 'GitOps',
      order: 3,
    },
  },
  {
    path: '/core/gitops/applicationsets',
    element: <ObserveNavPlaceholder />,
    label: 'ApplicationSets',
    title: 'ApplicationSets',
    navigation: {
      group: 'GitOps',
      order: 4,
    },
  },
  {
    path: '/core/gitops/promotion-pipelines',
    element: <ObserveNavPlaceholder />,
    label: 'Promotion pipelines',
    title: 'Promotion pipelines',
    navigation: {
      group: 'GitOps',
      order: 5,
    },
  },
  {
    path: '/core/gitops/rollouts',
    element: <ObserveNavPlaceholder />,
    label: 'Rollouts',
    title: 'Rollouts',
    navigation: {
      group: 'GitOps',
      order: 6,
    },
  },
  {
    path: '/core/gitops/app-projects',
    element: <ObserveNavPlaceholder />,
    label: 'AppProjects',
    title: 'AppProjects',
    navigation: {
      group: 'GitOps',
      order: 7,
    },
  },
  {
    path: '/core/gitops/settings',
    element: <ObserveNavPlaceholder />,
    label: 'Settings',
    title: 'GitOps settings',
    navigation: {
      group: 'GitOps',
      order: 8,
    },
  },
  // ── v4.0 — Recommendation Hub (HPUX-1653) ──────────────────────────────────
  // Unique shareable URL isolated from all prior versions.
  // Entry point: banner version picker → v4.0 — Recommendation Hub (redirects from AIHubPage).
  // No sidebar nav entry — AI Hub remains the single menu item for all versions.
  {
    path: '/v4/agentic-plans/recommendation-hub',
    element: <RecommendationHubPage />,
    title: 'Recommendation / AI Investigation Hub',
  },
];

/** Theme state for AI Hub banner appearance controls + feedback side panel. */
export const prototypeRootWrapper = FeedbackPanelWrapper;

/** Banner toolbar: before version picker (see `PrototypeLayout`). */
export const bannerBeforeVersionPicker = <AiHubBannerAppearanceSettings />;

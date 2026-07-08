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

// ── V1 frozen baseline page wrappers ──────────────────────────────────────────
import { AIHubPageV1 } from './pages/v1/AIHubPageV1';
import { AuditAndLogsPageV1 } from './pages/v1/AuditAndLogsPageV1';
import { PlanRemediationPageV1 } from './pages/v1/PlanRemediationPageV1';
import { AcsPlanDetailPageV1 } from './pages/v1/AcsPlanDetailPageV1';
import { TroubleshootingPlansPageV1 } from './pages/v1/TroubleshootingPlansPageV1';
import { TroubleshootingPlanDetailV1 } from './pages/v1/TroubleshootingPlanDetailV1';

// ── V2 iteration workspace page wrappers ──────────────────────────────────────
import { AIHubPageV2 } from './pages/v2/AIHubPageV2';
import { AuditAndLogsPageV2 } from './pages/v2/AuditAndLogsPageV2';
import { PlanRemediationPageV2 } from './pages/v2/PlanRemediationPageV2';
import { AcsPlanDetailPageV2 } from './pages/v2/AcsPlanDetailPageV2';
import { TroubleshootingPlanDetailV2 } from './pages/v2/TroubleshootingPlanDetailV2';

// ── Shared alerting navigation shim (redirects v2 users to consolidated path) ─
import { PlanDetailVersionRouter } from './pages/PlanDetailVersionRouter';

import { DEFAULT_PROTOTYPE_PERSPECTIVE } from './prototypePerspectiveUrl';

export const routes: RouteConfig[] = [
  {
    path: '/',
    element: <Navigate to={`/v2/ai-hub/observe/plans?perspective=${DEFAULT_PROTOTYPE_PERSPECTIVE}`} replace />,
    title: 'AI Hub',
  },
  {
    path: '/core/observe/ai-hub',
    element: <Navigate to={`/v2/ai-hub/observe/plans?perspective=${DEFAULT_PROTOTYPE_PERSPECTIVE}`} replace />,
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
      // Keep "Plans" highlighted when the user is on any v2 URL (list or drilldown).
      // The redirect from /core takes users to /v2/... so the base nav item must track
      // all v2 paths to maintain sidebar focus in both Core platforms and Fleet management.
      activeMatchPaths: [
        '/v2/ai-hub/observe/plans',
        '/v2/ai-hub/agentic-runs/runs',
        '/v2/ai-hub/observe/acs-plans',
        '/core/observe/ai-hub/acs-plans',
      ],
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
      // Keep highlighted when viewing a plan detail under the v1-versioned path.
      activeMatchPaths: ['/v1/ai-hub/observe/troubleshooting-plans'],
      // Only surface this nav item when v1 is the active banner version.
      showForBannerVersionKeys: ['v1'],
    },
  },
  {
    path: '/core/observe/troubleshooting-plans/:planId',
    element: withPerspectiveUrlSync(<PlanDetailVersionRouter />),
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

  // ── V1 frozen baseline — /v1/ai-hub/observe/* ────────────────────────────────
  {
    path: '/v1/ai-hub',
    element: <Navigate to={`/v1/ai-hub/observe/plans?perspective=${DEFAULT_PROTOTYPE_PERSPECTIVE}`} replace />,
    title: 'AI Hub v1',
  },
  {
    path: '/v1/ai-hub/observe/plans',
    element: withPerspectiveUrlSync(<AIHubPageV1 />),
    label: 'Plans (v1 baseline)',
    title: 'Plans — v1 baseline',
    navigation: {
      group: 'Agentic plans (v1)',
      order: 1,
      insertAfterGroup: 'Agentic plans',
    },
  },
  {
    path: '/v1/ai-hub/observe/audit-logs',
    element: withPerspectiveUrlSync(<AuditAndLogsPageV1 />),
    label: 'Audit & logs (v1)',
    title: 'Audit & logs — v1 baseline',
    navigation: {
      group: 'Agentic plans (v1)',
      order: 2,
      insertAfterGroup: 'Agentic plans',
    },
  },
  {
    path: '/v1/ai-hub/observe/plans/:planSlug/remediation',
    element: withPerspectiveUrlSync(<PlanRemediationPageV1 />),
    title: 'Plan remediation — v1',
  },
  {
    path: '/v1/ai-hub/observe/acs-plans/:planSlug',
    element: withPerspectiveUrlSync(<AcsPlanDetailPageV1 />),
    title: 'ACS plan detail — v1',
  },
  {
    path: '/v1/ai-hub/observe/troubleshooting-plans',
    element: withPerspectiveUrlSync(<TroubleshootingPlansPageV1 />),
    title: 'Troubleshooting plans — v1 baseline',
  },
  {
    path: '/v1/ai-hub/observe/troubleshooting-plans/:planId',
    element: withPerspectiveUrlSync(<TroubleshootingPlanDetailV1 />),
    title: 'Troubleshooting plan detail — v1',
  },

  // ── V2 iteration workspace — /v2/ai-hub/observe/* ────────────────────────────
  {
    path: '/v2/ai-hub',
    element: <Navigate to={`/v2/ai-hub/observe/plans?perspective=${DEFAULT_PROTOTYPE_PERSPECTIVE}`} replace />,
    title: 'AI Hub v2',
  },
  {
    path: '/v2/ai-hub/observe/plans',
    element: withPerspectiveUrlSync(<AIHubPageV2 />),
    label: 'Plans (v2)',
    title: 'Plans — v2 workspace',
    navigation: {
      group: 'Agentic plans (v2)',
      order: 1,
      insertAfterGroup: 'Agentic plans (v1)',
      // Keep "Plans" active when drilling into a run detail (Option A path).
      activeMatchPaths: ['/v2/ai-hub/agentic-runs/runs', '/v2/ai-hub/observe/acs-plans'],
    },
  },
  {
    path: '/v2/ai-hub/observe/audit-logs',
    element: withPerspectiveUrlSync(<AuditAndLogsPageV2 />),
    label: 'Audit & logs (v2)',
    title: 'Audit & logs — v2 workspace',
    navigation: {
      group: 'Agentic plans (v2)',
      order: 2,
      insertAfterGroup: 'Agentic plans (v1)',
    },
  },
  {
    path: '/v2/ai-hub/observe/plans/:planSlug/remediation',
    element: withPerspectiveUrlSync(<PlanRemediationPageV2 />),
    title: 'Plan remediation — v2',
  },
  {
    path: '/v2/ai-hub/observe/acs-plans/:planSlug',
    element: withPerspectiveUrlSync(<AcsPlanDetailPageV2 />),
    title: 'ACS plan detail — v2',
  },
  // Option A: run details consolidated under Agentic Runs workspace.
  // Replaces /v2/ai-hub/observe/troubleshooting-plans/:planId (removed).
  {
    path: '/v2/ai-hub/agentic-runs/runs/:planId',
    element: withPerspectiveUrlSync(<TroubleshootingPlanDetailV2 />),
    title: 'Agentic run details — v2',
  },
];

/** Theme state for AI Hub banner appearance controls. */
export const prototypeRootWrapper = AiHubPrototypeRoot;

/** Banner toolbar: appearance menu (see `PrototypeLayout`). */
export const bannerBeforeVersionPicker = <AiHubBannerAppearanceSettings />;

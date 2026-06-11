import React from 'react';
import { Navigate } from 'react-router-dom';
import { RouteConfig } from '@app/core/types';
import { AIHubPage } from './pages/AIHubPage';
import { PlanRemediationPage } from './pages/PlanRemediationPage';
import { AiHubAppearanceProvider } from './context/AiHubAppearanceContext';
import { AiHubBannerAppearanceSettings } from './components/AiHubBannerAppearanceSettings';

export const routes: RouteConfig[] = [
  {
    path: '/',
    element: <Navigate to="/core/observe/ai-hub/plans" replace />,
    title: 'AI Hub',
  },
  {
    path: '/core/observe/ai-hub',
    element: <Navigate to="/core/observe/ai-hub/plans" replace />,
    title: 'AI Hub',
  },
  {
    path: '/core/observe/ai-hub/plans',
    element: <AIHubPage />,
    label: 'Plans',
    title: 'Plans',
    navigation: {
      group: 'AI Hub',
      order: 1,
      insertAfterGroup: 'Home',
    },
  },
  {
    path: '/core/observe/ai-hub/plans/:planSlug/remediation',
    element: <PlanRemediationPage />,
    title: 'Plan remediation',
  },
];

/** Theme state for AI Hub banner appearance controls. */
export const prototypeRootWrapper = AiHubAppearanceProvider;

/** Banner toolbar: before version picker (see `PrototypeLayout`). */
export const bannerBeforeVersionPicker = <AiHubBannerAppearanceSettings />;

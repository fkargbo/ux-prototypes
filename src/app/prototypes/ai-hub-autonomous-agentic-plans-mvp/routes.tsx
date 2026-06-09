import React from 'react';
import { Navigate } from 'react-router-dom';
import { RouteConfig } from '@app/core/types';
import { AIHubPage } from './pages/AIHubPage';

export const routes: RouteConfig[] = [
  {
    path: '/',
    element: <Navigate to="/core/observe/ai-hub" replace />,
    title: 'AI Hub',
  },
  {
    path: '/core/observe/ai-hub',
    element: <AIHubPage />,
    label: 'AI Hub',
    title: 'AI Hub - Autonomous agentic plans (MVP)',
    navigation: {
      group: 'Home',
      order: 1,
    },
  },
];

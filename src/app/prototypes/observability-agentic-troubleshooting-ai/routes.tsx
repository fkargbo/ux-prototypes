import React from 'react';
import { RouteConfig } from '@app/core/types';
import { OverviewPage } from './pages/OverviewPage';

export const routes: RouteConfig[] = [
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
];

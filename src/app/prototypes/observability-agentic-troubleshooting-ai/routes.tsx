import React from 'react';
import { RouteConfig } from '@app/core/types';
import { OverviewPage } from './pages/OverviewPage';
import { ObserveOverviewPage } from './pages/ObserveOverviewPage';

/**
 * Note: Any navigation group represented here fully replaces the default shell group for this
 * prototype. Observe includes stub routes for the standard items so they stay in the sidebar.
 */
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
  {
    path: '/core/observe/overview',
    element: <ObserveOverviewPage />,
    label: 'Overview',
    title: 'Overview',
    navigation: {
      group: 'Observe',
      order: 1,
    },
  },
  {
    path: '/core/observe/alerting',
    element: <></>,
    label: 'Alerting',
    title: 'Alerting',
    navigation: {
      group: 'Observe',
      order: 2,
    },
  },
  {
    path: '/core/observe/metrics',
    element: <></>,
    label: 'Metrics',
    title: 'Metrics',
    navigation: {
      group: 'Observe',
      order: 3,
    },
  },
  {
    path: '/core/observe/dashboards',
    element: <></>,
    label: 'Dashboards',
    title: 'Dashboards',
    navigation: {
      group: 'Observe',
      order: 4,
    },
  },
  {
    path: '/core/observe/targets',
    element: <></>,
    label: 'Targets',
    title: 'Targets',
    navigation: {
      group: 'Observe',
      order: 5,
    },
  },
  {
    path: '/core/observe/incidents',
    element: <></>,
    label: 'Incidents',
    title: 'Incidents',
    navigation: {
      group: 'Observe',
      order: 6,
    },
  },
  {
    path: '/core/observe/dashboards-perses',
    element: <></>,
    label: 'Dashboards (Perses)',
    title: 'Dashboards (Perses)',
    navigation: {
      group: 'Observe',
      order: 7,
    },
  },
];

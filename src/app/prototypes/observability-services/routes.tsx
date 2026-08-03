/**
 * Routes for Observability services.
 *
 * Observe group routes fully replace the default Observe shell group for this
 * prototype. Stub entries keep the standard Observe items in the sidebar.
 *
 * Canonical share URL path: /core/observe/observability-services
 * (unique to this prototype — path alone selects it without ?prototype=)
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { RouteConfig } from '@app/core/types';
import { Content, PageSection } from '@patternfly/react-core';
import { ObservabilityServicesPage } from './pages/ObservabilityServicesPage';

const ObserveNavPlaceholder: React.FC = () => (
  <PageSection>
    <Content component="p">This page is a navigation placeholder in the prototype.</Content>
  </PageSection>
);

export const routes: RouteConfig[] = [
  {
    path: '/',
    element: <Navigate to="/core/observe/observability-services" replace />,
    title: 'Observability services',
  },
  {
    path: '/core/home/overview',
    element: <Navigate to="/core/observe/observability-services" replace />,
    label: 'Overview',
    title: 'Overview',
    navigation: {
      group: 'Home',
      order: 1,
    },
  },
  // Canonical entry — unique path owned exclusively by this prototype.
  // Share: …/core/observe/observability-services
  {
    path: '/core/observe/observability-services',
    element: <ObservabilityServicesPage />,
    label: 'Overview',
    title: 'Overview',
    navigation: {
      group: 'Observe',
      order: 0,
    },
  },
  {
    path: '/core/observe/alerting',
    element: <ObserveNavPlaceholder />,
    label: 'Alerting',
    title: 'Alerting',
    navigation: {
      group: 'Observe',
      order: 1,
    },
  },
  {
    path: '/core/observe/metrics',
    element: <ObserveNavPlaceholder />,
    label: 'Metrics',
    title: 'Metrics',
    navigation: {
      group: 'Observe',
      order: 2,
    },
  },
  {
    path: '/core/observe/dashboards',
    element: <ObserveNavPlaceholder />,
    label: 'Dashboards',
    title: 'Dashboards',
    navigation: {
      group: 'Observe',
      order: 3,
    },
  },
  {
    path: '/core/observe/targets',
    element: <ObserveNavPlaceholder />,
    label: 'Targets',
    title: 'Targets',
    navigation: {
      group: 'Observe',
      order: 4,
    },
  },
  {
    path: '/core/observe/incidents',
    element: <ObserveNavPlaceholder />,
    label: 'Incidents',
    title: 'Incidents',
    navigation: {
      group: 'Observe',
      order: 5,
    },
  },
];

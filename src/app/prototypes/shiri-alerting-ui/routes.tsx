/**
 * Routes for Multi-cluster Alerting UI
 * 
 * This prototype provides comprehensive multi-cluster alerting capabilities
 * for OpenShift Advanced Cluster Manager.
 * 
 * Navigation is configured for the Fleet Management perspective.
 */

import React from 'react';
import { RouteConfig } from '@app/core/types';

// Import page components
import { MultiClusterAlertingDashboard } from './pages/MultiClusterAlertsPage';

/**
 * Routes for Multi-cluster Alerting UI
 * 
 * These routes are added to the Fleet Management perspective under "Observe" group.
 */
export const routes: RouteConfig[] = [
  // Multi-cluster Alerting - Main page
  {
    path: '/observe/alerting',
    element: <MultiClusterAlertingDashboard />,
    label: 'Alerting',
    title: 'Multi-cluster Alerting | OpenShift ACM',
    navigation: {
      group: 'Observe',
      order: 1
    }
  },
  
  // Dashboards placeholder (for navigation structure)
  {
    path: '/observe/dashboards',
    element: <DashboardsPlaceholder />,
    label: 'Dashboards',
    title: 'Dashboards | OpenShift ACM',
    navigation: {
      group: 'Observe',
      order: 2
    }
  },
];

// Placeholder component for Dashboards
function DashboardsPlaceholder() {
  return (
    <div style={{ padding: '24px' }}>
      <h1>Dashboards</h1>
      <p>Dashboards functionality coming soon.</p>
    </div>
  );
}


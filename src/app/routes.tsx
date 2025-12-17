import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Dashboard } from '@app/Dashboard/Dashboard';
import { Support } from '@app/Support/Support';
import { GeneralSettings } from '@app/Settings/General/GeneralSettings';
import { ProfileSettings } from '@app/Settings/Profile/ProfileSettings';
import { NotFound } from '@app/NotFound/NotFound';
import { MultiClusterAlertingDashboard } from '@app/MultiClusterAlerts/MultiClusterAlertsPage';

export interface IAppRoute {
  label?: string; // Excluding the label will exclude the route from the nav sidebar in AppLayout
  element: React.ReactElement;
  exact?: boolean;
  path: string;
  title: string;
  routes?: undefined;
}

export interface IAppRouteGroup {
  label: string;
  routes: IAppRoute[];
}

export type AppRouteConfig = IAppRoute | IAppRouteGroup;

const routes: AppRouteConfig[] = [
  {
    element: <Dashboard />,
    exact: true,
    label: 'Overview',
    path: '/',
    title: 'OpenShift Advanced Cluster Manager | Overview',
  },
  {
    label: 'Infrastructure',
    routes: [
      {
        element: <Dashboard />,
        exact: true,
        label: 'Clusters',
        path: '/infrastructure/clusters',
        title: 'OpenShift Advanced Cluster Manager | Clusters',
      },
    ],
  },
  {
    label: 'Virtualization',
    routes: [
      {
        element: <Dashboard />,
        exact: true,
        label: 'Virtual Machines',
        path: '/virtualization/vms',
        title: 'OpenShift Advanced Cluster Manager | Virtual Machines',
      },
    ],
  },
  {
    label: 'Applications',
    routes: [
      {
        element: <Dashboard />,
        exact: true,
        label: 'Deployments',
        path: '/applications/deployments',
        title: 'OpenShift Advanced Cluster Manager | Deployments',
      },
    ],
  },
  {
    label: 'Governance',
    routes: [
      {
        element: <Dashboard />,
        exact: true,
        label: 'Policies',
        path: '/governance/policies',
        title: 'OpenShift Advanced Cluster Manager | Policies',
      },
    ],
  },
  {
    label: 'Credentials',
    routes: [
      {
        element: <Dashboard />,
        exact: true,
        label: 'Secrets',
        path: '/credentials/secrets',
        title: 'OpenShift Advanced Cluster Manager | Secrets',
      },
    ],
  },
  {
    label: 'Observe',
    routes: [
      {
        element: <MultiClusterAlertingDashboard />,
        exact: true,
        label: 'Alerting',
        path: '/observe/alerting',
        title: 'OpenShift Advanced Cluster Manager | Alerting',
      },
      {
        element: <Dashboard />,
        exact: true,
        label: 'Dashboards',
        path: '/observe/dashboards',
        title: 'OpenShift Advanced Cluster Manager | Dashboards',
      },
    ],
  },
  {
    element: <Support />,
    exact: true,
    label: 'Support',
    path: '/support',
    title: 'OpenShift Advanced Cluster Manager | Support Page',
  },
  {
    label: 'Settings',
    routes: [
      {
        element: <GeneralSettings />,
        exact: true,
        label: 'General',
        path: '/settings/general',
        title: 'OpenShift Advanced Cluster Manager | General Settings',
      },
      {
        element: <ProfileSettings />,
        exact: true,
        label: 'Profile',
        path: '/settings/profile',
        title: 'OpenShift Advanced Cluster Manager | Profile Settings',
      },
    ],
  },
];

const flattenedRoutes: IAppRoute[] = routes.reduce(
  (flattened, route) => [...flattened, ...(route.routes ? route.routes : [route])],
  [] as IAppRoute[],
);

const AppRoutes = (): React.ReactElement => (
  <Routes>
    {flattenedRoutes.map(({ path, element }, idx) => (
      <Route path={path} element={element} key={idx} />
    ))}
    <Route element={<NotFound />} />
  </Routes>
);

export { AppRoutes, routes };

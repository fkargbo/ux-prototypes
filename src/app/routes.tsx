import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Dashboard } from '@app/Dashboard/Dashboard';
import { Support } from '@app/Support/Support';
import { GeneralSettings } from '@app/Settings/General/GeneralSettings';
import { ProfileSettings } from '@app/Settings/Profile/ProfileSettings';
import { IdentityDetail } from '@app/Identities/IdentityDetail';
import { GroupDetail } from '@app/Identities/GroupDetail';
import CreateGroup from '@app/Identities/CreateGroup';
import { CreateRole } from '@app/Roles/CreateRole';
import { RoleDetail } from '@app/Roles/RoleDetail';
import { IdentityProviderDetail } from '@app/IdentityProvider/IdentityProviderDetail';
import { AddLDAPProvider } from '@app/IdentityProvider/AddLDAPProvider';
import { ProjectDetail } from '@app/Projects/ProjectDetail';
import { VirtualMachines } from '@app/VirtualMachines/VirtualMachines';
import { HubVirtualMachines } from '@app/CorePlatforms/HubVirtualMachines';
import { NotFound } from '@app/NotFound/NotFound';
import {
  ClustersPage,
  ClusterDetailPage,
  IdentitiesPage,
  RolesPage,
  IdentityProvidersPage
} from '@app/navigation';
import { ProjectsPage } from '@app/navigation/core-platforms';
import { OverviewPage } from '@app/FleetVirtualization/EmptyPages';
import Virtualization from '@app/FleetVirtualization/Virtualization';
import { Catalog } from '@app/FleetVirtualization/Catalog';
import { Templates } from '@app/FleetVirtualization/Templates';
import { InstanceTypes } from '@app/FleetVirtualization/InstanceTypes';
import { Search } from '@app/Search/Search';

export interface IAppRoute {
  label?: string; // Excluding the label will exclude the route from the nav sidebar in AppLayout
  element: React.ReactElement;
  exact?: boolean;
  path: string;
  title: string;
  routes?: undefined;
  disabled?: boolean;
}

export interface IAppRouteGroup {
  label: string;
  routes: IAppRoute[];
  disabled?: boolean;
}

export type AppRouteConfig = IAppRoute | IAppRouteGroup;

const routes: AppRouteConfig[] = [
  {
    element: <Virtualization />,
    path: '/virtualization/overview',
    title: 'Virtualization',
  },
  {
    element: <Catalog />,
    path: '/virtualization/catalog',
    title: 'Catalog',
  },
  {
    element: <VirtualMachines />,
    path: '/virtualization/virtual-machines',
    title: 'Virtual machines',
  },
  {
    element: <InstanceTypes />,
    path: '/virtualization/instance-types',
    title: 'InstanceTypes',
  },
  {
    element: <Templates />,
    path: '/virtualization/templates',
    title: 'Templates',
  },
  {
    element: <HubVirtualMachines />,
    path: '/core/virtualization/vms',
    title: 'Hub Virtual Machines',
  },
  {
    label: 'Home',
    routes: [
      {
        element: <Dashboard />,
        label: 'Overview',
        path: '/',
        title: 'ACM | Home',
      },
    ],
  },
  {
    element: <Search />,
    label: 'Search',
    path: '/search',
    title: 'ACM | Search',
  },
  {
    label: 'Infrastructure',
    routes: [
      {
        element: <ClustersPage />,
        label: 'Clusters',
        path: '/infrastructure/clusters',
        title: 'ACM | Clusters',
      },
      {
        element: <ClusterDetailPage />,
        path: '/infrastructure/clusters/:clusterName',
        title: 'ACM | Cluster Detail',
      },
      {
        element: <Dashboard />,
        label: 'Automation',
        path: '/infrastructure/automation',
        title: 'ACM | Automation',
      },
      {
        element: <Dashboard />,
        label: 'Host inventory',
        path: '/infrastructure/host-inventory',
        title: 'ACM | Host Inventory',
      },
    ],
  },
  {
    label: 'Applications',
    disabled: true,
    routes: [
      {
        element: <Dashboard />,
        label: 'Overview',
        path: '/applications/overview',
        title: 'ACM | Applications',
      },
    ],
  },
  {
    label: 'Governance',
    disabled: true,
    routes: [
      {
        element: <Dashboard />,
        label: 'Overview',
        path: '/governance/overview',
        title: 'ACM | Governance',
      },
    ],
  },
  {
    label: 'Credentials',
    disabled: true,
    routes: [
      {
        element: <Dashboard />,
        label: 'Overview',
        path: '/credentials/overview',
        title: 'ACM | Credentials',
      },
    ],
  },
  {
    label: 'Observe',
    disabled: true,
    routes: [
      {
        element: <Dashboard />,
        label: 'Overview',
        path: '/observe/overview',
        title: 'ACM | Observe',
      },
    ],
  },
  {
    label: 'Edge management',
    disabled: true,
    routes: [
      {
        element: <Dashboard />,
        label: 'Overview',
        path: '/edge-management/overview',
        title: 'ACM | Edge Management',
      },
    ],
  },
  {
    label: 'User management',
    routes: [
      {
        element: <IdentitiesPage />,
        label: 'Identities',
        path: '/user-management/identities',
        title: 'ACM | Identities',
      },
      {
        element: <CreateGroup />,
        path: '/user-management/groups/create',
        title: 'ACM | Create Group',
      },
      {
        element: <CreateGroup />,
        path: '/user-management/groups/edit/:groupName',
        title: 'ACM | Edit Group',
      },
      {
        element: <GroupDetail />,
        path: '/user-management/groups/:groupName',
        title: 'ACM | Group Detail',
      },
      {
        element: <IdentityDetail />,
        path: '/user-management/identities/:identityName',
        title: 'ACM | Identity Detail',
      },
      {
        element: <RolesPage />,
        label: 'Roles',
        path: '/user-management/roles',
        title: 'ACM | Roles',
      },
      {
        element: <CreateRole />,
        path: '/user-management/roles/create',
        title: 'ACM | Create Role',
      },
      {
        element: <CreateRole />,
        path: '/user-management/roles/edit/:roleName',
        title: 'ACM | Edit Role',
      },
      {
        element: <RoleDetail />,
        path: '/user-management/roles/:roleName',
        title: 'ACM | Role Detail',
      },
      {
        element: <IdentityProvidersPage />,
        label: 'Identity providers',
        path: '/user-management/identity-providers',
        title: 'ACM | Identity Providers',
      },
      {
        element: <AddLDAPProvider />,
        path: '/user-management/identity-providers/add/ldap',
        title: 'ACM | Add LDAP Provider',
      },
      {
        element: <IdentityProviderDetail />,
        path: '/user-management/identity-providers/:providerName',
        title: 'ACM | Identity Provider Detail',
      },
    ],
  },
  {
    label: 'Core Platforms',
    routes: [
      {
        element: <ProjectsPage />,
        path: '/core/home/projects',
        title: 'Projects',
      },
      {
        element: <ProjectDetail />,
        path: '/core/home/projects/:projectName',
        title: 'Project Detail',
      },
      {
        element: <IdentityProvidersPage showClustersColumn={false} />,
        path: '/core/user-management/identity-providers',
        title: 'ACM | Identity Providers',
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

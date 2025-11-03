import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Dashboard } from '@app/Dashboard/Dashboard';
import { Support } from '@app/Support/Support';
import { GeneralSettings } from '@app/Settings/General/GeneralSettings';
import { ProfileSettings } from '@app/Settings/Profile/ProfileSettings';
import { HubVirtualMachines } from '@app/CorePlatforms/HubVirtualMachines';
import { NotFound } from '@app/NotFound/NotFound';
import {
  ClustersPage,
  ClusterDetailPage,
  IdentitiesPage,
  RolesPage,
  IdentityProvidersPage,
  ProjectsPage,
  GovernancePage,
  CreatePolicy,
  IdentityDetail,
  GroupDetail,
  CreateGroup,
  CreateRole,
  RoleDetail,
  IdentityProviderDetail,
  AddLDAPProvider,
  ProjectDetail,
  QuotasPage,
  QuotaDetail,
  CreateQuota,
  VirtualizationOverview,
  VirtualMachines,
} from '@app/utils/useCaseComponents';
import { CCLMOverview } from '@app/use-case-cclm/CCLMOverview';
import { MigrationPlans } from '@app/use-case-cclm/Migration/MigrationPlans';
import { CreateMigrationPlan } from '@app/use-case-cclm/Migration/CreateMigrationPlan';
import { OperatorHub } from '@app/use-case-operator-lifecycle/OperatorHub/OperatorHub';
// Shared copies for non-CCLM routes (so editing originals only affects CCLM)
import { OverviewPage } from '@app/shared-fleet-virtualization/EmptyPages';
import Virtualization from '@app/shared-fleet-virtualization/Virtualization';
import { Catalog } from '@app/shared-fleet-virtualization/Catalog';
import { Templates } from '@app/shared-fleet-virtualization/Templates';
import { InstanceTypes } from '@app/shared-fleet-virtualization/InstanceTypes';
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
    element: <VirtualMachines />,
    path: '/virtualization/virtual-machines/:vmId',
    title: 'Virtual Machine Details',
  },
  {
    element: <MigrationPlans />,
    path: '/virtualization/migration',
    title: 'Migration',
  },
  {
    element: <CreateMigrationPlan />,
    path: '/virtualization/migration/create',
    title: 'Create migration plan',
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
    element: <VirtualizationOverview />,
    path: '/core/virtualization/overview',
    title: 'Virtualization Overview',
  },
  {
    element: <HubVirtualMachines />,
    path: '/core/virtualization/vms',
    title: 'Hub Virtual Machines',
  },
  {
    element: <QuotasPage />,
    path: '/core/virtualization/quotas',
    title: 'Quotas',
  },
  {
    element: <CreateQuota />,
    path: '/core/virtualization/quotas/create',
    title: 'Create Quota',
  },
  {
    element: <QuotaDetail />,
    path: '/core/virtualization/quotas/:quotaName',
    title: 'Quota Details',
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
    element: <GovernancePage />,
    label: 'Governance',
    path: '/governance',
    title: 'ACM | Governance',
  },
  {
    element: <CreatePolicy />,
    path: '/governance/policies/create',
    title: 'ACM | Create Policy',
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
        element: <IdentityProvidersPage showClustersColumn={true} />,
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

// Additional routes without navigation labels (won't appear in sidebar)
const hiddenRoutes: IAppRoute[] = [
  {
    element: <CCLMOverview />,
    path: '/cclm/overview',
    title: 'Cross Cluster Live Migration',
  },
  // Operator lifecycle use case routes
  {
    element: <OperatorHub />,
    path: '/ecosystem/softwarecatalog',
    title: 'Software Catalog',
  },
];

const flattenedRoutes: IAppRoute[] = [
  ...routes.reduce(
    (flattened, route) => [...flattened, ...(route.routes ? route.routes : [route])],
    [] as IAppRoute[],
  ),
  ...hiddenRoutes,
];

const AppRoutes = (): React.ReactElement => (
  <Routes>
    {flattenedRoutes.map(({ path, element }, idx) => (
      <Route path={path} element={element} key={idx} />
    ))}
    <Route element={<NotFound />} />
  </Routes>
);

export { AppRoutes, routes };

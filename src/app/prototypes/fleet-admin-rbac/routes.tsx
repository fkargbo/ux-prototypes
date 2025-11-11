/**
 * Routes for Fleet Admin RBAC Prototype
 * 
 * All routes for the fleet administrator tenant delegation workflow
 */

import React from 'react';
import { PageSection } from '@patternfly/react-core';
import { RouteConfig } from '@app/core/types';
import { VirtualMachines } from './VirtualMachines/VirtualMachines';
import { HubVirtualMachines } from './CorePlatforms/HubVirtualMachines';

// Import pages from navigation wrappers
import {
  ClustersPage,
  ClusterDetailPage,
  IdentitiesPage,
  RolesPage,
  IdentityProvidersPage,
  ProjectsPage,
  GovernancePage,
} from './navigation';

// Import detail/action pages
import { CreatePolicy } from './Governance/CreatePolicy';
import { IdentityDetail } from './Identities/IdentityDetail';
import { GroupDetail } from './Identities/GroupDetail';
import CreateGroup from './Identities/CreateGroup';
import { CreateRole } from './Roles/CreateRole';
import { RoleDetail } from './Roles/RoleDetail';
import { IdentityProviderDetail } from './IdentityProvider/IdentityProviderDetail';
import { AddLDAPProvider } from './IdentityProvider/AddLDAPProvider';
import { ProjectDetail } from './Projects/ProjectDetail';

export const routes: RouteConfig[] = [
  // Home / Dashboard
  {
    path: '/',
    element: <ClustersPage />,
    label: 'Overview',
    title: 'ACM | Home',
    navigation: {
      group: 'Home',
      order: 1
    }
  },

  // Infrastructure
  {
    path: '/infrastructure/clusters',
    element: <ClustersPage />,
    label: 'Clusters',
    title: 'ACM | Clusters',
    navigation: {
      group: 'Infrastructure',
      order: 1
    }
  },
  {
    path: '/infrastructure/clusters/:clusterName',
    element: <ClusterDetailPage />,
    title: 'ACM | Cluster Detail'
  },

  // User Management - Identities
  {
    path: '/user-management/identities',
    element: <IdentitiesPage />,
    label: 'Identities',
    title: 'ACM | Identities',
    navigation: {
      group: 'User management',
      order: 1
    }
  },
  {
    path: '/user-management/groups/create',
    element: <CreateGroup />,
    title: 'ACM | Create Group'
  },
  {
    path: '/user-management/groups/edit/:groupName',
    element: <CreateGroup />,
    title: 'ACM | Edit Group'
  },
  {
    path: '/user-management/groups/:groupName',
    element: <GroupDetail />,
    title: 'ACM | Group Detail'
  },
  {
    path: '/user-management/identities/:identityName',
    element: <IdentityDetail />,
    title: 'ACM | Identity Detail'
  },

  // User Management - Roles
  {
    path: '/user-management/roles',
    element: <RolesPage />,
    label: 'Roles',
    title: 'ACM | Roles',
    navigation: {
      group: 'User management',
      order: 2
    }
  },
  {
    path: '/user-management/roles/create',
    element: <CreateRole />,
    title: 'ACM | Create Role'
  },
  {
    path: '/user-management/roles/edit/:roleName',
    element: <CreateRole />,
    title: 'ACM | Edit Role'
  },
  {
    path: '/user-management/roles/:roleName',
    element: <RoleDetail />,
    title: 'ACM | Role Detail'
  },

  // User Management - Identity Providers
  {
    path: '/user-management/identity-providers',
    element: <IdentityProvidersPage showClustersColumn={true} />,
    label: 'Identity providers',
    title: 'ACM | Identity Providers',
    navigation: {
      group: 'User management',
      order: 3
    }
  },
  {
    path: '/user-management/identity-providers/add/ldap',
    element: <AddLDAPProvider />,
    title: 'ACM | Add LDAP Provider'
  },
  {
    path: '/user-management/identity-providers/:providerName',
    element: <IdentityProviderDetail />,
    title: 'ACM | Identity Provider Detail'
  },

  // Governance - Show blank page (hidden from navigation)
  {
    path: '/governance',
    element: <PageSection />,
    title: 'ACM | Governance'
  },
  {
    path: '/governance/policies/create',
    element: <PageSection />,
    title: 'ACM | Create Policy'
  },

  // Projects (Core Platforms perspective)
  {
    path: '/core/home/projects',
    element: <ProjectsPage />,
    title: 'Projects'
  },
  {
    path: '/core/home/projects/:projectName',
    element: <ProjectDetail />,
    title: 'Project Detail'
  },
  {
    path: '/core/user-management/identity-providers',
    element: <IdentityProvidersPage showClustersColumn={false} />,
    title: 'ACM | Identity Providers'
  },

  // Fleet Virtualization - Virtual machines (must be before blank virtualization routes)
  {
    path: '/virtualization/virtual-machines',
    element: <VirtualMachines />,
    title: 'Virtual machines'
  },

  // Blank pages for Fleet management navigation items
  {
    path: '/infrastructure/automation',
    element: <PageSection />,
    title: 'ACM | Automation'
  },
  {
    path: '/infrastructure/host-inventory',
    element: <PageSection />,
    title: 'ACM | Host Inventory'
  },
  {
    path: '/applications/overview',
    element: <PageSection />,
    title: 'ACM | Applications'
  },
  {
    path: '/credentials/overview',
    element: <PageSection />,
    title: 'ACM | Credentials'
  },
  {
    path: '/observe/overview',
    element: <PageSection />,
    title: 'ACM | Observe'
  },
  {
    path: '/edge-management/overview',
    element: <PageSection />,
    title: 'ACM | Edge Management'
  },
  {
    path: '/search',
    element: <PageSection />,
    title: 'ACM | Search'
  },

  // Blank pages for Fleet virtualization navigation items (must be after Virtual machines route)
  {
    path: '/virtualization/overview',
    element: <PageSection />,
    title: 'Overview'
  },
  {
    path: '/virtualization/catalog',
    element: <PageSection />,
    title: 'Catalog'
  },
  {
    path: '/virtualization/instance-types',
    element: <PageSection />,
    title: 'InstanceTypes'
  },
  {
    path: '/virtualization/templates',
    element: <PageSection />,
    title: 'Templates'
  },

  // Core Platforms - Virtualization - Virtual machines (Hub cluster only)
  {
    path: '/core/virtualization/vms',
    element: <HubVirtualMachines />,
    title: 'VirtualMachines'
  },

  // Blank pages for Core platforms Virtualization items (except VirtualMachines)
  {
    path: '/core/virtualization/overview',
    element: <PageSection />,
    title: 'Overview'
  },
  {
    path: '/core/virtualization/catalog',
    element: <PageSection />,
    title: 'Catalog'
  },
  {
    path: '/core/virtualization/templates',
    element: <PageSection />,
    title: 'Templates'
  },
  {
    path: '/core/virtualization/instancetypes',
    element: <PageSection />,
    title: 'InstanceTypes'
  },
  {
    path: '/core/virtualization/preferences',
    element: <PageSection />,
    title: 'Preferences'
  },
  {
    path: '/core/virtualization/bootable-volumes',
    element: <PageSection />,
    title: 'Bootable volumes'
  },
  {
    path: '/core/virtualization/migration-policies',
    element: <PageSection />,
    title: 'MigrationPolicies'
  },
  {
    path: '/core/virtualization/checkups',
    element: <PageSection />,
    title: 'Checkups'
  },

  // Blank pages for Core platforms navigation items (except Projects and Virtualization)
  {
    path: '/core/home/overview',
    element: <PageSection />,
    title: 'Overview'
  },
  {
    path: '/core/home/search',
    element: <PageSection />,
    title: 'Search'
  },
  {
    path: '/core/home/catalog',
    element: <PageSection />,
    title: 'Software Catalog'
  },
  {
    path: '/core/home/api-explorer',
    element: <PageSection />,
    title: 'API Explorer'
  },
  {
    path: '/core/home/events',
    element: <PageSection />,
    title: 'Events'
  },
  // Add more Core platforms blank routes as needed
];


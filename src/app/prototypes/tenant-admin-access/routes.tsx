/**
 * Routes for Tenant Admin Access Prototype
 */

import React from 'react';
import { RouteConfig } from '@app/core/types';

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
  // Home
  {
    path: '/',
    element: <ProjectsPage />,
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

  // User Management
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
    path: '/user-management/groups/:groupName',
    element: <GroupDetail />,
    title: 'ACM | Group Detail'
  },
  {
    path: '/user-management/identities/:identityName',
    element: <IdentityDetail />,
    title: 'ACM | Identity Detail'
  },
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
    path: '/user-management/roles/:roleName',
    element: <RoleDetail />,
    title: 'ACM | Role Detail'
  },
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

  // Projects
  {
    path: '/projects',
    element: <ProjectsPage />,
    label: 'Projects',
    title: 'ACM | Projects',
    navigation: {
      group: 'Projects',
      order: 1
    }
  },
  {
    path: '/projects/:projectName',
    element: <ProjectDetail />,
    title: 'ACM | Project Detail'
  },

  // Governance
  {
    path: '/governance',
    element: <GovernancePage />,
    label: 'Governance',
    title: 'ACM | Governance',
    navigation: {
      group: 'Governance',
      order: 1
    }
  },
];


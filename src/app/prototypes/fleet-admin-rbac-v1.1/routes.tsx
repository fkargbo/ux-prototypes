/**
 * Routes for Fleet Admin RBAC Prototype v1.1
 * 
 * This is a new version - starting with blank template pages
 */

import React from 'react';
import { PageSection } from '@patternfly/react-core';
import { RouteConfig } from '@app/core/types';

export const routes: RouteConfig[] = [
  // Root route - blank page (template)
  {
    path: '/',
    element: <PageSection />,
    title: 'Fleet Admin RBAC v1.1'
  },

  // User Management - Identities (Fleet management perspective)
  {
    path: '/user-management/identities',
    element: <PageSection />,
    label: 'Identities',
    title: 'ACM | Identities',
    navigation: {
      group: 'User management',
      order: 1
    }
  },
  
  // User Management - Roles (Fleet management perspective)
  {
    path: '/user-management/roles',
    element: <PageSection />,
    label: 'Roles',
    title: 'ACM | Roles',
    navigation: {
      group: 'User management',
      order: 2
    }
  },
  
  // User Management - Identity Providers (Fleet management perspective)
  {
    path: '/user-management/identity-providers',
    element: <PageSection />,
    label: 'Identity providers',
    title: 'ACM | Identity Providers',
    navigation: {
      group: 'User management',
      order: 3
    }
  },

  // All other routes show blank pages (template)
  // Add your routes here as you build the prototype
];


/**
 * Routes for [Prototype Name]
 * 
 * Define all routes for your prototype here.
 */

import React from 'react';
import { PageSection } from '@patternfly/react-core';
import { RouteConfig } from '@app/core/types';

// Import your page components
import { HomePage } from './pages/HomePage';
// import { OtherPage } from './pages/OtherPage';

export const routes: RouteConfig[] = [
  {
    // Route path (relative to root)
    path: '/',
    
    // React component to render
    element: <HomePage />,
    
    // Label (if provided, shows in navigation)
    label: 'Home',
    
    // Page title (shown in browser tab)
    title: 'Home',
    
    // Optional: Navigation grouping
    navigation: {
      group: 'Main',
      order: 1,
      // icon: HomeIcon // Optional icon component
    }
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
  
  // Add more routes here...
  // {
  //   path: '/other',
  //   element: <OtherPage />,
  //   label: 'Other Page',
  //   title: 'Other Page',
  //   navigation: {
  //     group: 'Main',
  //     order: 2
  //   }
  // }
];


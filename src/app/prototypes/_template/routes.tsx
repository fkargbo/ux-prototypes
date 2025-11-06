/**
 * Routes for [Prototype Name]
 * 
 * Define all routes for your prototype here.
 */

import React from 'react';
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


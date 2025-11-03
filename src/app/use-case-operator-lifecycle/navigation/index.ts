import React from 'react';
import { OperatorHub } from '../OperatorHub/OperatorHub';
import { InstalledSoftware } from '../Ecosystem/InstalledSoftware/InstalledSoftware';
import { OperatorLifecycle } from '../OperatorLifecycle/OperatorLifecycle';

export const operatorLifecycleRoutes = [
  {
    label: 'Software',
    routes: [
      {
        element: <OperatorHub />,
        exact: true,
        label: 'Catalog',
        path: '/software/catalog',
        title: 'Software Catalog',
      },
      {
        element: <InstalledSoftware />,
        exact: true,
        label: 'Installed',
        path: '/software/installed',
        title: 'Installed Software',
      },
      {
        element: <OperatorLifecycle />,
        exact: true,
        label: 'Lifecycle',
        path: '/software/lifecycle',
        title: 'Lifecycle Management',
      },
    ],
  },
];


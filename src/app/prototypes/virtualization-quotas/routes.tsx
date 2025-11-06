import React from 'react';
import { RouteConfig } from '@app/core/types';

import { QuotasPage, Overview, VirtualizationWrapper } from './navigation/core-platforms';
import { CreateQuota } from './Quotas/CreateQuota';
import { QuotaDetail } from './Quotas/QuotaDetail';

export const routes: RouteConfig[] = [
  {
    path: '/',
    element: <Overview />,
    label: 'Overview',
    title: 'Virtualization Overview'
  },
  {
    path: '/quotas',
    element: <QuotasPage />,
    label: 'Quotas',
    title: 'Quotas',
    navigation: {
      group: 'Virtualization',
      order: 1
    }
  },
  {
    path: '/quotas/create',
    element: <CreateQuota />,
    title: 'Create Quota'
  },
  {
    path: '/quotas/:quotaName',
    element: <QuotaDetail />,
    title: 'Quota Details'
  },
];


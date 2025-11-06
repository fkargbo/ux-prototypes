import { PrototypeConfig } from '@app/core/types';

export const config: PrototypeConfig = {
  id: 'cross-cluster-migration-v1.1',
  name: 'Cross Cluster Live Migration',
  description: 'Enhanced migration flow with improved progress tracking and rollback options. Move 80 running VMs from core-billing project in us-east-prod-02 cluster to us-west-prod-01 cluster.',
  
  // Versioning
  versionGroup: 'cross-cluster-migration',
  version: 'v1.1',
  versionLabel: 'Enhanced Progress Tracking',
  
  owner: {
    name: 'Platform Team',
    slack: '@platform',
  },
  status: 'active',
  persona: {
    name: 'Nelson Gardner',
    role: 'Platform Administrator',
    organization: 'Petemobile (Telco)'
  },
  task: {
    title: 'Migrate VMs Across Clusters',
    description: 'Move 80 running VMs from core-billing project in us-east-prod-02 to us-west-prod-01 cluster.',
  },
  perspectives: ['fleet-virtualization'],
  tags: ['cclm', 'migration', 'virtualization', 'live-migration'],
  createdAt: '2024-03-01',
  updatedAt: '2024-11-06'
};


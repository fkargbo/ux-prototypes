import { PrototypeConfig } from '@app/core/types';

export const config: PrototypeConfig = {
  id: 'aaq-empty-states',
  parentId: 'virtualization-parent',
  childOrder: 2,
  name: 'Virtualization Empty States',
  description: 'Explore and evaluate AAQ virtualization quota empty state designs.',
  owner: {
    name: 'UX Design Team',
    slack: '@ux-design',
  },
  version: '1.0.0',
  status: 'active',
  persona: {
    name: 'Jane Designer',
    role: 'UX Designer',
    organization: 'Red Hat'
  },
  task: {
    title: 'Review Empty States',
    description: 'Explore AAQ empty state design patterns.',
  },
  perspectives: ['core-platforms'],
  tags: ['empty-states', 'ux', 'design-patterns', 'aaq', 'virtualization'],
  createdAt: '2024-04-15',
  updatedAt: '2024-11-06'
};


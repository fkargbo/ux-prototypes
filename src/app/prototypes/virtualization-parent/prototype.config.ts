/**
 * Virtualization Admin Parent Prototype Configuration
 * 
 * This is a parent/container prototype that groups virtualization/AAQ prototypes
 */

import { PrototypeConfig } from '@app/core/types';

export const config: PrototypeConfig = {
  // Identity
  id: 'virtualization-parent',
  
  // Display name
  name: 'Virtualization Admin Prototypes',
  
  // What this prototype explores
  description: 'A collection of virtualization administration prototypes exploring quota management, resource allocation, and admin workflows.',
  
  // This is a parent/container
  isParent: true,
  
  // Owner information
  owner: {
    name: 'Stefan Kukla',
    slack: '@stefan',
    email: 'skukla@redhat.com'
  },
  
  // Version
  version: '1.0.0',
  
  // Status
  status: 'active',
  
  // User persona (representative)
  persona: {
    name: 'Various',
    role: 'Virtualization Administrators',
    organization: 'Platform Team'
  },
  
  // Perspectives
  perspectives: ['core-platforms', 'fleet-virtualization'],
  
  // Tags
  tags: ['virtualization', 'quotas', 'resource-management', 'vm', 'aaq'],
  
  // Timestamps
  createdAt: '2024-11-06',
  updatedAt: '2024-11-06',
  
  // Research task
  task: {
    title: 'Virtualization Quota Management',
    description: 'Explore admin workflows for managing VM quotas and resources',
    steps: [
      'Test quota creation and enforcement',
      'Explore resource allocation patterns',
      'Validate empty state experiences'
    ]
  }
};


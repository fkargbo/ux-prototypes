/**
 * Prototype Configuration Template
 * 
 * Copy this entire _template directory to create a new prototype.
 * Rename the directory and update this configuration file.
 */

import { PrototypeConfig } from '@app/core/types';

export const config: PrototypeConfig = {
  // Unique identifier (use kebab-case, no spaces)
  // Example: 'my-awesome-prototype', 'rbac-research-v2', 'cluster-wizard-redesign'
  id: 'my-prototype-template',
  
  // Display name (shown in prototype launcher)
  name: 'My Prototype Template',
  
  // Brief description (2-3 sentences max)
  description: 'A template for creating new prototypes. Copy this directory and customize it for your research needs.',
  
  // Owner information
  owner: {
    name: 'Your Name',
    slack: '@yourhandle',
    email: 'you@redhat.com',
    github: 'yourgithub'
  },
  
  // Version (use semantic versioning: major.minor.patch)
  version: '0.1.0',
  
  // Status: 'draft' | 'active' | 'paused' | 'archived'
  // - draft: Work in progress, not ready for testing
  // - active: Ready for user research
  // - paused: Temporarily on hold
  // - archived: Research complete, kept for reference
  status: 'draft',
  
  // User persona for this prototype
  persona: {
    name: 'Test User',
    role: 'System Administrator',
    organization: 'Example Corp'
  },
  
  // Optional: Research task shown to users
  task: {
    title: 'Your Task',
    description: 'This is the task you want users to complete during testing.',
    steps: [
      'Step 1: Do something',
      'Step 2: Do something else',
      'Step 3: Complete the task'
    ]
  },
  
  // Which perspectives should be available
  // Options: 'fleet-management' | 'fleet-virtualization' | 'core-platforms'
  perspectives: ['fleet-management'],
  
  // Tags for filtering and discovery
  // Use relevant keywords: feature names, product areas, research topics, etc.
  tags: ['template', 'example', 'getting-started'],
  
  // Optional: Shared components this prototype uses
  // List paths to help track dependencies
  dependencies: [
    '@app/shared/components/layouts/DetailPageLayout',
    '@app/shared/components/layouts/TableLayout',
  ],
  
  // Metadata (dates in YYYY-MM-DD format)
  createdAt: new Date().toISOString().split('T')[0],
  updatedAt: new Date().toISOString().split('T')[0],
  
  // Optional: Custom branding
  branding: {
    // icon: '/path/to/icon.svg',
    // color: '#0066cc',
    // banner: 'Custom banner text'
  }
};


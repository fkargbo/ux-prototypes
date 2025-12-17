/**
 * Prototype Configuration for Multi-cluster Alerting UI
 */

import { PrototypeConfig } from '@app/core/types';

export const config: PrototypeConfig = {
  // Unique identifier (use kebab-case, no spaces)
  id: 'shiri-alerting-ui',
  
  // Display name (shown in prototype launcher)
  name: '🔔 Multi-cluster Alerting',
  
  // Brief description (2-3 sentences max)
  description: 'Comprehensive Multi-cluster Alerting UI for OpenShift Advanced Cluster Manager. Features fleet overview with treemap visualization, cluster drill-down, comprehensive filtering, and alert management.',
  
  // Owner information
  owner: {
    name: 'Shiri Mordechay',
    slack: '@shirimordechay',
    email: 'shiri.mordechay@redhat.com'
  },
  
  // Version (always start at 1.0.0 for new prototypes)
  version: '1.0.0',
  
  // Status: 'draft' | 'in-progress' | 'done' | 'paused' | 'archived'
  status: 'in-progress',
  
  // User persona for this prototype
  persona: {
    name: 'Fleet Administrator',
    role: 'SRE / Cluster Administrator',
  },
  
  // Which perspectives should be available
  // Fleet management for multi-cluster alerting
  perspectives: ['fleet-management'],
  
  // Tags for filtering and discovery
  tags: ['Alerting', 'Multi-cluster', 'Observability', 'ACM', 'Fleet Management'],
  
  // Metadata
  createdAt: '2025-12-17',
  updatedAt: '2025-12-17',
};


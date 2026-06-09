import { PrototypeConfig } from '@app/core/types';

export const config: PrototypeConfig = {
  id: 'ai-hub-autonomous-agentic-plans-mvp',
  name: 'AI Hub - Autonomous agentic plans (MVP)',
  description:
    'MVP for autonomous agentic remediation plans in AI Hub — plan review, approval workflows, and Lightspeed-assisted remediation discussion.',
  owner: {
    name: 'Foday Kargbo',
    slack: '@Foday',
    email: 'fkargbo@redhat.com',
  },
  version: '1.0.0',
  bannerVersionPicker: {
    options: [
      { key: 'v1', label: 'v1.0' },
      { key: 'v2', label: 'v2.0' },
      { key: 'v3', label: 'v3.0' },
    ],
    defaultKey: 'v3',
  },
  status: 'in-progress',
  persona: {
    name: 'SRE / Platform engineer',
    role: 'Reviewing and approving autonomous agent remediation plans',
  },
  perspectives: ['fleet-management', 'core-platforms'],
  tags: ['AI Hub', 'Agents', 'Autonomous', 'Remediation', 'MVP'],
  createdAt: '2026-06-09',
  updatedAt: '2026-06-09',
};

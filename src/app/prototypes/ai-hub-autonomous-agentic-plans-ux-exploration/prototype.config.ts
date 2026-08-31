import { PrototypeConfig } from '@app/core/types';

export const config: PrototypeConfig = {
  id: 'ai-hub-autonomous-agentic-plans-ux-exploration',
  name: 'AI Hub - Autonomous Agentic Plans (UX Exploration)',
  description:
    'UX audit & evaluation sandbox for autonomous agentic remediation plans — isolated copy of the MVP for gap analysis and design exploration without mutating the agreed source of truth.',
  owner: {
    name: 'Foday Kargbo',
    slack: '@Foday',
    email: 'fkargbo@redhat.com',
  },
  version: '1.0.0',
  status: 'in-progress',
  persona: {
    name: 'SRE / Platform engineer',
    role: 'Reviewing and approving autonomous agent remediation plans',
  },
  perspectives: ['core-platforms', 'fleet-management'],
  tags: ['AI Hub', 'Agents', 'Autonomous', 'Remediation', 'UX Audit', 'Draft'],
  createdAt: '2026-08-31',
  updatedAt: '2026-08-31',
};

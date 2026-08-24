import { PrototypeConfig } from '@app/core/types';

export const config: PrototypeConfig = {
  id: 'ols-domain-ux',
  name: 'Agentic OpenShift Lightspeed - Domain UX patterns',
  description:
    'Post–5.0 MVP exploration (HPUX-1984): how domain UIs across GitOps, Pipelines, Cluster Updates, Observability, and ACS link into and out of Agentic Runs — labeling, filtering, and ownership of agentic run detail vs specialized domain views.',
  owner: {
    name: 'Peter Kreuser & Foday Kargbo',
    slack: '@pkreuser',
    email: 'pkreuser@redhat.com',
  },
  version: '1.0.0',
  bannerVersionPicker: {
    options: [
      { key: 'agentic-runs', label: 'Pattern A — Agentic runs handoff' },
      { key: 'recommendation-hub', label: 'Pattern B — Recommendation hub' },
      { key: 'context-panel', label: 'Pattern C — Context side panel' },
    ],
    defaultKey: 'agentic-runs',
  },
  status: 'in-progress',
  persona: {
    name: 'SRE / Platform engineer',
    role: 'Reviewing and approving autonomous agent remediation plans',
  },
  perspectives: ['core-platforms', 'fleet-management'],
  tags: ['AI Hub', 'Agents', 'Lightspeed', 'Domains', 'GitOps', 'Pipelines', 'UX patterns'],
  badgeLabel: 'Agentic OpenShift Lightspeed - Domain UX patterns',
  createdAt: '2026-08-18',
  updatedAt: '2026-08-18',
};

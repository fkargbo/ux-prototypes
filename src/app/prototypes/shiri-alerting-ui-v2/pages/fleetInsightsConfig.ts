import type React from 'react';

/** Config and constants for Fleet Health Insights (CrossClusterInsightsCards). */

export const INSIGHTS_LIST_SIZE = 5;

export const INSIGHTS_LINK = {
  fontSize: 'var(--pf-t--global--font--size--sm, 14px)',
} as const;

export const TROUBLESHOOT_TOOLTIP =
  'Troubleshooting is not available. Install Signal Correlator operator to enable it.';

export const AI_INSIGHTS_BY_ALERT: Record<string, string> = {
  KubeNodeNotReady:
    'Synchronized across regions. Shared VPC-peering or DNS resolution may be affecting multiple clusters.',
  ContainerOOMKilled:
    'Matches recent deployment activity. Resource limits may need adjustment for workload peaks.',
  CertExpiringSoon:
    'Global certificate rotation required within 48 hours for ingress controllers.',
  NodeCPUHigh:
    'High CPU correlates with node count; consider scaling or workload distribution.',
  ImageRegistryPersistentVolumeFull:
    'Registry PV growth trend suggests cleanup or expansion of persistent storage.',
  MDSCacheUsageHigh:
    'MDS cache pressure across clusters; review Ceph MDS configuration.',
};

export const AI_INSIGHTS_BY_COMPONENT: Record<string, string> = {
  'kube-apiserver':
    'API server alerts often indicate control-plane load or etcd latency.',
  etcd: 'Etcd issues can cascade; check leader health and disk latency.',
  kubelet: 'Kubelet alerts may point to node resource or network problems.',
};

export function getAlertAiInsight(alertName: string): string {
  return (
    AI_INSIGHTS_BY_ALERT[alertName] ??
    `Firing across multiple clusters; review severity and runbook for ${alertName}.`
  );
}

export function getComponentAiInsight(componentName: string): string {
  return (
    AI_INSIGHTS_BY_COMPONENT[componentName] ??
    `Component ${componentName} is impacted in several clusters; check related alerts.`
  );
}

export const INSIGHTS_LIST_WRAPPER: React.CSSProperties = {
  backgroundColor:
    'var(--pf-t--global--background--color--secondary--default, #f5f5f5)',
  borderRadius: 'var(--pf-t--global--border--radius--medium, 8px)',
  padding: 0,
  flex: 1,
  minHeight: 0,
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
};

export const INSIGHTS_LIST_ITEM: React.CSSProperties = {
  padding: '12px 8px',
  borderBottom:
    '1px solid var(--pf-t--global--border--color--default, #d2d2d2)',
  backgroundColor:
    'var(--pf-t--global--background--color--primary--default, #ffffff)',
};

export const INSIGHTS_LIST_ITEM_LAST: React.CSSProperties = {
  borderBottom: 'none',
};

export const AI_INSIGHT_ICON_STYLE: React.CSSProperties = {
  color: 'var(--pf-t--global--text--color--subtle)',
  flexShrink: 0,
};

export const AI_INSIGHT_TEXT_STYLE: React.CSSProperties = {
  fontStyle: 'italic',
  color: 'var(--pf-t--global--text--color--subtle)',
  width: '100%',
};

export const FLEET_INSIGHT_CARD_STYLE: React.CSSProperties = {
  backgroundColor:
    'var(--pf-t--global--background--color--primary--default, #ffffff)',
  borderRadius: 'var(--pf-t--global--border--radius--medium, 8px)',
  border: '1px solid var(--pf-t--global--border--color--default, #d2d2d2)',
  padding: '12px 16px',
  marginBottom: 12,
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
  width: '100%',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
};

export const FLEET_INSIGHT_ICON_BOX_STYLE: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 8,
  backgroundColor: 'rgba(102, 82, 172, 0.12)',
  color: '#6753ac',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

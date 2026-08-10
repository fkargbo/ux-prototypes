import React from 'react';

interface ResourceBadgeConfig {
  abbr: string;
  bg: string;
  fg: string;
}

/**
 * Maps a normalised resource kind string to its OpenShift badge abbreviation and
 * colour. The input is lower-cased and stripped of any API group suffix before
 * matching, e.g. "securitycontextconstraints (security.openshift.io)" → "securitycontextconstraints".
 */
const KIND_MAP: Record<string, ResourceBadgeConfig> = {
  // Workloads — blue
  deployments:   { abbr: 'D',   bg: '#0066CC', fg: '#fff' },
  pods:          { abbr: 'P',   bg: '#0066CC', fg: '#fff' },
  statefulsets:  { abbr: 'SS',  bg: '#0066CC', fg: '#fff' },
  daemonsets:    { abbr: 'DS',  bg: '#0066CC', fg: '#fff' },
  replicasets:   { abbr: 'RS',  bg: '#0066CC', fg: '#fff' },
  jobs:          { abbr: 'J',   bg: '#0066CC', fg: '#fff' },
  cronjobs:      { abbr: 'CJ',  bg: '#0066CC', fg: '#fff' },
  // Config — purple
  configmaps:    { abbr: 'CM',  bg: '#6A278C', fg: '#fff' },
  secrets:       { abbr: 'S',   bg: '#6A278C', fg: '#fff' },
  // Networking — green
  services:      { abbr: 'SVC', bg: '#3E8635', fg: '#fff' },
  routes:        { abbr: 'RT',  bg: '#3E8635', fg: '#fff' },
  ingresses:     { abbr: 'I',   bg: '#3E8635', fg: '#fff' },
  // Infrastructure — orange
  nodes:         { abbr: 'N',   bg: '#EC7A08', fg: '#fff' },
  persistentvolumeclaims: { abbr: 'PVC', bg: '#EC7A08', fg: '#fff' },
  persistentvolumes:      { abbr: 'PV',  bg: '#EC7A08', fg: '#fff' },
  storageclasses:         { abbr: 'SC',  bg: '#EC7A08', fg: '#fff' },
  // Cluster-scoped — grey
  namespaces:    { abbr: 'NS',  bg: '#6A6E73', fg: '#fff' },
  clusterroles:  { abbr: 'CR',  bg: '#6A6E73', fg: '#fff' },
  clusterrolebindings: { abbr: 'CRB', bg: '#6A6E73', fg: '#fff' },
  // Security (OpenShift)
  securitycontextconstraints: { abbr: 'SCC', bg: '#C9190B', fg: '#fff' },
  mutatingwebhookconfigurations:   { abbr: 'MWC', bg: '#6A6E73', fg: '#fff' },
  validatingwebhookconfigurations: { abbr: 'VWC', bg: '#6A6E73', fg: '#fff' },
};

/** Neutral fallback badge style for unknown or custom resources. */
const FALLBACK_CONFIG: Omit<ResourceBadgeConfig, 'abbr'> = {
  bg: '#6A6E73',
  fg: '#fff',
};

/**
 * Derive a 1-2 character abbreviation from an arbitrary resource string.
 * Strips API group suffixes like "(apps)", "(security.openshift.io)", etc.
 */
function deriveAbbr(raw: string): string {
  const base = raw.replace(/\s*\(.*?\)/, '').trim();
  const words = base.split(/[\s_-]+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return base.slice(0, 2).toUpperCase();
}

/**
 * Resolve a `ResourceBadgeConfig` for a given resource string.
 * Strips API group suffixes before lookup so that e.g.
 * "deployments (apps)" correctly resolves to the Deployments badge.
 */
function resolveConfig(resource: string): ResourceBadgeConfig {
  const normalised = resource
    .replace(/\s*\(.*?\)/, '') // strip "(apps)", "(security.openshift.io)" …
    .trim()
    .toLowerCase();

  return KIND_MAP[normalised] ?? { abbr: deriveAbbr(resource), ...FALLBACK_CONFIG };
}

interface ResourceIconProps {
  /** Raw resource string as stored in RbacRule, e.g. "deployments (apps)". */
  resource: string;
  size?: number;
}

/**
 * Circular badge that mirrors the OpenShift console resource-kind icon pattern.
 * Renders a coloured circle with a short abbreviation, sized to align with
 * monospace resource text in table rows.
 */
const ResourceIcon: React.FC<ResourceIconProps> = ({ resource, size = 22 }) => {
  const { abbr, bg, fg } = resolveConfig(resource);
  const fontSize = abbr.length >= 3 ? size * 0.38 : size * 0.44;

  return (
    <span
      aria-hidden
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        minWidth: size,
        borderRadius: '50%',
        backgroundColor: bg,
        color: fg,
        fontSize,
        fontWeight: 700,
        fontFamily: 'var(--pf-t--global--font--family--sans)',
        letterSpacing: '-0.02em',
        lineHeight: 1,
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {abbr}
    </span>
  );
};

export default ResourceIcon;

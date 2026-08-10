import React from 'react';
import { OpenShiftResourceBadge } from './NamespaceResourceLink';

/**
 * Color values sourced directly from the OCP console SCSS variables file:
 * frontend/public/style/_vars.scss
 *
 * Only resource kinds that have an explicit CSS rule in
 * frontend/public/components/_resource.scss are included here.
 * Unknown / custom resources return null (no badge rendered).
 */
const KIND_MAP: Record<string, { abbr: string; color: string }> = {
  // Workloads — $color-pod-overlord: #004080
  deployments:             { abbr: 'D',   color: '#004080' },
  deploymentconfigs:       { abbr: 'DC',  color: '#004080' },
  daemonsets:              { abbr: 'DS',  color: '#004080' },
  replicasets:             { abbr: 'RS',  color: '#004080' },
  replicationcontrollers:  { abbr: 'RC',  color: '#004080' },
  jobs:                    { abbr: 'J',   color: '#004080' },

  // Pods — $color-pod-dark: #009596
  pods:                    { abbr: 'P',   color: '#009596' },

  // Config — $color-configmap-dark: #40199a
  configmaps:              { abbr: 'CM',  color: '#40199a' },
  serviceaccounts:         { abbr: 'SA',  color: '#40199a' },
  ingresses:               { abbr: 'I',   color: '#40199a' },

  // Secrets — $color-secret-dark: #c46100
  secrets:                 { abbr: 'S',   color: '#c46100' },

  // Networking — $color-service-dark: #6ca100
  services:                { abbr: 'SVC', color: '#6ca100' },

  // Namespace / Project — $color-namespace-dark: #1e4f18
  namespaces:              { abbr: 'NS',  color: '#1e4f18' },
  projects:                { abbr: 'PR',  color: '#1e4f18' },

  // Nodes / Infrastructure — $color-node-dark: #8476d1
  nodes:                   { abbr: 'N',   color: '#8476d1' },
  machines:                { abbr: 'M',   color: '#8476d1' },

  // RBAC — $color-rbac-role-dark: #795600
  clusterroles:            { abbr: 'CR',  color: '#795600' },
  roles:                   { abbr: 'R',   color: '#795600' },

  // RBAC bindings — $color-rbac-binding-dark: #008bad
  clusterrolebindings:     { abbr: 'CRB', color: '#008bad' },
  rolebindings:            { abbr: 'RB',  color: '#008bad' },
};

/**
 * Resolve badge config for a given resource string, or `null` for kinds that
 * have no explicit OCP console CSS colour rule (CRDs, unknown resources, etc.).
 *
 * Strips API group suffixes before lookup, so
 * `"deployments (apps)"` → `"deployments"` → Deployment badge.
 */
function resolveConfig(resource: string): { abbr: string; color: string } | null {
  const normalised = resource
    .replace(/\s*\(.*?\)/, '') // remove "(apps)", "(security.openshift.io)", …
    .trim()
    .toLowerCase();
  return KIND_MAP[normalised] ?? null;
}

interface ResourceIconProps {
  /** Raw resource string from RbacRule, e.g. "deployments (apps)". */
  resource: string;
}

/**
 * OpenShift console–style resource kind badge using the same pill shape and
 * exact colour values as `OpenShiftResourceBadge` in NamespaceResourceLink.tsx.
 *
 * Returns `null` for resource kinds not found in the OCP console CSS registry,
 * so unknown / custom resources render with just the monospace name, no badge.
 */
const ResourceIcon: React.FC<ResourceIconProps> = ({ resource }) => {
  const config = resolveConfig(resource);
  if (!config) return null;
  return <OpenShiftResourceBadge label={config.abbr} backgroundColor={config.color} />;
};

export default ResourceIcon;

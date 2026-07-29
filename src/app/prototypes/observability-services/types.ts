/** Capability readiness — not live health / telemetry severity. */
export type CapabilityStatusKind =
  | 'fully-enabled'
  | 'configuration-required'
  | 'available-addon';

export type LabelColor = 'green' | 'yellow' | 'grey' | 'blue' | 'orange' | 'teal' | 'purple';

export interface CapabilityStatus {
  kind: CapabilityStatusKind;
  /** Visible label text */
  label: string;
  /** PatternFly Label color (never red/critical for uninstalled/optional) */
  color: LabelColor;
  /** Screen-reader-only status context */
  srText: string;
}

export type DependencyState = 'ready' | 'attention' | 'missing';

export interface CapabilityDependency {
  id: string;
  label: string;
  state: DependencyState;
  detail?: string;
}

export type CapabilityActionVariant = 'primary' | 'secondary' | 'tertiary' | 'link' | 'control';

export interface CapabilityAction {
  id: string;
  label: string;
  variant: CapabilityActionVariant;
  /** In-app path, external URL, or operatorhub deep link */
  href?: string;
  isExternal?: boolean;
  /** Helper copy shown under the action cluster (e.g. Step 2 after OperatorHub) */
  helperText?: string;
}

export type CapabilityCategory = 'installed' | 'recommended';

export interface CapabilityCardData {
  id: string;
  title: string;
  subtitle?: string;
  status: CapabilityStatus;
  summary: string;
  dependencies?: CapabilityDependency[];
  actions: CapabilityAction[];
  category: CapabilityCategory;
  /** Free-text tokens for search */
  searchTerms: string[];
}

export type StackSummaryTarget =
  | 'global-dashboards'
  | 'project-dashboards'
  | 'alerting-rules'
  | 'firing-alerts'
  | 'active-targets'
  | 'unique-metrics';

export interface StackSummaryStat {
  id: StackSummaryTarget;
  label: string;
  /** Inventory / readiness count — not live severity */
  value: number;
  href: string;
  description: string;
}

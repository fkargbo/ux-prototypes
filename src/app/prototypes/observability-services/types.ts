/**
 * Runtime health of the backend pods/CSVs for an installed capability.
 * Drives <OperationalHealthLabel /> independently of the macro enablement badge.
 *
 *   HEALTHY  → label is suppressed (null)
 *   DEGRADED → red "Operational health: Degraded" label renders below Dependencies heading
 *
 * Recommended (not-installed) cards omit this field entirely.
 */
export type RuntimeHealthState = 'HEALTHY' | 'DEGRADED';

/** Capability readiness — not live health / telemetry severity. */
export type CapabilityStatusKind =
  | 'fully-enabled'
  | 'configuration-required'
  | 'degraded'
  | 'available-addon';

export type LabelColor = 'green' | 'yellow' | 'grey' | 'blue' | 'orange' | 'red' | 'teal' | 'purple';

export interface CapabilityStatus {
  kind: CapabilityStatusKind;
  /** Visible label text */
  label: string;
  /** PatternFly Label color (never red/critical for uninstalled/optional) */
  color: LabelColor;
  /** Screen-reader-only status context */
  srText: string;
}

export type DependencyState = 'ready' | 'attention' | 'degraded' | 'missing';

export interface CapabilityDependency {
  id: string;
  label: string;
  state: DependencyState;
  detail?: string;
  /** Optional inline action rendered below the dependency label. */
  action?: {
    label: string;
    href?: string;
    isExternal?: boolean;
  };
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
  /**
   * Runtime health of backend pods/CSVs for this capability.
   * Omit (or default HEALTHY) for recommended cards — the label won't render.
   * Set DEGRADED when backend resources are failing independently of enablement.
   */
  runtimeHealth?: RuntimeHealthState;
}

// ─── v2.0.0 Day-0 Dependency Lifecycle ───────────────────────────────────────

/**
 * Four-state lifecycle for each dependency row in a Day-0 capability card.
 *
 *  blocked          → COO core stack absent; action disabled, "Prerequisite required" label
 *  missing-operator → COO present, Operator absent; "Install" → external OperatorHub URL
 *  disabled-cr      → Operator present, UI Plugin CR absent; "Enable" → mock CR creation
 *  ready            → Operator + CR active; green "Installed / Enabled / Running" label
 */
export type DependencyLifecycleState = 'blocked' | 'missing-operator' | 'disabled-cr' | 'ready';

export interface V2DependencyItem {
  id: string;
  /** Row label shown in the name column (e.g. "Loki Operator"). */
  label: string;
  state: DependencyLifecycleState;
  /** Shown in the right column when state === 'ready'. Default: 'Installed'. */
  readyLabel?: string;
  /** External OperatorHub URL (required when state === 'missing-operator'). */
  operatorHubUrl?: string;
  /** Button label for 'missing-operator' state. Default: 'Install'. */
  installLabel?: string;
  /** Button label for 'disabled-cr' state. Default: 'Enable'. */
  crActionLabel?: string;
}

export interface V2CapabilityCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: 'installed' | 'recommended';
  dependencies: V2DependencyItem[];
  learnMoreHref?: string;
}

// ─────────────────────────────────────────────────────────────────────────────

/** Visual severity tint applied to an operational KPI card. */
export type OperationalKpiVariant = 'danger' | 'success' | 'warning' | 'neutral';

/** State of a single capability item shown inside the Capabilities ready popover. */
export type KpiPopoverItemState = 'ready' | 'partial-setup' | 'not-installed';

export interface KpiPopoverItem {
  id: string;
  /** Capability name shown in the popover row (e.g. "Logs"). */
  title: string;
  /** Drives the status label colour in the popover row. */
  state: KpiPopoverItemState;
  /** Optional action label (retained for forward-compatibility). */
  actionLabel?: string;
  /** Target URL for an optional action. */
  href?: string;
  /** When true the href opens in a new tab. */
  isExternal?: boolean;
}

export interface OperationalKpiStat {
  id: string;
  /** Small category label rendered above the metric (e.g. "Alert posture"). */
  category: string;
  /**
   * Metric value as a display string — may be a plain integer ("27") or a
   * fraction ("3/7"). Zero-state logic parses integers only.
   */
  value: string;
  /** Short noun that follows the value (e.g. "Critical alerts"). */
  label: string;
  /** Secondary helper copy below the metric (e.g. "Active firing alerts"). */
  subtext: string;
  /** Severity tint for icon and top-border accent. */
  variant: OperationalKpiVariant;
  /**
   * Variant to use when the numeric value parses to 0 (e.g. show success
   * icon when there are zero critical alerts). Only evaluated for integer values.
   */
  zeroVariant?: OperationalKpiVariant;
  /**
   * When set, renders a status icon immediately before the metric value using
   * the matching severity colour (e.g. red ExclamationCircleIcon for 'danger').
   */
  valueIconVariant?: OperationalKpiVariant;
  /**
   * Renders the metric value as a link-styled element (blue, underline on hover)
   * without wiring up navigation. Use when the target page isn't ready yet.
   */
  valueIsLink?: boolean;
  /**
   * When provided, clicking the value opens a Popover listing these items.
   * Takes precedence over `valueIsLink` for rendering the trigger.
   */
  popoverItems?: KpiPopoverItem[];
  /** In-app path to navigate to on click. */
  href?: string;
  /** DOM element ID to smooth-scroll to on click (used instead of href). */
  scrollTargetId?: string;
}

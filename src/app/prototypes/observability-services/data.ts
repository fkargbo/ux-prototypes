import type { CapabilityCardData, KpiPopoverItem, OperationalKpiStat } from './types';

/**
 * 4-card operational KPI ribbon for the Observability services page.
 *
 * Values are illustrative mocks scoped to operator/dependency readiness —
 * not raw cluster telemetry. Replace with live API calls in production.
 */
// ── v2 Day 0 KPI stats: COO not yet installed ─────────────────────────────────
export const OPERATIONAL_KPI_STATS_V2_DAY0: OperationalKpiStat[] = [
  {
    id: 'capabilities-ready',
    category: 'Capabilities ready',
    value: '0/7',
    label: 'Ready',
    subtext: 'Install COO to get started',
    variant: 'warning',
    popoverItems: [
      { id: 'pop-metrics-alerting',      title: 'Monitoring',            state: 'not-installed' },
      { id: 'pop-dashboards',            title: 'Dashboards',            state: 'not-installed' },
      { id: 'pop-logs',                  title: 'Logging',               state: 'not-installed' },
      { id: 'pop-distributed-tracing',   title: 'Distributed tracing',   state: 'not-installed' },
      { id: 'pop-signal-correlation',    title: 'Signal Correlation',    state: 'not-installed' },
      { id: 'pop-incident-detection',    title: 'Incident detection',    state: 'not-installed' },
      { id: 'pop-network-observability', title: 'Network observability', state: 'not-installed' },
    ] as KpiPopoverItem[],
  },
  {
    id: 'operator-health',
    category: 'Component health',
    value: '0',
    label: 'Degraded',
    subtext: 'No operators running',
    variant: 'danger',
    zeroVariant: 'success',
    valueIconVariant: 'danger',
  },
];

// ── v2 Day 1 KPI stats: COO installed, Metrics & Alerting active ──────────────
export const OPERATIONAL_KPI_STATS: OperationalKpiStat[] = [
  {
    id: 'capabilities-ready',
    category: 'Capabilities ready',
    value: '2/7',
    label: 'Ready',
    subtext: '5 pending setup',
    variant: 'warning',
    popoverItems: [
      { id: 'pop-metrics-alerting',      title: 'Monitoring',            state: 'ready' },
      { id: 'pop-distributed-tracing',   title: 'Distributed tracing',   state: 'ready' },
      { id: 'pop-dashboards',            title: 'Dashboards',            state: 'partial-setup' },
      { id: 'pop-logs',                  title: 'Logging',               state: 'partial-setup' },
      { id: 'pop-signal-correlation',    title: 'Signal Correlation',    state: 'not-installed' },
      { id: 'pop-incident-detection',    title: 'Incident detection',    state: 'not-installed' },
      { id: 'pop-network-observability', title: 'Network observability', state: 'not-installed' },
    ] as KpiPopoverItem[],
  },
  {
    id: 'operator-health',
    category: 'Component health',
    value: '1',
    label: 'Degraded',
    subtext: '1 degraded — OTELCollector',
    variant: 'danger',
    zeroVariant: 'success',
    valueIconVariant: 'danger',
  },
];

/**
 * Capability cards — one card per COO-managed capability.
 *
 * Structure follows the COO Custom Resource model:
 *  - COO manages a MonitoringStack CR  → Metrics & Alerting
 *  - COO manages a Monitoring UI Plugin CR (Perses feature) → Customizable Dashboards
 *  - COO manages a Monitoring UI Plugin CR (Health Analyzer feature) → Health Analyzer
 *  - COO manages a Logging UI Plugin CR → Logs  (+ Loki + CLO external operators)
 *  - COO manages a Distributed Tracing UI Plugin CR → Distributed Tracing (+ Tempo + OTEL)
 *  - COO manages a Troubleshooting Panel UI Plugin CR → Signal Correlation (Korrel8r)
 *  - Network Observability Operator is standalone (not COO-managed).
 */
export const CAPABILITY_CARDS: CapabilityCardData[] = [
  // ─── Installed: Metrics & Alerting ─────────────────────────────────────────
  {
    id: 'metrics-alerting',
    title: 'Metrics & Alerting',
    subtitle: 'COO · MonitoringStack',
    status: {
      kind: 'fully-enabled',
      label: 'Ready',
      color: 'green',
      srText: 'Status: ready',
    },
    summary:
      'Core metrics collection and alerting powered by Prometheus and Alertmanager. Available under Observe → Metrics and Observe → Alerting.',
    category: 'installed',
    searchTerms: ['prometheus', 'alertmanager', 'metrics', 'alerting', 'monitoringstack'],
    dependencies: [
      { id: 'monitoring-stack-cr', label: 'COO MonitoringStack CR', state: 'ready' },
      { id: 'prometheus', label: 'Prometheus', state: 'ready' },
      { id: 'alertmanager', label: 'Alertmanager', state: 'ready' },
    ],
    // All dependencies ready, status fully enabled — no install action.
    actions: [
      {
        id: 'metrics-alerting-learn-more',
        label: 'Learn more',
        variant: 'link',
        href: 'https://docs.redhat.com/en/documentation/red_hat_openshift_cluster_observability_operator/1-latest/html/ui_plugins_for_red_hat_openshift_cluster_observability_operator/monitoring-ui-plugin',
        isExternal: true,
      },
    ],
  },

  // ─── Installed: Customizable Dashboards ─────────────────────────────────────
  {
    id: 'customizable-dashboards',
    title: 'Dashboards',
    subtitle: 'COO · Perses',
    status: {
      kind: 'fully-enabled',
      label: 'Ready',
      color: 'green',
      srText: 'Status: ready',
    },
    summary:
      'Create and manage customizable Perses dashboards. Available under Observe → Dashboards (Perses).',
    category: 'installed',
    searchTerms: ['perses', 'dashboards', 'monitoring', 'ui plugin'],
    dependencies: [
      {
        id: 'monitoring-ui-plugin-cr',
        label: 'COO Monitoring UI Plugin CR (Perses feature)',
        state: 'ready',
      },
      { id: 'perses-backend', label: 'Perses backend', state: 'ready' },
      { id: 'monitoring-frontend', label: 'Monitoring frontend', state: 'ready' },
    ],
    // All dependencies ready, status fully enabled — no install action.
    actions: [
      {
        id: 'dashboards-learn-more',
        label: 'Learn more',
        variant: 'link',
        href: 'https://docs.redhat.com/en/documentation/red_hat_openshift_cluster_observability_operator/1-latest/html/ui_plugins_for_red_hat_openshift_cluster_observability_operator/perses-dashboard',
        isExternal: true,
      },
    ],
  },

  // ─── Installed: Logs ────────────────────────────────────────────────────────
  {
    id: 'logs',
    title: 'Logs',
    subtitle: 'COO · Loki · CLO',
    status: {
      kind: 'configuration-required',
      label: 'Partial setup',
      color: 'grey',
      srText: 'Status: partial setup — Logging UI Plugin disabled',
    },
    summary:
      'Execute log-based queries for application, infrastructure, and audit logs. Available under Observe → Logs once the UI plugin is enabled.',
    category: 'installed',
    searchTerms: ['loki', 'clo', 'logs', 'logging', 'clusterlogforwarder', 'lokistack'],
    dependencies: [
      {
        id: 'logging-ui-cr',
        label: 'COO Logging UI Plugin CR',
        state: 'attention',
        detail: 'Disabled in COO CR',
      },
      { id: 'loki-lokistack', label: 'Loki Operator + LokiStack', state: 'ready' },
      { id: 'clo-clf', label: 'CLO + ClusterLogForwarder', state: 'ready' },
    ],
    actions: [
      {
        id: 'enable-logging-plugin',
        label: 'Enable',
        variant: 'secondary',
        href: '/core/observe/observability-services#enable-logging-plugin',
        helperText:
          'Enables the Logging UI Plugin CR in COO. After enabling, complete Step 2 in the COO configuration to finish setup.',
      },
      {
        id: 'logs-learn-more',
        label: 'Learn more',
        variant: 'link',
        href: 'https://docs.redhat.com/en/documentation/red_hat_openshift_cluster_observability_operator/1-latest/html/ui_plugins_for_red_hat_openshift_cluster_observability_operator/logging-ui-plugin',
        isExternal: true,
      },
    ],
  },

  // ─── Installed: Distributed Tracing ─────────────────────────────────────────
  {
    id: 'distributed-tracing',
    title: 'Distributed tracing',
    subtitle: 'COO · Tempo · OpenTelemetry',
    runtimeHealth: 'DEGRADED',
    status: {
      kind: 'fully-enabled',
      label: 'Ready',
      color: 'green',
      srText: 'Status: ready',
    },
    summary:
      'Explore distributed traces and spans for microservice request analysis and latency bottleneck detection. Available under Observe → Traces.',
    category: 'installed',
    searchTerms: ['tempo', 'opentelemetry', 'otel', 'tracing', 'traces', 'tempostack', 'otelcollector'],
    dependencies: [
      {
        id: 'tracing-ui-cr',
        label: 'COO Distributed Tracing UI Plugin CR',
        state: 'ready',
      },
      { id: 'tempo-tempostack', label: 'Tempo Operator + TempoStack', state: 'ready' },
      {
        id: 'otel-collector',
        label: 'OTEL Operator + OTELCollector',
        state: 'degraded',
        detail: 'OTELCollector not ready',
        action: {
          label: 'View OTELCollector',
          href: '/k8s/all-namespaces/opentelemetry.io~v1alpha1~OpenTelemetryCollector',
        },
      },
    ],
    actions: [
      {
        id: 'tracing-learn-more',
        label: 'Learn more',
        variant: 'link',
        href: 'https://docs.redhat.com/en/documentation/red_hat_openshift_cluster_observability_operator/1-latest/html/ui_plugins_for_red_hat_openshift_cluster_observability_operator/distributed-tracing-ui-plugin',
        isExternal: true,
      },
    ],
  },

  // ─── Recommended: Signal Correlation ─────────────────────────────────────────
  {
    id: 'signal-correlation',
    title: 'Signal Correlation',
    subtitle: 'COO · Korrel8r',
    status: {
      kind: 'available-addon',
      label: 'Available',
      color: 'grey',
      srText: 'Status: available',
    },
    summary:
      'Execute correlation queries between observability signals — metrics, logs, traces, and alerts. Accessible via the OCP web console header actions once enabled.',
    category: 'recommended',
    searchTerms: ['korrel8r', 'correlation', 'troubleshooting', 'signals', 'troubleshooting panel'],
    dependencies: [
      {
        id: 'troubleshooting-panel-cr',
        label: 'COO Troubleshooting Panel UI Plugin CR',
        state: 'missing',
      },
    ],
    actions: [
      {
        id: 'enable-signal-correlation',
        label: 'Enable',
        variant: 'secondary',
        href: '/k8s/ns/openshift-cluster-observability-operator/operators.coreos.com~v1alpha1~ClusterServiceVersion',
        helperText:
          'Creates the Troubleshooting Panel UI Plugin CR in COO. The Korrel8r backend is deployed automatically as part of this configuration.',
      },
      {
        id: 'signal-correlation-learn-more',
        label: 'Learn more',
        variant: 'link',
        href: 'https://docs.redhat.com/en/documentation/red_hat_openshift_cluster_observability_operator/1-latest/html/ui_plugins_for_red_hat_openshift_cluster_observability_operator/troubleshooting-ui-plugin',
        isExternal: true,
      },
    ],
  },

  // ─── Recommended: Health Analyzer ────────────────────────────────────────────
  {
    id: 'health-analyzer',
    title: 'Incident detection',
    subtitle: 'COO · Health Analyzer',
    status: {
      kind: 'available-addon',
      label: 'Available',
      color: 'grey',
      srText: 'Status: available',
    },
    summary:
      'Group alerts into incidents to reduce alert noise and integrate with AIOps platforms. When enabled, adds an Incidents tab under Observe → Alerts.',
    category: 'recommended',
    searchTerms: ['health analyzer', 'incidents', 'alerts', 'aiops', 'monitoring'],
    dependencies: [
      {
        id: 'monitoring-ui-health-feature',
        label: 'COO Monitoring UI Plugin CR (Health Analyzer feature)',
        state: 'missing',
      },
    ],
    actions: [
      {
        id: 'enable-health-analyzer',
        label: 'Enable',
        variant: 'secondary',
        href: '/k8s/ns/openshift-cluster-observability-operator/operators.coreos.com~v1alpha1~ClusterServiceVersion',
        helperText:
          'Enables the Health Analyzer feature in the COO Monitoring UI Plugin CR. This adds the Incidents tab under Observe → Alerts.',
      },
      {
        id: 'health-analyzer-learn-more',
        label: 'Learn more',
        variant: 'link',
        href: 'https://docs.redhat.com/en/documentation/red_hat_openshift_cluster_observability_operator/1-latest/html/ui_plugins_for_red_hat_openshift_cluster_observability_operator/monitoring-ui-plugin#coo-incident-detection-overview_monitoring-ui-plugin',
        isExternal: true,
      },
    ],
  },

  // ─── Installed: Network Observability ───────────────────────────────────────
  {
    id: 'network-observability',
    title: 'Network observability',
    status: {
      kind: 'available-addon',
      label: 'Available',
      color: 'grey',
      srText: 'Status: available',
    },
    summary:
      'eBPF-based network flow collection, cross-namespace traffic mapping, and egress analysis.',
    category: 'installed',
    searchTerms: ['network', 'ebpf', 'flows', 'netobserv'],
    actions: [
      {
        id: 'install-network',
        label: 'Install',
        variant: 'secondary',
        href: '/k8s/ns/openshift-netobserv-operator/operators.coreos.com~v1alpha1~ClusterServiceVersion',
      },
      {
        id: 'network-learn-more',
        label: 'Learn more',
        variant: 'link',
        href: 'https://docs.redhat.com/en/documentation/openshift_container_platform/latest/html/network_observability/index',
        isExternal: true,
      },
    ],
  },
];

// ─── v2.0.0 Simulation Scenarios ─────────────────────────────────────────────
//
// Two static snapshots drive the Day 0 → Day 1 simulation in v2.0.0.
// Both use the original CapabilityCardData type + CapabilityCard component.
//
// Day 0: COO operator installed, but MonitoringStack CR not yet configured.
//        All installed capability deps show as `missing` with inline actions
//        (Configure / Enable / Install) positioned below each dep item.
//
// Day 1: COO MonitoringStack CR configured → Metrics & Alerting is ready.
//        Other capabilities remain partial or available, each dep carrying the
//        appropriate inline action to guide the next step.
//
// The `onDepAction('monitoring-stack-cr')` callback wired from the page
// triggers the Day 0 → Day 1 transition when "Configure" is clicked.
// ─────────────────────────────────────────────────────────────────────────────

const COO_CR_PATH =
  '/k8s/ns/openshift-cluster-observability-operator/operators.coreos.com~v1alpha1~ClusterServiceVersion';

// ── Day 0: COO installed, no CRs configured ───────────────────────────────────

// ── Shared OperatorHub URL for COO ────────────────────────────────────────────
// COO dep shared across all cards that require it.
// Clicking "Install" in any card fires onDepAction('coo-operator') which
// advances the simulation from Day 0 → Day 1.
const COO_DEP = {
  id: 'coo-operator',
  label: 'Cluster Observability Operator',
  state: 'missing' as const,
  category: 'OPERATOR' as const,
  action: { label: 'Install', href: '/catalog/ns/default?keyword=cluster-observability-operator' },
};

export const CAPABILITY_CARDS_V2_DAY0: CapabilityCardData[] = [
  // ── Installed ────────────────────────────────────────────────────────────────
  {
    id: 'metrics-alerting',
    title: 'Monitoring',
    subtitle: 'COO · MonitoringStack',
    status: { kind: 'configuration-required', label: 'Available', color: 'grey', srText: 'Status: available — COO not installed' },
    summary: 'Core metrics collection and alerting powered by Prometheus and Alertmanager. Available under Observe → Metrics and Observe → Alerting.',
    category: 'installed',
    searchTerms: ['prometheus', 'alertmanager', 'metrics', 'alerting', 'monitoringstack'],
    dependencies: [
      COO_DEP,
      { id: 'monitoring-stack-cr', label: 'COO MonitoringStack CR', state: 'missing', category: 'CONFIGURATION' as const },
      { id: 'prometheus',          label: 'Prometheus',             state: 'missing', category: 'OPERATOR' as const },
      { id: 'alertmanager',        label: 'Alertmanager',           state: 'missing', category: 'OPERATOR' as const },
    ],
    actions: [
      { id: 'metrics-learn-more', label: 'Learn more', variant: 'link', href: 'https://docs.redhat.com/en/documentation/red_hat_openshift_cluster_observability_operator/1-latest/html/ui_plugins_for_red_hat_openshift_cluster_observability_operator/monitoring-ui-plugin', isExternal: true },
    ],
  },
  {
    id: 'logs',
    title: 'Logging',
    subtitle: 'COO · Loki · CLO',
    status: { kind: 'configuration-required', label: 'Available', color: 'grey', srText: 'Status: available — COO not installed' },
    summary: 'Execute log-based queries for application, infrastructure, and audit logs. Available under Observe → Logs once all dependencies are configured.',
    category: 'installed',
    searchTerms: ['loki', 'clo', 'logs', 'logging', 'clusterlogforwarder', 'lokistack'],
    dependencies: [
      COO_DEP,
      { id: 'loki-lokistack', label: 'Loki Operator + LokiStack', state: 'missing', category: 'OPERATOR' as const },
      { id: 'clo-clf',        label: 'CLO + ClusterLogForwarder', state: 'missing', category: 'OPERATOR' as const },
      { id: 'logging-ui-cr',  label: 'COO Logging UI Plugin CR',  state: 'missing', category: 'CONFIGURATION' as const },
    ],
    actions: [
      { id: 'logs-learn-more', label: 'Learn more', variant: 'link', href: 'https://docs.redhat.com/en/documentation/red_hat_openshift_cluster_observability_operator/1-latest/html/ui_plugins_for_red_hat_openshift_cluster_observability_operator/logging-ui-plugin', isExternal: true },
    ],
  },
  {
    id: 'distributed-tracing',
    title: 'Distributed tracing',
    subtitle: 'COO · Tempo · OpenTelemetry',
    status: { kind: 'configuration-required', label: 'Available', color: 'grey', srText: 'Status: available — COO not installed' },
    summary: 'Explore distributed traces and spans for microservice request analysis and latency detection. Available under Observe → Traces once all dependencies are configured.',
    category: 'installed',
    searchTerms: ['tempo', 'opentelemetry', 'otel', 'tracing', 'traces', 'tempostack', 'otelcollector'],
    dependencies: [
      COO_DEP,
      { id: 'tempo-tempostack', label: 'Tempo Operator + TempoStack',          state: 'missing', category: 'OPERATOR' as const },
      { id: 'otel-collector',   label: 'OTEL Operator + OTELCollector',        state: 'missing', category: 'OPERATOR' as const },
      { id: 'tracing-ui-cr',    label: 'COO Distributed Tracing UI Plugin CR', state: 'missing', category: 'CONFIGURATION' as const },
    ],
    actions: [
      { id: 'tracing-learn-more', label: 'Learn more', variant: 'link', href: 'https://docs.redhat.com/en/documentation/red_hat_openshift_cluster_observability_operator/1-latest/html/ui_plugins_for_red_hat_openshift_cluster_observability_operator/distributed-tracing-ui-plugin', isExternal: true },
    ],
  },
  {
    id: 'customizable-dashboards',
    title: 'Dashboards',
    subtitle: 'COO · Perses',
    status: { kind: 'configuration-required', label: 'Available', color: 'grey', srText: 'Status: available — COO not installed' },
    summary: 'Create and manage customizable Perses dashboards. Available under Observe → Dashboards (Perses) once the UI plugin is enabled.',
    category: 'installed',
    searchTerms: ['perses', 'dashboards', 'monitoring', 'ui plugin'],
    dependencies: [
      COO_DEP,
      { id: 'perses-backend',          label: 'Perses backend',                               state: 'missing', category: 'OPERATOR' as const },
      { id: 'monitoring-frontend',     label: 'Monitoring frontend',                          state: 'missing', category: 'OPERATOR' as const },
      { id: 'monitoring-ui-plugin-cr', label: 'COO Monitoring UI Plugin CR (Perses feature)', state: 'missing', category: 'CONFIGURATION' as const },
    ],
    actions: [
      { id: 'dashboards-learn-more', label: 'Learn more', variant: 'link', href: 'https://docs.redhat.com/en/documentation/red_hat_openshift_cluster_observability_operator/1-latest/html/ui_plugins_for_red_hat_openshift_cluster_observability_operator/perses-dashboard', isExternal: true },
    ],
  },
  {
    id: 'signal-correlation',
    title: 'Signal Correlation',
    subtitle: 'COO · Korrel8r',
    status: { kind: 'available-addon', label: 'Available', color: 'grey', srText: 'Status: available — COO not installed' },
    summary: 'Execute correlation queries across metrics, logs, traces, and alerts. Accessible from the OCP web console header once the troubleshooting panel plugin is enabled.',
    category: 'recommended',
    searchTerms: ['korrel8r', 'correlation', 'troubleshooting', 'signals'],
    dependencies: [
      COO_DEP,
      { id: 'troubleshooting-panel-cr', label: 'COO Troubleshooting Panel UI Plugin CR', state: 'missing', category: 'CONFIGURATION' as const },
    ],
    actions: [
      { id: 'signal-correlation-learn-more', label: 'Learn more', variant: 'link', href: 'https://docs.redhat.com/en/documentation/red_hat_openshift_cluster_observability_operator/1-latest/html/ui_plugins_for_red_hat_openshift_cluster_observability_operator/troubleshooting-ui-plugin', isExternal: true },
    ],
  },
  {
    id: 'health-analyzer',
    title: 'Incident detection',
    subtitle: 'COO · Health Analyzer',
    status: { kind: 'available-addon', label: 'Available', color: 'grey', srText: 'Status: available — COO not installed' },
    summary: 'Group alerts into incidents to reduce noise and integrate with AIOps platforms. Adds an Incidents tab under Observe → Alerts once enabled.',
    category: 'recommended',
    searchTerms: ['health analyzer', 'incidents', 'alerts', 'aiops'],
    dependencies: [
      COO_DEP,
      { id: 'monitoring-ui-health-feature', label: 'COO Monitoring UI Plugin CR (Health Analyzer feature)', state: 'missing', category: 'CONFIGURATION' as const },
    ],
    actions: [
      { id: 'health-analyzer-learn-more', label: 'Learn more', variant: 'link', href: 'https://docs.redhat.com/en/documentation/red_hat_openshift_cluster_observability_operator/1-latest/html/ui_plugins_for_red_hat_openshift_cluster_observability_operator/monitoring-ui-plugin#coo-incident-detection-overview_monitoring-ui-plugin', isExternal: true },
    ],
  },
  {
    id: 'network-observability',
    title: 'Network observability',
    status: { kind: 'available-addon', label: 'Available', color: 'grey', srText: 'Status: available — operator not installed' },
    summary: 'eBPF-based network flow collection, cross-namespace traffic mapping, and egress analysis.',
    category: 'installed',
    searchTerms: ['network', 'ebpf', 'flows', 'netobserv'],
    dependencies: [
      { id: 'netobserv-operator', label: 'Network Observability Operator', state: 'missing', category: 'OPERATOR' as const, action: { label: 'Install', href: '/catalog/ns/default?keyword=network-observability' } },
    ],
    actions: [
      { id: 'network-learn-more', label: 'Learn more', variant: 'link', href: 'https://docs.redhat.com/en/documentation/openshift_container_platform/latest/html/network_observability/index', isExternal: true },
    ],
  },
];

// ── Day 1: COO MonitoringStack configured — Metrics & Alerting is active ──────
// Other capabilities retain their partial / available state with richer dep actions.

// COO dep shared across all Day 1 cards that depend on it — installed and healthy.
const COO_READY_DEP = {
  id: 'coo-operator',
  label: 'Cluster Observability Operator',
  state: 'ready' as const,
  category: 'OPERATOR' as const,
};

export const CAPABILITY_CARDS_V2_DAY1: CapabilityCardData[] = [
  // ── Installed: Partial setup first (action needed), then Ready ────────────────
  {
    id: 'customizable-dashboards',
    title: 'Dashboards',
    subtitle: 'COO · Perses',
    status: { kind: 'configuration-required', label: 'Partial setup', color: 'grey', srText: 'Status: partial setup — Perses feature not enabled' },
    summary: 'Create and manage customizable Perses dashboards. Available under Observe → Dashboards (Perses).',
    category: 'installed',
    searchTerms: ['perses', 'dashboards', 'monitoring', 'ui plugin'],
    dependencies: [
      COO_READY_DEP,
      { id: 'perses-backend',          label: 'Perses backend',                               state: 'ready',     category: 'OPERATOR' as const },
      { id: 'monitoring-frontend',     label: 'Monitoring frontend',                          state: 'ready',     category: 'OPERATOR' as const },
      { id: 'monitoring-ui-plugin-cr', label: 'COO Monitoring UI Plugin CR (Perses feature)', state: 'attention', category: 'CONFIGURATION' as const, detail: 'Disabled in COO CR', action: { label: 'Enable', href: COO_CR_PATH } },
    ],
    actions: [
      { id: 'dashboards-learn-more', label: 'Learn more', variant: 'link', href: 'https://docs.redhat.com/en/documentation/red_hat_openshift_cluster_observability_operator/1-latest/html/ui_plugins_for_red_hat_openshift_cluster_observability_operator/perses-dashboard', isExternal: true },
    ],
  },
  {
    id: 'logs',
    title: 'Logging',
    subtitle: 'COO · Loki · CLO',
    status: { kind: 'configuration-required', label: 'Partial setup', color: 'grey', srText: 'Status: partial setup — storage and UI plugin not configured' },
    summary: 'Execute log-based queries for application, infrastructure, and audit logs. Available under Observe → Logs once storage and the UI plugin are configured.',
    category: 'installed',
    searchTerms: ['loki', 'clo', 'logs', 'logging', 'clusterlogforwarder', 'lokistack'],
    dependencies: [
      COO_READY_DEP,
      { id: 'loki-lokistack', label: 'Loki Operator + LokiStack', state: 'ready', category: 'OPERATOR' as const },
      { id: 'clo-clf',        label: 'CLO + ClusterLogForwarder', state: 'ready', category: 'OPERATOR' as const },
      { id: 'loki-object-storage-secret', label: 'Object storage secret (S3 / Azure / GCP)', state: 'missing',   category: 'CONFIGURATION' as const, detail: 'Secret containing object store credentials required for LokiStack',     action: { label: 'Configure', href: '/k8s/ns/openshift-logging/secrets/~new' } },
      { id: 'lokistack-cr',               label: 'LokiStack CR',                              state: 'missing',   category: 'CONFIGURATION' as const, detail: 'Defines storage size, retention, and replication',                      action: { label: 'Configure', href: '/k8s/ns/openshift-logging/loki.grafana.com~v1beta1~LokiStack/~new' } },
      { id: 'logging-ui-cr',              label: 'COO Logging UI Plugin CR',                  state: 'attention', category: 'CONFIGURATION' as const, detail: 'Disabled in COO CR',                                                    action: { label: 'Enable',     href: COO_CR_PATH } },
    ],
    actions: [
      { id: 'logs-learn-more', label: 'Learn more', variant: 'link', href: 'https://docs.redhat.com/en/documentation/red_hat_openshift_cluster_observability_operator/1-latest/html/ui_plugins_for_red_hat_openshift_cluster_observability_operator/logging-ui-plugin', isExternal: true },
    ],
  },
  {
    id: 'network-observability',
    title: 'Network observability',
    subtitle: 'COO · NetObserv',
    status: { kind: 'configuration-required', label: 'Partial setup', color: 'grey', srText: 'Status: partial setup — FlowCollector and UI plugin not configured' },
    summary: 'eBPF-based network flow collection, cross-namespace traffic mapping, and egress bottleneck analysis. Available under Observe → Network Traffic once configured.',
    category: 'installed',
    searchTerms: ['network', 'ebpf', 'flows', 'netobserv', 'flowcollector'],
    dependencies: [
      COO_READY_DEP,
      { id: 'netobserv-operator', label: 'Network Observability Operator', state: 'ready', category: 'OPERATOR' as const },
      { id: 'flowcollector-cr',      label: 'FlowCollector CR',                        state: 'missing', category: 'CONFIGURATION' as const, detail: 'Configures eBPF sampling, Loki storage binding, and console display',   action: { label: 'Configure', href: '/k8s/cluster/flows.netobserv.io~v1beta2~FlowCollector/~new' } },
      { id: 'netobserv-plugin-cr',   label: 'Network Observability UI Plugin CR',  state: 'missing', category: 'CONFIGURATION' as const, detail: 'Integrates flow visualization into Observe → Network Traffic',          action: { label: 'Enable',    href: COO_CR_PATH } },
    ],
    actions: [
      { id: 'network-learn-more', label: 'Learn more', variant: 'link', href: 'https://docs.redhat.com/en/documentation/openshift_container_platform/latest/html/network_observability/index', isExternal: true },
    ],
  },
  {
    id: 'distributed-tracing',
    title: 'Distributed tracing',
    subtitle: 'COO · Tempo · OpenTelemetry',
    status: { kind: 'fully-enabled', label: 'Ready', color: 'green', srText: 'Status: ready' },
    summary: 'Explore distributed traces and spans for microservice request analysis and latency detection. Available under Observe → Traces.',
    category: 'installed',
    searchTerms: ['tempo', 'opentelemetry', 'otel', 'tracing', 'traces', 'tempostack', 'otelcollector'],
    runtimeHealth: 'DEGRADED',
    dependencies: [
      COO_READY_DEP,
      { id: 'tempo-tempostack', label: 'Tempo Operator + TempoStack',          state: 'ready',    category: 'OPERATOR' as const },
      { id: 'otel-collector',   label: 'OTEL Operator + OTELCollector',        state: 'degraded', category: 'OPERATOR' as const, detail: 'OTELCollector: Container CrashLoopBackOff', action: { label: 'View OTELCollector', href: COO_CR_PATH } },
      { id: 'tracing-ui-cr',    label: 'COO Distributed Tracing UI Plugin CR', state: 'ready',    category: 'CONFIGURATION' as const },
    ],
    actions: [
      { id: 'tracing-learn-more', label: 'Learn more', variant: 'link', href: 'https://docs.redhat.com/en/documentation/red_hat_openshift_cluster_observability_operator/1-latest/html/ui_plugins_for_red_hat_openshift_cluster_observability_operator/distributed-tracing-ui-plugin', isExternal: true },
    ],
  },
  {
    id: 'metrics-alerting',
    title: 'Monitoring',
    subtitle: 'COO · MonitoringStack',
    status: { kind: 'fully-enabled', label: 'Ready', color: 'green', srText: 'Status: ready' },
    summary: 'Core metrics collection and alerting powered by Prometheus and Alertmanager. Available under Observe → Metrics and Observe → Alerting.',
    category: 'installed',
    searchTerms: ['prometheus', 'alertmanager', 'metrics', 'alerting', 'monitoringstack'],
    dependencies: [
      COO_READY_DEP,
      { id: 'prometheus',          label: 'Prometheus',             state: 'ready', category: 'OPERATOR' as const },
      { id: 'alertmanager',        label: 'Alertmanager',           state: 'ready', category: 'OPERATOR' as const },
      { id: 'monitoring-stack-cr', label: 'COO MonitoringStack CR', state: 'ready', category: 'CONFIGURATION' as const },
    ],
    actions: [
      { id: 'metrics-learn-more', label: 'Learn more', variant: 'link', href: 'https://docs.redhat.com/en/documentation/red_hat_openshift_cluster_observability_operator/1-latest/html/ui_plugins_for_red_hat_openshift_cluster_observability_operator/monitoring-ui-plugin', isExternal: true },
    ],
  },
  // ── Additional capabilities ───────────────────────────────────────────────────
  {
    id: 'signal-correlation',
    title: 'Signal Correlation',
    subtitle: 'COO · Korrel8r',
    status: { kind: 'available-addon', label: 'Available', color: 'grey', srText: 'Status: available — Troubleshooting Panel CR not enabled' },
    summary: 'Execute correlation queries across metrics, logs, traces, and alerts. Accessible from the OCP web console header.',
    category: 'recommended',
    searchTerms: ['korrel8r', 'correlation', 'troubleshooting', 'signals'],
    dependencies: [
      COO_READY_DEP,
      { id: 'troubleshooting-panel-cr', label: 'COO Troubleshooting Panel UI Plugin CR', state: 'missing', category: 'CONFIGURATION' as const, action: { label: 'Enable', href: COO_CR_PATH } },
    ],
    actions: [
      { id: 'signal-correlation-learn-more', label: 'Learn more', variant: 'link', href: 'https://docs.redhat.com/en/documentation/red_hat_openshift_cluster_observability_operator/1-latest/html/ui_plugins_for_red_hat_openshift_cluster_observability_operator/troubleshooting-ui-plugin', isExternal: true },
    ],
  },
  {
    id: 'health-analyzer',
    title: 'Incident detection',
    subtitle: 'COO · Health Analyzer',
    status: { kind: 'available-addon', label: 'Available', color: 'grey', srText: 'Status: available — Health Analyzer feature not enabled' },
    summary: 'Group alerts into incidents to reduce noise and integrate with AIOps platforms.',
    category: 'recommended',
    searchTerms: ['health analyzer', 'incidents', 'alerts', 'aiops'],
    dependencies: [
      COO_READY_DEP,
      { id: 'monitoring-ui-health-feature', label: 'COO Monitoring UI Plugin CR (Health Analyzer feature)', state: 'missing', category: 'CONFIGURATION' as const, action: { label: 'Enable', href: COO_CR_PATH } },
    ],
    actions: [
      { id: 'health-analyzer-learn-more', label: 'Learn more', variant: 'link', href: 'https://docs.redhat.com/en/documentation/red_hat_openshift_cluster_observability_operator/1-latest/html/ui_plugins_for_red_hat_openshift_cluster_observability_operator/monitoring-ui-plugin#coo-incident-detection-overview_monitoring-ui-plugin', isExternal: true },
    ],
  },
];

// Silence unused-variable lint for the path constant shared across v2 card data
void COO_CR_PATH;

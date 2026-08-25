import type {
  CapabilityCardData,
  KpiPopoverItem,
  OperationalKpiStat,
  V2CapabilityCard,
} from './types';

/**
 * 4-card operational KPI ribbon for the Observability services page.
 *
 * Values are illustrative mocks scoped to operator/dependency readiness —
 * not raw cluster telemetry. Replace with live API calls in production.
 */
export const OPERATIONAL_KPI_STATS: OperationalKpiStat[] = [
  {
    id: 'capabilities-ready',
    category: 'Capabilities ready',
    value: '1/7',
    label: 'Ready',
    subtext: '6 pending setup',
    variant: 'warning',
    popoverItems: [
      { id: 'pop-metrics-alerting',      title: 'Metrics & Alerting',   state: 'ready' },
      { id: 'pop-dashboards',            title: 'Dashboards',           state: 'partial-setup' },
      { id: 'pop-logs',                  title: 'Logs',                 state: 'partial-setup' },
      { id: 'pop-distributed-tracing',   title: 'Distributed tracing',  state: 'partial-setup' },
      { id: 'pop-signal-correlation',    title: 'Signal Correlation',   state: 'not-installed' },
      { id: 'pop-incident-detection',    title: 'Incident detection',   state: 'not-installed' },
      { id: 'pop-network-observability', title: 'Network observability', state: 'not-installed' },
    ] as KpiPopoverItem[],
  },
  {
    id: 'operator-health',
    category: 'Operator health',
    value: '0',
    label: 'Degraded',
    subtext: 'All operators healthy',
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

  // ─── Recommended: Network Observability ──────────────────────────────────────
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
    category: 'recommended',
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

// ─── v2.0.0 Day-0 Capability Cards ───────────────────────────────────────────
//
// Scenario: COO is freshly installed. MonitoringStack is running. All other
// operators and CRs are pending installation or enablement.
// Each V2DependencyItem drives one of 4 lifecycle states:
//   ready            → green label
//   disabled-cr      → Enable link button (mock CR creation)
//   missing-operator → Install link button → external OperatorHub
//   blocked          → grey "Prerequisite required" label (upstream dep absent)
// ─────────────────────────────────────────────────────────────────────────────

const COO_OPERATOR_HUB_URL =
  '/catalog/ns/default?keyword=cluster+observability+operator';

export const CAPABILITY_CARDS_V2: V2CapabilityCard[] = [
  // ── Installed: Metrics & Alerting ──────────────────────────────────────────
  {
    id: 'metrics-alerting',
    title: 'Metrics & Alerting',
    subtitle: 'COO · MonitoringStack',
    description:
      'Core metrics collection and alerting powered by Prometheus and Alertmanager. Available under Observe → Metrics and Observe → Alerting.',
    category: 'installed',
    dependencies: [
      { id: 'monitoring-stack-cr',  label: 'COO MonitoringStack CR', state: 'ready', readyLabel: 'Enabled' },
      { id: 'prometheus',           label: 'Prometheus',             state: 'ready', readyLabel: 'Running' },
      { id: 'alertmanager',         label: 'Alertmanager',           state: 'ready', readyLabel: 'Running' },
    ],
    learnMoreHref:
      'https://docs.redhat.com/en/documentation/red_hat_openshift_cluster_observability_operator/1-latest/html/ui_plugins_for_red_hat_openshift_cluster_observability_operator/monitoring-ui-plugin',
  },

  // ── Installed: Dashboards (Perses) ─────────────────────────────────────────
  {
    id: 'dashboards',
    title: 'Dashboards',
    subtitle: 'COO · Perses',
    description:
      'Create and manage customizable Perses dashboards. Available under Observe → Dashboards (Perses) once the UI plugin is enabled.',
    category: 'installed',
    dependencies: [
      {
        id: 'perses-ui-plugin-cr',
        label: 'COO Monitoring UI Plugin CR (Perses feature)',
        state: 'disabled-cr',
        crActionLabel: 'Enable',
      },
      { id: 'perses-backend', label: 'Perses backend',       state: 'blocked' },
      { id: 'monitoring-frontend', label: 'Monitoring frontend', state: 'blocked' },
    ],
    learnMoreHref:
      'https://docs.redhat.com/en/documentation/red_hat_openshift_cluster_observability_operator/1-latest/html/ui_plugins_for_red_hat_openshift_cluster_observability_operator/perses-dashboard',
  },

  // ── Installed: Logs ────────────────────────────────────────────────────────
  {
    id: 'logs',
    title: 'Logs',
    subtitle: 'COO · Loki · CLO',
    description:
      'Execute log-based queries for application, infrastructure, and audit logs. Available under Observe → Logs once all dependencies are installed.',
    category: 'installed',
    dependencies: [
      {
        id: 'logging-ui-plugin-cr',
        label: 'COO Logging UI Plugin CR',
        state: 'disabled-cr',
        crActionLabel: 'Enable',
      },
      {
        id: 'loki-operator',
        label: 'Loki Operator',
        state: 'missing-operator',
        operatorHubUrl: '/catalog/ns/default?keyword=loki-operator',
      },
      { id: 'loki-stack-cr', label: 'LokiStack CR',            state: 'blocked' },
      {
        id: 'clo',
        label: 'Cluster Logging Operator (CLO)',
        state: 'missing-operator',
        operatorHubUrl: '/catalog/ns/default?keyword=cluster-logging',
      },
      { id: 'clf-cr', label: 'ClusterLogForwarder CR', state: 'blocked' },
    ],
    learnMoreHref:
      'https://docs.redhat.com/en/documentation/red_hat_openshift_cluster_observability_operator/1-latest/html/ui_plugins_for_red_hat_openshift_cluster_observability_operator/logging-ui-plugin',
  },

  // ── Installed: Distributed Tracing ─────────────────────────────────────────
  {
    id: 'distributed-tracing',
    title: 'Distributed tracing',
    subtitle: 'COO · Tempo · OpenTelemetry',
    description:
      'Explore distributed traces and spans for microservice request analysis and latency detection. Available under Observe → Traces once all dependencies are installed.',
    category: 'installed',
    dependencies: [
      {
        id: 'tracing-ui-plugin-cr',
        label: 'COO Distributed Tracing UI Plugin CR',
        state: 'disabled-cr',
        crActionLabel: 'Enable',
      },
      {
        id: 'tempo-operator',
        label: 'Tempo Operator',
        state: 'missing-operator',
        operatorHubUrl: '/catalog/ns/default?keyword=tempo-operator',
      },
      { id: 'tempo-stack-cr', label: 'TempoStack CR', state: 'blocked' },
      {
        id: 'otel-operator',
        label: 'OpenTelemetry Operator',
        state: 'missing-operator',
        operatorHubUrl: '/catalog/ns/default?keyword=opentelemetry-operator',
      },
      { id: 'otel-collector-cr', label: 'OTELCollector CR', state: 'blocked' },
    ],
    learnMoreHref:
      'https://docs.redhat.com/en/documentation/red_hat_openshift_cluster_observability_operator/1-latest/html/ui_plugins_for_red_hat_openshift_cluster_observability_operator/distributed-tracing-ui-plugin',
  },

  // ── Recommended: Signal Correlation ────────────────────────────────────────
  {
    id: 'signal-correlation',
    title: 'Signal Correlation',
    subtitle: 'COO · Korrel8r',
    description:
      'Execute correlation queries across metrics, logs, traces, and alerts. Accessible from the OCP web console header once the troubleshooting panel plugin is enabled.',
    category: 'recommended',
    dependencies: [
      {
        id: 'troubleshooting-panel-cr',
        label: 'COO Troubleshooting Panel UI Plugin CR',
        state: 'disabled-cr',
        crActionLabel: 'Enable',
      },
    ],
    learnMoreHref:
      'https://docs.redhat.com/en/documentation/red_hat_openshift_cluster_observability_operator/1-latest/html/ui_plugins_for_red_hat_openshift_cluster_observability_operator/troubleshooting-ui-plugin',
  },

  // ── Recommended: Incident Detection ────────────────────────────────────────
  {
    id: 'incident-detection',
    title: 'Incident detection',
    subtitle: 'COO · Health Analyzer',
    description:
      'Group alerts into incidents to reduce noise and integrate with AIOps platforms. Adds an Incidents tab under Observe → Alerts once enabled.',
    category: 'recommended',
    dependencies: [
      {
        id: 'health-analyzer-feature',
        label: 'COO Monitoring UI Plugin CR (Health Analyzer feature)',
        state: 'disabled-cr',
        crActionLabel: 'Enable',
      },
    ],
    learnMoreHref:
      'https://docs.redhat.com/en/documentation/red_hat_openshift_cluster_observability_operator/1-latest/html/ui_plugins_for_red_hat_openshift_cluster_observability_operator/monitoring-ui-plugin#coo-incident-detection-overview_monitoring-ui-plugin',
  },

  // ── Recommended: Network Observability ─────────────────────────────────────
  {
    id: 'network-observability',
    title: 'Network observability',
    subtitle: 'Network Observability Operator',
    description:
      'eBPF-based network flow collection, cross-namespace traffic mapping, and egress analysis.',
    category: 'recommended',
    dependencies: [
      {
        id: 'netobserv-operator',
        label: 'Network Observability Operator',
        state: 'missing-operator',
        operatorHubUrl: '/catalog/ns/default?keyword=network-observability',
      },
      { id: 'flow-collector-cr', label: 'FlowCollector CR', state: 'blocked' },
    ],
    learnMoreHref:
      'https://docs.redhat.com/en/documentation/openshift_container_platform/latest/html/network_observability/index',
  },
];

// Silence unused-variable lint for the COO URL constant used in v2 card data
void COO_OPERATOR_HUB_URL;

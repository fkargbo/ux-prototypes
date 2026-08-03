import type { CapabilityCardData, StackSummaryStat } from './types';

/**
 * Illustrative inventory for Post–Cluster Observability Operator install mode.
 * Values reflect capability surface area / configured inventory — not live health.
 */
export const STACK_SUMMARY_STATS: StackSummaryStat[] = [
  {
    id: 'global-dashboards',
    label: 'Perses Dashboards',
    value: 12,
    href: '/core/observe/dashboards',
    description: 'Cluster-wide Perses dashboards available in this hub',
  },
  {
    id: 'project-dashboards',
    label: 'Perses Data Sources',
    value: 28,
    href: '/core/observe/dashboards',
    description: 'Namespace-scoped dashboards available to projects',
  },
  {
    id: 'alerting-rules',
    label: 'Alerting rules',
    value: 64,
    href: '/core/observe/alerting',
    description: 'Configured alerting rules in the observability stack',
  },
  {
    id: 'firing-alerts',
    label: 'Firing alerts',
    value: 7,
    href: '/core/observe/alerting',
    description: 'Currently firing alerts (navigate to Alerting for triage)',
  },
  {
    id: 'active-targets',
    label: 'Targets',
    value: 142,
    href: '/core/observe/targets',
    description: 'Scrape targets registered with the metrics stack',
  },
  {
    id: 'unique-metrics',
    label: 'Metrics',
    value: 1840,
    href: '/core/observe/metrics',
    description: 'Unique metric names exposed by the stack',
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
      label: 'Fully enabled',
      color: 'green',
      srText: 'Status: fully enabled',
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
        href: 'https://docs.redhat.com/en/documentation/cluster_observability_operator/latest/html/monitoring_overview/index',
        isExternal: true,
      },
    ],
  },

  // ─── Installed: Customizable Dashboards ─────────────────────────────────────
  {
    id: 'customizable-dashboards',
    title: 'Customizable Dashboards',
    subtitle: 'COO · Perses',
    status: {
      kind: 'fully-enabled',
      label: 'Fully enabled',
      color: 'green',
      srText: 'Status: fully enabled',
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
        href: 'https://docs.redhat.com/en/documentation/cluster_observability_operator/latest/html/monitoring_overview/index',
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
      color: 'yellow',
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
        label: 'Enable logging plugin',
        variant: 'secondary',
        href: '/core/observe/observability-services#enable-logging-plugin',
        helperText:
          'Enables the Logging UI Plugin CR in COO. After enabling, complete Step 2 in the COO configuration to finish setup.',
      },
      {
        id: 'logs-learn-more',
        label: 'Learn more',
        variant: 'link',
        href: 'https://docs.redhat.com/en/documentation/openshift_container_platform/latest/html/logging/',
        isExternal: true,
      },
    ],
  },

  // ─── Installed: Distributed Tracing ─────────────────────────────────────────
  {
    id: 'distributed-tracing',
    title: 'Distributed Tracing',
    subtitle: 'COO · Tempo · OpenTelemetry',
    status: {
      kind: 'fully-enabled',
      label: 'Fully enabled',
      color: 'green',
      srText: 'Status: fully enabled',
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
      { id: 'otel-collector', label: 'OTEL Operator + OTELCollector', state: 'ready' },
    ],
    // All dependencies ready, status fully enabled — no install action.
    actions: [
      {
        id: 'tracing-learn-more',
        label: 'Learn more',
        variant: 'link',
        href: 'https://docs.redhat.com/en/documentation/red_hat_build_of_opentelemetry/latest/html/distributed_tracing/index',
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
      label: 'Not installed',
      color: 'grey',
      srText: 'Status: not installed',
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
        label: 'Install',
        variant: 'secondary',
        href: '/k8s/ns/openshift-cluster-observability-operator/operators.coreos.com~v1alpha1~ClusterServiceVersion',
        helperText:
          'Creates the Troubleshooting Panel UI Plugin CR in COO. The Korrel8r backend is deployed automatically as part of this configuration.',
      },
      {
        id: 'signal-correlation-learn-more',
        label: 'Learn more',
        variant: 'link',
        href: 'https://docs.redhat.com/en/documentation/cluster_observability_operator/latest/html/using_the_correlation_signals_ui_plugin/index',
        isExternal: true,
      },
    ],
  },

  // ─── Recommended: Health Analyzer ────────────────────────────────────────────
  {
    id: 'health-analyzer',
    title: 'Health Analyzer',
    subtitle: 'COO · Incidents',
    status: {
      kind: 'available-addon',
      label: 'Not installed',
      color: 'grey',
      srText: 'Status: not installed',
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
        label: 'Install',
        variant: 'secondary',
        href: '/k8s/ns/openshift-cluster-observability-operator/operators.coreos.com~v1alpha1~ClusterServiceVersion',
        helperText:
          'Enables the Health Analyzer feature in the COO Monitoring UI Plugin CR. This adds the Incidents tab under Observe → Alerts.',
      },
      {
        id: 'health-analyzer-learn-more',
        label: 'Learn more',
        variant: 'link',
        href: 'https://docs.redhat.com/en/documentation/cluster_observability_operator/latest/html/using_the_troubleshooting_ui_plugin/index',
        isExternal: true,
      },
    ],
  },

  // ─── Recommended: Network Observability ──────────────────────────────────────
  {
    id: 'network-observability',
    title: 'Network Observability',
    status: {
      kind: 'available-addon',
      label: 'Not Installed',
      color: 'grey',
      srText: 'Status: available add-on — not installed',
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
        helperText:
          'You will be redirected to OperatorHub. After installation, return here and complete Step 2 to finish configuration.',
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

import type { CapabilityCardData, StackSummaryStat } from './types';

/**
 * Illustrative inventory for Post–Cluster Observability Operator install mode.
 * Values reflect capability surface area / configured inventory — not live health.
 */
export const STACK_SUMMARY_STATS: StackSummaryStat[] = [
  {
    id: 'global-dashboards',
    label: 'Global-scoped Dashboards (Perses)',
    value: 12,
    href: '/core/observe/dashboards',
    description: 'Cluster-wide Perses dashboards available in this hub',
  },
  {
    id: 'project-dashboards',
    label: 'Project-scoped Dashboards',
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
    label: 'Active Targets',
    value: 142,
    href: '/core/observe/targets',
    description: 'Scrape targets registered with the metrics stack',
  },
  {
    id: 'unique-metrics',
    label: 'Unique Metrics',
    value: 1840,
    href: '/core/observe/metrics',
    description: 'Unique metric names exposed by the stack',
  },
];

export const CAPABILITY_CARDS: CapabilityCardData[] = [
  {
    id: 'core-observability',
    title: 'Core Observability',
    subtitle: 'Prometheus & Perses',
    status: {
      kind: 'fully-enabled',
      label: 'Fully Enabled',
      color: 'green',
      srText: 'Status: fully enabled',
    },
    summary: 'Foundations for metrics, Alertmanager, and customizable Perses dashboards.',
    category: 'installed',
    searchTerms: ['prometheus', 'perses', 'metrics', 'alertmanager', 'dashboards', 'core'],
    actions: [
      {
        id: 'view-dashboards',
        label: 'View Dashboards',
        variant: 'primary',
        href: '/core/observe/dashboards',
      },
    ],
  },
  {
    id: 'centralized-logging',
    title: 'Centralized Logging',
    subtitle: 'Loki & Vector/Fluentd',
    status: {
      kind: 'configuration-required',
      label: 'UI Plugin Required',
      color: 'yellow',
      srText: 'Status: configuration required — UI plugin required',
    },
    summary:
      'Centralized log collection, storage, and querying for application, infrastructure, and audit logs.',
    category: 'installed',
    searchTerms: ['loki', 'vector', 'fluentd', 'logging', 'logs', 'ui plugin'],
    dependencies: [
      { id: 'loki-operator', label: 'Loki Operator (LokiStack DB)', state: 'ready' },
      { id: 'clo', label: 'Cluster Logging Operator (Vector/Fluentd)', state: 'ready' },
      {
        id: 'logging-ui',
        label: 'Logging UI Plugin',
        state: 'attention',
        detail: 'Disabled in COO CR',
      },
    ],
    actions: [
      {
        id: 'enable-logging-ui',
        label: 'Enable Logging UI Plugin',
        variant: 'primary',
        href: '/core/observe/observability-services#enable-logging-ui',
        helperText:
          'After enabling the plugin, complete Step 2 in the Cluster Observability Operator configuration to finish setup.',
      },
      {
        id: 'logging-learn-more',
        label: 'Learn more',
        variant: 'link',
        href: 'https://docs.redhat.com/en/documentation/openshift_container_platform/latest/html/logging/',
        isExternal: true,
      },
    ],
  },
  {
    id: 'distributed-tracing',
    title: 'Distributed Tracing Platform',
    subtitle: 'Tempo & OpenTelemetry',
    status: {
      kind: 'fully-enabled',
      label: 'Fully Enabled',
      color: 'green',
      srText: 'Status: fully enabled',
    },
    summary: 'Microservice request tracing, latency bottleneck detection, and span analysis.',
    category: 'installed',
    searchTerms: ['tempo', 'opentelemetry', 'tracing', 'spans', 'otel'],
    dependencies: [
      { id: 'tempo', label: 'Red Hat build of Tempo Operator', state: 'ready' },
      { id: 'otel', label: 'Red Hat build of OpenTelemetry Operator', state: 'ready' },
      { id: 'tracing-ui', label: 'Distributed Tracing UI Plugin', state: 'ready' },
    ],
    actions: [
      {
        id: 'view-traces',
        label: 'View Traces',
        variant: 'secondary',
        href: '/core/observe/observability-services#traces',
      },
    ],
  },
  {
    id: 'korrel8r',
    title: 'Signal Correlation & Troubleshooting',
    subtitle: 'Korrel8r',
    status: {
      kind: 'available-addon',
      label: 'Not Installed',
      color: 'grey',
      srText: 'Status: available add-on — not installed',
    },
    summary: 'Dynamically links metrics, logs, traces, and alerts to accelerate root cause triage.',
    category: 'recommended',
    searchTerms: ['korrel8r', 'correlation', 'troubleshooting', 'signals'],
    actions: [
      {
        id: 'install-korrel8r',
        label: 'Install Korrel8r Operator',
        variant: 'secondary',
        href: '/k8s/ns/openshift-operators/operators.coreos.com~v1alpha1~ClusterServiceVersion',
        helperText:
          'You will be redirected to OperatorHub. After installation, return here and complete Step 2 to finish configuration.',
      },
    ],
  },
  {
    id: 'incident-detection',
    title: 'Incident Detection & Monitoring',
    subtitle: 'Health Analyzer',
    status: {
      kind: 'available-addon',
      label: 'Not Installed',
      color: 'grey',
      srText: 'Status: available add-on — not installed',
    },
    summary:
      'Group alerts into incidents and integrate with external AIOps platforms to reduce alert noise.',
    category: 'recommended',
    searchTerms: ['incident', 'health analyzer', 'aiops', 'alerts'],
    actions: [
      {
        id: 'enable-incident',
        label: 'Enable Incident Plugin',
        variant: 'secondary',
        href: '/core/observe/incidents',
        helperText:
          'Enabling the plugin opens Incident configuration. Complete Step 2 after the plugin is available.',
      },
    ],
  },
  {
    id: 'network-observability',
    title: 'Network Observability Operator',
    status: {
      kind: 'available-addon',
      label: 'Not Installed',
      color: 'grey',
      srText: 'Status: available add-on — not installed',
    },
    summary: 'eBPF-based network flow collection, cross-namespace traffic mapping, and egress analysis.',
    category: 'recommended',
    searchTerms: ['network', 'ebpf', 'flows', 'netobserv'],
    actions: [
      {
        id: 'install-network',
        label: 'Install Network Operator',
        variant: 'secondary',
        href: '/k8s/ns/openshift-netobserv-operator/operators.coreos.com~v1alpha1~ClusterServiceVersion',
        helperText:
          'You will be redirected to OperatorHub. After installation, return here and complete Step 2 to finish configuration.',
      },
    ],
  },
];

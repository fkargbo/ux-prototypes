import * as React from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import {
  PageSection,
  Title,
  Content,
  Card,
  CardTitle,
  CardBody,
  CardHeader,
  CardFooter,
  Flex,
  FlexItem,
  Icon,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  SearchInput,
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  MenuToggleElement,
  Button,
  Label,
  LabelGroup,
  Popover,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Divider,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  Badge,
  Stack,
  StackItem,
  Grid,
  GridItem,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  EmptyState,
  EmptyStateBody,
  EmptyStateActions,
  Tabs,
  Tab,
  TabTitleText,
  TabTitleIcon,
  Switch,
  Checkbox,
  Dropdown,
  DropdownList,
  DropdownItem,
  ToggleGroup,
  ToggleGroupItem,
  Pagination,
  Tooltip,
  Progress,
  ProgressSize,
  Split,
  SplitItem,
  Breadcrumb,
  BreadcrumbItem,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelContent,
  DrawerHead,
  DrawerActions,
  DrawerCloseButton,
  DrawerPanelBody,
  DataList,
  DataListItem,
  DataListItemRow,
  DataListCheck,
  DataListItemCells,
  DataListCell,
  DataListControl,
  DatePicker,
  TimePicker,
  Alert as PfAlert,
  AlertGroup as PfAlertGroup,
  AlertActionCloseButton,
  AlertVariant,
  CodeBlock,
  CodeBlockCode,
  ClipboardCopy,
  Accordion,
  AccordionItem,
  AccordionToggle,
  AccordionContent,
  Wizard,
  WizardStep,
  TextArea,
  Radio,
  FormGroup,
  Form,
  FormHelperText,
  HelperText,
  HelperTextItem,
  TextInput,
} from '@patternfly/react-core';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  ExpandableRowContent,
  InnerScrollContainer,
} from '@patternfly/react-table';
import {
  ChartDonut,
  ChartThemeColor,
  ChartArea,
  ChartGroup,
  ChartVoronoiContainer,
  ChartAxis,
  ChartBar,
  ChartStack,
  ChartLine,
  ChartScatter,
  ChartLegend,
  Chart,
} from '@patternfly/react-charts/victory';
import {
  BellIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
  CheckCircleIcon,
  CubesIcon,
  FilterIcon,
  TimesIcon,
  SortAmountDownIcon,
  EllipsisVIcon,
  SyncIcon,
  ClockIcon,
  ListIcon,
  ThLargeIcon,
  TachometerAltIcon,
  CogIcon,
  OutlinedBellIcon,
  ServerIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  HistoryIcon,
  CheckIcon,
  BanIcon,
  RedoIcon,
  GripVerticalIcon,
  ColumnsIcon,
  SaveIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  SearchIcon,
  PlusIcon,
  MinusIcon,
  AngleRightIcon,
  AngleDownIcon,
  BookmarkIcon,
  MapMarkerAltIcon,
  ClusterIcon,
  CubeIcon,
  CloudIcon,
  BellSlashIcon,
  ChartLineIcon,
  WrenchIcon,
  PortIcon,
  ExternalLinkAltIcon,
  SearchPlusIcon,
  SearchMinusIcon,
  UndoIcon,
  QuestionCircleIcon,
  OutlinedQuestionCircleIcon,
  PauseCircleIcon,
  ExportIcon,
  EditAltIcon,
  PlusCircleIcon,
} from '@patternfly/react-icons';

import { TypeaheadSelect } from '@patternfly/react-templates';

// ========================================
// DATA TYPES  
// ========================================

type AlertSeverity = 'Critical' | 'Warning' | 'Info';
type AlertStatus = 'firing' | 'acknowledged' | 'resolved' | 'pending';
type ClusterAlertStatus = 'critical' | 'warning' | 'info' | 'healthy'; // Based on firing alerts
type ACMClusterStatus = 'Ready' | 'Offline' | 'Failed' | 'Pending Import' | 'Installing' | 'Degraded' | 'Hibernating' | 'Unknown' | 'Detaching';
type AlertGroup = 'Cluster' | 'Namespace';
type AlertComponent = 'kube-apiserver' | 'Storage' | 'Network' | 'etcd' | 'Scheduler' | 'Controller' | 'Workload' | 'Pod' | 'Quota';
type GroupByOption = 'none' | 'region' | 'cloudProvider' | 'team' | 'severity' | 'environment';
type SortByOption = 'severity' | 'alertCount' | 'clusterName' | 'lastFired';
type ViewMode = 'treemap' | 'summary';
type ImportanceSizing = 'none' | 'nodeCount' | 'cpuCores' | 'totalMemory' | 'podCount' | 'vmCount' | 'totalAlerts' | 'cpuRequests' | 'memoryRequests';
type UserRole = 'admin' | 'namespaceOwner';

// V2: Three-tier navigation view states
type NavigationView = 'fleet-overview' | 'cluster-components' | 'component-alerts';

// V2: Component health data structure
interface ComponentHealthData {
  component: AlertComponent;
  displayName: string;
  icon: React.ReactNode;
  alertCount: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  healthStatus: 'critical' | 'warning' | 'info' | 'healthy';
  lastAlert?: string;
}

interface AlertData {
  id: string;
  severity: AlertSeverity;
  status: AlertStatus;
  alertName: string;
  clusterName: string;
  namespace: string;
  labels: Record<string, string>;
  summary: string;
  lastFired: string;
  lastFiredTimestamp: Date;
  details: string;
  source: string;
  count: number;
  group: AlertGroup;
  component: AlertComponent;
  description?: string;
  resource?: string;
}

interface ClusterData {
  id: string;
  name: string;
  region: string;
  cloudProvider: string;
  team: string;
  namespaces: string[];
  labels: Record<string, string>;
  alerts: AlertData[];
  nodeCount: number;
  podCount: number;
  cpuUsage: number;
  memoryUsage: number;
  cpuCores: number;
  totalMemory: number;
  vmCount: number;
  cpuRequests: number;
  memoryRequests: number;
  acmStatus: ACMClusterStatus; // ACM lifecycle status
}

interface TrendData {
  timestamp: string;
  critical: number;
  warning: number;
  info: number;
}

interface ColumnConfig {
  key: string;
  label: string;
  isVisible: boolean;
  isDisabled: boolean;
  order: number;
}

interface SavedFilter {
  id: string;
  name: string;
  filters: {
    severity: AlertSeverity[];
    group: AlertGroup[];
    component: AlertComponent[];
    source: string[];
    searchValue: string;
    region?: string[];
    cluster?: string[];
    namespace?: string[];
    label?: string[];
  };
  hidden?: boolean;
}

interface ToastNotification {
  id: string;
  title: string;
  variant: 'success' | 'danger' | 'warning' | 'info';
  description?: string;
}

// Alert Rule Types for Management
type AlertRuleState = 'Active' | 'Reconciling' | 'Partial success' | 'Failed' | 'Disabled';
type AlertRuleSource = 'User' | 'Platform';

interface AlertRuleActiveAlert {
  id: string;
  message: string;
  cluster: string;
  activeSince: string;
  state: 'Firing' | 'Pending' | 'Resolved';
  value: string;
  resource: string;
}

interface AlertRuleModification {
  date: string;
  user: string;
}

interface AlertRule {
  id: string;
  name: string;
  description: string;
  severity: AlertSeverity;
  state: AlertRuleState;
  stateProgress?: number; // For reconciling state, 0-100
  appliedClusters?: number; // For reconciling state
  totalClusters?: number; // For reconciling state
  targetClusters: string[];
  group: AlertGroup;
  component: AlertComponent;
  source: AlertRuleSource;
  expression: string;
  forDuration: string;
  prometheusRule: string;
  labels: string[];
  summary: string;
  runbookUrl?: string;
  dashboards?: string;
  notificationMatchers?: string[];
  receivedBy?: string;
  receivers?: string[];
  createdAt: string;
  createdBy: string;
  modificationHistory: AlertRuleModification[];
  activeAlerts: AlertRuleActiveAlert[];
  enabled: boolean;
}

// Mock Alert Rules Data
const mockAlertRules: AlertRule[] = [
  {
    id: 'ar1',
    name: 'NodeCPUHigh',
    description: 'Node CPU utilization exceeds threshold',
    severity: 'Critical',
    state: 'Reconciling',
    stateProgress: 50,
    appliedClusters: 7,
    totalClusters: 14,
    targetClusters: ['OCP-Prod-East', 'OCP-Prod-West', 'OCP-Stage-AppC'],
    group: 'Cluster',
    component: 'kube-apiserver',
    source: 'User',
    expression: 'intstr.FromString("kubevirt_vmi_non_evictable * on(name, namespace) group_left() kubevirt_vmi_info{phase=\'running\'} == 1"),',
    forDuration: '60 seconds',
    prometheusRule: 'PrometheusRule-default (namespace: openshift-monitoring)',
    labels: ['label-label1', 'label2'],
    summary: 'EtcdLeaderElectionFailed',
    runbookUrl: 'https://mygitrunbook.com',
    dashboards: 'ocp-perses-clusterhealthdashboard',
    notificationMatchers: ['env=prod', 'region=us.east'],
    receivedBy: 'Slack',
    receivers: ['mst-it.slack.com', 'mst-critical.slack.com'],
    createdAt: '12 July, 2025 In OCP-Prod-West cluster',
    createdBy: 'adiadmin@nyp.com',
    modificationHistory: [
      { date: '12 July, 2025 12:36:01 PM', user: 'person1@company.com' },
      { date: '18 July, 2025 02:12:19 AM', user: 'person2@company.com' },
    ],
    activeAlerts: [
      { id: 'aa1', message: 'Node k8s-node-01 CPU utilization is critically high (96.2%).', cluster: 'OCP-Prod-East', activeSince: 'Jul 15, 2025, 8:14 AM', state: 'Firing', value: '---', resource: 'k8s-node-01' },
      { id: 'aa2', message: 'Node k8s-node-04 CPU utilization is critically high (95.8%).', cluster: 'OCP-Prod-East', activeSince: 'Jul 15, 2025, 8:20 AM', state: 'Firing', value: '---', resource: 'k8s-node-04' },
      { id: 'aa3', message: 'Node k8s-node-02 CPU utilization is critically high (98.1%).', cluster: 'OCP-Prod-West', activeSince: 'Jul 15, 2025, 8:25 AM', state: 'Firing', value: '---', resource: 'k8s-node-02' },
      { id: 'aa4', message: 'Node k8s-node-03 CPU utilization is critically high (97.5%).', cluster: 'OCP-Stage-AppC', activeSince: 'Jul 15, 2025, 8:14 AM', state: 'Firing', value: '---', resource: 'k8s-node-01' },
    ],
    enabled: true,
  },
  {
    id: 'ar2',
    name: 'API Server Request Latency High',
    description: 'API Server request latency exceeds threshold',
    severity: 'Warning',
    state: 'Active',
    targetClusters: ['OCP-Prod-East'],
    group: 'Cluster',
    component: 'kube-apiserver',
    source: 'User',
    expression: 'histogram_quantile(0.99, sum(rate(apiserver_request_duration_seconds_bucket[5m])) by (le)) > 1',
    forDuration: '5 minutes',
    prometheusRule: 'PrometheusRule-default (namespace: openshift-monitoring)',
    labels: ['api', 'latency'],
    summary: 'API Server latency is high',
    createdAt: '10 July, 2025',
    createdBy: 'admin@company.com',
    modificationHistory: [],
    activeAlerts: [],
    enabled: true,
  },
  {
    id: 'ar3',
    name: 'Kube-State-Metrics Down',
    description: 'Kube-state-metrics is not running',
    severity: 'Critical',
    state: 'Partial success',
    targetClusters: ['OCP-Prod-East', 'OCP-Prod-West', 'OCP-Stage-AppC', 'OCP-Dev-1', 'OCP-Dev-2'],
    group: 'Cluster',
    component: 'kube-apiserver',
    source: 'User',
    expression: 'absent(up{job="kube-state-metrics"} == 1)',
    forDuration: '2 minutes',
    prometheusRule: 'PrometheusRule-default (namespace: openshift-monitoring)',
    labels: ['monitoring'],
    summary: 'Kube-state-metrics is down',
    createdAt: '5 July, 2025',
    createdBy: 'admin@company.com',
    modificationHistory: [],
    activeAlerts: [],
    enabled: true,
  },
  {
    id: 'ar4',
    name: 'Cluster Storage Disk Usage Critical',
    description: 'Cluster storage disk usage exceeds 90%',
    severity: 'Critical',
    state: 'Failed',
    targetClusters: ['OCP-Prod-East', 'OCP-Prod-West', 'OCP-Stage-AppC', 'OCP-Dev-1'],
    group: 'Cluster',
    component: 'kube-apiserver',
    source: 'User',
    expression: 'node_filesystem_avail_bytes / node_filesystem_size_bytes < 0.1',
    forDuration: '10 minutes',
    prometheusRule: 'PrometheusRule-default (namespace: openshift-monitoring)',
    labels: ['storage', 'disk'],
    summary: 'Disk usage is critical',
    createdAt: '1 July, 2025',
    createdBy: 'admin@company.com',
    modificationHistory: [],
    activeAlerts: [],
    enabled: true,
  },
  {
    id: 'ar5',
    name: 'ImageRegistryPersistentVolumeFull',
    description: 'Image registry PV is full',
    severity: 'Critical',
    state: 'Failed',
    targetClusters: ['OCP-Prod-East', 'OCP-Prod-West', 'OCP-Stage-AppC', 'OCP-Dev-1', 'OCP-Dev-2', 'OCP-Dev-3', 'OCP-Test-1'],
    group: 'Namespace',
    component: 'kube-apiserver',
    source: 'User',
    expression: 'kubelet_volume_stats_available_bytes{persistentvolumeclaim=~"image-registry.*"} / kubelet_volume_stats_capacity_bytes < 0.05',
    forDuration: '5 minutes',
    prometheusRule: 'PrometheusRule-default (namespace: openshift-monitoring)',
    labels: ['registry', 'storage'],
    summary: 'Image registry PV is nearly full',
    createdAt: '28 June, 2025',
    createdBy: 'admin@company.com',
    modificationHistory: [],
    activeAlerts: [],
    enabled: true,
  },
  {
    id: 'ar6',
    name: 'MDSCacheUsageHigh',
    description: 'MDS cache usage is high',
    severity: 'Critical',
    state: 'Failed',
    targetClusters: ['OCP-Prod-East', 'OCP-Prod-West', 'OCP-Stage-AppC', 'OCP-Dev-1', 'OCP-Dev-2', 'OCP-Dev-3', 'OCP-Test-1', 'OCP-Test-2'],
    group: 'Cluster',
    component: 'kube-apiserver',
    source: 'Platform',
    expression: 'ceph_mds_cache_size_bytes / ceph_mds_cache_limit_bytes > 0.9',
    forDuration: '10 minutes',
    prometheusRule: 'PrometheusRule-default (namespace: openshift-monitoring)',
    labels: ['ceph', 'mds'],
    summary: 'MDS cache usage exceeds 90%',
    createdAt: '25 June, 2025',
    createdBy: 'platform@company.com',
    modificationHistory: [],
    activeAlerts: [],
    enabled: true,
  },
  {
    id: 'ar7',
    name: 'Etcd Quorum Lost',
    description: 'Etcd cluster has lost quorum',
    severity: 'Warning',
    state: 'Active',
    targetClusters: Array.from({ length: 19 }, (_, i) => `Cluster-${i + 1}`),
    group: 'Cluster',
    component: 'etcd',
    source: 'User',
    expression: 'sum(etcd_server_has_leader) by (cluster) < count(etcd_server_has_leader) by (cluster)',
    forDuration: '1 minute',
    prometheusRule: 'PrometheusRule-default (namespace: openshift-monitoring)',
    labels: ['etcd', 'quorum'],
    summary: 'Etcd quorum is lost',
    createdAt: '20 June, 2025',
    createdBy: 'admin@company.com',
    modificationHistory: [],
    activeAlerts: [],
    enabled: true,
  },
  {
    id: 'ar8',
    name: 'MDSCacheUsageHigh',
    description: 'MDS cache usage is high (namespace level)',
    severity: 'Warning',
    state: 'Active',
    targetClusters: ['OCP-Prod-East'],
    group: 'Namespace',
    component: 'etcd',
    source: 'Platform',
    expression: 'ceph_mds_cache_size_bytes / ceph_mds_cache_limit_bytes > 0.8',
    forDuration: '5 minutes',
    prometheusRule: 'PrometheusRule-default (namespace: openshift-monitoring)',
    labels: ['ceph', 'mds'],
    summary: 'MDS cache usage exceeds 80%',
    createdAt: '15 June, 2025',
    createdBy: 'platform@company.com',
    modificationHistory: [],
    activeAlerts: [],
    enabled: true,
  },
  {
    id: 'ar9',
    name: 'Virtual Machine Memory Exhausted',
    description: 'Virtual machine memory is exhausted',
    severity: 'Critical',
    state: 'Reconciling',
    stateProgress: 75,
    appliedClusters: 3,
    totalClusters: 4,
    targetClusters: ['OCP-Prod-East', 'OCP-Prod-West', 'OCP-Stage-AppC', 'OCP-Dev-1'],
    group: 'Namespace',
    component: 'Pod',
    source: 'User',
    expression: 'kubevirt_vmi_memory_used_bytes / kubevirt_vmi_memory_available_bytes > 0.95',
    forDuration: '5 minutes',
    prometheusRule: 'PrometheusRule-default (namespace: openshift-monitoring)',
    labels: ['vm', 'memory'],
    summary: 'VM memory is exhausted',
    createdAt: '10 June, 2025',
    createdBy: 'admin@company.com',
    modificationHistory: [],
    activeAlerts: [],
    enabled: true,
  },
  {
    id: 'ar10',
    name: 'VMCannotBeEvicted',
    description: 'VM cannot be evicted',
    severity: 'Critical',
    state: 'Reconciling',
    stateProgress: 30,
    appliedClusters: 3,
    totalClusters: 11,
    targetClusters: Array.from({ length: 11 }, (_, i) => `VM-Cluster-${i + 1}`),
    group: 'Namespace',
    component: 'Pod',
    source: 'Platform',
    expression: 'kubevirt_vmi_non_evictable == 1',
    forDuration: '10 minutes',
    prometheusRule: 'PrometheusRule-default (namespace: openshift-monitoring)',
    labels: ['vm', 'eviction'],
    summary: 'VM cannot be evicted',
    createdAt: '5 June, 2025',
    createdBy: 'platform@company.com',
    modificationHistory: [],
    activeAlerts: [],
    enabled: true,
  },
  {
    id: 'ar11',
    name: 'NodeCPUHigh',
    description: 'Node CPU high at namespace level',
    severity: 'Critical',
    state: 'Active',
    targetClusters: Array.from({ length: 18 }, (_, i) => `NS-Cluster-${i + 1}`),
    group: 'Namespace',
    component: 'kube-apiserver',
    source: 'User',
    expression: 'node:node_cpu_utilisation:avg1m > 0.9',
    forDuration: '5 minutes',
    prometheusRule: 'PrometheusRule-default (namespace: openshift-monitoring)',
    labels: ['cpu', 'node'],
    summary: 'Node CPU is high',
    createdAt: '1 June, 2025',
    createdBy: 'admin@company.com',
    modificationHistory: [],
    activeAlerts: [],
    enabled: true,
  },
];

// ========================================
// MOCK DATA GENERATION
// ========================================

const now = new Date();
const mockTrendData: TrendData[] = [
  { timestamp: '6h ago', critical: 5, warning: 12, info: 8 },
  { timestamp: '5h ago', critical: 4, warning: 15, info: 10 },
  { timestamp: '4h ago', critical: 7, warning: 11, info: 6 },
  { timestamp: '3h ago', critical: 3, warning: 18, info: 9 },
  { timestamp: '2h ago', critical: 28, warning: 45, info: 23 }, // Anomaly spike - 96 total (300% increase from baseline)
  { timestamp: '1h ago', critical: 4, warning: 10, info: 5 },
  { timestamp: 'Now', critical: 5, warning: 8, info: 4 },
];

// Generate 45 clusters with comprehensive data
const generateMockClusters = (): ClusterData[] => {
  const regions = ['US East', 'US West', 'US Central', 'EU Central', 'EU West', 'Asia Pacific', 'South America'];
  const providers = ['AWS', 'GCP', 'Azure'];
  const teams = ['Platform', 'Data', 'QA', 'Development', 'Security', 'ML'];
  const envs = ['prod', 'staging', 'dev'];
  const alertNames = ['HighMemoryUsage', 'HighCPUUsage', 'PodCrashLoopBackOff', 'NodeNotReady', 'DiskPressure', 'NetworkLatency', 'ServiceUnavailable', 'QuotaWarning', 'CertExpiring', 'ETCDHighLatency'];
  const components: AlertComponent[] = ['kube-apiserver', 'Storage', 'Network', 'etcd', 'Scheduler', 'Controller', 'Workload', 'Pod', 'Quota'];
  const groups: AlertGroup[] = ['Cluster', 'Namespace'];
  const sources = ['Platform', 'User'];

  const clusters: ClusterData[] = [];

  for (let i = 1; i <= 45; i++) {
    const env = envs[Math.floor(Math.random() * envs.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    const provider = providers[Math.floor(Math.random() * providers.length)];
    const team = teams[Math.floor(Math.random() * teams.length)];
    const nodeCount = Math.floor(Math.random() * 20) + 3;
    const podCount = nodeCount * (Math.floor(Math.random() * 15) + 5);

    // Generate alerts for this cluster
    const alertCount = Math.floor(Math.random() * 6);
    const alerts: AlertData[] = [];

    for (let j = 0; j < alertCount; j++) {
      const severity: AlertSeverity = Math.random() < 0.1 ? 'Critical' : Math.random() < 0.5 ? 'Warning' : 'Info';
      const status: AlertStatus = Math.random() < 0.7 ? 'firing' : Math.random() < 0.9 ? 'acknowledged' : 'resolved';
      const alertName = alertNames[Math.floor(Math.random() * alertNames.length)];
      
      // Generate varied time ranges for different time buckets
      // Distribute alerts across: 1 Hour, 4 Hours, Today, Yesterday, Last 7 days, Last 30 days, Older
      const timeBucket = Math.random();
      let minutesAgo: number;
      if (timeBucket < 0.15) {
        // 1 Hour - within last 60 minutes
        minutesAgo = Math.floor(Math.random() * 55) + 5;
      } else if (timeBucket < 0.30) {
        // 4 Hours - 1-4 hours ago
        minutesAgo = Math.floor(Math.random() * 180) + 61;
      } else if (timeBucket < 0.45) {
        // Today - 4-12 hours ago (still today)
        minutesAgo = Math.floor(Math.random() * 480) + 241;
      } else if (timeBucket < 0.60) {
        // Yesterday - 24-48 hours ago
        minutesAgo = Math.floor(Math.random() * 1440) + 1440;
      } else if (timeBucket < 0.75) {
        // Last 7 days - 2-7 days ago
        minutesAgo = Math.floor(Math.random() * 7200) + 2880;
      } else if (timeBucket < 0.90) {
        // Last 30 days - 7-30 days ago
        minutesAgo = Math.floor(Math.random() * 33120) + 10080;
      } else {
        // Older - 30-90 days ago
        minutesAgo = Math.floor(Math.random() * 86400) + 43200;
      }
      
      // Format the lastFired string based on time
      let lastFiredStr: string;
      if (minutesAgo < 60) {
        lastFiredStr = `${minutesAgo} min ago`;
      } else if (minutesAgo < 1440) {
        lastFiredStr = `${Math.floor(minutesAgo / 60)} hour${Math.floor(minutesAgo / 60) > 1 ? 's' : ''} ago`;
      } else {
        const daysAgo = Math.floor(minutesAgo / 1440);
        lastFiredStr = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
      }

      alerts.push({
        id: `alert-${i}-${j}`,
        severity,
        status,
        alertName,
        clusterName: `cluster-${env}-${region.toLowerCase().replace(' ', '-')}-${i}`,
        namespace: Math.random() < 0.5 ? 'production' : Math.random() < 0.7 ? 'kube-system' : 'monitoring',
        labels: { env, severity: severity.toLowerCase(), team },
        summary: `${alertName} detected on cluster-${i}`,
        lastFired: lastFiredStr,
        lastFiredTimestamp: new Date(now.getTime() - minutesAgo * 60000),
        details: `Detailed information about ${alertName}. This requires attention.`,
        source: sources[Math.floor(Math.random() * sources.length)],
        count: Math.floor(Math.random() * 10) + 1,
        group: groups[Math.floor(Math.random() * groups.length)],
        component: components[Math.floor(Math.random() * components.length)],
        description: `This alert indicates ${alertName.toLowerCase()} condition.`,
        resource: Math.random() < 0.3 ? `node-${Math.floor(Math.random() * 10) + 1}` : undefined,
      });
    }

    // Assign ACM status - most clusters are Ready, some have other statuses
    const acmStatuses: ACMClusterStatus[] = ['Ready', 'Ready', 'Ready', 'Ready', 'Ready', 'Ready', 'Ready', 'Ready', 
      'Degraded', 'Degraded', 'Offline', 'Unknown', 'Hibernating', 'Pending Import', 'Installing'];
    const acmStatus = acmStatuses[Math.floor(Math.random() * acmStatuses.length)];

    clusters.push({
      id: `cluster-${i}`,
      name: `${env}-${provider.toLowerCase()}-${region.toLowerCase().replace(' ', '-')}-${i}`,
      region,
      cloudProvider: provider,
      team,
      namespaces: ['production', 'kube-system', 'monitoring', 'logging'].slice(0, Math.floor(Math.random() * 3) + 2),
      labels: { env, tier: env === 'prod' ? 'critical' : 'standard' },
      alerts,
      nodeCount,
      podCount,
      cpuUsage: Math.floor(Math.random() * 60) + 20,
      memoryUsage: Math.floor(Math.random() * 60) + 25,
      cpuCores: nodeCount * 4,
      totalMemory: nodeCount * 16,
      vmCount: Math.floor(Math.random() * 10),
      cpuRequests: Math.floor(Math.random() * 50) + 10,
      memoryRequests: Math.floor(Math.random() * 40) + 15,
      acmStatus,
    });
  }

  return clusters;
};

const mockClusters: ClusterData[] = generateMockClusters();

// ========================================
// HELPER FUNCTIONS
// ========================================

const getClusterAlertStatus = (cluster: ClusterData): ClusterAlertStatus => {
  const firingAlerts = cluster.alerts.filter(a => a.status === 'firing');
  if (firingAlerts.some(a => a.severity === 'Critical')) return 'critical';
  if (firingAlerts.some(a => a.severity === 'Warning')) return 'warning';
  if (firingAlerts.some(a => a.severity === 'Info')) return 'info';
  return 'healthy';
};

const getStatusBackgroundColor = (status: ClusterAlertStatus): string => {
  switch (status) {
    case 'critical': return '#c9190b';
    case 'warning': return '#f0ab00';
    case 'info': return '#6753ac';
    case 'healthy': return '#3e8635';
    default: return '#3e8635';
  }
};

const getSeverityLabelColor = (severity: AlertSeverity): 'red' | 'orange' | 'purple' => {
  switch (severity) {
    case 'Critical': return 'red';
    case 'Warning': return 'orange';
    case 'Info': return 'purple';
  }
};

const getStatusLabelColor = (status: AlertStatus): 'red' | 'blue' | 'green' => {
  switch (status) {
    case 'firing': return 'red';
    case 'acknowledged': return 'blue';
    case 'resolved': return 'green';
    case 'pending': return 'blue';
    default: return 'blue';
  }
};

const getSeverityIcon = (severity: AlertSeverity) => {
  switch (severity) {
    case 'Critical': return <ExclamationCircleIcon />;
    case 'Warning': return <ExclamationTriangleIcon />;
    case 'Info': return <InfoCircleIcon />;
  }
};

const getUniqueValues = <T, K extends keyof T>(items: T[], key: K): string[] => {
  return Array.from(new Set(items.map(item => String(item[key])))).sort();
};

const getAllLabels = (clusters: ClusterData[]): string[] => {
  const labels = new Set<string>();
  clusters.forEach(cluster => {
    Object.entries(cluster.labels).forEach(([key, value]) => {
      labels.add(`${key}:${value}`);
    });
  });
  return Array.from(labels).sort();
};

const getAllNamespaces = (clusters: ClusterData[]): string[] => {
  const namespaces = new Set<string>();
  clusters.forEach(cluster => {
    cluster.namespaces.forEach(ns => namespaces.add(ns));
  });
  return Array.from(namespaces).sort();
};

const getAllAlerts = (clusters: ClusterData[]): AlertData[] => {
  return clusters.flatMap(c => c.alerts).sort((a, b) => b.lastFiredTimestamp.getTime() - a.lastFiredTimestamp.getTime());
};

const getTileValue = (cluster: ClusterData, sizing: ImportanceSizing, severityFilter: AlertSeverity[]): number => {
  switch (sizing) {
    case 'none': return 1000; // Equal size for all tiles
    case 'nodeCount': return cluster.nodeCount;
    case 'cpuCores': return cluster.cpuCores;
    case 'totalMemory': return cluster.totalMemory;
    case 'podCount': return cluster.podCount;
    case 'vmCount': return cluster.vmCount || 1;
    case 'cpuRequests': return cluster.cpuRequests;
    case 'memoryRequests': return cluster.memoryRequests;
    case 'totalAlerts':
      if (severityFilter.length === 0) {
        return cluster.alerts.filter(a => a.status === 'firing').length || 1;
      }
      return cluster.alerts.filter(a => a.status === 'firing' && severityFilter.includes(a.severity)).length || 1;
    default: return cluster.nodeCount;
  }
};

// ========================================
// TREEMAP HEATMAP COMPONENT
// ========================================

interface EnvironmentCategory {
  id: string;
  label: string;
  color: string;
  patterns: string[];
}

interface TeamCategory {
  id: string;
  label: string;
  color: string;
  patterns: string[];
}

// ========================================
// FLAPPING RATE MICRO CHART
// ========================================

interface FlappingEvent {
  timestamp: Date;
  duration: number; // minutes
  wasFiring: boolean;
}

interface FlappingRateChartProps {
  alertName: string;
  severity: string;
  events: FlappingEvent[];
  totalFlaps: number;
  onClick?: () => void;
}

const FlappingRateChart: React.FC<FlappingRateChartProps> = ({ alertName, severity, events, totalFlaps, onClick }) => {
  const chartWidth = 120;
  const chartHeight = 24;
  const barWidth = 2;
  const barGap = 1;
  
  // Calculate max bars that can fit
  const maxBars = Math.floor(chartWidth / (barWidth + barGap));
  const displayEvents = events.slice(-maxBars);
  
  // Calculate time range (last 4 hours)
  const now = new Date();
  const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  
  const getBarHeight = (event: FlappingEvent) => {
    // Height based on duration (longer duration = taller bar)
    const minHeight = 6;
    const maxHeight = chartHeight;
    const normalized = Math.min(event.duration / 60, 1); // Normalize to 0-1 (60 min = full height)
    return minHeight + (maxHeight - minHeight) * normalized;
  };
  
  const getBarColor = (event: FlappingEvent) => {
    return event.wasFiring 
      ? 'var(--pf-t--global--color--status--danger--default)' 
      : 'var(--pf-t--global--color--status--warning--default)';
  };
  
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };
  
  return (
    <Tooltip
      content={
        <div>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>
            {totalFlaps} status transitions
          </div>
          <div style={{ fontSize: '12px', marginBottom: '4px' }}>
            Total number of status transitions (Firing ↔ Resolved) in the last 24 hours.
          </div>
          <div style={{ fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)' }}>
            High counts indicate "flapping." Click to view full timeline.
          </div>
        </div>
      }
    >
      <div 
        onClick={onClick}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: '4px',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--pf-t--global--background--color--secondary--hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <div style={{ 
          fontSize: '13px', 
          fontWeight: 500,
          color: 'var(--pf-t--global--text--color--regular)',
          minWidth: '20px'
        }}>
          {totalFlaps}
        </div>
        <svg width={chartWidth} height={chartHeight} style={{ display: 'block' }}>
          <line 
            x1="0" 
            y1={chartHeight} 
            x2={chartWidth} 
            y2={chartHeight} 
            stroke="var(--pf-t--global--border--color--default)" 
            strokeWidth="1"
          />
          {displayEvents.map((event, idx) => {
            const barHeight = getBarHeight(event);
            const x = idx * (barWidth + barGap);
            const y = chartHeight - barHeight;
            
            return (
              <rect
                key={idx}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={getBarColor(event)}
                rx="1"
              />
            );
          })}
        </svg>
      </div>
    </Tooltip>
  );
};

// Generate mock flapping events for an alert
const generateFlappingEvents = (alertName: string, severity: string): { events: FlappingEvent[], totalFlaps: number } => {
  const now = new Date();
  const events: FlappingEvent[] = [];
  
  // Generate random flapping pattern based on severity
  const baseFlaps = severity === 'Critical' ? 8 : severity === 'Warning' ? 12 : 5;
  const variance = Math.floor(Math.random() * 5);
  const totalFlaps = baseFlaps + variance;
  
  for (let i = 0; i < totalFlaps; i++) {
    const hoursAgo = Math.random() * 4; // Last 4 hours
    const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    const duration = Math.floor(Math.random() * 45) + 5; // 5-50 minutes
    const wasFiring = Math.random() > 0.5;
    
    events.push({ timestamp, duration, wasFiring });
  }
  
  // Sort by timestamp
  events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  return { events, totalFlaps };
};

// ========================================
// ALERT TIMELINE VISUALIZATION
// ========================================

type AlertDetailTimeRange = '5m' | '30m' | '1h' | '6h' | '24h';

interface AlertTimelineVisualizationProps {
  alertName: string;
  severity: string;
}

const AlertTimelineVisualization: React.FC<AlertTimelineVisualizationProps> = ({ alertName, severity }) => {
  const [timeRange, setTimeRange] = React.useState<AlertDetailTimeRange>('24h');
  
  // Generate timeline data based on time range
  const generateTimelineData = (range: AlertDetailTimeRange) => {
    const now = new Date();
    let startTime: Date;
    let intervalMinutes: number;
    let dataPoints: number;
    
    switch (range) {
      case '5m':
        startTime = new Date(now.getTime() - 5 * 60 * 1000);
        intervalMinutes = 0.5; // 30 seconds
        dataPoints = 10;
        break;
      case '30m':
        startTime = new Date(now.getTime() - 30 * 60 * 1000);
        intervalMinutes = 2;
        dataPoints = 15;
        break;
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        intervalMinutes = 4;
        dataPoints = 15;
        break;
      case '6h':
        startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        intervalMinutes = 24;
        dataPoints = 15;
        break;
      case '24h':
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        intervalMinutes = 96; // ~1.5 hours
        dataPoints = 15;
        break;
    }
    
    const events: Array<{ timestamp: Date; isFiring: boolean; duration: number }> = [];
    
    // Generate realistic flapping pattern
    let currentTime = startTime.getTime();
    let currentState = Math.random() > 0.5; // Start randomly firing or resolved
    
    for (let i = 0; i < dataPoints; i++) {
      const timestamp = new Date(currentTime);
      const duration = intervalMinutes + Math.random() * intervalMinutes * 0.5;
      
      // Create some flapping: change state occasionally
      if (Math.random() > 0.7) {
        currentState = !currentState;
      }
      
      events.push({
        timestamp,
        isFiring: currentState,
        duration
      });
      
      currentTime += duration * 60 * 1000;
    }
    
    return events;
  };
  
  const timelineData = React.useMemo(() => generateTimelineData(timeRange), [timeRange]);
  
  const formatTime = (date: Date) => {
    if (timeRange === '5m' || timeRange === '30m') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } else if (timeRange === '1h' || timeRange === '6h') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };
  
  const chartHeight = 300;
  const chartWidth = 700;
  const chartBarWidth = Math.max(20, Math.min(50, (chartWidth - 100) / timelineData.length - 8));
  const chartBarGap = 8;
  
  return (
    <Stack hasGutter>
      <StackItem>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <Content component="h3" style={{ margin: 0 }}>Status Timeline</Content>
          </FlexItem>
          <FlexItem>
            <ToggleGroup aria-label="Time range selection">
              <ToggleGroupItem
                text="5 min"
                buttonId="5m"
                isSelected={timeRange === '5m'}
                onChange={() => setTimeRange('5m')}
              />
              <ToggleGroupItem
                text="30 min"
                buttonId="30m"
                isSelected={timeRange === '30m'}
                onChange={() => setTimeRange('30m')}
              />
              <ToggleGroupItem
                text="1 hour"
                buttonId="1h"
                isSelected={timeRange === '1h'}
                onChange={() => setTimeRange('1h')}
              />
              <ToggleGroupItem
                text="6 hours"
                buttonId="6h"
                isSelected={timeRange === '6h'}
                onChange={() => setTimeRange('6h')}
              />
              <ToggleGroupItem
                text="24 hours"
                buttonId="24h"
                isSelected={timeRange === '24h'}
                onChange={() => setTimeRange('24h')}
              />
            </ToggleGroup>
          </FlexItem>
        </Flex>
      </StackItem>
      <StackItem>
        <div style={{ 
          backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
          border: '1px solid var(--pf-t--global--border--color--default)',
          borderRadius: '4px',
          padding: '16px'
        }}>
          <svg width={chartWidth} height={chartHeight} style={{ display: 'block' }}>
            {/* Y-axis labels */}
            <text x="10" y="35" fontSize="12" fontWeight="600" fill="#151515">
              Firing
            </text>
            <text x="10" y={chartHeight - 50} fontSize="12" fontWeight="600" fill="#151515">
              Resolved
            </text>
            
            {/* Timeline bars */}
            <g transform="translate(80, 20)">
              {timelineData.map((event, idx) => {
                const x = idx * (chartBarWidth + chartBarGap);
                const barHeightValue = event.isFiring ? chartHeight - 100 : 50; // Tall for firing, short for resolved
                const y = chartHeight - 80 - barHeightValue;
                const color = event.isFiring 
                  ? '#C9190B' // Red for firing
                  : '#3E8635'; // Green for resolved
                
                return (
                  <g key={idx}>
                    <title>
                      {event.isFiring ? 'Firing' : 'Resolved'} - {formatTime(event.timestamp)} - Duration: ~{Math.round(event.duration)} min
                    </title>
                    <rect
                      x={x}
                      y={y}
                      width={chartBarWidth}
                      height={barHeightValue}
                      fill={color}
                      opacity={event.isFiring ? 0.9 : 0.5}
                      rx="3"
                      style={{ cursor: 'pointer' }}
                    />
                  </g>
                );
              })}
              
              {/* X-axis */}
              <line 
                x1="0" 
                y1={chartHeight - 80} 
                x2={timelineData.length * (chartBarWidth + chartBarGap) - chartBarGap} 
                y2={chartHeight - 80} 
                stroke="#D2D2D2" 
                strokeWidth="2"
              />
            </g>
            
            {/* Time labels */}
            <g transform="translate(80, 20)">
              {[0, Math.floor(timelineData.length / 2), timelineData.length - 1].map(idx => {
                if (idx >= 0 && idx < timelineData.length) {
                  const event = timelineData[idx];
                  const x = idx * (chartBarWidth + chartBarGap);
                  return (
                    <text 
                      key={idx}
                      x={x + chartBarWidth / 2} 
                      y={chartHeight - 55} 
                      fontSize="11" 
                      fill="#6A6E73"
                      textAnchor="middle"
                    >
                      {formatTime(event.timestamp)}
                    </text>
                  );
                }
                return null;
              })}
            </g>
          </svg>
        </div>
      </StackItem>
      <StackItem>
        <Flex gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                backgroundColor: 'var(--pf-t--global--color--status--danger--default)',
                borderRadius: '2px',
                opacity: 0.9
              }} />
              <span style={{ fontSize: '13px' }}>Firing</span>
            </Flex>
          </FlexItem>
          <FlexItem>
            <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                backgroundColor: 'var(--pf-t--global--color--status--success--default)',
                borderRadius: '2px',
                opacity: 0.4
              }} />
              <span style={{ fontSize: '13px' }}>Resolved</span>
            </Flex>
          </FlexItem>
        </Flex>
      </StackItem>
      <StackItem>
        <Content component="p" style={{ fontSize: '13px', color: 'var(--pf-t--global--text--color--subtle)' }}>
          This visualization shows the alert status over time. Tall red bars indicate "Firing" periods, 
          while short light bars indicate "Resolved" periods. A sawtooth pattern indicates "flapping" behavior, 
          where the alert rapidly transitions between states.
        </Content>
      </StackItem>
    </Stack>
  );
};

// ========================================
// TREEMAP HEATMAP
// ========================================

interface TreemapHeatmapProps {
  clusters: ClusterData[];
  groupBy: GroupByOption;
  importanceSizing: ImportanceSizing;
  severityFilter: AlertSeverity[];
  onDrillDown: (cluster: ClusterData) => void;
  onLegendClick?: (severity: 'Critical' | 'Warning' | 'Info' | 'Healthy') => void;
  activeLegendFilters?: ('Critical' | 'Warning' | 'Info' | 'Healthy')[];
  environmentCategories?: EnvironmentCategory[];
  teamCategories?: TeamCategory[];
}

const TreemapHeatmap: React.FC<TreemapHeatmapProps> = ({
  clusters,
  groupBy,
  importanceSizing,
  severityFilter,
  onDrillDown,
  onLegendClick,
  activeLegendFilters = [],
  environmentCategories = [],
  teamCategories = [],
}) => {
  // PatternFly 6 color palette
  // Critical: Red, Warning: Orange, Info: Purple, Healthy: Green
  const pfColors = {
    critical: '#c9190b',    // PF danger/red
    warning: '#f0ab00',     // PF warning/orange  
    info: '#6753ac',        // PF purple
    healthy: '#3e8635',     // PF success/green
  };

  const getClusterColor = (cluster: ClusterData): string => {
    const firingAlerts = cluster.alerts.filter(a => a.status === 'firing');
    if (firingAlerts.some(a => a.severity === 'Critical')) return pfColors.critical;
    if (firingAlerts.some(a => a.severity === 'Warning')) return pfColors.warning;
    if (firingAlerts.some(a => a.severity === 'Info')) return pfColors.info;
    return pfColors.healthy;
  };

  const getStatusText = (cluster: ClusterData): string => {
    const firingAlerts = cluster.alerts.filter(a => a.status === 'firing');
    if (firingAlerts.some(a => a.severity === 'Critical')) return 'Critical';
    if (firingAlerts.some(a => a.severity === 'Warning')) return 'Warning';
    if (firingAlerts.some(a => a.severity === 'Info')) return 'Info';
    return 'Healthy';
  };

  const buildTreemapData = () => {
    // Filter clusters based on severity filter - hide healthy clusters when filtering
    let filteredClusters = clusters;
    if (severityFilter.length > 0 || activeLegendFilters.length > 0) {
      filteredClusters = clusters.filter(cluster => {
        const clusterStatus = getClusterAlertStatus(cluster);
        const statusCapitalized = clusterStatus.charAt(0).toUpperCase() + clusterStatus.slice(1);
        
        // If legend filters are active, use them
        if (activeLegendFilters.length > 0) {
          return activeLegendFilters.includes(statusCapitalized as 'Critical' | 'Warning' | 'Info' | 'Healthy');
        }
        
        // If severity filter is active, filter out healthy clusters
        if (severityFilter.length > 0) {
          // Hide healthy clusters when severity filter is set
          if (clusterStatus === 'healthy') return false;
          // Only show clusters with matching severity
          const firingAlerts = cluster.alerts.filter(a => a.status === 'firing');
          return firingAlerts.some(a => severityFilter.includes(a.severity));
        }
        return true;
      });
    }

    // Severity order for sorting: Critical first, then Warning, Info, Healthy
    const severityOrder: Record<string, number> = { Critical: 0, Warning: 1, Info: 2, Healthy: 3 };
    const getClusterSeverityOrder = (cluster: ClusterData): number => {
      const status = getClusterAlertStatus(cluster);
      const statusCapitalized = status.charAt(0).toUpperCase() + status.slice(1);
      return severityOrder[statusCapitalized] ?? 4;
    };

    // Calculate adjusted value for sorting: Critical items get highest priority (larger value multiplier)
    // This ensures treemap displays Critical first (left), then Warning, Info, Healthy (right)
    const getAdjustedValue = (cluster: ClusterData): number => {
      const baseValue = getTileValue(cluster, importanceSizing, severityFilter);
      const severityPriority = getClusterSeverityOrder(cluster);
      
      // When sizing is 'none', use microscopic differences for sorting without visible size change
      // Values like 1000.004, 1000.003, 1000.002, 1000.001 maintain order but appear equal
      if (importanceSizing === 'none') {
        const microOffset = (4 - severityPriority) * 0.001; // Critical=0.004, Warning=0.003, Info=0.002, Healthy=0.001
        return 1000 + microOffset;
      }
      
      // When grouping by severity, use a much smaller multiplier to keep groups balanced
      // When not grouping, use a very large multiplier to force left-to-right ordering
      if (groupBy === 'severity') {
        // Small multiplier: Critical=2.0, Warning=1.75, Info=1.5, Healthy=1.25
        // This keeps all severity groups visible while still showing relative importance
        const multiplier = 2.0 - (severityPriority * 0.25);
        return baseValue * multiplier;
      } else {
        // Much larger multiplier for non-grouped view to force visual ordering
        // Critical=1000x, Warning=100x, Info=10x, Healthy=1x
        // This creates enough value difference to overcome treemap's layout optimization
        const multiplier = Math.pow(10, 3 - severityPriority);
        return baseValue * multiplier;
      }
    };

    if (groupBy === 'none') {
      // Sort clusters by severity (Critical first)
      const sortedClusters = [...filteredClusters].sort((a, b) => {
        const severityDiff = getClusterSeverityOrder(a) - getClusterSeverityOrder(b);
        if (severityDiff !== 0) return severityDiff;
        const aCount = a.alerts.filter(al => al.status === 'firing').length;
        const bCount = b.alerts.filter(al => al.status === 'firing').length;
        if (aCount !== bCount) return bCount - aCount;
        return a.name.localeCompare(b.name);
      });
      return sortedClusters.map(cluster => ({
        name: cluster.name,
        value: getAdjustedValue(cluster),
        itemStyle: { color: getClusterColor(cluster) },
        cluster,
      }));
    }

    const groups: Record<string, ClusterData[]> = {};
    
    // Pre-initialize severity groups to ensure all show up
    if (groupBy === 'severity') {
      groups['Critical'] = [];
      groups['Warning'] = [];
      groups['Info'] = [];
      groups['Healthy'] = [];
    }
    
    filteredClusters.forEach(cluster => {
      let key: string;
      if (groupBy === 'severity') {
        key = getClusterAlertStatus(cluster).charAt(0).toUpperCase() + getClusterAlertStatus(cluster).slice(1);
      } else if (groupBy === 'environment') {
        // Match cluster name against environment patterns
        key = 'Other'; // Default to "Other" if no match
        for (const category of environmentCategories) {
          if (category.patterns.some(pattern => cluster.name.toLowerCase().startsWith(pattern.toLowerCase()))) {
            key = category.label;
            break;
          }
        }
      } else if (groupBy === 'team') {
        // Match cluster name against team patterns
        key = 'Other'; // Default to "Other" if no match
        for (const category of teamCategories) {
          if (category.patterns.some(pattern => cluster.name.toLowerCase().startsWith(pattern.toLowerCase()))) {
            key = category.label;
            break;
          }
        }
      } else {
        key = String(cluster[groupBy as keyof ClusterData]);
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(cluster);
    });

    // Sort groups by severity order (Critical first), then sort clusters within each group
    // For severity grouping, keep empty groups to show all severity levels
    // IMPORTANT: Use explicit ordering to ensure consistent left-to-right display
    let sortedGroupEntries: [string, ClusterData[]][];
    
    if (groupBy === 'severity') {
      // Explicit severity order: always Critical, Warning, Info, Healthy (left to right)
      const severityOrderedKeys = ['Critical', 'Warning', 'Info', 'Healthy'];
      sortedGroupEntries = severityOrderedKeys
        .map(key => [key, groups[key] || []] as [string, ClusterData[]])
        .filter(([_, groupClusters]) => groupBy === 'severity' || groupClusters.length > 0);
    } else {
      // For other groupings, sort alphabetically
      sortedGroupEntries = Object.entries(groups)
        .filter(([_, groupClusters]) => groupClusters.length > 0)
        .sort((a, b) => a[0].localeCompare(b[0]));
    }

    // Calculate total value and group-level values for proper sizing
    const allGroupValues = sortedGroupEntries.map(([_, groupClusters]) => {
      return groupClusters.reduce((sum, c) => {
        // Use base value without severity multiplier for fair comparison
        return sum + getTileValue(c, importanceSizing, severityFilter);
      }, 0);
    });
    const totalBaseValue = allGroupValues.reduce((sum, v) => sum + v, 0);
    const avgGroupBaseValue = allGroupValues.length > 0 ? totalBaseValue / allGroupValues.length : 1000;
    
    return sortedGroupEntries.map(([groupName, groupClusters], groupIndex) => {
      // Sort clusters within group
      const sortedChildren = groupClusters
        .sort((a, b) => {
          // Sort by severity (Critical first), then by alert count, then by name
          const severityDiff = getClusterSeverityOrder(a) - getClusterSeverityOrder(b);
          if (severityDiff !== 0) return severityDiff;
          const aCount = a.alerts.filter(al => al.status === 'firing').length;
          const bCount = b.alerts.filter(al => al.status === 'firing').length;
          if (aCount !== bCount) return bCount - aCount;
          return a.name.localeCompare(b.name);
        })
        .map(cluster => ({
          name: cluster.name,
          value: getAdjustedValue(cluster),
          itemStyle: { color: getClusterColor(cluster) },
          cluster,
        }));
      
      // For empty groups (severity grouping), create a visible placeholder
      if (sortedChildren.length === 0) {
        const colorMap = { 
          Critical: pfColors.critical, 
          Warning: pfColors.warning, 
          Info: pfColors.info, 
          Healthy: pfColors.healthy 
        };
        const groupColor = colorMap[groupName as keyof typeof colorMap] || '#d2d2d2';
        // For severity grouping, ensure empty groups are at least 25% of the largest group for visibility
        const maxGroupBaseValue = allGroupValues.length > 0 ? Math.max(...allGroupValues) : 5000;
        const emptyGroupValue = groupBy === 'severity' 
          ? Math.max(maxGroupBaseValue * 0.25, 3000)
          : Math.max(avgGroupBaseValue * 0.4, 2000);
        
        return {
          name: groupName,
          value: emptyGroupValue,
          itemStyle: {
            color: groupColor,
          },
          children: [{
            name: `(0 clusters)`,
            value: emptyGroupValue,
            itemStyle: { 
              color: groupColor,
              opacity: 0.4,
              borderColor: '#ffffff',
              borderWidth: 2,
            },
            label: {
              show: true,
              color: '#ffffff',
              fontSize: 11,
              fontWeight: 500,
            },
          }],
        };
      }
      
      // Calculate group value with stronger differentiation to enforce visual ordering
      const childrenSum = sortedChildren.reduce((sum, c) => sum + c.value, 0);
      
      // For severity grouping, use stronger multipliers to enforce left-to-right ordering
      // For other groupings, use a moderate multiplier to show importance
      let groupValue: number;
      if (groupBy === 'severity') {
        // Use explicit position-based multipliers to guarantee ordering
        // Critical (index 0) gets highest multiplier, Healthy (index 3) gets lowest
        // This creates a deterministic value hierarchy that ECharts must respect
        const severityMultipliers = [10000, 1000, 100, 10]; // Critical, Warning, Info, Healthy
        const severityMultiplier = severityMultipliers[groupIndex] || 1;
        groupValue = Math.max(childrenSum, 1000) * severityMultiplier;
        
        // Ensure a minimum value for visibility - at least 15% of the largest group
        const maxChildrenSum = Math.max(...sortedGroupEntries.map(([_, gc]) => 
          gc.reduce((sum, c) => sum + getAdjustedValue(c), 0)
        ));
        const minValue = maxChildrenSum * 0.15;
        groupValue = Math.max(groupValue, minValue);
      } else {
        // For other groupings, use the original moderate multiplier
        const groupMultiplier = Math.pow(1.5, sortedGroupEntries.length - groupIndex);
        const maxGroupValue = childrenSum * 3; // Limit to 3x the sum of children
        groupValue = Math.min(childrenSum * groupMultiplier, maxGroupValue);
      }
      
      // Determine group color based on grouping type
      let groupItemStyle: any;
      if (groupBy === 'severity') {
        // For severity grouping, use severity colors
        const colorMap = { 
          Critical: pfColors.critical, 
          Warning: pfColors.warning, 
          Info: pfColors.info, 
          Healthy: pfColors.healthy 
        };
        groupItemStyle = { 
          color: colorMap[groupName as keyof typeof colorMap] || '#8a8d90'
        };
      } else {
        // For other grouping types (environment, team, region, etc.), use neutral gray
        groupItemStyle = { 
          color: '#d2d2d2'
        };
      }
      
      return {
        name: groupName,
        value: groupValue,
        children: sortedChildren,
        itemStyle: groupItemStyle,
      };
    });
  };

  const option = {
    tooltip: {
      confine: true,
      formatter: (info: any) => {
        if (!info.data?.cluster) {
          // Group header or empty placeholder tooltip
          // Check if this is an empty group placeholder
          if (info.name === '(0 clusters)') {
            return `
              <div style="font-family: 'RedHatText', 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                <div style="font-size: 12px; color: #6a6e73;">No clusters in this severity</div>
              </div>
            `;
          }
          // Group header tooltip
          const children = info.data?.children || [];
          const isEmptyGroup = children.length === 1 && children[0].name === '(0 clusters)';
          const childCount = isEmptyGroup ? 0 : children.length;
          return `
            <div style="font-family: 'RedHatText', 'Helvetica Neue', Helvetica, Arial, sans-serif;">
              <div style="font-size: 14px; font-weight: 600; color: #151515; margin-bottom: 4px;">${info.name}</div>
              <div style="font-size: 12px; color: #6a6e73;">${childCount} cluster${childCount !== 1 ? 's' : ''}</div>
            </div>
          `;
        }
        const cluster = info.data.cluster as ClusterData;
        const firingAlerts = cluster.alerts.filter(a => a.status === 'firing');
        const status = getStatusText(cluster);
        const statusColor = getClusterColor(cluster);
        
        // Calculate component health - get worst severity per component
        const componentHealth: Record<string, { severity: string; color: string }> = {};
        firingAlerts.forEach(alert => {
          const comp = alert.component;
          const currentSeverity = componentHealth[comp]?.severity;
          // Determine priority: Critical > Warning > Info
          if (!currentSeverity || 
              (alert.severity === 'Critical') ||
              (alert.severity === 'Warning' && currentSeverity !== 'Critical') ||
              (alert.severity === 'Info' && currentSeverity !== 'Critical' && currentSeverity !== 'Warning')) {
            componentHealth[comp] = {
              severity: alert.severity,
              color: alert.severity === 'Critical' ? pfColors.critical : 
                     alert.severity === 'Warning' ? pfColors.warning : pfColors.info
            };
          }
        });
        
        // Build component health HTML
        const componentHealthHtml = Object.entries(componentHealth)
          .sort((a, b) => {
            const order = { Critical: 0, Warning: 1, Info: 2 };
            return (order[a[1].severity as keyof typeof order] || 3) - (order[b[1].severity as keyof typeof order] || 3);
          })
          .slice(0, 5) // Limit to 5 components
          .map(([comp, health]) => `
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${health.color};"></span>
              <span style="font-size: 12px; color: #151515;">${comp}</span>
              <span style="font-size: 11px; color: ${health.color}; font-weight: 500;">${health.severity.toLowerCase()}</span>
            </div>
          `).join('');
        
        const moreComponents = Object.keys(componentHealth).length > 5 
          ? `<div style="font-size: 11px; color: #6a6e73; margin-top: 4px;">+${Object.keys(componentHealth).length - 5} more components</div>` 
          : '';
        
        return `
          <div style="font-family: 'RedHatText', 'Helvetica Neue', Helvetica, Arial, sans-serif; min-width: 220px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${statusColor};"></span>
              <span style="font-size: 14px; font-weight: 600; color: #151515;">${cluster.name}</span>
            </div>
            <div style="font-size: 12px; color: #6a6e73; margin-bottom: 12px;">${cluster.region} · ${cluster.cloudProvider}</div>
            ${Object.keys(componentHealth).length > 0 ? `
              <div style="margin-bottom: 8px;">
                <div style="font-size: 11px; font-weight: 600; color: #6a6e73; text-transform: uppercase; margin-bottom: 6px;">Component Health</div>
                ${componentHealthHtml}
                ${moreComponents}
              </div>
            ` : `
              <div style="font-size: 12px; color: ${pfColors.healthy}; margin-bottom: 8px;">
                <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${pfColors.healthy}; margin-right: 6px;"></span>
                All components healthy
              </div>
            `}
            <div style="font-size: 12px; color: #6a6e73; padding-top: 8px; border-top: 1px solid #d2d2d2;">
              <span>Nodes: <strong style="color: #151515;">${cluster.nodeCount}</strong></span>
              <span style="margin-left: 12px;">Pods: <strong style="color: #151515;">${cluster.podCount}</strong></span>
            </div>
            <div style="font-size: 11px; color: #0066cc; margin-top: 8px;">Click to view alerts →</div>
          </div>
        `;
      },
      backgroundColor: '#ffffff',
      borderColor: '#d2d2d2',
      borderWidth: 1,
      borderRadius: 4,
      padding: 12,
      extraCssText: 'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);',
      textStyle: { 
        color: '#151515', 
        fontSize: 12, 
        fontFamily: "'RedHatText', 'Helvetica Neue', Helvetica, Arial, sans-serif" 
      },
    },
    series: [{
      type: 'treemap',
      data: buildTreemapData(),
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
      roam: false,
      nodeClick: 'link',
      sort: 'descending', // Sort by value descending (larger values/Critical first)
      breadcrumb: {
        show: false,
      },
      label: {
        show: true,
        formatter: (params: any) => {
          const cluster = params.data?.cluster;
          if (cluster) {
            const firingAlerts = cluster.alerts.filter((a: AlertData) => a.status === 'firing');
            const alertCount = firingAlerts.length;
            return alertCount > 0 ? `{name|${params.name}}\n{count|${alertCount} alerts}` : `{name|${params.name}}`;
          }
          return `{name|${params.name}}`;
        },
        rich: {
          name: {
            fontSize: 11,
            fontWeight: 600,
            color: '#ffffff',
            fontFamily: "'RedHatText', 'Helvetica Neue', Helvetica, Arial, sans-serif",
            textShadowColor: 'rgba(0, 0, 0, 0.3)',
            textShadowBlur: 2,
          },
          count: {
            fontSize: 10,
            color: 'rgba(255, 255, 255, 0.9)',
            fontFamily: "'RedHatText', 'Helvetica Neue', Helvetica, Arial, sans-serif",
            textShadowColor: 'rgba(0, 0, 0, 0.3)',
            textShadowBlur: 2,
          },
        },
        lineHeight: 14,
        align: 'center',
        verticalAlign: 'middle',
      },
      upperLabel: {
        show: groupBy !== 'none',
        height: 28,
        color: '#151515',
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "'RedHatText', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        backgroundColor: 'rgba(245, 245, 245, 0.95)',
        borderRadius: [6, 6, 0, 0],
        padding: [6, 12],
        formatter: (params: any) => {
          const children = params.data?.children || [];
          // Check if this is an empty group placeholder (has 1 child with "0 clusters" in name)
          const isEmptyGroup = children.length === 1 && children[0].name?.includes('(0 clusters)');
          const childCount = isEmptyGroup ? 0 : children.length;
          return `${params.name} (${childCount})`;
        },
      },
      itemStyle: { 
        borderColor: '#ffffff', 
        borderWidth: 3, 
        gapWidth: 3,
        borderRadius: 6,
      },
      emphasis: { 
        itemStyle: { 
          borderColor: '#0066cc', 
          borderWidth: 3,
          borderRadius: 6,
          shadowBlur: 8,
          shadowColor: 'rgba(0, 102, 204, 0.3)',
        },
      },
      levels: [
        { 
          // Level 0: Group containers
          itemStyle: { 
            borderColor: '#ffffff', 
            borderWidth: 4, 
            gapWidth: 4,
            borderRadius: 8,
          },
          upperLabel: {
            show: groupBy !== 'none',
            height: 28,
            fontSize: 13,
            fontWeight: 600,
            backgroundColor: '#f5f5f5',
            borderRadius: [6, 6, 0, 0],
          },
        },
        { 
          // Level 1: Individual cluster tiles - always use their severity colors
          itemStyle: { 
            borderColor: '#ffffff', 
            borderWidth: 3, 
            gapWidth: 3,
            borderRadius: 6,
          },
        },
      ],
      animation: true,
      animationDurationUpdate: 200,
      animationEasing: 'cubicOut',
    }],
  };

  const handleClick = (params: any) => {
    if (params.data?.cluster) {
      onDrillDown(params.data.cluster);
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Treemap container - responsive height */}
      <div style={{ width: '100%', height: groupBy !== 'none' ? '600px' : '400px', minHeight: '300px' }}>
        <ReactECharts 
          option={option} 
          style={{ height: '100%', width: '100%' }} 
          onEvents={{ click: handleClick }}
          opts={{ renderer: 'svg' }}
          notMerge={true}
          lazyUpdate={false}
        />
      </div>
      {/* Legend - PatternFly aligned, clickable */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '16px', 
        padding: '16px',
        borderTop: '1px solid var(--pf-t--global--border--color--default, #d2d2d2)',
        marginTop: '12px',
        backgroundColor: 'var(--pf-t--global--background--color--secondary--default, #f5f5f5)',
        borderRadius: '0 0 var(--pf-t--global--border--radius--small, 3px) var(--pf-t--global--border--radius--small, 3px)',
      }}>
        {(['Critical', 'Warning', 'Info', 'Healthy'] as const).map(status => {
          const colorMap = { Critical: pfColors.critical, Warning: pfColors.warning, Info: pfColors.info, Healthy: pfColors.healthy };
          const isActive = activeLegendFilters.length === 0 || activeLegendFilters.includes(status);
          return (
            <div 
              key={status}
              onClick={() => onLegendClick?.(status)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                padding: '4px 12px',
                backgroundColor: isActive ? '#ffffff' : '#f0f0f0',
                borderRadius: 'var(--pf-t--global--border--radius--small, 3px)',
                border: isActive 
                  ? `2px solid ${colorMap[status]}` 
                  : '1px solid var(--pf-t--global--border--color--default, #d2d2d2)',
                cursor: 'pointer',
                opacity: isActive ? 1 : 0.5,
                transition: 'all 0.15s ease-in-out',
              }}
            >
              <span style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '3px', 
                background: colorMap[status],
                opacity: isActive ? 1 : 0.4,
              }}></span>
              <span style={{ 
                fontSize: '13px', 
                color: isActive ? '#151515' : '#6a6e73', 
                fontFamily: "'RedHatText', sans-serif", 
                fontWeight: 500 
              }}>{status}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ========================================
// V2: CLUSTER COMPONENTS HEALTH (VIEW B - PIVOT POINT)
// ========================================

interface ClusterComponentsHealthProps {
  cluster: ClusterData;
  onComponentClick: (component: AlertComponent) => void;
  onBackToFleet: () => void;
  groupFilter?: AlertGroup[];
}

const ClusterComponentsHealth: React.FC<ClusterComponentsHealthProps> = ({
  cluster,
  onComponentClick,
  onBackToFleet,
  groupFilter = [],
}) => {
  // Define component metadata with icons
  // Components are organized by Alert Scope:
  // - Cluster: Components related to cluster control plane health (API server, etcd, scheduler, controller, network)
  // - Namespace: Components related to user applications and services (workloads, pods, storage, quotas)
  const componentMeta: Record<AlertComponent, { displayName: string; icon: React.ReactNode; impactGroup: 'Cluster' | 'Namespace' }> = {
    'kube-apiserver': { displayName: 'API Server', icon: <ServerIcon />, impactGroup: 'Cluster' },
    'etcd': { displayName: 'etcd', icon: <CubesIcon />, impactGroup: 'Cluster' },
    'Scheduler': { displayName: 'Scheduler', icon: <ClockIcon />, impactGroup: 'Cluster' },
    'Controller': { displayName: 'Controller Manager', icon: <CogIcon />, impactGroup: 'Cluster' },
    'Network': { displayName: 'Network', icon: <PortIcon />, impactGroup: 'Cluster' },
    'Storage': { displayName: 'Storage', icon: <CubeIcon />, impactGroup: 'Namespace' },
    'Workload': { displayName: 'Workloads', icon: <CubesIcon />, impactGroup: 'Namespace' },
    'Pod': { displayName: 'Pods', icon: <CubeIcon />, impactGroup: 'Namespace' },
    'Quota': { displayName: 'Resource Quotas', icon: <TachometerAltIcon />, impactGroup: 'Namespace' },
  };

  // Calculate component health data from cluster alerts
  const componentHealthData: ComponentHealthData[] = React.useMemo(() => {
    const firingAlerts = cluster.alerts.filter(a => a.status === 'firing');
    const components: AlertComponent[] = ['kube-apiserver', 'etcd', 'Scheduler', 'Controller', 'Storage', 'Network', 'Workload', 'Pod', 'Quota'];
    
    // Filter components by alert scope if groupFilter is active
    const filteredComponents = groupFilter.length > 0 
      ? components.filter(component => groupFilter.includes(componentMeta[component].impactGroup))
      : components;
    
    return filteredComponents.map(component => {
      const componentAlerts = firingAlerts.filter(a => a.component === component);
      const criticalCount = componentAlerts.filter(a => a.severity === 'Critical').length;
      const warningCount = componentAlerts.filter(a => a.severity === 'Warning').length;
      const infoCount = componentAlerts.filter(a => a.severity === 'Info').length;
      
      let healthStatus: 'critical' | 'warning' | 'info' | 'healthy' = 'healthy';
      if (criticalCount > 0) healthStatus = 'critical';
      else if (warningCount > 0) healthStatus = 'warning';
      else if (infoCount > 0) healthStatus = 'info';
      
      const lastAlert = componentAlerts.length > 0 
        ? componentAlerts.sort((a, b) => b.lastFiredTimestamp.getTime() - a.lastFiredTimestamp.getTime())[0]?.lastFired
        : undefined;
      
      return {
        component,
        displayName: componentMeta[component].displayName,
        icon: componentMeta[component].icon,
        alertCount: componentAlerts.length,
        criticalCount,
        warningCount,
        infoCount,
        healthStatus,
        lastAlert,
      };
    }).sort((a, b) => {
      // Sort by health status (critical first, then warning, info, healthy)
      const statusOrder = { critical: 0, warning: 1, info: 2, healthy: 3 };
      return statusOrder[a.healthStatus] - statusOrder[b.healthStatus];
    });
  }, [cluster.alerts, groupFilter]);

  // Calculate cluster health status based on highest severity alert
  const clusterHealthStatus = React.useMemo((): 'critical' | 'warning' | 'info' | 'healthy' => {
    const firingAlerts = cluster.alerts.filter(a => a.status === 'firing');
    const hasCritical = firingAlerts.some(a => a.severity === 'Critical');
    const hasWarning = firingAlerts.some(a => a.severity === 'Warning');
    const hasInfo = firingAlerts.some(a => a.severity === 'Info');
    
    if (hasCritical) return 'critical';
    if (hasWarning) return 'warning';
    if (hasInfo) return 'info';
    return 'healthy';
  }, [cluster.alerts]);

  const getHealthStatusColor = (status: 'critical' | 'warning' | 'info' | 'healthy') => {
    switch (status) {
      case 'critical': return 'var(--pf-t--global--color--status--danger--default)';
      case 'warning': return 'var(--pf-t--global--color--status--warning--default)';
      case 'info': return 'var(--pf-t--global--color--status--info--default)';
      case 'healthy': return 'var(--pf-t--global--color--status--success--default)';
    }
  };

  const getHealthStatusIcon = (status: 'critical' | 'warning' | 'info' | 'healthy') => {
    switch (status) {
      case 'critical': return <Icon status="danger"><ExclamationCircleIcon /></Icon>;
      case 'warning': return <Icon status="warning"><ExclamationTriangleIcon /></Icon>;
      case 'info': return <Icon status="info"><InfoCircleIcon /></Icon>;
      case 'healthy': return <Icon status="success"><CheckCircleIcon /></Icon>;
    }
  };

  const getHealthStatusLabel = (data: ComponentHealthData) => {
    if (data.criticalCount > 0) return { text: `${data.criticalCount} Critical`, color: 'red' as const };
    if (data.warningCount > 0) return { text: `${data.warningCount} Warning`, color: 'gold' as const };
    if (data.infoCount > 0) return { text: `${data.infoCount} Info`, color: 'blue' as const };
    return { text: 'Healthy', color: 'green' as const };
  };

  // Group components by Alert Scope
  const clusterComponents = componentHealthData.filter(c => componentMeta[c.component].impactGroup === 'Cluster');
  const namespaceComponents = componentHealthData.filter(c => componentMeta[c.component].impactGroup === 'Namespace');
  
  // Calculate totals for each alert scope
  const clusterGroupAlerts = cluster.alerts.filter(a => a.status === 'firing' && a.group === 'Cluster');
  const namespaceGroupAlerts = cluster.alerts.filter(a => a.status === 'firing' && a.group === 'Namespace');

  const renderComponentCard = (data: ComponentHealthData) => {
    const statusLabel = getHealthStatusLabel(data);
    return (
      <Card 
        key={data.component} 
        isClickable 
        isSelectable
        onClick={() => onComponentClick(data.component)}
        style={{ 
          cursor: 'pointer',
          borderLeft: `4px solid ${
            data.healthStatus === 'critical' ? 'var(--pf-t--global--color--status--danger--default)' :
            data.healthStatus === 'warning' ? 'var(--pf-t--global--color--status--warning--default)' :
            data.healthStatus === 'info' ? 'var(--pf-t--global--color--status--info--default)' :
            'var(--pf-t--global--color--status--success--default)'
          }`,
        }}
      >
        <CardBody>
          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem>
              <Flex gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsCenter' }}>
                <FlexItem>
                  <Icon size="lg">{data.icon}</Icon>
                </FlexItem>
                <FlexItem>
                  <Stack>
                    <StackItem>
                      <Title headingLevel="h4" size="md">{data.displayName}</Title>
                    </StackItem>
                    {data.lastAlert && (
                      <StackItem>
                        <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                          Last alert: {data.lastAlert}
                        </Content>
                      </StackItem>
                    )}
                  </Stack>
                </FlexItem>
              </Flex>
            </FlexItem>
            <FlexItem>
              <Flex gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsCenter' }}>
                <FlexItem>
                  {data.alertCount > 0 ? (
                    <LabelGroup>
                      {data.criticalCount > 0 && <Label color="red" icon={<ExclamationCircleIcon />}>{data.criticalCount}</Label>}
                      {data.warningCount > 0 && <Label color="orange" icon={<ExclamationTriangleIcon />}>{data.warningCount}</Label>}
                      {data.infoCount > 0 && <Label color="blue" icon={<InfoCircleIcon />}>{data.infoCount}</Label>}
                    </LabelGroup>
                  ) : (
                    <Label color="green" icon={<CheckCircleIcon />}>Healthy</Label>
                  )}
                </FlexItem>
                <FlexItem>
                  <AngleRightIcon />
                </FlexItem>
              </Flex>
            </FlexItem>
          </Flex>
        </CardBody>
      </Card>
    );
  };

  return (
    <div style={{ 
      flex: 1,
      minHeight: 0,
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
      overflow: 'hidden',
    }}>
      {/* Breadcrumb Navigation */}
      <div style={{ 
        padding: '16px 8px', 
        borderBottom: '1px solid var(--pf-t--global--border--color--default)',
        backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
        flexShrink: 0,
      }}>
        <Breadcrumb>
          <BreadcrumbItem>
            <Button variant="link" isInline onClick={onBackToFleet}>
              All Clusters (Treemap)
            </Button>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>{cluster.name}</BreadcrumbItem>
        </Breadcrumb>
      </div>

      {/* Main Content - Scrollable */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px' }}>
        <Stack hasGutter>
          {/* Cluster Health Status Card */}
          <StackItem>
            <Card>
              <CardBody>
                <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                  <FlexItem>
                    <Flex gap={{ default: 'gapLg' }} alignItems={{ default: 'alignItemsCenter' }}>
                      <FlexItem>
                        {/* Cluster Health Status Indicator */}
                        <div style={{ 
                          width: '64px', 
                          height: '64px', 
                          borderRadius: '50%', 
                          backgroundColor: getHealthStatusColor(clusterHealthStatus),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Icon size="xl" style={{ color: 'white' }}>
                            {clusterHealthStatus === 'critical' ? <ExclamationCircleIcon /> :
                             clusterHealthStatus === 'warning' ? <ExclamationTriangleIcon /> :
                             clusterHealthStatus === 'info' ? <InfoCircleIcon /> :
                             <CheckCircleIcon />}
                          </Icon>
                        </div>
                      </FlexItem>
                      <FlexItem>
                        <Stack>
                          <StackItem>
                            <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                              <FlexItem>
                                <Title headingLevel="h2" size="xl">{cluster.name}</Title>
                              </FlexItem>
                              <FlexItem>
                                <Label 
                                  color={clusterHealthStatus === 'critical' ? 'red' : 
                                         clusterHealthStatus === 'warning' ? 'orange' : 
                                         clusterHealthStatus === 'info' ? 'blue' : 'green'}
                                >
                                  {clusterHealthStatus.charAt(0).toUpperCase() + clusterHealthStatus.slice(1)}
                                </Label>
                              </FlexItem>
                            </Flex>
                          </StackItem>
                          <StackItem>
                            <Flex gap={{ default: 'gapMd' }}>
                              <FlexItem>
                                <Label color="grey" icon={<MapMarkerAltIcon />}>{cluster.region}</Label>
                              </FlexItem>
                              <FlexItem>
                                <Label color="grey" icon={<CloudIcon />}>{cluster.cloudProvider}</Label>
                              </FlexItem>
                            </Flex>
                          </StackItem>
                          <StackItem>
                            <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                              {cluster.nodeCount} nodes • {cluster.podCount} pods
                            </Content>
                          </StackItem>
                        </Stack>
                      </FlexItem>
                    </Flex>
                  </FlexItem>
                  <FlexItem>
                    <Flex gap={{ default: 'gapLg' }}>
                      <FlexItem>
                        <Stack>
                          <StackItem>
                            <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>Total Alerts</Content>
                          </StackItem>
                          <StackItem>
                            <Title headingLevel="h3" size="lg">
                              {cluster.alerts.filter(a => a.status === 'firing').length}
                            </Title>
                          </StackItem>
                        </Stack>
                      </FlexItem>
                      <Divider orientation={{ default: 'vertical' }} />
                      <FlexItem>
                        <Stack>
                          <StackItem>
                            <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>Critical</Content>
                          </StackItem>
                          <StackItem>
                            <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                              <Icon status="danger"><ExclamationCircleIcon /></Icon>
                              <Title headingLevel="h3" size="lg" style={{ color: 'var(--pf-t--global--color--status--danger--default)' }}>
                                {cluster.alerts.filter(a => a.status === 'firing' && a.severity === 'Critical').length}
                              </Title>
                            </Flex>
                          </StackItem>
                        </Stack>
                      </FlexItem>
                      <FlexItem>
                        <Stack>
                          <StackItem>
                            <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>Warning</Content>
                          </StackItem>
                          <StackItem>
                            <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                              <Icon status="warning"><ExclamationTriangleIcon /></Icon>
                              <Title headingLevel="h3" size="lg" style={{ color: 'var(--pf-t--global--color--status--warning--default)' }}>
                                {cluster.alerts.filter(a => a.status === 'firing' && a.severity === 'Warning').length}
                              </Title>
                            </Flex>
                          </StackItem>
                        </Stack>
                      </FlexItem>
                      <FlexItem>
                        <Stack>
                          <StackItem>
                            <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>Info</Content>
                          </StackItem>
                          <StackItem>
                            <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                              <Icon status="info"><InfoCircleIcon /></Icon>
                              <Title headingLevel="h3" size="lg" style={{ color: 'var(--pf-t--global--color--status--info--default)' }}>
                                {cluster.alerts.filter(a => a.status === 'firing' && a.severity === 'Info').length}
                              </Title>
                            </Flex>
                          </StackItem>
                        </Stack>
                      </FlexItem>
                    </Flex>
                  </FlexItem>
                </Flex>
              </CardBody>
            </Card>
          </StackItem>

          {/* Alert Scope: Cluster */}
          <StackItem>
            <Card isPlain>
              <CardHeader>
                <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                  <FlexItem>
                    <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                      <FlexItem><Icon size="lg"><ClusterIcon /></Icon></FlexItem>
                      <FlexItem>
                        <Title headingLevel="h3" size="lg">Cluster</Title>
                      </FlexItem>
                      <FlexItem>
                        <Tooltip content="Monitor the health and stability of your control plane with these alerts. They cover foundational components like the Kubernetes API server, etcd database, and the scheduler. You can also add your own custom cluster components to this group to keep your foundation strong.">
                          <QuestionCircleIcon style={{ cursor: 'help', color: 'var(--pf-t--global--icon--color--subtle)' }} />
                        </Tooltip>
                      </FlexItem>
                      <FlexItem>
                        <Badge isRead>{clusterGroupAlerts.length} alerts</Badge>
                      </FlexItem>
                    </Flex>
                  </FlexItem>
                  <FlexItem>
                    <Flex gap={{ default: 'gapSm' }}>
                      {clusterGroupAlerts.filter(a => a.severity === 'Critical').length > 0 && (
                        <Label color="red" icon={<ExclamationCircleIcon />}>
                          {clusterGroupAlerts.filter(a => a.severity === 'Critical').length} Critical
                        </Label>
                      )}
                      {clusterGroupAlerts.filter(a => a.severity === 'Warning').length > 0 && (
                        <Label color="orange" icon={<ExclamationTriangleIcon />}>
                          {clusterGroupAlerts.filter(a => a.severity === 'Warning').length} Warning
                        </Label>
                      )}
                    </Flex>
                  </FlexItem>
                </Flex>
              </CardHeader>
              <CardBody>
                <Content component="p" style={{ marginBottom: '16px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                  Alerts related to the health and stability of the cluster's control plane. Covers foundational components like the Kubernetes API server, etcd database, scheduler, and network.
                </Content>
                <Grid hasGutter md={6} lg={4}>
                  {clusterComponents.map(renderComponentCard)}
                </Grid>
              </CardBody>
            </Card>
          </StackItem>

          {/* Alert Scope: Namespace */}
          <StackItem>
            <Card isPlain>
              <CardHeader>
                <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                  <FlexItem>
                    <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                      <FlexItem><Icon size="lg"><CubesIcon /></Icon></FlexItem>
                      <FlexItem>
                        <Title headingLevel="h3" size="lg">Namespace</Title>
                      </FlexItem>
                      <FlexItem>
                        <Tooltip content="Track the performance and resources of your worker cluster to stay ahead of issues. This group includes alerts for high CPU or memory use, disk pressure, and node network connectivity. You can also add custom node components to this group to better manage your specific application environments.">
                          <QuestionCircleIcon style={{ cursor: 'help', color: 'var(--pf-t--global--icon--color--subtle)' }} />
                        </Tooltip>
                      </FlexItem>
                      <FlexItem>
                        <Badge isRead>{namespaceGroupAlerts.length} alerts</Badge>
                      </FlexItem>
                    </Flex>
                  </FlexItem>
                  <FlexItem>
                    <Flex gap={{ default: 'gapSm' }}>
                      {namespaceGroupAlerts.filter(a => a.severity === 'Critical').length > 0 && (
                        <Label color="red" icon={<ExclamationCircleIcon />}>
                          {namespaceGroupAlerts.filter(a => a.severity === 'Critical').length} Critical
                        </Label>
                      )}
                      {namespaceGroupAlerts.filter(a => a.severity === 'Warning').length > 0 && (
                        <Label color="orange" icon={<ExclamationTriangleIcon />}>
                          {namespaceGroupAlerts.filter(a => a.severity === 'Warning').length} Warning
                        </Label>
                      )}
                    </Flex>
                  </FlexItem>
                </Flex>
              </CardHeader>
              <CardBody>
                <Content component="p" style={{ marginBottom: '16px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                  Alerts focused on user applications and services. Reports on the health and behavior of workloads, including pod crashes, replica mismatches, storage issues, and resource quota violations within a namespace.
                </Content>
                <Grid hasGutter md={6} lg={4}>
                  {namespaceComponents.map(renderComponentCard)}
                </Grid>
              </CardBody>
            </Card>
          </StackItem>
        </Stack>
      </div>
    </div>
  );
};

// ========================================
// FILTER PANEL COMPONENT
// ========================================

interface FilterPanelProps {
  regionFilter: string[];
  setRegionFilter: (v: string[]) => void;
  clusterFilter: string[];
  setClusterFilter: (v: string[]) => void;
  namespaceFilter: string[];
  setNamespaceFilter: (v: string[]) => void;
  labelFilter: string[];
  setLabelFilter: (v: string[]) => void;
  severityFilter: AlertSeverity[];
  setSeverityFilter: (v: AlertSeverity[]) => void;
  groupFilter: AlertGroup[];
  setGroupFilter: (v: AlertGroup[]) => void;
  componentFilter: AlertComponent[];
  setComponentFilter: (v: AlertComponent[]) => void;
  regions: string[];
  clusterNames: string[];
  clusters: ClusterData[]; // For cascading region-cluster filter
  namespaces: string[];
  availableLabels: string[];
  onClose: () => void;
  savedFilters: SavedFilter[];
  onApplySavedFilter: (filter: SavedFilter) => void;
  onSaveFilter: (name: string) => void;
  onDeleteSavedFilter: (id: string) => void;
  // Counts for filter options
  regionCounts?: Record<string, number>;
  clusterCounts?: Record<string, number>;
  namespaceCounts?: Record<string, number>;
  // Scope-based filters (show additional alert-specific filters)
  showAlertFilters?: boolean;
  stateFilter?: string[];
  setStateFilter?: (v: string[]) => void;
  sourceFilter?: string[];
  setSourceFilter?: (v: string[]) => void;
  triggeredFromDate?: string;
  setTriggeredFromDate?: (v: string) => void;
  triggeredFromTime?: string;
  setTriggeredFromTime?: (v: string) => void;
  triggeredToDate?: string;
  setTriggeredToDate?: (v: string) => void;
  triggeredToTime?: string;
  setTriggeredToTime?: (v: string) => void;
  // Current alerts sub-tab for dynamic title
  alertsSubTab?: 'clusters-health' | 'firing-alerts';
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  regionFilter, setRegionFilter,
  clusterFilter, setClusterFilter,
  namespaceFilter, setNamespaceFilter,
  labelFilter, setLabelFilter,
  severityFilter, setSeverityFilter,
  groupFilter, setGroupFilter,
  componentFilter, setComponentFilter,
  regions, clusterNames, clusters, namespaces, availableLabels,
  onClose,
  savedFilters, onApplySavedFilter, onSaveFilter, onDeleteSavedFilter,
  regionCounts = {}, clusterCounts = {}, namespaceCounts = {},
  showAlertFilters = false,
  stateFilter = [],
  setStateFilter,
  sourceFilter = [],
  setSourceFilter,
  triggeredFromDate,
  setTriggeredFromDate,
  triggeredFromTime,
  setTriggeredFromTime,
  triggeredToDate,
  setTriggeredToDate,
  triggeredToTime,
  setTriggeredToTime,
  alertsSubTab = 'clusters-health',
}) => {
  const allSeverities: AlertSeverity[] = ['Critical', 'Warning', 'Info'];
  const allGroups: AlertGroup[] = ['Cluster', 'Namespace'];
  const clusterComponents: AlertComponent[] = ['kube-apiserver', 'etcd', 'Scheduler', 'Controller', 'Network'];
  const namespaceComponents: AlertComponent[] = ['Workload', 'Pod', 'Storage', 'Quota', 'Network'];
  const allComponents: AlertComponent[] = ['kube-apiserver', 'Storage', 'Network', 'etcd', 'Scheduler', 'Controller', 'Workload', 'Pod', 'Quota'];
  const allStates = ['firing', 'pending', 'acknowledged'];
  const allSources = ['Platform', 'User-defined'];

  // Dropdown open states
  const [isRegionOpen, setIsRegionOpen] = React.useState(false);
  const [isClusterOpen, setIsClusterOpen] = React.useState(false);
  const [isNamespaceOpen, setIsNamespaceOpen] = React.useState(false);
  const [isLabelOpen, setIsLabelOpen] = React.useState(false);
  const [isComponentOpen, setIsComponentOpen] = React.useState(false);
  const [isStateOpen, setIsStateOpen] = React.useState(false);
  const [isSourceOpen, setIsSourceOpen] = React.useState(false);

  // Search values for dropdowns
  const [regionSearchValue, setRegionSearchValue] = React.useState('');
  const [clusterSearchValue, setClusterSearchValue] = React.useState('');
  const [namespaceSearchValue, setNamespaceSearchValue] = React.useState('');
  const [labelSearchValue, setLabelSearchValue] = React.useState('');
  const [componentSearchValue, setComponentSearchValue] = React.useState('');

  // Check if filters differ from Global View default
  const isGlobalView = groupFilter.length === 2 && groupFilter.includes('Cluster') && groupFilter.includes('Namespace');
  const hasGroupFilterChanges = !isGlobalView;
  
  const hasActiveFilters = regionFilter.length > 0 || clusterFilter.length > 0 || namespaceFilter.length > 0 || 
    labelFilter.length > 0 || severityFilter.length > 0 || hasGroupFilterChanges || componentFilter.length > 0;

  // Auto-clear cluster selections when their regions are deselected
  React.useEffect(() => {
    if (regionFilter.length > 0 && clusterFilter.length > 0) {
      const validClusterNames = clusters
        .filter(cluster => regionFilter.includes(cluster.region))
        .map(cluster => cluster.name);
      
      const updatedClusterFilter = clusterFilter.filter(clusterName => 
        validClusterNames.includes(clusterName)
      );
      
      if (updatedClusterFilter.length !== clusterFilter.length) {
        setClusterFilter(updatedClusterFilter);
      }
    }
  }, [regionFilter, clusters]); // Only watch regionFilter changes

  // Auto-clear namespace selections when their clusters are deselected
  React.useEffect(() => {
    if (clusterFilter.length > 0 && namespaceFilter.length > 0) {
      const validNamespaces = clusters
        .filter(cluster => clusterFilter.includes(cluster.name))
        .flatMap(cluster => cluster.namespaces);
      const uniqueValidNamespaces = Array.from(new Set(validNamespaces));
      
      const updatedNamespaceFilter = namespaceFilter.filter(namespaceName => 
        uniqueValidNamespaces.includes(namespaceName)
      );
      
      if (updatedNamespaceFilter.length !== namespaceFilter.length) {
        setNamespaceFilter(updatedNamespaceFilter);
      }
    }
  }, [clusterFilter, clusters]); // Only watch clusterFilter changes

  const clearAllFilters = () => {
    setRegionFilter([]);
    setClusterFilter([]);
    setNamespaceFilter([]);
    setLabelFilter([]);
    setSeverityFilter([]);
    setGroupFilter(['Cluster', 'Namespace']); // Reset to default with both groups selected
    setComponentFilter([]);
    setTriggeredFromDate?.('');
    setTriggeredFromTime?.('');
    setTriggeredToDate?.('');
    setTriggeredToTime?.('');
  };

  // Get available components based on selected groups
  const getAvailableComponents = (): AlertComponent[] => {
    if (groupFilter.length === 0) return allComponents;
    let components: AlertComponent[] = [];
    if (groupFilter.includes('Cluster')) {
      components = [...components, ...clusterComponents];
    }
    if (groupFilter.includes('Namespace')) {
      components = [...components, ...namespaceComponents];
    }
    return Array.from(new Set(components));
  };

  const availableComponents = getAvailableComponents();

  // Filtered options based on search and cascading filters
  const filteredRegions = regions.filter(r => r.toLowerCase().includes(regionSearchValue.toLowerCase()));
  
  // Cascade filter: If regions are selected, only show clusters from those regions
  const filteredClusters = React.useMemo(() => {
    let availableClusters = clusterNames;
    
    // If regions are selected, filter clusters to only those in selected regions
    if (regionFilter.length > 0) {
      const clusterNamesInSelectedRegions = clusters
        .filter(cluster => regionFilter.includes(cluster.region))
        .map(cluster => cluster.name);
      availableClusters = clusterNames.filter(name => clusterNamesInSelectedRegions.includes(name));
    }
    
    // Apply search filter
    return availableClusters.filter(c => c.toLowerCase().includes(clusterSearchValue.toLowerCase()));
  }, [clusterNames, clusters, regionFilter, clusterSearchValue]);
  
  // Cascade filter: If clusters are selected, only show namespaces from those clusters
  const filteredNamespaces = React.useMemo(() => {
    let availableNamespaces = namespaces;
    
    // If clusters are selected, filter namespaces to only those in selected clusters
    if (clusterFilter.length > 0) {
      const namespacesInSelectedClusters = clusters
        .filter(cluster => clusterFilter.includes(cluster.name))
        .flatMap(cluster => cluster.namespaces);
      const uniqueNamespaces = Array.from(new Set(namespacesInSelectedClusters));
      availableNamespaces = namespaces.filter(name => uniqueNamespaces.includes(name));
    }
    
    // Apply search filter
    return availableNamespaces.filter(n => n.toLowerCase().includes(namespaceSearchValue.toLowerCase()));
  }, [namespaces, clusters, clusterFilter, namespaceSearchValue]);
  
  const filteredLabels = availableLabels.filter(l => l.toLowerCase().includes(labelSearchValue.toLowerCase()));
  const filteredComponents = availableComponents.filter(c => c.toLowerCase().includes(componentSearchValue.toLowerCase()));

  const filterTitle = alertsSubTab === 'firing-alerts' ? 'Filter Fleet Alerts' : 'Filter Fleet';

  return (
    <Card>
      <CardHeader>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem><CardTitle><FilterIcon /> {filterTitle}</CardTitle></FlexItem>
          <FlexItem>
            <Button variant="plain" aria-label="Close filters" onClick={onClose}>
              <TimesIcon />
            </Button>
          </FlexItem>
        </Flex>
      </CardHeader>
      <CardBody>
        <Stack hasGutter>
          {/* Region Dropdown */}
          <StackItem>
            <Content component="small" className="pf-v6-u-mb-sm"><strong>Region</strong></Content>
            <Select
              role="menu"
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() => setIsRegionOpen(!isRegionOpen)}
                  isExpanded={isRegionOpen}
                  style={{ width: '100%' }}
                  icon={<MapMarkerAltIcon />}
                >
                  {regionFilter.length > 0 ? `${regionFilter.length} selected` : 'Select regions'}
                </MenuToggle>
              )}
              isOpen={isRegionOpen}
              onOpenChange={setIsRegionOpen}
              onSelect={(_, value) => {
                const val = value as string;
                if (regionFilter.includes(val)) {
                  setRegionFilter(regionFilter.filter(r => r !== val));
                } else {
                  setRegionFilter([...regionFilter, val]);
                }
              }}
            >
              <div style={{ padding: '8px' }}>
                <SearchInput
                  placeholder="Search regions..."
                  value={regionSearchValue}
                  onChange={(_, value) => setRegionSearchValue(value)}
                  onClear={() => setRegionSearchValue('')}
                />
              </div>
              <Divider />
              <SelectList>
                {filteredRegions.map(region => (
                  <SelectOption key={region} value={region} hasCheckbox isSelected={regionFilter.includes(region)}>
                    {region} {regionCounts[region] !== undefined && `(${regionCounts[region]})`}
                  </SelectOption>
                ))}
                {filteredRegions.length === 0 && (
                  <SelectOption isDisabled>No regions found</SelectOption>
                )}
              </SelectList>
            </Select>
          </StackItem>

          <Divider />

          {/* Cluster Dropdown */}
          <StackItem>
            <Content component="small" className="pf-v6-u-mb-sm"><strong>Cluster</strong></Content>
            <Select
              role="menu"
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() => setIsClusterOpen(!isClusterOpen)}
                  isExpanded={isClusterOpen}
                  style={{ width: '100%' }}
                  icon={<ClusterIcon />}
                >
                  {clusterFilter.length > 0 ? `${clusterFilter.length} selected` : 'Select clusters'}
                </MenuToggle>
              )}
              isOpen={isClusterOpen}
              onOpenChange={setIsClusterOpen}
              onSelect={(_, value) => {
                const val = value as string;
                if (clusterFilter.includes(val)) {
                  setClusterFilter(clusterFilter.filter(c => c !== val));
                } else {
                  setClusterFilter([...clusterFilter, val]);
                }
              }}
            >
              <div style={{ padding: '8px' }}>
                <SearchInput
                  placeholder="Search clusters..."
                  value={clusterSearchValue}
                  onChange={(_, value) => setClusterSearchValue(value)}
                  onClear={() => setClusterSearchValue('')}
                />
              </div>
              <Divider />
              <SelectList style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {filteredClusters.map(cluster => (
                  <SelectOption key={cluster} value={cluster} hasCheckbox isSelected={clusterFilter.includes(cluster)}>
                    {cluster} {clusterCounts[cluster] !== undefined && `(${clusterCounts[cluster]})`}
                  </SelectOption>
                ))}
                {filteredClusters.length === 0 && (
                  <SelectOption isDisabled>No clusters found</SelectOption>
                )}
              </SelectList>
            </Select>
            <div style={{ 
              fontSize: '12px', 
              color: 'var(--pf-t--global--text--color--subtle)', 
              marginTop: '4px',
              fontStyle: 'italic'
            }}>
              {regionFilter.length > 0 ? 'Filtered by region' : 'Showing all clusters'}
            </div>
          </StackItem>

          <Divider />

          {/* Namespace Dropdown */}
          <StackItem>
            <Content component="small" className="pf-v6-u-mb-sm"><strong>Namespace</strong></Content>
            <Select
              role="menu"
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() => setIsNamespaceOpen(!isNamespaceOpen)}
                  isExpanded={isNamespaceOpen}
                  style={{ width: '100%' }}
                  icon={<CubesIcon />}
                >
                  {namespaceFilter.length > 0 ? `${namespaceFilter.length} selected` : 'Select namespaces'}
                </MenuToggle>
              )}
              isOpen={isNamespaceOpen}
              onOpenChange={setIsNamespaceOpen}
              onSelect={(_, value) => {
                const val = value as string;
                if (namespaceFilter.includes(val)) {
                  setNamespaceFilter(namespaceFilter.filter(n => n !== val));
                } else {
                  setNamespaceFilter([...namespaceFilter, val]);
                }
              }}
            >
              <div style={{ padding: '8px' }}>
                <SearchInput
                  placeholder="Search namespaces..."
                  value={namespaceSearchValue}
                  onChange={(_, value) => setNamespaceSearchValue(value)}
                  onClear={() => setNamespaceSearchValue('')}
                />
              </div>
              <Divider />
              <SelectList style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {filteredNamespaces.map(ns => (
                  <SelectOption key={ns} value={ns} hasCheckbox isSelected={namespaceFilter.includes(ns)}>
                    {ns} {namespaceCounts[ns] !== undefined && `(${namespaceCounts[ns]})`}
                  </SelectOption>
                ))}
                {filteredNamespaces.length === 0 && (
                  <SelectOption isDisabled>No namespaces found</SelectOption>
                )}
              </SelectList>
            </Select>
            <div style={{ 
              fontSize: '12px', 
              color: 'var(--pf-t--global--text--color--subtle)', 
              marginTop: '4px',
              fontStyle: 'italic'
            }}>
              {clusterFilter.length > 0 ? 'Filtered by cluster' : 'Showing all namespaces'}
            </div>
          </StackItem>

          <Divider />

          {/* Labels Dropdown */}
          <StackItem>
            <Content component="small" className="pf-v6-u-mb-sm"><strong>Labels</strong></Content>
            <Select
              role="menu"
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() => setIsLabelOpen(!isLabelOpen)}
                  isExpanded={isLabelOpen}
                  style={{ width: '100%' }}
                  icon={<FilterIcon />}
                >
                  {labelFilter.length > 0 ? `${labelFilter.length} selected` : 'Select labels'}
                </MenuToggle>
              )}
              isOpen={isLabelOpen}
              onOpenChange={setIsLabelOpen}
              onSelect={(_, value) => {
                const val = value as string;
                if (labelFilter.includes(val)) {
                  setLabelFilter(labelFilter.filter(l => l !== val));
                } else {
                  setLabelFilter([...labelFilter, val]);
                }
              }}
            >
              <div style={{ padding: '8px' }}>
                <SearchInput
                  placeholder="Search labels..."
                  value={labelSearchValue}
                  onChange={(_, value) => setLabelSearchValue(value)}
                  onClear={() => setLabelSearchValue('')}
                />
              </div>
              <Divider />
              <SelectList style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {filteredLabels.map(label => (
                  <SelectOption key={label} value={label} hasCheckbox isSelected={labelFilter.includes(label)}>
                    {label}
                  </SelectOption>
                ))}
                {filteredLabels.length === 0 && (
                  <SelectOption isDisabled>No labels found</SelectOption>
                )}
              </SelectList>
            </Select>
          </StackItem>

          <Divider />

          {/* Severity with colored labels */}
          <StackItem>
            <Content component="small" className="pf-v6-u-mb-sm"><strong>Severity</strong></Content>
            <Flex gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }}>
              {allSeverities.map(sev => (
                <FlexItem key={sev}>
                  <Label
                    color={getSeverityLabelColor(sev)}
                    icon={getSeverityIcon(sev)}
                    onClick={() => {
                      if (severityFilter.includes(sev)) {
                        setSeverityFilter(severityFilter.filter(s => s !== sev));
                      } else {
                        setSeverityFilter([...severityFilter, sev]);
                      }
                    }}
                    style={{ 
                      cursor: 'pointer',
                      opacity: severityFilter.length === 0 || severityFilter.includes(sev) ? 1 : 0.5,
                      border: severityFilter.includes(sev) ? '2px solid var(--pf-t--global--border--color--default)' : '2px solid transparent'
                    }}
                  >
                    {sev}
                  </Label>
                </FlexItem>
              ))}
            </Flex>
            {severityFilter.length > 0 && (
              <Button variant="link" size="sm" onClick={() => setSeverityFilter([])} style={{ marginTop: '4px', padding: 0 }}>
                Clear severity
              </Button>
            )}
          </StackItem>

          <Divider />

          {/* Alert Scope Toggle Group */}
          <StackItem>
            <Content component="small" className="pf-v6-u-mb-sm"><strong>Alert scope</strong></Content>
            <ToggleGroup isCompact>
              <ToggleGroupItem
                text="All"
                aria-label="All scopes"
                buttonId="alert-scope-all"
                isSelected={groupFilter.length === 2}
                onChange={(_, selected) => {
                  if (selected) {
                    setGroupFilter(['Cluster', 'Namespace']);
                  }
                }}
              />
              <ToggleGroupItem
                text="Cluster"
                aria-label="Cluster scope"
                buttonId="alert-scope-cluster"
                isSelected={groupFilter.length === 1 && groupFilter.includes('Cluster')}
                onChange={(_, selected) => {
                  if (selected) {
                    setGroupFilter(['Cluster']);
                  }
                }}
              />
              <ToggleGroupItem
                text="Namespace"
                aria-label="Namespace scope"
                buttonId="alert-scope-namespace"
                isSelected={groupFilter.length === 1 && groupFilter.includes('Namespace')}
                onChange={(_, selected) => {
                  if (selected) {
                    setGroupFilter(['Namespace']);
                  }
                }}
              />
            </ToggleGroup>
          </StackItem>

          <Divider />

          {/* Component Dropdown (based on selected group) */}
          <StackItem>
            <Content component="small" className="pf-v6-u-mb-sm">
              <strong>
                {groupFilter.length === 2 ? 'Affected component' : groupFilter.length > 0 ? `Affected component (in: ${groupFilter.map(g => `Alert scope: ${g}`).join(', ')})` : 'Affected component'}
              </strong>
            </Content>
            <Select
              role="menu"
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() => setIsComponentOpen(!isComponentOpen)}
                  isExpanded={isComponentOpen}
                  style={{ width: '100%' }}
                  icon={<CogIcon />}
                >
                  {componentFilter.length > 0 ? `${componentFilter.length} selected` : 'Select components'}
                </MenuToggle>
              )}
              isOpen={isComponentOpen}
              onOpenChange={setIsComponentOpen}
              onSelect={(_, value) => {
                const val = value as AlertComponent;
                if (componentFilter.includes(val)) {
                  setComponentFilter(componentFilter.filter(c => c !== val));
                } else {
                  setComponentFilter([...componentFilter, val]);
                }
              }}
            >
              <div style={{ padding: '8px' }}>
                <SearchInput
                  placeholder="Search components..."
                  value={componentSearchValue}
                  onChange={(_, value) => setComponentSearchValue(value)}
                  onClear={() => setComponentSearchValue('')}
                />
              </div>
              <Divider />
              <SelectList>
                {filteredComponents.map(comp => (
                  <SelectOption key={comp} value={comp} hasCheckbox isSelected={componentFilter.includes(comp)}>
                    {comp}
                  </SelectOption>
                ))}
                {filteredComponents.length === 0 && (
                  <SelectOption isDisabled>No components found</SelectOption>
                )}
              </SelectList>
            </Select>
            {/* Helper text for component filter */}
            <div style={{ 
              fontSize: '12px', 
              color: 'var(--pf-t--global--text--color--subtle)', 
              marginTop: '4px' 
            }}>
              {componentFilter.length === 0 ? 'Showing all components' : `Showing ${componentFilter.length} selected component${componentFilter.length !== 1 ? 's' : ''}`}
            </div>
          </StackItem>

          {/* Alert-specific filters (shown when in firing alerts scope) */}
          {showAlertFilters && (
            <>
              <Divider />
              <StackItem>
                <Content component="small" style={{ fontWeight: 'bold', color: 'var(--pf-t--global--text--color--regular)' }}>
                  Alert Filters
                </Content>
              </StackItem>

              {/* State Filter */}
              <StackItem>
                <Select
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle 
                      ref={toggleRef} 
                      onClick={() => setIsStateOpen(!isStateOpen)} 
                      isExpanded={isStateOpen}
                      isFullWidth
                    >
                      {stateFilter.length === 0 ? 'State' : `${stateFilter.length} selected`}
                    </MenuToggle>
                  )}
                  onSelect={(_, value) => {
                    const val = value as string;
                    if (setStateFilter) {
                      if (stateFilter.includes(val)) {
                        setStateFilter(stateFilter.filter(s => s !== val));
                      } else {
                        setStateFilter([...stateFilter, val]);
                      }
                    }
                  }}
                  isOpen={isStateOpen}
                  onOpenChange={setIsStateOpen}
                  selected={stateFilter}
                >
                  <SelectList>
                    {allStates.map(state => (
                      <SelectOption 
                        key={state} 
                        value={state} 
                        hasCheckbox 
                        isSelected={stateFilter.includes(state)}
                      >
                        {state.charAt(0).toUpperCase() + state.slice(1)}
                      </SelectOption>
                    ))}
                  </SelectList>
                </Select>
              </StackItem>

              {/* Source Filter */}
              <StackItem>
                <Select
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle 
                      ref={toggleRef} 
                      onClick={() => setIsSourceOpen(!isSourceOpen)} 
                      isExpanded={isSourceOpen}
                      isFullWidth
                    >
                      {sourceFilter.length === 0 ? 'Source' : `${sourceFilter.length} selected`}
                    </MenuToggle>
                  )}
                  onSelect={(_, value) => {
                    const val = value as string;
                    if (setSourceFilter) {
                      if (sourceFilter.includes(val)) {
                        setSourceFilter(sourceFilter.filter(s => s !== val));
                      } else {
                        setSourceFilter([...sourceFilter, val]);
                      }
                    }
                  }}
                  isOpen={isSourceOpen}
                  onOpenChange={setIsSourceOpen}
                  selected={sourceFilter}
                >
                  <SelectList>
                    {allSources.map(source => (
                      <SelectOption 
                        key={source} 
                        value={source} 
                        hasCheckbox 
                        isSelected={sourceFilter.includes(source)}
                      >
                        {source}
                      </SelectOption>
                    ))}
                  </SelectList>
                </Select>
              </StackItem>

              {/* Triggered Time Range Filters */}
              <StackItem>
                <Content component="small" className="pf-v6-u-mb-sm"><strong>Triggered</strong></Content>
                <Stack hasGutter>
                  <StackItem>
                    <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', marginBottom: '4px', display: 'block' }}>From</Content>
                    <Flex gap={{ default: 'gapSm' }}>
                      <FlexItem flex={{ default: 'flex_1' }}>
                        <DatePicker
                          value={triggeredFromDate || ''}
                          onChange={(_, str) => setTriggeredFromDate && setTriggeredFromDate(str)}
                          placeholder="YYYY-MM-DD"
                          style={{ width: '100%' }}
                        />
                      </FlexItem>
                      <FlexItem style={{ width: '90px' }}>
                        <TimePicker
                          time={triggeredFromTime || ''}
                          onChange={(_, time) => setTriggeredFromTime && setTriggeredFromTime(time)}
                          placeholder="HH:MM"
                          is24Hour
                          style={{ width: '100%' }}
                          menuAppendTo={() => document.body}
                        />
                      </FlexItem>
                    </Flex>
                  </StackItem>
                  <StackItem>
                    <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', marginBottom: '4px', display: 'block' }}>To</Content>
                    <Flex gap={{ default: 'gapSm' }}>
                      <FlexItem flex={{ default: 'flex_1' }}>
                        <DatePicker
                          value={triggeredToDate || ''}
                          onChange={(_, str) => setTriggeredToDate && setTriggeredToDate(str)}
                          placeholder="YYYY-MM-DD"
                          style={{ width: '100%' }}
                        />
                      </FlexItem>
                      <FlexItem style={{ width: '90px' }}>
                        <TimePicker
                          time={triggeredToTime || ''}
                          onChange={(_, time) => setTriggeredToTime && setTriggeredToTime(time)}
                          placeholder="HH:MM"
                          is24Hour
                          style={{ width: '100%' }}
                          menuAppendTo={() => document.body}
                        />
                      </FlexItem>
                    </Flex>
                  </StackItem>
                </Stack>
              </StackItem>
            </>
          )}

          {/* Triggered Time Range Filters - Available for Clusters Health too */}
          {!showAlertFilters && (
            <>
              <Divider />
              <StackItem>
                <Content component="small" className="pf-v6-u-mb-sm"><strong>Triggered</strong></Content>
                <Stack hasGutter>
                  <StackItem>
                    <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', marginBottom: '4px', display: 'block' }}>From</Content>
                    <Flex gap={{ default: 'gapSm' }}>
                      <FlexItem flex={{ default: 'flex_1' }}>
                        <DatePicker
                          value={triggeredFromDate || ''}
                          onChange={(_, str) => setTriggeredFromDate && setTriggeredFromDate(str)}
                          placeholder="YYYY-MM-DD"
                          style={{ width: '100%' }}
                        />
                      </FlexItem>
                      <FlexItem style={{ width: '90px' }}>
                        <TimePicker
                          time={triggeredFromTime || ''}
                          onChange={(_, time) => setTriggeredFromTime && setTriggeredFromTime(time)}
                          placeholder="HH:MM"
                          is24Hour
                          style={{ width: '100%' }}
                          menuAppendTo={() => document.body}
                        />
                      </FlexItem>
                    </Flex>
                  </StackItem>
                  <StackItem>
                    <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', marginBottom: '4px', display: 'block' }}>To</Content>
                    <Flex gap={{ default: 'gapSm' }}>
                      <FlexItem flex={{ default: 'flex_1' }}>
                        <DatePicker
                          value={triggeredToDate || ''}
                          onChange={(_, str) => setTriggeredToDate && setTriggeredToDate(str)}
                          placeholder="YYYY-MM-DD"
                          style={{ width: '100%' }}
                        />
                      </FlexItem>
                      <FlexItem style={{ width: '90px' }}>
                        <TimePicker
                          time={triggeredToTime || ''}
                          onChange={(_, time) => setTriggeredToTime && setTriggeredToTime(time)}
                          placeholder="HH:MM"
                          is24Hour
                          style={{ width: '100%' }}
                          menuAppendTo={() => document.body}
                        />
                      </FlexItem>
                    </Flex>
                  </StackItem>
                </Stack>
              </StackItem>
            </>
          )}

          {hasActiveFilters && (
            <>
              <Divider />
              <StackItem>
                <Button variant="link" onClick={clearAllFilters} icon={<TimesIcon />}>
                  Clear all filters
                </Button>
              </StackItem>
            </>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
};

// ========================================
// ALL ALERTS CARD (COMBINED WITH INSIGHTS)
// ========================================

interface AggregatedAlert {
  alertName: string;
  severity: AlertSeverity;
  totalCount: number;
  clusters: { name: string; cluster: ClusterData; count: number; lastFired: string; lastFiredTimestamp: Date }[];
  component: AlertComponent;
  group: AlertGroup;
}

type AlertsGroupByOption = 'none' | 'time' | 'severity' | 'alertName' | 'impact' | 'component' | 'cluster';

interface AllAlertsCardProps {
  clusters: ClusterData[];
  alertNameFilter: string | null;
  componentFilter: string | null;
  groupFilter?: AlertGroup[];
  onClearAlertNameFilter: () => void;
  onClearComponentFilter: () => void;
  onClusterClick: (cluster: ClusterData) => void;
  onAlertClick: (alert: AlertData, initialTab?: number) => void;
  onAlertRuleClick: (alertName: string) => void;
  onComponentClick: (componentName: string) => void;
  singleClusterView?: boolean;
  groupBy?: AlertsGroupByOption;
  onGroupByChange?: (groupBy: AlertsGroupByOption) => void;
  triggeredFromDate?: string;
  triggeredFromTime?: string;
  triggeredToDate?: string;
  triggeredToTime?: string;
  showMetrics?: boolean;
  totalAlerts?: number;
  criticalAlerts?: number;
  warningAlerts?: number;
  infoAlerts?: number;
  healthyAlerts?: number;
  affectedClusters?: number;
  onCriticalClick?: () => void;
  onWarningClick?: () => void;
  onInfoClick?: () => void;
  onClusterFilterChange?: (clusters: string[]) => void;
  onNamespaceFilterChange?: (namespaces: string[]) => void;
}

const AllAlertsCard: React.FC<AllAlertsCardProps> = ({
  triggeredFromDate,
  triggeredFromTime,
  triggeredToDate,
  triggeredToTime,
  clusters,
  alertNameFilter,
  componentFilter,
  groupFilter = [],
  onClearAlertNameFilter,
  onClearComponentFilter,
  onClusterClick,
  onAlertClick,
  onAlertRuleClick,
  onComponentClick,
  singleClusterView = false,
  groupBy = 'none',
  onGroupByChange,
  showMetrics = false,
  totalAlerts = 0,
  criticalAlerts = 0,
  warningAlerts = 0,
  infoAlerts = 0,
  healthyAlerts = 0,
  affectedClusters = 0,
  onCriticalClick,
  onWarningClick,
  onInfoClick,
  onClusterFilterChange,
  onNamespaceFilterChange,
}) => {
  // Component metadata with alert scopes
  const componentMeta: Record<AlertComponent, { impactGroup: 'Cluster' | 'Namespace' }> = {
    'kube-apiserver': { impactGroup: 'Cluster' },
    'etcd': { impactGroup: 'Cluster' },
    'Scheduler': { impactGroup: 'Cluster' },
    'Controller': { impactGroup: 'Cluster' },
    'Network': { impactGroup: 'Cluster' },
    'Storage': { impactGroup: 'Namespace' },
    'Workload': { impactGroup: 'Namespace' },
    'Pod': { impactGroup: 'Namespace' },
    'Quota': { impactGroup: 'Namespace' },
  };
  
  const [searchValue, setSearchValue] = React.useState('');
  const [severityFilter, setSeverityFilter] = React.useState<AlertSeverity[]>([]);
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [expandedAlerts, setExpandedAlerts] = React.useState<string[]>([]);
  const [isAggregated, setIsAggregated] = React.useState(true);
  const [openActionMenuId, setOpenActionMenuId] = React.useState<string | null>(null);
  const [insightsItemCount, setInsightsItemCount] = React.useState<number>(5);
  const [isInsightsCountOpen, setIsInsightsCountOpen] = React.useState(false);
  const [isGroupByOpen, setIsGroupByOpen] = React.useState(false);
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set());
  
  // Silence modal state
  const [isSilenceModalOpen, setIsSilenceModalOpen] = React.useState(false);
  const [silenceAlertName, setSilenceAlertName] = React.useState<string>('');
  const [silenceSeverity, setSilenceSeverity] = React.useState<string>('');
  const [silenceClusterName, setSilenceClusterName] = React.useState<string>('');
  const [silenceFromDate, setSilenceFromDate] = React.useState<string>(new Date().toISOString().split('T')[0]);
  const [silenceFromTime, setSilenceFromTime] = React.useState<string>('00:00');
  const [silenceDurationType, setSilenceDurationType] = React.useState<'for' | 'until'>('for');
  const [silenceDuration, setSilenceDuration] = React.useState<number>(2);
  const [silenceDurationUnit, setSilenceDurationUnit] = React.useState<'Hours' | 'Days' | 'Weeks'>('Hours');
  const [silenceUntilDate, setSilenceUntilDate] = React.useState<string>('');
  const [silenceUntilTime, setSilenceUntilTime] = React.useState<string>('');
  const [silenceComment, setSilenceComment] = React.useState<string>('');
  const [isSilenceDurationUnitOpen, setIsSilenceDurationUnitOpen] = React.useState(false);
  const [isSilenceParamsExpanded, setIsSilenceParamsExpanded] = React.useState(true);
  
  // Acknowledge modal state
  const [isAcknowledgeModalOpen, setIsAcknowledgeModalOpen] = React.useState(false);
  const [acknowledgeAlertName, setAcknowledgeAlertName] = React.useState<string>('');
  const [acknowledgeSeverity, setAcknowledgeSeverity] = React.useState<string>('');
  const [acknowledgeClusterName, setAcknowledgeClusterName] = React.useState<string>('');
  const [acknowledgeComment, setAcknowledgeComment] = React.useState<string>('');
  const [acknowledgeSilenceChecked, setAcknowledgeSilenceChecked] = React.useState(false);
  const [acknowledgeDurationType, setAcknowledgeDurationType] = React.useState<'for' | 'until'>('for');
  const [acknowledgeDuration, setAcknowledgeDuration] = React.useState<number>(2);
  const [acknowledgeDurationUnit, setAcknowledgeDurationUnit] = React.useState<'Hours' | 'Days' | 'Weeks'>('Hours');
  const [acknowledgeUntilDate, setAcknowledgeUntilDate] = React.useState<string>('');
  const [acknowledgeUntilTime, setAcknowledgeUntilTime] = React.useState<string>('');
  const [isAcknowledgeDurationUnitOpen, setIsAcknowledgeDurationUnitOpen] = React.useState(false);
  
  // Open silence modal with alert info
  const openSilenceModal = (alertName: string, severity: string, clusterName: string) => {
    setSilenceAlertName(alertName);
    setSilenceSeverity(severity);
    setSilenceClusterName(clusterName);
    setSilenceFromDate(new Date().toISOString().split('T')[0]);
    setSilenceFromTime('00:00');
    setSilenceDurationType('for');
    setSilenceDuration(2);
    setSilenceDurationUnit('Hours');
    setSilenceUntilDate('');
    setSilenceUntilTime('');
    setSilenceComment('');
    setIsSilenceModalOpen(true);
    setOpenActionMenuId(null);
  };
  
  // Open acknowledge modal with alert info
  const openAcknowledgeModal = (alertName: string, severity: string, clusterName: string) => {
    setAcknowledgeAlertName(alertName);
    setAcknowledgeSeverity(severity);
    setAcknowledgeClusterName(clusterName);
    setAcknowledgeComment('');
    setAcknowledgeSilenceChecked(false);
    setAcknowledgeDurationType('for');
    setAcknowledgeDuration(2);
    setAcknowledgeDurationUnit('Hours');
    setAcknowledgeUntilDate('');
    setAcknowledgeUntilTime('');
    setIsAcknowledgeModalOpen(true);
    setOpenActionMenuId(null);
  };
  
  // Sorting state - default multi-sort: Severity (primary), Alert scope (secondary), Component (tertiary)
  type SortDirection = 'asc' | 'desc';
  interface SortConfig {
    column: 'alertName' | 'severity' | 'clusters' | 'total' | 'group' | 'component' | 'startTime';
    direction: SortDirection;
    priority: number; // Lower number = higher priority in multi-sort
  }
  const [sortConfigs, setSortConfigs] = React.useState<SortConfig[]>([
    { column: 'severity', direction: 'asc', priority: 1 },
    { column: 'group', direction: 'asc', priority: 2 },
    { column: 'component', direction: 'asc', priority: 3 },
  ]);
  
  // Handle column sort click
  const handleSort = (column: SortConfig['column']) => {
    setSortConfigs(prevConfigs => {
      const existingConfig = prevConfigs.find(c => c.column === column);
      if (existingConfig) {
        // Toggle direction continuously: asc → desc → asc
        if (existingConfig.direction === 'asc') {
          return prevConfigs.map(c => 
            c.column === column ? { ...c, direction: 'desc' as SortDirection } : c
          );
        } else {
          // Cycle back to asc instead of removing
          return prevConfigs.map(c => 
            c.column === column ? { ...c, direction: 'asc' as SortDirection } : c
          );
        }
      } else {
        // Add new column with lowest priority
        const maxPriority = prevConfigs.length > 0 ? Math.max(...prevConfigs.map(c => c.priority)) : 0;
        return [...prevConfigs, { column, direction: 'asc' as SortDirection, priority: maxPriority + 1 }];
      }
    });
    setPage(1);
  };
  
  // Column management state
  interface ColumnConfig {
    key: string;
    label: string;
    isVisible: boolean;
    isLocked: boolean; // Cannot be hidden or reordered
    order: number;
  }
  const MAX_VISIBLE_COLUMNS = 10;
  const [columns, setColumns] = React.useState<ColumnConfig[]>([
    { key: 'alertName', label: 'Alert name', isVisible: true, isLocked: true, order: 0 },
    { key: 'severity', label: 'Severity', isVisible: true, isLocked: true, order: 1 },
    { key: 'total', label: 'Total', isVisible: true, isLocked: false, order: 2 },
    { key: 'clusters', label: 'Cluster', isVisible: true, isLocked: false, order: 3 },
    { key: 'state', label: 'State', isVisible: true, isLocked: false, order: 4 },
    { key: 'group', label: 'Alert scope', isVisible: true, isLocked: false, order: 5 },
    { key: 'component', label: 'Affected component', isVisible: true, isLocked: false, order: 6 },
    { key: 'source', label: 'Source', isVisible: true, isLocked: false, order: 7 },
    { key: 'description', label: 'Description (in: alert)', isVisible: false, isLocked: false, order: 8 },
    { key: 'startTime', label: 'Firing since', isVisible: false, isLocked: false, order: 9 },
    { key: 'flappingRate', label: 'Flapping rate', isVisible: true, isLocked: false, order: 10 },
  ]);
  const [isManageColumnsOpen, setIsManageColumnsOpen] = React.useState(false);
  const [tempColumns, setTempColumns] = React.useState<ColumnConfig[]>([]);
  
  const openManageColumnsModal = () => {
    setTempColumns([...columns]);
    setIsManageColumnsOpen(true);
  };
  
  const handleColumnVisibilityChange = (key: string, isVisible: boolean) => {
    const visibleCount = tempColumns.filter(c => c.isVisible).length;
    // Don't allow exceeding max columns
    if (isVisible && visibleCount >= MAX_VISIBLE_COLUMNS) return;
    
    setTempColumns(prev => prev.map(c => 
      c.key === key ? { ...c, isVisible } : c
    ));
  };
  
  const saveColumnSettings = () => {
    setColumns(tempColumns);
    setIsManageColumnsOpen(false);
  };
  
  const getVisibleColumns = () => columns.filter(c => c.isVisible).sort((a, b) => a.order - b.order);
  
  // Export to CSV
  const exportToCSV = () => {
    const visibleCols = getVisibleColumns();
    const headers = visibleCols.map(c => c.label).join(',');
    
    const rows = filteredAggregatedAlerts.map(agg => {
      return visibleCols.map(col => {
        switch (col.key) {
          case 'alertName': return `"${agg.alertName}"`;
          case 'severity': return agg.severity;
          case 'total': return agg.totalCount;
          case 'state': return 'Firing';
          case 'group': return agg.group || '';
          case 'component': return agg.component || '';
          case 'source': return agg.clusters[0]?.cluster?.alerts?.[0]?.source || '';
          case 'description': return `"${agg.clusters[0]?.cluster?.alerts?.find(a => a.alertName === agg.alertName)?.description || ''}"`;
          case 'startTime': return agg.clusters[0]?.lastFired || '';
          default: return '';
        }
      }).join(',');
    });
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alerts-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  // Get sort indicator for column
  const getSortParams = (column: SortConfig['column']) => {
    const config = sortConfigs.find(c => c.column === column);
    // Always return sort params to make column sortable, but only show active indicator if currently sorted
    return {
      sortBy: {
        index: config ? config.priority - 1 : -1,
        direction: config ? config.direction : 'asc' as SortDirection,
      },
      onSort: () => handleSort(column),
      columnIndex: 0,
    };
  };
  
  // Bulk selection state
  const [selectedAlertKeys, setSelectedAlertKeys] = React.useState<Set<string>>(new Set());
  const [isDurationUnitOpen, setIsDurationUnitOpen] = React.useState(false);
  
  // Toggle selection for a single alert
  const toggleAlertSelection = (alertKey: string) => {
    setSelectedAlertKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(alertKey)) {
        newSet.delete(alertKey);
      } else {
        newSet.add(alertKey);
      }
      return newSet;
    });
  };
  
  // Select/deselect all visible alerts
  const toggleSelectAll = () => {
    const visibleKeys = paginatedAggregatedAlerts.map(agg => `${agg.alertName}-${agg.severity}`);
    const allSelected = visibleKeys.every(key => selectedAlertKeys.has(key));
    
    if (allSelected) {
      setSelectedAlertKeys(prev => {
        const newSet = new Set(prev);
        visibleKeys.forEach(key => newSet.delete(key));
        return newSet;
      });
    } else {
      setSelectedAlertKeys(prev => {
        const newSet = new Set(prev);
        visibleKeys.forEach(key => newSet.add(key));
        return newSet;
      });
    }
  };

  // Get all alerts with cluster info
  const allAlerts = React.useMemo(() => {
    return clusters.flatMap(cluster => 
      cluster.alerts.map(alert => ({ ...alert, clusterName: cluster.name, cluster }))
    ).filter(a => a.status === 'firing');
  }, [clusters]);

  // Create aggregated alerts (grouped by alert name and severity)
  const aggregatedAlerts = React.useMemo(() => {
    const alertMap = new Map<string, AggregatedAlert>();
    
    allAlerts.forEach(alert => {
      const key = `${alert.alertName}-${alert.severity}`;
      
      if (!alertMap.has(key)) {
        alertMap.set(key, {
          alertName: alert.alertName,
          severity: alert.severity,
          totalCount: 0,
          clusters: [],
          component: alert.component,
          group: alert.group,
        });
      }
      
      const agg = alertMap.get(key)!;
      agg.totalCount++;
      
      const existingCluster = agg.clusters.find(c => c.name === alert.clusterName);
      if (existingCluster) {
        existingCluster.count++;
        // Update timestamp if this alert is more recent
        if (alert.lastFiredTimestamp > existingCluster.lastFiredTimestamp) {
          existingCluster.lastFired = alert.lastFired;
          existingCluster.lastFiredTimestamp = alert.lastFiredTimestamp;
        }
      } else {
        agg.clusters.push({
          name: alert.clusterName,
          cluster: (alert as any).cluster,
          count: 1,
          lastFired: alert.lastFired,
          lastFiredTimestamp: alert.lastFiredTimestamp,
        });
      }
    });
    
    return Array.from(alertMap.values()).sort((a, b) => {
      // Sort by severity first, then by count
      const severityOrder = { Critical: 0, Warning: 1, Info: 2 };
      const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (sevDiff !== 0) return sevDiff;
      return b.totalCount - a.totalCount;
    });
  }, [allAlerts]);

  // Filter aggregated alerts
  const filteredAggregatedAlerts = React.useMemo(() => {
    const filtered = aggregatedAlerts.filter(alert => {
      if (alertNameFilter && alert.alertName !== alertNameFilter) return false;
      if (componentFilter && alert.component !== componentFilter) return false;
      if (severityFilter.length > 0 && !severityFilter.includes(alert.severity)) return false;
      if (searchValue && !alert.alertName.toLowerCase().includes(searchValue.toLowerCase()) && 
          !alert.component.toLowerCase().includes(searchValue.toLowerCase())) return false;
      // Filter by alert scope - only show components that match selected groups
      if (groupFilter && groupFilter.length > 0 && groupFilter.length < 2 && alert.component) {
        const componentImpactGroup = componentMeta[alert.component as AlertComponent]?.impactGroup;
        if (componentImpactGroup && !groupFilter.includes(componentImpactGroup)) return false;
      }
      
      // Filter by triggered date/time range
      if (triggeredFromDate || triggeredFromTime || triggeredToDate || triggeredToTime) {
        // Get the first alert instance to check triggered time
        const firstCluster = alert.clusters[0];
        if (firstCluster && firstCluster.lastFired) {
          const alertDate = new Date(firstCluster.lastFired);
          
          // Parse from date/time
          if (triggeredFromDate || triggeredFromTime) {
            const fromDateStr = triggeredFromDate || new Date().toISOString().split('T')[0];
            const fromTimeStr = triggeredFromTime || '00:00';
            const fromDateTime = new Date(`${fromDateStr}T${fromTimeStr}`);
            if (alertDate < fromDateTime) return false;
          }
          
          // Parse to date/time
          if (triggeredToDate || triggeredToTime) {
            const toDateStr = triggeredToDate || new Date().toISOString().split('T')[0];
            const toTimeStr = triggeredToTime || '23:59';
            const toDateTime = new Date(`${toDateStr}T${toTimeStr}`);
            if (alertDate > toDateTime) return false;
          }
        }
      }
      
      return true;
    });
    
    // Apply multi-column sorting
    if (sortConfigs.length === 0) return filtered;
    
    const severityOrder: Record<string, number> = { Critical: 0, Warning: 1, Info: 2 };
    const groupOrder: Record<string, number> = { Cluster: 0, Namespace: 1 };
    
    return [...filtered].sort((a, b) => {
      // Sort by each column in priority order
      const sortedConfigs = [...sortConfigs].sort((x, y) => x.priority - y.priority);
      
      for (const config of sortedConfigs) {
        let comparison = 0;
        const multiplier = config.direction === 'asc' ? 1 : -1;
        
        switch (config.column) {
          case 'alertName':
            comparison = a.alertName.localeCompare(b.alertName);
            break;
          case 'severity':
            comparison = (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3);
            break;
          case 'clusters':
            comparison = a.clusters.length - b.clusters.length;
            break;
          case 'total':
            comparison = a.totalCount - b.totalCount;
            break;
          case 'group':
            comparison = (groupOrder[a.group || ''] ?? 2) - (groupOrder[b.group || ''] ?? 2);
            break;
          case 'component':
            comparison = (a.component || '').localeCompare(b.component || '');
            break;
          case 'startTime':
            // Compare by most recent timestamp in aggregated alerts
            const aTimestamp = a.clusters.reduce((latest, c) => {
              return (!latest || (c.lastFiredTimestamp && c.lastFiredTimestamp > latest)) ? c.lastFiredTimestamp : latest;
            }, null as Date | null);
            const bTimestamp = b.clusters.reduce((latest, c) => {
              return (!latest || (c.lastFiredTimestamp && c.lastFiredTimestamp > latest)) ? c.lastFiredTimestamp : latest;
            }, null as Date | null);
            if (aTimestamp && bTimestamp) {
              comparison = aTimestamp.getTime() - bTimestamp.getTime();
            } else if (aTimestamp) {
              comparison = 1;
            } else if (bTimestamp) {
              comparison = -1;
            }
            break;
        }
        
        if (comparison !== 0) {
          return comparison * multiplier;
        }
      }
      return 0;
    });
  }, [aggregatedAlerts, alertNameFilter, componentFilter, severityFilter, searchValue, sortConfigs, groupFilter, triggeredFromDate, triggeredFromTime, triggeredToDate, triggeredToTime]);

  // Get selected alerts data for silence modal
  const selectedAlertsData = React.useMemo(() => {
    return filteredAggregatedAlerts.filter(agg => 
      selectedAlertKeys.has(`${agg.alertName}-${agg.severity}`)
    );
  }, [filteredAggregatedAlerts, selectedAlertKeys]);

  // Filter and sort individual alerts (for non-aggregated view)
  const filteredAlerts = React.useMemo(() => {
    const filtered = allAlerts.filter(alert => {
      if (alertNameFilter && alert.alertName !== alertNameFilter) return false;
      if (componentFilter && alert.component !== componentFilter) return false;
      if (severityFilter.length > 0 && !severityFilter.includes(alert.severity)) return false;
      if (searchValue && !alert.alertName.toLowerCase().includes(searchValue.toLowerCase()) && 
          !alert.clusterName.toLowerCase().includes(searchValue.toLowerCase()) &&
          !alert.component.toLowerCase().includes(searchValue.toLowerCase())) return false;
      return true;
    });

    // Apply sorting - either table column sort or default severity sort
    const sorted = [...filtered].sort((a, b) => {
      // If table sorting is active, use that
      if (sortConfigs.length > 0) {
        for (const config of sortConfigs) {
          let comparison = 0;
          const multiplier = config.direction === 'asc' ? 1 : -1;
          
          switch (config.column) {
            case 'alertName':
              comparison = a.alertName.localeCompare(b.alertName);
              break;
            case 'severity':
              const severityOrder: Record<string, number> = { Critical: 0, Warning: 1, Info: 2 };
              comparison = (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3);
              break;
            case 'group':
              comparison = (a.group || '').localeCompare(b.group || '');
              break;
            case 'component':
              comparison = (a.component || '').localeCompare(b.component || '');
              break;
            case 'clusters':
              comparison = a.clusterName.localeCompare(b.clusterName);
              break;
            case 'startTime':
              comparison = a.lastFiredTimestamp.getTime() - b.lastFiredTimestamp.getTime();
              break;
            default:
              break;
          }
          
          if (comparison !== 0) {
            return comparison * multiplier;
          }
        }
        return 0;
      }
      
      // Default sort: Severity (Critical first), then by last fired timestamp
      const severityOrder: Record<string, number> = { Critical: 0, Warning: 1, Info: 2 };
      const severityDiff = (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3);
      if (severityDiff !== 0) return severityDiff;
      return b.lastFiredTimestamp.getTime() - a.lastFiredTimestamp.getTime();
    });

    return sorted;
  }, [allAlerts, alertNameFilter, componentFilter, severityFilter, searchValue, sortConfigs]);

  const paginatedAggregatedAlerts = filteredAggregatedAlerts.slice((page - 1) * perPage, page * perPage);
  const paginatedAlerts = filteredAlerts.slice((page - 1) * perPage, page * perPage);

  // Group alerts by selected groupBy option
  const groupedAlerts = React.useMemo(() => {
    if (groupBy === 'none') return null;
    
    const groups: Record<string, AggregatedAlert[]> = {};
    
    filteredAggregatedAlerts.forEach(agg => {
      let groupKey: string;
      
      switch (groupBy) {
        case 'severity':
          groupKey = agg.severity;
          break;
        case 'alertName':
          groupKey = agg.alertName;
          break;
        case 'impact':
          groupKey = agg.group || 'Unknown';
          break;
        case 'component':
          groupKey = agg.component || 'Unknown';
          break;
        case 'cluster':
          // Group by cluster name - get the first cluster name from the aggregated alert
          groupKey = agg.clusters.length > 0 ? agg.clusters[0].name : 'Unknown';
          break;
        case 'time':
          // Group by time buckets: 1 Hour, 4 Hours, Today, Yesterday, Last 7 days, Last 30 days, Older
          // Find the most recent alert timestamp across all clusters for this aggregated alert
          const mostRecentTimestamp = agg.clusters.reduce((latest, c) => {
            if (!latest || (c.lastFiredTimestamp && c.lastFiredTimestamp > latest)) {
              return c.lastFiredTimestamp;
            }
            return latest;
          }, null as Date | null);
          
          if (mostRecentTimestamp) {
            const now = new Date();
            const diffMs = now.getTime() - mostRecentTimestamp.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);
            const diffDays = diffMs / (1000 * 60 * 60 * 24);
            
            // Get today's start and yesterday's start
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
            
            if (diffHours <= 1) {
              groupKey = '1 Hour';
            } else if (diffHours <= 4) {
              groupKey = '4 Hours';
            } else if (mostRecentTimestamp >= todayStart) {
              groupKey = 'Today';
            } else if (mostRecentTimestamp >= yesterdayStart) {
              groupKey = 'Yesterday';
            } else if (diffDays <= 7) {
              groupKey = 'Last 7 days';
            } else if (diffDays <= 30) {
              groupKey = 'Last 30 days';
            } else {
              groupKey = 'Older';
            }
          } else {
            groupKey = 'Unknown time';
          }
          break;
        default:
          groupKey = 'All';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(agg);
    });
    
    // Sort groups - for severity and time, use custom order
    const sortedGroupKeys = Object.keys(groups).sort((a, b) => {
      if (groupBy === 'severity') {
        const order: Record<string, number> = { Critical: 0, Warning: 1, Info: 2 };
        return (order[a] ?? 3) - (order[b] ?? 3);
      }
      if (groupBy === 'time') {
        // Sort time buckets from most recent to oldest
        const timeOrder: Record<string, number> = { 
          '1 Hour': 0, 
          '4 Hours': 1, 
          'Today': 2, 
          'Yesterday': 3, 
          'Last 7 days': 4, 
          'Last 30 days': 5, 
          'Older': 6,
          'Unknown time': 7
        };
        return (timeOrder[a] ?? 8) - (timeOrder[b] ?? 8);
      }
      return a.localeCompare(b);
    });
    
    return sortedGroupKeys.map(key => ({
      groupName: key,
      alerts: groups[key],
      totalCount: groups[key].reduce((sum, agg) => sum + agg.totalCount, 0),
    }));
  }, [filteredAggregatedAlerts, groupBy]);

  // Group individual alerts (non-aggregated) by selected groupBy option
  const groupedIndividualAlerts = React.useMemo(() => {
    if (groupBy === 'none') return null;
    
    const groups: Record<string, AlertData[]> = {};
    
    filteredAlerts.forEach(alert => {
      let groupKey: string;
      
      switch (groupBy) {
        case 'severity':
          groupKey = alert.severity;
          break;
        case 'alertName':
          groupKey = alert.alertName;
          break;
        case 'impact':
          groupKey = alert.group || 'Unknown';
          break;
        case 'component':
          groupKey = alert.component || 'Unknown';
          break;
        case 'cluster':
          groupKey = alert.clusterName;
          break;
        case 'time':
          const now = new Date();
          const diffMs = now.getTime() - alert.lastFiredTimestamp.getTime();
          const diffHours = diffMs / (1000 * 60 * 60);
          const diffDays = diffMs / (1000 * 60 * 60 * 24);
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
          
          if (diffHours <= 1) {
            groupKey = '1 Hour';
          } else if (diffHours <= 4) {
            groupKey = '4 Hours';
          } else if (alert.lastFiredTimestamp >= todayStart) {
            groupKey = 'Today';
          } else if (alert.lastFiredTimestamp >= yesterdayStart) {
            groupKey = 'Yesterday';
          } else if (diffDays <= 7) {
            groupKey = 'Last 7 days';
          } else if (diffDays <= 30) {
            groupKey = 'Last 30 days';
          } else {
            groupKey = 'Older';
          }
          break;
        default:
          groupKey = 'All';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(alert);
    });
    
    // Sort groups - for severity and time, use custom order
    const sortedGroupKeys = Object.keys(groups).sort((a, b) => {
      if (groupBy === 'severity') {
        const order: Record<string, number> = { Critical: 0, Warning: 1, Info: 2 };
        return (order[a] ?? 3) - (order[b] ?? 3);
      }
      if (groupBy === 'time') {
        const timeOrder: Record<string, number> = { 
          '1 Hour': 0, 
          '4 Hours': 1, 
          'Today': 2, 
          'Yesterday': 3, 
          'Last 7 days': 4, 
          'Last 30 days': 5, 
          'Older': 6,
          'Unknown time': 7
        };
        return (timeOrder[a] ?? 8) - (timeOrder[b] ?? 8);
      }
      return a.localeCompare(b);
    });
    
    return sortedGroupKeys.map(key => ({
      groupName: key,
      alerts: groups[key],
    }));
  }, [filteredAlerts, groupBy]);

  const toggleGroupExpanded = (groupName: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  const toggleExpanded = (alertKey: string) => {
    if (expandedAlerts.includes(alertKey)) {
      setExpandedAlerts(expandedAlerts.filter(k => k !== alertKey));
    } else {
      setExpandedAlerts([...expandedAlerts, alertKey]);
    }
  };

  const totalItems = isAggregated ? filteredAggregatedAlerts.length : filteredAlerts.length;

  // Calculate top firing alert rules (for Insights tab)
  const alertRuleCounts = React.useMemo(() => {
    const counts: Record<string, { count: number; clusters: string[]; severity: AlertSeverity }> = {};
    clusters.forEach(cluster => {
      cluster.alerts.filter(a => a.status === 'firing').forEach(alert => {
        if (!counts[alert.alertName]) {
          counts[alert.alertName] = { count: 0, clusters: [], severity: alert.severity };
        }
        counts[alert.alertName].count++;
        if (!counts[alert.alertName].clusters.includes(cluster.name)) {
          counts[alert.alertName].clusters.push(cluster.name);
        }
      });
    });
    return Object.entries(counts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, insightsItemCount);
  }, [clusters, insightsItemCount]);

  // Calculate most impacted components (for Insights tab)
  const componentCounts = React.useMemo(() => {
    const counts: Record<string, { count: number; critical: number; warning: number; info: number; clusters: string[] }> = {};
    clusters.forEach(cluster => {
      cluster.alerts.filter(a => a.status === 'firing').forEach(alert => {
        if (!counts[alert.component]) {
          counts[alert.component] = { count: 0, critical: 0, warning: 0, info: 0, clusters: [] };
        }
        counts[alert.component].count++;
        if (alert.severity === 'Critical') counts[alert.component].critical++;
        else if (alert.severity === 'Warning') counts[alert.component].warning++;
        else counts[alert.component].info++;
        if (!counts[alert.component].clusters.includes(cluster.name)) {
          counts[alert.component].clusters.push(cluster.name);
        }
      });
    });
    return Object.entries(counts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, insightsItemCount);
  }, [clusters, insightsItemCount]);

  return (
    <Card id="all-alerts-card">
      <CardHeader style={{ gap: '0px' }}>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <CardTitle>
              Alerts
            </CardTitle>
          </FlexItem>
        </Flex>
      </CardHeader>
      {showMetrics && (
        <>
          <Divider />
          {/* Alerts Summary Metrics */}
          <div style={{ 
            padding: '12px 16px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '24px',
              flexWrap: 'wrap'
            }}>
              <Tooltip content={`Firing alerts: ${totalAlerts} - ${Math.floor(Math.random() * 20) - 10}% ${Math.floor(Math.random() * 20) - 10 > 0 ? 'more' : 'less'} from last day`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'help' }}>
                  <Icon><BellIcon /></Icon>
                  <span style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '13px' }}>Total Firing</span>
                  <strong style={{ fontSize: '16px' }}>{totalAlerts}</strong>
                </div>
              </Tooltip>
              <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--pf-t--global--border--color--default)' }} />
              <Tooltip content={`Critical: ${criticalAlerts} - Click to filter`}>
                <div 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                  onClick={onCriticalClick}
                >
                  <Icon status="danger"><ExclamationCircleIcon /></Icon>
                  <span style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '13px' }}>Critical</span>
                  <strong style={{ fontSize: '16px', color: 'var(--pf-t--global--color--status--danger--default)' }}>{criticalAlerts}</strong>
                </div>
              </Tooltip>
              <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--pf-t--global--border--color--default)' }} />
              <Tooltip content={`Warning: ${warningAlerts} - Click to filter`}>
                <div 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                  onClick={onWarningClick}
                >
                  <Icon status="warning"><ExclamationTriangleIcon /></Icon>
                  <span style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '13px' }}>Warning</span>
                  <strong style={{ fontSize: '16px', color: 'var(--pf-t--global--color--status--warning--default)' }}>{warningAlerts}</strong>
                </div>
              </Tooltip>
              <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--pf-t--global--border--color--default)' }} />
              <Tooltip content={`Info: ${infoAlerts} - Click to filter`}>
                <div 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                  onClick={onInfoClick}
                >
                  <Icon status="info"><InfoCircleIcon /></Icon>
                  <span style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '13px' }}>Info</span>
                  <strong style={{ fontSize: '16px', color: 'var(--pf-t--global--color--status--info--default)' }}>{infoAlerts}</strong>
                </div>
              </Tooltip>
              <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--pf-t--global--border--color--default)' }} />
              <Tooltip content={`Healthy: ${healthyAlerts} clusters with no alerts`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'help' }}>
                  <Icon status="success"><CheckCircleIcon /></Icon>
                  <span style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '13px' }}>Healthy</span>
                  <strong style={{ fontSize: '16px', color: 'var(--pf-t--global--color--status--success--default)' }}>{healthyAlerts}</strong>
                </div>
              </Tooltip>
              <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--pf-t--global--border--color--default)' }} />
              <Tooltip content={`Affected Clusters: ${affectedClusters} - ${Math.floor(Math.random() * 10) + 1}% more from last day`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'help' }}>
                  <Icon><ClusterIcon /></Icon>
                  <span style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '13px' }}>Affected Clusters</span>
                  <strong style={{ fontSize: '16px' }}>{affectedClusters}</strong>
                </div>
              </Tooltip>
            </div>
          </div>
          <Divider />
        </>
      )}
      <CardBody>
              <Stack hasGutter>
                <StackItem>
                  <Toolbar>
                    <ToolbarContent>
                      <ToolbarItem>
                        <Dropdown
                          isOpen={isGroupByOpen}
                          onOpenChange={setIsGroupByOpen}
                          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                            <MenuToggle 
                              ref={toggleRef} 
                              onClick={() => setIsGroupByOpen(!isGroupByOpen)}
                              isExpanded={isGroupByOpen}
                            >
                              Group by: {groupBy === 'none' ? 'None' : groupBy === 'alertName' ? 'Alert name' : groupBy === 'impact' ? 'Alert scope' : groupBy === 'cluster' ? 'Cluster' : groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}
                            </MenuToggle>
                          )}
                        >
                          <DropdownList>
                            {(['none', 'time', 'severity', 'alertName', 'impact', 'component', 'cluster'] as AlertsGroupByOption[]).map(option => (
                              <DropdownItem 
                                key={option}
                                onClick={() => {
                                  if (onGroupByChange) onGroupByChange(option);
                                  setIsGroupByOpen(false);
                                  setExpandedGroups(new Set());
                                  setPage(1);
                                }}
                              >
                                <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ width: '100%' }}>
                                  <FlexItem>{option === 'none' ? 'None' : option === 'alertName' ? 'Alert name' : option === 'impact' ? 'Alert scope' : option === 'cluster' ? 'Cluster' : option.charAt(0).toUpperCase() + option.slice(1)}</FlexItem>
                                  {groupBy === option && (
                                    <FlexItem>
                                      <CheckIcon style={{ color: 'var(--pf-t--global--icon--color--brand--default)' }} />
                                    </FlexItem>
                                  )}
                                </Flex>
                              </DropdownItem>
                            ))}
                          </DropdownList>
                        </Dropdown>
                      </ToolbarItem>
                      {/* Expand/Collapse all buttons - shown when grouping is active */}
                      {groupBy !== 'none' && (
                        (isAggregated && groupedAlerts && groupedAlerts.length > 0) ||
                        (!isAggregated && groupedIndividualAlerts && groupedIndividualAlerts.length > 0)
                      ) && (() => {
                        // Determine which grouped data to use
                        const activeGroups = isAggregated ? groupedAlerts : groupedIndividualAlerts;
                        const groupCount = activeGroups?.length || 0;
                        
                        return (
                          <ToolbarItem>
                            <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                              <FlexItem>
                                <span style={{ 
                                  fontSize: '14px', 
                                  color: 'var(--pf-t--global--text--color--regular)', 
                                  fontWeight: 500 
                                }}>
                                  {groupCount} {groupCount === 1 ? 'group' : 'groups'} (by {groupBy === 'alertName' ? 'alert name' : groupBy === 'impact' ? 'alert scope' : groupBy === 'cluster' ? 'cluster' : groupBy})
                                </span>
                              </FlexItem>
                              <FlexItem>
                                <Button 
                                  variant="link" 
                                  isInline
                                  onClick={() => {
                                    const allGroupNames = activeGroups?.map(g => g.groupName) || [];
                                    setExpandedGroups(new Set(allGroupNames));
                                  }}
                                >
                                  Expand all
                                </Button>
                              </FlexItem>
                              <FlexItem>
                                <Button 
                                  variant="link" 
                                  isInline
                                  onClick={() => setExpandedGroups(new Set())}
                                >
                                  Collapse all
                                </Button>
                              </FlexItem>
                            </Flex>
                          </ToolbarItem>
                        );
                      })()}
                      <ToolbarItem>
                        <Switch
                          id="aggregate-all-alerts-switch"
                          label="Aggregate by name and severity"
                          isChecked={isAggregated}
                          onChange={(_, checked) => {
                            setIsAggregated(checked);
                            setPage(1);
                            setExpandedAlerts([]);
                          }}
                        />
                      </ToolbarItem>
                      {/* Bulk action button - shown when alerts are selected */}
                      {selectedAlertKeys.size > 0 && (
                        <ToolbarItem>
                          <Button 
                            variant="secondary" 
                            icon={<BellSlashIcon />}
                            onClick={() => setIsSilenceModalOpen(true)}
                          >
                            Silence alerts ({selectedAlertKeys.size} selected)
                          </Button>
                        </ToolbarItem>
                      )}
                      {/* Manage columns and Export buttons */}
                      <ToolbarItem>
                        <Tooltip content="Manage columns">
                          <Button 
                            variant="plain" 
                            icon={<ColumnsIcon />} 
                            onClick={openManageColumnsModal} 
                            aria-label="Manage columns" 
                          />
                        </Tooltip>
                      </ToolbarItem>
                      <ToolbarItem>
                        <Tooltip content="Export to CSV">
                          <Button 
                            variant="plain" 
                            icon={<ExportIcon />} 
                            onClick={exportToCSV} 
                            aria-label="Export to CSV" 
                          />
                        </Tooltip>
                      </ToolbarItem>
                      {/* Filter chips moved to main toolbar */}
                      <ToolbarItem align={{ default: 'alignEnd' }}>
                        <Pagination
                          itemCount={totalItems}
                          perPage={perPage}
                          page={page}
                          onSetPage={(_, p) => setPage(p)}
                          onPerPageSelect={(_, pp) => setPerPage(pp)}
                          isCompact
                        />
                      </ToolbarItem>
                    </ToolbarContent>
                  </Toolbar>
                </StackItem>
                <StackItem>
            {totalItems === 0 ? (
              <EmptyState titleText="No alerts found" icon={CheckCircleIcon}>
                <EmptyStateBody>No alerts match the current filters.</EmptyStateBody>
              </EmptyState>
            ) : isAggregated && groupBy !== 'none' && groupedAlerts ? (
              /* Grouped View - Different layout for Component grouping vs other groupings */
              groupBy === 'component' ? (
                /* Component Grouped View - Accordion format with enhanced header */
                <Accordion asDefinitionList={false} displaySize="lg">
                  {groupedAlerts.map(group => {
                    const isGroupExpanded = expandedGroups.has(group.groupName);
                    
                    // Calculate severity counts for this component
                    const criticalCount = group.alerts.filter(a => a.severity === 'Critical').length;
                    const warningCount = group.alerts.filter(a => a.severity === 'Warning').length;
                    const infoCount = group.alerts.filter(a => a.severity === 'Info').length;
                    
                    // Determine aggregated status (highest severity)
                    const aggregatedStatus: 'Critical' | 'Warning' | 'Info' = 
                      criticalCount > 0 ? 'Critical' : warningCount > 0 ? 'Warning' : 'Info';
                    
                    // Get unique alert scopes for this component
                    const impactGroups = Array.from(new Set(group.alerts.map(a => a.group)));
                    
                    // Get unique clusters for this component
                    const clustersForComponent = Array.from(new Set(group.alerts.flatMap(a => a.clusters.map(c => c.name))));
                    
                    return (
                      <AccordionItem key={group.groupName} isExpanded={isGroupExpanded}>
                        <AccordionToggle
                          onClick={() => toggleGroupExpanded(group.groupName)}
                          id={`group-toggle-${group.groupName}`}
                        >
                          <Flex gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsCenter' }} flexWrap={{ default: 'nowrap' }} style={{ fontSize: '14px', fontWeight: 400 }}>
                            {/* Component Name */}
                            <FlexItem>
                              <strong>{group.groupName}</strong>
                            </FlexItem>
                            
                            {/* Status (Aggregated) */}
                            <FlexItem>
                              <Label 
                                color={aggregatedStatus === 'Critical' ? 'red' : aggregatedStatus === 'Warning' ? 'orange' : 'blue'}
                                icon={aggregatedStatus === 'Critical' ? <ExclamationCircleIcon /> : aggregatedStatus === 'Warning' ? <ExclamationTriangleIcon /> : <InfoCircleIcon />}
                                isCompact
                              >
                                {aggregatedStatus}
                              </Label>
                            </FlexItem>
                            
                            {/* Separator */}
                            <FlexItem>
                              <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>|</span>
                            </FlexItem>
                            
                            {/* Severity Breakdown - clickable labels for filtering */}
                            <FlexItem>
                              <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                                {criticalCount > 0 && (
                                  <Label 
                                    color="red" 
                                    isCompact 
                                    onClick={() => {
                                      if (!severityFilter.includes('Critical')) {
                                        setSeverityFilter([...severityFilter, 'Critical']);
                                      }
                                    }}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    {criticalCount} critical
                                  </Label>
                                )}
                                {warningCount > 0 && (
                                  <Label 
                                    color="orange" 
                                    isCompact 
                                    onClick={() => {
                                      if (!severityFilter.includes('Warning')) {
                                        setSeverityFilter([...severityFilter, 'Warning']);
                                      }
                                    }}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    {warningCount} warning
                                  </Label>
                                )}
                                {infoCount > 0 && (
                                  <Label 
                                    color="blue" 
                                    isCompact 
                                    onClick={() => {
                                      if (!severityFilter.includes('Info')) {
                                        setSeverityFilter([...severityFilter, 'Info']);
                                      }
                                    }}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    {infoCount} info
                                  </Label>
                                )}
                              </Flex>
                            </FlexItem>
                            
                            {/* Separator */}
                            <FlexItem>
                              <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>|</span>
                            </FlexItem>
                            
                            {/* Total alerts count */}
                            <FlexItem>
                              <span>{group.alerts.length} alert{group.alerts.length !== 1 ? 's' : ''}</span>
                            </FlexItem>
                            
                            {/* Separator */}
                            <FlexItem>
                              <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>|</span>
                            </FlexItem>
                            
                            {/* Alert Scope - A component can only have 1 alert scope */}
                            <FlexItem>
                              <span>Alert scope: {impactGroups[0] || 'N/A'}</span>
                            </FlexItem>
                            
                            {/* Cluster count (only when not in single cluster view) */}
                            {!singleClusterView && (
                              <>
                                <FlexItem>
                                  <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>|</span>
                                </FlexItem>
                                <FlexItem>
                                  <span>{clustersForComponent.length} cluster{clustersForComponent.length !== 1 ? 's' : ''}</span>
                                </FlexItem>
                              </>
                            )}
                          </Flex>
                        </AccordionToggle>
                        <AccordionContent id={`group-content-${group.groupName}`} hidden={!isGroupExpanded}>
                          {/* Alerts grouped by name and severity within this component */}
                          <Table aria-label={`Alerts in ${group.groupName} component`} variant="compact" isExpandable>
                            <Thead>
                              <Tr>
                                <Th screenReaderText="Expand" />
                                <Th>Alert name</Th>
                                <Th>Severity</Th>
                                <Th>Total</Th>
                                <Th>Clusters</Th>
                                <Th>Alert scope</Th>
                              </Tr>
                            </Thead>
                            {group.alerts.map((agg, aggIdx) => {
                              const alertKey = `${group.groupName}-${agg.alertName}-${agg.severity}`;
                              const isAlertExpanded = expandedAlerts.includes(alertKey);
                              return (
                                <Tbody key={alertKey} isExpanded={isAlertExpanded}>
                                  <Tr>
                                    <Td
                                      expand={{
                                        rowIndex: aggIdx,
                                        isExpanded: isAlertExpanded,
                                        onToggle: () => toggleExpanded(alertKey),
                                      }}
                                    />
                                    <Td>
                                      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                        <FlexItem>
                                          <Badge style={{ backgroundColor: 'var(--pf-t--global--color--nonstatus--purple--default)', color: 'white' }}>A</Badge>
                                        </FlexItem>
                                        <FlexItem>{agg.alertName}</FlexItem>
                                      </Flex>
                                    </Td>
                                    <Td>
                                      <Label 
                                        color={getSeverityLabelColor(agg.severity)} 
                                        icon={getSeverityIcon(agg.severity)} 
                                        isCompact
                                      >
                                        {agg.severity}
                                      </Label>
                                    </Td>
                                    <Td>{agg.totalCount}</Td>
                                    <Td>{agg.clusters.length}</Td>
                                    <Td>{agg.group}</Td>
                                  </Tr>
                                  {isAlertExpanded && (
                                    <Tr isExpanded>
                                      <Td colSpan={6}>
                                        <div style={{ padding: '16px' }}>
                                          <Table aria-label="Alert instances" variant="compact" borders={false}>
                                            <Thead>
                                              <Tr>
                                                <Th>Alert Name</Th>
                                                <Th>Severity</Th>
                                                <Th>Cluster</Th>
                                                <Th>Namespace</Th>
                                                <Th>State</Th>
                                                <Th>Last Fired</Th>
                                              </Tr>
                                            </Thead>
                                            <Tbody>
                                              {agg.clusters.map((clusterInfo, idx) => (
                                                <Tr key={`${alertKey}-${clusterInfo.name}-${idx}`}>
                                                  <Td>
                                                    <Button 
                                                      variant="link" 
                                                      isInline 
                                                      onClick={() => {
                                                        // Find the actual alert data to show in panel
                                                        const alertData = clusterInfo.cluster.alerts.find(a => 
                                                          a.alertName === agg.alertName && a.severity === agg.severity
                                                        );
                                                        if (alertData) {
                                                          onAlertClick(alertData);
                                                        }
                                                      }}
                                                    >
                                                      {agg.alertName}
                                                    </Button>
                                                  </Td>
                                                  <Td>
                                                    <Label 
                                                      color={getSeverityLabelColor(agg.severity)} 
                                                      icon={getSeverityIcon(agg.severity)} 
                                                      isCompact
                                                    >
                                                      {agg.severity}
                                                    </Label>
                                                  </Td>
                                                  <Td>{clusterInfo.name}</Td>
                                                  <Td>{clusterInfo.cluster.alerts.find(a => a.alertName === agg.alertName)?.namespace || 'N/A'}</Td>
                                                  <Td>
                                                    <Tooltip content={`${clusterInfo.cluster.alerts.filter(a => a.alertName === agg.alertName && a.status === 'firing').length} alerts firing since ${clusterInfo.lastFired}`}>
                                                      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} style={{ cursor: 'help' }}>
                                                        <Icon status="warning"><ExclamationTriangleIcon /></Icon>
                                                        <span>Firing</span>
                                                      </Flex>
                                                    </Tooltip>
                                                  </Td>
                                                  <Td>{clusterInfo.lastFired}</Td>
                                                </Tr>
                                              ))}
                                            </Tbody>
                                          </Table>
                                        </div>
                                      </Td>
                                    </Tr>
                                  )}
                                </Tbody>
                              );
                            })}
                          </Table>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              ) : (
              /* Other Grouped Views with Collapsible Sections */
              <Accordion asDefinitionList={false} displaySize="lg">
                {groupedAlerts.map(group => {
                  const isGroupExpanded = expandedGroups.has(group.groupName);
                  const groupSeverityColor = groupBy === 'severity' 
                    ? (group.groupName === 'Critical' ? 'red' : group.groupName === 'Warning' ? 'orange' : 'blue')
                    : 'grey';
                  
                  // Get unique clusters for this group
                  const clustersInGroup = Array.from(new Set(group.alerts.flatMap(a => a.clusters.map(c => c.name))));
                  
                  return (
                    <AccordionItem key={group.groupName} isExpanded={isGroupExpanded}>
                      <AccordionToggle
                        onClick={() => toggleGroupExpanded(group.groupName)}
                        id={`group-toggle-${group.groupName}`}
                      >
                        <Flex gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsCenter' }} flexWrap={{ default: 'nowrap' }} style={{ fontSize: '14px', fontWeight: 400 }}>
                          <FlexItem>
                            {groupBy === 'severity' ? (
                              <Label 
                                color={groupSeverityColor as 'red' | 'orange' | 'blue'} 
                                icon={group.groupName === 'Critical' ? <ExclamationCircleIcon /> : group.groupName === 'Warning' ? <ExclamationTriangleIcon /> : <InfoCircleIcon />}
                                isCompact
                              >
                                {group.groupName}
                              </Label>
                            ) : (
                              <strong>{group.groupName}</strong>
                            )}
                          </FlexItem>
                          
                          {/* Separator */}
                          <FlexItem>
                            <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>|</span>
                          </FlexItem>
                          
                          {/* Severity breakdown - only show when not grouping by severity */}
                          {groupBy !== 'severity' && (
                            <>
                              <FlexItem>
                                <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                                  {(() => {
                                    const criticalCount = group.alerts.filter(a => a.severity === 'Critical').length;
                                    const warningCount = group.alerts.filter(a => a.severity === 'Warning').length;
                                    const infoCount = group.alerts.filter(a => a.severity === 'Info').length;
                                    return (
                                      <>
                                        {criticalCount > 0 && <Label color="red" isCompact>{criticalCount} critical</Label>}
                                        {warningCount > 0 && <Label color="orange" isCompact>{warningCount} warning</Label>}
                                        {infoCount > 0 && <Label color="blue" isCompact>{infoCount} info</Label>}
                                      </>
                                    );
                                  })()}
                                </Flex>
                              </FlexItem>
                              
                              {/* Separator */}
                              <FlexItem>
                                <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>|</span>
                              </FlexItem>
                            </>
                          )}
                          
                          <FlexItem>
                            <span>{group.alerts.length} alert{group.alerts.length !== 1 ? 's' : ''}</span>
                          </FlexItem>
                          
                          {/* Separator */}
                          <FlexItem>
                            <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>|</span>
                          </FlexItem>
                          
                          <FlexItem>
                            <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>{group.totalCount} instance{group.totalCount !== 1 ? 's' : ''}</span>
                          </FlexItem>
                          
                          {/* Cluster count (only when not in single cluster view) */}
                          {!singleClusterView && (
                            <>
                              <FlexItem>
                                <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>|</span>
                              </FlexItem>
                              <FlexItem>
                                <span>{clustersInGroup.length} cluster{clustersInGroup.length !== 1 ? 's' : ''}</span>
                              </FlexItem>
                            </>
                          )}
                        </Flex>
                      </AccordionToggle>
                      <AccordionContent id={`group-content-${group.groupName}`} hidden={!isGroupExpanded}>
                        <Table aria-label={`Alerts in ${group.groupName} group`} variant="compact" isExpandable>
                          <Thead>
                            <Tr>
                              <Th screenReaderText="Expand" />
                              <Th>Alert name</Th>
                              <Th>Severity</Th>
                              <Th>Total</Th>
                              <Th>Clusters</Th>
                              <Th>Alert scope</Th>
                              <Th>Component</Th>
                            </Tr>
                          </Thead>
                          {group.alerts.map((agg, aggIdx) => {
                            const alertKey = `${group.groupName}-${agg.alertName}-${agg.severity}`;
                            const isAlertExpanded = expandedAlerts.includes(alertKey);
                            return (
                              <Tbody key={alertKey} isExpanded={isAlertExpanded}>
                                <Tr>
                                  <Td
                                    expand={{
                                      rowIndex: aggIdx,
                                      isExpanded: isAlertExpanded,
                                      onToggle: () => toggleExpanded(alertKey),
                                    }}
                                  />
                                  <Td>
                                    {/* Alert name is plain text when aggregated, only clickable in expanded rows */}
                                    <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                      <FlexItem>
                                        <Badge style={{ backgroundColor: 'var(--pf-t--global--color--nonstatus--purple--default)', color: 'white' }}>A</Badge>
                                      </FlexItem>
                                      <FlexItem>{agg.alertName}</FlexItem>
                                    </Flex>
                                  </Td>
                                  <Td>
                                    <Label 
                                      color={getSeverityLabelColor(agg.severity)} 
                                      icon={getSeverityIcon(agg.severity)} 
                                      isCompact
                                    >
                                      {agg.severity}
                                    </Label>
                                  </Td>
                                  <Td>
                                    <Badge>{agg.totalCount}</Badge>
                                  </Td>
                                  <Td>
                                    <Badge isRead>{agg.clusters.length} cluster{agg.clusters.length !== 1 ? 's' : ''}</Badge>
                                  </Td>
                                  <Td>
                                    <Label isCompact>{agg.group}</Label>
                                  </Td>
                                  <Td>
                                    <Label variant="outline" isCompact>{agg.component}</Label>
                                  </Td>
                                </Tr>
                                {/* Expanded row with cluster details */}
                                <Tr isExpanded={isAlertExpanded}>
                                  <Td colSpan={7}>
                                    <ExpandableRowContent>
                                      <Table aria-label={`Instances of ${agg.alertName}`} variant="compact">
                                        <Thead>
                                          <Tr>
                                            <Th>Alert name</Th>
                                            <Th>Severity</Th>
                                            <Th>State</Th>
                                            <Th>Cluster</Th>
                                            <Th>Namespace</Th>
                                            <Th>Resource</Th>
                                          </Tr>
                                        </Thead>
                                        <Tbody>
                                          {agg.clusters.map((clusterInfo, instanceIdx) => {
                                            const alertInstance = clusterInfo.cluster?.alerts?.find(
                                              a => a.alertName === agg.alertName && a.severity === agg.severity
                                            );
                                            return (
                                              <Tr key={`${clusterInfo.name}-${instanceIdx}`}>
                                                <Td>
                                                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                                    <FlexItem>
                                                      <Badge style={{ backgroundColor: 'var(--pf-t--global--color--nonstatus--purple--default)', color: 'white' }}>A</Badge>
                                                    </FlexItem>
                                                    <FlexItem>
                                                      <Button 
                                                        variant="link" 
                                                        isInline 
                                                        onClick={() => {
                                                          if (alertInstance) onAlertClick(alertInstance);
                                                        }}
                                                      >
                                                        {agg.alertName}
                                                      </Button>
                                                    </FlexItem>
                                                  </Flex>
                                                </Td>
                                                <Td>
                                                  <Label color={getSeverityLabelColor(agg.severity)} icon={getSeverityIcon(agg.severity)} isCompact>
                                                    {agg.severity}
                                                  </Label>
                                                </Td>
                                                <Td>
                                                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                                    <FlexItem>
                                                      <Icon status="warning"><BellIcon /></Icon>
                                                    </FlexItem>
                                                    <FlexItem>
                                                      <Stack>
                                                        <StackItem>Firing Since</StackItem>
                                                        <StackItem>
                                                          <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                                                            {clusterInfo.lastFired}
                                                          </Content>
                                                        </StackItem>
                                                      </Stack>
                                                    </FlexItem>
                                                  </Flex>
                                                </Td>
                                                <Td>{clusterInfo.name}</Td>
                                                <Td>
                                                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                                    <FlexItem><Label color="blue" isCompact>NS</Label></FlexItem>
                                                    <FlexItem>{alertInstance?.namespace || 'default'}</FlexItem>
                                                  </Flex>
                                                </Td>
                                                <Td>
                                                  {alertInstance?.resource ? (
                                                    <Button variant="link" isInline>{alertInstance.resource}</Button>
                                                  ) : (
                                                    <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>-</Content>
                                                  )}
                                                </Td>
                                              </Tr>
                                            );
                                          })}
                                        </Tbody>
                                      </Table>
                                    </ExpandableRowContent>
                                  </Td>
                                </Tr>
                              </Tbody>
                            );
                          })}
                        </Table>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
              )
            ) : totalItems === 0 ? (
              <EmptyState titleText="No alerts found" icon={CheckCircleIcon}>
                <EmptyStateBody>No alerts match the current filters.</EmptyStateBody>
              </EmptyState>
            ) : isAggregated ? (
              /* Aggregated View */
              <InnerScrollContainer>
                <Table aria-label="Aggregated alerts table" variant="compact" isExpandable>
                  <Thead>
                    <Tr>
                      <Th screenReaderText="Expand" isStickyColumn stickyMinWidth="45px" modifier="nowrap" />
                      <Th isStickyColumn stickyMinWidth="45px" stickyLeftOffset="45px" modifier="nowrap">
                        <Checkbox 
                          id="select-all-alerts"
                          aria-label="Select all alerts"
                          isChecked={paginatedAggregatedAlerts.length > 0 && paginatedAggregatedAlerts.every(agg => selectedAlertKeys.has(`${agg.alertName}-${agg.severity}`))}
                          onChange={toggleSelectAll}
                        />
                      </Th>
                      {getVisibleColumns().filter(col => col.key !== 'description' && col.key !== 'clusters' && col.key !== 'startTime' && col.key !== 'flappingRate').map((col, colIdx) => {
                        const columnKey = col.key as SortConfig['column'];
                        const canSort = ['alertName', 'severity', 'total', 'group', 'component'].includes(col.key);
                        const sortConfig = sortConfigs.find(c => c.column === columnKey);
                        
                        const thProps: any = {
                          key: col.key,
                          modifier: "nowrap" as const,
                        };
                        
                        // Make Alert Name sticky
                        if (col.key === 'alertName') {
                          thProps.isStickyColumn = true;
                          thProps.stickyMinWidth = "200px";
                          thProps.stickyLeftOffset = "90px";
                        }
                        
                        // Add info tooltips using PatternFly's info prop
                        if (col.key === 'group') {
                          thProps.info = {
                            tooltip: "Indicates whether the alert affects the entire cluster or a specific namespace.",
                            ariaLabel: "More information about alert scope"
                          };
                        }
                        
                        if (col.key === 'component') {
                          thProps.info = {
                            tooltip: "The specific services, operators, or nodes affected by this alert.",
                            ariaLabel: "More information about affected component"
                          };
                        }
                        
                        if (canSort) {
                          thProps.sort = {
                            sortBy: {
                              index: sortConfig ? sortConfig.priority - 1 : -1,
                              direction: sortConfig?.direction || 'asc'
                            },
                            onSort: () => handleSort(columnKey),
                            columnIndex: colIdx
                          };
                        }
                        
                        return <Th {...thProps}>{col.label}</Th>;
                      })}
                    </Tr>
                  </Thead>
                {paginatedAggregatedAlerts.map((agg, idx) => {
                  const alertKey = `${agg.alertName}-${agg.severity}`;
                  const isExpanded = expandedAlerts.includes(alertKey);
                  // Get first alert for state and source info
                  const firstAlertInfo = agg.clusters[0];
                  const firstAlert = firstAlertInfo?.cluster?.alerts?.find(a => a.alertName === agg.alertName && a.severity === agg.severity);
                  
                  const renderCellContent = (col: ColumnConfig) => {
                    switch (col.key) {
                      case 'alertName':
                        return (
                          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                            <FlexItem>
                              <Badge style={{ backgroundColor: 'var(--pf-t--global--color--nonstatus--purple--default)', color: 'white' }}>A</Badge>
                            </FlexItem>
                            <FlexItem>{agg.alertName}</FlexItem>
                          </Flex>
                        );
                      case 'severity':
                        return (
                          <Label color={getSeverityLabelColor(agg.severity)} icon={getSeverityIcon(agg.severity)} isCompact>
                            {agg.severity}
                          </Label>
                        );
                      case 'total':
                        return <Badge>{agg.totalCount}</Badge>;
                      case 'clusters':
                        return <Badge isRead>{agg.clusters.length} cluster{agg.clusters.length !== 1 ? 's' : ''}</Badge>;
                      case 'state':
                        return (
                          <Tooltip content={`${agg.totalCount} alerts firing since ${firstAlertInfo?.lastFired || 'N/A'}`}>
                            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} style={{ cursor: 'help' }}>
                              <Icon status="warning"><ExclamationTriangleIcon /></Icon>
                              <span>Firing</span>
                            </Flex>
                          </Tooltip>
                        );
                      case 'group':
                        return <Label isCompact>{agg.group}</Label>;
                      case 'component':
                        return <Label isCompact variant="outline">{agg.component}</Label>;
                      case 'source':
                        return firstAlert?.source || '-';
                      case 'description':
                        return firstAlert?.description || '-';
                      case 'startTime':
                        return firstAlertInfo?.lastFired || '-';
                      case 'flappingRate':
                        const flappingData = generateFlappingEvents(agg.alertName, agg.severity);
                        return (
                          <FlappingRateChart
                            alertName={agg.alertName}
                            severity={agg.severity}
                            events={flappingData.events}
                            totalFlaps={flappingData.totalFlaps}
                            onClick={() => {
                              // Open alert details for a specific alert instance (not aggregated)
                              // Get the first alert instance from the first cluster
                              if (firstAlert) {
                                onAlertClick(firstAlert, 1); // Open to timeline tab (eventKey=1)
                              }
                            }}
                          />
                        );
                      default:
                        return '-';
                    }
                  };
                  
                  return (
                    <Tbody key={alertKey} isExpanded={isExpanded}>
                      <Tr 
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => {
                          // Don't toggle if clicking on checkbox or a button/link
                          const target = e.target as HTMLElement;
                          if (target.tagName !== 'INPUT' && target.tagName !== 'BUTTON' && target.tagName !== 'A' && !target.closest('button') && !target.closest('a')) {
                            toggleExpanded(alertKey);
                          }
                        }}
                      >
                        <Td
                          expand={{
                            rowIndex: idx,
                            isExpanded,
                            onToggle: () => toggleExpanded(alertKey),
                          }}
                          isStickyColumn
                          stickyMinWidth="45px"
                          modifier="nowrap"
                        />
                        <Td 
                          isStickyColumn 
                          stickyMinWidth="45px" 
                          stickyLeftOffset="45px" 
                          modifier="nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox 
                            id={`checkbox-${alertKey}`}
                            aria-label={`Select ${agg.alertName}`}
                            isChecked={selectedAlertKeys.has(alertKey)}
                            onChange={() => toggleAlertSelection(alertKey)}
                          />
                        </Td>
                        {getVisibleColumns().filter(col => col.key !== 'description' && col.key !== 'clusters' && col.key !== 'startTime' && col.key !== 'flappingRate').map(col => {
                          const tdProps: any = {
                            key: col.key,
                            modifier: "nowrap" as const,
                          };
                          
                          // Make Alert Name sticky
                          if (col.key === 'alertName') {
                            tdProps.isStickyColumn = true;
                            tdProps.stickyMinWidth = "200px";
                            tdProps.stickyLeftOffset = "90px";
                          }
                          
                          return <Td {...tdProps}>{renderCellContent(col)}</Td>;
                        })}
                      </Tr>
                      <Tr isExpanded={isExpanded}>
                        <Td colSpan={getVisibleColumns().filter(col => col.key !== 'description' && col.key !== 'clusters' && col.key !== 'startTime' && col.key !== 'flappingRate').length + 2} noPadding>
                          <ExpandableRowContent>
                            <div style={{ padding: '8px 16px' }}>
                              <Table aria-label={singleClusterView ? "Alert instances" : "Clusters with alert"} variant="compact">
                                  <Thead>
                                    <Tr>
                                      <Th screenReaderText="Select" />
                                      <Th sort={{ sortBy: { index: 0, direction: 'asc' }, columnIndex: 0 }}>Alert Name</Th>
                                      <Th sort={{ sortBy: { index: 1, direction: 'asc' }, columnIndex: 1 }}>Severity</Th>
                                      <Th sort={{ sortBy: { index: 2, direction: 'asc' }, columnIndex: 2 }}>State</Th>
                                      {!singleClusterView && <Th>Cluster</Th>}
                                      <Th>Namespace</Th>
                                      <Th>Resource</Th>
                                      <Th 
                                        info={{
                                          tooltip: "Total number of status transitions (Firing ↔ Resolved) in the last 24 hours. High counts indicate \"flapping.\"",
                                          ariaLabel: "More information about flapping rate"
                                        }}
                                      >
                                        Flapping rate
                                      </Th>
                                      {columns.find(c => c.key === 'description')?.isVisible && <Th>Description</Th>}
                                    </Tr>
                                  </Thead>
                                  <Tbody>
                                    {agg.clusters.map((clusterInfo, instanceIdx) => {
                                      const alertInstance = clusterInfo.cluster?.alerts?.find(
                                        a => a.alertName === agg.alertName && a.severity === agg.severity
                                      );
                                      return (
                                      <Tr key={singleClusterView ? `${clusterInfo.name}-${instanceIdx}` : clusterInfo.name}>
                                        <Td>
                                          <Checkbox id={`checkbox-${alertKey}-${instanceIdx}`} aria-label={`Select ${agg.alertName} instance`} />
                                        </Td>
                                        <Td>
                                          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                            <FlexItem>
                                              <Badge style={{ backgroundColor: 'var(--pf-t--global--color--nonstatus--purple--default)', color: 'white' }}>A</Badge>
                                            </FlexItem>
                                            <FlexItem>
                                              <Button 
                                                variant="link" 
                                                isInline 
                                                onClick={() => {
                                                  if (alertInstance) {
                                                    onAlertClick(alertInstance);
                                                  }
                                                }}
                                              >
                                                {agg.alertName}
                                              </Button>
                                            </FlexItem>
                                          </Flex>
                                        </Td>
                                        <Td>
                                          <Label color={getSeverityLabelColor(agg.severity)} icon={getSeverityIcon(agg.severity)} isCompact>
                                            {agg.severity}
                                          </Label>
                                        </Td>
                                        <Td>
                                          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                            <FlexItem>
                                              <Icon status="warning"><BellIcon /></Icon>
                                            </FlexItem>
                                            <FlexItem>
                                              <Stack>
                                                <StackItem>Firing Since</StackItem>
                                                <StackItem>
                                                  <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                                                    {clusterInfo.lastFired}
                                                  </Content>
                                                </StackItem>
                                              </Stack>
                                            </FlexItem>
                                          </Flex>
                                        </Td>
                                        {!singleClusterView && (
                                          <Td>
                                            <Button 
                                              variant="link" 
                                              isInline 
                                              onClick={() => {
                                                onClusterFilterChange && onClusterFilterChange([clusterInfo.name]);
                                              }}
                                            >
                                              {clusterInfo.name}
                                            </Button>
                                          </Td>
                                        )}
                                        <Td>
                                          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                            <FlexItem><Label color="blue" isCompact>NS</Label></FlexItem>
                                            <FlexItem>
                                              <Button 
                                                variant="link" 
                                                isInline 
                                                onClick={() => {
                                                  onNamespaceFilterChange && onNamespaceFilterChange([alertInstance?.namespace || 'default']);
                                                }}
                                              >
                                                {alertInstance?.namespace || 'default'}
                                              </Button>
                                            </FlexItem>
                                          </Flex>
                                        </Td>
                                        <Td>
                                          {alertInstance?.resource ? (
                                            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                              <FlexItem><Label color="grey" isCompact>N</Label></FlexItem>
                                              <FlexItem>{alertInstance.resource}</FlexItem>
                                            </Flex>
                                          ) : '-'}
                                        </Td>
                                        <Td>
                                          {(() => {
                                            const flappingData = generateFlappingEvents(agg.alertName, agg.severity);
                                            return (
                                              <FlappingRateChart
                                                alertName={agg.alertName}
                                                severity={agg.severity}
                                                events={flappingData.events}
                                                totalFlaps={flappingData.totalFlaps}
                                                onClick={() => {
                                                  if (alertInstance) {
                                                    onAlertClick(alertInstance, 1); // Open to timeline tab
                                                  }
                                                }}
                                              />
                                            );
                                          })()}
                                        </Td>
                                        {columns.find(c => c.key === 'description')?.isVisible && (
                                          <Td>{alertInstance?.description || '-'}</Td>
                                        )}
                                        <Td>
                                          <Dropdown
                                            isOpen={openActionMenuId === `${agg.alertName}-${clusterInfo.name}-${instanceIdx}`}
                                            onOpenChange={(isOpen) => setOpenActionMenuId(isOpen ? `${agg.alertName}-${clusterInfo.name}-${instanceIdx}` : null)}
                                            toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                              <MenuToggle 
                                                ref={toggleRef} 
                                                variant="plain" 
                                                aria-label="Alert actions"
                                                onClick={() => setOpenActionMenuId(
                                                  openActionMenuId === `${agg.alertName}-${clusterInfo.name}-${instanceIdx}` 
                                                    ? null 
                                                    : `${agg.alertName}-${clusterInfo.name}-${instanceIdx}`
                                                )}
                                                isExpanded={openActionMenuId === `${agg.alertName}-${clusterInfo.name}-${instanceIdx}`}
                                              >
                                                <EllipsisVIcon />
                                              </MenuToggle>
                                            )}
                                            popperProps={{ position: 'right' }}
                                          >
                                            <DropdownList>
                                              <DropdownItem 
                                                key="silence" 
                                                onClick={() => openSilenceModal(agg.alertName, agg.severity, clusterInfo.name)}
                                                description="Temporarily stop notifications for this alert."
                                              >
                                                Silence alert
                                              </DropdownItem>
                                              <DropdownItem 
                                                key="acknowledge" 
                                                onClick={() => openAcknowledgeModal(agg.alertName, agg.severity, clusterInfo.name)}
                                                description="Mark the alert as being addressed by your teammates."
                                              >
                                                Acknowledge
                                              </DropdownItem>
                                              <Divider component="li" />
                                              <DropdownItem key="rule" onClick={() => setOpenActionMenuId(null)}>
                                                View alert rule
                                              </DropdownItem>
                                              <DropdownItem key="logs" onClick={() => setOpenActionMenuId(null)}>
                                                View logs
                                              </DropdownItem>
                                              <DropdownItem key="metrics" onClick={() => setOpenActionMenuId(null)}>
                                                View metrics
                                              </DropdownItem>
                                              <DropdownItem key="incident" onClick={() => setOpenActionMenuId(null)}>
                                                See related incident
                                              </DropdownItem>
                                              <DropdownItem key="troubleshoot" onClick={() => setOpenActionMenuId(null)}>
                                                Troubleshoot
                                              </DropdownItem>
                                            </DropdownList>
                                          </Dropdown>
                                        </Td>
                                      </Tr>
                                    );
                                    })}
                                  </Tbody>
                                </Table>
                              </div>
                          </ExpandableRowContent>
                        </Td>
                      </Tr>
                    </Tbody>
                  );
                })}
              </Table>
              </InnerScrollContainer>
            ) : !isAggregated && groupBy !== 'none' && groupedIndividualAlerts ? (
              /* Grouped Individual Alerts View (non-aggregated) */
              <Accordion asDefinitionList={false} displaySize="lg">
                {groupedIndividualAlerts!.map(group => {
                  const isGroupExpanded = expandedGroups.has(group.groupName);
                  const groupSeverityColor = groupBy === 'severity' 
                    ? (group.groupName === 'Critical' ? 'red' : group.groupName === 'Warning' ? 'orange' : 'blue')
                    : 'grey';
                  
                  // Calculate severity breakdown for group header
                  const criticalCount = group.alerts.filter(a => a.severity === 'Critical').length;
                  const warningCount = group.alerts.filter(a => a.severity === 'Warning').length;
                  const infoCount = group.alerts.filter(a => a.severity === 'Info').length;
                  
                  return (
                    <AccordionItem key={group.groupName} isExpanded={isGroupExpanded}>
                      <AccordionToggle
                        onClick={() => toggleGroupExpanded(group.groupName)}
                        id={`group-toggle-${group.groupName}`}
                      >
                        <Flex gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsCenter' }} flexWrap={{ default: 'nowrap' }} style={{ fontSize: '14px', fontWeight: 400 }}>
                          <FlexItem>
                            {groupBy === 'severity' ? (
                              <Label 
                                color={groupSeverityColor as 'red' | 'orange' | 'blue'} 
                                icon={group.groupName === 'Critical' ? <ExclamationCircleIcon /> : group.groupName === 'Warning' ? <ExclamationTriangleIcon /> : <InfoCircleIcon />}
                                isCompact
                              >
                                {group.groupName}
                              </Label>
                            ) : (
                              <strong>{group.groupName}</strong>
                            )}
                          </FlexItem>
                          
                          <FlexItem>
                            <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>|</span>
                          </FlexItem>
                          
                          {groupBy !== 'severity' && (
                            <>
                              <FlexItem>
                                <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                                  {criticalCount > 0 && (
                                    <Label 
                                      color="red" 
                                      isCompact 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (!severityFilter.includes('Critical')) {
                                          setSeverityFilter([...severityFilter, 'Critical']);
                                        }
                                      }}
                                      style={{ cursor: 'pointer' }}
                                    >
                                      {criticalCount} critical
                                    </Label>
                                  )}
                                  {warningCount > 0 && (
                                    <Label 
                                      color="orange" 
                                      isCompact 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (!severityFilter.includes('Warning')) {
                                          setSeverityFilter([...severityFilter, 'Warning']);
                                        }
                                      }}
                                      style={{ cursor: 'pointer' }}
                                    >
                                      {warningCount} warning
                                    </Label>
                                  )}
                                  {infoCount > 0 && (
                                    <Label 
                                      color="blue" 
                                      isCompact 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (!severityFilter.includes('Info')) {
                                          setSeverityFilter([...severityFilter, 'Info']);
                                        }
                                      }}
                                      style={{ cursor: 'pointer' }}
                                    >
                                      {infoCount} info
                                    </Label>
                                  )}
                                </Flex>
                              </FlexItem>
                              
                              <FlexItem>
                                <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>|</span>
                              </FlexItem>
                            </>
                          )}
                          
                          <FlexItem>
                            <span>{group.alerts.length} alert{group.alerts.length !== 1 ? 's' : ''}</span>
                          </FlexItem>
                        </Flex>
                      </AccordionToggle>
                      <AccordionContent id={`group-content-${group.groupName}`} hidden={!isGroupExpanded}>
                        <div style={{ padding: '16px' }}>
                          <Table aria-label={`${group.groupName} alerts`} variant="compact" borders={false}>
                            <Thead>
                              <Tr>
                                {getVisibleColumns().filter(col => col.key !== 'total').map((col) => {
                                  const columnKey = col.key as SortConfig['column'];
                                  const canSort = ['alertName', 'severity', 'clusters', 'group', 'component', 'startTime'].includes(col.key);
                                  
                                  const thProps: any = {
                                    key: col.key,
                                    modifier: "nowrap" as const,
                                  };
                                  
                                  // Add info tooltips
                                  if (col.key === 'group') {
                                    thProps.info = {
                                      tooltip: "Indicates whether the alert affects the entire cluster or a specific namespace.",
                                      ariaLabel: "More information about alert scope"
                                    };
                                  }
                                  
                                  if (col.key === 'component') {
                                    thProps.info = {
                                      tooltip: "The specific services, operators, or nodes affected by this alert.",
                                      ariaLabel: "More information about affected component"
                                    };
                                  }
                                  
                                  if (canSort) {
                                    thProps.sort = getSortParams(columnKey);
                                  }
                                  
                                  return <Th {...thProps}>{col.label}</Th>;
                                })}
                              </Tr>
                            </Thead>
                            <Tbody>
                              {group.alerts.map((alert, idx) => {
                                const renderCellContent = (col: ColumnConfig) => {
                                  switch (col.key) {
                                    case 'alertName':
                                      return (
                                        <Button variant="link" isInline onClick={() => onAlertClick(alert)}>
                                          {alert.alertName}
                                        </Button>
                                      );
                                    case 'severity':
                                      return (
                                        <Label color={getSeverityLabelColor(alert.severity)} icon={getSeverityIcon(alert.severity)} isCompact>
                                          {alert.severity}
                                        </Label>
                                      );
                                    case 'clusters':
                                      return (
                                        <Button variant="link" isInline onClick={() => onClusterClick((alert as any).cluster)}>
                                          {alert.clusterName}
                                        </Button>
                                      );
                                    case 'group':
                                      return <Label isCompact>{alert.group}</Label>;
                                    case 'component':
                                      return <Label isCompact variant="outline">{alert.component}</Label>;
                                    case 'state':
                                      return <Label color={getStatusLabelColor(alert.status)} variant="outline" isCompact>{alert.status}</Label>;
                                    case 'startTime':
                                      return alert.lastFired;
                                    case 'source':
                                      return alert.source || '-';
                                    case 'description':
                                      return alert.description || '-';
                                    case 'flappingRate':
                                      const flappingData = generateFlappingEvents(alert.alertName, alert.severity);
                                      return (
                                        <FlappingRateChart
                                          alertName={alert.alertName}
                                          severity={alert.severity}
                                          events={flappingData.events}
                                          totalFlaps={flappingData.totalFlaps}
                                          onClick={() => onAlertClick(alert, 1)} // Open to timeline tab
                                        />
                                      );
                                    default:
                                      return '-';
                                  }
                                };
                                
                                return (
                                  <Tr key={`${alert.id}-${idx}`}>
                                    {getVisibleColumns().filter(col => col.key !== 'total').map(col => (
                                      <Td key={col.key} modifier="nowrap">{renderCellContent(col)}</Td>
                                    ))}
                                  </Tr>
                                );
                              })}
                            </Tbody>
                          </Table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            ) : (
              /* Individual Alerts View (Flat, no grouping) - with column management */
              <InnerScrollContainer>
                <Table aria-label="All alerts table" variant="compact">
                  <Thead>
                    <Tr>
                      {getVisibleColumns().filter(col => col.key !== 'total').map((col, colIdx) => {
                        const columnKey = col.key as SortConfig['column'];
                        const canSort = ['alertName', 'severity', 'clusters', 'group', 'component', 'startTime'].includes(col.key);
                        
                        const thProps: any = {
                          key: col.key,
                          modifier: "nowrap" as const,
                        };
                        
                        // Make Alert Name sticky
                        if (col.key === 'alertName') {
                          thProps.isStickyColumn = true;
                          thProps.stickyMinWidth = "200px";
                          thProps.stickyLeftOffset = "0px";
                        }
                        
                        // Make Severity sticky (second column)
                        if (col.key === 'severity') {
                          thProps.isStickyColumn = true;
                          thProps.stickyMinWidth = "120px";
                          thProps.stickyLeftOffset = "200px";
                        }
                        
                        // Add info tooltips using PatternFly's info prop
                        if (col.key === 'group') {
                          thProps.info = {
                            tooltip: "Indicates whether the alert affects the entire cluster or a specific namespace.",
                            ariaLabel: "More information about alert scope"
                          };
                        }
                        
                        if (col.key === 'component') {
                          thProps.info = {
                            tooltip: "The specific services, operators, or nodes affected by this alert.",
                            ariaLabel: "More information about affected component"
                          };
                        }
                        
                        if (canSort) {
                          thProps.sort = getSortParams(columnKey);
                        }
                        
                        return <Th {...thProps}>{col.label}</Th>;
                      })}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {paginatedAlerts.map((alert, idx) => {
                      const renderCellContent = (col: ColumnConfig) => {
                        switch (col.key) {
                          case 'alertName':
                            return (
                              <Button variant="link" isInline onClick={() => onAlertClick(alert)}>
                                {alert.alertName}
                              </Button>
                            );
                          case 'severity':
                            return (
                              <Label color={getSeverityLabelColor(alert.severity)} icon={getSeverityIcon(alert.severity)} isCompact>
                                {alert.severity}
                              </Label>
                            );
                          case 'clusters':
                            return (
                              <Button variant="link" isInline onClick={() => onClusterClick((alert as any).cluster)}>
                                {alert.clusterName}
                              </Button>
                            );
                          case 'group':
                            return <Label isCompact>{alert.group}</Label>;
                          case 'component':
                            return <Label isCompact variant="outline">{alert.component}</Label>;
                          case 'state':
                            return <Label color={getStatusLabelColor(alert.status)} variant="outline" isCompact>{alert.status}</Label>;
                          case 'startTime':
                            return alert.lastFired;
                          case 'source':
                            return alert.source || '-';
                          case 'description':
                            return alert.description || '-';
                          case 'flappingRate':
                            const flappingData = generateFlappingEvents(alert.alertName, alert.severity);
                            return (
                              <FlappingRateChart
                                alertName={alert.alertName}
                                severity={alert.severity}
                                events={flappingData.events}
                                totalFlaps={flappingData.totalFlaps}
                                onClick={() => onAlertClick(alert, 1)} // Open to timeline tab
                              />
                            );
                          default:
                            return '-';
                        }
                      };
                      
                      return (
                        <Tr key={`${alert.id}-${idx}`}>
                          {getVisibleColumns().filter(col => col.key !== 'total').map(col => {
                            const tdProps: any = {
                              key: col.key,
                              modifier: "nowrap" as const,
                            };
                            
                            // Make Alert Name sticky
                            if (col.key === 'alertName') {
                              tdProps.isStickyColumn = true;
                              tdProps.stickyMinWidth = "200px";
                              tdProps.stickyLeftOffset = "0px";
                            }
                            
                            // Make Severity sticky (second column)
                            if (col.key === 'severity') {
                              tdProps.isStickyColumn = true;
                              tdProps.stickyMinWidth = "120px";
                              tdProps.stickyLeftOffset = "200px";
                            }
                            
                            return <Td {...tdProps}>{renderCellContent(col)}</Td>;
                          })}
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </InnerScrollContainer>
            )}
                </StackItem>
              </Stack>
      </CardBody>
      
      {/* Silence Alerts Modal */}
      <Modal
        isOpen={isSilenceModalOpen}
        onClose={() => setIsSilenceModalOpen(false)}
        variant="medium"
        aria-labelledby="silence-modal-title"
        aria-describedby="silence-modal-body"
      >
        <ModalHeader title="Silence selected alerts" labelId="silence-modal-title" />
        <ModalBody id="silence-modal-body">
          <Stack hasGutter>
            <StackItem>
              <Content component="p">
                Temporarily stop notifications for <strong>{selectedAlertKeys.size} selected</strong> alerts. 
                When the alert state is set to 'Silenced', all alert notifications will be muted until the 
                specified time. The creator of this silence is <strong>admin@example.com</strong>.
              </Content>
            </StackItem>
            
            <StackItem>
              <Accordion>
                <AccordionItem>
                  <AccordionToggle
                    id="silence-params-toggle"
                    onClick={() => {}}
                  >
                    Alerts silence parameters
                  </AccordionToggle>
                  <AccordionContent>
                    <div style={{ 
                      backgroundColor: 'var(--pf-t--global--background--color--secondary--default)', 
                      padding: '12px', 
                      borderRadius: '4px',
                      maxHeight: '150px',
                      overflowY: 'auto'
                    }}>
                      {selectedAlertsData.map(agg => (
                        <div key={`${agg.alertName}-${agg.severity}`} style={{ marginBottom: '4px' }}>
                          <Content component="small">alertname={agg.alertName}</Content>
                        </div>
                      ))}
                      {selectedAlertsData.length > 0 && (
                        <>
                          <Content component="small">severity={selectedAlertsData.map(a => a.severity.toLowerCase()).join(',')}</Content>
                          <br />
                          <Content component="small">namespace: default</Content>
                          <br />
                          <Content component="small">prometheus=openshift-monitoring/k8s</Content>
                        </>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </StackItem>
            
            <StackItem>
              <PfAlert variant="info" isInline title="This action will silence all alerts that match the selected parameters.">
                To silence alerts with a different set of parameters, please <Button variant="link" isInline>create a new silence rule</Button>.
              </PfAlert>
            </StackItem>
            
            <StackItem>
              <Stack hasGutter>
                <StackItem>
                  <Content component="p"><strong>Silence notifications for selected alerts</strong> <Tooltip content="Duration for which alerts will be silenced"><QuestionCircleIcon /></Tooltip></Content>
                </StackItem>
                <StackItem>
                  <Flex gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>
                      <Content component="small">From</Content>
                    </FlexItem>
                    <FlexItem>
                      <DatePicker aria-label="Start date" />
                    </FlexItem>
                    <FlexItem>
                      <TimePicker aria-label="Start time" />
                    </FlexItem>
                  </Flex>
                </StackItem>
                <StackItem>
                  <Flex gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>
                      <input type="radio" id="silence-for" name="silence-duration-type" defaultChecked />
                      <label htmlFor="silence-for" style={{ marginLeft: '8px' }}>For</label>
                    </FlexItem>
                    <FlexItem>
                      <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                        <FlexItem>
                          <Button variant="control" icon={<MinusIcon />} onClick={() => setSilenceDuration(Math.max(1, silenceDuration - 1))} />
                        </FlexItem>
                        <FlexItem>
                          <input 
                            type="number" 
                            value={silenceDuration} 
                            onChange={(e) => setSilenceDuration(parseInt(e.target.value) || 1)}
                            style={{ 
                              width: '60px', 
                              textAlign: 'center',
                              padding: '6px 8px',
                              border: '1px solid var(--pf-t--global--border--color--default)',
                              borderRadius: '3px',
                              fontSize: '14px'
                            }}
                            min={1}
                          />
                        </FlexItem>
                        <FlexItem>
                          <Button variant="control" icon={<PlusIcon />} onClick={() => setSilenceDuration(silenceDuration + 1)} />
                        </FlexItem>
                        <Dropdown
                          isOpen={isDurationUnitOpen}
                          onOpenChange={setIsDurationUnitOpen}
                          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                            <MenuToggle ref={toggleRef} onClick={() => setIsDurationUnitOpen(!isDurationUnitOpen)} isExpanded={isDurationUnitOpen}>
                              {silenceDurationUnit}
                            </MenuToggle>
                          )}
                        >
                          <DropdownList>
                            <DropdownItem onClick={() => { setSilenceDurationUnit('Hours'); setIsDurationUnitOpen(false); }}>Hours</DropdownItem>
                            <DropdownItem onClick={() => { setSilenceDurationUnit('Days'); setIsDurationUnitOpen(false); }}>Days</DropdownItem>
                            <DropdownItem onClick={() => { setSilenceDurationUnit('Weeks'); setIsDurationUnitOpen(false); }}>Weeks</DropdownItem>
                          </DropdownList>
                        </Dropdown>
                      </Flex>
                    </FlexItem>
                  </Flex>
                </StackItem>
                <StackItem>
                  <Flex gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>
                      <input type="radio" id="silence-until" name="silence-duration-type" />
                      <label htmlFor="silence-until" style={{ marginLeft: '8px' }}>Until</label>
                    </FlexItem>
                    <FlexItem>
                      <DatePicker aria-label="End date" isDisabled />
                    </FlexItem>
                    <FlexItem>
                      <TimePicker aria-label="End time" isDisabled />
                    </FlexItem>
                  </Flex>
                </StackItem>
              </Stack>
            </StackItem>
            
            <StackItem>
              <Stack hasGutter>
                <StackItem>
                  <Content component="p"><strong>Comment (optional)</strong> <Tooltip content="Add a comment to help identify this silence"><QuestionCircleIcon /></Tooltip></Content>
                </StackItem>
                <StackItem>
                  <TextInputGroup>
                    <TextInputGroupMain 
                      placeholder="I'm on it!"
                      value={silenceComment}
                      onChange={(_, val) => setSilenceComment(val)}
                    />
                  </TextInputGroup>
                  <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', marginTop: '4px' }}>
                    Add a short comment to provide more details.
                  </Content>
                </StackItem>
              </Stack>
            </StackItem>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button 
            variant="primary" 
            onClick={() => {
              setIsSilenceModalOpen(false);
              setSelectedAlertKeys(new Set());
              // Would trigger actual silence API call here
            }}
          >
            Silence alert
          </Button>
          <Button variant="link" onClick={() => setIsSilenceModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
      
      {/* Manage Columns Modal */}
      <Modal
        isOpen={isManageColumnsOpen}
        onClose={() => setIsManageColumnsOpen(false)}
        variant="small"
        aria-labelledby="manage-columns-modal-title"
      >
        <ModalHeader title="Manage columns" labelId="manage-columns-modal-title" />
        <ModalBody>
          <Stack hasGutter>
            <StackItem>
              <Content component="p" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                Selected categories will be deployed in the table.
              </Content>
            </StackItem>
            <StackItem>
              <Button 
                variant="link" 
                isInline
                onClick={() => {
                  // Filter relevant columns based on aggregation state
                  const relevantColumns = tempColumns.filter(c => {
                    if (isAggregated) {
                      return c.key !== 'clusters';
                    } else {
                      return c.key !== 'total';
                    }
                  });
                  
                  const allSelected = relevantColumns.filter(c => !c.isLocked).every(c => c.isVisible);
                  const visibleLockedCount = relevantColumns.filter(c => c.isLocked).length;
                  const availableSlots = MAX_VISIBLE_COLUMNS - visibleLockedCount;
                  
                  setTempColumns(prev => {
                    let slotsUsed = 0;
                    return prev.map(c => {
                      // Skip irrelevant columns
                      if ((isAggregated && c.key === 'clusters') || (!isAggregated && c.key === 'total')) {
                        return c;
                      }
                      
                      if (c.isLocked) return c;
                      if (!allSelected && slotsUsed < availableSlots) {
                        slotsUsed++;
                        return { ...c, isVisible: true };
                      }
                      return { ...c, isVisible: !allSelected ? slotsUsed < availableSlots : false };
                    });
                  });
                }}
              >
                Select all
              </Button>
            </StackItem>
            <StackItem>
              <div style={{ 
                border: '1px solid var(--pf-t--global--border--color--default)',
                borderRadius: '3px',
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                {tempColumns
                  .filter(col => {
                    // Filter columns based on aggregation state
                    if (isAggregated) {
                      return col.key !== 'clusters'; // Hide 'clusters' in aggregated view
                    } else {
                      return col.key !== 'total'; // Hide 'total' in non-aggregated view
                    }
                  })
                  .map((col, index) => (
                  <div 
                    key={col.key}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '12px 16px',
                      borderBottom: index < tempColumns.filter(c => isAggregated ? c.key !== 'clusters' : c.key !== 'total').length - 1 ? '1px solid var(--pf-t--global--border--color--default)' : 'none',
                      backgroundColor: 'var(--pf-t--global--background--color--primary--default)'
                    }}
                    draggable={!col.isLocked}
                    onDragStart={(e) => {
                      if (col.isLocked) {
                        e.preventDefault();
                        return;
                      }
                      e.dataTransfer.setData('text/plain', col.key);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const draggedKey = e.dataTransfer.getData('text/plain');
                      if (draggedKey === col.key) return;
                      
                      const draggedCol = tempColumns.find(c => c.key === draggedKey);
                      if (!draggedCol || draggedCol.isLocked || col.isLocked) return;
                      
                      const newColumns = [...tempColumns];
                      const draggedIndex = newColumns.findIndex(c => c.key === draggedKey);
                      const dropIndex = newColumns.findIndex(c => c.key === col.key);
                      
                      // Remove dragged item
                      newColumns.splice(draggedIndex, 1);
                      // Insert at new position
                      newColumns.splice(dropIndex, 0, draggedCol);
                      
                      // Update order
                      setTempColumns(newColumns.map((c, i) => ({ ...c, order: i })));
                    }}
                  >
                    <GripVerticalIcon 
                      style={{ 
                        marginRight: '12px',
                        color: col.isLocked ? 'var(--pf-t--global--text--color--disabled)' : 'var(--pf-t--global--text--color--subtle)',
                        cursor: col.isLocked ? 'not-allowed' : 'grab'
                      }} 
                    />
                    <Checkbox 
                      id={`col-checkbox-${col.key}`}
                      isChecked={col.isVisible}
                      isDisabled={col.isLocked}
                      onChange={(_, checked) => {
                        setTempColumns(prev => prev.map(c => 
                          c.key === col.key ? { ...c, isVisible: checked } : c
                        ));
                      }}
                      label={col.label}
                      style={{ 
                        color: col.isLocked ? 'var(--pf-t--global--text--color--subtle)' : undefined 
                      }}
                    />
                  </div>
                ))}
              </div>
            </StackItem>
            <StackItem>
              <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                Maximum {MAX_VISIBLE_COLUMNS} columns can be displayed. Currently showing {tempColumns.filter(c => c.isVisible).length} columns.
              </Content>
            </StackItem>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={saveColumnSettings}>
            Save
          </Button>
          <Button variant="link" onClick={() => setIsManageColumnsOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
      
      {/* Silence Alert Modal */}
      <Modal
        isOpen={isSilenceModalOpen}
        onClose={() => setIsSilenceModalOpen(false)}
        aria-labelledby="silence-alert-modal-title"
        aria-describedby="silence-alert-modal-body"
        variant="medium"
      >
        <ModalHeader
          title="Silence alert"
          labelId="silence-alert-modal-title"
          description={
            <Stack hasGutter>
              <StackItem>
                Temporarily stop notifications for <strong>{silenceAlertName}</strong> alert.
              </StackItem>
              <StackItem>
                <Content component="small">
                  When the alert state is set to 'Silenced', all alert notifications will be muted until the specified time. The creator of this silence is <strong>admin@nyy.com</strong>.
                </Content>
              </StackItem>
            </Stack>
          }
        />
        <ModalBody id="silence-alert-modal-body">
          <Stack hasGutter>
            {/* Alert silence parameters accordion */}
            <StackItem>
              <Accordion togglePosition="start">
                <AccordionItem isExpanded={isSilenceParamsExpanded}>
                  <AccordionToggle
                    onClick={() => setIsSilenceParamsExpanded(!isSilenceParamsExpanded)}
                    id="silence-params-toggle"
                  >
                    Alert silence parameters
                  </AccordionToggle>
                  <AccordionContent hidden={!isSilenceParamsExpanded}>
                    <DescriptionList isCompact>
                      <DescriptionListGroup>
                        <DescriptionListTerm>alertname</DescriptionListTerm>
                        <DescriptionListDescription>{silenceAlertName}</DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>severity</DescriptionListTerm>
                        <DescriptionListDescription>{silenceSeverity.toLowerCase()}</DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>namespace</DescriptionListTerm>
                        <DescriptionListDescription>default</DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>managed_cluster</DescriptionListTerm>
                        <DescriptionListDescription>#{silenceClusterName}</DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>prometheus</DescriptionListTerm>
                        <DescriptionListDescription>openshift-monitoring/k8s</DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </StackItem>
            
            {/* Silence duration */}
            <StackItem>
              <Stack hasGutter>
                <StackItem>
                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                    <FlexItem>
                      <Content component="p"><strong>Silence notifications for this alert</strong> <span style={{ color: 'var(--pf-t--global--color--status--danger--default)' }}>*</span></Content>
                    </FlexItem>
                    <FlexItem>
                      <Tooltip content="Specify when the silence should start and for how long it should last.">
                        <QuestionCircleIcon style={{ color: 'var(--pf-t--global--icon--color--subtle)' }} />
                      </Tooltip>
                    </FlexItem>
                  </Flex>
                </StackItem>
                
                {/* From row */}
                <StackItem>
                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                    <FlexItem style={{ width: '60px' }}>From</FlexItem>
                    <FlexItem>
                      <DatePicker 
                        value={silenceFromDate} 
                        onChange={(_, value) => setSilenceFromDate(value)} 
                      />
                    </FlexItem>
                    <FlexItem>
                      <TimePicker 
                        time={silenceFromTime} 
                        onChange={(_, time) => setSilenceFromTime(time)} 
                        is24Hour
                      />
                    </FlexItem>
                  </Flex>
                </StackItem>
                
                {/* For row */}
                <StackItem>
                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                    <FlexItem style={{ width: '60px' }}>
                      <input 
                        type="radio" 
                        id="v2-duration-for" 
                        name="v2-duration-type" 
                        checked={silenceDurationType === 'for'} 
                        onChange={() => setSilenceDurationType('for')} 
                        style={{ marginRight: '8px' }}
                      />
                      <label htmlFor="v2-duration-for">For</label>
                    </FlexItem>
                    <FlexItem>
                      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                        <FlexItem>
                          <Button 
                            variant="control" 
                            onClick={() => setSilenceDuration(Math.max(1, silenceDuration - 1))}
                            isDisabled={silenceDurationType !== 'for'}
                          >
                            -
                          </Button>
                        </FlexItem>
                        <FlexItem>
                          <input 
                            type="number" 
                            value={silenceDuration} 
                            onChange={(e) => setSilenceDuration(Number(e.target.value) || 1)} 
                            disabled={silenceDurationType !== 'for'}
                            style={{ 
                              width: '60px', 
                              textAlign: 'center',
                              padding: '6px 8px',
                              border: '1px solid var(--pf-t--global--border--color--default)',
                              borderRadius: '3px',
                              fontSize: '14px'
                            }}
                            min={1}
                          />
                        </FlexItem>
                        <FlexItem>
                          <Button 
                            variant="control" 
                            onClick={() => setSilenceDuration(silenceDuration + 1)}
                            isDisabled={silenceDurationType !== 'for'}
                          >
                            +
                          </Button>
                        </FlexItem>
                        {silenceDurationType === 'for' ? (
                          <Select
                            isOpen={isSilenceDurationUnitOpen}
                            onOpenChange={setIsSilenceDurationUnitOpen}
                            onSelect={(_, value) => { setSilenceDurationUnit(value as 'Hours' | 'Days' | 'Weeks'); setIsSilenceDurationUnitOpen(false); }}
                            selected={silenceDurationUnit}
                            toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                              <MenuToggle 
                                ref={toggleRef} 
                                onClick={() => setIsSilenceDurationUnitOpen(!isSilenceDurationUnitOpen)} 
                                isExpanded={isSilenceDurationUnitOpen}
                                style={{ width: '120px' }}
                              >
                                {silenceDurationUnit}
                              </MenuToggle>
                            )}
                          >
                            <SelectList>
                              <SelectOption value="Hours">Hours</SelectOption>
                              <SelectOption value="Days">Days</SelectOption>
                              <SelectOption value="Weeks">Weeks</SelectOption>
                            </SelectList>
                          </Select>
                        ) : (
                          <MenuToggle 
                            isDisabled
                            style={{ width: '120px' }}
                          >
                            {silenceDurationUnit}
                          </MenuToggle>
                        )}
                      </Flex>
                    </FlexItem>
                  </Flex>
                </StackItem>
                
                {/* Until row */}
                <StackItem>
                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                    <FlexItem style={{ width: '60px' }}>
                      <input 
                        type="radio" 
                        id="v2-duration-until" 
                        name="v2-duration-type" 
                        checked={silenceDurationType === 'until'} 
                        onChange={() => setSilenceDurationType('until')} 
                        style={{ marginRight: '8px' }}
                      />
                      <label htmlFor="v2-duration-until">Until</label>
                    </FlexItem>
                    <FlexItem>
                      <DatePicker 
                        value={silenceUntilDate} 
                        onChange={(_, value) => setSilenceUntilDate(value)} 
                        isDisabled={silenceDurationType !== 'until'}
                      />
                    </FlexItem>
                    <FlexItem>
                      <TimePicker 
                        time={silenceUntilTime} 
                        onChange={(_, time) => setSilenceUntilTime(time)} 
                        is24Hour
                        isDisabled={silenceDurationType !== 'until'}
                      />
                    </FlexItem>
                  </Flex>
                </StackItem>
              </Stack>
            </StackItem>
            
            {/* Comment */}
            <StackItem>
              <Stack hasGutter>
                <StackItem>
                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                    <FlexItem>
                      <Content component="p"><strong>Comment (optional)</strong></Content>
                    </FlexItem>
                    <FlexItem>
                      <Tooltip content="Add a comment to help your team understand why this alert was silenced.">
                        <QuestionCircleIcon style={{ color: 'var(--pf-t--global--icon--color--subtle)' }} />
                      </Tooltip>
                    </FlexItem>
                  </Flex>
                </StackItem>
                <StackItem>
                  <TextInputGroup>
                    <TextInputGroupMain 
                      type="text" 
                      placeholder="I'm on it!"
                      value={silenceComment} 
                      onChange={(_, value) => setSilenceComment(value)} 
                    />
                  </TextInputGroup>
                </StackItem>
                <StackItem>
                  <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                    Add a short comment to provide more details. Let others in the team know how this alert is being addressed.
                  </Content>
                </StackItem>
              </Stack>
            </StackItem>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={() => setIsSilenceModalOpen(false)}>
            Silence alert
          </Button>
          <Button variant="link" onClick={() => setIsSilenceModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
      
      {/* Acknowledge Alert Modal */}
      <Modal
        isOpen={isAcknowledgeModalOpen}
        onClose={() => setIsAcknowledgeModalOpen(false)}
        aria-labelledby="acknowledge-alert-modal-title"
        aria-describedby="acknowledge-alert-modal-body"
        variant="medium"
      >
        <ModalHeader
          title="Acknowledge alert"
          labelId="acknowledge-alert-modal-title"
          description={`Mark ${acknowledgeAlertName} alert as acknowledged to indicate it's being addressed.`}
        />
        <ModalBody id="acknowledge-alert-modal-body">
          <Stack hasGutter>
            {/* Comment - Required */}
            <StackItem>
              <Stack hasGutter>
                <StackItem>
                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                    <FlexItem>
                      <Content component="p"><strong>Comment</strong> <span style={{ color: 'var(--pf-t--global--color--status--danger--default)' }}>*</span></Content>
                    </FlexItem>
                    <FlexItem>
                      <Tooltip content="Add a comment to help your team understand how this alert is being addressed.">
                        <QuestionCircleIcon style={{ color: 'var(--pf-t--global--icon--color--subtle)' }} />
                      </Tooltip>
                    </FlexItem>
                  </Flex>
                </StackItem>
                <StackItem>
                  <TextInputGroup>
                    <TextInputGroupMain 
                      type="text" 
                      placeholder="I'm on it!"
                      value={acknowledgeComment} 
                      onChange={(_, value) => setAcknowledgeComment(value)} 
                    />
                  </TextInputGroup>
                </StackItem>
                <StackItem>
                  <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                    Add a short comment to provide more details. Let others in the team know how this alert is being addressed.
                  </Content>
                </StackItem>
              </Stack>
            </StackItem>
            
            {/* Silence notifications checkbox */}
            <StackItem>
              <Checkbox
                id="v2-acknowledge-silence-checkbox"
                label="Silence notifications for this alert"
                isChecked={acknowledgeSilenceChecked}
                onChange={(_, checked) => setAcknowledgeSilenceChecked(checked)}
              />
            </StackItem>
            
            {/* Duration options - only shown when silence checkbox is checked */}
            {acknowledgeSilenceChecked && (
              <StackItem>
                <Stack hasGutter>
                  {/* For row */}
                  <StackItem>
                    <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                      <FlexItem style={{ width: '60px' }}>
                        <input 
                          type="radio" 
                          id="v2-ack-duration-for" 
                          name="v2-ack-duration-type" 
                          checked={acknowledgeDurationType === 'for'} 
                          onChange={() => setAcknowledgeDurationType('for')} 
                          style={{ marginRight: '8px' }}
                        />
                        <label htmlFor="v2-ack-duration-for">For</label>
                      </FlexItem>
                      <FlexItem>
                        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                          <Button 
                            variant="control" 
                            onClick={() => setAcknowledgeDuration(Math.max(1, acknowledgeDuration - 1))}
                            isDisabled={acknowledgeDurationType !== 'for'}
                          >
                            -
                          </Button>
                          <TextInputGroup isDisabled={acknowledgeDurationType !== 'for'}>
                            <TextInputGroupMain 
                              type="number" 
                              value={acknowledgeDuration} 
                              onChange={(_, value) => setAcknowledgeDuration(Number(value) || 1)} 
                              style={{ width: '60px', textAlign: 'center' }}
                            />
                          </TextInputGroup>
                          <Button 
                            variant="control" 
                            onClick={() => setAcknowledgeDuration(acknowledgeDuration + 1)}
                            isDisabled={acknowledgeDurationType !== 'for'}
                          >
                            +
                          </Button>
                          {acknowledgeDurationType === 'for' ? (
                            <Select
                              isOpen={isAcknowledgeDurationUnitOpen}
                              onOpenChange={setIsAcknowledgeDurationUnitOpen}
                              onSelect={(_, value) => { setAcknowledgeDurationUnit(value as 'Hours' | 'Days' | 'Weeks'); setIsAcknowledgeDurationUnitOpen(false); }}
                              selected={acknowledgeDurationUnit}
                              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                <MenuToggle 
                                  ref={toggleRef} 
                                  onClick={() => setIsAcknowledgeDurationUnitOpen(!isAcknowledgeDurationUnitOpen)} 
                                  isExpanded={isAcknowledgeDurationUnitOpen}
                                  style={{ width: '120px' }}
                                >
                                  {acknowledgeDurationUnit}
                                </MenuToggle>
                              )}
                            >
                              <SelectList>
                                <SelectOption value="Hours">Hours</SelectOption>
                                <SelectOption value="Days">Days</SelectOption>
                                <SelectOption value="Weeks">Weeks</SelectOption>
                              </SelectList>
                            </Select>
                          ) : (
                            <MenuToggle 
                              isDisabled
                              style={{ width: '120px' }}
                            >
                              {acknowledgeDurationUnit}
                            </MenuToggle>
                          )}
                        </Flex>
                      </FlexItem>
                    </Flex>
                  </StackItem>
                  
                  {/* Until row */}
                  <StackItem>
                    <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                      <FlexItem style={{ width: '60px' }}>
                        <input 
                          type="radio" 
                          id="v2-ack-duration-until" 
                          name="v2-ack-duration-type" 
                          checked={acknowledgeDurationType === 'until'} 
                          onChange={() => setAcknowledgeDurationType('until')} 
                          style={{ marginRight: '8px' }}
                        />
                        <label htmlFor="v2-ack-duration-until">Until</label>
                      </FlexItem>
                      <FlexItem>
                        <DatePicker 
                          value={acknowledgeUntilDate} 
                          onChange={(_, value) => setAcknowledgeUntilDate(value)} 
                          isDisabled={acknowledgeDurationType !== 'until'}
                        />
                      </FlexItem>
                      <FlexItem>
                        <TimePicker 
                          time={acknowledgeUntilTime} 
                          onChange={(_, time) => setAcknowledgeUntilTime(time)} 
                          is24Hour
                          isDisabled={acknowledgeDurationType !== 'until'}
                        />
                      </FlexItem>
                    </Flex>
                  </StackItem>
                </Stack>
              </StackItem>
            )}
            
            {/* Info alert */}
            <StackItem>
              <PfAlert variant="info" isInline title={`Alert will be shown as "Acknowledged by admin@nyf.com"`} />
            </StackItem>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={() => setIsAcknowledgeModalOpen(false)} isDisabled={!acknowledgeComment.trim()}>
            Acknowledge alert
          </Button>
          <Button variant="link" onClick={() => setIsAcknowledgeModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </Card>
  );
};

// ========================================
// ALERTS TIMELINE CARD
// ========================================

interface AlertsTimelineCardProps {
  trendData: TrendData[];
}

type TimeRange = '1h' | '6h' | '24h' | '7d' | 'custom';

const AlertsTimelineCard: React.FC<AlertsTimelineCardProps> = ({ trendData }) => {
  const [timeRange, setTimeRange] = React.useState<TimeRange>('6h');
  const [selectedAnomaly, setSelectedAnomaly] = React.useState<{ timestamp: string; index: number } | null>(null);

  // Detect anomalies (simple threshold-based detection)
  const detectAnomalies = React.useMemo(() => {
    const totals = trendData.map(d => d.critical + d.warning + d.info);
    const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
    const threshold = avg * 2; // 200% increase
    
    return trendData.map((d, i) => {
      const total = d.critical + d.warning + d.info;
      return total > threshold ? { index: i, value: total, timestamp: d.timestamp, increase: Math.round((total / avg - 1) * 100) } : null;
    }).filter(Boolean);
  }, [trendData]);

  const hasAnomaly = detectAnomalies.length > 0;
  const mostSignificantAnomaly = detectAnomalies.length > 0 ? detectAnomalies[0] : null;

  const chartRef = React.useRef<any>(null);

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: '#d2d2d2',
      borderWidth: 1,
      textStyle: { color: '#151515', fontFamily: 'RedHatText, sans-serif' },
    },
    legend: {
      data: ['Critical', 'Warning', 'Info'],
      bottom: 0,
      textStyle: { fontFamily: 'RedHatText, sans-serif' },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trendData.map(d => d.timestamp),
      axisLabel: { fontFamily: 'RedHatText, sans-serif' },
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontFamily: 'RedHatText, sans-serif' },
    },
    series: [
      {
        name: 'Critical',
        type: 'line',
        stack: 'Total',
        emphasis: { focus: 'series' },
        data: trendData.map(d => d.critical),
        itemStyle: { color: '#c9190b' },
        lineStyle: { color: '#c9190b' },
        areaStyle: { color: '#c9190b', opacity: 0.3 },
      },
      {
        name: 'Warning',
        type: 'line',
        stack: 'Total',
        emphasis: { focus: 'series' },
        data: trendData.map(d => d.warning),
        itemStyle: { color: '#f0ab00' },
        lineStyle: { color: '#f0ab00' },
        areaStyle: { color: '#f0ab00', opacity: 0.3 },
      },
      {
        name: 'Info',
        type: 'line',
        stack: 'Total',
        emphasis: { focus: 'series' },
        data: trendData.map(d => d.info),
        itemStyle: { color: '#6753ac' },
        lineStyle: { color: '#6753ac' },
        areaStyle: { color: '#6753ac', opacity: 0.3 },
      },
      // Anomaly markers
      ...(detectAnomalies.length > 0 ? [{
        name: 'Anomaly',
        type: 'scatter',
        data: detectAnomalies.map(anomaly => [anomaly!.index, anomaly!.value]),
        symbol: 'circle',
        symbolSize: 12,
        itemStyle: {
          color: '#c9190b',
          borderColor: '#fff',
          borderWidth: 2,
        },
        emphasis: {
          itemStyle: {
            color: '#c9190b',
            borderColor: '#fff',
            borderWidth: 3,
            shadowBlur: 10,
            shadowColor: 'rgba(201, 25, 11, 0.5)',
          },
        },
        zlevel: 10,
      }] : []),
    ],
  };

  const handleChartClick = (params: any) => {
    if (params.seriesName === 'Anomaly') {
      const anomaly = detectAnomalies[params.dataIndex];
      if (anomaly) {
        setSelectedAnomaly({ timestamp: anomaly.timestamp, index: anomaly.index });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <CardTitle>Alert velocity & trends</CardTitle>
          </FlexItem>
          <FlexItem>
            <ToggleGroup aria-label="Time range selector">
              <ToggleGroupItem
                text="1h"
                isSelected={timeRange === '1h'}
                onChange={() => setTimeRange('1h')}
              />
              <ToggleGroupItem
                text="6h"
                isSelected={timeRange === '6h'}
                onChange={() => setTimeRange('6h')}
              />
              <ToggleGroupItem
                text="24h"
                isSelected={timeRange === '24h'}
                onChange={() => setTimeRange('24h')}
              />
              <ToggleGroupItem
                text="7d"
                isSelected={timeRange === '7d'}
                onChange={() => setTimeRange('7d')}
              />
              <ToggleGroupItem
                text="Custom"
                isSelected={timeRange === 'custom'}
                onChange={() => setTimeRange('custom')}
              />
            </ToggleGroup>
          </FlexItem>
        </Flex>
      </CardHeader>
      <CardBody>
        <Stack hasGutter>
          {hasAnomaly && (
            <StackItem>
              <PfAlert variant="warning" isInline title="Anomaly detected" style={{ marginBottom: '16px' }}>
                <Content component="p">
                  Unusual spike detected in alert volume. Click on the highlighted point in the chart to investigate.
                </Content>
              </PfAlert>
            </StackItem>
          )}
          <StackItem>
            <div style={{ height: '300px', width: '100%' }}>
              <ReactECharts 
                ref={chartRef}
                option={option} 
                style={{ height: '100%', width: '100%', cursor: 'pointer' }} 
                onEvents={{ click: handleChartClick }}
              />
            </div>
          </StackItem>
          {mostSignificantAnomaly && (
            <StackItem>
              <PfAlert variant="info" isInline title="Trends Insights">
                <Content component="p">
                  Volume increased {mostSignificantAnomaly.increase}% at {mostSignificantAnomaly.timestamp}. Major clusters Prod-01 and Stage-02 report Disk Pressure.
                </Content>
              </PfAlert>
            </StackItem>
          )}
        </Stack>
      </CardBody>
      
      {/* Popover-style floating card for anomaly details */}
      {selectedAnomaly && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999,
            maxWidth: '400px',
            backgroundColor: 'var(--pf-t--global--background--color--primary--default, #fff)',
            border: '1px solid var(--pf-t--global--border--color--default, #d2d2d2)',
            borderRadius: 'var(--pf-t--global--border--radius--medium, 8px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          }}
        >
          <Card isPlain>
            <CardHeader>
              <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                <FlexItem>
                  <CardTitle>Anomaly at {selectedAnomaly.timestamp}</CardTitle>
                </FlexItem>
                <FlexItem>
                  <Button 
                    variant="plain" 
                    aria-label="Close"
                    onClick={() => setSelectedAnomaly(null)}
                  >
                    <TimesIcon />
                  </Button>
                </FlexItem>
              </Flex>
            </CardHeader>
            <CardBody>
              <Stack hasGutter>
                <StackItem>
                  <Content component="p">
                    This spike represents an unusual increase in alert volume.
                  </Content>
                </StackItem>
                <StackItem>
                  <Button 
                    variant="link" 
                    isInline
                    onClick={() => {
                      setSelectedAnomaly(null);
                      // Navigate to alert details
                    }}
                  >
                    View alert details →
                  </Button>
                </StackItem>
                <StackItem>
                  <Button 
                    variant="link" 
                    isInline
                    onClick={() => {
                      setSelectedAnomaly(null);
                      // Navigate to incidents tab
                    }}
                  >
                    Review in Incidents tab →
                  </Button>
                </StackItem>
              </Stack>
            </CardBody>
          </Card>
        </div>
      )}
      
      {/* Backdrop overlay when popover is open */}
      {selectedAnomaly && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 9998,
          }}
          onClick={() => setSelectedAnomaly(null)}
        />
      )}
    </Card>
  );
};

// ========================================
// CROSS-CLUSTER INSIGHTS CARDS
// ========================================

interface CrossClusterInsightsCardsProps {
  clusters: ClusterData[];
  onAlertRuleClick: (alertName: string) => void;
  onComponentClick: (componentName: string) => void;
}

const CrossClusterInsightsCards: React.FC<CrossClusterInsightsCardsProps> = ({
  clusters,
  onAlertRuleClick,
  onComponentClick,
}) => {
  // Calculate alert rule counts across all clusters
  const alertRuleCounts = React.useMemo(() => {
    const counts: Record<string, { count: number; severity: AlertSeverity; clusters: string[] }> = {};
    clusters.forEach(cluster => {
      cluster.alerts.filter(a => a.status === 'firing').forEach(alert => {
        if (!counts[alert.alertName]) {
          counts[alert.alertName] = { count: 0, severity: alert.severity, clusters: [] };
        }
        counts[alert.alertName].count++;
        if (!counts[alert.alertName].clusters.includes(cluster.name)) {
          counts[alert.alertName].clusters.push(cluster.name);
        }
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([name, data]) => ({ name, ...data }));
  }, [clusters]);

  // Calculate component counts across all clusters
  const componentCounts = React.useMemo(() => {
    const counts: Record<string, { count: number; critical: number; warning: number; info: number; clusters: string[] }> = {};
    clusters.forEach(cluster => {
      cluster.alerts.filter(a => a.status === 'firing').forEach(alert => {
        if (!counts[alert.component]) {
          counts[alert.component] = { count: 0, critical: 0, warning: 0, info: 0, clusters: [] };
        }
        counts[alert.component].count++;
        if (alert.severity === 'Critical') counts[alert.component].critical++;
        if (alert.severity === 'Warning') counts[alert.component].warning++;
        if (alert.severity === 'Info') counts[alert.component].info++;
        if (!counts[alert.component].clusters.includes(cluster.name)) {
          counts[alert.component].clusters.push(cluster.name);
        }
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([name, data]) => ({ name, ...data }));
  }, [clusters]);

  return (
    <>
      {/* Top Firing Alerts Card */}
      <StackItem>
        <Card>
          <CardHeader>
            <CardTitle>Top Firing Alerts</CardTitle>
          </CardHeader>
          <CardBody>
            <Table aria-label="Top firing alert rules" variant="compact">
              <Thead>
                <Tr>
                  <Th>Alert Rule</Th>
                  <Th>Severity</Th>
                  <Th>Count</Th>
                  <Th>Clusters</Th>
                </Tr>
              </Thead>
              <Tbody>
                {alertRuleCounts.map(rule => (
                  <Tr key={rule.name} isClickable onRowClick={() => onAlertRuleClick(rule.name)}>
                    <Td>
                      <Button variant="link" isInline onClick={(e) => { e.stopPropagation(); onAlertRuleClick(rule.name); }}>
                        {rule.name}
                      </Button>
                    </Td>
                    <Td>
                      <Label color={getSeverityLabelColor(rule.severity)} isCompact>{rule.severity}</Label>
                    </Td>
                    <Td><Badge>{rule.count}</Badge></Td>
                    <Td>
                      <Popover
                        headerContent="Clusters"
                        bodyContent={
                          <Stack hasGutter>
                            {rule.clusters.map(c => (
                              <StackItem key={c}>{c}</StackItem>
                            ))}
                          </Stack>
                        }
                      >
                        <Badge isRead style={{ cursor: 'pointer' }}>{rule.clusters.length} clusters</Badge>
                      </Popover>
                    </Td>
                  </Tr>
                ))}
                {alertRuleCounts.length === 0 && (
                  <Tr>
                    <Td colSpan={4}>
                      <Content component="small" className="pf-v6-u-color-200">No firing alerts</Content>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </StackItem>

      {/* Most Impacted Components Card */}
      <StackItem>
        <Card>
          <CardHeader>
            <CardTitle>Most Impacted Components</CardTitle>
          </CardHeader>
          <CardBody>
            <Table aria-label="Most impacted components" variant="compact">
              <Thead>
                <Tr>
                  <Th>Component</Th>
                  <Th>Clusters</Th>
                  <Th>Total</Th>
                  <Th>Breakdown</Th>
                </Tr>
              </Thead>
              <Tbody>
                {componentCounts.map(comp => (
                  <Tr key={comp.name} isClickable onRowClick={() => onComponentClick(comp.name)}>
                    <Td>
                      <Button variant="link" isInline onClick={(e) => { e.stopPropagation(); onComponentClick(comp.name); }}>
                        {comp.name}
                      </Button>
                    </Td>
                    <Td>
                      <Popover
                        headerContent="Clusters with this component impacted"
                        bodyContent={
                          <Stack hasGutter>
                            {comp.clusters.map(c => (
                              <StackItem key={c}>{c}</StackItem>
                            ))}
                          </Stack>
                        }
                      >
                        <Badge isRead style={{ cursor: 'pointer' }}>{comp.clusters.length} clusters</Badge>
                      </Popover>
                    </Td>
                    <Td><Badge>{comp.count}</Badge></Td>
                    <Td>
                      <Flex gap={{ default: 'gapSm' }}>
                        {comp.critical > 0 && <FlexItem><Label color="red" isCompact>{comp.critical}</Label></FlexItem>}
                        {comp.warning > 0 && <FlexItem><Label color="orange" isCompact>{comp.warning}</Label></FlexItem>}
                        {comp.info > 0 && <FlexItem><Label color="purple" isCompact>{comp.info}</Label></FlexItem>}
                      </Flex>
                    </Td>
                  </Tr>
                ))}
                {componentCounts.length === 0 && (
                  <Tr>
                    <Td colSpan={4}>
                      <Content component="small" className="pf-v6-u-color-200">No impacted components</Content>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </StackItem>
    </>
  );
};

// ========================================
// CLUSTER TILE COMPONENT
// ========================================

interface ClusterTileProps {
  cluster: ClusterData;
  onDrillDown: (cluster: ClusterData) => void;
}

const ClusterTile: React.FC<ClusterTileProps> = ({ cluster, onDrillDown }) => {
  const status = getClusterAlertStatus(cluster);
  const bgColor = getStatusBackgroundColor(status);
  const firingAlerts = cluster.alerts.filter(a => a.status === 'firing');
  const criticalCount = firingAlerts.filter(a => a.severity === 'Critical').length;
  const warningCount = firingAlerts.filter(a => a.severity === 'Warning').length;
  const infoCount = firingAlerts.filter(a => a.severity === 'Info').length;

  const popoverContent = (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h4" size="md">{cluster.name}</Title>
      </StackItem>
      <Divider />
      <StackItem>
        <Grid hasGutter>
          <GridItem span={6}>
            <DescriptionList isCompact>
              <DescriptionListGroup>
                <DescriptionListTerm>Region</DescriptionListTerm>
                <DescriptionListDescription>{cluster.region}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Provider</DescriptionListTerm>
                <DescriptionListDescription>{cluster.cloudProvider}</DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </GridItem>
          <GridItem span={6}>
            <DescriptionList isCompact>
              <DescriptionListGroup>
                <DescriptionListTerm>Nodes</DescriptionListTerm>
                <DescriptionListDescription>{cluster.nodeCount}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Pods</DescriptionListTerm>
                <DescriptionListDescription>{cluster.podCount}</DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </GridItem>
        </Grid>
      </StackItem>
      <StackItem>
        <Stack hasGutter>
          <StackItem>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
              <FlexItem><Content component="small">CPU</Content></FlexItem>
              <FlexItem><Content component="small">{cluster.cpuUsage}%</Content></FlexItem>
            </Flex>
            <Progress value={cluster.cpuUsage} size={ProgressSize.sm} aria-label="CPU usage" />
          </StackItem>
          <StackItem>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
              <FlexItem><Content component="small">Memory</Content></FlexItem>
              <FlexItem><Content component="small">{cluster.memoryUsage}%</Content></FlexItem>
            </Flex>
            <Progress value={cluster.memoryUsage} size={ProgressSize.sm} aria-label="Memory usage" />
          </StackItem>
        </Stack>
      </StackItem>
      <Divider />
      <StackItem>
        <Flex gap={{ default: 'gapSm' }}>
          <FlexItem>
            <Label color="red" isCompact icon={<ExclamationCircleIcon />}>{criticalCount}</Label>
          </FlexItem>
          <FlexItem>
            <Label color="orange" isCompact icon={<ExclamationTriangleIcon />}>{warningCount}</Label>
          </FlexItem>
          <FlexItem>
            <Label color="purple" isCompact icon={<InfoCircleIcon />}>{infoCount}</Label>
          </FlexItem>
        </Flex>
      </StackItem>
    </Stack>
  );

  return (
    <Popover
      headerContent={<Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
        <FlexItem>
          <Icon status={status === 'healthy' ? 'success' : status === 'critical' ? 'danger' : status === 'warning' ? 'warning' : 'info'}>
            {status === 'healthy' ? <CheckCircleIcon /> : status === 'critical' ? <ExclamationCircleIcon /> : status === 'warning' ? <ExclamationTriangleIcon /> : <InfoCircleIcon />}
          </Icon>
        </FlexItem>
        <FlexItem>Cluster Status</FlexItem>
      </Flex>}
      bodyContent={popoverContent}
      footerContent={
        <Button variant="link" isInline onClick={() => onDrillDown(cluster)}>
          View cluster details →
        </Button>
      }
      position="right"
      triggerAction="hover"
      withFocusTrap={false}
    >
      <div
        onClick={() => onDrillDown(cluster)}
        style={{
          width: '100px',
          height: '100px',
          backgroundColor: bgColor,
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '11px',
          fontWeight: 600,
          textAlign: 'center',
          padding: '8px',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        }}
      >
        <div style={{ fontSize: '24px', marginBottom: '4px' }}>
          {firingAlerts.length > 0 ? firingAlerts.length : '✓'}
        </div>
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
          {cluster.name.replace('prod-', '').replace('staging-', 'stg-').replace('dev-', '')}
        </div>
      </div>
    </Popover>
  );
};

// ========================================
// MULTI SELECT COMPONENT
// ========================================

interface MultiSelectFilterProps {
  label: string;
  options: string[];
  selected: string[];
  onSelect: (selected: string[]) => void;
  hasSearch?: boolean;
  width?: string;
}

const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({
  label,
  options,
  selected,
  onSelect,
  hasSearch = false,
  width = '180px',
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  const filteredOptions = hasSearch && searchValue
    ? options.filter(opt => opt.toLowerCase().includes(searchValue.toLowerCase()))
    : options;

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsOpen(!isOpen)}
      isExpanded={isOpen}
      style={{ width }}
      badge={selected.length > 0 ? <Badge isRead>{selected.length}</Badge> : undefined}
    >
      <FilterIcon /> {label}
    </MenuToggle>
  );

  const handleSelect = (_event: React.MouseEvent | undefined, value: string | number | undefined) => {
    const val = String(value);
    if (selected.includes(val)) {
      onSelect(selected.filter(s => s !== val));
    } else {
      onSelect([...selected, val]);
    }
  };

  return (
    <Select
      toggle={toggle}
      onSelect={handleSelect}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      {hasSearch && (
        <div style={{ padding: '8px' }}>
          <TextInputGroup>
            <TextInputGroupMain
              value={searchValue}
              onChange={(_event, value) => setSearchValue(value)}
              placeholder="Search..."
            />
            {searchValue && (
              <TextInputGroupUtilities>
                <Button variant="plain" onClick={() => setSearchValue('')} aria-label="Clear search">
                  <TimesIcon />
                </Button>
              </TextInputGroupUtilities>
            )}
          </TextInputGroup>
        </div>
      )}
      <SelectList>
        {filteredOptions.map(option => (
          <SelectOption
            key={option}
            value={option}
            hasCheckbox
            isSelected={selected.includes(option)}
          >
            {option}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );
};

// ========================================
// STATS CARD COMPONENT
// ========================================

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: { value: number; isUp: boolean };
  color?: 'default' | 'danger' | 'warning' | 'success';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, trend, color = 'default' }) => {
  const colorClass = color === 'danger' ? 'pf-v6-u-danger-color-100' 
    : color === 'warning' ? 'pf-v6-u-warning-color-100'
    : color === 'success' ? 'pf-v6-u-success-color-100'
    : '';

  return (
    <Card isFullHeight>
      <CardBody>
        <Flex direction={{ default: 'column' }} gap={{ default: 'gapSm' }}>
          <FlexItem>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
              <FlexItem>
                <Content component="small" className="pf-v6-u-color-200">{title}</Content>
              </FlexItem>
              <FlexItem>{icon}</FlexItem>
            </Flex>
          </FlexItem>
          <FlexItem>
            <Title headingLevel="h2" size="3xl" className={colorClass}>{value}</Title>
          </FlexItem>
          {trend && (
            <FlexItem>
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }}>
                <FlexItem>
                  <Icon status={trend.isUp ? 'danger' : 'success'} size="sm">
                    {trend.isUp ? <ArrowUpIcon /> : <ArrowDownIcon />}
                  </Icon>
                </FlexItem>
                <FlexItem>
                  <Content component="small" className={trend.isUp ? 'pf-v6-u-danger-color-100' : 'pf-v6-u-success-color-100'}>
                    {trend.value}% from last hour
                  </Content>
                </FlexItem>
              </Flex>
            </FlexItem>
          )}
        </Flex>
      </CardBody>
    </Card>
  );
};

// ========================================
// MAIN COMPONENT
// ========================================

const MultiClusterAlertingDashboard: React.FunctionComponent = () => {
  // Router hooks for URL-based navigation state (enables browser back button)
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Main page tabs - initialize from URL params
  const [mainPageTab, setMainPageTab] = React.useState<string | number>(() => {
    const tab = searchParams.get('tab');
    return tab === 'management' ? 'management' : tab === 'incidents' ? 'incidents' : 'alerts';
  });
  const [managementSubTab, setManagementSubTab] = React.useState<string | number>(() => {
    const subtab = searchParams.get('subtab');
    return subtab === 'silence-rules' ? 'silence-rules' : 'alert-rules';
  });
  
  // Handle URL parameter changes for tab navigation
  React.useEffect(() => {
    const tab = searchParams.get('tab');
    const subtab = searchParams.get('subtab');
    if (tab === 'management') {
      setMainPageTab('management');
      if (subtab === 'silence-rules') {
        setManagementSubTab('silence-rules');
      } else {
        setManagementSubTab('alert-rules');
      }
    }
  }, [searchParams]);
  
  // V2: Alerts sub-tabs - derive initial state from URL params for back button support
  const getInitialSubTab = (): 'clusters-health' | 'firing-alerts' => {
    const tab = searchParams.get('tab');
    return tab === 'firing-alerts' ? 'firing-alerts' : 'clusters-health';
  };
  const [alertsSubTab, setAlertsSubTabState] = React.useState<'clusters-health' | 'firing-alerts'>(getInitialSubTab);
  
  // Wrapper to update URL when changing tabs (enables back button)
  const setAlertsSubTab = React.useCallback((tab: 'clusters-health' | 'firing-alerts') => {
    setAlertsSubTabState(tab);
    const newParams = new URLSearchParams(searchParams);
    if (tab === 'firing-alerts') {
      newParams.set('tab', 'firing-alerts');
    } else {
      newParams.delete('tab');
      // Clear cluster filter from URL when going back to clusters health
      newParams.delete('cluster');
      newParams.delete('component');
    }
    navigate(`?${newParams.toString()}`, { replace: false });
  }, [navigate, searchParams]);
  
  // Animation state for filtered view transition
  const [showFilterAnimation, setShowFilterAnimation] = React.useState(false);
  
  // V2: In-card view states (no drill-down, stay in same page)
  // Cluster Overview Card: show all clusters or single cluster components
  const [clusterCardView, setClusterCardView] = React.useState<'all-clusters' | 'single-cluster-components'>('all-clusters');
  const [selectedClusterInCard, setSelectedClusterInCard] = React.useState<ClusterData | null>(null);
  
  // Ref for auto-scrolling to cluster card when selected
  const clusterCardRef = React.useRef<HTMLDivElement>(null);
  
  // Firing Alerts Card: show all clusters alerts or single cluster alerts
  const [firingAlertsCardView, setFiringAlertsCardView] = React.useState<'all-clusters' | 'single-cluster'>('all-clusters');
  const [selectedClusterForAlerts, setSelectedClusterForAlerts] = React.useState<ClusterData | null>(null);
  
  // Firing Alerts grouping
  type AlertsGroupByOption = 'none' | 'time' | 'severity' | 'alertName' | 'impact' | 'component' | 'cluster';
  const [alertsGroupBy, setAlertsGroupBy] = React.useState<AlertsGroupByOption>('none');
  const [isAlertsGroupByOpen, setIsAlertsGroupByOpen] = React.useState(false);
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set());
  
  // V2: Three-tier navigation state (keeping for backward compat, but not used in new flow)
  const [navigationView, setNavigationView] = React.useState<NavigationView>('fleet-overview');
  const [selectedCluster, setSelectedCluster] = React.useState<ClusterData | null>(null);
  const [selectedComponent, setSelectedComponent] = React.useState<AlertComponent | null>(null);
  
  // Legacy view state (for backward compatibility with existing code)
  const isDrillDownView = navigationView === 'component-alerts';
  const setIsDrillDownView = (value: boolean) => {
    if (value) {
      setNavigationView('component-alerts');
    } else {
      setNavigationView('fleet-overview');
    }
  };

  // Filter states
  const [regionFilter, setRegionFilter] = React.useState<string[]>([]);
  const [clusterFilter, setClusterFilter] = React.useState<string[]>([]);
  const [namespaceFilter, setNamespaceFilter] = React.useState<string[]>([]);
  const [labelFilter, setLabelFilter] = React.useState<string[]>([]);
  const [severityFilter, setSeverityFilter] = React.useState<AlertSeverity[]>([]);
  const [groupFilter, setGroupFilter] = React.useState<AlertGroup[]>(['Cluster', 'Namespace']);
  const [componentFilter, setComponentFilter] = React.useState<AlertComponent[]>([]);
  const [searchValue, setSearchValue] = React.useState('');
  const [triggeredFromDate, setTriggeredFromDate] = React.useState<string>('');
  const [triggeredFromTime, setTriggeredFromTime] = React.useState<string>('');
  const [triggeredToDate, setTriggeredToDate] = React.useState<string>('');
  const [triggeredToTime, setTriggeredToTime] = React.useState<string>('');

  // View and grouping
  const [viewMode, setViewMode] = React.useState<ViewMode>('treemap');
  const [groupBy, setGroupBy] = React.useState<GroupByOption>('severity');
  const [sortBy, setSortBy] = React.useState<SortByOption>('severity');
  const [importanceSizing, setImportanceSizing] = React.useState<ImportanceSizing>('none');
  const [userRole] = React.useState<UserRole>('admin');
  
  // All available components
  const allAvailableComponents: AlertComponent[] = React.useMemo(() => 
    ['kube-apiserver', 'Storage', 'Network', 'etcd', 'Scheduler', 'Controller', 'Workload', 'Pod', 'Quota'], 
    []
  );
  
  // Available label keys from clusters (for typeahead selection)
  const availableLabelKeys = React.useMemo(() => [
    { value: 'env', content: 'env' },
    { value: 'environment', content: 'environment' },
    { value: 'team', content: 'team' },
    { value: 'owner', content: 'owner' },
    { value: 'region', content: 'region' },
    { value: 'zone', content: 'zone' },
    { value: 'app', content: 'app' },
    { value: 'component', content: 'component' },
    { value: 'tier', content: 'tier' },
    { value: 'project', content: 'project' },
    { value: 'stage', content: 'stage' },
  ], []);

  // Environment grouping settings
  const [environmentCategories, setEnvironmentCategories] = React.useState<EnvironmentCategory[]>([
    { id: 'production', label: 'Production', color: 'red', patterns: ['prod-', 'prd-', 'live-'] },
    { id: 'staging', label: 'Staging', color: 'orange', patterns: ['staging-', 'stg-'] },
    { id: 'development', label: 'Development', color: 'blue', patterns: ['dev-', 'development-'] },
  ]);
  const [isEnvironmentSettingsOpen, setIsEnvironmentSettingsOpen] = React.useState(false);
  const [tempEnvironmentCategories, setTempEnvironmentCategories] = React.useState<EnvironmentCategory[]>([]);
  const [newPatternInputs, setNewPatternInputs] = React.useState<Record<string, string>>({});
  
  // Team grouping settings
  const [teamCategories, setTeamCategories] = React.useState<TeamCategory[]>([
    { id: 'platform', label: 'Platform', color: 'blue', patterns: ['prod-aws', 'prod-gcp'] },
    { id: 'data', label: 'Data', color: 'purple', patterns: ['prod-azure', 'staging-aws'] },
    { id: 'development', label: 'Development', color: 'green', patterns: ['dev-', 'staging-gcp', 'staging-azure'] },
  ]);
  const [isTeamSettingsOpen, setIsTeamSettingsOpen] = React.useState(false);
  const [tempTeamCategories, setTempTeamCategories] = React.useState<TeamCategory[]>([]);
  const [newTeamPatternInputs, setNewTeamPatternInputs] = React.useState<Record<string, string>>({});
  
  // Table sorting state
  const [activeSortIndex, setActiveSortIndex] = React.useState<number | null>(null);
  const [activeSortDirection, setActiveSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [isGroupByOpen, setIsGroupByOpen] = React.useState(false);
  // Treemap legend filters
  const [treemapLegendFilters, setTreemapLegendFilters] = React.useState<('Critical' | 'Warning' | 'Info' | 'Healthy')[]>([]);
  const [isSortByOpen, setIsSortByOpen] = React.useState(false);
  const [isSizeByOpen, setIsSizeByOpen] = React.useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = React.useState(false);

  // Pagination
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);

  // Saved filters
  const [savedFilters, setSavedFilters] = React.useState<SavedFilter[]>([
    { id: 'sf1', name: 'Critical Only', filters: { severity: ['Critical'], group: [], component: [], source: [], searchValue: '' } },
    { id: 'sf2', name: 'Production Issues', filters: { severity: ['Critical', 'Warning'], group: ['Cluster'], component: [], source: [], searchValue: '' } },
    { id: 'sf3', name: 'Network Issues', filters: { severity: ['Critical', 'Warning'], group: [], component: ['Network'], source: [], searchValue: '' } },
  ]);
  const [isSavedFiltersDropdownOpen, setIsSavedFiltersDropdownOpen] = React.useState(false);
  const [selectedSavedFilter, setSelectedSavedFilter] = React.useState<SavedFilter | null>(null);
  const [isManageSavedFiltersModalOpen, setIsManageSavedFiltersModalOpen] = React.useState(false);
  const [editingFilterId, setEditingFilterId] = React.useState<string | null>(null);
  const [editingFilterName, setEditingFilterName] = React.useState('');
  const [isSaveFilterModalOpen, setIsSaveFilterModalOpen] = React.useState(false);
  const [newFilterName, setNewFilterName] = React.useState('');

  // Drill-down states
  const [drillDownSeverityFilter, setDrillDownSeverityFilter] = React.useState<AlertSeverity[]>([]);
  const [drillDownGroupFilter, setDrillDownGroupFilter] = React.useState<AlertGroup[]>([]);
  const [drillDownComponentFilter, setDrillDownComponentFilter] = React.useState<AlertComponent[]>([]);
  const [drillDownSourceFilter, setDrillDownSourceFilter] = React.useState<string[]>([]);
  const [drillDownSearchValue, setDrillDownSearchValue] = React.useState('');
  const [drillDownTriggeredFrom, setDrillDownTriggeredFrom] = React.useState('');
  const [drillDownTriggeredTo, setDrillDownTriggeredTo] = React.useState('');
  const [drillDownStateFilter, setDrillDownStateFilter] = React.useState<string[]>([]);
  const [drillDownFilterOpen, setDrillDownFilterOpen] = React.useState(false);
  const [isDrillDownComponentOpen, setIsDrillDownComponentOpen] = React.useState(false);
  const [isAggregated, setIsAggregated] = React.useState(true);
  const [isSummaryAccordionExpanded, setIsSummaryAccordionExpanded] = React.useState(true);
  
  // Drill-down saved filters
  const [drillDownSavedFilters, setDrillDownSavedFilters] = React.useState<SavedFilter[]>([
    { id: 'ddsf-1', name: 'Critical alerts only', filters: { severity: ['Critical'], group: [], component: [], source: [], searchValue: '' } },
    { id: 'ddsf-2', name: 'Platform alerts', filters: { severity: [], group: [], component: [], source: ['Platform'], searchValue: '' } },
  ]);
  const [selectedDrillDownSavedFilter, setSelectedDrillDownSavedFilter] = React.useState<SavedFilter | null>(null);
  const [isDrillDownSavedFiltersDropdownOpen, setIsDrillDownSavedFiltersDropdownOpen] = React.useState(false);
  const [isDrillDownSaveFilterModalOpen, setIsDrillDownSaveFilterModalOpen] = React.useState(false);
  const [drillDownNewFilterName, setDrillDownNewFilterName] = React.useState('');
  const [isDrillDownManageSavedFiltersModalOpen, setIsDrillDownManageSavedFiltersModalOpen] = React.useState(false);
  const [drillDownEditingFilterId, setDrillDownEditingFilterId] = React.useState<string | null>(null);
  const [drillDownEditingFilterName, setDrillDownEditingFilterName] = React.useState('');
  const [expandedAlertRows, setExpandedAlertRows] = React.useState<string[]>([]);
  const [selectedAlerts, setSelectedAlerts] = React.useState<string[]>([]);
  const [drillDownPage, setDrillDownPage] = React.useState(1);
  const [drillDownPerPage, setDrillDownPerPage] = React.useState(20);

  // Column management
  const defaultColumns: ColumnConfig[] = [
    { key: 'alertName', label: 'Alert Name', isVisible: true, isDisabled: true, order: 0 },
    { key: 'severity', label: 'Severity', isVisible: true, isDisabled: true, order: 1 },
    { key: 'total', label: 'Total', isVisible: true, isDisabled: false, order: 2 },
    { key: 'state', label: 'State', isVisible: true, isDisabled: false, order: 3 },
    { key: 'group', label: 'Group', isVisible: true, isDisabled: false, order: 4 },
    { key: 'component', label: 'Affected component', isVisible: true, isDisabled: false, order: 5 },
    { key: 'source', label: 'Source', isVisible: true, isDisabled: false, order: 6 },
    { key: 'description', label: 'Description', isVisible: false, isDisabled: false, order: 7 },
    { key: 'namespace', label: 'Namespace', isVisible: false, isDisabled: false, order: 8 },
    { key: 'resource', label: 'Resource', isVisible: false, isDisabled: false, order: 9 },
  ];
  const [columns, setColumns] = React.useState<ColumnConfig[]>(defaultColumns);
  const [tempColumns, setTempColumns] = React.useState<ColumnConfig[]>(defaultColumns);
  const [isManageColumnsModalOpen, setIsManageColumnsModalOpen] = React.useState(false);
  const MAX_VISIBLE_COLUMNS = 8;

  // Drawer state
  const [isDrawerExpanded, setIsDrawerExpanded] = React.useState(false);
  const [selectedAlertDetail, setSelectedAlertDetail] = React.useState<AlertData | null>(null);
  const [alertDetailDrawerTab, setAlertDetailDrawerTab] = React.useState<number>(0);
  
  // Alert Rule Drawer state
  const [isAlertRuleDrawerOpen, setIsAlertRuleDrawerOpen] = React.useState(false);
  const [selectedAlertRule, setSelectedAlertRule] = React.useState<AlertRule | null>(null);
  const [alertRuleDrawerTab, setAlertRuleDrawerTab] = React.useState<string | number>('details');
  const [alertRuleExpandedClusters, setAlertRuleExpandedClusters] = React.useState<string[]>([]);
  const [alertRuleExpandedAlerts, setAlertRuleExpandedAlerts] = React.useState<string[]>([]);
  const [alertRuleTimelineRange, setAlertRuleTimelineRange] = React.useState('30 minutes');
  const [isAlertRuleTimelineRangeOpen, setIsAlertRuleTimelineRangeOpen] = React.useState(false);
  const [alertRuleTargetClusterFilter, setAlertRuleTargetClusterFilter] = React.useState<string>('all');
  const [isAlertRuleTargetClusterFilterOpen, setIsAlertRuleTargetClusterFilterOpen] = React.useState(false);
  
  // Alert Rules Filter Panel state
  const [isAlertRulesFilterPanelOpen, setIsAlertRulesFilterPanelOpen] = React.useState(false);
  const [alertRulesClusterFilter, setAlertRulesClusterFilter] = React.useState<string[]>([]);
  const [alertRulesNamespaceFilter, setAlertRulesNamespaceFilter] = React.useState<string[]>([]);
  const [alertRulesGroupFilter, setAlertRulesGroupFilter] = React.useState<AlertGroup[]>([]);
  const [alertRulesComponentFilter, setAlertRulesComponentFilter] = React.useState<AlertComponent[]>([]);
  const [alertRulesSeverityFilter, setAlertRulesSeverityFilter] = React.useState<AlertSeverity[]>([]);
  const [alertRulesStateFilter, setAlertRulesStateFilter] = React.useState<AlertRuleState[]>([]);
  const [alertRulesSourceFilter, setAlertRulesSourceFilter] = React.useState<AlertRuleSource[]>([]);
  const [alertRulesSearchValue, setAlertRulesSearchValue] = React.useState('');
  const [isAlertRulesComponentDropdownOpen, setIsAlertRulesComponentDropdownOpen] = React.useState(false);
  
  // Alert Rules Selection and Actions state
  const [selectedAlertRuleIds, setSelectedAlertRuleIds] = React.useState<string[]>([]);
  const [alertRuleActionMenuOpen, setAlertRuleActionMenuOpen] = React.useState<string | null>(null);
  const [isBulkActionsMenuOpen, setIsBulkActionsMenuOpen] = React.useState(false);
  
  // Disable Alert Rule Modal state
  const [isDisableAlertRuleModalOpen, setIsDisableAlertRuleModalOpen] = React.useState(false);
  const [alertRulesToDisable, setAlertRulesToDisable] = React.useState<AlertRule[]>([]);
  const [disableAlertRuleExpandedIds, setDisableAlertRuleExpandedIds] = React.useState<string[]>([]);

  // Toast notifications
  const [toasts, setToasts] = React.useState<ToastNotification[]>([]);

  // All alerts card state
  const [mainAlertNameFilter, setMainAlertNameFilter] = React.useState<string | null>(null);
  const [mainComponentFilter, setMainComponentFilter] = React.useState<string | null>(null);
  
  // Alert-specific filters for firing alerts view
  const [alertStateFilter, setAlertStateFilter] = React.useState<string[]>([]);
  const [alertSourceFilter, setAlertSourceFilter] = React.useState<string[]>([]);

  // Last refresh
  const [lastRefresh, setLastRefresh] = React.useState(new Date());

  // Sync clusterFilter clearing with in-card view states
  // Only reset views when clusterFilter is completely cleared
  React.useEffect(() => {
    if (clusterFilter.length === 0) {
      // If cluster filter is cleared, reset card views to all-clusters
      if (selectedClusterInCard) {
        setSelectedClusterInCard(null);
        setClusterCardView('all-clusters');
      }
      if (selectedClusterForAlerts) {
        setSelectedClusterForAlerts(null);
        setFiringAlertsCardView('all-clusters');
      }
    }
    // Note: When user selects clusters from filter panel dropdown, 
    // we don't automatically switch to single-cluster view - 
    // that only happens when clicking directly on treemap/table
  }, [clusterFilter]);
  
  // Sync URL params with state when user navigates with browser back/forward buttons
  React.useEffect(() => {
    const urlTab = searchParams.get('tab');
    const urlCluster = searchParams.get('cluster');
    const urlComponent = searchParams.get('component');
    
    // Sync tab state with URL
    if (urlTab === 'firing-alerts' && alertsSubTab !== 'firing-alerts') {
      setAlertsSubTabState('firing-alerts');
    } else if (urlTab !== 'firing-alerts' && alertsSubTab === 'firing-alerts') {
      setAlertsSubTabState('clusters-health');
      // When going back to clusters-health, also reset the filter state
      setClusterFilter([]);
      setMainComponentFilter(null);
      setSelectedClusterForAlerts(null);
      setFiringAlertsCardView('all-clusters');
    }
    
    // Sync cluster filter with URL
    if (urlCluster && urlTab === 'firing-alerts') {
      const cluster = mockClusters.find(c => c.name === urlCluster);
      if (cluster && clusterFilter[0] !== urlCluster) {
        setClusterFilter([urlCluster]);
        setSelectedClusterForAlerts(cluster);
        setFiringAlertsCardView('single-cluster');
      }
    }
    
    // Sync component filter with URL
    if (urlComponent && mainComponentFilter !== urlComponent) {
      setMainComponentFilter(urlComponent);
    } else if (!urlComponent && mainComponentFilter) {
      setMainComponentFilter(null);
    }
  }, [searchParams]);

  // Get unique filter options
  const regions = getUniqueValues(mockClusters, 'region');
  const clusterNames = getUniqueValues(mockClusters, 'name');
  const namespaces = getAllNamespaces(mockClusters);
  const allAlerts = getAllAlerts(mockClusters);
  
  // Get unique labels from all clusters and alerts
  const availableLabels = React.useMemo(() => {
    const labelsSet = new Set<string>();
    mockClusters.forEach(cluster => {
      // Add cluster labels
      Object.entries(cluster.labels).forEach(([key, value]) => {
        labelsSet.add(`${key}=${value}`);
      });
      // Add alert labels
      cluster.alerts.forEach(alert => {
        Object.entries(alert.labels).forEach(([key, value]) => {
          labelsSet.add(`${key}=${value}`);
        });
      });
    });
    return Array.from(labelsSet).sort();
  }, []);

  // Calculate counts for filter options (shows number of clusters per option)
  const regionCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    mockClusters.forEach(cluster => {
      counts[cluster.region] = (counts[cluster.region] || 0) + 1;
    });
    return counts;
  }, []);

  const clusterCounts = React.useMemo(() => {
    // For clusters, show the number of firing alerts
    const counts: Record<string, number> = {};
    mockClusters.forEach(cluster => {
      counts[cluster.name] = cluster.alerts.filter(a => a.status === 'firing').length;
    });
    return counts;
  }, []);

  const namespaceCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    mockClusters.forEach(cluster => {
      cluster.namespaces.forEach(ns => {
        counts[ns] = (counts[ns] || 0) + 1;
      });
    });
    return counts;
  }, []);

  // Filter clusters
  const filteredClusters = React.useMemo(() => {
    return mockClusters.filter(cluster => {
      if (regionFilter.length > 0 && !regionFilter.includes(cluster.region)) return false;
      if (clusterFilter.length > 0 && !clusterFilter.includes(cluster.name)) return false;
      if (namespaceFilter.length > 0 && !cluster.namespaces.some(ns => namespaceFilter.includes(ns))) return false;
      if (searchValue && !cluster.name.toLowerCase().includes(searchValue.toLowerCase())) return false;
      if (severityFilter.length > 0) {
        const hasMatchingAlert = cluster.alerts.some(a => a.status === 'firing' && severityFilter.includes(a.severity));
        if (!hasMatchingAlert && cluster.alerts.filter(a => a.status === 'firing').length > 0) return false;
      }
      // Component filter: if components are selected, only show clusters with alerts for those components
      if (componentFilter.length > 0) {
        const hasMatchingComponentAlert = cluster.alerts.some(a => 
          a.status === 'firing' && componentFilter.includes(a.component)
        );
        if (!hasMatchingComponentAlert) return false;
      }
      return true;
    });
  }, [regionFilter, clusterFilter, namespaceFilter, searchValue, severityFilter, componentFilter]);

  // Sort clusters - supports both legacy sortBy and table column sorting
  const sortedClusters = React.useMemo(() => {
    const sorted = [...filteredClusters];
    
    // If table column sorting is active, use that
    if (activeSortIndex !== null) {
      sorted.sort((a, b) => {
        let comparison = 0;
        const aFiring = a.alerts.filter(al => al.status === 'firing');
        const bFiring = b.alerts.filter(al => al.status === 'firing');
        const statusOrder = { critical: 0, warning: 1, info: 2, healthy: 3 };
        
        switch (activeSortIndex) {
          case 0: // Cluster Status
            comparison = statusOrder[getClusterAlertStatus(a)] - statusOrder[getClusterAlertStatus(b)];
            break;
          case 1: // Cluster Name
            comparison = a.name.localeCompare(b.name);
            break;
          case 2: // Region
            comparison = a.region.localeCompare(b.region);
            break;
          case 3: // Total Alerts
            comparison = aFiring.length - bFiring.length;
            break;
          case 4: // Severity Breakdown (sort by critical count first)
            const aCritical = aFiring.filter(al => al.severity === 'Critical').length;
            const bCritical = bFiring.filter(al => al.severity === 'Critical').length;
            if (aCritical !== bCritical) {
              comparison = aCritical - bCritical;
            } else {
              const aWarning = aFiring.filter(al => al.severity === 'Warning').length;
              const bWarning = bFiring.filter(al => al.severity === 'Warning').length;
              comparison = aWarning - bWarning;
            }
            break;
        }
        
        return activeSortDirection === 'asc' ? comparison : -comparison;
      });
    } else {
      // Legacy sortBy behavior
      switch (sortBy) {
        case 'severity':
          sorted.sort((a, b) => {
            const statusOrder = { critical: 0, warning: 1, info: 2, healthy: 3 };
            const statusDiff = statusOrder[getClusterAlertStatus(a)] - statusOrder[getClusterAlertStatus(b)];
            if (statusDiff !== 0) return statusDiff;
            const aFiring = a.alerts.filter(al => al.status === 'firing').length;
            const bFiring = b.alerts.filter(al => al.status === 'firing').length;
            if (aFiring !== bFiring) return bFiring - aFiring;
            return a.name.localeCompare(b.name);
          });
          break;
        case 'alertCount':
          sorted.sort((a, b) => b.alerts.filter(al => al.status === 'firing').length - a.alerts.filter(al => al.status === 'firing').length);
          break;
        case 'clusterName':
          sorted.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }
    }
    return sorted;
  }, [filteredClusters, sortBy, activeSortIndex, activeSortDirection]);

  // Metrics
  const totalAlerts = filteredClusters.reduce((sum, c) => sum + c.alerts.filter(a => a.status === 'firing').length, 0);
  const criticalAlerts = filteredClusters.reduce((sum, c) => sum + c.alerts.filter(a => a.severity === 'Critical' && a.status === 'firing').length, 0);
  const warningAlerts = filteredClusters.reduce((sum, c) => sum + c.alerts.filter(a => a.severity === 'Warning' && a.status === 'firing').length, 0);
  const infoAlerts = filteredClusters.reduce((sum, c) => sum + c.alerts.filter(a => a.severity === 'Info' && a.status === 'firing').length, 0);
  const healthyClusters = filteredClusters.filter(c => c.alerts.filter(a => a.status === 'firing').length === 0).length;

  // Drill-down filtered alerts
  const drillDownFilteredAlerts = React.useMemo(() => {
    if (!selectedCluster) return [];
    return selectedCluster.alerts.filter(alert => {
      if (drillDownSeverityFilter.length > 0 && !drillDownSeverityFilter.includes(alert.severity)) return false;
      if (drillDownGroupFilter.length > 0 && !drillDownGroupFilter.includes(alert.group)) return false;
      if (drillDownComponentFilter.length > 0 && !drillDownComponentFilter.includes(alert.component)) return false;
      if (drillDownSourceFilter.length > 0 && !drillDownSourceFilter.includes(alert.source)) return false;
      if (drillDownStateFilter.length > 0 && !drillDownStateFilter.includes(alert.status)) return false;
      if (drillDownSearchValue && !alert.alertName.toLowerCase().includes(drillDownSearchValue.toLowerCase())) return false;
      // Triggered date/time filter
      if (drillDownTriggeredFrom || drillDownTriggeredTo) {
        const alertTime = new Date(alert.lastFired).getTime();
        if (drillDownTriggeredFrom) {
          const fromTime = new Date(drillDownTriggeredFrom).getTime();
          if (alertTime < fromTime) return false;
        }
        if (drillDownTriggeredTo) {
          const toTime = new Date(drillDownTriggeredTo).getTime();
          if (alertTime > toTime) return false;
        }
      }
      return true;
    });
  }, [selectedCluster, drillDownSeverityFilter, drillDownGroupFilter, drillDownComponentFilter, drillDownSourceFilter, drillDownStateFilter, drillDownSearchValue, drillDownTriggeredFrom, drillDownTriggeredTo]);

  // Aggregated alerts for drill-down
  const aggregatedAlerts = React.useMemo(() => {
    const grouped: Record<string, { alerts: AlertData[]; severity: AlertSeverity; count: number }> = {};
    drillDownFilteredAlerts.forEach(alert => {
      const key = `${alert.alertName}-${alert.severity}`;
      if (!grouped[key]) {
        grouped[key] = { alerts: [], severity: alert.severity, count: 0 };
      }
      grouped[key].alerts.push(alert);
      grouped[key].count++;
    });
    return Object.entries(grouped).map(([key, data]) => ({
      key,
      alertName: data.alerts[0].alertName,
      severity: data.severity,
      count: data.count,
      alerts: data.alerts,
    }));
  }, [drillDownFilteredAlerts]);

  // Handlers
  // V2: Click on cluster in treemap/table - navigate directly to firing alerts filtered by cluster
  const handleClusterClick = (cluster: ClusterData) => {
    // Set the cluster for alerts view
    setSelectedClusterForAlerts(cluster);
    setFiringAlertsCardView('single-cluster');
    // Sync with filter panel - replace cluster filter with this cluster only
    setClusterFilter([cluster.name]);
    // Update URL with tab and cluster params (enables browser back button)
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', 'firing-alerts');
    newParams.set('cluster', cluster.name);
    navigate(`?${newParams.toString()}`, { replace: false });
    setAlertsSubTabState('firing-alerts');
    // Trigger animation to highlight the filtered view
    setShowFilterAnimation(true);
    setTimeout(() => setShowFilterAnimation(false), 1500);
  };

  // V2: Click on component - filter firing alerts by cluster + component
  const handleComponentClickInCard = (cluster: ClusterData, component: AlertComponent) => {
    setSelectedClusterForAlerts(cluster);
    setFiringAlertsCardView('single-cluster');
    setMainComponentFilter(component);
    // Update URL with tab, cluster and component params (enables browser back button)
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', 'firing-alerts');
    newParams.set('cluster', cluster.name);
    newParams.set('component', component);
    navigate(`?${newParams.toString()}`, { replace: false });
    setAlertsSubTabState('firing-alerts');
    // Sync with filter panel - replace cluster filter
    setClusterFilter([cluster.name]);
    // Trigger animation to highlight the filtered view
    setShowFilterAnimation(true);
    setTimeout(() => setShowFilterAnimation(false), 1500);
  };

  // V2: Back to all clusters view in card
  const handleBackToAllClusters = () => {
    setSelectedClusterInCard(null);
    setClusterCardView('all-clusters');
    // Clear cluster filter when going back to all clusters
    setClusterFilter([]);
    // Also clear component filter
    setMainComponentFilter(null);
  };

  // V2: Click on cluster in firing alerts - show single cluster alerts in-card
  const handleClusterClickInAlerts = (cluster: ClusterData) => {
    setSelectedClusterForAlerts(cluster);
    setFiringAlertsCardView('single-cluster');
    // Sync with filter panel - replace cluster filter
    setClusterFilter([cluster.name]);
  };

  // V2: Back to all clusters alerts view
  const handleBackToAllClustersAlerts = () => {
    setSelectedClusterForAlerts(null);
    setFiringAlertsCardView('all-clusters');
    // Clear cluster filter when going back to all clusters
    setClusterFilter([]);
    // Also clear component filter
    setMainComponentFilter(null);
    setMainComponentFilter(null);
  };

  // Legacy handlers (keeping for backward compat)
  const handleDrillDown = (cluster: ClusterData) => {
    // Now use in-card view instead of drill-down
    handleClusterClick(cluster);
  };

  // V2: Navigate from Components view to filtered Alerts view
  const handleComponentClick = (component: AlertComponent) => {
    if (selectedClusterInCard) {
      handleComponentClickInCard(selectedClusterInCard, component);
    }
  };

  // V2: Navigate back to Cluster Components view
  const handleBackToClusterComponents = () => {
    setNavigationView('cluster-components');
    setSelectedComponent(null);
    setDrillDownComponentFilter([]);
    setIsDrawerExpanded(false);
    setSelectedAlertDetail(null);
  };

  // V2: Navigate back to Fleet Overview (Treemap)
  const handleBackToFleet = () => {
    setNavigationView('fleet-overview');
    setSelectedCluster(null);
    setSelectedComponent(null);
    setIsDrawerExpanded(false);
    setSelectedAlertDetail(null);
    clearDrillDownFilters();
  };

  // Legacy: Back to list (for backward compatibility)
  const handleBackToList = () => {
    // If we have a selected cluster, go back to components view
    // Otherwise go back to fleet overview
    if (selectedCluster && navigationView === 'component-alerts') {
      handleBackToClusterComponents();
    } else {
      handleBackToFleet();
    }
    setSelectedCluster(null);
    setIsDrawerExpanded(false);
    setSelectedAlertDetail(null);
  };

  const clearDrillDownFilters = () => {
    setDrillDownSeverityFilter([]);
    setDrillDownGroupFilter([]);
    setDrillDownComponentFilter([]);
    setDrillDownSourceFilter([]);
    setDrillDownStateFilter([]);
    setDrillDownSearchValue('');
    setDrillDownTriggeredFrom('');
    setDrillDownTriggeredTo('');
  };

  const clearFilters = () => {
    setRegionFilter([]);
    setClusterFilter([]);
    setNamespaceFilter([]);
    setLabelFilter([]);
    setSeverityFilter([]);
    setGroupFilter(['Cluster', 'Namespace']); // Reset to default with both groups selected
    setComponentFilter([]);
    setSearchValue('');
    setTriggeredFromDate('');
    setTriggeredFromTime('');
    setTriggeredToDate('');
    setTriggeredToTime('');
    // Also clear in-card view states
    setSelectedClusterInCard(null);
    setClusterCardView('all-clusters');
    setSelectedClusterForAlerts(null);
    setFiringAlertsCardView('all-clusters');
    setMainComponentFilter(null);
    setMainAlertNameFilter(null);
    // Clear treemap legend filters
    setTreemapLegendFilters([]);
  };

  const handleRefresh = () => {
    setLastRefresh(new Date());
  };

  const addToast = (title: string, variant: 'success' | 'danger' | 'warning' | 'info', description?: string) => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, title, variant, description }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  const openManageColumnsModal = () => {
    setTempColumns([...columns]);
    setIsManageColumnsModalOpen(true);
  };

  const handleTempColumnToggle = (key: string) => {
    setTempColumns(prev => prev.map(c => c.key === key ? { ...c, isVisible: !c.isVisible } : c));
  };

  const handleSaveColumns = () => {
    setColumns(tempColumns);
    setIsManageColumnsModalOpen(false);
  };

  const handleSelectAllColumns = () => {
    const visibleCount = tempColumns.filter(c => c.isVisible).length;
    if (visibleCount >= MAX_VISIBLE_COLUMNS) {
      addToast('Column limit reached', 'warning', `Maximum of ${MAX_VISIBLE_COLUMNS} columns allowed.`);
      return;
    }
    setTempColumns(prev => prev.map(c => ({ ...c, isVisible: true })));
  };

  const handleDeselectAllColumns = () => {
    setTempColumns(prev => prev.map(c => c.isDisabled ? c : { ...c, isVisible: false }));
  };

  const handleRestoreDefaultColumns = () => {
    setTempColumns([...defaultColumns]);
  };

  // Check if any filters are active beyond the default "Global View" state
  // Global View = groupFilter has both Cluster and Namespace (default), and no other filters
  const isGlobalView = groupFilter.length === 2 && groupFilter.includes('Cluster') && groupFilter.includes('Namespace');
  const hasGroupFilterChanges = !isGlobalView;
  
  const hasActiveFilters = regionFilter.length > 0 || clusterFilter.length > 0 || namespaceFilter.length > 0 || 
    labelFilter.length > 0 || severityFilter.length > 0 || hasGroupFilterChanges || componentFilter.length > 0 || searchValue.length > 0 ||
    selectedClusterInCard !== null || selectedClusterForAlerts !== null || mainComponentFilter !== null || mainAlertNameFilter !== null ||
    triggeredFromDate.length > 0 || triggeredFromTime.length > 0 || triggeredToDate.length > 0 || triggeredToTime.length > 0;

  const hasDrillDownActiveFilters = drillDownSeverityFilter.length > 0 || drillDownGroupFilter.length > 0 || 
    drillDownComponentFilter.length > 0 || drillDownSourceFilter.length > 0 || drillDownStateFilter.length > 0 ||
    drillDownSearchValue.length > 0 || drillDownTriggeredFrom.length > 0 || drillDownTriggeredTo.length > 0;

  // Size by options based on role
  const sizeByOptions = userRole === 'admin' 
    ? [
        { value: 'none', label: 'None (Equal size)' },
        { value: 'nodeCount', label: 'Number of Nodes' },
        { value: 'cpuCores', label: 'Total CPU Cores' },
        { value: 'totalMemory', label: 'Total Memory' },
        { value: 'podCount', label: 'Total Pods' },
        { value: 'vmCount', label: 'Total VMs' },
        { value: 'totalAlerts', label: 'Total Alerts' },
      ]
    : [
        { value: 'none', label: 'None (Equal size)' },
        { value: 'podCount', label: 'Total Pods' },
        { value: 'cpuRequests', label: 'Total CPU Requests' },
        { value: 'memoryRequests', label: 'Total Memory Requests' },
        { value: 'totalAlerts', label: 'Total Alerts' },
      ];

  // ========================================
  // DRILL-DOWN VIEW - Now integrated into Alerts tab
  // The drill-down content is rendered within the mainPageTab === 'alerts' section
  // ========================================
  
  // Render drill-down drawer and table content
  const renderDrillDownContent = () => {
    if (!selectedCluster) return null;
    return (
      <>
        {/* Main Content */}
          <Drawer isExpanded={isDrawerExpanded} position="end" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <DrawerContent
              panelContent={
                selectedAlertDetail && (
                  <DrawerPanelContent 
                    widths={{ default: 'width_50' }} 
                    style={{ 
                      minWidth: '500px',
                      backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
                      boxShadow: '-4px 0 16px rgba(0, 0, 0, 0.16)',
                      height: '100%',
                    }}
                  >
                    <DrawerHead style={{ borderBottom: '1px solid var(--pf-t--global--border--color--default)' }}>
                      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                        <FlexItem>
                          <Title headingLevel="h2" size="lg">{selectedAlertDetail.alertName}</Title>
                        </FlexItem>
                        <FlexItem>
                          <DrawerActions>
                            <DrawerCloseButton onClick={() => { 
                              setIsDrawerExpanded(false); 
                              setSelectedAlertDetail(null);
                              setAlertDetailDrawerTab(0); // Reset to Details tab
                            }} />
                          </DrawerActions>
                        </FlexItem>
                      </Flex>
                    </DrawerHead>
                    <DrawerPanelBody style={{ flex: 1, overflow: 'auto' }}>
                      <Tabs defaultActiveKey={0}>
                        <Tab eventKey={0} title={<TabTitleText>Details</TabTitleText>}>
                          <Stack hasGutter style={{ padding: '16px 0' }}>
                            <StackItem>
                              <DescriptionList isHorizontal isCompact>
                                <DescriptionListGroup>
                                  <DescriptionListTerm>Name</DescriptionListTerm>
                                  <DescriptionListDescription><strong>{selectedAlertDetail.alertName}</strong></DescriptionListDescription>
                                </DescriptionListGroup>
                                <DescriptionListGroup>
                                  <DescriptionListTerm>Description</DescriptionListTerm>
                                  <DescriptionListDescription>{selectedAlertDetail.description || selectedAlertDetail.summary}</DescriptionListDescription>
                                </DescriptionListGroup>
                                <DescriptionListGroup>
                                  <DescriptionListTerm>Source</DescriptionListTerm>
                                  <DescriptionListDescription>{selectedAlertDetail.source}</DescriptionListDescription>
                                </DescriptionListGroup>
                                <DescriptionListGroup>
                                  <DescriptionListTerm>Group</DescriptionListTerm>
                                  <DescriptionListDescription>
                                    <Label isCompact color="blue">{selectedAlertDetail.group}</Label>
                                  </DescriptionListDescription>
                                </DescriptionListGroup>
                                <DescriptionListGroup>
                                  <DescriptionListTerm>Affected component</DescriptionListTerm>
                                  <DescriptionListDescription>
                                    <Label isCompact variant="outline">{selectedAlertDetail.component}</Label>
                                  </DescriptionListDescription>
                                </DescriptionListGroup>
                                <DescriptionListGroup>
                                  <DescriptionListTerm>Labels</DescriptionListTerm>
                                  <DescriptionListDescription>
                                    <LabelGroup>
                                      {Object.entries(selectedAlertDetail.labels).map(([k, v]) => (
                                        <Label key={k} isCompact variant="outline">{k}={v}</Label>
                                      ))}
                                    </LabelGroup>
                                  </DescriptionListDescription>
                                </DescriptionListGroup>
                                <DescriptionListGroup>
                                  <DescriptionListTerm>Severity</DescriptionListTerm>
                                  <DescriptionListDescription>
                                    <Label color={getSeverityLabelColor(selectedAlertDetail.severity)} icon={getSeverityIcon(selectedAlertDetail.severity)}>{selectedAlertDetail.severity}</Label>
                                  </DescriptionListDescription>
                                </DescriptionListGroup>
                                <DescriptionListGroup>
                                  <DescriptionListTerm>State</DescriptionListTerm>
                                  <DescriptionListDescription>
                                    <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                                      <FlexItem>
                                        <Label color={getStatusLabelColor(selectedAlertDetail.status)} variant="outline">{selectedAlertDetail.status}</Label>
                                      </FlexItem>
                                      {selectedAlertDetail.status === 'firing' && (
                                        <FlexItem>
                                          <Content component="small" className="pf-v6-u-color-200">
                                            Firing since {selectedAlertDetail.lastFired}
                                          </Content>
                                        </FlexItem>
                                      )}
                                    </Flex>
                                  </DescriptionListDescription>
                                </DescriptionListGroup>
                                <DescriptionListGroup>
                                  <DescriptionListTerm>Namespace</DescriptionListTerm>
                                  <DescriptionListDescription>{selectedAlertDetail.namespace}</DescriptionListDescription>
                                </DescriptionListGroup>
                                {selectedAlertDetail.resource && (
                                  <DescriptionListGroup>
                                    <DescriptionListTerm>Resource</DescriptionListTerm>
                                    <DescriptionListDescription>
                                      <Button variant="link" isInline icon={<ExternalLinkAltIcon />} iconPosition="end">
                                        {selectedAlertDetail.resource}
                                      </Button>
                                    </DescriptionListDescription>
                                  </DescriptionListGroup>
                                )}
                                <DescriptionListGroup>
                                  <DescriptionListTerm>Alert Rule</DescriptionListTerm>
                                  <DescriptionListDescription>
                                    <Button variant="link" isInline icon={<ExternalLinkAltIcon />} iconPosition="end">
                                      View alert rule
                                    </Button>
                                  </DescriptionListDescription>
                                </DescriptionListGroup>
                                <DescriptionListGroup>
                                  <DescriptionListTerm>Runbook URL</DescriptionListTerm>
                                  <DescriptionListDescription>
                                    <Button variant="link" isInline icon={<ExternalLinkAltIcon />} iconPosition="end">
                                      View runbook
                                    </Button>
                                  </DescriptionListDescription>
                                </DescriptionListGroup>
                              </DescriptionList>
                            </StackItem>
                            <Divider />
                            <StackItem>
                              <Content component="small" className="pf-v6-u-mb-sm"><strong>Actions</strong></Content>
                              <Flex gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }}>
                                <FlexItem>
                                  <Button variant="secondary" icon={<ListIcon />} onClick={() => addToast('Opening logs...', 'info')}>
                                    View logs
                                  </Button>
                                </FlexItem>
                                <FlexItem>
                                  <Button variant="secondary" icon={<WrenchIcon />} onClick={() => addToast('Opening troubleshoot...', 'info')}>
                                    Troubleshoot
                                  </Button>
                                </FlexItem>
                                <FlexItem>
                                  <Button variant="secondary" icon={<ChartLineIcon />} onClick={() => addToast('Opening metrics...', 'info')}>
                                    See metrics
                                  </Button>
                                </FlexItem>
                                <FlexItem>
                                  <Button variant="secondary" icon={<PortIcon />} onClick={() => addToast('Opening related incidents...', 'info')}>
                                    See related incidents
                                  </Button>
                                </FlexItem>
                              </Flex>
                            </StackItem>
                          </Stack>
                        </Tab>
                        <Tab eventKey={1} title={<TabTitleText>Alert Timeline</TabTitleText>}>
                          <Stack hasGutter style={{ padding: '16px 0' }}>
                            <StackItem>
                              <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                                <FlexItem>
                                  <ToggleGroup>
                                    <ToggleGroupItem text="30s" aria-label="30 seconds" />
                                    <ToggleGroupItem text="60s" aria-label="60 seconds" isSelected />
                                    <ToggleGroupItem text="90s" aria-label="90 seconds" />
                                    <ToggleGroupItem text="Day" aria-label="Day" />
                                    <ToggleGroupItem text="Week" aria-label="Week" />
                                  </ToggleGroup>
                                </FlexItem>
                                <FlexItem>
                                  <Flex gap={{ default: 'gapSm' }}>
                                    <FlexItem>
                                      <Tooltip content="Zoom in">
                                        <Button variant="plain" icon={<SearchPlusIcon />} aria-label="Zoom in" />
                                      </Tooltip>
                                    </FlexItem>
                                    <FlexItem>
                                      <Tooltip content="Zoom out">
                                        <Button variant="plain" icon={<SearchMinusIcon />} aria-label="Zoom out" />
                                      </Tooltip>
                                    </FlexItem>
                                    <FlexItem>
                                      <Tooltip content="Reset zoom">
                                        <Button variant="plain" icon={<UndoIcon />} aria-label="Reset zoom" />
                                      </Tooltip>
                                    </FlexItem>
                                  </Flex>
                                </FlexItem>
                              </Flex>
                            </StackItem>
                            <StackItem>
                              <div style={{ height: '250px', width: '100%' }}>
                                <Chart
                                  ariaDesc="Alert timeline showing firing periods"
                                  ariaTitle="Alert Timeline"
                                  height={250}
                                  padding={{ bottom: 50, left: 50, right: 20, top: 20 }}
                                  containerComponent={
                                    <ChartVoronoiContainer
                                      labels={({ datum }) => `${datum.name}: ${datum.y}`}
                                      constrainToVisibleArea
                                    />
                                  }
                                >
                                  <ChartAxis 
                                    tickValues={[0, 10, 20, 30, 40, 50, 60]}
                                    tickFormat={(t) => `${t}s ago`}
                                  />
                                  <ChartAxis 
                                    dependentAxis 
                                    tickFormat={(t) => t === 1 ? 'Firing' : t === 0 ? 'Resolved' : ''}
                                    tickValues={[0, 1]}
                                  />
                                  <ChartGroup>
                                    <ChartArea
                                      data={[
                                        { x: 0, y: 1, name: 'Status' },
                                        { x: 5, y: 1, name: 'Status' },
                                        { x: 10, y: 1, name: 'Status' },
                                        { x: 15, y: 0, name: 'Status' },
                                        { x: 20, y: 0, name: 'Status' },
                                        { x: 25, y: 1, name: 'Status' },
                                        { x: 30, y: 1, name: 'Status' },
                                        { x: 35, y: 1, name: 'Status' },
                                        { x: 40, y: 1, name: 'Status' },
                                        { x: 45, y: 1, name: 'Status' },
                                        { x: 50, y: 1, name: 'Status' },
                                        { x: 55, y: 1, name: 'Status' },
                                        { x: 60, y: 1, name: 'Status' },
                                      ]}
                                      interpolation="stepAfter"
                                      style={{
                                        data: { 
                                          fill: 'var(--pf-t--chart--color--red--100)',
                                          fillOpacity: 0.3,
                                          stroke: 'var(--pf-t--chart--color--red--100)',
                                          strokeWidth: 2,
                                        }
                                      }}
                                    />
                                    <ChartScatter
                                      data={[
                                        { x: 0, y: 1, name: 'Alert fired' },
                                        { x: 15, y: 0, name: 'Alert resolved' },
                                        { x: 25, y: 1, name: 'Alert fired' },
                                      ]}
                                      style={{
                                        data: { fill: 'var(--pf-t--chart--color--red--100)' }
                                      }}
                                    />
                                  </ChartGroup>
                                </Chart>
                              </div>
                            </StackItem>
                            <StackItem>
                              <Content component="small" className="pf-v6-u-color-200">
                                Timeline shows alert firing and resolution events. Use the time range selector to adjust the view window.
                              </Content>
                            </StackItem>
                          </Stack>
                        </Tab>
                        <Tab eventKey={2} title={<TabTitleText>YAML</TabTitleText>}>
                          <CodeBlock style={{ marginTop: '16px' }}>
                            <CodeBlockCode>
{`apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: ${selectedAlertDetail.alertName.toLowerCase()}
  namespace: ${selectedAlertDetail.namespace}
spec:
  groups:
  - name: alerts
    rules:
    - alert: ${selectedAlertDetail.alertName}
      expr: # alert expression
      for: 5m
      labels:
        severity: ${selectedAlertDetail.severity.toLowerCase()}
      annotations:
        summary: "${selectedAlertDetail.summary}"`}
                            </CodeBlockCode>
                          </CodeBlock>
                        </Tab>
                      </Tabs>
                    </DrawerPanelBody>
                  </DrawerPanelContent>
                )
              }
            >
              <DrawerContentBody style={{ overflow: 'auto', flex: 1, padding: '0 24px 24px 24px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', width: '100%' }}>
                  {/* Filter Sidebar */}
                  {drillDownFilterOpen && (
                    <div style={{ width: '280px', minWidth: '280px', maxWidth: '280px', flexShrink: 0 }}>
                      <Card>
                        <CardHeader>
                          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                            <FlexItem><CardTitle><FilterIcon /> Filters</CardTitle></FlexItem>
                            <FlexItem>
                              <Button variant="plain" onClick={() => setDrillDownFilterOpen(false)}><TimesIcon /></Button>
                            </FlexItem>
                          </Flex>
                        </CardHeader>
                        <CardBody>
                          <Stack hasGutter>
                            {/* Severity - Labels */}
                            <StackItem>
                              <Content component="small" className="pf-v6-u-mb-sm"><strong>Severity</strong></Content>
                              <Flex gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }}>
                                {(['Critical', 'Warning', 'Info'] as AlertSeverity[]).map(sev => (
                                  <FlexItem key={sev}>
                                    <Label
                                      color={getSeverityLabelColor(sev)}
                                      icon={getSeverityIcon(sev)}
                                      onClick={() => {
                                        if (drillDownSeverityFilter.includes(sev)) {
                                          setDrillDownSeverityFilter(drillDownSeverityFilter.filter(s => s !== sev));
                                        } else {
                                          setDrillDownSeverityFilter([...drillDownSeverityFilter, sev]);
                                        }
                                      }}
                                      style={{ 
                                        cursor: 'pointer', 
                                        opacity: drillDownSeverityFilter.length > 0 && !drillDownSeverityFilter.includes(sev) ? 0.5 : 1,
                                        outline: drillDownSeverityFilter.includes(sev) ? '2px solid var(--pf-t--global--border--color--clicked)' : 'none',
                                        outlineOffset: '1px'
                                      }}
                                    >
                                      {sev}
                                    </Label>
                                  </FlexItem>
                                ))}
                              </Flex>
                            </StackItem>
                            <Divider />
                            {/* Group - Checkboxes */}
                            <StackItem>
                              <Content component="small" className="pf-v6-u-mb-sm"><strong>Group</strong></Content>
                              <Stack hasGutter>
                                {(['Cluster', 'Namespace'] as AlertGroup[]).map(grp => (
                                  <StackItem key={grp}>
                                    <Checkbox
                                      id={`dd-grp-${grp}`}
                                      label={grp}
                                      isChecked={drillDownGroupFilter.includes(grp)}
                                      onChange={(_, checked) => {
                                        if (checked) setDrillDownGroupFilter([...drillDownGroupFilter, grp]);
                                        else setDrillDownGroupFilter(drillDownGroupFilter.filter(g => g !== grp));
                                      }}
                                    />
                                  </StackItem>
                                ))}
                              </Stack>
                            </StackItem>
                            <Divider />
                            {/* Component - Dropdown based on selected group */}
                            <StackItem>
                              <Content component="small" className="pf-v6-u-mb-sm">
                                <strong>{drillDownGroupFilter.length > 0 ? `Affected component (in: ${drillDownGroupFilter.map(g => `Alert scope: ${g}`).join(', ')})` : 'Affected component'}</strong>
                              </Content>
                              <Select
                                role="menu"
                                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                  <MenuToggle
                                    ref={toggleRef}
                                    onClick={() => setIsDrillDownComponentOpen(!isDrillDownComponentOpen)}
                                    isExpanded={isDrillDownComponentOpen}
                                    style={{ width: '100%' }}
                                  >
                                    {drillDownComponentFilter.length === 0 ? 'All components' : `${drillDownComponentFilter.length} selected`}
                                  </MenuToggle>
                                )}
                                onSelect={(_, value) => {
                                  const comp = value as AlertComponent;
                                  if (drillDownComponentFilter.includes(comp)) {
                                    setDrillDownComponentFilter(drillDownComponentFilter.filter(c => c !== comp));
                                  } else {
                                    setDrillDownComponentFilter([...drillDownComponentFilter, comp]);
                                  }
                                }}
                                isOpen={isDrillDownComponentOpen}
                                onOpenChange={setIsDrillDownComponentOpen}
                              >
                                <SelectList>
                                  {(() => {
                                    const clusterComponents: AlertComponent[] = ['kube-apiserver', 'etcd', 'Scheduler', 'Controller', 'Network'];
                                    const namespaceComponents: AlertComponent[] = ['Workload', 'Pod', 'Storage', 'Quota', 'Network'];
                                    let availableComponents: AlertComponent[] = [];
                                    if (drillDownGroupFilter.length === 0) {
                                      availableComponents = ['kube-apiserver', 'Storage', 'Network', 'etcd', 'Scheduler', 'Controller', 'Workload', 'Pod', 'Quota'];
                                    } else {
                                      if (drillDownGroupFilter.includes('Cluster')) {
                                        availableComponents = [...availableComponents, ...clusterComponents];
                                      }
                                      if (drillDownGroupFilter.includes('Namespace')) {
                                        availableComponents = [...availableComponents, ...namespaceComponents];
                                      }
                                      availableComponents = Array.from(new Set(availableComponents));
                                    }
                                    return availableComponents.map(comp => (
                                      <SelectOption 
                                        key={comp} 
                                        value={comp}
                                        hasCheckbox
                                        isSelected={drillDownComponentFilter.includes(comp)}
                                      >
                                        {comp}
                                      </SelectOption>
                                    ));
                                  })()}
                                </SelectList>
                              </Select>
                            </StackItem>
                            <Divider />
                            {/* State - Checkboxes */}
                            <StackItem>
                              <Content component="small" className="pf-v6-u-mb-sm"><strong>State</strong></Content>
                              <Stack hasGutter>
                                {['firing', 'pending', 'acknowledged'].map(state => (
                                  <StackItem key={state}>
                                    <Checkbox
                                      id={`dd-state-${state}`}
                                      label={state.charAt(0).toUpperCase() + state.slice(1)}
                                      isChecked={drillDownStateFilter.includes(state)}
                                      onChange={(_, checked) => {
                                        if (checked) setDrillDownStateFilter([...drillDownStateFilter, state]);
                                        else setDrillDownStateFilter(drillDownStateFilter.filter(s => s !== state));
                                      }}
                                    />
                                  </StackItem>
                                ))}
                              </Stack>
                            </StackItem>
                            <Divider />
                            {/* Source - Checkboxes */}
                            <StackItem>
                              <Content component="small" className="pf-v6-u-mb-sm"><strong>Source</strong></Content>
                              <Stack hasGutter>
                                {['Platform', 'User'].map(src => (
                                  <StackItem key={src}>
                                    <Checkbox
                                      id={`dd-src-${src}`}
                                      label={src}
                                      isChecked={drillDownSourceFilter.includes(src)}
                                      onChange={(_, checked) => {
                                        if (checked) setDrillDownSourceFilter([...drillDownSourceFilter, src]);
                                        else setDrillDownSourceFilter(drillDownSourceFilter.filter(s => s !== src));
                                      }}
                                    />
                                  </StackItem>
                                ))}
                              </Stack>
                            </StackItem>
                            <Divider />
                            {/* Triggered - Date/Time pickers */}
                            <StackItem>
                              <Content component="small" className="pf-v6-u-mb-sm"><strong>Triggered</strong></Content>
                              <Stack hasGutter>
                                <StackItem>
                                  <Content component="small" className="pf-v6-u-mb-xs">From</Content>
                                  <Flex direction={{ default: 'column' }} gap={{ default: 'gapSm' }}>
                                    <FlexItem>
                                      <DatePicker
                                        value={drillDownTriggeredFrom ? drillDownTriggeredFrom.split('T')[0] : ''}
                                        onChange={(_event, value) => {
                                          if (value) {
                                            const currentTime = drillDownTriggeredFrom ? drillDownTriggeredFrom.split('T')[1] || '00:00' : '00:00';
                                            setDrillDownTriggeredFrom(`${value}T${currentTime}`);
                                          } else {
                                            setDrillDownTriggeredFrom('');
                                          }
                                        }}
                                        placeholder="YYYY-MM-DD"
                                        aria-label="Start date"
                                        style={{ width: '100%' }}
                                      />
                                    </FlexItem>
                                    <FlexItem>
                                      <TimePicker
                                        time={drillDownTriggeredFrom ? drillDownTriggeredFrom.split('T')[1] || '' : ''}
                                        onChange={(_event, time) => {
                                          if (drillDownTriggeredFrom) {
                                            const currentDate = drillDownTriggeredFrom.split('T')[0];
                                            setDrillDownTriggeredFrom(`${currentDate}T${time}`);
                                          } else {
                                            const today = new Date().toISOString().split('T')[0];
                                            setDrillDownTriggeredFrom(`${today}T${time}`);
                                          }
                                        }}
                                        placeholder="HH:MM"
                                        aria-label="Start time"
                                        is24Hour
                                        style={{ width: '100%' }}
                                        menuAppendTo={() => document.body}
                                      />
                                    </FlexItem>
                                  </Flex>
                                </StackItem>
                                <StackItem>
                                  <Content component="small" className="pf-v6-u-mb-xs">To</Content>
                                  <Flex direction={{ default: 'column' }} gap={{ default: 'gapSm' }}>
                                    <FlexItem>
                                      <DatePicker
                                        value={drillDownTriggeredTo ? drillDownTriggeredTo.split('T')[0] : ''}
                                        onChange={(_event, value) => {
                                          if (value) {
                                            const currentTime = drillDownTriggeredTo ? drillDownTriggeredTo.split('T')[1] || '23:59' : '23:59';
                                            setDrillDownTriggeredTo(`${value}T${currentTime}`);
                                          } else {
                                            setDrillDownTriggeredTo('');
                                          }
                                        }}
                                        placeholder="YYYY-MM-DD"
                                        aria-label="End date"
                                        style={{ width: '100%' }}
                                      />
                                    </FlexItem>
                                    <FlexItem>
                                      <TimePicker
                                        time={drillDownTriggeredTo ? drillDownTriggeredTo.split('T')[1] || '' : ''}
                                        onChange={(_event, time) => {
                                          if (drillDownTriggeredTo) {
                                            const currentDate = drillDownTriggeredTo.split('T')[0];
                                            setDrillDownTriggeredTo(`${currentDate}T${time}`);
                                          } else {
                                            const today = new Date().toISOString().split('T')[0];
                                            setDrillDownTriggeredTo(`${today}T${time}`);
                                          }
                                        }}
                                        placeholder="HH:MM"
                                        aria-label="End time"
                                        is24Hour
                                        style={{ width: '100%' }}
                                        menuAppendTo={() => document.body}
                                      />
                                    </FlexItem>
                                  </Flex>
                                </StackItem>
                              </Stack>
                            </StackItem>
                            {hasDrillDownActiveFilters && (
                              <>
                                <Divider />
                                <StackItem>
                                  <Button variant="link" onClick={clearDrillDownFilters}>Clear all filters</Button>
                                </StackItem>
                              </>
                            )}
                          </Stack>
                        </CardBody>
                      </Card>
                    </div>
                  )}

                  {/* Main Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Stack hasGutter>
                      {/* Alerts Table */}
                      <StackItem>
                        <Card>
                          <CardHeader style={{ padding: '24px 24px 0 24px' }}>
                            <Toolbar style={{ padding: 0, margin: 0, paddingBottom: '24px', minHeight: 'auto' }}>
                              <ToolbarContent style={{ alignItems: 'center' }}>
                                {/* Saved Filters Dropdown */}
                                <ToolbarItem>
                                  <Dropdown
                                    isOpen={isDrillDownSavedFiltersDropdownOpen}
                                    onOpenChange={setIsDrillDownSavedFiltersDropdownOpen}
                                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                      <MenuToggle 
                                        ref={toggleRef} 
                                        onClick={() => setIsDrillDownSavedFiltersDropdownOpen(!isDrillDownSavedFiltersDropdownOpen)}
                                        isExpanded={isDrillDownSavedFiltersDropdownOpen}
                                        icon={<BookmarkIcon />}
                                      >
                                        {selectedDrillDownSavedFilter ? selectedDrillDownSavedFilter.name : 'Saved filters'}
                                      </MenuToggle>
                                    )}
                                  >
                                    <DropdownList>
                                      {drillDownSavedFilters.length === 0 ? (
                                        <DropdownItem isDisabled>No saved filters</DropdownItem>
                                      ) : (
                                        drillDownSavedFilters.map(filter => (
                                          <DropdownItem 
                                            key={filter.id}
                                            onClick={() => {
                                              setSelectedDrillDownSavedFilter(filter);
                                              setDrillDownSeverityFilter(filter.filters.severity as AlertSeverity[]);
                                              setDrillDownGroupFilter(filter.filters.group as AlertGroup[]);
                                              setDrillDownComponentFilter(filter.filters.component as AlertComponent[]);
                                              setDrillDownSourceFilter(filter.filters.source || []);
                                              setIsDrillDownSavedFiltersDropdownOpen(false);
                                            }}
                                          >
                                            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ width: '100%' }}>
                                              <FlexItem>{filter.name}</FlexItem>
                                              {selectedDrillDownSavedFilter?.id === filter.id && (
                                                <FlexItem>
                                                  <CheckIcon style={{ color: 'var(--pf-t--global--icon--color--brand--default)' }} />
                                                </FlexItem>
                                              )}
                                            </Flex>
                                          </DropdownItem>
                                        ))
                                      )}
                                      <Divider />
                                      <DropdownItem 
                                        onClick={() => {
                                          setIsDrillDownManageSavedFiltersModalOpen(true);
                                          setIsDrillDownSavedFiltersDropdownOpen(false);
                                        }}
                                      >
                                        <CogIcon /> Manage saved filters
                                      </DropdownItem>
                                    </DropdownList>
                                  </Dropdown>
                                </ToolbarItem>
                                {/* Filters Button */}
                                <ToolbarItem>
                                  <Button 
                                    variant={drillDownFilterOpen ? 'secondary' : 'control'} 
                                    icon={<FilterIcon />}
                                    onClick={() => setDrillDownFilterOpen(!drillDownFilterOpen)}
                                  >
                                    Filters {hasDrillDownActiveFilters && <Badge isRead style={{ marginLeft: '4px' }}>{drillDownSeverityFilter.length + drillDownGroupFilter.length + drillDownComponentFilter.length + drillDownSourceFilter.length + drillDownStateFilter.length + (drillDownTriggeredFrom ? 1 : 0) + (drillDownTriggeredTo ? 1 : 0)}</Badge>}
                                  </Button>
                                </ToolbarItem>
                                {/* Search Input */}
                                <ToolbarItem>
                                  <SearchInput
                                    placeholder="Search alerts..."
                                    value={drillDownSearchValue}
                                    onChange={(_, value) => setDrillDownSearchValue(value)}
                                    onClear={() => setDrillDownSearchValue('')}
                                    style={{ width: '250px' }}
                                  />
                                </ToolbarItem>
                                <ToolbarItem variant="separator" />
                                <ToolbarItem style={{ display: 'flex', alignItems: 'center' }}>
                                  <Switch
                                    id="aggregate-switch"
                                    label="Aggregate by name and severity"
                                    isChecked={isAggregated}
                                    onChange={(_, checked) => setIsAggregated(checked)}
                                  />
                                </ToolbarItem>
                                <ToolbarItem variant="separator" />
                                <ToolbarItem align={{ default: 'alignEnd' }}>
                                  <Tooltip content="Manage columns">
                                    <Button variant="plain" icon={<ColumnsIcon />} onClick={openManageColumnsModal} aria-label="Manage columns" />
                                  </Tooltip>
                                </ToolbarItem>
                              </ToolbarContent>
                            </Toolbar>

                            {/* Active filter chips */}
                            {hasDrillDownActiveFilters && (
                              <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }} style={{ padding: '12px 0 0' }}>
                                <FlexItem>
                                  <LabelGroup categoryName="Active filters">
                                    {drillDownSeverityFilter.map(s => (
                                      <Label key={s} color={getSeverityLabelColor(s)} onClose={() => setDrillDownSeverityFilter(drillDownSeverityFilter.filter(x => x !== s))}>{s}</Label>
                                    ))}
                                    {drillDownGroupFilter.map(g => (
                                      <Label key={g} color="blue" onClose={() => setDrillDownGroupFilter(drillDownGroupFilter.filter(x => x !== g))}>{g}</Label>
                                    ))}
                                    {drillDownComponentFilter.map(c => (
                                      <Label key={c} color="green" onClose={() => setDrillDownComponentFilter(drillDownComponentFilter.filter(x => x !== c))}>{c}</Label>
                                    ))}
                                    {drillDownStateFilter.map(st => (
                                      <Label key={st} color="purple" onClose={() => setDrillDownStateFilter(drillDownStateFilter.filter(x => x !== st))}>{st}</Label>
                                    ))}
                                    {drillDownSourceFilter.map(s => (
                                      <Label key={s} color="grey" onClose={() => setDrillDownSourceFilter(drillDownSourceFilter.filter(x => x !== s))}>{s}</Label>
                                    ))}
                                    {drillDownTriggeredFrom && (
                                      <Label key="from" color="teal" onClose={() => setDrillDownTriggeredFrom('')}>From: {drillDownTriggeredFrom}</Label>
                                    )}
                                    {drillDownTriggeredTo && (
                                      <Label key="to" color="teal" onClose={() => setDrillDownTriggeredTo('')}>To: {drillDownTriggeredTo}</Label>
                                    )}
                                  </LabelGroup>
                                </FlexItem>
                                <FlexItem>
                                  <Flex gap={{ default: 'gapSm' }}>
                                    <FlexItem>
                                      <Button variant="link" onClick={() => { clearDrillDownFilters(); setSelectedDrillDownSavedFilter(null); }}>
                                        Clear filters
                                      </Button>
                                    </FlexItem>
                                    <FlexItem>
                                      <Button variant="link" onClick={() => setDrillDownFilterOpen(true)}>
                                        Edit filters
                                      </Button>
                                    </FlexItem>
                                    {selectedDrillDownSavedFilter && (() => {
                                      // Check if current filters differ from saved filter
                                      const savedSeverity = selectedDrillDownSavedFilter.filters.severity || [];
                                      const savedGroup = selectedDrillDownSavedFilter.filters.group || [];
                                      const savedComponent = selectedDrillDownSavedFilter.filters.component || [];
                                      const savedSource = selectedDrillDownSavedFilter.filters.source || [];
                                      const savedSearchValue = selectedDrillDownSavedFilter.filters.searchValue || '';
                                      
                                      const hasChanges = 
                                        JSON.stringify([...drillDownSeverityFilter].sort()) !== JSON.stringify([...savedSeverity].sort()) ||
                                        JSON.stringify([...drillDownGroupFilter].sort()) !== JSON.stringify([...savedGroup].sort()) ||
                                        JSON.stringify([...drillDownComponentFilter].sort()) !== JSON.stringify([...savedComponent].sort()) ||
                                        JSON.stringify([...drillDownSourceFilter].sort()) !== JSON.stringify([...savedSource].sort()) ||
                                        drillDownSearchValue !== savedSearchValue;
                                      
                                      return hasChanges ? (
                                        <FlexItem>
                                          <Button variant="link" onClick={() => {
                                            // Update the existing saved filter with current filter values
                                            setDrillDownSavedFilters(drillDownSavedFilters.map(f => 
                                              f.id === selectedDrillDownSavedFilter.id 
                                                ? { 
                                                    ...f, 
                                                    filters: { 
                                                      severity: drillDownSeverityFilter, 
                                                      group: drillDownGroupFilter, 
                                                      component: drillDownComponentFilter, 
                                                      source: drillDownSourceFilter, 
                                                      searchValue: drillDownSearchValue 
                                                    } 
                                                  } 
                                                : f
                                            ));
                                            // Update the selected filter reference
                                            setSelectedDrillDownSavedFilter({
                                              ...selectedDrillDownSavedFilter,
                                              filters: { 
                                                severity: drillDownSeverityFilter, 
                                                group: drillDownGroupFilter, 
                                                component: drillDownComponentFilter, 
                                                source: drillDownSourceFilter, 
                                                searchValue: drillDownSearchValue 
                                              }
                                            });
                                            addToast(`Filter "${selectedDrillDownSavedFilter.name}" updated`, 'success');
                                          }}>
                                            Update saved filter
                                          </Button>
                                        </FlexItem>
                                      ) : null;
                                    })()}
                                    <FlexItem>
                                      <Button variant="link" onClick={() => { setDrillDownNewFilterName(''); setIsDrillDownSaveFilterModalOpen(true); }}>
                                        Add to saved filters
                                      </Button>
                                    </FlexItem>
                                  </Flex>
                                </FlexItem>
                              </Flex>
                            )}
                          </CardHeader>
                          <CardBody style={{ overflow: 'auto', padding: '0 24px 16px 24px' }}>
                            {drillDownFilteredAlerts.length === 0 ? (
                              <EmptyState titleText="No alerts found" icon={CheckCircleIcon}>
                                <EmptyStateBody>No alerts match the current filters.</EmptyStateBody>
                              </EmptyState>
                            ) : (
                              <div style={{ overflowX: 'auto', width: '100%' }}>
                              <Table aria-label="Alerts table" isExpandable={isAggregated} style={{ minWidth: '800px' }}>
                                <Thead>
                                  <Tr>
                                    {isAggregated && <Th screenReaderText="Expand" />}
                                    <Th>Severity</Th>
                                    <Th>Alert Name</Th>
                                    {isAggregated && columns.find(c => c.key === 'total')?.isVisible && <Th>Total</Th>}
                                    {columns.find(c => c.key === 'state')?.isVisible && <Th>State</Th>}
                                    {columns.find(c => c.key === 'group')?.isVisible && <Th>Alert scope</Th>}
                                    {columns.find(c => c.key === 'component')?.isVisible && <Th>Component</Th>}
                                    {columns.find(c => c.key === 'source')?.isVisible && <Th>Source</Th>}
                                    <Th screenReaderText="Actions" />
                                  </Tr>
                                </Thead>
                                {isAggregated ? (
                                  aggregatedAlerts.slice((drillDownPage - 1) * drillDownPerPage, drillDownPage * drillDownPerPage).map((agg, idx) => (
                                    <Tbody key={agg.key} isExpanded={expandedAlertRows.includes(agg.key)}>
                                      <Tr>
                                        <Td
                                          expand={{
                                            rowIndex: idx,
                                            isExpanded: expandedAlertRows.includes(agg.key),
                                            onToggle: () => {
                                              if (expandedAlertRows.includes(agg.key)) {
                                                setExpandedAlertRows(expandedAlertRows.filter(k => k !== agg.key));
                                              } else {
                                                setExpandedAlertRows([...expandedAlertRows, agg.key]);
                                              }
                                            },
                                          }}
                                        />
                                        <Td><Label color={getSeverityLabelColor(agg.severity)} icon={getSeverityIcon(agg.severity)}>{agg.severity}</Label></Td>
                                        <Td>
                                          <Button variant="link" isInline onClick={() => { setSelectedAlertDetail(agg.alerts[0]); setIsDrawerExpanded(true); }}>
                                            <strong>{agg.alertName}</strong>
                                          </Button>
                                        </Td>
                                        {columns.find(c => c.key === 'total')?.isVisible && <Td><Badge>{agg.count}</Badge></Td>}
                                        {columns.find(c => c.key === 'state')?.isVisible && <Td><Label color={getStatusLabelColor(agg.alerts[0].status)} variant="outline">{agg.alerts[0].status}</Label></Td>}
                                        {columns.find(c => c.key === 'group')?.isVisible && <Td><Label isCompact>{agg.alerts[0].group}</Label></Td>}
                                        {columns.find(c => c.key === 'component')?.isVisible && <Td><Label isCompact variant="outline">{agg.alerts[0].component}</Label></Td>}
                                        {columns.find(c => c.key === 'source')?.isVisible && <Td>{agg.alerts[0].source}</Td>}
                                        <Td isActionCell>
                                          <Dropdown
                                            isOpen={false}
                                            toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                              <MenuToggle ref={toggleRef} variant="plain" aria-label="Actions"><EllipsisVIcon /></MenuToggle>
                                            )}
                                          >
                                            <DropdownList>
                                              <DropdownItem onClick={() => addToast('Alert acknowledged', 'success')}>Acknowledge</DropdownItem>
                                              <DropdownItem onClick={() => addToast('Alert silenced', 'success')}>Silence</DropdownItem>
                                            </DropdownList>
                                          </Dropdown>
                                        </Td>
                                      </Tr>
                                      <Tr isExpanded={expandedAlertRows.includes(agg.key)}>
                                        <Td colSpan={10}>
                                          <ExpandableRowContent>
                                            <Table aria-label="Expanded alerts" variant="compact">
                                              <Thead>
                                                <Tr>
                                                  <Th>Namespace</Th>
                                                  <Th>State</Th>
                                                  <Th>Last Fired</Th>
                                                  <Th>Source</Th>
                                                </Tr>
                                              </Thead>
                                              <Tbody>
                                                {agg.alerts.map(alert => (
                                                  <Tr key={alert.id}>
                                                    <Td>{alert.namespace}</Td>
                                                    <Td><Label color={getStatusLabelColor(alert.status)} variant="outline" isCompact>{alert.status}</Label></Td>
                                                    <Td>{alert.lastFired}</Td>
                                                    <Td>{alert.source}</Td>
                                                  </Tr>
                                                ))}
                                              </Tbody>
                                            </Table>
                                          </ExpandableRowContent>
                                        </Td>
                                      </Tr>
                                    </Tbody>
                                  ))
                                ) : (
                                  <Tbody>
                                    {drillDownFilteredAlerts.slice((drillDownPage - 1) * drillDownPerPage, drillDownPage * drillDownPerPage).map(alert => (
                                      <Tr key={alert.id}>
                                        <Td><Label color={getSeverityLabelColor(alert.severity)} icon={getSeverityIcon(alert.severity)}>{alert.severity}</Label></Td>
                                        <Td>
                                          <Button variant="link" isInline onClick={() => { setSelectedAlertDetail(alert); setIsDrawerExpanded(true); }}>
                                            <strong>{alert.alertName}</strong>
                                          </Button>
                                        </Td>
                                        {columns.find(c => c.key === 'state')?.isVisible && <Td><Label color={getStatusLabelColor(alert.status)} variant="outline">{alert.status}</Label></Td>}
                                        {columns.find(c => c.key === 'group')?.isVisible && <Td><Label isCompact>{alert.group}</Label></Td>}
                                        {columns.find(c => c.key === 'component')?.isVisible && <Td><Label isCompact variant="outline">{alert.component}</Label></Td>}
                                        {columns.find(c => c.key === 'source')?.isVisible && <Td>{alert.source}</Td>}
                                        <Td isActionCell>
                                          <Dropdown
                                            isOpen={false}
                                            toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                              <MenuToggle ref={toggleRef} variant="plain" aria-label="Actions"><EllipsisVIcon /></MenuToggle>
                                            )}
                                          >
                                            <DropdownList>
                                              <DropdownItem onClick={() => addToast('Alert acknowledged', 'success')}>Acknowledge</DropdownItem>
                                              <DropdownItem onClick={() => addToast('Alert silenced', 'success')}>Silence</DropdownItem>
                                            </DropdownList>
                                          </Dropdown>
                                        </Td>
                                      </Tr>
                                    ))}
                                  </Tbody>
                                )}
                              </Table>
                              </div>
                            )}
                          </CardBody>
                          <CardFooter style={{ padding: '16px 24px 24px 24px' }}>
                            <Pagination
                              itemCount={isAggregated ? aggregatedAlerts.length : drillDownFilteredAlerts.length}
                              perPage={drillDownPerPage}
                              page={drillDownPage}
                              onSetPage={(_, p) => setDrillDownPage(p)}
                              onPerPageSelect={(_, pp) => setDrillDownPerPage(pp)}
                              isCompact
                            />
                          </CardFooter>
                        </Card>
                      </StackItem>
                    </Stack>
                  </div>
                </div>
              </DrawerContentBody>
            </DrawerContent>
          </Drawer>

        {/* Column Management Modal */}
        <Modal
          isOpen={isManageColumnsModalOpen}
          onClose={() => setIsManageColumnsModalOpen(false)}
          variant="small"
          aria-labelledby="column-management-modal"
        >
          <ModalHeader title="Manage columns" labelId="column-management-modal" />
          <ModalBody>
            <Stack hasGutter>
              <StackItem>
                <Content component="p" className="pf-v6-u-color-200">
                  Selected columns will appear in the table. Drag to reorder columns.
                </Content>
              </StackItem>
              <StackItem>
                <PfAlert variant="info" isInline isPlain title={`${tempColumns.filter(c => c.isVisible).length} of ${MAX_VISIBLE_COLUMNS} columns selected`} />
              </StackItem>
              <StackItem>
                <Flex gap={{ default: 'gapMd' }}>
                  <FlexItem><Button variant="link" isInline onClick={handleSelectAllColumns}>Select all</Button></FlexItem>
                  <FlexItem><Button variant="link" isInline onClick={handleDeselectAllColumns}>Deselect all</Button></FlexItem>
                  <FlexItem><Button variant="link" isInline onClick={handleRestoreDefaultColumns}>Restore defaults</Button></FlexItem>
                </Flex>
              </StackItem>
              <StackItem>
                <DataList aria-label="Column management list" isCompact>
                  {tempColumns.sort((a, b) => a.order - b.order).map(column => (
                    <DataListItem key={column.key} id={column.key} aria-labelledby={`column-${column.key}`}>
                      <DataListItemRow>
                        <DataListControl>
                          <Tooltip content={column.isDisabled ? "Required columns cannot be reordered" : "Drag to reorder"}>
                            <span style={{ cursor: column.isDisabled ? 'not-allowed' : 'grab', color: column.isDisabled ? 'var(--pf-t--global--color--nonstatus--gray--default)' : 'inherit', padding: '4px' }}>
                              <GripVerticalIcon />
                            </span>
                          </Tooltip>
                        </DataListControl>
                        <DataListCheck
                          aria-labelledby={`column-${column.key}`}
                          isChecked={column.isDisabled ? true : column.isVisible}
                          isDisabled={column.isDisabled}
                          onChange={() => handleTempColumnToggle(column.key)}
                          id={`check-${column.key}`}
                        />
                        <DataListItemCells
                          dataListCells={[
                            <DataListCell key={column.key} id={`column-${column.key}`}>
                              <span style={{ fontWeight: column.isDisabled ? 600 : 'normal' }}>{column.label}</span>
                            </DataListCell>
                          ]}
                        />
                      </DataListItemRow>
                    </DataListItem>
                  ))}
                </DataList>
              </StackItem>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="primary" onClick={handleSaveColumns}>Save</Button>
            <Button variant="link" onClick={() => setIsManageColumnsModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </Modal>

        {/* Save Filter Modal for Drill-Down */}
        <Modal
          variant="small"
          isOpen={isDrillDownSaveFilterModalOpen}
          onClose={() => setIsDrillDownSaveFilterModalOpen(false)}
        >
          <ModalHeader title="Save current filters" />
          <ModalBody>
            <Stack hasGutter>
              <StackItem>
                <Content component="p">Save the current filter configuration for quick access later.</Content>
              </StackItem>
              <StackItem>
                <TextInputGroup>
                  <TextInputGroupMain
                    placeholder="Enter filter name..."
                    value={drillDownNewFilterName}
                    onChange={(_, value) => setDrillDownNewFilterName(value)}
                  />
                </TextInputGroup>
              </StackItem>
              <StackItem>
                <Content component="small" className="pf-v6-u-color-200">
                  <InfoCircleIcon /> Your saved filters are specific to your account and won't be visible to other users.
                </Content>
              </StackItem>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="primary" 
              onClick={() => {
                if (drillDownNewFilterName.trim()) {
                  const newFilter: SavedFilter = {
                    id: `ddsf-${Date.now()}`,
                    name: drillDownNewFilterName.trim(),
                    filters: { 
                      severity: drillDownSeverityFilter, 
                      group: drillDownGroupFilter, 
                      component: drillDownComponentFilter, 
                      source: drillDownSourceFilter, 
                      searchValue: drillDownSearchValue 
                    },
                  };
                  setDrillDownSavedFilters([...drillDownSavedFilters, newFilter]);
                  setIsDrillDownSaveFilterModalOpen(false);
                  setDrillDownNewFilterName('');
                  addToast('Filter saved', 'success');
                }
              }}
              isDisabled={!drillDownNewFilterName.trim()}
            >
              Save
            </Button>
            <Button variant="link" onClick={() => setIsDrillDownSaveFilterModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </Modal>

        {/* Manage Saved Filters Modal for Drill-Down */}
        <Modal
          variant="medium"
          isOpen={isDrillDownManageSavedFiltersModalOpen}
          onClose={() => setIsDrillDownManageSavedFiltersModalOpen(false)}
        >
          <ModalHeader title="Manage saved filters" />
          <ModalBody>
            <Stack hasGutter>
              <StackItem>
                <Content component="small" className="pf-v6-u-color-200">
                  <InfoCircleIcon /> Your saved filters are specific to your account and won't be visible to other users.
                </Content>
              </StackItem>
              <StackItem>
                {drillDownSavedFilters.length === 0 ? (
                  <EmptyState titleText="No saved filters" icon={BookmarkIcon}>
                    <EmptyStateBody>You haven't saved any filters yet. Use the "Add to saved filters" option when filters are active.</EmptyStateBody>
                  </EmptyState>
                ) : (
                  <DataList aria-label="Saved filters list" isCompact>
                    {drillDownSavedFilters.map((filter, index) => (
                      <DataListItem key={filter.id} aria-labelledby={`drilldown-filter-${filter.id}`}>
                        <DataListItemRow>
                          <DataListControl>
                            <Tooltip content="Drag to reorder">
                              <span style={{ cursor: 'grab', display: 'flex', alignItems: 'center', padding: '8px' }}>
                                <GripVerticalIcon />
                              </span>
                            </Tooltip>
                          </DataListControl>
                          <DataListItemCells
                            dataListCells={[
                              <DataListCell key="name" id={`drilldown-filter-${filter.id}`} width={3}>
                                {drillDownEditingFilterId === filter.id ? (
                                  <TextInputGroup>
                                    <TextInputGroupMain
                                      value={drillDownEditingFilterName}
                                      onChange={(_, value) => setDrillDownEditingFilterName(value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && drillDownEditingFilterName.trim()) {
                                          setDrillDownSavedFilters(drillDownSavedFilters.map(f => 
                                            f.id === filter.id ? { ...f, name: drillDownEditingFilterName.trim() } : f
                                          ));
                                          setDrillDownEditingFilterId(null);
                                          setDrillDownEditingFilterName('');
                                        }
                                      }}
                                    />
                                    <TextInputGroupUtilities>
                                      <Button
                                        variant="plain"
                                        onClick={() => {
                                          if (drillDownEditingFilterName.trim()) {
                                            setDrillDownSavedFilters(drillDownSavedFilters.map(f => 
                                              f.id === filter.id ? { ...f, name: drillDownEditingFilterName.trim() } : f
                                            ));
                                          }
                                          setDrillDownEditingFilterId(null);
                                          setDrillDownEditingFilterName('');
                                        }}
                                        aria-label="Save name"
                                      >
                                        <CheckIcon />
                                      </Button>
                                      <Button
                                        variant="plain"
                                        size="sm"
                                        onClick={() => {
                                          setDrillDownEditingFilterId(null);
                                          setDrillDownEditingFilterName('');
                                        }}
                                      >
                                        <TimesIcon />
                                      </Button>
                                    </TextInputGroupUtilities>
                                  </TextInputGroup>
                                ) : (
                                  <span>
                                    <BookmarkIcon /> {filter.name}
                                  </span>
                                )}
                              </DataListCell>,
                              <DataListCell key="filters" width={2}>
                                <Flex gap={{ default: 'gapXs' }} flexWrap={{ default: 'wrap' }}>
                                  {filter.filters.severity.length > 0 && (
                                    <FlexItem>
                                      <Tooltip content={`Severity: ${filter.filters.severity.join(', ')}`}>
                                        <Label isCompact color="grey">{filter.filters.severity.length} severity</Label>
                                      </Tooltip>
                                    </FlexItem>
                                  )}
                                  {filter.filters.group.length > 0 && (
                                    <FlexItem>
                                      <Tooltip content={`Group: ${filter.filters.group.join(', ')}`}>
                                        <Label isCompact color="grey">{filter.filters.group.length} group</Label>
                                      </Tooltip>
                                    </FlexItem>
                                  )}
                                  {filter.filters.component.length > 0 && (
                                    <FlexItem>
                                      <Tooltip content={`Component: ${filter.filters.component.join(', ')}`}>
                                        <Label isCompact color="grey">{filter.filters.component.length} component</Label>
                                      </Tooltip>
                                    </FlexItem>
                                  )}
                                  {filter.filters.source && filter.filters.source.length > 0 && (
                                    <FlexItem>
                                      <Tooltip content={`Source: ${filter.filters.source.join(', ')}`}>
                                        <Label isCompact color="grey">{filter.filters.source.length} source</Label>
                                      </Tooltip>
                                    </FlexItem>
                                  )}
                                  {filter.filters.searchValue && (
                                    <FlexItem>
                                      <Tooltip content={`Search: "${filter.filters.searchValue}"`}>
                                        <Label isCompact color="grey">search</Label>
                                      </Tooltip>
                                    </FlexItem>
                                  )}
                                </Flex>
                              </DataListCell>,
                              <DataListCell key="actions" width={1} alignRight>
                                <Flex gap={{ default: 'gapSm' }}>
                                  <FlexItem>
                                    <Tooltip content="Edit filter name">
                                      <Button 
                                        variant="plain" 
                                        size="sm"
                                        onClick={() => {
                                          setDrillDownEditingFilterId(filter.id);
                                          setDrillDownEditingFilterName(filter.name);
                                        }}
                                        aria-label="Edit name"
                                      >
                                        <EditIcon />
                                      </Button>
                                    </Tooltip>
                                  </FlexItem>
                                  <FlexItem>
                                    <Tooltip content="Delete filter">
                                      <Button 
                                        variant="plain" 
                                        size="sm"
                                        onClick={() => {
                                          setDrillDownSavedFilters(drillDownSavedFilters.filter(f => f.id !== filter.id));
                                          if (selectedDrillDownSavedFilter?.id === filter.id) {
                                            setSelectedDrillDownSavedFilter(null);
                                          }
                                        }}
                                        aria-label="Delete filter"
                                      >
                                        <TrashIcon />
                                      </Button>
                                    </Tooltip>
                                  </FlexItem>
                                </Flex>
                              </DataListCell>,
                            ]}
                          />
                        </DataListItemRow>
                      </DataListItem>
                    ))}
                  </DataList>
                )}
              </StackItem>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="primary" onClick={() => setIsDrillDownManageSavedFiltersModalOpen(false)}>Done</Button>
          </ModalFooter>
        </Modal>
      </>
    );
  };

  // Refresh interval state
  const [refreshInterval, setRefreshInterval] = React.useState<number | null>(null);
  const [isRefreshIntervalOpen, setIsRefreshIntervalOpen] = React.useState(false);
  
  // Auto-refresh effect
  React.useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(() => {
        setLastRefresh(new Date());
      }, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [refreshInterval]);

  const refreshIntervalOptions = [
    { value: null, label: 'Off' },
    { value: 2, label: '2 seconds' },
    { value: 10, label: '10 seconds' },
    { value: 30, label: '30 seconds' },
    { value: 60, label: '1 minute' },
    { value: 300, label: '5 minutes' },
  ];


  // ========================================
  // MAIN VIEW (Multi-cluster Alerting Page)
  // ========================================
  return (
    <div className="alerting-page-container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 76px)', overflow: 'hidden', position: 'relative', padding: '0px' }}>
      {/* Header + Toolbar Section - Only show in fleet-overview mode */}
      {navigationView === 'fleet-overview' && (
      <div style={{ 
        flexShrink: 0,
        backgroundColor: 'var(--pf-t--global--background--color--primary--default, #ffffff)',
        borderBottom: '1px solid var(--pf-t--global--border--color--default, #d2d2d2)',
        zIndex: 100,
        paddingBottom: '0px',
      }}>
        {/* Page Header */}
        <div>
          <div className="alerting-page-header" style={{ padding: '16px 8px 0 8px' }}>
            {/* Compact Header Row - Title + Refresh on same line */}
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '4px' }}>
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                <FlexItem>
                  <Icon size="md" status="danger">
                    <OutlinedBellIcon />
                  </Icon>
                </FlexItem>
                <FlexItem>
                  <Title headingLevel="h1" size="lg">Multi-cluster alerting</Title>
                </FlexItem>
              </Flex>
              {/* Refresh with interval dropdown - moved to header */}
              <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                <FlexItem>
                  <Content component="small" className="pf-v6-u-color-200">
                    <ClockIcon /> {lastRefresh.toLocaleTimeString()}
                  </Content>
                </FlexItem>
                <FlexItem>
                  <Dropdown
                    isOpen={isRefreshIntervalOpen}
                    onOpenChange={setIsRefreshIntervalOpen}
                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                      <MenuToggle 
                        ref={toggleRef} 
                        variant="secondary"
                        onClick={() => setIsRefreshIntervalOpen(!isRefreshIntervalOpen)}
                        isExpanded={isRefreshIntervalOpen}
                        icon={<SyncIcon />}
                        style={{ minWidth: '140px' }}
                      >
                        {refreshInterval ? `Every ${refreshIntervalOptions.find(o => o.value === refreshInterval)?.label}` : 'Refresh'}
                      </MenuToggle>
                    )}
                  >
                    <DropdownList>
                      {refreshIntervalOptions.map(opt => (
                        <DropdownItem 
                          key={String(opt.value)}
                          onClick={() => {
                            setRefreshInterval(opt.value);
                            setIsRefreshIntervalOpen(false);
                            if (opt.value !== null) {
                              setLastRefresh(new Date());
                            }
                          }}
                        >
                          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ width: '100%' }}>
                            <FlexItem>{opt.label}</FlexItem>
                            {refreshInterval === opt.value && (
                              <FlexItem>
                                <CheckIcon style={{ color: 'var(--pf-t--global--icon--color--brand--default)' }} />
                              </FlexItem>
                            )}
                          </Flex>
                        </DropdownItem>
                      ))}
                      <Divider />
                      <DropdownItem 
                        onClick={() => {
                          setLastRefresh(new Date());
                          setIsRefreshIntervalOpen(false);
                        }}
                      >
                        <SyncIcon /> Refresh now
                      </DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </FlexItem>
              </Flex>
            </Flex>

            {/* Main Page Tabs */}
            <Tabs 
              activeKey={mainPageTab} 
              onSelect={(_, key) => setMainPageTab(key)} 
              aria-label="Main alerting tabs"
            >
              <Tab eventKey="alerts" title={<TabTitleText><BellIcon /> Alerts</TabTitleText>} />
              <Tab eventKey="incidents" title={<TabTitleText><PortIcon /> Incidents</TabTitleText>} />
              <Tab eventKey="management" title={<TabTitleText><CogIcon /> Management</TabTitleText>} />
            </Tabs>

            {/* V2: Alerts Sub-tabs - Subtab styling per PatternFly v6 guidelines */}
            {mainPageTab === 'alerts' && (
              <Tabs 
                activeKey={alertsSubTab} 
                onSelect={(_, key) => setAlertsSubTab(key as 'clusters-health' | 'firing-alerts')} 
                aria-label="Alerts sub-tabs" 
                isSubtab
              >
                <Tab eventKey="clusters-health" title={<TabTitleText>Clusters health</TabTitleText>} />
                <Tab eventKey="firing-alerts" title={<TabTitleText>Firing alerts</TabTitleText>} />
              </Tabs>
            )}

            {/* Management Sub-tabs - Subtab styling per PatternFly v6 guidelines */}
            {mainPageTab === 'management' && (
              <Tabs 
                activeKey={managementSubTab} 
                onSelect={(_, key) => setManagementSubTab(key)}
                aria-label="Management sub-tabs" 
                isSubtab
                style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
              >
                <Tab 
                  eventKey="alert-rules" 
                  title={
                    <TabTitleText>
                      Alert rules <Badge isRead style={{ marginLeft: '8px' }}>21</Badge>
                    </TabTitleText>
                  } 
                />
                <Tab 
                  eventKey="silence-rules" 
                  title={
                    <TabTitleText>
                      Silence rules <Badge isRead style={{ marginLeft: '8px' }}>2</Badge>
                    </TabTitleText>
                  } 
                />
              </Tabs>
            )}

          </div>
        </div>

        {/* Toolbar section - Under tabs, with visual separation */}
        {mainPageTab === 'alerts' && (
          <div style={{ 
            padding: '16px 8px', 
            backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
          }}>
            <Toolbar className="pf-m-align-items-center" style={{ backgroundColor: 'transparent', paddingLeft: 0, paddingRight: 0, paddingBottom: 0 }}>
              <ToolbarContent className="pf-m-align-items-center">
                {/* Saved Filters Dropdown - First */}
            <ToolbarItem>
              <Dropdown
                isOpen={isSavedFiltersDropdownOpen}
                onOpenChange={setIsSavedFiltersDropdownOpen}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle 
                    ref={toggleRef} 
                    onClick={() => setIsSavedFiltersDropdownOpen(!isSavedFiltersDropdownOpen)}
                    isExpanded={isSavedFiltersDropdownOpen}
                    icon={<BookmarkIcon />}
                  >
                    {selectedSavedFilter ? selectedSavedFilter.name : 'Saved filters'}
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  {savedFilters.length === 0 ? (
                    <DropdownItem isDisabled>No saved filters</DropdownItem>
                  ) : (
                    savedFilters.map(filter => (
                      <DropdownItem 
                        key={filter.id}
                        onClick={() => {
                          setSelectedSavedFilter(filter);
                          setSeverityFilter(filter.filters.severity as AlertSeverity[]);
                          setGroupFilter(filter.filters.group as AlertGroup[]);
                          setComponentFilter(filter.filters.component as AlertComponent[]);
                          setRegionFilter(filter.filters.region || []);
                          setClusterFilter(filter.filters.cluster || []);
                          setNamespaceFilter(filter.filters.namespace || []);
                          setLabelFilter(filter.filters.label || []);
                          setSearchValue(filter.filters.searchValue || '');
                          setIsSavedFiltersDropdownOpen(false);
                        }}
                      >
                        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ width: '100%' }}>
                          <FlexItem>{filter.name}</FlexItem>
                          {selectedSavedFilter?.id === filter.id && (
                            <FlexItem>
                              <CheckIcon style={{ color: 'var(--pf-t--global--icon--color--brand--default)' }} />
                            </FlexItem>
                          )}
                        </Flex>
                      </DropdownItem>
                    ))
                  )}
                  <Divider />
                  <DropdownItem 
                    onClick={() => {
                      setIsManageSavedFiltersModalOpen(true);
                      setIsSavedFiltersDropdownOpen(false);
                    }}
                  >
                    <CogIcon /> Manage saved filters
                  </DropdownItem>
                </DropdownList>
              </Dropdown>
            </ToolbarItem>
            {/* Filters Button - Second */}
            <ToolbarItem>
              <Button 
                variant={isFilterPanelOpen ? 'secondary' : 'control'} 
                icon={<FilterIcon />}
                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              >
                Filters {hasActiveFilters && <Badge isRead style={{ marginLeft: '4px' }}>{
                  regionFilter.length + 
                  clusterFilter.length + 
                  severityFilter.length + 
                  (hasGroupFilterChanges ? groupFilter.length : 0) + 
                  componentFilter.length + 
                  (triggeredFromDate || triggeredFromTime ? 1 : 0) + 
                  (triggeredToDate || triggeredToTime ? 1 : 0)
                }</Badge>}
              </Button>
            </ToolbarItem>
            {/* Search Input - Third - Changes scope based on tab */}
            <ToolbarItem>
              <SearchInput
                placeholder={alertsSubTab === 'firing-alerts' ? 'Search alert name, or affected components' : 'Search clusters...'}
                value={searchValue}
                onChange={(_, value) => setSearchValue(value)}
                onClear={() => setSearchValue('')}
                style={{ width: '300px' }}
              />
            </ToolbarItem>
            {/* Global Fleet View - Right aligned, only when no filters */}
            {!hasActiveFilters && (
              <ToolbarItem align={{ default: 'alignEnd' }}>
                <Tooltip content="Global View: Showing all Clusters, Namespaces, regions, and alert scopes.">
                  <Label color="blue" icon={<CubesIcon />} style={{ cursor: 'help' }}>
                    Global Fleet View
                  </Label>
                </Tooltip>
              </ToolbarItem>
            )}
          </ToolbarContent>
        </Toolbar>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
        <div style={{ 
          marginTop: '16px', 
          marginBottom: '0px',
        }}>
            <Flex 
              gap={{ default: 'gapSm' }} 
              alignItems={{ default: 'alignItemsCenter' }} 
              style={{ 
                padding: showFilterAnimation ? '8px 12px' : undefined,
                borderRadius: showFilterAnimation ? '6px' : undefined,
                backgroundColor: showFilterAnimation ? 'var(--pf-t--global--color--brand--default)' : undefined,
                animation: showFilterAnimation ? 'filterChipsHighlight 1.5s ease-out' : undefined,
              }}
            >
              <style>{`
                @keyframes filterChipsHighlight {
                  0% { background-color: rgba(0, 102, 204, 0.25); }
                  100% { background-color: transparent; }
                }
              `}</style>
              <FlexItem>
                <Flex gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsCenter' }}>
                  {/* Alert scope filters - only show when not "All" (Global View) */}
                  {hasGroupFilterChanges && (
                    <LabelGroup categoryName="Alert scope">
                      {groupFilter.map(g => (
                        <Label key={g} variant="outline" onClose={() => {
                          // When removing a scope, switch to the other one
                          if (g === 'Cluster') {
                            setGroupFilter(['Namespace']);
                          } else {
                            setGroupFilter(['Cluster']);
                          }
                        }}>{g}</Label>
                      ))}
                    </LabelGroup>
                  )}
                {/* Severity filters keep their colors */}
                {severityFilter.length > 0 && (
                  <LabelGroup categoryName="Severity">
                    {severityFilter.map(s => (
                      <Label key={s} color={getSeverityLabelColor(s)} onClose={() => setSeverityFilter(severityFilter.filter(x => x !== s))}>{s}</Label>
                    ))}
                  </LabelGroup>
                )}
                {componentFilter.length > 0 && (
                  <LabelGroup categoryName={
                    groupFilter.length > 0 && groupFilter.length < 2
                      ? `Affected component (in: Alert scope: ${groupFilter.join(', Alert scope: ')})`
                      : "Affected component"
                  }>
                    {componentFilter.map(c => (
                      <Label key={c} variant="outline" onClose={() => setComponentFilter(componentFilter.filter(x => x !== c))}>{c}</Label>
                    ))}
                  </LabelGroup>
                )}
                {regionFilter.length > 0 && (
                  <LabelGroup categoryName="Region">
                    {regionFilter.map(r => (
                      <Label key={r} variant="outline" onClose={() => setRegionFilter(regionFilter.filter(x => x !== r))}>{r}</Label>
                    ))}
                  </LabelGroup>
                )}
                {clusterFilter.length > 0 && (
                  <LabelGroup categoryName="Cluster">
                    {clusterFilter.map(c => (
                      <Label key={c} variant="outline" onClose={() => {
                        const newFilter = clusterFilter.filter(x => x !== c);
                        setClusterFilter(newFilter);
                        // Also clear the in-card view states if this was the selected cluster
                        if (newFilter.length === 0) {
                          setSelectedClusterInCard(null);
                          setClusterCardView('all-clusters');
                          setSelectedClusterForAlerts(null);
                          setFiringAlertsCardView('all-clusters');
                        }
                      }}>{c}</Label>
                    ))}
                  </LabelGroup>
                )}
                {namespaceFilter.length > 0 && (
                  <LabelGroup categoryName="Namespace">
                    {namespaceFilter.map(n => (
                      <Label key={n} variant="outline" onClose={() => setNamespaceFilter(namespaceFilter.filter(x => x !== n))}>{n}</Label>
                    ))}
                  </LabelGroup>
                )}
                {labelFilter.length > 0 && (
                  <LabelGroup categoryName="Label">
                    {labelFilter.map(l => (
                      <Label key={l} variant="outline" onClose={() => setLabelFilter(labelFilter.filter(x => x !== l))}>{l}</Label>
                    ))}
                  </LabelGroup>
                )}
                {(triggeredFromDate || triggeredFromTime || triggeredToDate || triggeredToTime) && (
                  <LabelGroup categoryName="Triggered">
                    {(triggeredFromDate || triggeredFromTime) && (
                      <Label 
                        key="from" 
                        variant="outline" 
                        onClose={() => {
                          setTriggeredFromDate('');
                          setTriggeredFromTime('');
                        }}
                      >
                        From: {triggeredFromDate || 'today'} {triggeredFromTime || '00:00'}
                      </Label>
                    )}
                    {(triggeredToDate || triggeredToTime) && (
                      <Label 
                        key="to" 
                        variant="outline" 
                        onClose={() => {
                          setTriggeredToDate('');
                          setTriggeredToTime('');
                        }}
                      >
                        To: {triggeredToDate || 'today'} {triggeredToTime || '23:59'}
                      </Label>
                    )}
                  </LabelGroup>
                )}
                {mainComponentFilter && (
                  <LabelGroup categoryName="Component">
                    <Label variant="outline" onClose={() => setMainComponentFilter(null)}>{mainComponentFilter}</Label>
                  </LabelGroup>
                )}
                {mainAlertNameFilter && (
                  <LabelGroup categoryName="Alert">
                    <Label variant="outline" onClose={() => setMainAlertNameFilter(null)}>{mainAlertNameFilter}</Label>
                  </LabelGroup>
                )}
              </Flex>
            </FlexItem>
            {hasActiveFilters && (
            <FlexItem>
              <Flex gap={{ default: 'gapSm' }}>
                <FlexItem>
                  <Button variant="link" onClick={() => {
                    clearFilters();
                    setSelectedSavedFilter(null);
                  }}>
                    Clear filters
                  </Button>
                </FlexItem>
                <FlexItem>
                  <Button variant="link" onClick={() => setIsFilterPanelOpen(true)}>
                    Edit filters
                  </Button>
                </FlexItem>
                {selectedSavedFilter && (() => {
                  // Check if current filters differ from saved filter
                  const savedSeverity = selectedSavedFilter.filters.severity || [];
                  const savedGroup = selectedSavedFilter.filters.group || [];
                  const savedComponent = selectedSavedFilter.filters.component || [];
                  const savedSearchValue = selectedSavedFilter.filters.searchValue || '';
                  const savedRegion = selectedSavedFilter.filters.region || [];
                  const savedCluster = selectedSavedFilter.filters.cluster || [];
                  const savedNamespace = selectedSavedFilter.filters.namespace || [];
                  const savedLabel = selectedSavedFilter.filters.label || [];
                  
                  const hasChanges = 
                    JSON.stringify([...severityFilter].sort()) !== JSON.stringify([...savedSeverity].sort()) ||
                    JSON.stringify([...groupFilter].sort()) !== JSON.stringify([...savedGroup].sort()) ||
                    JSON.stringify([...componentFilter].sort()) !== JSON.stringify([...savedComponent].sort()) ||
                    JSON.stringify([...regionFilter].sort()) !== JSON.stringify([...savedRegion].sort()) ||
                    JSON.stringify([...clusterFilter].sort()) !== JSON.stringify([...savedCluster].sort()) ||
                    JSON.stringify([...namespaceFilter].sort()) !== JSON.stringify([...savedNamespace].sort()) ||
                    JSON.stringify([...labelFilter].sort()) !== JSON.stringify([...savedLabel].sort()) ||
                    searchValue !== savedSearchValue;
                  
                  return hasChanges ? (
                    <FlexItem>
                      <Button variant="link" onClick={() => {
                        // Update the existing saved filter with current filter values
                        const updatedFilters = { 
                          severity: severityFilter, 
                          group: groupFilter, 
                          component: componentFilter, 
                          source: [] as string[], 
                          searchValue,
                          region: regionFilter,
                          cluster: clusterFilter,
                          namespace: namespaceFilter,
                          label: labelFilter,
                        };
                        setSavedFilters(savedFilters.map(f => 
                          f.id === selectedSavedFilter.id 
                            ? { ...f, filters: updatedFilters } 
                            : f
                        ));
                        // Update the selected filter reference
                        setSelectedSavedFilter({
                          ...selectedSavedFilter,
                          filters: updatedFilters
                        });
                        addToast(`Filter "${selectedSavedFilter.name}" updated`, 'success');
                      }}>
                        Update saved filter
                      </Button>
                    </FlexItem>
                  ) : null;
                })()}
                <FlexItem>
                  <Button variant="link" onClick={() => {
                    setNewFilterName('');
                    setIsSaveFilterModalOpen(true);
                  }}>
                    Add to saved filters
                  </Button>
                </FlexItem>
              </Flex>
            </FlexItem>
            )}
            </Flex>
        </div>
        )}
          </div>
        )}

      </div>
      )}
      {/* End Sticky Header Section */}

      {/* Scrollable Content Area - Fleet Overview - Clusters Health Sub-tab */}
      {mainPageTab === 'alerts' && navigationView === 'fleet-overview' && alertsSubTab === 'clusters-health' && (
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {/* Filter Side Panel - Sticky */}
        {isFilterPanelOpen && (
          <div style={{ 
            width: window.innerWidth < 1080 ? '320px' : '280px', 
            minWidth: window.innerWidth < 1080 ? '320px' : '280px', 
            flexShrink: 0, 
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '4px',
            borderRight: '1px solid var(--pf-t--global--border--color--default, #d2d2d2)',
          }}>
            <FilterPanel
              regionFilter={regionFilter}
              setRegionFilter={setRegionFilter}
              clusterFilter={clusterFilter}
              setClusterFilter={setClusterFilter}
              namespaceFilter={namespaceFilter}
              setNamespaceFilter={setNamespaceFilter}
              labelFilter={labelFilter}
              setLabelFilter={setLabelFilter}
              severityFilter={severityFilter}
              setSeverityFilter={setSeverityFilter}
              groupFilter={groupFilter}
              setGroupFilter={setGroupFilter}
              componentFilter={componentFilter}
              setComponentFilter={setComponentFilter}
              regions={regions}
              clusterNames={clusterNames}
              clusters={mockClusters}
              namespaces={namespaces}
              availableLabels={availableLabels}
              regionCounts={regionCounts}
              clusterCounts={clusterCounts}
              namespaceCounts={namespaceCounts}
              onClose={() => setIsFilterPanelOpen(false)}
              savedFilters={savedFilters}
              onApplySavedFilter={(filter) => {
                setSeverityFilter(filter.filters.severity);
                setGroupFilter(filter.filters.group);
                setComponentFilter(filter.filters.component);
              }}
              onSaveFilter={(name) => {
                const newFilter: SavedFilter = {
                  id: `sf-${Date.now()}`,
                  name,
                  filters: { severity: severityFilter, group: groupFilter, component: componentFilter, source: [], searchValue },
                };
                setSavedFilters([...savedFilters, newFilter]);
              }}
              onDeleteSavedFilter={(id) => setSavedFilters(savedFilters.filter(f => f.id !== id))}
              alertsSubTab="clusters-health"
            />
          </div>
        )}

        {/* Main Content Area - Scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            <Stack hasGutter style={{ gap: '16px' }}>
              {/* Cluster Overview Card */}
              <StackItem>
                <div ref={clusterCardRef}>
                <Card>
                  <CardHeader>
                    <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                      <FlexItem>
                        {clusterCardView === 'all-clusters' ? (
                          <CardTitle>Clusters Fleet alerts overview</CardTitle>
                        ) : (
                          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                            <FlexItem>
                              <Button 
                                variant="link" 
                                isInline 
                                onClick={handleBackToAllClusters}
                                icon={<ArrowLeftIcon />}
                              >
                                All clusters
                              </Button>
                            </FlexItem>
                            <FlexItem>
                              <CardTitle>{selectedClusterInCard?.name} - Components Health</CardTitle>
                            </FlexItem>
                          </Flex>
                        )}
                      </FlexItem>
                      {clusterCardView === 'all-clusters' && (
                      <FlexItem>
                        <Flex gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsCenter' }}>
                          {/* Group By - shown for both views, disabled for Table */}
                          <FlexItem>
                            <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                              <label style={{ 
                                color: viewMode === 'summary' ? 'var(--pf-t--global--text--color--disabled)' : 'var(--pf-t--global--text--color--regular)', 
                                fontSize: 'var(--pf-t--global--font--size--sm)', 
                                fontWeight: 'var(--pf-t--global--font--weight--body--default)',
                                lineHeight: '36px',
                                textAlign: 'center'
                              }}>Group by</label>
                              <Select
                                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                  <MenuToggle 
                                    ref={toggleRef} 
                                    onClick={() => viewMode !== 'summary' && setIsGroupByOpen(!isGroupByOpen)} 
                                    isExpanded={isGroupByOpen} 
                                    isDisabled={viewMode === 'summary'}
                                    style={{ width: '140px' }}
                                  >
                                    {groupBy === 'none' ? 'None' : groupBy === 'cloudProvider' ? 'Provider' : groupBy === 'environment' ? 'Environment' : groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}
                                  </MenuToggle>
                                )}
                                onSelect={(_, value) => { 
                                  if (value === 'environment-settings') {
                                    setTempEnvironmentCategories([...environmentCategories]);
                                    setNewPatternInputs({});
                                    setIsEnvironmentSettingsOpen(true);
                                    setIsGroupByOpen(false);
                                  } else {
                                    setGroupBy(value as GroupByOption); 
                                    setIsGroupByOpen(false);
                                  }
                                }}
                                isOpen={isGroupByOpen}
                                onOpenChange={setIsGroupByOpen}
                                selected={groupBy}
                              >
                                <SelectList>
                                  <SelectOption value="none">None</SelectOption>
                                  <SelectOption value="region">Region</SelectOption>
                                  <SelectOption value="cloudProvider">Cloud Provider</SelectOption>
                                  <SelectOption value="team">
                                    <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                      <FlexItem>Team</FlexItem>
                                      <FlexItem>
                                        <Button
                                          variant="plain"
                                          size="sm"
                                          icon={<EditAltIcon />}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setTempTeamCategories([...teamCategories]);
                                            setNewTeamPatternInputs({});
                                            setIsTeamSettingsOpen(true);
                                            setIsGroupByOpen(false);
                                          }}
                                          aria-label="Configure team settings"
                                        />
                                      </FlexItem>
                                    </Flex>
                                  </SelectOption>
                                  <SelectOption value="severity">Severity</SelectOption>
                                  <SelectOption value="environment">
                                    <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                      <FlexItem>Environment</FlexItem>
                                      <FlexItem>
                                        <Button
                                          variant="plain"
                                          size="sm"
                                          icon={<EditAltIcon />}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setTempEnvironmentCategories([...environmentCategories]);
                                            setNewPatternInputs({});
                                            setIsEnvironmentSettingsOpen(true);
                                            setIsGroupByOpen(false);
                                          }}
                                          aria-label="Configure environment settings"
                                        />
                                      </FlexItem>
                                    </Flex>
                                  </SelectOption>
                                </SelectList>
                              </Select>
                            </Flex>
                          </FlexItem>

                          {/* Size By - shown for both views, disabled for Table */}
                          <FlexItem>
                            <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                              <label style={{ 
                                color: viewMode === 'summary' ? 'var(--pf-t--global--text--color--disabled)' : 'var(--pf-t--global--text--color--regular)', 
                                fontSize: 'var(--pf-t--global--font--size--sm)', 
                                fontWeight: 'var(--pf-t--global--font--weight--body--default)',
                                lineHeight: '36px',
                                textAlign: 'center'
                              }}>Size by</label>
                              <Select
                                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                  <MenuToggle 
                                    ref={toggleRef} 
                                    onClick={() => { if (viewMode !== 'summary') { setIsSizeByOpen(!isSizeByOpen); } }} 
                                    isExpanded={isSizeByOpen} 
                                    isDisabled={viewMode === 'summary'}
                                    style={{ width: '200px' }}
                                  >
                                    {sizeByOptions.find(o => o.value === importanceSizing)?.label || 'Number of Nodes'}
                                  </MenuToggle>
                                )}
                                onSelect={(_, value) => { 
                                  if (value) {
                                    setImportanceSizing(value as ImportanceSizing); 
                                  }
                                  setIsSizeByOpen(false); 
                                }}
                                isOpen={isSizeByOpen}
                                onOpenChange={(isOpen) => setIsSizeByOpen(isOpen)}
                                selected={importanceSizing}
                              >
                                <SelectList>
                                  {sizeByOptions.map(opt => (
                                    <SelectOption key={opt.value} value={opt.value}>{opt.label}</SelectOption>
                                  ))}
                                </SelectList>
                              </Select>
                            </Flex>
                          </FlexItem>

                          {/* Sort By - for both views */}
                          <FlexItem>
                            <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                              <label style={{ 
                                color: 'var(--pf-t--global--text--color--regular)', 
                                fontSize: 'var(--pf-t--global--font--size--sm)', 
                                fontWeight: 'var(--pf-t--global--font--weight--body--default)',
                                lineHeight: '36px',
                                textAlign: 'center'
                              }}>Sort by</label>
                              <Select
                                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                  <MenuToggle ref={toggleRef} onClick={() => setIsSortByOpen(!isSortByOpen)} isExpanded={isSortByOpen} style={{ width: '140px' }}>
                                    {sortBy === 'severity' ? 'Severity' : sortBy === 'alertCount' ? 'Alert Count' : 'Cluster Name'}
                                  </MenuToggle>
                                )}
                                onSelect={(_, value) => { 
                                  if (value) {
                                    setSortBy(value as SortByOption); 
                                  }
                                  setIsSortByOpen(false); 
                                }}
                                isOpen={isSortByOpen}
                                onOpenChange={(isOpen) => setIsSortByOpen(isOpen)}
                                selected={sortBy}
                              >
                                <SelectList>
                                  <SelectOption value="severity">Severity</SelectOption>
                                  <SelectOption value="alertCount">Alert Count</SelectOption>
                                  <SelectOption value="clusterName">Cluster Name</SelectOption>
                                </SelectList>
                              </Select>
                            </Flex>
                          </FlexItem>

                          {/* View Toggle - moved to the end */}
                          <FlexItem>
                            <ToggleGroup>
                              <ToggleGroupItem
                                icon={<ThLargeIcon />}
                                text="Treemap"
                                aria-label="Treemap view"
                                isSelected={viewMode === 'treemap'}
                                onChange={() => setViewMode('treemap')}
                              />
                              <ToggleGroupItem
                                icon={<ListIcon />}
                                text="Table"
                                aria-label="Table view"
                                isSelected={viewMode === 'summary'}
                                onChange={() => setViewMode('summary')}
                              />
                            </ToggleGroup>
                          </FlexItem>
                        </Flex>
                      </FlexItem>
                      )}
                    </Flex>
                  </CardHeader>
                  <Divider />
                  {/* Fleet Health Summary Metrics */}
                  <div style={{ 
                    padding: '12px 16px'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '24px',
                      flexWrap: 'wrap'
                    }}>
                      <Tooltip content={`Clusters: ${filteredClusters.length} - ${Math.floor(Math.random() * 10) + 1}% more from last day`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'help' }}>
                          <Icon><CubesIcon /></Icon>
                          <span style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '13px' }}>Clusters</span>
                          <strong style={{ fontSize: '16px' }}>{filteredClusters.length}</strong>
                        </div>
                      </Tooltip>
                      <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--pf-t--global--border--color--default)' }} />
                      <Tooltip content={`Firing alerts: ${totalAlerts} - ${Math.floor(Math.random() * 20) - 10}% ${Math.floor(Math.random() * 20) - 10 > 0 ? 'more' : 'less'} from last day`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'help' }}>
                          <Icon><BellIcon /></Icon>
                          <span style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '13px' }}>Firing</span>
                          <strong style={{ fontSize: '16px' }}>{totalAlerts}</strong>
                        </div>
                      </Tooltip>
                      <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--pf-t--global--border--color--default)' }} />
                      <Tooltip content={`Critical: ${criticalAlerts} - Click to filter`}>
                        <div 
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                          onClick={() => {
                            if (!severityFilter.includes('Critical')) {
                              setSeverityFilter([...severityFilter, 'Critical']);
                            }
                          }}
                        >
                          <Icon status="danger"><ExclamationCircleIcon /></Icon>
                          <span style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '13px' }}>Critical</span>
                          <strong style={{ fontSize: '16px', color: 'var(--pf-t--global--color--status--danger--default)' }}>{criticalAlerts}</strong>
                        </div>
                      </Tooltip>
                      <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--pf-t--global--border--color--default)' }} />
                      <Tooltip content={`Warning: ${warningAlerts} - Click to filter`}>
                        <div 
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                          onClick={() => {
                            if (!severityFilter.includes('Warning')) {
                              setSeverityFilter([...severityFilter, 'Warning']);
                            }
                          }}
                        >
                          <Icon status="warning"><ExclamationTriangleIcon /></Icon>
                          <span style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '13px' }}>Warning</span>
                          <strong style={{ fontSize: '16px', color: 'var(--pf-t--global--color--status--warning--default)' }}>{warningAlerts}</strong>
                        </div>
                      </Tooltip>
                      <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--pf-t--global--border--color--default)' }} />
                      <Tooltip content={`Info: ${infoAlerts} - Click to filter`}>
                        <div 
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                          onClick={() => {
                            if (!severityFilter.includes('Info')) {
                              setSeverityFilter([...severityFilter, 'Info']);
                            }
                          }}
                        >
                          <Icon status="info"><InfoCircleIcon /></Icon>
                          <span style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '13px' }}>Info</span>
                          <strong style={{ fontSize: '16px', color: 'var(--pf-t--global--color--status--info--default)' }}>{infoAlerts}</strong>
                        </div>
                      </Tooltip>
                      <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--pf-t--global--border--color--default)' }} />
                      <Tooltip content={`Healthy: ${healthyClusters} - ${Math.floor(Math.random() * 5) + 1}% more from last day`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'help' }}>
                          <Icon status="success"><CheckCircleIcon /></Icon>
                          <span style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '13px' }}>Healthy</span>
                          <strong style={{ fontSize: '16px', color: 'var(--pf-t--global--color--status--success--default)' }}>{healthyClusters}</strong>
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                  <Divider />
                  <CardBody>
                    {clusterCardView === 'single-cluster-components' && selectedClusterInCard ? (
                      /* Single Cluster Components View */
                      <div>
                        {/* Cluster Details Summary */}
                        {(() => {
                          const firingAlerts = selectedClusterInCard.alerts.filter(a => a.status === 'firing');
                          const criticalCount = firingAlerts.filter(a => a.severity === 'Critical').length;
                          const warningCount = firingAlerts.filter(a => a.severity === 'Warning').length;
                          const infoCount = firingAlerts.filter(a => a.severity === 'Info').length;
                          const healthStatus = criticalCount > 0 ? 'Critical' : warningCount > 0 ? 'Warning' : 'Healthy';
                          const healthColor = criticalCount > 0 ? 'red' : warningCount > 0 ? 'orange' : 'green';
                          const healthIcon = criticalCount > 0 ? <ExclamationCircleIcon /> : warningCount > 0 ? <ExclamationTriangleIcon /> : <CheckCircleIcon />;
                          
                          // ACM Status config
                          const acmStatusConfig: Record<ACMClusterStatus, { color: 'green' | 'red' | 'orange' | 'blue' | 'grey'; icon: React.ReactNode; }> = {
                            'Ready': { color: 'green', icon: <CheckCircleIcon /> },
                            'Offline': { color: 'red', icon: <ExclamationCircleIcon /> },
                            'Failed': { color: 'red', icon: <ExclamationCircleIcon /> },
                            'Pending Import': { color: 'blue', icon: <ClockIcon /> },
                            'Installing': { color: 'blue', icon: <SyncIcon /> },
                            'Degraded': { color: 'orange', icon: <ExclamationTriangleIcon /> },
                            'Hibernating': { color: 'grey', icon: <PauseCircleIcon /> },
                            'Unknown': { color: 'grey', icon: <QuestionCircleIcon /> },
                            'Detaching': { color: 'orange', icon: <SyncIcon /> },
                          };
                          const statusConfig = acmStatusConfig[selectedClusterInCard.acmStatus] || acmStatusConfig['Unknown'];
                          
                          return (
                            <div style={{ 
                              backgroundColor: 'var(--pf-t--global--background--color--secondary--default)', 
                              padding: '16px', 
                              borderRadius: '8px', 
                              marginBottom: '16px' 
                            }}>
                              <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsFlexStart' }}>
                                <FlexItem>
                                  <Stack hasGutter>
                                    <StackItem>
                                      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                                        <FlexItem>
                                          <Title headingLevel="h3">{selectedClusterInCard.name}</Title>
                                        </FlexItem>
                                        <FlexItem>
                                          <Label color={statusConfig.color} icon={statusConfig.icon} isCompact>
                                            {selectedClusterInCard.acmStatus}
                                          </Label>
                                        </FlexItem>
                                      </Flex>
                                    </StackItem>
                                    <StackItem>
                                      <Flex gap={{ default: 'gapLg' }}>
                                        <FlexItem>
                                          <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                                            Region: <strong>{selectedClusterInCard.region}</strong>
                                          </Content>
                                        </FlexItem>
                                        <FlexItem>
                                          <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                                            Nodes: <strong>{selectedClusterInCard.nodeCount}</strong>
                                          </Content>
                                        </FlexItem>
                                        <FlexItem>
                                          <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                                            Pods: <strong>{selectedClusterInCard.podCount || Math.floor(Math.random() * 500) + 100}</strong>
                                          </Content>
                                        </FlexItem>
                                      </Flex>
                                    </StackItem>
                                  </Stack>
                                </FlexItem>
                                <FlexItem>
                                  <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsFlexEnd' }} gap={{ default: 'gapSm' }}>
                                    <FlexItem>
                                      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                        <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>Health:</Content>
                                        <Label color={healthColor} icon={healthIcon}>{healthStatus}</Label>
                                      </Flex>
                                    </FlexItem>
                                    <FlexItem>
                                      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                        <Badge>{firingAlerts.length} alerts</Badge>
                                        {criticalCount > 0 && <Label color="red" isCompact icon={<ExclamationCircleIcon />}>{criticalCount}</Label>}
                                        {warningCount > 0 && <Label color="orange" isCompact icon={<ExclamationTriangleIcon />}>{warningCount}</Label>}
                                        {infoCount > 0 && <Label color="blue" isCompact icon={<InfoCircleIcon />}>{infoCount}</Label>}
                                        {firingAlerts.length === 0 && <Label color="green" isCompact icon={<CheckCircleIcon />}>Healthy</Label>}
                                      </Flex>
                                    </FlexItem>
                                  </Flex>
                                </FlexItem>
                              </Flex>
                            </div>
                          );
                        })()}
                        
                        {/* Alert Scopes - Cluster and Namespace */}
                        <Grid hasGutter>
                          {/* Cluster Components */}
                          <GridItem span={6}>
                            <Card isCompact>
                              <CardHeader>
                                <CardTitle>
                                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                    <FlexItem><Icon status="info"><CubesIcon /></Icon></FlexItem>
                                    <FlexItem>
                                      <span>Alert scope: Cluster</span>
                                    </FlexItem>
                                  </Flex>
                                </CardTitle>
                              </CardHeader>
                              <CardBody>
                                <Content component="small" style={{ marginBottom: '12px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                                  Alerts related to the health and stability of the cluster's control plane, including API server, etcd, and scheduler.
                                </Content>
                                <Stack hasGutter>
                                  {(() => {
                                    const clusterAlerts = selectedClusterInCard.alerts.filter(
                                      a => a.status === 'firing' && a.group === 'Cluster'
                                    );
                                    // Group alerts by component and calculate severity counts
                                    const componentStats: Record<string, { count: number; critical: number; warning: number; info: number }> = {};
                                    clusterAlerts.forEach(alert => {
                                      if (!componentStats[alert.component]) {
                                        componentStats[alert.component] = { count: 0, critical: 0, warning: 0, info: 0 };
                                      }
                                      componentStats[alert.component].count++;
                                      if (alert.severity === 'Critical') componentStats[alert.component].critical++;
                                      else if (alert.severity === 'Warning') componentStats[alert.component].warning++;
                                      else componentStats[alert.component].info++;
                                    });
                                    
                                    // Sort by severity: Critical first, then Warning, then Info, then by count
                                    const components = Object.entries(componentStats).sort((a, b) => {
                                      // Priority: components with Critical > Warning > Info
                                      if (a[1].critical !== b[1].critical) return b[1].critical - a[1].critical;
                                      if (a[1].warning !== b[1].warning) return b[1].warning - a[1].warning;
                                      if (a[1].info !== b[1].info) return b[1].info - a[1].info;
                                      return b[1].count - a[1].count;
                                    });
                                    
                                    if (components.length === 0) {
                                      return (
                                        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                          <Icon status="success"><CheckCircleIcon /></Icon>
                                          <span>No cluster component alerts</span>
                                        </Flex>
                                      );
                                    }
                                    
                                    return components.map(([component, stats]) => {
                                      const criticalCount = stats.critical;
                                      const warningCount = stats.warning;
                                      const healthColor = criticalCount > 0 ? 'red' : warningCount > 0 ? 'orange' : 'blue';
                                      const healthIcon = criticalCount > 0 ? <ExclamationCircleIcon /> : warningCount > 0 ? <ExclamationTriangleIcon /> : <InfoCircleIcon />;
                                      
                                      return (
                                        <Button
                                          key={component}
                                          variant="link"
                                          isBlock
                                          style={{ textAlign: 'left', padding: '8px 12px', border: '1px solid var(--pf-t--global--border--color--default)', borderRadius: '4px' }}
                                          onClick={() => handleComponentClickInCard(selectedClusterInCard, component as AlertComponent)}
                                        >
                                          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                                            <FlexItem>
                                              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                                <Icon status={criticalCount > 0 ? 'danger' : warningCount > 0 ? 'warning' : 'info'}>{healthIcon}</Icon>
                                                <span>{component}</span>
                                              </Flex>
                                            </FlexItem>
                                            <FlexItem>
                                              <Flex gap={{ default: 'gapSm' }}>
                                                {criticalCount > 0 && <Label color="red" isCompact>{criticalCount} Critical</Label>}
                                                {warningCount > 0 && <Label color="orange" isCompact>{warningCount} Warning</Label>}
                                              </Flex>
                                            </FlexItem>
                                          </Flex>
                                        </Button>
                                      );
                                    });
                                  })()}
                                </Stack>
                              </CardBody>
                            </Card>
                          </GridItem>
                          
                          {/* Namespace Components */}
                          <GridItem span={6}>
                            <Card isCompact>
                              <CardHeader>
                                <CardTitle>
                                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                    <FlexItem><Icon status="info"><CubeIcon /></Icon></FlexItem>
                                    <FlexItem>
                                      <span>Alert scope: Namespace</span>
                                    </FlexItem>
                                  </Flex>
                                </CardTitle>
                              </CardHeader>
                              <CardBody>
                                <Content component="small" style={{ marginBottom: '12px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                                  Alerts focused on user applications and services, reporting on pod crashes, replica mismatches, and resource quota violations.
                                </Content>
                                <Stack hasGutter>
                                  {(() => {
                                    const namespaceAlerts = selectedClusterInCard.alerts.filter(
                                      a => a.status === 'firing' && a.group === 'Namespace'
                                    );
                                    // Group alerts by component and calculate severity counts
                                    const componentStats: Record<string, { count: number; critical: number; warning: number; info: number }> = {};
                                    namespaceAlerts.forEach(alert => {
                                      if (!componentStats[alert.component]) {
                                        componentStats[alert.component] = { count: 0, critical: 0, warning: 0, info: 0 };
                                      }
                                      componentStats[alert.component].count++;
                                      if (alert.severity === 'Critical') componentStats[alert.component].critical++;
                                      else if (alert.severity === 'Warning') componentStats[alert.component].warning++;
                                      else componentStats[alert.component].info++;
                                    });
                                    
                                    // Sort by severity: Critical first, then Warning, then Info, then by count
                                    const components = Object.entries(componentStats).sort((a, b) => {
                                      // Priority: components with Critical > Warning > Info
                                      if (a[1].critical !== b[1].critical) return b[1].critical - a[1].critical;
                                      if (a[1].warning !== b[1].warning) return b[1].warning - a[1].warning;
                                      if (a[1].info !== b[1].info) return b[1].info - a[1].info;
                                      return b[1].count - a[1].count;
                                    });
                                    
                                    if (components.length === 0) {
                                      return (
                                        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                          <Icon status="success"><CheckCircleIcon /></Icon>
                                          <span>No namespace component alerts</span>
                                        </Flex>
                                      );
                                    }
                                    
                                    return components.map(([component, stats]) => {
                                      const criticalCount = stats.critical;
                                      const warningCount = stats.warning;
                                      const healthColor = criticalCount > 0 ? 'red' : warningCount > 0 ? 'orange' : 'blue';
                                      const healthIcon = criticalCount > 0 ? <ExclamationCircleIcon /> : warningCount > 0 ? <ExclamationTriangleIcon /> : <InfoCircleIcon />;
                                      
                                      return (
                                        <Button
                                          key={component}
                                          variant="link"
                                          isBlock
                                          style={{ textAlign: 'left', padding: '8px 12px', border: '1px solid var(--pf-t--global--border--color--default)', borderRadius: '4px' }}
                                          onClick={() => handleComponentClickInCard(selectedClusterInCard, component as AlertComponent)}
                                        >
                                          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                                            <FlexItem>
                                              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                                <Icon status={criticalCount > 0 ? 'danger' : warningCount > 0 ? 'warning' : 'info'}>{healthIcon}</Icon>
                                                <span>{component}</span>
                                              </Flex>
                                            </FlexItem>
                                            <FlexItem>
                                              <Flex gap={{ default: 'gapSm' }}>
                                                {criticalCount > 0 && <Label color="red" isCompact>{criticalCount} Critical</Label>}
                                                {warningCount > 0 && <Label color="orange" isCompact>{warningCount} Warning</Label>}
                                              </Flex>
                                            </FlexItem>
                                          </Flex>
                                        </Button>
                                      );
                                    });
                                  })()}
                                </Stack>
                              </CardBody>
                            </Card>
                          </GridItem>
                        </Grid>
                      </div>
                    ) : viewMode === 'treemap' ? (
                      <TreemapHeatmap
                        key={`treemap-${importanceSizing}-${groupBy}-${sortBy}-${sortedClusters.length}-${clusterFilter.join(',')}`}
                        clusters={sortedClusters}
                        groupBy={groupBy}
                        importanceSizing={importanceSizing}
                        severityFilter={severityFilter}
                        onDrillDown={handleDrillDown}
                        activeLegendFilters={treemapLegendFilters}
                        environmentCategories={environmentCategories}
                        teamCategories={teamCategories}
                        onLegendClick={(status) => {
                          setTreemapLegendFilters(prev => {
                            if (prev.includes(status)) {
                              // Remove from filter
                              const newFilters = prev.filter(s => s !== status);
                              return newFilters;
                            } else {
                              // Add to filter (or start fresh if empty)
                              return [...prev, status];
                            }
                          });
                        }}
                      />
                    ) : (
                      /* Table View */
                      <Table aria-label="Clusters table">
                        <Thead>
                          <Tr>
                            <Th 
                              sort={{
                                sortBy: { index: activeSortIndex || 0, direction: activeSortDirection },
                                onSort: (_event, index, direction) => {
                                  setActiveSortIndex(index);
                                  setActiveSortDirection(direction);
                                },
                                columnIndex: 0
                              }}
                            >
                              Cluster Status
                            </Th>
                            <Th 
                              sort={{
                                sortBy: { index: activeSortIndex || 0, direction: activeSortDirection },
                                onSort: (_event, index, direction) => {
                                  setActiveSortIndex(index);
                                  setActiveSortDirection(direction);
                                },
                                columnIndex: 1
                              }}
                            >
                              Cluster
                            </Th>
                            <Th 
                              sort={{
                                sortBy: { index: activeSortIndex || 0, direction: activeSortDirection },
                                onSort: (_event, index, direction) => {
                                  setActiveSortIndex(index);
                                  setActiveSortDirection(direction);
                                },
                                columnIndex: 2
                              }}
                            >
                              Region
                            </Th>
                            <Th 
                              sort={{
                                sortBy: { index: activeSortIndex || 0, direction: activeSortDirection },
                                onSort: (_event, index, direction) => {
                                  setActiveSortIndex(index);
                                  setActiveSortDirection(direction);
                                },
                                columnIndex: 3
                              }}
                            >
                              Total Alerts
                            </Th>
                            <Th 
                              sort={{
                                sortBy: { index: activeSortIndex || 0, direction: activeSortDirection },
                                onSort: (_event, index, direction) => {
                                  setActiveSortIndex(index);
                                  setActiveSortDirection(direction);
                                },
                                columnIndex: 4
                              }}
                            >
                              Severity Breakdown
                            </Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {sortedClusters.slice((page - 1) * perPage, page * perPage).map(cluster => {
                            const firingAlerts = cluster.alerts.filter(a => a.status === 'firing');
                            const criticalCount = firingAlerts.filter(a => a.severity === 'Critical').length;
                            const warningCount = firingAlerts.filter(a => a.severity === 'Warning').length;
                            const infoCount = firingAlerts.filter(a => a.severity === 'Info').length;
                            // ACM Cluster Status configuration with colors and icons
                            const acmStatusConfig: Record<ACMClusterStatus, { 
                              color: 'green' | 'red' | 'orange' | 'blue' | 'grey'; 
                              icon: React.ReactNode; 
                              description: string 
                            }> = {
                              'Ready': { 
                                color: 'green', 
                                icon: <CheckCircleIcon />, 
                                description: 'The cluster is online, agents are reporting, and the hub can manage it.' 
                              },
                              'Offline': { 
                                color: 'red', 
                                icon: <ExclamationCircleIcon />, 
                                description: 'The hub cannot reach the managed cluster. This is critical for connectivity.' 
                              },
                              'Failed': { 
                                color: 'red', 
                                icon: <ExclamationCircleIcon />, 
                                description: 'An operation (creation, import, or destroy) failed to complete.' 
                              },
                              'Pending Import': { 
                                color: 'blue', 
                                icon: <ClockIcon />, 
                                description: 'The cluster definition exists, but the import command hasn\'t been applied yet.' 
                              },
                              'Installing': { 
                                color: 'blue', 
                                icon: <SyncIcon />, 
                                description: 'The cluster is currently being provisioned by the Hive operator.' 
                              },
                              'Degraded': { 
                                color: 'orange', 
                                icon: <ExclamationTriangleIcon />, 
                                description: 'The cluster is reachable, but some core operators or services are failing.' 
                              },
                              'Hibernating': { 
                                color: 'grey', 
                                icon: <PauseCircleIcon />, 
                                description: 'The cluster is powered off (stopped) to save costs on cloud providers.' 
                              },
                              'Unknown': { 
                                color: 'grey', 
                                icon: <QuestionCircleIcon />, 
                                description: 'The status cannot be determined, often during an agent update or hub restart.' 
                              },
                              'Detaching': { 
                                color: 'orange', 
                                icon: <SyncIcon />, 
                                description: 'The cluster is in the process of being removed from ACM management.' 
                              },
                            };
                            
                            const statusConfig = acmStatusConfig[cluster.acmStatus] || acmStatusConfig['Unknown'];
                            
                            return (
                              <Tr key={cluster.id} isClickable onRowClick={() => handleDrillDown(cluster)}>
                                <Td>
                                  <Tooltip content={statusConfig.description}>
                                    <Label 
                                      color={statusConfig.color}
                                      icon={statusConfig.icon}
                                      isCompact
                                    >
                                      {cluster.acmStatus}
                                    </Label>
                                  </Tooltip>
                                </Td>
                                <Td>
                                  <strong>{cluster.name}</strong>
                                </Td>
                                <Td>{cluster.region}</Td>
                                <Td>
                                  <Badge>{firingAlerts.length}</Badge>
                                </Td>
                                <Td>
                                  <Flex gap={{ default: 'gapSm' }}>
                                    {criticalCount > 0 && <FlexItem><Label color="red" isCompact icon={<ExclamationCircleIcon />}>{criticalCount}</Label></FlexItem>}
                                    {warningCount > 0 && <FlexItem><Label color="orange" isCompact icon={<ExclamationTriangleIcon />}>{warningCount}</Label></FlexItem>}
                                    {infoCount > 0 && <FlexItem><Label color="purple" isCompact icon={<InfoCircleIcon />}>{infoCount}</Label></FlexItem>}
                                    {firingAlerts.length === 0 && <FlexItem><Label color="green" isCompact icon={<CheckCircleIcon />}>Healthy</Label></FlexItem>}
                                  </Flex>
                                </Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    )}
                  </CardBody>
                  {viewMode === 'summary' && (
                    <CardFooter>
                      <Pagination
                        itemCount={sortedClusters.length}
                        perPage={perPage}
                        page={page}
                        onSetPage={(_, p) => setPage(p)}
                        onPerPageSelect={(_, pp) => setPerPage(pp)}
                        isCompact
                      />
                    </CardFooter>
                  )}
                </Card>
                </div>
              </StackItem>

              {/* Cross-Cluster Insights Cards */}
              <CrossClusterInsightsCards
                clusters={filteredClusters}
                onAlertRuleClick={(alertName) => {
                  setMainAlertNameFilter(alertName);
                  setAlertsSubTabState('firing-alerts');
                  // Update URL with tab and alert name params
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('tab', 'firing-alerts');
                  newParams.set('alertName', alertName);
                  navigate(`?${newParams.toString()}`, { replace: false });
                  // Trigger animation to highlight the filtered view
                  setShowFilterAnimation(true);
                  setTimeout(() => setShowFilterAnimation(false), 1500);
                }}
                onComponentClick={(componentName) => {
                  setMainComponentFilter(componentName);
                  setAlertsSubTabState('firing-alerts');
                  // Update URL with tab and component params
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('tab', 'firing-alerts');
                  newParams.set('component', componentName);
                  navigate(`?${newParams.toString()}`, { replace: false });
                  // Trigger animation to highlight the filtered view
                  setShowFilterAnimation(true);
                  setTimeout(() => setShowFilterAnimation(false), 1500);
                }}
              />

              {/* Alerts Timeline Card - Last */}
              <StackItem>
                <AlertsTimelineCard trendData={mockTrendData} />
              </StackItem>
            </Stack>
          </div>
        </div>
      )}

      {/* V2: Scrollable Content Area - Fleet Overview - Firing Alerts Sub-tab */}
      {mainPageTab === 'alerts' && navigationView === 'fleet-overview' && alertsSubTab === 'firing-alerts' && (
        <Drawer isExpanded={isDrawerExpanded} position="end" style={{ flex: 1, minHeight: 0 }}>
          {/* Animation overlay for filtered view transition */}
          {showFilterAnimation && (
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'var(--pf-t--global--color--brand--default)',
                opacity: 0,
                pointerEvents: 'none',
                zIndex: 100,
                animation: 'filterFlash 1.5s ease-out',
              }}
            />
          )}
          <style>{`
            @keyframes filterFlash {
              0% { opacity: 0.15; }
              20% { opacity: 0.08; }
              100% { opacity: 0; }
            }
            @keyframes pulseHighlight {
              0% { box-shadow: 0 0 0 0 rgba(0, 102, 204, 0.4); }
              50% { box-shadow: 0 0 0 8px rgba(0, 102, 204, 0); }
              100% { box-shadow: 0 0 0 0 rgba(0, 102, 204, 0); }
            }
          `}</style>
          <DrawerContent panelContent={null}>
            <DrawerContentBody style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          {/* Filter Side Panel - Sticky */}
          {isFilterPanelOpen && (
            <div style={{ 
              width: window.innerWidth < 1080 ? '320px' : '280px', 
              minWidth: window.innerWidth < 1080 ? '320px' : '280px', 
              flexShrink: 0, 
              height: '100%',
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: '4px',
              borderRight: '1px solid var(--pf-t--global--border--color--default, #d2d2d2)',
            }}>
              <FilterPanel
                regionFilter={regionFilter}
                setRegionFilter={setRegionFilter}
                clusterFilter={clusterFilter}
                setClusterFilter={setClusterFilter}
                namespaceFilter={namespaceFilter}
                setNamespaceFilter={setNamespaceFilter}
                labelFilter={labelFilter}
                setLabelFilter={setLabelFilter}
                severityFilter={severityFilter}
                setSeverityFilter={setSeverityFilter}
                groupFilter={groupFilter}
                setGroupFilter={setGroupFilter}
                componentFilter={componentFilter}
                setComponentFilter={setComponentFilter}
                regions={regions}
                clusterNames={clusterNames}
                clusters={mockClusters}
                namespaces={namespaces}
                availableLabels={availableLabels}
                regionCounts={regionCounts}
                clusterCounts={clusterCounts}
                namespaceCounts={namespaceCounts}
                onClose={() => setIsFilterPanelOpen(false)}
                savedFilters={savedFilters}
                onApplySavedFilter={(filter) => {
                  setSeverityFilter(filter.filters.severity);
                  setGroupFilter(filter.filters.group);
                  setComponentFilter(filter.filters.component);
                }}
                onSaveFilter={(name) => {
                  const newFilter: SavedFilter = {
                    id: `sf-${Date.now()}`,
                    name,
                    filters: { severity: severityFilter, group: groupFilter, component: componentFilter, source: [], searchValue },
                  };
                  setSavedFilters([...savedFilters, newFilter]);
                }}
                onDeleteSavedFilter={(id) => setSavedFilters(savedFilters.filter(f => f.id !== id))}
                showAlertFilters={true}
                stateFilter={alertStateFilter}
                setStateFilter={setAlertStateFilter}
                sourceFilter={alertSourceFilter}
                setSourceFilter={setAlertSourceFilter}
                triggeredFromDate={triggeredFromDate}
                setTriggeredFromDate={setTriggeredFromDate}
                triggeredFromTime={triggeredFromTime}
                setTriggeredFromTime={setTriggeredFromTime}
                triggeredToDate={triggeredToDate}
                setTriggeredToDate={setTriggeredToDate}
                triggeredToTime={triggeredToTime}
                setTriggeredToTime={setTriggeredToTime}
                alertsSubTab="firing-alerts"
              />
            </div>
          )}

          {/* Main Content Area - Firing Alerts */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            <Stack hasGutter style={{ gap: '16px' }}>
              {/* Alerts Card */}
              <StackItem>
                {/* Header with back button when viewing single cluster */}
                <AllAlertsCard
                  showMetrics={firingAlertsCardView === 'all-clusters'}
                  totalAlerts={totalAlerts}
                  criticalAlerts={criticalAlerts}
                  warningAlerts={warningAlerts}
                  infoAlerts={infoAlerts}
                  healthyAlerts={healthyClusters}
                  affectedClusters={filteredClusters.filter(c => c.alerts.some(a => a.status === 'firing')).length}
                  onCriticalClick={() => {
                    if (!severityFilter.includes('Critical')) {
                      setSeverityFilter([...severityFilter, 'Critical']);
                    }
                  }}
                  onWarningClick={() => {
                    if (!severityFilter.includes('Warning')) {
                      setSeverityFilter([...severityFilter, 'Warning']);
                    }
                  }}
                  onInfoClick={() => {
                    if (!severityFilter.includes('Info')) {
                      setSeverityFilter([...severityFilter, 'Info']);
                    }
                  }}
                  clusters={firingAlertsCardView === 'single-cluster' && selectedClusterForAlerts 
                    ? [selectedClusterForAlerts] 
                    : filteredClusters}
                  alertNameFilter={mainAlertNameFilter}
                  componentFilter={mainComponentFilter}
                  groupFilter={groupFilter}
                  onClearAlertNameFilter={() => setMainAlertNameFilter(null)}
                  onClearComponentFilter={() => setMainComponentFilter(null)}
                  onClusterClick={handleClusterClickInAlerts}
                  onAlertClick={(alert, initialTab) => {
                    setSelectedAlertDetail(alert);
                    setIsDrawerExpanded(true);
                    setAlertDetailDrawerTab(initialTab !== undefined ? initialTab : 0);
                  }}
                  onAlertRuleClick={(alertName) => {
                    setMainPageTab('management');
                    setManagementSubTab('alert-rules');
                  }}
                  onComponentClick={(componentName) => {
                    setMainComponentFilter(componentName);
                  }}
                  singleClusterView={firingAlertsCardView === 'single-cluster'}
                  groupBy={alertsGroupBy}
                  onGroupByChange={setAlertsGroupBy}
                  triggeredFromDate={triggeredFromDate}
                  triggeredFromTime={triggeredFromTime}
                  triggeredToDate={triggeredToDate}
                  onClusterFilterChange={setClusterFilter}
                  onNamespaceFilterChange={setNamespaceFilter}
                  triggeredToTime={triggeredToTime}
                />
              </StackItem>
            </Stack>
          </div>
        </div>
            </DrawerContentBody>
          </DrawerContent>
        </Drawer>
      )}

      {/* V2: Alerts Tab - Cluster Components Health View (View B - Pivot Point) */}
      {mainPageTab === 'alerts' && navigationView === 'cluster-components' && selectedCluster && (
        <ClusterComponentsHealth
          cluster={selectedCluster}
          onComponentClick={handleComponentClick}
          onBackToFleet={handleBackToFleet}
          groupFilter={groupFilter}
        />
      )}

      {/* V2: Alerts Tab - Component Alerts View (View C - Destination) */}
      {mainPageTab === 'alerts' && navigationView === 'component-alerts' && selectedCluster && (
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          minHeight: 0, // Important for flex children to allow scrolling
          overflow: 'hidden',
        }}>
          {/* V2: Breadcrumb Navigation */}
          <div style={{ 
            padding: '16px 8px', 
            borderBottom: '1px solid var(--pf-t--global--border--color--default)',
            backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
            flexShrink: 0,
          }}>
            <Breadcrumb>
              <BreadcrumbItem>
                <Button variant="link" isInline onClick={handleBackToFleet}>
                  All Clusters (Treemap)
                </Button>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <Button variant="link" isInline onClick={handleBackToClusterComponents}>
                  {selectedCluster.name}
                </Button>
              </BreadcrumbItem>
              <BreadcrumbItem isActive>
                {selectedComponent || 'All Components'}
              </BreadcrumbItem>
            </Breadcrumb>
          </div>

          {/* Cluster Sub-Header - Fixed at top */}
          <div style={{ padding: '8px 8px 16px 8px', flexShrink: 0 }}>
            <Content component="p" style={{ fontSize: '14px', color: 'var(--pf-t--global--text--color--subtle)', margin: '0 0 4px 0' }}>
              {selectedComponent ? `${selectedComponent} alerts` : 'Cluster alerts'}
            </Content>
            <Title headingLevel="h2" size="xl" style={{ margin: '0 0 12px 0' }}>{selectedCluster.name}</Title>
            {/* Status Labels - Below the sub-header */}
            <Flex gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsCenter' }}>
              <FlexItem>
                <Label 
                  color={getClusterAlertStatus(selectedCluster) === 'healthy' ? 'green' : getClusterAlertStatus(selectedCluster) === 'critical' ? 'red' : getClusterAlertStatus(selectedCluster) === 'warning' ? 'orange' : 'purple'}
                  icon={getClusterAlertStatus(selectedCluster) === 'healthy' ? <CheckCircleIcon /> : getClusterAlertStatus(selectedCluster) === 'critical' ? <ExclamationCircleIcon /> : getClusterAlertStatus(selectedCluster) === 'warning' ? <ExclamationTriangleIcon /> : <InfoCircleIcon />}
                >
                  {getClusterAlertStatus(selectedCluster).charAt(0).toUpperCase() + getClusterAlertStatus(selectedCluster).slice(1)}
                </Label>
              </FlexItem>
              <FlexItem>
                <Label color="blue" icon={<CubesIcon />}>{selectedCluster.nodeCount} Nodes</Label>
              </FlexItem>
              <FlexItem>
                <Label variant="outline">{selectedCluster.region} • {selectedCluster.cloudProvider}</Label>
              </FlexItem>
              {selectedComponent && (
                <FlexItem>
                  <Label color="purple" icon={<CubeIcon />}>
                    Filtered: {selectedComponent}
                  </Label>
                </FlexItem>
              )}
            </Flex>
          </div>

          {/* Scrollable content area - flex container for drawer */}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            {/* Render the full drill-down content (drawer, table, modals) - includes Summary section */}
            {renderDrillDownContent()}
          </div>
        </div>
      )}

      {/* Incidents Tab Content */}
      {mainPageTab === 'incidents' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '0px 8px' }}>
          <Card>
            <CardBody>
              <EmptyState 
                titleText="Automated Incident Detection" 
                headingLevel="h4" 
                icon={PortIcon}
                variant="lg"
              >
                <EmptyStateBody>
                  Gain better visibility into your cluster health with automated incident detection. 
                  By installing the Red Hat OpenShift incident detection operator, you can use analytics 
                  to quickly identify and troubleshoot potential problems before they affect your users.
                </EmptyStateBody>
                <EmptyStateActions>
                  <Button variant="primary" icon={<PlusIcon />}>Install operator</Button>
                </EmptyStateActions>
              </EmptyState>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Management Tab Content */}
      {mainPageTab === 'management' && navigationView === 'fleet-overview' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '0px 8px' }}>
          <Stack hasGutter>
            <StackItem>
              {managementSubTab === 'alert-rules' && (
                <div style={{ display: 'flex', gap: '16px', paddingTop: '16px' }}>
                  {/* Filter Panel - Matching Alerts filter panel style */}
                  {isAlertRulesFilterPanelOpen && (
                    <div style={{ width: '280px', minWidth: '280px', maxWidth: '280px', flexShrink: 0 }}>
                      <Card>
                        <CardHeader>
                          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                            <FlexItem><CardTitle><FilterIcon /> Filters</CardTitle></FlexItem>
                            <FlexItem>
                              <Button variant="plain" onClick={() => setIsAlertRulesFilterPanelOpen(false)}><TimesIcon /></Button>
                            </FlexItem>
                          </Flex>
                        </CardHeader>
                        <CardBody>
                          <Stack hasGutter>
                            {/* Severity - Labels */}
                            <StackItem>
                              <Content component="small" className="pf-v6-u-mb-sm"><strong>Severity</strong></Content>
                              <Flex gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }}>
                                {(['Critical', 'Warning', 'Info'] as AlertSeverity[]).map(sev => (
                                  <FlexItem key={sev}>
                                    <Label
                                      color={getSeverityLabelColor(sev)}
                                      icon={getSeverityIcon(sev)}
                                      onClick={() => {
                                        if (alertRulesSeverityFilter.includes(sev)) {
                                          setAlertRulesSeverityFilter(alertRulesSeverityFilter.filter(s => s !== sev));
                                        } else {
                                          setAlertRulesSeverityFilter([...alertRulesSeverityFilter, sev]);
                                        }
                                      }}
                                      style={{ 
                                        cursor: 'pointer', 
                                        opacity: alertRulesSeverityFilter.length > 0 && !alertRulesSeverityFilter.includes(sev) ? 0.5 : 1,
                                        outline: alertRulesSeverityFilter.includes(sev) ? '2px solid var(--pf-t--global--border--color--clicked)' : 'none',
                                        outlineOffset: '1px'
                                      }}
                                    >
                                      {sev}
                                    </Label>
                                  </FlexItem>
                                ))}
                              </Flex>
                            </StackItem>
                            <Divider />
                            {/* Alert Scope - Checkboxes */}
                            <StackItem>
                              <Content component="small" className="pf-v6-u-mb-sm"><strong>Alert scope</strong></Content>
                              <Stack hasGutter>
                                {(['Cluster', 'Namespace'] as AlertGroup[]).map(grp => (
                                  <StackItem key={grp}>
                                    <Checkbox
                                      id={`ar-v2-grp-${grp}`}
                                      label={grp}
                                      isChecked={alertRulesGroupFilter.includes(grp)}
                                      onChange={(_, checked) => {
                                        if (checked) setAlertRulesGroupFilter([...alertRulesGroupFilter, grp]);
                                        else setAlertRulesGroupFilter(alertRulesGroupFilter.filter(g => g !== grp));
                                      }}
                                    />
                                  </StackItem>
                                ))}
                              </Stack>
                            </StackItem>
                            <Divider />
                            {/* Component - Dropdown */}
                            <StackItem>
                              <Content component="small" className="pf-v6-u-mb-sm"><strong>Affected component</strong></Content>
                              <Select
                                role="menu"
                                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                  <MenuToggle
                                    ref={toggleRef}
                                    onClick={() => setIsAlertRulesComponentDropdownOpen(!isAlertRulesComponentDropdownOpen)}
                                    isExpanded={isAlertRulesComponentDropdownOpen}
                                    style={{ width: '100%' }}
                                  >
                                    {alertRulesComponentFilter.length === 0 ? 'All components' : `${alertRulesComponentFilter.length} selected`}
                                  </MenuToggle>
                                )}
                                onSelect={(_, value) => {
                                  const comp = value as AlertComponent;
                                  if (alertRulesComponentFilter.includes(comp)) {
                                    setAlertRulesComponentFilter(alertRulesComponentFilter.filter(c => c !== comp));
                                  } else {
                                    setAlertRulesComponentFilter([...alertRulesComponentFilter, comp]);
                                  }
                                }}
                                isOpen={isAlertRulesComponentDropdownOpen}
                                onOpenChange={setIsAlertRulesComponentDropdownOpen}
                              >
                                <SelectList>
                                  {(['kube-apiserver', 'etcd', 'Storage', 'Network', 'Scheduler', 'Controller', 'Workload', 'Pod', 'Quota'] as AlertComponent[]).map(comp => (
                                    <SelectOption 
                                      key={comp} 
                                      value={comp}
                                      hasCheckbox
                                      isSelected={alertRulesComponentFilter.includes(comp)}
                                    >
                                      {comp}
                                    </SelectOption>
                                  ))}
                                </SelectList>
                              </Select>
                            </StackItem>
                            <Divider />
                            {/* State - Checkboxes */}
                            <StackItem>
                              <Content component="small" className="pf-v6-u-mb-sm"><strong>State</strong></Content>
                              <Stack hasGutter>
                                {(['Active', 'Reconciling', 'Partial success', 'Failed', 'Disabled'] as AlertRuleState[]).map(state => (
                                  <StackItem key={state}>
                                    <Checkbox
                                      id={`ar-v2-state-${state}`}
                                      label={state}
                                      isChecked={alertRulesStateFilter.includes(state)}
                                      onChange={(_, checked) => {
                                        if (checked) setAlertRulesStateFilter([...alertRulesStateFilter, state]);
                                        else setAlertRulesStateFilter(alertRulesStateFilter.filter(s => s !== state));
                                      }}
                                    />
                                  </StackItem>
                                ))}
                              </Stack>
                            </StackItem>
                            <Divider />
                            {/* Source - Checkboxes */}
                            <StackItem>
                              <Content component="small" className="pf-v6-u-mb-sm"><strong>Source</strong></Content>
                              <Stack hasGutter>
                                {(['User', 'Platform'] as AlertRuleSource[]).map(source => (
                                  <StackItem key={source}>
                                    <Checkbox
                                      id={`ar-v2-source-${source}`}
                                      label={source}
                                      isChecked={alertRulesSourceFilter.includes(source)}
                                      onChange={(_, checked) => {
                                        if (checked) setAlertRulesSourceFilter([...alertRulesSourceFilter, source]);
                                        else setAlertRulesSourceFilter(alertRulesSourceFilter.filter(s => s !== source));
                                      }}
                                    />
                                  </StackItem>
                                ))}
                              </Stack>
                            </StackItem>
                            <Divider />
                            {/* Clear Filters */}
                            <StackItem>
                              <Button 
                                variant="link" 
                                onClick={() => {
                                  setAlertRulesClusterFilter([]);
                                  setAlertRulesNamespaceFilter([]);
                                  setAlertRulesGroupFilter([]);
                                  setAlertRulesComponentFilter([]);
                                  setAlertRulesSeverityFilter([]);
                                  setAlertRulesStateFilter([]);
                                  setAlertRulesSourceFilter([]);
                                }}
                              >
                                Clear all filters
                              </Button>
                          </StackItem>
                          </Stack>
                        </CardBody>
                      </Card>
                    </div>
                  )}
                  {/* Main Table Card */}
                <Card style={{ flex: 1 }}>
                  <CardHeader>
                    <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                      <FlexItem>
                        {/* Toolbar area */}
                        <Flex gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsCenter' }}>
                          <FlexItem>
                            <Checkbox 
                              id="select-all-rules-v2" 
                              isChecked={selectedAlertRuleIds.length === mockAlertRules.length && mockAlertRules.length > 0}
                              onChange={(_, checked) => {
                                if (checked) {
                                  setSelectedAlertRuleIds(mockAlertRules.map(r => r.id));
                                } else {
                                  setSelectedAlertRuleIds([]);
                                }
                              }}
                            />
                          </FlexItem>
                          <FlexItem>
                            <Button 
                              variant={isAlertRulesFilterPanelOpen ? 'secondary' : 'tertiary'} 
                              icon={<FilterIcon />}
                              onClick={() => setIsAlertRulesFilterPanelOpen(!isAlertRulesFilterPanelOpen)}
                            >
                              Filter
                              {(alertRulesClusterFilter.length + alertRulesNamespaceFilter.length + alertRulesGroupFilter.length + alertRulesComponentFilter.length + alertRulesSeverityFilter.length + alertRulesStateFilter.length + alertRulesSourceFilter.length) > 0 && (
                                <Badge style={{ marginLeft: '8px' }}>{alertRulesClusterFilter.length + alertRulesNamespaceFilter.length + alertRulesGroupFilter.length + alertRulesComponentFilter.length + alertRulesSeverityFilter.length + alertRulesStateFilter.length + alertRulesSourceFilter.length}</Badge>
                              )}
                            </Button>
                          </FlexItem>
                          <FlexItem>
                            <SearchInput 
                              placeholder="Search by rule name" 
                              style={{ width: '250px' }} 
                              value={alertRulesSearchValue}
                              onChange={(_, value) => setAlertRulesSearchValue(value)}
                              onClear={() => setAlertRulesSearchValue('')}
                            />
                          </FlexItem>
                          <FlexItem>
                            <Button variant="plain" icon={<ColumnsIcon />} aria-label="Manage columns" />
                          </FlexItem>
                        </Flex>
                      </FlexItem>
                      <FlexItem>
                        <Flex gap={{ default: 'gapMd' }}>
                          <FlexItem>
                            {/* Bulk Actions Dropdown */}
                            <Dropdown
                              isOpen={isBulkActionsMenuOpen}
                              onOpenChange={setIsBulkActionsMenuOpen}
                              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                <MenuToggle 
                                  ref={toggleRef} 
                                  variant="secondary" 
                                  onClick={() => setIsBulkActionsMenuOpen(!isBulkActionsMenuOpen)}
                                  isDisabled={selectedAlertRuleIds.length === 0}
                                >
                                  Actions {selectedAlertRuleIds.length > 0 && <Badge isRead style={{ marginLeft: '4px' }}>{selectedAlertRuleIds.length}</Badge>}
                                </MenuToggle>
                              )}
                            >
                              <DropdownList>
                                <DropdownItem 
                                  key="disable"
                                  onClick={() => {
                                    const rulesToDisable = mockAlertRules.filter(r => selectedAlertRuleIds.includes(r.id));
                                    setAlertRulesToDisable(rulesToDisable);
                                    setIsDisableAlertRuleModalOpen(true);
                                    setIsBulkActionsMenuOpen(false);
                                  }}
                                >
                                  <div>
                                    <div><strong>Disable</strong></div>
                                    <div style={{ fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)' }}>Stop the rule from running and sending alerts.</div>
                                  </div>
                                </DropdownItem>
                                <DropdownItem key="edit-labels">
                                  <div>
                                    <div><strong>Edit labels</strong></div>
                                    <div style={{ fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)' }}>Modify labels for all selected alert rules.</div>
                                  </div>
                                </DropdownItem>
                                <DropdownItem key="edit-components">
                                  <div>
                                    <div><strong>Edit components</strong></div>
                                    <div style={{ fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)' }}>Change the component type for all selected alert rules.</div>
                                  </div>
                                </DropdownItem>
                                <Divider />
                                <DropdownItem key="delete" isDisabled style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                                  <div>
                                    <div>Delete</div>
                                  </div>
                                </DropdownItem>
                              </DropdownList>
                            </Dropdown>
                          </FlexItem>
                          <FlexItem>
                            <Button variant="primary" onClick={() => navigate('/observe/alerting-v2/create-alert-rule')}>Create a new alert rule</Button>
                          </FlexItem>
                        </Flex>
                      </FlexItem>
                    </Flex>
                  </CardHeader>
                  <CardBody style={{ padding: 0 }}>
                    <Table aria-label="Alert rules table" variant="compact">
                      <Thead>
                        <Tr>
                          <Th screenReaderText="Select" />
                          <Th>
                            Alert rule Name
                          </Th>
                          <Th>State</Th>
                          <Th>Severity</Th>
                          <Th
                            info={{
                              tooltip: "Number of clusters this rule applies to",
                              ariaLabel: "More information about target clusters"
                            }}
                          >
                            Target clusters
                          </Th>
                          <Th
                            info={{
                              tooltip: "Indicates whether the alert affects the entire cluster or a specific namespace",
                              ariaLabel: "More information about alert scope"
                            }}
                          >
                            Alert scope
                          </Th>
                          <Th
                            info={{
                              tooltip: "The specific services, operators, or nodes affected by this alert.",
                              ariaLabel: "More information about affected component"
                            }}
                          >
                            Affected component
                          </Th>
                          <Th
                            info={{
                              tooltip: "Origin of the alert rule (User or Platform)",
                              ariaLabel: "More information about source"
                            }}
                          >
                            Source
                          </Th>
                          <Th screenReaderText="Enabled" />
                          <Th screenReaderText="Actions" />
                        </Tr>
                      </Thead>
                      <Tbody>
                        {mockAlertRules
                          .filter(rule => {
                            // Search filter
                            if (alertRulesSearchValue && !rule.name.toLowerCase().includes(alertRulesSearchValue.toLowerCase())) return false;
                            // Cluster filter
                            if (alertRulesClusterFilter.length > 0 && !rule.targetClusters.some(c => alertRulesClusterFilter.includes(c))) return false;
                            // Group filter
                            if (alertRulesGroupFilter.length > 0 && !alertRulesGroupFilter.includes(rule.group)) return false;
                            // Component filter
                            if (alertRulesComponentFilter.length > 0 && !alertRulesComponentFilter.includes(rule.component)) return false;
                            // Severity filter
                            if (alertRulesSeverityFilter.length > 0 && !alertRulesSeverityFilter.includes(rule.severity)) return false;
                            // State filter
                            if (alertRulesStateFilter.length > 0 && !alertRulesStateFilter.includes(rule.state)) return false;
                            // Source filter
                            if (alertRulesSourceFilter.length > 0 && !alertRulesSourceFilter.includes(rule.source)) return false;
                            return true;
                          })
                          .map((rule) => (
                          <Tr key={rule.id}>
                            <Td>
                              <Checkbox 
                                id={`rule-v2-${rule.id}`} 
                                isChecked={selectedAlertRuleIds.includes(rule.id)}
                                onChange={(_, checked) => {
                                  if (checked) {
                                    setSelectedAlertRuleIds([...selectedAlertRuleIds, rule.id]);
                                  } else {
                                    setSelectedAlertRuleIds(selectedAlertRuleIds.filter(id => id !== rule.id));
                                  }
                                }}
                              />
                            </Td>
                            <Td>
                              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                <FlexItem>
                                  <Badge style={{ backgroundColor: 'var(--pf-t--global--color--status--info--default)', color: 'white' }}>AR</Badge>
                                </FlexItem>
                                <FlexItem>
                                  <Button 
                                    variant="link" 
                                    isInline 
                                    onClick={() => {
                                      setSelectedAlertRule(rule);
                                      setIsAlertRuleDrawerOpen(true);
                                      setAlertRuleDrawerTab('details');
                                    }}
                                  >
                                    {rule.name}
                                  </Button>
                                </FlexItem>
                              </Flex>
                            </Td>
                            <Td>
                              {rule.state === 'Active' && (
                                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                  <CheckCircleIcon color="var(--pf-t--global--color--status--success--default)" />
                                  <span>Active</span>
                                </Flex>
                              )}
                              {rule.state === 'Reconciling' && (
                                <Popover
                                  headerIcon={<SyncIcon />}
                                  headerContent="Reconciliation in progress"
                                  bodyContent={
                                    <Stack hasGutter>
                                      <StackItem>
                                        <Content>The rule configuration has been accepted but is currently being processed. You'll receive a notification when processing is complete.</Content>
                                      </StackItem>
                                      <StackItem>
                                        <div style={{ marginBottom: '8px' }}>Configuration in progress</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          <Progress 
                                            value={rule.stateProgress || 0} 
                                            size="sm" 
                                            style={{ flex: 1 }}
                                            aria-label="Progress"
                                          />
                                          <span>{rule.stateProgress || 0}%</span>
                                        </div>
                                        <div style={{ marginTop: '8px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                                          Rule applied to {rule.appliedClusters || 0} of {rule.totalClusters || 0} clusters
                                        </div>
                                      </StackItem>
                                      <StackItem>
                                        <Flex gap={{ default: 'gapMd' }}>
                                          <Button variant="secondary" size="sm">Close</Button>
                                          <Button variant="link" size="sm">Learn more</Button>
                                        </Flex>
                                      </StackItem>
                                    </Stack>
                                  }
                                >
                                  <Button variant="link" isInline style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <SyncIcon /> Reconciling
                                  </Button>
                                </Popover>
                              )}
                              {rule.state === 'Partial success' && (
                                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                  <ExclamationCircleIcon color="var(--pf-t--global--color--status--warning--default)" />
                                  <span>Partial success</span>
                                </Flex>
                              )}
                              {rule.state === 'Failed' && (
                                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                  <BanIcon color="var(--pf-t--global--color--status--danger--default)" />
                                  <span>Failed</span>
                                </Flex>
                              )}
                              {rule.state === 'Disabled' && (
                                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                  <PauseCircleIcon color="var(--pf-t--global--text--color--subtle)" />
                                  <span>Disabled</span>
                                </Flex>
                              )}
                            </Td>
                            <Td>
                              <Label 
                                color={rule.severity === 'Critical' ? 'red' : rule.severity === 'Warning' ? 'orange' : 'purple'} 
                                isCompact 
                                icon={rule.severity === 'Critical' ? <ExclamationCircleIcon /> : rule.severity === 'Warning' ? <ExclamationTriangleIcon /> : <InfoCircleIcon />}
                              >
                                {rule.severity}
                              </Label>
                            </Td>
                            <Td>
                              <Popover
                                headerContent={`This alert rule is applied on ${rule.targetClusters.length} clusters`}
                                bodyContent={
                                  <Stack hasGutter>
                                    <StackItem>
                                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                        {rule.targetClusters.slice(0, 5).map((cluster, idx) => (
                                          <li key={idx}>{cluster}</li>
                                        ))}
                                      </ul>
                                    </StackItem>
                                    {rule.targetClusters.length > 5 && (
                                      <StackItem>
                                        <Button 
                                          variant="link" 
                                          isInline
                                          onClick={() => {
                                            setSelectedAlertRule(rule);
                                            setIsAlertRuleDrawerOpen(true);
                                            setAlertRuleDrawerTab('details');
                                          }}
                                        >
                                          See alert rule details
                                        </Button>
                                      </StackItem>
                                    )}
                                  </Stack>
                                }
                              >
                                <Button variant="link" isInline>
                                  {rule.targetClusters.length} cluster{rule.targetClusters.length > 1 ? 's' : ''}
                                </Button>
                              </Popover>
                            </Td>
                            <Td>{rule.group}</Td>
                            <Td>{rule.component}</Td>
                            <Td>{rule.source}</Td>
                            <Td>
                              <Switch 
                                id={`switch-v2-${rule.id}`} 
                                isChecked={rule.enabled} 
                                aria-label={`Enable ${rule.name}`}
                                onChange={(_, checked) => {
                                  if (!checked) {
                                    // When turning off (disabling), show the disable modal
                                    setAlertRulesToDisable([rule]);
                                    setIsDisableAlertRuleModalOpen(true);
                                  }
                                  // For enabling, just toggle (in real app would update state)
                                }}
                              />
                            </Td>
                            <Td>
                              <Dropdown
                                isOpen={alertRuleActionMenuOpen === rule.id}
                                onOpenChange={(isOpen) => setAlertRuleActionMenuOpen(isOpen ? rule.id : null)}
                                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                  <MenuToggle 
                                    ref={toggleRef} 
                                    variant="plain" 
                                    aria-label="Actions"
                                    onClick={() => setAlertRuleActionMenuOpen(alertRuleActionMenuOpen === rule.id ? null : rule.id)}
                                  >
                                    <EllipsisVIcon />
                                  </MenuToggle>
                                )}
                                popperProps={{ position: 'right' }}
                              >
                                <DropdownList>
                                  {/* User-defined alert rule actions */}
                                  {rule.source === 'User' && (
                                    <>
                                      <DropdownItem key="edit">
                                        <div>
                                          <div><strong>Edit alert rule</strong></div>
                                          <div style={{ fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)' }}>Modify the criteria and notification settings for an existing alert rule.</div>
                                        </div>
                                      </DropdownItem>
                                      <DropdownItem 
                                        key="disable"
                                        onClick={() => {
                                          setAlertRulesToDisable([rule]);
                                          setIsDisableAlertRuleModalOpen(true);
                                          setAlertRuleActionMenuOpen(null);
                                        }}
                                      >
                                        <div>
                                          <div><strong>Disable</strong></div>
                                          <div style={{ fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)' }}>Stop the rule from running altogether.</div>
                                        </div>
                                      </DropdownItem>
                                      <DropdownItem key="duplicate">
                                        <div>
                                          <div><strong>Duplicate</strong></div>
                                          <div style={{ fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)' }}>Copy an alert rule and modify as new.</div>
                                        </div>
                                      </DropdownItem>
                                      <DropdownItem key="silence">
                                        <div>
                                          <div><strong>Silence alert rule</strong></div>
                                          <div style={{ fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)' }}>Temporarily stop notifications for this alert rule.</div>
                                        </div>
                                      </DropdownItem>
                                      <Divider />
                                      <DropdownItem key="delete" isDanger>
                                        <div>
                                          <div><strong>Delete</strong></div>
                                        </div>
                                      </DropdownItem>
                                    </>
                                  )}
                                  {/* Platform-defined alert rule actions */}
                                  {rule.source === 'Platform' && (
                                    <>
                                      <DropdownItem key="edit">
                                        <div>
                                          <div><strong>Edit alert rule</strong></div>
                                          <div style={{ fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)' }}>Limited fields available for platform alerts.</div>
                                        </div>
                                      </DropdownItem>
                                      <DropdownItem 
                                        key="disable"
                                        onClick={() => {
                                          setAlertRulesToDisable([rule]);
                                          setIsDisableAlertRuleModalOpen(true);
                                          setAlertRuleActionMenuOpen(null);
                                        }}
                                      >
                                        <div>
                                          <div><strong>Disable</strong></div>
                                          <div style={{ fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)' }}>Stop the rule from running altogether.</div>
                                        </div>
                                      </DropdownItem>
                                      <DropdownItem key="duplicate">
                                        <div>
                                          <div><strong>Duplicate</strong></div>
                                          <div style={{ fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)' }}>Copy an alert rule and modify as a new user-defined rule.</div>
                                        </div>
                                      </DropdownItem>
                                      <DropdownItem key="silence">
                                        <div>
                                          <div><strong>Silence alert rule</strong></div>
                                          <div style={{ fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)' }}>Temporarily stop notifications for this alert rule.</div>
                                        </div>
                                      </DropdownItem>
                                      <Divider />
                                      <DropdownItem key="delete" isDisabled style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                                        <div>
                                          <div>Delete</div>
                                          <div style={{ fontSize: '12px' }}>Available only for user defined alerts</div>
                                        </div>
                                      </DropdownItem>
                                    </>
                                  )}
                                </DropdownList>
                              </Dropdown>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
                </div>
              )}
              {managementSubTab === 'silence-rules' && (
                <Card>
                  <CardHeader>
                    <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                      <FlexItem>
                        <CardTitle>Silence Rules</CardTitle>
                      </FlexItem>
                      <FlexItem>
                        <Button variant="primary" icon={<PlusIcon />}>Create Silence</Button>
                      </FlexItem>
                    </Flex>
                  </CardHeader>
                  <CardBody>
                    <Table aria-label="Silence rules table" variant="compact">
                      <Thead>
                        <Tr>
                          <Th>Silence Name</Th>
                          <Th>Matchers</Th>
                          <Th>Status</Th>
                          <Th>Starts</Th>
                          <Th>Ends</Th>
                          <Th>Created By</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        <Tr>
                          <Td><strong>Maintenance Window</strong></Td>
                          <Td>
                            <Flex gap={{ default: 'gapXs' }}>
                              <Label isCompact variant="outline">cluster=prod-east-1</Label>
                            </Flex>
                          </Td>
                          <Td><Label color="green" isCompact>Active</Label></Td>
                          <Td>Dec 18, 2025 00:00</Td>
                          <Td>Dec 18, 2025 04:00</Td>
                          <Td>admin@redhat.com</Td>
                          <Td>
                            <Button variant="link" isInline>Edit</Button>
                            <Button variant="link" isInline style={{ marginLeft: '8px' }}>Expire</Button>
                          </Td>
                        </Tr>
                        <Tr>
                          <Td><strong>Known Issue - etcd</strong></Td>
                          <Td>
                            <Flex gap={{ default: 'gapXs' }}>
                              <Label isCompact variant="outline">alertname=EtcdHighLatency</Label>
                            </Flex>
                          </Td>
                          <Td><Label color="green" isCompact>Active</Label></Td>
                          <Td>Dec 15, 2025 12:00</Td>
                          <Td>Dec 22, 2025 12:00</Td>
                          <Td>sre@redhat.com</Td>
                          <Td>
                            <Button variant="link" isInline>Edit</Button>
                            <Button variant="link" isInline style={{ marginLeft: '8px' }}>Expire</Button>
                          </Td>
                        </Tr>
                        <Tr>
                          <Td><strong>Upgrade Silence</strong></Td>
                          <Td>
                            <Flex gap={{ default: 'gapXs' }}>
                              <Label isCompact variant="outline">severity=warning</Label>
                              <Label isCompact variant="outline">region=EU West</Label>
                            </Flex>
                          </Td>
                          <Td><Label color="grey" isCompact>Expired</Label></Td>
                          <Td>Dec 10, 2025 08:00</Td>
                          <Td>Dec 10, 2025 16:00</Td>
                          <Td>ops@redhat.com</Td>
                          <Td>
                            <Button variant="link" isInline>Recreate</Button>
                            <Button variant="link" isInline style={{ marginLeft: '8px' }}>Delete</Button>
                          </Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              )}
            </StackItem>
          </Stack>
        </div>
      )}

      {/* Save Filter Modal */}
      <Modal
        variant="small"
        isOpen={isSaveFilterModalOpen}
        onClose={() => setIsSaveFilterModalOpen(false)}
      >
        <ModalHeader title="Save filter" />
        <ModalBody>
          <Stack hasGutter>
            <StackItem>
              <Content component="p">Filters will be saved for future use on your account.</Content>
            </StackItem>
            <StackItem>
              <FormGroup label="Filter name" isRequired>
                <TextInputGroup>
                  <TextInputGroupMain
                    placeholder="Enter filter name..."
                    value={newFilterName}
                    onChange={(_, value) => setNewFilterName(value)}
                  />
                </TextInputGroup>
              </FormGroup>
            </StackItem>
            <StackItem>
              <FormGroup 
                label={
                  <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>Saved filter items</FlexItem>
                    <FlexItem>
                      <Tooltip content="Choose which filter settings to include when saving this filter">
                        <Button variant="plain" style={{ padding: 0, minWidth: 'auto' }}>
                          <OutlinedQuestionCircleIcon />
                        </Button>
                      </Tooltip>
                    </FlexItem>
                  </Flex>
                }
                isRequired
              >
                <Stack hasGutter>
                  <StackItem>
                    <Checkbox 
                      id="save-selected-filters" 
                      label="Selected filters." 
                      isChecked={true}
                      isDisabled
                    />
                  </StackItem>
                  <StackItem>
                    <Checkbox 
                      id="save-search-input" 
                      label="Input in search field" 
                      isChecked={!!searchValue}
                      isDisabled={!searchValue}
                    />
                  </StackItem>
                  <StackItem>
                    <Checkbox 
                      id="save-grouping-sorting" 
                      label="Grouping and sorting view" 
                      isChecked={true}
                    />
                  </StackItem>
                </Stack>
              </FormGroup>
            </StackItem>
            <StackItem>
              <Content component="small" className="pf-v6-u-color-200">
                <InfoCircleIcon /> Your saved filters are specific to your account and won't be visible to other users.
              </Content>
            </StackItem>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="primary"
            onClick={() => {
              if (newFilterName.trim()) {
                const newFilter: SavedFilter = {
                  id: `sf-${Date.now()}`,
                  name: newFilterName.trim(),
                  filters: { 
                    severity: severityFilter, 
                    group: groupFilter, 
                    component: componentFilter, 
                    source: [], 
                    searchValue,
                    region: regionFilter,
                    cluster: clusterFilter,
                    namespace: namespaceFilter,
                    label: labelFilter,
                  },
                };
                setSavedFilters([...savedFilters, newFilter]);
                setSelectedSavedFilter(newFilter);
                setIsSaveFilterModalOpen(false);
                setNewFilterName('');
                addToast('Filter saved successfully', 'success');
              }
            }}
            isDisabled={!newFilterName.trim()}
          >
            Save filter
          </Button>
          <Button variant="link" onClick={() => setIsSaveFilterModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Manage Saved Filters Modal */}
      <Modal
        variant="medium"
        isOpen={isManageSavedFiltersModalOpen}
        onClose={() => {
          setIsManageSavedFiltersModalOpen(false);
          setEditingFilterId(null);
          setEditingFilterName('');
        }}
      >
        <ModalHeader title="Manage saved filters" />
        <ModalBody>
        <Stack hasGutter>
          <StackItem>
            <Content component="small" className="pf-v6-u-color-200">
              <InfoCircleIcon /> Your saved filters are specific to your account and won't be visible to other users.
            </Content>
          </StackItem>
          <StackItem>
            {savedFilters.length === 0 ? (
              <EmptyState titleText="No saved filters" icon={BookmarkIcon}>
                <EmptyStateBody>You haven't saved any filters yet. Apply filters and click "Add to saved filters" to save them.</EmptyStateBody>
              </EmptyState>
            ) : (
              <DataList aria-label="Saved filters list" isCompact>
                {savedFilters.map((filter, index) => (
                  <DataListItem key={filter.id} aria-labelledby={`filter-${filter.id}`}>
                    <DataListItemRow>
                      <DataListControl>
                        <Tooltip content="Drag to reorder">
                          <span style={{ cursor: 'grab', display: 'flex', alignItems: 'center', padding: '8px' }}>
                            <GripVerticalIcon />
                          </span>
                        </Tooltip>
                      </DataListControl>
                      <DataListItemCells
                        dataListCells={[
                          <DataListCell key="name" width={3}>
                            {editingFilterId === filter.id ? (
                              <TextInputGroup>
                                <TextInputGroupMain
                                  value={editingFilterName}
                                  onChange={(_, value) => setEditingFilterName(value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && editingFilterName.trim()) {
                                      setSavedFilters(savedFilters.map(f => 
                                        f.id === filter.id ? { ...f, name: editingFilterName.trim() } : f
                                      ));
                                      setEditingFilterId(null);
                                      setEditingFilterName('');
                                    } else if (e.key === 'Escape') {
                                      setEditingFilterId(null);
                                      setEditingFilterName('');
                                    }
                                  }}
                                  autoFocus
                                />
                                <TextInputGroupUtilities>
                                  <Button
                                    variant="plain"
                                    size="sm"
                                    onClick={() => {
                                      if (editingFilterName.trim()) {
                                        setSavedFilters(savedFilters.map(f => 
                                          f.id === filter.id ? { ...f, name: editingFilterName.trim() } : f
                                        ));
                                      }
                                      setEditingFilterId(null);
                                      setEditingFilterName('');
                                    }}
                                  >
                                    <CheckIcon />
                                  </Button>
                                  <Button
                                    variant="plain"
                                    size="sm"
                                    onClick={() => {
                                      setEditingFilterId(null);
                                      setEditingFilterName('');
                                    }}
                                  >
                                    <TimesIcon />
                                  </Button>
                                </TextInputGroupUtilities>
                              </TextInputGroup>
                            ) : (
                              <span id={`filter-${filter.id}`}>
                                <BookmarkIcon /> {filter.name}
                              </span>
                            )}
                          </DataListCell>,
                          <DataListCell key="filters" width={2}>
                            <Flex gap={{ default: 'gapXs' }} flexWrap={{ default: 'wrap' }}>
                              {filter.filters.severity.length > 0 && (
                                <FlexItem>
                                  <Tooltip content={`Severity: ${filter.filters.severity.join(', ')}`}>
                                    <Label isCompact color="grey">{filter.filters.severity.length} severity</Label>
                                  </Tooltip>
                                </FlexItem>
                              )}
                              {filter.filters.group.length > 0 && (
                                <FlexItem>
                                  <Tooltip content={`Group: ${filter.filters.group.join(', ')}`}>
                                    <Label isCompact color="grey">{filter.filters.group.length} group</Label>
                                  </Tooltip>
                                </FlexItem>
                              )}
                              {filter.filters.component.length > 0 && (
                                <FlexItem>
                                  <Tooltip content={`Component: ${filter.filters.component.join(', ')}`}>
                                    <Label isCompact color="grey">{filter.filters.component.length} component</Label>
                                  </Tooltip>
                                </FlexItem>
                              )}
                              {filter.filters.source && filter.filters.source.length > 0 && (
                                <FlexItem>
                                  <Tooltip content={`Source: ${filter.filters.source.join(', ')}`}>
                                    <Label isCompact color="grey">{filter.filters.source.length} source</Label>
                                  </Tooltip>
                                </FlexItem>
                              )}
                              {filter.filters.searchValue && (
                                <FlexItem>
                                  <Tooltip content={`Search: "${filter.filters.searchValue}"`}>
                                    <Label isCompact color="grey">search</Label>
                                  </Tooltip>
                                </FlexItem>
                              )}
                            </Flex>
                          </DataListCell>,
                          <DataListCell key="actions" width={1} alignRight>
                            <Flex gap={{ default: 'gapSm' }}>
                              <FlexItem>
                                <Tooltip content="Edit filter name">
                                  <Button
                                    variant="plain"
                                    size="sm"
                                    onClick={() => {
                                      setEditingFilterId(filter.id);
                                      setEditingFilterName(filter.name);
                                    }}
                                    aria-label="Edit filter name"
                                  >
                                    <EditIcon />
                                  </Button>
                                </Tooltip>
                              </FlexItem>
                              <FlexItem>
                                <Tooltip content="Delete filter">
                                  <Button
                                    variant="plain"
                                    size="sm"
                                    onClick={() => {
                                      setSavedFilters(savedFilters.filter(f => f.id !== filter.id));
                                      if (selectedSavedFilter?.id === filter.id) {
                                        setSelectedSavedFilter(null);
                                      }
                                      addToast('Filter deleted', 'success');
                                    }}
                                    aria-label="Delete filter"
                                  >
                                    <TrashIcon />
                                  </Button>
                                </Tooltip>
                              </FlexItem>
                            </Flex>
                          </DataListCell>,
                        ]}
                      />
                    </DataListItemRow>
                  </DataListItem>
                ))}
              </DataList>
            )}
          </StackItem>
        </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={() => {
            setIsManageSavedFiltersModalOpen(false);
            setEditingFilterId(null);
            setEditingFilterName('');
          }}>
            Done
          </Button>
        </ModalFooter>
      </Modal>

      {/* Alert Details Side Drawer - Fixed position overlay */}
      {isDrawerExpanded && selectedAlertDetail && (
        <div style={{ position: 'fixed', top: '76px', left: 0, right: 0, bottom: 0, zIndex: 400 }}>
          {/* Backdrop */}
          <div 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              cursor: 'pointer'
            }}
            onClick={() => { setIsDrawerExpanded(false); setSelectedAlertDetail(null); }}
          />
          {/* Drawer Panel */}
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            right: 0, 
            bottom: 0, 
            width: '550px',
            maxWidth: '90vw',
            backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
            boxShadow: '-4px 0 8px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Drawer Header - Sticky */}
            <div style={{ 
              padding: '16px', 
              borderBottom: '1px solid var(--pf-t--global--border--color--default)', 
              flexShrink: 0,
              backgroundColor: 'var(--pf-t--global--background--color--primary--default)'
            }}>
              <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsFlexStart' }}>
                <FlexItem style={{ flex: 1 }}>
                  <Title headingLevel="h2" size="lg">{selectedAlertDetail.alertName}</Title>
                  <Content component="p" style={{ color: 'var(--pf-t--global--text--color--subtle)', marginTop: '8px' }}>
                    {selectedAlertDetail.description || `This alert indicates ${selectedAlertDetail.alertName.toLowerCase()} condition.`}
                  </Content>
                  {/* Cluster and Namespace badges */}
                  <div style={{ 
                    marginTop: '16px', 
                    padding: '12px 16px', 
                    backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
                    borderRadius: '6px',
                    border: '1px solid var(--pf-t--global--border--color--default)'
                  }}>
                    <Flex gap={{ default: 'gapLg' }}>
                      <FlexItem>
                        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                          <Label isCompact style={{ backgroundColor: 'var(--pf-t--global--color--nonstatus--blue--default)', color: 'white' }}>Cluster</Label>
                          <strong style={{ fontSize: '14px' }}>{selectedAlertDetail.clusterName || 'N/A'}</strong>
                        </Flex>
                      </FlexItem>
                      <FlexItem>
                        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                          <Label isCompact style={{ backgroundColor: 'var(--pf-t--global--color--nonstatus--purple--default)', color: 'white' }}>Namespace</Label>
                          <strong style={{ fontSize: '14px' }}>{selectedAlertDetail.namespace}</strong>
                        </Flex>
                      </FlexItem>
                    </Flex>
                  </div>
                </FlexItem>
                <FlexItem>
                  <Button variant="plain" aria-label="Close" onClick={() => { setIsDrawerExpanded(false); setSelectedAlertDetail(null); }}>
                    <TimesIcon />
                  </Button>
                </FlexItem>
              </Flex>
            </div>
            {/* Drawer Body - Scrollable */}
            <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
              <Tabs activeKey={alertDetailDrawerTab} onSelect={(_, tabKey) => setAlertDetailDrawerTab(tabKey as number)}>
                <Tab eventKey={0} title={<TabTitleText>Details</TabTitleText>}>
                  <div style={{ padding: '16px 0' }}>
                    <Stack hasGutter>
                      {/* Name */}
                      <StackItem>
                        <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontWeight: 600 }}>Name</Content>
                        <Content component="p"><strong>{selectedAlertDetail.alertName}</strong></Content>
                      </StackItem>
                      
                      {/* Description */}
                      <StackItem>
                        <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontWeight: 600 }}>Description</Content>
                        <Content component="p">{selectedAlertDetail.description || `${selectedAlertDetail.component} usage on a ${selectedAlertDetail.group} component is critically high.`}</Content>
                      </StackItem>
                      
                      {/* Alert scope */}
                      <StackItem>
                        <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontWeight: 600 }}>Alert scope</Content>
                        <Content component="p">{selectedAlertDetail.group}</Content>
                      </StackItem>
                      
                      {/* Affected component */}
                      <StackItem>
                        <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontWeight: 600 }}>Affected component</Content>
                        <Content component="p">{selectedAlertDetail.component}</Content>
                      </StackItem>
                      
                      {/* State */}
                      <StackItem>
                        <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontWeight: 600 }}>State</Content>
                        <Stack>
                          <StackItem>
                            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                              <Icon status="warning"><BellIcon /></Icon>
                              <span>Firing</span>
                            </Flex>
                          </StackItem>
                          <StackItem style={{ marginLeft: '24px' }}>
                            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                              <Icon><ClockIcon /></Icon>
                              <Content component="small">Since {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} {new Date().toLocaleTimeString()}</Content>
                            </Flex>
                          </StackItem>
                        </Stack>
                      </StackItem>
                      
                      {/* Labels */}
                      <StackItem>
                        <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontWeight: 600 }}>Labels</Content>
                        <Flex gap={{ default: 'gapSm' }} style={{ marginTop: '4px' }}>
                          <Label isCompact style={{ backgroundColor: 'var(--pf-t--global--background--color--secondary--default)' }}>label-label1</Label>
                          <Label isCompact style={{ backgroundColor: 'var(--pf-t--global--background--color--secondary--default)' }}>label2</Label>
                        </Flex>
                      </StackItem>
                      
                      {/* Severity */}
                      <StackItem>
                        <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontWeight: 600 }}>Severity</Content>
                        <div style={{ marginTop: '4px' }}>
                          <Label 
                            color={selectedAlertDetail.severity === 'Critical' ? 'red' : selectedAlertDetail.severity === 'Warning' ? 'orange' : 'blue'}
                            icon={selectedAlertDetail.severity === 'Critical' ? <ExclamationCircleIcon /> : selectedAlertDetail.severity === 'Warning' ? <ExclamationTriangleIcon /> : <InfoCircleIcon />}
                          >
                            {selectedAlertDetail.severity}
                          </Label>
                        </div>
                      </StackItem>
                      
                      {/* Source */}
                      <StackItem>
                        <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontWeight: 600 }}>Source</Content>
                        <Content component="p">Platform</Content>
                      </StackItem>
                      
                      {/* Namespace */}
                      <StackItem>
                        <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontWeight: 600 }}>Namespace</Content>
                        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} style={{ marginTop: '4px' }}>
                          <Label isCompact style={{ backgroundColor: 'var(--pf-t--global--color--nonstatus--green--default)', color: 'white' }}>NS</Label>
                          <span>{selectedAlertDetail.namespace}</span>
                        </Flex>
                      </StackItem>
                      
                      {/* Resource */}
                      <StackItem>
                        <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontWeight: 600 }}>Resource</Content>
                        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} style={{ marginTop: '4px' }}>
                          <Label isCompact style={{ backgroundColor: 'var(--pf-t--global--color--nonstatus--orange--default)', color: 'white' }}>N</Label>
                          <Button variant="link" isInline>node-001-nb</Button>
                        </Flex>
                      </StackItem>
                      
                      {/* Alert rule */}
                      <StackItem>
                        <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontWeight: 600 }}>Alert rule</Content>
                        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} style={{ marginTop: '4px' }}>
                          <Label isCompact style={{ backgroundColor: 'var(--pf-t--global--color--nonstatus--purple--default)', color: 'white' }}>AR</Label>
                          <Button variant="link" isInline>{selectedAlertDetail.alertName}</Button>
                        </Flex>
                      </StackItem>
                      
                      {/* Runbook */}
                      <StackItem>
                        <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontWeight: 600 }}>Runbook</Content>
                        <Content component="p">
                          <Button variant="link" isInline>https://mygitrunbook.com</Button>
                        </Content>
                      </StackItem>
                      
                      {/* Dashboard */}
                      <StackItem>
                        <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontWeight: 600, borderBottom: '1px dashed var(--pf-t--global--border--color--default)', display: 'inline-block' }}>Dashboard</Content>
                        <Content component="p">ocp-perses-clusterhealthdashboard</Content>
                      </StackItem>
                      
                      {/* Follow-up steps */}
                      <StackItem>
                        <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontWeight: 600 }}>Follow-up steps</Content>
                        <Stack hasGutter style={{ marginTop: '8px' }}>
                          <StackItem>
                            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                              <Button variant="link" isInline>View logs</Button>
                              <Popover
                                headerIcon={<BellIcon />}
                                headerContent="Install logging operator to view logs"
                                bodyContent="You can deploy logging by installing the Red Hat OpenShift Logging Operator. The Red Hat OpenShift Logging Operator creates and manages the components of the logging stack."
                                footerContent={
                                  <Flex gap={{ default: 'gapMd' }}>
                                    <Button variant="secondary">Go to operator page</Button>
                                    <Button variant="link">Cancel</Button>
                                  </Flex>
                                }
                              >
                                <Button variant="plain" aria-label="More info about View logs" style={{ padding: '0 4px' }}>
                                  <Icon status="info"><InfoCircleIcon /></Icon>
                                </Button>
                              </Popover>
                            </Flex>
                          </StackItem>
                          <StackItem>
                            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                              <Button variant="link" isInline>Troubleshoot</Button>
                              <Popover
                                headerContent="Install Korrel8r operator to correlate observability signals"
                                bodyContent="Korrel8r helps navigate from problem symptoms to related resources and signal data that can reveal the cause. It can follow relationships between disjointed observability 'silos' (logs, metrics, alerts and more) to bring together all the data available to solve a problem."
                                footerContent={
                                  <Flex gap={{ default: 'gapMd' }}>
                                    <Button variant="secondary">Go to operator page</Button>
                                    <Button variant="link">Cancel</Button>
                                  </Flex>
                                }
                              >
                                <Button variant="plain" aria-label="More info about Troubleshoot" style={{ padding: '0 4px' }}>
                                  <Icon status="info"><InfoCircleIcon /></Icon>
                                </Button>
                              </Popover>
                            </Flex>
                          </StackItem>
                          <StackItem>
                            <Button variant="link" isInline>See metrics</Button>
                          </StackItem>
                          <StackItem>
                            <Button variant="link" isInline>See related incident</Button>
                          </StackItem>
                        </Stack>
                      </StackItem>
                    </Stack>
                  </div>
                </Tab>
                <Tab eventKey={1} title={<TabTitleText>Alert timeline</TabTitleText>}>
                  <div style={{ padding: '16px 0' }}>
                    {selectedAlertDetail && (
                      <AlertTimelineVisualization 
                        alertName={selectedAlertDetail.alertName}
                        severity={selectedAlertDetail.severity}
                      />
                    )}
                  </div>
                </Tab>
                <Tab eventKey={2} title={<TabTitleText>YAML</TabTitleText>}>
                  <div style={{ padding: '16px 0' }}>
                    <Content component="p" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                      Alert YAML definition would appear here.
                    </Content>
                  </div>
                </Tab>
              </Tabs>
            </div>
          </div>
        </div>
      )}

      {/* Alert Rule Details Drawer */}
      {isAlertRuleDrawerOpen && selectedAlertRule && (
      <div style={{ position: 'fixed', top: '76px', left: 0, right: 0, bottom: 0, zIndex: 400 }}>
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            cursor: 'pointer'
          }}
          onClick={() => { setIsAlertRuleDrawerOpen(false); setSelectedAlertRule(null); }}
        />
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          right: 0, 
          bottom: 0, 
          width: '550px',
          maxWidth: '90vw',
          backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
          boxShadow: '-4px 0 8px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
                <div style={{ padding: '16px', borderBottom: '1px solid var(--pf-t--global--border--color--default)', flexShrink: 0 }}>
                  <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ width: '100%' }}>
                    <FlexItem>
                      <Title headingLevel="h2" size="lg">Alert rule details</Title>
                    </FlexItem>
                    <FlexItem>
                      <Flex gap={{ default: 'gapSm' }}>
                        <FlexItem>
                          <Dropdown
                            isOpen={false}
                            onOpenChange={() => {}}
                            toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                              <MenuToggle ref={toggleRef} variant="plain" aria-label="Actions">
                                <EllipsisVIcon />
                              </MenuToggle>
                            )}
                          >
                            <DropdownList>
                              <DropdownItem>Edit</DropdownItem>
                              <DropdownItem>Duplicate</DropdownItem>
                              <DropdownItem isDanger>Delete</DropdownItem>
                            </DropdownList>
                          </Dropdown>
                        </FlexItem>
                        <FlexItem>
                          <Button variant="plain" aria-label="Close" onClick={() => { setIsAlertRuleDrawerOpen(false); setSelectedAlertRule(null); }}>
                            <TimesIcon />
                          </Button>
                        </FlexItem>
                      </Flex>
                    </FlexItem>
                  </Flex>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Tabs activeKey={alertRuleDrawerTab} onSelect={(_, tabKey) => setAlertRuleDrawerTab(tabKey)} isFilled style={{ padding: '0 16px', flexShrink: 0 }}>
                  <Tab eventKey="details" title={<TabTitleText>Details</TabTitleText>}>
                    <div style={{ padding: '16px', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
                      <Stack hasGutter>
                        <StackItem>
                          <DescriptionList isCompact isHorizontal>
                            <DescriptionListGroup>
                              <DescriptionListTerm>Name</DescriptionListTerm>
                              <DescriptionListDescription>
                                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                  <FlexItem>
                                    <Badge style={{ backgroundColor: 'var(--pf-t--global--color--status--info--default)', color: 'white' }}>AR</Badge>
                                  </FlexItem>
                                  <FlexItem><strong>{selectedAlertRule.name}</strong></FlexItem>
                                </Flex>
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>Description</DescriptionListTerm>
                              <DescriptionListDescription>{selectedAlertRule.description}</DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>Target clusters</DescriptionListTerm>
                              <DescriptionListDescription>
                                <Stack hasGutter>
                                  {selectedAlertRule.targetClusters.slice(0, 5).map((cluster, idx) => (
                                    <StackItem key={idx}>
                                      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                        <FlexItem>
                                          <Button 
                                            variant="plain" 
                                            onClick={() => {
                                              if (alertRuleExpandedClusters.includes(cluster)) {
                                                setAlertRuleExpandedClusters(alertRuleExpandedClusters.filter(c => c !== cluster));
                                              } else {
                                                setAlertRuleExpandedClusters([...alertRuleExpandedClusters, cluster]);
                                              }
                                            }}
                                            style={{ padding: 0 }}
                                          >
                                            {alertRuleExpandedClusters.includes(cluster) ? <AngleDownIcon /> : <AngleRightIcon />}
                                          </Button>
                                        </FlexItem>
                                        <FlexItem>
                                          <CheckCircleIcon color="var(--pf-t--global--color--status--success--default)" />
                                        </FlexItem>
                                        <FlexItem>{cluster}</FlexItem>
                                      </Flex>
                                      {alertRuleExpandedClusters.includes(cluster) && (
                                        <div style={{ paddingLeft: '48px', marginTop: '8px' }}>
                                          <DescriptionList isCompact isHorizontal>
                                            <DescriptionListGroup>
                                              <DescriptionListTerm>Environment</DescriptionListTerm>
                                              <DescriptionListDescription>Production</DescriptionListDescription>
                                            </DescriptionListGroup>
                                            <DescriptionListGroup>
                                              <DescriptionListTerm>Region</DescriptionListTerm>
                                              <DescriptionListDescription>us-west-2 (Secondary)</DescriptionListDescription>
                                            </DescriptionListGroup>
                                            <DescriptionListGroup>
                                              <DescriptionListTerm>Version</DescriptionListTerm>
                                              <DescriptionListDescription>K8s 1.28.3</DescriptionListDescription>
                                            </DescriptionListGroup>
                                          </DescriptionList>
                                        </div>
                                      )}
                                    </StackItem>
                                  ))}
                                </Stack>
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>Source</DescriptionListTerm>
                              <DescriptionListDescription>{selectedAlertRule.source}</DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>Alert scope</DescriptionListTerm>
                              <DescriptionListDescription>{selectedAlertRule.group}</DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>Affected component</DescriptionListTerm>
                              <DescriptionListDescription>{selectedAlertRule.component}</DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>Labels</DescriptionListTerm>
                              <DescriptionListDescription>
                                <Flex gap={{ default: 'gapSm' }}>
                                  {selectedAlertRule.labels.map((label, idx) => (
                                    <FlexItem key={idx}>
                                      <Label isCompact variant="outline">{label}</Label>
                                    </FlexItem>
                                  ))}
                                </Flex>
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>Severity</DescriptionListTerm>
                              <DescriptionListDescription>
                                <Label 
                                  color={selectedAlertRule.severity === 'Critical' ? 'red' : selectedAlertRule.severity === 'Warning' ? 'orange' : 'purple'} 
                                  icon={selectedAlertRule.severity === 'Critical' ? <ExclamationCircleIcon /> : selectedAlertRule.severity === 'Warning' ? <ExclamationTriangleIcon /> : <InfoCircleIcon />}
                                >
                                  {selectedAlertRule.severity}
                                </Label>
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>Expression</DescriptionListTerm>
                              <DescriptionListDescription>
                                <code style={{ 
                                  backgroundColor: 'var(--pf-t--global--background--color--secondary--default)', 
                                  padding: '8px', 
                                  borderRadius: '4px',
                                  display: 'block',
                                  fontSize: '12px',
                                  wordBreak: 'break-all'
                                }}>
                                  {selectedAlertRule.expression}
                                </code>
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>
                                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                  <FlexItem>For</FlexItem>
                                  <FlexItem>
                                    <Tooltip content="Duration the alert must be firing before it is considered active">
                                      <QuestionCircleIcon style={{ color: 'var(--pf-t--global--icon--color--subtle)' }} />
                                    </Tooltip>
                                  </FlexItem>
                                </Flex>
                              </DescriptionListTerm>
                              <DescriptionListDescription>{selectedAlertRule.forDuration}</DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>
                                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                  <FlexItem>PrometheusRule</FlexItem>
                                  <FlexItem>
                                    <Tooltip content="The Prometheus rule resource that contains this alert">
                                      <QuestionCircleIcon style={{ color: 'var(--pf-t--global--icon--color--subtle)' }} />
                                    </Tooltip>
                                  </FlexItem>
                                </Flex>
                              </DescriptionListTerm>
                              <DescriptionListDescription>{selectedAlertRule.prometheusRule}</DescriptionListDescription>
                            </DescriptionListGroup>
                            {selectedAlertRule.runbookUrl && (
                              <DescriptionListGroup>
                                <DescriptionListTerm>Runbook</DescriptionListTerm>
                                <DescriptionListDescription>
                                  <Button variant="link" isInline>{selectedAlertRule.runbookUrl}</Button>
                                </DescriptionListDescription>
                              </DescriptionListGroup>
                            )}
                            {selectedAlertRule.dashboards && (
                              <DescriptionListGroup>
                                <DescriptionListTerm>
                                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                    <FlexItem>Dashboards</FlexItem>
                                    <FlexItem>
                                      <Tooltip content="Related dashboards for this alert">
                                        <QuestionCircleIcon style={{ color: 'var(--pf-t--global--icon--color--subtle)' }} />
                                      </Tooltip>
                                    </FlexItem>
                                  </Flex>
                                </DescriptionListTerm>
                                <DescriptionListDescription>{selectedAlertRule.dashboards}</DescriptionListDescription>
                              </DescriptionListGroup>
                            )}
                          </DescriptionList>
                        </StackItem>

                        <StackItem>
                          <Title headingLevel="h4" size="md" style={{ marginTop: '16px', marginBottom: '16px' }}>Notifications</Title>
                          <DescriptionList isCompact isHorizontal>
                            <DescriptionListGroup>
                              <DescriptionListTerm>Summary</DescriptionListTerm>
                              <DescriptionListDescription>{selectedAlertRule.summary}</DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>Description</DescriptionListTerm>
                              <DescriptionListDescription>{selectedAlertRule.description}</DescriptionListDescription>
                            </DescriptionListGroup>
                            {selectedAlertRule.notificationMatchers && (
                              <DescriptionListGroup>
                                <DescriptionListTerm>Notification matchers</DescriptionListTerm>
                                <DescriptionListDescription>
                                  <Flex gap={{ default: 'gapSm' }}>
                                    {selectedAlertRule.notificationMatchers.map((matcher, idx) => (
                                      <FlexItem key={idx}>
                                        <Label isCompact variant="outline">{matcher}</Label>
                                      </FlexItem>
                                    ))}
                                  </Flex>
                                </DescriptionListDescription>
                              </DescriptionListGroup>
                            )}
                            {selectedAlertRule.receivedBy && (
                              <DescriptionListGroup>
                                <DescriptionListTerm>Received by</DescriptionListTerm>
                                <DescriptionListDescription>{selectedAlertRule.receivedBy}</DescriptionListDescription>
                              </DescriptionListGroup>
                            )}
                            {selectedAlertRule.receivers && (
                              <DescriptionListGroup>
                                <DescriptionListTerm>Receivers</DescriptionListTerm>
                                <DescriptionListDescription>{selectedAlertRule.receivers.join(', ')}</DescriptionListDescription>
                              </DescriptionListGroup>
                            )}
                          </DescriptionList>
                        </StackItem>

                        <StackItem>
                          <Title headingLevel="h4" size="md" style={{ marginTop: '16px', marginBottom: '16px' }}>Alert rule history</Title>
                          <DescriptionList isCompact isHorizontal>
                            <DescriptionListGroup>
                              <DescriptionListTerm>Created at</DescriptionListTerm>
                              <DescriptionListDescription>{selectedAlertRule.createdAt}</DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>Created by</DescriptionListTerm>
                              <DescriptionListDescription>{selectedAlertRule.createdBy}</DescriptionListDescription>
                            </DescriptionListGroup>
                            {selectedAlertRule.modificationHistory.length > 0 && (
                              <DescriptionListGroup>
                                <DescriptionListTerm>Modified at</DescriptionListTerm>
                                <DescriptionListDescription>
                                  <Stack hasGutter>
                                    {selectedAlertRule.modificationHistory.map((mod, idx) => (
                                      <StackItem key={idx}>
                                        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                                          <FlexItem>{mod.date} by {mod.user}</FlexItem>
                                          <FlexItem>
                                            <Button variant="link" isInline>View changes</Button>
                                          </FlexItem>
                                        </Flex>
                                      </StackItem>
                                    ))}
                                  </Stack>
                                </DescriptionListDescription>
                              </DescriptionListGroup>
                            )}
                          </DescriptionList>
                        </StackItem>
                      </Stack>
                    </div>
                  </Tab>
                  <Tab eventKey="active-alerts" title={<TabTitleText>Active alerts</TabTitleText>}>
                    <div style={{ padding: '16px', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
                      <Stack hasGutter>
                        <StackItem>
                          <Card>
                            <CardBody>
                              <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                                <FlexItem>
                                  <Title headingLevel="h4" size="md">Target clusters alerts</Title>
                                </FlexItem>
                                <FlexItem>
                                  <Select
                                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                      <MenuToggle ref={toggleRef} onClick={() => setIsAlertRuleTargetClusterFilterOpen(!isAlertRuleTargetClusterFilterOpen)} isExpanded={isAlertRuleTargetClusterFilterOpen}>
                                        {alertRuleTargetClusterFilter === 'all' ? `All target clusters (${selectedAlertRule.targetClusters.length})` : alertRuleTargetClusterFilter}
                                      </MenuToggle>
                                    )}
                                    isOpen={isAlertRuleTargetClusterFilterOpen}
                                    onOpenChange={setIsAlertRuleTargetClusterFilterOpen}
                                    onSelect={(_, val) => { setAlertRuleTargetClusterFilter(val as string); setIsAlertRuleTargetClusterFilterOpen(false); }}
                                  >
                                    <SelectList>
                                      <SelectOption value="all">All target clusters ({selectedAlertRule.targetClusters.length})</SelectOption>
                                      {selectedAlertRule.targetClusters.map((cluster, idx) => (
                                        <SelectOption key={idx} value={cluster}>{cluster}</SelectOption>
                                      ))}
                                    </SelectList>
                                  </Select>
                                </FlexItem>
                              </Flex>
                            </CardBody>
                          </Card>
                        </StackItem>
                        <StackItem>
                          <Accordion asDefinitionList={false}>
                            <AccordionItem isExpanded>
                              <AccordionToggle onClick={() => {}} id="alerts-timeline-toggle-v2">
                                Alerts timeline
                              </AccordionToggle>
                              <AccordionContent>
                                <Stack hasGutter>
                                  <StackItem>
                                    <Flex gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsCenter' }}>
                                      <FlexItem>
                                        <Select
                                          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                            <MenuToggle ref={toggleRef} onClick={() => setIsAlertRuleTimelineRangeOpen(!isAlertRuleTimelineRangeOpen)} isExpanded={isAlertRuleTimelineRangeOpen} variant="secondary">
                                              <ClockIcon /> {alertRuleTimelineRange}
                                            </MenuToggle>
                                          )}
                                          isOpen={isAlertRuleTimelineRangeOpen}
                                          onOpenChange={setIsAlertRuleTimelineRangeOpen}
                                          onSelect={(_, val) => { setAlertRuleTimelineRange(val as string); setIsAlertRuleTimelineRangeOpen(false); }}
                                        >
                                          <SelectList>
                                            <SelectOption value="15 minutes">15 minutes</SelectOption>
                                            <SelectOption value="30 minutes">30 minutes</SelectOption>
                                            <SelectOption value="1 hour">1 hour</SelectOption>
                                            <SelectOption value="6 hours">6 hours</SelectOption>
                                            <SelectOption value="24 hours">24 hours</SelectOption>
                                          </SelectList>
                                        </Select>
                                      </FlexItem>
                                      <FlexItem>
                                        <Button variant="link">Reset zoom</Button>
                                      </FlexItem>
                                    </Flex>
                                  </StackItem>
                                  <StackItem>
                                    <div style={{ height: '200px', backgroundColor: 'var(--pf-t--global--background--color--secondary--default)', borderRadius: '4px', padding: '16px' }}>
                                      {/* Mock chart area */}
                                      <ReactECharts
                                        option={{
                                          grid: { top: 20, right: 20, bottom: 40, left: 40 },
                                          xAxis: {
                                            type: 'category',
                                            data: ['12:15 PM', '12:20 PM', '12:25 PM', '12:30 PM', '12:35 PM', '12:40 PM'],
                                            axisLine: { lineStyle: { color: 'var(--pf-t--global--border--color--default)' } },
                                            axisLabel: { color: 'var(--pf-t--global--text--color--subtle)' },
                                          },
                                          yAxis: {
                                            type: 'value',
                                            min: 0,
                                            max: 10,
                                            axisLine: { lineStyle: { color: 'var(--pf-t--global--border--color--default)' } },
                                            axisLabel: { color: 'var(--pf-t--global--text--color--subtle)' },
                                            splitLine: { lineStyle: { color: 'var(--pf-t--global--border--color--default)', type: 'dashed' } },
                                          },
                                          series: [
                                            {
                                              name: 'Series 1',
                                              type: 'line',
                                              data: [7, 5, 8, 9, 8, 10],
                                              lineStyle: { color: 'var(--pf-t--global--color--status--info--default)' },
                                              itemStyle: { color: 'var(--pf-t--global--color--status--info--default)' },
                                            },
                                            {
                                              name: 'Series 2',
                                              type: 'line',
                                              data: [6, 4, 6, 5, 6, 4],
                                              lineStyle: { color: 'var(--pf-t--global--color--status--info--default)', type: 'dashed' },
                                              itemStyle: { color: 'var(--pf-t--global--color--status--info--default)' },
                                            },
                                          ],
                                          tooltip: { trigger: 'axis' },
                                        }}
                                        style={{ height: '100%' }}
                                      />
                                    </div>
                                  </StackItem>
                                  <StackItem>
                                    <Flex gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsCenter' }}>
                                      <FlexItem>Inspect metric</FlexItem>
                                      <FlexItem>
                                        <Tooltip content="Inspect the metric in the console">
                                          <ExternalLinkAltIcon style={{ color: 'var(--pf-t--global--icon--color--subtle)' }} />
                                        </Tooltip>
                                      </FlexItem>
                                    </Flex>
                                  </StackItem>
                                </Stack>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </StackItem>
                        <StackItem>
                          <Title headingLevel="h4" size="md">Active alerts</Title>
                        </StackItem>
                        {selectedAlertRule.activeAlerts.length === 0 ? (
                          <StackItem>
                            <Content component="p" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>No active alerts</Content>
                          </StackItem>
                        ) : (
                          selectedAlertRule.activeAlerts.map((alert, idx) => (
                            <StackItem key={idx}>
                              <Card isClickable onClick={() => {
                                if (alertRuleExpandedAlerts.includes(alert.id)) {
                                  setAlertRuleExpandedAlerts(alertRuleExpandedAlerts.filter(a => a !== alert.id));
                                } else {
                                  setAlertRuleExpandedAlerts([...alertRuleExpandedAlerts, alert.id]);
                                }
                              }}>
                                <CardBody>
                                  <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                                    <FlexItem style={{ flex: 1 }}>
                                      <Content>{alert.message}</Content>
                                    </FlexItem>
                                    <FlexItem>
                                      {alertRuleExpandedAlerts.includes(alert.id) ? <AngleDownIcon /> : <AngleRightIcon />}
                                    </FlexItem>
                                  </Flex>
                                  {alertRuleExpandedAlerts.includes(alert.id) && (
                                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--pf-t--global--border--color--default)' }}>
                                      <DescriptionList isCompact isHorizontal>
                                        <DescriptionListGroup>
                                          <DescriptionListTerm>Name</DescriptionListTerm>
                                          <DescriptionListDescription>{selectedAlertRule.description}</DescriptionListDescription>
                                        </DescriptionListGroup>
                                        <DescriptionListGroup>
                                          <DescriptionListTerm>Active since</DescriptionListTerm>
                                          <DescriptionListDescription>{alert.activeSince}</DescriptionListDescription>
                                        </DescriptionListGroup>
                                        <DescriptionListGroup>
                                          <DescriptionListTerm>State</DescriptionListTerm>
                                          <DescriptionListDescription>{alert.state}</DescriptionListDescription>
                                        </DescriptionListGroup>
                                        <DescriptionListGroup>
                                          <DescriptionListTerm>Value</DescriptionListTerm>
                                          <DescriptionListDescription>{alert.value}</DescriptionListDescription>
                                        </DescriptionListGroup>
                                        <DescriptionListGroup>
                                          <DescriptionListTerm>Resource</DescriptionListTerm>
                                          <DescriptionListDescription>{alert.resource}</DescriptionListDescription>
                                        </DescriptionListGroup>
                                        <DescriptionListGroup>
                                          <DescriptionListTerm>Cluster</DescriptionListTerm>
                                          <DescriptionListDescription>{alert.cluster}</DescriptionListDescription>
                                        </DescriptionListGroup>
                                      </DescriptionList>
                                    </div>
                                  )}
                                </CardBody>
                              </Card>
                            </StackItem>
                          ))
                        )}
                      </Stack>
                    </div>
                  </Tab>
                  <Tab eventKey="yaml" title={<TabTitleText>YAML</TabTitleText>}>
                    <div style={{ padding: '16px', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
                      <CodeBlock>
                        <CodeBlockCode>
{`apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: ${selectedAlertRule.name.toLowerCase().replace(/\s+/g, '-')}
  namespace: openshift-monitoring
  labels:
    prometheus: cluster-monitoring
spec:
  groups:
  - name: ${selectedAlertRule.group.toLowerCase()}-alerts
    rules:
    - alert: ${selectedAlertRule.name}
      expr: ${selectedAlertRule.expression}
      for: ${selectedAlertRule.forDuration}
      labels:
        severity: ${selectedAlertRule.severity.toLowerCase()}
        component: ${selectedAlertRule.component}
        group: ${selectedAlertRule.group.toLowerCase()}
      annotations:
        summary: "${selectedAlertRule.summary}"
        description: "${selectedAlertRule.description}"
        runbook_url: "${selectedAlertRule.runbookUrl || ''}"
        dashboard: "${selectedAlertRule.dashboards || ''}"
# Target clusters: ${selectedAlertRule.targetClusters.join(', ')}`}
                        </CodeBlockCode>
                      </CodeBlock>
                    </div>
                  </Tab>
                </Tabs>
                </div>
        </div>
      </div>
      )}
      
      {/* Disable Alert Rule Modal */}
      <Modal
        isOpen={isDisableAlertRuleModalOpen}
        onClose={() => setIsDisableAlertRuleModalOpen(false)}
        aria-labelledby="disable-alert-rule-modal-title-v2"
        aria-describedby="disable-alert-rule-modal-body-v2"
        variant="medium"
      >
        <ModalHeader
          title={
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
              <FlexItem>
                <ExclamationTriangleIcon color="var(--pf-t--global--color--status--warning--default)" />
              </FlexItem>
              <FlexItem>
                {alertRulesToDisable.length === 1 ? 'Disable alert rule?' : 'Disable alert rules?'}
              </FlexItem>
            </Flex>
          }
          labelId="disable-alert-rule-modal-title-v2"
          description="Stop the rule from running altogether."
        />
        <ModalBody id="disable-alert-rule-modal-body-v2">
          <Stack hasGutter>
            {alertRulesToDisable.length === 1 ? (
              <>
                {/* Single alert rule disable */}
                <StackItem>
                  <Content component="p">
                    If you disable this alert rule, you'll no longer receive notifications when the conditions it monitors are met. This can lead to undetected issues that might impact your system's performance or availability.
                  </Content>
                </StackItem>
                <StackItem>
                  <Content component="p"><strong>Alert Details:</strong></Content>
                  <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    <li><strong>Name</strong>: {alertRulesToDisable[0]?.name}</li>
                    <li><strong>Description</strong>: {alertRulesToDisable[0]?.description}</li>
                    <li><strong>Severity</strong>: {alertRulesToDisable[0]?.severity}</li>
                    <li><strong>Group</strong>: {alertRulesToDisable[0]?.group}</li>
                    <li><strong>Component:</strong> {alertRulesToDisable[0]?.component}</li>
                  </ul>
                </StackItem>
              </>
            ) : (
              <>
                {/* Bulk alert rules disable */}
                <StackItem>
                  <Content component="p"><strong>Are you sure you want to disable {alertRulesToDisable.length} selected alert rule{alertRulesToDisable.length > 1 ? 's' : ''}?</strong></Content>
                  <Content component="p" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                    Disabling an alert rule means you will no longer receive notifications when the conditions it monitors are met. This could lead to undetected issues that might impact your system's performance or availability.
                  </Content>
                </StackItem>
                <StackItem>
                  <Card>
                    <CardBody>
                      <Content component="p"><strong>The following Alerts will be disabled:</strong></Content>
                      <div style={{ marginTop: '16px' }}>
                        {alertRulesToDisable.map((rule) => (
                          <div key={rule.id} style={{ marginBottom: '8px' }}>
                            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                              <FlexItem>
                                <Button 
                                  variant="plain" 
                                  aria-label="Toggle details"
                                  onClick={() => {
                                    if (disableAlertRuleExpandedIds.includes(rule.id)) {
                                      setDisableAlertRuleExpandedIds(disableAlertRuleExpandedIds.filter(id => id !== rule.id));
                                    } else {
                                      setDisableAlertRuleExpandedIds([...disableAlertRuleExpandedIds, rule.id]);
                                    }
                                  }}
                                >
                                  {disableAlertRuleExpandedIds.includes(rule.id) ? <AngleDownIcon /> : <AngleRightIcon />}
                                </Button>
                              </FlexItem>
                              <FlexItem>
                                {rule.severity === 'Critical' && <ExclamationCircleIcon color="var(--pf-t--global--color--status--danger--default)" />}
                                {rule.severity === 'Warning' && <ExclamationTriangleIcon color="var(--pf-t--global--color--status--warning--default)" />}
                                {rule.severity === 'Info' && <InfoCircleIcon color="var(--pf-t--global--color--status--info--default)" />}
                              </FlexItem>
                              <FlexItem>{rule.name}</FlexItem>
                            </Flex>
                            {disableAlertRuleExpandedIds.includes(rule.id) && (
                              <div style={{ marginLeft: '48px', marginTop: '8px', padding: '8px', backgroundColor: 'var(--pf-t--global--background--color--secondary--default)', borderRadius: '4px' }}>
                                <Content component="small">
                                  <div><strong>Description:</strong> {rule.description}</div>
                                  <div><strong>Severity:</strong> {rule.severity}</div>
                                  <div><strong>Group:</strong> {rule.group}</div>
                                  <div><strong>Component:</strong> {rule.component}</div>
                                </Content>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                </StackItem>
              </>
            )}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button 
            variant="primary" 
            onClick={() => {
              addToast(`${alertRulesToDisable.length === 1 ? 'Alert rule' : `${alertRulesToDisable.length} alert rules`} disabled successfully`, 'success');
              setIsDisableAlertRuleModalOpen(false);
              setAlertRulesToDisable([]);
              setSelectedAlertRuleIds([]);
            }}
          >
            Disable {alertRulesToDisable.length > 1 ? `${alertRulesToDisable.length} alerts` : 'alert'}
          </Button>
          <Button variant="secondary" onClick={() => {
            // Open silence modal instead
            setIsDisableAlertRuleModalOpen(false);
          }}>
            Silence instead
          </Button>
          <Button variant="link" onClick={() => {
            setIsDisableAlertRuleModalOpen(false);
            setAlertRulesToDisable([]);
          }}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Environment Grouping Settings Modal */}
      <Modal
        isOpen={isEnvironmentSettingsOpen}
        onClose={() => setIsEnvironmentSettingsOpen(false)}
        variant="medium"
        aria-labelledby="environment-settings-modal-title"
      >
        <ModalHeader
          title="Environment grouping settings"
          labelId="environment-settings-modal-title"
        />
        <ModalBody>
          <Stack hasGutter>
            <StackItem>
              <PfAlert variant="info" isInline title="Group your clusters by mapping name patterns to specific environments">
                <Content component="p">
                  Group your clusters by mapping name patterns to specific environments. We process these rules in order—the first match determines the cluster's group.
                </Content>
              </PfAlert>
            </StackItem>
            
            {tempEnvironmentCategories.map((category, categoryIdx) => (
              <StackItem key={category.id}>
                <Card>
                  <CardBody>
                    <Stack hasGutter>
                      <StackItem>
                        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                          <FlexItem>
                            <Content component="h4">
                              <strong>Category label</strong>
                            </Content>
                          </FlexItem>
                          <FlexItem>
                            <Button
                              variant="plain"
                              icon={<TrashIcon />}
                              aria-label="Delete category"
                              onClick={() => {
                                setTempEnvironmentCategories(tempEnvironmentCategories.filter((_, idx) => idx !== categoryIdx));
                              }}
                            />
                          </FlexItem>
                        </Flex>
                      </StackItem>
                      <StackItem>
                        <TextInput
                          value={category.label}
                          onChange={(_, value) => {
                            const updated = [...tempEnvironmentCategories];
                            updated[categoryIdx] = { ...updated[categoryIdx], label: value };
                            setTempEnvironmentCategories(updated);
                          }}
                          aria-label="Category label"
                        />
                      </StackItem>
                      <StackItem>
                        <Content component="h4">
                          <strong>Matching patterns</strong>
                        </Content>
                      </StackItem>
                      <StackItem>
                        <LabelGroup>
                          {category.patterns.map((pattern, patternIdx) => (
                            <Label
                              key={patternIdx}
                              color="grey"
                              onClose={() => {
                                const updated = [...tempEnvironmentCategories];
                                updated[categoryIdx] = {
                                  ...updated[categoryIdx],
                                  patterns: updated[categoryIdx].patterns.filter((_, idx) => idx !== patternIdx),
                                };
                                setTempEnvironmentCategories(updated);
                              }}
                            >
                              {pattern}
                            </Label>
                          ))}
                        </LabelGroup>
                      </StackItem>
                      <StackItem>
                        <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                          <FlexItem flex={{ default: 'flex_1' }}>
                            <TypeaheadSelect
                              initialOptions={availableLabelKeys}
                              placeholder="Select or enter label key"
                              onSelect={(_, selection) => {
                                if (selection && typeof selection === 'string') {
                                  const updated = [...tempEnvironmentCategories];
                                  updated[categoryIdx] = {
                                    ...updated[categoryIdx],
                                    patterns: [...updated[categoryIdx].patterns, selection],
                                  };
                                  setTempEnvironmentCategories(updated);
                                  setNewPatternInputs({ ...newPatternInputs, [category.id]: '' });
                                }
                              }}
                              isCreatable
                              createOptionMessage={(newValue) => `Add label key: ${newValue}`}
                            />
                          </FlexItem>
                        </Flex>
                      </StackItem>
                    </Stack>
                  </CardBody>
                </Card>
              </StackItem>
            ))}
            
            <StackItem>
              <Button
                variant="link"
                icon={<PlusIcon />}
                onClick={() => {
                  const newId = `category-${Date.now()}`;
                  setTempEnvironmentCategories([
                    ...tempEnvironmentCategories,
                    {
                      id: newId,
                      label: 'New Category',
                      color: 'purple',
                      patterns: [],
                    },
                  ]);
                }}
              >
                Add category
              </Button>
            </StackItem>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="primary"
            onClick={() => {
              setEnvironmentCategories(tempEnvironmentCategories);
              setIsEnvironmentSettingsOpen(false);
            }}
          >
            Save changes
          </Button>
          <Button
            variant="link"
            onClick={() => setIsEnvironmentSettingsOpen(false)}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Team Grouping Settings Modal */}
      <Modal
        isOpen={isTeamSettingsOpen}
        onClose={() => setIsTeamSettingsOpen(false)}
        variant="medium"
        aria-labelledby="team-settings-modal-title"
      >
        <ModalHeader
          title="Team grouping settings"
          labelId="team-settings-modal-title"
        />
        <ModalBody>
          <Stack hasGutter>
            <StackItem>
              <PfAlert variant="info" isInline title="Group your clusters by mapping name patterns to specific teams">
                <Content component="p">
                  Group your clusters by mapping name patterns to specific teams. We process these rules in order—the first match determines the cluster's group.
                </Content>
              </PfAlert>
            </StackItem>
            
            {tempTeamCategories.map((category, categoryIdx) => (
              <StackItem key={category.id}>
                <Card>
                  <CardBody>
                    <Stack hasGutter>
                      <StackItem>
                        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                          <FlexItem>
                            <Content component="h4">
                              <strong>Category label</strong>
                            </Content>
                          </FlexItem>
                          <FlexItem>
                            <Button
                              variant="plain"
                              icon={<TrashIcon />}
                              aria-label="Delete category"
                              onClick={() => {
                                setTempTeamCategories(tempTeamCategories.filter((_, idx) => idx !== categoryIdx));
                              }}
                            />
                          </FlexItem>
                        </Flex>
                      </StackItem>
                      <StackItem>
                        <TextInput
                          value={category.label}
                          onChange={(_, value) => {
                            const updated = [...tempTeamCategories];
                            updated[categoryIdx] = { ...updated[categoryIdx], label: value };
                            setTempTeamCategories(updated);
                          }}
                          aria-label="Category label"
                        />
                      </StackItem>
                      <StackItem>
                        <Content component="h4">
                          <strong>Matching patterns</strong>
                        </Content>
                      </StackItem>
                      <StackItem>
                        <LabelGroup>
                          {category.patterns.map((pattern, patternIdx) => (
                            <Label
                              key={patternIdx}
                              color="grey"
                              onClose={() => {
                                const updated = [...tempTeamCategories];
                                updated[categoryIdx] = {
                                  ...updated[categoryIdx],
                                  patterns: updated[categoryIdx].patterns.filter((_, idx) => idx !== patternIdx),
                                };
                                setTempTeamCategories(updated);
                              }}
                            >
                              {pattern}
                            </Label>
                          ))}
                        </LabelGroup>
                      </StackItem>
                      <StackItem>
                        <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                          <FlexItem flex={{ default: 'flex_1' }}>
                            <TypeaheadSelect
                              initialOptions={availableLabelKeys}
                              placeholder="Select or enter label key"
                              onSelect={(_, selection) => {
                                if (selection && typeof selection === 'string') {
                                  const updated = [...tempTeamCategories];
                                  updated[categoryIdx] = {
                                    ...updated[categoryIdx],
                                    patterns: [...updated[categoryIdx].patterns, selection],
                                  };
                                  setTempTeamCategories(updated);
                                  setNewTeamPatternInputs({ ...newTeamPatternInputs, [category.id]: '' });
                                }
                              }}
                              isCreatable
                              createOptionMessage={(newValue) => `Add label key: ${newValue}`}
                            />
                          </FlexItem>
                        </Flex>
                      </StackItem>
                    </Stack>
                  </CardBody>
                </Card>
              </StackItem>
            ))}
            
            <StackItem>
              <Button
                variant="link"
                icon={<PlusIcon />}
                onClick={() => {
                  const newId = `category-${Date.now()}`;
                  setTempTeamCategories([
                    ...tempTeamCategories,
                    {
                      id: newId,
                      label: 'New Category',
                      color: 'purple',
                      patterns: [],
                    },
                  ]);
                }}
              >
                Add category
              </Button>
            </StackItem>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="primary"
            onClick={() => {
              setTeamCategories(tempTeamCategories);
              setIsTeamSettingsOpen(false);
            }}
          >
            Save changes
          </Button>
          <Button
            variant="link"
            onClick={() => setIsTeamSettingsOpen(false)}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export { MultiClusterAlertingDashboard };

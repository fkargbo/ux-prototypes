import * as React from 'react';
import {
  PageSection,
  Title,
  Content,
  Grid,
  GridItem,
  Card,
  CardTitle,
  CardBody,
  CardHeader,
  CardExpandableContent,
  Flex,
  FlexItem,
  Stack,
  Label,
  LabelGroup,
  Button,
  Divider,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  SearchInput,
  Select,
  SelectOption,
  MenuToggle,
  MenuToggleElement,
  Tab,
  Tabs,
  TabTitleText,
  Panel,
  PanelMain,
  PanelMainBody,
  EmptyState,
  EmptyStateBody,
  EmptyStateActions,
  EmptyStateFooter,
  Spinner,
  ExpandableSection,
  TextInput,
  Dropdown,
  DropdownList,
  DropdownItem,
  Badge,
  Icon,
  Tooltip,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
  CubesIcon,
  ServerIcon,
  TimesCircleIcon,
  ArrowRightIcon,
  EllipsisVIcon,
  SearchIcon,
  FilterIcon,
  SyncAltIcon,
  OutlinedClockIcon,
  BellIcon,
  CogIcon,
  ExternalLinkAltIcon,
  AngleDownIcon,
  AngleRightIcon,
} from '@patternfly/react-icons';
import { ChartDonut, ChartBar, ChartThemeColor, ChartLegend, ChartArea, ChartGroup, ChartVoronoiContainer, ChartAxis, ChartStack } from '@patternfly/react-charts/victory';

// ========================================
// DATA TYPES
// ========================================

type ClusterStatus = 'healthy' | 'warning' | 'critical' | 'unknown';

interface ClusterMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  podCount: number;
  nodeCount: number;
  networkLatency: number;
}

interface ClusterAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  cluster: string;
  component?: string;
}

interface ClusterData {
  id: string;
  name: string;
  region: string;
  status: ClusterStatus;
  version: string;
  provider: string;
  metrics: ClusterMetrics;
  alerts: ClusterAlert[];
  lastUpdated: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info' | 'debug';
  source: string;
  message: string;
  cluster: string;
}

// ========================================
// MOCK DATA
// ========================================

const mockClusters: ClusterData[] = [
  {
    id: 'cluster-prod-us-east',
    name: 'prod-us-east-1',
    region: 'US East (N. Virginia)',
    status: 'healthy',
    version: '1.28.4',
    provider: 'AWS',
    metrics: {
      cpuUsage: 42,
      memoryUsage: 67,
      diskUsage: 45,
      podCount: 156,
      nodeCount: 12,
      networkLatency: 2.3,
    },
    alerts: [],
    lastUpdated: '2 minutes ago',
  },
  {
    id: 'cluster-prod-us-west',
    name: 'prod-us-west-2',
    region: 'US West (Oregon)',
    status: 'warning',
    version: '1.28.4',
    provider: 'AWS',
    metrics: {
      cpuUsage: 78,
      memoryUsage: 82,
      diskUsage: 71,
      podCount: 203,
      nodeCount: 15,
      networkLatency: 4.1,
    },
    alerts: [
      {
        id: 'alert-1',
        severity: 'warning',
        title: 'High memory utilization',
        description: 'Memory usage has exceeded 80% threshold on 3 nodes',
        timestamp: '15 minutes ago',
        cluster: 'prod-us-west-2',
        component: 'Node Pool',
      },
      {
        id: 'alert-2',
        severity: 'warning',
        title: 'Pod scheduling delays',
        description: 'Pods are experiencing scheduling delays due to resource constraints',
        timestamp: '23 minutes ago',
        cluster: 'prod-us-west-2',
        component: 'Scheduler',
      },
    ],
    lastUpdated: '1 minute ago',
  },
  {
    id: 'cluster-prod-eu-central',
    name: 'prod-eu-central-1',
    region: 'EU (Frankfurt)',
    status: 'critical',
    version: '1.27.8',
    provider: 'AWS',
    metrics: {
      cpuUsage: 91,
      memoryUsage: 88,
      diskUsage: 84,
      podCount: 178,
      nodeCount: 10,
      networkLatency: 12.5,
    },
    alerts: [
      {
        id: 'alert-3',
        severity: 'critical',
        title: 'Node not ready',
        description: 'Node ip-10-0-45-123 has been in NotReady state for 10 minutes',
        timestamp: '10 minutes ago',
        cluster: 'prod-eu-central-1',
        component: 'Node',
      },
      {
        id: 'alert-4',
        severity: 'critical',
        title: 'High CPU utilization',
        description: 'CPU usage has exceeded 90% threshold across the cluster',
        timestamp: '8 minutes ago',
        cluster: 'prod-eu-central-1',
        component: 'Cluster',
      },
      {
        id: 'alert-5',
        severity: 'warning',
        title: 'Disk pressure detected',
        description: 'Multiple nodes are reporting disk pressure conditions',
        timestamp: '5 minutes ago',
        cluster: 'prod-eu-central-1',
        component: 'Storage',
      },
    ],
    lastUpdated: '30 seconds ago',
  },
  {
    id: 'cluster-staging-us-east',
    name: 'staging-us-east-1',
    region: 'US East (N. Virginia)',
    status: 'healthy',
    version: '1.29.0',
    provider: 'AWS',
    metrics: {
      cpuUsage: 23,
      memoryUsage: 41,
      diskUsage: 32,
      podCount: 67,
      nodeCount: 5,
      networkLatency: 1.8,
    },
    alerts: [],
    lastUpdated: '5 minutes ago',
  },
  {
    id: 'cluster-dev-gcp',
    name: 'dev-gcp-central',
    region: 'GCP US Central',
    status: 'healthy',
    version: '1.28.5',
    provider: 'GCP',
    metrics: {
      cpuUsage: 15,
      memoryUsage: 28,
      diskUsage: 19,
      podCount: 34,
      nodeCount: 3,
      networkLatency: 1.2,
    },
    alerts: [],
    lastUpdated: '3 minutes ago',
  },
];

const mockLogs: LogEntry[] = [
  {
    id: 'log-1',
    timestamp: '2024-01-15 14:32:15',
    level: 'error',
    source: 'kubelet',
    message: 'Failed to pull image "nginx:latest": rpc error: code = Unknown',
    cluster: 'prod-eu-central-1',
  },
  {
    id: 'log-2',
    timestamp: '2024-01-15 14:31:42',
    level: 'warning',
    source: 'scheduler',
    message: 'Unable to schedule pod: insufficient cpu',
    cluster: 'prod-us-west-2',
  },
  {
    id: 'log-3',
    timestamp: '2024-01-15 14:30:58',
    level: 'error',
    source: 'controller-manager',
    message: 'Node ip-10-0-45-123 is not ready',
    cluster: 'prod-eu-central-1',
  },
  {
    id: 'log-4',
    timestamp: '2024-01-15 14:29:33',
    level: 'info',
    source: 'api-server',
    message: 'Successful authentication for user admin',
    cluster: 'prod-us-east-1',
  },
  {
    id: 'log-5',
    timestamp: '2024-01-15 14:28:12',
    level: 'warning',
    source: 'etcd',
    message: 'High latency detected in etcd cluster',
    cluster: 'prod-eu-central-1',
  },
];

// ========================================
// HELPER COMPONENTS
// ========================================

const StatusIcon: React.FC<{ status: ClusterStatus }> = ({ status }) => {
  switch (status) {
    case 'healthy':
      return <Icon status="success"><CheckCircleIcon /></Icon>;
    case 'warning':
      return <Icon status="warning"><ExclamationTriangleIcon /></Icon>;
    case 'critical':
      return <Icon status="danger"><ExclamationCircleIcon /></Icon>;
    default:
      return <Icon status="info"><InfoCircleIcon /></Icon>;
  }
};

const SeverityIcon: React.FC<{ severity: 'critical' | 'warning' | 'info' }> = ({ severity }) => {
  switch (severity) {
    case 'critical':
      return <Icon status="danger"><ExclamationCircleIcon /></Icon>;
    case 'warning':
      return <Icon status="warning"><ExclamationTriangleIcon /></Icon>;
    default:
      return <Icon status="info"><InfoCircleIcon /></Icon>;
  }
};

const getStatusLabel = (status: ClusterStatus): React.ReactNode => {
  switch (status) {
    case 'healthy':
      return <Label color="green" icon={<CheckCircleIcon />}>Healthy</Label>;
    case 'warning':
      return <Label color="orange" icon={<ExclamationTriangleIcon />}>Warning</Label>;
    case 'critical':
      return <Label color="red" icon={<ExclamationCircleIcon />}>Critical</Label>;
    default:
      return <Label color="grey" icon={<InfoCircleIcon />}>Unknown</Label>;
  }
};

const LogLevelLabel: React.FC<{ level: LogEntry['level'] }> = ({ level }) => {
  switch (level) {
    case 'error':
      return <Label color="red" isCompact>ERROR</Label>;
    case 'warning':
      return <Label color="orange" isCompact>WARN</Label>;
    case 'info':
      return <Label color="blue" isCompact>INFO</Label>;
    case 'debug':
      return <Label color="grey" isCompact>DEBUG</Label>;
  }
};

// ========================================
// MAIN DASHBOARD COMPONENT
// ========================================

const Dashboard: React.FunctionComponent = () => {
  const [selectedCluster, setSelectedCluster] = React.useState<ClusterData | null>(null);
  const [searchValue, setSearchValue] = React.useState('');
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [expandedAlerts, setExpandedAlerts] = React.useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Filter clusters based on search and status
  const filteredClusters = React.useMemo(() => {
    return mockClusters.filter((cluster) => {
      const matchesSearch = cluster.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        cluster.region.toLowerCase().includes(searchValue.toLowerCase());
      const matchesStatus = statusFilter === 'all' || cluster.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchValue, statusFilter]);

  // Aggregate metrics
  const aggregateMetrics = React.useMemo(() => {
    const healthy = mockClusters.filter((c) => c.status === 'healthy').length;
    const warning = mockClusters.filter((c) => c.status === 'warning').length;
    const critical = mockClusters.filter((c) => c.status === 'critical').length;
    const totalAlerts = mockClusters.reduce((sum, c) => sum + c.alerts.length, 0);
    const criticalAlerts = mockClusters.reduce(
      (sum, c) => sum + c.alerts.filter((a) => a.severity === 'critical').length,
      0
    );
    const warningAlerts = mockClusters.reduce(
      (sum, c) => sum + c.alerts.filter((a) => a.severity === 'warning').length,
      0
    );
    const totalNodes = mockClusters.reduce((sum, c) => sum + c.metrics.nodeCount, 0);
    const totalPods = mockClusters.reduce((sum, c) => sum + c.metrics.podCount, 0);
    const avgCpu = Math.round(
      mockClusters.reduce((sum, c) => sum + c.metrics.cpuUsage, 0) / mockClusters.length
    );
    const avgMemory = Math.round(
      mockClusters.reduce((sum, c) => sum + c.metrics.memoryUsage, 0) / mockClusters.length
    );

    return {
      healthy,
      warning,
      critical,
      totalAlerts,
      criticalAlerts,
      warningAlerts,
      totalNodes,
      totalPods,
      avgCpu,
      avgMemory,
      total: mockClusters.length,
    };
  }, []);

  // All alerts sorted by severity
  const allAlerts = React.useMemo(() => {
    return mockClusters
      .flatMap((c) => c.alerts)
      .sort((a, b) => {
        const severityOrder = { critical: 0, warning: 1, info: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const toggleAlertExpanded = (alertId: string) => {
    const newExpanded = new Set(expandedAlerts);
    if (newExpanded.has(alertId)) {
      newExpanded.delete(alertId);
    } else {
      newExpanded.add(alertId);
    }
    setExpandedAlerts(newExpanded);
  };

  // ========================================
  // CLUSTER OVERVIEW DONUT CHART
  // ========================================
  const ClusterHealthDonut = () => (
    <div style={{ height: '230px', width: '230px' }}>
      <ChartDonut
        ariaDesc="Cluster health distribution"
        ariaTitle="Cluster Health Status"
        constrainToVisibleArea
        data={[
          { x: 'Healthy', y: aggregateMetrics.healthy },
          { x: 'Warning', y: aggregateMetrics.warning },
          { x: 'Critical', y: aggregateMetrics.critical },
        ]}
        labels={({ datum }) => `${datum.x}: ${datum.y}`}
        legendData={[
          { name: `Healthy: ${aggregateMetrics.healthy}` },
          { name: `Warning: ${aggregateMetrics.warning}` },
          { name: `Critical: ${aggregateMetrics.critical}` },
        ]}
        legendOrientation="vertical"
        legendPosition="right"
        name="cluster-health-donut"
        padding={{
          bottom: 20,
          left: 20,
          right: 140,
          top: 20,
        }}
        subTitle="Clusters"
        title={`${aggregateMetrics.total}`}
        themeColor={ChartThemeColor.multiOrdered}
        colorScale={[
          'var(--pf-t--chart--color--green--300)',
          'var(--pf-t--chart--color--orange--300)',
          'var(--pf-t--chart--color--red-orange--300)',
        ]}
        width={350}
        height={230}
      />
    </div>
  );

  // ========================================
  // RESOURCE UTILIZATION BAR CHART
  // ========================================
  const ResourceUtilizationChart = () => (
    <div style={{ height: '250px', width: '100%' }}>
      <ChartBar
        data={mockClusters.map((cluster) => ({
          x: cluster.name.replace('prod-', '').replace('staging-', 'stg-').replace('dev-', 'd-'),
          y: cluster.metrics.cpuUsage,
        }))}
        height={250}
        labels={({ datum }) => `CPU: ${datum.y}%`}
        name="resource-utilization-chart"
        padding={{
          bottom: 60,
          left: 50,
          right: 20,
          top: 20,
        }}
        themeColor={ChartThemeColor.blue}
        width={500}
      />
    </div>
  );

  // ========================================
  // ALERTS TREND CHART
  // ========================================
  const AlertsTrendChart = () => {
    const timeLabels = ['6h ago', '5h ago', '4h ago', '3h ago', '2h ago', '1h ago', 'Now'];
    
    return (
      <div style={{ height: '200px', width: '100%' }}>
        <ChartGroup
          ariaDesc="Alerts trend over time"
          ariaTitle="Alerts Trend"
          containerComponent={
            <ChartVoronoiContainer
              labels={({ datum }) => `${datum.name}: ${datum.y}`}
              constrainToVisibleArea
            />
          }
          height={200}
          padding={{
            bottom: 50,
            left: 50,
            right: 20,
            top: 20,
          }}
          width={500}
        >
          <ChartAxis tickValues={[1, 2, 3, 4, 5, 6, 7]} tickFormat={timeLabels} />
          <ChartAxis dependentAxis showGrid tickFormat={(t) => Math.round(t)} />
          <ChartArea
            data={[
              { x: 1, y: 3, name: 'Critical' },
              { x: 2, y: 5, name: 'Critical' },
              { x: 3, y: 4, name: 'Critical' },
              { x: 4, y: 6, name: 'Critical' },
              { x: 5, y: 4, name: 'Critical' },
              { x: 6, y: 3, name: 'Critical' },
              { x: 7, y: 2, name: 'Critical' },
            ]}
            interpolation="monotoneX"
            name="critical-alerts"
            style={{
              data: { fill: 'var(--pf-t--chart--color--red-orange--300)', fillOpacity: 0.4, stroke: 'var(--pf-t--chart--color--red-orange--300)' },
            }}
          />
          <ChartArea
            data={[
              { x: 1, y: 8, name: 'Warning' },
              { x: 2, y: 10, name: 'Warning' },
              { x: 3, y: 7, name: 'Warning' },
              { x: 4, y: 12, name: 'Warning' },
              { x: 5, y: 9, name: 'Warning' },
              { x: 6, y: 6, name: 'Warning' },
              { x: 7, y: 5, name: 'Warning' },
            ]}
            interpolation="monotoneX"
            name="warning-alerts"
            style={{
              data: { fill: 'var(--pf-t--chart--color--orange--300)', fillOpacity: 0.4, stroke: 'var(--pf-t--chart--color--orange--300)' },
            }}
          />
        </ChartGroup>
      </div>
    );
  };

  // ========================================
  // CLUSTER DETAIL PANEL
  // ========================================
  const ClusterDetailPanel: React.FC<{ cluster: ClusterData }> = ({ cluster }) => (
    <Card isFullHeight>
      <CardHeader
        actions={{
          actions: (
            <Flex>
              <FlexItem>
                <Button variant="secondary" icon={<CogIcon />}>
                  Configure
                </Button>
              </FlexItem>
              <FlexItem>
                <Button
                  variant="link"
                  icon={<ExternalLinkAltIcon />}
                  iconPosition="end"
                  component="a"
                  href="#"
                  target="_blank"
                >
                  Open Console
                </Button>
              </FlexItem>
            </Flex>
          ),
          hasNoOffset: false,
          className: undefined,
        }}
      >
        <CardTitle>
          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
            <FlexItem>
              <StatusIcon status={cluster.status} />
            </FlexItem>
            <FlexItem>
              <Title headingLevel="h2" size="xl">{cluster.name}</Title>
            </FlexItem>
            <FlexItem>
              {getStatusLabel(cluster.status)}
            </FlexItem>
          </Flex>
        </CardTitle>
      </CardHeader>
      <CardBody>
        <Tabs activeKey={activeTabKey} onSelect={(_, tabIndex) => setActiveTabKey(tabIndex)}>
          <Tab eventKey={0} title={<TabTitleText>Overview</TabTitleText>}>
            <Stack hasGutter>
              <DescriptionList isHorizontal columnModifier={{ default: '2Col' }}>
                <DescriptionListGroup>
                  <DescriptionListTerm>Region</DescriptionListTerm>
                  <DescriptionListDescription>{cluster.region}</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Provider</DescriptionListTerm>
                  <DescriptionListDescription>{cluster.provider}</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Version</DescriptionListTerm>
                  <DescriptionListDescription>{cluster.version}</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Last Updated</DescriptionListTerm>
                  <DescriptionListDescription>{cluster.lastUpdated}</DescriptionListDescription>
                </DescriptionListGroup>
              </DescriptionList>
              <Divider />
              <Title headingLevel="h4">Resource Utilization</Title>
              <Grid hasGutter>
                <GridItem span={4}>
                  <Card isPlain isCompact>
                    <CardBody>
                      <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }}>
                        <FlexItem>
                          <Title headingLevel="h3" size="2xl">
                            {cluster.metrics.cpuUsage}%
                          </Title>
                        </FlexItem>
                        <FlexItem>
                          <Content component="small">CPU Usage</Content>
                        </FlexItem>
                      </Flex>
                    </CardBody>
                  </Card>
                </GridItem>
                <GridItem span={4}>
                  <Card isPlain isCompact>
                    <CardBody>
                      <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }}>
                        <FlexItem>
                          <Title headingLevel="h3" size="2xl">
                            {cluster.metrics.memoryUsage}%
                          </Title>
                        </FlexItem>
                        <FlexItem>
                          <Content component="small">Memory Usage</Content>
                        </FlexItem>
                      </Flex>
                    </CardBody>
                  </Card>
                </GridItem>
                <GridItem span={4}>
                  <Card isPlain isCompact>
                    <CardBody>
                      <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }}>
                        <FlexItem>
                          <Title headingLevel="h3" size="2xl">
                            {cluster.metrics.diskUsage}%
                          </Title>
                        </FlexItem>
                        <FlexItem>
                          <Content component="small">Disk Usage</Content>
                        </FlexItem>
                      </Flex>
                    </CardBody>
                  </Card>
                </GridItem>
              </Grid>
              <Grid hasGutter>
                <GridItem span={6}>
                  <Card isPlain isCompact>
                    <CardBody>
                      <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }}>
                        <FlexItem>
                          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                            <FlexItem><ServerIcon /></FlexItem>
                            <FlexItem>
                              <Title headingLevel="h3" size="xl">{cluster.metrics.nodeCount}</Title>
                            </FlexItem>
                          </Flex>
                        </FlexItem>
                        <FlexItem>
                          <Content component="small">Nodes</Content>
                        </FlexItem>
                      </Flex>
                    </CardBody>
                  </Card>
                </GridItem>
                <GridItem span={6}>
                  <Card isPlain isCompact>
                    <CardBody>
                      <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }}>
                        <FlexItem>
                          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                            <FlexItem><CubesIcon /></FlexItem>
                            <FlexItem>
                              <Title headingLevel="h3" size="xl">{cluster.metrics.podCount}</Title>
                            </FlexItem>
                          </Flex>
                        </FlexItem>
                        <FlexItem>
                          <Content component="small">Pods</Content>
                        </FlexItem>
                      </Flex>
                    </CardBody>
                  </Card>
                </GridItem>
              </Grid>
            </Stack>
          </Tab>
          <Tab
            eventKey={1}
            title={
              <TabTitleText>
                Alerts{' '}
                {cluster.alerts.length > 0 && (
                  <Badge isRead={cluster.alerts.length === 0}>{cluster.alerts.length}</Badge>
                )}
              </TabTitleText>
            }
          >
            <Stack hasGutter>
              {cluster.alerts.length === 0 ? (
                <EmptyState titleText="No active alerts" icon={CheckCircleIcon}>
                  <EmptyStateBody>This cluster is operating normally with no active alerts.</EmptyStateBody>
                </EmptyState>
              ) : (
                cluster.alerts.map((alert) => (
                  <Card key={alert.id} isCompact>
                    <CardBody>
                      <Flex alignItems={{ default: 'alignItemsFlexStart' }} gap={{ default: 'gapMd' }}>
                        <FlexItem>
                          <SeverityIcon severity={alert.severity} />
                        </FlexItem>
                        <FlexItem flex={{ default: 'flex_1' }}>
                          <Stack hasGutter>
                            <Title headingLevel="h4" size="md">{alert.title}</Title>
                            <Content component="p">{alert.description}</Content>
                            <Flex gap={{ default: 'gapMd' }}>
                              <FlexItem>
                                <Content component="small">
                                  <OutlinedClockIcon /> {alert.timestamp}
                                </Content>
                              </FlexItem>
                              {alert.component && (
                                <FlexItem>
                                  <Label isCompact>{alert.component}</Label>
                                </FlexItem>
                              )}
                            </Flex>
                          </Stack>
                        </FlexItem>
                        <FlexItem>
                          <Button variant="secondary" size="sm">
                            Investigate
                          </Button>
                        </FlexItem>
                      </Flex>
                    </CardBody>
                  </Card>
                ))
              )}
            </Stack>
          </Tab>
          <Tab eventKey={2} title={<TabTitleText>Logs</TabTitleText>}>
            <Stack hasGutter>
              {mockLogs
                .filter((log) => log.cluster === cluster.name)
                .map((log) => (
                  <Card key={log.id} isCompact>
                    <CardBody>
                      <Split hasGutter>
                        <SplitItem>
                          <LogLevelLabel level={log.level} />
                        </SplitItem>
                        <SplitItem>
                          <Content component="small">{log.timestamp}</Content>
                        </SplitItem>
                        <SplitItem>
                          <Label isCompact variant="outline">{log.source}</Label>
                        </SplitItem>
                        <SplitItem isFilled>
                          <Content component="p" style={{ fontFamily: 'var(--pf-t--global--font--family--mono)' }}>
                            {log.message}
                          </Content>
                        </SplitItem>
                      </Split>
                    </CardBody>
                  </Card>
                ))}
              {mockLogs.filter((log) => log.cluster === cluster.name).length === 0 && (
                <EmptyState titleText="No recent logs">
                  <EmptyStateBody>No log entries found for this cluster in the selected time range.</EmptyStateBody>
                </EmptyState>
              )}
            </Stack>
          </Tab>
        </Tabs>
      </CardBody>
    </Card>
  );

  // ========================================
  // TROUBLESHOOTING TOOLS PANEL
  // ========================================
  const TroubleshootingTools = () => (
    <Card isFullHeight>
      <CardTitle>
        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
          <FlexItem><CogIcon /></FlexItem>
          <FlexItem>Quick Actions</FlexItem>
        </Flex>
      </CardTitle>
      <CardBody>
        <Stack hasGutter>
          <Button variant="secondary" isBlock icon={<SyncAltIcon />}>
            Force Cluster Sync
          </Button>
          <Button variant="secondary" isBlock icon={<ServerIcon />}>
            Drain Node
          </Button>
          <Button variant="secondary" isBlock icon={<CubesIcon />}>
            Restart Deployments
          </Button>
          <Button variant="secondary" isBlock icon={<SearchIcon />}>
            Run Diagnostics
          </Button>
          <Divider />
          <Title headingLevel="h4" size="md">Common Runbooks</Title>
          <Button
            variant="link"
            isInline
            icon={<ExternalLinkAltIcon />}
            iconPosition="end"
          >
            Node Not Ready Troubleshooting
          </Button>
          <Button
            variant="link"
            isInline
            icon={<ExternalLinkAltIcon />}
            iconPosition="end"
          >
            High Memory Remediation
          </Button>
          <Button
            variant="link"
            isInline
            icon={<ExternalLinkAltIcon />}
            iconPosition="end"
          >
            Pod Scheduling Issues
          </Button>
          <Button
            variant="link"
            isInline
            icon={<ExternalLinkAltIcon />}
            iconPosition="end"
          >
            Network Latency Investigation
          </Button>
        </Stack>
      </CardBody>
    </Card>
  );

  // ========================================
  // STATUS FILTER SELECT
  // ========================================
  const statusFilterToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
      isExpanded={isStatusFilterOpen}
      style={{ width: '180px' }}
    >
      <FilterIcon /> {statusFilter === 'all' ? 'All Statuses' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
    </MenuToggle>
  );

  // ========================================
  // MAIN RENDER
  // ========================================
  return (
    <PageSection hasBodyWrapper={false}>
      <Stack hasGutter>
        {/* Page Header */}
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <Title headingLevel="h1" size="2xl">Cluster Health Dashboard</Title>
            <Content component="p">Monitor and troubleshoot your Kubernetes clusters</Content>
          </FlexItem>
          <FlexItem>
            <Button
              variant="secondary"
              icon={<SyncAltIcon />}
              onClick={handleRefresh}
              isLoading={isRefreshing}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </FlexItem>
        </Flex>

        {/* Summary Cards */}
        <Grid hasGutter>
          <GridItem md={3}>
            <Card isFullHeight>
              <CardBody>
                <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }}>
                  <FlexItem>
                    <Title headingLevel="h2" size="4xl">{aggregateMetrics.total}</Title>
                  </FlexItem>
                  <FlexItem>
                    <Content component="p">Total Clusters</Content>
                  </FlexItem>
                  <FlexItem>
                    <LabelGroup>
                      <Label color="green" icon={<CheckCircleIcon />}>{aggregateMetrics.healthy}</Label>
                      <Label color="orange" icon={<ExclamationTriangleIcon />}>{aggregateMetrics.warning}</Label>
                      <Label color="red" icon={<ExclamationCircleIcon />}>{aggregateMetrics.critical}</Label>
                    </LabelGroup>
                  </FlexItem>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem md={3}>
            <Card isFullHeight>
              <CardBody>
                <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }}>
                  <FlexItem>
                    <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                      <FlexItem>
                        <Icon status="danger"><BellIcon /></Icon>
                      </FlexItem>
                      <FlexItem>
                        <Title headingLevel="h2" size="4xl">{aggregateMetrics.totalAlerts}</Title>
                      </FlexItem>
                    </Flex>
                  </FlexItem>
                  <FlexItem>
                    <Content component="p">Active Alerts</Content>
                  </FlexItem>
                  <FlexItem>
                    <LabelGroup>
                      <Label color="red">{aggregateMetrics.criticalAlerts} Critical</Label>
                      <Label color="orange">{aggregateMetrics.warningAlerts} Warning</Label>
                    </LabelGroup>
                  </FlexItem>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem md={3}>
            <Card isFullHeight>
              <CardBody>
                <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }}>
                  <FlexItem>
                    <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                      <FlexItem><ServerIcon /></FlexItem>
                      <FlexItem>
                        <Title headingLevel="h2" size="4xl">{aggregateMetrics.totalNodes}</Title>
                      </FlexItem>
                    </Flex>
                  </FlexItem>
                  <FlexItem>
                    <Content component="p">Total Nodes</Content>
                  </FlexItem>
                  <FlexItem>
                    <Content component="small">Avg CPU: {aggregateMetrics.avgCpu}%</Content>
                  </FlexItem>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem md={3}>
            <Card isFullHeight>
              <CardBody>
                <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }}>
                  <FlexItem>
                    <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                      <FlexItem><CubesIcon /></FlexItem>
                      <FlexItem>
                        <Title headingLevel="h2" size="4xl">{aggregateMetrics.totalPods}</Title>
                      </FlexItem>
                    </Flex>
                  </FlexItem>
                  <FlexItem>
                    <Content component="p">Total Pods</Content>
                  </FlexItem>
                  <FlexItem>
                    <Content component="small">Avg Memory: {aggregateMetrics.avgMemory}%</Content>
                  </FlexItem>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Charts Row */}
        <Grid hasGutter>
          <GridItem md={4}>
            <Card isFullHeight>
              <CardTitle>Cluster Health Overview</CardTitle>
              <CardBody>
                <ClusterHealthDonut />
              </CardBody>
            </Card>
          </GridItem>
          <GridItem md={4}>
            <Card isFullHeight>
              <CardTitle>CPU Utilization by Cluster</CardTitle>
              <CardBody>
                <ResourceUtilizationChart />
              </CardBody>
            </Card>
          </GridItem>
          <GridItem md={4}>
            <Card isFullHeight>
              <CardTitle>Alerts Trend (Last 6 Hours)</CardTitle>
              <CardBody>
                <AlertsTrendChart />
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Main Content Area */}
        <Grid hasGutter>
          {/* Cluster List + Detail Panel */}
          <GridItem md={selectedCluster ? 4 : 9}>
            <Card isFullHeight>
              <CardTitle>
                <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                  <FlexItem>All Clusters</FlexItem>
                  <FlexItem>
                    <Badge isRead>{filteredClusters.length}</Badge>
                  </FlexItem>
                </Flex>
              </CardTitle>
              <CardBody>
                <Stack hasGutter>
                  {/* Toolbar */}
                  <Toolbar>
                    <ToolbarContent>
                      <ToolbarItem>
                        <SearchInput
                          placeholder="Search clusters..."
                          value={searchValue}
                          onChange={(_event, value) => setSearchValue(value)}
                          onClear={() => setSearchValue('')}
                          aria-label="Search clusters"
                        />
                      </ToolbarItem>
                      <ToolbarItem>
                        <Select
                          toggle={statusFilterToggle}
                          onSelect={(_event, value) => {
                            setStatusFilter(value as string);
                            setIsStatusFilterOpen(false);
                          }}
                          selected={statusFilter}
                          isOpen={isStatusFilterOpen}
                          onOpenChange={(isOpen) => setIsStatusFilterOpen(isOpen)}
                        >
                          <SelectOption value="all">All Statuses</SelectOption>
                          <SelectOption value="healthy">Healthy</SelectOption>
                          <SelectOption value="warning">Warning</SelectOption>
                          <SelectOption value="critical">Critical</SelectOption>
                        </Select>
                      </ToolbarItem>
                    </ToolbarContent>
                  </Toolbar>

                  {/* Cluster List */}
                  {filteredClusters.map((cluster) => (
                    <Card
                      key={cluster.id}
                      isSelectable
                      isSelected={selectedCluster?.id === cluster.id}
                      onClick={() => setSelectedCluster(cluster)}
                      isCompact
                    >
                      <CardBody>
                        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                          <FlexItem>
                            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                              <FlexItem>
                                <StatusIcon status={cluster.status} />
                              </FlexItem>
                              <FlexItem>
                                <Stack>
                                  <Title headingLevel="h3" size="md">{cluster.name}</Title>
                                  <Content component="small">{cluster.region}</Content>
                                </Stack>
                              </FlexItem>
                            </Flex>
                          </FlexItem>
                          <FlexItem>
                            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                              {cluster.alerts.length > 0 && (
                                <FlexItem>
                                  <Badge isRead={false}>{cluster.alerts.length} alerts</Badge>
                                </FlexItem>
                              )}
                              <FlexItem>
                                <Label isCompact variant="outline">{cluster.provider}</Label>
                              </FlexItem>
                              <FlexItem>
                                <ArrowRightIcon />
                              </FlexItem>
                            </Flex>
                          </FlexItem>
                        </Flex>
                      </CardBody>
                    </Card>
                  ))}

                  {filteredClusters.length === 0 && (
                    <EmptyState titleText="No clusters found" icon={SearchIcon}>
                      <EmptyStateBody>
                        No clusters match your current filter criteria. Try adjusting your search or filters.
                      </EmptyStateBody>
                      <EmptyStateFooter>
                        <EmptyStateActions>
                          <Button
                            variant="link"
                            onClick={() => {
                              setSearchValue('');
                              setStatusFilter('all');
                            }}
                          >
                            Clear filters
                          </Button>
                        </EmptyStateActions>
                      </EmptyStateFooter>
                    </EmptyState>
                  )}
                </Stack>
              </CardBody>
            </Card>
          </GridItem>

          {/* Cluster Detail Panel */}
          {selectedCluster && (
            <GridItem md={5}>
              <ClusterDetailPanel cluster={selectedCluster} />
            </GridItem>
          )}

          {/* Troubleshooting Tools Panel */}
          <GridItem md={3}>
            <TroubleshootingTools />
          </GridItem>
        </Grid>

        {/* Top Alerts Section */}
        <Card>
          <CardTitle>
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
              <FlexItem>
                <Icon status="danger"><ExclamationCircleIcon /></Icon>
              </FlexItem>
              <FlexItem>Top Problems Across All Clusters</FlexItem>
              <FlexItem>
                <Badge isRead={allAlerts.length === 0}>{allAlerts.length}</Badge>
              </FlexItem>
            </Flex>
          </CardTitle>
          <CardBody>
            {allAlerts.length === 0 ? (
              <EmptyState titleText="All systems operational" icon={CheckCircleIcon}>
                <EmptyStateBody>No active alerts across any clusters. All systems are operating normally.</EmptyStateBody>
              </EmptyState>
            ) : (
              <Stack hasGutter>
                {allAlerts.slice(0, 5).map((alert) => (
                  <Card key={alert.id} isCompact>
                    <CardBody>
                      <Split hasGutter>
                        <SplitItem>
                          <SeverityIcon severity={alert.severity} />
                        </SplitItem>
                        <SplitItem isFilled>
                          <Stack>
                            <Flex gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsCenter' }}>
                              <FlexItem>
                                <Title headingLevel="h4" size="md">{alert.title}</Title>
                              </FlexItem>
                              <FlexItem>
                                <Label isCompact color={alert.severity === 'critical' ? 'red' : 'orange'}>
                                  {alert.severity}
                                </Label>
                              </FlexItem>
                            </Flex>
                            <Content component="p">{alert.description}</Content>
                            <Flex gap={{ default: 'gapMd' }}>
                              <FlexItem>
                                <Label isCompact variant="outline">{alert.cluster}</Label>
                              </FlexItem>
                              {alert.component && (
                                <FlexItem>
                                  <Label isCompact>{alert.component}</Label>
                                </FlexItem>
                              )}
                              <FlexItem>
                                <Content component="small">
                                  <OutlinedClockIcon /> {alert.timestamp}
                                </Content>
                              </FlexItem>
                            </Flex>
                          </Stack>
                        </SplitItem>
                        <SplitItem>
                          <Flex direction={{ default: 'column' }} gap={{ default: 'gapSm' }}>
                            <FlexItem>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  const cluster = mockClusters.find((c) => c.name === alert.cluster);
                                  if (cluster) {
                                    setSelectedCluster(cluster);
                                    setActiveTabKey(1);
                                  }
                                }}
                              >
                                View Cluster
                              </Button>
                            </FlexItem>
                            <FlexItem>
                              <Button variant="link" size="sm">
                                Acknowledge
                              </Button>
                            </FlexItem>
                          </Flex>
                        </SplitItem>
                      </Split>
                    </CardBody>
                  </Card>
                ))}
              </Stack>
            )}
          </CardBody>
        </Card>
      </Stack>
    </PageSection>
  );
};

export { Dashboard };

/**
 * Overview Page for Multi-cluster Alerting UI V2
 * 
 * Provides high-level cluster metrics, details, and alerts summary.
 * Clicking on alert details navigates to the alerting page with pre-applied filters.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Content,
  Divider,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Icon,
  Label,
  Progress,
  ProgressMeasureLocation,
  Stack,
  StackItem,
  Title,
  Button,
  Tooltip,
} from '@patternfly/react-core';
import {
  ClusterIcon,
  CubesIcon,
  ServerIcon,
  OutlinedBellIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  SyncIcon,
  ArrowRightIcon,
  TrendUpIcon,
  TrendDownIcon,
} from '@patternfly/react-icons';

// Types
type AlertSeverity = 'Critical' | 'Warning' | 'Info';
type AlertGroup = 'Cluster' | 'Namespace';
type AlertComponent = 'ETCD' | 'API Server' | 'Scheduler' | 'Controller Manager' | 'Network' | 'Storage' | 'Nodes' | 'Pods' | 'Services' | 'Deployments' | 'StatefulSets';
type ACMClusterStatus = 'Ready' | 'Offline' | 'Pending Import' | 'Failed' | 'Unknown' | 'Hibernating' | 'Detaching' | 'Installing' | 'Degraded';

interface AlertData {
  id: string;
  alertName: string;
  severity: AlertSeverity;
  status: 'firing' | 'pending' | 'resolved' | 'acknowledged';
  group: AlertGroup;
  component: AlertComponent;
  source: string;
  namespace: string;
  labels: Record<string, string>;
  triggeredAt: string;
  resource?: string;
  runbookUrl?: string;
  description?: string;
}

interface ClusterData {
  id: string;
  name: string;
  region: string;
  cloudProvider: string;
  nodeCount: number;
  podCount: number;
  namespaces: string[];
  labels: Record<string, string>;
  alerts: AlertData[];
  acmStatus: ACMClusterStatus;
}

// Mock data - same as in MultiClusterAlertsPage
const mockClusters: ClusterData[] = [
  {
    id: 'c1', name: 'prod-us-east-1', region: 'US East', cloudProvider: 'AWS', nodeCount: 12, podCount: 340,
    namespaces: ['default', 'kube-system', 'monitoring', 'app-frontend', 'app-backend'],
    labels: { environment: 'production', tier: 'critical' },
    acmStatus: 'Ready',
    alerts: [
      { id: 'a1', alertName: 'HighCPUUsage', severity: 'Critical', status: 'firing', group: 'Cluster', component: 'Nodes', source: 'Prometheus', namespace: 'kube-system', labels: { node: 'worker-1', severity: 'critical' }, triggeredAt: '2024-01-15T10:30:00Z', resource: 'Node/worker-1', description: 'CPU usage is above 90% for more than 5 minutes' },
      { id: 'a2', alertName: 'ETCDLatencyHigh', severity: 'Critical', status: 'firing', group: 'Cluster', component: 'ETCD', source: 'Prometheus', namespace: 'kube-system', labels: { pod: 'etcd-0' }, triggeredAt: '2024-01-15T09:15:00Z', description: 'ETCD latency is above 100ms' },
      { id: 'a3', alertName: 'PodCrashLooping', severity: 'Warning', status: 'firing', group: 'Namespace', component: 'Pods', source: 'Prometheus', namespace: 'app-backend', labels: { pod: 'api-service-xyz' }, triggeredAt: '2024-01-15T11:00:00Z', resource: 'Pod/api-service-xyz' },
    ]
  },
  {
    id: 'c2', name: 'prod-eu-west-1', region: 'EU West', cloudProvider: 'AWS', nodeCount: 8, podCount: 220,
    namespaces: ['default', 'kube-system', 'monitoring', 'payments'],
    labels: { environment: 'production', tier: 'critical' },
    acmStatus: 'Ready',
    alerts: [
      { id: 'a4', alertName: 'MemoryPressure', severity: 'Warning', status: 'firing', group: 'Cluster', component: 'Nodes', source: 'Prometheus', namespace: 'kube-system', labels: { node: 'worker-2' }, triggeredAt: '2024-01-15T08:45:00Z', resource: 'Node/worker-2' },
      { id: 'a5', alertName: 'NetworkLatencyHigh', severity: 'Warning', status: 'firing', group: 'Cluster', component: 'Network', source: 'Prometheus', namespace: 'kube-system', labels: {}, triggeredAt: '2024-01-15T10:00:00Z' },
    ]
  },
  {
    id: 'c3', name: 'staging-ap-south-1', region: 'Asia Pacific', cloudProvider: 'AWS', nodeCount: 4, podCount: 95,
    namespaces: ['default', 'kube-system', 'staging-apps'],
    labels: { environment: 'staging', tier: 'standard' },
    acmStatus: 'Ready',
    alerts: [
      { id: 'a6', alertName: 'CertificateExpiring', severity: 'Info', status: 'firing', group: 'Cluster', component: 'API Server', source: 'Prometheus', namespace: 'kube-system', labels: {}, triggeredAt: '2024-01-14T12:00:00Z' },
    ]
  },
  {
    id: 'c4', name: 'dev-us-west-2', region: 'US West', cloudProvider: 'AWS', nodeCount: 3, podCount: 45,
    namespaces: ['default', 'kube-system', 'dev'],
    labels: { environment: 'development', tier: 'low' },
    acmStatus: 'Ready',
    alerts: []
  },
  {
    id: 'c5', name: 'prod-gcp-central', region: 'US Central', cloudProvider: 'GCP', nodeCount: 10, podCount: 280,
    namespaces: ['default', 'kube-system', 'monitoring', 'ml-workloads'],
    labels: { environment: 'production', tier: 'critical' },
    acmStatus: 'Degraded',
    alerts: [
      { id: 'a7', alertName: 'StorageIOHigh', severity: 'Critical', status: 'firing', group: 'Cluster', component: 'Storage', source: 'Prometheus', namespace: 'kube-system', labels: { pvc: 'data-volume' }, triggeredAt: '2024-01-15T07:30:00Z' },
      { id: 'a8', alertName: 'SchedulerUnhealthy', severity: 'Critical', status: 'firing', group: 'Cluster', component: 'Scheduler', source: 'Prometheus', namespace: 'kube-system', labels: {}, triggeredAt: '2024-01-15T06:00:00Z' },
      { id: 'a9', alertName: 'DeploymentReplicaMismatch', severity: 'Warning', status: 'firing', group: 'Namespace', component: 'Deployments', source: 'Prometheus', namespace: 'ml-workloads', labels: { deployment: 'inference-service' }, triggeredAt: '2024-01-15T09:00:00Z' },
    ]
  },
  {
    id: 'c6', name: 'edge-factory-1', region: 'On-Premise', cloudProvider: 'Bare Metal', nodeCount: 2, podCount: 30,
    namespaces: ['default', 'kube-system', 'factory-apps'],
    labels: { environment: 'edge', tier: 'critical' },
    acmStatus: 'Offline',
    alerts: [
      { id: 'a10', alertName: 'NodeNotReady', severity: 'Critical', status: 'firing', group: 'Cluster', component: 'Nodes', source: 'Prometheus', namespace: 'kube-system', labels: { node: 'edge-worker-1' }, triggeredAt: '2024-01-15T11:30:00Z', resource: 'Node/edge-worker-1' },
    ]
  },
  {
    id: 'c7', name: 'prod-azure-east', region: 'US East', cloudProvider: 'Azure', nodeCount: 6, podCount: 150,
    namespaces: ['default', 'kube-system', 'monitoring', 'web-apps'],
    labels: { environment: 'production', tier: 'standard' },
    acmStatus: 'Ready',
    alerts: [
      { id: 'a11', alertName: 'ServiceEndpointDown', severity: 'Warning', status: 'firing', group: 'Namespace', component: 'Services', source: 'Prometheus', namespace: 'web-apps', labels: { service: 'auth-service' }, triggeredAt: '2024-01-15T10:45:00Z' },
    ]
  },
  {
    id: 'c8', name: 'dr-backup-cluster', region: 'EU Central', cloudProvider: 'AWS', nodeCount: 4, podCount: 60,
    namespaces: ['default', 'kube-system', 'backup'],
    labels: { environment: 'dr', tier: 'critical' },
    acmStatus: 'Hibernating',
    alerts: []
  },
];

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [lastRefresh, setLastRefresh] = React.useState(new Date());

  // Calculate metrics
  const totalClusters = mockClusters.length;
  const healthyClusters = mockClusters.filter(c => c.alerts.filter(a => a.status === 'firing').length === 0).length;
  const totalNodes = mockClusters.reduce((sum, c) => sum + c.nodeCount, 0);
  const totalPods = mockClusters.reduce((sum, c) => sum + c.podCount, 0);
  
  // Alert metrics
  const allFiringAlerts = mockClusters.flatMap(c => c.alerts.filter(a => a.status === 'firing'));
  const totalAlerts = allFiringAlerts.length;
  const criticalAlerts = allFiringAlerts.filter(a => a.severity === 'Critical').length;
  const warningAlerts = allFiringAlerts.filter(a => a.severity === 'Warning').length;
  const infoAlerts = allFiringAlerts.filter(a => a.severity === 'Info').length;

  // Clusters affected by severity
  const clustersWithCritical = mockClusters.filter(c => c.alerts.some(a => a.status === 'firing' && a.severity === 'Critical')).length;
  const clustersWithWarning = mockClusters.filter(c => c.alerts.some(a => a.status === 'firing' && a.severity === 'Warning') && !c.alerts.some(a => a.status === 'firing' && a.severity === 'Critical')).length;
  const clustersWithInfo = mockClusters.filter(c => c.alerts.some(a => a.status === 'firing' && a.severity === 'Info') && !c.alerts.some(a => a.status === 'firing' && (a.severity === 'Critical' || a.severity === 'Warning'))).length;

  // Group by impact group and component
  const alertsByGroupAndComponent = React.useMemo(() => {
    const grouped: Record<AlertGroup, Record<AlertComponent, { total: number; critical: number; warning: number; info: number; clustersAffected: Set<string> }>> = {
      'Cluster': {} as Record<AlertComponent, { total: number; critical: number; warning: number; info: number; clustersAffected: Set<string> }>,
      'Namespace': {} as Record<AlertComponent, { total: number; critical: number; warning: number; info: number; clustersAffected: Set<string> }>,
    };

    mockClusters.forEach(cluster => {
      cluster.alerts.filter(a => a.status === 'firing').forEach(alert => {
        if (!grouped[alert.group][alert.component]) {
          grouped[alert.group][alert.component] = { total: 0, critical: 0, warning: 0, info: 0, clustersAffected: new Set() };
        }
        grouped[alert.group][alert.component].total++;
        grouped[alert.group][alert.component].clustersAffected.add(cluster.id);
        if (alert.severity === 'Critical') grouped[alert.group][alert.component].critical++;
        if (alert.severity === 'Warning') grouped[alert.group][alert.component].warning++;
        if (alert.severity === 'Info') grouped[alert.group][alert.component].info++;
      });
    });

    return grouped;
  }, []);

  // Navigate to alerting page with filters
  const navigateToAlerts = (filters: { severity?: AlertSeverity; group?: AlertGroup; component?: AlertComponent }) => {
    // Build query params
    const params = new URLSearchParams();
    if (filters.severity) params.set('severity', filters.severity);
    if (filters.group) params.set('group', filters.group);
    if (filters.component) params.set('component', filters.component);
    
    navigate(`/observe/alerting?${params.toString()}`);
  };

  // Cluster status breakdown
  const statusBreakdown = React.useMemo(() => {
    const counts: Record<ACMClusterStatus, number> = {
      'Ready': 0, 'Offline': 0, 'Pending Import': 0, 'Failed': 0, 
      'Unknown': 0, 'Hibernating': 0, 'Detaching': 0, 'Installing': 0, 'Degraded': 0
    };
    mockClusters.forEach(c => {
      counts[c.acmStatus]++;
    });
    return counts;
  }, []);

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'Critical': return <ExclamationCircleIcon />;
      case 'Warning': return <ExclamationTriangleIcon />;
      case 'Info': return <InfoCircleIcon />;
    }
  };

  const getSeverityColor = (severity: AlertSeverity): 'red' | 'orange' | 'blue' => {
    switch (severity) {
      case 'Critical': return 'red';
      case 'Warning': return 'orange';
      case 'Info': return 'blue';
    }
  };

  return (
    <div style={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '16px 24px',
        backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
        borderBottom: '1px solid var(--pf-t--global--border--color--default)'
      }}>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
          <Flex direction={{ default: 'column' }} gap={{ default: 'gapSm' }}>
            <FlexItem>
              <Breadcrumb>
                <BreadcrumbItem to="/">Home</BreadcrumbItem>
                <BreadcrumbItem isActive>Overview</BreadcrumbItem>
              </Breadcrumb>
            </FlexItem>
            <FlexItem>
              <Title headingLevel="h1" size="xl">Fleet Overview</Title>
            </FlexItem>
          </Flex>
          <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem>
              <Content component="small" className="pf-v6-u-color-200">
                <ClockIcon /> {lastRefresh.toLocaleTimeString()}
              </Content>
            </FlexItem>
            <FlexItem>
              <Button variant="secondary" icon={<SyncIcon />} onClick={() => setLastRefresh(new Date())}>
                Refresh
              </Button>
            </FlexItem>
          </Flex>
        </Flex>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        <Stack hasGutter>
          {/* Top Metrics Row */}
          <StackItem>
            <Grid hasGutter>
              {/* Clusters Card */}
              <GridItem md={3}>
                <Card isFullHeight>
                  <CardBody>
                    <Flex direction={{ default: 'column' }} gap={{ default: 'gapMd' }}>
                      <FlexItem>
                        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                          <FlexItem>
                            <Icon size="lg" status="info">
                              <ClusterIcon />
                            </Icon>
                          </FlexItem>
                          <FlexItem>
                            <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>Total Clusters</Content>
                          </FlexItem>
                        </Flex>
                      </FlexItem>
                      <FlexItem>
                        <Title headingLevel="h2" size="3xl">{totalClusters}</Title>
                      </FlexItem>
                      <FlexItem>
                        <Flex gap={{ default: 'gapSm' }}>
                          <FlexItem>
                            <Label color="green" icon={<CheckCircleIcon />} isCompact>{healthyClusters} Healthy</Label>
                          </FlexItem>
                          {totalClusters - healthyClusters > 0 && (
                            <FlexItem>
                              <Label color="red" icon={<ExclamationCircleIcon />} isCompact>{totalClusters - healthyClusters} With Alerts</Label>
                            </FlexItem>
                          )}
                        </Flex>
                      </FlexItem>
                    </Flex>
                  </CardBody>
                </Card>
              </GridItem>

              {/* Nodes Card */}
              <GridItem md={3}>
                <Card isFullHeight>
                  <CardBody>
                    <Flex direction={{ default: 'column' }} gap={{ default: 'gapMd' }}>
                      <FlexItem>
                        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                          <FlexItem>
                            <Icon size="lg">
                              <ServerIcon />
                            </Icon>
                          </FlexItem>
                          <FlexItem>
                            <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>Total Nodes</Content>
                          </FlexItem>
                        </Flex>
                      </FlexItem>
                      <FlexItem>
                        <Title headingLevel="h2" size="3xl">{totalNodes}</Title>
                      </FlexItem>
                      <FlexItem>
                        <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                          Across {totalClusters} clusters
                        </Content>
                      </FlexItem>
                    </Flex>
                  </CardBody>
                </Card>
              </GridItem>

              {/* Pods Card */}
              <GridItem md={3}>
                <Card isFullHeight>
                  <CardBody>
                    <Flex direction={{ default: 'column' }} gap={{ default: 'gapMd' }}>
                      <FlexItem>
                        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                          <FlexItem>
                            <Icon size="lg">
                              <CubesIcon />
                            </Icon>
                          </FlexItem>
                          <FlexItem>
                            <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>Total Pods</Content>
                          </FlexItem>
                        </Flex>
                      </FlexItem>
                      <FlexItem>
                        <Title headingLevel="h2" size="3xl">{totalPods.toLocaleString()}</Title>
                      </FlexItem>
                      <FlexItem>
                        <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                          {Math.round(totalPods / totalNodes)} avg per node
                        </Content>
                      </FlexItem>
                    </Flex>
                  </CardBody>
                </Card>
              </GridItem>

              {/* Alerts Summary Card */}
              <GridItem md={3}>
                <Card isFullHeight isClickable onClick={() => navigate('/observe/alerting')}>
                  <CardBody>
                    <Flex direction={{ default: 'column' }} gap={{ default: 'gapMd' }}>
                      <FlexItem>
                        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                          <FlexItem>
                            <Icon size="lg" status="danger">
                              <OutlinedBellIcon />
                            </Icon>
                          </FlexItem>
                          <FlexItem>
                            <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>Firing Alerts</Content>
                          </FlexItem>
                        </Flex>
                      </FlexItem>
                      <FlexItem>
                        <Title headingLevel="h2" size="3xl">{totalAlerts}</Title>
                      </FlexItem>
                      <FlexItem>
                        <Flex gap={{ default: 'gapSm' }}>
                          {criticalAlerts > 0 && <Label color="red" isCompact>{criticalAlerts} Critical</Label>}
                          {warningAlerts > 0 && <Label color="orange" isCompact>{warningAlerts} Warning</Label>}
                          {infoAlerts > 0 && <Label color="blue" isCompact>{infoAlerts} Info</Label>}
                        </Flex>
                      </FlexItem>
                    </Flex>
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          </StackItem>

          {/* Alerts Summary Section */}
          <StackItem>
            <Card>
              <CardHeader>
                <CardTitle>
                  <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>
                      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                        <Icon status="danger"><OutlinedBellIcon /></Icon>
                        <span>Alerts Summary</span>
                      </Flex>
                    </FlexItem>
                    <FlexItem>
                      <Button variant="link" onClick={() => navigate('/observe/alerting')}>
                        View all alerts <ArrowRightIcon />
                      </Button>
                    </FlexItem>
                  </Flex>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Grid hasGutter>
                  {/* Severity Breakdown */}
                  <GridItem md={4}>
                    <Card isPlain>
                      <CardHeader>
                        <CardTitle>Severity Breakdown</CardTitle>
                      </CardHeader>
                      <CardBody>
                        <Stack hasGutter>
                          {/* Critical */}
                          <StackItem>
                            <Button 
                              variant="plain" 
                              isBlock 
                              style={{ textAlign: 'left', padding: '12px' }}
                              onClick={() => navigateToAlerts({ severity: 'Critical' })}
                            >
                              <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                  <Icon status="danger"><ExclamationCircleIcon /></Icon>
                                  <span>Critical</span>
                                </Flex>
                                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                                  <FlexItem>
                                    <Title headingLevel="h3" size="lg">{criticalAlerts}</Title>
                                  </FlexItem>
                                  <FlexItem>
                                    <Label color="red" isCompact>{clustersWithCritical} clusters</Label>
                                  </FlexItem>
                                </Flex>
                              </Flex>
                            </Button>
                          </StackItem>
                          <Divider />
                          {/* Warning */}
                          <StackItem>
                            <Button 
                              variant="plain" 
                              isBlock 
                              style={{ textAlign: 'left', padding: '12px' }}
                              onClick={() => navigateToAlerts({ severity: 'Warning' })}
                            >
                              <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                  <Icon status="warning"><ExclamationTriangleIcon /></Icon>
                                  <span>Warning</span>
                                </Flex>
                                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                                  <FlexItem>
                                    <Title headingLevel="h3" size="lg">{warningAlerts}</Title>
                                  </FlexItem>
                                  <FlexItem>
                                    <Label color="orange" isCompact>{clustersWithWarning} clusters</Label>
                                  </FlexItem>
                                </Flex>
                              </Flex>
                            </Button>
                          </StackItem>
                          <Divider />
                          {/* Info */}
                          <StackItem>
                            <Button 
                              variant="plain" 
                              isBlock 
                              style={{ textAlign: 'left', padding: '12px' }}
                              onClick={() => navigateToAlerts({ severity: 'Info' })}
                            >
                              <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                  <Icon status="info"><InfoCircleIcon /></Icon>
                                  <span>Info</span>
                                </Flex>
                                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                                  <FlexItem>
                                    <Title headingLevel="h3" size="lg">{infoAlerts}</Title>
                                  </FlexItem>
                                  <FlexItem>
                                    <Label color="blue" isCompact>{clustersWithInfo} clusters</Label>
                                  </FlexItem>
                                </Flex>
                              </Flex>
                            </Button>
                          </StackItem>
                        </Stack>
                      </CardBody>
                    </Card>
                  </GridItem>

                  {/* Impact: Cluster */}
                  <GridItem md={4}>
                    <Card isPlain>
                      <CardHeader>
                        <CardTitle>
                          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                            <Label color="purple" isCompact>Impact: Cluster</Label>
                            <span>Components</span>
                          </Flex>
                        </CardTitle>
                      </CardHeader>
                      <CardBody>
                        <Stack hasGutter>
                          {Object.entries(alertsByGroupAndComponent['Cluster'])
                            .sort((a, b) => b[1].critical - a[1].critical || b[1].total - a[1].total)
                            .map(([component, stats]) => (
                              <StackItem key={component}>
                                <Button 
                                  variant="plain" 
                                  isBlock 
                                  style={{ textAlign: 'left', padding: '8px 12px' }}
                                  onClick={() => navigateToAlerts({ group: 'Cluster', component: component as AlertComponent })}
                                >
                                  <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                                    <FlexItem>{component}</FlexItem>
                                    <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                                      {stats.critical > 0 && <Label color="red" isCompact>{stats.critical}</Label>}
                                      {stats.warning > 0 && <Label color="orange" isCompact>{stats.warning}</Label>}
                                      {stats.info > 0 && <Label color="blue" isCompact>{stats.info}</Label>}
                                      <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                                        {stats.clustersAffected.size} cluster{stats.clustersAffected.size !== 1 ? 's' : ''}
                                      </Content>
                                    </Flex>
                                  </Flex>
                                </Button>
                              </StackItem>
                            ))}
                          {Object.keys(alertsByGroupAndComponent['Cluster']).length === 0 && (
                            <StackItem>
                              <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                                No cluster-level alerts
                              </Content>
                            </StackItem>
                          )}
                        </Stack>
                      </CardBody>
                    </Card>
                  </GridItem>

                  {/* Impact: Namespace */}
                  <GridItem md={4}>
                    <Card isPlain>
                      <CardHeader>
                        <CardTitle>
                          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                            <Label color="teal" isCompact>Impact: Namespace</Label>
                            <span>Components</span>
                          </Flex>
                        </CardTitle>
                      </CardHeader>
                      <CardBody>
                        <Stack hasGutter>
                          {Object.entries(alertsByGroupAndComponent['Namespace'])
                            .sort((a, b) => b[1].critical - a[1].critical || b[1].total - a[1].total)
                            .map(([component, stats]) => (
                              <StackItem key={component}>
                                <Button 
                                  variant="plain" 
                                  isBlock 
                                  style={{ textAlign: 'left', padding: '8px 12px' }}
                                  onClick={() => navigateToAlerts({ group: 'Namespace', component: component as AlertComponent })}
                                >
                                  <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                                    <FlexItem>{component}</FlexItem>
                                    <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                                      {stats.critical > 0 && <Label color="red" isCompact>{stats.critical}</Label>}
                                      {stats.warning > 0 && <Label color="orange" isCompact>{stats.warning}</Label>}
                                      {stats.info > 0 && <Label color="blue" isCompact>{stats.info}</Label>}
                                      <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                                        {stats.clustersAffected.size} cluster{stats.clustersAffected.size !== 1 ? 's' : ''}
                                      </Content>
                                    </Flex>
                                  </Flex>
                                </Button>
                              </StackItem>
                            ))}
                          {Object.keys(alertsByGroupAndComponent['Namespace']).length === 0 && (
                            <StackItem>
                              <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                                No namespace-level alerts
                              </Content>
                            </StackItem>
                          )}
                        </Stack>
                      </CardBody>
                    </Card>
                  </GridItem>
                </Grid>
              </CardBody>
            </Card>
          </StackItem>

          {/* Cluster Status Breakdown */}
          <StackItem>
            <Card>
              <CardHeader>
                <CardTitle>
                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                    <Icon><ClusterIcon /></Icon>
                    <span>Cluster Status</span>
                  </Flex>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Grid hasGutter>
                  {Object.entries(statusBreakdown)
                    .filter(([_, count]) => count > 0)
                    .map(([status, count]) => {
                      const statusConfig: Record<string, { color: 'green' | 'red' | 'orange' | 'blue' | 'grey'; icon: React.ReactNode }> = {
                        'Ready': { color: 'green', icon: <CheckCircleIcon /> },
                        'Offline': { color: 'red', icon: <ExclamationCircleIcon /> },
                        'Failed': { color: 'red', icon: <ExclamationCircleIcon /> },
                        'Degraded': { color: 'orange', icon: <ExclamationTriangleIcon /> },
                        'Pending Import': { color: 'blue', icon: <ClockIcon /> },
                        'Installing': { color: 'blue', icon: <SyncIcon /> },
                        'Hibernating': { color: 'grey', icon: <ClockIcon /> },
                        'Unknown': { color: 'grey', icon: <InfoCircleIcon /> },
                        'Detaching': { color: 'orange', icon: <SyncIcon /> },
                      };
                      const config = statusConfig[status] || { color: 'grey', icon: <InfoCircleIcon /> };
                      
                      return (
                        <GridItem md={2} key={status}>
                          <Card isPlain>
                            <CardBody>
                              <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                <FlexItem>
                                  <Title headingLevel="h3" size="2xl">{count}</Title>
                                </FlexItem>
                                <FlexItem>
                                  <Label color={config.color} icon={config.icon} isCompact>
                                    {status}
                                  </Label>
                                </FlexItem>
                              </Flex>
                            </CardBody>
                          </Card>
                        </GridItem>
                      );
                    })}
                </Grid>
              </CardBody>
            </Card>
          </StackItem>
        </Stack>
      </div>
    </div>
  );
};

export default OverviewPage;


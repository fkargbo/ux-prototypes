import * as React from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Stack,
  StackItem,
  Flex,
  FlexItem,
  Content,
  Label,
  Button,
  Badge,
  Popover,
} from '@patternfly/react-core';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@patternfly/react-table';
import type { ClusterData, AlertSeverity } from './types';
import { getSeverityLabelColor } from './utils';

interface CrossClusterInsightsCardsProps {
  clusters: ClusterData[];
  onAlertRuleClick: (alertName: string) => void;
  onComponentClick: (componentName: string) => void;
}

export const CrossClusterInsightsCards: React.FC<CrossClusterInsightsCardsProps> = ({
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

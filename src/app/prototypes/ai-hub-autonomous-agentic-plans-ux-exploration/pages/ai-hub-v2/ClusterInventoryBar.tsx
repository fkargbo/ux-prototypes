import React, { useMemo } from 'react';
import { Card, CardBody, Content, Flex, FlexItem, Title, Tooltip } from '@patternfly/react-core';
import { getClusterInventoryMetrics } from './fleetInventoryData';
import { useFocusedClusterId } from './useFocusedClusterId';
import './ai-hub-v2-inventory.css';

type KpiItem = {
  id: string;
  label: string;
  value: number;
  ariaLabel: string;
};

/** v2 hub only — banner version v2 (see `AIHubPage`). */
export const ClusterInventoryBar: React.FC<{ title?: string }> = ({ title = 'Cluster inventory' }) => {
  const clusterId = useFocusedClusterId();
  const metrics = useMemo(() => getClusterInventoryMetrics(clusterId), [clusterId]);

  const alertsTooltip = useMemo(() => {
    if (!metrics) return null;
    return (
      <div className="ols-ai-hub-cluster-inventory-tooltip">
        <div>Critical: {metrics.criticalAlertCount}</div>
        <div>Warning: {metrics.warningAlertCount}</div>
        <div>Info: {metrics.infoAlertCount}</div>
      </div>
    );
  }, [metrics]);

  const kpis: KpiItem[] | null = useMemo(() => {
    if (!metrics) return null;
    const { cluster } = metrics;
    return [
      {
        id: 'nodes',
        label: 'Nodes',
        value: metrics.nodes,
        ariaLabel: `Nodes in cluster ${cluster.name}: ${metrics.nodes}`,
      },
      {
        id: 'namespaces',
        label: 'Namespaces',
        value: metrics.namespaces,
        ariaLabel: `Namespaces for ${cluster.name}: ${metrics.namespaces}`,
      },
      {
        id: 'workloads',
        label: 'Workloads',
        value: metrics.workloads,
        ariaLabel: `Workloads for ${cluster.name}: ${metrics.workloads}`,
      },
      {
        id: 'alerts',
        label: 'Alerts',
        value: metrics.alertCount,
        ariaLabel: `Open alerts for ${cluster.name}: ${metrics.alertCount}`,
      },
    ];
  }, [metrics]);

  if (!metrics || !kpis) {
    return (
      <Card className="ols-ai-hub-cluster-inventory-card" isCompact isPlain component="section">
        <CardBody>
          <Title headingLevel="h2" size="lg" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
            {title}
          </Title>
          <Content component="p" style={{ margin: 0, color: 'var(--pf-t--global--text--color--subtle)' }}>
            No cluster context available.
          </Content>
        </CardBody>
      </Card>
    );
  }

  const { cluster } = metrics;

  return (
    <Card
      className="ols-ai-hub-cluster-inventory-card"
      isCompact
      component="section"
      aria-label={`${title} for ${cluster.name}`}
    >
      <CardBody>
        <Title headingLevel="h2" size="lg" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
          {title}
        </Title>
        <Flex
          alignItems={{ default: 'alignItemsFlexStart' }}
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          flexWrap={{ default: 'wrap' }}
          gap={{ default: 'gapLg' }}
          role="list"
          aria-label={`Key metrics for ${cluster.name}`}
        >
          {kpis.map((row) => (
            <FlexItem
              key={row.id}
              role="listitem"
              style={{ minWidth: 'min(100%, 104px)', flex: '1 1 auto' }}
            >
              <Flex direction={{ default: 'column' }} gap={{ default: 'gapXs' }}>
                <Content component="p" className="ols-ai-hub-fleet-inventory-label" style={{ margin: 0 }}>
                  {row.label}
                </Content>
                {row.id === 'alerts' ? (
                  <Tooltip content={alertsTooltip} position="top">
                    <span
                      className="ols-aio-card-stat-number--readonly ols-ai-hub-cluster-alerts-kpi"
                      aria-label={row.ariaLabel}
                    >
                      {row.value.toLocaleString()}
                    </span>
                  </Tooltip>
                ) : (
                  <span className="ols-aio-card-stat-number--readonly" aria-label={row.ariaLabel}>
                    {row.value.toLocaleString()}
                  </span>
                )}
              </Flex>
            </FlexItem>
          ))}
        </Flex>
      </CardBody>
    </Card>
  );
};

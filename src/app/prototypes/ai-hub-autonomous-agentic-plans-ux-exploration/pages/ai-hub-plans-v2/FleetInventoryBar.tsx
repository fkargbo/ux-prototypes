import React, { useMemo } from 'react';
import { Card, CardBody, Content, Flex, FlexItem, Title } from '@patternfly/react-core';
import { getFleetInventoryMetrics } from './fleetInventoryData';
import './ai-hub-v3-inventory.css';

type InventoryRow = {
  id: string;
  label: string;
  value: number;
  ariaLabel: string;
};

/** v3 hub only — banner version v3 (see `AIHubPage`). */
export const FleetInventoryBar: React.FC = () => {
  const metrics = useMemo(() => getFleetInventoryMetrics(), []);

  const rows: InventoryRow[] = useMemo(
    () => [
      {
        id: 'clusters',
        label: 'Clusters',
        value: metrics.clusters,
        ariaLabel: `Total managed clusters ${metrics.clusters}`,
      },
      {
        id: 'nodes',
        label: 'Nodes',
        value: metrics.nodes,
        ariaLabel: `Total nodes across fleet ${metrics.nodes}`,
      },
      {
        id: 'namespaces',
        label: 'Namespaces',
        value: metrics.namespaces,
        ariaLabel: `Namespaces across fleet ${metrics.namespaces}`,
      },
      {
        id: 'workloads',
        label: 'Workloads',
        value: metrics.workloads,
        ariaLabel: `Workloads across fleet ${metrics.workloads}`,
      },
      {
        id: 'alerts',
        label: 'Alerts',
        value: metrics.alerts,
        ariaLabel: `Open alerts ${metrics.alerts}`,
      },
    ],
    [metrics]
  );

  return (
    <Card className="ols-ai-hub-fleet-inventory-card" isCompact component="section" aria-label="Fleet inventory">
      <CardBody>
        <Title headingLevel="h2" size="lg" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
          Fleet inventory
        </Title>
        <Flex
          alignItems={{ default: 'alignItemsFlexStart' }}
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          flexWrap={{ default: 'wrap' }}
          gap={{ default: 'gapLg' }}
          role="list"
          aria-label="Fleet inventory summary"
        >
          {rows.map((row) => (
            <FlexItem
              key={row.id}
              role="listitem"
              style={{ minWidth: 'min(100%, 140px)', flex: '1 1 auto' }}
            >
              <Flex direction={{ default: 'column' }} gap={{ default: 'gapXs' }}>
                <Content
                  component="p"
                  className="ols-ai-hub-fleet-inventory-label"
                  style={{ margin: 0 }}
                >
                  {row.label}
                </Content>
                <span className="ols-aio-card-stat-number--readonly" aria-label={row.ariaLabel}>
                  {row.value.toLocaleString()}
                </span>
              </Flex>
            </FlexItem>
          ))}
        </Flex>
      </CardBody>
    </Card>
  );
};

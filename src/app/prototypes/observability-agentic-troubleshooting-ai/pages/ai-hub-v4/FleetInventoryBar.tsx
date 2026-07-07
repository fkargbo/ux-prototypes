/**
 * v4.0 — Fleet Inventory Bar.
 * Left card in Row 1 of the Recommendation Hub layout.
 * Reads exclusively from v4Data — zero coupling to v3 or prior versions.
 */
import React, { useMemo } from 'react';
import { Card, CardBody, Content, Flex, FlexItem, Title } from '@patternfly/react-core';
import { V4_FLEET_INVENTORY, type V4FleetInventoryMetrics } from './v4Data';
import '../ai-hub-v3/ai-hub-v3-inventory.css';

interface InventoryItem {
  id: keyof V4FleetInventoryMetrics;
  label: string;
  ariaLabel: string;
}

const ITEMS: InventoryItem[] = [
  { id: 'clusters',    label: 'Clusters',      ariaLabel: 'Total managed clusters' },
  { id: 'nodes',       label: 'Nodes',          ariaLabel: 'Total nodes across fleet' },
  { id: 'namespaces',  label: 'Namespaces',     ariaLabel: 'Namespaces across fleet' },
  { id: 'workloads',   label: 'Workloads',      ariaLabel: 'Workloads across fleet' },
  { id: 'openSignals', label: 'Open signals',   ariaLabel: 'Total open signals across all clusters' },
];

export const FleetInventoryBar: React.FC = () => {
  const metrics = useMemo(() => V4_FLEET_INVENTORY, []);

  return (
    <Card
      isCompact
      component="section"
      aria-label="Fleet inventory"
      className="ols-ai-hub-fleet-inventory-card"
    >
      <CardBody>
        <Title
          headingLevel="h2"
          size="lg"
          style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
        >
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
          {ITEMS.map((item) => (
            <FlexItem
              key={item.id}
              role="listitem"
              style={{ minWidth: 'min(100%, 130px)', flex: '1 1 auto' }}
            >
              <Flex direction={{ default: 'column' }} gap={{ default: 'gapXs' }}>
                <Content
                  component="p"
                  className="ols-ai-hub-fleet-inventory-label"
                  style={{ margin: 0 }}
                >
                  {item.label}
                </Content>
                <span
                  className="ols-aio-card-stat-number--readonly"
                  aria-label={`${item.ariaLabel}: ${metrics[item.id]}`}
                >
                  {metrics[item.id].toLocaleString()}
                </span>
              </Flex>
            </FlexItem>
          ))}
        </Flex>
      </CardBody>
    </Card>
  );
};

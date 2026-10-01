import React, { useCallback, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardExpandableContent,
  CardHeader,
  CardTitle,
  Content,
  Flex,
  Label,
} from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon, ExclamationTriangleIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useSimulation } from '../../simulation/SimulationProvider';
import { agenticGlobalAiApi } from '../../persesAgenticBridge';
import { useFocusedClusterId } from './useFocusedClusterId';
import {
  buildNodeComponentSummaryRows,
  type NodeComponentStatusLabel,
  type NodeComponentSummaryRow,
} from './nodeComponentSummaryData';
import { NodeComponentSummaryDrawer } from './NodeComponentSummaryDrawer';
import './node-component-summary.css';

const CARD_ID = 'ols-ai-hub-node-component-summary';

function statusToLabelStatus(status: NodeComponentStatusLabel): 'success' | 'warning' | 'danger' {
  switch (status) {
    case 'Ready':
    case 'Healthy':
      return 'success';
    case 'SchedulingDisabled':
      return 'warning';
    case 'NotReady':
    case 'Degraded':
    default:
      return 'danger';
  }
}

function statusDisplayText(status: NodeComponentStatusLabel): string {
  switch (status) {
    case 'NotReady':
      return 'Not ready';
    case 'SchedulingDisabled':
      return 'Scheduling disabled';
    default:
      return status;
  }
}

function statusIcon(status: NodeComponentStatusLabel): React.ReactNode {
  const labelStatus = statusToLabelStatus(status);
  if (labelStatus === 'success') {
    return <CheckCircleIcon aria-hidden />;
  }
  if (labelStatus === 'warning') {
    return <ExclamationTriangleIcon aria-hidden />;
  }
  return <ExclamationCircleIcon aria-hidden />;
}

function ResourceAllocationCell({ row }: { row: NodeComponentSummaryRow }) {
  return (
    <Content component="p" className="ols-node-summary-allocation">
      <span className="ols-node-summary-allocation-line">
        CPU {row.cpuUtilPct}%{' '}
        <span className="ols-node-summary-allocation-rec">[Rec: {row.cpuRecommendedPct}%]</span>
      </span>
      <span className="ols-node-summary-allocation-line">
        Mem {row.memUtilPct}%{' '}
        <span className="ols-node-summary-allocation-rec">[Rec: {row.memRecommendedPct}%]</span>
      </span>
    </Content>
  );
}

function InvestigationCell({
  row,
  onInvestigationClick,
}: {
  row: NodeComponentSummaryRow;
  onInvestigationClick: (row: NodeComponentSummaryRow) => void;
}) {
  if (!row.investigation) {
    return (
      <Content component="p" className="ols-node-summary-investigation-idle" aria-label="No active investigation">
        —
      </Content>
    );
  }
  return (
    <Button
      variant="link"
      isInline
      className="ols-node-summary-investigation-link"
      onClick={() => onInvestigationClick(row)}
      aria-label={`Open OpenShift Lightspeed for investigation on ${row.name}`}
    >
      <span aria-hidden>✨ </span>
      {row.investigation.summary}
    </Button>
  );
}

export const NodeComponentSummary: React.FC = () => {
  const simulation = useSimulation();
  const clusterId = useFocusedClusterId();
  const [expanded, setExpanded] = useState(true);
  const [drawerRow, setDrawerRow] = useState<NodeComponentSummaryRow | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const rows = useMemo(
    () => buildNodeComponentSummaryRows(clusterId, simulation),
    [clusterId, simulation]
  );

  const activeInvestigationCount = useMemo(
    () => rows.filter((r) => r.investigation).length,
    [rows]
  );

  const openDrawer = useCallback((row: NodeComponentSummaryRow) => {
    setDrawerRow(row);
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const handleInvestigationClick = useCallback((row: NodeComponentSummaryRow) => {
    agenticGlobalAiApi.openLightspeedFromNodeInvestigation?.({
      assetName: row.name,
      investigationSummary: row.investigation?.summary ?? 'AI Hub (Autonomous agent) investigation',
    });
  }, []);

  return (
    <>
      <Card
        className="ols-aio-subcard ols-ai-hub-node-component-summary-card"
        isCompact
        component="section"
        isExpanded={expanded}
        id={CARD_ID}
        aria-label="Node and component summary"
      >
        <CardHeader
          onExpand={() => setExpanded((v) => !v)}
          toggleButtonProps={{
            id: `${CARD_ID}-toggle`,
            'aria-label': 'Toggle Node and component summary section',
          }}
        >
          <Flex alignItems={{ default: 'alignItemsCenter' }} flexWrap={{ default: 'wrap' }} gap={{ default: 'gapSm' }}>
            <CardTitle component="h3" className="ols-aio-fleet-subcard-title">
              Node &amp; component summary
            </CardTitle>
            <Label color="blue" isCompact>
              {rows.length} infrastructure assets
            </Label>
            {activeInvestigationCount > 0 ? (
              <Label color="purple" isCompact>
                {activeInvestigationCount} active investigation{activeInvestigationCount === 1 ? '' : 's'}
              </Label>
            ) : null}
          </Flex>
        </CardHeader>
        <CardExpandableContent>
          <CardBody className="ols-node-summary-card-body">
            <Content component="p" className="ols-node-summary-intro pf-v6-u-mb-md">
              Platform health ledger for this cluster — nodes and core OpenShift operators only (no application
              workloads).
            </Content>
            <div className="ols-node-summary-table-wrap">
              <Table aria-label="Node and component summary" variant="compact" borders={false}>
                <Thead>
                  <Tr>
                    <Th modifier="wrap">Name</Th>
                    <Th modifier="nowrap">Type</Th>
                    <Th modifier="nowrap">Status</Th>
                    <Th modifier="wrap">AI resource allocation</Th>
                    <Th modifier="wrap">Active agentic investigations</Th>
                    <Th modifier="nowrap">Alerts</Th>
                    <Th modifier="nowrap">Zone</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {rows.map((row) => {
                    const rowClass = row.investigation ? 'ols-node-summary-row--investigating' : undefined;
                    return (
                      <Tr key={row.id} className={rowClass}>
                        <Td dataLabel="Name" modifier="breakWord">
                          <Button
                            variant="link"
                            isInline
                            onClick={() => openDrawer(row)}
                            className="ols-node-summary-name-link"
                          >
                            {row.name}
                          </Button>
                        </Td>
                        <Td dataLabel="Type" modifier="nowrap">
                          <Label color="grey" variant="outline" isCompact>
                            {row.typeLabel}
                          </Label>
                        </Td>
                        <Td dataLabel="Status" modifier="nowrap">
                          <Label status={statusToLabelStatus(row.status)} icon={statusIcon(row.status)} isCompact>
                            {statusDisplayText(row.status)}
                          </Label>
                        </Td>
                        <Td dataLabel="AI resource allocation">
                          <ResourceAllocationCell row={row} />
                        </Td>
                        <Td dataLabel="Active agentic investigations">
                          <InvestigationCell row={row} onInvestigationClick={handleInvestigationClick} />
                        </Td>
                        <Td dataLabel="Alerts" modifier="nowrap">
                          {row.alertCount > 0 ? (
                            <Badge isRead className="ols-node-summary-alert-badge--firing">
                              {row.alertCount}
                            </Badge>
                          ) : (
                            <Badge className="ols-node-summary-alert-badge--clear">0</Badge>
                          )}
                        </Td>
                        <Td dataLabel="Zone" modifier="nowrap">
                          {row.zone}
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </div>
          </CardBody>
        </CardExpandableContent>
      </Card>

      <NodeComponentSummaryDrawer isOpen={isDrawerOpen} row={drawerRow} onClose={closeDrawer} />
    </>
  );
};

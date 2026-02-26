import * as React from 'react';
import {
  Content,
  Flex,
  FlexItem,
  Icon,
  Tooltip,
  Button,
  Label,
  Badge,
  Stack,
  StackItem,
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  Divider,
  EmptyState,
  EmptyStateBody,
  Accordion,
  AccordionItem,
  AccordionToggle,
  AccordionContent,
  Checkbox,
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
  BellIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
  CheckCircleIcon,
  EllipsisVIcon,
} from '@patternfly/react-icons';
import type {
  AlertSeverity,
  AlertComponent,
  AlertGroup,
  ClusterData,
  AlertData,
  AlertsGroupByOption,
  SortConfig,
  AggregatedAlert,
} from './types';
import {
  getSeverityLabelColor,
  getStatusLabelColor,
  getSeverityIcon,
} from './utils';

export interface ColumnConfig {
  key: string;
  label: string;
  isVisible: boolean;
  isLocked: boolean;
  order: number;
}

export interface AlertsTableContentProps {
  totalItems: number;
  isAggregated: boolean;
  groupBy: AlertsGroupByOption;
  groupedAlerts: { groupName: string; alerts: AggregatedAlert[]; totalCount: number }[] | null;
  groupedIndividualAlerts: { groupName: string; alerts: AlertData[] }[] | null;
  paginatedAggregatedAlerts: AggregatedAlert[];
  paginatedAlerts: (AlertData & { clusterName: string; cluster: ClusterData })[];
  expandedAlerts: string[];
  toggleExpanded: (alertKey: string) => void;
  expandedGroups: Set<string>;
  toggleGroupExpanded: (groupName: string) => void;
  severityFilter: AlertSeverity[];
  setSeverityFilter: React.Dispatch<React.SetStateAction<AlertSeverity[]>>;
  sortConfigs: SortConfig[];
  handleSort: (column: SortConfig['column']) => void;
  selectedAlertKeys: Set<string>;
  toggleSelectAll: () => void;
  toggleAlertSelection: (alertKey: string) => void;
  getVisibleColumns: () => ColumnConfig[];
  columns: ColumnConfig[];
  getSortParams: (column: SortConfig['column']) => {
    sortBy: { index: number; direction: 'asc' | 'desc' };
    onSort: () => void;
    columnIndex: number;
  };
  onAlertClick: (alert: AlertData, initialTab?: number) => void;
  onClusterClick: (cluster: ClusterData) => void;
  onAlertRuleClick: (alertName: string) => void;
  onComponentClick: (componentName: string) => void;
  openSilenceModal: (alertName: string, severity: string, clusterName: string) => void;
  openAcknowledgeModal: (alertName: string, severity: string, clusterName: string) => void;
  openActionMenuId: string | null;
  setOpenActionMenuId: React.Dispatch<React.SetStateAction<string | null>>;
  singleClusterView?: boolean;
  onClusterFilterChange?: (clusters: string[]) => void;
  onNamespaceFilterChange?: (namespaces: string[]) => void;
}

const AlertsTableContent: React.FC<AlertsTableContentProps> = ({
  totalItems,
  isAggregated,
  groupBy,
  groupedAlerts,
  groupedIndividualAlerts,
  paginatedAggregatedAlerts,
  paginatedAlerts,
  expandedAlerts,
  toggleExpanded,
  expandedGroups,
  toggleGroupExpanded,
  severityFilter,
  setSeverityFilter,
  sortConfigs,
  handleSort,
  selectedAlertKeys,
  toggleSelectAll,
  toggleAlertSelection,
  getVisibleColumns,
  columns,
  getSortParams,
  onAlertClick,
  onClusterClick,
  onAlertRuleClick,
  onComponentClick,
  openSilenceModal,
  openAcknowledgeModal,
  openActionMenuId,
  setOpenActionMenuId,
  singleClusterView = false,
  onClusterFilterChange,
  onNamespaceFilterChange,
}) => {
  return (
    <>
      {totalItems === 0 ? (
        <EmptyState titleText="No alerts found" icon={CheckCircleIcon}>
          <EmptyStateBody>No alerts match the current filters.</EmptyStateBody>
        </EmptyState>
      ) : isAggregated && groupBy !== 'none' && groupedAlerts ? (
        groupBy === 'component' ? (
          <Accordion asDefinitionList={false} displaySize="lg">
            {groupedAlerts.map(group => {
              const isGroupExpanded = expandedGroups.has(group.groupName);
              const criticalCount = group.alerts.filter(a => a.severity === 'Critical').length;
              const warningCount = group.alerts.filter(a => a.severity === 'Warning').length;
              const infoCount = group.alerts.filter(a => a.severity === 'Info').length;
              const aggregatedStatus: 'Critical' | 'Warning' | 'Info' =
                criticalCount > 0 ? 'Critical' : warningCount > 0 ? 'Warning' : 'Info';
              const impactGroups = Array.from(new Set(group.alerts.map(a => a.group)));
              const clustersForComponent = Array.from(new Set(group.alerts.flatMap(a => a.clusters.map(c => c.name))));

              return (
                <AccordionItem key={group.groupName} isExpanded={isGroupExpanded}>
                  <AccordionToggle
                    onClick={() => toggleGroupExpanded(group.groupName)}
                    id={`group-toggle-${group.groupName}`}
                  >
                    <Flex gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsCenter' }} flexWrap={{ default: 'nowrap' }} style={{ fontSize: '14px', fontWeight: 400 }}>
                      <FlexItem>
                        <strong>{group.groupName}</strong>
                      </FlexItem>
                      <FlexItem>
                        <Label
                          color={aggregatedStatus === 'Critical' ? 'red' : aggregatedStatus === 'Warning' ? 'orange' : 'blue'}
                          icon={aggregatedStatus === 'Critical' ? <ExclamationCircleIcon /> : aggregatedStatus === 'Warning' ? <ExclamationTriangleIcon /> : <InfoCircleIcon />}
                          isCompact
                        >
                          {aggregatedStatus}
                        </Label>
                      </FlexItem>
                      <FlexItem>
                        <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>|</span>
                      </FlexItem>
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
                      <FlexItem>
                        <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>|</span>
                      </FlexItem>
                      <FlexItem>
                        <span>{group.alerts.length} alert{group.alerts.length !== 1 ? 's' : ''}</span>
                      </FlexItem>
                      <FlexItem>
                        <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>|</span>
                      </FlexItem>
                      <FlexItem>
                        <span>Alert scope: {impactGroups[0] || 'N/A'}</span>
                      </FlexItem>
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
                    <Table aria-label={`Alerts in ${group.groupName} component`} variant="compact" isExpandable>
                      <Thead>
                        <Tr>
                          <Th screenReaderText="Expand" />
                          <Th>Alert name</Th>
                          <Th>Severity</Th>
                          <Th
                            sort={{
                              sortBy: {
                                index: sortConfigs.findIndex(c => c.column === 'total'),
                                direction: sortConfigs.find(c => c.column === 'total')?.direction || 'asc'
                              },
                              onSort: () => handleSort('total'),
                              columnIndex: 3
                            }}
                          >
                            Total
                          </Th>
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
          <Accordion asDefinitionList={false} displaySize="lg">
            {groupedAlerts.map(group => {
              const isGroupExpanded = expandedGroups.has(group.groupName);
              const groupSeverityColor = groupBy === 'severity'
                ? (group.groupName === 'Critical' ? 'red' : group.groupName === 'Warning' ? 'orange' : 'blue')
                : 'grey';
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
                      <FlexItem>
                        <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>|</span>
                      </FlexItem>
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
                          <FlexItem>
                            <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>|</span>
                          </FlexItem>
                        </>
                      )}
                      <FlexItem>
                        <span>{group.alerts.length} alert{group.alerts.length !== 1 ? 's' : ''}</span>
                      </FlexItem>
                      <FlexItem>
                        <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>|</span>
                      </FlexItem>
                      <FlexItem>
                        <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>{group.totalCount} instance{group.totalCount !== 1 ? 's' : ''}</span>
                      </FlexItem>
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
                          <Th
                            sort={{
                              sortBy: {
                                index: sortConfigs.findIndex(c => c.column === 'total'),
                                direction: sortConfigs.find(c => c.column === 'total')?.direction || 'asc'
                              },
                              onSort: () => handleSort('total'),
                              columnIndex: 3
                            }}
                          >
                            Total
                          </Th>
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
      ) : isAggregated ? (
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

                  if (col.key === 'alertName') {
                    thProps.isStickyColumn = true;
                    thProps.stickyMinWidth = "200px";
                    thProps.stickyLeftOffset = "90px";
                  }

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
                  default:
                    return '-';
                }
              };

              return (
                <Tbody key={alertKey} isExpanded={isExpanded}>
                  <Tr
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
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
        <Accordion asDefinitionList={false} displaySize="lg">
          {groupedIndividualAlerts!.map(group => {
            const isGroupExpanded = expandedGroups.has(group.groupName);
            const groupSeverityColor = groupBy === 'severity'
              ? (group.groupName === 'Critical' ? 'red' : group.groupName === 'Warning' ? 'orange' : 'blue')
              : 'grey';
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

                  if (col.key === 'alertName') {
                    thProps.isStickyColumn = true;
                    thProps.stickyMinWidth = "200px";
                    thProps.stickyLeftOffset = "0px";
                  }

                  if (col.key === 'severity') {
                    thProps.isStickyColumn = true;
                    thProps.stickyMinWidth = "120px";
                    thProps.stickyLeftOffset = "200px";
                  }

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

                      if (col.key === 'alertName') {
                        tdProps.isStickyColumn = true;
                        tdProps.stickyMinWidth = "200px";
                        tdProps.stickyLeftOffset = "0px";
                      }

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
    </>
  );
};

export { AlertsTableContent };

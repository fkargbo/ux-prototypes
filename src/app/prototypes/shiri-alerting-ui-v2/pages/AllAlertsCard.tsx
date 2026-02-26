import * as React from 'react';
import {
  Content,
  Card,
  CardTitle,
  CardBody,
  CardHeader,
  Divider,
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
  Switch,
  Pagination,
  EmptyState,
  EmptyStateBody,
  Accordion,
  AccordionItem,
  AccordionToggle,
  AccordionContent,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Checkbox,
  TextInputGroup,
  TextInputGroupMain,
  DatePicker,
  TimePicker,
  Select,
  SelectList,
  SelectOption,
  Alert as PfAlert,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
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
  CheckIcon,
  BellSlashIcon,
  ColumnsIcon,
  ExportIcon,
  EllipsisVIcon,
  PlusIcon,
  MinusIcon,
  QuestionCircleIcon,
  GripVerticalIcon,
} from '@patternfly/react-icons';
import type {
  AlertSeverity,
  AlertStatus,
  AlertComponent,
  AlertGroup,
  ClusterData,
  AlertData,
  AlertsGroupByOption,
  SortConfig,
  SortDirection,
} from './types';
import {
  getSeverityLabelColor,
  getStatusLabelColor,
  getSeverityIcon,
} from './utils';



interface AggregatedAlert {
  alertName: string;
  severity: AlertSeverity;
  totalCount: number;
  clusters: { name: string; cluster: ClusterData; count: number; lastFired: string; lastFiredTimestamp: Date }[];
  component: AlertComponent;
  group: AlertGroup;
}


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
  filterToolbar?: React.ReactNode;
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
  filterToolbar,
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
        // If clicking the current primary sort (priority 1), toggle direction
        if (existingConfig.priority === 1) {
          if (existingConfig.direction === 'asc') {
            return prevConfigs.map(c => 
              c.column === column ? { ...c, direction: 'desc' as SortDirection } : c
            );
          } else {
            return prevConfigs.map(c => 
              c.column === column ? { ...c, direction: 'asc' as SortDirection } : c
            );
          }
        } else {
          // Make this column the primary sort (priority 1), shift others down
          return [
            { column, direction: existingConfig.direction, priority: 1 },
            ...prevConfigs
              .filter(c => c.column !== column)
              .map(c => ({ ...c, priority: c.priority + 1 }))
          ];
        }
      } else {
        // Add new column as primary sort (priority 1), shift others down
        return [
          { column, direction: 'asc' as SortDirection, priority: 1 },
          ...prevConfigs.map(c => ({ ...c, priority: c.priority + 1 }))
        ];
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
      <CardHeader>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <CardTitle>
              Alerts
            </CardTitle>
          </FlexItem>
          {showMetrics && (
          <FlexItem>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '13px' }}>Firing alerts</span>
              <strong>{totalAlerts}</strong>
              <span style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '13px' }}>Pending alerts</span>
              <strong>{Math.floor(totalAlerts * 0.04)}</strong>
              <span style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '13px' }}>Acknowledged alerts</span>
              <strong>{Math.floor(totalAlerts * 0.04)}</strong>
              <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--pf-t--global--border--color--default)' }} />
              <Tooltip content={`Critical: ${criticalAlerts}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={onCriticalClick}>
                  <Icon status="danger"><ExclamationCircleIcon /></Icon>
                  <strong style={{ color: 'var(--pf-t--global--color--status--danger--default)' }}>{criticalAlerts}</strong>
                </div>
              </Tooltip>
              <Tooltip content={`Warning: ${warningAlerts}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={onWarningClick}>
                  <Icon status="warning"><ExclamationTriangleIcon /></Icon>
                  <strong style={{ color: 'var(--pf-t--global--color--status--warning--default)' }}>{warningAlerts}</strong>
                </div>
              </Tooltip>
              <Tooltip content={`Info: ${infoAlerts}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={onInfoClick}>
                  <Icon status="info"><InfoCircleIcon /></Icon>
                  <strong style={{ color: 'var(--pf-t--global--color--status--info--default)' }}>{infoAlerts}</strong>
                </div>
              </Tooltip>
              <Tooltip content={`Healthy: ${healthyAlerts}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={() => {}}>
                  <Icon status="success"><CheckCircleIcon /></Icon>
                  <strong style={{ color: 'var(--pf-t--global--color--status--success--default)' }}>{healthyAlerts}</strong>
                </div>
              </Tooltip>
            </div>
          </FlexItem>
          )}
        </Flex>
      </CardHeader>
      <Divider />
      {filterToolbar && (
        <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--pf-t--global--border--color--default)' }}>
          {filterToolbar}
        </div>
      )}
      <CardBody>
              <Stack hasGutter>
                <StackItem>
                  {/* Layout + actions + pagination - single row */}
                  <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }} style={{ padding: '8px 0', borderBottom: '1px solid var(--pf-t--global--border--color--default)' }}>
                    <FlexItem>
                      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                        <FlexItem>
                          <span style={{ fontWeight: 'bold', fontSize: '13px' }}>Layout</span>
                        </FlexItem>
                        <FlexItem>
                          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }}>
                            <span style={{ fontSize: '13px', color: 'var(--pf-t--global--text--color--subtle)' }}>Group by</span>
                            <Dropdown
                              isOpen={isGroupByOpen}
                              onOpenChange={setIsGroupByOpen}
                              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                <MenuToggle 
                                  ref={toggleRef} 
                                  variant="plainText"
                                  onClick={() => setIsGroupByOpen(!isGroupByOpen)}
                                  isExpanded={isGroupByOpen}
                                  style={{ padding: '4px 8px' }}
                                >
                                  {groupBy === 'none' ? 'None' : groupBy === 'alertName' ? 'Alert name' : groupBy === 'impact' ? 'Alert scope' : groupBy === 'cluster' ? 'Cluster' : groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}
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
                          </Flex>
                        </FlexItem>
                        {groupBy !== 'none' && (
                          (isAggregated && groupedAlerts && groupedAlerts.length > 0) ||
                          (!isAggregated && groupedIndividualAlerts && groupedIndividualAlerts.length > 0)
                        ) && (() => {
                          const activeGroups = isAggregated ? groupedAlerts : groupedIndividualAlerts;
                          const groupCount = activeGroups?.length || 0;
                          return (
                            <FlexItem>
                              <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                                <FlexItem>
                                  <span style={{ fontSize: '13px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                                    {groupCount} {groupCount === 1 ? 'group' : 'groups'}
                                  </span>
                                </FlexItem>
                                <FlexItem>
                                  <Button variant="link" isInline onClick={() => {
                                    const allGroupNames = activeGroups?.map(g => g.groupName) || [];
                                    setExpandedGroups(new Set(allGroupNames));
                                  }}>Expand all</Button>
                                </FlexItem>
                                <FlexItem>
                                  <Button variant="link" isInline onClick={() => setExpandedGroups(new Set())}>Collapse all</Button>
                                </FlexItem>
                              </Flex>
                            </FlexItem>
                          );
                        })()}
                        <FlexItem>
                          <Switch
                            id="aggregate-all-alerts-switch"
                            label="Aggregate by name"
                            isChecked={isAggregated}
                            onChange={(_, checked) => {
                              setIsAggregated(checked);
                              setPage(1);
                              setExpandedAlerts([]);
                            }}
                          />
                        </FlexItem>
                      </Flex>
                    </FlexItem>
                    <FlexItem>
                      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }}>
                        {selectedAlertKeys.size > 0 && (
                          <FlexItem>
                            <Button 
                              variant="secondary" 
                              icon={<BellSlashIcon />}
                              onClick={() => setIsSilenceModalOpen(true)}
                              size="sm"
                            >
                              Silence ({selectedAlertKeys.size})
                            </Button>
                          </FlexItem>
                        )}
                        <FlexItem>
                          <Tooltip content="Manage columns">
                            <Button variant="plain" icon={<ColumnsIcon />} onClick={openManageColumnsModal} aria-label="Manage columns" />
                          </Tooltip>
                        </FlexItem>
                        <FlexItem>
                          <Tooltip content="Export to CSV">
                            <Button variant="plain" icon={<ExportIcon />} onClick={exportToCSV} aria-label="Export to CSV" />
                          </Tooltip>
                        </FlexItem>
                        <FlexItem>
                          <Pagination
                            itemCount={totalItems}
                            perPage={perPage}
                            page={page}
                            onSetPage={(_, p) => setPage(p)}
                            onPerPageSelect={(_, pp) => setPerPage(pp)}
                            isCompact
                          />
                        </FlexItem>
                      </Flex>
                    </FlexItem>
                  </Flex>
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

export { AllAlertsCard };
export type { AllAlertsCardProps, AggregatedAlert };


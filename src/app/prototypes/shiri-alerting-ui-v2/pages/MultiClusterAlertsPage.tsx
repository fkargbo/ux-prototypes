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
import type {
  AlertSeverity, AlertStatus, ClusterAlertStatus, ACMClusterStatus,
  AlertGroup, AlertComponent, GroupByOption, SortByOption, ViewMode,
  ImportanceSizing, UserRole, SortDirection, NavigationView, AlertsGroupByOption,
  SortConfig, ComponentHealthData, AlertData, ClusterData, TrendData,
  ColumnConfig, SavedFilter, ToastNotification,
  AlertRuleState, AlertRuleSource, AlertRuleActiveAlert, AlertRuleModification, AlertRule,
  EnvironmentCategory, TeamCategory,
} from './types';
import {
  getClusterAlertStatus, getStatusBackgroundColor, getSeverityLabelColor,
  getStatusLabelColor, getSeverityIcon, getUniqueValues, getAllLabels,
  getAllNamespaces, getAllAlerts, getTileValue,
} from './utils';
import { AllAlertsCard } from './AllAlertsCard';
import { FilterPanel } from './FilterPanel';
import { AlertTimelineVisualization } from './AlertTimelineVisualization';
import { AlertDetailDrawer } from './AlertDetailDrawer';
import { AlertRuleDrawer } from './AlertRuleDrawer';
import { ClusterComponentsHealth } from './ClusterComponentsHealth';
import { AlertsTimelineCard } from './AlertsTimelineCard';
import { CrossClusterInsightsCards } from './CrossClusterInsightsCards';


import { TreemapHeatmap } from './TreemapHeatmap';
import { ManagementTab } from './ManagementTab';
import { SettingsModals } from './SettingsModals';
import { DrillDownContent } from './DrillDownContent';
import { FleetOverviewTab } from './FleetOverviewTab';
import { mockAlertRules, mockTrendData, mockClusters } from './mockData';


// ========================================
// MAIN COMPONENT
// ========================================

const MultiClusterAlertingDashboard: React.FunctionComponent = () => {
  // Router hooks for URL-based navigation state (enables browser back button)
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Main page tabs - Fleet overview | Alerts | Incidents | Management
  const [mainPageTab, setMainPageTab] = React.useState<string | number>(() => {
    const tab = searchParams.get('tab');
    if (tab === 'management') return 'management';
    if (tab === 'incidents') return 'incidents';
    if (tab === 'alerts' || tab === 'firing-alerts') return 'alerts';
    return 'fleet-overview';
  });
  const [managementSubTab, setManagementSubTab] = React.useState<string | number>(() => {
    const subtab = searchParams.get('subtab');
    return subtab === 'silence-rules' ? 'silence-rules' : 'alert-rules';
  });
  
  // Track when user navigated from Fleet overview to Alerts (e.g. via cluster click) - for Back button
  const [cameFromFleetOverview, setCameFromFleetOverview] = React.useState(false);
  
  // Handle URL parameter changes for tab navigation
  React.useEffect(() => {
    const tab = searchParams.get('tab');
    const subtab = searchParams.get('subtab');
    if (tab === 'management') {
      setMainPageTab('management');
      setCameFromFleetOverview(false);
      if (subtab === 'silence-rules') {
        setManagementSubTab('silence-rules');
      } else {
        setManagementSubTab('alert-rules');
      }
    } else if (tab === 'incidents') {
      setMainPageTab('incidents');
      setCameFromFleetOverview(false);
    } else if (tab === 'alerts' || tab === 'firing-alerts') {
      setMainPageTab('alerts');
    } else {
      setMainPageTab('fleet-overview');
      setCameFromFleetOverview(false);
    }
  }, [searchParams]);
  
  // Handle main tab change with URL sync
  const handleMainTabChange = React.useCallback((key: string | number) => {
    setMainPageTab(key);
    const newParams = new URLSearchParams(searchParams);
    if (key === 'management') {
      newParams.set('tab', 'management');
      setCameFromFleetOverview(false);
    } else if (key === 'incidents') {
      newParams.set('tab', 'incidents');
      setCameFromFleetOverview(false);
    } else if (key === 'alerts') {
      newParams.set('tab', 'alerts');
    } else {
      newParams.delete('tab');
      newParams.delete('cluster');
      newParams.delete('component');
      newParams.delete('alertName');
      setCameFromFleetOverview(false);
    }
    navigate(`?${newParams.toString()}`, { replace: false });
  }, [navigate, searchParams]);
  
  // Back from Alerts to Fleet overview (when navigated via cluster click)
  const handleBackToFleetOverview = React.useCallback(() => {
    setMainPageTab('fleet-overview');
    setCameFromFleetOverview(false);
    setClusterFilter([]);
    setMainComponentFilter(null);
    setMainAlertNameFilter(null);
    setSelectedClusterForAlerts(null);
    setFiringAlertsCardView('all-clusters');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('tab');
    newParams.delete('cluster');
    newParams.delete('component');
    newParams.delete('alertName');
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

  // Fleet Overview filter states
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

  // Alerts tab filter states (independent from Fleet Overview)
  const [alertsTabRegionFilter, setAlertsTabRegionFilter] = React.useState<string[]>([]);
  const [alertsTabClusterFilter, setAlertsTabClusterFilter] = React.useState<string[]>([]);
  const [alertsTabNamespaceFilter, setAlertsTabNamespaceFilter] = React.useState<string[]>([]);
  const [alertsTabLabelFilter, setAlertsTabLabelFilter] = React.useState<string[]>([]);
  const [alertsTabSeverityFilter, setAlertsTabSeverityFilter] = React.useState<AlertSeverity[]>([]);
  const [alertsTabGroupFilter, setAlertsTabGroupFilter] = React.useState<AlertGroup[]>(['Cluster', 'Namespace']);
  const [alertsTabComponentFilter, setAlertsTabComponentFilter] = React.useState<AlertComponent[]>([]);
  const [alertsTabSearchValue, setAlertsTabSearchValue] = React.useState('');
  const [alertsTabTriggeredFromDate, setAlertsTabTriggeredFromDate] = React.useState<string>('');
  const [alertsTabTriggeredFromTime, setAlertsTabTriggeredFromTime] = React.useState<string>('');
  const [alertsTabTriggeredToDate, setAlertsTabTriggeredToDate] = React.useState<string>('');
  const [alertsTabTriggeredToTime, setAlertsTabTriggeredToTime] = React.useState<string>('');
  const [alertsTabIsFilterPanelOpen, setAlertsTabIsFilterPanelOpen] = React.useState(false);

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
  const [savedFilters, setSavedFilters] = React.useState<SavedFilter[]>([]);
  const [isSavedFiltersDropdownOpen, setIsSavedFiltersDropdownOpen] = React.useState(false);
  const [selectedSavedFilter, setSelectedSavedFilter] = React.useState<SavedFilter | null>(null);
  const [isManageSavedFiltersModalOpen, setIsManageSavedFiltersModalOpen] = React.useState(false);
  const [editingFilterId, setEditingFilterId] = React.useState<string | null>(null);
  const [editingFilterName, setEditingFilterName] = React.useState('');
  const [isSaveFilterModalOpen, setIsSaveFilterModalOpen] = React.useState(false);
  const [newFilterName, setNewFilterName] = React.useState('');
  const [saveGroupingSorting, setSaveGroupingSorting] = React.useState(true);
  const [saveSearchInput, setSaveSearchInput] = React.useState(true);

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

  // Drill-down sort configuration
  const [drillDownSortConfigs, setDrillDownSortConfigs] = React.useState<SortConfig[]>([]);

  const handleDrillDownSort = (column: SortConfig['column']) => {
    setDrillDownSortConfigs(prevConfigs => {
      const existingConfig = prevConfigs.find(c => c.column === column);
      if (existingConfig) {
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
        const maxPriority = prevConfigs.length > 0 ? Math.max(...prevConfigs.map(c => c.priority)) : 0;
        return [...prevConfigs, { column, direction: 'asc' as SortDirection, priority: maxPriority + 1 }];
      }
    });
    setDrillDownPage(1);
  };

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
    
    // Sync tab state with URL - when going back to fleet-overview, reset filter state
    if (urlTab !== 'alerts' && urlTab !== 'firing-alerts' && urlTab !== 'management' && urlTab !== 'incidents') {
      setClusterFilter([]);
      setMainComponentFilter(null);
      setSelectedClusterForAlerts(null);
      setFiringAlertsCardView('all-clusters');
      setCameFromFleetOverview(false);
    }
    
    // Sync cluster filter with URL
    if (urlCluster && (urlTab === 'alerts' || urlTab === 'firing-alerts')) {
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

  // Clusters for display - apply treemap legend filters so table and treemap stay in sync
  const clustersForDisplay = React.useMemo(() => {
    if (treemapLegendFilters.length === 0) return sortedClusters;
    return sortedClusters.filter(cluster => {
      const status = getClusterAlertStatus(cluster);
      const statusCapitalized = status.charAt(0).toUpperCase() + status.slice(1);
      return treemapLegendFilters.includes(statusCapitalized as 'Critical' | 'Warning' | 'Info' | 'Healthy');
    });
  }, [sortedClusters, treemapLegendFilters]);

  // Reset table page when legend filter reduces result set below current page
  React.useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(clustersForDisplay.length / perPage));
    if (page > maxPage) setPage(maxPage);
  }, [clustersForDisplay.length, perPage, page]);

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
    let result = Object.entries(grouped).map(([key, data]) => ({
      key,
      alertName: data.alerts[0].alertName,
      severity: data.severity,
      count: data.count,
      alerts: data.alerts,
    }));

    // Apply sorting
    if (drillDownSortConfigs.length > 0) {
      result = [...result].sort((a, b) => {
        for (const config of drillDownSortConfigs.sort((c1, c2) => c1.priority - c2.priority)) {
          let comparison = 0;
          
          switch (config.column) {
            case 'total':
              comparison = a.count - b.count;
              break;
            case 'severity':
              const severityOrder = { 'Critical': 3, 'Warning': 2, 'Info': 1 };
              comparison = (severityOrder[a.severity] || 0) - (severityOrder[b.severity] || 0);
              break;
            case 'alertName':
              comparison = a.alertName.localeCompare(b.alertName);
              break;
          }
          
          if (comparison !== 0) {
            return config.direction === 'asc' ? comparison : -comparison;
          }
        }
        return 0;
      });
    }

    return result;
  }, [drillDownFilteredAlerts, drillDownSortConfigs]);

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
    newParams.set('tab', 'alerts');
    newParams.set('cluster', cluster.name);
    navigate(`?${newParams.toString()}`, { replace: false });
    setMainPageTab('alerts');
    setCameFromFleetOverview(true);
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
    newParams.set('tab', 'alerts');
    newParams.set('cluster', cluster.name);
    newParams.set('component', component);
    navigate(`?${newParams.toString()}`, { replace: false });
    setMainPageTab('alerts');
    setCameFromFleetOverview(true);
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

  const clearAlertsTabFilters = () => {
    setAlertsTabRegionFilter([]);
    setAlertsTabClusterFilter([]);
    setAlertsTabNamespaceFilter([]);
    setAlertsTabLabelFilter([]);
    setAlertsTabSeverityFilter([]);
    setAlertsTabGroupFilter(['Cluster', 'Namespace']);
    setAlertsTabComponentFilter([]);
    setAlertsTabSearchValue('');
    setAlertsTabTriggeredFromDate('');
    setAlertsTabTriggeredFromTime('');
    setAlertsTabTriggeredToDate('');
    setAlertsTabTriggeredToTime('');
    setSelectedClusterForAlerts(null);
    setFiringAlertsCardView('all-clusters');
    setMainComponentFilter(null);
    setMainAlertNameFilter(null);
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
    selectedClusterInCard !== null || selectedClusterForAlerts !== null || mainComponentFilter !== null || mainAlertNameFilter !== null;

  // Alerts tab active filters
  const isAlertsTabGlobalView = alertsTabGroupFilter.length === 2 && alertsTabGroupFilter.includes('Cluster') && alertsTabGroupFilter.includes('Namespace');
  const hasAlertsTabGroupFilterChanges = !isAlertsTabGlobalView;
  const hasAlertsTabActiveFilters = alertsTabRegionFilter.length > 0 || alertsTabClusterFilter.length > 0 || alertsTabNamespaceFilter.length > 0 || 
    alertsTabLabelFilter.length > 0 || alertsTabSeverityFilter.length > 0 || hasAlertsTabGroupFilterChanges || alertsTabComponentFilter.length > 0 || alertsTabSearchValue.length > 0 ||
    mainComponentFilter !== null || mainAlertNameFilter !== null;

  // Filtered clusters for Alerts tab (uses alerts-tab-specific filters)
  const filteredClustersForAlerts = React.useMemo(() => {
    return mockClusters.filter(cluster => {
      if (alertsTabRegionFilter.length > 0 && !alertsTabRegionFilter.includes(cluster.region)) return false;
      if (alertsTabClusterFilter.length > 0 && !alertsTabClusterFilter.includes(cluster.name)) return false;
      if (alertsTabNamespaceFilter.length > 0 && !cluster.namespaces.some(ns => alertsTabNamespaceFilter.includes(ns))) return false;
      if (alertsTabSearchValue && !cluster.name.toLowerCase().includes(alertsTabSearchValue.toLowerCase())) return false;
      if (alertsTabSeverityFilter.length > 0) {
        const hasMatchingAlert = cluster.alerts.some(a => a.status === 'firing' && alertsTabSeverityFilter.includes(a.severity));
        if (!hasMatchingAlert && cluster.alerts.filter(a => a.status === 'firing').length > 0) return false;
      }
      if (alertsTabComponentFilter.length > 0) {
        const hasMatchingComponentAlert = cluster.alerts.some(a => 
          a.status === 'firing' && alertsTabComponentFilter.includes(a.component)
        );
        if (!hasMatchingComponentAlert) return false;
      }
      return true;
    });
  }, [alertsTabRegionFilter, alertsTabClusterFilter, alertsTabNamespaceFilter, alertsTabSearchValue, alertsTabSeverityFilter, alertsTabComponentFilter]);

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
  // DrillDownContent extracted to ./DrillDownContent.tsx
  // ========================================

  // Refresh interval state
  const [refreshInterval, setRefreshInterval] = React.useState<number | null>(null);
  const [isRefreshIntervalOpen, setIsRefreshIntervalOpen] = React.useState(false);
  
  // Quick time range state (Fleet Overview)
  type QuickTimeRange = 'last-5m' | 'last-15m' | 'last-30m' | 'last-1h' | 'last-4h' | 'last-6h' | 'last-12h' | 'last-24h' | 'last-2d' | 'last-7d' | 'custom';
  const [quickTimeRange, setQuickTimeRange] = React.useState<QuickTimeRange>('last-6h');
  const [isQuickTimeRangeOpen, setIsQuickTimeRangeOpen] = React.useState(false);
  const [isCustomTimeRangePopoverOpen, setIsCustomTimeRangePopoverOpen] = React.useState(false);

  // Quick time range state (Alerts tab)
  const [alertsTabQuickTimeRange, setAlertsTabQuickTimeRange] = React.useState<QuickTimeRange>('last-6h');
  const [alertsTabIsQuickTimeRangeOpen, setAlertsTabIsQuickTimeRangeOpen] = React.useState(false);
  const [alertsTabIsCustomTimeRangePopoverOpen, setAlertsTabIsCustomTimeRangePopoverOpen] = React.useState(false);
  
  const quickTimeRangeOptions = [
    { value: 'last-5m' as QuickTimeRange, label: 'Last 5 minutes', minutes: 5 },
    { value: 'last-15m' as QuickTimeRange, label: 'Last 15 minutes', minutes: 15 },
    { value: 'last-30m' as QuickTimeRange, label: 'Last 30 minutes', minutes: 30 },
    { value: 'last-1h' as QuickTimeRange, label: 'Last 1 hour', minutes: 60 },
    { value: 'last-4h' as QuickTimeRange, label: 'Last 4 hours', minutes: 240 },
    { value: 'last-6h' as QuickTimeRange, label: 'Last 6 hours', minutes: 360 },
    { value: 'last-12h' as QuickTimeRange, label: 'Last 12 hours', minutes: 720 },
    { value: 'last-24h' as QuickTimeRange, label: 'Last 24 hours', minutes: 1440 },
    { value: 'last-2d' as QuickTimeRange, label: 'Last 2 days', minutes: 2880 },
    { value: 'last-7d' as QuickTimeRange, label: 'Last 7 days', minutes: 10080 },
    { value: 'custom' as QuickTimeRange, label: 'Custom time range', minutes: null },
  ];
  
  // Calculate from/to dates based on quick time range (Fleet Overview)
  React.useEffect(() => {
    if (quickTimeRange !== 'custom') {
      const option = quickTimeRangeOptions.find(opt => opt.value === quickTimeRange);
      if (option && option.minutes) {
        const now = new Date();
        const fromDate = new Date(now.getTime() - option.minutes * 60 * 1000);
        
        setTriggeredFromDate(fromDate.toISOString().split('T')[0]);
        setTriggeredFromTime(fromDate.toTimeString().slice(0, 5));
        setTriggeredToDate(now.toISOString().split('T')[0]);
        setTriggeredToTime(now.toTimeString().slice(0, 5));
      }
    }
  }, [quickTimeRange]);

  // Calculate from/to dates based on quick time range (Alerts tab)
  React.useEffect(() => {
    if (alertsTabQuickTimeRange !== 'custom') {
      const option = quickTimeRangeOptions.find(opt => opt.value === alertsTabQuickTimeRange);
      if (option && option.minutes) {
        const now = new Date();
        const fromDate = new Date(now.getTime() - option.minutes * 60 * 1000);
        
        setAlertsTabTriggeredFromDate(fromDate.toISOString().split('T')[0]);
        setAlertsTabTriggeredFromTime(fromDate.toTimeString().slice(0, 5));
        setAlertsTabTriggeredToDate(now.toISOString().split('T')[0]);
        setAlertsTabTriggeredToTime(now.toTimeString().slice(0, 5));
      }
    }
  }, [alertsTabQuickTimeRange]);
  
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
      {/* Header + Toolbar Section - Show for main tab views */}
      {(navigationView === 'fleet-overview' || mainPageTab === 'incidents' || mainPageTab === 'management') && (
      <div style={{ 
        flexShrink: 0,
        backgroundColor: 'var(--pf-t--global--background--color--primary--default, #ffffff)',
        zIndex: 100,
        paddingBottom: '0px',
      }}>
        {/* Page Header */}
        <div>
          <div className="alerting-page-header" style={{ padding: '16px 8px 0 8px' }}>
            {/* Breadcrumbs - above page header (direct children required for separator arrows) */}
            <div style={{ marginBottom: '8px' }}>
              <Breadcrumb aria-label="Breadcrumb">
                <BreadcrumbItem component="button" onClick={() => handleMainTabChange('fleet-overview')}>
                  Multi-cluster alerting
                </BreadcrumbItem>
                {mainPageTab === 'fleet-overview' && <BreadcrumbItem isActive>Fleet overview</BreadcrumbItem>}
                {mainPageTab === 'alerts' && cameFromFleetOverview && (
                  <BreadcrumbItem component="button" onClick={handleBackToFleetOverview}>
                    Fleet overview
                  </BreadcrumbItem>
                )}
                {mainPageTab === 'alerts' && <BreadcrumbItem isActive>Alerts</BreadcrumbItem>}
                {mainPageTab === 'incidents' && <BreadcrumbItem isActive>Incidents</BreadcrumbItem>}
                {mainPageTab === 'management' && <BreadcrumbItem isActive>Management</BreadcrumbItem>}
              </Breadcrumb>
            </div>
            {/* Header Row - Title + Refresh on same line */}
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '4px' }}>
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                <FlexItem>
                  <Icon size="md" status="danger">
                    <OutlinedBellIcon />
                  </Icon>
                </FlexItem>
                <FlexItem>
                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                    <Title headingLevel="h1" size="lg">Multi-cluster alerting</Title>
                    <Badge>v2</Badge>
                  </Flex>
                </FlexItem>
              </Flex>
              {/* Refresh with interval dropdown - moved to header */}
              <Flex gap={{ default: 'gapSm' }}>
                <FlexItem>
                  <Stack hasGutter={false}>
                    <StackItem>
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
                    </StackItem>
                    <StackItem>
                      <Content 
                        component="small" 
                        style={{ 
                          color: 'var(--pf-t--global--text--color--subtle)', 
                          fontSize: 'var(--pf-t--global--font--size--sm)',
                          display: 'block',
                          marginTop: '4px'
                        }}
                      >
                        Last refresh: {lastRefresh.toLocaleTimeString()}
                      </Content>
                    </StackItem>
                  </Stack>
                </FlexItem>
              </Flex>
            </Flex>

            {/* Main Page Tabs: Fleet overview | Alerts | Incidents | Management */}
            <Tabs 
              activeKey={mainPageTab} 
              onSelect={(_, key) => handleMainTabChange(key)} 
              aria-label="Main alerting tabs"
              style={{ marginBottom: 0 }}
            >
              <Tab eventKey="fleet-overview" title={<TabTitleText><TachometerAltIcon /> Fleet overview</TabTitleText>} />
              <Tab eventKey="alerts" title={<TabTitleText><BellIcon /> Alerts</TabTitleText>} />
              <Tab eventKey="incidents" title={<TabTitleText><PortIcon /> Incidents</TabTitleText>} />
              <Tab eventKey="management" title={<TabTitleText><CogIcon /> Management</TabTitleText>} />
            </Tabs>

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

        {/* Toolbar section - Under tabs, only for Fleet overview (Alerts tab has filters inside card) */}
        {mainPageTab === 'fleet-overview' && (
          <div style={{ 
            padding: '16px 8px', 
            backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
          }}>
            <Toolbar className="pf-m-align-items-center" style={{ backgroundColor: 'transparent', paddingLeft: 0, paddingRight: 0, paddingBottom: 0 }}>
              <ToolbarContent className="pf-m-align-items-center">
                {/* Filters Button - First */}
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
                      componentFilter.length
                    }</Badge>}
                  </Button>
                </ToolbarItem>
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
                        {selectedSavedFilter ? selectedSavedFilter.name : 'My saved filters'}
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
                              
                              if (filter.viewSettings) {
                                if (filter.viewSettings.groupBy !== undefined) {
                                  setGroupBy(filter.viewSettings.groupBy);
                                }
                                if (filter.viewSettings.sortBy !== undefined) {
                                  setSortBy(filter.viewSettings.sortBy);
                                }
                                if (filter.viewSettings.importanceSizing !== undefined) {
                                  setImportanceSizing(filter.viewSettings.importanceSizing);
                                }
                              }
                              
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
                {/* Search Input - Third, flex grow to fill available space */}
                <ToolbarItem style={{ flex: 1 }}>
                  <SearchInput
                    placeholder="Search clusters"
                    value={searchValue}
                    onChange={(_, value) => setSearchValue(value)}
                    onClear={() => setSearchValue('')}
                    style={{ width: '100%' }}
                  />
                </ToolbarItem>
            {/* Time Range Selector - Compact, right-aligned */}
            <ToolbarItem align={{ default: 'alignEnd' }}>
              <Popover
                isVisible={isCustomTimeRangePopoverOpen}
                shouldClose={() => setIsCustomTimeRangePopoverOpen(false)}
                headerContent="Custom time range"
                minWidth="360px"
                maxWidth="360px"
                bodyContent={
                  <Stack hasGutter>
                    <StackItem>
                      <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', marginBottom: '4px', display: 'block' }}>From</Content>
                      <Flex gap={{ default: 'gapXs' }} flexWrap={{ default: 'nowrap' }}>
                        <FlexItem>
                          <DatePicker
                            value={triggeredFromDate || ''}
                            onChange={(_, str) => setTriggeredFromDate(str)}
                            placeholder="YYYY-MM-DD"
                            style={{ width: '170px' }}
                          />
                        </FlexItem>
                        <FlexItem>
                          <TimePicker
                            time={triggeredFromTime || ''}
                            onChange={(_, time) => setTriggeredFromTime(time)}
                            placeholder="HH:MM"
                            aria-label="From time"
                            is24Hour
                            style={{ width: '100px' }}
                            menuAppendTo={() => document.body}
                          />
                        </FlexItem>
                      </Flex>
                    </StackItem>
                    <StackItem>
                      <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', marginBottom: '4px', display: 'block' }}>To</Content>
                      <Flex gap={{ default: 'gapXs' }} flexWrap={{ default: 'nowrap' }}>
                        <FlexItem>
                          <DatePicker
                            value={triggeredToDate || ''}
                            onChange={(_, str) => setTriggeredToDate(str)}
                            placeholder="YYYY-MM-DD"
                            style={{ width: '170px' }}
                          />
                        </FlexItem>
                        <FlexItem>
                          <TimePicker
                            time={triggeredToTime || ''}
                            onChange={(_, time) => setTriggeredToTime(time)}
                            placeholder="HH:MM"
                            aria-label="To time"
                            is24Hour
                            style={{ width: '100px' }}
                            menuAppendTo={() => document.body}
                          />
                        </FlexItem>
                      </Flex>
                    </StackItem>
                    <StackItem>
                      <Button variant="primary" onClick={() => setIsCustomTimeRangePopoverOpen(false)} style={{ width: '100%' }}>
                        Apply
                      </Button>
                    </StackItem>
                  </Stack>
                }
                position="bottom-end"
              >
                <Dropdown
                  isOpen={isQuickTimeRangeOpen}
                  onOpenChange={setIsQuickTimeRangeOpen}
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      variant="plainText"
                      onClick={() => setIsQuickTimeRangeOpen(!isQuickTimeRangeOpen)}
                      isExpanded={isQuickTimeRangeOpen}
                      icon={<ClockIcon />}
                      style={{ minWidth: '140px', padding: '4px 8px' }}
                    >
                      {quickTimeRangeOptions.find(o => o.value === quickTimeRange)?.label}
                    </MenuToggle>
                  )}
                >
                  <DropdownList>
                    {quickTimeRangeOptions.map(opt => (
                      <DropdownItem
                        key={opt.value}
                        onClick={() => {
                          if (opt.value === 'custom') {
                            setQuickTimeRange('custom');
                            setIsQuickTimeRangeOpen(false);
                            setIsCustomTimeRangePopoverOpen(true);
                          } else {
                            setQuickTimeRange(opt.value);
                            setIsQuickTimeRangeOpen(false);
                          }
                        }}
                      >
                        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ width: '100%' }}>
                          <FlexItem>{opt.label}</FlexItem>
                          {quickTimeRange === opt.value && (
                            <FlexItem>
                              <CheckIcon style={{ color: 'var(--pf-t--global--icon--color--brand--default)' }} />
                            </FlexItem>
                          )}
                        </Flex>
                      </DropdownItem>
                    ))}
                  </DropdownList>
                </Dropdown>
              </Popover>
            </ToolbarItem>
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
      {mainPageTab === 'fleet-overview' && navigationView === 'fleet-overview' && (
      <FleetOverviewTab
        isFilterPanelOpen={isFilterPanelOpen}
        setIsFilterPanelOpen={setIsFilterPanelOpen}
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
        namespaces={namespaces}
        availableLabels={availableLabels}
        regionCounts={regionCounts}
        clusterCounts={clusterCounts}
        namespaceCounts={namespaceCounts}
        savedFilters={savedFilters}
        setSavedFilters={setSavedFilters}
        searchValue={searchValue}
        clusterCardRef={clusterCardRef}
        clusterCardView={clusterCardView}
        setClusterCardView={setClusterCardView}
        selectedClusterInCard={selectedClusterInCard}
        setSelectedClusterInCard={setSelectedClusterInCard}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortBy={sortBy}
        setSortBy={setSortBy}
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        importanceSizing={importanceSizing}
        setImportanceSizing={setImportanceSizing}
        sizeByOptions={sizeByOptions}
        isSortByOpen={isSortByOpen}
        setIsSortByOpen={setIsSortByOpen}
        isGroupByOpen={isGroupByOpen}
        setIsGroupByOpen={setIsGroupByOpen}
        isSizeByOpen={isSizeByOpen}
        setIsSizeByOpen={setIsSizeByOpen}
        environmentCategories={environmentCategories}
        teamCategories={teamCategories}
        setTempTeamCategories={setTempTeamCategories}
        setNewTeamPatternInputs={setNewTeamPatternInputs}
        setIsTeamSettingsOpen={setIsTeamSettingsOpen}
        setTempEnvironmentCategories={setTempEnvironmentCategories}
        setNewPatternInputs={setNewPatternInputs}
        setIsEnvironmentSettingsOpen={setIsEnvironmentSettingsOpen}
        treemapLegendFilters={treemapLegendFilters}
        setTreemapLegendFilters={setTreemapLegendFilters}
        activeSortIndex={activeSortIndex}
        setActiveSortIndex={setActiveSortIndex}
        activeSortDirection={activeSortDirection}
        setActiveSortDirection={setActiveSortDirection}
        page={page}
        setPage={setPage}
        perPage={perPage}
        setPerPage={setPerPage}
        filteredClusters={filteredClusters}
        sortedClusters={sortedClusters}
        clustersForDisplay={clustersForDisplay}
        totalAlerts={totalAlerts}
        criticalAlerts={criticalAlerts}
        warningAlerts={warningAlerts}
        infoAlerts={infoAlerts}
        healthyClusters={healthyClusters}
        handleBackToAllClusters={handleBackToAllClusters}
        handleDrillDown={handleDrillDown}
        handleComponentClickInCard={handleComponentClickInCard}
        onAlertRuleClick={(alertName) => {
          setMainAlertNameFilter(alertName);
          setMainPageTab('alerts');
          setCameFromFleetOverview(true);
          const newParams = new URLSearchParams(searchParams);
          newParams.set('tab', 'alerts');
          newParams.set('alertName', alertName);
          navigate(`?${newParams.toString()}`, { replace: false });
          setShowFilterAnimation(true);
          setTimeout(() => setShowFilterAnimation(false), 1500);
        }}
        onComponentClick={(componentName) => {
          setMainComponentFilter(componentName);
          setMainPageTab('alerts');
          setCameFromFleetOverview(true);
          const newParams = new URLSearchParams(searchParams);
          newParams.set('tab', 'alerts');
          newParams.set('component', componentName);
          navigate(`?${newParams.toString()}`, { replace: false });
          setShowFilterAnimation(true);
          setTimeout(() => setShowFilterAnimation(false), 1500);
        }}
      />
      )}

      {/* V2: Scrollable Content Area - Fleet Overview - Firing Alerts Sub-tab */}
      {mainPageTab === 'alerts' && navigationView === 'fleet-overview' && (
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
        {/* Back button when navigated from Fleet overview */}
        {cameFromFleetOverview && (
          <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--pf-t--global--border--color--default)', flexShrink: 0 }}>
            <Button variant="link" isInline icon={<ArrowLeftIcon />} onClick={handleBackToFleetOverview}>
              Back to Fleet overview
            </Button>
          </div>
        )}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          {/* Filter Side Panel - Sticky */}
          {alertsTabIsFilterPanelOpen && (
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
                regionFilter={alertsTabRegionFilter}
                setRegionFilter={setAlertsTabRegionFilter}
                clusterFilter={alertsTabClusterFilter}
                setClusterFilter={setAlertsTabClusterFilter}
                namespaceFilter={alertsTabNamespaceFilter}
                setNamespaceFilter={setAlertsTabNamespaceFilter}
                labelFilter={alertsTabLabelFilter}
                setLabelFilter={setAlertsTabLabelFilter}
                severityFilter={alertsTabSeverityFilter}
                setSeverityFilter={setAlertsTabSeverityFilter}
                groupFilter={alertsTabGroupFilter}
                setGroupFilter={setAlertsTabGroupFilter}
                componentFilter={alertsTabComponentFilter}
                setComponentFilter={setAlertsTabComponentFilter}
                regions={regions}
                clusterNames={clusterNames}
                clusters={mockClusters}
                namespaces={namespaces}
                availableLabels={availableLabels}
                regionCounts={regionCounts}
                clusterCounts={clusterCounts}
                namespaceCounts={namespaceCounts}
                onClose={() => setAlertsTabIsFilterPanelOpen(false)}
                savedFilters={savedFilters}
                onApplySavedFilter={(filter) => {
                  setAlertsTabSeverityFilter(filter.filters.severity);
                  setAlertsTabGroupFilter(filter.filters.group);
                  setAlertsTabComponentFilter(filter.filters.component);
                }}
                onSaveFilter={(name) => {
                  const newFilter: SavedFilter = {
                    id: `sf-${Date.now()}`,
                    name,
                    filters: { severity: alertsTabSeverityFilter, group: alertsTabGroupFilter, component: alertsTabComponentFilter, source: [], searchValue: alertsTabSearchValue },
                  };
                  setSavedFilters([...savedFilters, newFilter]);
                }}
                onDeleteSavedFilter={(id) => setSavedFilters(savedFilters.filter(f => f.id !== id))}
                showAlertFilters={true}
                stateFilter={alertStateFilter}
                setStateFilter={setAlertStateFilter}
                sourceFilter={alertSourceFilter}
                setSourceFilter={setAlertSourceFilter}
                triggeredFromDate={alertsTabTriggeredFromDate}
                setTriggeredFromDate={setAlertsTabTriggeredFromDate}
                triggeredFromTime={alertsTabTriggeredFromTime}
                setTriggeredFromTime={setAlertsTabTriggeredFromTime}
                triggeredToDate={alertsTabTriggeredToDate}
                setTriggeredToDate={setAlertsTabTriggeredToDate}
                triggeredToTime={alertsTabTriggeredToTime}
                setTriggeredToTime={setAlertsTabTriggeredToTime}
                filterContext="alerts"
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
                  affectedClusters={filteredClustersForAlerts.filter(c => c.alerts.some(a => a.status === 'firing')).length}
                  onCriticalClick={() => {
                    if (!alertsTabSeverityFilter.includes('Critical')) {
                      setAlertsTabSeverityFilter([...alertsTabSeverityFilter, 'Critical']);
                    }
                  }}
                  onWarningClick={() => {
                    if (!alertsTabSeverityFilter.includes('Warning')) {
                      setAlertsTabSeverityFilter([...alertsTabSeverityFilter, 'Warning']);
                    }
                  }}
                  onInfoClick={() => {
                    if (!alertsTabSeverityFilter.includes('Info')) {
                      setAlertsTabSeverityFilter([...alertsTabSeverityFilter, 'Info']);
                    }
                  }}
                  clusters={firingAlertsCardView === 'single-cluster' && selectedClusterForAlerts 
                    ? [selectedClusterForAlerts] 
                    : filteredClustersForAlerts}
                  alertNameFilter={mainAlertNameFilter}
                  componentFilter={mainComponentFilter}
                  groupFilter={alertsTabGroupFilter}
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
                  triggeredFromDate={alertsTabTriggeredFromDate}
                  triggeredFromTime={alertsTabTriggeredFromTime}
                  triggeredToDate={alertsTabTriggeredToDate}
                  onClusterFilterChange={setAlertsTabClusterFilter}
                  onNamespaceFilterChange={setAlertsTabNamespaceFilter}
                  triggeredToTime={alertsTabTriggeredToTime}
                  filterToolbar={
                    <>
                      <Toolbar className="pf-m-align-items-center" style={{ backgroundColor: 'transparent', paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0 }}>
                        <ToolbarContent className="pf-m-align-items-center">
                          <ToolbarItem>
                            <Button 
                              variant={alertsTabIsFilterPanelOpen ? 'secondary' : 'control'} 
                              icon={<FilterIcon />}
                              onClick={() => setAlertsTabIsFilterPanelOpen(!alertsTabIsFilterPanelOpen)}
                            >
                              Filters {hasAlertsTabActiveFilters && <Badge isRead style={{ marginLeft: '4px' }}>{
                                alertsTabRegionFilter.length + 
                                alertsTabClusterFilter.length + 
                                alertsTabSeverityFilter.length + 
                                (hasAlertsTabGroupFilterChanges ? alertsTabGroupFilter.length : 0) + 
                                alertsTabComponentFilter.length
                              }</Badge>}
                            </Button>
                          </ToolbarItem>
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
                                  {selectedSavedFilter ? selectedSavedFilter.name : 'My saved filters'}
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
                                        setAlertsTabSeverityFilter(filter.filters.severity as AlertSeverity[]);
                                        setAlertsTabGroupFilter(filter.filters.group as AlertGroup[]);
                                        setAlertsTabComponentFilter(filter.filters.component as AlertComponent[]);
                                        setAlertsTabRegionFilter(filter.filters.region || []);
                                        setAlertsTabClusterFilter(filter.filters.cluster || []);
                                        setAlertsTabNamespaceFilter(filter.filters.namespace || []);
                                        setAlertsTabLabelFilter(filter.filters.label || []);
                                        setAlertsTabSearchValue(filter.filters.searchValue || '');
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
                          <ToolbarItem style={{ flex: 1 }}>
                            <SearchInput
                              placeholder="Search alert name"
                              value={alertsTabSearchValue}
                              onChange={(_, value) => setAlertsTabSearchValue(value)}
                              onClear={() => setAlertsTabSearchValue('')}
                              style={{ width: '100%' }}
                            />
                          </ToolbarItem>
                          <ToolbarItem align={{ default: 'alignEnd' }}>
                            <Popover
                              isVisible={alertsTabIsCustomTimeRangePopoverOpen}
                              shouldClose={() => setAlertsTabIsCustomTimeRangePopoverOpen(false)}
                              headerContent="Custom time range"
                              minWidth="360px"
                              maxWidth="360px"
                              bodyContent={
                                <Stack hasGutter>
                                  <StackItem>
                                    <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', marginBottom: '4px', display: 'block' }}>From</Content>
                                    <Flex gap={{ default: 'gapXs' }} flexWrap={{ default: 'nowrap' }}>
                                      <FlexItem>
                                        <DatePicker value={alertsTabTriggeredFromDate || ''} onChange={(_, str) => setAlertsTabTriggeredFromDate(str)} placeholder="YYYY-MM-DD" style={{ width: '170px' }} />
                                      </FlexItem>
                                      <FlexItem>
                                        <TimePicker time={alertsTabTriggeredFromTime || ''} onChange={(_, time) => setAlertsTabTriggeredFromTime(time)} placeholder="HH:MM" aria-label="From time" is24Hour style={{ width: '100px' }} menuAppendTo={() => document.body} />
                                      </FlexItem>
                                    </Flex>
                                  </StackItem>
                                  <StackItem>
                                    <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', marginBottom: '4px', display: 'block' }}>To</Content>
                                    <Flex gap={{ default: 'gapXs' }} flexWrap={{ default: 'nowrap' }}>
                                      <FlexItem>
                                        <DatePicker value={alertsTabTriggeredToDate || ''} onChange={(_, str) => setAlertsTabTriggeredToDate(str)} placeholder="YYYY-MM-DD" style={{ width: '170px' }} />
                                      </FlexItem>
                                      <FlexItem>
                                        <TimePicker time={alertsTabTriggeredToTime || ''} onChange={(_, time) => setAlertsTabTriggeredToTime(time)} placeholder="HH:MM" aria-label="To time" is24Hour style={{ width: '100px' }} menuAppendTo={() => document.body} />
                                      </FlexItem>
                                    </Flex>
                                  </StackItem>
                                  <StackItem>
                                    <Button variant="primary" onClick={() => setAlertsTabIsCustomTimeRangePopoverOpen(false)} style={{ width: '100%' }}>Apply</Button>
                                  </StackItem>
                                </Stack>
                              }
                              position="bottom-end"
                            >
                              <Dropdown
                                isOpen={alertsTabIsQuickTimeRangeOpen}
                                onOpenChange={setAlertsTabIsQuickTimeRangeOpen}
                                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                  <MenuToggle ref={toggleRef} variant="plainText" onClick={() => setAlertsTabIsQuickTimeRangeOpen(!alertsTabIsQuickTimeRangeOpen)} isExpanded={alertsTabIsQuickTimeRangeOpen} icon={<ClockIcon />} style={{ minWidth: '140px', padding: '4px 8px' }}>
                                    {quickTimeRangeOptions.find(o => o.value === alertsTabQuickTimeRange)?.label}
                                  </MenuToggle>
                                )}
                              >
                                <DropdownList>
                                  {quickTimeRangeOptions.map(opt => (
                                    <DropdownItem key={opt.value} onClick={() => {
                                      if (opt.value === 'custom') {
                                        setAlertsTabQuickTimeRange('custom');
                                        setAlertsTabIsQuickTimeRangeOpen(false);
                                        setAlertsTabIsCustomTimeRangePopoverOpen(true);
                                      } else {
                                        setAlertsTabQuickTimeRange(opt.value);
                                        setAlertsTabIsQuickTimeRangeOpen(false);
                                      }
                                    }}>
                                      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ width: '100%' }}>
                                        <FlexItem>{opt.label}</FlexItem>
                                        {alertsTabQuickTimeRange === opt.value && (
                                          <FlexItem><CheckIcon style={{ color: 'var(--pf-t--global--icon--color--brand--default)' }} /></FlexItem>
                                        )}
                                      </Flex>
                                    </DropdownItem>
                                  ))}
                                </DropdownList>
                              </Dropdown>
                            </Popover>
                          </ToolbarItem>
                        </ToolbarContent>
                      </Toolbar>
                      {(alertsTabSeverityFilter.length > 0 || hasAlertsTabGroupFilterChanges || alertsTabComponentFilter.length > 0 || alertsTabRegionFilter.length > 0 || alertsTabClusterFilter.length > 0 || alertsTabNamespaceFilter.length > 0 || alertsTabLabelFilter.length > 0 || mainComponentFilter !== null || mainAlertNameFilter !== null) && (
                        <div style={{ marginTop: '8px' }}>
                          <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                            <FlexItem>
                              <Flex gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsCenter' }}>
                                {hasAlertsTabGroupFilterChanges && (
                                  <LabelGroup categoryName="Alert scope">
                                    {alertsTabGroupFilter.map(g => (
                                      <Label key={g} variant="outline" onClose={() => {
                                        if (g === 'Cluster') { setAlertsTabGroupFilter(['Namespace']); } else { setAlertsTabGroupFilter(['Cluster']); }
                                      }}>{g}</Label>
                                    ))}
                                  </LabelGroup>
                                )}
                                {alertsTabSeverityFilter.length > 0 && (
                                  <LabelGroup categoryName="Severity">
                                    {alertsTabSeverityFilter.map(s => (
                                      <Label key={s} color={getSeverityLabelColor(s)} onClose={() => setAlertsTabSeverityFilter(alertsTabSeverityFilter.filter(x => x !== s))}>{s}</Label>
                                    ))}
                                  </LabelGroup>
                                )}
                                {alertsTabComponentFilter.length > 0 && (
                                  <LabelGroup categoryName="Affected component">
                                    {alertsTabComponentFilter.map(c => (
                                      <Label key={c} variant="outline" onClose={() => setAlertsTabComponentFilter(alertsTabComponentFilter.filter(x => x !== c))}>{c}</Label>
                                    ))}
                                  </LabelGroup>
                                )}
                                {alertsTabRegionFilter.length > 0 && (
                                  <LabelGroup categoryName="Region">
                                    {alertsTabRegionFilter.map(r => (
                                      <Label key={r} variant="outline" onClose={() => setAlertsTabRegionFilter(alertsTabRegionFilter.filter(x => x !== r))}>{r}</Label>
                                    ))}
                                  </LabelGroup>
                                )}
                                {alertsTabClusterFilter.length > 0 && (
                                  <LabelGroup categoryName="Cluster">
                                    {alertsTabClusterFilter.map(c => (
                                      <Label key={c} variant="outline" onClose={() => setAlertsTabClusterFilter(alertsTabClusterFilter.filter(x => x !== c))}>{c}</Label>
                                    ))}
                                  </LabelGroup>
                                )}
                                {alertsTabNamespaceFilter.length > 0 && (
                                  <LabelGroup categoryName="Namespace">
                                    {alertsTabNamespaceFilter.map(n => (
                                      <Label key={n} variant="outline" onClose={() => setAlertsTabNamespaceFilter(alertsTabNamespaceFilter.filter(x => x !== n))}>{n}</Label>
                                    ))}
                                  </LabelGroup>
                                )}
                                {alertsTabLabelFilter.length > 0 && (
                                  <LabelGroup categoryName="Label">
                                    {alertsTabLabelFilter.map(l => (
                                      <Label key={l} variant="outline" onClose={() => setAlertsTabLabelFilter(alertsTabLabelFilter.filter(x => x !== l))}>{l}</Label>
                                    ))}
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
                            <FlexItem>
                              <Flex gap={{ default: 'gapSm' }}>
                                <FlexItem>
                                  <Button variant="link" onClick={() => { clearAlertsTabFilters(); setSelectedSavedFilter(null); }}>Clear filters</Button>
                                </FlexItem>
                                <FlexItem>
                                  <Button variant="link" onClick={() => setAlertsTabIsFilterPanelOpen(true)}>Edit filters</Button>
                                </FlexItem>
                                <FlexItem>
                                  <Button variant="link" onClick={() => { setNewFilterName(''); setIsSaveFilterModalOpen(true); }}>Add to saved filters</Button>
                                </FlexItem>
                              </Flex>
                            </FlexItem>
                          </Flex>
                        </div>
                      )}
                    </>
                  }
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
            <DrillDownContent
              selectedCluster={selectedCluster}
              isDrawerExpanded={isDrawerExpanded}
              setIsDrawerExpanded={setIsDrawerExpanded}
              selectedAlertDetail={selectedAlertDetail}
              setSelectedAlertDetail={setSelectedAlertDetail}
              setAlertDetailDrawerTab={setAlertDetailDrawerTab}
              drillDownFilterOpen={drillDownFilterOpen}
              setDrillDownFilterOpen={setDrillDownFilterOpen}
              drillDownSeverityFilter={drillDownSeverityFilter}
              setDrillDownSeverityFilter={setDrillDownSeverityFilter}
              drillDownGroupFilter={drillDownGroupFilter}
              setDrillDownGroupFilter={setDrillDownGroupFilter}
              drillDownComponentFilter={drillDownComponentFilter}
              setDrillDownComponentFilter={setDrillDownComponentFilter}
              isDrillDownComponentOpen={isDrillDownComponentOpen}
              setIsDrillDownComponentOpen={setIsDrillDownComponentOpen}
              drillDownStateFilter={drillDownStateFilter}
              setDrillDownStateFilter={setDrillDownStateFilter}
              drillDownSourceFilter={drillDownSourceFilter}
              setDrillDownSourceFilter={setDrillDownSourceFilter}
              drillDownTriggeredFrom={drillDownTriggeredFrom}
              setDrillDownTriggeredFrom={setDrillDownTriggeredFrom}
              drillDownTriggeredTo={drillDownTriggeredTo}
              setDrillDownTriggeredTo={setDrillDownTriggeredTo}
              drillDownSearchValue={drillDownSearchValue}
              setDrillDownSearchValue={setDrillDownSearchValue}
              hasDrillDownActiveFilters={hasDrillDownActiveFilters}
              clearDrillDownFilters={clearDrillDownFilters}
              drillDownSavedFilters={drillDownSavedFilters}
              setDrillDownSavedFilters={setDrillDownSavedFilters}
              selectedDrillDownSavedFilter={selectedDrillDownSavedFilter}
              setSelectedDrillDownSavedFilter={setSelectedDrillDownSavedFilter}
              isDrillDownSavedFiltersDropdownOpen={isDrillDownSavedFiltersDropdownOpen}
              setIsDrillDownSavedFiltersDropdownOpen={setIsDrillDownSavedFiltersDropdownOpen}
              isDrillDownSaveFilterModalOpen={isDrillDownSaveFilterModalOpen}
              setIsDrillDownSaveFilterModalOpen={setIsDrillDownSaveFilterModalOpen}
              drillDownNewFilterName={drillDownNewFilterName}
              setDrillDownNewFilterName={setDrillDownNewFilterName}
              isDrillDownManageSavedFiltersModalOpen={isDrillDownManageSavedFiltersModalOpen}
              setIsDrillDownManageSavedFiltersModalOpen={setIsDrillDownManageSavedFiltersModalOpen}
              drillDownEditingFilterId={drillDownEditingFilterId}
              setDrillDownEditingFilterId={setDrillDownEditingFilterId}
              drillDownEditingFilterName={drillDownEditingFilterName}
              setDrillDownEditingFilterName={setDrillDownEditingFilterName}
              drillDownFilteredAlerts={drillDownFilteredAlerts}
              aggregatedAlerts={aggregatedAlerts}
              isAggregated={isAggregated}
              setIsAggregated={setIsAggregated}
              drillDownPage={drillDownPage}
              setDrillDownPage={setDrillDownPage}
              drillDownPerPage={drillDownPerPage}
              setDrillDownPerPage={setDrillDownPerPage}
              drillDownSortConfigs={drillDownSortConfigs}
              handleDrillDownSort={handleDrillDownSort}
              expandedAlertRows={expandedAlertRows}
              setExpandedAlertRows={setExpandedAlertRows}
              columns={columns}
              defaultColumns={defaultColumns}
              tempColumns={tempColumns}
              setTempColumns={setTempColumns}
              setColumns={setColumns}
              isManageColumnsModalOpen={isManageColumnsModalOpen}
              setIsManageColumnsModalOpen={setIsManageColumnsModalOpen}
              openManageColumnsModal={openManageColumnsModal}
              handleTempColumnToggle={handleTempColumnToggle}
              handleSelectAllColumns={handleSelectAllColumns}
              handleDeselectAllColumns={handleDeselectAllColumns}
              handleRestoreDefaultColumns={handleRestoreDefaultColumns}
              handleSaveColumns={handleSaveColumns}
              addToast={addToast}
            />
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
        <ManagementTab
          managementSubTab={managementSubTab}
          isAlertRulesFilterPanelOpen={isAlertRulesFilterPanelOpen}
          setIsAlertRulesFilterPanelOpen={setIsAlertRulesFilterPanelOpen}
          alertRulesClusterFilter={alertRulesClusterFilter}
          setAlertRulesClusterFilter={setAlertRulesClusterFilter}
          alertRulesNamespaceFilter={alertRulesNamespaceFilter}
          setAlertRulesNamespaceFilter={setAlertRulesNamespaceFilter}
          alertRulesGroupFilter={alertRulesGroupFilter}
          setAlertRulesGroupFilter={setAlertRulesGroupFilter}
          alertRulesComponentFilter={alertRulesComponentFilter}
          setAlertRulesComponentFilter={setAlertRulesComponentFilter}
          alertRulesSeverityFilter={alertRulesSeverityFilter}
          setAlertRulesSeverityFilter={setAlertRulesSeverityFilter}
          alertRulesStateFilter={alertRulesStateFilter}
          setAlertRulesStateFilter={setAlertRulesStateFilter}
          alertRulesSourceFilter={alertRulesSourceFilter}
          setAlertRulesSourceFilter={setAlertRulesSourceFilter}
          alertRulesSearchValue={alertRulesSearchValue}
          setAlertRulesSearchValue={setAlertRulesSearchValue}
          isAlertRulesComponentDropdownOpen={isAlertRulesComponentDropdownOpen}
          setIsAlertRulesComponentDropdownOpen={setIsAlertRulesComponentDropdownOpen}
          selectedAlertRuleIds={selectedAlertRuleIds}
          setSelectedAlertRuleIds={setSelectedAlertRuleIds}
          mockAlertRules={mockAlertRules}
          isBulkActionsMenuOpen={isBulkActionsMenuOpen}
          setIsBulkActionsMenuOpen={setIsBulkActionsMenuOpen}
          setAlertRulesToDisable={setAlertRulesToDisable}
          setIsDisableAlertRuleModalOpen={setIsDisableAlertRuleModalOpen}
          setSelectedAlertRule={setSelectedAlertRule}
          setIsAlertRuleDrawerOpen={setIsAlertRuleDrawerOpen}
          setAlertRuleDrawerTab={setAlertRuleDrawerTab}
          alertRuleActionMenuOpen={alertRuleActionMenuOpen}
          setAlertRuleActionMenuOpen={setAlertRuleActionMenuOpen}
        />
      )}

      {/* Save Filter Modal */}
      <Modal
        variant="medium"
        isOpen={isSaveFilterModalOpen}
        onClose={() => {
          setIsSaveFilterModalOpen(false);
          setSaveGroupingSorting(true);
          setSaveSearchInput(true);
        }}
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
                    <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }} flexWrap={{ default: 'wrap' }}>
                      <FlexItem>
                        <Checkbox 
                          id="save-selected-filters" 
                          label="Selected filters" 
                          isChecked={true}
                          isDisabled
                        />
                      </FlexItem>
                      {/* Show active filter counts as compact labels with tooltips */}
                      {(() => {
                        const sf = mainPageTab === 'alerts' ? alertsTabSeverityFilter : severityFilter;
                        const gf = mainPageTab === 'alerts' ? alertsTabGroupFilter : groupFilter;
                        const cf = mainPageTab === 'alerts' ? alertsTabComponentFilter : componentFilter;
                        const rf = mainPageTab === 'alerts' ? alertsTabRegionFilter : regionFilter;
                        const clf = mainPageTab === 'alerts' ? alertsTabClusterFilter : clusterFilter;
                        const nf = mainPageTab === 'alerts' ? alertsTabNamespaceFilter : namespaceFilter;
                        const lf = mainPageTab === 'alerts' ? alertsTabLabelFilter : labelFilter;
                        return (
                          <>
                            {sf.length > 0 && (
                              <FlexItem>
                                <Tooltip content={`Severity: ${sf.join(', ')}`}>
                                  <Label isCompact color="grey">{sf.length} severity</Label>
                                </Tooltip>
                              </FlexItem>
                            )}
                            {gf.length > 0 && (
                              <FlexItem>
                                <Tooltip content={`Group: ${gf.join(', ')}`}>
                                  <Label isCompact color="grey">{gf.length} group</Label>
                                </Tooltip>
                              </FlexItem>
                            )}
                            {cf.length > 0 && (
                              <FlexItem>
                                <Tooltip content={`Component: ${cf.join(', ')}`}>
                                  <Label isCompact color="grey">{cf.length} component</Label>
                                </Tooltip>
                              </FlexItem>
                            )}
                            {rf.length > 0 && (
                              <FlexItem>
                                <Tooltip content={`Region: ${rf.join(', ')}`}>
                                  <Label isCompact color="grey">{rf.length} region</Label>
                                </Tooltip>
                              </FlexItem>
                            )}
                            {clf.length > 0 && (
                              <FlexItem>
                                <Tooltip content={`Cluster: ${clf.join(', ')}`}>
                                  <Label isCompact color="grey">{clf.length} cluster</Label>
                                </Tooltip>
                              </FlexItem>
                            )}
                            {nf.length > 0 && (
                              <FlexItem>
                                <Tooltip content={`Namespace: ${nf.join(', ')}`}>
                                  <Label isCompact color="grey">{nf.length} namespace</Label>
                                </Tooltip>
                              </FlexItem>
                            )}
                            {lf.length > 0 && (
                              <FlexItem>
                                <Tooltip content={`Label: ${lf.join(', ')}`}>
                                  <Label isCompact color="grey">{lf.length} label</Label>
                                </Tooltip>
                              </FlexItem>
                            )}
                          </>
                        );
                      })()}
                    </Flex>
                  </StackItem>
                  <StackItem>
                    <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }} flexWrap={{ default: 'wrap' }}>
                      <FlexItem>
                        <Checkbox 
                          id="save-search-input" 
                          label="Input in search field" 
                          isChecked={saveSearchInput && !!(mainPageTab === 'alerts' ? alertsTabSearchValue : searchValue)}
                          isDisabled={!(mainPageTab === 'alerts' ? alertsTabSearchValue : searchValue)}
                          onChange={(_, checked) => setSaveSearchInput(checked)}
                        />
                      </FlexItem>
                      {(mainPageTab === 'alerts' ? alertsTabSearchValue : searchValue) && (
                        <FlexItem>
                          <Tooltip content={`Search value: "${mainPageTab === 'alerts' ? alertsTabSearchValue : searchValue}"`}>
                            <Label isCompact color="grey">{mainPageTab === 'alerts' ? alertsTabSearchValue : searchValue}</Label>
                          </Tooltip>
                        </FlexItem>
                      )}
                    </Flex>
                  </StackItem>
                  <StackItem>
                    <Stack hasGutter>
                      <StackItem>
                        <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }} flexWrap={{ default: 'wrap' }}>
                          <FlexItem>
                            <Checkbox 
                              id="save-grouping-sorting" 
                              label="Include layout settings" 
                              isChecked={saveGroupingSorting}
                              onChange={(_, checked) => setSaveGroupingSorting(checked)}
                            />
                          </FlexItem>
                          {/* Show current layout settings - context-dependent */}
                          {mainPageTab === 'fleet-overview' ? (
                            <>
                              <FlexItem>
                                <Tooltip content={`Current group by setting: ${groupBy === 'none' ? 'None' : groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}`}>
                                  <Label isCompact color="grey">Group by: {groupBy === 'none' ? 'None' : groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}</Label>
                                </Tooltip>
                              </FlexItem>
                              <FlexItem>
                                <Tooltip content={`Current size by setting: ${
                                  importanceSizing === 'none' ? 'None (Equal size)' : 
                                  sizeByOptions.find(opt => opt.value === importanceSizing)?.label || 'Custom'
                                }`}>
                                  <Label isCompact color="grey">Size by: {
                                    importanceSizing === 'none' ? 'None (Equal size)' : 
                                    sizeByOptions.find(opt => opt.value === importanceSizing)?.label || 'Custom'
                                  }</Label>
                                </Tooltip>
                              </FlexItem>
                              <FlexItem>
                                <Tooltip content={`Current sort by setting: ${sortBy === 'severity' ? 'Severity' : sortBy === 'alertCount' ? 'Alert count' : 'Cluster name'}`}>
                                  <Label isCompact color="grey">Sort by: {sortBy === 'severity' ? 'Severity' : sortBy === 'alertCount' ? 'Alert count' : 'Cluster name'}</Label>
                                </Tooltip>
                              </FlexItem>
                            </>
                          ) : (
                            <>
                              <FlexItem>
                                <Tooltip content={`Current group by setting: ${alertsGroupBy === 'none' ? 'None' : alertsGroupBy === 'alertName' ? 'Alert name' : alertsGroupBy === 'impact' ? 'Alert scope' : alertsGroupBy.charAt(0).toUpperCase() + alertsGroupBy.slice(1)}`}>
                                  <Label isCompact color="grey">Group by: {alertsGroupBy === 'none' ? 'None' : alertsGroupBy === 'alertName' ? 'Alert name' : alertsGroupBy === 'impact' ? 'Alert scope' : alertsGroupBy.charAt(0).toUpperCase() + alertsGroupBy.slice(1)}</Label>
                                </Tooltip>
                              </FlexItem>
                              <FlexItem>
                                <Label isCompact color="grey">Aggregate by name: On</Label>
                              </FlexItem>
                            </>
                          )}
                        </Flex>
                      </StackItem>
                      <StackItem>
                        <Content component="small" className="pf-v6-u-color-200">
                          Note: Some saved items apply only to specific views.
                        </Content>
                      </StackItem>
                    </Stack>
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
                const isAlerts = mainPageTab === 'alerts';
                const newFilter: SavedFilter = {
                  id: `sf-${Date.now()}`,
                  name: newFilterName.trim(),
                  filters: { 
                    severity: isAlerts ? alertsTabSeverityFilter : severityFilter, 
                    group: isAlerts ? alertsTabGroupFilter : groupFilter, 
                    component: isAlerts ? alertsTabComponentFilter : componentFilter, 
                    source: [], 
                    searchValue: saveSearchInput ? (isAlerts ? alertsTabSearchValue : searchValue) : '',
                    region: isAlerts ? alertsTabRegionFilter : regionFilter,
                    cluster: isAlerts ? alertsTabClusterFilter : clusterFilter,
                    namespace: isAlerts ? alertsTabNamespaceFilter : namespaceFilter,
                    label: isAlerts ? alertsTabLabelFilter : labelFilter,
                  },
                  ...(saveGroupingSorting && {
                    viewSettings: {
                      groupBy,
                      sortBy,
                      importanceSizing,
                    }
                  }),
                };
                setSavedFilters([...savedFilters, newFilter]);
                setSelectedSavedFilter(newFilter);
                setIsSaveFilterModalOpen(false);
                setNewFilterName('');
                setSaveGroupingSorting(true);
                setSaveSearchInput(true);
                addToast('Filter saved successfully', 'success');
              }
            }}
            isDisabled={!newFilterName.trim()}
          >
            Save filter
          </Button>
          <Button variant="link" onClick={() => {
            setIsSaveFilterModalOpen(false);
            setNewFilterName('');
            setSaveGroupingSorting(true);
            setSaveSearchInput(true);
          }}>
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

      <AlertDetailDrawer
        isExpanded={isDrawerExpanded}
        selectedAlert={selectedAlertDetail}
        activeTab={alertDetailDrawerTab}
        onClose={() => {
          setIsDrawerExpanded(false);
          setSelectedAlertDetail(null);
        }}
        onTabChange={setAlertDetailDrawerTab}
      />

      {/* Alert Rule Details Drawer */}
      <AlertRuleDrawer
        isOpen={isAlertRuleDrawerOpen}
        selectedAlertRule={selectedAlertRule}
        onClose={() => {
          setIsAlertRuleDrawerOpen(false);
          setSelectedAlertRule(null);
        }}
        activeTab={alertRuleDrawerTab}
        onTabChange={setAlertRuleDrawerTab}
        expandedClusters={alertRuleExpandedClusters}
        onExpandedClustersChange={setAlertRuleExpandedClusters}
        expandedAlerts={alertRuleExpandedAlerts}
        onExpandedAlertsChange={setAlertRuleExpandedAlerts}
        targetClusterFilter={alertRuleTargetClusterFilter}
        onTargetClusterFilterChange={setAlertRuleTargetClusterFilter}
        isTargetClusterFilterOpen={isAlertRuleTargetClusterFilterOpen}
        onTargetClusterFilterOpenChange={setIsAlertRuleTargetClusterFilterOpen}
        timelineRange={alertRuleTimelineRange}
        onTimelineRangeChange={setAlertRuleTimelineRange}
        isTimelineRangeOpen={isAlertRuleTimelineRangeOpen}
        onTimelineRangeOpenChange={setIsAlertRuleTimelineRangeOpen}
      />

      <SettingsModals
        isDisableAlertRuleModalOpen={isDisableAlertRuleModalOpen}
        setIsDisableAlertRuleModalOpen={setIsDisableAlertRuleModalOpen}
        alertRulesToDisable={alertRulesToDisable}
        setAlertRulesToDisable={setAlertRulesToDisable}
        disableAlertRuleExpandedIds={disableAlertRuleExpandedIds}
        setDisableAlertRuleExpandedIds={setDisableAlertRuleExpandedIds}
        setSelectedAlertRuleIds={setSelectedAlertRuleIds}
        addToast={addToast}
        isEnvironmentSettingsOpen={isEnvironmentSettingsOpen}
        setIsEnvironmentSettingsOpen={setIsEnvironmentSettingsOpen}
        tempEnvironmentCategories={tempEnvironmentCategories}
        setTempEnvironmentCategories={setTempEnvironmentCategories}
        newPatternInputs={newPatternInputs}
        setNewPatternInputs={setNewPatternInputs}
        availableLabelKeys={availableLabelKeys}
        setEnvironmentCategories={setEnvironmentCategories}
        isTeamSettingsOpen={isTeamSettingsOpen}
        setIsTeamSettingsOpen={setIsTeamSettingsOpen}
        tempTeamCategories={tempTeamCategories}
        setTempTeamCategories={setTempTeamCategories}
        newTeamPatternInputs={newTeamPatternInputs}
        setNewTeamPatternInputs={setNewTeamPatternInputs}
        setTeamCategories={setTeamCategories}
      />
    </div>
  );
};

export { MultiClusterAlertingDashboard };

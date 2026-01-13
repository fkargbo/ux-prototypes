import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Title,
  Content,
  Card,
  CardBody,
  CardTitle,
  Radio,
  Grid,
  GridItem,
  Checkbox,
  Stack,
  StackItem,
  Divider,
  Alert,
  AlertVariant,
  AlertActionCloseButton,
  Flex,
  FlexItem,
  Switch,
  Badge,
} from '@patternfly/react-core';
import {
  UserIcon,
  ChartLineIcon,
  CodeIcon,
} from '@patternfly/react-icons';

export interface Persona {
  id: string;
  name: string;
  icon: React.ReactNode;
  focus: string;
  description: string;
}

export interface Capability {
  id: string;
  name: string;
  description: string;
  required?: boolean;
  dependencies?: string[];
  nestedOptions?: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

export interface WizardData {
  // Step 1 data
  installationNamespace?: string;
  selectedProject?: string;
  installationMode?: string;
  updateChannel?: string;
  version?: string;
  updateApproval?: string;
  enableClusterMonitoring?: boolean;
  // Step 2 data
  selectedPersona: string | null; // Deprecated, kept for backward compatibility
  activeGoals: string[]; // New: array of selected goal IDs
  selectedCapabilities: string[];
  selectedNestedOptions: { [capabilityId: string]: string[] };
  advancedMode: boolean;
  selectedUIPlugins: string[];
}

interface Step2ObservabilityComponentsProps {
  data: WizardData;
  onDataChange: (data: Partial<WizardData>) => void;
}

// Goals (replaces personas with checkbox selection)
export interface Goal {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

type GoalID = 'platform-governance' | 'incident-response' | 'app-performance';

const goals: Goal[] = [
  {
    id: 'platform-governance',
    name: 'Platform Governance',
    icon: <UserIcon />,
    description: 'Monitor infrastructure health, audit logs, enforce network policies, and manage long-term capacity planning.',
  },
  {
    id: 'incident-response',
    name: 'Incident Response',
    icon: <ChartLineIcon />,
    description: 'Maximize uptime and reduce MTTR using full-stack debugging, distributed tracing, and automated signal correlation.',
  },
  {
    id: 'app-performance',
    name: 'App Performance',
    icon: <CodeIcon />,
    description: 'Isolate code errors, trace transactions across microservices, and optimize application latency within namespaces.',
  },
];

// Dependency map: Each goal requires specific operators and storage
interface GoalDependencies {
  operators: string[]; // Operator IDs (capability IDs)
  storage: string[]; // Storage IDs: 'odf' or 'lvm'
}

const NEED_DEPENDENCIES: Record<GoalID, GoalDependencies> = {
  'platform-governance': {
    operators: ['metrics-alerting', 'thanos', 'loki'],
    storage: ['odf'], // Platform governance requires ODF
  },
  'incident-response': {
    operators: ['metrics-alerting', 'thanos', 'loki', 'tempo', 'korrel8r', 'incident-detection'],
    storage: ['odf'], // Incident response requires ODF
  },
  'app-performance': {
    operators: ['metrics-alerting', 'loki', 'tempo'],
    storage: ['lvm'], // App performance can use LVM
  },
};

// Legacy personas (kept for backward compatibility during migration)
const personas: Persona[] = [
  {
    id: 'administrator',
    name: 'Platform governance & stability',
    icon: <UserIcon />,
    focus: 'Governance & Compliance',
    description: 'Monitor infrastructure health, audit logs, enforce network policies, and manage long-term capacity planning.',
  },
  {
    id: 'sre',
    name: 'Incident response & reliability',
    icon: <ChartLineIcon />,
    focus: 'Reliability & MTTR',
    description: 'Maximize uptime and reduce MTTR using full-stack debugging, distributed tracing, and automated signal correlation.',
  },
  {
    id: 'developer',
    name: 'App performance & debugging',
    icon: <CodeIcon />,
    focus: 'App Debugging & Tracing',
    description: 'Isolate code errors, trace transactions across microservices, and optimize application latency within namespaces.',
  },
];

const capabilities: Capability[] = [
  {
    id: 'metrics-alerting',
    name: 'Core Observability (Prometheus)',
    description: 'The engine for metrics collection, alerting rules, and base dashboards.',
    required: true,
  },
  {
    id: 'thanos',
    name: 'Long-term Storage (Thanos)',
    description: 'Retain metrics for capacity planning and historical analysis.',
  },
  {
    id: 'loki',
    name: 'Centralized Logging (Loki)',
    description: 'Aggregate and search logs across the cluster.',
    nestedOptions: [
      {
        id: 'infrastructure-logs',
        name: 'Infrastructure logs',
        description: 'Node, API server, and control plane logs.',
      },
      {
        id: 'application-logs',
        name: 'Application logs',
        description: 'Container stdout/stderr from workloads.',
      },
    ],
  },
  {
    id: 'incident-detection',
    name: 'Incident Detection (Native)',
    description: 'Automatically groups related alerts into incidents to reduce alert fatigue and highlight root causes.',
  },
  {
    id: 'tempo',
    name: 'Distributed Tracing (Tempo)',
    description: 'Track requests across microservices for latency analysis.',
  },
  {
    id: 'opentelemetry',
    name: 'Telemetry Pipeline (OpenTelemetry)',
    description: 'Handles telemetry collection and auto-instrumentation.',
    nestedOptions: [
      {
        id: 'auto-instrumentation',
        name: 'Enable Auto-Instrumentation',
        description: '',
      },
    ],
  },
  {
    id: 'network-traffic',
    name: 'Network Traffic Analysis (NetObserve)',
    description: 'Visualize pod-to-pod traffic and debug connection issues.',
    dependencies: ['loki', 'metrics-alerting'],
  },
  {
    id: 'korrel8r',
    name: 'Signal Correlation (Korrel8r)',
    description: 'Automated root cause analysis linking logs, metrics, and traces.',
  },
];

interface UIPlugin {
  id: string;
  name: string;
  description: string;
  defaultEnabled: boolean;
  dependencies?: string[];
}

const uiPlugins: UIPlugin[] = [
  {
    id: 'monitoring-ui',
    name: 'Monitoring UI Plugin (Metrics)',
    description: 'Adds the Metrics, Alerting, and Incidents pages to the Observe menu.',
    defaultEnabled: true,
    dependencies: ['metrics-alerting'],
  },
  {
    id: 'logging-ui',
    name: 'Logging UI Plugin (Logs)',
    description: 'Log exploration.',
    defaultEnabled: false,
    dependencies: ['loki'],
  },
  {
    id: 'tracing-ui',
    name: 'Tracing UI Plugin (Traces)',
    description: 'Distributed traces.',
    defaultEnabled: false,
    dependencies: ['tempo'],
  },
  {
    id: 'troubleshooting-panel',
    name: 'Troubleshooting Panel UI (Signal correlation)',
    description: 'Signal correlation.',
    defaultEnabled: false,
    dependencies: ['korrel8r'],
  },
  {
    id: 'perses',
    name: 'Custom dashboards UI (Perses)',
    description: 'Enables the Perses dashboard engine for creating and visualizing custom metrics and dashboards directly in the Console.',
    defaultEnabled: false,
    dependencies: ['metrics-alerting'],
  },
  {
    id: 'incident-detection-ui',
    name: 'Incident Detection UI Plugin (Alerts)',
    description: 'Incident detection and alerting.',
    defaultEnabled: false,
    dependencies: ['loki'],
  },
  {
    id: 'network-ui',
    name: 'Network UI Plugin (Flows)',
    description: 'Network traffic visualization.',
    defaultEnabled: false,
    dependencies: ['network-traffic'],
  },
];

// Operator/Storage item with dependency tracking
interface OperatorStorageItem {
  id: string;
  name: string;
  description?: string;
  isSelected: boolean;
  isLocked: boolean; // Core Observability is always locked
  appliedBy: GoalID[]; // Which goals require this item
}

export const Step2ObservabilityComponents: React.FC<Step2ObservabilityComponentsProps> = ({
  data,
  onDataChange,
}) => {
  // Goals-based state (new system)
  const [activeGoals, setActiveGoals] = useState<string[]>(data.activeGoals || []);
  
  // Legacy persona state (for backward compatibility)
  const [selectedPersona, setSelectedPersona] = useState<string | null>(data.selectedPersona);
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>(data.selectedCapabilities);
  const [selectedNestedOptions, setSelectedNestedOptions] = useState<{ [key: string]: string[] }>(
    data.selectedNestedOptions || {}
  );
  const [advancedMode, setAdvancedMode] = useState(data.advancedMode || false);
  const [selectedUIPlugins, setSelectedUIPlugins] = useState<string[]>(
    data.selectedUIPlugins || ['monitoring-ui']
  );
  const [isPreselectionAlertDismissed, setIsPreselectionAlertDismissed] = useState(false);
  
  // Track manually unchecked items that were required by goals
  const [uncheckedRequiredItems, setUncheckedRequiredItems] = useState<Set<string>>(new Set());

  // Initialize operators and storage items from capabilities
  const initialOperators: OperatorStorageItem[] = useMemo(() => {
    return capabilities.map(cap => ({
      id: cap.id,
      name: cap.name,
      description: cap.description,
      isSelected: cap.required || false, // Core Observability (metrics-alerting) is required
      isLocked: cap.required || false, // Core Observability is locked
      appliedBy: [],
    }));
  }, []);

  // Initialize storage items
  const initialStorage: OperatorStorageItem[] = useMemo(() => [
    {
      id: 'odf',
      name: 'OpenShift Data Foundation (ODF)',
      description: 'Enterprise-grade storage for demanding observability requirements.',
      isSelected: false,
      isLocked: false,
      appliedBy: [],
    },
    {
      id: 'lvm',
      name: 'LVM Storage',
      description: 'Local storage for standard observability needs.',
      isSelected: false,
      isLocked: false,
      appliedBy: [],
    },
  ], []);

  // State for operators and storage with dependency tracking
  const [operators, setOperators] = useState<OperatorStorageItem[]>(initialOperators);
  const [storage, setStorage] = useState<OperatorStorageItem[]>(initialStorage);

  // Dependency calculation: Updates operators and storage based on activeGoals
  const updateDependencies = useCallback((goalIds: string[]) => {
    // Reset all to default (except Core Observability which is locked)
    const newOperators = initialOperators.map(item => ({
      ...item,
      isSelected: item.isLocked, // Only locked items remain selected
      appliedBy: [],
    }));

    const newStorage = initialStorage.map(item => ({
      ...item,
      isSelected: false,
      appliedBy: [],
    }));

    // Aggregate requirements from all active goals
    goalIds.forEach(goalId => {
      const deps = NEED_DEPENDENCIES[goalId as GoalID];
      if (!deps) return;

      // Add required operators
      deps.operators.forEach(opId => {
        const item = newOperators.find(i => i.id === opId);
        if (item && !item.isLocked) {
          item.isSelected = true;
          if (!item.appliedBy.includes(goalId as GoalID)) {
            item.appliedBy.push(goalId as GoalID);
          }
        }
      });

      // Add required storage
      deps.storage.forEach(storageId => {
        const item = newStorage.find(i => i.id === storageId);
        if (item) {
          item.isSelected = true;
          if (!item.appliedBy.includes(goalId as GoalID)) {
            item.appliedBy.push(goalId as GoalID);
          }
        }
      });
    });

    // Conflict Resolution: ODF overrides LVM
    const hasODF = newStorage.find(i => i.id === 'odf')?.isSelected;
    const hasLVM = newStorage.find(i => i.id === 'lvm')?.isSelected;
    
    if (hasODF && hasLVM) {
      // ODF takes priority - remove LVM requirement
      const lvmItem = newStorage.find(i => i.id === 'lvm');
      if (lvmItem) {
        lvmItem.isSelected = false;
        // Keep only ODF-requiring goals in LVM's appliedBy (for display purposes)
        // Actually, we should remove LVM entirely when ODF is selected
        lvmItem.appliedBy = [];
      }
    }

    return { operators: newOperators, storage: newStorage };
  }, [initialOperators, initialStorage]);

  // Update dependencies when activeGoals change
  useEffect(() => {
    const { operators: newOperators, storage: newStorage } = updateDependencies(activeGoals);
    setOperators(newOperators);
    setStorage(newStorage);

    // Update selectedCapabilities based on selected operators
    const newCapabilities = newOperators
      .filter(op => op.isSelected)
      .map(op => op.id);
    
    setSelectedCapabilities(newCapabilities);
    onDataChange({ 
      activeGoals,
      selectedCapabilities: newCapabilities 
    });
  }, [activeGoals, updateDependencies, onDataChange]);

  // Auto-select UI plugins based on goals and selected capabilities
  useEffect(() => {
    // Only auto-select if we have goals or capabilities (not just on initial mount with empty state)
    if (activeGoals.length > 0 || (selectedCapabilities.length > 0 && selectedCapabilities.includes('metrics-alerting'))) {
      let autoUIPlugins: string[] = [];
      
      // monitoring-ui requires metrics-alerting (always auto-selected when dependency is met)
      if (selectedCapabilities.includes('metrics-alerting')) {
        autoUIPlugins.push('monitoring-ui');
      }
      
      // logging-ui requires loki (auto-selected when dependency is met)
      if (selectedCapabilities.includes('loki')) {
        autoUIPlugins.push('logging-ui');
      }
      
      // tracing-ui requires tempo (auto-selected when dependency is met)
      if (selectedCapabilities.includes('tempo')) {
        autoUIPlugins.push('tracing-ui');
      }
      
      // troubleshooting-panel requires korrel8r (auto-selected when dependency is met)
      if (selectedCapabilities.includes('korrel8r')) {
        autoUIPlugins.push('troubleshooting-panel');
      }
      
      // Perses requires metrics-alerting and is auto-selected for Platform Governance and Incident Response goals
      if (selectedCapabilities.includes('metrics-alerting') && 
          (activeGoals.includes('platform-governance') || activeGoals.includes('incident-response'))) {
        autoUIPlugins.push('perses');
      }
      
      // Incident Detection UI Plugin requires loki and is auto-selected for Incident Response goal
      if (selectedCapabilities.includes('loki') && activeGoals.includes('incident-response')) {
        autoUIPlugins.push('incident-detection-ui');
      }
      
      // Network UI Plugin requires network-traffic and is auto-selected when network-traffic is selected
      if (selectedCapabilities.includes('network-traffic')) {
        autoUIPlugins.push('network-ui');
      }
      
      // When goals/capabilities change, only keep plugins that should be auto-selected
      // Don't preserve manually-selected plugins unless Advanced Mode is enabled
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const currentPlugins = selectedUIPlugins;
      const finalPlugins = advancedMode 
        ? // In Advanced Mode, preserve manually-selected plugins that aren't auto-selected
          [...autoUIPlugins, ...currentPlugins.filter(pluginId => !autoUIPlugins.includes(pluginId))]
        : // In normal mode, only use auto-selected plugins
          autoUIPlugins;
      
      // Remove duplicates
      const uniquePlugins = Array.from(new Set(finalPlugins));
      
      setSelectedUIPlugins(uniquePlugins);
      onDataChange({ selectedUIPlugins: uniquePlugins });
    }
  }, [activeGoals, selectedCapabilities, advancedMode, onDataChange]);

  // Sync data prop changes to local state when props change
  // This ensures local state stays in sync if user navigates away and back
  useEffect(() => {
    if (data.activeGoals) {
      setActiveGoals(data.activeGoals);
    }
  }, [data.activeGoals]);

  useEffect(() => {
    setSelectedPersona(data.selectedPersona);
  }, [data.selectedPersona]);

  useEffect(() => {
    setSelectedCapabilities(data.selectedCapabilities);
  }, [data.selectedCapabilities]);

  useEffect(() => {
    setSelectedNestedOptions(data.selectedNestedOptions || {});
  }, [data.selectedNestedOptions]);

  useEffect(() => {
    setAdvancedMode(data.advancedMode || false);
  }, [data.advancedMode]);

  useEffect(() => {
    setSelectedUIPlugins(data.selectedUIPlugins || ['monitoring-ui']);
  }, [data.selectedUIPlugins]);

  // Auto-select capabilities based on persona
  // Note: We intentionally read selectedCapabilities here without including it in dependencies
  // because we only want this effect to run when persona changes, not when capabilities change.
  // We read the current value to preserve manually-selected capabilities when switching personas.
  useEffect(() => {
    if (selectedPersona) {
      // Define persona-specific capabilities (these will be replaced when persona changes)
      const personaSpecificCapabilities = ['thanos', 'loki', 'tempo', 'korrel8r', 'incident-detection'];
      
      // Start with required capabilities
      let autoCapabilities: string[] = ['metrics-alerting']; // Always required
      
      // Add persona-specific capabilities
      if (selectedPersona === 'administrator') {
        autoCapabilities.push('thanos', 'loki');
      } else if (selectedPersona === 'sre') {
        autoCapabilities.push('thanos', 'loki', 'tempo', 'korrel8r', 'incident-detection');
      } else if (selectedPersona === 'developer') {
        autoCapabilities.push('loki', 'tempo');
      }
      
      // Preserve manually-selected capabilities that are NOT persona-specific
      // (e.g., network-traffic which can be manually selected)
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const manuallySelected = selectedCapabilities.filter(
        cap => !personaSpecificCapabilities.includes(cap) && cap !== 'metrics-alerting'
      );
      
      // Merge persona auto-capabilities with manually-selected ones
      const mergedCapabilities = [...autoCapabilities, ...manuallySelected];
      // Remove duplicates
      const uniqueCapabilities = Array.from(new Set(mergedCapabilities));
      
      setSelectedCapabilities(uniqueCapabilities);
      onDataChange({ selectedCapabilities: uniqueCapabilities });
      
      // Auto-select UI plugins based on persona and dependencies
      // Only add plugins if their dependencies are satisfied
      let autoUIPlugins: string[] = [];
      
      // monitoring-ui requires metrics-alerting (always auto-selected when dependency is met)
      if (uniqueCapabilities.includes('metrics-alerting')) {
        autoUIPlugins.push('monitoring-ui');
      }
      
      // logging-ui requires loki (auto-selected when dependency is met)
      if (uniqueCapabilities.includes('loki')) {
        autoUIPlugins.push('logging-ui');
      }
      
      // tracing-ui requires tempo (auto-selected when dependency is met)
      if (uniqueCapabilities.includes('tempo')) {
        autoUIPlugins.push('tracing-ui');
      }
      
      // troubleshooting-panel requires korrel8r (auto-selected when dependency is met)
      if (uniqueCapabilities.includes('korrel8r')) {
        autoUIPlugins.push('troubleshooting-panel');
      }
      
      // Perses requires metrics-alerting and is auto-selected for Administrator and SRE personas
      if (uniqueCapabilities.includes('metrics-alerting') && 
          (selectedPersona === 'administrator' || selectedPersona === 'sre')) {
        autoUIPlugins.push('perses');
      }
      
      // Incident Detection UI Plugin requires loki and is auto-selected for SRE persona
      if (uniqueCapabilities.includes('loki') && selectedPersona === 'sre') {
        autoUIPlugins.push('incident-detection-ui');
      }
      
      // Network UI Plugin requires network-traffic and is auto-selected when network-traffic is selected
      if (uniqueCapabilities.includes('network-traffic')) {
        autoUIPlugins.push('network-ui');
      }
      
      // When persona changes, only keep plugins that should be auto-selected for this persona
      // Don't preserve manually-selected plugins unless Advanced Mode is enabled
      // This ensures persona-specific plugin selections are accurate
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const finalPlugins = advancedMode 
        ? // In Advanced Mode, preserve manually-selected plugins that aren't auto-selected
          [...autoUIPlugins, ...selectedUIPlugins.filter(pluginId => !autoUIPlugins.includes(pluginId))]
        : // In normal mode, only use auto-selected plugins for this persona
          autoUIPlugins;
      
      // Remove duplicates
      const uniquePlugins = Array.from(new Set(finalPlugins));
      
      setSelectedUIPlugins(uniquePlugins);
      onDataChange({ selectedUIPlugins: uniquePlugins });
    }
  }, [selectedPersona, advancedMode, onDataChange]);

  // Handle goal selection (checkboxes)
  const handleGoalChange = (goalId: string, checked: boolean) => {
    let newGoals: string[];
    if (checked) {
      newGoals = [...activeGoals, goalId];
    } else {
      newGoals = activeGoals.filter(id => id !== goalId);
    }
    setActiveGoals(newGoals);
    onDataChange({ activeGoals: newGoals });
  };

  // Handle operator/storage selection with warning for required items
  const handleOperatorChange = (operatorId: string, checked: boolean) => {
    const operator = operators.find(op => op.id === operatorId);
    if (!operator) return;

    // Prevent unchecking locked items (Core Observability)
    if (!checked && operator.isLocked) {
      return;
    }

    // Check if this operator is required by any active goal
    if (!checked && operator.appliedBy.length > 0) {
      // Show warning - add to uncheckedRequiredItems
      setUncheckedRequiredItems(prev => new Set([...prev, operatorId]));
    } else {
      // Remove from uncheckedRequiredItems if being checked
      setUncheckedRequiredItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(operatorId);
        return newSet;
      });
    }

    // Update operator selection
    const newOperators = operators.map(op => 
      op.id === operatorId ? { ...op, isSelected: checked } : op
    );
    setOperators(newOperators);

    // Update selectedCapabilities
    const newCapabilities = newOperators
      .filter(op => op.isSelected)
      .map(op => op.id);
    setSelectedCapabilities(newCapabilities);
    onDataChange({ selectedCapabilities: newCapabilities });
  };

  const handleStorageChange = (storageId: string, checked: boolean) => {
    const storageItem = storage.find(s => s.id === storageId);
    if (!storageItem) return;

    // Check if this storage is required by any active goal
    if (!checked && storageItem.appliedBy.length > 0) {
      // Show warning
      setUncheckedRequiredItems(prev => new Set([...prev, storageId]));
    } else {
      setUncheckedRequiredItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(storageId);
        return newSet;
      });
    }

    // Handle ODF vs LVM conflict
    if (checked && storageId === 'odf') {
      // ODF selected - uncheck LVM
      const newStorage = storage.map(s => 
        s.id === 'lvm' ? { ...s, isSelected: false } : 
        s.id === storageId ? { ...s, isSelected: true } : s
      );
      setStorage(newStorage);
    } else if (checked && storageId === 'lvm') {
      // LVM selected - check if ODF is required by goals
      const odfItem = storage.find(s => s.id === 'odf');
      if (odfItem && odfItem.appliedBy.length > 0) {
        // ODF is required - don't allow LVM
        return;
      }
      // Uncheck ODF if it's not required
      const newStorage = storage.map(s => 
        s.id === 'odf' ? { ...s, isSelected: false } : 
        s.id === storageId ? { ...s, isSelected: true } : s
      );
      setStorage(newStorage);
    } else {
      // Unchecking
      const newStorage = storage.map(s => 
        s.id === storageId ? { ...s, isSelected: false } : s
      );
      setStorage(newStorage);
    }
  };

  const handlePersonaChange = (personaId: string) => {
    setSelectedPersona(personaId);
    onDataChange({ selectedPersona: personaId });
  };

  const handleCapabilityChange = (capabilityId: string, checked: boolean) => {
    // Prevent unchecking required capabilities
    const capability = capabilities.find(c => c.id === capabilityId);
    if (!checked && capability?.required) {
      return; // Don't allow unchecking required capabilities
    }

    // Check if this capability is required by any active goal
    const operator = operators.find(op => op.id === capabilityId);
    if (!checked && operator && operator.appliedBy.length > 0) {
      // Show warning
      setUncheckedRequiredItems(prev => new Set([...prev, capabilityId]));
    } else {
      setUncheckedRequiredItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(capabilityId);
        return newSet;
      });
    }

    // Update operator state to sync with capabilities
    const newOperators = operators.map(op => 
      op.id === capabilityId ? { ...op, isSelected: checked } : op
    );
    setOperators(newOperators);
    
    let newCapabilities: string[];
    
    if (checked) {
      newCapabilities = [...selectedCapabilities, capabilityId];
      
      // Auto-select UI plugins when their dependencies are checked
      const pluginsToAdd: string[] = [];
      
      if (capabilityId === 'loki' && !selectedUIPlugins.includes('logging-ui')) {
        pluginsToAdd.push('logging-ui');
      }
      if (capabilityId === 'tempo' && !selectedUIPlugins.includes('tracing-ui')) {
        pluginsToAdd.push('tracing-ui');
      }
      if (capabilityId === 'korrel8r' && !selectedUIPlugins.includes('troubleshooting-panel')) {
        pluginsToAdd.push('troubleshooting-panel');
      }
      if (capabilityId === 'network-traffic' && !selectedUIPlugins.includes('network-ui')) {
        pluginsToAdd.push('network-ui');
      }
      
      if (pluginsToAdd.length > 0) {
        const newPlugins = [...selectedUIPlugins, ...pluginsToAdd];
        setSelectedUIPlugins(newPlugins);
        onDataChange({ selectedUIPlugins: newPlugins });
      }
    } else {
      newCapabilities = selectedCapabilities.filter(id => id !== capabilityId);
      // Remove nested options when parent is unchecked
      if (selectedNestedOptions[capabilityId]) {
        const newNestedOptions = { ...selectedNestedOptions };
        delete newNestedOptions[capabilityId];
        setSelectedNestedOptions(newNestedOptions);
        onDataChange({ selectedNestedOptions: newNestedOptions });
      }
      
      // Remove UI plugins when their dependencies are unchecked
      const pluginsToRemove: string[] = [];
      
      if (capabilityId === 'metrics-alerting') {
        pluginsToRemove.push('monitoring-ui', 'perses');
      }
      if (capabilityId === 'loki') {
        pluginsToRemove.push('logging-ui');
        // Only remove incident-detection-ui if not required by active goals
        const hasIncidentResponse = activeGoals.includes('incident-response');
        if (!hasIncidentResponse) {
          pluginsToRemove.push('incident-detection-ui');
        }
      }
      if (capabilityId === 'tempo') {
        pluginsToRemove.push('tracing-ui');
      }
      if (capabilityId === 'korrel8r') {
        pluginsToRemove.push('troubleshooting-panel');
      }
      if (capabilityId === 'network-traffic') {
        pluginsToRemove.push('network-ui');
      }
      
      if (pluginsToRemove.length > 0) {
        const newPlugins = selectedUIPlugins.filter(pluginId => !pluginsToRemove.includes(pluginId));
        setSelectedUIPlugins(newPlugins);
        onDataChange({ selectedUIPlugins: newPlugins });
      }
    }
    
    setSelectedCapabilities(newCapabilities);
    onDataChange({ selectedCapabilities: newCapabilities });
  };

  const handleNestedOptionChange = (capabilityId: string, optionId: string, checked: boolean) => {
    const currentOptions = selectedNestedOptions[capabilityId] || [];
    let newOptions: string[];
    
    if (checked) {
      newOptions = [...currentOptions, optionId];
    } else {
      newOptions = currentOptions.filter(id => id !== optionId);
    }
    
    const newNestedOptions = { ...selectedNestedOptions, [capabilityId]: newOptions };
    setSelectedNestedOptions(newNestedOptions);
    onDataChange({ selectedNestedOptions: newNestedOptions });
  };

  const checkDependencies = (capability: Capability): { satisfied: boolean; missing: string[] } => {
    if (!capability.dependencies || capability.dependencies.length === 0) {
      return { satisfied: true, missing: [] };
    }
    
    const missing = capability.dependencies.filter(dep => !selectedCapabilities.includes(dep));
    return { satisfied: missing.length === 0, missing };
  };

  // Auto-enable/disable UI plugins based on dependencies
  const availablePlugins = useMemo(() => {
    return uiPlugins.filter(plugin => {
      if (!plugin.dependencies || plugin.dependencies.length === 0) {
        return true;
      }
      return plugin.dependencies.some(dep => selectedCapabilities.includes(dep));
    });
  }, [selectedCapabilities]);

  const handleAdvancedModeChange = (checked: boolean) => {
    setAdvancedMode(checked);
    onDataChange({ advancedMode: checked });
    
    // When advanced mode is disabled, clear all selections
    if (!checked) {
      setSelectedUIPlugins([]);
      onDataChange({ selectedUIPlugins: [] });
    }
  };

  const handleUIPluginChange = (pluginId: string, checked: boolean) => {
    let newPlugins: string[];
    
    if (checked) {
      newPlugins = [...selectedUIPlugins, pluginId];
    } else {
      newPlugins = selectedUIPlugins.filter(id => id !== pluginId);
    }
    
    setSelectedUIPlugins(newPlugins);
    onDataChange({ selectedUIPlugins: newPlugins });
  };

  return (
    <div style={{ maxWidth: '800px', marginTop: '24px', marginLeft: '24px' }}>
      <Stack hasGutter>
        {/* Form Title */}
        <StackItem>
          <Title headingLevel="h2" size="2xl" style={{ fontSize: '24px', marginBottom: '24px' }}>
            Components and configuration
          </Title>
        </StackItem>
        
        {/* Goals Selection Section (Checkboxes) */}
        <StackItem>
          <Title headingLevel="h2" size="lg" style={{ marginBottom: '8px' }}>
            Choose your Observability strategy
          </Title>
          <Content style={{ marginBottom: '24px', color: '#6a6e73' }}>
            Select one or more operational focuses to pre-configure the recommended stack. You can customize specific components later.
          </Content>
          
          <Grid hasGutter>
            {goals.map((goal) => (
              <GridItem key={goal.id} span={4}>
                <Card
                  style={{
                    height: '100%',
                    border: activeGoals.includes(goal.id) ? '2px solid #0066cc' : '1px solid #d2d2d2',
                  }}
                >
                  <CardBody>
                    <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                      <FlexItem>
                        <Checkbox
                          id={`goal-${goal.id}`}
                          label={<span style={{ fontWeight: '600' }}>{goal.name}</span>}
                          isChecked={activeGoals.includes(goal.id)}
                          onChange={(_, checked) => handleGoalChange(goal.id, checked)}
                        />
                      </FlexItem>
                      <FlexItem>
                        <Content style={{ fontSize: '14px', color: '#6a6e73' }}>
                          {goal.description}
                        </Content>
                      </FlexItem>
                    </Flex>
                  </CardBody>
                </Card>
              </GridItem>
            ))}
          </Grid>
        </StackItem>

        {/* Intelligent Preselection Alert */}
        {activeGoals.length > 0 && !isPreselectionAlertDismissed && (
          <StackItem>
            <Alert
              variant={AlertVariant.info}
              isInline
              title="Intelligent preselection"
              actionClose={
                <AlertActionCloseButton onClose={() => setIsPreselectionAlertDismissed(true)} />
              }
            >
              Choosing a strategy helps us tailor your installation. The preselected components represent the industry-standard stack for your specific operational focus.
            </Alert>
          </StackItem>
        )}

        {/* Operators and Storage Section */}
        {activeGoals.length > 0 && (
          <StackItem>
            <Title headingLevel="h2" size="lg" style={{ marginTop: 'var(--pf-t--global--spacer--md)', marginBottom: '8px' }}>
              Required operators and storage
            </Title>
            <Content style={{ marginBottom: '24px', color: '#6a6e73' }}>
              The following operators and storage are required by your selected goals. You can customize these selections below.
            </Content>

            <Card>
              <CardBody>
                <Stack hasGutter>
                  {/* Operators */}
                  <StackItem>
                    <Title headingLevel="h3" size="md" style={{ marginBottom: '16px' }}>
                      Operators
                    </Title>
                    <Stack hasGutter>
                      {operators.map((operator) => {
                          const goalNames = operator.appliedBy.map(goalId => {
                            const goal = goals.find(g => g.id === goalId);
                            return goal?.name || goalId;
                          });
                          
                          return (
                            <StackItem key={operator.id}>
                              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                                <FlexItem>
                                  <Checkbox
                                    id={`operator-${operator.id}`}
                                    label={<span style={{ fontWeight: '600', fontSize: '14px' }}>{operator.name}</span>}
                                    isChecked={operator.isSelected}
                                    isDisabled={operator.isLocked}
                                    onChange={(_, checked) => handleOperatorChange(operator.id, checked)}
                                  />
                                </FlexItem>
                                {operator.appliedBy.length > 0 && (
                                  <FlexItem>
                                    <Badge isRead>
                                      Required by: {goalNames.join(', ')}
                                    </Badge>
                                  </FlexItem>
                                )}
                              </Flex>
                              {operator.description && (
                                <Content style={{ marginLeft: '24px', marginTop: '4px', fontSize: '14px', color: '#6a6e73' }}>
                                  {operator.description}
                                </Content>
                              )}
                              {uncheckedRequiredItems.has(operator.id) && (
                                <Alert
                                  variant={AlertVariant.warning}
                                  isInline
                                  title="This operator is required by selected goals"
                                  style={{ marginTop: '8px', marginLeft: '24px' }}
                                >
                                  Unchecking this operator may impact the functionality of: {goalNames.join(', ')}. Consider keeping it enabled.
                                </Alert>
                              )}
                            </StackItem>
                          );
                        })}
                    </Stack>
                  </StackItem>

                  <Divider />

                  {/* Storage */}
                  <StackItem>
                    <Title headingLevel="h3" size="md" style={{ marginBottom: '16px' }}>
                      Storage
                    </Title>
                    <Stack hasGutter>
                      {storage.map((storageItem) => {
                          const goalNames = storageItem.appliedBy.map(goalId => {
                            const goal = goals.find(g => g.id === goalId);
                            return goal?.name || goalId;
                          });
                          
                          return (
                            <StackItem key={storageItem.id}>
                              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                                <FlexItem>
                                  <Checkbox
                                    id={`storage-${storageItem.id}`}
                                    label={<span style={{ fontWeight: '600', fontSize: '14px' }}>{storageItem.name}</span>}
                                    isChecked={storageItem.isSelected}
                                    onChange={(_, checked) => handleStorageChange(storageItem.id, checked)}
                                  />
                                </FlexItem>
                                {storageItem.appliedBy.length > 0 && (
                                  <FlexItem>
                                    <Badge isRead>
                                      Required by: {goalNames.join(', ')}
                                    </Badge>
                                  </FlexItem>
                                )}
                              </Flex>
                              {storageItem.description && (
                                <Content style={{ marginLeft: '24px', marginTop: '4px', fontSize: '14px', color: '#6a6e73' }}>
                                  {storageItem.description}
                                </Content>
                              )}
                              {uncheckedRequiredItems.has(storageItem.id) && (
                                <Alert
                                  variant={AlertVariant.warning}
                                  isInline
                                  title="This storage is required by selected goals"
                                  style={{ marginTop: '8px', marginLeft: '24px' }}
                                >
                                  Unchecking this storage may impact the functionality of: {goalNames.join(', ')}. Consider keeping it enabled.
                                </Alert>
                              )}
                            </StackItem>
                          );
                        })}
                    </Stack>
                  </StackItem>
                </Stack>
              </CardBody>
            </Card>
          </StackItem>
        )}

        {/* Capabilities Section */}
        <StackItem>
          <Title headingLevel="h2" size="lg" style={{ marginTop: 'var(--pf-t--global--spacer--md)', marginBottom: '8px' }}>
            Customize capabilities
          </Title>
          <Content style={{ marginBottom: '24px', color: '#6a6e73' }}>
            Fine-tune which observability features to install based on your needs.
          </Content>

          <Card>
            <CardBody>
              <Stack hasGutter>
                {capabilities.map((capability) => {
                  const isChecked = selectedCapabilities.includes(capability.id);
                  const isRequired = capability.required || false;
                  const dependencyCheck = checkDependencies(capability);
                  const canEnable = dependencyCheck.satisfied || isChecked;

                  return (
                    <StackItem key={capability.id}>
                      <Checkbox
                        id={`capability-${capability.id}`}
                        label={
                          <span style={{ fontWeight: '600', fontSize: '14px' }}>
                            {capability.name}
                            {isRequired && (
                              <span style={{ color: '#c9190b', marginLeft: '4px' }}>*</span>
                            )}
                          </span>
                        }
                        isChecked={isChecked}
                        isDisabled={(!canEnable && !isChecked) || (isRequired && isChecked)}
                        onChange={(_, checked) => handleCapabilityChange(capability.id, checked)}
                      />
                      <Content style={{ marginLeft: '24px', marginTop: '4px', fontSize: '14px', color: '#6a6e73' }}>
                        {capability.description}
                      </Content>
                      
                      {!dependencyCheck.satisfied && !isChecked && (
                        <Alert
                          variant={AlertVariant.warning}
                          isInline
                          title={`Requires ${dependencyCheck.missing.map(dep => {
                            const depCap = capabilities.find(c => c.id === dep);
                            return depCap?.name || dep;
                          }).join(' or ')} to be enabled`}
                          style={{ marginTop: '12px', marginLeft: '24px' }}
                        />
                      )}
                      
                      {isChecked && capability.id === 'incident-detection' && (
                        data.enableClusterMonitoring ? (
                          <Alert
                            variant={AlertVariant.info}
                            isInline
                            title="Alert data processing is enabled."
                            style={{ marginTop: '12px', marginLeft: '24px' }}
                          />
                        ) : (
                          <Alert
                            variant={AlertVariant.warning}
                            isInline
                            title="Requires 'Enable Operator recommended cluster monitoring' to process alert data."
                            style={{ marginTop: '12px', marginLeft: '24px' }}
                          />
                        )
                      )}
                      
                      {!isChecked && capability.id === 'thanos' && 
                       (selectedPersona === 'administrator' || selectedPersona === 'sre') && (
                        <Alert
                          variant={AlertVariant.warning}
                          isInline
                          title="Long-term storage disabled"
                          style={{ marginTop: '12px', marginLeft: '24px' }}
                        >
                          Without long-term storage, you will lose the ability to retain metrics for capacity planning and historical analysis. This may impact your ability to track trends and plan for future resource needs.
                        </Alert>
                      )}

                      {/* Nested Options */}
                      {isChecked && capability.nestedOptions && capability.nestedOptions.length > 0 && (
                        <div style={{ marginLeft: '24px', marginTop: '12px', paddingLeft: '16px', borderLeft: '2px solid #d2d2d2' }}>
                          <Stack hasGutter>
                            {capability.nestedOptions.map((option) => (
                              <StackItem key={option.id}>
                                <Checkbox
                                  id={`option-${option.id}`}
                                  label={
                                    <span style={{ fontSize: '14px' }}>
                                      {option.name}
                                    </span>
                                  }
                                  isChecked={(selectedNestedOptions[capability.id] || []).includes(option.id)}
                                  onChange={(_, checked) =>
                                    handleNestedOptionChange(capability.id, option.id, checked)
                                  }
                                />
                                <Content style={{ marginLeft: '24px', marginTop: '4px', fontSize: '14px', color: '#6a6e73' }}>
                                  {option.description}
                                </Content>
                              </StackItem>
                            ))}
                          </Stack>
                        </div>
                      )}
                    </StackItem>
                  );
                })}
              </Stack>
            </CardBody>
          </Card>
        </StackItem>

        {/* Console Experience Section */}
        <StackItem>
          <Title headingLevel="h2" size="lg" style={{ marginTop: 'var(--pf-t--global--spacer--md)', marginBottom: '8px' }}>
            Console experience (UI Plugins and components)
          </Title>
          <Content style={{ marginBottom: '24px', color: '#6a6e73' }}>
            Select UI plugins to enhance your console experience.
          </Content>

          <Card>
            <CardBody>
              <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '16px' }}>
                <FlexItem>
                  <Switch
                    id="advanced-mode"
                    label="Advanced Mode"
                    isChecked={advancedMode}
                    onChange={(_, checked) => handleAdvancedModeChange(checked)}
                  />
                </FlexItem>
              </Flex>

              <Divider style={{ marginBottom: '16px' }} />

              <Stack hasGutter>
                {availablePlugins.map((plugin) => {
                  const isChecked = selectedUIPlugins.includes(plugin.id);
                  
                  // Determine which goals require this plugin based on dependencies and goal-specific rules
                  const requiredByGoals: string[] = [];
                  
                  // Check if plugin dependencies are satisfied and which goals require those dependencies
                  if (plugin.dependencies && plugin.dependencies.length > 0) {
                    activeGoals.forEach(goalId => {
                      const deps = NEED_DEPENDENCIES[goalId as GoalID];
                      if (deps) {
                        // Check if all plugin dependencies are required by this goal
                        const allDepsSatisfied = plugin.dependencies!.every(dep => 
                          deps.operators.includes(dep) || selectedCapabilities.includes(dep)
                        );
                        if (allDepsSatisfied) {
                          requiredByGoals.push(goalId);
                        }
                      }
                    });
                  }
                  
                  // Goal-specific plugin rules
                  if (plugin.id === 'perses') {
                    // Perses is specifically required by Platform Governance and Incident Response
                    if (activeGoals.includes('platform-governance') && selectedCapabilities.includes('metrics-alerting')) {
                      if (!requiredByGoals.includes('platform-governance')) {
                        requiredByGoals.push('platform-governance');
                      }
                    }
                    if (activeGoals.includes('incident-response') && selectedCapabilities.includes('metrics-alerting')) {
                      if (!requiredByGoals.includes('incident-response')) {
                        requiredByGoals.push('incident-response');
                      }
                    }
                  }
                  
                  if (plugin.id === 'incident-detection-ui') {
                    // Incident Detection UI is specifically required by Incident Response
                    if (activeGoals.includes('incident-response') && selectedCapabilities.includes('loki')) {
                      if (!requiredByGoals.includes('incident-response')) {
                        requiredByGoals.push('incident-response');
                      }
                    }
                  }
                  
                  // Remove duplicates
                  const uniqueGoalIds = Array.from(new Set(requiredByGoals));
                  const goalNames = uniqueGoalIds.map(goalId => {
                    const goal = goals.find(g => g.id === goalId);
                    return goal?.name || goalId;
                  });

                  return (
                    <StackItem key={plugin.id}>
                      <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                        <FlexItem>
                          <Checkbox
                            id={`plugin-${plugin.id}`}
                            label={<span style={{ fontWeight: '600', fontSize: '14px' }}>{plugin.name}</span>}
                            isChecked={isChecked}
                            isDisabled={!advancedMode}
                            onChange={(_, checked) => handleUIPluginChange(plugin.id, checked)}
                          />
                        </FlexItem>
                        {goalNames.length > 0 && (
                          <FlexItem>
                            <Badge isRead>
                              Required by: {goalNames.join(', ')}
                            </Badge>
                          </FlexItem>
                        )}
                      </Flex>
                      <Content style={{ marginLeft: '24px', marginTop: '4px', fontSize: '14px', color: '#6a6e73' }}>
                        {plugin.description}
                      </Content>
                    </StackItem>
                  );
                })}
              </Stack>
            </CardBody>
          </Card>
        </StackItem>
      </Stack>
    </div>
  );
};

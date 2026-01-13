import React, { useState, useEffect, useRef } from 'react';
import {
  Title,
  Content,
  Checkbox,
  Stack,
  StackItem,
  ExpandableSection,
  Badge,
  Grid,
  GridItem,
  Popover,
  Button,
  Flex,
  FlexItem,
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  Alert,
  Switch,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, InfoCircleIcon } from '@patternfly/react-icons';

interface Operator {
  id: string;
  name: string;
  description: string;
  developerPreview?: boolean;
  learnMoreUrl?: string;
  required?: boolean;
  warning?: string;
  recommendedForObservability?: boolean;
}

interface OperatorCategory {
  id: string;
  name: string;
  operators: Operator[];
}

interface OperatorsStepProps {
  selectedBundles: string[];
  selectedOperators: string[];
  onBundlesChange: (bundles: string[]) => void;
  onOperatorsChange: (operators: string[]) => void;
  selectedPersonas?: string[];
  onPersonasChange?: (personas: string[]) => void;
}

const bundles = [
  {
    id: 'virtualization',
    name: 'Virtualization',
    description: 'Run virtual machines alongside containers on one platform.',
    popoverContent: 'Virtualization bundle provides the ability to run virtual machines alongside containers on a single platform, enabling hybrid workloads and migration capabilities.',
  },
  {
    id: 'openshift-ai',
    name: 'OpenShift AI',
    description: 'Train, serve, monitor and manage AI/ML models and applications using GPUs.',
    popoverContent: 'OpenShift AI bundle enables you to train, serve, monitor and manage AI/ML models and applications using GPUs on your OpenShift cluster.',
  },
  {
    id: 'observability',
    name: 'Observability',
    description: 'Gain unified visibility into cluster and application health using metrics, logs, and distributed tracing.',
    popoverContent: 'Observability bundle provides unified visibility into cluster and application health through metrics collection, log aggregation, and distributed tracing capabilities.',
  },
];

const operatorCategories: OperatorCategory[] = [
  {
    id: 'storage',
    name: 'Storage',
    operators: [
      { id: 'local-storage', name: 'Local Storage Operator', description: 'Allows provisioning of persistent storage by using local volumes.' },
      { id: 'lvm-storage', name: 'Logical Volume Manager Storage', description: 'Storage virtualization that offers a more flexible approach for disk space management.' },
      { id: 'odf', name: 'OpenShift Data Foundation', description: 'Persistent software-defined storage for hybrid applications.' },
      { id: 'oadp', name: 'OADP', description: 'Backup and restore OpenShift cluster resources and persistent volumes.' },
    ],
  },
  {
    id: 'observability',
    name: 'Observability',
    operators: [
      { 
        id: 'core-observability', 
        name: 'Core Observability (Prometheus)', 
        description: 'The engine for metrics collection, alerting rules, and base dashboards.',
        required: true
      },
      { 
        id: 'thanos', 
        name: 'Enable Long-term Storage (Thanos)', 
        description: 'Retain metrics for capacity planning and historical analysis.'
      },
      { 
        id: 'loki', 
        name: 'Centralized Logging (Loki)', 
        description: 'Aggregate and search logs across the cluster.'
      },
      { 
        id: 'incident-detection', 
        name: 'Incident Detection (Native)', 
        description: 'Automatically groups related alerts into incidents to reduce alert fatigue and highlight root causes.'
      },
      { 
        id: 'tempo', 
        name: 'Distributed Tracing (Tempo)', 
        description: 'Track requests across microservices for latency analysis.'
      },
      { 
        id: 'opentelemetry', 
        name: 'Telemetry Pipeline (OpenTelemetry)', 
        description: 'Handles telemetry collection and auto-instrumentation.'
      },
      { 
        id: 'netobserve', 
        name: 'Network Traffic Analysis (NetObserve)', 
        description: 'Visualize pod-to-pod traffic and debug connection issues.',
        warning: 'Requires Centralized Logging (Loki) to be enabled'
      },
      { 
        id: 'korrel8r', 
        name: 'Signal Correlation (Korrel8r)', 
        description: 'Automated root cause analysis linking logs, metrics, and traces.'
      },
    ],
  },
  {
    id: 'virtualization',
    name: 'Virtualization',
    operators: [
      { id: 'openshift-virtualization', name: 'OpenShift Virtualization', description: 'Run virtual machines on OpenShift.' },
      { id: 'mtv', name: 'Migration Toolkit for Virtualization', description: 'Migrate virtual machines to OpenShift.' },
      { id: 'sandboxed-containers', name: 'OpenShift sandboxed containers', description: 'Run containers in isolated environments.' },
    ],
  },
  {
    id: 'ai',
    name: 'AI',
    operators: [
      { id: 'openshift-ai', name: 'OpenShift AI', description: 'AI/ML platform for OpenShift.', developerPreview: true },
      { id: 'amd-gpu', name: 'AMD GPU', description: 'AMD GPU support for AI workloads.', developerPreview: true },
      { id: 'nvidia-gpu', name: 'NVIDIA GPU', description: 'NVIDIA GPU support for AI workloads.', developerPreview: true },
    ],
  },
  {
    id: 'network',
    name: 'Network',
    operators: [
      { id: 'nmstate', name: 'NMState', description: 'Network state management.' },
      { id: 'service-mesh', name: 'Service Mesh', description: 'Service mesh for microservices.', developerPreview: true },
      { id: 'metallb', name: 'MetalLB', description: 'Load balancer for bare metal Kubernetes.' },
    ],
  },
  {
    id: 'remediation',
    name: 'Remediation',
    operators: [
      { id: 'node-healthcheck', name: 'Node Healthcheck', description: 'Monitor and remediate node health issues.' },
      { id: 'fence-agents', name: 'Fence Agents Remediation', description: 'Fence agents for node remediation.' },
    ],
  },
  {
    id: 'security',
    name: 'Security & Access Control',
    operators: [
      { id: 'authorino', name: 'Authorino', description: 'Authorization service for APIs.', developerPreview: true },
      { id: 'kernel-module-management', name: 'Kernel Module Management', description: 'Manage kernel modules.', developerPreview: true },
    ],
  },
  {
    id: 'cicd',
    name: 'CI/CD & Dev Productivity',
    operators: [
      { id: 'pipelines', name: 'Pipelines', description: 'CI/CD pipelines for OpenShift.', developerPreview: true },
      { id: 'serverless', name: 'Serverless', description: 'Serverless functions on OpenShift.', developerPreview: true },
    ],
  },
  {
    id: 'platform',
    name: 'Platform Operations & Lifecycle',
    operators: [
      { id: 'multicluster-engine', name: 'Multicluster engine', description: 'Manage multiple clusters.' },
      { id: 'node-maintenance', name: 'Node Maintenance', description: 'Manage node maintenance operations.' },
      { id: 'cluster-observability', name: 'Cluster Observability', description: 'Observability for cluster operations.' },
      { id: 'loki-operator', name: 'Loki Operator', description: 'Log aggregation operator.' },
      { id: 'openshift-logging', name: 'OpenShift Logging', description: 'Logging solution for OpenShift.' },
    ],
  },
  {
    id: 'scheduling',
    name: 'Scheduling',
    operators: [
      { id: 'node-feature-discovery', name: 'Node Feature Discovery', description: 'Discover node features.', developerPreview: true },
      { id: 'kube-descheduler', name: 'Kube Descheduler', description: 'Deschedule pods for better placement.' },
      { id: 'numa-resources', name: 'NUMA Resources', description: 'NUMA-aware resource management.' },
    ],
  },
];

const personaOptions = [
  { id: 'platform-governance', label: 'Platform governance' },
  { id: 'incident-response', label: 'Incident response' },
  { id: 'app-performance', label: 'App performance' },
];

const advancedUIOptions = [
  { 
    id: 'monitoring-ui', 
    name: 'Monitoring UI Plugin (Metrics)', 
    description: 'Adds the Metrics, Alerting, and Incidents pages to the Observe menu.' 
  },
  { 
    id: 'logging-ui', 
    name: 'Logging UI Plugin (Logs)', 
    description: 'Log exploration.' 
  },
  { 
    id: 'tracing-ui', 
    name: 'Tracing UI Plugin (Traces)', 
    description: 'Distributed traces.' 
  },
  { 
    id: 'troubleshooting-panel-ui', 
    name: 'Troubleshooting Panel UI (Signal correlation)', 
    description: 'Signal correlation.' 
  },
  { 
    id: 'custom-dashboards-ui', 
    name: 'Custom dashboards UI (Perses)', 
    description: 'Enables the Perses dashboard engine for creating and visualizing custom metrics and dashboards directly in the Console.' 
  },
  { 
    id: 'incident-detection-ui', 
    name: 'Incident Detection UI Plugin (Alerts)', 
    description: 'Incident detection and alerting.' 
  },
];

export const OperatorsStep: React.FC<OperatorsStepProps> = ({
  selectedBundles,
  selectedOperators,
  onBundlesChange,
  onOperatorsChange,
  selectedPersonas = [],
  onPersonasChange,
}) => {
  const [isSingleOperatorsExpanded, setIsSingleOperatorsExpanded] = useState<boolean>(true);
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState<boolean>(false);
  const [showStorageRecommendation, setShowStorageRecommendation] = useState<boolean>(false);
  const [recommendedStorageOperators, setRecommendedStorageOperators] = useState<string[]>([]);
  const [isAdvancedModeEnabled, setIsAdvancedModeEnabled] = useState<boolean>(false);
  const [isAdvancedSectionExpanded, setIsAdvancedSectionExpanded] = useState<boolean>(false);
  const [selectedAdvancedOptions, setSelectedAdvancedOptions] = useState<string[]>([]);
  const [recommendedAdvancedOptions, setRecommendedAdvancedOptions] = useState<string[]>([]);
  const advancedSectionRef = useRef<HTMLDivElement>(null);

  // Fix for ExpandableSection content div not collapsing properly
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      if (!advancedSectionRef.current) return;
      
      // Find the ExpandableSection content div within our ref
      const contentDiv = advancedSectionRef.current.querySelector('.pf-v6-c-expandable-section__content') as HTMLElement;
      
      if (contentDiv) {
        if (!isAdvancedSectionExpanded) {
          // When collapsed, ensure the content div takes no space
          contentDiv.style.display = 'none';
          contentDiv.style.height = '0';
          contentDiv.style.overflow = 'hidden';
          contentDiv.style.margin = '0';
          contentDiv.style.padding = '0';
        } else {
          // When expanded, reset styles to let PatternFly handle it
          contentDiv.style.display = '';
          contentDiv.style.height = '';
          contentDiv.style.overflow = '';
          contentDiv.style.margin = '';
          contentDiv.style.padding = '';
        }
      }
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [isAdvancedSectionExpanded]);

  const handleBundleChange = (bundleId: string, checked: boolean) => {
    if (checked) {
      onBundlesChange([...selectedBundles, bundleId]);
    } else {
      onBundlesChange(selectedBundles.filter((id) => id !== bundleId));
    }
  };

  const handleOperatorChange = (operatorId: string, checked: boolean) => {
    if (checked) {
      onOperatorsChange([...selectedOperators, operatorId]);
    } else {
      onOperatorsChange(selectedOperators.filter((id) => id !== operatorId));
    }
  };

  const handleOperationalNeedChange = (personaId: string | null) => {
    // Define all observability and storage operator IDs
    const allObservabilityOperatorIds = ['core-observability', 'loki', 'incident-detection', 'netobserve', 'tempo', 'opentelemetry', 'korrel8r', 'thanos'];
    const allStorageOperatorIds = ['local-storage', 'lvm-storage', 'odf', 'oadp'];

    if (!personaId) {
      // Deselecting - remove persona-specific observability operators but keep core-observability
      // Remove previously recommended storage operators
      const currentObservabilityOps = selectedOperators.filter(id => allObservabilityOperatorIds.includes(id));
      const currentStorageOps = selectedOperators.filter(id => allStorageOperatorIds.includes(id));
      
      // Keep only core-observability from observability operators
      const updatedObservabilityOps = currentObservabilityOps.filter(id => id === 'core-observability');
      
      // Remove previously recommended storage operators (use state from previous selection)
      const storageToRemove = recommendedStorageOperators.length > 0 ? recommendedStorageOperators : [];
      const updatedStorageOps = currentStorageOps.filter(id => !storageToRemove.includes(id));
      
      // Keep all non-observability, non-storage operators (from other categories)
      const otherOperators = selectedOperators.filter(id => 
        !allObservabilityOperatorIds.includes(id) && !allStorageOperatorIds.includes(id)
      );
      
      onOperatorsChange([...updatedObservabilityOps, ...updatedStorageOps, ...otherOperators]);
      
      // Clear recommendations
      setShowStorageRecommendation(false);
      setRecommendedStorageOperators([]);
      // Clear advanced options
      setSelectedAdvancedOptions([]);
      setRecommendedAdvancedOptions([]);
      setIsAdvancedModeEnabled(false);
      return;
    }

    // Define observability and storage dependencies based on persona
    let observabilityOperators: string[] = ['core-observability']; // Core is always required
    let storageOperators: string[] = [];

    switch (personaId) {
      case 'platform-governance':
        // Platform Governance: Core Observability + Loki
        observabilityOperators = ['core-observability', 'loki'];
        // Storage: LVM Storage
        storageOperators = ['lvm-storage'];
        break;
      
      case 'incident-response':
        // Incident Response: Core + Incident Detection + NetObserve + Loki
        observabilityOperators = ['core-observability', 'incident-detection', 'netobserve', 'loki'];
        // Storage: ODF + OADP
        storageOperators = ['odf', 'oadp'];
        break;
      
      case 'app-performance':
        // App Performance: Core + Tempo + OpenTelemetry
        observabilityOperators = ['core-observability', 'tempo', 'opentelemetry'];
        // Storage: Local Storage + OADP
        storageOperators = ['local-storage', 'oadp'];
        break;
    }

    // Get current operators from other categories (non-observability, non-storage)
    const otherOperators = selectedOperators.filter(id => 
      !allObservabilityOperatorIds.includes(id) && !allStorageOperatorIds.includes(id)
    );

    // Get currently selected storage operators that are NOT in the new recommendations
    // (preserve manually selected storage that wasn't recommended by the new persona)
    const currentStorageOps = selectedOperators.filter(id => allStorageOperatorIds.includes(id));
    // Filter out storage operators that are in the NEW recommendations to prevent duplicates
    const manuallySelectedStorage = currentStorageOps.filter(id => !storageOperators.includes(id));

    // Combine: new observability operators + new recommended storage + manually selected storage + other operators
    // Use Set to ensure no duplicates (defensive programming)
    const finalOperators = Array.from(new Set([
      ...observabilityOperators,
      ...storageOperators,
      ...manuallySelectedStorage,
      ...otherOperators
    ]));
    onOperatorsChange(finalOperators);

    // Set recommendation state
    setRecommendedStorageOperators(storageOperators);
    setShowStorageRecommendation(true);

    // Auto-select advanced UI options based on persona
    let advancedOptionsToSelect: string[] = [];
    switch (personaId) {
      case 'platform-governance':
        // Platform Governance: Monitoring UI, Logging UI, Custom dashboards
        advancedOptionsToSelect = ['monitoring-ui', 'logging-ui', 'custom-dashboards-ui'];
        break;
      case 'incident-response':
        // Incident Response: All options
        advancedOptionsToSelect = ['monitoring-ui', 'logging-ui', 'tracing-ui', 'troubleshooting-panel-ui', 'custom-dashboards-ui', 'incident-detection-ui'];
        break;
      case 'app-performance':
        // App Performance: Monitoring UI, Logging UI, Tracing UI
        advancedOptionsToSelect = ['monitoring-ui', 'logging-ui', 'tracing-ui'];
        break;
    }
    
    // Preserve manually selected options that aren't in the new recommendations
    const manuallySelectedOptions = selectedAdvancedOptions.filter(id => !recommendedAdvancedOptions.includes(id));
    // Combine: new recommended options + manually selected options (no duplicates)
    const finalAdvancedOptions = Array.from(new Set([...advancedOptionsToSelect, ...manuallySelectedOptions]));
    
    setSelectedAdvancedOptions(finalAdvancedOptions);
    // Track which options are recommended (auto-selected)
    setRecommendedAdvancedOptions(advancedOptionsToSelect);
    // Advanced mode starts disabled so recommended options are disabled
    setIsAdvancedModeEnabled(false);
  };

  const handlePersonaChange = (personaId: string) => {
    if (onPersonasChange) {
      // Single select: if already selected, deselect; otherwise, select only this one
      if (selectedPersonas.includes(personaId)) {
        onPersonasChange([]);
        handleOperationalNeedChange(null);
      } else {
        onPersonasChange([personaId]);
        handleOperationalNeedChange(personaId);
      }
    }
  };

  const getPersonaToggleText = () => {
    if (selectedPersonas.length === 0) {
      return 'Choose Observability strategy';
    }
    
    // Single select: show the selected option
    const selectedPersona = personaOptions.find(p => p.id === selectedPersonas[0]);
    return selectedPersona ? selectedPersona.label : 'Choose Observability strategy';
  };

  const selectedCount = selectedOperators.length;
  const totalCount = operatorCategories.reduce((sum, cat) => sum + cat.operators.length, 0);
  const selectedAdvancedCount = selectedAdvancedOptions.length;
  const totalAdvancedCount = advancedUIOptions.length;

  return (
    <div style={{ maxWidth: '1100px' }}>
      <Stack hasGutter>
        {/* Operators Title */}
        <StackItem>
          <Title headingLevel="h2" size="xl" style={{ marginBottom: '24px' }}>
            Operators
          </Title>
        </StackItem>

        {/* Bundles Section */}
        <StackItem>
          <Title headingLevel="h2" size="lg" style={{ marginBottom: '16px' }}>
            Bundles
          </Title>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'stretch' }}>
            {bundles.map((bundle) => {
              const isChecked = selectedBundles.includes(bundle.id);
              return (
                <div
                  key={bundle.id}
                  style={{
                    width: '356px',
                    minHeight: '128px',
                    padding: '16px',
                    border: isChecked ? '2px solid #0066cc' : '1px solid #d2d2d2',
                    borderRadius: '16px',
                    backgroundColor: isChecked ? '#f0f7ff' : '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <Checkbox
                      id={`bundle-${bundle.id}`}
                      label={
                        <span style={{ fontSize: '16px', fontWeight: 400 }}>
                          {bundle.name}
                        </span>
                      }
                      isChecked={isChecked}
                      onChange={(_, checked) => handleBundleChange(bundle.id, checked)}
                    />
                    <Popover
                      headerContent={bundle.name}
                      bodyContent={bundle.popoverContent}
                      position="right"
                    >
                      <Button
                        variant="plain"
                        aria-label={`More information about ${bundle.name}`}
                        style={{ padding: '0 4px', marginLeft: '4px' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg
                          aria-hidden="true"
                          focusable="false"
                          data-prefix="far"
                          data-icon="question-circle"
                          className="svg-inline--fa fa-question-circle fa-w-16"
                          role="img"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
                          style={{ width: '16px', height: '16px', color: '#6a6e73' }}
                        >
                          <path
                            fill="currentColor"
                            d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 448c-110.532 0-200-89.431-200-200 0-110.495 89.472-200 200-200 110.491 0 200 89.471 200 200 0 110.53-89.431 200-200 200zm107.244-255.2c0 67.052-72.421 68.084-72.421 92.863V300c0 6.627-5.373 12-12 12h-45.647c-6.627 0-12-5.373-12-12v-8.659c0-35.745 27.1-50.034 47.379-61.516 17.219-9.341 27.507-21.12 27.507-39.445 0-22.112-17.561-40.883-40.887-40.883-23.189 0-33.357 16.211-40.887 32.755-3.179 5.98-9.492 9.245-15.707 7.14l-47.42-13.759c-8.126-2.358-13.484-10.024-11.625-18.207 4.837-21.29 20.075-39.407 41.23-51.432C203.67 98.483 228.441 88 256 88c57.891 0 107.244 47.353 107.244 105.2zM298 378c0 19.882-16.118 36-36 36s-36-16.118-36-36 16.118-36 36-36 36 16.118 36 36z"
                          />
                        </svg>
                      </Button>
                    </Popover>
                  </div>
                  {/* Multiselect dropdown for Observability bundle - aligned with title */}
                  {bundle.id === 'observability' && (
                    <div style={{ marginLeft: '24px', marginTop: '8px', marginBottom: '8px' }}>
                      <Dropdown
                        isOpen={isPersonaMenuOpen}
                        onSelect={() => {}}
                        onOpenChange={(isOpen) => setIsPersonaMenuOpen(isOpen)}
                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                          <MenuToggle
                            ref={toggleRef}
                            onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                            isExpanded={isPersonaMenuOpen}
                            style={{ width: '100%', textAlign: 'left' }}
                          >
                            {getPersonaToggleText()}
                          </MenuToggle>
                        )}
                        popperProps={{
                          appendTo: () => document.body,
                        }}
                      >
                        <DropdownList>
                          {personaOptions.map((persona) => {
                            const isPersonaSelected = selectedPersonas.includes(persona.id);
                            return (
                              <DropdownItem
                                key={persona.id}
                                onClick={(e) => {
                                  e?.stopPropagation();
                                  handlePersonaChange(persona.id);
                                }}
                              >
                                {persona.label}
                              </DropdownItem>
                            );
                          })}
                        </DropdownList>
                      </Dropdown>
                    </div>
                  )}
                  <Content style={{ marginLeft: '24px', marginTop: '0', color: '#6a6e73', fontSize: '14px' }}>
                    {bundle.description}
                  </Content>
                </div>
              );
            })}
          </div>
        </StackItem>

        {/* Single Operators Section */}
        <StackItem>
          <div style={{ marginTop: '24px' }}>
            <ExpandableSection
              toggleText={`Single Operators (${totalCount} | ${selectedCount} selected)`}
              isExpanded={isSingleOperatorsExpanded}
              onToggle={() => setIsSingleOperatorsExpanded(!isSingleOperatorsExpanded)}
            >
              <Stack hasGutter style={{ marginTop: '16px' }}>
                {operatorCategories.map((category) => {
                  const isStorageCategory = category.id === 'storage';
                  const isRecommended = isStorageCategory && recommendedStorageOperators.length > 0;
                  
                  return (
                    <StackItem key={category.id}>
                      <div style={{ marginBottom: '12px' }}>
                        <Title 
                          headingLevel="h3" 
                          size="md" 
                          style={{ 
                            fontSize: '16px', 
                            fontWeight: 'bold',
                            marginBottom: '12px'
                          }}
                        >
                          {category.name}
                        </Title>
                        {/* Alert for storage recommendations */}
                        {isStorageCategory && showStorageRecommendation && (
                          <div style={{ maxWidth: '1100px', marginBottom: '16px' }}>
                            <Alert
                              variant="info"
                              title="Based on your Observability needs, we've pre-selected the optimal storage configuration."
                              style={{ boxShadow: 'none' }}
                            />
                          </div>
                        )}
                        <Stack hasGutter style={{ marginLeft: '16px' }}>
                          {category.operators.map((operator) => {
                            const isChecked = selectedOperators.includes(operator.id);
                            const isRecommended = isStorageCategory && recommendedStorageOperators.includes(operator.id);
                            return (
                              <StackItem key={operator.id}>
                                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                  <Checkbox
                                    id={`operator-${operator.id}`}
                                    isChecked={isChecked}
                                    onChange={(_, checked) => {
                                      // Prevent unchecking required operators
                                      if (operator.required && !checked) {
                                        return;
                                      }
                                      handleOperatorChange(operator.id, checked);
                                    }}
                                    isDisabled={operator.required}
                                    style={{ marginTop: '2px' }}
                                  />
                                  <div style={{ flex: 1, marginLeft: '8px' }}>
                                    {/* First line: Label and info icon */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                      <span style={{ fontSize: '14px' }}>
                                        {operator.name}{operator.required && ' *'}
                                      </span>
                                      {isRecommended && (
                                        <Badge
                                          style={{
                                            backgroundColor: '#0066cc',
                                            color: '#fff',
                                            fontSize: '12px',
                                            padding: '2px 8px',
                                          }}
                                        >
                                          Recommended for Observability
                                        </Badge>
                                      )}
                                      <Popover
                                        headerContent={operator.name}
                                        bodyContent={operator.description}
                                        position="right"
                                      >
                                        <Button
                                          variant="plain"
                                          aria-label={`More information about ${operator.name}`}
                                          style={{ padding: '0 4px' }}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <svg
                                            aria-hidden="true"
                                            focusable="false"
                                            data-prefix="far"
                                            data-icon="question-circle"
                                            className="svg-inline--fa fa-question-circle fa-w-16"
                                            role="img"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 512 512"
                                            style={{ width: '16px', height: '16px', color: '#6a6e73' }}
                                          >
                                            <path
                                              fill="currentColor"
                                              d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 448c-110.532 0-200-89.431-200-200 0-110.495 89.472-200 200-200 110.491 0 200 89.471 200 200 0 110.53-89.431 200-200 200zm107.244-255.2c0 67.052-72.421 68.084-72.421 92.863V300c0 6.627-5.373 12-12 12h-45.647c-6.627 0-12-5.373-12-12v-8.659c0-35.745 27.1-50.034 47.379-61.516 17.219-9.341 27.507-21.12 27.507-39.445 0-22.112-17.561-40.883-40.887-40.883-23.189 0-33.357 16.211-40.887 32.755-3.179 5.98-9.492 9.245-15.707 7.14l-47.42-13.759c-8.126-2.358-13.484-10.024-11.625-18.207 4.837-21.29 20.075-39.407 41.23-51.432C203.67 98.483 228.441 88 256 88c57.891 0 107.244 47.353 107.244 105.2zM298 378c0 19.882-16.118 36-36 36s-36-16.118-36-36 16.118-36 36-36 36 16.118 36 36z"
                                            />
                                          </svg>
                                        </Button>
                                      </Popover>
                                      {operator.developerPreview && (
                                        <Badge 
                                          style={{ 
                                            backgroundColor: '#f8ae54', 
                                            color: '#151515',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '4px 8px'
                                          }}
                                        >
                                          <div style={{
                                            width: '16px',
                                            height: '16px',
                                            borderRadius: '50%',
                                            backgroundColor: '#151515',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                          }}>
                                            <span style={{ 
                                              color: '#f8ae54', 
                                              fontSize: '11px', 
                                              fontWeight: 'bold',
                                              lineHeight: '1',
                                              fontFamily: 'sans-serif'
                                            }}>
                                              i
                                            </span>
                                          </div>
                                          <span style={{ fontWeight: 'normal' }}>Developer Preview</span>
                                        </Badge>
                                      )}
                                    </div>
                                    {/* Second line: Description and Learn more link */}
                                    <div style={{ 
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      flexWrap: 'wrap'
                                    }}>
                                      <span style={{ 
                                        fontSize: '12px', 
                                        color: 'var(--pf-t--global--text--color--regular)'
                                      }}>
                                        {operator.description}
                                      </span>
                                      {operator.learnMoreUrl && (
                                        <a 
                                          href={operator.learnMoreUrl} 
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style={{ 
                                            color: '#0066cc', 
                                            textDecoration: 'none',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            fontSize: '12px'
                                          }}
                                        >
                                          Learn more <ExternalLinkAltIcon style={{ marginLeft: '4px', width: '12px', height: '12px' }} />
                                        </a>
                                      )}
                                    </div>
                                    {/* Warning message */}
                                    {operator.warning && (
                                      <div style={{ 
                                        marginTop: '8px',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '8px'
                                      }}>
                                        <InfoCircleIcon style={{ color: '#f0ab00', marginTop: '2px', flexShrink: 0 }} />
                                        <div style={{ 
                                          fontSize: '12px', 
                                          color: '#6a6e73'
                                        }}>
                                          <strong>Warning alert:</strong> {operator.warning}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </StackItem>
                            );
                          })}
                          {/* Advanced section for Observability category */}
                          {category.id === 'observability' && (
                            <div 
                              ref={advancedSectionRef}
                              style={{ 
                                marginBottom: isAdvancedSectionExpanded ? undefined : 0,
                              }}
                            >
                              <ExpandableSection
                                toggleText={`Advanced settings (${totalAdvancedCount} | ${selectedAdvancedCount} selected)`}
                                isExpanded={isAdvancedSectionExpanded}
                                onToggle={() => setIsAdvancedSectionExpanded(!isAdvancedSectionExpanded)}
                              >
                                <Stack hasGutter style={{ marginTop: '16px', marginLeft: '16px' }}>
                                  <StackItem>
                                    <Title headingLevel="h4" size="md" style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                                      Console experience (UI Plugins and components)
                                    </Title>
                                    <Content style={{ fontSize: '14px', color: '#6a6e73', marginBottom: '16px' }}>
                                      Select UI plugins to enhance your console experience
                                    </Content>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                      <Switch
                                        id="advanced-mode"
                                        label="Advanced mode"
                                        isChecked={isAdvancedModeEnabled}
                                        onChange={(_event, checked) => setIsAdvancedModeEnabled(checked)}
                                      />
                                    </div>
                                  </StackItem>
                                  {advancedUIOptions.map((option) => {
                                    const isChecked = selectedAdvancedOptions.includes(option.id);
                                    const isRecommended = recommendedAdvancedOptions.includes(option.id);
                                    // Disable if the option is recommended (auto-selected) AND Advanced mode is OFF
                                    const isDisabled = isRecommended && !isAdvancedModeEnabled;
                                    
                                    return (
                                      <StackItem key={option.id}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                          <Checkbox
                                            id={`advanced-${option.id}`}
                                            isChecked={isChecked}
                                            isDisabled={isDisabled}
                                            onChange={(_, checked) => {
                                              // Prevent changes when disabled
                                              if (isDisabled) return;
                                              
                                              if (checked) {
                                                setSelectedAdvancedOptions([...selectedAdvancedOptions, option.id]);
                                              } else {
                                                setSelectedAdvancedOptions(selectedAdvancedOptions.filter(id => id !== option.id));
                                              }
                                            }}
                                            style={{ marginTop: '2px' }}
                                          />
                                          <div style={{ flex: 1, marginLeft: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                              <span style={{ fontSize: '14px' }}>
                                                {option.name}
                                              </span>
                                            </div>
                                            <div style={{ 
                                              fontSize: '12px', 
                                              color: 'var(--pf-t--global--text--color--regular)',
                                              marginTop: '4px'
                                            }}>
                                              {option.description}
                                            </div>
                                          </div>
                                        </div>
                                      </StackItem>
                                    );
                                  })}
                                </Stack>
                              </ExpandableSection>
                            </div>
                          )}
                        </Stack>
                      </div>
                    </StackItem>
                  );
                })}
              </Stack>
            </ExpandableSection>
          </div>
        </StackItem>
      </Stack>
    </div>
  );
};

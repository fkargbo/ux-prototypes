import React, { useState, useEffect, useMemo } from 'react';
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
  Flex,
  FlexItem,
  Switch,
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
  selectedPersona: string | null;
  selectedCapabilities: string[];
  selectedNestedOptions: { [capabilityId: string]: string[] };
  advancedMode: boolean;
  selectedUIPlugins: string[];
}

interface Step2ObservabilityComponentsProps {
  data: WizardData;
  onDataChange: (data: Partial<WizardData>) => void;
}

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
    name: 'Metrics & Alerting (Core Stack)',
    description: 'Prometheus, Alertmanager, Monitoring UI.',
    required: true,
  },
  {
    id: 'thanos',
    name: 'Enable Long-term Storage (Thanos)',
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
    id: 'tempo',
    name: 'Distributed Tracing (Tempo)',
    description: 'Track requests across microservices for latency analysis.',
  },
  {
    id: 'network-traffic',
    name: 'Network Traffic Analysis',
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
    name: 'Monitoring UI Plugin',
    description: 'Metrics dashboards.',
    defaultEnabled: true,
    dependencies: ['metrics-alerting'],
  },
  {
    id: 'logging-ui',
    name: 'Logging UI Plugin',
    description: 'Log exploration.',
    defaultEnabled: false,
    dependencies: ['loki'],
  },
  {
    id: 'tracing-ui',
    name: 'Tracing UI Plugin',
    description: 'Distributed traces.',
    defaultEnabled: false,
    dependencies: ['tempo'],
  },
  {
    id: 'troubleshooting-panel',
    name: 'Troubleshooting Panel',
    description: 'Signal correlation.',
    defaultEnabled: false,
    dependencies: ['korrel8r'],
  },
  {
    id: 'perses',
    name: 'Perses Dashboards Operator',
    description: 'Build custom dashboards for SLO/SLI tracking and fleet-wide status visualization.',
    defaultEnabled: false,
    dependencies: ['metrics-alerting'],
  },
];

export const Step2ObservabilityComponents: React.FC<Step2ObservabilityComponentsProps> = ({
  data,
  onDataChange,
}) => {
  const [selectedPersona, setSelectedPersona] = useState<string | null>(data.selectedPersona);
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>(data.selectedCapabilities);
  const [selectedNestedOptions, setSelectedNestedOptions] = useState<{ [key: string]: string[] }>(
    data.selectedNestedOptions || {}
  );
  const [advancedMode, setAdvancedMode] = useState(data.advancedMode || false);
  const [selectedUIPlugins, setSelectedUIPlugins] = useState<string[]>(
    data.selectedUIPlugins || ['monitoring-ui']
  );

  // Sync data prop changes to local state when props change
  // This ensures local state stays in sync if user navigates away and back
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
      const personaSpecificCapabilities = ['thanos', 'loki', 'tempo', 'korrel8r'];
      
      // Start with required capabilities
      let autoCapabilities: string[] = ['metrics-alerting']; // Always required
      
      // Add persona-specific capabilities
      if (selectedPersona === 'administrator') {
        autoCapabilities.push('thanos', 'loki');
      } else if (selectedPersona === 'sre') {
        autoCapabilities.push('thanos', 'loki', 'tempo', 'korrel8r');
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
      
      // Auto-select UI plugins based on persona
      // Perses is auto-selected for Administrator and SRE personas
      // Only add plugins if their dependencies are satisfied
      let autoUIPlugins: string[] = [];
      
      // monitoring-ui requires metrics-alerting
      if (uniqueCapabilities.includes('metrics-alerting')) {
        autoUIPlugins.push('monitoring-ui');
      }
      
      // Perses requires metrics-alerting and is auto-selected for Administrator and SRE personas
      if (uniqueCapabilities.includes('metrics-alerting') && 
          (selectedPersona === 'administrator' || selectedPersona === 'sre')) {
        autoUIPlugins.push('perses');
      }
      
      // Preserve manually-selected UI plugins that are NOT persona-specific
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const manuallySelectedPlugins = selectedUIPlugins.filter(
        pluginId => pluginId !== 'perses' && pluginId !== 'monitoring-ui'
      );
      
      // Merge persona auto-plugins with manually-selected ones
      const mergedPlugins = [...autoUIPlugins, ...manuallySelectedPlugins];
      // Remove duplicates
      const uniquePlugins = Array.from(new Set(mergedPlugins));
      
      setSelectedUIPlugins(uniquePlugins);
      onDataChange({ selectedUIPlugins: uniquePlugins });
    }
  }, [selectedPersona, onDataChange]);

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
    
    let newCapabilities: string[];
    
    if (checked) {
      newCapabilities = [...selectedCapabilities, capabilityId];
    } else {
      newCapabilities = selectedCapabilities.filter(id => id !== capabilityId);
      // Remove nested options when parent is unchecked
      if (selectedNestedOptions[capabilityId]) {
        const newNestedOptions = { ...selectedNestedOptions };
        delete newNestedOptions[capabilityId];
        setSelectedNestedOptions(newNestedOptions);
        onDataChange({ selectedNestedOptions: newNestedOptions });
      }
      
      // If metrics-alerting is unchecked, remove UI plugins that depend on it
      if (capabilityId === 'metrics-alerting') {
        const pluginsToRemove = ['monitoring-ui', 'perses'];
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
    
    // When advanced mode is enabled, auto-select all available plugins
    if (checked) {
      const autoSelected = availablePlugins.map(p => p.id);
      setSelectedUIPlugins(autoSelected);
      onDataChange({ selectedUIPlugins: autoSelected });
    } else {
      // When disabled, only keep monitoring-ui if metrics-alerting is selected
      const defaultSelected = selectedCapabilities.includes('metrics-alerting')
        ? ['monitoring-ui']
        : [];
      setSelectedUIPlugins(defaultSelected);
      onDataChange({ selectedUIPlugins: defaultSelected });
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
    <div style={{ maxWidth: '800px' }}>
      <Stack hasGutter>
        {/* Form Title */}
        <StackItem>
          <Title headingLevel="h2" size="2xl" style={{ fontSize: '24px', marginBottom: '24px' }}>
            Components and configuration
          </Title>
        </StackItem>
        
        {/* Persona Selection Section */}
        <StackItem>
          <Title headingLevel="h2" size="lg" style={{ marginBottom: '8px' }}>
            Choose your Observability strategy
          </Title>
          <Content style={{ marginBottom: '24px', color: '#6a6e73' }}>
            Select an operational focus to pre-configure the recommended stack. You can customize specific components later.
          </Content>
          
          <Grid hasGutter>
            {personas.map((persona) => (
              <GridItem key={persona.id} span={4}>
                <Card
                  isSelectable
                  isSelected={selectedPersona === persona.id}
                  onClick={() => handlePersonaChange(persona.id)}
                  style={{
                    cursor: 'pointer',
                    height: '100%',
                    border: selectedPersona === persona.id ? '2px solid #0066cc' : '1px solid #d2d2d2',
                  }}
                >
                  <CardBody>
                    <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                      <FlexItem>
                        <Radio
                          id={`persona-${persona.id}`}
                          name="persona"
                          label={<span style={{ fontWeight: '600' }}>{persona.name}</span>}
                          isChecked={selectedPersona === persona.id}
                          onChange={() => handlePersonaChange(persona.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </FlexItem>
                      <FlexItem>
                        <Content style={{ fontSize: '14px', color: '#6a6e73' }}>
                          {persona.description}
                        </Content>
                      </FlexItem>
                    </Flex>
                  </CardBody>
                </Card>
              </GridItem>
            ))}
          </Grid>
        </StackItem>

        <Divider />

        {/* Capabilities Section */}
        <StackItem>
          <Title headingLevel="h2" size="lg" style={{ marginBottom: '8px' }}>
            Customize Capabilities
          </Title>
          <Content style={{ marginBottom: '24px', color: '#6a6e73' }}>
            Fine-tune which observability features to install based on your needs.
          </Content>

          <Stack hasGutter>
            {capabilities.map((capability) => {
              const isChecked = selectedCapabilities.includes(capability.id);
              const isRequired = capability.required || false;
              const dependencyCheck = checkDependencies(capability);
              const canEnable = dependencyCheck.satisfied || isChecked;

              return (
                <StackItem key={capability.id}>
                  <Card>
                    <CardBody>
                      <Stack hasGutter>
                        <StackItem>
                          <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsFlexStart' }}>
                            <FlexItem>
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
                            </FlexItem>
                          </Flex>
                          <Content style={{ marginLeft: '24px', marginTop: '8px', fontSize: '14px', color: '#6a6e73' }}>
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
                        </StackItem>

                        {/* Nested Options */}
                        {isChecked && capability.nestedOptions && capability.nestedOptions.length > 0 && (
                          <StackItem style={{ marginLeft: '24px', paddingLeft: '16px', borderLeft: '2px solid #d2d2d2' }}>
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
                          </StackItem>
                        )}
                      </Stack>
                    </CardBody>
                  </Card>
                </StackItem>
              );
            })}
          </Stack>
        </StackItem>

        <Divider />

        {/* Console Experience Section */}
        <StackItem>
          <Title headingLevel="h2" size="lg" style={{ marginBottom: '8px' }}>
            Console experience (UI Plugins)
          </Title>
          <Content style={{ marginBottom: '24px', color: '#6a6e73' }}>
            Select UI plugins to enhance your console experience.
          </Content>

          <Card>
            <CardBody>
              <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '16px' }}>
                <FlexItem>
                  <Content style={{ fontWeight: '600', fontSize: '14px' }}>
                    Console experience (UI Plugins)
                  </Content>
                </FlexItem>
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
                  const isEnabled = advancedMode || plugin.defaultEnabled;

                  return (
                    <StackItem key={plugin.id}>
                      <Checkbox
                        id={`plugin-${plugin.id}`}
                        label={<span style={{ fontWeight: '600', fontSize: '14px' }}>{plugin.name}</span>}
                        isChecked={isChecked}
                        isDisabled={!advancedMode && !plugin.defaultEnabled}
                        onChange={(_, checked) => handleUIPluginChange(plugin.id, checked)}
                      />
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


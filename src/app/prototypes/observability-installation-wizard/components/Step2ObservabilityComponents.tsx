import React, { useState, useEffect } from 'react';
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
    name: 'Administrator',
    icon: <UserIcon />,
    focus: 'Governance & Compliance',
    description: 'Platform stability, capacity planning, audit logs, and network policy validation.',
  },
  {
    id: 'sre',
    name: 'SRE',
    icon: <ChartLineIcon />,
    focus: 'Reliability & MTTR',
    description: 'Full-stack debugging, SLO tracking, distributed tracing, and automated root cause analysis.',
  },
  {
    id: 'developer',
    name: 'Developer',
    icon: <CodeIcon />,
    focus: 'App Debugging & Tracing',
    description: 'Application performance, error tracking, transaction tracing, and namespace-scoped views.',
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
        name: 'Infrastructure Logs',
        description: 'Node, API server, and control plane logs.',
      },
      {
        id: 'application-logs',
        name: 'Application Logs',
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

export const Step2ObservabilityComponents: React.FC<Step2ObservabilityComponentsProps> = ({
  data,
  onDataChange,
}) => {
  const [selectedPersona, setSelectedPersona] = useState<string | null>(data.selectedPersona);
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>(data.selectedCapabilities);
  const [selectedNestedOptions, setSelectedNestedOptions] = useState<{ [key: string]: string[] }>(
    data.selectedNestedOptions || {}
  );

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

  return (
    <div style={{ maxWidth: '800px' }}>
      <Stack hasGutter>
        {/* Persona Selection Section */}
        <StackItem>
          <Title headingLevel="h2" size="lg" style={{ marginBottom: '8px' }}>
            Choose a Starting Profile (Optional)
          </Title>
          <Content style={{ marginBottom: '24px', color: '#6a6e73' }}>
            Select a persona to pre-configure the recommended stack. You can customize this later.
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
                        <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                          <FlexItem style={{ color: '#0066cc', fontSize: '24px' }}>
                            {persona.icon}
                          </FlexItem>
                          <FlexItem>
                            <Radio
                              id={`persona-${persona.id}`}
                              name="persona"
                              label={persona.name}
                              isChecked={selectedPersona === persona.id}
                              onChange={() => handlePersonaChange(persona.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </FlexItem>
                        </Flex>
                      </FlexItem>
                      <FlexItem>
                        <Content style={{ fontWeight: '600', fontSize: '14px', color: '#151515' }}>
                          {persona.focus}
                        </Content>
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
                                label={capability.name}
                                isChecked={isChecked}
                                isDisabled={(!canEnable && !isChecked) || (isRequired && isChecked)}
                                onChange={(_, checked) => handleCapabilityChange(capability.id, checked)}
                              />
                              {isRequired && (
                                <Content style={{ fontSize: '12px', color: '#6a6e73', marginLeft: '24px', marginTop: '4px' }}>
                                  (Required)
                                </Content>
                              )}
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
                                    label={option.name}
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
      </Stack>
    </div>
  );
};


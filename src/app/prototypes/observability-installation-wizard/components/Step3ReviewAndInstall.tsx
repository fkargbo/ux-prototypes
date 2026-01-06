import React, { useMemo } from 'react';
import {
  Title,
  Content,
  Card,
  CardBody,
  CardTitle,
  Stack,
  StackItem,
  List,
  ListItem,
  Flex,
  FlexItem,
  Divider,
  Badge,
  Popover,
  Icon,
  Button,
} from '@patternfly/react-core';
import {
  CpuIcon,
  MemoryIcon,
  RocketIcon,
  InfoCircleIcon,
} from '@patternfly/react-icons';
import { WizardData } from './Step2ObservabilityComponents';

interface Step3ReviewAndInstallProps {
  data: WizardData;
  onDataChange: (data: Partial<WizardData>) => void;
}

// UI Plugin definitions (matching Step2ObservabilityComponents)
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
    name: 'Custom dashboards UI (Perses)',
    description: 'Enables the Perses dashboard engine for creating and visualizing custom metrics and dashboards directly in the Console.',
    defaultEnabled: false,
    dependencies: ['metrics-alerting'],
  },
];

export const Step3ReviewAndInstall: React.FC<Step3ReviewAndInstallProps> = ({
  data,
  onDataChange,
}) => {
  // Calculate resources based on selected capabilities
  const resources = useMemo(() => {
    let cpu = 2; // Base CPU
    let ram = 4; // Base RAM in GB

    if (data.selectedCapabilities.includes('thanos')) {
      cpu += 1;
      ram += 2;
    }
    if (data.selectedCapabilities.includes('loki')) {
      cpu += 1;
      ram += 2;
    }
    if (data.selectedCapabilities.includes('tempo')) {
      cpu += 1;
      ram += 1;
    }
    if (data.selectedCapabilities.includes('network-traffic')) {
      cpu += 0.5;
      ram += 1;
    }
    if (data.selectedCapabilities.includes('korrel8r')) {
      cpu += 0.5;
      ram += 1;
    }

    return { cpu, ram };
  }, [data.selectedCapabilities]);

  // Get operators to install based on selected capabilities from Step 2
  // Maps each selected capability to its corresponding operator
  const operatorsToInstall = useMemo(() => {
    const operators: string[] = [];
    
    if (!data.selectedCapabilities || !Array.isArray(data.selectedCapabilities)) {
      return operators;
    }
    
    // Cluster Observability Operator - included if metrics-alerting is selected (required)
    // This operator includes: Prometheus, Alertmanager, and optionally Thanos and Korrel8r as operands
    // Note: thanos and korrel8r are operands of Cluster Observability Operator, not separate operators
    if (data.selectedCapabilities.includes('metrics-alerting')) {
      operators.push('Cluster Observability Operator');
    }
    
    // Map capabilities to their corresponding operators
    const capabilityToOperatorMap: { [key: string]: string } = {
      'loki': 'Loki Operator',
      'tempo': 'Tempo Operator',
      'network-traffic': 'Network Observability Operator',
    };
    
    // Add operators for each selected capability
    data.selectedCapabilities.forEach(capabilityId => {
      // Skip thanos and korrel8r as they are operands of Cluster Observability Operator, not separate operators
      if (capabilityId === 'thanos' || capabilityId === 'korrel8r') {
        return;
      }
      
      const operator = capabilityToOperatorMap[capabilityId];
      if (operator && !operators.includes(operator)) {
        operators.push(operator);
      }
    });
    
    return operators;
  }, [data.selectedCapabilities]);

  // Get UI components to install based on selected UI plugins from Step 2
  const uiComponentsToInstall = useMemo(() => {
    const components: string[] = [];
    
    if (!data.selectedUIPlugins || !Array.isArray(data.selectedUIPlugins)) {
      return components;
    }
    
    // Map selected UI plugin IDs to their names
    data.selectedUIPlugins.forEach(pluginId => {
      const plugin = uiPlugins.find(p => p.id === pluginId);
      if (plugin && !components.includes(plugin.name)) {
        components.push(plugin.name);
      }
    });
    
    return components;
  }, [data.selectedUIPlugins]);

  return (
    <div style={{ maxWidth: '800px' }}>
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h2" size="2xl" style={{ fontSize: '24px', marginBottom: '24px' }}>
            Review and Install
          </Title>
        </StackItem>

        {/* Installation Details */}
        <StackItem>
          <Card>
            <CardTitle>Installation details</CardTitle>
            <CardBody>
              <List>
                <ListItem>
                  <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>
                      <Content style={{ fontWeight: '600', fontSize: '14px' }}>Namespace:</Content>
                    </FlexItem>
                    <FlexItem>
                      <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }} style={{ display: 'inline-flex' }}>
                        <FlexItem>
                          <Badge style={{ backgroundColor: '#1e4f18', color: '#fff', marginRight: '4px' }}>PR</Badge>
                        </FlexItem>
                        <FlexItem>
                          <Content style={{ fontSize: '14px', fontWeight: '600' }}>
                            {data.installationNamespace === 'recommended'
                              ? 'openshift-cluster-observability-operator'
                              : data.selectedProject || 'Not selected'}
                          </Content>
                        </FlexItem>
                      </Flex>
                    </FlexItem>
                  </Flex>
                </ListItem>
                <ListItem>
                  <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>
                      <Content style={{ fontWeight: '600', fontSize: '14px' }}>Scope:</Content>
                    </FlexItem>
                    <FlexItem>
                      <Content style={{ fontSize: '14px' }}>
                        {data.installationMode === 'all-namespaces' ? 'All namespaces' : 'A specific namespace'}
                      </Content>
                    </FlexItem>
                  </Flex>
                </ListItem>
                <ListItem>
                  <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>
                      <Content style={{ fontWeight: '600', fontSize: '14px' }}>Cluster monitoring (recommended):</Content>
                    </FlexItem>
                    <FlexItem>
                      <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                        <FlexItem>
                          <Content style={{ fontSize: '14px' }}>
                            {data.enableClusterMonitoring ? 'Enabled' : 'Disabled'}
                          </Content>
                        </FlexItem>
                        {!data.enableClusterMonitoring && 
                         (data.selectedPersona === 'administrator' || data.selectedPersona === 'sre') && (
                          <FlexItem>
                            <Popover
                              headerContent="Cluster monitoring disabled"
                              bodyContent="You might miss critical alerts regarding the health of the Observability Operator itself. For high availability environments, enabling cluster monitoring is recommended."
                              position="right"
                            >
                              <Button variant="plain" aria-label="More info about cluster monitoring" style={{ padding: '0 4px' }}>
                                <Icon status="info">
                                  <InfoCircleIcon />
                                </Icon>
                              </Button>
                            </Popover>
                          </FlexItem>
                        )}
                      </Flex>
                    </FlexItem>
                  </Flex>
                </ListItem>
                <ListItem>
                  <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>
                      <Content style={{ fontWeight: '600', fontSize: '14px' }}>Update Channel:</Content>
                    </FlexItem>
                    <FlexItem>
                      <Content style={{ fontSize: '14px' }}>{data.updateChannel || 'stable'}</Content>
                    </FlexItem>
                  </Flex>
                </ListItem>
                <ListItem>
                  <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>
                      <Content style={{ fontWeight: '600', fontSize: '14px' }}>Update approval:</Content>
                    </FlexItem>
                    <FlexItem>
                      <Content style={{ fontSize: '14px' }}>
                        {data.updateApproval === 'automatic' ? 'Automatic' : 'Manual'}
                      </Content>
                    </FlexItem>
                  </Flex>
                </ListItem>
              </List>
            </CardBody>
          </Card>
        </StackItem>

        {/* Operators to Install */}
        <StackItem>
          <Card>
            <CardTitle>Operators to install</CardTitle>
            <CardBody>
              {operatorsToInstall.length > 0 ? (
                <List>
                  {operatorsToInstall.map((operator) => (
                    <ListItem key={operator}>{operator}</ListItem>
                  ))}
                </List>
              ) : (
                <Content style={{ color: '#6a6e73' }}>
                  No operators selected. Please go back to Step 2 to select capabilities.
                </Content>
              )}
            </CardBody>
          </Card>
        </StackItem>

        {/* UI Components to Install */}
        <StackItem>
          <Card>
            <CardTitle>UI components to install</CardTitle>
            <CardBody>
              {uiComponentsToInstall.length > 0 ? (
                <List>
                  {uiComponentsToInstall.map((component) => (
                    <ListItem key={component}>{component}</ListItem>
                  ))}
                </List>
              ) : (
                <Content style={{ color: '#6a6e73' }}>
                  No UI components selected. Please go back to Step 2 to select UI plugins.
                </Content>
              )}
            </CardBody>
          </Card>
        </StackItem>

        {/* Estimated Resources */}
        <StackItem>
          <Card>
            <CardTitle>Estimated resources</CardTitle>
            <CardBody>
              <Flex spaceItems={{ default: 'spaceItemsLg' }}>
                <FlexItem>
                  <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>
                      <CpuIcon style={{ fontSize: '20px', color: '#6a6e73' }} />
                    </FlexItem>
                    <FlexItem>
                      <Content style={{ fontSize: '16px', fontWeight: '600' }}>
                        {resources.cpu} CPU
                      </Content>
                    </FlexItem>
                  </Flex>
                </FlexItem>
                <FlexItem>
                  <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>
                      <MemoryIcon style={{ fontSize: '20px', color: '#6a6e73' }} />
                    </FlexItem>
                    <FlexItem>
                      <Content style={{ fontSize: '16px', fontWeight: '600' }}>
                        {resources.ram} GB RAM
                      </Content>
                    </FlexItem>
                  </Flex>
                </FlexItem>
              </Flex>
            </CardBody>
          </Card>
        </StackItem>

      </Stack>
    </div>
  );
};


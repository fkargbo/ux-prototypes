import React, { useState, useMemo } from 'react';
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
  Switch,
  Checkbox,
} from '@patternfly/react-core';
import {
  CpuIcon,
  MemoryIcon,
  RocketIcon,
} from '@patternfly/react-icons';
import { WizardData } from './Step2ObservabilityComponents';

interface Step3ReviewAndInstallProps {
  data: WizardData;
  onDataChange: (data: Partial<WizardData>) => void;
}

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
];

export const Step3ReviewAndInstall: React.FC<Step3ReviewAndInstallProps> = ({
  data,
  onDataChange,
}) => {
  const [advancedMode, setAdvancedMode] = useState(data.advancedMode || false);
  const [selectedUIPlugins, setSelectedUIPlugins] = useState<string[]>(
    data.selectedUIPlugins || ['monitoring-ui']
  );

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

  // Get operators to install
  const operatorsToInstall = useMemo(() => {
    const operators: string[] = ['Cluster Observability Operator'];
    
    if (data.selectedCapabilities.includes('loki')) {
      operators.push('Loki Operator');
    }
    if (data.selectedCapabilities.includes('tempo')) {
      operators.push('Tempo Operator');
    }
    if (data.selectedCapabilities.includes('network-traffic')) {
      operators.push('Network Observability Operator');
    }
    
    return operators;
  }, [data.selectedCapabilities]);

  // Auto-enable/disable UI plugins based on dependencies
  const availablePlugins = useMemo(() => {
    return uiPlugins.filter(plugin => {
      if (!plugin.dependencies || plugin.dependencies.length === 0) {
        return true;
      }
      return plugin.dependencies.some(dep => data.selectedCapabilities.includes(dep));
    });
  }, [data.selectedCapabilities]);

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
      const defaultSelected = data.selectedCapabilities.includes('metrics-alerting')
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
        <StackItem>
          <Title headingLevel="h2" size="lg" style={{ marginBottom: '24px' }}>
            Review and Install
          </Title>
        </StackItem>

        {/* Operators to Install */}
        <StackItem>
          <Card>
            <CardTitle>OPERATORS TO INSTALL</CardTitle>
            <CardBody>
              <List>
                {operatorsToInstall.map((operator) => (
                  <ListItem key={operator}>{operator}</ListItem>
                ))}
              </List>
            </CardBody>
          </Card>
        </StackItem>

        {/* Estimated Resources */}
        <StackItem>
          <Card>
            <CardTitle>ESTIMATED RESOURCES</CardTitle>
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

        {/* Console Experience */}
        <StackItem>
          <Card>
            <CardBody>
              <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '16px' }}>
                <FlexItem>
                  <CardTitle>CONSOLE EXPERIENCE (UI PLUGINS)</CardTitle>
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
                        label={plugin.name}
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


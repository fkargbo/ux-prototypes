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
    console.log('Step 3 - Selected capabilities:', data.selectedCapabilities);
    
    const operators: string[] = [];
    
    // Cluster Observability Operator - always included (metrics-alerting is required)
    // This operator includes: Prometheus, Alertmanager, and optionally Thanos and Korrel8r as operands
    // Check if metrics-alerting is selected (it should always be since it's required)
    if (data.selectedCapabilities && data.selectedCapabilities.includes('metrics-alerting')) {
      operators.push('Cluster Observability Operator');
    }
    
    // Map capabilities to their corresponding operators
    const capabilityToOperatorMap: { [key: string]: string } = {
      'loki': 'Loki Operator',
      'tempo': 'Tempo Operator',
      'network-traffic': 'Network Observability Operator',
    };
    
    // Add operators for each selected capability
    if (data.selectedCapabilities && Array.isArray(data.selectedCapabilities)) {
      data.selectedCapabilities.forEach(capabilityId => {
        const operator = capabilityToOperatorMap[capabilityId];
        if (operator && !operators.includes(operator)) {
          operators.push(operator);
        }
      });
    }
    
    console.log('Step 3 - Operators to install:', operators);
    return operators;
  }, [data.selectedCapabilities]);

  return (
    <div style={{ maxWidth: '800px' }}>
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h2" size="2xl" style={{ fontSize: '24px', marginBottom: '24px' }}>
            Review and Install
          </Title>
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


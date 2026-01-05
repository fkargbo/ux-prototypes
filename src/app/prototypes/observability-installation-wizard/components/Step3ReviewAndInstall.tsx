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

      </Stack>
    </div>
  );
};


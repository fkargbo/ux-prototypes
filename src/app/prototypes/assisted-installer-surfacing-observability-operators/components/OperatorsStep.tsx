import React, { useState } from 'react';
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
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

interface Operator {
  id: string;
  name: string;
  description: string;
  developerPreview?: boolean;
  learnMoreUrl?: string;
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
      { id: 'local-storage', name: 'Local Storage Operator', description: 'Provides persistent storage using local volumes.' },
      { id: 'lvm-storage', name: 'Logical Volume Manager Storage', description: 'Manages logical volumes for storage.' },
      { id: 'odf', name: 'OpenShift Data Foundation', description: 'Provides software-defined storage for containers.' },
      { id: 'oadp', name: 'OADP', description: 'OpenShift API for Data Protection.' },
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

export const OperatorsStep: React.FC<OperatorsStepProps> = ({
  selectedBundles,
  selectedOperators,
  onBundlesChange,
  onOperatorsChange,
}) => {
  const [isSingleOperatorsExpanded, setIsSingleOperatorsExpanded] = useState<boolean>(true);


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

  const selectedCount = selectedOperators.length;
  const totalCount = operatorCategories.reduce((sum, cat) => sum + cat.operators.length, 0);

  return (
    <div style={{ maxWidth: '900px' }}>
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
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {bundles.map((bundle) => {
              const isChecked = selectedBundles.includes(bundle.id);
              return (
                <div
                  key={bundle.id}
                  style={{
                    width: '356px',
                    height: '128px',
                    padding: '16px',
                    border: isChecked ? '2px solid #0066cc' : '1px solid #d2d2d2',
                    borderRadius: '4px',
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
                        <Stack hasGutter style={{ marginLeft: '16px' }}>
                          {category.operators.map((operator) => {
                            const isChecked = selectedOperators.includes(operator.id);
                            return (
                              <StackItem key={operator.id}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                  <Checkbox
                                    id={`operator-${operator.id}`}
                                    label={operator.name}
                                    isChecked={isChecked}
                                    onChange={(_, checked) => handleOperatorChange(operator.id, checked)}
                                  />
                                  <div style={{ flex: 1, marginLeft: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                      {operator.developerPreview && (
                                        <Badge style={{ backgroundColor: '#8b8d8f', color: 'white' }}>
                                          Developer Preview
                                        </Badge>
                                      )}
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
                                            fontSize: '14px'
                                          }}
                                        >
                                          Learn more <ExternalLinkAltIcon style={{ marginLeft: '4px' }} />
                                        </a>
                                      )}
                                    </div>
                                    <Content style={{ color: '#6a6e73', fontSize: '14px' }}>
                                      {operator.description}
                                    </Content>
                                  </div>
                                </div>
                              </StackItem>
                            );
                          })}
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

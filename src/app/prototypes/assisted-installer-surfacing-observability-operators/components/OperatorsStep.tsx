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
  },
  {
    id: 'openshift-ai',
    name: 'OpenShift AI',
    description: 'Train, serve, monitor and manage AI/ML models and applications using GPUs.',
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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['storage']));

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

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
          <Grid hasGutter>
            {bundles.map((bundle) => {
              const isChecked = selectedBundles.includes(bundle.id);
              return (
                <GridItem key={bundle.id} span={6}>
                  <div
                    style={{
                      padding: '16px',
                      border: isChecked ? '2px solid #0066cc' : '1px solid #d2d2d2',
                      borderRadius: '4px',
                      backgroundColor: isChecked ? '#f0f7ff' : '#fff',
                      height: '100%',
                    }}
                  >
                    <Checkbox
                      id={`bundle-${bundle.id}`}
                      label={bundle.name}
                      isChecked={isChecked}
                      onChange={(_, checked) => handleBundleChange(bundle.id, checked)}
                    />
                    <Content style={{ marginLeft: '24px', marginTop: '8px', color: '#6a6e73', fontSize: '14px' }}>
                      {bundle.description}
                    </Content>
                  </div>
                </GridItem>
              );
            })}
          </Grid>
        </StackItem>

        {/* Single Operators Section */}
        <StackItem>
          <div style={{ marginTop: '24px' }}>
            <Title headingLevel="h2" size="lg" style={{ marginBottom: '16px' }}>
              Single Operators ({totalCount} | {selectedCount} selected)
            </Title>
            <Stack hasGutter style={{ marginTop: '16px' }}>
              {operatorCategories.map((category) => {
                const isExpanded = expandedCategories.has(category.id);
                return (
                  <StackItem key={category.id}>
                    <ExpandableSection
                      toggleText={category.name}
                      isExpanded={isExpanded}
                      onToggle={() => toggleCategory(category.id)}
                    >
                      <Stack hasGutter style={{ marginTop: '12px', marginLeft: '16px' }}>
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
                    </ExpandableSection>
                  </StackItem>
                );
              })}
            </Stack>
          </div>
        </StackItem>
      </Stack>
    </div>
  );
};

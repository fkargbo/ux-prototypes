import React, { useState, useMemo, useEffect } from 'react';
import {
  Title,
  Content,
  Form,
  FormGroup,
  Radio,
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  MenuToggleElement,
  Alert,
  AlertVariant,
  Checkbox,
  Card,
  CardBody,
  CardTitle,
  Stack,
  StackItem,
  Grid,
  GridItem,
  Flex,
  FlexItem,
  Badge,
  TextInput,
  SearchInput,
} from '@patternfly/react-core';

interface Step1InstallationDetailsProps {
  data?: any;
  onDataChange?: (data: any) => void;
}

interface ProvidedAPI {
  id: string;
  name: string;
  abbreviation: string;
  description: string;
}

const providedAPIs: ProvidedAPI[] = [
  {
    id: 'podmonitor',
    name: 'PodMonitor',
    abbreviation: 'PM',
    description: 'PodMonitor defines monitoring for a set of pods.',
  },
  {
    id: 'probe',
    name: 'Probe',
    abbreviation: 'P',
    description: 'Probe defines monitoring for a set of static targets or ingresses.',
  },
  {
    id: 'prometheusrule',
    name: 'PrometheusRule',
    abbreviation: 'PR',
    description: 'PrometheusRule defines recording and alerting rules for a Prometheus instance.',
  },
  {
    id: 'servicemonitor',
    name: 'ServiceMonitor',
    abbreviation: 'SM',
    description: 'ServiceMonitor defines monitoring for a set of services.',
  },
  {
    id: 'alertmanagerconfig',
    name: 'AlertmanagerConfig',
    abbreviation: 'AC',
    description: 'AlertmanagerConfig configures the Prometheus Alertmanager, specifying how alerts should be grouped, inhibited and notified to external systems.',
  },
  {
    id: 'monitoringstack',
    name: 'MonitoringStack',
    abbreviation: 'MS',
    description: 'MonitoringStack is the Schema for the monitoringstacks API.',
  },
  {
    id: 'observabilityinstaller',
    name: 'Observability Installer',
    abbreviation: 'IO',
    description: 'Provides end-to-end observability capabilities with minimal configuration. Simplifies deployment and management of observability components such as tracing.',
  },
  {
    id: 'persesdashboard',
    name: 'PersesDashboard',
    abbreviation: 'PD',
    description: 'PersesDashboard defines the layout, visualization panels, and query variables for custom metrics dashboards within the OpenShift console.',
  },
  {
    id: 'persesdatasource',
    name: 'PersesDatasource',
    abbreviation: 'PD',
    description: 'PersesDatasource configures the connection between the Perses dashboard engine and a specific metrics backend, such as a Prometheus or Thanos instance.',
  },
  {
    id: 'scrapeconfig',
    name: 'ScrapeConfig',
    abbreviation: 'SC',
    description: 'ScrapeConfig defines a namespaced Prometheus scrape_config to be aggregated across multiple namespaces into the Prometheus configuration.',
  },
  {
    id: 'thanosquerier',
    name: 'ThanosQuerier',
    abbreviation: 'TQ',
    description: 'ThanosQuerier outlines the Thanos querier components, managed by this stack.',
  },
  {
    id: 'uiplugin',
    name: 'UIPlugin',
    abbreviation: 'UIP',
    description: 'UIPlugin defines a console plugin for observability.',
  },
  {
    id: 'incidentdetection',
    name: 'Incident Detection (Native)',
    abbreviation: 'ID',
    description: 'Automatically groups correlated alerts into high-level incidents using a native analysis engine built into the Cluster Observability Operator. It provides a visual, color-coded timeline to help you identify the probable root cause and reduce alert fatigue during \'storm\' events.',
  },
  {
    id: 'telemetrypipeline',
    name: 'Telemetry Pipeline (OpenTelemetry)',
    abbreviation: 'OP',
    description: 'Deploys a standardized, vendor-neutral pipeline for receiving, processing, and exporting telemetry data across your cluster. It enables zero-code auto-instrumentation for applications and acts as the central gateway to forward data to Loki, Tempo, or external third-party backends.',
  },
  {
    id: 'networktraffic',
    name: 'Network Traffic Analysis (NetObserve)',
    abbreviation: 'NO',
    description: 'Utilizes Extended Berkeley Packet Filter (eBPF) technology to provide comprehensive visibility into network flows, performance bottlenecks, and traffic topology. It allows you to monitor cluster-wide traffic patterns and troubleshoot connectivity issues directly within the OpenShift console.',
  },
];

export const Step1InstallationDetails: React.FC<Step1InstallationDetailsProps> = ({
  data,
  onDataChange,
}) => {
  // Installation source and version
  const [updateChannel, setUpdateChannel] = useState<string>(data?.updateChannel || 'stable');
  const [updateChannelOpen, setUpdateChannelOpen] = useState(false);
  const [version, setVersion] = useState<string>(data?.version || '1.3.1');
  const [versionOpen, setVersionOpen] = useState(false);

  // Operator scope and placement
  const [installationMode, setInstallationMode] = useState<string>(data?.installationMode || 'all-namespaces');
  const [installationNamespace, setInstallationNamespace] = useState<string>(data?.installationNamespace || 'recommended');
  const [selectedProject, setSelectedProject] = useState<string>(data?.selectedProject || '');
  const [projectSelectOpen, setProjectSelectOpen] = useState<boolean>(false);
  const [projectSearchValue, setProjectSearchValue] = useState<string>('');
  const [enableClusterMonitoring, setEnableClusterMonitoring] = useState<boolean>(data?.enableClusterMonitoring || false);

  // Operator updates
  const [updateApproval, setUpdateApproval] = useState<string>(data?.updateApproval || 'automatic');

  // Sync state changes to parent
  useEffect(() => {
    if (onDataChange) {
      onDataChange({
        updateChannel,
        version,
        installationMode,
        installationNamespace,
        selectedProject,
        enableClusterMonitoring,
        updateApproval,
      });
    }
  }, [updateChannel, version, installationMode, installationNamespace, selectedProject, enableClusterMonitoring, updateApproval, onDataChange]);

  const updateChannelOptions = [
    { value: 'stable', label: 'stable' },
  ];

  const versionOptions = [
    { value: '1.3.1', label: '1.3.1' },
  ];

  const availableProjects = [
    { value: 'default', label: 'default' },
    { value: 'kube-node-lease', label: 'kube-node-lease' },
    { value: 'kube-public', label: 'kube-public' },
    { value: 'kube-system', label: 'kube-system' },
    { value: 'openshift', label: 'openshift' },
  ];

  const filteredProjects = useMemo(() => {
    if (!projectSearchValue) {
      return availableProjects;
    }
    return availableProjects.filter((project) =>
      project.label.toLowerCase().includes(projectSearchValue.toLowerCase())
    );
  }, [projectSearchValue]);

  return (
    <Grid hasGutter style={{ maxWidth: '100%', padding: '0 24px', marginTop: '24px' }}>
      {/* Main Content - Left Column */}
      <GridItem span={12} md={8}>
        <div style={{ maxWidth: '800px' }}>
          <Title headingLevel="h2" size="2xl" style={{ fontSize: '24px', marginBottom: '16px' }}>
            Installation Details
          </Title>
          <Content style={{ marginBottom: '24px', color: '#6a6e73' }}>
            Set the operator version and update channel, define its scope and namespace placement in the cluster, and choose your update approval strategy.
          </Content>

          <Form>
            {/* Installation source and version */}
            <FormGroup
              label={<span style={{ fontSize: 'var(--pf-t--global--font--size--lg)' }}>Installation source and version</span>}
              fieldId="installation-source"
              style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}
            >
              <Stack hasGutter>
                <StackItem>
                  <FormGroup
                    label="Update channel"
                    isRequired
                    fieldId="update-channel"
                  >
                    <Select
                      isOpen={updateChannelOpen}
                      onSelect={(_, value) => {
                        setUpdateChannel(value as string);
                        setUpdateChannelOpen(false);
                      }}
                      onOpenChange={(isOpen) => setUpdateChannelOpen(isOpen)}
                      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                        <MenuToggle
                          ref={toggleRef}
                          onClick={() => setUpdateChannelOpen(!updateChannelOpen)}
                          isExpanded={updateChannelOpen}
                          style={{ width: '100%' }}
                        >
                          {updateChannel}
                        </MenuToggle>
                      )}
                    >
                      <SelectList>
                        {updateChannelOptions.map((option) => (
                          <SelectOption key={option.value} value={option.value}>
                            {option.label}
                          </SelectOption>
                        ))}
                      </SelectList>
                    </Select>
                  </FormGroup>
                </StackItem>
                <StackItem>
                  <FormGroup
                    label="Version"
                    isRequired
                    fieldId="version"
                  >
                    <Select
                      isOpen={versionOpen}
                      onSelect={(_, value) => {
                        setVersion(value as string);
                        setVersionOpen(false);
                      }}
                      onOpenChange={(isOpen) => setVersionOpen(isOpen)}
                      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                        <MenuToggle
                          ref={toggleRef}
                          onClick={() => setVersionOpen(!versionOpen)}
                          isExpanded={versionOpen}
                          style={{ width: '100%' }}
                        >
                          {version}
                        </MenuToggle>
                      )}
                    >
                      <SelectList>
                        {versionOptions.map((option) => (
                          <SelectOption key={option.value} value={option.value}>
                            {option.label}
                          </SelectOption>
                        ))}
                      </SelectList>
                    </Select>
                  </FormGroup>
                </StackItem>
              </Stack>
            </FormGroup>

            {/* Operator scope and placement */}
            <FormGroup
              label={<span style={{ fontSize: 'var(--pf-t--global--font--size--lg)' }}>Operator scope and placement</span>}
              fieldId="operator-scope"
              style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}
            >
              <Stack hasGutter>
                <StackItem>
                  <FormGroup
                    label="Installation mode"
                    isRequired
                    fieldId="installation-mode"
                  >
                    <Stack hasGutter>
                      <StackItem>
                        <Radio
                          id="all-namespaces"
                          name="installation-mode"
                          label="All namespaces on the cluster (default)"
                          isChecked={installationMode === 'all-namespaces'}
                          onChange={() => setInstallationMode('all-namespaces')}
                        />
                        <Content style={{ marginLeft: '24px', marginTop: '4px', fontSize: '14px', color: '#6a6e73' }}>
                          The operator will manage resources cluster-wide.
                        </Content>
                      </StackItem>
                      <StackItem>
                        <Radio
                          id="specific-namespace"
                          name="installation-mode"
                          label="A specific namespace on the cluster"
                          isChecked={installationMode === 'specific-namespace'}
                          onChange={() => setInstallationMode('specific-namespace')}
                          isDisabled
                        />
                        <Content style={{ marginLeft: '24px', marginTop: '4px', fontSize: '14px', color: '#6a6e73' }}>
                          This mode is not supported by this operator.
                        </Content>
                      </StackItem>
                    </Stack>
                  </FormGroup>
                </StackItem>

                <StackItem>
                  <FormGroup
                    label="Installed Namespace *"
                    isRequired
                    fieldId="installation-namespace"
                  >
                    <Stack hasGutter>
                      <StackItem>
                        <Radio
                          id="recommended-namespace"
                          name="installation-namespace"
                          label={
                            <>
                              Operator recommended Namespace:{' '}
                              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                <Badge style={{ backgroundColor: '#1e4f18', color: '#fff', marginRight: '4px' }}>PR</Badge>
                                <span style={{ fontWeight: '600' }}>openshift-cluster-observability-operator</span>
                              </span>
                            </>
                          }
                          isChecked={installationNamespace === 'recommended'}
                          onChange={() => {
                            setInstallationNamespace('recommended');
                            setProjectSelectOpen(false);
                            setSelectedProject('');
                            setProjectSearchValue('');
                          }}
                        />
                        <Alert
                          variant={AlertVariant.info}
                          isInline
                          title="Namespace creation: Namespace openshift-cluster-observability-operator does not exist and will be created."
                          style={{ marginTop: '8px', marginLeft: '24px' }}
                        />
                      </StackItem>
                      <StackItem>
                        <Radio
                          id="select-namespace"
                          name="installation-namespace"
                          label="Select a Namespace"
                          isChecked={installationNamespace === 'select'}
                          onChange={() => setInstallationNamespace('select')}
                        />
                        {installationNamespace === 'select' && (
                          <div style={{ marginLeft: '24px', marginTop: '8px' }}>
                            <Select
                              isOpen={projectSelectOpen}
                              onSelect={(_, value) => {
                                setSelectedProject(value as string);
                                setProjectSelectOpen(false);
                                setProjectSearchValue('');
                              }}
                              onOpenChange={(isOpen) => setProjectSelectOpen(isOpen)}
                              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                <MenuToggle
                                  ref={toggleRef}
                                  onClick={() => setProjectSelectOpen(!projectSelectOpen)}
                                  isExpanded={projectSelectOpen}
                                  style={{ width: '100%' }}
                                >
                                  {selectedProject || 'Select Project'}
                                </MenuToggle>
                              )}
                              popperProps={{
                                placement: 'bottom-start',
                                enableFlip: false,
                              }}
                            >
                              <SelectList>
                                <div 
                                  style={{ padding: '8px' }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <SearchInput
                                    placeholder="Select Project"
                                    value={projectSearchValue}
                                    onChange={(_, value) => setProjectSearchValue(value)}
                                    onClear={() => setProjectSearchValue('')}
                                  />
                                </div>
                                <div 
                                  style={{ padding: '8px 8px 4px 8px', fontSize: '14px', fontWeight: '600' }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Create Project
                                </div>
                                <div
                                  style={{
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    borderTop: '1px solid #d2d2d2',
                                  }}
                                >
                                  {filteredProjects.length > 0 ? (
                                    filteredProjects.map((project) => (
                                      <SelectOption
                                        key={project.value}
                                        value={project.value}
                                      >
                                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                          <Badge style={{ backgroundColor: '#3e8635', color: '#fff', minWidth: '32px', textAlign: 'center', padding: '2px 6px', fontSize: '12px', marginRight: '4px' }}>
                                            PR
                                          </Badge>
                                          <span>{project.label}</span>
                                        </span>
                                      </SelectOption>
                                    ))
                                  ) : (
                                    <div style={{ padding: '8px', fontSize: '14px', color: '#6a6e73' }}>
                                      No projects found
                                    </div>
                                  )}
                                </div>
                              </SelectList>
                            </Select>
                            <Alert
                              variant={AlertVariant.warning}
                              isInline
                              title="Not installing the Operator into the recommended namespace can cause unexpected behavior."
                              style={{ marginTop: '8px' }}
                            />
                          </div>
                        )}
                      </StackItem>
                    </Stack>
                  </FormGroup>
                </StackItem>

                <StackItem>
                  <Checkbox
                    id="enable-cluster-monitoring"
                    label={<span style={{ fontSize: 'var(--pf-t--global--font--size--md)' }}>Enable Operator recommended cluster monitoring on this Namespace</span>}
                    isChecked={enableClusterMonitoring}
                    onChange={(_, checked) => setEnableClusterMonitoring(checked)}
                  />
                </StackItem>
              </Stack>
            </FormGroup>

            {/* Operator updates */}
            <FormGroup
              label={<span style={{ fontSize: 'var(--pf-t--global--font--size--lg)' }}>Operator updates</span>}
              fieldId="operator-updates"
            >
              <FormGroup
                label="Update approval"
                isRequired
                fieldId="update-approval"
              >
                <Stack hasGutter>
                  <StackItem>
                    <Radio
                      id="automatic"
                      name="update-approval"
                      label="Automatic"
                      isChecked={updateApproval === 'automatic'}
                      onChange={() => setUpdateApproval('automatic')}
                    />
                  </StackItem>
                  <StackItem>
                    <Radio
                      id="manual"
                      name="update-approval"
                      label="Manual"
                      isChecked={updateApproval === 'manual'}
                      onChange={() => setUpdateApproval('manual')}
                    />
                  </StackItem>
                </Stack>
              </FormGroup>
            </FormGroup>
          </Form>
        </div>
      </GridItem>

      {/* Right Sidebar - Provided APIs */}
      <GridItem span={12} md={4}>
        <div
          className="provided-apis-sidebar"
          style={{
            position: 'sticky',
            top: '24px',
            maxHeight: 'calc(100vh - 48px)',
            overflowY: 'auto',
          }}
        >
          <style>{`
            .provided-apis-sidebar {
              scrollbar-width: thin; /* Firefox - always reserve space */
              scrollbar-gutter: stable; /* Reserve space for scrollbar to prevent layout shift */
              -ms-overflow-style: none; /* IE and Edge */
            }
            .provided-apis-sidebar::-webkit-scrollbar {
              width: 8px; /* Chrome - always reserve space */
            }
            .provided-apis-sidebar::-webkit-scrollbar-track {
              background: transparent; /* Hidden by default */
            }
            .provided-apis-sidebar::-webkit-scrollbar-thumb {
              background: transparent; /* Hidden by default */
              border-radius: 4px;
            }
            .provided-apis-sidebar:hover::-webkit-scrollbar-track {
              background: #f0f0f0; /* Show on hover */
            }
            .provided-apis-sidebar:hover::-webkit-scrollbar-thumb {
              background: #888; /* Show on hover */
            }
            .provided-apis-sidebar:hover::-webkit-scrollbar-thumb:hover {
              background: #555;
            }
          `}</style>
          <Stack hasGutter>
            {/* Operator Header */}
            <StackItem>
              <Flex spaceItems={{ default: 'spaceItemsMd' }} alignItems={{ default: 'alignItemsFlexStart' }}>
                <FlexItem>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      minWidth: '40px',
                      minHeight: '40px',
                      maxWidth: '40px',
                      maxHeight: '40px',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 40 40"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ display: 'block' }}
                    >
                      {/* Light gray rounded square frame */}
                      <rect
                        x="2"
                        y="2"
                        width="36"
                        height="36"
                        rx="4"
                        fill="#f0f0f0"
                        stroke="#000"
                        strokeWidth="0.5"
                      />
                      {/* White square background */}
                      <rect
                        x="6"
                        y="6"
                        width="28"
                        height="28"
                        rx="2"
                        fill="#ffffff"
                      />
                      {/* Eye shape - black outline */}
                      <path
                        d="M 12 20 Q 20 14 28 20 Q 20 26 12 20"
                        stroke="#000"
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                      />
                      {/* Power button symbol - red arc */}
                      <path
                        d="M 20 16 A 4 4 0 0 1 20 24"
                        stroke="#c9190b"
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                      />
                      {/* Power button symbol - black vertical line */}
                      <line
                        x1="20"
                        y1="20"
                        x2="20"
                        y2="24"
                        stroke="#000"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </FlexItem>
                <FlexItem style={{ flex: 1 }}>
                  <Title headingLevel="h3" size="lg" style={{ marginBottom: '4px' }}>
                    Cluster Observability Operator
                  </Title>
                  <Content style={{ fontSize: '14px', color: '#6a6e73' }}>
                    provided by Red Hat
                  </Content>
                </FlexItem>
              </Flex>
            </StackItem>

            {/* Provided APIs Section Title */}
            <StackItem>
              <Title headingLevel="h3" size="lg">
                Provided APIs
              </Title>
            </StackItem>

            {/* API Cards - Two Column Layout */}
            <StackItem>
              <style>{`
                .provided-apis-grid-wrapper {
                  width: 100%;
                  overflow: visible;
                  /* Prevent Chrome from recalculating on hover */
                  contain: layout style;
                }
                .provided-apis-grid {
                  display: grid;
                  grid-template-columns: 300px 300px;
                  gap: var(--pf-t--global--spacer--md);
                  align-items: start;
                  justify-content: start;
                  width: fit-content;
                  max-width: 100%;
                  min-width: 0;
                  /* Prevent Chrome grid recalculation */
                  will-change: auto;
                }
                /* On narrower viewports, force single column */
                @media (max-width: 991px) {
                  .provided-apis-grid {
                    grid-template-columns: 1fr;
                    width: 100%;
                  }
                }
                .provided-apis-grid .pf-v6-c-card {
                  width: 300px;
                  max-width: 300px;
                  min-width: 300px;
                  box-sizing: border-box;
                  overflow: visible;
                  /* Prevent Chrome from recalculating card size on hover */
                  will-change: auto;
                }
                @media (max-width: 991px) {
                  .provided-apis-grid .pf-v6-c-card {
                    width: 100%;
                    max-width: 100%;
                    min-width: 0;
                  }
                }
                /* Prevent any hover effects that could cause layout shifts in Chrome */
                .provided-apis-grid .pf-v6-c-card,
                .provided-apis-grid .pf-v6-c-card * {
                  transition: none !important;
                }
                .provided-apis-grid .pf-v6-c-card:hover {
                  transform: none !important;
                  box-shadow: var(--pf-v6-global--BoxShadow--sm) !important;
                  width: 300px !important;
                  max-width: 300px !important;
                  min-width: 300px !important;
                }
                @media (max-width: 991px) {
                  .provided-apis-grid .pf-v6-c-card:hover {
                    width: 100% !important;
                    max-width: 100% !important;
                    min-width: 0 !important;
                  }
                }
              `}</style>
              <div className="provided-apis-grid-wrapper">
                <div className="provided-apis-grid">
                {providedAPIs.map((api) => (
                  <Card key={api.id} isCompact>
                    <CardBody>
                      <Flex spaceItems={{ default: 'spaceItemsMd' }} alignItems={{ default: 'alignItemsFlexStart' }}>
                        <FlexItem>
                          <Badge style={{ backgroundColor: '#0066cc', color: '#fff', minWidth: '32px', textAlign: 'center', padding: '4px 8px' }}>
                            {api.abbreviation}
                          </Badge>
                        </FlexItem>
                        <FlexItem style={{ flex: 1 }}>
                          <Content style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                            {api.name}
                          </Content>
                          <Content style={{ fontSize: '14px', color: '#6a6e73' }}>
                            {api.description}
                          </Content>
                        </FlexItem>
                      </Flex>
                    </CardBody>
                  </Card>
                ))}
                </div>
              </div>
            </StackItem>
          </Stack>
        </div>
      </GridItem>
    </Grid>
  );
};

};

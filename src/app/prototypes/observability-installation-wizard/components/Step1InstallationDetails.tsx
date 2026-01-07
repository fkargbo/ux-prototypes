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
    <Grid hasGutter style={{ maxWidth: '100%', padding: '0 24px' }}>
      {/* Main Content - Left Column */}
      <GridItem span={8}>
        <div style={{ maxWidth: '800px' }}>
          <Title headingLevel="h2" size="2xl" style={{ fontSize: '24px', marginBottom: '16px' }}>
            Installation Details
          </Title>
          <Content style={{ marginBottom: '24px', color: '#6a6e73' }}>
            Install your Operator by subscribing to one of the update channels to keep the Operator up to date. The strategy determines either manual or automatic updates.
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
                              <Flex alignItems={{ default: 'alignItemsCenter' }} style={{ display: 'inline-flex' }}>
                                <FlexItem>
                                  <Badge style={{ backgroundColor: '#1e4f18', color: '#fff', marginRight: '4px' }}>PR</Badge>
                                </FlexItem>
                                <FlexItem>
                                  <span style={{ fontWeight: '600' }}>openshift-cluster-observability-operator</span>
                                </FlexItem>
                              </Flex>
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
                                        <Flex alignItems={{ default: 'alignItemsCenter' }}>
                                          <FlexItem>
                                            <Badge style={{ backgroundColor: '#3e8635', color: '#fff', minWidth: '32px', textAlign: 'center', padding: '2px 6px', fontSize: '12px', marginRight: '4px' }}>
                                              PR
                                            </Badge>
                                          </FlexItem>
                                          <FlexItem>{project.label}</FlexItem>
                                        </Flex>
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
      <GridItem span={4}>
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
              scrollbar-width: none; /* Firefox */
              -ms-overflow-style: none; /* IE and Edge */
            }
            .provided-apis-sidebar::-webkit-scrollbar {
              display: none; /* Chrome, Safari, Opera */
            }
            .provided-apis-sidebar:hover {
              scrollbar-width: thin; /* Firefox */
            }
            .provided-apis-sidebar:hover::-webkit-scrollbar {
              display: block; /* Chrome, Safari, Opera */
              width: 8px;
            }
            .provided-apis-sidebar:hover::-webkit-scrollbar-track {
              background: #f0f0f0;
            }
            .provided-apis-sidebar:hover::-webkit-scrollbar-thumb {
              background: #888;
              border-radius: 4px;
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
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 'var(--pf-t--global--spacer--md)',
                  alignItems: 'start',
                }}
              >
                {providedAPIs.map((api) => (
                  <Card key={api.id} isCompact style={{ width: '100%' }}>
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
            </StackItem>
          </Stack>
        </div>
      </GridItem>
    </Grid>
  );
};

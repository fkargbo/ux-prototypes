import React, { useState } from 'react';
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
];

export const Step1InstallationDetails: React.FC<Step1InstallationDetailsProps> = ({
  data,
  onDataChange,
}) => {
  // Installation source and version
  const [updateChannel, setUpdateChannel] = useState<string>('stable');
  const [updateChannelOpen, setUpdateChannelOpen] = useState(false);
  const [version, setVersion] = useState<string>('1.3.1');
  const [versionOpen, setVersionOpen] = useState(false);

  // Operator scope and placement
  const [installationMode, setInstallationMode] = useState<string>('all-namespaces');
  const [installationNamespace, setInstallationNamespace] = useState<string>('recommended');
  const [enableClusterMonitoring, setEnableClusterMonitoring] = useState<boolean>(false);

  // Operator updates
  const [updateApproval, setUpdateApproval] = useState<string>('automatic');

  const updateChannelOptions = [
    { value: 'stable', label: 'stable' },
  ];

  const versionOptions = [
    { value: '1.3.1', label: '1.3.1' },
  ];

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
                    label="Installation Namespace"
                    isRequired
                    fieldId="installation-namespace"
                  >
                    <Stack hasGutter>
                      <StackItem>
                        <Radio
                          id="recommended-namespace"
                          name="installation-namespace"
                          label={
                            <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                              <FlexItem>Operator recommended Namespace: openshift-cluster-observability-operator</FlexItem>
                              <FlexItem>
                                <Badge>PR</Badge>
                              </FlexItem>
                            </Flex>
                          }
                          isChecked={installationNamespace === 'recommended'}
                          onChange={() => setInstallationNamespace('recommended')}
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
                      </StackItem>
                    </Stack>
                  </FormGroup>
                </StackItem>

                <StackItem>
                  <Checkbox
                    id="enable-cluster-monitoring"
                    label="Enable Operator recommended cluster monitoring on this Namespace"
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
          style={{
            position: 'sticky',
            top: '24px',
            maxHeight: 'calc(100vh - 48px)',
            overflowY: 'auto',
          }}
        >
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

            {/* API Cards */}
            <StackItem>
              <Stack hasGutter>
                {providedAPIs.map((api) => (
                  <StackItem key={api.id}>
                    <Card isCompact style={{ width: '300px' }}>
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
                  </StackItem>
                ))}
              </Stack>
            </StackItem>
          </Stack>
        </div>
      </GridItem>
    </Grid>
  );
};

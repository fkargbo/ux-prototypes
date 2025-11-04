import * as React from 'react';
import {
  Wizard,
  WizardStep,
  WizardHeader,
  useWizardContext,
  Button,
  Title,
  Content,
  Form,
  FormGroup,
  TextInput,
  FormSelect,
  FormSelectOption,
  Radio,
  Breadcrumb,
  BreadcrumbItem,
  Alert,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Modal,
  ModalVariant,
  Progress,
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  MenuToggleElement,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  Label,
  Dropdown,
  DropdownList,
  DropdownItem,
  Checkbox,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { CheckCircleIcon, CogsIcon, ExclamationCircleIcon, OffIcon, PauseCircleIcon, CaretDownIcon } from '@patternfly/react-icons';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { getAllClusters, getAllNamespaces, getVirtualMachinesByNamespace, getVirtualMachinesByCluster } from '@app/data';

const CreateMigrationPlan: React.FunctionComponent = () => {
  useDocumentTitle('Create migration plan');
  const navigate = useNavigate();

  // Form state
  const [name, setName] = React.useState('');
  const [migrationReason, setMigrationReason] = React.useState('Not stated');
  const [sourceCluster, setSourceCluster] = React.useState('');
  const [sourceProjects, setSourceProjects] = React.useState<string[]>([]); // Changed to array for multi-select
  const [targetCluster, setTargetCluster] = React.useState('');
  const [targetProject, setTargetProject] = React.useState('');
  const [vmSelectionMode, setVmSelectionMode] = React.useState<'all' | 'manual'>('all');
  const [selectedVMsForMigration, setSelectedVMsForMigration] = React.useState<Set<string>>(new Set());
  const [isMigrationInProgress, setIsMigrationInProgress] = React.useState(false);
  const [migrationProgress, setMigrationProgress] = React.useState(0);

  // Select dropdown states
  const [isSourceClusterOpen, setIsSourceClusterOpen] = React.useState(false);
  const [isSourceProjectOpen, setIsSourceProjectOpen] = React.useState(false);
  const [isTargetClusterOpen, setIsTargetClusterOpen] = React.useState(false);
  const [isTargetProjectOpen, setIsTargetProjectOpen] = React.useState(false);

  // Search filter states
  const [sourceClusterFilter, setSourceClusterFilter] = React.useState('');
  const [sourceProjectFilter, setSourceProjectFilter] = React.useState('');
  const [targetClusterFilter, setTargetClusterFilter] = React.useState('');
  const [targetProjectFilter, setTargetProjectFilter] = React.useState('');

  // Bulk selector state for VM table
  const [isBulkSelectorOpen, setIsBulkSelectorOpen] = React.useState(false);

  const clusters = getAllClusters();
  const allNamespaces = getAllNamespaces();

  // Calculate VM counts per cluster
  const clusterVMCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    clusters.forEach(cluster => {
      const vms = getVirtualMachinesByCluster(cluster.id);
      counts[cluster.id] = vms.length;
    });
    return counts;
  }, [clusters]);

  // Calculate VM counts per namespace
  const namespaceVMCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    allNamespaces.forEach(ns => {
      const vms = getVirtualMachinesByNamespace(ns.id);
      counts[ns.id] = vms.length;
    });
    return counts;
  }, [allNamespaces]);

  const sourceProjectOptions = sourceCluster
    ? allNamespaces.filter(ns => ns.clusterId === sourceCluster)
    : [];

  const targetProjectOptions = targetCluster
    ? allNamespaces.filter(ns => ns.clusterId === targetCluster)
    : [];

  // Filtered options for search
  const filteredSourceClusters = clusters.filter(cluster =>
    cluster.name.toLowerCase().includes(sourceClusterFilter.toLowerCase())
  );

  const filteredSourceProjects = sourceProjectOptions.filter(project =>
    project.name.toLowerCase().includes(sourceProjectFilter.toLowerCase())
  );

  const filteredTargetClusters = clusters.filter(cluster =>
    cluster.name.toLowerCase().includes(targetClusterFilter.toLowerCase())
  );

  const filteredTargetProjects = targetProjectOptions.filter(project =>
    project.name.toLowerCase().includes(targetProjectFilter.toLowerCase())
  );

  // Get VMs from all selected source projects and calculate status counts
  const sourceVMs = React.useMemo(() => {
    if (!sourceCluster || sourceProjects.length === 0) return [];
    // Combine VMs from all selected projects, adding project info to each VM
    const allVMs: any[] = [];
    sourceProjects.forEach(projectId => {
      const vms = getVirtualMachinesByNamespace(projectId);
      const projectName = allNamespaces.find(ns => ns.id === projectId)?.name || projectId;
      // Add project info to each VM
      const vmsWithProject = vms.map(vm => ({ ...vm, projectId, projectName }));
      allVMs.push(...vmsWithProject);
    });
    return allVMs;
  }, [sourceCluster, sourceProjects, allNamespaces]);

  const vmStatusCounts = React.useMemo(() => {
    const breakdown: Record<string, number> = {};
    let running = 0;
    let nonRunning = 0;

    sourceVMs.forEach(vm => {
      const status = vm.status || 'Unknown';
      breakdown[status] = (breakdown[status] || 0) + 1;
      
      if (status === 'Running') {
        running++;
      } else {
        nonRunning++;
      }
    });

    return {
      total: sourceVMs.length,
      running,
      nonRunning,
      breakdown
    };
  }, [sourceVMs]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Running':
        return { Icon: CheckCircleIcon, color: 'var(--pf-t--global--icon--color--status--success--default)' };
      case 'Stopped':
        return { Icon: OffIcon, color: 'var(--pf-t--global--icon--color--status--danger--default)' };
      case 'Error':
        return { Icon: ExclamationCircleIcon, color: 'var(--pf-t--global--icon--color--status--danger--default)' };
      case 'Paused':
        return { Icon: PauseCircleIcon, color: 'var(--pf-t--global--icon--color--status--warning--default)' };
      default:
        return { Icon: ExclamationCircleIcon, color: 'var(--pf-t--global--icon--color--subtle)' };
    }
  };

  // VM selection helpers
  const runningVMs = sourceVMs.filter(vm => vm.status === 'Running');
  const runningVMIds = runningVMs.map(vm => vm.id);

  const handleSelectAllRunning = () => {
    setSelectedVMsForMigration(new Set(runningVMIds));
    setIsBulkSelectorOpen(false);
  };

  const handleDeselectAll = () => {
    setSelectedVMsForMigration(new Set());
    setIsBulkSelectorOpen(false);
  };

  const handleSelectVM = (vmId: string, isSelecting: boolean) => {
    const newSelected = new Set(selectedVMsForMigration);
    if (isSelecting) {
      newSelected.add(vmId);
    } else {
      newSelected.delete(vmId);
    }
    setSelectedVMsForMigration(newSelected);
  };

  const areAllRunningSelected = runningVMs.length > 0 && runningVMs.every(vm => selectedVMsForMigration.has(vm.id));

  const onClose = () => {
    navigate('/virtualization/migration');
  };

  const onMigrate = () => {
    setIsMigrationInProgress(true);
    // Simulate migration progress
    const interval = setInterval(() => {
      setMigrationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 500);
  };

  const onSaveForLater = () => {
    // Save the migration plan for later
    console.log('Saving migration plan for later...');
    navigate('/virtualization/migration');
  };

  const handleCloseMigrationModal = () => {
    setIsMigrationInProgress(false);
    navigate('/virtualization/migration');
  };

  // Custom footer component for the wizard
  const CustomFooter = () => {
    try {
      const { activeStep, goToNextStep, goToPrevStep } = useWizardContext();
      const stepName = activeStep?.name || '';
      const isReviewStep = stepName === 'Review';
      const isFirstStep = stepName === 'General information';

      const handleNext = () => {
        console.log('Next clicked, current step:', stepName);
        goToNextStep();
      };

      const handleBack = () => {
        console.log('Back clicked, current step:', stepName);
        goToPrevStep();
      };

      const handleClose = () => {
        console.log('Cancel clicked');
        navigate('/virtualization/migration');
      };

      const handleMigrate = () => {
        console.log('Migrate clicked');
        onMigrate();
      };

      const handleSaveForLater = () => {
        console.log('Save for later clicked');
        onSaveForLater();
      };

      if (isReviewStep) {
        return (
          <div style={{ display: 'flex', gap: '8px', padding: '16px 24px', borderTop: '1px solid var(--pf-t--global--border--color--default)', backgroundColor: '#fff' }}>
            <Button variant="primary" onClick={handleMigrate}>
              Migrate
            </Button>
            <Button variant="secondary" onClick={handleSaveForLater}>
              Save for later
            </Button>
            <Button variant="link" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        );
      }

      return (
        <div style={{ display: 'flex', gap: '8px', padding: '16px 24px', borderTop: '1px solid var(--pf-t--global--border--color--default)', backgroundColor: '#fff' }}>
          <Button variant="primary" onClick={handleNext}>
            Next
          </Button>
          {!isFirstStep && (
            <Button variant="secondary" onClick={handleBack}>
              Back
            </Button>
          )}
          <Button variant="link" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      );
    } catch (error) {
      console.error('Error in CustomFooter:', error);
      return null;
    }
  };

  const renderGeneralInformationStep = () => (
    <div style={{ padding: '24px', maxWidth: '600px' }}>
      <Title headingLevel="h2" size="xl" style={{ marginBottom: '24px' }}>
        General information
      </Title>
      
      <Form>
        <FormGroup label="Name">
          <TextInput
            type="text"
            value={name}
            onChange={(_event, value) => setName(value)}
            placeholder="Random-generated-name-with-a-date"
          />
          <Content component="p" style={{ 
            marginTop: '8px', 
            fontSize: '14px',
            color: 'var(--pf-t--global--text--color--subtle)' 
          }}>
            If you don't create a name, we'll generate a migration plan name for you.
          </Content>
        </FormGroup>

        <FormGroup label="Migration reason (optional)" style={{ marginTop: '24px' }}>
          <FormSelect
            value={migrationReason}
            onChange={(_event, value) => setMigrationReason(value as string)}
          >
            <FormSelectOption key="not-stated" value="Not stated" label="Not stated" />
            <FormSelectOption key="evaluating" value="Evaluating" label="Evaluating" />
            <FormSelectOption key="decommission" value="Decommission" label="Decommission" />
            <FormSelectOption key="upgrade" value="Upgrade" label="Upgrade" />
            <FormSelectOption key="consolidation" value="Consolidation" label="Consolidation" />
          </FormSelect>
          <Content component="p" style={{ 
            marginTop: '8px', 
            fontSize: '14px',
            color: 'var(--pf-t--global--text--color--subtle)' 
          }}>
            Select a reason for migration
          </Content>
        </FormGroup>
      </Form>
    </div>
  );

  const renderPlacementStep = () => (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title headingLevel="h2" size="xl">
          Placement *
        </Title>
        <Button variant="link" onClick={() => {
          setSourceCluster('');
          setSourceProjects([]);
          setTargetCluster('');
          setTargetProject('');
        }}>
          Clear all
        </Button>
      </div>

      <Content component="p" style={{ 
        marginBottom: '24px',
        fontSize: '14px',
        color: 'var(--pf-t--global--text--color--subtle)' 
      }}>
        Select target placement
      </Content>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
        {/* Source Card */}
        <div style={{ 
          flex: 1,
          border: '1px solid var(--pf-t--global--border--color--default)',
          borderRadius: '8px',
          padding: '24px',
          backgroundColor: 'var(--pf-t--global--background--color--primary--default)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Title headingLevel="h3" size="md">Source</Title>
            <Button variant="link" onClick={() => { setSourceCluster(''); setSourceProjects([]); }}>
              Clear all
            </Button>
          </div>

          <Form>
            <FormGroup label="Cluster">
              <Select
                isOpen={isSourceClusterOpen}
                onSelect={(_event, value) => {
                  setSourceCluster(value as string);
                  setSourceProjects([]);
                  setSourceClusterFilter('');
                  setIsSourceClusterOpen(false);
                }}
                onOpenChange={(isOpen) => {
                  setIsSourceClusterOpen(isOpen);
                  if (!isOpen) {
                    setSourceClusterFilter('');
                  }
                }}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setIsSourceClusterOpen(!isSourceClusterOpen)}
                    isExpanded={isSourceClusterOpen}
                    style={{ width: '100%' }}
                  >
                    {sourceCluster ? clusters.find(c => c.id === sourceCluster)?.name : 'Select Cluster'}
                  </MenuToggle>
                )}
              >
                <TextInputGroup style={{ padding: '4px' }}>
                  <TextInputGroupMain
                    value={sourceClusterFilter}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(_event, value) => setSourceClusterFilter(value)}
                    placeholder="Search clusters..."
                  />
                </TextInputGroup>
                <SelectList>
                  {filteredSourceClusters.map(cluster => (
                    <SelectOption key={cluster.id} value={cluster.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span>{cluster.name}</span>
                        <Label isCompact color="blue">{clusterVMCounts[cluster.id] || 0} VMs</Label>
                      </div>
                    </SelectOption>
                  ))}
                  {filteredSourceClusters.length === 0 && (
                    <SelectOption isDisabled>No results found</SelectOption>
                  )}
                </SelectList>
              </Select>
            </FormGroup>

            <FormGroup label="Projects (select one or more)" style={{ marginTop: '16px' }}>
              <Select
                isOpen={isSourceProjectOpen}
                selected={sourceProjects}
                onSelect={(_event, value) => {
                  const vmCount = namespaceVMCounts[value as string] || 0;
                  if (vmCount > 0) {
                    // Toggle selection for multi-select
                    if (sourceProjects.includes(value as string)) {
                      setSourceProjects(sourceProjects.filter(id => id !== value));
                    } else {
                      setSourceProjects([...sourceProjects, value as string]);
                    }
                  }
                }}
                onOpenChange={(isOpen) => {
                  setIsSourceProjectOpen(isOpen);
                  if (!isOpen) {
                    setSourceProjectFilter('');
                  }
                }}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setIsSourceProjectOpen(!isSourceProjectOpen)}
                    isExpanded={isSourceProjectOpen}
                    isDisabled={!sourceCluster}
                    style={{ width: '100%' }}
                  >
                    {sourceProjects.length > 0
                      ? `${sourceProjects.length} project${sourceProjects.length > 1 ? 's' : ''} selected`
                      : (sourceCluster ? 'Select Projects' : 'To select projects, fill cluster first')}
                  </MenuToggle>
                )}
              >
                <TextInputGroup style={{ padding: '4px' }}>
                  <TextInputGroupMain
                    value={sourceProjectFilter}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(_event, value) => setSourceProjectFilter(value)}
                    placeholder="Search projects..."
                  />
                </TextInputGroup>
                <SelectList>
                  {filteredSourceProjects.map(project => {
                    const vmCount = namespaceVMCounts[project.id] || 0;
                    const hasNoVMs = vmCount === 0;
                    const isSelected = sourceProjects.includes(project.id);
                    return (
                      <SelectOption 
                        key={project.id} 
                        value={project.id}
                        isDisabled={hasNoVMs}
                        hasCheckbox
                        isSelected={isSelected}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <span style={{ opacity: hasNoVMs ? 0.6 : 1 }}>{project.name}</span>
                          <Label isCompact color={hasNoVMs ? "grey" : "blue"}>{vmCount} VMs</Label>
                        </div>
                      </SelectOption>
                    );
                  })}
                  {filteredSourceProjects.length === 0 && sourceCluster && (
                    <SelectOption isDisabled>No results found</SelectOption>
                  )}
                </SelectList>
              </Select>
              {sourceProjects.length > 0 && (
                <Content component="p" style={{ 
                  marginTop: '8px', 
                  fontSize: '14px',
                  color: 'var(--pf-t--global--text--color--subtle)' 
                }}>
                  {sourceProjects.length} project{sourceProjects.length > 1 ? 's' : ''} selected
                </Content>
              )}
            </FormGroup>
          </Form>
        </div>

        {/* Arrow */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '24px 0' }}>
          <span style={{ fontSize: '24px', color: 'var(--pf-t--global--text--color--subtle)' }}>→</span>
        </div>

        {/* Target Card */}
        <div style={{ 
          flex: 1,
          border: '1px solid var(--pf-t--global--border--color--default)',
          borderRadius: '8px',
          padding: '24px',
          backgroundColor: 'var(--pf-t--global--background--color--primary--default)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Title headingLevel="h3" size="md">Target *</Title>
            <Button variant="link" onClick={() => { setTargetCluster(''); setTargetProject(''); }}>
              Clear all
            </Button>
          </div>

          <Form>
            <FormGroup label="Cluster">
              <Select
                isOpen={isTargetClusterOpen}
                onSelect={(_event, value) => {
                  setTargetCluster(value as string);
                  setTargetProject('');
                  setTargetClusterFilter('');
                  setIsTargetClusterOpen(false);
                }}
                onOpenChange={(isOpen) => {
                  setIsTargetClusterOpen(isOpen);
                  if (!isOpen) {
                    setTargetClusterFilter('');
                  }
                }}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setIsTargetClusterOpen(!isTargetClusterOpen)}
                    isExpanded={isTargetClusterOpen}
                    style={{ width: '100%' }}
                  >
                    {targetCluster ? clusters.find(c => c.id === targetCluster)?.name : 'Select Cluster'}
                  </MenuToggle>
                )}
              >
                <TextInputGroup style={{ padding: '4px' }}>
                  <TextInputGroupMain
                    value={targetClusterFilter}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(_event, value) => setTargetClusterFilter(value)}
                    placeholder="Search clusters..."
                  />
                </TextInputGroup>
                <SelectList>
                  {filteredTargetClusters.map(cluster => (
                    <SelectOption key={cluster.id} value={cluster.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span>{cluster.name}</span>
                        <Label isCompact color="blue">{clusterVMCounts[cluster.id] || 0} VMs</Label>
                      </div>
                    </SelectOption>
                  ))}
                  {filteredTargetClusters.length === 0 && (
                    <SelectOption isDisabled>No results found</SelectOption>
                  )}
                </SelectList>
              </Select>
            </FormGroup>

            <FormGroup label="Project" style={{ marginTop: '16px' }}>
              <Select
                isOpen={isTargetProjectOpen}
                onSelect={(_event, value) => {
                  setTargetProject(value as string);
                  setTargetProjectFilter('');
                  setIsTargetProjectOpen(false);
                }}
                onOpenChange={(isOpen) => {
                  setIsTargetProjectOpen(isOpen);
                  if (!isOpen) {
                    setTargetProjectFilter('');
                  }
                }}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setIsTargetProjectOpen(!isTargetProjectOpen)}
                    isExpanded={isTargetProjectOpen}
                    isDisabled={!targetCluster}
                    style={{ width: '100%' }}
                  >
                    {targetProject 
                      ? targetProjectOptions.find(p => p.id === targetProject)?.name 
                      : (targetCluster ? 'Select Project' : 'To select project, fill cluster first')}
                  </MenuToggle>
                )}
              >
                <TextInputGroup style={{ padding: '4px' }}>
                  <TextInputGroupMain
                    value={targetProjectFilter}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(_event, value) => setTargetProjectFilter(value)}
                    placeholder="Search projects..."
                  />
                </TextInputGroup>
                <SelectList>
                  {filteredTargetProjects.map(project => {
                    const vmCount = namespaceVMCounts[project.id] || 0;
                    return (
                      <SelectOption key={project.id} value={project.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <span>{project.name}</span>
                          <Label isCompact color="blue">{vmCount} VMs</Label>
                        </div>
                      </SelectOption>
                    );
                  })}
                  {filteredTargetProjects.length === 0 && targetCluster && (
                    <SelectOption isDisabled>No results found</SelectOption>
                  )}
                </SelectList>
              </Select>
            </FormGroup>
          </Form>
        </div>
      </div>

      {/* Project Mapping Information */}
      {sourceProjects.length > 0 && targetCluster && targetProject && (
        <Alert
          variant="info"
          isInline
          title={`Migration plan: ${sourceProjects.length} source project${sourceProjects.length > 1 ? 's' : ''} → 1 target project`}
          style={{ marginBottom: '24px' }}
        >
          <div style={{ marginTop: '8px' }}>
            <Content component="p" style={{ fontSize: '14px', marginBottom: '12px' }}>
              All virtual machines from the following source projects will be migrated to <strong>{targetProjectOptions.find(p => p.id === targetProject)?.name}</strong>:
            </Content>
            <ul style={{ marginLeft: '20px', fontSize: '14px' }}>
              {sourceProjects.map(projectId => {
                const projectName = allNamespaces.find(ns => ns.id === projectId)?.name || projectId;
                const vmCount = namespaceVMCounts[projectId] || 0;
                const runningCount = getVirtualMachinesByNamespace(projectId).filter(vm => vm.status === 'Running').length;
                return (
                  <li key={projectId}>
                    <strong>{projectName}</strong>: {runningCount} running VM{runningCount !== 1 ? 's' : ''} (out of {vmCount} total)
                  </li>
                );
              })}
            </ul>
          </div>
        </Alert>
      )}

      <div>
        <Title headingLevel="h3" size="md" style={{ marginBottom: '16px' }}>
          Virtual machines
        </Title>

        {/* VM Status Information */}
        {sourceCluster && sourceProjects.length > 0 && vmStatusCounts.total > 0 && (
          <div style={{ 
            marginBottom: '16px',
            padding: '16px',
            backgroundColor: vmStatusCounts.nonRunning > 0 
              ? 'var(--pf-t--global--background--color--status--warning--default)' 
              : 'var(--pf-t--global--background--color--status--success--default)',
            borderRadius: '8px',
            border: `1px solid ${vmStatusCounts.nonRunning > 0 
              ? 'var(--pf-t--global--border--color--status--warning--default)' 
              : 'var(--pf-t--global--border--color--status--success--default)'}`
          }}>
            <Content component="p" style={{ 
              fontWeight: 'bold',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              Virtual machines in source
            </Content>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {Object.entries(vmStatusCounts.breakdown)
                .sort(([statusA], [statusB]) => {
                  if (statusA === 'Running') return -1;
                  if (statusB === 'Running') return 1;
                  return statusA.localeCompare(statusB);
                })
                .map(([status, count]) => {
                  const { Icon, color } = getStatusIcon(status);
                  return (
                    <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Icon style={{ color }} />
                      <span style={{ fontSize: '14px' }}>
                        <strong>{count}</strong> {count === 1 ? 'VM' : 'VMs'} {status.toLowerCase()}
                      </span>
                    </div>
                  );
                })}
            </div>
            {vmStatusCounts.nonRunning > 0 && (
              <Content component="p" style={{ 
                marginTop: '12px',
                fontSize: '14px',
                fontStyle: 'italic'
              }}>
                Note: Only <strong>{vmStatusCounts.running}</strong> running {vmStatusCounts.running === 1 ? 'VM' : 'VMs'} will be available for migration.
              </Content>
            )}
          </div>
        )}

        {sourceCluster && sourceProjects.length > 0 && vmStatusCounts.total === 0 && (
          <Alert
            variant="warning"
            isInline
            title="No virtual machines found in the selected source projects"
            style={{ marginBottom: '16px' }}
          />
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Radio
            name="vm-selection"
            id="select-all-vms"
            label="Select all virtual machines from the source projects"
            isChecked={vmSelectionMode === 'all'}
            onChange={() => setVmSelectionMode('all')}
            isDisabled={!sourceCluster || sourceProjects.length === 0}
          />
          <Radio
            name="vm-selection"
            id="manual-select-vms"
            label="Manually select specific virtual machines from the source projects"
            isChecked={vmSelectionMode === 'manual'}
            onChange={() => setVmSelectionMode('manual')}
            isDisabled={!sourceCluster || sourceProjects.length === 0}
          />
        </div>

        {/* VM Selection Table */}
        {vmSelectionMode === 'manual' && sourceCluster && sourceProjects.length > 0 && sourceVMs.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginBottom: '16px'
            }}>
              <Dropdown
                isOpen={isBulkSelectorOpen}
                onSelect={() => setIsBulkSelectorOpen(false)}
                onOpenChange={(isOpen: boolean) => setIsBulkSelectorOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => {
                      if (selectedVMsForMigration.size > 0) {
                        handleDeselectAll();
                      } else {
                        setIsBulkSelectorOpen(!isBulkSelectorOpen);
                      }
                    }}
                    variant="plain"
                    style={{
                      border: '1px solid var(--pf-t--global--border--color--default)',
                      borderRadius: 'var(--pf-t--global--border--radius--small)',
                      padding: '6px 8px',
                      minWidth: 'auto',
                    }}
                  >
                    <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                      <FlexItem>
                        <Checkbox
                          isChecked={areAllRunningSelected}
                          onChange={(event, checked) => {
                            event.stopPropagation();
                            if (checked) {
                              handleSelectAllRunning();
                            } else {
                              handleDeselectAll();
                            }
                          }}
                          aria-label="Select all running VMs"
                          id="select-all-vms-checkbox"
                        />
                      </FlexItem>
                      <FlexItem>
                        <CaretDownIcon />
                      </FlexItem>
                    </Flex>
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem key="select-none" onClick={handleDeselectAll}>
                    Select none
                  </DropdownItem>
                  <DropdownItem key="select-all-running" onClick={handleSelectAllRunning}>
                    Select all running ({runningVMs.length} VMs)
                  </DropdownItem>
                </DropdownList>
              </Dropdown>
              {selectedVMsForMigration.size > 0 && (
                <Content component="p" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {selectedVMsForMigration.size} selected
                </Content>
              )}
            </div>

            <Table variant="compact">
              <Thead>
                <Tr>
                  <Th />
                  <Th>Name</Th>
                  <Th>Project</Th>
                  <Th>Status</Th>
                  <Th>Node</Th>
                  <Th>IP Address</Th>
                </Tr>
              </Thead>
              <Tbody>
                {sourceVMs.map((vm, rowIndex) => {
                  const isRunning = vm.status === 'Running';
                  const isSelected = selectedVMsForMigration.has(vm.id);
                  const { Icon, color } = getStatusIcon(vm.status || 'Unknown');

                  return (
                    <Tr key={vm.id}>
                      <Td
                        select={{
                          rowIndex,
                          onSelect: (_event, isSelecting) => handleSelectVM(vm.id, isSelecting),
                          isSelected: isSelected,
                          isDisabled: !isRunning,
                        }}
                      />
                      <Td dataLabel="Name" style={{ opacity: isRunning ? 1 : 0.6 }}>
                        {vm.name}
                      </Td>
                      <Td dataLabel="Project" style={{ opacity: isRunning ? 1 : 0.6 }}>
                        {vm.projectName || '-'}
                      </Td>
                      <Td dataLabel="Status">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Icon style={{ color }} />
                          <span>{vm.status}</span>
                        </div>
                      </Td>
                      <Td dataLabel="Node" style={{ opacity: isRunning ? 1 : 0.6 }}>
                        {vm.node || '-'}
                      </Td>
                      <Td dataLabel="IP Address" style={{ opacity: isRunning ? 1 : 0.6 }}>
                        {vm.ipAddress || '-'}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );

  const renderMigrationReadinessStep = () => (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title headingLevel="h2" size="xl">
          Migration readiness
        </Title>
        <Button variant="link">Run again</Button>
      </div>

      <Alert
        variant="success"
        isInline
        title="Some checks were not successful"
        style={{ marginBottom: '24px' }}
      >
        5 successful checks
      </Alert>

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Checklist sidebar */}
        <div style={{ 
          width: '200px',
          borderRight: '1px solid var(--pf-t--global--border--color--default)',
          paddingRight: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <CheckCircleIcon style={{ color: 'var(--pf-t--global--icon--color--status--success--default)' }} />
            <span>Network mapping</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <CheckCircleIcon style={{ color: 'var(--pf-t--global--icon--color--status--success--default)' }} />
            <span>Storage mapping</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <CheckCircleIcon style={{ color: 'var(--pf-t--global--icon--color--status--success--default)' }} />
            <span>Compute compatibility</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <CheckCircleIcon style={{ color: 'var(--pf-t--global--icon--color--status--success--default)' }} />
            <span>Version compatibility</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircleIcon style={{ color: 'var(--pf-t--global--icon--color--status--success--default)' }} />
            <span>Resource capacity</span>
          </div>
        </div>

        {/* Content area */}
        <div style={{ flex: 1 }}>
          <Title headingLevel="h3" size="md" style={{ marginBottom: '16px' }}>
            Network mapping
          </Title>
          <div style={{ display: 'flex', gap: '48px' }}>
            <div>
              <Content component="p" style={{ 
                fontWeight: 'bold',
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                Source network
              </Content>
              <Content component="p" style={{ fontSize: '14px' }}>network1</Content>
            </div>
            <div>
              <Content component="p" style={{ 
                fontWeight: 'bold',
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                Target network
              </Content>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Content component="p" style={{ fontSize: '14px' }}>network1</Content>
                <Button variant="link" isInline style={{ padding: 0 }}>Edit</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => {
    const sourceClusterName = clusters.find(c => c.id === sourceCluster)?.name || '';
    const sourceProjectNames = sourceProjects.map(id => 
      allNamespaces.find(p => p.id === id)?.name || id
    );
    const targetClusterName = clusters.find(c => c.id === targetCluster)?.name || '';
    const targetProjectName = targetProjectOptions.find(p => p.id === targetProject)?.name || '';

    return (
      <div style={{ padding: '24px', maxWidth: '800px' }}>
        <Title headingLevel="h2" size="xl" style={{ marginBottom: '24px' }}>
          Review
        </Title>

        {/* General information */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Title headingLevel="h3" size="md">General information</Title>
            <Button variant="link">Edit step</Button>
          </div>
          <DescriptionList isHorizontal>
            <DescriptionListGroup>
              <DescriptionListTerm>Name</DescriptionListTerm>
              <DescriptionListDescription>{name || 'Auto-generated'}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Migration reason</DescriptionListTerm>
              <DescriptionListDescription>{migrationReason}</DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </div>

        {/* Placement */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Title headingLevel="h3" size="md">Placement</Title>
            <Button variant="link">Edit step</Button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <DescriptionList>
              <DescriptionListGroup>
                <DescriptionListTerm>Source cluster</DescriptionListTerm>
                <DescriptionListDescription>{sourceClusterName}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Source projects</DescriptionListTerm>
                <DescriptionListDescription>
                  {sourceProjectNames.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {sourceProjectNames.map((name, idx) => (
                        <span key={idx}>{name}</span>
                      ))}
                    </div>
                  ) : (
                    '-'
                  )}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Total VMs to migrate</DescriptionListTerm>
                <DescriptionListDescription>
                  {vmSelectionMode === 'all' 
                    ? `${vmStatusCounts.running} VMs (all running VMs)` 
                    : `${selectedVMsForMigration.size} VMs (manually selected)`}
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
            <DescriptionList>
              <DescriptionListGroup>
                <DescriptionListTerm>Target cluster</DescriptionListTerm>
                <DescriptionListDescription>{targetClusterName}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Target project</DescriptionListTerm>
                <DescriptionListDescription>{targetProjectName}</DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </div>
        </div>

        {/* Migration readiness */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Title headingLevel="h3" size="md">Migration readiness</Title>
            <Button variant="link">Edit step</Button>
          </div>
          <DescriptionList isHorizontal>
            <DescriptionListGroup>
              <DescriptionListTerm>Status</DescriptionListTerm>
              <DescriptionListDescription>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircleIcon style={{ color: 'var(--pf-t--global--icon--color--status--success--default)' }} />
                  <span>Ready to migrate</span>
                </div>
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </div>

        <Alert
          variant="info"
          isInline
          title="During migration, virtual machines will be processed and moved in groups of five."
          style={{ marginTop: '32px' }}
        />
      </div>
    );
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f5f5f5' }}>
        {/* Breadcrumb section */}
        <div className="create-policy-breadcrumb">
          <Breadcrumb>
            <BreadcrumbItem to="#" onClick={(e) => { e.preventDefault(); navigate('/virtualization/migration'); }}>
              Migration
            </BreadcrumbItem>
            <BreadcrumbItem to="#" onClick={(e) => { e.preventDefault(); navigate('/virtualization/migration'); }}>
              Migration plans
            </BreadcrumbItem>
            <BreadcrumbItem isActive>Create migration plan</BreadcrumbItem>
          </Breadcrumb>
        </div>

        {/* Page header with title and description */}
        <div className="create-policy-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <Title headingLevel="h1" size="2xl">
              Create migration plan
            </Title>
            <Button variant="secondary" size="sm">
              Edit YAML
            </Button>
          </div>
          <Content component="p" style={{ color: '#6a6e73' }}>
            Create a migration plan to move virtualization workloads from source providers to target providers.
          </Content>
        </div>

        {/* Wizard content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <Wizard onClose={onClose} footer={<CustomFooter />}>
              <WizardStep name="General information" id="general-information-step">
                {renderGeneralInformationStep()}
              </WizardStep>
              <WizardStep name="Placement" id="placement-step">
                {renderPlacementStep()}
              </WizardStep>
              <WizardStep name="Migration readiness" id="migration-readiness-step">
                {renderMigrationReadinessStep()}
              </WizardStep>
              <WizardStep name="Review" id="review-step">
                {renderReviewStep()}
              </WizardStep>
            </Wizard>
          </div>
        </div>
      </div>

      {/* Migration in progress modal */}
      <Modal
        isOpen={isMigrationInProgress}
        variant={ModalVariant.small}
        onClose={handleCloseMigrationModal}
        aria-label="Migration in progress"
      >
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ marginBottom: '24px' }}>
            <CogsIcon style={{ fontSize: '48px', color: 'var(--pf-t--global--icon--color--subtle)' }} />
          </div>
          
          <Title headingLevel="h2" size="xl" style={{ marginBottom: '24px' }}>
            Migration in progress
          </Title>

          <Progress
            value={migrationProgress}
            title=" "
            style={{ marginBottom: '16px' }}
          />
          
          <Content component="p" style={{ 
            fontSize: '12px',
            marginBottom: '24px',
            color: 'var(--pf-t--global--text--color--subtle)'
          }}>
            {migrationProgress}%
          </Content>

          <Content component="p" style={{ 
            marginBottom: '24px',
            fontSize: '14px'
          }}>
            The migration will continue if you close this popup
          </Content>

          <Button variant="primary" onClick={handleCloseMigrationModal} style={{ marginBottom: '16px' }}>
            Close
          </Button>

          <div>
            <Button 
              variant="link" 
              isDanger
              onClick={() => {
                setIsMigrationInProgress(false);
                navigate('/virtualization/migration');
              }}
            >
              Cancel migration process
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export { CreateMigrationPlan };


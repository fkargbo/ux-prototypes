import * as React from 'react';
import {
  Modal,
  ModalVariant,
  Button,
  Content,
  Form,
  FormGroup,
  TextInput,
  FormSelect,
  FormSelectOption,
  Title,
  Alert,
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  MenuToggleElement,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelContent,
  DrawerHead,
  DrawerActions,
  DrawerCloseButton,
} from '@patternfly/react-core';
import { CheckCircleIcon, OffIcon, ExclamationCircleIcon, PauseCircleIcon } from '@patternfly/react-icons';
import { 
  getVirtualMachineById, 
  getAllClusters, 
  getNamespacesByCluster,
  getClusterById,
  getNamespaceById,
  getAllVirtualMachines
} from '../data/queries';
import { virtualMachines } from '../data/mockDatabase';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';

interface MigrateVMsWizardProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVMs: string[];
  preselectedTargetCluster?: string;
  preselectedTargetNamespace?: string;
  isFromDragAndDrop?: boolean;
}

export const MigrateVMsWizard: React.FunctionComponent<MigrateVMsWizardProps> = ({
  isOpen,
  onClose,
  selectedVMs,
  preselectedTargetCluster,
  preselectedTargetNamespace,
  isFromDragAndDrop = false,
}) => {
  const [migrationName, setMigrationName] = React.useState('');
  const [migrationReason, setMigrationReason] = React.useState('Not stated');
  const [customReason, setCustomReason] = React.useState('');
  const [showProgress, setShowProgress] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [isReasonSelectOpen, setIsReasonSelectOpen] = React.useState(false);
  const [isVMDrawerOpen, setIsVMDrawerOpen] = React.useState(false);
  const [isStatusWarningModalOpen, setIsStatusWarningModalOpen] = React.useState(false);
  const [filteredVMIds, setFilteredVMIds] = React.useState<string[]>(selectedVMs);
  const [showWizardContent, setShowWizardContent] = React.useState(false);
  
  // Predefined migration reasons
  const predefinedReasons = [
    'Not stated',
    'Hardware maintenance',
    'Load balancing',
    'Disaster recovery',
    'Resource optimization',
    'Other'
  ];
  
  // Get the actual reason value (custom if "Other" is selected)
  const actualMigrationReason = migrationReason === 'Other' ? customReason : migrationReason;
  
  // Helper function to get icon and color for each status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Running':
        return { Icon: CheckCircleIcon, color: 'var(--pf-t--global--icon--color--status--success--default)' };
      case 'Stopped':
        return { Icon: OffIcon, color: 'var(--pf-t--global--text--color--regular)' };
      case 'Error':
        return { Icon: ExclamationCircleIcon, color: 'var(--pf-t--global--icon--color--status--danger--default)' };
      case 'Paused':
        return { Icon: PauseCircleIcon, color: 'var(--pf-t--global--icon--color--status--warning--default)' };
      case 'Starting':
      case 'Stopping':
        return { Icon: PauseCircleIcon, color: 'var(--pf-t--global--text--color--subtle)' };
      default:
        return { Icon: OffIcon, color: 'var(--pf-t--global--text--color--regular)' };
    }
  };
  
  // Get VM data
  const vmsToMigrate = React.useMemo(() => {
    return filteredVMIds.map(vmId => getVirtualMachineById(vmId)).filter(Boolean);
  }, [filteredVMIds]);
  
  // Get all selected VMs with their full data
  const allSelectedVMs = React.useMemo(() => {
    return selectedVMs
      .map(vmId => getVirtualMachineById(vmId))
      .filter((vm): vm is NonNullable<typeof vm> => vm !== null && vm !== undefined);
  }, [selectedVMs]);

  // Calculate VM status counts - break down by each status type
  const vmStatusCounts = React.useMemo(() => {
    const statusBreakdown: Record<string, number> = {};
    allSelectedVMs.forEach(vm => {
      statusBreakdown[vm.status] = (statusBreakdown[vm.status] || 0) + 1;
    });
    
    const running = allSelectedVMs.filter(vm => vm.status === 'Running');
    const nonRunning = allSelectedVMs.filter(vm => vm.status !== 'Running');
    
    return {
      running: running.length,
      nonRunning: nonRunning.length,
      total: allSelectedVMs.length,
      breakdown: statusBreakdown
    };
  }, [allSelectedVMs]);

  // Check VM statuses when wizard opens
  React.useEffect(() => {
    if (isOpen && selectedVMs.length > 0) {
      console.log('VM Status Check:', {
        total: vmStatusCounts.total,
        running: vmStatusCounts.running,
        nonRunning: vmStatusCounts.nonRunning,
        breakdown: vmStatusCounts.breakdown,
        vms: allSelectedVMs.map(vm => ({ id: vm.id, name: vm.name, status: vm.status }))
      });

      if (vmStatusCounts.nonRunning > 0) {
        // Show warning modal first, don't show wizard yet
        setIsStatusWarningModalOpen(true);
        setShowWizardContent(false);
      } else {
        // All VMs are running, proceed normally
        setFilteredVMIds(selectedVMs);
        setShowWizardContent(true);
      }
    } else if (!isOpen) {
      // Reset when closed
      setShowWizardContent(false);
      setIsStatusWarningModalOpen(false);
    }
  }, [isOpen, selectedVMs, vmStatusCounts, allSelectedVMs]);
  
  // Get source info from first VM (assuming all VMs are from same source)
  const sourceVM = vmsToMigrate[0];
  const sourceCluster = sourceVM ? getClusterById(sourceVM.clusterId) : null;
  const sourceNamespace = sourceVM ? getNamespaceById(sourceVM.namespaceId) : null;
  
  // Get all clusters and namespaces
  const allClusters = React.useMemo(() => getAllClusters(), []);
  const [targetCluster, setTargetCluster] = React.useState('');
  const [targetProject, setTargetProject] = React.useState('');
  
  // Pre-select target cluster and namespace when provided (from drag-and-drop)
  React.useEffect(() => {
    if (isOpen && showWizardContent) {
      if (preselectedTargetCluster) {
        console.log('Pre-selecting target cluster from drag-and-drop:', preselectedTargetCluster);
        setTargetCluster(preselectedTargetCluster);
      }
      if (preselectedTargetNamespace) {
        console.log('Pre-selecting target namespace from drag-and-drop:', preselectedTargetNamespace);
        setTargetProject(preselectedTargetNamespace);
      }
    }
  }, [isOpen, showWizardContent, preselectedTargetCluster, preselectedTargetNamespace]);
  
  // Get namespaces for target cluster
  const targetNamespaces = React.useMemo(() => {
    if (!targetCluster) return [];
    return getNamespacesByCluster(targetCluster);
  }, [targetCluster]);
  
  // Validation
  const isSameLocation = React.useMemo(() => {
    if (!targetCluster || !targetProject || !sourceVM) return false;
    return targetCluster === sourceVM.clusterId && targetProject === sourceVM.namespaceId;
  }, [targetCluster, targetProject, sourceVM]);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showProgress && progress < 100) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            return 100;
          }
          // Increment by random amount between 1-5% every 200ms
          return Math.min(prev + Math.random() * 5 + 1, 100);
        });
      }, 200);
    }
    
    // When migration completes, close wizard after a short delay
    if (showProgress && progress >= 100) {
      const timeout = setTimeout(() => {
        console.log('✅ Migration completed successfully!');
        handleClose();
        // Force page reload to refresh VM data
        window.location.reload();
      }, 1500);
      return () => clearTimeout(timeout);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showProgress, progress]);

  const handleClose = () => {
    // Reset form
    setMigrationName('');
    setMigrationReason('Not stated');
    setCustomReason('');
    setShowProgress(false);
    setProgress(0);
    setIsReasonSelectOpen(false);
    setFilteredVMIds(selectedVMs);
    setIsStatusWarningModalOpen(false);
    setShowWizardContent(false);
    onClose();
  };

  const handleContinueWithRunningVMs = () => {
    const runningVMIds = allSelectedVMs
      .filter(vm => vm.status === 'Running')
      .map(vm => vm.id);
    
    console.log('Continuing with running VMs:', runningVMIds);
    setFilteredVMIds(runningVMIds);
    setIsStatusWarningModalOpen(false);
    setShowWizardContent(true); // Now show the wizard
  };

  const handleMigrateNow = () => {
    console.log('Starting migration:', {
      name: migrationName || `Migration-${new Date().toISOString().split('T')[0]}`,
      reason: actualMigrationReason,
      vms: selectedVMs,
      source: { cluster: sourceCluster?.name, namespace: sourceNamespace?.name },
      target: { cluster: targetCluster, namespace: targetProject },
    });
    
    // Perform the actual migration
    selectedVMs.forEach(vmId => {
      const vmIndex = virtualMachines.findIndex(vm => vm.id === vmId);
      if (vmIndex !== -1) {
        // Update the VM's cluster and namespace
        virtualMachines[vmIndex].clusterId = targetCluster;
        virtualMachines[vmIndex].namespaceId = targetProject;
        console.log(`✅ Migrated VM ${virtualMachines[vmIndex].name} to ${targetCluster}/${targetProject}`);
      }
    });
    
    setShowProgress(true);
    setProgress(0);
  };

  const handleSave = () => {
    console.log('Migration plan saved for later:', {
      name: migrationName,
      reason: migrationReason,
      vms: selectedVMs,
    });
    handleClose();
  };

  const handleCancelMigration = () => {
    console.log('Migration cancelled');
    setIsStatusWarningModalOpen(false);
    handleClose();
  };

  const generalInformationStep = (
    <div>
      <Title headingLevel="h2" size="xl" className="pf-v6-u-mb-sm">
        General information
      </Title>
      
      <Form>
        <FormGroup label="Name">
          <TextInput
            type="text"
            id="migration-name"
            name="migration-name"
            value={migrationName}
            onChange={(_event, value) => setMigrationName(value)}
            placeholder={`Migration-${new Date().toISOString().split('T')[0]}`}
          />
          <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)', marginTop: '8px' }}>
            If you don't create a name, we'll generate a migration plan name for you
          </div>
        </FormGroup>

        <FormGroup label="Migration reason (optional)">
          <Select
            isOpen={isReasonSelectOpen}
            selected={migrationReason}
            onSelect={(_event, value) => {
              setMigrationReason(value as string);
              setIsReasonSelectOpen(false);
              // Clear custom reason if not selecting "Other"
              if (value !== 'Other') {
                setCustomReason('');
              }
            }}
            onOpenChange={(isOpen) => setIsReasonSelectOpen(isOpen)}
            toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
              <MenuToggle
                ref={toggleRef}
                onClick={() => setIsReasonSelectOpen(!isReasonSelectOpen)}
                isExpanded={isReasonSelectOpen}
                isFullWidth
              >
                {migrationReason}
              </MenuToggle>
            )}
          >
            <SelectList>
              {predefinedReasons.map((reason) => (
                <SelectOption key={reason} value={reason}>
                  {reason}
                </SelectOption>
              ))}
            </SelectList>
          </Select>
          {migrationReason === 'Other' && (
            <>
              <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)', marginTop: '12px', marginBottom: '8px' }}>
                Specify your custom reason
              </div>
              <TextInput
                type="text"
                id="custom-reason"
                name="custom-reason"
                value={customReason}
                onChange={(_event, value) => setCustomReason(value)}
                placeholder="Type your custom reason here..."
              />
            </>
          )}
        </FormGroup>
      </Form>
    </div>
  );

  const targetPlacementStep = (
    <div>
      <Title headingLevel="h2" size="xl" style={{ marginBottom: '24px' }}>
        Target placement
      </Title>
      
      {/* Validation warning */}
      {isSameLocation && (
        <Alert 
          variant="warning" 
          title="Same location selected" 
          style={{ marginBottom: '24px' }}
        >
          The target location is the same as the source. Please select a different cluster or project.
        </Alert>
      )}
      
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        {/* Source Section */}
        <div style={{ 
          flex: 1, 
          border: '1px solid var(--pf-t--global--border--color--default)', 
          borderRadius: '8px',
          padding: '16px',
          backgroundColor: 'var(--pf-t--global--background--color--secondary--default)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '16px' }}>Source</h3>
          
          <FormGroup label="Cluster" style={{ marginBottom: '16px' }}>
            <TextInput
              type="text"
              value={sourceCluster?.name || 'N/A'}
              readOnly
              aria-label="Source cluster"
              style={{ 
                cursor: 'default', 
                pointerEvents: 'none',
                color: 'var(--pf-t--global--text--color--subtle)',
                backgroundColor: 'var(--pf-t--global--background--color--primary--default)'
              }}
            />
          </FormGroup>

          <FormGroup label="Project">
            <TextInput
              type="text"
              value={sourceNamespace?.name || 'N/A'}
              readOnly
              aria-label="Source project"
              style={{ 
                cursor: 'default', 
                pointerEvents: 'none',
                color: 'var(--pf-t--global--text--color--subtle)',
                backgroundColor: 'var(--pf-t--global--background--color--primary--default)'
              }}
            />
          </FormGroup>
        </div>

        {/* Arrow */}
        <div style={{ fontSize: '2rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
          →
        </div>

        {/* Target Section */}
        <div style={{ 
          flex: 1, 
          border: '1px solid var(--pf-t--global--border--color--default)', 
          borderRadius: '8px',
          padding: '16px',
          backgroundColor: isFromDragAndDrop ? 'var(--pf-t--global--background--color--secondary--default)' : undefined
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>Target *</h3>
            {!isFromDragAndDrop && (
              <Button 
                variant="link" 
                onClick={() => {
                  setTargetCluster('');
                  setTargetProject('');
                }}
                style={{ padding: 0, fontSize: '0.875rem' }}
              >
                Clear all
              </Button>
            )}
          </div>
          
          <FormGroup label="Cluster" style={{ marginBottom: '16px' }}>
            {isFromDragAndDrop ? (
              <TextInput
                type="text"
                value={allClusters.find(c => c.id === targetCluster)?.name || 'N/A'}
                readOnly
                aria-label="Target cluster"
                style={{ 
                  cursor: 'default', 
                  pointerEvents: 'none',
                  color: 'var(--pf-t--global--text--color--subtle)',
                  backgroundColor: 'var(--pf-t--global--background--color--primary--default)'
                }}
              />
            ) : (
              <FormSelect
                value={targetCluster}
                onChange={(_event, value) => {
                  setTargetCluster(value as string);
                  setTargetProject(''); // Reset project when cluster changes
                }}
                aria-label="Target cluster"
              >
                <FormSelectOption value="" label="Select Cluster" />
                {allClusters.map(cluster => (
                  <FormSelectOption 
                    key={cluster.id} 
                    value={cluster.id} 
                    label={`${cluster.name} (${cluster.region})`} 
                  />
                ))}
              </FormSelect>
            )}
          </FormGroup>

          <FormGroup label="Project">
            {isFromDragAndDrop ? (
              <TextInput
                type="text"
                value={targetNamespaces.find(ns => ns.id === targetProject)?.name || 'N/A'}
                readOnly
                aria-label="Target project"
                style={{ 
                  cursor: 'default', 
                  pointerEvents: 'none',
                  color: 'var(--pf-t--global--text--color--subtle)',
                  backgroundColor: 'var(--pf-t--global--background--color--primary--default)'
                }}
              />
            ) : (
              <FormSelect
                value={targetProject}
                onChange={(_event, value) => setTargetProject(value as string)}
                isDisabled={!targetCluster}
                aria-label="Target project"
              >
                <FormSelectOption 
                  value="" 
                  label={targetCluster ? "Select project" : "To select a project, pick a cluster"} 
                />
                {targetNamespaces.map(namespace => (
                  <FormSelectOption 
                    key={namespace.id} 
                    value={namespace.id} 
                    label={namespace.name} 
                  />
                ))}
              </FormSelect>
            )}
          </FormGroup>
        </div>
      </div>
    </div>
  );

  const [selectedCheck, setSelectedCheck] = React.useState<string>('network');

  const renderCheckDetail = () => {
    switch (selectedCheck) {
      case 'network':
        return (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px' }}>Network mapping</h3>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Source network</div>
                <div>network1</div>
              </div>
              <div style={{ fontSize: '1.5rem', color: 'var(--pf-t--global--text--color--subtle)' }}>→</div>
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Target network</div>
                <div>network1</div>
              </div>
              <Button variant="link" style={{ marginLeft: 'auto', padding: 0 }}>
                Edit
              </Button>
            </div>
          </div>
        );
      case 'storage':
        return (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px' }}>Storage mapping</h3>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Source storage</div>
                <div>storage1</div>
              </div>
              <div style={{ fontSize: '1.5rem', color: 'var(--pf-t--global--text--color--subtle)' }}>→</div>
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Target storage</div>
                <div>storage1</div>
              </div>
              <Button variant="link" style={{ marginLeft: 'auto', padding: 0 }}>
                Edit
              </Button>
            </div>
          </div>
        );
      case 'compute':
        return (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px' }}>Compute compatibility</h3>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Source cluster compute</div>
                <div>Compute1</div>
              </div>
              <div style={{ fontSize: '1.5rem', color: 'var(--pf-t--global--text--color--subtle)' }}>→</div>
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Target cluster compute</div>
                <div>Compute1</div>
              </div>
            </div>
          </div>
        );
      case 'version':
        return (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '24px' }}>Version compatibility</h3>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>OpenShift version</div>
              <div style={{ display: 'flex', gap: '48px' }}>
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '0.875rem' }}>Source cluster</div>
                  <div>4.20</div>
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '0.875rem' }}>Target cluster</div>
                  <div>4.20</div>
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>Virtualization operator version</div>
              <div style={{ display: 'flex', gap: '48px' }}>
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '0.875rm' }}>Source cluster</div>
                  <div>4.19</div>
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '0.875rem' }}>Target cluster</div>
                  <div>4.19</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'resource':
        return (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '24px' }}>Resource capacity</h3>
            <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--pf-t--global--border--color--default)' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  backgroundColor: 'var(--pf-t--global--color--brand--default)',
                  borderRadius: '2px'
                }}></span>
                Source size
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                <div>Storage XXX GB</div>
                <div>Memory XXX GB</div>
                <div>CPU XXX cores</div>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '16px' }}>Target cluster capacity (test-south-eu)</div>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold' }}>Storage: 238 GB</span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '20px', 
                  backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '4px'
                }}>
                  <div style={{ 
                    width: '46%', 
                    height: '100%', 
                    backgroundColor: 'var(--pf-t--global--color--brand--default)'
                  }}></div>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.875rem' }}>
                  <span>■ 111 GB used</span>
                  <span>□ 121 GB free</span>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold' }}>Memory: 40 GB</span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '20px', 
                  backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '4px'
                }}>
                  <div style={{ 
                    width: '75%', 
                    height: '100%', 
                    backgroundColor: 'var(--pf-t--global--color--brand--default)'
                  }}></div>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.875rem' }}>
                  <span>■ 30 GB used</span>
                  <span>□ 10 GB free</span>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold' }}>CPU: 15 cores</span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '20px', 
                  backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '4px'
                }}>
                  <div style={{ 
                    width: '66%', 
                    height: '100%', 
                    backgroundColor: 'var(--pf-t--global--color--brand--default)'
                  }}></div>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.875rem' }}>
                  <span>■ 10 cores</span>
                  <span>□ 5 cores</span>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const migrationReadinessStep = (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Title headingLevel="h2" size="xl">
          Migration readiness
        </Title>
        <Button variant="link" style={{ padding: 0 }}>Run again</Button>
      </div>
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        padding: '12px 16px',
        backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
        borderRadius: '8px',
        marginBottom: '24px'
      }}>
        <span style={{ color: 'var(--pf-t--global--icon--color--status--success)' }}>✓</span>
        <span style={{ fontWeight: 'bold' }}>Ready to migrate</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
          5 successful checks
        </span>
      </div>

      <div style={{ display: 'flex', gap: '24px', borderTop: '1px solid var(--pf-t--global--border--color--default)', paddingTop: '24px' }}>
        {/* Left sidebar with checks */}
        <div style={{ width: '200px', borderRight: '1px solid var(--pf-t--global--border--color--default)', paddingRight: '16px' }}>
          <div
            onClick={() => setSelectedCheck('network')}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              backgroundColor: selectedCheck === 'network' ? 'var(--pf-t--global--background--color--action--plain--clicked)' : 'transparent',
              borderRadius: '4px',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ color: 'var(--pf-t--global--icon--color--status--success)' }}>✓</span>
            Network mapping
          </div>
          <div
            onClick={() => setSelectedCheck('storage')}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              backgroundColor: selectedCheck === 'storage' ? 'var(--pf-t--global--background--color--action--plain--clicked)' : 'transparent',
              borderRadius: '4px',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ color: 'var(--pf-t--global--icon--color--status--success)' }}>✓</span>
            Storage mapping
          </div>
          <div
            onClick={() => setSelectedCheck('compute')}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              backgroundColor: selectedCheck === 'compute' ? 'var(--pf-t--global--background--color--action--plain--clicked)' : 'transparent',
              borderRadius: '4px',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ color: 'var(--pf-t--global--icon--color--status--success)' }}>✓</span>
            Compute compatibility
          </div>
          <div
            onClick={() => setSelectedCheck('version')}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              backgroundColor: selectedCheck === 'version' ? 'var(--pf-t--global--background--color--action--plain--clicked)' : 'transparent',
              borderRadius: '4px',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ color: 'var(--pf-t--global--icon--color--status--success)' }}>✓</span>
            Version compatibility
          </div>
          <div
            onClick={() => setSelectedCheck('resource')}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              backgroundColor: selectedCheck === 'resource' ? 'var(--pf-t--global--background--color--action--plain--clicked)' : 'transparent',
              borderRadius: '4px',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ color: 'var(--pf-t--global--icon--color--status--success)' }}>✓</span>
            Resource capacity
          </div>
        </div>

        {/* Right panel with details */}
        <div style={{ flex: 1 }}>
          {renderCheckDetail()}
        </div>
      </div>
    </div>
  );

  const reviewStep = (
    <Drawer isExpanded={isVMDrawerOpen}>
      <DrawerContent
        panelContent={
          <DrawerPanelContent style={{ minWidth: '400px' }}>
            <DrawerHead>
              <Title headingLevel="h3" size="xl">
                Virtual machines ({vmsToMigrate.length})
              </Title>
              <DrawerActions>
                <DrawerCloseButton onClick={() => setIsVMDrawerOpen(false)} />
              </DrawerActions>
            </DrawerHead>
            <div style={{ padding: '16px' }}>
              <Table variant="compact" borders={false}>
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {vmsToMigrate.map((vm, index) => (
                    <Tr key={vm?.id}>
                      <Td>{vm?.name}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </div>
          </DrawerPanelContent>
        }
      >
        <DrawerContentBody>
          <div>
            <Title headingLevel="h2" size="xl" className="pf-v6-u-mb-lg">
              Review
            </Title>
            
            {/* General information section */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>General information</h3>
                <Button variant="link" onClick={() => setActiveStep(1)} style={{ padding: 0 }}>
                  Edit step
                </Button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '12px', fontSize: '0.875rem' }}>
                <div style={{ fontWeight: 'bold' }}>Virtual machines</div>
                <div>
                  <Button 
                    variant="link" 
                    onClick={() => setIsVMDrawerOpen(true)}
                    style={{ padding: 0, fontSize: '0.875rem' }}
                  >
                    {vmsToMigrate.length} virtual machine{vmsToMigrate.length !== 1 ? 's' : ''}
                  </Button>
                </div>
                <div style={{ fontWeight: 'bold' }}>Name</div>
                <div>{migrationName || `Migration-${new Date().toISOString().split('T')[0]}`}</div>
                <div style={{ fontWeight: 'bold' }}>Migration reason</div>
                <div>{actualMigrationReason}</div>
              </div>
            </div>

      {/* Placement section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>Placement</h3>
          <Button variant="link" onClick={() => setActiveStep(2)} style={{ padding: 0 }}>
            Edit step
          </Button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 40px 200px 1fr', gap: '12px', fontSize: '0.875rem', alignItems: 'center' }}>
          <div style={{ fontWeight: 'bold' }}>Source cluster</div>
          <div>{sourceCluster?.name || 'N/A'}</div>
          <div style={{ textAlign: 'center', fontSize: '1.2rem', color: 'var(--pf-t--global--text--color--subtle)' }}>→</div>
          <div style={{ fontWeight: 'bold' }}>Target cluster</div>
          <div>{allClusters.find(c => c.id === targetCluster)?.name || 'Not selected'}</div>
          
          <div style={{ fontWeight: 'bold' }}>Source project</div>
          <div>{sourceNamespace?.name || 'N/A'}</div>
          <div style={{ textAlign: 'center', fontSize: '1.2rem', color: 'var(--pf-t--global--text--color--subtle)' }}>→</div>
          <div style={{ fontWeight: 'bold' }}>Target project</div>
          <div>{targetNamespaces.find(ns => ns.id === targetProject)?.name || 'Not selected'}</div>
        </div>
      </div>

      {/* Migration readiness section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>Migration readiness</h3>
          <Button variant="link" onClick={() => setActiveStep(3)} style={{ padding: 0 }}>
            Edit step
          </Button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '12px', fontSize: '0.875rem' }}>
          <div style={{ fontWeight: 'bold' }}>Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--pf-t--global--icon--color--status--success)' }}>✓</span>
            Ready to migrate
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        border: '1px solid var(--pf-t--global--border--color--default)',
        borderRadius: '8px',
        backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
        marginBottom: '24px'
      }}>
        <span style={{ fontSize: '1.25rem', color: 'var(--pf-t--global--icon--color--status--info)' }}>ℹ</span>
        <span>During migration, VMs will be processed and moved in groups of 5.</span>
      </div>
          </div>
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );

  const [activeStep, setActiveStep] = React.useState(1);

  const onNext = () => {
    if (activeStep < 4) {
      setActiveStep(activeStep + 1);
    } else {
      handleSave();
    }
  };

  const onBack = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const getCurrentStep = () => {
    switch (activeStep) {
      case 1:
        return generalInformationStep;
      case 2:
        return targetPlacementStep;
      case 3:
        return migrationReadinessStep;
      case 4:
        return reviewStep;
      default:
        return generalInformationStep;
    }
  };

  const getStepName = () => {
    switch (activeStep) {
      case 1:
        return 'General information';
      case 2:
        return 'Target placement';
      case 3:
        return 'Migration readiness';
      case 4:
        return 'Review';
      default:
        return '';
    }
  };

  const progressScreen = (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '400px',
      padding: '48px'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '24px' }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--pf-t--global--icon--color--subtle)' }}>
          <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
        </svg>
      </div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px' }}>
        Migration in progress
      </h2>
      <div style={{ width: '100%', maxWidth: '500px', marginBottom: '8px' }}>
        <div style={{ 
          width: '100%', 
          height: '24px', 
          backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
          borderRadius: '4px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{ 
            width: `${progress}%`, 
            height: '100%', 
            backgroundColor: 'var(--pf-t--global--color--brand--default)',
            transition: 'width 0.2s ease-in-out'
          }}></div>
        </div>
      </div>
      <div style={{ marginBottom: '24px', fontSize: '0.875rem', fontWeight: 'bold' }}>
        {Math.round(progress)}%
      </div>
      <div style={{ marginBottom: '32px', color: 'var(--pf-t--global--text--color--subtle)' }}>
        The migration will continue if you close this popup
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <Button variant="primary">View migration plan</Button>
        <Button variant="secondary" onClick={handleClose}>Close</Button>
      </div>
      <Button variant="link" onClick={handleCancelMigration} style={{ color: 'var(--pf-t--global--color--status--danger--default)' }}>
        Cancel migration process
      </Button>
    </div>
  );

  return (
    <>
    <Modal
      variant={ModalVariant.large}
      isOpen={isOpen && showWizardContent}
      onClose={handleClose}
      aria-labelledby="migrate-vms-wizard-title"
      style={{ 
        '--pf-v6-c-modal-box--m-body--PaddingTop': '0',
        '--pf-v6-c-modal-box--m-body--PaddingRight': '0',
        '--pf-v6-c-modal-box--m-body--PaddingBottom': '0',
        '--pf-v6-c-modal-box--m-body--PaddingLeft': '0'
      } as React.CSSProperties}
    >
      {showProgress ? progressScreen : (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header Section */}
          <div style={{ 
            backgroundColor: '#f0f0f0', 
            padding: '1.5rem', 
            borderBottom: '1px solid #d2d2d2',
            flexShrink: 0
          }}>
            <Title headingLevel="h1" size="2xl" id="migrate-vms-wizard-title">
              Migrate virtual machines
            </Title>
            <Content component="p" style={{ marginTop: '0.5rem', color: '#6a6e73' }}>
              Choose the target location for your VMs, then adjust your migration plan if necessary.
            </Content>
          </div>

          {/* Body with Steps Navigation and Content */}
          <div style={{ 
            display: 'flex', 
            flex: 1, 
            minHeight: 0, 
            alignItems: 'stretch', 
            overflow: 'hidden',
            margin: 0,
            padding: 0
          }}>
            {/* Left Navigation Panel */}
            <div style={{ 
              width: '300px', 
              padding: '1.5rem 1rem',
              borderRight: '1px solid #d2d2d2',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
              margin: 0
            }}>
              <div
                onClick={() => setActiveStep(1)}
                style={{
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  backgroundColor: activeStep === 1 ? '#fafafa' : 'transparent',
                  marginBottom: '0',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '4px',
                }}
              >
                <span style={{ 
                  marginRight: '12px', 
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: activeStep === 1 ? '#0066cc' : '#d2d2d2',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  1
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: '400', color: '#151515' }}>
                  General information
                </span>
              </div>
              <div
                onClick={() => setActiveStep(2)}
                style={{
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  backgroundColor: activeStep === 2 ? '#fafafa' : 'transparent',
                  marginBottom: '0',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '4px',
                }}
              >
                <span style={{ 
                  marginRight: '12px', 
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: activeStep === 2 ? '#0066cc' : '#d2d2d2',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  2
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: '400', color: '#151515' }}>
                  Target placement
                </span>
              </div>
              <div
                onClick={() => setActiveStep(3)}
                style={{
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  backgroundColor: activeStep === 3 ? '#fafafa' : 'transparent',
                  marginBottom: '0',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '4px',
                }}
              >
                <span style={{ 
                  marginRight: '12px', 
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: activeStep === 3 ? '#0066cc' : '#d2d2d2',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  3
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: '400', color: '#151515' }}>
                  Migration readiness
                </span>
              </div>
              <div
                onClick={() => setActiveStep(4)}
                style={{
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  backgroundColor: activeStep === 4 ? '#fafafa' : 'transparent',
                  marginBottom: '0',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '4px',
                }}
              >
                <span style={{ 
                  marginRight: '12px', 
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: activeStep === 4 ? '#0066cc' : '#d2d2d2',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  4
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: '400', color: '#151515' }}>
                  Review
                </span>
              </div>
            </div>
            
            {/* Right Content Area with Footer */}
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              minHeight: 0, 
              overflow: 'hidden',
              margin: 0,
              padding: 0
            }}>
              {/* Content Area - scrollable */}
              <div style={{ 
                flex: '1 1 0',
                padding: '1.5rem', 
                backgroundColor: '#ffffff',
                overflowY: 'auto',
                overflowX: 'hidden'
              }}>
                {getCurrentStep()}
              </div>
              
              {/* Footer with Buttons */}
              <div style={{ 
                borderTop: '1px solid #d2d2d2', 
                padding: '1rem 1.5rem', 
                backgroundColor: '#ffffff',
                flexShrink: 0
              }}>
              <Button variant="secondary" onClick={onBack} isDisabled={activeStep === 1}>
                Back
              </Button>
              {activeStep === 4 ? (
                <>
                  <Button 
                    variant="primary" 
                    onClick={handleMigrateNow}
                    isDisabled={!targetCluster || !targetProject || isSameLocation}
                  >
                    Migrate now
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={handleSave}
                    isDisabled={!targetCluster || !targetProject || isSameLocation}
                  >
                    Save and migrate later
                  </Button>
                </>
              ) : (
                <Button 
                  variant="primary" 
                  onClick={onNext}
                  isDisabled={activeStep === 2 && (!targetCluster || !targetProject || isSameLocation)}
                >
                  Next
                </Button>
              )}
              {' '}
              <Button variant="link" onClick={handleClose}>
                Cancel
              </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>

      {/* Status Warning Modal */}
      <Modal
        isOpen={isStatusWarningModalOpen}
        variant={ModalVariant.small}
        onClose={handleCancelMigration}
        aria-label="VM migration status warning"
      >
        <div style={{ padding: '24px' }}>
          <Title headingLevel="h1" size="2xl" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
            Not all VMs will migrate
          </Title>

          <Content component="p" style={{ 
            marginBottom: 'var(--pf-t--global--spacer--lg)',
            fontSize: '16px',
            lineHeight: '1.6'
          }}>
            To (live) migrate a VM, it must be running. <strong>{vmStatusCounts.nonRunning}</strong> out of selected <strong>{vmStatusCounts.total}</strong> virtual machines {vmStatusCounts.nonRunning === 1 ? 'is' : 'are'} not running. We can continue the migration with just the running VMs or you can start the stopped ones now.
          </Content>
          
          <div style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}>
            <Content component="p" style={{ 
              fontWeight: 'bold', 
              marginBottom: 'var(--pf-t--global--spacer--sm)',
              fontSize: '15px'
            }}>
              Virtual machines statuses
            </Content>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pf-t--global--spacer--sm)' }}>
              {Object.entries(vmStatusCounts.breakdown)
                .sort(([statusA], [statusB]) => {
                  // Show Running first, then alphabetically
                  if (statusA === 'Running') return -1;
                  if (statusB === 'Running') return 1;
                  return statusA.localeCompare(statusB);
                })
                .map(([status, count]) => {
                  const { Icon, color } = getStatusIcon(status);
                  return (
                    <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Icon style={{ color }} />
                      <span style={{ fontSize: '15px' }}>
                        <strong>{count}</strong> {count === 1 ? 'VM' : 'VMs'} {status.toLowerCase()}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
          
          <Content component="p" style={{ 
            color: 'var(--pf-t--global--text--color--subtle)',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            If you would like to continue, only the selected <strong>{vmStatusCounts.running}</strong> running VMs will be available for migration.
          </Content>

          {/* Footer with buttons */}
          <div style={{ 
            marginTop: 'var(--pf-t--global--spacer--lg)',
            paddingTop: 'var(--pf-t--global--spacer--md)',
            borderTop: '1px solid var(--pf-t--global--border--color--default)'
          }}>
            <div style={{ 
              display: 'flex',
              gap: '8px',
              justifyContent: 'flex-end'
            }}>
              <Button variant="link" onClick={handleCancelMigration}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleContinueWithRunningVMs}>
                Continue to next step
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};


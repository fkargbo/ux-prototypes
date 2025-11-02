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
  Checkbox,
} from '@patternfly/react-core';

interface CloneVMsWizardProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVMs: string[];
}

export const CloneVMsWizard: React.FunctionComponent<CloneVMsWizardProps> = ({
  isOpen,
  onClose,
  selectedVMs,
}) => {
  const [cloneNamePrefix, setCloneNamePrefix] = React.useState('clone');
  const [cloneCount, setCloneCount] = React.useState(1);
  const [startPowerState, setStartPowerState] = React.useState('stopped');
  const [cloneStorage, setCloneStorage] = React.useState(true);
  const [showProgress, setShowProgress] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showProgress && progress < 100) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            return 100;
          }
          return Math.min(prev + Math.random() * 5 + 1, 100);
        });
      }, 200);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showProgress, progress]);

  const handleClose = () => {
    setCloneNamePrefix('clone');
    setCloneCount(1);
    setStartPowerState('stopped');
    setCloneStorage(true);
    setShowProgress(false);
    setProgress(0);
    onClose();
  };

  const handleCloneNow = () => {
    console.log('Clone operation started:', {
      prefix: cloneNamePrefix,
      count: cloneCount,
      powerState: startPowerState,
      includeStorage: cloneStorage,
      vms: selectedVMs,
    });
    setShowProgress(true);
    setProgress(0);
  };

  const handleSave = () => {
    console.log('Clone plan saved for later:', {
      prefix: cloneNamePrefix,
      count: cloneCount,
      powerState: startPowerState,
      includeStorage: cloneStorage,
      vms: selectedVMs,
    });
    handleClose();
  };

  const handleCancelClone = () => {
    console.log('Clone cancelled');
    handleClose();
  };

  const cloneConfigurationStep = (
    <div>
      <Title headingLevel="h2" size="xl" className="pf-v6-u-mb-sm">
        Clone configuration
      </Title>
      
      <Form>
        <FormGroup label="Clone name prefix" isRequired>
          <TextInput
            type="text"
            id="clone-name-prefix"
            name="clone-name-prefix"
            value={cloneNamePrefix}
            onChange={(_event, value) => setCloneNamePrefix(value)}
            placeholder="clone"
          />
          <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)', marginTop: '8px' }}>
            Clones will be named: {cloneNamePrefix}-vm-name-01, {cloneNamePrefix}-vm-name-02, etc.
          </div>
        </FormGroup>

        <FormGroup label="Number of clones per VM">
          <FormSelect
            value={cloneCount}
            onChange={(_event, value) => setCloneCount(Number(value))}
            id="clone-count"
            name="clone-count"
          >
            <FormSelectOption value={1} label="1 clone" />
            <FormSelectOption value={2} label="2 clones" />
            <FormSelectOption value={3} label="3 clones" />
            <FormSelectOption value={5} label="5 clones" />
          </FormSelect>
          <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)', marginTop: '8px' }}>
            Total VMs to create: {selectedVMs.length} × {cloneCount} = {selectedVMs.length * cloneCount} VMs
          </div>
        </FormGroup>

        <FormGroup label="Power state after clone">
          <FormSelect
            value={startPowerState}
            onChange={(_event, value) => setStartPowerState(value as string)}
            id="start-power-state"
            name="start-power-state"
          >
            <FormSelectOption value="stopped" label="Stopped (recommended)" />
            <FormSelectOption value="running" label="Running" />
          </FormSelect>
          <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)', marginTop: '8px' }}>
            Cloned VMs will be created in this state
          </div>
        </FormGroup>

        <FormGroup>
          <Checkbox
            id="clone-storage"
            label="Clone storage volumes"
            isChecked={cloneStorage}
            onChange={(_event, checked) => setCloneStorage(checked)}
          />
          <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)', marginTop: '8px', marginLeft: '24px' }}>
            Create independent copies of all storage volumes (recommended)
          </div>
        </FormGroup>
      </Form>
    </div>
  );

  const [targetCluster, setTargetCluster] = React.useState('');
  const [targetProject, setTargetProject] = React.useState('');

  const targetPlacementStep = (
    <div>
      <Title headingLevel="h2" size="xl" className="pf-v6-u-mb-md">
        Target placement
      </Title>
      
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
          
          <FormGroup label="Cluster">
            <TextInput
              type="text"
              value="test-west-eu"
              isDisabled
              aria-label="Source cluster"
            />
          </FormGroup>

          <FormGroup label="Project">
            <TextInput
              type="text"
              value="test"
              isDisabled
              aria-label="Source project"
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
          padding: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>Target *</h3>
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
          </div>
          
          <FormGroup label="Cluster">
            <FormSelect
              value={targetCluster}
              onChange={(_event, value) => {
                setTargetCluster(value as string);
                setTargetProject('');
              }}
              aria-label="Target cluster"
            >
              <FormSelectOption value="" label="Select Cluster (same cluster default)" />
              <FormSelectOption value="test-south-eu" label="test-south-eu" />
              <FormSelectOption value="test-north-eu" label="test-north-eu" />
              <FormSelectOption value="test-central-eu" label="test-central-eu" />
            </FormSelect>
          </FormGroup>

          <FormGroup label="Project">
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
              {targetCluster && (
                <>
                  <FormSelectOption value="test" label="test" />
                  <FormSelectOption value="production" label="production" />
                  <FormSelectOption value="staging" label="staging" />
                  <FormSelectOption value="development" label="development" />
                </>
              )}
            </FormSelect>
          </FormGroup>
        </div>
      </div>

      <div style={{ 
        marginTop: '24px',
        padding: '16px',
        border: '1px solid var(--pf-t--global--border--color--default)',
        borderRadius: '8px',
        backgroundColor: 'var(--pf-t--global--background--color--primary--default)'
      }}>
        <span style={{ fontSize: '1.25rem', marginRight: '12px' }}>ℹ️</span>
        <span>
          If no target is selected, clones will be created in the same cluster and project as the source VMs.
        </span>
      </div>
    </div>
  );

  const reviewStep = (
    <div>
      <Title headingLevel="h2" size="xl" className="pf-v6-u-mb-lg">
        Review
      </Title>
      
      {/* Clone configuration section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>Clone configuration</h3>
          <Button variant="link" onClick={() => setActiveStep(1)} style={{ padding: 0 }}>
            Edit step
          </Button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '12px', fontSize: '0.875rem' }}>
          <div style={{ fontWeight: 'bold' }}>Name prefix</div>
          <div>{cloneNamePrefix}</div>
          <div style={{ fontWeight: 'bold' }}>Clones per VM</div>
          <div>{cloneCount}</div>
          <div style={{ fontWeight: 'bold' }}>Total VMs</div>
          <div>{selectedVMs.length * cloneCount} VMs</div>
          <div style={{ fontWeight: 'bold' }}>Power state</div>
          <div>{startPowerState === 'stopped' ? 'Stopped' : 'Running'}</div>
          <div style={{ fontWeight: 'bold' }}>Clone storage</div>
          <div>{cloneStorage ? 'Yes' : 'No'}</div>
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
          <div>test-west-eu</div>
          <div style={{ textAlign: 'center', fontSize: '1.2rem', color: 'var(--pf-t--global--text--color--subtle)' }}>→</div>
          <div style={{ fontWeight: 'bold' }}>Target cluster</div>
          <div>{targetCluster || 'test-west-eu (same)'}</div>
          
          <div style={{ fontWeight: 'bold' }}>Source project</div>
          <div>test</div>
          <div style={{ textAlign: 'center', fontSize: '1.2rem', color: 'var(--pf-t--global--text--color--subtle)' }}>→</div>
          <div style={{ fontWeight: 'bold' }}>Target project</div>
          <div>{targetProject || 'test (same)'}</div>
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
        <span style={{ fontSize: '1.25rem', color: 'var(--pf-t--global--icon--color--status--success)' }}>✓</span>
        <span>Ready to clone {selectedVMs.length * cloneCount} virtual machines</span>
      </div>
    </div>
  );

  const [activeStep, setActiveStep] = React.useState(1);

  const onNext = () => {
    if (activeStep < 3) {
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
        return cloneConfigurationStep;
      case 2:
        return targetPlacementStep;
      case 3:
        return reviewStep;
      default:
        return cloneConfigurationStep;
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
        📋
      </div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px' }}>
        Cloning in progress
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
            backgroundColor: 'var(--pf-t--global--color--status--success--default)',
            transition: 'width 0.2s ease-in-out'
          }}></div>
        </div>
      </div>
      <div style={{ marginBottom: '24px', fontSize: '0.875rem', fontWeight: 'bold' }}>
        {Math.round(progress)}%
      </div>
      <div style={{ marginBottom: '32px', color: 'var(--pf-t--global--text--color--subtle)' }}>
        The cloning will continue if you close this popup
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <Button variant="primary">View clone tasks</Button>
        <Button variant="secondary" onClick={handleClose}>Close</Button>
      </div>
      <Button variant="link" onClick={handleCancelClone} style={{ color: 'var(--pf-t--global--color--status--danger--default)' }}>
        Cancel clone process
      </Button>
    </div>
  );

  return (
    <Modal
      variant={ModalVariant.large}
      isOpen={isOpen}
      onClose={handleClose}
      aria-labelledby="clone-vms-wizard-title"
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
            backgroundColor: '#d4edda', 
            padding: '1.5rem', 
            borderBottom: '1px solid #c3e6cb',
            flexShrink: 0
          }}>
            <Title headingLevel="h1" size="2xl" id="clone-vms-wizard-title">
              Clone virtual machines
            </Title>
            <Content component="p" style={{ marginTop: '0.5rem', color: '#155724' }}>
              Create copies of selected VMs with customizable configuration.
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
                  padding: '0.75rem 0.75rem',
                  cursor: 'pointer',
                  backgroundColor: activeStep === 1 ? '#d4edda' : 'transparent',
                  borderLeft: activeStep === 1 ? '4px solid #28a745' : '4px solid transparent',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: '-1rem',
                  paddingLeft: 'calc(0.75rem + 4px)',
                }}
              >
                <span style={{ 
                  marginRight: '12px', 
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: activeStep >= 1 ? '#28a745' : '#d2d2d2',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}>
                  1
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: activeStep === 1 ? '600' : '400' }}>
                  Clone configuration
                </span>
              </div>
              <div
                onClick={() => setActiveStep(2)}
                style={{
                  padding: '0.75rem 0.75rem',
                  cursor: 'pointer',
                  backgroundColor: activeStep === 2 ? '#d4edda' : 'transparent',
                  borderLeft: activeStep === 2 ? '4px solid #28a745' : '4px solid transparent',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: '-1rem',
                  paddingLeft: 'calc(0.75rem + 4px)',
                }}
              >
                <span style={{ 
                  marginRight: '12px', 
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: activeStep >= 2 ? '#28a745' : '#d2d2d2',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}>
                  2
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: activeStep === 2 ? '600' : '400' }}>
                  Target placement
                </span>
              </div>
              <div
                onClick={() => setActiveStep(3)}
                style={{
                  padding: '0.75rem 0.75rem',
                  cursor: 'pointer',
                  backgroundColor: activeStep === 3 ? '#d4edda' : 'transparent',
                  borderLeft: activeStep === 3 ? '4px solid #28a745' : '4px solid transparent',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: '-1rem',
                  paddingLeft: 'calc(0.75rem + 4px)',
                }}
              >
                <span style={{ 
                  marginRight: '12px', 
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: activeStep >= 3 ? '#28a745' : '#d2d2d2',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}>
                  3
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: activeStep === 3 ? '600' : '400' }}>
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
              {activeStep === 3 ? (
                <>
                  <Button variant="primary" onClick={handleCloneNow}>
                    Clone now
                  </Button>
                  <Button variant="secondary" onClick={handleSave}>
                    Save and clone later
                  </Button>
                </>
              ) : (
                <Button variant="primary" onClick={onNext}>
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
  );
};


import * as React from 'react';
import {
  Modal,
  ModalVariant,
  Button,
  Content,
  Form,
  FormGroup,
  TextInput,
  Title,
  Checkbox,
} from '@patternfly/react-core';
import { getVirtualMachineById } from '../data/queries';

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
  const [cloneName, setCloneName] = React.useState('');
  const [startOnCreate, setStartOnCreate] = React.useState(false);

  // Get the source VM name for default clone name
  const sourceVM = React.useMemo(() => {
    if (selectedVMs.length > 0) {
      return getVirtualMachineById(selectedVMs[0]);
    }
    return null;
  }, [selectedVMs]);

  // Set default name when modal opens
  React.useEffect(() => {
    if (isOpen && sourceVM) {
      setCloneName(`${sourceVM.name}-clone`);
    }
  }, [isOpen, sourceVM]);

  const handleClose = () => {
    setCloneName('');
    setStartOnCreate(false);
    onClose();
  };

  const handleClone = () => {
    console.log('Clone operation started:', {
      sourceName: sourceVM?.name,
      cloneName,
      startOnCreate,
      vms: selectedVMs,
    });
    // TODO: Implement actual clone logic
    handleClose();
  };

  return (
    <Modal
      variant={ModalVariant.small}
      isOpen={isOpen}
      onClose={handleClose}
      aria-labelledby="clone-vm-modal-title"
    >
      <div style={{ padding: '24px' }}>
        <Title headingLevel="h1" size="xl" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
          Clone Virtual Machine
        </Title>
        
        <Form>
          <FormGroup label="Name" isRequired fieldId="clone-name">
            <TextInput
              type="text"
              id="clone-name"
              name="clone-name"
              value={cloneName}
              onChange={(_event, value) => setCloneName(value)}
              placeholder="Enter clone name"
            />
          </FormGroup>

          <FormGroup fieldId="start-on-create">
            <Checkbox
              id="start-on-create"
              label="Start Virtual Machine once created"
              isChecked={startOnCreate}
              onChange={(_event, checked) => setStartOnCreate(checked)}
            />
          </FormGroup>

          <Content style={{ 
            marginTop: 'var(--pf-t--global--spacer--md)', 
            fontSize: '0.875rem',
            color: 'var(--pf-t--global--text--color--subtle)',
            lineHeight: '1.6'
          }}>
            The clone will copy the configuration details of {sourceVM?.name}.
          </Content>
        </Form>

        {/* Footer with buttons */}
        <div style={{ 
          marginTop: 'var(--pf-t--global--spacer--lg)', 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: 'var(--pf-t--global--spacer--sm)' 
        }}>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleClone}
            isDisabled={!cloneName.trim()}
          >
            Clone
          </Button>
        </div>
      </div>
    </Modal>
  );
};


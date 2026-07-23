import React from 'react';
import {
  Button,
  Content,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@patternfly/react-core';

interface DeleteAgenticRunModalProps {
  isOpen: boolean;
  runName: string;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteAgenticRunModal: React.FC<DeleteAgenticRunModalProps> = ({
  isOpen,
  runName,
  isDeleting = false,
  onClose,
  onConfirm,
}) => (
  <Modal
    aria-labelledby="delete-run-modal-title"
    isOpen={isOpen}
    onClose={onClose}
    variant="small"
  >
    <ModalHeader
      id="delete-run-modal-title"
      title="Delete agentic run?"
      titleIconVariant="warning"
    />
    <ModalBody>
      <Content>
        <p>
          Are you sure you want to delete <strong>{runName}</strong>?
        </p>
        <p>
          This action cannot be undone. All associated diagnostic logs, telemetry
          evidence, and proposal history will be permanently removed.
        </p>
      </Content>
    </ModalBody>
    <ModalFooter>
      <Button
        key="confirm"
        variant="danger"
        isLoading={isDeleting}
        isDisabled={isDeleting}
        onClick={onConfirm}
      >
        Delete
      </Button>
      <Button key="cancel" variant="link" onClick={onClose}>
        Cancel
      </Button>
    </ModalFooter>
  </Modal>
);

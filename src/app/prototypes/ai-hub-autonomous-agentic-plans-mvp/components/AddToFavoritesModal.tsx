import React, { useState } from 'react';
import {
  Button,
  Form,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextInput,
} from '@patternfly/react-core';

interface AddToFavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (favoriteName: string) => void;
  defaultName?: string;
}

export const AddToFavoritesModal: React.FC<AddToFavoritesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultName = 'Agentic runs',
}) => {
  const [name, setName] = useState(defaultName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    }
  };

  return (
    <Modal
      aria-labelledby="add-to-favorites-title"
      isOpen={isOpen}
      onClose={onClose}
      variant="small"
    >
      <ModalHeader id="add-to-favorites-title" title="Add to favorites" />
      <ModalBody>
        <Form onSubmit={handleSubmit}>
          <FormGroup fieldId="favorite-name-input" isRequired label="Name">
            <TextInput
              id="favorite-name-input"
              isRequired
              name="favorite-name"
              type="text"
              value={name}
              onChange={(_event, value) => setName(value)}
              autoFocus
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          key="save"
          variant="primary"
          isDisabled={!name.trim()}
          onClick={handleSubmit}
        >
          Save
        </Button>
        <Button key="cancel" variant="link" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

/**
 * Prototype Selector - Split Button Component
 * 
 * Allows quick switching between prototypes without returning to the launcher
 */

import React, { useState } from 'react';
import {
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  Divider,
  Button,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { CubesIcon, ExternalLinkAltIcon } from '@patternfly/react-icons';
import { usePrototype } from './PrototypeContext';

interface PrototypeSelectorProps {
  onBackToLauncher?: () => void;
}

export const PrototypeSelector: React.FC<PrototypeSelectorProps> = ({ onBackToLauncher }) => {
  const { currentPrototype, loadPrototype, unloadPrototype, availablePrototypes } = usePrototype();
  const [isOpen, setIsOpen] = useState(false);

  // Get all prototypes organized by parent
  const topLevelPrototypes = availablePrototypes.filter(p => !p.config.parentId);
  const parents = topLevelPrototypes.filter(p => p.config.isParent);
  const standalones = topLevelPrototypes.filter(p => !p.config.isParent);

  const getChildren = (parentId: string) => {
    return availablePrototypes
      .filter(p => p.config.parentId === parentId)
      .sort((a, b) => (a.config.childOrder || 0) - (b.config.childOrder || 0));
  };

  const handleSelect = (prototypeId: string) => {
    loadPrototype(prototypeId);
    setIsOpen(false);
  };

  const handleBackToLauncher = () => {
    unloadPrototype();
    setIsOpen(false);
    if (onBackToLauncher) {
      onBackToLauncher();
    }
  };

  const onToggle = () => {
    setIsOpen(!isOpen);
  };

  // On launcher page: show last used prototype if available
  const lastPrototypeId = sessionStorage.getItem('activePrototypeId');
  const displayPrototype = currentPrototype || availablePrototypes.find(p => p.config.id === lastPrototypeId);
  
  if (!displayPrototype) {
    return null;
  }

  // Find parent name if display prototype is a child
  const parentPrototype = displayPrototype.config.parentId
    ? availablePrototypes.find(p => p.config.id === displayPrototype.config.parentId)
    : null;

  const currentDisplayName = parentPrototype
    ? `${parentPrototype.config.name} > ${displayPrototype.config.name}`
    : displayPrototype.config.name;
    
  const buttonLabel = currentPrototype ? currentDisplayName : `Recent: ${currentDisplayName}`;

  return (
    <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsNone' }}>
      {/* Primary button - shows current or last prototype */}
      <FlexItem>
        <Button
          variant={currentPrototype ? "primary" : "secondary"}
          onClick={currentPrototype ? handleBackToLauncher : () => handleSelect(displayPrototype.config.id)}
          style={{
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            borderRight: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          <CubesIcon style={{ marginRight: '8px' }} />
          {buttonLabel}
        </Button>
      </FlexItem>

      {/* Dropdown toggle - switch to other prototypes */}
      <FlexItem>
        <Dropdown
          isOpen={isOpen}
          onSelect={() => setIsOpen(false)}
          onOpenChange={(isOpen) => setIsOpen(isOpen)}
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle
              ref={toggleRef}
              variant="primary"
              isExpanded={isOpen}
              onClick={onToggle}
              style={{
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                minWidth: '44px',
              }}
            />
          )}
        >
          <DropdownList>
            {/* Back to Launcher option - only show if in a prototype */}
            {currentPrototype && (
              <>
                <DropdownItem
                  key="back-to-launcher"
                  onClick={handleBackToLauncher}
                  icon={<ExternalLinkAltIcon />}
                  description="Return to prototype selection"
                >
                  Back to Launcher
                </DropdownItem>
                <Divider />
              </>
            )}

            {/* Grouped by parent prototypes */}
            {parents.map(parent => {
              const children = getChildren(parent.config.id);
              return (
                <React.Fragment key={parent.config.id}>
                  {/* Parent header (not clickable) */}
                  <DropdownItem
                    isDisabled
                    style={{ fontWeight: 'bold', paddingTop: '12px' }}
                  >
                    {parent.config.name}
                  </DropdownItem>

                  {/* Children */}
                  {children.map(child => (
                  <DropdownItem
                    key={child.config.id}
                    onClick={() => handleSelect(child.config.id)}
                    description={child.config.persona.role}
                    isDisabled={displayPrototype?.config.id === child.config.id}
                    style={{ paddingLeft: '32px' }}
                  >
                    {child.config.name}
                    {displayPrototype?.config.id === child.config.id && ' (current)'}
                  </DropdownItem>
                  ))}
                </React.Fragment>
              );
            })}

            {/* Standalone prototypes */}
            {standalones.length > 0 && parents.length > 0 && <Divider />}
            {standalones.map(prototype => (
              <DropdownItem
                key={prototype.config.id}
                onClick={() => handleSelect(prototype.config.id)}
                description={prototype.config.persona.role}
                isDisabled={displayPrototype?.config.id === prototype.config.id}
              >
                {prototype.config.name}
                {displayPrototype?.config.id === prototype.config.id && ' (current)'}
              </DropdownItem>
            ))}
          </DropdownList>
        </Dropdown>
      </FlexItem>
    </Flex>
  );
};


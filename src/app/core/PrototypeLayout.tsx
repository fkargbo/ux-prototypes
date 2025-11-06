/**
 * Prototype Layout Wrapper
 * 
 * Wraps each prototype with AppLayout and adds navigation banner
 */

import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { 
  Banner, 
  Flex, 
  FlexItem, 
  Button,
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';
import { ArrowLeftIcon } from '@patternfly/react-icons';
import { AppLayout } from '@app/AppLayout/AppLayout';
import { PrototypeModule } from './types';
import { QuotasProvider } from '@app/contexts/QuotasContext';
import { usePrototype } from './PrototypeContext';
import { prototypeRegistry } from './PrototypeRegistry';

interface PrototypeLayoutProps {
  prototype: PrototypeModule;
}

export const PrototypeLayout: React.FC<PrototypeLayoutProps> = ({ prototype }) => {
  const { unloadPrototype, loadPrototype } = usePrototype();
  const [isVersionOpen, setIsVersionOpen] = useState(false);
  const [isUseCaseOpen, setIsUseCaseOpen] = useState(false);
  
  // Check if this prototype has versions (siblings with same versionGroup)
  const allPrototypes = prototypeRegistry.getAll();
  const versions = allPrototypes.filter(p => 
    p.config.versionGroup === prototype.config.versionGroup && p.config.versionGroup !== undefined
  ).sort((a, b) => {
    if (a.config.version === 'final') return 1;
    if (b.config.version === 'final') return -1;
    return a.config.version.localeCompare(b.config.version);
  });
  
  // Check if this prototype is a child of a parent (has siblings)
  const siblings = prototype.config.parentId 
    ? prototypeRegistry.getChildren(prototype.config.parentId)
    : [];
  
  const hasVersions = versions.length > 1;
  const hasUseCases = siblings.length > 1;
  
  const handleBackToLauncher = () => {
    unloadPrototype();
  };
  
  const handleVersionChange = (versionId: string) => {
    loadPrototype(versionId);
    setIsVersionOpen(false);
  };
  
  const handleUseCaseChange = (useCaseId: string) => {
    loadPrototype(useCaseId);
    setIsUseCaseOpen(false);
  };

  const navigationBanner = (
    <Banner variant="default">
      <Flex 
        alignItems={{ default: 'alignItemsCenter' }} 
        spaceItems={{ default: 'spaceItemsMd' }}
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
      >
        <FlexItem>
          <Button
            variant="link"
            icon={<ArrowLeftIcon />}
            onClick={handleBackToLauncher}
          >
            Back to Launcher
          </Button>
        </FlexItem>
        
        <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
          {/* Version Selector or Display */}
          {hasVersions ? (
            <FlexItem>
              <Select
                isOpen={isVersionOpen}
                onSelect={(_, value) => handleVersionChange(value as string)}
                onOpenChange={(isOpen) => setIsVersionOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setIsVersionOpen(!isVersionOpen)}
                    isExpanded={isVersionOpen}
                    variant="secondary"
                  >
                    Version: {prototype.config.version}
                  </MenuToggle>
                )}
              >
                <SelectList>
                  {versions.map(version => (
                    <SelectOption
                      key={version.config.id}
                      value={version.config.id}
                      isSelected={version.config.id === prototype.config.id}
                    >
                      {version.config.version}
                    </SelectOption>
                  ))}
                </SelectList>
              </Select>
            </FlexItem>
          ) : (
            <FlexItem>
              <span style={{ color: 'var(--pf-v5-global--Color--200)' }}>
                Version: {prototype.config.version}
              </span>
            </FlexItem>
          )}
          
          {/* Use Case Selector (if has siblings) */}
          {hasUseCases && (
            <FlexItem>
              <Select
                isOpen={isUseCaseOpen}
                onSelect={(_, value) => handleUseCaseChange(value as string)}
                onOpenChange={(isOpen) => setIsUseCaseOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setIsUseCaseOpen(!isUseCaseOpen)}
                    isExpanded={isUseCaseOpen}
                    variant="secondary"
                  >
                    Use Case: {prototype.config.name}
                  </MenuToggle>
                )}
              >
                <SelectList>
                  {siblings.map(sibling => (
                    <SelectOption
                      key={sibling.config.id}
                      value={sibling.config.id}
                      isSelected={sibling.config.id === prototype.config.id}
                    >
                      {sibling.config.name}
                    </SelectOption>
                  ))}
                </SelectList>
              </Select>
            </FlexItem>
          )}
        </Flex>
      </Flex>
    </Banner>
  );

  return (
    <QuotasProvider>
      <AppLayout
        useCaseTitle={prototype.config.name}
        useCasePersona={prototype.config.persona.role}
        topBanner={navigationBanner}
      >
        <Routes>
          {prototype.routes.map((route, index) => (
            <Route
              key={route.path || index}
              path={route.path}
              element={route.element}
            />
          ))}
          
          {/* Fallback / catch-all route */}
          <Route path="*" element={prototype.routes[0]?.element || <div>Not found</div>} />
        </Routes>
      </AppLayout>
    </QuotasProvider>
  );
};


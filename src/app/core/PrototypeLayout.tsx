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
  PageSection,
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
  const allSiblings = prototype.config.parentId 
    ? prototypeRegistry.getChildren(prototype.config.parentId)
    : [];
  
  // Filter siblings based on current prototype's version
  // If current prototype has a versionGroup, only show siblings with the same versionGroup and version
  // If current prototype has no versionGroup, show all siblings without versionGroup
  const siblings = allSiblings.filter(sibling => {
    // If current prototype has a versionGroup, filter by version
    if (prototype.config.versionGroup) {
      // If sibling has versionGroup, must match both versionGroup and version
      if (sibling.config.versionGroup) {
        return sibling.config.versionGroup === prototype.config.versionGroup &&
               sibling.config.version === prototype.config.version;
      }
      // Siblings without versionGroup only show when v1.0 is selected
      return prototype.config.version === 'v1.0';
    }
    // If current prototype has no versionGroup, only show siblings without versionGroup
    return !sibling.config.versionGroup;
  });
  
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
    <Banner>
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

  // Format owner name with slack handle if available
  const ownerDisplayName = prototype.config.owner.slack
    ? `${prototype.config.owner.name} (slack ${prototype.config.owner.slack})`
    : prototype.config.owner.name;

  return (
    <QuotasProvider>
      <AppLayout
        useCaseTitle={ownerDisplayName}
        useCasePersona={prototype.config.persona.name}
        topBanner={navigationBanner}
        enabledPerspectives={prototype.config.perspectives}
        currentPrototypeId={prototype.config.id}
      >
        <Routes>
          {prototype.routes.map((route, index) => (
            <Route
              key={route.path || index}
              path={route.path}
              element={route.element}
            />
          ))}
          
          {/* Fallback / catch-all route - show blank page instead of defaulting to first route */}
          <Route path="*" element={<PageSection />} />
        </Routes>
      </AppLayout>
    </QuotasProvider>
  );
};


import React, { useState } from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  MenuToggle,
  type MenuToggleElement,
} from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';

const PROJECT_OPTIONS = ['All Projects', 'openshift-monitoring', 'project-1', 'project-2'];

/**
 * Project scope switcher, matching the "Project: <name>" menu pattern used
 * elsewhere in the console for scoping a page's content to a project/namespace.
 */
export const ProjectSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(PROJECT_OPTIONS[0]);

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={(nextOpen: boolean) => setIsOpen(nextOpen)}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => setIsOpen((open) => !open)}
          isExpanded={isOpen}
          variant="plain"
          style={{ padding: 0, backgroundColor: 'transparent' }}
        >
          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
            <FlexItem>Project: {selectedProject}</FlexItem>
            <FlexItem>
              <CaretDownIcon aria-hidden color="var(--pf-t--global--icon--color--subtle)" />
            </FlexItem>
          </Flex>
        </MenuToggle>
      )}
    >
      <DropdownList>
        {PROJECT_OPTIONS.map((project) => (
          <DropdownItem
            key={project}
            onClick={() => {
              setSelectedProject(project);
              setIsOpen(false);
            }}
          >
            {project}
          </DropdownItem>
        ))}
      </DropdownList>
    </Dropdown>
  );
};

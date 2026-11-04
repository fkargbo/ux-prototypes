import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
} from '@patternfly/react-core';

export type PrototypeVersion = 'v1' | 'v2';

export const VERSION_PARAM = 'version';
export const DEFAULT_VERSION: PrototypeVersion = 'v2';

export const VERSIONS: { id: PrototypeVersion; label: string; description: string }[] = [
  { id: 'v1', label: 'v1.0.0', description: 'Legacy / Base' },
  { id: 'v2', label: 'v2.0.0', description: 'Current / Active' },
];

/** Read the current prototype version from the URL search param. */
export const usePrototypeVersion = (): PrototypeVersion => {
  const [searchParams] = useSearchParams();
  const raw = searchParams.get(VERSION_PARAM);
  return raw === 'v1' || raw === 'v2' ? raw : DEFAULT_VERSION;
};

/**
 * Version selector for the prototype banner.
 *
 * Inject this into the grey banner bar via:
 *   useInjectBannerActions(<VersionSelector />);
 *
 * Switching version updates ?version= in the URL without a page reload,
 * producing shareable per-version permalinks.
 */
export const VersionSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const current = usePrototypeVersion();

  const currentMeta = VERSIONS.find((v) => v.id === current) ?? VERSIONS[1];

  const onSelect = (version: PrototypeVersion) => {
    setIsOpen(false);
    const next = new URLSearchParams(searchParams);
    if (version === DEFAULT_VERSION) {
      next.delete(VERSION_PARAM);
    } else {
      next.set(VERSION_PARAM, version);
    }
    setSearchParams(next, { replace: true });
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => setIsOpen((o) => !o)}
          isExpanded={isOpen}
          aria-label="Select prototype version"
          variant="secondary"
          size="sm"
        >
          {currentMeta.label}
        </MenuToggle>
      )}
    >
      <DropdownList>
        {VERSIONS.map((v) => (
          <DropdownItem
            key={v.id}
            value={v.id}
            isSelected={v.id === current}
            onClick={() => onSelect(v.id)}
            description={v.description}
          >
            {v.label}
          </DropdownItem>
        ))}
      </DropdownList>
    </Dropdown>
  );
};

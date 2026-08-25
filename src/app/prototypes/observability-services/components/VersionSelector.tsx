import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
} from '@patternfly/react-core';
import { CodeBranchIcon } from '@patternfly/react-icons';

export type PrototypeVersion = 'v1' | 'v2';

export const VERSION_PARAM = 'version';
export const DEFAULT_VERSION: PrototypeVersion = 'v2';

export const VERSIONS: { id: PrototypeVersion; label: string; badge: string }[] = [
  { id: 'v1', label: 'v1.0.0', badge: 'Legacy / Base' },
  { id: 'v2', label: 'v2.0.0', badge: 'Current / Active' },
];

export const usePrototypeVersion = (): PrototypeVersion => {
  const [searchParams] = useSearchParams();
  const raw = searchParams.get(VERSION_PARAM);
  return raw === 'v1' || raw === 'v2' ? raw : DEFAULT_VERSION;
};

/**
 * Version selector dropdown. Place adjacent to the Share control in the page
 * header action bar. Switching version updates the URL search param without
 * a full page reload, producing a unique shareable permalink per version:
 *
 *   v1: …/observability-services?version=v1
 *   v2: …/observability-services        (default — no param needed)
 */
export const VersionSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const current = usePrototypeVersion();

  const currentMeta = VERSIONS.find((v) => v.id === current) ?? VERSIONS[1];

  const onSelect = (version: PrototypeVersion) => {
    setIsOpen(false);
    if (version === DEFAULT_VERSION) {
      // Keep URL clean — remove param for the default version
      const next = new URLSearchParams(searchParams);
      next.delete(VERSION_PARAM);
      setSearchParams(next, { replace: true });
    } else {
      const next = new URLSearchParams(searchParams);
      next.set(VERSION_PARAM, version);
      setSearchParams(next, { replace: true });
    }
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
          icon={<CodeBranchIcon />}
          aria-label="Select prototype version"
          variant="secondary"
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
            description={v.badge}
          >
            {v.label}
          </DropdownItem>
        ))}
      </DropdownList>
    </Dropdown>
  );
};

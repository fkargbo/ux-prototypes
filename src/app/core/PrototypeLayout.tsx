/**
 * Prototype Layout Wrapper
 * 
 * Wraps each prototype with AppLayout and adds navigation banner
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
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
  Dropdown,
  DropdownList,
  DropdownItem,
} from '@patternfly/react-core';
import { ArrowLeftIcon } from '@patternfly/react-icons';
import { AppLayout } from '@app/AppLayout/AppLayout';
import { PrototypeModule } from './types';
import { QuotasProvider } from '@app/shared/contexts/QuotasContext';
import { usePrototype } from './PrototypeContext';
import { prototypeRegistry } from './PrototypeRegistry';
import { getGithubPagesBasenameNoSlash } from './githubPagesBase';
import {
  BANNER_VERSION_CHANGE_EVENT,
  getBannerVersionStorageKey,
} from './bannerVersionPicker';

interface PrototypeLayoutProps {
  prototype: PrototypeModule;
}

export const PrototypeLayout: React.FC<PrototypeLayoutProps> = ({ prototype }) => {
  const { unloadPrototype, loadPrototype } = usePrototype();
  const navigate = useNavigate();
  const location = useLocation();
  const [isVersionOpen, setIsVersionOpen] = useState(false);
  const [isBannerPickerOpen, setIsBannerPickerOpen] = useState(false);
  const [isUseCaseOpen, setIsUseCaseOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const sharePageUrl = React.useMemo(() => {
    const base = process.env.NODE_ENV === 'production' ? getGithubPagesBasenameNoSlash() : '';
    const u = new URL(`${base}${location.pathname}${location.search}${location.hash}`, window.location.origin);
    u.searchParams.set('prototype', prototype.config.id);
    return u.toString();
  }, [prototype.config.id, location.pathname, location.search, location.hash]);

  const handleCopyShareLink = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(sharePageUrl);
      setLinkCopied(true);
      setIsShareOpen(false);
      window.setTimeout(() => setLinkCopied(false), 2500);
    } catch {
      window.prompt('Copy this link:', sharePageUrl);
    }
  }, [sharePageUrl]);
  
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

  const bannerPickerCfg = prototype.config.bannerVersionPicker;
  const bannerPickerOptions = bannerPickerCfg?.options ?? [];
  const showBannerVersionPicker = bannerPickerOptions.length > 1;
  const defaultBannerPickerKey =
    bannerPickerCfg?.defaultKey ?? bannerPickerOptions[0]?.key ?? '';

  const [bannerPickerKey, setBannerPickerKey] = useState(() => {
    if (!showBannerVersionPicker) {
      return defaultBannerPickerKey;
    }
    try {
      const raw = sessionStorage.getItem(getBannerVersionStorageKey(prototype.config.id));
      if (raw && bannerPickerOptions.some((o) => o.key === raw)) {
        return raw;
      }
    } catch {
      /* ignore */
    }
    return defaultBannerPickerKey;
  });

  const bannerPickerDisplayLabel =
    bannerPickerOptions.find((o) => o.key === bannerPickerKey)?.label ?? prototype.config.version;

  const handleBannerPickerSelect = (key: string) => {
    setBannerPickerKey(key);
    try {
      sessionStorage.setItem(getBannerVersionStorageKey(prototype.config.id), key);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(
      new CustomEvent(BANNER_VERSION_CHANGE_EVENT, {
        detail: { prototypeId: prototype.config.id, key },
      })
    );
    setIsBannerPickerOpen(false);
  };
  
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

  const backToLauncher = (
    <Button variant="link" icon={<ArrowLeftIcon />} onClick={handleBackToLauncher}>
      Back to Launcher
    </Button>
  );

  const bannerToolbar = (
    <>
      {prototype.bannerBeforeVersionPicker ? <FlexItem>{prototype.bannerBeforeVersionPicker}</FlexItem> : null}
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
                    size="sm"
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
          ) : showBannerVersionPicker ? (
            <FlexItem>
              <Select
                isOpen={isBannerPickerOpen}
                onSelect={(_, value) => handleBannerPickerSelect(value as string)}
                onOpenChange={(open) => setIsBannerPickerOpen(open)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setIsBannerPickerOpen(!isBannerPickerOpen)}
                    isExpanded={isBannerPickerOpen}
                    variant="secondary"
                    size="sm"
                  >
                    Version: {bannerPickerDisplayLabel}
                  </MenuToggle>
                )}
              >
                <SelectList>
                  {bannerPickerOptions.map((opt) => (
                    <SelectOption
                      key={opt.key}
                      value={opt.key}
                      isSelected={opt.key === bannerPickerKey}
                    >
                      {opt.label}
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
                    size="sm"
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
          <FlexItem>
            <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
              <Dropdown
                isOpen={isShareOpen}
                onSelect={() => setIsShareOpen(false)}
                onOpenChange={(open) => setIsShareOpen(open)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setIsShareOpen(!isShareOpen)}
                    isExpanded={isShareOpen}
                    variant="secondary"
                    size="sm"
                  >
                    Share
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem key="copy-link" onClick={() => void handleCopyShareLink()}>
                    Copy link
                  </DropdownItem>
                </DropdownList>
              </Dropdown>
              {linkCopied && (
                <span style={{ color: 'var(--pf-v5-global--active-color--400)', fontSize: 'var(--pf-global--FontSize--sm)' }}>
                  Copied
                </span>
              )}
            </Flex>
          </FlexItem>
    </>
  );

  const navigationBanner = (
    <Banner className="hpux-prototype-top-banner">
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        spaceItems={{ default: 'spaceItemsMd' }}
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
      >
        <FlexItem>{backToLauncher}</FlexItem>
        <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
          {bannerToolbar}
        </Flex>
      </Flex>
    </Banner>
  );

  // Format owner name with slack handle if available
  const ownerDisplayName = prototype.config.owner.slack
    ? `${prototype.config.owner.name} (slack ${prototype.config.owner.slack})`
    : prototype.config.owner.name;

  // Handle root route redirect for specific prototypes
  useEffect(() => {
    // For virtualization-quotas prototype, always navigate to Quotas page on load
    if (prototype.config.id === 'virtualization-quotas') {
      // Check if we're on root or not on the Quotas page
      if (location.pathname === '/' || location.pathname === '' || !location.pathname.includes('/core/virtualization/quotas')) {
        navigate('/core/virtualization/quotas', { replace: true });
      }
    } else if (prototype.config.id === 'operator-lifecycle') {
      // For operator-lifecycle prototype, always navigate to OperatorHub page on load
      if (location.pathname === '/' || location.pathname === '' || !location.pathname.includes('/core/operators/hub')) {
        navigate('/core/operators/hub', { replace: true });
      }
    } else if (prototype.config.id === 'cross-cluster-migration') {
      // For cross-cluster-migration prototype, only redirect on root path (initial load)
      if (location.pathname === '/' || location.pathname === '') {
        navigate('/virtualization/virtual-machines', { replace: true });
      }
    } else if (prototype.config.id === 'fleet-admin-rbac' || prototype.config.id === 'fleet-admin-rbac-v1.1') {
      // For RBAC prototypes, always navigate to Clusters page in Fleet management
      if (location.pathname === '/' || location.pathname === '' || !location.pathname.includes('/infrastructure/clusters')) {
        navigate('/infrastructure/clusters', { replace: true });
      }
    } else if (prototype.config.id === 'stefans-acmintegration') {
      // For ACM Ansible integration prototype, navigate to Decision Environments page (first in workflow)
      // Only redirect on root path, not on valid automation routes
      if (location.pathname === '/' || location.pathname === '') {
        navigate('/automation/decision-environments', { replace: true });
      }
    } else if (prototype.config.id === 'stefan-costmanagement') {
      // For Cost Management prototype, redirect based on selected option
      // Only redirect on root path
      if (location.pathname === '/' || location.pathname === '') {
        const option = sessionStorage.getItem('costManagementOption');
        if (option === 'integrated') {
          navigate('/cost-management-integrated/overview', { replace: true });
        } else {
          // Default to Option A (dedicated pages)
          navigate('/cost-management/overview', { replace: true });
        }
      }
    } else {
      // For other prototypes, check if we're on the root path and prototype has a redirect route
      if (location.pathname === '/' || location.pathname === '') {
        const rootRoute = prototype.routes.find(route => route.path === '/');
        if (rootRoute && rootRoute.element && React.isValidElement(rootRoute.element)) {
          // If root route is a Navigate component, extract the 'to' prop
          const navigateElement = rootRoute.element as React.ReactElement<{ to: string; replace?: boolean }>;
          if (navigateElement.type === Navigate || (navigateElement.props && navigateElement.props.to)) {
            const targetPath = navigateElement.props.to;
            if (targetPath) {
              // Navigate immediately to the target path
              navigate(targetPath, { replace: true });
            }
          }
        }
      }
    }
  }, [location.pathname, prototype.routes, prototype.config.id, navigate]);

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


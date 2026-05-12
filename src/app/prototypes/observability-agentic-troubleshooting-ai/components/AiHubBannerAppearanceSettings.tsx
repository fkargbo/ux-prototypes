import React, { useState } from 'react';
import {
  Divider,
  Dropdown,
  Icon,
  MenuToggle,
  Switch,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import type { MenuToggleElement } from '@patternfly/react-core';
import { CogIcon } from '@patternfly/react-icons';
import { useAiHubAppearance } from '../context/AiHubAppearanceContext';
import '@patternfly/react-styles/css/components/Menu/menu.css';
import '@patternfly/react-styles/css/components/MenuToggle/menu-toggle.css';

const bannerAppearancePopperProps = {
  placement: 'bottom-end' as const,
  enableFlip: true,
  preventOverflow: true,
  distance: 8,
  appendTo: () => document.body,
  minWidth: '17rem',
  maxWidth: '23.75rem',
};

/**
 * Banner-row appearance menu (AI Hub): cog + "Appearance Settings" + caret; theme / contrast / RTL in dropdown.
 */
export const AiHubBannerAppearanceSettings: React.FC = () => {
  const {
    themeColorMode,
    setThemeColorMode,
    themeVariantMode,
    setThemeVariantMode,
    themeContrastMode,
    setThemeContrastMode,
    isRtl,
    setIsRtl,
    themeTriggerAriaLabel,
  } = useAiHubAppearance();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="ols-ai-hub-banner-appearance">
      <Dropdown
        className="ols-ai-hub-banner-appearance__dropdown ws-full-page-utils__dropdown"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        shouldFocusToggleOnSelect={false}
        popperProps={bannerAppearancePopperProps}
        zIndex={13000}
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle
            ref={toggleRef}
            variant="secondary"
            size="sm"
            className="ols-ai-hub-banner-appearance__trigger"
            icon={
              <Icon size="md">
                <CogIcon />
              </Icon>
            }
            onClick={() => setIsOpen((o) => !o)}
            isExpanded={isOpen}
            aria-label={themeTriggerAriaLabel}
          >
            Appearance Settings
          </MenuToggle>
        )}
      >
        <div className="ws-full-page-utils__menu-inner" role="dialog" aria-label="Appearance settings menu">
          <div className="pf-v6-c-menu__group-title" id="ols-ai-hub-banner-theme-title">
            Theme
          </div>
          <ToggleGroup aria-labelledby="ols-ai-hub-banner-theme-title" className="ws-full-page-utils__toggle-group">
            <ToggleGroupItem
              text="Default"
              buttonId="ols-ai-hub-banner-theme-default"
              isSelected={themeVariantMode === 'theme-default'}
              onChange={(_event, selected) => {
                if (selected) {
                  setThemeVariantMode('theme-default');
                }
              }}
            />
            <ToggleGroupItem
              text="Project Felt"
              buttonId="ols-ai-hub-banner-theme-felt"
              isSelected={themeVariantMode === 'theme-felt'}
              onChange={(_event, selected) => {
                if (selected) {
                  setThemeVariantMode('theme-felt');
                }
              }}
            />
          </ToggleGroup>
          <Divider />
          <div className="pf-v6-c-menu__group-title" id="ols-ai-hub-banner-color-title">
            Color scheme
          </div>
          <ToggleGroup aria-labelledby="ols-ai-hub-banner-color-title" className="ws-full-page-utils__toggle-group">
            <ToggleGroupItem
              text="System"
              buttonId="ols-ai-hub-banner-color-system"
              isSelected={themeColorMode === 'system'}
              onChange={(_event, selected) => {
                if (selected) {
                  setThemeColorMode('system');
                }
              }}
            />
            <ToggleGroupItem
              text="Light"
              buttonId="ols-ai-hub-banner-color-light"
              isSelected={themeColorMode === 'light'}
              onChange={(_event, selected) => {
                if (selected) {
                  setThemeColorMode('light');
                }
              }}
            />
            <ToggleGroupItem
              text="Dark"
              buttonId="ols-ai-hub-banner-color-dark"
              isSelected={themeColorMode === 'dark'}
              onChange={(_event, selected) => {
                if (selected) {
                  setThemeColorMode('dark');
                }
              }}
            />
          </ToggleGroup>
          <Divider />
          <div className="pf-v6-c-menu__group-title" id="ols-ai-hub-banner-contrast-title">
            Contrast mode
          </div>
          <ToggleGroup aria-labelledby="ols-ai-hub-banner-contrast-title" className="ws-full-page-utils__toggle-group">
            <ToggleGroupItem
              text="System"
              buttonId="ols-ai-hub-banner-contrast-system"
              isSelected={themeContrastMode === 'contrast-system'}
              onChange={(_event, selected) => {
                if (selected) {
                  setThemeContrastMode('contrast-system');
                }
              }}
            />
            <ToggleGroupItem
              text="Default"
              buttonId="ols-ai-hub-banner-contrast-default"
              isSelected={themeContrastMode === 'contrast-default'}
              onChange={(_event, selected) => {
                if (selected) {
                  setThemeContrastMode('contrast-default');
                }
              }}
            />
            <ToggleGroupItem
              text="High contrast"
              buttonId="ols-ai-hub-banner-contrast-high"
              isSelected={themeContrastMode === 'contrast-high'}
              onChange={(_event, selected) => {
                if (selected) {
                  setThemeContrastMode('contrast-high');
                }
              }}
            />
            <ToggleGroupItem
              text="Glass"
              buttonId="ols-ai-hub-banner-contrast-glass"
              isSelected={themeContrastMode === 'contrast-glass'}
              onChange={(_event, selected) => {
                if (selected) {
                  setThemeContrastMode('contrast-glass');
                }
              }}
            />
          </ToggleGroup>
          <Divider />
          <div className="pf-v6-c-menu__group-title" id="ols-ai-hub-banner-rtl-title">
            Reading direction
          </div>
          <div className="ols-ai-hub-banner-appearance__rtl-row">
            <Switch
              id="ols-ai-hub-banner-rtl-switch"
              label="Right-to-left (RTL)"
              isChecked={isRtl}
              onChange={(_event, checked) => setIsRtl(checked)}
              aria-labelledby="ols-ai-hub-banner-rtl-title"
            />
          </div>
        </div>
      </Dropdown>
    </div>
  );
};

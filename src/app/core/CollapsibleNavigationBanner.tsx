import React, { useCallback, useState } from 'react';
import { Banner, Button, Flex, FlexItem } from '@patternfly/react-core';
import { AngleDownIcon, AngleUpIcon } from '@patternfly/react-icons';
import './prototype-navigation-banner.css';

const STORAGE_KEY = 'hpux.prototypeNavBanner.collapsed';

function readCollapsedPreference(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeCollapsedPreference(collapsed: boolean): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
  } catch {
    /* ignore quota / private mode */
  }
}

export type CollapsibleNavigationBannerProps = {
  backToLauncher: React.ReactNode;
  toolbar: React.ReactNode;
};

/**
 * Prototype navigation strip above the masthead. Collapses to back + expand control
 * (same interaction model as the templates page header band).
 */
export const CollapsibleNavigationBanner: React.FC<CollapsibleNavigationBannerProps> = ({
  backToLauncher,
  toolbar,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(readCollapsedPreference);

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      writeCollapsedPreference(next);
      return next;
    });
  }, []);

  return (
    <Banner
      className={[
        'ux-prototype-nav-banner',
        isCollapsed ? 'ux-prototype-nav-banner--collapsed' : undefined,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Flex
        className="ux-prototype-nav-banner__inner"
        alignItems={{ default: 'alignItemsCenter' }}
        spaceItems={{ default: 'spaceItemsMd' }}
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
      >
        <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
          <FlexItem>
            <Button
              variant="plain"
              aria-label={isCollapsed ? 'Expand prototype navigation banner' : 'Collapse prototype navigation banner'}
              aria-expanded={!isCollapsed}
              icon={isCollapsed ? <AngleDownIcon /> : <AngleUpIcon />}
              onClick={toggleCollapsed}
            />
          </FlexItem>
          <FlexItem>{backToLauncher}</FlexItem>
        </Flex>

        <FlexItem className="ux-prototype-nav-banner__controls">
          <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
            {toolbar}
          </Flex>
        </FlexItem>
      </Flex>
    </Banner>
  );
};

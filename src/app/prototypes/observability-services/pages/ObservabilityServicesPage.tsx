import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  AlertActionCloseButton,
  Breadcrumb,
  BreadcrumbItem,
  Content,
  Flex,
  FlexItem,
  SearchInput,
  Stack,
  StackItem,
  Title,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { CAPABILITY_CARDS, STACK_SUMMARY_STATS } from '../data';
import { StackSummaryRibbon } from '../components/StackSummaryRibbon';
import { CapabilityLayout } from '../components/CapabilityLayout';
import type { CapabilityLayoutMode } from '../types';
import '../observability-services.css';

export interface ObservabilityServicesPageProps {
  /** Layout mode for capability cards. Defaults to unified grid (Option B). */
  layoutMode?: CapabilityLayoutMode;
  /** When true, shows a layout-mode toggle in the toolbar. Default: true. */
  showLayoutToggle?: boolean;
}

/**
 * Observe → Observability services
 * Post–Cluster Observability Operator installation hub.
 * Surfaces capability readiness — not live telemetry health.
 */
export const ObservabilityServicesPage: React.FC<ObservabilityServicesPageProps> = ({
  layoutMode: layoutModeProp,
  showLayoutToggle = true,
}) => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [isScopeAlertVisible, setIsScopeAlertVisible] = useState(true);
  const [layoutMode, setLayoutMode] = useState<CapabilityLayoutMode>(layoutModeProp ?? 'grid');

  const filteredCapabilities = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (!q) {
      return CAPABILITY_CARDS;
    }
    return CAPABILITY_CARDS.filter((card) => {
      const haystack = [
        card.title,
        card.subtitle ?? '',
        card.summary,
        card.status.label,
        ...card.searchTerms,
        ...(card.dependencies?.map((d) => d.label) ?? []),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [searchValue]);

  return (
    <div className="ols-obs-services-page">
      <div className="template-page-breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem
            to="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/core/observe/observability-services');
            }}
          >
            Observe
          </BreadcrumbItem>
          <BreadcrumbItem isActive>Observability services</BreadcrumbItem>
        </Breadcrumb>
      </div>

      <div className="template-page-heading">
        <Title headingLevel="h1" size="2xl">
          Observability services
        </Title>
        <Content component="p">
          Manage and monitor your metrics, logs, and traces from a single, unified hub.
        </Content>
        {isScopeAlertVisible ? (
          <Alert
            className="ols-obs-services-alert"
            variant="info"
            isInline
            title="Cluster-wide observability scope"
            actionClose={
              <AlertActionCloseButton
                title="Close scope information"
                onClose={() => setIsScopeAlertVisible(false)}
              />
            }
          >
            This hub reflects observability capabilities for the current cluster after Cluster
            Observability Operator installation. Status labels indicate enablement and configuration
            readiness—not live telemetry severity.
          </Alert>
        ) : null}
      </div>

      <div
        className="template-page-content"
        role="main"
        aria-label="Observability services content"
      >
        <Stack hasGutter>
          <StackItem>
            <Toolbar className="ols-obs-services-toolbar" id="ols-obs-services-toolbar">
              <ToolbarContent>
                <ToolbarItem>
                  <SearchInput
                    aria-label="Search observability capabilities or operators"
                    placeholder="Search observability capabilities or operators..."
                    value={searchValue}
                    onChange={(_event, value) => setSearchValue(value)}
                    onClear={() => setSearchValue('')}
                  />
                </ToolbarItem>
                {showLayoutToggle ? (
                  <ToolbarItem align={{ default: 'alignEnd' }}>
                    <Flex
                      alignItems={{ default: 'alignItemsCenter' }}
                      gap={{ default: 'gapSm' }}
                    >
                      <FlexItem>
                        <Content component="small" id="layout-mode-label">
                          Layout
                        </Content>
                      </FlexItem>
                      <FlexItem>
                        <ToggleGroup aria-labelledby="layout-mode-label">
                          <ToggleGroupItem
                            text="Unified grid"
                            buttonId="layout-grid"
                            isSelected={layoutMode === 'grid'}
                            onChange={() => setLayoutMode('grid')}
                          />
                          <ToggleGroupItem
                            text="By section"
                            buttonId="layout-sections"
                            isSelected={layoutMode === 'sections'}
                            onChange={() => setLayoutMode('sections')}
                          />
                        </ToggleGroup>
                      </FlexItem>
                    </Flex>
                  </ToolbarItem>
                ) : null}
              </ToolbarContent>
            </Toolbar>
          </StackItem>

          <StackItem>
            <StackSummaryRibbon stats={STACK_SUMMARY_STATS} />
          </StackItem>

          <StackItem>
            {filteredCapabilities.length === 0 ? (
              <Alert variant="info" isInline title="No matching capabilities">
                No observability capabilities or operators match “{searchValue}”. Clear the search
                to see all capabilities.
              </Alert>
            ) : (
              <CapabilityLayout capabilities={filteredCapabilities} layoutMode={layoutMode} />
            )}
          </StackItem>
        </Stack>
      </div>
    </div>
  );
};

import React, { useState, useCallback } from 'react';
import {
  Title,
  Content,
  Card,
  CardBody,
  Stack,
  StackItem,
  PageSection,
  ExpandableSection,
} from '@patternfly/react-core';
import { EnsureGlobalAgenticAiMount } from '../components/ensureAgenticGlobalAiMount';
import './observe-overview.css';

type OverviewSectionKey = 'diagnostics' | 'stack' | 'installed' | 'recommended';

const createExpandedState = (initial: Partial<Record<OverviewSectionKey, boolean>> = {}) =>
  ({
    diagnostics: initial.diagnostics ?? true,
    stack: initial.stack ?? false,
    installed: initial.installed ?? false,
    recommended: initial.recommended ?? false,
  }) as Record<OverviewSectionKey, boolean>;

export const ObserveOverviewPage: React.FC = () => {
  const [expanded, setExpanded] = useState(createExpandedState);

  const onSectionToggle = useCallback((key: OverviewSectionKey) => {
    return (_event: React.MouseEvent, isOpen: boolean) => {
      setExpanded((prev) => ({ ...prev, [key]: isOpen }));
    };
  }, []);

  return (
    <div className="ols-observe-overview-page">
      <EnsureGlobalAgenticAiMount />
      <PageSection
        component="main"
        aria-label="Observability overview"
        padding={{ default: 'padding' }}
        isWidthLimited
        isCenterAligned
      >
        <Stack hasGutter>
          <StackItem>
            <Title headingLevel="h1" size="2xl">
              Observability overview
            </Title>
            <Content component="p" className="pf-v6-u-mt-sm pf-v6-u-color-200">
              Investigate AI-driven root cause analysis, monitor your installed observability components, and explore
              recommended operators to expand your metrics.
            </Content>
          </StackItem>
          <StackItem>
            <Card>
              <CardBody>
                <Stack hasGutter>
                  <StackItem>
                    <ExpandableSection
                      className="ols-observe-overview-expandable"
                      displaySize="lg"
                      isWidthLimited
                      toggleText="Autonomous AI diagnostics"
                      isExpanded={expanded.diagnostics}
                      onToggle={onSectionToggle('diagnostics')}
                      toggleId="ols-observe-overview-diagnostics-toggle"
                      contentId="ols-observe-overview-diagnostics-content"
                    >
                      <Content component="p" className="pf-v6-u-pt-md">
                        Prototype area for Lightspeed-style autonomous triage, alert-to-evidence linking, and guided
                        remediation drafts. Connect live cluster signals here in a future iteration.
                      </Content>
                    </ExpandableSection>
                  </StackItem>
                  <StackItem>
                    <ExpandableSection
                      className="ols-observe-overview-expandable"
                      displaySize="lg"
                      isWidthLimited
                      toggleText="Stack summary"
                      isExpanded={expanded.stack}
                      onToggle={onSectionToggle('stack')}
                      toggleId="ols-observe-overview-stack-toggle"
                      contentId="ols-observe-overview-stack-content"
                    >
                      <Content component="p" className="pf-v6-u-pt-md">
                        High-level view of metrics, logging, and tracing collectors, scrape targets, and health of core
                        observability namespaces—placeholder until wired to real inventory.
                      </Content>
                    </ExpandableSection>
                  </StackItem>
                  <StackItem>
                    <ExpandableSection
                      className="ols-observe-overview-expandable"
                      displaySize="lg"
                      isWidthLimited
                      toggleText="Installed operators and add-ons"
                      isExpanded={expanded.installed}
                      onToggle={onSectionToggle('installed')}
                      toggleId="ols-observe-overview-installed-toggle"
                      contentId="ols-observe-overview-installed-content"
                    >
                      <Content component="p" className="pf-v6-u-pt-md">
                        List installed observability operators (for example user workload monitoring, distributed tracing
                        platform) and optional add-ons with version and upgrade status—stub content for the prototype.
                      </Content>
                    </ExpandableSection>
                  </StackItem>
                  <StackItem>
                    <ExpandableSection
                      className="ols-observe-overview-expandable"
                      displaySize="lg"
                      isWidthLimited
                      toggleText="Recommended operators"
                      isExpanded={expanded.recommended}
                      onToggle={onSectionToggle('recommended')}
                      toggleId="ols-observe-overview-recommended-toggle"
                      contentId="ols-observe-overview-recommended-content"
                    >
                      <Content component="p" className="pf-v6-u-pt-md">
                        Curated install paths for common next steps (user-defined metrics, tracing, cost metrics, and so
                        on). Replace with catalog-backed recommendations when available.
                      </Content>
                    </ExpandableSection>
                  </StackItem>
                </Stack>
              </CardBody>
            </Card>
          </StackItem>
        </Stack>
      </PageSection>
    </div>
  );
};

/**
 * Rudimentary Administration → Cluster Update shell (product-aligned tabs).
 * Cross-links Updates plan cards ↔ related Agentic runs (ota-* remediation details).
 */
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Content,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  ExpandableSection,
  Flex,
  FlexItem,
  Label,
  MenuToggle,
  Tab,
  Tabs,
  TabTitleText,
  Title,
} from '@patternfly/react-core';
import { CheckCircleIcon, TimesCircleIcon } from '@patternfly/react-icons';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { useActivePerspective } from '@app/shared/contexts/ActivePerspectiveContext';
import {
  getPlanRemediationHref,
  resolveActivePerspectiveKey,
} from '../v2PerspectiveUrl';

type ClusterUpdateTabKey = 'updates-plan' | 'active' | 'history';

const PAGE_DESCRIPTION =
  'Review available versions, assess operator compatibility, and plan how this cluster moves to newer OpenShift releases. Use Updates plan to prepare or start an update, Active update plans for in-flight work, and Update history for completed ones.';

/** Related Agentic run slugs (plan.name) for each Updates plan card. */
const RELATED_AGENTIC_RUNS = {
  patch501: { slug: 'ota-5-0-0-ec-4-to-5-0-1', analysisOnly: true },
  minor510: { slug: 'ota-5-0-0-ec-4-to-5-1-0', analysisOnly: false },
} as const;

const HISTORY_ROWS = [
  {
    version: '5.0.0-ec.4',
    status: 'Completed',
    started: 'Jul 20, 2026, 11:29 AM',
    completed: 'Jul 20, 2026, 11:29 AM',
    duration: '0m',
    verified: false,
  },
  {
    version: '5.0.0-ec.4',
    status: 'Completed',
    started: 'Jul 20, 2026, 9:25 AM',
    completed: 'Jul 20, 2026, 9:46 AM',
    duration: '21m',
    verified: false,
  },
] as const;

const UpdatesPlanTab: React.FC = () => {
  const navigate = useNavigate();
  const { activePerspective } = useActivePerspective();
  const [isPatchExpanded, setIsPatchExpanded] = useState(true);
  const [isMinorExpanded, setIsMinorExpanded] = useState(false);

  const openRelatedAgenticRun = useCallback(
    (run: (typeof RELATED_AGENTIC_RUNS)[keyof typeof RELATED_AGENTIC_RUNS]) => {
      const key = resolveActivePerspectiveKey(activePerspective);
      let href = getPlanRemediationHref(run.slug, key);
      if (run.analysisOnly) {
        href = `${href}${href.includes('?') ? '&' : '?'}kind=analysis-only`;
      }
      navigate(href);
    },
    [activePerspective, navigate],
  );

  return (
    <Flex direction={{ default: 'column' }} gap={{ default: 'gapLg' }}>
      <FlexItem>
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          gap={{ default: 'gapMd' }}
          flexWrap={{ default: 'wrap' }}
        >
          <FlexItem>
            <Content component="p" className="pf-v6-u-mb-0">
              <strong>Select update path</strong>
            </Content>
          </FlexItem>
          <FlexItem>
            {/* Visual-only — wiring comes later */}
            <MenuToggle isDisabled aria-label="Select update path (prototype stub)">
              5.0.1 — Patch (Proposed)
            </MenuToggle>
          </FlexItem>
          <FlexItem>
            <Label color="orange" isCompact>
              Proposed
            </Label>
          </FlexItem>
        </Flex>
      </FlexItem>

      <FlexItem>
        <ExpandableSection
          toggleContent={
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }}>
              <FlexItem>
                <strong>Update to 5.0.1</strong>
              </FlexItem>
              <FlexItem>
                <Label color="teal" isCompact>
                  Proposed
                </Label>
              </FlexItem>
              <FlexItem>
                <Label color="green" isCompact>
                  RECOMMEND
                </Label>
              </FlexItem>
            </Flex>
          }
          isExpanded={isPatchExpanded}
          onToggle={(_e, expanded) => setIsPatchExpanded(expanded)}
        >
          <Flex direction={{ default: 'column' }} gap={{ default: 'gapMd' }} className="pf-v6-u-mt-sm">
            <Flex
              justifyContent={{ default: 'justifyContentSpaceBetween' }}
              alignItems={{ default: 'alignItemsCenter' }}
              flexWrap={{ default: 'wrap' }}
              gap={{ default: 'gapSm' }}
            >
              <FlexItem>
                <Content component="p" className="pf-v6-u-mb-0">
                  Generated Jul 20, 2026, 11:35 AM
                  <br />
                  Proposed update: 5.0.0-ec.4 → 5.0.1
                </Content>
              </FlexItem>
              <FlexItem>
                <Button variant="primary" isDisabled>
                  Update
                </Button>
              </FlexItem>
            </Flex>

            <div
              style={{
                border: '1px solid var(--pf-t--global--border--color--default)',
                borderRadius: 'var(--pf-t--global--border--radius--small)',
                padding: 'var(--pf-t--global--spacer--md)',
              }}
            >
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} className="pf-v6-u-mb-md">
                <FlexItem>
                  <Title headingLevel="h3" size="md">
                    AI Assessment
                  </Title>
                </FlexItem>
                <FlexItem>
                  <Label color="green" isCompact>
                    RECOMMEND
                  </Label>
                </FlexItem>
              </Flex>
              <Title headingLevel="h4" size="md" className="pf-v6-u-mb-sm">
                Readiness checks
              </Title>
              <Table aria-label="Readiness checks for 5.0.1" variant="compact">
                <Thead>
                  <Tr>
                    <Th>Check</Th>
                    <Th>Status</Th>
                    <Th>Details</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>Cluster conditions</Td>
                    <Td>
                      <Label color="green" icon={<CheckCircleIcon />} isCompact>
                        pass
                      </Label>
                    </Td>
                    <Td>Available=True, Failing=False, Progressing=False. Cluster idle and stable on 5.0.0-ec.4.</Td>
                  </Tr>
                  <Tr>
                    <Td>API deprecations</Td>
                    <Td>
                      <Label color="green" icon={<CheckCircleIcon />} isCompact>
                        pass
                      </Label>
                    </Td>
                    <Td>No deprecated or removed APIs detected (0 blockers, 0 warnings).</Td>
                  </Tr>
                  <Tr>
                    <Td>Operator health</Td>
                    <Td>
                      <Label color="green" icon={<CheckCircleIcon />} isCompact>
                        pass
                      </Label>
                    </Td>
                    <Td>All ClusterOperators report Available=True. Zero operators report Upgradeable=False.</Td>
                  </Tr>
                </Tbody>
              </Table>
              <Content component="p" className="pf-v6-u-mt-md pf-v6-u-mb-0">
                <Button
                  variant="link"
                  isInline
                  onClick={() => openRelatedAgenticRun(RELATED_AGENTIC_RUNS.patch501)}
                >
                  Open related agentic run
                </Button>
              </Content>
            </div>
          </Flex>
        </ExpandableSection>
      </FlexItem>

      <FlexItem>
        <ExpandableSection
          toggleContent={
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }}>
              <FlexItem>
                <strong>Update to 5.1.0</strong>
              </FlexItem>
              <FlexItem>
                <Label color="green" isCompact>
                  Analysed
                </Label>
              </FlexItem>
              <FlexItem>
                <Label color="orange" isCompact>
                  CAUTION
                </Label>
              </FlexItem>
            </Flex>
          }
          isExpanded={isMinorExpanded}
          onToggle={(_e, expanded) => setIsMinorExpanded(expanded)}
        >
          <Flex direction={{ default: 'column' }} gap={{ default: 'gapMd' }} className="pf-v6-u-mt-sm">
            <Flex
              justifyContent={{ default: 'justifyContentSpaceBetween' }}
              alignItems={{ default: 'alignItemsCenter' }}
              flexWrap={{ default: 'wrap' }}
              gap={{ default: 'gapSm' }}
            >
              <FlexItem>
                <Content component="p" className="pf-v6-u-mb-0">
                  Generated Jul 20, 2026, 11:35 AM
                  <br />
                  Proposed update: 5.0.0-ec.4 → 5.1.0
                </Content>
              </FlexItem>
              <FlexItem>
                <Button variant="primary" isDisabled>
                  Update
                </Button>
              </FlexItem>
            </Flex>

            <div
              style={{
                border: '1px solid var(--pf-t--global--border--color--default)',
                borderRadius: 'var(--pf-t--global--border--radius--small)',
                padding: 'var(--pf-t--global--spacer--md)',
              }}
            >
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} className="pf-v6-u-mb-md">
                <FlexItem>
                  <Title headingLevel="h3" size="md">
                    AI Assessment
                  </Title>
                </FlexItem>
                <FlexItem>
                  <Label color="orange" isCompact>
                    CAUTION
                  </Label>
                </FlexItem>
              </Flex>
              <Title headingLevel="h4" size="md" className="pf-v6-u-mb-sm">
                Readiness checks
              </Title>
              <Table aria-label="Readiness checks for 5.1.0" variant="compact">
                <Thead>
                  <Tr>
                    <Th>Check</Th>
                    <Th>Status</Th>
                    <Th>Details</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>Cluster conditions</Td>
                    <Td>
                      <Label color="orange" isCompact>
                        warn
                      </Label>
                    </Td>
                    <Td>
                      CVO Upgradeable condition is absent (not explicitly set). All other CVO conditions are healthy:
                      Available=True, Failing=False, Progressing=False.
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>API deprecations</Td>
                    <Td>
                      <Label color="green" icon={<CheckCircleIcon />} isCompact>
                        pass
                      </Label>
                    </Td>
                    <Td>No deprecated or removed APIs detected (0 blockers, 0 warnings).</Td>
                  </Tr>
                  <Tr>
                    <Td>Operator health</Td>
                    <Td>
                      <Label color="green" icon={<CheckCircleIcon />} isCompact>
                        pass
                      </Label>
                    </Td>
                    <Td>
                      All 34 ClusterOperators report Available=True, Progressing=False, Degraded=False. Zero operators
                      report Upgradeable=False.
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
              <Content component="p" className="pf-v6-u-mt-md pf-v6-u-mb-0">
                <Button
                  variant="link"
                  isInline
                  onClick={() => openRelatedAgenticRun(RELATED_AGENTIC_RUNS.minor510)}
                >
                  Open related agentic run
                </Button>
              </Content>
            </div>
          </Flex>
        </ExpandableSection>
      </FlexItem>
    </Flex>
  );
};

const ActiveUpdatePlansTab: React.FC = () => (
  <EmptyState variant={EmptyStateVariant.sm} titleText="No active update plans" headingLevel="h2">
    <EmptyStateBody>In-flight cluster updates will appear here once an update is approved and started.</EmptyStateBody>
  </EmptyState>
);

const UpdateHistoryTab: React.FC = () => (
  <Table aria-label="Cluster update history">
    <Thead>
      <Tr>
        <Th>Version</Th>
        <Th>Status</Th>
        <Th>Started</Th>
        <Th>Completed</Th>
        <Th>Duration</Th>
        <Th>Verified</Th>
      </Tr>
    </Thead>
    <Tbody>
      {HISTORY_ROWS.map((row) => (
        <Tr key={`${row.version}-${row.started}`}>
          <Td dataLabel="Version">{row.version}</Td>
          <Td dataLabel="Status">
            <Label color="green" isCompact>
              {row.status}
            </Label>
          </Td>
          <Td dataLabel="Started">{row.started}</Td>
          <Td dataLabel="Completed">{row.completed}</Td>
          <Td dataLabel="Duration">{row.duration}</Td>
          <Td dataLabel="Verified">
            {row.verified ? (
              <CheckCircleIcon color="var(--pf-t--global--icon--color--status--success--default)" aria-label="Verified" />
            ) : (
              <TimesCircleIcon color="var(--pf-t--global--icon--color--status--danger--default)" aria-label="Not verified" />
            )}
          </Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
);

export const ClusterUpdatePageV2: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ClusterUpdateTabKey>('updates-plan');

  return (
    <div data-exp-lab-annotation-root>
      <div className="template-page-heading">
        <Title headingLevel="h1" size="2xl">
          Cluster Update
        </Title>
        <Content component="p">{PAGE_DESCRIPTION}</Content>
        <Tabs
          activeKey={activeTab}
          onSelect={(_event, tabIndex) => setActiveTab(tabIndex as ClusterUpdateTabKey)}
          aria-label="Cluster Update sections"
          className="pf-v6-u-mt-md"
        >
          <Tab eventKey="updates-plan" title={<TabTitleText>Updates plan</TabTitleText>} />
          <Tab eventKey="active" title={<TabTitleText>Active update plans</TabTitleText>} />
          <Tab eventKey="history" title={<TabTitleText>Update history</TabTitleText>} />
        </Tabs>
      </div>

      <div className="template-page-content" role="main" aria-label="Cluster Update content">
        {activeTab === 'updates-plan' && <UpdatesPlanTab />}
        {activeTab === 'active' && <ActiveUpdatePlansTab />}
        {activeTab === 'history' && <UpdateHistoryTab />}
      </div>
    </div>
  );
};

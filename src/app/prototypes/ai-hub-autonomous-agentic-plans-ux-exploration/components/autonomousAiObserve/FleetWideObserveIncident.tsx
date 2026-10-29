import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardExpandableContent,
  CardHeader,
  Content,
  ExpandableSection,
  Flex,
  FlexItem,
  Label,
  Progress,
  ProgressSize,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import {
  BullseyeIcon,
  CodeBranchIcon,
  ExclamationCircleIcon,
  TerminalIcon,
  WrenchIcon,
} from '@patternfly/react-icons';
import type { ClusterRecord, FleetWideCriticalIncident } from './data';
import { confidenceTierProgressValue } from '../../types/confidenceTier';
import { AgentPulseLabel } from './AgentPulseLabel';
import { AiInsightLede } from './AiInsightCategoryRow';
import { formatReasoningStepDisplayTime, ReasoningChainStepGlyph } from './reasoningChainTimeline';
import './autonomous-ai-observe.css';

function formatConsoleAlertFiredAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '—';
  }
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export interface FleetWideObserveIncidentProps {
  incident: FleetWideCriticalIncident;
  affectedClusters: ClusterRecord[];
  isExpanded: boolean;
  onToggle: (next: boolean) => void;
  onDiscussWithLightspeed?: (payload: { alertId: string; cardId: string; diagnosisName: string }) => void;
  /** Expands Active Reasoning Chain, RCA, and Remediation Hub when drilling from Top firing alerts. */
  expandAllInnerSectionsInitially?: boolean;
  /** When true, renders a persistent gray "AI-generated" label alongside the agent status badge. */
  showAiGeneratedLabel?: boolean;
}

export const FleetWideObserveIncident: React.FC<FleetWideObserveIncidentProps> = ({
  incident,
  affectedClusters,
  isExpanded,
  onToggle,
  onDiscussWithLightspeed,
  expandAllInnerSectionsInitially,
  showAiGeneratedLabel,
}) => {
  const [openChain, setOpenChain] = useState(false);
  const [openRca, setOpenRca] = useState(false);
  const [openRem, setOpenRem] = useState(false);

  useEffect(() => {
    if (expandAllInnerSectionsInitially) {
      setOpenChain(true);
      setOpenRca(true);
      setOpenRem(true);
    }
  }, [expandAllInnerSectionsInitially]);

  const onCardExpand = useCallback(
    (_e: React.MouseEvent, _id: string) => {
      onToggle(!isExpanded);
    },
    [isExpanded, onToggle]
  );

  return (
    <Card id={incident.id} className="ols-aio-subcard" isCompact isExpanded={isExpanded}>
      <CardHeader
        onExpand={onCardExpand}
        toggleButtonProps={{
          id: `${incident.id}-expand`,
          'aria-label': isExpanded ? `Collapse fleet incident ${incident.id}` : `Expand fleet incident ${incident.id}`,
        }}
        actions={{
          actions: (
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} flexWrap={{ default: 'nowrap' }}>
              {showAiGeneratedLabel && (
                <Label color="grey" isCompact>AI-generated</Label>
              )}
              <AgentPulseLabel status={incident.agentStatus} id={`${incident.id}-agent-pulse`} />
            </Flex>
          ),
        }}
      >
        <Flex
          alignItems={{ default: 'alignItemsFlexStart' }}
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          flexWrap={{ default: 'wrap' }}
        >
          <FlexItem style={{ minWidth: 0 }}>
            <div className="ols-aio-alert-summary">
              <div
                className="ols-aio-alert-summary__icon"
                style={{ color: 'var(--pf-t--global--color--status--danger--default)' }}
              >
                <ExclamationCircleIcon />
              </div>
              <Title headingLevel="h3" size="md" className="ols-aio-alert-summary__title">
                {incident.title}
              </Title>
              <time className="ols-aio-alert-summary__fired" dateTime={incident.firedAt}>
                {formatConsoleAlertFiredAt(incident.firedAt)}
              </time>
              <div className="ols-aio-alert-summary__fleet-meta">
                <Flex flexWrap={{ default: 'wrap' }} gap={{ default: 'gapSm' }}>
                  {affectedClusters.map((c) => (
                    <Label key={c.id} color="grey" variant="outline" isCompact>
                      {c.name}
                    </Label>
                  ))}
                </Flex>
                {incident.aiInsight.narrative ? (
                  <AiInsightLede
                    className="ols-aio-fleet-ai-narrative-block"
                    categoryLabel={incident.aiInsight.categoryLabel ?? ''}
                    narrative={incident.aiInsight.narrative}
                  />
                ) : null}
              </div>
            </div>
          </FlexItem>
        </Flex>
      </CardHeader>
      <CardExpandableContent>
        <CardBody>
          <Stack hasGutter>
            <StackItem>
              <ExpandableSection
                toggleText=""
                isExpanded={openChain}
                onToggle={(_e, expanded) => setOpenChain(expanded)}
                toggleContent={
                  <Flex alignItems={{ default: 'alignItemsCenter' }} flexWrap={{ default: 'wrap' }}>
                    <FlexItem>
                      <Flex alignItems={{ default: 'alignItemsCenter' }}>
                        <CodeBranchIcon style={{ marginRight: 'var(--pf-t--global--spacer--sm)' }} />
                        <Title headingLevel="h4" size="md">
                          Active Reasoning Chain
                        </Title>
                      </Flex>
                    </FlexItem>
                    <FlexItem>
                      {incident.agentStatus === 'investigating' ? (
                        <Label color="blue" variant="outline" isCompact>
                          Live
                        </Label>
                      ) : null}
                    </FlexItem>
                  </Flex>
                }
              >
                <ol className="ols-aio-reasoning-timeline">
                  {incident.steps.map((step) => (
                    <li key={step.id} className="ols-aio-reasoning-timeline__item">
                      <span className="ols-aio-reasoning-timeline__node">
                        <ReasoningChainStepGlyph step={step} />
                      </span>
                      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} flexWrap={{ default: 'wrap' }}>
                        <FlexItem>
                          <Flex
                            alignItems={{ default: 'alignItemsCenter' }}
                            flexWrap={{ default: 'wrap' }}
                            gap={{ default: 'gapSm' }}
                          >
                            <span
                              className="ols-aio-text-subtle-sm"
                              style={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                              {formatReasoningStepDisplayTime(step)}
                            </span>
                            {step.status === 'active' ? (
                              <Label color="blue" variant="outline" isCompact>
                                In progress
                              </Label>
                            ) : null}
                          </Flex>
                        </FlexItem>
                      </Flex>
                      <Title headingLevel="h5" size="md" style={{ marginTop: 'var(--pf-t--global--spacer--xs)' }}>
                        {step.title}
                      </Title>
                      {step.detail ? (
                        <Content
                          component="p"
                          style={{
                            marginTop: 'var(--pf-t--global--spacer--xs)',
                            color: 'var(--pf-t--global--text--color--subtle)',
                            marginBottom: 0,
                          }}
                        >
                          {step.detail}
                        </Content>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </ExpandableSection>
            </StackItem>

            <StackItem>
              <ExpandableSection
                toggleText=""
                isExpanded={openRca}
                onToggle={(_e, expanded) => setOpenRca(expanded)}
                toggleContent={
                  <Flex alignItems={{ default: 'alignItemsCenter' }}>
                    <BullseyeIcon style={{ marginRight: 'var(--pf-t--global--spacer--sm)' }} />
                    <Title headingLevel="h4" size="md">
                      Root Cause Analysis (RCA)
                    </Title>
                  </Flex>
                }
              >
                <div className="ols-aio-rca-box ols-aio-rca-box--critical">
                  <Flex alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                    <BullseyeIcon style={{ marginRight: 'var(--pf-t--global--spacer--xs)' }} />
                    <span className="ols-aio-text-overline">Detected Root Cause</span>
                  </Flex>
                  <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                    {incident.aggregatedFinding}
                  </Content>
                  <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                    {incident.rootCauseNarrative}
                  </Content>
                  <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }}>
                    <span className="ols-aio-text-overline">Confidence Score</span>
                    <span
                      className="ols-aio-card-stat-number"
                      style={{ color: 'var(--pf-t--global--color--status--success--default)' }}
                    >
                      {incident.confidence}
                    </span>
                  </Flex>
                  <Progress value={confidenceTierProgressValue(incident.confidence)} title="" size={ProgressSize.sm} measureLocation="none" variant="success" />
                  {onDiscussWithLightspeed ? (
                    <Flex
                      alignItems={{ default: 'alignItemsCenter' }}
                      gap={{ default: 'gapSm' }}
                      style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}
                    >
                      <Button
                        variant="secondary"
                        onClick={() =>
                          onDiscussWithLightspeed({
                            alertId: incident.id,
                            cardId: 'fleet-rca',
                            diagnosisName: 'Root cause analysis',
                          })
                        }
                      >
                        Discuss with Lightspeed
                      </Button>
                    </Flex>
                  ) : null}
                </div>
              </ExpandableSection>
            </StackItem>

            <StackItem>
              <ExpandableSection
                toggleText=""
                isExpanded={openRem}
                onToggle={(_e, expanded) => setOpenRem(expanded)}
                toggleContent={
                  <Flex alignItems={{ default: 'alignItemsCenter' }}>
                    <WrenchIcon style={{ marginRight: 'var(--pf-t--global--spacer--sm)' }} />
                    <Title headingLevel="h4" size="md">
                      Remediation Hub
                    </Title>
                  </Flex>
                }
              >
                <div className="ols-aio-remediation-box">
                  <Flex alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                    <TerminalIcon style={{ marginRight: 'var(--pf-t--global--spacer--xs)' }} />
                    <span className="ols-aio-text-overline">Recommended Action</span>
                  </Flex>
                  <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                    {incident.remediationProposal}{' '}
                    <span style={{ color: 'var(--pf-t--global--color--status--success--default)' }}>
                      {incident.estimatedRecovery}
                    </span>
                  </Content>
                  <Content
                    component="p"
                    className="ols-aio-text-subtle-sm"
                    style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
                  >
                    {incident.riskAssessment}
                  </Content>
                  <Flex>
                    <FlexItem style={{ marginRight: 'var(--pf-t--global--spacer--md)' }}>
                      <Button variant="primary">Apply Fix (Autonomous)</Button>
                    </FlexItem>
                    {onDiscussWithLightspeed ? (
                      <FlexItem>
                        <Button
                          variant="secondary"
                          onClick={() =>
                            onDiscussWithLightspeed({
                              alertId: incident.id,
                              cardId: 'fleet-remediation',
                              diagnosisName: 'Remediation plan',
                            })
                          }
                        >
                          Discuss with Lightspeed
                        </Button>
                      </FlexItem>
                    ) : null}
                  </Flex>
                </div>
              </ExpandableSection>
            </StackItem>
          </Stack>
        </CardBody>
      </CardExpandableContent>
    </Card>
  );
};

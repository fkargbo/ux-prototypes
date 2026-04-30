import React, { useCallback, useState } from 'react';
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
  Grid,
  GridItem,
  Label,
  Progress,
  ProgressSize,
  Spinner,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import {
  BullseyeIcon,
  CheckCircleIcon,
  CodeBranchIcon,
  DatabaseIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  GlobeIcon,
  InfoCircleIcon,
  NetworkIcon,
  SearchIcon,
  StarIcon,
  TerminalIcon,
  WrenchIcon,
} from '@patternfly/react-icons';
import type { ClusterRecord, FleetWideCriticalIncident, ReasoningStep, ReasoningStepStatus } from './data';
import { AgentPulseLabel } from './AgentPulseLabel';
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

function stepGlyph(step: ReasoningStep, status: ReasoningStepStatus): React.ReactNode {
  if (status === 'active') {
    return <Spinner size="sm" />;
  }
  if (status === 'done') {
    return (
      <span style={{ color: 'var(--pf-t--global--color--status--success--default)' }}>
        <CheckCircleIcon />
      </span>
    );
  }
  if (status === 'pending') {
    if (step.icon === 'database') {
      return <DatabaseIcon />;
    }
    if (step.icon === 'network') {
      return <NetworkIcon />;
    }
    if (step.icon === 'search') {
      return <SearchIcon />;
    }
    return <CheckCircleIcon />;
  }
  return (
    <span style={{ color: 'var(--pf-t--global--color--status--danger--default)' }}>
      <ExclamationTriangleIcon />
    </span>
  );
}

export interface FleetWideObserveIncidentProps {
  incident: FleetWideCriticalIncident;
  affectedClusters: ClusterRecord[];
  isExpanded: boolean;
  onToggle: (next: boolean) => void;
  onDiscussWithLightspeed?: (payload: { alertId: string; cardId: string; diagnosisName: string }) => void;
}

export const FleetWideObserveIncident: React.FC<FleetWideObserveIncidentProps> = ({
  incident,
  affectedClusters,
  isExpanded,
  onToggle,
  onDiscussWithLightspeed,
}) => {
  const [openChain, setOpenChain] = useState(true);
  const [openRca, setOpenRca] = useState(true);
  const [openRem, setOpenRem] = useState(true);

  const onCardExpand = useCallback(
    (_e: React.MouseEvent, _id: string) => {
      onToggle(!isExpanded);
    },
    [isExpanded, onToggle]
  );

  return (
    <Card id={incident.id} className="ols-aio-subcard ols-aio-fleet-incident" isCompact isExpanded={isExpanded}>
      <CardHeader
        onExpand={onCardExpand}
        toggleButtonProps={{
          id: `${incident.id}-expand`,
          'aria-label': isExpanded ? `Collapse fleet incident ${incident.id}` : `Expand fleet incident ${incident.id}`,
        }}
        actions={{
          actions: <AgentPulseLabel status={incident.agentStatus} id={`${incident.id}-agent-pulse`} />,
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
              <time className="ols-aio-alert-summary__fired" dateTime={incident.firedAt}>
                {formatConsoleAlertFiredAt(incident.firedAt)}
              </time>
              <Label color="teal" variant="outline" isCompact style={{ marginLeft: 'var(--pf-t--global--spacer--sm)' }}>
                Fleet scope
              </Label>
              <Title headingLevel="h3" size="md" className="ols-aio-alert-summary__title">
                {incident.title}
              </Title>
              <Content component="p" className="ols-aio-text-overline" style={{ marginTop: 'var(--pf-t--global--spacer--xs)' }}>
                Causal grouping (the story)
              </Content>
              <Grid hasGutter style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}>
                {affectedClusters.map((c) => (
                  <GridItem key={c.id} span={12} md={4}>
                    <div
                      className="ols-aio-fleet-incident__cluster-chip"
                      style={{
                        border: '1px solid var(--pf-t--global--border--color--100)',
                        borderRadius: 'var(--pf-t--global--border--radius--default)',
                        padding: 'var(--pf-t--global--spacer--sm)',
                        background: 'var(--pf-t--global--BackgroundColor--100)',
                      }}
                    >
                      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                        <GlobeIcon style={{ flexShrink: 0, color: 'var(--pf-t--global--icon--color--subtle)' }} />
                        <div style={{ minWidth: 0 }}>
                          <Title headingLevel="h5" size="md" style={{ marginBottom: 0 }}>
                            {c.name}
                          </Title>
                          <Content component="small" className="ols-aio-text-subtle-sm" style={{ marginBottom: 0 }}>
                            {c.provider} · {c.region}
                          </Content>
                        </div>
                      </Flex>
                    </div>
                  </GridItem>
                ))}
              </Grid>
              <Content component="p" className="ols-aio-alert-summary__message" style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
                <strong>AI summary.</strong> {incident.aiSummary}
              </Content>
              <Content component="p" className="ols-aio-text-subtle-sm" style={{ marginTop: 'var(--pf-t--global--spacer--xs)', marginBottom: 0 }}>
                Expand this card for the active reasoning chain, aggregated RCA, and the remediation hub (governor actions).
              </Content>
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
                      <span className="ols-aio-reasoning-timeline__node">{stepGlyph(step, step.status)}</span>
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
                              {step.time ?? '—'}
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
                      Aggregated RCA (the evidence)
                    </Title>
                  </Flex>
                }
              >
                <div className="ols-aio-rca-box ols-aio-rca-box--critical">
                  <Content component="p" className="ols-aio-text-overline" style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }}>
                    Finding
                  </Content>
                  <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                    {incident.aggregatedFinding}
                  </Content>
                  <Content component="p" className="ols-aio-text-overline" style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }}>
                    Root cause
                  </Content>
                  <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                    {incident.rootCauseNarrative}
                  </Content>
                  <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }}>
                    <span className="ols-aio-text-overline">Confidence (fleet aggregate)</span>
                    <span
                      className="ols-aio-card-stat-number"
                      style={{ color: 'var(--pf-t--global--color--status--success--default)' }}
                    >
                      91%
                    </span>
                  </Flex>
                  <Progress value={91} title="" size={ProgressSize.sm} measureLocation="none" variant="success" />
                  {onDiscussWithLightspeed ? (
                    <Flex
                      alignItems={{ default: 'alignItemsCenter' }}
                      gap={{ default: 'gapSm' }}
                      style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}
                    >
                      <StarIcon style={{ color: 'var(--pf-t--global--icon--color--favorite--default)' }} aria-hidden />
                      <Button
                        variant="link"
                        isInline
                        onClick={() =>
                          onDiscussWithLightspeed({
                            alertId: incident.id,
                            cardId: 'fleet-rca',
                            diagnosisName: 'Fleet-wide aggregated RCA',
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
                      Remediation hub (the action)
                    </Title>
                  </Flex>
                }
              >
                <div className="ols-aio-remediation-box">
                  <Content component="p" className="ols-aio-text-overline" style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }}>
                    You are the governor
                  </Content>
                  <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                    Approve or escalate the proposed fleet change. Autonomous rollback is gated on your decision.
                  </Content>
                  <Flex alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                    <TerminalIcon style={{ marginRight: 'var(--pf-t--global--spacer--xs)' }} />
                    <span className="ols-aio-text-overline">The proposal</span>
                  </Flex>
                  <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                    {incident.remediationProposal}
                  </Content>
                  <Flex alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                    <InfoCircleIcon style={{ marginRight: 'var(--pf-t--global--spacer--xs)' }} />
                    <span className="ols-aio-text-overline">Risk assessment</span>
                  </Flex>
                  <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                    {incident.riskAssessment}{' '}
                    <span style={{ color: 'var(--pf-t--global--color--status--success--default)' }}>
                      {incident.estimatedRecovery}
                    </span>
                  </Content>
                  {onDiscussWithLightspeed ? (
                    <Flex
                      alignItems={{ default: 'alignItemsCenter' }}
                      gap={{ default: 'gapSm' }}
                      style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
                    >
                      <StarIcon style={{ color: 'var(--pf-t--global--icon--color--favorite--default)' }} aria-hidden />
                      <Button
                        variant="link"
                        isInline
                        onClick={() =>
                          onDiscussWithLightspeed({
                            alertId: incident.id,
                            cardId: 'fleet-remediation',
                            diagnosisName: 'Fleet remediation proposal',
                          })
                        }
                      >
                        Discuss with Lightspeed
                      </Button>
                    </Flex>
                  ) : null}
                  <Flex flexWrap={{ default: 'wrap' }} gap={{ default: 'gapSm' }}>
                    <FlexItem>
                      <Button variant="primary">Approve fleet rollback</Button>
                    </FlexItem>
                    <FlexItem>
                      <Button variant="secondary">Escalate to SRE</Button>
                    </FlexItem>
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

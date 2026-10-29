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
  Grid,
  GridItem,
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
  ExclamationTriangleIcon,
  FileAltIcon,
  InfoCircleIcon,
  TerminalIcon,
  WrenchIcon,
} from '@patternfly/react-icons';
import type { AlertRecord, AlertSeverity } from './data';
import { confidenceTierProgressValue } from '../../types/confidenceTier';
import { AgentPulseLabel } from './AgentPulseLabel';
import { AiInsightLede } from './AiInsightCategoryRow';
import { formatReasoningStepDisplayTime, ReasoningChainStepGlyph } from './reasoningChainTimeline';
import './autonomous-ai-observe.css';

/** OpenShift console–style: e.g. Apr 27, 2026, 1:39 PM */
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

function severityIcon(sev: AlertSeverity) {
  switch (sev) {
    case 'critical':
      return <ExclamationCircleIcon />;
    case 'warning':
      return <ExclamationTriangleIcon />;
    default:
      return <InfoCircleIcon />;
  }
}

function rcaBoxClass(sev: AlertSeverity): string {
  if (sev === 'critical') {
    return 'ols-aio-rca-box ols-aio-rca-box--critical';
  }
  if (sev === 'warning') {
    return 'ols-aio-rca-box ols-aio-rca-box--warning';
  }
  return 'ols-aio-rca-box ols-aio-rca-box--info';
}

export interface ObserveAlertItemProps {
  alert: AlertRecord;
  isExpanded: boolean;
  onToggle: (next: boolean) => void;
  /** Opens OLS with this alert’s diagnosis card context (RCA / remediation). */
  onDiscussWithLightspeed?: (payload: { alertId: string; cardId: string; diagnosisName: string }) => void;
  /** When true, expands Active Reasoning Chain, RCA, and Remediation Hub (e.g. drill from Top firing alerts). */
  expandAllInnerSectionsInitially?: boolean;
  /** When true, renders a persistent gray "AI-generated" label alongside the agent status badge. */
  showAiGeneratedLabel?: boolean;
}

export const ObserveAlertItem: React.FC<ObserveAlertItemProps> = ({
  alert,
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
    <Card id={alert.id} className="ols-aio-subcard" isCompact isExpanded={isExpanded}>
      <CardHeader
        onExpand={onCardExpand}
        toggleButtonProps={{
          id: `${alert.id}-expand`,
          'aria-label': isExpanded ? `Collapse alert ${alert.id}` : `Expand alert ${alert.id}`,
        }}
        actions={{
          actions: (
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} flexWrap={{ default: 'nowrap' }}>
              {showAiGeneratedLabel && (
                <Label color="grey" isCompact>AI-generated</Label>
              )}
              <AgentPulseLabel status={alert.agentStatus} id={`${alert.id}-agent-pulse`} />
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
                style={{
                  color:
                    alert.severity === 'critical'
                      ? 'var(--pf-t--global--color--status--danger--default)'
                      : alert.severity === 'warning'
                        ? 'var(--pf-t--global--color--status--warning--default)'
                        : 'var(--pf-t--global--color--status--info--default)',
                }}
              >
                {severityIcon(alert.severity)}
              </div>
              <Title headingLevel="h3" size="md" className="ols-aio-alert-summary__title">
                {alert.title}
              </Title>
              <time className="ols-aio-alert-summary__fired" dateTime={alert.firedAt}>
                {formatConsoleAlertFiredAt(alert.firedAt)}
              </time>
              <AiInsightLede
                className="ols-aio-alert-summary__message ols-aio-alert-summary__message--ai-insight"
                categoryLabel={alert.aiInsight.categoryLabel}
                narrative={alert.message}
              />
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
                  <Flex
                    alignItems={{ default: 'alignItemsCenter' }}
                    justifyContent={{ default: 'justifyContentSpaceBetween' }}
                    flexWrap={{ default: 'wrap' }}
                    gap={{ default: 'gapSm' }}
                    style={{ width: '100%' }}
                  >
                    <FlexItem>
                      <Flex alignItems={{ default: 'alignItemsCenter' }} flexWrap={{ default: 'wrap' }} gap={{ default: 'gapSm' }}>
                        <CodeBranchIcon style={{ marginRight: 'var(--pf-t--global--spacer--sm)' }} />
                        <Title headingLevel="h4" size="md">
                          Active Reasoning Chain
                        </Title>
                      </Flex>
                    </FlexItem>
                    <FlexItem>
                      {alert.agentStatus === 'investigating' ? (
                        <Label color="blue" variant="outline" isCompact>
                          Live
                        </Label>
                      ) : null}
                    </FlexItem>
                  </Flex>
                }
              >
                <ol className="ols-aio-reasoning-timeline">
                  {alert.steps.map((step) => (
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
                <div className={rcaBoxClass(alert.severity)}>
                  <Flex alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                    <BullseyeIcon style={{ marginRight: 'var(--pf-t--global--spacer--xs)' }} />
                    <span className="ols-aio-text-overline">Detected Root Cause</span>
                  </Flex>
                  <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                    {alert.rcaSummary}{' '}
                    <span
                      style={{
                        fontFamily: 'var(--pf-t--global--font--family--mono)',
                        fontSize: 'var(--pf-t--global--font--size--body--sm)',
                        color: 'var(--pf-t--global--color--status--danger--default)',
                      }}
                    >
                      {alert.rootCauseRef}
                    </span>{' '}
                    <span style={{ color: 'var(--pf-t--global--color--status--info--default)' }}>
                      {alert.rootCauseTail}
                    </span>
                  </Content>
                  <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }}>
                    <span className="ols-aio-text-overline">Confidence Score</span>
                    <span
                      className="ols-aio-card-stat-number"
                      style={{ color: 'var(--pf-t--global--color--status--success--default)' }}
                    >
                      {alert.confidence}
                    </span>
                  </Flex>
                  <Progress
                    value={confidenceTierProgressValue(alert.confidence)}
                    title=""
                    size={ProgressSize.sm}
                    measureLocation="none"
                    variant="success"
                  />
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
                            alertId: alert.id,
                            cardId: 'rca',
                            diagnosisName: 'Root cause analysis',
                          })
                        }
                      >
                        Discuss with Lightspeed
                      </Button>
                    </Flex>
                  ) : null}
                  <Grid hasGutter style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
                    <GridItem span={12} md={6}>
                      <Card isCompact>
                        <CardHeader>
                          <Title headingLevel="h5" size="md">
                            <FileAltIcon style={{ marginRight: 'var(--pf-t--global--spacer--xs)' }} />
                            Log Snippet
                          </Title>
                        </CardHeader>
                        <CardBody>
                          <pre className="ols-aio-code-block">{alert.logLines}</pre>
                        </CardBody>
                      </Card>
                    </GridItem>
                    <GridItem span={12} md={6}>
                      <Card isCompact>
                        <CardHeader>
                          <Title headingLevel="h5" size="md">
                            Blast Radius
                          </Title>
                        </CardHeader>
                        <CardBody>
                          <Flex flexWrap={{ default: 'wrap' }} gap={{ default: 'gapSm' }}>
                            {alert.blastRadius.map((b) => (
                              <Label key={b} color="orange" variant="outline" isCompact>
                                {b}
                              </Label>
                            ))}
                          </Flex>
                        </CardBody>
                      </Card>
                    </GridItem>
                  </Grid>
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
                  <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                    {alert.remediationSummary}{' '}
                    <span style={{ color: 'var(--pf-t--global--color--status--success--default)' }}>
                      {alert.estimatedRecovery}
                    </span>
                  </Content>
                  <pre className="ols-aio-code-block" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                    {alert.remediationCommands}
                  </pre>
                  <Flex>
                    <FlexItem style={{ marginRight: 'var(--pf-t--global--spacer--md)' }}>
                      <Button variant="primary">
                        Apply Fix (Autonomous)
                      </Button>
                    </FlexItem>
                    {onDiscussWithLightspeed ? (
                      <FlexItem>
                        <Button
                          variant="secondary"
                          onClick={() =>
                            onDiscussWithLightspeed({
                              alertId: alert.id,
                              cardId: 'remediation',
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

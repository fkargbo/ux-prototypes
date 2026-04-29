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
  BoltIcon,
  BullseyeIcon,
  CheckCircleIcon,
  CodeBranchIcon,
  DatabaseIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  FileAltIcon,
  InfoCircleIcon,
  NetworkIcon,
  SearchIcon,
  TerminalIcon,
  UserCogIcon,
  WrenchIcon,
} from '@patternfly/react-icons';
import type { AlertRecord, AlertSeverity, ReasoningStep, ReasoningStepStatus } from './data';
import { AgentPulseLabel } from './AgentPulseLabel';
import './autonomous-ai-observe.css';

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

function severityLabelColor(sev: AlertSeverity): 'red' | 'orange' | 'blue' {
  if (sev === 'critical') {
    return 'red';
  }
  if (sev === 'warning') {
    return 'orange';
  }
  return 'blue';
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

function stepGlyph(
  step: ReasoningStep,
  status: ReasoningStepStatus
): React.ReactNode {
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

export interface ObserveAlertItemProps {
  alert: AlertRecord;
  isExpanded: boolean;
  onToggle: (next: boolean) => void;
}

export const ObserveAlertItem: React.FC<ObserveAlertItemProps> = ({
  alert,
  isExpanded,
  onToggle,
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

  const sevColor = severityLabelColor(alert.severity);

  return (
    <Card id={alert.id} isCompact isExpanded={isExpanded}>
      <CardHeader
        onExpand={onCardExpand}
        toggleButtonProps={{
          id: `${alert.id}-expand`,
          'aria-label': isExpanded ? `Collapse alert ${alert.id}` : `Expand alert ${alert.id}`,
        }}
        actions={{
          actions: (
            <AgentPulseLabel status={alert.agentStatus} id={`${alert.id}-agent-pulse`} />
          ),
        }}
      >
        <Flex
          alignItems={{ default: 'alignItemsFlexStart' }}
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          flexWrap={{ default: 'wrap' }}
        >
          <FlexItem>
            <Flex alignItems={{ default: 'alignItemsFlexStart' }} flexWrap={{ default: 'nowrap' }}>
              <FlexItem>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--pf-t--global--border--radius--default)',
                    border: '1px solid var(--pf-t--global--border--color--default)',
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
              </FlexItem>
              <FlexItem style={{ minWidth: 0 }}>
                <Stack hasGutter>
                  <StackItem>
                    <Flex alignItems={{ default: 'alignItemsCenter' }} flexWrap={{ default: 'wrap' }}>
                      <FlexItem>
                        <Label color={sevColor} variant="outline" isCompact>
                          {alert.severity}
                        </Label>
                      </FlexItem>
                      <FlexItem>
                        <span
                          style={{
                            fontFamily: 'var(--pf-t--global--font--family--mono)',
                            color: 'var(--pf-t--global--text--color--subtle)',
                          }}
                        >
                          {alert.id}
                        </span>
                      </FlexItem>
                      <FlexItem>
                        <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>· {alert.age} ago</span>
                      </FlexItem>
                    </Flex>
                  </StackItem>
                  <StackItem>
                    <Title headingLevel="h3" size="md">
                      {alert.title}
                    </Title>
                    <Content
                      component="p"
                      style={{
                        marginTop: 'var(--pf-t--global--spacer--xs)',
                        fontFamily: 'var(--pf-t--global--font--family--mono)',
                        color: 'var(--pf-t--global--text--color--subtle)',
                        marginBottom: 0,
                      }}
                    >
                      {alert.service}
                    </Content>
                  </StackItem>
                </Stack>
              </FlexItem>
            </Flex>
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
                      {alert.agentStatus === 'investigating' ? (
                        <Label color="blue" variant="outline" isCompact>
                          live
                        </Label>
                      ) : null}
                    </FlexItem>
                  </Flex>
                }
              >
                <ol className="ols-aio-reasoning-timeline">
                  {alert.steps.map((step) => (
                    <li key={step.id} className="ols-aio-reasoning-timeline__item">
                      <span className="ols-aio-reasoning-timeline__node">{stepGlyph(step, step.status)}</span>
                      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} flexWrap={{ default: 'wrap' }}>
                        <FlexItem>
                          <span
                            style={{
                              fontFamily: 'var(--pf-t--global--font--family--mono)',
                              fontSize: 'var(--pf-t--global--font--size--body--sm)',
                              color: 'var(--pf-t--global--text--color--subtle)',
                            }}
                          >
                            {step.time ?? '—'}
                          </span>
                          {step.status === 'active' ? (
                            <Label
                              color="blue"
                              variant="outline"
                              isCompact
                              style={{ marginLeft: 'var(--pf-t--global--spacer--sm)' }}
                            >
                              <span style={{ fontStyle: 'italic', textTransform: 'uppercase' }}>in progress</span>
                            </Label>
                          ) : null}
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
                            fontFamily: 'var(--pf-t--global--font--family--mono)',
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
                    <span
                      style={{
                        fontFamily: 'var(--pf-t--global--font--family--mono)',
                        textTransform: 'uppercase',
                        fontSize: 'var(--pf-t--global--font--size--body--sm)',
                        color: 'var(--pf-t--global--text--color--subtle)',
                      }}
                    >
                      Detected Root Cause
                    </span>
                  </Flex>
                  <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                    {alert.rcaSummary}{' '}
                    <span
                      style={{
                        fontFamily: 'var(--pf-t--global--font--family--mono)',
                        color: 'var(--pf-t--global--color--status--danger--default)',
                      }}
                    >
                      {alert.rootCauseRef}
                    </span>{' '}
                    <span
                      style={{
                        fontFamily: 'var(--pf-t--global--font--family--mono)',
                        color: 'var(--pf-t--global--color--status--info--default)',
                      }}
                    >
                      {alert.rootCauseTail}
                    </span>
                  </Content>
                  <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }}>
                    <span
                      style={{
                        fontFamily: 'var(--pf-t--global--font--family--mono)',
                        textTransform: 'uppercase',
                        fontSize: 'var(--pf-t--global--font--size--body--sm)',
                        color: 'var(--pf-t--global--text--color--subtle)',
                      }}
                    >
                      Confidence Score
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--pf-t--global--font--family--mono)',
                        fontWeight: 'var(--pf-t--global--font--weight--body--bold)',
                        color: 'var(--pf-t--global--color--status--success--default)',
                      }}
                    >
                      {alert.confidence}%
                    </span>
                  </Flex>
                  <Progress
                    value={alert.confidence}
                    title=""
                    size={ProgressSize.sm}
                    measureLocation="none"
                    variant="success"
                  />
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
                    <span
                      style={{
                        fontFamily: 'var(--pf-t--global--font--family--mono)',
                        textTransform: 'uppercase',
                        fontSize: 'var(--pf-t--global--font--size--body--sm)',
                      }}
                    >
                      Recommended Action
                    </span>
                  </Flex>
                  <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                    {alert.remediationSummary}{' '}
                    <span
                      style={{
                        fontFamily: 'var(--pf-t--global--font--family--mono)',
                        color: 'var(--pf-t--global--color--status--success--default)',
                      }}
                    >
                      {alert.estimatedRecovery}
                    </span>
                  </Content>
                  <pre className="ols-aio-code-block" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                    {alert.remediationCommands}
                  </pre>
                  <Flex>
                    <FlexItem style={{ marginRight: 'var(--pf-t--global--spacer--md)' }}>
                      <Button variant="primary" icon={<BoltIcon />}>
                        Apply Fix (Autonomous)
                      </Button>
                    </FlexItem>
                    <FlexItem>
                      <Button variant="secondary" icon={<UserCogIcon />}>
                        Escalate to SRE
                      </Button>
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

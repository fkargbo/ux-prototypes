import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Flex,
  FlexItem,
  HelperText,
  HelperTextItem,
  Label,
  List,
  ListItem,
  Content,
  Title,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ExternalLinkAltIcon,
  MinusCircleIcon,
} from '@patternfly/react-icons';
import type {
  CapabilityAction,
  CapabilityCardData,
  CapabilityDependency,
  CapabilityOperationalState,
  CapabilityStatusKind,
} from '../types';
import { OperationalHealthLabel } from './OperationalHealthLabel';

const toOperationalState = (kind: CapabilityStatusKind): CapabilityOperationalState => {
  switch (kind) {
    case 'fully-enabled':       return 'FULLY_ENABLED';
    case 'configuration-required': return 'PARTIAL_SETUP';
    case 'degraded':            return 'DEGRADED';
    case 'available-addon':
    default:                    return 'NOT_INSTALLED';
  }
};

export interface CapabilityCardProps {
  capability: CapabilityCardData;
}

const DependencyIcon: React.FC<{ state: CapabilityDependency['state'] }> = ({ state }) => {
  if (state === 'ready') {
    return (
      <CheckCircleIcon
        color="var(--pf-t--global--icon--color--status--success--default)"
        aria-hidden
      />
    );
  }
  if (state === 'degraded') {
    return (
      <ExclamationCircleIcon
        color="var(--pf-t--global--icon--color--status--danger--default)"
        aria-hidden
      />
    );
  }
  if (state === 'attention') {
    return (
      <ExclamationTriangleIcon
        color="var(--pf-t--global--icon--color--status--warning--default)"
        aria-hidden
      />
    );
  }
  // 'missing' — component not yet installed or configured
  return (
    <MinusCircleIcon
      color="var(--pf-t--global--icon--color--subtle)"
      aria-hidden
    />
  );
};

const dependencyStateLabel = (state: CapabilityDependency['state']): string => {
  switch (state) {
    case 'ready':
      return 'Ready';
    case 'degraded':
      return 'Degraded';
    case 'attention':
      return 'Needs attention';
    case 'missing':
      return 'Not installed';
    default:
      return 'Not installed';
  }
};

export const CapabilityCard: React.FC<CapabilityCardProps> = ({ capability }) => {
  const navigate = useNavigate();

  const handleAction = (action: CapabilityAction) => {
    if (!action.href) {
      return;
    }
    if (action.isExternal || action.href.startsWith('http')) {
      window.open(action.href, '_blank', 'noopener,noreferrer');
      return;
    }
    navigate(action.href);
  };

  const helperTextEntries = capability.actions
    .filter((a): a is CapabilityAction & { helperText: string } => Boolean(a.helperText))
    .map((a) => ({ id: `${a.id}-helper-text`, text: a.helperText }));

  const primaryActions = capability.actions.filter((a) => a.variant !== 'link');
  const learnMoreActions = capability.actions.filter((a) => a.variant === 'link');

  const hasFooterContent = capability.actions.length > 0 || helperTextEntries.length > 0;

  return (
    <Card
      id={`capability-${capability.id}`}
      isFullHeight
      aria-labelledby={`capability-title-${capability.id}`}
    >
      <CardHeader>
        <Flex
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          alignItems={{ default: 'alignItemsFlexStart' }}
          flexWrap={{ default: 'nowrap' }}
          gap={{ default: 'gapSm' }}
        >
          <FlexItem style={{ minWidth: 0 }}>
            <CardTitle
              id={`capability-title-${capability.id}`}
              component="h3"
              subtitle={capability.subtitle}
            >
              {capability.title}
            </CardTitle>
          </FlexItem>
          <FlexItem style={{ flexShrink: 0 }}>
            <Label
              color={capability.status.color}
              isCompact
              icon={
                capability.status.kind === 'fully-enabled' ? (
                  <CheckCircleIcon />
                ) : capability.status.kind === 'degraded' ? (
                  <ExclamationCircleIcon />
                ) : undefined
              }
            >
              <span className="pf-v6-u-screen-reader">{capability.status.srText}. </span>
              {capability.status.label}
            </Label>
          </FlexItem>
        </Flex>
      </CardHeader>
      <CardBody>
        <Content component="p" className="ols-obs-services-capability-card__summary">
          {capability.summary}
        </Content>
        {capability.dependencies && capability.dependencies.length > 0 ? (
          <>
            <Title headingLevel="h4" size="md" className="ols-obs-services-capability-card__deps-heading">
              Dependencies
            </Title>
            <OperationalHealthLabel
              state={toOperationalState(capability.status.kind)}
              className="ols-obs-services-capability-card__ops-health-label"
            />
            <List isPlain className="ols-obs-services-capability-card__deps">
              {capability.dependencies.map((dep) => (
                <ListItem key={dep.id} icon={<DependencyIcon state={dep.state} />}>
                  <span className="pf-v6-u-screen-reader">{dependencyStateLabel(dep.state)}: </span>
                  {dep.label}
                  {dep.detail || dep.action ? (
                    <div className="ols-obs-services-capability-card__dep-meta">
                      {dep.detail ? (
                        <small className="ols-obs-services-capability-card__dep-detail">
                          {' '}({dep.detail})
                        </small>
                      ) : null}
                      {dep.action ? (
                        <>
                          <br />
                          <Button
                            variant="link"
                            isInline
                            onClick={() => {
                              if (dep.action!.isExternal || dep.action!.href?.startsWith('http')) {
                                window.open(dep.action!.href, '_blank', 'noopener,noreferrer');
                              } else if (dep.action!.href) {
                                navigate(dep.action!.href);
                              }
                            }}
                          >
                            {dep.action.label}
                          </Button>
                        </>
                      ) : null}
                    </div>
                  ) : null}
                </ListItem>
              ))}
            </List>
          </>
        ) : null}
      </CardBody>
      {hasFooterContent ? (
        <CardFooter>
          <Flex
            direction={{ default: 'column' }}
            gap={{ default: 'gapSm' }}
            alignItems={{ default: 'alignItemsFlexStart' }}
          >
            {helperTextEntries.map((entry) => (
              <FlexItem key={entry.id}>
                <HelperText>
                  <HelperTextItem id={entry.id} className="ols-obs-services-helper-text">
                    {entry.text}
                  </HelperTextItem>
                </HelperText>
              </FlexItem>
            ))}
            {capability.actions.length > 0 ? (
              <FlexItem style={{ width: '100%' }}>
                <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }} flexWrap={{ default: 'nowrap' }}>
                  {primaryActions.map((action) => (
                    <FlexItem key={action.id}>
                      <Button
                        variant={action.variant}
                        onClick={() => handleAction(action)}
                        icon={action.isExternal ? <ExternalLinkAltIcon /> : undefined}
                        iconPosition={action.isExternal ? 'end' : undefined}
                        aria-label={
                          action.isExternal ? `${action.label} (opens in a new tab)` : undefined
                        }
                        aria-describedby={
                          action.helperText ? `${action.id}-helper-text` : undefined
                        }
                      >
                        {action.label}
                      </Button>
                    </FlexItem>
                  ))}
                  {learnMoreActions.map((action) => (
                    <FlexItem key={action.id} style={{ marginLeft: 'auto' }}>
                      <Button
                        variant="link"
                        onClick={() => handleAction(action)}
                        icon={<ExternalLinkAltIcon />}
                        iconPosition="end"
                        aria-label={`${action.label} (opens in a new tab)`}
                      >
                        {action.label}
                      </Button>
                    </FlexItem>
                  ))}
                </Flex>
              </FlexItem>
            ) : null}
          </Flex>
        </CardFooter>
      ) : null}
    </Card>
  );
};

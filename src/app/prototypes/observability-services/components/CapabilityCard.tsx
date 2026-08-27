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
  Tooltip,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ExternalLinkAltIcon,
  MinusCircleIcon,
} from '@patternfly/react-icons';
import type { CapabilityAction, CapabilityCardData, CapabilityDependency } from '../types';
import { OperationalHealthLabel } from './OperationalHealthLabel';


export interface CapabilityCardProps {
  capability: CapabilityCardData;
  /**
   * Optional callback fired when a dependency inline-action button is clicked.
   * Receives the dep ID. Used by the v2 simulation to advance the scenario step
   * when the user triggers a specific action (e.g. "Configure MonitoringStack CR").
   */
  onDepAction?: (depId: string) => void;
}

const DependencyIcon: React.FC<{
  state: CapabilityDependency['state'];
  category?: CapabilityDependency['category'];
  detail?: string;
}> = ({ state, category, detail }) => {
  if (state === 'ready') {
    return <CheckCircleIcon color="var(--pf-t--global--icon--color--status--success--default)" aria-hidden />;
  }

  if (state === 'degraded') {
    const icon = <ExclamationCircleIcon color="var(--pf-t--global--icon--color--status--danger--default)" aria-hidden />;
    return detail ? <Tooltip content={detail} position="right">{icon}</Tooltip> : icon;
  }

  if (state === 'attention') {
    const icon = <ExclamationTriangleIcon color="var(--pf-t--global--icon--color--status--warning--default)" aria-hidden />;
    // Use the item-specific detail as the icon tooltip so each component gets
    // accurate context rather than a generic fallback string.
    return detail ? <Tooltip content={detail} position="right">{icon}</Tooltip> : icon;
  }

  // 'missing' — neutral grey; tooltip varies by category (Day 0 context)
  const missingTooltip =
    category === 'OPERATOR'
      ? 'Not installed'
      : category === 'CONFIGURATION'
        ? 'Operator required'
        : 'Not configured';
  return (
    <Tooltip content={missingTooltip} position="right">
      <MinusCircleIcon color="var(--pf-t--global--icon--color--subtle)" aria-hidden />
    </Tooltip>
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
      return 'Not configured';
    default:
      return 'Unknown';
  }
};

export const CapabilityCard: React.FC<CapabilityCardProps> = ({ capability, onDepAction }) => {
  const navigate = useNavigate();

  const renderDepItem = (dep: CapabilityDependency) => (
    <ListItem key={dep.id} icon={<DependencyIcon state={dep.state} category={dep.category} detail={dep.detail} />}>
      <span className="pf-v6-u-screen-reader">{dependencyStateLabel(dep.state)}: </span>
      {dep.detail ? (
        <Tooltip content={dep.detail} position="top">
          <span style={{ cursor: 'help' }}>{dep.label}</span>
        </Tooltip>
      ) : (
        dep.label
      )}
      {dep.action ? (
        <div style={{ marginTop: '4px' }}>
          <Button
            variant="link"
            isInline
            onClick={() => {
              onDepAction?.(dep.id);
              if (dep.action!.isExternal || dep.action!.href?.startsWith('http')) {
                window.open(dep.action!.href, '_blank', 'noopener,noreferrer');
              } else if (dep.action!.href) {
                navigate(dep.action!.href);
              }
            }}
          >
            {dep.action.label}
          </Button>
        </div>
      ) : null}
    </ListItem>
  );

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
        {(() => {
          const deps = capability.dependencies ?? [];
          if (deps.length === 0) return null;

          const isCategorized = deps.some((d) => d.category);

          if (isCategorized) {
            const operatorDeps = deps.filter((d) => d.category === 'OPERATOR');
            const configDeps = deps.filter((d) => d.category === 'CONFIGURATION');
            return (
              <>
                <OperationalHealthLabel
                  runtimeHealth={capability.runtimeHealth ?? 'HEALTHY'}
                  className="ols-obs-services-capability-card__ops-health-label"
                />
                {operatorDeps.length > 0 && (
                  <>
                    <h4 className="ols-obs-services-capability-card__deps-heading">
                      Required operators
                    </h4>
                    <List isPlain className="ols-obs-services-capability-card__deps">
                      {operatorDeps.map(renderDepItem)}
                    </List>
                  </>
                )}
                {configDeps.length > 0 && (
                  <>
                    <h4 className="ols-obs-services-capability-card__deps-heading ols-obs-services-capability-card__deps-heading--spaced">
                      Required configurations
                    </h4>
                    <List isPlain className="ols-obs-services-capability-card__deps">
                      {configDeps.map(renderDepItem)}
                    </List>
                  </>
                )}
              </>
            );
          }

          return (
            <>
              <h4 className="ols-obs-services-capability-card__deps-heading">
                Required components
              </h4>
              <OperationalHealthLabel
                runtimeHealth={capability.runtimeHealth ?? 'HEALTHY'}
                className="ols-obs-services-capability-card__ops-health-label"
              />
              <List isPlain className="ols-obs-services-capability-card__deps">
                {deps.map(renderDepItem)}
              </List>
            </>
          );
        })()}
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
                    <FlexItem key={action.id}>
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

/**
 * CapabilityCardDayZero
 *
 * v2.0.0 Day-0 capability card built around a DataList dependency table.
 * Each dependency row evaluates the 4-state lifecycle engine:
 *
 *   blocked          → grey "Prerequisite required" label  (upstream dep absent)
 *   missing-operator → "Install ↗" link button → external OperatorHub URL
 *   disabled-cr      → "Enable" link button with optimistic loading simulation
 *   ready            → green label with CheckCircleIcon
 *
 * Enable actions simulate an async CR creation and transition the row to
 * 'ready' after a short delay — no real API call is made in the prototype.
 */

import React, { useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Content,
  DataList,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Flex,
  FlexItem,
  Label,
  Title,
} from '@patternfly/react-core';
import { CheckCircleIcon, ExternalLinkAltIcon } from '@patternfly/react-icons';
import type { V2CapabilityCard, V2DependencyItem, DependencyLifecycleState } from '../types';

// ─── Dependency action column ─────────────────────────────────────────────────

interface DepActionProps {
  dep: V2DependencyItem;
  isEnabling: boolean;
  onEnable: () => void;
}

const DepAction: React.FC<DepActionProps> = ({ dep, isEnabling, onEnable }) => {
  switch (dep.state as DependencyLifecycleState) {
    case 'ready':
      return (
        <Label color="green" icon={<CheckCircleIcon />} isCompact>
          {dep.readyLabel ?? 'Installed'}
        </Label>
      );

    case 'missing-operator':
      return (
        <Button
          variant="link"
          isInline
          component="a"
          href={dep.operatorHubUrl ?? '#'}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${dep.installLabel ?? 'Install'} ${dep.label} — opens OperatorHub`}
        >
          {dep.installLabel ?? 'Install'}
          <ExternalLinkAltIcon
            style={{ marginLeft: 'var(--pf-t--global--spacer--xs)', verticalAlign: 'middle' }}
          />
        </Button>
      );

    case 'disabled-cr':
      return (
        <Button
          variant="link"
          isInline
          isLoading={isEnabling}
          isDisabled={isEnabling}
          onClick={onEnable}
          aria-label={`${dep.crActionLabel ?? 'Enable'} ${dep.label}`}
        >
          {dep.crActionLabel ?? 'Enable'}
        </Button>
      );

    case 'blocked':
      return (
        <Label color="grey" isCompact>
          Prerequisite required
        </Label>
      );

    default:
      return null;
  }
};

// ─── Card status badge ────────────────────────────────────────────────────────

const CardStatusBadge: React.FC<{ deps: V2DependencyItem[] }> = ({ deps }) => {
  const isActive = deps.every((d) => d.state === 'ready');
  return isActive ? (
    <Label status="success" isCompact>
      Active
    </Label>
  ) : (
    <Label color="grey" isCompact>
      Setup required
    </Label>
  );
};

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CapabilityCardDayZeroProps {
  card: V2CapabilityCard;
}

export const CapabilityCardDayZero: React.FC<CapabilityCardDayZeroProps> = ({ card }) => {
  const [deps, setDeps] = useState<V2DependencyItem[]>(card.dependencies);
  const [enablingIds, setEnablingIds] = useState<Set<string>>(new Set());

  const handleEnable = (depId: string) => {
    setEnablingIds((prev) => new Set([...prev, depId]));

    // Simulate async CR creation — resolve after 1.2 s
    window.setTimeout(() => {
      setDeps((prev) =>
        prev.map((d) => (d.id === depId ? { ...d, state: 'ready' as const } : d))
      );
      setEnablingIds((prev) => {
        const next = new Set(prev);
        next.delete(depId);
        return next;
      });
    }, 1200);
  };

  return (
    <Card isFullHeight>
      <CardHeader>
        <Flex
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          alignItems={{ default: 'alignItemsFlexStart' }}
          flexWrap={{ default: 'nowrap' }}
        >
          <FlexItem style={{ minWidth: 0 }}>
            <Title headingLevel="h3" size="md">
              {card.title}
            </Title>
            <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
              {card.subtitle}
            </Content>
          </FlexItem>
          <FlexItem style={{ flexShrink: 0 }}>
            <CardStatusBadge deps={deps} />
          </FlexItem>
        </Flex>
      </CardHeader>

      <CardBody>
        <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
          {card.description}
        </Content>

        <DataList aria-label={`${card.title} dependencies`} isCompact>
          {deps.map((dep) => (
            <DataListItem key={dep.id} aria-labelledby={`dep-label-${dep.id}`}>
              <DataListItemRow>
                <DataListItemCells
                  dataListCells={[
                    <DataListCell key="name" id={`dep-label-${dep.id}`} width={3}>
                      <Content
                        component="small"
                        style={{ color: 'var(--pf-t--global--text--color--regular)' }}
                      >
                        {dep.label}
                      </Content>
                    </DataListCell>,
                    <DataListCell key="action" width={2} style={{ textAlign: 'right' }}>
                      <DepAction
                        dep={dep}
                        isEnabling={enablingIds.has(dep.id)}
                        onEnable={() => handleEnable(dep.id)}
                      />
                    </DataListCell>,
                  ]}
                />
              </DataListItemRow>
            </DataListItem>
          ))}
        </DataList>
      </CardBody>

      {card.learnMoreHref ? (
        <CardFooter>
          <Flex justifyContent={{ default: 'justifyContentFlexEnd' }}>
            <FlexItem>
              <Button
                variant="link"
                isInline
                component="a"
                href={card.learnMoreHref}
                target="_blank"
                rel="noopener noreferrer"
                icon={<ExternalLinkAltIcon />}
                iconPosition="end"
              >
                Learn more
              </Button>
            </FlexItem>
          </Flex>
        </CardFooter>
      ) : null}
    </Card>
  );
};

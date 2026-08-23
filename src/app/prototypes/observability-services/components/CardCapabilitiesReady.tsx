import React, { useRef, useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  Content,
  Divider,
  Flex,
  FlexItem,
  Label,
  Popover,
  Title,
} from '@patternfly/react-core';
import type { CapabilitiesReadyStat, CapabilityPendingItem, CapabilityPendingState } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pendingStateLabel = (state: CapabilityPendingState): string =>
  state === 'PARTIAL_SETUP' ? 'Partial setup' : 'Not installed';

// ─── Popover body ─────────────────────────────────────────────────────────────

const PendingPopoverBody: React.FC<{
  items: CapabilityPendingItem[];
  onNavigate: (url: string) => void;
}> = ({ items, onNavigate }) => (
  <div>
    <Content component="small" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
      These capabilities require operator installation or CR configuration.
    </Content>

    <Divider style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }} />

    {/* Column headers */}
    <Flex gap={{ default: 'gapNone' }} style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }}>
      <FlexItem style={{ flex: '1 1 0', minWidth: 0 }}>
        <Content component="small">
          <strong>Capability</strong>
        </Content>
      </FlexItem>
      <FlexItem style={{ width: '110px', flexShrink: 0 }}>
        <Content component="small">
          <strong>Setup status</strong>
        </Content>
      </FlexItem>
    </Flex>

    {/* Rows */}
    {items.map((item) => (
      <Flex
        key={item.id}
        alignItems={{ default: 'alignItemsCenter' }}
        gap={{ default: 'gapNone' }}
        style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }}
      >
        <FlexItem style={{ flex: '1 1 0', minWidth: 0 }}>
          <Content component="p" style={{ fontSize: '14px', margin: 0 }}>
            {item.title}
          </Content>
        </FlexItem>
        <FlexItem style={{ width: '110px', flexShrink: 0 }}>
          <Label color="grey" isCompact>
            {pendingStateLabel(item.state)}
          </Label>
        </FlexItem>
      </Flex>
    ))}
  </div>
);

// ─── Card ─────────────────────────────────────────────────────────────────────

export interface CardCapabilitiesReadyProps extends CapabilitiesReadyStat {
  onNavigate: (url: string) => void;
}

export const CardCapabilitiesReady: React.FC<CardCapabilitiesReadyProps> = ({
  readyCount,
  totalCount,
  pendingItems,
  onNavigate,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pendingCount = pendingItems.length;

  return (
    <Card isFullHeight>
      <CardBody>
        <Content component="small" className="ols-obs-kpi-card__category">
          Capabilities ready
        </Content>

        <Title headingLevel="h4" size="2xl" className="ols-obs-kpi-card__value">
          {readyCount}/{totalCount}
        </Title>

        {/* Subtext: "Ready · N pending setup" — the link triggers the popover */}
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          gap={{ default: 'gapXs' }}
          style={{ marginTop: 'var(--pf-t--global--spacer--xs)' }}
        >
          <FlexItem>
            <Content component="small" className="ols-obs-kpi-card__label">
              Ready ·
            </Content>
          </FlexItem>
          <FlexItem>
            <Popover
              position="top"
              flipBehavior={['top', 'bottom']}
              isVisible={isPopoverOpen}
              shouldOpen={() => setIsPopoverOpen(true)}
              shouldClose={() => setIsPopoverOpen(false)}
              headerContent="Capabilities needing setup"
              bodyContent={
                <PendingPopoverBody items={pendingItems} onNavigate={onNavigate} />
              }
              triggerRef={triggerRef}
            >
              <Button
                ref={triggerRef}
                variant="link"
                isInline
                aria-label={`${pendingCount} capabilities pending setup — view details`}
                onClick={() => setIsPopoverOpen((prev) => !prev)}
              >
                <Content component="small">{pendingCount} pending setup</Content>
              </Button>
            </Popover>
          </FlexItem>
        </Flex>
      </CardBody>
    </Card>
  );
};

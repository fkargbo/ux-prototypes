import React, { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardExpandableContent,
  CardHeader,
  CardTitle,
  Content,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Label,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { EmptyStateVariant } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
} from '@patternfly/react-icons';
import {
  AWAY_DIGEST_ITEMS,
  CLUSTERS,
  buildClusterAwayDigestItems,
  getClusterById,
  type AwayDigestItem,
} from '../../components/autonomousAiObserve/data';
import { AI_EXPERIENCE_ICON_DATA_URL } from '../../components/autonomousAiObserve/aiExperienceIconUrl';

const AWAY_CARD_ID = 'ols-ai-hub-while-you-were-away';

function awayDigestSeverityIcon(tone: AwayDigestItem['tone']): React.ReactNode {
  if (tone === 'danger') {
    return <ExclamationCircleIcon style={{ color: 'var(--pf-t--global--color--status--danger--default)' }} />;
  }
  if (tone === 'warning') {
    return <ExclamationTriangleIcon style={{ color: 'var(--pf-t--global--color--status--warning--default)' }} />;
  }
  if (tone === 'success') {
    return <CheckCircleIcon style={{ color: 'var(--pf-t--global--color--status--success--default)' }} />;
  }
  return <InfoCircleIcon style={{ color: 'var(--pf-t--global--color--status--info--default)' }} />;
}

function awayDigestNewEventsLabel(clusterCount: number): string {
  if (clusterCount <= 1) {
    return 'New events across 1 cluster';
  }
  return `New events across ${clusterCount} clusters`;
}

function awayDigestClusterEventCountLabel(visibleCount: number): string {
  if (visibleCount <= 0) {
    return '0 new events';
  }
  if (visibleCount === 1) {
    return '1 new event';
  }
  return `${visibleCount} new events`;
}

export type WhileYouWereAwayCardProps = {
  /** When set, digest rows are scoped to this cluster (Core platforms). */
  clusterId?: string;
  onViewRemediations?: () => void;
  recommendedRemediationCount?: number;
};

export const WhileYouWereAwayCard: React.FC<WhileYouWereAwayCardProps> = ({
  clusterId,
  onViewRemediations,
  recommendedRemediationCount = 0,
}) => {
  const [expanded, setExpanded] = useState(true);
  const isClusterScope = Boolean(clusterId);

  const digestItems = useMemo(
    () => (clusterId ? buildClusterAwayDigestItems(clusterId) : AWAY_DIGEST_ITEMS),
    [clusterId]
  );

  const cluster = useMemo(() => (clusterId ? getClusterById(clusterId) : undefined), [clusterId]);

  const chipLabel = useMemo(() => {
    if (isClusterScope) {
      return awayDigestClusterEventCountLabel(digestItems.length);
    }
    return awayDigestNewEventsLabel(CLUSTERS.length);
  }, [digestItems.length, isClusterScope]);

  const cardTitle = isClusterScope && cluster ? `While you were away — ${cluster.name}` : 'While you were away';

  return (
    <Card
      className="ols-aio-subcard ols-aio-fleet-pair-card ols-autonomous-ai-observe-widget-v2-away"
      isCompact
      isExpanded={expanded}
      id={clusterId ? `${AWAY_CARD_ID}-${clusterId}` : AWAY_CARD_ID}
      component="section"
      aria-label="While you were away"
      style={{ boxSizing: 'border-box' }}
    >
      <CardHeader
        onExpand={() => setExpanded((v) => !v)}
        toggleButtonProps={{
          id: `${AWAY_CARD_ID}-toggle${clusterId ? `-${clusterId}` : ''}`,
          'aria-label': 'Toggle While you were away section',
        }}
      >
        <Stack>
          <StackItem>
            <Flex
              justifyContent={{ default: 'justifyContentSpaceBetween' }}
              alignItems={{ default: 'alignItemsCenter' }}
              flexWrap={{ default: 'wrap' }}
            >
              <FlexItem>
                <Flex alignItems={{ default: 'alignItemsCenter' }} flexWrap={{ default: 'wrap' }} gap={{ default: 'gapSm' }}>
                  <CardTitle component="h3" className="ols-aio-fleet-subcard-title">
                    {cardTitle}
                  </CardTitle>
                  <Label color="blue" isCompact>
                    {chipLabel}
                  </Label>
                </Flex>
              </FlexItem>
            </Flex>
          </StackItem>
          <StackItem style={{ marginTop: 'var(--pf-t--global--spacer--xs)' }}>
            <span className="ols-aio-text-subtle-sm">Since your last visit · 38m ago</span>
          </StackItem>
        </Stack>
      </CardHeader>
      <CardExpandableContent>
        <CardBody className="ols-aio-away-card-body">
          <AwayDigestList digestItems={digestItems} />
          <AwayDigestFooter
            onViewRemediations={onViewRemediations}
            recommendedRemediationCount={recommendedRemediationCount}
          />
        </CardBody>
      </CardExpandableContent>
    </Card>
  );
};

const AwayDigestList: React.FC<{ digestItems: AwayDigestItem[] }> = ({ digestItems }) => (
  <div className="ols-aio-away-scroll-region">
    {digestItems.length === 0 ? (
      <EmptyState variant={EmptyStateVariant.lg} style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
        <EmptyStateBody>
          <Title headingLevel="h4" size="lg">
            You&apos;re all caught up
          </Title>
          <Content component="p" style={{ marginTop: 'var(--pf-t--global--spacer--sm)', marginBottom: 0 }}>
            There are currently no active alerts requiring your attention.
          </Content>
        </EmptyStateBody>
      </EmptyState>
    ) : (
      <Stack style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
        {digestItems.map((item) => (
          <StackItem key={item.text}>
            <Alert
              isInline
              isExpandable
              variant={item.tone}
              className="ols-aio-away-alert"
              title={item.text}
              toggleAriaLabel={`Toggle details: ${item.text}`}
              customIcon={
                <span className="ols-aio-away-alert-icon-wrap" aria-hidden="true">
                  <span className="ols-aio-away-alert-time">{item.timestamp}</span>
                  <span className="ols-aio-away-alert-severity-icon">{awayDigestSeverityIcon(item.tone)}</span>
                </span>
              }
            >
              <Content
                component="p"
                className="ols-aio-text-subtle-sm"
                style={{
                  marginTop: 0,
                  marginBottom: 0,
                }}
              >
                <span className="ols-aio-ai-insight-icon" aria-hidden="true" style={{ marginRight: 'var(--pf-t--global--spacer--xs)' }}>
                  <img
                    src={AI_EXPERIENCE_ICON_DATA_URL}
                    alt=""
                    width={16}
                    height={16}
                    style={{ display: 'block', flexShrink: 0 }}
                  />
                </span>
                <span style={{ fontWeight: 600, color: 'var(--pf-t--global--text--color--subtle)' }}>AI insight: </span>
                <span>{item.meta}</span>
              </Content>
            </Alert>
          </StackItem>
        ))}
      </Stack>
    )}
  </div>
);

const AwayDigestFooter: React.FC<{
  onViewRemediations?: () => void;
  recommendedRemediationCount: number;
}> = ({ onViewRemediations, recommendedRemediationCount }) => (
  <div className="ols-aio-away-card-footer">
    <Button
      variant="primary"
      onClick={onViewRemediations}
      isDisabled={!onViewRemediations}
      aria-label={`View AI investigations, ${recommendedRemediationCount} suggested`}
    >
      <span className="ols-aio-ai-insight-icon" aria-hidden="true" style={{ marginRight: 'var(--pf-t--global--spacer--xs)' }}>
        <img
          src={AI_EXPERIENCE_ICON_DATA_URL}
          alt=""
          width={16}
          height={16}
          style={{ display: 'block', flexShrink: 0, filter: 'brightness(0) invert(1)' }}
        />
      </span>
      View AI investigations
    </Button>
  </div>
);

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AlertActionCloseButton,
  Button,
  Card,
  CardBody,
  CardExpandableContent,
  CardHeader,
  CardTitle,
  Content,
  Dropdown,
  DropdownGroup,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Flex,
  FlexItem,
  Gallery,
  GalleryItem,
  Grid,
  GridItem,
  Label,
  MenuToggle,
  type MenuToggleElement,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  GlobeIcon,
  InfoCircleIcon,
  MonitoringIcon,
} from '@patternfly/react-icons';
import type { AgentPulseStatus, ClusterHealth, ClusterRecord, ViewMode } from './data';
import {
  AWAY_DIGEST_ITEMS,
  ALERTS,
  CLUSTERS,
  computeFleetStats,
  getAlertsForCluster,
  getClusterById,
} from './data';
import { AgentPulseLabel } from './AgentPulseLabel';
import { ObserveAlertItem } from './ObserveAlertItem';
import './autonomous-ai-observe.css';

const WIDGET_ID = 'ols-autonomous-ai-observe-widget';

function fleetAgentStatus(clusters: ClusterRecord[]): AgentPulseStatus {
  if (clusters.some((c) => c.agentStatus === 'escalated')) {
    return 'escalated';
  }
  if (clusters.some((c) => c.agentStatus === 'remediating')) {
    return 'remediating';
  }
  if (clusters.some((c) => c.agentStatus === 'investigating')) {
    return 'investigating';
  }
  return 'idle';
}

/** Maps cluster health to PatternFly `Label` status (semantic color + icon). */
function healthToLabelStatus(health: ClusterHealth): 'success' | 'warning' | 'danger' {
  if (health === 'healthy') {
    return 'success';
  }
  if (health === 'degraded') {
    return 'warning';
  }
  return 'danger';
}

function capitalizeLabelWord(value: string): string {
  if (!value) {
    return value;
  }
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

/** Type label text (prod / staging / dev) — first letter capitalized. */
function clusterTypeLabelText(env: ClusterRecord['env']): string {
  return capitalizeLabelWord(env);
}

/** Health label text shown on the tile; degraded reads as Warning per spec. */
function clusterHealthLabelText(health: ClusterHealth): string {
  if (health === 'degraded') {
    return 'Warning';
  }
  return capitalizeLabelWord(health);
}

const mono: React.CSSProperties = {
  fontFamily: 'var(--pf-t--global--font--family--mono)',
};

export const AutonomousAiObserveWidget: React.FC = () => {
  const isMultiCluster = CLUSTERS.length > 1;
  const [viewMode, setViewMode] = useState<ViewMode>(isMultiCluster ? 'fleet' : 'cluster');
  const [selectedClusterId, setSelectedClusterId] = useState(CLUSTERS[0]?.id ?? '');
  const [widgetExpanded, setWidgetExpanded] = useState(true);
  const [awayOpen, setAwayOpen] = useState(true);
  const [fleetSummaryOpen, setFleetSummaryOpen] = useState(true);
  const [clustersOpen, setClustersOpen] = useState(true);
  const [cAwayOpen, setCAwayOpen] = useState(true);
  const [cHealthOpen, setCHealthOpen] = useState(true);
  const [cAlertsOpen, setCAlertsOpen] = useState(true);
  const [isViewContextOpen, setIsViewContextOpen] = useState(false);
  const [isClusterSwitcherOpen, setIsClusterSwitcherOpen] = useState(false);
  const [dismissedAwayTexts, setDismissedAwayTexts] = useState<Set<string>>(() => new Set());

  const visibleAwayDigestItems = useMemo(
    () => AWAY_DIGEST_ITEMS.filter((item) => !dismissedAwayTexts.has(item.text)),
    [dismissedAwayTexts]
  );

  const dismissAwayDigest = useCallback((text: string) => {
    setDismissedAwayTexts((prev) => new Set(prev).add(text));
  }, []);

  const dismissAllAwayDigests = useCallback(() => {
    setDismissedAwayTexts(new Set(AWAY_DIGEST_ITEMS.map((i) => i.text)));
  }, []);

  const fleetStats = useMemo(() => computeFleetStats(CLUSTERS, ALERTS), []);
  const fleetPulse = useMemo(() => fleetAgentStatus(CLUSTERS), []);
  const totalFleetNodes = useMemo(() => CLUSTERS.reduce((s, c) => s + c.nodes, 0), []);

  const selectedCluster = useMemo(
    () => getClusterById(selectedClusterId) ?? CLUSTERS[0],
    [selectedClusterId]
  );

  const clusterAlerts = useMemo(() => getAlertsForCluster(selectedClusterId), [selectedClusterId]);

  const [expandedAlerts, setExpandedAlerts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const next: Record<string, boolean> = {};
    clusterAlerts.forEach((a, index) => {
      next[a.id] = index === 0;
    });
    setExpandedAlerts(next);
  }, [clusterAlerts]);

  const toggleAlert = useCallback((id: string, open: boolean) => {
    setExpandedAlerts((prev) => ({ ...prev, [id]: open }));
  }, []);

  const onWidgetExpand = useCallback((_e: React.MouseEvent, id: string) => {
    if (id === WIDGET_ID) {
      setWidgetExpanded((v) => !v);
    }
  }, []);

  const subtitle = useMemo(() => {
    if (isMultiCluster && viewMode === 'fleet') {
      return `Fleet: ${CLUSTERS.length} clusters · ${totalFleetNodes} nodes`;
    }
    return `cluster: ${selectedCluster.name} · ${selectedCluster.provider} · ${selectedCluster.region}`;
  }, [isMultiCluster, viewMode, selectedCluster, totalFleetNodes]);

  const headerPulse: AgentPulseStatus =
    isMultiCluster && viewMode === 'fleet' ? fleetPulse : selectedCluster.agentStatus;

  const criticalOnCluster = clusterAlerts.filter((a) => a.severity === 'critical').length;
  const warningOnCluster = clusterAlerts.filter((a) => a.severity === 'warning').length;

  const degradedCount = CLUSTERS.filter((c) => c.health !== 'healthy').length;

  return (
    <>
      {isMultiCluster ? (
        <Flex
          className="ols-aio-context-selectors"
          alignItems={{ default: 'alignItemsCenter' }}
          flexWrap={{ default: 'wrap' }}
          style={{
            width: '100%',
            marginBottom: 'var(--pf-t--global--spacer--md)',
            gap: 'var(--pf-t--global--spacer--sm)',
          }}
        >
          <FlexItem>
            <Dropdown
              isOpen={isViewContextOpen}
              onOpenChange={setIsViewContextOpen}
              shouldFocusToggleOnSelect
              onSelect={(_event, value) => {
                if (value === 'fleet' || value === 'cluster') {
                  setViewMode(value);
                  if (value === 'fleet') {
                    setIsClusterSwitcherOpen(false);
                  }
                }
                setIsViewContextOpen(false);
              }}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() => setIsViewContextOpen((o) => !o)}
                  isExpanded={isViewContextOpen}
                  variant="default"
                  aria-label="View context"
                >
                  {viewMode === 'fleet' ? 'Fleet view' : 'Cluster view'}
                </MenuToggle>
              )}
            >
              <DropdownGroup label="View" labelHeadingLevel="h2">
                <DropdownList>
                  <DropdownItem value="fleet" isSelected={viewMode === 'fleet'}>
                    Fleet view
                  </DropdownItem>
                  <DropdownItem value="cluster" isSelected={viewMode === 'cluster'}>
                    Cluster view
                  </DropdownItem>
                </DropdownList>
              </DropdownGroup>
            </Dropdown>
          </FlexItem>
          {viewMode === 'cluster' ? (
            <FlexItem>
              <Dropdown
                isOpen={isClusterSwitcherOpen}
                onOpenChange={setIsClusterSwitcherOpen}
                shouldFocusToggleOnSelect
                onSelect={(_event, value) => {
                  const id = String(value);
                  if (CLUSTERS.some((c) => c.id === id)) {
                    setSelectedClusterId(id);
                  }
                  setIsClusterSwitcherOpen(false);
                }}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setIsClusterSwitcherOpen((o) => !o)}
                    isExpanded={isClusterSwitcherOpen}
                    variant="default"
                    aria-label="Cluster context"
                  >
                    {selectedCluster.name}
                  </MenuToggle>
                )}
              >
                <DropdownGroup label="Clusters" labelHeadingLevel="h2">
                  <DropdownList>
                    {CLUSTERS.map((c) => (
                      <DropdownItem key={c.id} value={c.id} isSelected={selectedClusterId === c.id}>
                        {c.name} · {c.provider} · {c.region}
                      </DropdownItem>
                    ))}
                  </DropdownList>
                </DropdownGroup>
              </Dropdown>
            </FlexItem>
          ) : null}
        </Flex>
      ) : null}

      <Card id={WIDGET_ID} isCompact isExpanded={widgetExpanded}>
      <CardHeader
        onExpand={onWidgetExpand}
        toggleButtonProps={{
          id: `${WIDGET_ID}-toggle`,
          'aria-label': widgetExpanded ? 'Collapse Autonomous AI Observe' : 'Expand Autonomous AI Observe',
        }}
        actions={{
          actions: <AgentPulseLabel status={headerPulse} id={`${WIDGET_ID}-header-pulse`} />,
        }}
      >
        <Flex alignItems={{ default: 'alignItemsFlexStart' }} flexWrap={{ default: 'wrap' }}>
          <FlexItem>
            <Title headingLevel="h2" size="md">
              Autonomous AI Observe
            </Title>
            <Content
              component="p"
              style={{
                ...mono,
                marginTop: 'var(--pf-t--global--spacer--xs)',
                fontSize: 'var(--pf-t--global--font--size--body--sm)',
                color: 'var(--pf-t--global--text--color--subtle)',
                marginBottom: 0,
              }}
            >
              {subtitle}
            </Content>
          </FlexItem>
        </Flex>
      </CardHeader>
      <CardExpandableContent>
        <CardBody>
          {viewMode === 'fleet' && isMultiCluster ? (
            <Stack hasGutter>
              <StackItem>
                <Card isCompact isExpanded={awayOpen} id={`${WIDGET_ID}-away`}>
                  <CardHeader
                    onExpand={() => setAwayOpen((o) => !o)}
                    toggleButtonProps={{
                      id: `${WIDGET_ID}-away-toggle`,
                      'aria-label': 'Toggle While you were away section',
                    }}
                  >
                    <Flex
                      justifyContent={{ default: 'justifyContentSpaceBetween' }}
                      alignItems={{ default: 'alignItemsCenter' }}
                      flexWrap={{ default: 'wrap' }}
                    >
                      <FlexItem>
                        <Flex alignItems={{ default: 'alignItemsCenter' }}>
                          <CardTitle component="h3">While you were away</CardTitle>
                          <Label color="blue" isCompact style={{ marginLeft: 'var(--pf-t--global--spacer--md)' }}>
                            new · {visibleAwayDigestItems.length} events
                          </Label>
                        </Flex>
                      </FlexItem>
                    </Flex>
                  </CardHeader>
                  <CardExpandableContent>
                    <CardBody>
                      <Flex
                        justifyContent={{ default: 'justifyContentSpaceBetween' }}
                        alignItems={{ default: 'alignItemsCenter' }}
                        style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
                      >
                        <span style={{ ...mono, color: 'var(--pf-t--global--text--color--subtle)' }}>
                          Since your last visit · 38m ago
                        </span>
                        <Button
                          variant="link"
                          isInline
                          isDisabled={visibleAwayDigestItems.length === 0}
                          onClick={dismissAllAwayDigests}
                          aria-label="Dismiss all digest alerts"
                        >
                          Dismiss all
                        </Button>
                      </Flex>
                      {visibleAwayDigestItems.length === 0 ? (
                        <EmptyState variant={EmptyStateVariant.lg}>
                          <EmptyStateBody>
                            <Title headingLevel="h4" size="lg">
                              You&apos;re all caught up
                            </Title>
                            <Content
                              component="p"
                              style={{ marginTop: 'var(--pf-t--global--spacer--sm)', marginBottom: 0 }}
                            >
                              There are currently no active alerts requiring your attention.
                            </Content>
                          </EmptyStateBody>
                        </EmptyState>
                      ) : (
                        <Stack hasGutter>
                          {visibleAwayDigestItems.map((item) => (
                            <StackItem key={item.text}>
                              <Alert
                                isInline
                                variant={item.tone}
                                title={item.text}
                                actionClose={
                                  <AlertActionCloseButton
                                    onClose={() => dismissAwayDigest(item.text)}
                                    aria-label={`Dismiss: ${item.text}`}
                                  />
                                }
                              >
                                <Content
                                  component="p"
                                  style={{
                                    ...mono,
                                    marginTop: 'var(--pf-t--global--spacer--xs)',
                                    marginBottom: 0,
                                    color: 'var(--pf-t--global--text--color--subtle)',
                                  }}
                                >
                                  {item.meta}
                                </Content>
                              </Alert>
                            </StackItem>
                          ))}
                        </Stack>
                      )}
                    </CardBody>
                  </CardExpandableContent>
                </Card>
              </StackItem>

              <StackItem>
                <Card isCompact isExpanded={fleetSummaryOpen} id={`${WIDGET_ID}-fleet-summary`}>
                  <CardHeader
                    onExpand={() => setFleetSummaryOpen((o) => !o)}
                    toggleButtonProps={{
                      id: `${WIDGET_ID}-fleet-summary-toggle`,
                      'aria-label': 'Toggle Fleet Summary section',
                    }}
                  >
                    <Flex alignItems={{ default: 'alignItemsCenter' }}>
                      <CardTitle component="h3">Fleet Summary</CardTitle>
                    </Flex>
                  </CardHeader>
                  <CardExpandableContent>
                    <CardBody>
                      <Grid hasGutter>
                        <GridItem span={12} md={6} lg={3}>
                          <Card isCompact>
                            <CardBody>
                              <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                                <span
                                  style={{
                                    ...mono,
                                    fontSize: 'var(--pf-t--global--font--size--body--sm)',
                                    color: 'var(--pf-t--global--text--color--subtle)',
                                  }}
                                >
                                  Critical alerts
                                </span>
                                <ExclamationCircleIcon
                                  style={{ color: 'var(--pf-t--global--color--status--danger--default)' }}
                                />
                              </Flex>
                              <Title headingLevel="h4" size="4xl" style={{ ...mono, marginTop: 'var(--pf-t--global--spacer--sm)' }}>
                                {fleetStats.criticalCount}
                              </Title>
                              <Content
                                component="p"
                                style={{
                                  ...mono,
                                  marginTop: 'var(--pf-t--global--spacer--xs)',
                                  marginBottom: 0,
                                  color: 'var(--pf-t--global--text--color--subtle)',
                                }}
                              >
                                Across all clusters
                              </Content>
                            </CardBody>
                          </Card>
                        </GridItem>
                        <GridItem span={12} md={6} lg={3}>
                          <Card isCompact>
                            <CardBody>
                              <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                                <span
                                  style={{
                                    ...mono,
                                    fontSize: 'var(--pf-t--global--font--size--body--sm)',
                                    color: 'var(--pf-t--global--text--color--subtle)',
                                  }}
                                >
                                  Warning alerts
                                </span>
                                <ExclamationTriangleIcon
                                  style={{ color: 'var(--pf-t--global--color--status--warning--default)' }}
                                />
                              </Flex>
                              <Title headingLevel="h4" size="4xl" style={{ ...mono, marginTop: 'var(--pf-t--global--spacer--sm)' }}>
                                {fleetStats.warningCount}
                              </Title>
                              <Content
                                component="p"
                                style={{
                                  ...mono,
                                  marginTop: 'var(--pf-t--global--spacer--xs)',
                                  marginBottom: 0,
                                  color: 'var(--pf-t--global--text--color--subtle)',
                                }}
                              >
                                Across all clusters
                              </Content>
                            </CardBody>
                          </Card>
                        </GridItem>
                        <GridItem span={12} md={6} lg={3}>
                          <Card isCompact>
                            <CardBody>
                              <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                                <span
                                  style={{
                                    ...mono,
                                    fontSize: 'var(--pf-t--global--font--size--body--sm)',
                                    color: 'var(--pf-t--global--text--color--subtle)',
                                  }}
                                >
                                  Clusters degraded
                                </span>
                                <ExclamationTriangleIcon
                                  style={{ color: 'var(--pf-t--global--color--status--warning--default)' }}
                                />
                              </Flex>
                              <Title headingLevel="h4" size="4xl" style={{ ...mono, marginTop: 'var(--pf-t--global--spacer--sm)' }}>
                                {degradedCount} / {fleetStats.totalClusters}
                              </Title>
                              <Content
                                component="p"
                                style={{
                                  ...mono,
                                  marginTop: 'var(--pf-t--global--spacer--xs)',
                                  marginBottom: 0,
                                  color: 'var(--pf-t--global--text--color--subtle)',
                                }}
                              >
                                Non-healthy
                              </Content>
                            </CardBody>
                          </Card>
                        </GridItem>
                        <GridItem span={12} md={6} lg={3}>
                          <Card isCompact>
                            <CardBody>
                              <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                                <span
                                  style={{
                                    ...mono,
                                    fontSize: 'var(--pf-t--global--font--size--body--sm)',
                                    color: 'var(--pf-t--global--text--color--subtle)',
                                  }}
                                >
                                  Total nodes
                                </span>
                                <InfoCircleIcon
                                  style={{ color: 'var(--pf-t--global--color--status--info--default)' }}
                                />
                              </Flex>
                              <Title headingLevel="h4" size="4xl" style={{ ...mono, marginTop: 'var(--pf-t--global--spacer--sm)' }}>
                                {fleetStats.totalNodes}
                              </Title>
                              <Content
                                component="p"
                                style={{
                                  ...mono,
                                  marginTop: 'var(--pf-t--global--spacer--xs)',
                                  marginBottom: 0,
                                  color: 'var(--pf-t--global--text--color--subtle)',
                                }}
                              >
                                {fleetStats.totalClusters} Clusters
                              </Content>
                            </CardBody>
                          </Card>
                        </GridItem>
                      </Grid>
                    </CardBody>
                  </CardExpandableContent>
                </Card>
              </StackItem>

              <StackItem>
                <Card isCompact isExpanded={clustersOpen} id={`${WIDGET_ID}-clusters`}>
                  <CardHeader
                    onExpand={() => setClustersOpen((o) => !o)}
                    toggleButtonProps={{
                      id: `${WIDGET_ID}-clusters-toggle`,
                      'aria-label': 'Toggle Clusters section',
                    }}
                  >
                    <CardTitle component="h3">Clusters</CardTitle>
                  </CardHeader>
                  <CardExpandableContent>
                    <CardBody>
                      <Gallery hasGutter>
                        {CLUSTERS.map((c) => {
                          const crit = ALERTS.filter((a) => a.clusterId === c.id && a.severity === 'critical').length;
                          const warn = ALERTS.filter((a) => a.clusterId === c.id && a.severity === 'warning').length;
                          const healthStatus = healthToLabelStatus(c.health);
                          const healthIcon =
                            c.health === 'healthy' ? (
                              <CheckCircleIcon />
                            ) : c.health === 'degraded' ? (
                              <ExclamationTriangleIcon />
                            ) : (
                              <ExclamationCircleIcon />
                            );
                          return (
                            <GalleryItem key={c.id}>
                              <div
                                role="button"
                                tabIndex={0}
                                aria-label={`Open cluster ${c.name} in cluster view`}
                                style={{
                                  cursor: 'pointer',
                                  borderRadius: 'var(--pf-t--global--border--radius--default)',
                                  outline:
                                    selectedClusterId === c.id
                                      ? '2px solid var(--pf-t--global--active--color--100)'
                                      : undefined,
                                }}
                                onClick={() => {
                                  setSelectedClusterId(c.id);
                                  setViewMode('cluster');
                                }}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    setSelectedClusterId(c.id);
                                    setViewMode('cluster');
                                  }
                                }}
                              >
                              <Card isCompact>
                                <CardBody>
                                  <Flex
                                    justifyContent={{ default: 'justifyContentSpaceBetween' }}
                                    alignItems={{ default: 'alignItemsFlexStart' }}
                                    flexWrap={{ default: 'nowrap' }}
                                  >
                                    <FlexItem style={{ flex: '1 1 auto', minWidth: 0, marginRight: 'var(--pf-t--global--spacer--sm)' }}>
                                      <Title
                                        headingLevel="h4"
                                        size="md"
                                        style={{
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        {c.name}
                                      </Title>
                                      <Flex
                                        alignItems={{ default: 'alignItemsCenter' }}
                                        flexWrap={{ default: 'nowrap' }}
                                        style={{ marginTop: 'var(--pf-t--global--spacer--xs)', minWidth: 0 }}
                                      >
                                        <GlobeIcon
                                          style={{
                                            marginRight: 'var(--pf-t--global--spacer--xs)',
                                            flexShrink: 0,
                                          }}
                                        />
                                        <span
                                          style={{
                                            ...mono,
                                            fontSize: 'var(--pf-t--global--font--size--body--sm)',
                                            color: 'var(--pf-t--global--text--color--subtle)',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            minWidth: 0,
                                          }}
                                        >
                                          {c.provider} · {c.region}
                                        </span>
                                      </Flex>
                                    </FlexItem>
                                    <FlexItem style={{ flexShrink: 0 }}>
                                      <Label status={healthStatus} icon={healthIcon} isCompact>
                                        {clusterHealthLabelText(c.health)}
                                      </Label>
                                    </FlexItem>
                                  </Flex>
                                  <Flex
                                    justifyContent={{ default: 'justifyContentSpaceBetween' }}
                                    alignItems={{ default: 'alignItemsCenter' }}
                                    style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}
                                  >
                                    <Label color="grey" variant="outline" isCompact>
                                      {clusterTypeLabelText(c.env)}
                                    </Label>
                                    <span style={{ ...mono, color: 'var(--pf-t--global--text--color--subtle)' }}>
                                      {crit === 0 && warn === 0 ? (
                                        <span style={{ color: 'var(--pf-t--global--text--color--disabled)' }}>no alerts</span>
                                      ) : (
                                        <>
                                          {crit > 0 ? (
                                            <span style={{ color: 'var(--pf-t--global--color--status--danger--default)' }}>· {crit}</span>
                                          ) : null}{' '}
                                          {warn > 0 ? (
                                            <span style={{ color: 'var(--pf-t--global--color--status--warning--default)' }}>· {warn}</span>
                                          ) : null}
                                        </>
                                      )}
                                    </span>
                                  </Flex>
                                  <Flex
                                    justifyContent={{ default: 'justifyContentSpaceBetween' }}
                                    style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}
                                  >
                                    <span
                                      style={{
                                        ...mono,
                                        fontSize: 'var(--pf-t--global--font--size--body--sm)',
                                        color: 'var(--pf-t--global--text--color--subtle)',
                                      }}
                                    >
                                      v{c.version}
                                    </span>
                                    <span
                                      style={{
                                        ...mono,
                                        fontSize: 'var(--pf-t--global--font--size--body--sm)',
                                        color: 'var(--pf-t--global--text--color--subtle)',
                                      }}
                                    >
                                      {c.nodes} nodes
                                    </span>
                                  </Flex>
                                </CardBody>
                              </Card>
                              </div>
                            </GalleryItem>
                          );
                        })}
                      </Gallery>
                    </CardBody>
                  </CardExpandableContent>
                </Card>
              </StackItem>
            </Stack>
          ) : (
            <Stack hasGutter>
              <StackItem>
                <Card isCompact isExpanded={cAwayOpen} id={`${WIDGET_ID}-c-away`}>
                  <CardHeader
                    onExpand={() => setCAwayOpen((o) => !o)}
                    toggleButtonProps={{
                      id: `${WIDGET_ID}-c-away-toggle`,
                      'aria-label': 'Toggle While you were away section',
                    }}
                  >
                    <Flex alignItems={{ default: 'alignItemsCenter' }}>
                      <CardTitle component="h3">
                        {isMultiCluster ? `While you were away — ${selectedCluster.name}` : 'While you were away'}
                      </CardTitle>
                      <Label color="blue" isCompact style={{ marginLeft: 'var(--pf-t--global--spacer--md)' }}>
                        new · {visibleAwayDigestItems.length} events
                      </Label>
                    </Flex>
                  </CardHeader>
                  <CardExpandableContent>
                    <CardBody>
                      <Flex
                        justifyContent={{ default: 'justifyContentSpaceBetween' }}
                        alignItems={{ default: 'alignItemsCenter' }}
                        style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
                      >
                        <span style={{ ...mono, color: 'var(--pf-t--global--text--color--subtle)' }}>
                          Since your last visit · 38m ago
                        </span>
                        <Button
                          variant="link"
                          isInline
                          isDisabled={visibleAwayDigestItems.length === 0}
                          onClick={dismissAllAwayDigests}
                          aria-label="Dismiss all digest alerts"
                        >
                          Dismiss all
                        </Button>
                      </Flex>
                      {visibleAwayDigestItems.length === 0 ? (
                        <EmptyState variant={EmptyStateVariant.lg}>
                          <EmptyStateBody>
                            <Title headingLevel="h4" size="lg">
                              You&apos;re all caught up
                            </Title>
                            <Content
                              component="p"
                              style={{ marginTop: 'var(--pf-t--global--spacer--sm)', marginBottom: 0 }}
                            >
                              There are currently no active alerts requiring your attention.
                            </Content>
                          </EmptyStateBody>
                        </EmptyState>
                      ) : (
                        <Stack hasGutter>
                          {visibleAwayDigestItems.map((item) => (
                            <StackItem key={`c-${item.text}`}>
                              <Alert
                                isInline
                                variant={item.tone}
                                title={item.text}
                                actionClose={
                                  <AlertActionCloseButton
                                    onClose={() => dismissAwayDigest(item.text)}
                                    aria-label={`Dismiss: ${item.text}`}
                                  />
                                }
                              >
                                <Content
                                  component="p"
                                  style={{
                                    ...mono,
                                    marginTop: 'var(--pf-t--global--spacer--xs)',
                                    marginBottom: 0,
                                    color: 'var(--pf-t--global--text--color--subtle)',
                                  }}
                                >
                                  {item.meta}
                                </Content>
                              </Alert>
                            </StackItem>
                          ))}
                        </Stack>
                      )}
                    </CardBody>
                  </CardExpandableContent>
                </Card>
              </StackItem>

              <StackItem>
                <Card isCompact isExpanded={cHealthOpen} id={`${WIDGET_ID}-c-health`}>
                  <CardHeader
                    onExpand={() => setCHealthOpen((o) => !o)}
                    toggleButtonProps={{
                      id: `${WIDGET_ID}-c-health-toggle`,
                      'aria-label': 'Toggle cluster health section',
                    }}
                  >
                    <Flex alignItems={{ default: 'alignItemsCenter' }}>
                      <MonitoringIcon style={{ marginRight: 'var(--pf-t--global--spacer--sm)' }} />
                      <CardTitle component="h3">Cluster Health &amp; Agent Pulse — {selectedCluster.name}</CardTitle>
                    </Flex>
                  </CardHeader>
                  <CardExpandableContent>
                    <CardBody>
                      <Grid hasGutter>
                        <GridItem span={12} md={4}>
                          <Card isCompact>
                            <CardBody>
                              <span
                                style={{
                                  ...mono,
                                  textTransform: 'uppercase',
                                  fontSize: 'var(--pf-t--global--font--size--body--sm)',
                                  color: 'var(--pf-t--global--text--color--subtle)',
                                }}
                              >
                                Active Critical Alerts
                              </span>
                              <Title headingLevel="h4" size="4xl" style={{ ...mono, marginTop: 'var(--pf-t--global--spacer--sm)' }}>
                                {criticalOnCluster}
                              </Title>
                              <Content
                                component="p"
                                style={{
                                  ...mono,
                                  marginTop: 'var(--pf-t--global--spacer--xs)',
                                  marginBottom: 0,
                                  color: 'var(--pf-t--global--text--color--subtle)',
                                }}
                              >
                                on {selectedCluster.name}
                              </Content>
                            </CardBody>
                          </Card>
                        </GridItem>
                        <GridItem span={12} md={4}>
                          <Card isCompact>
                            <CardBody>
                              <span
                                style={{
                                  ...mono,
                                  textTransform: 'uppercase',
                                  fontSize: 'var(--pf-t--global--font--size--body--sm)',
                                  color: 'var(--pf-t--global--text--color--subtle)',
                                }}
                              >
                                Active Warning Alerts
                              </span>
                              <Title headingLevel="h4" size="4xl" style={{ ...mono, marginTop: 'var(--pf-t--global--spacer--sm)' }}>
                                {warningOnCluster}
                              </Title>
                              <Content
                                component="p"
                                style={{
                                  ...mono,
                                  marginTop: 'var(--pf-t--global--spacer--xs)',
                                  marginBottom: 0,
                                  color: 'var(--pf-t--global--text--color--subtle)',
                                }}
                              >
                                on {selectedCluster.name}
                              </Content>
                            </CardBody>
                          </Card>
                        </GridItem>
                        <GridItem span={12} md={4}>
                          <Card isCompact>
                            <CardBody>
                              <span
                                style={{
                                  ...mono,
                                  textTransform: 'uppercase',
                                  fontSize: 'var(--pf-t--global--font--size--body--sm)',
                                  color: 'var(--pf-t--global--text--color--subtle)',
                                }}
                              >
                                Nodes / Version
                              </span>
                              <Title headingLevel="h4" size="4xl" style={{ ...mono, marginTop: 'var(--pf-t--global--spacer--sm)' }}>
                                {selectedCluster.nodes} / {selectedCluster.version}
                              </Title>
                              <Content
                                component="p"
                                style={{
                                  ...mono,
                                  marginTop: 'var(--pf-t--global--spacer--xs)',
                                  marginBottom: 0,
                                  color: 'var(--pf-t--global--text--color--subtle)',
                                }}
                              >
                                {selectedCluster.provider} · {selectedCluster.region}
                              </Content>
                            </CardBody>
                          </Card>
                        </GridItem>
                      </Grid>
                    </CardBody>
                  </CardExpandableContent>
                </Card>
              </StackItem>

              <StackItem>
                <Card isCompact isExpanded={cAlertsOpen} id={`${WIDGET_ID}-c-alerts`}>
                  <CardHeader
                    onExpand={() => setCAlertsOpen((o) => !o)}
                    toggleButtonProps={{
                      id: `${WIDGET_ID}-c-alerts-toggle`,
                      'aria-label': 'Toggle Active alerts section',
                    }}
                  >
                    <Flex alignItems={{ default: 'alignItemsCenter' }} flexWrap={{ default: 'wrap' }}>
                      <FlexItem style={{ marginRight: 'var(--pf-t--global--spacer--sm)' }}>
                        <Title headingLevel="h3" size="lg">
                          Active alerts
                        </Title>
                      </FlexItem>
                      <Label color="grey" variant="outline" isCompact>
                        {clusterAlerts.length} on {selectedCluster.name}
                      </Label>
                    </Flex>
                  </CardHeader>
                  <CardExpandableContent>
                    <CardBody>
                      {clusterAlerts.length === 0 ? (
                        <EmptyState variant={EmptyStateVariant.lg}>
                          <EmptyStateBody>
                            <Title headingLevel="h4" size="lg">
                              No active alerts
                            </Title>
                            <Content component="p" style={{ marginTop: 'var(--pf-t--global--spacer--sm)', marginBottom: 0 }}>
                              Agent is idle on {selectedCluster.name}.
                            </Content>
                          </EmptyStateBody>
                        </EmptyState>
                      ) : (
                        <Stack hasGutter>
                          {clusterAlerts.map((a) => (
                            <ObserveAlertItem
                              key={a.id}
                              alert={a}
                              isExpanded={expandedAlerts[a.id] ?? false}
                              onToggle={(open) => toggleAlert(a.id, open)}
                            />
                          ))}
                        </Stack>
                      )}
                    </CardBody>
                  </CardExpandableContent>
                </Card>
              </StackItem>
            </Stack>
          )}
        </CardBody>
      </CardExpandableContent>
    </Card>
    </>
  );
};

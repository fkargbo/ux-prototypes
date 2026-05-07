/**
 * v2.0 iteration surface — edit this file for new work; v1.0 uses `AutonomousAiObserveWidget.tsx`.
 * Shared imports (`ObserveAlertItem`, `data.ts`, CSS) still affect both until forked.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Label,
  Stack,
  StackItem,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import type { AgentPulseStatus, ClusterHealth, ClusterRecord, ViewMode } from './data';
import {
  ALERTS,
  AWAY_DIGEST_ITEMS,
  buildClusterAwayDigestItems,
  buildClusterSeverityBreakdown,
  CLUSTERS,
  DEFAULT_CORE_PLATFORMS_CLUSTER_ID,
  fleetWideCriticalAddsForCluster,
  getAlertsForCluster,
  getClusterById,
} from './data';
import { AlertKpiTooltip } from './AlertKpiTooltip';
import { ObserveAlertItem } from './ObserveAlertItem';
import './autonomous-ai-observe.css';
import { SimulationProvider } from '../../simulation/SimulationProvider';
import { syncObserveSimulationState } from '../../simulation/simulationStore';
import { agenticGlobalAiApi } from '../../persesAgenticBridge';
import { useActivePerspective } from '@app/shared/contexts/ActivePerspectiveContext';
import { TopFiringAlertsCard } from '../../pages/ai-hub-v2/TopFiringAlertsCard';
import {
  clearFocusedClusterSession,
  readFocusedClusterIdFromSession,
  writeFocusedClusterIdToSession,
} from './focusClusterSession';

const WIDGET_ID = 'ols-autonomous-ai-observe-widget-v2';

function fleetAwayDismissKey(text: string): string {
  return `fleet:${text}`;
}

function clusterAwayDismissKey(clusterId: string, text: string): string {
  return `cluster:${clusterId}:${text}`;
}

/** Chip label for cluster-scoped digest rows (non-dismissed count). */
function awayDigestClusterEventCountLabel(visibleCount: number): string {
  if (visibleCount <= 0) {
    return '0 new events';
  }
  if (visibleCount === 1) {
    return '1 new event';
  }
  return `${visibleCount} new events`;
}

/** Multi-cluster Alerting deep-link with optional `cluster`, `severity`, `scope=ai-hub` (see `MultiClusterAlertsPage`). */
function alertingHref(options: {
  tab: 'alerts' | 'fleet-overview';
  severity?: 'critical' | 'warning';
  clusterId?: string;
  /** Fleet KPI drill: limit Alerting to AI Hub mock clusters only (excludes generated filler clusters). */
  aiHubFleetScope?: boolean;
}): string {
  const params = new URLSearchParams();
  params.set('tab', options.tab);
  if (options.severity) {
    params.set('severity', options.severity);
  }
  if (options.clusterId) {
    params.set('cluster', options.clusterId);
  }
  if (options.aiHubFleetScope) {
    params.set('scope', 'ai-hub');
  }
  return `/core/observe/alerting?${params.toString()}`;
}

/** Firing alert rows attributed to a cluster (`ALERTS` plus fleet-wide ingress synthetic attribution when applicable). */
function clusterFireCount(clusterId: string): number {
  return ALERTS.filter((a) => a.clusterId === clusterId).length + fleetWideCriticalAddsForCluster(clusterId);
}

type ObserveMetricStatCardProps = {
  /** Row label in `CardHeader` (same pattern as Fleet summary KPI tiles). */
  cardTitle: string;
  /** Status / severity icon shown before the linked statistic in `CardBody`. */
  titleIcon?: React.ReactNode;
  statistic: React.ReactNode;
  statisticAriaLabel: string;
  onStatisticClick: () => void;
  caption: React.ReactNode;
  /** When false, the KPI is display-only. */
  statisticInteractive?: boolean;
  /** Hover breakdown (PatternFly `Tooltip`); omit when not applicable. */
  statisticTooltip?: React.ReactNode;
};

/**
 * Nested compact metric card: `CardTitle` in header; body row is icon + KPI value (link drill or plain text).
 * Used for Fleet summary and Cluster health tiles.
 */
const ObserveMetricStatCard: React.FC<ObserveMetricStatCardProps> = ({
  cardTitle,
  titleIcon,
  statistic,
  statisticAriaLabel,
  onStatisticClick,
  caption,
  statisticInteractive = true,
  statisticTooltip,
}) => {
  const statisticTrigger =
    statisticInteractive ? (
      <Button
        variant="link"
        isInline
        className="ols-aio-card-stat-number--drill"
        onClick={onStatisticClick}
        aria-label={statisticAriaLabel}
      >
        {statistic}
      </Button>
    ) : (
      <span className="ols-aio-card-stat-number--readonly" aria-label={statisticAriaLabel}>
        {statistic}
      </span>
    );

  const statisticNode =
    statisticTooltip !== undefined && statisticTooltip !== null ? (
      <Tooltip
        content={statisticTooltip}
        position="top"
        isContentLeftAligned
        maxWidth="min(600px, 92vw)"
      >
        {statisticTrigger}
      </Tooltip>
    ) : (
      statisticTrigger
    );

  return (
  <Card isCompact>
    <CardHeader>
      <CardTitle component="h4">{cardTitle}</CardTitle>
    </CardHeader>
    <CardBody>
      <div className="ols-aio-stat-figure">
        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} flexWrap={{ default: 'nowrap' }}>
          {titleIcon ? (
            <span className="ols-aio-metric-kpi-stat-icon" aria-hidden="true">
              {titleIcon}
            </span>
          ) : null}
          {statisticNode}
        </Flex>
      </div>
      <Content
        component="p"
        className="ols-aio-text-subtle-sm"
        style={{
          marginTop: 'var(--pf-t--global--spacer--xs)',
          marginBottom: 0,
        }}
      >
        {caption}
      </Content>
    </CardBody>
  </Card>
  );
};

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

/** Health label text shown on the tile (matches `ClusterHealth` vocabulary). */
function clusterHealthLabelText(health: ClusterHealth): string {
  if (health === 'degraded') {
    return 'Degraded';
  }
  return capitalizeLabelWord(health);
}

/** “While you were away” header chip — fleet scope, not tied to dismissed digest rows. */
function awayDigestNewEventsLabel(clusterCount: number): string {
  if (clusterCount <= 1) {
    return 'New events across 1 cluster';
  }
  return `New events across ${clusterCount} clusters`;
}

export const AutonomousAiObserveWidgetV2: React.FC = () => {
  const navigate = useNavigate();
  const { activePerspective } = useActivePerspective();
  const isMultiCluster = CLUSTERS.length > 1;
  /** In Fleet management only: drill into one cluster without leaving the perspective (vs Core platforms). */
  const [fleetClusterDrillDown, setFleetClusterDrillDown] = useState(false);
  const prevPerspectiveRef = React.useRef(activePerspective);

  const showFleetOverview = useMemo(
    () => isMultiCluster && activePerspective === 'Fleet management' && !fleetClusterDrillDown,
    [isMultiCluster, activePerspective, fleetClusterDrillDown]
  );

  const viewMode: ViewMode = useMemo(() => (showFleetOverview ? 'fleet' : 'cluster'), [showFleetOverview]);

  /** Restores session handoff; Core platforms applies `DEFAULT_CORE_PLATFORMS_CLUSTER_ID` when still empty. */
  const [selectedClusterId, setSelectedClusterId] = useState(
    () => readFocusedClusterIdFromSession() ?? DEFAULT_CORE_PLATFORMS_CLUSTER_ID
  );

  React.useEffect(() => {
    const prev = prevPerspectiveRef.current;
    prevPerspectiveRef.current = activePerspective;
    if (activePerspective === 'Fleet management' && prev === 'Core platforms') {
      setFleetClusterDrillDown(false);
    }
  }, [activePerspective]);

  React.useEffect(() => {
    if (activePerspective !== 'Core platforms') {
      return;
    }
    if (selectedClusterId) {
      return;
    }
    setSelectedClusterId(DEFAULT_CORE_PLATFORMS_CLUSTER_ID);
  }, [activePerspective, selectedClusterId]);
  const [awayOpen, setAwayOpen] = useState(true);
  const [fleetSummaryOpen, setFleetSummaryOpen] = useState(true);
  const [clustersOpen, setClustersOpen] = useState(true);
  const [cAwayOpen, setCAwayOpen] = useState(true);
  const [cHealthOpen, setCHealthOpen] = useState(true);
  const [cAlertsOpen, setCAlertsOpen] = useState(true);
  /** Fleet digest rows use `fleet:${text}`; cluster rows use `cluster:${clusterId}:${text}`. */
  const [dismissedAwayKeys, setDismissedAwayKeys] = useState<Set<string>>(() => new Set());

  const visibleFleetAwayDigestItems = useMemo(
    () => AWAY_DIGEST_ITEMS.filter((item) => !dismissedAwayKeys.has(fleetAwayDismissKey(item.text))),
    [dismissedAwayKeys]
  );

  const visibleClusterAwayDigestItems = useMemo(() => {
    return buildClusterAwayDigestItems(selectedClusterId).filter(
      (item) => !dismissedAwayKeys.has(clusterAwayDismissKey(selectedClusterId, item.text))
    );
  }, [dismissedAwayKeys, selectedClusterId]);

  const fleetWhileYouWereAwayChipLabel = useMemo(() => awayDigestNewEventsLabel(CLUSTERS.length), []);

  const clusterWhileYouWereAwayChipLabel = useMemo(
    () => awayDigestClusterEventCountLabel(visibleClusterAwayDigestItems.length),
    [visibleClusterAwayDigestItems.length]
  );

  const dismissFleetAwayDigest = useCallback((text: string) => {
    setDismissedAwayKeys((prev) => new Set(prev).add(fleetAwayDismissKey(text)));
  }, []);

  const dismissClusterAwayDigest = useCallback(
    (clusterId: string, text: string) => {
      setDismissedAwayKeys((prev) => new Set(prev).add(clusterAwayDismissKey(clusterId, text)));
    },
    []
  );

  const dismissAllFleetAwayDigests = useCallback(() => {
    setDismissedAwayKeys((prev) => {
      const next = new Set(prev);
      AWAY_DIGEST_ITEMS.forEach((i) => next.add(fleetAwayDismissKey(i.text)));
      return next;
    });
  }, []);

  const dismissAllClusterAwayDigests = useCallback((clusterId: string) => {
    const rows = buildClusterAwayDigestItems(clusterId);
    setDismissedAwayKeys((prev) => {
      const next = new Set(prev);
      rows.forEach((r) => next.add(clusterAwayDismissKey(clusterId, r.text)));
      return next;
    });
  }, []);

  const fleetPulse = useMemo(() => fleetAgentStatus(CLUSTERS), []);

  const selectedCluster = useMemo(
    () => (selectedClusterId ? getClusterById(selectedClusterId) : undefined),
    [selectedClusterId]
  );

  useEffect(() => {
    if (selectedClusterId && CLUSTERS.some((c) => c.id === selectedClusterId)) {
      writeFocusedClusterIdToSession(selectedClusterId);
    } else {
      clearFocusedClusterSession();
    }
  }, [selectedClusterId]);

  useEffect(() => {
    if (fleetClusterDrillDown) {
      setCAwayOpen(false);
    }
  }, [fleetClusterDrillDown]);

  const clusterAlerts = useMemo(() => getAlertsForCluster(selectedClusterId), [selectedClusterId]);

  const simulationAlerts = useMemo(
    () => (showFleetOverview ? ALERTS : clusterAlerts),
    [showFleetOverview, clusterAlerts]
  );

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

  useEffect(() => {
    syncObserveSimulationState({
      viewMode,
      selectedCluster: selectedCluster ?? null,
      clusterAlerts: simulationAlerts,
      expandedAlerts,
      observeWidgetExpanded: true,
      isMultiCluster,
      fleetAgentPulse: fleetPulse,
    });
  }, [viewMode, selectedCluster, simulationAlerts, expandedAlerts, isMultiCluster, fleetPulse]);

  const discussLightspeed = useCallback(
    (payload: { alertId: string; cardId: string; diagnosisName: string }) => {
      agenticGlobalAiApi.openDiscussWithLightspeed?.(payload);
    },
    []
  );

  const criticalOnCluster = clusterAlerts.filter((a) => a.severity === 'critical').length;
  const warningOnCluster = clusterAlerts.filter((a) => a.severity === 'warning').length;

  const clusterCriticalBreakdown = useMemo(
    () => (selectedClusterId ? buildClusterSeverityBreakdown(selectedClusterId, 'critical') : []),
    [selectedClusterId]
  );
  const clusterWarningBreakdown = useMemo(
    () => (selectedClusterId ? buildClusterSeverityBreakdown(selectedClusterId, 'warning') : []),
    [selectedClusterId]
  );

  const drillIntoClusterFromFleetOverview = useCallback((clusterId: string) => {
    setSelectedClusterId(clusterId);
    setFleetClusterDrillDown(true);
  }, []);

  return (
    <SimulationProvider>
    <>
      {/* Fleet management drill-down: return to fleet overview (cluster switcher removed for now). */}
      {isMultiCluster && activePerspective === 'Fleet management' && fleetClusterDrillDown ? (
        <Flex
          className="ols-aio-context-selectors"
          alignItems={{ default: 'alignItemsCenter' }}
          flexWrap={{ default: 'wrap' }}
          gap={{ default: 'gapMd' }}
          style={{
            width: '100%',
            marginBottom: 'var(--pf-t--global--spacer--md)',
          }}
        >
          <FlexItem>
            <Button
              variant="link"
              icon={<ArrowLeftIcon />}
              onClick={() => setFleetClusterDrillDown(false)}
              aria-label="Return to full fleet Autonomous analysis view"
            >
              Back to fleet overview
            </Button>
          </FlexItem>
        </Flex>
      ) : null}

      <div id={WIDGET_ID} className="ols-autonomous-ai-observe-widget">
        <div className="ols-aio-widget-main">
          {showFleetOverview ? (
            <Stack hasGutter className="ols-aio-stack-gutter-24">
              <StackItem>
                <Grid hasGutter className="ols-aio-fleet-pair-grid ols-aio-gutter-24">
                  <GridItem span={12} lg={6} className="ols-aio-fleet-pair-item">
                <Card
                  className="ols-aio-subcard ols-aio-fleet-pair-card"
                  isCompact
                  isExpanded={awayOpen}
                  id={`${WIDGET_ID}-away`}
                >
                  <CardHeader
                    onExpand={() => setAwayOpen((o) => !o)}
                    toggleButtonProps={{
                      id: `${WIDGET_ID}-away-toggle`,
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
                                While you were away
                              </CardTitle>
                              <Label color="blue" isCompact>
                                {fleetWhileYouWereAwayChipLabel}
                              </Label>
                            </Flex>
                          </FlexItem>
                        </Flex>
                      </StackItem>
                      <StackItem style={{ marginTop: 'var(--pf-t--global--spacer--xs)' }}>
                        <Flex
                          justifyContent={{ default: 'justifyContentSpaceBetween' }}
                          alignItems={{ default: 'alignItemsCenter' }}
                          flexWrap={{ default: 'wrap' }}
                        >
                          <span className="ols-aio-text-subtle-sm">Since your last visit · 38m ago</span>
                          <Button
                            variant="link"
                            isInline
                            isDisabled={visibleFleetAwayDigestItems.length === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissAllFleetAwayDigests();
                            }}
                            aria-label="Dismiss all digest alerts"
                          >
                            Dismiss all
                          </Button>
                        </Flex>
                      </StackItem>
                    </Stack>
                  </CardHeader>
                  <CardExpandableContent>
                    <CardBody>
                      {visibleFleetAwayDigestItems.length === 0 ? (
                        <EmptyState variant={EmptyStateVariant.lg} style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
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
                        <Stack style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
                          {visibleFleetAwayDigestItems.map((item) => (
                            <StackItem key={item.text}>
                              <Alert
                                isInline
                                isExpandable
                                variant={item.tone}
                                className="ols-aio-away-alert"
                                title={item.text}
                                toggleAriaLabel={`Toggle details: ${item.text}`}
                                actionClose={
                                  <AlertActionCloseButton
                                    onClose={() => dismissFleetAwayDigest(item.text)}
                                    aria-label={`Dismiss: ${item.text}`}
                                  />
                                }
                              >
                                <Content
                                  component="p"
                                  className="ols-aio-text-subtle-sm"
                                  style={{
                                    marginTop: 'var(--pf-t--global--spacer--xs)',
                                    marginBottom: 0,
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
                  </GridItem>
                  <GridItem span={12} lg={6} className="ols-aio-fleet-pair-item">
                    <TopFiringAlertsCard />
                  </GridItem>
                </Grid>
              </StackItem>

              <StackItem>
                <Grid hasGutter className="ols-aio-gutter-24 ols-aio-fleet-summary-clusters-grid">
                  <GridItem span={12} lg={6} className="ols-aio-fleet-summary-clusters-item">
                    <Card className="ols-aio-subcard" isCompact isExpanded={fleetSummaryOpen} id={`${WIDGET_ID}-fleet-summary`}>
                      <CardHeader
                        onExpand={() => setFleetSummaryOpen((o) => !o)}
                        toggleButtonProps={{
                          id: `${WIDGET_ID}-fleet-summary-toggle`,
                          'aria-label': 'Toggle Fleet Summary section',
                        }}
                        actions={{
                          actions: (
                            <Button
                              variant="link"
                              isInline
                              onClick={(event) => {
                                event.stopPropagation();
                                navigate(alertingHref({ tab: 'fleet-overview', aiHubFleetScope: true }));
                              }}
                              aria-label="Open Alerting Fleet overview filtered to currently surfaced Autonomous analysis alerts"
                            >
                              View alerts
                            </Button>
                          ),
                        }}
                      >
                        <Flex alignItems={{ default: 'alignItemsCenter' }}>
                          <CardTitle component="h3" className="ols-aio-fleet-subcard-title">
                            Fleet Summary
                          </CardTitle>
                        </Flex>
                      </CardHeader>
                      <CardExpandableContent>
                        <CardBody>
                          <Table
                            aria-label="Fleet summary by cluster"
                            variant="compact"
                            borders
                            gridBreakPoint=""
                          >
                            <Thead>
                              <Tr>
                                <Th modifier="wrap">Cluster</Th>
                                <Th modifier="wrap">Provider</Th>
                                <Th modifier="nowrap">Total nodes</Th>
                                <Th modifier="wrap">Cluster status</Th>
                                <Th modifier="nowrap">Version</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {CLUSTERS.map((c) => {
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
                                  <Tr
                                    key={c.id}
                                    isClickable
                                    isRowSelected={selectedClusterId === c.id}
                                    onRowClick={() => drillIntoClusterFromFleetOverview(c.id)}
                                  >
                                    <Td>{c.name}</Td>
                                    <Td>{c.provider}</Td>
                                    <Td>{c.nodes}</Td>
                                    <Td>
                                      <Label status={healthStatus} icon={healthIcon} isCompact>
                                        {clusterHealthLabelText(c.health)}
                                      </Label>
                                    </Td>
                                    <Td modifier="nowrap">v{c.version}</Td>
                                  </Tr>
                                );
                              })}
                            </Tbody>
                          </Table>
                        </CardBody>
                      </CardExpandableContent>
                    </Card>
                  </GridItem>
                  <GridItem span={12} lg={6} className="ols-aio-fleet-summary-clusters-item">
                    <Card className="ols-aio-subcard" isCompact isExpanded={clustersOpen} id={`${WIDGET_ID}-clusters`}>
                      <CardHeader
                        onExpand={() => setClustersOpen((o) => !o)}
                        toggleButtonProps={{
                          id: `${WIDGET_ID}-clusters-toggle`,
                          'aria-label': 'Toggle Clusters section',
                        }}
                      >
                        <Stack>
                          <StackItem>
                            <CardTitle component="h3" className="ols-aio-fleet-subcard-title" style={{ marginBottom: 0 }}>
                              Clusters
                            </CardTitle>
                          </StackItem>
                          <StackItem>
                            <Content
                              component="p"
                              style={{
                                margin: 0,
                                fontSize: '14px',
                                color: 'var(--pf-t--global--text--color--subtle)',
                              }}
                            >
                              Click any cluster row to drill in.
                            </Content>
                          </StackItem>
                        </Stack>
                      </CardHeader>
                      <CardExpandableContent>
                        <CardBody>
                          <Table aria-label="Clusters" variant="compact" borders gridBreakPoint="">
                            <Thead>
                              <Tr>
                                <Th modifier="wrap">Cluster name</Th>
                                <Th modifier="nowrap">Alert amount</Th>
                                <Th modifier="wrap">Region</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {CLUSTERS.map((c) => (
                                <Tr
                                  key={c.id}
                                  isClickable
                                  isRowSelected={selectedClusterId === c.id}
                                  onRowClick={() => drillIntoClusterFromFleetOverview(c.id)}
                                >
                                  <Td>{c.name}</Td>
                                  <Td>{clusterFireCount(c.id)}</Td>
                                  <Td>{c.region}</Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </CardBody>
                      </CardExpandableContent>
                    </Card>
                  </GridItem>
                </Grid>
              </StackItem>
            </Stack>
          ) : selectedCluster ? (
            <Stack hasGutter>
              <StackItem>
                <Card className="ols-aio-subcard" isCompact isExpanded={cAwayOpen} id={`${WIDGET_ID}-c-away`}>
                  <CardHeader
                    onExpand={() => setCAwayOpen((o) => !o)}
                    toggleButtonProps={{
                      id: `${WIDGET_ID}-c-away-toggle`,
                      'aria-label': 'Toggle While you were away section',
                    }}
                  >
                    <Stack>
                      <StackItem>
                        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }}>
                          <CardTitle component="h3">
                            {isMultiCluster ? `While you were away — ${selectedCluster.name}` : 'While you were away'}
                          </CardTitle>
                          <Label color="blue" isCompact>
                            {clusterWhileYouWereAwayChipLabel}
                          </Label>
                        </Flex>
                      </StackItem>
                      <StackItem style={{ marginTop: 'var(--pf-t--global--spacer--xs)' }}>
                        <Flex
                          justifyContent={{ default: 'justifyContentSpaceBetween' }}
                          alignItems={{ default: 'alignItemsCenter' }}
                          flexWrap={{ default: 'wrap' }}
                        >
                          <span className="ols-aio-text-subtle-sm">Since your last visit · 38m ago</span>
                          <Button
                            variant="link"
                            isInline
                            isDisabled={visibleClusterAwayDigestItems.length === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissAllClusterAwayDigests(selectedClusterId);
                            }}
                            aria-label="Dismiss all digest alerts for this cluster"
                          >
                            Dismiss all
                          </Button>
                        </Flex>
                      </StackItem>
                    </Stack>
                  </CardHeader>
                  <CardExpandableContent>
                    <CardBody>
                      {visibleClusterAwayDigestItems.length === 0 ? (
                        <EmptyState variant={EmptyStateVariant.lg} style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
                          <EmptyStateBody>
                            <Title headingLevel="h4" size="lg">
                              You&apos;re all caught up
                            </Title>
                            <Content
                              component="p"
                              style={{ marginTop: 'var(--pf-t--global--spacer--sm)', marginBottom: 0 }}
                            >
                              There are currently no active digest items for {selectedCluster.name}.
                            </Content>
                          </EmptyStateBody>
                        </EmptyState>
                      ) : (
                        <Stack style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
                          {visibleClusterAwayDigestItems.map((item) => (
                            <StackItem key={clusterAwayDismissKey(selectedClusterId, item.text)}>
                              <Alert
                                isInline
                                isExpandable
                                variant={item.tone}
                                className="ols-aio-away-alert"
                                title={item.text}
                                toggleAriaLabel={`Toggle details: ${item.text}`}
                                actionClose={
                                  <AlertActionCloseButton
                                    onClose={() => dismissClusterAwayDigest(selectedClusterId, item.text)}
                                    aria-label={`Dismiss: ${item.text}`}
                                  />
                                }
                              >
                                <Content
                                  component="p"
                                  className="ols-aio-text-subtle-sm"
                                  style={{
                                    marginTop: 'var(--pf-t--global--spacer--xs)',
                                    marginBottom: 0,
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
                <Card className="ols-aio-subcard" isCompact isExpanded={cHealthOpen} id={`${WIDGET_ID}-c-health`}>
                  <CardHeader
                    onExpand={() => setCHealthOpen((o) => !o)}
                    toggleButtonProps={{
                      id: `${WIDGET_ID}-c-health-toggle`,
                      'aria-label': 'Toggle cluster health section',
                    }}
                  >
                    <Flex alignItems={{ default: 'alignItemsCenter' }} flexWrap={{ default: 'wrap' }}>
                      <FlexItem style={{ marginRight: 'var(--pf-t--global--spacer--sm)' }}>
                        <Title headingLevel="h3" size="lg">
                          Cluster health
                        </Title>
                      </FlexItem>
                      <Label color="grey" variant="outline" isCompact>
                        {selectedCluster.name}
                      </Label>
                    </Flex>
                  </CardHeader>
                  <CardExpandableContent>
                    <CardBody>
                      <Grid hasGutter>
                        <GridItem span={12} md={4}>
                          <ObserveMetricStatCard
                            cardTitle="Critical alerts"
                            titleIcon={
                              <ExclamationCircleIcon
                                style={{ color: 'var(--pf-t--global--color--status--danger--default)' }}
                              />
                            }
                            statistic={criticalOnCluster}
                            statisticAriaLabel={`Open Alerting Alerts tab, critical filter, for ${selectedCluster.name}`}
                            onStatisticClick={() =>
                              navigate(
                                alertingHref({
                                  tab: 'alerts',
                                  severity: 'critical',
                                  clusterId: selectedCluster.id,
                                  aiHubFleetScope: true,
                                })
                              )
                            }
                            statisticInteractive
                            statisticTooltip={
                              <AlertKpiTooltip bucketLabel="Critical alerts" rows={clusterCriticalBreakdown} />
                            }
                            caption={`on ${selectedCluster.name}`}
                          />
                        </GridItem>
                        <GridItem span={12} md={4}>
                          <ObserveMetricStatCard
                            cardTitle="Warning alerts"
                            titleIcon={
                              <ExclamationTriangleIcon
                                style={{ color: 'var(--pf-t--global--color--status--warning--default)' }}
                              />
                            }
                            statistic={warningOnCluster}
                            statisticAriaLabel={`Open Alerting Alerts tab, warning filter, for ${selectedCluster.name}`}
                            onStatisticClick={() =>
                              navigate(
                                alertingHref({
                                  tab: 'alerts',
                                  severity: 'warning',
                                  clusterId: selectedCluster.id,
                                  aiHubFleetScope: true,
                                })
                              )
                            }
                            statisticInteractive
                            statisticTooltip={
                              <AlertKpiTooltip bucketLabel="Warning alerts" rows={clusterWarningBreakdown} />
                            }
                            caption={`on ${selectedCluster.name}`}
                          />
                        </GridItem>
                        <GridItem span={12} md={4}>
                          <ObserveMetricStatCard
                            cardTitle="Nodes / Version"
                            statistic={
                              <>
                                {selectedCluster.nodes} / {selectedCluster.version}
                              </>
                            }
                            statisticAriaLabel={`Nodes and version for ${selectedCluster.name}`}
                            onStatisticClick={() => {}}
                            statisticInteractive={false}
                            caption={`${selectedCluster.provider} · ${selectedCluster.region}`}
                          />
                        </GridItem>
                      </Grid>
                    </CardBody>
                  </CardExpandableContent>
                </Card>
              </StackItem>

              <StackItem>
                <Card className="ols-aio-subcard" isCompact isExpanded={cAlertsOpen} id={`${WIDGET_ID}-c-alerts`}>
                  <CardHeader
                    onExpand={() => setCAlertsOpen((o) => !o)}
                    toggleButtonProps={{
                      id: `${WIDGET_ID}-c-alerts-toggle`,
                      'aria-label': 'Toggle Top alerts and remediations section',
                    }}
                  >
                    <Flex alignItems={{ default: 'alignItemsCenter' }} flexWrap={{ default: 'wrap' }}>
                      <FlexItem style={{ marginRight: 'var(--pf-t--global--spacer--sm)' }}>
                        <Title headingLevel="h3" size="lg">
                          Top alerts and remediations
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
                              onDiscussWithLightspeed={discussLightspeed}
                            />
                          ))}
                        </Stack>
                      )}
                    </CardBody>
                  </CardExpandableContent>
                </Card>
              </StackItem>
            </Stack>
          ) : (
            <EmptyState variant={EmptyStateVariant.lg}>
              <EmptyStateBody>
                <Title headingLevel="h4" size="lg">
                  Cluster unavailable
                </Title>
                <Content
                  component="p"
                  style={{ marginTop: 'var(--pf-t--global--spacer--sm)', marginBottom: 0, maxWidth: 520 }}
                >
                  No cluster context is loaded for this view.
                </Content>
              </EmptyStateBody>
            </EmptyState>
          )}
        </div>
      </div>
    </>
    </SimulationProvider>
  );
};

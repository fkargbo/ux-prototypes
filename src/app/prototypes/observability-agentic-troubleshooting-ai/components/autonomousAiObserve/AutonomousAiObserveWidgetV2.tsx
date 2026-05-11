/**
 * v2.0 iteration surface — edit this file for new work; v1.0 uses `AutonomousAiObserveWidget.tsx`.
 * Shared imports (`ObserveAlertItem`, `data.ts`, CSS) still affect both until forked.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  EmptyStateVariant,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Label,
  Pagination,
  PaginationVariant,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
} from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import type { AgentPulseStatus, AwayDigestItem, ClusterHealth, ClusterRecord, ViewMode } from './data';
import {
  ALERTS,
  AWAY_DIGEST_ITEMS,
  CLUSTERS,
  DEFAULT_CORE_PLATFORMS_CLUSTER_ID,
  FLEET_WIDE_REGIONAL_INGRESS,
  fleetWideCriticalAddsForCluster,
  getAlertsForCluster,
  getClusterById,
  resolveFleetRemediationDrillTarget,
} from './data';
import { FleetWideObserveIncident } from './FleetWideObserveIncident';
import { ObserveAlertItem } from './ObserveAlertItem';
import { AI_EXPERIENCE_ICON_DATA_URL } from './aiExperienceIconUrl';
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
import {
  REMEDIATION_DRILL_EVENT,
  clearRemediationDrillSession,
  readRemediationDrillSession,
} from './remediationDrillSession';

const WIDGET_ID = 'ols-autonomous-ai-observe-widget-v2';
const TOP_ALERTS_CARD_DOM_ID = `${WIDGET_ID}-c-alerts`;

function scrollDrillToTopAlertsSection(innerTargetId: string) {
  document.getElementById(TOP_ALERTS_CARD_DOM_ID)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        document.getElementById(innerTargetId)?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 120);
    });
  });
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

type AutonomousAiObserveWidgetV2Props = {
  fleetClusterDrillDown?: boolean;
  onFleetDrillDownChange?: (isDrillDown: boolean) => void;
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

export const AutonomousAiObserveWidgetV2: React.FC<AutonomousAiObserveWidgetV2Props> = ({
  fleetClusterDrillDown: fleetClusterDrillDownProp,
  onFleetDrillDownChange,
}) => {
  const navigate = useNavigate();
  const { activePerspective } = useActivePerspective();
  const isMultiCluster = CLUSTERS.length > 1;
  /** In Fleet management only: drill into one cluster without leaving the perspective (vs Core platforms). */
  const [fleetClusterDrillDownInternal, setFleetClusterDrillDownInternal] = useState(false);
  const fleetClusterDrillDown = fleetClusterDrillDownProp ?? fleetClusterDrillDownInternal;
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
      if (fleetClusterDrillDownProp === undefined) {
        setFleetClusterDrillDownInternal(false);
      } else {
        onFleetDrillDownChange?.(false);
      }
    }
  }, [activePerspective, fleetClusterDrillDownProp, onFleetDrillDownChange]);

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
  const [fleetSummarySortBy, setFleetSummarySortBy] = useState<{ index: number; direction: 'asc' | 'desc' }>({
    index: 1,
    direction: 'asc',
  });
  const [fleetSummaryPage, setFleetSummaryPage] = useState(1);
  const [fleetSummaryPerPage, setFleetSummaryPerPage] = useState(10);
  const [cAlertsOpen, setCAlertsOpen] = useState(false);
  const [remediationScope, setRemediationScope] = useState<'fleet' | 'cluster'>('cluster');
  const [fleetIncidentExpanded, setFleetIncidentExpanded] = useState(false);
  /** Drill from Top firing alerts “View remediation”: expand Chain, RCA, and Remediation inside fleet incident card. */
  const [expandFleetDrillAllInnerSections, setExpandFleetDrillAllInnerSections] = useState(false);
  /** Drill target alert row — expands outer card + all inner sections for that `ObserveAlertItem`. */
  const [expandObserveRemediationAlertId, setExpandObserveRemediationAlertId] = useState<string | null>(null);
  const [pendingRemediationRuleTitle, setPendingRemediationRuleTitle] = useState<string | null>(null);
  const skipExpandedAlertsResetRef = useRef(false);
  const fleetAwayDigestItems = useMemo(() => AWAY_DIGEST_ITEMS, []);

  const fleetWhileYouWereAwayChipLabel = useMemo(() => awayDigestNewEventsLabel(CLUSTERS.length), []);

  const fleetRecommendedRemediationCount = useMemo(
    () => fleetAwayDigestItems.filter((item) => item.tone === 'danger' || item.tone === 'warning').length,
    [fleetAwayDigestItems]
  );

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

  const clusterAlerts = useMemo(() => getAlertsForCluster(selectedClusterId), [selectedClusterId]);

  const fleetIncidentClusters = useMemo(
    () => CLUSTERS.filter((c) => FLEET_WIDE_REGIONAL_INGRESS.affectedClusterIds.includes(c.id)),
    []
  );

  const topAlertsRemediationsAlerts = useMemo(
    () => (remediationScope === 'fleet' ? ALERTS : clusterAlerts),
    [remediationScope, clusterAlerts]
  );

  /** When drilling to a fleet alert row, show that row first so “same cluster” siblings stay collapsed below. */
  const alertsForTopAlertsCard = useMemo(() => {
    if (remediationScope !== 'fleet' || !expandObserveRemediationAlertId) {
      return topAlertsRemediationsAlerts;
    }
    const hit = topAlertsRemediationsAlerts.find((a) => a.id === expandObserveRemediationAlertId);
    if (!hit) {
      return topAlertsRemediationsAlerts;
    }
    return [hit, ...topAlertsRemediationsAlerts.filter((a) => a.id !== expandObserveRemediationAlertId)];
  }, [remediationScope, topAlertsRemediationsAlerts, expandObserveRemediationAlertId]);

  const simulationAlerts = useMemo(
    () => (showFleetOverview ? ALERTS : alertsForTopAlertsCard),
    [showFleetOverview, alertsForTopAlertsCard]
  );

  const [expandedAlerts, setExpandedAlerts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (skipExpandedAlertsResetRef.current) {
      skipExpandedAlertsResetRef.current = false;
      return;
    }

    if (pendingRemediationRuleTitle && remediationScope === 'fleet') {
      const title = pendingRemediationRuleTitle;
      const target = resolveFleetRemediationDrillTarget(title);

      if (target?.kind === 'fleet-incident') {
        setFleetIncidentExpanded(true);
        setExpandFleetDrillAllInnerSections(true);
        setExpandObserveRemediationAlertId(null);
        const next: Record<string, boolean> = {};
        topAlertsRemediationsAlerts.forEach((a) => {
          next[a.id] = false;
        });
        setExpandedAlerts(next);
        scrollDrillToTopAlertsSection(target.incidentId);
      } else if (target?.kind === 'alert') {
        setFleetIncidentExpanded(false);
        setExpandFleetDrillAllInnerSections(false);
        const next: Record<string, boolean> = {};
        topAlertsRemediationsAlerts.forEach((a) => {
          next[a.id] = a.id === target.alertId;
        });
        setExpandedAlerts(next);
        setExpandObserveRemediationAlertId(target.alertId);
        scrollDrillToTopAlertsSection(target.alertId);
      }

      /** Avoid stale session + duplicate drill when `fleetClusterDrillDown` toggles; clear even if rule did not resolve. */
      clearRemediationDrillSession();

      setPendingRemediationRuleTitle(null);
      skipExpandedAlertsResetRef.current = true;
      return;
    }

    const next: Record<string, boolean> = {};
    topAlertsRemediationsAlerts.forEach((a) => {
      next[a.id] = false;
    });
    setExpandedAlerts(next);
    setExpandObserveRemediationAlertId(null);
    setExpandFleetDrillAllInnerSections(false);
  }, [topAlertsRemediationsAlerts, remediationScope, pendingRemediationRuleTitle]);

  /**
   * SPA handoff only (mount). Must not re-run when `fleetClusterDrillDown` toggles — otherwise session storage
   * still holds the rule after `dispatchRemediationDrill` and we re-apply stale state (and previously reset
   * `fleetIncidentExpanded`, breaking RegionalIngress drills).
   */
  useEffect(() => {
    const stored = readRemediationDrillSession();
    if (!stored?.alertRuleTitle) {
      return;
    }
    clearRemediationDrillSession();
    setPendingRemediationRuleTitle(stored.alertRuleTitle);
    setRemediationScope('fleet');
    setCAlertsOpen(true);
    if (fleetClusterDrillDownProp === undefined) {
      setFleetClusterDrillDownInternal(true);
    }
    onFleetDrillDownChange?.(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional one-time hydration from sessionStorage
  }, []);

  useEffect(() => {
    const onRemediationDrill = (event: Event) => {
      const detail = (event as CustomEvent<{ alertRuleTitle: string }>).detail;
      if (!detail?.alertRuleTitle) {
        return;
      }
      setPendingRemediationRuleTitle(detail.alertRuleTitle);
      setRemediationScope('fleet');
      setCAlertsOpen(true);
      if (fleetClusterDrillDownProp === undefined) {
        setFleetClusterDrillDownInternal(true);
      }
      onFleetDrillDownChange?.(true);
    };

    window.addEventListener(REMEDIATION_DRILL_EVENT, onRemediationDrill);
    return () => window.removeEventListener(REMEDIATION_DRILL_EVENT, onRemediationDrill);
  }, [fleetClusterDrillDownProp, onFleetDrillDownChange]);

  const toggleAlert = useCallback((id: string, open: boolean) => {
    setExpandedAlerts((prev) => ({ ...prev, [id]: open }));
    if (!open && expandObserveRemediationAlertId === id) {
      setExpandObserveRemediationAlertId(null);
    }
  }, [expandObserveRemediationAlertId]);

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

  const drillIntoClusterFromFleetOverview = useCallback((clusterId: string) => {
    setRemediationScope('cluster');
    setSelectedClusterId(clusterId);
    setCAlertsOpen(true);
    if (fleetClusterDrillDownProp === undefined) {
      setFleetClusterDrillDownInternal(true);
    }
    onFleetDrillDownChange?.(true);
  }, [fleetClusterDrillDownProp, onFleetDrillDownChange]);

  const openFleetWideRemediations = useCallback(() => {
    setRemediationScope('fleet');
    setCAlertsOpen(true);
    setFleetIncidentExpanded(false);
    setExpandFleetDrillAllInnerSections(false);
    setExpandObserveRemediationAlertId(null);
    if (fleetClusterDrillDownProp === undefined) {
      setFleetClusterDrillDownInternal(true);
    }
    onFleetDrillDownChange?.(true);
  }, [fleetClusterDrillDownProp, onFleetDrillDownChange]);

  const fleetSummaryRows = useMemo(
    () =>
      CLUSTERS.map((c) => ({
        cluster: c,
        alertAmount: clusterFireCount(c.id),
        statusText: clusterHealthLabelText(c.health),
        statusRank: c.health === 'critical' ? 0 : c.health === 'degraded' ? 1 : 2,
      })),
    []
  );

  const fleetSummarySortedRows = useMemo(() => {
    const sorted = [...fleetSummaryRows];
    sorted.sort((a, b) => {
      let comparison = 0;
      switch (fleetSummarySortBy.index) {
        case 0:
          comparison = a.cluster.name.localeCompare(b.cluster.name);
          break;
        case 1:
          comparison = a.statusRank - b.statusRank;
          break;
        case 2:
          comparison = a.cluster.provider.localeCompare(b.cluster.provider);
          break;
        case 3:
          comparison = a.alertAmount - b.alertAmount;
          break;
        case 4:
          comparison = a.cluster.region.localeCompare(b.cluster.region);
          break;
        case 5:
          comparison = a.cluster.nodes - b.cluster.nodes;
          break;
        case 6:
          comparison = a.cluster.version.localeCompare(b.cluster.version, undefined, { numeric: true });
          break;
        default:
          comparison = 0;
      }
      return fleetSummarySortBy.direction === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [fleetSummaryRows, fleetSummarySortBy]);

  const fleetSummaryPaginatedRows = useMemo(() => {
    const start = (fleetSummaryPage - 1) * fleetSummaryPerPage;
    return fleetSummarySortedRows.slice(start, start + fleetSummaryPerPage);
  }, [fleetSummaryPage, fleetSummaryPerPage, fleetSummarySortedRows]);

  const onFleetSummarySort = useCallback(
    (_event: React.MouseEvent, columnIndex: number, direction: 'asc' | 'desc') => {
      setFleetSummarySortBy({ index: columnIndex, direction });
      setFleetSummaryPage(1);
    },
    []
  );

  const onFleetSummarySetPage = useCallback(
    (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number) => {
      setFleetSummaryPage(newPage);
    },
    []
  );

  const onFleetSummaryPerPageSelect = useCallback(
    (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPerPage: number, newPage: number) => {
      setFleetSummaryPerPage(newPerPage);
      setFleetSummaryPage(newPage);
    },
    []
  );

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(fleetSummarySortedRows.length / fleetSummaryPerPage));
    if (fleetSummaryPage > maxPage) {
      setFleetSummaryPage(maxPage);
    }
  }, [fleetSummaryPage, fleetSummaryPerPage, fleetSummarySortedRows.length]);

  return (
    <SimulationProvider>
    <>
      <div id={WIDGET_ID} className="ols-autonomous-ai-observe-widget">
        <div className="ols-aio-widget-main">
          {showFleetOverview ? (
            <Stack hasGutter className="ols-aio-stack-gutter-24">
              <StackItem>
                <Grid hasGutter className="ols-aio-fleet-pair-grid ols-aio-gutter-24">
                  <GridItem span={12} lg={6} className="ols-aio-fleet-pair-item">
                    <TopFiringAlertsCard />
                  </GridItem>
                  <GridItem span={12} lg={6} className="ols-aio-fleet-pair-item">
                <Card
                  className="ols-aio-subcard ols-aio-fleet-pair-card ols-autonomous-ai-observe-widget-v2-away"
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
                          justifyContent={{ default: 'justifyContentFlexStart' }}
                          alignItems={{ default: 'alignItemsCenter' }}
                          flexWrap={{ default: 'wrap' }}
                        >
                          <span className="ols-aio-text-subtle-sm">Since your last visit · 38m ago</span>
                        </Flex>
                      </StackItem>
                    </Stack>
                  </CardHeader>
                  <CardExpandableContent>
                    <CardBody className="ols-aio-away-card-body">
                      <div className="ols-aio-away-scroll-region">
                        {fleetAwayDigestItems.length === 0 ? (
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
                            {fleetAwayDigestItems.map((item) => (
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
                      <div className="ols-aio-away-card-footer">
                        <Button
                          variant="primary"
                          onClick={openFleetWideRemediations}
                          aria-label={`View remediations, ${fleetRecommendedRemediationCount} suggested`}
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
                          View remediations
                        </Button>
                      </div>
                    </CardBody>
                  </CardExpandableContent>
                </Card>
                  </GridItem>
                </Grid>
              </StackItem>

              <StackItem>
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
                      <Flex justifyContent={{ default: 'justifyContentFlexEnd' }} style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                        <Pagination
                          itemCount={fleetSummarySortedRows.length}
                          page={fleetSummaryPage}
                          perPage={fleetSummaryPerPage}
                          perPageOptions={[
                            { title: '5', value: 5 },
                            { title: '10', value: 10 },
                            { title: '20', value: 20 },
                          ]}
                          onSetPage={onFleetSummarySetPage}
                          onPerPageSelect={onFleetSummaryPerPageSelect}
                          variant={PaginationVariant.top}
                          isCompact
                        />
                      </Flex>
                      <Table aria-label="Fleet summary by cluster" variant="compact" borders gridBreakPoint="">
                        <Thead>
                          <Tr>
                            <Th sort={{ sortBy: fleetSummarySortBy, onSort: onFleetSummarySort, columnIndex: 0 }} modifier="wrap">
                              Cluster
                            </Th>
                            <Th sort={{ sortBy: fleetSummarySortBy, onSort: onFleetSummarySort, columnIndex: 1 }} modifier="wrap">
                              Cluster status
                            </Th>
                            <Th sort={{ sortBy: fleetSummarySortBy, onSort: onFleetSummarySort, columnIndex: 2 }} modifier="wrap">
                              Provider
                            </Th>
                            <Th sort={{ sortBy: fleetSummarySortBy, onSort: onFleetSummarySort, columnIndex: 3 }} modifier="nowrap">
                              Alert amount
                            </Th>
                            <Th sort={{ sortBy: fleetSummarySortBy, onSort: onFleetSummarySort, columnIndex: 4 }} modifier="wrap">
                              Region
                            </Th>
                            <Th sort={{ sortBy: fleetSummarySortBy, onSort: onFleetSummarySort, columnIndex: 5 }} modifier="nowrap">
                              Total nodes
                            </Th>
                            <Th sort={{ sortBy: fleetSummarySortBy, onSort: onFleetSummarySort, columnIndex: 6 }} modifier="nowrap">
                              Version
                            </Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {fleetSummaryPaginatedRows.map((row) => {
                            const c = row.cluster;
                            const healthIcon =
                              c.health === 'healthy' ? (
                                <CheckCircleIcon />
                              ) : c.health === 'degraded' ? (
                                <ExclamationTriangleIcon />
                              ) : (
                                <ExclamationCircleIcon />
                              );
                            const healthColor =
                              c.health === 'healthy'
                                ? 'var(--pf-t--global--color--status--success--default)'
                                : c.health === 'degraded'
                                  ? 'var(--pf-t--global--color--status--warning--default)'
                                  : 'var(--pf-t--global--color--status--danger--default)';
                            return (
                              <Tr
                                key={c.id}
                                isClickable
                                isRowSelected={selectedClusterId === c.id}
                                onRowClick={() => drillIntoClusterFromFleetOverview(c.id)}
                              >
                                <Td>
                                  <Button
                                    variant="link"
                                    isInline
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      drillIntoClusterFromFleetOverview(c.id);
                                    }}
                                    aria-label={`Open ${c.name} details`}
                                  >
                                    {c.name}
                                  </Button>
                                </Td>
                                <Td>
                                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                    <span className="ols-aio-metric-kpi-stat-icon" aria-hidden="true" style={{ color: healthColor }}>
                                      {healthIcon}
                                    </span>
                                    <span>{clusterHealthLabelText(c.health)}</span>
                                  </Flex>
                                </Td>
                                <Td>{c.provider}</Td>
                                <Td>{row.alertAmount}</Td>
                                <Td>{c.region}</Td>
                                <Td>{c.nodes}</Td>
                                <Td modifier="nowrap">v{c.version}</Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                      <Flex justifyContent={{ default: 'justifyContentFlexEnd' }} style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}>
                        <Pagination
                          itemCount={fleetSummarySortedRows.length}
                          page={fleetSummaryPage}
                          perPage={fleetSummaryPerPage}
                          perPageOptions={[
                            { title: '5', value: 5 },
                            { title: '10', value: 10 },
                            { title: '20', value: 20 },
                          ]}
                          onSetPage={onFleetSummarySetPage}
                          onPerPageSelect={onFleetSummaryPerPageSelect}
                          variant={PaginationVariant.bottom}
                          isCompact
                        />
                      </Flex>
                    </CardBody>
                  </CardExpandableContent>
                </Card>
              </StackItem>
            </Stack>
          ) : selectedCluster ? (
            <Stack hasGutter>

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
                        {remediationScope === 'fleet'
                          ? `${topAlertsRemediationsAlerts.length + 1} fleet-wide`
                          : `${topAlertsRemediationsAlerts.length} on ${selectedCluster.name}`}
                      </Label>
                    </Flex>
                  </CardHeader>
                  <CardExpandableContent>
                    <CardBody>
                      {remediationScope === 'fleet' || topAlertsRemediationsAlerts.length > 0 ? (
                        <Stack hasGutter>
                          {remediationScope === 'fleet' ? (
                            <FleetWideObserveIncident
                              incident={FLEET_WIDE_REGIONAL_INGRESS}
                              affectedClusters={fleetIncidentClusters}
                              isExpanded={fleetIncidentExpanded}
                              onToggle={(open) => {
                                setFleetIncidentExpanded(open);
                                if (!open) {
                                  setExpandFleetDrillAllInnerSections(false);
                                }
                              }}
                              expandAllInnerSectionsInitially={expandFleetDrillAllInnerSections}
                              onDiscussWithLightspeed={discussLightspeed}
                            />
                          ) : null}
                          {alertsForTopAlertsCard.map((a) => (
                            <ObserveAlertItem
                              key={a.id}
                              alert={a}
                              isExpanded={expandedAlerts[a.id] ?? false}
                              onToggle={(open) => toggleAlert(a.id, open)}
                              onDiscussWithLightspeed={discussLightspeed}
                              expandAllInnerSectionsInitially={expandObserveRemediationAlertId === a.id}
                            />
                          ))}
                        </Stack>
                      ) : (
                        <EmptyState variant={EmptyStateVariant.lg}>
                          <EmptyStateBody>
                            <Title headingLevel="h4" size="lg">
                              No active alerts
                            </Title>
                            <Content component="p" style={{ marginTop: 'var(--pf-t--global--spacer--sm)', marginBottom: 0 }}>
                              {`Agent is idle on ${selectedCluster.name}.`}
                            </Content>
                          </EmptyStateBody>
                        </EmptyState>
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

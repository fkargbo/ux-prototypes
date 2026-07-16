/**
 * v3.0 iteration surface — edit this file for new work.
 * v1.0 uses `AutonomousAiObserveWidget`; v2.0 uses `AutonomousAiObserveWidgetV2`.
 * Shared observe primitives (`ObserveAlertItem`, `data.ts`, base CSS) are still shared until forked.
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
} from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import type { AgentPulseStatus, ClusterHealth, ClusterRecord, ViewMode } from './data';
import {
  ALERTS,
  AWAY_DIGEST_ITEMS,
  CLUSTERS,
  DEFAULT_CORE_PLATFORMS_CLUSTER_ID,
  FLEET_WIDE_REGIONAL_INGRESS,
  buildClusterAwayDigestItems,
  fleetWideCriticalAddsForCluster,
  getAlertsForCluster,
  getClusterById,
  resolveClusterRemediationDrillTarget,
  resolveFleetRemediationDrillTarget,
} from './data';
import { FleetWideObserveIncident } from './FleetWideObserveIncident';
import { ObserveAlertItem } from './ObserveAlertItem';
import './autonomous-ai-observe.css';
import './autonomous-ai-observe-v3.css';
import { SimulationProvider } from '../../simulation/SimulationProvider';
import { syncObserveSimulationState } from '../../simulation/simulationStore';
import { agenticGlobalAiApi } from '../../persesAgenticBridge';
import { useActivePerspective } from '@app/shared/contexts/ActivePerspectiveContext';
import { TopFiringAlertsCard } from '../../pages/ai-hub-v3/TopFiringAlertsCard';
import { SignalCompressionChart } from '../../pages/ai-hub-v3/SignalCompressionChart';
import { WhileYouWereAwayCard } from '../../pages/ai-hub-v3/WhileYouWereAwayCard';
import { NodeComponentSummary } from '../../pages/ai-hub-v3/NodeComponentSummary';
import { ActivePlansTable } from '../../pages/ai-hub-v3/ActivePlansTable';
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

const WIDGET_ID = 'ols-autonomous-ai-observe-widget-v3';
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

type AutonomousAiObserveWidgetV3Props = {
  fleetClusterDrillDown?: boolean;
  onFleetDrillDownChange?: (isDrillDown: boolean) => void;
  /** When true, replaces the Top Firing Alerts card with the Signal Compression Chart. */
  showSignalCompressionChart?: boolean;
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

export const AutonomousAiObserveWidgetV3: React.FC<AutonomousAiObserveWidgetV3Props> = ({
  fleetClusterDrillDown: fleetClusterDrillDownProp,
  onFleetDrillDownChange,
  showSignalCompressionChart = false,
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

  const showCorePlatformInsightCards = useMemo(
    () => activePerspective === 'Core platforms' && !showFleetOverview,
    [activePerspective, showFleetOverview]
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

  React.useEffect(() => {
    if (activePerspective === 'Core platforms') {
      setCAlertsOpen(true);
    }
  }, [activePerspective]);
  const [cAlertsOpen, setCAlertsOpen] = useState(activePerspective === 'Core platforms');
  const [remediationScope, setRemediationScope] = useState<'fleet' | 'cluster'>('cluster');
  const [fleetIncidentExpanded, setFleetIncidentExpanded] = useState(false);
  /** Drill from Top firing alerts “Investigate with AI”: expand Chain, RCA, and Remediation inside fleet incident card. */
  const [expandFleetDrillAllInnerSections, setExpandFleetDrillAllInnerSections] = useState(false);
  /** Drill target alert row — expands outer card + all inner sections for that `ObserveAlertItem`. */
  const [expandObserveRemediationAlertId, setExpandObserveRemediationAlertId] = useState<string | null>(null);
  const [pendingRemediationRuleTitle, setPendingRemediationRuleTitle] = useState<string | null>(null);
  const skipExpandedAlertsResetRef = useRef(false);
  const fleetAwayDigestItems = useMemo(() => AWAY_DIGEST_ITEMS, []);

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

    if (pendingRemediationRuleTitle && remediationScope === 'cluster' && selectedClusterId) {
      const title = pendingRemediationRuleTitle;
      const target = resolveClusterRemediationDrillTarget(title, selectedClusterId);

      if (target?.kind === 'alert') {
        const next: Record<string, boolean> = {};
        clusterAlerts.forEach((a) => {
          next[a.id] = a.id === target.alertId;
        });
        setExpandedAlerts(next);
        setExpandObserveRemediationAlertId(target.alertId);
        setCAlertsOpen(true);
        scrollDrillToTopAlertsSection(target.alertId);
      }

      clearRemediationDrillSession();
      setPendingRemediationRuleTitle(null);
      skipExpandedAlertsResetRef.current = true;
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
  }, [topAlertsRemediationsAlerts, remediationScope, pendingRemediationRuleTitle, selectedClusterId, clusterAlerts]);

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
      setCAlertsOpen(true);
      if (activePerspective === 'Core platforms') {
        setRemediationScope('cluster');
      } else {
        setRemediationScope('fleet');
        if (fleetClusterDrillDownProp === undefined) {
          setFleetClusterDrillDownInternal(true);
        }
        onFleetDrillDownChange?.(true);
      }
    };

    window.addEventListener(REMEDIATION_DRILL_EVENT, onRemediationDrill);
    return () => window.removeEventListener(REMEDIATION_DRILL_EVENT, onRemediationDrill);
  }, [activePerspective, fleetClusterDrillDownProp, onFleetDrillDownChange]);

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

  const clusterAwayDigestItems = useMemo(
    () => (selectedClusterId ? buildClusterAwayDigestItems(selectedClusterId) : []),
    [selectedClusterId]
  );

  const clusterRecommendedRemediationCount = useMemo(
    () => clusterAwayDigestItems.filter((item) => item.tone === 'danger' || item.tone === 'warning').length,
    [clusterAwayDigestItems]
  );

  const openClusterRemediations = useCallback(() => {
    setRemediationScope('cluster');
    setCAlertsOpen(true);
    setExpandObserveRemediationAlertId(null);
    setExpandFleetDrillAllInnerSections(false);
  }, []);


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
                    {showSignalCompressionChart ? (
                      <SignalCompressionChart />
                    ) : (
                      <TopFiringAlertsCard />
                    )}
                  </GridItem>
                  <GridItem span={12} lg={6} className="ols-aio-fleet-pair-item">
                    <WhileYouWereAwayCard
                      onViewRemediations={openFleetWideRemediations}
                      recommendedRemediationCount={fleetRecommendedRemediationCount}
                    />
                  </GridItem>
                </Grid>
              </StackItem>

              <StackItem>
                <ActivePlansTable
                  scope="fleet"
                  onPlanRoute={(_rowId) => { /* TODO: deep-link to Plans tab */ }}
                  onClusterClick={(clusterId) => drillIntoClusterFromFleetOverview(clusterId)}
                  onViewAlerts={() => navigate(alertingHref({ tab: 'fleet-overview', aiHubFleetScope: true }))}
                />
              </StackItem>
            </Stack>
          ) : selectedCluster ? (
            <Stack hasGutter>
              {showCorePlatformInsightCards ? (
                <StackItem>
                  <Grid hasGutter className="ols-aio-fleet-pair-grid ols-aio-gutter-24">
                    <GridItem span={12} lg={6} className="ols-aio-fleet-pair-item">
                      {showSignalCompressionChart ? (
                        <SignalCompressionChart />
                      ) : (
                        <TopFiringAlertsCard clusterId={selectedClusterId} />
                      )}
                    </GridItem>
                    <GridItem span={12} lg={6} className="ols-aio-fleet-pair-item">
                      <WhileYouWereAwayCard
                        clusterId={selectedClusterId}
                        onViewRemediations={openClusterRemediations}
                        recommendedRemediationCount={clusterRecommendedRemediationCount}
                      />
                    </GridItem>
                  </Grid>
                </StackItem>
              ) : null}

              {showCorePlatformInsightCards ? (
                <StackItem>
                  <NodeComponentSummary />
                </StackItem>
              ) : null}

              {activePerspective !== 'Core platforms' ? (
              <StackItem>
                <Card className="ols-aio-subcard" isCompact isExpanded={cAlertsOpen} id={`${WIDGET_ID}-c-alerts`}>
                  <CardHeader
                    onExpand={() => setCAlertsOpen((o) => !o)}
                    toggleButtonProps={{
                      id: `${WIDGET_ID}-c-alerts-toggle`,
                      'aria-label': 'Toggle Top AI investigations section',
                    }}
                  >
                    <Flex alignItems={{ default: 'alignItemsCenter' }} flexWrap={{ default: 'wrap' }}>
                      <FlexItem style={{ marginRight: 'var(--pf-t--global--spacer--sm)' }}>
                        <Title headingLevel="h3" size="lg">
                          Top AI investigations
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
                          {alertsForTopAlertsCard.some((a) => a.agentStatus === 'investigating') && (
                            <StackItem>
                              <Alert
                                isInline
                                variant="info"
                                title="AI-driven investigation in progress"
                              >
                                <Flex
                                  alignItems={{ default: 'alignItemsCenter' }}
                                  gap={{ default: 'gapSm' }}
                                  flexWrap={{ default: 'wrap' }}
                                  style={{ marginTop: 'var(--pf-t--global--spacer--xs)' }}
                                >
                                  <Label color="grey" isCompact>AI-generated</Label>
                                  <Content component="p" style={{ margin: 0 }}>
                                    We are currently conducting an AI-driven investigation on one or more
                                    active alerts. Autonomous evidence collection and root cause analysis
                                    are running — review AI findings before taking manual action.
                                  </Content>
                                </Flex>
                              </Alert>
                            </StackItem>
                          )}
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
              ) : null}
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

import * as React from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  StackItem,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Content,
  Tooltip,
  ToggleGroup,
  ToggleGroupItem,
  Label,
  Stack,
  Button,
} from '@patternfly/react-core';
import { HelpIcon, ExclamationCircleIcon, ExclamationTriangleIcon, InfoCircleIcon } from '@patternfly/react-icons';
import {
  Chart,
  ChartAxis,
  ChartBar,
  ChartStack,
  ChartGroup,
  ChartScatter,
  ChartVoronoiContainer,
  ChartTooltip,
} from '@patternfly/react-charts/victory';
import type { ClusterData, AlertSeverity } from './types';

const SEVERITY_COLORS = {
  Critical: 'var(--pf-t--global--color--status--danger--default, #c9190b)',
  Warning: 'var(--pf-t--global--color--status--warning--default, #f0ab00)',
  Info: 'var(--pf-t--global--color--status--info--default, #2b9af3)',
};

type SeverityKey = 'Critical' | 'Warning' | 'Info';

const SEVERITY_ICONS: Record<SeverityKey, React.ReactNode> = {
  Critical: <ExclamationCircleIcon />,
  Warning: <ExclamationTriangleIcon />,
  Info: <InfoCircleIcon />,
};

// Severity weight for bubble size: Critical=3, Warning=2, Info=1
const severityWeight = (c: number, w: number, i: number) => 3 * c + 2 * w + 1 * i;

const INSIGHTS_LIST_SIZE = 5;

// Inline alert group styling (light theme to match screen)
const INSIGHTS_WRAPPER = {
  backgroundColor: 'var(--pf-t--global--background--color--secondary--default, #f5f5f5)',
  borderRadius: 'var(--pf-t--global--border--radius--medium, 8px)',
  padding: 'var(--pf-t--global--spacer--md, 16px)',
  color: 'var(--pf-t--global--text--color--regular, #151515)',
} as const;

const INSIGHTS_CARD = (borderColor: string) => ({
  backgroundColor: 'var(--pf-t--global--background--color--primary--default, #ffffff)',
  borderRadius: 'var(--pf-t--global--border--radius--medium, 8px)',
  border: '1px solid var(--pf-t--global--border--color--default, #d2d2d2)',
  borderLeft: `3px solid ${borderColor}`,
  padding: 'var(--pf-t--global--spacer--md, 16px)',
});

const INSIGHTS_LINK = {
  fontSize: 'var(--pf-t--global--font--size--sm, 14px)',
} as const;

const TROUBLESHOOT_TOOLTIP = 'Troubleshooting is not available. Install Signal Correlator operator to enable it.';

interface CrossClusterInsightsCardsProps {
  clusters: ClusterData[];
  onAlertRuleClick: (alertName: string) => void;
  onComponentClick: (componentName: string) => void;
  onClusterClick?: (clusterName: string) => void;
  onViewAllFiringAlerts?: () => void;
  onViewAllClusters?: () => void;
}

type ViewMode = 'chart' | 'table';

export const CrossClusterInsightsCards: React.FC<CrossClusterInsightsCardsProps> = ({
  clusters,
  onAlertRuleClick,
  onComponentClick,
  onClusterClick,
  onViewAllFiringAlerts,
  onViewAllClusters,
}) => {
  const [alertsView, setAlertsView] = React.useState<ViewMode>('chart');
  const [componentsView, setComponentsView] = React.useState<ViewMode>('chart');
  const [alertsLegendFilters, setAlertsLegendFilters] = React.useState<SeverityKey[]>([]);
  const chartContainerRef = React.useRef<HTMLDivElement>(null);
  const bubbleContainerRef = React.useRef<HTMLDivElement>(null);
  const [chartSize, setChartSize] = React.useState({ width: 400, height: 280 });
  const [bubbleChartSize, setBubbleChartSize] = React.useState({ width: 400, height: 280 });

  React.useEffect(() => {
    const updateSize = () => {
      if (chartContainerRef.current) {
        const rect = chartContainerRef.current.getBoundingClientRect();
        setChartSize(prev => {
          const w = Math.max(320, rect.width);
          const h = Math.min(360, Math.max(280, rect.height));
          return prev.width === w && prev.height === h ? prev : { width: w, height: h };
        });
      }
      if (bubbleContainerRef.current) {
        const rect = bubbleContainerRef.current.getBoundingClientRect();
        setBubbleChartSize(prev => {
          const w = Math.max(320, rect.width);
          const h = Math.min(360, Math.max(280, rect.height));
          return prev.width === w && prev.height === h ? prev : { width: w, height: h };
        });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (alertsView === 'chart' && chartContainerRef.current) observer.observe(chartContainerRef.current);
    if (componentsView === 'chart' && bubbleContainerRef.current) observer.observe(bubbleContainerRef.current);
    window.addEventListener('resize', updateSize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, [alertsView, componentsView]);

  // Top firing alerts: per-rule with clusters and severity
  const alertRuleData = React.useMemo(() => {
    const byRule: Record<string, {
      name: string;
      critical: number;
      warning: number;
      info: number;
      clusters: string[];
    }> = {};
    clusters.forEach(cluster => {
      cluster.alerts.filter(a => a.status === 'firing').forEach(alert => {
        if (!byRule[alert.alertName]) {
          byRule[alert.alertName] = { name: alert.alertName, critical: 0, warning: 0, info: 0, clusters: [] };
        }
        if (alert.severity === 'Critical') byRule[alert.alertName].critical++;
        else if (alert.severity === 'Warning') byRule[alert.alertName].warning++;
        else byRule[alert.alertName].info++;
        if (!byRule[alert.alertName].clusters.includes(cluster.name)) {
          byRule[alert.alertName].clusters.push(cluster.name);
        }
      });
    });
    return Object.values(byRule)
      .sort((a, b) => (b.critical + b.warning + b.info) - (a.critical + a.warning + a.info))
      .slice(0, 8);
  }, [clusters]);

  const alertRuleStackData = React.useMemo(() => {
    const showCritical = alertsLegendFilters.length === 0 || alertsLegendFilters.includes('Critical');
    const showWarning = alertsLegendFilters.length === 0 || alertsLegendFilters.includes('Warning');
    const showInfo = alertsLegendFilters.length === 0 || alertsLegendFilters.includes('Info');
    // For horizontal bars: x = category (rule name), y = value (count)
    const criticalData = alertRuleData.map(r => ({ x: r.name, y: showCritical ? r.critical : 0 }));
    const warningData = alertRuleData.map(r => ({ x: r.name, y: showWarning ? r.warning : 0 }));
    const infoData = alertRuleData.map(r => ({ x: r.name, y: showInfo ? r.info : 0 }));
    return { criticalData, warningData, infoData };
  }, [alertRuleData, alertsLegendFilters]);

  // Most impacted components: cluster count, alert count, severity weight for bubble
  const componentBubbleData = React.useMemo(() => {
    const byComp: Record<string, {
      name: string;
      count: number;
      critical: number;
      warning: number;
      info: number;
      clusters: string[];
    }> = {};
    clusters.forEach(cluster => {
      cluster.alerts.filter(a => a.status === 'firing').forEach(alert => {
        if (!byComp[alert.component]) {
          byComp[alert.component] = { name: alert.component, count: 0, critical: 0, warning: 0, info: 0, clusters: [] };
        }
        byComp[alert.component].count++;
        if (alert.severity === 'Critical') byComp[alert.component].critical++;
        else if (alert.severity === 'Warning') byComp[alert.component].warning++;
        else byComp[alert.component].info++;
        if (!byComp[alert.component].clusters.includes(cluster.name)) {
          byComp[alert.component].clusters.push(cluster.name);
        }
      });
    });
    return Object.values(byComp)
      .sort((a, b) => b.count - a.count)
      .slice(0, 12)
      .map(d => {
        const severity: AlertSeverity = d.critical > 0 ? 'Critical' : d.warning > 0 ? 'Warning' : 'Info';
        const weight = severityWeight(d.critical, d.warning, d.info);
        return {
          ...d,
          severity,
          x: d.clusters.length,
          y: d.count,
          severityWeight: Math.max(5, Math.min(35, weight + 5)),
        };
      });
  }, [clusters]);

  const totalFiringAlertsCount = React.useMemo(
    () => clusters.reduce((s, c) => s + c.alerts.filter(a => a.status === 'firing').length, 0),
    [clusters]
  );

  const hasAlertData = alertRuleData.some(r => r.critical + r.warning + r.info > 0);
  const hasComponentData = componentBubbleData.length > 0;

  const alertsTooltipContent = (rule: typeof alertRuleData[0]) => {
    const total = rule.critical + rule.warning + rule.info;
    return [
      `Alert rule: ${rule.name}`,
      `Scope: ${total} total alert${total !== 1 ? 's' : ''} across ${rule.clusters.length} affected cluster${rule.clusters.length !== 1 ? 's' : ''}.`,
      `Severity breakdown: ${rule.critical} critical, ${rule.warning} warning, ${rule.info} info.`,
      '',
      'Select to view filtered alerts.',
    ].join('\n');
  };

  const CARD_MIN_HEIGHT = 420;

  return (
    <StackItem>
      <Grid hasGutter style={{ alignItems: 'stretch' }}>
        {/* Card 1: Top Firing Alerts - 50% width */}
        <GridItem md={6} style={{ display: 'flex' }}>
          <Card style={{ minHeight: CARD_MIN_HEIGHT, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <CardHeader>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
              <FlexItem>
                <Flex gap={{ default: 'gapXs' }} alignItems={{ default: 'alignItemsCenter' }}>
                  <CardTitle>Top alerts</CardTitle>
                  <Tooltip
                    content="Stay informed about the most frequent issues across your fleet so you can prioritize which alerts need attention first."
                  >
                    <Button variant="plain" aria-label="More information about Top alerts" icon={<InfoCircleIcon />} />
                  </Tooltip>
                </Flex>
              </FlexItem>
              <FlexItem>
                <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                  <ToggleGroup aria-label="View mode">
                    <ToggleGroupItem
                      text="Chart view"
                      buttonId="alerts-chart"
                      isSelected={alertsView === 'chart'}
                      onChange={() => setAlertsView('chart')}
                    />
                    <ToggleGroupItem
                      text="Insights view"
                      buttonId="alerts-insights"
                      isSelected={alertsView === 'table'}
                      onChange={() => setAlertsView('table')}
                    />
                  </ToggleGroup>
                  <Tooltip
                    content={
                      <div>
                        <strong>Chart view:</strong> Hover over a bar to see scope and severity. Select a bar to open the Alerts tab filtered by that rule.
                        <br />
                        <strong>Insights view:</strong> Blast radius by alert name with cluster count and severity.
                      </div>
                    }
                  >
                    <Button variant="plain" aria-label="View mode help" icon={<HelpIcon />} />
                  </Tooltip>
                </Flex>
              </FlexItem>
            </Flex>
          </CardHeader>
          <CardBody style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            {alertsView === 'chart' ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  minHeight: 0,
                  width: '100%',
                }}
                aria-label="Top alerts by rule and severity. Select a bar to open the Alerts tab filtered by that rule."
              >
                {hasAlertData ? (
                  <>
                  <div ref={chartContainerRef} style={{ flex: 1, minHeight: 200, minWidth: 0, cursor: 'pointer' }}>
                  <Chart
                    ariaDesc="Top alert rules. Hover for scope and severity. Select a bar to open the Alerts tab filtered by that rule."
                    ariaTitle="Top alerts"
                    containerComponent={
                      <ChartVoronoiContainer
                        labels={({ datum }) => {
                          const rule = alertRuleData.find(r => r.name === datum.x);
                          if (!rule) return '';
                          return alertsTooltipContent(rule);
                        }}
                        constrainToVisibleArea
                        labelComponent={
                          <ChartTooltip
                            constrainToVisibleArea
                            labelTextAnchor="start"
                            dx={8}
                            style={{
                              fontFamily: "'RedHatText', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                              fontSize: 12,
                              fill: '#151515',
                              textAnchor: 'start',
                            }}
                            flyoutStyle={{
                              fill: '#ffffff',
                              stroke: '#d2d2d2',
                              strokeWidth: 1,
                              padding: 12,
                            }}
                          />
                        }
                      />
                    }
                    domainPadding={{ x: [12, 8], y: [8, 8] }}
                    height={chartSize.height}
                    width={chartSize.width}
                    padding={{ top: 8, bottom: 16, left: 140, right: 24 }}
                    name="top-firing-alerts"
                  >
                    <ChartAxis
                      tickFormat={(t) => (typeof t === 'string' && t.length > 18 ? t.slice(0, 16) + '…' : t)}
                      style={{ tickLabels: { fontSize: 10 } }}
                    />
                    <ChartAxis dependentAxis showGrid tickFormat={(t) => t} style={{ tickLabels: { fontSize: 10 } }} />
                    <ChartGroup horizontal>
                      <ChartStack>
                        <ChartBar
                          data={alertRuleStackData.criticalData}
                          style={{ data: { fill: SEVERITY_COLORS.Critical, cursor: 'pointer' } }}
                          events={[{ target: 'data', eventHandlers: { onClick: (_evt: any, props: any) => { if (props?.datum?.x) onAlertRuleClick(props.datum.x); return []; } } }]}
                        />
                        <ChartBar
                          data={alertRuleStackData.warningData}
                          style={{ data: { fill: SEVERITY_COLORS.Warning, cursor: 'pointer' } }}
                          events={[{ target: 'data', eventHandlers: { onClick: (_evt: any, props: any) => { if (props?.datum?.x) onAlertRuleClick(props.datum.x); return []; } } }]}
                        />
                        <ChartBar
                          data={alertRuleStackData.infoData}
                          style={{ data: { fill: SEVERITY_COLORS.Info, cursor: 'pointer' } }}
                          events={[{ target: 'data', eventHandlers: { onClick: (_evt: any, props: any) => { if (props?.datum?.x) onAlertRuleClick(props.datum.x); return []; } } }]}
                        />
                      </ChartStack>
                    </ChartGroup>
                  </Chart>
                  </div>
                  {/* Clickable legend - inside card */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      flexWrap: 'wrap',
                      gap: '8px',
                      padding: '12px 0 0',
                      flexShrink: 0,
                    }}
                    role="group"
                    aria-label="Filter by severity"
                  >
                    {(['Critical', 'Warning', 'Info'] as SeverityKey[]).map(status => {
                      const isActive = alertsLegendFilters.length === 0 || alertsLegendFilters.includes(status);
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setAlertsLegendFilters(prev => {
                            if (prev.includes(status)) {
                              const next = prev.filter(s => s !== status);
                              return next;
                            }
                            return [...prev, status];
                          })}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '4px 12px',
                            backgroundColor: isActive ? '#ffffff' : 'var(--pf-t--global--background--color--secondary--default, #f5f5f5)',
                            borderRadius: 'var(--pf-t--global--border--radius--small, 3px)',
                            border: isActive ? `2px solid ${SEVERITY_COLORS[status]}` : '1px solid var(--pf-t--global--border--color--default, #d2d2d2)',
                            cursor: 'pointer',
                            opacity: isActive ? 1 : 0.6,
                            fontFamily: "'RedHatText', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                            fontSize: 13,
                            color: isActive ? '#151515' : '#6a6e73',
                            fontWeight: 500,
                          }}
                          aria-pressed={isActive}
                          aria-label={`${status} severity. ${isActive ? 'Click to hide' : 'Click to show'} in chart`}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', color: SEVERITY_COLORS[status] }} aria-hidden="true">
                            {SEVERITY_ICONS[status]}
                          </span>
                          <span style={{ width: 10, height: 10, borderRadius: 2, background: SEVERITY_COLORS[status], opacity: isActive ? 1 : 0.5 }} aria-hidden="true" />
                          {status}
                        </button>
                      );
                    })}
                  </div>
                  </>
                ) : (
                  <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentCenter' }} style={{ height: '100%' }}>
                    <Content component="p" className="pf-v6-u-color-200">No alerts</Content>
                  </Flex>
                )}
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  minHeight: 0,
                  width: '100%',
                }}
              >
                {hasAlertData ? (
                  <>
                    <Content component="p" className="pf-v6-u-color-200 pf-v6-u-font-size-sm pf-v6-u-mb-md">
                      Blast radius analysis
                    </Content>
                    <div style={{ ...INSIGHTS_WRAPPER, flex: 1, minHeight: 0, overflow: 'auto' }}>
                      <Stack hasGutter>
                        {alertRuleData.slice(0, INSIGHTS_LIST_SIZE).map(rule => {
                          const dominantSeverity: SeverityKey = rule.critical > 0 ? 'Critical' : rule.warning > 0 ? 'Warning' : 'Info';
                          const clusterCount = rule.clusters.length;
                          const borderColor = SEVERITY_COLORS[dominantSeverity];
                          return (
                            <StackItem key={rule.name} style={INSIGHTS_CARD(borderColor)}>
                              <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }} flexWrap={{ default: 'wrap' }} gap={{ default: 'gapMd' }}>
                                <FlexItem>
                                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                    <span style={{ color: borderColor, display: 'flex', flexShrink: 0 }} aria-hidden="true">
                                      {SEVERITY_ICONS[dominantSeverity]}
                                    </span>
                                    <Stack hasGutter={false}>
                                      <StackItem>
                                        <Content component="p" style={{ fontWeight: 600, margin: 0, color: 'inherit' }}>
                                          {rule.name}
                                        </Content>
                                      </StackItem>
                                      <StackItem style={{ marginTop: 'var(--pf-t--global--spacer--xs, 4px)' }}>
                                        <Content component="p" style={{ margin: 0, color: 'var(--pf-t--global--text--color--subtle)', fontSize: 'var(--pf-t--global--font--size--sm)' }}>
                                          Firing in {clusterCount} cluster{clusterCount !== 1 ? 's' : ''}
                                        </Content>
                                      </StackItem>
                                    </Stack>
                                  </Flex>
                                </FlexItem>
                                <FlexItem>
                                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                                    <Tooltip content={TROUBLESHOOT_TOOLTIP}>
                                      <span>
                                        <Button
                                          variant="link"
                                          isInline
                                          style={INSIGHTS_LINK}
                                          className="pf-v6-u-font-size-sm"
                                          isDisabled
                                          aria-label={TROUBLESHOOT_TOOLTIP}
                                        >
                                          Troubleshoot
                                        </Button>
                                      </span>
                                    </Tooltip>
                                    <Button
                                      variant="link"
                                      isInline
                                      style={INSIGHTS_LINK}
                                      className="pf-v6-u-font-size-sm"
                                      onClick={() => onAlertRuleClick(rule.name)}
                                    >
                                      View alert
                                    </Button>
                                  </Flex>
                                </FlexItem>
                              </Flex>
                            </StackItem>
                          );
                        })}
                      </Stack>
                    </div>
                    {totalFiringAlertsCount > 0 && (
                      <div className="pf-v6-u-pt-md pf-v6-u-pb-sm">
                        <Button
                          variant="link"
                          isInline
                          onClick={() => onViewAllFiringAlerts?.()}
                          isDisabled={!onViewAllFiringAlerts}
                        >
                          View all firing alerts ({totalFiringAlertsCount})
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentCenter' }} style={{ flex: 1 }}>
                    <Content component="p" className="pf-v6-u-color-200">No alerts</Content>
                  </Flex>
                )}
              </div>
            )}
          </CardBody>
        </Card>
        </GridItem>

        {/* Card 2: Most Impacted Components - 50% width */}
        <GridItem md={6} style={{ display: 'flex' }}>
          <Card style={{ minHeight: CARD_MIN_HEIGHT, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <CardHeader>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
              <FlexItem>
                <Flex gap={{ default: 'gapXs' }} alignItems={{ default: 'alignItemsCenter' }}>
                  <CardTitle>Most impacted components</CardTitle>
                  <Tooltip
                    content="Identify which components are most often affected by alerts. Chart view shows impact density; insights view lists top components by cluster count and severity."
                  >
                    <Button variant="plain" aria-label="More information about Most impacted components" icon={<InfoCircleIcon />} />
                  </Tooltip>
                </Flex>
              </FlexItem>
              <FlexItem>
                <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                  <ToggleGroup aria-label="View mode">
                    <ToggleGroupItem
                      text="Chart view"
                      buttonId="components-chart"
                      isSelected={componentsView === 'chart'}
                      onChange={() => setComponentsView('chart')}
                    />
                    <ToggleGroupItem
                      text="Insights view"
                      buttonId="components-insights"
                      isSelected={componentsView === 'table'}
                      onChange={() => setComponentsView('table')}
                    />
                  </ToggleGroup>
                  <Tooltip
                    content={
                      <div>
                        <strong>Chart view:</strong> Impact density by component (X = clusters affected, Y = alert count, bubble size = severity weight).
                        <br />
                        <strong>Insights view:</strong> Top components by cluster count and severity.
                      </div>
                    }
                  >
                    <Button variant="plain" aria-label="View mode help" icon={<HelpIcon />} />
                  </Tooltip>
                </Flex>
              </FlexItem>
            </Flex>
          </CardHeader>
          <CardBody style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            {componentsView === 'chart' ? (
              <div
                ref={bubbleContainerRef}
                style={{ flex: 1, minHeight: '320px', width: '100%', cursor: 'pointer' }}
                aria-label="Impact density. Click a bubble to open Alerts tab filtered by that component."
              >
                {hasComponentData ? (
                  <Chart
                    ariaDesc="Most impacted components. X = clusters affected, Y = alert count, bubble size = severity weight. Click to view all firing alerts for that component."
                    ariaTitle="Impact density"
                    containerComponent={
                      <ChartVoronoiContainer
                        labels={(args: any) => {
                          const datum = args?.datum;
                          if (!datum || datum.name == null) return '';
                          const total = datum.count;
                          const clusterCount = datum.clusters?.length ?? 0;
                          return [
                            `Component: ${datum.name}`,
                            `Scope: ${total} total alert${total !== 1 ? 's' : ''} across ${clusterCount} affected cluster${clusterCount !== 1 ? 's' : ''}.`,
                            `Severity breakdown: ${datum.critical ?? 0} critical, ${datum.warning ?? 0} warning, ${datum.info ?? 0} info.`,
                            '',
                            'Select to view filtered alerts for this component.',
                          ].join('\n');
                        }}
                        constrainToVisibleArea
                        labelComponent={
                          <ChartTooltip
                            constrainToVisibleArea
                            labelTextAnchor="start"
                            dx={8}
                            style={{
                              fontFamily: "'RedHatText', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                              fontSize: 12,
                              fill: '#151515',
                              textAnchor: 'start',
                            }}
                            flyoutStyle={{
                              fill: '#ffffff',
                              stroke: '#d2d2d2',
                              strokeWidth: 1,
                              padding: 12,
                            }}
                          />
                        }
                      />
                    }
                    domainPadding={{ x: [10, 10], y: [10, 10] }}
                    height={bubbleChartSize.height}
                    width={bubbleChartSize.width}
                    padding={{ top: 16, bottom: 50, left: 50, right: 24 }}
                    name="impact-density-bubble"
                  >
                    <ChartAxis label="Clusters" style={{ tickLabels: { fontSize: 10 } }} />
                    <ChartAxis dependentAxis label="Alerts" showGrid style={{ tickLabels: { fontSize: 10 } }} />
                    <ChartGroup>
                      <ChartScatter
                        data={componentBubbleData}
                        x="x"
                        y="y"
                        bubbleProperty="severityWeight"
                        minBubbleSize={8}
                        maxBubbleSize={36}
                        style={{
                          data: {
                            fill: ({ datum }: { datum?: typeof componentBubbleData[0] }) => datum ? SEVERITY_COLORS[datum.severity] : SEVERITY_COLORS.Info,
                            stroke: ({ datum }: { datum?: typeof componentBubbleData[0] }) => datum ? SEVERITY_COLORS[datum.severity] : SEVERITY_COLORS.Info,
                            cursor: 'pointer',
                          },
                        }}
                        events={[{ target: 'data', eventHandlers: { onClick: (_evt: any, props: any) => { if (props?.datum?.name) onComponentClick(props.datum.name); return []; } } }]}
                      />
                    </ChartGroup>
                  </Chart>
                ) : (
                  <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentCenter' }} style={{ height: '100%' }}>
                    <Content component="p" className="pf-v6-u-color-200">No affected components</Content>
                  </Flex>
                )}
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  minHeight: 0,
                  width: '100%',
                }}
              >
                {hasComponentData ? (
                  <>
                    <Content component="p" className="pf-v6-u-color-200 pf-v6-u-font-size-sm pf-v6-u-mb-md">
                      Impact by component
                    </Content>
                    <div style={{ ...INSIGHTS_WRAPPER, flex: 1, minHeight: 0, overflow: 'auto' }}>
                      <Stack hasGutter>
                        {componentBubbleData.slice(0, INSIGHTS_LIST_SIZE).map(comp => {
                          const dominantSeverity: SeverityKey = comp.critical > 0 ? 'Critical' : comp.warning > 0 ? 'Warning' : 'Info';
                          const clusterCount = comp.clusters.length;
                          const borderColor = SEVERITY_COLORS[dominantSeverity];
                          return (
                            <StackItem key={comp.name} style={INSIGHTS_CARD(borderColor)}>
                              <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }} flexWrap={{ default: 'wrap' }} gap={{ default: 'gapMd' }}>
                                <FlexItem>
                                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                    <span style={{ color: borderColor, display: 'flex', flexShrink: 0 }} aria-hidden="true">
                                      {SEVERITY_ICONS[dominantSeverity]}
                                    </span>
                                    <Stack hasGutter={false}>
                                      <StackItem>
                                        <Content component="p" style={{ fontWeight: 600, margin: 0, color: 'inherit' }}>
                                          {comp.name}
                                        </Content>
                                      </StackItem>
                                      <StackItem style={{ marginTop: 'var(--pf-t--global--spacer--xs, 4px)' }}>
                                        <Content component="p" style={{ margin: 0, color: 'var(--pf-t--global--text--color--subtle)', fontSize: 'var(--pf-t--global--font--size--sm)' }}>
                                          Affected in {clusterCount} cluster{clusterCount !== 1 ? 's' : ''}
                                        </Content>
                                      </StackItem>
                                    </Stack>
                                  </Flex>
                                </FlexItem>
                                <FlexItem>
                                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                                    <Tooltip content={TROUBLESHOOT_TOOLTIP}>
                                      <span>
                                        <Button
                                          variant="link"
                                          isInline
                                          style={INSIGHTS_LINK}
                                          className="pf-v6-u-font-size-sm"
                                          isDisabled
                                          aria-label={TROUBLESHOOT_TOOLTIP}
                                        >
                                          Troubleshoot
                                        </Button>
                                      </span>
                                    </Tooltip>
                                    <Button
                                      variant="link"
                                      isInline
                                      style={INSIGHTS_LINK}
                                      className="pf-v6-u-font-size-sm"
                                      onClick={() => onComponentClick(comp.name)}
                                    >
                                      View alert
                                    </Button>
                                  </Flex>
                                </FlexItem>
                              </Flex>
                            </StackItem>
                          );
                        })}
                      </Stack>
                    </div>
                    {componentBubbleData.length > 0 && (
                      <div className="pf-v6-u-pt-md pf-v6-u-pb-sm">
                        <Button
                          variant="link"
                          isInline
                          onClick={() => onViewAllClusters?.()}
                          isDisabled={!onViewAllClusters}
                        >
                          View all impacted components ({componentBubbleData.length})
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentCenter' }} style={{ flex: 1 }}>
                    <Content component="p" className="pf-v6-u-color-200">No impacted components</Content>
                  </Flex>
                )}
              </div>
            )}
          </CardBody>
        </Card>
        </GridItem>
      </Grid>
    </StackItem>
  );
};

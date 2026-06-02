import React, { useEffect, useRef, useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Content,
  Flex,
  FlexItem,
  Popover,
  Title,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartLegendTooltip,
  ChartLine,
  ChartVoronoiContainer,
} from '@patternfly/react-charts/victory';
import { AI_EXPERIENCE_ICON_DATA_URL } from '../../components/autonomousAiObserve/aiExperienceIconUrl';
import {
  getSignalCompressionChartData,
  type SignalCompressionPoint,
} from './fleetInventoryData';

// ─── Type alias ───────────────────────────────────────────────────────────────

type DataPoint = SignalCompressionPoint;

// ─── Design constants ─────────────────────────────────────────────────────────

const RAW_COLOR = '#8a8d90';
const AI_COLOR = '#0066CC';

const CHART_PADDING = { bottom: 48, left: 56, right: 16, top: 12 };

// Symbol definitions drive both the tooltip dots and keep them consistent with the legend.
const TOOLTIP_LEGEND_DATA = [
  { name: 'Raw signals', symbol: { fill: RAW_COLOR, type: 'square' as const } },
  { name: 'AI plans',    symbol: { fill: AI_COLOR,  type: 'circle' as const } },
];

// ─── Responsive width hook ────────────────────────────────────────────────────

function useContainerWidth(ref: React.RefObject<HTMLDivElement | null>): number {
  const [width, setWidth] = useState(480);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Seed with the current size immediately so the chart renders correctly
    // on first paint without waiting for the observer callback.
    setWidth(Math.floor(el.getBoundingClientRect().width) || 480);

    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w > 0) setWidth(Math.floor(w));
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}

// ─── Popover body ─────────────────────────────────────────────────────────────

const PopoverBody = (
  <Content>
    <Content component="p">
      Measures how effectively the AI SRE agent condenses multi-domain operational noise into
      distinct, actionable remediation strategies.
    </Content>
    <Content component="p">
      <strong>Raw Ingested Signals:</strong> The live, cumulative volume of incoming Prometheus
      alerts, pipeline blocks, ACS security violations, and GitOps drift.
    </Content>
    <Content component="p">
      <strong>AI Generated Plans*:</strong> The unified, root-cause resolution strategies
      orchestrated by the agent.
    </Content>
    <Content component="p">
      <strong>How it correlates:</strong> Rather than treating events in isolation, the agent
      analyzes event timelines (temporal clustering) and cluster infrastructure mapping (topology
      correlation) to collapse an entire cascading storm of symptoms into a single, verifiable Plan.
    </Content>
  </Content>
);

// ─── Component ────────────────────────────────────────────────────────────────

export function SignalCompressionChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartWidth = useContainerWidth(containerRef);

  // Maintain a comfortable aspect ratio: chart grows taller as it widens,
  // clamped to a sensible range so it never feels too squat or too tall.
  const chartHeight = Math.min(300, Math.max(180, Math.round(chartWidth * 0.42)));

  // Derive all chart data from live simulation values (Wed = current incident state).
  const { rawSignalsData, aiPlansData, wednesdayRaw, wednesdayPlans } =
    getSignalCompressionChartData();
  const compressionRatio = Math.round(wednesdayRaw / wednesdayPlans);

  return (
    <Card
      isCompact
      component="section"
      aria-label="Signal Compression Ratio"
      className="ols-aio-subcard ols-aio-fleet-pair-card ols-autonomous-ai-observe-widget-v3-top-firing"
      style={{ boxSizing: 'border-box' }}
    >
      <CardHeader>
        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
          {/* AI branding — left of title */}
          <FlexItem>
            <img
              src={AI_EXPERIENCE_ICON_DATA_URL}
              alt=""
              aria-hidden="true"
              width={20}
              height={20}
              style={{ display: 'block', flexShrink: 0 }}
            />
          </FlexItem>

          <FlexItem>
            <Title headingLevel="h3" size="md" className="ols-aio-fleet-subcard-title">
              Signal Compression Ratio
            </Title>
          </FlexItem>

          {/* Popover — end of title row */}
          <FlexItem>
            <Popover
              headerContent="Signal Compression Ratio*"
              bodyContent={PopoverBody}
              position="right"
            >
              <button
                type="button"
                aria-label="More information about Signal Compression Ratio"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  color: 'var(--pf-t--global--text--color--subtle)',
                }}
              >
                <OutlinedQuestionCircleIcon />
              </button>
            </Popover>
          </FlexItem>
        </Flex>
        <Content
          component="p"
          style={{
            margin: '2px 0 0',
            fontSize: '12px',
            color: 'var(--pf-t--global--text--color--subtle)',
          }}
        >
          7-day view &mdash; Wed spike: {wednesdayRaw} raw alerts compressed to {wednesdayPlans} AI plans ({compressionRatio}:1 ratio)
        </Content>
      </CardHeader>

      <CardBody style={{ paddingTop: 'var(--pf-t--global--spacer--sm)' }}>
        {/* Measure this div; its width drives the chart SVG width exactly. */}
        <div ref={containerRef} style={{ width: '100%' }}>
          <Chart
            ariaDesc="Area chart comparing raw ingested signals against AI-generated plans over 7 days"
            ariaTitle="Signal Compression Ratio"
            containerComponent={
              <ChartVoronoiContainer
                labels={({ datum }: { datum: DataPoint }) => `${datum.y}`}
                labelComponent={
                  <ChartLegendTooltip
                    legendData={TOOLTIP_LEGEND_DATA}
                    title={(data: DataPoint[]) => data[0]?.x ?? ''}
                  />
                }
                constrainToVisibleArea
                voronoiDimension="x"
              />
            }
            width={chartWidth}
            height={chartHeight}
            padding={CHART_PADDING}
            domainPadding={{ x: [20, 20] }}
          >
            {/* X axis — days of week */}
            <ChartAxis />

            {/* Y axis — alert / plan count */}
            <ChartAxis
              dependentAxis
              tickFormat={(y: number) => (y >= 1000 ? `${y / 1000}k` : String(y))}
            />

            {/* Series 1: raw signals — muted area */}
            <ChartArea
              data={rawSignalsData}
              style={{
                data: {
                  fill: RAW_COLOR,
                  fillOpacity: 0.18,
                  stroke: RAW_COLOR,
                  strokeWidth: 1.5,
                },
              }}
            />

            {/* Series 2: AI plans — prominent line */}
            <ChartLine
              data={aiPlansData}
              style={{
                data: {
                  stroke: AI_COLOR,
                  strokeWidth: 3,
                },
              }}
            />
          </Chart>
        </div>

        {/* Legend */}
        <Flex
          gap={{ default: 'gapLg' }}
          justifyContent={{ default: 'justifyContentCenter' }}
          style={{ marginTop: 'var(--pf-t--global--spacer--xs)' }}
        >
          {/* Raw signals swatch */}
          <FlexItem>
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }}>
              <FlexItem>
                <span
                  aria-hidden="true"
                  style={{
                    display: 'inline-block',
                    width: 14,
                    height: 14,
                    background: RAW_COLOR,
                    opacity: 0.45,
                    borderRadius: 2,
                    flexShrink: 0,
                  }}
                />
              </FlexItem>
              <FlexItem>
                <Content
                  component="p"
                  style={{ margin: 0, fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)' }}
                >
                  Raw ingested signals
                </Content>
              </FlexItem>
            </Flex>
          </FlexItem>

          {/* AI plans swatch */}
          <FlexItem>
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }}>
              <FlexItem>
                <span
                  aria-hidden="true"
                  style={{
                    display: 'inline-block',
                    width: 20,
                    height: 3,
                    background: AI_COLOR,
                    borderRadius: 2,
                    flexShrink: 0,
                  }}
                />
              </FlexItem>
              <FlexItem>
                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }}>
                  <img
                    src={AI_EXPERIENCE_ICON_DATA_URL}
                    alt=""
                    aria-hidden="true"
                    width={12}
                    height={12}
                    style={{ display: 'block', flexShrink: 0 }}
                  />
                  <Content
                    component="p"
                    style={{ margin: 0, fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)' }}
                  >
                    AI generated plans
                  </Content>
                </Flex>
              </FlexItem>
            </Flex>
          </FlexItem>
        </Flex>
      </CardBody>
    </Card>
  );
}

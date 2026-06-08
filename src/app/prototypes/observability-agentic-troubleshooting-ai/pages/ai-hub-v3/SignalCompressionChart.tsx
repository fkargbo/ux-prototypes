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
  Tooltip,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartGroup,
  ChartLegendTooltip,
  ChartLine,
  createContainer,
} from '@patternfly/react-charts/victory';
import { AI_EXPERIENCE_ICON_DATA_URL } from '../../components/autonomousAiObserve/aiExperienceIconUrl';
import {
  getSignalCompressionChartData,
  type SignalCompressionPoint,
} from './fleetInventoryData';

// createContainer must be called outside the component to avoid recreating the
// component type on every render. 'voronoi' handles tooltip activation; 'cursor'
// adds the vertical cursor line (same pattern as PF's ChartAreaBottomLegend example).
const CursorVoronoiContainer = createContainer('voronoi', 'cursor');

// ─── Type alias ───────────────────────────────────────────────────────────────

type DataPoint = SignalCompressionPoint;

// ─── Design constants ─────────────────────────────────────────────────────────

const RAW_COLOR = '#8a8d90';
const AI_COLOR = '#0066CC';

// Extra bottom padding to reserve space for the built-in PF legend row.
const CHART_PADDING = { bottom: 75, left: 56, right: 16, top: 12 };

// Series names — must match the `name` prop on ChartArea / ChartLine so that
// Victory can associate each datum's `childName` with the right legend entry.
const RAW_SERIES_NAME = 'Raw signals';
const AI_SERIES_NAME = 'AI plans';

// Shared legend data — drives both the PF ChartLegend (bottom of chart SVG) and
// the ChartLegendTooltip. The `childName` field is required by ChartLegendTooltip
// to link each legend entry to the correct series by its `name` prop.
const LEGEND_DATA = [
  { childName: RAW_SERIES_NAME, name: 'Raw ingested signals',  symbol: { fill: RAW_COLOR, type: 'square' as const } },
  { childName: AI_SERIES_NAME,  name: 'AI generated plans *', symbol: { fill: AI_COLOR,  type: 'minus'  as const } },
];

// ─── AI icon tooltip ──────────────────────────────────────────────────────────

const AI_ICON_TOOLTIP =
  'Blends deterministic telemetry (objective event counts) with AI-synthesized remediation strategies to show how effectively the agent correlates cluster noise into actionable plans.';

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
      Measures how effectively the AI SRE agent reduces multi-domain operational noise into
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

  // Derive all chart data from live simulation values.
  const { rawSignalsData, aiPlansData } = getSignalCompressionChartData();

  return (
    <Card
      isCompact
      component="section"
      aria-label="Noise reduction"
      className="ols-aio-subcard ols-aio-fleet-pair-card ols-autonomous-ai-observe-widget-v3-top-firing"
      style={{ boxSizing: 'border-box' }}
    >
      <CardHeader>
        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
          {/* AI branding — left of title, with mixed-metrics tooltip */}
          <FlexItem>
            <Tooltip content={AI_ICON_TOOLTIP} position="top">
              <span
                tabIndex={0}
                role="img"
                aria-label="Mixed metrics — AI-synthesized and deterministic telemetry"
                style={{ display: 'inline-flex', alignItems: 'center', cursor: 'help' }}
              >
                <img
                  src={AI_EXPERIENCE_ICON_DATA_URL}
                  alt=""
                  aria-hidden="true"
                  width={20}
                  height={20}
                  style={{ display: 'block', flexShrink: 0 }}
                />
              </span>
            </Tooltip>
          </FlexItem>

          <FlexItem>
            <Title headingLevel="h3" size="md" className="ols-aio-fleet-subcard-title">
              Noise reduction
            </Title>
          </FlexItem>

          {/* Popover — end of title row */}
          <FlexItem>
            <Popover
              headerContent="Noise reduction*"
              bodyContent={PopoverBody}
              position="right"
            >
              <button
                type="button"
                aria-label="More information about Noise reduction"
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
          7-day view &mdash; Wed spike: 465 raw signals compressed to 23 actionable plans* (20:1)
        </Content>
      </CardHeader>

      <CardBody style={{ paddingTop: 'var(--pf-t--global--spacer--sm)' }}>
        {/* Measure this div; its width drives the chart SVG width exactly. */}
        <div ref={containerRef} style={{ width: '100%' }}>
          <Chart
            ariaDesc="Area chart comparing raw ingested signals against AI-generated plans over 7 days"
            ariaTitle="Noise reduction"
            legendData={LEGEND_DATA}
            legendPosition="bottom"
            containerComponent={
              <CursorVoronoiContainer
                labels={({ datum }: { datum: DataPoint }) =>
                  datum.y !== null ? String(datum.y) : ''
                }
                labelComponent={
                  <ChartLegendTooltip
                    legendData={LEGEND_DATA}
                    title={(datum: any) => (Array.isArray(datum) ? datum[0]?.x : datum?.x) ?? ''}
                    flyoutPadding={{ top: 12, bottom: 12, left: 16, right: 16 }}
                  />
                }
                // cursorDimension="x" draws the vertical snap line; without
                // mouseFollowTooltips the cursor and tooltip both lock onto the
                // nearest day's x position instead of tracking the mouse freely.
                cursorDimension="x"
                voronoiDimension="x"
                voronoiPadding={50}
                constrainToVisibleArea
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

            {/* Series wrapped in ChartGroup so Victory assigns childName to each datum */}
            <ChartGroup>
              {/* Series 1: raw signals — muted area */}
              <ChartArea
                name={RAW_SERIES_NAME}
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
                name={AI_SERIES_NAME}
                data={aiPlansData}
                style={{
                  data: {
                    stroke: AI_COLOR,
                    strokeWidth: 3,
                  },
                }}
              />
            </ChartGroup>
          </Chart>
        </div>

      </CardBody>
    </Card>
  );
}

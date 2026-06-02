import React, { useEffect, useRef, useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Content,
  Flex,
  FlexItem,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartLine,
  ChartVoronoiContainer,
} from '@patternfly/react-charts/victory';
import { AI_EXPERIENCE_ICON_DATA_URL } from '../../components/autonomousAiObserve/aiExperienceIconUrl';

// ─── Types & mock data ────────────────────────────────────────────────────────

interface DataPoint {
  name: string;
  x: string;
  y: number;
}

const rawSignalsData: DataPoint[] = [
  { name: 'Raw signals', x: 'Mon', y: 45 },
  { name: 'Raw signals', x: 'Tue', y: 52 },
  { name: 'Raw signals', x: 'Wed', y: 340 }, // Alert storm spike
  { name: 'Raw signals', x: 'Thu', y: 120 },
  { name: 'Raw signals', x: 'Fri', y: 60 },
  { name: 'Raw signals', x: 'Sat', y: 35 },
  { name: 'Raw signals', x: 'Sun', y: 40 },
];

const aiPlansData: DataPoint[] = [
  { name: 'AI plans', x: 'Mon', y: 4 },
  { name: 'AI plans', x: 'Tue', y: 5 },
  { name: 'AI plans', x: 'Wed', y: 8 }, // 340 alerts → 8 macro plans
  { name: 'AI plans', x: 'Thu', y: 6 },
  { name: 'AI plans', x: 'Fri', y: 5 },
  { name: 'AI plans', x: 'Sat', y: 3 },
  { name: 'AI plans', x: 'Sun', y: 3 },
];

// ─── Design constants ─────────────────────────────────────────────────────────

const RAW_COLOR = '#8a8d90';
const AI_COLOR = '#0066CC';

const CHART_PADDING = { bottom: 48, left: 56, right: 16, top: 12 };

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

// ─── AI disclosure ────────────────────────────────────────────────────────────

const AI_TOOLTIP_CONTENT =
  'This chart compares raw incoming infrastructure alerts to the consolidated resolution plans orchestrated by the AI agent.';

// ─── Component ────────────────────────────────────────────────────────────────

export function SignalCompressionChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartWidth = useContainerWidth(containerRef);

  // Maintain a comfortable aspect ratio: chart grows taller as it widens,
  // clamped to a sensible range so it never feels too squat or too tall.
  const chartHeight = Math.min(300, Math.max(180, Math.round(chartWidth * 0.42)));

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
          <Title headingLevel="h3" size="md" className="ols-aio-fleet-subcard-title">
            Signal Compression Ratio
          </Title>
          <Tooltip content={AI_TOOLTIP_CONTENT} position="top">
            <span
              tabIndex={0}
              role="img"
              aria-label="AI-generated chart"
              style={{ display: 'inline-flex', alignItems: 'center', cursor: 'help', outline: 'none' }}
            >
              <img
                src={AI_EXPERIENCE_ICON_DATA_URL}
                alt=""
                aria-hidden="true"
                width={16}
                height={16}
                style={{ display: 'block' }}
              />
            </span>
          </Tooltip>
        </Flex>
        <Content
          component="p"
          style={{
            margin: '2px 0 0',
            fontSize: '12px',
            color: 'var(--pf-t--global--text--color--subtle)',
          }}
        >
          7-day view &mdash; Wed spike: 340 raw alerts compressed to 8 AI plans (42:1 ratio)
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
                labels={({ datum }: { datum: DataPoint }) => `${datum.name}: ${datum.y}`}
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

import React, { useEffect, useMemo, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, TreemapChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';

/**
 * Register charts/renderers on `echarts/core` (the same graph PatternFly Charts uses).
 * Bare `import 'echarts'` is webpack-aliased to the UMD bundle; mixing that with core
 * leaves zrender's painter map empty and throws `Renderer 'undefined' is not imported`.
 */
echarts.use([SVGRenderer, BarChart, LineChart, TreemapChart, GridComponent, TooltipComponent, LegendComponent]);

type ChartClickParams = {
  data?: {
    children?: unknown;
    podName?: string;
  };
};

export const EchartsOptionChart: React.FC<{
  option: EChartsOption;
  height: number;
  onChartClick?: (params: ChartClickParams) => void;
}> = ({ option, height, onChartClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return undefined;
    }

    const chart = echarts.init(el, undefined, { renderer: 'svg', height });
    chart.setOption(option, { notMerge: true });

    if (onChartClick) {
      chart.on('click', (params) => {
        const data = params.data;
        onChartClick({
          data:
            data && typeof data === 'object'
              ? (data as NonNullable<ChartClickParams['data']>)
              : undefined
        });
      });
    }

    const resize = () => chart.resize();
    window.addEventListener('resize', resize);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    observer?.observe(el);
    const raf = window.requestAnimationFrame(resize);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      observer?.disconnect();
      chart.off('click');
      chart.dispose();
    };
  }, [option, height, onChartClick]);

  return <div ref={containerRef} style={{ width: '100%', height, minWidth: 0 }} />;
};

const CHAT_CPU_NAMESPACE_DATA = [
  { x: 'marketing-prod', y: 45 },
  { x: 'sales-prod', y: 32 },
  { x: 'support-prod', y: 23 }
];

/** Bar chart shown in the OLS chat after "Analyze root cause". */
export const ChatCpuNamespaceBarChart: React.FC = () => {
  const option = useMemo<EChartsOption>(
    () => ({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: unknown) => {
          const param = Array.isArray(params) ? params[0] : params;
          const point = param as { name?: string; value?: number };
          return `${point.name}<br/>CPU Usage: ${point.value}%`;
        }
      },
      grid: {
        left: '60px',
        right: '20px',
        bottom: '100px',
        top: '20px',
        containLabel: false
      },
      xAxis: {
        type: 'category',
        data: CHAT_CPU_NAMESPACE_DATA.map((d) => d.x),
        name: 'Namespace',
        nameLocation: 'middle',
        nameGap: 80,
        nameTextStyle: {
          color: 'var(--pf-t--global--text--color--default)'
        },
        axisLabel: {
          color: 'var(--pf-t--global--text--color--default)',
          formatter: (value: string) => (value.length > 12 ? `${value.substring(0, 12)}...` : value),
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: 'CPU Usage (%)',
        nameLocation: 'middle',
        nameGap: 50,
        nameTextStyle: {
          color: 'var(--pf-t--global--text--color--default)'
        },
        axisLabel: {
          color: 'var(--pf-t--global--text--color--default)',
          formatter: '{value}%'
        }
      },
      series: [
        {
          name: 'CPU Usage',
          type: 'bar',
          data: CHAT_CPU_NAMESPACE_DATA.map((d) => d.y),
          label: {
            show: true,
            position: 'top',
            formatter: '{c}%',
            color: 'var(--pf-t--global--text--color--default)'
          },
          itemStyle: {
            color: 'var(--pf-t--chart--color--blue--300, #0066cc)'
          }
        }
      ]
    }),
    []
  );

  return <EchartsOptionChart option={option} height={200} />;
};

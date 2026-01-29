import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  Title,
  Content,
  Breadcrumb,
  BreadcrumbItem,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelContent,
  DrawerPanelBody,
  DrawerHead,
  DrawerActions,
  DrawerCloseButton,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Button,
  SearchInput,
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  Badge,
  Label,
  LabelGroup,
  Flex,
  FlexItem,
  Pagination,
  PaginationVariant,
  Tooltip,
  TextInput,
  Stack,
  StackItem,
  ExpandableSection,
  Bullseye,
  Alert,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateActions,
  Card,
  CardTitle,
  CardBody,
  CardHeader,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Grid,
  GridItem,
  Icon,
  Spinner,
} from '@patternfly/react-core';
import {
  UserIcon,
  RobotIcon,
  FilterIcon,
  StarIcon,
  EllipsisVIcon,
  CaretDownIcon,
  TimesIcon,
  MicrophoneIcon,
  PaperPlaneIcon,
  PlusIcon,
  BellIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  ExternalLinkAltIcon,
  AngleRightIcon,
  CubesIcon,
  ServerIcon,
  CpuIcon,
  ClockIcon,
} from '@patternfly/react-icons';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@patternfly/react-table';
import {
  ChartBar,
  ChartGroup,
  ChartAxis,
  ChartThemeColor,
  ChartArea,
  ChartLine,
  ChartDonut,
  ChartLegend,
  ChartVoronoiContainer,
  ChartDonutUtilization,
  ChartDonutThreshold,
  ChartContainer,
  ChartLabel,
} from '@patternfly/react-charts/victory';
import { Charts } from '@patternfly/react-charts/echarts';
import Chatbot, { ChatbotDisplayMode } from '@patternfly/chatbot/dist/dynamic/Chatbot';
import ChatbotContent from '@patternfly/chatbot/dist/dynamic/ChatbotContent';
import ChatbotWelcomePrompt from '@patternfly/chatbot/dist/dynamic/ChatbotWelcomePrompt';
import ChatbotFooter, { ChatbotFootnote } from '@patternfly/chatbot/dist/dynamic/ChatbotFooter';
import ChatbotToggle from '@patternfly/chatbot/dist/dynamic/ChatbotToggle';
import { MessageBar } from '@patternfly/chatbot/dist/dynamic/MessageBar';
import { MessageBox } from '@patternfly/chatbot/dist/dynamic/MessageBox';
import Message, { MessageProps } from '@patternfly/chatbot/dist/dynamic/Message';
import ChatbotHeader, {
  ChatbotHeaderMenu,
  ChatbotHeaderMain,
  ChatbotHeaderTitle,
  ChatbotHeaderActions,
  ChatbotHeaderSelectorDropdown
} from '@patternfly/chatbot/dist/dynamic/ChatbotHeader';
import '@patternfly/chatbot/dist/css/main.css';
import './dashboards-perses.css';

// Import custom profile images
import userProfilePicUrl from '../assets/user-profile.png';
import botProfilePicUrl from '../assets/bot-profile.png';

// Helper function to create SVG data URL
const createIconDataUrl = (svgContent: string): string => {
  const encoded = encodeURIComponent(svgContent);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
};

// Simple SVG icons as data URLs
// User icon - simple person silhouette
const userIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="64" height="64">
  <path fill="currentColor" d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"/>
</svg>`;

// Robot icon - simple robot head
const robotIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="64" height="64">
  <path fill="currentColor" d="M32 224h32v192H32c-17.7 0-32-14.3-32-32V256c0-17.7 14.3-32 32-32zm544-32c17.7 0 32 14.3 32 32v128c0 17.7-14.3 32-32 32h-32V224h32zm-120 96c0 4.4-3.6 8-8 8h-16c-4.4 0-8-3.6-8-8v-64c0-4.4 3.6-8 8-8h16c4.4 0 8 3.6 8 8v64zm192 0c0 4.4-3.6 8-8 8h-16c-4.4 0-8-3.6-8-8v-64c0-4.4 3.6-8 8-8h16c4.4 0 8 3.6 8 8v64zM592 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h544c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zM160 368H64v-64h96v64zm0-128H64v-64h96v64zm160 128h-96v-64h96v64zm0-128h-96v-64h96v64zm160 128h-96v-64h96v64zm0-128h-96v-64h96v64z"/>
</svg>`;

// Avatar configuration - use custom images, fallback to icon data URLs if images fail to load
const userAvatarSrc = userProfilePicUrl || createIconDataUrl(userIconSvg);
const botAvatarSrc = botProfilePicUrl || createIconDataUrl(robotIconSvg);

// Welcome prompts will be defined inside the component to access handleSendMessage

// Footnote props for ChatbotFootnote
const footnoteProps = {
  label: 'ChatBot uses AI. Check for mistakes.',
  popover: {
    title: 'Verify accuracy',
    description: `While ChatBot strives for accuracy, there's always a possibility of errors. It's a good practice to verify critical information from reliable sources, especially if it's crucial for decision-making or actions.`,
    cta: {
      label: 'Got it',
      onClick: () => {
        // Handle footnote CTA
      }
    }
  }
};

/**
 * Dashboard interface
 */
interface Dashboard {
  id: string;
  name: string;
  project: string;
  type: 'Global-scoped' | 'Project-scoped';
  createdBy: string;
  labels: string[];
  createdOn: string;
  lastModified: string;
}

// Troubleshooting Dashboard Component
const TroubleshootingDashboard: React.FC = () => {
  // Mock data for the dashboard
  const inventoryData = {
    totalNodes: 12,
    totalCpuCores: 96,
    runningPods: 247,
    pendingPods: 8
  };

  // Get current time for "Last updated"
  const getLastUpdatedTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };

  // CPU Quota vs Actual data (in cores)
  const cpuQuotaData = [
    { x: '00:00', y: 82 },
    { x: '04:00', y: 88 },
    { x: '08:00', y: 94 },
    { x: '12:00', y: 101 },
    { x: '16:00', y: 108 },
    { x: '20:00', y: 110 }
  ];

  const cpuActualData = [
    { x: '00:00', y: 69 },
    { x: '04:00', y: 75 },
    { x: '08:00', y: 79 },
    { x: '12:00', y: 84 },
    { x: '16:00', y: 87 },
    { x: '20:00', y: 90 }
  ];

  const topNamespacesData = [
    { namespace: 'marketing-prod', cpu: 45 },
    { namespace: 'sales-prod', cpu: 32 },
    { namespace: 'support-prod', cpu: 23 },
    { namespace: 'dev-staging', cpu: 18 },
    { namespace: 'qa-testing', cpu: 15 },
    { namespace: 'monitoring', cpu: 12 },
    { namespace: 'logging', cpu: 10 },
    { namespace: 'security', cpu: 8 },
    { namespace: 'backup', cpu: 6 },
    { namespace: 'default', cpu: 4 }
  ];

  // Node Resource Pressure data - 12 nodes with mixed statuses
  const nodePressureData = [
    { node: 'node-pool-1-abc', cpu: 105, status: 'critical' }, // Overcommit - Red
    { node: 'node-pool-2-abc', cpu: 98, status: 'warning' },   // High - Gold
    { node: 'node-pool-3-abc', cpu: 92, status: 'warning' },  // High - Gold
    { node: 'node-pool-4-abc', cpu: 87, status: 'warning' },  // High - Gold
    { node: 'node-pool-5-abc', cpu: 78, status: 'healthy' },  // Normal - Blue
    { node: 'node-pool-6-abc', cpu: 65, status: 'healthy' },  // Normal - Blue
    { node: 'node-pool-7-abc', cpu: 82, status: 'healthy' },   // Normal - Blue
    { node: 'node-pool-8-abc', cpu: 95, status: 'warning' },  // High - Gold
    { node: 'node-pool-9-abc', cpu: 72, status: 'healthy' },  // Normal - Blue
    { node: 'node-pool-10-abc', cpu: 88, status: 'warning' }, // High - Gold
    { node: 'node-pool-11-abc', cpu: 110, status: 'critical' }, // Overcommit - Red
    { node: 'node-pool-12-abc', cpu: 68, status: 'healthy' }   // Normal - Blue
  ];

  // Pod Status Health Map mock data (counts per namespace)
  const podStatusCounts: Record<string, { running: number; pending: number; failed: number; unknown: number }> = {
    'marketing-prod': { running: 51, pending: 8, failed: 2, unknown: 2 },
    'sales-prod': { running: 24, pending: 0, failed: 1, unknown: 0 },
    'support-prod': { running: 68, pending: 0, failed: 1, unknown: 0 },
    'dev-staging': { running: 29, pending: 0, failed: 1, unknown: 0 },
    'qa-testing': { running: 46, pending: 0, failed: 1, unknown: 0 }
  };

  const STATUS_COLORS: Record<string, string> = {
    Running: '#3E8635',
    Pending: '#F0AB00',
    Failed: '#C9190B',
    Unknown: '#8A8D90'
  };

  const buildPodsForNamespace = (namespace: string): Array<{ podName: string; status: string }> => {
    const counts = podStatusCounts[namespace] || { running: 0, pending: 0, failed: 0, unknown: 0 };
    const pods: Array<{ podName: string; status: string }> = [];
    let idx = 0;
    (['Failed', 'Unknown', 'Pending', 'Running'] as const).forEach((status) => {
      const count = counts[status === 'Failed' ? 'failed' : status === 'Unknown' ? 'unknown' : status === 'Pending' ? 'pending' : 'running'];
      for (let i = 0; i < count; i++) {
        pods.push({ podName: `pod-${namespace.replace(/-/g, '')}-${idx}`, status });
        idx += 1;
      }
    });
    return pods;
  };

  const PodStatusHealthMapLegend: React.FC = () => (
    <Flex gap={{ default: 'gapMd' }} style={{ flexWrap: 'wrap' }}>
      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
        <div style={{ width: 12, height: 12, backgroundColor: '#3E8635', flexShrink: 0 }} aria-hidden />
        <span>Running</span>
      </Flex>
      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
        <div style={{ width: 12, height: 12, backgroundColor: '#F0AB00', flexShrink: 0 }} aria-hidden />
        <span>Pending</span>
      </Flex>
      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
        <div style={{ width: 12, height: 12, backgroundColor: '#C9190B', flexShrink: 0 }} aria-hidden />
        <span>Failed</span>
      </Flex>
      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
        <div style={{ width: 12, height: 12, backgroundColor: '#8A8D90', flexShrink: 0 }} aria-hidden />
        <span>Unknown</span>
      </Flex>
    </Flex>
  );

  const PodStatusHealthMap: React.FC = () => (
    <DescriptionList isCompact>
      {Object.keys(podStatusCounts).map((namespace) => {
        const pods = buildPodsForNamespace(namespace);
        return (
          <DescriptionListGroup key={namespace}>
            <DescriptionListTerm style={{ marginBottom: '4px', minWidth: '120px' }}>{namespace}</DescriptionListTerm>
            <DescriptionListDescription>
              <Flex style={{ flexWrap: 'wrap', alignItems: 'center', gap: 'var(--pf-t--global--spacer--xs, 4px)' }}>
                {pods.map((pod, i) => (
                  <Tooltip key={`${namespace}-${i}`} content={<div>Pod: {pod.podName}<br />Status: {pod.status}</div>}>
                    <div
                      role="img"
                      aria-label={`${pod.podName} - ${pod.status}`}
                      style={{
                        width: 12,
                        height: 12,
                        backgroundColor: STATUS_COLORS[pod.status] || '#8A8D90',
                        flexShrink: 0
                      }}
                    />
                  </Tooltip>
                ))}
              </Flex>
            </DescriptionListDescription>
          </DescriptionListGroup>
        );
      })}
    </DescriptionList>
  );

  const cpuCommitmentPercent = 115;
  const throttledContainers = 23;
  
  // Mock data for CPU cores (in a real implementation, this would come from PromQL queries)
  const requestedCores = 110; // Calculated from: sum(kube_pod_container_resource_requests{resource="cpu"})
  const totalCores = 96; // Calculated from: sum(kube_node_status_capacity{resource="cpu"})
  
  // Mock data for throttled containers sparkline (last hour, 12 data points = 5-minute intervals)
  const throttledContainersSparklineData = [
    { name: 'Throttled Containers', x: '0', y: 15 },
    { name: 'Throttled Containers', x: '5', y: 18 },
    { name: 'Throttled Containers', x: '10', y: 22 },
    { name: 'Throttled Containers', x: '15', y: 20 },
    { name: 'Throttled Containers', x: '20', y: 25 },
    { name: 'Throttled Containers', x: '25', y: 23 },
    { name: 'Throttled Containers', x: '30', y: 21 },
    { name: 'Throttled Containers', x: '35', y: 24 },
    { name: 'Throttled Containers', x: '40', y: 22 },
    { name: 'Throttled Containers', x: '45', y: 20 },
    { name: 'Throttled Containers', x: '50', y: 23 },
    { name: 'Throttled Containers', x: '55', y: 23 },
  ];
  
  // Throttled Container Stat Component with Sparkline
  const ThrottledContainerStat: React.FC = () => {
    const [sparklineWidth, setSparklineWidth] = React.useState(300);
    const sparklineContainerRef = React.useRef<HTMLDivElement>(null);
    
    // Make sparkline responsive
    React.useEffect(() => {
      const updateWidth = () => {
        if (sparklineContainerRef.current) {
          const width = sparklineContainerRef.current.offsetWidth;
          setSparklineWidth(Math.max(width - 40, 200)); // Min 200px, with padding
        }
      };
      
      updateWidth();
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }, []);
    
    return (
      <Flex direction={{ default: 'column' }} style={{ height: '100%', width: '100%' }}>
        {/* Large numeric display with regular text color */}
        <FlexItem>
          <Tooltip content="The number of containers currently being restricted by the CPU scheduler due to reaching their limit.">
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} justifyContent={{ default: 'justifyContentCenter' }}>
              <Title 
                headingLevel="h2" 
                size="3xl" 
                style={{ 
                  color: 'var(--pf-t--global--text--color--default)',
                  marginBottom: '8px'
                }}
              >
                {throttledContainers}
              </Title>
            </Flex>
          </Tooltip>
        </FlexItem>
        
        {/* Sparkline chart - Compact size with PatternFly blue */}
        <FlexItem style={{ marginTop: '16px' }}>
          <div ref={sparklineContainerRef} style={{ height: '60px', width: '100%', overflow: 'hidden' }}>
            <ChartGroup
              ariaDesc="Throttled container count trend over the last hour"
              ariaTitle="Throttled Container Trend"
              containerComponent={
                <ChartVoronoiContainer 
                  labels={({ datum }) => `${datum.y} containers`} 
                  constrainToVisibleArea 
                />
              }
              height={60}
              maxDomain={{ y: Math.max(...throttledContainersSparklineData.map(d => d.y)) + 5 }}
              minDomain={{ y: 0 }}
              name="throttled-containers-sparkline"
              padding={0}
              themeColor={ChartThemeColor.blue}
              width={sparklineWidth}
            >
              <ChartArea 
                data={throttledContainersSparklineData}
                style={{
                  data: {
                    fill: '#0066cc',
                    stroke: '#0066cc',
                    strokeWidth: 2
                  }
                }}
              />
            </ChartGroup>
          </div>
        </FlexItem>
        
        {/* PromQL query */}
        <FlexItem style={{ marginTop: '8px' }}>
          <Content component="small" className="pf-v6-u-color-200" style={{ textAlign: 'center' }}>
            count(rate(container_cpu_cfs_throttled_seconds_total[5m]) &gt; 0)
          </Content>
        </FlexItem>
      </Flex>
    );
  };
  
  // Top 10 Resource-Heavy Namespaces Chart Component using ECharts
  const TopNamespacesChart: React.FC = () => {
    // Prepare data for ECharts horizontal bar chart
    const namespaces = topNamespacesData.map(ns => ns.namespace);
    const cpuValues = topNamespacesData.map(ns => ns.cpu);
    const chartRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      // Post-process to apply transform to Namespace label after chart renders
      const applyTransform = () => {
        if (chartRef.current) {
          const svg = chartRef.current.querySelector('svg');
          if (svg) {
            const textElements = svg.querySelectorAll('text');
            textElements.forEach((text: Element) => {
              const textContent = text.textContent?.trim();
              if (textContent === 'Namespace') {
                (text as SVGTextElement).setAttribute('y', '-5.1100006103515625');
                (text as SVGTextElement).setAttribute('transform', 'matrix(0,-1,1,0,10,100.89)');
              }
            });
          }
        }
      };

      // Wait for chart to render
      const timeoutId = setTimeout(applyTransform, 100);
      
      // Also try with MutationObserver for dynamic updates
      if (chartRef.current) {
        const observer = new MutationObserver(applyTransform);
        observer.observe(chartRef.current, { childList: true, subtree: true });
        
        return () => {
          clearTimeout(timeoutId);
          observer.disconnect();
        };
      }
      
      return () => clearTimeout(timeoutId);
    }, [namespaces, cpuValues]);

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const param = params[0];
          return `${param.name}<br/>CPU Usage: ${param.value}%`;
        }
      },
      grid: {
        left: '140px',
        right: '20px',
        bottom: '50px',
        top: '20px',
        containLabel: false
      },
      xAxis: {
        type: 'value',
        name: 'CPU Usage (%)',
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: {
          color: 'var(--pf-t--global--text--color--default)'
        },
        axisLabel: {
          color: 'var(--pf-t--global--text--color--default)',
          formatter: '{value}%'
        }
      },
      yAxis: {
        type: 'category',
        data: namespaces,
        name: 'Namespace',
        nameLocation: 'middle',
        nameGap: 50,
        nameTextStyle: {
          color: 'var(--pf-t--global--text--color--default)'
        },
        axisLabel: {
          color: 'var(--pf-t--global--text--color--default)',
          formatter: (value: string) => {
            return value.length > 12 ? `${value.substring(0, 12)}...` : value;
          }
        }
      },
      series: [
        {
          name: 'CPU Usage',
          type: 'bar',
          data: cpuValues,
          label: {
            show: true,
            position: 'right',
            formatter: '{c}%',
            color: 'var(--pf-t--global--text--color--default)'
          },
          itemStyle: {
            color: '#0066cc'
          }
        }
      ]
    };

    return (
      <div ref={chartRef} style={{ width: '100%', height: '250px' }}>
        <Charts
          height={250}
          option={option}
        />
      </div>
    );
  };

  // CPU Quota vs Actual Chart Component using ECharts
  const CPUQuotaVsActualChart: React.FC = () => {
    // Prepare data for ECharts
    const timeLabels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
    const quotaValues = [82, 88, 94, 101, 108, 110];
    const actualValues = [69, 75, 79, 84, 87, 90];

    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const time = params[0].axisValue;
          const quota = params.find((p: any) => p.seriesName === 'Requested Quota');
          const actual = params.find((p: any) => p.seriesName === 'Actual Usage');
          return [
            `Time: ${time}`,
            `Requested Quota: ${quota?.value} Cores`,
            `Actual Usage: ${actual?.value} Cores`
          ].join('<br/>');
        }
      },
      legend: {
        data: ['Requested Quota', 'Actual Usage'],
        bottom: 0,
        orient: 'horizontal',
        itemGap: 40,
        itemWidth: 25,
        itemHeight: 14,
        textStyle: {
          fontSize: 14
        },
        left: 'center'
      },
      grid: {
        left: '60px',
        right: '20px',
        bottom: '50px',
        top: '20px',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: timeLabels,
        name: 'Time',
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: {
          color: 'var(--pf-t--global--text--color--default)'
        },
        axisLabel: {
          color: 'var(--pf-t--global--text--color--default)'
        }
      },
      yAxis: {
        type: 'value',
        name: 'Cores',
        nameLocation: 'middle',
        nameGap: 50,
        nameTextStyle: {
          color: 'var(--pf-t--global--text--color--default)'
        },
        axisLabel: {
          color: 'var(--pf-t--global--text--color--default)'
        }
      },
      series: [
        {
          name: 'Actual Usage',
          type: 'line',
          data: actualValues,
          areaStyle: {
            color: '#0066cc',
            opacity: 0.3
          },
          lineStyle: {
            color: '#0066cc',
            width: 2
          },
          itemStyle: {
            color: '#0066cc'
          }
        },
        {
          name: 'Requested Quota',
          type: 'line',
          data: quotaValues,
          lineStyle: {
            color: '#C66B25',
            width: 2,
            type: 'dashed'
          },
          itemStyle: {
            color: '#C66B25'
          },
          areaStyle: {
            opacity: 0
          }
        }
      ]
    };

    return (
      <div style={{ width: '100%', height: '250px' }}>
        <Charts
          height={250}
          option={option}
        />
      </div>
    );
  };
  
  // CPU Commitment Donut Component
  const CPUCommitmentDonut: React.FC = () => {
    // Cap the visual fill at 100% but show actual percentage in center
    const visualPercent = Math.min(cpuCommitmentPercent, 100);
    
    // Static thresholds: 85% (warning) and 100% (danger)
    const thresholdData = [
      { x: 'Warning at 85%', y: 85 },
      { x: 'Danger at 100%', y: 100 }
    ];
    
    const utilizationData = { 
      x: 'CPU Request Commitment', 
      y: visualPercent 
    };
    
    // Determine theme color based on thresholds: Green < 85%, Gold 85-100%, Red > 100%
    // ChartDonutUtilization will automatically change color based on thresholds
    const getThemeColor = () => {
      if (cpuCommitmentPercent > 100) {
        // Use red-orange theme for overcommitment (PatternFly uses red-orange for failure)
        // Since ChartThemeColor.red doesn't exist, we'll use a custom colorScale
        return null; // Will use colorScale instead
      } else if (cpuCommitmentPercent >= 85) {
        return ChartThemeColor.gold;
      } else {
        return ChartThemeColor.green;
      }
    };
    
    const themeColor = getThemeColor();
    
    // For values over 100%, use colorScale with red color
    // PatternFly red color: #c9190b (from PatternFly color palette)
    const colorScale = cpuCommitmentPercent > 100 
      ? ['#c9190b', '#d2d2d2']
      : undefined;
    
    return (
      <div style={{ height: '230px', width: '230px', margin: '0 auto' }}>
        <ChartDonutThreshold
          ariaDesc="CPU Request Commitment percentage with static thresholds at 85% and 100%"
          ariaTitle="CPU Request Commitment Donut Chart"
          constrainToVisibleArea
          data={thresholdData}
          labels={({ datum }) => (datum.x ? datum.x : null)}
          name="cpu-commitment-threshold"
        >
          <ChartDonutUtilization
            ariaDesc="CPU Request Commitment utilization"
            ariaTitle="CPU Request Commitment"
            data={utilizationData}
            labels={({ datum }) => (datum.x ? `${datum.x}: ${datum.y}%` : null)}
            subTitle={`${requestedCores} / ${totalCores} Cores`}
            title={`${cpuCommitmentPercent}%`}
            name="cpu-commitment-utilization"
            themeColor={themeColor || undefined}
            colorScale={colorScale}
            thresholds={[{ value: 85 }, { value: 100 }]}
            height={230}
            width={230}
          />
        </ChartDonutThreshold>
      </div>
    );
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      padding: '24px',
      boxSizing: 'border-box',
      backgroundColor: 'var(--pf-v5-global--BackgroundColor--100)'
    }}>
      <Stack hasGutter>
        {/* Header */}
        <StackItem>
          <Breadcrumb>
            <BreadcrumbItem to="#" onClick={() => window.location.reload()}>
              Dashboards
            </BreadcrumbItem>
            <BreadcrumbItem isActive>Investigation Room: KubeCPUOvercommit</BreadcrumbItem>
          </Breadcrumb>
          <Title headingLevel="h1" size="2xl" style={{ marginTop: '16px', marginBottom: '8px' }}>
            Investigation Room: KubeCPUOvercommit
          </Title>
          <Content>
            <p>Temporary troubleshooting dashboard for marketing-prod namespace</p>
          </Content>
        </StackItem>

        {/* Inventory Bar */}
        <StackItem>
          <Card>
            <CardHeader>
              <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                <FlexItem>
                  <CardTitle>Cluster Resource Health Summary</CardTitle>
                </FlexItem>
                <FlexItem>
                  <Content component="small" className="pf-v6-u-color-200">
                    Last updated: {getLastUpdatedTime()}
                  </Content>
                </FlexItem>
              </Flex>
            </CardHeader>
            <CardBody>
              <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsStretch' }} gap={{ default: 'gapLg' }}>
                <FlexItem flex={{ default: 'flex_1' }}>
                  <Flex direction={{ default: 'column' }} gap={{ default: 'gapSm' }}>
                    <FlexItem>
                      <Content component="small" className="pf-v6-u-color-200">TOTAL NODES</Content>
                    </FlexItem>
                    <FlexItem>
                      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                        <Icon><ServerIcon /></Icon>
                        <Title headingLevel="h2" size="3xl">{inventoryData.totalNodes}</Title>
                      </Flex>
                    </FlexItem>
                  </Flex>
                </FlexItem>
                <FlexItem flex={{ default: 'flex_1' }}>
                  <Flex direction={{ default: 'column' }} gap={{ default: 'gapSm' }}>
                    <FlexItem>
                      <Content component="small" className="pf-v6-u-color-200">TOTAL CPU CORES</Content>
                    </FlexItem>
                    <FlexItem>
                      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                        <Icon><CpuIcon /></Icon>
                        <Title headingLevel="h2" size="3xl">{inventoryData.totalCpuCores}</Title>
                      </Flex>
                    </FlexItem>
                  </Flex>
                </FlexItem>
                <FlexItem flex={{ default: 'flex_1' }}>
                  <Flex direction={{ default: 'column' }} gap={{ default: 'gapSm' }}>
                    <FlexItem>
                      <Content component="small" className="pf-v6-u-color-200">RUNNING PODS</Content>
                    </FlexItem>
                    <FlexItem>
                      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                        <Icon><CubesIcon /></Icon>
                        <Title headingLevel="h2" size="3xl">{inventoryData.runningPods}</Title>
                      </Flex>
                    </FlexItem>
                  </Flex>
                </FlexItem>
                <FlexItem flex={{ default: 'flex_1' }}>
                  <div style={{ 
                    borderLeft: '4px solid var(--pf-v6-global--palette--orange-300)',
                    paddingLeft: '16px',
                    height: '100%'
                  }}>
                    <Flex direction={{ default: 'column' }} gap={{ default: 'gapSm' }}>
                      <FlexItem>
                        <Content component="small" className="pf-v6-u-color-200">PENDING PODS</Content>
                      </FlexItem>
                      <FlexItem>
                        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                          <Icon status="warning"><ExclamationTriangleIcon /></Icon>
                          <Title headingLevel="h2" size="3xl" className="pf-v6-u-warning-color-100">{inventoryData.pendingPods}</Title>
                        </Flex>
                      </FlexItem>
                    </Flex>
                  </div>
                </FlexItem>
              </Flex>
            </CardBody>
          </Card>
        </StackItem>

        {/* Metrics Cards Grid */}
        <StackItem>
          <Grid hasGutter>
            {/* CPU Request Commitment % - Smoking Gun */}
            <GridItem md={6}>
              <Card isFullHeight>
                <CardHeader>
                  <CardTitle>CPU Request Commitment %</CardTitle>
                </CardHeader>
                <CardBody>
                  <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }} style={{ height: '100%', justifyContent: 'center' }}>
                    <CPUCommitmentDonut />
                    <Content component="small" className="pf-v6-u-color-200" style={{ marginTop: '16px', textAlign: 'center' }}>
                      {'(sum(kube_pod_container_resource_requests{resource="cpu"}) / sum(kube_node_status_capacity{resource="cpu"})) * 100'}
                    </Content>
                  </Flex>
                </CardBody>
              </Card>
            </GridItem>

            {/* Throttled Container Count */}
            <GridItem md={6}>
              <Card isFullHeight>
                <CardHeader>
                  <CardTitle>Throttled Container Count</CardTitle>
                </CardHeader>
                <CardBody>
                  <ThrottledContainerStat />
                </CardBody>
              </Card>
            </GridItem>

            {/* CPU Quota vs. Actual */}
            <GridItem md={6}>
              <Card isFullHeight>
                <CardHeader>
                  <CardTitle>CPU Quota vs. Actual</CardTitle>
                </CardHeader>
                <CardBody>
                  <CPUQuotaVsActualChart />
                </CardBody>
              </Card>
            </GridItem>

            {/* Top 10 Resource-Heavy Namespaces */}
            <GridItem md={6}>
              <Card isFullHeight>
                <CardHeader>
                  <CardTitle>Top 10 Resource-Heavy Namespaces</CardTitle>
                </CardHeader>
                <CardBody>
                  <TopNamespacesChart />
                </CardBody>
              </Card>
            </GridItem>

            {/* Node Resource Pressure */}
            <GridItem md={12}>
              <Card>
                <CardHeader>
                  <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>
                      <CardTitle>Node Resource Pressure</CardTitle>
                    </FlexItem>
                    <FlexItem>
                      <ChartLegend
                        data={[
                          { name: 'Critical (overcommit)', symbol: { type: 'square', fill: '#c9190b' } },
                          { name: 'Warning (high)', symbol: { type: 'square', fill: '#f0ab00' } },
                          { name: 'Healthy (normal)', symbol: { type: 'square', fill: '#3E8635' } }
                        ]}
                        orientation="horizontal"
                        height={25}
                        style={{
                          labels: { fontSize: 14 }
                        }}
                      />
                    </FlexItem>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <Grid hasGutter>
                    {nodePressureData.map((node) => {
                      // Determine color based on status
                      const getThemeColor = () => {
                        if (node.status === 'critical') {
                          return null; // Use colorScale for red
                        } else if (node.status === 'warning') {
                          return ChartThemeColor.gold;
                        } else {
                          return null; // Use colorScale for green
                        }
                      };

                      const themeColor = getThemeColor();
                      const visualPercent = Math.min(node.cpu, 100);
                      const colorScale = node.status === 'critical'
                        ? ['#c9190b', '#d2d2d2'] // PatternFly red and gray
                        : node.status === 'healthy'
                        ? ['#3E8635', '#d2d2d2'] // PatternFly green and gray
                        : undefined;

                      // Threshold data for static thresholds - must be array format
                      const thresholdData = [
                        { x: 'Warning at 85%', y: 85 },
                        { x: 'Critical at 100%', y: 100 }
                      ];

                      // Utilization data - ChartDonutUtilization expects { x, y } format
                      const utilizationData = { x: 'CPU Usage', y: visualPercent };

                      return (
                        <GridItem key={node.node} md={3}>
                          <Card>
                            <CardBody>
                              <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                <Title headingLevel="h4" size="md">
                                  {node.node}
                                </Title>
                                <div style={{ height: '180px', width: '180px', margin: '0 auto' }}>
                                  <ChartDonutThreshold
                                    ariaDesc={`CPU utilization for ${node.node} with static thresholds at 85% and 100%`}
                                    ariaTitle={`${node.node} CPU Utilization`}
                                    constrainToVisibleArea
                                    data={thresholdData}
                                    labels={({ datum }) => (datum.x ? datum.x : null)}
                                    name={`${node.node}-threshold`}
                                    height={180}
                                    width={180}
                                  >
                                    <ChartDonutUtilization
                                      ariaDesc={`CPU utilization for ${node.node}`}
                                      ariaTitle={`${node.node} CPU Utilization`}
                                      data={utilizationData}
                                      labels={({ datum }) => (datum.x ? `${datum.x}: ${datum.y}%` : null)}
                                      subTitle="CPU Usage"
                                      title={`${node.cpu}%`}
                                      name={`${node.node}-utilization`}
                                      themeColor={themeColor || undefined}
                                      colorScale={colorScale}
                                      thresholds={[{ value: 85 }, { value: 100 }]}
                                      height={180}
                                      width={180}
                                    />
                                  </ChartDonutThreshold>
                                </div>
                              </Flex>
                            </CardBody>
                          </Card>
                        </GridItem>
                      );
                    })}
                  </Grid>
                </CardBody>
              </Card>
            </GridItem>

            {/* Pod Status Heatmap - Health Map (Status Grid) */}
            <GridItem md={12}>
              <Card>
                <CardHeader>
                  <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>
                      <CardTitle>Pod Status Heatmap</CardTitle>
                    </FlexItem>
                    <FlexItem>
                      <PodStatusHealthMapLegend />
                    </FlexItem>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <PodStatusHealthMap />
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        </StackItem>
      </Stack>
    </div>
  );
};

/**
 * Dashboards (Perses) Page
 * 
 * This page displays the PatternFly AI compact chatbot for Perses dashboards.
 * Based on the PatternFly compact chatbot demo pattern.
 */
export const DashboardsPersesPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Granite 7B');
  const [isSendButtonDisabled, setIsSendButtonDisabled] = useState(false);
  const [announcement, setAnnouncement] = useState<string>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatbotToggleRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLButtonElement>(null);

  // Table state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isNameFilterOpen, setIsNameFilterOpen] = useState(false);
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState('All projects');
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  // Notifications drawer state
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] = useState(false);
  const [isCriticalAlertsExpanded, setIsCriticalAlertsExpanded] = useState(false);
  const [isOtherAlertsExpanded, setIsOtherAlertsExpanded] = useState(false);
  const [isRecommendationsExpanded, setIsRecommendationsExpanded] = useState(false);

  // Troubleshooting workflow state
  const [workflowStage, setWorkflowStage] = useState<'idle' | 'stage1' | 'stage2' | 'stage3' | 'stage4'>('idle');
  const [showTroubleshootingDashboard, setShowTroubleshootingDashboard] = useState(false);
  const [isGeneratingDashboard, setIsGeneratingDashboard] = useState(false);

  // Mock notifications data
  const criticalAlerts: Array<{ id: string; name: string; severity: string; duration: string; description?: string }> = [
    {
      id: '1',
      name: 'KubeCPUOvercommit',
      severity: 'Critical',
      duration: '1h 30m',
      description: 'Cluster-wide CPU requests have exceeded the total available capacity. New pods cannot be scheduled, and existing workloads may experience performance degradation or throttling if they attempt to utilize their defined CPU limits.'
    }
  ];
  const otherAlerts: Array<{ id: string; name: string; severity: string; duration: string; description?: string }> = [
    { id: '1', name: 'ClusterAutoscalerUnableToScale', severity: 'Warning', duration: '2h 15m' },
    { id: '2', name: 'NodeMemoryHigh', severity: 'Info', duration: '45m' },
  ];
  const recommendations: Array<{ id: string; title: string; message: string; actionLabel: string; actionUrl: string }> = [
    {
      id: '1',
      title: 'This cluster is not supported.',
      message: 'Your 60-day self-support trial will end in 59 day on Mar 21, 2026.s For continued support, upgrade your cluster or transfer cluster ownership to an account with an active subscription.',
      actionLabel: 'Get support',
      actionUrl: '#',
    },
  ];

  // Auto-expand critical alerts section if there are critical alerts
  useEffect(() => {
    if (criticalAlerts.length > 0) {
      setIsCriticalAlertsExpanded(true);
    }
  }, [criticalAlerts.length]);

  // Sample dashboard data
  const allDashboards: Dashboard[] = [
    {
      id: '1',
      name: 'dashboard-1',
      project: 'project-1',
      type: 'Global-scoped',
      createdBy: 'kube:admin',
      labels: ['category: infrastructure', 'task: resource-consumption'],
      createdOn: 'Jun 5, 2025, 1:25 AM',
      lastModified: 'Jun 5, 2025, 1:25 AM',
    },
    {
      id: '2',
      name: 'alerts-overview',
      project: 'project 2',
      type: 'Project-scoped',
      createdBy: 'j.doe',
      labels: ['component: observability'],
      createdOn: 'Jun 4, 2025, 3:15 PM',
      lastModified: 'Jun 4, 2025, 3:15 PM',
    },
    {
      id: '3',
      name: 'dashboard-3',
      project: 'project-1',
      type: 'Global-scoped',
      createdBy: 'kube:admin',
      labels: ['category: infrastructure'],
      createdOn: 'Jun 3, 2025, 10:00 AM',
      lastModified: 'Jun 3, 2025, 10:00 AM',
    },
  ];

  // Filter and search
  const filteredDashboards = useMemo(() => {
    return allDashboards.filter(dashboard => {
      if (searchValue && !dashboard.name.toLowerCase().includes(searchValue.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [searchValue]);

  // Pagination
  const paginatedDashboards = useMemo(() => {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return filteredDashboards.slice(start, end);
  }, [filteredDashboards, page, perPage]);

  const onSetPage = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number) => {
    setPage(newPage);
  };

  const onPerPageSelect = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
  };

  // Auto-scrolls to the latest message (matching demo pattern)
  useEffect(() => {
    // Don't scroll on first load if no messages
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Generate unique ID for messages
  const generateId = () => {
    const id = Date.now() + Math.random();
    return id.toString();
  };

  // Handle sending messages
  const handleSendMessage = useCallback((message: string | number) => {
    const messageText = String(message);
    if (!messageText.trim()) return;

    setIsSendButtonDisabled(true);
    const date = new Date();

    // Add user message
    const userMessage: MessageProps = {
      id: generateId(),
      role: 'user',
      content: messageText,
      name: 'User',
      avatar: userAvatarSrc,
      timestamp: date.toLocaleString(),
      avatarProps: { isBordered: true }
    };

    // Add loading bot message
    const loadingBotMessage: MessageProps = {
      id: generateId(),
      role: 'bot',
      content: 'Thinking...',
      name: 'Aladdin',
      avatar: botAvatarSrc,
      isLoading: true,
      timestamp: date.toLocaleString()
    };

    setMessages((prev) => [...prev, userMessage, loadingBotMessage]);
    setAnnouncement(`Message from User: ${messageText}. Message from Aladdin is loading.`);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const botMessage: MessageProps = {
        id: generateId(),
        role: 'bot',
        content: `I received your message: "${messageText}". This is a demo response. In a real implementation, this would connect to an AI service to help with Perses dashboard queries.`,
        name: 'Aladdin',
        avatar: botAvatarSrc,
        isLoading: false,
        timestamp: date.toLocaleString(),
        actions: {
          positive: { onClick: () => console.log('Good response') },
          negative: { onClick: () => console.log('Bad response') },
          copy: { onClick: () => console.log('Copy') },
          download: { onClick: () => console.log('Download') },
          listen: { onClick: () => console.log('Listen') }
        }
      };
      
      setMessages((prev) => {
        const newMessages = [...prev];
        // Replace the loading message with the actual response
        const loadingIndex = newMessages.findIndex(m => m.isLoading);
        if (loadingIndex !== -1) {
          newMessages[loadingIndex] = botMessage;
        }
        return newMessages;
      });
      setAnnouncement(`Message from Aladdin: ${botMessage.content}`);
      setIsSendButtonDisabled(false);
    }, 2000);
  }, []);

  // Handle model selection
  const onSelectModel = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    setSelectedModel(value as string);
  };

  // Handle starting troubleshooting workflow from alert
  const handleStartTroubleshooting = useCallback((alertName: string) => {
    // Close notifications drawer
    setIsNotificationsDrawerOpen(false);
    
    // Open chatbot drawer
    setIsDrawerOpen(true);
    
    // Clear existing messages
    setMessages([]);
    
    // Set workflow stage
    setWorkflowStage('stage1');
    
    const date = new Date();
    
    // Add user message (simulated - user clicked "Troubleshoot with AI")
    const userMessage: MessageProps = {
      id: generateId(),
      role: 'user',
      content: `Troubleshoot ${alertName}`,
      name: 'User',
      avatar: userAvatarSrc,
      timestamp: date.toLocaleString(),
      avatarProps: { isBordered: true }
    };
    
    // Add loading bot message
    const loadingBotMessage: MessageProps = {
      id: generateId(),
      role: 'bot',
      content: 'Analyzing alert...',
      name: 'Aladdin',
      avatar: botAvatarSrc,
      isLoading: true,
      timestamp: date.toLocaleString()
    };
    
    setMessages([userMessage, loadingBotMessage]);
    
    // Simulate AI analysis and show Stage 1 response
    setTimeout(() => {
      const stage1Message: MessageProps = {
        id: generateId(),
        role: 'bot',
        content: 'I\'ve analyzed the KubeCPUOvercommit alert. The cluster is currently requesting 115% of available CPU.',
        name: 'Aladdin',
        avatar: botAvatarSrc,
        isLoading: false,
        timestamp: date.toLocaleString(),
        extraContent: {
          afterMainContent: (
            <div style={{ marginTop: '16px', marginBottom: '16px' }}>
              <Alert variant="danger" isInline title="KubeCPUOvercommit Analysis">
                <Content style={{ marginTop: '8px' }}>
                  I've analyzed the KubeCPUOvercommit alert. The cluster is currently requesting 115% of available CPU.
                </Content>
              </Alert>
              <div style={{ marginTop: '12px' }}>
                <Flex
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'var(--pf-t--global--spacer--sm)',
                    alignItems: 'center'
                  }}
                >
                  <Button className="chatbot-suggestion-chip" variant="secondary" onClick={() => handleStage2()}>
                    Analyze Root Cause
                  </Button>
                  <Button
                    className="chatbot-suggestion-chip"
                    variant="secondary"
                    onClick={() => {
                      console.log('Check Node Capacity clicked');
                      // Will implement in next step
                    }}
                  >
                    Check Node Capacity
                  </Button>
                </Flex>
              </div>
            </div>
          )
        }
      };
      
      setMessages((prev) => {
        const newMessages = [...prev];
        const loadingIndex = newMessages.findIndex(m => m.isLoading);
        if (loadingIndex !== -1) {
          newMessages[loadingIndex] = stage1Message;
        }
        return newMessages;
      });
      setAnnouncement('AI analysis complete. Review the alert details and select an action.');
    }, 2000);
  }, []);

  // Handle Stage 2: Root Cause Analysis
  const handleStage2 = useCallback(() => {
    setWorkflowStage('stage2');
    
    const date = new Date();
    
    // Add loading bot message
    const loadingBotMessage: MessageProps = {
      id: generateId(),
      role: 'bot',
      content: 'Analyzing root cause...',
      name: 'Aladdin',
      avatar: botAvatarSrc,
      isLoading: true,
      timestamp: date.toLocaleString()
    };
    
    setMessages((prev) => [...prev, loadingBotMessage]);
    
    // Simulate AI root cause analysis
    setTimeout(() => {
      // Mock data for top 3 CPU-consuming namespaces
      const cpuData = [
        { x: 'marketing-prod', y: 45 },
        { x: 'sales-prod', y: 32 },
        { x: 'support-prod', y: 23 }
      ];
      
      const stage2Message: MessageProps = {
        id: generateId(),
        role: 'bot',
        content: 'I\'ve identified the root cause: the **web-head** deployment in the **marketing-prod** namespace is consuming 45% of the cluster\'s CPU capacity, exceeding the namespace quota.',
        name: 'Aladdin',
        avatar: botAvatarSrc,
        isLoading: false,
        timestamp: date.toLocaleString(),
        extraContent: {
          afterMainContent: (
            <div style={{ marginTop: '16px', marginBottom: '16px' }}>
              <Title headingLevel="h4" size="md" style={{ marginBottom: '12px' }}>
                Top 3 CPU-Consuming Namespaces
              </Title>
              <div style={{ height: '200px', width: '100%' }}>
                <Charts
                  height={200}
                  option={{
                    tooltip: {
                      trigger: 'axis',
                      axisPointer: {
                        type: 'shadow'
                      },
                      formatter: (params: any) => {
                        const param = params[0];
                        return `${param.name}<br/>CPU Usage: ${param.value}%`;
                      }
                    },
                    grid: {
                      left: '60px',
                      right: '20px',
                      bottom: '60px',
                      top: '20px',
                      containLabel: false
                    },
                    xAxis: {
                      type: 'category',
                      data: cpuData.map(d => d.x),
                      name: 'Namespace',
                      nameLocation: 'middle',
                      nameGap: 30,
                      nameTextStyle: {
                        color: 'var(--pf-t--global--text--color--default)'
                      },
                      axisLabel: {
                        color: 'var(--pf-t--global--text--color--default)',
                        formatter: (value: string) => {
                          return value.length > 12 ? `${value.substring(0, 12)}...` : value;
                        },
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
                        data: cpuData.map(d => d.y),
                        label: {
                          show: true,
                          position: 'top',
                          formatter: '{c}%',
                          color: 'var(--pf-t--global--text--color--default)'
                        },
                        itemStyle: {
                          color: '#0066cc'
                        }
                      }
                    ]
                  }}
                />
              </div>
              <div style={{ marginTop: '12px' }}>
                <Flex wrap={{ default: 'wrap' }} gap={{ default: 'gapSm' }}>
                  <Button className="chatbot-suggestion-chip" variant="secondary" isSmall onClick={() => handleStage3()}>
                    Generate Troubleshooting Dashboard
                  </Button>
                  <Button
                    className="chatbot-suggestion-chip"
                    variant="secondary"
                    isSmall
                    onClick={() => {
                      console.log('Scale Down Replicas clicked');
                      // Will implement in next step
                    }}
                  >
                    Scale Down Replicas
                  </Button>
                </Flex>
              </div>
            </div>
          )
        }
      };
      
      setMessages((prev) => {
        const newMessages = [...prev];
        const loadingIndex = newMessages.findIndex(m => m.isLoading);
        if (loadingIndex !== -1) {
          newMessages[loadingIndex] = stage2Message;
        }
        return newMessages;
      });
      setAnnouncement('Root cause analysis complete. The web-head deployment in marketing-prod is the culprit.');
    }, 2000);
  }, [generateId, setWorkflowStage, setMessages, setAnnouncement]);

  // Handle Stage 3: Dashboard Generation
  const handleStage3 = useCallback(() => {
    setWorkflowStage('stage3');
    setIsGeneratingDashboard(true);

    const date = new Date();

    // Add loading bot message
    const loadingBotMessage: MessageProps = {
      id: generateId(),
      role: 'bot',
      content: 'Building Perses Dashboard Definition...',
      name: 'Aladdin',
      avatar: botAvatarSrc,
      isLoading: true,
      timestamp: date.toLocaleString()
    };
    
    setMessages((prev) => [...prev, loadingBotMessage]);
    
    // Simulate dashboard generation
    setTimeout(() => {
      const stage3Message: MessageProps = {
        id: generateId(),
        role: 'bot',
        content: 'I have generated a temporary troubleshooting dashboard for the **marketing-prod** namespace. You can save this to your Perses projects library or proceed with the fix.',
        name: 'Aladdin',
        avatar: botAvatarSrc,
        isLoading: false,
        timestamp: date.toLocaleString(),
        extraContent: {
          afterMainContent: (
            <div style={{ marginTop: '12px' }}>
              <Flex wrap={{ default: 'wrap' }} gap={{ default: 'gapSm' }}>
                <Button
                  className="chatbot-suggestion-chip"
                  variant="secondary"
                  isSmall
                  onClick={() => {
                    console.log('Save Dashboard clicked');
                    // Will implement in next step
                  }}
                >
                  Save Dashboard
                </Button>
                <Button
                  className="chatbot-suggestion-chip"
                  variant="secondary"
                  isSmall
                  onClick={() => {
                    console.log('Execute Scale Down clicked');
                    // Will implement in next step
                  }}
                >
                  Execute Scale Down
                </Button>
              </Flex>
            </div>
          )
        }
      };
      
      setMessages((prev) => {
        const newMessages = [...prev];
        const loadingIndex = newMessages.findIndex(m => m.isLoading);
        if (loadingIndex !== -1) {
          newMessages[loadingIndex] = stage3Message;
        }
        return newMessages;
      });
      setAnnouncement('Troubleshooting dashboard generated. Review the investigation room below.');

      // Show the troubleshooting dashboard and hide spinner
      setShowTroubleshootingDashboard(true);
      setIsGeneratingDashboard(false);
    }, 3000);
  }, [generateId, setWorkflowStage, setMessages, setAnnouncement, setShowTroubleshootingDashboard]);

  // Welcome prompts for ChatbotWelcomePrompt
  const welcomePrompts = [
    {
      title: 'Set up account',
      message: 'I\'d like to set up my account with the necessary settings and preferences.'
    },
    {
      title: 'Troubleshoot issue',
      message: 'I need help troubleshooting an issue with my dashboard.'
    }
  ];

  // Apply class to page container and masthead when drawer is open to shift content
  useEffect(() => {
    const pageContainer = document.querySelector('.pf-v6-c-page__main-container');
    const pageElement = document.querySelector('.pf-v6-c-page');
    const mastheadContent = document.querySelector('.pf-v6-c-masthead__content');
    
    if (isDrawerOpen) {
      pageContainer?.classList.add('chatbot-drawer-open');
      pageElement?.classList.add('chatbot-drawer-open');
      mastheadContent?.classList.add('chatbot-drawer-open');
    } else {
      pageContainer?.classList.remove('chatbot-drawer-open');
      pageElement?.classList.remove('chatbot-drawer-open');
      mastheadContent?.classList.remove('chatbot-drawer-open');
    }
    
    return () => {
      pageContainer?.classList.remove('chatbot-drawer-open');
      pageElement?.classList.remove('chatbot-drawer-open');
      mastheadContent?.classList.remove('chatbot-drawer-open');
    };
  }, [isDrawerOpen]);

  // Attach click handler to masthead bell icon - toggle drawer open/close
  useEffect(() => {
    const handleMastheadBellClick = (event: MouseEvent) => {
      // Find the masthead bell button by aria-label
      const target = event.target as HTMLElement;
      const bellButton = target.closest('button[aria-label="Notifications"]');
      if (bellButton) {
        event.preventDefault();
        event.stopPropagation();
        setIsNotificationsDrawerOpen(prev => !prev);
      }
    };

    // Add click listener to document (event delegation)
    document.addEventListener('click', handleMastheadBellClick);
    
    return () => {
      document.removeEventListener('click', handleMastheadBellClick);
    };
  }, []);

  // Add plain number count next to masthead bell icon
  useEffect(() => {
    const bellButton = document.querySelector('button[aria-label="Notifications"]');
    if (bellButton) {
      // Check if count already exists
      let countElement = bellButton.querySelector('.notifications-count') as HTMLElement;
      
      const totalAlerts = criticalAlerts.length + otherAlerts.length;
      
      if (totalAlerts > 0) {
        if (!countElement) {
          countElement = document.createElement('span');
          countElement.className = 'notifications-count';
          countElement.style.cssText = `
            margin-left: 4px;
            font-size: 14px;
            font-weight: 400;
            color: var(--pf-t--global--text--color--default, #151515);
            line-height: 1;
          `;
          bellButton.appendChild(countElement);
        }
        countElement.textContent = totalAlerts.toString();
      } else if (countElement) {
        countElement.remove();
      }
    }
  }, [criticalAlerts.length, otherAlerts.length]);

  // AI Assistant sidebar panel - using PatternFly Drawer structure
  const aiAssistantPanel = (
    <DrawerPanelContent widths={{ default: 'width_33', lg: 'width_33', xl: 'width_25' }} style={{ minWidth: '400px' }}>
      <DrawerPanelBody style={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Chatbot displayMode={ChatbotDisplayMode.drawer}>
          <ChatbotHeader>
            <ChatbotHeaderMain>
              <ChatbotHeaderMenu
                ref={historyRef}
                aria-expanded={isDrawerOpen}
                onMenuToggle={() => setIsDrawerOpen(!isDrawerOpen)}
              />
              <ChatbotHeaderTitle>AI Assistant</ChatbotHeaderTitle>
            </ChatbotHeaderMain>
            <ChatbotHeaderActions>
              <ChatbotHeaderSelectorDropdown value={selectedModel} onSelect={onSelectModel}>
                <DropdownList>
                  <DropdownItem value="Granite 7B" key="granite">
                    Granite 7B
                  </DropdownItem>
                  <DropdownItem value="Llama 3.0" key="llama">
                    Llama 3.0
                  </DropdownItem>
                  <DropdownItem value="Mistral 3B" key="mistral">
                    Mistral 3B
                  </DropdownItem>
                </DropdownList>
              </ChatbotHeaderSelectorDropdown>
            </ChatbotHeaderActions>
          </ChatbotHeader>
          <ChatbotContent>
            <MessageBox announcement={announcement}>
              {messages.length === 0 && (
                <ChatbotWelcomePrompt
                  title="Hi, ChatBot User!"
                  description="How can I help you today?"
                  prompts={welcomePrompts}
                />
              )}
              {messages.map((message, index) => {
                if (index === messages.length - 1) {
                  return (
                    <React.Fragment key={message.id}>
                      <div ref={messagesEndRef}></div>
                      <Message {...message} />
                    </React.Fragment>
                  );
                }
                return <Message key={message.id} {...message} />;
              })}
            </MessageBox>
          </ChatbotContent>
          <ChatbotFooter>
            <MessageBar 
              onSendMessage={handleSendMessage} 
              hasMicrophoneButton 
              isSendButtonDisabled={isSendButtonDisabled} 
            />
            <ChatbotFootnote {...footnoteProps} />
          </ChatbotFooter>
        </Chatbot>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );

  return (
    <>
      <Drawer isExpanded={isNotificationsDrawerOpen} position="end">
      <DrawerContent
        panelContent={
          <DrawerPanelContent widths={{ default: 'width_33', lg: 'width_33', xl: 'width_25' }} style={{ minWidth: '400px' }}>
            <DrawerHead>
              <Title headingLevel="h2" size="xl">Notifications</Title>
              <DrawerActions>
                <DrawerCloseButton onClick={() => setIsNotificationsDrawerOpen(false)} />
              </DrawerActions>
            </DrawerHead>
            <DrawerPanelBody style={{ padding: '24px', overflowY: 'auto' }}>
              <Stack hasGutter>
                {/* Critical Alerts Section */}
                <StackItem>
                  <div style={{ borderBottom: '1px solid var(--pf-t--global--border--color--default)', paddingBottom: '16px', marginBottom: '16px' }}>
                    <Button
                      variant="plain"
                      onClick={() => setIsCriticalAlertsExpanded(!isCriticalAlertsExpanded)}
                      className="notification-section-button"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span className="notification-section-title">Critical Alerts</span>
                        <div className="notification-section-right">
                          <Badge className="pf-v6-c-badge pf-m-unread">{criticalAlerts.length}</Badge>
                          {isCriticalAlertsExpanded ? <CaretDownIcon /> : <AngleRightIcon />}
                        </div>
                      </div>
                    </Button>
                  {isCriticalAlertsExpanded && (
                    <div style={{ paddingTop: '8px' }}>
                    {criticalAlerts.length === 0 ? (
                      <EmptyState titleText="No critical alerts" headingLevel="h4">
                        <EmptyStateBody>
                          There are currently no critical alerts firing. There may be firing alerts of other severities or silenced critical alerts however.
                        </EmptyStateBody>
                        <EmptyStateFooter>
                          <EmptyStateActions>
                            <Button variant="link" component="a" href="#">
                              View all alerts
                            </Button>
                          </EmptyStateActions>
                        </EmptyStateFooter>
                      </EmptyState>
                    ) : (
                      <Stack hasGutter>
                        {criticalAlerts.map((alert) => (
                          <StackItem key={alert.id}>
                            <Alert
                              variant="danger"
                              isInline
                              title={alert.name}
                              style={{ marginBottom: '12px' }}
                            >
                              <Content style={{ marginTop: '8px', marginBottom: '8px', fontSize: '14px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                                {alert.severity} • {alert.duration}
                              </Content>
                              {alert.description && (
                                <Content style={{ marginTop: '8px', marginBottom: '12px' }}>
                                  {alert.description}
                                </Content>
                              )}
                              <Button
                                variant="link"
                                isInline
                                onClick={() => handleStartTroubleshooting(alert.name)}
                                style={{ marginTop: '8px' }}
                              >
                                Troubleshoot with AI
                              </Button>
                            </Alert>
                          </StackItem>
                        ))}
                      </Stack>
                    )}
                    </div>
                  )}
                  </div>
                </StackItem>

                {/* Other Alerts Section */}
                <StackItem>
                  <div style={{ borderBottom: '1px solid var(--pf-t--global--border--color--default)', paddingBottom: '16px', marginBottom: '16px' }}>
                    <Button
                      variant="plain"
                      onClick={() => setIsOtherAlertsExpanded(!isOtherAlertsExpanded)}
                      className="notification-section-button"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span className="notification-section-title">Other Alerts</span>
                        <div className="notification-section-right">
                          <Badge className="pf-v6-c-badge pf-m-unread">{otherAlerts.length}</Badge>
                          {isOtherAlertsExpanded ? <CaretDownIcon /> : <AngleRightIcon />}
                        </div>
                      </div>
                    </Button>
                  {isOtherAlertsExpanded && (
                    <div style={{ paddingTop: '8px' }}>
                    {otherAlerts.length === 0 ? (
                      <EmptyState titleText="No other alerts" headingLevel="h4">
                        <EmptyStateBody>
                          There are currently no other alerts firing. There may be firing alerts of other severities or silenced alerts however.
                        </EmptyStateBody>
                        <EmptyStateFooter>
                          <EmptyStateActions>
                            <Button variant="link" component="a" href="#">
                              View all alerts
                            </Button>
                          </EmptyStateActions>
                        </EmptyStateFooter>
                      </EmptyState>
                    ) : (
                      <Stack hasGutter>
                        {otherAlerts.map((alert) => (
                          <StackItem key={alert.id}>
                            <div style={{ padding: '12px', border: '1px solid var(--pf-t--global--border--color--default)', borderRadius: '4px' }}>
                              <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsFlexStart' }}>
                                <FlexItem>
                                  <Title headingLevel="h4" size="md" style={{ marginBottom: '4px' }}>
                                    {alert.name}
                                  </Title>
                                  <Content style={{ fontSize: '14px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                                    {alert.severity} • {alert.duration}
                                  </Content>
                                </FlexItem>
                                <FlexItem>
                                  <Button variant="plain" aria-label="View details">
                                    <CaretDownIcon style={{ transform: 'rotate(-90deg)' }} />
                                  </Button>
                                </FlexItem>
                              </Flex>
                            </div>
                          </StackItem>
                        ))}
                      </Stack>
                    )}
                    </div>
                  )}
                  </div>
                </StackItem>

                {/* Recommendations Section */}
                <StackItem>
                  <div style={{ borderBottom: '1px solid var(--pf-t--global--border--color--default)', paddingBottom: '16px', marginBottom: '16px' }}>
                    <Button
                      variant="plain"
                      onClick={() => setIsRecommendationsExpanded(!isRecommendationsExpanded)}
                      className="notification-section-button"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span className="notification-section-title">Recommendations</span>
                        <div className="notification-section-right">
                          <Badge className="pf-v6-c-badge pf-m-unread">{recommendations.length}</Badge>
                          {isRecommendationsExpanded ? <CaretDownIcon /> : <AngleRightIcon />}
                        </div>
                      </div>
                    </Button>
                  {isRecommendationsExpanded && (
                    <div style={{ paddingTop: '8px' }}>
                    {recommendations.length === 0 ? (
                      <EmptyState titleText="No recommendations" headingLevel="h4">
                        <EmptyStateBody>
                          There are currently no recommendations available. Recommendations will appear here when they become available.
                        </EmptyStateBody>
                        <EmptyStateFooter>
                          <EmptyStateActions>
                            <Button variant="link" component="a" href="#">
                              View all alerts
                            </Button>
                          </EmptyStateActions>
                        </EmptyStateFooter>
                      </EmptyState>
                    ) : (
                      <Stack hasGutter>
                        {recommendations.map((rec) => (
                          <StackItem key={rec.id}>
                            <Alert
                              variant="warning"
                              isInline
                              title={rec.title}
                              style={{ marginBottom: '12px' }}
                            >
                              <Content style={{ marginTop: '8px', marginBottom: '12px' }}>
                                {rec.message}
                              </Content>
                              <Button
                                variant="link"
                                isInline
                                component="a"
                                href={rec.actionUrl}
                                icon={<ExternalLinkAltIcon />}
                                iconPosition="end"
                              >
                                {rec.actionLabel}
                              </Button>
                            </Alert>
                          </StackItem>
                        ))}
                      </Stack>
                    )}
                    </div>
                  )}
                  </div>
                </StackItem>
              </Stack>
            </DrawerPanelBody>
          </DrawerPanelContent>
        }
      >
        <DrawerContentBody>
          {/* Page content */}
          {showTroubleshootingDashboard ? (
            <TroubleshootingDashboard />
          ) : isGeneratingDashboard ? (
            <Bullseye
              style={{
                minHeight: 'calc(100vh - 120px)',
                width: '100%',
                backgroundColor: 'var(--pf-t--global--background--color--primary--default)'
              }}
            >
              <Spinner diameter="54px" aria-label="Loading dashboards" />
            </Bullseye>
          ) : (
          <>
              {/* Project MenuToggle Section - above breadcrumbs */}
              <div className="template-page-breadcrumb">
                <Dropdown
                  isOpen={isProjectDropdownOpen}
                  onSelect={(event, value) => {
                    setSelectedProject(value as string);
                    setIsProjectDropdownOpen(false);
                  }}
                  onOpenChange={(isOpen: boolean) => setIsProjectDropdownOpen(isOpen)}
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                      isExpanded={isProjectDropdownOpen}
                      variant="plain"
                      style={{ padding: 0, backgroundColor: 'transparent' }}
                    >
                      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                        <FlexItem>Project: {selectedProject}</FlexItem>
                        <FlexItem>
                          <CaretDownIcon style={{ color: 'var(--pf-t--global--text--color--default)' }} />
                        </FlexItem>
                      </Flex>
                    </MenuToggle>
                  )}
                >
                  <DropdownList>
                    <DropdownItem key="all-projects">All projects</DropdownItem>
                    <DropdownItem key="project-1">project-1</DropdownItem>
                    <DropdownItem key="project-2">project-2</DropdownItem>
                    <DropdownItem key="project-3">project-3</DropdownItem>
                  </DropdownList>
                </Dropdown>
              </div>

              {/* Breadcrumbs Section - 16px padding */}
              <div className="template-page-breadcrumb">
              <Breadcrumb>
                <BreadcrumbItem to="#" onClick={() => navigate('/core/observe')}>
                  Observe
                </BreadcrumbItem>
                <BreadcrumbItem isActive>Dashboards</BreadcrumbItem>
              </Breadcrumb>
            </div>

            {/* Heading Section - 24px padding */}
            <div className="template-page-heading">
              <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsFlexStart' }}>
                <FlexItem>
                  <Title headingLevel="h1" size="2xl" style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
                    Dashboards
                  </Title>
                  <Content>
                    <p>View and manage dashboards.</p>
                  </Content>
                </FlexItem>
                <FlexItem>
                  <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>
                      <Button variant="plain" aria-label="Favorite">
                        <StarIcon />
                      </Button>
                    </FlexItem>
                    <FlexItem>
                      <Dropdown
                        isOpen={isCreateDropdownOpen}
                        onSelect={() => setIsCreateDropdownOpen(false)}
                        onOpenChange={(isOpen: boolean) => setIsCreateDropdownOpen(isOpen)}
                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                          <MenuToggle
                            ref={toggleRef}
                            onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
                            isExpanded={isCreateDropdownOpen}
                            variant="primary"
                          >
                            Create
                          </MenuToggle>
                        )}
                      >
                        <DropdownList>
                          <DropdownItem key="create-dashboard">Create dashboard</DropdownItem>
                          <DropdownItem key="create-from-template">Create from template</DropdownItem>
                        </DropdownList>
                      </Dropdown>
                    </FlexItem>
                    <FlexItem>
                      <Button variant="secondary">Import dashboard</Button>
                    </FlexItem>
                  </Flex>
                </FlexItem>
              </Flex>
            </div>

            {/* Content Area - 24px padding */}
            <div className="template-page-content">
              <div className="table-content-card">
                {/* Toolbar with filters and search */}
                <Toolbar>
                  <ToolbarContent style={{ gap: '8px' }}>
                    {/* Filters Dropdown */}
                    <ToolbarItem>
                      <Dropdown
                        isOpen={isFilterOpen}
                        onSelect={() => setIsFilterOpen(false)}
                        onOpenChange={(isOpen: boolean) => setIsFilterOpen(isOpen)}
                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                          <MenuToggle
                            ref={toggleRef}
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            isExpanded={isFilterOpen}
                            variant="default"
                          >
                            <FilterIcon /> Filters
                          </MenuToggle>
                        )}
                      >
                        <DropdownList>
                          <DropdownItem key="type">Type</DropdownItem>
                          <DropdownItem key="project">Project</DropdownItem>
                          <DropdownItem key="created-by">Created by</DropdownItem>
                        </DropdownList>
                      </Dropdown>
                    </ToolbarItem>

                    {/* Name Dropdown */}
                    <ToolbarItem>
                      <Dropdown
                        isOpen={isNameFilterOpen}
                        onSelect={() => setIsNameFilterOpen(false)}
                        onOpenChange={(isOpen: boolean) => setIsNameFilterOpen(isOpen)}
                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                          <MenuToggle
                            ref={toggleRef}
                            onClick={() => setIsNameFilterOpen(!isNameFilterOpen)}
                            isExpanded={isNameFilterOpen}
                            variant="default"
                          >
                            Name
                          </MenuToggle>
                        )}
                      >
                        <DropdownList>
                          <DropdownItem key="name">Name</DropdownItem>
                          <DropdownItem key="label">Label</DropdownItem>
                        </DropdownList>
                      </Dropdown>
                    </ToolbarItem>

                    {/* Search Bar */}
                    <ToolbarItem>
                      <SearchInput
                        placeholder="Search by name..."
                        value={searchValue}
                        onChange={(_event, value) => setSearchValue(value)}
                        onClear={() => setSearchValue('')}
                      />
                    </ToolbarItem>

                    {/* Pagination at top */}
                    <ToolbarItem align={{ default: 'alignEnd' }}>
                      <Pagination
                        itemCount={filteredDashboards.length}
                        perPage={perPage}
                        page={page}
                        onSetPage={onSetPage}
                        onPerPageSelect={onPerPageSelect}
                        variant={PaginationVariant.top}
                        isCompact
                      />
                    </ToolbarItem>
                  </ToolbarContent>
                </Toolbar>

                {/* Table */}
                <Table aria-label="Dashboards table">
                  <Thead>
                    <Tr>
                      <Th>Dashboard name</Th>
                      <Th>Project</Th>
                      <Th>Type</Th>
                      <Th>Created by</Th>
                      <Th>Labels</Th>
                      <Th>Created on</Th>
                      <Th>Last modified</Th>
                      <Th></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {paginatedDashboards.map((dashboard) => (
                      <Tr key={dashboard.id}>
                        <Td>
                          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                            <FlexItem>
                              <Badge style={{ backgroundColor: '#0066CC', color: 'white' }}>D</Badge>
                            </FlexItem>
                            <FlexItem>
                              <Button variant="link" isInline>
                                {dashboard.name}
                              </Button>
                            </FlexItem>
                          </Flex>
                        </Td>
                        <Td>
                          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                            <FlexItem>
                              <Badge style={{ backgroundColor: '#3E8635', color: 'white' }}>PR</Badge>
                            </FlexItem>
                            <FlexItem>
                              <Button variant="link" isInline>
                                {dashboard.project}
                              </Button>
                            </FlexItem>
                          </Flex>
                        </Td>
                        <Td>
                          <Badge
                            isRead
                            style={{
                              backgroundColor: dashboard.type === 'Global-scoped' 
                                ? 'var(--pf-t--global--color--nonstatus--blue--default)' 
                                : 'var(--pf-t--global--color--nonstatus--purple--default)',
                              color: 'var(--pf-t--global--text--color--default)',
                              fontWeight: 'normal'
                            }}
                          >
                            {dashboard.type}
                          </Badge>
                        </Td>
                        <Td>{dashboard.createdBy}</Td>
                        <Td>
                          <LabelGroup>
                            {dashboard.labels.map((label, idx) => (
                              <Label key={idx} isCompact color="grey">
                                {label}
                              </Label>
                            ))}
                          </LabelGroup>
                        </Td>
                        <Td>{dashboard.createdOn}</Td>
                        <Td>{dashboard.lastModified}</Td>
                        <Td>
                          <Button variant="plain" aria-label="Actions">
                            <EllipsisVIcon />
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>

                {/* Pagination at bottom */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid #e0e0e0' }}>
                  <Pagination
                    itemCount={filteredDashboards.length}
                    perPage={perPage}
                    page={page}
                    onSetPage={onSetPage}
                    onPerPageSelect={onPerPageSelect}
                    variant={PaginationVariant.bottom}
                  />
                </div>
              </div>
            </div>
          </>
          )}
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>

    {/* AI Assistant Chatbot - rendered via portal outside main container */}
    {isDrawerOpen && createPortal(
        <div className="ai-assistant-drawer-wrapper">
          <div className="ai-assistant-panel-inner" style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: 'var(--pf-t--global--background--color--primary--default)' }}>
            <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <Chatbot displayMode={ChatbotDisplayMode.drawer}>
              <ChatbotHeader style={{ flexShrink: 0, display: 'flex', visibility: 'visible' }}>
                <ChatbotHeaderMain>
                  <ChatbotHeaderMenu
                    ref={historyRef}
                    aria-expanded={isDrawerOpen}
                    onMenuToggle={() => setIsDrawerOpen(!isDrawerOpen)}
                  />
                  <ChatbotHeaderTitle>AI Assistant</ChatbotHeaderTitle>
                </ChatbotHeaderMain>
                <ChatbotHeaderActions>
                  <ChatbotHeaderSelectorDropdown value={selectedModel} onSelect={onSelectModel}>
                    <DropdownList>
                      <DropdownItem value="Granite 7B" key="granite">
                        Granite 7B
                      </DropdownItem>
                      <DropdownItem value="Llama 3.0" key="llama">
                        Llama 3.0
                      </DropdownItem>
                      <DropdownItem value="Mistral 3B" key="mistral">
                        Mistral 3B
                      </DropdownItem>
                    </DropdownList>
                  </ChatbotHeaderSelectorDropdown>
                </ChatbotHeaderActions>
              </ChatbotHeader>
              <ChatbotContent style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
                <MessageBox announcement={announcement} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', minHeight: 0 }}>
                  {messages.length === 0 && (
                    <ChatbotWelcomePrompt
                      title="Hi, ChatBot User!"
                      description="How can I help you today?"
                      prompts={welcomePrompts}
                    />
                  )}
                  {messages.map((message, index) => {
                    if (index === messages.length - 1) {
                      return (
                        <React.Fragment key={message.id}>
                          <div ref={messagesEndRef}></div>
                          <Message {...message} />
                        </React.Fragment>
                      );
                    }
                    return <Message key={message.id} {...message} />;
                  })}
                </MessageBox>
              </ChatbotContent>
              <ChatbotFooter style={{ flexShrink: 0, display: 'flex', visibility: 'visible' }}>
                <MessageBar 
                  onSendMessage={handleSendMessage} 
                  hasMicrophoneButton 
                  isSendButtonDisabled={isSendButtonDisabled} 
                />
                <ChatbotFootnote {...footnoteProps} />
              </ChatbotFooter>
            </Chatbot>
            </div>
          </div>
        </div>,
        document.body
      )}

    {/* Floating toggle button - positioned outside drawer, always visible */}
    {createPortal(
      <div 
        ref={chatbotToggleRef}
        className={isDrawerOpen ? 'chatbot-toggle-button drawer-open' : 'chatbot-toggle-button'}
        style={{ 
          position: 'fixed', 
          bottom: '24px', 
          right: '24px',
          zIndex: 10000,
          transition: 'right 0.2s ease-in-out'
        }}
      >
        <Tooltip content="AI assistant" position="left">
          <ChatbotToggle 
            onClick={() => setIsDrawerOpen(!isDrawerOpen)} 
            aria-label="AI assistant"
            tooltipLabel="AI assistant"
          />
        </Tooltip>
      </div>,
      document.body
    )}
  </>
  );
};

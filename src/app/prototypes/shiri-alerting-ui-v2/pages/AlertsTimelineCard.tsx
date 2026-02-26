import * as React from 'react';
import ReactECharts from 'echarts-for-react';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Flex,
  FlexItem,
  Divider,
  Content,
  Label,
  Button,
  Stack,
  StackItem,
  Alert as PfAlert,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';
import type { TrendData } from './types';

interface AlertsTimelineCardProps {
  trendData: TrendData[];
}

export const AlertsTimelineCard: React.FC<AlertsTimelineCardProps> = ({ trendData }) => {
  const [selectedAnomaly, setSelectedAnomaly] = React.useState<{ timestamp: string; index: number } | null>(null);

  // Detect anomalies (simple threshold-based detection)
  const detectAnomalies = React.useMemo(() => {
    const totals = trendData.map(d => d.critical + d.warning + d.info);
    const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
    const threshold = avg * 2; // 200% increase
    
    return trendData.map((d, i) => {
      const total = d.critical + d.warning + d.info;
      return total > threshold ? { index: i, value: total, timestamp: d.timestamp, increase: Math.round((total / avg - 1) * 100) } : null;
    }).filter((x): x is NonNullable<typeof x> => Boolean(x));
  }, [trendData]);

  const hasAnomaly = detectAnomalies.length > 0;
  const mostSignificantAnomaly = detectAnomalies.length > 0 ? detectAnomalies[0] : null;

  const chartRef = React.useRef<any>(null);

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: '#d2d2d2',
      borderWidth: 1,
      textStyle: { color: '#151515', fontFamily: 'RedHatText, sans-serif' },
      formatter: (params: any) => {
        const dataIndex = params[0].dataIndex;
        const dataPoint = trendData[dataIndex];
        let content = `<strong>${dataPoint.timestamp}</strong><br/>`;
        params.forEach((param: any) => {
          if (param.seriesName !== 'Anomaly') {
            content += `${param.marker} ${param.seriesName}: ${param.value}<br/>`;
          }
        });
        if (dataPoint.topAlerts && dataPoint.topAlerts.length > 0) {
          content += `<br/><strong style="color: #c9190b;">⚠️ Anomaly detected</strong><br/>`;
          content += `<strong>Top contributing alerts:</strong><br/>`;
          dataPoint.topAlerts.forEach((alert, idx) => {
            content += `${idx + 1}. ${alert}<br/>`;
          });
        }
        return content;
      }
    },
    legend: {
      data: ['Critical', 'Warning', 'Info'],
      bottom: 0,
      textStyle: { fontFamily: 'RedHatText, sans-serif' },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trendData.map(d => d.timestamp),
      axisLabel: { fontFamily: 'RedHatText, sans-serif' },
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontFamily: 'RedHatText, sans-serif' },
    },
    series: [
      {
        name: 'Critical',
        type: 'line',
        stack: 'Total',
        emphasis: { focus: 'series' },
        data: trendData.map(d => d.critical),
        itemStyle: { color: '#c9190b' },
        lineStyle: { color: '#c9190b' },
        areaStyle: { color: '#c9190b', opacity: 0.3 },
      },
      {
        name: 'Warning',
        type: 'line',
        stack: 'Total',
        emphasis: { focus: 'series' },
        data: trendData.map(d => d.warning),
        itemStyle: { color: '#f0ab00' },
        lineStyle: { color: '#f0ab00' },
        areaStyle: { color: '#f0ab00', opacity: 0.3 },
      },
      {
        name: 'Info',
        type: 'line',
        stack: 'Total',
        emphasis: { focus: 'series' },
        data: trendData.map(d => d.info),
        itemStyle: { color: '#6753ac' },
        lineStyle: { color: '#6753ac' },
        areaStyle: { color: '#6753ac', opacity: 0.3 },
      },
      // Anomaly markers
      ...(detectAnomalies.length > 0 ? [{
        name: 'Anomaly',
        type: 'scatter',
        data: detectAnomalies.map(anomaly => [anomaly.index, anomaly.value]),
        symbol: 'circle',
        symbolSize: 12,
        itemStyle: {
          color: '#c9190b',
          borderColor: '#fff',
          borderWidth: 2,
        },
        emphasis: {
          itemStyle: {
            color: '#c9190b',
            borderColor: '#fff',
            borderWidth: 3,
            shadowBlur: 10,
            shadowColor: 'rgba(201, 25, 11, 0.5)',
          },
        },
        zlevel: 10,
      }] : []),
    ],
  };

  const handleChartClick = (params: any) => {
    if (params.seriesName === 'Anomaly') {
      const anomaly = detectAnomalies[params.dataIndex];
      if (anomaly) {
        setSelectedAnomaly({ timestamp: anomaly.timestamp, index: anomaly.index });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alert velocity & trends</CardTitle>
      </CardHeader>
      <CardBody>
        <Stack hasGutter>
          {hasAnomaly && mostSignificantAnomaly && (
            <StackItem>
              <PfAlert 
                variant="warning" 
                isInline 
                title={`Anomaly detected at ${mostSignificantAnomaly.timestamp}`}
              >
                <Stack hasGutter>
                  <StackItem>
                    <Content component="p">
                      Unusual spike detected in alert volume. Click on the highlighted point in the chart to investigate.
                    </Content>
                  </StackItem>
                  {trendData[mostSignificantAnomaly.index]?.topAlerts && (
                    <StackItem>
                      <Content component="p">
                        <strong>Top contributing alerts:</strong>
                      </Content>
                      <Flex gap={{ default: 'gapSm' }} style={{ marginTop: '8px' }}>
                        {trendData[mostSignificantAnomaly.index].topAlerts!.map((alert, idx) => (
                          <FlexItem key={idx}>
                            <Label 
                              color="red" 
                              isCompact
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                // Navigate to alerts page with filter
                                const anomaly = trendData[mostSignificantAnomaly.index];
                                setSelectedAnomaly({ timestamp: anomaly.timestamp, index: mostSignificantAnomaly.index });
                              }}
                            >
                              {idx + 1}. {alert}
                            </Label>
                          </FlexItem>
                        ))}
                      </Flex>
                    </StackItem>
                  )}
                </Stack>
              </PfAlert>
            </StackItem>
          )}
          <StackItem>
            <div style={{ height: '300px', width: '100%' }}>
              <ReactECharts 
                ref={chartRef}
                option={option} 
                style={{ height: '100%', width: '100%', cursor: 'pointer' }} 
                onEvents={{ click: handleChartClick }}
              />
            </div>
          </StackItem>
        </Stack>
      </CardBody>
      
      {/* Popover-style floating card for anomaly details */}
      {selectedAnomaly && (() => {
        const anomalyData = trendData[selectedAnomaly.index];
        const topAlerts = anomalyData?.topAlerts || [];
        const totalAlerts = anomalyData ? anomalyData.critical + anomalyData.warning + anomalyData.info : 0;
        
        return (
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9999,
              maxWidth: '400px',
              backgroundColor: 'var(--pf-t--global--background--color--primary--default, #fff)',
              border: '1px solid var(--pf-t--global--border--color--default, #d2d2d2)',
              borderRadius: 'var(--pf-t--global--border--radius--medium, 8px)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            }}
          >
            <Card isPlain>
              <CardHeader>
                <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                  <FlexItem>
                    <CardTitle>Anomaly at {selectedAnomaly.timestamp}</CardTitle>
                  </FlexItem>
                  <FlexItem>
                    <Button 
                      variant="plain" 
                      aria-label="Close"
                      onClick={() => setSelectedAnomaly(null)}
                    >
                      <TimesIcon />
                    </Button>
                  </FlexItem>
                </Flex>
              </CardHeader>
              <CardBody>
                <Stack hasGutter>
                  <StackItem>
                    <Content component="p">
                      <strong>Anomaly detected:</strong> {totalAlerts} alerts exceeds the historical baseline for this time period.
                    </Content>
                  </StackItem>
                  {topAlerts.length > 0 && (
                    <StackItem>
                      <Stack hasGutter>
                        <StackItem>
                          <Content component="p">
                            <strong>Top contributing alerts:</strong>
                          </Content>
                        </StackItem>
                        <StackItem>
                          <Stack hasGutter>
                            {topAlerts.map((alertName, idx) => (
                              <StackItem key={idx}>
                                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                  <FlexItem>
                                    <Label color="red" isCompact>
                                      {idx + 1}
                                    </Label>
                                  </FlexItem>
                                  <FlexItem>
                                    <Content component="p" style={{ fontWeight: 500 }}>
                                      {alertName}
                                    </Content>
                                  </FlexItem>
                                </Flex>
                              </StackItem>
                            ))}
                          </Stack>
                        </StackItem>
                      </Stack>
                    </StackItem>
                  )}
                  <StackItem>
                    <Button 
                      variant="link" 
                      isInline
                      onClick={() => {
                        setSelectedAnomaly(null);
                        // Navigate to alert details - could filter by these specific alerts
                      }}
                    >
                      {topAlerts.length > 0 
                        ? `View ${topAlerts.length} contributing alert${topAlerts.length > 1 ? 's' : ''} →`
                        : 'View alert details →'
                      }
                    </Button>
                  </StackItem>
                  <StackItem>
                    <Button 
                      variant="link" 
                      isInline
                      onClick={() => {
                        setSelectedAnomaly(null);
                        // Navigate to incidents tab
                      }}
                    >
                      Review in Incidents tab →
                    </Button>
                  </StackItem>
                </Stack>
              </CardBody>
            </Card>
          </div>
        );
      })()}
      
      {/* Backdrop overlay when popover is open */}
      {selectedAnomaly && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 9998,
          }}
          onClick={() => setSelectedAnomaly(null)}
        />
      )}
    </Card>
  );
};

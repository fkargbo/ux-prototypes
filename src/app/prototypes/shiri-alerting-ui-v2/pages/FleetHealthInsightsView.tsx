import * as React from 'react';
import { Flex, FlexItem, Title, Label, Button, Tooltip, Content } from '@patternfly/react-core';
import { MagicIcon, ExclamationCircleIcon, ExclamationTriangleIcon, InfoCircleIcon, OptimizeIcon, HelpIcon } from '@patternfly/react-icons';
import {
  INSIGHTS_LIST_SIZE,
  INSIGHTS_LINK,
  getAlertAiInsight,
  getComponentAiInsight,
  getAlertActions,
  getComponentActions,
  INSIGHTS_LIST_WRAPPER,
  INSIGHTS_LIST_ITEM,
  INSIGHTS_LIST_ITEM_LAST,
  AI_INSIGHT_ICON_STYLE,
  AI_INSIGHT_TEXT_STYLE,
  FLEET_INSIGHT_CARD_STYLE,
  FLEET_INSIGHT_ICON_BOX_STYLE,
  FLEET_INSIGHT_TEXT_WRAPPER_STYLE,
} from './fleetInsightsConfig';

type SeverityKey = 'Critical' | 'Warning' | 'Info';

const SEVERITY_ICONS: Record<SeverityKey, React.ReactNode> = {
  Critical: <ExclamationCircleIcon />,
  Warning: <ExclamationTriangleIcon />,
  Info: <InfoCircleIcon />,
};

interface AlertRuleRow {
  name: string;
  critical: number;
  warning: number;
  info: number;
  clusters: string[];
}

interface ComponentRow {
  name: string;
  critical: number;
  warning: number;
  info: number;
  clusters: string[];
}

export interface FleetHealthInsightsViewProps {
  alertRuleData: AlertRuleRow[];
  componentInsightsTop5: ComponentRow[];
  componentCount: number;
  totalFiringAlertsCount: number;
  hasAlertData: boolean;
  onAlertRuleClick: (name: string) => void;
  onComponentClick: (name: string) => void;
  onViewAllFiringAlerts?: () => void;
  onViewAllClusters?: () => void;
}

export const FleetHealthInsightsView: React.FC<FleetHealthInsightsViewProps> = (props) => {
  const {
    alertRuleData,
    componentInsightsTop5,
    componentCount,
    totalFiringAlertsCount,
    hasAlertData,
    onAlertRuleClick,
    onComponentClick,
    onViewAllFiringAlerts,
    onViewAllClusters,
  } = props;

  if (!hasAlertData) {
    return (
      <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentCenter' }} style={{ flex: 1 }}>
        <Content component="p" className="pf-v6-u-color-200">No alerts</Content>
      </Flex>
    );
  }

  return (
    <>
      <div style={FLEET_INSIGHT_CARD_STYLE} role="region" aria-label="Fleet insight">
        <div style={FLEET_INSIGHT_ICON_BOX_STYLE} aria-hidden="true">
          <MagicIcon style={{ width: 20, height: 20 }} />
        </div>
        <div style={FLEET_INSIGHT_TEXT_WRAPPER_STYLE}>
          <span style={{ fontWeight: 600, color: 'var(--pf-t--global--text--color--regular)' }}>Fleet Insight:</span>{' '}
          <span style={{ color: 'var(--pf-t--global--text--color--regular)' }}>
            Current pressure on <span style={{ color: '#c9190b', fontWeight: 500 }}>node availability</span> in 12 clusters points to a{' '}
            <Button variant="link" isInline style={{ padding: 0, fontSize: 'inherit', color: '#6753ac', textDecoration: 'underline' }}>VPC-peering bottleneck</Button> in{' '}
            <Button variant="link" isInline style={{ padding: 0, fontSize: 'inherit', color: '#6753ac', textDecoration: 'underline' }}>us-east-1</Button>.
          </span>
        </div>
      </div>
      <Title headingLevel="h3" size="lg" style={{ marginBottom: 6 }}>Top Alerts</Title>
      <div style={{ ...INSIGHTS_LIST_WRAPPER, display: 'flex', flexDirection: 'column' }}>
        {alertRuleData.slice(0, INSIGHTS_LIST_SIZE).map((rule, index) => {
          const dominantSeverity: SeverityKey = rule.critical > 0 ? 'Critical' : rule.warning > 0 ? 'Warning' : 'Info';
          const clusterCount = rule.clusters.length;
          const isLast = index === Math.min(INSIGHTS_LIST_SIZE, alertRuleData.length) - 1;
          return (
            <div key={rule.name} style={{ ...INSIGHTS_LIST_ITEM, ...(isLast ? INSIGHTS_LIST_ITEM_LAST : {}) }}>
              <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }} flexWrap={{ default: 'wrap' }} gap={{ default: 'gapSm' }}>
                <FlexItem style={{ flexShrink: 0 }}>
                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                    <Label isCompact color={dominantSeverity === 'Critical' ? 'red' : dominantSeverity === 'Warning' ? 'orange' : 'purple'} icon={SEVERITY_ICONS[dominantSeverity]}>{dominantSeverity}</Label>
                    <span style={{ fontWeight: 600, color: 'var(--pf-t--global--text--color--regular)' }}>{rule.name}</span>
                    <span style={{ fontWeight: 400, color: 'var(--pf-t--global--text--color--subtle)' }}>{clusterCount} cluster{clusterCount !== 1 ? 's' : ''}</span>
                  </Flex>
                </FlexItem>
                <FlexItem style={{ flexShrink: 0 }}>
                  <Flex gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsCenter' }}>
                    {getAlertActions(rule.name).map((action) => (
                      <Button key={action.label} variant="link" isInline style={INSIGHTS_LINK} className="pf-v6-u-font-size-sm" onClick={action.onClick}>{action.label}</Button>
                    ))}
                    <Button variant="link" isInline style={INSIGHTS_LINK} className="pf-v6-u-font-size-sm" onClick={() => onAlertRuleClick(rule.name)}>View alert</Button>
                  </Flex>
                </FlexItem>
              </Flex>
              <Tooltip content={getAlertAiInsight(rule.name)}>
                <Flex alignItems={{ default: 'alignItemsFlexStart' }} gap={{ default: 'gapXs' }} style={{ marginTop: 6, width: '100%' }} role="note" aria-label="AI insight">
                  <span style={AI_INSIGHT_ICON_STYLE} aria-hidden="true"><OptimizeIcon style={{ width: 14, height: 14 }} /></span>
                  <span style={{ fontSize: 'var(--pf-t--global--font--size--sm)', minWidth: 0, flex: 1 }}>
                    <span style={{ fontWeight: 600, color: 'var(--pf-t--global--text--color--subtle)' }}>AI Insight: </span>
                    <span style={AI_INSIGHT_TEXT_STYLE} title={getAlertAiInsight(rule.name)}>{getAlertAiInsight(rule.name)}</span>
                  </span>
                </Flex>
              </Tooltip>
            </div>
          );
        })}
      </div>
      {totalFiringAlertsCount > 0 && (
        <div className="pf-v6-u-pt-md" style={{ paddingBottom: 24 }}>
          <Button variant="link" isInline onClick={() => onViewAllFiringAlerts?.()} isDisabled={!onViewAllFiringAlerts}>View all firing alerts ({totalFiringAlertsCount})</Button>
        </div>
      )}
      {componentInsightsTop5.length > 0 && (
        <>
          <Flex gap={{ default: 'gapXs' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: 6 }}>
            <Title headingLevel="h3" size="lg">Most Affected Components</Title>
            <Tooltip content="Components are Kubernetes subsystems (e.g. kube-apiserver, etcd, kubelet) that are affected by firing alerts. This section highlights which components are most impacted across your fleet so you can prioritize investigation.">
              <Button variant="plain" aria-label="More info about affected components" icon={<HelpIcon />} />
            </Tooltip>
          </Flex>
          <div style={{ ...INSIGHTS_LIST_WRAPPER, display: 'flex', flexDirection: 'column' }}>
            {componentInsightsTop5.map((comp, index) => {
              const dominantSeverity: SeverityKey = comp.critical > 0 ? 'Critical' : comp.warning > 0 ? 'Warning' : 'Info';
              const clusterCount = comp.clusters.length;
              const isLast = index === componentInsightsTop5.length - 1;
              return (
                <div key={comp.name} style={{ ...INSIGHTS_LIST_ITEM, ...(isLast ? INSIGHTS_LIST_ITEM_LAST : {}) }}>
                  <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }} flexWrap={{ default: 'wrap' }} gap={{ default: 'gapSm' }}>
                    <FlexItem style={{ flexShrink: 0 }}>
                      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                        <Label isCompact color={dominantSeverity === 'Critical' ? 'red' : dominantSeverity === 'Warning' ? 'orange' : 'purple'} icon={SEVERITY_ICONS[dominantSeverity]}>{dominantSeverity}</Label>
                        <span style={{ fontWeight: 600, color: 'var(--pf-t--global--text--color--regular)' }}>{comp.name}</span>
                        <span style={{ fontWeight: 400, color: 'var(--pf-t--global--text--color--subtle)' }}>{clusterCount} cluster{clusterCount !== 1 ? 's' : ''}</span>
                      </Flex>
                    </FlexItem>
                    <FlexItem style={{ flexShrink: 0 }}>
                      <Flex gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsCenter' }}>
                        {getComponentActions(comp.name).map((action) => (
                          <Button key={action.label} variant="link" isInline style={INSIGHTS_LINK} className="pf-v6-u-font-size-sm" onClick={action.onClick}>{action.label}</Button>
                        ))}
                        <Button variant="link" isInline style={INSIGHTS_LINK} className="pf-v6-u-font-size-sm" onClick={() => onComponentClick(comp.name)}>View alert</Button>
                      </Flex>
                    </FlexItem>
                  </Flex>
                  <Tooltip content={getComponentAiInsight(comp.name)}>
                    <Flex alignItems={{ default: 'alignItemsFlexStart' }} gap={{ default: 'gapXs' }} style={{ marginTop: 6, width: '100%' }} role="note" aria-label="AI insight">
                      <span style={AI_INSIGHT_ICON_STYLE} aria-hidden="true"><OptimizeIcon style={{ width: 14, height: 14 }} /></span>
                      <span style={{ fontSize: 'var(--pf-t--global--font--size--sm)', minWidth: 0, flex: 1 }}>
                        <span style={{ fontWeight: 600, color: 'var(--pf-t--global--text--color--subtle)' }}>AI Insight: </span>
                        <span style={AI_INSIGHT_TEXT_STYLE} title={getComponentAiInsight(comp.name)}>{getComponentAiInsight(comp.name)}</span>
                      </span>
                    </Flex>
                  </Tooltip>
                </div>
              );
            })}
          </div>
          {componentCount > 0 && (
            <div className="pf-v6-u-pt-md pf-v6-u-pb-sm">
              <Button variant="link" isInline onClick={() => onViewAllClusters?.()} isDisabled={!onViewAllClusters}>View all affected components ({componentCount})</Button>
            </div>
          )}
        </>
      )}
    </>
  );
};

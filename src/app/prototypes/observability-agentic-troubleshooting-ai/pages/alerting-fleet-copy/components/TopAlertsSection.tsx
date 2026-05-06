import * as React from 'react';
import { Flex, FlexItem, Title, Label, Button, Content } from '@patternfly/react-core';
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
  OptimizeIcon,
  ExternalLinkAltIcon,
} from '@patternfly/react-icons';
import {
  INSIGHTS_LIST_SIZE,
  INSIGHTS_LINK,
  getAlertAiInsight,
  getAlertActions,
  INSIGHTS_LIST_WRAPPER,
  INSIGHTS_LIST_ITEM,
  INSIGHTS_LIST_ITEM_LAST,
  AI_INSIGHT_ICON_STYLE,
  AI_INSIGHT_TEXT_STYLE,
} from '../data/fleetInsightsConfig';
import type { LightspeedInvestigateContext } from './OpenShiftLightspeedPanel';

type SeverityKey = 'Critical' | 'Warning' | 'Info';

const SEVERITY_ICONS: Record<SeverityKey, React.ReactNode> = {
  Critical: <ExclamationCircleIcon />,
  Warning: <ExclamationTriangleIcon />,
  Info: <InfoCircleIcon />,
};

export interface AlertRuleRow {
  name: string;
  critical: number;
  warning: number;
  info: number;
  clusters: string[];
}

export interface TopAlertsSectionProps {
  alertRuleData: AlertRuleRow[];
  totalFiringAlertsCount: number;
  hasAlertData: boolean;
  onAlertRuleClick: (name: string) => void;
  onOpenLightspeed: (ctx: LightspeedInvestigateContext) => void;
  onViewAllFiringAlerts?: () => void;
  /** When false, omit the internal “Top alerts” heading (e.g. card supplies its own title). */
  showSectionHeading?: boolean;
}

/**
 * “Top alerts” list from Fleet-wide alert impact (Insights view). Shared with AI Hub “Top firing alerts” card.
 */
export const TopAlertsSection: React.FC<TopAlertsSectionProps> = ({
  alertRuleData,
  totalFiringAlertsCount,
  hasAlertData,
  onAlertRuleClick,
  onOpenLightspeed,
  onViewAllFiringAlerts,
  showSectionHeading = true,
}) => {
  if (!hasAlertData) {
    return (
      <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentCenter' }} style={{ flex: 1 }}>
        <Content component="p" className="pf-v6-u-color-200">
          No alerts
        </Content>
      </Flex>
    );
  }

  return (
    <>
      {showSectionHeading ? (
        <Title headingLevel="h3" size="lg" style={{ marginBottom: 6 }}>
          Top alerts
        </Title>
      ) : null}
      <div style={{ ...INSIGHTS_LIST_WRAPPER, display: 'flex', flexDirection: 'column' }}>
        {alertRuleData.slice(0, INSIGHTS_LIST_SIZE).map((rule, index) => {
          const dominantSeverity: SeverityKey = rule.critical > 0 ? 'Critical' : rule.warning > 0 ? 'Warning' : 'Info';
          const clusterCount = rule.clusters.length;
          const isLast = index === Math.min(INSIGHTS_LIST_SIZE, alertRuleData.length) - 1;
          return (
            <div key={rule.name} style={{ ...INSIGHTS_LIST_ITEM, ...(isLast ? INSIGHTS_LIST_ITEM_LAST : {}) }}>
              <Flex
                alignItems={{ default: 'alignItemsCenter' }}
                justifyContent={{ default: 'justifyContentSpaceBetween' }}
                flexWrap={{ default: 'wrap' }}
                gap={{ default: 'gapSm' }}
              >
                <FlexItem style={{ flexShrink: 0 }}>
                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                    <Label
                      isCompact
                      color={
                        dominantSeverity === 'Critical' ? 'red' : dominantSeverity === 'Warning' ? 'orange' : 'purple'
                      }
                      icon={SEVERITY_ICONS[dominantSeverity]}
                    >
                      {dominantSeverity}
                    </Label>
                    <span style={{ fontWeight: 600, color: 'var(--pf-t--global--text--color--regular)' }}>{rule.name}</span>
                    <span style={{ fontWeight: 400, color: 'var(--pf-t--global--text--color--subtle)' }}>
                      {clusterCount} cluster{clusterCount !== 1 ? 's' : ''}
                    </span>
                  </Flex>
                </FlexItem>
                <FlexItem style={{ flexShrink: 0 }}>
                  <Flex gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsCenter' }}>
                    {getAlertActions(rule.name).map((action) => (
                      <Button
                        key={action.label}
                        variant="link"
                        isInline
                        style={INSIGHTS_LINK}
                        className="pf-v6-u-font-size-sm"
                        onClick={action.onClick}
                        {...(action.label.toLowerCase().includes('runbook')
                          ? { icon: <ExternalLinkAltIcon />, iconPosition: 'end' as const }
                          : {})}
                      >
                        {action.label}
                      </Button>
                    ))}
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
              <Flex
                alignItems={{ default: 'alignItemsFlexStart' }}
                gap={{ default: 'gapXs' }}
                style={{ marginTop: 6, width: '100%' }}
                role="note"
                aria-label="AI insight"
              >
                <span style={AI_INSIGHT_ICON_STYLE} aria-hidden="true">
                  <OptimizeIcon style={{ width: 14, height: 14 }} />
                </span>
                <span style={{ fontSize: 'var(--pf-t--global--font--size--sm)', minWidth: 0, flex: 1, lineHeight: 1.5 }}>
                  <span style={{ fontWeight: 600, color: 'var(--pf-t--global--text--color--subtle)' }}>AI insight: </span>
                  <span style={AI_INSIGHT_TEXT_STYLE}>{getAlertAiInsight(rule.name)}</span>{' '}
                  <Button
                    variant="link"
                    isInline
                    className="pf-v6-u-font-size-sm"
                    style={{ ...INSIGHTS_LINK, padding: 0, verticalAlign: 'baseline' }}
                    onClick={() =>
                      onOpenLightspeed({
                        sourceType: 'alert',
                        sourceName: rule.name,
                        aiInsightText: getAlertAiInsight(rule.name),
                      })
                    }
                  >
                    Investigate with AI
                  </Button>
                </span>
              </Flex>
            </div>
          );
        })}
      </div>
      {totalFiringAlertsCount > 0 && (
        <div className="pf-v6-u-pt-md" style={{ paddingBottom: 24 }}>
          <Button variant="link" isInline onClick={() => onViewAllFiringAlerts?.()} isDisabled={!onViewAllFiringAlerts}>
            View all firing alerts ({totalFiringAlertsCount})
          </Button>
        </div>
      )}
    </>
  );
};

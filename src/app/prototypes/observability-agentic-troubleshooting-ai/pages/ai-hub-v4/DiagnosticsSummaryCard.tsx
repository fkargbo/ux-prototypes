/**
 * v4.0 — Plans Overview KPI card (right, Row 1).
 * Active Plans · Plans in Sandbox · Est. MTTR Saved.
 * Flat, borderless design matching v3 "Fleet health & diagnostics".
 */
import React, { useMemo } from 'react';
import {
  Card,
  CardBody,
  Content,
  Divider,
  Flex,
  FlexItem,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import { V4_PLANS_KPI } from './v4Data';
import { AI_EXPERIENCE_ICON_DATA_URL } from '../../components/autonomousAiObserve/aiExperienceIconUrl';
import '../ai-hub-v3/ai-hub-v3-inventory.css';

const AI_TOOLTIP =
  'These metrics are synthesized by the autonomous AI agent based on active plan states and historical resolution data.';

const AiDisclosureIcon: React.FC = () => (
  <Tooltip content={AI_TOOLTIP} position="top">
    <span
      tabIndex={0}
      role="img"
      aria-label="AI-synthesized metric"
      className="ols-ai-diagnostics-disclosure-icon"
    >
      <img src={AI_EXPERIENCE_ICON_DATA_URL} alt="" aria-hidden="true" width={14} height={14} style={{ display: 'block' }} />
    </span>
  </Tooltip>
);

interface KpiCellProps {
  label: string;
  value: React.ReactNode;
  ariaLabel: string;
  valueColor?: string;
}

const KpiCell: React.FC<KpiCellProps> = ({ label, value, ariaLabel, valueColor }) => (
  <Flex direction={{ default: 'column' }} gap={{ default: 'gapXs' }} aria-label={ariaLabel}>
    <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }}>
      <FlexItem><AiDisclosureIcon /></FlexItem>
      <Content component="p" className="ols-ai-hub-fleet-inventory-label ols-ai-diagnostics-kpi-label" style={{ margin: 0 }}>
        {label}
      </Content>
    </Flex>
    <span className="ols-aio-card-stat-number--readonly" style={valueColor ? { color: valueColor } : undefined}>
      {value}
    </span>
  </Flex>
);

export const DiagnosticsSummaryCard: React.FC = () => {
  const kpi = useMemo(() => V4_PLANS_KPI, []);

  return (
    <Card isCompact component="section" aria-label="Plans overview" className="ols-ai-hub-diagnostics-card">
      <CardBody>
        <Title headingLevel="h2" size="lg" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
          Plans overview
        </Title>

        <Flex
          direction={{ default: 'row' }}
          flexWrap={{ default: 'wrap' }}
          alignItems={{ default: 'alignItemsCenter' }}
          style={{ width: '100%', rowGap: 'var(--pf-t--global--spacer--md)' }}
          role="list"
          aria-label="Plans overview KPI summary"
        >
          <FlexItem role="listitem" style={{ flex: '1 1 0', minWidth: 0 }}>
            <KpiCell label="Active plans" ariaLabel={`Active plans: ${kpi.activePlans}`} value={kpi.activePlans} />
          </FlexItem>

          <FlexItem alignSelf={{ default: 'alignSelfStretch' }} style={{ display: 'flex', alignItems: 'stretch', flexShrink: 0 }} aria-hidden="true">
            <Divider orientation={{ default: 'vertical' }} />
          </FlexItem>

          <FlexItem role="listitem" style={{ flex: '1 1 0', minWidth: 0 }}>
            <KpiCell label="Plans in sandbox" ariaLabel={`Plans in sandbox: ${kpi.plansInSandbox}`} value={kpi.plansInSandbox} />
          </FlexItem>

          <FlexItem alignSelf={{ default: 'alignSelfStretch' }} style={{ display: 'flex', alignItems: 'stretch', flexShrink: 0 }} aria-hidden="true">
            <Divider orientation={{ default: 'vertical' }} />
          </FlexItem>

          <FlexItem role="listitem" style={{ flex: '1 1 0', minWidth: 0 }}>
            <KpiCell
              label="Est. MTTR saved"
              ariaLabel={`Estimated MTTR saved: ${kpi.estMttrSaved}`}
              value={kpi.estMttrSaved}
              valueColor="var(--pf-t--global--color--status--success--default)"
            />
          </FlexItem>
        </Flex>
      </CardBody>
    </Card>
  );
};

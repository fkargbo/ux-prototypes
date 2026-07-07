/**
 * v4.0 — Plans Overview KPI card.
 * Right card in Row 1 of the Recommendation Hub layout.
 * Tracks: Active Plans · Plans in Sandbox · Estimated MTTR Saved.
 */
import React, { useMemo } from 'react';
import {
  Card,
  CardBody,
  Divider,
  Flex,
  FlexItem,
  Title,
  Tooltip,
  Content,
} from '@patternfly/react-core';
import { V4_PLANS_KPI } from './v4Data';
import { AI_EXPERIENCE_ICON_DATA_URL } from '../../components/autonomousAiObserve/aiExperienceIconUrl';
import '../ai-hub-v3/ai-hub-v3-inventory.css';

// ─── Design tokens ────────────────────────────────────────────────────────────

const SUBTLE = 'var(--pf-t--global--text--color--subtle)';

// ─── AI disclosure icon ───────────────────────────────────────────────────────

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
      <img
        src={AI_EXPERIENCE_ICON_DATA_URL}
        alt=""
        aria-hidden="true"
        width={14}
        height={14}
        style={{ display: 'block' }}
      />
    </span>
  </Tooltip>
);

// ─── KPI cell ─────────────────────────────────────────────────────────────────

interface KpiCellProps {
  label: string;
  value: React.ReactNode;
  ariaLabel: string;
  valueColor?: string;
  isAi?: boolean;
}

const KpiCell: React.FC<KpiCellProps> = ({ label, value, ariaLabel, valueColor, isAi }) => (
  <Flex direction={{ default: 'column' }} gap={{ default: 'gapXs' }} aria-label={ariaLabel}>
    <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }}>
      {isAi && (
        <FlexItem>
          <AiDisclosureIcon />
        </FlexItem>
      )}
      <Content
        component="p"
        className="ols-ai-hub-fleet-inventory-label ols-ai-diagnostics-kpi-label"
        style={{ margin: 0 }}
      >
        {label}
      </Content>
    </Flex>
    <span
      className="ols-aio-card-stat-number--readonly"
      style={valueColor ? { color: valueColor } : undefined}
    >
      {value}
    </span>
  </Flex>
);

// ─── Component ────────────────────────────────────────────────────────────────

export const DiagnosticsSummaryCard: React.FC = () => {
  const kpi = useMemo(() => V4_PLANS_KPI, []);

  return (
    <Card
      isCompact
      component="section"
      aria-label="Plans overview"
      className="ols-ai-hub-diagnostics-card"
    >
      <CardBody>
        <Title
          headingLevel="h2"
          size="md"
          style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
        >
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
          {/* ── Active plans ──────────────────────────────────────────────── */}
          <FlexItem role="listitem" style={{ flex: '1 1 0', minWidth: 0 }}>
            <KpiCell
              label="Active plans"
              ariaLabel={`Active plans: ${kpi.activePlans}`}
              value={kpi.activePlans}
              isAi
            />
          </FlexItem>

          {/* ── Visual guardrail ──────────────────────────────────────────── */}
          <FlexItem
            alignSelf={{ default: 'alignSelfStretch' }}
            style={{ display: 'flex', alignItems: 'stretch', flexShrink: 0 }}
            aria-hidden="true"
          >
            <Divider orientation={{ default: 'vertical' }} />
          </FlexItem>

          {/* ── Plans in sandbox ──────────────────────────────────────────── */}
          <FlexItem role="listitem" style={{ flex: '1 1 0', minWidth: 0 }}>
            <KpiCell
              label="Plans in sandbox"
              ariaLabel={`Plans currently in sandbox: ${kpi.plansInSandbox}`}
              value={kpi.plansInSandbox}
              isAi
            />
          </FlexItem>

          {/* ── Visual guardrail ──────────────────────────────────────────── */}
          <FlexItem
            alignSelf={{ default: 'alignSelfStretch' }}
            style={{ display: 'flex', alignItems: 'stretch', flexShrink: 0 }}
            aria-hidden="true"
          >
            <Divider orientation={{ default: 'vertical' }} />
          </FlexItem>

          {/* ── Est. MTTR saved ───────────────────────────────────────────── */}
          <FlexItem role="listitem" style={{ flex: '1 1 0', minWidth: 0 }}>
            <KpiCell
              label="Est. MTTR saved"
              ariaLabel={`Estimated MTTR saved: ${kpi.estMttrSaved}`}
              value={kpi.estMttrSaved}
              valueColor={SUBTLE}
              isAi
            />
          </FlexItem>
        </Flex>
      </CardBody>
    </Card>
  );
};

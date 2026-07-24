/**
 * v4.0 — Recommendation / AI Investigation Hub page.
 *
 * Split-tier layout:
 *   Header  — "Recommendation / AI Investigation Hub" · "Fleet Scope" badge · Credits meter
 *   Row 1   — FleetInventoryBar (left) | DiagnosticsSummaryCard (right)
 *   Row 2   — TODO: Top Impactful Plans Hero (out of scope for this story)
 *   Row 3   — ActivePlansTable (full-width)
 *
 * Route: /v4/agentic-plans/recommendation-hub
 * Epic:  HPUX-1653 · Story: Recommendation Hub inbox UI (inventory, KPI, plans table)
 */
import React, { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Badge,
  Content,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Label,
  Progress,
  ProgressSize,
  Stack,
  StackItem,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import { useBannerVersionSelection } from '@app/core/bannerVersionPicker';
import { config as prototypeConfig } from '../../prototype.config';
import { V4_CREDITS } from './v4Data';
import { FleetInventoryBar } from './FleetInventoryBar';
import { DiagnosticsSummaryCard } from './DiagnosticsSummaryCard';
import { ActivePlansTable } from './ActivePlansTable';

// ─── Credits meter ────────────────────────────────────────────────────────────

const CreditsUsageMeter: React.FC = () => {
  const credits = useMemo(() => V4_CREDITS, []);
  const usedPct  = Math.round((credits.used / credits.total) * 100);
  const remaining = credits.total - credits.used;

  const meterColor =
    usedPct >= 90 ? 'var(--pf-t--global--color--status--danger--default)'
    : usedPct >= 70 ? 'var(--pf-t--global--color--status--warning--default)'
    : 'var(--pf-t--global--color--status--success--default)';

  return (
    <Tooltip
      content={`${remaining.toLocaleString()} credits remaining (${100 - usedPct}%)`}
      position="bottom"
    >
      <div style={{ minWidth: '200px', cursor: 'default' }} tabIndex={0} aria-label={`Credits: ${credits.used.toLocaleString()} of ${credits.total.toLocaleString()} used`}>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} style={{ marginBottom: '4px' }}>
          <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontWeight: 600, letterSpacing: '0.04em' }}>
            CREDITS
          </Content>
          <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
            {credits.used.toLocaleString()} / {credits.total.toLocaleString()}
          </Content>
        </Flex>
        <Progress
          value={usedPct}
          size={ProgressSize.sm}
          aria-label="Agent credits usage"
          title=""
          style={{ '--pf-v5-c-progress__bar--before--BackgroundColor': meterColor } as React.CSSProperties}
        />
      </div>
    </Tooltip>
  );
};

// ─── Page shell ───────────────────────────────────────────────────────────────

export const RecommendationHubPage: React.FC = () => {
  const bannerVersionKey = useBannerVersionSelection(
    prototypeConfig.id,
    prototypeConfig.bannerVersionPicker?.defaultKey ?? 'v3'
  );

  if (bannerVersionKey !== 'v4') {
    return <Navigate to="/post-5-0/ai-hub" replace />;
  }

  return (
    <div
      style={{
        height: '100vh',
        padding: '24px',
        boxSizing: 'border-box',
        backgroundColor: 'var(--pf-v5-global--BackgroundColor--100, #f5f5f5)',
        overflow: 'auto',
      }}
    >
      <Stack hasGutter>
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <StackItem>
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            gap={{ default: 'gapMd' }}
            flexWrap={{ default: 'wrap' }}
          >
            {/* Title + badge */}
            <FlexItem>
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                <FlexItem>
                  <Title headingLevel="h1" size="2xl">
                    Recommendation / AI Investigation Hub
                  </Title>
                </FlexItem>
                <FlexItem>
                  <Label
                    color="blue"
                    style={{ fontWeight: 700, letterSpacing: '0.04em' }}
                    aria-label="Fleet scope indicator"
                  >
                    Fleet Scope
                  </Label>
                </FlexItem>
              </Flex>
              <Content component="p" style={{ marginTop: 'var(--pf-t--global--spacer--xs)', color: 'var(--pf-t--global--text--color--subtle)', marginBottom: 0 }}>
                AI-prioritised plan inbox across all managed clusters. Review, sandbox-test, and approve autonomous remediation proposals.
              </Content>
            </FlexItem>

            {/* Credits meter — right-aligned */}
            <FlexItem align={{ default: 'alignRight' }}>
              <CreditsUsageMeter />
            </FlexItem>
          </Flex>
        </StackItem>

        {/* ── Row 1 — KPI & Inventory tier ────────────────────────────────── */}
        <StackItem>
          <Grid hasGutter md={6}>
            <GridItem>
              <FleetInventoryBar />
            </GridItem>
            <GridItem>
              <DiagnosticsSummaryCard />
            </GridItem>
          </Grid>
        </StackItem>

        {/* ── Row 2 — Hero spacer (out of scope) ──────────────────────────── */}
        {/*
         * TODO: Row 2 Top Impactful Plans Hero is out of scope for this story.
         *       Scaffold the component here when HPUX-1653 hero sub-task is ready.
         *       Suggested component: <TopImpactfulPlansHero /> from ./TopImpactfulPlansHero.tsx
         */}
        <StackItem>
          <div
            aria-hidden="true"
            style={{
              height: '4px',
              borderRadius: '2px',
              background: 'repeating-linear-gradient(90deg, var(--pf-t--global--border--color--default) 0 8px, transparent 8px 16px)',
              opacity: 0.35,
            }}
            title="Row 2 — Top Impactful Plans Hero (out of scope)"
          />
        </StackItem>

        {/* ── Row 3 — All Active Plans data tier ──────────────────────────── */}
        <StackItem>
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--pf-t--global--border--radius--medium)',
              border: '1px solid var(--pf-t--global--border--color--default)',
              padding: '24px',
            }}
          >
            <ActivePlansTable />
          </div>
        </StackItem>
      </Stack>
    </div>
  );
};

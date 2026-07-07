/**
 * v4.0 — Recommendation / AI Investigation Hub page.
 *
 * Split-tier layout:
 *   Header  — Page title + "Fleet Scope" badge
 *   Row 1   — FleetInventoryBar (left) + DiagnosticsSummaryCard / Plans Overview KPI (right)
 *   Row 2   — (out of scope) Top Impactful Plans hero — structural placeholder only
 *   Row 3   — ActivePlansTable (full-width)
 *
 * Route: /v4/agentic-plans/recommendation-hub
 * Epic:  HPUX-1653 · Story: Recommendation Hub inbox UI (inventory, KPI, plans table)
 *
 * ISOLATION GUARDRAIL: This file imports ONLY from ai-hub-v4/*.  It does NOT
 * import from ai-hub-v3, ai-hub-v2, or any other prototype directory.
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import {
  Badge,
  Content,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { useBannerVersionSelection } from '@app/core/bannerVersionPicker';
import { config as prototypeConfig } from '../../prototype.config';
import { FleetInventoryBar } from './FleetInventoryBar';
import { DiagnosticsSummaryCard } from './DiagnosticsSummaryCard';
import { ActivePlansTable } from './ActivePlansTable';

// ─── Page shell ───────────────────────────────────────────────────────────────

export const RecommendationHubPage: React.FC = () => {
  // Mirror the same version key used by AIHubPage so that picking v1/v2/v3
  // from the banner while on this route redirects back to the AI Hub page,
  // which renders the correct version-gated UI.
  const bannerVersionKey = useBannerVersionSelection(
    prototypeConfig.id,
    prototypeConfig.bannerVersionPicker?.defaultKey ?? 'v3'
  );

  if (bannerVersionKey !== 'v4') {
    return <Navigate to="/core/observe/ai-hub" replace />;
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
          <FlexItem>
            <Title headingLevel="h1" size="2xl">
              Recommendation / AI Investigation Hub
            </Title>
          </FlexItem>
          <FlexItem>
            <Badge
              style={{
                backgroundColor: 'var(--pf-t--global--color--brand--default)',
                color: '#fff',
                fontSize: 'var(--pf-t--global--font--size--body--sm)',
                padding: '2px 8px',
                borderRadius: '10px',
                fontWeight: 'var(--pf-t--global--font--weight--body--bold)',
                letterSpacing: '0.02em',
              }}
            >
              Fleet Scope
            </Badge>
          </FlexItem>
        </Flex>
        <Content
          component="p"
          style={{
            marginTop: 'var(--pf-t--global--spacer--xs)',
            color: 'var(--pf-t--global--text--color--subtle)',
          }}
        >
          AI-prioritised plan inbox across all managed clusters. Review, sandbox-test, and approve
          autonomous remediation proposals.
        </Content>
      </StackItem>

      {/* ── Row 1 — KPI tier ────────────────────────────────────────────── */}
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
       *       Scaffold the component here when HPUX-1653 sub-task for the
       *       hero surface is ready. Suggested component name:
       *         <TopImpactfulPlansHero />
       *       from ./TopImpactfulPlansHero.tsx
       */}
      <StackItem>
        <div
          aria-hidden="true"
          style={{
            height: '4px',
            borderRadius: '2px',
            background:
              'repeating-linear-gradient(90deg, var(--pf-t--global--border--color--default) 0 8px, transparent 8px 16px)',
            opacity: 0.4,
          }}
          title="Row 2 — Top Impactful Plans Hero (out of scope)"
        />
      </StackItem>

      {/* ── Row 3 — Data tier ────────────────────────────────────────────── */}
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

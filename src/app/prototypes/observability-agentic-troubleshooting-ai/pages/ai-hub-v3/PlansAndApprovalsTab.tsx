import React from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  FlexItem,
  Label,
  Stack,
  StackItem,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { AI_EXPERIENCE_ICON_DATA_URL } from '../../components/autonomousAiObserve/aiExperienceIconUrl';

// ─── Types ────────────────────────────────────────────────────────────────────

type PlanSeverity = 'critical' | 'warning';

interface PlanRow {
  id: string;
  severity: PlanSeverity;
  /** AI-synthesised 0-100 impact score. */
  score: number;
  /** Short human-readable plan description (AI-synthesised). */
  synopsis: string;
  /** Objective telemetry summary, e.g. "42 Alerts". */
  consolidationScope: string;
  /** Infrastructure footprint, e.g. "3 Clusters". */
  blastRadius: string;
  /** Platform origin(s), e.g. "OCP / Network". */
  triggerDomains: string;
}

// ─── Dataset ──────────────────────────────────────────────────────────────────

const TOP_PLANS: PlanRow[] = [
  {
    id: 'p1',
    severity: 'critical',
    score: 94,
    synopsis: 'Remediate CVE-2026-1922',
    consolidationScope: '12 Nodes',
    blastRadius: '4 Fleets',
    triggerDomains: 'Security (ACS)',
  },
  {
    id: 'p2',
    severity: 'critical',
    score: 88,
    synopsis: 'Fix Core Ingress Mesh',
    consolidationScope: '42 Alerts',
    blastRadius: '3 Clusters',
    triggerDomains: 'OCP / Network',
  },
  {
    id: 'p3',
    severity: 'critical',
    score: 82,
    synopsis: 'Patch Tekton Pipeline',
    consolidationScope: '2 Blocks',
    blastRadius: '1 Cluster',
    triggerDomains: 'Pipelines / ACS',
  },
];

const ALL_PLANS: PlanRow[] = [
  {
    id: 'p4',
    severity: 'warning',
    score: 71,
    synopsis: 'Rotate IAM Certs Early',
    consolidationScope: '1 Warning',
    blastRadius: '1 Cluster',
    triggerDomains: 'OCP Auth',
  },
  {
    id: 'p5',
    severity: 'warning',
    score: 45,
    synopsis: 'Adjust Microservice Limits',
    consolidationScope: '3 Alerts',
    blastRadius: '2 Clusters',
    triggerDomains: 'OCP Optimize',
  },
];

// ─── AI disclosure ────────────────────────────────────────────────────────────

const AI_TOOLTIP =
  'This metric is synthesized by the autonomous AI SRE agent based on live cluster states and historical patterns.';

const AiSparkle: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <Tooltip content={AI_TOOLTIP} position="top">
    <span
      tabIndex={0}
      role="img"
      aria-label="AI-synthesized metric"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        verticalAlign: 'middle',
        cursor: 'help',
        marginLeft: '3px',
        flexShrink: 0,
      }}
    >
      <img
        src={AI_EXPERIENCE_ICON_DATA_URL}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        style={{ display: 'block' }}
      />
    </span>
  </Tooltip>
);

// ─── Severity badge ───────────────────────────────────────────────────────────

const SeverityBadge: React.FC<{ severity: PlanSeverity }> = ({ severity }) =>
  severity === 'critical' ? (
    <Label color="red" isCompact>
      Critical
    </Label>
  ) : (
    <Label color="yellow" isCompact>
      Warning
    </Label>
  );

// ─── Shared table ─────────────────────────────────────────────────────────────

const SCORE_STYLE: React.CSSProperties = {
  fontWeight: 600,
  color: 'var(--pf-t--global--text--color--regular)',
};

const SCOPE_STYLE: React.CSSProperties = {
  color: 'var(--pf-t--global--text--color--regular)',
  fontWeight: 400,
};

const PlansTable: React.FC<{ rows: PlanRow[]; ariaLabel: string }> = ({ rows, ariaLabel }) => (
  <Table aria-label={ariaLabel} style={{ tableLayout: 'fixed', width: '100%' }}>
    <Thead>
      <Tr>
        <Th style={{ width: '8%' }}>SEV</Th>
        <Th style={{ width: '9%' }}>
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            gap={{ default: 'gapXs' }}
            flexWrap={{ default: 'nowrap' }}
          >
            <FlexItem>SCORE</FlexItem>
            <FlexItem>
              <AiSparkle />
            </FlexItem>
          </Flex>
        </Th>
        <Th style={{ width: '26%' }}>
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            gap={{ default: 'gapXs' }}
            flexWrap={{ default: 'nowrap' }}
          >
            <FlexItem>PLAN SYNOPSIS</FlexItem>
            <FlexItem>
              <AiSparkle />
            </FlexItem>
          </Flex>
        </Th>
        <Th style={{ width: '17%' }}>CONSOLIDATION SCOPE</Th>
        <Th style={{ width: '14%' }}>BLAST RADIUS</Th>
        <Th style={{ width: '16%' }}>TRIGGER DOMAINS</Th>
        <Th style={{ width: '10%' }}>ACTION</Th>
      </Tr>
    </Thead>
    <Tbody>
      {rows.map((row) => (
        <Tr key={row.id}>
          <Td dataLabel="SEV">
            <SeverityBadge severity={row.severity} />
          </Td>

          <Td dataLabel="SCORE">
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              gap={{ default: 'gapXs' }}
              flexWrap={{ default: 'nowrap' }}
            >
              <FlexItem>
                <span style={SCORE_STYLE}>{row.score}</span>
              </FlexItem>
              <FlexItem>
                <AiSparkle />
              </FlexItem>
            </Flex>
          </Td>

          <Td
            dataLabel="PLAN SYNOPSIS"
            style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
          >
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              gap={{ default: 'gapXs' }}
              flexWrap={{ default: 'nowrap' }}
            >
              <FlexItem>{row.synopsis}</FlexItem>
              <FlexItem>
                <AiSparkle />
              </FlexItem>
            </Flex>
          </Td>

          <Td dataLabel="CONSOLIDATION SCOPE">
            <span style={SCOPE_STYLE}>{row.consolidationScope}</span>
          </Td>

          <Td dataLabel="BLAST RADIUS">{row.blastRadius}</Td>

          <Td dataLabel="TRIGGER DOMAINS">{row.triggerDomains}</Td>

          <Td dataLabel="ACTION">
            <Button variant="secondary" size="sm">
              Review
            </Button>
          </Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
);

// ─── Section card ─────────────────────────────────────────────────────────────

interface PlansSectionCardProps {
  title: React.ReactNode;
  rows: PlanRow[];
  ariaLabel: string;
}

const PlansSectionCard: React.FC<PlansSectionCardProps> = ({ title, rows, ariaLabel }) => (
  <Card>
    <CardHeader>
      <Title headingLevel="h3" size="md" className="ols-aio-fleet-subcard-title">
        {title}
      </Title>
    </CardHeader>
    <CardBody style={{ paddingTop: 0, overflowX: 'auto' }}>
      <PlansTable rows={rows} ariaLabel={ariaLabel} />
    </CardBody>
  </Card>
);

// ─── Exported tab content ─────────────────────────────────────────────────────

export const PlansAndApprovalsTab: React.FC = () => (
  <Stack hasGutter>
    <StackItem>
      <PlansSectionCard
        ariaLabel="Top plans requiring attention"
        title={
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            gap={{ default: 'gapXs' }}
            flexWrap={{ default: 'nowrap' }}
          >
            <FlexItem>Top plans | Attention required (Impact Score</FlexItem>
            <FlexItem>
              <AiSparkle size={16} />
            </FlexItem>
            <FlexItem style={{ whiteSpace: 'nowrap' }}>&ge; 80)</FlexItem>
          </Flex>
        }
        rows={TOP_PLANS}
      />
    </StackItem>
    <StackItem>
      <PlansSectionCard
        ariaLabel="All plans"
        title={
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            gap={{ default: 'gapXs' }}
            flexWrap={{ default: 'nowrap' }}
          >
            <FlexItem>All plans (Impact Score</FlexItem>
            <FlexItem>
              <AiSparkle size={16} />
            </FlexItem>
            <FlexItem style={{ whiteSpace: 'nowrap' }}>&lt; 80)</FlexItem>
          </Flex>
        }
        rows={ALL_PLANS}
      />
    </StackItem>
  </Stack>
);

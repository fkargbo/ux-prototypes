import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  ClipboardCopyButton,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
  EmptyState,
  EmptyStateBody,
  ExpandableSection,
  Flex,
  FlexItem,
  Label,
  Popover,
  Title,
} from '@patternfly/react-core';
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ExternalLinkAltIcon,
  InfoCircleIcon,
  OutlinedQuestionCircleIcon,
} from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import {
  AnalysisLogsExpandable,
  type AnalysisLogsLifecycle,
} from './AnalysisLogsExpandable';
import { NamespaceResourceBadge } from './NamespaceResourceLink';
import type {
  AlertInvestigationAlertRow,
  AlertInvestigationCardData,
} from '../pages/ai-hub-plans-v2/alertInvestigationPlans';
import type { PlanStatus } from '../types/planStatus';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Run phases where a captured trace is meaningful to view. */
const TRACE_LINK_VISIBLE_STATUSES: ReadonlySet<PlanStatus> = new Set([
  'Analyzing',
  'Executing',
  'Completed',
  'Failed',
]);

/** Visible body rows before the alert table scrolls (header stays sticky). */
const ALERT_TABLE_MAX_VISIBLE_ROWS = 3;
/** Compact header + 3 body rows — keeps storm payloads scrollable without growing the card. */
const ALERT_TABLE_SCROLL_MAX_HEIGHT = `calc(2.25rem + ${ALERT_TABLE_MAX_VISIBLE_ROWS} * 2.75rem)`;

export type TriggerRequestSectionProps = {
  /** Raw `spec.request` prompt / alert event string. */
  request?: string | null;
  /** Optional id used for a11y / log expandable ids. */
  planId?: string;
  /** Drives analysis-logs streaming vs finished behavior + status badge. */
  logsLifecycle?: AnalysisLogsLifecycle;
  /** Mock log seed content (same payload previously used on Timeline). */
  logFinding?: string;
  logNarrative?: string;
  /**
   * When true, show the empty-state copy for analysis that failed before
   * payload ingestion (vs. simply missing request data).
   */
  analysisFailedToInitialize?: boolean;
  /** Distributed-tracing trace ID for this run, if captured. */
  traceId?: string;
  /** Current run status — combined with `traceId` to decide whether to show "View trace". */
  runStatus?: PlanStatus;
  /** When false, analysis logs render only on the Timeline (Agentic run details). */
  showAnalysisLogs?: boolean;
  /** When set, render the formatted Alert analysis card above the raw payload. */
  alertInvestigation?: AlertInvestigationCardData;
};

// ─── Builder (mock spec.request from plan metadata) ───────────────────────────

/** Convert a plan resource name into a Prometheus-style alertname. */
function toAlertName(name: string): string {
  return name
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * Builds a mock `spec.request` string from plan metadata.
 * Format mirrors alert-event prompts sent to the analysis agent.
 */
export function buildAgenticRunRequest(plan: {
  id: string;
  name?: string;
  synopsis: string;
  severity: string;
  namespace?: string;
  triggerDomain: string;
  alertName?: string;
}): string {
  const alertname = plan.alertName ?? toAlertName(plan.name ?? plan.id);
  const namespace = plan.namespace ?? 'default';
  return [
    `alertname="${alertname}" severity="${plan.severity}" namespace="${namespace}"`,
    `domain="${plan.triggerDomain}"`,
    `description="${plan.synopsis}"`,
    '',
    `Investigate the firing alert and propose remediation for ${alertname} in namespace ${namespace}.`,
  ].join('\n');
}

function SeverityBadge({ severity }: { severity: AlertInvestigationAlertRow['severity'] }) {
  if (severity === 'critical') {
    return (
      <Label color="red" isCompact icon={<ExclamationCircleIcon />}>
        Critical
      </Label>
    );
  }
  if (severity === 'info') {
    return (
      <Label color="purple" isCompact icon={<InfoCircleIcon />}>
        Info
      </Label>
    );
  }
  return (
    <Label color="yellow" isCompact icon={<ExclamationTriangleIcon />}>
      Warning
    </Label>
  );
}

function alertingHref(options: {
  alertName: string;
  clusterId?: string;
}): string {
  const params = new URLSearchParams();
  params.set('tab', 'alerts');
  params.set('scope', 'ai-hub');
  params.set('alertName', options.alertName);
  if (options.clusterId) {
    params.set('cluster', options.clusterId);
  }
  return `/core/observe/alerting?${params.toString()}`;
}

const stickyThStyle: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 1,
  backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Analysis request section — matches Root cause analysis section structure
 * (title row + `ols-aio-rca-box` body). For alert-triggered runs, surfaces a
 * compact Alert analysis table; raw payload stays in a collapsed expandable.
 */
export const TriggerRequestSection: React.FC<TriggerRequestSectionProps> = ({
  request,
  planId = 'run',
  logsLifecycle = 'completed',
  logFinding = 'Signal correlation in progress — querying fleet telemetry and alert history.',
  logNarrative = 'Root cause hypothesis generation in progress. Partial findings stream into the analysis log.',
  analysisFailedToInitialize = false,
  traceId,
  runStatus,
  showAnalysisLogs = true,
  alertInvestigation,
}) => {
  const navigate = useNavigate();
  const [isRawPayloadExpanded, setIsRawPayloadExpanded] = useState(false);
  const [isRawPayloadCopied, setIsRawPayloadCopied] = useState(false);
  const hasRequest = Boolean(request?.trim());
  const emptyMessage = analysisFailedToInitialize
    ? 'Analysis failed to initialize.'
    : 'Analysis request data unavailable.';
  const showTraceLink =
    Boolean(traceId) && Boolean(runStatus) && TRACE_LINK_VISIBLE_STATUSES.has(runStatus as PlanStatus);
  const rawPayloadCodeId = `analysis-request-raw-${planId}`;
  const rawPayloadCopyId = `${rawPayloadCodeId}-copy`;
  const alertRows = alertInvestigation?.alerts ?? [];

  const handleCopyRawPayload = () => {
    if (!request) return;
    navigator.clipboard.writeText(request);
    setIsRawPayloadCopied(true);
    window.setTimeout(() => setIsRawPayloadCopied(false), 2000);
  };

  return (
    <div className="ols-ai-hub-trigger-request">
      {/* ── Title row ────────────────────────────────────────────────────────── */}
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
        style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
      >
        <FlexItem>
          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
            <FlexItem>
              <Title headingLevel="h4" size="md" style={{ marginBottom: 0 }}>
                Analysis request
              </Title>
            </FlexItem>
            <FlexItem>
              <Popover
                aria-label="Analysis request help"
                headerContent="Analysis request"
                bodyContent="The original prompt or alert event string sent to the AI agent to initiate analysis."
              >
                <Button
                  variant="plain"
                  aria-label="More information about analysis request"
                  icon={<OutlinedQuestionCircleIcon />}
                />
              </Popover>
            </FlexItem>
          </Flex>
        </FlexItem>
        {showTraceLink && (
          <FlexItem>
            <Button
              variant="link"
              isInline
              component="a"
              href={`/core/observe/traces?traceId=${traceId}`}
              onClick={(event) => event.preventDefault()}
              aria-label={`View trace ${traceId}`}
            >
              View trace
            </Button>
          </FlexItem>
        )}
      </Flex>

      {/* ── Card body ────────────────────────────────────────────────────────── */}
      <div
        className="ols-aio-rca-box"
        style={{ borderRadius: '16px', overflow: 'hidden' }}
      >
        {alertInvestigation ? (
          <>
            <Title
              headingLevel="h5"
              size="md"
              style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
            >
              Alert analysis
            </Title>

            {alertRows.length > 0 ? (
              <div
                style={{
                  maxHeight: ALERT_TABLE_SCROLL_MAX_HEIGHT,
                  overflowY: alertRows.length > ALERT_TABLE_MAX_VISIBLE_ROWS ? 'auto' : 'visible',
                  marginBottom: 'var(--pf-t--global--spacer--md)',
                  borderBlockEnd: 'var(--pf-t--global--border--width--divider--default) solid var(--pf-t--global--border--color--default)',
                }}
              >
                <Table
                  aria-label="Correlated alerts for this analysis"
                  variant="compact"
                  gridBreakPoint=""
                >
                  <Thead>
                    <Tr>
                      <Th style={stickyThStyle}>Alert name</Th>
                      <Th style={stickyThStyle}>Severity</Th>
                      <Th style={stickyThStyle}>Namespace</Th>
                      <Th style={stickyThStyle}>Trigger domain</Th>
                      <Th style={stickyThStyle} screenReaderText="Actions" />
                    </Tr>
                  </Thead>
                  <Tbody>
                    {alertRows.map((row) => (
                      <Tr key={`${row.alertName}-${row.namespace}`}>
                        <Td dataLabel="Alert name">
                          <span style={{ fontFamily: 'var(--pf-t--global--font--family--mono)', fontSize: 'var(--pf-t--global--font--size--body--sm)' }}>
                            {row.alertName}
                          </span>
                        </Td>
                        <Td dataLabel="Severity">
                          <SeverityBadge severity={row.severity} />
                        </Td>
                        <Td dataLabel="Namespace">
                          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }} flexWrap={{ default: 'nowrap' }}>
                            <FlexItem>
                              <NamespaceResourceBadge />
                            </FlexItem>
                            <FlexItem>{row.namespace}</FlexItem>
                          </Flex>
                        </Td>
                        <Td dataLabel="Trigger domain">{row.triggerDomainLabel}</Td>
                        <Td dataLabel="Actions" modifier="fitContent">
                          <Button
                            variant="link"
                            isInline
                            icon={<ExternalLinkAltIcon />}
                            iconPosition="end"
                            onClick={() => {
                              navigate(
                                alertingHref({
                                  alertName: row.alertName,
                                  clusterId: row.clusterId,
                                }),
                              );
                            }}
                            aria-label={`View alert ${row.alertName} in Observe Alerting`}
                          >
                            View alert
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </div>
            ) : null}

            <div style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
              <span className="ols-aio-text-overline">Alert summary</span>
              <p
                style={{
                  margin: 'var(--pf-t--global--spacer--xs) 0 0',
                  color: 'var(--pf-t--global--text--color--regular)',
                  fontSize: 'var(--pf-t--global--font--size--body--sm)',
                }}
              >
                {alertInvestigation.summary}
              </p>
            </div>

            {hasRequest ? (
              <ExpandableSection
                toggleText={isRawPayloadExpanded ? 'Hide raw alert payload' : 'View raw alert payload'}
                isExpanded={isRawPayloadExpanded}
                onToggle={(_event, expanded) => setIsRawPayloadExpanded(expanded)}
              >
                <CodeBlock
                  actions={
                    <CodeBlockAction>
                      <ClipboardCopyButton
                        id={rawPayloadCopyId}
                        textId={rawPayloadCodeId}
                        aria-label="Copy raw alert payload to clipboard"
                        onClick={handleCopyRawPayload}
                        exitDelay={1000}
                        variant="plain"
                      >
                        {isRawPayloadCopied ? 'Copied!' : 'Copy'}
                      </ClipboardCopyButton>
                    </CodeBlockAction>
                  }
                >
                  <CodeBlockCode
                    id={rawPayloadCodeId}
                    style={{
                      fontSize: 'var(--pf-t--global--font--size--body--sm)',
                      maxHeight: '280px',
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {request}
                  </CodeBlockCode>
                </CodeBlock>
              </ExpandableSection>
            ) : (
              <EmptyState variant="xs">
                <EmptyStateBody>{emptyMessage}</EmptyStateBody>
              </EmptyState>
            )}
          </>
        ) : hasRequest ? (
          <pre
            style={{
              margin: 0,
              maxHeight: '280px',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'var(--pf-t--global--font--family--mono)',
              fontSize: 'var(--pf-t--global--font--size--body--sm)',
              color: 'var(--pf-t--global--text--color--regular)',
              background: 'transparent',
              border: 'none',
              padding: 0,
            }}
          >
            {request}
          </pre>
        ) : (
          <EmptyState variant="xs">
            <EmptyStateBody>{emptyMessage}</EmptyStateBody>
          </EmptyState>
        )}

        {showAnalysisLogs && (
          <div style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
            <AnalysisLogsExpandable
              planId={planId}
              finding={logFinding}
              narrative={logNarrative}
              lifecycle={logsLifecycle}
              idPrefix="analysis-request-log"
            />
          </div>
        )}
      </div>
    </div>
  );
};

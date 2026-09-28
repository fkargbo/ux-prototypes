import React, { useState } from 'react';
import {
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
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
  OutlinedQuestionCircleIcon,
} from '@patternfly/react-icons';
import {
  AnalysisLogsExpandable,
  type AnalysisLogsLifecycle,
} from './AnalysisLogsExpandable';
import { ExpandableCodeBlock } from './ExpandableCodeBlock';
import type { AlertInvestigationCardData } from '../pages/ai-hub-plans-v2/alertInvestigationPlans';
import type { PlanStatus } from '../types/planStatus';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Run phases where a captured trace is meaningful to view. */
const TRACE_LINK_VISIBLE_STATUSES: ReadonlySet<PlanStatus> = new Set([
  'Analyzing',
  'Executing',
  'Completed',
  'Failed',
]);

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
  /** When set, render the formatted Alert Investigation card above the raw payload. */
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

function SeverityBadge({ severity }: { severity: 'critical' | 'warning' }) {
  if (severity === 'critical') {
    return (
      <Label color="red" isCompact icon={<ExclamationCircleIcon />}>
        Critical
      </Label>
    );
  }
  return (
    <Label color="yellow" isCompact icon={<ExclamationTriangleIcon />}>
      Warning
    </Label>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Analysis request section — matches Root cause analysis section structure
 * (title row + `ols-aio-rca-box` body). For alert-triggered runs, surfaces a
 * formatted Alert Investigation summary; raw payload stays in a collapsed expandable.
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
  const [isRawPayloadExpanded, setIsRawPayloadExpanded] = useState(false);
  const hasRequest = Boolean(request?.trim());
  const emptyMessage = analysisFailedToInitialize
    ? 'Analysis failed to initialize.'
    : 'Analysis request data unavailable.';
  const showTraceLink =
    Boolean(traceId) && Boolean(runStatus) && TRACE_LINK_VISIBLE_STATUSES.has(runStatus as PlanStatus);
  const isAlertInvestigation = Boolean(alertInvestigation);

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
            {isAlertInvestigation ? (
              <FlexItem>
                <Label color="grey" isCompact>
                  Alert Investigation
                </Label>
              </FlexItem>
            ) : null}
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
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              gap={{ default: 'gapSm' }}
              flexWrap={{ default: 'wrap' }}
              style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
            >
              <FlexItem>
                <Title headingLevel="h5" size="md" style={{ marginBottom: 0 }}>
                  {alertInvestigation.alertName}
                </Title>
              </FlexItem>
              <FlexItem>
                <SeverityBadge severity={alertInvestigation.severity} />
              </FlexItem>
            </Flex>

            <DescriptionList
              isHorizontal
              isCompact
              style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
            >
              <DescriptionListGroup>
                <DescriptionListTerm>Namespace</DescriptionListTerm>
                <DescriptionListDescription>{alertInvestigation.namespace}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Trigger domain</DescriptionListTerm>
                <DescriptionListDescription>{alertInvestigation.triggerDomainLabel}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Workload</DescriptionListTerm>
                <DescriptionListDescription>{alertInvestigation.workload}</DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>

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
                <ExpandableCodeBlock
                  id={`analysis-request-raw-${planId}`}
                  code={request!}
                  codeStyle={{ fontSize: '12px', maxHeight: '280px', overflowY: 'auto' }}
                  maxCollapsedLines={12}
                />
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

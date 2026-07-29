import React from 'react';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Popover,
  Title,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import {
  AnalysisLogsExpandable,
  type AnalysisLogsLifecycle,
} from './AnalysisLogsExpandable';

// ─── Types ────────────────────────────────────────────────────────────────────

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
}): string {
  const alertname = toAlertName(plan.name ?? plan.id);
  const namespace = plan.namespace ?? 'default';
  return [
    `alertname="${alertname}" severity="${plan.severity}" namespace="${namespace}"`,
    `domain="${plan.triggerDomain}"`,
    `description="${plan.synopsis}"`,
    '',
    `Investigate the firing alert and propose remediation for ${alertname} in namespace ${namespace}.`,
  ].join('\n');
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Analysis request section — matches Root cause analysis section structure
 * (title row + `ols-aio-rca-box` body). Renders `spec.request` as plain
 * multi-line text and hosts "View analysis logs" at the bottom.
 */
export const TriggerRequestSection: React.FC<TriggerRequestSectionProps> = ({
  request,
  planId = 'run',
  logsLifecycle = 'completed',
  logFinding = 'Signal correlation in progress — querying fleet telemetry and alert history.',
  logNarrative = 'Root cause hypothesis generation in progress. Partial findings stream into the analysis log.',
  analysisFailedToInitialize = false,
}) => {
  const hasRequest = Boolean(request?.trim());
  const emptyMessage = analysisFailedToInitialize
    ? 'Analysis failed to initialize.'
    : 'Analysis request data unavailable.';

  return (
    <div className="ols-ai-hub-trigger-request">
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        gap={{ default: 'gapXs' }}
        style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
      >
        <FlexItem>
          <Title headingLevel="h4" size="md" style={{ marginBottom: 0 }}>
            Analysis request
          </Title>
        </FlexItem>
        <FlexItem>
          <Popover
            aria-label="Analysis request help"
            headerContent="Analysis request"
            bodyContent="The initial prompt and alert data passed to the agent."
          >
            <Button
              variant="plain"
              aria-label="More information about analysis request"
              icon={<OutlinedQuestionCircleIcon />}
            />
          </Popover>
        </FlexItem>
      </Flex>

      <div
        className="ols-aio-rca-box"
        style={{ borderRadius: '16px', overflow: 'hidden' }}
      >
        {hasRequest ? (
          <pre
            className="ols-aio-code-block"
            style={{
              margin: 0,
              maxHeight: '280px',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {request}
          </pre>
        ) : (
          <EmptyState variant="xs">
            <EmptyStateBody>{emptyMessage}</EmptyStateBody>
          </EmptyState>
        )}

        <div style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
          <AnalysisLogsExpandable
            planId={planId}
            finding={logFinding}
            narrative={logNarrative}
            lifecycle={logsLifecycle}
            idPrefix="analysis-request-log"
            showLifecycleBadge
          />
        </div>
      </div>
    </div>
  );
};

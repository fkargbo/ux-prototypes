import React from 'react';
import { Button, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import type { PlanStatus } from '../types/planStatus';

// ─── Lifecycle → trace-link behavior mapping ─────────────────────────────────
//
//   Analyzing | Executing            -> active link  ("View active trace"),  ?live=true
//   Completed | Failed (+ anything   -> standard link ("View trace")
//   past execution, e.g. Verifying,
//   Escalating/Escalated, Denied…)
//   Pending | Proposed | no trace_id -> disabled, tooltip: "Telemetry execution has not started."
//
// `isTracingInstalled=false` overrides all of the above with a disabled link +
// COO-install tooltip, since no trace can ever be viewed without the stack.

const ACTIVE_STATUSES: ReadonlySet<PlanStatus> = new Set(['Analyzing', 'Executing']);
const NOT_STARTED_STATUSES: ReadonlySet<PlanStatus> = new Set(['Pending', 'Proposed']);

export interface AgenticTraceLinkProps {
  /** Current agentic run lifecycle phase — drives the link label/destination. */
  status: PlanStatus;
  /** Distributed-tracing trace ID captured for this run, if any. */
  traceId?: string | null;
  /** Whether the Distributed Tracing stack (COO) is installed on the cluster. Defaults to `true`. */
  isTracingInstalled?: boolean;
}

function buildTraceHref(traceId: string, isLive: boolean): string {
  return isLive
    ? `/observe/traces?trace_id=${traceId}&live=true`
    : `/observe/traces?trace_id=${traceId}`;
}

/** Deterministic mock trace ID generator, keyed off the plan/run id — for prototype use only. */
export function generateMockTraceId(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return `trc-${hash.toString(16).padStart(8, '0')}`;
}

/**
 * "View trace" link for the Agentic Run details page — jumps to the
 * distributed-tracing (COO/Tempo) view for this run's trace_id, adapting its
 * label/destination/disabled-state to the run's lifecycle phase.
 */
export const AgenticTraceLink: React.FC<AgenticTraceLinkProps> = ({
  status,
  traceId,
  isTracingInstalled = true,
}) => {
  const hasTraceId = Boolean(traceId);
  const isActive = ACTIVE_STATUSES.has(status);
  const isNotStarted = NOT_STARTED_STATUSES.has(status) || !hasTraceId;

  if (!isTracingInstalled) {
    return (
      <Tooltip content="Distributed Tracing stack (COO) is required to view trace telemetry.">
        <Button
          variant="link"
          isInline
          isAriaDisabled
          icon={<ExternalLinkAltIcon />}
          iconPosition="end"
        >
          View trace
        </Button>
      </Tooltip>
    );
  }

  if (isNotStarted) {
    return (
      <Tooltip content="Telemetry execution has not started.">
        <Button
          variant="link"
          isInline
          isAriaDisabled
          icon={<ExternalLinkAltIcon />}
          iconPosition="end"
        >
          View trace
        </Button>
      </Tooltip>
    );
  }

  return (
    <Button
      variant="link"
      isInline
      component="a"
      href={buildTraceHref(traceId as string, isActive)}
      target="_blank"
      rel="noopener noreferrer"
      icon={<ExternalLinkAltIcon />}
      iconPosition="end"
    >
      {isActive ? 'View active trace' : 'View trace'}
    </Button>
  );
};

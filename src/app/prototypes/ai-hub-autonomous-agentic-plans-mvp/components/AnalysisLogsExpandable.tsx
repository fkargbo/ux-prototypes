import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Checkbox,
  ExpandableSection,
  Flex,
  FlexItem,
  Label,
  SearchInput,
  Spinner,
} from '@patternfly/react-core';
import type { PlanStatus } from '../types/planStatus';
import { ExpandableCodeBlock } from './ExpandableCodeBlock';

/** Analysis-phase log viewer lifecycle (independent of later execution phases). */
export type AnalysisLogsLifecycle = 'live' | 'completed' | 'failed' | 'cancelled';

/** Maps plan status → analysis-log viewer lifecycle. */
export function resolveAnalysisLogsLifecycle(status: PlanStatus): AnalysisLogsLifecycle {
  switch (status) {
    case 'Analyzing':
      return 'live';
    case 'Failed':
      return 'failed';
    case 'EmergencyStopped':
    case 'Plan aborted':
      return 'cancelled';
    default:
      return 'completed';
  }
}

/** Generates deterministic simulated analysis log lines for a plan's RCA section. */
export function generateAnalysisLogs(planId: string, finding: string, narrative: string): string {
  const h = planId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const mm = String(10 + (h % 49)).padStart(2, '0');
  const ts = (offset: number) => {
    const rawSec = (h % 60) + offset;
    const m = String(10 + (h % 49) + Math.floor(rawSec / 60)).padStart(2, '0');
    const s = String(rawSec % 60).padStart(2, '0');
    return `2026-07-02T08:${m}:${s}.000000000Z`;
  };
  void mm;
  const clip = (str: string, len = 90) => (str.length > len ? str.slice(0, len) + '...' : str);
  return [
    `${ts(0)}  INFO [analysis] Initializing investigation pipeline — plan_id=${planId}`,
    `${ts(1)}  INFO [probe]    GET /healthz 200 OK — liveness probe passed`,
    `${ts(2)}  INFO [signals]  Querying Prometheus TSDB for correlated alert signals...`,
    `${ts(4)}  INFO [signals]  ${clip(finding)}`,
    `${ts(5)}  INFO [probe]    GET /readyz  200 OK — readiness probe passed`,
    `${ts(7)}  INFO [model]    Dispatching signal corpus to LLM reasoning engine`,
    `${ts(9)}  INFO [model]    Hypothesis generation in progress (temperature=0.2, max_tokens=1024)`,
    `${ts(11)} INFO [probe]    GET /healthz 200 OK — liveness probe passed`,
    `${ts(12)} INFO [model]    Root cause hypothesis locked — confidence=0.87`,
    `${ts(14)} INFO [rca]      ${clip(narrative)}`,
    `${ts(15)} INFO [probe]    GET /readyz  200 OK — readiness probe passed`,
    `${ts(16)} INFO [rca]      Contributing factor graph traversal complete: 3 factors identified`,
    `${ts(17)} INFO [proposal] Root cause analysis complete. Generating remediation proposal...`,
    `${ts(18)} INFO [probe]    GET /healthz 200 OK — liveness probe passed`,
    `${ts(19)} INFO [proposal] Proposal ready — plan_id=${planId} is available for review.`,
  ].join('\n');
}

const HEALTH_CHECK_PATTERN = /\b(healthz|readyz|livez|liveness|readiness|health.check|probe)\b/i;

export type EvidenceLogFormat = 'txt' | 'json';

/**
 * Builds `evidence-log-[runId]-[timestamp].(txt|json)` —
 * e.g. `evidence-log-run-9482a-20260727.txt`.
 */
export function buildEvidenceLogFilename(runId: string, format: EvidenceLogFormat = 'txt'): string {
  const slug = (runId || 'run').replace(/[^a-z0-9._-]+/gi, '-').toLowerCase();
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `evidence-log-${slug}-${timestamp}.${format}`;
}

/**
 * Mock download handler: Blob + anchor click for raw `.txt` or structured `.json` evidence.
 * Always exports the full unfiltered audit trace, independent of search / health-check filters.
 */
export function downloadEvidenceLogFile(
  runId: string,
  logText: string,
  format: EvidenceLogFormat = 'txt',
): void {
  const filename = buildEvidenceLogFilename(runId, format);
  const body =
    format === 'json'
      ? JSON.stringify(
          {
            runId,
            exportedAt: new Date().toISOString(),
            format: 'agentic-analysis-evidence',
            lineCount: logText.split('\n').filter(Boolean).length,
            lines: logText.split('\n'),
            raw: logText,
          },
          null,
          2,
        )
      : logText;
  const mime = format === 'json' ? 'application/json' : 'text/plain';
  const blob = new Blob([body], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function lifecycleHeaderBadge(lifecycle: AnalysisLogsLifecycle): React.ReactNode {
  switch (lifecycle) {
    case 'live':
      return (
        <Label color="blue" isCompact icon={<Spinner size="sm" aria-label="Live streaming" />}>
          Live streaming
        </Label>
      );
    case 'failed':
      return (
        <Label color="red" isCompact>
          Failed
        </Label>
      );
    case 'cancelled':
      return (
        <Label color="orange" isCompact>
          Cancelled
        </Label>
      );
    case 'completed':
    default:
      return (
        <Label color="green" isCompact>
          Completed
        </Label>
      );
  }
}

export type AnalysisLogsExpandableProps = {
  planId: string;
  finding: string;
  narrative: string;
  /** Analysis-phase lifecycle driving trigger copy, badge, download, and streaming. */
  lifecycle: AnalysisLogsLifecycle;
  /** Prefix for checkbox / code-block ids (keeps multiple instances unique). */
  idPrefix?: string;
};

/**
 * PF ExpandableSection — "View analysis logs" / "View live logs".
 * Closed by default. Live mode streams lines with auto-scroll and hides download
 * until analysis finishes.
 */
export const AnalysisLogsExpandable: React.FC<AnalysisLogsExpandableProps> = ({
  planId,
  finding,
  narrative,
  lifecycle,
  idPrefix = 'analysis-log',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [hideHealthChecks, setHideHealthChecks] = useState(true);
  const logScrollRef = useRef<HTMLDivElement>(null);

  const isLive = lifecycle === 'live';
  const canDownload = lifecycle === 'completed' || lifecycle === 'failed' || lifecycle === 'cancelled';
  const toggleText = isExpanded
    ? isLive
      ? 'Hide live logs'
      : 'Hide analysis logs'
    : isLive
      ? 'View live logs'
      : 'View analysis logs';

  const allLines = useMemo(
    () => generateAnalysisLogs(planId, finding, narrative).split('\n'),
    [planId, finding, narrative],
  );

  const [streamedCount, setStreamedCount] = useState(() => (isLive ? 3 : allLines.length));

  useEffect(() => {
    setStreamedCount(isLive ? 3 : allLines.length);
  }, [isLive, allLines.length, planId]);

  // Append mock lines while live and expanded.
  useEffect(() => {
    if (!isLive || !isExpanded) return undefined;
    const timer = window.setInterval(() => {
      setStreamedCount((prev) => {
        if (prev >= allLines.length) return prev;
        return prev + 1;
      });
    }, 700);
    return () => window.clearInterval(timer);
  }, [isLive, isExpanded, allLines.length]);

  const rawLogs = allLines.slice(0, streamedCount).join('\n');
  const fullLogs = allLines.join('\n');
  const displayLogs = rawLogs
    .split('\n')
    .filter((l) => !hideHealthChecks || !HEALTH_CHECK_PATTERN.test(l))
    .filter((l) => !query.trim() || l.toLowerCase().includes(query.toLowerCase()))
    .join('\n');

  // Auto-scroll as new live lines append.
  useEffect(() => {
    if (!isLive || !isExpanded) return;
    const scrollTarget = logScrollRef.current;
    if (scrollTarget) {
      scrollTarget.scrollTop = scrollTarget.scrollHeight;
    }
    const el = logScrollRef.current?.querySelector('.pf-v6-c-code-block__content, pre, code');
    if (el instanceof HTMLElement) {
      el.scrollTop = el.scrollHeight;
    }
  }, [displayLogs, isLive, isExpanded]);

  return (
    <ExpandableSection
      toggleText={toggleText}
      isExpanded={isExpanded}
      onToggle={(_e, expanded) => {
        setIsExpanded(expanded);
        if (!expanded) setQuery('');
      }}
      style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
    >
      <div style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}>
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          gap={{ default: 'gapSm' }}
          style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
        >
          {lifecycleHeaderBadge(lifecycle)}
        </Flex>
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          gap={{ default: 'gapMd' }}
          style={{ marginBottom: 'calc(var(--pf-t--global--spacer--xs) + 4px)' }}
        >
          <FlexItem style={{ width: '200px', maxWidth: '200px', flexShrink: 0 }}>
            <SearchInput
              value={query}
              onChange={(_evt, val) => setQuery(val)}
              onClear={() => setQuery('')}
              placeholder="Search logs..."
            />
          </FlexItem>
          <FlexItem>
            <Checkbox
              id={`${idPrefix}-hc-${planId}`}
              label="Hide health checks"
              isChecked={hideHealthChecks}
              onChange={(_evt, checked) => setHideHealthChecks(checked)}
            />
          </FlexItem>
        </Flex>
        <div
          ref={logScrollRef}
          style={isLive ? { maxHeight: '280px', overflowY: 'auto' } : undefined}
        >
          <ExpandableCodeBlock
            id={`${idPrefix}-${planId}`}
            code={displayLogs}
            clipboardCode={isLive ? rawLogs : fullLogs}
            codeStyle={{
              fontSize: '12px',
              maxHeight: isLive ? undefined : '280px',
              overflowY: isLive ? undefined : 'auto',
              display: 'block',
            }}
            maxCollapsedLines={isLive ? Number.MAX_SAFE_INTEGER : 5}
            onDownload={
              canDownload
                ? () => downloadEvidenceLogFile(planId, fullLogs, 'txt')
                : undefined
            }
            downloadAriaLabel="Download log file"
          />
        </div>
      </div>
    </ExpandableSection>
  );
};

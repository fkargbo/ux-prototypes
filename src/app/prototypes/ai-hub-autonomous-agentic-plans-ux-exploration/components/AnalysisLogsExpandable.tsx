import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  ClipboardCopyButton,
  ExpandableSection,
  Flex,
  FlexItem,
  Label,
  SearchInput,
  Spinner,
} from '@patternfly/react-core';
import { LogViewer } from '@patternfly/react-log-viewer';
import { RhUiDownloadIcon } from '@patternfly/react-icons';
import type { PlanStatus } from '../types/planStatus';

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

function lifecycleToggleBadge(lifecycle: AnalysisLogsLifecycle): React.ReactNode {
  switch (lifecycle) {
    case 'live':
      return (
        <Label color="blue" isCompact icon={<Spinner size="sm" aria-label="Streaming" />}>
          Streaming
        </Label>
      );
    case 'failed':
      return (
        <Label color="red" isCompact>
          Failed
        </Label>
      );
    case 'cancelled':
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
  /** Analysis-phase lifecycle driving download and streaming. */
  lifecycle: AnalysisLogsLifecycle;
  /** Prefix for checkbox / code-block ids (keeps multiple instances unique). */
  idPrefix?: string;
  /** When true, show Streaming / Completed / Failed badge beside the toggle. */
  showLifecycleBadge?: boolean;
};

/**
 * PF ExpandableSection — "View analysis logs".
 * Closed by default. Live mode streams lines with auto-scroll and hides download
 * until analysis finishes.
 */
export const AnalysisLogsExpandable: React.FC<AnalysisLogsExpandableProps> = ({
  planId,
  finding,
  narrative,
  lifecycle,
  idPrefix = 'analysis-log',
  showLifecycleBadge = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [hideHealthChecks, setHideHealthChecks] = useState(true);
  const [copied, setCopied] = useState(false);

  const isLive = lifecycle === 'live';
  const canDownload = lifecycle === 'completed' || lifecycle === 'failed' || lifecycle === 'cancelled';
  const toggleLabel = isExpanded ? 'Hide analysis logs' : 'View analysis logs';

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
  const displayLines = allLines
    .slice(0, streamedCount)
    .filter((l) => !hideHealthChecks || !HEALTH_CHECK_PATTERN.test(l))
    .filter((l) => !query.trim() || l.toLowerCase().includes(query.toLowerCase()));
  const clipboardCode = isLive ? rawLogs : fullLogs;

  const handleCopy = () => {
    navigator.clipboard.writeText(clipboardCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ExpandableSection
      toggleText=""
      toggleContent={
        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
          <FlexItem>{toggleLabel}</FlexItem>
          {showLifecycleBadge ? <FlexItem>{lifecycleToggleBadge(lifecycle)}</FlexItem> : null}
        </Flex>
      }
      isExpanded={isExpanded}
      onToggle={(_e, expanded) => {
        setIsExpanded(expanded);
        if (!expanded) setQuery('');
      }}
      style={{ marginBottom: 0 }}
    >
      <div style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}>
        <Flex
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          alignItems={{ default: 'alignItemsCenter' }}
          gap={{ default: 'gapMd' }}
          style={{ marginBottom: 'calc(var(--pf-t--global--spacer--xs) + 4px)' }}
        >
          <FlexItem>
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
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
          </FlexItem>
          <FlexItem>
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }}>
              {canDownload && (
                <FlexItem>
                  <Button
                    variant="plain"
                    aria-label="Download log file"
                    onClick={() => downloadEvidenceLogFile(planId, fullLogs, 'txt')}
                    icon={<RhUiDownloadIcon />}
                  />
                </FlexItem>
              )}
              <FlexItem>
                <ClipboardCopyButton
                  id={`${idPrefix}-${planId}-copy`}
                  aria-label="Copy to clipboard"
                  onClick={handleCopy}
                  exitDelay={1000}
                  variant="plain"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </ClipboardCopyButton>
              </FlexItem>
            </Flex>
          </FlexItem>
        </Flex>
        <LogViewer
          data={displayLines}
          hasLineNumbers
          isTextWrapped
          height="280px"
          scrollToRow={isLive && displayLines.length > 0 ? displayLines.length - 1 : undefined}
        />
      </div>
    </ExpandableSection>
  );
};

import React, { useState } from 'react';
import {
  Checkbox,
  ExpandableSection,
  Flex,
  FlexItem,
  SearchInput,
} from '@patternfly/react-core';
import { ExpandableCodeBlock } from './ExpandableCodeBlock';

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

export type AnalysisLogsExpandableProps = {
  planId: string;
  finding: string;
  narrative: string;
  /** Prefix for checkbox / code-block ids (keeps multiple instances unique). */
  idPrefix?: string;
};

/**
 * Exact "View analysis logs" ExpandableSection previously embedded in the
 * top-level RCA card — search, hide-health-checks, and ExpandableCodeBlock.
 */
export const AnalysisLogsExpandable: React.FC<AnalysisLogsExpandableProps> = ({
  planId,
  finding,
  narrative,
  idPrefix = 'analysis-log',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [hideHealthChecks, setHideHealthChecks] = useState(true);

  const rawLogs = generateAnalysisLogs(planId, finding, narrative);
  const displayLogs = rawLogs
    .split('\n')
    .filter((l) => !hideHealthChecks || !HEALTH_CHECK_PATTERN.test(l))
    .filter((l) => !query.trim() || l.toLowerCase().includes(query.toLowerCase()))
    .join('\n');

  return (
    <ExpandableSection
      toggleText={isExpanded ? 'Hide analysis logs' : 'View analysis logs'}
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
          gap={{ default: 'gapMd' }}
          style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }}
        >
          <FlexItem grow={{ default: 'grow' }}>
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
        <ExpandableCodeBlock
          id={`${idPrefix}-${planId}`}
          code={displayLogs}
          codeStyle={{ fontSize: '12px', maxHeight: '280px', overflowY: 'auto', display: 'block' }}
        />
      </div>
    </ExpandableSection>
  );
};

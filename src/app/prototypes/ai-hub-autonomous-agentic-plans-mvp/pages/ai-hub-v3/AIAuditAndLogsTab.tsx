import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  ClipboardCopy,
  ClipboardCopyVariant,
  Flex,
  FlexItem,
  TextInput,
  Title,
} from '@patternfly/react-core';
import { DownloadIcon } from '@patternfly/react-icons';
import { SC_PLAN_TABLE_IDENTITY } from './singleClusterPlanSimulation';
import { MVP_PLAN_IDS } from './plansMvpConstants';
import './ai-hub-v3-inventory.css';

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

interface AuditLogLine {
  id: number;
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
}

const PLAN_NAMES = Object.entries(SC_PLAN_TABLE_IDENTITY)
  .filter(([id]) => MVP_PLAN_IDS.has(id))
  .map(([, plan]) => plan.name);

const LIFECYCLE_MESSAGES: Array<{ level?: LogLevel }> = [
  {},
  {},
  {},
  {},
  {},
  {},
  { level: 'WARN' },
  {},
];

const formatLogTimestamp = (index: number): string => {
  const base = new Date('2026-06-09T15:00:00');
  const minutesBack = index * 47 + (index % 5) * 11;
  const date = new Date(base.getTime() - minutesBack * 60_000);
  return date.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
};

const buildSimulatedAuditLogLines = (count: number): AuditLogLine[] =>
  Array.from({ length: count }, (_, index) => {
    const planName = PLAN_NAMES[index % PLAN_NAMES.length];
    const namespace = 'openshift-monitoring';
    const user = index % 2 === 0 ? 'marcus.chen' : 'sarah.patel';
    const lifecycleIndex = index % LIFECYCLE_MESSAGES.length;
    const level = LIFECYCLE_MESSAGES[lifecycleIndex].level ?? 'INFO';
    const messages = [
      `proposal-controller: Plan submitted (proposal=${planName} namespace=${namespace})`,
      `agentic-ols: Investigation started for proposal=${planName}`,
      `agentic-ols: Root cause analysis complete for proposal=${planName}`,
      `agentic-ols: Remediation execution started for proposal=${planName} option=option-1`,
      `agentic-ols: Verification attempt ${(index % 2) + 1}/2 for proposal=${planName}`,
      `agentic-ols: Verification passed for proposal=${planName}`,
      `agentic-ols: Plan aborted by user=${user} for proposal=${planName}`,
      `agentic-ols: Remediation applied for proposal=${planName}`,
    ];

    return {
      id: index + 1,
      timestamp: formatLogTimestamp(index),
      level: lifecycleIndex === 6 ? 'WARN' : level,
      source: messages[lifecycleIndex].split(':')[0],
      message: messages[lifecycleIndex],
    };
  });

const AUDIT_LOG_LINES = buildSimulatedAuditLogLines(48);

const formatLogLine = (line: AuditLogLine): string =>
  `${line.timestamp} ${line.level.padEnd(5)} ${line.message}`;

export const AIAuditAndLogsTab: React.FC = () => {
  const [planSearch, setPlanSearch] = useState('');

  const filteredLines = useMemo(() => {
    const query = planSearch.trim().toLowerCase();
    if (!query) {
      return AUDIT_LOG_LINES;
    }
    return AUDIT_LOG_LINES.filter(
      (line) =>
        line.message.toLowerCase().includes(query)
        || line.source.toLowerCase().includes(query),
    );
  }, [planSearch]);

  const logText = useMemo(
    () => filteredLines.map(formatLogLine).join('\n'),
    [filteredLines],
  );

  const handleDownload = useCallback(() => {
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'agentic-audit-log.txt';
    anchor.click();
    URL.revokeObjectURL(url);
  }, [logText]);

  useEffect(() => {
    const container = document.getElementById('ols-audit-log-stream');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [filteredLines.length]);

  return (
    <div className="ols-audit-log-stream-panel">
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
        flexWrap={{ default: 'wrap' }}
        gap={{ default: 'gapSm' }}
        style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
      >
        <FlexItem>
          <Title headingLevel="h3" size="md" style={{ margin: 0 }}>
            Agentic audit log
          </Title>
        </FlexItem>
        <FlexItem>
          <Button variant="link" icon={<DownloadIcon />} iconPosition="start" onClick={handleDownload}>
            Download log
          </Button>
        </FlexItem>
      </Flex>

      <TextInput
        aria-label="Filter audit log"
        placeholder="Filter log output…"
        value={planSearch}
        onChange={(_event, value) => setPlanSearch(value)}
        style={{ marginBottom: 'var(--pf-t--global--spacer--sm)', maxWidth: '420px' }}
      />

      <div id="ols-audit-log-stream" className="ols-audit-log-stream" role="log" aria-label="Agentic audit log stream">
        <ClipboardCopy
          isReadOnly
          isCode
          variant={ClipboardCopyVariant.expansion}
          hoverTip="Copy"
          clickTip="Copied"
          style={{
            fontFamily: 'var(--pf-t--global--font--family--mono)',
            fontSize: '12px',
            maxHeight: '520px',
            overflow: 'auto',
            whiteSpace: 'pre',
          }}
        >
          {logText || 'No log lines match the current filter.'}
        </ClipboardCopy>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import {
  ClipboardCopyButton,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  ExpandableSection,
  Flex,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons';
import type { ExecutionApproval, VerificationState } from '../../context/PlanWorkflowContext';
import type { RemediationOption } from './PlansAndApprovalsTab';
import { mapOptionRisk } from '../../types/riskScore';

/** Frozen verification demo for static `op4` row in the plans table. */
export const STATIC_VERIFICATION_DEMO: Record<string, VerificationState> = {
  op4: {
    attempt: 1,
    maxAttempts: 2,
    startedAt: '2026-06-16T14:22:00.000Z',
    checks: [
      'Checking Prometheus alert state…',
      'Prometheus alert cleared',
      'Verifying target pod health…',
      'Target pod healthy',
      'Probing service endpoint…',
      'Service endpoint responding',
    ],
  },
};

export const VERIFICATION_CHECK_LINES = [
  'Checking Prometheus alert state…',
  'Prometheus alert cleared',
  'Verifying target pod health…',
  'Target pod healthy',
  'Probing service endpoint…',
  'Service endpoint responding',
];

function useStreamingVerificationLog(
  lines: string[],
  isActive: boolean,
  isFrozen: boolean,
): string {
  const [visibleCount, setVisibleCount] = useState(isFrozen ? lines.length : 0);

  useEffect(() => {
    if (isFrozen) {
      setVisibleCount(lines.length);
      return;
    }
    if (!isActive) {
      setVisibleCount(0);
      return;
    }
    setVisibleCount(0);
    let index = 0;
    const interval = window.setInterval(() => {
      index += 1;
      setVisibleCount(index);
      if (index >= lines.length) {
        window.clearInterval(interval);
      }
    }, 700);
    return () => window.clearInterval(interval);
  }, [isActive, isFrozen, lines]);

  return lines.slice(0, visibleCount).join('\n');
}

export const VerificationPanel: React.FC<{
  verification: VerificationState;
  isLive?: boolean;
  onComplete?: () => void;
}> = ({ verification, isLive = false, onComplete }) => {
  const isFrozen = !isLive;
  const [verifCopied, setVerifCopied] = useState(false);
  const streamedLog = useStreamingVerificationLog(
    verification.checks.length > 0 ? verification.checks : VERIFICATION_CHECK_LINES,
    isLive && !verification.outcome,
    isFrozen,
  );
  const isInProgress = isLive && !verification.outcome;

  useEffect(() => {
    if (!isLive || verification.outcome) {
      return;
    }
    const timer = window.setTimeout(() => {
      onComplete?.();
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [isLive, verification.outcome, onComplete]);

  return (
    <div
      style={{
        borderRadius: 'var(--pf-t--global--border--radius--small)',
        border: '1px solid var(--pf-t--global--border--color--default)',
        padding: 'var(--pf-t--global--spacer--md)',
      }}
    >
      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
        {isInProgress && <Spinner size="md" aria-label="Verifying remediation" />}
        <Title headingLevel="h5" size="md">Verifying remediation</Title>
      </Flex>
      <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
        Attempt {verification.attempt} of {verification.maxAttempts}
      </Content>
      <CodeBlock
        actions={
          <CodeBlockAction>
            <ClipboardCopyButton
              id="verif-log-copy"
              textId="verif-log-text"
              aria-label="Copy verification log"
              onClick={() => {
                navigator.clipboard.writeText(streamedLog || 'Starting verification checks…');
                setVerifCopied(true);
                setTimeout(() => setVerifCopied(false), 2000);
              }}
              exitDelay={1000}
              variant="plain"
            >
              {verifCopied ? 'Copied!' : 'Copy'}
            </ClipboardCopyButton>
          </CodeBlockAction>
        }
      >
        <CodeBlockCode id="verif-log-text" style={{ fontSize: '12px' }}>
          {streamedLog || 'Starting verification checks…'}
        </CodeBlockCode>
      </CodeBlock>
    </div>
  );
};

export const ProposalApprovalArtifact: React.FC<{ approval: ExecutionApproval }> = ({ approval }) => (
  <div
    style={{
      borderRadius: 'var(--pf-t--global--border--radius--small)',
      border: '1px solid var(--pf-t--global--color--status--success--default)',
      backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
      padding: 'var(--pf-t--global--spacer--md)',
      marginBottom: 'var(--pf-t--global--spacer--md)',
    }}
  >
    <Flex
      alignItems={{ default: 'alignItemsCenter' }}
      gap={{ default: 'gapSm' }}
      style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
    >
      <CheckCircleIcon
        style={{ color: 'var(--pf-t--global--color--status--success--default)' }}
        aria-hidden
      />
      <Title headingLevel="h5" size="md">
        Remediation execution record
      </Title>
    </Flex>
    <DescriptionList isHorizontal isAutoColumnWidths isCompact>
      <DescriptionListGroup>
        <DescriptionListTerm>Option</DescriptionListTerm>
        <DescriptionListDescription>
          {approval.optionIndex + 1} — {approval.optionTitle}
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Max attempts</DescriptionListTerm>
        <DescriptionListDescription>{approval.maxAttempts}</DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Executed by</DescriptionListTerm>
        <DescriptionListDescription>
          {approval.approvedBy} · {approval.approvedAt}
        </DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  </div>
);

export const RevisionHistoryList: React.FC<{
  entries: Array<{ text: string; submittedAt: string }>;
  revisionCount: number;
}> = ({ entries, revisionCount }) => {
  if (entries.length === 0) {
    return null;
  }

  return (
    <ExpandableSection
      toggleText={`Revision history (${entries.length})`}
      isExpanded={false}
    >
      {revisionCount > 1 && (
        <Content component="small" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
          Analysis rev {revisionCount}
        </Content>
      )}
      {entries.map((entry, index) => (
        <div key={`${entry.submittedAt}-${index}`} style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
          <Content component="small" className="ols-aio-text-subtle-sm" style={{ display: 'block' }}>
            {entry.submittedAt}
          </Content>
          <Content component="p" style={{ margin: 0 }}>
            {entry.text}
          </Content>
        </div>
      ))}
    </ExpandableSection>
  );
};

export function resolveVerificationState(
  planId: string,
  workflowVerification: VerificationState | null,
): VerificationState | null {
  if (workflowVerification) {
    return workflowVerification;
  }
  return STATIC_VERIFICATION_DEMO[planId] ?? null;
}

export function buildOptionsSummary(options: RemediationOption[]): string {
  return options
    .map((opt, idx) => `${idx + 1}. ${opt.title} (${mapOptionRisk(opt.risk)} risk)`)
    .join('\n');
}

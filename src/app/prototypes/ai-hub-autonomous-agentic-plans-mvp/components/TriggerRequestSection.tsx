import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
  ClipboardCopyButton,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  ExpandableSection,
  Flex,
  FlexItem,
  Label,
  Popover,
  Title,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { NamespaceResourceLink } from './NamespaceResourceLink';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ParsedTriggerRequest = {
  alertName?: string;
  severity?: string;
  namespace?: string;
  description?: string;
};

export type TriggerRequestSectionProps = {
  /** Raw `spec.request` prompt / alert event string. */
  request: string;
  /** Optional id used for a11y / copy-button ids. */
  planId?: string;
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
 * Builds a parseable mock `spec.request` string from plan metadata.
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

// ─── Parser ───────────────────────────────────────────────────────────────────

/**
 * Lightweight extractor for key fields from a `spec.request` string.
 * Supports `key="value"` and `key: value` forms. Returns null when nothing
 * recognizable is found so the UI can fall back to a raw CodeBlock.
 */
export function parseTriggerRequest(raw: string): ParsedTriggerRequest | null {
  if (!raw?.trim()) return null;

  const result: ParsedTriggerRequest = {};

  const quoted =
    /(?:^|[\s\n])(alertname|severity|namespace|description|summary)\s*=\s*"([^"]*)"/gi;
  let match: RegExpExecArray | null;
  while ((match = quoted.exec(raw)) !== null) {
    assignParsedField(result, match[1], match[2]);
  }

  const colonLine =
    /^(alertname|severity|namespace|description|summary)\s*:\s*(.+)$/gim;
  while ((match = colonLine.exec(raw)) !== null) {
    assignParsedField(result, match[1], match[2].replace(/^["']|["']$/g, '').trim());
  }

  if (!result.alertName && !result.severity && !result.namespace && !result.description) {
    return null;
  }
  return result;
}

function assignParsedField(
  result: ParsedTriggerRequest,
  key: string,
  value: string,
): void {
  const trimmed = value.trim();
  if (!trimmed) return;
  switch (key.toLowerCase()) {
    case 'alertname':
      if (!result.alertName) result.alertName = trimmed;
      break;
    case 'severity':
      if (!result.severity) result.severity = trimmed.toLowerCase();
      break;
    case 'namespace':
      if (!result.namespace) result.namespace = trimmed;
      break;
    case 'description':
    case 'summary':
      if (!result.description) result.description = trimmed;
      break;
    default:
      break;
  }
}

/** OCP/PF severity Label color — warning uses standard gold. */
function severityLabelColor(severity: string): 'red' | 'gold' | 'blue' | 'grey' {
  switch (severity.toLowerCase()) {
    case 'critical':
      return 'red';
    case 'warning':
      return 'gold';
    case 'info':
      return 'blue';
    default:
      return 'grey';
  }
}

/** Sentence-case severity display (e.g. warning → Warning). */
function formatSeverityLabel(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'critical':
      return 'Critical';
    case 'warning':
      return 'Warning';
    case 'info':
      return 'Info';
    default:
      return severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase();
  }
}

// ─── Raw viewer (copy + code block) ───────────────────────────────────────────

const RawRequestCodeBlock: React.FC<{ code: string; id: string }> = ({ code, id }) => {
  const [copied, setCopied] = useState(false);
  const textId = `${id}-code`;
  const copyId = `${id}-copy`;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CodeBlock
      actions={
        <CodeBlockAction>
          <ClipboardCopyButton
            id={copyId}
            textId={textId}
            aria-label="Copy to clipboard"
            onClick={handleCopy}
            exitDelay={1000}
            variant="plain"
          >
            {copied ? 'Copied!' : 'Copy'}
          </ClipboardCopyButton>
        </CodeBlockAction>
      }
    >
      <CodeBlockCode
        id={textId}
        style={{ fontSize: '12px', maxHeight: '280px', overflowY: 'auto', display: 'block' }}
      >
        {code}
      </CodeBlockCode>
    </CodeBlock>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Structured "Analysis request" card for Agentic Run details — parses
 * `spec.request` into Labels / DescriptionList when possible, with an
 * expandable raw string viewer (and graceful fallback when parsing fails).
 */
export const TriggerRequestSection: React.FC<TriggerRequestSectionProps> = ({
  request,
  planId = 'run',
}) => {
  const [isRawExpanded, setIsRawExpanded] = useState(false);
  const parsed = useMemo(() => parseTriggerRequest(request), [request]);
  const hasParsedFields = Boolean(parsed);

  return (
    <Card
      isCompact
      className="ols-ai-hub-trigger-request"
      style={{ marginBlockStart: 'var(--pf-t--global--spacer--md)' }}
    >
      <CardTitle>
        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
          <FlexItem>
            <Title headingLevel="h2" size="md" style={{ margin: 0 }}>
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
                style={{ padding: 0 }}
                icon={<OutlinedQuestionCircleIcon />}
              />
            </Popover>
          </FlexItem>
        </Flex>
      </CardTitle>
      <CardBody>
        {hasParsedFields && parsed ? (
          <>
            <DescriptionList isHorizontal isCompact isFluid>
              {parsed.alertName && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Alert name</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Label color="grey" isCompact>
                      {parsed.alertName}
                    </Label>
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {parsed.severity && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Severity</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Label color={severityLabelColor(parsed.severity)} isCompact>
                      {formatSeverityLabel(parsed.severity)}
                    </Label>
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {parsed.namespace && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Namespace</DescriptionListTerm>
                  <DescriptionListDescription>
                    <NamespaceResourceLink name={parsed.namespace} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {parsed.description && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Summary</DescriptionListTerm>
                  <DescriptionListDescription>
                    <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                      {parsed.description}
                    </span>
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
            </DescriptionList>
            <ExpandableSection
              toggleText={isRawExpanded ? 'Hide raw request string' : 'View raw request string'}
              isExpanded={isRawExpanded}
              onToggle={(_e, expanded) => setIsRawExpanded(expanded)}
              style={{ marginBlockStart: 'var(--pf-t--global--spacer--md)' }}
            >
              <RawRequestCodeBlock code={request} id={`trigger-request-${planId}`} />
            </ExpandableSection>
          </>
        ) : (
          <RawRequestCodeBlock code={request} id={`trigger-request-${planId}`} />
        )}
      </CardBody>
    </Card>
  );
};

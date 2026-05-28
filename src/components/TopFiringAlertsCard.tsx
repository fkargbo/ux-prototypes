import React, { useMemo } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Content,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Label,
  Progress,
  ProgressSize,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
} from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Severity = 'critical' | 'warning' | 'info';

export interface AlertRule {
  id: string;
  severity: Severity;
  /** Alert rule identifier — rendered monospace. */
  name: string;
  /** 0–100 AI-synthesized blast-radius score. */
  impact: number;
  /** Raw count of currently firing instances. */
  firingInstances: number;
  /** Human-readable scope label, e.g. "94% of production fleet". */
  scopeLabel: string;
  /** 0–100 AI-synthesized percentage of fleet affected. */
  scopePercent: number;
}

export interface TopFiringAlertsCardProps {
  alerts: AlertRule[];
  /** Called with the alert rule id when the rule name is clicked. */
  onAlertClick?: (id: string) => void;
  /** Called when the "View all" header action is clicked. */
  onViewAll?: () => void;
  /** Additional CSS class names forwarded to the root Card element. */
  className?: string;
  /** Inline styles forwarded to the root Card element. */
  style?: React.CSSProperties;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SEVERITY_LABEL_COLOR: Record<Severity, 'red' | 'orange' | 'blue'> = {
  critical: 'red',
  warning: 'orange',
  info: 'blue',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function severityIcon(severity: Severity): React.ReactNode {
  if (severity === 'critical') {
    return <ExclamationCircleIcon aria-hidden="true" />;
  }
  if (severity === 'warning') {
    return <ExclamationTriangleIcon aria-hidden="true" />;
  }
  return <InfoCircleIcon aria-hidden="true" />;
}

/**
 * Returns a CSS colour token that reflects blast-radius severity.
 * Used as an accent on the progress bar track via `style` since this
 * version of PatternFly Progress does not expose a `status` prop.
 */
function blastRadiusColor(pct: number): string {
  if (pct >= 75) return 'var(--pf-t--global--color--status--danger--default)';
  if (pct >= 40) return 'var(--pf-t--global--color--status--warning--default)';
  return 'var(--pf-t--global--color--status--info--default)';
}

// ─── AI badge ─────────────────────────────────────────────────────────────────

/**
 * Compact inline badge that distinguishes AI-synthesised values from raw
 * telemetry. Rendered next to column headers and individual cell values.
 */
const AiBadge: React.FC = () => (
  <Label
    color="blue"
    isCompact
    aria-label="AI synthesized"
    style={{ verticalAlign: 'middle' }}
  >
    AI
  </Label>
);

// ─── Severity label ────────────────────────────────────────────────────────────

const SeverityLabel: React.FC<{ severity: Severity }> = ({ severity }) => (
  <Label color={SEVERITY_LABEL_COLOR[severity]} icon={severityIcon(severity)} isCompact>
    {severity}
  </Label>
);

// ─── Main component ────────────────────────────────────────────────────────────

/**
 * Top Firing Alerts card for the AI Troubleshooting Hub.
 *
 * Surfaces alert rules ranked by AI-estimated blast radius so SREs can
 * prioritise remediations by fleet-wide impact rather than raw alert count.
 *
 * Fields marked with the **AI** badge (`impact`, `scopePercent`) are
 * synthesised by the AI agent and must be treated as estimates.
 */
export const TopFiringAlertsCard: React.FC<TopFiringAlertsCardProps> = ({
  alerts,
  onAlertClick,
  onViewAll,
  className,
  style,
}) => {
  /** Sort by blast radius desc; break ties on impact desc. */
  const sortedAlerts = useMemo(
    () => [...alerts].sort((a, b) => b.scopePercent - a.scopePercent || b.impact - a.impact),
    [alerts],
  );

  return (
    <Card isCompact component="section" aria-label="Top firing alerts" className={className} style={style}>
      <CardHeader
        actions={
          onViewAll
            ? {
                actions: (
                  <Button variant="link" isInline onClick={onViewAll}>
                    View all
                  </Button>
                ),
              }
            : undefined
        }
      >
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          spaceItems={{ default: 'spaceItemsSm' }}
        >
          <FlexItem>
            <CardTitle component="h2">Top firing alerts</CardTitle>
          </FlexItem>
          {alerts.length > 0 && (
            <FlexItem>
              <Label color="blue" isCompact>
                {alerts.length} rule{alerts.length === 1 ? '' : 's'}
              </Label>
            </FlexItem>
          )}
        </Flex>
      </CardHeader>

      <CardBody>
        {sortedAlerts.length === 0 ? (
          <EmptyState
            titleText="No firing alerts"
            headingLevel="h3"
            icon={CheckCircleIcon}
          >
            <EmptyStateBody>
              All systems are operating within normal parameters.
            </EmptyStateBody>
          </EmptyState>
        ) : (
          <Table aria-label="Top firing alerts" variant="compact">
            <Thead>
              <Tr>
                <Th>Severity</Th>
                <Th>
                  <Flex
                    alignItems={{ default: 'alignItemsCenter' }}
                    spaceItems={{ default: 'spaceItemsXs' }}
                  >
                    <FlexItem>Rule name</FlexItem>
                  </Flex>
                </Th>
                <Th>
                  <Flex
                    alignItems={{ default: 'alignItemsCenter' }}
                    spaceItems={{ default: 'spaceItemsXs' }}
                  >
                    <FlexItem>Blast radius</FlexItem>
                    <FlexItem>
                      <AiBadge />
                    </FlexItem>
                  </Flex>
                </Th>
                <Th>
                  <Flex
                    alignItems={{ default: 'alignItemsCenter' }}
                    spaceItems={{ default: 'spaceItemsXs' }}
                  >
                    <FlexItem>Impact</FlexItem>
                    <FlexItem>
                      <AiBadge />
                    </FlexItem>
                  </Flex>
                </Th>
                <Th>Instances</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedAlerts.map((rule) => (
                <Tr key={rule.id}>
                  {/* Severity */}
                  <Td dataLabel="Severity">
                    <SeverityLabel severity={rule.severity} />
                  </Td>

                  {/* Rule name — monospace; clickable if onAlertClick is provided */}
                  <Td dataLabel="Rule name">
                    {onAlertClick ? (
                      <Button
                        variant="link"
                        isInline
                        onClick={() => onAlertClick(rule.id)}
                        style={{ fontFamily: 'var(--pf-t--global--font--family--mono)' }}
                      >
                        {rule.name}
                      </Button>
                    ) : (
                      <code
                        style={{ fontFamily: 'var(--pf-t--global--font--family--mono)' }}
                      >
                        {rule.name}
                      </code>
                    )}
                  </Td>

                  {/* Blast radius — AI-synthesised progress bar + scope label */}
                  <Td dataLabel="Blast radius">
                    <Stack>
                      <StackItem>
                        <Progress
                          value={rule.scopePercent}
                          size={ProgressSize.sm}
                          aria-label={`Blast radius: ${rule.scopePercent}%`}
                          style={
                            {
                              '--pf-v6-c-progress__indicator--BackgroundColor':
                                blastRadiusColor(rule.scopePercent),
                            } as React.CSSProperties
                          }
                        />
                      </StackItem>
                      <StackItem>
                        <Content
                          component="small"
                          style={{ color: 'var(--pf-t--global--text--color--subtle)' }}
                        >
                          {rule.scopeLabel}
                        </Content>
                      </StackItem>
                    </Stack>
                  </Td>

                  {/* Impact score — AI-synthesised 0–100 */}
                  <Td dataLabel="Impact">
                    <Flex
                      alignItems={{ default: 'alignItemsCenter' }}
                      spaceItems={{ default: 'spaceItemsXs' }}
                    >
                      <FlexItem>
                        <strong>{rule.impact}</strong>
                        <Content
                          component="small"
                          style={{ color: 'var(--pf-t--global--text--color--subtle)' }}
                        >
                          /100
                        </Content>
                      </FlexItem>
                    </Flex>
                  </Td>

                  {/* Firing instances — raw telemetry, no AI badge */}
                  <Td dataLabel="Instances">{rule.firingInstances}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </CardBody>

      <CardFooter>
        <Flex
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          alignItems={{ default: 'alignItemsCenter' }}
        >
          <FlexItem>
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              spaceItems={{ default: 'spaceItemsXs' }}
            >
              <FlexItem>
                <Content
                  component="small"
                  style={{ color: 'var(--pf-t--global--text--color--subtle)' }}
                >
                  Ranked by
                </Content>
              </FlexItem>
              <FlexItem>
                <AiBadge />
              </FlexItem>
              <FlexItem>
                <Content
                  component="small"
                  style={{ color: 'var(--pf-t--global--text--color--subtle)' }}
                >
                  blast-radius estimate
                </Content>
              </FlexItem>
            </Flex>
          </FlexItem>
        </Flex>
      </CardFooter>
    </Card>
  );
};

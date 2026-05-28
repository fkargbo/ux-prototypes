import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Content,
  Divider,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Label,
  MenuToggle,
  Progress,
  ProgressSize,
  Select,
  SelectList,
  SelectOption,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import type { MenuToggleElement } from '@patternfly/react-core';
import {
  BoltIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ExternalLinkAltIcon,
  InfoCircleIcon,
} from '@patternfly/react-icons';

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

type SortBy = 'impact' | 'firingVolume';
type Timeframe = '15m' | '30m' | '1h' | '6h' | '24h';

export interface TopFiringAlertsCardProps {
  alerts: AlertRule[];
  /** Called with the alert rule id when the rule name is clicked. */
  onAlertClick?: (id: string) => void;
  /** Called when the "View all" header action is clicked. */
  onViewAll?: () => void;
  /**
   * Optional status label rendered as a badge in the header,
   * e.g. "Storm mitigation active".
   */
  statusLabel?: string;
  /**
   * Optional subtitle rendered below the header row,
   * e.g. "AI-ranked by blast radius across your fleet".
   */
  subtitle?: string;
  /** Additional CSS class names forwarded to the root Card element. */
  className?: string;
  /** Inline styles forwarded to the root Card element. */
  style?: React.CSSProperties;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'impact', label: 'Impact score' },
  { value: 'firingVolume', label: 'Firing volume' },
];

const TIMEFRAME_OPTIONS: { value: Timeframe; label: string }[] = [
  { value: '15m', label: 'Last 15m' },
  { value: '30m', label: 'Last 30m' },
  { value: '1h', label: 'Last 1h' },
  { value: '6h', label: 'Last 6h' },
  { value: '24h', label: 'Last 24h' },
];

const SEVERITY_LABEL_COLOR: Record<Severity, 'red' | 'orange' | 'blue'> = {
  critical: 'red',
  warning: 'orange',
  info: 'blue',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function severityIcon(severity: Severity): React.ReactNode {
  if (severity === 'critical') return <ExclamationCircleIcon aria-hidden="true" />;
  if (severity === 'warning') return <ExclamationTriangleIcon aria-hidden="true" />;
  return <InfoCircleIcon aria-hidden="true" />;
}

function impactColor(impact: number): string {
  if (impact >= 70) return 'var(--pf-t--global--color--status--danger--default)';
  if (impact >= 40) return 'var(--pf-t--global--color--status--warning--default)';
  return 'var(--pf-t--global--text--color--regular)';
}

function blastRadiusBarColor(pct: number): string {
  if (pct >= 75) return 'var(--pf-t--global--color--status--danger--default)';
  if (pct >= 40) return 'var(--pf-t--global--color--status--warning--default)';
  return 'var(--pf-t--global--color--status--info--default)';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const SeverityLabel: React.FC<{ severity: Severity }> = ({ severity }) => (
  <Label color={SEVERITY_LABEL_COLOR[severity]} icon={severityIcon(severity)} isCompact>
    {severity}
  </Label>
);

/** Small "AI" badge with a bolt icon to mark AI-synthesised values. */
const AiBadge: React.FC<{ label?: string }> = ({ label = 'AI' }) => (
  <Label
    color="blue"
    isCompact
    icon={<BoltIcon aria-hidden="true" />}
    aria-label="AI synthesized"
  >
    {label}
  </Label>
);

const SUBTLE: React.CSSProperties = { color: 'var(--pf-t--global--text--color--subtle)' };
const MONO: React.CSSProperties = { fontFamily: 'var(--pf-t--global--font--family--mono)' };

/** Single alert rule row — three-line layout matching the reference design. */
const AlertRuleRow: React.FC<{
  rule: AlertRule;
  onAlertClick?: (id: string) => void;
}> = ({ rule, onAlertClick }) => (
  <Stack>
    {/* Line 1: severity + name (left) · AI IMPACT score (right) */}
    <StackItem>
      <Flex
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
        alignItems={{ default: 'alignItemsCenter' }}
        flexWrap={{ default: 'nowrap' }}
        gap={{ default: 'gapSm' }}
      >
        <FlexItem>
          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
            <FlexItem>
              <SeverityLabel severity={rule.severity} />
            </FlexItem>
            <FlexItem>
              {onAlertClick ? (
                <Button
                  variant="link"
                  isInline
                  onClick={() => onAlertClick(rule.id)}
                  style={MONO}
                >
                  {rule.name}
                </Button>
              ) : (
                <code style={MONO}>{rule.name}</code>
              )}
            </FlexItem>
          </Flex>
        </FlexItem>

        <FlexItem style={{ flexShrink: 0 }}>
          <Flex alignItems={{ default: 'alignItemsBaseline' }} gap={{ default: 'gapXs' }}>
            <FlexItem>
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }}>
                <FlexItem>
                  <BoltIcon
                    aria-hidden="true"
                    style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: 'var(--pf-t--global--font--size--xs)' }}
                  />
                </FlexItem>
                <FlexItem>
                  <Content
                    component="small"
                    style={{ ...SUBTLE, textTransform: 'uppercase', letterSpacing: '0.06em' }}
                  >
                    Impact
                  </Content>
                </FlexItem>
              </Flex>
            </FlexItem>
            <FlexItem>
              <strong
                style={{
                  fontSize: 'var(--pf-t--global--font--size--2xl)',
                  lineHeight: 1,
                  color: impactColor(rule.impact),
                }}
                aria-label={`Impact score: ${rule.impact} out of 100, AI synthesized`}
              >
                {rule.impact}
              </strong>
            </FlexItem>
          </Flex>
        </FlexItem>
      </Flex>
    </StackItem>

    {/* Line 2: firing count · scope label */}
    <StackItem>
      <Content component="small" style={SUBTLE}>
        <strong style={{ color: 'var(--pf-t--global--text--color--regular)' }}>
          {rule.firingInstances.toLocaleString()}
        </strong>{' '}
        firing
        {rule.scopeLabel ? (
          <>
            <span aria-hidden="true" style={{ margin: '0 var(--pf-t--global--spacer--xs)' }}>
              ·
            </span>
            {rule.scopeLabel}
          </>
        ) : null}
      </Content>
    </StackItem>

    {/* Line 3: blast-radius progress bar + percentage */}
    <StackItem>
      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
        <FlexItem grow={{ default: 'grow' }}>
          <Progress
            value={rule.scopePercent}
            size={ProgressSize.sm}
            aria-label={`Blast radius: ${rule.scopePercent}% of fleet, AI synthesized`}
            style={
              {
                '--pf-v6-c-progress__indicator--BackgroundColor': blastRadiusBarColor(
                  rule.scopePercent,
                ),
              } as React.CSSProperties
            }
          />
        </FlexItem>
        <FlexItem style={{ flexShrink: 0, minWidth: '3.5ch' }}>
          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }}>
            <FlexItem>
              <BoltIcon
                aria-hidden="true"
                style={{
                  color: blastRadiusBarColor(rule.scopePercent),
                  fontSize: 'var(--pf-t--global--font--size--xs)',
                }}
              />
            </FlexItem>
            <FlexItem>
              <Content component="small" style={{ fontWeight: 600 }}>
                {rule.scopePercent}%
              </Content>
            </FlexItem>
          </Flex>
        </FlexItem>
      </Flex>
    </StackItem>
  </Stack>
);

// ─── Inline Select helper ─────────────────────────────────────────────────────

function InlineSelect<T extends string>({
  id,
  options,
  value,
  onChange,
  ariaLabel,
}: {
  id: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const currentLabel = options.find((o) => o.value === value)?.label ?? value;

  return (
    <Select
      id={id}
      isOpen={open}
      onOpenChange={setOpen}
      onSelect={(_ev, v) => {
        onChange(v as T);
        setOpen(false);
      }}
      toggle={(ref: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={ref}
          isExpanded={open}
          onClick={() => setOpen((p) => !p)}
          aria-label={ariaLabel}
          variant="secondary"
        >
          {currentLabel}
        </MenuToggle>
      )}
    >
      <SelectList>
        {options.map((opt) => (
          <SelectOption key={opt.value} value={opt.value} isSelected={opt.value === value}>
            {opt.label}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

/**
 * Top Firing Alerts card for the AI Troubleshooting Hub.
 *
 * Surfaces alert rules ranked by AI-estimated blast radius so SREs can
 * prioritise by fleet-wide impact rather than raw alert count.
 * Users can switch between **Impact score** and **Firing volume** sort views
 * and narrow results by timeframe.
 *
 * Fields marked **AI** (`impact`, `scopePercent`) are synthesised by the
 * AI agent and should be treated as estimates, not raw telemetry.
 */
export const TopFiringAlertsCard: React.FC<TopFiringAlertsCardProps> = ({
  alerts,
  onAlertClick,
  onViewAll,
  statusLabel,
  subtitle,
  className,
  style,
}) => {
  const [sortBy, setSortBy] = useState<SortBy>('impact');
  const [timeframe, setTimeframe] = useState<Timeframe>('15m');

  const sortedAlerts = useMemo(() => {
    const copy = [...alerts];
    if (sortBy === 'impact') {
      copy.sort((a, b) => b.impact - a.impact || b.scopePercent - a.scopePercent);
    } else {
      copy.sort((a, b) => b.firingInstances - a.firingInstances || b.impact - a.impact);
    }
    return copy;
  }, [alerts, sortBy]);

  const totalFiring = useMemo(
    () => alerts.reduce((sum, r) => sum + r.firingInstances, 0),
    [alerts],
  );

  return (
    <Card isCompact component="section" aria-label="Top firing alerts" className={className} style={style}>
      {/* ── Header ── */}
      <CardHeader
        actions={
          onViewAll
            ? {
                actions: (
                  <Button
                    variant="link"
                    isInline
                    onClick={onViewAll}
                    icon={<ExternalLinkAltIcon />}
                    iconPosition="right"
                  >
                    View all
                  </Button>
                ),
              }
            : undefined
        }
      >
        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }}>
          <FlexItem>
            <CardTitle component="h2">Top firing alerts</CardTitle>
          </FlexItem>
          <FlexItem>
            <AiBadge />
          </FlexItem>
          {statusLabel && (
            <FlexItem>
              <Label color="green" isCompact>
                {statusLabel}
              </Label>
            </FlexItem>
          )}
        </Flex>
      </CardHeader>

      <CardBody>
        <Stack hasGutter>
          {/* Subtitle */}
          {subtitle && (
            <StackItem>
              <Content component="small" style={SUBTLE}>
                {subtitle}
              </Content>
            </StackItem>
          )}

          {/* ── Sort / Timeframe toolbar ── */}
          <StackItem>
            <Flex
              justifyContent={{ default: 'justifyContentSpaceBetween' }}
              alignItems={{ default: 'alignItemsCenter' }}
              flexWrap={{ default: 'wrap' }}
              gap={{ default: 'gapSm' }}
            >
              {/* Left: sort + timeframe */}
              <FlexItem>
                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }}>
                  <FlexItem>
                    <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }}>
                      <FlexItem>
                        <Content component="small" style={SUBTLE}>
                          Sort
                        </Content>
                      </FlexItem>
                      <FlexItem>
                        <InlineSelect
                          id="top-alerts-sort"
                          options={SORT_OPTIONS}
                          value={sortBy}
                          onChange={setSortBy}
                          ariaLabel="Sort alerts by"
                        />
                      </FlexItem>
                    </Flex>
                  </FlexItem>
                  <FlexItem>
                    <Divider orientation={{ default: 'vertical' }} />
                  </FlexItem>
                  <FlexItem>
                    <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }}>
                      <FlexItem>
                        <Content component="small" style={SUBTLE}>
                          Timeframe
                        </Content>
                      </FlexItem>
                      <FlexItem>
                        <InlineSelect
                          id="top-alerts-timeframe"
                          options={TIMEFRAME_OPTIONS}
                          value={timeframe}
                          onChange={setTimeframe}
                          ariaLabel="Select alert timeframe"
                        />
                      </FlexItem>
                    </Flex>
                  </FlexItem>
                </Flex>
              </FlexItem>

              {/* Right: severity legend */}
              <FlexItem>
                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                  <FlexItem>
                    <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }}>
                      <FlexItem>
                        <ExclamationCircleIcon
                          aria-hidden="true"
                          style={{ color: 'var(--pf-t--global--color--status--danger--default)', fontSize: 'var(--pf-t--global--font--size--xs)' }}
                        />
                      </FlexItem>
                      <FlexItem>
                        <Content component="small" style={SUBTLE}>
                          Critical
                        </Content>
                      </FlexItem>
                    </Flex>
                  </FlexItem>
                  <FlexItem>
                    <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }}>
                      <FlexItem>
                        <ExclamationTriangleIcon
                          aria-hidden="true"
                          style={{ color: 'var(--pf-t--global--color--status--warning--default)', fontSize: 'var(--pf-t--global--font--size--xs)' }}
                        />
                      </FlexItem>
                      <FlexItem>
                        <Content component="small" style={SUBTLE}>
                          Warning
                        </Content>
                      </FlexItem>
                    </Flex>
                  </FlexItem>
                </Flex>
              </FlexItem>
            </Flex>
          </StackItem>

          <StackItem>
            <Divider />
          </StackItem>

          {/* ── Alert rows ── */}
          <StackItem>
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
              <Stack>
                {sortedAlerts.map((rule, idx) => (
                  <StackItem key={rule.id}>
                    <Stack hasGutter>
                      <StackItem>
                        <AlertRuleRow rule={rule} onAlertClick={onAlertClick} />
                      </StackItem>
                      {idx < sortedAlerts.length - 1 && (
                        <StackItem>
                          <Divider />
                        </StackItem>
                      )}
                    </Stack>
                  </StackItem>
                ))}
              </Stack>
            )}
          </StackItem>
        </Stack>
      </CardBody>

      {/* ── Footer summary ── */}
      {sortedAlerts.length > 0 && (
        <CardFooter>
          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }}>
            <FlexItem>
              <Content component="small" style={SUBTLE}>
                Top
              </Content>
            </FlexItem>
            <FlexItem>
              <Content component="small">
                <strong>{sortedAlerts.length}</strong>
              </Content>
            </FlexItem>
            <FlexItem>
              <Content component="small" style={SUBTLE}>
                rules by {sortBy === 'impact' ? 'impact' : 'firing volume'} ·
              </Content>
            </FlexItem>
            <FlexItem>
              <Content component="small">
                <strong>{totalFiring.toLocaleString()}</strong>
              </Content>
            </FlexItem>
            <FlexItem>
              <Content component="small" style={SUBTLE}>
                instances firing
              </Content>
            </FlexItem>
          </Flex>
        </CardFooter>
      )}
    </Card>
  );
};

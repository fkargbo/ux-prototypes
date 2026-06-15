import React, { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Content,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Label,
  MenuToggle,
  MenuToggleElement,
  Progress,
  ProgressSize,
  Select,
  SelectList,
  SelectOption,
  Stack,
  StackItem,
  TextInput,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import { CheckCircleIcon, DownloadIcon, ExclamationCircleIcon, FileAltIcon } from '@patternfly/react-icons';
import { ExpandableRowContent, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import './ai-hub-v3-inventory.css';

// ── Types ──────────────────────────────────────────────────────────────────────

type LifecycleEvent =
  | 'Plan submitted'
  | 'Investigation started'
  | 'RCA verified'
  | 'Approval granted'
  | 'Remediation applied'
  | 'Plan aborted';

interface AuditReceiptItem {
  key: string;
  value: string;
}

interface AuditRow {
  id: number;
  timestamp: string;
  planSummary: string;
  event: LifecycleEvent;
  user: string;
  tokenBurn: number;
  receiptHash: string;
  auditReceipt: AuditReceiptItem[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatTokenBurn = (tokens: number): string => `${tokens.toLocaleString('en-US')} tokens`;

const truncateReceiptHash = (hash: string): string => hash.slice(0, 6);

const isSystemUser = (user: string): boolean => user.startsWith('System');

type LabelColor = 'blue' | 'teal' | 'orange' | 'green' | 'red' | 'grey';

const EVENT_LABEL_COLOR: Record<LifecycleEvent, LabelColor> = {
  'Plan submitted': 'blue',
  'Investigation started': 'blue',
  'RCA verified': 'teal',
  'Approval granted': 'orange',
  'Remediation applied': 'green',
  'Plan aborted': 'red',
};

const EventLabel: React.FC<{ event: LifecycleEvent; timestamp?: string }> = ({ event, timestamp }) => {
  if (event === 'Plan aborted') {
    const tooltipContent = `Execution halted by administrative override at ${timestamp ?? '—'}.`;
    return (
      <Tooltip content={tooltipContent} position="top">
        <span tabIndex={0} style={{ display: 'inline-flex', cursor: 'default' }}>
          <Label
            color="red"
            variant="outline"
            isCompact
            icon={<ExclamationCircleIcon />}
            style={{ whiteSpace: 'nowrap' }}
          >
            Plan aborted
          </Label>
        </span>
      </Tooltip>
    );
  }

  return (
    <Label
      color={EVENT_LABEL_COLOR[event]}
      variant="outline"
      isCompact
      style={{ whiteSpace: 'nowrap' }}
    >
      {event}
    </Label>
  );
};

// ── Mock data ──────────────────────────────────────────────────────────────────

const AUDIT_ROWS: AuditRow[] = [
  {
    id: 1,
    timestamp: 'Jun 9, 2026, 2:48:12 PM',
    planSummary: 'tekton-webhook-tls-repair',
    event: 'Plan aborted',
    user: 'Marcus Chen',
    tokenBurn: 840,
    receiptHash: 'a7f2c91e4b8d3f06c5e1a9d2b4f7e8c0',
    auditReceipt: [
      { key: 'SHA-256 Log Hash', value: 'a7f2c91e4b8d3f06c5e1a9d2b4f7e8c0' },
      { key: 'Termination Trigger', value: 'User-initiated Stop Execution (Tier-1 kill switch)' },
      { key: 'User identity', value: 'Marcus Chen (OIDC verified)' },
      { key: 'Last Completed Step', value: 'Sandbox dry-run: TLS cert rotation — PASSED' },
      { key: 'Immutability Seal', value: 'Ledger entry sealed — no modifications permitted post-write' },
      { key: 'Compliance Framework', value: 'SOC2 Type II / AI-OPS-CTRL-009 (Execution Halt)' },
    ],
  },
  {
    id: 2,
    timestamp: 'Jun 9, 2026, 11:22:04 AM',
    planSummary: 'payments-oom-cascade-remediation',
    event: 'Approval granted',
    user: 'Sarah Patel',
    tokenBurn: 1200,
    receiptHash: 'ce3b9a1f8d2e4c7b5a0f3d6e9c1b4a8',
    auditReceipt: [
      { key: 'SHA-256 Log Hash', value: 'ce3b9a1f8d2e4c7b5a0f3d6e9c1b4a8' },
      { key: 'Approver identity', value: 'Sarah Patel (OIDC + MFA verified)' },
      { key: 'Approval Scope', value: 'Critical plan — payments-prod namespace mutation authorized' },
      { key: 'RBAC Token Clearance', value: 'K8s:Core:Mutation — GRANTED (human-approved override)' },
      { key: 'OTel Trace', value: '#ot-8e4c2a (span closed: 11:22:07 AM)' },
      { key: 'Compliance Framework', value: 'SOC2 Type II / AI-OPS-CTRL-007 (Human Approval Required)' },
    ],
  },
  {
    id: 3,
    timestamp: 'Jun 9, 2026, 9:14:38 AM',
    planSummary: 'gitops-ingress-drift-remediation',
    event: 'Remediation applied',
    user: 'System (Autonomous)',
    tokenBurn: 2150,
    receiptHash: '4d8f1b2c9e7a3f5061d4b8c2e9a7f1d',
    auditReceipt: [
      { key: 'SHA-256 Log Hash', value: '4d8f1b2c9e7a3f5061d4b8c2e9a7f1d' },
      { key: 'Mutation Payload', value: 'ArgoCD hard sync — openshift-ingress/router-default' },
      { key: 'RBAC Token Clearance', value: 'GitOps:Argo:Sync — GRANTED (policy: sre-autonomy-v2.4)' },
      { key: 'Post-Remediation Health', value: 'Healthy — ingress p99 latency 38ms (nominal)' },
      { key: 'OTel Trace', value: '#ot-7f9b1c (span closed: 09:14:45 AM)' },
      { key: 'Compliance Framework', value: 'SOC2 Type II / AI-OPS-CTRL-004' },
    ],
  },
  {
    id: 4,
    timestamp: 'Jun 8, 2026, 4:31:55 PM',
    planSummary: 'ceph-osd-drift',
    event: 'RCA verified',
    user: 'Marcus Chen',
    tokenBurn: 960,
    receiptHash: 'b2e5f8a1c4d7e9f3062b8d1a5c4e7f9',
    auditReceipt: [
      { key: 'SHA-256 Log Hash', value: 'b2e5f8a1c4d7e9f3062b8d1a5c4e7f9' },
      { key: 'Root Cause', value: 'OSD near-full threshold breached on pool ceph-block (87% utilization)' },
      { key: 'Verified by', value: 'Marcus Chen — diagnosis acknowledged via RCA gate' },
      { key: 'Evidence Chain', value: 'Ceph health report + Prometheus pool metrics + operator logs' },
      { key: 'OTel Trace', value: '#ot-5c3a1d (span closed: 4:32:01 PM)' },
      { key: 'Compliance Framework', value: 'SOC2 Type II / AI-OPS-CTRL-003 (RCA Verification)' },
    ],
  },
  {
    id: 5,
    timestamp: 'Jun 8, 2026, 3:18:22 PM',
    planSummary: 'ceph-osd-drift',
    event: 'Investigation started',
    user: 'System (Autonomous)',
    tokenBurn: 1420,
    receiptHash: 'f9c1e4a7b2d8f3056e1c4a9b7d2f8e3',
    auditReceipt: [
      { key: 'SHA-256 Log Hash', value: 'f9c1e4a7b2d8f3056e1c4a9b7d2f8e3' },
      { key: 'Trigger Alert', value: 'CephOSDNearFull — severity: critical' },
      { key: 'Cluster Scope', value: 'prod-east-2 / openshift-storage' },
      { key: 'Agent Capability', value: 'Storage:Ceph:Triage' },
      { key: 'OTel Trace', value: '#ot-2a9f4e (span closed: 3:18:29 PM)' },
      { key: 'Compliance Framework', value: 'SOC2 Type II / AI-OPS-CTRL-001 (Autonomous Investigation)' },
    ],
  },
  {
    id: 6,
    timestamp: 'Jun 8, 2026, 2:55:10 PM',
    planSummary: 'acs-runtime-exploit-quarantine',
    event: 'Plan submitted',
    user: 'System (Autonomous)',
    tokenBurn: 380,
    receiptHash: '1a3c5e7f9b2d4f6082e4c6a8b0d2f4e',
    auditReceipt: [
      { key: 'SHA-256 Log Hash', value: '1a3c5e7f9b2d4f6082e4c6a8b0d2f4e' },
      { key: 'Plan Origin', value: 'ACS RuntimeViolation — CryptoMiningProcessDetected' },
      { key: 'Target Scope', value: 'payments-prod / payment-api' },
      { key: 'Initial Risk Score', value: '78 — High blast radius (production workload)' },
      { key: 'OTel Trace', value: '#ot-9d1b3c (span closed: 2:55:14 PM)' },
      { key: 'Compliance Framework', value: 'SOC2 Type II / AI-SEC-CTRL-001' },
    ],
  },
];

const LIFECYCLE_EVENTS = [
  'All',
  'Plan submitted',
  'Investigation started',
  'RCA verified',
  'Approval granted',
  'Remediation applied',
  'Plan aborted',
] as const;

const USER_FILTERS = ['All', 'System (Autonomous)', 'Human users'] as const;

// ── Sub-components ─────────────────────────────────────────────────────────────

const MetricCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Card isFullHeight className="ols-ai-hub-audit-metrics-card">
    <CardHeader>
      <CardTitle>
        <Title headingLevel="h3" size="md">{title}</Title>
      </CardTitle>
    </CardHeader>
    <CardBody>{children}</CardBody>
  </Card>
);

const AuditReceiptGrid: React.FC<{ items: AuditReceiptItem[] }> = ({ items }) => (
  <div className="ols-audit-receipt-grid">
    {items.map((item) => (
      <React.Fragment key={item.key}>
        <div className="ols-audit-receipt-grid__key">{item.key}</div>
        <div>
          <code className="ols-audit-receipt-grid__value">{item.value}</code>
        </div>
      </React.Fragment>
    ))}
  </div>
);

const CryptographicReceiptBadge: React.FC<{ hash: string; onView: () => void }> = ({ hash, onView }) => (
  <Tooltip content="View tamper-evident cryptographic receipt">
    <Button
      variant="plain"
      aria-label={`View cryptographic receipt ${truncateReceiptHash(hash)}`}
      className="ols-audit-receipt-badge-button"
      onClick={onView}
    >
      <Badge className="ols-audit-receipt-badge">
        <FileAltIcon aria-hidden className="ols-audit-receipt-badge__icon" />
        {truncateReceiptHash(hash)}
      </Badge>
    </Button>
  </Tooltip>
);

// ── Main component ─────────────────────────────────────────────────────────────

export const AIAuditAndLogsTab: React.FC = () => {
  const [eventFilterOpen, setEventFilterOpen] = useState(false);
  const [eventFilter, setEventFilter] = useState<string>('All');
  const [userFilterOpen, setUserFilterOpen] = useState(false);
  const [userFilter, setUserFilter] = useState<string>('All');
  const [planSearch, setPlanSearch] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredRows = AUDIT_ROWS.filter((row) => {
    if (eventFilter !== 'All' && row.event !== eventFilter) return false;
    if (userFilter === 'System (Autonomous)' && !isSystemUser(row.user)) return false;
    if (userFilter === 'Human users' && isSystemUser(row.user)) return false;
    if (planSearch && !row.planSummary.toLowerCase().includes(planSearch.toLowerCase())) return false;
    return true;
  });

  return (
    <Stack hasGutter>

      {/* ── 1. ROI Metric Cards ───────────────────────────────────────────────── */}
      <StackItem>
        <Title headingLevel="h2" size="md" style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}>
          Operational insights
        </Title>
        <Grid hasGutter>
          <GridItem span={4}>
            <MetricCard title="MTTR deflection & efficiency">
              <Stack>
                <StackItem style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                  <span
                    className="ols-aio-card-stat-number--readonly"
                    style={{ color: 'var(--pf-t--global--color--status--success--default)' }}
                  >
                    142.5 hrs
                  </span>
                  <Content
                    component="p"
                    style={{
                      marginTop: 'var(--pf-t--global--spacer--xs)',
                      color: 'var(--pf-t--global--text--color--subtle)',
                      fontSize: 'var(--pf-t--global--font--size--body--sm)',
                    }}
                  >
                    Total cumulative time saved
                  </Content>
                </StackItem>
                <StackItem style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                  <div style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                    <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} style={{ marginBottom: 4 }}>
                      <FlexItem><Content component="small" style={{ fontWeight: 600 }}>Manual SRE baseline</Content></FlexItem>
                      <FlexItem><Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>Avg. response time</Content></FlexItem>
                    </Flex>
                    <Progress
                      value={95}
                      aria-label="Manual SRE baseline"
                      size={ProgressSize.sm}
                      measureLocation={'outside' as any}
                      label="42.0 min"
                    />
                  </div>
                  <div>
                    <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} style={{ marginBottom: 4 }}>
                      <FlexItem><Content component="small" style={{ fontWeight: 600 }}>AI agent execution</Content></FlexItem>
                      <FlexItem><Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>Time to remediate</Content></FlexItem>
                    </Flex>
                    <Progress
                      value={2}
                      aria-label="AI agent execution"
                      size={ProgressSize.sm}
                      measureLocation={'outside' as any}
                      label="0.6 min (36s)"
                      style={{ '--pf-v6-c-progress__indicator--BackgroundColor': 'var(--pf-t--global--color--status--success--default)' } as React.CSSProperties}
                    />
                  </div>
                </StackItem>
                <StackItem>
                  <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontStyle: 'italic' }}>
                    *Calculated across 214 automated interventions this month.
                  </Content>
                </StackItem>
              </Stack>
            </MetricCard>
          </GridItem>

          <GridItem span={4}>
            <MetricCard title="Autonomy rate by impact">
              <Stack hasGutter>
                <StackItem>
                  <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} style={{ marginBottom: 4 }}>
                    <FlexItem><Content component="small" style={{ fontWeight: 600 }}>Warning alerts</Content></FlexItem>
                    <FlexItem><Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>Autonomous resolution</Content></FlexItem>
                  </Flex>
                  <Progress value={94} aria-label="Warning alerts autonomous resolution" size={ProgressSize.sm} measureLocation={'outside' as any} label="94%" />
                </StackItem>
                <StackItem>
                  <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} style={{ marginBottom: 4 }}>
                    <FlexItem><Content component="small" style={{ fontWeight: 600 }}>Critical anomalies</Content></FlexItem>
                    <FlexItem><Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>Human-in-the-loop</Content></FlexItem>
                  </Flex>
                  <Progress
                    value={18}
                    aria-label="Critical anomalies human-in-the-loop"
                    size={ProgressSize.sm}
                    measureLocation={'outside' as any}
                    label="18%"
                    style={{ '--pf-v6-c-progress__indicator--BackgroundColor': 'var(--pf-t--color--orange--60)' } as React.CSSProperties}
                  />
                </StackItem>
              </Stack>
            </MetricCard>
          </GridItem>

          <GridItem span={4}>
            <MetricCard title="Local inference capacity & budget">
              <span className="ols-aio-card-stat-number--readonly">$342.10</span>
              <Content component="p" style={{ marginTop: 'var(--pf-t--global--spacer--sm)', color: 'var(--pf-t--global--text--color--subtle)', fontSize: 'var(--pf-t--global--font--size--body--sm)' }}>
                Simulated public API cost equivalent saved via local model inferencing
              </Content>
            </MetricCard>
          </GridItem>
        </Grid>
      </StackItem>

      {/* ── 2. Execution Ledger title + Filter Toolbar ───────────────────────── */}
      <StackItem style={{ marginTop: 12 }}>
        <Title headingLevel="h3" size="md" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
          Execution ledger
        </Title>
        <Flex alignItems={{ default: 'alignItemsCenter' }} flexWrap={{ default: 'wrap' }} gap={{ default: 'gapSm' }}>
          <FlexItem>
            <Select
              aria-label="Lifecycle event filter"
              isOpen={eventFilterOpen}
              onSelect={(_e, val) => { setEventFilter(val as string); setEventFilterOpen(false); }}
              onOpenChange={setEventFilterOpen}
              toggle={(ref: React.Ref<MenuToggleElement>) => (
                <MenuToggle ref={ref} onClick={() => setEventFilterOpen((o) => !o)} isExpanded={eventFilterOpen}>
                  {eventFilter === 'All' ? 'Event / action' : eventFilter}
                </MenuToggle>
              )}
            >
              <SelectList>
                {LIFECYCLE_EVENTS.map((v) => (
                  <SelectOption key={v} value={v} isSelected={eventFilter === v}>{v}</SelectOption>
                ))}
              </SelectList>
            </Select>
          </FlexItem>

          <FlexItem>
            <TextInput
              aria-label="Plan summary search"
              placeholder="Search plan summary…"
              value={planSearch}
              onChange={(_e, val) => setPlanSearch(val)}
              style={{ minWidth: 220 }}
            />
          </FlexItem>

          <FlexItem>
            <Select
              aria-label="User filter"
              isOpen={userFilterOpen}
              onSelect={(_e, val) => { setUserFilter(val as string); setUserFilterOpen(false); }}
              onOpenChange={setUserFilterOpen}
              toggle={(ref: React.Ref<MenuToggleElement>) => (
                <MenuToggle ref={ref} onClick={() => setUserFilterOpen((o) => !o)} isExpanded={userFilterOpen}>
                  {userFilter === 'All' ? 'User' : userFilter}
                </MenuToggle>
              )}
            >
              <SelectList>
                {USER_FILTERS.map((v) => (
                  <SelectOption key={v} value={v} isSelected={userFilter === v}>{v}</SelectOption>
                ))}
              </SelectList>
            </Select>
          </FlexItem>

          <FlexItem>
            <Button variant="link" icon={<DownloadIcon />} iconPosition="start">
              Export SOC2 / AI compliance report
            </Button>
          </FlexItem>
        </Flex>
      </StackItem>

      {/* ── 3. Execution Ledger Table ─────────────────────────────────────────── */}
      <StackItem>
        <Table aria-label="Execution ledger" variant="compact" className="ols-audit-ledger-table">
          <Thead>
            <Tr>
              <Th screenReaderText="Row expand" />
              <Th>Timestamp</Th>
              <Th>Plan summary</Th>
              <Th>Event / action</Th>
              <Th>User</Th>
              <Th>Token burn</Th>
              <Th>Cryptographic receipt</Th>
            </Tr>
          </Thead>

          {filteredRows.map((row, rowIndex) => {
            const isExpanded = expandedRows.has(row.id);

            return (
              <Tbody key={row.id} isExpanded={isExpanded}>
                <Tr>
                  <Td
                    expand={{
                      rowIndex,
                      isExpanded,
                      onToggle: () => toggleRow(row.id),
                      expandId: `audit-expand-${row.id}`,
                    }}
                  />
                  <Td dataLabel="Timestamp" className="ols-audit-ledger-table__timestamp">
                    {row.timestamp}
                  </Td>
                  <Td dataLabel="Plan summary">
                    <code className="ols-audit-ledger-table__plan">{row.planSummary}</code>
                  </Td>
                  <Td dataLabel="Event / action">
                    <EventLabel event={row.event} timestamp={row.timestamp} />
                  </Td>
                  <Td dataLabel="User">
                    {isSystemUser(row.user) ? (
                      <Label color="grey" isCompact>{row.user}</Label>
                    ) : (
                      <span className="ols-audit-ledger-table__user">{row.user}</span>
                    )}
                  </Td>
                  <Td dataLabel="Token burn" className="ols-audit-ledger-table__tokens">
                    {formatTokenBurn(row.tokenBurn)}
                  </Td>
                  <Td dataLabel="Cryptographic receipt">
                    <CryptographicReceiptBadge hash={row.receiptHash} onView={() => toggleRow(row.id)} />
                  </Td>
                </Tr>

                <Tr isExpanded={isExpanded}>
                  <Td colSpan={7} noPadding>
                    <ExpandableRowContent>
                      <div className="ols-audit-receipt-expand">
                        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                          <FlexItem>
                            <Label color="green" icon={<CheckCircleIcon />} isCompact>
                              Immutable — sealed at write time
                            </Label>
                          </FlexItem>
                          <FlexItem>
                            <Label color="blue" isCompact variant="outline">
                              {row.auditReceipt.find((i) => i.key === 'Compliance Framework')?.value ?? ''}
                            </Label>
                          </FlexItem>
                        </Flex>
                        <AuditReceiptGrid items={row.auditReceipt} />
                      </div>
                    </ExpandableRowContent>
                  </Td>
                </Tr>
              </Tbody>
            );
          })}
        </Table>
      </StackItem>

    </Stack>
  );
};

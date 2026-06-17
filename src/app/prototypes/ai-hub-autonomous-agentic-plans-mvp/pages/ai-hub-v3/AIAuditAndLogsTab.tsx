import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Flex,
  FlexItem,
  Label,
  MenuToggle,
  MenuToggleElement,
  Pagination,
  PaginationVariant,
  Select,
  SelectList,
  SelectOption,
  Stack,
  StackItem,
  TextInput,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import { CheckCircleIcon, DownloadIcon, FileAltIcon } from '@patternfly/react-icons';
import { ExpandableRowContent, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { formatTokenBurn } from '../../types/tokenBurn';
import { SC_PLAN_TABLE_IDENTITY } from './singleClusterPlanSimulation';
import { MVP_PLAN_IDS } from './plansMvpConstants';
import './ai-hub-v3-inventory.css';

// ── Types ──────────────────────────────────────────────────────────────────────

type LifecycleEvent =
  | 'Plan submitted'
  | 'Investigation started'
  | 'RCA verified'
  | 'Approval granted'
  | 'Remediation applied'
  | 'Verification started'
  | 'Verification passed'
  | 'Verification failed'
  | 'Analysis revision requested'
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

const DEFAULT_PER_PAGE = 10;

const truncateReceiptHash = (hash: string): string => hash.slice(0, 6);

const PLAN_SUMMARIES = Object.entries(SC_PLAN_TABLE_IDENTITY)
  .filter(([id]) => MVP_PLAN_IDS.has(id))
  .map(([, plan]) => plan.name);

const isSystemUser = (user: string): boolean => user.startsWith('System');

type LabelColor = 'blue' | 'teal' | 'orange' | 'green' | 'red' | 'grey';

const EVENT_LABEL_COLOR: Record<LifecycleEvent, LabelColor> = {
  'Plan submitted': 'blue',
  'Investigation started': 'blue',
  'RCA verified': 'teal',
  'Approval granted': 'orange',
  'Remediation applied': 'green',
  'Verification started': 'teal',
  'Verification passed': 'green',
  'Verification failed': 'red',
  'Analysis revision requested': 'blue',
  'Plan aborted': 'red',
};

const EventLabel: React.FC<{ event: LifecycleEvent; timestamp?: string }> = ({ event, timestamp }) => {
  if (event === 'Plan aborted') {
    const tooltipContent = `Execution halted by administrative override at ${timestamp ?? '—'}.`;
    return (
      <Tooltip content={tooltipContent} position="top">
        <span tabIndex={0} style={{ display: 'inline-flex', cursor: 'default' }}>
          <Label color="red" variant="outline" isCompact style={{ whiteSpace: 'nowrap' }}>
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

const LIFECYCLE_EVENT_SEQUENCE: LifecycleEvent[] = [
  'Plan submitted',
  'Investigation started',
  'RCA verified',
  'Approval granted',
  'Remediation applied',
  'Plan aborted',
];

const HUMAN_USERS = ['Marcus Chen', 'Sarah Patel', 'James Morrison', 'Elena Vasquez', 'David Okonkwo'];

const COMPLIANCE_BY_EVENT: Record<LifecycleEvent, string> = {
  'Plan submitted': 'SOC2 Type II / AI-OPS-CTRL-001',
  'Investigation started': 'SOC2 Type II / AI-OPS-CTRL-001 (Autonomous Investigation)',
  'RCA verified': 'SOC2 Type II / AI-OPS-CTRL-003 (RCA Verification)',
  'Approval granted': 'SOC2 Type II / AI-OPS-CTRL-007 (Human Approval Required)',
  'Remediation applied': 'SOC2 Type II / AI-OPS-CTRL-004',
  'Verification started': 'SOC2 Type II / AI-OPS-CTRL-005 (Post-Execution Verification)',
  'Verification passed': 'SOC2 Type II / AI-OPS-CTRL-005 (Post-Execution Verification)',
  'Verification failed': 'SOC2 Type II / AI-OPS-CTRL-005 (Post-Execution Verification)',
  'Analysis revision requested': 'SOC2 Type II / AI-OPS-CTRL-002 (Revision Feedback)',
  'Plan aborted': 'SOC2 Type II / AI-OPS-CTRL-009 (Execution Halt)',
};

const buildReceiptHash = (id: number, event: LifecycleEvent): string => {
  const seed = `${id}-${event}`.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Array.from({ length: 32 }, (_, index) => {
    const value = (seed * (index + 17) * 31) % 16;
    return value.toString(16);
  }).join('');
};

const formatAuditTimestamp = (index: number): string => {
  const base = new Date('2026-06-09T15:00:00');
  const minutesBack = index * 47 + (index % 5) * 11;
  const date = new Date(base.getTime() - minutesBack * 60_000);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const buildAuditReceipt = (row: Pick<AuditRow, 'event' | 'user' | 'planSummary' | 'receiptHash' | 'timestamp'>): AuditReceiptItem[] => {
  const items: AuditReceiptItem[] = [
    { key: 'SHA-256 Log Hash', value: row.receiptHash },
    { key: 'Plan summary', value: row.planSummary },
    { key: 'Compliance Framework', value: COMPLIANCE_BY_EVENT[row.event] },
    { key: 'OTel Trace', value: `#ot-${row.receiptHash.slice(0, 6)} (span closed: ${row.timestamp})` },
    { key: 'Immutability Seal', value: 'Ledger entry sealed — no modifications permitted post-write' },
  ];

  if (row.event === 'Plan aborted') {
    items.splice(1, 0, { key: 'User identity', value: `${row.user} (OIDC verified)` });
    items.splice(2, 0, { key: 'Termination Trigger', value: 'User-initiated Stop Execution (Tier-1 kill switch)' });
  } else if (row.event === 'Approval granted') {
    items.splice(1, 0, { key: 'Approver identity', value: `${row.user} (OIDC + MFA verified)` });
  } else if (row.event === 'RCA verified') {
    items.splice(1, 0, { key: 'Verified by', value: `${row.user} — diagnosis acknowledged via RCA gate` });
  }

  return items;
};

const buildSimulatedAuditRows = (count: number): AuditRow[] => {
  const priorityRows: Array<Pick<AuditRow, 'planSummary' | 'event' | 'user' | 'tokenBurn'>> = [
    { planSummary: 'ocp-upgrade-4.15-to-4.16', event: 'Plan aborted', user: 'Marcus Chen', tokenBurn: 2450 },
    { planSummary: 'scale-otel-collector-replicas', event: 'Verification started', user: 'System (Autonomous)', tokenBurn: 1540 },
    { planSummary: 'fix-alertmanager-webhook-secret', event: 'Analysis revision requested', user: 'Marcus Chen', tokenBurn: 560 },
    { planSummary: 'recover-thanos-compactor-pv', event: 'Approval granted', user: 'Sarah Patel', tokenBurn: 1880 },
    { planSummary: 'reconcile-prometheus-targets', event: 'Verification passed', user: 'System (Autonomous)', tokenBurn: 1920 },
    { planSummary: 'acs-hostnetwork-policy-fix', event: 'Approval granted', user: 'Marcus Chen', tokenBurn: 920 },
    { planSummary: 'acs-payments-workload-quarantine', event: 'Investigation started', user: 'System (Autonomous)', tokenBurn: 1420 },
    { planSummary: 'acs-payments-workload-quarantine', event: 'Plan submitted', user: 'System (Autonomous)', tokenBurn: 380 },
  ];

  return Array.from({ length: count }, (_, index) => {
    const priority = priorityRows[index];
    const event = priority?.event ?? LIFECYCLE_EVENT_SEQUENCE[index % LIFECYCLE_EVENT_SEQUENCE.length];
    const planSummary = priority?.planSummary ?? PLAN_SUMMARIES[index % PLAN_SUMMARIES.length];
    const user = priority?.user ?? (
      event === 'Remediation applied'
        || event === 'Investigation started'
        || event === 'Plan submitted'
        || event === 'Verification started'
        || event === 'Verification passed'
        ? 'System (Autonomous)'
        : HUMAN_USERS[index % HUMAN_USERS.length]
    );
    const tokenBurn = priority?.tokenBurn ?? 320 + ((index * 173) % 2800);
    const receiptHash = buildReceiptHash(index + 1, event);
    const timestamp = formatAuditTimestamp(index);

    const row: AuditRow = {
      id: index + 1,
      timestamp,
      planSummary,
      event,
      user,
      tokenBurn,
      receiptHash,
      auditReceipt: [],
    };

    row.auditReceipt = buildAuditReceipt(row);
    return row;
  });
};

const AUDIT_ROWS = buildSimulatedAuditRows(30);

const LIFECYCLE_EVENTS = [
  'All',
  'Plan submitted',
  'Investigation started',
  'RCA verified',
  'Approval granted',
  'Remediation applied',
  'Verification started',
  'Verification passed',
  'Verification failed',
  'Analysis revision requested',
  'Plan aborted',
] as const;

const USER_FILTERS = ['All', 'System (Autonomous)', 'Human users'] as const;

// ── Sub-components ─────────────────────────────────────────────────────────────

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

const CryptographicReceiptLink: React.FC<{ hash: string; onView: () => void }> = ({ hash, onView }) => (
  <Button
    variant="link"
    isInline
    icon={<FileAltIcon />}
    iconPosition="start"
    aria-label={`View cryptographic receipt ${truncateReceiptHash(hash)}`}
    className="ols-audit-receipt-link"
    onClick={onView}
  >
    {truncateReceiptHash(hash)}
  </Button>
);

// ── Main component ─────────────────────────────────────────────────────────────

export const AIAuditAndLogsTab: React.FC = () => {
  const [eventFilterOpen, setEventFilterOpen] = useState(false);
  const [eventFilter, setEventFilter] = useState<string>('All');
  const [userFilterOpen, setUserFilterOpen] = useState(false);
  const [userFilter, setUserFilter] = useState<string>('All');
  const [planSearch, setPlanSearch] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredRows = useMemo(() => AUDIT_ROWS.filter((row) => {
    if (eventFilter !== 'All' && row.event !== eventFilter) return false;
    if (userFilter === 'System (Autonomous)' && !isSystemUser(row.user)) return false;
    if (userFilter === 'Human users' && isSystemUser(row.user)) return false;
    if (planSearch && !row.planSummary.toLowerCase().includes(planSearch.toLowerCase())) return false;
    return true;
  }), [eventFilter, userFilter, planSearch]);

  useEffect(() => {
    setPage(1);
  }, [filteredRows.length, eventFilter, userFilter, planSearch]);

  const totalItems = filteredRows.length;
  const start = (page - 1) * perPage;
  const paginatedRows = filteredRows.slice(start, start + perPage);

  const onSetPage = useCallback(
    (_evt: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number) => {
      setPage(newPage);
    },
    [],
  );

  const onPerPageSelect = useCallback(
    (
      _evt: React.MouseEvent | React.KeyboardEvent | MouseEvent,
      newPerPage: number,
      newPage: number,
    ) => {
      setPerPage(newPerPage);
      setPage(newPage);
    },
    [],
  );

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(totalItems / perPage));
    if (page > maxPage) setPage(maxPage);
  }, [perPage, totalItems, page]);

  const paginationProps = {
    itemCount: totalItems,
    page,
    perPage,
    onSetPage,
    onPerPageSelect,
    perPageOptions: [
      { title: '5', value: 5 },
      { title: '10', value: 10 },
      { title: '20', value: 20 },
    ],
  };

  return (
    <Stack hasGutter>
      <StackItem>
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          flexWrap={{ default: 'wrap' }}
          gap={{ default: 'gapSm' }}
          style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
        >
          <FlexItem>
            <Title headingLevel="h3" size="md" style={{ margin: 0 }}>
              Execution ledger
            </Title>
          </FlexItem>
          <FlexItem>
            <Pagination isCompact {...paginationProps} style={{ margin: 0 }} />
          </FlexItem>
        </Flex>

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

          {paginatedRows.map((row, rowIndex) => {
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
                    <CryptographicReceiptLink hash={row.receiptHash} onView={() => toggleRow(row.id)} />
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

        <Pagination
          {...paginationProps}
          variant={PaginationVariant.bottom}
          style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}
        />
      </StackItem>
    </Stack>
  );
};

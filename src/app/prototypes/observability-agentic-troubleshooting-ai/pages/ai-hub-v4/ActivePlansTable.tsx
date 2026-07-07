/**
 * v4.0 — Active Plans Table.
 *
 * 6-column fleet-scoped plan inbox with:
 *   • Per-row expander revealing investigation summary + signal breakdown
 *   • ⚡ impact icon on the Impact Score column
 *   • Multi-dimension filter toolbar (Trigger Source · Environment · Status Phase)
 *   • Pagination
 *
 * Epic: HPUX-1653 · Story: Recommendation Hub inbox UI
 */
import React, { useCallback, useMemo, useState } from 'react';
import {
  Button,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  Label,
  LabelGroup,
  MenuToggle,
  type MenuToggleElement,
  Pagination,
  PaginationVariant,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import { BoltIcon, FilterIcon, TimesIcon } from '@patternfly/react-icons';
import { ExpandableRowContent, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import {
  V4_PLAN_ROWS,
  type EnvironmentType,
  type StatusPhase,
  type TriggerSource,
  type V4PlanRow,
} from './v4Data';

// ─── Constants ────────────────────────────────────────────────────────────────

const TRIGGER_SOURCE_OPTIONS: TriggerSource[] = ['Prometheus', 'GitOps Drift', 'ACS Violation', 'Pipeline', 'ACM'];
const ENVIRONMENT_OPTIONS: EnvironmentType[]   = ['Prod', 'Test', 'Sandbox'];
const STATUS_PHASE_OPTIONS: StatusPhase[]       = ['Proposed', 'Executing', 'Failed', 'Escalated'];
const PAGE_SIZE_DEFAULT = 10;

// ─── Badge colour maps ────────────────────────────────────────────────────────

const STATUS_COLOR: Record<StatusPhase, React.ComponentProps<typeof Label>['color']> = {
  Proposed:  'blue',
  Executing: 'green',
  Failed:    'red',
  Escalated: 'orange',
};

const ENV_COLOR: Record<EnvironmentType, React.ComponentProps<typeof Label>['color']> = {
  Prod:    'purple',
  Test:    'cyan',
  Sandbox: 'grey',
};

// ─── Impact score helpers ─────────────────────────────────────────────────────

function impactColor(score: number): string {
  if (score >= 85) return 'var(--pf-t--global--color--status--danger--default)';
  if (score >= 65) return 'var(--pf-t--global--color--status--warning--default)';
  return 'var(--pf-t--global--text--color--subtle)';
}

// ─── Filter state ─────────────────────────────────────────────────────────────

interface FilterState {
  triggerSources: TriggerSource[];
  environmentTypes: EnvironmentType[];
  statusPhases: StatusPhase[];
}

const EMPTY_FILTERS: FilterState = { triggerSources: [], environmentTypes: [], statusPhases: [] };

function applyFilters(rows: V4PlanRow[], f: FilterState): V4PlanRow[] {
  return rows.filter((row) => {
    if (f.triggerSources.length > 0 && !row.triggerSources.some((ts) => f.triggerSources.includes(ts))) return false;
    if (f.environmentTypes.length > 0 && !f.environmentTypes.includes(row.environmentType)) return false;
    if (f.statusPhases.length > 0 && !f.statusPhases.includes(row.statusPhase)) return false;
    return true;
  });
}

// ─── Reusable filter dropdown ─────────────────────────────────────────────────

interface FilterDropdownProps<T extends string> {
  label: string;
  options: T[];
  selected: T[];
  onToggle: (value: T) => void;
}

function FilterDropdown<T extends string>({ label, options, selected, onToggle }: FilterDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const hasActive = selected.length > 0;
  return (
    <Dropdown
      isOpen={open}
      onOpenChange={setOpen}
      toggle={(ref: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={ref}
          onClick={() => setOpen((o) => !o)}
          isExpanded={open}
          icon={<FilterIcon />}
          variant={hasActive ? 'primary' : 'default'}
          aria-label={`Filter by ${label}`}
        >
          {label}{hasActive ? ` (${selected.length})` : ''}
        </MenuToggle>
      )}
    >
      <DropdownList>
        {options.map((opt) => (
          <DropdownItem
            key={opt}
            onClick={() => onToggle(opt)}
            icon={
              selected.includes(opt)
                ? <span style={{ color: 'var(--pf-t--global--color--brand--default)' }}>✓</span>
                : <span style={{ width: '1em', display: 'inline-block' }} />
            }
          >
            {opt}
          </DropdownItem>
        ))}
      </DropdownList>
    </Dropdown>
  );
}

// ─── Expanded row content ─────────────────────────────────────────────────────

const ExpandedPlanDetails: React.FC<{ row: V4PlanRow }> = ({ row }) => {
  const d = row.expandedDetails;
  return (
    <div style={{ padding: '16px 24px', backgroundColor: 'var(--pf-t--global--background--color--secondary--default)' }}>
      <Content
        component="p"
        style={{
          marginBottom: 'var(--pf-t--global--spacer--md)',
          fontStyle: 'italic',
          color: 'var(--pf-t--global--text--color--subtle)',
        }}
      >
        {d.investigationSummary}
      </Content>
      <DescriptionList isHorizontal isCompact columnModifier={{ default: '3Col' }}>
        <DescriptionListGroup>
          <DescriptionListTerm>Signal count</DescriptionListTerm>
          <DescriptionListDescription>{d.signalCount} correlated signals</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Last signal</DescriptionListTerm>
          <DescriptionListDescription>{d.lastSignalAt}</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Recommended action</DescriptionListTerm>
          <DescriptionListDescription>{d.recommendedAction}</DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

export const ActivePlansTable: React.FC = () => {
  const [filters, setFilters]       = useState<FilterState>(EMPTY_FILTERS);
  const [page, setPage]             = useState(1);
  const [perPage, setPerPage]       = useState(PAGE_SIZE_DEFAULT);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleFilter = useCallback(<T extends string>(key: keyof FilterState, value: T) => {
    setFilters((prev) => {
      const curr = prev[key] as T[];
      return { ...prev, [key]: curr.includes(value) ? curr.filter((v) => v !== value) : [...curr, value] };
    });
    setPage(1);
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const clearAllFilters = useCallback(() => { setFilters(EMPTY_FILTERS); setPage(1); }, []);

  const filteredRows = useMemo(() => applyFilters(V4_PLAN_ROWS, filters), [filters]);
  const pageRows = useMemo(() => filteredRows.slice((page - 1) * perPage, page * perPage), [filteredRows, page, perPage]);

  const hasActiveFilters =
    filters.triggerSources.length > 0 || filters.environmentTypes.length > 0 || filters.statusPhases.length > 0;

  const chipGroups = [
    { category: 'Trigger source', chips: filters.triggerSources, onRemove: (v: string) => toggleFilter('triggerSources', v as TriggerSource) },
    { category: 'Environment',    chips: filters.environmentTypes, onRemove: (v: string) => toggleFilter('environmentTypes', v as EnvironmentType) },
    { category: 'Status',         chips: filters.statusPhases,    onRemove: (v: string) => toggleFilter('statusPhases', v as StatusPhase) },
  ].filter((g) => g.chips.length > 0);

  return (
    <section aria-label="Active plans table">
      {/* ── Title ────────────────────────────────────────────────────────── */}
      <Title headingLevel="h2" size="lg" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
        All active plans
      </Title>

      {/* ── Filter toolbar + top pagination ──────────────────────────────── */}
      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }} style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
        <FlexItem>
          <FilterDropdown<TriggerSource>
            label="Trigger source" options={TRIGGER_SOURCE_OPTIONS}
            selected={filters.triggerSources} onToggle={(v) => toggleFilter('triggerSources', v)}
          />
        </FlexItem>
        <FlexItem>
          <FilterDropdown<EnvironmentType>
            label="Environment" options={ENVIRONMENT_OPTIONS}
            selected={filters.environmentTypes} onToggle={(v) => toggleFilter('environmentTypes', v)}
          />
        </FlexItem>
        <FlexItem>
          <FilterDropdown<StatusPhase>
            label="Status" options={STATUS_PHASE_OPTIONS}
            selected={filters.statusPhases} onToggle={(v) => toggleFilter('statusPhases', v)}
          />
        </FlexItem>
        <FlexItem align={{ default: 'alignRight' }}>
          <Pagination
            itemCount={filteredRows.length} perPage={perPage} page={page}
            onSetPage={(_e, p) => setPage(p)}
            onPerPageSelect={(_e, pp) => { setPerPage(pp); setPage(1); }}
            variant={PaginationVariant.top} isCompact
            aria-label="Active plans pagination"
          />
        </FlexItem>
      </Flex>

      {/* ── Active filter chips ──────────────────────────────────────────── */}
      {hasActiveFilters && (
        <Flex gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
          {chipGroups.map((g) => (
            <FlexItem key={g.category}>
              <LabelGroup categoryName={g.category} aria-label={`Active ${g.category} filters`}>
                {g.chips.map((chip) => (
                  <Label key={chip} isCompact onClose={() => g.onRemove(chip)} closeBtnAriaLabel={`Remove ${chip} filter`}>
                    {chip}
                  </Label>
                ))}
              </LabelGroup>
            </FlexItem>
          ))}
          <FlexItem>
            <Button variant="link" isInline icon={<TimesIcon />} onClick={clearAllFilters} aria-label="Clear all filters">
              Clear all filters
            </Button>
          </FlexItem>
        </Flex>
      )}

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <Table aria-label="All active plans" isStickyHeader>
        <Thead>
          <Tr>
            {/* Expander column */}
            <Th screenReaderText="Row expander" />
            <Th width={8}>
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }}>
                <FlexItem><BoltIcon color="var(--pf-t--global--color--status--warning--default)" aria-hidden="true" /></FlexItem>
                <FlexItem>Impact score</FlexItem>
              </Flex>
            </Th>
            <Th>Plan synopsis</Th>
            <Th width={20}>Trigger source</Th>
            <Th width={16}>Target cluster</Th>
            <Th width={10}>Environment</Th>
            <Th width={12}>Status phase</Th>
          </Tr>
        </Thead>

        {pageRows.length === 0 ? (
          <Tbody>
            <Tr>
              <Td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                No plans match the current filters.
              </Td>
            </Tr>
          </Tbody>
        ) : (
          pageRows.map((row, rowIndex) => {
            const isExpanded = expandedIds.has(row.id);
            return (
              <Tbody key={row.id} isExpanded={isExpanded}>
                {/* ── Data row ─────────────────────────────────────────── */}
                <Tr>
                  <Td
                    expand={{
                      rowIndex,
                      isExpanded,
                      onToggle: () => toggleExpand(row.id),
                      expandId: `expand-${row.id}`,
                    }}
                  />

                  {/* Impact score */}
                  <Td dataLabel="Impact score">
                    <Tooltip content="Numeric priority 0–100 based on customer-impact feedback signals" position="top">
                      <span
                        style={{
                          fontWeight: 'var(--pf-t--global--font--weight--body--bold)',
                          fontSize: 'var(--pf-t--global--font--size--body--lg)',
                          color: impactColor(row.impactScore),
                          cursor: 'default',
                          whiteSpace: 'nowrap',
                        }}
                        tabIndex={0}
                        aria-label={`Impact score: ${row.impactScore}`}
                      >
                        <BoltIcon
                          style={{ fontSize: '0.85em', marginRight: '3px', verticalAlign: 'middle' }}
                          color={impactColor(row.impactScore)}
                          aria-hidden="true"
                        />
                        {row.impactScore}
                      </span>
                    </Tooltip>
                  </Td>

                  {/* Plan synopsis */}
                  <Td dataLabel="Plan synopsis">
                    <code style={{ fontSize: 'var(--pf-t--global--font--size--body--sm)', color: 'var(--pf-t--global--text--color--default)' }}>
                      {row.planSynopsis}
                    </code>
                  </Td>

                  {/* Trigger sources */}
                  <Td dataLabel="Trigger source">
                    <Flex gap={{ default: 'gapXs' }} flexWrap={{ default: 'wrap' }}>
                      {row.triggerSources.map((ts) => (
                        <FlexItem key={ts}>
                          <Label isCompact color="blue" variant="outline">{ts}</Label>
                        </FlexItem>
                      ))}
                    </Flex>
                  </Td>

                  {/* Target cluster */}
                  <Td dataLabel="Target cluster">
                    <span style={{ fontFamily: 'monospace', fontSize: '0.85em' }}>{row.targetCluster}</span>
                  </Td>

                  {/* Environment */}
                  <Td dataLabel="Environment">
                    <Label isCompact color={ENV_COLOR[row.environmentType]}>{row.environmentType}</Label>
                  </Td>

                  {/* Status phase */}
                  <Td dataLabel="Status phase">
                    <Label isCompact color={STATUS_COLOR[row.statusPhase]}>{row.statusPhase}</Label>
                  </Td>
                </Tr>

                {/* ── Expanded detail row ───────────────────────────────── */}
                <Tr isExpanded={isExpanded}>
                  <Td dataLabel="Plan details" noPadding colSpan={7}>
                    <ExpandableRowContent>
                      <ExpandedPlanDetails row={row} />
                    </ExpandableRowContent>
                  </Td>
                </Tr>
              </Tbody>
            );
          })
        )}
      </Table>

      {/* ── Bottom pagination ─────────────────────────────────────────────── */}
      <Pagination
        itemCount={filteredRows.length} perPage={perPage} page={page}
        onSetPage={(_e, p) => setPage(p)}
        onPerPageSelect={(_e, pp) => { setPerPage(pp); setPage(1); }}
        variant={PaginationVariant.bottom}
        aria-label="Active plans bottom pagination"
        style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}
      />
    </section>
  );
};

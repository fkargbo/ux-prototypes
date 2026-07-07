/**
 * v4.0 — Active Plans Table.
 *
 * 6-column fleet-scoped plan inbox with a multi-dimension filter toolbar.
 * Filter dimensions: Trigger Source · Environment Type · Status Phase.
 *
 * All data flows from v4Data.ts. Zero coupling to v1 / v2 / v3 modules.
 *
 * Epic: HPUX-1653 · Story: Recommendation Hub inbox UI
 */
import React, { useCallback, useMemo, useState } from 'react';
import {
  Button,
  ChipGroup,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  Label,
  MenuToggle,
  type MenuToggleElement,
  Pagination,
  PaginationVariant,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import { FilterIcon, TimesIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import {
  V4_PLAN_ROWS,
  type EnvironmentType,
  type StatusPhase,
  type TriggerSource,
  type V4PlanRow,
} from './v4Data';

// ─── Constants ────────────────────────────────────────────────────────────────

const TRIGGER_SOURCE_OPTIONS: TriggerSource[] = [
  'Prometheus',
  'GitOps Drift',
  'ACS Violation',
  'Pipeline',
  'ACM',
];

const ENVIRONMENT_OPTIONS: EnvironmentType[] = ['Prod', 'Test', 'Sandbox'];

const STATUS_PHASE_OPTIONS: StatusPhase[] = ['Proposed', 'Executing', 'Failed', 'Escalated'];

const PAGE_SIZE_DEFAULT = 10;

// ─── Status phase styling ─────────────────────────────────────────────────────

const STATUS_LABEL_COLOR: Record<StatusPhase, React.ComponentProps<typeof Label>['color']> = {
  Proposed:  'blue',
  Executing: 'green',
  Failed:    'red',
  Escalated: 'orange',
};

// ─── Environment badge ────────────────────────────────────────────────────────

const ENV_LABEL_COLOR: Record<EnvironmentType, React.ComponentProps<typeof Label>['color']> = {
  Prod:    'purple',
  Test:    'cyan',
  Sandbox: 'grey',
};

// ─── Impact score badge ───────────────────────────────────────────────────────

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

const EMPTY_FILTERS: FilterState = {
  triggerSources: [],
  environmentTypes: [],
  statusPhases: [],
};

function applyFilters(rows: V4PlanRow[], filters: FilterState): V4PlanRow[] {
  return rows.filter((row) => {
    if (
      filters.triggerSources.length > 0 &&
      !row.triggerSources.some((ts) => filters.triggerSources.includes(ts))
    ) {
      return false;
    }
    if (
      filters.environmentTypes.length > 0 &&
      !filters.environmentTypes.includes(row.environmentType)
    ) {
      return false;
    }
    if (filters.statusPhases.length > 0 && !filters.statusPhases.includes(row.statusPhase)) {
      return false;
    }
    return true;
  });
}

// ─── Filter dropdown ──────────────────────────────────────────────────────────

interface FilterDropdownProps<T extends string> {
  label: string;
  options: T[];
  selected: T[];
  onToggle: (value: T) => void;
}

function FilterDropdown<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: FilterDropdownProps<T>) {
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
          {label}
          {hasActive ? ` (${selected.length})` : ''}
        </MenuToggle>
      )}
    >
      <DropdownList>
        {options.map((opt) => (
          <DropdownItem
            key={opt}
            onClick={() => onToggle(opt)}
            icon={
              selected.includes(opt) ? (
                <span style={{ color: 'var(--pf-t--global--color--brand--default)' }}>✓</span>
              ) : (
                <span style={{ width: '1em', display: 'inline-block' }} />
              )
            }
          >
            {opt}
          </DropdownItem>
        ))}
      </DropdownList>
    </Dropdown>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ActivePlansTable: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PAGE_SIZE_DEFAULT);

  // ── Generic toggle helper ───────────────────────────────────────────────────
  const toggleFilter = useCallback(
    <T extends string>(key: keyof FilterState, value: T) => {
      setFilters((prev) => {
        const current = prev[key] as T[];
        const next = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        return { ...prev, [key]: next };
      });
      setPage(1);
    },
    []
  );

  const clearAllFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }, []);

  // ── Derived rows ────────────────────────────────────────────────────────────
  const filteredRows = useMemo(() => applyFilters(V4_PLAN_ROWS, filters), [filters]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredRows.slice(start, start + perPage);
  }, [filteredRows, page, perPage]);

  const hasActiveFilters =
    filters.triggerSources.length > 0 ||
    filters.environmentTypes.length > 0 ||
    filters.statusPhases.length > 0;

  // ── Active filter chips ─────────────────────────────────────────────────────
  const chipGroups: Array<{
    category: string;
    chips: string[];
    onRemove: (v: string) => void;
  }> = [
    {
      category: 'Trigger source',
      chips: filters.triggerSources,
      onRemove: (v) => toggleFilter('triggerSources', v as TriggerSource),
    },
    {
      category: 'Environment',
      chips: filters.environmentTypes,
      onRemove: (v) => toggleFilter('environmentTypes', v as EnvironmentType),
    },
    {
      category: 'Status',
      chips: filters.statusPhases,
      onRemove: (v) => toggleFilter('statusPhases', v as StatusPhase),
    },
  ].filter((g) => g.chips.length > 0);

  return (
    <section aria-label="Active plans table">
      {/* ── Table title ──────────────────────────────────────────────────── */}
      <Title
        headingLevel="h2"
        size="lg"
        style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
      >
        Active plans
      </Title>

      {/* ── Filter toolbar ───────────────────────────────────────────────── */}
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        gap={{ default: 'gapSm' }}
        flexWrap={{ default: 'wrap' }}
        style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
      >
        <FlexItem>
          <FilterDropdown<TriggerSource>
            label="Trigger source"
            options={TRIGGER_SOURCE_OPTIONS}
            selected={filters.triggerSources}
            onToggle={(v) => toggleFilter('triggerSources', v)}
          />
        </FlexItem>
        <FlexItem>
          <FilterDropdown<EnvironmentType>
            label="Environment"
            options={ENVIRONMENT_OPTIONS}
            selected={filters.environmentTypes}
            onToggle={(v) => toggleFilter('environmentTypes', v)}
          />
        </FlexItem>
        <FlexItem>
          <FilterDropdown<StatusPhase>
            label="Status"
            options={STATUS_PHASE_OPTIONS}
            selected={filters.statusPhases}
            onToggle={(v) => toggleFilter('statusPhases', v)}
          />
        </FlexItem>

        {/* Pagination — right-aligned */}
        <FlexItem align={{ default: 'alignRight' }}>
          <Pagination
            itemCount={filteredRows.length}
            perPage={perPage}
            page={page}
            onSetPage={(_e, p) => setPage(p)}
            onPerPageSelect={(_e, pp) => { setPerPage(pp); setPage(1); }}
            variant={PaginationVariant.top}
            isCompact
            aria-label="Active plans table pagination"
          />
        </FlexItem>
      </Flex>

      {/* ── Active filter chips ──────────────────────────────────────────── */}
      {hasActiveFilters && (
        <Flex
          gap={{ default: 'gapSm' }}
          flexWrap={{ default: 'wrap' }}
          alignItems={{ default: 'alignItemsCenter' }}
          style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
        >
          {chipGroups.map((g) => (
            <FlexItem key={g.category}>
              <ChipGroup categoryName={g.category} isClosable={false}>
                {g.chips.map((chip) => (
                  <Chip
                    key={chip}
                    onClick={() => g.onRemove(chip)}
                  >
                    {chip}
                  </Chip>
                ))}
              </ChipGroup>
            </FlexItem>
          ))}
          <FlexItem>
            <Button
              variant="link"
              isInline
              icon={<TimesIcon />}
              onClick={clearAllFilters}
              aria-label="Clear all filters"
            >
              Clear all filters
            </Button>
          </FlexItem>
        </Flex>
      )}

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <Table aria-label="Active plans" isStickyHeader>
        <Thead>
          <Tr>
            <Th width={8}>Impact score</Th>
            <Th>Plan synopsis</Th>
            <Th width={20}>Trigger source</Th>
            <Th width={18}>Target cluster</Th>
            <Th width={10}>Environment</Th>
            <Th width={12}>Status phase</Th>
          </Tr>
        </Thead>
        <Tbody>
          {pageRows.length === 0 ? (
            <Tr>
              <Td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                No plans match the current filters.
              </Td>
            </Tr>
          ) : (
            pageRows.map((row) => (
              <Tr key={row.id}>
                {/* Impact score */}
                <Td dataLabel="Impact score">
                  <Tooltip
                    content="Numeric priority 0–100 based on customer-impact feedback signals"
                    position="top"
                  >
                    <span
                      style={{
                        fontWeight: 'var(--pf-t--global--font--weight--body--bold)',
                        fontSize: 'var(--pf-t--global--font--size--body--lg)',
                        color: impactColor(row.impactScore),
                        cursor: 'default',
                      }}
                      tabIndex={0}
                      aria-label={`Impact score: ${row.impactScore}`}
                    >
                      {row.impactScore}
                    </span>
                  </Tooltip>
                </Td>

                {/* Plan synopsis */}
                <Td dataLabel="Plan synopsis">
                  <code
                    style={{
                      fontSize: 'var(--pf-t--global--font--size--body--sm)',
                      color: 'var(--pf-t--global--text--color--default)',
                    }}
                  >
                    {row.planSynopsis}
                  </code>
                </Td>

                {/* Trigger sources */}
                <Td dataLabel="Trigger source">
                  <Flex gap={{ default: 'gapXs' }} flexWrap={{ default: 'wrap' }}>
                    {row.triggerSources.map((ts) => (
                      <FlexItem key={ts}>
                        <Label isCompact color="blue" variant="outline">
                          {ts}
                        </Label>
                      </FlexItem>
                    ))}
                  </Flex>
                </Td>

                {/* Target cluster */}
                <Td dataLabel="Target cluster">
                  <span style={{ fontFamily: 'monospace', fontSize: '0.85em' }}>
                    {row.targetCluster}
                  </span>
                </Td>

                {/* Environment type */}
                <Td dataLabel="Environment">
                  <Label isCompact color={ENV_LABEL_COLOR[row.environmentType]}>
                    {row.environmentType}
                  </Label>
                </Td>

                {/* Status phase */}
                <Td dataLabel="Status phase">
                  <Label isCompact color={STATUS_LABEL_COLOR[row.statusPhase]}>
                    {row.statusPhase}
                  </Label>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>

      {/* ── Bottom pagination ─────────────────────────────────────────────── */}
      <Pagination
        itemCount={filteredRows.length}
        perPage={perPage}
        page={page}
        onSetPage={(_e, p) => setPage(p)}
        onPerPageSelect={(_e, pp) => { setPerPage(pp); setPage(1); }}
        variant={PaginationVariant.bottom}
        aria-label="Active plans table bottom pagination"
        style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}
      />
    </section>
  );
};

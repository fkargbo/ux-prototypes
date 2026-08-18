import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Badge,
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  InputGroup,
  InputGroupItem,
  Label,
  LabelGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  TextInput,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import type { PlanRow } from './PlansAndApprovalsTab';

export type PlansSearchCategory = 'name' | 'label';

export const AGENTIC_STATUS_FILTER_OPTIONS: { label: string; value: PlanRow['status'] }[] = [
  { label: 'Pending',           value: 'Pending' },
  { label: 'Analyzing',         value: 'Analyzing' },
  { label: 'Proposed',          value: 'Proposed' },
  { label: 'Executing',         value: 'Executing' },
  { label: 'Verifying',         value: 'Verifying' },
  { label: 'Completed',         value: 'Completed' },
  { label: 'Failed',            value: 'Failed' },
  { label: 'Denied',            value: 'Denied' },
  { label: 'Escalating',        value: 'Escalating' },
  { label: 'Escalated',         value: 'Escalated' },
  { label: 'Emergency stopped', value: 'EmergencyStopped' },
];

export const TROUBLESHOOTING_STATUS_FILTER_OPTIONS: { label: string; value: PlanRow['status'] }[] = [
  { label: 'Analyzing',         value: 'Analyzing' },
  { label: 'Proposed',          value: 'Proposed' },
  { label: 'Executing',         value: 'Executing' },
  { label: 'Verifying',         value: 'Verifying' },
  { label: 'Completed',         value: 'Completed' },
  { label: 'Escalated',         value: 'Escalated' },
  { label: 'Emergency stopped', value: 'EmergencyStopped' },
];

export const TRIGGER_DOMAIN_FILTER_OPTIONS = [
  'Observability',
  'Cluster update',
  'Security',
  'GitOps',
] as const;

/** Granular telemetry-stack domains used by the Troubleshooting Plans view. */
export const OBSERVABILITY_TRIGGER_DOMAIN_OPTIONS = [
  'Prometheus',
  'Alertmanager',
  'Thanos',
  'OpenTelemetry',
  'Perses',
] as const;

const OBSERVABILITY_TELEMETRY_DOMAIN_SET = new Set<string>(OBSERVABILITY_TRIGGER_DOMAIN_OPTIONS);

/**
 * Maps a granular telemetry-stack domain to its macro category.
 * Used by the fleet Agentic Plans view to coalesce Prometheus/Thanos/etc. into "Observability".
 * The Troubleshooting Plans view bypasses this by passing the raw domain.
 */
export function resolveDisplayDomain(domain: string): string {
  return OBSERVABILITY_TELEMETRY_DOMAIN_SET.has(domain) ? 'Observability' : domain;
}

const FILTER_SECTION_TITLE_STYLE: React.CSSProperties = {
  padding: 'var(--pf-t--global--spacer--sm) var(--pf-t--global--spacer--md) var(--pf-t--global--spacer--xs)',
  fontSize: 'var(--pf-t--global--font--size--body--sm)',
  fontWeight: 600,
  color: 'var(--pf-t--global--text--color--subtle)',
};

function planMatchesTextSearch(plan: PlanRow, query: string, category: PlansSearchCategory): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  if (category === 'name') {
    return (plan.name ?? plan.id).toLowerCase().includes(q);
  }
  return plan.triggerDomain.toLowerCase().includes(q);
}

function planMatchesAttributeFilters(
  plan: PlanRow,
  statusFilters: PlanRow['status'][],
  triggerDomainFilters: string[],
  includeTriggerDomainFilter: boolean,
  mapObservabilityDomains: boolean,
): boolean {
  if (statusFilters.length > 0 && !statusFilters.includes(plan.status)) {
    return false;
  }
  if (includeTriggerDomainFilter && triggerDomainFilters.length > 0) {
    const effectiveDomain = mapObservabilityDomains
      ? resolveDisplayDomain(plan.triggerDomain)
      : plan.triggerDomain;
    if (!triggerDomainFilters.includes(effectiveDomain)) {
      return false;
    }
  }
  return true;
}

export function filterPlanRows(
  rows: PlanRow[],
  options: {
    statusFilters: PlanRow['status'][];
    triggerDomainFilters: string[];
    includeTriggerDomainFilter: boolean;
    mapObservabilityDomains: boolean;
    searchCategory: PlansSearchCategory;
    searchInputValue: string;
  },
): PlanRow[] {
  return rows.filter((plan) => {
    if (
      !planMatchesAttributeFilters(
        plan,
        options.statusFilters,
        options.triggerDomainFilters,
        options.includeTriggerDomainFilter,
        options.mapObservabilityDomains,
      )
    ) {
      return false;
    }
    return planMatchesTextSearch(plan, options.searchInputValue, options.searchCategory);
  });
}

export interface UsePlansFilterStateOptions {
  includeTriggerDomainFilter?: boolean;
  /** When true, granular observability telemetry domains (Prometheus, Thanos, etc.)
   *  are coalesced to "Observability" for filtering. Use in fleet/Agentic Plans view. */
  mapObservabilityDomains?: boolean;
}

export function usePlansFilterState(options: UsePlansFilterStateOptions = {}) {
  const includeTriggerDomainFilter = options.includeTriggerDomainFilter ?? false;
  const mapObservabilityDomains = options.mapObservabilityDomains ?? false;

  const [statusFilters, setStatusFilters] = useState<PlanRow['status'][]>([]);
  const [triggerDomainFilters, setTriggerDomainFilters] = useState<string[]>([]);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState<PlansSearchCategory>('name');
  const [searchCategoryOpen, setSearchCategoryOpen] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState('');

  const toggleFilterValue = useCallback(<T extends string>(value: T, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    setter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  }, []);

  const clearAllFilters = useCallback(() => {
    setStatusFilters([]);
    setTriggerDomainFilters([]);
    setSearchInputValue('');
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = statusFilters.length;
    if (includeTriggerDomainFilter) {
      count += triggerDomainFilters.length;
    }
    return count;
  }, [includeTriggerDomainFilter, statusFilters.length, triggerDomainFilters.length]);

  const hasActiveAttributeFilters = activeFilterCount > 0;
  const hasActiveTextSearch = searchInputValue.trim().length > 0;
  const hasActiveFilters = hasActiveAttributeFilters || hasActiveTextSearch;

  const filterRows = useCallback(
    (rows: PlanRow[]) =>
      filterPlanRows(rows, {
        statusFilters,
        triggerDomainFilters,
        includeTriggerDomainFilter,
        mapObservabilityDomains,
        searchCategory,
        searchInputValue,
      }),
    [
      includeTriggerDomainFilter,
      mapObservabilityDomains,
      searchCategory,
      searchInputValue,
      statusFilters,
      triggerDomainFilters,
    ],
  );

  return {
    statusFilters,
    setStatusFilters,
    triggerDomainFilters,
    setTriggerDomainFilters,
    filterMenuOpen,
    setFilterMenuOpen,
    searchCategory,
    setSearchCategory,
    searchCategoryOpen,
    setSearchCategoryOpen,
    searchInputValue,
    setSearchInputValue,
    toggleFilterValue,
    clearAllFilters,
    activeFilterCount,
    hasActiveFilters,
    filterRows,
  };
}

export interface PlansFilterToolbarProps {
  filterAriaLabel: string;
  statusOptions: { label: string; value: PlanRow['status'] }[];
  includeTriggerDomainFilter?: boolean;
  /** Override the default trigger-domain option list. Defaults to TRIGGER_DOMAIN_FILTER_OPTIONS. */
  triggerDomainOptions?: readonly string[];
  /** Full unfiltered row set — used to compute per-option counts in the filter dropdowns. */
  rows?: PlanRow[];
  pagination?: React.ReactNode;
  statusFilters: PlanRow['status'][];
  triggerDomainFilters: string[];
  filterMenuOpen: boolean;
  setFilterMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  searchCategory: PlansSearchCategory;
  setSearchCategory: React.Dispatch<React.SetStateAction<PlansSearchCategory>>;
  searchCategoryOpen: boolean;
  setSearchCategoryOpen: React.Dispatch<React.SetStateAction<boolean>>;
  searchInputValue: string;
  setSearchInputValue: React.Dispatch<React.SetStateAction<string>>;
  toggleFilterValue: <T extends string>(value: T, setter: React.Dispatch<React.SetStateAction<T[]>>) => void;
  clearAllFilters: () => void;
  activeFilterCount: number;
  hasActiveFilters: boolean;
  setStatusFilters: React.Dispatch<React.SetStateAction<PlanRow['status'][]>>;
  setTriggerDomainFilters: React.Dispatch<React.SetStateAction<string[]>>;
}

export const PlansFilterToolbar: React.FC<PlansFilterToolbarProps> = ({
  filterAriaLabel,
  statusOptions,
  includeTriggerDomainFilter = false,
  triggerDomainOptions = TRIGGER_DOMAIN_FILTER_OPTIONS,
  pagination,
  rows = [],
  statusFilters,
  triggerDomainFilters,
  filterMenuOpen,
  setFilterMenuOpen,
  searchCategory,
  setSearchCategory,
  searchCategoryOpen,
  setSearchCategoryOpen,
  searchInputValue,
  setSearchInputValue,
  toggleFilterValue,
  clearAllFilters,
  activeFilterCount,
  hasActiveFilters,
  setStatusFilters,
  setTriggerDomainFilters,
}) => {
  /** Count of runs per status across the full unfiltered dataset. */
  const countsByStatus = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    for (const row of rows) {
      counts[row.status] = (counts[row.status] ?? 0) + 1;
    }
    return counts;
  }, [rows]);

  /** Count of runs per trigger domain (after macro-category mapping) across the full dataset. */
  const countsByDomain = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    for (const row of rows) {
      const domain = resolveDisplayDomain(row.triggerDomain);
      counts[domain] = (counts[domain] ?? 0) + 1;
    }
    return counts;
  }, [rows]);

  const handleFilterSelect = useCallback(
    (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
      if (typeof value !== 'string') {
        return;
      }
      if (statusOptions.some((opt) => opt.value === value)) {
        toggleFilterValue(value as PlanRow['status'], setStatusFilters);
        return;
      }
      if (includeTriggerDomainFilter && (triggerDomainOptions as readonly string[]).includes(value)) {
        toggleFilterValue(value, setTriggerDomainFilters);
      }
    },
    [
      includeTriggerDomainFilter,
      triggerDomainOptions,
      setStatusFilters,
      setTriggerDomainFilters,
      statusOptions,
      toggleFilterValue,
    ],
  );

  const statusFilterLabel = (value: PlanRow['status']) =>
    statusOptions.find((opt) => opt.value === value)?.label ?? value;

  /** "/" keyboard shortcut — focuses the search field, mirroring the console's global search convention. */
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const showSearchShortcutHint = !isSearchFocused && searchInputValue.length === 0;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      const isTypingElsewhere =
        target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;
      if (isTypingElsewhere) {
        return;
      }
      event.preventDefault();
      searchInputRef.current?.focus();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
        flexWrap={{ default: 'nowrap' }}
        className="ols-ai-hub-plans-toolbar"
      >
        <FlexItem style={{ minWidth: 0 }}>
          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} flexWrap={{ default: 'nowrap' }}>
            <FlexItem>
              <Select
                aria-label={filterAriaLabel}
                role="menu"
                isOpen={filterMenuOpen}
                onSelect={handleFilterSelect}
                onOpenChange={setFilterMenuOpen}
                toggle={(ref: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={ref}
                    onClick={() => setFilterMenuOpen((open) => !open)}
                    isExpanded={filterMenuOpen}
                    icon={<FilterIcon />}
                    badge={activeFilterCount > 0 ? activeFilterCount : undefined}
                  >
                    Filter
                  </MenuToggle>
                )}
              >
                <SelectList className="ols-ai-hub-plans-filter-select-list">
                  <div style={FILTER_SECTION_TITLE_STYLE}>Status</div>
                  {statusOptions.map((opt) => {
                    const count = countsByStatus[opt.value] ?? 0;
                    return (
                      <SelectOption
                        key={opt.value}
                        hasCheckbox
                        value={opt.value}
                        isSelected={statusFilters.includes(opt.value)}
                      >
                        <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                          <span>{opt.label}</span>
                          {count > 0 && <Badge isRead>{count}</Badge>}
                        </span>
                      </SelectOption>
                    );
                  })}

                  {includeTriggerDomainFilter && (
                    <>
                      <div style={FILTER_SECTION_TITLE_STYLE}>Trigger Domain</div>
                      {triggerDomainOptions.map((domain) => {
                        const count = countsByDomain[domain] ?? 0;
                        return (
                          <SelectOption
                            key={domain}
                            hasCheckbox
                            value={domain}
                            isSelected={triggerDomainFilters.includes(domain)}
                          >
                            <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                              <span>{domain}</span>
                              {count > 0 && <Badge isRead>{count}</Badge>}
                            </span>
                          </SelectOption>
                        );
                      })}
                    </>
                  )}
                </SelectList>
              </Select>
            </FlexItem>

            <FlexItem style={{ minWidth: 0 }}>
              <InputGroup>
                <InputGroupItem>
                  <Dropdown
                    isOpen={searchCategoryOpen}
                    onOpenChange={setSearchCategoryOpen}
                    toggle={(ref: React.Ref<MenuToggleElement>) => (
                      <MenuToggle
                        ref={ref}
                        onClick={() => setSearchCategoryOpen((open) => !open)}
                        isExpanded={searchCategoryOpen}
                        style={{ minWidth: 0 }}
                      >
                        {searchCategory === 'name' ? 'Name' : 'Label'}
                      </MenuToggle>
                    )}
                  >
                    <DropdownList>
                      <DropdownItem
                        key="name"
                        onClick={() => {
                          setSearchCategory('name');
                          setSearchInputValue('');
                          setSearchCategoryOpen(false);
                        }}
                      >
                        Name
                      </DropdownItem>
                      <DropdownItem
                        key="label"
                        onClick={() => {
                          setSearchCategory('label');
                          setSearchInputValue('');
                          setSearchCategoryOpen(false);
                        }}
                      >
                        Label
                      </DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </InputGroupItem>

                <InputGroupItem isFill>
                  <div style={{ position: 'relative', minWidth: 220 }}>
                    <TextInput
                      ref={searchInputRef}
                      aria-label={searchCategory === 'name' ? 'Search plans by name' : 'Search plans by label'}
                      placeholder={searchCategory === 'name' ? 'Search by name...' : 'Search by label...'}
                      value={searchInputValue}
                      onChange={(_evt, value) => setSearchInputValue(value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      style={{ width: '100%', ...(showSearchShortcutHint ? { paddingInlineEnd: '28px' } : null) }}
                    />
                    {showSearchShortcutHint && (
                      <kbd
                        aria-hidden="true"
                        className="ols-ai-hub-search-shortcut-hint"
                        style={{
                          position: 'absolute',
                          insetInlineEnd: '6px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '16px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--pf-t--global--font--family--mono)',
                          fontSize: 'var(--pf-t--global--font--size--body--sm)',
                          color: 'var(--pf-t--global--text--color--subtle)',
                          border: '1px solid var(--pf-t--global--border--color--default)',
                          borderRadius: 'var(--pf-t--global--border--radius--small)',
                          lineHeight: 1,
                          boxSizing: 'border-box',
                          pointerEvents: 'none',
                          backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
                        }}
                      >
                        /
                      </kbd>
                    )}
                  </div>
                </InputGroupItem>
              </InputGroup>
            </FlexItem>
          </Flex>
        </FlexItem>

        {pagination && <FlexItem>{pagination}</FlexItem>}
      </Flex>

      {hasActiveFilters && (
        <div className="ols-ai-hub-plans-filter-chips ols-ai-hub-plans-filter-chips--active" style={{ marginTop: '12px' }}>
          {statusFilters.length > 0 && (
            <LabelGroup categoryName="Status" isClosable onClick={() => setStatusFilters([])}>
              {statusFilters.map((status) => (
                <Label key={status} isCompact onClose={() => toggleFilterValue(status, setStatusFilters)}>
                  {statusFilterLabel(status)}
                </Label>
              ))}
            </LabelGroup>
          )}
          {includeTriggerDomainFilter && triggerDomainFilters.length > 0 && (
            <LabelGroup categoryName="Trigger Domain" isClosable onClick={() => setTriggerDomainFilters([])}>
              {triggerDomainFilters.map((domain) => (
                <Label key={domain} isCompact onClose={() => toggleFilterValue(domain, setTriggerDomainFilters)}>
                  {domain}
                </Label>
              ))}
            </LabelGroup>
          )}
          <Button variant="link" isInline onClick={clearAllFilters} style={{ fontSize: 'var(--pf-t--global--font--size--sm)' }}>
            Clear all
          </Button>
        </div>
      )}
    </>
  );
};

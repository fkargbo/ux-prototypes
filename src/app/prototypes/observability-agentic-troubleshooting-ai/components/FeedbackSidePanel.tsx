/**
 * FeedbackSidePanel — Post 5.0 prototype only
 *
 * A collapsible right-side panel that surfaces all exp-lab feedback pins for this
 * prototype page. Subscribes to the `exp-lab:pins-updated` window event published
 * by the exp-lab bridge, so it stays in sync without needing Supabase credentials.
 *
 * Resolved state is stored locally in localStorage under a per-page key.
 * "Unread" is derived from the exp-lab's own `exp-lab-read:v1:*` localStorage entries.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Badge,
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  Label,
  MenuToggle,
  SearchInput,
  Tooltip,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  CommentIcon,
  FilterIcon,
  SortAmountDownIcon,
  TimesCircleIcon,
  AngleDoubleRightIcon,
  AngleDoubleLeftIcon,
} from '@patternfly/react-icons';

// ── Types ─────────────────────────────────────────────────────────────────────

type ThreadEntry = {
  id: string;
  body: string;
  author_name: string | null;
  author_github_id: string | null;
  author_avatar_url: string | null;
  created_at: string;
};

type FeedbackPin = {
  id: string;
  comment_text: string;
  comment_entries?: ThreadEntry[] | null;
  author_name: string | null;
  author_github_id: string | null;
  author_avatar_url: string | null;
  created_at: string;
  page_scope?: string | null;
  project_id: string;
};

type SortKey = 'newest' | 'oldest' | 'unread-first';

// ── Storage helpers ───────────────────────────────────────────────────────────

const RESOLVED_PREFIX = 'exp-lab-resolved:v1:';

function currentProjectId(): string {
  const { hostname, pathname, search, hash } = window.location;
  const p = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  return `${hostname}${p}${search}${hash}`;
}

function loadResolvedIds(projectId: string): Set<string> {
  try {
    const raw = localStorage.getItem(`${RESOLVED_PREFIX}${encodeURIComponent(projectId)}`);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === 'string'));
  } catch {
    return new Set();
  }
}

function saveResolvedIds(projectId: string, ids: Set<string>): void {
  try {
    localStorage.setItem(
      `${RESOLVED_PREFIX}${encodeURIComponent(projectId)}`,
      JSON.stringify([...ids]),
    );
  } catch {
    /* ignore */
  }
}

/** Collect all pin IDs that have been marked as read across every page scope. */
function loadAllReadIds(): Set<string> {
  const result = new Set<string>();
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith('exp-lab-read:v1:')) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const id of parsed) {
          if (typeof id === 'string') result.add(id);
        }
      }
    }
  } catch {
    /* ignore */
  }
  return result;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getThreadEntries(pin: FeedbackPin): ThreadEntry[] {
  if (Array.isArray(pin.comment_entries) && pin.comment_entries.length > 0) {
    return [...pin.comment_entries].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  }
  if (pin.comment_text?.trim()) {
    return [
      {
        id: `legacy-${pin.id}`,
        body: pin.comment_text,
        author_name: pin.author_name,
        author_github_id: pin.author_github_id,
        author_avatar_url: pin.author_avatar_url,
        created_at: pin.created_at,
      },
    ];
  }
  return [];
}

function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function initials(name: string | null): string {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');
}

function labelForPageScope(scope: string | null | undefined): string {
  if (!scope) return 'Unknown page';
  try {
    const u = new URL(scope, 'http://x');
    const parts = u.pathname.replace(/^\/ux-prototypes/, '').split('/').filter(Boolean);
    if (parts.length === 0) return '/';
    return '/' + parts.slice(-2).join('/');
  } catch {
    return scope;
  }
}

// ── Sub-components ─────────────────────────────────────────────────────────────

interface PinCardProps {
  pin: FeedbackPin;
  isResolved: boolean;
  isUnread: boolean;
  onToggleResolved: (id: string) => void;
}

const PinCard: React.FC<PinCardProps> = ({ pin, isResolved, isUnread, onToggleResolved }) => {
  const entries = useMemo(() => getThreadEntries(pin), [pin]);
  const firstEntry = entries[0];
  const extraCount = entries.length - 1;

  return (
    <div
      style={{
        padding: '12px 14px',
        borderBottom: '1px solid var(--pf-t--global--border--color--default)',
        backgroundColor: isResolved
          ? 'var(--pf-t--global--background--color--secondary--default)'
          : 'var(--pf-t--global--background--color--primary--default)',
        opacity: isResolved ? 0.7 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        {/* Avatar */}
        <div
          aria-hidden
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: pin.author_github_id
              ? 'var(--pf-t--global--color--brand--default)'
              : 'var(--pf-t--global--color--nonstatus--gray--default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--pf-t--global--text--color--on-brand--default)',
            flexShrink: 0,
            backgroundImage: pin.author_avatar_url ? `url(${pin.author_avatar_url})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {!pin.author_avatar_url && initials(pin.author_name)}
        </div>

        {/* Author + date */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              fontWeight: 600,
              fontSize: '0.8125rem',
              color: 'var(--pf-t--global--text--color--regular)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block',
            }}
          >
            {pin.author_name ?? 'Anonymous'}
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--pf-t--global--text--color--subtle)',
            }}
          >
            {formatRelativeDate(pin.created_at)}
          </span>
        </div>

        {/* Unread badge */}
        {isUnread && !isResolved && (
          <Badge
            style={{
              backgroundColor: 'var(--pf-t--global--color--brand--default)',
              fontSize: '0.7rem',
            }}
          >
            New
          </Badge>
        )}

        {/* Resolved label */}
        {isResolved && (
          <Label color="green" isCompact>
            Resolved
          </Label>
        )}
      </div>

      {/* Page scope chip */}
      <div style={{ marginBottom: '6px' }}>
        <span
          style={{
            fontSize: '0.7rem',
            color: 'var(--pf-t--global--text--color--subtle)',
            backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
            padding: '1px 6px',
            borderRadius: 3,
            fontFamily: 'var(--pf-t--global--font--family--mono)',
          }}
        >
          {labelForPageScope(pin.page_scope)}
        </span>
      </div>

      {/* First message body */}
      {firstEntry && (
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--pf-t--global--text--color--regular)',
            margin: '0 0 6px 0',
            lineHeight: 1.45,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textDecoration: isResolved ? 'line-through' : 'none',
          }}
        >
          {firstEntry.body}
        </p>
      )}

      {/* Thread count + actions row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {extraCount > 0 ? (
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--pf-t--global--text--color--subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <CommentIcon style={{ fontSize: '0.75rem' }} />
            {extraCount} {extraCount === 1 ? 'reply' : 'replies'}
          </span>
        ) : (
          <span />
        )}

        <Tooltip
          content={isResolved ? 'Mark as unresolved' : 'Mark as resolved'}
          position="left"
        >
          <Button
            variant="plain"
            size="sm"
            aria-label={isResolved ? 'Mark as unresolved' : 'Mark as resolved'}
            onClick={() => onToggleResolved(pin.id)}
            style={{
              padding: '2px 4px',
              color: isResolved
                ? 'var(--pf-t--global--icon--color--status--success--default)'
                : 'var(--pf-t--global--text--color--subtle)',
            }}
          >
            {isResolved ? (
              <>
                <TimesCircleIcon style={{ marginRight: 4 }} />
                Unresolved
              </>
            ) : (
              <>
                <CheckCircleIcon style={{ marginRight: 4 }} />
                Resolve
              </>
            )}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

// ── Main panel ─────────────────────────────────────────────────────────────────

export const FeedbackSidePanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [pins, setPins] = useState<FeedbackPin[]>([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const projectIdRef = useRef('');
  const panelRef = useRef<HTMLDivElement>(null);

  // Initialise from window bridge (if exp-lab already ran) + localStorage
  useEffect(() => {
    const pid = currentProjectId();
    projectIdRef.current = pid;
    setResolvedIds(loadResolvedIds(pid));
    setReadIds(loadAllReadIds());

    type Bridge = { pins?: FeedbackPin[]; projectId?: string };
    const bridge = (window as unknown as { __expLabBridge?: Bridge }).__expLabBridge;
    if (bridge?.pins) {
      setPins(bridge.pins);
    }
  }, []);

  // Subscribe to live updates from exp-lab
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ pins: FeedbackPin[]; projectId: string }>).detail;
      if (detail?.pins) {
        setPins(detail.pins);
        setReadIds(loadAllReadIds());
        projectIdRef.current = detail.projectId ?? currentProjectId();
        // Reload resolved state if the page scope changed
        setResolvedIds(loadResolvedIds(projectIdRef.current));
      }
    };
    window.addEventListener('exp-lab:pins-updated', handler);
    return () => window.removeEventListener('exp-lab:pins-updated', handler);
  }, []);

  // Close on Escape when panel is open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const toggleResolved = useCallback((pinId: string) => {
    setResolvedIds((prev) => {
      const next = new Set(prev);
      if (next.has(pinId)) {
        next.delete(pinId);
      } else {
        next.add(pinId);
      }
      saveResolvedIds(projectIdRef.current, next);
      return next;
    });
  }, []);

  // Filter by search term
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return pins;
    return pins.filter((pin) => {
      const inText = pin.comment_text?.toLowerCase().includes(term);
      const inAuthor = pin.author_name?.toLowerCase().includes(term);
      const inEntries = getThreadEntries(pin).some((e) =>
        e.body?.toLowerCase().includes(term),
      );
      return inText || inAuthor || inEntries;
    });
  }, [pins, search]);

  // Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortKey === 'unread-first') {
        const aUnread = readIds.has(a.id) ? 1 : 0;
        const bUnread = readIds.has(b.id) ? 1 : 0;
        if (aUnread !== bUnread) return aUnread - bUnread;
      }
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();
      return sortKey === 'oldest' ? aTime - bTime : bTime - aTime;
    });
  }, [filtered, sortKey, readIds]);

  const unresolvedCount = useMemo(
    () => pins.filter((p) => !resolvedIds.has(p.id)).length,
    [pins, resolvedIds],
  );

  const unreadCount = useMemo(
    () => pins.filter((p) => !readIds.has(p.id)).length,
    [pins, readIds],
  );

  const SORT_LABELS: Record<SortKey, string> = {
    newest: 'Newest first',
    oldest: 'Oldest first',
    'unread-first': 'Unread first',
  };

  return (
    <>
      {/* Toggle handle — always visible on the right edge */}
      <div
        style={{
          position: 'fixed',
          right: isOpen ? 380 : 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1200,
          transition: 'right 0.25s ease',
        }}
      >
        <Tooltip content={isOpen ? 'Collapse feedback panel' : 'View all feedback'} position="left">
          <button
            aria-label={isOpen ? 'Collapse feedback panel' : 'Expand feedback panel'}
            onClick={() => setIsOpen((o) => !o)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              width: 32,
              padding: '12px 0',
              border: 'none',
              borderRadius: '6px 0 0 6px',
              backgroundColor: 'var(--pf-t--global--color--brand--default)',
              color: 'var(--pf-t--global--text--color--on-brand--default)',
              cursor: 'pointer',
              boxShadow: '-2px 2px 8px rgba(0,0,0,0.25)',
              writingMode: 'vertical-rl',
              fontFamily: 'var(--pf-t--global--font--family--body)',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.03em',
            }}
          >
            {isOpen ? (
              <AngleDoubleRightIcon style={{ writingMode: 'horizontal-tb', marginBottom: 4 }} />
            ) : (
              <AngleDoubleLeftIcon style={{ writingMode: 'horizontal-tb', marginBottom: 4 }} />
            )}
            <span>Feedback</span>
            {!isOpen && unresolvedCount > 0 && (
              <Badge
                style={{
                  writingMode: 'horizontal-tb',
                  backgroundColor: 'var(--pf-t--global--color--status--danger--default)',
                  color: '#fff',
                  minWidth: 18,
                  height: 18,
                  fontSize: '0.6875rem',
                  padding: '0 4px',
                  borderRadius: 9,
                }}
              >
                {unresolvedCount}
              </Badge>
            )}
          </button>
        </Tooltip>
      </div>

      {/* Panel drawer */}
      <div
        ref={panelRef}
        aria-label="Feedback panel"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 380,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s ease',
          zIndex: 1199,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.18)',
          borderLeft: '1px solid var(--pf-t--global--border--color--default)',
        }}
      >
        {/* Panel header */}
        <div
          style={{
            padding: '14px 16px 12px',
            borderBottom: '1px solid var(--pf-t--global--border--color--default)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexShrink: 0,
          }}
        >
          <CommentIcon
            style={{ color: 'var(--pf-t--global--color--brand--default)', fontSize: '1.1rem' }}
          />
          <span
            style={{
              fontWeight: 700,
              fontSize: '0.9375rem',
              color: 'var(--pf-t--global--text--color--heading)',
              flex: 1,
            }}
          >
            Feedback
          </span>
          {unresolvedCount > 0 && (
            <Tooltip content={`${unresolvedCount} unresolved`} position="bottom">
              <Badge
                style={{
                  backgroundColor: 'var(--pf-t--global--color--status--danger--default)',
                  color: '#fff',
                  fontSize: '0.75rem',
                }}
              >
                {unresolvedCount} open
              </Badge>
            </Tooltip>
          )}
          {unreadCount > 0 && (
            <Label color="blue" isCompact>
              {unreadCount} unread
            </Label>
          )}
          <Button
            variant="plain"
            aria-label="Close feedback panel"
            onClick={() => setIsOpen(false)}
            style={{ padding: 4, marginLeft: 2 }}
          >
            <TimesCircleIcon />
          </Button>
        </div>

        {/* Search + Sort bar */}
        <div
          style={{
            padding: '10px 14px',
            display: 'flex',
            gap: 8,
            borderBottom: '1px solid var(--pf-t--global--border--color--default)',
            flexShrink: 0,
          }}
        >
          <SearchInput
            aria-label="Search feedback"
            placeholder="Search feedback…"
            value={search}
            onChange={(_e, val) => setSearch(val)}
            onClear={() => setSearch('')}
            style={{ flex: 1, minWidth: 0 }}
          />
          <Dropdown
            isOpen={isSortOpen}
            onOpenChange={setIsSortOpen}
            toggle={(ref) => (
              <MenuToggle
                ref={ref}
                aria-label="Sort feedback"
                onClick={() => setIsSortOpen((o) => !o)}
                isExpanded={isSortOpen}
                variant="plain"
                style={{ padding: '0 6px' }}
              >
                <Tooltip content="Sort" position="bottom">
                  <SortAmountDownIcon />
                </Tooltip>
              </MenuToggle>
            )}
          >
            <DropdownList>
              {(['newest', 'oldest', 'unread-first'] as SortKey[]).map((key) => (
                <DropdownItem
                  key={key}
                  isSelected={sortKey === key}
                  onClick={() => {
                    setSortKey(key);
                    setIsSortOpen(false);
                  }}
                >
                  {SORT_LABELS[key]}
                </DropdownItem>
              ))}
            </DropdownList>
          </Dropdown>
        </div>

        {/* Active sort indicator */}
        {sortKey !== 'newest' && (
          <div
            style={{
              padding: '4px 14px',
              fontSize: '0.75rem',
              color: 'var(--pf-t--global--text--color--subtle)',
              backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexShrink: 0,
            }}
          >
            <FilterIcon style={{ fontSize: '0.7rem' }} />
            Sorted by: <strong>{SORT_LABELS[sortKey]}</strong>
            <Button
              variant="plain"
              isInline
              onClick={() => setSortKey('newest')}
              style={{ fontSize: '0.75rem', padding: 0, marginLeft: 'auto' }}
            >
              Reset
            </Button>
          </div>
        )}

        {/* Count summary */}
        <div
          style={{
            padding: '6px 14px',
            fontSize: '0.75rem',
            color: 'var(--pf-t--global--text--color--subtle)',
            flexShrink: 0,
          }}
        >
          {sorted.length === 0
            ? search
              ? 'No results'
              : 'No feedback yet'
            : `${sorted.length} item${sorted.length !== 1 ? 's' : ''}${search ? ' matching' : ''}`}
        </div>

        <Divider style={{ flexShrink: 0 }} />

        {/* Scrollable pin list */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {sorted.length === 0 && !search && (
            <div
              style={{
                padding: 32,
                textAlign: 'center',
                color: 'var(--pf-t--global--text--color--subtle)',
              }}
            >
              <CommentIcon
                style={{
                  fontSize: '2rem',
                  opacity: 0.3,
                  display: 'block',
                  margin: '0 auto 10px',
                }}
              />
              <p style={{ fontSize: '0.875rem', margin: 0 }}>
                No feedback pins on this page yet.
              </p>
              <p style={{ fontSize: '0.8125rem', margin: '6px 0 0', opacity: 0.7 }}>
                Press <kbd>C</kbd> to enter comment mode.
              </p>
            </div>
          )}

          {sorted.map((pin) => (
            <PinCard
              key={pin.id}
              pin={pin}
              isResolved={resolvedIds.has(pin.id)}
              isUnread={!readIds.has(pin.id)}
              onToggleResolved={toggleResolved}
            />
          ))}
        </div>

        {/* Footer */}
        {pins.length > 0 && (
          <div
            style={{
              padding: '8px 14px',
              borderTop: '1px solid var(--pf-t--global--border--color--default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
              {resolvedIds.size} resolved · {unresolvedCount} open
            </span>
            {resolvedIds.size > 0 && (
              <Button
                variant="link"
                isInline
                onClick={() => {
                  setResolvedIds(new Set());
                  saveResolvedIds(projectIdRef.current, new Set());
                }}
                style={{ fontSize: '0.75rem' }}
              >
                Clear resolved
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Click-outside scrim (only visible when open on narrow viewports) */}
      {isOpen && (
        <div
          aria-hidden
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1198,
            background: 'transparent',
          }}
        />
      )}
    </>
  );
};

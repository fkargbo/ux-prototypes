/**
 * FeedbackSidePanel — Post 5.0 prototype only
 *
 * A collapsible right-side panel that surfaces all exp-lab feedback pins.
 * Subscribes to the `exp-lab:pins-updated` window event published by the
 * exp-lab bridge so it stays in sync without needing Supabase credentials.
 *
 * Design note: Explicit hex colors are used throughout so the panel is always
 * readable in light mode, independent of the prototype's dark/glass theme.
 *
 * Resolved state is stored locally in localStorage under a per-page key.
 * "Unread" is derived from exp-lab's own `exp-lab-read:v1:*` localStorage entries.
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
  Label,
  MenuToggle,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  Tooltip,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  CommentIcon,
  FilterIcon,
  SortAmountDownAltIcon,
  TimesCircleIcon,
  TimesIcon,
  CaretRightIcon,
  CaretLeftIcon,
} from '@patternfly/react-icons';

// ── Design tokens (always light — panel is theme-independent) ─────────────────
const T = {
  bg: '#ffffff',
  bgSecondary: '#f5f5f5',
  border: '#d2d2d2',
  brand: '#0066cc',
  brandText: '#ffffff',
  text: '#151515',
  textSubtle: '#6a6e73',
  success: '#3e8635',
  danger: '#c9190b',
  shadow: 'rgba(0,0,0,0.18)',
  handleBg: '#0066cc',
};

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

/** Combine all per-page read-state entries to build a global read set. */
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

// ── PinCard ───────────────────────────────────────────────────────────────────

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
        borderBottom: `1px solid ${T.border}`,
        backgroundColor: isResolved ? T.bgSecondary : T.bg,
        opacity: isResolved ? 0.72 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      {/* Author row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        {/* Avatar */}
        <div
          aria-hidden
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: pin.author_github_id ? T.brand : '#8a8d90',
            backgroundImage: pin.author_avatar_url
              ? `url(${pin.author_avatar_url})`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 600,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          {!pin.author_avatar_url && initials(pin.author_name)}
        </div>

        {/* Name + date */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: '0.8125rem',
              color: T.text,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {pin.author_name ?? 'Anonymous'}
          </div>
          <div style={{ fontSize: '0.75rem', color: T.textSubtle }}>
            {formatRelativeDate(pin.created_at)}
          </div>
        </div>

        {/* Status badges */}
        {isUnread && !isResolved && (
          <Badge
            style={{
              backgroundColor: T.brand,
              color: T.brandText,
              fontSize: '0.6875rem',
            }}
          >
            New
          </Badge>
        )}
        {isResolved && (
          <Label color="green" isCompact>
            Resolved
          </Label>
        )}
      </div>

      {/* Page scope tag */}
      <div style={{ marginBottom: 6 }}>
        <span
          style={{
            fontSize: '0.7rem',
            color: T.textSubtle,
            backgroundColor: T.bgSecondary,
            border: `1px solid ${T.border}`,
            padding: '1px 6px',
            borderRadius: 3,
            fontFamily: 'monospace',
          }}
        >
          {labelForPageScope(pin.page_scope)}
        </span>
      </div>

      {/* Comment body (first message) */}
      {firstEntry && (
        <p
          style={{
            fontSize: '0.8125rem',
            color: T.text,
            margin: '0 0 8px 0',
            lineHeight: 1.5,
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

      {/* Thread count + resolve action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {extraCount > 0 ? (
          <span
            style={{
              fontSize: '0.75rem',
              color: T.textSubtle,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <CommentIcon style={{ fontSize: '0.7rem' }} />
            {extraCount} {extraCount === 1 ? 'reply' : 'replies'}
          </span>
        ) : (
          <span />
        )}

        <button
          title={isResolved ? 'Mark as unresolved' : 'Mark as resolved'}
          onClick={() => onToggleResolved(pin.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '0.75rem',
            padding: '3px 6px',
            borderRadius: 4,
            color: isResolved ? T.success : T.textSubtle,
            fontFamily: 'inherit',
            transition: 'background 0.1s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = T.bgSecondary;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
          }}
        >
          {isResolved ? (
            <>
              <TimesCircleIcon style={{ fontSize: '0.75rem' }} />
              Unresolved
            </>
          ) : (
            <>
              <CheckCircleIcon style={{ fontSize: '0.75rem' }} />
              Resolve
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ── FeedbackSidePanel ─────────────────────────────────────────────────────────

export const FeedbackSidePanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [pins, setPins] = useState<FeedbackPin[]>([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const projectIdRef = useRef('');

  // Bootstrap: grab anything already in the window bridge + localStorage state
  useEffect(() => {
    const pid = currentProjectId();
    projectIdRef.current = pid;
    setResolvedIds(loadResolvedIds(pid));
    setReadIds(loadAllReadIds());

    type Bridge = { pins?: FeedbackPin[]; projectId?: string };
    const bridge = (window as unknown as { __expLabBridge?: Bridge }).__expLabBridge;
    if (bridge?.pins?.length) {
      setPins(bridge.pins);
    }
  }, []);

  // Subscribe to live updates published by exp-lab
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ pins: FeedbackPin[]; projectId: string }>).detail;
      if (!detail?.pins) return;
      setPins(detail.pins);
      const pid = detail.projectId ?? currentProjectId();
      projectIdRef.current = pid;
      setResolvedIds(loadResolvedIds(pid));
      setReadIds(loadAllReadIds());
    };
    window.addEventListener('exp-lab:pins-updated', handler);
    return () => window.removeEventListener('exp-lab:pins-updated', handler);
  }, []);

  // Polling fallback: if exp-lab was already running before this component mounted
  // (or its build predates the bridge), periodically read from window.__expLabBridge
  // so the panel eventually populates without needing the event.
  useEffect(() => {
    type Bridge = { pins?: FeedbackPin[]; projectId?: string };
    const tick = () => {
      const bridge = (window as unknown as { __expLabBridge?: Bridge }).__expLabBridge;
      if (!bridge?.pins?.length) return;
      setPins((prev) => {
        if (prev.length === bridge.pins!.length) return prev;
        return bridge.pins!;
      });
      const pid = bridge.projectId ?? currentProjectId();
      projectIdRef.current = pid;
      setResolvedIds(loadResolvedIds(pid));
      setReadIds(loadAllReadIds());
    };
    const id = window.setInterval(tick, 2000);
    tick(); // also run immediately
    return () => window.clearInterval(id);
  }, []);

  // Keyboard close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const toggleResolved = useCallback((pinId: string) => {
    setResolvedIds((prev) => {
      const next = new Set(prev);
      next.has(pinId) ? next.delete(pinId) : next.add(pinId);
      saveResolvedIds(projectIdRef.current, next);
      return next;
    });
  }, []);

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

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortKey === 'unread-first') {
        const aRead = readIds.has(a.id) ? 1 : 0;
        const bRead = readIds.has(b.id) ? 1 : 0;
        if (aRead !== bRead) return aRead - bRead;
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

  const PANEL_WIDTH = 380;

  return (
    <>
      {/* ── Toggle handle — always on the right edge ── */}
      <div
        style={{
          position: 'fixed',
          right: isOpen ? PANEL_WIDTH : 0,
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
              padding: '14px 0',
              border: 'none',
              borderRadius: '6px 0 0 6px',
              backgroundColor: T.handleBg,
              color: T.brandText,
              cursor: 'pointer',
              boxShadow: `-2px 2px 8px ${T.shadow}`,
              writingMode: 'vertical-rl',
              fontFamily: 'RedHatText, RedHatTextVF, "Red Hat Text", Helvetica, Arial, sans-serif',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
            }}
          >
            {isOpen ? (
              <CaretRightIcon style={{ writingMode: 'horizontal-tb', marginBottom: 4 }} />
            ) : (
              <CaretLeftIcon style={{ writingMode: 'horizontal-tb', marginBottom: 4 }} />
            )}
            <span>Feedback</span>
            {!isOpen && unresolvedCount > 0 && (
              <span
                style={{
                  writingMode: 'horizontal-tb',
                  backgroundColor: T.danger,
                  color: '#fff',
                  minWidth: 18,
                  height: 18,
                  fontSize: '0.6875rem',
                  padding: '0 4px',
                  borderRadius: 9,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 2,
                }}
              >
                {unresolvedCount}
              </span>
            )}
          </button>
        </Tooltip>
      </div>

      {/* ── Panel ── */}
      <div
        aria-label="Feedback panel"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: PANEL_WIDTH,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s ease',
          zIndex: 1199,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: T.bg,
          boxShadow: `-4px 0 24px ${T.shadow}`,
          borderLeft: `1px solid ${T.border}`,
          /* Force light colour-scheme so system-dark users see a readable panel */
          colorScheme: 'light',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 16px 12px',
            borderBottom: `1px solid ${T.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexShrink: 0,
            backgroundColor: T.bg,
          }}
        >
          <CommentIcon style={{ color: T.brand, fontSize: '1.1rem' }} />
          <span
            style={{
              fontWeight: 700,
              fontSize: '0.9375rem',
              color: T.text,
              flex: 1,
            }}
          >
            Feedback
          </span>
          {unresolvedCount > 0 && (
            <Badge
              style={{
                backgroundColor: T.danger,
                color: '#fff',
                fontSize: '0.75rem',
              }}
            >
              {unresolvedCount} open
            </Badge>
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
            style={{ padding: 4, marginLeft: 2, color: T.textSubtle }}
          >
            <TimesIcon />
          </Button>
        </div>

        {/* Search + Sort */}
        <div
          style={{
            padding: '10px 12px',
            display: 'flex',
            gap: 8,
            borderBottom: `1px solid ${T.border}`,
            flexShrink: 0,
            backgroundColor: T.bg,
            alignItems: 'center',
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
          {/* Sort — PF6 Select appended to <body> so it never clips at the panel edge */}
          <Select
            isOpen={isSortOpen}
            onOpenChange={setIsSortOpen}
            onSelect={(_e, val) => {
              setSortKey(val as SortKey);
              setIsSortOpen(false);
            }}
            selected={sortKey}
            popperProps={{ appendTo: () => document.body, position: 'bottom-end', enableFlip: true }}
            toggle={(ref) => (
              <MenuToggle
                ref={ref}
                aria-label={`Sort: ${SORT_LABELS[sortKey]}`}
                onClick={() => setIsSortOpen((o) => !o)}
                isExpanded={isSortOpen}
                variant="plain"
                style={{ padding: '0 4px', color: T.textSubtle }}
              >
                <Tooltip content={`Sort: ${SORT_LABELS[sortKey]}`} position="top">
                  <SortAmountDownAltIcon />
                </Tooltip>
              </MenuToggle>
            )}
          >
            <SelectList>
              {(['newest', 'oldest', 'unread-first'] as SortKey[]).map((key) => (
                <SelectOption
                  key={key}
                  value={key}
                  isSelected={sortKey === key}
                >
                  {SORT_LABELS[key]}
                </SelectOption>
              ))}
            </SelectList>
          </Select>
        </div>

        {/* Active sort indicator strip */}
        {sortKey !== 'newest' && (
          <div
            style={{
              padding: '4px 12px',
              fontSize: '0.75rem',
              color: T.textSubtle,
              backgroundColor: '#eef3f9',
              borderBottom: `1px solid ${T.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexShrink: 0,
            }}
          >
            <FilterIcon style={{ fontSize: '0.7rem', color: T.brand }} />
            Sorted by: <strong style={{ color: T.text }}>{SORT_LABELS[sortKey]}</strong>
            <button
              onClick={() => setSortKey('newest')}
              style={{
                marginLeft: 'auto',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
                color: T.brand,
                padding: 0,
                fontFamily: 'inherit',
              }}
            >
              Reset
            </button>
          </div>
        )}

        {/* Result count */}
        <div
          style={{
            padding: '5px 12px',
            fontSize: '0.75rem',
            color: T.textSubtle,
            backgroundColor: T.bg,
            flexShrink: 0,
          }}
        >
          {sorted.length === 0
            ? search
              ? 'No matching feedback'
              : 'No feedback yet on this page'
            : `${sorted.length} item${sorted.length !== 1 ? 's' : ''}${search ? ' matching' : ''}`}
        </div>

        <Divider style={{ flexShrink: 0 }} />

        {/* Scrollable pin list */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', backgroundColor: T.bg }}>
          {sorted.length === 0 && !search && (
            <div
              style={{ padding: 32, textAlign: 'center', color: T.textSubtle }}
            >
              <CommentIcon
                style={{
                  fontSize: '2rem',
                  opacity: 0.3,
                  display: 'block',
                  margin: '0 auto 10px',
                  color: T.textSubtle,
                }}
              />
              <p style={{ fontSize: '0.875rem', margin: 0, color: T.text }}>
                No feedback pins on this page yet.
              </p>
              <p style={{ fontSize: '0.8125rem', margin: '6px 0 0', color: T.textSubtle }}>
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
              padding: '8px 12px',
              borderTop: `1px solid ${T.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              backgroundColor: T.bgSecondary,
            }}
          >
            <span style={{ fontSize: '0.75rem', color: T.textSubtle }}>
              {resolvedIds.size} resolved · {unresolvedCount} open
            </span>
            {resolvedIds.size > 0 && (
              <button
                onClick={() => {
                  setResolvedIds(new Set());
                  saveResolvedIds(projectIdRef.current, new Set());
                }}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  color: T.brand,
                  padding: 0,
                  fontFamily: 'inherit',
                }}
              >
                Clear resolved
              </button>
            )}
          </div>
        )}
      </div>

      {/* Scrim — closes panel on outside click */}
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

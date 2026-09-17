import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useActivePerspective } from '@app/shared/contexts/ActivePerspectiveContext';
import {
  buildPrototypeHref,
  readPerspectiveFromSearch,
  resolveActivePerspectiveKey,
} from '../prototypePerspectiveUrl';

/**
 * Keeps `?perspective=` in sync with the shell perspective switcher so share
 * links preserve page path + perspective context.
 *
 * Two-effect design
 * ─────────────────
 * Effect 1 — URL → shell
 *   Responds only to URL changes (location.search), NOT to shell changes.
 *   When the URL carries a valid `?perspective=`, drives the shell to match.
 *   This covers: shared links, browser back/forward, entry redirects.
 *
 * Effect 2 — Shell → URL
 *   Responds to shell perspective and route changes.
 *   Writes the current perspective into the URL whenever they diverge.
 *   This covers: perspective switcher clicks, sidebar nav stripping the param.
 *
 * Why Effect 1 must ignore shell-triggered re-runs
 * ─────────────────────────────────────────────────
 * When the user clicks "Core platforms" in the perspective switcher, AppLayout
 * updates activePerspective but the URL still shows `?perspective=fleet-management`.
 * If Effect 1 re-ran at that point it would see a mismatch and revert the user's
 * choice back to fleet-management.  We prevent this by tracking the last URL we
 * already processed and short-circuiting if location.search hasn't changed.
 *
 * AppLayout boot-default guard
 * ────────────────────────────
 * AppLayout initialises activePerspective to 'Fleet management' before its own
 * useEffect applies enabledPerspectives[0] ('core-platforms').  Effect 2 skips
 * writing to the URL while the shell is still in that transient boot state.
 */
export const PrototypePerspectiveUrlSync: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activePerspective, setPerspectiveByKey } = useActivePerspective();

  const activePerspectiveKey = resolveActivePerspectiveKey(activePerspective);

  /**
   * The last location.search value we already handled in Effect 1.
   * Used to skip re-runs that were triggered by shell changes, not URL changes.
   */
  const lastProcessedSearchRef = useRef<string | null>(null);

  /**
   * The perspective key that Effect 2 most recently wrote to the URL.
   * Used by Effect 1 to ignore the resulting URL echo (shell→URL→shell loop guard).
   */
  const lastWrittenByShellRef = useRef<string | null>(null);

  /**
   * True once the shell perspective is reliable (past AppLayout's 'Fleet management'
   * boot default, or confirmed by a URL param).
   */
  const perspectiveStabilisedRef = useRef(false);

  // ── Effect 1: URL → shell ──────────────────────────────────────────────────
  useEffect(() => {
    // Short-circuit when this re-run was caused by a shell change, not a URL change.
    // Without this guard, clicking "Core platforms" in the perspective switcher would
    // be immediately reverted because the URL still shows the old perspective.
    if (location.search === lastProcessedSearchRef.current) {
      return;
    }
    lastProcessedSearchRef.current = location.search;

    const urlPerspective = readPerspectiveFromSearch(new URLSearchParams(location.search));
    if (!urlPerspective) {
      return;
    }

    // This URL change was written by Effect 2 — don't echo it back to the shell.
    if (urlPerspective === lastWrittenByShellRef.current) {
      lastWrittenByShellRef.current = null;
      perspectiveStabilisedRef.current = true;
      return;
    }

    // Drive the shell to match the URL (shared link, back/forward, entry redirect).
    perspectiveStabilisedRef.current = true;
    setPerspectiveByKey(urlPerspective);
  }, [location.search, activePerspectiveKey, setPerspectiveByKey]);

  // ── Effect 2: Shell → URL ──────────────────────────────────────────────────
  useEffect(() => {
    const urlPerspective = readPerspectiveFromSearch(new URLSearchParams(location.search));

    // Skip while AppLayout is still in its 'Fleet management' boot default and
    // no URL param is present.  Wait for enabledPerspectives[0] to be applied.
    if (
      !perspectiveStabilisedRef.current
      && activePerspectiveKey === 'fleet-management'
      && !urlPerspective
    ) {
      return;
    }
    perspectiveStabilisedRef.current = true;

    if (urlPerspective === activePerspectiveKey) {
      return;
    }

    // Write the current perspective into the URL.
    lastWrittenByShellRef.current = activePerspectiveKey;
    const searchParams = new URLSearchParams(location.search);
    navigate(
      buildPrototypeHref(location.pathname, activePerspectiveKey, searchParams),
      { replace: true },
    );
  }, [activePerspectiveKey, location.pathname, location.search, navigate]);

  return null;
};

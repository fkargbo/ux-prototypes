import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useActivePerspective } from '@app/shared/contexts/ActivePerspectiveContext';
import {
  buildPrototypeHref,
  readPerspectiveFromSearch,
  resolveActivePerspectiveKey,
} from '../prototypePerspectiveUrl';

/** AppLayout bootstraps as Fleet before enabledPerspectives[0]; skip one shell→URL write per session. */
let hasSkippedAppLayoutFleetBootstrap = false;

/**
 * Keeps `?perspective=` in sync with the shell perspective switcher so share links
 * preserve page path + Core platforms / Fleet management context.
 *
 * Must render inside `AppLayout`'s `ActivePerspectiveProvider` (route elements), not
 * the prototype root wrapper — otherwise `useActivePerspective` falls back to Fleet
 * management and share URLs will always show `?perspective=fleet-management`.
 */
export const PrototypePerspectiveUrlSync: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activePerspective, setPerspectiveByKey } = useActivePerspective();
  const skipNextShellToUrlRef = useRef(false);
  const lastShellWrittenPerspectiveRef = useRef<string | null>(null);

  const activePerspectiveKey = resolveActivePerspectiveKey(activePerspective);

  // Shared links / browser back-forward: URL → shell
  useLayoutEffect(() => {
    const urlPerspective = readPerspectiveFromSearch(new URLSearchParams(location.search));
    if (!urlPerspective) {
      return;
    }

    if (urlPerspective === lastShellWrittenPerspectiveRef.current) {
      lastShellWrittenPerspectiveRef.current = null;
      // Only suppress the follow-up URL write when shell and URL already agree.
      if (urlPerspective === activePerspectiveKey) {
        skipNextShellToUrlRef.current = true;
      }
      return;
    }

    skipNextShellToUrlRef.current = true;
    setPerspectiveByKey(urlPerspective);
  }, [activePerspectiveKey, location.search, setPerspectiveByKey]);

  // Shell perspective + route → URL (perspective switcher, sidebar nav, in-prototype links)
  useEffect(() => {
    if (skipNextShellToUrlRef.current) {
      skipNextShellToUrlRef.current = false;
      return;
    }

    const searchParams = new URLSearchParams(location.search);
    const urlPerspective = readPerspectiveFromSearch(searchParams);

    // AppLayout initializes to Fleet management before applying enabledPerspectives[0].
    // Skip one erroneous shell→URL write on cold start so Core platforms can win.
    if (
      !urlPerspective
      && activePerspectiveKey === 'fleet-management'
      && !hasSkippedAppLayoutFleetBootstrap
    ) {
      hasSkippedAppLayoutFleetBootstrap = true;
      return;
    }

    if (urlPerspective === activePerspectiveKey) {
      lastShellWrittenPerspectiveRef.current = null;
      return;
    }

    lastShellWrittenPerspectiveRef.current = activePerspectiveKey;
    navigate(buildPrototypeHref(location.pathname, activePerspectiveKey, searchParams), { replace: true });
  }, [activePerspectiveKey, location.pathname, location.search, navigate]);

  return null;
};

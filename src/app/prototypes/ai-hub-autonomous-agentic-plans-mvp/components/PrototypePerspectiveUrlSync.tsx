import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useActivePerspective } from '@app/shared/contexts/ActivePerspectiveContext';
import {
  buildPrototypeHref,
  readPerspectiveFromSearch,
  resolveActivePerspectiveKey,
} from '../prototypePerspectiveUrl';

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
      skipNextShellToUrlRef.current = true;
      return;
    }

    skipNextShellToUrlRef.current = true;
    setPerspectiveByKey(urlPerspective);
  }, [location.search, setPerspectiveByKey]);

  // Shell perspective + route → URL (perspective switcher, sidebar nav, in-prototype links)
  useEffect(() => {
    if (skipNextShellToUrlRef.current) {
      skipNextShellToUrlRef.current = false;
      return;
    }

    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('perspective') === activePerspectiveKey) {
      lastShellWrittenPerspectiveRef.current = null;
      return;
    }

    lastShellWrittenPerspectiveRef.current = activePerspectiveKey;
    navigate(buildPrototypeHref(location.pathname, activePerspectiveKey, searchParams), { replace: true });
  }, [activePerspectiveKey, location.pathname, navigate]);

  return null;
};

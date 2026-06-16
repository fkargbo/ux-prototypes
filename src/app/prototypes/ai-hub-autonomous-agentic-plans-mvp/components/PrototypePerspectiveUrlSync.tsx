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
 */
export const PrototypePerspectiveUrlSync: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activePerspective, setPerspectiveByKey } = useActivePerspective();
  const skipNextUrlWriteRef = useRef(false);

  const searchParams = new URLSearchParams(location.search);
  const urlPerspective = readPerspectiveFromSearch(searchParams);
  const activePerspectiveKey = resolveActivePerspectiveKey(activePerspective);

  // URL → shell (shared links and browser back/forward)
  useLayoutEffect(() => {
    if (!urlPerspective) {
      return;
    }
    skipNextUrlWriteRef.current = true;
    setPerspectiveByKey(urlPerspective);
  }, [urlPerspective, setPerspectiveByKey]);

  // Re-apply URL perspective if AppLayout default overrides a shared link on first mount.
  useEffect(() => {
    if (!urlPerspective || activePerspectiveKey === urlPerspective) {
      return;
    }
    skipNextUrlWriteRef.current = true;
    setPerspectiveByKey(urlPerspective);
  }, [activePerspectiveKey, urlPerspective, setPerspectiveByKey]);

  // Shell perspective + route → URL (sidebar nav, perspective switcher, in-prototype links)
  useEffect(() => {
    if (skipNextUrlWriteRef.current) {
      skipNextUrlWriteRef.current = false;
      return;
    }

    const currentParam = searchParams.get('perspective');
    if (currentParam === activePerspectiveKey) {
      return;
    }

    navigate(buildPrototypeHref(location.pathname, activePerspectiveKey, searchParams), { replace: true });
  }, [activePerspectiveKey, location.pathname, location.search, navigate]);

  return null;
};

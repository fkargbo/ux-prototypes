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
 */
export const PrototypePerspectiveUrlSync: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activePerspective, setPerspectiveByKey } = useActivePerspective();

  const activePerspectiveKey = resolveActivePerspectiveKey(activePerspective);
  const lastProcessedSearchRef = useRef<string | null>(null);
  const lastWrittenByShellRef = useRef<string | null>(null);
  const perspectiveStabilisedRef = useRef(false);

  // URL → shell
  useEffect(() => {
    if (location.search === lastProcessedSearchRef.current) {
      return;
    }
    lastProcessedSearchRef.current = location.search;

    const urlPerspective = readPerspectiveFromSearch(new URLSearchParams(location.search));
    if (!urlPerspective) {
      return;
    }

    if (urlPerspective === lastWrittenByShellRef.current) {
      lastWrittenByShellRef.current = null;
      perspectiveStabilisedRef.current = true;
      return;
    }

    perspectiveStabilisedRef.current = true;
    setPerspectiveByKey(urlPerspective);
  }, [location.search, activePerspectiveKey, setPerspectiveByKey]);

  // Shell → URL
  useEffect(() => {
    const urlPerspective = readPerspectiveFromSearch(new URLSearchParams(location.search));

    // AppLayout boots as Fleet management before enabledPerspectives[0] is applied.
    if (
      !perspectiveStabilisedRef.current
      && activePerspectiveKey === 'fleet-management'
      && !urlPerspective
    ) {
      return;
    }

    // A redirect or shared link already set ?perspective= — let Effect 1 update the
    // shell before writing the stale boot-default back into the URL.
    if (
      !perspectiveStabilisedRef.current
      && activePerspectiveKey === 'fleet-management'
      && urlPerspective
      && urlPerspective !== 'fleet-management'
    ) {
      return;
    }

    perspectiveStabilisedRef.current = true;

    if (urlPerspective === activePerspectiveKey) {
      return;
    }

    lastWrittenByShellRef.current = activePerspectiveKey;
    const searchParams = new URLSearchParams(location.search);
    navigate(
      buildPrototypeHref(location.pathname, activePerspectiveKey, searchParams),
      { replace: true },
    );
  }, [activePerspectiveKey, location.pathname, location.search, navigate]);

  return null;
};

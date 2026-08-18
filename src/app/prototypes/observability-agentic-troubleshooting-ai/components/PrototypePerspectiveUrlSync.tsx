import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useActivePerspective } from '@app/shared/contexts/ActivePerspectiveContext';
import {
  buildPrototypeHref,
  PROTOTYPE_QUERY_PARAM,
  readPerspectiveFromSearch,
  resolveActivePerspectiveKey,
} from '../prototypePerspectiveUrl';

const ACTIVE_PROTOTYPE_ID = 'observability-agentic-troubleshooting-ai';

/** Keeps `?perspective=core-platforms` in sync with the shell perspective switcher. */
export const PrototypePerspectiveUrlSync: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activePerspective, setPerspectiveByKey } = useActivePerspective();

  const activePerspectiveKey = resolveActivePerspectiveKey(activePerspective);
  const lastProcessedSearchRef = useRef<string | null>(null);
  const lastWrittenByShellRef = useRef<string | null>(null);
  const perspectiveStabilisedRef = useRef(false);

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

  useEffect(() => {
    const urlPerspective = readPerspectiveFromSearch(new URLSearchParams(location.search));

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

    lastWrittenByShellRef.current = activePerspectiveKey;
    const searchParams = new URLSearchParams(location.search);
    const prototypeId =
      searchParams.get(PROTOTYPE_QUERY_PARAM)
      ?? sessionStorage.getItem('activePrototypeId')
      ?? ACTIVE_PROTOTYPE_ID;
    navigate(
      buildPrototypeHref(location.pathname, activePerspectiveKey, searchParams, prototypeId),
      { replace: true },
    );
  }, [activePerspectiveKey, location.pathname, location.search, navigate]);

  return null;
};

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
 * 1. URL → shell  When location.search carries a valid `?perspective=`, drive
 *    the shell to match (shared links, browser back/forward).
 *
 * 2. Shell → URL  When the shell perspective changes (user switches via
 *    perspective switcher, sidebar nav loses the param, etc.), write the
 *    current perspective into the URL.
 *
 * Boot-default guard
 * ──────────────────
 * AppLayout initialises `activePerspective` to 'Fleet management' before its
 * own useEffect applies `enabledPerspectives[0]` ('core-platforms' for this
 * prototype).  We use `perspectiveStabilisedRef` to suppress shell→URL writes
 * until the shell is either (a) driven by the URL→shell branch, or (b) no
 * longer the AppLayout boot default.
 */
export const PrototypePerspectiveUrlSync: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activePerspective, setPerspectiveByKey } = useActivePerspective();

  const activePerspectiveKey = resolveActivePerspectiveKey(activePerspective);

  /**
   * Flips to `true` once we're confident the shell perspective is authoritative
   * (either from a URL param or from AppLayout settling past its boot default).
   */
  const perspectiveStabilisedRef = useRef(false);

  /**
   * Suppresses one shell→URL write immediately after URL→shell has applied a
   * value, preventing a feedback loop.
   */
  const suppressNextWriteRef = useRef(false);

  // ── 1. URL → shell ──────────────────────────────────────────────────────────
  useEffect(() => {
    const urlPerspective = readPerspectiveFromSearch(new URLSearchParams(location.search));

    if (!urlPerspective) {
      return;
    }

    // URL and shell already agree — nothing to do.
    if (urlPerspective === activePerspectiveKey) {
      perspectiveStabilisedRef.current = true;
      return;
    }

    // Drive the shell to match the URL (shared link / back-forward).
    suppressNextWriteRef.current = true;
    perspectiveStabilisedRef.current = true;
    setPerspectiveByKey(urlPerspective);
  }, [location.search, activePerspectiveKey, setPerspectiveByKey]);

  // ── 2. Shell → URL ──────────────────────────────────────────────────────────
  useEffect(() => {
    // Suppress the write that would immediately follow a URL→shell sync.
    if (suppressNextWriteRef.current) {
      suppressNextWriteRef.current = false;
      return;
    }

    const urlPerspective = readPerspectiveFromSearch(new URLSearchParams(location.search));

    // Don't write to the URL while AppLayout is in its boot default
    // ('fleet-management') and hasn't yet applied enabledPerspectives[0].
    // The URL→shell branch or the next render (when AppLayout settles) will
    // flip perspectiveStabilisedRef and allow this branch to proceed.
    if (!perspectiveStabilisedRef.current && activePerspectiveKey === 'fleet-management') {
      return;
    }
    perspectiveStabilisedRef.current = true;

    // URL already matches shell — nothing to write.
    if (urlPerspective === activePerspectiveKey) {
      return;
    }

    // Write the current shell perspective into the URL.
    const searchParams = new URLSearchParams(location.search);
    navigate(
      buildPrototypeHref(location.pathname, activePerspectiveKey, searchParams),
      { replace: true },
    );
  }, [activePerspectiveKey, location.pathname, location.search, navigate]);

  return null;
};

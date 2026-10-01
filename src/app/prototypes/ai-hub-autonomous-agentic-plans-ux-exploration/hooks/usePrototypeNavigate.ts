import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useActivePerspective } from '@app/shared/contexts/ActivePerspectiveContext';
import { buildPrototypeHref, resolveActivePerspectiveKey } from '../prototypePerspectiveUrl';

/** Navigate within this prototype while preserving the active perspective in the URL. */
export function usePrototypeNavigate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activePerspective } = useActivePerspective();

  return useCallback(
    (path: string, options?: { replace?: boolean }) => {
      const perspectiveKey = resolveActivePerspectiveKey(activePerspective);
      navigate(buildPrototypeHref(path, perspectiveKey, searchParams), options);
    },
    [activePerspective, navigate, searchParams],
  );
}

import type { AppShellPerspectiveKey } from '@app/shared/contexts/ActivePerspectiveContext';

/** Shareable perspective query param (`?perspective=core-platforms`). */
export const PERSPECTIVE_QUERY_PARAM = 'perspective';

/** Legacy remediation handoff param — still read for older shared links. */
export const DRILL_FROM_QUERY_PARAM = 'from';

export const DEFAULT_PROTOTYPE_PERSPECTIVE: AppShellPerspectiveKey = 'core-platforms';

export function parsePerspectiveKey(value: string | null | undefined): AppShellPerspectiveKey | null {
  if (value === 'core-platforms' || value === 'fleet-management') {
    return value;
  }
  return null;
}

export function perspectiveKeyFromShellName(name: string): AppShellPerspectiveKey | null {
  if (name === 'Core platforms') {
    return 'core-platforms';
  }
  if (name === 'Fleet management') {
    return 'fleet-management';
  }
  return null;
}

export function isSingleClusterPerspectiveKey(key: AppShellPerspectiveKey | null): boolean {
  return key === 'core-platforms';
}

export function resolveActivePerspectiveKey(activePerspective: string): AppShellPerspectiveKey {
  return perspectiveKeyFromShellName(activePerspective) ?? DEFAULT_PROTOTYPE_PERSPECTIVE;
}

export function readPerspectiveFromSearch(
  searchParams: URLSearchParams | { get: (key: string) => string | null },
): AppShellPerspectiveKey | null {
  return (
    parsePerspectiveKey(searchParams.get(PERSPECTIVE_QUERY_PARAM))
    ?? parsePerspectiveKey(searchParams.get(DRILL_FROM_QUERY_PARAM))
  );
}

export function buildPrototypeHref(
  path: string,
  perspectiveKey: AppShellPerspectiveKey = DEFAULT_PROTOTYPE_PERSPECTIVE,
  existingSearch?: URLSearchParams | string,
): string {
  const params = new URLSearchParams(
    typeof existingSearch === 'string'
      ? existingSearch.replace(/^\?/, '')
      : existingSearch?.toString() ?? '',
  );
  params.set(PERSPECTIVE_QUERY_PARAM, perspectiveKey);
  if (params.get(DRILL_FROM_QUERY_PARAM) === perspectiveKey) {
    params.delete(DRILL_FROM_QUERY_PARAM);
  }
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export const PLANS_LIST_PATH = '/core/observe/ai-hub/plans';

export function getPlanRemediationHref(planSlug: string, perspectiveKey: AppShellPerspectiveKey): string {
  return buildPrototypeHref(
    `/core/observe/ai-hub/plans/${encodeURIComponent(planSlug)}/remediation`,
    perspectiveKey,
  );
}

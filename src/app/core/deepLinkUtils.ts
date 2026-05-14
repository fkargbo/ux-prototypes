import { matchPath } from 'react-router-dom';
import { prototypeRegistry } from './PrototypeRegistry';
import { getGithubPagesBasenameNoSlash } from './githubPagesBase';

/**
 * React Router `pathname` (no basename). Uses `window.location` so this can run
 * before the first render finishes (bootstrap).
 */
export function getRouterPathname(): string {
  if (typeof window === 'undefined') {
    return '/';
  }
  let p = window.location.pathname;
  const ghBase = getGithubPagesBasenameNoSlash();
  if (process.env.NODE_ENV === 'production' && ghBase && p.startsWith(ghBase)) {
    p = p.slice(ghBase.length) || '/';
  }
  if (!p || p === '') {
    return '/';
  }
  return p.length > 1 && p.endsWith('/') ? p.replace(/\/$/, '') : p;
}

/**
 * Picks the prototype that owns the deepest matching route for this path (after registry init).
 */
export function findPrototypeIdForPath(pathname: string): string | null {
  if (!pathname || pathname === '/') {
    return null;
  }

  let best: { id: string; score: number } | null = null;

  for (const module of prototypeRegistry.getAll()) {
    for (const route of module.routes) {
      const pattern = route.path;
      if (!pattern || pattern === '*') {
        continue;
      }
      // Root route is ambiguous across prototypes; only use explicit ?prototype= for "/".
      if (pattern === '/') {
        continue;
      }
      const m = matchPath({ path: pattern, end: false }, pathname);
      if (m) {
        const score = pattern.length;
        if (!best || score > best.score) {
          best = { id: module.config.id, score };
        }
      }
    }
  }

  return best?.id ?? null;
}

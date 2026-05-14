/**
 * GitHub project pages are served at https://<user>.github.io/<repo>/.
 * Webpack sets `<base href="...">` and `output.publicPath`; this helper keeps
 * React Router `basename` and pathname stripping aligned with that URL.
 */
export function getGithubPagesBasenameNoSlash(): string {
  if (process.env.NODE_ENV !== 'production') {
    return '';
  }
  const fromEnv = String(process.env.GITHUB_PAGES_BASENAME || '').trim().replace(/\/+$/, '');
  if (fromEnv) {
    return fromEnv.startsWith('/') ? fromEnv : `/${fromEnv}`;
  }
  if (typeof document !== 'undefined') {
    const href = document.querySelector('base')?.getAttribute('href') || '';
    try {
      const u = new URL(href, window.location.origin);
      const p = (u.pathname || '').replace(/\/+$/, '');
      if (p) {
        return p.startsWith('/') ? p : `/${p}`;
      }
    } catch {
      /* ignore */
    }
  }
  return '/ux-prototypes';
}

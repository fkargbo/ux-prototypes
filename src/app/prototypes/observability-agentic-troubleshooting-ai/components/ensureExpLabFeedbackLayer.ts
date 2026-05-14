import { GITHUB_PAGES_BASENAME } from '@app/core/deepLinkUtils';

const SCRIPT_ID = 'exp-lab-feedback-layer-script';

/**
 * URL for the ExP-Lab IIFE bundle (source: git submodule `exp-lab` → github.com/fkargbo/exp-lab;
 * see `guides/exp-lab-hpux-prototypes.md`).
 *
 * **Production override:** set `EXP_LAB_FEEDBACK_SCRIPT_URL` at **webpack build time** (root `.env` or
 * GitHub Actions env, e.g. `https://fkargbo.github.io/exp-lab/feedback-layer.js`) to load the layer from
 * your own Pages build (with Supabase env baked in there) instead of same-origin `…/HPUX-Prototypes/feedback-layer.js`.
 *
 * Local dev: `cd exp-lab && npm run build` — webpack-dev-server serves `exp-lab/dist/` at `/feedback-layer.js`
 * (see root `webpack.dev.js`). Optionally copy `feedback-layer.js` into root `dist/` instead.
 */
export function getExpLabFeedbackScriptUrl(): string {
  const buildTimeOverride = String(process.env.EXP_LAB_FEEDBACK_SCRIPT_URL ?? '').trim();
  if (process.env.NODE_ENV === 'production') {
    if (buildTimeOverride) {
      return buildTimeOverride;
    }
    return `${window.location.origin}${GITHUB_PAGES_BASENAME}/feedback-layer.js`;
  }
  return `${window.location.origin}/feedback-layer.js`;
}

/** Load ExP-Lab once while this prototype is active (singleton script tag). */
export function ensureExpLabFeedbackLayer(): void {
  if (typeof document === 'undefined') {
    return;
  }
  if (document.getElementById(SCRIPT_ID) || document.getElementById('exp-lab-feedback-host')) {
    return;
  }

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.src = getExpLabFeedbackScriptUrl();
  script.async = true;
  script.defer = true;
  script.onerror = () => {
    console.warn(
      '[ExP-Lab] Could not load feedback-layer.js from',
      script.src,
      '— build exp-lab and copy dist/feedback-layer.js into this app dist/. See exp-lab/README.md.',
    );
  };
  document.body.appendChild(script);
}

/** Tear down DOM injected by the embed when leaving this prototype (script tag stays cached). */
export function removeExpLabFeedbackLayer(): void {
  if (typeof document === 'undefined') {
    return;
  }
  document.getElementById(SCRIPT_ID)?.remove();
  document.getElementById('exp-lab-feedback-host')?.remove();
  document.getElementById('exp-lab-pin-root')?.remove();
  document.getElementById('exp-lab-interaction-root')?.remove();
  document.getElementById('exp-lab-portal-styles')?.remove();
}

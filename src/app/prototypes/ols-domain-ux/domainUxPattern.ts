import { useBannerVersionSelection } from '@app/core/bannerVersionPicker';

export const OLS_DOMAIN_UX_PROTOTYPE_ID = 'ols-domain-ux';

export type DomainUxPattern = 'agentic-runs' | 'recommendation-hub' | 'context-panel';

export const DOMAIN_UX_PATTERN_DEFAULT: DomainUxPattern = 'agentic-runs';

export function useDomainUxPattern(): DomainUxPattern {
  const key = useBannerVersionSelection(OLS_DOMAIN_UX_PROTOTYPE_ID, DOMAIN_UX_PATTERN_DEFAULT);
  if (key === 'recommendation-hub' || key === 'context-panel') {
    return key;
  }
  return 'agentic-runs';
}

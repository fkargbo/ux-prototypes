import aiExperienceSvg from '../assets/rh-ui-icon-ai-experience-black.svg';

/**
 * Webpack loads project SVGs as raw XML (`raw-loader`). Use a data URL so `<img src>` works.
 */
export const AI_EXPERIENCE_ICON_DATA_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(aiExperienceSvg)}`;

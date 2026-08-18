import React from 'react';
import { AI_EXPERIENCE_ICON_DATA_URL } from '../../components/autonomousAiObserve/aiExperienceIconUrl';

export type AiExperienceIconProps = {
  /** Pixel width/height (square). */
  size?: number;
  className?: string;
};

/** AI Experience branding image — decorative; paired with hub titles. */
export const AiExperienceIcon: React.FC<AiExperienceIconProps> = ({ size = 32, className }) => (
  <img
    src={AI_EXPERIENCE_ICON_DATA_URL}
    alt=""
    aria-hidden="true"
    width={size}
    height={size}
    className={['ols-ai-hub-experience-icon', className].filter(Boolean).join(' ')}
    style={{ display: 'block', flexShrink: 0 }}
  />
);

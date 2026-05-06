/**
 * Mirrors `FleetHealthInsightsView` per-row AI insight treatment: RH AI experience artwork (14px) + “AI insight: ”
 * (semibold, subtle) + body (`AI_INSIGHT_TEXT_STYLE` — italic, subtle).
 */
import * as React from 'react';
import { Flex } from '@patternfly/react-core';
import { AI_INSIGHT_TEXT_STYLE } from '../../pages/alerting-fleet-copy/data/fleetInsightsConfig';
import { AI_EXPERIENCE_ICON_DATA_URL } from './aiExperienceIconUrl';

/**
 * Strips a leading "AI insight · …" from mock category labels so the UI can render
 * a single "AI insight: …" prefix (matches Alerting fleet view list rows).
 */
export function aiInsightCategoryDisplaySuffix(categoryLabel: string): string {
  const trimmed = categoryLabel.trim();
  const m = trimmed.match(/^AI insight\s*·\s*(.+)$/i);
  return m ? m[1].trim() : trimmed;
}

export interface AiInsightLedeProps {
  categoryLabel: string;
  narrative: string;
  className?: string;
  style?: React.CSSProperties;
}

/** Full-width block: same layout as `FleetHealthInsightsView` per-alert AI insight row. */
export const AiInsightLede: React.FC<AiInsightLedeProps> = ({
  categoryLabel,
  narrative,
  className,
  style,
}) => {
  const suffix = categoryLabel.trim() ? aiInsightCategoryDisplaySuffix(categoryLabel) : '';
  const body = suffix ? `${suffix} — ${narrative}` : narrative;

  return (
    <div className={className} style={style}>
      <Flex
        alignItems={{ default: 'alignItemsFlexStart' }}
        gap={{ default: 'gapXs' }}
        style={{ width: '100%' }}
        role="note"
        aria-label="AI insight"
      >
        <span className="ols-aio-ai-insight-icon" aria-hidden="true">
          <img
            src={AI_EXPERIENCE_ICON_DATA_URL}
            alt=""
            width={14}
            height={14}
            style={{ display: 'block', flexShrink: 0 }}
          />
        </span>
        <span
          style={{
            fontSize: 'var(--pf-t--global--font--size--sm)',
            minWidth: 0,
            flex: 1,
            lineHeight: 1.5,
          }}
        >
          <span style={{ fontWeight: 600, color: 'var(--pf-t--global--text--color--subtle)' }}>AI insight: </span>
          <span style={AI_INSIGHT_TEXT_STYLE}>{body}</span>
        </span>
      </Flex>
    </div>
  );
}


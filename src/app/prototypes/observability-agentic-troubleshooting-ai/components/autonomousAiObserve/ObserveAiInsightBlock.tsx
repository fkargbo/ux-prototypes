import React from 'react';
import { Content, Title } from '@patternfly/react-core';
import type { AlertAiInsight } from './data';

export interface ObserveAiInsightBlockProps {
  insight: AlertAiInsight;
  /** Unique id fragment for a11y when multiple blocks exist */
  idSuffix?: string;
}

/**
 * Labeled AI transparency block: category → headline → evidence → optional narrative.
 * Matches fleet “Fleet Insight” visual weight without duplicating MagicIcon strip (alert header already busy).
 */
export const ObserveAiInsightBlock: React.FC<ObserveAiInsightBlockProps> = ({ insight, idSuffix = 'default' }) => {
  const regionId = `ols-ai-insight-${idSuffix}`;
  return (
    <div className="ols-aio-ai-insight" role="region" aria-labelledby={`${regionId}-headline`}>
      <Content component="p" className="ols-aio-ai-insight__category">
        {insight.categoryLabel}
      </Content>
      <Title headingLevel="h4" size="md" className="ols-aio-ai-insight__headline" id={`${regionId}-headline`}>
        {insight.headline}
      </Title>
      <Content component="p" className="ols-aio-ai-insight__evidence">
        {insight.evidence}
      </Content>
      {insight.narrative ? (
        <Content component="p" className="ols-aio-ai-insight__narrative">
          {insight.narrative}
        </Content>
      ) : null}
    </div>
  );
};

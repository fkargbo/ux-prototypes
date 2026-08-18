import React from 'react';
import { Button } from '@patternfly/react-core';
import { AI_EXPERIENCE_ICON_DATA_URL } from '../../../components/autonomousAiObserve/aiExperienceIconUrl';
import { INSIGHTS_LINK } from '../../alerting-fleet-copy/data/fleetInsightsConfig';
import {
  INVESTIGATE_WITH_AI_LABEL,
  VIEW_AI_INVESTIGATION_LABEL,
} from '../../ai-hub-v3/alertInvestigationBridge';

export interface InvestigateWithAiLinkProps {
  label?: string;
  hasExistingInvestigation?: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const InvestigateWithAiLink: React.FC<InvestigateWithAiLinkProps> = ({
  label,
  hasExistingInvestigation = false,
  onClick,
}) => {
  const actionLabel =
    label ?? (hasExistingInvestigation ? VIEW_AI_INVESTIGATION_LABEL : INVESTIGATE_WITH_AI_LABEL);

  return (
    <Button
      variant="link"
      isInline
      style={INSIGHTS_LINK}
      className="pf-v6-u-font-size-sm"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick(event);
      }}
    >
      <span
        className="ols-aio-ai-insight-icon"
        aria-hidden="true"
        style={{ marginRight: 'var(--pf-t--global--spacer--xs)' }}
      >
        <img
          src={AI_EXPERIENCE_ICON_DATA_URL}
          alt=""
          width={16}
          height={16}
          style={{ display: 'block', flexShrink: 0 }}
        />
      </span>
      {actionLabel}
    </Button>
  );
};

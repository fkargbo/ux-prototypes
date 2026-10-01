import React from 'react';
import {
  Content,
  Flex,
  FlexItem,
  Title,
} from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { AiExperienceIcon } from '../pages/ai-hub-plans-v2/AiExperienceIcon';

export const AGENTIC_RUN_DETAILS_SUBTEXT =
  'Review the audit trail of AI-driven analysis and remediation activities.';

type AgenticRunDetailsSectionHeadingProps = {
  /** Shown on analysis-aborted runs (no sticky action bar on those pages). */
  showAiDisclaimer?: boolean;
};

export const AgenticRunDetailsSectionHeading: React.FC<AgenticRunDetailsSectionHeadingProps> = ({
  showAiDisclaimer = false,
}) => (
  <>
    <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
      <AiExperienceIcon size={20} />
      <FlexItem>
        <Title headingLevel="h3" size="lg" style={{ marginBottom: 0 }}>
          Agentic run details
        </Title>
      </FlexItem>
    </Flex>
    <Content component="p" className="ols-ai-hub-page-subtitle">
      {AGENTIC_RUN_DETAILS_SUBTEXT}
    </Content>
    {showAiDisclaimer ? (
      <Content component="p" className="ols-ai-hub-page-disclaimer" style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}>
        <InfoCircleIcon
          style={{
            color: 'var(--pf-t--global--icon--color--status--info--default)',
            marginInlineEnd: 'var(--pf-t--global--spacer--xs)',
            verticalAlign: 'middle',
            flexShrink: 0,
          }}
          aria-hidden
        />
        The autonomous features of OpenShift Lightspeed use AI technology to generate output. Always
        review AI-generated content prior to use.
      </Content>
    ) : null}
  </>
);

import React from 'react';
import { Content, Title } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { AiHubPageHeading } from '../../components/AiHubPageHeading';
import { TroubleshootingPlansTab } from '../ai-hub-plans-v2/TroubleshootingPlansTab';
import { AgenticKillSwitchBanner } from '../../components/AgenticKillSwitchBanner';
import { AiExperienceIcon } from '../ai-hub-plans-v2/AiExperienceIcon';
import '../ai-hub-page.css';

export const TroubleshootingPlansPageV2: React.FC = () => {
  return (
    <div className="ols-ai-hub-page ols-ai-hub-page--v3 ols-ai-hub-page--list" data-exp-lab-annotation-root>
      <AiHubPageHeading>
        <div className="ols-ai-hub-page-header-primary">
          <AiExperienceIcon size={40} />
          <div className="ols-ai-hub-page-header-copy">
            <Title headingLevel="h1" size="2xl">
              Agentic runs
            </Title>
            <Content component="p" className="ols-ai-hub-page-subtitle">
              Observability-triggered agentic runs generated from firing platform monitoring alerts —
              scoped to signal correlation, alert root cause, and targeted recovery actions.
            </Content>
            <Content component="p" className="ols-ai-hub-page-disclaimer">
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
          </div>
        </div>
      </AiHubPageHeading>

      <div
        id="ols-troubleshooting-plans-main"
        className="template-page-content"
        role="main"
        aria-label="Agentic runs content"
      >
        <AgenticKillSwitchBanner />
        <TroubleshootingPlansTab />
      </div>
    </div>
  );
};

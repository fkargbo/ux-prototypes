import React from 'react';
import { Content, Title } from '@patternfly/react-core';
import { AiHubPageHeading } from '../../components/AiHubPageHeading';
import { TroubleshootingPlansTab } from '../ai-hub-v1/TroubleshootingPlansTab';
import { AgenticKillSwitchBanner } from '../../components/AgenticKillSwitchBanner';
import { AiExperienceIcon } from '../ai-hub-v1/AiExperienceIcon';
import '../ai-hub-page.css';

export const TroubleshootingPlansPageV1: React.FC = () => {
  return (
    <div className="ols-ai-hub-page ols-ai-hub-page--v3 ols-ai-hub-page--list" data-exp-lab-annotation-root>
      <AiHubPageHeading>
        <div className="ols-ai-hub-page-header-primary">
          <AiExperienceIcon size={40} />
          <div className="ols-ai-hub-page-header-copy">
            <Title headingLevel="h1" size="2xl">
              Troubleshooting plans
            </Title>
            <Content component="p" className="ols-ai-hub-page-subtitle">
              Observability-triggered remediation plans generated from firing platform monitoring alerts —
              scoped to signal correlation, alert root cause, and targeted recovery actions.
            </Content>
            <Content component="p" className="ols-ai-hub-page-disclaimer">
              Always review AI-generated content prior to use.
            </Content>
          </div>
        </div>
      </AiHubPageHeading>

      <div
        id="ols-troubleshooting-plans-main"
        className="template-page-content"
        role="main"
        aria-label="Troubleshooting plans content"
      >
        <AgenticKillSwitchBanner />
        <TroubleshootingPlansTab />
      </div>
    </div>
  );
};

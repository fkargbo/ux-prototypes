import React from 'react';
import { Content, Title } from '@patternfly/react-core';
import { AiHubPageHeading } from '../components/AiHubPageHeading';
import { AgenticKillSwitchBanner } from '../components/AgenticKillSwitchBanner';
import * as Hub from './ai-hub-v3';
import './ai-hub-page.css';

export const AIHubPage: React.FC = () => {
  return (
    <div className="ols-ai-hub-page ols-ai-hub-page--v3 ols-ai-hub-page--list" data-exp-lab-annotation-root>
      <AiHubPageHeading>
        <div className="ols-ai-hub-page-header-primary">
          <Hub.AiExperienceIcon size={40} />
          <div className="ols-ai-hub-page-header-copy">
            <Title headingLevel="h1" size="2xl">
              Agentic plans
            </Title>
            <Content component="p" className="ols-ai-hub-page-subtitle">
              Speed up incident response with automated investigations, evidence collection, and remediation.
            </Content>
            <Content component="p" className="ols-ai-hub-page-disclaimer">
              Always review AI-generated content prior to use.
            </Content>
          </div>
        </div>
      </AiHubPageHeading>

      <div
        id="ols-ai-hub-main"
        className="template-page-content"
        role="main"
        aria-label="Agentic plans content"
      >
        <AgenticKillSwitchBanner />
        <Hub.PlansAndApprovalsTab />
      </div>
    </div>
  );
};

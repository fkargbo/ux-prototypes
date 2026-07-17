import React from 'react';
import { Content, Title } from '@patternfly/react-core';
import { AiHubPageHeading } from '../components/AiHubPageHeading';
import { AuditKillSwitchPanel } from '../components/AuditKillSwitchPanel';
import { AgenticKillSwitchBanner } from '../components/AgenticKillSwitchBanner';
import * as Hub from './ai-hub-v3';
import './ai-hub-page.css';

export const AuditAndLogsPage: React.FC = () => {
  return (
    <div className="ols-ai-hub-page ols-ai-hub-page--v3" data-exp-lab-annotation-root>
      <AiHubPageHeading>
        <div className="ols-ai-hub-page-header-primary">
          <Hub.AiExperienceIcon size={40} />
          <div className="ols-ai-hub-page-header-copy">
            <Title headingLevel="h1" size="2xl">
              Audit & logs
            </Title>
            <Content component="p" className="ols-ai-hub-page-disclaimer">
              The autonomous features of OpenShift Lightspeed use AI technology to generate output. Always
              review AI-generated content prior to use.
            </Content>
          </div>
        </div>
      </AiHubPageHeading>

      <div
        id="ols-ai-hub-audit-main"
        className="template-page-content"
        role="main"
        aria-label="Audit and logs content"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', minHeight: 0 }}
      >
        <AgenticKillSwitchBanner />
        <AuditKillSwitchPanel />
        <Hub.AIAuditAndLogsTab />
      </div>
    </div>
  );
};

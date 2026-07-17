import React from 'react';
import { Content, Title } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { AiHubPageHeading } from '../../components/AiHubPageHeading';
import { AgenticKillSwitchBanner } from '../../components/AgenticKillSwitchBanner';
import { AuditKillSwitchPanel } from '../../components/AuditKillSwitchPanel';
import * as Hub from '../ai-hub-plans-v2';
import '../ai-hub-page.css';

export const AIHubPageV2: React.FC = () => {
  return (
    <div className="ols-ai-hub-page ols-ai-hub-page--v3 ols-ai-hub-page--list" data-exp-lab-annotation-root>
      <AiHubPageHeading>
        <div className="ols-ai-hub-page-header-primary">
          <Hub.AiExperienceIcon size={40} />
          <div className="ols-ai-hub-page-header-copy">
            <Title headingLevel="h1" size="2xl">
              Agentic runs
            </Title>
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
        id="ols-ai-hub-main"
        className="template-page-content"
        role="main"
        aria-label="Agentic runs content"
      >
        <AgenticKillSwitchBanner />
        <AuditKillSwitchPanel />
        <Hub.PlansAndApprovalsTab />
      </div>
    </div>
  );
};

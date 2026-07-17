import React from 'react';
import { Content, Title } from '@patternfly/react-core';
import { AiHubPageHeading } from '../../components/AiHubPageHeading';
import { AuditKillSwitchPanel } from '../../components/AuditKillSwitchPanel';
import { AgenticKillSwitchBanner } from '../../components/AgenticKillSwitchBanner';
import * as Hub from '../ai-hub-plans-v2';
import '../ai-hub-page.css';

export const AuditAndLogsPageV2: React.FC = () => {
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

      {/*
       * Inline flex-column layout is intentional and theme-agnostic.
       *
       * Root cause of recurring Glass-mode gap: app.css forces
       * min-height:calc(100vh - 200px) on div.template-page-content, and previous
       * Glass CSS iterations made .ols-ai-hub-page a flex column with this div as a
       * flex:1 0 auto child — distributing the excess height as whitespace between
       * the capabilities toggle and the audit log section.
       *
       * Inline display:flex + flex-direction:column overrides any cascade-injected
       * flex-grow or justify-content and keeps children in tight natural stacking
       * order regardless of contrast mode, theme, or color scheme.
       * min-height:0 beats the app.css min-height hardcode without relying on
       * Glass-specific CSS selector overrides.
       */}
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

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, Content, Title } from '@patternfly/react-core';
import { AiHubPageHeading } from '../../components/AiHubPageHeading';
import { AuditKillSwitchPanel } from '../../components/AuditKillSwitchPanel';
import { AgenticKillSwitchBanner } from '../../components/AgenticKillSwitchBanner';
import * as Hub from '../ai-hub-v1';
import '../ai-hub-page.css';

export const AuditAndLogsPageV1: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="ols-ai-hub-page ols-ai-hub-page--v3" data-exp-lab-annotation-root>
      <div className="template-page-breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem to="#" onClick={() => navigate('/v1/ai-hub/observe/plans')}>
            Agentic plans
          </BreadcrumbItem>
          <BreadcrumbItem isActive>Audit & logs</BreadcrumbItem>
        </Breadcrumb>
      </div>

      <AiHubPageHeading>
        <div className="ols-ai-hub-page-header-primary">
          <Hub.AiExperienceIcon size={40} />
          <div className="ols-ai-hub-page-header-copy">
            <Title headingLevel="h1" size="2xl">
              Audit & logs
            </Title>
            <Content component="p" className="ols-ai-hub-page-subtitle">
              Container stdout from agentic Lightspeed workflows. When cluster central logging is installed, these
              entries are also forwarded to Loki.
            </Content>
            <Content component="p" className="ols-ai-hub-page-disclaimer">
              Tech preview: log format and retention are still evolving. This view mirrors the OpenShift pod log
              experience until structured audit metadata is available.
            </Content>
          </div>
        </div>
      </AiHubPageHeading>

      <div
        id="ols-ai-hub-audit-main"
        className="template-page-content"
        role="main"
        aria-label="Audit and logs content"
      >
        <AgenticKillSwitchBanner />
        <AuditKillSwitchPanel />
        <Hub.AIAuditAndLogsTab />
      </div>
    </div>
  );
};

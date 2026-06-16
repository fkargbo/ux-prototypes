import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, Content, Title } from '@patternfly/react-core';
import { AiHubPageHeading } from '../components/AiHubPageHeading';
import { TroubleshootingPlansTab } from './ai-hub-v3/TroubleshootingPlansTab';
import { AiExperienceIcon } from './ai-hub-v3/AiExperienceIcon';
import './ai-hub-page.css';

export const TroubleshootingPlansPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="ols-ai-hub-page ols-ai-hub-page--v3" data-exp-lab-annotation-root>
      <div className="template-page-breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem to="#" onClick={() => navigate('/core/observe/troubleshooting-plans')}>
            Observe
          </BreadcrumbItem>
          <BreadcrumbItem isActive>Troubleshooting plans</BreadcrumbItem>
        </Breadcrumb>
      </div>

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
        <TroubleshootingPlansTab />
      </div>
    </div>
  );
};

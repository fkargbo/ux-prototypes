import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, Content, Title } from '@patternfly/react-core';
import { useBannerVersionSelection } from '@app/core/bannerVersionPicker';
import { config as prototypeConfig } from '../prototype.config';
import * as HubV3 from './ai-hub-v3';
import './ai-hub-page.css';

export const AIHubPage: React.FC = () => {
  const navigate = useNavigate();
  const bannerVersionKey = useBannerVersionSelection(
    prototypeConfig.id,
    prototypeConfig.bannerVersionPicker?.defaultKey ?? 'v3'
  );
  const isHubV3 = bannerVersionKey === 'v3';
  const Hub = HubV3;
  const pageVersionClass = isHubV3 ? ' ols-ai-hub-page--v3' : ' ols-ai-hub-page--v2';

  return (
    <div className={`ols-ai-hub-page${pageVersionClass}`} data-exp-lab-annotation-root>
      <div className="template-page-breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem to="#" onClick={() => navigate('/core/observe/ai-hub/plans')}>
            AI Hub
          </BreadcrumbItem>
          <BreadcrumbItem isActive>Plans</BreadcrumbItem>
        </Breadcrumb>
      </div>

      <div className="template-page-heading">
        <div className="ols-ai-hub-page-header-primary">
          <Hub.AiExperienceIcon size={40} />
          <div className="ols-ai-hub-page-header-copy">
            <Title headingLevel="h1" size="2xl" style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
              AI Hub (MVP)
            </Title>
            <Content component="p" className="ols-ai-hub-page-subtitle">
              Accelerate incident response with autonomous investigations, automated evidence gathering, and guided
              fixes.
            </Content>
            <Content
              component="p"
              style={{
                marginTop: 'var(--pf-t--global--spacer--xs)',
                marginBottom: 0,
                fontSize: '12px',
                color: '#4D4D4D',
              }}
            >
              Always review AI-generated content prior to use.
            </Content>
          </div>
        </div>
      </div>

      <div
        id="ols-ai-hub-main"
        className="template-page-content"
        role="main"
        aria-label="AI Hub plans content"
      >
        <Hub.PlansAndApprovalsTab />
      </div>
    </div>
  );
};

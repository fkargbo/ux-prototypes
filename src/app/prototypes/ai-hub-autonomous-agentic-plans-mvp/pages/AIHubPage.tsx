import React from 'react';
import { Content, Title } from '@patternfly/react-core';
import { useBannerVersionSelection } from '@app/core/bannerVersionPicker';
import { config as prototypeConfig } from '../prototype.config';
import { useAiHubAppearance } from '../context/AiHubAppearanceContext';
import * as HubV3 from './ai-hub-v3';
import './ai-hub-page.css';

export const AIHubPage: React.FC = () => {
  const bannerVersionKey = useBannerVersionSelection(
    prototypeConfig.id,
    prototypeConfig.bannerVersionPicker?.defaultKey ?? 'v3'
  );
  const isHubV3 = bannerVersionKey === 'v3';
  const Hub = HubV3;
  const { isGlassContrast } = useAiHubAppearance();

  const pageBackground = isGlassContrast ? 'transparent' : '#f5f5f5';
  const mainBackground = isGlassContrast ? 'transparent' : '#ffffff';
  const pageVersionClass = isHubV3 ? ' ols-ai-hub-page--v3' : ' ols-ai-hub-page--v2';

  return (
    <div
      className={`ols-ai-hub-page${pageVersionClass}`}
      data-exp-lab-annotation-root
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: pageBackground,
      }}
    >
      <div className="create-policy-header">
        <div className="ols-ai-hub-page-header-inner">
          <div className="ols-ai-hub-page-header-primary">
            <Hub.AiExperienceIcon size={40} />
            <div className="ols-ai-hub-page-header-copy">
              <Title headingLevel="h1" size="2xl">
                AI Hub (Conceptual design)
              </Title>
              <Content
                component="p"
                className="ols-ai-hub-page-subtitle"
                style={{ marginTop: '8px', marginBottom: 0, color: '#6a6e73' }}
              >
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
      </div>

      <div
        id="ols-ai-hub-main"
        className="ols-ai-hub-page__main"
        role="main"
        aria-label="AI Hub plans content"
        style={{ backgroundColor: mainBackground }}
      >
        <div style={{ padding: '24px', boxSizing: 'border-box' }}>
          <Hub.PlansAndApprovalsTab />
        </div>
      </div>
    </div>
  );
};

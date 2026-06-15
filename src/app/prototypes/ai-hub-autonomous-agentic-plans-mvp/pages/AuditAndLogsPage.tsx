import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, Content, FlexItem, Title } from '@patternfly/react-core';
import { AgenticCapabilitiesHeaderSwitch } from '../components/AgenticCapabilitiesHeaderSwitch';
import * as Hub from './ai-hub-v3';
import './ai-hub-page.css';

export const AuditAndLogsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="ols-ai-hub-page ols-ai-hub-page--v3" data-exp-lab-annotation-root>
      <div className="template-page-breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem to="#" onClick={() => navigate('/core/observe/ai-hub/plans')}>
            Agentic Plans
          </BreadcrumbItem>
          <BreadcrumbItem isActive>Audit & logs</BreadcrumbItem>
        </Breadcrumb>
      </div>

      <div className="template-page-heading ols-ai-hub-page-heading-row">
        <div className="ols-ai-hub-page-header-primary">
          <Hub.AiExperienceIcon size={40} />
          <div className="ols-ai-hub-page-header-copy">
            <Title headingLevel="h1" size="2xl" style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
              Audit & logs
            </Title>
            <Content component="p" className="ols-ai-hub-page-subtitle">
              Tamper-evident execution ledger for every agentic plan lifecycle transition — from investigation
              through approval, remediation, and termination.
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
              Cryptographic receipts are sealed at write time and cannot be modified post-execution.
            </Content>
          </div>
        </div>
        <FlexItem className="ols-ai-hub-page-heading-actions">
          <AgenticCapabilitiesHeaderSwitch />
        </FlexItem>
      </div>

      <div
        id="ols-ai-hub-audit-main"
        className="template-page-content"
        role="main"
        aria-label="Audit and logs content"
      >
        <Hub.AIAuditAndLogsTab />
      </div>
    </div>
  );
};

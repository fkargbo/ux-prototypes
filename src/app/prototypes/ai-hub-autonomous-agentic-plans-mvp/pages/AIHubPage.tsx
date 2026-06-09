import React from 'react';
import { Content, Title } from '@patternfly/react-core';
import { PlansAndApprovalsTab } from './PlansAndApprovalsTab';

export const AIHubPage: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
      }}
    >
      <div
        style={{
          padding: 'var(--pf-t--global--spacer--lg) var(--pf-t--global--spacer--xl)',
          backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
          borderBottom: '1px solid var(--pf-t--global--border--color--default)',
        }}
      >
        <Title headingLevel="h1" size="2xl">
          AI Hub — Autonomous agentic plans (MVP)
        </Title>
        <Content component="p" style={{ marginTop: 'var(--pf-t--global--spacer--sm)', marginBottom: 0 }}>
          Review autonomous remediation plans, approve or reject agent proposals, and discuss remediation details
          with OpenShift Lightspeed.
        </Content>
      </div>
      <PlansAndApprovalsTab />
    </div>
  );
};

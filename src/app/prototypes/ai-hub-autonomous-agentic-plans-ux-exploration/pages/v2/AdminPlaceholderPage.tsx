/**
 * Inert Administration siblings so prototype nav can replace the default
 * Administration group without emptying Cluster Settings / Namespaces / etc.
 */
import React from 'react';
import { Content, Title } from '@patternfly/react-core';

type AdminPlaceholderPageProps = {
  title: string;
};

export const AdminPlaceholderPage: React.FC<AdminPlaceholderPageProps> = ({ title }) => (
  <div>
    <div className="template-page-heading">
      <Title headingLevel="h1" size="2xl">
        {title}
      </Title>
      <Content component="p">Placeholder — not part of this Cluster Update prototype pass.</Content>
    </div>
  </div>
);

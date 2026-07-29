import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Title, Content, Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';

/**
 * Observe → Observability services.
 * Empty page template — content to be added in a later pass.
 */
export const ObservabilityServicesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="template-page-breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem
            to="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/core/home/overview');
            }}
          >
            Home
          </BreadcrumbItem>
          <BreadcrumbItem
            to="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/core/observe/observability-services');
            }}
          >
            Observe
          </BreadcrumbItem>
          <BreadcrumbItem isActive>Observability services</BreadcrumbItem>
        </Breadcrumb>
      </div>

      <div className="template-page-heading">
        <Title headingLevel="h1" size="2xl">
          Observability services
        </Title>
        <Content component="p">
          Placeholder page. Content will be added in a later iteration.
        </Content>
      </div>

      <div className="template-page-content" role="main" aria-label="Observability services content">
        {/* Empty — awaiting build prompt */}
      </div>
    </>
  );
};

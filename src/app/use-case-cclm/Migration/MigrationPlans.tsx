import React from 'react';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateActions,
  Button,
  Title,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';

const MigrationPlans: React.FunctionComponent = () => {
  useDocumentTitle('Migration plans');
  const navigate = useNavigate();

  return (
    <div className="migration-plans-page-container">
      {/* Header section */}
      <div className="page-header-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title headingLevel="h1" size="2xl">
            Migration plans
          </Title>
          <Button variant="primary" onClick={() => navigate('/virtualization/migration/create')}>
            Create migration plan
          </Button>
        </div>
      </div>

      {/* Content section */}
      <div className="page-content-section">
        <EmptyState>
          <PlusCircleIcon style={{ fontSize: '48px', color: 'var(--pf-t--global--icon--color--subtle)', marginBottom: '16px' }} />
          <Title headingLevel="h2" size="lg">
            No migration plans
          </Title>
          <EmptyStateBody>
            Create a migration plan to move virtualization workloads from source to target clusters.
          </EmptyStateBody>
          <EmptyStateActions>
            <Button variant="primary" onClick={() => navigate('/virtualization/migration/create')}>
              Create migration plan
            </Button>
          </EmptyStateActions>
        </EmptyState>
      </div>
    </div>
  );
};

export { MigrationPlans };


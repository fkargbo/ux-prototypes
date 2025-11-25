import * as React from 'react';
import { PageSection } from '@patternfly/react-core';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';

const Dashboard: React.FunctionComponent = () => {
  useDocumentTitle('ACM RBAC | Dashboard');

  return (
    <PageSection>
    </PageSection>
  );
};

export { Dashboard };

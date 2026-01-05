import React from 'react';
import { Title, Content } from '@patternfly/react-core';

/**
 * Step 1: Installation Details
 * 
 * This step is kept empty for this iteration as per UX requirements.
 */
export const Step1InstallationDetails: React.FC = () => {
  return (
    <div style={{ maxWidth: '600px' }}>
      <Title headingLevel="h2" size="2xl" style={{ fontSize: '24px', marginBottom: '16px' }}>
        Installation Details
      </Title>
      <Content>
        This step will be implemented in a future iteration.
      </Content>
    </div>
  );
};


import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Flex, FlexItem } from '@patternfly/react-core';
import { ArrowLeftIcon, InfoCircleIcon } from '@patternfly/react-icons';
import { useUseCaseContext } from '@app/contexts/UseCaseContext';

export const UseCaseBanner: React.FC = () => {
  const navigate = useNavigate();
  const { useCase, setUseCase, useCaseTitle, useCasePersona } = useUseCaseContext();

  if (!useCase) {
    return null;
  }

  const handleBack = () => {
    setUseCase(null);
    navigate('/');
  };

  const bannerColor = useCase === 'use-case-1' ? '#667eea' : '#764ba2';
  
  const getBannerText = () => {
    if (useCase === 'use-case-1') {
      return 'Prototype mode: Use case 1: Fleet admin - Tenant delegation';
    } else if (useCase === 'use-case-2') {
      return 'Prototype mode: Use case 2: Tenant admin - Project access';
    }
    return `Demo Mode: ${useCaseTitle}`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '48px',
        backgroundColor: bannerColor,
        color: '#ffffff',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      }}
    >
      <Flex alignItems={{ default: 'alignItemsCenter' }} style={{ width: '100%' }}>
        <FlexItem>
          <InfoCircleIcon style={{ marginRight: '12px', fontSize: '18px' }} />
        </FlexItem>
        <FlexItem style={{ fontWeight: 600, fontSize: '15px' }}>
          {getBannerText()}
        </FlexItem>
        <FlexItem align={{ default: 'alignRight' }} style={{ marginLeft: 'auto' }}>
          <Button
            variant="link"
            onClick={handleBack}
            icon={<ArrowLeftIcon />}
            style={{
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Back to prototypes page
          </Button>
        </FlexItem>
      </Flex>
    </div>
  );
};


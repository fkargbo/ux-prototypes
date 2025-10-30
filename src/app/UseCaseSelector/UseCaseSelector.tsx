import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Button,
  Title,
  Content,
  Grid,
  GridItem,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { ArrowRightIcon } from '@patternfly/react-icons';
import { useUseCaseContext } from '@app/contexts/UseCaseContext';

export const UseCaseSelector: React.FC = () => {
  const navigate = useNavigate();
  const { setUseCase } = useUseCaseContext();

  const handleUseCaseSelect = (useCaseId: 'use-case-1' | 'use-case-2') => {
    setUseCase(useCaseId);
    navigate('/clusters');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <div style={{ maxWidth: '1200px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Title headingLevel="h1" size="4xl" style={{ color: '#ffffff', marginBottom: '16px' }}>
            Advanced Cluster Management (ACM)
          </Title>
          <Title headingLevel="h2" size="2xl" style={{ color: '#e0e7ff', marginBottom: '24px' }}>
            RBAC Demo - Use Case Selector
          </Title>
          <Content component="p" style={{ color: '#e0e7ff', fontSize: '18px', maxWidth: '700px', margin: '0 auto' }}>
            Select a use case to explore role-based access control in a multi-tenant environment
          </Content>
        </div>

        <Grid hasGutter>
          <GridItem span={12}>
            <Card
              isCompact
              style={{
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
              }}
            >
              <CardBody>
                <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                  <FlexItem>
                    <Title headingLevel="h3" size="xl" style={{ marginBottom: '8px' }}>
                      ACM RBAC Use case 1:
                    </Title>
                    <Content component="p" style={{ color: '#6a6e73', fontSize: '16px', margin: 0 }}>
                      Fleet admin → Tenant delegation.
                    </Content>
                  </FlexItem>
                  <FlexItem>
                    <Button
                      variant="primary"
                      onClick={() => handleUseCaseSelect('use-case-1')}
                      icon={<ArrowRightIcon />}
                      iconPosition="end"
                    >
                      Start use case
                    </Button>
                  </FlexItem>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem span={12}>
            <Card
              isCompact
              style={{
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
              }}
            >
              <CardBody>
                <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                  <FlexItem>
                    <Title headingLevel="h3" size="xl" style={{ marginBottom: '8px' }}>
                      ACM RBAC Use case 2:
                    </Title>
                    <Content component="p" style={{ color: '#6a6e73', fontSize: '16px', margin: 0 }}>
                      Tenant admin → Project access.
                    </Content>
                  </FlexItem>
                  <FlexItem>
                    <Button
                      variant="primary"
                      onClick={() => handleUseCaseSelect('use-case-2')}
                      icon={<ArrowRightIcon />}
                      iconPosition="end"
                    >
                      Start use case
                    </Button>
                  </FlexItem>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </div>
    </div>
  );
};


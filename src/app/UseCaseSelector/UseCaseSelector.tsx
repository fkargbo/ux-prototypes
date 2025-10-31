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
import { useUseCaseContext } from '@app/contexts/UseCaseContext';

export const UseCaseSelector: React.FC = () => {
  const navigate = useNavigate();
  const { setUseCase } = useUseCaseContext();

  const handleUseCaseSelect = (useCaseId: 'use-case-1' | 'use-case-2' | 'use-case-aaq' | 'use-case-cclm') => {
    setUseCase(useCaseId);
    // Navigate to appropriate starting page based on use case
    if (useCaseId === 'use-case-aaq') {
      navigate('/core/virtualization/overview');
    } else if (useCaseId === 'use-case-cclm') {
      navigate('/virtualization/virtual-machines');
    } else {
      navigate('/clusters');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f5f5',
        padding: '40px 64px',
      }}
    >
      <div style={{ maxWidth: '1200px', width: '100%' }}>
        <div style={{ textAlign: 'left', marginBottom: '48px' }}>
          <Title headingLevel="h1" size="4xl" style={{ color: '#000000', marginBottom: '16px' }}>
            Welcome to UX prototypes
          </Title>
          <Content component="p" style={{ color: '#000000', fontSize: '18px', maxWidth: '700px' }}>
            Select a prototype to explore
          </Content>
        </div>

        <Grid hasGutter>
          <GridItem span={6}>
            <Title headingLevel="h2" size="xl" style={{ color: '#000000', marginBottom: '24px' }}>
              ACM RBAC
            </Title>
            <Grid hasGutter>
              <GridItem span={12}>
            <Card
              isCompact
              style={{
                maxWidth: '600px',
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
                <Flex alignItems={{ default: 'alignItemsCenter' }}>
                  <FlexItem flex={{ default: 'flex_1' }}>
                    <Title headingLevel="h3" size="xl" style={{ marginBottom: '8px' }}>
                      Use case 1:
                    </Title>
                    <Content component="p" style={{ color: '#6a6e73', fontSize: '16px', margin: 0 }}>
                      Fleet admin → Tenant delegation.
                    </Content>
                  </FlexItem>
                  <FlexItem style={{ marginLeft: '16px' }}>
                    <Button
                      variant="primary"
                      onClick={() => handleUseCaseSelect('use-case-1')}
                    >
                      Explore
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
                    maxWidth: '600px',
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
                    <Flex alignItems={{ default: 'alignItemsCenter' }}>
                      <FlexItem flex={{ default: 'flex_1' }}>
                        <Title headingLevel="h3" size="xl" style={{ marginBottom: '8px' }}>
                          Use case 2:
                        </Title>
                        <Content component="p" style={{ color: '#6a6e73', fontSize: '16px', margin: 0 }}>
                          Tenant admin → Project access.
                        </Content>
                      </FlexItem>
                      <FlexItem style={{ marginLeft: '16px' }}>
                        <Button
                          variant="primary"
                          onClick={() => handleUseCaseSelect('use-case-2')}
                        >
                          Explore
                        </Button>
                      </FlexItem>
                    </Flex>
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          </GridItem>

          <GridItem span={6}>
            <Title headingLevel="h2" size="xl" style={{ color: '#000000', marginBottom: '24px' }}>
              Application Aware Quota
            </Title>
            <Grid hasGutter>
              <GridItem span={12}>
                <Card
                  isCompact
                  style={{
                    maxWidth: '600px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                >
                  <CardBody>
                    <Flex alignItems={{ default: 'alignItemsCenter' }}>
                      <FlexItem flex={{ default: 'flex_1' }}>
                        <Title headingLevel="h3" size="xl" style={{ marginBottom: '8px' }}>
                          AAQ
                        </Title>
                        <Content component="p" style={{ color: '#6a6e73', fontSize: '16px', margin: 0 }}>
                          AAQ operator quota management experience
                        </Content>
                      </FlexItem>
                  <FlexItem style={{ marginLeft: '16px' }}>
                    <Button
                      variant="primary"
                      onClick={() => handleUseCaseSelect('use-case-aaq')}
                    >
                      Explore
                    </Button>
                  </FlexItem>
                    </Flex>
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          </GridItem>
        </Grid>

        {/* ACM Cross cluster live migration section */}
        <Grid hasGutter style={{ marginTop: '48px' }}>
          <GridItem span={6}>
            <Title headingLevel="h2" size="xl" style={{ color: '#000000', marginBottom: '24px' }}>
              ACM Cross cluster live migration
            </Title>
            <Grid hasGutter>
              <GridItem span={12}>
                <Card
                  isCompact
                  style={{
                    maxWidth: '600px',
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
                    <Flex alignItems={{ default: 'alignItemsCenter' }}>
                      <FlexItem flex={{ default: 'flex_1' }}>
                        <Title headingLevel="h3" size="xl" style={{ marginBottom: '8px' }}>
                          Cross cluster live migration
                        </Title>
                        <Content component="p" style={{ color: '#6a6e73', fontSize: '16px', margin: 0 }}>
                          Live migrate VMs across clusters
                        </Content>
                      </FlexItem>
                      <FlexItem style={{ marginLeft: '16px' }}>
                        <Button
                          variant="primary"
                          onClick={() => handleUseCaseSelect('use-case-cclm')}
                        >
                          Explore
                        </Button>
                      </FlexItem>
                    </Flex>
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          </GridItem>
        </Grid>
      </div>
    </div>
  );
};


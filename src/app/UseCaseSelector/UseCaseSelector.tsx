import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardFooter,
  Button,
  Title,
  Content,
  Grid,
  GridItem,
  List,
  ListItem,
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
          <GridItem span={6}>
            <Card
              isFullHeight
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
              <CardHeader>
                <CardTitle>
                  <Title headingLevel="h3" size="xl">
                    ACMsRBACUseCase1
                  </Title>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Title headingLevel="h4" size="lg" style={{ marginBottom: '16px', color: '#667eea' }}>
                  Fleet Admin - Tenant Delegation
                </Title>
                <Content component="p" style={{ marginBottom: '16px', color: '#6a6e73' }}>
                  As Adrien Veidt (Fleet Admin) with global access to all 10 cluster sets, delegate tenant admin 
                  access to Walter Joseph Kovacs for 5 specific cluster sets.
                </Content>
                <div style={{ marginTop: '24px' }}>
                  <Content component="p" style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>
                    Scenario:
                  </Content>
                  <List isPlain>
                    <ListItem>
                      <span style={{ color: '#6a6e73' }}>• Fleet Admin oversees 10 cluster sets</span>
                    </ListItem>
                    <ListItem>
                      <span style={{ color: '#6a6e73' }}>• Delegate 5 cluster sets to a tenant admin</span>
                    </ListItem>
                    <ListItem>
                      <span style={{ color: '#6a6e73' }}>• Demonstrate hierarchical access control</span>
                    </ListItem>
                  </List>
                </div>
                <div style={{ marginTop: '24px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                  <Content component="p" style={{ fontSize: '13px', color: '#6a6e73', margin: 0 }}>
                    <strong>Persona:</strong> Adrien Veidt (Fleet Admin)
                  </Content>
                  <Content component="p" style={{ fontSize: '13px', color: '#6a6e73', margin: '4px 0 0 0' }}>
                    <strong>Scope:</strong> Global (10 cluster sets)
                  </Content>
                </div>
              </CardBody>
              <CardFooter>
                <Button
                  variant="primary"
                  isBlock
                  onClick={() => handleUseCaseSelect('use-case-1')}
                  icon={<ArrowRightIcon />}
                  iconPosition="end"
                >
                  Enter ACMsRBACUseCase1
                </Button>
              </CardFooter>
            </Card>
          </GridItem>

          <GridItem span={6}>
            <Card
              isFullHeight
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
              <CardHeader>
                <CardTitle>
                  <Title headingLevel="h3" size="xl">
                    ACMsRBACUseCase2
                  </Title>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Title headingLevel="h4" size="lg" style={{ marginBottom: '16px', color: '#764ba2' }}>
                  Tenant Admin - Project Access
                </Title>
                <Content component="p" style={{ marginBottom: '16px', color: '#6a6e73' }}>
                  As Walter Joseph Kovacs (Tenant Admin) overseeing 5 cluster sets, grant dev and manager groups
                  access to a new project spanning two clusters.
                </Content>
                <div style={{ marginTop: '24px' }}>
                  <Content component="p" style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>
                    Scenario:
                  </Content>
                  <List isPlain>
                    <ListItem>
                      <span style={{ color: '#6a6e73' }}>• Tenant Admin manages 5 cluster sets</span>
                    </ListItem>
                    <ListItem>
                      <span style={{ color: '#6a6e73' }}>• Create project-level permissions</span>
                    </ListItem>
                    <ListItem>
                      <span style={{ color: '#6a6e73' }}>• Grant access to dev and manager groups</span>
                    </ListItem>
                  </List>
                </div>
                <div style={{ marginTop: '24px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                  <Content component="p" style={{ fontSize: '13px', color: '#6a6e73', margin: 0 }}>
                    <strong>Persona:</strong> Walter Joseph Kovacs
                  </Content>
                  <Content component="p" style={{ fontSize: '13px', color: '#6a6e73', margin: '4px 0 0 0' }}>
                    <strong>Scope:</strong> Tenant (5 cluster sets)
                  </Content>
                </div>
              </CardBody>
              <CardFooter>
                <Button
                  variant="primary"
                  isBlock
                  onClick={() => handleUseCaseSelect('use-case-2')}
                  icon={<ArrowRightIcon />}
                  iconPosition="end"
                >
                  Enter ACMsRBACUseCase2
                </Button>
              </CardFooter>
            </Card>
          </GridItem>
        </Grid>
      </div>
    </div>
  );
};


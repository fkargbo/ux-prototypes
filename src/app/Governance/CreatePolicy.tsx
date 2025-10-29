import * as React from 'react';
import {
  Wizard,
  WizardStep,
  WizardHeader,
  WizardFooter,
  Button,
  Form,
  FormGroup,
  TextInput,
  TextArea,
  Breadcrumb,
  BreadcrumbItem,
  Title,
  Content,
  PageSection,
} from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';

const CreatePolicy: React.FunctionComponent = () => {
  useDocumentTitle('ACM RBAC | Create Policy');
  const navigate = useNavigate();

  const [policyName, setPolicyName] = React.useState('');
  const [policyDescription, setPolicyDescription] = React.useState('');
  const [namespace, setNamespace] = React.useState('');
  const [severity, setSeverity] = React.useState('');
  const [remediation, setRemediation] = React.useState('inform');

  const onClose = () => {
    navigate('/governance');
  };

  const onSave = () => {
    console.log('Creating policy:', {
      policyName,
      policyDescription,
      namespace,
      severity,
      remediation,
    });
    navigate('/governance');
  };

  // Details step
  const detailsStep: WizardStep = {
    id: 'details',
    name: 'Details',
    component: (
      <Form isWidthLimited>
        <FormGroup label="Name" isRequired fieldId="policy-name">
          <TextInput
            isRequired
            type="text"
            id="policy-name"
            name="policy-name"
            value={policyName}
            onChange={(_event, value) => setPolicyName(value)}
          />
        </FormGroup>
        <FormGroup label="Description" fieldId="policy-description">
          <TextArea
            type="text"
            id="policy-description"
            name="policy-description"
            value={policyDescription}
            onChange={(_event, value) => setPolicyDescription(value)}
            rows={4}
          />
        </FormGroup>
        <FormGroup label="Namespace" isRequired fieldId="policy-namespace">
          <TextInput
            isRequired
            type="text"
            id="policy-namespace"
            name="policy-namespace"
            value={namespace}
            onChange={(_event, value) => setNamespace(value)}
            placeholder="e.g., default"
          />
        </FormGroup>
      </Form>
    ),
  };

  // Configuration step
  const configurationStep: WizardStep = {
    id: 'configuration',
    name: 'Configuration',
    steps: [
      {
        id: 'config-substep-a',
        name: 'Policy template',
        component: (
          <Form isWidthLimited>
            <FormGroup label="Template type" fieldId="template-type">
              <TextInput
                type="text"
                id="template-type"
                name="template-type"
                placeholder="Select a policy template"
              />
            </FormGroup>
            <FormGroup label="API version" fieldId="api-version">
              <TextInput
                type="text"
                id="api-version"
                name="api-version"
                placeholder="policy.open-cluster-management.io/v1"
              />
            </FormGroup>
          </Form>
        ),
      },
      {
        id: 'config-substep-b',
        name: 'Specifications',
        component: (
          <Form isWidthLimited>
            <FormGroup label="Remediation" isRequired fieldId="remediation">
              <TextInput
                isRequired
                type="text"
                id="remediation"
                name="remediation"
                value={remediation}
                onChange={(_event, value) => setRemediation(value)}
                placeholder="inform or enforce"
              />
            </FormGroup>
            <FormGroup label="Severity" fieldId="severity">
              <TextInput
                type="text"
                id="severity"
                name="severity"
                value={severity}
                onChange={(_event, value) => setSeverity(value)}
                placeholder="low, medium, high, critical"
              />
            </FormGroup>
          </Form>
        ),
      },
      {
        id: 'config-substep-c',
        name: 'Placement',
        component: (
          <Form isWidthLimited>
            <FormGroup label="Cluster selector" fieldId="cluster-selector">
              <TextInput
                type="text"
                id="cluster-selector"
                name="cluster-selector"
                placeholder="Select clusters or cluster sets"
              />
            </FormGroup>
            <FormGroup label="Label selector" fieldId="label-selector">
              <TextInput
                type="text"
                id="label-selector"
                name="label-selector"
                placeholder="key=value"
              />
            </FormGroup>
          </Form>
        ),
      },
    ],
  };

  // Additional step
  const additionalStep: WizardStep = {
    id: 'additional',
    name: 'Additional',
    component: (
      <Form isWidthLimited>
        <FormGroup label="Annotations" fieldId="annotations">
          <TextArea
            id="annotations"
            name="annotations"
            rows={4}
            placeholder="key: value"
          />
        </FormGroup>
        <FormGroup label="Labels" fieldId="labels">
          <TextArea
            id="labels"
            name="labels"
            rows={4}
            placeholder="key: value"
          />
        </FormGroup>
      </Form>
    ),
  };

  // Review step
  const reviewStep: WizardStep = {
    id: 'review',
    name: 'Review',
    component: (
      <div>
        <Title headingLevel="h2" size="xl" style={{ marginBottom: '16px' }}>
          Review policy
        </Title>
        <Content component="p" style={{ marginBottom: '24px', color: '#6a6e73' }}>
          Review the policy configuration before creating it.
        </Content>

        <div style={{ marginBottom: '24px' }}>
          <Title headingLevel="h3" size="md" style={{ marginBottom: '8px' }}>
            Details
          </Title>
          <dl style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '8px', fontSize: '14px' }}>
            <dt style={{ fontWeight: 600 }}>Name:</dt>
            <dd>{policyName || '—'}</dd>
            <dt style={{ fontWeight: 600 }}>Description:</dt>
            <dd>{policyDescription || '—'}</dd>
            <dt style={{ fontWeight: 600 }}>Namespace:</dt>
            <dd>{namespace || '—'}</dd>
          </dl>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <Title headingLevel="h3" size="md" style={{ marginBottom: '8px' }}>
            Configuration
          </Title>
          <dl style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '8px', fontSize: '14px' }}>
            <dt style={{ fontWeight: 600 }}>Remediation:</dt>
            <dd>{remediation || '—'}</dd>
            <dt style={{ fontWeight: 600 }}>Severity:</dt>
            <dd>{severity || '—'}</dd>
          </dl>
        </div>
      </div>
    ),
  };

  const steps: WizardStep[] = [
    detailsStep,
    configurationStep,
    additionalStep,
    reviewStep,
  ];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PageSection variant="light" style={{ paddingTop: '16px', paddingBottom: '16px' }}>
        <Breadcrumb>
          <BreadcrumbItem to="#" onClick={(e) => { e.preventDefault(); navigate('/governance'); }}>
            Governance
          </BreadcrumbItem>
          <BreadcrumbItem to="#" onClick={(e) => { e.preventDefault(); navigate('/governance'); }}>
            Policies
          </BreadcrumbItem>
          <BreadcrumbItem isActive>Create policy</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>

      <PageSection variant="light" style={{ paddingTop: '16px', paddingBottom: '24px' }}>
        <Title headingLevel="h1" size="2xl">
          Create policy
        </Title>
        <Content component="p" style={{ marginTop: '8px', color: '#6a6e73' }}>
          Create a new governance policy to enforce compliance across your clusters.
        </Content>
      </PageSection>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Wizard
          height="100%"
          steps={steps}
          onClose={onClose}
          onSave={onSave}
          header={
            <WizardHeader
              onClose={onClose}
              title="Create policy"
              description="Configure your governance policy"
            />
          }
          footer={
            <WizardFooter>
              {({ activeStep, onNext, onBack, onClose, isBackDisabled, isNextDisabled }) => (
                <>
                  <Button
                    variant="secondary"
                    onClick={onBack}
                    isDisabled={isBackDisabled}
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    onClick={activeStep.name === 'Review' ? onSave : onNext}
                    isDisabled={isNextDisabled}
                  >
                    {activeStep.name === 'Review' ? 'Create' : 'Next'}
                  </Button>
                  <Button variant="link" onClick={onClose}>
                    Cancel
                  </Button>
                </>
              )}
            </WizardFooter>
          }
        />
      </div>
    </div>
  );
};

export { CreatePolicy };


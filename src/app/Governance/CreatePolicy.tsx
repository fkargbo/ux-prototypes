import * as React from 'react';
import {
  Button,
  Form,
  FormGroup,
  TextInput,
  TextArea,
  Breadcrumb,
  BreadcrumbItem,
  Title,
  Content,
  ActionList,
  ActionListItem,
} from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';

const CreatePolicy: React.FunctionComponent = () => {
  useDocumentTitle('ACM RBAC | Create Policy');
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = React.useState(1);

  const [policyName, setPolicyName] = React.useState('');
  const [policyDescription, setPolicyDescription] = React.useState('');
  const [namespace, setNamespace] = React.useState('');
  const [templateType, setTemplateType] = React.useState('');
  const [apiVersion, setApiVersion] = React.useState('');
  const [clusterSelector, setClusterSelector] = React.useState('');
  const [labelSelector, setLabelSelector] = React.useState('');
  const [annotations, setAnnotations] = React.useState('');
  const [labels, setLabels] = React.useState('');

  const onClose = () => {
    navigate('/governance');
  };

  const onSave = () => {
    console.log('Creating policy:', {
      policyName,
      policyDescription,
      namespace,
      templateType,
      apiVersion,
      clusterSelector,
      labelSelector,
      annotations,
      labels,
    });
    navigate('/governance');
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getCurrentStepName = () => {
    if (currentStep === 1) return 'Details';
    if (currentStep === 2) return 'Policy templates';
    if (currentStep === 3) return 'Placement';
    if (currentStep === 4) return 'Policy annotations';
    if (currentStep === 5) return 'Review';
    return '';
  };

  const renderStepContent = () => {
    // Step 1: Details
    if (currentStep === 1) {
      return (
        <Form>
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
      );
    }

    // Step 2: Policy templates
    if (currentStep === 2) {
      return (
        <Form>
          <FormGroup label="Template type" fieldId="template-type">
            <TextInput
              type="text"
              id="template-type"
              name="template-type"
              value={templateType}
              onChange={(_event, value) => setTemplateType(value)}
              placeholder="Select a policy template"
            />
          </FormGroup>
          <FormGroup label="API version" fieldId="api-version">
            <TextInput
              type="text"
              id="api-version"
              name="api-version"
              value={apiVersion}
              onChange={(_event, value) => setApiVersion(value)}
              placeholder="policy.open-cluster-management.io/v1"
            />
          </FormGroup>
        </Form>
      );
    }

    // Step 3: Placement
    if (currentStep === 3) {
      return (
        <Form>
          <FormGroup label="Cluster selector" fieldId="cluster-selector">
            <TextInput
              type="text"
              id="cluster-selector"
              name="cluster-selector"
              value={clusterSelector}
              onChange={(_event, value) => setClusterSelector(value)}
              placeholder="Select clusters or cluster sets"
            />
          </FormGroup>
          <FormGroup label="Label selector" fieldId="label-selector">
            <TextInput
              type="text"
              id="label-selector"
              name="label-selector"
              value={labelSelector}
              onChange={(_event, value) => setLabelSelector(value)}
              placeholder="key=value"
            />
          </FormGroup>
        </Form>
      );
    }

    // Step 4: Policy annotations
    if (currentStep === 4) {
      return (
        <Form>
          <FormGroup label="Annotations" fieldId="annotations">
            <TextArea
              id="annotations"
              name="annotations"
              value={annotations}
              onChange={(_event, value) => setAnnotations(value)}
              rows={4}
              placeholder="key: value"
            />
          </FormGroup>
          <FormGroup label="Labels" fieldId="labels">
            <TextArea
              id="labels"
              name="labels"
              value={labels}
              onChange={(_event, value) => setLabels(value)}
              rows={4}
              placeholder="key: value"
            />
          </FormGroup>
        </Form>
      );
    }

    // Step 5: Review
    if (currentStep === 5) {
      return (
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
              Policy templates
            </Title>
            <dl style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '8px', fontSize: '14px' }}>
              <dt style={{ fontWeight: 600 }}>Template type:</dt>
              <dd>{templateType || '—'}</dd>
              <dt style={{ fontWeight: 600 }}>API version:</dt>
              <dd>{apiVersion || '—'}</dd>
            </dl>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <Title headingLevel="h3" size="md" style={{ marginBottom: '8px' }}>
              Placement
            </Title>
            <dl style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '8px', fontSize: '14px' }}>
              <dt style={{ fontWeight: 600 }}>Cluster selector:</dt>
              <dd>{clusterSelector || '—'}</dd>
              <dt style={{ fontWeight: 600 }}>Label selector:</dt>
              <dd>{labelSelector || '—'}</dd>
            </dl>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <Title headingLevel="h3" size="md" style={{ marginBottom: '8px' }}>
              Policy annotations
            </Title>
            <dl style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '8px', fontSize: '14px' }}>
              <dt style={{ fontWeight: 600 }}>Annotations:</dt>
              <dd>{annotations || '—'}</dd>
              <dt style={{ fontWeight: 600 }}>Labels:</dt>
              <dd>{labels || '—'}</dd>
            </dl>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Breadcrumb section */}
      <div className="create-policy-breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem to="#" onClick={(e) => { e.preventDefault(); navigate('/governance'); }}>
            Governance
          </BreadcrumbItem>
          <BreadcrumbItem to="#" onClick={(e) => { e.preventDefault(); navigate('/governance'); }}>
            Policies
          </BreadcrumbItem>
          <BreadcrumbItem isActive>Create policy</BreadcrumbItem>
        </Breadcrumb>
      </div>

      {/* Page header with title and description */}
      <div className="create-policy-header">
        <Title headingLevel="h1" size="2xl">
          Create policy
        </Title>
        <Content component="p" style={{ marginTop: '8px', color: '#6a6e73' }}>
          A policy generates reports and validates cluster violations based on specified security standards, categories, and controls.
        </Content>
      </div>

      {/* Wizard content */}
      <div style={{ flex: 1, overflow: 'hidden', backgroundColor: '#ffffff' }}>
        <div className="pf-v6-c-wizard">
          {/* Mobile toggle button (hidden on desktop) */}
          <button
            aria-label="Wizard Header Toggle"
            className="pf-v6-c-wizard__toggle"
            aria-expanded="false"
            style={{ display: 'none' }}
          >
            <span className="pf-v6-c-wizard__toggle-list">
              <span className="pf-v6-c-wizard__toggle-list-item">
                <span className="pf-v6-c-wizard__toggle-num">{currentStep}</span>
                {getCurrentStepName()}
              </span>
            </span>
          </button>

          <div className="pf-v6-c-wizard__outer-wrap">
            <div className="pf-v6-c-wizard__inner-wrap">
              {/* Navigation sidebar */}
              <nav className="pf-v6-c-wizard__nav" aria-label="Steps">
                <ol className="pf-v6-c-wizard__nav-list" role="list">
                  <li className="pf-v6-c-wizard__nav-item">
                    <button
                      className={`pf-v6-c-wizard__nav-link ${currentStep === 1 ? 'pf-m-current' : ''}`}
                      type="button"
                      onClick={() => handleStepClick(1)}
                    >
                      <span className="pf-v6-c-wizard__nav-link-main">
                        <span className="pf-v6-c-wizard__nav-link-text">Details</span>
                      </span>
                    </button>
                  </li>

                  <li className="pf-v6-c-wizard__nav-item">
                    <button
                      className={`pf-v6-c-wizard__nav-link ${currentStep === 2 ? 'pf-m-current' : ''}`}
                      type="button"
                      onClick={() => handleStepClick(2)}
                    >
                      <span className="pf-v6-c-wizard__nav-link-main">
                        <span className="pf-v6-c-wizard__nav-link-text">Policy templates</span>
                      </span>
                    </button>
                  </li>

                  <li className="pf-v6-c-wizard__nav-item">
                    <button
                      className={`pf-v6-c-wizard__nav-link ${currentStep === 3 ? 'pf-m-current' : ''}`}
                      type="button"
                      onClick={() => handleStepClick(3)}
                    >
                      <span className="pf-v6-c-wizard__nav-link-main">
                        <span className="pf-v6-c-wizard__nav-link-text">Placement</span>
                      </span>
                    </button>
                  </li>

                  <li className="pf-v6-c-wizard__nav-item">
                    <button
                      className={`pf-v6-c-wizard__nav-link ${currentStep === 4 ? 'pf-m-current' : ''}`}
                      type="button"
                      onClick={() => handleStepClick(4)}
                    >
                      <span className="pf-v6-c-wizard__nav-link-main">
                        <span className="pf-v6-c-wizard__nav-link-text">Policy annotations</span>
                      </span>
                    </button>
                  </li>

                  <li className="pf-v6-c-wizard__nav-item">
                    <button
                      className={`pf-v6-c-wizard__nav-link ${currentStep === 5 ? 'pf-m-current' : ''} ${currentStep < 5 ? 'pf-m-disabled' : ''}`}
                      type="button"
                      onClick={() => currentStep >= 5 && handleStepClick(5)}
                      aria-disabled={currentStep < 5}
                      tabIndex={currentStep < 5 ? -1 : 0}
                    >
                      <span className="pf-v6-c-wizard__nav-link-main">
                        <span className="pf-v6-c-wizard__nav-link-text">Review</span>
                      </span>
                    </button>
                  </li>
                </ol>
              </nav>

              {/* Main content area */}
              <div className="pf-v6-c-wizard__main">
                <div className="pf-v6-c-wizard__main-body">
                  {renderStepContent()}
                </div>
              </div>
            </div>

            {/* Footer with buttons */}
            <footer className="pf-v6-c-wizard__footer">
              <ActionList>
                <ActionListItem>
                  <Button
                    variant="secondary"
                    onClick={handleBack}
                    isDisabled={currentStep === 1}
                  >
                    Back
                  </Button>
                </ActionListItem>
                <ActionListItem>
                  <Button
                    variant="primary"
                    onClick={currentStep === 5 ? onSave : handleNext}
                  >
                    {currentStep === 5 ? 'Create' : 'Next'}
                  </Button>
                </ActionListItem>
                <ActionListItem>
                  <Button variant="link" onClick={onClose}>
                    Cancel
                  </Button>
                </ActionListItem>
              </ActionList>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export { CreatePolicy };

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
import { AngleRightIcon } from '@patternfly/react-icons';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';

const CreatePolicy: React.FunctionComponent = () => {
  useDocumentTitle('ACM RBAC | Create Policy');
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = React.useState(1);
  const [currentSubstep, setCurrentSubstep] = React.useState<number | null>(null);
  const [isStep2Expanded, setIsStep2Expanded] = React.useState(false);

  const [policyName, setPolicyName] = React.useState('');
  const [policyDescription, setPolicyDescription] = React.useState('');
  const [namespace, setNamespace] = React.useState('');
  const [templateType, setTemplateType] = React.useState('');
  const [apiVersion, setApiVersion] = React.useState('');
  const [remediation, setRemediation] = React.useState('inform');
  const [severity, setSeverity] = React.useState('');
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
      remediation,
      severity,
    });
    navigate('/governance');
  };

  const handleStepClick = (step: number) => {
    if (step === 2) {
      setIsStep2Expanded(!isStep2Expanded);
      if (!isStep2Expanded) {
        setCurrentStep(2);
        setCurrentSubstep(1);
      }
    } else {
      setCurrentStep(step);
      setCurrentSubstep(null);
      setIsStep2Expanded(false);
    }
  };

  const handleSubstepClick = (substep: number) => {
    setCurrentStep(2);
    setCurrentSubstep(substep);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      setCurrentSubstep(1);
      setIsStep2Expanded(true);
    } else if (currentStep === 2 && currentSubstep !== null) {
      if (currentSubstep < 3) {
        setCurrentSubstep(currentSubstep + 1);
      } else {
        setCurrentStep(3);
        setCurrentSubstep(null);
        setIsStep2Expanded(false);
      }
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    if (currentStep === 2 && currentSubstep !== null) {
      if (currentSubstep > 1) {
        setCurrentSubstep(currentSubstep - 1);
      } else {
        setCurrentStep(1);
        setCurrentSubstep(null);
        setIsStep2Expanded(false);
      }
    } else if (currentStep === 3) {
      setCurrentStep(2);
      setCurrentSubstep(3);
      setIsStep2Expanded(true);
    } else if (currentStep === 4) {
      setCurrentStep(3);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getCurrentStepName = () => {
    if (currentStep === 1) return 'Details';
    if (currentStep === 2) {
      if (currentSubstep === 1) return 'Policy template';
      if (currentSubstep === 2) return 'Specifications';
      if (currentSubstep === 3) return 'Placement';
    }
    if (currentStep === 3) return 'Additional';
    if (currentStep === 4) return 'Review';
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

    // Step 2: Configuration substeps
    if (currentStep === 2) {
      if (currentSubstep === 1) {
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
      if (currentSubstep === 2) {
        return (
          <Form>
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
        );
      }
      if (currentSubstep === 3) {
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
    }

    // Step 3: Additional
    if (currentStep === 3) {
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

    // Step 4: Review
    if (currentStep === 4) {
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
      );
    }

    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header area with breadcrumb, title and description */}
      <header style={{ 
        backgroundColor: '#ffffff', 
        padding: '24px',
        borderBottom: '1px solid #d2d2d2'
      }}>
        <Breadcrumb style={{ marginBottom: '16px' }}>
          <BreadcrumbItem to="#" onClick={(e) => { e.preventDefault(); navigate('/governance'); }}>
            Governance
          </BreadcrumbItem>
          <BreadcrumbItem to="#" onClick={(e) => { e.preventDefault(); navigate('/governance'); }}>
            Policies
          </BreadcrumbItem>
          <BreadcrumbItem isActive>Create policy</BreadcrumbItem>
        </Breadcrumb>
        
        <Title headingLevel="h1" size="2xl">
          Create policy
        </Title>
        <Content component="p" style={{ marginTop: '8px', color: '#6a6e73' }}>
          Create a new governance policy to enforce compliance across your clusters.
        </Content>
      </header>

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

                  <li className={`pf-v6-c-wizard__nav-item pf-m-expandable ${isStep2Expanded ? 'pf-m-expanded' : ''}`}>
                    <button
                      className={`pf-v6-c-wizard__nav-link ${currentStep === 2 ? 'pf-m-current' : ''}`}
                      type="button"
                      aria-expanded={isStep2Expanded}
                      onClick={() => handleStepClick(2)}
                    >
                      <span className="pf-v6-c-wizard__nav-link-main">
                        <span className="pf-v6-c-wizard__nav-link-text">Configuration</span>
                        <span className="pf-v6-c-wizard__nav-link-toggle">
                          <span className="pf-v6-c-wizard__nav-link-toggle-icon">
                            <AngleRightIcon />
                          </span>
                        </span>
                      </span>
                    </button>

                    {isStep2Expanded && (
                      <ol className="pf-v6-c-wizard__nav-list" role="list">
                        <li className="pf-v6-c-wizard__nav-item">
                          <button
                            className={`pf-v6-c-wizard__nav-link ${currentStep === 2 && currentSubstep === 1 ? 'pf-m-current' : ''}`}
                            type="button"
                            onClick={() => handleSubstepClick(1)}
                          >
                            <span className="pf-v6-c-wizard__nav-link-main">
                              <span className="pf-v6-c-wizard__nav-link-text">Policy template</span>
                            </span>
                          </button>
                        </li>
                        <li className="pf-v6-c-wizard__nav-item">
                          <button
                            className={`pf-v6-c-wizard__nav-link ${currentStep === 2 && currentSubstep === 2 ? 'pf-m-current' : ''}`}
                            type="button"
                            onClick={() => handleSubstepClick(2)}
                          >
                            <span className="pf-v6-c-wizard__nav-link-main">
                              <span className="pf-v6-c-wizard__nav-link-text">Specifications</span>
                            </span>
                          </button>
                        </li>
                        <li className="pf-v6-c-wizard__nav-item">
                          <button
                            className={`pf-v6-c-wizard__nav-link ${currentStep === 2 && currentSubstep === 3 ? 'pf-m-current' : ''}`}
                            type="button"
                            onClick={() => handleSubstepClick(3)}
                          >
                            <span className="pf-v6-c-wizard__nav-link-main">
                              <span className="pf-v6-c-wizard__nav-link-text">Placement</span>
                            </span>
                          </button>
                        </li>
                      </ol>
                    )}
                  </li>

                  <li className="pf-v6-c-wizard__nav-item">
                    <button
                      className={`pf-v6-c-wizard__nav-link ${currentStep === 3 ? 'pf-m-current' : ''}`}
                      type="button"
                      onClick={() => handleStepClick(3)}
                    >
                      <span className="pf-v6-c-wizard__nav-link-main">
                        <span className="pf-v6-c-wizard__nav-link-text">Additional</span>
                      </span>
                    </button>
                  </li>

                  <li className="pf-v6-c-wizard__nav-item">
                    <button
                      className={`pf-v6-c-wizard__nav-link ${currentStep === 4 ? 'pf-m-current' : ''} ${currentStep < 4 ? 'pf-m-disabled' : ''}`}
                      type="button"
                      onClick={() => currentStep >= 4 && handleStepClick(4)}
                      aria-disabled={currentStep < 4}
                      tabIndex={currentStep < 4 ? -1 : 0}
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
                    onClick={currentStep === 4 ? onSave : handleNext}
                  >
                    {currentStep === 4 ? 'Create' : 'Next'}
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

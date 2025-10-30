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
  Checkbox,
  Radio,
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';
import { PlusIcon } from '@patternfly/react-icons';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';

const CreatePolicy: React.FunctionComponent = () => {
  useDocumentTitle('ACM RBAC | Create Policy');
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = React.useState(1);

  const [policyName, setPolicyName] = React.useState('');
  const [policyDescription, setPolicyDescription] = React.useState('');
  const [projectSelector, setProjectSelector] = React.useState('');
  const [disablePolicy, setDisablePolicy] = React.useState(false);
  const [remediation, setRemediation] = React.useState('inform');
  const [isAddTemplateDropdownOpen, setIsAddTemplateDropdownOpen] = React.useState(false);
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
      projectSelector,
      disablePolicy,
      remediation,
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
          <FormGroup label="Project selector" isRequired fieldId="project-selector">
            <TextInput
              isRequired
              type="text"
              id="project-selector"
              name="project-selector"
              value={projectSelector}
              onChange={(_event, value) => setProjectSelector(value)}
              placeholder="Select a project"
            />
          </FormGroup>
          <FormGroup fieldId="disable-policy">
            <Checkbox
              id="disable-policy"
              label="Disable policy"
              isChecked={disablePolicy}
              onChange={(_event, checked) => setDisablePolicy(checked)}
              description="Select to disable the policy from being propagated to managed clusters"
            />
          </FormGroup>
        </Form>
      );
    }

    // Step 2: Policy templates
    if (currentStep === 2) {
      return (
        <div>
          <Title headingLevel="h2" size="xl" style={{ marginBottom: '8px' }}>
            Templates
          </Title>
          <Content component="p" style={{ marginBottom: '24px', color: '#6a6e73' }}>
            A policy contains policy templates that create policies on managed clusters.
          </Content>

          <Form>
            <Title headingLevel="h3" size="md" style={{ marginBottom: '16px' }}>
              Remediations
            </Title>
            <FormGroup fieldId="remediation">
              <Radio
                id="remediation-inform"
                name="remediation"
                label="Inform"
                description="Reports the violation, which requires manual remediation."
                isChecked={remediation === 'inform'}
                onChange={() => setRemediation('inform')}
                style={{ marginBottom: '12px' }}
              />
              <Radio
                id="remediation-enforce"
                name="remediation"
                label="Enforce"
                description="Automatically runs remediation action that is defined in the source, if the feature is supported."
                isChecked={remediation === 'enforce'}
                onChange={() => setRemediation('enforce')}
                style={{ marginBottom: '12px' }}
              />
              <Radio
                id="remediation-template"
                name="remediation"
                label="Use policy template remediation"
                description="Remediation action will be determined by what is set in the policy template definitions."
                isChecked={remediation === 'template'}
                onChange={() => setRemediation('template')}
              />
            </FormGroup>

            <div style={{ marginTop: '32px' }}>
              <Title headingLevel="h3" size="md" style={{ marginBottom: '16px' }}>
                Policy templates
              </Title>
              <Dropdown
                isOpen={isAddTemplateDropdownOpen}
                onSelect={() => setIsAddTemplateDropdownOpen(false)}
                onOpenChange={(isOpen) => setIsAddTemplateDropdownOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setIsAddTemplateDropdownOpen(!isAddTemplateDropdownOpen)}
                    isExpanded={isAddTemplateDropdownOpen}
                    variant="link"
                  >
                    <PlusIcon style={{ marginRight: '8px' }} />
                    Add policy template
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem key="template-1">Template option 1</DropdownItem>
                  <DropdownItem key="template-2">Template option 2</DropdownItem>
                  <DropdownItem key="template-3">Template option 3</DropdownItem>
                </DropdownList>
              </Dropdown>
            </div>
          </Form>
        </div>
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
              <dt style={{ fontWeight: 600 }}>Project selector:</dt>
              <dd>{projectSelector || '—'}</dd>
              <dt style={{ fontWeight: 600 }}>Disable policy:</dt>
              <dd>{disablePolicy ? 'Yes' : 'No'}</dd>
            </dl>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <Title headingLevel="h3" size="md" style={{ marginBottom: '8px' }}>
              Policy templates
            </Title>
            <dl style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '8px', fontSize: '14px' }}>
              <dt style={{ fontWeight: 600 }}>Remediation:</dt>
              <dd>
                {remediation === 'inform' && 'Inform'}
                {remediation === 'enforce' && 'Enforce'}
                {remediation === 'template' && 'Use policy template remediation'}
              </dd>
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

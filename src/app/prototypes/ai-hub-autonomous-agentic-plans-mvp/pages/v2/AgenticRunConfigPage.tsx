import React, { useEffect, useState } from 'react';
import { useApprovalPolicy } from '../../context/ApprovalPolicyContext';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Checkbox,
  Content,
  Flex,
  FlexItem,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  StackItem,
  Title,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
} from '@patternfly/react-core';
import { AiHubPageHeading } from '../../components/AiHubPageHeading';
import { TechPreviewBadge } from '../../components/TechPreviewBadge';
import '../ai-hub-page.css';

// ─── Types ────────────────────────────────────────────────────────────────────

type ApprovalMode = 'auto' | 'manual';
type PolicyStage = 'analysis' | 'execution' | 'verification' | 'escalation';

const POLICY_STAGE_LABELS: Record<PolicyStage, string> = {
  analysis: 'Analysis',
  execution: 'Execution',
  verification: 'Verification',
  escalation: 'Escalation',
};

const AGENTIC_RUNS_LIST_PATH = '/v2/ai-hub/observe/plans';

const POLICY_TOOLTIP_COPY: Record<PolicyStage, { manual: string; automatic: string }> = {
  analysis: {
    manual: 'Require approval before cluster investigation.',
    automatic: 'Investigate the cluster without approval.',
  },
  execution: {
    manual: 'Require approval before applying remediation.',
    automatic: 'Apply remediation changes without approval.',
  },
  verification: {
    manual: 'Require approval to confirm issue resolution.',
    automatic: 'Verify cluster health without approval.',
  },
  escalation: {
    manual: 'Require approval for manual handoff on failure.',
    automatic: 'Escalation always requires human intervention.',
  },
};

// ─── Manual → Automatic 3-click safety modal ─────────────────────────────────

type EnableAutomaticPolicyModalProps = {
  isOpen: boolean;
  stage: PolicyStage | null;
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * Triple-confirmation gate for enabling Automatic execution policy.
 * Click 1 + 2 = mandatory risk/guardrail checkboxes; Click 3 = primary button
 * (disabled until both checkboxes are checked). Cancel / Esc / X leaves Manual.
 */
const EnableAutomaticPolicyModal: React.FC<EnableAutomaticPolicyModalProps> = ({
  isOpen,
  stage,
  onCancel,
  onConfirm,
}) => {
  const [ackRisk, setAckRisk] = useState(false);
  const [ackGuardrail, setAckGuardrail] = useState(false);
  const stageLabel = stage ? POLICY_STAGE_LABELS[stage] : 'this';

  // Reset acknowledgments whenever the modal opens for a (new) stage.
  useEffect(() => {
    if (isOpen) {
      setAckRisk(false);
      setAckGuardrail(false);
    }
  }, [isOpen, stage]);

  const canConfirm = ackRisk && ackGuardrail;

  return (
    <Modal
      variant="medium"
      isOpen={isOpen}
      onClose={onCancel}
      aria-labelledby="enable-automatic-policy-title"
      aria-describedby="enable-automatic-policy-body"
    >
      <ModalHeader
        labelId="enable-automatic-policy-title"
        title="Enable automatic execution policy"
        titleIconVariant="warning"
      />
      <ModalBody id="enable-automatic-policy-body">
        <Stack hasGutter>
          <StackItem>
            <Alert
              variant="danger"
              isInline
              title="Automatic policy allows unprompted autonomous cluster operations"
            >
              Enabling Automatic for the <strong>{stageLabel}</strong> stage lets the agent
              proceed without a human approval gate. Misconfigured limits or RBAC can result in
              unintended cluster changes across remediation workflows.
            </Alert>
          </StackItem>
          <StackItem>
            <Content component="p">
              Confirm both statements below before enabling Automatic execution for{' '}
              <strong>{stageLabel}</strong>.
            </Content>
          </StackItem>
          <StackItem>
            <Checkbox
              id="enable-auto-ack-risk"
              label="I understand the agent will automatically perform operations without manual approval"
              isChecked={ackRisk}
              onChange={(_event, checked) => setAckRisk(checked)}
            />
          </StackItem>
          <StackItem>
            <Checkbox
              id="enable-auto-ack-guardrail"
              label="I confirm that cluster safety limits and RBAC permissions have been verified"
              isChecked={ackGuardrail}
              onChange={(_event, checked) => setAckGuardrail(checked)}
            />
          </StackItem>
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button
          key="confirm"
          variant="danger"
          isDisabled={!canConfirm}
          onClick={onConfirm}
        >
          Enable automatic execution
        </Button>
        <Button key="cancel" variant="link" onClick={onCancel}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

// ─── Shared sub-components ────────────────────────────────────────────────────

/** A single labeled settings row — label on the left, control on the right. */
const PolicyRow: React.FC<{
  label: string;
  fieldId?: string;
  isLast?: boolean;
  children: React.ReactNode;
}> = ({ label, isLast = false, children }) => (
  <Flex
    className={`ols-ai-hub-config-policy-row${isLast ? ' ols-ai-hub-config-policy-row--last' : ''}`}
    justifyContent={{ default: 'justifyContentSpaceBetween' }}
    alignItems={{ default: 'alignItemsCenter' }}
  >
    <FlexItem>
      <Content component="p" className="pf-v6-u-mb-0">
        <strong>{label}</strong>
      </Content>
    </FlexItem>
    <FlexItem>{children}</FlexItem>
  </Flex>
);

// ─── Approval policy view ─────────────────────────────────────────────────────

const ApprovalPolicyView: React.FC<{ onSaved: () => void }> = ({ onSaved }) => {
  const navigate = useNavigate();
  const {
    analysisPolicy: globalAnalysisPolicy,
    executionPolicy: globalExecutionPolicy,
    verificationPolicy: globalVerificationPolicy,
    applyPolicyConfig,
  } = useApprovalPolicy();
  const [analysisPolicy, setAnalysisPolicy] = useState<ApprovalMode>(globalAnalysisPolicy);
  const [executionPolicy, setExecutionPolicy] = useState<ApprovalMode>(globalExecutionPolicy);
  const [verificationPolicy, setVerificationPolicy] = useState<ApprovalMode>(globalVerificationPolicy);
  const [escalationPolicy, setEscalationPolicy] = useState<ApprovalMode>('manual');
  const [isDirty, setIsDirty] = useState(false);
  /** Stage awaiting Manual → Automatic confirmation; null when modal is closed. */
  const [pendingAutoStage, setPendingAutoStage] = useState<PolicyStage | null>(null);

  const policySetters: Record<PolicyStage, React.Dispatch<React.SetStateAction<ApprovalMode>>> = {
    analysis: setAnalysisPolicy,
    execution: setExecutionPolicy,
    verification: setVerificationPolicy,
    escalation: setEscalationPolicy,
  };

  const policyValues: Record<PolicyStage, ApprovalMode> = {
    analysis: analysisPolicy,
    execution: executionPolicy,
    verification: verificationPolicy,
    escalation: escalationPolicy,
  };

  /**
   * Intercept policy changes:
   * - Automatic → Manual: apply immediately for all stages
   * - Manual → Automatic on Execution only: open 3-click safety modal
   *   (Execution is the destructive/mutating stage; Analysis, Verification,
   *   and Escalation apply immediately)
   * - Manual → Automatic on other stages: apply immediately
   */
  const requestPolicyChange = (stage: PolicyStage, next: ApprovalMode) => {
    const current = policyValues[stage];
    if (next === current) return;

    if (next === 'manual') {
      policySetters[stage]('manual');
      setIsDirty(true);
      return;
    }

    // Manual → Automatic: only Execution requires the triple-confirmation gate.
    if (stage === 'execution') {
      setPendingAutoStage(stage);
      return;
    }

    policySetters[stage]('auto');
    setIsDirty(true);
  };

  const dismissAutoModal = () => {
    setPendingAutoStage(null);
  };

  const confirmEnableAutomatic = () => {
    if (!pendingAutoStage) return;
    policySetters[pendingAutoStage]('auto');
    setIsDirty(true);
    setPendingAutoStage(null);
  };

  const renderToggleRow = (stage: PolicyStage, ariaLabel: string) => {
    const manualButtonId = `${stage}-policy-manual`;
    const automaticButtonId = `${stage}-policy-automatic`;
    const isEscalation = stage === 'escalation';
    const tooltipTrigger = (buttonId: string, useWrapper = false) => () => {
      const button = document.getElementById(buttonId);
      return (useWrapper ? button?.parentElement : button) as HTMLElement;
    };

    return (
      <PolicyRow label={POLICY_STAGE_LABELS[stage]} fieldId={`${ariaLabel}-toggle`}>
        <>
          <ToggleGroup isCompact aria-label={ariaLabel} id={`${ariaLabel}-toggle`}>
            <ToggleGroupItem
              text="Manual"
              buttonId={manualButtonId}
              isSelected={isEscalation || policyValues[stage] === 'manual'}
              onChange={() => requestPolicyChange(stage, 'manual')}
            />
            <ToggleGroupItem
              text="Automatic"
              buttonId={automaticButtonId}
              isSelected={!isEscalation && policyValues[stage] === 'auto'}
              isDisabled={isEscalation}
              onChange={() => requestPolicyChange(stage, 'auto')}
            />
          </ToggleGroup>
          <Tooltip
            triggerRef={tooltipTrigger(manualButtonId)}
            content={POLICY_TOOLTIP_COPY[stage].manual}
          />
          <Tooltip
            triggerRef={tooltipTrigger(automaticButtonId, isEscalation)}
            content={POLICY_TOOLTIP_COPY[stage].automatic}
          />
        </>
      </PolicyRow>
    );
  };

  return (
    <>
      <Form className="ols-ai-hub-config-content-width ols-ai-hub-config-approval-form">
        {renderToggleRow('analysis', 'Analysis policy')}
        {renderToggleRow('execution', 'Execution policy')}
        {renderToggleRow('verification', 'Verification policy')}
        {renderToggleRow('escalation', 'Escalation policy')}
      </Form>
      <Flex style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }} gap={{ default: 'gapSm' }}>
        <FlexItem>
          <Button
            variant="primary"
            isDisabled={!isDirty}
            onClick={() => {
              applyPolicyConfig({ analysisPolicy, executionPolicy, verificationPolicy, escalationPolicy });
              onSaved();
              setIsDirty(false);
            }}
          >
            Save
          </Button>
        </FlexItem>
        <FlexItem>
          <Button variant="link" onClick={() => navigate(AGENTIC_RUNS_LIST_PATH)}>
            Cancel
          </Button>
        </FlexItem>
      </Flex>

      <EnableAutomaticPolicyModal
        isOpen={pendingAutoStage !== null}
        stage={pendingAutoStage}
        onCancel={dismissAutoModal}
        onConfirm={confirmEnableAutomatic}
      />
    </>
  );
};

// ─── Page shell ───────────────────────────────────────────────────────────────

export const AgenticRunConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSavedToastVisible, setIsSavedToastVisible] = useState(false);

  const navigateBackToPlans = (event: React.MouseEvent) => {
    event.preventDefault();
    navigate(AGENTIC_RUNS_LIST_PATH);
  };

  return (
    <div className="ols-ai-hub-page ols-ai-hub-page--v3 ols-ai-hub-config-page" data-exp-lab-annotation-root>
      <div className="template-page-breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem component="button" onClick={navigateBackToPlans}>
            Agentic runs
          </BreadcrumbItem>
          <BreadcrumbItem isActive>Configuration</BreadcrumbItem>
        </Breadcrumb>
      </div>

      <AiHubPageHeading>
        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
          <FlexItem>
            <Title headingLevel="h1" size="2xl">
              Configuration
            </Title>
          </FlexItem>
          <FlexItem>
            <TechPreviewBadge />
          </FlexItem>
        </Flex>
        <Content component="p" style={{ marginTop: 'var(--pf-t--global--spacer--sm)', marginBottom: 0 }}>
          Set approval requirements for each troubleshooting phase. Select <strong>Manual</strong> to require human approval, or <strong>Automatic</strong> to continue without review.
        </Content>
      </AiHubPageHeading>

      <div
        id="ols-ai-hub-config-main"
        className="template-page-content"
        role="main"
        aria-label="Agentic runs configuration"
      >
        <ApprovalPolicyView onSaved={() => setIsSavedToastVisible(true)} />
      </div>

      <AlertGroup isToast isLiveRegion>
        {isSavedToastVisible && (
          <Alert
            variant="success"
            title="Approval policy saved successfully."
            timeout={6000}
            onTimeout={() => setIsSavedToastVisible(false)}
            actionClose={
              <AlertActionCloseButton
                title="Approval policy saved successfully."
                onClose={() => setIsSavedToastVisible(false)}
              />
            }
          />
        )}
      </AlertGroup>
    </div>
  );
};

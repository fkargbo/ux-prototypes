import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Content,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  Form,
  MenuToggle,
  NumberInput,
  Tab,
  Tabs,
  TabTitleText,
  Title,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import { EllipsisVIcon, OutlinedClockIcon } from '@patternfly/react-icons';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { AiHubPageHeading } from '../../components/AiHubPageHeading';
import { TechPreviewBadge } from '../../components/TechPreviewBadge';
import '../ai-hub-page.css';

/** OpenShift console / PatternFly table style: e.g. Jul 22, 2026, 11:29 AM — matches the Agentic runs "Created" column. */
const formatConfigCreatedAt = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '—';
  }
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const CreatedAtCell: React.FC<{ iso: string }> = ({ iso }) => (
  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }} flexWrap={{ default: 'nowrap' }}>
    <FlexItem>
      <OutlinedClockIcon
        style={{ color: 'var(--pf-t--global--icon--color--subtle)', verticalAlign: 'middle' }}
        aria-hidden
      />
    </FlexItem>
    <FlexItem>
      <time dateTime={iso}>{formatConfigCreatedAt(iso)}</time>
    </FlexItem>
  </Flex>
);

// ─── Types ────────────────────────────────────────────────────────────────────

type AgenticRunConfigTabKey = 'approval-policy' | 'llm-providers' | 'agents';
type ApprovalMode = 'auto' | 'manual';

interface LlmProviderRow {
  id: string;
  name: string;
  type: string;
  created: string;
}

interface AgentRow {
  id: string;
  name: string;
  llmProvider: string;
  model: string;
  created: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_LLM_PROVIDERS: LlmProviderRow[] = [
  { id: 'llm-openai-enterprise', name: 'OpenAI Enterprise', type: 'OpenAI', created: '2026-02-10T11:29:00' },
  { id: 'llm-granite-local', name: 'Granite Local', type: 'Ollama', created: '2026-01-15T09:14:00' },
  { id: 'llm-anthropic-enterprise', name: 'Anthropic Enterprise', type: 'Anthropic', created: '2025-11-03T15:42:00' },
];

const INITIAL_AGENTS: AgentRow[] = [
  {
    id: 'agent-analyzer',
    name: 'Analyzer Agent',
    llmProvider: 'OpenAI Enterprise',
    model: 'gpt-4o',
    created: '2026-03-01T08:05:00',
  },
  {
    id: 'agent-remediator',
    name: 'Remediator Agent',
    llmProvider: 'Granite Local',
    model: 'granite-3b-code',
    created: '2026-02-20T13:37:00',
  },
  {
    id: 'agent-escalation',
    name: 'Escalation Agent',
    llmProvider: 'OpenAI Enterprise',
    model: 'gpt-4o-mini',
    created: '2026-01-28T17:21:00',
  },
];

const AGENTIC_RUNS_LIST_PATH = '/v2/ai-hub/observe/plans';

// ─── Row actions menu (shared by both config tables) ──────────────────────────

const RowActionsMenu: React.FC<{
  label: string;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ label, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown
      isOpen={isOpen}
      onSelect={() => setIsOpen(false)}
      onOpenChange={setIsOpen}
      popperProps={{ position: 'right' }}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          variant="plain"
          isExpanded={isOpen}
          aria-label={`${label} actions`}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <EllipsisVIcon />
        </MenuToggle>
      )}
    >
      <DropdownList>
        <DropdownItem key="edit" onClick={onEdit}>
          Edit
        </DropdownItem>
        <DropdownItem key="delete" onClick={onDelete}>
          Delete
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

/** A single labeled settings row — label on the left, control on the right. */
const PolicyRow: React.FC<{ label: string; fieldId?: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <Flex
    className="ols-ai-hub-config-policy-row"
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

// ─── Tab 1: Approval policy ────────────────────────────────────────────────────

const ApprovalPolicyTab: React.FC<{ onSaved: () => void }> = ({ onSaved }) => {
  const navigate = useNavigate();
  const [analysisPolicy, setAnalysisPolicy] = useState<ApprovalMode>('manual');
  const [executionPolicy, setExecutionPolicy] = useState<ApprovalMode>('manual');
  const [verificationPolicy, setVerificationPolicy] = useState<ApprovalMode>('manual');
  const [escalationPolicy, setEscalationPolicy] = useState<ApprovalMode>('manual');
  const [maxRetryAttempts, setMaxRetryAttempts] = useState(3);

  const renderToggleRow = (
    label: string,
    ariaLabel: string,
    value: ApprovalMode,
    onChange: (next: ApprovalMode) => void,
  ) => (
    <PolicyRow label={label} fieldId={`${ariaLabel}-toggle`}>
      <ToggleGroup isCompact aria-label={ariaLabel} id={`${ariaLabel}-toggle`}>
        <ToggleGroupItem
          text="Manual"
          isSelected={value === 'manual'}
          onChange={() => onChange('manual')}
        />
        <ToggleGroupItem
          text="Automatic"
          isSelected={value === 'auto'}
          onChange={() => onChange('auto')}
        />
      </ToggleGroup>
    </PolicyRow>
  );

  return (
    <>
      <Content component="p">
        Configure whether each workflow stage requires manual approval or runs automatically.
      </Content>
      <Form
        className="ols-ai-hub-config-content-width"
        style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}
      >
        {renderToggleRow('Analysis', 'Analysis policy', analysisPolicy, setAnalysisPolicy)}
        <Divider />
        {renderToggleRow('Execution', 'Execution policy', executionPolicy, setExecutionPolicy)}
        <Divider />
        {renderToggleRow('Verification', 'Verification policy', verificationPolicy, setVerificationPolicy)}
        <Divider />
        {renderToggleRow('Escalation', 'Escalation policy', escalationPolicy, setEscalationPolicy)}
        <Divider />
        <PolicyRow label="Max retry attempts" fieldId="max-retry-attempts">
          <NumberInput
            id="max-retry-attempts"
            value={maxRetryAttempts}
            min={0}
            max={10}
            onMinus={() => setMaxRetryAttempts((prev) => Math.max(0, prev - 1))}
            onPlus={() => setMaxRetryAttempts((prev) => Math.min(10, prev + 1))}
            onChange={(event) => {
              const parsed = Number((event.target as HTMLInputElement).value);
              if (!Number.isNaN(parsed)) {
                setMaxRetryAttempts(Math.min(10, Math.max(0, parsed)));
              }
            }}
            inputName="max-retry-attempts"
            inputAriaLabel="Max retry attempts"
            minusBtnAriaLabel="Decrement max retry attempts"
            plusBtnAriaLabel="Increment max retry attempts"
          />
        </PolicyRow>
      </Form>
      <Flex style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }} gap={{ default: 'gapSm' }}>
        <FlexItem>
          <Button variant="primary" onClick={onSaved}>
            Save
          </Button>
        </FlexItem>
        <FlexItem>
          <Button variant="link" onClick={() => navigate(AGENTIC_RUNS_LIST_PATH)}>
            Cancel
          </Button>
        </FlexItem>
      </Flex>
    </>
  );
};

// ─── Tab 2: LLM providers ──────────────────────────────────────────────────────

const LlmProvidersTab: React.FC = () => {
  const [providers, setProviders] = useState(INITIAL_LLM_PROVIDERS);

  return (
    <>
      <Flex
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
        alignItems={{ default: 'alignItemsFlexStart' }}
      >
        <FlexItem>
          <Content component="p">
            Large language model providers available to agents for run analysis and execution.
          </Content>
        </FlexItem>
        <FlexItem>
          <Button variant="primary">Create LLM provider</Button>
        </FlexItem>
      </Flex>
      <Table aria-label="LLM providers" style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Type</Th>
            <Th>Created</Th>
            <Th screenReaderText="Actions" />
          </Tr>
        </Thead>
        <Tbody>
          {providers.map((provider) => (
            <Tr key={provider.id}>
              <Td dataLabel="Name">{provider.name}</Td>
              <Td dataLabel="Type">{provider.type}</Td>
              <Td dataLabel="Created">
                <CreatedAtCell iso={provider.created} />
              </Td>
              <Td isActionCell>
                <RowActionsMenu
                  label={provider.name}
                  onEdit={() => {}}
                  onDelete={() =>
                    setProviders((prev) => prev.filter((row) => row.id !== provider.id))
                  }
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
};

// ─── Tab 3: Agents ──────────────────────────────────────────────────────────────

const AgentsTab: React.FC = () => {
  const [agents, setAgents] = useState(INITIAL_AGENTS);

  return (
    <>
      <Flex
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
        alignItems={{ default: 'alignItemsFlexStart' }}
      >
        <FlexItem>
          <Content component="p">
            Agent tiers define the model and settings used at each stage of a run workflow.
          </Content>
        </FlexItem>
        <FlexItem>
          <Button variant="primary">Create agent</Button>
        </FlexItem>
      </Flex>
      <Table aria-label="Agents" style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>LLM provider</Th>
            <Th>Model</Th>
            <Th>Max turns</Th>
            <Th>Created</Th>
            <Th screenReaderText="Actions" />
          </Tr>
        </Thead>
        <Tbody>
          {agents.map((agent) => (
            <Tr key={agent.id}>
              <Td dataLabel="Name">{agent.name}</Td>
              <Td dataLabel="LLM provider">{agent.llmProvider}</Td>
              <Td dataLabel="Model">{agent.model}</Td>
              <Td dataLabel="Max turns">—</Td>
              <Td dataLabel="Created">
                <CreatedAtCell iso={agent.created} />
              </Td>
              <Td isActionCell>
                <RowActionsMenu
                  label={agent.name}
                  onEdit={() => {}}
                  onDelete={() => setAgents((prev) => prev.filter((row) => row.id !== agent.id))}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
};

// ─── Page shell ─────────────────────────────────────────────────────────────────

export const AgenticRunConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AgenticRunConfigTabKey>('approval-policy');
  const [isSavedToastVisible, setIsSavedToastVisible] = useState(false);

  const navigateBackToPlans = (event: React.MouseEvent) => {
    event.preventDefault();
    navigate(AGENTIC_RUNS_LIST_PATH);
  };

  return (
    <div className="ols-ai-hub-page ols-ai-hub-page--v3" data-exp-lab-annotation-root>
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
        <div className="ols-ai-hub-config-content-width">
          <Tabs
            activeKey={activeTab}
            onSelect={(_event, tabKey) => setActiveTab(tabKey as AgenticRunConfigTabKey)}
            aria-label="Agentic runs configuration sections"
            className="pf-v6-u-mt-md"
          >
            <Tab eventKey="approval-policy" title={<TabTitleText>Approval policy</TabTitleText>} />
            <Tab eventKey="llm-providers" title={<TabTitleText>LLM providers</TabTitleText>} />
            <Tab eventKey="agents" title={<TabTitleText>Agents</TabTitleText>} />
          </Tabs>
        </div>
      </AiHubPageHeading>

      <div
        id="ols-ai-hub-config-main"
        className="template-page-content"
        role="main"
        aria-label="Agentic runs configuration content"
      >
        {activeTab === 'approval-policy' && (
          <ApprovalPolicyTab onSaved={() => setIsSavedToastVisible(true)} />
        )}
        {activeTab === 'llm-providers' && <LlmProvidersTab />}
        {activeTab === 'agents' && <AgentsTab />}
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

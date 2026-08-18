import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Content,
  Flex,
  FlexItem,
  Label,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Stack,
  StackItem,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { CheckCircleIcon, HeartIcon, QuestionCircleIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useActivePerspective } from '@app/shared/contexts/ActivePerspectiveContext';
import { InvestigateWithAiLink } from './components/InvestigateWithAiLink';
import {
  GITOPS_APPLICATIONS,
  GITOPS_INSTANCES,
  filterApplicationsByInstance,
  resolveInvestigationPlacement,
  type GitOpsApplication,
  type GitOpsHealthStatus,
  type GitOpsSyncStatus,
} from './data/gitOpsApplicationsData';
import {
  gitOpsApplicationHasExistingInvestigation,
  resolveGitOpsApplicationInvestigationNavigation,
} from './gitOpsInvestigationBridge';
import '../ai-hub-page.css';

function healthLabelColor(status: GitOpsHealthStatus): 'green' | 'orange' | 'red' | 'grey' {
  switch (status) {
    case 'Healthy':
      return 'green';
    case 'Degraded':
    case 'Progressing':
      return 'orange';
    case 'Missing':
    case 'Unknown':
      return 'red';
    default:
      return 'grey';
  }
}

function syncLabelColor(status: GitOpsSyncStatus): 'green' | 'orange' | 'red' | 'purple' | 'grey' {
  switch (status) {
    case 'Synced':
      return 'green';
    case 'OutOfSync':
      return 'orange';
    case 'Sync Failed':
      return 'red';
    case 'Unknown':
      return 'purple';
    default:
      return 'grey';
  }
}

const StatusCellWithOptionalAction: React.FC<{
  statusContent: React.ReactNode;
  investigateAction?: React.ReactNode;
}> = ({ statusContent, investigateAction }) => (
  <Stack hasGutter={false} style={{ rowGap: 'var(--pf-t--global--spacer--xs)' }}>
    <StackItem>{statusContent}</StackItem>
    {investigateAction ? <StackItem>{investigateAction}</StackItem> : null}
  </Stack>
);

const SyncStatusCell: React.FC<{
  status: GitOpsSyncStatus;
  investigateAction?: React.ReactNode;
}> = ({ status, investigateAction }) => (
  <StatusCellWithOptionalAction
    investigateAction={investigateAction}
    statusContent={
      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
        <FlexItem>
          {status === 'Synced' ? (
            <CheckCircleIcon color="var(--pf-t--global--icon--color--status--success--default)" />
          ) : (
            <QuestionCircleIcon color="var(--pf-t--global--icon--color--status--warning--default)" />
          )}
        </FlexItem>
        <FlexItem>
          <Label color={syncLabelColor(status)} isCompact>
            {status}
          </Label>
        </FlexItem>
      </Flex>
    }
  />
);

const HealthStatusCell: React.FC<{
  status: GitOpsHealthStatus;
  investigateAction?: React.ReactNode;
}> = ({ status, investigateAction }) => (
  <StatusCellWithOptionalAction
    investigateAction={investigateAction}
    statusContent={
      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
        <FlexItem>
          <HeartIcon
            color={
              status === 'Healthy'
                ? 'var(--pf-t--global--icon--color--status--success--default)'
                : 'var(--pf-t--global--icon--color--status--danger--default)'
            }
          />
        </FlexItem>
        <FlexItem>
          <Label color={healthLabelColor(status)} isCompact>
            {status}
          </Label>
        </FlexItem>
      </Flex>
    }
  />
);

export const GitOpsApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { activePerspective } = useActivePerspective();
  const isSingleCluster = activePerspective === 'Core platforms';
  const [searchValue, setSearchValue] = useState('');
  const [selectedInstanceId, setSelectedInstanceId] = useState(GITOPS_INSTANCES[0].id);
  const [isInstanceSelectOpen, setIsInstanceSelectOpen] = useState(false);

  const selectedInstance =
    GITOPS_INSTANCES.find((instance) => instance.id === selectedInstanceId) ?? GITOPS_INSTANCES[0];

  const filteredApplications = useMemo(() => {
    const byInstance = filterApplicationsByInstance(GITOPS_APPLICATIONS, selectedInstanceId);
    const query = searchValue.trim().toLowerCase();
    if (!query) {
      return byInstance;
    }
    return byInstance.filter(
      (app) =>
        app.name.toLowerCase().includes(query) ||
        app.project.toLowerCase().includes(query) ||
        app.repository.toLowerCase().includes(query),
    );
  }, [searchValue, selectedInstanceId]);

  const handleInvestigate = (app: GitOpsApplication) => {
    const { href, plan } = resolveGitOpsApplicationInvestigationNavigation(app, isSingleCluster);
    navigate(href, { state: { plan } });
  };

  return (
    <div className="ols-ai-hub-page ols-gitops-page ols-ai-hub-page--v3" data-exp-lab-annotation-root>
      <div className="create-policy-header">
        <div className="ols-ai-hub-page-header-inner">
          <Flex
            alignItems={{ default: 'alignItemsFlexStart' }}
            justifyContent={{ default: 'justifyContentSpaceBetween' }}
            flexWrap={{ default: 'wrap' }}
            gap={{ default: 'gapMd' }}
            style={{ width: '100%' }}
          >
            <FlexItem>
              <Title headingLevel="h1" size="2xl">
                Applications
              </Title>
              <Content component="p" className="ols-ai-hub-page-subtitle">
                Argo CD applications for the selected instance.{' '}
                <strong>Investigate with AI</strong> appears inline on the status that needs attention
                (degraded health or non-synced state).
              </Content>
            </FlexItem>
            <FlexItem>
              <Select
                isOpen={isInstanceSelectOpen}
                selected={selectedInstanceId}
                onSelect={(_event, selection) => {
                  setSelectedInstanceId(String(selection));
                  setIsInstanceSelectOpen(false);
                }}
                onOpenChange={(isOpen) => setIsInstanceSelectOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setIsInstanceSelectOpen((open) => !open)}
                    isExpanded={isInstanceSelectOpen}
                    aria-label="Argo CD instance"
                  >
                    {selectedInstance.label}
                  </MenuToggle>
                )}
              >
                <SelectList>
                  {GITOPS_INSTANCES.map((instance) => (
                    <SelectOption key={instance.id} value={instance.id}>
                      {instance.label}
                    </SelectOption>
                  ))}
                </SelectList>
              </Select>
            </FlexItem>
          </Flex>
        </div>
      </div>

      <div
        id="ols-gitops-applications-main"
        role="main"
        aria-label="GitOps applications content"
        style={{ padding: '24px', boxSizing: 'border-box' }}
      >
        <Stack hasGutter>
          <StackItem>
            <Toolbar>
              <ToolbarContent>
                <ToolbarItem>
                  <input
                    aria-label="Filter applications by name"
                    placeholder="Filter by name..."
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    style={{
                      minWidth: '240px',
                      padding: 'var(--pf-t--global--spacer--xs) var(--pf-t--global--spacer--sm)',
                      border: '1px solid var(--pf-t--global--border--color--default)',
                      borderRadius: 'var(--pf-t--global--border--radius--small)',
                    }}
                  />
                </ToolbarItem>
                <ToolbarItem align={{ default: 'alignEnd' }}>
                  <Button variant="primary">Create application</Button>
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>
          </StackItem>

          <StackItem>
            <Table aria-label="GitOps applications" variant="compact">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Project</Th>
                  <Th>Sync status</Th>
                  <Th>Health</Th>
                  <Th>Repository</Th>
                  <Th>Destination</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredApplications.map((app) => {
                  const investigationPlacement = resolveInvestigationPlacement(app);
                  const investigateAction =
                    investigationPlacement !== null ? (
                      <InvestigateWithAiLink
                        hasExistingInvestigation={gitOpsApplicationHasExistingInvestigation(app.id)}
                        onClick={() => handleInvestigate(app)}
                      />
                    ) : undefined;

                  return (
                    <Tr key={app.id}>
                      <Td dataLabel="Name">
                        <Button variant="link" isInline>
                          {app.name}
                        </Button>
                      </Td>
                      <Td dataLabel="Project">{app.project}</Td>
                      <Td dataLabel="Sync status">
                        <SyncStatusCell
                          status={app.syncStatus}
                          investigateAction={
                            investigationPlacement === 'sync' ? investigateAction : undefined
                          }
                        />
                      </Td>
                      <Td dataLabel="Health">
                        <HealthStatusCell
                          status={app.healthStatus}
                          investigateAction={
                            investigationPlacement === 'health' ? investigateAction : undefined
                          }
                        />
                      </Td>
                      <Td dataLabel="Repository">
                        <Button variant="link" isInline>
                          {app.repository}
                        </Button>
                      </Td>
                      <Td dataLabel="Destination">
                        <Button variant="link" isInline>
                          {app.destination}
                        </Button>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </StackItem>
        </Stack>
      </div>
    </div>
  );
};

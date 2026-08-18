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
import { CheckCircleIcon, ExclamationCircleIcon, InProgressIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useActivePerspective } from '@app/shared/contexts/ActivePerspectiveContext';
import { InvestigateWithAiLink } from '../gitops/components/InvestigateWithAiLink';
import {
  PIPELINE_RUNS,
  PIPELINES_NAMESPACES,
  filterPipelineRunsByNamespace,
  pipelineRunNeedsInvestigation,
  type PipelineRun,
  type PipelineRunStatus,
} from './data/pipelineRunsData';
import {
  pipelineRunHasExistingInvestigation,
  resolvePipelineRunInvestigationNavigation,
} from './pipelinesInvestigationBridge';
import '../ai-hub-page.css';

function statusLabelColor(status: PipelineRunStatus): 'green' | 'orange' | 'red' | 'blue' | 'grey' {
  switch (status) {
    case 'Succeeded':
      return 'green';
    case 'Failed':
      return 'red';
    case 'Running':
      return 'blue';
    case 'Cancelled':
      return 'grey';
    default:
      return 'grey';
  }
}

const StatusCell: React.FC<{
  run: PipelineRun;
  investigateAction?: React.ReactNode;
}> = ({ run, investigateAction }) => (
  <Stack hasGutter={false} style={{ rowGap: 'var(--pf-t--global--spacer--xs)' }}>
    <StackItem>
      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
        <FlexItem>
          {run.status === 'Succeeded' ? (
            <CheckCircleIcon color="var(--pf-t--global--icon--color--status--success--default)" />
          ) : run.status === 'Running' ? (
            <InProgressIcon color="var(--pf-t--global--icon--color--status--info--default)" />
          ) : (
            <ExclamationCircleIcon color="var(--pf-t--global--icon--color--status--danger--default)" />
          )}
        </FlexItem>
        <FlexItem>
          <Label color={statusLabelColor(run.status)} isCompact>
            {run.status}
          </Label>
        </FlexItem>
      </Flex>
    </StackItem>
    {investigateAction ? <StackItem>{investigateAction}</StackItem> : null}
  </Stack>
);

export const PipelineRunsPage: React.FC = () => {
  const navigate = useNavigate();
  const { activePerspective } = useActivePerspective();
  const isSingleCluster = activePerspective === 'Core platforms';
  const [searchValue, setSearchValue] = useState('');
  const [selectedNamespaceId, setSelectedNamespaceId] = useState(PIPELINES_NAMESPACES[0].id);
  const [isNamespaceSelectOpen, setIsNamespaceSelectOpen] = useState(false);

  const selectedNamespace =
    PIPELINES_NAMESPACES.find((ns) => ns.id === selectedNamespaceId) ?? PIPELINES_NAMESPACES[0];

  const filteredRuns = useMemo(() => {
    const byNamespace = filterPipelineRunsByNamespace(PIPELINE_RUNS, selectedNamespaceId);
    const query = searchValue.trim().toLowerCase();
    if (!query) {
      return byNamespace;
    }
    return byNamespace.filter(
      (run) =>
        run.name.toLowerCase().includes(query) ||
        run.pipeline.toLowerCase().includes(query) ||
        run.failedTask?.toLowerCase().includes(query),
    );
  }, [searchValue, selectedNamespaceId]);

  const handleInvestigate = (run: PipelineRun) => {
    const { href, plan } = resolvePipelineRunInvestigationNavigation(run, isSingleCluster);
    navigate(href, { state: { plan } });
  };

  return (
    <div className="ols-ai-hub-page ols-pipelines-page ols-ai-hub-page--v3" data-exp-lab-annotation-root>
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
                PipelineRuns
              </Title>
              <Content component="p" className="ols-ai-hub-page-subtitle">
                Tekton PipelineRuns for the selected namespace.{' '}
                <strong>Investigate with AI</strong> appears on failed runs to open an agentic
                failure-analysis run.
              </Content>
            </FlexItem>
            <FlexItem>
              <Select
                isOpen={isNamespaceSelectOpen}
                selected={selectedNamespaceId}
                onSelect={(_event, selection) => {
                  setSelectedNamespaceId(String(selection));
                  setIsNamespaceSelectOpen(false);
                }}
                onOpenChange={(isOpen) => setIsNamespaceSelectOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setIsNamespaceSelectOpen((open) => !open)}
                    isExpanded={isNamespaceSelectOpen}
                    aria-label="Namespace"
                  >
                    {selectedNamespace.label}
                  </MenuToggle>
                )}
              >
                <SelectList>
                  {PIPELINES_NAMESPACES.map((ns) => (
                    <SelectOption key={ns.id} value={ns.id}>
                      {ns.label}
                    </SelectOption>
                  ))}
                </SelectList>
              </Select>
            </FlexItem>
          </Flex>
        </div>
      </div>

      <div
        id="ols-pipelines-runs-main"
        role="main"
        aria-label="PipelineRuns content"
        style={{ padding: '24px', boxSizing: 'border-box' }}
      >
        <Stack hasGutter>
          <StackItem>
            <Toolbar>
              <ToolbarContent>
                <ToolbarItem>
                  <input
                    aria-label="Filter PipelineRuns by name"
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
                  <Button variant="primary">Start PipelineRun</Button>
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>
          </StackItem>

          <StackItem>
            <Table aria-label="PipelineRuns" variant="compact">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Pipeline</Th>
                  <Th>Status</Th>
                  <Th>Failed task</Th>
                  <Th>Started</Th>
                  <Th>Duration</Th>
                  <Th>Cluster</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredRuns.map((run) => {
                  const showInvestigate = pipelineRunNeedsInvestigation(run);
                  const investigateAction = showInvestigate ? (
                    <InvestigateWithAiLink
                      hasExistingInvestigation={pipelineRunHasExistingInvestigation(run.id)}
                      onClick={() => handleInvestigate(run)}
                    />
                  ) : undefined;

                  return (
                    <Tr key={run.id}>
                      <Td dataLabel="Name">
                        <Button variant="link" isInline>
                          {run.name}
                        </Button>
                      </Td>
                      <Td dataLabel="Pipeline">
                        <Button variant="link" isInline>
                          {run.pipeline}
                        </Button>
                      </Td>
                      <Td dataLabel="Status">
                        <StatusCell run={run} investigateAction={investigateAction} />
                      </Td>
                      <Td dataLabel="Failed task">
                        {run.failedTask ?? '—'}
                        {run.failureSummary ? (
                          <Content
                            component="p"
                            className="pf-v6-u-font-size-sm pf-v6-u-color-200"
                            style={{ marginTop: 'var(--pf-t--global--spacer--xs)' }}
                          >
                            {run.failureSummary}
                          </Content>
                        ) : null}
                      </Td>
                      <Td dataLabel="Started">{run.started}</Td>
                      <Td dataLabel="Duration">{run.duration}</Td>
                      <Td dataLabel="Cluster">
                        <Button variant="link" isInline>
                          {run.cluster}
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

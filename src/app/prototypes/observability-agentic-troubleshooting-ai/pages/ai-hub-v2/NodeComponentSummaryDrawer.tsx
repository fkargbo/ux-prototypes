import React from 'react';
import { createPortal } from 'react-dom';
import {
  CodeBlock,
  CodeBlockCode,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Label,
  Title,
} from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon, ExclamationTriangleIcon } from '@patternfly/react-icons';
import type { NodeComponentStatusLabel, NodeComponentSummaryRow } from './nodeComponentSummaryData';

export type NodeComponentSummaryDrawerProps = {
  isOpen: boolean;
  row: NodeComponentSummaryRow | null;
  onClose: () => void;
};

function statusToLabelStatus(status: NodeComponentStatusLabel): 'success' | 'warning' | 'danger' {
  switch (status) {
    case 'Ready':
    case 'Healthy':
      return 'success';
    case 'SchedulingDisabled':
      return 'warning';
    case 'NotReady':
    case 'Degraded':
    default:
      return 'danger';
  }
}

function statusDisplayText(status: NodeComponentStatusLabel): string {
  switch (status) {
    case 'NotReady':
      return 'Not ready';
    case 'SchedulingDisabled':
      return 'Scheduling disabled';
    default:
      return status;
  }
}

function statusIcon(status: NodeComponentStatusLabel): React.ReactNode {
  const labelStatus = statusToLabelStatus(status);
  if (labelStatus === 'success') {
    return <CheckCircleIcon aria-hidden />;
  }
  if (labelStatus === 'warning') {
    return <ExclamationTriangleIcon aria-hidden />;
  }
  return <ExclamationCircleIcon aria-hidden />;
}

export const NodeComponentSummaryDrawer: React.FC<NodeComponentSummaryDrawerProps> = ({ isOpen, row, onClose }) => {
  const expanded = isOpen && Boolean(row);

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <>
      <button
        type="button"
        className={`ols-node-summary-drawer-backdrop${expanded ? ' ols-node-summary-drawer-backdrop--open' : ''}`}
        aria-label="Close asset diagnostics"
        tabIndex={expanded ? 0 : -1}
        onClick={onClose}
      />
      <div
        className={`ols-node-summary-drawer-portal${expanded ? ' ols-node-summary-drawer-portal--open' : ''}`}
        aria-hidden={!expanded}
      >
        <Drawer isExpanded={expanded} position="end" isInline={false}>
          <DrawerContent
            panelContent={
              <DrawerPanelContent widths={{ default: 'width_33', lg: 'width_33' }}>
                <DrawerHead>
                  <Title headingLevel="h2" size="xl">
                    {row?.name ?? 'Asset diagnostics'}
                  </Title>
                  <DrawerActions>
                    <DrawerCloseButton onClick={onClose} />
                  </DrawerActions>
                </DrawerHead>
                <DrawerPanelBody className="ols-node-summary-drawer-body">
                  {row ? (
                    <>
                      <DescriptionList isHorizontal isCompact className="ols-node-summary-drawer-dl">
                        <DescriptionListGroup>
                          <DescriptionListTerm>Type</DescriptionListTerm>
                          <DescriptionListDescription>{row.typeLabel}</DescriptionListDescription>
                        </DescriptionListGroup>
                        <DescriptionListGroup>
                          <DescriptionListTerm>Status</DescriptionListTerm>
                          <DescriptionListDescription>
                            <Label status={statusToLabelStatus(row.status)} icon={statusIcon(row.status)} isCompact>
                              {statusDisplayText(row.status)}
                            </Label>
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                        <DescriptionListGroup>
                          <DescriptionListTerm>Zone</DescriptionListTerm>
                          <DescriptionListDescription>{row.zone}</DescriptionListDescription>
                        </DescriptionListGroup>
                        <DescriptionListGroup>
                          <DescriptionListTerm>Alerts</DescriptionListTerm>
                          <DescriptionListDescription>{row.alertCount}</DescriptionListDescription>
                        </DescriptionListGroup>
                      </DescriptionList>
                      <Content component="p" className="ols-node-summary-drawer-metrics">
                        {row.metricsSummary}
                      </Content>
                      <Title headingLevel="h3" size="md" className="ols-node-summary-drawer-section-title">
                        Local diagnostic log
                      </Title>
                      <CodeBlock>
                        <CodeBlockCode>{row.diagnosticLogs.join('\n')}</CodeBlockCode>
                      </CodeBlock>
                    </>
                  ) : null}
                </DrawerPanelBody>
              </DrawerPanelContent>
            }
          >
            <span className="pf-v6-u-screen-reader" aria-hidden={!expanded}>
              Asset detail drawer
            </span>
          </DrawerContent>
        </Drawer>
      </div>
    </>,
    document.body
  );
};

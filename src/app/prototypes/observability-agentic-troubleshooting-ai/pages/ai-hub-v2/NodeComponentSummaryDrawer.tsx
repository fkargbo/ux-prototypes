import React from 'react';
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
  Title,
} from '@patternfly/react-core';
import type { NodeComponentSummaryRow } from './nodeComponentSummaryData';

export type NodeComponentSummaryDrawerProps = {
  isOpen: boolean;
  row: NodeComponentSummaryRow | null;
  onClose: () => void;
};

export const NodeComponentSummaryDrawer: React.FC<NodeComponentSummaryDrawerProps> = ({ isOpen, row, onClose }) => {
  return (
    <Drawer isExpanded={isOpen && Boolean(row)} position="end">
      <DrawerContent
        panelContent={
          <DrawerPanelContent widths={{ default: 'width_33', lg: 'width_33' }} style={{ minWidth: '400px' }}>
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
                      <DescriptionListDescription>{row.status}</DescriptionListDescription>
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
        <span className="pf-v6-u-screen-reader" aria-hidden={!isOpen}>
          Asset detail drawer closed
        </span>
      </DrawerContent>
    </Drawer>
  );
};

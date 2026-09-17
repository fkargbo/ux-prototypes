import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Button,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
  Title,
} from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon, ExclamationTriangleIcon, TimesIcon } from '@patternfly/react-icons';
import type { NodeComponentStatusLabel, NodeComponentSummaryRow } from './nodeComponentSummaryData';
import { ExpandableCodeBlock } from '../../components/ExpandableCodeBlock';

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

  useEffect(() => {
    if (!expanded) {
      return undefined;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [expanded]);

  if (typeof document === 'undefined' || !row) {
    return null;
  }

  return createPortal(
    <div
      className={`ols-node-summary-drawer-root${expanded ? ' ols-node-summary-drawer-root--open' : ''}`}
      aria-hidden={!expanded}
    >
      <button
        type="button"
        className="ols-node-summary-drawer-backdrop"
        aria-label="Close asset diagnostics"
        tabIndex={expanded ? 0 : -1}
        onClick={onClose}
      />
      <aside
        className="ols-node-summary-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ols-node-summary-drawer-title"
        tabIndex={-1}
      >
        <div className="ols-node-summary-drawer-panel__head">
          <Title headingLevel="h2" size="xl" id="ols-node-summary-drawer-title">
            {row.name}
          </Title>
          <Button variant="plain" aria-label="Close asset diagnostics" icon={<TimesIcon />} onClick={onClose} />
        </div>
        <div className="ols-node-summary-drawer-panel__body ols-node-summary-drawer-body">
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
          <ExpandableCodeBlock
            id="node-diagnostic-log"
            code={row.diagnosticLogs.join('\n')}
            codeStyle={{ fontSize: '12px' }}
          />
        </div>
      </aside>
    </div>,
    document.body
  );
};

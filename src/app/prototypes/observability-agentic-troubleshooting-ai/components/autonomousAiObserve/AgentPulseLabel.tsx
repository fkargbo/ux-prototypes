import React from 'react';
import { Label } from '@patternfly/react-core';
import type { AgentPulseStatus } from './data';
import './autonomous-ai-observe.css';

export interface AgentPulseLabelProps {
  status: AgentPulseStatus;
  id?: string;
}

const statusToPulseClass: Record<AgentPulseStatus, string> = {
  investigating: 'ols-aio-agent-pulse--info',
  remediating: 'ols-aio-agent-pulse--warning',
  escalated: 'ols-aio-agent-pulse--danger',
  idle: 'ols-aio-agent-pulse--muted',
};

const statusToLabel: Record<AgentPulseStatus, 'blue' | 'orange' | 'red' | 'grey'> = {
  investigating: 'blue',
  remediating: 'orange',
  escalated: 'red',
  idle: 'grey',
};

export const AgentPulseLabel: React.FC<AgentPulseLabelProps> = ({ status, id }) => {
  const upper = status.toUpperCase();
  return (
    <Label
      id={id}
      className="ols-aio-agent-pulse-label"
      color={statusToLabel[status]}
      variant="outline"
      isCompact
      icon={
        <span className={`ols-aio-agent-pulse ${statusToPulseClass[status]}`} aria-hidden>
          <span className="ols-aio-agent-pulse__dot" />
          <span className="ols-aio-agent-pulse__ring" />
        </span>
      }
    >
      <span
        style={{
          fontFamily: 'var(--pf-t--global--font--family--mono)',
          fontSize: 'var(--pf-t--global--font--size--body--sm)',
        }}
      >
        Agent: {upper}
      </span>
    </Label>
  );
};

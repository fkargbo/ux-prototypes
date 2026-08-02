import React, { useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  Content,
  Flex,
  FlexItem,
  Switch,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import type { PlanStatus } from '../types/planStatus';

// ─── Mock state hook (demo/testing only) ─────────────────────────────────────

const DEMO_STATUS_OPTIONS: PlanStatus[] = ['Pending', 'Analyzing', 'Executing', 'Completed', 'Failed'];

export interface AgenticTraceDemoState {
  status: PlanStatus;
  setStatus: (status: PlanStatus) => void;
  hasTraceId: boolean;
  setHasTraceId: (value: boolean) => void;
  isTracingInstalled: boolean;
  setIsTracingInstalled: (value: boolean) => void;
}

/**
 * Local, presentation-only state for exercising every `AgenticTraceLink`
 * lifecycle/telemetry combination on demand. Seeded from the run's real
 * status so the link is truthful by default, but fully overridable via the
 * `AgenticTraceDemoControls` toolbar for demos/testing.
 */
export function useAgenticTraceDemoState(initialStatus: PlanStatus): AgenticTraceDemoState {
  const [status, setStatus] = useState<PlanStatus>(initialStatus);
  const [hasTraceId, setHasTraceId] = useState(true);
  const [isTracingInstalled, setIsTracingInstalled] = useState(true);

  // Re-seed when the underlying run changes (e.g. navigating between runs).
  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  return { status, setStatus, hasTraceId, setHasTraceId, isTracingInstalled, setIsTracingInstalled };
}

// ─── Demo/testing toolbar ─────────────────────────────────────────────────────

export interface AgenticTraceDemoControlsProps extends AgenticTraceDemoState {}

/**
 * Prototype-only control strip for demoing the `AgenticTraceLink` mapping
 * matrix without needing separately seeded mock runs for every combination.
 * Not part of the real product UI.
 */
export const AgenticTraceDemoControls: React.FC<AgenticTraceDemoControlsProps> = ({
  status,
  setStatus,
  hasTraceId,
  setHasTraceId,
  isTracingInstalled,
  setIsTracingInstalled,
}) => (
  <Card isCompact isPlain style={{ border: '1px dashed var(--pf-t--global--border--color--default)' }}>
    <CardBody>
      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }} flexWrap={{ default: 'wrap' }}>
        <FlexItem>
          <Content component="small" style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
            Trace link demo controls
          </Content>
        </FlexItem>
        <FlexItem>
          <ToggleGroup aria-label="Simulated run status" isCompact>
            {DEMO_STATUS_OPTIONS.map((option) => (
              <ToggleGroupItem
                key={option}
                text={option}
                isSelected={status === option}
                onChange={() => setStatus(option)}
              />
            ))}
          </ToggleGroup>
        </FlexItem>
        <FlexItem>
          <Switch
            id="agentic-trace-demo-has-trace-id"
            label="Trace captured"
            isChecked={hasTraceId}
            onChange={(_event, checked) => setHasTraceId(checked)}
          />
        </FlexItem>
        <FlexItem>
          <Switch
            id="agentic-trace-demo-tracing-installed"
            label="Tracing (COO) installed"
            isChecked={isTracingInstalled}
            onChange={(_event, checked) => setIsTracingInstalled(checked)}
          />
        </FlexItem>
      </Flex>
    </CardBody>
  </Card>
);

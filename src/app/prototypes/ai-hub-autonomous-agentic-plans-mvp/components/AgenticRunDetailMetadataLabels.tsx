import React, { useEffect } from 'react';
import { FlexItem, Label } from '@patternfly/react-core';
import { NamespaceResourceLink } from './NamespaceResourceLink';
import { useMulticlusterDevMode } from '../context/MulticlusterDevContext';
import {
  resolvePlanTargetCluster,
  withAgenticRunTargetCluster,
} from '../pages/ai-hub-plans-v2/PlansFilterToolbar';
import type { PlanRow } from '../pages/ai-hub-plans-v2/PlansAndApprovalsTab';

export { withAgenticRunTargetCluster } from '../pages/ai-hub-plans-v2/PlansFilterToolbar';

type AgenticRunDetailMetadataLabelsProps = {
  plan: PlanRow;
  /** Optional labels rendered after Trigger domain (e.g. ACS console stub). */
  trailingLabels?: React.ReactNode;
};

/** Target cluster, namespace, and trigger domain — shared across all Agentic run detail routes (HPUX-2155). */
export const AgenticRunDetailMetadataLabels: React.FC<AgenticRunDetailMetadataLabelsProps> = ({
  plan,
  trailingLabels,
}) => {
  const { isMultiClusterMode } = useMulticlusterDevMode();
  const activeRun = withAgenticRunTargetCluster(plan);
  const targetCluster = resolvePlanTargetCluster(activeRun);

  useEffect(() => {
    // DEV ONLY - REMOVE FOR PRODUCTION — verify drill-down row payload during multicluster review.
    console.log('Current Run Data:', activeRun);
  }, [plan]);

  return (
    <>
      {isMultiClusterMode ? (
        <FlexItem>
          <Label color="grey" variant="outline" isCompact>
            Target cluster: {targetCluster}
          </Label>
        </FlexItem>
      ) : null}
      {plan.namespace ? (
        <FlexItem>
          <NamespaceResourceLink name={plan.namespace} />
        </FlexItem>
      ) : null}
      <FlexItem>
        <Label color="grey" variant="outline" isCompact>
          Trigger domain: {plan.triggerDomain}
        </Label>
      </FlexItem>
      {trailingLabels}
    </>
  );
};

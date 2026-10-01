import React from 'react';
import { Card, CardBody, Switch } from '@patternfly/react-core';
import { useMulticlusterDevMode } from '../context/MulticlusterDevContext';

/** DEV ONLY - REMOVE FOR PRODUCTION — HPUX-2155 multicluster UI simulation toggle. */
export const MulticlusterDevToggle: React.FC = () => {
  const { isMultiClusterMode, setMultiClusterMode } = useMulticlusterDevMode();

  return (
    <Card
      isCompact
      style={{
        position: 'fixed',
        bottom: 'var(--pf-t--global--spacer--md)',
        left: 'var(--pf-t--global--spacer--md)',
        zIndex: 9999,
        boxShadow: 'var(--pf-t--global--box-shadow--md)',
        maxWidth: '280px',
      }}
      aria-label="Development multicluster mode controller"
    >
      <CardBody style={{ padding: 'var(--pf-t--global--spacer--sm) var(--pf-t--global--spacer--md)' }}>
        <Switch
          id="dev-toggle-multicluster-mode"
          label="Dev Toggle: Multicluster Mode"
          isChecked={isMultiClusterMode}
          onChange={(_event, checked) => setMultiClusterMode(checked)}
        />
      </CardBody>
    </Card>
  );
};

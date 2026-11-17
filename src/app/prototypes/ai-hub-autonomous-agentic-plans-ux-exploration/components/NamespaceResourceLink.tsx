import React from 'react';
import { Button, Flex, FlexItem } from '@patternfly/react-core';

/** OpenShift console–style resource kind badge (Plan, Namespace, etc.). */
export const OpenShiftResourceBadge: React.FC<{ label: string; backgroundColor: string }> = ({
  label,
  backgroundColor,
}) => (
  <span
    aria-hidden
    style={{
      backgroundColor,
      borderRadius: '20px',
      color: 'var(--pf-t--color--white)',
      display: 'inline-block',
      flexShrink: 0,
      fontSize: '14px',
      fontWeight: 600,
      lineHeight: '20px',
      minWidth: 20,
      height: 20,
      padding: '0 6px',
      textAlign: 'center',
      whiteSpace: 'nowrap',
    }}
  >
    {label}
  </span>
);

/** Green "NS" badge — matches OpenShift console namespace resource kind. */
export const NamespaceResourceBadge: React.FC = () => (
  <OpenShiftResourceBadge label="NS" backgroundColor="#1e4f18" />
);

/**
 * OpenShift console-style namespace reference: green "NS" resource badge +
 * inline text link (matches Workloads / Projects namespace surfacing).
 */
export const NamespaceResourceLink: React.FC<{ name: string }> = ({ name }) => (
  <Flex
    alignItems={{ default: 'alignItemsCenter' }}
    gap={{ default: 'gapSm' }}
    flexWrap={{ default: 'nowrap' }}
    style={{ minWidth: 0 }}
  >
    <FlexItem>
      <NamespaceResourceBadge />
    </FlexItem>
    <FlexItem style={{ minWidth: 0, wordBreak: 'break-word' }}>
      <Button
        variant="link"
        isInline
        component="a"
        href={`/k8s/cluster/namespaces/${encodeURIComponent(name)}`}
        onClick={(event) => event.preventDefault()}
        aria-label={`Namespace ${name}`}
      >
        {name}
      </Button>
    </FlexItem>
  </Flex>
);

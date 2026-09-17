import React from 'react';
import { Label } from '@patternfly/react-core';

/**
 * Tech Preview badge — follows the OpenShift Console shared-component convention.
 *
 * Canonical reference:
 *   openshift/console → frontend/packages/console-shared/src/components/badges/TechPreviewBadge.tsx
 *   kubevirt-plugin   → src/utils/components/TechPreviewBadge/TechPreviewBadge.tsx
 *     (switched to PF Label in Aug 2025: rszwajko@redhat.com, commit 635f6bd)
 *
 * Design spec: https://openshift.github.io/openshift-origin-design/conventions/documentation/badges.html
 *   – Orange color, compact size, placed to the right of the associated label.
 */
export const TechPreviewBadge: React.FC = () => (
  <Label color="orange" isCompact>Tech Preview</Label>
);

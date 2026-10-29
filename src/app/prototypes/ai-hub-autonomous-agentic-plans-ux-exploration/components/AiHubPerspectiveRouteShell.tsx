import React from 'react';
import { PrototypePerspectiveUrlSync } from './PrototypePerspectiveUrlSync';

/** Mounts perspective URL sync inside AppLayout's ActivePerspectiveProvider. */
export const withPerspectiveUrlSync = (page: React.ReactElement): React.ReactElement => (
  <>
    <PrototypePerspectiveUrlSync />
    {page}
  </>
);

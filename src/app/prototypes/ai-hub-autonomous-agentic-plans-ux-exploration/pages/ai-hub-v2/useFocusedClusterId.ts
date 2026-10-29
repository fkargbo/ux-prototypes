import { useSyncExternalStore } from 'react';
import {
  FOCUSED_CLUSTER_CHANGE_EVENT,
  readFocusedClusterIdFromSession,
} from '../../components/autonomousAiObserve/focusClusterSession';
import { DEFAULT_CORE_PLATFORMS_CLUSTER_ID } from '../../components/autonomousAiObserve/data';

function readEffectiveClusterId(): string {
  return readFocusedClusterIdFromSession() ?? DEFAULT_CORE_PLATFORMS_CLUSTER_ID;
}

/**
 * Stays aligned with the Autonomous analysis cluster context (session + `FOCUSED_CLUSTER_CHANGE_EVENT`).
 * Used only by v2 hub cluster inventory; v1.0 does not mount that UI.
 */
export function useFocusedClusterId(): string {
  return useSyncExternalStore(
    (onStoreChange) => {
      const handler = () => onStoreChange();
      window.addEventListener(FOCUSED_CLUSTER_CHANGE_EVENT, handler);
      window.addEventListener('storage', handler);
      return () => {
        window.removeEventListener(FOCUSED_CLUSTER_CHANGE_EVENT, handler);
        window.removeEventListener('storage', handler);
      };
    },
    readEffectiveClusterId,
    readEffectiveClusterId
  );
}

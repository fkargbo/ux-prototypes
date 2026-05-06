import { useSyncExternalStore } from 'react';
import {
  FOCUSED_CLUSTER_CHANGE_EVENT,
  readFocusedClusterIdFromSession,
} from '../components/autonomousAiObserve/focusClusterSession';
import { DEFAULT_CORE_PLATFORMS_CLUSTER_ID } from '../components/autonomousAiObserve/data';

function readEffectiveClusterId(): string {
  return readFocusedClusterIdFromSession() ?? DEFAULT_CORE_PLATFORMS_CLUSTER_ID;
}

/**
 * Stays aligned with the Autonomous analysis cluster picker (session + cross-component events).
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

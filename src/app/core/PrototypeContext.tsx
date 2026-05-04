/**
 * Prototype Context
 * 
 * React context for managing the currently active prototype
 */

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { PrototypeModule, PrototypeContextType } from './types';
import { prototypeRegistry } from './PrototypeRegistry';
import { findPrototypeIdForPath, getRouterPathname } from './deepLinkUtils';

const PrototypeContext = createContext<PrototypeContextType | undefined>(undefined);

interface PrototypeProviderProps {
  children: ReactNode;
}

export const PrototypeProvider: React.FC<PrototypeProviderProps> = ({ children }) => {
  const [currentPrototype, setCurrentPrototype] = useState<PrototypeModule | null>(null);
  const [availablePrototypes, setAvailablePrototypes] = useState<PrototypeModule[]>([]);
  /** Start true so we do not flash the launcher while restoring session or initializing the registry */
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Load a prototype by ID
   */
  const loadPrototype = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`🚀 Loading prototype: ${id}`);

      const prototype = prototypeRegistry.get(id);
      
      if (!prototype) {
        throw new Error(`Prototype with ID "${id}" not found in registry`);
      }

      // Run previous prototype teardown when switching without going through the launcher
      if (currentPrototype && currentPrototype.config.id !== id) {
        console.log(`👋 Deactivating previous prototype: ${currentPrototype.config.id}`);
        if (currentPrototype.onDeactivate) {
          await currentPrototype.onDeactivate();
        }
      }

      // Call lifecycle hook if defined
      if (prototype.onActivate) {
        await prototype.onActivate();
      }

      setCurrentPrototype(prototype);
      
      // Store in sessionStorage for persistence across page reloads
      sessionStorage.setItem('activePrototypeId', id);
      
      console.log(`✅ Loaded prototype: ${prototype.config.name}`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load prototype');
      setError(error);
      console.error('❌ Failed to load prototype:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPrototype]);

  const loadPrototypeRef = useRef(loadPrototype);
  loadPrototypeRef.current = loadPrototype;

  /**
   * Unload the current prototype
   */
  const unloadPrototype = useCallback(async () => {
    if (!currentPrototype) return;

    console.log(`👋 Unloading prototype: ${currentPrototype.config.id}`);

    // Call lifecycle hook if defined
    if (currentPrototype.onDeactivate) {
      await currentPrototype.onDeactivate();
    }

    setCurrentPrototype(null);
    sessionStorage.removeItem('activePrototypeId');
    
    console.log('✅ Prototype unloaded');
  }, [currentPrototype]);

  /**
   * Initialize registry and restore last active prototype from session (same tab reload / dev refresh)
   */
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        console.log('🚀 Initializing prototype system...');
        
        await prototypeRegistry.initialize();
        
        const prototypes = prototypeRegistry.getAll();
        console.log(`📦 Loaded ${prototypes.length} prototypes`, prototypes.map((p) => p.config.id));
        setAvailablePrototypes(prototypes);
        
        const savedId = sessionStorage.getItem('activePrototypeId');
        if (savedId && prototypeRegistry.get(savedId)) {
          console.log(`♻️ Restoring prototype from session: ${savedId}`);
          await loadPrototype(savedId);
        } else {
          setIsLoading(false);
          console.log('✅ Ready — pick a prototype from the launcher');
        }
      } catch (err) {
        console.error('❌ Failed to initialize prototype system:', err);
        setError(err as Error);
        setIsLoading(false);
      }
    };
    
    initializeAndRestore();
  }, [loadPrototype]);

  const value: PrototypeContextType = {
    currentPrototype,
    availablePrototypes,
    loadPrototype,
    unloadPrototype,
    isLoading,
    isBootstrapping,
    error,
  };

  return (
    <PrototypeContext.Provider value={value}>
      {children}
    </PrototypeContext.Provider>
  );
};

/**
 * Hook to access prototype context
 */
export const usePrototype = (): PrototypeContextType => {
  const context = useContext(PrototypeContext);
  if (!context) {
    throw new Error('usePrototype must be used within PrototypeProvider');
  }
  return context;
};

/**
 * Hook to get current prototype config
 */
export const usePrototypeConfig = () => {
  const { currentPrototype } = usePrototype();
  return currentPrototype?.config || null;
};

/**
 * Hook to check if a specific prototype is active
 */
export const useIsPrototypeActive = (prototypeId: string): boolean => {
  const { currentPrototype } = usePrototype();
  return currentPrototype?.config.id === prototypeId;
};


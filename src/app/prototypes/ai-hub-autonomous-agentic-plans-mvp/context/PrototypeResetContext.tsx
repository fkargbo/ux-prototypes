import { createContext, useContext } from 'react';

type PrototypeResetContextValue = {
  resetPrototype: () => void;
};

export const PrototypeResetContext = createContext<PrototypeResetContextValue | null>(null);

export function usePrototypeReset(): PrototypeResetContextValue {
  const context = useContext(PrototypeResetContext);
  if (!context) {
    throw new Error('usePrototypeReset must be used within AiHubPrototypeRoot');
  }
  return context;
}

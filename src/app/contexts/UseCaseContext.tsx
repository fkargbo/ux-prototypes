import React, { createContext, useContext, useState, ReactNode } from 'react';
import { mockDatabase } from '@app/data/mockDatabase';
import { globalMockDatabase } from '@app/data/globalMockDatabase';

export type UseCaseType = 'use-case-1' | 'use-case-2' | 'use-case-aaq' | 'use-case-cclm' | null;

interface UseCaseContextType {
  useCase: UseCaseType;
  setUseCase: (useCase: UseCaseType) => void;
  database: typeof mockDatabase | typeof globalMockDatabase;
  useCaseTitle: string;
  useCasePersona: string;
}

const UseCaseContext = createContext<UseCaseContextType | undefined>(undefined);

export const UseCaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [useCase, setUseCase] = useState<UseCaseType>(null);

  const database = useCase === 'use-case-1' ? globalMockDatabase : mockDatabase;
  
  const useCaseTitle = useCase === 'use-case-1' 
    ? 'ACMsRBACUseCase1: Fleet Admin - Tenant Delegation'
    : useCase === 'use-case-2'
    ? 'ACMsRBACUseCase2: Tenant Admin - Project Access (Walter Joseph Kovacs)'
    : useCase === 'use-case-aaq'
    ? 'AAQ: Virtualization Quota Management'
    : useCase === 'use-case-cclm'
    ? 'Cross Cluster Live Migration'
    : '';

  const useCasePersona = useCase === 'use-case-1'
    ? 'Adrian Veidt (Fleet Admin)'
    : useCase === 'use-case-2'
    ? 'Walter Joseph Kovacs (Tenant Admin)'
    : useCase === 'use-case-aaq'
    ? 'Dan Dreiberg (Virtualization Administrator)'
    : useCase === 'use-case-cclm'
    ? 'Nelson Gardner (Platform Administrator)'
    : '';

  return (
    <UseCaseContext.Provider 
      value={{ 
        useCase, 
        setUseCase, 
        database, 
        useCaseTitle, 
        useCasePersona 
      }}
    >
      {children}
    </UseCaseContext.Provider>
  );
};

export const useUseCaseContext = () => {
  const context = useContext(UseCaseContext);
  if (!context) {
    throw new Error('useUseCaseContext must be used within UseCaseProvider');
  }
  return context;
};


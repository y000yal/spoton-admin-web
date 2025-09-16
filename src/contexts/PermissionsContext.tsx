import React, { createContext, useContext, ReactNode } from 'react';
import { usePermissionsMap } from '../hooks/usePermissions';
import type { Permission } from '../types';

interface PermissionsContextType {
  permissions: Permission[];
  permissionsMap: Record<string, Permission>;
  isLoading: boolean;
  error: any;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

interface PermissionsProviderProps {
  children: ReactNode;
}

export const PermissionsProvider: React.FC<PermissionsProviderProps> = ({ children }) => {
  const { permissions, permissionsMap, isLoading, error } = usePermissionsMap();

  return (
    <PermissionsContext.Provider value={{
      permissions,
      permissionsMap,
      isLoading,
      error
    }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissionsContext = (): PermissionsContextType => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissionsContext must be used within a PermissionsProvider');
  }
  return context;
};

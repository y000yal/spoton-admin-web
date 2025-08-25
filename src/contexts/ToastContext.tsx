import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastContainer from '../components/UI/ToastContainer';
import type { ToastItem } from '../components/UI/ToastContainer';
import type { ToastType } from '../components/UI/Toast';

interface ToastContextType {
  showToast: (type: ToastType, message: string, title?: string, duration?: number) => void;
  showSuccess: (message: string, title?: string, duration?: number) => void;
  showError: (message: string, title?: string, duration?: number) => void;
  showWarning: (message: string, title?: string, duration?: number) => void;
  showInfo: (message: string, title?: string, duration?: number) => void;
  closeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((
    type: ToastType, 
    message: string, 
    title?: string, 
    duration: number = 5000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastItem = { id, type, message, title, duration };
    
    setToasts(prev => [...prev, newToast]);
  }, []);

  const showSuccess = useCallback((message: string, title?: string, duration?: number) => {
    showToast('success', message, title, duration);
  }, [showToast]);

  const showError = useCallback((message: string, title?: string, duration?: number) => {
    showToast('error', message, title, duration);
  }, [showToast]);

  const showWarning = useCallback((message: string, title?: string, duration?: number) => {
    showToast('warning', message, title, duration);
  }, [showToast]);

  const showInfo = useCallback((message: string, title?: string, duration?: number) => {
    showToast('info', message, title, duration);
  }, [showToast]);

  const closeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const value: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={closeToast} />
    </ToastContext.Provider>
  );
};

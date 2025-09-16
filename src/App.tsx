import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { PermissionsProvider } from './contexts/PermissionsContext';
import AppRoutes from './routes/AppRoutes';

// Main App Component
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AuthProvider>
        <PermissionsProvider>
          <ToastProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </ToastProvider>
        </PermissionsProvider>
      </AuthProvider>
    </Provider>
  );
};

export default App;

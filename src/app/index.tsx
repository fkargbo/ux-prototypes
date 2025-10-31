import * as React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/react-styles/css/components/Wizard/wizard.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@app/AppLayout/AppLayout';
import { AppRoutes } from '@app/routes';
import { UseCaseProvider, useUseCaseContext } from '@app/contexts/UseCaseContext';
import { ImpersonationProvider } from '@app/contexts/ImpersonationContext';
import { QuotasProvider } from '@app/contexts/QuotasContext';
import { UseCaseSelector } from '@app/UseCaseSelector/UseCaseSelector';
import '@app/app.css';

const AppContent: React.FunctionComponent = () => {
  const { useCase } = useUseCaseContext();

  // If no use case is selected, show the standalone selector
  if (!useCase) {
    return (
      <Routes>
        <Route path="/" element={<UseCaseSelector />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // If use case is selected, show the full app with layout
  return (
    <ImpersonationProvider>
      <QuotasProvider>
        <AppLayout>
          <AppRoutes />
        </AppLayout>
      </QuotasProvider>
    </ImpersonationProvider>
  );
};

const App: React.FunctionComponent = () => {
  // Set basename for GitHub Pages in production
  const basename = process.env.NODE_ENV === 'production' ? '/acm-user-interface' : '/';
  
  return (
    <Router basename={basename}>
      <UseCaseProvider>
        <AppContent />
      </UseCaseProvider>
    </Router>
  );
};

export default App;

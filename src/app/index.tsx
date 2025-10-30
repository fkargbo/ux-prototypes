import * as React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/react-styles/css/components/Wizard/wizard.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppLayout } from '@app/AppLayout/AppLayout';
import { AppRoutes } from '@app/routes';
import { UseCaseProvider } from '@app/contexts/UseCaseContext';
import { ImpersonationProvider } from '@app/contexts/ImpersonationContext';
import '@app/app.css';

const App: React.FunctionComponent = () => (
  <Router>
    <UseCaseProvider>
      <ImpersonationProvider>
        <AppLayout>
          <AppRoutes />
        </AppLayout>
      </ImpersonationProvider>
    </UseCaseProvider>
  </Router>
);

export default App;

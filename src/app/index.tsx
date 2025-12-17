import * as React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly-charts.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppLayout } from '@app/AppLayout/AppLayout';
import { AppRoutes } from '@app/routes';
import '@app/app.css';

// Basename for routing (GitHub Pages deploys to /AlertingUI/)
const basename = process.env.NODE_ENV === 'production' ? '/AlertingUI' : '/';

const App: React.FunctionComponent = () => (
  <Router basename={basename}>
    <AppLayout>
      <AppRoutes />
    </AppLayout>
  </Router>
);

export default App;

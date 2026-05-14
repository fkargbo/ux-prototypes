import * as React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/react-styles/css/components/Wizard/wizard.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PrototypeProvider, usePrototype } from '@app/core/PrototypeContext';
import PrototypeLauncher from '@app/core/PrototypeLauncher';
import '@app/app.css';

const AppContent: React.FunctionComponent = () => {
  const { currentPrototype, isLoading, isBootstrapping, error } = usePrototype();

  console.log('AppContent render:', { currentPrototype: currentPrototype?.config?.id, isLoading, isBootstrapping, error });

  // Show error state
  if (error) {
    return (
      <div style={{ padding: '40px', color: 'red' }}>
        <h1>Error Loading Prototypes</h1>
        <pre>{error.message}</pre>
      </div>
    );
  }

  // Show loading while registry/deep link bootstrap runs or a prototype is activating
  if (isBootstrapping || isLoading) {
    return <div style={{ padding: '40px' }}>Loading prototype...</div>;
  }

  // If no prototype is selected, show the launcher
  if (!currentPrototype) {
    console.log('Rendering PrototypeLauncher');
    return <PrototypeLauncher />;
  }

  // If prototype is selected, render its component wrapper
  const PrototypeApp = currentPrototype.component;
  if (!PrototypeApp) {
    return <div style={{ padding: '40px', color: 'red' }}>Error: Prototype component not found</div>;
  }
  
  console.log('Rendering prototype:', currentPrototype.config.id);
  return <PrototypeApp />;
};

const App: React.FunctionComponent = () => {
  console.log('App component rendering');
  
  // GitHub project pages: https://<user>.github.io/<repo>/ — basename is `/<repo>` (set at build via webpack).
  const basename =
    process.env.NODE_ENV === 'production'
      ? String(process.env.GITHUB_PAGES_BASENAME || '/ux-prototypes').replace(/\/$/, '')
      : '/';
  
  return (
    <Router basename={basename}>
      <PrototypeProvider>
        <AppContent />
      </PrototypeProvider>
    </Router>
  );
};

export default App;

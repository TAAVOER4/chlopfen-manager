
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { MigrationService } from './services/MigrationService';

// Run the initial data setup/migration
MigrationService.runInitialSetup().catch(console.error);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { DocumentViewerProvider } from './components/DocumentViewer';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ProjectView from './pages/ProjectView';
import FeatureDetail from './pages/FeatureDetail';
import ApprovalQueue from './pages/ApprovalQueue';
import ClientPortal from './pages/ClientPortal';
import AuditLog from './pages/AuditLog';

export default function App() {
  return (
    <HashRouter>
      <ToastProvider>
        <AppProvider>
          <DocumentViewerProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="projects/:projectId" element={<ProjectView />} />
                <Route path="projects/:projectId/features/:featureId" element={<FeatureDetail />} />
                <Route path="approvals" element={<ApprovalQueue />} />
                <Route path="portal" element={<ClientPortal />} />
                <Route path="audit" element={<AuditLog />} />
                <Route path="*" element={<Dashboard />} />
              </Route>
            </Routes>
          </DocumentViewerProvider>
        </AppProvider>
      </ToastProvider>
    </HashRouter>
  );
}

import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/landing/LandingPage';
import { ModalProvider } from './context/ModalContext';
import { CRMProvider } from '@/context/CRMContext';
import { UserProvider } from '@/context/UserContext';
import FreeTrialModal from './components/ui/FreeTrialModal';
import Layout from '@/modules/crm/components/Layout';
import Dashboard from '@/modules/crm/components/Dashboard';
import Embudo from '@/modules/crm/components/Embudo';
import KanbanBoard from '@/modules/crm/components/prospects/KanbanBoard';
import ProspectTable from '@/modules/crm/components/prospects/ProspectTable';
import ProspectDetail from '@/modules/crm/components/prospects/ProspectDetail';
import Login from './components/auth/Login';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <CRMProvider>
          <ModalProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />

              {/* Rutas del CRM */}
              <Route path="/crm/login" element={<Login />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/crm" element={<Layout />}>
                  <Route index element={<Navigate to="/crm/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="embudo" element={<Embudo />} />
                  <Route path="prospectos" element={<ProspectTable />} />
                  <Route path="prospectos/kanban" element={<KanbanBoard />} />
                  <Route path="prospectos/detalle" element={<ProspectDetail />} />
                </Route>
              </Route>
            </Routes>
            <FreeTrialModal />
          </ModalProvider>
        </CRMProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;

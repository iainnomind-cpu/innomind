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
import QuoteList from '@/modules/crm/components/quotes/QuoteList';
import QuoteFormWrapper from '@/modules/crm/components/quotes/QuoteFormWrapper';
import QuoteDetailWrapper from '@/modules/crm/components/quotes/QuoteDetailWrapper';
import QuoteDetailView from '@/modules/crm/components/quotes/QuoteDetailView';
import ProductCatalog from '@/modules/crm/components/quotes/ProductCatalog';
import QuoteTemplates from '@/modules/crm/components/quotes/QuoteTemplates';
import TemplateDetail from '@/modules/crm/components/quotes/TemplateDetail';
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

                  {/* Rutas de Cotizaciones */}
                  <Route path="quotes" element={<QuoteDetailWrapper />}>
                    <Route index element={<QuoteList />} />
                    <Route path="catalogo" element={<ProductCatalog />} />
                    <Route path="plantillas" element={<QuoteTemplates />} />
                    <Route path="new" element={<QuoteFormWrapper />} />
                    <Route path="templates/:id" element={<TemplateDetail />} />
                    <Route path=":id" element={<QuoteDetailView />} />
                  </Route>
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

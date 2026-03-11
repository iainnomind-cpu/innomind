import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/landing/LandingPage';
import RetailPage from './components/landing/industries/RetailPage';
import ServicesPage from './components/landing/industries/ServicesPage';
import ManufacturePage from './components/landing/industries/ManufacturePage';
import LogisticsPage from './components/landing/industries/LogisticsPage';
import HealthPage from './components/landing/industries/HealthPage';
import EducationPage from './components/landing/industries/EducationPage';
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

import QuoteTemplates from '@/modules/crm/components/quotes/QuoteTemplates';
import TemplateDetail from '@/modules/crm/components/quotes/TemplateDetail';
import CompanySettings from '@/modules/crm/components/CompanySettings';
import Calendar from '@/modules/crm/components/calendar/Calendar';
import InventoryLayout from '@/modules/inventory/InventoryLayout';
import ProductMasterList from '@/modules/inventory/components/ProductMasterList';
import StockControl from '@/modules/inventory/components/StockControl';
import InventoryMovements from '@/modules/inventory/components/InventoryMovements';
import FinanceLayout from '@/modules/finance/FinanceLayout';
import ProcurementLayout from '@/modules/procurement/ProcurementLayout';
import WorkspaceLayout from '@/modules/workspace/WorkspaceLayout';
import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';

import { AppProviders } from './components/providers/AppProviders';

function App() {
  return (
    <AppProviders>
      <FreeTrialModal />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/industrias/retail" element={<RetailPage />} />
        <Route path="/industrias/servicios" element={<ServicesPage />} />
        <Route path="/industrias/manufactura" element={<ManufacturePage />} />
        <Route path="/industrias/logistica" element={<LogisticsPage />} />
        <Route path="/industrias/salud" element={<HealthPage />} />
        <Route path="/industrias/educacion" element={<EducationPage />} />

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
            <Route path="calendar" element={<Calendar />} />
            <Route path="settings" element={<CompanySettings />} />

            {/* Rutas de Cotizaciones */}
            <Route path="quotes" element={<QuoteDetailWrapper />}>
              <Route index element={<QuoteList />} />
              <Route path="plantillas" element={<QuoteTemplates />} />
              <Route path="new" element={<QuoteFormWrapper />} />
              <Route path="templates/:id" element={<TemplateDetail />} />
              <Route path=":id" element={<QuoteDetailView />} />
            </Route>

            {/* Rutas del Inventario Maestro */}
            <Route path="inventory" element={<InventoryLayout />}>
              <Route index element={<ProductMasterList />} />
              <Route path="stock" element={<StockControl />} />
              <Route path="movements" element={<InventoryMovements />} />
            </Route>

            {/* Rutas de Finanzas y Tesorería */}
            <Route path="finance/*" element={<FinanceLayout />} />

            {/* Rutas de Workspace (Nodo) */}
            <Route path="workspace/*" element={<WorkspaceLayout />} />
          </Route>

          {/* Módulo de Compras (Ruta Raíz /compras) */}
          <Route path="/compras/*" element={<Layout />}>
            <Route path="*" element={<ProcurementLayout />} />
          </Route>
        </Route>
      </Routes>
    </AppProviders>
  );
}

export default App;

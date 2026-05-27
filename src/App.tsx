import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/landing/LandingPage';
import RetailPage from './components/landing/industries/RetailPage';
import ServicesPage from './components/landing/industries/ServicesPage';
import ManufacturePage from './components/landing/industries/ManufacturePage';
import LogisticsPage from './components/landing/industries/LogisticsPage';
import HealthPage from './components/landing/industries/HealthPage';
import EducationPage from './components/landing/industries/EducationPage';
import FAQPage from './components/landing/FAQPage';
import SoportePage from './components/landing/SoportePage';
import PreciosPage from './components/landing/PreciosPage';
import FreeTrialModal from './components/ui/FreeTrialModal';
import DemoRequestModal from './components/ui/DemoRequestModal';
import TrakLayout from '@/modules/trak/TrakLayout';
import TrakDashboard from '@/modules/trak/TrakDashboard';
import ClientList from '@/modules/trak/components/clients/ClientList';
import ProjectList from '@/modules/trak/components/projects/ProjectList';
import ProjectForm from '@/modules/trak/components/projects/ProjectForm';
import ProjectDetail from '@/modules/trak/components/projects/ProjectDetail';
import GlobalTaskList from '@/modules/trak/components/tasks/GlobalTaskList';
import TrakQuoteList from '@/modules/trak/components/quotes/QuoteList';
import TrakQuoteForm from '@/modules/trak/components/quotes/QuoteForm';
import ReportsDashboard from '@/modules/trak/components/reports/ReportsDashboard';
import EmployeeList from '@/modules/trak/components/hr/EmployeeList';
import EmployeeForm from '@/modules/trak/components/hr/EmployeeForm';
import TrakCalendar from '@/modules/trak/components/calendar/TrakCalendar';
import InventoryList from '@/modules/trak/components/inventory/InventoryList';
import TrakSettings from '@/modules/trak/components/settings/TrakSettings';
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
import ResetPassword from './components/auth/ResetPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { FEATURES } from '@/config/features';
import SupportLayout from '@/modules/support/SupportLayout';
import UserTicketList from '@/modules/support/components/UserTicketList';
import NewTicketForm from '@/modules/support/components/NewTicketForm';
import TicketDetail from '@/modules/support/components/TicketDetail';

import { AppProviders } from './components/providers/AppProviders';

function App() {
  return (
    <AppProviders>
      <FreeTrialModal />
      <DemoRequestModal />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/industrias/retail" element={<RetailPage />} />
        <Route path="/industrias/servicios" element={<ServicesPage />} />
        <Route path="/industrias/manufactura" element={<ManufacturePage />} />
        <Route path="/industrias/logistica" element={<LogisticsPage />} />
        <Route path="/industrias/salud" element={<HealthPage />} />
        <Route path="/industrias/educacion" element={<EducationPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/soporte" element={<SoportePage />} />
        <Route path="/precios" element={<PreciosPage />} />

        {/* Rutas del CRM */}
        <Route path="/crm/login" element={<Login />} />
        <Route path="/crm/reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          {/* Rutas de Trak (Project Tracker - SaaS independiente) */}
          <Route path="/trak" element={<TrakLayout />}>
            <Route index element={<TrakDashboard />} />
            <Route path="clients" element={<ClientList />} />
            <Route path="projects" element={<ProjectList />} />
            <Route path="projects/new" element={<ProjectForm />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="projects/:id/edit" element={<ProjectForm />} />
            <Route path="tasks" element={<GlobalTaskList />} />
            <Route path="quotes" element={<TrakQuoteList />} />
            <Route path="quotes/:id" element={<TrakQuoteForm />} />
            <Route path="reports" element={<ReportsDashboard />} />
            <Route path="hr" element={<EmployeeList />} />
            <Route path="hr/:id" element={<EmployeeForm />} />
            <Route path="calendar" element={<TrakCalendar />} />
            <Route path="inventory" element={<InventoryList />} />
            <Route path="settings" element={<TrakSettings />} />
          </Route>

          <Route path="/crm" element={<Layout />}>
            <Route index element={<Navigate to="/crm/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="embudo" element={<Embudo />} />
            <Route path="prospectos" element={<ProspectTable />} />
            <Route path="prospectos/kanban" element={<KanbanBoard />} />
            <Route path="prospectos/detalle" element={<ProspectDetail />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="settings" element={<CompanySettings />} />

            {/* Rutas de Soporte */}
            <Route path="support" element={<SupportLayout />}>
              <Route index element={<UserTicketList />} />
              <Route path="new" element={<NewTicketForm />} />
              <Route path=":ticketId" element={<TicketDetail />} />
            </Route>

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
            <Route path="workspace/*" element={FEATURES.enableNodo ? <WorkspaceLayout /> : <Navigate to="/crm/dashboard" replace />} />
          </Route>

          {/* Módulo de Compras (Ruta Raíz /compras) */}
          <Route path="/compras/*" element={FEATURES.enableCompras ? <Layout /> : <Navigate to="/crm/dashboard" replace />}>
            <Route path="*" element={<ProcurementLayout />} />
          </Route>
        </Route>
      </Routes>
    </AppProviders>
  );
}

export default App;

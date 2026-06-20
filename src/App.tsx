import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { FEATURES } from '@/config/features';
import { AppProviders } from './components/providers/AppProviders';
import ScrollToTop from './components/routing/ScrollToTop';

// Static Imports (Critical Path)
import LandingPage from './components/landing/LandingPage';
import FreeTrialModal from './components/ui/FreeTrialModal';
import DemoRequestModal from './components/ui/DemoRequestModal';
import Login from './components/auth/Login';
import ResetPassword from './components/auth/ResetPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Lazy Imports - Landing Pages
const RetailPage = React.lazy(() => import('./components/landing/industries/RetailPage'));
const ServicesPage = React.lazy(() => import('./components/landing/industries/ServicesPage'));
const ManufacturePage = React.lazy(() => import('./components/landing/industries/ManufacturePage'));
const LogisticsPage = React.lazy(() => import('./components/landing/industries/LogisticsPage'));
const HealthPage = React.lazy(() => import('./components/landing/industries/HealthPage'));
const EducationPage = React.lazy(() => import('./components/landing/industries/EducationPage'));
const FAQPage = React.lazy(() => import('./components/landing/FAQPage'));
const BlogPage = React.lazy(() => import('./components/landing/BlogPage'));
const SoportePage = React.lazy(() => import('./components/landing/SoportePage'));
const PreciosPage = React.lazy(() => import('./components/landing/PreciosPage'));
const CorePage = React.lazy(() => import('./components/landing/platform/CorePage'));
const TrakPage = React.lazy(() => import('./components/landing/platform/TrakPage'));
const ChatbotsPage = React.lazy(() => import('./components/landing/platform/ChatbotsPage'));
const MensajeriaPage = React.lazy(() => import('./components/landing/platform/MensajeriaPage'));
const PrivacidadPage = React.lazy(() => import('./components/landing/legal/PrivacidadPage'));
const TerminosPage = React.lazy(() => import('./components/landing/legal/TerminosPage'));
const SobreNosotrosPage = React.lazy(() => import('./components/landing/SobreNosotrosPage'));

// Lazy Imports - Trak
const TrakLayout = React.lazy(() => import('@/modules/trak/TrakLayout'));
const TrakDashboard = React.lazy(() => import('@/modules/trak/TrakDashboard'));
const ClientList = React.lazy(() => import('@/modules/trak/components/clients/ClientList'));
const ClientProfile = React.lazy(() => import('@/modules/trak/components/clients/ClientProfile'));
const ProjectList = React.lazy(() => import('@/modules/trak/components/projects/ProjectList'));
const ProjectForm = React.lazy(() => import('@/modules/trak/components/projects/ProjectForm'));
const ProjectDetail = React.lazy(() => import('@/modules/trak/components/projects/ProjectDetail'));
const GlobalTaskList = React.lazy(() => import('@/modules/trak/components/tasks/GlobalTaskList'));
const TrakQuoteList = React.lazy(() => import('@/modules/trak/components/quotes/QuoteList'));
const TrakQuoteForm = React.lazy(() => import('@/modules/trak/components/quotes/QuoteForm'));
const TrakFinanceDashboard = React.lazy(() => import('@/modules/trak/components/finance/TrakFinanceDashboard'));
const ReportsDashboard = React.lazy(() => import('@/modules/trak/components/reports/ReportsDashboard'));
const EmployeeList = React.lazy(() => import('@/modules/trak/components/hr/EmployeeList'));
const EmployeeForm = React.lazy(() => import('@/modules/trak/components/hr/EmployeeForm'));
const TrakCalendar = React.lazy(() => import('@/modules/trak/components/calendar/TrakCalendar'));
const InventoryList = React.lazy(() => import('@/modules/trak/components/inventory/InventoryList'));
const TrakSettings = React.lazy(() => import('@/modules/trak/components/settings/TrakSettings'));

// Lazy Imports - CRM
const Layout = React.lazy(() => import('@/modules/crm/components/Layout'));
const Dashboard = React.lazy(() => import('@/modules/crm/components/Dashboard'));
const Embudo = React.lazy(() => import('@/modules/crm/components/Embudo'));
const KanbanBoard = React.lazy(() => import('@/modules/crm/components/prospects/KanbanBoard'));
const ProspectTable = React.lazy(() => import('@/modules/crm/components/prospects/ProspectTable'));
const ProspectDetail = React.lazy(() => import('@/modules/crm/components/prospects/ProspectDetail'));
const QuoteList = React.lazy(() => import('@/modules/crm/components/quotes/QuoteList'));
const QuoteFormWrapper = React.lazy(() => import('@/modules/crm/components/quotes/QuoteFormWrapper'));
const QuoteDetailWrapper = React.lazy(() => import('@/modules/crm/components/quotes/QuoteDetailWrapper'));
const QuoteDetailView = React.lazy(() => import('@/modules/crm/components/quotes/QuoteDetailView'));
const QuoteTemplates = React.lazy(() => import('@/modules/crm/components/quotes/QuoteTemplates'));
const TemplateDetail = React.lazy(() => import('@/modules/crm/components/quotes/TemplateDetail'));
const CompanySettings = React.lazy(() => import('@/modules/crm/components/CompanySettings'));
const CalendarWorkspaceHub = React.lazy(() => import('@/modules/crm/components/calendar/CalendarWorkspaceHub'));

// Lazy Imports - Others
const InventoryLayout = React.lazy(() => import('@/modules/inventory/InventoryLayout'));
const ProductMasterList = React.lazy(() => import('@/modules/inventory/components/ProductMasterList'));
const StockControl = React.lazy(() => import('@/modules/inventory/components/StockControl'));
const InventoryMovements = React.lazy(() => import('@/modules/inventory/components/InventoryMovements'));
const FinanceLayout = React.lazy(() => import('@/modules/finance/FinanceLayout'));
const ProcurementLayout = React.lazy(() => import('@/modules/procurement/ProcurementLayout'));
const SupportLayout = React.lazy(() => import('@/modules/support/SupportLayout'));
const UserTicketList = React.lazy(() => import('@/modules/support/components/UserTicketList'));
const NewTicketForm = React.lazy(() => import('@/modules/support/components/NewTicketForm'));
const TicketDetail = React.lazy(() => import('@/modules/support/components/TicketDetail'));

function App() {
  return (
    <AppProviders>
      <ScrollToTop />
      <FreeTrialModal />
      <DemoRequestModal />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/industrias/retail" element={<RetailPage />} />
          <Route path="/industrias/servicios" element={<ServicesPage />} />
          <Route path="/industrias/manufactura" element={<ManufacturePage />} />
          <Route path="/industrias/logistica" element={<LogisticsPage />} />
          <Route path="/industrias/salud" element={<HealthPage />} />
          <Route path="/industrias/educacion" element={<EducationPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/soporte" element={<SoportePage />} />
          <Route path="/sobre-nosotros" element={<SobreNosotrosPage />} />
          <Route path="/precios" element={<PreciosPage />} />
          
          {/* Rutas de Plataforma SaaS */}
          <Route path="/plataforma/core" element={<CorePage />} />
          <Route path="/plataforma/trak" element={<TrakPage />} />
          <Route path="/plataforma/chatbots" element={<ChatbotsPage />} />
          <Route path="/plataforma/mensajeria" element={<MensajeriaPage />} />

          {/* Legal Routes */}
          <Route path="/privacidad" element={<PrivacidadPage />} />
          <Route path="/terminos" element={<TerminosPage />} />

          {/* Modules Routes */}
          <Route path="/crm/login" element={<Login />} />
          <Route path="/crm/reset-password" element={<ResetPassword />} />

          <Route element={<ProtectedRoute />}>
            {/* Rutas de Trak (Project Tracker - SaaS independiente) */}
            <Route path="/trak" element={<TrakLayout />}>
              <Route index element={<TrakDashboard />} />
              <Route path="clients" element={<ClientList />} />
              <Route path="clients/:id" element={<ClientProfile />} />
              <Route path="projects" element={<ProjectList />} />
              <Route path="projects/new" element={<ProjectForm />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="projects/:id/edit" element={<ProjectForm />} />
              <Route path="tasks" element={<GlobalTaskList />} />
              <Route path="quotes" element={<TrakQuoteList />} />
              <Route path="quotes/:id" element={<TrakQuoteForm />} />
              <Route path="finance" element={<TrakFinanceDashboard />} />
              <Route path="reports" element={<ReportsDashboard />} />
              <Route path="hr" element={<EmployeeList />} />
              <Route path="hr/:id" element={<EmployeeForm />} />
              <Route path="calendar" element={<TrakCalendar />} />
              <Route path="inventory" element={<InventoryList />} />
              <Route path="settings" element={<TrakSettings />} />

              {/* Rutas de Soporte Trak */}
              <Route path="support" element={<SupportLayout />}>
                <Route index element={<UserTicketList />} />
                <Route path="new" element={<NewTicketForm />} />
                <Route path=":ticketId" element={<TicketDetail />} />
              </Route>
            </Route>

            <Route path="/crm" element={<Layout />}>
              <Route index element={<Navigate to="/crm/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="embudo" element={<Embudo />} />
              <Route path="prospectos" element={<ProspectTable />} />
              <Route path="prospectos/kanban" element={<KanbanBoard />} />
              <Route path="prospectos/detalle" element={<ProspectDetail />} />
              <Route path="calendar/*" element={<CalendarWorkspaceHub />} />
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

              {/* Nodo ahora vive dentro de Calendario */}
              <Route path="workspace/*" element={<Navigate to={FEATURES.enableNodo ? "/crm/calendar/tasks" : "/crm/calendar"} replace />} />
            </Route>

            {/* Módulo de Compras (Ruta Raíz /compras) */}
            <Route path="/compras/*" element={FEATURES.enableCompras ? <Layout /> : <Navigate to="/crm/dashboard" replace />}>
              <Route path="*" element={<ProcurementLayout />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </AppProviders>
  );
}

export default App;

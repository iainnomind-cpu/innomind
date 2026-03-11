import { Users, LayoutDashboard, Menu, Search, Building2, Trello, LogOut, FileText, Settings, Calendar as CalendarIcon, Package, Receipt, ShoppingCart, Hash } from 'lucide-react';
import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useUsers } from '@/context/UserContext';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { currentUser } = useUsers();

  const menuItems = [
    { id: 'dashboard', label: 'Panel de Control', icon: LayoutDashboard, alwaysVisible: true },
    { id: 'embudo', label: 'Embudo de Ventas', icon: Trello },
    { id: 'prospectos', label: 'Prospectos', icon: Users },
    { id: 'prospectos?tab=clientes', label: 'Clientes', icon: Building2 },
    { id: 'quotes', label: 'Cotizaciones', icon: FileText },
    { id: 'inventory', label: 'Inventario', icon: Package },
    { id: 'finance', label: 'Finanzas', icon: Receipt },
    { id: 'procurement', label: 'Compras', icon: ShoppingCart },
    { id: 'workspace', label: 'Nodo', icon: Hash },
    { id: 'calendar', label: 'Calendario', icon: CalendarIcon },
    { id: 'settings', label: 'Mi Empresa', icon: Settings, adminOnly: true, alwaysVisible: true },
  ];

  const { enabledModules } = useUsers();

  const visibleMenuItems = menuItems.filter(item => {
    if (item.adminOnly && currentUser?.role !== 'ADMIN') return false;
    if (item.alwaysVisible) return true;
    // If no modules configured (legacy or empty), show all
    if (!enabledModules || enabledModules.length === 0) return true;
    // Check if this module's sidebar ID is in enabledModules
    return enabledModules.includes(item.id);
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 flex flex-col`}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
              CRM
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900">Mi CRM</h1>
              <p className="text-xs text-gray-500">Sistema de Gestión</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isClientesTab = item.id === 'prospectos?tab=clientes';
            const isProspectosBase = item.id === 'prospectos';
            const currentSearch = location.search;

            const isActive = isClientesTab
              ? location.pathname.includes('prospectos') && currentSearch.includes('tab=clientes')
              : isProspectosBase
                ? location.pathname.includes('prospectos') && !currentSearch.includes('tab=clientes')
                : item.id === 'procurement'
                  ? location.pathname.includes('/compras')
                  : location.pathname.includes(item.id);

            return (
              <button
                key={item.id}
                onClick={() => {
                  const path = item.id === 'procurement' ? '/compras' : `/crm/${item.id}`;
                  navigate(path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Usuario</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
              title="Cerrar Sessión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600"
            >
              <Menu size={24} />
            </button>

            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

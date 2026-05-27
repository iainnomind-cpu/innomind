import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Users, FolderKanban, CheckSquare,
  Clock, FileText, BarChart3, Settings, LogOut, Menu, X,
  ChevronLeft, CalendarDays, Package, Boxes
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import TrakNotifications from './components/ui/TrakNotifications';
import { useTrak } from './context/TrakContext';
import { useUsers } from '@/context/UserContext';
import InnoAIChat from '@/components/ai/InnoAIChat';

const baseMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/trak' },
  { id: 'clients', label: 'Clientes', icon: Users, path: '/trak/clients' },
  { id: 'projects', label: 'Proyectos', icon: FolderKanban, path: '/trak/projects' },
  { id: 'tasks', label: 'Mis Tareas', icon: CheckSquare, path: '/trak/tasks' },
  { id: 'quotes', label: 'Cotizaciones', icon: FileText, path: '/trak/quotes' },
  { id: 'calendar', label: 'Calendario', icon: CalendarDays, path: '/trak/calendar' },
  { id: 'reports', label: 'Reportes', icon: BarChart3, path: '/trak/reports' },
  { id: 'settings', label: 'Configuración', icon: Settings, path: '/trak/settings' },
];

export default function TrakLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { moduleSettings } = useTrak();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { trialDaysRemaining, companyProfile } = useUsers();

  const menuItems = [
    ...baseMenuItems.slice(0, 6), // before reports
    ...(moduleSettings.hr ? [{ id: 'hr', label: 'Equipo (RH)', icon: Users, path: '/trak/hr' }] : []),
    ...(moduleSettings.inventory ? [{ id: 'inventory', label: 'Inventario', icon: Boxes, path: '/trak/inventory' }] : []),
    ...baseMenuItems.slice(6), // reports + settings
  ];

  const isActive = (path: string) => {
    if (path === '/trak') return location.pathname === '/trak';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 transition-transform duration-300 flex flex-col`}>
        {/* Brand */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white font-black text-sm tracking-wider">
              {companyProfile.nombreEmpresa?.charAt(0).toUpperCase() || 'T'}
            </div>
            <div>
              <h1 className="font-bold text-lg text-white tracking-wide">{companyProfile.nombreEmpresa || 'Trak'}</h1>
              <p className="text-[10px] text-slate-400 font-medium">Trak · Project Tracker</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.id}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-purple-600/20 text-purple-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft size={18} />
            <span>Volver al Sitio</span>
          </button>
          <div className="flex items-center gap-3 p-3 mt-2 rounded-xl bg-slate-800/50">
            <div className="w-9 h-9 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 font-bold text-sm">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-300 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg lg:hidden">
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center text-white font-black text-[10px]">{companyProfile.nombreEmpresa?.charAt(0).toUpperCase() || 'T'}</div>
              <span className="font-bold text-gray-900">{companyProfile.nombreEmpresa || 'Trak'}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <TrakNotifications />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50 relative">
          {trialDaysRemaining !== null && (
            <div className={`mb-6 rounded-xl p-4 flex items-center justify-between border ${trialDaysRemaining <= 7 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-purple-50 border-purple-200 text-purple-800'}`}>
              <div>
                <p className="font-semibold flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  Quedan {trialDaysRemaining} días de prueba gratuita
                </p>
                <p className="text-sm opacity-90 mt-0.5">Disfruta de todas las funciones premium de Trak. Actualiza tu plan antes de que termine.</p>
              </div>
              <button 
                onClick={() => navigate('/precios')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${trialDaysRemaining <= 7 ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
              >
                Contratar Plan
              </button>
            </div>
          )}
          <Outlet />
        </main>
      </div>

      {/* AI Assistant Chat */}
      <InnoAIChat />
    </div>
  );
}

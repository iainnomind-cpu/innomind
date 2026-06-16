import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Users, FolderKanban, CheckSquare,
  Clock, FileText, BarChart3, Settings, LogOut, Menu, X,
  ChevronLeft, CalendarDays, Package, Boxes, LifeBuoy, CircleDollarSign, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import TrakNotifications from './components/ui/TrakNotifications';
import { useTrak } from './context/TrakContext';
import { useUsers } from '@/context/UserContext';
import InnoAIChat from '@/components/ai/InnoAIChat';

import { TrakLogo } from '@/components/brand/TrakLogo';
import { motion } from 'framer-motion';

const baseMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/trak' },
  { id: 'clients', label: 'Clientes', icon: Users, path: '/trak/clients' },
  { id: 'projects', label: 'Proyectos', icon: FolderKanban, path: '/trak/projects' },
  { id: 'tasks', label: 'Mis Tareas', icon: CheckSquare, path: '/trak/tasks' },
  { id: 'quotes', label: 'Cotizaciones', icon: FileText, path: '/trak/quotes' },
  { id: 'finance', label: 'Finanzas', icon: CircleDollarSign, path: '/trak/finance' },
  { id: 'calendar', label: 'Calendario', icon: CalendarDays, path: '/trak/calendar' },
  { id: 'reports', label: 'Reportes', icon: BarChart3, path: '/trak/reports' },
  { id: 'support', label: 'Soporte', icon: LifeBuoy, path: '/trak/support' },
  { id: 'settings', label: 'Configuración', icon: Settings, path: '/trak/settings' },
];

export default function TrakLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { moduleSettings } = useTrak();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { trialDaysRemaining, companyProfile, isLoadingProfile } = useUsers();

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
    <div className="flex h-[100dvh] bg-[#0B1120] relative overflow-hidden">
      {/* Decorative background elements for glassmorphism */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-screen" />
      <div className="absolute bottom-0 left-[-100px] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-screen" />

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/[0.02] backdrop-blur-2xl border-r border-white/10 transition-transform duration-300 flex flex-col shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]`}>
        {/* Brand */}
        <div className="px-4 py-3 border-b border-white/5 flex flex-col gap-2">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}>
            <TrakLogo variant="dark" size="sm" showBy={false} />
          </motion.div>
          <div className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#9333EA] to-[#C084FC] rounded-lg flex items-center justify-center text-white font-bold shadow-sm group-hover:shadow group-hover:scale-105 transition-all shrink-0 overflow-hidden">
              {companyProfile.logoUrl ? (
                  <img src={companyProfile.logoUrl} alt={companyProfile.nombreEmpresa} className="w-full h-full object-cover" />
              ) : (
                  companyProfile.nombreEmpresa?.charAt(0).toUpperCase() || 'T'
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] text-purple-300/80 font-semibold uppercase tracking-wider mb-0.5 truncate">Workspace</p>
              <h1 className="font-bold text-sm text-white/90 leading-tight truncate">{companyProfile.nombreEmpresa || 'Mi CRM'}</h1>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {isLoadingProfile ? (
            <div className="flex justify-center p-6 text-purple-300">
              <Loader2 className="animate-spin" size={24} />
            </div>
          ) : menuItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.id}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all tracking-wide ${
                  active
                    ? 'bg-purple-500/20 text-purple-300 shadow-[inset_0_0_0_1px_rgba(168,85,247,0.2)]'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="w-9 h-9 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 font-bold text-sm">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-300 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 shadow-2xl relative z-10 border-l border-white/10">
        {/* Topbar */}
        <header className="h-14 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
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
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-transparent relative">
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

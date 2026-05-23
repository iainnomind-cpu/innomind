import React, { useState, useEffect } from 'react';
import { useTrak } from '../../context/TrakContext';
import { supabase } from '@/lib/supabase';
import { BarChart3, TrendingUp, Clock, DollarSign, Target, Briefcase, Calendar } from 'lucide-react';

export default function ReportsDashboard() {
  const { workspaceId, projects, clients, tasks } = useTrak();
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (workspaceId) {
      fetchAnalyticsData();
    }
  }, [workspaceId]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    
    // Fetch time entries for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [timeRes, quotesRes] = await Promise.all([
      supabase
        .from('trak_time_entries')
        .select('*')
        .eq('workspace_id', workspaceId)
        .gte('created_at', thirtyDaysAgo.toISOString()),
      supabase
        .from('trak_quotes')
        .select('*')
        .eq('workspace_id', workspaceId)
    ]);

    if (timeRes.data) setTimeEntries(timeRes.data);
    if (quotesRes.data) setQuotes(quotesRes.data);
    
    setIsLoading(false);
  };

  // ----- Analytics Calculations ----- //
  
  // 1. Projects Overview
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const avgProgress = projects.length > 0 
    ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length) 
    : 0;

  // 2. Financials (Quotes)
  const totalInvoiced = quotes
    .filter(q => q.status === 'accepted')
    .reduce((acc, q) => acc + (q.total || 0), 0);
  
  const totalPending = quotes
    .filter(q => q.status === 'sent' || q.status === 'draft')
    .reduce((acc, q) => acc + (q.total || 0), 0);

  // 3. Time Tracking (Last 30 Days)
  const totalMinutes = timeEntries.reduce((acc, t) => acc + t.duration_minutes, 0);
  const billableMinutes = timeEntries.filter(t => t.billable).reduce((acc, t) => acc + t.duration_minutes, 0);
  const efficiency = totalMinutes > 0 ? Math.round((billableMinutes / totalMinutes) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
        <BarChart3 className="text-purple-300 animate-pulse mb-4" size={48} />
        <p className="text-gray-500 font-medium">Generando métricas...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Reportes & Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Rendimiento general de tu Project Tracker (Últimos 30 días)</p>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard 
          title="Ingresos Aprobados" 
          value={`$${totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon={<DollarSign size={20} />} 
          trend="+12% vs mes anterior"
          color="emerald"
        />
        <KpiCard 
          title="Por Facturar (Pendiente)" 
          value={`$${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp size={20} />} 
          color="amber"
        />
        <KpiCard 
          title="Horas Trabajadas (30d)" 
          value={`${(totalMinutes / 60).toFixed(1)}h`}
          icon={<Clock size={20} />} 
          subtitle={`${efficiency}% horas facturables`}
          color="blue"
        />
        <KpiCard 
          title="Progreso Promedio" 
          value={`${avgProgress}%`}
          icon={<Target size={20} />} 
          color="purple"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Project Status Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Briefcase size={18} className="text-purple-600" /> Estado de Proyectos
          </h2>
          <div className="space-y-4">
            <ProgressBar label="Activos" value={activeProjects} total={projects.length} color="bg-blue-500" />
            <ProgressBar label="Completados" value={completedProjects} total={projects.length} color="bg-emerald-500" />
            <ProgressBar label="Planificación" value={projects.filter(p => p.status === 'planning').length} total={projects.length} color="bg-slate-400" />
            <ProgressBar label="En Pausa" value={projects.filter(p => p.status === 'on_hold').length} total={projects.length} color="bg-amber-500" />
          </div>
        </div>

        {/* Task Efficiency */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircleIcon /> Eficiencia de Tareas
          </h2>
          <div className="flex items-center justify-center h-40">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="#f3f4f6" strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="#9333ea" strokeWidth="3"
                  strokeDasharray={`${tasks.length > 0 ? (tasks.filter(t => t.status === 'done').length / tasks.length) * 100 : 0}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-gray-900">
                  {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0}%
                </span>
                <span className="text-[10px] uppercase font-bold text-gray-400">Completadas</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm text-center border-t border-gray-100 pt-4">
             <div>
               <p className="font-bold text-gray-900">{tasks.filter(t => t.status === 'done').length}</p>
               <p className="text-xs text-gray-500">Hechas</p>
             </div>
             <div>
               <p className="font-bold text-gray-900">{tasks.filter(t => t.status !== 'done').length}</p>
               <p className="text-xs text-gray-500">Pendientes</p>
             </div>
             <div>
               <p className="font-bold text-red-600">{tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length}</p>
               <p className="text-xs text-gray-500">Vencidas</p>
             </div>
          </div>
        </div>

        {/* Client Conversion pipeline */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar size={18} className="text-purple-600" /> Pipeline de Clientes
          </h2>
          <div className="space-y-5 mt-8">
            <PipelineStage label="Nuevos Leads" value={clients.filter(c => c.pipeline_stage === 'new').length} color="bg-blue-200" />
            <PipelineStage label="Contactados" value={clients.filter(c => c.pipeline_stage === 'contacted').length} color="bg-purple-300" />
            <PipelineStage label="Cotizados" value={clients.filter(c => c.pipeline_stage === 'quoted').length} color="bg-amber-300" />
            <PipelineStage label="Ganados" value={clients.filter(c => c.pipeline_stage === 'won').length} color="bg-emerald-400" />
          </div>
        </div>

      </div>
    </div>
  );
}

// ----- UI Components -----

function KpiCard({ title, value, icon, trend, subtitle, color }: any) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 transition-transform group-hover:scale-110 ${colorMap[color].split(' ')[0]}`} />
      
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 relative z-10 ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-500 relative z-10">{title}</p>
      <h3 className="text-2xl font-black text-gray-900 mt-1 relative z-10">{value}</h3>
      
      {(trend || subtitle) && (
        <div className="mt-3 pt-3 border-t border-gray-100 relative z-10">
          <p className="text-xs font-medium text-gray-500">{trend || subtitle}</p>
        </div>
      )}
    </div>
  );
}

function ProgressBar({ label, value, total, color }: any) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">{value} ({percentage}%)</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function PipelineStage({ label, value, color }: any) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-32 text-right">
        <span className="text-xs font-bold text-gray-500 uppercase">{label}</span>
      </div>
      <div className="flex-1 flex items-center">
        <div className={`h-6 rounded-r-lg ${color} flex items-center justify-end px-3 transition-all min-w-[2rem]`} style={{ width: `${Math.max(10, value * 15)}%` }}>
          <span className="text-xs font-bold text-gray-900/60">{value}</span>
        </div>
      </div>
    </div>
  );
}

function CheckCircleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}

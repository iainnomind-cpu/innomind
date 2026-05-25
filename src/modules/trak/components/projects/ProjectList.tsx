import React, { useState, useEffect } from 'react';
import { useTrak, TrakProject } from '../../context/TrakContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import {
  FolderKanban, Plus, Search, Calendar, Clock, Users,
  LayoutGrid, List, AlertTriangle, CheckCircle2, Target,
  TrendingUp, Briefcase, ArrowRight, Play
} from 'lucide-react';

const statusConfig: Record<string, { bg: string; text: string; label: string; dot: string }> = {
  planning:  { bg: 'bg-slate-50',    text: 'text-slate-700',   label: 'Planificación', dot: 'bg-slate-400' },
  active:    { bg: 'bg-blue-50',     text: 'text-blue-700',    label: 'Activo',        dot: 'bg-blue-500' },
  on_hold:   { bg: 'bg-amber-50',    text: 'text-amber-700',   label: 'Pausado',       dot: 'bg-amber-500' },
  completed: { bg: 'bg-emerald-50',  text: 'text-emerald-700', label: 'Completado',    dot: 'bg-emerald-500' },
  cancelled: { bg: 'bg-red-50',      text: 'text-red-700',     label: 'Cancelado',     dot: 'bg-red-500' },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low:      { label: 'Baja',    color: 'text-slate-500' },
  medium:   { label: 'Media',   color: 'text-blue-600' },
  high:     { label: 'Alta',    color: 'text-orange-600' },
  critical: { label: 'Crítica', color: 'text-red-600' },
};

export default function ProjectList() {
  const { projects, tasks, workspaceId, refreshProjects, refreshClients } = useTrak();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [members, setMembers] = useState<Record<string, number>>({});
  const [startingId, setStartingId] = useState<string | null>(null);

  const handleStartProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    setStartingId(projectId);
    await supabase.from('trak_projects').update({ status: 'active' }).eq('id', projectId);
    
    // Sincronizar el estado del cliente a activo y ganado
    const project = projects.find(p => p.id === projectId);
    if (project && project.client_id) {
      await supabase
        .from('trak_clients')
        .update({ status: 'active', pipeline_stage: 'won' })
        .eq('id', project.client_id);
      if (refreshClients) await refreshClients();
    }

    await supabase.from('trak_project_activity').insert({
      project_id: projectId,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      type: 'status_change',
      content: 'Proyecto iniciado'
    });
    await refreshProjects();
    setStartingId(null);
  };

  useEffect(() => {
    if (workspaceId) fetchMemberCounts();
  }, [workspaceId, projects]);

  const fetchMemberCounts = async () => {
    const { data } = await supabase
      .from('trak_project_members')
      .select('project_id');
    if (data) {
      const counts: Record<string, number> = {};
      data.forEach(r => { counts[r.project_id] = (counts[r.project_id] || 0) + 1; });
      setMembers(counts);
    }
  };

  const filtered = projects.filter(p => {
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.client?.company_name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Stats
  const activeCount = projects.filter(p => p.status === 'active').length;
  const completedCount = projects.filter(p => p.status === 'completed').length;
  const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length;

  const getProjectTasks = (pid: string) => {
    const pt = tasks.filter(t => t.project_id === pid);
    return { total: pt.length, done: pt.filter(t => t.status === 'done').length };
  };

  const getDaysLeft = (date?: string) => {
    if (!date) return null;
    return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Proyectos</h1>
          <p className="text-gray-500 text-sm mt-1">{projects.length} proyectos · {activeCount} activos</p>
        </div>
        <button
          onClick={() => navigate('/trak/projects/new')}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-purple-600/20 hover:shadow-purple-600/30"
        >
          <Plus size={18} /> Nuevo Proyecto
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MiniStat icon={<FolderKanban size={18}/>} label="Total" value={projects.length} color="purple" />
        <MiniStat icon={<TrendingUp size={18}/>} label="Activos" value={activeCount} color="blue" />
        <MiniStat icon={<CheckCircle2 size={18}/>} label="Completados" value={completedCount} color="emerald" />
        <MiniStat icon={<AlertTriangle size={18}/>} label="Tareas Vencidas" value={overdueTasks} color={overdueTasks > 0 ? 'red' : 'emerald'} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre o cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
          {['all', 'active', 'planning', 'on_hold', 'completed'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                filterStatus === s
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s !== 'all' && <div className={`w-2 h-2 rounded-full ${statusConfig[s]?.dot}`} />}
              {s === 'all' ? 'Todos' : statusConfig[s]?.label}
            </button>
          ))}
        </div>
        <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden shrink-0">
          <button onClick={() => setViewMode('grid')} className={`p-2.5 ${viewMode === 'grid' ? 'bg-purple-50 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}>
            <LayoutGrid size={18} />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2.5 ${viewMode === 'list' ? 'bg-purple-50 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}>
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Empty */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <FolderKanban className="mx-auto mb-4 text-gray-200" size={56} />
          <p className="text-lg font-bold text-gray-900">No se encontraron proyectos</p>
          <p className="text-gray-500 text-sm mt-1 mb-6">Intenta con otros filtros o crea uno nuevo.</p>
          <button onClick={() => navigate('/trak/projects/new')} className="bg-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-700">
            <Plus size={16} className="inline mr-1" /> Crear Proyecto
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* === GRID VIEW === */
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(project => {
            const sc = statusConfig[project.status] || statusConfig.planning;
            const pt = getProjectTasks(project.id);
            const taskPercent = pt.total > 0 ? Math.round((pt.done / pt.total) * 100) : 0;
            const daysLeft = getDaysLeft(project.estimated_end_date);
            const memberCount = members[project.id] || 0;

            return (
              <div
                key={project.id}
                onClick={() => navigate(`/trak/projects/${project.id}`)}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col overflow-hidden"
              >
                {/* Color bar */}
                <div className="h-1.5 w-full" style={{ backgroundColor: project.color || '#9333ea' }} />

                <div className="p-5 flex-1 flex flex-col">
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${sc.dot}`} />
                      <span className={`text-[11px] font-bold uppercase ${sc.text}`}>{sc.label}</span>
                    </div>
                    {daysLeft !== null && (
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        daysLeft < 0 ? 'bg-red-100 text-red-700' : daysLeft < 7 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {daysLeft < 0 ? `${Math.abs(daysLeft)}d vencido` : `${daysLeft}d`}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1 group-hover:text-purple-600 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px] mb-4">
                    {project.description || 'Sin descripción'}
                  </p>

                  {/* Progress */}
                  <div className="mt-auto">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-500 flex items-center gap-1.5">
                        <Briefcase size={13} /> {project.client?.company_name || 'Interno'}
                      </span>
                      <span className="font-black text-gray-900">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4 overflow-hidden">
                      <div
                        className="h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${project.progress}%`, backgroundColor: project.color || '#9333ea' }}
                      />
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1" title="Tareas">
                          <CheckCircle2 size={13} /> {pt.done}/{pt.total}
                        </span>
                        {memberCount > 0 && (
                          <span className="flex items-center gap-1" title="Miembros">
                            <Users size={13} /> {memberCount}
                          </span>
                        )}
                        {project.budget && (
                          <span className="font-medium">${(project.budget/1000).toFixed(0)}k</span>
                        )}
                      </div>
                      {project.status === 'planning' ? (
                        <button
                          onClick={(e) => handleStartProject(e, project.id)}
                          disabled={startingId === project.id}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm shadow-emerald-600/20"
                        >
                          <Play size={11} fill="currentColor" />
                          {startingId === project.id ? 'Iniciando...' : 'Iniciar'}
                        </button>
                      ) : (
                        <ArrowRight size={16} className="text-gray-300 group-hover:text-purple-500 transition-colors" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* === LIST VIEW === */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Proyecto</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Cliente</th>
                <th className="text-center px-4 py-3 font-medium">Estado</th>
                <th className="text-center px-4 py-3 font-medium hidden lg:table-cell">Progreso</th>
                <th className="text-center px-4 py-3 font-medium hidden lg:table-cell">Tareas</th>
                <th className="text-center px-4 py-3 font-medium hidden xl:table-cell">Entrega</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(project => {
                const sc = statusConfig[project.status] || statusConfig.planning;
                const pt = getProjectTasks(project.id);
                const daysLeft = getDaysLeft(project.estimated_end_date);

                return (
                  <tr key={project.id} onClick={() => navigate(`/trak/projects/${project.id}`)} className="hover:bg-purple-50/30 cursor-pointer transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: project.color || '#9333ea' }} />
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{project.name}</p>
                          <p className={`text-xs font-medium ${priorityConfig[project.priority]?.color}`}>
                            {priorityConfig[project.priority]?.label}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-500 hidden md:table-cell">{project.client?.company_name || 'Interno'}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${sc.bg} ${sc.text}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} /> {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-3 justify-center">
                        <div className="w-20 bg-gray-100 rounded-full h-2">
                          <div className="h-2 rounded-full" style={{ width: `${project.progress}%`, backgroundColor: project.color || '#9333ea' }} />
                        </div>
                        <span className="text-xs font-bold text-gray-700 w-8">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center hidden lg:table-cell">
                      <span className="text-xs font-medium text-gray-600">{pt.done}/{pt.total}</span>
                    </td>
                    <td className="px-4 py-4 text-center hidden xl:table-cell">
                      {daysLeft !== null ? (
                        <span className={`text-xs font-bold ${daysLeft < 0 ? 'text-red-600' : daysLeft < 7 ? 'text-amber-600' : 'text-gray-500'}`}>
                          {daysLeft < 0 ? `${Math.abs(daysLeft)}d vencido` : `${daysLeft}d`}
                        </span>
                      ) : <span className="text-xs text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                      {project.status === 'planning' ? (
                        <button
                          onClick={(e) => handleStartProject(e, project.id)}
                          disabled={startingId === project.id}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
                        >
                          <Play size={11} fill="currentColor" />
                          {startingId === project.id ? 'Iniciando...' : 'Iniciar'}
                        </button>
                      ) : (
                        <ArrowRight size={16} className="text-gray-300 group-hover:text-purple-500" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function MiniStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    purple: 'bg-purple-50 text-purple-600', blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600', red: 'bg-red-50 text-red-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-xl font-black text-gray-900">{value}</p>
        <p className="text-xs font-medium text-gray-500">{label}</p>
      </div>
    </div>
  );
}

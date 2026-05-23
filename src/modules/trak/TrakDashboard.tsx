import React from 'react';
import { useTrak } from './context/TrakContext';
import {
  FolderKanban, Users, CheckSquare, Clock, AlertTriangle, TrendingUp,
  ArrowUpRight, ArrowDownRight, Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const statusColors: Record<string, string> = {
  planning: 'bg-slate-100 text-slate-700',
  active: 'bg-emerald-100 text-emerald-700',
  on_hold: 'bg-amber-100 text-amber-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
};

const priorityDot: Record<string, string> = {
  low: 'bg-slate-400',
  medium: 'bg-blue-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

export default function TrakDashboard() {
  const { stats, projects, tasks, clients, isLoading } = useTrak();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-xl" />
          <p className="text-sm text-gray-400">Cargando Trak...</p>
        </div>
      </div>
    );
  }

  const activeProjects = projects.filter(p => p.status === 'active');
  const recentTasks = tasks.slice(0, 8);
  const today = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(t => t.due_date && t.due_date < today && t.status !== 'done');

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Resumen general de tus proyectos</p>
        </div>
        <button
          onClick={() => navigate('/trak/projects/new')}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-purple-600/20"
        >
          <Plus size={18} /> Nuevo Proyecto
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Users size={20} />}
          label="Clientes Activos"
          value={stats.totalClients}
          color="blue"
        />
        <StatCard
          icon={<FolderKanban size={20} />}
          label="Proyectos Activos"
          value={stats.activeProjects}
          color="purple"
        />
        <StatCard
          icon={<CheckSquare size={20} />}
          label="Tareas Pendientes"
          value={stats.pendingTasks}
          color="amber"
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          label="Tareas Vencidas"
          value={stats.overdueTaskCount}
          color="red"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Projects */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Proyectos Activos</h2>
            <button onClick={() => navigate('/trak/projects')} className="text-sm text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1">
              Ver todos <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {activeProjects.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <FolderKanban className="mx-auto mb-3 text-gray-200" size={40} />
                <p className="font-medium">Sin proyectos activos</p>
                <p className="text-sm mt-1">Crea tu primer proyecto para comenzar</p>
              </div>
            ) : (
              activeProjects.slice(0, 5).map(project => (
                <button
                  key={project.id}
                  onClick={() => navigate(`/trak/projects/${project.id}`)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: project.color || '#8b5cf6' }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{project.name}</p>
                    <p className="text-xs text-gray-500 truncate">{(project.client as any)?.company_name || 'Sin cliente'}</p>
                  </div>
                  {/* Progress bar */}
                  <div className="w-24 hidden sm:block">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all bg-purple-500"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${statusColors[project.status]}`}>
                    {project.status === 'active' ? 'Activo' : project.status}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <div className="bg-red-50 rounded-2xl border border-red-100 p-5">
              <h3 className="font-bold text-red-800 flex items-center gap-2 mb-3">
                <AlertTriangle size={16} /> Tareas Vencidas
              </h3>
              <div className="space-y-2">
                {overdueTasks.slice(0, 4).map(task => (
                  <button
                    key={task.id}
                    onClick={() => navigate('/trak/tasks')}
                    className="w-full text-left bg-white rounded-lg p-3 border border-red-100 hover:border-red-200 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                    <p className="text-xs text-red-600 mt-1">
                      Venció: {task.due_date ? new Date(task.due_date).toLocaleDateString() : ''}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Tasks */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Tareas Recientes</h2>
              <button onClick={() => navigate('/trak/tasks')} className="text-sm text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1">
                Ver todas <ArrowUpRight size={14} />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {recentTasks.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">Sin tareas aún</div>
              ) : (
                recentTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 px-5 py-3">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${priorityDot[task.priority]}`} />
                    <p className="text-sm text-gray-900 truncate flex-1">{task.title}</p>
                    <span className="text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap">
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', iconBg: 'bg-amber-100' },
    red: { bg: 'bg-red-50', text: 'text-red-600', iconBg: 'bg-red-100' },
    green: { bg: 'bg-green-50', text: 'text-green-600', iconBg: 'bg-green-100' },
  };
  const c = colorMap[color] || colorMap.blue;
  return (
    <div className={`rounded-2xl p-5 border ${c.bg} border-transparent`}>
      <div className={`w-10 h-10 ${c.iconBg} ${c.text} rounded-xl flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 font-medium mt-1">{label}</p>
    </div>
  );
}

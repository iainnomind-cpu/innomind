import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrak, TrakProject, TrakPhase } from '../../context/TrakContext';
import { supabase } from '@/lib/supabase';
import {
  ChevronLeft, LayoutTemplate, CheckSquare, Clock, FileText, DollarSign,
  Calendar, Users, Briefcase, Plus, Play, Pause, Trash2, Target,
  TrendingUp, AlertTriangle, MessageSquare, Edit3, FolderOpen, GitCommit, CheckCircle2
} from 'lucide-react';
import ProjectTasks from './ProjectTasks';
import ProjectTime from './ProjectTime';
import ProjectTeam from './ProjectTeam';
import ProjectActivity from './ProjectActivity';
import ProjectPhases from './ProjectPhases';
import ProjectFinances from './ProjectFinances';
import ProjectFiles from './ProjectFiles';
import ProjectGantt from './ProjectGantt';
import { completeProjectFinancialCloseout } from '../../services/financeAutomation';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  planning:  { label: 'Planificación', color: 'text-slate-700',   bg: 'bg-slate-100' },
  active:    { label: 'Activo',        color: 'text-blue-700',    bg: 'bg-blue-100' },
  on_hold:   { label: 'Pausado',       color: 'text-amber-700',   bg: 'bg-amber-100' },
  completed: { label: 'Completado',    color: 'text-emerald-700', bg: 'bg-emerald-100' },
  cancelled: { label: 'Cancelado',     color: 'text-red-700',     bg: 'bg-red-100' },
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, workspaceId, refreshClients, refreshProjects } = useTrak();

  const [project, setProject] = useState<TrakProject | null>(null);
  const [phases, setPhases] = useState<TrakPhase[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [timeStats, setTimeStats] = useState({ total: 0, billable: 0 });
  const [activeTab, setActiveTab] = useState('overview');
  const [issues, setIssues] = useState(0);

  const fetchProjectData = async () => {
    const { data } = await supabase.from('trak_projects').select('*, client:client_id(company_name)').eq('id', id).single();
    if (data) setProject(data as TrakProject);
  };

  const fetchPhases = async () => {
    const { data } = await supabase.from('trak_phases').select('*').eq('project_id', id).order('order_index');
    if (data) setPhases(data);
  };

  const fetchMembers = async () => {
    const { data } = await supabase.from('trak_project_members').select('*, employee:employee_id(*)').eq('project_id', id);
    if (data) setMembers(data);
  };

  const fetchTimeStats = async () => {
    const { data } = await supabase.from('trak_time_entries').select('duration_minutes, billable').eq('project_id', id);
    if (data) {
      setTimeStats({
        total: data.reduce((a, e) => a + e.duration_minutes, 0),
        billable: data.filter(e => e.billable).reduce((a, e) => a + e.duration_minutes, 0),
      });
    }
  };

  const fetchIssueCount = async () => {
    const { data } = await supabase.from('trak_project_activity').select('id').eq('project_id', id).eq('type', 'issue').eq('is_resolved', false);
    if (data) setIssues(data.length);
  };

  useEffect(() => {
    if (id) {
      fetchProjectData();
      fetchPhases();
      fetchMembers();
      fetchTimeStats();
      fetchIssueCount();
    }
  }, [id]);

  const projectTasks = tasks.filter(t => t.project_id === id);
  const doneTasks = projectTasks.filter(t => t.status === 'done').length;
  const totalTasks = projectTasks.length;
  const taskPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const overdueTasks = projectTasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length;

  const handleStartProject = async () => {
    if (!project) return;
    await supabase.from('trak_projects').update({ status: 'active' }).eq('id', project.id);
    
    // Sincronizar el estado del cliente a activo y ganado
    if (project.client_id) {
      await supabase
        .from('trak_clients')
        .update({ status: 'active', pipeline_stage: 'won' })
        .eq('id', project.client_id);
      if (refreshClients) await refreshClients();
    }

    await supabase.from('trak_project_activity').insert({
      project_id: project.id,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      type: 'status_change',
      content: 'Proyecto iniciado'
    });
    fetchProjectData();
  };

  const handleToggleStatus = async () => {
    if (!project) return;
    const newStatus = project.status === 'on_hold' ? 'active' : 'on_hold';
    await supabase.from('trak_projects').update({ status: newStatus }).eq('id', project.id);
    await supabase.from('trak_project_activity').insert({
      project_id: project.id, user_id: (await supabase.auth.getUser()).data.user?.id,
      type: 'status_change', content: `Proyecto ${newStatus === 'on_hold' ? 'pausado' : 'reanudado'}`
    });
    fetchProjectData();
  };

  const handleCompleteProject = async () => {
    if (!project || !window.confirm('Marcar este proyecto como completado y ejecutar cierre financiero?')) return;
    const userId = (await supabase.auth.getUser()).data.user?.id;
    await completeProjectFinancialCloseout(project.id, workspaceId, userId);
    await refreshProjects();
    fetchProjectData();
    fetchIssueCount();
  };

  const handleAddPhase = async () => {
    const name = prompt('Nombre de la nueva fase:');
    if (!name || !project) return;
    await supabase.from('trak_phases').insert({ project_id: project.id, name, order_index: phases.length, progress: 0 });
    fetchPhases();
  };

  const daysLeft = project?.estimated_end_date
    ? Math.ceil((new Date(project.estimated_end_date).getTime() - Date.now()) / 86400000)
    : null;

  if (!project) return <div className="flex-1 flex items-center justify-center text-gray-400"><LayoutTemplate className="animate-pulse" size={40} /></div>;

  const sc = statusConfig[project.status] || statusConfig.planning;

  const tabs = [
    { id: 'overview',  label: 'Resumen',    icon: LayoutTemplate },
    { id: 'tasks',     label: 'Tareas',     icon: CheckSquare, badge: overdueTasks > 0 ? overdueTasks : undefined },
    { id: 'activity',  label: 'Actividad',  icon: MessageSquare, badge: issues > 0 ? issues : undefined },
    { id: 'team',      label: 'Equipo',     icon: Users, badge: members.length || undefined },
    { id: 'phases',    label: 'Fases',      icon: Target },
    { id: 'time',      label: 'Tiempo',     icon: Clock },
    { id: 'finances',  label: 'Finanzas',   icon: DollarSign },
    { id: 'files',     label: 'Archivos',   icon: FolderOpen },
    { id: 'gantt',     label: 'Cronograma', icon: GitCommit },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
      {/* ===== HERO HEADER ===== */}
      <div className="shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ background: `linear-gradient(135deg, ${project.color || '#9333ea'} 0%, transparent 70%)` }} />
        <div className="relative px-6 pt-4 pb-0">
          <button onClick={() => navigate('/trak/projects')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-600 transition-colors mb-4 font-medium">
            <ChevronLeft size={16} /> Proyectos
          </button>

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg" style={{ backgroundColor: project.color || '#9333ea' }}>
                <LayoutTemplate size={26} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-black text-gray-900">{project.name}</h1>
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${sc.bg} ${sc.color}`}>{sc.label}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5"><Briefcase size={14} /> {(project as any).client?.company_name || 'Interno'}</span>
                  {project.estimated_end_date && <span className="flex items-center gap-1.5"><Calendar size={14} /> Entrega: {new Date(project.estimated_end_date).toLocaleDateString()}</span>}
                  {daysLeft !== null && (
                    <span className={`flex items-center gap-1.5 font-semibold ${daysLeft < 0 ? 'text-red-600' : daysLeft < 7 ? 'text-amber-600' : 'text-gray-500'}`}>
                      {daysLeft < 0 ? `⚠️ ${Math.abs(daysLeft)}d vencido` : `${daysLeft}d restantes`}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {project.status === 'planning' && (
                <button
                  onClick={handleStartProject}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 animate-pulse-subtle"
                >
                  <Play size={16} fill="currentColor" /> Iniciar Proyecto
                </button>
              )}
              {(project.status === 'active' || project.status === 'on_hold') && (
                <button onClick={handleToggleStatus} className={`px-3.5 py-2 font-medium rounded-xl text-sm transition-all flex items-center gap-2 ${project.status === 'on_hold' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}>
                  {project.status === 'on_hold' ? <Play size={15} /> : <Pause size={15} />}
                  {project.status === 'on_hold' ? 'Reanudar' : 'Pausar'}
                </button>
              )}
              {(project.status === 'active' || project.status === 'on_hold') && (
                <button onClick={handleCompleteProject} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm transition-all flex items-center gap-2 shadow-sm shadow-emerald-600/20">
                  <CheckCircle2 size={15} /> Completar
                </button>
              )}
              <button onClick={() => navigate(`/trak/projects/${project.id}/edit`)} className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl text-sm transition-colors flex items-center gap-2">
                <Edit3 size={15} /> Editar
              </button>
            </div>
          </div>

          {/* TABS */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-medium transition-all whitespace-nowrap ${active ? 'bg-white text-purple-700 shadow-sm border border-b-0 border-gray-200' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
                >
                  <Icon size={16} /> {tab.label}
                  {tab.badge && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{tab.badge}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="flex-1 overflow-y-auto bg-white border-t border-gray-200">
        <div className="p-6 lg:p-8">

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <KpiMini icon={<Target size={18}/>} label="Progreso" value={`${project.progress}%`} color="purple" />
                <KpiMini icon={<CheckSquare size={18}/>} label="Tareas" value={`${doneTasks}/${totalTasks}`} sub={`${taskPercent}% completado`} color="blue" />
                <KpiMini icon={<Clock size={18}/>} label="Horas" value={`${(timeStats.total/60).toFixed(1)}h`} sub={`${(timeStats.billable/60).toFixed(1)}h facturables`} color="emerald" />
                <KpiMini icon={<DollarSign size={18}/>} label="Presupuesto" value={`$${(project.budget || 0).toLocaleString()}`} color="amber" />
                <KpiMini icon={<AlertTriangle size={18}/>} label="Incidencias" value={`${issues}`} sub={issues > 0 ? 'abiertas' : 'sin problemas'} color={issues > 0 ? 'red' : 'emerald'} />
              </div>

              {/* Progress Bar */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-gray-900">Progreso General del Proyecto</span>
                  <span className="text-2xl font-black" style={{ color: project.color || '#9333ea' }}>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div className="h-4 rounded-full transition-all duration-700 ease-out relative" style={{ width: `${project.progress}%`, backgroundColor: project.color || '#9333ea' }}>
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Description */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><FileText size={16}/> Descripción</h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{project.description || 'Sin descripción.'}</p>
                </div>

                {/* Quick Team */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><Users size={16}/> Equipo ({members.length})</h3>
                    <button onClick={() => setActiveTab('team')} className="text-xs text-purple-600 font-medium hover:underline">Ver todos</button>
                  </div>
                  {members.length === 0 ? (
                    <p className="text-sm text-gray-500">No hay miembros asignados.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {members.slice(0, 6).map(m => (
                        <div key={m.id} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 text-sm">
                          <div className="w-6 h-6 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-[10px] font-bold uppercase">
                            {m.employee?.first_name?.charAt(0)}{m.employee?.last_name?.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-700">{m.employee?.first_name}</span>
                        </div>
                      ))}
                      {members.length > 6 && <span className="text-xs text-gray-400 self-center">+{members.length - 6} más</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Phases preview */}
              {phases.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><Target size={16}/> Fases</h3>
                    <button onClick={() => setActiveTab('phases')} className="text-xs text-purple-600 font-medium hover:underline">Gestionar</button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {phases.map((ph, i) => (
                      <div key={ph.id} className="min-w-[140px] bg-white rounded-xl p-3 border border-gray-200 shrink-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">{i+1}</div>
                          <span className="text-sm font-bold text-gray-900 truncate">{ph.name}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-purple-500 transition-all" style={{ width: `${ph.progress}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 block">{ph.progress}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Overdue tasks warning */}
              {overdueTasks > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-4">
                  <AlertTriangle className="text-red-500 shrink-0" size={24} />
                  <div>
                    <p className="font-bold text-red-800">Hay {overdueTasks} tarea{overdueTasks > 1 ? 's' : ''} vencida{overdueTasks > 1 ? 's' : ''}</p>
                    <p className="text-sm text-red-600">Revisa la pestaña de tareas para actualizar sus fechas o completarlas.</p>
                  </div>
                  <button onClick={() => setActiveTab('tasks')} className="ml-auto px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 shrink-0">Ver Tareas</button>
                </div>
              )}
            </div>
          )}

          {/* TASKS */}
          {activeTab === 'tasks' && <ProjectTasks projectId={project.id} />}

          {/* ACTIVITY */}
          {activeTab === 'activity' && <ProjectActivity projectId={project.id} />}

          {/* TEAM */}
          {activeTab === 'team' && <ProjectTeam projectId={project.id} />}

          {/* PHASES */}
          {activeTab === 'phases' && <ProjectPhases projectId={project.id} projectColor={project.color} />}

          {/* TIME */}
          {activeTab === 'time' && <ProjectTime projectId={project.id} />}

          {/* FINANCES */}
          {activeTab === 'finances' && <ProjectFinances projectId={project.id} />}

          {/* FILES */}
          {activeTab === 'files' && <ProjectFiles projectId={project.id} />}

          {/* GANTT */}
          {activeTab === 'gantt' && <ProjectGantt projectId={project.id} />}

        </div>
      </div>
    </div>
  );
}

function KpiMini({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub?: string; color: string }) {
  const colors: Record<string, string> = {
    purple: 'bg-purple-50 text-purple-600', blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:shadow-sm transition-all">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${colors[color]}`}>{icon}</div>
      <p className="text-xl font-black text-gray-900">{value}</p>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

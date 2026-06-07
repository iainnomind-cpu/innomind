import React, { useState } from 'react';
import { useTrak } from '../../context/TrakContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import {
  CheckSquare, Calendar, Clock, LayoutTemplate, User, Search,
  Plus, X, ArrowRight, List, Users
} from 'lucide-react';

const priorityColors: Record<string, string> = {
  low: 'text-slate-500 bg-slate-100',
  medium: 'text-blue-700 bg-blue-100',
  high: 'text-orange-700 bg-orange-100',
  critical: 'text-red-700 bg-red-100',
};

const priorityLabels: Record<string, string> = {
  low: 'Baja', medium: 'Media', high: 'Alta', critical: 'Crítica',
};

const statusLabels: Record<string, string> = {
  todo: 'Por Hacer',
  in_progress: 'En Progreso',
  in_review: 'En Revisión',
  done: 'Completado'
};

const statusDot: Record<string, string> = {
  todo: 'bg-slate-400',
  in_progress: 'bg-blue-500',
  in_review: 'bg-amber-500',
  done: 'bg-emerald-500',
};

export default function GlobalTaskList() {
  const { workspaceId, tasks, projects, refreshTasks } = useTrak();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'by_assignee'>('list');
  const [showModal, setShowModal] = useState(false);

  const handleToggleTask = async (task: any) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    await supabase.from('trak_tasks').update({
      status: newStatus,
      completed_at: newStatus === 'done' ? new Date().toISOString() : null
    }).eq('id', task.id);
    refreshTasks();
  };

  const filteredTasks = tasks.filter(t => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Group tasks by assignee
  const tasksByAssignee = filteredTasks.reduce((acc: Record<string, any>, task) => {
    const key = task.assigned_to || '__unassigned__';
    const name = task.assignee
      ? `${task.assignee.first_name} ${task.assignee.last_name}`
      : 'Sin asignar';
    const initials = task.assignee
      ? task.assignee.first_name?.charAt(0).toUpperCase()
      : '?';
    if (!acc[key]) acc[key] = { name, initials, tasks: [], hasAssignee: !!task.assignee };
    acc[key].tasks.push(task);
    return acc;
  }, {});

  // Sort: assigned people first, then unassigned
  const assigneeGroups = Object.entries(tasksByAssignee).sort(([, a]: any, [, b]: any) => {
    if (a.hasAssignee && !b.hasAssignee) return -1;
    if (!a.hasAssignee && b.hasAssignee) return 1;
    return a.name.localeCompare(b.name);
  });

  const TaskRow = ({ task }: { task: any }) => {
    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
    return (
      <div className="p-4 hover:bg-gray-50/50 transition-colors flex items-center gap-4 group">
        <div className="shrink-0">
          <button
            onClick={() => handleToggleTask(task)}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              task.status === 'done'
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-gray-300 bg-transparent hover:border-purple-500'
            }`}
          >
            {task.status === 'done' && <CheckSquare size={12} />}
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${priorityColors[task.priority]}`}>
              {priorityLabels[task.priority]}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
              <span className={`w-1.5 h-1.5 rounded-full ${statusDot[task.status]}`} />
              {statusLabels[task.status]}
            </span>
            {task.project && (
              <span
                onClick={() => navigate(`/trak/projects/${task.project_id}`)}
                className="text-xs text-purple-600 font-medium hover:underline cursor-pointer flex items-center gap-1"
              >
                <LayoutTemplate size={12} /> {task.project.name}
              </span>
            )}
          </div>
          <h4 className={`font-bold truncate ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
            {task.title}
          </h4>
        </div>
        <div className="hidden md:flex items-center gap-6 shrink-0 text-sm text-gray-500">
          {task.due_date && (
            <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-500 font-semibold' : ''}`}>
              <Calendar size={14} />
              {new Date(task.due_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
            </div>
          )}
          {task.estimated_hours && (
            <div className="flex items-center gap-1.5">
              <Clock size={14} /> {task.estimated_hours}h
            </div>
          )}
        </div>
        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => navigate(`/trak/projects/${task.project_id}`)}
            className="px-3 py-1.5 text-xs font-bold text-purple-600 hover:bg-purple-50 rounded-lg flex items-center gap-1 transition-colors"
          >
            Ver <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Tareas</h1>
          <p className="text-gray-500 text-sm mt-1">{tasks.length} tareas en total</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'list' ? 'bg-purple-600 text-white shadow' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <List size={15} /> Lista
            </button>
            <button
              onClick={() => setViewMode('by_assignee')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'by_assignee' ? 'bg-purple-600 text-white shadow' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Users size={15} /> Por Responsable
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-purple-600/20"
          >
            <Plus size={18} /> Nueva Tarea
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar tareas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {['all', 'todo', 'in_progress', 'in_review', 'done'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                filterStatus === s
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s === 'all' ? 'Todas' : statusLabels[s]}
            </button>
          ))}
        </div>
      </div>

      {/* ── VISTA LISTA ── */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <CheckSquare className="mx-auto mb-4 text-gray-300" size={48} />
              <p className="font-medium text-lg text-gray-900">No hay tareas que mostrar</p>
              <p className="text-sm mt-1">Modifica los filtros o crea nuevas tareas en los proyectos.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTasks.map(task => <TaskRow key={task.id} task={task} />)}
            </div>
          )}
        </div>
      )}

      {/* ── VISTA POR RESPONSABLE ── */}
      {viewMode === 'by_assignee' && (
        <div className="space-y-6">
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center text-gray-500">
              <Users className="mx-auto mb-4 text-gray-300" size={48} />
              <p className="font-medium text-lg text-gray-900">No hay tareas que mostrar</p>
            </div>
          ) : assigneeGroups.map(([key, group]: [string, any]) => {
            const done = group.tasks.filter((t: any) => t.status === 'done').length;
            const overdue = group.tasks.filter((t: any) =>
              t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done'
            ).length;
            const progress = group.tasks.length > 0 ? Math.round((done / group.tasks.length) * 100) : 0;

            return (
              <div key={key} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Assignee Header */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/60">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shadow-sm shrink-0 ${
                    group.hasAssignee
                      ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {group.hasAssignee ? group.initials : <User size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900">{group.name}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <span>{group.tasks.length} tarea{group.tasks.length !== 1 ? 's' : ''}</span>
                      <span className="text-emerald-600 font-medium">{done} completada{done !== 1 ? 's' : ''}</span>
                      {overdue > 0 && (
                        <span className="text-red-500 font-semibold">{overdue} vencida{overdue !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="hidden sm:flex items-center gap-3 shrink-0">
                    <div className="w-28 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-600 w-9 text-right">{progress}%</span>
                  </div>
                </div>

                {/* Task rows */}
                <div className="divide-y divide-gray-100">
                  {group.tasks.map((task: any) => <TaskRow key={task.id} task={task} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <GlobalTaskModal
          onClose={() => setShowModal(false)}
          workspaceId={workspaceId!}
          projects={projects}
          refreshTasks={refreshTasks}
        />
      )}
    </div>
  );
}

function GlobalTaskModal({ onClose, workspaceId, projects, refreshTasks }: any) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    project_id: '',
    priority: 'medium',
    due_date: ''
  });

  const handleSave = async () => {
    if (!form.title.trim() || !form.project_id) return;
    setSaving(true);
    try {
      await supabase.from('trak_tasks').insert({
        workspace_id: workspaceId,
        project_id: form.project_id,
        title: form.title,
        status: 'todo',
        priority: form.priority,
        due_date: form.due_date || null,
      });
      refreshTasks();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-lg text-gray-900">Nueva Tarea Rápida</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg"><X size={20}/></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto *</label>
            <select value={form.project_id} onChange={e=>setForm({...form, project_id:e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">Selecciona un proyecto...</option>
              {projects.filter((p:any) => p.status !== 'completed').map((p:any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">¿Qué hay que hacer? *</label>
            <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ej. Llamar al cliente" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
              <select value={form.priority} onChange={e=>setForm({...form, priority:e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                <option value="low">○ Baja</option>
                <option value="medium">◐ Media</option>
                <option value="high">● Alta</option>
                <option value="critical">🔴 Crítica</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Límite</label>
              <input type="date" value={form.due_date} onChange={e=>setForm({...form, due_date:e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
            </div>
          </div>
        </div>
        <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-200 font-medium text-sm rounded-xl transition-colors">Cancelar</button>
          <button onClick={handleSave} disabled={saving || !form.title || !form.project_id} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
            {saving ? 'Guardando...' : 'Crear Tarea'}
          </button>
        </div>
      </div>
    </div>
  );
}

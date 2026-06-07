import React, { useState, useEffect } from 'react';
import { useTrak, TrakTask } from '../../context/TrakContext';
import { supabase } from '@/lib/supabase';
import {
  Plus, Clock,
  Calendar, User, X, Save, Trash2, AlertTriangle, LayoutGrid, Users
} from 'lucide-react';

const COLUMNS = [
  { id: 'todo', title: 'Por Hacer', color: 'bg-slate-50', dot: 'bg-slate-400', border: 'border-slate-200' },
  { id: 'in_progress', title: 'En Progreso', color: 'bg-blue-50', dot: 'bg-blue-500', border: 'border-blue-200' },
  { id: 'in_review', title: 'En Revisión', color: 'bg-amber-50', dot: 'bg-amber-500', border: 'border-amber-200' },
  { id: 'done', title: 'Completado', color: 'bg-emerald-50', dot: 'bg-emerald-500', border: 'border-emerald-200' },
];

const priorityConfig: Record<string, { label: string; color: string; icon: string }> = {
  low:      { label: 'Baja',    color: 'text-slate-500 bg-slate-100',  icon: '○' },
  medium:   { label: 'Media',   color: 'text-blue-700 bg-blue-100',    icon: '◐' },
  high:     { label: 'Alta',    color: 'text-orange-700 bg-orange-100', icon: '●' },
  critical: { label: 'Crítica', color: 'text-red-700 bg-red-100',      icon: '🔴' },
};

export default function ProjectTasks({ projectId }: { projectId: string }) {
  const { tasks, workspaceId, refreshTasks } = useTrak();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<TrakTask | null>(null);
  const [phases, setPhases] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'by_assignee'>('kanban');

  const projectTasks = tasks.filter(t => t.project_id === projectId);

  useEffect(() => {
    // Fetch phases and employees for the form dropdowns
    const fetchExtras = async () => {
      const [phaseRes, empRes] = await Promise.all([
        supabase.from('trak_phases').select('id, name').eq('project_id', projectId).order('order_index'),
        supabase.from('trak_project_members').select('employee:employee_id(id, first_name, last_name)').eq('project_id', projectId),
      ]);
      if (phaseRes.data) setPhases(phaseRes.data);
      if (empRes.data) setEmployees(empRes.data.map((m: any) => m.employee).filter(Boolean));
    };
    fetchExtras();
  }, [projectId]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    await supabase.from('trak_tasks').update({ 
      status: newStatus,
      completed_at: newStatus === 'done' ? new Date().toISOString() : null
    }).eq('id', taskId);
    refreshTasks();
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = async (e: React.DragEvent, statusId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;
    
    const task = projectTasks.find(t => t.id === taskId);
    if (task && task.status !== statusId) {
      await handleStatusChange(taskId, statusId);
    }
  };

  const openCreate = (defaultStatus?: string) => {
    setEditingTask(null);
    setShowTaskForm(true);
  };

  // Group by assignee for the by_assignee view
  const tasksByAssignee = projectTasks.reduce((acc: Record<string, any>, task) => {
    const key = task.assigned_to || '__unassigned__';
    const name = task.assignee
      ? `${task.assignee.first_name} ${task.assignee.last_name}`
      : 'Sin asignar';
    const initials = task.assignee ? task.assignee.first_name?.charAt(0).toUpperCase() : '?';
    if (!acc[key]) acc[key] = { name, initials, tasks: [], hasAssignee: !!task.assignee };
    acc[key].tasks.push(task);
    return acc;
  }, {});

  const assigneeGroups = Object.entries(tasksByAssignee).sort(([, a]: any, [, b]: any) => {
    if (a.hasAssignee && !b.hasAssignee) return -1;
    if (!a.hasAssignee && b.hasAssignee) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="h-full flex flex-col -mx-6 lg:-mx-8">
      {/* Quick stats bar */}
      <div className="px-6 lg:px-8 pb-4 flex items-center gap-4 text-sm flex-wrap">
        <span className="font-bold text-gray-900">{projectTasks.length} tareas</span>
        <span className="text-gray-400">·</span>
        <span className="text-emerald-600 font-medium">{projectTasks.filter(t => t.status === 'done').length} completadas</span>
        <span className="text-gray-400">·</span>
        <span className={`font-medium ${projectTasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length > 0 ? 'text-red-600' : 'text-gray-500'}`}>
          {projectTasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length} vencidas
        </span>
        {/* View toggle */}
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'kanban' ? 'bg-white text-purple-700 shadow' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <LayoutGrid size={14} /> Kanban
            </button>
            <button
              onClick={() => setViewMode('by_assignee')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'by_assignee' ? 'bg-white text-purple-700 shadow' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Users size={14} /> Por Responsable
            </button>
          </div>
          <button onClick={() => openCreate()} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm">
            <Plus size={16} /> Nueva Tarea
          </button>
        </div>
      </div>

      {/* ── KANBAN VIEW ── */}
      {viewMode === 'kanban' && (
        <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 lg:px-8 pb-4">
          <div className="flex gap-5 h-full min-w-max items-start">
            {COLUMNS.map(col => {
              const columnTasks = projectTasks.filter(t => t.status === col.id);
              return (
                <div
                  key={col.id}
                  className={`w-80 flex flex-col max-h-full rounded-2xl ${col.color} border ${col.border}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                >
                  <div className="p-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                      <h3 className="font-bold text-gray-900 text-sm">{col.title}</h3>
                      <span className="bg-white/80 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{columnTasks.length}</span>
                    </div>
                    <button onClick={() => openCreate()} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-white rounded-lg transition-colors">
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="p-3 pt-0 flex-1 overflow-y-auto space-y-2.5 custom-scrollbar">
                    {columnTasks.map(task => {
                      const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          className={`bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition-all group cursor-grab active:cursor-grabbing ${isOverdue ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-200 hover:border-purple-300'}`}
                          onClick={() => { setEditingTask(task); setShowTaskForm(true); }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${priorityConfig[task.priority]?.color}`}>
                              {priorityConfig[task.priority]?.icon} {priorityConfig[task.priority]?.label}
                            </span>
                            <select
                              className="text-xs border-0 bg-transparent text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer focus:ring-0 pr-0"
                              value={task.status}
                              onClick={e => e.stopPropagation()}
                              onChange={e => handleStatusChange(task.id, e.target.value)}
                            >
                              {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                          </div>
                          <h4 className="font-bold text-gray-900 text-sm mb-1 leading-tight line-clamp-2">{task.title}</h4>
                          {task.description && <p className="text-xs text-gray-500 line-clamp-2 mb-2">{task.description}</p>}
                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                              {task.due_date && (
                                <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-bold' : ''}`}>
                                  {isOverdue && <AlertTriangle size={11} />}
                                  <Calendar size={12} />
                                  {new Date(task.due_date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                                </span>
                              )}
                              {task.estimated_hours && (
                                <span className="flex items-center gap-1"><Clock size={12} /> {task.estimated_hours}h</span>
                              )}
                            </div>
                            {task.assignee ? (
                              <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[10px] font-bold" title={`${task.assignee.first_name} ${task.assignee.last_name}`}>
                                {task.assignee.first_name?.charAt(0)}
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-full border-2 border-dashed border-gray-200 text-gray-300 flex items-center justify-center">
                                <User size={12} />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {columnTasks.length === 0 && (
                      <div className="h-24 border-2 border-dashed border-gray-200/60 rounded-xl flex items-center justify-center">
                        <span className="text-xs text-gray-400 font-medium">Sin tareas</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── POR RESPONSABLE VIEW ── */}
      {viewMode === 'by_assignee' && (
        <div className="flex-1 overflow-y-auto px-6 lg:px-8 pb-6 space-y-5">
          {projectTasks.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Users size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-gray-600">No hay tareas en este proyecto</p>
            </div>
          ) : assigneeGroups.map(([key, group]: [string, any]) => {
            const done = group.tasks.filter((t: any) => t.status === 'done').length;
            const overdue = group.tasks.filter((t: any) =>
              t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done'
            ).length;
            const progress = group.tasks.length > 0 ? Math.round((done / group.tasks.length) * 100) : 0;
            return (
              <div key={key} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Header */}
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
                    <div className="flex items-center gap-3 text-xs mt-0.5">
                      <span className="text-gray-500">{group.tasks.length} tarea{group.tasks.length !== 1 ? 's' : ''}</span>
                      <span className="text-emerald-600 font-semibold">{done} completada{done !== 1 ? 's' : ''}</span>
                      {overdue > 0 && <span className="text-red-500 font-semibold">{overdue} vencida{overdue !== 1 ? 's' : ''}</span>}
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 shrink-0">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-600 w-9 text-right">{progress}%</span>
                  </div>
                </div>
                {/* Task rows */}
                <div className="divide-y divide-gray-100">
                  {group.tasks.map((task: any) => {
                    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
                    const colDot = COLUMNS.find(c => c.id === task.status)?.dot || 'bg-gray-400';
                    return (
                      <div
                        key={task.id}
                        onClick={() => { setEditingTask(task); setShowTaskForm(true); }}
                        className="px-5 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-4 group"
                      >
                        <div className={`w-2 h-2 rounded-full shrink-0 ${colDot}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm truncate ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-xs text-gray-400 truncate mt-0.5">{task.description}</p>
                          )}
                        </div>
                        <div className="hidden sm:flex items-center gap-4 shrink-0 text-xs text-gray-400">
                          <span className={`px-2 py-0.5 rounded-md font-bold ${priorityConfig[task.priority]?.color}`}>
                            {priorityConfig[task.priority]?.label}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-semibold">
                            {COLUMNS.find(c => c.id === task.status)?.title}
                          </span>
                          {task.due_date && (
                            <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-bold' : ''}`}>
                              {isOverdue && <AlertTriangle size={11} />}
                              <Calendar size={12} />
                              {new Date(task.due_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                            </span>
                          )}
                        </div>
                        <select
                          className="shrink-0 text-xs border border-gray-200 bg-white text-gray-600 rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer focus:ring-0 outline-none"
                          value={task.status}
                          onClick={e => e.stopPropagation()}
                          onChange={e => handleStatusChange(task.id, e.target.value)}
                        >
                          {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Modal */}
      {showTaskForm && (
        <TaskFormModal 
          task={editingTask} 
          projectId={projectId}
          workspaceId={workspaceId!}
          phases={phases}
          employees={employees}
          onClose={() => setShowTaskForm(false)} 
          onSaved={() => { setShowTaskForm(false); refreshTasks(); }}
        />
      )}
    </div>
  );
}

function TaskFormModal({ task, projectId, workspaceId, phases, employees, onClose, onSaved }: any) {
  const isEdit = !!task;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    sub_activities: task?.sub_activities || '',
    pending_items: task?.pending_items || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    due_date: task?.due_date || '',
    estimated_hours: task?.estimated_hours || '',
    phase_id: task?.phase_id || '',
    assigned_to: task?.assigned_to || '',
  });

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        sub_activities: form.sub_activities || null,
        pending_items: form.pending_items || null,
        status: form.status,
        priority: form.priority,
        due_date: form.due_date || null,
        estimated_hours: form.estimated_hours ? parseFloat(form.estimated_hours) : null,
        phase_id: form.phase_id || null,
        assigned_to: form.assigned_to || null,
        completed_at: form.status === 'done' ? new Date().toISOString() : null,
      };

      if (isEdit) {
        await supabase.from('trak_tasks').update(payload).eq('id', task.id);
      } else {
        await supabase.from('trak_tasks').insert({
          ...payload,
          workspace_id: workspaceId,
          project_id: projectId,
        });
      }
      onSaved();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!task || !confirm('¿Eliminar esta tarea permanentemente?')) return;
    await supabase.from('trak_tasks').delete().eq('id', task.id);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-lg text-gray-900">{isEdit ? 'Editar Tarea' : '✨ Nueva Tarea'}</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg"><X size={20}/></button>
        </div>
        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">¿Qué hay que hacer? *</label>
            <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500" 
              placeholder="Ej. Diseñar la pantalla de login" autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción / Detalles</label>
            <textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-purple-500" rows={3}
              placeholder="Agrega contexto, requisitos o notas..." />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-emerald-700 mb-1">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-emerald-100 rounded-full text-emerald-600 text-xs font-bold">✓</span>
              Sub-actividades realizadas
            </label>
            <textarea
              value={form.sub_activities}
              onChange={e => setForm({...form, sub_activities: e.target.value})}
              className="w-full p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-emerald-400 text-gray-700 placeholder-emerald-300"
              rows={3}
              placeholder="- Croquis realizados&#10;- Reunión con cliente&#10;- Revisión de planos..."
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-amber-700 mb-1">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-amber-100 rounded-full text-amber-600 text-xs font-bold">!</span>
              Pendientes
            </label>
            <textarea
              value={form.pending_items}
              onChange={e => setForm({...form, pending_items: e.target.value})}
              className="w-full p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-amber-400 text-gray-700 placeholder-amber-300"
              rows={3}
              placeholder="- Aprobar presupuesto&#10;- Recibir material&#10;- Confirmar fecha de entrega..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select value={form.status} onChange={e=>setForm({...form, status:e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horas Estimadas</label>
              <input type="number" step="0.5" value={form.estimated_hours} onChange={e=>setForm({...form, estimated_hours:e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" placeholder="Ej. 4" />
            </div>
          </div>

          {/* Phase & Assignment */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fase del Proyecto</label>
              <select value={form.phase_id} onChange={e=>setForm({...form, phase_id:e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                <option value="">Sin fase</option>
                {phases.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asignar a</label>
              <select value={form.assigned_to} onChange={e=>setForm({...form, assigned_to:e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                <option value="">Sin asignar</option>
                {employees.map((emp: any) => <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <div>
            {isEdit && (
              <button onClick={handleDelete} className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1.5 px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 size={15} /> Eliminar
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 font-medium text-sm rounded-xl transition-colors">Cancelar</button>
            <button onClick={handleSave} disabled={saving||!form.title.trim()} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-colors">
              <Save size={16} /> {saving ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Tarea'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

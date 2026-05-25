import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTrak, TrakPhase } from '../../context/TrakContext';
import { Plus, Trash2, Calendar, ChevronDown, ChevronUp, Save, GripVertical, CheckCircle2 } from 'lucide-react';

export default function ProjectPhases({ projectId, projectColor }: { projectId: string; projectColor?: string }) {
  const { tasks } = useTrak();
  const [phases, setPhases] = useState<TrakPhase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', start_date: '', end_date: '' });

  const color = projectColor || '#9333ea';

  useEffect(() => { fetchPhases(); }, [projectId]);

  const fetchPhases = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('trak_phases').select('*').eq('project_id', projectId).order('order_index');
    if (data) setPhases(data);
    setIsLoading(false);
  };

  const handleAdd = async () => {
    const name = prompt('Nombre de la nueva fase:');
    if (!name) return;
    await supabase.from('trak_phases').insert({
      project_id: projectId,
      name,
      order_index: phases.length,
      progress: 0,
      status: 'pending'
    });
    fetchPhases();
  };

  const startEdit = (phase: TrakPhase) => {
    setEditingId(phase.id);
    setEditForm({
      name: phase.name,
      description: phase.description || '',
      start_date: phase.start_date || '',
      end_date: phase.end_date || '',
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await supabase.from('trak_phases').update({
      name: editForm.name,
      description: editForm.description || null,
      start_date: editForm.start_date || null,
      end_date: editForm.end_date || null,
    }).eq('id', editingId);
    setEditingId(null);
    fetchPhases();
  };

  const updateProgress = async (phaseId: string, progress: number) => {
    const clamped = Math.max(0, Math.min(100, progress));
    const status = clamped === 100 ? 'completed' : clamped > 0 ? 'in_progress' : 'pending';
    await supabase.from('trak_phases').update({ progress: clamped, status }).eq('id', phaseId);
    fetchPhases();
  };

  const deletePhase = async (phaseId: string) => {
    if (!confirm('¿Eliminar esta fase? Las tareas vinculadas NO se eliminarán.')) return;
    await supabase.from('trak_phases').delete().eq('id', phaseId);
    fetchPhases();
  };

  const movePhase = async (index: number, direction: 'up' | 'down') => {
    const swap = direction === 'up' ? index - 1 : index + 1;
    if (swap < 0 || swap >= phases.length) return;
    const updates = [
      supabase.from('trak_phases').update({ order_index: swap }).eq('id', phases[index].id),
      supabase.from('trak_phases').update({ order_index: index }).eq('id', phases[swap].id),
    ];
    await Promise.all(updates);
    fetchPhases();
  };

  // Count tasks per phase
  const phaseTasks = (phaseId: string) => {
    const t = tasks.filter(t => t.phase_id === phaseId);
    return { total: t.length, done: t.filter(x => x.status === 'done').length };
  };

  const statusLabel = (s: string) => {
    if (s === 'completed') return { text: 'Completada', cls: 'bg-emerald-100 text-emerald-700' };
    if (s === 'in_progress') return { text: 'En Progreso', cls: 'bg-blue-100 text-blue-700' };
    return { text: 'Pendiente', cls: 'bg-gray-100 text-gray-600' };
  };

  if (isLoading) return <div className="py-8 text-center text-gray-400">Cargando fases...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Fases del Proyecto</h2>
          <p className="text-sm text-gray-500 mt-0.5">Divide tu proyecto en etapas para llevar un seguimiento más claro. Ajusta el progreso de cada fase manualmente o vincúlale tareas.</p>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl transition-colors shadow-sm">
          <Plus size={16} /> Nueva Fase
        </button>
      </div>

      {phases.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 border-dashed rounded-2xl p-12 text-center">
          <CheckCircle2 className="mx-auto mb-3 text-gray-300" size={40} />
          <p className="font-medium text-gray-900">Sin fases definidas</p>
          <p className="text-sm text-gray-500 mt-1">Ejemplo: "Diseño → Desarrollo → QA → Entrega"</p>
        </div>
      ) : (
        <div className="space-y-3">
          {phases.map((phase, index) => {
            const sl = statusLabel(phase.status);
            const pt = phaseTasks(phase.id);
            const isEditing = editingId === phase.id;

            return (
              <div key={phase.id} className={`bg-white border rounded-2xl overflow-hidden transition-all ${isEditing ? 'border-purple-300 shadow-md ring-2 ring-purple-100' : 'border-gray-200 shadow-sm hover:shadow-md'}`}>
                {/* Progress top bar */}
                <div className="h-1.5 bg-gray-100">
                  <div className="h-1.5 transition-all duration-500" style={{ width: `${phase.progress}%`, backgroundColor: phase.progress === 100 ? '#10b981' : color }} />
                </div>

                <div className="p-5">
                  {isEditing ? (
                    /* === EDIT MODE === */
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Nombre de la fase</label>
                          <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Descripción / Entregables</label>
                          <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} rows={2}
                            placeholder="¿Qué se debe entregar en esta fase?"
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Fecha de Inicio</label>
                          <input type="date" value={editForm.start_date} onChange={e => setEditForm({...editForm, start_date: e.target.value})}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Fecha de Entrega</label>
                          <input type="date" value={editForm.end_date} onChange={e => setEditForm({...editForm, end_date: e.target.value})}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                        <button onClick={() => setEditingId(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl text-sm font-medium">Cancelar</button>
                        <button onClick={saveEdit} className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 flex items-center gap-2">
                          <Save size={15} /> Guardar
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* === VIEW MODE === */
                    <div>
                      <div className="flex items-start gap-3">
                        {/* Reorder */}
                        <div className="flex flex-col gap-0.5 pt-1 shrink-0">
                          <button onClick={() => movePhase(index, 'up')} disabled={index === 0} className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-30"><ChevronUp size={14}/></button>
                          <button onClick={() => movePhase(index, 'down')} disabled={index === phases.length - 1} className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-30"><ChevronDown size={14}/></button>
                        </div>

                        {/* Number */}
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                          style={{ backgroundColor: `${color}15`, color }}>
                          {index + 1}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-gray-900 text-base">{phase.name}</h3>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${sl.cls}`}>{sl.text}</span>
                          </div>

                          {phase.description && (
                            <p className="text-sm text-gray-500 mb-2 line-clamp-2">{phase.description}</p>
                          )}

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                            {phase.start_date && <span className="flex items-center gap-1"><Calendar size={12}/> Inicio: {new Date(phase.start_date).toLocaleDateString()}</span>}
                            {phase.end_date && <span className="flex items-center gap-1"><Calendar size={12}/> Entrega: {new Date(phase.end_date).toLocaleDateString()}</span>}
                            {pt.total > 0 && <span className="flex items-center gap-1"><CheckCircle2 size={12}/> Tareas: {pt.done}/{pt.total}</span>}
                          </div>
                        </div>

                        {/* Progress control */}
                        <div className="shrink-0 flex flex-col items-center gap-1 min-w-[80px]">
                          <span className="text-xl font-black" style={{ color: phase.progress === 100 ? '#10b981' : color }}>{phase.progress}%</span>
                          <input
                            type="range" min="0" max="100" step="5"
                            value={phase.progress}
                            onChange={e => updateProgress(phase.id, parseInt(e.target.value))}
                            className="w-full h-1.5 accent-purple-600 cursor-pointer"
                            style={{ accentColor: color }}
                          />
                          <div className="flex gap-1 mt-1">
                            {[0, 25, 50, 75, 100].map(v => (
                              <button key={v} onClick={() => updateProgress(phase.id, v)}
                                className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition-colors ${phase.progress === v ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                                {v}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1 shrink-0">
                          <button onClick={() => startEdit(phase)} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg text-xs font-medium" title="Editar">
                            ✏️
                          </button>
                          <button onClick={() => deletePhase(phase.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Eliminar">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

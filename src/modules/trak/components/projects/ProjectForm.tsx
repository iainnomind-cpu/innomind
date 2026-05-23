import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrak } from '../../context/TrakContext';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Save } from 'lucide-react';

export default function ProjectForm() {
  const navigate = useNavigate();
  const { workspaceId, clients, refreshProjects, refreshClients } = useTrak();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    client_id: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    budget: '',
    estimated_end_date: '',
    color: '#9333ea'
  });

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('trak_projects')
        .insert({
          ...form,
          workspace_id: workspaceId,
          budget: form.budget ? parseFloat(form.budget) : null,
          client_id: form.client_id || null,
          estimated_end_date: form.estimated_end_date || null
        })
        .select()
        .single();

      if (error) throw error;
      
      // Sincronizar el estado del cliente a activo y ganado
      if (form.client_id) {
        await supabase
          .from('trak_clients')
          .update({ status: 'active', pipeline_stage: 'won' })
          .eq('id', form.client_id);
        if (refreshClients) await refreshClients();
      }
      
      // Auto-create default phases
      const { data: settings } = await supabase.from('trak_workspace_settings').select('default_project_phases').eq('workspace_id', workspaceId).single();
      
      if (settings && settings.default_project_phases && settings.default_project_phases.length > 0) {
        const phasesToInsert = settings.default_project_phases.map((phaseName: string, index: number) => ({
          project_id: data.id,
          name: phaseName,
          order_index: index
        }));
        await supabase.from('trak_phases').insert(phasesToInsert);
      }
      
      await refreshProjects();
      navigate(`/trak/projects/${data.id}`);
    } catch (err) {
      console.error('Error saving project:', err);
      alert('Error al crear el proyecto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/trak/projects')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-600 transition-colors mb-6 font-medium"
        >
          <ChevronLeft size={16} /> Volver a Proyectos
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Nuevo Proyecto</h1>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Proyecto *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej. Rediseño web corporativo"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <select
                  value={form.client_id}
                  onChange={e => setForm({ ...form, client_id: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                >
                  <option value="">Interno / Sin Cliente</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.company_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color de Identificación</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={form.color}
                    onChange={e => setForm({ ...form, color: e.target.value })}
                    className="h-12 w-16 p-1 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form.color}
                    onChange={e => setForm({ ...form, color: e.target.value })}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-purple-500 outline-none uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado Inicial</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                >
                  <option value="planning">Planificación</option>
                  <option value="active">Activo</option>
                  <option value="on_hold">En Pausa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                <select
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Estimada de Entrega</label>
                <input
                  type="date"
                  value={form.estimated_end_date}
                  onChange={e => setForm({ ...form, estimated_end_date: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Presupuesto ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.budget}
                  onChange={e => setForm({ ...form, budget: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción y Objetivos</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  placeholder="Detalla de qué trata este proyecto..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button
              onClick={() => navigate('/trak/projects')}
              className="px-6 py-2.5 text-gray-700 hover:bg-gray-200 font-medium rounded-xl text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-colors flex items-center gap-2"
            >
              <Save size={18} />
              {saving ? 'Guardando...' : 'Crear Proyecto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

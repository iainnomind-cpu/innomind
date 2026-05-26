import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTrak } from '../../context/TrakContext';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Save } from 'lucide-react';

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { workspaceId, clients, refreshProjects, refreshClients } = useTrak();
  
  const isEdit = id && id !== 'new';
  const [saving, setSaving] = useState(false);
  const [loadingProject, setLoadingProject] = useState(isEdit);

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

  useEffect(() => {
    if (isEdit) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    setLoadingProject(true);
    try {
      const { data, error } = await supabase
        .from('trak_projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setForm({
          name: data.name || '',
          client_id: data.client_id || '',
          description: data.description || '',
          status: data.status || 'planning',
          priority: data.priority || 'medium',
          budget: data.budget !== null && data.budget !== undefined ? data.budget.toString() : '',
          estimated_end_date: data.estimated_end_date || '',
          color: data.color || '#9333ea'
        });
      }
    } catch (err) {
      console.error('Error fetching project:', err);
      alert('Error al cargar la información del proyecto');
    } finally {
      setLoadingProject(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const projectPayload = {
        name: form.name.trim(),
        client_id: form.client_id || null,
        description: form.description.trim(),
        status: form.status,
        priority: form.priority,
        budget: form.budget ? parseFloat(form.budget) : null,
        estimated_end_date: form.estimated_end_date || null,
        color: form.color,
        workspace_id: workspaceId
      };

      let currentProjectId = id;

      if (isEdit) {
        // Update Project
        const { error } = await supabase
          .from('trak_projects')
          .update(projectPayload)
          .eq('id', id);

        if (error) throw error;
      } else {
        // Insert Project
        const { data, error } = await supabase
          .from('trak_projects')
          .insert(projectPayload)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          currentProjectId = data.id;
          
          // Auto-create default phases only for NEW projects
          const { data: settings } = await supabase
            .from('trak_workspace_settings')
            .select('default_project_phases')
            .eq('workspace_id', workspaceId)
            .single();
          
          if (settings && settings.default_project_phases && settings.default_project_phases.length > 0) {
            const phasesToInsert = settings.default_project_phases.map((phaseName: string, index: number) => ({
              project_id: data.id,
              name: phaseName,
              order_index: index,
              progress: 0
            }));
            await supabase.from('trak_phases').insert(phasesToInsert);
          }
        }
      }
      
      // Sync client status to active & won
      if (form.client_id) {
        await supabase
          .from('trak_clients')
          .update({ status: 'active', pipeline_stage: 'won' })
          .eq('id', form.client_id);
        if (refreshClients) await refreshClients();
      }
      
      await refreshProjects();
      navigate(`/trak/projects/${currentProjectId}`);
    } catch (err) {
      console.error('Error saving project:', err);
      alert(isEdit ? 'Error al guardar los cambios del proyecto' : 'Error al crear el proyecto');
    } finally {
      setSaving(false);
    }
  };

  if (loadingProject) return <div className="p-8 text-center text-gray-500">Cargando proyecto...</div>;

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(isEdit ? `/trak/projects/${id}` : '/trak/projects')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-600 transition-colors mb-6 font-medium"
        >
          <ChevronLeft size={16} /> Volver {isEdit ? 'al Detalle' : 'a Proyectos'}
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h1>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6 text-left">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado del Proyecto</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                >
                  <option value="planning">Planificación</option>
                  <option value="active">Activo</option>
                  <option value="on_hold">En Pausa</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
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

          <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 font-medium">
            <button
              onClick={() => navigate(isEdit ? `/trak/projects/${id}` : '/trak/projects')}
              className="px-6 py-2.5 text-gray-700 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all"
            >
              <Save size={18} />
              {saving ? 'Guardando...' : (isEdit ? 'Guardar Cambios' : 'Crear Proyecto')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

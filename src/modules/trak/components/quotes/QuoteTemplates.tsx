import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTrak } from '../../context/TrakContext';
import { LayoutTemplate, Plus, Search, Trash2, Edit2, X, Save, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QuoteTemplates() {
  const { workspaceId } = useTrak();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // For modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    if (workspaceId) fetchTemplates();
  }, [workspaceId]);

  const fetchTemplates = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('trak_quote_templates')
      .select('*, items:trak_quote_template_items(count)')
      .eq('workspace_id', workspaceId)
      .order('name');
    if (data) setTemplates(data);
    setIsLoading(false);
  };

  const handleSaveTemplate = async () => {
    if (!form.name.trim()) return;
    
    if (editingId) {
      await supabase.from('trak_quote_templates').update({
        name: form.name,
        description: form.description
      }).eq('id', editingId);
    } else {
      await supabase.from('trak_quote_templates').insert({
        workspace_id: workspaceId,
        name: form.name,
        description: form.description
      });
    }
    
    setShowModal(false);
    fetchTemplates();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta plantilla?')) {
      await supabase.from('trak_quote_templates').delete().eq('id', id);
      fetchTemplates();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Plantillas</h2>
          <p className="text-sm text-gray-500 mt-1">Crea estructuras base para agilizar tus cotizaciones futuras.</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setForm({name:'', description:''}); setShowModal(true); }}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-purple-600/20 shrink-0"
        >
          <Plus size={16} /> Nueva Plantilla
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Cargando plantillas...</div>
      ) : templates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <LayoutTemplate className="mx-auto mb-3 text-gray-300" size={48} />
          <p className="font-bold text-gray-900 text-lg">No hay plantillas</p>
          <p className="text-gray-500 text-sm mt-1">Crea plantillas con conjuntos de productos predefinidos.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(tpl => (
            <div key={tpl.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-purple-300 transition-all group">
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <LayoutTemplate size={20} />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingId(tpl.id); setForm({name: tpl.name, description: tpl.description || ''}); setShowModal(true); }} className="p-1.5 text-gray-400 hover:text-purple-600 rounded-lg transition-colors">
                    <Edit2 size={16}/>
                  </button>
                  <button onClick={() => handleDelete(tpl.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors">
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>
              
              <h3 className="font-bold text-gray-900 text-lg mb-1">{tpl.name}</h3>
              {tpl.description && <p className="text-sm text-gray-500 line-clamp-2 mb-4">{tpl.description}</p>}
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                  {tpl.items[0]?.count || 0} ítems
                </span>
                <button onClick={() => navigate(`/trak/quotes/new?template=${tpl.id}`)} className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                  <Copy size={14}/> Usar en Cotización
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-lg">{editingId ? 'Editar Plantilla' : 'Nueva Plantilla'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18}/></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Plantilla *</label>
                <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500" placeholder="Ej. Diseño Web Básico" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-purple-500" rows={3} placeholder="¿Para qué tipo de cliente es esta plantilla?" />
              </div>
            </div>
            <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors">Cancelar</button>
              <button onClick={handleSaveTemplate} disabled={!form.name} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
                <Save size={16} /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

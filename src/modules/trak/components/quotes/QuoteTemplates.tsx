import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTrak } from '../../context/TrakContext';
import { LayoutTemplate, Plus, Search, Trash2, Edit2, X, Save, Copy, PackageSearch, Tag, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QuoteTemplates() {
  const { workspaceId } = useTrak();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // For modal / editor
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  
  // Template items state
  const [items, setItems] = useState<any[]>([
    { id: 'temp-1', name: '', description: '', quantity: 1, unit_price: 0, total: 0 }
  ]);
  
  // Catalog selection states
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [showCatalog, setShowCatalog] = useState(false);

  useEffect(() => {
    if (workspaceId) {
      fetchTemplates();
      fetchCatalog();
    }
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

  const fetchCatalog = async () => {
    if (!workspaceId) return;
    const { data } = await supabase
      .from('trak_products')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('is_active', true)
      .order('name');
    if (data) setCatalogProducts(data);
  };

  const handleOpenModal = async (tpl: any = null) => {
    // Refresh latest catalog items when opening the modal to ensure sync
    fetchCatalog();

    if (tpl) {
      setEditingId(tpl.id);
      setForm({
        name: tpl.name,
        description: tpl.description || '',
      });

      // Load existing template items
      const { data: tplItems } = await supabase
        .from('trak_quote_template_items')
        .select('*')
        .eq('template_id', tpl.id)
        .order('order_index');

      if (tplItems && tplItems.length > 0) {
        setItems(tplItems.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price
        })));
      } else {
        setItems([{ id: `temp-${Date.now()}`, name: '', description: '', quantity: 1, unit_price: 0, total: 0 }]);
      }
    } else {
      setEditingId(null);
      setForm({ name: '', description: '' });
      setItems([{ id: `temp-${Date.now()}`, name: '', description: '', quantity: 1, unit_price: 0, total: 0 }]);
    }
    setShowModal(true);
  };

  const handleSaveTemplate = async () => {
    if (!form.name.trim()) return;
    
    let templateId = editingId;
    
    const tplData = {
      workspace_id: workspaceId,
      name: form.name.trim(),
      description: form.description.trim()
    };
    
    if (editingId) {
      // Update template metadata
      await supabase.from('trak_quote_templates').update({
        name: form.name.trim(),
        description: form.description.trim()
      }).eq('id', editingId);

      // Wipe old template items
      await supabase.from('trak_quote_template_items').delete().eq('template_id', editingId);
    } else {
      // Create new template
      const { data } = await supabase
        .from('trak_quote_templates')
        .insert(tplData)
        .select('id')
        .single();
      if (data) templateId = data.id;
    }
    
    // Save/re-create template items
    if (templateId) {
      const itemsToInsert = items
        .filter(item => item.name.trim() !== '')
        .map((item, index) => ({
          template_id: templateId,
          name: item.name.trim(),
          description: item.description?.trim() || '',
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price,
          order_index: index
        }));
      
      if (itemsToInsert.length > 0) {
        await supabase.from('trak_quote_template_items').insert(itemsToInsert);
      }
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

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total = newItems[index].quantity * newItems[index].unit_price;
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { id: `temp-${Date.now()}`, name: '', description: '', quantity: 1, unit_price: 0, total: 0 }]);
  };

  const addFromCatalog = (product: any) => {
    // If the last item is empty, replace it. Otherwise, append.
    const lastItem = items[items.length - 1];
    const newItem = { 
      id: `temp-${Date.now()}`, 
      name: product.name, 
      description: product.description || '', 
      quantity: 1, 
      unit_price: product.unit_price, 
      total: product.unit_price 
    };

    if (items.length === 1 && !lastItem.name.trim()) {
      setItems([newItem]);
    } else {
      setItems([...items, newItem]);
    }
    setShowCatalog(false);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    } else {
      setItems([{ id: `temp-${Date.now()}`, name: '', description: '', quantity: 1, unit_price: 0, total: 0 }]);
    }
  };

  // Calculations for total template cost
  const totalTemplateAmount = items.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Plantillas de Paquetes Comerciales</h2>
          <p className="text-sm text-gray-500 mt-1">Crea paquetes completos de productos y servicios para agilizar tus propuestas comerciales.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
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
          <p className="text-gray-500 text-sm mt-1">Crea plantillas con conjuntos de productos y servicios predefinidos.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(tpl => (
            <div key={tpl.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <LayoutTemplate size={20} />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleOpenModal(tpl)} className="p-1.5 text-gray-400 hover:text-purple-600 rounded-lg transition-colors">
                      <Edit2 size={16}/>
                    </button>
                    <button onClick={() => handleDelete(tpl.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
                
                <h3 className="font-bold text-gray-900 text-lg mb-1">{tpl.name}</h3>
                {tpl.description && <p className="text-sm text-gray-500 line-clamp-2 mb-4">{tpl.description}</p>}
              </div>
              
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                  {tpl.items[0]?.count || 0} conceptos
                </span>
                <button onClick={() => navigate(`/trak/quotes/new?template=${tpl.id}`)} className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                  <Copy size={14}/> Usar en Cotización
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Templates Builder Modal (Wide for full package construction) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
              <h2 className="font-bold text-lg text-gray-900">{editingId ? 'Editar Plantilla de Paquete' : 'Nueva Plantilla de Paquete'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500"><X size={18}/></button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-left">
              {/* Metadata */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Plantilla *</label>
                  <input 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 font-medium" 
                    placeholder="Ej. Paquete de Marketing Digital Completo" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción / Notas comerciales</label>
                  <input 
                    value={form.description} 
                    onChange={e => setForm({ ...form, description: e.target.value })} 
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500" 
                    placeholder="Ej. Incluye diseño, pauta publicitaria y soporte mensual." 
                  />
                </div>
              </div>

              {/* Items Section */}
              <div>
                <h3 className="font-bold text-gray-950 text-sm mb-3 flex items-center gap-2">
                  <PackageSearch size={16} className="text-purple-600" />
                  Estructura del Paquete (Productos & Servicios)
                </h3>
                
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200 text-left">
                      <tr>
                        <th className="px-4 py-3 w-1/2">Concepto</th>
                        <th className="px-4 py-3 w-20 text-right">Cant.</th>
                        <th className="px-4 py-3 w-32 text-right">Precio Unit.</th>
                        <th className="px-4 py-3 w-32 text-right">Total</th>
                        <th className="px-4 py-3 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {items.map((item, index) => (
                        <tr key={item.id}>
                          <td className="p-2">
                            <input 
                              type="text" 
                              placeholder="Nombre del concepto" 
                              value={item.name} 
                              onChange={e => handleItemChange(index, 'name', e.target.value)} 
                              className="w-full p-2 bg-transparent border-none outline-none font-medium text-gray-900"
                            />
                            <input 
                              type="text" 
                              placeholder="Detalles adicionales..." 
                              value={item.description} 
                              onChange={e => handleItemChange(index, 'description', e.target.value)} 
                              className="w-full p-2 bg-transparent border-none outline-none text-xs text-gray-500"
                            />
                          </td>
                          <td className="p-2 align-top pt-3">
                            <input 
                              type="number" 
                              min="1" 
                              value={item.quantity || ''} 
                              onChange={e => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)} 
                              className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-right outline-none"
                            />
                          </td>
                          <td className="p-2 align-top pt-3">
                            <input 
                              type="number" 
                              step="0.01" 
                              value={item.unit_price || ''} 
                              onChange={e => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)} 
                              className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-right outline-none"
                            />
                          </td>
                          <td className="p-2 align-top pt-5 text-right font-bold text-gray-900 px-4">
                            ${(item.quantity * item.unit_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2 align-top pt-5 text-center">
                            <button onClick={() => removeItem(index)} className="text-gray-400 hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Actions & Catalog Integrator (Moved outside of overflow-hidden parent to prevent popover clipping) */}
                <div className="mt-3 flex items-center gap-4 relative">
                  <button 
                    type="button"
                    onClick={addItem} 
                    className="flex items-center gap-1.5 text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 font-bold text-xs px-3 py-2 rounded-xl transition-colors"
                  >
                    <Plus size={14} /> Fila en blanco
                  </button>
                  
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={() => setShowCatalog(!showCatalog)} 
                      className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 font-bold text-xs px-3 py-2 rounded-xl transition-colors"
                    >
                      <PackageSearch size={14} /> Catálogo de Productos y Servicios
                    </button>
                    
                    {showCatalog && (
                      <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden z-50 max-h-64 overflow-y-auto">
                        <div className="p-2 border-b border-gray-100 bg-gray-50/50">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Combinar Productos y Servicios</p>
                        </div>
                        {catalogProducts.length === 0 ? (
                          <div className="p-4 text-center text-xs text-gray-500">Catálogo vacío. Registra productos/servicios primero.</div>
                        ) : (
                          catalogProducts.map(p => (
                            <button 
                              key={p.id} 
                              type="button"
                              onClick={() => addFromCatalog(p)} 
                              className="w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center gap-1">
                                    <span className={`inline-flex items-center p-0.5 rounded text-[8px] font-extrabold uppercase ${p.type === 'product' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                      {p.type === 'product' ? 'Prod' : 'Serv'}
                                    </span>
                                    <p className="font-bold text-gray-900 text-sm line-clamp-1">{p.name}</p>
                                  </div>
                                  {p.sku && <p className="text-[10px] text-gray-400 font-mono mt-0.5">{p.sku}</p>}
                                </div>
                                <span className="font-bold text-purple-600 text-sm shrink-0">${p.unit_price}</span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-between items-center rounded-b-2xl">
              <div className="text-sm text-gray-600">
                Total del Paquete: <span className="font-black text-purple-600 text-lg ml-1">${totalTemplateAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowModal(false)} 
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveTemplate} 
                  disabled={!form.name || items.filter(i => i.name.trim() !== '').length === 0} 
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-purple-600/20"
                >
                  <Save size={16} /> Guardar Paquete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTrak } from '../../context/TrakContext';
import { Package, Plus, Search, Edit2, Trash2, X, Save, Tag } from 'lucide-react';

export default function ProductCatalog() {
  const { workspaceId } = useTrak();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'product',
    unit_price: '',
    sku: '',
  });

  useEffect(() => {
    if (workspaceId) fetchProducts();
  }, [workspaceId]);

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('trak_products')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('name');
    if (data) setProducts(data);
    setIsLoading(false);
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                       (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    const matchType = typeFilter === 'all' || p.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleOpenModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setForm({
        name: product.name,
        description: product.description || '',
        type: product.type,
        unit_price: product.unit_price.toString(),
        sku: product.sku || '',
      });
    } else {
      setEditingProduct(null);
      setForm({ name: '', description: '', type: 'product', unit_price: '', sku: '' });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.unit_price) return;
    
    const payload = {
      workspace_id: workspaceId,
      name: form.name.trim(),
      description: form.description.trim(),
      type: form.type,
      unit_price: parseFloat(form.unit_price),
      sku: form.sku.trim() || null,
    };

    if (editingProduct) {
      await supabase.from('trak_products').update(payload).eq('id', editingProduct.id);
    } else {
      await supabase.from('trak_products').insert(payload);
    }
    
    setShowModal(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este ítem del catálogo?')) {
      await supabase.from('trak_products').delete().eq('id', id);
      fetchProducts();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Catálogo de Productos y Servicios</h2>
          <p className="text-sm text-gray-500 mt-1">Gestiona los ítems que utilizas en tus cotizaciones.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-purple-600/20 shrink-0"
        >
          <Plus size={16} /> Nuevo Ítem
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex bg-white rounded-xl border border-gray-200 overflow-hidden shrink-0 p-1">
          <button onClick={() => setTypeFilter('all')} className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${typeFilter === 'all' ? 'bg-purple-50 text-purple-700' : 'text-gray-500 hover:bg-gray-50'}`}>Todos</button>
          <button onClick={() => setTypeFilter('product')} className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${typeFilter === 'product' ? 'bg-purple-50 text-purple-700' : 'text-gray-500 hover:bg-gray-50'}`}>Productos</button>
          <button onClick={() => setTypeFilter('service')} className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${typeFilter === 'service' ? 'bg-purple-50 text-purple-700' : 'text-gray-500 hover:bg-gray-50'}`}>Servicios</button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Cargando catálogo...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Package className="mx-auto mb-3 text-gray-300" size={48} />
          <p className="font-bold text-gray-900 text-lg">Catálogo vacío</p>
          <p className="text-gray-500 text-sm mt-1">Aún no tienes productos o servicios registrados.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4 w-32">SKU</th>
                <th className="px-6 py-4 w-32">Tipo</th>
                <th className="px-6 py-4 w-40 text-right">Precio Unitario</th>
                <th className="px-6 py-4 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{item.name}</p>
                    {item.description && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.description}</p>}
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{item.sku || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${item.type === 'product' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                      {item.type === 'product' ? <Package size={12}/> : <Tag size={12}/>}
                      {item.type === 'product' ? 'Producto' : 'Servicio'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    ${item.unit_price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(item)} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-lg">{editingProduct ? 'Editar Ítem' : 'Nuevo Ítem'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18}/></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500" placeholder="Ej. Licencia de Software" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select value={form.type} onChange={e=>setForm({...form, type:e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="product">Producto</option>
                    <option value="service">Servicio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU (Opcional)</label>
                  <input value={form.sku} onChange={e=>setForm({...form, sku:e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500" placeholder="PROD-001" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio Unitario ($) *</label>
                <input type="number" step="0.01" value={form.unit_price} onChange={e=>setForm({...form, unit_price:e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-purple-500" rows={3} placeholder="Detalles adicionales..." />
              </div>
            </div>
            <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={!form.name || !form.unit_price} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
                <Save size={16} /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

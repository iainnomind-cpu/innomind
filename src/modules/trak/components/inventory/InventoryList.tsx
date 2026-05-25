import React, { useState, useEffect } from 'react';
import { useTrak } from '../../context/TrakContext';
import { supabase } from '@/lib/supabase';
import { Package, Plus, Search, Edit3, Trash2, X, AlertTriangle, ArrowDown, ArrowUp, RotateCw } from 'lucide-react';

const categoryOptions = ['General', 'Materiales', 'Herramientas', 'Consumibles', 'Equipos', 'Refacciones', 'Otro'];

export default function InventoryList() {
  const { workspaceId } = useTrak();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showMovement, setShowMovement] = useState<any>(null);

  useEffect(() => { if (workspaceId) fetchItems(); }, [workspaceId]);

  const fetchItems = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('trak_inventory').select('*')
      .eq('workspace_id', workspaceId).order('name');
    if (data) setItems(data);
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este producto del inventario?')) return;
    await supabase.from('trak_inventory').delete().eq('id', id);
    fetchItems();
  };

  const filtered = items.filter(i => {
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) || (i.sku || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'all' || i.category === filterCategory;
    return matchSearch && matchCat;
  });

  const lowStock = items.filter(i => i.quantity <= i.min_stock && i.min_stock > 0);
  const totalValue = items.reduce((s, i) => s + (i.quantity * i.unit_cost), 0);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-500 text-sm mt-1">{items.length} productos · Valor total: ${totalValue.toLocaleString()}</p>
        </div>
        <button onClick={() => { setEditingItem(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-purple-600/20">
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="text-amber-500 shrink-0" size={20} />
          <p className="text-sm text-amber-800 font-medium">
            {lowStock.length} producto{lowStock.length > 1 ? 's' : ''} con stock bajo: {lowStock.map(i => i.name).join(', ')}
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Buscar por nombre o SKU..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none">
          <option value="all">Todas las categorías</option>
          {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase">
              <tr>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4 text-center">Stock</th>
                <th className="px-6 py-4 text-right">Costo Unit.</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  <Package className="mx-auto mb-3 text-gray-200" size={40} />
                  <p className="font-medium text-gray-900">Sin productos</p>
                </td></tr>
              ) : filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{item.name}</p>
                    {item.sku && <p className="text-xs text-gray-400">SKU: {item.sku}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">{item.category || 'General'}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-bold ${item.quantity <= item.min_stock && item.min_stock > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {item.quantity} {item.unit}
                    </span>
                    {item.min_stock > 0 && <p className="text-[10px] text-gray-400">Mín: {item.min_stock}</p>}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-700">${item.unit_cost}</td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">${(item.quantity * item.unit_cost).toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setShowMovement(item)} title="Movimiento"
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><RotateCw size={15} /></button>
                      <button onClick={() => { setEditingItem(item); setShowForm(true); }} title="Editar"
                        className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"><Edit3 size={15} /></button>
                      <button onClick={() => handleDelete(item.id)} title="Eliminar"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && <InventoryFormModal item={editingItem} workspaceId={workspaceId!} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); fetchItems(); }} />}
      {showMovement && <MovementModal item={showMovement} workspaceId={workspaceId!} onClose={() => setShowMovement(null)} onSaved={() => { setShowMovement(null); fetchItems(); }} />}
    </div>
  );
}

function InventoryFormModal({ item, workspaceId, onClose, onSaved }: any) {
  const isEdit = !!item;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: item?.name || '', description: item?.description || '', sku: item?.sku || '',
    category: item?.category || 'General', unit: item?.unit || 'pza',
    quantity: item?.quantity ?? 0, min_stock: item?.min_stock ?? 0,
    unit_cost: item?.unit_cost ?? 0, unit_price: item?.unit_price ?? 0, location: item?.location || '',
  });

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    if (isEdit) {
      await supabase.from('trak_inventory').update({ ...form }).eq('id', item.id);
    } else {
      await supabase.from('trak_inventory').insert({ workspace_id: workspaceId, ...form });
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-lg text-gray-900">{isEdit ? 'Editar Producto' : '✨ Nuevo Producto'}</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500" placeholder="Ej. Tubo PVC 4 pulgadas" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" placeholder="Ej. PVC-4-001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
              <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                {['pza', 'kg', 'lt', 'mt', 'rollo', 'caja', 'par', 'juego', 'servicio'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
              <input value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" placeholder="Ej. Bodega A" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Actual</label>
              <input type="number" step="0.01" value={form.quantity} onChange={e => setForm({...form, quantity: parseFloat(e.target.value) || 0})}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
              <input type="number" step="0.01" value={form.min_stock} onChange={e => setForm({...form, min_stock: parseFloat(e.target.value) || 0})}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Costo Unitario ($)</label>
              <input type="number" step="0.01" value={form.unit_cost} onChange={e => setForm({...form, unit_cost: parseFloat(e.target.value) || 0})}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio Venta ($)</label>
              <input type="number" step="0.01" value={form.unit_price} onChange={e => setForm({...form, unit_price: parseFloat(e.target.value) || 0})}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none resize-none" rows={2} />
          </div>
        </div>
        <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 font-medium text-sm rounded-xl">Cancelar</button>
          <button onClick={handleSave} disabled={saving || !form.name}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
            {saving ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Producto'}
          </button>
        </div>
      </div>
    </div>
  );
}

function MovementModal({ item, workspaceId, onClose, onSaved }: any) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: 'entrada' as string, quantity: 0, notes: '' });

  const handleSave = async () => {
    if (form.quantity <= 0) return;
    setSaving(true);
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const delta = form.type === 'salida' ? -form.quantity : form.type === 'ajuste' ? form.quantity - item.quantity : form.quantity;
    const newQty = form.type === 'ajuste' ? form.quantity : item.quantity + delta;

    await supabase.from('trak_inventory_movements').insert({
      workspace_id: workspaceId, inventory_id: item.id, type: form.type,
      quantity: form.quantity, unit_cost: item.unit_cost, notes: form.notes, created_by: userId,
    });
    await supabase.from('trak_inventory').update({ quantity: Math.max(0, newQty) }).eq('id', item.id);
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-lg text-gray-900">Movimiento: {item.name}</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-500">Stock actual: <span className="font-bold text-gray-900">{item.quantity} {item.unit}</span></p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <div className="flex gap-2">
              {[{v:'entrada',l:'Entrada',icon:ArrowDown,c:'emerald'},{v:'salida',l:'Salida',icon:ArrowUp,c:'red'},{v:'ajuste',l:'Ajuste',icon:RotateCw,c:'blue'}].map(t => (
                <button key={t.v} onClick={() => setForm({...form, type: t.v})}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${form.type === t.v ? `bg-${t.c}-100 text-${t.c}-700 border border-${t.c}-200` : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                  <t.icon size={14} /> {t.l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{form.type === 'ajuste' ? 'Nuevo stock total' : 'Cantidad'}</label>
            <input type="number" step="0.01" min="0" value={form.quantity} onChange={e => setForm({...form, quantity: parseFloat(e.target.value) || 0})}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" placeholder="Motivo..." />
          </div>
        </div>
        <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 font-medium text-sm rounded-xl">Cancelar</button>
          <button onClick={handleSave} disabled={saving || form.quantity <= 0}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
            {saving ? 'Guardando...' : 'Registrar'}
          </button>
        </div>
      </div>
    </div>
  );
}

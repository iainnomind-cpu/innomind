import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTrak } from '../../context/TrakContext';
import { DollarSign, Plus, Trash2, X, Package, Receipt, TrendingUp, Clock } from 'lucide-react';

const expenseCategories = ['general', 'materiales', 'transporte', 'subcontrato', 'permisos', 'herramientas', 'otro'];
const catLabels: Record<string, string> = {
  general: 'General', materiales: 'Materiales', transporte: 'Transporte',
  subcontrato: 'Subcontrato', permisos: 'Permisos', herramientas: 'Herramientas', otro: 'Otro'
};

export default function ProjectCosts({ projectId }: { projectId: string }) {
  const { workspaceId } = useTrak();
  const [materials, setMaterials] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [budget, setBudget] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showMaterialPicker, setShowMaterialPicker] = useState(false);

  useEffect(() => { fetchAll(); }, [projectId]);

  const fetchAll = async () => {
    setIsLoading(true);
    const [matRes, expRes, timeRes, projRes] = await Promise.all([
      supabase.from('trak_project_materials').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
      supabase.from('trak_project_expenses').select('*').eq('project_id', projectId).order('date', { ascending: false }),
      supabase.from('trak_time_entries').select('duration_minutes, billable, hourly_rate').eq('project_id', projectId),
      supabase.from('trak_projects').select('budget').eq('id', projectId).single(),
    ]);
    if (matRes.data) setMaterials(matRes.data);
    if (expRes.data) setExpenses(expRes.data);
    if (timeRes.data) setTimeEntries(timeRes.data);
    if (projRes.data) setBudget(projRes.data.budget || 0);
    setIsLoading(false);
  };

  const totalMaterials = materials.reduce((s, m) => s + (m.total_cost || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const totalLabor = timeEntries.reduce((s, t) => s + ((t.duration_minutes / 60) * (t.hourly_rate || 0)), 0);
  const grandTotal = totalMaterials + totalExpenses + totalLabor;
  const budgetUsed = budget > 0 ? Math.round((grandTotal / budget) * 100) : 0;

  const handleDeleteMaterial = async (id: string) => {
    await supabase.from('trak_project_materials').delete().eq('id', id);
    fetchAll();
  };

  const handleDeleteExpense = async (id: string) => {
    await supabase.from('trak_project_expenses').delete().eq('id', id);
    fetchAll();
  };

  if (isLoading) return <div className="p-8 text-center text-gray-400">Cargando costos...</div>;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
          <p className="text-xs font-medium text-purple-600 mb-1">Presupuesto</p>
          <p className="text-xl font-black text-purple-700">${budget.toLocaleString()}</p>
        </div>
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <p className="text-xs font-medium text-blue-600 mb-1">Materiales</p>
          <p className="text-xl font-black text-blue-700">${totalMaterials.toLocaleString()}</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
          <p className="text-xs font-medium text-amber-600 mb-1">Gastos</p>
          <p className="text-xl font-black text-amber-700">${totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
          <p className="text-xs font-medium text-emerald-600 mb-1">Mano de Obra</p>
          <p className="text-xl font-black text-emerald-700">${totalLabor.toLocaleString()}</p>
        </div>
        <div className={`rounded-2xl p-4 border ${grandTotal > budget && budget > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
          <p className={`text-xs font-medium mb-1 ${grandTotal > budget && budget > 0 ? 'text-red-600' : 'text-gray-600'}`}>Costo Total</p>
          <p className={`text-xl font-black ${grandTotal > budget && budget > 0 ? 'text-red-700' : 'text-gray-900'}`}>${grandTotal.toLocaleString()}</p>
          {budget > 0 && <p className="text-[10px] text-gray-400 mt-0.5">{budgetUsed}% del presupuesto</p>}
        </div>
      </div>

      {/* Budget progress bar */}
      {budget > 0 && (
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">Uso del Presupuesto</span>
            <span className={`font-bold ${budgetUsed > 100 ? 'text-red-600' : budgetUsed > 80 ? 'text-amber-600' : 'text-emerald-600'}`}>{budgetUsed}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div className={`h-3 rounded-full transition-all ${budgetUsed > 100 ? 'bg-red-500' : budgetUsed > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(budgetUsed, 100)}%` }} />
          </div>
        </div>
      )}

      {/* Materials Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2"><Package size={16} /> Materiales del Proyecto</h3>
          <button onClick={() => setShowMaterialPicker(true)}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
            <Plus size={14} /> Agregar Material
          </button>
        </div>
        {materials.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Sin materiales asignados.</div>
        ) : (
          <table className="w-full text-sm"><tbody className="divide-y divide-gray-100">
            {materials.map(m => (
              <tr key={m.id} className="hover:bg-gray-50/50">
                <td className="px-5 py-3 font-medium text-gray-900">{m.name}</td>
                <td className="px-5 py-3 text-gray-500">{m.quantity} uds</td>
                <td className="px-5 py-3 text-gray-500">${m.unit_cost}/u</td>
                <td className="px-5 py-3 text-right font-bold text-gray-900">${m.total_cost?.toLocaleString()}</td>
                <td className="px-3 py-3 w-10">
                  <button onClick={() => handleDeleteMaterial(m.id)} className="p-1 text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody></table>
        )}
      </div>

      {/* Expenses Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2"><Receipt size={16} /> Gastos del Proyecto</h3>
          <button onClick={() => setShowExpenseForm(true)}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
            <Plus size={14} /> Registrar Gasto
          </button>
        </div>
        {expenses.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Sin gastos registrados.</div>
        ) : (
          <table className="w-full text-sm"><tbody className="divide-y divide-gray-100">
            {expenses.map(e => (
              <tr key={e.id} className="hover:bg-gray-50/50">
                <td className="px-5 py-3"><span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">{catLabels[e.category] || e.category}</span></td>
                <td className="px-5 py-3 font-medium text-gray-900">{e.description}</td>
                <td className="px-5 py-3 text-gray-500 text-xs">{new Date(e.date).toLocaleDateString()}</td>
                <td className="px-5 py-3 text-right font-bold text-gray-900">${e.amount?.toLocaleString()}</td>
                <td className="px-3 py-3 w-10">
                  <button onClick={() => handleDeleteExpense(e.id)} className="p-1 text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody></table>
        )}
      </div>

      {showExpenseForm && <ExpenseFormModal projectId={projectId} onClose={() => setShowExpenseForm(false)} onSaved={() => { setShowExpenseForm(false); fetchAll(); }} />}
      {showMaterialPicker && <MaterialPickerModal projectId={projectId} workspaceId={workspaceId!} onClose={() => setShowMaterialPicker(false)} onSaved={() => { setShowMaterialPicker(false); fetchAll(); }} />}
    </div>
  );
}

function ExpenseFormModal({ projectId, onClose, onSaved }: any) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ category: 'general', description: '', amount: 0, date: new Date().toISOString().split('T')[0] });

  const handleSave = async () => {
    if (!form.description || form.amount <= 0) return;
    setSaving(true);
    const userId = (await supabase.auth.getUser()).data.user?.id;
    await supabase.from('trak_project_expenses').insert({ project_id: projectId, ...form, created_by: userId });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-lg">Registrar Gasto</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
              {expenseCategories.map(c => <option key={c} value={c}>{catLabels[c]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
            <input value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" placeholder="Ej. Gasolina para traslado" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto ($) *</label>
              <input type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: parseFloat(e.target.value) || 0})}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
            </div>
          </div>
        </div>
        <div className="p-5 bg-gray-50 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 text-sm font-medium rounded-xl">Cancelar</button>
          <button onClick={handleSave} disabled={saving || !form.description || form.amount <= 0}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function MaterialPickerModal({ projectId, workspaceId, onClose, onSaved }: any) {
  const [inventory, setInventory] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('trak_inventory').select('*').eq('workspace_id', workspaceId).eq('is_active', true).order('name')
      .then(({ data }) => { if (data) setInventory(data); });
  }, []);

  const filtered = inventory.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async () => {
    if (!selected || qty <= 0) return;
    setSaving(true);
    const totalCost = qty * selected.unit_cost;

    // Insert material into project
    await supabase.from('trak_project_materials').insert({
      project_id: projectId, inventory_id: selected.id, name: selected.name,
      quantity: qty, unit_cost: selected.unit_cost, total_cost: totalCost,
    });

    // Decrement inventory stock
    const newQty = Math.max(0, selected.quantity - qty);
    await supabase.from('trak_inventory').update({ quantity: newQty }).eq('id', selected.id);

    // Log inventory movement
    const userId = (await supabase.auth.getUser()).data.user?.id;
    await supabase.from('trak_inventory_movements').insert({
      workspace_id: workspaceId, inventory_id: selected.id, project_id: projectId,
      type: 'proyecto', quantity: qty, unit_cost: selected.unit_cost,
      notes: `Asignado al proyecto`, created_by: userId,
    });

    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h2 className="font-bold text-lg">Agregar Material del Inventario</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-3 flex-1 overflow-y-auto">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto..."
            className="w-full pl-4 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500" />

          {selected ? (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <p className="font-bold text-purple-900">{selected.name}</p>
                <button onClick={() => setSelected(null)} className="text-xs text-purple-600 hover:underline">Cambiar</button>
              </div>
              <p className="text-xs text-purple-600">Stock disponible: {selected.quantity} {selected.unit} · Costo: ${selected.unit_cost}/u</p>
              <div>
                <label className="block text-sm font-medium text-purple-800 mb-1">Cantidad a asignar</label>
                <input type="number" step="0.01" min="0.01" max={selected.quantity} value={qty}
                  onChange={e => setQty(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-white border border-purple-200 rounded-xl text-sm outline-none" />
              </div>
              <p className="text-sm font-bold text-purple-900">Total: ${(qty * selected.unit_cost).toLocaleString()}</p>
            </div>
          ) : (
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No hay productos en inventario.</p>
              ) : filtered.map(item => (
                <button key={item.id} onClick={() => { setSelected(item); setQty(1); }}
                  className="w-full text-left p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors">
                  <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">Stock: {item.quantity} {item.unit} · ${item.unit_cost}/u</p>
                </button>
              ))}
            </div>
          )}
        </div>
        {selected && (
          <div className="p-5 bg-gray-50 border-t flex justify-end gap-3 shrink-0">
            <button onClick={onClose} className="px-4 py-2 text-gray-700 text-sm font-medium rounded-xl">Cancelar</button>
            <button onClick={handleAdd} disabled={saving || qty <= 0 || qty > selected.quantity}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium">
              {saving ? 'Asignando...' : 'Asignar al Proyecto'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

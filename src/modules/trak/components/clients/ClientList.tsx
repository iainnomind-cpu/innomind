import React, { useState } from 'react';
import { useTrak, TrakClient } from '../../context/TrakContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import {
  Users, Plus, Search, Building2, Mail, Phone, ArrowUpRight,
  Filter, MoreHorizontal, UserPlus, Briefcase, X
} from 'lucide-react';

const statusLabel: Record<string, { text: string; class: string }> = {
  lead: { text: 'Lead', class: 'bg-amber-100 text-amber-700' },
  active: { text: 'Activo', class: 'bg-emerald-100 text-emerald-700' },
  inactive: { text: 'Inactivo', class: 'bg-gray-100 text-gray-500' },
};

const pipelineLabel: Record<string, { text: string; class: string }> = {
  new: { text: 'Nuevo', class: 'bg-blue-100 text-blue-700' },
  contacted: { text: 'Contactado', class: 'bg-purple-100 text-purple-700' },
  quoted: { text: 'Cotizado', class: 'bg-amber-100 text-amber-700' },
  won: { text: 'Ganado', class: 'bg-emerald-100 text-emerald-700' },
  lost: { text: 'Perdido', class: 'bg-red-100 text-red-700' },
};

export default function ClientList() {
  const { clients, workspaceId, refreshClients } = useTrak();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<TrakClient | null>(null);

  const filtered = clients.filter(c => {
    const matchSearch = !search || 
      c.company_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.contact_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleEdit = (client: TrakClient) => {
    setEditingClient(client);
    setShowForm(true);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 text-sm mt-1">{clients.length} clientes registrados</p>
        </div>
        <button
          onClick={() => { setEditingClient(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-purple-600/20"
        >
          <UserPlus size={18} /> Nuevo Cliente
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por empresa, contacto o email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'lead', 'active', 'inactive'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filterStatus === s
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s === 'all' ? 'Todos' : statusLabel[s]?.text || s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Empresa</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden md:table-cell">Contacto</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden lg:table-cell">Industria</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Estado</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden sm:table-cell">Pipeline</th>
                <th className="text-right px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Users className="mx-auto mb-3 text-gray-200" size={40} />
                    <p className="text-gray-400 font-medium">Sin clientes encontrados</p>
                    <p className="text-gray-300 text-xs mt-1">Agrega tu primer cliente para comenzar</p>
                  </td>
                </tr>
              ) : (
                filtered.map(client => (
                  <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0">
                          {client.company_name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{client.company_name}</p>
                          <p className="text-xs text-gray-400 truncate md:hidden">{client.contact_name || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-gray-900">{client.contact_name || '—'}</p>
                      <p className="text-xs text-gray-400">{client.email || ''}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500 hidden lg:table-cell">{client.industry || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${statusLabel[client.status]?.class}`}>
                        {statusLabel[client.status]?.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${pipelineLabel[client.pipeline_stage]?.class}`}>
                        {pipelineLabel[client.pipeline_stage]?.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(client)}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <ClientFormModal
          client={editingClient}
          workspaceId={workspaceId!}
          onClose={() => { setShowForm(false); setEditingClient(null); }}
          onSaved={() => { setShowForm(false); setEditingClient(null); refreshClients(); }}
        />
      )}
    </div>
  );
}

// ========== CLIENT FORM MODAL ==========
function ClientFormModal({ client, workspaceId, onClose, onSaved }: {
  client: TrakClient | null;
  workspaceId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!client;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company_name: client?.company_name || '',
    contact_name: client?.contact_name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    industry: client?.industry || '',
    website: client?.website || '',
    address: client?.address || '',
    status: client?.status || 'lead',
    pipeline_stage: client?.pipeline_stage || 'new',
    notes: client?.notes || '',
  });

  const handleSave = async () => {
    if (!form.company_name.trim()) return;
    setSaving(true);
    try {
      if (isEdit) {
        await supabase.from('trak_clients').update({ ...form, updated_at: new Date().toISOString() }).eq('id', client!.id);
      } else {
        await supabase.from('trak_clients').insert({ ...form, workspace_id: workspaceId });
      }
      onSaved();
    } catch (err) {
      console.error('Error saving client:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!client || !confirm('¿Estás seguro de eliminar este cliente?')) return;
    await supabase.from('trak_clients').delete().eq('id', client.id);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 rounded-lg"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <Field label="Empresa *" value={form.company_name} onChange={v => setForm(p => ({ ...p, company_name: v }))} placeholder="Nombre de la empresa" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Contacto" value={form.contact_name} onChange={v => setForm(p => ({ ...p, contact_name: v }))} placeholder="Nombre del contacto" />
            <Field label="Industria" value={form.industry} onChange={v => setForm(p => ({ ...p, industry: v }))} placeholder="ej. Tecnología" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email" value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} placeholder="correo@empresa.com" type="email" />
            <Field label="Teléfono" value={form.phone} onChange={v => setForm(p => ({ ...p, phone: v }))} placeholder="+52 000 000 0000" />
          </div>
          <Field label="Sitio Web" value={form.website} onChange={v => setForm(p => ({ ...p, website: v }))} placeholder="https://..." />
          <Field label="Dirección" value={form.address} onChange={v => setForm(p => ({ ...p, address: v }))} placeholder="Dirección completa" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500">
                <option value="lead">Lead</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pipeline</label>
              <select value={form.pipeline_stage} onChange={e => setForm(p => ({ ...p, pipeline_stage: e.target.value as any }))} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500">
                <option value="new">Nuevo</option>
                <option value="contacted">Contactado</option>
                <option value="quoted">Cotizado</option>
                <option value="won">Ganado</option>
                <option value="lost">Perdido</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="Notas internas sobre el cliente..." className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
          <div>
            {isEdit && (
              <button onClick={handleDelete} className="text-sm text-red-500 hover:text-red-700 font-medium">Eliminar</button>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-200 font-medium rounded-lg text-sm">Cancelar</button>
            <button onClick={handleSave} disabled={saving || !form.company_name.trim()} className="px-5 py-2 bg-purple-600 disabled:opacity-50 hover:bg-purple-700 text-white font-medium rounded-lg text-sm transition-colors">
              {saving ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Cliente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
    </div>
  );
}

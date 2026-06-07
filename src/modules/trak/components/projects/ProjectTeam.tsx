import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTrak } from '../../context/TrakContext';
import { Users, Plus, Trash2, UserCheck, UserPlus, Mail, Briefcase, DollarSign } from 'lucide-react';

export default function ProjectTeam({ projectId }: { projectId: string }) {
  const { workspaceId } = useTrak();
  const [members, setMembers] = useState<any[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Toggle: 'hr' = desde módulo RH, 'manual' = ingreso libre
  const [addMode, setAddMode] = useState<'hr' | 'manual'>('hr');

  const [formHR, setFormHR] = useState({
    employee_id: '',
    role_in_project: '',
    hourly_rate_override: ''
  });

  const [formManual, setFormManual] = useState({
    guest_name: '',
    guest_email: '',
    role_in_project: '',
    hourly_rate_override: ''
  });

  useEffect(() => { fetchData(); }, [projectId]);

  const fetchData = async () => {
    setIsLoading(true);
    const [{ data: teamData }, { data: empData }] = await Promise.all([
      supabase.from('trak_project_members').select('*, employee:employee_id(*)').eq('project_id', projectId),
      supabase.from('trak_employees').select('*').eq('workspace_id', workspaceId).eq('status', 'active'),
    ]);
    if (teamData) setMembers(teamData);
    if (empData) setAvailableEmployees(empData);
    setIsLoading(false);
  };

  const handleAddFromHR = async () => {
    if (!formHR.employee_id) return alert('Selecciona un colaborador');
    setSaving(true);
    try {
      await supabase.from('trak_project_members').insert({
        project_id: projectId,
        employee_id: formHR.employee_id,
        role_in_project: formHR.role_in_project || null,
        hourly_rate_override: formHR.hourly_rate_override ? parseFloat(formHR.hourly_rate_override) : null,
        is_guest: false,
      });
      setShowForm(false);
      setFormHR({ employee_id: '', role_in_project: '', hourly_rate_override: '' });
      fetchData();
    } catch {
      alert('Error: ¿Quizás ya está en el proyecto?');
    } finally { setSaving(false); }
  };

  const handleAddManual = async () => {
    if (!formManual.guest_name.trim()) return alert('Escribe al menos el nombre');
    setSaving(true);
    try {
      await supabase.from('trak_project_members').insert({
        project_id: projectId,
        employee_id: null,
        guest_name: formManual.guest_name.trim(),
        guest_email: formManual.guest_email.trim() || null,
        role_in_project: formManual.role_in_project || null,
        hourly_rate_override: formManual.hourly_rate_override ? parseFloat(formManual.hourly_rate_override) : null,
        is_guest: true,
      });
      setShowForm(false);
      setFormManual({ guest_name: '', guest_email: '', role_in_project: '', hourly_rate_override: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error guardando miembro');
    } finally { setSaving(false); }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('¿Quitar a esta persona del proyecto?')) return;
    await supabase.from('trak_project_members').delete().eq('id', id);
    fetchData();
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500 animate-pulse">Cargando equipo...</div>;

  const unassignedEmployees = availableEmployees.filter(emp => !members.some(m => m.employee_id === emp.id));

  // Helper: display name and initials for any member type
  const getMemberDisplay = (m: any) => {
    if (m.is_guest || !m.employee) {
      const name = m.guest_name || 'Sin nombre';
      return { name, role: m.role_in_project || 'Colaborador externo', initials: name.charAt(0).toUpperCase(), isGuest: true };
    }
    return {
      name: `${m.employee.first_name} ${m.employee.last_name}`,
      role: m.role_in_project || m.employee.role,
      initials: `${m.employee.first_name?.charAt(0) || ''}${m.employee.last_name?.charAt(0) || ''}`.toUpperCase(),
      isGuest: false,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Equipo Asignado</h2>
          <p className="text-sm text-gray-500 mt-0.5">{members.length} persona{members.length !== 1 ? 's' : ''} en el proyecto</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl transition-colors shadow-sm shadow-purple-600/20"
          >
            <Plus size={16} /> Asignar Persona
          </button>
        )}
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Mode Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setAddMode('hr')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold transition-all ${
                addMode === 'hr'
                  ? 'text-purple-700 border-b-2 border-purple-600 bg-purple-50/50'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <UserCheck size={16} />
              Desde módulo RH
            </button>
            <button
              onClick={() => setAddMode('manual')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold transition-all ${
                addMode === 'manual'
                  ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/50'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <UserPlus size={16} />
              Agregar manualmente
            </button>
          </div>

          <div className="p-5 space-y-4">
            {addMode === 'hr' ? (
              <>
                <p className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                  Selecciona un colaborador registrado en el módulo de <strong>Equipo (RH)</strong>.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Colaborador *</label>
                    <select
                      value={formHR.employee_id}
                      onChange={e => setFormHR({ ...formHR, employee_id: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Seleccionar...</option>
                      {unassignedEmployees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} — {emp.role}</option>
                      ))}
                    </select>
                    {unassignedEmployees.length === 0 && (
                      <p className="text-xs text-amber-600 mt-1">Todos los empleados activos ya están en el proyecto.</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Rol en el proyecto</label>
                    <input
                      value={formHR.role_in_project}
                      onChange={e => setFormHR({ ...formHR, role_in_project: e.target.value })}
                      placeholder="Ej. Líder Técnico"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tarifa / hora ($)</label>
                    <input
                      type="number" step="0.01"
                      value={formHR.hourly_rate_override}
                      onChange={e => setFormHR({ ...formHR, hourly_rate_override: e.target.value })}
                      placeholder="Ej. 150.00"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-1">
                  <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors">Cancelar</button>
                  <button onClick={handleAddFromHR} disabled={saving || !formHR.employee_id} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
                    {saving ? 'Guardando...' : 'Agregar al equipo'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                  Agrega a alguien <strong>sin necesidad de registrarlo en RH</strong>. Útil para freelancers, proveedores o colaboradores externos.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nombre completo *</label>
                    <input
                      value={formManual.guest_name}
                      onChange={e => setFormManual({ ...formManual, guest_name: e.target.value })}
                      placeholder="Ej. Carlos López"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Correo electrónico</label>
                    <input
                      type="email"
                      value={formManual.guest_email}
                      onChange={e => setFormManual({ ...formManual, guest_email: e.target.value })}
                      placeholder="Ej. carlos@empresa.com"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Rol en el proyecto</label>
                    <input
                      value={formManual.role_in_project}
                      onChange={e => setFormManual({ ...formManual, role_in_project: e.target.value })}
                      placeholder="Ej. Proveedor de sonido"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tarifa / hora ($)</label>
                    <input
                      type="number" step="0.01"
                      value={formManual.hourly_rate_override}
                      onChange={e => setFormManual({ ...formManual, hourly_rate_override: e.target.value })}
                      placeholder="Ej. 200.00"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-1">
                  <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors">Cancelar</button>
                  <button onClick={handleAddManual} disabled={saving || !formManual.guest_name.trim()} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
                    {saving ? 'Guardando...' : 'Agregar al equipo'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Team Cards */}
      {members.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <Users className="mx-auto mb-3 text-gray-300" size={40} />
          <p className="font-semibold text-gray-900">No hay nadie asignado al proyecto</p>
          <p className="text-sm text-gray-500 mt-1">Asigna colaboradores de RH o agrega personas manualmente.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map(member => {
            const { name, role, initials, isGuest } = getMemberDisplay(member);
            return (
              <div key={member.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group relative">
                {/* Guest badge */}
                {isGuest && (
                  <span className="absolute top-4 right-4 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                    Externo
                  </span>
                )}
                <div className="flex gap-3 items-start mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${
                    isGuest
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-purple-100 text-purple-600'
                  }`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <h4 className="font-bold text-gray-900 truncate">{name}</h4>
                    <p className={`text-xs font-medium truncate mt-0.5 ${isGuest ? 'text-emerald-600' : 'text-purple-600'}`}>
                      {role}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-500">
                  {member.guest_email && (
                    <div className="flex items-center gap-2">
                      <Mail size={12} className="shrink-0 text-gray-400" />
                      <span className="truncate">{member.guest_email}</span>
                    </div>
                  )}
                  {(member.hourly_rate_override || member.employee?.salary_amount) && (
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="flex items-center gap-1.5 text-gray-500">
                        <DollarSign size={12} /> Tarifa:
                      </span>
                      <span className="font-bold text-gray-900">
                        ${member.hourly_rate_override || member.employee?.salary_amount || 0}/hr
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleRemove(member.id)}
                  className="absolute bottom-4 right-4 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  title="Quitar del proyecto"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

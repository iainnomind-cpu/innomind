import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTrak } from '../../context/TrakContext';
import { Users, Plus, Trash2, Save } from 'lucide-react';

export default function ProjectTeam({ projectId }: { projectId: string }) {
  const { workspaceId } = useTrak();
  const [members, setMembers] = useState<any[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form for adding a member
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    employee_id: '',
    role_in_project: '',
    hourly_rate_override: ''
  });

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    setIsLoading(true);
    // Get current project members
    const { data: teamData } = await supabase
      .from('trak_project_members')
      .select('*, employee:employee_id(*)')
      .eq('project_id', projectId);
    
    // Get all available employees
    const { data: empData } = await supabase
      .from('trak_employees')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('status', 'active');
      
    if (teamData) setMembers(teamData);
    if (empData) setAvailableEmployees(empData);
    setIsLoading(false);
  };

  const handleAddMember = async () => {
    if (!form.employee_id) return alert('Selecciona un empleado');
    setSaving(true);
    
    try {
      await supabase.from('trak_project_members').insert({
        project_id: projectId,
        employee_id: form.employee_id,
        role_in_project: form.role_in_project,
        hourly_rate_override: form.hourly_rate_override ? parseFloat(form.hourly_rate_override) : null
      });
      
      setShowForm(false);
      setForm({ employee_id: '', role_in_project: '', hourly_rate_override: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error agregando miembro al equipo (¿Quizás ya está en el proyecto?)');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (id: string) => {
    if (!confirm('¿Quitar a esta persona del proyecto?')) return;
    await supabase.from('trak_project_members').delete().eq('id', id);
    fetchData();
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Cargando equipo...</div>;

  // Filter out employees already in the project
  const unassignedEmployees = availableEmployees.filter(emp => !members.some(m => m.employee_id === emp.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Equipo Asignado</h2>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 text-sm font-medium text-purple-600 bg-purple-50 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Plus size={16} /> Asignar Persona
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">Nuevo Miembro</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Empleado *</label>
              <select value={form.employee_id} onChange={e=>setForm({...form, employee_id:e.target.value})} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                <option value="">Seleccionar...</option>
                {unassignedEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.role})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Rol específico en proyecto</label>
              <input type="text" value={form.role_in_project} onChange={e=>setForm({...form, role_in_project:e.target.value})} placeholder="Ej. Lider Técnico" className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tarifa por hora ($) - Opcional</label>
              <input type="number" step="0.01" value={form.hourly_rate_override} onChange={e=>setForm({...form, hourly_rate_override:e.target.value})} placeholder="Ej. 150.00" className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-1">Cancelar</button>
            <button onClick={handleAddMember} disabled={saving || !form.employee_id} className="bg-purple-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg disabled:opacity-50">Guardar</button>
          </div>
        </div>
      )}

      {members.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <Users className="mx-auto mb-3 text-gray-300" size={40} />
          <p className="font-medium text-gray-900">No hay nadie asignado al proyecto</p>
          <p className="text-sm text-gray-500 mt-1">Asigna a alguien de RRHH para llevar el control de sus horas.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map(member => (
            <div key={member.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col group">
              <div className="flex gap-3 items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg shrink-0 uppercase">
                  {member.employee?.first_name?.charAt(0)}{member.employee?.last_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 truncate pr-4">{member.employee?.first_name} {member.employee?.last_name}</h4>
                  <p className="text-xs text-purple-600 font-medium truncate">{member.role_in_project || member.employee?.role}</p>
                </div>
                <button 
                  onClick={() => handleRemoveMember(member.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4 bg-white rounded-md border border-gray-200 shadow-sm"
                  title="Quitar del proyecto"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              
              <div className="mt-auto pt-3 border-t border-gray-100">
                <div className="text-xs flex justify-between">
                  <span className="text-gray-500">Tarifa proyecto:</span>
                  <span className="font-bold text-gray-900">
                    ${member.hourly_rate_override || member.employee?.salary_amount || 0} / hr
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

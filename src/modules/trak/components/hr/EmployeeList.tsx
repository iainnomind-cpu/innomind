import React, { useState, useEffect } from 'react';
import { useTrak } from '../../context/TrakContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Users, Plus, Search, MoreHorizontal, FileText, Phone, Mail, Clock, DollarSign, Calculator } from 'lucide-react';
import PayrollDashboard from './PayrollDashboard';

const statusConfig: Record<string, { label: string, color: string }> = {
  active: { label: 'Activo', color: 'bg-emerald-100 text-emerald-700' },
  on_leave: { label: 'Permiso / Vacaciones', color: 'bg-amber-100 text-amber-700' },
  inactive: { label: 'Inactivo', color: 'bg-red-100 text-red-700' },
};

const payTypeConfig: Record<string, string> = {
  hourly: 'Por Hora',
  daily: 'Por Día',
  monthly: 'Mensual',
};

export default function EmployeeList() {
  const { workspaceId } = useTrak();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'team' | 'payroll'>('team');

  useEffect(() => {
    if (workspaceId) {
      fetchEmployees();
    }
  }, [workspaceId]);

  const fetchEmployees = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('trak_employees')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('first_name', { ascending: true });
    
    if (data) setEmployees(data);
    setIsLoading(false);
  };

  const filteredEmployees = employees.filter(e => {
    const term = search.toLowerCase();
    return !search || 
      e.first_name.toLowerCase().includes(term) || 
      e.last_name.toLowerCase().includes(term) ||
      e.role.toLowerCase().includes(term);
  });

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recursos Humanos</h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona a los miembros de tu equipo, salarios y documentos</p>
        </div>
        <button
          onClick={() => navigate('/trak/hr/new')}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-purple-600/20"
        >
          <Plus size={18} /> Nuevo Empleado
        </button>
      </div>

      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('team')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'team' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center gap-2"><Users size={16}/> Equipo</div>
        </button>
        <button
          onClick={() => setActiveTab('payroll')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'payroll' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center gap-2"><Calculator size={16}/> Nómina</div>
        </button>
      </div>

      {activeTab === 'payroll' ? (
        <PayrollDashboard />
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por nombre o cargo..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>

          {/* List */}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full p-12 text-center text-gray-400">Cargando equipo...</div>
            ) : filteredEmployees.length === 0 ? (
              <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
                <Users className="mx-auto mb-4 text-gray-300" size={48} />
                <p className="font-medium text-lg text-gray-900">No hay empleados registrados</p>
                <p className="text-sm mt-1">Da de alta a tu equipo para asignarlos a proyectos y pagar nóminas.</p>
              </div>
            ) : (
              filteredEmployees.map(emp => (
                <div key={emp.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                  <div className="p-5 flex gap-4 border-b border-gray-100">
                    <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xl font-bold shrink-0 uppercase">
                      {emp.first_name.charAt(0)}{emp.last_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900 truncate pr-2">{emp.first_name} {emp.last_name}</h3>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusConfig[emp.status]?.color}`}>
                          {statusConfig[emp.status]?.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 font-medium truncate">{emp.role}</p>
                    </div>
                  </div>
                  
                  <div className="p-5 bg-gray-50/50 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <DollarSign size={14} className="text-gray-400" />
                        <span className="font-semibold text-gray-900">${emp.salary_amount}</span> / {payTypeConfig[emp.payment_type]}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Clock size={14} className="text-gray-400" />
                        <span className="truncate">{emp.schedule_details || 'Sin horario'}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      {emp.email && (
                        <a href={`mailto:${emp.email}`} className="p-1.5 text-gray-400 hover:text-purple-600 bg-white border border-gray-200 rounded-lg shadow-sm">
                          <Mail size={14} />
                        </a>
                      )}
                      {emp.phone && (
                        <a href={`tel:${emp.phone}`} className="p-1.5 text-gray-400 hover:text-purple-600 bg-white border border-gray-200 rounded-lg shadow-sm">
                          <Phone size={14} />
                        </a>
                      )}
                      <button onClick={() => navigate(`/trak/hr/${emp.id}`)} className="ml-auto text-xs font-medium text-purple-600 hover:text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg transition-colors">
                        Ver Perfil & Doc.
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

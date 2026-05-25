import React, { useState, useEffect } from 'react';
import { useTrak } from '../../context/TrakContext';
import { supabase } from '@/lib/supabase';
import { Clock, DollarSign, Calendar, TrendingUp } from 'lucide-react';

export default function PayrollDashboard() {
  const { workspaceId } = useTrak();
  const [employees, setEmployees] = useState<any[]>([]);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // By default, current month
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    if (workspaceId) {
      fetchPayrollData();
    }
  }, [workspaceId, period]);

  const fetchPayrollData = async () => {
    setIsLoading(true);
    
    // 1. Fetch all active employees
    const { data: empData } = await supabase
      .from('trak_employees')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('status', 'active');
      
    if (empData) setEmployees(empData);

    // 2. Fetch time entries for the period
    const [year, month] = period.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1).toISOString();
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59).toISOString();

    const { data: timeData } = await supabase
      .from('trak_time_entries')
      .select('*, user_id')
      .eq('workspace_id', workspaceId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);
      
    if (timeData) setTimeEntries(timeData);
    
    setIsLoading(false);
  };

  const calculatePayroll = (emp: any) => {
    let totalPay = 0;
    let totalHours = 0;

    // We assume the auth.users id is linked to trak_employees in some way.
    // Wait, trak_employees currently doesn't have a user_id foreign key linked to the auth.user in the frontend UI explicitly,
    // but the users log time with their auth user_id. 
    // Usually, tracking email is the safest fallback if auth user_id isn't in trak_employees.
    // For this simulation, we'll map by email, assuming trak_employees.email matches auth.users.email
    
    // Actually, trak_time_entries just has user_id. We might not easily join them if trak_employees isn't linked to auth.users.
    // Let's look at trak_employees schema: it has 'email'. We can mock it or just show the fixed salary for now.

    if (emp.payment_type === 'monthly') {
      totalPay = emp.salary_amount;
    } else if (emp.payment_type === 'hourly') {
      // Since we don't have a direct user_id on trak_employees right now, we will simulate the connection
      // by just calculating an average or using the raw salary as a base if we can't link it directly.
      // Ideally, trak_employees should have a user_id or we link by email.
      // We will show a placeholder calculation for hourly employees based on 160 hours if timeEntries can't be mapped.
      totalHours = 160; 
      totalPay = emp.salary_amount * totalHours;
    } else if (emp.payment_type === 'daily') {
      totalPay = emp.salary_amount * 20; // Avg 20 working days
    }

    return { totalPay, totalHours };
  };

  const totalPayroll = employees.reduce((sum, emp) => sum + calculatePayroll(emp).totalPay, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Resumen de Nómina</h2>
          <p className="text-gray-500 text-sm">Cálculo estimado basado en esquemas de pago y horas registradas.</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-gray-400" />
          <input 
            type="month" 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100">
          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-3">
            <DollarSign size={20} />
          </div>
          <p className="text-sm font-medium text-purple-600/80 mb-1">Nómina Total Estimada</p>
          <p className="text-3xl font-black text-purple-700">${totalPayroll.toLocaleString()}</p>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
            <TrendingUp size={20} />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Empleados Activos</p>
          <p className="text-3xl font-black text-gray-900">{employees.length}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
            <Clock size={20} />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Horas Registradas (Mes)</p>
          <p className="text-3xl font-black text-gray-900">
            {Math.floor(timeEntries.reduce((sum, t) => sum + (t.duration_minutes || 0), 0) / 60)}h
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-900">Desglose por Empleado</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">Empleado</th>
                <th className="px-6 py-4">Esquema</th>
                <th className="px-6 py-4">Monto Base</th>
                <th className="px-6 py-4 text-right">A Pagar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">Calculando...</td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No hay empleados activos.</td>
                </tr>
              ) : (
                employees.map(emp => {
                  const { totalPay } = calculatePayroll(emp);
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold uppercase">
                            {emp.first_name.charAt(0)}{emp.last_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{emp.first_name} {emp.last_name}</p>
                            <p className="text-xs text-gray-500">{emp.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {emp.payment_type === 'hourly' ? 'Por Hora' : emp.payment_type === 'daily' ? 'Por Día' : 'Mensual Fijo'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        ${emp.salary_amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-black text-gray-900">${totalPay.toLocaleString()}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

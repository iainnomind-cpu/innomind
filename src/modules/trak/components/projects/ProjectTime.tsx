import React, { useState, useEffect } from 'react';
import { useTrak } from '../../context/TrakContext';
import { supabase } from '@/lib/supabase';
import { Clock, Calendar as CalendarIcon, PieChart, TrendingUp } from 'lucide-react';

export default function ProjectTime({ projectId }: { projectId: string }) {
  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, billable: 0 });

  useEffect(() => {
    fetchEntries();
  }, [projectId]);

  const fetchEntries = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('trak_time_entries')
      .select('*, task:task_id(title), user:user_id(raw_user_meta_data)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (data) {
      setEntries(data);
      const total = data.reduce((acc, curr) => acc + curr.duration_minutes, 0);
      const billable = data.filter(d => d.billable).reduce((acc, curr) => acc + curr.duration_minutes, 0);
      setStats({ total, billable });
    }
    setIsLoading(false);
  };

  const formatHours = (minutes: number) => {
    return (minutes / 60).toFixed(1) + 'h';
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-3">
            <Clock size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatHours(stats.total)}</p>
          <p className="text-xs font-medium text-gray-500 mt-1">Tiempo Total</p>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
            <TrendingUp size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatHours(stats.billable)}</p>
          <p className="text-xs font-medium text-gray-500 mt-1">Horas Facturables</p>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-3">
            <PieChart size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{entries.length}</p>
          <p className="text-xs font-medium text-gray-500 mt-1">Sesiones Registradas</p>
        </div>
      </div>

      {/* Entries List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="font-bold text-gray-900">Registro de Actividad</h2>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Cargando registros...</div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Clock className="mx-auto mb-3 text-gray-200" size={40} />
            <p className="font-medium text-gray-900">Sin registros de tiempo</p>
            <p className="text-sm mt-1">Los miembros del equipo pueden registrar horas en sus tareas.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {entries.map(entry => (
              <div key={entry.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                  {entry.user?.raw_user_meta_data?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {entry.task?.title || entry.description || 'Sin descripción'}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <CalendarIcon size={12} />
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                    {entry.billable && (
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">Facturable</span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 font-bold text-gray-900">
                  {formatHours(entry.duration_minutes)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

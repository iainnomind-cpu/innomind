import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { CalendarDays, AlertCircle } from 'lucide-react';

export default function ProjectGantt({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    setIsLoading(true);
    // Fetch tasks related to this project
    const { data } = await supabase
      .from('trak_tasks')
      .select('id, title, status, start_date, due_date, created_at, assigned_to')
      .eq('project_id', projectId)
      .order('start_date', { ascending: true, nullsFirst: false });
    
    if (data) setTasks(data);
    setIsLoading(false);
  };

  const { ganttTasks, startDate, endDate, totalDays, days } = useMemo(() => {
    if (!tasks || tasks.length === 0) return { ganttTasks: [], startDate: new Date(), endDate: new Date(), totalDays: 0, days: [] };

    // Normalize tasks dates
    const normalized = tasks.map(t => {
      const start = new Date(t.start_date || t.created_at);
      let end = t.due_date ? new Date(t.due_date) : new Date(start);
      if (end < start) end = new Date(start); // Prevent reverse dates
      return { ...t, parsedStart: start, parsedEnd: end };
    });

    // Find min and max dates
    let minDate = new Date(Math.min(...normalized.map(t => t.parsedStart.getTime())));
    let maxDate = new Date(Math.max(...normalized.map(t => t.parsedEnd.getTime())));

    // Add padding (7 days before and after)
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);

    // Calculate total days
    const msPerDay = 1000 * 60 * 60 * 24;
    const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / msPerDay);

    // Generate array of days for the header
    const days = [];
    for (let i = 0; i <= totalDays; i++) {
      const d = new Date(minDate);
      d.setDate(d.getDate() + i);
      days.push(d);
    }

    return { ganttTasks: normalized, startDate: minDate, endDate: maxDate, totalDays, days };
  }, [tasks]);

  if (isLoading) return <div className="p-8 text-center text-gray-400">Cargando cronograma...</div>;

  if (ganttTasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
        <CalendarDays className="mx-auto mb-3 text-gray-300" size={40} />
        <p className="font-bold text-gray-900">No hay tareas para graficar</p>
        <p className="text-sm text-gray-500 mt-1">Crea tareas en la pestaña "Tareas" para verlas en el cronograma.</p>
      </div>
    );
  }

  const DAY_WIDTH = 40; // Pixels per day

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-emerald-500 border-emerald-600';
      case 'in_progress': return 'bg-blue-500 border-blue-600';
      case 'review': return 'bg-amber-500 border-amber-600';
      default: return 'bg-gray-400 border-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
      <div className="p-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50 shrink-0">
        <CalendarDays size={20} className="text-purple-600" />
        <div>
          <h2 className="text-lg font-bold text-gray-900">Cronograma del Proyecto (Gantt)</h2>
          <p className="text-xs text-gray-500">Visualiza las dependencias y duración de las tareas.</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative bg-gray-50 flex">
        
        {/* Left pane: Task List */}
        <div className="w-64 shrink-0 border-r border-gray-200 bg-white sticky left-0 z-20 flex flex-col">
          <div className="h-14 border-b border-gray-200 flex items-center px-4 bg-gray-100 font-bold text-xs text-gray-500 uppercase sticky top-0 z-30">
            Tarea
          </div>
          <div className="flex-1 overflow-y-hidden">
            {ganttTasks.map((task, i) => (
              <div key={task.id} className="h-12 border-b border-gray-100 flex items-center px-4 hover:bg-gray-50 transition-colors">
                <p className="text-sm font-medium text-gray-900 truncate" title={task.title}>{task.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right pane: Timeline */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden relative" style={{ width: `${days.length * DAY_WIDTH}px` }}>
          
          {/* Header Dates */}
          <div className="h-14 border-b border-gray-200 flex sticky top-0 z-10 bg-white">
            {days.map((d, i) => {
              const isToday = new Date().toDateString() === d.toDateString();
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              return (
                <div key={i} className={`shrink-0 flex flex-col items-center justify-center border-r border-gray-100 ${isWeekend ? 'bg-gray-50' : 'bg-white'}`} style={{ width: `${DAY_WIDTH}px` }}>
                  <span className="text-[9px] text-gray-400 font-medium uppercase">{d.toLocaleDateString('es', { weekday: 'short' }).charAt(0)}</span>
                  <span className={`text-xs font-bold ${isToday ? 'bg-purple-600 text-white w-5 h-5 rounded-full flex items-center justify-center' : 'text-gray-700'}`}>
                    {d.getDate()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Grid Background */}
          <div className="absolute top-14 bottom-0 left-0 right-0 flex pointer-events-none">
            {days.map((d, i) => (
              <div key={i} className={`shrink-0 h-full border-r border-gray-100 ${d.getDay() === 0 || d.getDay() === 6 ? 'bg-gray-50/50' : ''}`} style={{ width: `${DAY_WIDTH}px` }} />
            ))}
          </div>

          {/* Today Line */}
          {days.some(d => d.toDateString() === new Date().toDateString()) && (
            <div 
              className="absolute top-14 bottom-0 w-0.5 bg-red-400/50 z-10"
              style={{ left: `${days.findIndex(d => d.toDateString() === new Date().toDateString()) * DAY_WIDTH + (DAY_WIDTH/2)}px` }}
            />
          )}

          {/* Task Bars */}
          <div className="relative pt-0">
            {ganttTasks.map((task, i) => {
              const msPerDay = 1000 * 60 * 60 * 24;
              const startOffsetDays = Math.max(0, (task.parsedStart.getTime() - startDate.getTime()) / msPerDay);
              const durationDays = Math.max(1, (task.parsedEnd.getTime() - task.parsedStart.getTime()) / msPerDay + 1); // +1 to include end day
              
              const left = startOffsetDays * DAY_WIDTH;
              const width = durationDays * DAY_WIDTH;

              return (
                <div key={task.id} className="h-12 border-b border-transparent relative flex items-center group hover:bg-gray-50/10">
                  <div 
                    className={`absolute h-7 rounded-lg border shadow-sm flex items-center px-2 cursor-pointer transition-all hover:brightness-110 overflow-hidden ${getStatusColor(task.status)}`}
                    style={{ left: `${left}px`, width: `${width}px` }}
                    title={`${task.title}\nInicio: ${task.parsedStart.toLocaleDateString()}\nFin: ${task.parsedEnd.toLocaleDateString()}`}
                  >
                    <span className="text-[10px] text-white font-bold truncate">{task.title}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
      
      <div className="p-3 bg-gray-50 border-t border-gray-200 flex gap-4 text-xs font-medium text-gray-500 justify-center">
        <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-gray-400"></div> Pendiente</span>
        <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-blue-500"></div> En Progreso</span>
        <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-amber-500"></div> Revisión</span>
        <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500"></div> Completado</span>
      </div>
    </div>
  );
}

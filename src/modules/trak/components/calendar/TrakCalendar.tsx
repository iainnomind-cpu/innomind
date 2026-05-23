import React, { useState, useEffect, useMemo } from 'react';
import { useTrak } from '../../context/TrakContext';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Calendar as CalIcon, CheckSquare, FolderKanban,
  FileText, Clock, AlertTriangle, Plus, X, Save, Target
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'task_due' | 'project_deadline' | 'quote_expiry' | 'phase_deadline' | 'custom';
  color: string;
  meta?: any;
  link?: string;
  isOverdue?: boolean;
}

const typeConfig: Record<string, { icon: any; label: string; defaultColor: string }> = {
  task_due:         { icon: CheckSquare,   label: 'Tarea',      defaultColor: '#6366f1' },
  project_deadline: { icon: FolderKanban,  label: 'Proyecto',   defaultColor: '#9333ea' },
  quote_expiry:     { icon: FileText,      label: 'Cotización', defaultColor: '#f59e0b' },
  phase_deadline:   { icon: Target,        label: 'Fase',       defaultColor: '#06b6d4' },
  custom:           { icon: CalIcon,       label: 'Evento',     defaultColor: '#10b981' },
};

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export default function TrakCalendar() {
  const { tasks, projects, workspaceId } = useTrak();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [phases, setPhases] = useState<any[]>([]);
  const [customEvents, setCustomEvents] = useState<any[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', date: '', color: '#10b981', notes: '' });

  useEffect(() => {
    if (workspaceId) fetchExtras();
  }, [workspaceId]);

  const fetchExtras = async () => {
    const [qRes, phRes, ceRes] = await Promise.all([
      supabase.from('trak_quotes').select('id, title, valid_until, status, quote_number').eq('workspace_id', workspaceId).not('valid_until', 'is', null),
      supabase.from('trak_phases').select('id, name, end_date, project_id, progress').not('end_date', 'is', null),
      supabase.from('trak_project_activity').select('*').eq('type', 'milestone'),
    ]);
    if (qRes.data) setQuotes(qRes.data);
    if (phRes.data) setPhases(phRes.data);
    if (ceRes.data) setCustomEvents(ceRes.data);
  };

  // Build events from all sources
  const events: CalendarEvent[] = useMemo(() => {
    const ev: CalendarEvent[] = [];
    const today = new Date().toISOString().split('T')[0];

    // Tasks with due dates
    tasks.forEach(t => {
      if (t.due_date && t.status !== 'done') {
        const proj = projects.find(p => p.id === t.project_id);
        ev.push({
          id: `task-${t.id}`, title: t.title, date: t.due_date,
          type: 'task_due', color: proj?.color || '#6366f1',
          meta: { projectName: proj?.name, priority: t.priority, status: t.status },
          link: t.project_id ? `/trak/projects/${t.project_id}` : '/trak/tasks',
          isOverdue: t.due_date < today,
        });
      }
    });

    // Project deadlines
    projects.forEach(p => {
      if (p.estimated_end_date && p.status !== 'completed' && p.status !== 'cancelled') {
        ev.push({
          id: `proj-${p.id}`, title: `📦 ${p.name}`, date: p.estimated_end_date,
          type: 'project_deadline', color: p.color || '#9333ea',
          meta: { progress: p.progress, status: p.status },
          link: `/trak/projects/${p.id}`,
          isOverdue: p.estimated_end_date < today,
        });
      }
    });

    // Quote expiry dates
    quotes.forEach(q => {
      if (q.valid_until && q.status !== 'accepted' && q.status !== 'rejected') {
        ev.push({
          id: `quote-${q.id}`, title: `💰 ${q.title}`, date: q.valid_until,
          type: 'quote_expiry', color: '#f59e0b',
          meta: { quoteNumber: q.quote_number, status: q.status },
          link: `/trak/quotes/${q.id}`,
          isOverdue: q.valid_until < today,
        });
      }
    });

    // Phase deadlines
    phases.forEach(ph => {
      if (ph.end_date && ph.progress < 100) {
        ev.push({
          id: `phase-${ph.id}`, title: `🎯 ${ph.name}`, date: ph.end_date,
          type: 'phase_deadline', color: '#06b6d4',
          meta: { progress: ph.progress },
          link: ph.project_id ? `/trak/projects/${ph.project_id}` : undefined,
          isOverdue: ph.end_date < today,
        });
      }
    });

    return ev;
  }, [tasks, projects, quotes, phases]);

  // Calendar grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const selectedEvents = selectedDate ? events.filter(e => e.date === selectedDate) : [];

  // Stats
  const overdueCount = events.filter(e => e.isOverdue).length;
  const thisMonthEvents = events.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const handleCreateEvent = async () => {
    if (!eventForm.title || !eventForm.date) return;
    // We'll save custom events as project_activity of type 'milestone'
    // For a standalone calendar, we could create a separate table, but reusing activity keeps it simple
    setShowEventForm(false);
    setEventForm({ title: '', date: '', color: '#10b981', notes: '' });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Calendario</h1>
          <p className="text-gray-500 text-sm mt-1">
            {thisMonthEvents.length} eventos este mes
            {overdueCount > 0 && <span className="text-red-600 font-semibold"> · {overdueCount} vencidos</span>}
          </p>
        </div>
      </div>

      {/* Quick Legend */}
      <div className="flex flex-wrap gap-3 mb-6">
        {Object.entries(typeConfig).filter(([k]) => k !== 'custom').map(([key, cfg]) => {
          const Icon = cfg.icon;
          const count = thisMonthEvents.filter(e => e.type === key).length;
          return (
            <div key={key} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium text-gray-600">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cfg.defaultColor }} />
              <Icon size={13} /> {cfg.label} ({count})
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Calendar Grid */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Month Navigator */}
          <div className="p-5 flex items-center justify-between border-b border-gray-100">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ChevronLeft size={20}/></button>
            <div className="text-center">
              <h2 className="text-lg font-black text-gray-900">{MONTHS[month]} {year}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={goToday} className="px-3 py-1.5 text-xs font-medium bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors">Hoy</button>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ChevronRight size={20}/></button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAYS.map(d => (
              <div key={d} className="p-2 text-center text-xs font-bold text-gray-400 uppercase">{d}</div>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] p-2 bg-gray-50/50 border-b border-r border-gray-100" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = getEventsForDay(day);
              const isToday = dateStr === today;
              const isSelected = dateStr === selectedDate;
              const hasOverdue = dayEvents.some(e => e.isOverdue);

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(dateStr === selectedDate ? null : dateStr)}
                  className={`min-h-[100px] p-1.5 border-b border-r border-gray-100 cursor-pointer transition-colors group ${
                    isSelected ? 'bg-purple-50 ring-2 ring-inset ring-purple-300' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mb-1 ${
                    isToday ? 'bg-purple-600 text-white' : 'text-gray-700 group-hover:bg-gray-200'
                  }`}>
                    {day}
                  </div>

                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map(ev => (
                      <div
                        key={ev.id}
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded truncate leading-tight ${ev.isOverdue ? 'bg-red-100 text-red-700' : ''}`}
                        style={!ev.isOverdue ? { backgroundColor: `${ev.color}20`, color: ev.color } : undefined}
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-gray-400 font-medium px-1.5">+{dayEvents.length - 3} más</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Selected Day / Upcoming */}
        <div className="space-y-5">
          {/* Selected day detail */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <CalIcon size={16} className="text-purple-600" />
              {selectedDate 
                ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
                : 'Selecciona un día'
              }
            </h3>
            {selectedDate ? (
              selectedEvents.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">No hay eventos este día.</p>
              ) : (
                <div className="space-y-2">
                  {selectedEvents.map(ev => {
                    const cfg = typeConfig[ev.type];
                    const Icon = cfg.icon;
                    return (
                      <div
                        key={ev.id}
                        onClick={() => ev.link && navigate(ev.link)}
                        className={`p-3 rounded-xl border transition-all ${ev.isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:border-purple-300 hover:shadow-sm'} ${ev.link ? 'cursor-pointer' : ''}`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${ev.color}20`, color: ev.color }}>
                            <Icon size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{ev.title}</p>
                            <p className="text-[11px] text-gray-500 font-medium">{cfg.label}</p>
                            {ev.meta?.projectName && <p className="text-[11px] text-purple-600 font-medium mt-0.5">{ev.meta.projectName}</p>}
                            {ev.meta?.progress !== undefined && <p className="text-[11px] text-gray-400">Progreso: {ev.meta.progress}%</p>}
                            {ev.isOverdue && <p className="text-[11px] text-red-600 font-bold mt-1 flex items-center gap-1"><AlertTriangle size={11}/> Vencido</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Haz clic en un día para ver sus eventos.</p>
            )}
          </div>

          {/* Upcoming (next 7 days) */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Clock size={16} className="text-purple-600" /> Próximos 7 Días
            </h3>
            {(() => {
              const next7 = events
                .filter(e => {
                  const d = new Date(e.date);
                  const now = new Date();
                  now.setHours(0,0,0,0);
                  const week = new Date(now);
                  week.setDate(week.getDate() + 7);
                  return d >= now && d <= week;
                })
                .sort((a, b) => a.date.localeCompare(b.date));

              if (next7.length === 0) return <p className="text-sm text-gray-500 text-center py-3">Sin eventos próximos 🎉</p>;

              return (
                <div className="space-y-2">
                  {next7.slice(0, 8).map(ev => (
                    <div key={ev.id} onClick={() => ev.link && navigate(ev.link)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ev.color }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900 truncate">{ev.title}</p>
                        <p className="text-[10px] text-gray-400">{new Date(ev.date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Overdue alert */}
          {overdueCount > 0 && (
            <div className="bg-red-50 rounded-2xl border border-red-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-red-600" />
                <span className="text-sm font-bold text-red-800">{overdueCount} eventos vencidos</span>
              </div>
              <div className="space-y-1.5">
                {events.filter(e => e.isOverdue).slice(0, 5).map(ev => (
                  <div key={ev.id} onClick={() => ev.link && navigate(ev.link)}
                    className="text-xs text-red-700 font-medium truncate cursor-pointer hover:underline">
                    • {ev.title}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

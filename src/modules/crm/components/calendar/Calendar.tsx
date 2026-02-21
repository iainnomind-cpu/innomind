import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Phone, Video, Bell, X } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { EventType } from '@/types';

export default function Calendar() {
    const { calendarEvents, prospects, deleteCalendarEvent } = useCRM();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const openModalForDate = (date: Date) => {
        setSelectedDate(date);
        setIsEventModalOpen(true);
    };

    // Calendar Grid Data
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    // Pad to start from Sunday
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    // Pad to end on Saturday
    const endDate = new Date(monthEnd);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const dateFormat = "d";
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const getEventsForDay = (day: Date) => {
        return calendarEvents.filter(event => isSameDay(new Date(event.startTime), day));
    };

    const getEventTypeColor = (type: EventType) => {
        switch (type) {
            case 'reunión': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'llamada': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'recordatorio': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getEventTypeIcon = (type: EventType) => {
        switch (type) {
            case 'reunión': return <Video size={12} className="mr-1" />;
            case 'llamada': return <Phone size={12} className="mr-1" />;
            case 'recordatorio': return <Bell size={12} className="mr-1" />;
            default: return null;
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 relative">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <CalendarIcon className="text-blue-600" />
                        Calendario
                    </h1>
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                        <button onClick={prevMonth} className="p-1 hover:bg-white rounded-md transition-colors"><ChevronLeft size={20} /></button>
                        <span className="min-w-[120px] text-center font-bold text-slate-700 text-sm capitalize">
                            {format(currentDate, 'MMMM yyyy', { locale: es })}
                        </span>
                        <button onClick={nextMonth} className="p-1 hover:bg-white rounded-md transition-colors"><ChevronRight size={20} /></button>
                    </div>
                </div>
                <button
                    onClick={() => openModalForDate(new Date())}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm shadow-blue-600/20"
                >
                    <Plus size={18} />
                    Nuevo Evento
                </button>
            </div>

            {/* Grid Container */}
            <div className="flex-1 overflow-auto p-6">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">
                    {/* Days Header */}
                    <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 shrink-0">
                        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                            <div key={day} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                        {days.map((day, idx) => {
                            const isCurrentMonth = isSameMonth(day, monthStart);
                            const dayEvents = getEventsForDay(day);
                            return (
                                <div
                                    key={day.toString()}
                                    onClick={() => openModalForDate(day)}
                                    className={`
                                        min-h-[120px] border-b border-r border-slate-100 p-2 transition-colors hover:bg-slate-50 cursor-pointer
                                        ${!isCurrentMonth ? 'bg-slate-50/50 opacity-50' : 'bg-white'}
                                        ${idx % 7 === 6 ? 'border-r-0' : ''}
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-sm font-semibold flex items-center justify-center w-7 h-7 rounded-full
                                            ${isToday(day) ? 'bg-blue-600 text-white' : 'text-slate-700'}
                                        `}>
                                            {format(day, dateFormat)}
                                        </span>
                                    </div>
                                    <div className="space-y-1.5 overflow-y-auto max-h-[80px] custom-scrollbar">
                                        {dayEvents.map(event => {
                                            const prospect = prospects.find(p => p.id === event.prospectId);
                                            return (
                                                <div
                                                    key={event.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm('¿Eliminar este evento?')) {
                                                            deleteCalendarEvent(event.id);
                                                        }
                                                    }}
                                                    className={`text-xs px-2 py-1.5 rounded-md border shadow-sm truncate flex flex-col gap-0.5 hover:opacity-80 transition-opacity ${getEventTypeColor(event.type)}`}
                                                    title={`${event.title}\n${event.description || ''}`}
                                                >
                                                    <div className="font-bold flex items-center truncate">
                                                        {getEventTypeIcon(event.type)}
                                                        <span className="truncate">{event.title}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between ms-4">
                                                        <span className="text-[10px] opacity-80 font-medium">
                                                            {format(new Date(event.startTime), 'HH:mm')}
                                                        </span>
                                                        {prospect && (
                                                            <span className="text-[9px] px-1 bg-white/50 rounded-sm truncate max-w-[60px]" title={prospect.nombre}>
                                                                {prospect.nombre.split(' ')[0]}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Event Modal */}
            {isEventModalOpen && (
                <EventFormModal
                    initialDate={selectedDate}
                    onClose={() => setIsEventModalOpen(false)}
                />
            )}
        </div>
    );
}

export function EventFormModal({ initialDate, initialProspectId, onClose }: { initialDate: Date, initialProspectId?: string, onClose: () => void }) {
    const { addCalendarEvent, prospects } = useCRM();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<EventType>('reunión');
    const [prospectId, setProspectId] = useState(initialProspectId || '');

    // Time Strings for native time inputs
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const [startH, startM] = startTime.split(':');
        const start = new Date(initialDate);
        start.setHours(parseInt(startH), parseInt(startM));

        const [endH, endM] = endTime.split(':');
        const end = new Date(initialDate);
        end.setHours(parseInt(endH), parseInt(endM));

        await addCalendarEvent({
            title,
            description,
            type,
            startTime: start,
            endTime: end,
            prospectId: prospectId || undefined
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        Nuevo Evento
                    </h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Título {format(initialDate, '(dd/MM/yyyy)')}</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Ej. Demostración de producto"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Tipo</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as EventType)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="reunión">Reunión</option>
                                <option value="llamada">Llamada</option>
                                <option value="recordatorio">Recordatorio</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Vincular a Prospecto (Opcional)</label>
                            <select
                                value={prospectId}
                                onChange={(e) => setProspectId(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">-- Ninguno --</option>
                                {prospects.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre} ({p.empresa})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Hora Inicio</label>
                            <input
                                type="time"
                                required
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Hora Fin</label>
                            <input
                                type="time"
                                required
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Notas / Descripción</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            rows={3}
                            placeholder="Detalles de la reunión..."
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md shadow-blue-600/20">
                            Guardar Evento
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

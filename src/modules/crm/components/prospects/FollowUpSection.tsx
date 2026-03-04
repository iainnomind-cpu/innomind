import React, { useState } from 'react';
import { useCRM } from '@/context/CRMContext';
import { useUsers } from '@/context/UserContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Clock, MessageSquare, Calendar, FileText } from 'lucide-react';
import { Prospect } from '@/types';

interface FollowUpSectionProps {
    prospect: Prospect;
    onAddCalendarEvent: () => void;
}

export const FollowUpSection: React.FC<FollowUpSectionProps> = ({ prospect, onAddCalendarEvent }) => {
    const { calendarEvents, quotes } = useCRM();
    const { users, currentUser } = useUsers();

    const [isAddingNote, setIsAddingNote] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [isSubmittingNote, setIsSubmittingNote] = useState(false);

    // UI Local State for new notes
    const [localNotes, setLocalNotes] = useState<{ id: string, nota: string, fecha: Date, usuario: string }[]>([]);

    const getUserName = (userId: string) => {
        const user = users.find(u => u.id === userId);
        return user ? user.name : 'Desconocido';
    };

    const handleAddFollowUp = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newNote.trim() || !currentUser) return;

        setIsSubmittingNote(true);

        // Add to local state only, no DB connect
        const newLocalNote = {
            id: Math.random().toString(36).substr(2, 9),
            nota: newNote,
            fecha: new Date(),
            usuario: currentUser.id
        };

        setLocalNotes(prev => [newLocalNote, ...prev]);

        setNewNote('');
        setIsAddingNote(false);
        setIsSubmittingNote(false);
    };

    const prospectEvents = calendarEvents.filter(e => e.prospectId === prospect.id);
    const prospectQuotes = quotes.filter(q => q.prospectId === prospect.id);

    type TimelineItem = {
        id: string;
        type: 'note' | 'event' | 'quote';
        date: Date;
        title: string;
        description: string;
        user?: string;
    };

    // Merge DB notes with Local notes
    const allNotes = [...(prospect.seguimientos || []), ...localNotes];

    const timeline: TimelineItem[] = [
        ...allNotes.map(s => ({
            id: s.id,
            type: 'note' as const,
            date: new Date(s.fecha),
            title: 'Nota de seguimiento',
            description: s.nota,
            user: s.usuario
        })),
        ...prospectEvents.map(e => ({
            id: e.id,
            type: 'event' as const,
            date: new Date(e.startTime),
            title: `📅 Evento: ${e.title}`,
            description: e.description || e.type,
        })),
        ...prospectQuotes.map(q => ({
            id: q.id,
            type: 'quote' as const,
            date: new Date(q.fecha),
            title: `📄 Cotización ${q.numero} (${q.estado})`,
            description: `Total: $${q.total.toLocaleString()}`,
        }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Clock size={20} className="text-blue-500" />
                Seguimiento
            </h2>

            {!isAddingNote ? (
                <div className="flex gap-3 mb-8">
                    <button
                        type="button"
                        onClick={() => setIsAddingNote(true)}
                        className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-500 px-4 py-2.5 rounded-lg font-medium transition-colors text-sm"
                    >
                        <Plus size={18} />
                        Agregar nota de seguimiento...
                    </button>
                    <button
                        type="button"
                        onClick={onAddCalendarEvent}
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors"
                    >
                        <Calendar size={18} />
                        Agendar
                    </button>
                </div>
            ) : (
                <form onSubmit={handleAddFollowUp} className="mb-8 bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm transition-all">
                    <textarea
                        id="new-note-input"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Escribe los detalles del seguimiento aquí..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-y mb-3 text-sm"
                        required
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => { setIsAddingNote(false); setNewNote(''); }}
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
                            disabled={isSubmittingNote}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!newNote.trim() || isSubmittingNote}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm flex items-center justify-center min-w-[120px]"
                        >
                            {isSubmittingNote ? "Guardando..." : "Guardar Nota"}
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[19px] before:w-0.5 before:bg-gray-200">
                {timeline.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No hay actividad registrada
                    </div>
                ) : (
                    timeline.map((item) => (
                        <div key={item.id} className="relative pl-12">
                            <div className={`absolute left-0 top-1.5 w-10 h-10 bg-white border-2 rounded-full flex items-center justify-center z-10 
                                ${item.type === 'note' ? 'border-blue-500' : item.type === 'event' ? 'border-purple-500' : 'border-green-500'}`
                            }>
                                {item.type === 'note' && <MessageSquare size={16} className="text-blue-500" />}
                                {item.type === 'event' && <Calendar size={16} className="text-purple-500" />}
                                {item.type === 'quote' && <FileText size={16} className="text-green-500" />}
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-semibold text-gray-900 text-sm">
                                        {item.title} {item.user && <span className="text-gray-500 font-normal ml-2">por {getUserName(item.user)}</span>}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {format(item.date, 'd MMM yyyy, HH:mm', { locale: es })}
                                    </span>
                                </div>
                                <p className="text-gray-700 text-sm whitespace-pre-line">{item.description}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

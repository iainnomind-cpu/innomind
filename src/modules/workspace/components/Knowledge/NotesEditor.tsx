import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { FileText, Save, Clock, Search, Hash, Edit3 } from 'lucide-react';
import { WorkspaceNote } from '@/types';

export default function NotesEditor() {
    const { activeSpace, notes, createNote, updateNote } = useWorkspace();

    const [selectedNote, setSelectedNote] = useState<WorkspaceNote | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editBody, setEditBody] = useState('');
    const [editTitle, setEditTitle] = useState('');

    // Automatically select the first note if none is selected and notes are available
    useEffect(() => {
        if (!selectedNote && notes.length > 0) {
            setSelectedNote(notes[0]);
        }
    }, [notes, selectedNote]);

    const handleEdit = () => {
        if (!selectedNote) return;
        setEditTitle(selectedNote.title);
        setEditBody(selectedNote.contentJson || '');
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!selectedNote) return;

        await updateNote(selectedNote.id, editTitle, editBody);

        // Update local selected note state to reflect changes immediately
        setSelectedNote({ ...selectedNote, title: editTitle, contentJson: editBody, updatedAt: new Date() });
        setIsEditing(false);
    };

    const handleCreateNew = async () => {
        if (!activeSpace) {
            alert("Por favor selecciona un canal o espacio del panel lateral derecho primero para crear la nota ahí.");
            return;
        }

        const newNoteTitle = "Nueva Nota sin título";
        const newNote = await createNote(newNoteTitle, activeSpace.id, "");
        if (newNote) {
            setSelectedNote(newNote);
            setEditTitle(newNoteTitle);
            setEditBody("");
            setIsEditing(true);
        }
    };

    return (
        <div className="flex-1 flex bg-white overflow-hidden h-full">

            {/* Sidebar for Notes list */}
            <div className="w-80 border-r border-gray-200 bg-gray-50/30 flex flex-col shrink-0">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                        <FileText size={20} className="text-blue-600" /> Base de Conocimiento
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar en Notas..."
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-sm transition-all outline-none shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {notes.length === 0 && (
                        <div className="text-center p-4 text-sm text-gray-500">No hay notas en este espacio de trabajo aún.</div>
                    )}
                    {notes.map(note => (
                        <button
                            key={note.id}
                            onClick={() => { setSelectedNote(note); setIsEditing(false); }}
                            className={`w - full text - left p - 3 rounded - xl transition - all border ${selectedNote?.id === note.id ? 'bg-white border-gray-200 shadow-sm' : 'border-transparent hover:bg-gray-100'} `}
                        >
                            <h4 className={`font - semibold text - sm truncate ${selectedNote?.id === note.id ? 'text-gray-900' : 'text-gray-700'} `}>{note.title}</h4>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1"><Clock size={12} /> {note.updatedAt.toLocaleDateString()}</span>
                            </div>
                        </button>
                    ))}
                    <button onClick={handleCreateNew} className="w-full mt-4 border-2 border-dashed border-gray-200 rounded-xl p-4 text-center text-gray-500 text-sm font-medium hover:text-blue-600 hover:bg-blue-50 transition-colors">
                        + Nueva Nota
                    </button>
                </div>
            </div>

            {/* Note Editor Area */}
            {selectedNote ? (
                <div className="flex-1 flex flex-col">
                    <div className="h-14 border-b border-gray-200 px-6 flex items-center justify-between shrink-0 bg-white">
                        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-md">
                            <Hash size={14} /> General
                        </div>
                        <div className="flex items-center gap-2">
                            {!isEditing ? (
                                <button onClick={handleEdit} className="flex items-center gap-2 px-4 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium rounded-lg text-sm transition-colors shadow-sm">
                                    <Edit3 size={16} /> Editar Documento
                                </button>
                            ) : (
                                <button onClick={handleSave} className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 border border-transparent text-white font-medium rounded-lg text-sm transition-colors shadow-sm">
                                    <Save size={16} /> Guardar Cambios
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-16 py-12 custom-scrollbar bg-white">
                        <div className="max-w-3xl mx-auto">
                            {!isEditing ? (
                                <h1 className="text-4xl font-bold text-gray-900 mb-6">{selectedNote.title}</h1>
                            ) : (
                                <input
                                    type="text"
                                    className="w-full bg-transparent text-4xl font-bold text-gray-900 mb-6 outline-none border-b border-transparent focus:border-gray-200 pb-2 transition-colors placeholder:text-gray-300"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    placeholder="Título de la nota..."
                                />
                            )}

                            {isEditing ? (
                                <textarea
                                    className="w-full min-h-[500px] bg-transparent resize-none outline-none text-gray-700 leading-relaxed font-sans text-lg"
                                    value={editBody}
                                    onChange={(e) => setEditBody(e.target.value)}
                                    placeholder="Escribe el contenido de la nota aquí..."
                                />
                            ) : (
                                <div className="text-gray-700 leading-relaxed font-sans text-lg whitespace-pre-wrap">
                                    {selectedNote.contentJson || <span className="italic text-gray-400">Este documento está vacío.</span>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400 bg-white">
                    Selecciona una nota para leer o editar.
                </div>
            )}
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { WorkspaceTask, WorkspaceTaskChecklist, WorkspaceTaskComment } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { X, CheckSquare, MessageSquare, Paperclip, Clock, Trash2, Loader2, Plus } from 'lucide-react';

interface TaskSidebarProps {
    task: WorkspaceTask | null;
    onClose: () => void;
}

export default function TaskSidebar({ task, onClose }: TaskSidebarProps) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'DETAILS' | 'COMMENTS'>('DETAILS');
    const [checklists, setChecklists] = useState<WorkspaceTaskChecklist[]>([]);
    const [comments, setComments] = useState<WorkspaceTaskComment[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [newComment, setNewComment] = useState('');
    const [newChecklistTitle, setNewChecklistTitle] = useState('');
    const [isAddingChecklist, setIsAddingChecklist] = useState(false);

    useEffect(() => {
        if (!task) return;

        const fetchTaskDetails = async () => {
            setIsLoading(true);

            // Fetch Checklists
            const { data: checklistData } = await supabase
                .from('workspace_task_checklists')
                .select('*')
                .eq('task_id', task.id)
                .order('created_at', { ascending: true });

            if (checklistData) {
                setChecklists(checklistData.map((c: any) => ({
                    id: c.id,
                    taskId: c.task_id,
                    title: c.title,
                    isCompleted: c.is_completed,
                    createdAt: new Date(c.created_at),
                    updatedAt: new Date(c.updated_at)
                })));
            }

            // Fetch Comments
            const { data: commentsData } = await supabase
                .from('workspace_task_comments')
                .select('*, user:user_id(first_name, last_name, avatar_url)')
                .eq('task_id', task.id)
                .order('created_at', { ascending: true });

            if (commentsData) {
                setComments(commentsData.map((c: any) => ({
                    id: c.id,
                    workspace: c.workspace,
                    taskId: c.task_id,
                    userId: c.user_id,
                    content: c.content,
                    createdAt: new Date(c.created_at),
                    updatedAt: new Date(c.updated_at),
                    userExt: c.user
                })));
            }

            setIsLoading(false);
        };

        fetchTaskDetails();
    }, [task]);

    const handleAddComment = async () => {
        if (!task || !user || !newComment.trim()) return;

        const { data, error } = await supabase
            .from('workspace_task_comments')
            .insert([{
                workspace: task.workspace,
                task_id: task.id,
                user_id: user.id,
                content: newComment.trim()
            }]).select('*, user:user_id(first_name, last_name, avatar_url)').single();

        if (data && !error) {
            setComments(prev => [...prev, {
                id: data.id,
                workspace: data.workspace,
                taskId: data.task_id,
                userId: data.user_id,
                content: data.content,
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at),
                userExt: data.user
            }]);
            setNewComment('');
        }
    };

    const handleAddChecklist = async () => {
        if (!task || !newChecklistTitle.trim()) return;

        const { data, error } = await supabase
            .from('workspace_task_checklists')
            .insert([{
                task_id: task.id,
                title: newChecklistTitle.trim()
            }]).select().single();

        if (data && !error) {
            setChecklists(prev => [...prev, {
                id: data.id,
                taskId: data.task_id,
                title: data.title,
                isCompleted: data.is_completed,
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at)
            }]);
            setNewChecklistTitle('');
            setIsAddingChecklist(false);
        }
    };

    const handleToggleChecklist = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('workspace_task_checklists')
            .update({ is_completed: !currentStatus, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (!error) {
            setChecklists(prev => prev.map(c => c.id === id ? { ...c, isCompleted: !currentStatus } : c));
        }
    };

    const progress = checklists.length > 0
        ? Math.round((checklists.filter(c => c.isCompleted).length / checklists.length) * 100)
        : 0;

    if (!task) return null;

    return (
        <div className="w-96 border-l border-gray-200 bg-white shadow-xl flex flex-col z-20 h-full absolute right-0 top-0 transform transition-transform duration-300">
            {/* Header */}
            <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4 shrink-0 bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <CheckSquare size={18} className="text-gray-400" />
                    <span className="font-semibold text-gray-600 text-sm">Detalle de Tarea</span>
                </div>
                <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors">
                    <X size={18} />
                </button>
            </div>

            {/* Quick Actions / Title */}
            <div className="p-5 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 leading-tight mb-3">{task.title}</h2>
                <div className="flex gap-2">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md bg-gray-100`}>
                        {task.status}
                    </span>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md bg-blue-50 text-blue-700`}>
                        {task.priority}
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-2 shrink-0">
                <button
                    onClick={() => setActiveTab('DETAILS')}
                    className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'DETAILS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Subtareas
                </button>
                <button
                    onClick={() => setActiveTab('COMMENTS')}
                    className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'COMMENTS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <MessageSquare size={14} />
                    Comentarios
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-white p-5 custom-scrollbar">
                {activeTab === 'DETAILS' ? (
                    <div className="space-y-6">
                        {/* Description */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Descripción</h3>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 leading-relaxed whitespace-pre-wrap">
                                {task.description || 'Sin descripción adicional.'}
                            </p>
                        </div>

                        {/* Checklist */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold text-gray-900">Checklist</h3>
                                <span className="text-xs font-medium text-gray-400">{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3 overflow-hidden">
                                <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                            </div>

                            <div className="space-y-2">
                                {checklists.map(item => (
                                    <div key={item.id} onClick={() => handleToggleChecklist(item.id, item.isCompleted)} className="flex items-center gap-2 group cursor-pointer">
                                        <div className={`w-4 h-4 border rounded flex items-center justify-center shrink-0 transition-colors ${item.isCompleted ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white group-hover:border-blue-500'}`}>
                                            {item.isCompleted && <CheckSquare size={12} />}
                                        </div>
                                        <span className={`text-sm ${item.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{item.title}</span>
                                    </div>
                                ))}

                                {isAddingChecklist ? (
                                    <div className="flex items-center gap-2 mt-2">
                                        <input
                                            autoFocus
                                            type="text"
                                            value={newChecklistTitle}
                                            onChange={(e) => setNewChecklistTitle(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddChecklist()}
                                            placeholder="Nuevo ítem..."
                                            className="flex-1 text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                                        />
                                        <button onClick={handleAddChecklist} className="text-blue-600 p-1 hover:bg-blue-50 rounded"><Plus size={16} /></button>
                                        <button onClick={() => setIsAddingChecklist(false)} className="text-gray-400 p-1 hover:bg-gray-50 rounded"><X size={16} /></button>
                                    </div>
                                ) : (
                                    <button onClick={() => setIsAddingChecklist(true)} className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2">+ Añadir ítem</button>
                                )}
                            </div>
                        </div>

                        {/* Metadata block */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3 mt-8">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 flex items-center gap-1.5"><Clock size={14} /> Creada</span>
                                <span className="font-medium text-gray-900">{task.createdAt.toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 flex items-center gap-1.5"><Clock size={14} /> Vencimiento</span>
                                <span className="font-medium text-gray-900">{task.dueDate ? task.dueDate.toLocaleDateString() : 'Ninguno'}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col h-full justify-between">
                        <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {isLoading ? (
                                <div className="flex justify-center p-4">
                                    <Loader2 size={24} className="text-gray-300 animate-spin" />
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-center text-sm text-gray-400 bg-gray-50 p-4 rounded-lg border border-gray-100 border-dashed">
                                    No hay comentarios todavía. Inicia la conversación interna de esta tarea.
                                </div>
                            ) : (
                                comments.map(c => (
                                    <div key={c.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-semibold text-gray-900">{c.userExt?.first_name} {c.userExt?.last_name}</span>
                                            <span className="text-[10px] text-gray-400">{c.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-sm text-gray-700">{c.content}</p>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="mt-4 flex gap-2 pt-2 border-t border-gray-100">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                placeholder="Añadir comentario..."
                                className="flex-1 border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button onClick={handleAddComment} disabled={!newComment.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2 rounded-lg transition-colors">
                                <MessageSquare size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between shrink-0">
                <button className="text-red-500 hover:bg-red-50 p-2 rounded-md transition-colors tooltip" title="Eliminar tarea">
                    <Trash2 size={18} />
                </button>
                <button className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm">
                    Ver Completa
                </button>
            </div>
        </div>
    );
}

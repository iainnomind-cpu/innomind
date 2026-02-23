import React, { useState } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { WorkspaceTask } from '@/types';
import { CheckSquare, Calendar, AlertCircle, Clock, Trash2, Edit2, Play, CheckCircle2, AlertTriangle, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Status colors mapping
const statusColors = {
    'PENDIENTE': 'bg-gray-100 text-gray-700 border-gray-200',
    'EN_PROGRESO': 'bg-blue-50 text-blue-700 border-blue-200',
    'BLOQUEADA': 'bg-red-50 text-red-700 border-red-200',
    'COMPLETADA': 'bg-green-50 text-green-700 border-green-200'
};

const priorityColors = {
    'BAJA': 'bg-gray-100 text-gray-600',
    'MEDIA': 'bg-blue-100 text-blue-700',
    'ALTA': 'bg-orange-100 text-orange-700',
    'URGENTE': 'bg-red-100 text-red-700'
};

export default function TaskBoard() {
    const { tasks, isLoading, refreshWorkspace } = useWorkspace();
    const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST'>('KANBAN');

    const updateTaskStatus = async (taskId: string, newStatus: string) => {
        try {
            await supabase
                .from('workspace_tasks')
                .update({
                    status: newStatus,
                    completed_at: newStatus === 'COMPLETADA' ? new Date().toISOString() : null
                })
                .eq('id', taskId);
            refreshWorkspace();
        } catch (error) {
            console.error('Error updating task status', error);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-gray-400">Cargando tareas...</div>;
    }

    const columns = [
        { id: 'PENDIENTE', title: 'Pendientes', icon: Clock },
        { id: 'EN_PROGRESO', title: 'En Progreso', icon: Play },
        { id: 'BLOQUEADA', title: 'Bloqueadas', icon: AlertTriangle },
        { id: 'COMPLETADA', title: 'Completadas', icon: CheckCircle2 }
    ];

    const TaskCard = ({ task }: { task: WorkspaceTask }) => {
        return (
            <div className={`p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow group relative mb-3 ${statusColors[task.status]}`}>

                <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
                        {task.priority}
                    </span>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        {task.status !== 'COMPLETADA' && (
                            <button onClick={() => updateTaskStatus(task.id, 'COMPLETADA')} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Completar">
                                <CheckCircle2 size={14} />
                            </button>
                        )}
                        {task.status !== 'BLOQUEADA' && (
                            <button onClick={() => updateTaskStatus(task.id, 'BLOQUEADA')} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Marcar Bloqueada">
                                <AlertTriangle size={14} />
                            </button>
                        )}
                        {task.status === 'PENDIENTE' && (
                            <button onClick={() => updateTaskStatus(task.id, 'EN_PROGRESO')} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Iniciar">
                                <Play size={14} />
                            </button>
                        )}
                    </div>
                </div>

                <h4 className="font-semibold text-gray-900 text-sm mb-1 leading-tight">{task.title}</h4>
                {task.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{task.description}</p>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        {task.dueDate && (
                            <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                        )}
                        {task.createdFromMessageId && (
                            <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-1.5 rounded" title="Creado desde Chat">
                                <CheckSquare size={12} />
                                Chat
                            </span>
                        )}
                    </div>
                    {task.assignedTo && (
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center border border-white" title="Asignado">
                            <User size={12} className="text-gray-500" />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-50/30 overflow-hidden">
            <div className="px-8 py-6 flex items-center justify-between shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Tareas Globales</h2>
                    <p className="text-gray-500 mt-1">Gestiona y da seguimiento a los items de acción de todo el equipo.</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setViewMode('KANBAN')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'KANBAN' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Kanban
                    </button>
                    <button
                        onClick={() => setViewMode('LIST')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'LIST' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Lista
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden px-8 pb-8">
                {viewMode === 'KANBAN' ? (
                    <div className="flex gap-6 h-full min-w-max">
                        {columns.map(col => {
                            const columnTasks = tasks.filter(t => t.status === col.id);
                            const Icon = col.icon;
                            return (
                                <div key={col.id} className="w-80 flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-2 font-bold text-gray-900">
                                            <Icon size={18} className="text-gray-400" />
                                            {col.title}
                                            <span className="bg-gray-100 rounded-lg px-2.5 py-1 text-xs text-gray-600 ml-1">{columnTasks.length}</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                                        {columnTasks.map(task => (
                                            <TaskCard key={task.id} task={task} />
                                        ))}
                                        {columnTasks.length === 0 && (
                                            <div className="h-32 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center text-sm text-gray-400 gap-2">
                                                <CheckSquare size={24} className="text-gray-200" />
                                                Sin tareas
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="max-w-6xl w-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-4">Tarea</th>
                                        <th className="px-6 py-4">Estado</th>
                                        <th className="px-6 py-4">Prioridad</th>
                                        <th className="px-6 py-4">Vencimiento</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tasks.map(task => (
                                        <tr key={task.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{task.title}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[task.status]}`}>
                                                    {task.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${priorityColors[task.priority]}`}>
                                                    {task.priority}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                    {tasks.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No hay tareas creadas.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

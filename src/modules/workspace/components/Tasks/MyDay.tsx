import React, { useState } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Calendar, CheckCircle2, Clock, AlertCircle, Plus, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function MyDay() {
    const { tasks, isLoading, createTask } = useWorkspace();
    const { user } = useAuth();
    const [isCreating, setIsCreating] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDesc, setNewTaskDesc] = useState('');

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        
        // Asignar fecha de vencimiento a hoy por defecto ya que estamos en "Mi Día"
        const today = new Date();
        await createTask(newTaskTitle, newTaskDesc, 'MEDIA', today);
        setNewTaskTitle('');
        setNewTaskDesc('');
        setIsCreating(false);
    };

    if (isLoading) {
        return <div className="p-8 text-gray-400">Cargando Mi Día...</div>;
    }

    // Filter tasks assigned to current user that are not completed
    const myTasks = tasks.filter(t => t.assignedTo === user?.id && t.status !== 'COMPLETADA');

    // Sort logic: Overdue first, then by Due Date ascending
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sortedTasks = [...myTasks].sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.getTime() - b.dueDate.getTime();
    });

    const overdueTasks = sortedTasks.filter(t => t.dueDate && t.dueDate < today);
    const todayTasks = sortedTasks.filter(t => t.dueDate && t.dueDate.toDateString() === today.toDateString());
    const upcomingTasks = sortedTasks.filter(t => !t.dueDate || t.dueDate > today);

    const TaskRow = ({ task, isOverdue = false }: { task: any, isOverdue?: boolean }) => (
        <div className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm hover:border-blue-100 transition-all group cursor-pointer">
            <button className="text-gray-300 hover:text-green-500 transition-colors">
                <CheckCircle2 size={24} />
            </button>
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">{task.title}</h4>
                <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className={`px-2 py-0.5 rounded-full font-bold ${task.priority === 'URGENTE' ? 'bg-red-100 text-red-700' :
                            task.priority === 'ALTA' ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-600'
                        }`}>
                        {task.priority}
                    </span>
                    {task.spaceId && <span className="text-gray-500">#{task.spaceId.substring(0, 8)}</span>}
                </div>
            </div>
            <div className={`text-sm font-medium flex items-center gap-1 shrink-0 ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                {isOverdue ? <AlertCircle size={16} /> : <Calendar size={16} />}
                {task.dueDate ? task.dueDate.toLocaleDateString() : 'Sin fecha'}
            </div>
        </div>
    );

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50 p-8 custom-scrollbar">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            Mi Día
                            <span className="text-sm font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">{myTasks.length}</span>
                        </h1>
                        <p className="text-gray-500 mt-1">Concéntrate en lo que importa hoy.</p>
                    </div>
                    <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg text-sm transition-colors hover:bg-blue-700 shadow-sm">
                        <Plus size={16} /> Agregar Tarea
                    </button>
                </div>

                {isCreating && (
                    <form onSubmit={handleCreateTask} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                            <h3 className="font-bold text-gray-900">Agregar Tarea para Hoy</h3>
                            <button type="button" onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <input
                            type="text"
                            placeholder="¿Qué necesitas hacer hoy?"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" disabled={!newTaskTitle.trim()} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                Guardar
                            </button>
                        </div>
                    </form>
                )}

                {/* Overdue */}
                {overdueTasks.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <AlertCircle size={16} /> Vencidas
                        </h2>
                        <div className="space-y-2">
                            {overdueTasks.map(t => <TaskRow key={t.id} task={t} isOverdue={true} />)}
                        </div>
                    </section>
                )}

                {/* Today */}
                <section>
                    <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Clock size={16} /> Hoy
                    </h2>
                    {todayTasks.length > 0 ? (
                        <div className="space-y-2">
                            {todayTasks.map(t => <TaskRow key={t.id} task={t} />)}
                        </div>
                    ) : (
                        <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center text-gray-500 bg-white">
                            No tienes tareas programadas para hoy. ¡Aprovecha el día!
                        </div>
                    )}
                </section>

                {/* Upcoming */}
                {upcomingTasks.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Calendar size={16} /> Próximas & Sin Fecha
                        </h2>
                        <div className="space-y-2">
                            {upcomingTasks.map(t => <TaskRow key={t.id} task={t} />)}
                        </div>
                    </section>
                )}

            </div>
        </div>
    );
}

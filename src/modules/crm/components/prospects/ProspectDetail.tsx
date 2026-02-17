import React, { useState } from 'react';
import {
    ArrowLeft,
    MessageSquare,
    Calendar,
    User,
    FileText,
    Plus,
    Clock,
    Phone,
    Mail,
    Edit2,
    CheckSquare
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { useUsers } from '@/context/UserContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ProspectStatus } from '@/types';

import { useNavigate } from 'react-router-dom';

export default function ProspectDetail() {
    const navigate = useNavigate();
    const { selectedProspect, addFollowUp, updateProspect } = useCRM();
    const { users, currentUser } = useUsers();

    const [newNote, setNewNote] = useState('');
    const [editingStatus, setEditingStatus] = useState(false);

    // Task State
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDate, setNewTaskDate] = useState('');

    if (!selectedProspect) return null;

    const getUserName = (userId: string) => {
        const user = users.find(u => u.id === userId);
        return user ? user.name : 'Desconocido';
    };

    const getStatusColor = (status: ProspectStatus) => {
        switch (status) {
            case 'Nuevo': return 'bg-blue-100 text-blue-800';
            case 'Contactado': return 'bg-yellow-100 text-yellow-800';
            case 'En seguimiento': return 'bg-orange-100 text-orange-800';
            case 'Cotizado': return 'bg-purple-100 text-purple-800';
            case 'Venta cerrada': return 'bg-green-100 text-green-800';
            case 'Perdido': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleAddFollowUp = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim() || !currentUser) return;

        addFollowUp(selectedProspect.id, newNote, currentUser.id);
        setNewNote('');
    };

    const handleStatusChange = (newStatus: ProspectStatus) => {
        updateProspect(selectedProspect.id, { estado: newStatus });
        setEditingStatus(false);
    };

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim() || !newTaskDate) return;

        const newTask = {
            id: Math.random().toString(36).substr(2, 9),
            titulo: newTaskTitle,
            fechaVencimiento: new Date(newTaskDate),
            completada: false
        };

        updateProspect(selectedProspect.id, {
            tareas: [...(selectedProspect.tareas || []), newTask]
        });

        setNewTaskTitle('');
        setNewTaskDate('');
    };

    const openWhatsApp = () => {
        window.open(`https://wa.me/${selectedProspect.telefono.replace(/\+/g, '')}`, '_blank');
    };

    // Calculate task stats
    const totalTasks = selectedProspect.tareas?.length || 0;
    const pendingTasks = selectedProspect.tareas?.filter(t => !t.completada).length || 0;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-8">
            <button
                onClick={() => navigate('/crm/prospectos')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Volver a prospectos</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Main Info Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{selectedProspect.nombre}</h1>
                                <p className="text-gray-500 mt-1">{selectedProspect.servicioInteres}</p>

                                <div className="mt-3 space-y-1">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Phone size={16} />
                                        <span className="text-sm">{selectedProspect.telefono}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Mail size={16} />
                                        <span className="text-sm">{selectedProspect.correo}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                {editingStatus ? (
                                    <select
                                        autoFocus
                                        value={selectedProspect.estado}
                                        onChange={(e) => handleStatusChange(e.target.value as ProspectStatus)}
                                        onBlur={() => setEditingStatus(false)}
                                        className="px-3 py-1 rounded-full text-sm font-semibold border border-gray-300 focus:ring-2 focus:ring-blue-500"
                                    >
                                        {['Nuevo', 'Contactado', 'En seguimiento', 'Cotizado', 'Venta cerrada', 'Perdido'].map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <button
                                        onClick={() => setEditingStatus(true)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-transform active:scale-95 ${getStatusColor(selectedProspect.estado)} flex items-center gap-2`}
                                    >
                                        {selectedProspect.estado}
                                        <Edit2 size={14} className="opacity-60" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="flex items-center gap-3 text-gray-600">
                                <span className="p-2 bg-gray-100 rounded-lg">
                                    <User size={18} />
                                </span>
                                <div>
                                    <p className="text-xs text-gray-400">Responsable</p>
                                    <p className="text-sm font-medium">{getUserName(selectedProspect.responsable)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-gray-600">
                                <span className="p-2 bg-gray-100 rounded-lg">
                                    <Calendar size={18} />
                                </span>
                                <div>
                                    <p className="text-xs text-gray-400">Fecha de contacto</p>
                                    <p className="text-sm font-medium">
                                        {format(new Date(selectedProspect.fechaContacto), 'dd MMM yyyy', { locale: es })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-gray-100">
                            <button
                                onClick={openWhatsApp}
                                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                <MessageSquare size={18} />
                                WhatsApp
                            </button>
                        </div>
                    </div>

                    {/* Internal Notes */}
                    {selectedProspect.notasInternas && (
                        <div className="bg-yellow-50 rounded-xl border border-yellow-100 p-6">
                            <h2 className="text-sm font-bold text-yellow-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                                <FileText size={16} />
                                Notas Internas
                            </h2>
                            <p className="text-yellow-900 bg-white/50 p-3 rounded-lg text-sm">
                                {selectedProspect.notasInternas}
                            </p>
                        </div>
                    )}

                    {/* Tasks Card (Moved Here) */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <CheckSquare size={20} className="text-blue-500" />
                            Tareas
                        </h3>

                        <div className="space-y-4 mb-4 max-h-60 overflow-y-auto custom-scrollbar">
                            {(!selectedProspect.tareas || selectedProspect.tareas.length === 0) ? (
                                <div className="text-center py-4 text-gray-400 text-sm italic">
                                    Sin tareas registradas
                                </div>
                            ) : (
                                selectedProspect.tareas.map(tarea => (
                                    <div key={tarea.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-start gap-3">
                                        <div className={`mt-1.5 w-2 h-2 rounded-full ${tarea.completada ? 'bg-green-500' : 'bg-orange-500'}`} />
                                        <div>
                                            <p className={`text-sm font-medium ${tarea.completada ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                                {tarea.titulo}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {format(new Date(tarea.fechaVencimiento), 'dd MMM yyyy', { locale: es })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Add Task Form */}
                        <form onSubmit={handleAddTask} className="border-t border-gray-100 pt-4 space-y-3">
                            <input
                                placeholder="Título de la tarea"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    value={newTaskDate}
                                    onChange={(e) => setNewTaskDate(e.target.value)}
                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!newTaskTitle || !newTaskDate}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Agregar
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Clock size={20} className="text-blue-500" />
                            Seguimiento
                        </h2>

                        <form onSubmit={handleAddFollowUp} className="mb-8">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="Agregar nota de seguimiento..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    type="submit"
                                    disabled={!newNote.trim()}
                                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Agregar
                                </button>
                            </div>
                        </form>

                        <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[19px] before:w-0.5 before:bg-gray-200">
                            {(!selectedProspect.seguimientos || selectedProspect.seguimientos.length === 0) ? (
                                <div className="text-center py-8 text-gray-500">
                                    No hay seguimientos registrados
                                </div>
                            ) : (
                                selectedProspect.seguimientos
                                    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                                    .map((seguimiento) => (
                                        <div key={seguimiento.id} className="relative pl-12">
                                            <div className="absolute left-0 top-1.5 w-10 h-10 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center z-10">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-semibold text-gray-900 text-sm">
                                                        {getUserName(seguimiento.usuario)}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {format(new Date(seguimiento.fecha), 'd MMM yyyy, HH:mm', { locale: es })}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 text-sm">{seguimiento.nota}</p>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Summary Card (Modified) */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-4">Resumen</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                <span className="text-sm text-gray-600">Plataforma</span>
                                <span className="text-base font-semibold text-gray-900 flex items-center gap-1">
                                    {selectedProspect.plataforma === 'WhatsApp' ? '💬' : selectedProspect.plataforma === 'Facebook' ? '📘' : '📷'}
                                    {selectedProspect.plataforma}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                <span className="text-sm text-gray-600">Seguimientos</span>
                                <span className="text-base font-semibold text-gray-900">{selectedProspect.seguimientos?.length || 0}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                <span className="text-sm text-gray-600">Tareas</span>
                                <span className="text-base font-semibold text-gray-900">
                                    {pendingTasks} pendientes / {totalTasks} total
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                <span className="text-sm text-gray-600">Cotizaciones</span>
                                <span className="text-base font-semibold text-gray-900">{selectedProspect.cotizaciones?.length || 0}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 last:border-0">
                                <span className="text-sm text-gray-600">Último contacto</span>
                                <span className="text-base font-semibold text-gray-900">
                                    {selectedProspect.ultimoSeguimiento
                                        ? format(new Date(selectedProspect.ultimoSeguimiento), 'dd MMM', { locale: es })
                                        : 'Nunca'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quotes Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-900">Cotizaciones</h3>
                            <button className="p-1 hover:bg-gray-100 rounded-full text-blue-600 transition-colors">
                                <Plus size={18} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {(!selectedProspect.cotizaciones || selectedProspect.cotizaciones.length === 0) ? (
                                <div className="text-center py-6 text-gray-400 text-sm italic">
                                    No hay cotizaciones
                                </div>
                            ) : (
                                selectedProspect.cotizaciones.map(cotizacion => (
                                    <div key={cotizacion.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-gray-900">${cotizacion.total.toLocaleString()}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cotizacion.estado === 'Aceptada' ? 'bg-green-100 text-green-800' :
                                                cotizacion.estado === 'Rechazada' ? 'bg-red-100 text-red-800' :
                                                    cotizacion.estado === 'Enviada' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {cotizacion.estado}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {format(new Date(cotizacion.fecha), 'dd MMM yyyy', { locale: es })}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

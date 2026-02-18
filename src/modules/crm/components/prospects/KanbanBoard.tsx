import React, { useState } from 'react';
import { ProspectStatus, Prospect } from '@/types';
import { useCRM } from '@/context/CRMContext';
import { format } from 'date-fns';
import { Phone, Mail, Building2, Calendar, User, Eye, MessageCircle } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

interface KanbanBoardProps {
    hideHeader?: boolean;
}

export default function KanbanBoard({ hideHeader = false }: KanbanBoardProps) {
    const navigate = useNavigate();
    const { prospects, updateProspect, selectProspect } = useCRM();
    const [draggedProspect, setDraggedProspect] = useState<Prospect | null>(null);

    const statuses: ProspectStatus[] = [
        'Nuevo',
        'Contactado',
        'En seguimiento',
        'Cotizado',
        'Venta cerrada',
        'Perdido'
    ];

    const getStatusColor = (status: ProspectStatus) => {
        const colors = {
            'Nuevo': 'bg-blue-600',
            'Contactado': 'bg-yellow-500',
            'En seguimiento': 'bg-orange-500',
            'Cotizado': 'bg-purple-600',
            'Venta cerrada': 'bg-green-600',
            'Perdido': 'bg-red-600'
        };
        return colors[status];
    };

    const getStatusBgColor = (status: ProspectStatus) => {
        const colors = {
            'Nuevo': 'bg-blue-50',
            'Contactado': 'bg-yellow-50',
            'En seguimiento': 'bg-orange-50',
            'Cotizado': 'bg-purple-50',
            'Venta cerrada': 'bg-green-50',
            'Perdido': 'bg-red-50'
        };
        return colors[status];
    };

    const getProspectsForStatus = (status: ProspectStatus) => {
        return prospects.filter(p => p.estado === status);
    };

    const handleDragStart = (e: React.DragEvent, prospect: Prospect) => {
        setDraggedProspect(prospect);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, newStatus: ProspectStatus) => {
        e.preventDefault();
        if (draggedProspect && draggedProspect.estado !== newStatus) {
            updateProspect(draggedProspect.id, { estado: newStatus });
        }
        setDraggedProspect(null);
    };

    const handleDragEnd = () => {
        setDraggedProspect(null);
    };

    const openWhatsApp = (phone: string) => {
        const cleanPhone = phone.replace(/[^\d+]/g, '');
        window.open(`https://wa.me/${cleanPhone}`, '_blank');
    };

    const getPlatformEmoji = (platform: string) => {
        switch (platform) {
            case 'WhatsApp': return '💬';
            case 'Instagram': return '📷';
            case 'Facebook': return '📘';
            default: return '🌐';
        }
    };

    return (
        <div className="h-full flex flex-col p-4 md:p-6 overflow-y-auto custom-scrollbar">
            {/* Header Section */}
            {!hideHeader && (
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-gray-900 mb-1">Embudo de Ventas</h2>
                    <p className="text-gray-500 text-lg">Arrastra prospectos para cambiar su estado</p>
                </div>
            )}

            {/* Kanban Board Grid - Responsive */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {statuses.map((status) => {
                    const statusProspects = getProspectsForStatus(status);

                    return (
                        <div
                            key={status}
                            className={`flex flex-col ${getStatusBgColor(status)} rounded-xl shadow-sm border border-gray-100`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, status)}
                        >
                            {/* Column Header */}
                            <div className={`${getStatusColor(status)} px-4 py-3 rounded-t-xl flex items-center justify-between`}>
                                <h3 className="font-bold text-white text-base">{status}</h3>
                                <div className="bg-white bg-opacity-20 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                                    {statusProspects.length}
                                </div>
                            </div>

                            {/* Column Content */}
                            <div className="p-3 space-y-3">
                                {statusProspects.map((prospect) => (
                                    <div
                                        key={prospect.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, prospect)}
                                        onDragEnd={handleDragEnd}
                                        className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-move hover:shadow-md transition-all duration-200 group w-full overflow-hidden ${draggedProspect?.id === prospect.id ? 'opacity-50 scale-95' : ''
                                            }`}
                                    >
                                        {/* Card Header: Name & Platform */}
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-gray-900 text-base line-clamp-1" title={prospect.nombre}>
                                                {prospect.nombre}
                                            </h4>
                                            <span className="text-sm" title={prospect.plataforma}>
                                                {getPlatformEmoji(prospect.plataforma)}
                                            </span>
                                        </div>

                                        {/* Line 2: Company/Type */}
                                        <div className="mb-3">
                                            <p className="text-sm text-gray-500 font-medium truncate">
                                                {prospect.empresa || prospect.servicioInteres}
                                            </p>
                                        </div>

                                        {/* Detailed Info Section */}
                                        <div className="space-y-2 mb-4">
                                            {/* Cargo & Empresa (Combined if both exist) */}
                                            {(prospect.cargo || prospect.empresa) && (
                                                <div className="flex items-center text-xs text-gray-600">
                                                    <Building2 className="w-3.5 h-3.5 mr-2 text-gray-400 flex-shrink-0" />
                                                    <span className="truncate">
                                                        {prospect.cargo && prospect.empresa
                                                            ? `${prospect.cargo} en ${prospect.empresa}`
                                                            : (prospect.cargo || prospect.empresa)}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Phone */}
                                            <div className="flex items-center text-xs text-gray-600">
                                                <Phone className="w-3.5 h-3.5 mr-2 text-gray-400 flex-shrink-0" />
                                                <span className="truncate">{prospect.telefono}</span>
                                            </div>

                                            {/* Email */}
                                            {prospect.correo && (
                                                <div className="flex items-center text-xs text-gray-600">
                                                    <Mail className="w-3.5 h-3.5 mr-2 text-gray-400 flex-shrink-0" />
                                                    <span className="truncate">{prospect.correo}</span>
                                                </div>
                                            )}

                                            {/* User & Date (Metadata) */}
                                            <div className="flex items-center justify-between pt-1">
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <User className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                                                    <span>{prospect.responsable.split(' ')[0]}</span>
                                                </div>
                                                <div className="flex items-center text-xs text-gray-400">
                                                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                                    <span>{format(new Date(prospect.fechaContacto), 'dd MMM')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="mt-4 flex flex-col w-full gap-2">
                                            <button
                                                onClick={() => {
                                                    selectProspect(prospect);
                                                    navigate('/crm/prospectos/detalle');
                                                }}
                                                className="w-full flex items-center justify-center gap-2 h-9 px-2 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-sm font-medium transition-all duration-200 group"
                                                title="Ver detalles"
                                            >
                                                <Eye size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
                                                <span className="truncate">Ver detalles</span>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openWhatsApp(prospect.telefono);
                                                }}
                                                className="w-full flex items-center justify-center gap-2 h-9 px-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                                                title="WhatsApp"
                                            >
                                                <MessageCircle size={16} className="shrink-0" />
                                                <span className="truncate">WhatsApp</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

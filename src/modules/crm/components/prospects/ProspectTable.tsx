import { useState, useEffect } from 'react';
import { Search, Plus, Eye, MessageSquare, Trash2, Building2, Phone, Calendar, Mail } from 'lucide-react';
import { ProspectStatus, Platform } from '@/types';
import { useCRM } from '@/context/CRMContext';
import { useUsers } from '@/context/UserContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ProspectForm from './ProspectForm';
import { useNavigate } from 'react-router-dom';

interface ProspectTableProps {
    navigationParams?: {
        prospectId?: string;
        showDetail?: boolean;
        highlightFollowup?: boolean;
    };
}

export default function ProspectTable({ navigationParams }: ProspectTableProps) {
    const navigate = useNavigate();
    const { prospects, deleteProspect, selectProspect } = useCRM();
    const { users } = useUsers();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ProspectStatus | 'all'>('all');
    const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
    const [userFilter, setUserFilter] = useState<string | 'all'>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [highlightedProspectId, setHighlightedProspectId] = useState<string | null>(null);

    useEffect(() => {
        if (navigationParams?.prospectId && navigationParams?.showDetail) {
            const prospect = prospects.find(p => p.id === navigationParams.prospectId);
            if (prospect) {
                selectProspect(prospect);
                navigate('/crm/prospectos/detalle');
            }
        }

        if (navigationParams?.highlightFollowup && navigationParams?.prospectId) {
            setHighlightedProspectId(navigationParams.prospectId);
            const timer = setTimeout(() => {
                setHighlightedProspectId(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [navigationParams, prospects, selectProspect, navigate]);

    const getUserName = (userId: string) => {
        const user = users.find(u => u.id === userId);
        return user ? user.name : 'Desconocido';
    };

    const handleProspectCreated = () => {
        setShowAddModal(false);
        // Opcional: agregar notificación de éxito
        console.log('Prospecto creado exitosamente');
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

    const getPlatformIcon = (platform: Platform) => {
        switch (platform) {
            case 'WhatsApp': return '💬';
            case 'Instagram': return '📷';
            case 'Facebook': return '📘';
            default: return '🌐';
        }
    };

    const openWhatsApp = (phone: string) => {
        window.open(`https://wa.me/${phone.replace(/\+/g, '')}`, '_blank');
    };

    const filteredProspects = prospects.filter(prospect => {
        const matchesSearch =
            prospect.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prospect.telefono.includes(searchTerm) ||
            prospect.correo.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || prospect.estado === statusFilter;
        const matchesPlatform = platformFilter === 'all' || prospect.plataforma === platformFilter;
        const matchesUser = userFilter === 'all' || prospect.responsable === userFilter;

        return matchesSearch && matchesStatus && matchesPlatform && matchesUser;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Prospectos</h1>
                    <p className="text-gray-500 mt-1">Gestiona tus oportunidades de venta</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto justify-center"
                >
                    <Plus size={20} />
                    Agregar Prospecto
                </button>
            </div>
            {showAddModal && (
                <ProspectForm
                    onClose={() => setShowAddModal(false)}
                    onSuccess={handleProspectCreated}
                />
            )}

            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, teléfono o correo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as ProspectStatus | 'all')}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="Nuevo">Nuevo</option>
                            <option value="Contactado">Contactado</option>
                            <option value="En seguimiento">En seguimiento</option>
                            <option value="Cotizado">Cotizado</option>
                            <option value="Venta cerrada">Venta cerrada</option>
                            <option value="Perdido">Perdido</option>
                        </select>

                        <select
                            value={platformFilter}
                            onChange={(e) => setPlatformFilter(e.target.value as Platform | 'all')}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                            <option value="all">Todas las plataformas</option>
                            <option value="WhatsApp">WhatsApp</option>
                            <option value="Instagram">Instagram</option>
                            <option value="Facebook">Facebook</option>
                        </select>

                        <select
                            value={userFilter}
                            onChange={(e) => setUserFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                            <option value="all">Todos los usuarios</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                    <span>{filteredProspects.length} de {prospects.length} prospectos</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Prospecto</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contacto</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Plataforma</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Último Seguimiento</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredProspects.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No se encontraron prospectos que coincidan con los filtros.
                                    </td>
                                </tr>
                            ) : (
                                filteredProspects.map((prospect) => (
                                    <tr
                                        key={prospect.id}
                                        onClick={() => {
                                            selectProspect(prospect);
                                            navigate('/crm/prospectos/detalle');
                                        }}
                                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${highlightedProspectId === prospect.id ? 'bg-orange-50' : ''}`}
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{prospect.nombre}</p>
                                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                    <Building2 size={14} />
                                                    {prospect.servicioInteres}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-gray-900 font-semibold">
                                                    <Phone size={14} className="text-gray-500" />
                                                    <span>{prospect.telefono}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Mail size={14} />
                                                    <span>{prospect.correo}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">
                                                    {getPlatformIcon(prospect.plataforma)}
                                                </span>
                                                <span className="text-sm font-medium text-gray-700">
                                                    {prospect.plataforma}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(prospect.estado)}`}>
                                                {prospect.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600">
                                                {prospect.ultimoSeguimiento ? (
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={14} />
                                                        {format(new Date(prospect.ultimoSeguimiento), 'dd MMM yyyy', { locale: es })}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic">Sin seguimiento</span>
                                                )}
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Resp: {getUserName(prospect.responsable)}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        selectProspect(prospect);
                                                        navigate('/crm/prospectos/detalle');
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900 mx-1"
                                                    title="Ver detalles"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openWhatsApp(prospect.telefono);
                                                    }}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="WhatsApp"
                                                >
                                                    <MessageSquare size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteProspect(prospect.id);
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

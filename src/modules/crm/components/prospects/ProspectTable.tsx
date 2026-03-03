import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Eye, MessageSquare, Trash2, Building2, Phone, Calendar, Mail, Users, TrendingUp, DollarSign, UserPlus, Edit2 } from 'lucide-react';
import { ProspectStatus, Platform } from '@/types';
import { useCRM } from '@/context/CRMContext';
import { useUsers } from '@/context/UserContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ProspectForm from './ProspectForm';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface ProspectTableProps {
    navigationParams?: {
        prospectId?: string;
        showDetail?: boolean;
        highlightFollowup?: boolean;
    };
}

type TabFilter = 'todos' | 'prospectos' | 'clientes';

const PRE_SALE_STATES: ProspectStatus[] = ['Nuevo', 'Contactado', 'En seguimiento', 'Cotizado'];
const POST_SALE_STATES: ProspectStatus[] = ['Venta cerrada', 'Cliente Activo', 'Cliente Inactivo'];

export default function ProspectTable({ navigationParams }: ProspectTableProps) {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { prospects, deleteProspect, selectProspect } = useCRM();
    const { users } = useUsers();

    const initialTab = (searchParams.get('tab') as TabFilter) || 'todos';
    const [activeTab, setActiveTab] = useState<TabFilter>(initialTab);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ProspectStatus | 'all'>('all');
    const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
    const [userFilter, setUserFilter] = useState<string | 'all'>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingProspect, setEditingProspect] = useState<any>(null);
    const [highlightedProspectId, setHighlightedProspectId] = useState<string | null>(null);

    // Sync tab from URL
    useEffect(() => {
        const tabParam = searchParams.get('tab') as TabFilter;
        if (tabParam === 'clientes') {
            setActiveTab('clientes');
        } else if (tabParam === 'prospectos') {
            setActiveTab('prospectos');
        }
    }, [searchParams]);

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
    };

    const getStatusColor = (status: ProspectStatus) => {
        switch (status) {
            case 'Nuevo': return 'bg-blue-100 text-blue-800';
            case 'Contactado': return 'bg-yellow-100 text-yellow-800';
            case 'En seguimiento': return 'bg-orange-100 text-orange-800';
            case 'Cotizado': return 'bg-purple-100 text-purple-800';
            case 'Venta cerrada': return 'bg-emerald-100 text-emerald-800';
            case 'Cliente Activo': return 'bg-green-100 text-green-800';
            case 'Cliente Inactivo': return 'bg-gray-100 text-gray-600';
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

    const handleTabChange = (tab: TabFilter) => {
        setActiveTab(tab);
        setStatusFilter('all');
        if (tab === 'clientes') {
            setSearchParams({ tab: 'clientes' });
        } else if (tab === 'prospectos') {
            setSearchParams({ tab: 'prospectos' });
        } else {
            setSearchParams({});
        }
    };

    // KPI Calculations
    const kpis = useMemo(() => {
        const totalContactos = prospects.length;
        const clientesActivos = prospects.filter(p => p.estado === 'Cliente Activo' || p.estado === 'Venta cerrada').length;
        const valorTotal = prospects.reduce((sum, p) => sum + (p.valorEstimado || 0), 0);
        const haceUnMes = new Date();
        haceUnMes.setMonth(haceUnMes.getMonth() - 1);
        const nuevosMes = prospects.filter(p => p.fechaContacto && new Date(p.fechaContacto) > haceUnMes).length;
        return { totalContactos, clientesActivos, valorTotal, nuevosMes };
    }, [prospects]);

    // Status options based on active tab
    const availableStatuses = useMemo(() => {
        if (activeTab === 'prospectos') return PRE_SALE_STATES;
        if (activeTab === 'clientes') return [...POST_SALE_STATES, 'Perdido' as ProspectStatus];
        return ['Nuevo', 'Contactado', 'En seguimiento', 'Cotizado', 'Venta cerrada', 'Cliente Activo', 'Cliente Inactivo', 'Perdido'] as ProspectStatus[];
    }, [activeTab]);

    const filteredProspects = useMemo(() => {
        return prospects.filter(prospect => {
            const matchesSearch =
                prospect.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                prospect.telefono.includes(searchTerm) ||
                prospect.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (prospect.empresa || '').toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'all' || prospect.estado === statusFilter;
            const matchesPlatform = platformFilter === 'all' || prospect.plataforma === platformFilter;
            const matchesUser = userFilter === 'all' || prospect.responsable === userFilter;

            // Tab filter
            let matchesTab = true;
            if (activeTab === 'prospectos') {
                matchesTab = PRE_SALE_STATES.includes(prospect.estado);
            } else if (activeTab === 'clientes') {
                matchesTab = POST_SALE_STATES.includes(prospect.estado) || prospect.estado === 'Perdido';
            }

            return matchesSearch && matchesStatus && matchesPlatform && matchesUser && matchesTab;
        });
    }, [prospects, searchTerm, statusFilter, platformFilter, userFilter, activeTab]);

    const tabs: { id: TabFilter; label: string; count: number; icon: string }[] = [
        { id: 'todos', label: 'Todos', count: prospects.length, icon: '📋' },
        { id: 'prospectos', label: 'Prospectos', count: prospects.filter(p => PRE_SALE_STATES.includes(p.estado)).length, icon: '🎯' },
        { id: 'clientes', label: 'Clientes', count: prospects.filter(p => POST_SALE_STATES.includes(p.estado)).length, icon: '✅' },
    ];

    const kpiCards = [
        { titulo: 'Total Contactos', valor: kpis.totalContactos, icono: Users, color: 'bg-blue-50 text-blue-600' },
        { titulo: 'Clientes Activos', valor: kpis.clientesActivos, icono: TrendingUp, color: 'bg-green-50 text-green-600' },
        { titulo: 'Valor Total', valor: `$${kpis.valorTotal.toLocaleString()}`, icono: DollarSign, color: 'bg-purple-50 text-purple-600' },
        { titulo: 'Nuevos este Mes', valor: kpis.nuevosMes, icono: UserPlus, color: 'bg-orange-50 text-orange-600' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {activeTab === 'clientes' ? 'Clientes' : activeTab === 'prospectos' ? 'Prospectos' : 'Contactos'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {activeTab === 'clientes' ? 'Gestiona tu cartera de clientes' : activeTab === 'prospectos' ? 'Gestiona tus oportunidades de venta' : 'Gestiona todos tus contactos del pipeline'}
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto justify-center"
                >
                    <Plus size={20} />
                    {activeTab === 'clientes' ? 'Agregar Cliente' : 'Agregar Prospecto'}
                </button>
            </div>

            {(showAddModal || editingProspect) && (
                <ProspectForm
                    editingProspect={editingProspect}
                    onClose={() => {
                        setShowAddModal(false);
                        setEditingProspect(null);
                    }}
                    onSuccess={handleProspectCreated}
                />
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((kpi) => {
                    const Icon = kpi.icono;
                    return (
                        <div key={kpi.titulo} className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 ${kpi.color} rounded-lg flex items-center justify-center`}>
                                    <Icon size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{kpi.titulo}</p>
                                    <h3 className="text-xl font-bold text-gray-900">{kpi.valor}</h3>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, teléfono, correo o empresa..."
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
                            {availableStatuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
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
                    <span>{filteredProspects.length} de {prospects.length} contactos</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contacto</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Info</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Plataforma</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Valor</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Último Seguimiento</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredProspects.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        {activeTab === 'clientes'
                                            ? 'No tienes clientes aún. Convierte un prospecto cerrando una venta.'
                                            : 'No se encontraron contactos que coincidan con los filtros.'}
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
                                                <p className="font-semibold text-gray-900">{prospect.nombre}</p>
                                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                    <Building2 size={14} />
                                                    {prospect.empresa || prospect.servicioInteres}
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
                                            <span className="font-semibold text-gray-900">
                                                {prospect.valorEstimado ? `$${prospect.valorEstimado.toLocaleString()}` : '—'}
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
                                                        setEditingProspect(prospect);
                                                    }}
                                                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        selectProspect(prospect);
                                                        navigate('/crm/prospectos/detalle');
                                                    }}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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

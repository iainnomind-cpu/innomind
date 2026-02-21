import { useState } from 'react';
import { Plus, Search, Eye, Edit, Trash2, FileText, Download, Send, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '@/context/CRMContext';
import { Quote, Prospect } from '@/types';
import { format } from 'date-fns';

const safeFormat = (value: any, fmt = 'dd/MM/yyyy') => {
    if (!value) return '-';
    let dateObj;
    if (value instanceof Date) {
        dateObj = value;
    } else if (value && typeof value.toDate === 'function') {
        dateObj = value.toDate();
    } else {
        dateObj = new Date(value);
    }
    return isNaN(dateObj.getTime()) ? '-' : format(dateObj, fmt);
};

export default function QuoteList() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<Quote['estado'] | 'all'>('all');

    const navigate = useNavigate();
    const { quotes, prospects, deleteQuote } = useCRM();

    const allQuotes = [...quotes, ...prospects.flatMap((p: Prospect) => (p.cotizaciones as any) || [])];

    const filteredQuotes = allQuotes.filter(quote => {
        const prospect = prospects.find((p: Prospect) => p.id === quote.prospectId);
        const term = searchTerm.toLowerCase();
        const matchesSearch =
            (quote.numero || '').toLowerCase().includes(term) ||
            (prospect?.nombre || '').toLowerCase().includes(term) ||
            quote.items?.some((i: any) => (i.nombre || '').toLowerCase().includes(term));
        const matchesStatus = statusFilter === 'all' || quote.estado === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: Quote['estado']) => ({
        Borrador: 'bg-gray-100 text-gray-800',
        Enviada: 'bg-blue-100 text-blue-800',
        Aceptada: 'bg-green-100 text-green-800',
        Rechazada: 'bg-red-100 text-red-800',
        Vencida: 'bg-orange-100 text-orange-800',
        Actualizada: 'bg-orange-100 text-orange-800'
    }[status] || '');

    const getStatusIcon = (status: Quote['estado']) => {
        const map: Record<Quote['estado'], any> = {
            Borrador: Clock,
            Enviada: Send,
            Aceptada: FileText,
            Rechazada: Trash2,
            Vencida: Clock,
            Actualizada: Clock
        };
        const Icon = map[status] || Clock;
        return <Icon className="h-4 w-4" />;
    };

    const handleDeleteQuote = (id: string) => {
        if (confirm('¿Estás seguro de eliminar esta cotización?')) deleteQuote(id);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestión de Cotizaciones</h2>
                    <p className="text-gray-600">Administra todas las propuestas</p>
                </div>
                <button
                    onClick={() => navigate('/crm/quotes/new')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-4 w-4" /> Nueva Cotización
                </button>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Buscar..."
                        className="pl-10 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent px-4 py-2"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as any)}
                    className="border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 px-3 py-2"
                >
                    <option value="all">Todos</option>
                    <option value="Borrador">Borrador</option>
                    <option value="Enviada">Enviada</option>
                    <option value="Aceptada">Aceptada</option>
                    <option value="Rechazada">Rechazada</option>
                    <option value="Vencida">Vencida</option>
                    <option value="Actualizada">Actualizada</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600">Total Cotizaciones</p>
                        <p className="text-2xl font-bold text-gray-900">{allQuotes.length}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500" />
                </div>

                <div className="bg-white p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600">Valor Total</p>
                        <p className="text-2xl font-bold text-gray-900">
                            ${allQuotes.reduce((s, q) => s + (q.total || 0), 0).toLocaleString()}
                        </p>
                    </div>
                    <Download className="h-8 w-8 text-green-500" />
                </div>

                <div className="bg-white p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600">Aceptadas</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {allQuotes.filter(q => q.estado === 'Aceptada').length}
                        </p>
                    </div>
                    <FileText className="h-8 w-8 text-green-500" />
                </div>

                <div className="bg-white p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600">Tasa Aceptación</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {allQuotes.length
                                ? ((allQuotes.filter(q => q.estado === 'Aceptada').length / allQuotes.length) * 100).toFixed(1)
                                : '0.0'}%
                        </p>
                    </div>
                    <FileText className="h-8 w-8 text-purple-500" />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-auto border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha / Vence</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredQuotes.map(q => {
                            const quote = q as Quote;
                            const prospect = prospects.find((p: Prospect) => p.id === quote.prospectId);
                            const fecha = safeFormat(quote.fecha);
                            // @ts-ignore
                            const vence = safeFormat(quote.vigencia || quote.fecha);
                            // @ts-ignore
                            const isExpired = quote.vigencia ? new Date() > new Date(quote.vigencia) && quote.estado === 'Enviada' : false;

                            return (
                                <tr
                                    key={quote.id}
                                    className={`hover:bg-gray-50 transition-colors`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{quote.numero || 'Sin número'}</div>
                                        <div className="text-sm text-gray-500">{quote.items?.length || 0} ítem{(quote.items?.length !== 1) && 's'}</div>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{prospect?.nombre || 'Cliente desconocido'}</div>
                                        <div className="text-sm text-gray-500">{prospect?.correo || ''}</div>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-gray-900">{fecha}</div>
                                        <div className={`text-sm ${isExpired ? 'text-red-600' : 'text-gray-500'}`}>
                                            Vence: {vence}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">${(quote.total || 0).toLocaleString()}</div>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full gap-1 ${isExpired ? 'bg-orange-100 text-orange-800' : getStatusColor(quote.estado as any)
                                            }`}>
                                            {getStatusIcon(isExpired ? 'Vencida' as any : quote.estado as any)}
                                            {isExpired ? 'Vencida' : quote.estado}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => navigate(`/crm/quotes/${quote.id}`)}
                                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                                title="Ver detalles"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/crm/quotes/${quote.id}?edit=true`)}
                                                className="text-green-600 hover:text-green-900 transition-colors"
                                                title="Editar"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                className="text-purple-600 hover:text-purple-900 transition-colors"
                                                title="Descargar"
                                            >
                                                <Download className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteQuote(quote.id)}
                                                className="text-red-600 hover:text-red-900 transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

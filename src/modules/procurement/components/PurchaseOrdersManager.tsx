import React, { useState } from 'react';
import { useProcurement } from '@/context/ProcurementContext';
import { Search, Plus, ShoppingCart, Clock, CheckCircle, XCircle, Send, FileText, Filter, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PurchaseOrder } from '@/types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PurchaseOrderForm from './PurchaseOrderForm';

export default function PurchaseOrdersManager() {
    const { purchaseOrders, suppliers, purchaseOrderItems } = useProcurement();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [isFormOpen, setIsFormOpen] = useState(false);

    const filteredOrders = purchaseOrders.filter(order => {
        const matchesSearch = order.numeroOrden.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || order.estado === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'BORRADOR': return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium flex items-center gap-1"><FileText size={12} /> Borrador</span>;
            case 'PENDIENTE_APROBACION': return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-medium flex items-center gap-1"><Clock size={12} /> Por Aprobar</span>;
            case 'APROBADA': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium flex items-center gap-1"><CheckCircle size={12} /> Aprobada</span>;
            case 'ENVIADA': return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium flex items-center gap-1"><Send size={12} /> Enviada</span>;
            case 'RECIBIDA_PARCIAL': return <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-md text-xs font-medium flex items-center gap-1"><AlertTriangle size={12} /> Recepción Parcial</span>;
            case 'COMPLETADA': return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-medium flex items-center gap-1"><CheckCircle size={12} /> Completada</span>;
            case 'CANCELADA': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium flex items-center gap-1"><XCircle size={12} /> Cancelada</span>;
            default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">{status}</span>;
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <ShoppingCart size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Órdenes de Compra</h2>
                        <p className="text-sm text-gray-500">Gestión de aprovisionamiento</p>
                    </div>
                </div>

                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
                >
                    <Plus size={20} /> Nueva Orden de Compra
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por folio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="text-gray-400" size={20} />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full sm:w-48 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                        <option value="ALL">Todos los Estados</option>
                        <option value="PENDIENTE_APROBACION">Por Aprobar</option>
                        <option value="APROBADA">Aprobadas</option>
                        <option value="ENVIADA">Enviadas</option>
                        <option value="COMPLETADA">Completadas</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Folio / Fecha</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Proveedor</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto Total</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No se encontraron órdenes de compra.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map(order => {
                                    const supplier = suppliers.find(s => s.id === order.proveedorId);
                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{order.numeroOrden}</div>
                                                <div className="text-sm text-gray-500">{format(order.fechaCreacion, "dd MMM yyyy", { locale: es })}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900 truncate max-w-[200px]">{supplier?.nombreComercial || 'Proveedor Desconocido'}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-[200px]">{supplier?.rfc || ''}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="font-bold text-gray-900">${order.montoTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    {getStatusBadge(order.estado)}
                                                </div>
                                                {order.requiereAprobacionGerencial && order.estado === 'PENDIENTE_APROBACION' && (
                                                    <div className="text-[10px] text-amber-600 text-center mt-1 font-medium">Req. Visto Bueno</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Ver Detalle</button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isFormOpen && (
                <PurchaseOrderForm onClose={() => setIsFormOpen(false)} />
            )}
        </div>
    );
}

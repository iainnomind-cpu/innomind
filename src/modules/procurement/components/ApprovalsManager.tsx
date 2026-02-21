import React, { useState } from 'react';
import { useProcurement } from '@/context/ProcurementContext';
import { useAuth } from '@/context/AuthContext';
import { CheckSquare, ShieldCheck, XCircle, Search, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ApprovalsManager() {
    const { purchaseOrders, suppliers, updatePurchaseOrderStatus } = useProcurement();
    const { session } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    const pendingApprovals = purchaseOrders.filter(o => o.estado === 'PENDIENTE_APROBACION');

    const filteredApprovals = pendingApprovals.filter(order => {
        const supplier = suppliers.find(s => s.id === order.proveedorId);
        return order.numeroOrden.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (supplier && supplier.nombreComercial.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    const handleApprove = async (id: string) => {
        if (window.confirm('¿Estás seguro de autorizar esta Orden de Compra?')) {
            try {
                await updatePurchaseOrderStatus(id, 'APROBADA');
            } catch (error) {
                console.error("Error approving order", error);
                alert("Error al aprobar la orden.");
            }
        }
    };

    const handleReject = async (id: string) => {
        const reason = window.prompt("Motivo de rechazo:");
        if (reason !== null) {
            try {
                await updatePurchaseOrderStatus(id, 'CANCELADA', `Rechazada: ${reason}`);
            } catch (error) {
                console.error("Error rejecting order", error);
                alert("Error al rechazar la orden.");
            }
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Aprobaciones Gerenciales</h2>
                        <p className="text-sm text-gray-500">Autorización de órdenes de compra superiores al límite</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por folio o proveedor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Folio</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Proveedor</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha Creación</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto a Autorizar</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredApprovals.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <ShieldCheck size={48} className="mx-auto text-gray-300 mb-3" />
                                        <p>No hay órdenes pendientes de aprobación.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredApprovals.map(order => {
                                    const supplier = suppliers.find(s => s.id === order.proveedorId);
                                    return (
                                        <tr key={order.id} className="hover:bg-amber-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900 flex items-center gap-2">
                                                    <FileText size={16} className="text-gray-400" />
                                                    {order.numeroOrden}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{supplier?.nombreComercial || 'Desconocido'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-600">{format(order.fechaCreacion, "dd MMM yyyy", { locale: es })}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="font-bold text-gray-900 text-lg">${order.montoTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleApprove(order.id)}
                                                        className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                                                    >
                                                        <ShieldCheck size={16} /> Aprobar
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(order.id)}
                                                        className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                                                    >
                                                        <XCircle size={16} /> Rechazar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

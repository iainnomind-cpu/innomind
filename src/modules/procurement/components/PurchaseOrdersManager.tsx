import { useState } from 'react';
import { useProcurement } from '@/context/ProcurementContext';
import { Search, Plus, ShoppingCart, Clock, CheckCircle, XCircle, FileText, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PurchaseOrderForm from './PurchaseOrderForm';

export default function PurchaseOrdersManager() {
    const { purchaseOrders, suppliers, updatePurchaseOrderStatus } = useProcurement();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [isFormOpen, setIsFormOpen] = useState(false);

    const filteredOrders = purchaseOrders.filter(order => {
        const orderNumber = order.order_number || order.numeroOrden || '';
        const matchesSearch = orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter || order.estado === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'draft':
            case 'borrador':
                return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium flex items-center gap-1"><FileText size={12} /> Borrador</span>;
            case 'pending_approval':
            case 'pendiente_aprobacion':
                return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-medium flex items-center gap-1"><Clock size={12} /> Por Aprobar</span>;
            case 'approved':
            case 'aprobada':
                return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium flex items-center gap-1"><CheckCircle size={12} /> Aprobada</span>;
            case 'received':
            case 'completada':
                return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-medium flex items-center gap-1"><CheckCircle size={12} /> Recibida</span>;
            case 'rejected':
            case 'cancelled':
            case 'cancelada':
                return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium flex items-center gap-1"><XCircle size={12} /> Cancelada</span>;
            default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">{status}</span>;
        }
    };

    const handleSendToApproval = async (id: string) => {
        if (window.confirm('¿Enviar esta orden a revisión gerencial?')) {
            try {
                await updatePurchaseOrderStatus(id, 'pending_approval');
            } catch (error) {
                console.error("Error updating status", error);
            }
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
                        <option value="draft">Borrador</option>
                        <option value="pending_approval">Por Aprobar</option>
                        <option value="approved">Aprobadas</option>
                        <option value="received">Recibidas</option>
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
                                filteredOrders.map((order: any) => {
                                    const supplier = suppliers.find(s => s.id === (order.supplier_id || order.proveedorId));
                                    const amount = order.total_amount || order.montoTotal || 0;
                                    const orderNo = order.order_number || order.numeroOrden || 'S/N';
                                    const date = order.created_at || order.fechaCreacion || new Date();
                                    const status = order.status || order.estado || 'draft';

                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{orderNo}</div>
                                                <div className="text-sm text-gray-500">{format(new Date(date), "dd MMM yyyy", { locale: es })}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900 truncate max-w-[200px]">{supplier?.nombreComercial || 'Proveedor Desconocido'}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-[200px]">{supplier?.rfc || ''}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="font-bold text-gray-900">${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    {getStatusBadge(status)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                {status === 'draft' && (
                                                    <button
                                                        onClick={() => handleSendToApproval(order.id)}
                                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        Solicitar VoBo
                                                    </button>
                                                )}
                                                <button className="text-sm text-gray-400 hover:text-gray-600 font-medium">Ver</button>
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

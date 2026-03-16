import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProcurement } from '@/context/ProcurementContext';
import { Search, Plus, ShoppingCart, Clock, CheckCircle, XCircle, FileText, Filter, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PurchaseOrderForm from './PurchaseOrderForm';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function PurchaseOrdersManager() {
    const navigate = useNavigate();
    const { purchaseOrders, suppliers, updatePurchaseOrderStatus, deletePurchaseOrder } = useProcurement();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [isFormOpen, setIsFormOpen] = useState(false);

    const filteredOrders = purchaseOrders.filter(order => {
        const orderNumber = order.numero_orden || order.numeroOrden || '';
        const matchesSearch = orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || order.estado === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (estado: string) => {
        switch (estado?.toLowerCase()) {
            case 'pending':
                return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-medium flex items-center gap-1"><Clock size={12} /> Pendiente</span>;
            case 'pending_review':
                return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium flex items-center gap-1"><FileText size={12} /> En Revisión</span>;
            case 'approved':
                return <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs font-medium flex items-center gap-1"><CheckCircle size={12} /> Aprobada</span>;
            case 'received':
                return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-medium flex items-center gap-1"><CheckCircle size={12} /> Recibida</span>;
            case 'cancelled':
                return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium flex items-center gap-1"><XCircle size={12} /> Cancelada</span>;
            default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">{estado}</span>;
        }
    };

    const handleSendToApproval = async (id: string) => {
        if (window.confirm('¿Enviar esta orden a revisión gerencial?')) {
            try {
                await updatePurchaseOrderStatus(id, 'pending');
            } catch (error) {
                console.error("Error updating status", error);
            }
        }
    };

    const generatePDF = (order: any) => {
        const doc = new jsPDF();
        const supplier = suppliers.find(s => s.id === order.supplier_id);

        // Header
        doc.setFontSize(22);
        doc.setTextColor(37, 99, 235);
        doc.text('INNOMIND ERP', 105, 20, { align: 'center' });

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('ORDEN DE COMPRA', 105, 30, { align: 'center' });

        doc.setFontSize(10);
        doc.text(`Folio: ${order.numero_orden}`, 150, 45);
        doc.text(`Fecha: ${format(new Date(order.created_at), 'dd/MM/yyyy')}`, 150, 50);

        // Supplier Info
        doc.setFontSize(12);
        doc.text('PROVEEDOR:', 15, 60);
        doc.setFontSize(10);
        doc.text(supplier?.razonSocial || supplier?.nombreComercial || 'N/A', 15, 65);
        doc.text(`RFC: ${supplier?.rfc || 'N/A'}`, 15, 70);
        doc.text(supplier?.direccionFiscal || '', 15, 75);

        // Table
        const tableData = order.items?.map((item: any) => [
            item.product_id?.slice(0, 8) || 'S/N',
            item.description || 'Consulta sistema',
            item.quantity,
            `$${item.unit_price.toLocaleString()}`,
            `$${item.total_price.toLocaleString()}`
        ]) || [];

        (doc as any).autoTable({
            startY: 85,
            head: [['COD', 'DESCRIPCIÓN', 'CANT', 'P. UNIT', 'TOTAL']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillStyle: [37, 99, 235] }
        });

        // Totals
        const finalY = (doc as any).lastAutoTable.result.finalY;
        doc.text(`TOTAL: $${order.total_amount.toLocaleString()}`, 150, finalY + 10);

        doc.save(`OC_${order.numero_orden}.pdf`);
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
                        <option value="pending">Pendiente</option>
                        <option value="sent">Enviada</option>
                        <option value="approved">Aprobada</option>
                        <option value="received">Recibida</option>
                        <option value="cancelled">Cancelada</option>
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
                                    const supplier = suppliers.find(s => s.id === (order.proveedor_id || order.proveedorId));
                                    const amount = order.total_amount || order.montoTotal || 0;
                                    const orderNo = order.numero_orden || order.numeroOrden || 'S/N';
                                    const date = order.created_at || order.fechaCreacion || new Date();
                                    const estado = order.estado || 'pending';

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
                                                    {getStatusBadge(estado)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                {estado === 'pending' && (
                                                    <button
                                                        onClick={() => handleSendToApproval(order.id)}
                                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        Solicitar VoBo
                                                    </button>
                                                )}
                                                {estado === 'approved' && (
                                                    <button
                                                        onClick={() => generatePDF(order)}
                                                        className="text-sm text-emerald-600 hover:text-emerald-800 font-medium"
                                                    >
                                                        PDF
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => navigate(`/compras/ordenes/${order.id}`)}
                                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/compras/ordenes/${order.id}`)}
                                                    className="text-sm text-gray-400 hover:text-gray-600 font-medium"
                                                >
                                                    Ver
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm('¿Estás seguro de que deseas eliminar esta orden de compra? Se eliminarán también los items relacionados.')) {
                                                            try {
                                                                await deletePurchaseOrder(order.id);
                                                            } catch (error) {
                                                                console.error(error);
                                                                alert("Error al eliminar la orden de compra.");
                                                            }
                                                        }
                                                    }}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition inline-flex items-center justify-center align-middle"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
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

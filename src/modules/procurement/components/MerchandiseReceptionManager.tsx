import { useState } from 'react';
import { useProcurement } from '@/context/ProcurementContext';
import { PackageOpen, Search, CheckCircle, ArrowRight, ShieldAlert, Check } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useInventory } from '@/context/InventoryContext';

export default function MerchandiseReceptionManager() {
    const { purchaseOrders, suppliers, purchaseOrderItems, registerReception } = useProcurement();
    const { locations, registerMovement } = useInventory();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    // Solo órdenes que pueden recibir mercancía (Approved o Received si aceptamos parcial)
    const receivableStatus = ['approved', 'received'];

    const receivableOrders = purchaseOrders.filter(o =>
        receivableStatus.includes(o.status || o.estado || '')
    );

    const filteredOrders = receivableOrders.filter(order => {
        const supplier = suppliers.find(s => s.id === (order.supplier_id || order.proveedorId));
        const orderNo = order.order_number || order.numeroOrden || '';
        return orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (supplier && supplier.nombreComercial.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                        <PackageOpen size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Recepción de Mercancía</h2>
                        <p className="text-sm text-gray-500">Check-in físico en almacén e ingreso a inventario</p>
                    </div>
                </div>
            </div>

            {!selectedOrder ? (
                <div className="space-y-6">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por orden o proveedor..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Orden de Compra</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Proveedor</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                            No hay órdenes pendientes de recibir material.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map(order => {
                                        const supplier = suppliers.find(s => s.id === (order.supplier_id || order.proveedorId));
                                        const status = order.status || order.estado || '';
                                        const orderNo = order.order_number || order.numeroOrden || '';

                                        return (
                                            <tr key={order.id} className="hover:bg-emerald-50/50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-gray-900">{orderNo}</td>
                                                <td className="px-6 py-4 text-gray-600">{supplier?.nombreComercial || 'Desconocido'}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${status === 'received' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-sm font-medium transition-colors"
                                                    >
                                                        Registrar Entrada <ArrowRight size={16} className="inline ml-1" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <ReceptionForm
                    order={selectedOrder}
                    items={purchaseOrderItems.filter(i => (i.purchase_order_id || (i as any).purchaseOrderId) === selectedOrder.id)}
                    supplier={suppliers.find(s => s.id === (selectedOrder.supplier_id || selectedOrder.proveedorId))}
                    locations={locations}
                    onBack={() => setSelectedOrder(null)}
                    onSuccess={() => {
                        setSelectedOrder(null);
                    }}
                />
            )}
        </div>
    );
}

function ReceptionForm({ order, items, supplier, locations, onBack, onSuccess }: any) {
    const { registerReception } = useProcurement();
    const { registerMovement } = useInventory();

    const [receptionItems, setReceptionItems] = useState(
        items.map((item: any) => ({
            id: item.id,
            product_id: item.product_id || item.productId,
            descripcion: item.descripcion || `Producto ${item.product_id?.slice(0, 6) || item.id.slice(0, 6)}`,
            esperado: (item.quantity || item.cantidadSolicitada) - (item.quantity_received || item.cantidadRecibida || 0),
            recibiendo: (item.quantity || item.cantidadSolicitada) - (item.quantity_received || item.cantidadRecibida || 0),
            unitPrice: item.unit_price || item.precioUnitario || 0
        }))
    );

    const [locationId, setLocationId] = useState(locations[0]?.id || '');
    const [notas, setNotas] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleQtyChange = (id: string, qty: number) => {
        setReceptionItems(receptionItems.map((ri: any) => ri.id === id ? { ...ri, recibiendo: qty } : ri));
    };

    const handleSubmit = async () => {
        const total = receptionItems.reduce((sum: number, i: any) => sum + i.recibiendo, 0);
        if (total <= 0) {
            alert("No has ingresado cantidades.");
            return;
        }

        if (!locationId) {
            alert("Debes seleccionar un almacén de destino.");
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Register Reception in Procurement
            await registerReception({
                purchase_order_id: order.id,
                workspace_id: order.workspace_id || order.workspace,
                supplier_id: supplier?.id,
                notes: notas
            }, receptionItems.map((ri: any) => ({
                product_id: ri.product_id,
                quantity_received: ri.recibiendo
            })));

            // 2. Sincronizar con Inventario
            for (const ri of receptionItems) {
                if (ri.product_id && ri.recibiendo > 0) {
                    await registerMovement({
                        productId: ri.product_id,
                        locationId: locationId,
                        tipoMovimiento: 'ENTRADA_COMPRA',
                        cantidad: ri.recibiendo,
                        costoUnitario: ri.unitPrice,
                        notas: `Recepción de OC: ${order.order_number || order.numeroOrden}`,
                        referenceId: order.id
                    });
                }
            }

            alert("Recepción completada exitosamente.");
            onSuccess();
        } catch (error) {
            console.error("Error en recepción", error);
            alert("Error al procesar la recepción.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="text-blue-600 hover:underline flex items-center text-sm font-medium">
                ← Volver a la lista
            </button>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex flex-col md:flex-row justify-between items-start mb-6 pb-6 border-b border-gray-100 gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Recepción Ingreso de {order.order_number || order.numeroOrden}</h3>
                        <p className="text-gray-600">Proveedor: <span className="font-semibold">{supplier?.nombreComercial || 'Desconocido'}</span></p>
                    </div>
                    <div className="w-full md:w-64">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Almacén de Destino *</label>
                        <select
                            value={locationId}
                            onChange={(e) => setLocationId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                        >
                            <option value="">Seleccionar...</option>
                            {locations.map((loc: any) => (
                                <option key={loc.id} value={loc.id}>{loc.nombre}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="font-semibold text-gray-900">Validación de Partidas</p>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-3 font-semibold text-gray-500 uppercase">Item</th>
                                    <th className="p-3 font-semibold text-gray-500 uppercase text-center w-32">Pendiente</th>
                                    <th className="p-3 font-semibold text-gray-500 uppercase text-center w-40">Recibiendo Hoy</th>
                                    <th className="p-3 font-semibold text-gray-500 uppercase text-center w-24">Link Almacén</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {receptionItems.map((ri: any) => (
                                    <tr key={ri.id} className={ri.esperado === 0 ? "bg-gray-50 opacity-50" : ""}>
                                        <td className="p-3 font-medium text-gray-900">{ri.descripcion}</td>
                                        <td className="p-3 text-center text-gray-600">{ri.esperado} und</td>
                                        <td className="p-3 text-center">
                                            <input
                                                type="number" min="0" max={ri.esperado}
                                                value={ri.recibiendo}
                                                onChange={(e) => handleQtyChange(ri.id, parseFloat(e.target.value) || 0)}
                                                disabled={ri.esperado === 0}
                                                className="w-24 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                                            />
                                        </td>
                                        <td className="p-3 text-center">
                                            {ri.product_id ? (
                                                <CheckCircle className="mx-auto text-emerald-500" size={18} />
                                            ) : (
                                                <ShieldAlert className="mx-auto text-amber-500" size={18} title="Gasto sin inventariar" />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notas al recibir</label>
                        <textarea
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                            rows={2}
                            placeholder="Comentarios adicionales..."
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                    <button onClick={onBack} disabled={isSubmitting} className="px-5 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !locationId}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm flex items-center gap-2"
                    >
                        {isSubmitting ? 'Procesando...' : <><Check size={18} /> Confirmar Ingreso de Almacén</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

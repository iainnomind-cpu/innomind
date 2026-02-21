import React, { useState } from 'react';
import { useProcurement } from '@/context/ProcurementContext';
import { useAuth } from '@/context/AuthContext';
import { PackageOpen, Search, CheckCircle, ArrowRight, ShieldAlert, Check } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PurchaseOrder, PurchaseOrderItem } from '@/types';
import { useInventory } from '@/context/InventoryContext';

export default function MerchandiseReceptionManager() {
    const { purchaseOrders, suppliers, purchaseOrderItems, registerReception } = useProcurement();
    const { products, registerMovement } = useInventory();
    const { session } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

    // Solo órdenes que pueden recibir mercancía (Enviadas o Recepción Parcial) 
    // Para V1 también permitimos APROBADAS para saltar pasos de envío en flujos cortos.
    const receivableStatus = ['APROBADA', 'ENVIADA', 'RECIBIDA_PARCIAL'];

    // Filtro principal de la lista
    const receivableOrders = purchaseOrders.filter(o => receivableStatus.includes(o.estado));

    const filteredOrders = receivableOrders.filter(order => {
        const supplier = suppliers.find(s => s.id === order.proveedorId);
        return order.numeroOrden.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Estado Actual</th>
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
                                        const supplier = suppliers.find(s => s.id === order.proveedorId);
                                        return (
                                            <tr key={order.id} className="hover:bg-emerald-50/50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-gray-900">{order.numeroOrden}</td>
                                                <td className="px-6 py-4 text-gray-600">{supplier?.nombreComercial || 'Desconocido'}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${order.estado === 'RECIBIDA_PARCIAL' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {order.estado.replace('_', ' ')}
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
                    items={purchaseOrderItems.filter(i => i.purchaseOrderId === selectedOrder.id)}
                    supplierName={suppliers.find(s => s.id === selectedOrder.proveedorId)?.nombreComercial || 'Desconocido'}
                    onBack={() => setSelectedOrder(null)}
                    onSuccess={() => {
                        setSelectedOrder(null);
                        // Trigger a small visual feedback eventually
                    }}
                />
            )}
        </div>
    );
}

function ReceptionForm({ order, items, supplierName, onBack, onSuccess }: any) {
    const { registerReception } = useProcurement();
    const { registerMovement } = useInventory();

    const [receptionState, setReceptionState] = useState(
        items.map((item: any) => ({
            id: item.id,
            productId: item.productId,
            descripcion: item.descripcion,
            esperado: item.cantidadSolicitada - item.cantidadRecibida,
            recibiendo: item.cantidadSolicitada - item.cantidadRecibida // Default a recibir lo que falta
        }))
    );

    const [numeroRemision, setNumeroRemision] = useState('');
    const [notas, setNotas] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRecibiendoChange = (id: string, qty: number) => {
        setReceptionState(receptionState.map((rs: any) => rs.id === id ? { ...rs, recibiendo: qty } : rs));
    };

    const handleSubmit = async () => {
        // Validar que se esté recibiendo algo
        const totalRecibido = receptionState.reduce((sum: number, item: any) => sum + item.recibiendo, 0);
        if (totalRecibido <= 0) {
            alert("No has ingresado ninguna cantidad a recibir.");
            return;
        }

        setIsSubmitting(true);
        try {
            const receivedItemsMap = receptionState.map((rs: any) => {
                const originalItem = items.find((i: any) => i.id === rs.id);
                return {
                    id: rs.id,
                    cantidadRecibida: originalItem.cantidadRecibida + rs.recibiendo
                };
            });

            // 1. Guardar Recepción en Modulo de Compras
            await registerReception({
                purchaseOrderId: order.id,
                fechaRecepcion: new Date(),
                numeroRemision,
                notas
            }, receivedItemsMap);

            // 2. Sincronizar con Inventario si tienen Product ID definido
            for (const rs of receptionState) {
                if (rs.productId && rs.recibiendo > 0) {
                    await registerMovement({
                        productId: rs.productId,
                        tipo: 'ENTRADA_COMPRA',
                        cantidad: rs.recibiendo,
                        notas: `Recepción de OC: ${order.numeroOrden} // Remisión: ${numeroRemision}`,
                        documentoReferencia: order.numeroOrden
                    });
                }
            }

            alert("Mercancía recibida e inventario actualizado exitosamente.");
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
                <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Recepción Ingreso de {order.numeroOrden}</h3>
                        <p className="text-gray-600">Proveedor: <span className="font-semibold">{supplierName}</span></p>
                    </div>
                    <div className="text-right">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Folio Remisión / Factura (Opcional)</label>
                        <input
                            type="text"
                            value={numeroRemision}
                            onChange={(e) => setNumeroRemision(e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 w-48"
                            placeholder="EJ. FAC-001"
                        />
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
                                    <th className="p-3 font-semibold text-gray-500 uppercase text-center w-24">Link A Almacén</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {receptionState.map((rs: any) => (
                                    <tr key={rs.id} className={rs.esperado === 0 ? "bg-gray-50 opacity-50" : ""}>
                                        <td className="p-3 font-medium text-gray-900">{rs.descripcion}</td>
                                        <td className="p-3 text-center text-gray-600">{rs.esperado} und</td>
                                        <td className="p-3 text-center">
                                            <input
                                                type="number" min="0" max={rs.esperado}
                                                value={rs.recibiendo}
                                                onChange={(e) => handleRecibiendoChange(rs.id, parseInt(e.target.value) || 0)}
                                                disabled={rs.esperado === 0}
                                                className="w-24 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                                            />
                                        </td>
                                        <td className="p-3 text-center">
                                            {rs.productId ? (
                                                <CheckCircle className="mx-auto text-emerald-500" size={18} title="Vinculado al Catálogo Maestro" />
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                            rows={2}
                            placeholder="Ej. Cajas llegaron golpeadas..."
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                    <button onClick={onBack} disabled={isSubmitting} className="px-5 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm flex items-center gap-2"
                    >
                        {isSubmitting ? 'Procesando...' : <><Check size={18} /> Confirmar Ingreso de Almacén</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

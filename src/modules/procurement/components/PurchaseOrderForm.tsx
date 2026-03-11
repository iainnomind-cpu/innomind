import React, { useState } from 'react';
import { useProcurement } from '@/context/ProcurementContext';
import { useInventory } from '@/context/InventoryContext';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';

interface PurchaseOrderFormProps {
    onClose: () => void;
}

export default function PurchaseOrderForm({ onClose }: PurchaseOrderFormProps) {
    const { suppliers, addPurchaseOrder } = useProcurement();
    const { products } = useInventory(); // To select products if needed

    const activeSuppliers = suppliers.filter(s => s.activo);

    const [proveedorId, setProveedorId] = useState('');
    const [fechaEsperada, setFechaEsperada] = useState('');
    const [notasInternas, setNotasInternas] = useState('');
    const [terminosCondiciones, setTerminosCondiciones] = useState('');

    const [items, setItems] = useState<any[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddItem = () => {
        setItems([...items, { id: Date.now().toString(), productId: '', descripcion: '', cantidadSolicitada: 1, precioUnitario: 0, impuestoPorcentaje: 16 }]);
    };

    const handleRemoveItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleItemChange = (id: string, field: string, value: any) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                // Auto-fill description/price if product selected
                const product = products.find(p => p.id === value);
                if (product) {
                    updatedItem.descripcion = product.nombre;
                    updatedItem.precioUnitario = product.costoPromedio || product.precio || 0;
                }
                return updatedItem;
            }
            return item;
        }));
    };

    const calculateTotals = () => {
        let subtotal = 0;
        let impuestos = 0;
        items.forEach(item => {
            const lineTotal = item.cantidadSolicitada * item.precioUnitario;
            subtotal += lineTotal;
            impuestos += lineTotal * (item.impuestoPorcentaje / 100);
        });
        return { subtotal, impuestos, montoTotal: subtotal + impuestos };
    };

    const { subtotal, impuestos, montoTotal } = calculateTotals();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) {
            alert("Debe agregar al menos un artículo a la orden.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Format items 
            const formattedItems = items.map(item => ({
                product_id: item.productId || undefined,
                quantity: item.cantidadSolicitada,
                unit_price: item.precioUnitario,
                total_price: item.cantidadSolicitada * item.precioUnitario
            }));

            await addPurchaseOrder({
                supplier_id: proveedorId,
                total_amount: montoTotal,
                currency: 'MXN', // Hardcoded for V1
                notes: notasInternas,
            } as any, formattedItems as any);

            alert("Orden de Compra creada exitosamente.");
            onClose();
        } catch (error) {
            console.error("Error creating PO", error);
            alert("Error al generar la orden de compra.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="text-gray-600" size={24} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Nueva Orden de Compra</h2>
                        <p className="text-sm text-gray-500">Crear solicitud a proveedor</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !proveedorId || items.length === 0}
                        className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors shadow-sm"
                    >
                        <Save size={18} /> {isSubmitting ? 'Guardando...' : 'Guardar Orden'}
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-6 space-y-8 pb-24">
                {/* General Header Data */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b">Datos del Proveedor y Fechas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor *</label>
                            <select
                                value={proveedorId}
                                onChange={e => setProveedorId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                                required
                            >
                                <option value="">Selecciona un Proveedor...</option>
                                {activeSuppliers.map(s => (
                                    <option key={s.id} value={s.id}>{s.nombreComercial} {s.rfc ? `(${s.rfc})` : ''}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Esperada de Recepción</label>
                            <input
                                type="date"
                                value={fechaEsperada}
                                onChange={e => setFechaEsperada(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Líneas de Compra</h3>
                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            <Plus size={16} /> Agregar Fila
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 bg-white">
                                    <th className="p-3 text-xs font-semibold text-gray-500 uppercase">Artículo (Catálogo Mtro)</th>
                                    <th className="p-3 text-xs font-semibold text-gray-500 uppercase">Descripción / Concepto</th>
                                    <th className="p-3 text-xs font-semibold text-gray-500 uppercase w-32">Cantidad</th>
                                    <th className="p-3 text-xs font-semibold text-gray-500 uppercase w-32">Precio Unit.</th>
                                    <th className="p-3 text-xs font-semibold text-gray-500 uppercase w-24">% IVA</th>
                                    <th className="p-3 text-xs font-semibold text-gray-500 uppercase text-right w-32">Total</th>
                                    <th className="p-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-gray-500">Haz click en "Agregar Fila" para añadir artículos a la orden.</td>
                                    </tr>
                                ) : (
                                    items.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-3">
                                                <select
                                                    value={item.productId}
                                                    onChange={e => handleItemChange(item.id, 'productId', e.target.value)}
                                                    className="w-full px-2 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none bg-white text-sm"
                                                >
                                                    <option value="">(Libre)</option>
                                                    {products.filter(p => p.tipo !== 'paquete').map(p => (
                                                        <option key={p.id} value={p.id}>{p.codigo || p.id.slice(0, 6)} - {p.nombre}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-3">
                                                <input
                                                    type="text"
                                                    value={item.descripcion}
                                                    onChange={e => handleItemChange(item.id, 'descripcion', e.target.value)}
                                                    placeholder="Descripción comercial"
                                                    className="w-full px-2 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                                                    required
                                                />
                                            </td>
                                            <td className="p-3">
                                                <input
                                                    type="number" min="0.01" step="0.01"
                                                    value={item.cantidadSolicitada}
                                                    onChange={e => handleItemChange(item.id, 'cantidadSolicitada', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-2 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                                                    required
                                                />
                                            </td>
                                            <td className="p-3">
                                                <input
                                                    type="number" min="0" step="0.01"
                                                    value={item.precioUnitario}
                                                    onChange={e => handleItemChange(item.id, 'precioUnitario', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-2 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                                                    required
                                                />
                                            </td>
                                            <td className="p-3">
                                                <select
                                                    value={item.impuestoPorcentaje}
                                                    onChange={e => handleItemChange(item.id, 'impuestoPorcentaje', parseFloat(e.target.value))}
                                                    className="w-full px-2 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none bg-white text-sm"
                                                >
                                                    <option value="16">16%</option>
                                                    <option value="0">0%</option>
                                                    <option value="8">8%</option>
                                                </select>
                                            </td>
                                            <td className="p-3 text-right font-medium text-gray-900 border-l border-gray-50 bg-gray-50/50">
                                                ${(item.cantidadSolicitada * item.precioUnitario).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-3 text-center">
                                                <button type="button" onClick={() => handleRemoveItem(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Totals */}
                    <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal:</span>
                                <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>IVA Est.:</span>
                                <span>${impuestos.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200 mt-3">
                                <span>Total a Pagar:</span>
                                <span>${montoTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            {montoTotal > 50000 && (
                                <p className="text-[10px] text-amber-600 font-medium text-right leading-tight">
                                    Nota: Montos {'>'} $50k requerirán visto bueno gerencial automáticamente.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Additional Notes */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b">Términos Comerciales Generales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Términos y Condiciones (Para PDF)</label>
                            <textarea
                                value={terminosCondiciones}
                                onChange={e => setTerminosCondiciones(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-600"
                                placeholder="Condiciones de entrega, penalizaciones, garantías..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notas Internas (Privadas)</label>
                            <textarea
                                value={notasInternas}
                                onChange={e => setNotasInternas(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-600 bg-yellow-50/50"
                                placeholder="Justificación de compra o comentarios para flujo de aprobación..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

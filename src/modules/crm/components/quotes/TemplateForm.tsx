import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Loader2 } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { useInventory } from '@/context/InventoryContext';
import { QuoteTemplate, QuoteTemplateItem } from '@/types';

interface TemplateFormProps {
    onClose: () => void;
    editingTemplate?: QuoteTemplate | null;
}

const PAYMENT_METHODS = [
    'Transferencia bancaria',
    'PayPal',
    'Stripe',
    'Tarjeta de crédito',
    'Efectivo',
    'Cheque'
];

export default function TemplateForm({ onClose, editingTemplate }: TemplateFormProps) {
    const { addQuoteTemplate, updateQuoteTemplate } = useCRM();
    const { products } = useInventory();

    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [items, setItems] = useState<QuoteTemplateItem[]>([]);

    // Additional Info
    const [condicionesPago, setCondicionesPago] = useState('');
    const [notasAdicionales, setNotasAdicionales] = useState('');
    const [terminosCondiciones, setTerminosCondiciones] = useState('');
    const [metodosPagoAceptados, setMetodosPagoAceptados] = useState<string[]>([]);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (editingTemplate) {
            setNombre(editingTemplate.nombre);
            setDescripcion(editingTemplate.descripcion);
            setItems(editingTemplate.items || []);
            setCondicionesPago(editingTemplate.condicionesPago || '');
            setNotasAdicionales(editingTemplate.notasAdicionales || '');
            setTerminosCondiciones(editingTemplate.terminosCondiciones || '');
            setMetodosPagoAceptados(editingTemplate.metodosPagoAceptados || []);
        } else {
            // Add a default empty item for new templates
            handleAddItem();
        }
    }, [editingTemplate]);

    const handleAddItem = () => {
        setItems([
            ...items,
            {
                id: Math.random().toString(36).substr(2, 9),
                nombre: '',
                descripcion: '',
                cantidad: 1,
                precioUnitario: 0,
                descuento: 0,
                tipoDescuento: 'porcentaje',
                subtotal: 0
            }
        ]);
    };

    const handleRemoveItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const updateItem = (id: string, field: keyof QuoteTemplateItem, value: string | number) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };

                // If selecting a product, auto-fill details
                if (field === 'productId' && value) {
                    const product = products.find(p => p.id === value);
                    if (product) {
                        updatedItem.nombre = product.nombre;
                        updatedItem.descripcion = product.descripcion || '';
                        updatedItem.precioUnitario = product.precio;
                    }
                }

                // Recalculate subtotal
                const baseTotal = (updatedItem.cantidad || 0) * (updatedItem.precioUnitario || 0);
                let discountAmount = 0;

                if (updatedItem.tipoDescuento === 'porcentaje') {
                    discountAmount = baseTotal * ((updatedItem.descuento || 0) / 100);
                } else {
                    discountAmount = (updatedItem.descuento || 0);
                }

                updatedItem.subtotal = Math.max(0, baseTotal - discountAmount);
                return updatedItem;
            }
            return item;
        }));
    };

    const togglePaymentMethod = (method: string) => {
        setMetodosPagoAceptados(prev =>
            prev.includes(method)
                ? prev.filter(m => m !== method)
                : [...prev, method]
        );
    };

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + ((item.cantidad || 0) * (item.precioUnitario || 0)), 0);
    const totalEstimado = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const totalDescuentos = subtotal - totalEstimado;

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!nombre.trim()) newErrors.nombre = 'El nombre de la plantilla es obligatorio';
        if (!descripcion.trim()) newErrors.descripcion = 'La descripción es obligatoria';

        if (items.length === 0) {
            newErrors.items = 'Debe agregar al menos un ítem';
        } else {
            items.forEach((item, index) => {
                if (!item.nombre.trim()) newErrors[`item_${index}_nombre`] = 'Obligatorio';
                if (item.cantidad <= 0) newErrors[`item_${index}_cantidad`] = 'Debe ser > 0';
                if (item.precioUnitario < 0) newErrors[`item_${index}_precio`] = 'Debe ser >= 0';
            });
        }

        setErrors(newErrors);
        // Returns true if no errors
        return Object.keys(newErrors).length === 0;
    };

    const showToast = (type: 'success' | 'error', text: string) => {
        setToastMessage({ type, text });
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            // Scroll to top to show errors if any
            const firstError = document.querySelector('.text-red-500');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setIsLoading(true);

        const templateData = {
            nombre,
            descripcion,
            items,
            subtotal,
            totalEstimado,
            condicionesPago,
            notasAdicionales,
            terminosCondiciones,
            metodosPagoAceptados,
        };

        try {
            if (editingTemplate) {
                await updateQuoteTemplate(editingTemplate.id, templateData);
                showToast('success', 'Plantilla actualizada exitosamente');
            } else {
                await addQuoteTemplate(templateData);
                showToast('success', 'Plantilla creada exitosamente');
            }

            // Allow user to see the success message briefly before closing
            setTimeout(() => {
                onClose();
            }, 1500);

        } catch (error: any) {
            console.error("Error saving template", error);
            if (error?.code === '42501') {
                showToast('error', 'Error 403: No tienes permisos (RLS) en este workspace.');
            } else {
                showToast('error', error?.message || 'Ocurrió un error al guardar la plantilla');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-50 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 bg-white border-b border-gray-200 rounded-t-xl shrink-0">
                    <h2 className="text-xl font-bold text-gray-900">
                        {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 relative">
                    {toastMessage && (
                        <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg text-white font-medium z-10 ${toastMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                            }`}>
                            {toastMessage.text}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Información General */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Información General</h3>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre de la plantilla *
                                    </label>
                                    <input
                                        type="text"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.nombre ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                        placeholder="Ej. Diseño Web Básico"
                                    />
                                    {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Descripción *
                                    </label>
                                    <textarea
                                        value={descripcion}
                                        onChange={(e) => setDescripcion(e.target.value)}
                                        rows={2}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none ${errors.descripcion ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                        placeholder="Descripción breve del propósito de esta plantilla"
                                    />
                                    {errors.descripcion && <p className="text-red-500 text-xs mt-1">{errors.descripcion}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Ítems de la plantilla */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                            <div className="flex justify-between items-center border-b pb-2 mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Ítems de la Plantilla</h3>
                                <button
                                    type="button"
                                    onClick={handleAddItem}
                                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    <Plus className="h-4 w-4" /> Agregar Ítem
                                </button>
                            </div>

                            {errors.items && <p className="text-red-500 text-sm mb-4">{errors.items}</p>}

                            <div className="space-y-6">
                                {items.map((item, index) => (
                                    <div key={item.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors"
                                            title="Eliminar ítem"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                            {/* Fila 1 */}
                                            <div className="col-span-12 md:col-span-6">
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Producto/Servicio del Catálogo (Opcional)
                                                </label>
                                                <select
                                                    value={item.productId || ''}
                                                    onChange={(e) => updateItem(item.id, 'productId', e.target.value)}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="">-- Seleccionar producto --</option>
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>{p.nombre} - ${p.precio}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="col-span-12 md:col-span-6">
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Nombre *</label>
                                                <input
                                                    type="text"
                                                    value={item.nombre}
                                                    onChange={(e) => updateItem(item.id, 'nombre', e.target.value)}
                                                    className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-blue-500 ${errors[`item_${index}_nombre`] ? 'border-red-500' : 'border-gray-300'}`}
                                                    placeholder="Nombre del ítem"
                                                />
                                            </div>

                                            {/* Fila 2 */}
                                            <div className="col-span-12 md:col-span-6">
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Descripción Breve</label>
                                                <input
                                                    type="text"
                                                    value={item.descripcion}
                                                    onChange={(e) => updateItem(item.id, 'descripcion', e.target.value)}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500"
                                                />
                                            </div>

                                            <div className="col-span-12 md:col-span-6">
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Descripción Detallada</label>
                                                <textarea
                                                    value={item.descripcionDetallada || ''}
                                                    onChange={(e) => updateItem(item.id, 'descripcionDetallada', e.target.value)}
                                                    rows={1}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 resize-none"
                                                />
                                            </div>

                                            {/* Fila 3: Cantidad, Precio, Descuento, Subtotal */}
                                            <div className="col-span-6 md:col-span-2">
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Cantidad *</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.cantidad}
                                                    onChange={(e) => updateItem(item.id, 'cantidad', parseFloat(e.target.value) || 0)}
                                                    className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-blue-500 ${errors[`item_${index}_cantidad`] ? 'border-red-500' : 'border-gray-300'}`}
                                                />
                                            </div>

                                            <div className="col-span-6 md:col-span-3">
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Precio Unit. *</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.precioUnitario}
                                                        onChange={(e) => updateItem(item.id, 'precioUnitario', parseFloat(e.target.value) || 0)}
                                                        className={`w-full pl-7 pr-3 py-2 text-sm border rounded-md focus:ring-blue-500 ${errors[`item_${index}_precio`] ? 'border-red-500' : 'border-gray-300'}`}
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-span-6 md:col-span-4 flex items-end gap-2">
                                                <div className="flex-1">
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Descuento</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.descuento || 0}
                                                        onChange={(e) => updateItem(item.id, 'descuento', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div className="w-16">
                                                    <select
                                                        value={item.tipoDescuento}
                                                        onChange={(e) => updateItem(item.id, 'tipoDescuento', e.target.value)}
                                                        className="w-full px-1 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500"
                                                    >
                                                        <option value="porcentaje">%</option>
                                                        <option value="monto">$</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="col-span-6 md:col-span-3">
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Subtotal (Item)</label>
                                                <div className="w-full px-3 py-2 text-sm font-semibold bg-gray-100 text-gray-900 border border-transparent rounded-md text-right">
                                                    ${(item.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {items.length === 0 && (
                                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                        No hay ítems en esta plantilla. Haz clic en "Agregar Ítem" para comenzar.
                                    </div>
                                )}
                            </div>

                            {/* Totales Resumen */}
                            <div className="mt-6 flex justify-end">
                                <div className="w-full md:w-1/3 space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal:</span>
                                        <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    {totalDescuentos > 0 && (
                                        <div className="flex justify-between text-red-500">
                                            <span>Descuentos Ítems:</span>
                                            <span>-${totalDescuentos.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
                                        <span>Total:</span>
                                        <span>${totalEstimado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Información Adicional */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Condiciones Comerciales</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Condiciones de Pago</label>
                                    <input
                                        type="text"
                                        value={condicionesPago}
                                        onChange={(e) => setCondicionesPago(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ej: 50% anticipo, 50% contra entrega"
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notas Adicionales</label>
                                    <textarea
                                        value={notasAdicionales}
                                        onChange={(e) => setNotasAdicionales(e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                                        placeholder="Información adicional visible para el cliente"
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Términos y Condiciones</label>
                                    <textarea
                                        value={terminosCondiciones}
                                        onChange={(e) => setTerminosCondiciones(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                                        placeholder="Términos legales y condiciones del servicio"
                                    />
                                </div>
                            </div>

                            {/* Métodos de Pago */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">Métodos de Pago Aceptados</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {PAYMENT_METHODS.map(method => (
                                        <label key={method} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50">
                                            <input
                                                type="checkbox"
                                                checked={metodosPagoAceptados.includes(method)}
                                                onChange={() => togglePaymentMethod(method)}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                            />
                                            <span className="text-sm text-gray-700">{method}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 bg-white border-t border-gray-200 flex justify-end gap-3 rounded-b-xl shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        {isLoading
                            ? (editingTemplate ? 'Actualizando...' : 'Guardando...')
                            : (editingTemplate ? 'Actualizar Plantilla' : 'Crear Plantilla')
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

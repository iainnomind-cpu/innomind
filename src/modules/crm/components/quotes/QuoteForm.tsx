import React, { useState, useEffect } from 'react';

import { ArrowLeft, Save, Send, Plus, Trash2, FileText, Search, CreditCard, CheckCircle, Package } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { Quote, QuoteItem, QuoteTemplate } from '@/types';

interface QuoteFormProps {
    onClose: () => void;
    editingQuote?: Quote;
}

const PAYMENT_METHODS = [
    'Transferencia bancaria',
    'PayPal',
    'Stripe',
    'Tarjeta de crédito',
    'Efectivo',
    'Cheque'
];

export default function QuoteForm({ onClose, editingQuote }: QuoteFormProps) {
    const {
        addQuote,
        updateQuote,
        prospects,
        products,
        quoteTemplates
    } = useCRM();



    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [templateSearch, setTemplateSearch] = useState('');
    const [saveSuccess, setSaveSuccess] = useState('');

    const [prospectId, setProspectId] = useState('');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    // 30 days default validity
    const [vigencia, setVigencia] = useState(
        new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]
    );
    const [ivaPorcentaje, setIvaPorcentaje] = useState(16);

    const [items, setItems] = useState<QuoteItem[]>([]);
    const [condicionesPago, setCondicionesPago] = useState('50% anticipo, 50% contra entrega');
    const [notasAdicionales, setNotasAdicionales] = useState('');
    const [terminosCondiciones, setTerminosCondiciones] = useState('Garantía de 30 días. Soporte técnico incluido por 90 días.');
    const [metodosPagoAceptados, setMetodosPagoAceptados] = useState<string[]>([]);

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (editingQuote) {
            setProspectId(editingQuote.prospectId);
            setFecha(new Date(editingQuote.fecha).toISOString().split('T')[0]);
            setVigencia(new Date(editingQuote.vigencia).toISOString().split('T')[0]);
            setIvaPorcentaje(editingQuote.ivaPorcentaje || 16);
            setItems(editingQuote.items || []);
            setCondicionesPago(editingQuote.condicionesPago || '');
            setNotasAdicionales(editingQuote.notasAdicionales || '');
            setTerminosCondiciones(editingQuote.terminosCondiciones || '');
            setMetodosPagoAceptados(editingQuote.metodosPagoAceptados || []);

            // Check if validity has passed
            const today = new Date();
            const validUntil = new Date(editingQuote.vigencia);
            if (today > validUntil && editingQuote.estado !== 'Aceptada') {
                // The visual badge or a separate effect might handle status update, but we keep the logic here
            }
        }
    }, [editingQuote]);

    const handleAddItem = () => {
        setItems([
            ...items,
            {
                id: Math.random().toString(36).substr(2, 9),
                nombre: '',
                descripcion: '',
                cantidad: 1,
                precioUnitario: 0,
                total: 0
            }
        ]);
    };

    const handleRemoveItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const updateItem = (id: string, field: keyof QuoteItem, value: any) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };

                if (field === 'productId' && value) {
                    const product = products.find(p => p.id === value);
                    if (product) {
                        updatedItem.nombre = product.nombre;
                        updatedItem.descripcion = product.descripcion;
                        updatedItem.precioUnitario = product.precio;
                    }
                }

                // Recalculate item total
                const qty = typeof updatedItem.cantidad === 'number' ? updatedItem.cantidad : 0;
                const pu = typeof updatedItem.precioUnitario === 'number' ? updatedItem.precioUnitario : 0;
                updatedItem.total = qty * pu;
                return updatedItem;
            }
            return item;
        }));
    };

    const applyTemplate = (template: QuoteTemplate) => {
        // Map template items to quote items
        const newItems: QuoteItem[] = template.items.map(tItem => ({
            id: Math.random().toString(36).substr(2, 9),
            productId: tItem.productId,
            nombre: tItem.nombre,
            descripcion: tItem.descripcion,
            cantidad: tItem.cantidad,
            precioUnitario: tItem.precioUnitario,
            total: (tItem.cantidad * tItem.precioUnitario) -
                (tItem.tipoDescuento === 'porcentaje' ?
                    (tItem.cantidad * tItem.precioUnitario) * (tItem.descuento / 100) :
                    (tItem.descuento || 0))
        }));

        setItems(newItems);
        if (template.condicionesPago) setCondicionesPago(template.condicionesPago);
        if (template.notasAdicionales) setNotasAdicionales(template.notasAdicionales);
        if (template.terminosCondiciones) setTerminosCondiciones(template.terminosCondiciones);
        if (template.metodosPagoAceptados) setMetodosPagoAceptados(template.metodosPagoAceptados);

        setShowTemplateModal(false);
    };

    const togglePaymentMethod = (method: string) => {
        setMetodosPagoAceptados(prev =>
            prev.includes(method)
                ? prev.filter(m => m !== method)
                : [...prev, method]
        );
    };

    // Derived State
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const ivaTotal = subtotal * (ivaPorcentaje / 100);
    const totalVenta = subtotal + ivaTotal;

    const isReadOnly = editingQuote?.estado === 'Aceptada' || editingQuote?.estado === 'Vencida';

    const validate = (draft = false) => {
        const newErrors: Record<string, string> = {};

        if (!draft) {
            if (!prospectId) newErrors.prospectId = 'Seleccione un cliente';
            if (!fecha) newErrors.fecha = 'Seleccione la fecha de emisión';
            if (!vigencia) newErrors.vigencia = 'Seleccione la vigencia';
            if (ivaPorcentaje < 0) newErrors.ivaPorcentaje = 'IVA no puede ser menor a 0';

            if (items.length === 0) {
                newErrors.items = 'Debe agregar al menos un ítem';
            } else {
                items.forEach((item, index) => {
                    if (!item.nombre.trim()) newErrors[`item_${index}_nombre`] = 'Obligatorio';
                    if ((item.cantidad || 0) <= 0) newErrors[`item_${index}_cantidad`] = 'Debe ser > 0';
                    if ((item.precioUnitario || 0) < 0) newErrors[`item_${index}_precio`] = 'Debe ser >= 0';
                });
            }
        } else {
            // Minimal validation for drafts - just identifying the record
            if (!prospectId && !editingQuote) newErrors.prospectId = 'Seleccione un cliente para guardar el borrador';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0 && !draft) {
            const firstError = document.querySelector('.text-red-500');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        return Object.keys(newErrors).length === 0;
    };

    const handleSaveBorrador = (e: React.MouseEvent) => {
        e.preventDefault();
        saveQuote('Borrador');
    };

    const handleSendQuote = (e: React.MouseEvent) => {
        e.preventDefault();
        if (validate(false)) {
            // Actualizar estado si ya estaba enviada
            const nextStatus = editingQuote && editingQuote.estado === 'Enviada' ? 'Actualizada' : 'Enviada';
            saveQuote(nextStatus, true);
        }
    };

    const handleSaveUpdates = (e: React.MouseEvent) => {
        e.preventDefault();
        if (validate(false)) {
            const nextStatus = editingQuote?.estado === 'Enviada' ? 'Actualizada' : (editingQuote?.estado || 'Borrador');
            saveQuote(nextStatus, false);
        }
    };

    const saveQuote = (status: Quote['estado'], showSendToast = false) => {
        if (!validate(status === 'Borrador')) return;

        const quoteData = {
            prospectId,
            numero: editingQuote?.numero || `COT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
            fecha: new Date(fecha),
            vigencia: new Date(vigencia),
            items,
            subtotal,
            ivaPorcentaje,
            ivaTotal,
            total: totalVenta,
            estado: status,
            condicionesPago,
            notasAdicionales,
            terminosCondiciones,
            metodosPagoAceptados
        };

        if (editingQuote) {
            updateQuote(editingQuote.id, quoteData);
            if (showSendToast) {
                alert('Cotización enviada correctamente (Simulado)');
            } else {
                setSaveSuccess('Cambios guardados con éxito');
                setTimeout(() => setSaveSuccess(''), 3000);
            }
        } else {
            addQuote(quoteData);
            if (status === 'Borrador') {
                alert('Cotización guardada como borrador');
                onClose();
            } else {
                alert('Cotización enviada correctamente (Simulado)');
                onClose();
            }
        }
    };

    const filteredTemplates = quoteTemplates.filter(t =>
        t.nombre.toLowerCase().includes(templateSearch.toLowerCase()) ||
        t.descripcion.toLowerCase().includes(templateSearch.toLowerCase())
    );

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Header Sticky */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {editingQuote ? 'Editar Cotización' : 'Nueva Cotización'}
                                </h1>
                                <p className="text-gray-500 text-sm">
                                    {editingQuote ? `Editando ${editingQuote.numero}` : 'Crear una nueva propuesta comercial'}
                                </p>
                            </div>
                            {editingQuote && (
                                <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium border ${editingQuote.estado === 'Enviada' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    editingQuote.estado === 'Aceptada' ? 'bg-green-50 text-green-700 border-green-200' :
                                        editingQuote.estado === 'Vencida' ? 'bg-red-50 text-red-700 border-red-200' :
                                            editingQuote.estado === 'Actualizada' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                'bg-gray-50 text-gray-700 border-gray-200'
                                    }`}>
                                    {editingQuote.estado}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            {!editingQuote && (
                                <button
                                    onClick={() => setShowTemplateModal(true)}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
                                >
                                    <FileText className="h-4 w-4" />
                                    Usar Plantilla
                                </button>
                            )}

                            {!isReadOnly && (
                                <>
                                    <button
                                        onClick={editingQuote ? handleSaveUpdates : handleSaveBorrador}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium shadow-sm"
                                    >
                                        <Save className="h-4 w-4" />
                                        {editingQuote ? 'Guardar Cambios' : 'Guardar Borrador'}
                                    </button>
                                    <button
                                        onClick={handleSendQuote}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                                    >
                                        <Send className="h-4 w-4" />
                                        {editingQuote?.estado === 'Enviada' ? 'Reenviar Cotización' : 'Enviar Cotización'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                {saveSuccess && (
                    <div className="absolute top-full left-0 right-0 bg-green-500 text-white text-center py-2 text-sm font-medium animate-fade-in-down">
                        {saveSuccess}
                    </div>
                )}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column - Main Form */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Información Básica */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">1</span>
                                Información Básica
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cliente *
                                    </label>
                                    <select
                                        value={prospectId}
                                        onChange={(e) => setProspectId(e.target.value)}
                                        disabled={isReadOnly}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.prospectId ? 'border-red-500' : 'border-gray-300'
                                            } ${isReadOnly ? 'bg-gray-100' : ''}`}
                                    >
                                        <option value="">-- Seleccione un cliente --</option>
                                        {prospects.map(p => (
                                            <option key={p.id} value={p.id}>{p.nombre} {p.empresa ? `(${p.empresa})` : ''}</option>
                                        ))}
                                    </select>
                                    {errors.prospectId && <p className="text-red-500 text-xs mt-1">{errors.prospectId}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha de Emisión *
                                    </label>
                                    <input
                                        type="date"
                                        value={fecha}
                                        onChange={(e) => setFecha(e.target.value)}
                                        disabled={isReadOnly}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.fecha ? 'border-red-500' : 'border-gray-300'
                                            } ${isReadOnly ? 'bg-gray-100' : ''}`}
                                    />
                                    {errors.fecha && <p className="text-red-500 text-xs mt-1">{errors.fecha}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Vigencia *
                                    </label>
                                    <input
                                        type="date"
                                        value={vigencia}
                                        onChange={(e) => setVigencia(e.target.value)}
                                        disabled={isReadOnly}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.vigencia ? 'border-red-500' : 'border-gray-300'
                                            } ${isReadOnly ? 'bg-gray-100' : ''}`}
                                    />
                                    {errors.vigencia && <p className="text-red-500 text-xs mt-1">{errors.vigencia}</p>}
                                </div>

                                <div className="md:col-span-2 md:w-1/2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        IVA (%) *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            value={ivaPorcentaje}
                                            onChange={(e) => setIvaPorcentaje(parseFloat(e.target.value) || 0)}
                                            disabled={isReadOnly}
                                            className={`w-full pl-4 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.ivaPorcentaje ? 'border-red-500' : 'border-gray-300'
                                                } ${isReadOnly ? 'bg-gray-100' : ''}`}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                                    </div>
                                    {errors.ivaPorcentaje && <p className="text-red-500 text-xs mt-1">{errors.ivaPorcentaje}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Ítems */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">2</span>
                                    Ítems de la Cotización
                                </h2>
                                {!isReadOnly && (
                                    <button
                                        type="button"
                                        onClick={handleAddItem}
                                        className="text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1 font-medium transition-colors"
                                    >
                                        <Plus className="h-4 w-4" /> Agregar Ítem
                                    </button>
                                )}
                            </div>

                            {errors.items && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{errors.items}</p>}

                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <div key={item.id} className="relative bg-gray-50 border border-gray-200 rounded-lg p-4 transition-all">
                                        {!isReadOnly && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="absolute top-4 right-4 text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                            <div className="md:col-span-6 pr-8">
                                                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                                                    Producto/Servicio *
                                                </label>
                                                {!isReadOnly ? (
                                                    <select
                                                        value={item.productId || ''}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            updateItem(item.id, 'productId', val);
                                                            if (!val) {
                                                                // reset to manual entry
                                                                updateItem(item.id, 'nombre', '');
                                                                updateItem(item.id, 'descripcion', '');
                                                                updateItem(item.id, 'precioUnitario', 0);
                                                            }
                                                        }}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 mb-2"
                                                    >
                                                        <option value="">-- Ingresar Manualmente --</option>
                                                        <optgroup label="Catálogo">
                                                            {products.map(p => (
                                                                <option key={p.id} value={p.id}>{p.nombre} (${p.precio})</option>
                                                            ))}
                                                        </optgroup>
                                                    </select>
                                                ) : null}
                                                <input
                                                    type="text"
                                                    value={item.nombre}
                                                    onChange={(e) => updateItem(item.id, 'nombre', e.target.value)}
                                                    readOnly={isReadOnly || !!item.productId}
                                                    placeholder="Nombre del servicio"
                                                    className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-blue-500 ${errors[`item_${index}_nombre`] ? 'border-red-500' : 'border-gray-300'
                                                        } ${(isReadOnly || !!item.productId) ? 'bg-gray-100 mb-2' : 'mb-2'}`}
                                                />
                                                <textarea
                                                    value={item.descripcion}
                                                    onChange={(e) => updateItem(item.id, 'descripcion', e.target.value)}
                                                    readOnly={isReadOnly}
                                                    placeholder="Descripción detallada (opcional)"
                                                    rows={1}
                                                    className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 resize-none ${isReadOnly ? 'bg-gray-100' : ''
                                                        }`}
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Cantidad *</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.cantidad}
                                                    onChange={(e) => updateItem(item.id, 'cantidad', parseFloat(e.target.value) || 0)}
                                                    readOnly={isReadOnly}
                                                    className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-blue-500 ${errors[`item_${index}_cantidad`] ? 'border-red-500' : 'border-gray-300'
                                                        } ${isReadOnly ? 'bg-gray-100' : ''}`}
                                                />
                                            </div>

                                            <div className="md:col-span-4">
                                                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Precio Unitario *</label>
                                                <div className="relative mb-2">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.precioUnitario}
                                                        onChange={(e) => updateItem(item.id, 'precioUnitario', parseFloat(e.target.value) || 0)}
                                                        readOnly={isReadOnly}
                                                        className={`w-full pl-7 pr-3 py-2 text-sm border rounded-md focus:ring-blue-500 ${errors[`item_${index}_precio`] ? 'border-red-500' : 'border-gray-300'
                                                            } ${isReadOnly ? 'bg-gray-100' : ''}`}
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="font-semibold text-gray-600">Total Item:</span>
                                                    <span className="font-bold text-gray-900">${(item.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {items.length === 0 && (
                                    <div className="text-center py-12 px-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                        <h3 className="text-gray-900 font-medium mb-1">No hay ítems agregados</h3>
                                        <p className="text-gray-500 text-sm mb-4">Haz clic en "Agregar Ítem" para comenzar a construir tu cotización o usa una plantilla.</p>
                                        {!isReadOnly && (
                                            <button
                                                type="button"
                                                onClick={handleAddItem}
                                                className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
                                            >
                                                <Plus className="h-4 w-4" /> Agregar Ítem Inicial
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Información Adicional */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4">
                                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">3</span>
                                Información Adicional
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Condiciones de Pago
                                    </label>
                                    <textarea
                                        value={condicionesPago}
                                        onChange={(e) => setCondicionesPago(e.target.value)}
                                        readOnly={isReadOnly}
                                        rows={2}
                                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none ${isReadOnly ? 'bg-gray-100' : ''}`}
                                        placeholder="Ej: 50% anticipo, 50% contra entrega"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notas Adicionales
                                    </label>
                                    <textarea
                                        value={notasAdicionales}
                                        onChange={(e) => setNotasAdicionales(e.target.value)}
                                        readOnly={isReadOnly}
                                        rows={2}
                                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none ${isReadOnly ? 'bg-gray-100' : ''}`}
                                        placeholder="Información adicional, aclaraciones, etc."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Términos y Condiciones
                                    </label>
                                    <textarea
                                        value={terminosCondiciones}
                                        onChange={(e) => setTerminosCondiciones(e.target.value)}
                                        readOnly={isReadOnly}
                                        rows={3}
                                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none ${isReadOnly ? 'bg-gray-100' : ''}`}
                                        placeholder="Términos legales"
                                    />
                                </div>
                            </div>

                            {/* Métodos de Pago */}
                            <div className="pt-4 border-t border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-gray-500" />
                                    Métodos de Pago Aceptados
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {PAYMENT_METHODS.map(method => (
                                        <label key={method} className={`flex items-center space-x-2 p-2 rounded border transition-colors ${metodosPagoAceptados.includes(method) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                                            } ${(isReadOnly && !metodosPagoAceptados.includes(method)) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                            <input
                                                type="checkbox"
                                                checked={metodosPagoAceptados.includes(method)}
                                                onChange={() => !isReadOnly && togglePaymentMethod(method)}
                                                disabled={isReadOnly}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                            />
                                            <span className="text-sm font-medium text-gray-700">{method}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column - Summary & Company Data sticky */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-xl shadow-lg shadow-blue-900/5 border border-blue-100 p-6 sticky top-24">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-3">Resumen de Cotización</h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>IVA ({ivaPorcentaje}%)</span>
                                    <span className="font-medium">${ivaTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-gray-900">Total</span>
                                        <span className="text-2xl font-black text-blue-600">
                                            ${totalVenta.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-right text-gray-500 mt-1">Sujeto a los términos y vigencia</p>
                                </div>

                                {!isReadOnly && (
                                    <button
                                        onClick={handleSendQuote}
                                        className="w-full mt-6 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors font-bold shadow-md shadow-blue-600/20"
                                    >
                                        <Send className="h-5 w-5" />
                                        Confirmar y Enviar
                                    </button>
                                )}
                            </div>

                            {/* Company Info Box */}
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <h4 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                    Info. de la Empresa
                                </h4>
                                <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600 space-y-2">
                                    <p className="font-bold text-gray-800 text-sm">INNOMIND</p>
                                    <p>Av. José María Martínez 1309<br />Col. Centro, Tamazula, Jal.<br />CP 49650</p>
                                    <p>+52 4432138917</p>
                                    <p className="text-blue-600">ia.innomind@gmail.com</p>
                                    <p className="pt-2 font-medium text-gray-500">RFC: AANJ970723PN5</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Template Modal */}
            {showTemplateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Usar Plantilla</h3>
                                <p className="text-sm text-gray-500">Selecciona una plantilla para cargar sus datos</p>
                            </div>
                            <button
                                onClick={() => setShowTemplateModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto bg-white">
                            <div className="relative mb-6">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={templateSearch}
                                    onChange={(e) => setTemplateSearch(e.target.value)}
                                    placeholder="Buscar plantillas por nombre o descripción..."
                                    className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                />
                            </div>

                            <div className="space-y-3">
                                {filteredTemplates.map(template => (
                                    <button
                                        key={template.id}
                                        onClick={() => applyTemplate(template)}
                                        className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md hover:bg-blue-50/50 transition-all group"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{template.nombre}</h4>
                                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                                                {template.items.length} ítems
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{template.descripcion}</p>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-medium text-gray-900">${template.totalEstimado.toLocaleString()}</span>
                                            <span className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-medium">
                                                Usar plantilla <CheckCircle className="h-4 w-4" />
                                            </span>
                                        </div>
                                    </button>
                                ))}
                                {filteredTemplates.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        No se encontraron plantillas.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

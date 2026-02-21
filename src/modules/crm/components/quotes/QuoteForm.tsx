import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Send, Plus, Trash2, FileText, CreditCard, Package, Receipt, Info, MapPin } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { useInventory } from '@/context/InventoryContext';
import { Quote, QuoteItem, QuoteTemplate } from '@/types';

interface QuoteFormProps {
    onClose: () => void;
    editingQuote?: Quote;
}

const PAYMENT_METHODS = [
    'Transferencia bancaria', 'PayPal', 'Stripe', 'Tarjeta de crédito', 'Efectivo', 'Cheque'
];

export default function QuoteForm({ onClose, editingQuote }: QuoteFormProps) {
    const { addQuote, updateQuote, prospects, quoteTemplates } = useCRM();
    const { products } = useInventory();

    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [templateSearch, setTemplateSearch] = useState('');
    const [saveSuccess, setSaveSuccess] = useState('');

    const [prospectId, setProspectId] = useState('');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
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
            setIvaPorcentaje(editingQuote.ivaPorcentaje ?? 16);
            setItems(editingQuote.items || []);
            setCondicionesPago(editingQuote.condicionesPago || '');
            setNotasAdicionales(editingQuote.notasAdicionales || '');
            setTerminosCondiciones(editingQuote.terminosCondiciones || '');
            setMetodosPagoAceptados(editingQuote.metodosPagoAceptados || []);
        }
    }, [editingQuote]);

    const isReadOnly = editingQuote?.estado === 'Aceptada' || editingQuote?.estado === 'Vencida';

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
                total: 0
            }
        ]);
    };

    const handleRemoveItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const calculateItemTotal = (qty: number, price: number, discount: number = 0, discountType: 'porcentaje' | 'monto' = 'porcentaje') => {
        const subtotalBase = qty * price;
        const discountAmount = discountType === 'porcentaje' ? subtotalBase * (discount / 100) : discount;
        return Math.max(0, subtotalBase - discountAmount);
    };

    const updateItem = (id: string, field: keyof QuoteItem, value: any) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };

                if (field === 'productId' && value) {
                    const product = products.find(p => p.id === value);
                    if (product) {
                        updatedItem.nombre = product.nombre;
                        updatedItem.descripcion = product.descripcion || '';
                        updatedItem.precioUnitario = product.precio;
                    }
                }

                const qty = typeof updatedItem.cantidad === 'number' ? updatedItem.cantidad : 0;
                const pu = typeof updatedItem.precioUnitario === 'number' ? updatedItem.precioUnitario : 0;
                const desc = typeof updatedItem.descuento === 'number' ? updatedItem.descuento : 0;
                const typeDesc = updatedItem.tipoDescuento || 'porcentaje';

                updatedItem.total = calculateItemTotal(qty, pu, desc, typeDesc);
                return updatedItem;
            }
            return item;
        }));
    };

    const applyTemplate = (template: QuoteTemplate) => {
        const newItems: QuoteItem[] = template.items.map(tItem => ({
            id: Math.random().toString(36).substr(2, 9),
            productId: tItem.productId,
            nombre: tItem.nombre,
            descripcion: tItem.descripcion,
            cantidad: tItem.cantidad,
            precioUnitario: tItem.precioUnitario,
            descuento: tItem.descuento || 0,
            tipoDescuento: tItem.tipoDescuento || 'porcentaje',
            total: calculateItemTotal(tItem.cantidad, tItem.precioUnitario, tItem.descuento || 0, tItem.tipoDescuento || 'porcentaje')
        }));

        setItems(newItems);
        if (template.condicionesPago) setCondicionesPago(template.condicionesPago);
        if (template.notasAdicionales) setNotasAdicionales(template.notasAdicionales);
        if (template.terminosCondiciones) setTerminosCondiciones(template.terminosCondiciones);
        if (template.metodosPagoAceptados) setMetodosPagoAceptados(template.metodosPagoAceptados);
        setShowTemplateModal(false);
    };

    const togglePaymentMethod = (method: string) => {
        if (isReadOnly) return;
        setMetodosPagoAceptados(prev =>
            prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
        );
    };

    // Cálculos
    const subtotalBruto = items.reduce((sum, item) => sum + ((item.cantidad || 0) * (item.precioUnitario || 0)), 0);
    const subtotalConDescuentos = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const totalDescuentos = subtotalBruto - subtotalConDescuentos;
    const ivaTotal = subtotalConDescuentos * (ivaPorcentaje / 100);
    const totalVenta = subtotalConDescuentos + ivaTotal;

    const selectedProspect = prospects.find(p => p.id === prospectId);

    const validate = (draft = false) => {
        const newErrors: Record<string, string> = {};

        if (!draft) {
            if (!prospectId) newErrors.prospectId = 'Seleccion requerido';
            if (!fecha) newErrors.fecha = 'Requerido';
            if (!vigencia) newErrors.vigencia = 'Requerido';

            if (items.length === 0) {
                newErrors.items = 'Agregue al menos un ítem';
            } else {
                items.forEach((item, index) => {
                    if (!item.nombre?.trim()) newErrors[`item_${index}_nombre`] = 'Requerido';
                });
            }
        } else {
            if (!prospectId && !editingQuote) newErrors.prospectId = 'Seleccione cliente';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const saveQuote = (status: Quote['estado'], showSendToast = false) => {
        if (!validate(status === 'Borrador')) return;

        const quoteData = {
            prospectId,
            numero: editingQuote?.numero || `COT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
            fecha: new Date(fecha),
            vigencia: new Date(vigencia),
            items,
            subtotal: subtotalConDescuentos,
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
            if (!showSendToast) {
                setSaveSuccess('Guardado con éxito');
                setTimeout(() => setSaveSuccess(''), 3000);
            } else {
                alert('Cotización enviada (Simulado)');
                onClose();
            }
        } else {
            addQuote(quoteData);
            alert(status === 'Borrador' ? 'Borrador guardado' : 'Cotización enviada');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-gray-100 flex flex-col animate-in fade-in duration-200">
            {/* Cabecera */}
            <div className="bg-white px-6 py-4 flex items-center justify-between border-b shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 leading-tight">
                            {editingQuote ? `Cotización ${editingQuote.numero}` : 'Nueva Cotización'}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {editingQuote?.estado ? `Estado: ${editingQuote.estado}` : 'Crea una propuesta comercial profesional'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {!editingQuote && (
                        <button onClick={() => setShowTemplateModal(true)} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                            <FileText size={16} /> Usar Plantilla
                        </button>
                    )}
                    {!isReadOnly && (
                        <>
                            <button onClick={(e) => { e.preventDefault(); saveQuote(editingQuote?.estado === 'Enviada' ? 'Actualizada' : (editingQuote?.estado || 'Borrador'), false); }} className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 flex items-center gap-2">
                                <Save size={16} /> {editingQuote ? 'Guardar Cambios' : 'Borrador'}
                            </button>
                            <button onClick={(e) => { e.preventDefault(); saveQuote(editingQuote?.estado === 'Enviada' ? 'Actualizada' : 'Enviada', true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-200">
                                <Send size={16} /> Enviar
                            </button>
                        </>
                    )}
                </div>
            </div>

            {saveSuccess && <div className="bg-green-500 text-white text-center py-2 text-sm font-medium">{saveSuccess}</div>}

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                {/* Panel Izquierdo: Constructor */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

                    {/* Cliente y Fechas */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Info size={16} /> Datos Principales
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cliente</label>
                                <select
                                    value={prospectId}
                                    onChange={(e) => setProspectId(e.target.value)}
                                    disabled={isReadOnly}
                                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm outline-none transition-all ${errors.prospectId ? 'border-red-300 focus:border-red-500 ring-4 ring-red-50' : 'border-gray-200 focus:border-blue-500 focus:bg-white ring-4 ring-transparent focus:ring-blue-50'}`}
                                >
                                    <option value="">Seleccionar Prospecto</option>
                                    {prospects.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.empresa ? `- ${p.empresa}` : ''}</option>)}
                                </select>
                                {errors.prospectId && <p className="text-red-500 text-xs mt-1 font-medium">{errors.prospectId}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fecha Emisión</label>
                                <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} disabled={isReadOnly} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:bg-white outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vigencia Hasta</label>
                                <input type="date" value={vigencia} onChange={(e) => setVigencia(e.target.value)} disabled={isReadOnly} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:bg-white outline-none transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Editor de Items */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <Package size={16} /> Productos y Servicios
                            </h2>
                            {!isReadOnly && (
                                <button onClick={handleAddItem} className="text-sm bg-blue-50 text-blue-700 font-semibold px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-2">
                                    <Plus size={16} /> Añadir Fila
                                </button>
                            )}
                        </div>

                        {errors.items && <p className="text-red-500 text-sm mb-4 font-medium">{errors.items}</p>}

                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div key={item.id} className="group relative bg-white border border-gray-200 rounded-xl shadow-sm hover:border-blue-300 transition-all p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
                                    {!isReadOnly && (
                                        <button onClick={() => handleRemoveItem(item.id)} className="absolute -top-3 -right-3 bg-red-100 text-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10">
                                            <Trash2 size={16} />
                                        </button>
                                    )}

                                    {/* Item Info */}
                                    <div className="md:col-span-5 flex flex-col gap-2">
                                        {!isReadOnly && (
                                            <select
                                                value={item.productId || ''}
                                                onChange={(e) => {
                                                    updateItem(item.id, 'productId', e.target.value);
                                                    if (!e.target.value) {
                                                        updateItem(item.id, 'nombre', '');
                                                        updateItem(item.id, 'descripcion', '');
                                                        updateItem(item.id, 'precioUnitario', 0);
                                                    }
                                                }}
                                                className="w-full text-sm px-3 py-2 bg-gray-50 border-gray-200 rounded-lg outline-none focus:border-blue-500"
                                            >
                                                <option value="">Opción Personalizada...</option>
                                                {products.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                            </select>
                                        )}
                                        <input
                                            value={item.nombre}
                                            onChange={(e) => updateItem(item.id, 'nombre', e.target.value)}
                                            disabled={isReadOnly || !!item.productId}
                                            placeholder="Nombre del concepto"
                                            className={`font-semibold text-gray-900 border-none px-0 py-1 bg-transparent focus:ring-0 w-full placeholder-gray-300 ${errors[`item_${index}_nombre`] ? 'placeholder-red-300' : ''}`}
                                        />
                                        <textarea
                                            value={item.descripcion}
                                            onChange={(e) => updateItem(item.id, 'descripcion', e.target.value)}
                                            disabled={isReadOnly}
                                            placeholder="Detalles (opcional)"
                                            rows={1}
                                            className="text-sm text-gray-500 border-none px-0 py-0 bg-transparent focus:ring-0 resize-none w-full placeholder-gray-300"
                                        />
                                    </div>

                                    {/* Math */}
                                    <div className="md:col-span-7 grid grid-cols-4 gap-3 items-start border-l pl-4 border-gray-100">
                                        <div className="col-span-1">
                                            <label className="text-xs text-gray-400 block mb-1">Cant.</label>
                                            <input type="number" min="1" value={item.cantidad || ''} onChange={(e) => updateItem(item.id, 'cantidad', parseFloat(e.target.value) || 0)} disabled={isReadOnly} className="w-full p-2 text-sm bg-gray-50 rounded-lg border-transparent focus:border-blue-500 focus:bg-white outline-none" />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="text-xs text-gray-400 block mb-1">P. Unitario</label>
                                            <input type="number" min="0" value={item.precioUnitario || ''} onChange={(e) => updateItem(item.id, 'precioUnitario', parseFloat(e.target.value) || 0)} disabled={isReadOnly} className="w-full p-2 text-sm bg-gray-50 rounded-lg border-transparent focus:border-blue-500 focus:bg-white outline-none" />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="text-xs text-gray-400 block mb-1">Desc.</label>
                                            <div className="flex bg-gray-50 border-transparent rounded-lg focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 overflow-hidden border">
                                                <input type="number" min="0" value={item.descuento || ''} onChange={(e) => updateItem(item.id, 'descuento', parseFloat(e.target.value) || 0)} disabled={isReadOnly} className="w-full p-2 text-sm bg-transparent border-none outline-none focus:ring-0" />
                                                <button onClick={() => !isReadOnly && updateItem(item.id, 'tipoDescuento', item.tipoDescuento === 'porcentaje' ? 'monto' : 'porcentaje')} disabled={isReadOnly} className="px-2 text-xs font-semibold text-gray-500 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 transition-colors border-l">
                                                    {item.tipoDescuento === 'porcentaje' ? '%' : '$'}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="col-span-1 text-right">
                                            <label className="text-xs text-gray-400 block mb-1">Subtotal</label>
                                            <div className="font-bold text-gray-900 mt-2">${(item.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {items.length === 0 && (
                                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                    <Receipt className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                                    <p className="text-gray-500 text-sm">No hay conceptos en la cotización.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Condiciones */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <CreditCard size={16} /> Términos y Pagos
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Condiciones de Pago</label>
                                <textarea value={condicionesPago} onChange={(e) => setCondicionesPago(e.target.value)} disabled={isReadOnly} rows={2} className="w-full px-4 py-2 bg-gray-50 border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white resize-none border" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notas Adicionales</label>
                                <textarea value={notasAdicionales} onChange={(e) => setNotasAdicionales(e.target.value)} disabled={isReadOnly} rows={2} className="w-full px-4 py-2 bg-gray-50 border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white resize-none border" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Términos Legales</label>
                                <textarea value={terminosCondiciones} onChange={(e) => setTerminosCondiciones(e.target.value)} disabled={isReadOnly} rows={2} className="w-full px-4 py-2 bg-gray-50 border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white resize-none border" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Métodos de Pago Aceptados</label>
                                <div className="flex flex-wrap gap-2">
                                    {PAYMENT_METHODS.map(method => (
                                        <button
                                            key={method}
                                            type="button"
                                            onClick={() => togglePaymentMethod(method)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${metodosPagoAceptados.includes(method) ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            {method}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel Derecho: Resumen */}
                <div className="w-full lg:w-96 bg-gray-50 border-l px-6 py-8 flex flex-col justify-between">
                    <div>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
                            <h3 className="font-bold text-gray-900 mb-4 border-b pb-3">Resumen Financiero</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal Base</span>
                                    <span>${subtotalBruto.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                {totalDescuentos > 0 && (
                                    <div className="flex justify-between text-red-500 font-medium">
                                        <span>Descuentos</span>
                                        <span>-${totalDescuentos.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-800 font-medium pt-2 border-t border-dashed">
                                    <span>Subtotal Final</span>
                                    <span>${subtotalConDescuentos.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-600 pb-3 border-b">
                                    <div className="flex items-center gap-2">
                                        <span>IVA</span>
                                        <input type="number" value={ivaPorcentaje} onChange={(e) => setIvaPorcentaje(parseFloat(e.target.value) || 0)} disabled={isReadOnly} className="w-14 px-1 py-0.5 border rounded text-xs text-center" /> %
                                    </div>
                                    <span>${ivaTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-gray-500 font-semibold uppercase tracking-wider text-xs">Total</span>
                                    <span className="text-3xl font-black text-blue-600 tracking-tight">
                                        ${totalVenta.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {selectedProspect && (
                            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                                <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-1.5"><MapPin size={14} /> Cliente</h4>
                                <p className="font-bold text-gray-900">{selectedProspect.nombre}</p>
                                <p className="text-sm text-gray-600">{selectedProspect.empresa}</p>
                            </div>
                        )}
                    </div>

                    {!isReadOnly && (
                        <button onClick={(e) => { e.preventDefault(); saveQuote(editingQuote?.estado === 'Enviada' ? 'Actualizada' : 'Enviada', true); }} className="w-full mt-6 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3.5 rounded-xl hover:bg-blue-700 transition-colors font-bold shadow-lg shadow-blue-600/30">
                            <Send size={18} /> Confirmar Cotización
                        </button>
                    )}
                </div>
            </div>

            {/* Modal de Plantillas */}
            {showTemplateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[80vh] flex flex-col">
                        <div className="p-5 border-b flex justify-between items-center">
                            <h3 className="font-bold text-lg">Catálogo de Plantillas</h3>
                            <button onClick={() => setShowTemplateModal(false)} className="p-1 hover:bg-gray-100 rounded-md"><ArrowLeft size={20} /></button>
                        </div>
                        <div className="p-5 flex-1 overflow-y-auto">
                            <input
                                type="text" placeholder="Buscar plantillas..."
                                value={templateSearch} onChange={(e) => setTemplateSearch(e.target.value)}
                                className="w-full px-4 py-2 border rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <div className="space-y-3">
                                {quoteTemplates.filter(t => t.nombre.toLowerCase().includes(templateSearch.toLowerCase())).map(t => (
                                    <button key={t.id} onClick={() => applyTemplate(t)} className="w-full text-left p-4 border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors group">
                                        <div className="font-bold text-gray-900 mb-1">{t.nombre}</div>
                                        <div className="text-sm text-gray-500 truncate">{t.descripcion}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

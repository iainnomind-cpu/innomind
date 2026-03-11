import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useProcurement } from '@/context/ProcurementContext';
import {
    ArrowLeft,
    FileText,
    Calendar,
    User,
    Package,
    CheckCircle,
    XCircle,
    Truck,
    Save,
    Upload,
    Eye,
    AlertCircle,
    ShieldCheck,
    Clock,
    Printer,
    Download
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PurchaseOrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { suppliers } = useProcurement();

    const [order, setOrder] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        function isUUID(value: string) {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            return uuidRegex.test(value);
        }

        const fetchOrderData = async () => {
            if (!id || !isUUID(id)) {
                console.error("Invalid order id:", id);
                navigate("/compras/ordenes");
                return;
            }

            try {
                setLoading(true);
                // Fetch Order
                const { data: orderData, error: orderError } = await supabase
                    .from('purchase_orders')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (orderError) throw orderError;
                setOrder(orderData);

                // Fetch Items
                const { data: itemsData, error: itemsError } = await supabase
                    .from('purchase_order_items')
                    .select('*')
                    .eq('purchase_order_id', id);

                if (itemsError) throw itemsError;
                setItems(itemsData || []);
            } catch (err: any) {
                console.error("Error fetching order detail:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderData();
    }, [id, navigate]);

    const handleUnitPriceChange = (itemId: string, newPrice: number) => {
        setItems(prevItems => prevItems.map(item => {
            if (item.id === itemId) {
                const quantity = item.cantidad_solicitada || item.cantidadSolicitada || 0;
                return {
                    ...item,
                    precio_unitario: newPrice,
                    total_linea: quantity * newPrice
                };
            }
            return item;
        }));
    };

    const handleSaveOrder = async () => {
        if (!order || !id) return;
        setSaving(true);
        try {
            // Calculate new totals
            const subtotal = items.reduce((acc, item) => acc + (item.total_linea || 0), 0);
            const impuestos = subtotal * 0.16;
            const monto_total = subtotal + impuestos;

            // Update items in DB
            for (const item of items) {
                const { error: itemError } = await supabase
                    .from('purchase_order_items')
                    .update({
                        precio_unitario: item.precio_unitario,
                        total_linea: item.total_linea
                    })
                    .eq('id', item.id);
                if (itemError) throw itemError;
            }

            // Update order in DB
            const { error: orderError } = await supabase
                .from('purchase_orders')
                .update({
                    subtotal,
                    impuestos,
                    monto_total,
                    precio_real: order.precio_real
                })
                .eq('id', id);

            if (orderError) throw orderError;

            setOrder((prev: any) => ({ ...prev, subtotal, impuestos, monto_total }));
            alert("Cambios guardados exitosamente.");
        } catch (err: any) {
            console.error("Error saving order:", err);
            alert("Error al guardar: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !id) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `evidence_${Date.now()}.${fileExt}`;
            const filePath = `purchase-orders/${id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('purchase-evidence')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('purchase-evidence')
                .getPublicUrl(filePath);

            // Save URL to DB
            const { error: dbError } = await supabase
                .from('purchase_orders')
                .update({ evidencia_url: publicUrl })
                .eq('id', id);

            if (dbError) throw dbError;

            setOrder((prev: any) => ({ ...prev, evidencia_url: publicUrl }));
            alert("Factura cargada correctamente.");
        } catch (err: any) {
            console.error("Error uploading evidence:", err);
            alert("Error al subir archivo: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSendToReview = async () => {
        if (!id || !order.precio_real || !order.evidencia_url) return;

        try {
            const { error } = await supabase.from('purchase_orders')
                .update({
                    estado: 'sent',
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;
            setOrder((prev: any) => ({ ...prev, estado: 'sent' }));
            alert("Orden enviada a revisión gerencial.");
        } catch (err: any) {
            alert("Error al enviar a revisión: " + err.message);
        }
    };

    const getStatusBadge = (status: string) => {
        const s = status?.toLowerCase();
        switch (s) {
            case 'pending':
                return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium flex items-center gap-1.5"><Clock size={14} /> Pendiente</span>;
            case 'approved':
                return <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium flex items-center gap-1.5"><CheckCircle size={14} /> Aprobada</span>;
            case 'received':
                return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium flex items-center gap-1.5"><Truck size={14} /> Recibida</span>;
            case 'sent':
                return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1.5"><FileText size={14} /> Enviada</span>;
            case 'cancelled':
                return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center gap-1.5"><XCircle size={14} /> Cancelada</span>;
            default:
                return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">{status}</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="p-8 text-center bg-slate-50 min-h-screen">
                <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <XCircle className="mx-auto text-red-500 mb-4" size={48} />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error al cargar la orden</h2>
                    <p className="text-gray-500 mb-6">{error || "No se pudo encontrar la orden de compra solicitada."}</p>
                    <button
                        onClick={() => navigate('/compras/ordenes')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                        Volver a Listado
                    </button>
                </div>
            </div>
        );
    }

    const supplier = suppliers.find(s => s.id === (order.proveedor_id || order.proveedorId));
    const canSendToReview = order.precio_real > 0 && order.evidencia_url && order.estado === 'pending';

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/compras/ordenes')}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-gray-500"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-lg font-bold text-gray-900">
                            Orden <span className="text-blue-600">#{order.numero_orden || order.numeroOrden}</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSaveOrder}
                            disabled={saving}
                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            <Save size={18} /> {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Items Table */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/50 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Package className="text-slate-400" size={18} /> Artículos de la Orden
                            </h3>
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{items.length} Conceptos</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white border-b border-gray-100">
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Descripción</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-center w-24">Cantidad</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right w-32">Precio Unit.</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right w-32">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {items.map((item, idx) => (
                                        <tr key={item.id || idx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900">{item.descripcion}</div>
                                                <div className="text-xs text-slate-400">ID: {item.product_id?.slice(0, 8) || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center text-slate-600 font-medium">
                                                {item.cantidad_solicitada || item.cantidadSolicitada}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <span className="text-xs text-slate-400">$</span>
                                                    <input
                                                        type="number"
                                                        value={item.precio_unitario || 0}
                                                        onChange={(e) => handleUnitPriceChange(item.id, parseFloat(e.target.value) || 0)}
                                                        className="w-24 px-2 py-1 text-right text-slate-900 font-medium border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-slate-900 font-bold">
                                                ${(item.total_linea || item.totalLinea || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-8 bg-slate-50/30 border-t border-gray-100 flex justify-end">
                            <div className="w-64 space-y-3">
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Subtotal Estimado</span>
                                    <span className="font-medium text-slate-900">${(order.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>IVA (16%)</span>
                                    <span className="font-medium text-slate-900">${(order.impuestos || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="pt-3 border-t border-slate-200 flex justify-between">
                                    <span className="text-lg font-bold text-slate-900">Total Est.</span>
                                    <span className="text-lg font-bold text-blue-600">
                                        ${(order.monto_total || order.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} {order.currency || 'MXN'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Costo Real & Evidence */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <AlertCircle className="text-blue-500" size={18} /> Costo Real y Comprobante
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Precio Real de Compra (Monto Final)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                        <input
                                            type="number"
                                            value={order.precio_real || ''}
                                            onChange={(e) => setOrder({ ...order, precio_real: parseFloat(e.target.value) || 0 })}
                                            placeholder="0.00"
                                            className="w-full pl-7 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg text-slate-900 transition-all"
                                        />
                                    </div>
                                    <p className="mt-2 text-[10px] text-slate-400 italic">* Registre el monto exacto pagado al proveedor según factura.</p>
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-3 text-center">Evidencia de Compra</label>

                                    {order.evidencia_url ? (
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700">
                                                <CheckCircle size={20} />
                                                <span className="text-sm font-medium flex-1">Comprobante cargado</span>
                                                <button
                                                    onClick={() => window.open(order.evidencia_url)}
                                                    className="p-1.5 hover:bg-emerald-100 rounded-lg transition-colors"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </div>
                                            <label className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer text-center">
                                                Reemplazar archivo
                                                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} disabled={uploading} />
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <input
                                                type="file"
                                                id="evidence-upload"
                                                className="hidden"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={handleFileUpload}
                                                disabled={uploading}
                                            />
                                            <label
                                                htmlFor="evidence-upload"
                                                className={`flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <Upload className={uploading ? "animate-bounce text-blue-500" : "text-slate-400"} size={32} />
                                                <div className="text-center">
                                                    <p className="text-sm font-bold text-slate-900">{uploading ? 'Subiendo...' : 'Subir Ticket o Factura'}</p>
                                                    <p className="text-xs text-slate-400 mt-1">PDF, JPG o PNG máximo 5MB</p>
                                                </div>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-2xl shadow-lg p-6 text-white flex flex-col justify-between">
                            <div>
                                <h4 className="font-bold mb-2 flex items-center gap-2">
                                    <Clock className="text-slate-400" size={18} /> Gestión de Aprobación
                                </h4>
                                <p className="text-slate-400 text-sm mb-6">
                                    Para aprobar la orden es necesario registrar el **Precio Real** y adjuntar la **Evidencia** de la compra realizada.
                                </p>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1 rounded-full ${order.precio_real > 0 ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                                            <CheckCircle size={14} className="text-white" />
                                        </div>
                                        <span className={`text-sm ${order.precio_real > 0 ? 'text-white' : 'text-slate-500'}`}>Importe Real registrado</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1 rounded-full ${order.evidencia_url ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                                            <CheckCircle size={14} className="text-white" />
                                        </div>
                                        <span className={`text-sm ${order.evidencia_url ? 'text-white' : 'text-slate-500'}`}>Comprobante cargado</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 border-t border-gray-100">
                                <button
                                    onClick={handleSendToReview}
                                    disabled={!canSendToReview}
                                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${canSendToReview
                                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                        }`}
                                >
                                    <ShieldCheck size={20} />
                                    Enviar a Revisión
                                </button>
                                <p className="text-center text-xs text-slate-400 mt-3 font-medium">
                                    * Se requiere precio real y evidencia para enviar
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Summary Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Detalles de la Orden</h3>

                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                    <Package size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-400 uppercase">Estado Actual</p>
                                    <div className="mt-1">{getStatusBadge(order.estado || 'pending')}</div>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl">
                                    <User size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-slate-400 uppercase">Proveedor</p>
                                    <p className="font-bold text-slate-900 mt-0.5">{supplier?.nombreComercial || 'Cargando...'}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{supplier?.rfc || 'Sin RFC registrado'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-400 uppercase">Fecha de Emisión</p>
                                    <p className="font-bold text-slate-900 mt-0.5">
                                        {order.created_at ? format(new Date(order.created_at), "PPP", { locale: es }) : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {order.estimated_delivery_date && (
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                                        <Truck size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-400 uppercase">Fecha Entrega Esperada</p>
                                        <p className="font-bold text-slate-900 mt-0.5">
                                            {format(new Date(order.estimated_delivery_date), "PPP", { locale: es })}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Printer/Export */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex gap-2">
                        <button className="flex-1 py-2 text-gray-700 hover:bg-slate-50 rounded-lg transition-colors border border-gray-200 text-sm font-medium flex items-center justify-center gap-2">
                            <Printer size={16} /> Imprimir
                        </button>
                        <button className="flex-1 py-2 text-gray-700 hover:bg-slate-50 rounded-lg transition-colors border border-gray-200 text-sm font-medium flex items-center justify-center gap-2">
                            <Download size={16} /> Exportar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

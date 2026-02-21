import React, { useState } from 'react';
import { ArrowLeft, Edit, Download, Send, FileText, Calendar, User, Loader2, CheckCircle, Receipt } from 'lucide-react';
import { Quote } from '@/types';
import { format } from 'date-fns';
import { useCRM } from '@/context/CRMContext';
import { useInventory } from '@/context/InventoryContext';
import { useFinance } from '@/context/FinanceContext';
import { useUsers } from '@/context/UserContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import QuotePDF from './QuotePDF';

interface QuoteDetailProps {
    quote: Quote;
    onClose: () => void;
    onEdit: () => void;
}

const safeFormat = (value: any, fmt = 'dd/MM/yyyy') => {
    if (!value) return '-';
    try {
        let dateObj;
        if (value instanceof Date) {
            dateObj = value;
        } else if (value && typeof value.toDate === 'function') {
            dateObj = value.toDate();
        } else {
            dateObj = new Date(value);
        }
        return isNaN(dateObj.getTime()) ? '-' : format(dateObj, fmt);
    } catch {
        return '-';
    }
};

const QuoteDetail: React.FC<QuoteDetailProps> = ({ quote, onClose, onEdit }) => {
    const { prospects, updateQuote } = useCRM();
    const { companyProfile } = useUsers();
    const { products, locations, registerMovement } = useInventory();
    const { documents, addDocument } = useFinance();
    const prospect = prospects.find(p => p.id === quote.prospectId);

    const hasNotaCargo = documents.some(d => d.quoteId === quote.id && d.tipo === 'NOTA_CARGO');

    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    // @ts-ignore
    const isExpired = quote.vigencia ? new Date() > new Date(quote.vigencia) && quote.estado === 'Enviada' : false;
    const displayStatus = isExpired ? 'Vencida' : quote.estado;

    const generatePDF = async () => {
        const input = document.getElementById(`quote-pdf-${quote.id}`);
        if (!input) return;

        setIsGeneratingPDF(true);
        try {
            const canvas = await html2canvas(input, {
                scale: 2, // High resolution
                useCORS: true,
                logging: false
            });

            const imgData = canvas.toDataURL('image/jpeg', 1.0);

            // A4 size: 210 x 297 mm
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Cotizacion_${quote.numero}_${companyProfile.nombreEmpresa.replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Hubo un error al generar el PDF. Por favor, intente de nuevo.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handleAcceptQuote = async () => {
        if (!confirm('¿Estás seguro de marcar esta cotización como Aceptada?\nSe descontará el stock de los productos físicos según corresponda.')) return;

        try {
            updateQuote(quote.id, { estado: 'Aceptada' });

            const defaultLocation = locations.find(l => l.tipo === 'Principal') || locations[0];

            if (defaultLocation) {
                for (const item of quote.items || []) {
                    if (!item.productId) continue;

                    const product = products.find(p => p.id === item.productId);
                    if (product && product.tipo === 'fisico' && product.trackInventory) {
                        await registerMovement({
                            productId: product.id,
                            locationId: defaultLocation.id,
                            tipoMovimiento: 'SALIDA_VENTA',
                            cantidad: item.cantidad || 1,
                            costoUnitario: typeof item.precioUnitario === 'number' ? item.precioUnitario : 0,
                            notas: `Venta según cotización ${quote.numero}`,
                            referenceId: quote.numero
                        });
                    }
                }
            }
            alert('Cotización aceptada y stock actualizado (si aplica).');
        } catch (error) {
            console.error('Error al aceptar cotización:', error);
            alert('Error al procesar la aceptación.');
        }
    };

    const handleGenerateNotaCargo = async () => {
        if (!confirm('¿Generar Nota de Cargo por el total de esta cotización?')) return;

        try {
            await addDocument({
                tipo: 'NOTA_CARGO',
                estado: 'PENDIENTE',
                numeroFolio: `NC-${quote.numero}`,
                montoTotal: quote.total,
                moneda: 'MXN', // For V1 assuming MXN
                fechaEmision: new Date(),
                prospectId: quote.prospectId,
                quoteId: quote.id,
                concepto: `Cobro por Cotización ${quote.numero}`,
            });
            alert('Nota de Cargo generada exitosamente. Puedes verla en Finanzas -> Cuentas por Cobrar.');
        } catch (error) {
            console.error('Error generating document:', error);
            alert('Hubo un error al generar la Nota de Cargo.');
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto relative">
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={onClose}
                    className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Volver a cotizaciones
                </button>

                <div className="flex gap-2">
                    {!isExpired && displayStatus !== 'Aceptada' && displayStatus !== 'Rechazada' && (
                        <button
                            onClick={handleAcceptQuote}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                        >
                            <CheckCircle className="h-4 w-4" /> Aceptar
                        </button>
                    )}
                    {displayStatus === 'Aceptada' && !hasNotaCargo && (
                        <button
                            onClick={handleGenerateNotaCargo}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm"
                        >
                            <Receipt className="h-4 w-4" /> Generar Nota de Cargo
                        </button>
                    )}
                    {hasNotaCargo && (
                        <span className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg font-medium text-sm">
                            <CheckCircle className="h-4 w-4" /> Nota de Cargo Creada
                        </span>
                    )}
                    <button
                        onClick={onEdit}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                        <Edit className="h-4 w-4" /> Editar
                    </button>
                    <button
                        onClick={generatePDF}
                        disabled={isGeneratingPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isGeneratingPDF ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        {isGeneratingPDF ? 'Generando...' : 'Descargar PDF'}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
                        <Send className="h-4 w-4" /> Enviar
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    Cotización #{quote.numero}
                                </h1>
                                <p className="text-gray-600">Cliente: <span className="font-semibold text-gray-900">{prospect?.nombre || 'Desconocido'}</span></p>
                                {prospect?.empresa && <p className="text-sm text-gray-500">{prospect.empresa}</p>}
                            </div>

                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${displayStatus === 'Borrador' ? 'bg-gray-100 text-gray-800' :
                                displayStatus === 'Enviada' ? 'bg-blue-100 text-blue-800' :
                                    displayStatus === 'Aceptada' ? 'bg-green-100 text-green-800' :
                                        displayStatus === 'Rechazada' ? 'bg-red-100 text-red-800' :
                                            'bg-orange-100 text-orange-800'
                                }`}>
                                {displayStatus}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
                            <div className="flex items-center text-gray-600">
                                <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Emisión</div>
                                    <div className="font-medium text-gray-900">{safeFormat(quote.fecha)}</div>
                                </div>
                            </div>

                            <div className="flex items-center text-gray-600">
                                <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Vigencia</div>
                                    <div className={`font-medium ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                                        {safeFormat(quote.vigencia)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-3">Ítems de la Cotización</h3>

                        <div className="space-y-4">
                            {(quote.items || []).map((item) => (
                                <div key={item.id} className="p-4 bg-gray-50 border border-gray-200 rounded-xl relative">
                                    <div className="absolute top-4 right-4 font-bold text-gray-900">
                                        ${(item.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                    <div className="pr-24">
                                        <h4 className="font-bold text-gray-900 mb-1">{item.nombre}</h4>
                                        {item.descripcion && (
                                            <p className="text-sm text-gray-600 mb-3">{item.descripcion}</p>
                                        )}
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                            <span className="bg-white px-2 py-1 rounded border text-xs">Cant: <strong className="text-gray-900">{item.cantidad}</strong></span>
                                            <span className="bg-white px-2 py-1 rounded border text-xs">P.U: <strong className="text-gray-900">${(item.precioUnitario || 0).toLocaleString()}</strong></span>
                                            {item.descuento ? (
                                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 text-xs">
                                                    Desc: <strong>{item.tipoDescuento === 'porcentaje' ? `${item.descuento}%` : `$${item.descuento}`}</strong>
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-200">
                            <div className="flex justify-between items-center text-gray-600 mb-2">
                                <span>Subtotal:</span>
                                <span>${(quote.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-600 mb-4">
                                <span>IVA ({quote.ivaPorcentaje}%):</span>
                                <span>${(quote.ivaTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xl font-bold text-gray-900">Total Venta:</span>
                                <span className="text-3xl font-black text-blue-600">
                                    ${(quote.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {(quote.condicionesPago || quote.notasAdicionales || quote.terminosCondiciones) && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-3">Términos y Condiciones</h3>
                            <div className="space-y-4 text-sm">
                                {quote.condicionesPago && (
                                    <div>
                                        <div className="font-semibold text-gray-800 mb-1">Condiciones de Pago:</div>
                                        <p className="text-gray-600 whitespace-pre-wrap">{quote.condicionesPago}</p>
                                    </div>
                                )}
                                {quote.notasAdicionales && (
                                    <div>
                                        <div className="font-semibold text-gray-800 mb-1">Notas:</div>
                                        <p className="text-gray-600 whitespace-pre-wrap">{quote.notasAdicionales}</p>
                                    </div>
                                )}
                                {quote.terminosCondiciones && (
                                    <div className="pt-2">
                                        <p className="text-gray-400 text-xs whitespace-pre-wrap">{quote.terminosCondiciones}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Emisor / Empresa Branding */}
                    <div className="bg-white rounded-xl shadow-sm border-t-4 p-6" style={{ borderColor: companyProfile.colorPrimario || '#2563eb' }}>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Emisor (Tú)</h3>
                        <div className="space-y-4">
                            {companyProfile.logoUrl && (
                                <img src={companyProfile.logoUrl} alt="Logo" className="h-12 object-contain mb-4" />
                            )}
                            <div>
                                <div className="font-bold text-gray-900 text-lg">{companyProfile.nombreEmpresa}</div>
                                {companyProfile.rfc && <div className="text-xs text-gray-500 mt-1">RFC: {companyProfile.rfc}</div>}
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                                {companyProfile.email && <div className="flex gap-2"><FileText size={16} className="text-gray-400" /> {companyProfile.email}</div>}
                                {companyProfile.telefono && <div className="flex gap-2"><User size={16} className="text-gray-400" /> {companyProfile.telefono}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Cliente */}
                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Cliente / Receptor</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="font-bold text-gray-900">{prospect?.nombre || 'N/A'}</div>
                                {prospect?.empresa && <div className="text-sm text-gray-600">{prospect.empresa}</div>}
                            </div>
                            <div className="text-sm text-gray-600 space-y-2 pt-2 border-t border-gray-200">
                                <div className="flex gap-2 items-center"><User size={16} className="text-gray-400" /> {prospect?.correo || 'N/A'}</div>
                                <div className="flex gap-2 items-center"><User size={16} className="text-gray-400" /> {prospect?.telefono || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden PDF Blueprint */}
            <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                <QuotePDF quote={quote} prospect={prospect || {}} company={companyProfile} />
            </div>
        </div>
    );
};

export default QuoteDetail;

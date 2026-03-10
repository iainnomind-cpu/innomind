import React, { useState } from 'react';
import { ArrowLeft, Edit, Download, Send, FileText, Calendar, User, Loader2, CheckCircle, Receipt, Mail, MessageSquare, X, Copy } from 'lucide-react';
import { Quote } from '@/types';
import { format } from 'date-fns';
import { useCRM } from '@/context/CRMContext';
import { useInventory } from '@/context/InventoryContext';
import { useFinance } from '@/context/FinanceContext';
import { useAccountsReceivable } from '@/context/AccountsReceivableContext';
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
    const { chargeNotes, addChargeNote } = useAccountsReceivable();
    const prospect = prospects.find(p => p.id === quote.prospectId);

    const hasNotaCargo = chargeNotes.some(n => n.prospect_id === quote.prospectId && n.subtotal === quote.subtotal);

    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [shareSuccess, setShareSuccess] = useState<string | null>(null);

    // @ts-ignore
    const isExpired = quote.vigencia ? new Date() > new Date(quote.vigencia) && quote.estado === 'Enviada' : false;
    const displayStatus = isExpired ? 'Vencida' : quote.estado;

    const pdfFileName = `Cotizacion_${quote.numero}_${companyProfile.nombreEmpresa.replace(/\s+/g, '_')}.pdf`;

    const generatePDFDocument = async (): Promise<jsPDF | null> => {
        const input = document.getElementById(`quote-pdf-${quote.id}`);
        if (!input) return null;

        const canvas = await html2canvas(input, {
            scale: 2,
            useCORS: true,
            logging: false
        });

        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        return pdf;
    };

    const generatePDF = async () => {
        setIsGeneratingPDF(true);
        try {
            const pdf = await generatePDFDocument();
            if (pdf) pdf.save(pdfFileName);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Hubo un error al generar el PDF. Por favor, intente de nuevo.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handleShareEmail = async () => {
        setIsSending(true);
        try {
            // Generate and download the PDF first
            const pdf = await generatePDFDocument();
            if (pdf) pdf.save(pdfFileName);

            // Build mailto link
            const to = prospect?.correo || '';
            const subject = encodeURIComponent(`Cotización #${quote.numero} - ${companyProfile.nombreEmpresa}`);
            const body = encodeURIComponent(
                `Estimado/a ${prospect?.nombre || 'Cliente'},\n\n` +
                `Adjunto encontrará la cotización #${quote.numero} por un total de $${(quote.total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN.\n\n` +
                `Vigencia: ${safeFormat(quote.vigencia)}\n\n` +
                `Por favor, adjunte el archivo "${pdfFileName}" que se acaba de descargar.\n\n` +
                `Quedamos a sus órdenes.\n` +
                `${companyProfile.nombreEmpresa}\n` +
                `${companyProfile.telefono || ''}\n` +
                `${companyProfile.email || ''}`
            );

            const mailtoUrl = `mailto:${to}?subject=${subject}&body=${body}`;
            const a = document.createElement('a');
            a.href = mailtoUrl;
            a.target = '_self';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // Update quote status to 'Enviada'
            if (quote.estado === 'Borrador') {
                updateQuote(quote.id, { estado: 'Enviada' });
            }

            setShareSuccess('PDF descargado y cliente de correo abierto. Adjunta el archivo al correo.');
            setTimeout(() => setShareSuccess(null), 5000);
        } catch (error) {
            console.error('Error sharing via email:', error);
            alert('Error al preparar el envío por correo.');
        } finally {
            setIsSending(false);
        }
    };

    const handleShareWhatsApp = async () => {
        setIsSending(true);
        try {
            // Generate and download the PDF first
            const pdf = await generatePDFDocument();
            if (pdf) pdf.save(pdfFileName);

            // Clean phone number (remove spaces, dashes, parentheses)
            let phone = (prospect?.telefono || '').replace(/[\s\-()]/g, '');
            // Add country code if missing
            if (phone && !phone.startsWith('+') && !phone.startsWith('52')) {
                phone = '52' + phone;
            } else if (phone && phone.startsWith('+')) {
                phone = phone.substring(1);
            }

            const message = encodeURIComponent(
                `Hola ${prospect?.nombre || ''},\n\n` +
                `Le comparto la cotización *#${quote.numero}* de *${companyProfile.nombreEmpresa}* ` +
                `por un total de *$${(quote.total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN*.\n\n` +
                `📎 El PDF se descargó automáticamente, por favor adjúntelo en este chat.\n\n` +
                `Quedo a sus órdenes.`
            );

            window.open(`https://wa.me/${phone}?text=${message}`, '_blank');

            // Update quote status to 'Enviada'
            if (quote.estado === 'Borrador') {
                updateQuote(quote.id, { estado: 'Enviada' });
            }

            setShareSuccess('PDF descargado y WhatsApp abierto. Adjunta el archivo en la conversación.');
            setTimeout(() => setShareSuccess(null), 5000);
        } catch (error) {
            console.error('Error sharing via WhatsApp:', error);
            alert('Error al preparar el envío por WhatsApp.');
        } finally {
            setIsSending(false);
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
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 30);

            const chargeNoteData = {
                client_id: quote.prospectId, // Using prospect as client for now or a dummy if none
                prospect_id: quote.prospectId,
                note_number: `NC-${quote.numero}`,
                issue_date: new Date().toISOString().split('T')[0],
                due_date: dueDate.toISOString().split('T')[0],
                subtotal: quote.subtotal,
                total_amount: quote.total,
            };

            const chargeNoteItems = (quote.items || []).map(item => ({
                item_name: item.nombre,
                description: item.descripcion || '',
                quantity: item.cantidad,
                unit_price: item.precioUnitario,
                total: item.total
            }));

            await addChargeNote(chargeNoteData, chargeNoteItems);
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
                    <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                    >
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

            {/* Share Modal */}
            {isShareModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Enviar Cotización</h2>
                                <p className="text-sm text-gray-500 mt-1">#{quote.numero} · {prospect?.nombre || 'Cliente'}</p>
                            </div>
                            <button onClick={() => setIsShareModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-3">
                            {shareSuccess && (
                                <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg border border-green-100 flex items-center gap-2 animate-in fade-in">
                                    <CheckCircle size={16} /> {shareSuccess}
                                </div>
                            )}

                            {/* Email Option */}
                            <button
                                onClick={handleShareEmail}
                                disabled={isSending}
                                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all group disabled:opacity-60"
                            >
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Mail size={24} />
                                </div>
                                <div className="text-left flex-1">
                                    <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Enviar por Correo</h4>
                                    <p className="text-xs text-gray-500">
                                        {prospect?.correo ? `A: ${prospect.correo}` : 'Se abrirá tu cliente de correo'}
                                    </p>
                                </div>
                                {isSending ? <Loader2 size={20} className="animate-spin text-gray-400" /> : <Send size={16} className="text-gray-400" />}
                            </button>

                            {/* WhatsApp Option */}
                            <button
                                onClick={handleShareWhatsApp}
                                disabled={isSending || !prospect?.telefono}
                                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:bg-green-50/50 transition-all group disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <MessageSquare size={24} />
                                </div>
                                <div className="text-left flex-1">
                                    <h4 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">Enviar por WhatsApp</h4>
                                    <p className="text-xs text-gray-500">
                                        {prospect?.telefono ? `A: ${prospect.telefono}` : 'El prospecto no tiene teléfono registrado'}
                                    </p>
                                </div>
                                {isSending ? <Loader2 size={20} className="animate-spin text-gray-400" /> : <Send size={16} className="text-gray-400" />}
                            </button>

                            {/* Download Only */}
                            <button
                                onClick={async () => { await generatePDF(); setShareSuccess('PDF descargado exitosamente.'); setTimeout(() => setShareSuccess(null), 3000); }}
                                disabled={isGeneratingPDF}
                                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all group disabled:opacity-60"
                            >
                                <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Download size={24} />
                                </div>
                                <div className="text-left flex-1">
                                    <h4 className="font-bold text-gray-900 group-hover:text-gray-700 transition-colors">Solo Descargar PDF</h4>
                                    <p className="text-xs text-gray-500">Guardar el archivo sin enviar</p>
                                </div>
                            </button>
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-100">
                            <p className="text-xs text-gray-400 text-center">El PDF se descargará automáticamente al seleccionar una opción de envío.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden PDF Blueprint */}
            <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                <QuotePDF quote={quote} prospect={prospect || {}} company={companyProfile} />
            </div>
        </div>
    );
};

export default QuoteDetail;

import React, { useState, useRef } from 'react';
import { useAccountsReceivable } from '@/context/AccountsReceivableContext';
import { useUsers } from '@/context/UserContext';
import { ChargeNote } from '@/types';
import { ArrowLeft, Download, Mail, DollarSign, FileText, CheckCircle, AlertCircle, Clock, MessageCircle, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ChargeNoteDetailProps {
    onBack: () => void;
    onOpenPayment: (note: ChargeNote) => void;
}

export default function ChargeNoteDetail({ onBack, onOpenPayment }: ChargeNoteDetailProps) {
    const { selectedNote, sendReceiptEmail } = useAccountsReceivable();
    const { companyProfile } = useUsers();
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [receiptPayment, setReceiptPayment] = useState<any>(null);
    const pdfRef = useRef<HTMLDivElement>(null);
    const receiptRef = useRef<HTMLDivElement>(null);

    if (!selectedNote) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-700';
            case 'overdue': return 'bg-red-100 text-red-700';
            case 'partial': return 'bg-blue-100 text-blue-700';
            default: return 'bg-amber-100 text-amber-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'paid': return 'PAGADO';
            case 'overdue': return 'VENCIDO';
            case 'partial': return 'PAGO PARCIAL';
            default: return 'PENDIENTE';
        }
    };

    // ─── Helper: clone an element offscreen, render with html2canvas, return jsPDF ───
    const renderElementToPDF = async (element: HTMLElement, width?: number): Promise<jsPDF> => {
        const clone = element.cloneNode(true) as HTMLElement;
        document.body.appendChild(clone);
        clone.style.position = 'absolute';
        clone.style.top = '0';
        clone.style.left = '0';
        clone.style.width = width ? `${width}px` : `${element.offsetWidth}px`;
        clone.style.height = 'max-content';
        clone.style.overflow = 'visible';
        clone.style.display = 'block';
        clone.style.zIndex = '-9999';

        const canvas = await html2canvas(clone, {
            scale: 2,
            useCORS: true,
            windowWidth: clone.scrollWidth,
            windowHeight: clone.scrollHeight,
        });

        document.body.removeChild(clone);

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, pdf.internal.pageSize.getHeight()));
        return pdf;
    };

    // ─── Nota de Cargo: Descargar PDF ───
    const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true);
        try {
            if (!pdfRef.current) return;
            const pdf = await renderElementToPDF(pdfRef.current);
            pdf.save(`Nota_Cargo_${selectedNote.note_number}.pdf`);
            alert('✅ PDF de Nota de Cargo descargado exitosamente. Si deseas compartirlo, adjunta el archivo que se acaba de descargar.');
        } catch (e) {
            console.error(e);
            alert('Error generando PDF');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    // ─── Nota de Cargo: Enviar por Email (mailto) ───
    const handleSendEmail = async () => {
        setIsGeneratingPDF(true);
        try {
            if (!pdfRef.current) return;
            const pdf = await renderElementToPDF(pdfRef.current);
            pdf.save(`Nota_Cargo_${selectedNote.note_number}.pdf`);

            const clientEmail = selectedNote.prospect?.correo || '';
            const clientName = selectedNote.prospect?.nombre || 'Cliente';
            const companyName = companyProfile?.nombreEmpresa || 'Mi Empresa';
            const subject = encodeURIComponent(`Nota de Cargo ${selectedNote.note_number} - ${companyName}`);
            const body = encodeURIComponent(
                `Estimado/a ${clientName},\n\n` +
                `Le envío adjunta la Nota de Cargo ${selectedNote.note_number} por un total de $${Number(selectedNote.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} MXN.\n\n` +
                `Saldo pendiente: $${Number(selectedNote.balance_due).toLocaleString('en-US', { minimumFractionDigits: 2 })} MXN.\n\n` +
                `Por favor, adjunte el archivo PDF que se acaba de descargar a este correo antes de enviarlo.\n\n` +
                `Saludos cordiales,\n${companyName}`
            );

            window.open(`mailto:${clientEmail}?subject=${subject}&body=${body}`, '_blank');
            alert('📧 Se descargó el PDF y se abrió tu cliente de correo.\n\n⚠️ Recuerda adjuntar el archivo PDF descargado antes de enviar el correo.');
        } catch (e) {
            console.error(e);
            alert('Error al preparar el correo');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    // ─── Nota de Cargo: Enviar por WhatsApp ───
    const handleSendWhatsApp = async () => {
        setIsGeneratingPDF(true);
        try {
            if (!pdfRef.current) return;
            const pdf = await renderElementToPDF(pdfRef.current);
            pdf.save(`Nota_Cargo_${selectedNote.note_number}.pdf`);

            const clientName = selectedNote.prospect?.nombre || 'Cliente';
            const companyName = companyProfile?.nombreEmpresa || 'Mi Empresa';
            const phone = selectedNote.prospect?.telefono?.replace(/\D/g, '') || '';
            const message = encodeURIComponent(
                `Hola ${clientName}, le saluda ${companyName}.\n\n` +
                `Le envío la Nota de Cargo *${selectedNote.note_number}* por un total de *$${Number(selectedNote.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} MXN*.\n\n` +
                `Saldo pendiente: *$${Number(selectedNote.balance_due).toLocaleString('en-US', { minimumFractionDigits: 2 })} MXN*.\n\n` +
                `📎 _Por favor adjunte el PDF que se acaba de descargar a esta conversación._`
            );

            const whatsappUrl = phone
                ? `https://wa.me/${phone}?text=${message}`
                : `https://wa.me/?text=${message}`;

            window.open(whatsappUrl, '_blank');
            alert('✅ Se descargó el PDF y se abrió WhatsApp.\n\n⚠️ Recuerda adjuntar el archivo PDF descargado en la conversación de WhatsApp.');
        } catch (e) {
            console.error(e);
            alert('Error al preparar WhatsApp');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    // ─── Recibo de Pago: Descargar PDF ───
    const handleDownloadReceipt = (payment: any) => {
        setReceiptPayment(payment);

        setTimeout(async () => {
            if (!receiptRef.current) return;
            try {
                const pdf = await renderElementToPDF(receiptRef.current, 800);
                pdf.save(`Recibo_${selectedNote.note_number}_${payment.payment_date}.pdf`);
                alert('✅ Recibo de pago descargado exitosamente.');
            } catch (e) {
                console.error(e);
                alert('Error al generar el recibo');
            }
            setReceiptPayment(null);
        }, 150);
    };

    // ─── Recibo de Pago: Enviar por Email ───
    const handleEmailReceipt = (payment: any) => {
        setReceiptPayment(payment);

        setTimeout(async () => {
            if (!receiptRef.current) return;
            try {
                const pdf = await renderElementToPDF(receiptRef.current, 800);
                pdf.save(`Recibo_${selectedNote.note_number}_${payment.payment_date}.pdf`);

                const clientEmail = selectedNote.prospect?.correo || '';
                const clientName = selectedNote.prospect?.nombre || 'Cliente';
                const companyName = companyProfile?.nombreEmpresa || 'Mi Empresa';
                const subject = encodeURIComponent(`Recibo de Pago - Nota ${selectedNote.note_number} - ${companyName}`);
                const body = encodeURIComponent(
                    `Estimado/a ${clientName},\n\n` +
                    `Le envío adjunto el recibo de pago por $${Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} MXN correspondiente a la Nota de Cargo ${selectedNote.note_number}.\n\n` +
                    `Fecha de pago: ${payment.payment_date}\n` +
                    `Método: ${payment.payment_method}\n\n` +
                    `Por favor, adjunte el archivo PDF que se acaba de descargar a este correo antes de enviarlo.\n\n` +
                    `Saludos cordiales,\n${companyName}`
                );

                window.open(`mailto:${clientEmail}?subject=${subject}&body=${body}`, '_blank');
                alert('📧 Se descargó el recibo y se abrió tu cliente de correo.\n\n⚠️ Recuerda adjuntar el archivo PDF descargado.');
            } catch (e) {
                console.error(e);
                alert('Error al preparar el correo del recibo');
            }
            setReceiptPayment(null);
        }, 150);
    };

    // ─── Recibo de Pago: Enviar por WhatsApp ───
    const handleWhatsAppReceipt = (payment: any) => {
        setReceiptPayment(payment);

        setTimeout(async () => {
            if (!receiptRef.current) return;
            try {
                const pdf = await renderElementToPDF(receiptRef.current, 800);
                pdf.save(`Recibo_${selectedNote.note_number}_${payment.payment_date}.pdf`);

                const clientName = selectedNote.prospect?.nombre || 'Cliente';
                const companyName = companyProfile?.nombreEmpresa || 'Mi Empresa';
                const phone = selectedNote.prospect?.telefono?.replace(/\D/g, '') || '';
                const message = encodeURIComponent(
                    `Hola ${clientName}, le saluda ${companyName}.\n\n` +
                    `Le envío su recibo de pago por *$${Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} MXN* correspondiente a la Nota de Cargo *${selectedNote.note_number}*.\n\n` +
                    `📎 _Por favor adjunte el PDF que se acaba de descargar a esta conversación._`
                );

                const whatsappUrl = phone
                    ? `https://wa.me/${phone}?text=${message}`
                    : `https://wa.me/?text=${message}`;

                window.open(whatsappUrl, '_blank');
                alert('✅ Se descargó el recibo y se abrió WhatsApp.\n\n⚠️ Recuerda adjuntar el PDF descargado en la conversación.');
            } catch (e) {
                console.error(e);
                alert('Error al preparar WhatsApp');
            }
            setReceiptPayment(null);
        }, 150);
    };

    // ─── Computed values for the PDF ───
    const paidAmount = Number(selectedNote.paid_amount) || 0;
    const totalAmount = Number(selectedNote.total_amount) || 0;
    const balanceDue = Number(selectedNote.balance_due) || 0;

    return (
        <div className="h-full flex flex-col bg-slate-50 relative">
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                    <ArrowLeft size={20} />
                    Volver a Notas de Cargo
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={handleDownloadPDF}
                        disabled={isGeneratingPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
                    >
                        <Download size={18} /> {isGeneratingPDF ? 'Generando...' : 'Descargar PDF'}
                    </button>
                    <button
                        onClick={handleSendEmail}
                        disabled={isGeneratingPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
                    >
                        <Mail size={18} /> Email
                    </button>
                    <button
                        onClick={handleSendWhatsApp}
                        disabled={isGeneratingPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                    >
                        <MessageCircle size={18} /> WhatsApp
                    </button>
                    {(selectedNote.status === 'pending' || selectedNote.status === 'partial' || selectedNote.status === 'overdue') && (
                        <button
                            onClick={() => onOpenPayment(selectedNote)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                        >
                            <DollarSign size={18} /> Registrar Pago
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content & PDF Target */}
            <div className="flex-1 overflow-auto flex gap-6 pb-12">
                {/* Document Body */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex-1" ref={pdfRef}>
                    <div className="flex justify-between items-start mb-8 border-b border-gray-200 pb-6">
                        <div className="flex items-center gap-4">
                            {companyProfile?.logoUrl ? (
                                <img src={companyProfile.logoUrl} alt="Logo" className="h-16 w-16 object-contain rounded-lg" crossOrigin="anonymous" />
                            ) : (
                                <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center font-bold text-2xl">
                                    {companyProfile?.nombreEmpresa?.charAt(0).toUpperCase() || 'E'}
                                </div>
                            )}
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{companyProfile?.nombreEmpresa || 'Mi Empresa'}</h2>
                                {companyProfile?.rfc && <p className="text-sm text-gray-500 font-medium">RFC: {companyProfile.rfc}</p>}
                                {companyProfile?.direccion && <p className="text-sm text-gray-500 max-w-xs">{companyProfile.direccion}</p>}
                            </div>
                        </div>
                        <div className="text-right">
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">NOTA DE CARGO</h1>
                            <p className="text-gray-500 mt-1">Control Interno</p>
                            <p className="text-xl font-bold text-gray-800 mt-2">{selectedNote.note_number}</p>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-8">
                        <div></div>
                        <div className="text-right">
                            <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusColor(selectedNote.status)}`}>
                                {getStatusLabel(selectedNote.status)}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-10">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Cliente</p>
                            <h3 className="text-lg font-bold text-gray-900">{selectedNote.prospect?.nombre || 'Desconocido'}</h3>
                            <p className="text-gray-600 mt-1">{selectedNote.prospect?.empresa}</p>
                            <p className="text-gray-600">{selectedNote.prospect?.correo}</p>
                        </div>
                        <div className="text-right">
                            <div className="mb-4">
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Fecha Emisión</p>
                                <p className="text-gray-800 font-medium">{selectedNote.issue_date}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Fecha Vencimiento</p>
                                <p className="text-gray-800 font-medium">{selectedNote.due_date}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-10">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Conceptos</h4>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                    <th className="py-3 px-2">Descripción</th>
                                    <th className="py-3 px-2 text-right">Cantidad</th>
                                    <th className="py-3 px-2 text-right">Precio Unitario</th>
                                    <th className="py-3 px-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedNote.items?.map((item: any, idx: number) => (
                                    <tr key={idx} className="border-b border-gray-100">
                                        <td className="py-4 px-2">
                                            <p className="font-medium text-gray-900">{item.item_name}</p>
                                            {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
                                        </td>
                                        <td className="py-4 px-2 text-right text-gray-700">{item.quantity}</td>
                                        <td className="py-4 px-2 text-right text-gray-700">${Number(item.unit_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                        <td className="py-4 px-2 text-right font-medium text-gray-900">${Number(item.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Section */}
                    <div className="flex justify-end pt-4">
                        <div className="w-72 space-y-3">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-medium">${Number(selectedNote.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-gray-900 font-bold text-lg pt-3 border-t border-gray-200">
                                <span>Total M.N.</span>
                                <span>${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                            {paidAmount > 0 && (
                                <div className="flex justify-between text-green-600 font-medium pt-2">
                                    <span>Pagado</span>
                                    <span>-${paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-emerald-700 font-bold text-xl pt-3 border-t border-gray-200 bg-emerald-50 px-3 py-2 rounded-lg mt-2">
                                <span>Saldo Pendiente</span>
                                <span>${balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment History inside PDF */}
                    {selectedNote.payments && selectedNote.payments.length > 0 && (
                        <div className="mt-10 pt-6 border-t border-gray-200">
                            <h4 className="text-lg font-bold text-gray-900 mb-4">Historial de Pagos Registrados</h4>
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                        <th className="py-2 px-2">Fecha</th>
                                        <th className="py-2 px-2">Método</th>
                                        <th className="py-2 px-2">Referencia</th>
                                        <th className="py-2 px-2 text-right">Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedNote.payments.map((p: any, idx: number) => (
                                        <tr key={idx} className="border-b border-gray-100">
                                            <td className="py-3 px-2 text-gray-700">{p.payment_date}</td>
                                            <td className="py-3 px-2 text-gray-700">{p.payment_method}</td>
                                            <td className="py-3 px-2 text-gray-500">{p.reference || '—'}</td>
                                            <td className="py-3 px-2 text-right font-medium text-green-600">${Number(p.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Sidebar: Payments History */}
                <div className="w-80 flex flex-col gap-6" data-html2canvas-ignore="true">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText size={20} className="text-gray-400" /> Historial de Pagos
                        </h4>

                        {!selectedNote.payments || selectedNote.payments.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-4 bg-gray-50 rounded-lg border border-gray-100">
                                No hay pagos registrados.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {selectedNote.payments.map((p: any, idx: number) => (
                                    <div key={idx} className="bg-gray-50 border border-gray-100 p-4 rounded-lg relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-gray-900">${Number(p.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                            <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded shadow-sm border border-gray-200">
                                                {p.payment_date}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 mb-3">
                                            <p><span className="font-medium">Método:</span> {p.payment_method}</p>
                                            {p.reference && <p><span className="font-medium">Ref:</span> {p.reference}</p>}
                                        </div>
                                        {/* Action buttons for each payment */}
                                        <div className="flex gap-2 pt-2 border-t border-gray-200">
                                            <button
                                                onClick={() => handleDownloadReceipt(p)}
                                                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                                title="Descargar Recibo"
                                            >
                                                <Download size={12} /> PDF
                                            </button>
                                            <button
                                                onClick={() => handleEmailReceipt(p)}
                                                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                title="Enviar por Email"
                                            >
                                                <Mail size={12} /> Email
                                            </button>
                                            <button
                                                onClick={() => handleWhatsAppReceipt(p)}
                                                className="flex items-center gap-1 px-2 py-1 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                                                title="Enviar por WhatsApp"
                                            >
                                                <MessageCircle size={12} /> WhatsApp
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Hidden Receipt Template for PDF Generation */}
            <div className="hidden">
                <div ref={receiptRef} className="bg-white p-8 w-[800px] font-sans">
                    {receiptPayment && (
                        <>
                            <div className="flex justify-between items-start mb-8 border-b border-gray-200 pb-6">
                                <div className="flex items-center gap-4">
                                    {companyProfile?.logoUrl ? (
                                        <img src={companyProfile.logoUrl} alt="Logo" className="h-16 w-16 object-contain rounded-lg" crossOrigin="anonymous" />
                                    ) : (
                                        <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center font-bold text-2xl">
                                            {companyProfile?.nombreEmpresa?.charAt(0).toUpperCase() || 'E'}
                                        </div>
                                    )}
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{companyProfile?.nombreEmpresa || 'Mi Empresa'}</h2>
                                        {companyProfile?.rfc && <p className="text-sm text-gray-500 font-medium">RFC: {companyProfile.rfc}</p>}
                                        {companyProfile?.direccion && <p className="text-sm text-gray-500 max-w-xs">{companyProfile.direccion}</p>}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">RECIBO DE PAGO</h1>
                                    <p className="text-gray-500 mt-1">Comprobante de Ingreso</p>
                                    <p className="text-xl font-bold text-gray-800 mt-2">NC-{selectedNote.note_number}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-10">
                                <div>
                                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Cliente</p>
                                    <h3 className="text-lg font-bold text-gray-900">{selectedNote.prospect?.nombre || 'Desconocido'}</h3>
                                    <p className="text-gray-600 mt-1">{selectedNote.prospect?.empresa}</p>
                                    <p className="text-gray-600">{selectedNote.prospect?.correo}</p>
                                </div>
                                <div className="text-right">
                                    <div className="mb-4">
                                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Fecha de Pago</p>
                                        <p className="text-gray-800 font-medium">{receiptPayment.payment_date}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-10 p-6 bg-emerald-50 rounded-xl border border-emerald-100">
                                <h4 className="text-lg font-bold text-emerald-900 mb-4">Detalles del Cobro</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-emerald-800">
                                        <span className="font-medium">Método de Pago:</span>
                                        <span>{receiptPayment.payment_method}</span>
                                    </div>
                                    {receiptPayment.reference && (
                                        <div className="flex justify-between text-emerald-800">
                                            <span className="font-medium">Referencia:</span>
                                            <span>{receiptPayment.reference}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-emerald-900 font-bold text-2xl pt-4 border-t border-emerald-200/60 mt-4">
                                        <span>Total Recibido:</span>
                                        <span>${Number(receiptPayment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} MXN</span>
                                    </div>
                                </div>
                            </div>

                            {/* Summary of the note within the receipt */}
                            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                                <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Resumen de la Nota de Cargo</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Total de la Nota:</span>
                                        <span className="font-medium">${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between text-green-600">
                                        <span>Total Pagado:</span>
                                        <span className="font-medium">${paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-900 font-bold pt-2 border-t border-gray-200">
                                        <span>Saldo Pendiente:</span>
                                        <span>${balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

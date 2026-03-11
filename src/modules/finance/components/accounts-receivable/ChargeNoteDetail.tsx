import React, { useState, useRef } from 'react';
import { ChargeNote, useAccountsReceivable } from '@/context/AccountsReceivableContext';
import { ArrowLeft, Download, Mail, DollarSign, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ChargeNoteDetailProps {
    onBack: () => void;
    onOpenPayment: (note: ChargeNote) => void;
}

export default function ChargeNoteDetail({ onBack, onOpenPayment }: ChargeNoteDetailProps) {
    const { selectedNote, sendReceiptEmail } = useAccountsReceivable();
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const pdfRef = useRef<HTMLDivElement>(null);

    if (!selectedNote) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-700';
            case 'overdue': return 'bg-red-100 text-red-700';
            case 'partial': return 'bg-blue-100 text-blue-700';
            default: return 'bg-amber-100 text-amber-700';
        }
    };

    const generatePDFBase64 = async (): Promise<string | null> => {
        if (!pdfRef.current) return null;
        const canvas = await html2canvas(pdfRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');

        // A4 sizes
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, pdf.internal.pageSize.getHeight()));

        // Get base64 without data URI scheme
        const base64String = pdf.output('datauristring');
        return base64String;
    };

    const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true);
        try {
            if (!pdfRef.current) return;
            const canvas = await html2canvas(pdfRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, pdf.internal.pageSize.getHeight()));
            pdf.save(`Nota_Cargo_${selectedNote.note_number}.pdf`);
        } catch (e) {
            console.error(e);
            alert('Error generando PDF');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handleSendEmail = async () => {
        if (!selectedNote.prospect?.correo) {
            alert('El cliente no tiene un email registrado.');
            return;
        }

        setIsSendingEmail(true);
        try {
            const base64 = await generatePDFBase64();
            if (!base64) throw new Error("Could not generate PDF");

            const success = await sendReceiptEmail(
                selectedNote.prospect.correo,
                selectedNote.prospect.nombre,
                selectedNote.note_number,
                Number(selectedNote.paid_amount), // Ideally we would receipt specific payments, but this is a summary request
                new Date().toLocaleDateString(),
                base64
            );

            if (success) {
                alert('Correo enviado exitosamente.');
            } else {
                alert('Error al enviar el correo.');
            }
        } catch (err) {
            console.error(err);
            alert('Ocurrió un error inesperado al enviar correo.');
        } finally {
            setIsSendingEmail(false);
        }
    };

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
                        disabled={isSendingEmail}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
                    >
                        <Mail size={18} /> {isSendingEmail ? 'Enviando...' : 'Enviar por Email'}
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
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">NOTA DE CARGO</h1>
                            <p className="text-gray-500 mt-1">Control Interno</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-bold text-gray-800">{selectedNote.note_number}</p>
                            <div className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusColor(selectedNote.status)}`}>
                                {selectedNote.status === 'paid' ? 'PAGADO' : selectedNote.status === 'overdue' ? 'VENCIDO' : selectedNote.status === 'partial' ? 'PAGO PARCIAL' : 'PENDIENTE'}
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
                                {selectedNote.items?.map((item, idx) => (
                                    <tr key={idx} className="border-b border-gray-100">
                                        <td className="py-4 px-2">
                                            <p className="font-medium text-gray-900">{item.item_name}</p>
                                            {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
                                        </td>
                                        <td className="py-4 px-2 text-right text-gray-700">{item.quantity}</td>
                                        <td className="py-4 px-2 text-right text-gray-700">${Number(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="py-4 px-2 text-right font-medium text-gray-900">${Number(item.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end pt-4">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-medium">${Number(selectedNote.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-gray-900 font-bold text-lg pt-3 border-t border-gray-200">
                                <span>Total M.N.</span>
                                <span>${Number(selectedNote.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            {Number(selectedNote.paid_amount) > 0 && (
                                <div className="flex justify-between text-green-600 font-medium pt-2">
                                    <span>Pagado</span>
                                    <span>-${Number(selectedNote.paid_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-emerald-700 font-bold text-xl pt-3 border-t border-gray-200 bg-emerald-50 px-3 py-2 rounded-lg mt-2">
                                <span>Saldo Pendiente</span>
                                <span>${Number(selectedNote.balance_due).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>
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
                                {selectedNote.payments.map((p, idx) => (
                                    <div key={idx} className="bg-gray-50 border border-gray-100 p-4 rounded-lg relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-gray-900">${Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded shadow-sm border border-gray-200">
                                                {p.payment_date}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            <p><span className="font-medium">Método:</span> {p.payment_method}</p>
                                            {p.reference && <p><span className="font-medium">Ref:</span> {p.reference}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

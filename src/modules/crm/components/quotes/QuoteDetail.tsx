import React, { useState } from 'react';
import { ArrowLeft, Edit, Download, Send, FileText, Calendar, User, Loader2, CheckCircle, Receipt, Mail, MessageSquare, X, Copy } from 'lucide-react';
import { Quote } from '@/types';
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
import QuoteApprovalModal from './QuoteApprovalModal';

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
    const { accounts, registerPayment } = useFinance();
    const prospect = prospects.find(p => p.id === quote.prospectId);

    const hasNotaCargo = chargeNotes.some(n => n.prospect_id === quote.prospectId && n.subtotal === quote.subtotal);

    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
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

            // Build Gmail compose link. This is more reliable than mailto when no desktop mail app is configured.
            const to = encodeURIComponent(prospect?.correo || '');
            const subject = encodeURIComponent(`Cotización #${quote.numero} - ${companyProfile.nombreEmpresa}`);
            const body = encodeURIComponent(
                `Estimado/a ${prospect?.nombre || 'Cliente'},\n\n` +
                `Adjunto encontrará la cotización #${quote.numero} por un total de $${(quote.total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN.\n\n` +
                `Vigencia: ${safeFormat(quote.vigencia)}\n\n` +
                `Quedamos a sus órdenes.\n` +
                `${companyProfile.nombreEmpresa}\n` +
                `${companyProfile.telefono || ''}\n` +
                `${companyProfile.email || ''}`
            );

            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;
            alert(`La cotización se guardó y el PDF se descargó. Se abrirá Gmail en una nueva pestaña con el mensaje precargado; adjunta manualmente el archivo "${pdfFileName}" antes de enviarlo. Si no se abre, habilita las ventanas emergentes para este sitio.`);
            window.open(gmailUrl, '_blank', 'noopener,noreferrer');

            // Update quote status to 'Enviada'
            if (quote.estado === 'Borrador') {
                updateQuote(quote.id, { estado: 'Enviada' });
            }

            setShareSuccess('PDF descargado y Gmail abierto. Adjunta el archivo al correo.');
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
                `Quedo a sus órdenes.`
            );

            alert(`La cotización se guardó y el PDF se descargó. En la ventana de WhatsApp que se abrirá ahora, adjunta manualmente el archivo "${pdfFileName}". Si no se abre WhatsApp, habilita las ventanas emergentes para este sitio e inténtalo de nuevo.`);
            window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
};

export default QuoteDetail;

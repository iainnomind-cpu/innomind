import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Search, FileText, CheckCircle, AlertCircle, Clock, CreditCard, X } from 'lucide-react';
import { FinanceDocument } from '@/types';
import { format, isPast, isToday } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Payables() {
    const { documents, accounts, registerPayment } = useFinance();
    const [searchTerm, setSearchTerm] = useState('');

    // Only show "Cuentas por Pagar"
    const payables = documents.filter(d => d.tipo === 'CUENTA_PAGAR');

    const filteredPayables = payables.filter(p =>
        p.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.proveedorNombre && p.proveedorNombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.numeroFolio?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stats
    const totalPendiente = payables.reduce((sum, p) => sum + p.saldoPendiente, 0);
    const totalVencido = payables.filter(p => p.estado === 'VENCIDO' || (p.fechaVencimiento && isPast(p.fechaVencimiento) && !isToday(p.fechaVencimiento) && p.saldoPendiente > 0))
        .reduce((sum, p) => sum + p.saldoPendiente, 0);

    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<FinanceDocument | null>(null);

    const openPaymentModal = (doc: FinanceDocument) => {
        setSelectedDoc(doc);
        setPaymentModalOpen(true);
    };

    const getStatusBadge = (doc: FinanceDocument) => {
        if (doc.estado === 'PAGADO') return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium flex items-center gap-1"><CheckCircle size={12} /> Pagado</span>;

        const isVencido = doc.estado === 'VENCIDO' || (doc.fechaVencimiento && isPast(doc.fechaVencimiento) && !isToday(doc.fechaVencimiento) && doc.saldoPendiente > 0);
        if (isVencido) return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium flex items-center gap-1"><AlertCircle size={12} /> Vencido</span>;

        return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-medium flex items-center gap-1"><Clock size={12} /> Pendiente</span>;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Facturas a Pagar</p>
                        <p className="text-2xl font-bold text-gray-900">{payables.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-fuchsia-50 text-fuchsia-600 rounded-lg">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Por Pagar (Pendiente)</p>
                        <p className="text-2xl font-bold text-gray-900">${totalPendiente.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-red-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-red-500 font-medium">Pagos Vencidos</p>
                        <p className="text-2xl font-bold text-red-600">${totalVencido.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Actions & Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por folio, proveedor, concepto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Proveedor / Folio</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Concepto</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Vencimiento</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Total</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Pendiente</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPayables.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No se encontraron cuentas por pagar
                                    </td>
                                </tr>
                            ) : (
                                filteredPayables.map(doc => (
                                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{doc.proveedorNombre || 'Proveedor Desconocido'}</div>
                                            <div className="text-xs text-gray-500">Folio: {doc.numeroFolio || 'S/N'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 line-clamp-2">{doc.concepto}</div>
                                            <div className="text-xs text-gray-500">{format(doc.fechaEmision, "dd MMM yyyy", { locale: es })}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {doc.fechaVencimiento ? format(doc.fechaVencimiento, "dd MMM yyyy", { locale: es }) : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                                            ${doc.montoTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-red-600">
                                            ${doc.saldoPendiente.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                {getStatusBadge(doc)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {doc.saldoPendiente > 0 && (
                                                <button
                                                    onClick={() => openPaymentModal(doc)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    <CreditCard size={16} /> Emitir Pago
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment Modal inside the same component for simplicity */}
            {paymentModalOpen && selectedDoc && (
                <PaymentOutModal
                    doc={selectedDoc}
                    accounts={accounts}
                    onClose={() => setPaymentModalOpen(false)}
                    onRegister={async (payment) => {
                        await registerPayment(payment);
                        setPaymentModalOpen(false);
                    }}
                />
            )}
        </div>
    );
}

function PaymentOutModal({ doc, accounts, onClose, onRegister }: {
    doc: FinanceDocument,
    accounts: any[],
    onClose: () => void,
    onRegister: (p: any) => Promise<void>
}) {
    const [monto, setMonto] = useState(doc.saldoPendiente);
    const [fechaPago, setFechaPago] = useState(new Date().toISOString().split('T')[0]);
    const [metodoPago, setMetodoPago] = useState('Transferencia');
    const [accountId, setAccountId] = useState(accounts.length > 0 ? accounts[0].id : '');
    const [referencia, setReferencia] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onRegister({
            documentId: doc.id,
            accountId: accountId || undefined,
            monto,
            fechaPago: new Date(fechaPago),
            metodoPago,
            referencia
        });
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col border border-gray-200">
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Registrar Pago Emitido</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-500 mb-1">Proveedor: <span className="text-gray-900">{doc.proveedorNombre || 'Desconocido'}</span></p>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700">Saldo Pendiente:</span>
                            <span className="text-xl font-bold text-red-600">${doc.saldoPendiente.toLocaleString()}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Monto Pagado *</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                            <input
                                type="number"
                                min="0.01"
                                max={doc.saldoPendiente}
                                step="0.01"
                                value={monto}
                                onChange={e => setMonto(parseFloat(e.target.value) || 0)}
                                className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-purple-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Emisión</label>
                            <input
                                type="date"
                                value={fechaPago}
                                onChange={e => setFechaPago(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-purple-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Método</label>
                            <select
                                value={metodoPago}
                                onChange={e => setMetodoPago(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-purple-500 outline-none bg-white"
                            >
                                <option value="Transferencia">Transferencia</option>
                                <option value="Efectivo">Efectivo</option>
                                <option value="Tarjeta">Tarjeta</option>
                                <option value="Cheque">Cheque</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta de Origen</label>
                        <select
                            value={accountId}
                            onChange={e => setAccountId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-purple-500 outline-none bg-white"
                        >
                            <option value="">-- Sin asignar a cuenta --</option>
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.nombre} ({acc.moneda})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Referencia / Comentarios</label>
                        <input
                            type="text"
                            placeholder="Ej. SPEI 123456"
                            value={referencia}
                            onChange={e => setReferencia(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-purple-500 outline-none"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50">Cancelar</button>
                        <button type="submit" disabled={isSubmitting || monto <= 0 || monto > doc.saldoPendiente} className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50">
                            {isSubmitting ? 'Registrando...' : 'Confirmar Pago'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import { Quote, FinanceAccount } from '@/types';

interface QuoteApprovalModalProps {
    quote: Quote;
    accounts: FinanceAccount[];
    onConfirm: (
        generateChargeNote: boolean,
        advanceAmount: number,
        accountId: string,
        paymentMethod: string,
        notes: string
    ) => void;
    onClose: () => void;
}

export default function QuoteApprovalModal({ quote, accounts, onConfirm, onClose }: QuoteApprovalModalProps) {
    const [generateChargeNote, setGenerateChargeNote] = useState(true);
    const [advanceAmount, setAdvanceAmount] = useState<number>(0);
    const [accountId, setAccountId] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<string>('TRANSFERENCIA');
    const [notes, setNotes] = useState<string>('');

    const activeAccounts = accounts.filter(a => a.activo);

    const handleConfirm = () => {
        if (generateChargeNote && advanceAmount > 0 && !accountId) {
            alert('Debes seleccionar una cuenta destino para registrar el anticipo.');
            return;
        }
        if (advanceAmount > quote.total) {
            alert('El anticipo no puede ser mayor al total de la cotización.');
            return;
        }
        onConfirm(generateChargeNote, advanceAmount, accountId, paymentMethod, notes);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col border border-gray-200 animate-in fade-in slide-in-from-bottom-4 max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-emerald-50 rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-emerald-900">Aprobar Cotización</h2>
                            <p className="text-sm text-emerald-700 mt-1">#{quote.numero} por ${(quote.total || 0).toLocaleString()}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-emerald-400 hover:text-emerald-700 transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    <p className="text-gray-600">
                        Al aprobar esta cotización, se descontará el stock de los productos físicos automáticamente.
                    </p>

                    <div className="space-y-4">
                        <label className="flex items-start gap-3 cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center h-5">
                                <input
                                    type="checkbox"
                                    checked={generateChargeNote}
                                    onChange={(e) => setGenerateChargeNote(e.target.checked)}
                                    className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <span className="block font-semibold text-gray-900">Generar Cuenta por Cobrar (Nota de Cargo)</span>
                                <span className="block text-sm text-gray-500 mt-1">
                                    Se creará un registro en Finanzas por el total de la cotización para llevar el control de cobro.
                                </span>
                            </div>
                        </label>

                        {generateChargeNote && (
                            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl space-y-4">
                                <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                                    <DollarSign size={18} /> Registrar Anticipo Inicial
                                </h4>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto del Anticipo</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                        <input
                                            type="number" min="0" step="0.01" max={quote.total}
                                            value={advanceAmount || ''}
                                            onChange={(e) => setAdvanceAmount(parseFloat(e.target.value) || 0)}
                                            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Deja en 0 si no hubo anticipo. Restante por cobrar: <strong className="text-gray-700">${Math.max(0, quote.total - advanceAmount).toLocaleString()}</strong>
                                    </p>
                                </div>

                                {advanceAmount > 0 && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta Destino</label>
                                            <select
                                                value={accountId}
                                                onChange={(e) => setAccountId(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-blue-500 outline-none"
                                            >
                                                <option value="">-- Seleccionar Cuenta --</option>
                                                {activeAccounts.map(acc => (
                                                    <option key={acc.id} value={acc.id}>{acc.nombre} ({acc.moneda})</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                                            <select
                                                value={paymentMethod}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-blue-500 outline-none"
                                            >
                                                <option value="EFECTIVO">Efectivo</option>
                                                <option value="TRANSFERENCIA">Transferencia / SPEI</option>
                                                <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
                                                <option value="TARJETA_DEBITO">Tarjeta de Débito</option>
                                                <option value="CHEQUE">Cheque</option>
                                                <option value="OTRO">Otro</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Notas / Referencia</label>
                                            <input
                                                type="text"
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-blue-500 outline-none"
                                                placeholder="Ej. Transferencia terminación 4930..."
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl mt-auto">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm"
                    >
                        <CheckCircle size={18} />
                        Confirmar y Aprobar
                    </button>
                </div>
            </div>
        </div>
    );
}

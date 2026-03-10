import { useState, useRef } from 'react';
import { useAccountsPayable } from '@/context/AccountsPayableContext';
import { AccountsPayable } from '@/types';
import { X, CreditCard, Upload, FileText, Loader2, AlertCircle } from 'lucide-react';

interface PayablePaymentModalProps {
    payable: AccountsPayable;
    onClose: () => void;
}

export default function PayablePaymentModal({ payable, onClose }: PayablePaymentModalProps) {
    const { addPayment } = useAccountsPayable();

    const [amount, setAmount] = useState(payable.balance_due);
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [method, setMethod] = useState('Transferencia');
    const [reference, setReference] = useState('');
    const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                alert('El archivo supera los 5MB permitidos');
                return;
            }
            setEvidenceFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (amount <= 0 || amount > payable.balance_due) {
            setError('Monto inválido');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await addPayment({
                account_payable_id: payable.id,
                amount: Number(amount),
                payment_date: new Date(paymentDate),
                payment_method: method,
                reference_number: reference,
                workspace_id: payable.workspace_id
            }, evidenceFile || undefined);

            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error al registrar el pago');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col border border-gray-200 overflow-hidden transform animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <CreditCard size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Registrar Pago</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Header Info */}
                    <div className="bg-purple-50 p-5 rounded-xl border border-purple-100 space-y-2">
                        <div className="flex justify-between items-start">
                            <div className="text-sm font-medium text-purple-700">Proveedor:</div>
                            <div className="text-sm font-bold text-purple-900 text-right">{payable.supplier?.nombreComercial || 'Especial'}</div>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-purple-200/50">
                            <span className="text-sm font-medium text-purple-700">Saldo Pendiente:</span>
                            <span className="text-2xl font-black text-purple-900">${payable.balance_due.toLocaleString()}</span>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm border border-red-100 italic">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Monto a Pagar *</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                <input
                                    type="number"
                                    min="0.01"
                                    max={payable.balance_due}
                                    step="0.01"
                                    value={amount}
                                    onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                                    className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all font-semibold"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Pago</label>
                            <input
                                type="date"
                                value={paymentDate}
                                onChange={e => setPaymentDate(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Método de Pago</label>
                            <select
                                value={method}
                                onChange={e => setMethod(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all appearance-none"
                            >
                                <option value="Transferencia">Transferencia</option>
                                <option value="Efectivo">Efectivo</option>
                                <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                                <option value="Cheque">Cheque</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Referencia / Folio</label>
                            <input
                                type="text"
                                placeholder="Ej. SPEI #12345"
                                value={reference}
                                onChange={e => setReference(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Evidence Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Comprobante (Evidencia)</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${evidenceFile ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'}`}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept=".pdf,image/*"
                            />
                            {evidenceFile ? (
                                <div className="flex items-center gap-2 text-purple-700 font-medium">
                                    <FileText size={20} />
                                    <span className="text-sm truncate max-w-[200px]">{evidenceFile.name}</span>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setEvidenceFile(null); }}
                                        className="ml-2 text-red-500 hover:text-red-700"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Upload className="text-gray-400" size={24} />
                                    <span className="text-sm text-gray-500">Haz clic para subir (PDF, JPG, PNG)</span>
                                    <span className="text-xs text-gray-400">Máximo 5MB</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 active:scale-95 transition-all text-sm"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || amount <= 0 || amount > payable.balance_due}
                            className="px-8 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:scale-100 shadow-lg shadow-purple-200 active:scale-95 transition-all flex items-center gap-2 text-sm"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Registrando...
                                </>
                            ) : (
                                'Confirmar Pago'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

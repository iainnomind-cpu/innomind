import React, { useState } from 'react';
import { ChargeNote, useAccountsReceivable } from '@/context/AccountsReceivableContext';
import { X, DollarSign } from 'lucide-react';

interface PaymentModalProps {
    note: ChargeNote;
    onClose: () => void;
}

export default function PaymentModal({ note, onClose }: PaymentModalProps) {
    const { addPayment } = useAccountsReceivable();

    const [monto, setMonto] = useState(note.balance_due);
    const [fechaPago, setFechaPago] = useState(new Date().toISOString().split('T')[0]);
    const [metodoPago, setMetodoPago] = useState('Transferencia');
    const [referencia, setReferencia] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (monto > 0 && monto <= note.balance_due) {
                await addPayment({
                    charge_note_id: note.id,
                    client_id: note.client_id,
                    amount: Number(monto),
                    payment_date: fechaPago,
                    payment_method: metodoPago,
                    reference: referencia,
                    notes: ''
                });
                onClose();
            }
        } catch (err) {
            console.error(err);
            alert('Error registrando el pago');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col border border-gray-200" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Registrar Cobro</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-500 mb-1">
                            Nota de Cargo: <span className="text-gray-900">{note.note_number || 'S/N'}</span>
                        </p>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700">Saldo Pendiente:</span>
                            <span className="text-xl font-bold text-emerald-600">${Number(note.balance_due).toLocaleString()}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Monto a Cobrar *</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="number"
                                min="0.01"
                                max={note.balance_due}
                                step="0.01"
                                value={monto}
                                onChange={e => setMonto(parseFloat(e.target.value) || 0)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-emerald-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Pago</label>
                            <input
                                type="date"
                                value={fechaPago}
                                onChange={e => setFechaPago(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-emerald-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Método</label>
                            <select
                                value={metodoPago}
                                onChange={e => setMetodoPago(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-emerald-500 outline-none bg-white"
                            >
                                <option value="Transferencia">Transferencia</option>
                                <option value="Efectivo">Efectivo</option>
                                <option value="Tarjeta">Tarjeta</option>
                                <option value="Cheque">Cheque</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Referencia / Comentarios</label>
                        <input
                            type="text"
                            placeholder="Ej. SPEI 123456"
                            value={referencia}
                            onChange={e => setReferencia(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-emerald-500 outline-none"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50">Cancelar</button>
                        <button type="submit" disabled={isSubmitting || monto <= 0 || monto > note.balance_due} className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                            {isSubmitting ? 'Registrando...' : 'Confirmar Cobro'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

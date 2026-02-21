import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Plus, Wallet, X, ArrowRightLeft } from 'lucide-react';
import { FinanceAccount } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Treasury() {
    const { accounts, payments, addAccount } = useFinance();
    const [accountModalOpen, setAccountModalOpen] = useState(false);

    const totalCash = accounts.reduce((sum, acc) => sum + acc.saldoActual, 0);
    const recentPayments = [...payments].sort((a, b) => b.fechaPago.getTime() - a.fechaPago.getTime()).slice(0, 10);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">

            {/* Top Overview */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h2 className="text-gray-500 font-medium mb-1">Efectivo Total Disponible (Cajas y Bancos)</h2>
                    <p className="text-4xl font-bold text-gray-900">${totalCash.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <button
                    onClick={() => setAccountModalOpen(true)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 transition shadow-sm font-medium"
                >
                    <Plus size={20} /> Nueva Cuenta
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Accounts List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Wallet className="text-emerald-600" size={20} /> Cuentas Financieras
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {accounts.map(acc => (
                            <div key={acc.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-emerald-200 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold text-gray-900">{acc.nombre}</h4>
                                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                                            {acc.tipo}
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-400">{acc.moneda}</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">${acc.saldoActual.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Recent Movements */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <ArrowRightLeft className="text-blue-600" size={20} /> Útimos Movimientos
                    </h3>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {recentPayments.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">No hay movimientos recientes</div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {recentPayments.map(pay => {
                                    const acc = accounts.find(a => a.id === pay.accountId);
                                    // Hack visual for V1: we don't have standard IN/OUT on payment table directly, 
                                    // but we can infer: if it's connected to a NOTA_CARGO -> It's Income
                                    // if CUENTA_PAGAR/GASTO -> Outflow
                                    // We don't have the doc right here but let's assume if we show the modal we just want to see the money hit the account.
                                    // For now we just show absolute value.
                                    return (
                                        <div key={pay.id} className="p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="font-medium text-gray-900 text-sm">{pay.referencia || 'Pago Registrado'}</p>
                                                <span className="font-bold text-gray-900 text-sm">${pay.monto.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>{format(pay.fechaPago, "dd MMM yyyy", { locale: es })}</span>
                                                <span>{acc?.nombre || 'Sin Cuenta Destino'}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {accountModalOpen && (
                <NewAccountModal onClose={() => setAccountModalOpen(false)} onAdd={addAccount} />
            )}
        </div>
    );
}

function NewAccountModal({ onClose, onAdd }: { onClose: () => void, onAdd: (acc: Omit<FinanceAccount, 'id' | 'saldoActual' | 'updatedAt'>) => Promise<void> }) {
    const [nombre, setNombre] = useState('');
    const [tipo, setTipo] = useState<FinanceAccount['tipo']>('BANCO');
    const [moneda, setMoneda] = useState('MXN');
    const [saldoInicial, setSaldoInicial] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onAdd({
            nombre,
            tipo,
            moneda,
            saldoInicial,
            activo: true
        });
        setIsSubmitting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col border border-gray-200">
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Nueva Cuenta</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Cuenta *</label>
                        <input
                            type="text"
                            value={nombre}
                            placeholder="Ej. BBVA Principal"
                            onChange={e => setNombre(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-slate-900 outline-none"
                            required autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                            <select
                                value={tipo}
                                onChange={e => setTipo(e.target.value as any)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-slate-900 outline-none bg-white"
                            >
                                <option value="BANCO">Banco</option>
                                <option value="CAJA_CHICA">Caja Chica</option>
                                <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                            <select
                                value={moneda}
                                onChange={e => setMoneda(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-slate-900 outline-none bg-white"
                            >
                                <option value="MXN">MXN</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Saldo Inicial</label>
                        <input
                            type="number"
                            min="0" step="0.01"
                            value={saldoInicial}
                            onChange={e => setSaldoInicial(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-slate-900 outline-none"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50">Cancelar</button>
                        <button type="submit" disabled={isSubmitting || !nombre} className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50">
                            Crear Cuenta
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

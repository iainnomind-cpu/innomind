import React, { useState, useEffect } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useAccountsPayable } from '@/context/AccountsPayableContext';
import { useAccountsReceivable } from '@/context/AccountsReceivableContext';
import { useTreasuryIntelligence } from '../hooks/useTreasuryIntelligence';
import {
    Plus, Wallet, ArrowRightLeft, TrendingUp, TrendingDown,
    AlertCircle, CheckCircle2, AlertTriangle,
    Play, RotateCcw, Info
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    ResponsiveContainer, XAxis, YAxis,
    CartesianGrid, Tooltip, ReferenceLine, AreaChart, Area
} from 'recharts';
import { FinanceAccount } from '@/types';

export default function Treasury() {
    const { accounts, addAccount, adjustAccountBalance, transferBetweenAccounts, getAccountMovements } = useFinance();
    const { payables } = useAccountsPayable();
    const { chargeNotes } = useAccountsReceivable();
    const [accountModalOpen, setAccountModalOpen] = useState(false);
    const [transferModalOpen, setTransferModalOpen] = useState(false);
    const [adjustModalOpen, setAdjustModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<any>(null);

    const {
        projection = [],
        scenario,
        setScenario,
        trafficLight,
        simulatePayable,
        simulateReceivable,
        resetSimulations,
        initialBalance = 0,
        simulatedPayableOverrides = {}
    } = useTreasuryIntelligence();

    const totalCash = initialBalance || 0;
    const pendingAR = (chargeNotes || []).reduce((sum: number, n: any) => n && n.status !== 'paid' ? sum + (n.balance_due || 0) : sum, 0);
    const pendingAP = (payables || []).reduce((sum: number, p: any) => p && p.status !== 'paid' ? sum + (p.balance_due || 0) : sum, 0);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen">

            {/* Header & Traffic Light */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h2 className="text-gray-500 font-medium mb-1">Efectivo Total Disponible</h2>
                        <p className="text-4xl font-extrabold text-slate-900">${totalCash.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        <div className="flex gap-4 mt-4">
                            <div className="flex items-center gap-1 text-emerald-600 font-medium">
                                <TrendingUp size={16} /> ${pendingAR.toLocaleString()} por cobrar
                            </div>
                            <div className="flex items-center gap-1 text-rose-600 font-medium">
                                <TrendingDown size={16} /> ${pendingAP.toLocaleString()} por pagar
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setTransferModalOpen(true)}
                            className="flex items-center gap-2 bg-white text-slate-900 border border-gray-200 px-6 py-3 rounded-xl hover:bg-gray-50 transition shadow-sm font-bold"
                        >
                            <ArrowRightLeft size={20} /> Transferir
                        </button>
                        <button
                            onClick={() => setAccountModalOpen(true)}
                            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition shadow-lg font-bold"
                        >
                            <Plus size={20} /> Nueva Cuenta
                        </button>
                    </div>
                </div>

                {/* Traffic Light Card */}
                <div className={`p-6 rounded-2xl border flex flex-col justify-center items-center text-center shadow-sm transition-all duration-500 ${trafficLight.status === 'green' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                    trafficLight.status === 'yellow' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                        'bg-rose-50 border-rose-200 text-rose-900'
                    }`}>
                    <div className="mb-2">
                        {trafficLight.status === 'green' ? <CheckCircle2 size={48} /> :
                            trafficLight.status === 'yellow' ? <AlertTriangle size={48} /> :
                                <AlertCircle size={48} />}
                    </div>
                    <h3 className="font-bold text-lg uppercase tracking-wider">
                        {trafficLight.status === 'green' ? 'Saludable' :
                            trafficLight.status === 'yellow' ? 'Precaución' :
                                'Riesgo de Déficit'}
                    </h3>
                    <p className="text-sm mt-1 font-medium opacity-80">
                        {trafficLight.daysToDeficit && trafficLight.daysToDeficit <= 90
                            ? `Déficit en ${trafficLight.daysToDeficit} días`
                            : 'Sin déficit en 90 días'}
                    </p>
                    {trafficLight.deficitAmount > 0 && (
                        <p className="text-xl font-black mt-2">
                            -${trafficLight.deficitAmount.toLocaleString()}
                        </p>
                    )}
                </div>
            </div>

            {/* Projection Chart & Controls */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Proyección de Flujo de Caja (90 Días)</h3>
                        <p className="text-sm text-gray-500">Saldo proyectado considerando CxC, CxP y gastos recurrentes</p>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        {(['optimistic', 'realistic', 'pessimistic'] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setScenario(s)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${scenario === s
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-[400px] w-full" style={{ minHeight: '400px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={projection || []}>
                            <defs>
                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={trafficLight?.status === 'red' ? '#f43f5e' : '#10b981'} stopOpacity={0.1} />
                                    <stop offset="95%" stopColor={trafficLight?.status === 'red' ? '#f43f5e' : '#10b981'} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(date) => date ? format(new Date(date), 'MMM dd', { locale: es }) : ''}
                                stroke="#94a3b8"
                                fontSize={12}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={12}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => `$${(value || 0).toLocaleString()}`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                labelFormatter={(date) => date ? format(new Date(date), 'eeee, dd MMMM yyyy', { locale: es }) : ''}
                                formatter={(value: any) => [`$${Number(value || 0).toLocaleString()}`, 'Saldo Proyectado']}
                            />
                            <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={2} />
                            {trafficLight?.deficitDate && (
                                <ReferenceLine x={new Date(trafficLight.deficitDate).getTime()} stroke="#f43f5e" strokeDasharray="3 3" label={{ position: 'top', value: 'Déficit', fill: '#e11d48', fontSize: 12, fontWeight: 'bold' }} />
                            )}
                            <Area
                                type="monotone"
                                dataKey="balance"
                                stroke={trafficLight?.status === 'red' ? '#f43f5e' : '#10b981'}
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorBalance)"
                                animationDuration={1000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Simulator Panel */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Play className="text-indigo-600" size={20} /> Simulador de Decisiones
                            </h3>
                            <button
                                onClick={resetSimulations}
                                className="text-gray-400 hover:text-rose-600 transition-colors"
                                title="Resetear simulaciones"
                            >
                                <RotateCcw size={18} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">Cuentas por Pagar (Diferir)</label>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {((payables || []).filter(p => p && p.status !== 'paid')).map(p => {
                                        const isSimulated = simulatedPayableOverrides[p.id];
                                        return (
                                            <div key={p.id} className={`p-3 rounded-xl border transition-all ${isSimulated ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-100'}`}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className="text-xs font-bold text-gray-900 truncate pr-2">{p.concept}</p>
                                                    <p className="text-xs font-black text-rose-600">-${(p.balance_due || 0).toLocaleString()}</p>
                                                </div>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-[10px] text-gray-400">Vence: {p.due_date ? format(new Date(p.due_date), 'dd MMM') : 'N/A'}</span>
                                                    <select
                                                        className="text-[10px] bg-white border border-gray-200 rounded px-1 outline-none"
                                                        value={isSimulated?.dueDate ? 'deferred' : 'original'}
                                                        onChange={(e) => {
                                                            if (e.target.value === 'deferred') {
                                                                simulatePayable(p.id, addDays(new Date(p.due_date), 30));
                                                            } else {
                                                                simulatePayable(p.id, undefined);
                                                            }
                                                        }}
                                                    >
                                                        <option value="original">Pagar a tiempo</option>
                                                        <option value="deferred">Diferir 30 días</option>
                                                    </select>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">Cobranza (Acelerar)</label>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {((chargeNotes || []).filter(n => n && n.status !== 'paid')).map(n => (
                                        <div key={n.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="text-xs font-bold text-gray-900 truncate pr-2">{n.prospect?.empresa || 'Cliente s/n'}</p>
                                                <p className="text-xs font-black text-emerald-600">+${(n.balance_due || 0).toLocaleString()}</p>
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-[10px] text-gray-400">Vence: {n.due_date ? format(new Date(n.due_date), 'dd MMM') : 'N/A'}</span>
                                                <button
                                                    onClick={() => simulateReceivable(n.id, addDays(new Date(), 1))}
                                                    className="text-[10px] bg-emerald-600 text-white font-bold rounded px-2 py-0.5 hover:bg-emerald-700"
                                                >
                                                    Cobrar MAÑANA
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recommendations & Movements */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Recommendations Panel */}
                    <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl overflow-hidden relative">
                        <div className="absolute top-[-20px] right-[-20px] opacity-10">
                            <Info size={120} />
                        </div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <AlertCircle className="text-amber-400" size={24} /> Recomendaciones Estratégicas
                        </h3>
                        <div className="space-y-4">
                            {trafficLight.status === 'red' ? (
                                <>
                                    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                                        <p className="font-bold text-amber-300">Diferir Pagos Críticos</p>
                                        <p className="text-sm opacity-80 mt-1">Diferir los pagos de los próximos 7 días por una semana mejoraría tu liquidez inmediata en un 15%.</p>
                                    </div>
                                    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                                        <p className="font-bold text-emerald-300">Factoring o Anticipos</p>
                                        <p className="text-sm opacity-80 mt-1">Detectamos {chargeNotes.length} facturas pendientes. Solicitar un pronto pago con 2% de descuento podría cubrir el déficit proyectado.</p>
                                    </div>
                                </>
                            ) : (
                                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                                    <p className="font-bold text-emerald-300">Excedente Optimizado</p>
                                    <p className="text-sm opacity-80 mt-1">¡Tu flujo es sólido! Considera invertir el excedente de fin de mes o adelantar pagos a proveedores para obtener descuentos por pronto pago.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Financial Accounts */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Wallet className="text-emerald-600" size={20} /> Cuentas Financieras
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            {(accounts || []).map(acc => (
                                <div key={acc.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-all group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-bold text-gray-900">{acc.nombre}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter bg-gray-200/50 px-2 py-0.5 rounded-full">{acc.tipo}</span>
                                                <span className="text-[10px] font-bold text-gray-400">Actualizado: {acc.updatedAt ? format(acc.updatedAt, 'dd MMM HH:mm') : 'N/A'}</span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-slate-300">{acc.moneda}</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <p className="text-2xl font-black text-slate-900">${(acc.saldoActual || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setSelectedAccount(acc); setAdjustModalOpen(true); }}
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                                                title="Ajustar Saldo"
                                            >
                                                <TrendingUp size={18} />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedAccount(acc); setHistoryModalOpen(true); }}
                                                className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-white rounded-lg transition-all"
                                                title="Ver Movimientos"
                                            >
                                                <ArrowRightLeft size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {accountModalOpen && (
                <NewAccountModal onClose={() => setAccountModalOpen(false)} onAdd={addAccount} />
            )}
            {transferModalOpen && (
                <TransferModal
                    accounts={accounts}
                    onClose={() => setTransferModalOpen(false)}
                    onTransfer={transferBetweenAccounts}
                />
            )}
            {adjustModalOpen && selectedAccount && (
                <AdjustBalanceModal
                    account={selectedAccount}
                    onClose={() => { setAdjustModalOpen(false); setSelectedAccount(null); }}
                    onAdjust={adjustAccountBalance}
                />
            )}
            {historyModalOpen && selectedAccount && (
                <AccountMovementsModal
                    account={selectedAccount}
                    onClose={() => { setHistoryModalOpen(false); setSelectedAccount(null); }}
                    fetchMovements={getAccountMovements}
                />
            )}
        </div>
    );
}


function TransferModal({ accounts, onClose, onTransfer }: { accounts: any[], onClose: () => void, onTransfer: any }) {
    const [sourceId, setSourceId] = useState('');
    const [targetId, setTargetId] = useState('');
    const [amount, setAmount] = useState(0);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const sourceAcc = accounts.find(a => a.id === sourceId);
    const isValid = sourceId && targetId && sourceId !== targetId && amount > 0 && amount <= (sourceAcc?.saldoActual || 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;

        if (!amount || !sourceId || !targetId) {
            alert("Todos los campos son obligatorios");
            return;
        }

        setIsSubmitting(true);
        try {
            await onTransfer(sourceId, targetId, amount, description);
            onClose();
        } catch (error: any) {
            console.error("Error al transferir:", error);
            alert("Error al realizar la transferencia. Verifique los datos.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-md">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden">
                <div className="p-8 border-b border-gray-100">
                    <h2 className="text-2xl font-black text-gray-900">Transferir Dinero</h2>
                    <p className="text-sm text-gray-500">Mueve fondos entre tus cuentas o cajas</p>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase mb-2">Origen</label>
                            <select
                                value={sourceId} onChange={e => setSourceId(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none"
                            >
                                <option value="">Seleccionar...</option>
                                {accounts.map(a => <option key={a.id} value={a.id}>{a.nombre} (${(a.saldoActual || 0).toLocaleString()})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase mb-2">Destino</label>
                            <select
                                value={targetId} onChange={e => setTargetId(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none"
                            >
                                <option value="">Seleccionar...</option>
                                {accounts.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase mb-2">Monto</label>
                        <input
                            type="number" value={amount} onChange={e => setAmount(Number(e.target.value))}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase mb-2">Descripción</label>
                        <input
                            type="text" value={description} onChange={e => setDescription(e.target.value)}
                            placeholder="Motivo de la transferencia"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl">Cancelar</button>
                        <button disabled={!isValid || isSubmitting} className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 disabled:opacity-30 shadow-xl shadow-slate-200">
                            Transferir
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function AdjustBalanceModal({ account, onClose, onAdjust }: { account: any, onClose: () => void, onAdjust: any }) {
    const [type, setType] = useState<'aumentar' | 'disminuir'>('aumentar');
    const [amount, setAmount] = useState(0);
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (amount <= 0 || !reason) {
            alert("El monto debe ser mayor a 0 y el motivo es obligatorio");
            return;
        }

        setIsSubmitting(true);
        try {
            await onAdjust(account.id, amount, type, reason);
            onClose();
        } catch (error) {
            console.error("Error al ajustar saldo:", error);
            alert("Error al aplicar el ajuste. Intentelo de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-md">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden">
                <div className="p-8 border-b border-gray-100">
                    <h2 className="text-2xl font-black text-gray-900">Ajustar Saldo</h2>
                    <p className="text-sm text-gray-500">{account.nombre} (Actual: ${account.saldoActual.toLocaleString()})</p>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-2xl">
                        <button
                            type="button" onClick={() => setType('aumentar')}
                            className={`py-2 rounded-xl text-xs font-bold transition-all ${type === 'aumentar' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
                        >
                            Aumentar (+)
                        </button>
                        <button
                            type="button" onClick={() => setType('disminuir')}
                            className={`py-2 rounded-xl text-xs font-bold transition-all ${type === 'disminuir' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500'}`}
                        >
                            Disminuir (-)
                        </button>
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase mb-2">Monto del Ajuste</label>
                        <input
                            type="number" value={amount} onChange={e => setAmount(Number(e.target.value))}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase mb-2">Motivo / Descripción</label>
                        <textarea
                            value={reason} onChange={e => setReason(e.target.value)}
                            placeholder="Explica por qué se realiza este ajuste"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none h-24 resize-none"
                            required
                        />
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl">Cancelar</button>
                        <button disabled={amount <= 0 || !reason || isSubmitting} className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 disabled:opacity-30">
                            Aplicar Ajuste
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function AccountMovementsModal({ account, onClose, fetchMovements }: { account: any, onClose: () => void, fetchMovements: any }) {
    const [movements, setMovements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchMovements(account.id);
                setMovements(data || []);
            } catch (err) {
                console.error("Error loading account movements:", err);
                setMovements([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [account.id]);

    return (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-md">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Historial de Movimientos</h2>
                        <p className="text-sm text-gray-500">{account.nombre}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold">Cerrar</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {loading ? (
                        <div className="p-12 text-center text-gray-400 animate-pulse">Cargando movimientos...</div>
                    ) : movements.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">No hay movimientos registrados para esta cuenta</div>
                    ) : (
                        <div className="overflow-hidden border border-gray-100 rounded-2xl">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-4 py-3">Fecha</th>
                                        <th className="px-4 py-3">Tipo</th>
                                        <th className="px-4 py-3">Descripción</th>
                                        <th className="px-4 py-3 text-right">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {(movements || []).map(m => (
                                        <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4 text-xs text-gray-500 whitespace-nowrap">
                                                {m.movement_date ? format(new Date(m.movement_date), 'dd MMM yyyy HH:mm') : 'N/A'}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${m.movement_type === 'transfer_in' || m.movement_type === 'deposit' ? 'bg-emerald-50 text-emerald-600' :
                                                    m.movement_type === 'transfer_out' || m.movement_type === 'withdrawal' ? 'bg-rose-50 text-rose-600' :
                                                        'bg-indigo-50 text-indigo-600'
                                                    }`}>
                                                    {(m.movement_type || '').replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-xs text-gray-900 font-medium">{m.description}</td>
                                            <td className={`px-4 py-4 text-xs font-black text-right ${m.movement_type && (m.movement_type.includes('in') || m.movement_type === 'deposit' || (m.movement_type === 'adjustment' && m.amount > 0)) ? 'text-emerald-600' : 'text-rose-600'
                                                }`}>
                                                {m.movement_type && (m.movement_type.includes('out') || m.movement_type === 'withdrawal') ? '-' : ''}${(m.amount || 0).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function NewAccountModal({ onClose, onAdd }: { onClose: () => void, onAdd: (acc: Omit<FinanceAccount, 'id' | 'saldoActual' | 'updatedAt'>) => Promise<void> }) {
    const [nombre, setNombre] = useState('');
    const [tipo, setTipo] = useState<any>('BANCO');
    const [moneda, setMoneda] = useState('MXN');
    const [saldoInicial, setSaldoInicial] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onAdd({ nombre, tipo, moneda, saldoInicial, activo: true });
        setIsSubmitting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-md">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col border border-gray-200 overflow-hidden">
                <div className="p-8 border-b border-gray-100">
                    <h2 className="text-2xl font-black text-gray-900">Nueva Cuenta</h2>
                    <p className="text-sm text-gray-500">Agrega una caja o banco al sistema</p>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase mb-2">Nombre</label>
                        <input
                            type="text"
                            value={nombre}
                            placeholder="Ej. Banco Principal"
                            onChange={e => setNombre(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                            required autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase mb-2">Tipo</label>
                            <select
                                value={tipo}
                                onChange={e => setTipo(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                            >
                                <option value="BANCO">Banco</option>
                                <option value="CAJA_CHICA">Caja Chica</option>
                                <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase mb-2">Moneda</label>
                            <select
                                value={moneda}
                                onChange={e => setMoneda(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                            >
                                <option value="MXN">MXN</option>
                                <option value="USD">USD</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase mb-2">Saldo Inicial</label>
                        <input
                            type="number"
                            min="0" step="0.01"
                            value={saldoInicial}
                            onChange={e => setSaldoInicial(parseFloat(e.target.value) || 0)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all">Cancelar</button>
                        <button type="submit" disabled={isSubmitting || !nombre} className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xl shadow-slate-200">
                            Crear Cuenta
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


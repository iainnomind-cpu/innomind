import React, { useState, useEffect, useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useAccountsPayable } from '@/context/AccountsPayableContext';
import { useAccountsReceivable } from '@/context/AccountsReceivableContext';
import { useTreasuryIntelligence } from '../hooks/useTreasuryIntelligence';
import {
    Plus, Wallet, ArrowRightLeft, TrendingUp, TrendingDown,
    AlertCircle, CheckCircle2, AlertTriangle,
    Play, RotateCcw, Upload, FileSpreadsheet,
    X
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    ResponsiveContainer, XAxis, YAxis,
    CartesianGrid, Tooltip, ReferenceLine, ComposedChart, Area, Line, BarChart, Bar
} from 'recharts';
import { FinanceAccount } from '@/types';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/context/WorkspaceContext';

export default function Treasury() {
    const { 
        accounts, 
        addAccount, 
        adjustAccountBalance, 
        transferBetweenAccounts, 
        getAccountMovements, 
        refreshFinanceData 
    } = useFinance();
    const { payables } = useAccountsPayable();
    const { chargeNotes } = useAccountsReceivable();
    
    const [accountModalOpen, setAccountModalOpen] = useState(false);
    const [transferModalOpen, setTransferModalOpen] = useState(false);
    const [adjustModalOpen, setAdjustModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [csvImportModalOpen, setCsvImportModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<any>(null);
    const [filterAccountType, setFilterAccountType] = useState<string>('ALL');

    const {
        projection = [],
        scenario,
        setScenario,
        trafficLight,
        cfoAlert,
        customerScoring,
        simulatePayable,
        simulateReceivable,
        resetSimulations,
        initialBalance = 0,
        simulatedPayableOverrides = {},
        simulatedReceivableOverrides = {},
        applySimulatedOverridesInDB,
        isApplyingOverrides
    } = useTreasuryIntelligence();

    const totalCash = initialBalance || 0;
    const pendingAR = (chargeNotes || []).reduce((sum: number, n: any) => n && n.status !== 'paid' ? sum + (n.balance_due || 0) : sum, 0);
    const pendingAP = (payables || []).reduce((sum: number, p: any) => p && p.status !== 'paid' ? sum + (p.balance_due || 0) : sum, 0);

    // Filter accounts by type if requested
    const filteredAccounts = useMemo(() => {
        if (filterAccountType === 'ALL') return accounts;
        return (accounts || []).filter(acc => acc.tipo === filterAccountType);
    }, [accounts, filterAccountType]);

    // Check if there are active simulation overrides to show the "Apply" panel
    const hasSimulations = Object.keys(simulatedPayableOverrides).length > 0 || Object.keys(simulatedReceivableOverrides).length > 0;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
            {/* Top Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        Cash Intelligence & Tesorería
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Previsiones y simulación inteligente de flujo de caja a 90 días en tiempo real.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setCsvImportModalOpen(true)}
                        className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2.5 rounded-xl hover:bg-emerald-100 transition shadow-sm font-bold text-sm"
                    >
                        <Upload size={18} /> Importar CSV
                    </button>
                    <button
                        onClick={() => setTransferModalOpen(true)}
                        className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition shadow-sm font-bold text-sm"
                    >
                        <ArrowRightLeft size={18} /> Transferir
                    </button>
                    <button
                        onClick={() => setAccountModalOpen(true)}
                        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl hover:bg-slate-800 transition shadow-md font-bold text-sm"
                    >
                        <Plus size={18} /> Nueva Cuenta
                    </button>
                </div>
            </div>

            {/* Consolidated Cash & Runway KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Total Cash Card */}
                <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Efectivo Total Disponible</span>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-3xl font-black text-slate-900">${totalCash.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            <span className="text-xs font-bold text-slate-400">MXN</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-2 text-emerald-600">
                            <div className="p-2 bg-emerald-50 rounded-lg"><TrendingUp size={16} /></div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 block">Por Cobrar (CxC)</span>
                                <span className="text-sm font-extrabold">${pendingAR.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-rose-600">
                            <div className="p-2 bg-rose-50 rounded-lg"><TrendingDown size={16} /></div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 block">Por Pagar (CxP)</span>
                                <span className="text-sm font-extrabold">${pendingAP.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Runway Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Runway de Liquidez</span>
                        <div className="flex items-baseline gap-1 mt-2">
                            <span className="text-4xl font-black text-slate-800">
                                {trafficLight.runwayDays === 999 ? '90+' : trafficLight.runwayDays}
                            </span>
                            <span className="text-sm font-bold text-slate-500">Días</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Días estimados antes de agotar la caja.</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400">Burn Rate Diario:</span>
                        <span className="text-xs font-extrabold text-slate-700">${Math.round(trafficLight.burnRate).toLocaleString()} / día</span>
                    </div>
                </div>

                {/* Traffic Light Card */}
                <div className={`p-6 rounded-2xl border flex flex-col justify-between shadow-sm transition-all duration-300 ${
                    trafficLight.status === 'green' ? 'bg-emerald-50/60 border-emerald-100 text-emerald-950' :
                    trafficLight.status === 'yellow' ? 'bg-amber-50/60 border-amber-100 text-amber-950' :
                    'bg-rose-50/60 border-rose-100 text-rose-950'
                }`}>
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-bold uppercase tracking-wider opacity-60">Semáforo de Riesgo</span>
                        <div className="mt-1">
                            {trafficLight.status === 'green' ? <CheckCircle2 className="text-emerald-600" size={32} /> :
                             trafficLight.status === 'yellow' ? <AlertTriangle className="text-amber-600" size={32} /> :
                             <AlertCircle className="text-rose-600" size={32} />}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-black text-lg uppercase tracking-wide">
                            {trafficLight.status === 'green' ? 'Flujo Saludable' :
                             trafficLight.status === 'yellow' ? 'Precaución Requerida' :
                             'Riesgo Inminente'}
                        </h3>
                        <p className="text-xs mt-1 opacity-70">
                            {trafficLight.daysToDeficit 
                                ? `Proyección cae en déficit en el día ${trafficLight.daysToDeficit}`
                                : 'Sin caídas por debajo de $0 a 90 días.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* CFO Alerts Banner */}
            {cfoAlert.hasAlert && (
                <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-red-500/10 border border-amber-200/60 p-6 rounded-2xl shadow-sm space-y-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-rose-500 flex-shrink-0 mt-0.5" size={24} />
                        <div className="flex-1">
                            <h3 className="text-base font-extrabold text-slate-900">Alerta de Caja CFO: Déficit Proyectado Detectado</h3>
                            <p className="text-sm text-slate-600 mt-1">
                                El balance caerá por debajo del umbral de seguridad de -$5,000 MXN el día{' '}
                                <strong className="text-rose-600 font-bold">
                                    {cfoAlert.criticalDate ? format(cfoAlert.criticalDate, 'dd/MM/yyyy') : 'N/A'}
                                </strong>
                                . Gap financiero estimado: <strong className="text-slate-900 font-bold">${cfoAlert.gapAmount.toLocaleString()}</strong>.
                            </p>
                        </div>
                    </div>

                    {/* Quick Recommendations buttons */}
                    <div className="pt-2">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Acciones de Mitigación Recomendadas:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {cfoAlert.suggestedDeferrals.slice(0, 1).map(p => (
                                <div key={p.id} className="bg-white/80 p-3 rounded-xl border border-slate-100 flex justify-between items-center text-xs shadow-sm">
                                    <div className="truncate pr-2">
                                        <span className="font-extrabold text-slate-800 block truncate">{p.concept}</span>
                                        <span className="text-slate-400 font-medium">Monto: ${p.amount.toLocaleString()} | Vence: {format(new Date(p.due_date), 'dd/MM')}</span>
                                    </div>
                                    <button
                                        onClick={() => simulatePayable(p.id, addDays(new Date(p.due_date), 30))}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-3 py-1.5 rounded-lg transition whitespace-nowrap"
                                    >
                                        Diferir 30d
                                    </button>
                                </div>
                            ))}
                            {cfoAlert.suggestedAccelerations.slice(0, 1).map(n => (
                                <div key={n.id} className="bg-white/80 p-3 rounded-xl border border-slate-100 flex justify-between items-center text-xs shadow-sm">
                                    <div className="truncate pr-2">
                                        <span className="font-extrabold text-slate-800 block truncate">{n.prospect?.empresa || 'Cliente s/n'}</span>
                                        <span className="text-slate-400 font-medium">Monto: ${n.total_amount.toLocaleString()} | Cobro programado: {format(new Date(n.due_date), 'dd/MM')}</span>
                                    </div>
                                    <button
                                        onClick={() => simulateReceivable(n.id, undefined, true)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1.5 rounded-lg transition whitespace-nowrap"
                                    >
                                        Garantizar Mañana
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Projection Dashboard (Charts & Scenario Selectors) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Proyecciones de Caja a 90 Días</h3>
                        <p className="text-xs text-slate-500">Haz clic en los escenarios para cambiar la simulación activa.</p>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        {([
                            { key: 'optimista', label: 'Optimista' },
                            { key: 'conservador', label: 'Conservador' },
                            { key: 'critico', label: 'Crítico' }
                        ] as const).map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setScenario(key)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                    scenario === key
                                        ? 'bg-white text-slate-950 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Composed Chart: Area for active scenario balance, and dashed lines for Optimistic & Critical */}
                <div className="space-y-4">
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={projection} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorBalanceActive" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={
                                            scenario === 'optimista' ? '#3b82f6' :
                                            scenario === 'critico' ? '#ef4444' : '#10b981'
                                        } stopOpacity={0.15} />
                                        <stop offset="95%" stopColor={
                                            scenario === 'optimista' ? '#3b82f6' :
                                            scenario === 'critico' ? '#ef4444' : '#10b981'
                                        } stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(date) => date ? format(new Date(date), 'dd MMM', { locale: es }) : ''}
                                    stroke="#94a3b8"
                                    fontSize={10}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={10}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `$${(value || 0).toLocaleString()}`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)' }}
                                    labelFormatter={(date) => date ? format(new Date(date), 'eeee, dd MMMM yyyy', { locale: es }) : ''}
                                    formatter={(value: any, name?: any) => {
                                        let label = 'Saldo';
                                        if (name === 'balance') label = 'Escenario Activo';
                                        else if (name === 'balanceOptimista') label = 'Optimista';
                                        else if (name === 'balanceCritico') label = 'Crítico';
                                        else if (name === 'balanceConservador') label = 'Conservador';
                                        return [`$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, label];
                                    }}
                                />
                                <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={1} />
                                <Area
                                    type="monotone"
                                    dataKey="balance"
                                    stroke={
                                        scenario === 'optimista' ? '#3b82f6' :
                                        scenario === 'critico' ? '#ef4444' : '#10b981'
                                    }
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorBalanceActive)"
                                    animationDuration={600}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="balanceOptimista"
                                    stroke="#3b82f6"
                                    strokeWidth={1.5}
                                    strokeDasharray="4 4"
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="balanceConservador"
                                    stroke="#10b981"
                                    strokeWidth={1.5}
                                    strokeDasharray="4 4"
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="balanceCritico"
                                    stroke="#ef4444"
                                    strokeWidth={1.5}
                                    strokeDasharray="4 4"
                                    dot={false}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Daily Inflows vs Outflows chart underneath */}
                    <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Entradas vs Salidas Diarias</h4>
                        <div className="h-[100px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={projection} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                                    <XAxis
                                        dataKey="date"
                                        tick={false}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        stroke="#94a3b8"
                                        fontSize={9}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(value) => `$${(value || 0).toLocaleString()}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9' }}
                                        labelFormatter={(date) => date ? format(new Date(date), 'dd MMMM yyyy', { locale: es }) : ''}
                                        formatter={(value: any, name?: any) => {
                                            const label = name === 'inflow' ? 'Ingresos (CxC)' : 'Egresos (CxP / Recurrente)';
                                            return [`$${Number(value || 0).toLocaleString()}`, label];
                                        }}
                                    />
                                    <Bar dataKey="inflow" fill="#10b981" stackId="stack" radius={[2, 2, 0, 0]} />
                                    <Bar dataKey="outflow" fill="#ef4444" stackId="stack" radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Actions Panel: Simulator + Accounts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Simulator Panel (CFO simulator console) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                        <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
                            <Play className="text-indigo-600" size={20} /> Consola de Simulación CFO
                        </h3>
                        <button
                            onClick={resetSimulations}
                            disabled={!hasSimulations}
                            className="text-slate-400 hover:text-rose-600 transition disabled:opacity-30 flex items-center gap-1 text-xs font-bold"
                            title="Resetear simulaciones"
                        >
                            <RotateCcw size={14} /> Resetear
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Accounts Receivable (Accelerate Inflows) */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Cobros Recibibles (CxC)</span>
                                <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">Acelerar Cobro</span>
                            </div>
                            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                                {(chargeNotes || [])
                                    .filter(n => n && n.status !== 'paid')
                                    .map(n => {
                                        const isSimulated = simulatedReceivableOverrides[n.id];
                                        const clientRisk = customerScoring[n.client_id] || 'low';
                                        
                                        return (
                                            <div 
                                                key={n.id} 
                                                className={`p-3 rounded-xl border transition-all ${
                                                    isSimulated?.accelerated 
                                                        ? 'bg-emerald-50 border-emerald-200' 
                                                        : 'bg-slate-50 border-slate-100'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="truncate max-w-[70%]">
                                                        <span className="text-xs font-bold text-slate-950 block truncate">
                                                            {n.prospect?.empresa || 'Cliente s/n'}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 block">Folio: {n.note_number || 'S/F'}</span>
                                                    </div>
                                                    <span className="text-xs font-extrabold text-emerald-600">
                                                        +${(n.balance_due || n.total_amount || 0).toLocaleString()}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                                        clientRisk === 'high' ? 'bg-rose-100 text-rose-700' :
                                                        clientRisk === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-emerald-100 text-emerald-700'
                                                    }`}>
                                                        Riesgo: {clientRisk === 'high' ? 'Alto' : clientRisk === 'medium' ? 'Medio' : 'Bajo'}
                                                    </span>
                                                    <span className="text-[9px] text-slate-400">
                                                        Vence: {format(new Date(n.due_date), 'dd/MM/yyyy')}
                                                    </span>
                                                </div>

                                                <div className="flex justify-end gap-1.5 mt-3 pt-2 border-t border-slate-200/40">
                                                    {isSimulated?.accelerated ? (
                                                        <button
                                                            onClick={() => simulateReceivable(n.id, undefined, undefined)}
                                                            className="text-[10px] bg-slate-200 text-slate-800 font-bold rounded-lg px-2.5 py-1 hover:bg-slate-300"
                                                        >
                                                            Deshacer
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => simulateReceivable(n.id, undefined, true)}
                                                            className="text-[10px] bg-emerald-600 text-white font-bold rounded-lg px-2.5 py-1 hover:bg-emerald-700 transition"
                                                        >
                                                            Cobrar Mañana
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>

                        {/* Accounts Payable (Defer Outflows) */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Cuentas por Pagar (CxP)</span>
                                <span className="text-[10px] font-black px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">Diferir Vencimiento</span>
                            </div>
                            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                                {(payables || [])
                                    .filter(p => p && p.status !== 'paid')
                                    .map(p => {
                                        const isSimulated = simulatedPayableOverrides[p.id];
                                        return (
                                            <div 
                                                key={p.id} 
                                                className={`p-3 rounded-xl border transition-all ${
                                                    isSimulated?.newDueDate 
                                                        ? 'bg-indigo-50 border-indigo-200' 
                                                        : 'bg-slate-50 border-slate-100'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="truncate max-w-[70%]">
                                                        <span className="text-xs font-bold text-slate-950 block truncate">
                                                            {p.concept}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 block truncate">
                                                            {p.supplier?.nombreComercial || 'Proveedor'}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs font-extrabold text-rose-600">
                                                        -${(p.balance_due || p.amount || 0).toLocaleString()}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                                                    <span>Original: {format(new Date(p.due_date), 'dd/MM/yyyy')}</span>
                                                    {isSimulated?.newDueDate && (
                                                        <span className="font-bold text-indigo-600">
                                                            Simulado: {format(isSimulated.newDueDate, 'dd/MM/yyyy')}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex justify-end gap-1.5 mt-3 pt-2 border-t border-slate-200/40">
                                                    <select
                                                        className="text-[10px] bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none font-bold"
                                                        value={isSimulated?.newDueDate ? 'deferred' : 'original'}
                                                        onChange={(e) => {
                                                            if (e.target.value === 'deferred') {
                                                                simulatePayable(p.id, addDays(new Date(p.due_date), 30));
                                                            } else {
                                                                simulatePayable(p.id, undefined);
                                                            }
                                                        }}
                                                    >
                                                        <option value="original">Pagar a tiempo</option>
                                                        <option value="deferred">Diferir 30 Días</option>
                                                    </select>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </div>

                    {/* Apply simulation button banner */}
                    {hasSimulations && (
                        <div className="bg-indigo-50 border border-indigo-200/60 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 transition-all animate-fadeIn">
                            <div>
                                <h4 className="text-sm font-extrabold text-indigo-950">Simulador Activo en Memoria</h4>
                                <p className="text-xs text-indigo-700 mt-0.5">
                                    Tienes cambios simulados que no se han guardado en la base de datos de Supabase.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={resetSimulations}
                                    className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition"
                                >
                                    Descartar
                                </button>
                                <button
                                    onClick={async () => {
                                        if (confirm('¿Estás seguro de que deseas guardar de forma definitiva estas fechas de vencimiento en la base de datos?')) {
                                            await applySimulatedOverridesInDB();
                                            alert('Simulación persistida con éxito en la base de datos.');
                                        }
                                    }}
                                    disabled={isApplyingOverrides}
                                    className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition disabled:opacity-40"
                                >
                                    {isApplyingOverrides ? 'Guardando...' : 'Aplicar Simulador en DB'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Accounts Card List */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                        <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
                            <Wallet className="text-emerald-600" size={20} /> Cuentas Financieras
                        </h3>
                        <select
                            value={filterAccountType}
                            onChange={(e) => setFilterAccountType(e.target.value)}
                            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none font-bold"
                        >
                            <option value="ALL">Todas</option>
                            <option value="BANCO">Bancos</option>
                            <option value="CAJA_CHICA">Caja Chica</option>
                            <option value="TARJETA_CREDITO">Tarjetas de Crédito</option>
                        </select>
                    </div>

                    <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
                        {filteredAccounts.map(acc => (
                            <div 
                                key={acc.id} 
                                className="p-4 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-100/80 hover:border-emerald-100 transition-all group relative flex flex-col justify-between"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="max-w-[70%]">
                                        <h4 className="font-bold text-slate-900 truncate">
                                            {acc.account_alias || acc.nombre}
                                        </h4>
                                        <span className="text-[10px] font-semibold text-slate-400 block truncate">
                                            {acc.bank_name || (acc.tipo === 'CAJA_CHICA' ? 'Caja Física' : 'Banco General')} • **** {acc.last_four_digits || '0000'}
                                        </span>
                                    </div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider bg-slate-200/50 px-2 py-0.5 rounded-full">
                                        {acc.account_subtype || acc.tipo}
                                    </span>
                                </div>

                                <div className="flex justify-between items-end mt-4 pt-2 border-t border-slate-200/20">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 block">Saldo Actual</span>
                                        <p className="text-lg font-black text-slate-950">
                                            ${(acc.saldoActual || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => { setSelectedAccount(acc); setAdjustModalOpen(true); }}
                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition"
                                            title="Ajustar Saldo"
                                        >
                                            <TrendingUp size={16} />
                                        </button>
                                        <button
                                            onClick={() => { setSelectedAccount(acc); setHistoryModalOpen(true); }}
                                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-lg transition"
                                            title="Ver Movimientos"
                                        >
                                            <ArrowRightLeft size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
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
            {csvImportModalOpen && (
                <CSVImportModal
                    accounts={accounts}
                    onClose={() => setCsvImportModalOpen(false)}
                    onImportFinished={async () => {
                        await refreshFinanceData();
                        setCsvImportModalOpen(false);
                    }}
                    getAccountMovements={getAccountMovements}
                />
            )}
        </div>
    );
}

// -------------------------------------------------------------
// SUBCOMPONENTS & MODALS
// -------------------------------------------------------------

function CSVImportModal({ 
    accounts, 
    onClose, 
    onImportFinished,
    getAccountMovements
}: { 
    accounts: FinanceAccount[], 
    onClose: () => void, 
    onImportFinished: () => Promise<void>,
    getAccountMovements: (accountId: string) => Promise<any[]>
}) {
    const { workspace } = useWorkspace();
    const [accountId, setAccountId] = useState('');
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [headers, setHeaders] = useState<string[]>([]);
    const [parsedData, setParsedData] = useState<string[][]>([]);
    
    // Column mappings
    const [dateCol, setDateCol] = useState('');
    const [descCol, setDescCol] = useState('');
    const [amountCol, setAmountCol] = useState('');
    const [refCol, setRefCol] = useState('');

    // Previews & duplication checks
    const [existingMovements, setExistingMovements] = useState<any[]>([]);
    const [selectedRows, setSelectedRows] = useState<Record<number, boolean>>({});
    const [isImporting, setIsImporting] = useState(false);

    // Parse CSV Text RFC 4180 robustly
    const parseCSVText = (text: string, sep: string): string[][] => {
        const lines: string[][] = [];
        let row: string[] = [];
        let inQuotes = false;
        let currentValue = '';

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const nextChar = text[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    currentValue += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === sep && !inQuotes) {
                row.push(currentValue.trim());
                currentValue = '';
            } else if ((char === '\r' || char === '\n') && !inQuotes) {
                if (char === '\r' && nextChar === '\n') {
                    i++;
                }
                row.push(currentValue.trim());
                if (row.some(val => val !== '')) {
                    lines.push(row);
                }
                row = [];
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        if (currentValue || row.length > 0) {
            row.push(currentValue.trim());
            if (row.some(val => val !== '')) {
                lines.push(row);
            }
        }
        return lines;
    };

    // Load existing movements for duplicate check
    useEffect(() => {
        if (!accountId) {
            setExistingMovements([]);
            return;
        }
        getAccountMovements(accountId)
            .then(data => setExistingMovements(data || []))
            .catch(err => console.error("Error loading account movements:", err));
    }, [accountId]);

    // Handle CSV File Upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setCsvFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            
            // Detect separator
            const firstLine = text.split(/[\r\n]+/)[0];
            const commas = (firstLine.match(/,/g) || []).length;
            const semicolons = (firstLine.match(/;/g) || []).length;
            const sep = commas >= semicolons ? ',' : ';';

            // Parse lines
            const allLines = parseCSVText(text, sep);
            if (allLines.length > 0) {
                const csvHeaders = allLines[0];
                setHeaders(csvHeaders);
                setParsedData(allLines.slice(1));

                // Auto-map columns
                const dateIndex = csvHeaders.findIndex(h => /fecha|date|dia/i.test(h));
                const descIndex = csvHeaders.findIndex(h => /concepto|desc|detalle|motivo/i.test(h));
                const amountIndex = csvHeaders.findIndex(h => /monto|amount|cantidad|valor|cargo|abono/i.test(h));
                const refIndex = csvHeaders.findIndex(h => /ref/i.test(h));

                if (dateIndex !== -1) setDateCol(csvHeaders[dateIndex]);
                if (descIndex !== -1) setDescCol(csvHeaders[descIndex]);
                if (amountIndex !== -1) setAmountCol(csvHeaders[amountIndex]);
                if (refIndex !== -1) setRefCol(csvHeaders[refIndex]);
            }
        };
        reader.readAsText(file);
    };

    // Helper functions to parse CSV values
    const parseCSVDate = (dateStr: string): Date => {
        const cleaned = dateStr.replace(/"/g, '').trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
            return new Date(cleaned);
        }
        const parts = cleaned.split(/[-/]/);
        if (parts.length === 3) {
            const p0 = parseInt(parts[0]);
            const p1 = parseInt(parts[1]);
            const p2 = parseInt(parts[2]);
            if (p0 > 12 && p0 <= 31) {
                return new Date(p2, p1 - 1, p0);
            } else if (p1 > 12 && p1 <= 31) {
                return new Date(p2, p0 - 1, p1);
            } else {
                if (parts[0].length === 4) return new Date(p0, p1 - 1, p2);
                return new Date(p2, p1 - 1, p0);
            }
        }
        const parsed = new Date(cleaned);
        return isNaN(parsed.getTime()) ? new Date() : parsed;
    };

    const parseCSVAmount = (amountStr: string): number => {
        const cleaned = amountStr.replace(/[^0-9.-]/g, '');
        const val = parseFloat(cleaned);
        return isNaN(val) ? 0 : val;
    };

    // Map each parsed CSV row to objects
    const mappedRows = useMemo(() => {
        if (!dateCol || !descCol || !amountCol) return [];
        const dateIdx = headers.indexOf(dateCol);
        const descIdx = headers.indexOf(descCol);
        const amountIdx = headers.indexOf(amountCol);
        const refIdx = refCol ? headers.indexOf(refCol) : -1;

        return parsedData.map((row, index) => {
            const rawDate = row[dateIdx] || '';
            const rawDesc = row[descIdx] || '';
            const rawAmount = row[amountIdx] || '';
            const rawRef = refIdx !== -1 ? row[refIdx] : '';

            const date = parseCSVDate(rawDate);
            const amount = parseCSVAmount(rawAmount);
            const description = rawDesc.trim();
            const reference = rawRef.trim();

            // Duplicate detection: check existing movements
            const formattedCSVDate = format(date, 'yyyy-MM-dd');
            const isDuplicate = existingMovements.some(m => {
                const mDate = m.movement_date ? format(new Date(m.movement_date), 'yyyy-MM-dd') : '';
                const mDesc = (m.description || '').toLowerCase().trim();
                const mAmount = Math.abs(Number(m.amount));
                
                return mDate === formattedCSVDate && 
                       mDesc === description.toLowerCase() && 
                       mAmount === Math.abs(amount);
            });

            return {
                index,
                date,
                description,
                amount,
                reference,
                isDuplicate
            };
        });
    }, [parsedData, headers, dateCol, descCol, amountCol, refCol, existingMovements]);

    // Check valid/non-duplicates by default
    useEffect(() => {
        const initialSelections: Record<number, boolean> = {};
        mappedRows.forEach(row => {
            initialSelections[row.index] = !row.isDuplicate;
        });
        setSelectedRows(initialSelections);
    }, [mappedRows]);

    const handleImport = async () => {
        const tenantId = workspace?.id;
        if (!tenantId || !accountId) return;

        setIsImporting(true);
        try {
            const rowsToImport = mappedRows.filter(r => selectedRows[r.index]);
            
            // Loop sequential to guarantee transactional consistency
            for (const row of rowsToImport) {
                const { error } = await supabase.rpc('create_treasury_movement', {
                    p_workspace_id: tenantId,
                    p_account_id: accountId,
                    p_movement_type: 'deposit',
                    p_amount: Math.abs(row.amount),
                    p_description: row.description + (row.reference ? ` (${row.reference})` : ''),
                    p_direction: row.amount >= 0 ? 'in' : 'out',
                    p_category: 'import',
                    p_source_module: 'treasury',
                    p_reference_id: null,
                    p_user_id: (await supabase.auth.getUser()).data.user?.id
                });

                if (error) {
                    console.error("Error importing row:", row, error);
                }
            }

            alert(`Importados con éxito ${rowsToImport.length} movimientos de tesorería.`);
            await onImportFinished();
        } catch (error) {
            console.error("Error during CSV import:", error);
            alert("Error general en el proceso de importación.");
        } finally {
            setIsImporting(false);
        }
    };

    const toggleRow = (index: number) => {
        setSelectedRows(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const toggleAll = () => {
        const anyChecked = Object.values(selectedRows).some(val => val);
        const next: Record<number, boolean> = {};
        mappedRows.forEach(row => {
            next[row.index] = !anyChecked;
        });
        setSelectedRows(next);
    };

    const checkedCount = Object.values(selectedRows).filter(Boolean).length;

    return (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-md">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
                            <FileSpreadsheet size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-slate-900">Asistente de Importación CSV</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Analiza y carga extractos bancarios conciliando duplicados en caliente.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Select Account & File */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Cuenta Destino</label>
                            <select
                                value={accountId} 
                                onChange={e => setAccountId(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-semibold"
                            >
                                <option value="">Seleccione cuenta...</option>
                                {accounts.map(a => (
                                    <option key={a.id} value={a.id}>
                                        {a.account_alias || a.nombre} (${(a.saldoActual || 0).toLocaleString()})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Subir Archivo CSV</label>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                disabled={!accountId}
                                className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 file:cursor-pointer disabled:opacity-50"
                            />
                        </div>
                    </div>

                    {csvFile && headers.length > 0 && (
                        <>
                            {/* Column Mapping Box */}
                            <div className="space-y-3 bg-white p-5 border border-slate-100 rounded-2xl shadow-sm">
                                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Configurar Mapeo de Columnas</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-[10px] text-slate-500 mb-1">Fecha</label>
                                        <select
                                            value={dateCol} 
                                            onChange={e => setDateCol(e.target.value)}
                                            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none font-bold"
                                        >
                                            <option value="">Seleccionar...</option>
                                            {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-500 mb-1">Descripción</label>
                                        <select
                                            value={descCol} 
                                            onChange={e => setDescCol(e.target.value)}
                                            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none font-bold"
                                        >
                                            <option value="">Seleccionar...</option>
                                            {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-500 mb-1">Monto</label>
                                        <select
                                            value={amountCol} 
                                            onChange={e => setAmountCol(e.target.value)}
                                            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none font-bold"
                                        >
                                            <option value="">Seleccionar...</option>
                                            {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-500 mb-1">Referencia (opc)</label>
                                        <select
                                            value={refCol} 
                                            onChange={e => setRefCol(e.target.value)}
                                            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none font-bold"
                                        >
                                            <option value="">Ninguna</option>
                                            {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Table Previews */}
                            {dateCol && descCol && amountCol && (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                                            Previsualización y Detector de Duplicados ({mappedRows.length} filas detectadas)
                                        </h3>
                                        <button 
                                            onClick={toggleAll}
                                            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
                                        >
                                            Marcar/Desmarcar Todos
                                        </button>
                                    </div>

                                    <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm max-h-[300px] overflow-y-auto">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0 border-b border-slate-100">
                                                <tr>
                                                    <th className="px-4 py-3 w-10"></th>
                                                    <th className="px-4 py-3">Fecha</th>
                                                    <th className="px-4 py-3">Descripción</th>
                                                    <th className="px-4 py-3 text-right">Monto</th>
                                                    <th className="px-4 py-3 text-center">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {mappedRows.map(row => (
                                                    <tr 
                                                        key={row.index} 
                                                        className={`hover:bg-slate-50 transition ${row.isDuplicate ? 'bg-amber-50/30' : ''}`}
                                                    >
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={!!selectedRows[row.index]}
                                                                onChange={() => toggleRow(row.index)}
                                                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                                                            {format(row.date, 'dd/MM/yyyy')}
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-900 font-medium truncate max-w-[200px]">
                                                            {row.description}
                                                            {row.reference && <span className="text-[10px] text-slate-400 block truncate">Ref: {row.reference}</span>}
                                                        </td>
                                                        <td className={`px-4 py-3 text-right font-bold ${row.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                            {row.amount >= 0 ? '+' : ''}${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="px-4 py-3 text-center whitespace-nowrap">
                                                            {row.isDuplicate ? (
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200/50">
                                                                    ⚠️ Duplicado
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200/50">
                                                                    ✓ Válido
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-bold">
                        {csvFile ? `${checkedCount} registros seleccionados para importar` : 'Seleccione una cuenta y suba un CSV'}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-50 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={!accountId || !csvFile || checkedCount === 0 || isImporting}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-xs font-black transition disabled:opacity-40 shadow-md"
                        >
                            {isImporting ? 'Importando...' : `Importar ${checkedCount} Registros`}
                        </button>
                    </div>
                </div>
            </div>
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
                                {accounts.map(a => <option key={a.id} value={a.id}>{a.account_alias || a.nombre} (${(a.saldoActual || 0).toLocaleString()})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase mb-2">Destino</label>
                            <select
                                value={targetId} onChange={e => setTargetId(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none"
                            >
                                <option value="">Seleccionar...</option>
                                {accounts.map(a => <option key={a.id} value={a.id}>{a.account_alias || a.nombre}</option>)}
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
                    <p className="text-sm text-gray-500">{account.account_alias || account.nombre} (Actual: ${account.saldoActual.toLocaleString()})</p>
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
                        <p className="text-sm text-gray-500">{account.account_alias || account.nombre}</p>
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
    
    // Normal fields
    const [bankName, setBankName] = useState('');
    const [accountAlias, setAccountAlias] = useState('');
    const [lastFourDigits, setLastFourDigits] = useState('');
    const [accountSubtype, setAccountSubtype] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onAdd({ 
                nombre, 
                tipo, 
                moneda, 
                saldoInicial, 
                activo: true,
                bank_name: bankName || undefined,
                account_alias: accountAlias || undefined,
                last_four_digits: lastFourDigits || undefined,
                account_subtype: accountSubtype || undefined
            });
            onClose();
        } catch (error) {
            console.error("Error al agregar cuenta:", error);
            alert("Error al agregar cuenta. Revisa los datos e intenta de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-md">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-slate-50/50">
                    <h2 className="text-xl font-extrabold text-gray-900">Nueva Cuenta Corporativa</h2>
                    <p className="text-xs text-gray-500 mt-1">Ingresa los detalles bancarios y contables normalizados.</p>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {/* General Name */}
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Nombre Técnico de Cuenta</label>
                        <input
                            type="text"
                            value={nombre}
                            placeholder="Ej. BBVA - Nómina Innomind"
                            onChange={e => setNombre(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm transition-all"
                            required autoFocus
                        />
                    </div>

                    {/* Alias & Bank Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Alias de Cuenta</label>
                            <input
                                type="text"
                                value={accountAlias}
                                placeholder="Ej. Cuenta de Nómina"
                                onChange={e => setAccountAlias(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Nombre del Banco</label>
                            <input
                                type="text"
                                value={bankName}
                                placeholder="Ej. BBVA Bancomer"
                                onChange={e => setBankName(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm transition-all"
                            />
                        </div>
                    </div>

                    {/* Subtype & Last Four Digits */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Subtipo de Cuenta</label>
                            <input
                                type="text"
                                value={accountSubtype}
                                placeholder="Ej. Corriente, Ahorros, Inversiones"
                                onChange={e => setAccountSubtype(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Últimos 4 Dígitos</label>
                            <input
                                type="text"
                                maxLength={4}
                                value={lastFourDigits}
                                placeholder="Ej. 1234"
                                onChange={e => setLastFourDigits(e.target.value.replace(/\D/g, ''))}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm transition-all"
                            />
                        </div>
                    </div>

                    {/* Type & Currency */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Tipo</label>
                            <select
                                value={tipo}
                                onChange={e => setTipo(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-semibold"
                            >
                                <option value="BANCO">Banco</option>
                                <option value="CAJA_CHICA">Caja Chica</option>
                                <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Moneda</label>
                            <select
                                value={moneda}
                                onChange={e => setMoneda(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-semibold"
                            >
                                <option value="MXN">MXN</option>
                                <option value="USD">USD</option>
                            </select>
                        </div>
                    </div>

                    {/* Initial Balance */}
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Saldo Inicial</label>
                        <input
                            type="number"
                            min="0" step="0.01"
                            value={saldoInicial}
                            onChange={e => setSaldoInicial(parseFloat(e.target.value) || 0)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm transition-all"
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold hover:bg-gray-50 rounded-xl border border-slate-200/50 transition">Cancelar</button>
                        <button type="submit" disabled={isSubmitting || !nombre} className="flex-1 py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 disabled:opacity-50 transition shadow-lg shadow-slate-200">
                            Crear Cuenta
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

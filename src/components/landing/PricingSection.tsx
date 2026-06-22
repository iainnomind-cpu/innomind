import React, { useState } from 'react';
import { Check, Zap, Shield, HeartHandshake, BadgePercent, Sparkles, ArrowRight, Code2, CalendarDays, CreditCard } from 'lucide-react';
import { CoreLogo } from '@/components/brand/CoreLogo';
import { TrakLogo } from '@/components/brand/TrakLogo';
import { useModal } from '../../context/ModalContext';

const MONTHLY_PRICE = 299;
const ANNUAL_PRICE = MONTHLY_PRICE * 10; // 2 months free
const ANNUAL_MONTHLY_EQUIV = Math.round(ANNUAL_PRICE / 12);
const ANNUAL_SAVINGS = MONTHLY_PRICE * 12 - ANNUAL_PRICE;

const SYSTEMS = [
    {
        id: 'core',
        logo: 'core',
        name: 'Corē',
        tagline: 'ERP + CRM unificado',
        color: 'from-blue-600/20 to-cyan-600/10',
        border: 'border-blue-500/30 hover:border-blue-400/60',
        glow: 'shadow-blue-500/10',
        badge: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        ctaClass: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30',
        features: [
            'Gestión de clientes (CRM)',
            'Inventario y almacenes',
            'Cotizaciones y ventas',
            'Compras y proveedores',
            'Reportes y dashboards',
            'IA integrada',
        ],
    },
    {
        id: 'trak',
        logo: 'trak',
        name: 'Trak',
        tagline: 'Gestión de proyectos y equipos',
        color: 'from-purple-600/20 to-pink-600/10',
        border: 'border-purple-500/30 hover:border-purple-400/60',
        glow: 'shadow-purple-500/10',
        badge: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        ctaClass: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-600/30',
        features: [
            'Gestión de proyectos',
            'Seguimiento de tareas',
            'Control de tiempo',
            'Facturación por proyecto',
            'Gestión de equipos (RRHH)',
            'Reportes de productividad',
        ],
    },
];

export default function PricingSection({ standalone = false }: { standalone?: boolean }) {
    const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');
    const { openFreeTrial, openDemoModal } = useModal();

    const price = billing === 'monthly' ? MONTHLY_PRICE : ANNUAL_MONTHLY_EQUIV;

    return (
        <section id="pricing" className="relative py-28 overflow-hidden bg-slate-950">
            {/* Ambient background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
                <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-blue-400 mb-6 border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm">
                        <BadgePercent size={15} />
                        <span className="text-xs font-bold uppercase tracking-widest">Planes y Precios</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-5 tracking-tight">
                        Simple, transparente,
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"> sin sorpresas</span>
                    </h2>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Corē y Trak son plataformas independientes. Contrata la que necesitas o combínalas para una operación completa.
                    </p>
                </div>

                {/* Billing toggle */}
                <div className="flex items-center justify-center mb-14">
                    <div className="flex items-center bg-white/5 rounded-full p-1.5 border border-white/10 backdrop-blur-sm gap-1">
                        <button
                            onClick={() => setBilling('monthly')}
                            className={`px-6 py-2 rounded-full font-bold text-sm transition-all duration-300 ${
                                billing === 'monthly'
                                    ? 'bg-white text-slate-900 shadow-md'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Mensual
                        </button>
                        <button
                            onClick={() => setBilling('annual')}
                            className={`px-6 py-2 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                                billing === 'annual'
                                    ? 'bg-white text-slate-900 shadow-md'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Anual
                            <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-black rounded-full">
                                2 MESES GRATIS
                            </span>
                        </button>
                    </div>
                </div>

                {/* 3 Cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">

                    {/* Core Card */}
                    {SYSTEMS.map((sys) => (
                        <div
                            key={sys.id}
                            className={`relative flex flex-col rounded-3xl border backdrop-blur-xl overflow-hidden transition-all duration-300
                                bg-gradient-to-br ${sys.color} ${sys.border} shadow-2xl ${sys.glow}`}
                        >
                            <div className="absolute inset-0 bg-white/[0.04] pointer-events-none" />

                            <div className="relative flex flex-col flex-1 p-8">
                                {/* Logo */}
                                <div className="mb-5">
                                    {sys.logo === 'core'
                                        ? <CoreLogo variant="white" size="sm" showBy={false} glow />
                                        : <TrakLogo variant="white" size="sm" showBy={false} glow />
                                    }
                                    <p className={`inline-flex mt-3 items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${sys.badge}`}>
                                        {sys.tagline}
                                    </p>
                                </div>

                                {/* Price */}
                                <div className="mb-2">
                                    <div className="flex items-end gap-1 leading-none mb-2">
                                        <span className="text-slate-400 font-bold text-lg pb-1.5">MXN $</span>
                                        <span className="text-6xl font-black text-white tracking-tight">{price}</span>
                                        <span className="text-slate-400 font-bold text-base pb-1.5">/mes</span>
                                    </div>

                                    {billing === 'annual' ? (
                                        <div className="space-y-1 mt-2">
                                            <p className="text-slate-400 text-sm">
                                                Se factura <span className="font-bold text-white">MXN ${ANNUAL_PRICE.toLocaleString()}/año</span>
                                            </p>
                                            <p className="text-emerald-400 text-sm font-semibold flex items-center gap-1.5">
                                                <Check size={13} strokeWidth={3} />
                                                Ahorras MXN ${ANNUAL_SAVINGS.toLocaleString()} (2 meses gratis)
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-slate-400 text-sm mt-2">Facturación mensual · Cancela cuando quieras</p>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="border-t border-white/10 my-6" />

                                {/* Features */}
                                <ul className="space-y-3 flex-1 mb-8">
                                    {sys.features.map((f, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
                                                <Check size={10} strokeWidth={3} className="text-emerald-400" />
                                            </div>
                                            <span className="text-slate-300 text-sm">{f}</span>
                                        </li>
                                    ))}
                                    <li className="flex items-start gap-3">
                                        <div className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
                                            <Check size={10} strokeWidth={3} className="text-emerald-400" />
                                        </div>
                                        <span className="text-slate-300 text-sm">Soporte técnico 24/7</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
                                            <Check size={10} strokeWidth={3} className="text-emerald-400" />
                                        </div>
                                        <span className="text-slate-300 text-sm">Actualizaciones automáticas incluidas</span>
                                    </li>
                                </ul>

                                {/* CTA */}
                                <div className="mt-auto space-y-3">
                                    <button
                                        onClick={openFreeTrial}
                                        className={`w-full py-3.5 px-6 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm ${sys.ctaClass}`}
                                    >
                                        <Zap size={16} /> Comenzar Prueba Gratuita
                                    </button>
                                    <p className="text-center text-xs text-slate-500">14 días gratis · Sin tarjeta de crédito</p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Custom Dev Card */}
                    <div className="relative flex flex-col rounded-3xl border border-slate-600/40 hover:border-slate-400/60 backdrop-blur-xl overflow-hidden transition-all duration-300 bg-gradient-to-br from-slate-700/30 to-slate-800/10 shadow-2xl">
                        <div className="absolute inset-0 bg-white/[0.03] pointer-events-none" />

                        <div className="relative flex flex-col flex-1 p-8">
                            {/* Icon */}
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white">
                                    <Code2 size={24} />
                                </div>
                                <div>
                                    <p className="text-white font-black text-lg">Desarrollo a Medida</p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border text-slate-400 bg-white/5 border-white/10">
                                        100% personalizado
                                    </span>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="mb-2">
                                <div className="flex items-end gap-2 leading-none mb-2">
                                    <span className="text-5xl font-black text-white tracking-tight">A Cotizar</span>
                                </div>
                                <p className="text-slate-400 text-sm mt-2">Precio según el alcance del proyecto</p>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-white/10 my-6" />

                            {/* Features */}
                            <ul className="space-y-3 flex-1 mb-8">
                                {[
                                    'Propiedad total del código fuente',
                                    '100% adaptado a tus procesos',
                                    'Integraciones con cualquier sistema',
                                    'Sin cuotas mensuales recurrentes',
                                    'Control completo de tus datos',
                                    'Escalabilidad sin límites',
                                    'Módulos a la medida',
                                    'Soporte dedicado post-entrega',
                                ].map((f, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
                                            <Check size={10} strokeWidth={3} className="text-emerald-400" />
                                        </div>
                                        <span className="text-slate-300 text-sm">{f}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            <div className="mt-auto space-y-3">
                                <button
                                    onClick={() => openDemoModal('Desarrollo a Medida')}
                                    className="w-full py-3.5 px-6 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-xl"
                                >
                                    Solicitar Cotización <ArrowRight size={16} />
                                </button>
                                <p className="text-center text-xs text-slate-500">Respuesta en menos de 24 horas</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Combo note */}
                <div className="mt-10 text-center">
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-sm">
                        <Sparkles size={16} className="text-yellow-400 shrink-0" />
                        <p className="text-sm text-slate-300">
                            <span className="font-bold text-white">¿Necesitas los dos?</span> Contrata Corē y Trak juntos y obtén atención prioritaria. <button onClick={() => openDemoModal('Combo Corē + Trak')} className="text-blue-400 hover:text-blue-300 font-bold underline underline-offset-2 transition-colors">Hablar con un asesor</button>
                        </p>
                    </div>
                </div>

                {/* Trust badges */}
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-center">
                    {[
                        { icon: <Shield size={18} />, title: 'Datos Seguros', desc: 'Encriptados y respaldados 24/7', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
                        { icon: <Zap size={18} />, title: 'Sin Permanencia', desc: 'Cancela cuando quieras', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                        { icon: <HeartHandshake size={18} />, title: 'Soporte 24/7', desc: 'Equipo técnico siempre disponible', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
                    ].map((b, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${b.color}`}>
                                {b.icon}
                            </div>
                            <p className="text-sm font-bold text-white">{b.title}</p>
                            <p className="text-xs text-slate-500">{b.desc}</p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}

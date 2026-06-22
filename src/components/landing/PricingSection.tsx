import React, { useState } from 'react';
import { Check, Sparkles, ArrowRight, Zap, Shield, HeartHandshake, BadgePercent } from 'lucide-react';
import { CoreLogo } from '@/components/brand/CoreLogo';
import { TrakLogo } from '@/components/brand/TrakLogo';
import { useModal } from '../../context/ModalContext';

const MONTHLY_PRICE = 299;
const ANNUAL_PRICE = MONTHLY_PRICE * 10; // 2 months free
const ANNUAL_MONTHLY_EQUIV = Math.round(ANNUAL_PRICE / 12);
const ANNUAL_SAVINGS = MONTHLY_PRICE * 12 - ANNUAL_PRICE;

const FEATURES = [
    "Acceso completo a Corē ERP-CRM",
    "Acceso completo a Trak",
    "IA integrada en módulos clave",
    "Soporte técnico 24/7",
    "Actualizaciones automáticas incluidas",
    "Sin costos de infraestructura",
    "Usuarios ilimitados",
    "Almacenamiento en la nube seguro",
];

export default function PricingSection({ standalone = false }: { standalone?: boolean }) {
    const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');
    const { openFreeTrial, openDemoModal } = useModal();

    const price = billing === 'monthly' ? MONTHLY_PRICE : ANNUAL_MONTHLY_EQUIV;
    const totalBilled = billing === 'annual' ? ANNUAL_PRICE : null;

    return (
        <section id="pricing" className={`py-24 relative overflow-hidden ${standalone ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-900/50'}`}>
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400 mb-6 border border-blue-100 dark:border-blue-800/50">
                        <BadgePercent size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Planes y Precios</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                        Simple, transparente,<br className="hidden md:block" /> sin sorpresas
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Un solo plan que incluye Corē y Trak completos. Paga mensual o anual y ahorra dos meses.
                    </p>
                </div>

                {/* Toggle */}
                <div className="flex items-center justify-center mb-12">
                    <div className="relative flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-1.5 border border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => setBilling('monthly')}
                            className={`relative px-6 py-2 rounded-full font-bold text-sm transition-all duration-300 ${
                                billing === 'monthly'
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            Mensual
                        </button>
                        <button
                            onClick={() => setBilling('annual')}
                            className={`relative px-6 py-2 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                                billing === 'annual'
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            Anual
                            <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-black rounded-full">
                                2 MESES GRATIS
                            </span>
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">

                    {/* SaaS Pricing Card — MAIN */}
                    <div className="relative flex flex-col bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
                        {/* Popular badge */}
                        <div className="absolute top-6 right-6">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-xs font-black rounded-full shadow-lg">
                                <Sparkles size={12} /> MÁS POPULAR
                            </span>
                        </div>

                        <div className="p-8">
                            {/* Logos */}
                            <div className="flex items-center gap-3 mb-6">
                                <CoreLogo variant="blue" size="sm" showBy={false} glow />
                                <span className="text-slate-400 font-medium text-base">&</span>
                                <TrakLogo variant="blue" size="sm" showBy={false} glow />
                            </div>

                            {/* Price */}
                            <div className="mb-2">
                                <div className="flex items-end gap-1">
                                    <span className="text-2xl font-bold text-slate-500 dark:text-slate-400">MXN $</span>
                                    <span className="text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                                        {price}
                                    </span>
                                    <span className="text-xl font-bold text-slate-500 dark:text-slate-400 pb-2">/mes</span>
                                </div>
                                {billing === 'annual' && (
                                    <div className="mt-2 space-y-1">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Se factura <span className="font-bold text-slate-700 dark:text-slate-200">MXN ${ANNUAL_PRICE.toLocaleString()}/año</span>
                                        </p>
                                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                            <Check size={14} /> Ahorras MXN ${ANNUAL_SAVINGS.toLocaleString()} al año (2 meses gratis)
                                        </p>
                                    </div>
                                )}
                                {billing === 'monthly' && (
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                        Se factura mensualmente • Cancela cuando quieras
                                    </p>
                                )}
                            </div>

                            {/* CTA */}
                            <div className="flex flex-col gap-3 mt-8">
                                <button
                                    onClick={openFreeTrial}
                                    className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2 text-base"
                                >
                                    <Zap size={18} /> Comenzar Prueba Gratuita
                                </button>
                                <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                                    14 días gratis • Sin tarjeta de crédito
                                </p>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="px-8 py-1">
                            <div className="border-t border-slate-100 dark:border-slate-700/50" />
                        </div>

                        {/* Features List */}
                        <div className="p-8 pt-6 flex-1">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Todo incluido:</p>
                            <ul className="space-y-3">
                                {FEATURES.map((f, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                                            <Check size={12} strokeWidth={3} className="text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <span className="text-sm text-slate-700 dark:text-slate-300">{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Custom Dev Card */}
                    <div className="flex flex-col rounded-3xl bg-slate-900 dark:bg-black border border-slate-800 shadow-2xl overflow-hidden text-white">
                        <div className="p-8 flex-1 flex flex-col">
                            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="16 18 22 12 16 6"></polyline>
                                    <polyline points="8 6 2 12 8 18"></polyline>
                                </svg>
                            </div>

                            <h3 className="text-2xl font-black text-white mb-2">Desarrollo a Medida</h3>
                            <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                                Un ERP 100% personalizado para tus procesos únicos. Precio según el alcance del proyecto.
                            </p>

                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-5xl font-black text-white">Cotizar</span>
                                <span className="text-slate-400 font-medium">según proyecto</span>
                            </div>

                            <ul className="space-y-3 mb-8 flex-1">
                                {[
                                    "Propiedad total del código fuente",
                                    "100% adaptado a tus procesos",
                                    "Integraciones con cualquier sistema",
                                    "Sin cuotas mensuales recurrentes",
                                    "Control completo de tus datos",
                                    "Escalabilidad sin límites",
                                ].map((f, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                                            <Check size={12} strokeWidth={3} className="text-emerald-400" />
                                        </div>
                                        <span className="text-sm text-slate-300">{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-auto space-y-3">
                                <button
                                    onClick={() => openDemoModal('Desarrollo a Medida')}
                                    className="w-full py-4 px-6 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-base shadow-xl"
                                >
                                    Solicitar Cotización <ArrowRight size={18} />
                                </button>
                                <a
                                    href="/casos-exito"
                                    className="block text-center text-sm font-semibold text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1"
                                >
                                    Ver Casos de Éxito <ArrowRight size={14} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust badges below cards */}
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-center">
                    <div className="flex flex-col items-center gap-2 p-4">
                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Shield size={20} />
                        </div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Datos Seguros</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Encriptados y respaldados 24/7</p>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-4">
                        <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Zap size={20} />
                        </div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Sin Permanencia</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Cancela cuando quieras</p>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-4">
                        <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <HeartHandshake size={20} />
                        </div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Soporte 24/7</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Equipo técnico siempre disponible</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

import React from 'react';
import { Check, Zap, Shield, HeartHandshake, BadgePercent, Sparkles, ArrowRight, Code2, CalendarDays, CreditCard } from 'lucide-react';
import { CoreLogo } from '@/components/brand/CoreLogo';
import { TrakLogo } from '@/components/brand/TrakLogo';
import { useModal } from '../../context/ModalContext';

const MONTHLY_PRICE = 299;
const ANNUAL_PRICE = MONTHLY_PRICE * 10;
const ANNUAL_MONTHLY_EQUIV = Math.round(ANNUAL_PRICE / 12);
const ANNUAL_SAVINGS = MONTHLY_PRICE * 12 - ANNUAL_PRICE;

const SHARED_FEATURES = [
    "Acceso completo a Corē ERP-CRM",
    "Acceso completo a Trak",
    "IA integrada en módulos clave",
    "Soporte técnico 24/7",
    "Actualizaciones automáticas",
    "Sin costos de infraestructura",
];

const PLANS = [
    {
        id: 'monthly',
        icon: <CreditCard size={22} />,
        label: 'Plan Mensual',
        badge: null,
        priceLabel: 'MXN $',
        price: MONTHLY_PRICE,
        priceSuffix: '/mes',
        sub: 'Facturación mensual · Cancela cuando quieras',
        cta: 'Comenzar Prueba Gratuita',
        ctaNote: '14 días gratis · Sin tarjeta de crédito',
        accent: 'from-blue-600/20 to-cyan-600/10',
        border: 'border-blue-500/30 hover:border-blue-400/60',
        glow: 'shadow-blue-500/10',
        ctaClass: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30',
        tag: null,
    },
    {
        id: 'annual',
        icon: <CalendarDays size={22} />,
        label: 'Plan Anual',
        badge: '2 MESES GRATIS',
        priceLabel: 'MXN $',
        price: ANNUAL_MONTHLY_EQUIV,
        priceSuffix: '/mes',
        sub: `Se factura MXN $${ANNUAL_PRICE.toLocaleString()} al año`,
        savings: `Ahorra MXN $${ANNUAL_SAVINGS.toLocaleString()} vs mensual`,
        cta: 'Comenzar Prueba Gratuita',
        ctaNote: '14 días gratis · Sin tarjeta de crédito',
        accent: 'from-purple-600/25 to-blue-600/15',
        border: 'border-purple-500/40 hover:border-purple-400/70',
        glow: 'shadow-purple-500/20',
        ctaClass: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-purple-600/30',
        tag: 'RECOMENDADO',
    },
    {
        id: 'custom',
        icon: <Code2 size={22} />,
        label: 'Desarrollo a Medida',
        badge: null,
        priceLabel: null,
        price: null,
        priceSuffix: null,
        sub: 'Precio según alcance del proyecto',
        cta: 'Solicitar Cotización',
        ctaNote: 'Respuesta en menos de 24 horas',
        accent: 'from-slate-700/40 to-slate-800/20',
        border: 'border-slate-600/40 hover:border-slate-400/60',
        glow: 'shadow-slate-500/10',
        ctaClass: 'bg-white hover:bg-slate-100 text-slate-900 shadow-lg',
        tag: null,
    },
];

const CUSTOM_FEATURES = [
    "Propiedad total del código fuente",
    "100% adaptado a tus procesos",
    "Integraciones con cualquier sistema",
    "Sin cuotas mensuales recurrentes",
    "Control completo de tus datos",
    "Escalabilidad sin límites",
];

export default function PricingSection({ standalone = false }: { standalone?: boolean }) {
    const { openFreeTrial, openDemoModal } = useModal();

    const handleCta = (planId: string) => {
        if (planId === 'custom') {
            openDemoModal('Desarrollo a Medida');
        } else {
            openFreeTrial();
        }
    };

    return (
        <section id="pricing" className="relative py-28 overflow-hidden bg-slate-950 dark:bg-slate-950">
            {/* Ambient background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
                <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-blue-400 mb-6 border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm">
                        <BadgePercent size={15} />
                        <span className="text-xs font-bold uppercase tracking-widest">Planes y Precios</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-5 tracking-tight">
                        Elige el plan perfecto<br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"> para tu empresa</span>
                    </h2>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Corē y Trak incluidos en todos los planes SaaS. Sin costos ocultos.
                    </p>
                </div>

                {/* 3 Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                    {PLANS.map((plan) => {
                        const isCustom = plan.id === 'custom';
                        const isRecommended = plan.tag === 'RECOMENDADO';
                        const features = isCustom ? CUSTOM_FEATURES : SHARED_FEATURES;

                        return (
                            <div
                                key={plan.id}
                                className={`relative flex flex-col rounded-3xl border backdrop-blur-xl overflow-hidden transition-all duration-300
                                    bg-gradient-to-br ${plan.accent}
                                    ${plan.border}
                                    shadow-2xl ${plan.glow}
                                    ${isRecommended ? 'md:-translate-y-4 md:scale-[1.03] ring-1 ring-purple-500/40' : ''}
                                `}
                            >
                                {/* Glassmorphism inner bg */}
                                <div className="absolute inset-0 bg-white/[0.04] pointer-events-none" />

                                {/* Recommended ribbon */}
                                {isRecommended && (
                                    <div className="absolute top-0 left-0 right-0 flex justify-center">
                                        <div className="px-6 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-black tracking-widest uppercase rounded-b-xl flex items-center gap-1.5 shadow-lg">
                                            <Sparkles size={10} /> {plan.tag}
                                        </div>
                                    </div>
                                )}

                                <div className={`relative flex flex-col flex-1 p-8 ${isRecommended ? 'pt-12' : ''}`}>
                                    {/* Icon + Label */}
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white">
                                            {plan.icon}
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-base">{plan.label}</p>
                                            {plan.badge && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                                                    {plan.badge}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Logos for SaaS plans */}
                                    {!isCustom && (
                                        <div className="flex items-center gap-2 mb-5">
                                            <CoreLogo variant="white" size="xs" showBy={false} />
                                            <span className="text-slate-500 text-sm">&</span>
                                            <TrakLogo variant="white" size="xs" showBy={false} />
                                        </div>
                                    )}

                                    {/* Price */}
                                    {!isCustom ? (
                                        <div className="mb-2">
                                            <div className="flex items-end gap-1 leading-none mb-2">
                                                <span className="text-slate-400 font-bold text-lg pb-1.5">MXN $</span>
                                                <span className="text-6xl font-black text-white tracking-tight">{plan.price}</span>
                                                <span className="text-slate-400 font-bold text-base pb-1.5">{plan.priceSuffix}</span>
                                            </div>
                                            <p className="text-slate-400 text-sm">{plan.sub}</p>
                                            {plan.savings && (
                                                <p className="text-emerald-400 text-sm font-semibold mt-1 flex items-center gap-1.5">
                                                    <Check size={13} strokeWidth={3} /> {plan.savings}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="mb-2">
                                            <div className="flex items-end gap-2 leading-none mb-2">
                                                <span className="text-5xl font-black text-white tracking-tight">A Cotizar</span>
                                            </div>
                                            <p className="text-slate-400 text-sm">{plan.sub}</p>
                                        </div>
                                    )}

                                    {/* Divider */}
                                    <div className="border-t border-white/10 my-6" />

                                    {/* Features */}
                                    <ul className="space-y-3 flex-1 mb-8">
                                        {features.map((f, i) => (
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
                                            onClick={() => handleCta(plan.id)}
                                            className={`w-full py-3.5 px-6 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm ${plan.ctaClass}`}
                                        >
                                            {!isCustom && <Zap size={16} />}
                                            {isCustom && <ArrowRight size={16} />}
                                            {plan.cta}
                                        </button>
                                        <p className="text-center text-xs text-slate-500">{plan.ctaNote}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Trust badges */}
                <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-center">
                    {[
                        { icon: <Shield size={18} />, title: 'Datos Seguros', desc: 'Encriptados y respaldados 24/7', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
                        { icon: <Zap size={18} />, title: 'Sin Permanencia', desc: 'Cancela cuando quieras', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                        { icon: <HeartHandshake size={18} />, title: 'Soporte 24/7', desc: 'Equipo técnico siempre disponible', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
                    ].map((b, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
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

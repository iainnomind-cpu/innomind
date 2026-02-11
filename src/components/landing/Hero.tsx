
import React from 'react';
import { Play, ArrowRight, CheckCircle2, TrendingUp, Activity, Brain, DollarSign, Users } from 'lucide-react';
import { useModal } from '../../context/ModalContext';

export default function Hero() {
    const { openFreeTrial } = useModal();
    return (
        <div className="relative w-full min-h-[calc(100vh-80px)] flex items-center overflow-hidden mesh-gradient-bg pt-20">
            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] pointer-events-none"></div>

            <div className="relative w-full max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* Text Content */}
                    <div className="flex flex-col gap-6 md:gap-8 max-w-2xl mx-auto lg:mx-0 text-center lg:text-left z-10">
                        {/* Badge */}
                        <a
                            href="/gpt-4o-integration"
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel self-center lg:self-start border-primary/30 cursor-pointer hover:bg-white/10 transition-colors group"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            <span className="text-xs font-semibold text-white tracking-wide uppercase group-hover:text-primary transition-colors">
                                Nueva Integración GPT-4o Disponible
                            </span>
                            <ArrowRight size={12} className="text-white group-hover:translate-x-1 transition-transform" />
                        </a>

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
                            <span className="block mb-2">Automatice su Empresa con Innomind</span>
                            <span className="block text-2xl md:text-3xl font-bold text-slate-300 mb-4">
                                Plataforma SaaS lista para usar o ERP a la medida de su negocio
                            </span>
                            <span className="block text-xl md:text-2xl font-medium text-slate-400">
                                📊 Reducción promedio de costos operativos: <span className="font-bold text-white">40%</span>
                            </span>
                        </h1>

                        {/* Description */}
                        <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                            Integre ERP, CRM e IA en una sola plataforma. Obtenga insights predictivos y automatice flujos de trabajo complejos. Disponible en modalidad SaaS o desarrollo a la medida.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                            <button onClick={openFreeTrial} className="h-14 px-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-105 flex items-center justify-center gap-2">
                                Comenzar Prueba Gratuita <ArrowRight size={20} />
                            </button>
                            <button className="h-14 px-8 rounded-lg glass-panel hover:bg-white/10 text-white text-lg font-bold border border-white/20 transition-all flex items-center justify-center gap-2 group">
                                <Play size={20} className="fill-current text-white group-hover:scale-110 transition-transform" />
                                Ver Demo
                            </button>
                        </div>

                        <div className="flex items-center justify-center lg:justify-start gap-2 pt-4 text-slate-400 text-sm font-medium">
                            <CheckCircle2 size={16} className="text-green-500" />
                            <span>Sin tarjeta de crédito requerida</span>
                        </div>
                    </div>

                    {/* Dashboard Mockup */}
                    <div className="relative perspective-[2000px] group hidden md:block">
                        {/* Label */}
                        <div className="absolute -top-12 left-0 z-20">
                            <div className="bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-md border border-white/10 shadow-lg">
                                Vista del Panel de Control ERP Innomind
                            </div>
                        </div>

                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                        <div className="relative glass-panel rounded-2xl p-6 transform transition-transform duration-700 hover:rotate-y-[-2deg] hover:rotate-x-[2deg]">

                            {/* Mockup Header */}
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <Activity size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold">Resumen Ejecutivo</h3>
                                        <p className="text-xs text-slate-400">Actualizado hace 2m</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    <span className="text-xs text-green-400 font-medium">Sistema Online</span>
                                </div>
                            </div>

                            {/* Mockup Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="glass-panel p-4 rounded-xl bg-black/20 border-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs text-slate-400">Ingresos Mensuales</span>
                                        <TrendingUp size={16} className="text-green-400" />
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-1">$124,500</div>
                                    <div className="text-xs text-green-400">+12.5% vs mes anterior</div>
                                    {/* Chart lines mock */}
                                    <div className="h-10 mt-3 flex items-end gap-1">
                                        <div className="w-full bg-blue-500/20 h-[40%] rounded-sm"></div>
                                        <div className="w-full bg-blue-500/20 h-[60%] rounded-sm"></div>
                                        <div className="w-full bg-blue-500/20 h-[30%] rounded-sm"></div>
                                        <div className="w-full bg-blue-500/20 h-[70%] rounded-sm"></div>
                                        <div className="w-full bg-blue-500 h-[85%] rounded-sm shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                    </div>
                                </div>

                                <div className="glass-panel p-4 rounded-xl bg-black/20 border-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs text-slate-400">Eficiencia Operativa</span>
                                        <Activity size={16} className="text-blue-400" />
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-1">94.2%</div>
                                    <div className="text-xs text-slate-400">Pico máximo hoy</div>
                                    <div className="mt-3 relative h-10 w-full flex items-center gap-3">
                                        <div className="h-2 flex-1 bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 w-[94%]"></div>
                                        </div>
                                        <span className="text-xs text-white">Alta</span>
                                    </div>
                                </div>
                            </div>

                            {/* AI Insight Mock */}
                            <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-xl p-4 flex gap-4 items-start">
                                <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400 mt-1">
                                    <Brain size={20} />
                                </div>
                                <div>
                                    <h4 className="text-white text-sm font-bold mb-1">Innomind AI Insight</h4>
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Se detectó una oportunidad de optimización en la cadena de suministro.
                                        <span className="text-white font-medium underline decoration-blue-500 decoration-dashed cursor-pointer hover:text-blue-400 ml-1">
                                            Ver reporte completo
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Floating Elements */}
                        <div className="absolute -right-8 top-20 glass-panel p-3 rounded-lg flex items-center gap-3 animate-[bounce_3s_infinite]">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                <DollarSign size={14} />
                            </div>
                            <div>
                                <div className="text-[10px] text-slate-400">Ahorro proyectado</div>
                                <div className="text-sm font-bold text-white">+$12k/año</div>
                            </div>
                        </div>
                        <div className="absolute -left-4 bottom-10 glass-panel p-3 rounded-lg flex items-center gap-3 animate-[bounce_4s_infinite]">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                <Users size={14} />
                            </div>
                            <div>
                                <div className="text-[10px] text-slate-400">Leads calificados</div>
                                <div className="text-sm font-bold text-white">+48 hoy</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

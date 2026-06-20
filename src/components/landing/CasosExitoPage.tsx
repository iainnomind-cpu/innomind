import React, { useState } from 'react';
import { ArrowRight, Building2, Heart, Truck, Factory, ChevronRight, TrendingUp } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const CASOS = [
    {
        id: 1,
        company: "MedCare Hospital",
        industry: "Salud",
        icon: <Heart size={24} className="text-red-500" />,
        image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
        metrics: [
            { label: "Reducción de espera", value: "-45%" },
            { label: "Pacientes atendidos", value: "+120%" },
            { label: "Citas automatizadas", value: "98%" }
        ],
        challenge: "Los pacientes experimentaban largos tiempos de espera y el hospital perdía historiales médicos frecuentemente debido al uso de expedientes en papel.",
        solution: "Implementación de Corē ERP para digitalizar historiales clínicos y conexión de chatbots de IA para programación automática de citas 24/7.",
        result: "MedCare Hospital logró reducir las quejas de los pacientes a casi cero, optimizando el tiempo del personal médico y aumentando su capacidad de atención diaria."
    },
    {
        id: 2,
        company: "Logística Express",
        industry: "Logística",
        icon: <Truck size={24} className="text-blue-500" />,
        image: "https://images.unsplash.com/photo-1586528116311-ad8ed7c1590f?auto=format&fit=crop&w=800&q=80",
        metrics: [
            { label: "Entregas a tiempo", value: "99.9%" },
            { label: "Costos de ruta", value: "-30%" },
            { label: "ROI en", value: "3 meses" }
        ],
        challenge: "La empresa no tenía visibilidad en tiempo real de su flotilla, lo que resultaba en rutas ineficientes, altos costos de combustible y clientes insatisfechos.",
        solution: "Se integró Trak para el monitoreo de rutas en tiempo real y Corē CRM para la comunicación automatizada de estatus de entrega vía WhatsApp.",
        result: "Logística Express ahora opera con márgenes mucho más altos, y sus clientes reciben notificaciones en tiempo real, aumentando la confianza y retención."
    },
    {
        id: 3,
        company: "Acero Muebles",
        industry: "Manufactura",
        icon: <Factory size={24} className="text-orange-500" />,
        image: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=800&q=80",
        metrics: [
            { label: "Productividad", value: "+40%" },
            { label: "Mermas", value: "-60%" },
            { label: "Ventas B2B", value: "+250%" }
        ],
        challenge: "Acero Muebles sufría por desabasto de materia prima crítico debido a un inventario manual en Excel que nunca estaba actualizado.",
        solution: "Implementación completa del ecosistema Innomind: Corē para control de almacenes con alertas de stock mínimo y Trak para gestionar la línea de producción.",
        result: "Lograron eliminar los paros de producción por falta de material y automatizaron sus cotizaciones, logrando cerrar ventas B2B tres veces más rápido."
    }
];

const INDUSTRIES = ["Todas", "Salud", "Logística", "Manufactura", "Retail"];

export default function CasosExitoPage() {
    const [activeFilter, setActiveFilter] = useState("Todas");

    const filteredCasos = activeFilter === "Todas" 
        ? CASOS 
        : CASOS.filter(c => c.industry === activeFilter);

    return (
        <div className="font-display bg-white dark:bg-slate-900 text-slate-900 dark:text-white antialiased min-h-screen flex flex-col relative">
            <Navbar />

            {/* Header */}
            <div className="pt-32 pb-16 relative overflow-hidden bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center justify-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 mb-6">
                        <TrendingUp size={20} className="mr-2" />
                        <span className="text-sm font-bold uppercase tracking-wider">Historias de Éxito</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                        Transformación Real, <br className="hidden md:block"/> Resultados Tangibles
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                        Descubre cómo empresas líderes de diversas industrias están escalando sus operaciones, automatizando procesos y aumentando sus ingresos con Innomind.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 py-16 bg-white dark:bg-transparent relative z-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    
                    {/* Filters */}
                    <div className="flex flex-wrap justify-center gap-2 mb-16">
                        {INDUSTRIES.map((industry) => (
                            <button
                                key={industry}
                                onClick={() => setActiveFilter(industry)}
                                className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                                    activeFilter === industry
                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                                }`}
                            >
                                {industry}
                            </button>
                        ))}
                    </div>

                    {/* Case Studies */}
                    <div className="space-y-16">
                        {filteredCasos.map((caso, idx) => (
                            <div key={caso.id} className={`flex flex-col ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-16 items-center`}>
                                
                                {/* Image & Metrics */}
                                <div className="w-full lg:w-1/2 relative">
                                    <div className="aspect-video lg:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl relative">
                                        <img src={caso.image} alt={caso.company} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
                                        
                                        <div className="absolute bottom-6 left-6 right-6">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl">
                                                    {caso.icon}
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black text-white">{caso.company}</h3>
                                                    <span className="text-white/80 font-medium">{caso.industry}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Floating Metrics Card */}
                                    <div className="lg:absolute -bottom-8 -right-8 lg:w-[80%] bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-6 z-10 mt-[-40px] lg:mt-0 relative mx-4 lg:mx-0">
                                        <div className="grid grid-cols-3 gap-4 divide-x divide-slate-100 dark:divide-slate-700">
                                            {caso.metrics.map((m, i) => (
                                                <div key={i} className="text-center px-2">
                                                    <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{m.value}</div>
                                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">{m.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="w-full lg:w-1/2 pt-8 lg:pt-0">
                                    <div className="space-y-8">
                                        <div>
                                            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                                                <Building2 size={16} /> El Desafío
                                            </h4>
                                            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                                                {caso.challenge}
                                            </p>
                                        </div>
                                        
                                        <div className="pl-6 border-l-2 border-blue-500">
                                            <h4 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500" /> La Solución
                                            </h4>
                                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                                {caso.solution}
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-2">
                                                <CheckCircleIcon size={16} /> El Resultado
                                            </h4>
                                            <p className="text-lg font-medium text-slate-900 dark:text-white leading-relaxed">
                                                "{caso.result}"
                                            </p>
                                        </div>

                                        <div className="pt-4">
                                            <button className="flex items-center gap-2 font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors group">
                                                Leer caso completo detallado
                                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>

                    {filteredCasos.length === 0 && (
                        <div className="text-center py-20">
                            <Building2 size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No hay casos en esta industria</h3>
                            <p className="text-slate-500">Pronto agregaremos nuevas historias de éxito.</p>
                        </div>
                    )}

                    {/* CTA */}
                    <div className="mt-24 bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 md:p-16 text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl mix-blend-overlay"></div>
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-6 relative z-10">¿Listo para escribir tu propia historia de éxito?</h2>
                        <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto relative z-10">Agenda una sesión estratégica gratuita y descubre cómo Innomind puede transformar tu empresa hoy mismo.</p>
                        <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg relative z-10">
                            Hablar con un experto
                        </button>
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    );
}

function CheckCircleIcon({ size, className }: { size: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
    )
}

import React, { useState } from 'react';
import { PlayCircle, FileText, BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const CORE_TUTORIALS = [
    {
        id: 1,
        title: "Primeros pasos con Corē CRM",
        description: "Aprende a configurar tu embudo de ventas, agregar prospectos y realizar tu primer seguimiento.",
        duration: "8 min",
        type: "video"
    },
    {
        id: 2,
        title: "Configuración de Facturación Electrónica",
        description: "Guía paso a paso para vincular tus sellos digitales y emitir tu primera factura con un clic.",
        duration: "12 min",
        type: "video"
    },
    {
        id: 3,
        title: "Gestión avanzada de Inventario Multialmacén",
        description: "Cómo transferir stock entre sucursales, establecer puntos de reorden y alertas de bajo stock.",
        duration: "15 min",
        type: "article"
    },
    {
        id: 4,
        title: "Integrar WhatsApp Masivo a tu Embudo",
        description: "Automatiza mensajes de bienvenida y recordatorios de pago conectando WhatsApp Business API.",
        duration: "10 min",
        type: "video"
    }
];

const TRAK_TUTORIALS = [
    {
        id: 1,
        title: "Creación de Proyectos y Asignación de Equipo",
        description: "Descubre cómo estructurar proyectos complejos, definir hitos y asignar roles a tu equipo.",
        duration: "6 min",
        type: "video"
    },
    {
        id: 2,
        title: "Flujos de Trabajo con Tableros Kanban",
        description: "Optimiza la productividad visualizando cuellos de botella y moviendo tareas por etapas.",
        duration: "9 min",
        type: "video"
    },
    {
        id: 3,
        title: "Integración de Trak con Cotizaciones de Corē",
        description: "Cómo convertir automáticamente una cotización aprobada en un proyecto accionable en Trak.",
        duration: "7 min",
        type: "article"
    },
    {
        id: 4,
        title: "Reportes de Tiempos y Rendimiento (Timesheets)",
        description: "Aprende a registrar horas facturables y evaluar la rentabilidad por cliente o proyecto.",
        duration: "11 min",
        type: "video"
    }
];

export default function GuiasPage() {
    const [activeTab, setActiveTab] = useState<'core' | 'trak'>('core');

    return (
        <div className="font-display bg-white dark:bg-slate-900 text-slate-900 dark:text-white antialiased min-h-screen flex flex-col relative">
            <Navbar />

            {/* Header */}
            <div className="pt-32 pb-16 relative overflow-hidden bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center justify-center p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400 mb-6">
                        <span className="text-sm font-bold uppercase tracking-wider">Centro de Aprendizaje</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                        Guías y Tutoriales
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                        Domina todas las herramientas de Innomind. Aprende a tu propio ritmo con nuestros videos explicativos y guías paso a paso para Corē y Trak.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 py-16 bg-white dark:bg-transparent relative z-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    
                    {/* Tabs */}
                    <div className="flex justify-center mb-12">
                        <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                            <button
                                onClick={() => setActiveTab('core')}
                                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                                    activeTab === 'core' 
                                    ? 'bg-blue-600 text-white shadow-lg' 
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                Corē (ERP & CRM)
                            </button>
                            <button
                                onClick={() => setActiveTab('trak')}
                                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                                    activeTab === 'trak' 
                                    ? 'bg-purple-600 text-white shadow-lg' 
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                Trak (Proyectos)
                            </button>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {(activeTab === 'core' ? CORE_TUTORIALS : TRAK_TUTORIALS).map((tutorial) => (
                            <div key={tutorial.id} className="group flex flex-col sm:flex-row gap-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl hover:border-blue-500/30 transition-all duration-300">
                                
                                {/* Thumbnail */}
                                <div className={`w-full sm:w-48 aspect-video sm:aspect-square rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden ${
                                    activeTab === 'core' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-purple-50 dark:bg-purple-900/20'
                                }`}>
                                    {tutorial.type === 'video' ? (
                                        <PlayCircle size={48} className={`opacity-80 group-hover:scale-110 transition-transform duration-300 ${
                                            activeTab === 'core' ? 'text-blue-500' : 'text-purple-500'
                                        }`} />
                                    ) : (
                                        <FileText size={48} className={`opacity-80 group-hover:scale-110 transition-transform duration-300 ${
                                            activeTab === 'core' ? 'text-blue-500' : 'text-purple-500'
                                        }`} />
                                    )}
                                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded">
                                        {tutorial.duration}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex flex-col flex-1 justify-center">
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2">
                                        {tutorial.type === 'video' ? (
                                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                <PlayCircle size={14} /> Video
                                            </span>
                                        ) : (
                                            <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                                <BookOpen size={14} /> Artículo
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {tutorial.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                                        {tutorial.description}
                                    </p>
                                    <button className={`mt-auto font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all w-fit ${
                                        activeTab === 'core' ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'
                                    }`}>
                                        Comenzar lección <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Need Help Banner */}
                    <div className="mt-16 bg-slate-900 dark:bg-black rounded-3xl p-8 md:p-12 text-center border border-slate-800 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
                        
                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                ¿No encuentras lo que buscas?
                            </h2>
                            <p className="text-slate-400 mb-8">
                                Nuestro equipo de soporte está disponible 24/7 para ayudarte con cualquier duda técnica o de configuración sobre tu cuenta.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <a href="/soporte" className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors w-full sm:w-auto">
                                    Contactar Soporte
                                </a>
                                <a href="/faq" className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors w-full sm:w-auto">
                                    Ver Preguntas Frecuentes
                                </a>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    );
}

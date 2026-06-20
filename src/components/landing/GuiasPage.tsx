import React, { useState, useEffect } from 'react';
import { PlayCircle, FileText, BookOpen, ChevronRight, ArrowLeft } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const CORE_TUTORIALS = [
    {
        id: 1,
        title: "Primeros pasos con Corē CRM",
        description: "Aprende a configurar tu embudo de ventas, agregar prospectos y realizar tu primer seguimiento.",
        duration: "8 min",
        type: "video",
        content: "En este video introductorio, te guiaremos a través de la interfaz principal de Corē CRM. Aprenderás a personalizar las etapas de tu embudo de ventas para que coincidan con tu proceso comercial real. Luego, veremos cómo importar tu lista de contactos existente y crear tu primer prospecto manualmente. Finalmente, configuraremos un recordatorio de seguimiento para asegurar que ninguna oportunidad de venta se pierda."
    },
    {
        id: 2,
        title: "Configuración de Facturación Electrónica",
        description: "Guía paso a paso para vincular tus sellos digitales y emitir tu primera factura con un clic.",
        duration: "12 min",
        type: "video",
        content: "La facturación electrónica no tiene por qué ser complicada. En este tutorial, te mostraremos cómo subir tus archivos .cer y .key, ingresar tu contraseña y configurar tus datos fiscales. Una vez configurado, emitiremos una factura de prueba a partir de una cotización aprobada, demostrando cómo Corē automatiza el cálculo de impuestos y el envío del PDF/XML al cliente."
    },
    {
        id: 3,
        title: "Gestión avanzada de Inventario Multialmacén",
        description: "Cómo transferir stock entre sucursales, establecer puntos de reorden y alertas de bajo stock.",
        duration: "15 min",
        type: "article",
        content: "Paso 1: Configuración de Almacenes. Dirígete a la sección 'Ajustes de Inventario' y haz clic en 'Nuevo Almacén'.\n\nPaso 2: Transferencias. Usa el módulo 'Movimientos' para crear una orden de traspaso. Selecciona el almacén de origen y el de destino, y escanea o busca los productos.\n\nPaso 3: Puntos de Reorden. En la ficha de cada producto, establece el 'Stock Mínimo'. Corē te notificará automáticamente cuando las existencias bajen de este límite."
    },
    {
        id: 4,
        title: "Integrar WhatsApp Masivo a tu Embudo",
        description: "Automatiza mensajes de bienvenida y recordatorios de pago conectando WhatsApp Business API.",
        duration: "10 min",
        type: "video",
        content: "Aprende a conectar tu número de WhatsApp Business a Corē. Te enseñaremos a crear plantillas de mensajes (templates) preaprobadas por Meta. Posteriormente, configuraremos un 'Gatillo' (Trigger) para que, cuando un prospecto cambie a la etapa 'Ganado', se le envíe automáticamente un mensaje de bienvenida y agradecimiento a su WhatsApp."
    }
];

const TRAK_TUTORIALS = [
    {
        id: 1,
        title: "Creación de Proyectos y Asignación de Equipo",
        description: "Descubre cómo estructurar proyectos complejos, definir hitos y asignar roles a tu equipo.",
        duration: "6 min",
        type: "video",
        content: "Comenzamos en el panel principal de Trak. Haremos clic en 'Nuevo Proyecto', definiremos su alcance, presupuesto y fechas límite. Luego, invitaremos a los miembros del equipo y les asignaremos roles específicos (Líder, Desarrollador, Diseñador). Verás cómo establecer hitos (Milestones) para dividir el proyecto en fases manejables."
    },
    {
        id: 2,
        title: "Flujos de Trabajo con Tableros Kanban",
        description: "Optimiza la productividad visualizando cuellos de botella y moviendo tareas por etapas.",
        duration: "9 min",
        type: "video",
        content: "El corazón de Trak es su tablero ágil. En este video, crearemos un flujo de trabajo personalizado (To Do, In Progress, Review, Done). Te mostraremos cómo arrastrar y soltar tareas, agregar checklists internos a una tarea, y utilizar las etiquetas de colores para priorizar urgencias. También veremos cómo filtrar el tablero por usuario."
    },
    {
        id: 3,
        title: "Integración de Trak con Cotizaciones de Corē",
        description: "Cómo convertir automáticamente una cotización aprobada en un proyecto accionable en Trak.",
        duration: "7 min",
        type: "article",
        content: "Esta es una de las funcionalidades más poderosas de nuestro ecosistema. Cuando un cliente acepta una cotización en Corē, puedes hacer clic en 'Generar Proyecto en Trak'.\n\nEl sistema copiará automáticamente las partidas cotizadas y las transformará en tareas iniciales en el tablero de Trak, vinculando al cliente y asignando el presupuesto estimado. Esto elimina la doble captura de datos."
    },
    {
        id: 4,
        title: "Reportes de Tiempos y Rendimiento (Timesheets)",
        description: "Aprende a registrar horas facturables y evaluar la rentabilidad por cliente o proyecto.",
        duration: "11 min",
        type: "video",
        content: "El control del tiempo es vital para la rentabilidad. Te mostraremos cómo tu equipo puede usar el 'Timer' integrado de Trak o ingresar sus horas manualmente al final del día. Luego, generaremos un reporte de rentabilidad que compara las horas estimadas vs. las horas reales invertidas, destacando qué proyectos están consumiendo más recursos."
    }
];

export default function GuiasPage() {
    const [activeTab, setActiveTab] = useState<'core' | 'trak'>('core');
    const [selectedTutorial, setSelectedTutorial] = useState<any | null>(null);

    // Reset selected tutorial when changing tabs
    useEffect(() => {
        setSelectedTutorial(null);
    }, [activeTab]);

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
                    
                    {!selectedTutorial ? (
                        <>
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
                                    <div 
                                        key={tutorial.id} 
                                        onClick={() => setSelectedTutorial(tutorial)}
                                        className="group cursor-pointer flex flex-col sm:flex-row gap-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl hover:border-blue-500/30 transition-all duration-300"
                                    >
                                        {/* Thumbnail */}
                                        <div className={`w-full sm:w-48 aspect-video sm:aspect-square rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden ${
                                            activeTab === 'core' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-purple-50 dark:bg-purple-900/20'
                                        }`}>
                                            <BookOpen size={48} className={`opacity-80 group-hover:scale-110 transition-transform duration-300 ${
                                                activeTab === 'core' ? 'text-blue-500' : 'text-purple-500'
                                            }`} />
                                            <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded">
                                                {tutorial.duration} de lectura
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="flex flex-col flex-1 justify-center">
                                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2">
                                                <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                                    <BookOpen size={14} /> Guía Paso a Paso
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {tutorial.title}
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                                                {tutorial.description}
                                            </p>
                                            <span className={`mt-auto font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all w-fit ${
                                                activeTab === 'core' ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'
                                            }`}>
                                                Comenzar lección <ChevronRight size={16} />
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <button 
                                onClick={() => setSelectedTutorial(null)}
                                className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                <ArrowLeft size={16} />
                                Volver a la lista de guías
                            </button>

                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl p-8 md:p-12">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-4">
                                    <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                        <BookOpen size={14} /> Guía Paso a Paso
                                    </span>
                                    <span className="text-slate-300 dark:text-slate-600">•</span>
                                    <span className="text-slate-500">{activeTab === 'core' ? 'Corē ERP' : 'Trak'}</span>
                                    <span className="text-slate-300 dark:text-slate-600">•</span>
                                    <span className="text-slate-500">{selectedTutorial.duration} de lectura</span>
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 pb-8 border-b border-slate-100 dark:border-slate-800/50">
                                    {selectedTutorial.title}
                                </h2>
                                <div className="prose dark:prose-invert prose-lg max-w-none prose-p:leading-relaxed text-slate-600 dark:text-slate-300">
                                    {selectedTutorial.content.split('\n\n').map((paragraph: string, i: number) => (
                                        <p key={i}>{paragraph}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

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

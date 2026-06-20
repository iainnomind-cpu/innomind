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
        type: "article",
        content: "Bienvenido a Corē CRM. Esta guía te ayudará a dar tus primeros pasos.\n\n**1. Configuración de tu Embudo de Ventas:**\nDirígete a la sección 'Embudo' en el menú principal. Verás las etapas predeterminadas (Contacto, Negociación, Cierre). Haz clic en 'Configurar Embudo' para agregar o renombrar etapas según el proceso de ventas real de tu empresa.\n\n**2. Agregar tu primer prospecto:**\nEn el tablero Kanban de prospectos, haz clic en el botón '+ Nuevo Prospecto' en la esquina superior derecha. Completa los datos básicos: Nombre, Empresa, Correo y Teléfono. También puedes asignar el valor estimado de la posible venta.\n\n**3. Seguimiento y Notas:**\nUna vez creado el prospecto, haz clic sobre su tarjeta para abrir los detalles. Aquí podrás registrar todas las llamadas, enviar correos, y dejar notas internas para que tu equipo comercial tenga todo el contexto centralizado."
    },
    {
        id: 3,
        title: "Gestión de Inventario y Almacenes",
        description: "Cómo registrar productos, controlar el stock y gestionar las entradas y salidas.",
        duration: "10 min",
        type: "article",
        content: "**Paso 1: Catálogo de Productos**\nDirígete al módulo de Inventario y entra a 'Catálogo'. Haz clic en 'Nuevo Producto'. Aquí debes ingresar el SKU, nombre, descripción, precio de venta y costo unitario.\n\n**Paso 2: Registro de Entradas (Compras)**\nCuando recibas nueva mercancía, no modifiques el stock manualmente. Ve a 'Movimientos' > 'Registrar Entrada'. Selecciona los productos que entraron, la cantidad y opcionalmente asocia el número de orden de compra o nota del proveedor.\n\n**Paso 3: Salidas y Alertas**\nCada que una cotización se marca como 'Ganada', el sistema puede descontar automáticamente el inventario si así lo configuras. Además, en la ficha de cada producto, puedes establecer un 'Stock Mínimo'. Corē te notificará automáticamente cuando las existencias bajen de este límite."
    },
    {
        id: 4,
        title: "Integrar WhatsApp Masivo a tu Embudo",
        description: "Automatiza mensajes de bienvenida y seguimientos conectando WhatsApp API.",
        duration: "12 min",
        type: "article",
        content: "Automatizar la comunicación con WhatsApp te ahorrará horas de trabajo manual.\n\n**1. Conectar tu número de WhatsApp:**\nVe a 'Configuración' > 'Integraciones' > 'WhatsApp API'. Sigue las instrucciones para vincular tu número a través del portal de Meta. Asegúrate de tener una cuenta de Facebook Business verificada.\n\n**2. Crear Plantillas (Templates):**\nEn el menú de WhatsApp, ve a 'Plantillas'. Aquí puedes redactar mensajes estandarizados (ej. '¡Hola {{nombre}}! Gracias por contactar a Innomind.'). Meta revisará y aprobará estas plantillas usualmente en pocos minutos.\n\n**3. Configurar Disparadores (Triggers):**\nRegresa a la configuración de tu Embudo. Haz clic en el ícono de engranaje de la etapa 'Nuevo Prospecto'. Selecciona 'Acción Automática: Enviar WhatsApp' y elige la plantilla de bienvenida. Ahora, cada nuevo lead recibirá un mensaje instantáneo de forma automática."
    }
];

const TRAK_TUTORIALS = [
    {
        id: 1,
        title: "Creación de Proyectos y Asignación de Equipo",
        description: "Descubre cómo estructurar proyectos complejos, definir hitos y asignar roles a tu equipo.",
        duration: "6 min",
        type: "article",
        content: "Trak te permite organizar el trabajo de tu equipo de manera clara y eficiente.\n\n**1. Crear un Proyecto Nuevo:**\nEn el panel principal de Trak, haz clic en 'Nuevo Proyecto'. Asigna un nombre claro, selecciona el cliente asociado (si aplica) y establece las fechas de inicio y entrega estimada.\n\n**2. Invitar al Equipo:**\nVe a la pestaña 'Equipo' dentro del proyecto. Aquí podrás buscar a los usuarios de tu organización y agregarlos. Asígnales un rol específico (como Líder de Proyecto, Ejecutor, Visualizador) para controlar los permisos de acceso y edición.\n\n**3. Establecer Hitos (Milestones):**\nPara proyectos largos, es recomendable usar hitos. Ve a la pestaña 'Hitos' y crea fases clave (ej. 'Fase 1: Diseño', 'Fase 2: Desarrollo'). Posteriormente, podrás agrupar las tareas bajo cada uno de estos hitos."
    },
    {
        id: 2,
        title: "Flujos de Trabajo con Tableros Kanban",
        description: "Optimiza la productividad visualizando cuellos de botella y moviendo tareas por etapas.",
        duration: "9 min",
        type: "article",
        content: "El corazón de Trak es su tablero ágil (Kanban), ideal para ver el estado de todo el proyecto de un vistazo.\n\n**1. Personalizar Columnas:**\nPor defecto, el tablero tiene las columnas 'Por Hacer', 'En Progreso' y 'Completado'. Puedes hacer clic en 'Añadir Columna' para incluir etapas de revisión, como 'En Espera del Cliente' o 'QA / Pruebas'.\n\n**2. Gestión de Tareas:**\nPara crear una tarea, haz clic en el '+' debajo de cualquier columna. Dale un título. Si haces clic en la tarea, se abrirá el panel de detalles donde puedes agregar una descripción detallada, adjuntar archivos, crear sub-listas de verificación (checklists) internas y etiquetar a un responsable.\n\n**3. Priorización Visual:**\nUsa las etiquetas (labels) de colores para marcar la prioridad de cada tarea (Baja, Media, Alta, Urgente). Esto ayuda al equipo a saber exactamente qué atacar primero."
    },
    {
        id: 3,
        title: "Integración de Trak con Cotizaciones de Corē",
        description: "Cómo convertir automáticamente una cotización aprobada en un proyecto accionable en Trak.",
        duration: "7 min",
        type: "article",
        content: "Si tu empresa utiliza tanto Corē como Trak, esta integración es fundamental para evitar el doble trabajo.\n\n**El Flujo Automatizado:**\nCuando un cliente acepta formalmente una cotización en Corē, dirígete al detalle de esa cotización. En el menú de acciones superiores, encontrarás un botón llamado 'Generar Proyecto en Trak'.\n\n**¿Qué sucede al hacer clic?**\nEl sistema creará un proyecto nuevo en Trak con el nombre de la cotización. Además, copiará automáticamente cada una de las partidas cotizadas y las transformará en tareas iniciales en la columna 'Por Hacer'. El proyecto quedará automáticamente vinculado al cliente correspondiente, manteniendo el historial limpio y conectado desde la venta hasta la ejecución."
    },
    {
        id: 4,
        title: "Reportes de Tiempos y Rendimiento",
        description: "Aprende a registrar horas facturables y evaluar la rentabilidad por cliente o proyecto.",
        duration: "11 min",
        type: "article",
        content: "El control del tiempo invertido es vital para asegurar que tus proyectos sean rentables.\n\n**1. Registro de Tiempo (Timesheets):**\nCada miembro del equipo puede registrar su tiempo de dos formas: usando el 'Temporizador' integrado que inicia al hacer clic en 'Comenzar a trabajar' dentro de una tarea, o ingresando manualmente las horas invertidas al final del día en la pestaña 'Mis Tiempos'.\n\n**2. Reportes de Proyecto:**\nLos gerentes pueden ir a la sección 'Reportes' > 'Rendimiento por Proyecto'. Aquí, Trak compara automáticamente las horas estimadas totales del proyecto contra las horas reales registradas por el equipo. Verás gráficos que te alertarán si te estás acercando al límite de tiempo presupuestado.\n\n**3. Rentabilidad por Cliente:**\nTambién puedes filtrar estos reportes por cliente para ver, a nivel macro, con qué cuentas estás invirtiendo demasiadas horas no facturables y tomar decisiones informadas sobre tus precios futuros."
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
                                    {selectedTutorial.content.split('\n\n').map((paragraph: string, i: number) => {
                                        // Simple parser for **bold** text
                                        const parts = paragraph.split(/(\*\*.*?\*\*)/g);
                                        return (
                                            <p key={i}>
                                                {parts.map((part, index) => {
                                                    if (part.startsWith('**') && part.endsWith('**')) {
                                                        return <strong key={index} className="text-slate-900 dark:text-white font-bold">{part.slice(2, -2)}</strong>;
                                                    }
                                                    return part;
                                                })}
                                            </p>
                                        );
                                    })}
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

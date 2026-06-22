import React from 'react';
import { ArrowRight, Code, Settings, Zap, ShieldCheck, CheckCircle2, Cpu, Database, LayoutTemplate, Smartphone, Blocks, Terminal } from 'lucide-react';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { useModal } from '../../context/ModalContext';

const FEATURES = [
    {
        icon: <Settings size={24} className="text-blue-500" />,
        title: "Adaptación 100% Exacta",
        description: "No adaptes tu empresa al software. Nosotros adaptamos el software a tus procesos operativos exactos, sin fricciones."
    },
    {
        icon: <Zap size={24} className="text-purple-500" />,
        title: "Sin Funciones Innecesarias",
        description: "Paga y utiliza solo lo que realmente necesitas. Eliminamos el 'bloatware' para una interfaz limpia y rápida."
    },
    {
        icon: <ShieldCheck size={24} className="text-emerald-500" />,
        title: "Ventaja Competitiva",
        description: "Tu software será tu secreto comercial. Opera de maneras que tus competidores usando sistemas genéricos no pueden igualar."
    },
    {
        icon: <Blocks size={24} className="text-orange-500" />,
        title: "Escalabilidad Ilimitada",
        description: "Una arquitectura que crece contigo. Agrega nuevos módulos o integraciones conforme tu negocio se expande."
    }
];

const MODULES = [
    "Gestión de Inventario Especializado",
    "CRM y Embudos de Venta a Medida",
    "Recursos Humanos y Nómina Localizada",
    "Manejo de Flotillas y Logística",
    "Puntos de Venta (POS) Customizados",
    "Portales de Autoservicio para Clientes",
    "Paneles de Control para Directivos",
    "Integración con APIs Externas"
];

const PROCESS_STEPS = [
    {
        number: "01",
        title: "Descubrimiento y Alcance",
        description: "Nos sumergimos en tu operación diaria. Entendemos tus cuellos de botella y diseñamos la arquitectura del sistema ideal."
    },
    {
        number: "02",
        title: "Diseño UI/UX",
        description: "Creamos prototipos visuales interactivos. Verás exactamente cómo funcionará y se verá el sistema antes de escribir una línea de código."
    },
    {
        number: "03",
        title: "Desarrollo Ágil",
        description: "Construimos el sistema en iteraciones (sprints). Te mostramos avances funcionales regularmente para asegurar que vamos por el camino correcto."
    },
    {
        number: "04",
        title: "Pruebas y QA",
        description: "Sometemos el ERP a rigurosas pruebas de estrés, seguridad y usabilidad para garantizar que sea robusto como una roca."
    },
    {
        number: "05",
        title: "Despliegue y Capacitación",
        description: "Lanzamos el sistema de forma controlada y entrenamos a tu equipo para asegurar una adopción exitosa y sin resistencia."
    }
];

export default function ERPPersonalizadoPage() {
    const { openDemoModal } = useModal();

    return (
        <div className="font-display bg-white dark:bg-slate-900 text-slate-900 dark:text-white antialiased min-h-screen flex flex-col relative overflow-hidden">
            <Navbar />

            {/* Global Background (Mesh/Grid) matching the rest of the site */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 mix-blend-overlay"></div>
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 dark:bg-blue-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 dark:bg-purple-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>

            {/* Hero Section */}
            <div className="pt-40 pb-20 relative z-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center justify-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 mb-8 border border-blue-100 dark:border-blue-800/50 shadow-sm">
                        <Code size={18} className="mr-2" />
                        <span className="text-xs font-bold uppercase tracking-wider">Desarrollo a Medida</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">
                        Un ERP diseñado <br className="hidden md:block"/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">exclusivamente para ti</span>
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed mb-10">
                        Olvídate de adaptar tus procesos a un software genérico rígido. Construimos el núcleo operativo perfecto para tu negocio, desde cero, escalable y sin funciones que no necesitas.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button 
                            onClick={() => openDemoModal('ERP Personalizado')}
                            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2"
                        >
                            Agendar Consultoría Técnica <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* IDE Mockup / Code Visual */}
            <div className="py-12 relative z-10">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="relative rounded-2xl bg-[#0d1117] border border-slate-800 shadow-2xl overflow-hidden font-mono text-sm md:text-base">
                        {/* Fake IDE Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-slate-800">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <div className="text-slate-400 text-xs font-semibold flex items-center gap-2">
                                <Terminal size={14} /> src/modules/custom-erp/CoreEngine.ts
                            </div>
                            <div></div>
                        </div>
                        {/* Fake Code Content */}
                        <div className="p-6 md:p-8 overflow-x-auto text-left leading-relaxed">
                            <pre className="text-slate-300">
<span className="text-purple-400">import</span> {'{'} CoreEngine, DataMapper {'}'} <span className="text-purple-400">from</span> <span className="text-green-300">'@innomind/core'</span>;<br/>
<span className="text-purple-400">import</span> {'{'} BillingSystem {'}'} <span className="text-purple-400">from</span> <span className="text-green-300">'./integrations'</span>;<br/>
<br/>
<span className="text-slate-500">{'// Initializing Custom ERP specific to your business logic'}</span><br/>
<span className="text-purple-400">const</span> customErp = <span className="text-blue-400">new</span> CoreEngine({'{'}<br/>
{'    '}clientId: <span className="text-green-300">'CUST-00921'</span>,<br/>
{'    '}industry: <span className="text-green-300">'Manufacturing'</span>,<br/>
{'    '}modules: [<span className="text-green-300">'Inventory'</span>, <span className="text-green-300">'HR'</span>, <span className="text-green-300">'CustomBilling'</span>],<br/>
{'    '}scale: <span className="text-purple-400">true</span><br/>
{'}'});<br/>
<br/>
<span className="text-purple-400">export async function</span> <span className="text-blue-400">deployCustomSystem</span>() {'{'}<br/>
{'    '}<span className="text-purple-400">try</span> {'{'}<br/>
{'        '}<span className="text-purple-400">await</span> customErp.<span className="text-blue-400">syncLegacyData</span>();<br/>
{'        '}<span className="text-purple-400">await</span> BillingSystem.<span className="text-blue-400">connect</span>();<br/>
{'        '}console.<span className="text-blue-400">log</span>(<span className="text-green-300">'[SUCCESS] Tu ERP a medida está 100% operativo.'</span>);<br/>
{'    '}{'}'} <span className="text-purple-400">catch</span> (error) {'{'}<br/>
{'        '}<span className="text-slate-500">{'// No worries, our 24/7 support has you covered.'}</span><br/>
{'    '}{'}'}<br/>
{'}'}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>

            {/* Why Custom ERP */}
            <div className="py-24 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl relative z-10 border-y border-slate-200 dark:border-slate-800/50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">¿Por qué invertir en un ERP a medida?</h2>
                        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Los sistemas empaquetados obligan a tu empresa a cambiar. Un sistema a medida se adapta a lo que ya haces mejor.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {FEATURES.map((feat, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-shadow relative overflow-hidden group">
                                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-slate-50 dark:bg-slate-700/30 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
                                <div className="relative z-10">
                                    <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-700 mb-6 shadow-sm">
                                        {feat.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feat.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                                        {feat.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Process */}
            <div className="py-24 relative z-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-16 items-start">
                        <div className="w-full lg:w-1/3 sticky top-32">
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-6">Nuestro Proceso de Desarrollo</h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                                No solo escribimos código; construimos soluciones de negocio. Nuestro equipo técnico y de consultoría te lleva de la mano desde la idea hasta el lanzamiento.
                            </p>
                            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                                <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                                    <Cpu size={18} /> Stack Tecnológico Moderno
                                </h4>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    Utilizamos tecnologías escalables como React, Node.js, PostgreSQL y arquitecturas en la nube (AWS/GCP) para asegurar el máximo rendimiento.
                                </p>
                            </div>
                        </div>

                        <div className="w-full lg:w-2/3 space-y-6">
                            {PROCESS_STEPS.map((step, idx) => (
                                <div key={idx} className="flex gap-6 p-6 bg-white dark:bg-slate-800/80 backdrop-blur-md rounded-3xl border border-slate-100 dark:border-slate-700 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                                    <div className="text-4xl font-black text-slate-200 dark:text-slate-700 font-serif italic shrink-0">
                                        {step.number}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{step.title}</h3>
                                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modules List */}
            <div className="py-24 bg-slate-50 dark:bg-slate-900/80 backdrop-blur-xl relative z-10 border-t border-slate-200 dark:border-slate-800/50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-6">Módulos que podemos construir para ti</h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                                Si puedes imaginarlo, podemos programarlo. Desde integraciones con hardware específico (básculas, sensores, RFID) hasta portales web para tus distribuidores B2B.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {MODULES.map((mod, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                                        <span className="text-slate-700 dark:text-slate-300 font-medium">{mod}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-square bg-gradient-to-br from-blue-600 to-purple-600 rounded-full blur-[100px] absolute inset-0 opacity-20"></div>
                            <div className="relative grid grid-cols-2 gap-4">
                                <div className="space-y-4 pt-12">
                                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl">
                                        <Database size={32} className="text-blue-500 mb-4" />
                                        <h4 className="font-bold text-slate-900 dark:text-white mb-2">Bases de Datos</h4>
                                        <p className="text-xs text-slate-500">Migración y estructuración segura de tus datos históricos.</p>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl">
                                        <LayoutTemplate size={32} className="text-purple-500 mb-4" />
                                        <h4 className="font-bold text-slate-900 dark:text-white mb-2">Interfaces Web</h4>
                                        <p className="text-xs text-slate-500">Paneles de administración accesibles desde cualquier navegador.</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl">
                                        <Smartphone size={32} className="text-emerald-500 mb-4" />
                                        <h4 className="font-bold text-slate-900 dark:text-white mb-2">Apps Móviles</h4>
                                        <p className="text-xs text-slate-500">Versiones adaptadas para tu equipo en campo o repartidores.</p>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl">
                                        <Blocks size={32} className="text-orange-500 mb-4" />
                                        <h4 className="font-bold text-slate-900 dark:text-white mb-2">Microservicios</h4>
                                        <p className="text-xs text-slate-500">Arquitectura moderna preparada para alto tráfico.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="py-24 relative z-10">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">
                        ¿Tienes un proyecto en mente?
                    </h2>
                    <p className="text-xl text-slate-600 dark:text-slate-400 mb-10">
                        Cuéntanos sobre tu operación y descubre cómo un sistema a medida puede ser la mejor inversión para el futuro de tu empresa.
                    </p>
                    <button 
                        onClick={() => openDemoModal('Consultoría ERP a Medida')}
                        className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-lg rounded-2xl hover:scale-105 transition-transform shadow-2xl"
                    >
                        Solicitar Presupuesto sin Compromiso
                    </button>
                </div>
            </div>

            <Footer />
        </div>
    );
}

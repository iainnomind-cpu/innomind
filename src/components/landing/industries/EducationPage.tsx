import Navbar from '../Navbar';
import Footer from '../Footer';
import { useModal } from '../../../context/ModalContext';
import {
    ArrowRight,
    CheckCircle2,
    GraduationCap,
    Users,
    CreditCard,
    PieChart,
    BookOpen
} from 'lucide-react';

export default function EducationPage() {
    const { openFreeTrial } = useModal();

    return (
        <div className="font-display bg-white dark:bg-slate-900 text-slate-900 dark:text-white antialiased selection:bg-violet-600 selection:text-white min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 pt-20">
                {/* 1. HERO SECTION */}
                <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-28 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-800/20 -z-10" />
                    <div className="absolute top-0 right-0 -translate-y-12 w-[800px] h-[800px] bg-violet-100/40 dark:bg-violet-900/10 rounded-full blur-3xl -z-10" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
                            <div className="lg:col-span-6 text-center lg:text-left mb-16 lg:mb-0">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-semibold mb-6">
                                    <span className="flex h-2 w-2 rounded-full bg-violet-600"></span>
                                    Solución para Instituciones Educativas
                                </div>

                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
                                    Más alumnos inscritos.<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Menos morosidad.</span>
                                </h1>

                                <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                    Academias, universidades, cursos online: convierte más aspirantes en alumnos y reduce la cartera vencida con automatización inteligente de cobranza y seguimiento.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                    <button
                                        onClick={openFreeTrial}
                                        className="px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-violet-500/25 transition-all transform hover:-translate-y-0.5"
                                    >
                                        Solicitar Cotización
                                    </button>
                                    <button className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-white font-bold rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                                        Ver Demo en Vivo <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="lg:col-span-6">
                                <div className="relative">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl blur opacity-20 dark:opacity-30"></div>

                                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8">
                                        <div className="grid grid-cols-2 gap-8">
                                            <div>
                                                <div className="text-4xl font-extrabold text-violet-600 mb-2">+45%</div>
                                                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Conversión de aspirantes</div>
                                            </div>
                                            <div>
                                                <div className="text-4xl font-extrabold text-blue-500 mb-2">-30%</div>
                                                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Morosidad</div>
                                            </div>
                                            <div>
                                                <div className="text-4xl font-extrabold text-emerald-500 mb-2">100%</div>
                                                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Control de alumnos</div>
                                            </div>
                                            <div>
                                                <div className="text-4xl font-extrabold text-slate-800 dark:text-white mb-2">72h</div>
                                                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Implementación</div>
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex items-center justify-center text-center">
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                Convierte más aspirantes sin aumentar tu equipo de ventas
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. SECCIÓN PROBLEMAS */}
                <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Lo que frena tu crecimiento hoy</h2>
                            <p className="text-lg text-slate-600 dark:text-slate-300">Desafíos que limitan la expansión y salud financiera de tu academia.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                                <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-2xl mb-6 shadow-sm">
                                    🎓
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Aspirantes que se pierden</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Muchos interesados preguntan por programas pero no se les da seguimiento adecuado y terminan inscribiéndose en otra institución.
                                </p>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                                <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-2xl mb-6 shadow-sm">
                                    💳
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Pagos retrasados y cartera vencida</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Llamados incómodos uno a uno para cobrar colegiaturas y una alta tasa de alumnos que desertan por mala gestión financiera.
                                </p>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                                <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl mb-6 shadow-sm">
                                    🗂
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Control administrativo fragmentado</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Admisiones usa Excel, Cobranza otro sistema y Control Escolar uno distinto. Nadie tiene la foto completa del ciclo del alumno.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. BLOQUE DIFERENCIADOR */}
                <section className="py-20 relative">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-violet-50 dark:bg-violet-900/10 border-2 border-violet-500/30 rounded-2xl p-8 md:p-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                <BookOpen className="w-32 h-32 text-violet-600" />
                            </div>
                            <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                                <div className="flex-shrink-0">
                                    <div className="w-16 h-16 bg-violet-600 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/30">
                                        <CheckCircle2 className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">La diferencia de Innomind</h3>
                                    <p className="text-lg text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                        "Innomind integra <span className="font-bold text-violet-600 dark:text-violet-400">planes de pago flexibles y MSI directamente en el proceso de inscripción</span> — eliminando la principal barrera de conversión en academias y cursos de alto valor en México."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. SECCIÓN SOLUCIÓN */}
                <section className="py-24 bg-white dark:bg-slate-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Cómo Innomind transforma tu institución</h2>
                            <p className="text-lg text-slate-600 dark:text-slate-300">Un ecosistema único desde el primer contacto del aspirante hasta su graduación.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
                            {/* Feature 1 */}
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                        <Users className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">CRM de admisiones automatizado</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Capta leads desde tus campañas, asígnalos a asesores educativos y automatiza correos/WhatsApp con información de planes de estudio y fechas de inicio.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                        <CreditCard className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Control de pagos y cobranza inteligente</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Envía ligas de pago para inscripciones en línea, programa cargos recurrentes a tarjetas (domiciliación) y emite recordatorios automáticos 3 días antes de vencimiento.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 3 */}
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Gestión completa del alumno</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Genera el expediente del alumno con un solo clic una vez que paga su inscripción. Gestiona sus documentos, historial de soporte y estatus activo.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 4 */}
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                        <PieChart className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Reportes financieros en tiempo real</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Conoce el CAC (Costo de Adquisición de Alumno), la retención por programa, ingresos proyectados vs cobrados y facturación consolidada en dashboards visuales.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. MÓDULOS INCLUIDOS */}
                <section className="py-20 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Módulos Especializados para Educación</h2>

                        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                            {[
                                "CRM de Admisiones", "Seguimiento de Leads", "Control de Pagos",
                                "Gestión de Alumnos", "Finanzas", "Calendario",
                                "Planes de Pago / MSI"
                            ].map((module, idx) => (
                                <div key={idx} className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-700 dark:text-slate-200 font-semibold shadow-sm hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-default">
                                    {module}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 6. CTA FINAL */}
                <section className="py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-900" />

                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">¿Tu institución lista para digitalizarse?</h2>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10 text-violet-100 font-medium text-lg">
                            <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-violet-400" /> De aspirante a alumno inscrito</span>
                            <span className="hidden sm:inline text-violet-400/50">•</span>
                            <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-violet-400" /> Automatización inteligente desde día 1</span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={openFreeTrial}
                                className="px-8 py-4 bg-white text-violet-900 hover:bg-violet-50 font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
                            >
                                Solicitar Cotización
                            </button>
                            <button className="px-8 py-4 bg-transparent text-white border-2 border-white/20 hover:border-white/40 hover:bg-white/5 font-bold rounded-xl transition-all">
                                Ver Demo en Vivo
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

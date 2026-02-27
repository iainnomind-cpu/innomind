import Navbar from '../Navbar';
import Footer from '../Footer';
import { useModal } from '../../../context/ModalContext';
import {
    ArrowRight,
    CheckCircle2,
    UserPlus,
    CalendarDays,
    FileText,
    ShieldCheck,
    TrendingUp
} from 'lucide-react';

export default function HealthPage() {
    const { openFreeTrial } = useModal();

    return (
        <div className="font-display bg-white dark:bg-slate-900 text-slate-900 dark:text-white antialiased selection:bg-rose-500 selection:text-white min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 pt-20">
                {/* 1. HERO SECTION */}
                <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-28 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-800/20 -z-10" />
                    <div className="absolute top-0 right-0 -translate-y-12 w-[800px] h-[800px] bg-rose-100/40 dark:bg-rose-900/10 rounded-full blur-3xl -z-10" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
                            <div className="lg:col-span-6 text-center lg:text-left mb-16 lg:mb-0">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-sm font-semibold mb-6">
                                    <span className="flex h-2 w-2 rounded-full bg-rose-500"></span>
                                    Solución para Clínicas y Bienestar
                                </div>

                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
                                    Más pacientes.<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600">Menos cancelaciones.</span>
                                </h1>

                                <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                    Clínicas, consultorios, spas y gimnasios: automatiza tu agenda, retén más pacientes y lleva un control financiero impecable — todo con la privacidad de datos que tu sector exige.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                    <button
                                        onClick={openFreeTrial}
                                        className="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-rose-500/25 transition-all transform hover:-translate-y-0.5"
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
                                    <div className="absolute -inset-1 bg-gradient-to-r from-rose-400 to-pink-500 rounded-2xl blur opacity-20 dark:opacity-30"></div>

                                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8">
                                        <div className="grid grid-cols-2 gap-8">
                                            <div>
                                                <div className="text-4xl font-extrabold text-blue-500 mb-2">-40%</div>
                                                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Cancelaciones</div>
                                            </div>
                                            <div>
                                                <div className="text-4xl font-extrabold text-rose-500 mb-2">+35%</div>
                                                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Retención</div>
                                            </div>
                                            <div>
                                                <div className="text-4xl font-extrabold text-emerald-500 mb-2">100%</div>
                                                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Historial Centralizado</div>
                                            </div>
                                            <div>
                                                <div className="text-4xl font-extrabold text-slate-800 dark:text-white mb-2">72h</div>
                                                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Implementación</div>
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex items-center justify-center text-center">
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                Tu agenda bajo control desde el día 1 · Sin complicaciones
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
                            <p className="text-lg text-slate-600 dark:text-slate-300">Fugas de ingresos comunes en el sector salud y bienestar.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                                <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-2xl mb-6 shadow-sm">
                                    📅
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Agenda saturada y sin control</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Pacientes olvidan sus citas, huecos sin llenar en el día y recepcionistas abrumadas confirmando manualmente uno a uno.
                                </p>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                                <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-2xl mb-6 shadow-sm">
                                    🔄
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Pacientes que no regresan</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Tratamientos incompletos porque nadie envía un recordatorio de seguimiento una vez que el paciente sale por la puerta.
                                </p>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-2xl mb-6 shadow-sm">
                                    💸
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Facturación manual y lenta</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Cálculo de comisiones por doctor o terapeuta propenso a errores, y cobros demorados en recepción generando malas experiencias.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. BLOQUE DIFERENCIADOR */}
                <section className="py-20 relative">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-rose-50 dark:bg-rose-900/10 border-2 border-rose-500/30 rounded-2xl p-8 md:p-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                <ShieldCheck className="w-32 h-32 text-rose-600" />
                            </div>
                            <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                                <div className="flex-shrink-0">
                                    <div className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30">
                                        <CheckCircle2 className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">La diferencia de Innomind</h3>
                                    <p className="text-lg text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                        "Innomind cumple con los <span className="font-bold text-rose-600 dark:text-rose-400">estándares de privacidad de datos médicos en México y LATAM</span> — para que manejes expedientes digitales con la tranquilidad de que están protegidos y solo accesibles para quien debe verlos."
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
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Cómo Innomind transforma tu clínica</h2>
                            <p className="text-lg text-slate-600 dark:text-slate-300">Brinda una experiencia premium desde la reserva hasta el cobro final.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
                            {/* Feature 1 */}
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                        <CalendarDays className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Agenda inteligente con recordatorios automáticos</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Sincroniza todas las cabinas, doctores o equipos. Envía confirmaciones por WhatsApp de forma automática, reduciendo el no-show dramáticamente.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Historial digital del paciente</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Expediente completo con notas de evolución, consentimientos, recetas pasadas y fotografías de avance, accesible en segundos.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 3 */}
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                                        <UserPlus className="w-6 h-6 text-rose-500 dark:text-rose-400" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Control de membresías y planes</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Vende "paquetes de 10 sesiones" y deja que el sistema descuente las visitas automáticamente. Alertas antes de que el plan expire.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 4 */}
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Reportes financieros por terapeuta o área</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Calcula cortes de caja diarios y esquemas de comisiones variables sin esfuerzo. Generación de CFDI 4.0 global o individual con un clic.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. MÓDULOS INCLUIDOS */}
                <section className="py-20 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Módulos Especializados para Salud y Bienestar</h2>

                        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                            {[
                                "Agenda Inteligente", "Recordatorios Automáticos", "Historial de Paciente",
                                "Control de Membresías", "Finanzas", "Prospectos"
                            ].map((module, idx) => (
                                <div key={idx} className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-700 dark:text-slate-200 font-semibold shadow-sm hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-default">
                                    {module}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 6. CTA FINAL */}
                <section className="py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-rose-900 to-pink-900" />

                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">¿Tu consultorio listo para crecer?</h2>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10 text-rose-100 font-medium text-lg">
                            <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-rose-400" /> Agenda inteligente + historial digital</span>
                            <span className="hidden sm:inline text-rose-400/50">•</span>
                            <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-rose-400" /> Implementación en menos de 72 horas</span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={openFreeTrial}
                                className="px-8 py-4 bg-white text-rose-900 hover:bg-rose-50 font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
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

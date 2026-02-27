import Navbar from '../Navbar';
import Footer from '../Footer';
import { useModal } from '../../../context/ModalContext';
import {
    ArrowRight,
    CheckCircle2,
    Activity,
    Box,
    Truck,
    LineChart,
    Factory
} from 'lucide-react';

export default function ManufacturePage() {
    const { openFreeTrial } = useModal();

    return (
        <div className="font-display bg-white dark:bg-slate-900 text-slate-900 dark:text-white antialiased selection:bg-orange-600 selection:text-white min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 pt-20">
                {/* 1. HERO SECTION */}
                <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-28 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-800/20 -z-10" />
                    <div className="absolute top-0 right-0 -translate-y-12 w-[800px] h-[800px] bg-orange-100/40 dark:bg-orange-900/10 rounded-full blur-3xl -z-10" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
                            <div className="lg:col-span-6 text-center lg:text-left mb-16 lg:mb-0">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-semibold mb-6">
                                    <span className="flex h-2 w-2 rounded-full bg-orange-600"></span>
                                    Solución para Manufactura
                                </div>

                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
                                    Producción bajo<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">control total.</span>
                                </h1>

                                <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                    Desde la orden de compra hasta la entrega final. Innomind conecta tu planta con tus clientes eliminando retrasos, desperdicios y sorpresas en la cadena de producción.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                    <button
                                        onClick={openFreeTrial}
                                        className="px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5"
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
                                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl blur opacity-20 dark:opacity-30"></div>

                                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8">
                                        <div className="grid grid-cols-2 gap-8">
                                            <div>
                                                <div className="text-4xl font-extrabold text-orange-600 mb-2">-25%</div>
                                                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Desperdicio</div>
                                            </div>
                                            <div>
                                                <div className="text-4xl font-extrabold text-emerald-500 mb-2">+20%</div>
                                                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Eficiencia Operativa</div>
                                            </div>
                                            <div>
                                                <div className="text-4xl font-extrabold text-blue-500 mb-2">100%</div>
                                                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Visibilidad de pedidos</div>
                                            </div>
                                            <div>
                                                <div className="text-4xl font-extrabold text-slate-800 dark:text-white mb-2">72h</div>
                                                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Implementación</div>
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex items-center justify-center text-center">
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                Visibilidad total de tu planta desde el primer día
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
                            <p className="text-lg text-slate-600 dark:text-slate-300">Problemas operativos que consumen tus márgenes de ganancia.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                                <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-2xl mb-6 shadow-sm">
                                    ⚙️
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Mala planificación de producción</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Líneas paradas por falta de insumos o cuellos de botella no detectados a tiempo, generando altos costos ocultos.
                                </p>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-2xl mb-6 shadow-sm">
                                    📦
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Inventario descontrolado</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Exceso de stock que inmoviliza capital o quiebres de inventario que retrasan tus entregas a clientes clave.
                                </p>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                                <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl mb-6 shadow-sm">
                                    🔁
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Pedidos sin trazabilidad</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Ventas promete fechas de entrega reales que Producción desconoce. Clientes frustrados preguntando "¿dónde está mi pedido?".
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. BLOQUE DIFERENCIADOR */}
                <section className="py-20 relative">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-orange-50 dark:bg-orange-900/10 border-2 border-orange-500/30 rounded-2xl p-8 md:p-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                <Factory className="w-32 h-32 text-orange-600" />
                            </div>
                            <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                                <div className="flex-shrink-0">
                                    <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
                                        <CheckCircle2 className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Diseñado para la Industria</h3>
                                    <p className="text-lg text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                        "A diferencia de los CRMs genéricos, Innomind entiende que en manufactura tus 'clientes' son también tus <span className="font-bold text-orange-600 dark:text-orange-400">líneas de producción, proveedores y SKUs</span> — y los conecta en un solo flujo visual."
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
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Cómo Innomind transforma tu operación</h2>
                            <p className="text-lg text-slate-600 dark:text-slate-300">Sincroniza todas las áreas de tu empresa, desde el piso de producción hasta la junta directiva.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
                            {/* Feature 1 */}
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                        <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Timeline visual de órdenes de producción</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Supervisa el estatus de cada lote en tiempo real. Anticipa retrasos y balancea cargas de trabajo en tus líneas con un clic.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <Box className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Control de inventarios en tiempo real</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Mantén trazabilidad completa desde la materia prima hasta el producto terminado. Alertas automáticas de reabastecimiento por mínimos.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 3 */}
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                        <Truck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Gestión de proveedores centralizada</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Evalúa tiempos de entrega, compara cotizaciones y automatiza órdenes de compra en base a pronósticos de demanda de producción.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 4 */}
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                        <LineChart className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Reportes de costos por línea de producto</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Costeo preciso (ABC) en automático. Entiende la verdadera rentabilidad de cada SKU integrando costos directos, indirectos y mermas.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. MÓDULOS INCLUIDOS */}
                <section className="py-20 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Módulos Especializados para Manufactura</h2>

                        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                            {[
                                "Órdenes de Producción", "Inventario", "Compras",
                                "Clientes", "Finanzas", "Proveedores",
                                "Costos por Producto"
                            ].map((module, idx) => (
                                <div key={idx} className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-700 dark:text-slate-200 font-semibold shadow-sm hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-default">
                                    {module}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 6. CTA FINAL */}
                <section className="py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900" />

                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">¿Tu planta lista para digitalizarse?</h2>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10 text-slate-300 font-medium text-lg">
                            <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-orange-400" /> Soporte técnico en español</span>
                            <span className="hidden sm:inline text-orange-500/50">•</span>
                            <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-orange-400" /> Resultados desde el primer mes</span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={openFreeTrial}
                                className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
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

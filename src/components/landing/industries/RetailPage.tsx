import Navbar from '../Navbar';
import Footer from '../Footer';
import { useModal } from '../../../context/ModalContext';
import {
  ArrowRight,
  Store,
  MessageSquare,
  Eye,
  BarChart3,
  RefreshCcw,
  CheckCircle2
} from 'lucide-react';

export default function RetailPage() {
  const { openFreeTrial } = useModal();

  return (
    <div className="font-display bg-white dark:bg-slate-900 text-slate-900 dark:text-white antialiased selection:bg-blue-600 selection:text-white min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* 1. HERO SECTION */}
        <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-28 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-blue-50/50 dark:bg-slate-800/20 -z-10" />
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-3xl -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
              <div className="lg:col-span-6 text-center lg:text-left mb-16 lg:mb-0">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
                  Solución para Retail & E-commerce
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
                  Vende más.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Pierde menos clientes.</span>
                </h1>

                <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  ¿Cuántas ventas perdiste porque nadie dio seguimiento a tiempo? Innomind automatiza tu embudo completo — desde el primer clic hasta la recompra — con inteligencia omnicanal.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button
                    onClick={openFreeTrial}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
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
                  {/* Decorative elements */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20 dark:opacity-30"></div>

                  {/* Stats Card */}
                  <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8">
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <div className="text-4xl font-extrabold text-blue-600 mb-2">+30%</div>
                        <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Conversión</div>
                      </div>
                      <div>
                        <div className="text-4xl font-extrabold text-indigo-500 mb-2">-20%</div>
                        <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Abandono de Carrito</div>
                      </div>
                      <div>
                        <div className="text-4xl font-extrabold text-emerald-500 mb-2">+40%</div>
                        <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Recompra</div>
                      </div>
                      <div>
                        <div className="text-4xl font-extrabold text-slate-800 dark:text-white mb-2">72h</div>
                        <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Implementación</div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex items-center justify-center text-center">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Implementación en 72h · Sin tarjeta de crédito requerida
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
              <p className="text-lg text-slate-600 dark:text-slate-300">Si te identificas con alguno de estos problemas, estás perdiendo dinero todos los días.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-2xl mb-6 shadow-sm">
                  📉
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Leads que se enfrían</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Tus campañas generan prospectos, pero tu equipo tarda en responder y se van con la competencia.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-2xl mb-6 shadow-sm">
                  🛒
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Carritos abandonados sin recuperar</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Clientes listos para comprar se van, y no tienes un sistema automatizado para traerlos de vuelta.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-2xl mb-6 shadow-sm">
                  🏪
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Tienda física y online desconectadas</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Inventarios que no cuadran y experiencias fragmentadas que frustran a tus clientes omnicanales.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. BLOQUE DIFERENCIADOR */}
        <section className="py-20 relative">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-500/30 rounded-2xl p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Store className="w-32 h-32 text-blue-600" />
              </div>
              <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Diseñado para LATAM</h3>
                  <p className="text-lg text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    "A diferencia de Salesforce o HubSpot, Innomind fue construido pensando en el mercado latinoamericano: <span className="font-bold text-blue-600 dark:text-blue-400">integración nativa con WhatsApp Business, MercadoPago y CFDI</span>, sin conectores externos costosos."
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
              <p className="text-lg text-slate-600 dark:text-slate-300">Una plataforma unificada que conecta todos los puntos de contacto de tu cliente.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
              {/* Feature 1 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Seguimiento por WhatsApp automático</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Envía recordatorios de carritos abandonados, confirmaciones de pedido y encuestas de satisfacción directamente por WhatsApp de forma 100% automatizada.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Vista 360° del cliente</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Conoce el historial completo de compras, tickets de soporte y comportamiento en la tienda de cada cliente en una sola pantalla.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Reportes de ventas en tiempo real</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Visualiza tus métricas clave: CAC, LTV, tasa de conversión y ventas por canal para tomar decisiones basadas en datos al instante.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <RefreshCcw className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Automatización de fidelización</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Crea programas de lealtad, envía ofertas de cumpleaños y detonadores de recompra para aumentar el Life Time Value de tus clientes de forma pasiva.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. MÓDULOS INCLUIDOS */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Módulos Especializados para Retail</h2>

            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {[
                "Embudo de Ventas", "Gestión de Clientes", "Cotizaciones",
                "Finanzas", "Inventario", "Automatización",
                "WhatsApp CRM", "Analytics"
              ].map((module, idx) => (
                <div key={idx} className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-700 dark:text-slate-200 font-semibold shadow-sm hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-default">
                  {module}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. CTA FINAL */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900" />

          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">¿Listo para transformar tu retail?</h2>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10 text-blue-100 font-medium text-lg">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-blue-400" /> Implementación en 72 horas</span>
              <span className="hidden sm:inline text-blue-400">•</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-blue-400" /> Sin contratos forzosos</span>
              <span className="hidden sm:inline text-blue-400">•</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-blue-400" /> Soporte en español</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={openFreeTrial}
                className="px-8 py-4 bg-white text-blue-900 hover:bg-blue-50 font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                Solicitar Cotización
              </button>
              <button className="px-8 py-4 bg-transparent text-white border-2 border-white/20 hover:border-white/40 hover:bg-white/5 font-bold rounded-xl transition-all">
                Agendar Demo
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

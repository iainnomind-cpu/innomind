import React from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { useModal } from '../../../context/ModalContext';
import {
  Rocket,
  BarChart3,
  Users,
  Target,
  Sparkles,
  Bot,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { CoreLogo } from '@/components/brand/CoreLogo';
import { CoreIcon } from '@/components/brand/CoreIcon';

export default function CorePage() {
  const { openFreeTrial, openDemoModal } = useModal();

  return (
    <div className="font-display bg-white dark:bg-slate-900 text-slate-900 dark:text-white antialiased min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* HERO SECTION */}
        <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-28 overflow-hidden">
          <div className="absolute inset-0 bg-blue-50/50 dark:bg-slate-800/20 -z-10" />
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-3xl -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
              <div className="lg:col-span-6 text-center lg:text-left mb-16 lg:mb-0">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
                  Plataforma SaaS Unificada
                </div>

                <div className="mb-6 flex justify-center lg:justify-start">
                  <CoreLogo variant="blue" size="md" showBy={false} />
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
                  El motor de tus ventas,<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">potenciado por IA.</span>
                </h1>

                <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Corē es el ERP-CRM que unifica tus operaciones, desde la captura del prospecto hasta la facturación y el inventario. Obtén una vista 360° de tus clientes e impulsa tus resultados con nuestro asistente inteligente.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button
                    onClick={openFreeTrial}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
                  >
                    Comenzar Prueba Gratuita
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-sky-500 rounded-2xl blur opacity-20 dark:opacity-30"></div>
                  <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8">
                    {/* Visual mockup of dashboard */}
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 mb-4">
                      <div className="flex items-center gap-3">
                        <CoreIcon variant="blue" size="sm" />
                        <div className="h-4 w-24 bg-slate-100 dark:bg-slate-700 rounded"></div>
                      </div>
                      <div className="flex gap-2">
                         <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                            <Bot size={16} />
                         </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="h-24 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-100 dark:border-slate-600">
                        <div className="text-xs text-slate-500 mb-2">Ventas del mes</div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-white">$45,200</div>
                        <div className="text-xs text-emerald-500 mt-1">+12% vs pasado</div>
                      </div>
                      <div className="h-24 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-100 dark:border-slate-600">
                        <div className="text-xs text-slate-500 mb-2">Leads Activos</div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-white">128</div>
                        <div className="text-xs text-emerald-500 mt-1">45 nuevos</div>
                      </div>
                    </div>
                    
                    <div className="h-32 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-100 dark:border-slate-600 flex flex-col justify-end">
                      <div className="flex gap-2 items-end h-full">
                        <div className="w-1/6 bg-blue-200 dark:bg-blue-900/50 rounded-t h-1/3"></div>
                        <div className="w-1/6 bg-blue-300 dark:bg-blue-800/50 rounded-t h-1/2"></div>
                        <div className="w-1/6 bg-blue-400 dark:bg-blue-700/50 rounded-t h-3/4"></div>
                        <div className="w-1/6 bg-blue-500 dark:bg-blue-600/50 rounded-t h-full"></div>
                        <div className="w-1/6 bg-blue-600 dark:bg-blue-500/50 rounded-t h-2/3"></div>
                        <div className="w-1/6 bg-blue-700 dark:bg-blue-400/50 rounded-t h-5/6"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INNO AI SECTION */}
        <section className="py-20 relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-blue-50/50 to-slate-50/50 dark:from-slate-800/40 dark:to-slate-900/40 border border-blue-100/50 dark:border-slate-700/50 rounded-3xl p-8 md:p-16 relative overflow-hidden shadow-lg backdrop-blur-sm">
              <div className="absolute top-0 right-0 p-8 opacity-10 dark:opacity-20 pointer-events-none">
                <Bot className="w-64 h-64 text-blue-500" />
              </div>
              <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-6 shadow-sm">
                    <Sparkles size={16} /> Inteligencia Artificial Integrada
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">Conoce a Inno, tu consultor de IA</h3>
                  <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    No más hojas de cálculo interminables. Inno lee tus datos en tiempo real y te entrega análisis, resúmenes y recomendaciones ejecutivas.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="mt-1 bg-blue-100 dark:bg-blue-500/20 p-1.5 rounded-lg shadow-sm"><Zap size={16} className="text-blue-600 dark:text-blue-400" /></div>
                      <span className="text-slate-700 dark:text-slate-300"><strong>Análisis de Ventas:</strong> Descubre qué productos tienen mayor margen y por qué.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 bg-blue-100 dark:bg-blue-500/20 p-1.5 rounded-lg shadow-sm"><Users size={16} className="text-blue-600 dark:text-blue-400" /></div>
                      <span className="text-slate-700 dark:text-slate-300"><strong>Insights de Clientes:</strong> Entiende los hábitos de compra y predice el abandono.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 bg-blue-100 dark:bg-blue-500/20 p-1.5 rounded-lg shadow-sm"><Target size={16} className="text-blue-600 dark:text-blue-400" /></div>
                      <span className="text-slate-700 dark:text-slate-300"><strong>Asistente Diario:</strong> Pídele resúmenes diarios de cotizaciones y facturas pendientes.</span>
                    </li>
                  </ul>
                </div>
                
                {/* Chat window mockup */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
                   <div className="bg-slate-700/50 p-3 border-b border-slate-700 flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white"><Bot size={16} /></div>
                     <span className="font-semibold text-white">Inno Assistant</span>
                   </div>
                   <div className="p-4 space-y-4">
                     <div className="flex justify-end">
                       <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-2 text-sm max-w-[80%]">
                         ¿Cuál fue el producto más vendido este trimestre y qué cliente lo compró más?
                       </div>
                     </div>
                     <div className="flex justify-start">
                       <div className="bg-slate-700 text-slate-200 rounded-2xl rounded-tl-none px-4 py-3 text-sm max-w-[90%] shadow-md border border-slate-600/50">
                         <p className="mb-2">El producto más vendido fue <strong>"Licencia Enterprise"</strong> con un total de $45,000 USD.</p>
                         <p>El cliente principal fue <strong>TechCorp Inc.</strong>, quienes representan el 40% de estas compras. Te sugiero enviarles la campaña de renovación anual pronto.</p>
                       </div>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Todo lo que necesitas, en un solo lugar</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 mb-6">
                  <Rocket />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Embudo CRM</h3>
                <p className="text-slate-600 dark:text-slate-400">Gestiona leads y arrástralos por etapas hasta cerrar la venta con nuestro tablero Kanban interactivo.</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 mb-6">
                  <Users />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Expediente de Clientes</h3>
                <p className="text-slate-600 dark:text-slate-400">Mantén un registro histórico de ventas, facturas y comunicaciones de cada uno de tus clientes.</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 mb-6">
                  <BarChart3 />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Cotizaciones On-line</h3>
                <p className="text-slate-600 dark:text-slate-400">Crea cotizaciones y envíalas directamente para que el cliente las acepte desde una liga en internet.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA FINAL */}
        <section className="py-20 text-center px-4">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Prueba Corē hoy mismo</h2>
            <button
                onClick={openFreeTrial}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all"
            >
                Comienza tus 30 Días de Prueba
            </button>
        </section>

      </main>
      <Footer />
    </div>
  );
}

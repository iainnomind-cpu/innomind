import React from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { useModal } from '../../../context/ModalContext';
import {
  Rocket,
  CheckSquare,
  Clock,
  Sparkles,
  Bot,
  PieChart,
  Layout
} from 'lucide-react';
import { TrakLogo } from '@/components/brand/TrakLogo';
import { TrakIcon } from '@/components/brand/TrakIcon';

export default function TrakPage() {
  const { openFreeTrial, openDemoModal } = useModal();

  return (
    <div className="font-display bg-white dark:bg-slate-900 text-slate-900 dark:text-white antialiased min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* HERO SECTION */}
        <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-28 overflow-hidden">
          <div className="absolute inset-0 bg-purple-50/50 dark:bg-slate-800/20 -z-10" />
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-purple-100/40 dark:bg-purple-900/10 rounded-full blur-3xl -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
              <div className="lg:col-span-6 text-center lg:text-left mb-16 lg:mb-0">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-purple-600"></span>
                  Project & Task Tracker
                </div>

                <div className="mb-6 flex justify-center lg:justify-start">
                  <TrakLogo variant="blue" size="md" showBy={false} />
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
                  Gestiona tus proyectos.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-fuchsia-500">Mide tu rentabilidad.</span>
                </h1>

                <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Trak no es solo un gestor de tareas. Es la plataforma integral para llevar el control de tus proyectos, horas invertidas, recursos humanos y presupuestos.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button
                    onClick={openFreeTrial}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:from-purple-700 hover:to-fuchsia-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all transform hover:-translate-y-0.5"
                  >
                    Comenzar Prueba Gratuita
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-2xl blur opacity-20 dark:opacity-30"></div>
                  <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8">
                    {/* Visual mockup of dashboard */}
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 mb-4">
                      <div className="flex items-center gap-3">
                        <TrakIcon variant="blue" size="sm" />
                        <div className="h-4 w-24 bg-slate-100 dark:bg-slate-700 rounded"></div>
                      </div>
                      <div className="flex gap-2">
                         <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
                            <Bot size={16} />
                         </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="h-24 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-100 dark:border-slate-600 flex flex-col justify-center items-center">
                         <PieChart className="text-purple-500 mb-2" size={24} />
                         <span className="text-xs font-bold">75% Completado</span>
                      </div>
                      <div className="h-24 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-100 dark:border-slate-600 flex flex-col justify-center items-center">
                         <Clock className="text-fuchsia-500 mb-2" size={24} />
                         <span className="text-xs font-bold">24 Hrs Registradas</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                       <div className="h-12 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center px-4 border border-slate-100 dark:border-slate-600">
                          <div className="w-4 h-4 rounded border-2 border-purple-500 mr-3"></div>
                          <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-600 rounded"></div>
                       </div>
                       <div className="h-12 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center px-4 border border-slate-100 dark:border-slate-600">
                          <div className="w-4 h-4 rounded border-2 border-slate-300 dark:border-slate-500 mr-3"></div>
                          <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-600 rounded"></div>
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
            <div className="bg-gradient-to-br from-purple-50/50 to-slate-50/50 dark:from-slate-800/40 dark:to-slate-900/40 border border-purple-100/50 dark:border-slate-700/50 rounded-3xl p-8 md:p-16 relative overflow-hidden shadow-lg backdrop-blur-sm">
              <div className="absolute top-0 right-0 p-8 opacity-10 dark:opacity-20 pointer-events-none">
                <Bot className="w-64 h-64 text-purple-500" />
              </div>
              <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-sm font-semibold mb-6 shadow-sm">
                    <Sparkles size={16} /> Inteligencia Artificial Integrada
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">Inno: Tu Project Manager Virtual</h3>
                  <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    Deja que Inno organice tu día. Pídele resumen de estatus, cálculo de presupuestos, o que desglose un requerimiento complejo en tareas pequeñas.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="mt-1 bg-purple-100 dark:bg-purple-500/20 p-1.5 rounded-lg shadow-sm"><Layout size={16} className="text-purple-600 dark:text-purple-400" /></div>
                      <span className="text-slate-700 dark:text-slate-300"><strong>Desglose Automático:</strong> Inno puede leer un documento de requerimientos y crear el Kanban completo.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 bg-purple-100 dark:bg-purple-500/20 p-1.5 rounded-lg shadow-sm"><Clock size={16} className="text-purple-600 dark:text-purple-400" /></div>
                      <span className="text-slate-700 dark:text-slate-300"><strong>Cálculo de Tiempos:</strong> Compara horas estimadas vs reales e identifica desviaciones a tiempo.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 bg-purple-100 dark:bg-purple-500/20 p-1.5 rounded-lg shadow-sm"><CheckSquare size={16} className="text-purple-600 dark:text-purple-400" /></div>
                      <span className="text-slate-700 dark:text-slate-300"><strong>Generación de Minutas:</strong> Alimenta tus notas e Inno generará las tareas para cada responsable.</span>
                    </li>
                  </ul>
                </div>
                
                {/* Chat window mockup */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
                   <div className="bg-slate-700/50 p-3 border-b border-slate-700 flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white"><Bot size={16} /></div>
                     <span className="font-semibold text-white">Inno Assistant</span>
                   </div>
                   <div className="p-4 space-y-4">
                     <div className="flex justify-end">
                       <div className="bg-purple-600 text-white rounded-2xl rounded-tr-none px-4 py-2 text-sm max-w-[80%]">
                         Calcula la rentabilidad del proyecto "Rebranding" al día de hoy.
                       </div>
                     </div>
                     <div className="flex justify-start">
                       <div className="bg-slate-700 text-slate-200 rounded-2xl rounded-tl-none px-4 py-3 text-sm max-w-[90%] shadow-md border border-slate-600/50">
                         <p className="mb-2">El presupuesto del proyecto es de $10,000.</p>
                         <p>Se han invertido <strong>45 horas</strong> del equipo de diseño (Costo estimado: $2,250). Aún nos queda un <strong>77.5% de margen</strong> operativo disponible.</p>
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
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Herramientas enfocadas en resultados</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 mb-6">
                  <Layout />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Tableros Kanban</h3>
                <p className="text-slate-600 dark:text-slate-400">Personaliza tus columnas y visualiza el progreso de tus tareas arrastrando las tarjetas libremente.</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 mb-6">
                  <Clock />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Control de Horas (Time Tracking)</h3>
                <p className="text-slate-600 dark:text-slate-400">Registra el tiempo invertido por usuario y calcula automáticamente los costos según el salario de tus empleados.</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 mb-6">
                  <PieChart />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Finanzas del Proyecto</h3>
                <p className="text-slate-600 dark:text-slate-400">Asigna presupuestos, genera gastos y compara la ganancia neta por cada uno de tus proyectos.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA FINAL */}
        <section className="py-20 text-center px-4">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Comienza a organizar tu equipo</h2>
            <button
                onClick={openFreeTrial}
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg transition-all"
            >
                Comienza tus 30 Días de Prueba
            </button>
        </section>

      </main>
      <Footer />
    </div>
  );
}

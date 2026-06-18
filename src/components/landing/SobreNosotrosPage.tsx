import React from 'react';
import { Bot, Code2, Cpu, LineChart, Network, Workflow, ArrowRight } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const SOLUTIONS = [
  {
    title: 'Corē ERP & CRM',
    description: 'Nuestra plataforma para centralizar clientes, ventas y operaciones en un solo lugar.',
    icon: LineChart,
    color: 'blue'
  },
  {
    title: 'Trak Project Tracker',
    description: 'Nuestra solución para gestionar proyectos, tareas y dar seguimiento operativo a tus equipos.',
    icon: Network,
    color: 'indigo'
  },
  {
    title: 'Desarrollo a la Medida',
    description: 'Sistemas empresariales diseñados desde cero para adaptarse a los procesos únicos de tu negocio.',
    icon: Code2,
    color: 'teal'
  },
  {
    title: 'Automatización',
    description: 'Automatización de procesos y flujos de trabajo para eliminar tareas manuales y repetitivas.',
    icon: Workflow,
    color: 'rose'
  },
  {
    title: 'Inteligencia Artificial',
    description: 'Asistentes virtuales e IA para mejorar la atención al cliente e impulsar la productividad interna.',
    icon: Bot,
    color: 'orange'
  },
  {
    title: 'Integraciones Digitales',
    description: 'Conectamos tus sistemas actuales para que la información fluya sin barreras tecnológicas.',
    icon: Cpu,
    color: 'cyan'
  }
];

export default function SobreNosotrosPage() {
  return (
    <div className="font-display bg-white dark:bg-[#0B1120] text-slate-900 dark:text-white antialiased selection:bg-blue-600 selection:text-white min-h-[100dvh] flex flex-col relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-screen" />
      <div className="absolute top-1/2 left-0 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-screen -translate-y-1/2" />
      
      <Navbar />

      <main className="flex-1 pt-32 pb-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto mb-20">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-8">
              Transformamos negocios con{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Tecnología e IA</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 font-medium mb-6 leading-relaxed">
              En Innomind ayudamos a las empresas a hacer más con menos.
            </p>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Innomind es una empresa de transformación digital que ayuda a pequeñas y medianas empresas a mejorar su productividad, optimizar sus operaciones y acelerar su crecimiento mediante tecnología, automatización e inteligencia artificial.
            </p>
          </div>

          {/* Mission Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-24 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Lo que hacemos</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Combinamos consultoría, desarrollo de software y automatización para diseñar soluciones que permitan a las empresas trabajar de forma más eficiente, reducir costos operativos y tomar mejores decisiones. Transformamos procesos manuales y desorganizados en operaciones fluidas.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
              <div className="absolute -bottom-10 -right-10 opacity-20">
                <Bot size={150} />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4">Nuestro Objetivo</h3>
                <p className="text-blue-100 leading-relaxed">
                  Hacer que la innovación y la transformación digital sean accesibles para cualquier negocio, independientemente de su tamaño, presupuesto o nivel de madurez tecnológica.
                </p>
              </div>
            </div>
          </div>

          {/* Portfolio Section */}
          <div className="mb-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Nuestro Portafolio</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Ofrecemos soluciones empaquetadas listas para usar y desarrollos personalizados a tu medida.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {SOLUTIONS.map((solution, idx) => {
                const Icon = solution.icon;
                return (
                  <div key={idx} className="bg-white dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                    <div className={`w-12 h-12 rounded-xl bg-${solution.color}-100 dark:bg-${solution.color}-900/30 flex items-center justify-center text-${solution.color}-600 dark:text-${solution.color}-400 mb-6`}>
                      <Icon size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{solution.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                      {solution.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Final Statement */}
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block p-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl mb-8">
              <div className="bg-white dark:bg-[#0B1120] px-8 py-10 rounded-xl">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Nuestro enfoque es simple:</h3>
                <p className="text-xl text-slate-600 dark:text-slate-300 italic">
                  "Permitir que las personas dediquen más tiempo a generar valor mientras la tecnología se encarga de las tareas repetitivas y operativas."
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

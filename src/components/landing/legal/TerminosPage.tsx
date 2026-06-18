import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, CreditCard, Activity, Database, AlertTriangle, Edit3, Scale, ChevronRight } from 'lucide-react';
import Navbar from '../Navbar';
import Footer from '../Footer';

const SECTIONS = [
  { id: 'aceptacion', title: '1. Aceptación', icon: CheckCircle },
  { id: 'licencia', title: '2. Licencia de Uso', icon: FileText },
  { id: 'pagos', title: '3. Suscripciones y Pagos', icon: CreditCard },
  { id: 'disponibilidad', title: '4. Disponibilidad', icon: Activity },
  { id: 'propiedad', title: '5. Propiedad', icon: Database },
  { id: 'limitaciones', title: '6. Limitaciones', icon: AlertTriangle },
  { id: 'modificaciones', title: '7. Modificaciones', icon: Edit3 },
  { id: 'ley', title: '8. Ley Aplicable', icon: Scale },
];

export default function TerminosPage() {
  const [activeSection, setActiveSection] = useState('aceptacion');

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = SECTIONS.map(s => document.getElementById(s.id));
      const scrollPosition = window.scrollY + 200;

      let currentSection = SECTIONS[0].id;
      sectionElements.forEach((el) => {
        if (el && el.offsetTop <= scrollPosition) {
          currentSection = el.id;
        }
      });
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="font-display bg-white dark:bg-[#0B1120] text-slate-900 dark:text-white antialiased selection:bg-blue-600 selection:text-white min-h-[100dvh] flex flex-col relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-screen" />
      
      <Navbar />

      <main className="flex-1 pt-32 pb-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center justify-center p-3 bg-rose-100 dark:bg-rose-900/30 rounded-2xl text-rose-600 dark:text-rose-400 mb-6">
              <FileText size={32} />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
              Términos y <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-500">Condiciones</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Última actualización: {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 items-start">
            {/* Table of Contents - Sidebar */}
            <aside className="lg:w-1/4 sticky top-32 hidden lg:block">
              <div className="bg-slate-50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase mb-6">En esta página</h3>
                <nav className="space-y-1">
                  {SECTIONS.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive 
                            ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20' 
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Icon size={18} className={isActive ? 'text-rose-200' : 'text-slate-400'} />
                        <span className="text-left">{section.title.split('. ')[1]}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* Content Area */}
            <div className="lg:w-3/4">
              <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 dark:shadow-none">
                
                {/* Section 1 */}
                <section id="aceptacion" className="mb-12 scroll-mt-32">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400">
                      <CheckCircle size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">1. Aceptación de los Términos</h2>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                    Al acceder y utilizar las plataformas y servicios de Innomind Inc. (incluyendo Corē, Trak y desarrollos a medida), usted acepta estar sujeto a los presentes Términos y Condiciones de uso, todas las leyes y regulaciones aplicables, y acepta que es responsable del cumplimiento de cualquier ley local aplicable. Si no está de acuerdo con alguno de estos términos, tiene prohibido usar o acceder a este sitio y sus servicios.
                  </p>
                </section>

                <hr className="border-slate-100 dark:border-slate-800 my-12" />

                {/* Section 2 */}
                <section id="licencia" className="mb-12 scroll-mt-32">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <FileText size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">2. Licencia de Uso</h2>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg mb-6">
                    Para nuestras plataformas SaaS (Corē y Trak), se le concede una licencia temporal, no exclusiva y no transferible para utilizar el software de Innomind bajo el modelo de suscripción, sujeta a las siguientes restricciones:
                  </p>
                  <ul className="space-y-4 mb-8">
                    {[
                      'No podrá modificar, descompilar, aplicar ingeniería inversa o copiar el software de la plataforma.',
                      'No podrá utilizar el software para ningún propósito comercial que compita directamente con Innomind.',
                      'No podrá transferir los materiales a otra persona o "reflejar" los materiales en cualquier otro servidor sin autorización expresa.'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                        <ChevronRight className="text-rose-500 mt-0.5 flex-shrink-0" size={18} />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 p-4 rounded-r-lg text-slate-700 dark:text-slate-300 text-sm">
                    Esta licencia terminará automáticamente si usted viola cualquiera de estas restricciones y puede ser terminada por Innomind en cualquier momento ante el incumplimiento de pago o uso indebido.
                  </div>
                </section>

                <hr className="border-slate-100 dark:border-slate-800 my-12" />

                {/* Section 3 */}
                <section id="pagos" className="mb-12 scroll-mt-32">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <CreditCard size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">3. Suscripciones y Pagos</h2>
                  </div>
                  <div className="space-y-6">
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <h4 className="font-bold text-slate-900 dark:text-white mb-2">Plataformas SaaS (Corē y Trak)</h4>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        El acceso a Corē y Trak se factura mensualmente de forma anticipada. No hay reembolsos ni créditos por meses parciales de servicio, reembolsos de actualización/rebaja, o reembolsos por meses sin usar con una cuenta abierta.
                      </p>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <h4 className="font-bold text-slate-900 dark:text-white mb-2">Desarrollos a Medida</h4>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        Los pagos se realizarán de acuerdo al esquema acordado en el contrato de prestación de servicios específico para cada proyecto, siendo propiedad del cliente el código fuente una vez liquidado el 100% del proyecto.
                      </p>
                    </div>
                  </div>
                </section>

                <hr className="border-slate-100 dark:border-slate-800 my-12" />

                {/* Section 4 */}
                <section id="disponibilidad" className="mb-12 scroll-mt-32">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Activity size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">4. Disponibilidad del Servicio</h2>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                    Innomind se esfuerza por asegurar que sus servicios estén disponibles el <strong>99.9% del tiempo</strong>. Sin embargo, no nos hacemos responsables por la indisponibilidad temporal del servicio debido a mantenimiento programado o problemas técnicos fuera de nuestro control, como interrupciones de los proveedores de nube.
                  </p>
                </section>

                <hr className="border-slate-100 dark:border-slate-800 my-12" />

                {/* Section 5 */}
                <section id="propiedad" className="mb-12 scroll-mt-32">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
                      <Database size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">5. Propiedad de la Información</h2>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                    Usted conserva en todo momento la propiedad intelectual y los derechos sobre todos los datos e información que ingrese a través de nuestras plataformas. Innomind no reclamará ninguna propiedad sobre los datos de sus clientes. Usted puede exportar y descargar su información en cualquier momento mientras su suscripción esté activa.
                  </p>
                </section>

                <hr className="border-slate-100 dark:border-slate-800 my-12" />

                {/* Section 6 */}
                <section id="limitaciones" className="mb-12 scroll-mt-32">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-400">
                      <AlertTriangle size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">6. Limitaciones de Responsabilidad</h2>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                    En ningún caso Innomind o sus proveedores serán responsables de ningún daño (incluyendo, sin limitación, daños por pérdida de datos o beneficios, o debido a la interrupción del negocio) que surja del uso o la imposibilidad de usar los materiales o servicios de Innomind.
                  </p>
                </section>

                <hr className="border-slate-100 dark:border-slate-800 my-12" />

                {/* Section 7 */}
                <section id="modificaciones" className="mb-12 scroll-mt-32">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                      <Edit3 size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">7. Modificaciones a los Términos</h2>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                    Innomind puede revisar estos términos de servicio en cualquier momento sin previo aviso. Al utilizar este sitio web y nuestras plataformas, usted acepta estar sujeto a la versión actual de estos términos de servicio.
                  </p>
                </section>

                <hr className="border-slate-100 dark:border-slate-800 my-12" />

                {/* Section 8 */}
                <section id="ley" className="scroll-mt-32">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300">
                      <Scale size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">8. Ley Aplicable</h2>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                    Cualquier reclamación relacionada con el sitio web y servicios de Innomind se regirá por las leyes locales correspondientes al domicilio de la empresa, sin consideración a sus disposiciones de conflicto de leyes.
                  </p>
                </section>

              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

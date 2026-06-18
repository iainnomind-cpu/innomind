import React, { useState, useEffect } from 'react';
import { Shield, UserCheck, Database, Cookie, Lock, Scale, Edit3, ChevronRight } from 'lucide-react';
import Navbar from '../Navbar';
import Footer from '../Footer';

const SECTIONS = [
  { id: 'identidad', title: '1. Identidad y domicilio', icon: Shield },
  { id: 'datos', title: '2. Datos que recabamos', icon: Database },
  { id: 'finalidades', title: '3. Finalidades', icon: UserCheck },
  { id: 'cookies', title: '4. Tecnologías de Rastreo', icon: Cookie },
  { id: 'seguridad', title: '5. Medidas de Seguridad', icon: Lock },
  { id: 'arco', title: '6. Derechos ARCO', icon: Scale },
  { id: 'modificaciones', title: '7. Modificaciones', icon: Edit3 },
];

export default function PrivacidadPage() {
  const [activeSection, setActiveSection] = useState('identidad');

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = SECTIONS.map(s => document.getElementById(s.id));
      const scrollPosition = window.scrollY + 200; // Offset for fixed header

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
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-screen" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-screen" />
      
      <Navbar />

      <main className="flex-1 pt-32 pb-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400 mb-6">
              <Shield size={32} />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
              Aviso de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Privacidad</span>
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
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Icon size={18} className={isActive ? 'text-blue-200' : 'text-slate-400'} />
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
                <section id="identidad" className="mb-12 scroll-mt-32">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Shield size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">1. Identidad y domicilio del responsable</h2>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                    Innomind Inc. (en adelante "Innomind"), con domicilio en [Dirección de la empresa], es responsable de recabar sus datos personales, del uso que se le dé a los mismos y de su protección, en cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).
                  </p>
                </section>

                <hr className="border-slate-100 dark:border-slate-800 my-12" />

                {/* Section 2 */}
                <section id="datos" className="mb-12 scroll-mt-32">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Database size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">2. Datos personales que recabamos</h2>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg mb-6">
                    Para llevar a cabo las finalidades descritas en el presente aviso de privacidad, utilizaremos los siguientes datos personales:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      'Nombre completo', 'Correo electrónico corporativo', 'Teléfono de contacto', 
                      'Nombre de la empresa o lugar de trabajo', 'Datos de facturación e información fiscal', 
                      'Información generada durante el uso de nuestras plataformas'
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                        <ChevronRight className="text-blue-500 mt-0.5 flex-shrink-0" size={18} />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <hr className="border-slate-100 dark:border-slate-800 my-12" />

                {/* Section 3 */}
                <section id="finalidades" className="mb-12 scroll-mt-32">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
                      <UserCheck size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">3. Finalidades del tratamiento de datos</h2>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Finalidades Primarias:</h3>
                  <ul className="space-y-4 mb-8">
                    {[
                      'Creación y administración de su cuenta en nuestras plataformas.',
                      'Procesar sus pagos y emitir los comprobantes fiscales correspondientes.',
                      'Brindar soporte técnico y atención al cliente.',
                      'Garantizar la seguridad de su información y prevenir fraudes.'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                        </div>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Finalidades Secundarias:</h3>
                  <ul className="space-y-4">
                    {[
                      'Envío de correos promocionales y actualizaciones sobre nuevos productos o funciones.',
                      'Evaluar la calidad del servicio que le brindamos.'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full"></div>
                        </div>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <hr className="border-slate-100 dark:border-slate-800 my-12" />

                {/* Section 4 */}
                <section id="cookies" className="mb-12 scroll-mt-32">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-400">
                      <Cookie size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">4. Uso de Tecnologías de Rastreo (Cookies)</h2>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                    Le informamos que en nuestra página de internet utilizamos cookies, web beacons y otras tecnologías a través de las cuales es posible monitorear su comportamiento como usuario de internet, así como brindarle un mejor servicio y experiencia de usuario al navegar en nuestra página.
                  </p>
                </section>

                <hr className="border-slate-100 dark:border-slate-800 my-12" />

                {/* Section 5 */}
                <section id="seguridad" className="mb-12 scroll-mt-32">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400">
                      <Lock size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">5. Medidas de Seguridad</h2>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg mb-4">
                      Innomind ha implementado medidas de seguridad administrativas, técnicas y físicas de primer nivel para proteger sus datos personales contra daño, pérdida, alteración, destrucción o el uso, acceso o tratamiento no autorizado.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold flex items-center gap-1"><Lock size={14}/> AES-256</span>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold flex items-center gap-1"><Lock size={14}/> TLS 1.3</span>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold flex items-center gap-1"><Lock size={14}/> SOC 2 Tipo II</span>
                    </div>
                  </div>
                </section>

                <hr className="border-slate-100 dark:border-slate-800 my-12" />

                {/* Section 6 */}
                <section id="arco" className="mb-12 scroll-mt-32">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                      <Scale size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">6. Derechos ARCO</h2>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg mb-6">
                    Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información personal en caso de que esté desactualizada, sea inexacta o incompleta (Rectificación); que la eliminemos de nuestros registros o bases de datos cuando considere que la misma no está siendo utilizada adecuadamente (Cancelación); así como oponerse al uso de sus datos personales para fines específicos (Oposición). Estos derechos se conocen como derechos ARCO.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1">Para ejercer sus derechos:</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Envíe una solicitud detallada a nuestro equipo legal.</p>
                    </div>
                    <a href="mailto:contacto@innomind.com" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors whitespace-nowrap">
                      contacto@innomind.com
                    </a>
                  </div>
                </section>

                <hr className="border-slate-100 dark:border-slate-800 my-12" />

                {/* Section 7 */}
                <section id="modificaciones" className="scroll-mt-32">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
                      <Edit3 size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">7. Modificaciones al Aviso</h2>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                    El presente aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones derivadas de nuevos requerimientos legales; de nuestras propias necesidades por los productos o servicios que ofrecemos; de nuestras prácticas de privacidad; de cambios en nuestro modelo de negocio, o por otras causas. 
                    <br/><br/>
                    Nos comprometemos a mantenerlo informado sobre los cambios que pueda sufrir el presente aviso de privacidad, a través de nuestra página web o mediante un correo electrónico dirigido a la dirección que nos haya proporcionado.
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

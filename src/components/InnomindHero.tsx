function InnomindHero() {
  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-3">
              <div className="size-8 text-primary">
                <svg className="w-full h-full text-primary" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4ZM24 40C15.1634 40 8 32.8366 8 24C8 15.1634 15.1634 8 24 8C32.8366 8 40 15.1634 40 24C40 32.8366 32.8366 40 24 40Z" fill="currentColor" fillOpacity="0.2"></path>
                  <path d="M24 12C17.3726 12 12 17.3726 12 24C12 30.6274 17.3726 36 24 36C30.6274 36 36 30.6274 36 24C36 17.3726 30.6274 12 24 12ZM24 32C19.5817 32 16 28.4183 16 24C16 19.5817 19.5817 16 24 16C28.4183 16 32 19.5817 32 24C32 28.4183 28.4183 32 24 32Z" fill="currentColor"></path>
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Innomind</span>
            </div>
            <div className="hidden lg:flex items-center gap-8">
              <a className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors" href="#">Plataforma</a>
              <a className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors" href="#">Soluciones</a>
              <a className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors" href="#">Consultoría</a>
              <a className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors" href="#">Recursos</a>
              <a className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors" href="#">Precios</a>
            </div>
            <div className="flex items-center gap-3">
              <button className="hidden md:flex h-9 items-center px-4 rounded-lg text-sm font-bold text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                Login
              </button>
              <button className="h-9 md:h-10 px-5 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                <span>Pueba Gratis</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative w-full min-h-[calc(100vh-80px)] flex items-center overflow-hidden mesh-gradient-bg">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] pointer-events-none"></div>

        <div className="relative w-full max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="flex flex-col gap-6 md:gap-8 max-w-2xl mx-auto lg:mx-0 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel self-center lg:self-start border-primary/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-xs font-semibold text-white tracking-wide uppercase">Nueva Integración GPT-4o Disponible</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
                Automatice su Empresa y Reduzca Costos Operativos en un <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">40%</span> con Innomind
              </h1>
              <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                La plataforma definitiva que integra ERP, CRM e Inteligencia Artificial para escalar su negocio. Obtenga insights predictivos y automatice flujos de trabajo complejos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <button className="h-12 px-8 rounded-lg bg-primary hover:bg-blue-700 text-white text-base font-bold shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2">
                  Comenzar Prueba Gratuita
                </button>
                <button className="h-12 px-8 rounded-lg glass-panel hover:bg-white/10 text-white text-base font-bold transition-all flex items-center justify-center gap-2 group">
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">play_circle</span>
                  Ver Demo
                </button>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2 pt-4 text-slate-400 text-sm font-medium">
                <span className="material-symbols-outlined text-[16px] text-green-500">check_circle</span>
                <span>Sin tarjeta de crédito requerida</span>
              </div>
            </div>

            <div className="relative perspective-[2000px] group hidden md:block">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
              <div className="relative glass-panel rounded-2xl p-6 transform transition-transform duration-700 hover:rotate-y-[-2deg] hover:rotate-x-[2deg]">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <span className="material-symbols-outlined">analytics</span>
                    </div>
                    <div>
                      <h3 className="text-white font-bold">Resumen Ejecutivo</h3>
                      <p className="text-xs text-slate-400">Actualizado hace 2m</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-xs text-green-400 font-medium">Sistema Online</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="glass-panel p-4 rounded-xl bg-black/20 border-0">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-slate-400">Ingresos Mensuales</span>
                      <span className="material-symbols-outlined text-green-400 text-sm">trending_up</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">$124,500</div>
                    <div className="text-xs text-green-400">+12.5% vs mes anterior</div>
                    <div className="h-10 mt-3 flex items-end gap-1">
                      <div className="w-full bg-blue-500/20 h-[40%] rounded-sm"></div>
                      <div className="w-full bg-blue-500/20 h-[60%] rounded-sm"></div>
                      <div className="w-full bg-blue-500/20 h-[30%] rounded-sm"></div>
                      <div className="w-full bg-blue-500/20 h-[70%] rounded-sm"></div>
                      <div className="w-full bg-blue-500 h-[85%] rounded-sm shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    </div>
                  </div>
                  <div className="glass-panel p-4 rounded-xl bg-black/20 border-0">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-slate-400">Eficiencia Operativa</span>
                      <span className="material-symbols-outlined text-blue-400 text-sm">speed</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">94.2%</div>
                    <div className="text-xs text-slate-400">Pico máximo hoy</div>
                    <div className="mt-3 relative h-10 w-full flex items-center gap-3">
                      <div className="h-2 flex-1 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 w-[94%]"></div>
                      </div>
                      <span className="text-xs text-white">Alta</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-xl p-4 flex gap-4 items-start">
                  <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400 mt-1">
                    <span className="material-symbols-outlined text-xl">smart_toy</span>
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-bold mb-1">Innomind AI Insight</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Se detectó una oportunidad de optimización en la cadena de suministro.
                      <span className="text-white font-medium underline decoration-blue-500 decoration-dashed cursor-pointer"> Ver reporte completo</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-8 top-20 glass-panel p-3 rounded-lg flex items-center gap-3 animate-[bounce_3s_infinite]">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                  <span className="material-symbols-outlined text-sm">attach_money</span>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Ahorro proyectado</div>
                  <div className="text-sm font-bold text-white">+$12k/año</div>
                </div>
              </div>
              <div className="absolute -left-4 bottom-10 glass-panel p-3 rounded-lg flex items-center gap-3 animate-[bounce_4s_infinite]">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <span className="material-symbols-outlined text-sm">group_add</span>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Leads calificados</div>
                  <div className="text-sm font-bold text-white">+48 hoy</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="border-y border-slate-100 bg-background-subtle py-10 dark:bg-slate-900/50 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-slate-500 mb-8 uppercase tracking-wider">
            Empresas líderes confían en la infraestructura de Innomind
          </p>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-6 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex justify-center items-center gap-2">
              <span className="material-symbols-outlined text-3xl">cloud_circle</span>
              <span className="font-bold text-xl">CloudScale</span>
            </div>
            <div className="flex justify-center items-center gap-2">
              <span className="material-symbols-outlined text-3xl">token</span>
              <span className="font-bold text-xl">Nexus</span>
            </div>
            <div className="flex justify-center items-center gap-2">
              <span className="material-symbols-outlined text-3xl">view_in_ar</span>
              <span className="font-bold text-xl">Vertex</span>
            </div>
            <div className="flex justify-center items-center gap-2">
              <span className="material-symbols-outlined text-3xl">dataset</span>
              <span className="font-bold text-xl">Dataflow</span>
            </div>
            <div className="flex justify-center items-center gap-1 border-l border-slate-300 pl-4 md:col-span-1 col-span-1">
              <span className="material-symbols-outlined text-2xl text-slate-700">security</span>
              <span className="font-semibold text-xs text-slate-700">SOC 2<br/>Type II</span>
            </div>
            <div className="flex justify-center items-center gap-1 md:col-span-1 col-span-1">
              <span className="material-symbols-outlined text-2xl text-slate-700">verified_user</span>
              <span className="font-semibold text-xs text-slate-700">GDPR<br/>Ready</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white dark:bg-background-dark relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Elija el camino hacia su transformación digital
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Ofrecemos soluciones flexibles: desde software de autoservicio hasta consultoría estratégica de alto nivel.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition-all hover:shadow-xl dark:bg-slate-900 dark:border-slate-800">
              <div className="p-8 sm:p-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-primary">
                    <span className="material-symbols-outlined text-2xl">rocket_launch</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Autoservicio
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Plataforma SaaS</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-8 flex-grow">
                  Gestione su negocio hoy mismo con nuestra suite todo-en-uno. Ideal para PyMEs y Startups que buscan agilidad.
                </p>
                <ul className="space-y-4 mb-8 text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-green-500 text-xl">check</span>
                    ERP & CRM Integrados
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-green-500 text-xl">check</span>
                    Automatización de Marketing
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-green-500 text-xl">check</span>
                    Reportes básicos de IA
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-green-500 text-xl">check</span>
                    Soporte por Chat 24/7
                  </li>
                </ul>
                <button className="w-full rounded-lg border-2 border-primary bg-transparent py-3 px-4 text-center text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white">
                  Ver Planes y Precios
                </button>
              </div>
            </div>

            <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-accent-dark text-white shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-black opacity-90"></div>
              <div className="absolute top-0 right-0 p-32 bg-primary blur-[100px] opacity-20 rounded-full pointer-events-none"></div>

              <div className="relative p-8 sm:p-10 flex flex-col h-full z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-glow">
                    <span className="material-symbols-outlined text-2xl">psychology</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-white uppercase tracking-wide backdrop-blur-sm">
                    Enterprise
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Consultoría IA & Estrategia</h3>
                <p className="text-slate-300 mb-8 flex-grow">
                  Transformación digital a medida. Nuestros expertos diseñan e implementan soluciones de IA específicas para su industria.
                </p>
                <ul className="space-y-4 mb-8 text-sm text-slate-300">
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-indigo-400 text-xl">auto_fix_high</span>
                    Desarrollo de Modelos de IA a Medida
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-indigo-400 text-xl">auto_fix_high</span>
                    Auditoría de Procesos y Datos
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-indigo-400 text-xl">auto_fix_high</span>
                    Integración Legacy Systems
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-indigo-400 text-xl">auto_fix_high</span>
                    Gerente de Cuenta Dedicado
                  </li>
                </ul>
                <button className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-primary py-3 px-4 text-center text-sm font-bold text-white shadow-lg transition-all hover:shadow-indigo-500/25 hover:scale-[1.02]">
                  Hablar con un Experto
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-background-subtle dark:bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Resultados Reales</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Vea cómo nuestros clientes transforman sus operaciones.
              </p>
            </div>
            <div className="inline-flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                <span className="font-bold text-slate-900 dark:text-white">842</span> empresas optimizando ahora
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="flex text-yellow-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-sm">star</span>
                ))}
              </div>
              <blockquote className="text-slate-700 dark:text-slate-300 mb-6 text-sm leading-relaxed">
                "La integración del CRM con el módulo de IA nos permitió identificar patrones de fuga de clientes que no veíamos.{' '}
                <strong className="text-slate-900 dark:text-white">Redujimos el churn un 25%</strong> en el primer trimestre."
              </blockquote>
              <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-700 pt-4">
                <div className="h-10 w-10 rounded-full bg-slate-200"></div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">Ana García</div>
                  <div className="text-xs text-slate-500">CTO en Logística Express</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="flex text-yellow-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-sm">star</span>
                ))}
              </div>
              <blockquote className="text-slate-700 dark:text-slate-300 mb-6 text-sm leading-relaxed">
                "Implementar Innomind fue como contratar a 10 analistas de datos de la noche a la mañana. Automatizamos la facturación y{' '}
                <strong className="text-slate-900 dark:text-white">ahorramos 20 horas semanales</strong> al equipo financiero."
              </blockquote>
              <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-700 pt-4">
                <div className="h-10 w-10 rounded-full bg-slate-200"></div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">Carlos Méndez</div>
                  <div className="text-xs text-slate-500">CEO en FinTech Solutions</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="flex text-yellow-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-sm">star</span>
                ))}
              </div>
              <blockquote className="text-slate-700 dark:text-slate-300 mb-6 text-sm leading-relaxed">
                "La consultoría personalizada fue clave. Entendieron nuestro modelo de negocio complejo y crearon una solución a medida que{' '}
                <strong className="text-slate-900 dark:text-white">aumentó el ROI en un 150%</strong>."
              </blockquote>
              <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-700 pt-4">
                <div className="h-10 w-10 rounded-full bg-slate-200"></div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">Laura Torres</div>
                  <div className="text-xs text-slate-500">Dir. Operaciones, RetailCorp</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}></div>
        <div className="mx-auto max-w-4xl px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
            ¿Listo para la transformación digital?
          </h2>
          <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Únase a cientos de empresas que están redefiniendo sus industrias con el poder de Innomind.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="flex items-center justify-center rounded-lg bg-white px-8 py-4 text-base font-bold text-primary shadow-lg hover:bg-slate-50 transition-colors">
              Comenzar Prueba Gratuita
            </button>
            <button className="flex items-center justify-center rounded-lg border-2 border-white/30 bg-white/10 px-8 py-4 text-base font-bold text-white hover:bg-white/20 transition-colors backdrop-blur-sm">
              Agendar Demo
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 lg:col-span-2 pr-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex size-6 items-center justify-center rounded bg-primary text-white">
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white">Innomind</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Innomind es la plataforma líder en integración de ERP y CRM potenciada por IA.
                Ayudamos a empresas a escalar operaciones de manera inteligente y segura.
              </p>
              <div className="flex gap-4">
                <a className="text-slate-400 hover:text-primary transition-colors" href="#">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
                <a className="text-slate-400 hover:text-primary transition-colors" href="#">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wider uppercase mb-4">
                Producto
              </h3>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li><a className="hover:text-primary transition-colors" href="#">Características</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Integraciones</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Precios</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Actualizaciones</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wider uppercase mb-4">
                Compañía
              </h3>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li><a className="hover:text-primary transition-colors" href="#">Sobre Nosotros</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Carreras</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Blog</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Contacto</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wider uppercase mb-4">
                Legal
              </h3>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li><a className="hover:text-primary transition-colors" href="#">Privacidad</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Términos</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Seguridad</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500">© 2024 Innomind Inc. Todos los derechos reservados.</p>
            <div className="flex items-center gap-6">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Todos los sistemas operativos
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default InnomindHero;

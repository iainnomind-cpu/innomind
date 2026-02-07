
import React, { useState, useEffect } from 'react';
import {
  Menu, X, ChevronDown, ChevronRight,
  LayoutGrid, BarChart3, Database, Layers,
  Code2, Link2, RefreshCw,
  Store, Building2, Factory, Truck, Heart, GraduationCap,
  Rocket, Lightbulb, LifeBuoy,
  FileText, BookOpen, Video, Files,
  Star, TrendingUp, Calculator,
  HelpCircle, MessageCircle, Phone
} from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDropdown = (name: string) => {
    if (activeDropdown === name) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(name);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm' : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="size-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg">
              <LayoutGrid size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Innomind</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1">
            <NavItem
              title="PLATAFORMA"
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
            >
              <div className="w-[600px] p-6 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-5 duration-200">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">PLATAFORMA SAAS</h3>
                  <p className="text-xs text-slate-500">Soluciones listas para implementar</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <DropdownLink
                    icon={<LayoutGrid className="text-blue-500" />}
                    title="CRM Innomind"
                    desc="Gestión completa de clientes y ventas"
                    href="/plataforma/crm"
                  />
                  <DropdownLink
                    icon={<BarChart3 className="text-purple-500" />}
                    title="Project Tracker"
                    desc="Seguimiento de proyectos en tiempo real"
                    href="/plataforma/project-tracker"
                  />
                  <DropdownLink
                    icon={<Database className="text-green-500" />}
                    title="ERP Estándar"
                    desc="Planificación de recursos empresariales"
                    href="/plataforma/erp"
                  />
                  <DropdownLink
                    icon={<Layers className="text-orange-500" />}
                    title="Suite Completa"
                    desc="Todas las herramientas integradas"
                    href="/plataforma/suite"
                  />
                </div>
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <a href="/prueba-gratis" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded-lg shadow transition-all hover:scale-105">Comenzar Prueba Gratuita</a>
                  <a href="/demo" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1">
                    Ver Demo <ChevronRight size={14} />
                  </a>
                </div>
              </div>
            </NavItem>

            <NavItem
              title="SOLUCIONES"
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
            >
              <div className="w-[800px] p-0 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden flex animate-in fade-in slide-in-from-top-5 duration-200">
                <div className="w-1/2 p-6 bg-slate-50 dark:bg-slate-800/30">
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">DESARROLLO A MEDIDA</h3>
                    <p className="text-xs text-slate-500">Personalizado para su empresa</p>
                  </div>
                  <div className="space-y-4">
                    <DropdownLink
                      icon={<Code2 className="text-indigo-500" />}
                      title="ERP Personalizado"
                      desc="Sistema diseñado 100% para su negocio"
                      href="/soluciones/erp-personalizado"
                    />
                    <DropdownLink
                      icon={<Link2 className="text-teal-500" />}
                      title="Integraciones"
                      desc="Conecte sus sistemas existentes"
                      href="/soluciones/integraciones"
                    />
                    <DropdownLink
                      icon={<RefreshCw className="text-pink-500" />}
                      title="Migración de Sistemas"
                      desc="Transición segura y sin interrupciones"
                      href="/soluciones/migracion"
                    />
                  </div>
                </div>
                <div className="w-1/2 p-6">
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">POR INDUSTRIA</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <SimpleLink icon={<Store size={18} />} title="Retail & E-commerce" href="/industrias/retail" />
                    <SimpleLink icon={<Building2 size={18} />} title="Servicios Profesionales" href="/industrias/servicios" />
                    <SimpleLink icon={<Factory size={18} />} title="Manufactura" href="/industrias/manufactura" />
                    <SimpleLink icon={<Truck size={18} />} title="Logística y Distribución" href="/industrias/logistica" />
                    <SimpleLink icon={<Heart size={18} />} title="Salud y Bienestar" href="/industrias/salud" />
                    <SimpleLink icon={<GraduationCap size={18} />} title="Educación" href="/industrias/educacion" />
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <a href="/cotizacion" className="block w-full text-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors">
                      Solicitar Cotización
                    </a>
                  </div>
                </div>
              </div>
            </NavItem>

            <NavItem
              title="SERVICIOS"
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
            >
              <div className="w-[600px] p-6 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-5 duration-200">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">NUESTROS SERVICIOS</h3>
                  <p className="text-xs text-slate-500">Acompañamiento integral</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <DropdownLink
                    icon={<Rocket className="text-red-500" />}
                    title="Implementación"
                    desc="Puesta en marcha rápida y efectiva"
                    href="/servicios/implementacion"
                  />
                  <DropdownLink
                    icon={<RefreshCw className="text-blue-500" />}
                    title="Migración"
                    desc="Transición de sistemas sin interrupciones"
                    href="/servicios/migracion"
                  />
                  <DropdownLink
                    icon={<Lightbulb className="text-yellow-500" />}
                    title="Consultoría Estratégica"
                    desc="Asesoría en transformación digital"
                    href="/servicios/consultoria"
                  />
                  <DropdownLink
                    icon={<LifeBuoy className="text-green-500" />}
                    title="Soporte 24/7"
                    desc="Asistencia técnica siempre disponible"
                    href="/servicios/soporte"
                  />
                </div>
                <div className="text-right">
                  <a href="/experto" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center justify-end gap-1">
                    Hablar con un Experto <ChevronRight size={14} />
                  </a>
                </div>
              </div>
            </NavItem>

            <NavItem
              title="RECURSOS"
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
            >
              <div className="w-[800px] p-6 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-5 duration-200">
                <div className="grid grid-cols-3 gap-8">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Aprende</h3>
                    <div className="space-y-3">
                      <SimpleLink icon={<FileText size={16} />} title="Blog" href="/blog" />
                      <SimpleLink icon={<BookOpen size={16} />} title="Guías y Tutoriales" href="/guias" />
                      <SimpleLink icon={<Video size={16} />} title="Webinars" href="/webinars" />
                      <SimpleLink icon={<Files size={16} />} title="Documentación" href="/docs" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Casos de Éxito</h3>
                    <div className="space-y-3">
                      <SimpleLink icon={<Star size={16} />} title="Testimonios" href="/testimonios" />
                      <SimpleLink icon={<TrendingUp size={16} />} title="Casos de Estudio" href="/casos-exito" />
                      <SimpleLink icon={<Calculator size={16} />} title="Calculadora ROI" href="/calculadora-roi" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Ayuda</h3>
                    <div className="space-y-3">
                      <SimpleLink icon={<HelpCircle size={16} />} title="Centro de Ayuda" href="/ayuda" />
                      <SimpleLink icon={<MessageCircle size={16} />} title="FAQ" href="/faq" />
                      <SimpleLink icon={<Phone size={16} />} title="Contactar Soporte" href="/soporte" />
                    </div>
                  </div>
                </div>
              </div>
            </NavItem>

            <a href="/precios" className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              PRECIOS
            </a>
          </div>

          {/* Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <a href="/login" className="text-sm font-bold text-slate-700 dark:text-white hover:text-blue-600 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-600 transition-all">
              Login
            </a>
            <a href="/prueba-gratis" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 px-5 rounded-lg shadow-lg shadow-blue-600/20 transition-all hover:scale-105">
              Comenzar Prueba Gratuita
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl overflow-y-auto max-h-[calc(100vh-80px)]">
          <div className="p-4 space-y-2">
            <MobileNavItem title="PLATAFORMA" isOpen={activeDropdown === 'PLATAFORMA'} onClick={() => toggleDropdown('PLATAFORMA')}>
              <div className="pl-4 space-y-2 py-2">
                <MobileLink href="/plataforma/crm" title="CRM Innomind" />
                <MobileLink href="/plataforma/project-tracker" title="Project Tracker" />
                <MobileLink href="/plataforma/erp" title="ERP Estándar" />
                <MobileLink href="/plataforma/suite" title="Suite Completa" />
              </div>
            </MobileNavItem>

            <MobileNavItem title="SOLUCIONES" isOpen={activeDropdown === 'SOLUCIONES'} onClick={() => toggleDropdown('SOLUCIONES')}>
              <div className="pl-4 space-y-4 py-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 mb-2">DESARROLLO A MEDIDA</h4>
                  <div className="space-y-2">
                    <MobileLink href="/soluciones/erp-personalizado" title="ERP Personalizado" />
                    <MobileLink href="/soluciones/integraciones" title="Integraciones" />
                    <MobileLink href="/soluciones/migracion" title="Migración" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-500 mb-2">POR INDUSTRIA</h4>
                  <div className="space-y-2">
                    <MobileLink href="/industrias/retail" title="Retail & E-commerce" />
                    <MobileLink href="/industrias/servicios" title="Servicios Profesionales" />
                    <MobileLink href="/industrias/manufactura" title="Manufactura" />
                  </div>
                </div>
              </div>
            </MobileNavItem>

            <MobileNavItem title="SERVICIOS" isOpen={activeDropdown === 'SERVICIOS'} onClick={() => toggleDropdown('SERVICIOS')}>
              <div className="pl-4 space-y-2 py-2">
                <MobileLink href="/servicios/implementacion" title="Implementación" />
                <MobileLink href="/servicios/migracion" title="Migración" />
                <MobileLink href="/servicios/consultoria" title="Consultoría Estratégica" />
                <MobileLink href="/servicios/soporte" title="Soporte 24/7" />
              </div>
            </MobileNavItem>

            <MobileNavItem title="RECURSOS" isOpen={activeDropdown === 'RECURSOS'} onClick={() => toggleDropdown('RECURSOS')}>
              <div className="pl-4 space-y-2 py-2">
                <MobileLink href="/blog" title="Blog" />
                <MobileLink href="/guias" title="Guías y Tutoriales" />
                <MobileLink href="/webinars" title="Webinars" />
                <MobileLink href="/casos-exito" title="Casos de Éxito" />
                <MobileLink href="/calculadora-roi" title="Calculadora ROI" />
                <MobileLink href="/soporte" title="Ayuda y Soporte" />
              </div>
            </MobileNavItem>

            <a href="/precios" className="block w-full text-left px-4 py-3 text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800">
              PRECIOS
            </a>

            <div className="pt-4 space-y-3">
              <a href="/login" className="block w-full text-center py-3 px-4 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-white font-bold">
                Login
              </a>
              <a href="/prueba-gratis" className="block w-full text-center py-3 px-4 bg-blue-600 text-white rounded-lg font-bold">
                Comenzar Prueba Gratuita
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function NavItem({ title, children, activeDropdown, setActiveDropdown }: any) {
  const isActive = activeDropdown === title;

  return (
    <div
      className="relative group"
      onMouseEnter={() => setActiveDropdown(title)}
      onMouseLeave={() => setActiveDropdown(null)}
    >
      <button
        className={`flex items-center gap-1 px-4 py-2 text-sm font-bold transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
      >
        {title} <ChevronDown size={14} className={`transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`} />
      </button>

      <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 ${isActive ? 'block' : 'hidden'}`}>
        {children}
      </div>
    </div>
  );
}


function DropdownLink({ icon, title, desc, href }: any) {
  return (
    <a href={href} className="flex gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
      <div className="mt-1 text-slate-500 group-hover:text-white transition-colors">
        {icon}
      </div>
      <div>
        <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-white transition-colors">
          {title}
        </div>
        <div className="text-xs text-slate-500 line-clamp-1 group-hover:text-slate-300 transition-colors">
          {desc}
        </div>
      </div>
    </a>
  );
}

function SimpleLink({ icon, title, href }: any) {
  return (
    <a href={href} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-white dark:hover:text-white transition-colors group">
      <span className="text-slate-400 group-hover:text-white transition-colors">{icon}</span>
      <span>{title}</span>
    </a>
  );
}

function MobileNavItem({ title, children, isOpen, onClick }: any) {
  return (
    <div>
      <button
        onClick={onClick}
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800"
      >
        {title}
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && children}
    </div>
  );
}

function MobileLink({ href, title }: any) {
  return (
    <a href={href} className="block py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-white">
      {title}
    </a>
  );
}


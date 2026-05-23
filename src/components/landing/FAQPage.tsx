
import React, { useState } from 'react';
import { Plus, Minus, HelpCircle, Search, MessageCircle, ArrowRight, LifeBuoy } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useModal } from '../../context/ModalContext';

const FAQ_CATEGORIES = [
  { id: 'general', label: 'General' },
  { id: 'plataforma', label: 'Plataforma' },
  { id: 'precios', label: 'Precios' },
  { id: 'soporte', label: 'Soporte' },
  { id: 'seguridad', label: 'Seguridad' },
];

const ALL_FAQS = [
  {
    category: 'general',
    question: '¿Qué es Innomind?',
    answer: 'Innomind es una empresa de tecnología que ofrece soluciones integrales de gestión empresarial. Nuestros productos incluyen Corē (ERP por suscripción), Trak (project tracker por suscripción), chatbots con IA, mensajería masiva por WhatsApp y desarrollo de software 100% a la medida.'
  },
  {
    category: 'general',
    question: '¿Qué es Corē?',
    answer: 'Corē es nuestro ERP por suscripción. Incluye CRM, facturación, inventario, reportes avanzados e inteligencia artificial. Te suscribes y ya tienes acceso inmediato — sin esperas, sin implementaciones largas.'
  },
  {
    category: 'general',
    question: '¿Qué es Trak?',
    answer: 'Trak es nuestro project tracker por suscripción. Ofrece gestión de proyectos, tableros Kanban, seguimiento de tareas, colaboración en equipo y reportes de productividad. Disponible al instante con tu suscripción.'
  },
  {
    category: 'general',
    question: '¿Cuándo elegir Desarrollo a Medida?',
    answer: 'Recomendado si tienes procesos únicos que no se adaptan a soluciones estándar, necesitas integraciones complejas o quieres propiedad total del sistema. En Innomind desarrollamos tu plataforma 100% personalizada en un máximo de 3 meses.'
  },
  {
    category: 'plataforma',
    question: '¿Puedo empezar con Corē/Trak y luego migrar a medida?',
    answer: '¡Absolutamente! Muchos clientes comienzan con Corē o Trak para operar rápidamente y luego migran a un sistema totalmente personalizado cuando sus necesidades crecen. Facilitamos todo el proceso de transición sin pérdida de datos.'
  },
  {
    category: 'plataforma',
    question: '¿Cuánto tiempo toma implementar cada opción?',
    answer: 'Corē y Trak están listos al instante: te suscribes y ya puedes usarlos sin esperas ni configuraciones complejas. Un desarrollo a medida de Innomind toma un máximo de 3 meses, y está diseñado al 100% para las necesidades específicas de tu negocio.'
  },
  {
    category: 'plataforma',
    question: '¿Innomind se integra con otras herramientas que ya uso?',
    answer: 'Sí. Corē y Trak se integran nativamente con WhatsApp Business, servicios de facturación electrónica (CFDI) y más. Los desarrollos a medida pueden conectarse con cualquier sistema externo a través de API REST.'
  },
  {
    category: 'precios',
    question: '¿Cómo funciona el precio en cada modalidad?',
    answer: 'Corē y Trak: Mensualidad de $299. Desarrollo a Medida: El precio está en dependencia del sistema desarrollado y sus módulos. Ambas opciones tienen un excelente ROI.'
  },
  {
    category: 'precios',
    question: '¿Hay algún compromiso de permanencia?',
    answer: 'No. En Corē y Trak puedes cancelar tu suscripción en cualquier momento sin penalizaciones. En desarrollo a medida, una vez entregado el proyecto el código es 100% tuyo.'
  },
  {
    category: 'precios',
    question: '¿Ofrecen prueba gratuita?',
    answer: 'Sí, puedes solicitar una demo personalizada de Corē o Trak para conocer todas las funcionalidades antes de suscribirte. Contáctanos y un especialista te guiará.'
  },
  {
    category: 'soporte',
    question: '¿Qué tipo de soporte ofrecen?',
    answer: 'Ofrecemos soporte técnico por chat, email y videollamada. Las suscripciones de Corē y Trak incluyen soporte en horario extendido, y los desarrollos a medida incluyen soporte dedicado con SLA garantizado.'
  },
  {
    category: 'soporte',
    question: '¿Cómo reporto un problema técnico?',
    answer: 'Desde tu panel de Corē o Trak, accede a la sección "Soporte" en el menú lateral. Ahí puedes crear un ticket describiendo el problema, asignar prioridad y dar seguimiento a la resolución en tiempo real con nuestro equipo.'
  },
  {
    category: 'soporte',
    question: '¿Cuál es el tiempo de respuesta promedio?',
    answer: 'Nuestro tiempo de primera respuesta promedio es de 2 horas para prioridad normal y 30 minutos para tickets urgentes. El 95% de los problemas se resuelven en menos de 24 horas.'
  },
  {
    category: 'seguridad',
    question: '¿Mis datos están seguros en Innomind?',
    answer: 'Absolutamente. Utilizamos encriptación AES-256 en reposo y TLS 1.3 en tránsito. Nuestros servidores están en infraestructura certificada SOC 2 Tipo II con respaldos automáticos cada hora y retención de 30 días.'
  },
  {
    category: 'seguridad',
    question: '¿Dónde están alojados los servidores?',
    answer: 'Utilizamos infraestructura global en la nube con centros de datos en América del Norte. Para clientes con desarrollo a medida, podemos configurar la infraestructura en la región de su preferencia.'
  },
  {
    category: 'seguridad',
    question: '¿Puedo exportar mis datos en cualquier momento?',
    answer: 'Sí, siempre tienes acceso completo a tus datos. Puedes exportar toda tu información en formatos estándar (CSV, JSON, Excel) en cualquier momento desde el panel de administración.'
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const { openDemoModal } = useModal();

  const filteredFaqs = ALL_FAQS.filter(faq => {
    const matchesCategory = activeCategory === 'todos' || faq.category === activeCategory;
    const matchesSearch = !searchQuery || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="font-display bg-white dark:bg-slate-900 text-slate-900 dark:text-white antialiased selection:bg-blue-600 selection:text-white min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="relative pt-20 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white dark:from-slate-800/20 dark:to-slate-900 -z-10" />
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-3xl -z-10" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400 mb-6">
              <HelpCircle size={32} />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Preguntas Frecuentes
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
              Encuentra respuestas rápidas a las preguntas más comunes sobre Innomind, nuestros servicios y precios.
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Buscar en preguntas frecuentes..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none text-sm shadow-lg shadow-slate-200/50 dark:shadow-none"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setOpenIndex(null); }}
              />
            </div>
          </div>
        </section>

        {/* Categories + FAQs */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Category tabs */}
            <div className="flex gap-2 flex-wrap justify-center mb-10">
              <button
                onClick={() => { setActiveCategory('todos'); setOpenIndex(null); }}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeCategory === 'todos' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
              >
                Todos
              </button>
              {FAQ_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setOpenIndex(null); }}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeCategory === cat.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* FAQ items */}
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-16">
                <Search className="mx-auto text-slate-300 mb-4" size={48} />
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Sin resultados</h3>
                <p className="text-sm text-slate-500">No encontramos preguntas que coincidan con tu búsqueda.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFaqs.map((faq, index) => (
                  <div
                    key={index}
                    className={`border rounded-xl transition-all duration-300 ${openIndex === index ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 shadow-lg shadow-blue-500/5' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-slate-800'}`}
                  >
                    <button
                      className="flex items-center justify-between w-full px-6 py-5 text-left"
                      onClick={() => toggleFAQ(index)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${openIndex === index ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                          {FAQ_CATEGORIES.find(c => c.id === faq.category)?.label}
                        </span>
                        <span className={`text-base font-bold truncate ${openIndex === index ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                          {faq.question}
                        </span>
                      </div>
                      <span className={`ml-4 flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-blue-600' : 'text-slate-400'}`}>
                        {openIndex === index ? <Minus size={20} /> : <Plus size={20} />}
                      </span>
                    </button>

                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-48' : 'max-h-0'}`}>
                      <div className="px-6 pb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 border-t border-slate-100 dark:border-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <MessageCircle className="mx-auto text-blue-400 mb-4" size={32} />
                <h2 className="text-2xl font-bold text-white mb-3">¿No encontraste tu respuesta?</h2>
                <p className="text-slate-300 mb-8 max-w-lg mx-auto">
                  Nuestro equipo está listo para ayudarte. Contáctanos directamente o solicita una demo personalizada.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="/soporte" className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                    <LifeBuoy size={18} /> Contactar Soporte
                  </a>
                  <button onClick={() => openDemoModal('Desde FAQ')} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    Solicitar Demo <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}


import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0); // First one open by default

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const faqs = [
        {
            question: "¿Cuándo elegir Corē o Trak (Suscripción)?",
            answer: "Corē es nuestro ERP por suscripción y Trak es nuestro project tracker. Son ideales si buscas empezar de inmediato: te suscribes y ya tienes acceso. Sin implementaciones largas ni esperas. Perfecto para equipos que necesitan una solución robusta desde el día uno."
        },
        {
            question: "¿Cuándo elegir Desarrollo a Medida?",
            answer: "Recomendado si tienes procesos únicos que no se adaptan a soluciones estándar, necesitas integraciones complejas o quieres propiedad total del sistema. En Innomind desarrollamos tu plataforma 100% personalizada en un máximo de 3 meses."
        },
        {
            question: "¿Puedo empezar con Corē/Trak y luego migrar a medida?",
            answer: "¡Absolutamente! Muchos clientes comienzan con Corē o Trak para operar rápidamente y luego migran a un sistema totalmente personalizado cuando sus necesidades crecen. Facilitamos todo el proceso de transición sin pérdida de datos."
        },
        {
            question: "¿Qué incluyen los productos de Innomind?",
            answer: "Corē incluye CRM, facturación, inventario, reportes avanzados e inteligencia artificial. Trak ofrece gestión de proyectos, tableros Kanban, seguimiento de tareas y colaboración en equipo. Ambos incluyen soporte técnico y actualizaciones continuas. El desarrollo a medida incluye todo lo que tu operación necesite."
        },
        {
            question: "¿Cuánto tiempo toma implementar cada opción?",
            answer: "Corē y Trak están listos al instante: te suscribes y ya puedes usarlos sin esperas. Un desarrollo a medida de Innomind toma un máximo de 3 meses, y está diseñado al 100% para las necesidades específicas de tu negocio."
        },
        {
            question: "¿Cómo funciona el precio en cada modalidad?",
            answer: "Corē y Trak: Mensualidad de $299. Desarrollo a Medida: El precio depende del sistema desarrollado y sus módulos. Ambas opciones tienen un excelente ROI."
        }
    ];

    return (
        <section className="py-24 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 mb-4">
                        <HelpCircle size={24} />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl mb-4">
                        Preguntas Frecuentes
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Resolvemos las dudas más comunes sobre Corē, Trak y nuestros desarrollos a medida.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`border rounded-xl transition-all duration-300 ${openIndex === index ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-slate-800'}`}
                        >
                            <button
                                className="flex items-center justify-between w-full px-6 py-5 text-left"
                                onClick={() => toggleFAQ(index)}
                            >
                                <span className={`text-lg font-bold ${openIndex === index ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                                    {faq.question}
                                </span>
                                <span className={`ml-6 flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-blue-600' : 'text-slate-400'}`}>
                                    {openIndex === index ? <Minus size={20} /> : <Plus size={20} />}
                                </span>
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-48' : 'max-h-0'}`}
                            >
                                <div className="px-6 pb-6 text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}


import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0); // First one open by default

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const faqs = [
        {
            question: "¿Cuándo elegir la Plataforma SaaS?",
            answer: "Ideal si necesitas implementación rápida, tienes presupuesto mensual predecible y tus procesos se adaptan a workflows estándar. Perfecto para equipos de 5-100 personas que buscan empezar rápido."
        },
        {
            question: "¿Cuándo elegir Desarrollo a Medida?",
            answer: "Recomendado si tienes procesos únicos que no se adaptan a soluciones estándar, necesitas integraciones complejas o quieres propiedad total del sistema. Ideal para empresas con más de 50 usuarios o procesos muy específicos."
        },
        {
            question: "¿Puedo empezar con SaaS y luego migrar a medida?",
            answer: "¡Absolutamente! Muchos clientes comienzan con nuestra plataforma SaaS para validar rápidamente y luego migran a un ERP personalizado cuando sus necesidades crecen. Facilitamos todo el proceso de transición."
        },
        {
            question: "¿Qué incluyen ambas opciones?",
            answer: "Tanto la plataforma SaaS como el desarrollo a medida incluyen: CRM completo, gestión de proyectos, ERP, inteligencia artificial, reportes avanzados y soporte técnico. La diferencia está en la personalización y el modelo de pago."
        },
        {
            question: "¿Cuánto tiempo toma implementar cada opción?",
            answer: "La plataforma SaaS puede estar operativa en 7-30 días dependiendo de la complejidad. Un ERP a medida toma entre 3-6 meses, pero está diseñado exactamente para tus necesidades específicas."
        },
        {
            question: "¿Cómo funciona el precio en cada modalidad?",
            answer: "SaaS: Suscripción mensual por usuario, sin inversión inicial. A Medida: Inversión única en desarrollo + mantenimiento anual opcional. Ambas opciones tienen excelente ROI según el tamaño de tu operación."
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
                        SaaS vs A Medida: ¿Cuál elegir?
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Resolvemos las dudas más frecuentes para ayudarte a tomar la mejor decisión.
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

import React from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { useModal } from '../../../context/ModalContext';
import { Bot, CheckCircle2 } from 'lucide-react';

export default function ChatbotsPage() {
  const { openFreeTrial, openDemoModal } = useModal();

  return (
    <div className="font-display bg-white dark:bg-slate-900 text-slate-900 dark:text-white antialiased min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-28 overflow-hidden text-center px-4">
          <div className="absolute inset-0 bg-emerald-50/50 dark:bg-slate-800/20 -z-10" />
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-emerald-100/40 dark:bg-emerald-900/10 rounded-full blur-3xl -z-10" />

          <div className="max-w-3xl mx-auto">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold mb-6">
                <span className="flex h-2 w-2 rounded-full bg-emerald-600"></span>
                Atención 24/7 Automatizada
             </div>
             
             <div className="flex justify-center mb-8">
                <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-200 dark:border-emerald-700">
                    <Bot className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                </div>
             </div>

             <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
                Chatbots con IA
             </h1>
             
             <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                Automatiza tu atención al cliente en WhatsApp, Redes Sociales y Sitio Web. Nuestros Chatbots entrenados con Inteligencia Artificial pueden responder preguntas frecuentes, agendar citas y conectar con tus sistemas internos sin intervención humana.
             </p>
             
             <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
               <button
                 onClick={() => openDemoModal('Chatbots IA')}
                 className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all"
               >
                 Solicitar una Demo
               </button>
             </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

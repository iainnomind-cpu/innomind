import React from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { useModal } from '../../../context/ModalContext';
import { Send, CheckCircle2 } from 'lucide-react';

export default function MensajeriaPage() {
  const { openFreeTrial, openDemoModal } = useModal();

  return (
    <div className="font-display bg-white dark:bg-slate-900 text-slate-900 dark:text-white antialiased min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-28 overflow-hidden text-center px-4">
          <div className="absolute inset-0 bg-green-50/50 dark:bg-slate-800/20 -z-10" />
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-green-100/40 dark:bg-green-900/10 rounded-full blur-3xl -z-10" />

          <div className="max-w-3xl mx-auto">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-semibold mb-6">
                <span className="flex h-2 w-2 rounded-full bg-green-600"></span>
                Alcance Masivo Personalizado
             </div>
             
             <div className="flex justify-center mb-8">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/50 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20 border border-green-200 dark:border-green-700">
                    <Send className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
             </div>

             <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
                Mensajería Masiva
             </h1>
             
             <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                Envía promociones, notificaciones y encuestas a toda tu base de datos mediante WhatsApp y SMS de forma legal y segura. Con nuestra API oficial y segmentación avanzada, asegura que tu mensaje llegue al cliente correcto en el momento exacto.
             </p>
             
             <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
               <button
                 onClick={() => openDemoModal('Mensajería Masiva')}
                 className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all"
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

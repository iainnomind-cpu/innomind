
import React, { useState } from 'react';
import {
  LifeBuoy, Phone, Mail, Clock, Send, MessageCircle,
  CheckCircle2, ArrowRight, HelpCircle, Bug, Lightbulb,
  Loader2, MapPin
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useModal } from '../../context/ModalContext';
import { FINAPP_SUPABASE_URL, FINAPP_ANON_KEY } from '@/modules/support/supportApi';

export default function SoportePage() {
  const { openDemoModal } = useModal();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'duda',
    subject: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = formData.name.trim() && formData.email.trim() && formData.subject.trim() && formData.description.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${FINAPP_SUPABASE_URL}/rest/v1/support_tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': FINAPP_ANON_KEY,
          'Authorization': `Bearer ${FINAPP_ANON_KEY}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          subject: formData.subject,
          description: formData.description,
          category: formData.category,
          priority: 'media',
          status: 'abierto',
          user_email: formData.email,
          user_name: formData.name,
          user_phone: formData.phone,
          company_name: '',
        }),
      });

      if (!res.ok) throw new Error('Error al enviar');

      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', category: 'duda', subject: '', description: '' });
    } catch (err) {
      setError('Hubo un error al enviar tu solicitud. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="font-display bg-white dark:bg-slate-900 text-slate-900 dark:text-white antialiased selection:bg-blue-600 selection:text-white min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="relative pt-20 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-green-50/50 to-white dark:from-slate-800/20 dark:to-slate-900 -z-10" />
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-green-100/30 dark:bg-green-900/10 rounded-full blur-3xl -z-10 -translate-y-1/2 -translate-x-1/3" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl text-green-600 dark:text-green-400 mb-6">
              <LifeBuoy size={32} />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Centro de Soporte
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              ¿Necesitas ayuda? Estamos aquí para ti. Envíanos un mensaje y nuestro equipo te responderá lo antes posible.
            </p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="pb-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Email</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Respuesta en menos de 24 horas</p>
                <a href="mailto:soporte@innomind.com" className="text-sm font-bold text-blue-600 hover:text-blue-700">
                  soporte@innomind.com
                </a>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Phone className="text-green-600 dark:text-green-400" size={24} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Te Llamamos</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Déjanos tu número abajo</p>
                <span className="text-sm font-bold text-green-600">
                  Nosotros te contactamos
                </span>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Horario de Atención</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Tiempo de respuesta promedio</p>
                <span className="text-sm font-bold text-purple-600">~2 horas (horario laboral)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-12 bg-slate-50 dark:bg-slate-900/50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Envíanos un Mensaje</h2>
              <p className="text-slate-600 dark:text-slate-400">Describe tu situación y te ayudaremos lo antes posible.</p>
            </div>

            {success ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-green-200 dark:border-green-800 p-12 text-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="text-green-600 dark:text-green-400" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">¡Mensaje Enviado!</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                  Hemos recibido tu solicitud de soporte. Nuestro equipo la revisará y te contactará pronto.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none divide-y divide-slate-100 dark:divide-slate-700">
                {/* Category */}
                <div className="p-6">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">¿Cómo podemos ayudarte?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'bug', label: 'Reportar Error', icon: Bug, color: 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400' },
                      { id: 'duda', label: 'Tengo una Duda', icon: HelpCircle, color: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
                      { id: 'mejora', label: 'Sugerencia', icon: Lightbulb, color: 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
                      { id: 'otro', label: 'Otro', icon: MessageCircle, color: 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400' },
                    ].map(cat => {
                      const Icon = cat.icon;
                      const selected = formData.category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                          className={`p-3 rounded-xl border-2 text-center transition-all ${selected ? `${cat.color} ring-2 ring-current/20` : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500'}`}
                        >
                          <Icon size={20} className="mx-auto mb-1" />
                          <div className="text-xs font-semibold">{cat.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Contact info */}
                <div className="p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nombre Completo *</label>
                    <input
                      type="text" placeholder="Ej. Juan Pérez" required
                      value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email *</label>
                    <input
                      type="email" placeholder="tu@email.com" required
                      value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Teléfono (Opcional)</label>
                    <input
                      type="tel" placeholder="Ej. 55 1234 5678"
                      value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="p-6">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Asunto *</label>
                  <input
                    type="text" placeholder="Ej: No puedo acceder al módulo de inventario" required
                    value={formData.subject} onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>

                {/* Description */}
                <div className="p-6">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Descripción Detallada *</label>
                  <textarea
                    placeholder="Describe tu problema o consulta con el mayor detalle posible..." required rows={5}
                    value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                  />
                </div>

                {/* Submit */}
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
                  {error && <p className="text-sm text-red-600 font-medium mb-3">{error}</p>}
                  <button
                    type="submit" disabled={!isValid || submitting}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-white transition-all ${isValid && !submitting ? 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20' : 'bg-gray-300 cursor-not-allowed'}`}
                  >
                    {submitting ? <><Loader2 size={18} className="animate-spin" /> Enviando...</> : <><Send size={18} /> Enviar Solicitud de Soporte</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Quick links */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-2 gap-6">
              <a href="/faq" className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:border-blue-300 hover:shadow-lg transition-all flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <HelpCircle size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">Preguntas Frecuentes</h3>
                  <p className="text-sm text-slate-500">Encuentra respuestas rápidas</p>
                </div>
                <ArrowRight className="text-slate-300 group-hover:text-blue-500 transition-colors" size={20} />
              </a>
              <button onClick={() => openDemoModal('Desde Soporte')} className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:border-green-300 hover:shadow-lg transition-all flex items-center gap-4 text-left w-full">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                  <MessageCircle size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-green-600 transition-colors">Solicitar una Demo</h3>
                  <p className="text-sm text-slate-500">Agenda una demostración personalizada</p>
                </div>
                <ArrowRight className="text-slate-300 group-hover:text-green-500 transition-colors" size={20} />
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

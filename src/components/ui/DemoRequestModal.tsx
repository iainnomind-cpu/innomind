import { useState } from 'react';
import { X, ArrowRight, Check } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import { supabase } from '@/lib/supabase';

export default function DemoRequestModal() {
    const { isDemoModalOpen, closeDemoModal, serviceOfInterest } = useModal();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    const [fullName, setFullName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [phone, setPhone] = useState('');
    const [industry, setIndustry] = useState('');

    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

    if (!isDemoModalOpen) return null;

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const isFormValid = fullName.trim() !== '' && companyName.trim() !== '' && phone.trim() !== '' && industry.trim() !== '';

    const handleSubmit = async () => {
        if (!isFormValid) {
            setTouched({ fullName: true, companyName: true, phone: true, industry: true });
            return;
        }

        setIsSubmitting(true);
        setApiError(null);

        try {
            // Log to console for debugging
            console.log("Submitting Demo Request to finapp CRM:", { fullName, companyName, phone, industry, serviceOfInterest });
            
            // Enviar datos al CRM (finapp) usando su URL y Anon Key
            const finappSupabaseUrl = 'https://mndkjjxtuqizpvkjnnde.supabase.co';
            const finappAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uZGtqanh0dXFpenB2a2pubmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NTc3MzAsImV4cCI6MjA5MjEzMzczMH0.nKU1LC94eBYffLcvmRDtc_4jk_7NMkdDfbRtDLKzD9E';
            
            const response = await fetch(`${finappSupabaseUrl}/rest/v1/crm_leads`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': finappAnonKey,
                    'Authorization': `Bearer ${finappAnonKey}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    full_name: fullName,
                    company_name: companyName,
                    phone: phone,
                    industry: industry,
                    service_of_interest: serviceOfInterest || 'General',
                    status: 'nuevo',
                    created_at: new Date().toISOString()
                })
            });

            if (!response.ok) {
                console.warn("Could not save to crm_leads table:", await response.text());
            }

            setSuccessMessage("¡Gracias! Hemos recibido tus datos y te contactaremos pronto para agendar tu demo.");
            
            setTimeout(() => {
                closeDemoModal();
                setSuccessMessage(null);
                setFullName('');
                setCompanyName('');
                setPhone('');
                setIndustry('');
                setTouched({});
            }, 3000);
        } catch (error: any) {
            console.error("Demo request error:", error);
            setApiError("Hubo un error al enviar tu solicitud. Intenta nuevamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={closeDemoModal}
            ></div>

            {/* Modal Container */}
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col animate-in fade-in zoom-in-95 duration-200 transition-all duration-300 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Solicitar Demo</h2>
                    <button
                        onClick={closeDemoModal}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-6 space-y-4 overflow-y-auto flex-1">
                    {successMessage ? (
                        <div className="text-center py-8 space-y-4 animate-in fade-in zoom-in-95">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check size={32} strokeWidth={3} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">¡Solicitud Enviada!</h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                {successMessage}
                            </p>
                        </div>
                    ) : (
                        <>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                                Déjanos tus datos y un especialista se pondrá en contacto contigo para mostrarte cómo Innomind puede transformar tu negocio.
                            </p>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                                        Nombre Completo <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej. Juan Pérez"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        onBlur={() => handleBlur('fullName')}
                                        className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all ${touched.fullName && !fullName.trim()
                                            ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                                            : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                            }`}
                                    />
                                    {touched.fullName && !fullName.trim() && <p className="text-xs text-red-500 font-medium">El nombre es obligatorio</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                                        Nombre del Negocio <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej. Mi Empresa S.A."
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        onBlur={() => handleBlur('companyName')}
                                        className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all ${touched.companyName && !companyName.trim()
                                            ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                                            : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                            }`}
                                    />
                                    {touched.companyName && !companyName.trim() && <p className="text-xs text-red-500 font-medium">El nombre del negocio es obligatorio</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                                        Teléfono <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="Ej. +52 55 1234 5678"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        onBlur={() => handleBlur('phone')}
                                        className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all ${touched.phone && !phone.trim()
                                            ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                                            : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                            }`}
                                    />
                                    {touched.phone && !phone.trim() && <p className="text-xs text-red-500 font-medium">El teléfono es obligatorio</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                                        Giro del Negocio <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej. Retail, Manufactura, Servicios, etc."
                                        value={industry}
                                        onChange={(e) => setIndustry(e.target.value)}
                                        onBlur={() => handleBlur('industry')}
                                        className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all ${touched.industry && !industry.trim()
                                            ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                                            : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                            }`}
                                    />
                                    {touched.industry && !industry.trim() && <p className="text-xs text-red-500 font-medium">El giro del negocio es obligatorio</p>}
                                </div>
                                
                                {apiError && (
                                    <p className="text-center text-xs font-bold text-red-500 mt-2">
                                        {apiError}
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                {!successMessage && (
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                        <button
                            className={`w-full bg-blue-600 text-white font-bold py-3.5 px-6 rounded-lg transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 ${isSubmitting || !isFormValid
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-blue-700 hover:scale-[1.02]'
                                }`}
                            disabled={isSubmitting || !isFormValid}
                            onClick={handleSubmit}
                        >
                            {isSubmitting ? 'Enviando...' : 'Solicitar Demo'}
                            <ArrowRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

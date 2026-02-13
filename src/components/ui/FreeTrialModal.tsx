import { useState, useEffect, useMemo } from 'react';
import { X, ArrowRight, Check, ShieldCheck, Lock, Star } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import { SmartSuggestion } from './SmartSuggestion';
import { SmartTriggerToast } from './SmartTriggerToast';
import { AIRecommendationWizard } from './AIRecommendationWizard';

export default function FreeTrialModal() {
    const { isFreeTrialOpen, closeFreeTrial } = useModal();
    const [step, setStep] = useState(1);

    const [selectedMainModule, setSelectedMainModule] = useState<'crm-erp' | 'project-tracker' | null>(null);
    const [selectedSubModules, setSelectedSubModules] = useState<string[]>([]);

    // Step 1 State
    const [companySize, setCompanySize] = useState('1-10 empleados');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [companyName, setCompanyName] = useState('');

    // Step 3 State
    const [workspaceName, setWorkspaceName] = useState('');
    const [password, setPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [testimonialIndex, setTestimonialIndex] = useState(0);

    // Step 1 Validation Logic
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const step1Errors = useMemo(() => {
        const errors: { fullName?: string, email?: string, companyName?: string } = {};
        if (!fullName.trim()) errors.fullName = "El nombre es obligatorio";
        if (!email.trim()) errors.email = "El email es obligatorio";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Email inválido";
        if (!companyName.trim()) errors.companyName = "El nombre de la empresa es obligatorio";
        return errors;
    }, [fullName, email, companyName]);

    const isStep1Valid = Object.keys(step1Errors).length === 0;

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    // Logic: Workspace Preview
    const sanitizedWorkspace = useMemo(() => {
        return workspaceName
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
    }, [workspaceName]);

    // Logic: Testimonial Rotation
    const testimonials = [
        { text: "Configuré mi CRM en 4 minutos. Increíblemente intuitivo.", author: "Roberto M.", role: "CEO, PyME México" },
        { text: "Ahorramos 15 horas semanales en gestión administrativa.", author: "Ana G.", role: "Dir. Ops, TechFlow" },
        { text: "La mejor inversión para escalar nuestro equipo de ventas.", author: "Carlos D.", role: "Gerente Comercial" }
    ];

    useEffect(() => {
        if (step === 3) {
            const interval = setInterval(() => {
                setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
            }, 4000);
            return () => clearInterval(interval);
        }
    }, [step]);

    // Logic: Value Calculator
    const estimatedSavings = useMemo(() => {
        switch (companySize) {
            case '1-10 empleados': return '$3,000';
            case '11-50 empleados': return '$8,000';
            case '51-200 empleados': return '$20,000';
            case '200+ empleados': return '$50,000';
            default: return '$3,000';
        }
    }, [companySize]);

    // Logic: Validation
    const isStep3Valid = useMemo(() => {
        return sanitizedWorkspace.length > 3 && password.length >= 6 && termsAccepted;
    }, [sanitizedWorkspace, password, termsAccepted]);

    const toggleSubModule = (module: string) => {
        if (selectedSubModules.includes(module)) {
            setSelectedSubModules(selectedSubModules.filter(m => m !== module));
        } else {
            setSelectedSubModules([...selectedSubModules, module]);
        }
    };

    if (!isFreeTrialOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={closeFreeTrial}
            ></div>

            {/* Modal Container */}
            <div className={`relative w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col h-[90vh] transition-all duration-300 ${step === 3 ? 'max-w-4xl' : 'max-w-2xl'}`}>

                {/* Header & Progress */}
                <div className="px-6 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            {/* Logo Icon Mini */}
                            <div className="size-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-md">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="7" height="7" x="3" y="3" rx="1" />
                                    <rect width="7" height="7" x="14" y="3" rx="1" />
                                    <rect width="7" height="7" x="14" y="14" rx="1" />
                                    <rect width="7" height="7" x="3" y="14" rx="1" />
                                </svg>
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white">Innomind</span>
                        </div>
                        <button
                            onClick={closeFreeTrial}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 transition-all duration-500 ease-out"
                            style={{ width: `${(step / 3) * 100}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <span>Paso {step} de 3 {step === 3 && <span className="text-slate-400 font-normal">· Faltan menos de 1 minuto</span>}</span>
                        <span>
                            {step === 1 && "Información de Cuenta"}
                            {step === 2 && "Selección de Desafíos"}
                            {step === 3 && "Configura tu cuenta"}
                        </span>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-3 md:px-8 md:py-4 overflow-y-auto flex-grow">
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Comienza tu Prueba Gratuita</h2>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Accede a todas las funciones premium por 14 días.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <InputGroup
                                    label="Nombre Completo"
                                    placeholder="Ej. Juan Pérez"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    onBlur={() => handleBlur('fullName')}
                                    error={touched.fullName ? step1Errors.fullName : undefined}
                                    required
                                />
                                <InputGroup
                                    label="Email Corporativo"
                                    placeholder="nombre@empresa.com"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onBlur={() => handleBlur('email')}
                                    error={touched.email ? step1Errors.email : undefined}
                                    required
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <InputGroup
                                        label="Teléfono (Opcional)"
                                        placeholder="+52 ..."
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                                            Tamaño de Empresa
                                        </label>
                                        <select
                                            value={companySize}
                                            onChange={(e) => setCompanySize(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option>1-10 empleados</option>
                                            <option>11-50 empleados</option>
                                            <option>51-200 empleados</option>
                                            <option>200+ empleados</option>
                                        </select>
                                    </div>
                                </div>
                                <InputGroup
                                    label="Nombre de la Empresa"
                                    placeholder="Ej. Tech Solutions"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    onBlur={() => handleBlur('companyName')}
                                    error={touched.companyName ? step1Errors.companyName : undefined}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">¿Qué desafíos quieres resolver primero?</h2>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Selecciona la opción que mejor describa tu necesidad principal.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Card A: CRM-ERP */}
                                <div
                                    className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer group ${selectedMainModule === 'crm-erp' ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-400'}`}
                                    onClick={() => setSelectedMainModule('crm-erp')}
                                >
                                    <div className="absolute top-4 right-4">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedMainModule === 'crm-erp' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 dark:border-slate-600 text-transparent'}`}>
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">CRM-ERP UNIFICADO</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 h-10">Automatiza ventas, finanzas y operaciones en un solo lugar</p>

                                    <ul className="space-y-2 mb-6">
                                        {['Gestión Comercial', 'Facturación y Flujo de Caja', 'Inventario y Compras', 'Recursos Humanos'].map((item, i) => (
                                            <li key={i} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="text-xs font-medium text-slate-500 italic mt-auto border-t border-slate-100 dark:border-slate-700 pt-3">
                                        Ideal para: Pymes que buscan escalar y profesionalizar
                                    </p>
                                </div>

                                {/* Card B: Project Tracker */}
                                <div
                                    className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer group ${selectedMainModule === 'project-tracker' ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-purple-400'}`}
                                    onClick={() => setSelectedMainModule('project-tracker')}
                                >
                                    <div className="absolute top-4 right-4">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedMainModule === 'project-tracker' ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-300 dark:border-slate-600 text-transparent'}`}>
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">PROJECT TRACKER</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 h-10">Gestiona proyectos y equipos con metodologías ágiles</p>

                                    <ul className="space-y-2 mb-6">
                                        {['Tableros Kanban / Gantt', 'Control de Tiempos', 'Gestión de Recursos', 'Colaboración en Equipo'].map((item, i) => (
                                            <li key={i} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="text-xs font-medium text-slate-500 italic mt-auto border-t border-slate-100 dark:border-slate-700 pt-3">
                                        Ideal para: Agencias, estudios y equipos de desarrollo
                                    </p>
                                </div>
                            </div>

                            {/* Conditional Section for CRM-ERP */}
                            {selectedMainModule === 'crm-erp' && (
                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Construye tu Sistema a Medida</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">¿Qué áreas de tu negocio quieres automatizar? Selecciona los módulos que necesitas.</p>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4">
                                        <ModuleSelectionCard
                                            title="Gestión Comercial"
                                            items={['Leads y Prospección', 'Pipeline de Ventas', 'Automatización de Marketing']}
                                            selected={selectedSubModules}
                                            toggle={toggleSubModule}
                                        />
                                        <ModuleSelectionCard
                                            title="Gestión Financiera"
                                            items={['Flujo de Caja Predictivo', 'Gestión de Inventario', 'Gestión de Compras']}
                                            selected={selectedSubModules}
                                            toggle={toggleSubModule}
                                        />
                                        <ModuleSelectionCard
                                            title="Gestión de Talento"
                                            items={['Recursos Humanos (HRM)']}
                                            selected={selectedSubModules}
                                            toggle={toggleSubModule}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* AI Recommendation Wizard */}
                            {/* AI Recommendation Wizard */}
                            {selectedMainModule === 'crm-erp' && (
                                <AIRecommendationWizard
                                    onApplyRecommendation={(recommendedModules) => {
                                        setSelectedMainModule('crm-erp');
                                        const combined = Array.from(new Set([...selectedSubModules, ...recommendedModules]));
                                        setSelectedSubModules(combined);

                                        // Success Feedback & Scroll
                                        setSuccessMessage("Paquete aplicado correctamente");
                                        setTimeout(() => setSuccessMessage(null), 3000); // Auto hide after 3s

                                        // Smooth scroll to bottom actions
                                        setTimeout(() => {
                                            document.getElementById('step-actions')?.scrollIntoView({ behavior: 'smooth' });
                                        }, 100);
                                    }}
                                    onCancel={() => { }}
                                />
                            )}

                            {/* Smart Suggestion */}
                            <SmartSuggestion
                                selectedModules={selectedSubModules}
                                onAddModule={(module) => {
                                    if (!selectedSubModules.includes(module)) {
                                        toggleSubModule(module);
                                    }
                                }}
                            />

                            {/* Delayed Smart Trigger Toast */}
                            <SmartTriggerToast
                                selectedModules={selectedSubModules}
                                onActivateModule={(module) => {
                                    if (!selectedSubModules.includes(module)) {
                                        toggleSubModule(module);
                                    }
                                }}
                            />
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-in slide-in-from-right-4 duration-300 grid lg:grid-cols-2 gap-8 h-full">
                            {/* Left Column: Form */}
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Configura tu cuenta</h2>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Último paso para comenzar tu transformación digital.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                                            Nombre del espacio de trabajo
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="mi-empresa"
                                            value={workspaceName}
                                            onChange={(e) => setWorkspaceName(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        />
                                        <p className="text-xs text-slate-500 font-medium">
                                            {sanitizedWorkspace || 'mi-empresa'}.innomind.com
                                        </p>
                                    </div>

                                    <InputGroup
                                        label="Crear contraseña"
                                        placeholder="••••••••"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />

                                    <div className="pt-2">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={termsAccepted}
                                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                                Acepto los <span className="text-blue-600 underline decoration-blue-600/30">términos y condiciones</span>
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Conversion Elements */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-100 dark:border-slate-800 flex flex-col justify-center space-y-6">
                                {/* Social Proof */}
                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                                {String.fromCharCode(64 + i)}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        <span className="font-bold text-slate-900 dark:text-white">847 empresas</span> iniciaron su transformación este mes
                                    </p>
                                </div>

                                {/* Testimonial */}
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-right-2 duration-500" key={testimonialIndex}>
                                    <div className="flex gap-1 mb-2">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 italic mb-3">
                                        "{testimonials[testimonialIndex].text}"
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                            {testimonials[testimonialIndex].author[0]}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white">{testimonials[testimonialIndex].author}</p>
                                            <p className="text-[10px] text-slate-500">{testimonials[testimonialIndex].role}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Security Badge */}
                                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/50 w-fit">
                                    <Lock size={14} className="text-green-600 dark:text-green-400" />
                                    <span className="text-xs font-bold text-green-700 dark:text-green-400">Cumplimiento SOC 2 y GDPR</span>
                                </div>

                                {/* Value Calculator Teaser */}
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                    <ShieldCheck size={16} className="text-blue-500" />
                                    <p>Empresas como la tuya ahorran <span className="font-bold text-slate-900 dark:text-white">{estimatedSavings}/mes</span> con Innomind</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div id="step-actions" className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 shrink-0 relative">
                    {successMessage && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-green-600 text-white text-sm font-bold py-2 px-4 rounded-full shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in zoom-in-95">
                            <Check size={16} strokeWidth={3} />
                            {successMessage}
                        </div>
                    )}
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-3">
                            {step > 1 && (
                                <button
                                    className="px-6 py-3.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    onClick={() => setStep(step - 1)}
                                >
                                    Atrás
                                </button>
                            )}
                            <button
                                className={`flex-1 bg-blue-600 text-white font-bold py-3.5 px-6 rounded-lg transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 ${(step === 1 && !isStep1Valid) || (step === 3 && !isStep3Valid)
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-blue-700 hover:scale-[1.02]'
                                    }`}
                                onClick={() => {
                                    if (step === 1) {
                                        if (isStep1Valid) setStep(2);
                                        else setTouched({ fullName: true, email: true, companyName: true });
                                    }
                                    else if (step < 3) setStep(step + 1);
                                    else if (isStep3Valid) closeFreeTrial();
                                }}
                            >
                                {step === 3 ? 'Activar mi Transformación Digital' : 'Continuar al Siguiente Paso'}
                                <ArrowRight size={18} />
                            </button>
                        </div>

                        <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
                            <Check size={12} className="text-green-500" strokeWidth={3} />
                            Sin tarjeta de crédito · Cancela cuando quieras
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InputGroup({ label, placeholder, type = 'text', value, onChange, error, required, onBlur }: { label: string, placeholder: string, type?: string, value?: string, onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void, error?: string, required?: boolean, onBlur?: () => void }) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all ${error
                    ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    }`}
            />
            {error && <p className="text-xs text-red-500 font-medium animate-in slide-in-from-top-1">{error}</p>}
        </div>
    );
}

function ModuleSelectionCard({ title, items, selected, toggle }: { title: string, items: string[], selected: string[], toggle: (m: string) => void }) {
    return (
        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase mb-3 tracking-wide">{title}</h4>
            <div className="space-y-2">
                {items.map((item, i) => {
                    const isSelected = selected.includes(item);
                    return (
                        <div
                            key={i}
                            className="flex items-start gap-2 cursor-pointer group"
                            onClick={() => toggle(item)}
                        >
                            <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-600 group-hover:border-blue-500'}`}>
                                {isSelected && <Check size={10} strokeWidth={4} />}
                            </div>
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{item}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

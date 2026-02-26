import React, { useState, useEffect } from 'react';
import { X, Building2, User, Phone, Mail, Layout, MapPin, Briefcase, Globe, AlertCircle, CheckCircle2, ChevronRight, ChevronLeft, CalendarClock, MessageSquare } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { useUsers } from '@/context/UserContext';
import { ProspectStatus, Platform, Prospect } from '@/types';

interface ProspectFormProps {
    onClose: () => void;
    onSuccess?: () => void;
}

export default function ProspectForm({ onClose, onSuccess }: ProspectFormProps) {
    const { addProspect } = useCRM();
    const { users, currentUser } = useUsers();

    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState<Partial<Prospect>>({
        nombre: '',
        empresa: '',
        cargo: '',
        telefono: '',
        telefonoSecundario: '',
        correo: '',
        origen: '',
        servicioInteres: '',
        industria: '',
        tamanoEmpresa: '',
        nivelInteres: 'Medio',
        direccion: '',
        notasInternas: '',
        responsable: '',
        estado: 'Nuevo',
        plataforma: 'WhatsApp',
        valorEstimado: 0,
        fechaProximoSeguimiento: new Date()
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (currentUser && !formData.responsable) {
            setFormData(prev => ({ ...prev, responsable: currentUser.id }));
        }
    }, [currentUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const steps = [
        { id: 1, title: 'Contacto y Empresa', icon: User, description: 'Datos clave' },
        { id: 2, title: 'Interés Comercial', icon: Briefcase, description: 'Servicios de interés' },
        { id: 3, title: 'Asignación', icon: Layout, description: 'Seguimiento' }
    ];

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (!formData.nombre?.trim()) newErrors.nombre = 'Nombre requerido';
            if (!formData.empresa?.trim()) newErrors.empresa = 'Empresa requerida';
            if (!formData.cargo?.trim()) newErrors.cargo = 'Cargo requerido';

            if (!formData.telefono?.trim()) {
                newErrors.telefono = 'Teléfono requerido';
            } else if (!/^[+]?[\d\s()-]+$/.test(formData.telefono)) {
                newErrors.telefono = 'Formato inválido';
            }

            if (!formData.correo?.trim()) {
                newErrors.correo = 'Correo requerido';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
                newErrors.correo = 'Correo inválido';
            }
        }

        if (step === 2) {
            if (!formData.origen) newErrors.origen = 'Origen requerido';
            if (!formData.servicioInteres?.trim()) newErrors.servicioInteres = 'Servicio requerido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (currentStep !== 3) {
            handleNext();
            return;
        }

        if (!validateStep(3)) return;

        setIsSubmitting(true);
        try {
            const newProspect: Prospect = {
                id: Math.random().toString(36).substr(2, 9),
                nombre: formData.nombre || '',
                telefono: formData.telefono || '',
                correo: formData.correo || '',
                servicioInteres: formData.servicioInteres || '',
                plataforma: formData.plataforma as Platform || 'WhatsApp',
                estado: formData.estado as ProspectStatus || 'Nuevo',
                responsable: formData.responsable || '1',
                fechaContacto: new Date(),
                empresa: formData.empresa,
                cargo: formData.cargo,
                telefonoSecundario: formData.telefonoSecundario,
                origen: formData.origen,
                industria: formData.industria,
                tamanoEmpresa: formData.tamanoEmpresa,
                nivelInteres: formData.nivelInteres as 'Bajo' | 'Medio' | 'Alto',
                valorEstimado: Number(formData.valorEstimado) || 0,
                direccion: formData.direccion,
                notasInternas: formData.notasInternas,
                fechaProximoSeguimiento: formData.fechaProximoSeguimiento ? new Date(formData.fechaProximoSeguimiento) : undefined,
                seguimientos: [],
                cotizaciones: [],
                tareas: []
            };

            await addProspect(newProspect);
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Error creating prospect:', error);
            setErrors({ submit: 'Error al guardar. Intente nuevamente.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden flex-shrink-0 animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <User className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Nuevo Prospecto</h2>
                            <p className="text-sm text-gray-500 font-medium">Capture un nuevo lead empresarial</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

                    {/* Sidebar / Stepper */}
                    <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-6 flex-shrink-0">
                        <nav aria-label="Progress">
                            <ol role="list" className="space-y-6">
                                {steps.map((step, stepIdx) => (
                                    <li key={step.name || step.id}>
                                        <div className={`group flex items-start ${currentStep > step.id ? 'opacity-100' : currentStep === step.id ? 'opacity-100' : 'opacity-50'}`}>
                                            <div className="flex-shrink-0 relative flex items-center justify-center">
                                                <span className={`h-10 w-10 flex items-center justify-center rounded-xl border-2 transition-colors ${currentStep > step.id ? 'bg-blue-600 border-blue-600' :
                                                    currentStep === step.id ? 'bg-white border-blue-600' : 'bg-white border-gray-300'
                                                    }`}>
                                                    {currentStep > step.id ? (
                                                        <CheckCircle2 className="text-white" size={20} />
                                                    ) : (
                                                        <step.icon className={currentStep === step.id ? 'text-blue-600' : 'text-gray-400'} size={20} />
                                                    )}
                                                </span>
                                            </div>
                                            <div className="ml-4 flex flex-col">
                                                <span className={`text-sm font-bold tracking-wide uppercase ${currentStep === step.id ? 'text-blue-600' : 'text-gray-700'}`}>
                                                    Paso {step.id}
                                                </span>
                                                <span className="text-sm font-medium text-gray-500">{step.title}</span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </nav>

                        {/* Overall Progress */}
                        <div className="mt-10 hidden md:block">
                            <div className="text-xs font-semibold text-gray-500 flex justify-between mb-2">
                                <span>Progreso</span>
                                <span>{Math.round((currentStep / steps.length) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(currentStep / steps.length) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white custom-scrollbar">
                        <form id="prospectForm" onSubmit={handleSubmit} className="h-full">

                            {/* ERROR ALERT */}
                            {errors.submit && (
                                <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-center gap-3">
                                    <AlertCircle size={20} />
                                    <p className="text-sm font-medium">{errors.submit}</p>
                                </div>
                            )}

                            {/* STEP 1 */}
                            {currentStep === 1 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                    <div className="mb-8 block md:hidden">
                                        <h3 className="text-lg font-bold text-gray-900">{steps[0].title}</h3>
                                        <p className="text-gray-500 text-sm">{steps[0].description}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 line-clamp-1">Nombre Completo <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <User className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    name="nombre"
                                                    value={formData.nombre}
                                                    onChange={handleChange}
                                                    className={`block w-full pl-10 pr-3 py-2.5 bg-gray-50 border ${errors.nombre ? 'border-red-300 focus:ring-red-200 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:bg-white focus:ring-blue-100 focus:border-blue-500'} rounded-xl text-sm transition-all focus:ring-4 outline-none`}
                                                    placeholder="Ej. María Antonia Gómez"
                                                />
                                            </div>
                                            {errors.nombre && <p className="text-red-500 text-xs mt-1 font-medium">{errors.nombre}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Teléfono Principal <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Phone className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    name="telefono"
                                                    value={formData.telefono}
                                                    onChange={handleChange}
                                                    className={`block w-full pl-10 pr-3 py-2.5 bg-gray-50 border ${errors.telefono ? 'border-red-300 focus:ring-red-200 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:bg-white focus:ring-blue-100 focus:border-blue-500'} rounded-xl text-sm transition-all focus:ring-4 outline-none`}
                                                    placeholder="+52 55 1234 5678"
                                                />
                                            </div>
                                            {errors.telefono && <p className="text-red-500 text-xs mt-1 font-medium">{errors.telefono}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Teléfono Secundario</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Phone className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    name="telefonoSecundario"
                                                    value={formData.telefonoSecundario}
                                                    onChange={handleChange}
                                                    className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-blue-100 focus:border-blue-500 rounded-xl text-sm transition-all focus:ring-4 outline-none"
                                                    placeholder="Opcional"
                                                />
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Correo Electrónico <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Mail className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    name="correo"
                                                    value={formData.correo}
                                                    onChange={handleChange}
                                                    className={`block w-full pl-10 pr-3 py-2.5 bg-gray-50 border ${errors.correo ? 'border-red-300 focus:ring-red-200 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:bg-white focus:ring-blue-100 focus:border-blue-500'} rounded-xl text-sm transition-all focus:ring-4 outline-none`}
                                                    placeholder="contacto@empresa.com"
                                                />
                                            </div>
                                            {errors.correo && <p className="text-red-500 text-xs mt-1 font-medium">{errors.correo}</p>}
                                        </div>

                                        <div className="pt-4 md:col-span-2 border-t border-gray-100 mt-2">
                                            <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><Building2 size={16} className="text-gray-400" /> Información de la Empresa</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Empresa <span className="text-red-500">*</span></label>
                                                    <input
                                                        name="empresa"
                                                        value={formData.empresa}
                                                        onChange={handleChange}
                                                        className={`block w-full px-4 py-2.5 bg-gray-50 border ${errors.empresa ? 'border-red-300 focus:ring-red-200 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:bg-white focus:ring-blue-100 focus:border-blue-500'} rounded-xl text-sm transition-all focus:ring-4 outline-none`}
                                                        placeholder="Nombre de la organización"
                                                    />
                                                    {errors.empresa && <p className="text-red-500 text-xs mt-1 font-medium">{errors.empresa}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cargo <span className="text-red-500">*</span></label>
                                                    <input
                                                        name="cargo"
                                                        value={formData.cargo}
                                                        onChange={handleChange}
                                                        className={`block w-full px-4 py-2.5 bg-gray-50 border ${errors.cargo ? 'border-red-300 focus:ring-red-200 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:bg-white focus:ring-blue-100 focus:border-blue-500'} rounded-xl text-sm transition-all focus:ring-4 outline-none`}
                                                        placeholder="Ej. Director General"
                                                    />
                                                    {errors.cargo && <p className="text-red-500 text-xs mt-1 font-medium">{errors.cargo}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2 */}
                            {currentStep === 2 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                    <div className="mb-8 block md:hidden">
                                        <h3 className="text-lg font-bold text-gray-900">{steps[1].title}</h3>
                                        <p className="text-gray-500 text-sm">{steps[1].description}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Servicio de Interés <span className="text-red-500">*</span></label>
                                            <input
                                                name="servicioInteres"
                                                value={formData.servicioInteres}
                                                onChange={handleChange}
                                                className={`block w-full px-4 py-2.5 bg-gray-50 border ${errors.servicioInteres ? 'border-red-300 focus:ring-red-200 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:bg-white focus:ring-blue-100 focus:border-blue-500'} rounded-xl text-sm transition-all focus:ring-4 outline-none`}
                                                placeholder="Ej. Implementación ERP..."
                                            />
                                            {errors.servicioInteres && <p className="text-red-500 text-xs mt-1 font-medium">{errors.servicioInteres}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nivel de Interés</label>
                                            <select
                                                name="nivelInteres"
                                                value={formData.nivelInteres}
                                                onChange={handleChange}
                                                className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-blue-100 focus:border-blue-500 rounded-xl text-sm transition-all focus:ring-4 outline-none appearance-none"
                                            >
                                                <option value="Bajo">Bajo - Exploratorio</option>
                                                <option value="Medio">Medio - Evaluando opciones</option>
                                                <option value="Alto">Alto - Decisión próxima</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Valor Estimado (MXN)</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-400 text-sm font-semibold">$</span>
                                                </div>
                                                <input
                                                    name="valorEstimado"
                                                    type="number"
                                                    min="0"
                                                    step="100"
                                                    value={formData.valorEstimado || ''}
                                                    onChange={handleChange}
                                                    className="block w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-blue-100 focus:border-blue-500 rounded-xl text-sm transition-all focus:ring-4 outline-none"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Origen del Prospecto <span className="text-red-500">*</span></label>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                {['Sitio Web', 'Redes Sociales', 'Referido', 'Evento', 'Google Ads', 'Llamada', 'Directorio', 'Otro'].map(origen => (
                                                    <div
                                                        key={origen}
                                                        onClick={() => {
                                                            setFormData(p => ({ ...p, origen }));
                                                            if (errors.origen) setErrors(p => ({ ...p, origen: '' }));
                                                        }}
                                                        className={`cursor-pointer px-3 py-2.5 border rounded-xl text-center text-sm font-medium transition-all ${formData.origen === origen
                                                            ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                                                            : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {origen}
                                                    </div>
                                                ))}
                                            </div>
                                            {errors.origen && <p className="text-red-500 text-xs mt-2 font-medium">{errors.origen}</p>}
                                        </div>

                                        <div className="pt-4 md:col-span-2 border-t border-gray-100 mt-2">
                                            <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><Globe size={16} className="text-gray-400" /> Detalles del Sector</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Industria / Sector</label>
                                                    <input
                                                        name="industria"
                                                        value={formData.industria}
                                                        onChange={handleChange}
                                                        className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-blue-100 focus:border-blue-500 rounded-xl text-sm transition-all focus:ring-4 outline-none"
                                                        placeholder="Ej. Tecnología, Retail..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tamaño Empresa</label>
                                                    <select
                                                        name="tamanoEmpresa"
                                                        value={formData.tamanoEmpresa}
                                                        onChange={handleChange}
                                                        className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-blue-100 focus:border-blue-500 rounded-xl text-sm transition-all focus:ring-4 outline-none appearance-none"
                                                    >
                                                        <option value="">Seleccione...</option>
                                                        <option value="1-10">Micro (1-10)</option>
                                                        <option value="11-50">Pequeña (11-50)</option>
                                                        <option value="51-200">Mediana (51-200)</option>
                                                        <option value="200+">Grande (+200)</option>
                                                    </select>
                                                </div>
                                                <div className="sm:col-span-3">
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ubicación / Dirección</label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <MapPin className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                        <input
                                                            name="direccion"
                                                            value={formData.direccion}
                                                            onChange={handleChange}
                                                            className="block w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-blue-100 focus:border-blue-500 rounded-xl text-sm transition-all focus:ring-4 outline-none"
                                                            placeholder="Ciudad, Estado o Dirección Completa"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3 */}
                            {currentStep === 3 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                    <div className="mb-8 block md:hidden">
                                        <h3 className="text-lg font-bold text-gray-900">{steps[2].title}</h3>
                                        <p className="text-gray-500 text-sm">{steps[2].description}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vendedor Asignado</label>
                                            <div className="relative">
                                                <select
                                                    name="responsable"
                                                    value={formData.responsable}
                                                    onChange={handleChange}
                                                    className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-blue-100 focus:border-blue-500 rounded-xl text-sm transition-all focus:ring-4 outline-none appearance-none"
                                                >
                                                    <option value="">Seleccionar responsable...</option>
                                                    {users.map(user => (
                                                        <option key={user.id} value={user.id}>{user.name}</option>
                                                    ))}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                                    <ChevronRight size={16} className="rotate-90" />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Etapa del Pipeline</label>
                                            <select
                                                name="estado"
                                                value={formData.estado}
                                                onChange={handleChange}
                                                className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-blue-100 focus:border-blue-500 rounded-xl text-sm transition-all focus:ring-4 outline-none appearance-none"
                                            >
                                                <option value="Nuevo">NUEVO - Recién ingresado</option>
                                                <option value="Contactado">CONTACTADO - Primer acercamiento</option>
                                                <option value="En seguimiento">SEGUIMIENTO - Negociación</option>
                                                <option value="Cotizado">COTIZADO - Propuesta enviada</option>
                                                <option value="Venta cerrada">VENTA CERRADA - Compra realizada</option>
                                                <option value="Cliente Activo">CLIENTE ACTIVO - Relación activa</option>
                                                <option value="Cliente Inactivo">CLIENTE INACTIVO - Sin actividad</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Plataforma Preferida</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {['WhatsApp', 'Facebook', 'Instagram'].map(plat => (
                                                    <div
                                                        key={plat}
                                                        onClick={() => setFormData(p => ({ ...p, plataforma: plat }))}
                                                        className={`cursor-pointer px-2 py-2 border rounded-xl text-center text-sm font-medium transition-all ${formData.plataforma === plat
                                                            ? 'border-green-600 bg-green-50 text-green-700 ring-1 ring-green-600'
                                                            : 'border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {plat === 'WhatsApp' ? 'WA' : plat === 'Facebook' ? 'FB' : 'IG'}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Próximo Seguimiento</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <CalendarClock className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="date"
                                                    name="fechaProximoSeguimiento"
                                                    value={formData.fechaProximoSeguimiento ? new Date(formData.fechaProximoSeguimiento).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, fechaProximoSeguimiento: new Date(e.target.value) }))}
                                                    className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-blue-100 focus:border-blue-500 rounded-xl text-sm transition-all focus:ring-4 outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notas Internas de Recepción</label>
                                            <div className="relative">
                                                <div className="absolute top-3 left-3 pointer-events-none">
                                                    <MessageSquare className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <textarea
                                                    name="notasInternas"
                                                    value={formData.notasInternas}
                                                    onChange={handleChange}
                                                    rows={4}
                                                    className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-blue-100 focus:border-blue-500 rounded-xl text-sm transition-all focus:ring-4 outline-none resize-none"
                                                    placeholder="Añada cualquier información relevante sobre las necesidades del cliente, requerimientos especiales o contexto de la llamada..."
                                                />
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )}

                        </form>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 md:px-8 py-5 border-t border-gray-100 bg-gray-50 z-10 flex justify-between items-center rounded-b-2xl">
                    <button
                        type="button"
                        onClick={currentStep > 1 ? handlePrev : onClose}
                        className="px-5 py-2.5 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                        {currentStep > 1 ? (
                            <>
                                <ChevronLeft size={18} />
                                Anterior
                            </>
                        ) : (
                            'Cancelar'
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={currentStep < steps.length ? handleNext : handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? 'Guardando...' : currentStep < steps.length ? (
                            <>
                                Siguiente
                                <ChevronRight size={18} />
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={18} />
                                Guardar Prospecto
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

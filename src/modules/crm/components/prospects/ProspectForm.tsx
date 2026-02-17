import React, { useState, useEffect } from 'react';
import { X, Building2, User, Phone, Mail, Layout } from 'lucide-react';
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

    // Initial State matching new requirements
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

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Validaciones Obligatorias
        if (!formData.nombre?.trim()) newErrors.nombre = 'Nombre completo es requerido';
        if (!formData.empresa?.trim()) newErrors.empresa = 'Empresa es requerida';
        if (!formData.cargo?.trim()) newErrors.cargo = 'Cargo es requerido';

        if (!formData.telefono?.trim()) {
            newErrors.telefono = 'Teléfono principal es requerido';
        } else if (!/^[+]?[\d\s()-]+$/.test(formData.telefono)) {
            newErrors.telefono = 'Formato inválido';
        }

        if (!formData.correo?.trim()) {
            newErrors.correo = 'Correo electrónico es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
            newErrors.correo = 'Correo inválido';
        }

        if (!formData.origen) newErrors.origen = 'Origen es requerido';
        if (!formData.servicioInteres?.trim()) newErrors.servicioInteres = 'Servicio de interés es requerido';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            // Create new prospect object
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
                direccion: formData.direccion,
                notasInternas: formData.notasInternas,
                fechaProximoSeguimiento: formData.fechaProximoSeguimiento ? new Date(formData.fechaProximoSeguimiento) : undefined,
                seguimientos: [],
                cotizaciones: [],
                tareas: []
            };

            await addProspect(newProspect);
            onSuccess?.();
        } catch (error) {
            console.error('Error creating prospect:', error);
            setErrors({ submit: 'Error al guardar. Intente nuevamente.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8 flex flex-col max-h-[90vh]">

                {/* 1️⃣ ENCABEZADO */}
                <div className="flex-shrink-0 px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-white rounded-t-xl sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Prospecto</h2>
                        <p className="text-gray-500 mt-1">Registra un nuevo prospecto en el sistema CRM</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <form id="prospectForm" onSubmit={handleSubmit} className="space-y-8">

                        {/* 2️⃣ INFORMACIÓN OBLIGATORIA */}
                        <section className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                            <div className="flex items-center gap-2 mb-6 text-blue-800">
                                <User size={20} />
                                <h3 className="font-bold text-lg">Información Obligatoria</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre completo *</label>
                                    <input
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        className={`w - full px - 4 py - 2.5 rounded - lg border ${errors.nombre ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'} transition - all`}
                                        placeholder="Ej: Juan Carlos Pérez"
                                    />
                                    {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Empresa/Organización *</label>
                                    <input
                                        name="empresa"
                                        value={formData.empresa}
                                        onChange={handleChange}
                                        className={`w - full px - 4 py - 2.5 rounded - lg border ${errors.empresa ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'} transition - all`}
                                        placeholder="Ej: TechCorp S.A."
                                    />
                                    {errors.empresa && <p className="text-red-500 text-xs mt-1">{errors.empresa}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cargo/Puesto *</label>
                                    <input
                                        name="cargo"
                                        value={formData.cargo}
                                        onChange={handleChange}
                                        className={`w - full px - 4 py - 2.5 rounded - lg border ${errors.cargo ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'} transition - all`}
                                        placeholder="Ej: Gerente de Marketing"
                                    />
                                    {errors.cargo && <p className="text-red-500 text-xs mt-1">{errors.cargo}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono principal *</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleChange}
                                            className={`w - full pl - 10 pr - 4 py - 2.5 rounded - lg border ${errors.telefono ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'} transition - all`}
                                            placeholder="+52 55 1234 5678"
                                        />
                                    </div>
                                    {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Correo electrónico *</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            name="correo"
                                            value={formData.correo}
                                            onChange={handleChange}
                                            className={`w - full pl - 10 pr - 4 py - 2.5 rounded - lg border ${errors.correo ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'} transition - all`}
                                            placeholder="juan@empresa.com"
                                        />
                                    </div>
                                    {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Origen del prospecto *</label>
                                    <select
                                        name="origen"
                                        value={formData.origen}
                                        onChange={handleChange}
                                        className={`w - full px - 4 py - 2.5 rounded - lg border ${errors.origen ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'} transition - all bg - white`}
                                    >
                                        <option value="">Seleccionar origen</option>
                                        <option value="Sitio Web">Sitio Web</option>
                                        <option value="Redes Sociales">Redes Sociales</option>
                                        <option value="Referido">Referido</option>
                                        <option value="Google Ads">Google Ads</option>
                                        <option value="Evento">Evento/Networking</option>
                                    </select>
                                    {errors.origen && <p className="text-red-500 text-xs mt-1">{errors.origen}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Servicio de interés *</label>
                                    <input
                                        name="servicioInteres"
                                        value={formData.servicioInteres}
                                        onChange={handleChange}
                                        className={`w - full px - 4 py - 2.5 rounded - lg border ${errors.servicioInteres ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'} transition - all`}
                                        placeholder="Ej: Chatbot WhatsApp, CRM personalizado, Marketing digital..."
                                    />
                                    {errors.servicioInteres && <p className="text-red-500 text-xs mt-1">{errors.servicioInteres}</p>}
                                </div>
                            </div>
                        </section>

                        {/* 3️⃣ INFORMACIÓN OPCIONAL */}
                        <section className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-6 text-gray-700">
                                <Building2 size={20} />
                                <h3 className="font-bold text-lg">Información Opcional</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Teléfono secundario</label>
                                    <input
                                        name="telefonoSecundario"
                                        value={formData.telefonoSecundario}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                                        placeholder="+52 55 8765 4321"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Industria/Sector</label>
                                    <select
                                        name="industria"
                                        value={formData.industria}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                                    >
                                        <option value="">Seleccionar industria</option>
                                        <option value="Tecnología">Tecnología</option>
                                        <option value="Salud">Salud</option>
                                        <option value="Finanzas">Finanzas</option>
                                        <option value="Educación">Educación</option>
                                        <option value="Retail">Retail</option>
                                        <option value="Servicios">Servicios</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Tamaño de empresa</label>
                                    <select
                                        name="tamanoEmpresa"
                                        value={formData.tamanoEmpresa}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                                    >
                                        <option value="">Seleccionar tamaño</option>
                                        <option value="1-10">1-10 empleados</option>
                                        <option value="11-50">11-50 empleados</option>
                                        <option value="51-200">51-200 empleados</option>
                                        <option value="200+">200+ empleados</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Nivel de interés</label>
                                    <select
                                        name="nivelInteres"
                                        value={formData.nivelInteres}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                                    >
                                        <option value="Bajo">❄️ Bajo</option>
                                        <option value="Medio">⚡ Medio</option>
                                        <option value="Alto">🔥 Alto</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Dirección</label>
                                    <input
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                                        placeholder="Dirección completa de la empresa"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Notas adicionales</label>
                                    <textarea
                                        name="notasInternas"
                                        value={formData.notasInternas}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                                        placeholder="Información adicional relevante sobre el prospecto..."
                                    />
                                </div>
                            </div>
                        </section>

                        {/* 4️⃣ ASIGNACIÓN Y CONFIGURACIÓN */}
                        <section className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                            <div className="flex items-center gap-2 mb-6 text-indigo-800">
                                <Layout size={20} />
                                <h3 className="font-bold text-lg">Asignación y Configuración</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Vendedor asignado</label>
                                    <select
                                        name="responsable"
                                        value={formData.responsable}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                                    >
                                        <option value="">Seleccionar responsable</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.id}>{user.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Etapa del pipeline</label>
                                    <select
                                        name="estado"
                                        value={formData.estado}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                                    >
                                        <option value="Nuevo">🆕 Nuevo</option>
                                        <option value="Contactado">📩 Contactado</option>
                                        <option value="En seguimiento">🔎 En seguimiento</option>
                                        <option value="Cotizado">📝 Cotizado</option>
                                        <option value="Venta cerrada">✅ Venta cerrada</option>
                                        <option value="Perdido">❌ Perdido</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Plataforma de contacto</label>
                                    <select
                                        name="plataforma"
                                        value={formData.plataforma}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                                    >
                                        <option value="WhatsApp">💬 WhatsApp</option>
                                        <option value="Instagram">📷 Instagram</option>
                                        <option value="Facebook">📘 Facebook</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de próximo seguimiento</label>
                                    <input
                                        type="date"
                                        name="fechaProximoSeguimiento"
                                        value={formData.fechaProximoSeguimiento ? new Date(formData.fechaProximoSeguimiento).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setFormData(prev => ({ ...prev, fechaProximoSeguimiento: new Date(e.target.value) }))}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                                    />
                                </div>
                            </div>
                        </section>
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="flex-shrink-0 px-8 py-5 border-t border-gray-100 bg-white rounded-b-xl flex justify-end gap-3 sticky bottom-0 z-10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="prospectForm"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Guardando...' : 'Crear Prospecto'}
                    </button>
                </div>
            </div>
        </div>
    );
}

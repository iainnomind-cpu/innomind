import React, { useRef, useState, useEffect } from 'react';
import { useUsers } from '@/context/UserContext';
import { Building, Upload, AtSign, Phone, MapPin, Hash, Palette, CheckCircle, Users, UserPlus, Shield, X, Send, Blocks, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const CompanySettings: React.FC = () => {
    const { companyProfile, updateCompanyProfile, users, currentUser, isLoadingProfile, enabledModules, updateEnabledModules } = useUsers();
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'modules'>('profile');

    const [profile, setProfile] = useState(companyProfile);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Keep local state in sync with context (crucial for when async fetch completes)
    useEffect(() => {
        setProfile(companyProfile);
    }, [companyProfile]);

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('EMPLOYEE');
    const [inviteName, setInviteName] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [inviteError, setInviteError] = useState('');
    const [inviteSuccess, setInviteSuccess] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile({ ...profile, logoUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            await updateCompanyProfile(profile);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Error saving company profile:', err);
        }
    };

    const handleSendInvite = async () => {
        setInviteError('');
        setInviteSuccess('');
        setIsInviting(true);
        try {
            const { data, error } = await supabase.functions.invoke('send-invite', {
                body: {
                    email: inviteEmail,
                    role: inviteRole,
                    fullName: inviteName || inviteEmail.split('@')[0]
                }
            });

            if (error) {
                // Try to read the actual error message from the response
                let errorMsg = error.message;
                try {
                    if (error.context && typeof error.context.json === 'function') {
                        const body = await error.context.json();
                        errorMsg = body?.error || body?.message || error.message;
                    }
                } catch { /* ignore parse errors */ }
                setInviteError(errorMsg);
                return;
            }

            if (data?.error) {
                setInviteError(data.error);
                return;
            }

            setInviteSuccess(data?.message || "Invitación enviada exitosamente.");
            setInviteEmail('');
            setInviteName('');
            setInviteRole('EMPLOYEE');
            setTimeout(() => {
                setIsInviteModalOpen(false);
                setInviteSuccess('');
            }, 3500);
        } catch (err: unknown) {
            console.error("Error inviting user:", err);
            setInviteError((err as Error).message || 'Error al enviar invitación');
        } finally {
            setIsInviting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-300">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Ajustes del Sistema</h1>
                <p className="text-gray-500">Gestiona el perfil de tu empresa y los accesos de tu equipo (Multi-Tenant).</p>
            </div>

            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
                <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    <Building size={16} /> Perfil de Empresa
                </button>
                <button onClick={() => setActiveTab('team')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'team' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    <Users size={16} /> Mi Equipo
                </button>
                <button onClick={() => setActiveTab('modules')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'modules' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    <Blocks size={16} /> Módulos
                </button>
            </div>

            {activeTab === 'profile' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-in fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                        <div className="md:col-span-4 flex flex-col items-center border-b md:border-b-0 md:border-r border-gray-100 pb-8 md:pb-0 md:pr-8">
                            <div className="w-full flex justify-center mb-6">
                                <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 relative overflow-hidden group hover:border-blue-500 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    {profile.logoUrl ? (
                                        <>
                                            <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                                            <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white">
                                                <Upload className="w-6 h-6" />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Building className="w-8 h-8 text-gray-400 mb-2" />
                                            <span className="text-xs text-gray-500 font-medium">Subir Logo</span>
                                        </>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                            </div>
                            <div className="w-full">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Palette size={14} /> Color Principal
                                </label>
                                <div className="flex items-center gap-3">
                                    <input type="color" name="colorPrimario" value={profile.colorPrimario || '#2563eb'} onChange={handleChange} className="h-10 w-full rounded cursor-pointer" />
                                    <div className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">{profile.colorPrimario}</div>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-8 space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2"><Building size={16} className="text-gray-400" /> Nombre Comercial</label>
                                    <input type="text" name="nombreEmpresa" value={profile.nombreEmpresa} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2"><Hash size={16} className="text-gray-400" /> RFC</label>
                                    <input type="text" name="rfc" value={profile.rfc || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2"><Phone size={16} className="text-gray-400" /> Teléfono</label>
                                    <input type="text" name="telefono" value={profile.telefono || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2"><AtSign size={16} className="text-gray-400" /> Correo</label>
                                    <input type="email" name="email" value={profile.email || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2"><MapPin size={16} className="text-gray-400" /> Dirección</label>
                                    <input type="text" name="direccion" value={profile.direccion || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl" />
                                </div>
                            </div>
                            <div className="pt-6 flex justify-end items-center gap-4">
                                {saved && <span className="text-green-600 flex items-center gap-1.5 text-sm font-medium"><CheckCircle size={16} /> Guardado</span>}
                                <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium">Guardar Perfil</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'team' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6 animate-in fade-in">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Directorio de Equipo</h2>
                            <p className="text-sm text-gray-500">Usuarios con acceso a este Workspace.</p>
                        </div>
                        <button onClick={() => setIsInviteModalOpen(true)} className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
                            <UserPlus size={16} /> Invitar Miembro
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="pb-3 pl-2">Usuario</th>
                                    <th className="pb-3">Correo</th>
                                    <th className="pb-3">Rol</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr><td colSpan={3} className="text-center py-8 text-gray-500">Aún no hay usuarios</td></tr>
                                ) : (
                                    users.map(user => (
                                        <tr key={user.id} className="border-b last:border-0 border-gray-50">
                                            <td className="py-4 pl-2 flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">{user.avatar}</div>
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">
                                                        {user.name} {user.id === currentUser?.id && <span className="ml-2 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Tú</span>}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="py-4 text-sm text-gray-600 font-medium">{user.email || '—'}</td>
                                            <td className="py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                                    {user.role === 'ADMIN' && <Shield size={12} />} {user.role || 'EMPLOYEE'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'modules' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6 animate-in fade-in">
                    <div className="pb-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">Módulos Activos</h2>
                        <p className="text-sm text-gray-500 mt-1">Activa o desactiva los módulos que aparecen en el menú lateral. Los módulos desactivados no serán visibles para ningún miembro del equipo.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { id: 'embudo', label: 'Embudo de Ventas', desc: 'Pipeline visual de oportunidades' },
                            { id: 'prospectos', label: 'Prospectos', desc: 'Gestión de contactos pre-venta' },
                            { id: 'prospectos?tab=clientes', label: 'Clientes', desc: 'Cartera de clientes activos' },
                            { id: 'quotes', label: 'Cotizaciones', desc: 'Propuestas comerciales y presupuestos' },
                            { id: 'calendar', label: 'Calendario', desc: 'Eventos, reuniones y recordatorios' },
                            { id: 'finance', label: 'Finanzas', desc: 'Ingresos, egresos y reportes' },
                            { id: 'procurement', label: 'Compras', desc: 'Órdenes de compra y proveedores' },
                            { id: 'inventory', label: 'Inventario', desc: 'Productos, stock y movimientos' },
                            { id: 'workspace', label: 'Nodo', desc: 'Conversaciones, tareas y notas' },
                        ].map(mod => {
                            const isActive = enabledModules.length === 0 || enabledModules.includes(mod.id);
                            return (
                                <div
                                    key={mod.id}
                                    onClick={() => {
                                        let newModules: string[];
                                        if (enabledModules.length === 0) {
                                            // First toggle: activate all except this one
                                            newModules = ['embudo', 'prospectos', 'prospectos?tab=clientes', 'quotes', 'calendar', 'finance', 'procurement', 'inventory', 'workspace'].filter(m => m !== mod.id);
                                        } else if (isActive) {
                                            newModules = enabledModules.filter(m => m !== mod.id);
                                        } else {
                                            newModules = [...enabledModules, mod.id];
                                        }
                                        updateEnabledModules(newModules);
                                    }}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${isActive ? 'border-blue-400 bg-blue-50/50 shadow-sm' : 'border-gray-200 bg-gray-50 opacity-60 hover:opacity-80'}`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-bold text-sm text-gray-900">{mod.label}</h4>
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isActive ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                                            {isActive && <Check size={12} strokeWidth={4} />}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">{mod.desc}</p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-400">Los cambios se aplican inmediatamente al menú lateral para todos los miembros de este workspace.</p>
                    </div>
                </div>
            )}

            {isInviteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <div><h2 className="text-xl font-bold text-gray-900">Añadir al Equipo</h2></div>
                            <button onClick={() => setIsInviteModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-5">
                            {inviteError && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">{inviteError}</div>}
                            {inviteSuccess && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg border border-green-100 flex items-center gap-2"><CheckCircle size={16} /> {inviteSuccess}</div>}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2"><AtSign size={16} className="text-gray-400" /> Correo</label>
                                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2"><Users size={16} className="text-gray-400" /> Nombre</label>
                                <input type="text" value={inviteName} onChange={(e) => setInviteName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2"><Shield size={16} className="text-gray-400" /> Rol</label>
                                <div className="grid grid-cols-1 gap-2">
                                    <label className={`flex items-start p-3 border rounded-xl cursor-pointer ${inviteRole === 'EMPLOYEE' ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}>
                                        <input type="radio" value="EMPLOYEE" checked={inviteRole === 'EMPLOYEE'} onChange={() => setInviteRole('EMPLOYEE')} className="mt-1" />
                                        <div className="ml-3"><span className="block text-sm font-bold text-gray-900">Empleado</span></div>
                                    </label>
                                    <label className={`flex items-start p-3 border rounded-xl cursor-pointer ${inviteRole === 'ADMIN' ? 'bg-purple-50 border-purple-200' : 'hover:bg-gray-50'}`}>
                                        <input type="radio" value="ADMIN" checked={inviteRole === 'ADMIN'} onChange={() => setInviteRole('ADMIN')} className="mt-1" />
                                        <div className="ml-3"><span className="block text-sm font-bold text-gray-900">Administrador</span></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button onClick={() => setIsInviteModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900">Cancelar</button>
                            <button onClick={handleSendInvite} disabled={isInviting || !inviteEmail} className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium flex items-center gap-2">
                                {isInviting ? 'Procesando...' : <><Send size={16} /> Enviar</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanySettings;

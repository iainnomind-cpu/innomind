import React, { useRef, useState } from 'react';
import { useUsers } from '@/context/UserContext';
import { Building, Upload, AtSign, Phone, MapPin, Hash, Palette, CheckCircle } from 'lucide-react';

const CompanySettings: React.FC = () => {
    const { companyProfile, updateCompanyProfile } = useUsers();
    const [saved, setSaved] = useState(false);

    // Local state for fast editing before saving
    const [profile, setProfile] = useState(companyProfile);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleSave = () => {
        updateCompanyProfile(profile);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-300">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Mi Empresa</h1>
                <p className="text-gray-500">Personaliza la información y la marca que aparecerá en tus cotizaciones y documentos.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

                    {/* Left: Logo and Visuals */}
                    <div className="md:col-span-4 flex flex-col items-center border-b md:border-b-0 md:border-r border-gray-100 pb-8 md:pb-0 md:pr-8">
                        <div className="w-full flex justify-center mb-6">
                            <div
                                className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 relative overflow-hidden group hover:border-blue-500 transition-colors cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {profile.logoUrl ? (
                                    <>
                                        <img src={profile.logoUrl} alt="Logo de empresa" className="w-full h-full object-contain p-2" />
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
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleLogoUpload}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>

                        <div className="w-full">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Palette size={14} /> Color Principal
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    name="colorPrimario"
                                    value={profile.colorPrimario || '#2563eb'}
                                    onChange={handleChange}
                                    className="h-10 w-full rounded cursor-pointer"
                                />
                                <div className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    {profile.colorPrimario}
                                </div>
                            </div>
                            <p className="text-xs text-center text-gray-400 mt-2">Se usará para los acentos en tus PDFs.</p>
                        </div>
                    </div>

                    {/* Right: Data inputs */}
                    <div className="md:col-span-8 space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                    <Building size={16} className="text-gray-400" /> Nombre Comercial
                                </label>
                                <input
                                    type="text"
                                    name="nombreEmpresa"
                                    value={profile.nombreEmpresa}
                                    onChange={handleChange}
                                    placeholder="Nombre de tu negocio"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                    <Hash size={16} className="text-gray-400" /> RFC / ID Fiscal
                                </label>
                                <input
                                    type="text"
                                    name="rfc"
                                    value={profile.rfc || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                    <Phone size={16} className="text-gray-400" /> Teléfono
                                </label>
                                <input
                                    type="text"
                                    name="telefono"
                                    value={profile.telefono || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                    <AtSign size={16} className="text-gray-400" /> Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profile.email || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                    <MapPin size={16} className="text-gray-400" /> Dirección Completa
                                </label>
                                <input
                                    type="text"
                                    name="direccion"
                                    value={profile.direccion || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end items-center gap-4">
                            {saved && (
                                <span className="text-green-600 flex items-center gap-1.5 text-sm font-medium animate-in slide-in-from-right">
                                    <CheckCircle size={16} /> Guardado correctamente
                                </span>
                            )}
                            <button
                                onClick={handleSave}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
                            >
                                Guardar Perfil
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CompanySettings;

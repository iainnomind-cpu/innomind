import React, { useState } from 'react';
import { useProcurement } from '@/context/ProcurementContext';
import { Search, Plus, Truck, Star, Phone, Mail, FileText, ChevronRight, X } from 'lucide-react';
import { Supplier } from '@/types';

export default function SupplierDirectory() {
    const { suppliers, addSupplier, updateSupplier } = useProcurement();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    const activeSuppliers = suppliers.filter(s => s.activo);

    const filteredSuppliers = activeSuppliers.filter(s =>
        s.nombreComercial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.razonSocial && s.razonSocial.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.rfc && s.rfc.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setIsModalOpen(true);
    };

    const countHighPerformers = activeSuppliers.filter(s => (s.calificacionDesempeno || 0) >= 4).length;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Truck size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Proveedores</p>
                        <p className="text-2xl font-bold text-gray-900">{activeSuppliers.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-500 rounded-lg">
                        <Star size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Alto Desempeño (4+ Estrellas)</p>
                        <p className="text-2xl font-bold text-gray-900">{countHighPerformers}</p>
                    </div>
                </div>
                {/* Placeholder for future metric like active orders */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Días de Crédito Promedio</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {activeSuppliers.length > 0 ? Math.round(activeSuppliers.reduce((sum, s) => sum + (s.condicionesPago || 0), 0) / activeSuppliers.length) : 0}
                            <span className="text-sm text-gray-500 ml-1">días</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar proveedor por nombre, RFC..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <button
                    onClick={() => {
                        setEditingSupplier(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus size={20} /> Nuevo Proveedor
                </button>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Proveedor</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Contacto</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Condiciones</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Desempeño</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredSuppliers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No se encontraron proveedores.
                                    </td>
                                </tr>
                            ) : (
                                filteredSuppliers.map(supplier => (
                                    <tr key={supplier.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleEdit(supplier)}>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{supplier.nombreComercial}</div>
                                            <div className="text-sm text-gray-500">{supplier.razonSocial || 'Sin Razón Social'} • {supplier.rfc || 'Sin RFC'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                                <Mail size={14} className="text-gray-400" /> {supplier.email || '-'}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone size={14} className="text-gray-400" /> {supplier.telefono || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                                                {supplier.condicionesPago > 0 ? `${supplier.condicionesPago} días crédito` : 'Contado'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center items-center gap-1">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star
                                                        key={star}
                                                        size={14}
                                                        className={star <= (supplier.calificacionDesempeno || 0) ? "fill-amber-400 text-amber-400" : "text-gray-200"}
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <ChevronRight className="inline-block text-gray-400 h-5 w-5" />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <SupplierModal
                    supplier={editingSupplier}
                    onClose={() => setIsModalOpen(false)}
                    onSave={editingSupplier ? (id, updates) => updateSupplier(id, updates) : addSupplier}
                />
            )}
        </div>
    );
}


function SupplierModal({ supplier, onClose, onSave }: { supplier: Supplier | null, onClose: () => void, onSave: (idOrData: any, updates?: any) => Promise<any> }) {
    const [activeTab, setActiveTab] = useState<'general' | 'fiscal' | 'commercial' | 'contacts'>('general');
    const [formData, setFormData] = useState({
        nombreComercial: supplier?.nombreComercial || '',
        razonSocial: supplier?.razonSocial || '',
        rfc: supplier?.rfc || '',
        direccionFiscal: supplier?.direccionFiscal || '',
        pais: supplier?.pais || 'México',
        estado: supplier?.estado || '',
        ciudad: supplier?.ciudad || '',
        codigoPostal: supplier?.codigoPostal || '',
        email: supplier?.email || '',
        telefono: supplier?.telefono || '',
        categoria: supplier?.categoria || 'Insumos',
        tipoProveedor: supplier?.tipoProveedor || 'Nacional',
        moneda: supplier?.moneda || 'MXN',
        condicionesPago: supplier?.condicionesPago || 0,
        tiempoEntregaPromedio: supplier?.tiempoEntregaPromedio || 0,
        calificacionDesempeno: supplier?.calificacionDesempeno || 0,
        notas: supplier?.notas || '',
        website: supplier?.website || ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (supplier) {
                await onSave(supplier.id, formData);
            } else {
                await onSave(formData);
            }
            onClose();
        } catch (error) {
            console.error("Error saving supplier", error);
            alert("Error al guardar el proveedor");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col border border-gray-200 my-8">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Truck className="text-blue-600" /> {supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex border-b border-gray-100 bg-gray-50/50">
                    {(['general', 'fiscal', 'commercial', 'contacts'] as const).map(tab => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 text-sm font-bold capitalize transition-all border-b-2 ${activeTab === tab ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            {tab === 'general' ? 'General' : tab === 'fiscal' ? 'Fiscal' : tab === 'commercial' ? 'Comercial' : 'Contactos y Docs'}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Comercial *</label>
                                    <input
                                        type="text"
                                        value={formData.nombreComercial}
                                        onChange={e => setFormData({ ...formData, nombreComercial: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        required autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Principal</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                    <input
                                        type="tel"
                                        value={formData.telefono}
                                        onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                    <input
                                        type="url"
                                        value={formData.website}
                                        onChange={e => setFormData({ ...formData, website: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notas Internas</label>
                                    <textarea
                                        value={formData.notas}
                                        onChange={e => setFormData({ ...formData, notas: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'fiscal' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social</label>
                                    <input
                                        type="text"
                                        value={formData.razonSocial}
                                        onChange={e => setFormData({ ...formData, razonSocial: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">RFC</label>
                                    <input
                                        type="text"
                                        value={formData.rfc}
                                        onChange={e => setFormData({ ...formData, rfc: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                                    <input
                                        type="text"
                                        value={formData.codigoPostal}
                                        onChange={e => setFormData({ ...formData, codigoPostal: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Fiscal</label>
                                    <input
                                        type="text"
                                        value={formData.direccionFiscal}
                                        onChange={e => setFormData({ ...formData, direccionFiscal: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                                    <input
                                        type="text"
                                        value={formData.pais}
                                        onChange={e => setFormData({ ...formData, pais: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad / Estado</label>
                                    <input
                                        type="text"
                                        value={formData.ciudad}
                                        onChange={e => setFormData({ ...formData, ciudad: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Ciudad, Estado"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'commercial' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                    <select
                                        value={formData.categoria}
                                        onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    >
                                        <option value="Materia Prima">Materia Prima</option>
                                        <option value="Insumos">Insumos</option>
                                        <option value="Servicios">Servicios</option>
                                        <option value="Tecnología">Tecnología</option>
                                        <option value="Mantenimiento">Mantenimiento</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Proveedor</label>
                                    <select
                                        value={formData.tipoProveedor}
                                        onChange={e => setFormData({ ...formData, tipoProveedor: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    >
                                        <option value="Nacional">Nacional</option>
                                        <option value="Internacional">Internacional</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Condiciones de Pago (Días)</label>
                                    <input
                                        type="number" min="0"
                                        value={formData.condicionesPago}
                                        onChange={e => setFormData({ ...formData, condicionesPago: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Lead Time Promedio (Días)</label>
                                    <input
                                        type="number" min="0"
                                        value={formData.tiempoEntregaPromedio}
                                        onChange={e => setFormData({ ...formData, tiempoEntregaPromedio: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Moneda Operativa</label>
                                    <select
                                        value={formData.moneda}
                                        onChange={e => setFormData({ ...formData, moneda: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    >
                                        <option value="MXN">MXN</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Calificación Inicial</label>
                                    <div className="flex items-center gap-1 mt-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, calificacionDesempeno: star })}
                                                className="focus:outline-none"
                                            >
                                                <Star
                                                    size={24}
                                                    className={star <= formData.calificacionDesempeno ? "fill-amber-400 text-amber-400" : "text-gray-200"}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'contacts' && (
                        <div className="text-center py-12">
                            <Plus size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">Funcionalidad de contactos y documentos se habilita tras guardar el perfil básico.</p>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancelar</button>
                        <button type="submit" disabled={isSubmitting || !formData.nombreComercial} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            {isSubmitting ? 'Guardando...' : 'Guardar Proveedor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProcurement } from '@/context/ProcurementContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
    ClipboardList,
    Plus,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    XCircle,
    Tag,
    ShoppingCart,
    Info,
    Building2,
    ArrowRight,
    Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PurchaseRequest, Supplier } from '@/types';

export default function PurchaseRequestsManager() {
    const {
        suppliers,
        purchaseRequests,
        refreshProcurementData,
        updatePurchaseRequest,
        deletePurchaseRequest,
        convertRequestToOrder
    } = useProcurement();
    const { workspace } = useWorkspace();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // States for Order Creation
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);

    const filteredRequests = purchaseRequests.filter(req => {
        const title = req.title || req.custom_item_name || '';
        const desc = req.description || req.reason || '';
        const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            desc.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleOpenConvertModal = (request: PurchaseRequest) => {
        setSelectedRequest(request);
        setIsSupplierModalOpen(true);
    };

    const handleConfirmConversion = async (supplierId: string) => {
        if (!selectedRequest) return;

        if (!supplierId) {
            alert("Debe seleccionar un proveedor antes de crear la Orden de Compra");
            return;
        }

        try {
            const order = await convertRequestToOrder(selectedRequest, supplierId);
            setIsSupplierModalOpen(false);
            setSelectedRequest(null);

            if (order?.id) {
                navigate(`/compras/ordenes/${order.id}`);
            } else {
                alert('Orden de Compra generada con éxito');
                refreshProcurementData();
            }
        } catch (error) {
            console.error(error);
            alert('No se pudo crear la Orden de Compra');
        }
    };

    const handleAddRequest = async (formData: any) => {
        if (!workspace?.id) {
            alert("Workspace no disponible");
            return;
        }

        if (!user?.id) {
            alert("Usuario no autenticado");
            return;
        }

        const { error } = await supabase
            .from("purchase_requests")
            .insert({
                workspace_id: workspace.id,
                title: formData.title,
                description: formData.description,
                quantity: formData.quantity === "" ? 0 : Number(formData.quantity),
                uom: formData.uom,
                required_date: formData.required_date,
                department: formData.department,
                priority: formData.priority,
                status: "pending",
                created_by: user.id
            });

        if (error) {
            console.error("Error creando solicitud:", error);
            alert("No se pudo crear la solicitud de compra. Verifica que el esquema de la base de datos esté actualizado.");
            return;
        }

        refreshProcurementData();
        setIsModalOpen(false);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ClipboardList className="text-blue-600" /> Solicitudes de Compra
                    </h2>
                    <p className="text-gray-500">Gestiona requerimientos internos antes de generar una orden.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-bold"
                >
                    <Plus size={20} /> Nueva Solicitud
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por artículo o motivo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-gray-400" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-gray-50 border-none rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="pending">Pendientes</option>
                        <option value="reviewing">En Revisión</option>
                        <option value="approved">Aprobadas</option>
                        <option value="ordered">Generada OC</option>
                        <option value="converted">Convertidas</option>
                        <option value="rejected">Rechazadas</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRequests.map(req => (
                        <RequestCard
                            key={req.id}
                            request={req}
                            onConvert={() => handleOpenConvertModal(req)}
                            onUpdate={(status) => updatePurchaseRequest(req.id, { status })}
                            onDelete={async () => {
                                if (window.confirm('¿Estás seguro de que deseas eliminar esta solicitud de compra? Esta acción no se puede deshacer.')) {
                                    try {
                                        await deletePurchaseRequest(req.id);
                                    } catch (error) {
                                        console.error(error);
                                        alert("Error al eliminar la solicitud.");
                                    }
                                }
                            }}
                        />
                ))}

                {filteredRequests.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                        <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">No se encontraron solicitudes.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <NewRequestModal
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleAddRequest}
                />
            )}

            {isSupplierModalOpen && selectedRequest && (
                <SelectSupplierModal
                    suppliers={suppliers}
                    onClose={() => setIsSupplierModalOpen(false)}
                    onConfirm={handleConfirmConversion}
                    requestTitle={selectedRequest.title || selectedRequest.custom_item_name || ''}
                />
            )}
        </div>
    );
}

function RequestCard({ request, onConvert, onUpdate, onDelete }: {
    request: PurchaseRequest,
    onConvert: () => void,
    onUpdate: (status: any) => void,
    onDelete: () => void
}) {
    const priorityColors = {
        baja: 'bg-gray-100 text-gray-600',
        normal: 'bg-blue-100 text-blue-600',
        alta: 'bg-amber-100 text-amber-600',
        urgente: 'bg-red-100 text-red-600'
    };

    const statusConfig = {
        pending: { label: 'Pendiente', color: 'bg-amber-50 text-amber-700', icon: <Clock size={14} /> },
        reviewing: { label: 'En Revisión', color: 'bg-blue-50 text-blue-700', icon: <Search size={14} /> },
        approved: { label: 'Aprobada', color: 'bg-emerald-50 text-emerald-700', icon: <CheckCircle2 size={14} /> },
        rejected: { label: 'Rechazada', color: 'bg-red-50 text-red-700', icon: <XCircle size={14} /> },
        converted: { label: 'Convertida', color: 'bg-indigo-50 text-indigo-700', icon: <ShoppingCart size={14} /> },
        ordered: { label: 'Orden Generada', color: 'bg-indigo-50 text-indigo-700', icon: <ShoppingCart size={14} /> }
    };

    const config = statusConfig[request.status] || statusConfig.pending;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition">
            <div className="p-5 flex-1 space-y-4">
                <div className="flex justify-between items-start">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${priorityColors[request.priority]}`}>
                        {request.priority}
                    </span>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${config.color}`}>
                        {config.icon} {config.label}
                    </span>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-gray-900">{request.title || request.custom_item_name || 'Artículo sin nombre'}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{request.description || request.reason || 'Sin descripción'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Tag size={16} className="text-gray-400" />
                        <span>{request.quantity} {request.uom}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={16} className="text-gray-400" />
                        <span>{format(request.required_date ? new Date(request.required_date) : new Date(), 'dd MMM', { locale: es })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Info size={16} className="text-gray-400" />
                        <span>{request.department || 'Sin Depto'}</span>
                    </div>
                </div>
            </div>

            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                {request.status === 'pending' && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => onUpdate('approved')}
                            className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition"
                            title="Aprobar"
                        >
                            <CheckCircle2 size={20} />
                        </button>
                        <button
                            onClick={() => onUpdate('rejected')}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                            title="Rechazar"
                        >
                            <XCircle size={20} />
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Eliminar"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                )}
                {request.status === 'approved' && (
                    <button
                        onClick={onConvert}
                        className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition"
                    >
                        <Plus size={16} /> Crear OC
                    </button>
                )}
                {request.status !== 'pending' && (
                    <button
                        onClick={onDelete}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Eliminar"
                    >
                        <Trash2 size={18} />
                    </button>
                )}
                <div className="text-[10px] text-gray-400 font-medium ml-auto">
                    Solicitado: {format(new Date(request.created_at), 'dd/MM/yy')}
                </div>
            </div>
        </div>
    );
}

function NewRequestModal({ onClose, onSave }: { onClose: () => void, onSave: (data: any) => Promise<any> }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        quantity: '' as string | number,
        uom: 'pza',
        priority: 'normal',
        required_date: format(new Date(), 'yyyy-MM-dd'),
        department: ''
    });

    const validateForm = () => {
        if (!formData.title) return "El título es obligatorio";
        if (!formData.quantity || Number(formData.quantity) <= 0) return "La cantidad es obligatoria y debe ser mayor a 0";
        if (!formData.required_date) return "La fecha requerida es obligatoria";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errorMessage = validateForm();
        if (errorMessage) {
            alert(errorMessage);
            return;
        }

        try {
            await onSave({
                ...formData,
                required_date: new Date(formData.required_date)
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col border border-gray-200 overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Plus className="text-blue-600" /> Nueva Solicitud de Compra
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XCircle size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Título / Artículo *</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Ej: Laptop para diseño, 50kg de resina..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Cantidad *</label>
                            <input
                                type="number"
                                value={formData.quantity ?? ""}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value === "" ? "" : Number(e.target.value) })}
                                className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Unidad</label>
                            <input
                                type="text"
                                value={formData.uom}
                                onChange={e => setFormData({ ...formData, uom: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="pza, kg, m, serv"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Departamento</label>
                            <input
                                type="text"
                                value={formData.department}
                                onChange={e => setFormData({ ...formData, department: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Ventas, IT..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Prioridad</label>
                            <select
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                            >
                                <option value="baja">Baja</option>
                                <option value="normal">Normal</option>
                                <option value="alta">Alta</option>
                                <option value="urgente">Urgente</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Fecha Requerida *</label>
                            <input
                                type="date"
                                required
                                value={formData.required_date}
                                onChange={e => setFormData({ ...formData, required_date: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Descripción / Justificación</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            rows={3}
                            placeholder="¿Por qué se requiere esta compra?"
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
                        >
                            Crear Solicitud
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SelectSupplierModal({ suppliers, onClose, onConfirm, requestTitle }: {
    suppliers: Supplier[],
    onClose: () => void,
    onConfirm: (id: string) => void,
    requestTitle: string
}) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSuppliers = suppliers.filter(s =>
        (s.nombreComercial || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.razonSocial || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Seleccionar Proveedor</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Para convertir la solicitud <span className="text-blue-600 font-bold">"{requestTitle}"</span> en una Orden de Compra.
                    </p>
                </div>

                <div className="p-4 border-b border-gray-50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar proveedor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="max-h-[40vh] overflow-y-auto custom-scrollbar p-2">
                    {filteredSuppliers.map(s => (
                        <button
                            key={s.id}
                            onClick={() => onConfirm(s.id)}
                            className="w-full flex items-center justify-between p-3 hover:bg-blue-50 rounded-xl transition group text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600">
                                    <Building2 size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{s.nombreComercial}</p>
                                    <p className="text-xs text-gray-500">{s.razonSocial}</p>
                                </div>
                            </div>
                            <ArrowRight size={18} className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
                        </button>
                    ))}

                    {filteredSuppliers.length === 0 && (
                        <div className="py-8 text-center text-gray-500 italic">
                            No se encontraron proveedores.
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full py-2 text-gray-600 font-bold hover:text-gray-900 transition"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { X, Plus, Save, Trash2, Edit2, MapPin } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { InventoryLocation } from '@/types';
import { supabase } from '@/lib/supabase';

interface LocationSettingsModalProps {
    onClose: () => void;
}

export default function LocationSettingsModal({ onClose }: LocationSettingsModalProps) {
    const { locations, setLocations, deleteLocation } = useInventory();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
        tipo: 'Principal' as InventoryLocation['tipo'],
        is_active: true
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // For adding a new location
    const [isAdding, setIsAdding] = useState(false);

    const handleEdit = (loc: any) => {
        setEditingId(loc.id);
        setError(null);
        setSuccess(null);
        setForm({
            nombre: loc.nombre,
            descripcion: loc.descripcion || loc.direccion || '',
            tipo: loc.tipo,
            is_active: loc.is_active !== undefined ? loc.is_active : true
        });
        setIsAdding(false);
    };

    const handleSave = async () => {
        setError(null);
        setSuccess(null);

        if (!form.nombre.trim()) {
            setError('El nombre del almacén es obligatorio');
            return;
        }

        setIsSubmitting(true);
        try {
            // Fetch the exact workspace ID from company_profiles right before inserting
            const { data: companyData, error: companyError } = await supabase.from('company_profiles').select('id').single();
            const workspaceId = companyData?.id;

            if (!workspaceId || companyError) {
                throw new Error("No se pudo obtener el perfil de la empresa (Workspace) del usuario actual para asociar el almacén.");
            }

            if (isAdding) {
                const { data, error } = await supabase
                    .from('inventory_locations')
                    .insert([
                        {
                            nombre: form.nombre,
                            descripcion: form.descripcion,
                            workspace: workspaceId,
                            is_active: true
                        }
                    ]).select().single();

                if (error) throw error;

                if (data) {
                    setLocations(prev => [...prev, data as any]);
                }

                setSuccess('Almacén guardado exitosamente');
                setTimeout(() => {
                    setIsAdding(false);
                    setSuccess(null);
                    setForm({ nombre: '', descripcion: '', tipo: 'Principal', is_active: true });
                    onClose();
                }, 1500);
            } else if (editingId) {
                const { data, error } = await supabase
                    .from('inventory_locations')
                    .update({
                        nombre: form.nombre,
                        descripcion: form.descripcion,
                        is_active: form.is_active
                    })
                    .eq('id', editingId)
                    .select()
                    .single();

                if (error) throw error;

                if (data) {
                    setLocations(prev => prev.map(loc => loc.id === editingId ? (data as any) : loc));
                }

                setSuccess('Almacén actualizado exitosamente');
                setTimeout(() => {
                    setEditingId(null);
                    setSuccess(null);
                    setForm({ nombre: '', descripcion: '', tipo: 'Principal', is_active: true });
                    onClose();
                }, 1500);
            }
        } catch (err: any) {
            console.error("Error saving location:", {
                message: err.message,
                details: err.details,
                hint: err.hint,
                code: err.code,
                fullError: err
            });
            setError(err.message || err.details || 'Ocurrió un error al guardar el almacén.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de eliminar este almacén? Podría afectar los movimientos registrados en él.')) {
            try {
                await deleteLocation(id);
            } catch (err: any) {
                alert(err.message || 'Error al eliminar el almacén');
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col border border-gray-200 min-h-[500px] max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Configuración de Almacenes</h2>
                        <p className="text-sm text-gray-500 mt-1">Gestiona tus sucursales y ubicaciones físicas</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                    {/* List of current locations */}
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-800">Almacenes Registrados</h3>
                            {!isAdding && !editingId && (
                                <button
                                    onClick={() => { setIsAdding(true); setForm({ nombre: '', descripcion: '', tipo: 'Principal', is_active: true }); setError(null); setSuccess(null); }}
                                    className="text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors"
                                >
                                    <Plus size={16} /> Agregar
                                </button>
                            )}
                        </div>

                        {locations.length === 0 && !isAdding && (
                            <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-300">
                                <MapPin className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                <p className="text-gray-500 font-medium">No hay almacenes todavía</p>
                            </div>
                        )}

                        {locations.map(loc => (
                            <div key={loc.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-gray-900">{loc.nombre}</h4>
                                        <span className={`px-2 py-0.5 text-xs rounded-md ${loc.tipo === 'Principal' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                                            {loc.tipo}
                                        </span>
                                        {!(loc as any).is_active && <span className="px-2 py-0.5 text-xs rounded-md bg-red-100 text-red-800">Inactivo</span>}
                                    </div>
                                    {((loc as any).descripcion || loc.direccion) && <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><MapPin size={12} /> {(loc as any).descripcion || loc.direccion}</p>}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(loc)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors" disabled={!!editingId || isAdding}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(loc.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors" disabled={!!editingId || isAdding}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Edit/Add Form */}
                    {(isAdding || editingId) && (
                        <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm animate-in slide-in-from-bottom-2 fade-in">
                            <h4 className="font-bold text-gray-900 mb-4">{isAdding ? 'Nuevo Almacén' : 'Editar Almacén'}</h4>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                                    {success}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        autoFocus
                                        value={form.nombre}
                                        onChange={e => { setForm({ ...form, nombre: e.target.value }); setError(null); }}
                                        disabled={isSubmitting}
                                        className={`w-full px-3 py-2 border ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'} rounded-lg outline-none disabled:bg-gray-50 disabled:text-gray-500`}
                                        placeholder="Ej. Matriz Monterrey"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                    <select
                                        value={form.tipo}
                                        onChange={e => setForm({ ...form, tipo: e.target.value as any })}
                                        disabled={isSubmitting}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-blue-500 outline-none bg-white disabled:bg-gray-50 disabled:text-gray-500"
                                    >
                                        <option value="Principal">Principal</option>
                                        <option value="Secundario">Secundario (Sucursal)</option>
                                        <option value="Tránsito">En Tránsito / Móvil</option>
                                    </select>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección (Opcional)</label>
                                    <input
                                        type="text"
                                        value={form.descripcion}
                                        onChange={e => setForm({ ...form, descripcion: e.target.value })}
                                        disabled={isSubmitting}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                                        placeholder="Ubicación física..."
                                    />
                                </div>
                                <div className="sm:col-span-2 flex items-center justify-between mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.is_active}
                                            onChange={e => setForm({ ...form, is_active: e.target.checked })}
                                            disabled={isSubmitting}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300 disabled:opacity-50"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Almacén Activo</span>
                                    </label>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setIsAdding(false); setEditingId(null); setError(null); setSuccess(null); }}
                                            disabled={isSubmitting}
                                            className="px-4 py-1.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={isSubmitting}
                                            className="px-6 py-1.5 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 min-w-[120px]"
                                        >
                                            {isSubmitting ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <><Save size={16} /> Guardar</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

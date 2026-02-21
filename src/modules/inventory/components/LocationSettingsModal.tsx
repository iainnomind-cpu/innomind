import { useState } from 'react';
import { X, Plus, Save, Trash2, Edit2, MapPin } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { InventoryLocation } from '@/types';

interface LocationSettingsModalProps {
    onClose: () => void;
}

export default function LocationSettingsModal({ onClose }: LocationSettingsModalProps) {
    const { locations, addLocation, updateLocation, deleteLocation } = useInventory();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        nombre: '',
        direccion: '',
        tipo: 'Principal' as InventoryLocation['tipo'],
        activo: true
    });

    // For adding a new location
    const [isAdding, setIsAdding] = useState(false);

    const handleEdit = (loc: InventoryLocation) => {
        setEditingId(loc.id);
        setFormData({
            nombre: loc.nombre,
            direccion: loc.direccion || '',
            tipo: loc.tipo,
            activo: loc.activo
        });
        setIsAdding(false);
    };

    const handleSave = async () => {
        if (!formData.nombre.trim()) return;

        if (isAdding) {
            await addLocation({
                nombre: formData.nombre,
                direccion: formData.direccion,
                tipo: formData.tipo,
                activo: formData.activo
            });
            setIsAdding(false);
        } else if (editingId) {
            await updateLocation(editingId, {
                nombre: formData.nombre,
                direccion: formData.direccion,
                tipo: formData.tipo,
                activo: formData.activo
            });
            setEditingId(null);
        }

        // Reset form
        setFormData({ nombre: '', direccion: '', tipo: 'Principal', activo: true });
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de eliminar este almacén? Podría afectar los movimientos registrados en él.')) {
            await deleteLocation(id);
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
                                    onClick={() => { setIsAdding(true); setFormData({ nombre: '', direccion: '', tipo: 'Principal', activo: true }); }}
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
                                        {!loc.activo && <span className="px-2 py-0.5 text-xs rounded-md bg-red-100 text-red-800">Inactivo</span>}
                                    </div>
                                    {loc.direccion && <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><MapPin size={12} /> {loc.direccion}</p>}
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        autoFocus
                                        value={formData.nombre}
                                        onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="Ej. Matriz Monterrey"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                    <select
                                        value={formData.tipo}
                                        onChange={e => setFormData({ ...formData, tipo: e.target.value as any })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-blue-500 outline-none bg-white"
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
                                        value={formData.direccion}
                                        onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="Ubicación física..."
                                    />
                                </div>
                                <div className="sm:col-span-2 flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.activo}
                                            onChange={e => setFormData({ ...formData, activo: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Almacén Activo</span>
                                    </label>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setIsAdding(false); setEditingId(null); }}
                                            className="px-4 py-1.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={!formData.nombre.trim()}
                                            className="px-4 py-1.5 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <Save size={16} /> Guardar
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

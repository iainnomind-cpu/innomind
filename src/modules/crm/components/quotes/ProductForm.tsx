import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { Product } from '@/types';

interface ProductFormProps {
    onClose: () => void;
    editingProduct?: Product | null;
}

export default function ProductForm({ onClose, editingProduct }: ProductFormProps) {
    const { addProduct, updateProduct } = useCRM();

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: 0,
        unidad: 'Unidad',
        categoria: '',
        estado: 'activo' as 'activo' | 'inactivo',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (editingProduct) {
            setFormData({
                nombre: editingProduct.nombre,
                descripcion: editingProduct.descripcion,
                precio: editingProduct.precio,
                unidad: editingProduct.unidad,
                categoria: editingProduct.categoria,
                estado: editingProduct.estado,
            });
        }
    }, [editingProduct]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
        if (!formData.descripcion.trim()) newErrors.descripcion = 'La descripción es obligatoria';
        if (formData.precio < 0) newErrors.precio = 'El precio no puede ser negativo';
        if (!formData.unidad) newErrors.unidad = 'La unidad de medida es obligatoria';
        if (!formData.categoria.trim()) newErrors.categoria = 'La categoría es obligatoria';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        if (editingProduct) {
            updateProduct(editingProduct.id, {
                ...formData,
                fechaActualizacion: new Date(),
            });
        } else {
            addProduct({
                ...formData,
                fechaActualizacion: new Date(),
            });
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre del producto/servicio *
                                </label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${errors.nombre ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                    placeholder="Ej. Plan de Marketing Básico"
                                />
                                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción *
                                </label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    rows={3}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors resize-none ${errors.descripcion ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                    placeholder="Detalles y características del producto o servicio"
                                />
                                {errors.descripcion && <p className="text-red-500 text-xs mt-1">{errors.descripcion}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Precio *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.precio}
                                        onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                                        className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${errors.precio ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                    />
                                </div>
                                {errors.precio && <p className="text-red-500 text-xs mt-1">{errors.precio}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Unidad de Medida *
                                </label>
                                <select
                                    value={formData.unidad}
                                    onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${errors.unidad ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                >
                                    <option value="Unidad">Unidad</option>
                                    <option value="Hora">Hora</option>
                                    <option value="Servicio">Servicio</option>
                                    <option value="Proyecto">Proyecto</option>
                                    <option value="Mes">Mes</option>
                                    <option value="Año">Año</option>
                                    <option value="Licencia">Licencia</option>
                                </select>
                                {errors.unidad && <p className="text-red-500 text-xs mt-1">{errors.unidad}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Categoría *
                                </label>
                                <input
                                    type="text"
                                    value={formData.categoria}
                                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${errors.categoria ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                    placeholder="Ej: Chatbots, Marketing, etc."
                                />
                                {errors.categoria && <p className="text-red-500 text-xs mt-1">{errors.categoria}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Estado
                                </label>
                                <select
                                    value={formData.estado}
                                    onChange={(e) => setFormData({ ...formData, estado: e.target.value as 'activo' | 'inactivo' })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                                >
                                    <option value="activo">Activo</option>
                                    <option value="inactivo">Inactivo</option>
                                </select>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 mt-auto">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                    >
                        <Save className="h-4 w-4" />
                        {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                    </button>
                </div>
            </div>
        </div>
    );
}

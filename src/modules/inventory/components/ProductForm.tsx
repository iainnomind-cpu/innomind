import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { Product } from '@/types';

interface ProductFormProps {
    onClose: () => void;
    productId?: string | null;
}

export default function ProductForm({ onClose, productId }: ProductFormProps) {
    const { products, addProduct, updateProduct } = useInventory();

    const editingProduct = productId ? products.find(p => p.id === productId) : null;

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        codigo: '',
        precio: 0,
        costoPromedio: 0,
        unidad: 'Unidad',
        categoria: '',
        activo: true,
        tipo: 'fisico' as 'fisico' | 'servicio' | 'suscripcion' | 'activo_digital' | 'paquete',
        trackInventory: true,
        stockMinimo: 0,
        esPaqueteServicios: false,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (editingProduct) {
            setFormData({
                nombre: editingProduct.nombre,
                descripcion: editingProduct.descripcion || '',
                codigo: editingProduct.codigo || '',
                precio: editingProduct.precio,
                costoPromedio: editingProduct.costoPromedio || 0,
                unidad: editingProduct.unidad || 'Unidad',
                categoria: editingProduct.categoria || '',
                activo: editingProduct.activo,
                tipo: editingProduct.tipo || 'fisico',
                trackInventory: editingProduct.trackInventory ?? true,
                stockMinimo: editingProduct.stockMinimo || 0,
                esPaqueteServicios: editingProduct.esPaqueteServicios || false,
            });
        }
    }, [editingProduct]);

    // Handle Type constraints
    useEffect(() => {
        if (formData.tipo === 'servicio') {
            setFormData(prev => ({ ...prev, trackInventory: false, stockMinimo: 0 }));
        }
    }, [formData.tipo]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
        if (formData.precio < 0) newErrors.precio = 'El precio no puede ser negativo';
        if (formData.costoPromedio < 0) newErrors.costoPromedio = 'El costo no puede ser negativo';
        if (!formData.unidad) newErrors.unidad = 'La unidad de medida es obligatoria';
        if (!formData.categoria.trim()) newErrors.categoria = 'La categoría es obligatoria';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        if (editingProduct) {
            await updateProduct(editingProduct.id, {
                ...formData,
            });
        } else {
            await addProduct({
                ...formData,
            });
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-gray-200 ">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 ">
                    <h2 className="text-xl font-bold text-gray-900 ">
                        {editingProduct ? 'Editar Ítem' : 'Nuevo Ítem'}
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

                        {/* Identificación */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4">
                            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Identificación</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre del producto/servicio *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        className={`w-full px-4 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${errors.nombre ? 'border-red-500' : 'border-gray-200 '}`}
                                        placeholder="Ej. Plan de Marketing Básico"
                                    />
                                    {errors.nombre && <span className="text-red-500 text-xs mt-1">{errors.nombre}</span>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Código (SKU)</label>
                                    <input
                                        type="text"
                                        value={formData.codigo}
                                        onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="PROD-001"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                                    <input
                                        type="text"
                                        value={formData.categoria}
                                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                        className={`w-full px-4 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${errors.categoria ? 'border-red-500' : 'border-gray-200 '}`}
                                        placeholder="Ej: Servicios Digitales"
                                    />
                                    {errors.categoria && <span className="text-red-500 text-xs mt-1">{errors.categoria}</span>}
                                </div>

                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                    <textarea
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                        rows={2}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                        placeholder="Características detalladas..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Configuración */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4">
                            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Configuración</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Ítem</label>
                                    <select
                                        value={formData.tipo}
                                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="fisico">Producto Físico</option>
                                        <option value="servicio">Servicio Intangible</option>
                                        <option value="paquete">Paquete / Combo</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Unidad Comercial</label>
                                    <select
                                        value={formData.unidad}
                                        onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                                        className={`w-full px-4 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.unidad ? 'border-red-500' : 'border-gray-200 '}`}
                                    >
                                        <option value="Unidad">Unidad (Pza)</option>
                                        <option value="Hora">Hora</option>
                                        <option value="Servicio">Servicio</option>
                                        <option value="Proyecto">Proyecto</option>
                                        <option value="Mes">Mes</option>
                                        <option value="Kilo">Kilogramo (kg)</option>
                                        <option value="Litro">Litro (L)</option>
                                    </select>
                                    {errors.unidad && <span className="text-red-500 text-xs mt-1">{errors.unidad}</span>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                    <select
                                        value={formData.activo ? 'activo' : 'inactivo'}
                                        onChange={(e) => setFormData({ ...formData, activo: e.target.value === 'activo' })}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="activo">Activo (Venta Libre)</option>
                                        <option value="inactivo">Inactivo / Oculto</option>
                                    </select>
                                </div>

                                {formData.tipo === 'fisico' && (
                                    <>
                                        <div className="col-span-1 md:col-span-3 flex items-center gap-4 mt-2">
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="rounded text-blue-600 focus:ring-blue-500 border-gray-300 h-4 w-4"
                                                    checked={formData.trackInventory}
                                                    onChange={(e) => setFormData({ ...formData, trackInventory: e.target.checked })}
                                                />
                                                Llevar control de inventario y stock físico
                                            </label>
                                        </div>
                                        {formData.trackInventory && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo Alerta</label>
                                                <input
                                                    type="number" min="0"
                                                    value={formData.stockMinimo}
                                                    onChange={(e) => setFormData({ ...formData, stockMinimo: parseInt(e.target.value) || 0 })}
                                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Precios */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4">
                            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Pricing y Costos</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio de Venta (Público) *</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 ">$</span>
                                        <input
                                            type="number" min="0" step="0.01"
                                            value={formData.precio}
                                            onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                                            className={`w-full pl-8 pr-4 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.precio ? 'border-red-500' : 'border-gray-200 '}`}
                                        />
                                    </div>
                                    {errors.precio && <span className="text-red-500 text-xs mt-1">{errors.precio}</span>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                        Costo Promedio (Opcional)
                                        <AlertCircle size={14} className="text-gray-400" />
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 ">$</span>
                                        <input
                                            type="number" min="0" step="0.01"
                                            value={formData.costoPromedio}
                                            onChange={(e) => setFormData({ ...formData, costoPromedio: parseFloat(e.target.value) || 0 })}
                                            className={`w-full pl-8 pr-4 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.costoPromedio ? 'border-red-500' : 'border-gray-200 '}`}
                                        />
                                    </div>
                                </div>
                            </div>
                            {formData.precio > 0 && formData.costoPromedio > 0 && (
                                <div className="mt-2 text-sm text-gray-600 ">
                                    Margen de ganancia calculado: <span className="font-semibold text-green-600 ">{(((formData.precio - formData.costoPromedio) / formData.precio) * 100).toFixed(1)}%</span>
                                </div>
                            )}
                        </div>

                    </form>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 mt-auto bg-gray-50/50 rounded-b-xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                    >
                        <Save className="h-4 w-4" />
                        {editingProduct ? 'Guardar Cambios' : 'Registrar Ítem'}
                    </button>
                </div>
            </div>
        </div>
    );
}

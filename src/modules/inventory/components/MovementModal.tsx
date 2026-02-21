import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';

interface MovementModalProps {
    productId: string;
    initialType: 'ENTRADA_COMPRA' | 'SALIDA_VENTA' | 'AJUSTE_POSITIVO' | 'AJUSTE_NEGATIVO';
    onClose: () => void;
}

export default function MovementModal({ productId, initialType, onClose }: MovementModalProps) {
    const { products, locations, registerMovement } = useInventory();

    const product = products.find(p => p.id === productId);

    const [formData, setFormData] = useState({
        locationId: locations.length > 0 ? locations[0].id : '',
        tipoMovimiento: initialType,
        cantidad: 1,
        costoUnitario: product?.costoPromedio || 0,
        notas: '',
        referenceId: ''
    });

    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.locationId) {
            setError('Debes seleccionar un almacén destino/origen.');
            return;
        }

        if (formData.cantidad <= 0) {
            setError('La cantidad debe ser mayor a 0.');
            return;
        }

        await registerMovement({
            productId,
            locationId: formData.locationId,
            tipoMovimiento: formData.tipoMovimiento as any,
            cantidad: formData.cantidad,
            costoUnitario: formData.costoUnitario,
            notas: formData.notas,
            referenceId: formData.referenceId
        });

        onClose();
    };

    if (!product) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col border border-gray-200 ">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 ">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 ">
                            Registrar Movimiento
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">{product.nombre}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo de Movimiento
                            </label>
                            <select
                                value={formData.tipoMovimiento}
                                onChange={(e) => setFormData({ ...formData, tipoMovimiento: e.target.value as any })}
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="ENTRADA_COMPRA">Entrada (Compra / Abastecimiento)</option>
                                <option value="AJUSTE_POSITIVO">Ajuste Positivo (Encontrado)</option>
                                <option value="SALIDA_VENTA">Salida (Venta Directa)</option>
                                <option value="AJUSTE_NEGATIVO">Ajuste Negativo (Merma / Robo)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Almacén / Ubicación *
                            </label>
                            <select
                                value={formData.locationId}
                                onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            >
                                {locations.map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cantidad *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.cantidad}
                                    onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>

                            {['ENTRADA_COMPRA', 'AJUSTE_POSITIVO'].includes(formData.tipoMovimiento) && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Costo Unit. Real ($)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.costoUnitario}
                                        onChange={(e) => setFormData({ ...formData, costoUnitario: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Documento Referencia (Opcional)
                            </label>
                            <input
                                type="text"
                                value={formData.referenceId}
                                onChange={(e) => setFormData({ ...formData, referenceId: e.target.value })}
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Folio OC o Factura"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notas o Motivo
                            </label>
                            <textarea
                                value={formData.notas}
                                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                                rows={2}
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                placeholder="Justificación del movimiento..."
                            />
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
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}

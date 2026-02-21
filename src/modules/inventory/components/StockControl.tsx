import { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { Warehouse, AlertTriangle, ArrowUpRight, ArrowDownRight, Search, Settings2 } from 'lucide-react';
import MovementModal from './MovementModal';
import LocationSettingsModal from './LocationSettingsModal';

export default function StockControl() {
    const { products, locations, getProductStock } = useInventory();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocation, setSelectedLocation] = useState<string>('all');

    // Modal State
    const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [selectedProductForMovement, setSelectedProductForMovement] = useState<string | null>(null);
    const [movementType, setMovementType] = useState<'ENTRADA_COMPRA' | 'SALIDA_VENTA' | 'AJUSTE_POSITIVO' | 'AJUSTE_NEGATIVO'>('AJUSTE_POSITIVO');

    // Filtrar solo productos que llevan control de inventario (físicos con trackInventory = true)
    const activeInventoryProducts = products.filter(p => p.tipo === 'fisico' && p.trackInventory);

    const filteredProducts = activeInventoryProducts.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.codigo && p.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleOpenMovement = (productId: string, type: 'ENTRADA_COMPRA' | 'AJUSTE_POSITIVO' | 'AJUSTE_NEGATIVO') => {
        setSelectedProductForMovement(productId);
        setMovementType(type);
        setIsMovementModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por código o nombre del producto..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 "
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Warehouse className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 appearance-none"
                        >
                            <option value="all">Todos los Almacenes</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => setIsLocationModalOpen(true)}
                        className="px-4 py-2 border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                    >
                        <Settings2 size={18} />
                        Ajustes
                    </button>
                </div>
            </div>

            {/* Configuración warning if no locations exist */}
            {locations.length === 0 && (
                <div className="bg-amber-100 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-start gap-3 shadow-sm mb-6">
                    <AlertTriangle className="text-amber-600 mt-0.5" size={20} />
                    <div>
                        <h3 className="text-amber-900 font-bold">No hay almacenes configurados</h3>
                        <p className="text-amber-800 text-sm mt-1">
                            Para poder registrar entradas y salidas de mercancía, necesitas crear al menos una Sucursal o Almacén principal.
                        </p>
                    </div>
                </div>
            )}

            {/* Stock Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200 ">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    SKU
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Producto
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Stock Actual
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Min. Requerido
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Acciones Rápidas
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 ">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 ">
                                        <Warehouse className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                        <p className="text-lg font-medium text-gray-900 mb-1">No hay productos gestionados por inventario</p>
                                        <p>Marca "Llevar control de inventario" al crear un producto físico en el catálogo.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => {
                                    const locFilter = selectedLocation === 'all' ? undefined : selectedLocation;
                                    const currentStock = getProductStock(product.id, locFilter);
                                    const minStock = product.stockMinimo || 0;

                                    // Traffic Light Logic
                                    const isCritical = currentStock === 0;
                                    const isWarning = currentStock > 0 && currentStock <= minStock;
                                    const isGood = currentStock > minStock;

                                    return (
                                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 ">
                                                {product.codigo || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-gray-900 ">{product.nombre}</div>
                                                <div className="text-xs text-gray-500 ">{product.categoria || 'Sin categoría'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className={`text-lg font-bold ${isCritical ? 'text-red-600 ' : isWarning ? 'text-yellow-600 ' : 'text-gray-900 '}`}>
                                                    {currentStock}
                                                </span>
                                                <span className="text-xs text-gray-500 ml-1 block">{product.unidad}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 ">
                                                {minStock}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {isCritical && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 ">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                                        Agotado
                                                    </span>
                                                )}
                                                {isWarning && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 ">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                                        Reordenar
                                                    </span>
                                                )}
                                                {isGood && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                        Óptimo
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenMovement(product.id, 'ENTRADA_COMPRA')}
                                                        className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors tooltip-trigger"
                                                        title="Ingresar Mercancía (Compra)"
                                                        disabled={locations.length === 0}
                                                    >
                                                        <ArrowUpRight size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenMovement(product.id, 'AJUSTE_NEGATIVO')}
                                                        className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors tooltip-trigger"
                                                        title="Salida / Merma / Ajuste"
                                                        disabled={locations.length === 0 || currentStock === 0}
                                                    >
                                                        <ArrowDownRight size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isMovementModalOpen && selectedProductForMovement && (
                <MovementModal
                    productId={selectedProductForMovement}
                    initialType={movementType}
                    onClose={() => setIsMovementModalOpen(false)}
                />
            )}

            {isLocationModalOpen && (
                <LocationSettingsModal onClose={() => setIsLocationModalOpen(false)} />
            )}
        </div>
    );
}

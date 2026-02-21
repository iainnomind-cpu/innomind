import { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { Search, Filter, ArrowUpRight, ArrowDownRight, RefreshCcw, ActivitySquare, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function InventoryMovements() {
    const { movements, products, locations } = useInventory();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };

    const getProductName = (id: string) => products.find(p => p.id === id)?.nombre || 'Desconocido';
    const getLocationName = (id: string) => locations.find(l => l.id === id)?.nombre || 'Desconocido';

    const getMovementIcon = (type: string) => {
        if (['ENTRADA_COMPRA', 'AJUSTE_POSITIVO'].includes(type)) {
            return <ArrowUpRight className="text-green-500" size={18} />;
        }
        if (['SALIDA_VENTA', 'AJUSTE_NEGATIVO'].includes(type)) {
            return <ArrowDownRight className="text-red-500" size={18} />;
        }
        return <RefreshCcw className="text-blue-500" size={18} />;
    };

    const getMovementColor = (type: string) => {
        if (['ENTRADA_COMPRA', 'AJUSTE_POSITIVO'].includes(type)) return 'bg-green-100 text-green-800 ';
        if (['SALIDA_VENTA', 'AJUSTE_NEGATIVO'].includes(type)) return 'bg-red-100 text-red-800 ';
        return 'bg-blue-100 text-blue-800 ';
    };

    const formatTypeLabel = (type: string) => {
        return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    const filteredMovements = movements.filter(m => {
        const matchesSearch = getProductName(m.productId).toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.referenceId && m.referenceId.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = selectedType === 'all' || m.tipoMovimiento === selectedType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Filters */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por producto o referencia..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 "
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 appearance-none"
                    >
                        <option value="all">Todos los Movimientos</option>
                        <option value="ENTRADA_COMPRA">Entradas / Compras</option>
                        <option value="SALIDA_VENTA">Salidas / Ventas</option>
                        <option value="AJUSTE_POSITIVO">Ajustes Positivos</option>
                        <option value="AJUSTE_NEGATIVO">Ajustes Negativos</option>
                        <option value="TRANSFERENCIA">Transferencias</option>
                    </select>
                    <button className="px-4 py-2 border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 text-gray-700 font-medium transition-colors">
                        <Filter size={18} />
                        Filtros
                    </button>
                    <button className="px-4 py-2 border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 text-gray-700 font-medium transition-colors">
                        <CalendarIcon size={18} />
                        Fechas
                    </button>
                </div>
            </div>

            {/* Timeline / Kardex Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200 ">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Fecha / Hora
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Producto
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Almacén
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Cantidad
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Costo U.
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                    Referencia
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 ">
                            {filteredMovements.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 ">
                                        <ActivitySquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                        <p className="text-lg font-medium text-gray-900 mb-1">Kardex Vacío</p>
                                        <p>No se encontraron movimientos registrados de stock.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredMovements.map((mov) => (
                                    <tr key={mov.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 capitalize">
                                                {format(mov.fechaMovimiento, "dd MMM yyyy", { locale: es })}
                                            </div>
                                            <div className="text-xs text-gray-500 ">
                                                {format(mov.fechaMovimiento, "HH:mm")}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {getMovementIcon(mov.tipoMovimiento)}
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getMovementColor(mov.tipoMovimiento)}`}>
                                                    {formatTypeLabel(mov.tipoMovimiento)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 ">
                                                {getProductName(mov.productId)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 ">
                                            {getLocationName(mov.locationId)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className={`text-sm font-bold ${['ENTRADA_COMPRA', 'AJUSTE_POSITIVO'].includes(mov.tipoMovimiento) ? 'text-green-600 ' : 'text-red-600 '}`}>
                                                {['ENTRADA_COMPRA', 'AJUSTE_POSITIVO'].includes(mov.tipoMovimiento) ? '+' : '-'}{mov.cantidad}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600 ">
                                            {mov.costoUnitario > 0 ? formatCurrency(mov.costoUnitario) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">
                                            {mov.referenceId && (
                                                <div className="font-mono bg-gray-100 px-2 py-1 rounded inline-block text-xs">
                                                    {mov.referenceId}
                                                </div>
                                            )}
                                            {mov.notas && (
                                                <div className="text-xs mt-1 truncate max-w-[150px]" title={mov.notas}>
                                                    {mov.notas}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

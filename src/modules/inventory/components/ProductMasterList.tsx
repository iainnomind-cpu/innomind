import { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { Package, Plus, Search, Filter, Edit2, Trash2, ArrowUpDown } from 'lucide-react';
import ProductForm from './ProductForm';

export default function ProductMasterList() {
    const { products, deleteProduct } = useInventory();
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

    const filteredProducts = products.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.codigo && p.codigo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.categoria && p.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };

    const handleEdit = (id: string) => {
        setSelectedProduct(id);
        setIsFormOpen(true);
    };

    const handleAdd = () => {
        setSelectedProduct(null);
        setIsFormOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por código, nombre o categoría..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 "
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 text-gray-700 font-medium transition-colors">
                        <Filter size={18} />
                        Filtros
                    </button>
                    <button
                        onClick={handleAdd}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                    >
                        <Plus size={18} />
                        Nuevo Ítem
                    </button>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200 ">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-gray-700 ">
                                        Código
                                        <ArrowUpDown size={14} />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Producto / Servicio
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Costo Prom.
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Precio Venta
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Margen
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 ">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 ">
                                        <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                        <p className="text-lg font-medium text-gray-900 mb-1">No hay ítems registrados</p>
                                        <p>Comienza agregando tu primer producto o servicio al catálogo maestro.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => {
                                    const costo = product.costoPromedio || 0;
                                    const margen = product.precio > 0 ? ((product.precio - costo) / product.precio) * 100 : 0;

                                    return (
                                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 ">
                                                {product.codigo || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-gray-900 ">{product.nombre}</div>
                                                <div className="text-xs text-gray-500 ">{product.categoria || 'Sin categoría'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                    ${product.tipo === 'servicio' ? 'bg-purple-100 text-purple-800 ' :
                                                        product.tipo === 'fisico' ? 'bg-blue-100 text-blue-800 ' :
                                                            product.tipo === 'paquete' ? 'bg-amber-100 text-amber-800 ' :
                                                                'bg-gray-100 text-gray-800 '}`}>
                                                    {product.tipo?.replace('_', ' ') || 'físico'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 ">
                                                {costo > 0 ? formatCurrency(costo) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                                                {formatCurrency(product.precio)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                                <span className={`font-medium ${margen >= 40 ? 'text-green-600 ' : margen > 15 ? 'text-blue-600 ' : 'text-red-600 '}`}>
                                                    {margen.toFixed(1)}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(product.id)}
                                                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('¿Estás seguro de eliminar este ítem del catálogo?')) {
                                                                deleteProduct(product.id);
                                                            }
                                                        }}
                                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={18} />
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

            {isFormOpen && (
                <ProductForm
                    productId={selectedProduct}
                    onClose={() => setIsFormOpen(false)}
                />
            )}
        </div>
    );
}

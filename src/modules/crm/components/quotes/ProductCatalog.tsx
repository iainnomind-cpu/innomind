import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Package, Eye, EyeOff, Filter } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { Product } from '@/types';
import ProductForm from './ProductForm';

const ProductCatalog: React.FC = () => {
    const { products, deleteProduct, updateProduct } = useCRM();

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Obtener categorías únicas
    const categories = Array.from(new Set(products.map((p: Product) => p.categoria)));

    // Filtrado
    const filteredProducts = products.filter((product: Product) => {
        const matchesSearch =
            product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || product.categoria === categoryFilter;
        const matchesStatus = statusFilter === 'all' || product.estado === statusFilter;

        return matchesSearch && matchesCategory && matchesStatus;
    });

    // Estadísticas
    const totalProducts = products.length;
    const activeProducts = products.filter((p: Product) => p.estado === 'activo').length;
    const totalCategories = categories.length;
    const avgPrice = products.length > 0
        ? Math.round(products.reduce((sum: number, p: Product) => sum + p.precio, 0) / products.length)
        : 0;

    const handleDelete = (id: string) => {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            deleteProduct(id);
        }
    };

    const handleToggleStatus = (product: Product) => {
        const newStatus = product.estado === 'activo' ? 'inactivo' : 'activo';
        updateProduct(product.id, { estado: newStatus });
    };

    const getCategoryColor = (categoria: string) => {
        const colors: Record<string, string> = {
            'Appweb': 'bg-blue-100 text-blue-800',
            'Chatbots': 'bg-purple-100 text-purple-800',
            'Marketing': 'bg-pink-100 text-pink-800',
            'Diseño': 'bg-green-100 text-green-800',
            'Consultoría': 'bg-yellow-100 text-yellow-800'
        };
        return colors[categoria] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Catálogo de Productos</h2>
                    <p className="text-gray-600">Administra tu catálogo de productos y servicios</p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-4 w-4" /> Nuevo Producto
                </button>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Buscador */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Buscar productos..."
                        className="pl-10 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent px-4 py-2"
                    />
                </div>

                {/* Filtro de Categoría */}
                <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 px-3 py-2"
                >
                    <option value="all">Todas las categorías</option>
                    {categories.map((cat: string) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                {/* Filtro de Estado */}
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 px-3 py-2"
                >
                    <option value="all">Todos los estados</option>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                </select>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Productos</p>
                            <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
                        </div>
                        <Package className="h-8 w-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Productos Activos</p>
                            <p className="text-3xl font-bold text-gray-900">{activeProducts}</p>
                        </div>
                        <Eye className="h-8 w-8 text-green-500" />
                    </div>
                </div>

                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Categorías</p>
                            <p className="text-3xl font-bold text-gray-900">{totalCategories}</p>
                        </div>
                        <Filter className="h-8 w-8 text-purple-500" />
                    </div>
                </div>

                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Precio Promedio</p>
                            <p className="text-3xl font-bold text-gray-900">${avgPrice.toLocaleString()}</p>
                        </div>
                        <Package className="h-8 w-8 text-orange-500" />
                    </div>
                </div>
            </div>

            {/* Contador */}
            <div className="text-sm text-gray-600">
                Mostrando {filteredProducts.length} de {totalProducts} productos
            </div>

            {/* Grid de Productos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product: Product) => (
                    <div key={product.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                        {/* Header con icono de ver */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 text-lg mb-1">{product.nombre}</h3>
                                <p className="text-sm text-gray-600 line-clamp-2">{product.descripcion}</p>
                            </div>
                            <button
                                onClick={() => handleToggleStatus(product)}
                                title={product.estado === 'activo' ? 'Desactivar producto' : 'Activar producto'}
                                className={`ml-2 transition-colors ${product.estado === 'activo'
                                        ? 'text-blue-600 hover:text-blue-800'
                                        : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {product.estado === 'activo' ? (
                                    <Eye className="h-5 w-5" />
                                ) : (
                                    <EyeOff className="h-5 w-5 opacity-70" />
                                )}
                            </button>
                        </div>

                        {/* Badges */}
                        <div className="flex gap-2 mb-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getCategoryColor(product.categoria)}`}>
                                {product.categoria}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${product.estado === 'activo'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                {product.estado}
                            </span>
                        </div>

                        {/* Precio y Unidad */}
                        <div className="space-y-2 mb-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Precio:</span>
                                <span className="text-lg font-bold text-gray-900">${product.precio.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Unidad:</span>
                                <span className="text-sm font-medium text-gray-900">{product.unidad}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Actualizado:</span>
                                <span className="text-sm text-gray-500">
                                    {new Date(product.fechaActualizacion).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                            <button
                                onClick={() => {
                                    setEditingProduct(product);
                                    setShowAddForm(true);
                                }}
                                className="flex-1 flex items-center justify-center gap-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded transition-colors"
                            >
                                <Edit className="h-4 w-4" />
                                Editar
                            </button>
                            <button
                                onClick={() => handleDelete(product.id)}
                                className="flex-1 flex items-center justify-center gap-1 text-sm bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Estado vacío */}
            {filteredProducts.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No se encontraron productos
                    </h3>
                    <p className="text-gray-600 mb-4">
                        {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                            ? 'Intenta ajustar los filtros de búsqueda'
                            : 'Comienza agregando productos a tu catálogo'}
                    </p>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Agregar Primer Producto
                    </button>
                </div>
            )}

            {/* Modal de formulario (simplificado - implementar después) */}
            {showAddForm && (
                <ProductForm
                    onClose={() => {
                        setShowAddForm(false);
                        setEditingProduct(null);
                    }}
                    editingProduct={editingProduct}
                />
            )}
        </div>
    );
};

export default ProductCatalog;

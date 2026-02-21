import React, { useState } from 'react';
import { Plus, Search, Eye, Edit, Copy, Trash2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '@/context/CRMContext';
import { QuoteTemplate } from '@/types';
import TemplateForm from './TemplateForm';

const QuoteTemplates: React.FC = () => {
    const navigate = useNavigate();
    const { quoteTemplates, deleteQuoteTemplate, duplicateQuoteTemplate } = useCRM();

    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<QuoteTemplate | null>(null);

    // Filtrado
    const filteredTemplates = quoteTemplates.filter((template: QuoteTemplate) =>
        template.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id: string) => {
        if (confirm('¿Estás seguro de eliminar esta plantilla?')) {
            deleteQuoteTemplate(id);
        }
    };

    const handleDuplicate = (template: QuoteTemplate) => {
        duplicateQuoteTemplate(template.id);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Plantillas de Cotización</h2>
                    <p className="text-gray-600">Crea plantillas reutilizables para agilizar el proceso de cotización</p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-4 w-4" /> Nueva Plantilla
                </button>
            </div>

            {/* Buscador */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Buscar plantillas..."
                    className="pl-10 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent px-4 py-2"
                />
            </div>

            {/* Grid de Plantillas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map((template: QuoteTemplate) => (
                    <div key={template.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        {/* Header */}
                        <div className="mb-4">
                            <h3 className="font-semibold text-gray-900 text-xl mb-2">{template.nombre}</h3>
                            <p className="text-sm text-gray-600">{template.descripcion}</p>
                        </div>

                        {/* Info */}
                        <div className="space-y-2 mb-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">{(template.items || []).length} ítems • Creado por {template.creadoPor}</span>
                            </div>
                        </div>

                        {/* Total y Fecha */}
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                            <div>
                                <span className="text-sm text-gray-600">Total estimado:</span>
                                <p className="text-2xl font-bold text-gray-900">${template.totalEstimado.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-sm text-gray-600">Creado:</span>
                                <p className="text-sm font-medium text-gray-900">
                                    {new Date(template.fechaCreacion).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate(`/crm/quotes/templates/${template.id}`)}
                                className="flex-1 flex items-center justify-center gap-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded transition-colors"
                            >
                                <Eye className="h-4 w-4" />
                                Ver
                            </button>
                            <button
                                onClick={() => {
                                    setEditingTemplate(template);
                                    setShowAddForm(true);
                                }}
                                className="flex-1 flex items-center justify-center gap-1 text-sm bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded transition-colors"
                            >
                                <Edit className="h-4 w-4" />
                                Editar
                            </button>
                            <button
                                onClick={() => handleDuplicate(template)}
                                className="flex-1 flex items-center justify-center gap-1 text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-2 rounded transition-colors"
                            >
                                <Copy className="h-4 w-4" />
                                Duplicar
                            </button>
                            <button
                                onClick={() => handleDelete(template.id)}
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
            {filteredTemplates.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm ? 'No se encontraron plantillas' : 'Sin Plantillas'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                        {searchTerm
                            ? 'Intenta ajustar tu búsqueda'
                            : 'Crea plantillas para agilizar la generación de cotizaciones'}
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Crear Primera Plantilla
                        </button>
                    )}
                </div>
            )}

            {showAddForm && (
                <TemplateForm
                    onClose={() => {
                        setShowAddForm(false);
                        setEditingTemplate(null);
                    }}
                    editingTemplate={editingTemplate}
                />
            )}
        </div>
    );
};

export default QuoteTemplates;

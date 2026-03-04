import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Copy } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import TemplateForm from './TemplateForm';

export default function TemplateDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { quoteTemplates, duplicateQuoteTemplate } = useCRM();
    const [showEditForm, setShowEditForm] = useState(false);

    const template = quoteTemplates.find(t => t.id === id);

    if (!template) {
        return (
            <div className="p-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Plantilla no encontrada</h3>
                    <p className="text-gray-600 mb-6">La plantilla que buscas no existe o fue eliminada.</p>
                    <button
                        onClick={() => navigate('/crm/quotes/plantillas')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Volver a Plantillas
                    </button>
                </div>
            </div>
        );
    }

    const handleDuplicate = () => {
        duplicateQuoteTemplate(template.id);
        navigate('/crm/quotes/plantillas');
    };

    return (
        <div className="space-y-6">
            {/* Encabezado Superior */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <button
                            onClick={() => navigate('/crm/quotes/plantillas')}
                            className="flex items-center text-gray-500 hover:text-gray-700 text-sm mb-4 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Volver a Plantillas
                        </button>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{template.nombre}</h1>
                        <p className="text-gray-600 text-lg">{template.descripcion}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowEditForm(true)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                        >
                            <Edit className="h-4 w-4" />
                            Editar
                        </button>
                        <button
                            onClick={handleDuplicate}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium"
                        >
                            <Copy className="h-4 w-4" />
                            Duplicar
                        </button>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-6 text-sm text-gray-500">
                    <div>Creado por: <span className="font-medium text-gray-700">{template.created_by}</span></div>
                    <div>Fecha: <span className="font-medium text-gray-700">{new Date(template.fechaCreacion).toLocaleDateString()}</span></div>
                </div>
            </div>

            {/* Ítems de la Plantilla */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-900">Ítems de la Plantilla</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripción</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Cantidad</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio Unit.</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Descuento</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {template.items?.map((item, index) => (
                                <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{item.nombre}</div>
                                        {item.descripcion && <div className="text-sm text-gray-500 mt-1">{item.descripcion}</div>}
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-700">
                                        {item.cantidad}
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-700">
                                        ${(item.precioUnitario || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {item.descuento > 0 ? (
                                            <span className="text-red-600 font-medium">
                                                -{item.tipoDescuento === 'porcentaje' ? `${item.descuento}%` : `$${item.descuento.toLocaleString()}`}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                                        ${(item.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                            {(!template.items || template.items.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No hay ítems registrados en esta plantilla.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-end">
                    <div className="w-full md:w-1/3 space-y-3">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal Items:</span>
                            <span>${(template.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        {((template.subtotal || 0) - (template.totalEstimado || 0)) > 0 && (
                            <div className="flex justify-between text-red-500">
                                <span>Descuento Total:</span>
                                <span>-${((template.subtotal || 0) - (template.totalEstimado || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-xl font-bold text-gray-900 border-t border-gray-200 pt-3">
                            <span>Total Estimado:</span>
                            <span className="text-blue-600">${(template.totalEstimado || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Condiciones y Detalles (Grid 2 columnas) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Condiciones de Pago */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Condiciones de Pago</h3>
                    {template.condicionesPago ? (
                        <p className="text-gray-800 whitespace-pre-wrap">{template.condicionesPago}</p>
                    ) : (
                        <p className="text-gray-400 italic">No especificadas</p>
                    )}
                </div>

                {/* Métodos de Pago */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Métodos de Pago Aceptados</h3>
                    {template.metodosPagoAceptados && template.metodosPagoAceptados.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {template.metodosPagoAceptados.map(method => (
                                <span key={method} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                    {method}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 italic">No especificados</p>
                    )}
                </div>

                {/* Notas Adicionales */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Notas Adicionales</h3>
                    {template.notasAdicionales ? (
                        <p className="text-gray-800 whitespace-pre-wrap">{template.notasAdicionales}</p>
                    ) : (
                        <p className="text-gray-400 italic">Sin notas</p>
                    )}
                </div>

                {/* Términos y Condiciones */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Términos y Condiciones</h3>
                    {template.terminosCondiciones ? (
                        <p className="text-gray-800 whitespace-pre-wrap max-h-40 overflow-y-auto pr-2 custom-scrollbar text-sm leading-relaxed">
                            {template.terminosCondiciones}
                        </p>
                    ) : (
                        <p className="text-gray-400 italic">No especificados</p>
                    )}
                </div>
            </div>

            {/* Modal de Edición */}
            {showEditForm && (
                <TemplateForm
                    onClose={() => setShowEditForm(false)}
                    editingTemplate={template}
                />
            )}
        </div>
    );
}

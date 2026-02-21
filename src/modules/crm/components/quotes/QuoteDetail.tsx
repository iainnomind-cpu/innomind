import React from 'react';
import { ArrowLeft, Edit, Download, Send, FileText, Calendar, User } from 'lucide-react';
import { Quote } from '@/types';
import { format } from 'date-fns';
import { useCRM } from '@/context/CRMContext';

interface QuoteDetailProps {
    quote: Quote;
    onClose: () => void;
    onEdit: () => void;
}

const safeFormat = (value: any, fmt = 'dd/MM/yyyy') => {
    if (!value) return '-';
    try {
        let dateObj;
        if (value instanceof Date) {
            dateObj = value;
        } else if (value && typeof value.toDate === 'function') {
            dateObj = value.toDate();
        } else {
            dateObj = new Date(value);
        }
        return isNaN(dateObj.getTime()) ? '-' : format(dateObj, fmt);
    } catch {
        return '-';
    }
};

const QuoteDetail: React.FC<QuoteDetailProps> = ({ quote, onClose, onEdit }) => {
    const { prospects } = useCRM();
    const prospect = prospects.find(p => p.id === quote.prospectId);

    // @ts-ignore
    const isExpired = quote.vigencia ? new Date() > new Date(quote.vigencia) && quote.estado === 'Enviada' : false;
    const displayStatus = isExpired ? 'Vencida' : quote.estado;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={onClose}
                    className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Volver a cotizaciones
                </button>

                <div className="flex gap-2">
                    <button
                        onClick={onEdit}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Edit className="h-4 w-4" /> Editar
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <Download className="h-4 w-4" /> Descargar PDF
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        <Send className="h-4 w-4" /> Enviar
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    Cotización #{quote.numero}
                                </h1>
                                <p className="text-gray-600">Cliente: {prospect?.nombre || 'Desconocido'}</p>
                            </div>

                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${displayStatus === 'Borrador' ? 'bg-gray-100 text-gray-800' :
                                displayStatus === 'Enviada' ? 'bg-blue-100 text-blue-800' :
                                    displayStatus === 'Aceptada' ? 'bg-green-100 text-green-800' :
                                        displayStatus === 'Rechazada' ? 'bg-red-100 text-red-800' :
                                            'bg-orange-100 text-orange-800'
                                }`}>
                                {displayStatus}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="flex items-center text-gray-600">
                                <Calendar className="h-5 w-5 mr-2" />
                                <div>
                                    <div className="text-xs text-gray-500">Fecha de Emisión</div>
                                    <div className="font-medium">{safeFormat(quote.fecha)}</div>
                                </div>
                            </div>

                            <div className="flex items-center text-gray-600">
                                <Calendar className="h-5 w-5 mr-2" />
                                <div>
                                    <div className="text-xs text-gray-500">Vigencia</div>
                                    <div className={`font-medium ${isExpired ? 'text-red-600' : ''}`}>
                                        {safeFormat(quote.vigencia)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center text-gray-600">
                                <User className="h-5 w-5 mr-2" />
                                <div>
                                    <div className="text-xs text-gray-500">Correo</div>
                                    <div className="font-medium">{prospect?.correo || 'N/A'}</div>
                                </div>
                            </div>

                            <div className="flex items-center text-gray-600">
                                <FileText className="h-5 w-5 mr-2" />
                                <div>
                                    <div className="text-xs text-gray-500">Teléfono</div>
                                    <div className="font-medium">{prospect?.telefono || 'N/A'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Ítems de la Cotización</h3>

                        <div className="space-y-3">
                            {(quote.items || []).map((item, index) => (
                                <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">{index + 1}. {item.nombre}</h4>
                                            {item.descripcion && (
                                                <p className="text-sm text-gray-600 mt-1">{item.descripcion}</p>
                                            )}
                                        </div>
                                        <div className="text-right ml-4">
                                            <div className="font-bold text-gray-900">${(item.total || 0).toLocaleString()}</div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>Cantidad: {item.cantidad}</span>
                                        <span>Precio unitario: ${(item.precioUnitario || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t-2 border-gray-300">
                            <div className="flex justify-between items-center">
                                <span className="text-xl font-semibold text-gray-900">Total:</span>
                                <span className="text-3xl font-bold text-blue-600">
                                    ${(quote.total || 0).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {quote.notas && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Términos y Condiciones</h3>
                            <p className="text-gray-600 whitespace-pre-wrap">{quote.notas}</p>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium">${(quote.total || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Ítems:</span>
                                <span className="font-medium">{quote.items?.length || 0}</span>
                            </div>
                            <div className="flex justify-between pt-3 border-t border-gray-200">
                                <span className="text-gray-900 font-semibold">Total:</span>
                                <span className="font-bold text-blue-600">${(quote.total || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Cliente</h3>
                        <div className="space-y-3">
                            <div>
                                <div className="text-sm text-gray-500">Nombre</div>
                                <div className="font-medium">{prospect?.nombre || 'N/A'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Correo</div>
                                <div className="font-medium text-sm">{prospect?.correo || 'N/A'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Teléfono</div>
                                <div className="font-medium">{prospect?.telefono || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuoteDetail;

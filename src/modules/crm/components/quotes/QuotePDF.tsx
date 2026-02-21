import React from 'react';
import { Quote, CompanyProfile } from '@/types';
import { format } from 'date-fns';

interface QuotePDFProps {
    quote: Quote;
    prospect: any;
    company: CompanyProfile;
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

const QuotePDF: React.FC<QuotePDFProps> = ({ quote, prospect, company }) => {
    const primaryColor = company.colorPrimario || '#2563eb';

    return (
        <div
            id={`quote-pdf-${quote.id}`}
            className="bg-white mx-auto relative"
            style={{
                width: '210mm', // A4 width
                minHeight: '297mm', // A4 min-height
                padding: '20mm',
                boxSizing: 'border-box',
                fontFamily: 'Helvetica, Arial, sans-serif',
                color: '#333'
            }}
        >
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 pb-6" style={{ borderColor: primaryColor }}>
                <div className="w-1/2">
                    {company.logoUrl ? (
                        <img src={company.logoUrl} alt="Logo" style={{ maxHeight: '140px', maxWidth: '100%', objectFit: 'contain' }} />
                    ) : (
                        <h1 style={{ color: primaryColor, fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
                            {company.nombreEmpresa}
                        </h1>
                    )}
                </div>
                <div className="w-1/2 text-right">
                    <h2 className="text-4xl font-black text-gray-200 uppercase tracking-widest mb-2">COTIZACIÓN</h2>
                    <p className="text-lg font-bold text-gray-800">#{quote.numero}</p>
                    <p className="text-sm text-gray-500 mt-1">Fecha: {safeFormat(quote.fecha)}</p>
                    <p className="text-sm text-gray-500">Vigencia: {safeFormat(quote.vigencia)}</p>
                </div>
            </div>

            {/* Vendor & Client Info */}
            <div className="flex justify-between mt-8 mb-10 gap-8">
                <div className="w-1/2">
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-400">De (Emisor):</h3>
                    <p className="font-bold text-gray-900">{company.nombreEmpresa}</p>
                    {company.rfc && <p className="text-xs text-gray-600 mt-1">RFC: {company.rfc}</p>}
                    {company.direccion && <p className="text-xs text-gray-600 mt-1 w-3/4 leading-relaxed">{company.direccion}</p>}
                    {company.telefono && <p className="text-xs text-gray-600 mt-1">Tel: {company.telefono}</p>}
                    {company.email && <p className="text-xs text-blue-600 mt-1">{company.email}</p>}
                </div>
                <div className="w-1/2 bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-400">Para (Cliente):</h3>
                    <p className="font-bold text-gray-900 text-lg">{prospect.nombre}</p>
                    {prospect.empresa && <p className="text-sm text-gray-700 font-semibold">{prospect.empresa}</p>}
                    {prospect.direccion && <p className="text-xs text-gray-600 mt-1 leading-relaxed">{prospect.direccion}</p>}
                    <p className="text-xs text-gray-600 mt-1">Tel: {prospect.telefono}</p>
                    <p className="text-xs text-gray-600 mt-1">Email: {prospect.correo}</p>
                </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-8 border-collapse">
                <thead>
                    <tr style={{ backgroundColor: primaryColor, color: 'white' }}>
                        <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-lg">Descripción</th>
                        <th className="py-3 px-4 text-center text-xs font-semibold uppercase tracking-wider">Cant.</th>
                        <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider">P. Unitario</th>
                        <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider">Desc.</th>
                        <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider rounded-tr-lg">Importe</th>
                    </tr>
                </thead>
                <tbody>
                    {quote.items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-200">
                            <td className="py-4 px-4">
                                <p className="font-semibold text-gray-900 text-sm">{item.nombre}</p>
                                {item.descripcion && <p className="text-xs text-gray-500 mt-1">{item.descripcion}</p>}
                            </td>
                            <td className="py-4 px-4 text-center text-sm text-gray-700">{item.cantidad}</td>
                            <td className="py-4 px-4 text-right text-sm text-gray-700">${(item.precioUnitario || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="py-4 px-4 text-right text-xs text-gray-500">
                                {item.descuento ? (item.tipoDescuento === 'porcentaje' ? `${item.descuento}%` : `$${item.descuento}`) : '-'}
                            </td>
                            <td className="py-4 px-4 text-right font-medium text-sm text-gray-900">${(item.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-12">
                <div className="w-1/2 md:w-1/3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-semibold text-gray-600">Subtotal:</span>
                        <span className="text-sm font-medium text-gray-900">${(quote.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-semibold text-gray-600">IVA ({quote.ivaPorcentaje}%):</span>
                        <span className="text-sm font-medium text-gray-900">${(quote.ivaTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b-2" style={{ borderColor: primaryColor }}>
                        <span className="text-lg font-black text-gray-900">Total:</span>
                        <span className="text-xl font-black" style={{ color: primaryColor }}>${(quote.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>

            {/* Terms and Conds */}
            <div className="grid grid-cols-2 gap-8 text-xs">
                {quote.condicionesPago && (
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2 uppercase tracking-wide">Condiciones de Pago</h4>
                        <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{quote.condicionesPago}</p>
                    </div>
                )}

                {quote.metodosPagoAceptados && quote.metodosPagoAceptados.length > 0 && (
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2 uppercase tracking-wide">Métodos de Pago Aceptados</h4>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                            {quote.metodosPagoAceptados.map((m, i) => <li key={i}>{m}</li>)}
                        </ul>
                    </div>
                )}

                {quote.notasAdicionales && (
                    <div className="col-span-2 mt-4 bg-gray-50 p-4 rounded border border-gray-100 border-l-4" style={{ borderLeftColor: primaryColor }}>
                        <h4 className="font-bold text-gray-900 mb-1">Notas:</h4>
                        <p className="text-gray-600 whitespace-pre-wrap italic">{quote.notasAdicionales}</p>
                    </div>
                )}

                {quote.terminosCondiciones && (
                    <div className="col-span-2 mt-4">
                        <h4 className="font-bold text-gray-900 mb-1">Términos Legales:</h4>
                        <p className="text-gray-500 whitespace-pre-wrap leading-relaxed" style={{ fontSize: '10px' }}>{quote.terminosCondiciones}</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 left-0 right-0 px-[20mm] text-center">
                <div className="border-t border-gray-200 pt-4">
                    <p className="text-xs text-gray-400">
                        {company.nombreEmpresa} {company.sitioWeb ? `| ${company.sitioWeb}` : ''} {company.telefono ? `| Tel: ${company.telefono}` : ''}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 font-semibold">Gracias por su confianza.</p>
                </div>
            </div>
        </div>
    );
};

export default QuotePDF;

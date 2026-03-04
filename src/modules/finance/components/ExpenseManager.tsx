import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Search, Plus, Receipt, CheckCircle, Clock, X, UploadCloud, Check, FileText } from 'lucide-react';
import { FinanceDocument } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';

export default function ExpenseManager() {
    const { documents, updateDocumentStatus, addDocument } = useFinance();
    const [searchTerm, setSearchTerm] = useState('');

    const expenses = documents.filter(d => d.tipo === 'GASTO');

    const filteredExpenses = expenses.filter(e =>
        e.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.categoria && e.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalPendiente = expenses.filter(e => e.estado === 'PENDIENTE_APROBACION').reduce((sum, e) => sum + e.montoTotal, 0);
    const totalAprobado = expenses.filter(e => e.estado === 'PENDIENTE' || e.estado === 'PAGADO').reduce((sum, e) => sum + e.montoTotal, 0);

    const [expenseModalOpen, setExpenseModalOpen] = useState(false);

    const getStatusBadge = (doc: FinanceDocument) => {
        if (doc.estado === 'PAGADO') return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium flex items-center gap-1"><CheckCircle size={12} /> Reembolsado/Pagado</span>;
        if (doc.estado === 'PENDIENTE') return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium flex items-center gap-1"><Check size={12} /> Aprobado (Por Pagar)</span>;
        if (doc.estado === 'RECHAZADO') return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium flex items-center gap-1"><X size={12} /> Rechazado</span>;
        return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-medium flex items-center gap-1"><Clock size={12} /> Por Aprobar</span>;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Receipt size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Gastos Registrados</p>
                        <p className="text-2xl font-bold text-gray-900">{expenses.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Pendientes de Aprobación</p>
                        <p className="text-2xl font-bold text-gray-900">${totalPendiente.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-emerald-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-emerald-600 font-medium">Gasto Autorizado</p>
                        <p className="text-2xl font-bold text-emerald-700">${totalAprobado.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Actions & Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por concepto o categoría..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <button
                    onClick={() => setExpenseModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                    <Plus size={20} /> Nuevo Gasto
                </button>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Fecha / Ticket</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Concepto</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Categoría</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Monto Total</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Aprobación Admin</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No se han registrado gastos aún.
                                    </td>
                                </tr>
                            ) : (
                                filteredExpenses.map(doc => (
                                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{format(doc.fechaEmision, "dd MMM yyyy", { locale: es })}</div>
                                            {doc.evidenciaUrl && (
                                                <a href={doc.evidenciaUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline flex items-center gap-1 mt-1">
                                                    <FileText size={12} /> Ver Ticket
                                                </a>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 line-clamp-2">{doc.concepto}</div>
                                            <div className="text-xs text-gray-500">Solicitante: {doc.proveedorNombre || 'Empleado Interno'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                                                {doc.categoria || 'Sin Categorizar'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                                            ${doc.montoTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                {getStatusBadge(doc)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            {doc.estado === 'PENDIENTE_APROBACION' && (
                                                <>
                                                    <button
                                                        onClick={() => updateDocumentStatus(doc.id, 'PENDIENTE')}
                                                        className="inline-flex items-center p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-sm font-medium transition-colors"
                                                        title="Aprobar para Pago"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => updateDocumentStatus(doc.id, 'RECHAZADO')}
                                                        className="inline-flex items-center p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                                                        title="Rechazar"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </>
                                            )}
                                            {doc.estado === 'PENDIENTE' && (
                                                <span className="text-xs text-gray-500 italic">Esperando Pago en CxP</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {expenseModalOpen && (
                <NewExpenseModal onClose={() => setExpenseModalOpen(false)} onAdd={addDocument} />
            )}
        </div>
    );
}

function NewExpenseModal({ onClose, onAdd }: { onClose: () => void, onAdd: (doc: any) => Promise<any> }) {
    const [concepto, setConcepto] = useState('');
    const [montoTotal, setMontoTotal] = useState(0);
    const [categoria, setCategoria] = useState('Viáticos');
    const [estado, setEstado] = useState('PENDIENTE_APROBACION');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [file, setFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFileError('');
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(selectedFile.type)) {
            setFileError('Formato no permitido. Solo se aceptan PDF, JPG y PNG.');
            return;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (selectedFile.size > maxSize) {
            setFileError('El archivo supera el tamaño máximo permitido de 5MB.');
            return;
        }

        setFile(selectedFile);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFileError('');

        let evidenciaUrl = '';

        if (file) {
            try {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `gastos/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('expense-evidence')
                    .upload(filePath, file);

                if (uploadError) {
                    throw uploadError;
                }

                const { data: publicUrlData } = supabase.storage
                    .from('expense-evidence')
                    .getPublicUrl(filePath);

                evidenciaUrl = publicUrlData.publicUrl;
            } catch (err: any) {
                console.error("Error al subir archivo:", err);
                setFileError('Error al subir la evidencia. Inténtalo de nuevo.');
                setIsSubmitting(false);
                return; // Evitamos guardar el gasto si la subida falló inesperadamente
            }
        }

        await onAdd({
            tipo: 'GASTO',
            estado: estado,
            montoTotal,
            moneda: 'MXN',
            fechaEmision: new Date(),
            categoria,
            concepto,
            proveedorNombre: 'Empleado Logueado', // TODO: Use real context
            evidenciaUrl: evidenciaUrl || undefined,
        });

        setIsSubmitting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col border border-gray-200">
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Registrar Gasto</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Concepto / Motivo *</label>
                        <input
                            type="text"
                            value={concepto}
                            onChange={e => setConcepto(e.target.value)}
                            placeholder="Ej. Comida con cliente..."
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-indigo-500 outline-none"
                            required autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                                <input
                                    type="number"
                                    min="0.01" step="0.01"
                                    value={montoTotal}
                                    onChange={e => setMontoTotal(parseFloat(e.target.value) || 0)}
                                    className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-indigo-500 outline-none"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                            <select
                                value={categoria}
                                onChange={e => setCategoria(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-indigo-500 outline-none bg-white"
                            >
                                <option value="Viáticos">Viáticos</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Materiales">Materiales / Insumos</option>
                                <option value="Suscripciones">Servicios / Suscripciones</option>
                                <option value="Otros">Otros</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Evidencia del gasto (Opcional)</label>

                        {file ? (
                            <div className="flex items-center justify-between p-3 border border-indigo-100 bg-indigo-50 rounded-lg">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <FileText className="text-indigo-500 flex-shrink-0" size={20} />
                                    <span className="text-sm font-medium text-indigo-900 truncate">{file.name}</span>
                                    <span className="text-xs text-indigo-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setFile(null); setFileError(''); }}
                                    className="p-1 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-md transition-colors"
                                    title="Eliminar archivo"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors group">
                                <input
                                    type="file"
                                    accept=".pdf, .jpg, .jpeg, .png"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    disabled={isSubmitting}
                                />
                                <UploadCloud className="mx-auto h-8 w-8 text-indigo-400 mb-2 group-hover:text-indigo-500 transition-colors" />
                                <p className="text-sm font-medium text-indigo-600">Subir foto o PDF</p>
                                <p className="text-xs text-gray-400 mt-1">Máx. 5MB (PDF, JPG, PNG)</p>
                            </div>
                        )}
                        {fileError && <p className="text-xs text-red-500 mt-2 font-medium">{fileError}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Flujo Asignado (Simulación Admin)</label>
                        <select
                            value={estado}
                            onChange={e => setEstado(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-indigo-500 outline-none bg-white font-medium"
                        >
                            <option value="PENDIENTE_APROBACION" className="text-amber-700">Requiere Aprobación (Empleado normal)</option>
                            <option value="PENDIENTE" className="text-emerald-700">Auto-aprobar y mandar a CxP (Managers)</option>
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50">Cancelar</button>
                        <button type="submit" disabled={isSubmitting || montoTotal <= 0 || !concepto} className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                            Guardar Gasto
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

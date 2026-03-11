import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Search, Plus, Receipt, CheckCircle, Clock, X, UploadCloud, Check, FileText, User } from 'lucide-react';
import { Expense } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ExpenseManager() {
    const { expenses, updateExpenseStatus, addExpense } = useFinance();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredExpenses = expenses.filter(e =>
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.category && e.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalPendiente = expenses.filter(e => e.status === 'pending_approval').reduce((sum, e) => sum + e.amount, 0);
    const totalAprobado = expenses.filter(e => e.status === 'approved' || e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);

    const [expenseModalOpen, setExpenseModalOpen] = useState(false);

    const getStatusBadge = (status: Expense['status']) => {
        if (status === 'paid') return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium flex items-center gap-1"><CheckCircle size={12} /> Pagado / Reembolsado</span>;
        if (status === 'approved') return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium flex items-center gap-1"><Check size={12} /> Aprobado</span>;
        if (status === 'rejected') return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium flex items-center gap-1"><X size={12} /> Rechazado</span>;
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
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Método Pago</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Monto Total</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Aprobación Admin</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No se han registrado gastos aún.
                                    </td>
                                </tr>
                            ) : (
                                filteredExpenses.map(exp => (
                                    <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{format(exp.expense_date, "dd MMM yyyy", { locale: es })}</div>
                                            {exp.receipt_url && (
                                                <a href={exp.receipt_url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline flex items-center gap-1 mt-1">
                                                    <FileText size={12} /> Ver Ticket
                                                </a>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 line-clamp-2">{exp.description}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                <User size={10} /> Empleado ID: {exp.employee_id.substring(0, 8)}...
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                                                {exp.category || 'Sin Categorizar'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${exp.paid_by === 'employee' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'}`}>
                                                {exp.paid_by === 'employee' ? 'REEMBOLSO' : 'CAJA / CTA'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                                            ${exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                {getStatusBadge(exp.status)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            {exp.status === 'pending_approval' && (
                                                <>
                                                    <button
                                                        onClick={() => updateExpenseStatus(exp.id, 'approved')}
                                                        className="inline-flex items-center p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-sm font-medium transition-colors"
                                                        title="Aprobar para Pago"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => updateExpenseStatus(exp.id, 'rejected')}
                                                        className="inline-flex items-center p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                                                        title="Rechazar"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </>
                                            )}
                                            {exp.status === 'approved' && exp.paid_by === 'employee' && (
                                                <span className="text-xs text-amber-600 font-bold animate-pulse">Generando CxP...</span>
                                            )}
                                            {exp.status === 'approved' && exp.paid_by === 'company' && (
                                                <span className="text-xs text-emerald-600 font-bold">Autorizado</span>
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
                <NewExpenseModal onClose={() => setExpenseModalOpen(false)} onAdd={addExpense} />
            )}
        </div>
    );
}

function NewExpenseModal({ onClose, onAdd }: { onClose: () => void, onAdd: (expense: any) => Promise<any> }) {
    const { user } = useAuth();
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState(0);
    const [category, setCategory] = useState('Viáticos');
    const [paidBy, setPaidBy] = useState<'employee' | 'company'>('employee');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        let receipt_url = '';

        if (file) {
            try {
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `receipts/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('expense-receipts')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('expense-receipts')
                    .getPublicUrl(filePath);

                receipt_url = publicUrl;
            } catch (error) {
                console.error('Error uploading file:', error);
                alert('Error al subir el archivo de evidencia');
                setIsSubmitting(false);
                return;
            }
        }

        await onAdd({
            employee_id: user.id,
            amount: amount,
            category,
            description,
            expense_date: new Date(),
            paid_by: paidBy,
            receipt_url
        });
        setIsSubmitting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col border border-gray-200 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Receipt size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Registrar Gasto</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Concepto / Motivo *</label>
                        <input
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Ej. Comida con cliente..."
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-medium"
                            required autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Monto *</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                <input
                                    type="number"
                                    min="0.01" step="0.01"
                                    value={amount}
                                    onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                                    className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-bold text-lg"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Categoría</label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-medium appearance-none"
                            >
                                <option value="Viáticos">Viáticos</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Materiales">Materiales / Insumos</option>
                                <option value="Suscripciones">Servicios / Suscripciones</option>
                                <option value="Otros">Otros</option>
                            </select>
                        </div>
                    </div>

                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                        <label className="block text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">¿Quién realizó el pago?</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setPaidBy('employee')}
                                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${paidBy === 'employee' ? 'bg-white border-indigo-500 shadow-md text-indigo-700' : 'bg-transparent border-gray-200 text-gray-400 hover:border-indigo-200'}`}
                            >
                                <User size={20} />
                                <span className="text-xs font-black">EMPLEADO</span>
                                <span className="text-[10px] opacity-70">(Reembolso)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaidBy('company')}
                                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${paidBy === 'company' ? 'bg-white border-indigo-500 shadow-md text-indigo-700' : 'bg-transparent border-gray-200 text-gray-400 hover:border-indigo-200'}`}
                            >
                                <Receipt size={20} />
                                <span className="text-xs font-black">EMPRESA</span>
                                <span className="text-[10px] opacity-70">(Directo)</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Evidencia</label>
                        <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:bg-indigo-50/30 hover:border-indigo-300 transition-all group overflow-hidden">
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            {file ? (
                                <div className="flex items-center justify-center gap-2 text-indigo-600 font-medium">
                                    <FileText size={20} />
                                    <span className="truncate max-w-[200px]">{file.name}</span>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                        }}
                                        className="p-1 hover:bg-indigo-100 rounded-full text-red-500 z-20"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <UploadCloud className="mx-auto h-6 w-6 text-gray-300 group-hover:text-indigo-400 mb-1" />
                                    <p className="text-xs font-bold text-gray-400 group-hover:text-indigo-600">Subir ticket / factura</p>
                                    <p className="text-[10px] text-gray-400 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition-colors uppercase text-xs tracking-widest">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || amount <= 0 || !description}
                            className="flex-1 px-4 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-100 transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? 'Guardando...' : 'Guardar Gasto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

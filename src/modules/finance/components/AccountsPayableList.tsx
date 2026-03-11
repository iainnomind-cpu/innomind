import { useState } from 'react';
import { useAccountsPayable } from '@/context/AccountsPayableContext';
import { Search, FileText, CheckCircle, AlertCircle, Clock, CreditCard, Loader2, User } from 'lucide-react';
import { AccountsPayable } from '@/types';
import { format, isPast, isToday } from 'date-fns';
import { es } from 'date-fns/locale';

interface AccountsPayableListProps {
    onSelectPayable: (payable: AccountsPayable) => void;
    onAddPayment: (payable: AccountsPayable) => void;
}

export default function AccountsPayableList({ onSelectPayable, onAddPayment }: AccountsPayableListProps) {
    const { payables, isLoading } = useAccountsPayable();
    const [searchTerm, setSearchTerm] = useState('');

    if (isLoading && payables.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-purple-600" size={32} />
            </div>
        );
    }

    const filteredPayables = payables.filter(p =>
        p.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.supplier?.nombreComercial && p.supplier.nombreComercial.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.supplier_type === 'employee' && 'reembolso empleado'.includes(searchTerm.toLowerCase())) ||
        (p.supplier_type === 'company_expense' && 'gasto directo empresa'.includes(searchTerm.toLowerCase()))
    );

    const totalPendiente = payables.reduce((sum, p) => sum + Number(p.balance_due), 0);
    const totalVencido = payables
        .filter(p => p.status === 'overdue' || (p.due_date && isPast(new Date(p.due_date)) && !isToday(new Date(p.due_date)) && p.balance_due > 0))
        .reduce((sum, p) => sum + Number(p.balance_due), 0);

    const getStatusBadge = (payable: AccountsPayable) => {
        if (payable.status === 'paid') return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium flex items-center gap-1"><CheckCircle size={12} /> Pagado</span>;

        const isVencido = payable.status === 'overdue' || (payable.due_date && isPast(new Date(payable.due_date)) && !isToday(new Date(payable.due_date)) && payable.balance_due > 0);
        if (isVencido) return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium flex items-center gap-1"><AlertCircle size={12} /> Vencido</span>;

        if (payable.status === 'scheduled') return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium flex items-center gap-1"><Clock size={12} /> Programado</span>;

        return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-medium flex items-center gap-1"><Clock size={12} /> Pendiente</span>;
    };

    return (
        <div className="flex flex-col gap-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Facturas por Pagar</p>
                        <p className="text-2xl font-bold text-gray-900">{payables.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Por Pagar (Total)</p>
                        <p className="text-2xl font-bold text-gray-900">${totalPendiente.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-red-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-red-500 font-medium">Monto Vencido</p>
                        <p className="text-2xl font-bold text-red-600">${totalVencido.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por proveedor o concepto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto h-full">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Proveedor</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Concepto / Fecha</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vencimiento</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Pendiente</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPayables.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 italic">
                                        No se encontraron cuentas por pagar
                                    </td>
                                </tr>
                            ) : (
                                filteredPayables.map(p => (
                                    <tr
                                        key={p.id}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                        onClick={() => onSelectPayable(p)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                                                {p.supplier_type === 'employee' ? (
                                                    <span className="flex items-center gap-1 text-amber-600">
                                                        <User size={14} /> Reembolso (Empleado)
                                                    </span>
                                                ) : p.supplier_type === 'company_expense' ? (
                                                    <span className="flex items-center gap-1 text-indigo-600">
                                                        <CreditCard size={14} /> Gasto Directo (Empresa)
                                                    </span>
                                                ) : (
                                                    p.supplier?.nombreComercial || 'Proveedor Especial'
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {p.supplier_type === 'employee' ? `Ref: ${p.employee_id?.substring(0, 8)}...` :
                                                    p.supplier_type === 'company_expense' ? 'Gasto Corporativo' :
                                                        `RFC: ${p.supplier?.rfc || 'S/RFC'}`}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 line-clamp-1">{p.concept}</div>
                                            <div className="text-xs text-gray-500">{format(new Date(p.created_at), "dd MMM yyyy", { locale: es })}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`text-sm font-medium ${isPast(new Date(p.due_date)) && !isToday(new Date(p.due_date)) && p.balance_due > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                                {format(new Date(p.due_date), "dd MMM yyyy", { locale: es })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                                            ${Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-red-600">
                                            ${Number(p.balance_due).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                {getStatusBadge(p)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onAddPayment(p);
                                                }}
                                                disabled={p.balance_due <= 0}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:bg-gray-200 transition-all shadow-sm active:scale-95"
                                            >
                                                <CreditCard size={16} />
                                                <span>Pagar</span>
                                            </button>
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

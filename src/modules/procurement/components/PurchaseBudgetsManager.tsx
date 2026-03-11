import { useState } from 'react';
import { useProcurement } from '@/context/ProcurementContext';
import {
    Wallet,
    Plus,
    Calendar,
    TrendingUp,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Edit3
} from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PurchaseBudgetsManager() {
    const { budgets } = useProcurement();
    const [selectedDate, setSelectedDate] = useState(new Date());

    const currentMonthBudgets = budgets.filter(b => {
        const bDate = new Date(b.period_date);
        return bDate.getMonth() === selectedDate.getMonth() && bDate.getFullYear() === selectedDate.getFullYear();
    });

    const totalLimit = currentMonthBudgets.reduce((sum, b) => sum + b.limit_amount, 0);
    const totalSpent = currentMonthBudgets.reduce((sum, b) => sum + b.spent_amount, 0);
    const totalPercent = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Wallet className="text-blue-600" /> Presupuestos de Compra
                    </h2>
                    <p className="text-gray-500">Control de gasto mensual por categorías.</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                    <button
                        onClick={() => setSelectedDate(subMonths(selectedDate, 1))}
                        className="p-1 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2 px-2 font-bold text-gray-900 min-w-[140px] justify-center">
                        <Calendar size={18} className="text-blue-600" />
                        <span className="capitalize">{format(selectedDate, 'MMMM yyyy', { locale: es })}</span>
                    </div>
                    <button
                        onClick={() => setSelectedDate(addMonths(selectedDate, 1))}
                        className="p-1 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Total Summary */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">Ejecución Presupuestal Total</p>
                        <h3 className="text-3xl font-black text-gray-900">
                            ${totalSpent.toLocaleString()}
                            <span className="text-lg text-gray-400 font-normal ml-2">/ ${totalLimit.toLocaleString()}</span>
                        </h3>
                    </div>
                    <div className={`px-4 py-2 rounded-full font-black text-sm ${totalPercent > 90 ? 'bg-red-100 text-red-700' :
                        totalPercent > 70 ? 'bg-amber-100 text-amber-700' :
                            'bg-emerald-100 text-emerald-700'
                        }`}>
                        {totalPercent.toFixed(1)}% utilizado
                    </div>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ${totalPercent > 90 ? 'bg-red-500' :
                            totalPercent > 70 ? 'bg-amber-500' :
                                'bg-blue-600'
                            }`}
                        style={{ width: `${Math.min(totalPercent, 100)}%` }}
                    />
                </div>
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {currentMonthBudgets.map(budget => (
                    <BudgetCard key={budget.id} budget={budget} />
                ))}

                <button className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition group min-h-[220px]">
                    <div className="p-3 bg-gray-50 text-gray-400 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600 transition mb-3">
                        <Plus size={32} />
                    </div>
                    <span className="font-bold text-gray-500 group-hover:text-blue-700">Configurar presupuesto</span>
                </button>
            </div>

            {currentMonthBudgets.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                    <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">No hay presupuestos configurados para {format(selectedDate, 'MMMM', { locale: es })}.</p>
                </div>
            )}
        </div>
    );
}

function BudgetCard({ budget }: { budget: any }) {
    const percent = budget.limit_amount > 0 ? (budget.spent_amount / budget.limit_amount) * 100 : 0;
    const remaining = budget.limit_amount - budget.spent_amount;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition">
            <div className="p-5 flex-1 space-y-4">
                <div className="flex justify-between items-start">
                    <h4 className="font-black text-gray-900 uppercase tracking-tight">{budget.category}</h4>
                    <button className="text-gray-400 hover:text-blue-600 transition">
                        <Edit3 size={18} />
                    </button>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Consumido</span>
                        <span className="font-bold text-gray-900">${budget.spent_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Límite Mensual</span>
                        <span className="font-bold text-gray-900">${budget.limit_amount.toLocaleString()}</span>
                    </div>
                </div>

                <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${percent > 90 ? 'bg-red-500' :
                            percent > 70 ? 'bg-amber-500' :
                                'bg-emerald-500'
                            }`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                </div>

                <div className="flex items-center gap-2 pt-2">
                    <div className={`p-1.5 rounded-lg ${remaining < 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        <TrendingUp size={16} />
                    </div>
                    <span className={`text-sm font-bold ${remaining < 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                        {remaining < 0 ? `Déficit: $${Math.abs(remaining).toLocaleString()}` : `Disponible: $${remaining.toLocaleString()}`}
                    </span>
                </div>
            </div>
        </div>
    );
}

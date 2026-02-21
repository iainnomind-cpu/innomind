import React from 'react';
import { Routes, Route, Navigate, Outlet, NavLink } from 'react-router-dom';
import { FileText, Calendar, Building, Receipt } from 'lucide-react';

import Receivables from './components/Receivables';
import Payables from './components/Payables';
import ExpenseManager from './components/ExpenseManager';
import Treasury from './components/Treasury';
export default function FinanceLayout() {
    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Cabecera / Sub-navegación local de Finanzas */}
            <div className="bg-white border-b border-gray-200 px-6 pt-4">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                        <Receipt size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Finanzas y Tesorería</h1>
                        <p className="text-sm text-gray-500">Gestión centralizada de caja, cobros y pagos</p>
                    </div>
                </div>

                <div className="flex gap-6 overflow-x-auto hide-scrollbar">
                    <NavLink
                        to="/crm/finance/treasury"
                        className={({ isActive }) =>
                            `whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${isActive ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                        }
                    >
                        <div className="flex items-center gap-2">
                            <Building size={16} />
                            Tesorería / Cash Flow
                        </div>
                    </NavLink>
                    <NavLink
                        to="/crm/finance/receivables"
                        className={({ isActive }) =>
                            `whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${isActive ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                        }
                    >
                        <div className="flex items-center gap-2">
                            <FileText size={16} />
                            Cuentas por Cobrar
                        </div>
                    </NavLink>
                    <NavLink
                        to="/crm/finance/payables"
                        className={({ isActive }) =>
                            `whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${isActive ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                        }
                    >
                        <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            Cuentas por Pagar
                        </div>
                    </NavLink>
                    <NavLink
                        to="/crm/finance/expenses"
                        className={({ isActive }) =>
                            `whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${isActive ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                        }
                    >
                        <div className="flex items-center gap-2">
                            <Receipt size={16} />
                            Gastos y Reembolsos
                        </div>
                    </NavLink>
                </div>
            </div>

            {/* Contenido Dinámico */}
            <div className="flex-1 overflow-auto">
                <Routes>
                    <Route index element={<Navigate to="treasury" replace />} />
                    <Route path="treasury" element={<Treasury />} />
                    <Route path="receivables" element={<Receivables />} />
                    <Route path="payables" element={<Payables />} />
                    <Route path="expenses" element={<ExpenseManager />} />
                </Routes>
            </div>
        </div>
    );
}

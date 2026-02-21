import React from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Truck, ShoppingCart, CheckSquare, PackageOpen } from 'lucide-react';

import SupplierDirectory from './components/SupplierDirectory';
import PurchaseOrdersManager from './components/PurchaseOrdersManager';
import ApprovalsManager from './components/ApprovalsManager';
import MerchandiseReceptionManager from './components/MerchandiseReceptionManager';

export default function ProcurementLayout() {
    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Sup-navbar module specific */}
            <div className="bg-white border-b border-gray-200 px-6 pt-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ShoppingCart className="text-blue-600" />
                    Compras y Proveedores
                </h1>

                <div className="flex gap-6 overflow-x-auto hide-scrollbar">
                    <NavLink
                        to="suppliers"
                        className={({ isActive }) =>
                            `whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${isActive ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`
                        }
                    >
                        <div className="flex items-center gap-2">
                            <Truck size={16} />
                            Directorio de Proveedores
                        </div>
                    </NavLink>

                    <NavLink
                        to="orders"
                        className={({ isActive }) =>
                            `whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${isActive ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`
                        }
                    >
                        <div className="flex items-center gap-2">
                            <ShoppingCart size={16} />
                            Órdenes de Compra
                        </div>
                    </NavLink>

                    <NavLink
                        to="approvals"
                        className={({ isActive }) =>
                            `whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${isActive ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`
                        }
                    >
                        <div className="flex items-center gap-2">
                            <CheckSquare size={16} />
                            Aprobaciones Pendientes
                        </div>
                    </NavLink>

                    <NavLink
                        to="receptions"
                        className={({ isActive }) =>
                            `whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${isActive ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`
                        }
                    >
                        <div className="flex items-center gap-2">
                            <PackageOpen size={16} />
                            Recepción de Almacén
                        </div>
                    </NavLink>
                </div>
            </div>

            {/* Sub-routes Content */}
            <div className="flex-1 overflow-auto">
                <Routes>
                    <Route path="/" element={<Navigate to="suppliers" replace />} />
                    <Route path="suppliers/*" element={<SupplierDirectory />} />
                    <Route path="orders/*" element={<PurchaseOrdersManager />} />
                    <Route path="approvals" element={<ApprovalsManager />} />
                    <Route path="receptions" element={<MerchandiseReceptionManager />} />
                </Routes>
            </div>
        </div>
    );
}

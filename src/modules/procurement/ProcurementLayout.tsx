import { Routes, Route, NavLink, Navigate, useParams, useNavigate } from 'react-router-dom';
import { Truck, ShoppingCart, CheckSquare, PackageOpen, LayoutDashboard, ClipboardList, Wallet } from 'lucide-react';

import SupplierDirectory from './components/SupplierDirectory';
import PurchaseOrdersManager from './components/PurchaseOrdersManager';
import ApprovalsManager from './components/ApprovalsManager';
import MerchandiseReceptionManager from './components/MerchandiseReceptionManager';
import ProcurementDashboard from './components/ProcurementDashboard';
import PurchaseRequestsManager from './components/PurchaseRequestsManager';
import PurchaseBudgetsManager from './components/PurchaseBudgetsManager';
import PurchaseOrderForm from './components/PurchaseOrderForm';
import PurchaseOrderDetail from '@/pages/compras/PurchaseOrderDetail';
import PurchaseRequestDetail from './components/PurchaseRequestDetail';

export default function ProcurementLayout() {
    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Sup-navbar module specific */}
            <div className="bg-white border-b border-gray-200 px-6 pt-4">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <ShoppingCart size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Compras y Proveedores</h1>
                        <p className="text-sm text-gray-500">Gestión de abastecimiento, órdenes y recepciones</p>
                    </div>
                </div>

                <div className="flex gap-6 overflow-x-auto hide-scrollbar">
                    <NavLink
                        to="/compras"
                        end
                        className={({ isActive }) =>
                            `whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${isActive ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`
                        }
                    >
                        <div className="flex items-center gap-2">
                            <LayoutDashboard size={16} />
                            Dashboard
                        </div>
                    </NavLink>

                    <NavLink
                        to="/compras/proveedores"
                        className={({ isActive }) =>
                            `whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${isActive ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`
                        }
                    >
                        <div className="flex items-center gap-2">
                            <Truck size={16} />
                            Proveedores
                        </div>
                    </NavLink>

                    <NavLink
                        to="/compras/solicitudes"
                        className={({ isActive }) =>
                            `whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${isActive ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`
                        }
                    >
                        <div className="flex items-center gap-2">
                            <ClipboardList size={16} />
                            Solicitudes
                        </div>
                    </NavLink>

                    <NavLink
                        to="/compras/ordenes"
                        className={({ isActive }) =>
                            `whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${isActive ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`
                        }
                    >
                        <div className="flex items-center gap-2">
                            <ShoppingCart size={16} />
                            OC
                        </div>
                    </NavLink>

                    <NavLink
                        to="/compras/aprobaciones"
                        className={({ isActive }) =>
                            `whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${isActive ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`
                        }
                    >
                        <div className="flex items-center gap-2">
                            <CheckSquare size={16} />
                            Aprobaciones
                        </div>
                    </NavLink>

                    <NavLink
                        to="/compras/recepciones"
                        className={({ isActive }) =>
                            `whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${isActive ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`
                        }
                    >
                        <div className="flex items-center gap-2">
                            <PackageOpen size={16} />
                            Recepciones
                        </div>
                    </NavLink>

                    <NavLink
                        to="/compras/presupuestos"
                        className={({ isActive }) =>
                            `whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${isActive ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`
                        }
                    >
                        <div className="flex items-center gap-2">
                            <Wallet size={16} />
                            Presupuestos
                        </div>
                    </NavLink>
                </div>
            </div>

            {/* Sub-routes Content */}
            <div className="flex-1 overflow-auto">
                <Routes>
                    <Route index element={<ProcurementDashboard />} />

                    <Route path="proveedores/*" element={<SupplierDirectory />} />

                    <Route path="solicitudes" element={<PurchaseRequestsManager />} />
                    <Route path="solicitudes/:id" element={<PurchaseRequestDetail />} />

                    <Route path="ordenes" element={<PurchaseOrdersManager />} />
                    <Route path="ordenes/:id" element={<PurchaseOrderDetail />} />
                    <Route path="ordenes/edit/:id" element={<PurchaseOrderEditWrapper />} />

                    <Route path="aprobaciones" element={<ApprovalsManager />} />
                    <Route path="recepciones" element={<MerchandiseReceptionManager />} />
                    <Route path="presupuestos" element={<PurchaseBudgetsManager />} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/compras" replace />} />
                </Routes>
            </div>
        </div>
    );
}

function PurchaseOrderEditWrapper() {
    const { id } = useParams();
    const navigate = useNavigate();
    return <PurchaseOrderForm orderId={id} onClose={() => navigate('/compras/ordenes')} />;
}

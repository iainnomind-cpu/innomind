import { Outlet, NavLink } from 'react-router-dom';
import { Package, Warehouse, ActivitySquare } from 'lucide-react';

export default function InventoryLayout() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-gray-900 ">Inventario & Catálogo</h1>
                <p className="text-gray-500 text-sm">
                    Gestiona tu maestro de productos, servicios, sucursales y control de stock.
                </p>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 ">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <NavLink
                        to="/crm/inventory"
                        end
                        className={({ isActive }) =>
                            `whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${isActive
                                ? 'border-blue-500 text-blue-600 '
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 '
                            }`
                        }
                    >
                        <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Catálogo Maestro
                        </div>
                    </NavLink>
                    <NavLink
                        to="/crm/inventory/stock"
                        className={({ isActive }) =>
                            `whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${isActive
                                ? 'border-blue-500 text-blue-600 '
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 '
                            }`
                        }
                    >
                        <div className="flex items-center gap-2">
                            <Warehouse className="h-4 w-4" />
                            Control de Stock
                        </div>
                    </NavLink>
                    <NavLink
                        to="/crm/inventory/movements"
                        className={({ isActive }) =>
                            `whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${isActive
                                ? 'border-blue-500 text-blue-600 '
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 '
                            }`
                        }
                    >
                        <div className="flex items-center gap-2">
                            <ActivitySquare className="h-4 w-4" />
                            Movimientos
                        </div>
                    </NavLink>
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="mt-6">
                <Outlet />
            </div>
        </div>
    );
}

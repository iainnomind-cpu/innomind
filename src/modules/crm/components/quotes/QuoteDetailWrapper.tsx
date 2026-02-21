
import { NavLink, Outlet } from 'react-router-dom';
import { FileText, Package, Copy } from 'lucide-react';

export default function QuoteDetailWrapper() {
    return (
        <div className="p-6 space-y-6">
            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <NavLink
                        to="/crm/quotes"
                        end
                        className={({ isActive }) =>
                            `whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${isActive
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`
                        }
                    >
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Cotizaciones
                        </div>
                    </NavLink>
                    <NavLink
                        to="/crm/quotes/catalogo"
                        className={({ isActive }) =>
                            `whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${isActive
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`
                        }
                    >
                        <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Catálogo
                        </div>
                    </NavLink>
                    <NavLink
                        to="/crm/quotes/plantillas"
                        className={({ isActive }) =>
                            `whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${isActive
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`
                        }
                    >
                        <div className="flex items-center gap-2">
                            <Copy className="h-4 w-4" />
                            Plantillas
                        </div>
                    </NavLink>
                </nav>
            </div>

            {/* Contenido principal según la ruta */}
            <div className="mt-6">
                <Outlet />
            </div>
        </div>
    );
}

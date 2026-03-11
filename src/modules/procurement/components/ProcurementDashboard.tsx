import React from 'react';
import { useProcurement } from '@/context/ProcurementContext';
import {
    TrendingUp,
    Clock,
    Truck,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    ShoppingCart,
    BarChart3
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

export default function ProcurementDashboard() {
    const { suppliers, purchaseOrders, loading } = useProcurement();

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // --- KPI CALCS ---
    const totalSpend = purchaseOrders
        .filter(o => o.estado !== 'cancelada')
        .reduce((sum, o) => sum + (o.total_amount || 0), 0);

    const monthlySpendData = [
        { name: 'Ene', spend: 45000 },
        { name: 'Feb', spend: 52000 },
        { name: 'Mar', spend: 48000 },
        { name: 'Abr', spend: 61000 },
        { name: 'May', spend: totalSpend > 0 ? totalSpend : 0 }
    ];

    const categoryData = [
        { name: 'Insumos', value: 400 },
        { name: 'Materia Prima', value: 300 },
        { name: 'Servicios', value: 300 },
        { name: 'Equipos', value: 200 },
    ];

    const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'];

    const pendingOrders = purchaseOrders.filter(o => o.estado === 'pendiente').length;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Inteligencia de Suministros</h2>
                    <p className="text-gray-500">Resumen operativo y financiero de compras.</p>
                </div>
                <div className="bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 flex items-center gap-2">
                    <TrendingUp className="text-emerald-600" size={20} />
                    <span className="text-emerald-700 font-bold">Eficiencia +12.5%</span>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Gasto Total Acumulado"
                    value={`$${totalSpend.toLocaleString()}`}
                    change="+8%"
                    isUp={true}
                    icon={<DollarSign className="text-blue-600" />}
                    color="blue"
                />
                <MetricCard
                    title="Órdenes Pendientes"
                    value={pendingOrders}
                    change="-2"
                    isUp={false}
                    icon={<ShoppingCart className="text-amber-600" />}
                    color="amber"
                />
                <MetricCard
                    title="Proveedores Activos"
                    value={suppliers.filter(s => s.activo).length}
                    change="+1"
                    isUp={true}
                    icon={<Truck className="text-emerald-600" />}
                    color="emerald"
                />
                <MetricCard
                    title="Entregas a Tiempo"
                    value="94%"
                    change="+2%"
                    isUp={true}
                    icon={<Clock className="text-indigo-600" />}
                    color="indigo"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Trend Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <BarChart3 size={20} className="text-blue-600" /> Tendencia de Gastos
                        </h3>
                        <select className="text-sm border-none bg-gray-50 rounded-lg px-3 py-1 outline-none">
                            <option>Últimos 6 meses</option>
                            <option>Este año</option>
                        </select>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlySpendData}>
                                <defs>
                                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `$${val / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(val: any) => [`$${(val || 0).toLocaleString()}`, 'Gasto']}
                                />
                                <Area type="monotone" dataKey="spend" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart / Distribution */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-6">Gasto por Categoría</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                        {categoryData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-gray-600">{entry.name}</span>
                                </div>
                                <span className="font-bold text-gray-900">{entry.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Section: Recent Activity & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Órdenes Críticas</h3>
                    <div className="space-y-4">
                        {purchaseOrders.slice(0, 3).map(order => (
                            <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div>
                                    <div className="font-bold text-gray-900">#{order.numero_orden}</div>
                                    <div className="text-xs text-gray-500">Monto: ${order.total_amount?.toLocaleString()}</div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.estado === 'pendiente' ? 'bg-amber-100 text-amber-700' :
                                    order.estado === 'aprobada' ? 'bg-emerald-100 text-emerald-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                    {(order.estado || 'pendiente').toUpperCase()}
                                </span>
                            </div>
                        ))}
                        {purchaseOrders.length === 0 && (
                            <p className="text-sm text-center text-gray-500 py-4">No hay órdenes registradas.</p>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Notificaciones de Inventario</h3>
                    <div className="space-y-4">
                        <div className="flex gap-4 p-3 bg-red-50 rounded-xl border border-red-100">
                            <AlertCircle className="text-red-600 shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-red-900">Stock Crítico: Acero Inoxidable</p>
                                <p className="text-xs text-red-700">Quedan 5 unidades. Considerar OC urgente.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                            <ArrowUpRight className="text-blue-600 shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-blue-900">Precios en Alza: Aluminio</p>
                                <p className="text-xs text-blue-700">Se proyecta incremento del 15% el próximo mes.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, change, isUp, icon, color }: {
    title: string;
    value: string | number;
    change: string;
    isUp: boolean;
    icon: React.ReactNode;
    color: string;
}) {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600',
        amber: 'bg-amber-50 text-amber-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        indigo: 'bg-indigo-50 text-indigo-600'
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                    {icon}
                </div>
                <div className={`flex items-center gap-1 text-sm font-bold ${isUp ? 'text-emerald-600' : 'text-red-500'}`}>
                    {isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {change}
                </div>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <p className="text-2xl font-black text-gray-900">{value}</p>
        </div>
    );
}

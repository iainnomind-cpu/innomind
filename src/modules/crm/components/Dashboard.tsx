import { useMemo } from 'react';
import { TrendingUp, Users, DollarSign, UserPlus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useCRM } from '@/context/CRMContext';

const COLORS = ['#3b82f6', '#f59e0b', '#f97316', '#8b5cf6', '#10b981', '#22c55e', '#9ca3af', '#ef4444'];

export default function Dashboard() {
  const { prospects } = useCRM();

  const metricas = useMemo(() => {
    const totalContactos = prospects.length;
    const clientesActivos = prospects.filter(p => p.estado === 'Cliente Activo' || p.estado === 'Venta cerrada').length;
    const valorTotal = prospects.reduce((sum, p) => sum + (p.valorEstimado || 0), 0);
    const haceUnMes = new Date();
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);
    const nuevosMes = prospects.filter(p => p.fechaContacto && new Date(p.fechaContacto) > haceUnMes).length;
    return { totalContactos, clientesActivos, valorTotal, nuevosMes };
  }, [prospects]);

  const dataEstados = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    prospects.forEach(p => {
      statusCounts[p.estado] = (statusCounts[p.estado] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([estado, cantidad]) => ({ estado, cantidad }));
  }, [prospects]);

  const dataPipeline = useMemo(() => {
    const stages = ['Nuevo', 'Contactado', 'En seguimiento', 'Cotizado', 'Venta cerrada', 'Cliente Activo'];
    return stages.map(stage => ({
      etapa: stage,
      cantidad: prospects.filter(p => p.estado === stage).length,
    }));
  }, [prospects]);

  const actividadReciente = useMemo(() => {
    const sorted = [...prospects]
      .filter(p => p.fechaContacto)
      .sort((a, b) => new Date(b.fechaContacto!).getTime() - new Date(a.fechaContacto!).getTime())
      .slice(0, 5);

    return sorted.map(p => ({
      tipo: p.estado === 'Cliente Activo' ? 'Cliente activo' : p.estado === 'Nuevo' ? 'Nuevo prospecto' : `Estado: ${p.estado}`,
      cliente: p.nombre,
      empresa: p.empresa || p.servicioInteres,
      color: p.estado === 'Cliente Activo' ? 'bg-green-100 text-green-600'
        : p.estado === 'Nuevo' ? 'bg-blue-100 text-blue-600'
          : 'bg-purple-100 text-purple-600',
    }));
  }, [prospects]);

  const tarjetas = [
    { titulo: 'Total Contactos', valor: metricas.totalContactos, icono: Users, color: 'bg-blue-50 text-blue-600' },
    { titulo: 'Clientes Activos', valor: metricas.clientesActivos, icono: TrendingUp, color: 'bg-green-50 text-green-600' },
    { titulo: 'Valor Total', valor: `$${metricas.valorTotal.toLocaleString()}`, icono: DollarSign, color: 'bg-purple-50 text-purple-600' },
    { titulo: 'Nuevos este Mes', valor: metricas.nuevosMes, icono: UserPlus, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
        <p className="text-gray-500 mt-1">Resumen de tu pipeline de contactos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tarjetas.map((tarjeta) => {
          const Icon = tarjeta.icono;
          return (
            <div key={tarjeta.titulo} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${tarjeta.color} rounded-lg flex items-center justify-center`}>
                  <Icon size={24} />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{tarjeta.titulo}</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{tarjeta.valor}</h3>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900">Pipeline de Ventas</h3>
            <p className="text-sm text-gray-500">Contactos por etapa</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataPipeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="etapa" stroke="#9ca3af" style={{ fontSize: '11px' }} angle={-20} textAnchor="end" height={60} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="cantidad" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900">Distribución por Estado</h3>
            <p className="text-sm text-gray-500">Todos los contactos</p>
          </div>
          {dataEstados.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dataEstados}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ estado, percent }) => `${estado} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="cantidad"
                >
                  {dataEstados.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              Sin datos disponibles
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Contactos Recientes</h3>
        <div className="space-y-4">
          {actividadReciente.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No hay contactos registrados aún.</div>
          ) : (
            actividadReciente.map((actividad, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 ${actividad.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <Users size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{actividad.tipo}</p>
                  <p className="text-sm text-gray-500">{actividad.cliente} — {actividad.empresa}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

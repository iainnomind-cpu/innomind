import { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, UserPlus } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';
import type { MetricasData } from '@/types';

const dataMensual = [
  { mes: 'Ene', valor: 12000 },
  { mes: 'Feb', valor: 19000 },
  { mes: 'Mar', valor: 15000 },
  { mes: 'Abr', valor: 25000 },
  { mes: 'May', valor: 22000 },
  { mes: 'Jun', valor: 30000 },
];

const dataEstados = [
  { estado: 'Prospectos', cantidad: 15 },
  { estado: 'Activos', cantidad: 48 },
  { estado: 'Inactivos', cantidad: 8 },
];

export default function Dashboard() {
  const [metricas, setMetricas] = useState<MetricasData>({
    totalClientes: 0,
    clientesActivos: 0,
    valorTotal: 0,
    nuevosMes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarMetricas();
  }, []);

  const cargarMetricas = async () => {
    try {
      const { data: clientes } = await supabase
        .from('clientes')
        .select('*');

      if (clientes) {
        const activos = clientes.filter(c => c.estado === 'activo');
        const valorTotal = clientes.reduce((sum, c) => sum + (c.valor_estimado || 0), 0);

        const haceUnMes = new Date();
        haceUnMes.setMonth(haceUnMes.getMonth() - 1);
        const nuevosMes = clientes.filter(c => new Date(c.fecha_creacion) > haceUnMes).length;

        setMetricas({
          totalClientes: clientes.length,
          clientesActivos: activos.length,
          valorTotal,
          nuevosMes,
        });
      }
    } catch (error) {
      console.error('Error cargando métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  const tarjetas = [
    {
      titulo: 'Total Clientes',
      valor: metricas.totalClientes,
      icono: Users,
      color: 'bg-blue-50 text-blue-600',
      cambio: '+12%',
    },
    {
      titulo: 'Clientes Activos',
      valor: metricas.clientesActivos,
      icono: TrendingUp,
      color: 'bg-green-50 text-green-600',
      cambio: '+8%',
    },
    {
      titulo: 'Valor Total',
      valor: `$${metricas.valorTotal.toLocaleString()}`,
      icono: DollarSign,
      color: 'bg-purple-50 text-purple-600',
      cambio: '+15%',
    },
    {
      titulo: 'Nuevos este Mes',
      valor: metricas.nuevosMes,
      icono: UserPlus,
      color: 'bg-orange-50 text-orange-600',
      cambio: '+5%',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
        <p className="text-gray-500 mt-1">Bienvenido a tu sistema de gestión</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tarjetas.map((tarjeta) => {
          const Icon = tarjeta.icono;
          return (
            <div
              key={tarjeta.titulo}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${tarjeta.color} rounded-lg flex items-center justify-center`}>
                  <Icon size={24} />
                </div>
                <span className="text-green-600 text-sm font-semibold bg-green-50 px-2 py-1 rounded-full">
                  {tarjeta.cambio}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {tarjeta.titulo}
              </p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">
                {tarjeta.valor}
              </h3>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Ingresos Mensuales</h3>
              <p className="text-sm text-gray-500">Últimos 6 meses</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dataMensual}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="mes" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="valor"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Clientes por Estado</h3>
              <p className="text-sm text-gray-500">Distribución actual</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataEstados}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="estado" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="cantidad" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Actividad Reciente</h3>
        <div className="space-y-4">
          {[
            { tipo: 'Nuevo cliente registrado', cliente: 'Empresa ABC', tiempo: 'Hace 2 horas', color: 'bg-green-100 text-green-600' },
            { tipo: 'Actualización de información', cliente: 'Tech Solutions', tiempo: 'Hace 5 horas', color: 'bg-blue-100 text-blue-600' },
            { tipo: 'Cliente marcado como activo', cliente: 'Innovation Labs', tiempo: 'Hace 1 día', color: 'bg-purple-100 text-purple-600' },
          ].map((actividad, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`w-10 h-10 ${actividad.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                <Users size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{actividad.tipo}</p>
                <p className="text-sm text-gray-500">{actividad.cliente}</p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">{actividad.tiempo}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

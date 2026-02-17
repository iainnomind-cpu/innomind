import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Search, Mail, Phone, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Cliente, ClienteFormData } from '../types';

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  const formInicial: ClienteFormData = {
    nombre: '',
    email: '',
    telefono: '',
    empresa: '',
    estado: 'prospecto',
    valor_estimado: 0,
    notas: '',
  };

  const [formData, setFormData] = useState<ClienteFormData>(formInicial);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Error cargando clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (cliente?: Cliente) => {
    if (cliente) {
      setClienteEditando(cliente);
      setFormData({
        nombre: cliente.nombre,
        email: cliente.email,
        telefono: cliente.telefono,
        empresa: cliente.empresa,
        estado: cliente.estado,
        valor_estimado: cliente.valor_estimado,
        notas: cliente.notas,
      });
    } else {
      setClienteEditando(null);
      setFormData(formInicial);
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setClienteEditando(null);
    setFormData(formInicial);
  };

  const guardarCliente = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (clienteEditando) {
        const { error } = await supabase
          .from('clientes')
          .update({
            ...formData,
            ultima_actualizacion: new Date().toISOString(),
          })
          .eq('id', clienteEditando.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clientes')
          .insert([formData]);

        if (error) throw error;
      }

      await cargarClientes();
      cerrarModal();
    } catch (error) {
      console.error('Error guardando cliente:', error);
      alert('Error al guardar el cliente');
    }
  };

  const eliminarCliente = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await cargarClientes();
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      alert('Error al eliminar el cliente');
    }
  };

  const clientesFiltrados = clientes.filter(cliente => {
    const coincideBusqueda =
      cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.empresa.toLowerCase().includes(busqueda.toLowerCase());

    const coincideEstado = filtroEstado === 'todos' || cliente.estado === filtroEstado;

    return coincideBusqueda && coincideEstado;
  });

  const getEstadoBadge = (estado: string) => {
    const estilos = {
      prospecto: 'bg-blue-100 text-blue-700',
      activo: 'bg-green-100 text-green-700',
      inactivo: 'bg-gray-100 text-gray-700',
    };
    return estilos[estado as keyof typeof estilos] || estilos.prospecto;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">Gestiona tu cartera de clientes</p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Nuevo Cliente
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar clientes..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos los estados</option>
            <option value="prospecto">Prospectos</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Valor Estimado
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron clientes
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{cliente.nombre}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Building2 size={14} />
                          {cliente.empresa || 'Sin empresa'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Mail size={14} />
                          {cliente.email}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Phone size={14} />
                          {cliente.telefono || 'Sin teléfono'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getEstadoBadge(cliente.estado)}`}>
                        {cliente.estado.charAt(0).toUpperCase() + cliente.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        ${cliente.valor_estimado.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => abrirModal(cliente)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => eliminarCliente(cliente.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {clienteEditando ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <button
                onClick={cerrarModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={guardarCliente} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+34 123 456 789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Empresa
                  </label>
                  <input
                    type="text"
                    value={formData.empresa}
                    onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre de la empresa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="prospecto">Prospecto</option>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Valor Estimado
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.valor_estimado}
                    onChange={(e) => setFormData({ ...formData, valor_estimado: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Notas adicionales sobre el cliente..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  {clienteEditando ? 'Actualizar' : 'Crear'} Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

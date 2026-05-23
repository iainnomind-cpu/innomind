import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { fetchUserTickets, SupportTicket } from '../supportApi';
import {
  Plus, Search, AlertCircle, Clock, CheckCircle2,
  ChevronRight, Bug, HelpCircle, Lightbulb, MoreHorizontal,
  Loader2
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  abierto: { label: 'Abierto', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
  en_progreso: { label: 'En Progreso', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  en_espera: { label: 'En Espera', color: 'bg-orange-100 text-orange-700', icon: Clock },
  resuelto: { label: 'Resuelto', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  cerrado: { label: 'Cerrado', color: 'bg-gray-100 text-gray-500', icon: CheckCircle2 },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  baja: { label: 'Baja', color: 'text-gray-500' },
  media: { label: 'Media', color: 'text-blue-600' },
  alta: { label: 'Alta', color: 'text-orange-600' },
  urgente: { label: 'Urgente', color: 'text-red-600' },
};

const CATEGORY_ICON: Record<string, any> = {
  bug: Bug,
  duda: HelpCircle,
  mejora: Lightbulb,
  otro: MoreHorizontal,
};

export default function UserTicketList() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos');
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.email) {
      loadTickets();
    }
  }, [user?.email]);

  const loadTickets = async () => {
    setLoading(true);
    const data = await fetchUserTickets(user!.email!);
    setTickets(data);
    setLoading(false);
  };

  const filtered = tickets.filter(t => {
    if (filter !== 'todos' && t.status !== filter) return false;
    if (search && !t.subject.toLowerCase().includes(search.toLowerCase()) && !`#${t.ticket_number}`.includes(search)) return false;
    return true;
  });

  const openCount = tickets.filter(t => ['abierto', 'en_progreso', 'en_espera'].includes(t.status)).length;
  const resolvedCount = tickets.filter(t => ['resuelto', 'cerrado'].includes(t.status)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Centro de Soporte</h1>
          <p className="text-sm text-gray-500 mt-1">Reporta problemas, solicita ayuda o sugiere mejoras</p>
        </div>
        <button
          onClick={() => navigate('/crm/support/new')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus size={18} />
          Nuevo Reporte
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{tickets.length}</div>
          <div className="text-xs text-gray-500 font-medium mt-1">Total de Reportes</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{openCount}</div>
          <div className="text-xs text-gray-500 font-medium mt-1">Abiertos</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">{resolvedCount}</div>
          <div className="text-xs text-gray-500 font-medium mt-1">Resueltos</div>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por asunto o # ticket..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {[
              { key: 'todos', label: 'Todos' },
              { key: 'abierto', label: 'Abiertos' },
              { key: 'en_progreso', label: 'En Progreso' },
              { key: 'resuelto', label: 'Resueltos' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${filter === f.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ticket List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <AlertCircle className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="font-semibold text-gray-700 mb-1">
            {tickets.length === 0 ? 'Sin reportes aún' : 'No hay resultados'}
          </h3>
          <p className="text-sm text-gray-500">
            {tickets.length === 0
              ? 'Crea tu primer reporte de soporte usando el botón de arriba.'
              : 'Intenta con otros filtros o términos de búsqueda.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(ticket => {
            const statusCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.abierto;
            const priorityCfg = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.media;
            const CategoryIcon = CATEGORY_ICON[ticket.category] || MoreHorizontal;
            const StatusIcon = statusCfg.icon;

            return (
              <button
                key={ticket.id}
                onClick={() => navigate(`/crm/support/${ticket.id}`)}
                className="w-full bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                    <CategoryIcon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-400">#{ticket.ticket_number}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                      <span className={`text-[10px] font-bold ${priorityCfg.color}`}>
                        ● {priorityCfg.label}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {ticket.subject}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{ticket.description}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(ticket.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500 mt-2 shrink-0 transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

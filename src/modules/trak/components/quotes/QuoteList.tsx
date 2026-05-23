import React, { useState, useEffect } from 'react';
import { useTrak } from '../../context/TrakContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { FileText, Plus, Search, MoreHorizontal, ArrowUpRight, CheckCircle2, Clock, LayoutTemplate, Package } from 'lucide-react';
import QuoteTemplates from './QuoteTemplates';
import ProductCatalog from '../catalog/ProductCatalog';

const statusConfig: Record<string, { label: string, color: string }> = {
  draft: { label: 'Borrador', color: 'bg-slate-100 text-slate-700' },
  sent: { label: 'Enviada', color: 'bg-blue-100 text-blue-700' },
  accepted: { label: 'Aceptada', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rechazada', color: 'bg-red-100 text-red-700' },
  expired: { label: 'Vencida', color: 'bg-amber-100 text-amber-700' },
};

export default function QuoteList() {
  const { workspaceId, refreshClients } = useTrak();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'quotes' | 'templates' | 'catalog'>('quotes');

  useEffect(() => {
    if (workspaceId) {
      fetchQuotes();
    }
  }, [workspaceId]);

  const fetchQuotes = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('trak_quotes')
      .select('*, client:client_id(company_name)')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });
    
    if (data) setQuotes(data);
    setIsLoading(false);
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>, quoteId: string) => {
    e.stopPropagation(); // Prevent row click
    const newStatus = e.target.value;
    await supabase.from('trak_quotes').update({ status: newStatus }).eq('id', quoteId);
    
    // Sincronizar reactivamente el estado del cliente asociado
    const quote = quotes.find(q => q.id === quoteId);
    if (quote && quote.client_id) {
      if (newStatus === 'accepted') {
        await supabase
          .from('trak_clients')
          .update({ status: 'active', pipeline_stage: 'won' })
          .eq('id', quote.client_id);
      } else if (newStatus === 'rejected') {
        await supabase
          .from('trak_clients')
          .update({ pipeline_stage: 'lost' })
          .eq('id', quote.client_id);
      } else if (newStatus === 'sent' || newStatus === 'draft') {
        const { data: client } = await supabase
          .from('trak_clients')
          .select('pipeline_stage')
          .eq('id', quote.client_id)
          .single();
        if (client && client.pipeline_stage !== 'won') {
          await supabase
            .from('trak_clients')
            .update({ pipeline_stage: 'quoted' })
            .eq('id', quote.client_id);
        }
      }
      if (refreshClients) await refreshClients();
    }

    fetchQuotes();
  };

  const filteredQuotes = quotes.filter(q => {
    const matchSearch = !search || 
      q.quote_number.toLowerCase().includes(search.toLowerCase()) || 
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      (q.client?.company_name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || q.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cotizaciones</h1>
          <p className="text-gray-500 text-sm mt-1">{quotes.length} cotizaciones registradas</p>
        </div>
        {activeTab === 'quotes' && (
          <button
            onClick={() => navigate('/trak/quotes/new')}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-purple-600/20"
          >
            <Plus size={18} /> Nueva Cotización
          </button>
        )}
      </div>

      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('quotes')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'quotes' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center gap-2"><FileText size={16}/> Historial</div>
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'templates' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center gap-2"><LayoutTemplate size={16}/> Plantillas</div>
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'catalog' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center gap-2"><Package size={16}/> Catálogo</div>
        </button>
      </div>

      {activeTab === 'templates' ? (
        <QuoteTemplates />
      ) : activeTab === 'catalog' ? (
        <ProductCatalog />
      ) : (
        <>
          {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por número, título o cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {['all', 'draft', 'sent', 'accepted', 'rejected', 'expired'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                filterStatus === s
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s === 'all' ? 'Todas' : statusConfig[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Cargando cotizaciones...</div>
        ) : filteredQuotes.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText className="mx-auto mb-4 text-gray-300" size={48} />
            <p className="font-medium text-lg text-gray-900">No hay cotizaciones</p>
            <p className="text-sm mt-1">Crea tu primera cotización para enviarla a un cliente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-left">
                  <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Número / Título</th>
                  <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Monto Total</th>
                  <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Vencimiento</th>
                  <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredQuotes.map(quote => (
                  <tr 
                    key={quote.id} 
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/trak/quotes/${quote.id}`)}
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{quote.quote_number}</p>
                      <p className="text-gray-500 text-xs">{quote.title}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {quote.client?.company_name || '—'}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      ${quote.total?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={quote.status}
                        onChange={(e) => handleStatusChange(e, quote.id)}
                        className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full cursor-pointer appearance-none outline-none text-center ${statusConfig[quote.status]?.color} border border-transparent hover:border-current`}
                      >
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <option key={key} value={key} className="bg-white text-gray-900">
                            {config.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/trak/quotes/${quote.id}`);
                        }}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <ArrowUpRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
}

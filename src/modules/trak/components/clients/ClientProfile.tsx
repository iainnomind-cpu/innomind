import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft, Building2, Mail, Phone, Globe, MapPin, 
  Briefcase, FileText, CircleDollarSign, Clock, CheckCircle2, 
  TrendingUp, Activity, ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ClientProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [finances, setFinances] = useState<any[]>([]);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'projects' | 'quotes' | 'finances' | 'time'>('projects');

  useEffect(() => {
    fetchClientData();
  }, [id]);

  const fetchClientData = async () => {
    try {
      if (!id) return;
      setLoading(true);

      // Fetch Client Info
      const { data: clientData, error: clientErr } = await supabase
        .from('trak_clients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (clientErr) throw clientErr;
      setClient(clientData);

      // Fetch Projects
      const { data: projectsData } = await supabase
        .from('trak_projects')
        .select('*')
        .eq('client_id', id)
        .order('created_at', { ascending: false });
      
      setProjects(projectsData || []);

      // Fetch Quotes
      const { data: quotesData } = await supabase
        .from('trak_quotes')
        .select('*')
        .eq('client_id', id)
        .order('created_at', { ascending: false });
      
      setQuotes(quotesData || []);

      if (projectsData && projectsData.length > 0) {
        const projectIds = projectsData.map(p => p.id);
        
        // Fetch Finances (Milestones)
        const { data: financeData } = await supabase
          .from('trak_project_milestones')
          .select('*, project:trak_projects(name)')
          .in('project_id', projectIds)
          .order('created_at', { ascending: false });
          
        setFinances(financeData || []);

        // Fetch Time entries
        const { data: timeData } = await supabase
          .from('trak_time_entries')
          .select('*, user:users(name), project:trak_projects(name)')
          .in('project_id', projectIds)
          .order('start_time', { ascending: false });
          
        setTimeEntries(timeData || []);
      }
    } catch (err) {
      console.error('Error fetching client 360 data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
        <p className="text-gray-500 mb-4">Cliente no encontrado.</p>
        <button onClick={() => navigate('/trak/clients')} className="text-purple-600 font-medium flex items-center gap-2 hover:underline">
          <ArrowLeft size={16} /> Volver a Clientes
        </button>
      </div>
    );
  }

  // Calculate Finance Summary
  const totalInvoiced = finances.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalPaid = finances.filter(f => f.status === 'paid').reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalPending = totalInvoiced - totalPaid;

  // Calculate Time Summary
  const totalHours = timeEntries.reduce((sum, item) => sum + (item.duration_minutes / 60), 0);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 lg:p-8">
      {/* Top Action Bar */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/trak/clients')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors w-fit"
        >
          <ArrowLeft size={20} />
          Volver a Clientes
        </button>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8 mb-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-2xl shrink-0">
              {client.company_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{client.company_name}</h1>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                  client.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                  client.status === 'lead' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {client.status === 'active' ? 'Activo' : client.status === 'lead' ? 'Lead' : 'Inactivo'}
                </span>
              </div>
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                <Building2 size={16} />
                {client.industry || 'Industria no especificada'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4 w-full lg:w-auto text-sm">
            {client.contact_name && (
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                  <span className="font-semibold text-gray-500">{client.contact_name.charAt(0).toUpperCase()}</span>
                </div>
                <span>{client.contact_name}</span>
              </div>
            )}
            {client.email && (
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <Mail size={16} />
                </div>
                <span>{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center shrink-0">
                  <Phone size={16} />
                </div>
                <span>{client.phone}</span>
              </div>
            )}
            {client.website && (
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                  <Globe size={16} />
                </div>
                <a href={client.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate max-w-[150px]">
                  {client.website.replace('https://', '').replace('http://', '')}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Proyectos</p>
            <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Facturado</p>
            <p className="text-2xl font-bold text-gray-900">${totalInvoiced.toLocaleString('en-US')}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Por Cobrar</p>
            <p className="text-2xl font-bold text-red-600">${totalPending.toLocaleString('en-US')}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Horas Invertidas</p>
            <p className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}h</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto hide-scrollbar">
        {[
          { id: 'projects', label: 'Proyectos', icon: Briefcase, count: projects.length },
          { id: 'quotes', label: 'Cotizaciones', icon: FileText, count: quotes.length },
          { id: 'finances', label: 'Finanzas & Cobros', icon: CircleDollarSign, count: finances.length },
          { id: 'time', label: 'Control de Tiempos', icon: Clock, count: timeEntries.length },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors relative ${
                isActive ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={18} />
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                {tab.count}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="divide-y divide-gray-100">
            {projects.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No hay proyectos registrados para este cliente.</div>
            ) : (
              projects.map(project => (
                <div key={project.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                      {project.name}
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        project.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                        project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {project.status === 'completed' ? 'Completado' : project.status === 'in_progress' ? 'En Progreso' : 'Pendiente'}
                      </span>
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{project.description || 'Sin descripción'}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-medium">Presupuesto</p>
                      <p className="font-semibold text-gray-900">${(project.budget || 0).toLocaleString()}</p>
                    </div>
                    <div className="w-32 hidden sm:block">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Progreso</span>
                        <span className="font-bold text-gray-700">{project.progress || 0}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600 rounded-full" style={{ width: `${project.progress || 0}%` }} />
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/trak/projects/${project.id}`)}
                      className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Ver Proyecto"
                    >
                      <ExternalLink size={20} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* QUOTES TAB */}
        {activeTab === 'quotes' && (
          <div className="divide-y divide-gray-100">
            {quotes.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No hay cotizaciones para este cliente.</div>
            ) : (
              quotes.map(quote => (
                <div key={quote.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{quote.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Folio: {quote.quote_number || 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-gray-900">${(quote.total || 0).toLocaleString()}</p>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                        quote.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 
                        quote.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {quote.status}
                      </span>
                    </div>
                    <button 
                      onClick={() => navigate(`/trak/quotes/${quote.id}`)}
                      className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <ExternalLink size={20} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* FINANCES TAB */}
        {activeTab === 'finances' && (
          <div className="divide-y divide-gray-100">
            {finances.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No hay hitos financieros o cobros para este cliente.</div>
            ) : (
              finances.map(item => (
                <div key={item.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      item.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      <CircleDollarSign size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">Proyecto: {item.project?.name || 'Desconocido'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${(item.amount || 0).toLocaleString()}</p>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                      item.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.status === 'paid' ? 'Pagado' : 'Pendiente'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TIME TAB */}
        {activeTab === 'time' && (
          <div className="divide-y divide-gray-100">
            {timeEntries.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No hay registros de tiempo para este cliente.</div>
            ) : (
              timeEntries.map(entry => (
                <div key={entry.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-1">
                      <Activity size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{entry.description || 'Sin descripción'}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span>{entry.user?.name || 'Usuario'}</span>
                        <span>•</span>
                        <span>Proyecto: {entry.project?.name}</span>
                        <span>•</span>
                        <span>{format(new Date(entry.start_time), 'dd MMM yyyy', { locale: es })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-lg">
                      {Math.floor(entry.duration_minutes / 60)}h {entry.duration_minutes % 60}m
                    </p>
                    {entry.billable && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 inline-block mt-1">
                        Facturable
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

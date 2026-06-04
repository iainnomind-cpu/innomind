import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  Briefcase,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  LineChart,
  Receipt,
  Target,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTrak, TrakProject } from '../../context/TrakContext';

interface TrakQuoteRow {
  id: string;
  project_id?: string | null;
  client_id?: string | null;
  quote_number: string;
  title: string;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  valid_until?: string | null;
  created_at: string;
  client?: { company_name?: string };
}

interface ProjectMilestone {
  id: string;
  project_id: string;
  name: string;
  amount: number;
  status: 'pending' | 'invoiced' | 'paid';
  due_date?: string | null;
  paid_date?: string | null;
}

interface ProjectExpense {
  id: string;
  project_id: string;
  category?: string;
  description?: string;
  amount: number;
  date?: string;
}

interface ProjectMaterial {
  id: string;
  project_id: string;
  name?: string;
  total_cost: number;
}

interface TimeEntry {
  id: string;
  project_id?: string | null;
  duration_minutes: number;
  billable: boolean;
  hourly_rate?: number | null;
}

interface ProjectFinanceSummary {
  project: TrakProject;
  expectedIncome: number;
  contractedIncome: number;
  collected: number;
  pendingCollection: number;
  materialCost: number;
  expenseCost: number;
  laborCost: number;
  totalCost: number;
  profit: number;
  margin: number;
  costBurn: number;
  overdueCollection: number;
  openMilestones: number;
}

const today = new Date();
today.setHours(0, 0, 0, 0);

const currency = (value: number) => `$${Number(value || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`;
const pct = (value: number) => `${Number.isFinite(value) ? value.toFixed(1) : '0.0'}%`;

const statusLabels: Record<string, string> = {
  planning: 'Planificacion',
  active: 'Activo',
  on_hold: 'Pausado',
  completed: 'Completado',
  cancelled: 'Cancelado'
};

export default function TrakFinanceDashboard() {
  const navigate = useNavigate();
  const { workspaceId, projects, clients } = useTrak();
  const [quotes, setQuotes] = useState<TrakQuoteRow[]>([]);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [expenses, setExpenses] = useState<ProjectExpense[]>([]);
  const [materials, setMaterials] = useState<ProjectMaterial[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'risk' | 'completed'>('all');

  useEffect(() => {
    if (workspaceId) fetchFinanceData();
  }, [workspaceId, projects.length]);

  const fetchFinanceData = async () => {
    if (!workspaceId) return;
    setIsLoading(true);

    const projectIds = projects.map(project => project.id);
    const [quotesRes, milestonesRes, expensesRes, materialsRes, timeRes] = await Promise.all([
      supabase
        .from('trak_quotes')
        .select('*, client:client_id(company_name)')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false }),
      projectIds.length
        ? supabase.from('trak_project_milestones').select('*').in('project_id', projectIds)
        : Promise.resolve({ data: [] }),
      projectIds.length
        ? supabase.from('trak_project_expenses').select('*').in('project_id', projectIds)
        : Promise.resolve({ data: [] }),
      projectIds.length
        ? supabase.from('trak_project_materials').select('*').in('project_id', projectIds)
        : Promise.resolve({ data: [] }),
      supabase.from('trak_time_entries').select('*').eq('workspace_id', workspaceId)
    ]);

    setQuotes((quotesRes.data || []) as TrakQuoteRow[]);
    setMilestones((milestonesRes.data || []) as ProjectMilestone[]);
    setExpenses((expensesRes.data || []) as ProjectExpense[]);
    setMaterials((materialsRes.data || []) as ProjectMaterial[]);
    setTimeEntries((timeRes.data || []) as TimeEntry[]);
    setIsLoading(false);
  };

  const summaries = useMemo<ProjectFinanceSummary[]>(() => {
    return projects.map(project => {
      const projectQuotes = quotes.filter(quote => quote.project_id === project.id && quote.status === 'accepted');
      const projectMilestones = milestones.filter(milestone => milestone.project_id === project.id);
      const projectExpenses = expenses.filter(expense => expense.project_id === project.id);
      const projectMaterials = materials.filter(material => material.project_id === project.id);
      const projectTime = timeEntries.filter(entry => entry.project_id === project.id);

      const contractedIncome = projectQuotes.reduce((sum, quote) => sum + Number(quote.total || 0), 0);
      const milestoneIncome = projectMilestones.reduce((sum, milestone) => sum + Number(milestone.amount || 0), 0);
      const expectedIncome = milestoneIncome || contractedIncome || Number(project.budget || 0);
      const collected = projectMilestones
        .filter(milestone => milestone.status === 'paid')
        .reduce((sum, milestone) => sum + Number(milestone.amount || 0), 0);
      const pendingCollection = Math.max(0, expectedIncome - collected);
      const materialCost = projectMaterials.reduce((sum, material) => sum + Number(material.total_cost || 0), 0);
      const expenseCost = projectExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
      const laborCost = projectTime.reduce((sum, entry) => sum + (Number(entry.duration_minutes || 0) / 60) * Number(entry.hourly_rate || 0), 0);
      const totalCost = materialCost + expenseCost + laborCost;
      const profit = expectedIncome - totalCost;
      const margin = expectedIncome > 0 ? (profit / expectedIncome) * 100 : 0;
      const costBurn = Number(project.budget || expectedIncome) > 0 ? (totalCost / Number(project.budget || expectedIncome)) * 100 : 0;
      const overdueCollection = projectMilestones
        .filter(milestone => milestone.status !== 'paid' && milestone.due_date && new Date(`${milestone.due_date}T00:00:00`) < today)
        .reduce((sum, milestone) => sum + Number(milestone.amount || 0), 0);

      return {
        project,
        expectedIncome,
        contractedIncome,
        collected,
        pendingCollection,
        materialCost,
        expenseCost,
        laborCost,
        totalCost,
        profit,
        margin,
        costBurn,
        overdueCollection,
        openMilestones: projectMilestones.filter(milestone => milestone.status !== 'paid').length
      };
    }).sort((a, b) => b.expectedIncome - a.expectedIncome);
  }, [projects, quotes, milestones, expenses, materials, timeEntries]);

  const totals = useMemo(() => {
    const acceptedQuotes = quotes.filter(quote => quote.status === 'accepted');
    const sentQuotes = quotes.filter(quote => quote.status === 'sent');
    const totalExpected = summaries.reduce((sum, item) => sum + item.expectedIncome, 0);
    const totalCollected = summaries.reduce((sum, item) => sum + item.collected, 0);
    const totalCost = summaries.reduce((sum, item) => sum + item.totalCost, 0);
    const totalProfit = totalExpected - totalCost;
    const overdue = summaries.reduce((sum, item) => sum + item.overdueCollection, 0);

    return {
      acceptedRevenue: acceptedQuotes.reduce((sum, quote) => sum + Number(quote.total || 0), 0),
      openPipeline: sentQuotes.reduce((sum, quote) => sum + Number(quote.total || 0), 0),
      totalExpected,
      totalCollected,
      pendingCollection: Math.max(0, totalExpected - totalCollected),
      totalCost,
      totalProfit,
      margin: totalExpected > 0 ? (totalProfit / totalExpected) * 100 : 0,
      overdue
    };
  }, [quotes, summaries]);

  const alerts = useMemo(() => {
    const result: Array<{ title: string; message: string; severity: 'critical' | 'warning' | 'info'; path: string }> = [];

    summaries.forEach(summary => {
      if (summary.overdueCollection > 0) {
        result.push({
          title: 'Cobranza vencida',
          message: `${summary.project.name} tiene ${currency(summary.overdueCollection)} pendiente fuera de fecha.`,
          severity: 'critical',
          path: `/trak/projects/${summary.project.id}`
        });
      }

      if (summary.expectedIncome > 0 && summary.margin < 20 && summary.project.status !== 'cancelled') {
        result.push({
          title: 'Margen bajo',
          message: `${summary.project.name} opera con margen de ${pct(summary.margin)}.`,
          severity: summary.margin < 0 ? 'critical' : 'warning',
          path: `/trak/projects/${summary.project.id}`
        });
      }

      if (summary.project.status === 'completed' && summary.pendingCollection > 0) {
        result.push({
          title: 'Cierre con saldo pendiente',
          message: `${summary.project.name} esta completado pero faltan ${currency(summary.pendingCollection)} por cobrar.`,
          severity: 'warning',
          path: `/trak/projects/${summary.project.id}`
        });
      }
    });

    quotes
      .filter(quote => quote.status === 'sent' && quote.valid_until)
      .forEach(quote => {
        const due = new Date(`${quote.valid_until}T00:00:00`);
        const diff = Math.ceil((due.getTime() - today.getTime()) / 86400000);
        if (diff <= 3) {
          result.push({
            title: diff < 0 ? 'Cotizacion vencida' : 'Cotizacion por vencer',
            message: `${quote.quote_number} por ${currency(quote.total)} requiere seguimiento comercial.`,
            severity: diff < 0 ? 'critical' : 'info',
            path: `/trak/quotes/${quote.id}`
          });
        }
      });

    return result.slice(0, 8);
  }, [quotes, summaries]);

  const filteredSummaries = summaries.filter(summary => {
    if (filter === 'active') return ['planning', 'active', 'on_hold'].includes(summary.project.status);
    if (filter === 'completed') return summary.project.status === 'completed';
    if (filter === 'risk') return summary.margin < 20 || summary.overdueCollection > 0 || summary.costBurn > 90;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50">
        <CircleDollarSign className="text-purple-300 animate-pulse mb-4" size={48} />
        <p className="text-slate-500 font-medium">Calculando finanzas de proyectos...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <CircleDollarSign className="text-purple-600" size={28} />
            Finanzas Trak
          </h1>
          <p className="text-slate-500 text-sm mt-1">Rentabilidad, cobranza y control financiero por proyecto. Sin facturacion SAT.</p>
        </div>
        <button
          onClick={() => navigate('/trak/quotes/new')}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-purple-600/20"
        >
          <FileText size={18} />
          Nueva cotizacion
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Ingresos contratados" value={currency(totals.acceptedRevenue || totals.totalExpected)} icon={<Banknote size={20} />} color="emerald" subtitle={`${clients.length} clientes en Trak`} />
        <KpiCard title="Cobrado" value={currency(totals.totalCollected)} icon={<CreditCard size={20} />} color="blue" subtitle={`${currency(totals.pendingCollection)} por cobrar`} />
        <KpiCard title="Costo real" value={currency(totals.totalCost)} icon={<Receipt size={20} />} color="amber" subtitle="Materiales, gastos y horas" />
        <KpiCard title="Utilidad estimada" value={currency(totals.totalProfit)} icon={<TrendingUp size={20} />} color={totals.totalProfit >= 0 ? 'purple' : 'red'} subtitle={`Margen ${pct(totals.margin)}`} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <LineChart size={18} className="text-purple-600" />
                Salud financiera por proyecto
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Compara ingreso esperado, costo y utilidad.</p>
            </div>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
              {[
                { id: 'all', label: 'Todo' },
                { id: 'active', label: 'Activos' },
                { id: 'risk', label: 'Riesgo' },
                { id: 'completed', label: 'Cerrados' }
              ].map(option => (
                <button
                  key={option.id}
                  onClick={() => setFilter(option.id as typeof filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${filter === option.id ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredSummaries.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No hay proyectos para este filtro.</div>
            ) : (
              filteredSummaries.slice(0, 8).map(summary => (
                <button
                  key={summary.project.id}
                  onClick={() => navigate(`/trak/projects/${summary.project.id}`)}
                  className="w-full p-4 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all text-left"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: summary.project.color || '#9333ea' }} />
                        <p className="font-bold text-slate-900 truncate">{summary.project.name}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          {statusLabels[summary.project.status] || summary.project.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{summary.project.client?.company_name || 'Proyecto interno'}</p>
                    </div>

                    <Metric label="Ingreso" value={currency(summary.expectedIncome)} />
                    <Metric label="Costo" value={currency(summary.totalCost)} tone={summary.costBurn > 90 ? 'warning' : 'neutral'} />
                    <Metric label="Utilidad" value={currency(summary.profit)} tone={summary.profit < 0 ? 'danger' : 'success'} />
                    <Metric label="Margen" value={pct(summary.margin)} tone={summary.margin < 20 ? 'danger' : 'success'} />
                    <ArrowUpRight size={18} className="text-slate-300 hidden md:block" />
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full ${summary.margin < 0 ? 'bg-red-500' : summary.margin < 20 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.max(4, Math.min(100, summary.margin + 20))}%` }}
                    />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/60">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle size={18} className={alerts.some(alert => alert.severity === 'critical') ? 'text-red-600' : 'text-amber-600'} />
              Alertas financieras
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Prioridades que requieren accion.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {alerts.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 size={36} className="mx-auto text-emerald-400 mb-3" />
                <p className="text-sm font-bold text-slate-900">Sin riesgos criticos</p>
                <p className="text-xs text-slate-500 mt-1">La operacion financiera se ve estable.</p>
              </div>
            ) : (
              alerts.map((alert, index) => (
                <button
                  key={`${alert.title}-${index}`}
                  onClick={() => navigate(alert.path)}
                  className="w-full p-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${alert.severity === 'critical' ? 'bg-red-50 text-red-600' : alert.severity === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                      {alert.severity === 'critical' ? <TrendingDown size={18} /> : <Clock size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{alert.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{alert.message}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Target size={18} className="text-emerald-600" />
            Embudo financiero
          </h2>
          <div className="space-y-4">
            <PipelineBar label="Cotizaciones enviadas" value={totals.openPipeline} total={Math.max(totals.openPipeline + totals.acceptedRevenue, 1)} color="bg-blue-500" />
            <PipelineBar label="Contratado" value={totals.acceptedRevenue} total={Math.max(totals.openPipeline + totals.acceptedRevenue, 1)} color="bg-emerald-500" />
            <PipelineBar label="Cobrado" value={totals.totalCollected} total={Math.max(totals.totalExpected, 1)} color="bg-purple-500" />
            <PipelineBar label="Vencido" value={totals.overdue} total={Math.max(totals.totalExpected, 1)} color="bg-red-500" />
          </div>
        </div>

        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <Briefcase size={18} className="text-purple-600" />
                Proximos cobros
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Hitos pendientes ordenados por vencimiento.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3 text-left">Hito</th>
                  <th className="px-5 py-3 text-left">Proyecto</th>
                  <th className="px-5 py-3 text-right">Monto</th>
                  <th className="px-5 py-3 text-center">Vence</th>
                  <th className="px-5 py-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {milestones
                  .filter(milestone => milestone.status !== 'paid')
                  .sort((a, b) => String(a.due_date || '9999').localeCompare(String(b.due_date || '9999')))
                  .slice(0, 10)
                  .map(milestone => {
                    const project = projects.find(item => item.id === milestone.project_id);
                    const isOverdue = milestone.due_date && new Date(`${milestone.due_date}T00:00:00`) < today;
                    return (
                      <tr key={milestone.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => project && navigate(`/trak/projects/${project.id}`)}>
                        <td className="px-5 py-3 font-bold text-slate-900">{milestone.name}</td>
                        <td className="px-5 py-3 text-slate-600">{project?.name || 'Proyecto'}</td>
                        <td className="px-5 py-3 text-right font-black text-slate-900">{currency(milestone.amount)}</td>
                        <td className={`px-5 py-3 text-center text-xs font-bold ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
                          {milestone.due_date ? new Date(`${milestone.due_date}T00:00:00`).toLocaleDateString('es-MX') : 'Sin fecha'}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${milestone.status === 'invoiced' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                            {milestone.status === 'invoiced' ? 'Por cobrar' : 'Pendiente'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                {milestones.filter(milestone => milestone.status !== 'paid').length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400">No hay cobros pendientes.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon, color, subtitle }: { title: string; value: string; icon: React.ReactNode; color: 'emerald' | 'blue' | 'amber' | 'purple' | 'red'; subtitle?: string }) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600'
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-2">{subtitle}</p>}
    </div>
  );
}

function Metric({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: 'neutral' | 'success' | 'warning' | 'danger' }) {
  const tones = {
    neutral: 'text-slate-900',
    success: 'text-emerald-700',
    warning: 'text-amber-700',
    danger: 'text-red-700'
  };

  return (
    <div className="md:text-right min-w-[86px]">
      <p className="text-[10px] uppercase font-bold text-slate-400">{label}</p>
      <p className={`text-sm font-black ${tones[tone]}`}>{value}</p>
    </div>
  );
}

function PipelineBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percentage = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-bold text-slate-900">{currency(value)}</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${Math.max(percentage, value > 0 ? 5 : 0)}%` }} />
      </div>
    </div>
  );
}

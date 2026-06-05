import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useTrak } from '../../context/TrakContext';
import { useUsers } from '@/context/UserContext';
import { DollarSign, Plus, Trash2, X, Package, Receipt, TrendingUp, CreditCard, CheckCircle2, FileText, Send, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { generateChargeNoteFromMilestone, createPayableFromProjectExpense } from '../../services/financeAutomation';

const expenseCategories = ['general', 'materiales', 'transporte', 'subcontrato', 'permisos', 'herramientas', 'otro'];
const catLabels: Record<string, string> = {
  general: 'General', materiales: 'Materiales', transporte: 'Transporte',
  subcontrato: 'Subcontrato', permisos: 'Permisos', herramientas: 'Herramientas', otro: 'Otro'
};

export default function ProjectFinances({ projectId }: { projectId: string }) {
  const { workspaceId } = useTrak();
  const { companyProfile } = useUsers();
  const [materials, setMaterials] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [budget, setBudget] = useState(0);
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [invoicingId, setInvoicingId] = useState<string | null>(null);

  // PDF Receipt State
  const [receiptMilestone, setReceiptMilestone] = useState<any>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Modals
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showMaterialPicker, setShowMaterialPicker] = useState(false);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);

  useEffect(() => { fetchAll(); }, [projectId]);

  const fetchAll = async () => {
    setIsLoading(true);
    const [matRes, expRes, timeRes, mileRes, projRes] = await Promise.all([
      supabase.from('trak_project_materials').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
      supabase.from('trak_project_expenses').select('*').eq('project_id', projectId).order('date', { ascending: false }),
      supabase.from('trak_time_entries').select('duration_minutes, billable, hourly_rate').eq('project_id', projectId),
      supabase.from('trak_project_milestones').select('*').eq('project_id', projectId).order('created_at'),
      supabase.from('trak_projects').select('id, name, client_id, budget, client:trak_clients(company_name)').eq('id', projectId).single(),
    ]);
    if (matRes.data) setMaterials(matRes.data);
    if (expRes.data) setExpenses(expRes.data);
    if (timeRes.data) setTimeEntries(timeRes.data);
    if (mileRes.data) setMilestones(mileRes.data);
    if (projRes.data) { setBudget(projRes.data.budget || 0); setProject(projRes.data); }
    setIsLoading(false);
  };

  // Calculations
  const totalMaterials = materials.reduce((s, m) => s + (m.total_cost || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const totalLabor = timeEntries.reduce((s, t) => s + ((t.duration_minutes / 60) * (t.hourly_rate || 0)), 0);
  
  const totalCost = totalMaterials + totalExpenses + totalLabor;
  
  // Income calculations
  const totalExpectedIncome = milestones.reduce((s, m) => s + Number(m.amount), 0) || budget; 
  const totalInvoiced = milestones.filter(m => m.status === 'invoiced' || m.status === 'paid').reduce((s, m) => s + Number(m.amount), 0);
  const totalPaid = milestones.filter(m => m.status === 'paid').reduce((s, m) => s + Number(m.amount), 0);

  // Profitability
  const profitMargin = totalExpectedIncome > 0 ? ((totalExpectedIncome - totalCost) / totalExpectedIncome) * 100 : 0;
  const isProfitable = totalExpectedIncome >= totalCost;

  // PDF Helper
  const renderElementToPDF = async (element: HTMLElement, width?: number): Promise<jsPDF> => {
    const clone = element.cloneNode(true) as HTMLElement;
    document.body.appendChild(clone);
    clone.style.position = 'absolute';
    clone.style.top = '0';
    clone.style.left = '0';
    clone.style.width = width ? `${width}px` : `${element.offsetWidth}px`;
    clone.style.height = 'max-content';
    clone.style.overflow = 'visible';
    clone.style.display = 'block';
    clone.style.zIndex = '-9999';

    const canvas = await html2canvas(clone, { scale: 2, useCORS: true, windowWidth: clone.scrollWidth, windowHeight: clone.scrollHeight });
    document.body.removeChild(clone);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, pdf.internal.pageSize.getHeight()));
    return pdf;
  };

  const handleDownloadReceipt = (milestone: any) => {
    setReceiptMilestone(milestone);
    setTimeout(async () => {
      if (!receiptRef.current) return;
      try {
        const pdf = await renderElementToPDF(receiptRef.current, 800);
        const dateStr = milestone.paid_date ? milestone.paid_date.split('T')[0] : new Date().toISOString().split('T')[0];
        pdf.save(`Recibo_${project.name}_${dateStr}.pdf`);
        alert('✅ Recibo descargado exitosamente.');
      } catch (e) {
        console.error(e);
        alert('Error al generar el recibo');
      }
      setReceiptMilestone(null);
    }, 150);
  };

  const handleDelete = async (table: string, id: string) => {
    await supabase.from(table).delete().eq('id', id);
    fetchAll();
  };

  const handleMilestoneStatus = async (id: string, currentStatus: string) => {
    // Only allow manual toggle from 'invoiced' to 'paid' and back.
    // 'pending' -> 'invoiced' happens ONLY via the 'Generar CxC' button.
    if (currentStatus === 'pending') {
      alert('Para cambiar a Facturado, utiliza el botón de "Generar CxC" que generará la Cuenta por Cobrar.');
      return;
    }
    const next = currentStatus === 'invoiced' ? 'paid' : 'invoiced';
    await supabase.from('trak_project_milestones').update({ 
      status: next, 
      paid_date: next === 'paid' ? new Date().toISOString() : null 
    }).eq('id', id);

    // Sync with Finanzas: if marking paid and there's a linked charge note, update it too
    if (next === 'paid') {
      const { data: ms } = await supabase.from('trak_project_milestones').select('charge_note_id, amount').eq('id', id).single();
      if (ms?.charge_note_id) {
        // Register a full payment on the charge note
        const userId = (await supabase.auth.getUser()).data.user?.id;
        await supabase.from('charge_note_payments').insert({
          charge_note_id: ms.charge_note_id,
          amount: Number(ms.amount),
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: 'Registrado desde Proyecto',
          reference: 'Marcado como pagado en Plan de Pagos',
          workspace_id: workspaceId
        });
      }
    }

    fetchAll();
  };

  const handleInvoiceMilestone = async (milestone: any) => {
    if (!project) return;
    if (milestone.status === 'invoiced' || milestone.status === 'paid') {
      alert('Este pago ya fue enviado a Finanzas.');
      return;
    }

    // Double-check at DB level to prevent duplicates from stale UI
    const { data: freshMs } = await supabase.from('trak_project_milestones').select('status').eq('id', milestone.id).single();
    if (freshMs && freshMs.status !== 'pending') {
      alert('Este pago ya fue enviado a Finanzas. Recarga la página para ver el estado actualizado.');
      fetchAll();
      return;
    }

    setInvoicingId(milestone.id);
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const result = await generateChargeNoteFromMilestone(
      { id: milestone.id, name: milestone.name, amount: Number(milestone.amount), due_date: milestone.due_date, percentage: milestone.percentage },
      { id: project.id, name: project.name, client_id: project.client_id },
      workspaceId,
      userId
    );
    setInvoicingId(null);
    if (result.success) {
      alert('✅ Cuenta por Cobrar generada exitosamente en Finanzas. Puedes verla en el módulo de Cuentas por Cobrar.');
      fetchAll();
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-400">Cargando datos financieros...</div>;

  return (
    <div className="space-y-6">
      {/* RENTABILIDAD Y KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-gray-500 mb-1">Ingreso Esperado</p>
          <p className="text-3xl font-black text-gray-900">${totalExpectedIncome.toLocaleString()}</p>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">Cobrado: ${totalPaid.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-gray-500 mb-1">Costo Operativo Real</p>
          <p className="text-3xl font-black text-gray-900">${totalCost.toLocaleString()}</p>
          <div className="mt-2 flex gap-3 text-[10px] uppercase font-bold text-gray-400">
            <span>Mat: ${totalMaterials.toLocaleString()}</span>
            <span>Gastos: ${totalExpenses.toLocaleString()}</span>
            <span>MO: ${totalLabor.toLocaleString()}</span>
          </div>
        </div>

        <div className={`rounded-2xl p-5 border shadow-sm flex flex-col justify-center lg:col-span-2 ${isProfitable ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white border-emerald-600' : 'bg-gradient-to-br from-red-500 to-red-700 text-white border-red-600'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-white/80 mb-1">Utilidad Bruta (Margen)</p>
              <p className="text-4xl font-black">${(totalExpectedIncome - totalCost).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <span className={`text-2xl font-black ${isProfitable ? 'text-emerald-100' : 'text-red-100'}`}>
                {profitMargin.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* PLAN DE PAGOS */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><CreditCard size={16} /> Plan de Pagos del Cliente</h3>
              <p className="text-xs text-gray-500 mt-0.5">Define los cobros, porcentajes o anticipos</p>
            </div>
            <button onClick={() => setShowMilestoneForm(true)}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
              <Plus size={14} /> Nuevo Pago
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {milestones.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">Sin pagos programados. Puedes agregar anticipos, pagos parciales o el cobro total (opcional).</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {milestones.map(m => (
                  <li key={m.id} className="p-4 hover:bg-gray-50 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-sm">{m.name}</p>
                      <p className="text-xs text-gray-500">
                        Vence: {m.due_date ? new Date(m.due_date).toLocaleDateString() : 'Sin fecha'}
                        {m.percentage && ` · ${m.percentage}%`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900">${Number(m.amount).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {m.status === 'pending' ? (
                        <button 
                          onClick={() => handleInvoiceMilestone(m)}
                          disabled={invoicingId === m.id}
                          className="px-3 py-1.5 text-[11px] font-bold uppercase rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                          title="Enviar a Finanzas como Cuenta por Cobrar"
                        >
                          <Send size={12} />
                          {invoicingId === m.id ? 'Generando...' : 'Generar CxC'}
                        </button>
                      ) : m.status === 'invoiced' ? (
                        <>
                          <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1 px-2" title="Sincronizado con Finanzas">
                            <FileText size={12} className="text-blue-500" /> CxC Generada
                          </span>
                          <button 
                            onClick={() => handleMilestoneStatus(m.id, m.status)}
                            className="px-3 py-1.5 text-[11px] font-bold uppercase rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                          >
                            <DollarSign size={12} />
                            Marcar Pagado
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1.5 text-[11px] font-bold uppercase rounded-lg bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                            <CheckCircle2 size={12} /> Pagado
                          </span>
                          <button
                            onClick={() => handleDownloadReceipt(m)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors"
                            title="Descargar Recibo (PDF)"
                          >
                            <Download size={14} />
                          </button>
                          <button 
                            onClick={() => handleMilestoneStatus(m.id, m.status)}
                            className="text-[10px] text-gray-400 hover:text-red-500 underline"
                            title="Deshacer pago"
                          >
                            Deshacer
                          </button>
                        </div>
                      )}
                      
                      <button onClick={() => handleDelete('trak_project_milestones', m.id)} className="p-1.5 text-gray-300 hover:text-red-500 ml-2">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* EGRESOS: GASTOS Y MATERIALES */}
        <div className="space-y-6">
          {/* Gastos */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2"><Receipt size={14} /> Gastos Operativos</h3>
              <button onClick={() => setShowExpenseForm(true)}
                className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded flex items-center gap-1">
                <Plus size={12} /> Registrar Gasto
              </button>
            </div>
            {expenses.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-xs">Sin gastos registrados.</div>
            ) : (
              <div className="max-h-[250px] overflow-y-auto">
                <table className="w-full text-xs text-left"><tbody className="divide-y divide-gray-100">
                  {expenses.map(e => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-gray-900 truncate max-w-[150px]">{e.description}</td>
                      <td className="px-4 py-2 text-gray-500">{new Date(e.date).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-right font-bold text-gray-900">${e.amount?.toLocaleString()}</td>
                      <td className="px-2 py-2 w-8"><button onClick={() => handleDelete('trak_project_expenses', e.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={12}/></button></td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
            )}
          </div>

          {/* Materiales */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2"><Package size={14} /> Materiales (Inventario)</h3>
              <button onClick={() => setShowMaterialPicker(true)}
                className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded flex items-center gap-1">
                <Plus size={12} /> Asignar
              </button>
            </div>
            {materials.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-xs">Sin materiales asignados.</div>
            ) : (
              <div className="max-h-[250px] overflow-y-auto">
                <table className="w-full text-xs text-left"><tbody className="divide-y divide-gray-100">
                  {materials.map(m => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-gray-900">{m.name}</td>
                      <td className="px-4 py-2 text-gray-500">{m.quantity} u</td>
                      <td className="px-4 py-2 text-right font-bold text-gray-900">${m.total_cost?.toLocaleString()}</td>
                      <td className="px-2 py-2 w-8"><button onClick={() => handleDelete('trak_project_materials', m.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={12}/></button></td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
            )}
          </div>
        </div>

      </div>

      {showExpenseForm && <ExpenseFormModal projectId={projectId} project={project} workspaceId={workspaceId} onClose={() => setShowExpenseForm(false)} onSaved={() => { setShowExpenseForm(false); fetchAll(); }} />}
      {showMaterialPicker && <MaterialPickerModal projectId={projectId} workspaceId={workspaceId!} onClose={() => setShowMaterialPicker(false)} onSaved={() => { setShowMaterialPicker(false); fetchAll(); }} />}
      {showMilestoneForm && <MilestoneFormModal projectId={projectId} totalBudget={budget} onClose={() => setShowMilestoneForm(false)} onSaved={() => { setShowMilestoneForm(false); fetchAll(); }} />}

      {/* Hidden Receipt Template for PDF Generation */}
      <div className="hidden">
        <div ref={receiptRef} className="bg-white p-8 w-[800px] font-sans">
          {receiptMilestone && project && (
            <>
              <div className="flex justify-between items-start mb-8 border-b border-gray-200 pb-6">
                <div className="flex items-center gap-4">
                  {companyProfile?.logoUrl ? (
                    <img src={companyProfile.logoUrl} alt="Logo" className="h-16 w-16 object-contain rounded-lg" crossOrigin="anonymous" />
                  ) : (
                    <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center font-bold text-2xl">
                      {companyProfile?.nombreEmpresa?.charAt(0).toUpperCase() || 'E'}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{companyProfile?.nombreEmpresa || 'Mi Empresa'}</h2>
                    {companyProfile?.rfc && <p className="text-sm text-gray-500 font-medium">RFC: {companyProfile.rfc}</p>}
                    {companyProfile?.direccion && <p className="text-sm text-gray-500 max-w-xs">{companyProfile.direccion}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">RECIBO DE PAGO</h1>
                  <p className="text-gray-500 mt-1">Comprobante de Ingreso</p>
                  <p className="text-xl font-bold text-gray-800 mt-2">
                    {receiptMilestone.charge_note_id ? `NC-${receiptMilestone.charge_note_id.substring(0, 8).toUpperCase()}` : `PRY-${project.name.substring(0, 6).toUpperCase()}`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-10">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Cliente</p>
                  <h3 className="text-lg font-bold text-gray-900">{project.client?.company_name || 'Cliente de Proyecto'}</h3>
                  <p className="text-gray-600 mt-1">Proyecto: {project.name}</p>
                </div>
                <div className="text-right">
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Fecha de Pago</p>
                    <p className="text-gray-800 font-medium">{receiptMilestone.paid_date ? new Date(receiptMilestone.paid_date).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="mb-10 p-6 bg-emerald-50 rounded-xl border border-emerald-100">
                <h4 className="text-lg font-bold text-emerald-900 mb-4">Detalles del Cobro</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-emerald-800">
                    <span className="font-medium">Concepto:</span>
                    <span>{receiptMilestone.name}</span>
                  </div>
                  <div className="flex justify-between text-emerald-900 font-bold text-2xl pt-4 border-t border-emerald-200/60 mt-4">
                    <span>Total Pagado:</span>
                    <span>${Number(receiptMilestone.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} MXN</span>
                  </div>
                </div>
              </div>

              <div className="mt-16 text-center text-gray-500 text-sm">
                <p>Este documento es un comprobante de pago generado por el sistema.</p>
                <p>Si tienes alguna duda, contáctanos.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MilestoneFormModal({ projectId, totalBudget, onClose, onSaved }: any) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', amount: 0, percentage: '', due_date: '' });

  const handlePercentageChange = (pct: string) => {
    const num = parseFloat(pct) || 0;
    setForm({ ...form, percentage: pct, amount: (totalBudget * (num / 100)) });
  };

  const handleSave = async () => {
    if (!form.name || form.amount <= 0) return;
    setSaving(true);
    await supabase.from('trak_project_milestones').insert({
      project_id: projectId, name: form.name, amount: form.amount,
      percentage: form.percentage ? parseFloat(form.percentage) : null,
      due_date: form.due_date || null
    });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-lg">Nuevo Pago Programado</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre / Concepto *</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" placeholder="Ej. Anticipo, Segundo pago, Liquidación final" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {totalBudget > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Porcentaje (%) <span className="text-gray-400 font-normal">opcional</span></label>
                <input type="number" step="0.01" value={form.percentage} onChange={e => handlePercentageChange(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" placeholder="Ej. 30" />
              </div>
            )}
            <div className={totalBudget > 0 ? '' : 'col-span-2'}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto ($) *</label>
              <input type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: parseFloat(e.target.value) || 0})}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de vencimiento estimada</label>
            <input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
          </div>
        </div>
        <div className="p-5 bg-gray-50 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 text-sm font-medium rounded-xl">Cancelar</button>
          <button onClick={handleSave} disabled={saving || !form.name || form.amount <= 0}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium">
            {saving ? 'Guardando...' : 'Agregar Pago'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Re-use ExpenseFormModal and MaterialPickerModal from before
function ExpenseFormModal({ projectId, project, workspaceId, onClose, onSaved }: any) {
  const [saving, setSaving] = useState(false);
  const [sendToAP, setSendToAP] = useState(false);
  const [form, setForm] = useState({ category: 'general', description: '', amount: 0, date: new Date().toISOString().split('T')[0] });

  const handleSave = async () => {
    if (!form.description || form.amount <= 0) return;
    setSaving(true);
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const { data: newExpense } = await supabase.from('trak_project_expenses').insert({ project_id: projectId, ...form, created_by: userId }).select('id').single();
    
    // If checkbox is checked and we have the expense id, create the AP record
    if (sendToAP && newExpense?.id && project && workspaceId) {
      await createPayableFromProjectExpense(
        { id: newExpense.id, ...form },
        { id: project.id, name: project.name },
        workspaceId,
        userId
      );
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-lg">Registrar Gasto</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
              {expenseCategories.map(c => <option key={c} value={c}>{catLabels[c]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
            <input value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" placeholder="Ej. Gasolina para traslado" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto ($) *</label>
              <input type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: parseFloat(e.target.value) || 0})}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
            </div>
          </div>
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
            <input type="checkbox" id="sendToAP" checked={sendToAP} onChange={e => setSendToAP(e.target.checked)} className="w-4 h-4 accent-blue-600 rounded" />
            <label htmlFor="sendToAP" className="text-sm text-blue-800 font-medium cursor-pointer flex items-center gap-2">
              <Send size={14} /> Registrar también como Cuenta por Pagar en Finanzas
            </label>
          </div>
        </div>
        <div className="p-5 bg-gray-50 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 text-sm font-medium rounded-xl">Cancelar</button>
          <button onClick={handleSave} disabled={saving || !form.description || form.amount <= 0}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function MaterialPickerModal({ projectId, workspaceId, onClose, onSaved }: any) {
  const [inventory, setInventory] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('trak_inventory').select('*').eq('workspace_id', workspaceId).eq('is_active', true).order('name')
      .then(({ data }) => { if (data) setInventory(data); });
  }, []);

  const filtered = inventory.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async () => {
    if (!selected || qty <= 0) return;
    setSaving(true);
    const totalCost = qty * selected.unit_cost;

    await supabase.from('trak_project_materials').insert({
      project_id: projectId, inventory_id: selected.id, name: selected.name,
      quantity: qty, unit_cost: selected.unit_cost, total_cost: totalCost,
    });

    const newQty = Math.max(0, selected.quantity - qty);
    await supabase.from('trak_inventory').update({ quantity: newQty }).eq('id', selected.id);

    const userId = (await supabase.auth.getUser()).data.user?.id;
    await supabase.from('trak_inventory_movements').insert({
      workspace_id: workspaceId, inventory_id: selected.id, project_id: projectId,
      type: 'proyecto', quantity: qty, unit_cost: selected.unit_cost,
      notes: `Asignado al proyecto`, created_by: userId,
    });

    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h2 className="font-bold text-lg">Agregar Material del Inventario</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-3 flex-1 overflow-y-auto">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto..."
            className="w-full pl-4 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500" />

          {selected ? (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <p className="font-bold text-purple-900">{selected.name}</p>
                <button onClick={() => setSelected(null)} className="text-xs text-purple-600 hover:underline">Cambiar</button>
              </div>
              <p className="text-xs text-purple-600">Stock disponible: {selected.quantity} {selected.unit} · Costo: ${selected.unit_cost}/u</p>
              <div>
                <label className="block text-sm font-medium text-purple-800 mb-1">Cantidad a asignar</label>
                <input type="number" step="0.01" min="0.01" max={selected.quantity} value={qty}
                  onChange={e => setQty(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-white border border-purple-200 rounded-xl text-sm outline-none" />
              </div>
              <p className="text-sm font-bold text-purple-900">Total: ${(qty * selected.unit_cost).toLocaleString()}</p>
            </div>
          ) : (
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No hay productos en inventario.</p>
              ) : filtered.map(item => (
                <button key={item.id} onClick={() => { setSelected(item); setQty(1); }}
                  className="w-full text-left p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors">
                  <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">Stock: {item.quantity} {item.unit} · ${item.unit_cost}/u</p>
                </button>
              ))}
            </div>
          )}
        </div>
        {selected && (
          <div className="p-5 bg-gray-50 border-t flex justify-end gap-3 shrink-0">
            <button onClick={onClose} className="px-4 py-2 text-gray-700 text-sm font-medium rounded-xl">Cancelar</button>
            <button onClick={handleAdd} disabled={saving || qty <= 0 || qty > selected.quantity}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium">
              {saving ? 'Asignando...' : 'Asignar al Proyecto'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

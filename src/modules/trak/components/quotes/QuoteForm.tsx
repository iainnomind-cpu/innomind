import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTrak } from '../../context/TrakContext';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Plus, Trash2, Save, FileText, PackageSearch, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function QuoteForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { workspaceId, clients, projects, refreshProjects, refreshClients } = useTrak();
  
  const isEdit = id && id !== 'new';
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [showCatalog, setShowCatalog] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({ name: '', logo: '' });
  const pdfRef = useRef<HTMLDivElement>(null);
  
  const [form, setForm] = useState({
    quote_number: `COT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    title: '',
    client_id: '',
    project_id: '',
    valid_until: '',
    payment_terms: '50% anticipo, 50% a la entrega',
    notes: '',
    tax_rate: 16,
    discount: 0,
    status: 'draft'
  });

  const [items, setItems] = useState<any[]>([
    { id: 'temp-1', name: '', description: '', quantity: 1, unit_price: 0, total: 0 }
  ]);

  useEffect(() => {
    fetchCatalog();
    fetchWorkspaceSettings();
    if (isEdit) {
      fetchQuote();
    }
  }, [id, workspaceId]);

  const fetchWorkspaceSettings = async () => {
    if (!workspaceId) return;
    const { data } = await supabase.from('trak_workspace_settings').select('default_tax_rate, company_name, company_logo_url').eq('workspace_id', workspaceId).single();
    if (data) {
      setCompanyInfo({ name: data.company_name || '', logo: data.company_logo_url || '' });
      if (!isEdit && data.default_tax_rate !== undefined) {
        setForm(prev => ({ ...prev, tax_rate: data.default_tax_rate }));
      }
    }
  };

  const fetchCatalog = async () => {
    if (!workspaceId) return;
    const { data } = await supabase.from('trak_products').select('*').eq('workspace_id', workspaceId).eq('is_active', true);
    if (data) setCatalogProducts(data);
  };

  const fetchQuote = async () => {
    setIsLoading(true);
    try {
      const { data: quote } = await supabase.from('trak_quotes').select('*').eq('id', id).single();
      if (quote) {
        setForm({
          quote_number: quote.quote_number,
          title: quote.title,
          client_id: quote.client_id || '',
          project_id: quote.project_id || '',
          valid_until: quote.valid_until || '',
          payment_terms: quote.payment_terms || '',
          notes: quote.notes || '',
          tax_rate: quote.tax_rate,
          discount: quote.discount,
          status: quote.status
        });
        
        const { data: quoteItems } = await supabase.from('trak_quote_items').select('*').eq('quote_id', id).order('order_index');
        if (quoteItems && quoteItems.length > 0) {
          setItems(quoteItems);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
  const taxAmount = (subtotal - form.discount) * (form.tax_rate / 100);
  const total = subtotal - form.discount + taxAmount;

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total = newItems[index].quantity * newItems[index].unit_price;
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { id: `temp-${Date.now()}`, name: '', description: '', quantity: 1, unit_price: 0, total: 0 }]);
  };

  const addFromCatalog = (product: any) => {
    setItems([
      ...items,
      { 
        id: `temp-${Date.now()}`, 
        name: product.name, 
        description: product.description || '', 
        quantity: 1, 
        unit_price: product.unit_price, 
        total: product.unit_price 
      }
    ]);
    setShowCatalog(false);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.client_id) return alert('El título y el cliente son obligatorios');
    setSaving(true);
    try {
      let projectIdToLink = form.project_id || null;

      // Auto-create project if accepted and no project linked
      if (form.status === 'accepted' && !projectIdToLink) {
        const { data: newProject } = await supabase.from('trak_projects').insert({
          workspace_id: workspaceId,
          name: form.title,
          client_id: form.client_id,
          description: `Proyecto generado automáticamente desde cotización ${form.quote_number}`,
          status: 'planning',
          budget: total,
          color: '#10b981' // Emerald
        }).select('id').single();
        
        if (newProject) {
          projectIdToLink = newProject.id;
          refreshProjects(); // Update global state
        }
      }

      const quoteData = {
        workspace_id: workspaceId,
        quote_number: form.quote_number,
        title: form.title,
        client_id: form.client_id,
        project_id: projectIdToLink,
        valid_until: form.valid_until || null,
        payment_terms: form.payment_terms,
        notes: form.notes,
        tax_rate: form.tax_rate,
        discount: form.discount,
        subtotal,
        tax_amount: taxAmount,
        total,
        status: form.status
      };

      let currentQuoteId = id;

      if (isEdit) {
        await supabase.from('trak_quotes').update(quoteData).eq('id', id);
        // Wipe old items and recreate
        await supabase.from('trak_quote_items').delete().eq('quote_id', id);
      } else {
        const { data } = await supabase.from('trak_quotes').insert(quoteData).select('id').single();
        if (data) currentQuoteId = data.id;
      }

      // Insert Items
      if (currentQuoteId) {
        const itemsToInsert = items.map((item, index) => ({
          quote_id: currentQuoteId,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
          order_index: index
        }));
        await supabase.from('trak_quote_items').insert(itemsToInsert);
      }

      // Sincronizar estado del lead/cliente de forma reactiva
      if (form.client_id) {
        if (form.status === 'accepted') {
          await supabase
            .from('trak_clients')
            .update({ status: 'active', pipeline_stage: 'won' })
            .eq('id', form.client_id);
        } else if (form.status === 'rejected') {
          await supabase
            .from('trak_clients')
            .update({ pipeline_stage: 'lost' })
            .eq('id', form.client_id);
        } else {
          // Si es borrador, enviada, etc., solo marcar como cotizado si no estaba ganado
          const { data: client } = await supabase
            .from('trak_clients')
            .select('pipeline_stage')
            .eq('id', form.client_id)
            .single();
          if (client && client.pipeline_stage !== 'won') {
            await supabase
              .from('trak_clients')
              .update({ pipeline_stage: 'quoted' })
              .eq('id', form.client_id);
          }
        }
        if (refreshClients) await refreshClients();
      }

      navigate('/trak/quotes');
    } catch (err) {
      console.error('Error saving quote', err);
      alert('Error al guardar la cotización');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    setDownloadingPDF(true);
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`${form.quote_number}.pdf`);
    } catch (err) {
      console.error('Error generando PDF', err);
      alert('Error al generar el PDF. Intenta de nuevo.');
    } finally {
      setDownloadingPDF(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Cargando cotización...</div>;

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/trak/quotes')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-600 transition-colors mb-6 font-medium"
        >
          <ChevronLeft size={16} /> Volver a Cotizaciones
        </button>

        {/* Print-only Header */}
        <div className="hidden print:block mb-8 border-b border-gray-200 pb-8">
          <div className="flex justify-between items-start">
            <div>
              {companyInfo.logo ? (
                <img src={companyInfo.logo} alt="Logo" className="h-16 object-contain mb-4" />
              ) : (
                <h1 className="text-2xl font-black text-gray-900 mb-4">{companyInfo.name || 'Empresa'}</h1>
              )}
              <p className="text-sm text-gray-500">Cotización: <strong>{form.quote_number}</strong></p>
              <p className="text-sm text-gray-500">Fecha: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Cotización</h2>
              <p className="text-sm text-gray-700">{form.title}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 print:hidden">
            <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Editar Cotización' : 'Nueva Cotización'}</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-500 font-medium bg-white px-3 py-1 rounded border border-gray-200">
                {form.quote_number}
              </span>
              <select 
                value={form.status} 
                onChange={e => setForm({...form, status: e.target.value})}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-bold outline-none"
              >
                <option value="draft">Borrador</option>
                <option value="sent">Enviada</option>
                <option value="accepted">Aceptada</option>
                <option value="rejected">Rechazada</option>
              </select>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* General Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Título de la Cotización *</label>
                <input type="text" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500" placeholder="Ej. Desarrollo de App Móvil"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                <select value={form.client_id} onChange={e=>setForm({...form, client_id:e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">Seleccionar Cliente...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto Relacionado (Opcional)</label>
                <select value={form.project_id} onChange={e=>setForm({...form, project_id:e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">Ninguno</option>
                  {projects.filter(p => !form.client_id || p.client_id === form.client_id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Válida Hasta</label>
                <input type="date" value={form.valid_until} onChange={e=>setForm({...form, valid_until:e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500"/>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText size={18}/> Conceptos</h2>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                    <tr>
                      <th className="text-left px-4 py-3 w-1/2">Concepto</th>
                      <th className="text-right px-4 py-3 w-24">Cant.</th>
                      <th className="text-right px-4 py-3 w-32">Precio Unit.</th>
                      <th className="text-right px-4 py-3 w-32">Total</th>
                      <th className="px-4 py-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((item, index) => (
                      <tr key={item.id} className="bg-white">
                        <td className="p-2">
                          <input type="text" placeholder="Nombre del concepto" value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)} className="w-full p-2 bg-transparent border-none outline-none font-medium mb-1"/>
                          <input type="text" placeholder="Descripción adicional..." value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} className="w-full p-2 bg-transparent border-none outline-none text-xs text-gray-500"/>
                        </td>
                        <td className="p-2 align-top pt-3">
                          <input type="number" min="1" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-right outline-none"/>
                        </td>
                        <td className="p-2 align-top pt-3">
                          <input type="number" step="0.01" value={item.unit_price} onChange={e => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-right outline-none"/>
                        </td>
                        <td className="p-2 align-top pt-3 text-right">
                          <div className="p-2 font-bold text-gray-900">${item.total.toLocaleString('en-US', {minimumFractionDigits:2})}</div>
                        </td>
                        <td className="p-2 align-top pt-4 text-center">
                          <button onClick={() => removeItem(index)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-3 bg-gray-50/50 border-t border-gray-200 flex items-center gap-4">
                  <button onClick={addItem} className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm px-2 py-1 transition-colors">
                    <Plus size={16} /> Fila en blanco
                  </button>
                  <div className="relative">
                    <button onClick={() => setShowCatalog(!showCatalog)} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm px-2 py-1 transition-colors">
                      <PackageSearch size={16} /> Desde Catálogo
                    </button>
                    {showCatalog && (
                      <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden z-10 max-h-64 overflow-y-auto">
                        <div className="p-2 border-b border-gray-100 bg-gray-50/50">
                          <p className="text-xs font-bold text-gray-500 uppercase">Selecciona un producto/servicio</p>
                        </div>
                        {catalogProducts.length === 0 ? (
                          <div className="p-4 text-center text-sm text-gray-500">Catálogo vacío. Agrega ítems desde el módulo de Catálogo.</div>
                        ) : (
                          catalogProducts.map(p => (
                            <button key={p.id} onClick={() => addFromCatalog(p)} className="w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                                  {p.sku && <p className="text-[10px] text-gray-400 font-mono">{p.sku}</p>}
                                </div>
                                <span className="font-bold text-purple-600 text-sm">${p.unit_price}</span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Totals & Notes */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Términos de Pago</label>
                  <textarea value={form.payment_terms} onChange={e=>setForm({...form, payment_terms:e.target.value})} rows={3} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none resize-none"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas Adicionales</label>
                  <textarea value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} rows={3} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none resize-none"/>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 h-fit">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">${subtotal.toLocaleString('en-US', {minimumFractionDigits:2})}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <div className="flex items-center gap-2">
                      <span>Descuento</span>
                      <input type="number" value={form.discount} onChange={e=>setForm({...form, discount:parseFloat(e.target.value)||0})} className="w-20 p-1 bg-white border border-gray-200 rounded text-right outline-none"/>
                    </div>
                    <span className="font-medium">-${form.discount.toLocaleString('en-US', {minimumFractionDigits:2})}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600 border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span>Impuestos (%)</span>
                      <input type="number" value={form.tax_rate} onChange={e=>setForm({...form, tax_rate:parseFloat(e.target.value)||0})} className="w-16 p-1 bg-white border border-gray-200 rounded text-right outline-none"/>
                    </div>
                    <span className="font-medium">${taxAmount.toLocaleString('en-US', {minimumFractionDigits:2})}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-black text-purple-600">${total.toLocaleString('en-US', {minimumFractionDigits:2})}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 print:hidden">
            <button onClick={() => navigate('/trak/quotes')} className="px-6 py-2.5 text-gray-700 hover:bg-gray-200 font-medium rounded-xl text-sm transition-colors">
              Cancelar
            </button>
            {isEdit && (
              <button
                onClick={handleDownloadPDF}
                disabled={downloadingPDF}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-xl text-sm transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
              >
                <Download size={18} />
                {downloadingPDF ? 'Generando PDF...' : 'Descargar PDF'}
              </button>
            )}
            <button onClick={handleSave} disabled={saving || !form.title || !form.client_id} className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-colors flex items-center gap-2 shadow-lg shadow-purple-600/20">
              <Save size={18} />
              {saving ? 'Guardando...' : 'Guardar Cotización'}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden PDF Template */}
      <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', width: '210mm', background: '#fff', zIndex: -1 }}>
        <div ref={pdfRef} style={{ width: '210mm', minHeight: '297mm', padding: '20mm', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', color: '#333', fontSize: '12px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #7c3aed', paddingBottom: '16px', marginBottom: '24px' }}>
            <div>
              {companyInfo.logo
                ? <img src={companyInfo.logo} alt="Logo" style={{ maxHeight: '70px', maxWidth: '180px', objectFit: 'contain' }} />
                : <div style={{ fontSize: '22px', fontWeight: 900, color: '#7c3aed' }}>{companyInfo.name || 'Empresa'}</div>
              }
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#e5e7eb', letterSpacing: '4px', textTransform: 'uppercase' }}>COTIZACIÓN</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#111' }}>#{form.quote_number}</div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Fecha: {new Date().toLocaleDateString('es-MX')}</div>
              {form.valid_until && <div style={{ fontSize: '11px', color: '#6b7280' }}>Válida hasta: {new Date(form.valid_until + 'T12:00:00').toLocaleDateString('es-MX')}</div>}
            </div>
          </div>

          {/* Client & Company Info */}
          <div style={{ display: 'flex', gap: '32px', marginBottom: '24px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '1px', marginBottom: '6px' }}>DE (EMISOR):</div>
              <div style={{ fontWeight: 700, color: '#111' }}>{companyInfo.name || 'Tu Empresa'}</div>
            </div>
            <div style={{ flex: 1, background: '#f9fafb', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '1px', marginBottom: '6px' }}>PARA (CLIENTE):</div>
              <div style={{ fontWeight: 700, color: '#111', fontSize: '14px' }}>
                {clients.find(c => c.id === form.client_id)?.company_name || '—'}
              </div>
            </div>
          </div>

          {/* Title */}
          <div style={{ background: '#f3f4f6', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px', fontWeight: 700, color: '#374151' }}>
            {form.title}
          </div>

          {/* Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ background: '#7c3aed', color: '#fff' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase' }}>Concepto</th>
                <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: '10px', textTransform: 'uppercase', width: '60px' }}>Cant.</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: '10px', textTransform: 'uppercase', width: '100px' }}>P. Unit.</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: '10px', textTransform: 'uppercase', width: '100px' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e5e7eb', background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                  <td style={{ padding: '8px 10px' }}>
                    <div style={{ fontWeight: 600, color: '#111' }}>{item.name}</div>
                    {item.description && <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>{item.description}</div>}
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', color: '#374151' }}>{item.quantity}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', color: '#374151' }}>${(item.unit_price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#111' }}>${(item.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
            <div style={{ width: '220px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e5e7eb', fontSize: '12px', color: '#6b7280' }}>
                <span>Subtotal:</span><span>${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              {form.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e5e7eb', fontSize: '12px', color: '#6b7280' }}>
                  <span>Descuento:</span><span>-${form.discount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e5e7eb', fontSize: '12px', color: '#6b7280' }}>
                <span>Impuestos ({form.tax_rate}%):</span><span>${taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `3px solid #7c3aed` }}>
                <span style={{ fontSize: '16px', fontWeight: 900, color: '#111' }}>Total:</span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#7c3aed' }}>${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          {(form.payment_terms || form.notes) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '11px' }}>
              {form.payment_terms && (
                <div>
                  <div style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '9px', color: '#9ca3af', letterSpacing: '1px', marginBottom: '4px' }}>Términos de Pago</div>
                  <div style={{ color: '#374151', whiteSpace: 'pre-wrap' }}>{form.payment_terms}</div>
                </div>
              )}
              {form.notes && (
                <div>
                  <div style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '9px', color: '#9ca3af', letterSpacing: '1px', marginBottom: '4px' }}>Notas</div>
                  <div style={{ color: '#374151', whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>{form.notes}</div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: '40px', borderTop: '1px solid #e5e7eb', paddingTop: '12px', textAlign: 'center', color: '#9ca3af', fontSize: '10px' }}>
            {companyInfo.name} — Gracias por su confianza.
          </div>
        </div>
      </div>
    </div>
  );
}

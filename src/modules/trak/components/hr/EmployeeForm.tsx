import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTrak } from '../../context/TrakContext';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Save, Upload, FileText, Trash2 } from 'lucide-react';

export default function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { workspaceId } = useTrak();
  
  const isEdit = id && id !== 'new';
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);
  
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    role: '',
    email: '',
    phone: '',
    payment_type: 'hourly',
    salary_amount: 0,
    schedule_details: '',
    status: 'active'
  });

  const [documents, setDocuments] = useState<{name: string, url: string}[]>([]);
  const [newDocName, setNewDocName] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');

  useEffect(() => {
    if (isEdit) fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('trak_employees').select('*').eq('id', id).single();
    if (data) {
      setForm({
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        email: data.email || '',
        phone: data.phone || '',
        payment_type: data.payment_type,
        salary_amount: data.salary_amount,
        schedule_details: data.schedule_details || '',
        status: data.status
      });
      setDocuments(data.documents || []);
    }
    setIsLoading(false);
  };

  const addDocument = () => {
    if (!newDocName || !newDocUrl) return;
    setDocuments([...documents, { name: newDocName, url: newDocUrl }]);
    setNewDocName('');
    setNewDocUrl('');
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!form.first_name || !form.role) return alert('Nombre y cargo son obligatorios.');
    setSaving(true);
    try {
      const payload = {
        workspace_id: workspaceId,
        ...form,
        documents
      };

      if (isEdit) {
        await supabase.from('trak_employees').update(payload).eq('id', id);
      } else {
        await supabase.from('trak_employees').insert(payload);
      }
      navigate('/trak/hr');
    } catch (err) {
      console.error(err);
      alert('Error guardando empleado');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Cargando empleado...</div>;

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/trak/hr')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-600 transition-colors mb-6 font-medium"
        >
          <ChevronLeft size={16} /> Volver a RRHH
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Editar Empleado' : 'Nuevo Empleado'}</h1>
            <select 
              value={form.status} 
              onChange={e => setForm({...form, status: e.target.value})}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-bold outline-none"
            >
              <option value="active">Activo</option>
              <option value="on_leave">Permiso / Vacaciones</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>

          <div className="p-6 space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input type="text" value={form.first_name} onChange={e=>setForm({...form, first_name:e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                <input type="text" value={form.last_name} onChange={e=>setForm({...form, last_name:e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo / Puesto *</label>
                <input type="text" value={form.role} onChange={e=>setForm({...form, role:e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500" placeholder="Ej. Desarrollador Frontend" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horario (Detalles)</label>
                <input type="text" value={form.schedule_details} onChange={e=>setForm({...form, schedule_details:e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500" placeholder="Ej. L-V 9am a 6pm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input type="tel" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Esquema de Pago</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Pago</label>
                  <select value={form.payment_type} onChange={e=>setForm({...form, payment_type:e.target.value})} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="hourly">Por Hora</option>
                    <option value="daily">Por Día</option>
                    <option value="monthly">Mensual (Fijo)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto ($)</label>
                  <input type="number" step="0.01" value={form.salary_amount} onChange={e=>setForm({...form, salary_amount:parseFloat(e.target.value)||0})} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText size={18} /> Documentación Digital</h3>
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex gap-2 mb-4">
                  <input type="text" placeholder="Nombre (Ej. Contrato, INE)" value={newDocName} onChange={e => setNewDocName(e.target.value)} className="flex-1 p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none"/>
                  <input type="text" placeholder="URL del archivo (Drive, Dropbox...)" value={newDocUrl} onChange={e => setNewDocUrl(e.target.value)} className="flex-1 p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none"/>
                  <button onClick={addDocument} className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-medium text-sm hover:bg-purple-200 transition-colors">
                    Adjuntar
                  </button>
                </div>
                
                {documents.length > 0 ? (
                  <ul className="space-y-2">
                    {documents.map((doc, i) => (
                      <li key={i} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200">
                        <a href={doc.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-purple-600 hover:underline flex items-center gap-2">
                          <FileText size={16} /> {doc.name}
                        </a>
                        <button onClick={() => removeDocument(i)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No hay documentos adjuntos.</p>
                )}
              </div>
            </div>

          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button onClick={() => navigate('/trak/hr')} className="px-6 py-2.5 text-gray-700 hover:bg-gray-200 font-medium rounded-xl text-sm transition-colors">
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-colors flex items-center gap-2 shadow-lg shadow-purple-600/20">
              <Save size={18} />
              {saving ? 'Guardando...' : 'Guardar Empleado'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useUsers } from '@/context/UserContext';
import { createTicket } from '../supportApi';
import { ArrowLeft, Send, Bug, HelpCircle, Lightbulb, MoreHorizontal, Loader2 } from 'lucide-react';

const CATEGORIES = [
  { id: 'bug', label: 'Error / Bug', desc: 'Algo no funciona correctamente', icon: Bug, color: 'border-red-200 bg-red-50 text-red-700' },
  { id: 'duda', label: 'Pregunta / Duda', desc: 'Necesito ayuda con algo', icon: HelpCircle, color: 'border-blue-200 bg-blue-50 text-blue-700' },
  { id: 'mejora', label: 'Sugerencia', desc: 'Tengo una idea para mejorar', icon: Lightbulb, color: 'border-yellow-200 bg-yellow-50 text-yellow-700' },
  { id: 'otro', label: 'Otro', desc: 'Otro tipo de solicitud', icon: MoreHorizontal, color: 'border-gray-200 bg-gray-50 text-gray-700' },
];

const PRIORITIES = [
  { id: 'baja', label: 'Baja', desc: 'No afecta mi operación', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  { id: 'media', label: 'Media', desc: 'Afecta parcialmente', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'alta', label: 'Alta', desc: 'Impacta mi trabajo diario', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 'urgente', label: 'Urgente', desc: 'Sistema caído / bloqueado', color: 'bg-red-100 text-red-700 border-red-200' },
];

export default function NewTicketForm() {
  const { user } = useAuth();
  const { currentUser } = useUsers();
  const navigate = useNavigate();

  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('media');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = category && subject.trim() && description.trim();

  const handleSubmit = async () => {
    if (!isValid || !user?.email) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const ticket = await createTicket({
        subject: subject.trim(),
        description: description.trim(),
        category: category as any,
        priority: priority as any,
        user_email: user.email,
        user_name: currentUser?.name || user.email.split('@')[0],
        company_name: '',
        status: 'abierto',
      });

      if (ticket) {
        navigate('/crm/support');
      } else {
        setError('No se pudo crear el ticket. Intenta nuevamente.');
      }
    } catch (e) {
      setError('Error de conexión. Verifica tu internet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/crm/support')}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Nuevo Reporte</h1>
          <p className="text-sm text-gray-500">Describe tu problema o solicitud</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {/* Category */}
        <div className="p-6">
          <label className="block text-sm font-bold text-gray-700 mb-3">¿Qué tipo de reporte es? *</label>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const selected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${selected
                    ? `${cat.color} border-current ring-2 ring-current/20`
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                >
                  <Icon size={20} className={selected ? '' : 'text-gray-400'} />
                  <div className="mt-2 font-semibold text-sm">{cat.label}</div>
                  <div className={`text-xs mt-0.5 ${selected ? 'opacity-75' : 'text-gray-400'}`}>{cat.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority */}
        <div className="p-6">
          <label className="block text-sm font-bold text-gray-700 mb-3">¿Qué tan urgente es?</label>
          <div className="flex gap-2 flex-wrap">
            {PRIORITIES.map(p => (
              <button
                key={p.id}
                onClick={() => setPriority(p.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${priority === p.id
                  ? `${p.color} ring-2 ring-current/20`
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div className="p-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">Asunto *</label>
          <input
            type="text"
            placeholder="Ej: No puedo generar cotizaciones"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Description */}
        <div className="p-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">Descripción detallada *</label>
          <textarea
            placeholder="Describe el problema con el mayor detalle posible: qué estabas haciendo, qué esperabas que pasara y qué pasó en su lugar..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
        </div>

        {/* Submit */}
        <div className="p-6 bg-gray-50 rounded-b-xl">
          {error && (
            <p className="text-sm text-red-600 font-medium mb-3">{error}</p>
          )}
          <button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-bold text-white transition-all ${isValid && !isSubmitting
              ? 'bg-blue-600 hover:bg-blue-700 shadow-sm'
              : 'bg-gray-300 cursor-not-allowed'
              }`}
          >
            {isSubmitting ? (
              <><Loader2 size={18} className="animate-spin" /> Enviando...</>
            ) : (
              <><Send size={18} /> Enviar Reporte</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

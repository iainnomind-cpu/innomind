import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useUsers } from '@/context/UserContext';
import {
  fetchTicketById, fetchTicketMessages, sendTicketMessage,
  SupportTicket, TicketMessage
} from '../supportApi';
import {
  ArrowLeft, Send, AlertCircle, Clock, CheckCircle2,
  Bug, HelpCircle, Lightbulb, MoreHorizontal, Loader2
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  abierto: { label: 'Abierto', color: 'bg-blue-100 text-blue-700' },
  en_progreso: { label: 'En Progreso', color: 'bg-yellow-100 text-yellow-700' },
  en_espera: { label: 'En Espera', color: 'bg-orange-100 text-orange-700' },
  resuelto: { label: 'Resuelto', color: 'bg-green-100 text-green-700' },
  cerrado: { label: 'Cerrado', color: 'bg-gray-100 text-gray-500' },
};

const PRIORITY_CONFIG: Record<string, { label: string; dot: string }> = {
  baja: { label: 'Baja', dot: 'bg-gray-400' },
  media: { label: 'Media', dot: 'bg-blue-500' },
  alta: { label: 'Alta', dot: 'bg-orange-500' },
  urgente: { label: 'Urgente', dot: 'bg-red-500' },
};

const CATEGORY_LABELS: Record<string, string> = {
  bug: 'Error / Bug',
  duda: 'Pregunta / Duda',
  mejora: 'Sugerencia',
  otro: 'Otro',
};

export default function TicketDetail() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { user } = useAuth();
  const { currentUser } = useUsers();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ticketId) loadData();
  }, [ticketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadData = async () => {
    setLoading(true);
    const [t, msgs] = await Promise.all([
      fetchTicketById(ticketId!),
      fetchTicketMessages(ticketId!),
    ]);
    setTicket(t);
    setMessages(msgs);
    setLoading(false);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !ticket || !user?.email) return;
    setSending(true);
    const msg = await sendTicketMessage({
      ticket_id: ticket.id,
      sender_email: user.email,
      sender_name: currentUser?.name || user.email.split('@')[0],
      message: newMessage.trim(),
      is_internal_note: false,
    });
    if (msg) {
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="mx-auto text-gray-300 mb-4" size={48} />
        <h3 className="font-semibold text-gray-700">Ticket no encontrado</h3>
        <button onClick={() => navigate('/crm/support')} className="mt-4 text-blue-600 text-sm font-medium hover:underline">
          Volver a soporte
        </button>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.abierto;
  const priorityCfg = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.media;
  const isClosed = ticket.status === 'cerrado' || ticket.status === 'resuelto';

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
        <button onClick={() => navigate('/crm/support')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 mt-0.5">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-mono text-gray-400">#{ticket.ticket_number}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusCfg.color}`}>{statusCfg.label}</span>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${priorityCfg.dot}`} />
              <span className="text-[10px] font-semibold text-gray-500">{priorityCfg.label}</span>
            </div>
            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{CATEGORY_LABELS[ticket.category]}</span>
          </div>
          <h1 className="text-lg font-bold text-gray-900 truncate">{ticket.subject}</h1>
          <p className="text-xs text-gray-400 mt-1">
            Creado el {new Date(ticket.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {/* Original description as first message */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
            {(ticket.user_name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-gray-900">{ticket.user_name || 'Tú'}</span>
              <span className="text-xs text-gray-400">{new Date(ticket.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl rounded-tl-none p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </div>
          </div>
        </div>

        {messages.map(msg => {
          const isMe = msg.sender_email === user?.email;
          return (
            <div key={msg.id} className={`flex gap-3 ${isMe ? '' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isMe ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-700'}`}>
                {(msg.sender_name || '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">{msg.sender_name || msg.sender_email}</span>
                  {!isMe && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">Soporte</span>}
                  <span className="text-xs text-gray-400">
                    {new Date(msg.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} {new Date(msg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={`rounded-xl rounded-tl-none p-4 text-sm leading-relaxed whitespace-pre-wrap ${isMe ? 'bg-blue-50 border border-blue-100 text-gray-700' : 'bg-green-50 border border-green-100 text-gray-700'}`}>
                  {msg.message}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!isClosed ? (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex gap-3">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              rows={2}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              className={`px-4 rounded-xl font-semibold text-white transition-all self-end py-3 ${newMessage.trim() && !sending ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      ) : (
        <div className="border-t border-gray-200 pt-4 text-center text-sm text-gray-500 bg-gray-50 -mx-6 -mb-6 py-4 px-6 rounded-b-lg">
          <CheckCircle2 size={18} className="inline mr-2 text-green-500" />
          Este ticket ha sido {ticket.status === 'resuelto' ? 'resuelto' : 'cerrado'}.
        </div>
      )}
    </div>
  );
}

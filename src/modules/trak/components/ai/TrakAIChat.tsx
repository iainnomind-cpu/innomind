import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAI } from '../../context/AIContext';
import { X, Send, User, AlertTriangle, Zap, FolderKanban, MessageSquarePlus, Clock, Trash2, ChevronLeft, Package, Users, FileText } from 'lucide-react';

// Inline Chatbot SVG icon for the floating button and header
const InnoIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" fill="none" />
    <circle cx="8.5" cy="11" r="1.5" fill="currentColor" />
    <circle cx="15.5" cy="11" r="1.5" fill="currentColor" />
    <path d="M9 14.5C9 14.5 10.5 16 12 16C13.5 16 15 14.5 15 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="8" y1="18" x2="10" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="16" y1="18" x2="14" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="9" y="2" width="6" height="2.5" rx="1.2" stroke="currentColor" strokeWidth="1.2" fill="none" />
  </svg>
);

export default function TrakAIChat() {
  const {
    isOpen, setIsOpen, messages, sendMessage, isLoading,
    tokensUsed, tokensLimit,
    conversations, activeConversationId, startNewChat, loadConversation, deleteConversation
  } = useAI();

  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getModuleContext = () => {
    const path = location.pathname;
    
    // Trak routes
    if (path.startsWith('/trak')) {
      if (path.includes('/projects')) return 'Proyectos (Trak)';
      if (path.includes('/tasks')) return 'Tareas (Trak)';
      if (path.includes('/quotes')) return 'Cotizaciones (Trak)';
      if (path.includes('/hr')) return 'Recursos Humanos (Trak)';
      if (path.includes('/inventory')) return 'Inventario (Trak)';
      if (path.includes('/calendar')) return 'Calendario (Trak)';
      if (path.includes('/clients')) return 'Clientes (Trak)';
      if (path.includes('/reports')) return 'Reportes (Trak)';
      if (path.includes('/time')) return 'Control de Tiempo (Trak)';
      if (path.includes('/settings')) return 'Configuración (Trak)';
      return 'Dashboard Trak';
    }

    // CRM-ERP routes
    if (path.startsWith('/crm')) {
      if (path.includes('/dashboard')) return 'Dashboard de CRM';
      if (path.includes('/embudo')) return 'Embudo de Ventas';
      if (path.includes('/prospectos')) {
        const search = location.search;
        if (search.includes('tab=clientes')) return 'Clientes Corporativos';
        return 'Prospectos y Oportunidades';
      }
      if (path.includes('/calendar')) return 'Calendario Corporativo';
      if (path.includes('/settings')) return 'Configuración de Empresa';
      if (path.includes('/support')) return 'Soporte y Tickets';
      if (path.includes('/quotes')) {
        if (path.includes('/plantillas')) return 'Plantillas de Cotización';
        return 'Cotizaciones de CRM';
      }
      if (path.includes('/inventory')) return 'Inventario Maestro (ERP)';
      if (path.includes('/finance')) return 'Finanzas y Tesorería';
      if (path.includes('/workspace')) return 'Nodo / Espacio Colaborativo';
    }

    // Compras / Procurement routes
    if (path.startsWith('/compras')) {
      return 'Compras y Abastecimiento';
    }

    return 'Dashboard General';
  };

  const moduleContext = getModuleContext();

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input, moduleContext);
    setInput('');
  };

  const handleQuickAction = (action: string) => {
    sendMessage(action, moduleContext);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const tokenPercentage = (tokensUsed / tokensLimit) * 100;
  const isWarning = tokenPercentage > 80;
  const isDanger = tokenPercentage > 95;

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  const formatDate = (ts: string) => {
    try {
      const d = new Date(ts);
      const today = new Date();
      if (d.toDateString() === today.toDateString()) return 'Hoy';
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (d.toDateString() === yesterday.toDateString()) return 'Ayer';
      return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    } catch { return ''; }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full shadow-xl shadow-purple-600/30 flex items-center justify-center transition-all hover:scale-110 z-50 group"
          title="Abrir Inno AI"
        >
          <InnoIcon size={28} className="group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Chat Panel */}
      <div className={`fixed bottom-6 right-6 w-[400px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col transition-all duration-300 transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100 h-[620px] max-h-[calc(100vh-6rem)]' : 'scale-90 opacity-0 pointer-events-none h-0'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-2xl shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center">
              <InnoIcon size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                Inno
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </h3>
              <p className="text-[10px] text-purple-200 font-medium">{moduleContext}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Historial de conversaciones"
            >
              <Clock size={16} />
            </button>
            <button
              onClick={startNewChat}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Nueva conversación"
            >
              <MessageSquarePlus size={16} />
            </button>
            <button onClick={() => { setIsOpen(false); setShowHistory(false); }} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Token Meter */}
        <div className="px-4 py-2 border-b border-gray-100 shrink-0 bg-white">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tokens</span>
            <span className={`text-[10px] font-bold ${isDanger ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-gray-400'}`}>
              {tokensUsed.toLocaleString()} / {tokensLimit.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isDanger ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(tokenPercentage, 100)}%` }}
            />
          </div>
          {isDanger && (
            <div className="flex items-center gap-1 mt-1 text-[10px] text-red-600 font-medium">
              <AlertTriangle size={10} /> Límite casi alcanzado. Recarga pronto.
            </div>
          )}
        </div>

        {/* History Panel */}
        {showHistory ? (
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                  <ChevronLeft size={16} className="text-gray-600" />
                </button>
                <h4 className="font-bold text-gray-900 text-sm">Historial de Conversaciones</h4>
              </div>

              {conversations.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Clock size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">Sin historial aún</p>
                  <p className="text-xs mt-1">Tus conversaciones aparecerán aquí.</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {conversations.map(conv => (
                    <div
                      key={conv.id}
                      className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                        conv.id === activeConversationId
                          ? 'bg-purple-50 border border-purple-200'
                          : 'bg-white border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50'
                      }`}
                      onClick={() => { loadConversation(conv.id); setShowHistory(false); }}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        conv.id === activeConversationId ? 'bg-purple-200 text-purple-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <InnoIcon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{conv.title}</p>
                        <p className="text-[10px] text-gray-400 font-medium">
                          {formatDate(conv.updatedAt)} · {conv.messages.length} msgs
                        </p>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); deleteConversation(conv.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Eliminar"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-4 text-gray-500">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600 rounded-2xl flex items-center justify-center mb-1">
                    <InnoIcon size={36} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 mb-1">¡Hola! Soy Inno 👋</p>
                    <p className="text-xs text-gray-500">Tu asistente inteligente. Tengo acceso a todos tus módulos.</p>
                  </div>

                  <div className="w-full space-y-2 mt-3 text-left">
                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Prueba preguntarme:</p>
                    <button onClick={() => handleQuickAction('¿Qué tareas tengo pendientes?')} className="w-full bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50 p-2.5 rounded-xl text-xs font-medium text-gray-700 transition-colors flex items-center gap-2">
                      <Zap size={14} className="text-amber-500 shrink-0" /> ¿Qué tareas tengo pendientes?
                    </button>
                    <button onClick={() => handleQuickAction('Dame un resumen de mis proyectos activos')} className="w-full bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50 p-2.5 rounded-xl text-xs font-medium text-gray-700 transition-colors flex items-center gap-2 text-left">
                      <FolderKanban size={14} className="text-blue-500 shrink-0" /> Resumen de mis proyectos
                    </button>
                    <button onClick={() => handleQuickAction('¿Qué productos tenemos en inventario?')} className="w-full bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50 p-2.5 rounded-xl text-xs font-medium text-gray-700 transition-colors flex items-center gap-2 text-left">
                      <Package size={14} className="text-emerald-500 shrink-0" /> ¿Qué hay en inventario?
                    </button>
                    <button onClick={() => handleQuickAction('¿Quiénes son mis clientes?')} className="w-full bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50 p-2.5 rounded-xl text-xs font-medium text-gray-700 transition-colors flex items-center gap-2 text-left">
                      <Users size={14} className="text-indigo-500 shrink-0" /> ¿Quiénes son mis clientes?
                    </button>
                  </div>
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'user'
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-sm'
                    }`}>
                      {msg.role === 'user' ? <User size={13} /> : <InnoIcon size={13} />}
                    </div>
                    <div className={`px-3.5 py-2.5 rounded-2xl max-w-[80%] text-sm ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-sm'
                        : 'bg-white border border-gray-200 text-gray-700 rounded-tl-sm shadow-sm'
                    }`}>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      <p className={`text-[9px] mt-1.5 ${msg.role === 'user' ? 'text-indigo-200' : 'text-gray-300'}`}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-sm flex items-center justify-center shrink-0">
                    <InnoIcon size={13} className="animate-pulse" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200 rounded-tl-sm shadow-sm flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-[10px] text-gray-400 ml-1 font-medium">Inno está pensando...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 rounded-b-2xl shrink-0">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Pregúntale a Inno..."
                  className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-100 rounded-xl pl-4 pr-12 py-3 text-sm text-gray-900 transition-all outline-none"
                  disabled={isLoading || isDanger}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading || isDanger}
                  className="absolute right-2 p-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg disabled:opacity-30 disabled:bg-gray-300 disabled:from-gray-300 disabled:to-gray-300 transition-all hover:shadow-md"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </>
  );
}

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { MessageSquare, AlertTriangle, Flag, Send, CheckCircle2, Clock } from 'lucide-react';

const typeConfig: Record<string, {icon: any, color: string, label: string}> = {
  comment:       { icon: MessageSquare,  color: 'bg-blue-100 text-blue-600',    label: 'Comentario' },
  issue:         { icon: AlertTriangle,  color: 'bg-red-100 text-red-600',      label: 'Incidencia' },
  status_change: { icon: Flag,           color: 'bg-purple-100 text-purple-600', label: 'Cambio de Estado' },
  milestone:     { icon: CheckCircle2,   color: 'bg-emerald-100 text-emerald-600', label: 'Hito' },
  file:          { icon: Flag,           color: 'bg-amber-100 text-amber-600',  label: 'Archivo' },
};

export default function ProjectActivity({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState('comment');
  const [sending, setSending] = useState(false);

  useEffect(() => { fetchActivities(); }, [projectId]);

  const fetchActivities = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('trak_project_activity')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    if (data) setActivities(data);
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    if (!newContent.trim()) return;
    setSending(true);
    await supabase.from('trak_project_activity').insert({
      project_id: projectId,
      user_id: user?.id,
      type: newType,
      content: newContent.trim(),
    });
    setNewContent('');
    setNewType('comment');
    fetchActivities();
    setSending(false);
  };

  const toggleResolved = async (id: string, current: boolean) => {
    await supabase.from('trak_project_activity').update({ is_resolved: !current }).eq('id', id);
    fetchActivities();
  };

  return (
    <div className="space-y-6">
      {/* Composer */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex gap-3 mb-3">
          <select
            value={newType}
            onChange={e => setNewType(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none"
          >
            <option value="comment">💬 Comentario</option>
            <option value="issue">⚠️ Incidencia / Falla</option>
            <option value="milestone">✅ Hito Alcanzado</option>
            <option value="status_change">🏷️ Actualización</option>
          </select>
        </div>
        <div className="flex gap-3">
          <textarea
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            rows={2}
            placeholder={newType === 'issue' ? 'Describe la falla o contratiempo...' : 'Escribe un comentario o actualización...'}
            className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-purple-500"
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSubmit(); }}
          />
          <button
            onClick={handleSubmit}
            disabled={sending || !newContent.trim()}
            className="self-end px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-purple-600/20"
          >
            <Send size={16} /> Publicar
          </button>
        </div>
        <p className="text-[11px] text-gray-400 mt-2">Ctrl + Enter para enviar rápido</p>
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-400">Cargando actividad...</div>
      ) : activities.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Clock className="mx-auto mb-3 text-gray-300" size={40} />
          <p className="font-medium text-gray-900">Sin actividad registrada</p>
          <p className="text-sm text-gray-500 mt-1">Agrega comentarios, reporta incidencias o registra hitos.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
          <div className="space-y-4">
            {activities.map(act => {
              const cfg = typeConfig[act.type] || typeConfig.comment;
              const Icon = cfg.icon;
              return (
                <div key={act.id} className={`relative flex gap-4 pl-1 ${act.type === 'issue' && !act.is_resolved ? 'animate-pulse-subtle' : ''}`}>
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-sm ${cfg.color}`}>
                    <Icon size={18} />
                  </div>
                  <div className={`flex-1 bg-white rounded-2xl border shadow-sm p-4 ${act.type === 'issue' && !act.is_resolved ? 'border-red-200 bg-red-50/30' : 'border-gray-200'}`}>
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                        <span className="text-xs text-gray-400">{new Date(act.created_at).toLocaleString()}</span>
                      </div>
                      {act.type === 'issue' && (
                        <button
                          onClick={() => toggleResolved(act.id, act.is_resolved)}
                          className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors ${act.is_resolved ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700 hover:bg-emerald-100 hover:text-emerald-700'}`}
                        >
                          {act.is_resolved ? '✅ Resuelta' : 'Marcar Resuelta'}
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{act.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

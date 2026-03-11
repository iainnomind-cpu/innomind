import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { AtSign, Check, Ghost, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MentionsInbox() {
    const { setActiveSpace, spaces, workspace } = useWorkspace();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user || !user.user_metadata?.first_name || !workspace?.id) return;

        const fetchMentions = async () => {
            setIsLoading(true);
            const firstName = user.user_metadata.first_name;
            const workspaceId = workspace.id;

            const { data, error } = await supabase
                .from('workspace_messages')
                .select(`
                    *,
                    sender:sender_id (first_name, last_name, avatar_url),
                    space:workspace_spaces!space_id (name)
                `)
                .eq('workspace_id', workspaceId)
                .or(`content.ilike.%@${firstName}%,content.ilike.%@canal%,content.ilike.%@todos%`)
                .order('created_at', { ascending: false })
                .limit(50);

            if (data && !error) {
                const mapped = data.map((m: any) => ({
                    id: m.id,
                    type: 'MENTION',
                    title: `Mencionado en #${m.space?.name || 'Canal'}`,
                    content: m.content,
                    spaceId: m.space_id,
                    date: new Date(m.created_at),
                    read: false,
                    priority: m.content.includes('@todos') ? 'URGENT' : 'NORMAL'
                }));
                setNotifications(mapped);
            } else if (error) {
                console.error("Error fetching mentions:", error);
            }
            setIsLoading(false);
        };

        fetchMentions();
    }, [user, workspace?.id]);

    const handleGoToMessage = (spaceId: string) => {
        const space = (spaces || []).find(s => s.id === spaceId);
        if (space) {
            setActiveSpace(space);
            navigate(`/crm/workspace/chat/${spaceId}`);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 p-8">
                <Loader2 size={32} className="text-gray-400 animate-spin mb-4" />
                <p className="text-gray-500">Buscando menciones...</p>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Ghost size={32} className="text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Todo al día</h2>
                <p className="text-gray-500 text-center max-w-sm">
                    No tienes menciones nuevas ni notificaciones pendientes. Buen trabajo manteniendo el ruido bajo control.
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 shrink-0 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Inbox de Menciones
                        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{notifications.length}</span>
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">El ruido consolidado en un solo lugar.</p>
                </div>

                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'ALL' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Todas
                    </button>
                    <button
                        onClick={() => setFilter('UNREAD')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'UNREAD' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        No Leídas
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gray-50/30">
                <div className="max-w-4xl mx-auto space-y-4">
                    {notifications.map((notif, i) => (
                        <div key={i} className={`p-4 rounded-xl border transition-all cursor-pointer flex gap-4 ${notif.read ? 'bg-white border-gray-200' : 'bg-blue-50/50 border-blue-200 shadow-sm'}`}>
                            <div className="mt-1 shrink-0">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notif.priority === 'URGENT' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                    <AtSign size={18} />
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-semibold text-gray-900">{notif.title}</h4>
                                    <span className="text-xs font-medium text-gray-500">{notif.date?.toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed mb-3">{notif.content}</p>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleGoToMessage(notif.spaceId)}
                                        className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-sm"
                                    >
                                        Ir al mensaje
                                    </button>
                                    <button className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1">
                                        <Check size={14} /> Marcar leído
                                    </button>
                                </div>
                            </div>

                            {!notif.read && (
                                <div className="shrink-0 flex items-center">
                                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

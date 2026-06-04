import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useTrak } from '../../context/TrakContext';
import { Bell, Package, CheckSquare, Info, Check, Trash2, CircleDollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TrakNotifications() {
  const { workspaceId } = useTrak();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (workspaceId) {
      fetchNotifications();
      // Setup realtime subscription
      const subscription = supabase
        .channel('trak_notifications_channel')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'trak_notifications', filter: `workspace_id=eq.${workspaceId}` }, payload => {
          setNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + 1);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [workspaceId]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('trak_notifications')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  const markAsRead = async (id: string) => {
    await supabase.from('trak_notifications').update({ is_read: true }).eq('id', id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from('trak_notifications').update({ is_read: true }).in('id', unreadIds);
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await supabase.from('trak_notifications').delete().eq('id', id);
    setNotifications(notifications.filter(n => n.id !== id));
    // Refetch to ensure count is correct
    fetchNotifications();
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
    if (notification.link_url) {
      navigate(notification.link_url);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'inventory': return <Package size={16} className="text-amber-500" />;
      case 'task': return <CheckSquare size={16} className="text-red-500" />;
      case 'finance': return <CircleDollarSign size={16} className="text-emerald-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden flex flex-col max-h-[80vh]">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0">
            <div>
              <h3 className="font-bold text-gray-900">Notificaciones</h3>
              <p className="text-xs text-gray-500">{unreadCount} sin leer</p>
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1"
              >
                <Check size={14} /> Marcar leídas
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">No tienes notificaciones recientes.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {notifications.map(notif => (
                  <li 
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors relative group ${!notif.is_read ? 'bg-purple-50/30' : ''}`}
                  >
                    {!notif.is_read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>
                    )}
                    <div className="flex gap-3 items-start">
                      <div className={`mt-0.5 p-2 rounded-lg shrink-0 ${!notif.is_read ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 pr-6">
                        <p className={`text-sm ${!notif.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1 font-medium uppercase">
                          {new Date(notif.created_at).toLocaleString('es')}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => deleteNotification(e, notif.id)}
                      className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

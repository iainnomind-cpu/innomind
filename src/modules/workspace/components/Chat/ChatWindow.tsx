import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Paperclip, Smile, Search, Hash, Users, CheckCircle } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
import MessageBubble from './MessageBubble';

export default function ChatWindow() {
    const { spaceId } = useParams();
    const { spaces, activeSpace, setActiveSpace, messages, sendMessage, isLoading } = useWorkspace();
    const { user } = useAuth();

    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Sync active space from URL if directly linked
    useEffect(() => {
        if (spaceId && (!activeSpace || activeSpace.id !== spaceId)) {
            const space = spaces.find(s => s.id === spaceId);
            if (space) setActiveSpace(space);
        }
    }, [spaceId, spaces, activeSpace, setActiveSpace]);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeSpace) return;

        await sendMessage(newMessage, activeSpace.id);
        setNewMessage('');
    };

    if (isLoading || !activeSpace) {
        return <div className="flex-1 flex items-center justify-center">Cargando...</div>;
    }

    // Header title based on space type
    const renderHeaderIcon = () => {
        if (activeSpace.type === 'DIRECT_MESSAGE') return <div className="w-5 h-5 rounded-full bg-emerald-500 shrink-0 border-2 border-white shadow-sm" />;
        if (activeSpace.type === 'CONTEXTUAL') return <Hash size={20} className="text-blue-500" />;
        return <Hash size={20} className="text-gray-400" />;
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-white relative">

            {/* Chat Header */}
            <div className="h-14 border-b border-gray-200 px-6 flex items-center justify-between bg-white shrink-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    {renderHeaderIcon()}
                    <h2 className="font-bold text-gray-900 text-lg">{activeSpace.name || 'Chat Privado'}</h2>
                    {activeSpace.type === 'TEAM' && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">Equipo</span>}
                </div>

                <div className="flex items-center gap-4 text-gray-500">
                    <button className="hover:bg-gray-100 p-2 rounded-full transition-colors"><Search size={18} /></button>
                    <button className="hover:bg-gray-100 p-2 rounded-full transition-colors flex items-center gap-1">
                        <Users size={18} />
                    </button>
                </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                        <MessageSquare size={48} className="text-gray-200" />
                        <p>Este es el inicio del canal <strong>{activeSpace.name}</strong></p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isOwn = msg.senderId === user?.id;
                        // Determine if we need to show the avatar (e.g. if previous message was from someone else or > 5 mins ago)
                        const prevMsg = index > 0 ? messages[index - 1] : null;
                        const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId ||
                            (msg.createdAt.getTime() - prevMsg.createdAt.getTime() > 5 * 60000);

                        return (
                            <MessageBubble
                                key={msg.id}
                                message={msg}
                                isOwn={isOwn}
                                showAvatar={showAvatar}
                            />
                        );
                    })
                )}
                <div ref={messagesEndRef} className="h-1" />
            </div>

            {/* Message Input Container */}
            <div className="p-4 bg-white border-t border-gray-200 shrink-0">
                <form
                    onSubmit={handleSend}
                    className="flex items-end gap-2 bg-white border border-gray-300 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-shadow shadow-sm"
                >
                    <button type="button" className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors shrink-0 mb-0.5">
                        <Paperclip size={20} />
                    </button>

                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(e);
                            }
                        }}
                        placeholder={`Enviar mensaje a ${activeSpace.name || 'este chat'}...`}
                        className="flex-1 max-h-32 min-h-[24px] resize-none outline-none text-gray-700 bg-transparent py-1 m-0 block"
                        rows={1}
                        style={{ height: 'auto' }}
                    />

                    <button type="button" className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors shrink-0 mb-0.5">
                        <Smile size={20} />
                    </button>
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className={`p-1.5 shrink-0 rounded-lg transition-colors mb-0.5 ${newMessage.trim() ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' : 'bg-gray-100 text-gray-400'
                            }`}
                    >
                        <Send size={18} className="translate-x-[1px] translate-y-[1px]" />
                    </button>
                </form>
                <div className="flex justify-between mt-2 px-2">
                    <span className="text-[11px] text-gray-400 font-medium"><strong>Enter</strong> para enviar, <strong>Shift + Enter</strong> para salto de línea.</span>
                </div>
            </div>

        </div>
    );
}

// Temporary import replacement since MessageSquare wasn't imported at top
import { MessageSquare } from 'lucide-react';

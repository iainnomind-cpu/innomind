import React, { useState } from 'react';
import { CheckSquare, MoreHorizontal, Reply, Smile, CheckCircle, Clock } from 'lucide-react';
import { WorkspaceMessage } from '@/types';
import { useWorkspace } from '@/context/WorkspaceContext';

interface MessageBubbleProps {
    message: WorkspaceMessage;
    isOwn: boolean;
    showAvatar: boolean;
}

export default function MessageBubble({ message, isOwn, showAvatar }: MessageBubbleProps) {
    const { createTaskFromMessage } = useWorkspace();
    const [isHovered, setIsHovered] = useState(false);

    // Fallbacks if we don't have joined user data yet
    const senderName = message.sender?.first_name
        ? `${message.sender.first_name} ${message.sender?.last_name || ''}`
        : 'Usuario';
    const initial = senderName.charAt(0);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleCreateTask = () => {
        createTaskFromMessage(message.id, message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''));
    };

    return (
        <div
            className={`flex gap-3 group relative w-full ${!showAvatar ? 'mt-1' : 'mt-4'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Avatar Gutter */}
            <div className="w-10 shrink-0 flex flex-col items-end">
                {showAvatar ? (
                    <div className="w-9 h-9 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
                        {initial}
                    </div>
                ) : (
                    <div className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1 cursor-default">
                        {formatTime(message.createdAt)}
                    </div>
                )}
            </div>

            {/* Message Content */}
            <div className="flex-1 min-w-0 pr-12">
                {showAvatar && (
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-bold text-gray-900 text-[15px] hover:underline cursor-pointer">{senderName}</span>
                        <span className="text-xs text-gray-500 font-medium">{formatTime(message.createdAt)}</span>
                    </div>
                )}

                <div className="text-gray-800 leading-relaxed text-[15px] break-words">
                    {/* Basic text rendering, allows rapid copy-paste visualization */}
                    {message.content.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                            {line}
                            {i < message.content.split('\n').length - 1 && <br />}
                        </React.Fragment>
                    ))}
                </div>

                {/* Task conversion badge */}
                {message.taskId && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors">
                        <CheckSquare size={13} />
                        Convertido en Tarea
                    </div>
                )}
            </div>

            {/* Hover Actions Menu */}
            <div className={`
                absolute right-4 -top-3 bg-white border border-gray-200 shadow-sm rounded-lg flex items-center p-0.5 gap-0.5 transition-all
                ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'}
            `}>
                <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" title="Añadir reacción">
                    <Smile size={16} />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" title="Responder en hilo">
                    <Reply size={16} />
                </button>
                {!message.taskId && (
                    <button
                        onClick={handleCreateTask}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors tooltip"
                        title="Convertir a tarea"
                    >
                        <CheckSquare size={16} />
                    </button>
                )}
                <div className="w-px h-4 bg-gray-200 mx-0.5" />
                <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                    <MoreHorizontal size={16} />
                </button>
            </div>

        </div>
    );
}

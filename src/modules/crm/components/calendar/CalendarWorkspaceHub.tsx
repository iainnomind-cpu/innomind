import { useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
    Bell,
    CalendarDays,
    CheckSquare,
    FileText,
    Hash,
    MessageSquare,
    PanelRightClose,
    PanelRightOpen,
    Plus,
    Search
} from 'lucide-react';
import { FEATURES } from '@/config/features';
import { useWorkspace } from '@/context/WorkspaceContext';
import { WorkspaceSpace } from '@/types';
import ChatWindow from '@/modules/workspace/components/Chat/ChatWindow';
import MentionsInbox from '@/modules/workspace/components/Chat/MentionsInbox';
import NotesEditor from '@/modules/workspace/components/Knowledge/NotesEditor';
import MyDay from '@/modules/workspace/components/Tasks/MyDay';
import TaskBoard from '@/modules/workspace/components/Tasks/TaskBoard';
import Calendar from './Calendar';

export default function CalendarWorkspaceHub() {
    const navigate = useNavigate();
    const location = useLocation();
    const { spaces, activeSpace, setActiveSpace, createSpace } = useWorkspace();

    const [panelOpen, setPanelOpen] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newSpaceName, setNewSpaceName] = useState('');
    const [newSpaceType, setNewSpaceType] = useState<'GENERAL' | 'DIRECT_MESSAGE'>('GENERAL');
    const [isCreating, setIsCreating] = useState(false);

    const generalSpaces = spaces.filter(space => space.type === 'GENERAL');
    const dmSpaces = spaces.filter(space => space.type === 'DIRECT_MESSAGE');
    const isChatRoute = location.pathname.includes('/crm/calendar/nodo');

    const navTabs = [
        { id: 'events', label: 'Calendario', icon: CalendarDays, path: '/crm/calendar', nodoOnly: false },
        { id: 'tasks', label: 'Mi Dia', icon: CheckSquare, path: '/crm/calendar/tasks', nodoOnly: true },
        { id: 'board', label: 'Tareas Globales', icon: CheckSquare, path: '/crm/calendar/tasks/board', nodoOnly: true },
        { id: 'chat', label: 'Conversaciones', icon: MessageSquare, path: '/crm/calendar/nodo', nodoOnly: true },
        { id: 'inbox', label: 'Bandeja', icon: Bell, path: '/crm/calendar/inbox', nodoOnly: true },
        { id: 'notes', label: 'Notas', icon: FileText, path: '/crm/calendar/notes', nodoOnly: true }
    ].filter(tab => FEATURES.enableNodo || !tab.nodoOnly);

    const handleSpaceClick = (space: WorkspaceSpace) => {
        setActiveSpace(space);
        navigate(`/crm/calendar/nodo/chat/${space.id}`);
    };

    const handleCreateSpace = async () => {
        if (!newSpaceName.trim()) return;

        setIsCreating(true);
        try {
            const space = await createSpace(newSpaceName.trim(), newSpaceType);
            if (space) {
                setIsCreateModalOpen(false);
                setNewSpaceName('');
                handleSpaceClick(space);
            }
        } catch (error) {
            console.error('Error creating space', error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
            <div className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between shrink-0 gap-2 sm:gap-4 overflow-hidden">
                <div className="flex items-center gap-2 shrink-0">
                    <CalendarDays className="text-blue-600 shrink-0 hidden sm:block" size={24} />
                    <CalendarDays className="text-blue-600 shrink-0 sm:hidden" size={20} />
                    <div className="hidden lg:block">
                        <h1 className="text-lg xl:text-xl font-bold text-slate-900 leading-tight">Calendario y Nodo</h1>
                        <p className="text-[10px] text-slate-500 font-medium">Agenda, tareas y colaboracion</p>
                    </div>
                </div>

                <div className="flex-1 flex overflow-x-auto hide-scrollbar items-center bg-slate-100 p-1 rounded-lg min-w-0">
                    {navTabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = tab.id === 'events'
                            ? location.pathname === '/crm/calendar'
                            : location.pathname === tab.path || location.pathname.startsWith(`${tab.path}/`);

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => navigate(tab.path)}
                                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${isActive
                                    ? 'bg-white text-blue-700 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                    }`}
                            >
                                <Icon size={16} />
                                <span className="hidden md:inline">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <div className="relative w-32 xl:w-48 hidden lg:block">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full pl-8 pr-3 py-1.5 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-sm transition-all outline-none"
                        />
                    </div>
                    {FEATURES.enableNodo && isChatRoute && (
                        <button
                            type="button"
                            onClick={() => setPanelOpen(!panelOpen)}
                            className={`p-1.5 rounded-lg transition-colors border shrink-0 ${panelOpen
                                ? 'bg-blue-50 text-blue-600 border-blue-200'
                                : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-200'
                                }`}
                            title="Alternar canales"
                        >
                            {panelOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 relative overflow-hidden flex flex-col">
                    <Routes>
                        <Route index element={<Calendar embedded />} />
                        {FEATURES.enableNodo && (
                            <>
                                <Route path="nodo" element={<NodoWelcome onShowChannels={() => setPanelOpen(true)} />} />
                                <Route path="nodo/chat/:spaceId" element={<div className="flex-1 bg-white m-6 rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col"><ChatWindow /></div>} />
                                <Route path="inbox" element={<MentionsInbox />} />
                                <Route path="tasks">
                                    <Route index element={<MyDay />} />
                                    <Route path="board" element={<TaskBoard />} />
                                </Route>
                                <Route path="notes/*" element={<NotesEditor />} />
                            </>
                        )}
                        <Route path="*" element={<Navigate to="/crm/calendar" replace />} />
                    </Routes>
                </div>

                {FEATURES.enableNodo && (
                    <div className={`
                        bg-white border-l border-slate-200 flex flex-col transition-all duration-300 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.05)]
                        ${panelOpen && isChatRoute ? 'w-72' : 'w-0 border-none'}
                    `}>
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 text-sm">Directorio</h3>
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(true)}
                                className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                                title="Crear conversacion"
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar">
                            <SpaceList
                                title="Canales"
                                spaces={generalSpaces}
                                activeSpaceId={activeSpace?.id}
                                onSpaceClick={handleSpaceClick}
                            />
                            <SpaceList
                                title="Mensajes Directos"
                                spaces={dmSpaces}
                                activeSpaceId={activeSpace?.id}
                                onSpaceClick={handleSpaceClick}
                                direct
                            />
                        </div>
                    </div>
                )}
            </div>

            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900">Crear Nueva Conversacion</h2>
                            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                                <Plus className="rotate-45" size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de conversacion</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2">
                                        <input type="radio" checked={newSpaceType === 'GENERAL'} onChange={() => setNewSpaceType('GENERAL')} className="text-blue-600" />
                                        <span className="text-sm">Canal grupal</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input type="radio" checked={newSpaceType === 'DIRECT_MESSAGE'} onChange={() => setNewSpaceType('DIRECT_MESSAGE')} className="text-blue-600" />
                                        <span className="text-sm">Mensaje directo</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={newSpaceName}
                                    onChange={(event) => setNewSpaceName(event.target.value)}
                                    placeholder={newSpaceType === 'GENERAL' ? 'ej. marketing, anuncios...' : 'Nombre de la persona...'}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors text-sm"
                                    onKeyDown={(event) => event.key === 'Enter' && handleCreateSpace()}
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-slate-700 hover:bg-slate-200 font-medium rounded-lg text-sm transition-colors">
                                Cancelar
                            </button>
                            <button type="button" onClick={handleCreateSpace} disabled={isCreating || !newSpaceName.trim()} className="px-5 py-2 bg-blue-600 disabled:opacity-50 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors flex items-center gap-2">
                                {isCreating ? 'Creando...' : 'Crear'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function NodoWelcome({ onShowChannels }: { onShowChannels: () => void }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-white m-6 rounded-lg border border-slate-200 shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 flex items-center justify-center rounded-2xl mb-4">
                <MessageSquare size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Nodo dentro del Calendario</h2>
            <p className="text-slate-500 max-w-sm mb-6">Coordina conversaciones, tareas y notas en el mismo lugar donde planificas tu agenda.</p>
            <button type="button" onClick={onShowChannels} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm">
                Ver canales
            </button>
        </div>
    );
}

function SpaceList({
    title,
    spaces,
    activeSpaceId,
    direct = false,
    onSpaceClick
}: {
    title: string;
    spaces: WorkspaceSpace[];
    activeSpaceId?: string;
    direct?: boolean;
    onSpaceClick: (space: WorkspaceSpace) => void;
}) {
    return (
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">{title}</p>
            <div className="space-y-0.5">
                {spaces.map(space => (
                    <button
                        key={space.id}
                        type="button"
                        onClick={() => onSpaceClick(space)}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${activeSpaceId === space.id
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        {direct ? (
                            <div className="w-4 h-4 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                                {space.name ? space.name.charAt(0) : 'U'}
                            </div>
                        ) : (
                            <Hash size={16} className={activeSpaceId === space.id ? 'text-blue-500' : 'text-slate-400'} />
                        )}
                        <span className="truncate">{space.name || 'Usuario'}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

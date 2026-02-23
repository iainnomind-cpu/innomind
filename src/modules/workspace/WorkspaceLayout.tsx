import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Hash, CheckSquare, Bell, FileText, Plus, Search, PanelRightOpen, PanelRightClose, MessageSquare } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
import ChatWindow from './components/Chat/ChatWindow';
import TaskBoard from './components/Tasks/TaskBoard';
import MyDay from './components/Tasks/MyDay';
import MentionsInbox from './components/Chat/MentionsInbox';
import NotesEditor from './components/Knowledge/NotesEditor';

export default function WorkspaceLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { spaces, activeSpace, setActiveSpace, createSpace } = useWorkspace();
    const { user } = useAuth();

    // Panel lateral de navegación interna (derecho o como drawer)
    const [panelOpen, setPanelOpen] = useState(true);

    // Modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newSpaceName, setNewSpaceName] = useState('');
    const [newSpaceType, setNewSpaceType] = useState<'GENERAL' | 'DIRECT_MESSAGE'>('GENERAL');
    const [isCreating, setIsCreating] = useState(false);

    const generalSpaces = spaces.filter(s => s.type === 'GENERAL');
    const teamSpaces = spaces.filter(s => s.type === 'TEAM');
    const dmSpaces = spaces.filter(s => s.type === 'DIRECT_MESSAGE');

    const handleSpaceClick = (space: any) => {
        setActiveSpace(space);
        navigate(`/crm/workspace/chat/${space.id}`);
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
            console.error("Error creating space", error);
        } finally {
            setIsCreating(false);
        }
    };

    const navTabs = [
        { id: 'chat', label: 'Conversaciones', icon: MessageSquare, path: '/crm/workspace' },
        { id: 'inbox', label: 'Bandeja', icon: Bell, path: '/crm/workspace/inbox' },
        { id: 'tasks', label: 'Mi Día', icon: CheckSquare, path: '/crm/workspace/tasks' },
        { id: 'board', label: 'Tareas Globales', icon: CheckSquare, path: '/crm/workspace/tasks/board' },
        { id: 'notes', label: 'Notas', icon: FileText, path: '/crm/workspace/notes' },
    ];

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-hidden">
            {/* Topbar del Módulo */}
            <div className="h-16 bg-white border-b border-gray-200 px-3 sm:px-6 flex items-center justify-between shrink-0 gap-2 sm:gap-4 overflow-hidden">

                {/* Logo & Title */}
                <div className="flex items-center gap-2 shrink-0">
                    <Hash className="text-blue-600 shrink-0 hidden sm:block" size={24} />
                    <Hash className="text-blue-600 shrink-0 sm:hidden" size={20} />
                    <div className="hidden lg:block">
                        <h1 className="text-lg xl:text-xl font-bold text-gray-900 leading-tight">Nodo Central</h1>
                        <p className="text-[10px] text-gray-500 font-medium">Colaboración</p>
                    </div>
                </div>

                {/* Navigation Tabs - Scrollable */}
                <div className="flex-1 flex overflow-x-auto no-scrollbar items-center bg-gray-100 p-1 rounded-lg min-w-0">
                    {navTabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = location.pathname === tab.path || (tab.id === 'chat' && location.pathname.includes('/chat/'));
                        return (
                            <button
                                key={tab.id}
                                onClick={() => navigate(tab.path)}
                                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${isActive ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                                    }`}
                            >
                                <Icon size={16} />
                                <span className="hidden md:inline">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Actions - Search & Toggle Panel */}
                <div className="flex items-center gap-2 shrink-0">
                    <div className="relative w-32 xl:w-48 hidden lg:block">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full pl-8 pr-3 py-1.5 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-sm transition-all outline-none"
                        />
                    </div>
                    {(location.pathname.includes('/chat') || location.pathname === '/crm/workspace') && (
                        <button
                            onClick={() => setPanelOpen(!panelOpen)}
                            className={`p-1.5 rounded-lg transition-colors border shrink-0 ${panelOpen ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-200'}`}
                            title="Alternar Canales"
                        >
                            {panelOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
                        </button>
                    )}
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex overflow-hidden">

                {/* Content Router */}
                <div className="flex-1 relative overflow-hidden flex flex-col">
                    <Routes>
                        <Route path="/" element={
                            <div className="flex-1 flex flex-col items-center justify-center bg-white m-6 rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 flex items-center justify-center rounded-2xl mb-4">
                                    <MessageSquare size={32} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Bienvenido a Nodo</h2>
                                <p className="text-gray-500 max-w-sm mb-6">Selecciona un canal del panel lateral para comenzar a chatear o crea uno nuevo.</p>
                                <button onClick={() => setPanelOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm">
                                    Ver Canales
                                </button>
                            </div>
                        } />
                        <Route path="/chat/:spaceId" element={<div className="flex-1 CustomChatWrapper bg-white m-6 rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"><ChatWindow /></div>} />
                        <Route path="/inbox" element={<MentionsInbox />} />
                        <Route path="/tasks">
                            <Route index element={<MyDay />} />
                            <Route path="board" element={<TaskBoard />} />
                        </Route>
                        <Route path="/notes/*" element={<NotesEditor />} />
                    </Routes>
                </div>

                {/* Sliding Context Panel (Only for chat context usually) */}
                <div className={`
                    bg-white border-l border-gray-200 flex flex-col transition-all duration-300 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.05)]
                    ${panelOpen && (location.pathname.includes('/chat') || location.pathname === '/crm/workspace') ? 'w-72' : 'w-0 border-none'}
                `}>
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 text-sm">Directorio</h3>
                        <button onClick={() => setIsCreateModalOpen(true)} className="text-gray-400 hover:text-blue-600 transition-colors p-1"><Plus size={16} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Canales</p>
                            <div className="space-y-0.5">
                                {generalSpaces.map(space => (
                                    <button
                                        key={space.id}
                                        onClick={() => handleSpaceClick(space)}
                                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${activeSpace?.id === space.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        <Hash size={16} className={activeSpace?.id === space.id ? 'text-blue-500' : 'text-gray-400'} />
                                        <span className="truncate">{space.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Mensajes Directos</p>
                            <div className="space-y-0.5">
                                {dmSpaces.map(space => (
                                    <button
                                        key={space.id}
                                        onClick={() => handleSpaceClick(space)}
                                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${activeSpace?.id === space.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        <div className="w-4 h-4 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                                            {space.name ? space.name.charAt(0) : 'U'}
                                        </div>
                                        <span className="truncate">{space.name || "Usuario"}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Create Space Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Crear Nueva Conversación</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                                <Plus className="rotate-45" size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Conversación</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2">
                                        <input type="radio" checked={newSpaceType === 'GENERAL'} onChange={() => setNewSpaceType('GENERAL')} className="text-blue-600" />
                                        <span className="text-sm">Canal Grupal</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input type="radio" checked={newSpaceType === 'DIRECT_MESSAGE'} onChange={() => setNewSpaceType('DIRECT_MESSAGE')} className="text-blue-600" />
                                        <span className="text-sm">Mensaje Directo</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={newSpaceName}
                                    onChange={(e) => setNewSpaceName(e.target.value)}
                                    placeholder={newSpaceType === 'GENERAL' ? 'ej. marketing, anuncios...' : 'Nombre de la persona...'}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors text-sm"
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateSpace()}
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-200 font-medium rounded-lg text-sm transition-colors">
                                Cancelar
                            </button>
                            <button onClick={handleCreateSpace} disabled={isCreating || !newSpaceName.trim()} className="px-5 py-2 bg-blue-600 disabled:opacity-50 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors flex items-center gap-2">
                                {isCreating ? 'Creando...' : 'Crear'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { useUsers } from './UserContext';
import { validateWorkspace } from '@/lib/supabaseWorkspaceClient';
import {
    WorkspaceSpace,
    WorkspaceMessage,
    WorkspaceTask,
    SpaceType,
    WorkspaceNote
} from '@/types';

interface WorkspaceContextType {
    spaces: WorkspaceSpace[];
    activeSpace: WorkspaceSpace | null;
    setActiveSpace: (space: WorkspaceSpace | null) => void;
    messages: WorkspaceMessage[];
    tasks: WorkspaceTask[];
    notes: WorkspaceNote[];
    isLoading: boolean;
    sendMessage: (content: string, spaceId: string, parentId?: string) => Promise<void>;
    createSpace: (name: string, type: SpaceType, isPrivate?: boolean, linkedObjectType?: string, linkedObjectId?: string) => Promise<WorkspaceSpace | null>;
    createTaskFromMessage: (messageId: string, title: string, description?: string, assignedTo?: string, dueDate?: Date) => Promise<void>;
    createNote: (title: string, spaceId: string, contentJson?: string) => Promise<WorkspaceNote | null>;
    updateNote: (noteId: string, title?: string, contentJson?: string) => Promise<void>;
    deleteNote: (noteId: string) => Promise<void>;
    refreshWorkspace: () => Promise<void>;
    workspace: { id: string } | null;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user: authUser } = useAuth();
    const { isLoadingProfile } = useUsers();

    const [spaces, setSpaces] = useState<WorkspaceSpace[]>([]);
    const [activeSpace, setActiveSpace] = useState<WorkspaceSpace | null>(null);
    const [messages, setMessages] = useState<WorkspaceMessage[]>([]);
    const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
    const [notes, setNotes] = useState<WorkspaceNote[]>([]);
    const [workspace, setWorkspace] = useState<{ id: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const mapSpace = (row: any): WorkspaceSpace => ({
        id: row.id,
        workspace: row.workspace_id || row.workspace,
        name: row.name,
        type: row.type,
        linkedObjectType: row.linked_object_type,
        linkedObjectId: row.linked_object_id,
        description: row.description,
        isPrivate: row.is_private,
        createdBy: row.created_by,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
    });

    const mapMessage = (row: any): WorkspaceMessage => ({
        id: row.id,
        workspace: row.workspace_id || row.workspace,
        spaceId: row.space_id,
        senderId: row.sender_id,
        content: row.content,
        parentId: row.parent_id,
        hasAttachments: row.has_attachments,
        isPinned: row.is_pinned,
        taskId: row.task_id,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        sender: row.sender
    });

    const mapTask = (row: any): WorkspaceTask => ({
        id: row.id,
        workspace: row.workspace_id || row.workspace,
        title: row.title,
        description: row.description,
        assignedTo: row.assigned_to,
        dueDate: row.due_date ? new Date(row.due_date) : undefined,
        priority: row.priority,
        status: row.status,
        spaceId: row.space_id,
        linkedObjectType: row.linked_object_type,
        linkedObjectId: row.linked_object_id,
        createdFromMessageId: row.created_from_message_id,
        createdBy: row.created_by,
        completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
    });

    const mapNote = (row: any): WorkspaceNote => ({
        id: row.id,
        workspace: row.workspace_id || row.workspace,
        spaceId: row.space_id,
        title: row.title,
        contentJson: row.content_json,
        createdBy: row.created_by,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
    });

    const loadData = async () => {
        if (!authUser) return;
        setIsLoading(true);
        try {
            const { data: companyData } = await supabase.from('company_profiles').select('id').single();
            if (!companyData) throw new Error("Workspace context not found");
            const workspaceId = companyData.id;
            setWorkspace({ id: workspaceId });

            const [spacesRes, tasksRes, notesRes] = await Promise.all([
                supabase.from('workspace_spaces').select('*').eq('workspace_id', workspaceId).order('created_at', { ascending: true }),
                supabase.from('workspace_tasks').select('*').eq('workspace_id', workspaceId).order('created_at', { ascending: false }),
                supabase.from('workspace_notes').select('*').eq('workspace_id', workspaceId).order('updated_at', { ascending: false })
            ]);

            if (spacesRes.data) {
                const mappedSpaces = spacesRes.data.map(mapSpace);
                setSpaces(mappedSpaces);
                if (!activeSpace && mappedSpaces.length > 0) {
                    const general = mappedSpaces.find(s => s.type === 'GENERAL') || mappedSpaces[0];
                    setActiveSpace(general);
                }
            }
            if (tasksRes.data) setTasks(tasksRes.data.map(mapTask));
            if (notesRes.data) setNotes(notesRes.data.map(mapNote));

        } catch (error) {
            console.error("Error loading workspace data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!authUser || !activeSpace || !workspace?.id) return;

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('workspace_messages')
                .select('*, sender:sender_id (id, first_name, last_name, avatar_url)')
                .eq('space_id', activeSpace.id)
                .eq('workspace_id', workspace.id)
                .order('created_at', { ascending: true });

            if (data && !error) {
                setMessages(data.map(mapMessage));
            }
        };

        fetchMessages();

        const channel = supabase.channel(`space_${activeSpace.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'workspace_messages',
                filter: `space_id=eq.${activeSpace.id}`
            }, async (payload) => {
                const { data } = await supabase.from('workspace_messages')
                    .select('*, sender:sender_id(first_name, last_name, avatar_url)')
                    .eq('id', payload.new.id)
                    .single();

                if (data) {
                    setMessages(prev => [...prev, mapMessage(data)]);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeSpace, authUser, workspace?.id]);


    useEffect(() => {
        if (authUser && !isLoadingProfile) {
            loadData();
        }
    }, [authUser, isLoadingProfile]);

    const createSpace = async (name: string, type: SpaceType, isPrivate = false, linkedObjectType?: string, linkedObjectId?: string) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const { data, error } = await supabase.from('workspace_spaces').insert([{
            workspace_id: workspaceId,
            name,
            type,
            is_private: isPrivate,
            linked_object_type: linkedObjectType,
            linked_object_id: linkedObjectId,
            created_by: authUser?.id
        }]).select().single();

        if (error) throw error;

        const newSpace = mapSpace(data);
        setSpaces(prev => [...prev, newSpace]);

        await supabase.from('workspace_space_members').insert([{
            space_id: newSpace.id,
            user_id: authUser?.id,
            role: 'ADMIN'
        }]);

        return newSpace;
    };

    const sendMessage = async (content: string, spaceId: string, parentId?: string) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const { error } = await supabase.from('workspace_messages').insert([{
            workspace_id: workspaceId,
            space_id: spaceId,
            sender_id: authUser?.id,
            content,
            parent_id: parentId
        }]);
        if (error) throw error;
    };

    const createTaskFromMessage = async (messageId: string, title: string, description?: string, assignedTo?: string, dueDate?: Date) => {
        const workspaceId = validateWorkspace(workspace?.id);
        if (!activeSpace) return;

        const { data: taskData, error: taskError } = await supabase.from('workspace_tasks').insert([{
            workspace_id: workspaceId,
            title,
            description,
            assigned_to: assignedTo,
            due_date: dueDate?.toISOString(),
            space_id: activeSpace.id,
            created_from_message_id: messageId,
            created_by: authUser?.id
        }]).select().single();

        if (taskError) throw taskError;

        await supabase.from('workspace_messages')
            .update({ task_id: taskData.id })
            .eq('id', messageId)
            .eq('workspace_id', workspaceId);

        setTasks(prev => [mapTask(taskData), ...prev]);
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, taskId: taskData.id } : m));
    };

    const createNote = async (title: string, spaceId: string, contentJson?: string) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const { data, error } = await supabase.from('workspace_notes').insert([{
            workspace_id: workspaceId,
            space_id: spaceId,
            title,
            content_json: contentJson,
            created_by: authUser?.id
        }]).select().single();

        if (error) throw error;
        const newNote = mapNote(data);
        setNotes(prev => [newNote, ...prev]);
        return newNote;
    };

    const updateNote = async (noteId: string, title?: string, contentJson?: string) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const updates: any = { updated_at: new Date().toISOString() };
        if (title !== undefined) updates.title = title;
        if (contentJson !== undefined) updates.content_json = contentJson;

        const { error } = await supabase.from('workspace_notes')
            .update(updates)
            .eq('id', noteId)
            .eq('workspace_id', workspaceId);

        if (error) throw error;
        setNotes(prev => prev.map(n => n.id === noteId ? { ...n, ...updates } : n));
    };

    const deleteNote = async (noteId: string) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const { error } = await supabase.from('workspace_notes')
            .delete()
            .eq('id', noteId)
            .eq('workspace_id', workspaceId);

        if (error) throw error;
        setNotes(prev => prev.filter(n => n.id !== noteId));
    };

    return (
        <WorkspaceContext.Provider value={{
            spaces, activeSpace, setActiveSpace, messages, tasks, notes, isLoading,
            sendMessage, createSpace, createTaskFromMessage, createNote, updateNote, deleteNote,
            refreshWorkspace: loadData, workspace
        }}>
            {children}
        </WorkspaceContext.Provider>
    );
};

export const useWorkspace = () => {
    const context = useContext(WorkspaceContext);
    if (context === undefined) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider');
    }
    return context;
};

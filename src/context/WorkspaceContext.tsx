import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import {
    WorkspaceSpace,
    WorkspaceMessage,
    WorkspaceTask,
    WorkspaceSpaceMember,
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

    // Actions
    sendMessage: (content: string, spaceId: string, parentId?: string) => Promise<void>;
    createSpace: (name: string, type: SpaceType, isPrivate?: boolean, linkedObjectType?: string, linkedObjectId?: string) => Promise<WorkspaceSpace | null>;
    createTaskFromMessage: (messageId: string, title: string, description?: string, assignedTo?: string, dueDate?: Date) => Promise<void>;

    // Notes Actions
    createNote: (title: string, spaceId: string, contentJson?: string) => Promise<WorkspaceNote | null>;
    updateNote: (noteId: string, title?: string, contentJson?: string) => Promise<void>;
    deleteNote: (noteId: string) => Promise<void>;

    refreshWorkspace: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user: authUser } = useAuth();

    const [spaces, setSpaces] = useState<WorkspaceSpace[]>([]);
    const [activeSpace, setActiveSpace] = useState<WorkspaceSpace | null>(null);
    const [messages, setMessages] = useState<WorkspaceMessage[]>([]);
    const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
    const [notes, setNotes] = useState<WorkspaceNote[]>([]);

    const [isLoading, setIsLoading] = useState(true);

    // Mappers
    const mapSpace = (row: any): WorkspaceSpace => ({
        id: row.id,
        workspace: row.workspace,
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
        workspace: row.workspace,
        spaceId: row.space_id,
        senderId: row.sender_id,
        content: row.content,
        parentId: row.parent_id,
        hasAttachments: row.has_attachments,
        isPinned: row.is_pinned,
        taskId: row.task_id,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        sender: row.sender // Extended property if joined with profiles
    });

    const mapTask = (row: any): WorkspaceTask => ({
        id: row.id,
        workspace: row.workspace,
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
        workspace: row.workspace,
        spaceId: row.space_id,
        title: row.title,
        contentJson: row.content_json,
        createdBy: row.created_by,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
    });

    // Fetch spaces
    const loadData = async () => {
        if (!authUser) return;
        setIsLoading(true);
        try {
            // Get spaces (RLS will filter to current workspace implicitly)
            let spacesQuery = supabase
                .from('workspace_spaces')
                .select('*');

            const { data: spacesData, error: spacesError } = await spacesQuery.order('created_at', { ascending: true });

            if (spacesError) throw spacesError;
            if (spacesData) {
                const mappedSpaces = spacesData.map(mapSpace);
                setSpaces(mappedSpaces);
                // Set default active space to General if none selected
                if (!activeSpace && mappedSpaces.length > 0) {
                    const general = mappedSpaces.find(s => s.type === 'GENERAL') || mappedSpaces[0];
                    setActiveSpace(general);
                }
            }

            // Fetch Tasks
            const { data: tasksData, error: tasksError } = await supabase
                .from('workspace_tasks')
                .select('*')
                .order('created_at', { ascending: false });

            if (tasksError) throw tasksError;
            if (tasksData) setTasks(tasksData.map(mapTask));

            // Fetch Notes
            const { data: notesData, error: notesError } = await supabase
                .from('workspace_notes')
                .select('*')
                .order('updated_at', { ascending: false });

            if (notesError) throw notesError;
            if (notesData) setNotes(notesData.map(mapNote));

        } catch (error) {
            console.error("Error loading workspace data", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Subscribing to Messages
    useEffect(() => {
        if (!authUser || !activeSpace) return;

        // Fetch initial messages for active space
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('workspace_messages')
                .select(`
                    *,
                    sender:sender_id (
                        id,
                        first_name,
                        last_name,
                        avatar_url
                    )
                `)
                .eq('space_id', activeSpace.id)
                .order('created_at', { ascending: true });

            if (data && !error) {
                setMessages(data.map(mapMessage));
            }
        };

        fetchMessages();

        // Realtime Subscription
        const channel = supabase.channel(`space_${activeSpace.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'workspace_messages',
                filter: `space_id=eq.${activeSpace.id}`
            }, async (payload) => {
                // To get sender details, we ideally do a quick lookup or just refetch the new msg.
                // Simple approach: append the raw row, minus the full sender details (which might flash shortly until reload).
                // Or better, fetch the single message joined:
                const { data } = await supabase.from('workspace_messages')
                    .select(`*, sender:sender_id(first_name, last_name, avatar_url)`)
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
    }, [activeSpace, authUser]);


    useEffect(() => {
        loadData();
    }, [authUser]);

    // ACTIONS =======================

    const createSpace = async (name: string, type: SpaceType, isPrivate = false, linkedObjectType?: string, linkedObjectId?: string) => {
        if (!authUser) return null;

        const { data: companyData } = await supabase.from('company_profiles').select('id').single();
        const workspaceId = companyData?.id;

        if (!workspaceId) {
            console.error("No se pudo determinar el workspace del usuario en createSpace");
            return null;
        }

        const { data, error } = await supabase.from('workspace_spaces').insert([{
            workspace: workspaceId,
            name,
            type,
            is_private: isPrivate,
            linked_object_type: linkedObjectType,
            linked_object_id: linkedObjectId,
            created_by: authUser.id
        }]).select().single();

        if (error) {
            console.error("Error creating space:", error.message, error.details, error.hint, error.code);
            return null;
        }

        const newSpace = mapSpace(data);
        setSpaces(prev => [...prev, newSpace]);

        // Add creator as Admin member
        await supabase.from('workspace_space_members').insert([{
            space_id: newSpace.id,
            user_id: authUser.id,
            role: 'ADMIN'
        }]);

        return newSpace;
    };

    const sendMessage = async (content: string, spaceId: string, parentId?: string) => {
        if (!authUser) return;

        const { data: companyData } = await supabase.from('company_profiles').select('id').single();
        const workspaceId = companyData?.id;

        if (!workspaceId) return;

        const { error } = await supabase.from('workspace_messages').insert([{
            workspace: workspaceId,
            space_id: spaceId,
            sender_id: authUser.id,
            content,
            parent_id: parentId
        }]);

        if (error) {
            console.error("Error sending message", error);
        }
    };

    const createTaskFromMessage = async (messageId: string, title: string, description?: string, assignedTo?: string, dueDate?: Date) => {
        if (!authUser || !activeSpace) return;

        const { data: companyData } = await supabase.from('company_profiles').select('id').single();
        const workspaceId = companyData?.id;
        if (!workspaceId) return;

        // 1. Create Task
        const { data: taskData, error: taskError } = await supabase.from('workspace_tasks').insert([{
            workspace: workspaceId,
            title,
            description,
            assigned_to: assignedTo,
            due_date: dueDate?.toISOString(),
            space_id: activeSpace.id,
            created_from_message_id: messageId,
            created_by: authUser.id
        }]).select().single();

        if (taskError || !taskData) {
            console.error("Error creating task from message", taskError);
            return;
        }

        // 2. Link Task to Message
        await supabase.from('workspace_messages')
            .update({ task_id: taskData.id })
            .eq('id', messageId);

        // Update local task state
        setTasks(prev => [mapTask(taskData), ...prev]);

        // Update local message state to show the linked task
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, taskId: taskData.id } : m));
    };

    const createNote = async (title: string, spaceId: string, contentJson?: string) => {
        if (!authUser) return null;

        const { data: companyData } = await supabase.from('company_profiles').select('id').single();
        const workspaceId = companyData?.id;
        if (!workspaceId) return null;

        const { data, error } = await supabase.from('workspace_notes').insert([{
            workspace: workspaceId,
            space_id: spaceId,
            title,
            content_json: contentJson,
            created_by: authUser.id
        }]).select().single();

        if (error || !data) {
            console.error("Error creating note", error);
            return null;
        }

        const newNote = mapNote(data);
        setNotes(prev => [newNote, ...prev]);
        return newNote;
    };

    const updateNote = async (noteId: string, title?: string, contentJson?: string) => {
        if (!authUser) return;

        const updates: any = { updated_at: new Date().toISOString() };
        if (title !== undefined) updates.title = title;
        if (contentJson !== undefined) updates.content_json = contentJson;

        const { error } = await supabase.from('workspace_notes')
            .update(updates)
            .eq('id', noteId); // Workspace filtered by RLS

        if (error) {
            console.error("Error updating note", error);
            return;
        }

        setNotes(prev => prev.map(n => n.id === noteId ? { ...n, ...updates } : n));
    };

    const deleteNote = async (noteId: string) => {
        if (!authUser) return;

        const { error } = await supabase.from('workspace_notes')
            .delete()
            .eq('id', noteId);

        if (error) {
            console.error("Error deleting note", error);
            return;
        }

        setNotes(prev => prev.filter(n => n.id !== noteId));
    };

    const refreshWorkspace = async () => {
        await loadData();
    };

    return (
        <WorkspaceContext.Provider value={{
            spaces,
            activeSpace,
            setActiveSpace,
            messages,
            tasks,
            notes,
            isLoading,
            sendMessage,
            createSpace,
            createTaskFromMessage,
            createNote,
            updateNote,
            deleteNote,
            refreshWorkspace
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

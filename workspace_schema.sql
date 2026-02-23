-- Workspace Schema for the "Nodo" Collaboration Module
-- Handles Channels (Spaces), Direct Messages, Task Management, Standups, and Notes

-- Support for text search config if needed later
-- extension pg_trgm for fuzzy search if not exists

-- 1. SPACES (Channels, Contexts, DMs)
CREATE TABLE IF NOT EXISTS public.workspace_spaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace UUID NOT NULL REFERENCES public.company_profiles(id) DEFAULT get_current_workspace()::uuid,
    name TEXT,
    type TEXT NOT NULL CHECK (type IN ('GENERAL', 'TEAM', 'CONTEXTUAL', 'DIRECT_MESSAGE')),
    linked_object_type TEXT, -- e.g. 'DEAL', 'CUSTOMER', 'PURCHASE_ORDER'
    linked_object_id TEXT,
    description TEXT,
    is_private BOOLEAN DEFAULT false,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. SPACE MEMBERS (Users in a specific Space)
CREATE TABLE IF NOT EXISTS public.workspace_space_members (
    space_id UUID NOT NULL REFERENCES public.workspace_spaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'MEMBER', 'OBSERVER')) DEFAULT 'MEMBER',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (space_id, user_id)
);

-- 3. MESSAGES
CREATE TABLE IF NOT EXISTS public.workspace_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace UUID NOT NULL REFERENCES public.company_profiles(id) DEFAULT get_current_workspace()::uuid,
    space_id UUID NOT NULL REFERENCES public.workspace_spaces(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.workspace_messages(id) ON DELETE CASCADE, -- For threads
    has_attachments BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    task_id UUID, -- Will reference workspace_tasks, populated when message converted to task
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TASKS
CREATE TABLE IF NOT EXISTS public.workspace_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace UUID NOT NULL REFERENCES public.company_profiles(id) DEFAULT get_current_workspace()::uuid,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID,
    due_date TIMESTAMP WITH TIME ZONE,
    priority TEXT CHECK (priority IN ('BAJA', 'MEDIA', 'ALTA', 'URGENTE')) DEFAULT 'MEDIA',
    status TEXT CHECK (status IN ('PENDIENTE', 'EN_PROGRESO', 'BLOQUEADA', 'COMPLETADA')) DEFAULT 'PENDIENTE',
    space_id UUID REFERENCES public.workspace_spaces(id) ON DELETE SET NULL, -- Context where it was created
    linked_object_type TEXT,
    linked_object_id TEXT,
    created_from_message_id UUID REFERENCES public.workspace_messages(id) ON DELETE SET NULL,
    created_by UUID NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Foreign Key for messages converting to task
ALTER TABLE public.workspace_messages 
ADD CONSTRAINT fk_workspace_messages_task 
FOREIGN KEY (task_id) REFERENCES public.workspace_tasks(id) ON DELETE SET NULL;

-- 5. TASK COMMENTS
CREATE TABLE IF NOT EXISTS public.workspace_task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace UUID NOT NULL REFERENCES public.company_profiles(id) DEFAULT get_current_workspace()::uuid,
    task_id UUID NOT NULL REFERENCES public.workspace_tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TASK CHECKLISTS (Subtasks)
CREATE TABLE IF NOT EXISTS public.workspace_task_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.workspace_tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. STANDUPS
CREATE TABLE IF NOT EXISTS public.workspace_standups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace UUID NOT NULL REFERENCES public.company_profiles(id) DEFAULT get_current_workspace()::uuid,
    space_id UUID NOT NULL REFERENCES public.workspace_spaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    completed_yesterday TEXT,
    working_today TEXT,
    blockers TEXT,
    has_blocker_flag BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. NOTES (Knowledge Base)
CREATE TABLE IF NOT EXISTS public.workspace_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace UUID NOT NULL REFERENCES public.company_profiles(id) DEFAULT get_current_workspace()::uuid,
    space_id UUID NOT NULL REFERENCES public.workspace_spaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_json TEXT,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ==========================================
-- Triggers for updated_at
-- ==========================================
CREATE TRIGGER update_workspace_spaces_modtime
BEFORE UPDATE ON public.workspace_spaces FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_workspace_messages_modtime
BEFORE UPDATE ON public.workspace_messages FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_workspace_tasks_modtime
BEFORE UPDATE ON public.workspace_tasks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_workspace_task_comments_modtime
BEFORE UPDATE ON public.workspace_task_comments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_workspace_task_checklists_modtime
BEFORE UPDATE ON public.workspace_task_checklists FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_workspace_notes_modtime
BEFORE UPDATE ON public.workspace_notes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS for all tables
ALTER TABLE public.workspace_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_space_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_task_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_standups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_notes ENABLE ROW LEVEL SECURITY;

-- workspace_spaces: Users can view spaces in their workspace. 
CREATE POLICY "Users can view workspace spaces"
ON public.workspace_spaces FOR SELECT
USING (workspace = get_current_workspace()::uuid);

CREATE POLICY "Users can insert workspace spaces"
ON public.workspace_spaces FOR INSERT
WITH CHECK (workspace = get_current_workspace()::uuid);

CREATE POLICY "Users can update workspace spaces"
ON public.workspace_spaces FOR UPDATE
USING (workspace = get_current_workspace()::uuid);


-- workspace_space_members: 
-- Technically members don't have a workspace column directly, but they belong to space.
CREATE POLICY "Users can view space members"
ON public.workspace_space_members FOR SELECT
USING (EXISTS (SELECT 1 FROM public.workspace_spaces WHERE id = space_id AND workspace = get_current_workspace()::uuid));

CREATE POLICY "Users can insert space members"
ON public.workspace_space_members FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.workspace_spaces WHERE id = space_id AND workspace = get_current_workspace()::uuid));

CREATE POLICY "Users can delete space members"
ON public.workspace_space_members FOR DELETE
USING (EXISTS (SELECT 1 FROM public.workspace_spaces WHERE id = space_id AND workspace = get_current_workspace()::uuid));


-- workspace_messages:
CREATE POLICY "Users can view workspace messages"
ON public.workspace_messages FOR SELECT
USING (workspace = get_current_workspace()::uuid);

CREATE POLICY "Users can insert workspace messages"
ON public.workspace_messages FOR INSERT
WITH CHECK (workspace = get_current_workspace()::uuid);

CREATE POLICY "Users can update workspace messages"
ON public.workspace_messages FOR UPDATE
USING (workspace = get_current_workspace()::uuid AND sender_id = auth.uid());


-- workspace_tasks
CREATE POLICY "Users can view workspace tasks"
ON public.workspace_tasks FOR SELECT
USING (workspace = get_current_workspace()::uuid);

CREATE POLICY "Users can insert workspace tasks"
ON public.workspace_tasks FOR INSERT
WITH CHECK (workspace = get_current_workspace()::uuid);

CREATE POLICY "Users can update workspace tasks"
ON public.workspace_tasks FOR UPDATE
USING (workspace = get_current_workspace()::uuid);


-- workspace_task_comments
CREATE POLICY "Users can view workspace task comments"
ON public.workspace_task_comments FOR SELECT
USING (workspace = get_current_workspace()::uuid);

CREATE POLICY "Users can insert workspace task comments"
ON public.workspace_task_comments FOR INSERT
WITH CHECK (workspace = get_current_workspace()::uuid);


-- workspace_task_checklists
CREATE POLICY "Users can view task checklists"
ON public.workspace_task_checklists FOR SELECT
USING (EXISTS (SELECT 1 FROM public.workspace_tasks WHERE id = task_id AND workspace = get_current_workspace()::uuid));

CREATE POLICY "Users can insert task checklists"
ON public.workspace_task_checklists FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.workspace_tasks WHERE id = task_id AND workspace = get_current_workspace()::uuid));

CREATE POLICY "Users can update task checklists"
ON public.workspace_task_checklists FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.workspace_tasks WHERE id = task_id AND workspace = get_current_workspace()::uuid));


-- workspace_standups
CREATE POLICY "Users can view workspace standups"
ON public.workspace_standups FOR SELECT
USING (workspace = get_current_workspace()::uuid);

CREATE POLICY "Users can insert workspace standups"
ON public.workspace_standups FOR INSERT
WITH CHECK (workspace = get_current_workspace()::uuid);

CREATE POLICY "Users can update workspace standups"
ON public.workspace_standups FOR UPDATE
USING (workspace = get_current_workspace()::uuid AND user_id = auth.uid());


-- workspace_notes
CREATE POLICY "Users can view workspace notes"
ON public.workspace_notes FOR SELECT
USING (workspace = get_current_workspace()::uuid);

CREATE POLICY "Users can insert workspace notes"
ON public.workspace_notes FOR INSERT
WITH CHECK (workspace = get_current_workspace()::uuid);

CREATE POLICY "Users can update workspace notes"
ON public.workspace_notes FOR UPDATE
USING (workspace = get_current_workspace()::uuid);

-- Realtime Setup:
-- Turn on replication for messages to stream chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_spaces;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_task_comments;

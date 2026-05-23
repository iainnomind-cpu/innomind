import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useUsers } from '@/context/UserContext';

// ========== TYPES ==========
export interface TrakClient {
  id: string;
  workspace_id: string;
  company_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  industry?: string;
  website?: string;
  address?: string;
  status: 'lead' | 'active' | 'inactive';
  pipeline_stage: 'new' | 'contacted' | 'quoted' | 'won' | 'lost';
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TrakProject {
  id: string;
  workspace_id: string;
  client_id?: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  start_date?: string;
  estimated_end_date?: string;
  actual_end_date?: string;
  budget?: number;
  spent?: number;
  progress: number;
  project_manager?: string;
  tags?: string[];
  color?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Joined
  client?: TrakClient;
}

export interface TrakPhase {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  order_index: number;
  status: 'pending' | 'in_progress' | 'completed';
  start_date?: string;
  end_date?: string;
  deliverables?: string[];
  progress: number;
  created_at: string;
}

export interface TrakTask {
  id: string;
  workspace_id: string;
  project_id?: string;
  phase_id?: string;
  parent_task_id?: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'in_review' | 'blocked' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to?: string;
  reporter?: string;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  tags?: string[];
  order_index: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  // Joined
  project?: TrakProject;
  assignee?: { first_name: string; last_name: string; avatar_url?: string };
}

export interface TrakTimeEntry {
  id: string;
  workspace_id: string;
  project_id?: string;
  task_id?: string;
  user_id: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  duration_minutes: number;
  billable: boolean;
  hourly_rate?: number;
  created_at: string;
}

export interface TrakStats {
  totalClients: number;
  activeProjects: number;
  pendingTasks: number;
  hoursThisWeek: number;
  overdueTaskCount: number;
  completedThisMonth: number;
}

// ========== CONTEXT ==========
interface TrakContextType {
  workspaceId: string | null;
  clients: TrakClient[];
  projects: TrakProject[];
  tasks: TrakTask[];
  stats: TrakStats;
  isLoading: boolean;
  refreshAll: () => Promise<void>;
  refreshClients: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  moduleSettings: Record<string, boolean>;
  toggleModule: (key: string) => Promise<void>;
}

const defaultStats: TrakStats = {
  totalClients: 0,
  activeProjects: 0,
  pendingTasks: 0,
  hoursThisWeek: 0,
  overdueTaskCount: 0,
  completedThisMonth: 0,
};

const TrakContext = createContext<TrakContextType | undefined>(undefined);

export const TrakProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { isLoadingProfile } = useUsers();

  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [clients, setClients] = useState<TrakClient[]>([]);
  const [projects, setProjects] = useState<TrakProject[]>([]);
  const [tasks, setTasks] = useState<TrakTask[]>([]);
  const [stats, setStats] = useState<TrakStats>(defaultStats);
  const [moduleSettings, setModuleSettings] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Resolve workspace
  useEffect(() => {
    if (!user || isLoadingProfile) return;
    (async () => {
      const { data } = await supabase.from('company_profiles').select('id').single();
      if (data) {
        setWorkspaceId(data.id);
        
        // Fetch module settings immediately
        const { data: modData } = await supabase.from('trak_module_settings').select('module_key, is_enabled').eq('workspace_id', data.id);
        if (modData) {
          const map: Record<string, boolean> = {};
          modData.forEach((d: any) => { map[d.module_key] = d.is_enabled; });
          setModuleSettings(map);
        }
      }
    })();
  }, [user, isLoadingProfile]);

  const toggleModule = async (key: string) => {
    if (!workspaceId) return;
    const newVal = !moduleSettings[key];
    setModuleSettings({ ...moduleSettings, [key]: newVal });
    await supabase.from('trak_module_settings').upsert(
      { workspace_id: workspaceId, module_key: key, is_enabled: newVal },
      { onConflict: 'workspace_id,module_key' }
    );
  };

  const refreshClients = useCallback(async () => {
    if (!workspaceId) return;
    const { data } = await supabase
      .from('trak_clients')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });
    if (data) setClients(data);
  }, [workspaceId]);

  const refreshProjects = useCallback(async () => {
    if (!workspaceId) return;
    const { data } = await supabase
      .from('trak_projects')
      .select('*, client:client_id(id, company_name)')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });
    if (data) setProjects(data);
  }, [workspaceId]);

  const refreshTasks = useCallback(async () => {
    if (!workspaceId) return;
    const { data } = await supabase
      .from('trak_tasks')
      .select('*, project:project_id(id, name, color)')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });
    if (data) setTasks(data);
  }, [workspaceId]);

  const computeStats = useCallback(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    setStats({
      totalClients: clients.filter(c => c.status === 'active').length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      pendingTasks: tasks.filter(t => t.status !== 'done').length,
      hoursThisWeek: 0, // Will be computed when time entries are loaded
      overdueTaskCount: tasks.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== 'done').length,
      completedThisMonth: tasks.filter(t => t.completed_at && new Date(t.completed_at) >= startOfMonth).length,
    });
  }, [clients, projects, tasks]);

  const refreshAll = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    await Promise.all([refreshClients(), refreshProjects(), refreshTasks()]);
    setIsLoading(false);
  }, [workspaceId, refreshClients, refreshProjects, refreshTasks]);

  useEffect(() => {
    if (workspaceId) refreshAll();
  }, [workspaceId]);

  useEffect(() => {
    computeStats();
  }, [clients, projects, tasks, computeStats]);

  return (
    <TrakContext.Provider value={{
      workspaceId, clients, projects, tasks, stats, isLoading,
      refreshAll, refreshClients, refreshProjects, refreshTasks,
      moduleSettings, toggleModule
    }}>
      {children}
    </TrakContext.Provider>
  );
};

export const useTrak = () => {
  const ctx = useContext(TrakContext);
  if (!ctx) throw new Error('useTrak must be used within TrakProvider');
  return ctx;
};

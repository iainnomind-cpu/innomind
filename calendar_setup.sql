-- ==========================================
-- Innomind SaaS - Módulo de Calendario
-- ==========================================

CREATE TABLE IF NOT EXISTS public.calendar_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace text NOT NULL,
  title text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  type text NOT NULL, -- 'reunión', 'llamada', 'recordatorio'
  prospect_id uuid REFERENCES public.prospects(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Política de Aislamiento por Workspace
CREATE POLICY "Workspace isolation for calendar events" 
ON public.calendar_events FOR ALL 
USING (workspace = get_current_workspace());

-- Trigger para auto-asignar workspace en Inserciones
CREATE TRIGGER set_calendar_events_workspace
BEFORE INSERT ON public.calendar_events
FOR EACH ROW EXECUTE FUNCTION set_workspace_on_insert();

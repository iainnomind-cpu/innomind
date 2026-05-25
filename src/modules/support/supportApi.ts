// Shared constants for the finapp Supabase connection
export const FINAPP_SUPABASE_URL = 'https://mndkjjxtuqizpvkjnnde.supabase.co';
export const FINAPP_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uZGtqanh0dXFpenB2a2pubmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NTc3MzAsImV4cCI6MjA5MjEzMzczMH0.nKU1LC94eBYffLcvmRDtc_4jk_7NMkdDfbRtDLKzD9E';

export interface SupportTicket {
  id: string;
  ticket_number: number;
  subject: string;
  description: string;
  category: 'bug' | 'duda' | 'mejora' | 'otro';
  priority: 'baja' | 'media' | 'alta' | 'urgente';
  status: 'abierto' | 'en_progreso' | 'en_espera' | 'resuelto' | 'cerrado';
  user_email: string;
  user_name: string;
  company_name: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_email: string;
  sender_name: string;
  message: string;
  is_internal_note: boolean;
  created_at: string;
}

const headers = {
  'Content-Type': 'application/json',
  'apikey': FINAPP_ANON_KEY,
  'Authorization': `Bearer ${FINAPP_ANON_KEY}`,
};

export async function fetchUserTickets(userEmail: string): Promise<SupportTicket[]> {
  const res = await fetch(
    `${FINAPP_SUPABASE_URL}/rest/v1/support_tickets?user_email=eq.${encodeURIComponent(userEmail)}&order=created_at.desc`,
    { headers }
  );
  if (!res.ok) return [];
  return res.json();
}

export async function fetchTicketById(ticketId: string): Promise<SupportTicket | null> {
  const res = await fetch(
    `${FINAPP_SUPABASE_URL}/rest/v1/support_tickets?id=eq.${ticketId}&limit=1`,
    { headers }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data[0] || null;
}

export async function createTicket(ticket: Partial<SupportTicket>): Promise<SupportTicket | null> {
  const res = await fetch(`${FINAPP_SUPABASE_URL}/rest/v1/support_tickets`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'return=representation' },
    body: JSON.stringify(ticket),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data[0] || null;
}

export async function fetchTicketMessages(ticketId: string): Promise<TicketMessage[]> {
  const res = await fetch(
    `${FINAPP_SUPABASE_URL}/rest/v1/ticket_messages?ticket_id=eq.${ticketId}&is_internal_note=eq.false&order=created_at.asc`,
    { headers }
  );
  if (!res.ok) return [];
  return res.json();
}

export async function sendTicketMessage(msg: Partial<TicketMessage>): Promise<TicketMessage | null> {
  const res = await fetch(`${FINAPP_SUPABASE_URL}/rest/v1/ticket_messages`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'return=representation' },
    body: JSON.stringify(msg),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data[0] || null;
}

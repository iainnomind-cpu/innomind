import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useTrak } from './TrakContext';

// ========== TYPES ==========
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AIContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  messages: AIMessage[];
  sendMessage: (text: string, moduleContext?: string) => Promise<void>;
  isLoading: boolean;
  tokensUsed: number;
  tokensLimit: number;
  tokensRemaining: number;
  // History
  conversations: AIConversation[];
  activeConversationId: string | null;
  startNewChat: () => void;
  loadConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

// ========== HELPER: localStorage keys ==========
const getStorageKey = (workspaceId: string, platform: string) => `inno_ai_history_${workspaceId}_${platform}`;
const getActiveKey = (workspaceId: string, platform: string) => `inno_ai_active_${workspaceId}_${platform}`;

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { workspaceId, refreshProjects, refreshClients, refreshTasks } = useTrak();
  const location = useLocation();
  const currentRoute = location.pathname;
  const platform = currentRoute.startsWith('/trak') ? 'track' : 'crm_erp';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<AIConversation[]>([]);

  // Token Management
  const [tokensUsed, setTokensUsed] = useState(0);
  const [tokensLimit, setTokensLimit] = useState(500000);
  const [tokensRemaining, setTokensRemaining] = useState(500000);

  // ========== HISTORY PERSISTENCE ==========
  // Load history from localStorage when workspaceId or platform changes
  useEffect(() => {
    if (!workspaceId) return;
    try {
      const stored = localStorage.getItem(getStorageKey(workspaceId, platform));
      if (stored) {
        const parsed: AIConversation[] = JSON.parse(stored);
        setConversations(parsed);
      } else {
        setConversations([]);
      }
      const activeId = localStorage.getItem(getActiveKey(workspaceId, platform));
      if (activeId && stored) {
        const parsed: AIConversation[] = JSON.parse(stored);
        const active = parsed.find(c => c.id === activeId);
        if (active) {
          setMessages(active.messages);
          setActiveConversationId(activeId);
          return;
        }
      }
      // Start fresh conversation
      const newId = `conv_${Date.now()}`;
      setActiveConversationId(newId);
      setMessages([]);
    } catch { /* ignore */ }
  }, [workspaceId, platform]);

  // Save messages whenever they change
  useEffect(() => {
    if (!workspaceId || !activeConversationId) return;
    // Debounce save
    const timeout = setTimeout(() => {
      try {
        const stored = localStorage.getItem(getStorageKey(workspaceId, platform));
        let allConvs: AIConversation[] = stored ? JSON.parse(stored) : [];

        const existingIdx = allConvs.findIndex(c => c.id === activeConversationId);
        const title = messages.length > 0
          ? messages.find(m => m.role === 'user')?.content.slice(0, 50) || 'Nueva conversación'
          : 'Nueva conversación';

        const conv: AIConversation = {
          id: activeConversationId,
          title,
          messages,
          createdAt: existingIdx >= 0 ? allConvs[existingIdx].createdAt : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (existingIdx >= 0) {
          allConvs[existingIdx] = conv;
        } else if (messages.length > 0) {
          allConvs.unshift(conv);
        }

        // Keep max 30 conversations
        allConvs = allConvs.slice(0, 30);
        localStorage.setItem(getStorageKey(workspaceId, platform), JSON.stringify(allConvs));
        localStorage.setItem(getActiveKey(workspaceId, platform), activeConversationId);
        setConversations(allConvs);
      } catch { /* ignore */ }
    }, 500);
    return () => clearTimeout(timeout);
  }, [messages, activeConversationId, workspaceId, platform]);

  const startNewChat = useCallback(() => {
    const newId = `conv_${Date.now()}`;
    setActiveConversationId(newId);
    setMessages([]);
  }, []);

  const loadConversation = useCallback((id: string) => {
    const conv = conversations.find(c => c.id === id);
    if (conv) {
      setMessages(conv.messages);
      setActiveConversationId(id);
    }
  }, [conversations]);

  const deleteConversation = useCallback((id: string) => {
    if (!workspaceId) return;
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    localStorage.setItem(getStorageKey(workspaceId, platform), JSON.stringify(updated));
    if (activeConversationId === id) {
      startNewChat();
    }
  }, [conversations, activeConversationId, workspaceId, platform, startNewChat]);

  // ========== TOKENS ==========
  useEffect(() => {
    if (!workspaceId) return;
    const fetchTokens = async () => {
      try {
        const { data } = await supabase.rpc('consume_ai_tokens', {
          p_workspace_id: workspaceId,
          p_tokens: 0
        });
        if (data) {
          setTokensUsed(data.tokens_used);
          setTokensLimit(data.tokens_limit);
          setTokensRemaining(data.tokens_remaining);
        }
      } catch (err) {
        console.warn("AI Schema might not be initialized in Supabase yet.", err);
      }
    };
    fetchTokens();
  }, [workspaceId]);
  // ========== SEND MESSAGE (Secure Supabase Edge Function Invoke) ==========
  const sendMessage = async (text: string, moduleContext?: string) => {
    const newUserMsg: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const apiMessages = [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: text }
      ];

      // --- DEBUG DE SESIÓN Y AUTENTICACIÓN DEL CLIENTE ---
      const { data: { session } } = await supabase.auth.getSession();
      console.log("=== INNO-CHAT FRONTEND AUTH DEBUG ===");
      console.log("Session active:", !!session);
      if (session) {
        console.log("Access Token (JWT) Prefix:", session.access_token.slice(0, 15) + "...");
        console.log("Expires at:", new Date(session.expires_at! * 1000).toLocaleString());
        console.log("User:", session.user?.email);
      } else {
        console.warn("ADVERTENCIA: No se detectó ninguna sesión activa de Supabase Auth en el cliente.");
      }
      console.log("Payload enviado a la Edge Function:", {
        moduleContext,
        workspaceId,
        messagesCount: apiMessages.length,
        platform,
        currentRoute
      });
      console.log("======================================");

      // Invocar la Edge Function segura en lugar de llamar directamente a OpenAI
      const { data, error } = await supabase.functions.invoke('inno-chat', {
        body: {
          messages: apiMessages,
          moduleContext,
          workspaceId,
          platform,
          currentRoute
        }
      });

      if (error) throw error;

      // Actualizar el estado local de tokens devuelto por el orquestador server-side
      if (data && data.tokens) {
        setTokensUsed(data.tokens.tokens_used);
        setTokensRemaining(data.tokens.tokens_remaining);
        if (data.tokens.tokens_limit) {
          setTokensLimit(data.tokens.tokens_limit);
        }
      }

      const newAssistantMsg: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || "He realizado la acción solicitada.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, newAssistantMsg]);

    } catch (error: any) {
      console.error("AI Error:", error);
      
      // Intentar extraer el mensaje de error real del servidor (por ejemplo, "OPENAI_API_KEY no configurado")
      if (error && error.context) {
        try {
          // Intentar clonar y leer el texto de la respuesta fallida
          const responseClone = error.context.clone ? error.context.clone() : error.context;
          const errorText = await responseClone.text();
          console.error("Detalle del Error devuelto por la Edge Function:", errorText);
        } catch (readErr) {
          console.error("No se pudo leer el cuerpo del error de la función:", readErr);
        }
      }

      const errorMsg: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Hubo un error al comunicarse con la IA. Por favor intenta de nuevo.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AIContext.Provider value={{
      isOpen, setIsOpen, messages, sendMessage, isLoading,
      tokensUsed, tokensLimit, tokensRemaining,
      conversations, activeConversationId, startNewChat, loadConversation, deleteConversation
    }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error('useAI must be used within AIProvider');
  return ctx;
};

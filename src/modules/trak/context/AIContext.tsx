import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
const getStorageKey = (workspaceId: string) => `inno_ai_history_${workspaceId}`;
const getActiveKey = (workspaceId: string) => `inno_ai_active_${workspaceId}`;

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { workspaceId, refreshProjects, refreshClients, refreshTasks } = useTrak();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<AIConversation[]>([]);

  // Token Management
  const [tokensUsed, setTokensUsed] = useState(0);
  const [tokensLimit, setTokensLimit] = useState(500000);
  const [tokensRemaining, setTokensRemaining] = useState(500000);

  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  // ========== HISTORY PERSISTENCE ==========
  // Load history from localStorage on mount
  useEffect(() => {
    if (!workspaceId) return;
    try {
      const stored = localStorage.getItem(getStorageKey(workspaceId));
      if (stored) {
        const parsed: AIConversation[] = JSON.parse(stored);
        setConversations(parsed);
      }
      const activeId = localStorage.getItem(getActiveKey(workspaceId));
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
  }, [workspaceId]);

  // Save messages whenever they change
  useEffect(() => {
    if (!workspaceId || !activeConversationId) return;
    // Debounce save
    const timeout = setTimeout(() => {
      try {
        const stored = localStorage.getItem(getStorageKey(workspaceId));
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
        localStorage.setItem(getStorageKey(workspaceId), JSON.stringify(allConvs));
        localStorage.setItem(getActiveKey(workspaceId), activeConversationId);
        setConversations(allConvs);
      } catch { /* ignore */ }
    }, 500);
    return () => clearTimeout(timeout);
  }, [messages, activeConversationId, workspaceId]);

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
    localStorage.setItem(getStorageKey(workspaceId), JSON.stringify(updated));
    if (activeConversationId === id) {
      startNewChat();
    }
  }, [conversations, activeConversationId, workspaceId, startNewChat]);

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

  const updateTokens = async (estimatedTokens: number) => {
    if (!workspaceId) return;
    try {
      const { data } = await supabase.rpc('consume_ai_tokens', {
        p_workspace_id: workspaceId,
        p_tokens: estimatedTokens
      });
      if (data) {
        setTokensUsed(data.tokens_used);
        setTokensRemaining(data.tokens_remaining);
      }
    } catch { /* Graceful degradation */ }
  };

  // ========== SYSTEM PROMPT ==========
  const getSystemPrompt = (moduleContext?: string) => {
    let basePrompt = `Eres Inno, el asistente inteligente de Trak ERP, desarrollado por Innomind.
Tu misión es ayudar a los usuarios a gestionar TODO su negocio: proyectos, tareas, cotizaciones, clientes, inventario, recursos humanos y más.
Tienes acceso TOTAL y GLOBAL a todos los módulos del sistema. Puedes leer y crear datos en cualquier módulo sin importar dónde se encuentre el usuario.
NUNCA digas "no tengo acceso", "no puedo desde aquí" o "revisa otro módulo". SIEMPRE usa tus herramientas (tools) para responder con datos reales.
Cuando el usuario pregunte por información, SIEMPRE usa la herramienta correspondiente para consultar la base de datos antes de responder.
Sé conciso, profesional, útil y amigable. Responde SIEMPRE en español. No uses Markdown excesivo.
Cuando presentes listas de datos, usa formato limpio y legible con emojis relevantes.
Fecha y hora actual: ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}.`;

    if (moduleContext) {
      basePrompt += `\n\nEl usuario se encuentra en: ${moduleContext}. Puedes dar sugerencias contextuales, pero tus capacidades son globales.`;
    }
    return basePrompt;
  };

  // ========== TOOL HANDLER ==========
  const handleToolCalls = async (toolCalls: any[]) => {
    const results = [];
    for (const tool of toolCalls) {
      const fnName = tool.function.name;
      const args = tool.function.arguments ? JSON.parse(tool.function.arguments) : {};

      try {
        let content = '';

        // ===== PROYECTOS =====
        if (fnName === 'crear_proyecto') {
          const { data, error } = await supabase.from('trak_projects').insert({
            workspace_id: workspaceId,
            name: args.nombre,
            description: args.descripcion || '',
            budget: args.presupuesto || 0,
            status: 'planning',
            priority: args.prioridad || 'medium',
            color: '#9333ea',
            client_id: args.client_id || null
          }).select().single();
          if (error) throw error;

          // Sincronizar el estado del cliente a activo y ganado
          if (args.client_id) {
            await supabase
              .from('trak_clients')
              .update({ status: 'active', pipeline_stage: 'won' })
              .eq('id', args.client_id);
            if (refreshClients) await refreshClients();
          }

          if (refreshProjects) await refreshProjects();
          content = `Proyecto "${args.nombre}" creado exitosamente con ID ${data.id}.`;
        }

        else if (fnName === 'leer_proyectos') {
          const { data, error } = await supabase
            .from('trak_projects')
            .select('id, name, status, priority, budget, progress, estimated_end_date, color')
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false })
            .limit(20);
          if (error) throw error;
          content = JSON.stringify(data || []);
        }

        // ===== COTIZACIONES =====
        else if (fnName === 'crear_cotizacion') {
          const quoteNumber = `COT-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
          const subtotal = args.items.reduce((acc: number, item: any) => acc + (item.precio * item.cantidad), 0);
          const descuento = args.descuento || 0;
          const subtotalMenosDescuento = subtotal - descuento;
          const tax_amount = subtotalMenosDescuento * 0.16;
          const total = subtotalMenosDescuento + tax_amount;

          const { data: quoteData, error: quoteError } = await supabase.from('trak_quotes').insert({
            workspace_id: workspaceId,
            quote_number: quoteNumber,
            title: args.titulo,
            client_id: args.client_id || null,
            subtotal, discount: descuento, tax_rate: 16, tax_amount, total,
            status: 'draft',
            notes: args.notas || ''
          }).select('id').single();
          if (quoteError) throw quoteError;

          if (quoteData) {
            const itemsToInsert = args.items.map((i: any, index: number) => ({
              quote_id: quoteData.id,
              name: i.nombre, description: i.descripcion || '',
              quantity: i.cantidad, unit_price: i.precio,
              total: i.cantidad * i.precio, order_index: index
            }));
            const { error: itemsError } = await supabase.from('trak_quote_items').insert(itemsToInsert);
            if (itemsError) throw itemsError;
          }

          // Sincronizar reactivamente el estado del cliente a cotizado
          if (args.client_id) {
            const { data: client } = await supabase
              .from('trak_clients')
              .select('pipeline_stage')
              .eq('id', args.client_id)
              .single();
            if (client && client.pipeline_stage !== 'won') {
              await supabase
                .from('trak_clients')
                .update({ pipeline_stage: 'quoted' })
                .eq('id', args.client_id);
              if (refreshClients) await refreshClients();
            }
          }

          content = `Cotización "${args.titulo}" creada exitosamente con folio ${quoteNumber}. Subtotal: $${subtotal.toLocaleString()}, IVA: $${tax_amount.toLocaleString()}, Total: $${total.toLocaleString()}.`;
        }

        else if (fnName === 'leer_cotizaciones') {
          const { data, error } = await supabase
            .from('trak_quotes')
            .select('id, quote_number, title, status, total, subtotal, tax_amount, discount, created_at')
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false })
            .limit(15);
          if (error) throw error;
          content = JSON.stringify(data || []);
        }

        // ===== CLIENTES =====
        else if (fnName === 'crear_cliente') {
          const { data, error } = await supabase.from('trak_clients').insert({
            workspace_id: workspaceId,
            contact_name: args.nombre,
            email: args.email,
            phone: args.telefono || null,
            company_name: args.empresa || args.nombre,
            status: 'lead',
            pipeline_stage: 'new',
            notes: args.notas || ''
          }).select().single();
          if (error) throw error;
          if (refreshClients) await refreshClients();
          content = `Cliente "${args.nombre}" creado exitosamente con ID ${data.id}.`;
        }

        else if (fnName === 'leer_clientes') {
          const { data, error } = await supabase
            .from('trak_clients')
            .select('id, company_name, contact_name, email, phone, status, pipeline_stage, industry')
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false })
            .limit(20);
          if (error) throw error;
          content = JSON.stringify(data || []);
        }

        // ===== TAREAS =====
        else if (fnName === 'crear_tarea') {
          const insertData: any = {
            workspace_id: workspaceId,
            title: args.titulo,
            description: args.descripcion || '',
            status: 'todo',
            priority: args.prioridad || 'medium'
          };
          if (args.proyecto_id) insertData.project_id = args.proyecto_id;
          if (args.fecha_limite) insertData.due_date = args.fecha_limite;

          const { data, error } = await supabase.from('trak_tasks').insert(insertData).select().single();
          if (error) throw error;
          if (refreshTasks) await refreshTasks();
          content = `Tarea "${args.titulo}" creada exitosamente.`;
        }

        else if (fnName === 'obtener_tareas_pendientes') {
          const { data, error } = await supabase
            .from('trak_tasks')
            .select('id, title, status, priority, due_date, project_id')
            .eq('workspace_id', workspaceId)
            .neq('status', 'done')
            .order('priority', { ascending: false })
            .limit(15);
          if (error) throw error;
          content = JSON.stringify(data || []);
        }

        // ===== CALENDARIO =====
        else if (fnName === 'obtener_eventos_calendario') {
          const today = new Date().toISOString().split('T')[0];
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + 14);
          const futureDateStr = futureDate.toISOString().split('T')[0];

          const [tasksRes, projectsRes, quotesRes] = await Promise.all([
            supabase.from('trak_tasks').select('title, due_date, priority, status')
              .eq('workspace_id', workspaceId).neq('status', 'done')
              .not('due_date', 'is', null),
            supabase.from('trak_projects').select('name, estimated_end_date, status')
              .eq('workspace_id', workspaceId).neq('status', 'completed')
              .not('estimated_end_date', 'is', null),
            supabase.from('trak_quotes').select('title, quote_number, valid_until, status')
              .eq('workspace_id', workspaceId)
              .not('valid_until', 'is', null)
              .in('status', ['draft', 'sent'])
          ]);

          const events = [
            ...(tasksRes.data || []).map(t => ({ tipo: 'Tarea', titulo: t.title, fecha: t.due_date, prioridad: t.priority, estado: t.status, vencida: t.due_date < today })),
            ...(projectsRes.data || []).map(p => ({ tipo: 'Proyecto', titulo: p.name, fecha: p.estimated_end_date, estado: p.status, vencida: p.estimated_end_date < today })),
            ...(quotesRes.data || []).map(q => ({ tipo: 'Cotización', titulo: `${q.quote_number} - ${q.title}`, fecha: q.valid_until, estado: q.status, vencida: q.valid_until < today })),
          ].sort((a, b) => a.fecha.localeCompare(b.fecha));

          content = JSON.stringify(events.length > 0 ? events : { mensaje: "No hay eventos próximos en el calendario." });
        }

        // ===== INVENTARIO =====
        else if (fnName === 'leer_inventario') {
          const { data, error } = await supabase
            .from('trak_inventory')
            .select('id, name, sku, category, quantity, unit, unit_cost, min_stock, description')
            .eq('workspace_id', workspaceId)
            .order('name', { ascending: true })
            .limit(30);
          if (error) throw error;
          content = JSON.stringify(data || []);
        }

        else if (fnName === 'crear_producto') {
          const { data, error } = await supabase.from('trak_inventory').insert({
            workspace_id: workspaceId,
            name: args.nombre,
            sku: args.sku || `SKU-${Math.floor(Math.random() * 100000)}`,
            category: args.categoria || 'General',
            quantity: args.cantidad || 0,
            unit: args.unidad || 'pieza',
            unit_cost: args.precio_unitario || 0,
            min_stock: args.stock_minimo || 5,
            description: args.descripcion || ''
          }).select().single();
          if (error) throw error;
          content = `Producto "${args.nombre}" registrado exitosamente en inventario con ${args.cantidad || 0} unidades.`;
        }

        // ===== EMPLEADOS (HR) =====
        else if (fnName === 'leer_empleados') {
          const { data, error } = await supabase
            .from('trak_employees')
            .select('id, first_name, last_name, email, position, department, status, hire_date')
            .eq('workspace_id', workspaceId)
            .order('first_name', { ascending: true })
            .limit(30);
          if (error) throw error;
          content = JSON.stringify(data || []);
        }

        else if (fnName === 'crear_empleado') {
          const { data, error } = await supabase.from('trak_employees').insert({
            workspace_id: workspaceId,
            first_name: args.nombre,
            last_name: args.apellido || '',
            email: args.email,
            phone: args.telefono || null,
            position: args.puesto || '',
            department: args.departamento || 'General',
            status: 'active',
            hire_date: args.fecha_ingreso || new Date().toISOString().split('T')[0]
          }).select().single();
          if (error) throw error;
          content = `Empleado "${args.nombre} ${args.apellido || ''}" registrado exitosamente en Recursos Humanos.`;
        }

        else {
          content = `Herramienta "${fnName}" no reconocida.`;
        }

        results.push({ tool_call_id: tool.id, role: 'tool', name: fnName, content });
      } catch (e: any) {
        results.push({ tool_call_id: tool.id, role: 'tool', name: fnName, content: `Error: ${e.message}` });
      }
    }
    return results;
  };

  // ========== SEND MESSAGE ==========
  const sendMessage = async (text: string, moduleContext?: string) => {
    if (!OPENAI_API_KEY) {
      alert("No se configuró VITE_OPENAI_API_KEY en .env.local");
      return;
    }

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
        { role: 'system', content: getSystemPrompt(moduleContext) },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: text }
      ];

      const tools = [
        // CREAR
        {
          type: "function", function: {
            name: "crear_proyecto",
            description: "Crea un nuevo proyecto en el sistema Trak ERP.",
            parameters: { type: "object", properties: {
              nombre: { type: "string", description: "Nombre del proyecto" },
              descripcion: { type: "string", description: "Descripción del proyecto" },
              presupuesto: { type: "number", description: "Presupuesto monetario" },
              prioridad: { type: "string", enum: ["low", "medium", "high", "critical"], description: "Prioridad" },
              client_id: { type: "string", description: "ID del cliente (UUID) para vincular el proyecto (opcional)" }
            }, required: ["nombre"] }
          }
        },
        {
          type: "function", function: {
            name: "crear_cotizacion",
            description: "Crea una nueva cotización comercial.",
            parameters: { type: "object", properties: {
              titulo: { type: "string", description: "Título de la cotización" },
              notas: { type: "string", description: "Notas comerciales" },
              descuento: { type: "number", description: "Monto de descuento (0 si no hay)" },
              client_id: { type: "string", description: "ID del cliente (UUID)" },
              items: { type: "array", description: "Lista de productos/servicios", items: {
                type: "object", properties: {
                  nombre: { type: "string" }, descripcion: { type: "string" },
                  cantidad: { type: "number" }, precio: { type: "number", description: "Precio unitario sin IVA" }
                }, required: ["nombre", "cantidad", "precio"]
              }}
            }, required: ["titulo", "items"] }
          }
        },
        {
          type: "function", function: {
            name: "crear_cliente",
            description: "Crea un nuevo cliente/prospecto.",
            parameters: { type: "object", properties: {
              nombre: { type: "string", description: "Nombre completo del contacto" },
              email: { type: "string", description: "Correo electrónico" },
              telefono: { type: "string", description: "Teléfono" },
              empresa: { type: "string", description: "Nombre de la empresa" },
              notas: { type: "string", description: "Notas" }
            }, required: ["nombre", "email"] }
          }
        },
        {
          type: "function", function: {
            name: "crear_tarea",
            description: "Crea una nueva tarea en un proyecto o standalone.",
            parameters: { type: "object", properties: {
              titulo: { type: "string", description: "Título de la tarea" },
              descripcion: { type: "string", description: "Descripción" },
              prioridad: { type: "string", enum: ["low", "medium", "high", "critical"], description: "Prioridad" },
              proyecto_id: { type: "string", description: "ID del proyecto (opcional)" },
              fecha_limite: { type: "string", description: "Fecha límite YYYY-MM-DD (opcional)" }
            }, required: ["titulo"] }
          }
        },
        {
          type: "function", function: {
            name: "crear_producto",
            description: "Registra un nuevo producto en el inventario.",
            parameters: { type: "object", properties: {
              nombre: { type: "string", description: "Nombre del producto" },
              sku: { type: "string", description: "Código SKU (opcional, se genera automáticamente)" },
              categoria: { type: "string", description: "Categoría del producto" },
              cantidad: { type: "number", description: "Cantidad inicial en stock" },
              unidad: { type: "string", description: "Unidad de medida (pieza, kg, litro, etc.)" },
              precio_unitario: { type: "number", description: "Costo unitario" },
              stock_minimo: { type: "number", description: "Stock mínimo de alerta" },
              descripcion: { type: "string", description: "Descripción del producto" }
            }, required: ["nombre"] }
          }
        },
        {
          type: "function", function: {
            name: "crear_empleado",
            description: "Registra un nuevo empleado en Recursos Humanos.",
            parameters: { type: "object", properties: {
              nombre: { type: "string", description: "Nombre(s)" },
              apellido: { type: "string", description: "Apellido(s)" },
              email: { type: "string", description: "Correo electrónico" },
              telefono: { type: "string", description: "Teléfono" },
              puesto: { type: "string", description: "Puesto/cargo" },
              departamento: { type: "string", description: "Departamento" },
              fecha_ingreso: { type: "string", description: "Fecha de ingreso YYYY-MM-DD" }
            }, required: ["nombre", "email"] }
          }
        },
        // LEER
        {
          type: "function", function: {
            name: "leer_proyectos",
            description: "Obtiene la lista de proyectos del workspace con su nombre, estado, prioridad, presupuesto, progreso y fecha estimada de entrega. Útil para preguntas como '¿cuáles son mis proyectos?' o '¿cómo va el proyecto X?'.",
            parameters: { type: "object", properties: {} }
          }
        },
        {
          type: "function", function: {
            name: "leer_cotizaciones",
            description: "Obtiene la lista de cotizaciones con folio, título, estado, totales y fecha. Útil para preguntas como '¿cuántas cotizaciones tengo?' o '¿cuál es el total de la cotización X?'.",
            parameters: { type: "object", properties: {} }
          }
        },
        {
          type: "function", function: {
            name: "leer_clientes",
            description: "Obtiene la lista de clientes con empresa, contacto, email, teléfono, estado y etapa del pipeline. Útil para '¿quiénes son mis clientes?' o '¿cuál es el correo de X?'.",
            parameters: { type: "object", properties: {} }
          }
        },
        {
          type: "function", function: {
            name: "obtener_tareas_pendientes",
            description: "Obtiene las tareas pendientes (no completadas) con título, estado, prioridad y fecha de vencimiento.",
            parameters: { type: "object", properties: {} }
          }
        },
        {
          type: "function", function: {
            name: "obtener_eventos_calendario",
            description: "Obtiene eventos del calendario: vencimientos de tareas, entregas de proyectos y expiración de cotizaciones. Incluye eventos vencidos.",
            parameters: { type: "object", properties: {} }
          }
        },
        {
          type: "function", function: {
            name: "leer_inventario",
            description: "Obtiene productos del inventario con nombre, SKU, categoría, cantidad, unidad, costo y stock mínimo. Útil para '¿cuánto stock tenemos?' o '¿qué productos hay?'.",
            parameters: { type: "object", properties: {} }
          }
        },
        {
          type: "function", function: {
            name: "leer_empleados",
            description: "Obtiene el directorio de empleados de Recursos Humanos con nombre, email, puesto, departamento, estado y fecha de ingreso.",
            parameters: { type: "object", properties: {} }
          }
        },
      ];

      let response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: apiMessages, tools, tool_choice: "auto", temperature: 0.7 })
      });

      let data = await response.json();
      let responseMessage = data.choices[0].message;

      if (data.usage) updateTokens(data.usage.total_tokens);

      // Handle tool calls
      if (responseMessage.tool_calls) {
        const toolResults = await handleToolCalls(responseMessage.tool_calls);
        apiMessages.push(responseMessage);
        apiMessages.push(...toolResults as any);

        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
          body: JSON.stringify({ model: 'gpt-4o-mini', messages: apiMessages, temperature: 0.7 })
        });
        data = await response.json();
        responseMessage = data.choices[0].message;
        if (data.usage) updateTokens(data.usage.total_tokens);
      }

      const newAssistantMsg: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseMessage.content || "He realizado la acción solicitada.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, newAssistantMsg]);

    } catch (error) {
      console.error("AI Error:", error);
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
